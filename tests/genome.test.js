import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { slotsFor } from '../src/data/rigs.js';
import { speciesGenome, randomGenome, validateGenome, encodeGenome, decodeGenome, resolveParts, baseStats, STAT_KEYS, rigOf } from '../src/creature/genome.js';

test('species genomes are deterministic per seed', () => {
  for (const s of SPECIES) {
    const a = speciesGenome(s, makeRng('seed-1')), b = speciesGenome(s, makeRng('seed-1'));
    assert.deepEqual(a, b, s.id);
  }
});

test('random genomes validate and resolve on many seeds', () => {
  for (let i = 0; i < 400; i++) {
    const g = randomGenome(makeRng(`wild-${i}`));
    assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(g))), `seed ${i}`);
    const parts = resolveParts(g);
    assert.ok(parts.body && parts.eyes, `seed ${i} body/eyes`);
    for (const slot of slotsFor(rigOf(g))) assert.ok(slot in parts, `seed ${i} ${slot}`);
  }
});

test('creature codes round-trip', () => {
  const g = randomGenome(makeRng('codes'));
  const code = encodeGenome(g);
  assert.ok(code.startsWith('CC1.'));
  assert.deepEqual(decodeGenome(code), g);
  assert.throws(() => decodeGenome('nope'));
  assert.throws(() => decodeGenome('CC1.!!!!'));
  const broken = JSON.parse(JSON.stringify(g)); broken.parts.body = ['body.nothing', 'body.nothing'];
  assert.throws(() => validateGenome(broken));
});

test('base stats respect the budget', () => {
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('bst'));
    const b = baseStats(g);
    const total = STAT_KEYS.reduce((a, k) => a + b[k], 0);
    assert.ok(Math.abs(total - s.bst) <= 6, `${s.id} total ${total} vs ${s.bst}`);
    for (const k of STAT_KEYS) assert.ok(b[k] >= 20);
  }
});

test('mutations and shinies happen but stay rare', () => {
  let carriedMut = 0, shiny = 0, n = 2000;
  const s = SPECIES[0];
  for (let i = 0; i < n; i++) {
    const g = speciesGenome(s, makeRng(`m${i}`));
    if (g.shiny) shiny++;
    for (const slot of slotsFor(rigOf(g))) if (slot !== 'body') { const [e, c] = g.parts[slot]; if (e !== c && c !== [].concat(s.recipe[slot])[1] && c !== [].concat(s.recipe[slot])[0]) { carriedMut++; break; } }
  }
  assert.ok(shiny > 5 && shiny < 90, `shiny ${shiny}`);
  assert.ok(carriedMut > n * 0.3 && carriedMut < n * 0.95, `carried mutations ${carriedMut}`);
});
