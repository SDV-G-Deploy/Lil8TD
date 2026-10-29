// Lil8TD heuristic bot (BOT_AI_PLAN_V0).
//
// The bot only emits ordinary player commands and reads only state a human can see: its own
// board, the opponent board and the authored wave list. No hidden resources, no cooldown
// bypasses, no legality exceptions. Difficulty changes decision cadence, how well it ranks its
// options, its upgrade ceiling and its appetite for pressure sends.
//
// Decision model: every candidate action (build type X on its best tile, upgrade tower T) gets a
// value = expected damage contribution gained per credit, scaled by what the upcoming waves ask
// for (swarm -> splash, heavy/shield -> piercer, fast -> slow). The bot takes the best action,
// saves for it when nearly affordable, and otherwise considers a pressure send.
// Everything is deterministic given the bot seed, so bot-vs-bot runs replay exactly.
import { makeRng, nextFloat, nextInt } from '../sim/rng.js';
import { laneCoverage } from '../sim/map.js';
import { canPlaceTower, pressureBlockReason, tileKind } from '../sim/sim.js';

export const BOT_PROFILES = {
  easy: {
    label: 'Easy', personality: 'Stable Defender', cadence: 30, idleChance: 0.25, noise: 0.9, tilePick: 5,
    allow: ['arrow', 'burst', 'frost', 'piercer'], maxLevel: 2, pressure: 0.12, pressureFromWave: 3, saveRatio: 0.85, reserve: 0
  },
  normal: {
    label: 'Normal', personality: 'Tempo Aggressor', cadence: 14, idleChance: 0.06, noise: 0.35, tilePick: 2,
    allow: ['arrow', 'burst', 'frost', 'piercer', 'beacon'], maxLevel: 3, pressure: 0.3, pressureFromWave: 2, saveRatio: 0.7, reserve: 20, reactive: false
  },
  hard: {
    label: 'Hard', personality: 'Greedy Scaler', cadence: 5, idleChance: 0, noise: 0.15, tilePick: 1,
    allow: ['arrow', 'burst', 'frost', 'piercer', 'beacon'], maxLevel: 3, pressure: 0.6, pressureFromWave: 1, saveRatio: 0.6, reserve: 30, reactive: true
  }
};

export function createBot({ slot = 1, difficulty = 'normal', seed = 'bot' } = {}) {
  const profile = BOT_PROFILES[difficulty] ?? BOT_PROFILES.normal;
  return { slot, difficulty, profile, rng: makeRng(`${seed}:${slot}:${difficulty}`), seq: 1, nextDecisionTick: 1, lastLeaks: 0, recoverUntil: 0, posture: 'stable', intent: 'opening', cache: null };
}

function tilesFor(bot, content) {
  if (bot.cache) return bot.cache;
  const { gridWidth, gridHeight } = content.map.buildRules;
  const tiles = [];
  for (let y = 0; y < gridHeight; y++) for (let x = 0; x < gridWidth; x++) {
    if (tileKind(content, x, y) !== 'grass') continue;
    const cov = {};
    for (const id of content.towerOrder) cov[id] = content.towers[id].levels.map(l => laneCoverage(content.lane, x, y, l.rangeUnits));
    tiles.push({ x, y, key: `${x},${y}`, cov });
  }
  bot.cache = { tiles, byKey: new Map(tiles.map(t => [t.key, t])) };
  return bot.cache;
}

