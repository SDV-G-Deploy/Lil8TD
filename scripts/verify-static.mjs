import { access, readFile } from 'node:fs/promises';
import { indexContent } from '../src/sim/content.js';
import { createInitialState } from '../src/sim/sim.js';
const required = ['index.html','src/game/main.js','src/sim/sim.js','src/render/renderer.js','content/ruleset.v0.json'];
await Promise.all(required.map(f => access(f)));
const ruleset = JSON.parse(await readFile('content/ruleset.v0.json', 'utf8'));
const content = indexContent(ruleset);
createInitialState(content);
await import('../src/game/main.js').catch(err => {
  // Browser entry uses relative fetch/document; module syntax is still checked by Node before this point.
  const msg = String(err?.message ?? err);
  if (!msg.includes('document') && !msg.includes('fetch') && !msg.includes('Failed to parse URL')) throw err;
});
console.log('Static app verification passed');
