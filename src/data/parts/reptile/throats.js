// Reptile throats: dewlaps, pouches and frills under the jaw. Origin = the head's throat socket.
// Drawn behind the skull so the top edge hides under the jaw.
// Evolutions: stage 2 grows the feature and adds accent rays, rings or spines; stage 3 layers a
// larger copy of it behind and sets a gem at the throat.
import { rPart } from './_shared.js';
import { NONE, S, L, E, SH, HL, fur, xfPts, arcPts } from '../_dsl.js';
import { evoGem, evoRing } from '../_evo.js';

/** Layered evolution for a throat feature drawn from the point list `pts`: accent detail at 2, a bigger copy behind and a gem at 3. */
const rThroatStages = (pts, detail2, gem, k2 = 1.12, k3 = 1.32) => ({
  2: { grow: [k2, k2 * 1.05], add: detail2 },
  3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(pts, { sx: k3, sy: k3 }), f: 'pd' }], add: [...evoGem(gem[0], gem[1], gem[2] || 3)] },
});

const dewlapPts = [[-8, -6], [8, -4], [12, 10], [4, 20], [-8, 18], [-14, 6]];
const throatFrillPts = [[-20, -16], [0, -18], [16, -8], [18, 8], [6, 20], [-10, 20], [-24, 6]];
const beardPts = [[-12, -6], [10, -4], [12, 4], ...fur([12, 6], [-10, 14], 5, 5, { lean: 0.2, tip: 'c' }), [-14, 6]];
const platesPts = [[-12, -6], [12, -4], [14, 4], [12, 14], [0, 18], [-12, 14], [-14, 4]];
const ruffPts = [[-16, -10], [8, -8], [12, 0], ...fur([12, 2], [-4, 20], 3, 6, { lean: 0.3, tip: 0.5 }), [-16, 16], [-20, 2]];
const collarPts = [[-14, -8], [12, -6], [14, 4], [12, 8], [-12, 10], [-16, 2]];
const pouchPts = arcPts(0, 6, 12, 10, 0, 330, 11);

export const R_THROATS = [
  NONE('throat', 0.3, 'r.'),
  rPart({
    id: 'dewlap', slot: 'throat', name: 'Dewlap', tags: ['anole'], dom: 0.5, w: 2,
    shapes: [dewlapPts],
    extra: [L('M-4,-2 L0,16 M-4,-2 L8,10 M-4,-2 L-8,12', 'k', 1.1, { op: 0.3 }), SH('M-16,10 C-8,18 4,20 12,12 L14,24 L-16,24 Z', 0.12)],
    stages: rThroatStages(dewlapPts, [L('M-4,-2 L0,16 M-4,-2 L8,10 M-4,-2 L-8,12', 'a', 1.6, { ns: true, op: 0.7 })], [-1, 8]),
  }),
  rPart({
    id: 'pouch', slot: 'throat', name: 'Pouch', tags: ['bulge'], dom: 0.45, w: 2,
    extra: [E(0, 6, 12, 10, 'p'), SH('M-14,8 C-8,16 8,16 14,8 L14,20 L-14,20 Z', 0.12), HL('M-8,-1 C-4,-4 4,-4 8,-1 L6,2 C2,0 -2,0 -6,2 Z', 0.2)],
    stages: {
      2: { grow: [1.15, 1.15], add: [evoRing(0, 6, 8, 'a', 1.6, { op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(pouchPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(0, 6, 3.2)] },
    },
  }),
  rPart({
    id: 'frill', slot: 'throat', name: 'Neck frill', tags: ['frill'], dom: 0.55, w: 1,
    shapes: [throatFrillPts],
    extra: [S([[-14, -10], [0, -12], [10, -4], [12, 6], [4, 14], [-8, 14], [-18, 4]], 's', { ns: true, cl: true, op: 0.5 }), L('M-2,0 L14,-6 M-2,0 L16,6 M-2,0 L6,18 M-2,0 L-8,18 M-2,0 L-20,4 M-2,0 L-16,-12', 'k', 1.1, { op: 0.3 })],
    stages: rThroatStages(throatFrillPts, [L('M-2,0 L14,-6 M-2,0 L16,6 M-2,0 L6,18 M-2,0 L-8,18 M-2,0 L-20,4 M-2,0 L-16,-12', 'a', 1.6, { ns: true, op: 0.7 })], [-2, 2, 3.4]),
  }),
  rPart({
    id: 'beard', slot: 'throat', name: 'Beard', tags: ['spiky'], dom: 0.5, w: 2,
    shapes: [beardPts],
    extra: [SH('M-16,6 C-8,12 4,14 12,8 L14,20 L-16,20 Z', 0.12)],
    stages: rThroatStages(beardPts, [L('M8,8 L9,14 M2,10 L3,16 M-4,10 L-3,16 M-10,9 L-9,14', 'a', 1.8, { ns: true, op: 0.8 })], [0, 2, 2.6]),
  }),
  rPart({
    id: 'plates', slot: 'throat', name: 'Throat plates', tags: ['armour'], dom: 0.5, w: 2,
    shapes: [platesPts],
    extra: [L('M-12,2 C-4,5 6,5 13,2 M-11,8 C-4,11 6,11 12,8', 'k', 1.2, { op: 0.3 }), SH('M-16,8 C-8,16 6,16 14,8 L14,22 L-16,22 Z', 0.12), HL('M-10,-4 C-4,-6 4,-6 10,-4 L8,0 C4,-2 -4,-2 -8,0 Z', 0.16)],
    stages: rThroatStages(platesPts, [L('M-12,2 C-4,5 6,5 13,2 M-11,8 C-4,11 6,11 12,8', 'a', 1.6, { ns: true, op: 0.7 })], [0, 6, 2.8]),
  }),
  rPart({
    id: 'ruff', slot: 'throat', name: 'Feather ruff', tags: ['feathers'], dom: 0.45, w: 2,
    shapes: [ruffPts],
    extra: [S([[-10, -6], [2, -6], [4, 4], [-2, 12], [-12, 8]], 's', { ns: true, cl: true, op: 0.5 }), SH('M-22,8 C-10,18 4,18 12,10 L14,24 L-22,24 Z', 0.12)],
    stages: rThroatStages(ruffPts, [L('M8,12 L9,18 M0,14 L0,20 M-8,12 L-9,18', 'a', 1.8, { ns: true, op: 0.8 })], [-4, 2, 2.8]),
  }),
  rPart({
    id: 'collar', slot: 'throat', name: 'Collar', tags: ['band'], dom: 0.45, w: 2,
    shapes: [collarPts],
    extra: [S([[-13, -2], [12, 0], [12, 5], [-12, 6]], 's', { ns: true, cl: true }), SH('M-16,4 L14,4 L14,12 L-16,12 Z', 0.12)],
    stages: rThroatStages(collarPts, [L('M-12,8 L12,7', 'a', 2, { ns: true, cl: true, op: 0.85 })], [0, 2, 2.6], 1.15, 1.35),
  }),
];
