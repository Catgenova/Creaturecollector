// Mammal ears. Origin = base of the ear (hidden inside the skull); the ear points up (-y).
import { mPart } from './_shared.js';
import { S, PATCH, SH } from '../_dsl.js';

export const M_EARS = [
  mPart({
    id: 'fox', slot: 'ears', name: 'Tall', tags: ['fox'], dom: 0.55, w: 3,
    shapes: [[[-10, 4], [-9, -12], [0, -30, 0.3], [9, -12], [10, 4]]],
    extra: [
      S([[-5, 0], [-5, -10], [0, -21, 0.3], [5, -10], [5, 0]], 's', { ns: true, cl: true }),
      PATCH('M-13,-19 L0,-37 L13,-19 Z', 'k', { op: 0.55 }),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),

  mPart({
    id: 'cat', slot: 'ears', name: 'Pointed', tags: ['cat'], dom: 0.5, w: 3,
    shapes: [[[-9, 3], [-9, -10], [0, -24, 0.2], [9, -10], [9, 3]]],
    extra: [
      S([[-5, 0], [-5, -8], [0, -16, 0.2], [5, -8], [5, 0]], 'a', { ns: true, cl: true }),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'bear', slot: 'ears', name: 'Round', tags: ['bear'], dom: 0.5, w: 3,
    shapes: [[[-9, 2], [-10, -8], [-4, -15], [4, -15], [10, -8], [9, 2]]],
    extra: [
      S([[-5, 0], [-6, -6], [-2, -10], [2, -10], [6, -6], [5, 0]], 's', { ns: true, cl: true }),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'rabbit', slot: 'ears', name: 'Long', tags: ['rabbit'], dom: 0.55, w: 3,
    shapes: [[[-8, 4], [-9, -16], [-5, -38], [0, -44, 0.3], [5, -38], [9, -16], [8, 4]]],
    extra: [
      S([[-4, 0], [-5, -16], [-2, -33], [0, -37, 0.3], [2, -33], [5, -16], [4, 0]], 'a', { ns: true, cl: true }),
      SH('M-12,-4 L12,-4 L12,8 L-12,8 Z', 0.18),
    ],
  }),

  mPart({
    id: 'deer', slot: 'ears', name: 'Leaf', tags: ['deer'], dom: 0.5, w: 2,
    shapes: [[[-8, 3], [-11, -8], [-6, -20], [0, -26, 0.3], [7, -20], [11, -8], [8, 3]]],
    extra: [
      S([[-4, 0], [-6, -8], [-3, -16], [0, -19, 0.3], [3, -16], [6, -8], [4, 0]], 's', { ns: true, cl: true }),
      SH('M-14,-4 L14,-4 L14,8 L-14,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'wolf', slot: 'ears', name: 'Thick', tags: ['wolf'], dom: 0.55, w: 2,
    shapes: [[[-11, 4], [-10, -10], [-2, -26, 0.3], [8, -12], [11, 4]]],
    extra: [
      S([[-6, 0], [-5, -8], [-1, -17, 0.3], [4, -8], [6, 0]], 's', { ns: true, cl: true }),
      SH('M-14,-4 L14,-4 L14,8 L-14,8 Z', 0.18),
    ],
  }),
  mPart({
    id: 'mouse', slot: 'ears', name: 'Dish', tags: ['mouse'], dom: 0.5, w: 3,
    shapes: [[[-10, 2], [-13, -10], [-8, -20], [0, -23], [8, -20], [13, -10], [10, 2]]],
    extra: [
      S([[-6, 0], [-9, -9], [-5, -16], [0, -18], [5, -16], [9, -9], [6, 0]], 'a', { ns: true, cl: true }),
      SH('M-16,-4 L16,-4 L16,8 L-16,8 Z', 0.18),
    ],
  }),
];
