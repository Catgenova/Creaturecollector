import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, RIG_PARTS, partsOf, getPart } from '../src/data/parts/index.js';
import { RIGS, slotsFor, rigNodes } from '../src/data/rigs.js';
import { speciesRig } from '../src/creature/genome.js';
import { SPECIES } from '../src/data/species.js';
import { CLADE_IDS } from '../src/data/clades.js';
import { RIG_IDS } from '../src/data/rigs.js';
import { BIOME_ORDER } from '../src/game/world.js';
import { TYPE_LIST, typeMultiplier, typeEffectiveness } from '../src/data/types.js';

test('every part has the fields the renderer needs', () => {
  for (const [id, p] of PARTS) {
    assert.equal(p.id, id);
    assert.ok(RIGS[p.rig] && slotsFor(p.rig).includes(p.slot), `${id} slot ${p.slot} in rig ${p.rig}`);
    assert.ok(typeof p.dom === 'number' && p.dom >= 0 && p.dom <= 1, `${id} dominance`);
    if (p.none) continue;
    assert.ok(Array.isArray(p.prims) && p.prims.length > 0, `${id} prims`);
    for (const pr of p.prims) assert.ok(['path', 'ellipse', 'circle', 'line'].includes(pr.t), `${id} prim type`);
  }
});

test('class rigs: every parent part exposes every socket its draw tree places children on', () => {
  for (const rigId of Object.keys(RIGS)) {
    const rig = RIGS[rigId];
    if (!rig.tree) continue;
    const nodes = rigNodes(rigId);
    // parent slot of each node
    const parentOf = new Map();
    const walk = (node) => { for (const c of [...(node.behind || []), ...(node.front || [])]) { parentOf.set(c, node.slot); walk(c); } };
    walk(rig.tree);
    for (const node of nodes) {
      if (!node.socket) continue;
      const parentSlot = parentOf.get(node);
      for (const parent of partsOf(rigId, parentSlot)) {
        if (parent.none) continue;
        // a socket may be declared null (the body has no such joint, e.g. a serpent's hips) but never forgotten
        assert.ok(parent.sockets && node.socket in parent.sockets, `${parent.id} lacks socket ${node.socket}`);
      }
    }
    for (const body of partsOf(rigId, 'body')) {
      assert.ok(body.kind && Array.isArray(body.clip) && body.clip.length, `${body.id} body fields`);
    }
    for (const slot of rig.slots) {
      const real = partsOf(rigId, slot).filter((p) => !p.none).length;
      assert.ok(real >= 7, `${rigId}.${slot} has ${real} parts, wants 7`);
    }
  }
});

test('optional slots have a none entry, required ones do not', () => {
  for (const rigId of Object.keys(RIG_PARTS)) {
    for (const slot of slotsFor(rigId)) {
      const hasNone = partsOf(rigId, slot).some((p) => p.none);
      assert.equal(hasNone, !RIGS[rigId].required.includes(slot), `${rigId}.${slot}`);
    }
  }
});

test('every class fields at least fourteen species covering ten or more types', () => {
  const by = {};
  for (const s of SPECIES) { by[s.clade] = by[s.clade] || { n: 0, types: new Set(), names: new Set() }; by[s.clade].n++; for (const t of s.types) by[s.clade].types.add(t); }
  assert.equal(Object.keys(by).length, CLADE_IDS.length);
  for (const [clade, v] of Object.entries(by)) {
    assert.ok(v.n >= 14, `${clade} has ${v.n} species`);
    assert.ok(v.types.size >= 10, `${clade} covers ${v.types.size} types`);
  }
  const names = new Set();
  for (const s of SPECIES) { const k = s.name.toLowerCase(); assert.ok(!names.has(k), `duplicate name ${s.name}`); names.add(k); }
});

test('species recipes only reference real parts in the right slots', () => {
  const ids = new Set();
  for (const s of SPECIES) {
    assert.ok(!ids.has(s.id), `duplicate species ${s.id}`); ids.add(s.id);
    assert.ok(s.types.every((t) => TYPE_LIST.includes(t)), `${s.id} types`);
    assert.ok(s.bst > 300 && s.bst < 700, `${s.id} bst`);
    assert.ok(s.rig && RIGS[s.rig] && s.rig === s.clade, `${s.id} must name its class rig`);
    const rig = speciesRig(s);
    for (const slot of slotsFor(rig)) {
      const entry = s.recipe[slot];
      assert.ok(entry, `${s.id} missing ${slot}`);
      for (const id of [].concat(entry)) {
        const part = getPart(id);
        assert.ok(part, `${s.id}: unknown part ${id}`);
        assert.equal(part.slot, slot, `${s.id}: ${id} is not a ${slot}`);
        assert.equal(part.rig, rig, `${s.id}: ${id} is not on the ${rig} rig`);
      }
    }
    for (const slot of Object.keys(s.recipe)) assert.ok(slotsFor(rig).includes(slot), `${s.id}: recipe slot ${slot} is not in rig ${rig}`);
    const weight = Object.values(s.stats).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(weight - 1) < 0.02, `${s.id} stat weights sum to ${weight.toFixed(3)}`);
    assert.ok(s.nameParts && s.nameParts.length === 2 && s.nameParts.join('').toLowerCase() === s.name.toLowerCase().replace(/[^a-z]/gi, ''), `${s.id} nameParts`);
    assert.ok(s.desc && s.desc.length >= 30 && s.desc.length <= 170, `${s.id} desc`);
    assert.ok(s.abilities.length === 2 && s.abilities[0] !== s.abilities[1], `${s.id} carries two different passives`);
    assert.ok(['common', 'uncommon', 'rare'].includes(s.tier), `${s.id} tier`);
    assert.ok(s.learnset.length === 11 && s.learnset[0][0] === 1 && s.learnset[1][0] === 1 && s.learnset[s.learnset.length - 1][0] >= 46, `${s.id} learnset shape`);
    for (const k of ['c1', 'c2', 'c3', 'eye']) assert.equal(s.palette[k].length, 3, `${s.id} palette ${k}`);
    const w = Object.values(s.stats).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(w - 1) < 0.05, `${s.id} stat weights sum ${w}`);
  }
});

test('type chart matches the classic rules', () => {
  assert.equal(typeMultiplier('Fire', 'Grass'), 2);
  assert.equal(typeMultiplier('Water', 'Fire'), 2);
  assert.equal(typeMultiplier('Electric', 'Ground'), 0);
  assert.equal(typeMultiplier('Normal', 'Ghost'), 0);
  assert.equal(typeMultiplier('Dragon', 'Fairy'), 0);
  assert.equal(typeMultiplier('Fire', 'Water'), 0.5);
  assert.equal(typeMultiplier('Normal', 'Normal'), 1);
  assert.equal(typeEffectiveness('Ice', ['Dragon', 'Flying']), 4);
  assert.equal(typeEffectiveness('Fighting', ['Normal', 'Ghost']), 0);
  assert.equal(typeEffectiveness('Grass', ['Water', 'Flying']), 1);
  assert.equal(TYPE_LIST.length, 18);
});

test('every class stands on its own rig with a biome of its own', () => {
  assert.equal(CLADE_IDS.length, 18);
  assert.deepEqual([...RIG_IDS].sort(), [...CLADE_IDS].sort());
  assert.deepEqual([...BIOME_ORDER].sort(), [...CLADE_IDS].sort());
  assert.ok(SPECIES.length >= 517, `${SPECIES.length} species`);
});
