// Bird eyes, beaks, crests and face markings. Eye origin = eye centre; beak origin = its base on the
// head's beak socket (beaks point right); crest origin = crown (drawn behind the head); face origin = the
// centre of the face (drawn on the head under the eyes).
// Evolutions: eyes ring the iris then glow; beaks grow accent tips, then hooks, serrations and base
// bands; crests grow accent tips, then layer a larger copy behind (or a second pair) with a gem; faces
// gain accent rims, sparkles and extra lobes.
import { bPart } from './_shared.js';
import { NONE, E, C, L, P, S, SH, HL, spline, fur, tube, xfPts, arcPts } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';
import { evoRing, evoGlow, evoGem } from '../_evo.js';

function bEyeStages(iris, brow) {
  const [ix, iy, r] = iris;
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(ix, iy, r * 0.95, 'a', 1.3, { cl: true, op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [evoGlow(ix, iy, r * 1.5, 0.2), C(ix - r * 0.45, iy - r * 0.5, r * 0.28, 'w', { ns: true, op: 0.9 }), L(brow, 'k', 1.6)] },
  };
}

function bEye({ id, name, shape, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, ring, brow = 'M-5,-9 Q0,-11.5 5,-9', dom = 0.5, w = 2, tags = [] }) {
  const prims = [];
  if (ring) prims.push(C(0, 0, ring[0], ring[1], { ns: true, op: ring[2] }));
  prims.push(P(shape, sclera, { sw: 2 }));
  if (iris) {
    prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
    prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: true, op: 0.5 }));
  }
  if (pupil) prims.push(C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lidFill) prims.push(P(lidFill, 'p', { ns: true, cl: true }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  return bPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: bEyeStages(iris || [0, 0, 4], brow) });
}

const B_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const B_BIG = spline([[0, -8.5], [8, -3], [7.4, 6.4], [0, 9], [-7.4, 6.4], [-8, -3]]);

