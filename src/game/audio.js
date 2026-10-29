// Tiny WebAudio synth for Lil8TD: square/triangle chirps and noise bursts, no audio files.
// Created lazily on the first user gesture (browser autoplay rules). Rate-limited per sound so
// a busy wave never turns into a wall of noise.
export function makeAudio() {
  let ac = null, master = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('lil8td.muted') === '1'; } catch { /* storage unavailable */ }
  const lastPlayed = new Map();

  function ensure() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.22; master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); let s = 7;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    return true;
  }

  function tone({ type = 'square', f0 = 440, f1 = f0, dur = 0.08, vol = 0.3, delay = 0 }) {
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise({ dur = 0.12, vol = 0.3, freq = 1200, q = 1, delay = 0 }) {
    const t = ac.currentTime + delay;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
  }

  const SOUNDS = {
    arrow: () => tone({ type: 'triangle', f0: 1400, f1: 700, dur: 0.05, vol: 0.12 }),
    burst: () => { noise({ dur: 0.18, vol: 0.25, freq: 380, q: 0.8 }); tone({ type: 'square', f0: 140, f1: 60, dur: 0.14, vol: 0.12 }); },
    frost: () => tone({ type: 'sine', f0: 1800, f1: 2600, dur: 0.09, vol: 0.08 }),
    piercer: () => { tone({ type: 'sawtooth', f0: 520, f1: 160, dur: 0.16, vol: 0.12 }); noise({ dur: 0.08, vol: 0.12, freq: 3000, q: 2 }); },
    kill: () => tone({ type: 'square', f0: 660, f1: 990, dur: 0.06, vol: 0.08 }),
    bigKill: () => { tone({ type: 'square', f0: 330, f1: 990, dur: 0.22, vol: 0.14 }); noise({ dur: 0.25, vol: 0.18, freq: 600 }); },
    shield: () => { noise({ dur: 0.14, vol: 0.2, freq: 4200, q: 3 }); tone({ type: 'triangle', f0: 2200, f1: 1200, dur: 0.12, vol: 0.08 }); },
    leak: () => { tone({ type: 'square', f0: 180, f1: 90, dur: 0.25, vol: 0.2 }); noise({ dur: 0.2, vol: 0.15, freq: 200 }); },
    build: () => { noise({ dur: 0.08, vol: 0.2, freq: 900 }); tone({ type: 'square', f0: 330, f1: 330, dur: 0.06, vol: 0.1, delay: 0.04 }); },
    upgrade: () => [523, 659, 784].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.07, vol: 0.1, delay: i * 0.06 })),
    sell: () => [784, 523].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.07, vol: 0.12, delay: i * 0.06 })),
    deny: () => tone({ type: 'square', f0: 140, f1: 120, dur: 0.1, vol: 0.12 }),
    click: () => tone({ type: 'square', f0: 880, dur: 0.03, vol: 0.06 }),
    wave: () => [392, 392, 523].forEach((f, i) => tone({ type: 'sawtooth', f0: f, dur: i === 2 ? 0.3 : 0.1, vol: 0.12, delay: i * 0.12 })),
    send: () => { tone({ type: 'sawtooth', f0: 200, f1: 900, dur: 0.25, vol: 0.12 }); noise({ dur: 0.25, vol: 0.12, freq: 1500, q: 0.6 }); },
    incoming: () => [880, 660, 880, 660].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.07, vol: 0.09, delay: i * 0.09 })),
    victory: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone({ type: 'square', f0: f, dur: i === 5 ? 0.5 : 0.12, vol: 0.13, delay: i * 0.13 })),
    defeat: () => [392, 330, 262, 196].forEach((f, i) => tone({ type: 'triangle', f0: f, f1: f * 0.97, dur: i === 3 ? 0.6 : 0.2, vol: 0.16, delay: i * 0.22 }))
  };
  const MIN_GAP = { arrow: 70, burst: 90, frost: 90, piercer: 110, kill: 50, leak: 120, shield: 80 };

  return {
    unlock() { ensure(); },
    play(name) {
      if (muted || !SOUNDS[name] || !ensure()) return;
      const now = performance.now();
      if (now - (lastPlayed.get(name) ?? -1e9) < (MIN_GAP[name] ?? 30)) return;
      lastPlayed.set(name, now);
      try { SOUNDS[name](); } catch { /* audio is best-effort */ }
    },
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('lil8td.muted', muted ? '1' : '0'); } catch { /* storage unavailable */ }
      if (master) master.gain.value = muted ? 0 : 0.22;
      return muted;
    }
  };
}
