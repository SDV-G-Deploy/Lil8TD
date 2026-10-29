// Lil8TD deterministic simulation.
//
// A *match* holds one board per player slot. Boards are mirrored: every board gets the same
// authored waves; players interact only through `pressure.send`, which schedules an extra
// enemy pack on the opponent board after a visible windup (PRESSURE_MECHANIC_V0).
//
// Determinism rules (SIMULATION_CONTRACT): integer state only, no Math.random, no wall clock,
// stable ordering for commands (slot, priority, seq), towers (num) and enemies (num).
import { compareSpawns, expandWaveSpawns } from './content.js';
import { pointAtProgress, dist2, UNITS_PER_TILE } from './map.js';

export const COMMAND_PRIORITY = { 'tower.sell': 30, 'tower.build': 40, 'tower.upgrade': 50, 'pressure.send': 60 };

export function createBoard(content, slot) {
  return {
    slot,
    lives: content.constants.initialLives,
    currency: content.economy.startingCurrency,
    towers: [], enemies: [],
    spawnQueue: expandWaveSpawns(content),
    incoming: [],
    pressureReadyTick: {},
    collapsedTick: null,
    nextIds: { tower: 1, enemy: 1, pressure: 1 },
    stats: { kills: 0, leaks: 0, livesLost: 0, earned: 0, spent: 0, towersBuilt: 0, upgrades: 0, sends: 0, sendSpend: 0, pressureReceived: 0 }
  };
}

/**
 * @param content indexed content
 * @param opts { seed?: string, players?: 1|2 }
 */
export function createMatch(content, opts = {}) {
  const players = opts.players ?? 2;
  const boards = [];
  for (let i = 0; i < players; i++) boards.push(createBoard(content, i));
  return {
    tick: 0,
    contentVersion: content.ruleset.metadata.version,
    seed: opts.seed ?? content.constants.matchSeedDefault,
    mode: players === 1 ? 'solo' : 'versus',
    boards,
    wavesStarted: 0,
    result: null,
    events: [],
    rejectedCommands: []
  };
}

export function cloneMatch(m) {
  return {
    ...m,
    events: [], rejectedCommands: [],
    boards: m.boards.map(b => ({
      ...b,
      towers: b.towers.map(t => ({ ...t })),
      enemies: b.enemies.map(e => ({ ...e, slow: e.slow ? { ...e.slow } : null })),
      spawnQueue: b.spawnQueue.map(x => ({ ...x })),
      incoming: b.incoming.map(x => ({ ...x })),
      pressureReadyTick: { ...b.pressureReadyTick },
      nextIds: { ...b.nextIds },
      stats: { ...b.stats }
    }))
  };
}

export function step(match, commands, content) {
  const m = cloneMatch(match);
  if (m.result) { m.tick++; return m; }
  applyCommands(m, commands ?? [], content);
  startWaves(m, content);
  for (const b of m.boards) {
    if (b.collapsedTick != null) continue;
    deliverPressure(m, b, content);
    spawnEnemies(m, b, content);
    moveEnemies(m, b, content);
    towerAttacks(m, b, content);
    resolveDeathsAndLeaks(m, b, content);
  }
  evaluateResult(m, content);
  m.tick++;
  return m;
}

export function runTicks(initial, content, commandByTick = new Map(), maxTicks = 12000) {
  let m = initial;
  for (let i = 0; i < maxTicks && !m.result; i++) m = step(m, commandByTick.get(m.tick) ?? [], content);
  return m;
}

// ---------------------------------------------------------------- commands

function applyCommands(m, commands, content) {
  [...commands].sort(compareCommands).forEach(cmd => {
    const b = m.boards[cmd.playerSlot ?? 0];
    if (!b) return reject(m, cmd, 'unknown_player');
    if (b.collapsedTick != null) return reject(m, cmd, 'board_collapsed');
    const ok = cmd.type === 'tower.build' ? buildTower(m, b, cmd, content)
      : cmd.type === 'tower.upgrade' ? upgradeTower(m, b, cmd, content)
      : cmd.type === 'tower.sell' ? sellTower(m, b, cmd, content)
      : cmd.type === 'pressure.send' ? sendPressure(m, b, cmd, content)
      : reject(m, cmd, 'unknown_command');
    return ok;
  });
}

