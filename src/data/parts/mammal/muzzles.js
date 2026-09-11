// Mammal muzzles: nose, mouth and whisker marks. Origin = nose tip on the head's muzzle socket.
// Noses are accent-coloured shapes (triangle, heart, button) rather than plain black where the
// kind allows it; the heavier kinds carry tusks or twin fangs.
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
  }),

  mPart({
    id: 'cat', slot: 'muzzle', name: 'Heart nose', tags: ['cat'], dom: 0.5, w: 3,
    extra: [
      P(heartPath(0, -0.6, 3.4), 'a', { sw: 1.5 }),
      L('M0,2.4 C0,5 -3,6.5 -5.5,4.5 M0,2.4 C0,5 3,6.5 5.5,4.5', 'k', 1.6),
      L('M-8,-1 L-18,-4 M-8,2 L-18,3', 'k', 1, { op: 0.35 }),
      C(-9, 0, 0.9, 'k', { ns: true, op: 0.45 }), C(-11, 3, 0.9, 'k', { ns: true, op: 0.45 }), C(-12, -3, 0.9, 'k', { ns: true, op: 0.45 }),
    ],
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
  }),
  mPart({
    id: 'rabbit', slot: 'muzzle', name: 'Twitchy', tags: ['rabbit'], dom: 0.5, w: 2,
    extra: [
      P(heartPath(0, -0.6, 3), 'a', { sw: 1.4 }),
      L('M0,2.2 L0,4.5 M0,4.5 C0,7 -3,8 -5,6 M0,4.5 C0,7 3,8 5,6', 'k', 1.5),
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
      C(-12, 1, 1, 'a', { ns: true, op: 0.7 }), C(-15, 4.5, 0.8, 'a', { ns: true, op: 0.6 }),
    ],
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
  }),
];