export const B_EYES = [
  bEye({ id: 'bead', name: 'Bead', tags: ['songbird'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], irisRole: 'k', pupil: null, glint: [1.9, -1.9, 1.4], glint2: [-1, 1.6, 0.6], lid: null, brow: 'M-4,-7.5 Q0,-9.5 4,-7.5' }),
  bEye({ id: 'big', name: 'Big', tags: ['owl'], w: 2, shape: B_BIG, iris: [0.6, 0.4, 6.2], pupil: [1, 0.8, 3.2], glint: [3, -2.6, 1.8], glint2: [-1.4, 2.6, 0.9], lid: 'M-7,-6 Q0,-10.6 7,-6', brow: 'M-6,-11.5 Q0,-14 6,-11.5' }),
  bEye({ id: 'fierce', name: 'Fierce', tags: ['raptor'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), iris: [1, 0.6, 3.6], pupil: [1.4, 0.9, 1.9], glint: [2.4, -1, 1.1], lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-5.8 Z', lid: 'M-7,-5.5 L6.5,-1.5', brow: 'M-8,-8 L7,-4' }),
  bEye({ id: 'round', name: 'Round', tags: ['cute'], w: 3, shape: B_OVAL, lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  bEye({ id: 'sleepy', name: 'Sleepy', tags: ['calm'], w: 2, shape: B_OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1', brow: 'M-6,-5 Q0,-7.5 6,-5' }),
  bEye({ id: 'sparkle', name: 'Sparkle', tags: ['fairy'], w: 2, shape: B_BIG, iris: [0.6, 0.4, 6], pupil: [1, 0.8, 3], glint: [3, -2.8, 2], glint2: [-2, 3, 1.2], lid: 'M-7,-6 Q0,-10.6 7,-6', brow: 'M-6,-11.5 Q0,-14 6,-11.5' }),
  bEye({ id: 'ring', name: 'Eye ring', tags: ['ringed'], w: 2, shape: B_OVAL, iris: [0.6, 0.2, 4.2], irisRole: 'k', pupil: null, glint: [2, -2, 1.4], lid: null, ring: [8.5, 'w', 0.9], brow: 'M-5,-10.5 Q0,-13 5,-10.5' }),
];

export const B_BEAKS = [
  bPart({ id: 'short', slot: 'beak', name: 'Short', tags: ['songbird'], dom: 0.5, w: 3, extra: [P('M-4,-5 L12,-1 L-4,4 Z', 'p', { sw: 2 }), L('M-3,-1 L10,-1', 'k', 1.2, { op: 0.5 }), HL('M-2,-4 L6,-2 L-2,-1 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M7,-2.2 L12,-1 L7,0.4 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M6,-2.6 L12,-1 L6,0.8 Z', 'a', { ns: true }), L('M-3,-4.5 L-3,3.5', 'a', 2, { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'hooked', slot: 'beak', name: 'Hooked', tags: ['raptor'], dom: 0.55, w: 2, extra: [P('M-4,-7 C6,-8 14,-4 14,2 C14,6 12,9 10,10 C10,6 8,4 4,3 L-4,4 Z', 'p', { sw: 2 }), L('M-3,0 L8,1', 'k', 1.2, { op: 0.5 }), HL('M-2,-6 C4,-6 8,-4 10,-1 L6,-1 C4,-3 0,-4 -2,-4 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M11,3 C12.5,5 12,8 10,10 C9.6,7.6 9,6 8,5 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M11,3 C12.5,5 12,8 10,10 C9.6,7.6 9,6 8,5 Z', 'a', { ns: true }), L('M0,3 L2,5 M4,3.5 L6,5.5', 'k', 1, { op: 0.5 }), L('M-3,-6.5 L-3,3.5', 'a', 2, { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'long', slot: 'beak', name: 'Dagger', tags: ['heron'], dom: 0.5, w: 2, extra: [P('M-4,-5 L26,-1 L-4,4 Z', 'p', { sw: 2 }), L('M-3,-0.5 L22,-0.5', 'k', 1.2, { op: 0.5 }), HL('M-2,-4 L14,-2 L-2,-1 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M18,-2 L26,-1 L18,0.6 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M16,-2.2 L26,-1 L16,0.8 Z', 'a', { ns: true }), L('M-3,-4.5 L-3,3.5', 'a', 2, { ns: true, op: 0.8 }), L('M2,-3 L20,-1.6', 'w', 1, { ns: true, op: 0.4 })] },
    } }),
  bPart({ id: 'flat', slot: 'beak', name: 'Bill', tags: ['duck'], dom: 0.5, w: 2, extra: [P('M-4,-6 C6,-8 16,-6 20,-1 C16,4 6,6 -4,4 Z', 'p', { sw: 2 }), L('M-3,-1 C4,0 12,0 18,-1', 'k', 1.2, { op: 0.5 }), C(12, -4, 1, 'k', { ns: true, op: 0.5 }), HL('M-2,-5 C4,-6 12,-5 16,-2 L10,-2 C6,-3 2,-3 -2,-2 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [E(17, -1.5, 2.6, 1.8, 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [E(17, -1.5, 2.6, 1.8, 'a', { ns: true }), L('M2,1 L2,3 M6,1.5 L6,3.5 M10,1 L10,3', 'k', 1, { op: 0.4 }), L('M-3,-5.5 L-3,3.5', 'a', 2, { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'stout', slot: 'beak', name: 'Stout', tags: ['finch'], dom: 0.5, w: 2, extra: [P('M-4,-8 C4,-9 12,-6 14,0 C12,6 4,8 -4,7 Z', 'p', { sw: 2 }), L('M-3,0 L12,0', 'k', 1.2, { op: 0.5 }), HL('M-2,-6 C4,-7 8,-5 10,-2 L4,-2 C2,-4 0,-4 -2,-4 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M9,-3 L14,0 L9,3 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M8,-3.4 L14,0 L8,3.4 Z', 'a', { ns: true }), L('M-3,-7.5 L-3,6.5', 'a', 2, { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'needle', slot: 'beak', name: 'Needle', tags: ['hummingbird'], dom: 0.45, w: 2, extra: [P('M-3,-2.5 L24,-0.5 L-3,2 Z', 'p', { sw: 1.8 }), L('M-2,0 L20,0', 'k', 1, { op: 0.4 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M18,-1 L24,-0.5 L18,0.6 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-3,-2.5 L30,-0.5 L-3,2 Z', 'p', { sw: 1.8 }), P('M22,-1.2 L30,-0.5 L22,0.8 Z', 'a', { ns: true }), L('M-2,-2 L-2,1.6', 'a', 1.6, { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'parrot', slot: 'beak', name: 'Parrot', tags: ['parrot'], dom: 0.55, w: 2, extra: [P('M-6,-9 C4,-11 14,-6 14,2 C14,8 12,12 8,13 C8,8 6,6 2,5 L-6,6 Z', 'p', { sw: 2 }), P('M-4,5 C0,4 5,5 7,8 C4,10 0,9 -4,8 Z', 'pd', { sw: 1.4 }), L('M-3,2 L6,3', 'k', 1.2, { op: 0.5 }), HL('M-3,-8 C4,-9 9,-6 11,-1 L7,-1 C5,-4 1,-6 -3,-6 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M11,5 C12.5,8 11,11 8,13 C8,10 7.6,8 6,7 Z', 'a', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M11,5 C12.5,8 11,11 8,13 C8,10 7.6,8 6,7 Z', 'a', { ns: true }), L('M-1,3 L1,5', 'k', 1, { op: 0.5 }), L('M-5,-8.5 L-5,5.5', 'a', 2, { ns: true, op: 0.8 })] },
    } }),
];

const tuftPts = [[-6, 4], [-4, -6], [-8, -14, 0.2], [-2, -8], [2, -18, 0.2], [4, -8], [10, -12, 0.2], [8, -2], [8, 4]];
const cockatooPts = [[-8, 4], [-6, -8], [-14, -22, 0.2], [-4, -14], [-6, -32, 0.2], [2, -16], [8, -34, 0.2], [8, -14], [18, -24, 0.2], [12, -8], [10, 4]];
const mohawkPts = [[-16, 4], [-14, -6], [-10, -18, 'c'], [-6, -8], [-2, -22, 'c'], [2, -8], [6, -20, 'c'], [10, -8], [14, -14, 'c'], [16, 0], [16, 4]];
const fluffPts = [[-14, 4], ...fur([-14, 4], [14, 4], 5, 12, { lean: 0.1, tip: 0.5, wobble: 0.25 }), [16, 6], [-16, 6]];

export const B_CRESTS = [
  NONE('crest', 0.3, 'b.'),
  bPart({ id: 'tuft', slot: 'crest', name: 'Tuft', tags: ['small'], dom: 0.45, w: 3, shapes: [tuftPts], extra: [HL('M-2,-6 L2,-14 L4,-6 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-9,-10 L-8,-16 L-6,-10 Z M1,-14 L2,-20 L4,-14 Z M8,-8 L10,-14 L11,-8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(tuftPts, { sx: 1.35, sy: 1.35 }), f: 'pd' }], add: [...evoGem(1, -4, 2.4)] },
    } }),
  bPart({ id: 'cockatoo', slot: 'crest', name: 'Cockatoo', tags: ['parrot'], dom: 0.55, w: 2, shapes: [cockatooPts], extra: [S([[-4, 0], [-4, -10], [-2, -22], [2, -12], [6, -24], [6, -10], [8, 0]], 's', { ns: true, cl: true, op: 0.45 }), L('M-4,0 L-8,-18 M0,0 L-2,-26 M4,0 L6,-28 M8,0 L14,-20', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-15,-18 L-14,-25 L-11,-18 Z M-7,-28 L-6,-35 L-4,-28 Z M7,-30 L8,-37 L10,-30 Z M17,-20 L19,-27 L20,-20 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(cockatooPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(2, -6, 2.6)] },
    } }),
  bPart({ id: 'eartufts', slot: 'crest', name: 'Ear tufts', tags: ['owl'], dom: 0.5, w: 2, extra: [S([[-20, 2], [-18, -8], [-22, -20, 0.2], [-12, -10], [-8, 2]], 'p'), S([[8, 2], [12, -10], [22, -20, 0.2], [18, -8], [20, 2]], 'p'), HL('M-18,-6 L-20,-16 L-14,-8 Z M12,-8 L20,-16 L16,-6 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-21,-14 L-22,-22 L-16,-15 Z M17,-14 L22,-22 L20,-13 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: [[-26, 4], [-24, -10], [-30, -28, 0.2], [-16, -12], [-10, 4]], f: 'pd' }, { pts: [[10, 4], [16, -12], [30, -28, 0.2], [24, -10], [26, 4]], f: 'pd' }], add: [C(-22, -21, 2.2, 'a', { ns: true }), C(22, -21, 2.2, 'a', { ns: true })] },
    } }),
  bPart({ id: 'halo', slot: 'crest', name: 'Halo', tags: ['holy'], dom: 0.5, w: 1, extra: [E(0, -14, 16, 5, 'none', { sw: 4 }), E(0, -14, 16, 5, 'a', { ns: true, op: 0.9 }), E(0, -14, 10, 2.5, 'k', { ns: true, op: 0.35 }), HL('M-12,-16 C-6,-19 6,-19 12,-16 L12,-14 C6,-16 -6,-16 -12,-14 Z', 0.4)],
    stages: {
      2: { grow: [1.1, 1.1], add: [L(spline(arcPts(0, -14, 21, 7, 0, 330, 11)), 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], add: [P(sparklePath(-22, -20, 3.6), 'a', { ns: true }), P(sparklePath(22, -22, 3.2, 20), 'a', { ns: true }), P(sparklePath(0, -26, 2.8, 40), 'a', { ns: true, op: 0.85 }), C(0, -14, 24, 'a', { ns: true, op: 0.12 })] },
    } }),
  bPart({ id: 'mohawk', slot: 'crest', name: 'Mohawk', tags: ['punk'], dom: 0.5, w: 2, shapes: [mohawkPts], extra: [HL('M-4,-8 L-2,-18 L0,-8 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-12,-10 L-10,-18 L-8,-10 Z M-4,-12 L-2,-22 L0,-12 Z M4,-10 L6,-20 L8,-10 Z M12,-8 L14,-14 L15,-8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: [[-22, 4], [-20, -6], [-15, -22, 'c'], [-9, -8], [-3, -30, 'c'], [3, -8], [8, -28, 'c'], [13, -8], [19, -18, 'c'], [22, 0], [22, 4]], f: 'pd' }] },
    } }),
  bPart({ id: 'plume', slot: 'crest', name: 'Crown plumes', tags: ['peacock'], dom: 0.5, w: 1, extra: [L('M-4,2 L-8,-16 M0,2 L0,-20 M4,2 L8,-16', 'k', 1.6), C(-9, -18, 3.5, 'p', { sw: 1.6 }), C(0, -23, 3.5, 'p', { sw: 1.6 }), C(9, -18, 3.5, 'p', { sw: 1.6 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [C(-9, -18, 1.5, 'a', { ns: true }), C(0, -23, 1.5, 'a', { ns: true }), C(9, -18, 1.5, 'a', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [L('M-6,2 L-17,-10 M6,2 L17,-10', 'k', 1.6), C(-18, -12, 3, 'p', { sw: 1.6 }), C(18, -12, 3, 'p', { sw: 1.6 }), C(-18, -12, 1.3, 'a', { ns: true }), C(18, -12, 1.3, 'a', { ns: true }), C(0, -23, 6, 'a', { ns: true, op: 0.25 })] },
    } }),
  bPart({ id: 'fluff', slot: 'crest', name: 'Fluff', tags: ['chick'], dom: 0.45, w: 2, shapes: [fluffPts], extra: [HL('M-8,-2 C-4,-8 4,-8 8,-2 L6,2 C2,-2 -2,-2 -6,2 Z', 0.2)],
    stages: {
      2: { grow: [1.1, 1.3], add: [C(-8, -5, 1.6, 'a', { ns: true }), C(2, -8, 1.6, 'a', { ns: true }), C(9, -3, 1.4, 'a', { ns: true })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: xfPts(fluffPts, { sx: 1.3, sy: 1.5 }), f: 'pd' }] },
    } }),
];

const beardFacePts = [[-10, 4], [8, 4], [10, 8], ...fur([10, 10], [-8, 14], 4, 5, { lean: 0.2, tip: 0.4 }), [-12, 8]];
const discPath = 'M-11,-14 C-2,-18 2,-18 11,-14 C20,-8 20,6 11,12 C4,16 -4,16 -11,12 C-20,6 -20,-8 -11,-14 Z';

export const B_FACES = [
  NONE('face', 0.3, 'b.'),
  bPart({ id: 'disc', slot: 'face', name: 'Facial disc', tags: ['owl'], dom: 0.55, w: 2, extra: [P(discPath, 's', { sw: 2 }), L('M0,-16 L0,12', 'k', 1.2, { op: 0.3 }), SH('M-20,4 C-10,12 10,12 20,4 L20,16 L-20,16 Z', 0.1)],
    stages: {
      2: { grow: [1.1, 1.1], add: [L(discPath, 'a', 1.4, { ns: true, op: 0.7 })] },
      3: { grow: [1.08, 1.08], add: [L('M-8,-11 C-2,-14 2,-14 8,-11 C14,-6 14,4 8,8 C2,11 -2,11 -8,8 C-14,4 -14,-6 -8,-11 Z', 'a', 1, { ns: true, op: 0.5 }), L('M-16,-8 L-20,-12 M16,-8 L20,-12 M-16,8 L-20,12 M16,8 L20,12', 'a', 1.6, { ns: true, op: 0.6 })] },
    } }),
  bPart({ id: 'cheeks', slot: 'face', name: 'Cheek patches', tags: ['songbird'], dom: 0.5, w: 3, extra: [E(6, 4, 6, 4.5, 'a', { ns: true, op: 0.85 }), E(-8, 3, 4.5, 3.5, 'a', { ns: true, op: 0.65 })],
    stages: {
      2: { grow: [1.1, 1.1], add: [E(6, 4, 7.2, 5.4, 'a', { ns: true, op: 0.85 }), E(-8, 3, 5.4, 4.2, 'a', { ns: true, op: 0.65 })] },
      3: { grow: [1.08, 1.08], add: [P(sparklePath(12, 1, 3), 'w', { ns: true, op: 0.8 }), P(sparklePath(-12, 0, 2.4, 20), 'w', { ns: true, op: 0.7 })] },
    } }),
  bPart({ id: 'mask', slot: 'face', name: 'Mask', tags: ['bandit'], dom: 0.5, w: 2, extra: [P('M-16,-8 C-8,-12 8,-12 18,-6 C16,0 10,2 4,0 C0,-2 -4,-2 -8,0 C-12,2 -16,0 -16,-8 Z', 'a', { ns: true, op: 0.9 })],
    stages: {
      2: { grow: [1.1, 1.1], add: [L('M-16,-8 C-8,-12 8,-12 18,-6', 'k', 1.2, { op: 0.4 })] },
      3: { grow: [1.08, 1.08], add: [P('M-16,-8 L-22,-16 L-14,-10 Z M18,-6 L26,-14 L18,-9 Z', 'a', { ns: true, op: 0.9 }), C(-6, -6, 1.4, 'w', { ns: true, op: 0.6 }), C(6, -6, 1.4, 'w', { ns: true, op: 0.6 })] },
    } }),
  bPart({ id: 'brows', slot: 'face', name: 'Brow tufts', tags: ['stern'], dom: 0.5, w: 2, extra: [S([[-14, -6], [-6, -10], [2, -8], [4, -5], [-4, -6], [-12, -3]], 'p', { sw: 1.6 }), S([[4, -7], [12, -11], [18, -9], [18, -6], [12, -7], [6, -4]], 'p', { sw: 1.6 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [S([[-18, -7], [-8, -13], [2, -10], [4, -7], [-4, -8], [-14, -4]], 'p', { sw: 1.6 }), S([[4, -9], [14, -15], [22, -11], [22, -7], [14, -9], [6, -6]], 'p', { sw: 1.6 })] },
      3: { grow: [1.08, 1.08], add: [L('M-16,-9 L-20,-14 M20,-11 L24,-16', 'a', 2, { ns: true }), P('M-10,-12 L-8,-18 L-5,-11 Z M12,-14 L15,-20 L17,-13 Z', 'a', { ns: true, op: 0.85 })] },
    } }),
  bPart({ id: 'wattle', slot: 'face', name: 'Wattle', tags: ['rooster'], dom: 0.45, w: 2, extra: [S([[6, 4], [10, 8], [9, 16], [4, 18], [0, 14], [2, 8]], 'a', { sw: 1.6 }), HL('M4,8 C6,8 7,10 6,13 L4,13 C4,10 3,9 4,8 Z', 0.3)],
    stages: {
      2: { grow: [1.1, 1.15], add: [S([[-2, 6], [2, 10], [1, 16], [-3, 18], [-6, 14], [-5, 9]], 'a', { sw: 1.4 })] },
      3: { grow: [1.08, 1.1], add: [S([[6, 4], [12, 9], [11, 20], [4, 23], [-1, 17], [2, 9]], 'a', { sw: 1.6 }), HL('M4,9 C7,9 8,12 7,16 L4,16 C4,12 3,10 4,9 Z', 0.3), C(4, 22, 1.6, 'w', { ns: true, op: 0.5 })] },
    } }),
  bPart({ id: 'beard', slot: 'face', name: 'Beard', tags: ['feathers'], dom: 0.45, w: 2, shapes: [beardFacePts], extra: [S([[-6, 6], [4, 6], [4, 10], [-4, 12]], 's', { ns: true, cl: true, op: 0.4 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M8,12 L9,16 M2,13 L2,17 M-4,13 L-5,17', 'a', 1.6, { ns: true, op: 0.8 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(beardFacePts, { sx: 1.3, sy: 1.35 }), f: 'pd' }], add: [...evoGem(0, 8, 2.2)] },
    } }),
  bPart({ id: 'spectacles', slot: 'face', name: 'Spectacles', tags: ['ringed'], dom: 0.45, w: 1, extra: [E(6, -2, 8, 7, 'w', { ns: true, op: 0.85 }), E(-9, -3, 6, 5.5, 'w', { ns: true, op: 0.6 })],
    stages: {
      2: { grow: [1.1, 1.1], add: [evoRing(6, -2, 9.2, 'a', 1.2, { op: 0.6 }), evoRing(-9, -3, 7, 'a', 1, { op: 0.5 })] },
      3: { grow: [1.08, 1.08], add: [P(sparklePath(14, -8, 3), 'a', { ns: true, op: 0.85 }), P(sparklePath(-15, -8, 2.4, 20), 'a', { ns: true, op: 0.75 }), L('M-3,-4 L0,-5', 'a', 1.6, { ns: true, op: 0.7 })] },
    } }),
];
