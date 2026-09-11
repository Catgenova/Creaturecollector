// Reptile back features: spines, sails and plates along the spine. Origin = the body's back socket.
// Evolutions: stage 2 grows the feature and adds accent tips, rays or an extra plate; stage 3
// layers a taller row or a second sail behind it, with a gem or extra shards.
import { rPart } from './_shared.js';
import { NONE, S, L, P, SH, HL, fur, xfPts } from '../_dsl.js';
import { evoGem } from '../_evo.js';

const sailPts = [[26, 6], [20, -16], [6, -32], [-12, -34], [-28, -20], [-34, 6], [-36, 10], [26, 10]];
const dorsalPts = [[8, 6], [6, -12], [-4, -30], [-16, -14], [-20, 6], [-22, 10], [10, 10]];

export const R_BACKS = [
  NONE('back', 0.3, 'r.'),
  rPart({
    id: 'spines', slot: 'back', name: 'Spines', tags: ['spiky'], dom: 0.5, w: 3,
    shapes: [[[28, 6], ...fur([28, 6], [-32, 6], 5, -14, { lean: 0.45, tip: 'c', wobble: 0.2 }), [-36, 10], [28, 10]]],
    extra: [SH('M-38,4 L30,4 L30,14 L-38,14 Z', 0.14)],
    stages: {
      2: { grow: [1.05, 1.3], add: [L('M14,-8 L16,-16 M2,-8 L4,-16 M-10,-8 L-8,-16 M-22,-6 L-20,-12', 'a', 2, { ns: true, op: 0.85 })] },
      3: { grow: [1.05, 1.25], addBehind: [{ pts: [[32, 8], ...fur([32, 8], [-36, 8], 6, -22, { lean: 0.45, tip: 'c', wobble: 0.2 }), [-40, 12], [32, 12]], f: 'pd' }], spikes: true },
    },
  }),
  rPart({
    id: 'sail', slot: 'back', name: 'Sail', tags: ['fin'], dom: 0.5, w: 2,
    shapes: [sailPts],
    extra: [S([[20, 4], [16, -12], [4, -26], [-12, -28], [-24, -16], [-28, 4]], 's', { ns: true, cl: true, op: 0.5 }), L('M22,4 L14,-20 M12,4 L4,-28 M0,4 L-10,-30 M-12,4 L-24,-18', 'k', 1.2, { op: 0.3 }), SH('M-38,4 L30,4 L30,14 L-38,14 Z', 0.12)],
    stages: {
      2: { grow: [1.05, 1.25], add: [L('M22,4 L14,-20 M12,4 L4,-28 M0,4 L-10,-30 M-12,4 L-24,-18', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.05, 1.2], addBehind: [{ pts: xfPts(sailPts, { sx: 1.22, sy: 1.25 }), f: 'pd' }], add: [...evoGem(-4, -14, 3.4)] },
    },
  }),
  rPart({
    id: 'plates', slot: 'back', name: 'Plates', tags: ['stegosaur'], dom: 0.5, w: 2,
    extra: [
      P('M14,6 L10,-6 L18,-18 L26,-6 L24,6 Z', 'p'), P('M-2,6 L-6,-10 L4,-26 L14,-10 L12,6 Z', 'p'), P('M-18,6 L-22,-8 L-12,-22 L-2,-8 L-4,6 Z', 'p'), P('M-32,6 L-34,-4 L-26,-14 L-18,-4 L-20,6 Z', 'p'),
      HL('M-6,-10 L4,-24 L8,-12 L0,-8 Z', 0.2), HL('M-22,-8 L-12,-20 L-8,-10 L-16,-6 Z', 0.2),
      SH('M-36,4 L28,4 L28,14 L-36,14 Z', 0.12),
    ],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M28,6 L26,-4 L32,-12 L38,-4 L38,6 Z', 'p'), P('M4,-26 L14,-10 L12,-8 L4,-22 Z', 'a', { ns: true, op: 0.7 }), P('M-12,-22 L-2,-8 L-4,-6 L-12,-18 Z', 'a', { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: [[8, 6, 'c'], [6, -6, 'c'], [12, -18, 'c'], [18, -6, 'c'], [18, 6, 'c']], f: 'pd' }, { pts: [[-10, 6, 'c'], [-14, -8, 'c'], [-6, -22, 'c'], [2, -8, 'c'], [2, 6, 'c']], f: 'pd' }, { pts: [[-26, 6, 'c'], [-28, -4, 'c'], [-22, -14, 'c'], [-14, -4, 'c'], [-14, 6, 'c']], f: 'pd' }] },
    },
  }),
  rPart({
    id: 'ridge', slot: 'back', name: 'Scute ridge', tags: ['croc'], dom: 0.45, w: 2,
    shapes: [[[28, 6], ...fur([28, 6], [-32, 6], 7, -7, { lean: 0.2, tip: 0.8, wobble: 0.1 }), [-36, 10], [28, 10]]],
    extra: [SH('M-38,4 L30,4 L30,14 L-38,14 Z', 0.14), L('M24,2 L24,8 M14,2 L14,8 M4,2 L4,8 M-6,2 L-6,8 M-16,2 L-16,8 M-26,2 L-26,8', 'k', 1, { op: 0.2 })],
    stages: {
      2: { grow: [1.05, 1.4], add: [L('M20,-2 L20,-6 M10,-2 L10,-6 M0,-2 L0,-6 M-10,-2 L-10,-6 M-20,-2 L-20,-6', 'a', 2, { ns: true, op: 0.8 })] },
      3: { grow: [1.05, 1.25], addBehind: [{ pts: [[32, 8], ...fur([32, 8], [-36, 8], 8, -12, { lean: 0.2, tip: 0.6, wobble: 0.1 }), [-40, 12], [32, 12]], f: 'pd' }] },
    },
  }),
  rPart({
    id: 'fin', slot: 'back', name: 'Dorsal fin', tags: ['fin'], dom: 0.5, w: 2,
    shapes: [dorsalPts],
    extra: [S([[4, 4], [2, -10], [-4, -24], [-12, -12], [-14, 4]], 's', { ns: true, cl: true, op: 0.5 }), L('M4,4 L-2,-24 M-4,4 L-10,-16', 'k', 1.2, { op: 0.3 }), SH('M-24,4 L12,4 L12,14 L-24,14 Z', 0.12)],
    stages: {
      2: { grow: [1.05, 1.3], addShapes: [{ pts: [[-2, -26], [-6, -42, 'c'], [-8, -22]], f: 'p' }], add: [L('M4,4 L-2,-24 M-4,4 L-10,-16', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.05, 1.15], addBehind: [{ pts: xfPts(dorsalPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-4, -8, 3)] },
    },
  }),
  rPart({
    id: 'crystals', slot: 'back', name: 'Crystals', tags: ['rock', 'ice'], dom: 0.5, w: 1,
    extra: [
      P('M-24,8 L-30,-10 L-20,-26 L-12,-8 L-14,8 Z', 'pd'), P('M-4,8 L-10,-14 L2,-40 L14,-16 L10,8 Z', 'p'), P('M14,8 L12,-6 L22,-22 L30,-6 L26,8 Z', 'pl'),
      HL('M-6,-10 L2,-32 L4,-30 L-2,-8 Z', 0.35), HL('M16,-12 L21,-20 L23,-18 L19,-10 Z', 0.26),
      L('M-24,8 L-22,-6 M-4,8 L0,-12 M14,8 L18,-4', 'k', 1.2, { op: 0.3 }),
    ],
    stages: {
      2: { grow: [1.1, 1.22], add: [P('M-38,8 L-42,-4 L-34,-16 L-28,-4 L-30,8 Z', 'pd'), P('M-34,-2 L-33,-10 L-32,-9 L-33,-1 Z', 'w', { ns: true, op: 0.35 })] },
      3: { grow: [1.08, 1.12], add: [P('M30,8 L30,-4 L38,-16 L44,-4 L42,8 Z', 'pl'), P('M-16,8 L-22,-4 L-16,-22 L-8,-6 L-8,8 Z', 'pd'), P('M-14,-4 L-16,-16 L-14,-14 L-12,-4 Z', 'w', { ns: true, op: 0.35 })] },
    },
  }),
  rPart({
    id: 'feathers', slot: 'back', name: 'Feather ridge', tags: ['raptor', 'feathers'], dom: 0.45, w: 2,
    shapes: [[[26, 6], ...fur([26, 6], [-32, 6], 5, -11, { lean: 0.5, tip: 0.5, wobble: 0.15 }), [-36, 10], [26, 10]]],
    extra: [S([[20, 4], [16, -4], [6, -2], [4, 4]], 's', { ns: true, cl: true, op: 0.5 }), S([[-4, 4], [-8, -4], [-18, -2], [-20, 4]], 's', { ns: true, cl: true, op: 0.5 }), SH('M-38,4 L28,4 L28,12 L-38,12 Z', 0.12)],
    stages: {
      2: { grow: [1.05, 1.3], add: [L('M14,-6 L14,-12 M2,-6 L2,-12 M-10,-6 L-10,-12 M-22,-4 L-22,-10', 'a', 2, { ns: true, op: 0.8 })] },
      3: { grow: [1.05, 1.25], addBehind: [{ pts: [[30, 8], ...fur([30, 8], [-36, 8], 6, -18, { lean: 0.5, tip: 0.5, wobble: 0.15 }), [-40, 12], [30, 12]], f: 'pd' }] },
    },
  }),
];
