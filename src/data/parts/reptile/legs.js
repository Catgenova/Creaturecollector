// Reptile legs. Origin = the joint on the body. Splayed, short, ending in clawed feet.
// The near hind leg carries a thigh that overlaps the torso; on upright bodies forelegs hang as arms.
import { rLeg, claws } from './_shared.js';
import { SH, HL, L, C, P } from '../_dsl.js';

const rShadeBack = SH('M-16,-20 L-4,-20 L-3,46 L-16,46 Z', 0.12);
const rLightFront = HL('M2,-6 L6,-6 L6,12 L3,12 Z', 0.16);
const pads = (x, y) => [C(x, y, 2.2, 'a', { sw: 1 }), C(x + 6, y + 1, 2.2, 'a', { sw: 1 }), C(x + 12, y, 2.2, 'a', { sw: 1 })];

export const R_LEGS_FRONT = [
  rLeg({
    id: 'lizard', slot: 'legsFront', name: 'Splayed', tags: ['lizard'], dom: 0.5, w: 3,
    shapes: [[[-7, -6], [4, -9], [10, -2], [10, 10], [10, 18], [18, 22], [22, 26, 'c'], [16, 28], [4, 28], [-4, 26], [-6, 18], [-7, 8]]],
    extra: [rShadeBack, rLightFront, L('M-4,10 C0,12 6,12 9,10', 'k', 1.2, { op: 0.25 }), ...claws(6, 20, 27, 3, 4)],
  }),
  rLeg({
    id: 'croc', slot: 'legsFront', name: 'Stubby', tags: ['croc'], dom: 0.5, w: 2,
    shapes: [[[-9, -6], [4, -9], [12, -2], [12, 10], [14, 18], [20, 20], [22, 24, 'c'], [14, 26], [0, 26], [-8, 22], [-9, 12]]],
    extra: [rShadeBack, rLightFront, L('M-6,6 C0,8 6,8 11,6 M-6,12 C0,14 8,14 12,12', 'k', 1.1, { op: 0.25 }), ...claws(4, 20, 25, 3, 4)],
  }),
  rLeg({
    id: 'turtle', slot: 'legsFront', name: 'Stump', tags: ['turtle'], dom: 0.45, w: 2,
    shapes: [[[-10, -4], [2, -8], [12, -2], [13, 10], [12, 20], [6, 24], [-6, 24], [-12, 18], [-12, 8]]],
    extra: [rShadeBack, L('M-8,4 C-2,6 6,6 11,4 M-8,12 C-2,14 6,14 11,12', 'k', 1.1, { op: 0.25 }), ...claws(-4, 8, 23, 3, 3)],
  }),
  rLeg({
    id: 'dragon', slot: 'legsFront', name: 'Talon', tags: ['dragon'], dom: 0.55, w: 2,
    shapes: [[[-8, -8], [4, -12], [11, -4], [10, 10], [10, 22], [16, 28], [20, 32, 'c'], [14, 34], [2, 34], [-5, 30], [-6, 20], [-8, 8]]],
    extra: [rShadeBack, rLightFront, L('M-4,12 C0,14 6,14 9,12', 'k', 1.2, { op: 0.25 }), ...claws(2, 18, 33, 3, 5)],
  }),
  rLeg({
    id: 'chameleon', slot: 'legsFront', name: 'Mitten', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [[[-7, -6], [4, -9], [10, -2], [9, 10], [8, 20], [14, 24], [16, 28, 'c'], [10, 32], [-2, 32], [-6, 28], [-6, 18], [-7, 8]]],
    extra: [rShadeBack, rLightFront, L('M4,24 L4,31', 'k', 1.4, { op: 0.5 }), L('M-4,10 C0,12 6,12 8,10', 'k', 1.2, { op: 0.25 })],
  }),
  rLeg({
    id: 'raptor', slot: 'legsFront', name: 'Grasper', tags: ['raptor', 'small'], dom: 0.45, w: 2,
    shapes: [[[-6, -6], [3, -8], [8, -2], [7, 8], [6, 16], [12, 18], [14, 22, 'c'], [8, 24], [-2, 22], [-5, 16], [-6, 8]]],
    extra: [rShadeBack, rLightFront, ...claws(2, 12, 23, 3, 4)],
  }),
  rLeg({
    id: 'gecko', slot: 'legsFront', name: 'Padded', tags: ['gecko'], dom: 0.5, w: 2,
    shapes: [[[-7, -6], [4, -9], [10, -2], [10, 10], [10, 18], [18, 20], [22, 24, 'c'], [16, 28], [4, 28], [-4, 26], [-6, 18], [-7, 8]]],
    extra: [rShadeBack, rLightFront, ...pads(6, 26)],
  }),
];