/** What the current and next wave ask for: body-count shares for swarm/fast, HP share for heavy. */
export function threatProfile(match, content, board = null) {
  const idx = Math.max(0, match.wavesStarted - 1);
  const waves = content.waves.slice(idx, idx + 2);
  let bodies = 0, hpTotal = 0, swarm = 0, heavy = 0, fast = 0, shield = 0;
  for (const w of waves) for (const g of w.groups) {
    const e = content.enemies[g.enemyId];
    const hp = (e.maxHp + (e.maxShield ?? 0)) * g.count;
    bodies += g.count; hpTotal += hp;
    if (e.maxHp < 60) swarm += g.count; else if (g.count >= 12 && e.maxHp < 150) swarm += g.count / 2;
    if (e.speedUnitsPerTick >= 70) fast += g.count;
    if (e.maxHp >= 400 || e.maxShield) heavy += hp;
    if (e.maxShield) shield += hp;
  }
  // visible incoming pressure packs count double: they arrive on top of the wave
  for (const inc of board?.incoming ?? []) for (const g of content.pressurePacks[inc.packId].delivery.groups) {
    const e = content.enemies[g.enemyId]; const hp = e.maxHp * g.count * 2;
    bodies += g.count * 2; hpTotal += hp;
    if (e.speedUnitsPerTick >= 70) fast += g.count * 2;
    if (e.maxHp >= 400) heavy += hp;
  }
  bodies = Math.max(1, bodies); hpTotal = Math.max(1, hpTotal);
  return { swarm: swarm / bodies, fast: fast / bodies, heavy: Math.min(0.6, heavy / hpTotal), shield: Math.min(0.5, shield / hpTotal) };
}

function roleMult(type, threat) {
  if (type === 'burst') return 1.6 + 2.2 * threat.swarm;
  if (type === 'piercer') return 0.6 + 1.2 * threat.heavy + 0.8 * threat.shield;
  if (type === 'arrow') return 1 + 0.4 * threat.fast;
  return 1;
}

function dps(lvl) { return lvl.cooldownTicks ? lvl.damage * 20 / lvl.cooldownTicks : 0; }

function towerPower(t, content, cache, threat) {
  const lvl = content.towers[t.typeId].levels[t.level - 1];
  const tile = cache.byKey.get(`${t.tileX},${t.tileY}`);
  return dps(lvl) * (tile ? tile.cov[t.typeId][t.level - 1] : 10) * roleMult(t.typeId, threat);
}

function near(a, b, range) { const dx = (a.x - b.x) * 1000, dy = (a.y - b.y) * 1000; return dx * dx + dy * dy <= range * range; }

/** Value of a tower of `type` at `level` placed on `tile` given the current board. */
function placementValue(type, level, tile, b, content, cache, threat, ignoreId = null) {
  const lvl = content.towers[type].levels[level - 1];
  const others = b.towers.filter(t => t.id !== ignoreId);
  if (lvl.attackType === 'aura') {
    let v = 0;
    for (const t of others) {
      if (content.towers[t.typeId].levels[t.level - 1].attackType === 'aura') continue;
      if (!near(tile, { x: t.tileX, y: t.tileY }, lvl.rangeUnits)) continue;
      const existing = auraFor(t, others, content);
      v += towerPower(t, content, cache, threat) * Math.max(0, lvl.auraDamagePercent - existing) / 100;
    }
    return v;
  }
  let v = dps(lvl) * tile.cov[type][level - 1] * roleMult(type, threat);
  if (lvl.slowPercent) {
    // slow multiplies the time every other tower gets on the slowed segment; strongest slow wins
    const frosts = others.filter(t => t.typeId === 'frost').length;
    const board = others.reduce((s, t) => s + towerPower(t, content, cache, threat), 0);
    v += board * (lvl.slowPercent / 100) * (tile.cov[type][level - 1] / 40) * 0.5 / (1 + frosts) * (1 + threat.fast);
  }
  return v;
}

function auraFor(t, towers, content) {
  let best = 0;
  for (const o of towers) {
    const l = content.towers[o.typeId].levels[o.level - 1];
    if (l.attackType === 'aura' && o.id !== t.id && near({ x: t.tileX, y: t.tileY }, { x: o.tileX, y: o.tileY }, l.rangeUnits)) best = Math.max(best, l.auraDamagePercent);
  }
  return best;
}

