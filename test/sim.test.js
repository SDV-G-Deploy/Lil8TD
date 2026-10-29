import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createMatch, step, runTicks, canPlaceTower, pressureBlockReason, auraBonusPercent, sellValue } from '../src/sim/sim.js';
import { buildLane, pointAtProgress, laneCoverage } from '../src/sim/map.js';
import { stateHash } from '../src/sim/hash.js';

const content = indexContent(JSON.parse(await readFile(new URL('../content/ruleset.v0.json', import.meta.url), 'utf8')));
const build = (slot, towerType, x, y, seq = 1) => ({ type: 'tower.build', playerSlot: slot, towerType, x, y, clientCommandSeq: seq });

/** Solo match with no authored waves, so tests control every spawn. */
function emptyMatch(players = 1) {
  const m = createMatch(content, { players });
  for (const b of m.boards) b.spawnQueue = [];
  return m;
}
/** Mark every authored wave as started so end-of-match rules can fire. */
function allWavesOut(m) { m.wavesStarted = content.waves.length; return m;
}
function spawn(m, slot, enemyId, tick = m.tick) { m.boards[slot].spawnQueue.push({ tick, waveIndex: 0, groupIndex: 0, itemIndex: m.boards[slot].spawnQueue.length, laneId: 'main', enemyId, source: 'test' }); }

test('lane geometry: axis-aligned path, integer points, tile set', () => {
  const lane = content.lane;
  assert.equal(lane.length, 22000);
  assert.ok(lane.tileSet.has('0,1') && lane.tileSet.has('3,3') && lane.tileSet.has('11,6'));
  assert.deepEqual(pointAtProgress(lane, 0), { x: 500, y: 1500, dx: 1, dy: 0 });
  const corner = pointAtProgress(lane, 3000);
  assert.equal(corner.x, 3500); assert.equal(corner.y, 1500);
  const down = pointAtProgress(lane, 4250);
  assert.deepEqual([down.x, down.y, down.dy], [3500, 2750, 1]);
  assert.deepEqual(pointAtProgress(lane, 999999), { x: 11500, y: 6500, dx: 1, dy: 0 });
  assert.throws(() => buildLane({ laneId: 'bad', waypoints: [[0, 0], [2, 2]] }), /axis-aligned/);
  assert.ok(laneCoverage(lane, 4, 3, 2300) > laneCoverage(lane, 0, 7, 2300));
});

test('placement legality blocks path, blocked terrain, occupied and off-grid tiles', () => {
  let m = emptyMatch();
  const b = m.boards[0];
  assert.equal(canPlaceTower(b, 1, 1, content).reason, 'path_blocked');
  assert.equal(canPlaceTower(b, 1, 6, content).reason, 'terrain_blocked');
  assert.equal(canPlaceTower(b, 12, 0, content).reason, 'illegal_position');
  m = step(m, [build(0, 'arrow', 1, 2)], content);
  assert.equal(m.boards[0].towers.length, 1);
  assert.equal(canPlaceTower(m.boards[0], 1, 2, content).reason, 'occupied');
  m = step(m, [build(0, 'arrow', 1, 2, 2)], content);
  assert.equal(m.rejectedCommands[0].reason, 'occupied');
});

test('economy: build, upgrade and sell spend and refund exactly', () => {
  let m = emptyMatch();
  const start = m.boards[0].currency;
  m = step(m, [build(0, 'arrow', 4, 3)], content);
  const t = m.boards[0].towers[0];
  assert.equal(m.boards[0].currency, start - content.towers.arrow.buildCost);
  m = step(m, [{ type: 'tower.upgrade', playerSlot: 0, towerId: t.id, clientCommandSeq: 2 }], content);
  const spent = content.towers.arrow.buildCost + content.towers.arrow.levels[0].upgradeCost;
  assert.equal(m.boards[0].towers[0].level, 2);
  assert.equal(m.boards[0].currency, start - spent);
  assert.equal(sellValue(m.boards[0].towers[0], content), Math.floor(spent * content.economy.sellRefundRate));
  m = step(m, [{ type: 'tower.sell', playerSlot: 0, towerId: t.id, clientCommandSeq: 3 }], content);
  assert.equal(m.boards[0].towers.length, 0);
  assert.equal(m.boards[0].currency, start - spent + Math.floor(spent * content.economy.sellRefundRate));
  m.boards[0].currency = 10;
  m = step(m, [build(0, 'piercer', 4, 3, 4)], content);
  assert.equal(m.rejectedCommands[0].reason, 'insufficient_resources');
  assert.equal(m.boards[0].currency, 10);
});

