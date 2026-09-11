// Nightwing legs (origin = the hip; short hanging legs with hooked feet, one part drawn at both hips) and tails
// (origin = the tail socket, trailing behind).
// Evolutions: legs grow and gain an accent ring; tails grow and spike.
import { nwLeg, nwPart } from './_shared.js';
import { L, C, P, tube, fur, puff } from '../_dsl.js';
import { evoRing, evoSpike } from '../_evo.js';

const nwLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [evoRing(0, 6, 3, 'a', 1, { op: 0.6 })] } };
const nwTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 6, 3), f: 'a' }] } });
const nwShin = (x1, y1, w) => tube([[0, 0], [x1, y1]], w, w * 0.8, { tipK: 1 });
/** Two claws curving in toward each other under the nwAnkle at (x, y). */
const nwHooks = (x, y) => [
  P(`M${x - 2},${y - 1} C${x - 4},${y + 3} ${x - 3},${y + 6} ${x},${y + 7} C${x - 1},${y + 4} ${x - 1},${y + 1} ${x + 1},${y - 1} Z`, 'w', { sw: 1 }),
  P(`M${x + 2},${y - 1} C${x + 4},${y + 3} ${x + 3},${y + 6} ${x},${y + 7} C${x + 1},${y + 4} ${x + 1},${y + 1} ${x - 1},${y - 1} Z`, 'w', { sw: 1 }),
];
const nwAnkle = (x, y, r = 1.8) => C(x, y, r, 'pd', { sw: 1 });

export const NW_LEGS = [
  nwLeg({ id: 'hook', slot: 'legs', name: 'Hooked', tags: ['hang'], dom: 0.5, w: 3, shapes: [nwShin(1, 12, 4)], extra: [nwAnkle(1, 12, 2), ...nwHooks(1, 12)], stages: nwLegStages }),
  nwLeg({ id: 'tucked', slot: 'legs', name: 'Tucked', tags: ['short'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [3, 6], [0, 11]], 4, 3.2, { tipK: 1 })], extra: [nwAnkle(0, 11), ...nwHooks(0, 11)], stages: nwLegStages }),
  nwLeg({ id: 'long', slot: 'legs', name: 'Long', tags: ['tall'], dom: 0.5, w: 2, shapes: [nwShin(1, 20, 3.6)], extra: [nwAnkle(1, 10), nwAnkle(1, 20), ...nwHooks(1, 20)], stages: nwLegStages }),
  nwLeg({ id: 'clawed', slot: 'legs', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 2, shapes: [nwShin(1, 14, 4.4)], extra: [nwAnkle(1, 14, 2), P('M-2,14 L-4,21 L1,15 Z', 'w', { sw: 1 }), P('M1,15 L2,22 L5,15 Z', 'w', { sw: 1 }), P('M4,13 L8,19 L7,13 Z', 'w', { sw: 1 })], stages: nwLegStages }),
  nwLeg({ id: 'furred', slot: 'legs', name: 'Furred', tags: ['fur'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, 0], [4, 0], [4, 6], ...fur([4, 6], [-4, 6], 3, 3)], f: 'p' }, nwShin(1, 14, 3.2)], extra: [nwAnkle(1, 14), ...nwHooks(1, 14)], stages: nwLegStages }),
  nwLeg({ id: 'stubby', slot: 'legs', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [nwShin(0, 8, 5)], extra: [nwAnkle(0, 8, 2.2), ...nwHooks(0, 8)], stages: nwLegStages }),
  nwLeg({ id: 'splayed', slot: 'legs', name: 'Splayed', tags: ['wide'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-4, 8], [-6, 14]], 4, 3, { tipK: 1 })], extra: [nwAnkle(-4, 8), nwAnkle(-6, 14), ...nwHooks(-6, 14)], stages: nwLegStages }),
];

export const NW_TAILS = [
  nwPart({ id: 'tuck', slot: 'tail', name: 'Tucked', tags: ['membrane'], dom: 0.5, w: 3, shapes: [{ pts: [[0, -3], [-10, -2], [-16, 2], [-10, 6], [0, 4]], f: 's' }, tube([[0, 0], [-12, 2]], 3, 1.6, { tipK: 'c' })], extra: [L('M-2,-2 L-12,0 M-2,3 L-12,4', 'k', 0.9, { op: 0.3 })], stages: nwTailStages(-14, 2) }),
  nwPart({ id: 'long', slot: 'tail', name: 'Free tail', tags: ['long'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-10, 3], [-20, 2], [-28, -4]], 3.2, 1.4, { tipK: 'c' })], extra: [L('M-8,2 L-8,4 M-16,2 L-16,4', 'k', 0.9, { op: 0.3 })], stages: nwTailStages(-26, -3) }),
  nwPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-7, 1]], 4, 2, { tipK: 'c' })], stages: nwTailStages(-7, 1) }),
  nwPart({ id: 'tufted', slot: 'tail', name: 'Tufted', tags: ['fur'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 2], [-18, 0]], 3, 1.6, { tipK: 1 }), { pts: puff(-21, 0, 4, 5, 2), f: 'a' }], stages: nwTailStages(-16, 0) }),
  nwPart({ id: 'whip', slot: 'tail', name: 'Whip', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 0], [-34, -8]], 2.6, 1, { tipK: 'c' })], extra: [C(-33, -7, 1.2, 'a', { ns: true })], stages: nwTailStages(-30, -5) }),
  nwPart({ id: 'fan', slot: 'tail', name: 'Fan', tags: ['membrane'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -4], [-12, -6], [-22, -2], [-24, 4, 'c'], [-18, 8], [-8, 8], [0, 4]], f: 's' }], extra: [L('M0,0 L-22,-2 M0,0 L-24,4 M0,0 L-18,8', 'pd', 1.6)], stages: nwTailStages(-22, 0) }),
  nwPart({ id: 'forked', slot: 'tail', name: 'Forked', tags: ['fork'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 1], [-16, -4]], 3, 1.4, { tipK: 'c' }), tube([[-8, 1], [-14, 4], [-18, 8]], 2.6, 1.2, { tipK: 'c' })], stages: nwTailStages(-15, -3) }),
];
