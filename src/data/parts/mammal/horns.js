// Mammal horns and antlers. Origin = crown of the skull; horns grow up (-y).
// Drawn in the slot's primary role, so a species' paint gene picks the horn colour.
// Evolutions: stage 2 grows the horns and adds tines, ridges or brighter tips; stage 3 adds a
// second pair, a further curl or a crown of tines, with gems and glow at the points.
import { mPart } from './_shared.js';
import { NONE, P, S, L, C, SH, HL, spline, tube } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';
import { evoRing, evoGem } from '../_evo.js';

/** A tube along a centreline as a filled shape; far copies are drawn in the shade role. */
const beam = (pts, w0, w1, f = 'p', o = {}) => S(tube(pts, w0, w1, o), f, o.ns ? { ns: true } : {});

export const M_HORNS = [
  NONE('horns', 0.3, 'm.'),
  mPart({
    id: 'antlers', slot: 'horns', name: 'Antlers', tags: ['deer'], dom: 0.55, w: 2,
    extra: [
      // far antler
      beam([[-6, 2], [-8, -10], [-6, -22], [-10, -36]], 5, 3, 'pd'), beam([[-7, -14], [-14, -20], [-20, -28]], 4, 2, 'pd'), beam([[-6, -24], [-1, -32]], 3.5, 2, 'pd'),
      // near antler
      beam([[8, 2], [11, -10], [12, -24], [9, -38]], 5.5, 3, 'p'), beam([[11, -14], [18, -20], [24, -28]], 4.5, 2.2, 'p'), beam([[12, -26], [18, -34]], 4, 2, 'p'),
      HL('M8,-4 L12,-4 L13,-22 L10,-22 Z', 0.2),
      C(-10, -37, 2.4, 'a', { sw: 1.4 }), C(-20, -29, 2, 'a', { sw: 1.4 }), C(-1, -33, 1.8, 'a', { sw: 1.4 }),
      C(9, -39, 2.8, 'a', { sw: 1.6 }), C(24, -29, 2.4, 'a', { sw: 1.6 }), C(18, -35, 2.2, 'a', { sw: 1.6 }),
    ],
    stages: {
      2: { grow: [1.1, 1.12], add: [beam([[11, -6], [18, -8], [23, -14]], 4, 2, 'p'), beam([[-7, -6], [-14, -9], [-18, -14]], 3.6, 2, 'pd'), C(23, -15, 2.2, 'a', { sw: 1.5 }), C(-18, -15, 1.9, 'a', { sw: 1.4 })] },
      3: {
        grow: [1.1, 1.12],
        add: [
          beam([[12, -30], [16, -42], [14, -50]], 3.6, 2, 'p'), beam([[9, -38], [4, -46]], 3.4, 1.8, 'p'), beam([[-10, -30], [-14, -42]], 3, 1.8, 'pd'),
          C(14, -51, 2.6, 'a', { sw: 1.6 }), C(4, -47, 2.2, 'a', { sw: 1.5 }), C(-14, -43, 2, 'a', { sw: 1.4 }), C(9, -40, 7, 'a', { ns: true, op: 0.22 }),
        ],
      },
    },
  }),
  mPart({
    id: 'ram', slot: 'horns', name: 'Ram', tags: ['sheep', 'curled'], dom: 0.55, w: 2,
    extra: [
      beam([[-4, 0], [-8, -10], [-16, -14], [-22, -6], [-18, 2]], 9, 4, 'pd'),
      beam([[10, 0], [14, -10], [10, -20], [0, -20], [-4, -12], [0, -6]], 11, 4, 'p'),
      L('M12,-8 C10,-14 6,-18 0,-17', 'k', 1.2, { op: 0.3 }), L('M13,-4 C13,-11 9,-17 3,-19', 'k', 1.2, { op: 0.2 }),
    ],
    stages: {
      2: { grow: [1.12, 1.12], add: [L('M11,-2 C11,-8 8,-14 3,-17 M-6,-2 C-8,-7 -12,-11 -17,-12', 'k', 1.1, { op: 0.25 }), S(tube([[-3, -8], [0, -6]], 5, 3.4), 'a', { ns: true }), S(tube([[-20, -2], [-18, 2]], 4, 2.8), 'a', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [beam([[0, -6], [6, -2], [8, 4], [4, 8]], 5, 3, 'p'), beam([[-18, 2], [-20, 6], [-16, 10]], 4, 2.4, 'pd'), ...evoGem(4, -13, 3)] },
    },
  }),
  mPart({
    id: 'goat', slot: 'horns', name: 'Goat', tags: ['goat', 'swept'], dom: 0.5, w: 2,
    extra: [
      beam([[-4, 2], [-8, -10], [-14, -20], [-24, -28]], 6, 2, 'pd'),
      beam([[8, 2], [6, -10], [0, -22], [-10, -32]], 7, 2, 'p'),
      L('M6,-6 L2,-6 M5,-12 L1,-11 M2,-17 L-2,-15', 'k', 1.2, { op: 0.3 }),
      S(tube([[-18, -24], [-24, -28]], 3.2, 1.2), 'a', { ns: true }), S(tube([[-4, -28], [-10, -32]], 3.6, 1.2), 'a', { ns: true }),
    ],
    stages: {
      2: { grow: [1.1, 1.18], add: [L('M-6,-8 L-10,-7 M-9,-14 L-13,-12 M-14,-20 L-18,-18', 'k', 1.1, { op: 0.25 }), L('M7,-2 L3,-2', 'k', 1.2, { op: 0.3 })] },
      3: { grow: [1.08, 1.1], add: [beam([[2, 2], [-1, -8], [-6, -16]], 4, 1.6, 'p'), S(tube([[-4, -30], [-12, -36]], 4, 1.2), 'a', { ns: true }), S(tube([[-18, -26], [-26, -31]], 3.6, 1.2), 'a', { ns: true }), C(-11, -34, 2.2, 'a', { ns: true, op: 0.5 })] },
    },
  }),
  mPart({
    id: 'bull', slot: 'horns', name: 'Bull', tags: ['bull', 'wide'], dom: 0.6, w: 2,
    extra: [
      beam([[-6, 2], [-16, -2], [-24, -10], [-26, -22]], 8, 2.5, 'pd'),
      beam([[8, 2], [20, -2], [28, -12], [30, -24]], 9, 2.5, 'p'),
      HL('M10,0 L14,-2 L24,-10 L20,-8 Z', 0.2),
      S(tube([[-25, -16], [-26, -22]], 4.2, 2), 'a', { ns: true }), S(tube([[29, -18], [30, -24]], 4.6, 2), 'a', { ns: true }),
    ],
    stages: {
      2: { grow: [1.15, 1.1], add: [S(tube([[28, -14], [30, -24]], 5, 2), 'a', { ns: true }), S(tube([[-24, -12], [-26, -22]], 4.6, 2), 'a', { ns: true }), L('M12,-1 L13,-5 M18,-3 L19,-7', 'k', 1.1, { op: 0.25 })] },
      3: { grow: [1.1, 1.1], add: [beam([[6, 4], [14, 6], [22, 2], [26, -6]], 6, 2, 'p'), beam([[-4, 4], [-12, 6], [-20, 2], [-24, -6]], 5.4, 2, 'pd'), ...evoGem(30, -27, 2.6), ...evoGem(-26, -25, 2.2)] },
    },
  }),
  mPart({
    id: 'unicorn', slot: 'horns', name: 'Spiral', tags: ['unicorn', 'single'], dom: 0.5, w: 1,
    extra: [
      beam([[4, 2], [6, -12], [8, -28], [10, -40]], 10, 1),
      L('M1,-6 L9,-9 M2,-14 L10,-17 M4,-22 L11,-25 M6,-30 L11,-32', 'a', 2.2, { ns: true, cl: true, op: 0.85 }),
      HL('M4,-2 L7,-2 L9,-30 L7,-30 Z', 0.22),
      P(sparklePath(11, -45, 5), 'a', { ns: true }),
    ],
    stages: {
      2: { grow: [1.05, 1.18], add: [L('M7,-36 L11,-38', 'a', 2.2, { ns: true, cl: true, op: 0.85 }), P(sparklePath(11, -45, 7), 'a', { ns: true })] },
      3: { grow: [1.05, 1.1], add: [evoRing(10, -42, 9, 'a', 1.8, { op: 0.8 }), P(sparklePath(-2, -40, 3.6, 20), 'a', { ns: true, op: 0.85 }), P(sparklePath(20, -34, 3, 40), 'a', { ns: true, op: 0.8 })] },
    },
  }),
  mPart({
    id: 'nubs', slot: 'horns', name: 'Gem nubs', tags: ['small', 'crystal'], dom: 0.4, w: 2,
    extra: [
      P('M-9,2 L-10,-6 L-5,-13 L0,-6 L-1,2 Z', 'pd'),
      P('M7,2 L6,-7 L11,-15 L17,-7 L16,2 Z', 'p'),
      HL('M8,-4 L11,-12 L13,-10 L10,-3 Z', 0.4), HL('M-8,-3 L-5,-10 L-4,-8 L-6,-2 Z', 0.35),
      L('M11,-15 L11,-2 M-5,-13 L-5,-2', 'k', 1, { op: 0.25 }),
    ],
    stages: {
      2: { grow: [1.15, 1.2], add: [P('M-1,2 L-2,-3 L3,-9 L8,-3 L7,2 Z', 'pl'), P('M0,-1 L3,-7 L4,-5 L2,0 Z', 'w', { ns: true, op: 0.35 })] },
      3: {
        grow: [1.1, 1.1],
        add: [
          C(11, -9, 4.5, 'a', { ns: true, op: 0.2 }), C(-5, -8, 3.8, 'a', { ns: true, op: 0.18 }),
          P('M7,2 L5,-9 L11,-21 L18,-9 L16,2 Z', 'p'), P('M8,-6 L11,-17 L13,-14 L10,-4 Z', 'w', { ns: true, op: 0.4 }),
          P('M-9,2 L-11,-8 L-5,-18 L1,-8 L-1,2 Z', 'pd'), P('M-8,-4 L-5,-14 L-4,-11 L-6,-3 Z', 'w', { ns: true, op: 0.35 }),
        ],
      },
    },
  }),
  mPart({
    id: 'crest', slot: 'horns', name: 'Crest', tags: ['fur', 'plume'], dom: 0.45, w: 2,
    extra: [
      S([[-14, 4], [-10, -8], [-4, -20, 0.2], [0, -8], [6, -24, 0.2], [10, -8], [18, -16, 0.2], [18, -2], [20, 6]], 'p'),
      HL('M-4,-16 L0,-6 L4,-20 L8,-8 Z', 0.2),
    ],
    stages: {
      2: { grow: [1.1, 1.22], add: [P('M-6,-14 L-4,-24 L-1,-14 Z', 'a', { ns: true, op: 0.85 }), P('M4,-16 L6,-28 L9,-16 Z', 'a', { ns: true, op: 0.85 }), P('M15,-10 L18,-20 L20,-10 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.08, 1.12], addBehind: [{ pts: [[-18, 6], [-16, -10], [-10, -28, 0.2], [-4, -12], [2, -36, 0.2], [8, -14], [14, -32, 0.2], [18, -12], [26, -22, 0.2], [24, 6]], f: 'pd' }] },
    },
  }),
];
