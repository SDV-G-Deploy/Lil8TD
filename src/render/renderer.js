import { canPlaceTower, tileKind } from '../sim/sim.js';

const PALETTE = {
  void: '#050b12',
  grassDeep: '#102417',
  grassDark: '#18361f',
  grass: '#244d2a',
  grassWarm: '#3f6632',
  grassGold: '#657542',
  moss: '#718743',
  flower: '#d6ac67',
  stone: '#8a7d60',
  slate: '#566052',
  pathRim: '#3f2a1b',
  pathDark: '#654322',
  path: '#966634',
  pathLight: '#c58c49',
  pathDust: '#dfb46c',
  seam: 'rgba(240, 219, 156, .11)',
  grid: 'rgba(242, 222, 162, .10)',
  valid: 'rgba(116, 224, 105, .28)',
  invalid: 'rgba(218, 73, 65, .30)',
  ink: '#09101a',
  umber: '#2a1c16',
  cream: '#f4e7c0',
  parchment: '#d8bf83',
  bronze: '#b47b38',
  iron: '#39455a',
  shadow: 'rgba(0, 0, 0, .36)',
  warmShadow: 'rgba(31, 18, 10, .30)',
  glint: 'rgba(252, 230, 169, .30)',
  arrow: '#e3c85d',
  burst: '#ef8d42',
  frost: '#8edff0',
  grunt: '#d0b46d',
  runner: '#db5d5c',
  brute: '#8e6bd7',
  hpBack: '#2b1519',
  hp: '#71db70'
};

const TOWER_META = {
  arrow: { color: PALETTE.arrow, trim: '#fff1a1', roof: '#876735', stone: '#5c5960' },
  burst: { color: PALETTE.burst, trim: '#ffd17b', roof: '#7b321f', stone: '#66554a' },
  frost: { color: PALETTE.frost, trim: '#dcfbff', roof: '#2d6e86', stone: '#526774' }
};

const ENEMY_META = {
  grunt: { color: PALETTE.grunt, shade: '#7a5a32', eye: '#342418', size: .39 },
  runner: { color: PALETTE.runner, shade: '#7c2530', eye: '#ffe6d1', size: .31 },
  brute: { color: PALETTE.brute, shade: '#46306f', eye: '#1d1132', size: .49 }
};

const ART_SCALE = 4;
const ART_ATLAS = makeArtAtlas();
const ART_SPRITES = {
  grass0: sprite(0, 0, 32, 32), grass1: sprite(32, 0, 32, 32), grass2: sprite(64, 0, 32, 32), grass3: sprite(96, 0, 32, 32),
  path0: sprite(128, 0, 32, 32), path1: sprite(160, 0, 32, 32), path2: sprite(192, 0, 32, 32), path3: sprite(224, 0, 32, 32),
  towerArrow: sprite(0, 40, 48, 56), towerBurst: sprite(48, 40, 48, 56), towerFrost: sprite(96, 40, 48, 56),
  enemyGrunt: sprite(0, 104, 32, 32), enemyRunner: sprite(32, 104, 32, 32), enemyBrute: sprite(64, 104, 32, 32),
  uiCorner: sprite(0, 144, 16, 16)
};

