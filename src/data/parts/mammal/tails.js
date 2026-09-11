// Mammal tails. Origin = tail root on the body's rear. Tails sweep left (-x) and up or down.
// Every tail ends in something a real animal's would not: a flame-cut brush, a curled tuft,
// a leaf, a floating sparkle, a banner stripe or an orb.
import { mPart } from './_shared.js';
import { fur, S, P, C, L, SH, HL, tube, puff } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';

export const M_TAILS = [
  mPart({
    id: 'fox', slot: 'tail', name: 'Flame brush', tags: ['fox', 'bushy'], dom: 0.55, w: 3,
    shapes: [[[0, 8], [-14, 16], [-30, 18], [-40, 26, 0.2], [-46, 16], [-58, 10], [-70, -2], [-78, -14, 0.2], [-70, -22], [-76, -34, 0.2], [-62, -30], [-58, -42, 0.2], [-50, -30], [-44, -40, 0.2], [-38, -26], [-24, -20], [-10, -13], [-2, -8]]],
    extra: [
      S([[-82, -18], [-72, -32], [-58, -42], [-44, -36], [-40, -14], [-54, 0], [-68, 6]], 's', { ns: true, cl: true }),
      SH('M-80,4 C-46,16 -22,20 6,12 L6,32 L-80,32 Z', 0.13),
      HL('M-52,-28 C-38,-30 -22,-24 -6,-14 L-8,-8 C-22,-16 -38,-22 -52,-20 Z', 0.16),
    ],
  }),

  mPart({
    id: 'cat', slot: 'tail', name: 'Curled tuft', tags: ['cat', 'long'], dom: 0.5, w: 3,
    shapes: [
      tube([[2, 0], [-14, 4], [-28, 2], [-38, -8], [-42, -22], [-38, -36], [-28, -46], [-16, -48], [-10, -42]], 10, 6, { bulge: 1.05 }),
      [[-14, -50], [-4, -54, 0.3], [0, -44, 'c'], [-6, -36], [-14, -40]],
    ],
    extra: [
      S([[-10, -50], [-4, -50], [-4, -42], [-10, -40]], 'a', { ns: true, cl: true, op: 0.9 }),
      SH('M-50,0 C-30,10 -10,12 6,8 L6,20 L-50,20 Z', 0.13),
      HL('M-42,-26 C-40,-36 -36,-42 -30,-46 L-26,-42 C-32,-38 -36,-30 -38,-24 Z', 0.16),
    ],
  }),
  mPart({
    id: 'bear', slot: 'tail', name: 'Pom', tags: ['bear', 'short'], dom: 0.4, w: 2,
    shapes: [puff(-8, -2, 9, 7, 3, { rot: 15 })],
    extra: [C(-8, -2, 4.5, 's', { ns: true, cl: true }), SH('M-20,2 L4,2 L4,14 L-20,14 Z', 0.14), HL('M-13,-10 C-9,-13 -4,-12 -2,-9 L-4,-6 C-7,-8 -10,-8 -12,-6 Z', 0.16)],
  }),
  mPart({
    id: 'rabbit', slot: 'tail', name: 'Cloud puff', tags: ['rabbit', 'short'], dom: 0.45, w: 2,
    shapes: [puff(-10, -6, 12, 9, 4, { rot: 10 })],
    extra: [
      S(puff(-10, -6, 6, 7, 2, { rot: 30 }), 's', { ns: true, cl: true, op: 0.7 }),
      SH('M-24,-2 L4,-2 L4,12 L-24,12 Z', 0.14), HL('M-16,-15 C-12,-18 -6,-17 -4,-14 L-6,-11 C-9,-13 -13,-13 -15,-11 Z', 0.18),
      P(sparklePath(-24, -20, 4.5), 'a', { ns: true }), P(sparklePath(-4, -22, 2.6, 20), 'a', { ns: true, op: 0.8 }),
    ],
  }),

  mPart({
    id: 'deer', slot: 'tail', name: 'Leaf', tags: ['deer', 'grass'], dom: 0.4, w: 2,
    shapes: [[[2, -4], [-8, -14], [-22, -20], [-38, -14, 'c'], [-26, -4], [-14, 6], [-2, 8]]],
    extra: [
      S([[-4, -2], [-12, -10], [-24, -14], [-32, -13], [-24, -6], [-14, 2], [-6, 4]], 's', { ns: true, cl: true, op: 0.5 }),
      L('M0,0 C-10,-6 -22,-10 -34,-13', 'k', 1.3, { op: 0.4 }),
      L('M-10,-4 L-14,-13 M-18,-7 L-22,-17 M-10,-4 L-8,4 M-18,-7 L-18,3', 'k', 1, { op: 0.3 }),
    ],
  }),
  mPart({
    id: 'wolf', slot: 'tail', name: 'Banner', tags: ['wolf', 'bushy'], dom: 0.55, w: 2,
    shapes: [[[0, -8], [-12, -6], [-26, 0], [-38, 12], [-46, 26], [-56, 44, 0.2], [-46, 42], [-48, 56, 0.2], [-38, 46], [-36, 56, 0.2], [-30, 40], [-26, 24], [-16, 12], [-4, 8]]],
    extra: [
      S([[-58, 42], [-48, 30], [-36, 36], [-40, 52]], 's', { ns: true, cl: true }),
      S([[-4, -3], [-18, 0], [-32, 10], [-40, 22], [-38, 14], [-26, 4], [-10, 1]], 'a', { ns: true, cl: true, op: 0.85 }),
      SH('M-60,26 C-42,32 -26,26 -14,14 L-2,14 L-2,62 L-60,62 Z', 0.12),
      HL('M-24,0 C-16,-4 -8,-6 0,-6 L0,-1 C-8,-1 -16,2 -22,6 Z', 0.16),
    ],
  }),
  mPart({
    id: 'mouse', slot: 'tail', name: 'Orb cord', tags: ['mouse', 'long'], dom: 0.45, w: 3,
    shapes: [tube([[0, 0], [-12, 6], [-22, 16], [-30, 28], [-22, 36], [-30, 44], [-24, 52]], 7, 3)],
    extra: [
      C(-24, 55, 5, 'a', { sw: 2.2 }), C(-25.6, 53.4, 1.4, 'w', { ns: true, op: 0.85 }),
      SH('M-36,30 C-30,42 -20,50 -6,52 L-6,60 L-36,60 Z', 0.14),
    ],
  }),
];
