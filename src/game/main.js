// Lil8TD browser shell: screens, input, fixed-tick loop, HUD, audio cues.
// The human always plays slot 0; the AI bot plays slot 1 in versus. The title screen runs an
// attract-mode bot-vs-bot match behind the menu.
import { indexContent } from '../sim/content.js';
import { createMatch, step, canPlaceTower, pressureBlockReason, sellValue, auraBonusPercent } from '../sim/sim.js';
import { createBot, botCommands, BOT_PROFILES } from '../ai/bot.js';
import { makeRenderer, spriteCanvas, loadAtlas } from '../render/renderer.js';
import { makeFx } from '../render/fx.js';
import { makeAudio } from './audio.js';

const ruleset = await fetch('./content/ruleset.v0.json').then(r => r.json());
const content = indexContent(ruleset);
loadAtlas();

const $ = sel => document.querySelector(sel);
const canvas = $('#game');
const oppCanvas = $('#opp');
const renderer = makeRenderer(canvas, content);
const oppRenderer = makeRenderer(oppCanvas, content, { mini: true });
const fx = makeFx(content);
const audio = makeAudio();
const TICK_MS = content.constants.tickMs;
const HOTKEYS = ['1', '2', '3', '4', '5'];
const PRESSURE_KEYS = ['z', 'x', 'c'];
const PACK_ORDER = ['grunt_squad', 'runner_rush', 'brute_drop'];
const REASON_TEXT = { locked: 'locked', cooldown: 'cooldown', queue_full: 'queued', insufficient_resources: 'need credits', opponent_collapsed: 'done', no_opponent: 'solo' };

let difficulty = 'normal';
try { difficulty = localStorage.getItem('lil8td.diff') ?? 'normal'; } catch { /* storage unavailable */ }
if (!BOT_PROFILES[difficulty]) difficulty = 'normal';

const app = {
  screen: 'title',        // title | howto | playing | result
  mode: 'versus',         // versus | solo | attract
  match: null, bots: [], seq: 1, pending: [],
  ui: { buildType: null, selectedTowerId: null, hover: null },
  paused: false, speed: 1, acc: 0, last: performance.now(), lastPointerType: null,
  hudKey: '', panelKey: '', pressureKey: '', threatKey: '',
  bannerUntil: 0, alertUntil: 0, resultShown: false, seed: 'demo'
};

// ---------------------------------------------------------------- match lifecycle

function newMatch(mode) {
  app.mode = mode;
  app.seed = mode === 'attract' ? 'attract' : `demo-${Date.now() % 100000}`;
  app.match = createMatch(content, { players: mode === 'solo' ? 1 : 2, seed: app.seed });
  app.bots = mode === 'attract'
    ? [createBot({ slot: 0, difficulty: 'normal', seed: app.seed }), createBot({ slot: 1, difficulty: 'hard', seed: app.seed })]
    : mode === 'versus' ? [createBot({ slot: 1, difficulty, seed: app.seed })] : [];
  app.pending = []; app.seq = 1; app.acc = 0; app.resultShown = false;
  app.ui = { buildType: null, selectedTowerId: null, hover: null };
  app.paused = false; app.speed = 1;
  fx.clear();
  document.body.classList.toggle('solo', mode === 'solo');
  $('#modeLabel').textContent = mode === 'solo' ? 'Practice' : mode === 'attract' ? 'Tiny Tower Duel' : `vs AI · ${BOT_PROFILES[difficulty].label}`;
  $('#oppName').textContent = mode === 'versus' ? `${BOT_PROFILES[difficulty].label} · ${BOT_PROFILES[difficulty].personality}` : mode === 'attract' ? 'demo' : '';
  app.hudKey = app.panelKey = app.pressureKey = app.threatKey = '';
  hideBanner(); $('#alert').hidden = true;
  updateSpeedBtn(); updatePauseBtn();
  renderTowerButtons();
}

