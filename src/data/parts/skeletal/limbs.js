// Skeletal forelegs (origin = the shoulder), hind legs (origin = the hip) and tails (origin = the tail socket,
// trailing behind): bone shafts with knobbed joints and phalanges.
// Evolutions: legs grow and gain joint rings; tails grow and spike.
import { skLeg, skPart } from './_shared.js';
import { L, C, P, tube, fur } from '../_dsl.js';
import { claws } from '../_builders.js';
import { evoRing, evoSpike } from '../_evo.js';

const skLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [evoRing(0, 8, 3.4, 'a', 1, { op: 0.6 })] } };
const skTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 8, 3), f: 'a' }, { pts: evoSpike(x + 10, y + 1, -100, 7, 3), f: 'a' }] } });
/** A bone: a shaft with a knob at each end. */
const skBone = (x0, y0, x1, y1, w = 4) => [tube([[x0, y0], [x1, y1]], w, w * 0.8, { tipK: 1 }), { pts: [[x0 - w * 0.8, y0 - w * 0.4], [x0, y0 - w * 0.9], [x0 + w * 0.8, y0 - w * 0.4], [x0 + w * 0.7, y0 + w * 0.6], [x0 - w * 0.7, y0 + w * 0.6]], f: 'p' }];
const skJoint = (x, y, r = 2.2) => C(x, y, r, 'pd', { sw: 1 });

export const SK_LEGS_FRONT = [
  skLeg({ id: 'hound', slot: 'legsFront', name: 'Hound', tags: ['lean'], dom: 0.5, w: 3, shapes: [...skBone(0, 0, 1, 8), ...skBone(1, 8, 0, 16, 3.4)], extra: [skJoint(1, 8), ...claws(-3, 3, 16, 3, 4)], stages: skLegStages }),
  skLeg({ id: 'heavy', slot: 'legsFront', name: 'Heavy', tags: ['thick'], dom: 0.55, w: 2, shapes: [...skBone(0, 0, 1, 9, 6), ...skBone(1, 9, 0, 17, 5)], extra: [skJoint(1, 9, 3), L('M-4,17 L-5,20 M0,17 L0,20 M4,17 L5,20', 'k', 1.4)], stages: skLegStages }),
  skLeg({ id: 'bird', slot: 'legsFront', name: 'Bird', tags: ['thin'], dom: 0.45, w: 2, shapes: [...skBone(0, 0, 3, 8, 3), ...skBone(3, 8, 0, 15, 2.6)], extra: [skJoint(3, 8, 1.8), ...claws(-4, 4, 15, 3, 5)], stages: skLegStages }),
  skLeg({ id: 'stubby', slot: 'legsFront', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, 0, 10, 5)], extra: [L('M-3,10 L-4,13 M0,10 L0,13 M3,10 L4,13', 'k', 1.3)], stages: skLegStages }),
  skLeg({ id: 'long', slot: 'legsFront', name: 'Long', tags: ['tall'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, 2, 10, 3.6), ...skBone(2, 10, -1, 21, 3)], extra: [skJoint(2, 10), ...claws(-3, 3, 21, 3, 4)], stages: skLegStages }),
  skLeg({ id: 'hoof', slot: 'legsFront', name: 'Hoof', tags: ['hoof'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, 1, 8, 4), ...skBone(1, 8, 0, 15, 3.4), [[-4, 14], [4, 14], [5, 19], [-5, 19]]], extra: [skJoint(1, 8)], stages: skLegStages }),
  skLeg({ id: 'claw', slot: 'legsFront', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, 1, 8, 4), ...skBone(1, 8, 2, 14, 3.4)], extra: [skJoint(1, 8), P('M-2,14 L-4,21 L1,15 Z', 'p', { sw: 1 }), P('M2,15 L3,22 L6,15 Z', 'p', { sw: 1 }), P('M6,13 L10,19 L9,13 Z', 'p', { sw: 1 })], stages: skLegStages }),
];

