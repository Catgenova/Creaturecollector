import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLOTS, PARTS, PARTS_BY_SLOT, getPart } from '../src/data/parts/index.js';
import { SPECIES } from '../src/data/species.js';
import { TYPE_LIST, typeMultiplier, typeEffectiveness } from '../src/data/types.js';

test('every part has the fields the renderer needs', () => {
  for (const [id, p] of PARTS) {
    assert.equal(p.id, id);
    assert.ok(SLOTS.includes(p.slot), `${id} slot`);
    assert.ok(typeof p.dom === 'number' && p.dom >= 0 && p.dom <= 1, `${id} dominance`);
    if (p.none) continue;
    if (p.img) { assert.ok(p.img.src && p.img.w > 0 && p.img.h > 0 && p.origin && p.scale > 0, `${id} image fields`); continue; }
    assert.ok(Array.isArray(p.prims) && p.prims.length > 0, `${id} prims`);
    for (const pr of p.prims) assert.ok(['path', 'ellipse', 'circle', 'line'].includes(pr.t), `${id} prim type`);
    if (p.slot === 'body') {
      assert.ok(p.kind && typeof p.bottom === 'number' && Array.isArray(p.clip), `${id} body fields`);
      for (const k of ['head', 'face', 'legs', 'wing', 'tail', 'back']) assert.ok(k in p.sockets, `${id} socket ${k}`);
      assert.ok(Array.isArray(p.sockets.legs), `${id} legs socket list`);
    }
    if (p.slot === 'head') {
      assert.ok(p.sockets && p.sockets.eye && p.sockets.crown, `${id} head sockets`);
    }
    if (p.slot === 'legs') assert.ok(p.len > 0, `${id} leg length`);
  }
});

test('optional slots have a none entry, required ones do not', () => {
  for (const slot of SLOTS) {
    const hasNone = PARTS_BY_SLOT[slot].some((p) => p.none);
    if (slot === 'body' || slot === 'eyes') assert.equal(hasNone, false, slot);
    else assert.equal(hasNone, true, slot);
  }
});

test('species recipes only reference real parts in the right slots', () => {
  const ids = new Set();
  for (const s of SPECIES) {
    assert.ok(!ids.has(s.id), `duplicate species ${s.id}`); ids.add(s.id);
    assert.ok(s.types.every((t) => TYPE_LIST.includes(t)), `${s.id} types`);
    assert.ok(s.bst > 300 && s.bst < 700, `${s.id} bst`);
    for (const slot of SLOTS) {
      const entry = s.recipe[slot];
      assert.ok(entry, `${s.id} missing ${slot}`);
      for (const id of [].concat(entry)) {
        const part = getPart(id);
        assert.ok(part, `${s.id}: unknown part ${id}`);
        assert.equal(part.slot, slot, `${s.id}: ${id} is not a ${slot}`);
      }
    }
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
