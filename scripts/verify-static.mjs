// Static sanity check for the no-build browser app: required files exist, the ruleset indexes,
// a match can be created, and every browser module at least parses.
import { access, readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createMatch } from '../src/sim/sim.js';
const required = ['index.html', 'src/game/main.js', 'src/game/audio.js', 'src/sim/sim.js', 'src/sim/map.js', 'src/ai/bot.js', 'src/render/renderer.js', 'src/render/fx.js', 'src/render/style.css', 'content/ruleset.v0.json', 'assets/art-handdrawn/lil8td-sprite-set-v2.png'];
await Promise.all(required.map(f => access(f)));
const content = indexContent(JSON.parse(await readFile('content/ruleset.v0.json', 'utf8')));
createMatch(content, { players: 2 });
for (const mod of ['../src/render/renderer.js', '../src/render/fx.js', '../src/game/audio.js']) await import(mod);
await import('../src/game/main.js').catch(err => {
  // The browser entry needs fetch/document; Node has already parsed the module graph by this point.
  const msg = String(err?.message ?? err);
  if (!/document|fetch|Failed to parse URL|is not defined/.test(msg)) throw err;
});
const html = await readFile('index.html', 'utf8');
for (const id of ['game', 'opp', 'screen-title', 'screen-howto', 'screen-result', 'towerButtons', 'pressureButtons']) if (!html.includes(`id="${id}"`)) throw new Error(`index.html missing #${id}`);
console.log('Static app verification passed');
