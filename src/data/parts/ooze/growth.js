// Ooze drips (origin = the lower front edge, hanging), crowns (origin = the top, drawn behind) and tendrils
// (origin = the rear socket, trailing behind like a tail).
// Evolutions: drips grow with the face family; crowns and tendrils grow.
import { ozPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, fur } from '../_dsl.js';
import { spiralPath, flamePath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const ozGrowStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.12] } };
const ozDrip = (x, len, w = 4) => tube([[x, 0], [x + 1, len * 0.5], [x, len]], w, w * 0.45, { tipK: 'c' });

export const OZ_DRIPS = [
  NONE('drips', 0.3, 'o.'),
  ozPart({ id: 'drip', slot: 'drips', name: 'Drip', tags: ['drip'], dom: 0.5, w: 3, shapes: [ozDrip(0, 6)], extra: [C(0.5, 8, 2.6, 'p', { sw: 1.2 }), C(-0.3, 7.2, 0.8, 'w', { ns: true, op: 0.7 })] }),
  ozPart({ id: 'trio', slot: 'drips', name: 'Three drips', tags: ['drip'], dom: 0.5, w: 2, shapes: [ozDrip(-6, 4, 3.4), ozDrip(0, 7, 4), ozDrip(6, 3, 3)], extra: [C(0.5, 9, 2.2, 'p', { sw: 1.1 }), C(-5.6, 5.6, 1.6, 'p', { sw: 1 }), C(6.4, 4.6, 1.4, 'p', { sw: 1 })] }),
  ozPart({ id: 'string', slot: 'drips', name: 'String', tags: ['thin'], dom: 0.45, w: 2, extra: [L('M0,0 C1,3 -1,6 0,9', 'p', 2.4), C(0, 10.5, 2, 'p', { sw: 1.1 }), C(-0.5, 9.8, 0.6, 'w', { ns: true, op: 0.7 })] }),
  ozPart({ id: 'goop', slot: 'drips', name: 'Goop', tags: ['thick'], dom: 0.5, w: 2, shapes: [[[-8, 0], [8, 0], [9, 4], [6, 8, 'c'], [2, 6], [0, 10, 'c'], [-3, 6], [-7, 7, 'c'], [-9, 3]]], extra: [HL('M-7,1 C-5,-1 -1,-1 1,0 C-1,2 -4,3 -6,4 Z', 0.22)] }),
  ozPart({ id: 'spray', slot: 'drips', name: 'Spray', tags: ['flying'], dom: 0.45, w: 2, extra: [C(5, -2, 1.8, 'p', { sw: 1 }), C(11, 2, 1.4, 'p', { sw: 1 }), C(15, -4, 1.1, 'p', { sw: 1 }), C(19, 3, 1.3, 'p', { sw: 1 }), C(9, 7, 1, 'p', { sw: 1 }), L('M1,0 L4,-1', 'k', 1, { op: 0.3 })] }),
  ozPart({ id: 'beads', slot: 'drips', name: 'Beads', tags: ['dots'], dom: 0.45, w: 2, extra: [C(0, 2, 1.7, 'p', { sw: 1 }), C(0.5, 5.6, 1.5, 'p', { sw: 1 }), C(0, 8.8, 1.3, 'p', { sw: 1 }), C(0.4, 11.4, 1, 'p', { sw: 1 })] }),
  ozPart({ id: 'curtain', slot: 'drips', name: 'Curtain', tags: ['many'], dom: 0.5, w: 2, shapes: [ozDrip(-10, 3, 3.2), ozDrip(-4, 6, 3.4), ozDrip(2, 4, 3.2), ozDrip(8, 7, 3.4)], extra: [C(-3.6, 7.6, 1.5, 'p', { sw: 1 }), C(8.4, 8.6, 1.5, 'p', { sw: 1 })] }),
];