function tickOnce() {
  const m = app.match;
  const cmds = app.pending.splice(0);
  for (const bot of app.bots) cmds.push(...botCommands(bot, m, content));
  app.match = step(m, cmds, content);
  onEvents(app.match);
}

// ---------------------------------------------------------------- events -> fx, sound, banners

function onEvents(m) {
  const now = performance.now();
  fx.ingest(m, now);
  if (app.mode === 'attract') return;
  for (const ev of m.events) {
    const mine = ev.slot === 0;
    switch (ev.type) {
      case 'wave.start': showWaveBanner(ev); audio.play('wave'); break;
      case 'tower.fired': if (mine) audio.play(ev.towerType); break;
      case 'enemy.killed': if (mine) audio.play(ev.enemyType === 'brute' || ev.enemyType === 'warlord' ? 'bigKill' : 'kill'); break;
      case 'enemy.shieldBroken': if (mine) audio.play('shield'); break;
      case 'enemy.leaked': if (mine) { audio.play('leak'); flashBoard(); } break;
      case 'tower.built': if (mine) audio.play('build'); break;
      case 'tower.upgraded': if (mine) audio.play('upgrade'); break;
      case 'tower.sold': if (mine) audio.play('sell'); break;
      case 'command.rejected': if (mine) audio.play('deny'); break;
      case 'pressure.sent':
        if (mine) { audio.play('send'); showAlert(`Sent ${content.pressurePacks[ev.packId].name} → AI`, 'sent'); }
        else { audio.play('incoming'); showAlert(`⚠ Incoming: ${content.pressurePacks[ev.packId].name} in ${Math.round((ev.deliverTick - m.tick) * TICK_MS / 1000)}s`, 'danger'); }
        break;
      default: break;
    }
  }
  if (m.result && !app.resultShown) { app.resultShown = true; setTimeout(showResult, 1400); }
}

function showWaveBanner(ev) {
  const wave = content.waves[ev.waveIndex];
  const el = $('#banner');
  const counts = summarizeWave(wave);
  el.innerHTML = `<div class="bWave">Wave ${ev.waveIndex + 1}<span>/${content.waves.length}</span></div><div class="bName">${wave.template}</div><div class="bIcons"></div>${ev.payout ? `<div class="bPay">+${ev.payout} credits</div>` : ''}`;
  const icons = el.querySelector('.bIcons');
  for (const [id, n] of counts) { const s = document.createElement('span'); s.appendChild(spriteCanvas(id, 28, 28)); s.append(`×${n}`); icons.appendChild(s); }
  el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  app.bannerUntil = performance.now() + 2600;
}
function hideBanner() { $('#banner').hidden = true; app.bannerUntil = 0; }
function showAlert(text, kind) {
  const el = $('#alert'); el.textContent = text; el.className = `alert ${kind}`; el.hidden = false;
  app.alertUntil = performance.now() + 2600;
}
function flashBoard() { const w = $('.boardWrap'); w.classList.remove('hurt'); void w.offsetWidth; w.classList.add('hurt'); }

function summarizeWave(wave) {
  const counts = new Map();
  for (const g of wave.groups) counts.set(g.enemyId, (counts.get(g.enemyId) ?? 0) + g.count);
  return [...counts];
}

// ---------------------------------------------------------------- commands from the human

function queue(cmd) {
  if (app.mode === 'attract' || app.match.result) return;
  app.pending.push({ ...cmd, playerSlot: 0, clientCommandSeq: app.seq++ });
  if (app.paused) tickOnce(); // building while paused applies immediately (one tick)
}
function myBoard() { return app.match.boards[0]; }

function selectBuild(type) {
  if (app.mode === 'attract') return;
  app.ui.buildType = app.ui.buildType === type ? null : type;
  app.ui.selectedTowerId = null;
  audio.play('click');
  app.panelKey = '';
  renderTowerButtons();
}

