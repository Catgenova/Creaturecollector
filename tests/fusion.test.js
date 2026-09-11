import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { getPart } from '../src/data/parts/index.js';
import { slotsFor } from '../src/data/rigs.js';
import { speciesGenome, randomGenome, validateGenome, encodeGenome, decodeGenome, resolveParts, rigOf } from '../src/creature/genome.js';
import { STAT_KEYS } from '../src/data/damage.js';
import { fuse, fuseChain, FUSE, canFuse } from '../src/creature/fusion.js';
import { CLADES, CLADE_IDS } from '../src/data/clades.js';
import { joinNameParts, splitName } from '../src/creature/naming.js';
import { renderCreatureSvg } from '../src/creature/render.js';

const wild = (seed, clade) => randomGenome(makeRng(seed), clade ? { clade } : {});
const kin = (seed) => wild(seed, 'mammal');

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
  const a = kin('fa'), b = kin('fb');
  const snapA = JSON.stringify(a), snapB = JSON.stringify(b);
  const r1 = fuse(a, b, makeRng('fuse-1')), r2 = fuse(a, b, makeRng('fuse-1'));
  assert.deepEqual(r1, r2);
  assert.equal(JSON.stringify(a), snapA);
  assert.equal(JSON.stringify(b), snapB);
  assert.notDeepEqual(fuse(a, b, makeRng('fuse-2')).child.parts, r1.child.parts);
});

test('children are valid, renderable and legible', () => {
  for (let i = 0; i < 300; i++) {
    const clade = CLADE_IDS[i % CLADE_IDS.length];
    const a = wild(`pa${i}`, clade), b = wild(`pb${i}`, clade);
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
    assert.equal(rigOf(child), rigOf(a), tag);
    for (const slot of slotsFor(rigOf(child))) {
      assert.ok(report.from[slot] === 0 || report.from[slot] === 1, `${tag} report ${slot}`);
      for (const id of child.parts[slot]) assert.ok(getPart(id), `${tag} unknown ${id}`);
    }
    assert.ok([0, 1].includes(report.identity));
  }
});

test('expressed part comes from the reported parent unless mutated', () => {
  for (let i = 0; i < 100; i++) {
    const a = kin(`qa${i}`), b = kin(`qb${i}`);
    const { child, report } = fuse(a, b, makeRng(`q${i}`));
    for (const slot of slotsFor(rigOf(child))) {
      if (report.mutated[slot]) continue;
      const src = report.from[slot] === 0 ? a : b;
      assert.ok(src.parts[slot].includes(child.parts[slot][0]), `${slot} of fusion ${i}`);
    }
  }
});

test('ten generations stay bounded and coherent', () => {
  for (let run = 0; run < 20; run++) {
    const start = kin(`c${run}`);
    const partners = Array.from({ length: 10 }, (_, i) => kin(`cp${run}-${i}`));
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
  const fin = speciesGenome(SPECIES_BY_ID.glacub, makeRng('f'));
  ember.parts.horns = ['m.horns.none', 'm.horns.bull'];
  let bodyFromA = 0, hornsShown = 0, dual = 0;
  const n = 400;
  for (let i = 0; i < n; i++) {
    const { child, report } = fuse(ember, fin, makeRng(`d${i}`));
    if (report.from.body === 0) bodyFromA++;
    if (child.parts.horns[0] === 'm.horns.bull') hornsShown++;
    if (child.types[1]) dual++;
  }
  assert.ok(bodyFromA > n * 0.2 && bodyFromA < n * 0.8, `body from A ${bodyFromA}/${n}`);
  assert.ok(hornsShown > 10 && hornsShown < n * 0.6, `horns expressed ${hornsShown}/${n}`);
  assert.equal(dual, n, 'Fire x Ice children are always dual typed');
});


test('fusion is locked to a class and linked slots travel together', () => {
  for (const sp of SPECIES) assert.ok(CLADES[sp.clade], `${sp.id} has a class`);
  const fox = wild('cl-a', 'mammal'), fish = wild('cl-b', 'fish');
  assert.equal(canFuse(fox, fish).ok, false);
  assert.match(canFuse(fox, fish).reason, /Mammals only fuse with Mammals/);
  assert.throws(() => fuse(fox, fish, makeRng('x')), /Mammals only fuse/);
  assert.ok(canFuse(fox, wild('cl-c', 'mammal')).ok);
  let checked = 0;
  for (let i = 0; i < 60; i++) {
    const a = wild(`bw${i}`, 'bird'), b = wild(`bx${i}`, 'bird');
    const { child, report } = fuse(a, b, makeRng(`b${i}`));
    assert.equal(child.clade, 'bird');
    if (!report.mutated.wings && !report.mutated.tail) { assert.equal(report.from.wings, report.from.tail, `bird ${i} wings and tail from the same parent`); checked++; }
  }
  assert.ok(checked > 40);
  const chain = fuseChain(fox, [fish, wild('cl-d', 'mammal')], makeRng('chain'));
  assert.equal(chain.length, 2, 'incompatible partners are skipped');
});
