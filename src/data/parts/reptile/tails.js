// Reptile tails. Origin = tail root on the body's rear; tails sweep left (-x).
import { rPart } from './_shared.js';
import { S, SH, HL, L, P, tube } from '../_dsl.js';

export const R_TAILS = [
  rPart({
    id: 'lizard', slot: 'tail', name: 'Whip', tags: ['lizard', 'long'], dom: 0.5, w: 3,
    shapes: [tube([[0, 0], [-20, 4], [-40, 4], [-58, -2], [-70, -12]], 14, 2)],
    extra: [SH('M-72,-4 C-50,8 -24,12 2,8 L2,20 L-72,20 Z', 0.13), HL('M-56,-6 C-40,-4 -20,-4 -2,-6 L-2,-2 C-20,0 -40,0 -54,-2 Z', 0.16)],
  }),
  rPart({
    id: 'croc', slot: 'tail', name: 'Ridged', tags: ['croc', 'thick'], dom: 0.55, w: 2,
    shapes: [tube([[0, 0], [-18, 4], [-36, 6], [-52, 2], [-64, -6]], 18, 4)],
    extra: [
      S([[-4, -8], [-2, -12, 'c'], [2, -6]], 'pd'), S([[-16, -6], [-14, -11, 'c'], [-10, -5]], 'pd'), S([[-28, -4], [-26, -9, 'c'], [-22, -3]], 'pd'), S([[-40, -4], [-38, -9, 'c'], [-34, -3]], 'pd'), S([[-52, -6], [-50, -11, 'c'], [-46, -5]], 'pd'),
      L('M-10,-2 L-10,10 M-22,0 L-22,12 M-34,0 L-34,10', 'k', 1.1, { op: 0.25 }),
      SH('M-66,-2 C-44,10 -20,14 2,10 L2,22 L-66,22 Z', 0.13),
    ],
  }),
  rPart({
    id: 'turtle', slot: 'tail', name: 'Nub', tags: ['turtle', 'short'], dom: 0.4, w: 2,
    shapes: [[[2, -4], [-8, -6], [-14, -2], [-12, 4], [-4, 6], [2, 4]]],
    extra: [SH('M-16,1 L4,1 L4,10 L-16,10 Z', 0.14)],
  }),
  rPart({
    id: 'dragon', slot: 'tail', name: 'Spade', tags: ['dragon'], dom: 0.55, w: 2,
    shapes: [tube([[0, 0], [-16, 6], [-32, 4], [-46, -6], [-54, -18]], 14, 4)],
    extra: [
      P('M-52,-14 L-66,-20 L-58,-30 L-48,-24 Z', 'a', { sw: 2 }),
      SH('M-56,-10 C-36,4 -18,10 2,8 L2,20 L-56,20 Z', 0.13), HL('M-40,-2 C-28,2 -14,0 -2,-4 L-2,0 C-14,4 -28,6 -38,2 Z', 0.16),
    ],
  }),
  rPart({
    id: 'rattle', slot: 'tail', name: 'Rattle', tags: ['snake'], dom: 0.5, w: 2,
    shapes: [tube([[0, 0], [-14, 2], [-28, 0], [-40, -4]], 12, 6)],
    extra: [
      P('M-40,-9 L-48,-9 L-49,-1 L-41,1 Z', 's', { sw: 1.6 }), P('M-48,-8 L-55,-8 L-56,-2 L-49,0 Z', 's', { sw: 1.6 }), P('M-55,-7 L-61,-7 L-62,-2 L-56,-1 Z', 's', { sw: 1.6 }),
      SH('M-42,-2 C-28,6 -12,8 2,6 L2,16 L-42,16 Z', 0.13),
    ],
  }),
  rPart({
    id: 'curl', slot: 'tail', name: 'Curl', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [tube([[0, 0], [-12, 6], [-24, 4], [-32, -6], [-28, -18], [-16, -20], [-10, -12], [-14, -6]], 12, 3)],
    extra: [SH('M-34,0 C-24,10 -10,12 2,8 L2,18 L-34,18 Z', 0.13), L('M-8,2 L-8,8 M-18,4 L-18,10', 'k', 1, { op: 0.2 })],
  }),
  rPart({
    id: 'raptor', slot: 'tail', name: 'Stiff', tags: ['raptor', 'long'], dom: 0.5, w: 2,
    shapes: [tube([[0, 0], [-22, -2], [-44, -6], [-66, -12], [-84, -20]], 16, 3)],
    extra: [SH('M-84,-14 C-56,-2 -26,4 2,8 L2,20 L-84,20 Z', 0.13), HL('M-64,-12 C-44,-10 -24,-8 -2,-8 L-2,-4 C-24,-4 -44,-6 -62,-8 Z', 0.16)],
  }),
  rPart({
    id: 'finned', slot: 'tail', name: 'Finned', tags: ['aquatic'], dom: 0.5, w: 1,
    shapes: [tube([[0, 0], [-18, 4], [-36, 4], [-52, -2]], 14, 6), [[-50, -2], [-58, -18], [-70, -22], [-66, -4], [-72, 12], [-60, 10], [-50, 4]]],
    extra: [L('M-54,-4 L-66,-18 M-56,0 L-66,0 M-56,4 L-68,10', 'k', 1.1, { op: 0.3 }), SH('M-52,0 C-36,10 -18,12 2,8 L2,20 L-52,20 Z', 0.13)],
  }),
];
