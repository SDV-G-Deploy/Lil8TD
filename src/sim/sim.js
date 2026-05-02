import { compareSpawns, expandWaveSpawns } from './content.js';
import { stateHash } from './hash.js';

export const COMMAND_PRIORITY = { 'tower.sell': 30, 'tower.build': 40, 'tower.upgrade': 50 };

export function createInitialState(content, opts = {}) {
  return {
    tick: 0,
    contentVersion: content.ruleset.metadata.version,
    seed: opts.seed ?? content.constants.matchSeedDefault,
    lives: content.ruleset.constants.initialLives,
    currency: content.economy.startingCurrency,
    towers: [], enemies: [], events: [], rejectedCommands: [], checkpoints: [],
    spawnQueue: expandWaveSpawns(content),
    waveStartPaid: new Set(),
    result: null,
    selectedLoadoutId: 'balanced_core',
    nextIds: { tower: 1, enemy: 1 }
  };
}

export function cloneState(s) {
  return { ...s, towers: s.towers.map(t => ({...t})), enemies: s.enemies.map(e => ({...e, slow: e.slow ? {...e.slow} : null})), events: [], rejectedCommands: [], checkpoints: [...s.checkpoints], spawnQueue: s.spawnQueue.map(x=>({...x})), waveStartPaid: new Set([...s.waveStartPaid]), nextIds: {...s.nextIds} };
}

export function step(state, commands, content) {
  const s = cloneState(state);
  s.events.push({ tick: s.tick, type: 'tick.begin' });
  if (s.result) { s.tick++; return s; }
  applyCommands(s, commands ?? [], content);
  payWaveStarts(s, content);
  spawnEnemies(s, content);
  moveEnemies(s, content);
  towerAttacks(s, content);
  resolveDeathsAndLeaks(s, content);
  evaluateResult(s, content);
  if (s.tick % content.constants.checkpointEveryTicks === 0 || s.result) s.checkpoints.push({ tick: s.tick, hash: stateHash(s) });
  s.tick++;
  return s;
}

export function runTicks(initialState, content, commandByTick = new Map(), maxTicks = 6000) {
  let s = initialState;
  for (let i = 0; i < maxTicks && !s.result; i++) s = step(s, commandByTick.get(s.tick) ?? [], content);
  return s;
}

function applyCommands(s, commands, content) {
  [...commands].sort(compareCommands).forEach(cmd => {
    const before = JSON.stringify({ currency: s.currency, towers: s.towers.length });
    const ok = cmd.type === 'tower.build' ? buildTower(s, cmd, content)
      : cmd.type === 'tower.upgrade' ? upgradeTower(s, cmd, content)
      : cmd.type === 'tower.sell' ? sellTower(s, cmd, content)
      : reject(s, cmd, 'unknown_command');
    if (!ok && before !== JSON.stringify({ currency: s.currency, towers: s.towers.length })) throw new Error('rejected command mutated state');
  });
}

function compareCommands(a, b) {
  return (a.playerSlot ?? 0) - (b.playerSlot ?? 0) || (COMMAND_PRIORITY[a.type] ?? 999) - (COMMAND_PRIORITY[b.type] ?? 999) || (a.clientCommandSeq ?? 0) - (b.clientCommandSeq ?? 0) || JSON.stringify(a).localeCompare(JSON.stringify(b));
}

export function tileKind(x, y) { return y === 2 ? 'path' : 'grass'; }
export function canPlaceTower(s, x, y, content) {
  const { gridWidth, gridHeight } = content.map.buildRules;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return { ok:false, reason:'illegal_position' };
  if (tileKind(x, y) === 'path') return { ok:false, reason:'path_blocked' };
  if (s.towers.some(t => t.tileX === x && t.tileY === y)) return { ok:false, reason:'illegal_position' };
  return { ok:true };
}

function reject(s, command, reason) { s.rejectedCommands.push({ tick: s.tick, command, reason }); s.events.push({ tick:s.tick, type:'command.rejected', reason }); return false; }

