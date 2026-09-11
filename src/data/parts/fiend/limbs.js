// Fiend arms (origin = the shoulder; the arm hangs down and the forearm reaches forward to a wrist that carries the
// `hand` socket), legs (origin = the hip; two-legged, standing) and hands (what the near hand holds, origin = the
// wrist).
// Evolutions: arms and legs grow and gain a band; hands grow.
import { fdLeg, fdPart } from './_shared.js';
import { NONE, L, C, P, tube } from '../_dsl.js';
import { flamePath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const fdLimbStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [evoRing(2, 9, 3, 'a', 1, { op: 0.6 })] } };
const fdGrowHand = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.14, 1.14] } };
const fdSeg = (a, b, w0, w1) => tube([a, b], w0, w1, { tipK: 1 });
const fdJoint = (x, y, r = 2) => C(x, y, r, 'pd', { sw: 1 });
const fdClaws = (x, y, n = 3) => Array.from({ length: n }, (_, i) => P(`M${x + i * 3 - 3},${y - 1} L${x + i * 3 - 1.5},${y + 4} L${x + i * 3},${y - 1} Z`, 'w', { sw: 1 }));
const fdHand = (x, y) => ({ hand: { x, y, a: 0, s: 1 } });

export const FD_ARMS = [
  fdPart({ id: 'clawed', slot: 'arms', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 3, shapes: [fdSeg([0, 0], [2, 11], 6, 5), fdSeg([2, 11], [10, 17], 5, 4)], extra: [fdJoint(2, 11), ...fdClaws(11, 18)], sockets: fdHand(11, 18), stages: fdLimbStages }),
  fdPart({ id: 'long', slot: 'arms', name: 'Long', tags: ['thin'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [1, 14], 5, 4), fdSeg([1, 14], [12, 22], 4, 3.4)], extra: [fdJoint(1, 14, 1.8), ...fdClaws(13, 23)], sockets: fdHand(13, 23), stages: fdLimbStages }),
  fdPart({ id: 'brawny', slot: 'arms', name: 'Brawny', tags: ['thick'], dom: 0.55, w: 2, shapes: [fdSeg([0, 0], [2, 11], 9, 7), fdSeg([2, 11], [10, 18], 7, 6)], extra: [fdJoint(2, 11, 2.6), P('M8,18 L14,17 L15,21 L8,22 Z', 'p', { sw: 1.2 }), ...fdClaws(11, 22)], sockets: fdHand(12, 20), stages: fdLimbStages }),
  fdPart({ id: 'thin', slot: 'arms', name: 'Thin', tags: ['lean'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [1, 10], 4, 3.4), fdSeg([1, 10], [9, 15], 3.4, 3)], extra: [fdJoint(1, 10, 1.6), ...fdClaws(10, 16)], sockets: fdHand(10, 16), stages: fdLimbStages }),
  fdPart({ id: 'gauntlet', slot: 'arms', name: 'Gauntlet', tags: ['armour'], dom: 0.55, w: 2, shapes: [fdSeg([0, 0], [2, 11], 7, 6), { pts: [[0, 10, 'c'], [6, 9, 'c'], [13, 15, 'c'], [12, 20, 'c'], [5, 17, 'c'], [-1, 15, 'c']], f: 'pd' }], extra: [fdJoint(2, 11, 2.2), L('M3,14 L10,17', 'k', 1, { op: 0.3 }), C(7, 13, 1, 'a', { ns: true, op: 0.85 }), ...fdClaws(12, 20)], sockets: fdHand(12, 20), stages: fdLimbStages }),
  fdPart({ id: 'talon', slot: 'arms', name: 'Talon', tags: ['bird'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [2, 12], 5, 4), fdSeg([2, 12], [10, 16], 4, 3)], extra: [fdJoint(2, 12, 1.8), P('M9,16 L8,23 L11,18 Z M11,17 L13,24 L14,18 Z M12,15 L17,20 L15,15 Z', 'w', { sw: 1 })], sockets: fdHand(12, 18), stages: fdLimbStages }),
  fdPart({ id: 'stubby', slot: 'arms', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [2, 8], 6, 5), fdSeg([2, 8], [8, 11], 5, 4)], extra: [fdJoint(2, 8), ...fdClaws(9, 12)], sockets: fdHand(9, 12), stages: fdLimbStages }),
];

