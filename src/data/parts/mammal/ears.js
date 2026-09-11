// Mammal ears. Origin = base of the ear (hidden inside the skull); the ear points up (-y).
// Fantasy cues: tufted or curled tips in the accent colour, ring and swirl inner markings,
// a real leaf for the forest kinds.
import { mPart } from './_shared.js';
import { S, PATCH, SH, L, C, HL } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';

export const M_EARS = [
  mPart({
    id: 'fox', slot: 'ears', name: 'Tufted', tags: ['fox', 'lynx'], dom: 0.55, w: 3,
    shapes: [[[-10, 4], [-10, -12], [-4, -27], [1, -46, 'c'], [4, -28], [10, -12], [10, 4]]],
    extra: [
      S([[-5, 0], [-5, -10], [0, -21, 0.3], [5, -10], [5, 0]], 's', { ns: true, cl: true }),
      PATCH('M-14,-20 L0,-52 L14,-20 Z', 'a'),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),

  mPart({
    id: 'cat', slot: 'ears', name: 'Curled', tags: ['cat'], dom: 0.5, w: 3,
    shapes: [[[-9, 3], [-9, -10], [-5, -20], [5, -30, 'c'], [3, -18], [9, -9], [9, 3]]],
    extra: [
      S([[-5, 0], [-5, -8], [-1, -16, 0.3], [4, -8], [5, 0]], 's', { ns: true, cl: true }),
      PATCH('M-10,-16 L6,-34 L10,-14 Z', 'a'),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'bear', slot: 'ears', name: 'Ringed', tags: ['bear', 'round'], dom: 0.5, w: 3,
    shapes: [[[-10, 2], [-12, -8], [-6, -17], [3, -18], [11, -10], [11, 2]]],
    extra: [
      S([[-6, 0], [-7, -7], [-3, -12], [3, -12], [7, -7], [6, 0]], 's', { ns: true, cl: true }),
      C(0, -7, 2.6, 'a', { ns: true }),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'rabbit', slot: 'ears', name: 'Ribbon', tags: ['rabbit', 'long'], dom: 0.55, w: 3,
    shapes: [[[-8, 4], [-9, -16], [-7, -34], [-2, -46], [6, -51, 0.3], [13, -45, 'c'], [7, -38], [8, -24], [8, 4]]],
    extra: [
      S([[-4, 0], [-5, -16], [-3, -32], [1, -41], [4, -36], [4, -20], [4, 0]], 's', { ns: true, cl: true }),
      PATCH('M-6,-40 L4,-58 L18,-42 L8,-30 Z', 'a'),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),

  mPart({
    id: 'deer', slot: 'ears', name: 'Leaf', tags: ['deer', 'grass'], dom: 0.5, w: 2,
    shapes: [[[-8, 3], [-12, -6], [-11, -13, 0.3], [-9, -16], [-7, -23, 0.3], [-4, -25], [0, -31, 'c'], [4, -25], [7, -23, 0.3], [9, -16], [11, -13, 0.3], [12, -6], [8, 3]]],
    extra: [
      S([[-4, 0], [-7, -6], [-5, -14], [-2, -21], [0, -26, 0.3], [2, -21], [5, -14], [7, -6], [4, 0]], 's', { ns: true, cl: true, op: 0.55 }),
      L('M0,-2 L0,-28', 'k', 1.3, { op: 0.4 }),
      L('M0,-9 L-6,-13 M0,-9 L6,-13 M0,-16 L-5,-20 M0,-16 L5,-20 M0,-22 L-3,-25 M0,-22 L3,-25', 'k', 1, { op: 0.35 }),
      SH('M-14,-4 L14,-4 L14,8 L-14,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'wolf', slot: 'ears', name: 'Shaggy', tags: ['wolf'], dom: 0.55, w: 2,
    shapes: [[[-11, 4], [-11, -8], [-9, -16, 0.3], [-7, -13], [-5, -24, 0.3], [-1, -20], [2, -32, 'c'], [6, -18], [10, -10], [11, 4]]],
    extra: [
      S([[-6, 0], [-5, -8], [-1, -17, 0.3], [4, -8], [6, 0]], 's', { ns: true, cl: true }),
      PATCH('M-10,-18 L2,-38 L10,-16 Z', 'a'),
      SH('M-14,-4 L14,-4 L14,8 L-14,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'mouse', slot: 'ears', name: 'Swirl dish', tags: ['mouse', 'round'], dom: 0.5, w: 3,
    shapes: [[[-11, 2], [-15, -10], [-9, -22], [0, -25], [9, -22], [15, -10], [11, 2]]],
    extra: [
      S([[-7, 0], [-10, -9], [-5, -17], [0, -19], [5, -17], [10, -9], [7, 0]], 'a', { ns: true, cl: true }),
      L(spiralPath(0, -10, 6.5, 1.6, 200), 'k', 1.4, { op: 0.4 }),
      HL('M-8,-18 C-4,-22 4,-22 8,-18 L6,-15 C2,-18 -2,-18 -6,-15 Z', 0.2),
      SH('M-16,-4 L16,-4 L16,8 L-16,8 Z', 0.18),
    ],
  }),
];
