// Mammal coat markings, drawn on the torso and clipped to it. Authored in a 100 x 60 frame
// centred on the origin; the renderer stretches that frame over the body's box.
// Bold and stylised on purpose: claw stripes, ringed spots, a flame-hemmed saddle, swirls.
// Evolutions: stage 2 adds to the pattern (an extra stripe, spots, licks or a swirl); stage 3
// adds a second layer of detail (rings, embers, rays, dots) so the coat reads richer.
import { mPart } from './_shared.js';
import { NONE, S, L, E, C, P } from '../_dsl.js';
import { spiralPath, sparklePath, starPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

export const M_MARKINGS = [
  NONE('markings', 0.3, 'm.'),
  mPart({
    id: 'belly', slot: 'markings', name: 'Belly', tags: ['soft'], dom: 0.5, w: 3,
    extra: [S([[-54, 22], [-34, 14], [-8, 11], [18, 9], [36, 2], [50, -10], [56, -6], [56, 40], [-54, 40]], 's', { ns: true })],
    stages: {
      2: { add: [S([[-54, 26], [-34, 18], [-8, 15], [18, 13], [36, 6], [50, -6], [56, -2], [56, 4], [50, -1], [36, 10], [18, 17], [-8, 19], [-34, 22], [-54, 30]], 'a', { ns: true, op: 0.6 })] },
      3: { add: [L('M-40,30 L-40,40 M-20,28 L-20,40 M0,26 L0,40 M20,24 L20,40 M40,16 L40,40', 'k', 1.6, { ns: true, op: 0.22 })] },
    },
  }),

  mPart({
    id: 'saddle', slot: 'markings', name: 'Flame saddle', tags: ['dark'], dom: 0.5, w: 2,
    extra: [S([[-48, -40], [48, -40], [50, -14], [42, -2, 'c'], [32, -12], [24, 4, 'c'], [14, -8], [4, 6, 'c'], [-6, -8], [-16, 4, 'c'], [-26, -10], [-36, 0, 'c'], [-50, -14]], 'a', { ns: true, spline: { tension: 0.45 } })],
    stages: {
      2: { add: [S([[38, -6], [44, 12, 'c'], [48, -4]], 'a', { ns: true }), S([[-2, -4], [2, 16, 'c'], [8, -2]], 'a', { ns: true }), S([[-40, -6], [-38, 12, 'c'], [-32, -4]], 'a', { ns: true })] },
      3: { add: [C(30, -20, 2.4, 'w', { ns: true, op: 0.7 }), C(-10, -24, 2, 'w', { ns: true, op: 0.6 }), C(10, -14, 1.8, 'w', { ns: true, op: 0.6 }), C(-30, -22, 2.2, 'w', { ns: true, op: 0.65 })] },
    },
  }),
  mPart({
    id: 'stripes', slot: 'markings', name: 'Claw stripes', tags: ['tiger'], dom: 0.5, w: 2,
    extra: [
      S([[-36, -40], [-18, -40], [-22, -20], [-30, -6, 'c'], [-24, 0], [-36, 12, 'c'], [-36, -4], [-40, -20]], 'a', { ns: true }),
      S([[-10, -40], [8, -40], [4, -18], [-4, -4, 'c'], [2, 2], [-10, 14, 'c'], [-10, -2], [-14, -20]], 'a', { ns: true }),
      S([[18, -40], [36, -40], [34, -20], [26, -8, 'c'], [32, -2], [20, 10, 'c'], [18, -4], [14, -20]], 'a', { ns: true }),
    ],
    stages: {
      2: { add: [S([[42, -40], [54, -40], [52, -20], [46, -8, 'c'], [50, -2], [42, 8, 'c'], [40, -6], [38, -20]], 'a', { ns: true })] },
      3: { add: [S([[-56, -40], [-46, -40], [-48, -22], [-54, -10, 'c'], [-50, -4], [-56, 4, 'c'], [-58, -8], [-60, -22]], 'a', { ns: true }), C(-22, 12, 2.5, 'a', { ns: true }), C(4, 14, 2.5, 'a', { ns: true }), C(30, 14, 2.5, 'a', { ns: true })] },
    },
  }),
  mPart({
    id: 'spots', slot: 'markings', name: 'Ringed spots', tags: ['fawn'], dom: 0.45, w: 2,
    extra: [
      ...[[-30, -14, 5], [-8, -20, 5.5], [16, -22, 5], [32, -10, 4.5], [-18, 2, 4.5], [6, -2, 5], [26, 8, 4]].flatMap(([x, y, r]) => [E(x, y, r * 1.15, r * 0.9, 's', { ns: true }), C(x + 0.5, y + 0.3, r * 0.5, 'a', { ns: true, op: 0.9 })]),
    ],
    stages: {
      2: { add: [[-40, 8, 4], [38, -24, 4], [-4, 14, 4]].flatMap(([x, y, r]) => [E(x, y, r * 1.15, r * 0.9, 's', { ns: true }), C(x + 0.5, y + 0.3, r * 0.5, 'a', { ns: true, op: 0.9 })]) },
      3: { add: [evoRing(-8, -20, 8.5, 's', 1.6), evoRing(16, -22, 8, 's', 1.6), evoRing(6, -2, 8, 's', 1.6)] },
    },
  }),
  mPart({
    id: 'rings', slot: 'markings', name: 'Rings', tags: ['bands'], dom: 0.5, w: 1,
    extra: [
      S([[-30, -40], [-16, -40], [-14, 40], [-30, 40]], 'a', { ns: true }), S([[4, -40], [18, -40], [20, 40], [4, 40]], 'a', { ns: true }), S([[34, -40], [46, -40], [50, 40], [36, 40]], 'a', { ns: true }),
    ],
    stages: {
      2: { add: [S([[-8, -40], [-4, -40], [-2, 40], [-8, 40]], 'a', { ns: true, op: 0.7 }), S([[26, -40], [30, -40], [32, 40], [28, 40]], 'a', { ns: true, op: 0.7 })] },
      3: { add: [C(-22, 0, 3, 'w', { ns: true, op: 0.6 }), C(11, 0, 3, 'w', { ns: true, op: 0.6 }), C(42, 0, 3, 'w', { ns: true, op: 0.6 })] },
    },
  }),
  mPart({
    id: 'star', slot: 'markings', name: 'Chest star', tags: ['blaze'], dom: 0.45, w: 2,
    extra: [S([[30, -14], [34, -4], [44, -2], [36, 5], [38, 16], [30, 10], [22, 16], [24, 5], [16, -2], [26, -4]], 's', { ns: true, spline: { tension: 0.2 } })],
    stages: {
      2: { grow: [1.2, 1.2], add: [P(sparklePath(12, -16, 4), 's', { ns: true, op: 0.8 }), P(sparklePath(46, 14, 3.4), 's', { ns: true, op: 0.8 })] },
      3: { add: [L('M30,-22 L30,-30 M40,-14 L46,-20 M20,-14 L14,-20 M44,4 L52,4 M16,4 L8,4', 's', 2.2, { ns: true, op: 0.7 }), P(starPath(-20, -8, 7, 5, 0.5), 's', { ns: true })] },
    },
  }),
  mPart({
    id: 'patches', slot: 'markings', name: 'Swirls', tags: ['spiral'], dom: 0.45, w: 2,
    extra: [
      L(spiralPath(-18, -10, 15, 1.7, 160), 'a', 4.2, { ns: true }),
      L(spiralPath(22, -4, 12, 1.6, -20), 'a', 3.6, { ns: true }),
      C(-34, 14, 3, 'a', { ns: true, op: 0.8 }), C(38, -24, 2.5, 'a', { ns: true, op: 0.8 }),
    ],
    stages: {
      2: { add: [L(spiralPath(4, 14, 9, 1.5, 90), 'a', 3.2, { ns: true })] },
      3: { add: [C(-40, -24, 2.4, 'a', { ns: true }), C(36, 14, 2.4, 'a', { ns: true }), C(-2, -26, 2, 'a', { ns: true, op: 0.8 }), L(spiralPath(-38, 12, 7, 1.4, 200), 'a', 2.8, { ns: true })] },
    },
  }),
];
