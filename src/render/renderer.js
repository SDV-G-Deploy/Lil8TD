// Lil8TD board renderer (Sprite Set V2 direction: Cozy RTS Miniatures + Dandadan Accents).
// Pure presentation: reads match state, never mutates it. Terrain is baked once per canvas
// size from the hand-drawn atlas; towers/enemies are y-sorted sprites; FX are client-side.
import { canPlaceTower, auraBonusPercent, enemySpeed } from '../sim/sim.js';
import { pointAtProgress } from '../sim/map.js';

const ATLAS_SCALE = 4;
const SPR = (x, y, w, h) => ({ x: x * ATLAS_SCALE, y: y * ATLAS_SCALE, w: w * ATLAS_SCALE, h: h * ATLAS_SCALE });
export const SPRITES = {
  grass0: SPR(0, 0, 32, 32), grass1: SPR(32, 0, 32, 32), grass2: SPR(64, 0, 32, 32), grass3: SPR(96, 0, 32, 32),
  pathH0: SPR(128, 0, 32, 32), pathH1: SPR(160, 0, 32, 32), pathH2: SPR(192, 0, 32, 32), pathH3: SPR(224, 0, 32, 32),
  pathV0: SPR(0, 176, 32, 32), pathV1: SPR(32, 176, 32, 32), pathV2: SPR(64, 176, 32, 32), pathV3: SPR(96, 176, 32, 32),
  cornerWS: SPR(128, 176, 32, 32), cornerSE: SPR(160, 176, 32, 32), cornerEN: SPR(192, 176, 32, 32), cornerNW: SPR(224, 176, 32, 32),
  arrow: SPR(0, 32, 48, 72), burst: SPR(48, 32, 48, 72), frost: SPR(96, 32, 48, 72), piercer: SPR(144, 32, 48, 72), beacon: SPR(192, 32, 48, 72),
  grunt: SPR(0, 104, 32, 32), runner: SPR(32, 104, 32, 32), brute: SPR(64, 104, 32, 32), swarmling: SPR(96, 104, 32, 32), shielded: SPR(128, 104, 32, 32), warlord: SPR(192, 104, 48, 40),
  iconCorner: SPR(0, 144, 16, 16), icon_arrow: SPR(24, 144, 16, 16), icon_burst: SPR(48, 144, 16, 16), icon_frost: SPR(72, 144, 16, 16), icon_piercer: SPR(96, 144, 16, 16), icon_beacon: SPR(120, 144, 16, 16),
  rift: SPR(0, 208, 32, 32), keep: SPR(32, 204, 32, 44), rock: SPR(80, 208, 32, 32), tree: SPR(112, 208, 32, 32)
};

export const TOWER_COLORS = { arrow: '#f0cf54', burst: '#ef8d42', frost: '#8edff0', piercer: '#ff5a72', beacon: '#3fe0c5' };
export const ENEMY_COLORS = { grunt: '#d5b96e', runner: '#de5753', brute: '#8e6bd7', swarmling: '#8fbf4a', shielded: '#9aa9c4', warlord: '#5f7a48' };
const ENEMY_SIZE = { grunt: .62, runner: .58, brute: .80, swarmling: .44, shielded: .66, warlord: 1.3 };
const CRIMSON = '#e0294a';
const TEAL = '#3fe0c5';

let atlas = null;
const atlasListeners = new Set();
export function loadAtlas(src = './assets/art-handdrawn/lil8td-sprite-set-v2.png') {
  if (atlas || typeof Image === 'undefined') return atlas;
  atlas = new Image();
  atlas.onload = () => atlasListeners.forEach(fn => fn());
  atlas.src = src;
  return atlas;
}
function atlasReady() { return atlas && atlas.complete && atlas.naturalWidth > 0; }