test('combat on the winding lane kills an enemy and pays its reward', () => {
  let m = emptyMatch();
  m = step(m, [build(0, 'arrow', 4, 3)], content);
  spawn(m, 0, 'grunt');
  allWavesOut(m);
  const before = m.boards[0].currency;
  m = runTicks(m, content, new Map(), 900);
  assert.equal(m.boards[0].stats.kills, 1);
  assert.equal(m.boards[0].currency, before + content.enemies.grunt.rewardCredits);
  assert.equal(m.boards[0].lives, content.constants.initialLives);
  assert.equal(m.result.outcome, 'win');
});

test('leaks cost lives and collapse ends a solo match as a loss', () => {
  let m = emptyMatch();
  m.boards[0].lives = 3;
  spawn(m, 0, 'brute');
  m = runTicks(m, content, new Map(), 2000);
  assert.equal(m.boards[0].lives, 0);
  assert.equal(m.result.outcome, 'loss');
  assert.equal(m.result.reason, 'collapse');
});

test('shield absorbs damage first and piercer cracks it at double rate', () => {
  let m = emptyMatch();
  m = step(m, [build(0, 'piercer', 4, 3)], content);
  spawn(m, 0, 'shielded');
  let shieldBrokenAt = null; let sawHpLossWithShield = false;
  for (let i = 0; i < 400 && !shieldBrokenAt; i++) {
    m = step(m, [], content);
    const e = m.boards[0].enemies[0];
    if (e && e.shield > 0 && e.hp < e.maxHp) sawHpLossWithShield = true;
    if (m.events.some(ev => ev.type === 'enemy.shieldBroken')) shieldBrokenAt = m.tick;
  }
  assert.ok(shieldBrokenAt, 'shield should break');
  assert.equal(sawHpLossWithShield, false, 'hp untouched while shield is up');
  const e = m.boards[0].enemies[0];
  // 90 dmg x2 = 180 vs 200 shield -> first shot leaves 20 shield; second shot breaks it and 160/2=80 spills into hp
  assert.equal(e.shield, 0);
  assert.equal(e.hp, e.maxHp - 80);
});

test('splash hits nearby enemies, frost slows, piercer targets the strongest', () => {
  let m = emptyMatch();
  m.boards[0].currency = 1000;
  m = step(m, [build(0, 'burst', 4, 3), build(0, 'frost', 2, 2, 2), build(0, 'piercer', 7, 4, 3)], content);
  spawn(m, 0, 'grunt'); spawn(m, 0, 'grunt', m.tick + 4); spawn(m, 0, 'brute', m.tick + 8);
  let splashTicks = 0, slowed = false, piercerOnBrute = false;
  for (let i = 0; i < 600; i++) {
    m = step(m, [], content);
    const hitsByTower = new Map();
    for (const ev of m.events) if (ev.type === 'enemy.hit') hitsByTower.set(ev.towerId, (hitsByTower.get(ev.towerId) ?? 0) + 1);
    const burst = m.boards[0].towers.find(t => t.typeId === 'burst');
    if ((hitsByTower.get(burst.id) ?? 0) >= 2) splashTicks++;
    if (m.boards[0].enemies.some(e => e.slow)) slowed = true;
    const pierce = m.boards[0].towers.find(t => t.typeId === 'piercer');
    const shot = m.events.find(ev => ev.type === 'tower.fired' && ev.towerId === pierce.id);
    if (shot) {
      const brute = m.boards[0].enemies.find(e => e.typeId === 'brute');
      const target = m.boards[0].enemies.find(e => e.id === shot.targetId);
      if (brute && target && brute.id === target.id) piercerOnBrute = true;
    }
  }
  assert.ok(splashTicks > 0, 'burst should hit multiple enemies in one shot');
  assert.ok(slowed, 'frost should apply slow');
  assert.ok(piercerOnBrute, 'piercer should focus the brute');
});