export function compareCommands(a, b) {
  return (a.playerSlot ?? 0) - (b.playerSlot ?? 0)
    || (COMMAND_PRIORITY[a.type] ?? 999) - (COMMAND_PRIORITY[b.type] ?? 999)
    || (a.clientCommandSeq ?? 0) - (b.clientCommandSeq ?? 0)
    || JSON.stringify(a).localeCompare(JSON.stringify(b));
}

function reject(m, command, reason) {
  m.rejectedCommands.push({ tick: m.tick, command, reason });
  m.events.push({ tick: m.tick, slot: command.playerSlot ?? 0, type: 'command.rejected', reason, commandType: command.type });
  return false;
}

export function tileKind(content, x, y) {
  if (content.lane.tileSet.has(`${x},${y}`)) return 'path';
  if (content.blockedSet.has(`${x},${y}`)) return 'blocked';
  return 'grass';
}

export function canPlaceTower(board, x, y, content) {
  const { gridWidth, gridHeight } = content.map.buildRules;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return { ok: false, reason: 'illegal_position' };
  const kind = tileKind(content, x, y);
  if (kind === 'path') return { ok: false, reason: 'path_blocked' };
  if (kind === 'blocked') return { ok: false, reason: 'terrain_blocked' };
  if (board.towers.some(t => t.tileX === x && t.tileY === y)) return { ok: false, reason: 'occupied' };
  return { ok: true };
}

function buildTower(m, b, cmd, content) {
  const def = content.towers[cmd.towerType];
  if (!def) return reject(m, cmd, 'unknown_tower');
  const place = canPlaceTower(b, cmd.x, cmd.y, content);
  if (!place.ok) return reject(m, cmd, place.reason);
  if (b.currency < def.buildCost) return reject(m, cmd, 'insufficient_resources');
  b.currency -= def.buildCost; b.stats.spent += def.buildCost; b.stats.towersBuilt++;
  const num = b.nextIds.tower++;
  const id = `tw_${b.slot}_${num}`;
  b.towers.push({ id, num, typeId: def.id, tileX: cmd.x, tileY: cmd.y, level: 1, cooldown: def.canActOnBuildTick ? 0 : def.levels[0].cooldownTicks, spent: def.buildCost, kills: 0, damageDealt: 0 });
  m.events.push({ tick: m.tick, slot: b.slot, type: 'tower.built', towerId: id, towerType: def.id, x: cmd.x, y: cmd.y });
  return true;
}

function upgradeTower(m, b, cmd, content) {
  const t = b.towers.find(x => x.id === cmd.towerId);
  if (!t) return reject(m, cmd, 'unknown_entity');
  const def = content.towers[t.typeId]; const cur = def.levels[t.level - 1]; const next = def.levels[t.level];
  if (!next || cur.upgradeCost == null) return reject(m, cmd, 'illegal_upgrade');
  if (b.currency < cur.upgradeCost) return reject(m, cmd, 'insufficient_resources');
  b.currency -= cur.upgradeCost; b.stats.spent += cur.upgradeCost; b.stats.upgrades++;
  t.level++; t.spent += cur.upgradeCost; t.cooldown = Math.min(t.cooldown, next.cooldownTicks);
  m.events.push({ tick: m.tick, slot: b.slot, type: 'tower.upgraded', towerId: t.id, towerType: t.typeId, level: t.level, x: t.tileX, y: t.tileY });
  return true;
}

export function sellValue(t, content) { return Math.floor(t.spent * content.economy.sellRefundRate); }

function sellTower(m, b, cmd, content) {
  const i = b.towers.findIndex(x => x.id === cmd.towerId);
  if (i < 0) return reject(m, cmd, 'unknown_entity');
  const [t] = b.towers.splice(i, 1);
  const refund = sellValue(t, content);
  b.currency += refund;
  m.events.push({ tick: m.tick, slot: b.slot, type: 'tower.sold', towerId: t.id, towerType: t.typeId, refund, x: t.tileX, y: t.tileY });
  return true;
}