function tryUpgrade() {
  const t = myBoard().towers.find(x => x.id === app.ui.selectedTowerId);
  if (t) queue({ type: 'tower.upgrade', towerId: t.id });
}
function trySell() {
  const t = myBoard().towers.find(x => x.id === app.ui.selectedTowerId);
  if (t) { queue({ type: 'tower.sell', towerId: t.id }); app.ui.selectedTowerId = null; app.panelKey = ''; }
}
function trySend(packId) {
  if (app.mode !== 'versus') return;
  const why = pressureBlockReason(app.match, 0, packId, content);
  if (why) { audio.play('deny'); return; }
  queue({ type: 'pressure.send', packId });
}

function onBoardPointer(evt) {
  if (app.screen !== 'playing') return;
  audio.unlock();
  const tile = renderer.tileAt(evt);
  if (!tile) return;
  const b = myBoard();
  const tower = b.towers.find(t => t.tileX === tile.x && t.tileY === tile.y);
  if (tower) {
    app.ui.selectedTowerId = app.ui.selectedTowerId === tower.id ? null : tower.id;
    app.ui.buildType = null; app.panelKey = ''; renderTowerButtons(); audio.play('click');
    return;
  }
  if (app.ui.buildType) {
    const place = canPlaceTower(b, tile.x, tile.y, content);
    // touch: first tap previews the tower + range on that tile, second tap on the same tile builds
    if (app.lastPointerType !== 'mouse' && !(app.ui.hover && app.ui.hover.x === tile.x && app.ui.hover.y === tile.y)) {
      app.ui.hover = tile; audio.play('click'); return;
    }
    if (place.ok && b.currency >= content.towers[app.ui.buildType].buildCost) {
      queue({ type: 'tower.build', towerType: app.ui.buildType, x: tile.x, y: tile.y });
      if (app.lastPointerType !== 'mouse') app.ui.hover = null;
      // keep the build tool armed for quick repeated placement (desktop), like classic TDs
    } else audio.play('deny');
    return;
  }
  if (app.ui.selectedTowerId) { app.ui.selectedTowerId = null; app.panelKey = ''; }
}

canvas.addEventListener('pointerdown', e => { app.lastPointerType = e.pointerType || 'mouse'; });
canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') app.ui.hover = renderer.tileAt(e); });
canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') app.ui.hover = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden && app.screen === 'playing' && !app.paused) { app.paused = true; updatePauseBtn(); } });
canvas.addEventListener('click', onBoardPointer);
canvas.addEventListener('contextmenu', e => { e.preventDefault(); cancelTool(); });

function cancelTool() {
  if (app.ui.buildType || app.ui.selectedTowerId) { app.ui.buildType = null; app.ui.selectedTowerId = null; app.panelKey = ''; renderTowerButtons(); return true; }
  return false;
}

document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (app.screen === 'howto' && (k === 'escape' || k === 'enter')) { showScreen('title'); return; }
  if (app.screen === 'title' && k === 'escape' && matchInProgress()) { $('#resumeBtn').click(); return; }
  if (app.screen !== 'playing') return;
  const ti = HOTKEYS.indexOf(k);
  if (ti >= 0 && content.towerOrder[ti]) { selectBuild(content.towerOrder[ti]); return; }
  const pi = PRESSURE_KEYS.indexOf(k);
  if (pi >= 0) { trySend(PACK_ORDER[pi]); return; }
  if (k === 'u') tryUpgrade();
  else if (k === 's') trySell();
  else if (k === ' ') { e.preventDefault(); togglePause(); }
  else if (k === 'f') toggleSpeed();
  else if (k === 'm') toggleMute();
  else if (k === 'escape') { if (!cancelTool()) openMenu(); }
});

// ---------------------------------------------------------------- top controls

