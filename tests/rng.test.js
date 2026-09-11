import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, hashSeed, freshSeed } from '../src/core/rng.js';

test('same seed gives the same sequence', () => {
  const a = makeRng('hello'), b = makeRng('hello');
  for (let i = 0; i < 50; i++) assert.equal(a.next(), b.next());
});

test('different seeds differ', () => {
  const a = makeRng('hello'), b = makeRng('hellp');
  let same = 0;
  for (let i = 0; i < 20; i++) if (a.next() === b.next()) same++;
  assert.ok(same < 3);
});

test('forks depend only on label, not draw count', () => {
  const a = makeRng('s'), b = makeRng('s');
  a.next(); a.next(); a.next();
  assert.equal(a.fork('x').next(), b.fork('x').next());
  assert.notEqual(a.fork('x').next(), b.fork('y').next());
});

test('ranges are respected', () => {
  const r = makeRng(42);
  for (let i = 0; i < 1000; i++) {
    const n = r.int(7); assert.ok(n >= 0 && n < 7 && Number.isInteger(n));
    const m = r.between(3, 5); assert.ok(m >= 3 && m <= 5);
    const f = r.range(-1, 1); assert.ok(f >= -1 && f < 1);
  }
  assert.ok([1, 2, 3].includes(r.pick([1, 2, 3])));
});

test('weighted pick never picks zero-weight items', () => {
  const r = makeRng('w');
  const items = [{ id: 'a', w: 0 }, { id: 'b', w: 1 }, { id: 'c', w: 3 }];
  for (let i = 0; i < 500; i++) assert.notEqual(r.weighted(items, (x) => x.w).id, 'a');
});

test('hash is stable', () => {
  assert.deepEqual(hashSeed('abc'), hashSeed('abc'));
  assert.equal(freshSeed().length, 8);
});
