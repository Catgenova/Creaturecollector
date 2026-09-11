// Fiend tails (origin = low on the back, trailing behind and down) and wings (origin = high on the back; the
// membrane spreads up and back, drawn behind the body).
// Evolutions: tails grow and spike; wings grow and light accent motes.
import { fdPart } from './_shared.js';
import { NONE, L, C, P, tube, puff } from '../_dsl.js';
import { flamePath } from '../_sigils.js';
import { evoSpike } from '../_evo.js';

const fdTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 7, 3), f: 'a' }] } });
const fdWingStages = { 2: { grow: [1.1, 1.1], add: [C(-24, -28, 1.6, 'a', { ns: true, op: 0.7 })] }, 3: { grow: [1.15, 1.15], add: [C(-24, -28, 1.8, 'a', { ns: true, op: 0.7 }), C(-32, -10, 1.5, 'a', { ns: true, op: 0.7 })] } };
const fdSpade = (x, y, s = 5) => P(`M${x},${y - s} L${x + s},${y} L${x},${y + s} L${x - s},${y} Z`, 'a', { sw: 1.2 });
const fdFingers = (d) => L(d, 'pd', 2.4);

export const FD_TAILS = [
  NONE('tail', 0.3, 'e.'),
  fdPart({ id: 'spade', slot: 'tail', name: 'Spade', tags: ['devil'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-10, 6], [-20, 8], [-28, 2]], 4, 1.6, { tipK: 1 })], extra: [fdSpade(-30, -1)], stages: fdTailStages(-24, 4) }),
  fdPart({ id: 'whip', slot: 'tail', name: 'Whip', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 6], [-24, 4], [-34, -6]], 3.4, 1, { tipK: 'c' })], extra: [C(-33, -5, 1.2, 'a', { ns: true })], stages: fdTailStages(-28, -2) }),
  fdPart({ id: 'tuft', slot: 'tail', name: 'Tufted', tags: ['fur'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 6], [-20, 6]], 3.4, 1.8, { tipK: 1 }), { pts: puff(-23, 5, 4, 8, 2.4, { tip: 'c' }), f: 'a' }], stages: fdTailStages(-20, 2) }),
  fdPart({ id: 'barbed', slot: 'tail', name: 'Barbed', tags: ['spikes'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 6], [-22, 6], [-30, 0]], 4, 1.6, { tipK: 'c' })], extra: [P('M-8,4 L-10,-2 L-12,5 Z M-16,5 L-18,-1 L-20,6 Z M-24,3 L-25,-3 L-27,4 Z', 'w', { sw: 1 })], stages: fdTailStages(-26, 2) }),
  fdPart({ id: 'thick', slot: 'tail', name: 'Thick', tags: ['heavy'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 6], [-20, 10], [-26, 8]], 7, 3, { tipK: 0.6 })], extra: [L('M-6,2 L-7,7 M-14,6 L-14,11', 'k', 1, { op: 0.3 })], stages: fdTailStages(-22, 6) }),
  fdPart({ id: 'forked', slot: 'tail', name: 'Forked', tags: ['fork'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 6], [-22, 4]], 3.6, 2, { tipK: 1 }), tube([[-20, 4], [-28, -2], [-32, -8]], 2.4, 1, { tipK: 'c' }), tube([[-20, 4], [-28, 8], [-34, 10]], 2.4, 1, { tipK: 'c' })], extra: [C(-31, -7, 1, 'a', { ns: true }), C(-33, 9, 1, 'a', { ns: true })], stages: fdTailStages(-26, 0) }),
  fdPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-8, 3]], 4.6, 2.4, { tipK: 'c' })], stages: fdTailStages(-8, 1) }),
];

