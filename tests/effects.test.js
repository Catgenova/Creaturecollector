// Move effects: no browser here, so what is checked is the table behind them and the stylesheet that draws them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EFFECT_OF_TYPE, EFFECT_SHAPE, effectKind } from '../src/ui/effects.js';
import { TYPE_INFO } from '../src/data/types.js';
import { MOVES } from '../src/data/moves.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');

test('every type throws a shape and every shape is drawn', () => {
  for (const type of Object.keys(TYPE_INFO)) {
    const kind = EFFECT_OF_TYPE[type];
    assert.ok(kind, `${type} has no effect`);
    assert.ok(EFFECT_SHAPE[kind], `${type} throws ${kind}, which has no shape`);
  }
  for (const kind of Object.keys(EFFECT_SHAPE)) {
    assert.ok(css.includes(`.fx-${kind} i {`), `${kind} has no rule in the stylesheet`);
    const rule = css.slice(css.indexOf(`.fx-${kind} i {`)).split('}')[0];
    const anim = /animation: (fx-[a-z]+) /.exec(rule);
    assert.ok(anim, `${kind} has no animation`);
    assert.ok(css.includes(`@keyframes ${anim[1]} `), `${kind} animates ${anim[1]}, which has no keyframes`);
    assert.ok(rule.includes('forwards'), `${kind} must settle rather than snap back`);
    assert.ok(!/infinite|alternate/.test(rule), `${kind} must run once: nothing here may repeat`);
  }
});

test('every move in the game gets an effect', () => {
  for (const mv of MOVES) assert.ok(EFFECT_SHAPE[effectKind(mv)], `${mv.name} (${mv.type}) has no effect`);
  assert.equal(effectKind(null), 'impact', 'a move that is gone still lands as a plain hit');
  assert.equal(effectKind({ type: 'Nonsense' }), 'impact');
});

test('nothing lingers and nothing flashes twice', () => {
  for (const [kind, shape] of Object.entries(EFFECT_SHAPE)) {
    assert.ok(shape.ms >= 300 && shape.ms <= 600, `${kind} runs for ${shape.ms}ms`);
    assert.ok(shape.n >= 2 && shape.n <= 8, `${kind} throws ${shape.n} pieces`);
  }
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce) { .fx { display: none; } }'), 'the system setting turns effects off');
  assert.ok(css.includes('html[data-motion="reduced"] .fx { display: none; }'), 'the in-game setting turns effects off');
});