export const R_LEGS_BACK = [
  rLeg({
    id: 'lizard', slot: 'legsBack', name: 'Splayed', tags: ['lizard'], dom: 0.5, w: 3,
    shapes: [[[-14, -6], [-2, -14], [10, -10], [16, 0], [14, 10], [12, 18], [20, 22], [24, 26, 'c'], [18, 29], [4, 29], [-4, 26], [-8, 18], [-10, 10], [-16, 4]]],
    extra: [L('M-8,10 C-2,16 6,14 12,6', 'k', 1.5, { op: 0.3 }), SH('M-20,4 C-10,16 4,18 16,8 L20,20 L-20,20 Z', 0.12), HL('M-6,-10 C0,-14 8,-10 10,-4 C4,-6 -4,-6 -8,-2 Z', 0.16), ...claws(8, 22, 28, 3, 4)],
  }),
  rLeg({
    id: 'croc', slot: 'legsBack', name: 'Stubby', tags: ['croc'], dom: 0.5, w: 2,
    shapes: [[[-16, -6], [-4, -14], [10, -10], [18, 0], [16, 10], [16, 18], [22, 20], [24, 24, 'c'], [16, 27], [0, 27], [-8, 22], [-10, 14], [-16, 6]]],
    extra: [L('M-10,10 C-2,16 8,14 14,6', 'k', 1.5, { op: 0.3 }), SH('M-20,4 C-10,16 4,18 18,8 L22,20 L-20,20 Z', 0.12), HL('M-6,-10 C0,-14 8,-10 10,-4 C4,-6 -4,-6 -8,-2 Z', 0.16), ...claws(6, 20, 26, 3, 4)],
  }),
  rLeg({
    id: 'turtle', slot: 'legsBack', name: 'Stump', tags: ['turtle'], dom: 0.45, w: 2,
    shapes: [[[-14, -4], [-2, -10], [10, -6], [14, 4], [14, 14], [10, 22], [-2, 24], [-12, 20], [-14, 10]]],
    extra: [L('M-10,4 C-4,8 4,8 10,4 M-10,12 C-4,15 4,15 10,12', 'k', 1.1, { op: 0.25 }), SH('M-18,2 C-8,12 4,14 16,6 L18,18 L-18,18 Z', 0.12), ...claws(-6, 6, 23, 3, 3)],
  }),
  rLeg({
    id: 'dragon', slot: 'legsBack', name: 'Haunch', tags: ['dragon'], dom: 0.55, w: 2,
    shapes: [[[-18, -8], [-4, -18], [12, -14], [20, 0], [18, 12], [14, 24], [18, 32], [22, 36, 'c'], [14, 40], [0, 40], [-8, 36], [-8, 26], [-12, 16], [-18, 6]]],
    extra: [L('M-12,12 C-2,18 8,16 16,8', 'k', 1.5, { op: 0.3 }), SH('M-24,6 C-10,20 6,20 20,8 L24,22 L-24,22 Z', 0.12), SH('M-12,26 L20,26 L20,44 L-12,44 Z', 0.1), HL('M-8,-14 C0,-18 10,-14 12,-8 C6,-10 -4,-10 -10,-6 Z', 0.14), ...claws(2, 18, 39, 3, 5)],
  }),
  rLeg({
    id: 'chameleon', slot: 'legsBack', name: 'Gripper', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [[[-14, -6], [-2, -14], [10, -10], [16, 0], [13, 10], [10, 20], [14, 26], [16, 30, 'c'], [10, 34], [-2, 34], [-6, 28], [-8, 18], [-12, 10], [-16, 4]]],
    extra: [L('M-8,10 C-2,16 6,14 12,6', 'k', 1.5, { op: 0.3 }), SH('M-20,4 C-10,16 4,18 16,8 L20,20 L-20,20 Z', 0.12), HL('M-6,-10 C0,-14 8,-10 10,-4 C4,-6 -4,-6 -8,-2 Z', 0.16), L('M4,26 L4,33', 'k', 1.4, { op: 0.5 })],
  }),
  rLeg({
    id: 'raptor', slot: 'legsBack', name: 'Sickle', tags: ['raptor', 'big'], dom: 0.55, w: 2,
    shapes: [[[-18, -10], [-4, -20], [12, -16], [20, -2], [16, 10], [8, 20], [6, 30], [12, 36], [16, 40, 'c'], [8, 44], [-4, 44], [-8, 38], [-6, 28], [-8, 18], [-14, 10], [-20, 2]]],
    extra: [L('M-12,10 C-2,16 8,14 16,4', 'k', 1.5, { op: 0.3 }), SH('M-24,4 C-10,18 6,20 20,6 L24,22 L-24,22 Z', 0.12), SH('M-12,28 L18,28 L18,46 L-12,46 Z', 0.1), HL('M-8,-16 C0,-20 10,-16 12,-10 C6,-12 -4,-12 -10,-8 Z', 0.14), ...claws(0, 12, 43, 3, 5), P('M-6,36 C-12,38 -14,44 -10,48 C-10,44 -8,40 -4,39 Z', 'w', { sw: 1.2 })],
  }),
  rLeg({
    id: 'gecko', slot: 'legsBack', name: 'Padded', tags: ['gecko'], dom: 0.5, w: 2,
    shapes: [[[-14, -6], [-2, -14], [10, -10], [16, 0], [14, 10], [12, 18], [20, 20], [24, 24, 'c'], [18, 28], [4, 28], [-4, 26], [-8, 18], [-10, 10], [-16, 4]]],
    extra: [L('M-8,10 C-2,16 6,14 12,6', 'k', 1.5, { op: 0.3 }), SH('M-20,4 C-10,16 4,18 16,8 L20,20 L-20,20 Z', 0.12), HL('M-6,-10 C0,-14 8,-10 10,-4 C4,-6 -4,-6 -8,-2 Z', 0.16), ...pads(8, 26)],
  }),
];