/** Why a pressure pack can't be sent right now (null when it can). Shared by sim, UI and bots. */
export function pressureBlockReason(m, slot, packId, content) {
  const pack = content.pressurePacks[packId];
  if (!pack) return 'unknown_pack';
  if (m.mode !== 'versus') return 'no_opponent';
  const b = m.boards[slot]; const target = m.boards[1 - slot];
  if (!b || !target) return 'no_opponent';
  if (target.collapsedTick != null) return 'opponent_collapsed';
  if (m.wavesStarted <= (pack.unlockAtWaveIndex ?? 0)) return 'locked';
  if ((b.pressureReadyTick[packId] ?? 0) > m.tick) return 'cooldown';
  const queued = target.incoming.filter(x => x.fromSlot === slot && x.packId === packId).length;
  if (queued >= (pack.maxQueuedPerSender ?? 1)) return 'queue_full';
  if (b.currency < pack.costCredits) return 'insufficient_resources';
  return null;
}

function sendPressure(m, b, cmd, content) {
  const why = pressureBlockReason(m, b.slot, cmd.packId, content);
  if (why) return reject(m, cmd, why);
  const pack = content.pressurePacks[cmd.packId];
  const target = m.boards[1 - b.slot];
  b.currency -= pack.costCredits; b.stats.sendSpend += pack.costCredits; b.stats.sends++;
  b.pressureReadyTick[pack.id] = m.tick + pack.cooldownTicks;
  const id = `pr_${b.slot}_${b.nextIds.pressure++}`;
  target.incoming.push({ id, packId: pack.id, fromSlot: b.slot, sentTick: m.tick, deliverTick: m.tick + Math.max(1, pack.windupTicks) });
  m.events.push({ tick: m.tick, slot: b.slot, type: 'pressure.sent', pressureId: id, packId: pack.id, targetSlot: target.slot, deliverTick: m.tick + pack.windupTicks });
  return true;
}

// ---------------------------------------------------------------- phases

function startWaves(m, content) {
  for (const wave of content.waves) {
    if (wave.startTick !== m.tick) continue;
    m.wavesStarted = Math.max(m.wavesStarted, wave.waveIndex + 1);
    for (const b of m.boards) {
      if (b.collapsedTick != null) continue;
      const payout = wave.payoutOnStartCredits ?? 0;
      b.currency += payout; b.stats.earned += payout;
    }
    m.events.push({ tick: m.tick, slot: -1, type: 'wave.start', waveIndex: wave.waveIndex, template: wave.template, payout: wave.payoutOnStartCredits ?? 0 });
  }
}

function deliverPressure(m, b, content) {
  const due = b.incoming.filter(x => x.deliverTick === m.tick);
  if (!due.length) return;
  b.incoming = b.incoming.filter(x => x.deliverTick !== m.tick);
  for (const p of due) {
    const pack = content.pressurePacks[p.packId];
    // pressure enemies scale with the latest started wave so late sends stay relevant
    const hpScalePercent = content.waves[Math.max(0, m.wavesStarted - 1)]?.hpScalePercent ?? 100;
    pack.delivery.groups.forEach((g, groupIndex) => {
      for (let i = 0; i < g.count; i++) {
        b.spawnQueue.push({ tick: m.tick + g.firstOffsetTicks + i * g.intervalTicks, waveIndex: 1000 + p.fromSlot, groupIndex, itemIndex: i, laneId: pack.delivery.laneId, enemyId: g.enemyId, source: 'pressure', rewardCreditsOverride: g.rewardCreditsOverride, pressureId: p.id, hpScalePercent });
      }
    });
    b.spawnQueue.sort(compareSpawns);
    b.stats.pressureReceived++;
    m.events.push({ tick: m.tick, slot: b.slot, type: 'pressure.arrived', pressureId: p.id, packId: p.packId, fromSlot: p.fromSlot });
  }
}

function spawnEnemies(m, b, content) {
  if (!b.spawnQueue.length || b.spawnQueue[0].tick > m.tick) return;
  const due = [];
  while (b.spawnQueue.length && b.spawnQueue[0].tick <= m.tick) due.push(b.spawnQueue.shift());
  for (const spawn of due) {
    const def = content.enemies[spawn.enemyId];
    const num = b.nextIds.enemy++;
    const id = `en_${b.slot}_${num}`;
    const scale = spawn.hpScalePercent ?? 100;
    const maxHp = Math.floor(def.maxHp * scale / 100); const maxShield = Math.floor((def.maxShield ?? 0) * scale / 100);
    b.enemies.push({ id, num, typeId: def.id, hp: maxHp, maxHp, shield: maxShield, maxShield, progress: 0, laneId: spawn.laneId, leaked: false, killed: false, rewardCredits: spawn.rewardCreditsOverride ?? def.rewardCredits, slow: null, source: spawn.source });
    m.events.push({ tick: m.tick, slot: b.slot, type: 'enemy.spawned', enemyId: id, enemyType: def.id, source: spawn.source });
  }
}