export function drawSprite(ctx, name, x, y, w, h, flip = false) {
  const s = SPRITES[name];
  if (!s || !atlasReady()) return false;
  if (flip) {
    ctx.save(); ctx.translate(Math.round(x + w), Math.round(y)); ctx.scale(-1, 1);
    ctx.drawImage(atlas, s.x, s.y, s.w, s.h, 0, 0, Math.round(w), Math.round(h));
    ctx.restore();
  } else ctx.drawImage(atlas, s.x, s.y, s.w, s.h, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  return true;
}

/** Draw a sprite into a small standalone canvas (used for DOM icons/portraits). */
export function spriteCanvas(name, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const paint = () => { ctx.clearRect(0, 0, w, h); const s = SPRITES[name]; const k = Math.min(w / s.w, h / s.h); drawSprite(ctx, name, (w - s.w * k) / 2, (h - s.h * k) / 2, s.w * k, s.h * k); };
  if (atlasReady()) paint(); else atlasListeners.add(paint);
  return c;
}

export function makeRenderer(canvas, content, opts = {}) {
  const ctx = canvas.getContext('2d');
  const mini = !!opts.mini;
  let terrain = null;
  loadAtlas();
  atlasListeners.add(() => { terrain = null; });
  const metrics = () => {
    const gridW = content.map.buildRules.gridWidth, gridH = content.map.buildRules.gridHeight;
    const cell = Math.min(canvas.width / gridW, canvas.height / gridH);
    return { gridW, gridH, cell, ox: (canvas.width - cell * gridW) / 2, oy: (canvas.height - cell * gridH) / 2 };
  };
  return {
    draw(match, slot, ui = {}, alpha = 0, fx = null, now = 0) {
      const m = metrics();
      if (!terrain || terrain.width !== canvas.width || terrain.height !== canvas.height) terrain = bakeTerrain(canvas.width, canvas.height, content, m, mini);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(terrain, 0, 0);
      const board = match.boards[slot];
      if (!board) return;
      drawAuras(ctx, board, content, m, now);
      if (!mini) drawPlacement(ctx, board, content, ui, m);
      drawEntities(ctx, match, board, content, ui, m, alpha, now, mini);
      if (fx) fx.draw(ctx, slot, m, now);
      if (board.collapsedTick != null) drawCollapsed(ctx, canvas, mini);
    },
    tileAt(evt) {
      const m = metrics();
      const r = canvas.getBoundingClientRect();
      const cs = getComputedStyle(canvas);
      const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
      const sx = canvas.width / (r.width - bl * 2), sy = canvas.height / (r.height - bt * 2);
      const px = (evt.clientX - r.left - bl) * sx, py = (evt.clientY - r.top - bt) * sy;
      const x = Math.floor((px - m.ox) / m.cell), y = Math.floor((py - m.oy) / m.cell);
      if (x < 0 || y < 0 || x >= m.gridW || y >= m.gridH) return null;
      return { x, y };
    },
    metrics,
    unitToPx(p) { const m = metrics(); return { x: m.ox + p.x / 1000 * m.cell, y: m.oy + p.y / 1000 * m.cell }; }
  };
}

// ---------------------------------------------------------------- terrain

function hash(x, y) { let n = (x + 11) * 374761393 + (y + 17) * 668265263; n = (n ^ (n >> 13)) * 1274126177; return Math.abs(n ^ (n >> 16)); }

function grassIndex(x, y) {
  // cluster grass families A/B/C over 3x2 blocks instead of per-tile confetti
  const roll = Math.abs(Math.floor(x / 3) * 17 + Math.floor(y / 2) * 29 + hash(Math.floor(x / 2), Math.floor(y / 2))) % 10;
  return roll < 5 ? 0 : roll < 7 ? 1 : roll < 9 ? 2 : 3;
}

function roadPiece(dirs, x, y) {
  const has = d => dirs.has(d);
  const v = hash(x, y) % 4;
  if (has('W') && has('S')) return 'cornerWS';
  if (has('S') && has('E')) return 'cornerSE';
  if (has('E') && has('N')) return 'cornerEN';
  if (has('N') && has('W')) return 'cornerNW';
  if (has('N') || has('S')) return `pathV${v}`;
  return `pathH${v}`;
}

function bakeTerrain(w, h, content, m, mini) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.fillStyle = '#07100e'; g.fillRect(0, 0, w, h);
  const lane = content.lane;
  for (let y = 0; y < m.gridH; y++) for (let x = 0; x < m.gridW; x++) {
    const px = m.ox + x * m.cell, py = m.oy + y * m.cell;
    const key = `${x},${y}`;
    if (lane.tileSet.has(key)) {
      if (!drawSprite(g, roadPiece(lane.tileDirs.get(key), x, y), px, py, m.cell + 0.5, m.cell + 0.5)) { g.fillStyle = '#a36932'; g.fillRect(px, py, m.cell, m.cell); }
    } else {
      if (!drawSprite(g, `grass${grassIndex(x, y)}`, px, py, m.cell + 0.5, m.cell + 0.5)) { g.fillStyle = (x + y) % 2 ? '#20472a' : '#1b3c24'; g.fillRect(px, py, m.cell, m.cell); }
    }
  }
  // soft macro patches hide the tile carpet without adding noise
  for (const [ax, ay, r, col] of [[1.8, 3.2, .7, 'rgba(118,133,69,.12)'], [7.6, .8, .6, 'rgba(19,50,39,.16)'], [10.4, 3.4, .7, 'rgba(121,93,52,.10)'], [4.8, 6.6, .6, 'rgba(93,114,58,.13)']]) {
    diamond(g, m.ox + ax * m.cell, m.oy + ay * m.cell, m.cell * r, col);
  }
  // build pins: calm plus-marks on legal tiles (quieter than towers/enemies)
  if (!mini) for (let y = 0; y < m.gridH; y++) for (let x = 0; x < m.gridW; x++) {
    if (lane.tileSet.has(`${x},${y}`) || content.blockedSet.has(`${x},${y}`)) continue;
    const cx = m.ox + (x + .5) * m.cell, cy = m.oy + (y + .5) * m.cell, k = m.cell / 80;
    g.fillStyle = 'rgba(218,193,126,.13)';
    g.fillRect(cx - 6 * k, cy - 1 * k, 12 * k, 2 * k); g.fillRect(cx - 1 * k, cy - 6 * k, 2 * k, 12 * k);
  }
  // props on blocked tiles
  for (const key of content.blockedSet) {
    const [x, y] = key.split(',').map(Number);
    drawSprite(g, hash(x, y) % 2 ? 'tree' : 'rock', m.ox + x * m.cell, m.oy + y * m.cell, m.cell, m.cell);
  }
  // lane caps: rift where raiders enter, keep the player defends
  const start = lane.tiles[0], end = lane.tiles[lane.tiles.length - 1];
  drawSprite(g, 'rift', m.ox + (start.x + .05) * m.cell, m.oy + (start.y - .55) * m.cell, m.cell * .9, m.cell * .9);
  drawSprite(g, 'keep', m.ox + (end.x + .1) * m.cell, m.oy + (end.y - .95) * m.cell, m.cell * .8, m.cell * 1.1);
  // frame
  const fw = Math.max(3, Math.round(m.cell / 10));
  g.strokeStyle = '#20150f'; g.lineWidth = fw * 2; g.strokeRect(0, 0, w, h);
  g.strokeStyle = '#8b6434'; g.lineWidth = Math.max(2, fw * .7); g.strokeRect(fw * 1.3, fw * 1.3, w - fw * 2.6, h - fw * 2.6);
  if (!mini) for (const [x, y] of [[fw * 2, fw * 2], [w - fw * 2, fw * 2], [fw * 2, h - fw * 2], [w - fw * 2, h - fw * 2]]) drawSprite(g, 'iconCorner', x - 8, y - 8, 16, 16);
  return c;
}