export const SK_LEGS_BACK = [
  skLeg({ id: 'hound', slot: 'legsBack', name: 'Hound', tags: ['lean'], dom: 0.5, w: 3, shapes: [...skBone(0, 0, -4, 7, 4.4), ...skBone(-4, 7, 1, 16, 3.4)], extra: [skJoint(-4, 7), ...claws(-2, 4, 16, 3, 4)], stages: skLegStages }),
  skLeg({ id: 'heavy', slot: 'legsBack', name: 'Heavy', tags: ['thick'], dom: 0.55, w: 2, shapes: [...skBone(0, 0, -3, 9, 6), ...skBone(-3, 9, 0, 17, 5)], extra: [skJoint(-3, 9, 3), L('M-4,17 L-5,20 M0,17 L0,20 M4,17 L5,20', 'k', 1.4)], stages: skLegStages }),
  skLeg({ id: 'bird', slot: 'legsBack', name: 'Bird', tags: ['thin'], dom: 0.45, w: 2, shapes: [...skBone(0, 0, -4, 7, 3), ...skBone(-4, 7, 0, 15, 2.6)], extra: [skJoint(-4, 7, 1.8), ...claws(-4, 4, 15, 3, 5)], stages: skLegStages }),
  skLeg({ id: 'stubby', slot: 'legsBack', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, 0, 10, 5)], extra: [L('M-3,10 L-4,13 M0,10 L0,13 M3,10 L4,13', 'k', 1.3)], stages: skLegStages }),
  skLeg({ id: 'long', slot: 'legsBack', name: 'Long', tags: ['tall'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, -4, 9, 3.6), ...skBone(-4, 9, 1, 21, 3)], extra: [skJoint(-4, 9), ...claws(-3, 3, 21, 3, 4)], stages: skLegStages }),
  skLeg({ id: 'hoof', slot: 'legsBack', name: 'Hoof', tags: ['hoof'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, -3, 8, 4), ...skBone(-3, 8, 0, 15, 3.4), [[-4, 14], [4, 14], [5, 19], [-5, 19]]], extra: [skJoint(-3, 8)], stages: skLegStages }),
  skLeg({ id: 'spring', slot: 'legsBack', name: 'Sprung', tags: ['bent'], dom: 0.5, w: 2, shapes: [...skBone(0, 0, -8, 6, 4), ...skBone(-8, 6, -4, 13, 3.4), ...skBone(-4, 13, 3, 16, 3)], extra: [skJoint(-8, 6), skJoint(-4, 13, 1.8), ...claws(0, 6, 16, 3, 4)], stages: skLegStages }),
];

/** A spine: vertebrae along a centre line, tapering. */
const skSpine = (pts, w0, w1) => [tube(pts, w0, w1, { tipK: 'c' })];
const skVerts = (xs, y = 0) => L(xs.map((x) => `M${x},${y - 4} L${x},${y + 4}`).join(' '), 'k', 1.2, { op: 0.35 });

export const SK_TAILS = [
  skPart({ id: 'spine', slot: 'tail', name: 'Spine', tags: ['plain'], dom: 0.5, w: 3, shapes: skSpine([[0, 0], [-12, 3], [-24, 2], [-34, -2]], 9, 2), extra: [skVerts([-6, -12, -18, -24], 1)], stages: skTailStages(-14, -2) }),
  skPart({ id: 'club', slot: 'tail', name: 'Vertebra club', tags: ['heavy'], dom: 0.5, w: 2, shapes: [...skSpine([[0, 0], [-12, 3], [-22, 2]], 9, 5), { pts: [[-22, -6], [-30, -8], [-34, -2], [-32, 6], [-24, 8], [-20, 3]], f: 'p' }], extra: [skVerts([-6, -12, -18], 1), L('M-30,-4 L-33,-7 M-33,2 L-36,3', 'k', 1.3, { op: 0.6 })], stages: skTailStages(-12, -2) }),
  skPart({ id: 'whip', slot: 'tail', name: 'Whip', tags: ['long'], dom: 0.5, w: 2, shapes: skSpine([[0, 0], [-14, 5], [-28, -2], [-42, -12]], 8, 1.5), extra: [skVerts([-7, -14, -21, -28, -35], 0)], stages: skTailStages(-14, -2) }),
  skPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.45, w: 2, shapes: skSpine([[0, 0], [-8, 2], [-14, 2]], 8, 3), extra: [skVerts([-5, -10], 1)], stages: skTailStages(-8, -2) }),
  skPart({ id: 'fishtail', slot: 'tail', name: 'Fin rays', tags: ['fish'], dom: 0.5, w: 2, shapes: [...skSpine([[0, 0], [-12, 2], [-24, 0]], 8, 3), [[-24, 0], [-38, -14], [-34, 0], [-38, 14]]], extra: [skVerts([-6, -12, -18], 0), L('M-24,0 L-36,-10 M-24,0 L-34,-2 M-24,0 L-36,10', 'k', 1, { op: 0.3 })], stages: skTailStages(-12, -2) }),
  skPart({ id: 'rattle', slot: 'tail', name: 'Rattle', tags: ['rattle'], dom: 0.5, w: 2, shapes: [...skSpine([[0, 0], [-12, 3], [-24, 0]], 8, 4), { pts: [[-24, -4], [-30, -5], [-30, 5], [-24, 4]], f: 'p' }, { pts: [[-30, -4], [-35, -4], [-35, 4], [-30, 4]], f: 'p' }, { pts: [[-35, -3], [-39, -3], [-39, 3], [-35, 3]], f: 'p' }], extra: [skVerts([-6, -12, -18], 1)], stages: skTailStages(-12, -2) }),
  skPart({ id: 'arrow', slot: 'tail', name: 'Arrow', tags: ['spade'], dom: 0.5, w: 2, shapes: [...skSpine([[0, 0], [-12, 3], [-26, -2]], 8, 2), [[-26, -2], [-38, -10], [-34, -2], [-38, 6]]], extra: [skVerts([-6, -12, -18], 1)], stages: skTailStages(-12, -2) }),
];