export function makeRenderer(canvas, content) {
  const ctx = canvas.getContext('2d');
  return {
    get tile() { return boardMetrics(canvas, content).tile; },
    draw(state, ui) { draw(ctx, canvas, content, state, ui, boardMetrics(canvas, content)); },
    tileAt(evt) {
      const m = boardMetrics(canvas, content);
      const r = canvas.getBoundingClientRect();
      const style = getComputedStyle(canvas);
      const borderLeft = parseFloat(style.borderLeftWidth) || 0;
      const borderTop = parseFloat(style.borderTopWidth) || 0;
      const cssX = evt.clientX - r.left - borderLeft;
      const cssY = evt.clientY - r.top - borderTop;
      const scaleX = canvas.width / canvas.clientWidth;
      const scaleY = canvas.height / canvas.clientHeight;
      const x = Math.floor((cssX * scaleX) / m.cellW);
      const y = Math.floor((cssY * scaleY) / m.cellH);
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
  drawBoardUnderlay(ctx, canvas, m);

  drawTiles(ctx, content, m);
  drawPathOrnaments(ctx, content, m);
  drawBuildPins(ctx, content, state, m);
  drawEffects(ctx, content, state, m);
  drawEnemies(ctx, content, state, m);
  drawTowers(ctx, content, state, ui, m);
  drawHover(ctx, content, state, ui, m);
  drawMapFrame(ctx, canvas, m);

  if (state.result) drawResult(ctx, canvas, state.result.outcome);
}

function drawBoardUnderlay(ctx, canvas, m) {
  ctx.fillStyle = '#07100e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Broad quiet fields make the map feel composed before individual tiles add material.
  ctx.fillStyle = 'rgba(72, 91, 48, .16)';
  pixelDiamond(ctx, canvas.width * .18, canvas.height * .22, m.tile * 2.2, 'rgba(72, 91, 48, .16)');
  pixelDiamond(ctx, canvas.width * .82, canvas.height * .78, m.tile * 2.5, 'rgba(88, 72, 41, .12)');
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(0, 0, canvas.width, 22);
  ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
}

function drawTiles(ctx, content, m) {
  for (let y = 0; y < m.gridH; y++) {
    for (let x = 0; x < m.gridW; x++) {
      const px = x * m.cellW, py = y * m.cellH;
      if (tileKind(x, y) === 'path') {
        if (!drawSprite(ctx, `path${hash(x, y) % 4}`, px, py, m.cellW, m.cellH)) drawPathTile(ctx, px, py, m.cellW, m.cellH, x, y, m);
      } else {
        if (!drawSprite(ctx, `grass${hash(x, y) % 4}`, px, py, m.cellW, m.cellH)) drawGrassTile(ctx, px, py, m.cellW, m.cellH, x, y, m);
      }
      drawTileGrid(ctx, px, py, m.cellW, m.cellH, x, y);
    }
  }
}

function drawGrassTile(ctx, x, y, w, h, gx, gy, m) {
  const n = hash(gx, gy);
  const family = (gx * 3 + gy * 5 + n) % 9;
  ctx.fillStyle = family < 2 ? PALETTE.grassDeep : (gx + gy) % 2 === 0 ? PALETTE.grassDark : '#17321d';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = n % 5 === 0 ? '#2b5530' : n % 4 === 0 ? '#1f4427' : PALETTE.grass;
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

  ctx.fillStyle = PALETTE.warmShadow;
  ctx.fillRect(x + 3, y + h - 11, w - 6, 8);
  ctx.fillStyle = 'rgba(239, 212, 141, .075)';
  ctx.fillRect(x + 5, y + 6, w - 10, 5);

  const step = Math.max(3, Math.floor(m.tile / 22));
  const flecks = 3 + (n % 4);
  for (let i = 0; i < flecks; i++) {
    const px = x + 10 + ((n + i * 29 + gx * 17) % Math.max(12, Math.floor(w - 22)));
    const py = y + 12 + ((n * 3 + i * 19 + gy * 23) % Math.max(12, Math.floor(h - 26)));
    const kind = (n + i * 2) % 10;
    if (kind === 0) {
      ctx.fillStyle = PALETTE.flower;
      ctx.fillRect(Math.floor(px), Math.floor(py), step * 2, step);
    } else if (kind < 4) {
      ctx.fillStyle = kind === 1 ? PALETTE.moss : PALETTE.grassGold;
      ctx.fillRect(Math.floor(px), Math.floor(py), step * 3, step);
      if (kind === 1) ctx.fillRect(Math.floor(px + step), Math.floor(py - step), step, step * 2);
    } else {
      ctx.fillStyle = kind === 4 ? '#315c2e' : '#4e7037';
      ctx.fillRect(Math.floor(px), Math.floor(py), step, step);
    }
  }

  if ((n & 7) === 5) {
    ctx.fillStyle = 'rgba(174, 162, 118, .34)';
    ctx.fillRect(x + w * .62, y + h * .61, m.tile * .13, m.tile * .045);
    ctx.fillStyle = 'rgba(44, 37, 30, .30)';
    ctx.fillRect(x + w * .62, y + h * .66, m.tile * .13, m.tile * .025);
  }
  if ((n % 13) === 3) {
    ctx.fillStyle = 'rgba(95, 112, 63, .26)';
    pixelDiamond(ctx, x + w * .26, y + h * .70, m.tile * .13, 'rgba(95, 112, 63, .26)');
  }
}

function drawPathTile(ctx, x, y, w, h, gx, gy, m) {
  const n = hash(gx, gy);
  ctx.fillStyle = PALETTE.pathRim;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#2d1d14';
  ctx.fillRect(x + 2, y + 5, w - 4, 12);
  ctx.fillRect(x + 2, y + h - 17, w - 4, 12);
  ctx.fillStyle = PALETTE.pathDark;
  ctx.fillRect(x + 2, y + 12, w - 4, h - 24);
  ctx.fillStyle = gx % 2 === 0 ? PALETTE.path : '#8d5d31';
  ctx.fillRect(x + 8, y + 17, w - 16, h - 34);

  // A soft diagonal value rhythm keeps the road handcrafted without losing the lane read.
  ctx.fillStyle = 'rgba(80, 47, 24, .22)';
  ctx.fillRect(x + 12 + (gx % 3) * 6, y + 20, w * .18, h - 40);
  ctx.fillStyle = 'rgba(238, 196, 118, .12)';
  ctx.fillRect(x + w * .48, y + 18, w * .16, h - 36);

  // crafted worn center, like a compact old RTS road with packed dust and plank/stone breaks
  ctx.fillStyle = 'rgba(227, 183, 104, .36)';
  ctx.fillRect(x + 12, y + h * .42, w - 24, 5);
  ctx.fillStyle = 'rgba(55, 32, 19, .30)';
  ctx.fillRect(x + 10, y + h - 25, w - 20, 6);
  ctx.fillStyle = PALETTE.pathLight;
  ctx.fillRect(x + ((gx % 2) ? w * .56 : w * .18), y + 25, w * .20, 5);
  ctx.fillRect(x + ((gx % 3) ? w * .24 : w * .62), y + h - 34, w * .18, 4);

  ctx.fillStyle = 'rgba(244, 225, 164, .32)';
  for (let i = 0; i < 4; i++) {
    const px = x + 18 + ((n + i * 31) % Math.max(12, Math.floor(w - 38)));
    const py = y + 22 + ((n * 2 + i * 17) % Math.max(12, Math.floor(h - 44)));
    ctx.fillRect(Math.floor(px), Math.floor(py), Math.max(3, m.tile * .045), Math.max(2, m.tile * .025));
  }

  ctx.fillStyle = 'rgba(31, 21, 15, .32)';
  ctx.fillRect(x + 2, y + 9, w - 4, 6);
  ctx.fillRect(x + 2, y + h - 15, w - 4, 6);

  // little bordering stones make the road feel built, not just colored.
  for (let sx = x + 10 + (gx % 2) * 10; sx < x + w - 10; sx += 28) {
    ctx.fillStyle = ((Math.floor(sx) + gx) % 3) ? '#78694d' : '#a08b61';
    ctx.fillRect(Math.floor(sx), Math.floor(y + 7), 12, 5);
    ctx.fillRect(Math.floor(sx + 9), Math.floor(y + h - 12), 13, 5);
    ctx.fillStyle = 'rgba(255,238,178,.20)';
    ctx.fillRect(Math.floor(sx) + 2, Math.floor(y + 7), 6, 1);
  }
}

function drawTileGrid(ctx, x, y, w, h, gx, gy) {
  ctx.strokeStyle = tileKind(gx, gy) === 'path' ? 'rgba(255, 231, 173, .13)' : PALETTE.grid;
  ctx.lineWidth = 2;
  ctx.strokeRect(Math.floor(x) + 1, Math.floor(y) + 1, Math.floor(w) - 2, Math.floor(h) - 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, .16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.floor(x) + 4, Math.floor(y) + 4, Math.floor(w) - 8, Math.floor(h) - 8);
}

function drawPathOrnaments(ctx, content, m) {
  const cy = 2.5 * m.cellH;
  for (let x = .55; x < m.gridW; x += 1.08) {
    const px = x * m.cellW;
    ctx.fillStyle = 'rgba(67, 39, 22, .34)';
    ctx.fillRect(px - 16, cy - 2, 33, 5);
    pixelDiamond(ctx, px, cy - 1, 7, 'rgba(223, 180, 108, .78)');
    pixelDiamond(ctx, px, cy - 1, 3, '#744723');
    ctx.fillStyle = 'rgba(244, 220, 154, .18)';
    ctx.fillRect(px + 7, cy - 4, 9, 3);
  }

  // entrance / keep markers: decorative but small enough not to compete with enemies.
  drawGateMarker(ctx, 18, cy, 'start');
  drawGateMarker(ctx, m.gridW * m.cellW - 18, cy, 'end');
}

function drawGateMarker(ctx, x, y, mode) {
  const banner = mode === 'start' ? '#6fcf79' : '#d45f58';
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(x - 11, y + 21, 22, 5);
  ctx.fillStyle = '#443725';
  ctx.fillRect(x - 4, y - 24, 8, 48);
  ctx.fillStyle = '#8a7449';
  ctx.fillRect(x - 8, y - 28, 16, 8);
  ctx.fillStyle = banner;
  ctx.fillRect(mode === 'start' ? x + 4 : x - 22, y - 22, 18, 24);
  ctx.fillStyle = 'rgba(255,255,255,.24)';
  ctx.fillRect(mode === 'start' ? x + 7 : x - 19, y - 19, 4, 18);
}

function drawBuildPins(ctx, content, state, m) {
  const occupied = new Set(state.towers.map(t => `${t.tileX},${t.tileY}`));
  for (let y = 0; y < m.gridH; y++) for (let x = 0; x < m.gridW; x++) {
    if (tileKind(x, y) === 'path' || occupied.has(`${x},${y}`)) continue;
    const cx = (x + .5) * m.cellW, cy = (y + .5) * m.cellH;
    ctx.fillStyle = 'rgba(18, 27, 15, .20)';
    ctx.fillRect(cx - 9, cy + 7, 18, 3);
    ctx.fillStyle = 'rgba(218, 193, 126, .15)';
    ctx.fillRect(cx - 6, cy - 1, 12, 2);
    ctx.fillRect(cx - 1, cy - 6, 2, 12);
    if ((hash(x, y) % 5) === 0) {
      ctx.fillStyle = 'rgba(213, 174, 102, .13)';
      ctx.fillRect(cx + 8, cy - 9, 5, 5);
    }
  }
}

function drawTowers(ctx, content, state, ui, m) {
  for (const t of state.towers) {
    const def = content.towers[t.typeId];
    const lvl = def.levels[t.level - 1];
    const meta = TOWER_META[t.typeId] ?? TOWER_META.arrow;
    const x = (t.tileX + .5) * m.cellW, y = (t.tileY + .5) * m.cellH;
    const s = Math.min(m.cellW, m.cellH);

    if (ui.selectedTowerId === t.id) drawRange(ctx, x, y, lvl.rangeUnits / 1000 * ((m.cellW + m.cellH) / 2), meta);
    const spriteName = t.typeId === 'arrow' ? 'towerArrow' : t.typeId === 'burst' ? 'towerBurst' : 'towerFrost';
    const drewAsset = drawSprite(ctx, spriteName, x - s * .42, y - s * .58, s * .84, s * .98);
    if (!drewAsset) {
      drawTowerBase(ctx, x, y, s, meta, t.level);
      if (t.typeId === 'arrow') drawArrowTower(ctx, x, y, s, meta);
      else if (t.typeId === 'burst') drawBurstTower(ctx, x, y, s, meta);
      else drawFrostTower(ctx, x, y, s, meta);
    }
    drawTowerBadge(ctx, x, y, s, t.level, meta);
  }
}

function drawRange(ctx, x, y, r, meta) {
  ctx.strokeStyle = 'rgba(244, 231, 191, .30)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = meta.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTowerBase(ctx, x, y, s, meta) {
  ctx.fillStyle = PALETTE.shadow;
  ctx.fillRect(x - s * .36, y + s * .30, s * .72, 8);
  ctx.fillStyle = '#1d1512';
  ctx.fillRect(x - s * .32, y + s * .11, s * .64, s * .25);
  ctx.fillStyle = '#423126';
  ctx.fillRect(x - s * .26, y + s * .23, s * .52, s * .09);
  ctx.fillStyle = meta.stone;
  ctx.fillRect(x - s * .25, y - s * .15, s * .50, s * .37);
  ctx.fillStyle = 'rgba(244,231,191,.26)';
  ctx.fillRect(x - s * .20, y - s * .11, s * .11, s * .08);
  ctx.fillRect(x + s * .08, y - s * .11, s * .11, s * .08);
  ctx.fillStyle = 'rgba(22,20,22,.32)';
  ctx.fillRect(x - s * .25, y + s * .15, s * .50, s * .07);
  ctx.fillStyle = '#24242a';
  ctx.fillRect(x - s * .15, y + s * .04, s * .30, s * .12);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fillRect(x - s * .25, y - s * .15, s * .05, s * .37);
  ctx.fillStyle = meta.roof;
  ctx.fillRect(x - s * .32, y - s * .25, s * .64, s * .15);
  ctx.fillStyle = meta.trim;
  ctx.fillRect(x - s * .24, y - s * .31, s * .48, s * .06);
  ctx.fillStyle = 'rgba(255,245,194,.18)';
  ctx.fillRect(x - s * .24, y - s * .25, s * .48, s * .03);
}

function drawArrowTower(ctx, x, y, s, meta) {
  ctx.fillStyle = '#5b4325';
  ctx.fillRect(x - s * .06, y - s * .48, s * .12, s * .29);
  ctx.fillStyle = '#2d2116';
  ctx.fillRect(x - s * .09, y - s * .42, s * .18, s * .06);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .23, y - s * .48, s * .46, s * .08);
  ctx.fillRect(x + s * .16, y - s * .55, s * .08, s * .20);
  ctx.fillStyle = meta.trim;
  ctx.fillRect(x - s * .18, y - s * .54, s * .10, s * .05);
  ctx.fillRect(x + s * .02, y - s * .54, s * .10, s * .05);
  ctx.fillStyle = '#f8e9a3';
  ctx.fillRect(x + s * .25, y - s * .49, s * .16, s * .05);
}

function drawBurstTower(ctx, x, y, s, meta) {
  ctx.fillStyle = '#2d1712';
  ctx.fillRect(x - s * .38, y - s * .39, s * .16, s * .12);
  ctx.fillStyle = '#542518';
  ctx.fillRect(x - s * .32, y - s * .44, s * .64, s * .14);
  ctx.fillStyle = '#261513';
  ctx.fillRect(x + s * .20, y - s * .40, s * .17, s * .07);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .18, y - s * .49, s * .30, s * .09);
  pixelDiamond(ctx, x - s * .02, y - s * .35, s * .13, meta.trim);
  ctx.fillStyle = 'rgba(255, 230, 144, .55)';
  ctx.fillRect(x - s * .06, y - s * .39, s * .08, s * .08);
}