export const FD_LEGS = [
  fdLeg({ id: 'hoofed', slot: 'legs', name: 'Hoofed', tags: ['goat'], dom: 0.5, w: 3, shapes: [fdSeg([0, 0], [3, 10], 7, 5), fdSeg([3, 10], [-1, 20], 5, 4), [[-4, 19], [4, 19], [6, 25], [-5, 25]]], extra: [fdJoint(3, 10), L('M0,21 L0,25', 'k', 1, { op: 0.4 })], stages: fdLimbStages }),
  fdLeg({ id: 'clawed', slot: 'legs', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 3, shapes: [fdSeg([0, 0], [2, 10], 7, 5), fdSeg([2, 10], [0, 20], 5, 4), [[-4, 19], [4, 19], [8, 24], [-4, 24]]], extra: [fdJoint(2, 10), ...fdClaws(4, 24)], stages: fdLimbStages }),
  fdLeg({ id: 'digitigrade', slot: 'legs', name: 'Dog-legged', tags: ['bent'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [5, 9], 7, 5), fdSeg([5, 9], [-2, 17], 5, 4), fdSeg([-2, 17], [4, 23], 4, 3.4)], extra: [fdJoint(5, 9), fdJoint(-2, 17, 1.6), ...fdClaws(5, 24)], stages: fdLimbStages }),
  fdLeg({ id: 'brawny', slot: 'legs', name: 'Brawny', tags: ['thick'], dom: 0.55, w: 2, shapes: [fdSeg([0, 0], [2, 11], 10, 7), fdSeg([2, 11], [0, 21], 7, 6), [[-5, 20], [5, 20], [8, 26], [-6, 26]]], extra: [fdJoint(2, 11, 2.6), ...fdClaws(4, 26)], stages: fdLimbStages }),
  fdLeg({ id: 'thin', slot: 'legs', name: 'Thin', tags: ['lean'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [2, 11], 4.4, 3.6), fdSeg([2, 11], [0, 22], 3.6, 3), [[-3, 21], [3, 21], [7, 25], [-3, 25]]], extra: [fdJoint(2, 11, 1.6), ...fdClaws(3, 25, 2)], stages: fdLimbStages }),
  fdLeg({ id: 'armoured', slot: 'legs', name: 'Armoured', tags: ['plate'], dom: 0.55, w: 2, shapes: [fdSeg([0, 0], [2, 11], 8, 6), { pts: [[-2, 10, 'c'], [6, 10, 'c'], [5, 22, 'c'], [-3, 22, 'c']], f: 'pd' }, [[-5, 21, 'c'], [6, 21, 'c'], [8, 26, 'c'], [-6, 26, 'c']]], extra: [fdJoint(2, 11, 2.2), L('M-1,14 L4,14 M-1,18 L4,18', 'k', 1, { op: 0.3 }), C(1, 16, 1, 'a', { ns: true, op: 0.85 })], stages: fdLimbStages }),
  fdLeg({ id: 'stubby', slot: 'legs', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [fdSeg([0, 0], [1, 8], 8, 6), fdSeg([1, 8], [0, 14], 6, 5), [[-5, 13], [5, 13], [7, 18], [-5, 18]]], extra: [fdJoint(1, 8), ...fdClaws(3, 18)], stages: fdLimbStages }),
];

export const FD_HANDS = [
  NONE('hand', 0.3, 'e.'),
  fdPart({ id: 'claws', slot: 'hand', name: 'Long claws', tags: ['claw'], dom: 0.5, w: 3, extra: [P('M-3,0 L-4,8 L-1,1 Z M0,0 L0,9 L2,1 Z M3,0 L5,8 L4,0 Z', 'w', { sw: 1 })], stages: fdGrowHand }),
  fdPart({ id: 'pitchfork', slot: 'hand', name: 'Pitchfork', tags: ['tool'], dom: 0.5, w: 2, extra: [L('M0,12 L0,-30', 'pd', 2.6), L('M-6,-30 L6,-30 M-6,-30 L-6,-40 M0,-30 L0,-42 M6,-30 L6,-40', 'pd', 2.2), P('M-7.4,-40 L-6,-45 L-4.6,-40 Z M-1.4,-42 L0,-47 L1.4,-42 Z M4.6,-40 L6,-45 L7.4,-40 Z', 'a', { ns: true }), C(0, 0, 2.4, 'p', { sw: 1.2 })], stages: fdGrowHand }),
  fdPart({ id: 'fireball', slot: 'hand', name: 'Fireball', tags: ['fire'], dom: 0.5, w: 2, extra: [C(5, 0, 7, 'a', { ns: true, op: 0.22 }), P(flamePath(5, 0, 6), 'a', { ns: true }), P(flamePath(5, 1, 3), 'w', { ns: true, op: 0.7 })], stages: fdGrowHand }),
  fdPart({ id: 'orb', slot: 'hand', name: 'Orb', tags: ['magic'], dom: 0.5, w: 2, extra: [C(4, 0, 6, 'a', { ns: true, op: 0.2 }), C(4, 0, 3.8, 'a', { sw: 1 }), C(2.8, -1.4, 1.2, 'w', { ns: true, op: 0.85 }), C(4, 0, 1.2, 'k', { ns: true, op: 0.4 })], stages: fdGrowHand }),
  fdPart({ id: 'chain', slot: 'hand', name: 'Chain', tags: ['iron'], dom: 0.5, w: 2, extra: [C(0, 0, 2.2, 'p', { sw: 1.2 }), ...[3, 7, 11, 15, 19].map((y, i) => C(1 + (i % 2) * 1.2, y, 2, 'pd', { sw: 1.4, op: 0.95 })), C(2, 23, 2.6, 'pd', { sw: 1.4 })], stages: fdGrowHand }),
  fdPart({ id: 'dagger', slot: 'hand', name: 'Dagger', tags: ['blade'], dom: 0.5, w: 2, extra: [P('M2,-2 L18,-6 L20,-4 L4,3 Z', 'w', { sw: 1.2 }), L('M0,-4 L4,4', 'pd', 2.6), C(0, 0, 2, 'p', { sw: 1.2 }), L('M4,-2 L15,-4.6', 'k', 0.8, { op: 0.3 })], stages: fdGrowHand }),
  fdPart({ id: 'torch', slot: 'hand', name: 'Torch', tags: ['fire'], dom: 0.5, w: 2, extra: [L('M0,4 L2,-16', 'pd', 3), C(0, 0, 2.2, 'p', { sw: 1.2 }), C(3, -22, 7, 'a', { ns: true, op: 0.2 }), P(flamePath(3, -22, 6), 'a', { ns: true }), P(flamePath(3, -21, 3), 'w', { ns: true, op: 0.7 })], stages: fdGrowHand }),
];
