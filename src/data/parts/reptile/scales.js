// Reptile scale patterns, drawn on the torso and clipped to it. Authored in a 100 x 60 frame
// centred on the origin; the renderer stretches that frame over the body's box.
// Evolutions: stage 2 adds to the pattern (a band, spots, a second row, a ridge line); stage 3
// adds a second layer of detail (rings, dots, accent centres, embers).
import { rPart } from './_shared.js';
import { NONE, S, L, E, C } from '../_dsl.js';
import { evoRing } from '../_evo.js';

const diamond = (cx, cy, r = 12) => S([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]], 'a', { ns: true, spline: { tension: 0.1 } });

export const R_SCALES = [
  NONE('scales', 0.3, 'r.'),
  rPart({
    id: 'belly', slot: 'scales', name: 'Belly plates', tags: ['soft'], dom: 0.5, w: 3,
    extra: [S([[-54, 18], [-30, 12], [0, 10], [30, 12], [54, 18], [54, 40], [-54, 40]], 's', { ns: true }), L('M-44,22 L44,22 M-46,27 L46,27 M-40,32 L40,32', 'k', 1.1, { op: 0.2 })],
    stages: {
      2: { add: [L('M-48,16 C-24,10 24,10 48,16', 'a', 2.2, { ns: true, op: 0.7 })] },
      3: { add: [L('M-34,37 L34,37', 'k', 1.1, { op: 0.2 }), C(-30, 24, 1.6, 'w', { ns: true, op: 0.5 }), C(0, 22, 1.6, 'w', { ns: true, op: 0.5 }), C(30, 24, 1.6, 'w', { ns: true, op: 0.5 })] },
    },
  }),
  rPart({
    id: 'bands', slot: 'scales', name: 'Jagged bands', tags: ['striped'], dom: 0.5, w: 2,
    extra: [
      S([[-40, -40], [-24, -40], [-26, -20], [-32, -6, 'c'], [-26, 4], [-36, 18, 'c'], [-36, 4], [-42, -18]], 'a', { ns: true }), S([[-12, -40], [4, -40], [2, -18], [-4, -4, 'c'], [2, 6], [-8, 20, 'c'], [-8, 4], [-14, -18]], 'a', { ns: true }), S([[16, -40], [32, -40], [30, -20], [24, -6, 'c'], [30, 4], [20, 18, 'c'], [20, 4], [14, -18]], 'a', { ns: true }),
    ],
    stages: {
      2: { add: [S([[40, -40], [54, -40], [52, -20], [46, -8, 'c'], [50, 2], [42, 14, 'c'], [42, 2], [38, -18]], 'a', { ns: true })] },
      3: { add: [S([[-58, -40], [-50, -40], [-52, -24], [-56, -12, 'c'], [-52, -6], [-58, 4, 'c'], [-60, -8], [-62, -22]], 'a', { ns: true }), C(-22, 20, 2.4, 'a', { ns: true }), C(6, 22, 2.4, 'a', { ns: true }), C(34, 20, 2.4, 'a', { ns: true })] },
    },
  }),
  rPart({
    id: 'spots', slot: 'scales', name: 'Eye spots', tags: ['spotted'], dom: 0.45, w: 2,
    extra: [
      ...[[-32, -14, 6], [-10, -22, 5.5], [14, -20, 6], [34, -10, 5], [-20, 2, 5], [6, -2, 5.5], [28, 8, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.15, r * 0.9, 'a', { ns: true }), C(x + 0.6, y + 0.4, r * 0.5, 's', { ns: true, op: 0.9 })]),
    ],
    stages: {
      2: { add: [[-42, 10, 4.5], [40, -24, 4.5], [-4, 14, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.15, r * 0.9, 'a', { ns: true }), C(x + 0.6, y + 0.4, r * 0.5, 's', { ns: true, op: 0.9 })]) },
      3: { add: [evoRing(-10, -22, 8.5, 'a', 1.6), evoRing(14, -20, 9, 'a', 1.6), evoRing(6, -2, 8.5, 'a', 1.6)] },
    },
  }),
  rPart({
    id: 'diamonds', slot: 'scales', name: 'Diamonds', tags: ['snake'], dom: 0.5, w: 2,
    extra: [diamond(-44, -18), diamond(-20, -18), diamond(4, -18), diamond(28, -18), diamond(52, -18)],
    stages: {
      2: { add: [diamond(-32, 8, 8), diamond(-8, 8, 8), diamond(16, 8, 8), diamond(40, 8, 8)] },
      3: { add: [C(-44, -18, 2.6, 's', { ns: true }), C(-20, -18, 2.6, 's', { ns: true }), C(4, -18, 2.6, 's', { ns: true }), C(28, -18, 2.6, 's', { ns: true }), C(52, -18, 2.6, 's', { ns: true })] },
    },
  }),
  rPart({
    id: 'scutes', slot: 'scales', name: 'Scutes', tags: ['croc'], dom: 0.45, w: 2,
    extra: [
      L('M-50,-20 L50,-20 M-50,-8 L50,-8 M-50,4 L50,4 M-50,16 L50,16 M-36,-40 L-36,40 M-18,-40 L-18,40 M0,-40 L0,40 M18,-40 L18,40 M36,-40 L36,40', 'k', 1.2, { op: 0.2 }),
      S([[-54, 18], [-30, 14], [0, 12], [30, 14], [54, 18], [54, 40], [-54, 40]], 's', { ns: true, op: 0.7 }),
    ],
    stages: {
      2: { add: [L('M-50,-32 L50,-32', 'a', 2.4, { ns: true, op: 0.7 })] },
      3: { add: [...[-27, -9, 9, 27].map((x) => C(x, -14, 1.8, 'w', { ns: true, op: 0.45 })), ...[-27, -9, 9, 27].map((x) => C(x, -2, 1.8, 'w', { ns: true, op: 0.45 }))] },
    },
  }),
  rPart({
    id: 'hex', slot: 'scales', name: 'Hex plates', tags: ['turtle'], dom: 0.45, w: 2,
    extra: [
      L('M-30,-26 L-38,-12 L-30,2 L-14,2 L-6,-12 L-14,-26 Z M6,-26 L-2,-12 L6,2 L22,2 L30,-12 L22,-26 Z M-14,2 L-22,16 L-14,30 L2,30 L10,16 L2,2 M22,2 L30,16 L22,30 M-38,-12 L-52,-12 M30,-12 L46,-12 M-14,-26 L-8,-38 M22,-26 L28,-38', 'k', 1.3, { op: 0.25 }),
    ],
    stages: {
      2: { add: [L('M-52,-12 L-60,2 L-52,16 L-38,16 L-30,2 M46,-12 L54,2 L46,16 L30,16', 'k', 1.3, { op: 0.25 })] },
      3: { add: [C(-22, -12, 3.2, 'a', { ns: true, op: 0.7 }), C(14, -12, 3.2, 'a', { ns: true, op: 0.7 }), C(-6, 16, 3, 'a', { ns: true, op: 0.7 }), C(-45, 2, 2.6, 'a', { ns: true, op: 0.6 }), C(38, 2, 2.6, 'a', { ns: true, op: 0.6 })] },
    },
  }),
  rPart({
    id: 'saddle', slot: 'scales', name: 'Jagged back', tags: ['gradient'], dom: 0.5, w: 2,
    extra: [
      S([[-48, -40], [48, -40], [52, -12], [42, 0, 'c'], [32, -10], [22, 4, 'c'], [12, -8], [2, 6, 'c'], [-8, -8], [-18, 4, 'c'], [-28, -10], [-38, 2, 'c'], [-52, -12]], 'a', { ns: true, spline: { tension: 0.45 } }),
      S([[-40, -40], [40, -40], [42, -24], [20, -14], [-8, -12], [-30, -14], [-44, -24]], 'k', { ns: true, op: 0.12 }),
    ],
    stages: {
      2: { add: [S([[38, -6], [44, 12, 'c'], [48, -4]], 'a', { ns: true }), S([[-2, -4], [2, 16, 'c'], [8, -2]], 'a', { ns: true }), S([[-40, -6], [-38, 12, 'c'], [-32, -4]], 'a', { ns: true })] },
      3: { add: [C(30, -20, 2.4, 'w', { ns: true, op: 0.6 }), C(-10, -24, 2, 'w', { ns: true, op: 0.55 }), C(10, -14, 1.8, 'w', { ns: true, op: 0.55 }), C(-30, -22, 2.2, 'w', { ns: true, op: 0.6 })] },
    },
  }),
];