function togglePause() { app.paused = !app.paused; updatePauseBtn(); }
function updatePauseBtn() { $('#pauseBtn').innerHTML = app.paused ? '&#9654;' : '&#10074;&#10074;'; $('#pausedTag').hidden = !app.paused || app.screen !== 'playing'; }
function toggleSpeed() { app.speed = app.speed === 1 ? 2 : app.speed === 2 ? 3 : 1; updateSpeedBtn(); }
function updateSpeedBtn() { $('#speedBtn').textContent = `${app.speed}x`; }
function toggleMute() { const m = audio.toggleMute(); $('#muteBtn').classList.toggle('off', m); }
function openMenu() { app.paused = true; updatePauseBtn(); showScreen('title'); }
$('#pauseBtn').onclick = () => { audio.unlock(); togglePause(); };
$('#speedBtn').onclick = () => { audio.unlock(); toggleSpeed(); };
$('#muteBtn').onclick = toggleMute;
$('#muteBtn').classList.toggle('off', audio.muted);
$('#menuBtn').onclick = openMenu;

// ---------------------------------------------------------------- side panel

function renderTowerButtons() {
  const wrap = $('#towerButtons');
  if (!wrap.children.length) {
    content.towerOrder.forEach((id, i) => {
      const t = content.towers[id];
      const b = document.createElement('button');
      b.className = 'towerBtn'; b.dataset.tower = id; b.title = `${t.name}: ${t.blurb}`;
      b.appendChild(spriteCanvas(id, 40, 56));
      const meta = document.createElement('span'); meta.className = 'meta';
      meta.innerHTML = `<b>${t.short}</b><span class="cost">&#9670;${t.buildCost}</span><kbd>${HOTKEYS[i]}</kbd>`;
      b.appendChild(meta);
      b.onclick = () => { audio.unlock(); selectBuild(id); };
      wrap.appendChild(b);
    });
  }
  const cur = app.match ? myBoard().currency : 0;
  for (const b of wrap.children) {
    b.classList.toggle('active', app.ui.buildType === b.dataset.tower);
    b.classList.toggle('poor', cur < content.towers[b.dataset.tower].buildCost);
  }
}

function statLine(lvl) {
  if (lvl.attackType === 'aura') return `<span>Aura</span><b>+${lvl.auraDamagePercent}% dmg</b><span>Radius</span><b>${(lvl.rangeUnits / 1000).toFixed(1)}</b>`;
  const rate = (20 / lvl.cooldownTicks).toFixed(1);
  let extra = '';
  if (lvl.splashRadiusUnits) extra = `<span>Splash</span><b>${(lvl.splashRadiusUnits / 1000).toFixed(1)}</b>`;
  if (lvl.slowPercent) extra = `<span>Slow</span><b>${lvl.slowPercent}%</b>`;
  return `<span>Damage</span><b>${lvl.damage}</b><span>Shots/s</span><b>${rate}</b><span>Range</span><b>${(lvl.rangeUnits / 1000).toFixed(1)}</b>${extra}`;
}