export const FD_WINGS = [
  NONE('wings', 0.3, 'e.'),
  fdPart({ id: 'bat', slot: 'wings', name: 'Bat wings', tags: ['membrane'], dom: 0.5, w: 3, shapes: [{ pts: [[0, 0], [-6, -14], [-14, -28], [-28, -38, 'c'], [-28, -24], [-38, -12, 'c'], [-30, -4], [-38, 6, 'c'], [-24, 4], [-10, 6]], f: 's' }], extra: [fdFingers('M0,0 L-14,-28 M-14,-28 L-28,-38 M-14,-28 L-38,-12 M-14,-28 L-38,6'), L('M0,0 C-4,-10 -10,-20 -14,-28', 'p', 3.2)], stages: fdWingStages }),
  fdPart({ id: 'small', slot: 'wings', name: 'Small', tags: ['stub'], dom: 0.5, w: 3, shapes: [{ pts: [[0, 0], [-4, -8], [-10, -16], [-20, -20, 'c'], [-20, -12], [-26, -6, 'c'], [-20, -2], [-22, 4, 'c'], [-14, 2], [-6, 4]], f: 's' }], extra: [fdFingers('M0,0 L-10,-16 M-10,-16 L-20,-20 M-10,-16 L-26,-6 M-10,-16 L-22,4'), L('M0,0 C-3,-6 -7,-12 -10,-16', 'p', 2.8)], stages: fdWingStages }),
  fdPart({ id: 'ragged', slot: 'wings', name: 'Ragged', tags: ['torn'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -14], [-14, -28], [-28, -36, 'c'], [-24, -26], [-34, -20, 'c'], [-26, -14], [-36, -8, 'c'], [-26, -4], [-34, 6, 'c'], [-22, 2], [-10, 6]], f: 's' }], extra: [fdFingers('M0,0 L-14,-28 M-14,-28 L-28,-36 M-14,-28 L-36,-8 M-14,-28 L-34,6'), L('M0,0 C-4,-10 -10,-20 -14,-28', 'p', 3.2), C(-20, -14, 2, 'k', { ns: true, op: 0.4 })], stages: fdWingStages }),
  fdPart({ id: 'feathered', slot: 'wings', name: 'Dark feathers', tags: ['bird'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-8, -14], [-20, -26], [-36, -30, 'c'], [-30, -20], [-38, -14, 'c'], [-28, -10], [-36, -2, 'c'], [-24, 0], [-30, 8, 'c'], [-16, 4], [-6, 4]], f: 's' }], extra: [L('M-4,-4 C-14,-14 -24,-20 -34,-28 M-4,-2 C-14,-8 -24,-12 -34,-14 M-4,0 C-14,-2 -22,0 -30,4', 'k', 1, { op: 0.3 })], stages: fdWingStages }),
  fdPart({ id: 'ember', slot: 'wings', name: 'Ember wings', tags: ['fire'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -14], [-14, -28], [-26, -40, 'c'], [-26, -26], [-36, -14, 'c'], [-30, -6], [-36, 4, 'c'], [-24, 2], [-10, 6]], f: 'a' }], extra: [P(flamePath(-24, -30, 6), 'w', { ns: true, op: 0.4 }), P(flamePath(-30, -14, 5), 'w', { ns: true, op: 0.35 }), fdFingers('M0,0 L-14,-28 M-14,-28 L-26,-40 M-14,-28 L-36,-14 M-14,-28 L-36,4')], stages: fdWingStages }),
  fdPart({ id: 'bone', slot: 'wings', name: 'Bone wings', tags: ['bone'], dom: 0.5, w: 2, extra: [L('M0,0 L-10,-22 M-10,-22 L-30,-38 M-10,-22 L-36,-16 M-10,-22 L-34,4', 'p', 2.8), C(-10, -22, 2.4, 'pd', { sw: 1 }), C(-30, -38, 1.4, 'pd', { sw: 1 }), C(-36, -16, 1.4, 'pd', { sw: 1 }), C(-34, 4, 1.4, 'pd', { sw: 1 })], stages: fdWingStages }),
  fdPart({ id: 'wide', slot: 'wings', name: 'Wide', tags: ['big'], dom: 0.55, w: 2, shapes: [{ pts: [[0, 0], [-8, -18], [-18, -34], [-38, -50, 'c'], [-36, -32], [-50, -20, 'c'], [-40, -8], [-48, 8, 'c'], [-32, 4], [-38, 16, 'c'], [-20, 8], [-10, 8]], f: 's' }], extra: [fdFingers('M0,0 L-18,-34 M-18,-34 L-38,-50 M-18,-34 L-50,-20 M-18,-34 L-48,8 M-18,-34 L-38,16'), L('M0,0 C-6,-12 -12,-24 -18,-34', 'p', 3.4)], stages: fdWingStages }),
];