function buildTower(s, cmd, content) {
  const def = content.towers[cmd.towerType];
  if (!def) return reject(s, cmd, 'unknown_command');
  const place = canPlaceTower(s, cmd.x, cmd.y, content); if (!place.ok) return reject(s, cmd, place.reason);
  if (s.currency < def.buildCost) return reject(s, cmd, 'insufficient_resources');
  s.currency -= def.buildCost;
  const num = s.nextIds.tower++;
  s.towers.push({ id:`tw_0_${num}`, num, typeId:def.id, tileX:cmd.x, tileY:cmd.y, level:1, cooldown:def.canActOnBuildTick ? 0 : def.levels[0].cooldownTicks, spent:def.buildCost });
  s.events.push({ tick:s.tick, type:'tower.built', towerId:`tw_0_${num}`, towerType:def.id, x:cmd.x, y:cmd.y });
  return true;
}

function upgradeTower(s, cmd, content) {
  const t = s.towers.find(x => x.id === cmd.towerId); if (!t) return reject(s, cmd, 'unknown_entity');
  const def = content.towers[t.typeId]; const cur = def.levels[t.level - 1]; const next = def.levels[t.level];
  if (!next || cur.upgradeCost == null) return reject(s, cmd, 'illegal_upgrade');
  if (s.currency < cur.upgradeCost) return reject(s, cmd, 'insufficient_resources');
  s.currency -= cur.upgradeCost; t.level++; t.spent += cur.upgradeCost; t.cooldown = Math.min(t.cooldown, next.cooldownTicks);
  s.events.push({ tick:s.tick, type:'tower.upgraded', towerId:t.id, level:t.level }); return true;
}

function sellTower(s, cmd, content) {
  const i = s.towers.findIndex(x => x.id === cmd.towerId); if (i < 0) return reject(s, cmd, 'unknown_entity');
  const [t] = s.towers.splice(i, 1); const refund = Math.floor(t.spent * content.economy.sellRefundRate);
  s.currency += refund; s.events.push({ tick:s.tick, type:'tower.sold', towerId:t.id, refund }); return true;
}

