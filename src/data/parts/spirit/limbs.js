// Spirit arms (origin = the side of the shroud; mist arms hang down and reach forward to a wrist that carries the
// `hand` socket), wisp tails (origin = the bottom of the shroud, trailing down and back) and lanterns (what the near
// hand holds, origin = the wrist).
// Evolutions: arms and tails grow; tails also gain a glowing tip; lanterns grow.
import { spPart } from './_shared.js';
import { NONE, L, C, E, P, tube, puff, spline } from '../_dsl.js';
import { flamePath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const spArmStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [evoRing(2, 8, 2.8, 'a', 1, { op: 0.6 })] } };
const spTailStages = { 2: { grow: [1.06, 1.1] }, 3: { grow: [1.1, 1.15], add: [C(-14, 18, 2.2, 'a', { ns: true, op: 0.8 }), C(-14, 18, 4.4, 'a', { ns: true, op: 0.2 })] } };
const spGrowLantern = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.14, 1.14] } };
const spHand = (x, y) => ({ hand: { x, y, a: 0, s: 1 } });
const spFingers = (x, y) => L(`M${x - 2},${y} L${x - 3},${y + 5} M${x},${y + 1} L${x},${y + 6} M${x + 2},${y} L${x + 3},${y + 5}`, 'p', 1.6);

export const SP_ARMS = [
  spPart({ id: 'wisps', slot: 'arms', name: 'Wisps', tags: ['mist'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [3, 8], [9, 14], [16, 15]], 6, 1.5, { tipK: 'c' })], extra: [L('M2,4 C4,8 7,11 11,13', 'k', 0.9, { op: 0.2 })], sockets: spHand(12, 14), stages: spArmStages }),
  spPart({ id: 'long', slot: 'arms', name: 'Long', tags: ['reach'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [2, 10], [8, 18], [16, 22]], 5, 2.6, { tipK: 1 })], extra: [spFingers(16, 22)], sockets: spHand(16, 22), stages: spArmStages }),
  spPart({ id: 'stubs', slot: 'arms', name: 'Stubs', tags: ['short'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [3, 6], [7, 9]], 6, 3, { tipK: 0.6 })], sockets: spHand(8, 9), stages: spArmStages }),
  spPart({ id: 'claws', slot: 'arms', name: 'Claws', tags: ['sharp'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [3, 8], [9, 14]], 5.5, 3.4, { tipK: 1 })], extra: [P('M8,14 L6,22 L10,16 Z M11,15 L12,23 L14,16 Z M13,13 L18,19 L16,13 Z', 'w', { sw: 1 })], sockets: spHand(11, 16), stages: spArmStages }),
  spPart({ id: 'sleeves', slot: 'arms', name: 'Sleeves', tags: ['cloth'], dom: 0.5, w: 2, shapes: [{ pts: [[-3, -2], [3, -2], [8, 8], [14, 14, 'c'], [8, 12], [12, 20, 'c'], [4, 14], [-2, 8]], f: 'p' }], extra: [L('M2,2 C4,6 6,9 8,11', 'k', 0.9, { op: 0.2 }), spFingers(10, 13)], sockets: spHand(10, 14), stages: spArmStages }),
  spPart({ id: 'bony', slot: 'arms', name: 'Bony', tags: ['bone'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [2, 9]], 4, 3.2, { tipK: 1 }), tube([[2, 9], [10, 15]], 3.4, 3, { tipK: 1 })], extra: [C(2, 9, 2, 'pd', { sw: 1 }), spFingers(11, 15)], sockets: spHand(11, 16), stages: spArmStages }),
  spPart({ id: 'mist', slot: 'arms', name: 'Mist', tags: ['soft'], dom: 0.45, w: 2, shapes: [{ pts: puff(6, 8, 6, 7, 2.5, { tip: 'c' }), f: 'p' }], extra: [P(spline(puff(12, 13, 4, 6, 1.6)), 'p', { ns: true, op: 0.6 }), P(spline(puff(2, 14, 3, 5, 1.2)), 'p', { ns: true, op: 0.5 })], sockets: spHand(12, 13), stages: spArmStages }),
];

