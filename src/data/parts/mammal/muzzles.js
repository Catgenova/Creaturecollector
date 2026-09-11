// Mammal muzzles: nose, mouth and whisker marks. Origin = nose tip on the head's muzzle socket.
// Noses are accent-coloured shapes (triangle, heart, button) rather than plain black where the
// kind allows it; the heavier kinds carry tusks or twin fangs.
// Evolutions: stage 2 grows the nose, lengthens whiskers and bares a fang or a bigger tusk;
// stage 3 tips the whiskers with accent beads and doubles the fangs.
import { mPart } from './_shared.js';
import { E, C, L, P } from '../_dsl.js';
import { heartPath } from '../_sigils.js';

export const M_MUZZLES = [
  mPart({
    id: 'fox', slot: 'muzzle', name: 'Pointed', tags: ['fox'], dom: 0.55, w: 3,
    extra: [
      P('M-4.6,-2.6 L3.4,-2.6 L-0.6,2.8 Z', 'a', { sw: 1.6 }),
      C(-2.2, -1.3, 0.9, 'w', { ns: true, op: 0.8 }),
      L('M-3,3 C-4,7 -8,9 -13,6', 'k', 1.9),
      L('M-9,-3 L-15,-4 M-10,0 L-16,1', 'k', 1.1, { op: 0.4 }),
    ],
    stages: {
      2: { grow: [1.12, 1.12], add: [L('M-9,-6 L-17,-9 M-10,3 L-17,6', 'k', 1.1, { op: 0.4 }), P('M-6,4.6 L-4.6,9.6 L-3,4.4 Z', 'w', { sw: 1.1 })] },
      3: { reset: true, grow: [1.23, 1.23], add: [L('M-9,-6 L-17,-9 M-10,3 L-17,6', 'k', 1.1, { op: 0.4 }), P('M-6.4,4.6 L-4.4,11 L-2.6,4.4 Z', 'w', { sw: 1.1 }), P('M-11,5.4 L-9.6,10.4 L-8.2,5.2 Z', 'w', { sw: 1.1 }), C(-17.4, -9.2, 1, 'a', { ns: true }), C(-16.4, 1.2, 1, 'a', { ns: true }), C(-17.4, 6.2, 1, 'a', { ns: true })] },
    },
  }),

  mPart({
    id: 'cat', slot: 'muzzle', name: 'Heart nose', tags: ['cat'], dom: 0.5, w: 3,
    extra: [
      P(heartPath(0, -0.6, 3.4), 'a', { sw: 1.5 }),
      L('M0,2.4 C0,5 -3,6.5 -5.5,4.5 M0,2.4 C0,5 3,6.5 5.5,4.5', 'k', 1.6),
      L('M-8,-1 L-18,-4 M-8,2 L-18,3', 'k', 1, { op: 0.35 }),
      C(-9, 0, 0.9, 'k', { ns: true, op: 0.45 }), C(-11, 3, 0.9, 'k', { ns: true, op: 0.45 }), C(-12, -3, 0.9, 'k', { ns: true, op: 0.45 }),
    ],
    stages: {
      2: { grow: [1.1, 1.1], add: [L('M-8,-4 L-19,-8 M-8,5 L-18,8', 'k', 1, { op: 0.35 }), P('M-4.4,5 L-3.2,9.4 L-1.8,5 Z', 'w', { sw: 1 }), P('M1.8,5 L3.2,9.4 L4.4,5 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.21, 1.21], add: [L('M-8,-4 L-19,-8 M-8,5 L-18,8', 'k', 1, { op: 0.35 }), P('M-4.6,5 L-3.2,10.6 L-1.6,5 Z', 'w', { sw: 1 }), P('M1.6,5 L3.2,10.6 L4.6,5 Z', 'w', { sw: 1 }), C(-19.4, -8.2, 1, 'a', { ns: true }), C(-18.6, 3.2, 1, 'a', { ns: true }), C(-18.4, 8.2, 1, 'a', { ns: true }), P(heartPath(0, -0.6, 4.4), 'a', { sw: 1.5 })] },
    },
  }),
  mPart({
    id: 'bear', slot: 'muzzle', name: 'Tusked', tags: ['bear', 'boar'], dom: 0.55, w: 2,
    extra: [
      E(0, -1, 5.6, 4.2, 'k', { ns: true }),
      C(-2, -2.4, 1.4, 'w', { ns: true, op: 0.8 }),
      L('M-2,4 C-3,8 -8,9.5 -12,6.5', 'k', 1.9),
      P('M-10.4,9 L-8.4,3.2 L-6.4,8.6 Z', 'w', { sw: 1.2 }),
      P('M-5,9.6 L-3.8,5.8 L-2.4,9.4 Z', 'w', { sw: 1.1 }),
    ],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-13.4,10.4 L-10.4,2.2 L-7.4,10 Z', 'w', { sw: 1.3 }), P('M-6,11 L-4,5 L-2,10.8 Z', 'w', { sw: 1.2 })] },
      3: { reset: true, grow: [1.23, 1.23], add: [P('M-16,11.6 L-12.4,1 L-8.6,11 Z', 'w', { sw: 1.4 }), P('M-7,12.4 L-4.2,4.2 L-1.4,12 Z', 'w', { sw: 1.3 }), L('M-13,6 L-11,7 M-5,8 L-3.5,9', 'a', 1.4, { ns: true, op: 0.7 })] },
    },
  }),
  mPart({
    id: 'rabbit', slot: 'muzzle', name: 'Twitchy', tags: ['rabbit'], dom: 0.5, w: 2,
    extra: [
      P(heartPath(0, -0.6, 3), 'a', { sw: 1.4 }),
      L('M0,2.2 L0,4.5 M0,4.5 C0,7 -3,8 -5,6 M0,4.5 C0,7 3,8 5,6', 'k', 1.5),
      P('M-3.2,6 L3.2,6 L3,11 L-3,11 Z', 'w', { sw: 1.3 }), L('M0,6.5 L0,10.5', 'k', 1),
      L('M-8,0 L-17,-3 M-8,3 L-17,4', 'k', 1, { op: 0.35 }),
    ],
    stages: {
      2: { grow: [1.1, 1.1], add: [L('M-8,-3 L-19,-7 M-8,6 L-18,8', 'k', 1, { op: 0.35 }), P('M-3.6,6 L3.6,6 L3.4,12.6 L-3.4,12.6 Z', 'w', { sw: 1.3 }), L('M0,6.5 L0,12', 'k', 1)] },
      3: { grow: [1.1, 1.1], add: [C(-19.4, -7.2, 1, 'a', { ns: true }), C(-17.6, 0.5, 1, 'a', { ns: true }), C(-18.4, 8.2, 1, 'a', { ns: true }), P(heartPath(0, -0.8, 3.8), 'a', { sw: 1.4 })] },
    },
  }),

  mPart({
    id: 'deer', slot: 'muzzle', name: 'Soft', tags: ['deer'], dom: 0.5, w: 2,
    extra: [
      E(0, -1, 4, 3, 'k', { ns: true }),
      C(-1.6, -2, 1.1, 'w', { ns: true, op: 0.8 }),
      L('M-2,3 C-3,6 -6,7 -9,5.5', 'k', 1.7),
      C(-12, 1, 1, 'a', { ns: true, op: 0.7 }), C(-15, 4.5, 0.8, 'a', { ns: true, op: 0.6 }),
    ],
    stages: {
      2: { grow: [1.1, 1.1], add: [C(-13, -3, 1.2, 'a', { ns: true, op: 0.75 }), C(-17, 8, 0.9, 'a', { ns: true, op: 0.6 }), C(-9, -6, 0.8, 'a', { ns: true, op: 0.6 })] },
      3: { grow: [1.1, 1.1], add: [L('M-6,-4 L-14,-8 M-7,5 L-14,8', 'a', 1.2, { ns: true, op: 0.6 }), E(0, -1, 4.8, 3.6, 'k', { ns: true }), C(-1.9, -2.3, 1.3, 'w', { ns: true, op: 0.8 })] },
    },
  }),
  mPart({
    id: 'wolf', slot: 'muzzle', name: 'Fanged', tags: ['wolf'], dom: 0.55, w: 2,
    extra: [
      E(-1, -1, 4.6, 3.4, 'k', { ns: true }),
      C(-2.8, -2.2, 1.2, 'w', { ns: true, op: 0.8 }),
      L('M-3,3 C-5,8 -10,10 -16,7', 'k', 1.9),
      P('M-9,7.4 L-7,13 L-4.6,7.2 Z', 'w', { sw: 1.2 }),
      P('M-15,6.8 L-13.6,11.2 L-12,6.6 Z', 'w', { sw: 1.1 }),
    ],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-10,7.6 L-7.4,15.4 L-4.6,7.4 Z', 'w', { sw: 1.3 }), P('M-16,7 L-14,13 L-12,6.8 Z', 'w', { sw: 1.2 })] },
      3: { reset: true, grow: [1.23, 1.23], add: [L('M-3,3 C-6,10 -12,12.5 -19,9', 'k', 2.1), P('M-11,7.8 L-7.6,18 L-4,7.6 Z', 'w', { sw: 1.4 }), P('M-17.4,7.6 L-14.6,15 L-11.8,7.2 Z', 'w', { sw: 1.3 })] },
    },
  }),
  mPart({
    id: 'mouse', slot: 'muzzle', name: 'Whiskered', tags: ['mouse'], dom: 0.45, w: 3,
    extra: [
      C(0, 0, 3, 'a', { sw: 1.6 }),
      C(-1, -1, 0.9, 'w', { ns: true, op: 0.8 }),
      L('M-2,3 C-3,5.5 -6,6 -8,4.5', 'k', 1.5),
      L('M-6,-2 L-20,-6 M-6,0 L-20,0 M-6,2 L-19,5', 'k', 1, { op: 0.4 }),
      C(-20.5, -6.2, 1.1, 'a', { ns: true }), C(-20.5, 0, 1.1, 'a', { ns: true }), C(-19.5, 5.2, 1.1, 'a', { ns: true }),
    ],
    stages: {
      2: { grow: [1.1, 1.1], add: [L('M-6,-3.5 L-22,-10 M-6,3.5 L-21,9', 'k', 1, { op: 0.4 }), C(-22.5, -10.4, 1.2, 'a', { ns: true }), C(-21.5, 9.4, 1.2, 'a', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [C(0, 0, 3.8, 'a', { sw: 1.6 }), C(-1.2, -1.2, 1.1, 'w', { ns: true, op: 0.8 }), P('M-3,5.2 L3,5.2 L2.6,9.6 L-2.6,9.6 Z', 'w', { sw: 1.2 }), L('M0,5.6 L0,9.2', 'k', 1)] },
    },
  }),
];
