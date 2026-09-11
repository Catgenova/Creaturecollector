// Amphibian eyes (bulging, on top of the head), mouths (wide), gills (external frills behind the
// head), throats (vocal sacs under the jaw) and crests (growths on the crown).
import { aPart } from './_shared.js';
import { NONE, E, C, L, P, S, SH, HL, spline, fur } from '../_dsl.js';

function aEye({ id, name, shape, dome, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], pupilPath, glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, dom = 0.5, w = 2, tags = [] }) {
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
  return aPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims });
}
const A_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const A_BIG = spline([[0, -8], [7.4, -2.6], [6.8, 6], [0, 8.4], [-6.8, 6], [-7.4, -2.6]]);
const DOME = spline([[0, -10], [9, -4], [8.5, 6], [0, 9], [-8.5, 6], [-9, -4]]);

export const A_EYES = [
  aEye({ id: 'bulge', name: 'Bulging', tags: ['frog'], w: 3, dome: DOME, shape: spline([[0.5, -7], [6.5, -2.5], [6, 4.5], [0.5, 6.5], [-5, 4.5], [-5.5, -2.5]]), iris: [1, 0, 4.2], pupil: [1.4, 0.3, [3, 2]], glint: [2.6, -2.2, 1.4] }),
  aEye({ id: 'big', name: 'Big', tags: ['cute'], w: 3, shape: A_BIG, iris: [0.8, 0.4, 5], pupil: [1.4, 0.8, 2.8], glint: [2.8, -2.4, 1.7], glint2: [-1.4, 2.4, 0.9], lid: 'M-6,-6.5 Q0,-10 6,-6.5' }),
  aEye({ id: 'sleepy', name: 'Heavy-lidded', tags: ['toad'], w: 2, dome: DOME, shape: A_OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1' }),
  aEye({ id: 'gold', name: 'Slotted', tags: ['newt'], w: 2, dome: DOME, shape: A_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.6, 0.2, [4.4, 1.6]], glint: [2.4, -2.4, 1.2] }),
  aEye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], irisRole: 'k', pupil: null, glint: [1.9, -1.9, 1.4], glint2: [-1, 1.6, 0.6], lid: null }),
  aEye({ id: 'wide', name: 'Wide', tags: ['tadpole'], w: 2, shape: A_BIG, iris: [0.6, 0.4, 5.6], pupil: [1, 0.8, 3.4], glint: [3, -2.6, 1.8], glint2: [-1.6, 2.6, 1], lid: null }),
  aEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, dome: DOME, shape: A_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.8, 0.2, 2], glint: [2.4, -2.4, 1.3] }),
];

export const A_MOUTHS = [
  aPart({ id: 'smile', slot: 'mouth', name: 'Wide smile', tags: ['frog'], dom: 0.5, w: 3, extra: [L('M4,-2 C-2,4 -14,6 -26,2', 'k', 2.2)] }),
  aPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M4,-2 C-2,6 -14,8 -26,2 C-14,4 -2,2 4,-2 Z', 'k', { ns: true }), P('M0,-1 C-6,2 -14,3 -22,1 C-14,2 -6,1 0,-1 Z', 'w', { ns: true })] }),
  aPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M4,2 C-2,-3 -14,-4 -26,0', 'k', 2.2)] }),
  aPart({ id: 'tongue', slot: 'mouth', name: 'Tongue', tags: ['frog'], dom: 0.5, w: 2, extra: [L('M4,-2 C-2,4 -14,6 -26,2', 'k', 2.2), P('M-2,1 C4,6 12,8 18,4 C20,2 18,0 16,0 C10,1 4,0 -1,-1 Z', 'a', { sw: 1.4 })] }),
  aPart({ id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.45, w: 2, extra: [P('M4,-4 C-2,-6 -14,-6 -24,-2 C-14,8 -2,10 4,4 Z', 'k', { ns: true }), P('M0,2 C-6,4 -14,4 -20,0 C-14,6 -4,7 0,2 Z', 'a', { ns: true })] }),
  aPart({ id: 'smirk', slot: 'mouth', name: 'Smirk', tags: ['sly'], dom: 0.45, w: 2, extra: [L('M4,-4 C0,2 -8,4 -20,2 C-14,0 -12,0 -10,0', 'k', 2.2)] }),
  aPart({ id: 'pout', slot: 'mouth', name: 'Pout', tags: ['cute'], dom: 0.45, w: 2, extra: [E(-6, 0, 3.5, 3, 'k', { ns: true }), C(-7, -1, 1, 'w', { ns: true, op: 0.6 })] }),
];

const frond = (pts, f = 'p') => S(pts, f);