function payWaveStarts(s, content) {
  for (const wave of content.waves) if (wave.startTick === s.tick && !s.waveStartPaid.has(wave.waveIndex)) { s.currency += wave.payoutOnStartCredits ?? 0; s.waveStartPaid.add(wave.waveIndex); s.events.push({ tick:s.tick, type:'wave.start', waveIndex:wave.waveIndex, payout:wave.payoutOnStartCredits ?? 0 }); }
}
function spawnEnemies(s, content) {
  const due = s.spawnQueue.filter(x => x.tick === s.tick).sort(compareSpawns); s.spawnQueue = s.spawnQueue.filter(x => x.tick !== s.tick);
  for (const spawn of due) { const def = content.enemies[spawn.enemyId]; const num = s.nextIds.enemy++; s.enemies.push({ id:`en_0_${num}`, num, typeId:def.id, hp:def.maxHp, maxHp:def.maxHp, progress:0, laneId:spawn.laneId, leaked:false, killed:false, rewardCredits:spawn.rewardCreditsOverride ?? def.rewardCredits, slow:null }); s.events.push({ tick:s.tick, type:'enemy.spawned', enemyId:`en_0_${num}`, enemyType:def.id }); }
}
function moveEnemies(s, content) {
  const len = content.map.lanes[0].pathLengthUnits;
  for (const e of s.enemies.sort((a,b)=>a.num-b.num)) if (!e.killed && !e.leaked) {
    const def = content.enemies[e.typeId]; const slowPct = e.slow && e.slow.untilTick >= s.tick ? e.slow.percent : 0;
    if (e.slow && e.slow.untilTick < s.tick) e.slow = null;
    e.progress += Math.max(1, Math.floor(def.speedUnitsPerTick * (100 - slowPct) / 100));
    if (e.progress >= len) { e.leaked = true; s.events.push({ tick:s.tick, type:'enemy.leaked.marked', enemyId:e.id }); }
  }
}
function towerAttacks(s, content) {
  const hits = [];
  for (const t of s.towers.sort((a,b)=>a.num-b.num)) {
    const lvl = content.towers[t.typeId].levels[t.level - 1];
    if (t.cooldown > 0) { t.cooldown--; continue; }
    const target = acquireTarget(t, s, content); if (!target) continue;
    hits.push(...makeHits(t, target, lvl, s)); t.cooldown = lvl.cooldownTicks;
    s.events.push({ tick:s.tick, type:'tower.fired', towerId:t.id, targetId:target.id });
  }
  hits.sort((a,b)=>a.towerNum-b.towerNum || a.targetNum-b.targetNum).forEach(h => applyHit(s, h, content));
}
function acquireTarget(t, s, content) {
  return s.enemies.filter(e => !e.killed && !e.leaked && inRange(t, e, content)).sort((a,b)=>b.progress-a.progress || a.hp-b.hp || a.num-b.num)[0] ?? null;
}
function inRange(t, e, content) {
  const lvl = content.towers[t.typeId].levels[t.level - 1]; const p = enemyPoint(e, content); const tx = (t.tileX + 0.5) * 1000; const ty = (t.tileY + 0.5) * 1000;
  const dx = tx - p.x, dy = ty - p.y; return dx*dx + dy*dy <= lvl.rangeUnits * lvl.rangeUnits;
}
function enemyPoint(e, content) { const tile = content.map.buildRules.gridWidth * 1000; return { x: Math.min(tile, e.progress / content.map.lanes[0].pathLengthUnits * tile), y: 2500 }; }
function makeHits(t, target, lvl, s) {
  if (lvl.attackType !== 'instant_splash') return [{ towerNum:t.num, targetNum:target.num, targetId:target.id, damage:lvl.damage, slowPercent:lvl.slowPercent, slowDurationTicks:lvl.slowDurationTicks }];
  return s.enemies.filter(e => !e.killed && !e.leaked && Math.abs(e.progress - target.progress) <= (lvl.splashRadiusUnits ?? 0)).map(e => ({ towerNum:t.num, targetNum:e.num, targetId:e.id, damage:e.id === target.id ? lvl.damage : Math.floor(lvl.damage * (lvl.splashFalloff ?? 0.65)) }));
}
function applyHit(s, h) {
  const e = s.enemies.find(x => x.id === h.targetId); if (!e || e.killed || e.leaked) return;
  e.hp -= h.damage; if (h.slowPercent) { if (!e.slow || h.slowPercent >= e.slow.percent) e.slow = { percent:h.slowPercent, untilTick:s.tick + h.slowDurationTicks }; }
  s.events.push({ tick:s.tick, type:'enemy.hit', enemyId:e.id, damage:h.damage, hp:Math.max(0,e.hp) });
  if (e.hp <= 0) { e.killed = true; s.events.push({ tick:s.tick, type:'enemy.killed.marked', enemyId:e.id }); }
}
function resolveDeathsAndLeaks(s, content) {
  for (const e of s.enemies.filter(e=>e.killed).sort((a,b)=>a.num-b.num)) { s.currency += e.rewardCredits; s.events.push({ tick:s.tick, type:'enemy.killed', enemyId:e.id, reward:e.rewardCredits }); }
  for (const e of s.enemies.filter(e=>e.leaked).sort((a,b)=>a.num-b.num)) { const dmg = content.enemies[e.typeId].leakDamage; s.lives -= dmg; s.events.push({ tick:s.tick, type:'enemy.leaked', enemyId:e.id, damage:dmg, lives:s.lives }); }
  s.enemies = s.enemies.filter(e => !e.killed && !e.leaked);
}
function evaluateResult(s) {
  if (s.lives <= 0) s.result = { outcome:'loss', tick:s.tick };
  else if (s.spawnQueue.length === 0 && s.enemies.length === 0) s.result = { outcome:'win', tick:s.tick };
}