function renderSelected() {
  const b = myBoard();
  const t = b.towers.find(x => x.id === app.ui.selectedTowerId);
  const el = $('#selectedPanel');
  let key;
  if (t) {
    const def = content.towers[t.typeId]; const lvl = def.levels[t.level - 1]; const next = def.levels[t.level];
    const canUp = lvl.upgradeCost != null && b.currency >= lvl.upgradeCost;
    const aura = auraBonusPercent(b, t, content);
    key = `t|${t.id}|${t.level}|${canUp}|${t.kills}|${aura}|${sellValue(t, content)}`;
    if (key === app.panelKey) return;
    el.className = 'selected';
    el.innerHTML = `<div class="selHead"><span class="selIcon"></span><div><b>${def.name}</b> <span class="lvl">Lv ${t.level}</span><div class="muted small">${def.blurb}</div></div></div>
      <div class="stats2">${statLine(lvl)}</div>
      ${next ? `<div class="next small">Next: ${next.attackType === 'aura' ? `+${next.auraDamagePercent}% aura` : `${next.damage} dmg, ${(20 / next.cooldownTicks).toFixed(1)}/s, range ${(next.rangeUnits / 1000).toFixed(1)}`}</div>` : '<div class="next small">Max level</div>'}
      <div class="small muted">Kills ${t.kills}${aura ? ` · <span class="teal">Beacon +${aura}%</span>` : ''}</div>
      <div class="selBtns"><button id="upBtn" ${canUp ? '' : 'disabled'}>${lvl.upgradeCost == null ? 'Max level' : `Upgrade &#9670;${lvl.upgradeCost}`}</button><button id="sellBtn" class="sell">Sell +${sellValue(t, content)}</button></div>`;
    el.querySelector('.selIcon').appendChild(spriteCanvas(t.typeId, 36, 50));
    el.querySelector('#upBtn').onclick = tryUpgrade;
    el.querySelector('#sellBtn').onclick = trySell;
  } else if (app.ui.buildType) {
    const def = content.towers[app.ui.buildType];
    key = `b|${def.id}`;
    if (key === app.panelKey) return;
    el.className = 'selected';
    el.innerHTML = `<div class="selHead"><span class="selIcon"></span><div><b>${def.name}</b> <span class="lvl">&#9670;${def.buildCost}</span><div class="muted small">${def.blurb}</div></div></div><div class="stats2">${statLine(def.levels[0])}</div><div class="small muted">${app.lastPointerType && app.lastPointerType !== 'mouse' ? 'Tap a grass tile to preview, tap again to build.' : 'Click a grass tile to build. Right-click / Esc to cancel.'}</div>`;
    el.querySelector('.selIcon').appendChild(spriteCanvas(def.id, 36, 50));
  } else {
    key = 'none';
    if (key === app.panelKey) return;
    el.className = 'selected muted';
    el.innerHTML = 'Pick a tower, then tap a grass tile. Tap a built tower to upgrade or sell it.';
  }
  app.panelKey = key;
}

function renderPressure() {
  const wrap = $('#pressureButtons');
  if (app.mode !== 'versus') { if (app.pressureKey !== 'off') { wrap.innerHTML = ''; app.pressureKey = 'off'; } return; }
  const m = app.match;
  const states = PACK_ORDER.map(id => {
    const why = pressureBlockReason(m, 0, id, content);
    const ready = myBoard().pressureReadyTick[id] ?? 0;
    const cd = why === 'cooldown' ? Math.ceil((ready - m.tick) * TICK_MS / 1000) : 0;
    return { id, why, cd };
  });
  const key = JSON.stringify(states);
  if (key === app.pressureKey) return;
  app.pressureKey = key;
  if (!wrap.children.length) {
    PACK_ORDER.forEach((id, i) => {
      const p = content.pressurePacks[id]; const g = p.delivery.groups[0];
      const b = document.createElement('button'); b.className = 'packBtn'; b.dataset.pack = id;
      b.title = `${p.name}: ${g.count} ${content.enemies[g.enemyId].name}s, arrives ${p.windupTicks * TICK_MS / 1000}s after sending. Unlocks once wave ${p.unlockAtWaveIndex + 1} starts.`;
      b.appendChild(spriteCanvas(g.enemyId, 30, 30));
      const meta = document.createElement('span'); meta.className = 'meta';
      meta.innerHTML = `<b>${p.short} ×${g.count}</b><span class="cost">&#9670;${p.costCredits}</span><span class="state"></span><kbd>${PRESSURE_KEYS[i].toUpperCase()}</kbd>`;
      b.appendChild(meta);
      b.onclick = () => { audio.unlock(); trySend(id); };
      wrap.appendChild(b);
    });
  }
  states.forEach((s, i) => {
    const b = wrap.children[i];
    b.disabled = !!s.why;
    b.querySelector('.state').textContent = s.why ? (s.why === 'cooldown' ? `${s.cd}s` : s.why === 'locked' ? `wave ${content.pressurePacks[s.id].unlockAtWaveIndex + 1}+` : REASON_TEXT[s.why] ?? s.why) : 'ready';
    b.classList.toggle('ready', !s.why);
  });
}

