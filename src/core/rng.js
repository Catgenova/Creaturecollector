// Seeded random numbers. Every roll in the game goes through here so that a
// creature, a fusion, or a whole battle can be reproduced from its seed.
// Hash: cyrb128. Generator: sfc32. Both are small, fast and well distributed.

export function hashSeed(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function sfc32(a, b, c, d) {
  return function next() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Create a deterministic RNG from any string or number seed. */
export function makeRng(seed) {
  const seedStr = String(seed);
  const [a, b, c, d] = hashSeed(seedStr);
  const next = sfc32(a, b, c, d);
  for (let i = 0; i < 12; i++) next(); // warm up
  const rng = {
    seed: seedStr,
    /** float in [0,1) */
    next,
    /** integer in [0,n) */
    int(n) { return Math.floor(next() * n); },
    /** integer in [lo,hi] inclusive */
    between(lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
    /** float in [lo,hi) */
    range(lo, hi) { return lo + next() * (hi - lo); },
    /** true with probability p */
    chance(p) { return next() < p; },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    /** pick by weight; weightOf(item) must return a number >= 0 */
    weighted(items, weightOf) {
      let total = 0;
      for (const it of items) total += weightOf(it);
      if (total <= 0) return items[Math.floor(next() * items.length)];
      let r = next() * total;
      for (const it of items) { r -= weightOf(it); if (r < 0) return it; }
      return items[items.length - 1];
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    /** approx. normal(0,1) via sum of uniforms, cheap and good enough for trait jitter */
    gauss() { return (next() + next() + next() + next() - 2) * Math.SQRT2 * 0.5 * 1.4142; },
    /**
     * Derive an independent stream from a label. Depends only on the parent's
     * seed and the label, never on how many numbers were drawn, so call order
     * does not matter. Labels must be unique per parent.
     */
    fork(label) { return makeRng(seedStr + '/' + label); },
  };
  return rng;
}

/** The one place non-deterministic randomness is allowed: minting fresh seeds from the UI. */
export function freshSeed() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    for (const b of buf) s += alphabet[b % alphabet.length];
  } else {
    for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}