function candidateActions(bot, b, match, content) {
  const p = bot.profile; const cache = tilesFor(bot, content); const threat = threatProfile(match, content, p.reactive ? b : null);
  const free = cache.tiles.filter(t => canPlaceTower(b, t.x, t.y, content).ok);
  const actions = [];
  for (const type of p.allow) {
    const cost = content.towers[type].buildCost;
    if (type === 'beacon' && b.towers.length < 5) continue;
    const scored = free.map(tile => ({ tile, v: placementValue(type, 1, tile, b, content, cache, threat) })).sort((a, c) => c.v - a.v || a.tile.y - c.tile.y || a.tile.x - c.tile.x);
    if (!scored.length || scored[0].v <= 0) continue;
    const pick = scored[Math.min(scored.length - 1, p.tilePick > 1 ? nextInt(bot.rng, p.tilePick) : 0)];
    actions.push({ kind: 'build', type, tile: pick.tile, cost, value: pick.v / cost });
  }
  for (const t of b.towers) {
    const def = content.towers[t.typeId]; const cur = def.levels[t.level - 1];
    if (cur.upgradeCost == null || t.level >= p.maxLevel) continue;
    const tile = cache.byKey.get(`${t.tileX},${t.tileY}`);
    const gain = placementValue(t.typeId, t.level + 1, tile, b, content, cache, threat, t.id) - placementValue(t.typeId, t.level, tile, b, content, cache, threat, t.id);
    actions.push({ kind: 'upgrade', t, cost: cur.upgradeCost, value: gain / cur.upgradeCost });
  }
  for (const a of actions) a.score = a.value * (1 + (p.noise ? (nextFloat(bot.rng) - 0.5) * 2 * p.noise : 0));
  actions.sort((a, c) => c.score - a.score || a.cost - c.cost);
  return actions;
}

export function botCommands(bot, match, content) {
  if (match.result || match.tick < bot.nextDecisionTick) return [];
  const p = bot.profile;
  bot.nextDecisionTick = match.tick + p.cadence;
  const b = match.boards[bot.slot];
  if (!b || b.collapsedTick != null) return [];
  if (p.idleChance && nextFloat(bot.rng) < p.idleChance) return [];

  // posture: recover after leaks, fortify against visible incoming pressure
  if (b.stats.leaks > bot.lastLeaks) { bot.recoverUntil = match.tick + 240; bot.lastLeaks = b.stats.leaks; }
  bot.posture = match.tick < bot.recoverUntil ? 'recover' : b.incoming.length ? 'fortify' : 'stable';

  // Pressure intent: once per upcoming wave decide whether to send, bank the pack cost, then
  // fire so the pack lands shortly after the opponent's wave starts (a pressure window).
  const plan = updateSendPlan(bot, match, content);
  if (plan?.fire) return [plan.fire];
  // reactive profiles stop banking and spend everything when a send is visibly incoming
  const banked = plan && !(p.reactive && bot.posture === 'fortify') ? content.pressurePacks[plan.packId].costCredits : 0;

  const actions = candidateActions(bot, b, match, content);
  const best = actions[0];
  if (best && b.currency - banked < best.cost) {
    if ((bot.posture === 'stable' || !p.reactive) && b.currency - banked >= best.cost * p.saveRatio) {
      const send = null;
      if (send) return [send];
      bot.intent = `save for ${best.type ?? best.t.typeId + ' upgrade'}`;
      return [];
    }
  }
  for (const a of actions) {
    if (b.currency - banked < a.cost) continue;
    if (a.score < best.score * 0.35 && bot.posture === 'stable') break;
    if (a.kind === 'build') { bot.intent = `build ${a.type}`; return [cmd(bot, { type: 'tower.build', towerType: a.type, x: a.tile.x, y: a.tile.y })]; }
    bot.intent = `upgrade ${a.t.typeId}`;
    return [cmd(bot, { type: 'tower.upgrade', towerId: a.t.id })];
  }
  if (plan) { bot.intent = `banking for ${content.pressurePacks[plan.packId].name}`; return []; }
  // only the hard profile converts idle surplus into extra opportunistic sends
  const send = p.reactive && b.currency > 250 ? maybePressure(bot, match, content, 0, true) : null;
  if (send) return [send];
  bot.intent = 'hold';
  return [];
}

const SEND_LAND_OFFSET = 60; // ticks after the opponent's wave start