function renderOpp() {
  const m = app.match;
  if (app.mode === 'solo') return;
  const b = m.boards[1];
  const bot = app.bots.find(x => x.slot === 1);
  $('#oppStats').innerHTML = `<span>&hearts; <b>${b.lives}</b></span><span>&#9670; <b>${b.currency}</b></span><span>Towers <b>${b.towers.length}</b></span><span class="intent">${bot ? `AI: ${bot.intent}${bot.posture !== 'stable' ? ` (${bot.posture})` : ''}` : ''}</span>`;
}

function renderThreats() {
  const m = app.match;
  const nw = content.waves[m.wavesStarted];
  const incoming = myBoard().incoming;
  const key = `${m.wavesStarted}|${incoming.map(p => `${p.id}:${Math.ceil((p.deliverTick - m.tick) * TICK_MS / 1000)}`).join(',')}|${nw ? Math.ceil((nw.startTick - m.tick) * TICK_MS / 1000) : -1}`;
  if (key === app.threatKey) return;
  app.threatKey = key;
  const nwEl = $('#nextWave');
  if (nw) {
    nwEl.innerHTML = `<span class="lbl">Next: <b>${nw.template}</b> in ${Math.max(0, Math.ceil((nw.startTick - m.tick) * TICK_MS / 1000))}s</span><span class="icons"></span>`;
    const icons = nwEl.querySelector('.icons');
    for (const [id, n] of summarizeWave(nw)) { const s = document.createElement('span'); s.title = content.enemies[id].name; s.appendChild(spriteCanvas(id, 22, 22)); s.append(`${n}`); icons.appendChild(s); }
  } else nwEl.innerHTML = `<span class="lbl">${m.result ? 'Match over' : 'Final wave — hold the keep!'}</span>`;
  const inEl = $('#incomingList');
  inEl.innerHTML = '';
  for (const p of incoming) {
    const pack = content.pressurePacks[p.packId];
    const secs = Math.max(0, Math.ceil((p.deliverTick - m.tick) * TICK_MS / 1000));
    const pct = 100 * (m.tick - p.sentTick) / Math.max(1, p.deliverTick - p.sentTick);
    const d = document.createElement('div'); d.className = 'inc';
    d.innerHTML = `<span>⚠ ${pack.name} ${secs}s</span><i style="width:${pct.toFixed(0)}%"></i>`;
    inEl.appendChild(d);
  }
}

function renderHud() {
  const m = app.match; const b = myBoard();
  const nw = content.waves[m.wavesStarted];
  const cur = content.waves[m.wavesStarted - 1];
  const key = `${m.wavesStarted}|${b.lives}|${b.currency}|${m.boards[1]?.lives}|${nw ? Math.ceil((nw.startTick - m.tick) * TICK_MS / 1000) : -1}`;
  if (key === app.hudKey) return;
  app.hudKey = key;
  $('#hudWave').textContent = `${m.wavesStarted}/${content.waves.length}`;
  $('#hudTemplate').textContent = cur ? cur.template : 'Prep';
  $('#hudNext').textContent = nw ? `${Math.max(0, Math.ceil((nw.startTick - m.tick) * TICK_MS / 1000))}s` : '—';
  $('#hudLives').textContent = b.lives;
  $('#hudLives').parentElement.classList.toggle('low', b.lives <= 5);
  $('#hudGold').textContent = b.currency;
  if (m.boards[1]) $('#hudOpp').textContent = m.boards[1].lives;
  $('#hudOppWrap').querySelector('.k').innerHTML = app.mode === 'attract' ? 'B &hearts;' : 'AI &hearts;';
  renderTowerButtons();
}

// ---------------------------------------------------------------- screens