function drawFrostTower(ctx, x, y, s, meta) {
  ctx.fillStyle = '#214d64';
  ctx.fillRect(x - s * .08, y - s * .48, s * .16, s * .30);
  ctx.fillStyle = '#173447';
  ctx.fillRect(x - s * .13, y - s * .36, s * .26, s * .06);
  ctx.fillStyle = meta.color;
  pixelDiamond(ctx, x, y - s * .56, s * .15, meta.color);
  ctx.fillStyle = meta.trim;
  ctx.fillRect(x - s * .20, y - s * .39, s * .40, s * .06);
  ctx.fillRect(x - s * .03, y - s * .68, s * .06, s * .30);
  ctx.fillStyle = 'rgba(220, 251, 255, .42)';
  ctx.fillRect(x + s * .05, y - s * .62, s * .05, s * .12);
}

function drawTowerBadge(ctx, x, y, s, level, meta) {
  ctx.fillStyle = '#21170f';
  ctx.fillRect(x - s * .13, y + s * .15, s * .26, s * .17);
  ctx.strokeStyle = meta.trim;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - s * .13, y + s * .15, s * .26, s * .17);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `bold ${Math.floor(s * .15)}px ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(level), x, y + s * .24);
}

function drawEnemies(ctx, content, state, m) {
  for (const e of state.enemies) {
    const p = enemyPx(e, content, m);
    const meta = ENEMY_META[e.typeId] ?? ENEMY_META.grunt;
    const s = Math.min(m.cellW, m.cellH) * meta.size;
    ctx.fillStyle = PALETTE.shadow;
    ctx.fillRect(p.x - s * .48, p.y + s * .42, s * .96, 6);

    const spriteName = e.typeId === 'runner' ? 'enemyRunner' : e.typeId === 'brute' ? 'enemyBrute' : 'enemyGrunt';
    const bob = e.typeId === 'runner' && state.tick % 12 < 6 ? 2 : 0;
    const drewAsset = drawSprite(ctx, spriteName, p.x - s * .56, p.y - s * .68 + bob, s * 1.12, s * 1.12);
    if (!drewAsset) {
      if (e.typeId === 'runner') drawRunner(ctx, p.x, p.y, s, meta, state.tick);
      else if (e.typeId === 'brute') drawBrute(ctx, p.x, p.y, s, meta);
      else drawGrunt(ctx, p.x, p.y, s, meta);
    }

    drawHealth(ctx, p.x, p.y - s * .88, Math.max(24, s * 1.18), 7, Math.max(0, e.hp / e.maxHp));
    if (e.slow) drawSlowOverlay(ctx, p.x, p.y, s);
  }
}

function drawGrunt(ctx, x, y, s, meta) {
  ctx.fillStyle = meta.shade;
  ctx.fillRect(x - s * .40, y - s * .16, s * .80, s * .56);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .30, y - s * .47, s * .60, s * .56);
  ctx.fillStyle = 'rgba(255,236,172,.20)';
  ctx.fillRect(x - s * .23, y - s * .42, s * .18, s * .43);
  ctx.fillStyle = '#ead18b';
  ctx.fillRect(x - s * .20, y - s * .55, s * .40, s * .10);
  ctx.fillStyle = '#7d6135';
  ctx.fillRect(x - s * .27, y - s * .49, s * .10, s * .06);
  ctx.fillRect(x + s * .17, y - s * .49, s * .10, s * .06);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x - s * .15, y - s * .24, s * .09, s * .10);
  ctx.fillRect(x + s * .07, y - s * .24, s * .09, s * .10);
  ctx.fillStyle = '#5b4027';
  ctx.fillRect(x - s * .47, y + s * .16, s * .20, s * .12);
  ctx.fillRect(x + s * .27, y + s * .16, s * .20, s * .12);
}

function drawRunner(ctx, x, y, s, meta, tick) {
  const bob = tick % 12 < 6 ? 2 : -1;
  ctx.fillStyle = meta.shade;
  ctx.fillRect(x - s * .54, y + s * .17 + bob, s * .30, s * .13);
  ctx.fillRect(x + s * .13, y + s * .18 - bob, s * .46, s * .13);
  ctx.fillStyle = 'rgba(84, 25, 29, .45)';
  ctx.fillRect(x - s * .58, y - s * .01 + bob, s * .18, s * .08);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .44, y - s * .23, s * .72, s * .40);
  ctx.fillRect(x - s * .04, y - s * .48, s * .40, s * .25);
  ctx.fillStyle = 'rgba(255,205,139,.20)';
  ctx.fillRect(x - s * .35, y - s * .20, s * .22, s * .08);
  ctx.fillStyle = '#f0a06d';
  ctx.fillRect(x + s * .21, y - s * .53, s * .20, s * .08);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x + s * .17, y - s * .39, s * .10, s * .10);
  ctx.fillStyle = 'rgba(255, 216, 133, .33)';
  ctx.fillRect(x - s * .66, y - s * .10, s * .18, s * .07);
}

function drawBrute(ctx, x, y, s, meta) {
  ctx.fillStyle = meta.shade;
  ctx.fillRect(x - s * .54, y - s * .12, s * 1.08, s * .62);
  ctx.fillStyle = meta.color;
  ctx.fillRect(x - s * .40, y - s * .58, s * .80, s * .70);
  ctx.fillStyle = 'rgba(221, 198, 255, .18)';
  ctx.fillRect(x - s * .30, y - s * .51, s * .22, s * .52);
  ctx.fillStyle = '#cdb6ff';
  ctx.fillRect(x - s * .50, y - s * .68, s * .18, s * .20);
  ctx.fillRect(x + s * .32, y - s * .68, s * .18, s * .20);
  ctx.fillStyle = '#221535';
  ctx.fillRect(x - s * .08, y - s * .67, s * .16, s * .10);
  ctx.fillStyle = '#6f59ac';
  ctx.fillRect(x - s * .27, y - s * .02, s * .54, s * .18);
  ctx.fillStyle = meta.eye;
  ctx.fillRect(x - s * .17, y - s * .32, s * .11, s * .11);
  ctx.fillRect(x + s * .06, y - s * .32, s * .11, s * .11);
  ctx.fillStyle = '#2c1e44';
  ctx.fillRect(x - s * .61, y + s * .10, s * .18, s * .18);
  ctx.fillRect(x + s * .43, y + s * .10, s * .18, s * .18);
}

function drawSlowOverlay(ctx, x, y, s) {
  ctx.strokeStyle = PALETTE.frost;
  ctx.lineWidth = 3;
  ctx.strokeRect(Math.floor(x - s * .62), Math.floor(y - s * .62), Math.floor(s * 1.24), Math.floor(s * 1.24));
  ctx.fillStyle = 'rgba(142, 223, 240, .20)';
  ctx.fillRect(x - s * .44, y - s * .50, s * .88, s * .88);
  pixelDiamond(ctx, x + s * .45, y - s * .42, s * .12, '#dcfbff');
}

function drawEffects(ctx, content, state, m) {
  for (const ev of state.events ?? []) {
    if (ev.type === 'tower.fired') {
      const tower = state.towers.find(t => t.id === ev.towerId);
      const enemy = state.enemies.find(e => e.id === ev.targetId);
      if (!tower || !enemy) continue;
      const from = { x: (tower.tileX + .5) * m.cellW, y: (tower.tileY + .5) * m.cellH - m.tile * .20 };
      const to = enemyPx(enemy, content, m);
      const meta = TOWER_META[tower.typeId] ?? TOWER_META.arrow;
      if (tower.typeId === 'arrow') drawBolt(ctx, from, to, meta.color);
      else if (tower.typeId === 'burst') drawBlast(ctx, from, to, meta);
      else drawFrostBeam(ctx, from, to, meta);
    }
    if (ev.type === 'enemy.killed') {
      const enemy = state.enemies.find(e => e.id === ev.enemyId);
      if (enemy) {
        const p = enemyPx(enemy, content, m);
        pixelDiamond(ctx, p.x, p.y, m.tile * .18, '#ffe38a');
        ctx.fillStyle = 'rgba(255, 236, 166, .55)';
        ctx.fillRect(p.x - 18, p.y - 2, 36, 4);
        ctx.fillRect(p.x - 2, p.y - 18, 4, 36);
      }
    }
  }
}

function drawBolt(ctx, from, to, color) {
  ctx.strokeStyle = '#fff0a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.fillStyle = color;
  pixelDiamond(ctx, to.x, to.y, 6, color);
}

function drawBlast(ctx, from, to, meta) {
  ctx.strokeStyle = meta.color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 209, 123, .78)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(to.x, to.y, 28, 0, Math.PI * 2);
  ctx.stroke();
  pixelDiamond(ctx, to.x, to.y, 13, '#ffd17b');
}

function drawFrostBeam(ctx, from, to, meta) {
  ctx.strokeStyle = 'rgba(220, 251, 255, .75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.strokeStyle = meta.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x - 5, from.y);
  ctx.lineTo(to.x + 5, to.y);
  ctx.stroke();
  pixelDiamond(ctx, to.x, to.y, 9, meta.trim);
}

function drawHover(ctx, content, state, ui, m) {
  if (!ui.hover) return;
  const ok = ui.buildType && canPlaceTower(state, ui.hover.x, ui.hover.y, content).ok;
  const x = ui.hover.x * m.cellW, y = ui.hover.y * m.cellH;
  ctx.fillStyle = ok ? PALETTE.valid : PALETTE.invalid;
  ctx.fillRect(x + 5, y + 5, m.cellW - 10, m.cellH - 10);
  ctx.strokeStyle = ok ? '#c8f59d' : '#ff9a85';
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 8, y + 8, m.cellW - 16, m.cellH - 16);
  if (ok) {
    ctx.fillStyle = 'rgba(255, 244, 188, .55)';
    pixelDiamond(ctx, x + m.cellW / 2, y + m.cellH / 2, 12, 'rgba(255, 244, 188, .55)');
  }
}

function drawHealth(ctx, x, y, w, h, pct) {
  ctx.fillStyle = '#120c10';
  ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = PALETTE.hpBack;
  ctx.fillRect(x - w / 2, y, w, h);
  ctx.fillStyle = PALETTE.hp;
  ctx.fillRect(x - w / 2 + 1, y + 1, Math.max(0, (w - 2) * pct), h - 2);
  ctx.fillStyle = 'rgba(244, 231, 191, .25)';
  ctx.fillRect(x - w / 2 + 1, y + 1, Math.max(0, (w - 2) * pct), 1);
}

function drawMapFrame(ctx, canvas) {
  ctx.strokeStyle = '#20150f';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  ctx.strokeStyle = '#8b6434';
  ctx.lineWidth = 6;
  ctx.strokeRect(13, 13, canvas.width - 26, canvas.height - 26);
  ctx.strokeStyle = '#d4b374';
  ctx.lineWidth = 2;
  ctx.strokeRect(21, 21, canvas.width - 42, canvas.height - 42);
  for (const [x, y] of [[24, 24], [canvas.width - 24, 24], [24, canvas.height - 24], [canvas.width - 24, canvas.height - 24]]) {
    if (!drawSprite(ctx, 'uiCorner', x - 8, y - 8, 16, 16)) {
      pixelDiamond(ctx, x, y, 8, '#d4b374');
      pixelDiamond(ctx, x, y, 4, '#4b3320');
    }
  }
}

function drawResult(ctx, canvas, outcome) {
  ctx.fillStyle = 'rgba(16, 10, 8, .72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2b1d15';
  ctx.fillRect(canvas.width / 2 - 185, canvas.height / 2 - 56, 370, 112);
  ctx.strokeStyle = '#d4b374';
  ctx.lineWidth = 4;
  ctx.strokeRect(canvas.width / 2 - 178, canvas.height / 2 - 49, 356, 98);
  ctx.fillStyle = outcome === 'win' ? '#a9ee8f' : '#e67861';
  ctx.font = 'bold 58px ui-monospace, monospace';
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

function makeArtAtlas() {
  if (typeof Image === 'undefined') return { image: null };
  const image = new Image();
  image.src = './assets/art-v1/lil8td-art-v1.png';
  return { image };
}

function sprite(x, y, w, h) {
  return { x: x * ART_SCALE, y: y * ART_SCALE, w: w * ART_SCALE, h: h * ART_SCALE };
}

function drawSprite(ctx, name, x, y, w, h) {
  const image = ART_ATLAS.image;
  const s = ART_SPRITES[name];
  if (!image || !s || !image.complete || image.naturalWidth === 0) return false;
  ctx.drawImage(image, s.x, s.y, s.w, s.h, Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
  return true;
}

function hash(x, y) {
  let n = (x + 11) * 374761393 + (y + 17) * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return Math.abs(n ^ (n >> 16));
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