test('beacon aura boosts nearby tower damage and does not stack', () => {
  let m = emptyMatch();
  m.boards[0].currency = 1000;
  m = step(m, [build(0, 'arrow', 4, 3), build(0, 'beacon', 5, 3, 2), build(0, 'beacon', 4, 4, 3)], content);
  const arrow = m.boards[0].towers.find(t => t.typeId === 'arrow');
  assert.equal(auraBonusPercent(m.boards[0], arrow, content), content.towers.beacon.levels[0].auraDamagePercent);
  spawn(m, 0, 'brute');
  let dmg = null;
  for (let i = 0; i < 400 && dmg == null; i++) { m = step(m, [], content); const hit = m.events.find(e => e.type === 'enemy.hit' && e.towerId === arrow.id); if (hit) dmg = hit.damage; }
  assert.equal(dmg, Math.floor(content.towers.arrow.levels[0].damage * 125 / 100));
});

test('pressure send: cost, lock, windup delivery onto the opponent board, cooldown', () => {
  let m = createMatch(content, { players: 2 });
  for (const b of m.boards) b.spawnQueue = [];
  const send = (seq) => ({ type: 'pressure.send', playerSlot: 0, packId: 'grunt_squad', clientCommandSeq: seq });
  assert.equal(pressureBlockReason(m, 0, 'grunt_squad', content), 'locked');
  m.wavesStarted = 1;
  m.boards[0].currency = 500;
  m = step(m, [send(1)], content);
  const pack = content.pressurePacks.grunt_squad;
  assert.equal(m.boards[0].currency, 500 - pack.costCredits);
  assert.equal(m.boards[1].incoming.length, 1);
  assert.equal(m.boards[0].incoming.length, 0);
  const deliverTick = m.boards[1].incoming[0].deliverTick;
  assert.equal(deliverTick, 0 + pack.windupTicks);
  assert.equal(pressureBlockReason(m, 0, 'grunt_squad', content), 'cooldown');
  m = step(m, [send(2)], content);
  assert.equal(m.rejectedCommands[0].reason, 'cooldown');
  while (m.tick <= deliverTick) m = step(m, [], content);
  assert.equal(m.boards[1].incoming.length, 0);
  assert.equal(m.boards[1].enemies.filter(e => e.source === 'pressure').length, 1, 'first pressure grunt spawned on delivery tick');
  assert.equal(m.boards[0].enemies.length, 0, 'sender board untouched');
  // solo has no opponent
  const solo = emptyMatch(1);
  assert.equal(pressureBlockReason(solo, 0, 'grunt_squad', content), 'no_opponent');
});

test('versus result: collapse of one board wins for the other; equal lives draw', () => {
  let m = emptyMatch(2);
  m.boards[1].lives = 1;
  spawn(m, 1, 'grunt');
  m = runTicks(m, content, new Map(), 1000);
  assert.deepEqual([m.result.outcome, m.result.winnerSlot, m.result.reason], ['win', 0, 'collapse']);

  let d = allWavesOut(emptyMatch(2));
  d = step(d, [], content);
  assert.deepEqual([d.result.outcome, d.result.reason], ['draw', 'equal_lives']);

  let l = allWavesOut(emptyMatch(2));
  l.boards[0].lives = 5;
  l = step(l, [], content);
  assert.deepEqual([l.result.winnerSlot, l.result.reason], [1, 'more_lives']);
});

test('commands for a collapsed board are rejected; authored waves pay out on start', () => {
  let m = createMatch(content, { players: 2 });
  const start = m.boards[0].currency;
  m = runTicks(m, content, new Map(), content.waves[1].startTick + 1);
  assert.equal(m.wavesStarted, 2);
  assert.ok(m.boards[0].currency >= start + content.waves[1].payoutOnStartCredits);
  m.boards[1].collapsedTick = m.tick;
  m = step(m, [build(1, 'arrow', 4, 3)], content);
  assert.equal(m.rejectedCommands[0].reason, 'board_collapsed');
});

test('identical command streams give identical hashes; different streams differ', () => {
  const cmds = new Map([[1, [build(0, 'arrow', 4, 3)]], [5, [build(1, 'burst', 4, 3)]]]);
  const a = runTicks(createMatch(content), content, cmds, 1500);
  const b = runTicks(createMatch(content), content, cmds, 1500);
  const c = runTicks(createMatch(content), content, new Map(), 1500);
  assert.equal(stateHash(a), stateHash(b));
  assert.notEqual(stateHash(a), stateHash(c));
});
