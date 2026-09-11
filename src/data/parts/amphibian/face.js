// Amphibian eyes (bulging, on top of the head), mouths (wide), gills (external frills behind the
// head), throats (vocal sacs under the jaw) and crests (growths on the crown).
// Evolutions: eyes ring the iris then glow; mouths grow teeth, longer tongues and bubbles; gills
// tip their fronds in accent and grow a fan behind; throats ring, then layer a bigger sac and a
// gem; crests bud, flower, layer and gem.
import { aPart } from './_shared.js';
import { NONE, E, C, L, P, S, SH, HL, spline, fur, xfPts, arcPts } from '../_dsl.js';
import { starPath } from '../_sigils.js';
import { evoRing, evoGlow, evoGem, evoFan } from '../_evo.js';

function aEyeStages(iris, brow) {
  const [ix, iy, r] = iris;
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(ix, iy, r * 0.95, 'a', 1.3, { cl: true, op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [evoGlow(ix, iy, r * 1.5, 0.2), C(ix - r * 0.45, iy - r * 0.5, r * 0.28, 'w', { ns: true, op: 0.9 }), L(brow, 'k', 1.6)] },
  };
}

function aEye({ id, name, shape, dome, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], pupilPath, glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, brow = 'M-5,-9 Q0,-11.5 5,-9', dom = 0.5, w = 2, tags = [] }) {
  const prims = [];
  if (dome) prims.push(P(dome, 'p', { sw: 2 }));
  prims.push(P(shape, sclera, { sw: 2 }));
  if (iris) { prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true })); prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: true, op: 0.5 })); }
  if (pupilPath) prims.push(P(pupilPath, 'k', { ns: true, cl: true }));
  else if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lidFill) prims.push(P(lidFill, 'p', { ns: true, cl: true }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  return aPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: aEyeStages(iris || [0, 0, 4], brow) });
}
const A_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const A_BIG = spline([[0, -8], [7.4, -2.6], [6.8, 6], [0, 8.4], [-6.8, 6], [-7.4, -2.6]]);
const DOME = spline([[0, -10], [9, -4], [8.5, 6], [0, 9], [-8.5, 6], [-9, -4]]);

export const A_EYES = [
  aEye({ id: 'bulge', name: 'Bulging', tags: ['frog'], w: 3, dome: DOME, shape: spline([[0.5, -7], [6.5, -2.5], [6, 4.5], [0.5, 6.5], [-5, 4.5], [-5.5, -2.5]]), iris: [1, 0, 4.2], pupil: [1.4, 0.3, [3, 2]], glint: [2.6, -2.2, 1.4], brow: 'M-6,-11 Q0,-14 6,-11' }),
  aEye({ id: 'big', name: 'Big', tags: ['cute'], w: 3, shape: A_BIG, iris: [0.8, 0.4, 5], pupil: [1.4, 0.8, 2.8], glint: [2.8, -2.4, 1.7], glint2: [-1.4, 2.4, 0.9], lid: 'M-6,-6.5 Q0,-10 6,-6.5', brow: 'M-5,-11 Q0,-13.5 5,-11' }),
  aEye({ id: 'sleepy', name: 'Heavy-lidded', tags: ['toad'], w: 2, dome: DOME, shape: A_OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1', brow: 'M-6,-11 Q0,-13 6,-11' }),
  aEye({ id: 'gold', name: 'Slotted', tags: ['newt'], w: 2, dome: DOME, shape: A_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.6, 0.2, [4.4, 1.6]], glint: [2.4, -2.4, 1.2], brow: 'M-6,-11 Q0,-14 6,-11' }),
  aEye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], irisRole: 'k', pupil: null, glint: [1.9, -1.9, 1.4], glint2: [-1, 1.6, 0.6], lid: null, brow: 'M-4,-7.5 Q0,-9.5 4,-7.5' }),
  aEye({ id: 'wide', name: 'Wide', tags: ['tadpole'], w: 2, shape: A_BIG, iris: [0.6, 0.4, 5.6], pupil: [1, 0.8, 3.4], glint: [3, -2.6, 1.8], glint2: [-1.6, 2.6, 1], lid: null, brow: 'M-5,-11 Q0,-13.5 5,-11' }),
  aEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, dome: DOME, shape: A_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.8, 0.2, 2], glint: [2.4, -2.4, 1.3], brow: 'M-6,-11 Q0,-14 6,-11' }),
];

