import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createInitialState, step, runTicks, canPlaceTower } from '../src/sim/sim.js';
import { stateHash } from '../src/sim/hash.js';
import { createAutoplayer, autoplayerCommands } from '../src/ai/autoplayer.js';
const content = indexContent(JSON.parse(await readFile('content/ruleset.v0.json', 'utf8')));

test('placement legality blocks path and occupied tiles', () => {
  let s = createInitialState(content);
  assert.equal(canPlaceTower(s, 1, 2, content).reason, 'path_blocked');
  s = step(s, [{ type:'tower.build', towerType:'arrow', x:1, y:1, clientCommandSeq:1 }], content);
  assert.equal(s.towers.length, 1);
  assert.equal(canPlaceTower(s, 1, 1, content).ok, false);
});

test('combat kills spawned enemy and pays reward deterministically', () => {
  let s = createInitialState(content);
  s.spawnQueue = [{ tick: 1, waveIndex:0, groupIndex:0, itemIndex:0, laneId:'main', enemyId:'grunt', source:'test' }];
  s = step(s, [{ type:'tower.build', towerType:'arrow', x:2, y:1, clientCommandSeq:1 }], content);
  const startCurrency = s.currency;
  s = runTicks(s, content, new Map(), 220);
  assert.ok(s.currency > startCurrency, 'kill reward should be paid');
  assert.equal(s.lives, content.constants.initialLives);
});

test('autoplayer emits only legal commands and reaches terminal result', () => {
  let s = createInitialState(content); const bot = createAutoplayer();
  for (let i = 0; i < 7000 && !s.result; i++) {
    const commands = autoplayerCommands(bot, s, content);
    s = step(s, commands, content);
    assert.deepEqual(s.rejectedCommands, []);
  }
  assert.ok(s.result, 'bot smoke should finish');
});

test('same command stream produces same final hash', () => {
  function run() { let s = createInitialState(content); const bot = createAutoplayer(); for (let i = 0; i < 7000 && !s.result; i++) s = step(s, autoplayerCommands(bot, s, content), content); return stateHash(s); }
  assert.equal(run(), run());
});