function showScreen(name) {
  app.screen = name;
  for (const s of ['title', 'howto', 'result']) $(`#screen-${s}`).hidden = s !== name;
  document.body.dataset.screen = name;
  updatePauseBtn();
  if (name === 'title') {
    renderDiff();
    const live = matchInProgress();
    $('#resumeBtn').hidden = !live;
    $('#playBtn').classList.toggle('primary', !live);
    $('#playBtn').textContent = live ? '⚔ New battle vs AI' : '⚔ Battle vs AI';
  }
}

function renderDiff() {
  for (const b of document.querySelectorAll('.diffPick button')) { const on = b.dataset.diff === difficulty; b.classList.toggle('active', on); b.setAttribute('aria-checked', on); }
  const p = BOT_PROFILES[difficulty];
  const notes = { easy: 'Slow and cautious. Rarely sends raiders. Good first match.', normal: 'Plans its builds and punishes greedy boards with timed sends.', hard: 'Fast, efficient and aggressive. Lands sends on top of your waves.' };
  $('#diffNote').innerHTML = `<b>${p.personality}</b> — ${notes[difficulty]}`;
}
for (const b of document.querySelectorAll('.diffPick button')) b.onclick = () => { difficulty = b.dataset.diff; try { localStorage.setItem('lil8td.diff', difficulty); } catch { /* storage unavailable */ } audio.unlock(); audio.play('click'); renderDiff(); };

function startGame(mode) { audio.unlock(); audio.play('click'); newMatch(mode); showScreen('playing'); }
function matchInProgress() { return !!app.match && app.mode !== 'attract' && !app.match.result; }
$('#resumeBtn').onclick = () => { audio.play('click'); showScreen('playing'); app.paused = false; updatePauseBtn(); };
$('#playBtn').onclick = () => startGame('versus');
$('#soloBtn').onclick = () => startGame('solo');
$('#howBtn').onclick = () => { audio.unlock(); showScreen('howto'); };
$('#howBack').onclick = () => showScreen('title');
$('#rematchBtn').onclick = () => startGame(app.mode === 'solo' ? 'solo' : 'versus');
$('#resultMenuBtn').onclick = () => { newMatch('attract'); showScreen('title'); };
$('#versionTag').textContent = `ruleset ${content.ruleset.metadata.version}`;

function fillHowTo() {
  const tw = $('#howTowers');
  for (const id of content.towerOrder) {
    const t = content.towers[id]; const li = document.createElement('li');
    li.appendChild(spriteCanvas(id, 30, 42)); li.insertAdjacentHTML('beforeend', `<div><b>${t.name}</b> <span class="cost">&#9670;${t.buildCost}</span><br><span class="muted">${t.blurb}</span></div>`);
    tw.appendChild(li);
  }
  const en = $('#howEnemies');
  for (const e of content.ruleset.enemies) {
    const li = document.createElement('li');
    li.appendChild(spriteCanvas(e.id, 30, 30)); li.insertAdjacentHTML('beforeend', `<div><b>${e.name}</b> <span class="muted">♥${e.leakDamage}</span><br><span class="muted">${e.blurb}</span></div>`);
    en.appendChild(li);
  }
}