function diamond(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
}

// ---------------------------------------------------------------- dynamic layers

function tileCenter(m, x, y) { return { x: m.ox + (x + .5) * m.cell, y: m.oy + (y + .5) * m.cell }; }

function drawAuras(ctx, board, content, m, now) {
  for (const t of board.towers) {
    const lvl = content.towers[t.typeId].levels[t.level - 1];
    if (lvl.attackType !== 'aura') continue;
    const c = tileCenter(m, t.tileX, t.tileY); const r = lvl.rangeUnits / 1000 * m.cell;
    const pulse = .10 + .04 * Math.sin(now / 400 + t.num);
    ctx.fillStyle = `rgba(63,224,197,${pulse})`;
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(63,224,197,.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
}

function rangeCircle(ctx, c, r, color, fill = false) {
  if (fill) { ctx.fillStyle = 'rgba(244,231,191,.07)'; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(20,12,8,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
}

function drawPlacement(ctx, board, content, ui, m) {
  const sel = ui.selectedTowerId && board.towers.find(t => t.id === ui.selectedTowerId);
  if (sel) {
    const lvl = content.towers[sel.typeId].levels[sel.level - 1];
    rangeCircle(ctx, tileCenter(m, sel.tileX, sel.tileY), lvl.rangeUnits / 1000 * m.cell, TOWER_COLORS[sel.typeId], true);
    const c = tileCenter(m, sel.tileX, sel.tileY);
    ctx.strokeStyle = '#ffe59a'; ctx.lineWidth = 3; ctx.strokeRect(c.x - m.cell / 2 + 3, c.y - m.cell / 2 + 3, m.cell - 6, m.cell - 6);
  }
  if (!ui.hover || !ui.buildType) return;
  const { x, y } = ui.hover;
  const place = canPlaceTower(board, x, y, content);
  const affordable = board.currency >= content.towers[ui.buildType].buildCost;
  const ok = place.ok && affordable;
  const px = m.ox + x * m.cell, py = m.oy + y * m.cell;
  ctx.fillStyle = ok ? 'rgba(116,224,105,.22)' : 'rgba(218,73,65,.28)';
  ctx.fillRect(px + 4, py + 4, m.cell - 8, m.cell - 8);
  ctx.strokeStyle = ok ? '#c8f59d' : '#ff9a85'; ctx.lineWidth = 3; ctx.strokeRect(px + 6, py + 6, m.cell - 12, m.cell - 12);
  if (place.ok) {
    const lvl = content.towers[ui.buildType].levels[0];
    rangeCircle(ctx, tileCenter(m, x, y), lvl.rangeUnits / 1000 * m.cell, ok ? TOWER_COLORS[ui.buildType] : '#ff9a85');
    ctx.globalAlpha = .55; drawTowerSprite(ctx, ui.buildType, tileCenter(m, x, y), m.cell); ctx.globalAlpha = 1;
  }
}

function drawTowerSprite(ctx, typeId, c, cell) {
  const dw = cell * 1.0, dh = dw * 1.5;
  if (!drawSprite(ctx, typeId, c.x - dw / 2, c.y + cell * .40 - dh * (62 / 72), dw, dh)) {
    ctx.fillStyle = TOWER_COLORS[typeId]; ctx.fillRect(c.x - cell * .3, c.y - cell * .4, cell * .6, cell * .7);
  }
}

function enemyScreen(e, board, content, m, tick, alpha) {
  let progress = e.progress;
  if (alpha > 0) progress += enemySpeed(e, content.enemies[e.typeId], tick) * alpha;
  const p = pointAtProgress(content.lane, Math.min(content.lane.length, progress));
  return { x: m.ox + p.x / 1000 * m.cell, y: m.oy + p.y / 1000 * m.cell, dx: p.dx, dy: p.dy };
}
export { enemyScreen };

function drawEntities(ctx, match, board, content, ui, m, alpha, now, mini) {
  const list = [];
  for (const t of board.towers) { const c = tileCenter(m, t.tileX, t.tileY); list.push({ y: c.y + m.cell * .3, draw: () => drawTower(ctx, t, board, content, c, m, now, mini) }); }
  for (const e of board.enemies) {
    const p = enemyScreen(e, board, content, m, match.tick, alpha);
    list.push({ y: p.y + m.cell * .2, draw: () => drawEnemy(ctx, e, p, m, now, mini) });
  }
  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.draw();
}

function drawTower(ctx, t, board, content, c, m, now, mini) {
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  ctx.beginPath(); ctx.ellipse(c.x, c.y + m.cell * .33, m.cell * .36, m.cell * .10, 0, 0, Math.PI * 2); ctx.fill();
  drawTowerSprite(ctx, t.typeId, c, m.cell);
  if (mini) return;
  // level pips (gold diamonds) and teal pip when buffed by a Beacon
  const k = m.cell / 80;
  for (let i = 0; i < t.level; i++) diamond(ctx, c.x - (t.level - 1) * 7 * k + i * 14 * k, c.y + m.cell * .43, 5 * k, i < t.level ? '#ffe08a' : '#5a4a30');
  for (let i = 0; i < t.level; i++) diamond(ctx, c.x - (t.level - 1) * 7 * k + i * 14 * k, c.y + m.cell * .43, 2.5 * k, '#7a4f1c');
  if (auraBonusPercent(board, t, content) > 0) diamond(ctx, c.x + m.cell * .38, c.y - m.cell * .30, 6 * k + Math.sin(now / 300) * 1.2, TEAL);
}

function drawEnemy(ctx, e, p, m, now, mini) {
  const size = m.cell * (ENEMY_SIZE[e.typeId] ?? .6);
  const s = (e.typeId === 'warlord') ? { w: size, h: size * 40 / 48 } : { w: size, h: size };
  const bob = Math.round(Math.sin(now / (e.typeId === 'runner' ? 70 : e.typeId === 'brute' || e.typeId === 'warlord' ? 220 : 120) + e.num) * m.cell * .02);
  const feet = p.y + m.cell * .22;
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.ellipse(p.x, feet, s.w * .38, s.w * .11, 0, 0, Math.PI * 2); ctx.fill();
  if (e.source === 'pressure') {
    // crimson supernatural accent marks sent (pressure) raiders
    ctx.strokeStyle = 'rgba(224,41,74,.85)'; ctx.lineWidth = Math.max(2, m.cell / 30);
    ctx.beginPath(); ctx.ellipse(p.x, feet, s.w * .5, s.w * .16, 0, 0, Math.PI * 2); ctx.stroke();
  }
  const flip = p.dx < 0;
  const x = p.x - s.w / 2, y = feet - s.h * .95 + bob;
  if (!drawSprite(ctx, e.typeId, x, y, s.w, s.h, flip)) { ctx.fillStyle = ENEMY_COLORS[e.typeId]; ctx.fillRect(x + s.w * .2, y + s.h * .2, s.w * .6, s.h * .7); }
  if (e.slow) {
    ctx.fillStyle = 'rgba(142,223,240,.28)'; ctx.fillRect(x + s.w * .15, y + s.h * .15, s.w * .7, s.h * .8);
    diamond(ctx, x + s.w * .85, y + s.h * .15, Math.max(3, m.cell * .05), '#dcfbff');
  }
  if (e.source === 'pressure' && !mini) diamond(ctx, x + s.w * .15, y + s.h * .05, Math.max(3, m.cell * .045), CRIMSON);
  // bars: shield (pale steel) above health
  const bw = Math.max(m.cell * .45, s.w * .8), bh = Math.max(3, Math.round(m.cell / (mini ? 16 : 14)));
  const by = y - bh * (e.maxShield ? 2.6 : 1.6);
  bar(ctx, p.x - bw / 2, by, bw, bh, Math.max(0, e.hp / e.maxHp), e.typeId === 'warlord' ? '#ff6d6d' : '#71db70');
  if (e.maxShield) bar(ctx, p.x - bw / 2, by + bh + 1, bw, bh, Math.max(0, e.shield / e.maxShield), '#cfe3ff');
}

function bar(ctx, x, y, w, h, pct, color) {
  ctx.fillStyle = '#120c10'; ctx.fillRect(Math.round(x - 1), Math.round(y - 1), Math.round(w + 2), Math.round(h + 2));
  ctx.fillStyle = '#2b1519'; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w * pct), Math.round(h));
}

function drawCollapsed(ctx, canvas, mini) {
  ctx.fillStyle = 'rgba(20,6,8,.62)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff8a7a'; ctx.font = `bold ${mini ? 28 : 64}px ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('COLLAPSED', canvas.width / 2, canvas.height / 2);
}