export const SP_TAILS = [
  spPart({ id: 'wisp', slot: 'tail', name: 'Wisp', tags: ['curl'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-1, 6], [-6, 12], [-14, 16]], 9, 1.5, { tipK: 'c' })], extra: [L('M-1,2 C-2,7 -6,11 -10,13', 'k', 0.9, { op: 0.2 })], stages: spTailStages }),
  spPart({ id: 'split', slot: 'tail', name: 'Split', tags: ['two'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-4, 7], [-12, 12]], 6, 1.4, { tipK: 'c' }), tube([[2, 0], [4, 8], [2, 16]], 5, 1.2, { tipK: 'c' })], stages: spTailStages }),
  spPart({ id: 'long', slot: 'tail', name: 'Long', tags: ['trail'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-2, 8], [-10, 14], [-20, 16], [-28, 12]], 8, 1.2, { tipK: 'c' })], extra: [L('M-2,3 C-4,8 -10,12 -18,14', 'k', 0.9, { op: 0.2 })], stages: spTailStages }),
  spPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-1, 5], [-4, 8]], 8, 2, { tipK: 'c' })], stages: spTailStages }),
  spPart({ id: 'spiral', slot: 'tail', name: 'Spiral', tags: ['curl'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-2, 6], [-8, 10], [-12, 6], [-8, 2]], 8, 1.4, { tipK: 'c' })], extra: [C(-7, 4, 1.2, 'a', { ns: true, op: 0.8 })], stages: spTailStages }),
  spPart({ id: 'drips', slot: 'tail', name: 'Drips', tags: ['drop'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-1, 4], [-2, 8]], 8, 3, { tipK: 'c' }), { pts: [[-7, 4], [-8, 10, 'c'], [-9, 4]], f: 'p' }, { pts: [[5, 3], [6, 12, 'c'], [7, 3]], f: 'p' }], extra: [C(-8, 10, 1.4, 'p'), C(6, 12, 1.4, 'p'), C(0, 14, 1, 'a', { ns: true, op: 0.7 })], stages: spTailStages }),
  spPart({ id: 'smoke', slot: 'tail', name: 'Smoke', tags: ['soft'], dom: 0.45, w: 2, shapes: [{ pts: puff(-3, 5, 6, 7, 2.5, { tip: 'c' }), f: 'p' }], extra: [P(spline(puff(-10, 11, 4.5, 6, 1.8)), 'p', { ns: true, op: 0.6 }), P(spline(puff(-16, 14, 3, 5, 1.4)), 'p', { ns: true, op: 0.4 })], stages: spTailStages }),
];

export const SP_LANTERNS = [
  NONE('lantern', 0.3, 's.'),
  spPart({ id: 'lantern', slot: 'lantern', name: 'Lantern', tags: ['light'], dom: 0.5, w: 3, extra: [L('M0,0 L0,4', 'pd', 1.6), P('M-4,4 L4,4 L5,14 L-5,14 Z', 'pd', { sw: 1.2 }), C(0, 9, 7, 'a', { ns: true, op: 0.22 }), P('M-3,6 L3,6 L3.6,12 L-3.6,12 Z', 'a', { ns: true, op: 0.9 }), C(-1, 8, 1, 'w', { ns: true, op: 0.8 })], stages: spGrowLantern }),
  spPart({ id: 'candle', slot: 'lantern', name: 'Candle', tags: ['light'], dom: 0.5, w: 2, extra: [P('M-2,0 L2,0 L2,10 L-2,10 Z', 'w', { sw: 1.2 }), C(0, -4, 5, 'a', { ns: true, op: 0.22 }), P(flamePath(0, -4, 4), 'a', { ns: true }), P(flamePath(0, -3, 2), 'w', { ns: true, op: 0.7 })], stages: spGrowLantern }),
  spPart({ id: 'skull', slot: 'lantern', name: 'Skull', tags: ['bone'], dom: 0.5, w: 2, extra: [P('M-5,0 C-5,-6 5,-6 5,0 C5,3 3,6 0,6 C-3,6 -5,3 -5,0 Z', 'w', { sw: 1.2 }), E(-2, -1, 1.4, 1.6, 'k', { ns: true, op: 0.8 }), E(2, -1, 1.4, 1.6, 'k', { ns: true, op: 0.8 }), L('M-1,4 L-1,6 M1,4 L1,6', 'k', 0.8, { op: 0.5 })], stages: spGrowLantern }),
  spPart({ id: 'orb', slot: 'lantern', name: 'Orb', tags: ['magic'], dom: 0.5, w: 2, extra: [C(0, 3, 6.4, 'a', { ns: true, op: 0.2 }), C(0, 3, 4, 'a', { sw: 1 }), C(-1.4, 1.6, 1.2, 'w', { ns: true, op: 0.85 })], stages: spGrowLantern }),
  spPart({ id: 'bell', slot: 'lantern', name: 'Bell', tags: ['sound'], dom: 0.5, w: 2, extra: [L('M0,0 L0,3', 'pd', 1.6), P('M-4,10 C-4,4 -2,3 0,3 C2,3 4,4 4,10 L5,12 L-5,12 Z', 'a', { sw: 1.2 }), C(0, 13, 1.2, 'k', { ns: true, op: 0.7 }), L('M-2,5 L-2,9', 'w', 1, { ns: true, op: 0.5 })], stages: spGrowLantern }),
  spPart({ id: 'scythe', slot: 'lantern', name: 'Scythe', tags: ['blade'], dom: 0.5, w: 2, extra: [L('M-2,14 L4,-26', 'pd', 2.6), P('M4,-26 C12,-30 22,-26 26,-18 C20,-22 12,-22 6,-20 Z', 'w', { sw: 1.2 }), L('M6,-22 C12,-24 18,-22 22,-19', 'k', 0.8, { op: 0.3 }), C(0, 0, 2, 'p', { sw: 1 })], stages: spGrowLantern }),
  spPart({ id: 'key', slot: 'lantern', name: 'Old key', tags: ['iron'], dom: 0.5, w: 2, extra: [L('M0,0 L0,14', 'pd', 2.4), C(0, -3, 3.4, 'pd', { sw: 1.6 }), C(0, -3, 1.2, 'k', { ns: true, op: 0.5 }), L('M0,10 L4,10 M0,13 L3,13', 'pd', 2)], stages: spGrowLantern }),
];
