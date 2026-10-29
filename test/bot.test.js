import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createMatch, step } from '../src/sim/sim.js';
import { stateHash } from '../src/sim/hash.js';
import { createBot, botCommands, threatProfile } from '../src/ai/bot.js';

const content = indexContent(JSON.parse(await readFile(new URL('../content/ruleset.v0.json', import.meta.url), 'utf8')));

function play(diffs, seed = 'test-seed') {
  let m = createMatch(content, { players: diffs.length, seed });
  const bots = diffs.map((difficulty, slot) => createBot({ slot, difficulty, seed }));
  const rejected = [];
  let sends = 0;
  for (let i = 0; i < 20000 && !m.result; i++) {
    m = step(m, bots.flatMap(b => botCommands(b, m, content)), content);
    rejected.push(...m.rejectedCommands);
    sends += m.events.filter(e => e.type === 'pressure.sent').length;
  }
  return { m, rejected, sends };
}

test('bots only issue legal commands and every match reaches a result', () => {
  for (const diffs of [['easy'], ['hard'], ['normal', 'hard'], ['hard', 'easy']]) {
    const { m, rejected } = play(diffs);
    assert.deepEqual(rejected, [], `rejections for ${diffs}`);
    assert.ok(m.result, `result for ${diffs}`);
  }
});

test('bot-vs-bot replay is deterministic for a seed', () => {
  const a = play(['normal', 'hard'], 'det');
  const b = play(['normal', 'hard'], 'det');
  assert.equal(stateHash(a.m), stateHash(b.m));
  assert.equal(a.m.tick, b.m.tick);
});

test('difficulty ladder: hard survives the full solo run; hard beats easy head to head', () => {
  const hard = play(['hard'], 'ladder');
  assert.equal(hard.m.result.outcome, 'win');
  const vs = play(['hard', 'easy'], 'ladder');
  assert.equal(vs.m.result.winnerSlot, 0);
});

test('bots use pressure in versus but never in solo', () => {
  const solo = play(['hard']);
  assert.equal(solo.sends, 0);
  const versus = play(['hard', 'hard'], 'pressure');
  assert.ok(versus.sends > 0, 'hard bots should send pressure');
});

test('threat profile recognises swarm and heavy waves', () => {
  const m = createMatch(content);
  m.wavesStarted = 3; // waves 2 (Swarm Clump) and 3 (Heavy Anchor)
  const t = threatProfile(m, content);
  assert.ok(t.swarm > 0.3, `swarm share ${t.swarm}`);
  assert.ok(t.heavy > 0.2, `heavy share ${t.heavy}`);
});
