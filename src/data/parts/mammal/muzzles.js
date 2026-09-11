// Mammal muzzles: nose, mouth and whisker marks. Origin = nose tip on the head's muzzle socket.
import { mPart } from './_shared.js';
import { E, C, L, P } from '../_dsl.js';

export const M_MUZZLES = [
  mPart({
    id: 'fox', slot: 'muzzle', name: 'Pointed', tags: ['fox'], dom: 0.55, w: 3,
    extra: [
      E(-1, 0, 4.2, 3.1, 'k', { ns: true }),
      C(-2.4, -1, 1.1, 'w', { ns: true, op: 0.8 }),
      L('M-3,3 C-4,7 -8,9 -13,6', 'k', 1.9),
      L('M-9,-3 L-14,-2 M-10,0 L-15,1', 'k', 1.1, { op: 0.4 }),
    ],
  }),

  mPart({
    id: 'cat', slot: 'muzzle', name: 'Button', tags: ['cat'], dom: 0.5, w: 3,
    extra: [
      P('M-3.2,-2 L3.2,-2 L0,2.2 Z', 'a', { sw: 1.6 }),
      L('M0,2 C0,5 -3,6.5 -5.5,4.5 M0,2 C0,5 3,6.5 5.5,4.5', 'k', 1.6),
      L('M-8,-1 L-18,-4 M-8,2 L-18,3', 'k', 1, { op: 0.35 }),
      C(-9, 0, 0.9, 'k', { ns: true, op: 0.45 }), C(-11, 3, 0.9, 'k', { ns: true, op: 0.45 }), C(-12, -3, 0.9, 'k', { ns: true, op: 0.45 }),
    ],
  }),
  mPart({
    id: 'bear', slot: 'muzzle', name: 'Broad', tags: ['bear'], dom: 0.55, w: 2,
    extra: [
      E(0, -1, 5.6, 4.2, 'k', { ns: true }),
      C(-2, -2.4, 1.4, 'w', { ns: true, op: 0.8 }),
      L('M-2,4 C-3,8 -8,9.5 -12,6.5', 'k', 1.9),
    ],
  }),
  mPart({
    id: 'rabbit', slot: 'muzzle', name: 'Twitchy', tags: ['rabbit'], dom: 0.5, w: 2,
    extra: [
      P('M-3,-1.6 L3,-1.6 L0,2 Z', 'a', { sw: 1.5 }),
      L('M0,2 L0,4.5 M0,4.5 C0,7 -3,8 -5,6 M0,4.5 C0,7 3,8 5,6', 'k', 1.5),
      P('M-3.2,6 L3.2,6 L3,11 L-3,11 Z', 'w', { sw: 1.3 }), L('M0,6.5 L0,10.5', 'k', 1),
      L('M-8,0 L-17,-3 M-8,3 L-17,4', 'k', 1, { op: 0.35 }),
    ],
  }),

  mPart({
    id: 'deer', slot: 'muzzle', name: 'Soft', tags: ['deer'], dom: 0.5, w: 2,
    extra: [
      E(0, -1, 4, 3, 'k', { ns: true }),
      C(-1.6, -2, 1.1, 'w', { ns: true, op: 0.8 }),
      L('M-2,3 C-3,6 -6,7 -9,5.5', 'k', 1.7),
    ],
  }),
  mPart({
    id: 'wolf', slot: 'muzzle', name: 'Fanged', tags: ['wolf'], dom: 0.55, w: 2,
    extra: [
      E(-1, -1, 4.6, 3.4, 'k', { ns: true }),
      C(-2.8, -2.2, 1.2, 'w', { ns: true, op: 0.8 }),
      L('M-3,3 C-5,8 -10,10 -16,7', 'k', 1.9),
      P('M-9,7.4 L-7,12.5 L-4.6,7.2 Z', 'w', { sw: 1.2 }),
    ],
  }),
  mPart({
    id: 'mouse', slot: 'muzzle', name: 'Whiskered', tags: ['mouse'], dom: 0.45, w: 3,
    extra: [
      C(0, 0, 3, 'a', { sw: 1.6 }),
      C(-1, -1, 0.9, 'w', { ns: true, op: 0.8 }),
      L('M-2,3 C-3,5.5 -6,6 -8,4.5', 'k', 1.5),
      L('M-6,-2 L-20,-6 M-6,0 L-20,0 M-6,2 L-19,5', 'k', 1, { op: 0.4 }),
    ],
  }),
];
