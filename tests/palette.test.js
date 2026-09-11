import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { randomGenome, speciesGenome, validateGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { CLADE_IDS } from '../src/data/clades.js';
import { colorDistance, harmonizePalette, accentContrastOk, ACCENT_CONTRAST, jitterPalette } from '../src/creature/palette.js';

test('perceptual distance behaves', () => {
  assert.equal(colorDistance([20, 60, 50], [20, 60, 50]), 0);
  assert.ok(colorDistance([0, 0, 10], [0, 0, 90]) > 70, 'black to white is far');
  assert.ok(colorDistance([20, 60, 50], [22, 60, 51]) < 5, 'a tiny nudge is near');
  assert.ok(colorDistance([0, 90, 50], [120, 90, 50]) > 60, 'red to green is far');
});

test('harmonizePalette clears the thresholds with the smallest step and is idempotent', () => {
  const near = { c1: [30, 60, 50], c2: [35, 55, 45], c3: [32, 58, 52], eye: [200, 50, 40] };
  const out = harmonizePalette(near);
  assert.notEqual(out, near);
  assert.ok(accentContrastOk(out));
  assert.deepEqual(out.c1, near.c1); assert.deepEqual(out.c2, near.c2); assert.deepEqual(out.eye, near.eye);
  assert.ok(colorDistance(out.c3, near.c3) < 45, 'moved by a modest step');
  assert.equal(harmonizePalette(out), out, 'compliant palettes come back untouched');
  const fine = { c1: [30, 60, 50], c2: [200, 50, 40], c3: [120, 70, 45], eye: [0, 0, 0] };
  assert.equal(harmonizePalette(fine), fine);
  for (const pal of [
    { c1: [0, 0, 50], c2: [0, 0, 50], c3: [0, 0, 50], eye: [0, 0, 0] },
    { c1: [0, 0, 12], c2: [0, 0, 92], c3: [0, 0, 50], eye: [0, 0, 0] },
    { c1: [0, 100, 50], c2: [180, 100, 50], c3: [90, 100, 50], eye: [0, 0, 0] },
    { c1: [60, 100, 92], c2: [60, 100, 12], c3: [60, 8, 50], eye: [0, 0, 0] },
  ]) {
    const h = harmonizePalette(pal);
    assert.ok(accentContrastOk(h), JSON.stringify(pal));
    assert.deepEqual(harmonizePalette(h), h);
    assert.ok(h.c3.every(Number.isFinite));
  }
});

test('every rolled, fused and loaded creature has a readable accent', () => {
  for (let i = 0; i < 1500; i++) {
    const g = randomGenome(makeRng(`acc${i}`));
    assert.ok(accentContrastOk(g.palette), `wild ${i} ${g.species} ${JSON.stringify(g.palette)}`);
    assert.ok(colorDistance(g.palette.c3, g.palette.c1) >= ACCENT_CONTRAST.primary);
  }
  for (let i = 0; i < 200; i++) {
    const clade = CLADE_IDS[i % CLADE_IDS.length];
    const a = randomGenome(makeRng(`fa${i}`), { clade }), b = randomGenome(makeRng(`fb${i}`), { clade });
    const { child } = fuse(a, b, makeRng(`fc${i}`));
    assert.ok(accentContrastOk(child.palette), `fusion ${i}`);
  }
  // an old save with a muddy accent is repaired on load, and a repaired one is left alone
  const g = speciesGenome(SPECIES[0], makeRng('old'));
  g.palette = { ...g.palette, c3: g.palette.c1.slice() };
  const loaded = validateGenome(JSON.parse(JSON.stringify(g)));
  assert.ok(accentContrastOk(loaded.palette));
  assert.deepEqual(validateGenome(JSON.parse(JSON.stringify(loaded))).palette, loaded.palette);
});

test('most species palettes already comply, so the harmonizer rarely touches a roll', () => {
  let touched = 0, n = 0;
  for (const s of SPECIES) {
    for (let i = 0; i < 20; i++) {
      const pal = jitterPalette(s.palette, s.vary, makeRng(`j${s.id}${i}`).fork('palette'));
      n++;
      if (harmonizePalette(pal) !== pal) touched++;
    }
  }
  assert.ok(touched < n * 0.35, `harmonizer touched ${touched}/${n}`);
});
