// Small deterministic PRNG (mulberry32) seeded from a string. Used by bots only;
// the authoritative simulation itself has no randomness.
export function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return h >>> 0;
}

export function makeRng(seed) {
  return { s: typeof seed === 'string' ? seedFromString(seed) : (seed >>> 0) };
}

export function nextFloat(rng) {
  let t = (rng.s = (rng.s + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextInt(rng, n) { return Math.floor(nextFloat(rng) * n); }
