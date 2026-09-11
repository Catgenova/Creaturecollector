// Mammal horns and antlers. Origin = crown of the skull; horns grow up (-y).
// Drawn in the slot's primary role, so a species' paint gene picks the horn colour.
import { mPart } from './_shared.js';
import { NONE, P, S, L, SH, HL, spline, tube } from '../_dsl.js';

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
    ],
  }),
  mPart({
    id: 'ram', slot: 'horns', name: 'Ram', tags: ['sheep', 'curled'], dom: 0.55, w: 2,
    extra: [
      beam([[-4, 0], [-8, -10], [-16, -14], [-22, -6], [-18, 2]], 9, 4, 'pd'),
      beam([[10, 0], [14, -10], [10, -20], [0, -20], [-4, -12], [0, -6]], 11, 4, 'p'),
      L('M12,-8 C10,-14 6,-18 0,-17', 'k', 1.2, { op: 0.3 }), L('M13,-4 C13,-11 9,-17 3,-19', 'k', 1.2, { op: 0.2 }),
    ],
  }),
  mPart({
    id: 'goat', slot: 'horns', name: 'Goat', tags: ['goat', 'swept'], dom: 0.5, w: 2,
    extra: [
      beam([[-4, 2], [-8, -10], [-14, -20], [-24, -28]], 6, 2, 'pd'),
      beam([[8, 2], [6, -10], [0, -22], [-10, -32]], 7, 2, 'p'),
      L('M6,-6 L2,-6 M5,-12 L1,-11 M2,-17 L-2,-15', 'k', 1.2, { op: 0.3 }),
    ],
  }),
  mPart({
    id: 'bull', slot: 'horns', name: 'Bull', tags: ['bull', 'wide'], dom: 0.6, w: 2,
    extra: [
      beam([[-6, 2], [-16, -2], [-24, -10], [-26, -22]], 8, 2.5, 'pd'),
      beam([[8, 2], [20, -2], [28, -12], [30, -24]], 9, 2.5, 'p'),
      HL('M10,0 L14,-2 L24,-10 L20,-8 Z', 0.2),
    ],
  }),
  mPart({
    id: 'unicorn', slot: 'horns', name: 'Spiral', tags: ['unicorn', 'single'], dom: 0.5, w: 1,
    extra: [
      beam([[4, 2], [6, -12], [8, -28], [10, -40]], 10, 1),
      L('M1,-6 L9,-9 M2,-14 L10,-17 M4,-22 L11,-25 M6,-30 L11,-32', 'k', 1.2, { op: 0.3 }),
      HL('M4,-2 L7,-2 L9,-30 L7,-30 Z', 0.22),
    ],
  }),
  mPart({
    id: 'nubs', slot: 'horns', name: 'Nubs', tags: ['small'], dom: 0.4, w: 2,
    extra: [
      S([[-8, 2], [-9, -4], [-6, -9], [-2, -8], [-1, -2]], 'pd'),
      S([[8, 2], [7, -4], [10, -9], [14, -8], [15, -2]], 'p'),
      HL('M9,-2 L12,-6 L14,-5 L11,-1 Z', 0.2),
    ],
  }),
  mPart({
    id: 'crest', slot: 'horns', name: 'Crest', tags: ['fur', 'plume'], dom: 0.45, w: 2,
    extra: [
      S([[-14, 4], [-10, -8], [-4, -20, 0.2], [0, -8], [6, -24, 0.2], [10, -8], [18, -16, 0.2], [18, -2], [20, 6]], 'p'),
      HL('M-4,-16 L0,-6 L4,-20 L8,-8 Z', 0.2),
    ],
  }),
];
