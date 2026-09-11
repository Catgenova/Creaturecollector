// Mammal back features: wings, ridges and fur along the spine. Origin = the body's back socket,
// on the spine; features grow up (-y) and sweep back (-x). Drawn behind the torso.
import { mPart } from './_shared.js';
import { NONE, P, S, L, SH, HL, fur } from '../_dsl.js';

export const M_BACKS = [
  NONE('back', 0.3, 'm.'),
  mPart({
    id: 'batwings', slot: 'back', name: 'Bat wings', tags: ['bat', 'wings'], dom: 0.55, w: 1,
    shapes: [[[2, 2], [-6, -26], [-28, -44], [-58, -42, 0.3], [-46, -28], [-60, -18, 0.3], [-44, -10], [-52, 2, 0.3], [-32, 2], [-12, 6]]],
    extra: [
      P('M-6,-26 C-14,-34 -24,-40 -32,-42 M-8,-24 C-22,-28 -34,-30 -46,-30 M-8,-18 C-22,-16 -34,-14 -44,-12', 'none', { sw: 1.6 }),
      SH('M-60,-14 C-40,-6 -20,0 4,4 L4,12 L-60,12 Z', 0.16),
      S([[-4, -22], [-22, -36], [-40, -38], [-36, -30], [-20, -26], [-8, -16]], 's', { ns: true, cl: true, op: 0.7 }),
    ],
  }),
  mPart({
    id: 'wings', slot: 'back', name: 'Feathered', tags: ['bird', 'wings'], dom: 0.55, w: 1,
    shapes: [[[2, -2], [-4, -24], [-22, -38], [-48, -40], [-62, -30, 0.3], [-46, -24], [-60, -14, 0.3], [-42, -12], [-50, -2, 0.3], [-30, 0], [-10, 4]]],
    extra: [
      L('M-10,-18 C-24,-20 -38,-22 -50,-24 M-10,-10 C-24,-10 -36,-10 -46,-12 M-12,-4 C-24,-4 -32,-4 -42,-4', 'k', 1.4, { op: 0.3 }),
      S([[-2, -22], [-20, -34], [-44, -36], [-40, -28], [-20, -26], [-6, -14]], 's', { ns: true, cl: true, op: 0.6 }),
      SH('M-62,-8 C-40,-2 -20,2 4,4 L4,12 L-62,12 Z', 0.14),
    ],
  }),
  mPart({
    id: 'ridge', slot: 'back', name: 'Ridge fur', tags: ['fur'], dom: 0.45, w: 2,
    shapes: [[[26, 6], ...fur([26, 6], [-30, 6], 5, -10, { lean: 0.4 }), [-34, 10], [26, 10]]],
    extra: [SH('M-36,4 L28,4 L28,14 L-36,14 Z', 0.14)],
  }),
  mPart({
    id: 'quills', slot: 'back', name: 'Quills', tags: ['spiky'], dom: 0.5, w: 2,
    shapes: [[[28, 6], ...fur([28, 6], [-32, 6], 7, -16, { lean: 0.45, tip: 'c', wobble: 0.25 }), [-36, 10], [28, 10]]],
    extra: [S([[8, 4], [14, -6], [2, -10], [-6, 2]], 's', { ns: true, cl: true, op: 0.5 }), SH('M-38,4 L30,4 L30,14 L-38,14 Z', 0.14)],
  }),
  mPart({
    id: 'saddle', slot: 'back', name: 'Saddle mane', tags: ['fur', 'mane'], dom: 0.45, w: 2,
    shapes: [[[24, 6], [18, -8], [6, -16], ...fur([-2, -18], [-34, -6], 4, 8, { lean: 0.4 }), [-40, 6], [-42, 12], [24, 12]]],
    extra: [SH('M-44,4 L26,4 L26,16 L-44,16 Z', 0.14), HL('M14,-6 C6,-12 -6,-14 -16,-10 L-14,-6 C-6,-8 4,-6 12,-2 Z', 0.16)],
  }),
  mPart({
    id: 'flame', slot: 'back', name: 'Flame crest', tags: ['fire'], dom: 0.5, w: 1,
    shapes: [[[14, 6], [16, -8], [8, -20], [14, -36, 0.2], [2, -28], [-4, -46, 0.2], [-10, -28], [-20, -36, 0.2], [-16, -18], [-28, -14, 0.2], [-16, -4], [-22, 6]]],
    extra: [
      S([[8, 4], [10, -8], [2, -18], [-4, -30, 0.2], [-8, -16], [-14, -8], [-12, 4]], 's', { ns: true, cl: true }),
      HL('M0,-4 C4,-10 6,-16 4,-22 L0,-22 C0,-16 -2,-10 -6,-4 Z', 0.3),
    ],
  }),
  mPart({
    id: 'crystals', slot: 'back', name: 'Crystals', tags: ['ice', 'rock'], dom: 0.5, w: 1,
    extra: [
      P('M-24,8 L-30,-10 L-20,-26 L-12,-8 L-14,8 Z', 'pd'),
      P('M-4,8 L-10,-14 L2,-40 L14,-16 L10,8 Z', 'p'),
      P('M14,8 L12,-6 L22,-22 L30,-6 L26,8 Z', 'pl'),
      HL('M-6,-10 L2,-32 L4,-30 L-2,-8 Z', 0.35), HL('M14,-8 L22,-18 L24,-16 L18,-6 Z', 0.3),
      L('M-24,8 L-22,-6 M-4,8 L0,-12 M14,8 L18,-4', 'k', 1.2, { op: 0.3 }),
    ],
  }),
];
