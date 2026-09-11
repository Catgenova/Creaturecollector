// Reptile crests: frills, horns, fins and plumes on the crown. Origin = the head's crest socket;
// crests grow up (-y) and sweep back (-x). Drawn behind the skull.
import { rPart } from './_shared.js';
import { NONE, S, L, HL, tube } from '../_dsl.js';

const rBeam = (pts, w0, w1, f = 'p') => S(tube(pts, w0, w1), f);

export const R_CRESTS = [
  NONE('crest', 0.3, 'r.'),
  rPart({
    id: 'frill', slot: 'crest', name: 'Frill', tags: ['frill'], dom: 0.55, w: 2,
    shapes: [[[6, 4], [8, -10], [0, -24], [-14, -30], [-30, -24], [-38, -10], [-34, 6], [-20, 10]]],
    extra: [S([[2, 0], [2, -12], [-6, -20], [-18, -22], [-28, -12], [-26, 2]], 's', { ns: true, cl: true, op: 0.6 }), L('M4,2 L-2,-20 M4,2 L-14,-26 M4,2 L-28,-20 M4,2 L-32,-6', 'k', 1.2, { op: 0.3 })],
  }),
  rPart({
    id: 'horns', slot: 'crest', name: 'Horns', tags: ['dragon'], dom: 0.55, w: 2,
    extra: [rBeam([[-6, 2], [-10, -10], [-20, -20], [-32, -26]], 7, 2, 'pd'), rBeam([[6, 2], [4, -12], [-4, -24], [-16, -32]], 8, 2), L('M4,-6 L0,-6 M3,-12 L-1,-11 M0,-17 L-4,-15', 'k', 1.2, { op: 0.3 })],
  }),
  rPart({
    id: 'fin', slot: 'crest', name: 'Head fin', tags: ['fin'], dom: 0.5, w: 2,
    shapes: [[[-4, 4], [0, -12], [6, -28], [-2, -34], [-14, -26], [-22, -12], [-24, 4]]],
    extra: [S([[-4, 0], [-2, -12], [2, -24], [-6, -26], [-14, -18], [-20, -6], [-20, 2]], 's', { ns: true, cl: true, op: 0.5 }), L('M-4,2 L2,-26 M-6,2 L-12,-22 M-8,2 L-18,-10', 'k', 1.2, { op: 0.3 })],
  }),
  rPart({
    id: 'casque', slot: 'crest', name: 'Casque', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [[[-6, 4], [-2, -8], [4, -22, 'c'], [12, -10], [14, 4]]],
    extra: [L('M-2,-6 L4,-20 L10,-8', 'k', 1.2, { op: 0.3 }), HL('M2,-18 L6,-14 L4,-2 L0,-2 Z', 0.2)],
  }),
  rPart({
    id: 'plume', slot: 'crest', name: 'Plume', tags: ['feathers'], dom: 0.5, w: 2,
    shapes: [[[-4, 4], [0, -8], [-4, -24, 0.2], [-8, -10], [-16, -26, 0.2], [-16, -8], [-26, -18, 0.2], [-22, -2], [-30, 0, 0.2], [-24, 6]]],
    extra: [L('M-2,0 L-4,-20 M-6,0 L-14,-22 M-10,2 L-22,-14', 'k', 1, { op: 0.3 }), S([[-4, 0], [-6, -14], [-12, -18], [-16, -6], [-14, 2]], 's', { ns: true, cl: true, op: 0.5 })],
  }),
  rPart({
    id: 'antlers', slot: 'crest', name: 'Antlers', tags: ['dragon', 'deer'], dom: 0.5, w: 1,
    extra: [
      rBeam([[-6, 2], [-8, -10], [-6, -22], [-10, -36]], 5, 3, 'pd'), rBeam([[-7, -14], [-14, -20], [-20, -28]], 4, 2, 'pd'),
      rBeam([[8, 2], [11, -10], [12, -24], [9, -38]], 5.5, 3), rBeam([[11, -14], [18, -20], [24, -28]], 4.5, 2.2), rBeam([[12, -26], [18, -34]], 4, 2),
    ],
  }),
  rPart({
    id: 'spikes', slot: 'crest', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2,
    shapes: [[[-14, 4], [-14, -4], [-9, -16, 'c'], [-4, -4], [0, -22, 'c'], [4, -4], [9, -16, 'c'], [12, -4], [14, 4]]],
    extra: [HL('M-2,-18 L0,-6 L2,-18 Z', 0.25)],
  }),
];