export const A_GILLS = [
  NONE('gills', 0.3, 'a.'),
  aPart({ id: 'frills', slot: 'gills', name: 'Frills', tags: ['axolotl'], dom: 0.55, w: 3, extra: [
    frond([[2, -2], [-6, -14], [-18, -20, 0.3], [-10, -10], [-16, -6, 0.3], [-4, -2]]), frond([[2, 2], [-8, -4], [-22, -6, 0.3], [-12, 0], [-20, 6, 0.3], [-6, 4]]), frond([[2, 6], [-8, 8], [-20, 14, 0.3], [-10, 12], [-14, 20, 0.3], [-4, 10]]),
    L('M-4,-6 L-14,-16 M-6,0 L-18,-4 M-6,6 L-16,12', 'k', 1, { op: 0.3 }),
  ] }),
  aPart({ id: 'feathery', slot: 'gills', name: 'Feathery', tags: ['soft'], dom: 0.5, w: 2, extra: [
    frond([[2, -4], ...fur([-2, -8], [-22, -14], 4, 4, { tip: 0.5 }), [-24, -10], ...fur([-22, -6], [-2, -2], 3, -3, { tip: 0.5 })]), frond([[2, 4], ...fur([-2, 4], [-22, 8], 4, 4, { tip: 0.5 }), [-24, 12], ...fur([-22, 14], [-2, 8], 3, -3, { tip: 0.5 })]),
  ] }),
  aPart({ id: 'stubs', slot: 'gills', name: 'Stubs', tags: ['small'], dom: 0.4, w: 2, extra: [frond([[2, -4], [-4, -10], [-10, -8], [-6, -2]]), frond([[2, 2], [-6, 0], [-10, 4], [-4, 6]]), frond([[2, 8], [-4, 10], [-8, 14], [-2, 12]])] }),
  aPart({ id: 'plumes', slot: 'gills', name: 'Plumes', tags: ['long'], dom: 0.5, w: 2, extra: [frond([[2, -2], [-10, -14], [-28, -22, 0.2], [-18, -10], [-6, -2]]), frond([[2, 4], [-12, 2], [-32, 0, 0.2], [-18, 6], [-6, 6]]), frond([[2, 8], [-10, 14], [-26, 22, 0.2], [-16, 12], [-4, 10]])] }),
  aPart({ id: 'fan', slot: 'gills', name: 'Fan', tags: ['wide'], dom: 0.5, w: 2, extra: [frond([[2, -6], [-8, -16], [-22, -14, 0.3], [-24, -2], [-22, 10, 0.3], [-8, 14], [2, 8]]), L('M0,0 L-18,-12 M0,0 L-22,-2 M0,0 L-18,10', 'k', 1.1, { op: 0.3 })] }),
  aPart({ id: 'spiky', slot: 'gills', name: 'Spiky', tags: ['sharp'], dom: 0.45, w: 2, extra: [P('M2,-4 L-16,-14 L-4,-2 Z M2,2 L-20,0 L-2,6 Z M2,8 L-16,16 L-2,10 Z', 'p', { sw: 1.6 })] }),
  aPart({ id: 'leafy', slot: 'gills', name: 'Leafy', tags: ['grass'], dom: 0.45, w: 2, extra: [frond([[2, -2], [-8, -12], [-20, -16, 'c'], [-14, -6], [-4, 0]]), frond([[2, 4], [-10, 2], [-24, 4, 'c'], [-14, 8], [-4, 8]]), L('M-2,-4 L-16,-13 M-2,4 L-18,4', 'k', 1, { op: 0.3 })] }),
];

export const A_THROATS = [
  NONE('throat', 0.3, 'a.'),
  aPart({ id: 'sac', slot: 'throat', name: 'Vocal sac', tags: ['frog'], dom: 0.55, w: 3, extra: [E(0, 8, 14, 11, 's', { sw: 2 }), HL('M-8,0 C-4,-4 4,-4 8,0 L6,3 C2,1 -2,1 -6,3 Z', 0.3), SH('M-16,10 C-8,20 8,20 16,10 L16,24 L-16,24 Z', 0.1)] }),
  aPart({ id: 'double', slot: 'throat', name: 'Double sac', tags: ['frog'], dom: 0.5, w: 2, extra: [E(-9, 8, 9, 8, 's', { sw: 2 }), E(9, 8, 9, 8, 's', { sw: 2 }), HL('M-14,3 C-11,0 -7,0 -4,3 L-6,5 C-8,3 -10,3 -12,5 Z M4,3 C7,0 11,0 14,3 L12,5 C10,3 8,3 6,5 Z', 0.3)] }),
  aPart({ id: 'bubble', slot: 'throat', name: 'Small bubble', tags: ['small'], dom: 0.4, w: 2, extra: [E(0, 6, 8, 6.5, 's', { sw: 1.8 }), HL('M-5,1 C-2,-1 2,-1 5,1 L4,3 C1,2 -1,2 -4,3 Z', 0.3)] }),
  aPart({ id: 'dewlap', slot: 'throat', name: 'Dewlap', tags: ['flap'], dom: 0.45, w: 2, shapes: [[[-10, -2], [10, 0], [12, 10], [4, 18], [-8, 16], [-14, 6]]], extra: [L('M-2,0 L0,14 M-2,0 L8,8 M-2,0 L-8,10', 'k', 1.1, { op: 0.3 })] }),
  aPart({ id: 'glowsac', slot: 'throat', name: 'Glowing sac', tags: ['light'], dom: 0.45, w: 1, extra: [C(0, 8, 16, 'a', { ns: true, op: 0.3 }), E(0, 8, 13, 10, 'a', { sw: 2 }), HL('M-8,0 C-4,-4 4,-4 8,0 L6,3 C2,1 -2,1 -6,3 Z', 0.35)] }),
  aPart({ id: 'striped', slot: 'throat', name: 'Striped sac', tags: ['frog'], dom: 0.45, w: 2, extra: [E(0, 8, 14, 11, 's', { sw: 2 }), L('M-12,4 C-4,8 4,8 12,4 M-12,10 C-4,14 4,14 12,10 M-8,16 C-2,19 2,19 8,16', 'a', 2.2, { op: 0.7 })] }),
  aPart({ id: 'frilled', slot: 'throat', name: 'Frilled', tags: ['frilly'], dom: 0.45, w: 2, shapes: [[[-12, -2], [12, -2], [14, 6], ...fur([12, 10], [-12, 12], 5, 4, { tip: 0.5 }), [-14, 6]]], extra: [S([[-8, 0], [8, 0], [8, 6], [-8, 6]], 's', { ns: true, cl: true, op: 0.4 })] }),
];

