// Bird eyes, beaks, crests and face markings. Eye origin = eye centre; beak origin = its base on the
// head's beak socket (beaks point right); crest origin = crown (drawn behind the head); face origin = the
// centre of the face (drawn on the head under the eyes).
import { bPart } from './_shared.js';
import { NONE, E, C, L, P, S, SH, HL, spline, fur, tube } from '../_dsl.js';

function bEye({ id, name, shape, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, ring, dom = 0.5, w = 2, tags = [] }) {
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
  return bPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims });
}

const B_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const B_BIG = spline([[0, -8.5], [8, -3], [7.4, 6.4], [0, 9], [-7.4, 6.4], [-8, -3]]);

export const B_EYES = [
  bEye({ id: 'bead', name: 'Bead', tags: ['songbird'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], irisRole: 'k', pupil: null, glint: [1.9, -1.9, 1.4], glint2: [-1, 1.6, 0.6], lid: null }),
  bEye({ id: 'big', name: 'Big', tags: ['owl'], w: 2, shape: B_BIG, iris: [0.6, 0.4, 6.2], pupil: [1, 0.8, 3.2], glint: [3, -2.6, 1.8], glint2: [-1.4, 2.6, 0.9], lid: 'M-7,-6 Q0,-10.6 7,-6' }),
  bEye({ id: 'fierce', name: 'Fierce', tags: ['raptor'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), iris: [1, 0.6, 3.6], pupil: [1.4, 0.9, 1.9], glint: [2.4, -1, 1.1], lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-5.8 Z', lid: 'M-7,-5.5 L6.5,-1.5' }),
  bEye({ id: 'round', name: 'Round', tags: ['cute'], w: 3, shape: B_OVAL, lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  bEye({ id: 'sleepy', name: 'Sleepy', tags: ['calm'], w: 2, shape: B_OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1' }),
  bEye({ id: 'sparkle', name: 'Sparkle', tags: ['fairy'], w: 2, shape: B_BIG, iris: [0.6, 0.4, 6], pupil: [1, 0.8, 3], glint: [3, -2.8, 2], glint2: [-2, 3, 1.2], lid: 'M-7,-6 Q0,-10.6 7,-6' }),
  bEye({ id: 'ring', name: 'Eye ring', tags: ['ringed'], w: 2, shape: B_OVAL, iris: [0.6, 0.2, 4.2], irisRole: 'k', pupil: null, glint: [2, -2, 1.4], lid: null, ring: [8.5, 'w', 0.9] }),
];

export const B_BEAKS = [
  bPart({ id: 'short', slot: 'beak', name: 'Short', tags: ['songbird'], dom: 0.5, w: 3, extra: [P('M-4,-5 L12,-1 L-4,4 Z', 'p', { sw: 2 }), L('M-3,-1 L10,-1', 'k', 1.2, { op: 0.5 }), HL('M-2,-4 L6,-2 L-2,-1 Z', 0.3)] }),
  bPart({ id: 'hooked', slot: 'beak', name: 'Hooked', tags: ['raptor'], dom: 0.55, w: 2, extra: [P('M-4,-7 C6,-8 14,-4 14,2 C14,6 12,9 10,10 C10,6 8,4 4,3 L-4,4 Z', 'p', { sw: 2 }), L('M-3,0 L8,1', 'k', 1.2, { op: 0.5 }), HL('M-2,-6 C4,-6 8,-4 10,-1 L6,-1 C4,-3 0,-4 -2,-4 Z', 0.3)] }),
  bPart({ id: 'long', slot: 'beak', name: 'Dagger', tags: ['heron'], dom: 0.5, w: 2, extra: [P('M-4,-5 L26,-1 L-4,4 Z', 'p', { sw: 2 }), L('M-3,-0.5 L22,-0.5', 'k', 1.2, { op: 0.5 }), HL('M-2,-4 L14,-2 L-2,-1 Z', 0.3)] }),
  bPart({ id: 'flat', slot: 'beak', name: 'Bill', tags: ['duck'], dom: 0.5, w: 2, extra: [P('M-4,-6 C6,-8 16,-6 20,-1 C16,4 6,6 -4,4 Z', 'p', { sw: 2 }), L('M-3,-1 C4,0 12,0 18,-1', 'k', 1.2, { op: 0.5 }), C(12, -4, 1, 'k', { ns: true, op: 0.5 }), HL('M-2,-5 C4,-6 12,-5 16,-2 L10,-2 C6,-3 2,-3 -2,-2 Z', 0.3)] }),
  bPart({ id: 'stout', slot: 'beak', name: 'Stout', tags: ['finch'], dom: 0.5, w: 2, extra: [P('M-4,-8 C4,-9 12,-6 14,0 C12,6 4,8 -4,7 Z', 'p', { sw: 2 }), L('M-3,0 L12,0', 'k', 1.2, { op: 0.5 }), HL('M-2,-6 C4,-7 8,-5 10,-2 L4,-2 C2,-4 0,-4 -2,-4 Z', 0.3)] }),
  bPart({ id: 'needle', slot: 'beak', name: 'Needle', tags: ['hummingbird'], dom: 0.45, w: 2, extra: [P('M-3,-2.5 L24,-0.5 L-3,2 Z', 'p', { sw: 1.8 }), L('M-2,0 L20,0', 'k', 1, { op: 0.4 })] }),
  bPart({ id: 'parrot', slot: 'beak', name: 'Parrot', tags: ['parrot'], dom: 0.55, w: 2, extra: [P('M-6,-9 C4,-11 14,-6 14,2 C14,8 12,12 8,13 C8,8 6,6 2,5 L-6,6 Z', 'p', { sw: 2 }), P('M-4,5 C0,4 5,5 7,8 C4,10 0,9 -4,8 Z', 'pd', { sw: 1.4 }), L('M-3,2 L6,3', 'k', 1.2, { op: 0.5 }), HL('M-3,-8 C4,-9 9,-6 11,-1 L7,-1 C5,-4 1,-6 -3,-6 Z', 0.3)] }),
];

export const B_CRESTS = [
  NONE('crest', 0.3, 'b.'),
  bPart({ id: 'tuft', slot: 'crest', name: 'Tuft', tags: ['small'], dom: 0.45, w: 3, shapes: [[[-6, 4], [-4, -6], [-8, -14, 0.2], [-2, -8], [2, -18, 0.2], [4, -8], [10, -12, 0.2], [8, -2], [8, 4]]], extra: [HL('M-2,-6 L2,-14 L4,-6 Z', 0.25)] }),
  bPart({ id: 'cockatoo', slot: 'crest', name: 'Cockatoo', tags: ['parrot'], dom: 0.55, w: 2, shapes: [[[-8, 4], [-6, -8], [-14, -22, 0.2], [-4, -14], [-6, -32, 0.2], [2, -16], [8, -34, 0.2], [8, -14], [18, -24, 0.2], [12, -8], [10, 4]]], extra: [S([[-4, 0], [-4, -10], [-2, -22], [2, -12], [6, -24], [6, -10], [8, 0]], 's', { ns: true, cl: true, op: 0.45 }), L('M-4,0 L-8,-18 M0,0 L-2,-26 M4,0 L6,-28 M8,0 L14,-20', 'k', 1, { op: 0.3 })] }),
  bPart({ id: 'eartufts', slot: 'crest', name: 'Ear tufts', tags: ['owl'], dom: 0.5, w: 2, extra: [S([[-20, 2], [-18, -8], [-22, -20, 0.2], [-12, -10], [-8, 2]], 'p'), S([[8, 2], [12, -10], [22, -20, 0.2], [18, -8], [20, 2]], 'p'), HL('M-18,-6 L-20,-16 L-14,-8 Z M12,-8 L20,-16 L16,-6 Z', 0.25)] }),
  bPart({ id: 'halo', slot: 'crest', name: 'Halo', tags: ['holy'], dom: 0.5, w: 1, extra: [E(0, -14, 16, 5, 'none', { sw: 4 }), E(0, -14, 16, 5, 'a', { ns: true, op: 0.9 }), E(0, -14, 10, 2.5, 'k', { ns: true, op: 0.35 }), HL('M-12,-16 C-6,-19 6,-19 12,-16 L12,-14 C6,-16 -6,-16 -12,-14 Z', 0.4)] }),
  bPart({ id: 'mohawk', slot: 'crest', name: 'Mohawk', tags: ['punk'], dom: 0.5, w: 2, shapes: [[[-16, 4], [-14, -6], [-10, -18, 'c'], [-6, -8], [-2, -22, 'c'], [2, -8], [6, -20, 'c'], [10, -8], [14, -14, 'c'], [16, 0], [16, 4]]], extra: [HL('M-4,-8 L-2,-18 L0,-8 Z', 0.25)] }),
  bPart({ id: 'plume', slot: 'crest', name: 'Crown plumes', tags: ['peacock'], dom: 0.5, w: 1, extra: [L('M-4,2 L-8,-16 M0,2 L0,-20 M4,2 L8,-16', 'k', 1.6), C(-9, -18, 3.5, 'p', { sw: 1.6 }), C(0, -23, 3.5, 'p', { sw: 1.6 }), C(9, -18, 3.5, 'p', { sw: 1.6 })] }),
  bPart({ id: 'fluff', slot: 'crest', name: 'Fluff', tags: ['chick'], dom: 0.45, w: 2, shapes: [[[-14, 4], ...fur([-14, 4], [14, 4], 5, 12, { lean: 0.1, tip: 0.5, wobble: 0.25 }), [16, 6], [-16, 6]]], extra: [HL('M-8,-2 C-4,-8 4,-8 8,-2 L6,2 C2,-2 -2,-2 -6,2 Z', 0.2)] }),
];

export const B_FACES = [
  NONE('face', 0.3, 'b.'),
  bPart({ id: 'disc', slot: 'face', name: 'Facial disc', tags: ['owl'], dom: 0.55, w: 2, extra: [P('M-11,-14 C-2,-18 2,-18 11,-14 C20,-8 20,6 11,12 C4,16 -4,16 -11,12 C-20,6 -20,-8 -11,-14 Z', 's', { sw: 2 }), L('M0,-16 L0,12', 'k', 1.2, { op: 0.3 }), SH('M-20,4 C-10,12 10,12 20,4 L20,16 L-20,16 Z', 0.1)] }),
  bPart({ id: 'cheeks', slot: 'face', name: 'Cheek patches', tags: ['songbird'], dom: 0.5, w: 3, extra: [E(6, 4, 6, 4.5, 'a', { ns: true, op: 0.85 }), E(-8, 3, 4.5, 3.5, 'a', { ns: true, op: 0.65 })] }),
  bPart({ id: 'mask', slot: 'face', name: 'Mask', tags: ['bandit'], dom: 0.5, w: 2, extra: [P('M-16,-8 C-8,-12 8,-12 18,-6 C16,0 10,2 4,0 C0,-2 -4,-2 -8,0 C-12,2 -16,0 -16,-8 Z', 'a', { ns: true, op: 0.9 })] }),
  bPart({ id: 'brows', slot: 'face', name: 'Brow tufts', tags: ['stern'], dom: 0.5, w: 2, extra: [S([[-14, -6], [-6, -10], [2, -8], [4, -5], [-4, -6], [-12, -3]], 'p', { sw: 1.6 }), S([[4, -7], [12, -11], [18, -9], [18, -6], [12, -7], [6, -4]], 'p', { sw: 1.6 })] }),
  bPart({ id: 'wattle', slot: 'face', name: 'Wattle', tags: ['rooster'], dom: 0.45, w: 2, extra: [S([[6, 4], [10, 8], [9, 16], [4, 18], [0, 14], [2, 8]], 'a', { sw: 1.6 }), HL('M4,8 C6,8 7,10 6,13 L4,13 C4,10 3,9 4,8 Z', 0.3)] }),
  bPart({ id: 'beard', slot: 'face', name: 'Beard', tags: ['feathers'], dom: 0.45, w: 2, shapes: [[[-10, 4], [8, 4], [10, 8], ...fur([10, 10], [-8, 14], 4, 5, { lean: 0.2, tip: 0.4 }), [-12, 8]]], extra: [S([[-6, 6], [4, 6], [4, 10], [-4, 12]], 's', { ns: true, cl: true, op: 0.4 })] }),
  bPart({ id: 'spectacles', slot: 'face', name: 'Spectacles', tags: ['ringed'], dom: 0.45, w: 1, extra: [E(6, -2, 8, 7, 'w', { ns: true, op: 0.85 }), E(-9, -3, 6, 5.5, 'w', { ns: true, op: 0.6 })] }),
];
