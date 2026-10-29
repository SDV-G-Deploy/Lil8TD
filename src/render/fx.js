// Client-side visual effects built from simulation events. Purely cosmetic: lives in wall-clock
// milliseconds, never feeds back into the sim. Positions are stored in lane units so the same
// effect can be drawn on the big board or the opponent mini-board.
import { pointAtProgress } from '../sim/map.js';

const SHOT_MS = { arrow: 140, burst: 240, frost: 150, piercer: 200 };
const COLORS = { arrow: '#fff0a8', burst: '#ffb15a', frost: '#dcfbff', piercer: '#ff5a72' };

export function makeFx(content) {
  const items = [];
  const towerUnits = t => ({ x: t.tileX * 1000 + 500, y: t.tileY * 1000 + 300 });
  const lanePt = progress => pointAtProgress(content.lane, progress);

  function ingest(match, now) {
    for (const ev of match.events) {
      if (ev.slot == null || ev.slot < 0) continue;
      const b = match.boards[ev.slot];
      if (!b) continue;
      switch (ev.type) {
        case 'tower.fired': {
          const t = b.towers.find(x => x.id === ev.towerId); if (!t) break;
          const to = lanePt(ev.targetProgress);
          items.push({ kind: 'shot', slot: ev.slot, tower: ev.towerType, from: towerUnits(t), to, t0: now, life: SHOT_MS[ev.towerType] ?? 150, buffed: ev.buffed });
          break;
        }
        case 'enemy.killed': {
          const p = lanePt(ev.progress);
          items.push({ kind: 'pop', slot: ev.slot, at: p, t0: now, life: 360, big: ev.enemyType === 'brute' || ev.enemyType === 'warlord' });
          if (ev.reward) items.push({ kind: 'text', slot: ev.slot, at: { x: p.x, y: p.y - 300 }, text: `+${ev.reward}`, color: '#ffe08a', t0: now, life: 800 });
          break;
        }
        case 'enemy.shieldBroken': items.push({ kind: 'shards', slot: ev.slot, at: lanePt(ev.progress), t0: now, life: 420 }); break;
        case 'enemy.leaked': {
          const p = lanePt(content.lane.length);
          items.push({ kind: 'leak', slot: ev.slot, at: p, t0: now, life: 500 });
          items.push({ kind: 'text', slot: ev.slot, at: { x: p.x - 300, y: p.y - 700 }, text: `-${ev.damage}♥`, color: '#ff7a6a', t0: now, life: 1000 });
          break;
        }
        case 'tower.built': items.push({ kind: 'dust', slot: ev.slot, at: { x: ev.x * 1000 + 500, y: ev.y * 1000 + 700 }, t0: now, life: 380 }); break;
        case 'tower.upgraded': items.push({ kind: 'sparkle', slot: ev.slot, at: { x: ev.x * 1000 + 500, y: ev.y * 1000 + 500 }, t0: now, life: 600 }); break;
        case 'tower.sold': items.push({ kind: 'text', slot: ev.slot, at: { x: ev.x * 1000 + 500, y: ev.y * 1000 + 200 }, text: `+${ev.refund}`, color: '#ffe08a', t0: now, life: 800 }); break;
        case 'pressure.arrived': items.push({ kind: 'rift', slot: ev.slot, at: lanePt(0), t0: now, life: 900 }); break;
        default: break;
      }
    }
    if (items.length > 600) items.splice(0, items.length - 600);
  }

  function draw(ctx, slot, m, now) {
    const px = u => ({ x: m.ox + u.x / 1000 * m.cell, y: m.oy + u.y / 1000 * m.cell });
    const k = m.cell / 80;
    for (let i = items.length - 1; i >= 0; i--) if (now - items[i].t0 > items[i].life) items.splice(i, 1);
    for (const it of items) {
      if (it.slot !== slot) continue;
      const age = (now - it.t0) / it.life; if (age < 0) continue;
      if (it.kind === 'shot') drawShot(ctx, it, px(it.from), px(it.to), age, k);
      else if (it.kind === 'pop') { const p = px(it.at); const r = (8 + 22 * age) * k * (it.big ? 2 : 1); ctx.globalAlpha = 1 - age; diamond(ctx, p.x, p.y, r, '#ffe38a'); diamond(ctx, p.x, p.y, r * .45, '#fff8d8'); ctx.globalAlpha = 1; }
      else if (it.kind === 'text') { const p = px(it.at); ctx.globalAlpha = Math.min(1, 2 - age * 2); ctx.font = `bold ${Math.round(18 * k)}px ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a0f0a'; ctx.fillText(it.text, p.x + 2, p.y - age * 30 * k + 2); ctx.fillStyle = it.color; ctx.fillText(it.text, p.x, p.y - age * 30 * k); ctx.globalAlpha = 1; }
      else if (it.kind === 'leak') { const p = px(it.at); ctx.globalAlpha = 1 - age; ctx.strokeStyle = '#ff5a4a'; ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.arc(p.x, p.y - 20 * k, (20 + 40 * age) * k, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
      else if (it.kind === 'dust') { const p = px(it.at); ctx.globalAlpha = (1 - age) * .8; ctx.fillStyle = '#d8bf83'; for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; ctx.fillRect(p.x + Math.cos(a) * 30 * age * k * 1.4, p.y + Math.sin(a) * 10 * age * k, 5 * k, 5 * k); } ctx.globalAlpha = 1; }
      else if (it.kind === 'sparkle') { const p = px(it.at); ctx.globalAlpha = 1 - age; for (let j = 0; j < 5; j++) diamond(ctx, p.x + (j - 2) * 12 * k, p.y + 20 * k - age * 70 * k - (j % 2) * 12 * k, 5 * k, j % 2 ? '#ffe08a' : '#fff8d8'); ctx.globalAlpha = 1; }
      else if (it.kind === 'shards') { const p = px(it.at); ctx.globalAlpha = 1 - age; for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 + .3; diamond(ctx, p.x + Math.cos(a) * 34 * age * k, p.y - 10 * k + Math.sin(a) * 26 * age * k, 5 * k, '#cfe3ff'); } ctx.globalAlpha = 1; }
      else if (it.kind === 'rift') { const p = px(it.at); ctx.globalAlpha = 1 - age; ctx.strokeStyle = '#e0294a'; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.arc(p.x, p.y, (16 + 50 * age) * k, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#3fe0c5'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(p.x, p.y, (10 + 34 * age) * k, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    }
  }

  function clear() { items.length = 0; }
  return { ingest, draw, clear };
}

function diamond(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); }

function drawShot(ctx, it, a, b, age, k) {
  const col = COLORS[it.tower] ?? '#fff';
  if (it.tower === 'arrow') {
    // a bolt travelling along the line
    const t = Math.min(1, age * 1.4); const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.strokeStyle = 'rgba(40,24,10,.6)'; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * 16 * k, y - Math.sin(ang) * 16 * k + 2); ctx.lineTo(x, y + 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * 16 * k, y - Math.sin(ang) * 16 * k); ctx.lineTo(x, y); ctx.stroke();
    if (age > .7) diamond(ctx, b.x, b.y, 6 * k, '#ffe680');
  } else if (it.tower === 'burst') {
    // lobbed shell then explosion ring
    if (age < .55) {
      const t = age / .55; const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 40 * k;
      diamond(ctx, x, y, 7 * k, '#2a1510'); diamond(ctx, x, y, 4 * k, '#ff6f2d');
    } else {
      const t = (age - .55) / .45; ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = col; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.arc(b.x, b.y, (10 + 46 * t) * k, 0, Math.PI * 2); ctx.stroke();
      diamond(ctx, b.x, b.y, (16 - 10 * t) * k, '#ffd17b'); diamond(ctx, b.x, b.y, (8 - 5 * t) * k, '#ff6f2d');
      ctx.globalAlpha = 1;
    }
  } else if (it.tower === 'frost') {
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = 'rgba(20,52,70,.5)'; ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.moveTo(a.x, a.y + 2); ctx.lineTo(b.x, b.y + 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    diamond(ctx, b.x, b.y, 9 * k, '#8edff0'); ctx.globalAlpha = 1;
  } else if (it.tower === 'piercer') {
    ctx.globalAlpha = 1 - age * .8;
    ctx.strokeStyle = 'rgba(60,8,20,.6)'; ctx.lineWidth = 8 * k; ctx.beginPath(); ctx.moveTo(a.x, a.y + 2); ctx.lineTo(b.x, b.y + 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = '#ffe0e6'; ctx.lineWidth = 1.5 * k; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    diamond(ctx, b.x, b.y, 10 * k, '#ff5a72'); ctx.globalAlpha = 1;
  }
  if (it.buffed && age < .3) { ctx.globalAlpha = .7; diamond(ctx, a.x, a.y - 6 * k, 6 * k, '#3fe0c5'); ctx.globalAlpha = 1; }
}
