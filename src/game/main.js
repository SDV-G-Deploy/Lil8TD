import { indexContent } from '../sim/content.js';
import { createInitialState, step, canPlaceTower } from '../sim/sim.js';
import { createAutoplayer, autoplayerCommands } from '../ai/autoplayer.js';
import { makeRenderer } from '../render/renderer.js';

const ruleset = await fetch('./content/ruleset.v0.json').then(r => r.json());
const content = indexContent(ruleset);
const canvas = document.querySelector('#game');
const hud = document.querySelector('#hud');
const towerButtons = document.querySelector('#towerButtons');
const selectedPanel = document.querySelector('#selectedPanel');
const renderer = makeRenderer(canvas, content);

let state, ui, bot;
function reset() { state = createInitialState(content); ui = { buildType:'arrow', selectedTowerId:null, hover:null, paused:false, bot:false, seq:1 }; bot = createAutoplayer(); renderButtons(); render(); }
function renderButtons() {
  towerButtons.innerHTML = '';
  for (const t of content.ruleset.towers) {
    const b = document.createElement('button'); b.textContent = `${t.name} (${t.buildCost})`; b.className = ui.buildType === t.id ? 'active' : ''; b.onclick = () => { ui.buildType = t.id; ui.selectedTowerId = null; renderButtons(); render(); }; towerButtons.appendChild(b);
  }
}
function selectedInfo() {
  const t = state.towers.find(x => x.id === ui.selectedTowerId);
  if (!t) return ui.buildType ? `Building: ${content.towers[ui.buildType].name}` : 'Click a tower or buildable tile.';
  const def = content.towers[t.typeId], lvl = def.levels[t.level - 1];
  return `<strong>${def.name}</strong><br>Level ${t.level}<br>Damage ${lvl.damage}, cooldown ${lvl.cooldownTicks}<br><button id="upgradeBtn">Upgrade ${lvl.upgradeCost ?? 'MAX'}</button><button id="sellBtn">Sell</button>`;
}
function wireSelectedButtons() {
  const t = state.towers.find(x => x.id === ui.selectedTowerId); if (!t) return;
  const lvl = content.towers[t.typeId].levels[t.level - 1];
  const up = document.querySelector('#upgradeBtn'); const sell = document.querySelector('#sellBtn');
  if (up) { up.disabled = lvl.upgradeCost == null || state.currency < lvl.upgradeCost; up.onclick = () => apply([{ type:'tower.upgrade', towerId:t.id, clientCommandSeq:ui.seq++ }]); }
  if (sell) sell.onclick = () => { apply([{ type:'tower.sell', towerId:t.id, clientCommandSeq:ui.seq++ }]); ui.selectedTowerId = null; };
}
function apply(commands) { state = step(state, commands, content); render(); }
function render() {
  hud.innerHTML = `Tick ${state.tick} · Credits <strong>${state.currency}</strong> · Lives <strong>${state.lives}</strong> · Enemies ${state.enemies.length} · ${state.result ? `<span class="${state.result.outcome==='win'?'ok':'danger'}">${state.result.outcome}</span>` : 'running'}`;
  selectedPanel.innerHTML = selectedInfo(); wireSelectedButtons(); renderer.draw(state, ui);
}
canvas.addEventListener('mousemove', e => { ui.hover = renderer.tileAt(e); renderer.draw(state, ui); });
canvas.addEventListener('mouseleave', () => { ui.hover = null; renderer.draw(state, ui); });
canvas.addEventListener('click', e => {
  const tile = renderer.tileAt(e); const tower = state.towers.find(t => t.tileX === tile.x && t.tileY === tile.y);
  if (tower) { ui.selectedTowerId = tower.id; ui.buildType = null; renderButtons(); render(); return; }
  if (ui.buildType && canPlaceTower(state, tile.x, tile.y, content).ok) apply([{ type:'tower.build', towerType:ui.buildType, x:tile.x, y:tile.y, clientCommandSeq:ui.seq++ }]);
});
document.querySelector('#pauseBtn').onclick = () => { ui.paused = !ui.paused; document.querySelector('#pauseBtn').textContent = ui.paused ? 'Resume' : 'Pause'; };
document.querySelector('#stepBtn').onclick = () => { if (ui.paused) apply(ui.bot ? autoplayerCommands(bot, state, content) : []); };
document.querySelector('#botBtn').onclick = () => { ui.bot = !ui.bot; document.querySelector('#botBtn').textContent = `Bot: ${ui.bot ? 'on' : 'off'}`; };
document.querySelector('#restartBtn').onclick = reset;
let acc = 0, last = performance.now();
function loop(now) { acc += now - last; last = now; let changed = false; while (!ui.paused && !state.result && acc >= content.constants.tickMs) { state = step(state, ui.bot ? autoplayerCommands(bot, state, content) : [], content); acc -= content.constants.tickMs; changed = true; } if (changed) render(); else renderer.draw(state, ui); requestAnimationFrame(loop); }
reset(); requestAnimationFrame(loop);
