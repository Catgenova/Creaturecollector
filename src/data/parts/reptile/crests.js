// Reptile crests: frills, horns, fins and plumes on the crown. Origin = the head's crest socket;
// crests grow up (-y) and sweep back (-x). Drawn behind the skull.
// Evolutions: stage 2 grows the crest and adds accent rays, tips, ridges or a notched edge;
// stage 3 layers a larger copy behind it (or a second pair of horns) and sets a gem.
import { rPart } from './_shared.js';
import { NONE, S, L, P, C, HL, tube, xfPts } from '../_dsl.js';
import { evoFan, evoGem } from '../_evo.js';

const rBeam = (pts, w0, w1, f = 'p') => S(tube(pts, w0, w1), f);

const frillPts = [[6, 4], [8, -10], [0, -24], [-14, -30], [-30, -24], [-38, -10], [-34, 6], [-20, 10]];
const finPts = [[-4, 4], [0, -12], [6, -28], [-2, -34], [-14, -26], [-22, -12], [-24, 4]];
const plumePts = [[-4, 4], [0, -8], [-4, -24, 0.2], [-8, -10], [-16, -26, 0.2], [-16, -8], [-26, -18, 0.2], [-22, -2], [-30, 0, 0.2], [-24, 6]];
const spikePts = [[-14, 4], [-14, -4], [-9, -16, 'c'], [-4, -4], [0, -22, 'c'], [4, -4], [9, -16, 'c'], [12, -4], [14, 4]];