export const OZ_CROWNS = [
  NONE('crown', 0.3, 'o.'),
  ozPart({ id: 'spikes', slot: 'crown', name: 'Jelly spikes', tags: ['spiky'], dom: 0.5, w: 3, shapes: [{ pts: [[-14, 0], ...fur([-14, 0], [14, 0], 5, 12, { tip: 'c' }), [14, 4], [-14, 4]], f: 'pl' }], extra: [C(-8, -4, 0.9, 'w', { ns: true, op: 0.6 }), C(2, -6, 0.9, 'w', { ns: true, op: 0.6 })], stages: ozGrowStages }),
  ozPart({ id: 'bubbles', slot: 'crown', name: 'Bubble cluster', tags: ['bubble'], dom: 0.5, w: 2, extra: [C(-6, -6, 4, 'pl', { sw: 1.2 }), C(4, -10, 5, 'pl', { sw: 1.2 }), C(10, -2, 3, 'pl', { sw: 1.2 }), C(-2, -16, 2.4, 'pl', { sw: 1.1 }), C(-7.4, -7.4, 1, 'w', { ns: true, op: 0.8 }), C(2.4, -11.8, 1.3, 'w', { ns: true, op: 0.8 })], stages: ozGrowStages }),
  ozPart({ id: 'horns', slot: 'crown', name: 'Jelly horns', tags: ['horn'], dom: 0.5, w: 2, shapes: [tube([[-8, 0], [-12, -8], [-10, -18]], 6, 2, { tipK: 'c' }), tube([[8, 0], [12, -8], [10, -18]], 6, 2, { tipK: 'c' })], extra: [C(-10.6, -6, 0.9, 'w', { ns: true, op: 0.6 }), C(10, -6, 0.9, 'w', { ns: true, op: 0.6 })], stages: ozGrowStages }),
  ozPart({ id: 'wisp', slot: 'crown', name: 'Wisp', tags: ['flame'], dom: 0.5, w: 2, extra: [P(flamePath(0, -10, 12), 'a', { sw: 1.3 }), P(flamePath(0, -7, 6), 'w', { ns: true, op: 0.5 })], stages: ozGrowStages }),
  ozPart({ id: 'stalk', slot: 'crown', name: 'Stalk', tags: ['antenna'], dom: 0.5, w: 2, extra: [L('M0,0 C2,-8 -2,-14 0,-20', 'p', 3), C(0, -23, 4, 'a', { sw: 1.3 }), C(-1.2, -24.2, 1.1, 'w', { ns: true, op: 0.8 })], stages: ozGrowStages }),
  ozPart({ id: 'fin', slot: 'crown', name: 'Jelly fin', tags: ['fin'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 0], [-4, -14], [4, -20, 'c'], [8, -10], [10, 0]], f: 'pl' }], extra: [L('M-4,-1 L-1,-13 M3,-1 L4,-14', 'k', 1, { op: 0.25 })], stages: ozGrowStages }),
  ozPart({ id: 'halo', slot: 'crown', name: 'Halo', tags: ['ring', 'light'], dom: 0.45, w: 2, extra: [evoRing(0, -8, 10, 'a', 2.2), evoRing(0, -8, 10, 'w', 0.8, { op: 0.5 }), C(0, -8, 10, 'a', { ns: true, op: 0.12 })], stages: ozGrowStages }),
];

export const OZ_TENDRILS = [
  NONE('tendrils', 0.3, 'o.'),
  ozPart({ id: 'tendril', slot: 'tendrils', name: 'Tendril', tags: ['curl'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-12, 2], [-24, -4], [-32, 4]], 6, 2.5, { tipK: 1 })], extra: [L(spiralPath(-36, 3, 4, 1.5), 'p', 2)], stages: ozGrowStages }),
  ozPart({ id: 'pair', slot: 'tendrils', name: 'Pair', tags: ['two'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, -6], [-28, -10]], 5, 2, { tipK: 1 }), tube([[0, 0], [-14, 6], [-28, 12]], 5, 2, { tipK: 1 })], stages: ozGrowStages }),
  ozPart({ id: 'whip', slot: 'tendrils', name: 'Whip', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-16, -4], [-32, -14], [-44, -26]], 5, 1.5, { tipK: 'c' })], extra: [L('M-4,-1 C-14,-4 -26,-12 -40,-24', 'k', 1, { op: 0.25 })], stages: ozGrowStages }),
  ozPart({ id: 'tail', slot: 'tendrils', name: 'Slime tail', tags: ['tail'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 4], [-26, 2]], 12, 4, { tipK: 'c' })], extra: [HL('M-4,-4 C-8,-5 -14,-4 -18,-2 C-14,-2 -8,-2 -4,-1 Z', 0.2)], stages: ozGrowStages }),
  ozPart({ id: 'streamers', slot: 'tendrils', name: 'Streamers', tags: ['thin'], dom: 0.45, w: 2, extra: [L('M0,0 C-10,-2 -20,-8 -30,-6 M0,0 C-12,2 -22,2 -32,6 M0,0 C-8,6 -18,12 -26,16', 'p', 2.4), C(-31, -6, 1.4, 'p', { sw: 1 }), C(-33, 6, 1.4, 'p', { sw: 1 }), C(-27, 16, 1.4, 'p', { sw: 1 })], stages: ozGrowStages }),
  ozPart({ id: 'fronds', slot: 'tendrils', name: 'Fronds', tags: ['three'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, -10], [-22, -16]], 5, 2, { tipK: 'c' }), tube([[0, 0], [-14, 0], [-26, 0]], 5, 2, { tipK: 'c' }), tube([[0, 0], [-12, 10], [-22, 16]], 5, 2, { tipK: 'c' })], stages: ozGrowStages }),
  ozPart({ id: 'loop', slot: 'tendrils', name: 'Loop', tags: ['ring'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-8, -2]], 6, 4, { tipK: 1 })], extra: [evoRing(-18, -2, 8, 'p', 4), evoRing(-18, -2, 8, 'k', 1, { op: 0.25 }), C(-26, 5, 2.5, 'p', { sw: 1.1 })], stages: ozGrowStages }),
];