export const A_MOUTHS = [
  aPart({
    id: 'smile', slot: 'mouth', name: 'Wide smile', tags: ['frog'], dom: 0.5, w: 3, extra: [L('M4,-2 C-2,4 -14,6 -26,2', 'k', 2.2)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-12,3.6 L-10.6,7.4 L-9,3.6 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-12,3.6 L-10.6,8 L-9,3.6 Z M-20,3 L-18.8,6.6 L-17.4,2.8 Z M-4,1.6 L-2.8,5.2 L-1.4,1.4 Z', 'w', { sw: 1 })] },
    },
  }),
  aPart({
    id: 'grin', slot: 'mouth', name: 'Grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M4,-2 C-2,6 -14,8 -26,2 C-14,4 -2,2 4,-2 Z', 'k', { ns: true }), P('M0,-1 C-6,2 -14,3 -22,1 C-14,2 -6,1 0,-1 Z', 'w', { ns: true })],
    stages: {
      2: { grow: [1.12, 1.12], add: [L('M-6,-0.4 L-6,2.2 M-14,0.6 L-14,3.2', 'k', 1, { op: 0.6 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M0,-1 C-6,3 -14,4.5 -22,1.5 C-14,3.5 -6,2 0,-1 Z', 'w', { ns: true }), L('M-6,-0.4 L-6,3 M-14,0.6 L-14,4 M-18,1 L-18,3.6', 'k', 1, { op: 0.6 })] },
    },
  }),
  aPart({
    id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M4,2 C-2,-3 -14,-4 -26,0', 'k', 2.2)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-8,-1.5 L-6.6,3 L-5,-1.5 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-8,-1.5 L-6.6,4 L-5,-1.5 Z M-16,-1.4 L-14.8,2.6 L-13.4,-1.4 Z', 'w', { sw: 1 })] },
    },
  }),
  aPart({
    id: 'tongue', slot: 'mouth', name: 'Tongue', tags: ['frog'], dom: 0.5, w: 2, extra: [L('M4,-2 C-2,4 -14,6 -26,2', 'k', 2.2), P('M-2,1 C4,6 12,8 18,4 C20,2 18,0 16,0 C10,1 4,0 -1,-1 Z', 'a', { sw: 1.4 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-2,1 C6,8 16,10 24,5 C26,3 24,0 21,0 C13,2 5,1 -1,-1 Z', 'a', { sw: 1.4 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-2,1 C8,9 20,12 30,6 C32,4 30,0 27,0 C17,2 7,1 -1,-1 Z', 'a', { sw: 1.4 }), C(31, 4, 1.6, 'k', { ns: true }), L('M29,2 L31,0 M31,0 L33,2', 'k', 1, { op: 0.6 })] },
    },
  }),
  aPart({
    id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.45, w: 2, extra: [P('M4,-4 C-2,-6 -14,-6 -24,-2 C-14,8 -2,10 4,4 Z', 'k', { ns: true }), P('M0,2 C-6,4 -14,4 -20,0 C-14,6 -4,7 0,2 Z', 'a', { ns: true })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-2,-4.4 L-1,-1.4 L0,-4.4 Z M-8,-5 L-7,-2 L-6,-5 Z M-14,-5 L-13,-2 L-12,-5 Z', 'w', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-2,-4.4 L-1,-0.6 L0,-4.4 Z M-8,-5 L-7,-1.4 L-6,-5 Z M-14,-5 L-13,-1.4 L-12,-5 Z M-19,-4 L-18.2,-1.6 L-17.4,-4 Z', 'w', { ns: true }), C(-11, 1.6, 1.6, 'a', { ns: true })] },
    },
  }),
  aPart({
    id: 'smirk', slot: 'mouth', name: 'Smirk', tags: ['sly'], dom: 0.45, w: 2, extra: [L('M4,-4 C0,2 -8,4 -20,2 C-14,0 -12,0 -10,0', 'k', 2.2)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-6,1.5 L-4.8,5.5 L-3.4,1.5 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-6,1.5 L-4.6,7 L-3.2,1.5 Z', 'w', { sw: 1 })] },
    },
  }),
  aPart({
    id: 'pout', slot: 'mouth', name: 'Pout', tags: ['cute'], dom: 0.45, w: 2, extra: [E(-6, 0, 3.5, 3, 'k', { ns: true }), C(-7, -1, 1, 'w', { ns: true, op: 0.6 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [E(-6, 2.4, 3, 1.2, 'a', { ns: true, op: 0.6 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [C(-1, -4, 2.4, 'w', { ns: true, op: 0.45 }), evoRing(-1, -4, 2.8, 'k', 0.8, { op: 0.4 }), C(2, -7.5, 1.2, 'w', { ns: true, op: 0.4 })] },
    },
  }),
];

const frond = (pts, f = 'p') => S(pts, f);
/** Shared gill evolution: accent beads at the frond tips, then a fan of extra fronds behind and more beads. */
const aGillStages = (tips) => ({
  2: { grow: [1.15, 1.2], add: tips.map(([x, y]) => C(x, y, 2.2, 'a', { ns: true })) },
  3: { grow: [1.12, 1.15], addBehind: [{ pts: evoFan(0, 4, 120, 240, 4, 6, 28, { tip: 0.5 }), f: 'pd' }], add: tips.map(([x, y]) => C(x, y, 2.8, 'a', { ns: true })) },
});

export const A_GILLS = [
  NONE('gills', 0.3, 'a.'),
  aPart({ id: 'frills', slot: 'gills', name: 'Frills', tags: ['axolotl'], dom: 0.55, w: 3, extra: [
    frond([[2, -2], [-6, -14], [-18, -20, 0.3], [-10, -10], [-16, -6, 0.3], [-4, -2]]), frond([[2, 2], [-8, -4], [-22, -6, 0.3], [-12, 0], [-20, 6, 0.3], [-6, 4]]), frond([[2, 6], [-8, 8], [-20, 14, 0.3], [-10, 12], [-14, 20, 0.3], [-4, 10]]),
    L('M-4,-6 L-14,-16 M-6,0 L-18,-4 M-6,6 L-16,12', 'k', 1, { op: 0.3 }),
  ], stages: aGillStages([[-18, -20], [-22, -6], [-20, 14]]) }),
  aPart({ id: 'feathery', slot: 'gills', name: 'Feathery', tags: ['soft'], dom: 0.5, w: 2, extra: [
    frond([[2, -4], ...fur([-2, -8], [-22, -14], 4, 4, { tip: 0.5 }), [-24, -10], ...fur([-22, -6], [-2, -2], 3, -3, { tip: 0.5 })]), frond([[2, 4], ...fur([-2, 4], [-22, 8], 4, 4, { tip: 0.5 }), [-24, 12], ...fur([-22, 14], [-2, 8], 3, -3, { tip: 0.5 })]),
  ], stages: aGillStages([[-24, -10], [-24, 12]]) }),
  aPart({ id: 'stubs', slot: 'gills', name: 'Stubs', tags: ['small'], dom: 0.4, w: 2, extra: [frond([[2, -4], [-4, -10], [-10, -8], [-6, -2]]), frond([[2, 2], [-6, 0], [-10, 4], [-4, 6]]), frond([[2, 8], [-4, 10], [-8, 14], [-2, 12]])], stages: aGillStages([[-10, -8], [-10, 4], [-8, 14]]) }),
  aPart({ id: 'plumes', slot: 'gills', name: 'Plumes', tags: ['long'], dom: 0.5, w: 2, extra: [frond([[2, -2], [-10, -14], [-28, -22, 0.2], [-18, -10], [-6, -2]]), frond([[2, 4], [-12, 2], [-32, 0, 0.2], [-18, 6], [-6, 6]]), frond([[2, 8], [-10, 14], [-26, 22, 0.2], [-16, 12], [-4, 10]])], stages: aGillStages([[-28, -22], [-32, 0], [-26, 22]]) }),
  aPart({ id: 'fan', slot: 'gills', name: 'Fan', tags: ['wide'], dom: 0.5, w: 2, extra: [frond([[2, -6], [-8, -16], [-22, -14, 0.3], [-24, -2], [-22, 10, 0.3], [-8, 14], [2, 8]]), L('M0,0 L-18,-12 M0,0 L-22,-2 M0,0 L-18,10', 'k', 1.1, { op: 0.3 })], stages: aGillStages([[-22, -14], [-24, -2], [-22, 10]]) }),
  aPart({ id: 'spiky', slot: 'gills', name: 'Spiky', tags: ['sharp'], dom: 0.45, w: 2, extra: [P('M2,-4 L-16,-14 L-4,-2 Z M2,2 L-20,0 L-2,6 Z M2,8 L-16,16 L-2,10 Z', 'p', { sw: 1.6 })], stages: aGillStages([[-16, -14], [-20, 0], [-16, 16]]) }),
  aPart({ id: 'leafy', slot: 'gills', name: 'Leafy', tags: ['grass'], dom: 0.45, w: 2, extra: [frond([[2, -2], [-8, -12], [-20, -16, 'c'], [-14, -6], [-4, 0]]), frond([[2, 4], [-10, 2], [-24, 4, 'c'], [-14, 8], [-4, 8]]), L('M-2,-4 L-16,-13 M-2,4 L-18,4', 'k', 1, { op: 0.3 })], stages: aGillStages([[-20, -16], [-24, 4]]) }),
];

const sacPts = arcPts(0, 8, 14, 11, 0, 330, 11);
const dewlapPts2 = [[-10, -2], [10, 0], [12, 10], [4, 18], [-8, 16], [-14, 6]];
const frilledPts = [[-12, -2], [12, -2], [14, 6], ...fur([12, 10], [-12, 12], 5, 4, { tip: 0.5 }), [-14, 6]];

export const A_THROATS = [
  NONE('throat', 0.3, 'a.'),
  aPart({ id: 'sac', slot: 'throat', name: 'Vocal sac', tags: ['frog'], dom: 0.55, w: 3, extra: [E(0, 8, 14, 11, 's', { sw: 2 }), HL('M-8,0 C-4,-4 4,-4 8,0 L6,3 C2,1 -2,1 -6,3 Z', 0.3), SH('M-16,10 C-8,20 8,20 16,10 L16,24 L-16,24 Z', 0.1)],
    stages: {
      2: { grow: [1.15, 1.15], add: [evoRing(0, 8, 9, 'a', 1.6, { op: 0.6 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(sacPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(0, 8, 3)] },
    } }),
  aPart({ id: 'double', slot: 'throat', name: 'Double sac', tags: ['frog'], dom: 0.5, w: 2, extra: [E(-9, 8, 9, 8, 's', { sw: 2 }), E(9, 8, 9, 8, 's', { sw: 2 }), HL('M-14,3 C-11,0 -7,0 -4,3 L-6,5 C-8,3 -10,3 -12,5 Z M4,3 C7,0 11,0 14,3 L12,5 C10,3 8,3 6,5 Z', 0.3)],
    stages: {
      2: { grow: [1.15, 1.15], add: [evoRing(-9, 8, 6, 'a', 1.4, { op: 0.6 }), evoRing(9, 8, 6, 'a', 1.4, { op: 0.6 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: arcPts(-12, 10, 12, 11, 0, 330, 11), f: 'pd' }, { pts: arcPts(12, 10, 12, 11, 0, 330, 11), f: 'pd' }], add: [...evoGem(-9, 8, 2.4), ...evoGem(9, 8, 2.4)] },
    } }),
  aPart({ id: 'bubble', slot: 'throat', name: 'Small bubble', tags: ['small'], dom: 0.4, w: 2, extra: [E(0, 6, 8, 6.5, 's', { sw: 1.8 }), HL('M-5,1 C-2,-1 2,-1 5,1 L4,3 C1,2 -1,2 -4,3 Z', 0.3)],
    stages: {
      2: { grow: [1.2, 1.2], add: [evoRing(0, 6, 5, 'a', 1.4, { op: 0.6 })] },
      3: { grow: [1.12, 1.12], add: [C(-10, -4, 3.6, 's', { sw: 1.4 }), C(8, -6, 2.4, 's', { sw: 1.2 }), C(-11, -5, 1, 'w', { ns: true, op: 0.7 }), ...evoGem(0, 6, 2.4)] },
    } }),
  aPart({ id: 'dewlap', slot: 'throat', name: 'Dewlap', tags: ['flap'], dom: 0.45, w: 2, shapes: [dewlapPts2], extra: [L('M-2,0 L0,14 M-2,0 L8,8 M-2,0 L-8,10', 'k', 1.1, { op: 0.3 })],
    stages: {
      2: { grow: [1.12, 1.18], add: [L('M-2,0 L0,14 M-2,0 L8,8 M-2,0 L-8,10', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(dewlapPts2, { sx: 1.32, sy: 1.32 }), f: 'pd' }], add: [...evoGem(-1, 7, 2.8)] },
    } }),
  aPart({ id: 'glowsac', slot: 'throat', name: 'Glowing sac', tags: ['light'], dom: 0.45, w: 1, extra: [C(0, 8, 16, 'a', { ns: true, op: 0.3 }), E(0, 8, 13, 10, 'a', { sw: 2 }), HL('M-8,0 C-4,-4 4,-4 8,0 L6,3 C2,1 -2,1 -6,3 Z', 0.35)],
    stages: {
      2: { grow: [1.15, 1.15], add: [C(0, 8, 20, 'a', { ns: true, op: 0.22 })] },
      3: { grow: [1.1, 1.1], add: [evoRing(0, 8, 17, 'a', 1.4, { op: 0.5 }), evoRing(0, 8, 21, 'a', 1, { op: 0.3 }), C(0, 8, 4, 'w', { ns: true, op: 0.5 })] },
    } }),
  aPart({ id: 'striped', slot: 'throat', name: 'Striped sac', tags: ['frog'], dom: 0.45, w: 2, extra: [E(0, 8, 14, 11, 's', { sw: 2 }), L('M-12,4 C-4,8 4,8 12,4 M-12,10 C-4,14 4,14 12,10 M-8,16 C-2,19 2,19 8,16', 'a', 2.2, { op: 0.7 })],
    stages: {
      2: { grow: [1.15, 1.15], add: [L('M-10,-1 C-4,3 4,3 10,-1', 'a', 2.2, { op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(sacPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(0, 8, 3)] },
    } }),
  aPart({ id: 'frilled', slot: 'throat', name: 'Frilled', tags: ['frilly'], dom: 0.45, w: 2, shapes: [frilledPts], extra: [S([[-8, 0], [8, 0], [8, 6], [-8, 6]], 's', { ns: true, cl: true, op: 0.4 })],
    stages: {
      2: { grow: [1.12, 1.18], add: [L('M10,12 L11,16 M4,14 L4,18 M-2,14 L-2,18 M-8,13 L-9,17', 'a', 1.8, { ns: true, op: 0.8 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(frilledPts, { sx: 1.32, sy: 1.32 }), f: 'pd' }], add: [...evoGem(0, 3, 2.6)] },
    } }),
];

const finCrestPts = [[-6, 4], [-2, -10], [4, -22], [10, -12], [12, 4]];
const mossCrestPts = [[-14, 4], ...fur([-14, 4], [14, 4], 5, 9, { tip: 0.6, lean: 0.1, wobble: 0.3 }), [16, 6], [-16, 6]];
const spikeCrestPts = [[-14, 4], [-14, -2], [-9, -12, 'c'], [-4, -2], [0, -16, 'c'], [4, -2], [9, -12, 'c'], [14, -2], [14, 4]];

export const A_CRESTS = [
  NONE('crest', 0.3, 'a.'),
  aPart({ id: 'sprout', slot: 'crest', name: 'Sprout', tags: ['grass'], dom: 0.5, w: 3, extra: [L('M0,2 C0,-6 -2,-10 -2,-14', 'k', 5), L('M0,2 C0,-6 -2,-10 -2,-14', 'pd', 2.4), S([[-2, -14], [-12, -22], [-16, -14, 'c'], [-8, -10]], 'p'), S([[-2, -14], [8, -24], [14, -16, 'c'], [6, -10]], 'p'), L('M-3,-14 L-12,-18 M-1,-14 L8,-20', 'k', 1, { op: 0.35 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [C(-2, -16, 3, 'a', { sw: 1.4 })] },
      3: { grow: [1.1, 1.1], add: [P(starPath(-2, -20, 6.5, 5, 0.5), 'a', { sw: 1.4 }), C(-2, -20, 2, 'w', { ns: true, op: 0.8 })] },
    } }),
  aPart({ id: 'leaves', slot: 'crest', name: 'Leaf pair', tags: ['grass'], dom: 0.5, w: 2, extra: [S([[-4, 2], [-18, -6], [-28, -4, 'c'], [-20, 6], [-6, 6]], 'p'), S([[4, 2], [18, -8], [28, -6, 'c'], [20, 4], [6, 6]], 'p'), L('M-6,4 L-24,-2 M6,4 L24,-4', 'k', 1, { op: 0.35 })],
    stages: {
      2: { grow: [1.1, 1.15], addBehind: [[[-4, 0], [-14, -14], [-20, -24, 'c'], [-8, -12]], [[4, 0], [14, -14], [20, -24, 'c'], [8, -12]]] },
      3: { grow: [1.1, 1.1], add: [C(-2, -2, 2.6, 'a', { ns: true }), C(3, -5, 2.2, 'a', { ns: true }), C(-4, -7, 2, 'a', { ns: true }), L('M-6,4 L-24,-2 M6,4 L24,-4', 'a', 1.4, { ns: true, op: 0.6 })] },
    } }),
  aPart({ id: 'fin', slot: 'crest', name: 'Head fin', tags: ['newt'], dom: 0.5, w: 2, shapes: [finCrestPts], extra: [S([[-4, 2], [0, -10], [4, -16], [8, -10], [10, 2]], 's', { ns: true, cl: true, op: 0.5 }), L('M-2,2 L2,-18 M4,2 L6,-14', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.25], addShapes: [{ pts: [[2, -18], [4, -32, 'c'], [8, -16]], f: 'p' }], add: [L('M-2,2 L2,-18 M4,2 L6,-14', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(finCrestPts, { sx: 1.35, sy: 1.35 }), f: 'pd' }], add: [...evoGem(3, -8, 2.6)] },
    } }),
  aPart({ id: 'horns', slot: 'crest', name: 'Brow horns', tags: ['horned'], dom: 0.5, w: 2, extra: [S([[-14, 4], [-14, -4], [-10, -14, 'c'], [-6, -4], [-4, 4]], 'p'), S([[4, 4], [6, -4], [10, -14, 'c'], [14, -4], [14, 4]], 'p'), HL('M8,-4 L10,-12 L12,-4 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-12,-8 L-10,-16 L-8,-8 Z M8,-8 L10,-16 L12,-8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [[[-6, 4], [-4, -2], [0, -12, 'c'], [3, -2], [4, 4]]], add: [...evoGem(0, 0, 2.4)] },
    } }),
  aPart({ id: 'mushroom', slot: 'crest', name: 'Mushroom cap', tags: ['poison'], dom: 0.55, w: 2, extra: [L('M0,4 L0,-8', 'k', 7), L('M0,4 L0,-8', 's', 4), S([[-18, -6], [-14, -18], [0, -24], [14, -18], [18, -6], [0, -3]], 'p'), ...[[-10, -12], [2, -18], [10, -10]].map(([x, y]) => C(x, y, 2.4, 'w', { ns: true, op: 0.85 })), HL('M-12,-10 C-8,-18 -2,-20 4,-20 L2,-16 C-2,-16 -6,-14 -8,-8 Z', 0.2)],
    stages: {
      2: { grow: [1.12, 1.15], add: [L('M-18,4 L-18,-2', 'k', 5), L('M-18,4 L-18,-2', 's', 2.6), S([[-26, -2], [-24, -8], [-18, -10], [-12, -8], [-10, -2], [-18, 0]], 'p'), C(-19, -6, 1.4, 'w', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], add: [L('M16,4 L16,0', 'k', 4.5), L('M16,4 L16,0', 's', 2.2), S([[10, 0], [12, -5], [16, -7], [20, -5], [22, 0], [16, 1]], 'p'), C(-6, -28, 1.6, 'a', { ns: true, op: 0.8 }), C(6, -30, 1.4, 'a', { ns: true, op: 0.7 }), C(0, -34, 1.2, 'a', { ns: true, op: 0.6 })] },
    } }),
  aPart({ id: 'moss', slot: 'crest', name: 'Moss tuft', tags: ['grass'], dom: 0.45, w: 2, shapes: [mossCrestPts], extra: [S([[-8, 2], [-6, -4], [2, -6], [8, -2], [8, 4]], 's', { ns: true, cl: true, op: 0.35 })],
    stages: {
      2: { grow: [1.1, 1.3], add: [C(-8, -4, 1.8, 'a', { ns: true }), C(4, -6, 1.8, 'a', { ns: true })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: xfPts(mossCrestPts, { sx: 1.3, sy: 1.4 }), f: 'pd' }], add: [C(-2, -9, 2, 'a', { ns: true }), C(10, -2, 1.6, 'a', { ns: true }), C(-12, 0, 1.6, 'a', { ns: true })] },
    } }),
  aPart({ id: 'spikes', slot: 'crest', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2, shapes: [spikeCrestPts], extra: [HL('M-2,-12 L0,-4 L2,-12 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-11,-6 L-9,-14 L-7,-6 Z M-2,-9 L0,-18 L2,-9 Z M7,-6 L9,-14 L11,-6 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: [[-20, 4], [-20, -2], [-15, -14, 'c'], [-8, -2], [-4, -20, 'c'], [0, -4], [4, -22, 'c'], [8, -2], [15, -14, 'c'], [18, -2], [20, 4]], f: 'pd' }] },
    } }),
];
