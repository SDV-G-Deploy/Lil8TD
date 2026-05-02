import { canPlaceTower, tileKind } from '../sim/sim.js';

const PALETTE = {
  void: '#08131d',
  grassDark: '#15341f',
  grass: '#1d4b2b',
  grassLight: '#2f7040',
  pathDark: '#5b4227',
  path: '#8d6636',
  pathLight: '#b98a4b',
  grid: 'rgba(219, 255, 211, .10)',
  valid: 'rgba(96, 255, 142, .30)',
  invalid: 'rgba(255, 75, 75, .30)',
  ink: '#0a1020',
  cream: '#f2e8c9',
  arrow: '#e8d170',
  burst: '#ff9a4f',
  frost: '#91eaff',
  grunt: '#d9c57c',
  runner: '#ff6879',
  brute: '#a47bff',
  hpBack: '#2a1420',
  hp: '#65f27d'
};

const TOWER_META = {
  arrow: { color: PALETTE.arrow, trim: '#fff5a6', glyph: 'A' },
  burst: { color: PALETTE.burst, trim: '#ffd067', glyph: 'B' },
  frost: { color: PALETTE.frost, trim: '#dcfbff', glyph: 'F' }
};

const ENEMY_META = {
  grunt: { color: PALETTE.grunt, eye: '#49351e', size: .36 },
  runner: { color: PALETTE.runner, eye: '#fff0f0', size: .28 },
  brute: { color: PALETTE.brute, eye: '#1f123d', size: .46 }
};

export function makeRenderer(canvas, content) {
  const ctx = canvas.getContext('2d');
  const metrics = boardMetrics(canvas, content);
  return {
    tile: metrics.tile,
    draw(state, ui) { draw(ctx, canvas, content, state, ui, boardMetrics(canvas, content)); },
    tileAt(evt) {
      const r = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      const borderLeft = parseFloat(style.borderLeftWidth) || 0;
      const borderTop = parseFloat(style.borderTopWidth) || 0;
      const cssX = evt.clientX - r.left - borderLeft;
      const cssY = evt.clientY - r.top - borderTop;
      const scaleX = canvas.width / canvas.clientWidth;
      const scaleY = canvas.height / canvas.clientHeight;
      const x = Math.floor((cssX * scaleX) / metrics.cellW);
      const y = Math.floor((cssY * scaleY) / metrics.cellH);
      return {
        x: clamp(x, 0, content.map.buildRules.gridWidth - 1),
        y: clamp(y, 0, content.map.buildRules.gridHeight - 1)
      };
    }
  };
}

function boardMetrics(canvas, content) {
  const gridW = content.map.buildRules.gridWidth;
  const gridH = content.map.buildRules.gridHeight;
  const cellW = canvas.width / gridW;
  const cellH = canvas.height / gridH;
  return { gridW, gridH, cellW, cellH, tile: Math.min(cellW, cellH) };
}

function draw(ctx, canvas, content, state, ui, m) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTE.void;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawTiles(ctx, content, m);
  drawPathDetails(ctx, content, m);
  drawEffects(ctx, content, state, m);
  drawEnemies(ctx, content, state, m);
  drawTowers(ctx, content, state, ui, m);
  drawHover(ctx, content, state, ui, m);
  drawMapFrame(ctx, canvas);

  if (state.result) drawResult(ctx, canvas, state.result.outcome);
}

function drawTiles(ctx, content, m) {
  for (let y = 0; y < m.gridH; y++) {
    for (let x = 0; x < m.gridW; x++) {
      const px = x * m.cellW, py = y * m.cellH;
      if (tileKind(x, y) === 'path') drawPathTile(ctx, px, py, m.cellW, m.cellH, x, y);
      else drawGrassTile(ctx, px, py, m.cellW, m.cellH, x, y);
      ctx.strokeStyle = PALETTE.grid;
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.floor(px) + 1, Math.floor(py) + 1, Math.floor(m.cellW) - 2, Math.floor(m.cellH) - 2);
    }
  }
}

function drawGrassTile(ctx, x, y, w, h, gx, gy) {
  ctx.fillStyle = ((gx + gy) % 2 === 0) ? PALETTE.grass : PALETTE.grassDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.grassLight;
  const s = Math.max(4, Math.floor(Math.min(w, h) / 16));
  for (let i = 0; i < 5; i++) {
    const ox = ((gx * 23 + gy * 11 + i * 31) % Math.floor(w - s * 2)) + s;
    const oy = ((gx * 7 + gy * 29 + i * 17) % Math.floor(h - s * 2)) + s;
    ctx.fillRect(Math.floor(x + ox), Math.floor(y + oy), s, s);
  }
  ctx.fillStyle = 'rgba(5, 18, 12, .24)';
  ctx.fillRect(x, y + h - 6, w, 6);
}

