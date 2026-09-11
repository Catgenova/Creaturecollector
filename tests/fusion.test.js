import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { SLOTS, getPart } from '../src/data/parts/index.js';
import { speciesGenome, randomGenome, validateGenome, encodeGenome, decodeGenome, resolveParts, STAT_KEYS } from '../src/creature/genome.js';
import { fuse, fuseChain, FUSE } from '../src/creature/fusion.js';
import { joinNameParts, splitName } from '../src/creature/naming.js';
import { renderCreatureSvg } from '../src/creature/render.js';

const wild = (seed) => randomGenome(makeRng(seed));

test('name halves join cleanly', () => {
  assert.equal(joinNameParts('Gla', 'ox'), 'Glox');
  assert.equal(joinNameParts('Puff', 'fin'), 'Puffin');
  assert.equal(joinNameParts('Ember', 'nip'), 'Embernip');
  assert.equal(joinNameParts('Drake', 'ox'), 'Drakox');
  assert.equal(joinNameParts('', 'nip'), 'Nip');
  for (const s of SPECIES) {
    assert.equal(s.nameParts.length, 2, s.id);
    const [p, q] = splitName(s.name);
    assert.equal((p + q).toLowerCase(), s.name.toLowerCase(), s.id);
  }
});

test('fusion is deterministic and does not mutate its parents', () => {
  const a = wild('fa'), b = wild('fb');
  const snapA = JSON.stringify(a), snapB = JSON.stringify(b);
  const r1 = fuse(a, b, makeRng('fuse-1')), r2 = fuse(a, b, makeRng('fuse-1'));
  assert.deepEqual(r1, r2);
  assert.equal(JSON.stringify(a), snapA);
  assert.equal(JSON.stringify(b), snapB);
  assert.notDeepEqual(fuse(a, b, makeRng('fuse-2')).child.parts, r1.child.parts);
});

test('children are valid, renderable and legible', () => {
  for (let i = 0; i < 300; i++) {
    const a = wild(`pa${i}`), b = wild(`pb${i}`);
    const { child, report } = fuse(a, b, makeRng(`f${i}`));
    const tag = `fusion ${i} (${a.name} x ${b.name})`;
    assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(child))), tag);
    assert.deepEqual(decodeGenome(encodeGenome(child)), child, tag);
    const parts = resolveParts(child);
    assert.ok(parts.body && parts.eyes, tag);
    const svg = renderCreatureSvg(child, { id: 't' });
    assert.ok(!/NaN|undefined/.test(svg), tag);
    // types: primary from a parent's primary, secondary from the other side, never equal
    assert.ok([a.types[0], b.types[0]].includes(child.types[0]), tag);
    if (child.types[1]) {
      assert.notEqual(child.types[1], child.types[0], tag);
      assert.ok([...a.types, ...b.types].includes(child.types[1]), tag);
    }
    const w = STAT_KEYS.reduce((s, k) => s + child.stats[k], 0);
    assert.ok(Math.abs(w - 1) < 0.01, `${tag} stat weights ${w}`);
    assert.equal(child.gen, Math.max(a.gen, b.gen) + 1, tag);
    assert.ok(child.bst >= Math.min(a.bst, b.bst) && child.bst <= Math.max(a.bst, b.bst) + 20, tag);
    assert.ok(child.name.length >= 2 && child.name.length <= 20, tag);
    assert.equal(child.species, null);
    assert.deepEqual(child.parents, [a.name, b.name]);
    for (const slot of SLOTS) {
      assert.ok(report.from[slot] === 0 || report.from[slot] === 1, `${tag} report ${slot}`);
      for (const id of child.parts[slot]) assert.ok(getPart(id), `${tag} unknown ${id}`);
    }
    assert.ok([0, 1].includes(report.identity));
  }
});

test('expressed part comes from the reported parent unless mutated', () => {
  for (let i = 0; i < 100; i++) {
    const a = wild(`qa${i}`), b = wild(`qb${i}`);
    const { child, report } = fuse(a, b, makeRng(`q${i}`));
    for (const slot of SLOTS) {
      if (report.mutated[slot]) continue;
      const src = report.from[slot] === 0 ? a : b;
      assert.ok(src.parts[slot].includes(child.parts[slot][0]), `${slot} of fusion ${i}`);
    }
  }
});

test('ten generations stay bounded and coherent', () => {
  for (let run = 0; run < 20; run++) {
    const start = wild(`c${run}`);
    const partners = Array.from({ length: 10 }, (_, i) => wild(`cp${run}-${i}`));
    const chain = fuseChain(start, partners, makeRng(`chain${run}`));
    assert.equal(chain.length, 11);
    // repeated fusion converges toward (partner bst) + 2 x cap x bonus, never beyond
    const maxBst = Math.max(...[start, ...partners].map((g) => g.bst)) + 2 * FUSE.genBonusCap * FUSE.genBonusPerGen;
    chain.forEach((g, i) => {
      assert.equal(g.gen, i);
      assert.ok(g.bst <= maxBst, `run ${run} gen ${i} bst ${g.bst}`);
      assert.ok(g.lineage.length <= 16);
      assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(g))));
      assert.ok(resolveParts(g).body);
    });
  }
});

test('both parents contribute and carried alleles resurface', () => {
  const ember = speciesGenome(SPECIES_BY_ID.emberox, makeRng('e'));
  const fin = speciesGenome(SPECIES_BY_ID.finnip, makeRng('f'));
  ember.parts.crown = ['crown.catears', 'crown.horns'];
  let bodyFromA = 0, hornsShown = 0, dual = 0;
  const n = 400;
  for (let i = 0; i < n; i++) {
    const { child, report } = fuse(ember, fin, makeRng(`d${i}`));
    if (report.from.body === 0) bodyFromA++;
    if (child.parts.crown[0] === 'crown.horns') hornsShown++;
    if (child.types[1]) dual++;
  }
  assert.ok(bodyFromA > n * 0.2 && bodyFromA < n * 0.8, `body from A ${bodyFromA}/${n}`);
  assert.ok(hornsShown > 10 && hornsShown < n * 0.6, `horns expressed ${hornsShown}/${n}`);
  assert.equal(dual, n, 'Fire x Water children are always dual typed');
});