export function enemySpeed(e, def, tick) {
  const slowPct = e.slow && e.slow.untilTick >= tick ? e.slow.percent : 0;
  return Math.max(1, Math.floor(def.speedUnitsPerTick * (100 - slowPct) / 100));
}

function moveEnemies(m, b, content) {
  const len = content.lane.length;
  for (const e of b.enemies) {
    if (e.killed || e.leaked) continue;
    const def = content.enemies[e.typeId];
    e.progress += enemySpeed(e, def, m.tick);
    if (e.slow && e.slow.untilTick < m.tick) e.slow = null;
    if (e.progress >= len) e.leaked = true;
  }
}

export function enemyPoint(e, content) { return pointAtProgress(content.lane, e.progress); }
export function towerPoint(t) { return { x: t.tileX * UNITS_PER_TILE + 500, y: t.tileY * UNITS_PER_TILE + 500 }; }

/** Best Beacon aura (percent) affecting tower `t`. Auras never stack; strongest wins. */
export function auraBonusPercent(board, t, content) {
  let best = 0;
  const tp = towerPoint(t);
  for (const o of board.towers) {
    if (o === t || o.id === t.id) continue;
    const lvl = content.towers[o.typeId].levels[o.level - 1];
    if (lvl.attackType !== 'aura') continue;
    const r = lvl.rangeUnits;
    if (dist2(tp, towerPoint(o)) <= r * r) best = Math.max(best, lvl.auraDamagePercent ?? 0);
  }
  return best;
}

function towerAttacks(m, b, content) {
  const hits = [];
  for (const t of b.towers) {
    const def = content.towers[t.typeId];
    const lvl = def.levels[t.level - 1];
    if (lvl.attackType === 'aura') continue;
    if (t.cooldown > 0) { t.cooldown--; continue; }
    const target = acquireTarget(t, b, content);
    if (!target) continue;
    const bonus = auraBonusPercent(b, t, content);
    const damage = Math.floor(lvl.damage * (100 + bonus) / 100);
    hits.push(...makeHits(t, def, target, lvl, damage, b, content));
    t.cooldown = lvl.cooldownTicks;
    m.events.push({ tick: m.tick, slot: b.slot, type: 'tower.fired', towerId: t.id, towerType: t.typeId, targetId: target.id, targetProgress: target.progress, buffed: bonus > 0 });
  }
  hits.sort((a, c) => a.towerNum - c.towerNum || a.targetNum - c.targetNum).forEach(h => applyHit(m, b, h));
}

function inRange(t, e, lvl, content) {
  return dist2(towerPoint(t), enemyPoint(e, content)) <= lvl.rangeUnits * lvl.rangeUnits;
}

function acquireTarget(t, b, content) {
  const def = content.towers[t.typeId]; const lvl = def.levels[t.level - 1];
  let best = null;
  for (const e of b.enemies) {
    if (e.killed || e.leaked || !inRange(t, e, lvl, content)) continue;
    if (!best || betterTarget(def.targeting, e, best)) best = e;
  }
  return best;
}

function betterTarget(mode, a, b) {
  if (mode === 'strongest') {
    const ea = a.hp + a.shield, eb = b.hp + b.shield;
    if (ea !== eb) return ea > eb;
  }
  if (a.progress !== b.progress) return a.progress > b.progress;
  if (a.hp !== b.hp) return a.hp < b.hp;
  return a.num < b.num;
}

function makeHits(t, def, target, lvl, damage, b, content) {
  const base = { towerNum: t.num, towerId: t.id, shieldMult: def.shieldDamageMultiplier ?? 1 };
  if (lvl.attackType !== 'instant_splash') {
    return [{ ...base, targetNum: target.num, targetId: target.id, damage, slowPercent: lvl.slowPercent, slowDurationTicks: lvl.slowDurationTicks }];
  }
  const center = enemyPoint(target, content); const r2 = lvl.splashRadiusUnits * lvl.splashRadiusUnits;
  return b.enemies
    .filter(e => !e.killed && !e.leaked && (e.id === target.id || dist2(center, enemyPoint(e, content)) <= r2))
    .map(e => ({ ...base, targetNum: e.num, targetId: e.id, damage: e.id === target.id ? damage : Math.floor(damage * lvl.splashFalloff) }));
}