export const A_CRESTS = [
  NONE('crest', 0.3, 'a.'),
  aPart({ id: 'sprout', slot: 'crest', name: 'Sprout', tags: ['grass'], dom: 0.5, w: 3, extra: [L('M0,2 C0,-6 -2,-10 -2,-14', 'k', 5), L('M0,2 C0,-6 -2,-10 -2,-14', 'pd', 2.4), S([[-2, -14], [-12, -22], [-16, -14, 'c'], [-8, -10]], 'p'), S([[-2, -14], [8, -24], [14, -16, 'c'], [6, -10]], 'p'), L('M-3,-14 L-12,-18 M-1,-14 L8,-20', 'k', 1, { op: 0.35 })] }),
  aPart({ id: 'leaves', slot: 'crest', name: 'Leaf pair', tags: ['grass'], dom: 0.5, w: 2, extra: [S([[-4, 2], [-18, -6], [-28, -4, 'c'], [-20, 6], [-6, 6]], 'p'), S([[4, 2], [18, -8], [28, -6, 'c'], [20, 4], [6, 6]], 'p'), L('M-6,4 L-24,-2 M6,4 L24,-4', 'k', 1, { op: 0.35 })] }),
  aPart({ id: 'fin', slot: 'crest', name: 'Head fin', tags: ['newt'], dom: 0.5, w: 2, shapes: [[[-6, 4], [-2, -10], [4, -22], [10, -12], [12, 4]]], extra: [S([[-4, 2], [0, -10], [4, -16], [8, -10], [10, 2]], 's', { ns: true, cl: true, op: 0.5 }), L('M-2,2 L2,-18 M4,2 L6,-14', 'k', 1, { op: 0.3 })] }),
  aPart({ id: 'horns', slot: 'crest', name: 'Brow horns', tags: ['horned'], dom: 0.5, w: 2, extra: [S([[-14, 4], [-14, -4], [-10, -14, 'c'], [-6, -4], [-4, 4]], 'p'), S([[4, 4], [6, -4], [10, -14, 'c'], [14, -4], [14, 4]], 'p'), HL('M8,-4 L10,-12 L12,-4 Z', 0.25)] }),
  aPart({ id: 'mushroom', slot: 'crest', name: 'Mushroom cap', tags: ['poison'], dom: 0.55, w: 2, extra: [L('M0,4 L0,-8', 'k', 7), L('M0,4 L0,-8', 's', 4), S([[-18, -6], [-14, -18], [0, -24], [14, -18], [18, -6], [0, -3]], 'p'), ...[[-10, -12], [2, -18], [10, -10]].map(([x, y]) => C(x, y, 2.4, 'w', { ns: true, op: 0.85 })), HL('M-12,-10 C-8,-18 -2,-20 4,-20 L2,-16 C-2,-16 -6,-14 -8,-8 Z', 0.2)] }),
  aPart({ id: 'moss', slot: 'crest', name: 'Moss tuft', tags: ['grass'], dom: 0.45, w: 2, shapes: [[[-14, 4], ...fur([-14, 4], [14, 4], 5, 9, { tip: 0.6, lean: 0.1, wobble: 0.3 }), [16, 6], [-16, 6]]], extra: [S([[-8, 2], [-6, -4], [2, -6], [8, -2], [8, 4]], 's', { ns: true, cl: true, op: 0.35 })] }),
  aPart({ id: 'spikes', slot: 'crest', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[-14, 4], [-14, -2], [-9, -12, 'c'], [-4, -2], [0, -16, 'c'], [4, -2], [9, -12, 'c'], [14, -2], [14, 4]]], extra: [HL('M-2,-12 L0,-4 L2,-12 Z', 0.25)] }),
];
