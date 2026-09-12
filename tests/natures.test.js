import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { NATURES, NATURE_IDS, NATURE_STATS, NATURE_RULE, DEFAULT_NATURE, natureMul, natureLabel, getNature } from '../src/data/natures.js';
import { STAT_KEYS } from '../src/data/damage.js';
import { speciesGenome, validateGenome, randomGenome, decodeGenome, encodeGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { statsAtLevel } from '../src/battle/stats.js';

test('forty-nine natures: every lifted and lowered pairing once, seven even ones, unique names', () => {
  assert.equal(NATURE_IDS.length, 49);
  assert.equal(new Set(Object.values(NATURES).map((n) => n.name)).size, 49);
  const pairs = new Set();
  let even = 0;
  for (const n of Object.values(NATURES)) {
    assert.equal(n.id, n.name.toLowerCase());
    if (!n.up) { even++; assert.equal(n.down, null); continue; }
    assert.ok(NATURE_STATS.includes(n.up) && NATURE_STATS.includes(n.down) && n.up !== n.down, n.id);
    pairs.add(`${n.up}>${n.down}`);
  }
  assert.equal(even, 7);
  assert.equal(pairs.size, 42);
  for (const up of NATURE_STATS) assert.equal(Object.values(NATURES).filter((n) => n.up === up).length, 6, `${up} lifted by six natures`);
  assert.equal(natureMul('brash', 'melee'), NATURE_RULE.up);
  assert.equal(natureMul('brash', 'ranged'), NATURE_RULE.down);
  assert.equal(natureMul('brash', 'spe'), 1);
  assert.equal(natureMul('even', 'melee'), 1);
  assert.equal(natureMul('nope', 'melee'), 1);
  assert.ok(!Object.values(NATURES).some((n) => n.up === 'hp' || n.down === 'hp'), 'HP is never leaned');
  assert.equal(natureLabel('timid'), 'Timid (+Speed, −Melee Atk)');
  assert.equal(natureLabel('level'), 'Level (no lean)');
  assert.ok(getNature(DEFAULT_NATURE) && !getNature(DEFAULT_NATURE).up);
});

test('a nature lifts one level stat a tenth and lowers another, HP untouched; even natures change nothing', () => {
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('nat'));
  const at = (nature, level = 50) => statsAtLevel({ ...g, nature }, level);
  const even = at('even');
  assert.deepEqual(at('level'), even);
  assert.deepEqual(at(undefined), even, 'no nature reads as even');
  for (const n of Object.values(NATURES)) {
    if (!n.up) continue;
    const s = at(n.id);
    for (const k of STAT_KEYS) {
      const plain = Math.floor(Math.floor(((2 * Math.max(20, Math.round((g.bst || 400) * (g.stats[k] / Object.values(g.stats).reduce((a, b) => a + b, 0)))) + Math.round(g.vigor[k] * 31)) * 50) / 100) + 5);
      if (k === 'hp') assert.equal(s.hp, even.hp, `${n.id} hp`);
      else if (k === n.up) assert.equal(s[k], Math.floor(plain * NATURE_RULE.up), `${n.id} lifts ${k}`);
      else if (k === n.down) assert.equal(s[k], Math.floor(plain * NATURE_RULE.down), `${n.id} lowers ${k}`);
      else assert.equal(s[k], even[k], `${n.id} leaves ${k}`);
    }
  }
});

test('natures are rolled evenly, survive codes, default to even on old creatures, and pass down through fusion', () => {
  const counts = {};
  const N = 4900;
  for (let i = 0; i < N; i++) { const g = randomGenome(makeRng(`nature${i}`)); assert.ok(NATURES[g.nature], g.nature); counts[g.nature] = (counts[g.nature] || 0) + 1; }
  assert.equal(Object.keys(counts).length, 49, 'every nature turns up');
  for (const [id, n] of Object.entries(counts)) assert.ok(n > N / 49 * 0.5 && n < N / 49 * 1.7, `${id} ${n}`);
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('code'));
  assert.equal(decodeGenome(encodeGenome(g)).nature, g.nature);
  const old = JSON.parse(JSON.stringify(g)); delete old.nature;
  assert.equal(validateGenome(old).nature, DEFAULT_NATURE);
  assert.equal(validateGenome({ ...JSON.parse(JSON.stringify(g)), nature: 'grumpy' }).nature, DEFAULT_NATURE);
  const a = { ...g, nature: 'brash' }, b = { ...speciesGenome(SPECIES_BY_ID.glacub, makeRng('gl')), nature: 'timid' };
  let fromA = 0;
  for (let i = 0; i < 40; i++) { const { child } = fuse(a, b, makeRng(`nf${i}`)); assert.ok(child.nature === 'brash' || child.nature === 'timid', child.nature); if (child.nature === 'brash') fromA++; }
  assert.ok(fromA > 8 && fromA < 34, `${fromA} of 40 took the first parent's nature`);
});