function applyHit(m, b, h) {
  const e = b.enemies.find(x => x.id === h.targetId);
  if (!e || e.killed || e.leaked) return;
  let dmg = h.damage;
  if (e.shield > 0) {
    const shieldDmg = dmg * h.shieldMult;
    if (shieldDmg >= e.shield) { dmg = Math.floor((shieldDmg - e.shield) / h.shieldMult); e.shield = 0; m.events.push({ tick: m.tick, slot: b.slot, type: 'enemy.shieldBroken', enemyId: e.id, progress: e.progress }); }
    else { e.shield -= shieldDmg; dmg = 0; }
  }
  e.hp -= dmg;
  const tower = b.towers.find(t => t.id === h.towerId);
  if (tower) tower.damageDealt += h.damage;
  if (h.slowPercent && (!e.slow || h.slowPercent >= e.slow.percent)) e.slow = { percent: h.slowPercent, untilTick: m.tick + h.slowDurationTicks };
  m.events.push({ tick: m.tick, slot: b.slot, type: 'enemy.hit', enemyId: e.id, towerId: h.towerId, damage: h.damage });
  if (e.hp <= 0) { e.killed = true; if (tower) tower.kills++; }
}

function resolveDeathsAndLeaks(m, b, content) {
  for (const e of b.enemies) {
    if (e.killed) {
      b.currency += e.rewardCredits; b.stats.earned += e.rewardCredits; b.stats.kills++;
      m.events.push({ tick: m.tick, slot: b.slot, type: 'enemy.killed', enemyId: e.id, enemyType: e.typeId, reward: e.rewardCredits, progress: e.progress });
    } else if (e.leaked) {
      const dmg = content.enemies[e.typeId].leakDamage;
      b.lives = Math.max(0, b.lives - dmg); b.stats.leaks++; b.stats.livesLost += dmg;
      m.events.push({ tick: m.tick, slot: b.slot, type: 'enemy.leaked', enemyId: e.id, enemyType: e.typeId, damage: dmg, lives: b.lives });
    }
  }
  b.enemies = b.enemies.filter(e => !e.killed && !e.leaked);
  if (b.lives <= 0 && b.collapsedTick == null) {
    b.collapsedTick = m.tick; b.enemies = []; b.incoming = [];
    m.events.push({ tick: m.tick, slot: b.slot, type: 'board.collapsed' });
  }
}

export function boardCleared(b) { return b.spawnQueue.length === 0 && b.enemies.length === 0 && b.incoming.length === 0; }

function evaluateResult(m, content) {
  const alive = m.boards.filter(b => b.collapsedTick == null);
  const allWavesOut = m.wavesStarted >= content.waves.length;
  if (m.mode === 'solo') {
    const b = m.boards[0];
    if (b.collapsedTick != null) m.result = { outcome: 'loss', winnerSlot: null, reason: 'collapse', tick: m.tick };
    else if (allWavesOut && boardCleared(b)) m.result = { outcome: 'win', winnerSlot: 0, reason: 'survived', tick: m.tick };
  } else if (alive.length === 0) {
    m.result = { outcome: 'draw', winnerSlot: null, reason: 'double_collapse', tick: m.tick };
  } else if (alive.length === 1) {
    m.result = { outcome: 'win', winnerSlot: alive[0].slot, reason: 'collapse', tick: m.tick };
  } else if (allWavesOut && alive.every(boardCleared)) {
    const [a, b] = m.boards;
    if (a.lives === b.lives) m.result = { outcome: 'draw', winnerSlot: null, reason: 'equal_lives', tick: m.tick };
    else m.result = { outcome: 'win', winnerSlot: a.lives > b.lives ? 0 : 1, reason: 'more_lives', tick: m.tick };
  }
  if (m.result) m.events.push({ tick: m.tick, slot: -1, type: 'match.end', ...m.result });
}

// ---------------------------------------------------------------- helpers for UI/bots

export function currentWaveIndex(m) { return m.wavesStarted - 1; }
export function nextWave(m, content) { return content.waves[m.wavesStarted] ?? null; }
