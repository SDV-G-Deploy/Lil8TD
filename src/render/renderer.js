import { canPlaceTower, tileKind } from '../sim/sim.js';
const COLORS = { grass:'#244d2b', path:'#8b6b3d', grid:'rgba(255,255,255,.08)', arrow:'#d7e6ff', burst:'#ffb25c', frost:'#9ee8ff', grunt:'#e6d38a', runner:'#ff7878', brute:'#b681ff' };
export function makeRenderer(canvas, content) {
  const ctx = canvas.getContext('2d'); const tile = Math.min(canvas.width / content.map.buildRules.gridWidth, canvas.height / content.map.buildRules.gridHeight);
  return { tile, draw(state, ui) { draw(ctx, canvas, content, state, ui, tile); }, tileAt(evt) { const r = canvas.getBoundingClientRect(); return { x: Math.floor((evt.clientX - r.left) / (r.width / content.map.buildRules.gridWidth)), y: Math.floor((evt.clientY - r.top) / (r.height / content.map.buildRules.gridHeight)) }; } };
}
function draw(ctx, canvas, content, state, ui, tile) {
  ctx.clearRect(0,0,canvas.width,canvas.height); ctx.imageSmoothingEnabled = false;
  for (let y=0;y<content.map.buildRules.gridHeight;y++) for (let x=0;x<content.map.buildRules.gridWidth;x++) {
    ctx.fillStyle = tileKind(x,y) === 'path' ? COLORS.path : COLORS.grass; ctx.fillRect(x*tile,y*tile,tile,tile); ctx.strokeStyle=COLORS.grid; ctx.strokeRect(x*tile,y*tile,tile,tile);
  }
  if (ui.hover) { const ok = ui.buildType && canPlaceTower(state, ui.hover.x, ui.hover.y, content).ok; ctx.fillStyle = ok ? 'rgba(100,255,140,.25)' : 'rgba(255,60,60,.25)'; ctx.fillRect(ui.hover.x*tile,ui.hover.y*tile,tile,tile); }
  for (const e of state.enemies) { const p = enemyPx(e, content, tile); ctx.fillStyle = COLORS[e.typeId]; const size = e.typeId === 'brute' ? 24 : e.typeId === 'runner' ? 14 : 18; ctx.fillRect(p.x-size/2,p.y-size/2,size,size); ctx.fillStyle='#111'; ctx.fillRect(p.x-18,p.y-22,36,5); ctx.fillStyle='#65f27d'; ctx.fillRect(p.x-18,p.y-22,36*Math.max(0,e.hp/e.maxHp),5); if (e.slow) { ctx.strokeStyle=COLORS.frost; ctx.strokeRect(p.x-size/2-2,p.y-size/2-2,size+4,size+4); } }
  for (const t of state.towers) { const x=(t.tileX+.5)*tile, y=(t.tileY+.5)*tile; ctx.fillStyle=COLORS[t.typeId]; ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0b1020'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillText(String(t.level),x,y+6); if (ui.selectedTowerId === t.id) { const lvl=content.towers[t.typeId].levels[t.level-1]; ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(x,y,lvl.rangeUnits/1000*tile,0,Math.PI*2); ctx.stroke(); } }
  if (state.result) { ctx.fillStyle='rgba(0,0,0,.65)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle=state.result.outcome==='win'?'#83ff99':'#ff6b6b'; ctx.font='bold 64px monospace'; ctx.textAlign='center'; ctx.fillText(state.result.outcome.toUpperCase(),canvas.width/2,canvas.height/2); }
}
function enemyPx(e, content, tile) { return { x: (e.progress / content.map.lanes[0].pathLengthUnits) * content.map.buildRules.gridWidth * tile, y: 2.5*tile }; }