function showResult() {
  const m = app.match; const r = m.result;
  const me = m.boards[0], ai = m.boards[1];
  let title, cls, reason;
  if (app.mode === 'solo') {
    title = r.outcome === 'win' ? 'Keep held!' : 'Keep fallen'; cls = r.outcome === 'win' ? 'win' : 'loss';
    reason = r.outcome === 'win' ? `You survived all ${content.waves.length} waves with ${me.lives} lives left.` : `Your keep collapsed during wave ${m.wavesStarted}.`;
  } else if (r.outcome === 'draw') {
    title = 'Draw'; cls = 'draw'; reason = r.reason === 'double_collapse' ? 'Both keeps fell on the same tick.' : `Both sides finished with ${me.lives} lives.`;
  } else if (r.winnerSlot === 0) {
    title = 'Victory!'; cls = 'win';
    reason = r.reason === 'collapse' ? `The ${BOT_PROFILES[difficulty].label} AI's keep collapsed on wave ${m.wavesStarted}.` : `You outlasted the AI: ${me.lives} lives vs ${ai.lives}.`;
  } else {
    title = 'Defeat'; cls = 'loss';
    reason = r.reason === 'collapse' ? `Your keep collapsed on wave ${m.wavesStarted}. The AI had ${ai.lives} lives left.` : `The AI finished with more lives: ${ai.lives} vs ${me.lives}.`;
  }
  $('#resultTitle').textContent = title; $('#resultTitle').className = `resultTitle ${cls}`;
  $('#resultReason').textContent = reason;
  const rows = [['Lives left', b => b.lives], ['Raiders defeated', b => b.stats.kills], ['Leaks', b => b.stats.leaks], ['Towers built', b => b.stats.towersBuilt], ['Upgrades', b => b.stats.upgrades], ['Raider packs sent', b => b.stats.sends], ['Credits earned', b => b.stats.earned]];
  const cols = app.mode === 'solo' ? [me] : [me, ai];
  $('#resultStats').innerHTML = `<tr><th></th><th>You</th>${ai && app.mode !== 'solo' ? '<th>AI</th>' : ''}</tr>` + rows.map(([label, f]) => `<tr><td>${label}</td>${cols.map(b => `<td>${f(b)}</td>`).join('')}</tr>`).join('') + `<tr><td>Match time</td><td colspan="2">${Math.floor(m.tick * TICK_MS / 60000)}:${String(Math.floor(m.tick * TICK_MS / 1000) % 60).padStart(2, '0')}</td></tr>`;
  if (app.mode !== 'solo' || r.outcome) audio.play(cls === 'win' ? 'victory' : cls === 'loss' ? 'defeat' : 'click');
  showScreen('result');
}

// ---------------------------------------------------------------- loop

function frame(now) {
  const dt = Math.min(250, now - app.last); app.last = now;
  const running = app.match && !app.match.result && (app.screen === 'playing' ? !app.paused : app.mode === 'attract');
  if (running) {
    app.acc += dt * (app.screen === 'playing' ? app.speed : 1);
    let n = 0;
    while (app.acc >= TICK_MS && n < 12 && !app.match.result) { tickOnce(); app.acc -= TICK_MS; n++; }
    if (n === 12) app.acc = 0;
  }
  if (app.mode === 'attract' && app.match.result) newMatch('attract');
  const alpha = running ? Math.min(1, app.acc / TICK_MS) : 0;
  renderer.draw(app.match, 0, app.screen === 'playing' ? app.ui : {}, alpha, fx, now);
  if (app.mode !== 'solo') oppRenderer.draw(app.match, 1, {}, alpha, fx, now);
  renderHud(); renderSelected(); renderPressure(); renderOpp(); renderThreats();
  if (app.bannerUntil && now > app.bannerUntil) hideBanner();
  if (app.alertUntil && now > app.alertUntil) { $('#alert').hidden = true; app.alertUntil = 0; }
  requestAnimationFrame(frame);
}

fillHowTo();
newMatch('attract');
showScreen('title');
requestAnimationFrame(t => { app.last = t; frame(t); });

// Small debug/automation hook (used by the Playwright demo script); read-only access plus speed.
globalThis.lil8td = {
  get state() { return { screen: app.screen, mode: app.mode, tick: app.match.tick, result: app.match.result, wavesStarted: app.match.wavesStarted, me: { lives: myBoard().lives, currency: myBoard().currency, towers: myBoard().towers.length }, ai: app.match.boards[1] ? { lives: app.match.boards[1].lives, towers: app.match.boards[1].towers.length } : null }; },
  setSpeed(s) { app.speed = s; updateSpeedBtn(); },
  fastForward(ticks) { for (let i = 0; i < ticks && !app.match.result; i++) tickOnce(); }
};