export const R_CRESTS = [
  NONE('crest', 0.3, 'r.'),
  rPart({
    id: 'frill', slot: 'crest', name: 'Frill', tags: ['frill'], dom: 0.55, w: 2,
    shapes: [frillPts],
    extra: [S([[2, 0], [2, -12], [-6, -20], [-18, -22], [-28, -12], [-26, 2]], 's', { ns: true, cl: true, op: 0.6 }), L('M4,2 L-2,-20 M4,2 L-14,-26 M4,2 L-28,-20 M4,2 L-32,-6', 'k', 1.2, { op: 0.3 })],
    stages: {
      2: { grow: [1.12, 1.15], addBehind: [evoFan(-14, -10, 150, 290, 5, 16, 30)], add: [L('M4,2 L-2,-20 M4,2 L-14,-26 M4,2 L-28,-20 M4,2 L-32,-6', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(frillPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-14, -12, 3.2)] },
    },
  }),
  rPart({
    id: 'horns', slot: 'crest', name: 'Horns', tags: ['dragon'], dom: 0.55, w: 2,
    extra: [rBeam([[-6, 2], [-10, -10], [-20, -20], [-32, -26]], 7, 2, 'pd'), rBeam([[6, 2], [4, -12], [-4, -24], [-16, -32]], 8, 2), L('M4,-6 L0,-6 M3,-12 L-1,-11 M0,-17 L-4,-15', 'k', 1.2, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M-8,-8 L-12,-6 M-12,-14 L-16,-12 M-18,-19 L-22,-17', 'k', 1.1, { op: 0.25 }), S(tube([[-12, -28], [-16, -32]], 3.4, 1.2), 'a', { ns: true }), S(tube([[-28, -22], [-32, -26]], 3, 1.2), 'a', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [rBeam([[-2, 4], [-6, -4], [-12, -10]], 5, 1.6, 'pd'), rBeam([[10, 4], [10, -6], [6, -14]], 5.5, 1.6), ...evoGem(0, -2, 2.8)] },
    },
  }),
  rPart({
    id: 'fin', slot: 'crest', name: 'Head fin', tags: ['fin'], dom: 0.5, w: 2,
    shapes: [finPts],
    extra: [S([[-4, 0], [-2, -12], [2, -24], [-6, -26], [-14, -18], [-20, -6], [-20, 2]], 's', { ns: true, cl: true, op: 0.5 }), L('M-4,2 L2,-26 M-6,2 L-12,-22 M-8,2 L-18,-10', 'k', 1.2, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.25], addShapes: [{ pts: [[4, -24], [10, -40, 'c'], [2, -30]], f: 'p' }], add: [L('M-4,2 L2,-26 M-6,2 L-12,-22', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: xfPts(finPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-6, -14, 3)] },
    },
  }),
  rPart({
    id: 'casque', slot: 'crest', name: 'Casque', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [[[-6, 4], [-2, -8], [4, -22, 'c'], [12, -10], [14, 4]]],
    extra: [L('M-2,-6 L4,-20 L10,-8', 'k', 1.2, { op: 0.3 }), HL('M2,-18 L6,-14 L4,-2 L0,-2 Z', 0.2)],
    stages: {
      2: { grow: [1.1, 1.25], addShapes: [{ pts: [[1, -18], [4, -34, 'c'], [8, -16]], f: 'a' }] },
      3: { grow: [1.1, 1.1], addBehind: [[[-14, 4], [-10, -8], [-6, -20, 'c'], [0, -8], [2, 4]], [[6, 4], [10, -8], [16, -18, 'c'], [20, -6], [20, 4]]], add: [...evoGem(4, -8, 2.6)] },
    },
  }),
  rPart({
    id: 'plume', slot: 'crest', name: 'Plume', tags: ['feathers'], dom: 0.5, w: 2,
    shapes: [plumePts],
    extra: [L('M-2,0 L-4,-20 M-6,0 L-14,-22 M-10,2 L-22,-14', 'k', 1, { op: 0.3 }), S([[-4, 0], [-6, -14], [-12, -18], [-16, -6], [-14, 2]], 's', { ns: true, cl: true, op: 0.5 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-6,-22 L-4,-30 L-2,-22 Z M-18,-24 L-17,-32 L-14,-24 Z M-28,-16 L-28,-24 L-24,-16 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(plumePts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-6, -4, 2.6)] },
    },
  }),
  rPart({
    id: 'antlers', slot: 'crest', name: 'Antlers', tags: ['dragon', 'deer'], dom: 0.5, w: 1,
    extra: [
      rBeam([[-6, 2], [-8, -10], [-6, -22], [-10, -36]], 5, 3, 'pd'), rBeam([[-7, -14], [-14, -20], [-20, -28]], 4, 2, 'pd'),
      rBeam([[8, 2], [11, -10], [12, -24], [9, -38]], 5.5, 3), rBeam([[11, -14], [18, -20], [24, -28]], 4.5, 2.2), rBeam([[12, -26], [18, -34]], 4, 2),
    ],
    stages: {
      2: { grow: [1.1, 1.12], add: [rBeam([[11, -6], [18, -8], [23, -14]], 4, 2), rBeam([[-7, -6], [-14, -9], [-18, -14]], 3.6, 2, 'pd'), C(9, -39, 2.4, 'a', { sw: 1.4 }), C(-10, -37, 2, 'a', { sw: 1.4 }), C(24, -29, 2.2, 'a', { sw: 1.4 })] },
      3: { grow: [1.1, 1.1], add: [rBeam([[12, -30], [16, -42], [14, -50]], 3.6, 2), rBeam([[-10, -30], [-14, -42]], 3, 1.8, 'pd'), C(14, -51, 2.6, 'a', { sw: 1.5 }), C(-14, -43, 2, 'a', { sw: 1.4 }), C(9, -40, 6, 'a', { ns: true, op: 0.22 })] },
    },
  }),
  rPart({
    id: 'spikes', slot: 'crest', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2,
    shapes: [spikePts],
    extra: [HL('M-2,-18 L0,-6 L2,-18 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-11,-8 L-9,-18 L-7,-8 Z M-2,-12 L0,-24 L2,-12 Z M7,-8 L9,-18 L11,-8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: [[-20, 4], [-20, -4], [-15, -18, 'c'], [-8, -4], [-4, -26, 'c'], [0, -6], [4, -28, 'c'], [8, -4], [15, -18, 'c'], [18, -4], [20, 4]], f: 'pd' }] },
    },
  }),
];