function updateSendPlan(bot, match, content) {
  const p = bot.profile; const b = match.boards[bot.slot];
  if (match.mode !== 'versus') return null;
  const nw = content.waves[match.wavesStarted];
  if (!nw) return null;
  if (!bot.sendPlan || bot.sendPlan.waveIndex !== nw.waveIndex) {
    let packId = null;
    if (match.wavesStarted > p.pressureFromWave && nextFloat(bot.rng) < p.pressure) packId = choosePack(bot, match, content);
    bot.sendPlan = { waveIndex: nw.waveIndex, packId };
  }
  const plan = bot.sendPlan;
  if (!plan.packId) return null;
  // recovery discipline: abandon the plan while bleeding badly
  if ((bot.posture === 'recover' && b.lives < 12) || (bot.posture !== 'stable' && bot.difficulty === 'easy')) { plan.packId = null; return null; }
  const pack = content.pressurePacks[plan.packId];
  const sendTick = nw.startTick + SEND_LAND_OFFSET - pack.windupTicks;
  if (match.tick > sendTick + 60) { plan.packId = null; return null; }
  if (match.tick >= sendTick && !pressureBlockReason(match, bot.slot, plan.packId, content)) {
    const fire = cmd(bot, { type: 'pressure.send', packId: plan.packId });
    bot.intent = `pressure ${pack.name}`;
    plan.packId = null;
    return { fire };
  }
  return plan;
}

function choosePack(bot, match, content) {
  const opp = match.boards[1 - bot.slot];
  const oppHas = t => opp.towers.some(x => x.typeId === t);
  const unlockedBy = id => match.wavesStarted + 1 > (content.pressurePacks[id].unlockAtWaveIndex ?? 0);
  const scored = ['brute_drop', 'runner_rush', 'grunt_squad'].filter(unlockedBy).map(id => {
    let score = 1 + nextFloat(bot.rng);
    if (id === 'brute_drop') score += oppHas('piercer') ? 0 : 2;
    if (id === 'runner_rush') score += oppHas('frost') ? 0 : 1.2;
    if (id === 'grunt_squad') score += oppHas('burst') ? 0 : 1;
    return { id, score };
  }).sort((a, c) => c.score - a.score || a.id.localeCompare(c.id));
  return scored[0]?.id ?? null;
}

function cmd(bot, c) { return { ...c, playerSlot: bot.slot, clientCommandSeq: bot.seq++ }; }

function maybePressure(bot, match, content, reserveForPlan, windowOnly = false) {
  const p = bot.profile;
  if (match.mode !== 'versus') return null;
  const b0 = match.boards[bot.slot];
  // recovery discipline: no offensive spend while bleeding badly; cautious profiles also hold under incoming pressure
  if (bot.posture === 'recover' && b0.lives < 12) return null;
  if (bot.posture !== 'stable' && bot.difficulty === 'easy') return null;
  if (match.wavesStarted <= p.pressureFromWave) return null;
  const b = match.boards[bot.slot];
  const opp = match.boards[1 - bot.slot];
  // Prefer sends that land during the opponent's next wave (pressure window) and that test a
  // visible gap: no piercer -> brutes, no frost -> runners, no burst -> squads.
  const oppHas = t => opp.towers.some(x => x.typeId === t);
  const options = ['brute_drop', 'runner_rush', 'grunt_squad']
    .filter(id => !pressureBlockReason(match, bot.slot, id, content))
    .map(id => {
      const pack = content.pressurePacks[id];
      let score = 1;
      if (id === 'brute_drop' && !oppHas('piercer')) score += 2;
      if (id === 'runner_rush' && !oppHas('frost')) score += 1.5;
      if (id === 'grunt_squad' && !oppHas('burst')) score += 1;
      if (opp.lives < b.lives) score += 0.5;
      const nw = content.waves[match.wavesStarted];
      const land = match.tick + pack.windupTicks;
      const inWindow = !!nw && land >= nw.startTick + 20 && land <= nw.startTick + 160;
      if (inWindow) score += 1.5;
      return { id, pack, score, inWindow };
    })
    .filter(o => !windowOnly || o.inWindow)
    .filter(o => b.currency - o.pack.costCredits >= reserveForPlan + p.reserve);
  if (!options.length) return null;
  options.sort((a, c) => c.score - a.score || a.id.localeCompare(c.id));
  if (nextFloat(bot.rng) > p.pressure * Math.min(1, options[0].score / 2)) return null;
  bot.intent = `pressure ${options[0].id}`;
  return cmd(bot, { type: 'pressure.send', packId: options[0].id });
}
