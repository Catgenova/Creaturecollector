// Mammal manes and ruffs: neck and chest fur worn in front of the torso, behind the head.
// Origin = the body's mane socket at the base of the neck.
import { mPart } from './_shared.js';
import { NONE, fur, SH, HL } from '../_dsl.js';

export const M_MANES = [
  NONE('mane', 0.3, 'm.'),
  mPart({
    id: 'fox', slot: 'mane', name: 'Chest ruff', tags: ['fox'], dom: 0.5, w: 3,
    shapes: [[[-26, -10], [-6, -14], [4, -10], ...fur([6, -4], [-2, 22], 3, 5, { lean: 0.4 }), [-12, 28], [-24, 22], [-30, 6]]],
    extra: [SH('M-34,12 C-22,22 -8,24 4,16 L6,34 L-34,34 Z', 0.12)],
  }),

  mPart({
    id: 'cat', slot: 'mane', name: 'Bib', tags: ['cat'], dom: 0.45, w: 2,
    shapes: [[[-20, -8], [-4, -12], [4, -6], ...fur([4, 0], [-4, 16], 2, 4, { lean: 0.3 }), [-14, 20], [-24, 12], [-26, 0]]],
    extra: [SH('M-30,8 C-20,18 -8,20 2,12 L4,28 L-30,28 Z', 0.12)],
  }),
  mPart({
    id: 'bear', slot: 'mane', name: 'Shag', tags: ['bear'], dom: 0.45, w: 2,
    shapes: [[[-24, -10], [-6, -16], [10, -12], [16, -2], ...fur([14, 4], [-6, 22], 3, 5, { lean: 0.35 }), [-20, 20], [-30, 8]]],
    extra: [SH('M-34,8 C-20,20 -4,22 10,12 L12,30 L-34,30 Z', 0.12), HL('M-20,-12 C-10,-18 2,-18 10,-12 L6,-8 C0,-12 -10,-12 -18,-8 Z', 0.14)],
  }),
  mPart({
    id: 'rabbit', slot: 'mane', name: 'Dewlap', tags: ['rabbit'], dom: 0.4, w: 2,
    shapes: [[[-20, -6], [-6, -8], [4, -2], [6, 8], [0, 16], [-12, 16], [-22, 8]]],
    extra: [SH('M-26,6 C-16,16 -4,18 6,10 L8,22 L-26,22 Z', 0.12)],
  }),

  mPart({
    id: 'deer', slot: 'mane', name: 'Bell', tags: ['deer'], dom: 0.4, w: 2,
    shapes: [[[-10, -14], [6, -16], [12, -4], ...fur([10, 4], [4, 26], 3, 4, { lean: 0.35 }), [-4, 30], [-14, 18], [-16, 2]]],
    extra: [SH('M-20,10 C-10,20 2,22 10,14 L12,32 L-20,32 Z', 0.12)],
  }),
  mPart({
    id: 'wolf', slot: 'mane', name: 'Collar', tags: ['wolf'], dom: 0.5, w: 2,
    shapes: [[[-26, -14], [-6, -20], [8, -16], [14, -6], ...fur([14, 0], [4, 26], 4, 6, { lean: 0.35 }), [-8, 32], [-24, 26], [-32, 10]]],
    extra: [SH('M-36,12 C-22,24 -6,26 10,16 L12,34 L-36,34 Z', 0.12), HL('M-22,-16 C-10,-22 2,-22 10,-16 L6,-12 C0,-16 -10,-16 -20,-12 Z', 0.14)],
  }),
  mPart({
    id: 'lion', slot: 'mane', name: 'Lion mane', tags: ['lion', 'big'], dom: 0.6, w: 1,
    shapes: [[[-34, -30], [-10, -42], [14, -40], [28, -26], ...fur([30, -12], [22, 30], 5, 8, { lean: 0.3 }), ...fur([16, 36], [-24, 38], 4, 7, { lean: 0.2 }), ...fur([-32, 30], [-42, -6], 4, 7, { lean: 0.2 })]],
    extra: [SH('M-46,10 C-24,30 4,32 28,16 L30,44 L-46,44 Z', 0.12), HL('M-30,-30 C-12,-42 10,-42 24,-30 L18,-24 C6,-32 -12,-32 -26,-24 Z', 0.14)],
  }),
  mPart({
    id: 'mouse', slot: 'mane', name: 'Tuft', tags: ['mouse'], dom: 0.35, w: 2,
    shapes: [[[-12, -6], [0, -9], [6, -2], ...fur([6, 2], [0, 12], 2, 3, { lean: 0.3 }), [-6, 14], [-12, 8], [-14, 0]]],
    extra: [SH('M-16,6 C-8,14 0,14 6,8 L8,18 L-16,18 Z', 0.12)],
  }),
];
