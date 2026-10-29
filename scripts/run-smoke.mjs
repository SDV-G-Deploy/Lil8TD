// Headless bot harness: solo bot runs per difficulty plus bot-vs-bot versus matches.
// Usage: node scripts/run-smoke.mjs [--verbose]
import { readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createMatch, step } from '../src/sim/sim.js';
import { stateHash } from '../src/sim/hash.js';
import { createBot, botCommands } from '../src/ai/bot.js';

const content = indexContent(JSON.parse(await readFile(new URL('../content/ruleset.v0.json', import.meta.url), 'utf8')));
const verbose = process.argv.includes('--verbose');

export function playOut(players, diffs, seed = 'smoke') {
  let m = createMatch(content, { players, seed });
  const bots = diffs.map((d, slot) => createBot({ slot, difficulty: d, seed }));
  let rejected = 0;
  for (let i = 0; i < 20000 && !m.result; i++) {
    const cmds = bots.flatMap(bot => botCommands(bot, m, content));
    m = step(m, cmds, content);
    rejected += m.rejectedCommands.length;
  }
  return { m, rejected };
}

function summary(m) {
  return m.boards.map(b => `slot${b.slot} lives=${b.lives} towers=${b.towers.length} lvls=${b.towers.reduce((s, t) => s + t.level, 0)} cur=${b.currency} kills=${b.stats.kills} leaks=${b.stats.leaks} sends=${b.stats.sends}${b.collapsedTick != null ? ` COLLAPSED@${b.collapsedTick}` : ''}`).join(' | ');
}

const rows = [];
let failures = 0;
for (const d of ['easy', 'normal', 'hard']) {
  const { m, rejected } = playOut(1, [d]);
  rows.push({ match: `solo ${d}`, result: m.result?.outcome ?? 'none', tick: m.tick, wave: m.wavesStarted, hash: stateHash(m), rejected });
  if (verbose) console.log(`solo ${d}:`, summary(m));
  if (!m.result) failures++;
}
for (const [a, c] of [['hard', 'easy'], ['normal', 'easy'], ['hard', 'normal'], ['normal', 'normal']]) {
  const { m, rejected } = playOut(2, [a, c]);
  const r = m.result;
  rows.push({ match: `${a} vs ${c}`, result: r ? (r.winnerSlot == null ? r.outcome : `slot${r.winnerSlot} (${r.reason})`) : 'none', tick: m.tick, wave: m.wavesStarted, hash: stateHash(m), rejected });
  if (verbose) console.log(`${a} vs ${c}:`, summary(m));
  if (!r) failures++;
}
console.table(rows);
if (failures) process.exitCode = 1;