function drawPathTile(ctx, x, y, w, h, gx) {
  ctx.fillStyle = PALETTE.pathDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.path;
  ctx.fillRect(x, y + 9, w, h - 18);
  ctx.fillStyle = PALETTE.pathLight;
  ctx.fillRect(x, y + 15, w, 5);
  ctx.fillRect(x + ((gx % 2) ? w * .58 : w * .18), y + h - 22, w * .22, 5);
  ctx.fillStyle = 'rgba(38, 23, 12, .35)';
  ctx.fillRect(x, y + h - 11, w, 5);
}

function drawPathDetails(ctx, content, m) {
  const y = 2.5 * m.cellH;
  ctx.fillStyle = '#f2d791';
  for (let x = .7; x < m.gridW; x += 1.35) {
    const px = x * m.cellW;
    pixelDiamond(ctx, px, y, 10, '#f2d791');
    ctx.fillRect(px - 3, y - 2, 18, 4);
  }
  ctx.fillStyle = '#53ff9b';
  ctx.fillRect(6, y - 20, 16, 40);
  ctx.fillStyle = '#ff5c68';
  ctx.fillRect(m.gridW * m.cellW - 22, y - 20, 16, 40);
}

function drawTowers(ctx, content, state, ui, m) {
  for (const t of state.towers) {
    const def = content.towers[t.typeId];
    const lvl = def.levels[t.level - 1];
    const meta = TOWER_META[t.typeId] ?? TOWER_META.arrow;
    const x = (t.tileX + .5) * m.cellW, y = (t.tileY + .5) * m.cellH;
    const s = Math.min(m.cellW, m.cellH);

    if (ui.selectedTowerId === t.id) {
      ctx.strokeStyle = 'rgba(235, 248, 255, .38)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, lvl.rangeUnits / 1000 * ((m.cellW + m.cellH) / 2), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(x - s * .25, y + s * .25, s * .5, 7);
    ctx.fillStyle = '#1a2440';
    ctx.fillRect(x - s * .22, y - s * .10, s * .44, s * .34);
    ctx.fillStyle = meta.color;
    ctx.fillRect(x - s * .17, y - s * .22, s * .34, s * .34);
    ctx.fillStyle = meta.trim;
    ctx.fillRect(x - s * .10, y - s * .28, s * .20, s * .08);

    if (t.typeId === 'arrow') drawArrowTop(ctx, x, y, s, meta);
    else if (t.typeId === 'burst') drawBurstTop(ctx, x, y, s, meta);
    else drawFrostTop(ctx, x, y, s, meta);

    ctx.fillStyle = PALETTE.ink;
    ctx.font = `bold ${Math.floor(s * .18)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(t.level), x, y + s * .03);
  }
}

function drawArrowTop(ctx, x, y, s, meta) {
  ctx.fillStyle = '#46391c';
  ctx.fillRect(x + s * .04, y - s * .38, s * .10, s * .30);
  ctx.fillStyle = meta.trim;
  ctx.fillRect(x + s * .10, y - s * .43, s * .22, s * .10);
  ctx.fillRect(x + s * .26, y - s * .48, s * .08, s * .20);
}
function drawBurstTop(ctx, x, y, s, meta) {
  ctx.fillStyle = '#502014';
  ctx.fillRect(x - s * .28, y - s * .36, s * .56, s * .13);
  ctx.fillStyle = meta.trim;
  pixelDiamond(ctx, x, y - s * .30, s * .13, meta.trim);
}
function drawFrostTop(ctx, x, y, s, meta) {
  ctx.fillStyle = '#1d4b63';
  ctx.fillRect(x - s * .06, y - s * .42, s * .12, s * .26);
  ctx.fillStyle = meta.trim;
  ctx.fillRect(x - s * .16, y - s * .46, s * .32, s * .08);
  ctx.fillRect(x - s * .04, y - s * .58, s * .08, s * .32);
}

function drawEnemies(ctx, content, state, m) {
  for (const e of state.enemies) {
    const p = enemyPx(e, content, m);
    const meta = ENEMY_META[e.typeId] ?? ENEMY_META.grunt;
    const s = Math.min(m.cellW, m.cellH) * meta.size;
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.fillRect(p.x - s * .42, p.y + s * .42, s * .84, 6);

    if (e.typeId === 'runner') drawRunner(ctx, p.x, p.y, s, meta);
    else if (e.typeId === 'brute') drawBrute(ctx, p.x, p.y, s, meta);
    else drawGrunt(ctx, p.x, p.y, s, meta);

    drawHealth(ctx, p.x, p.y - s * .75, Math.max(22, s * 1.1), 6, Math.max(0, e.hp / e.maxHp));
    if (e.slow) {
      ctx.strokeStyle = PALETTE.frost;
      ctx.lineWidth = 3;
      ctx.strokeRect(Math.floor(p.x - s * .58), Math.floor(p.y - s * .58), Math.floor(s * 1.16), Math.floor(s * 1.16));
      ctx.fillStyle = 'rgba(145, 234, 255, .25)';
      ctx.fillRect(p.x - s * .42, p.y - s * .42, s * .84, s * .84);
    }
  }
}

function drawGrunt(ctx, x, y, s, meta) {
  ctx.fillStyle = '#59432a';
  ctx.fillRect(x - s * .38, y - s * .25, s * .76, s * .65);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .30, y - s * .42, s * .60, s * .58);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x - s * .16, y - s * .18, s * .10, s * .10);
  ctx.fillRect(x + s * .08, y - s * .18, s * .10, s * .10);
}
function drawRunner(ctx, x, y, s, meta) {
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .42, y - s * .30, s * .78, s * .46);
  ctx.fillRect(x - s * .08, y - s * .48, s * .42, s * .22);
  ctx.fillStyle = '#7e1b29';
  ctx.fillRect(x - s * .52, y + s * .18, s * .28, s * .13);
  ctx.fillRect(x + s * .15, y + s * .18, s * .42, s * .13);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x + s * .18, y - s * .40, s * .10, s * .10);
}
function drawBrute(ctx, x, y, s, meta) {
  ctx.fillStyle = '#442b79';
  ctx.fillRect(x - s * .50, y - s * .18, s, s * .62);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .38, y - s * .55, s * .76, s * .70);
  ctx.fillStyle = '#d9c4ff';
  ctx.fillRect(x - s * .42, y - s * .62, s * .18, s * .18);
  ctx.fillRect(x + s * .24, y - s * .62, s * .18, s * .18);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x - s * .18, y - s * .28, s * .12, s * .12);
  ctx.fillRect(x + s * .06, y - s * .28, s * .12, s * .12);
}

function drawEffects(ctx, content, state, m) {
  for (const ev of state.events ?? []) {
    if (ev.type === 'tower.fired') {
      const tower = state.towers.find(t => t.id === ev.towerId);
      const enemy = state.enemies.find(e => e.id === ev.targetId);
      if (!tower || !enemy) continue;
      const from = { x: (tower.tileX + .5) * m.cellW, y: (tower.tileY + .5) * m.cellH };
      const to = enemyPx(enemy, content, m);
      const meta = TOWER_META[tower.typeId] ?? TOWER_META.arrow;
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = tower.typeId === 'burst' ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      if (tower.typeId === 'burst') {
        ctx.strokeStyle = 'rgba(255, 208, 103, .7)';
        ctx.beginPath();
        ctx.arc(to.x, to.y, m.tile * .28, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (ev.type === 'enemy.killed') {
      const enemy = state.enemies.find(e => e.id === ev.enemyId);
      if (enemy) {
        const p = enemyPx(enemy, content, m);
        pixelDiamond(ctx, p.x, p.y, m.tile * .18, '#ffe38a');
      }
    }
  }
}

function drawHover(ctx, content, state, ui, m) {
  if (!ui.hover) return;
  const ok = ui.buildType && canPlaceTower(state, ui.hover.x, ui.hover.y, content).ok;
  ctx.fillStyle = ok ? PALETTE.valid : PALETTE.invalid;
  ctx.fillRect(ui.hover.x * m.cellW + 3, ui.hover.y * m.cellH + 3, m.cellW - 6, m.cellH - 6);
  ctx.strokeStyle = ok ? '#89ff9e' : '#ff6e6e';
  ctx.lineWidth = 4;
  ctx.strokeRect(ui.hover.x * m.cellW + 5, ui.hover.y * m.cellH + 5, m.cellW - 10, m.cellH - 10);
}

function drawHealth(ctx, x, y, w, h, pct) {
  ctx.fillStyle = PALETTE.hpBack;
  ctx.fillRect(x - w / 2, y, w, h);
  ctx.fillStyle = PALETTE.hp;
  ctx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * pct, h - 2);
}
function drawMapFrame(ctx, canvas) {
  ctx.strokeStyle = '#5871a7';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  ctx.strokeStyle = '#111a2e';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
}
function drawResult(ctx, canvas, outcome) {
  ctx.fillStyle = 'rgba(0, 0, 0, .68)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = outcome === 'win' ? '#83ff99' : '#ff6b6b';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(outcome.toUpperCase(), canvas.width / 2, canvas.height / 2);
}
function enemyPx(e, content, m) {
  return {
    x: Math.min(m.gridW * m.cellW, (e.progress / content.map.lanes[0].pathLengthUnits) * m.gridW * m.cellW),
    y: 2.5 * m.cellH
  };
}
function pixelDiamond(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
