// Reptile eyes. Origin = eye centre. Many are coloured all over with a slit pupil.
// Evolutions: stage 2 rings the iris in the accent colour; stage 3 adds a glow, a second glint
// and an accent brow spike, and the eye grows a touch each time.
import { rPart } from './_shared.js';
import { E, C, L, P, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

function rEyeStages(iris, brow) {
  const [ix, iy, r] = iris;
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(ix, iy, r * 0.95, 'a', 1.3, { cl: true, op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [evoGlow(ix, iy, r * 1.5, 0.2), C(ix - r * 0.45, iy - r * 0.5, r * 0.28, 'w', { ns: true, op: 0.9 }), P(brow, 'a', { ns: true })] },
  };
}

function rEye({ id, name, shape, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], pupilPath, glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, before = [], brow = 'M-2,-7 L1.5,-12.5 L5,-7 Z', dom = 0.5, w = 2, tags = [] }) {
  const prims = [...before];
  if (shape) prims.push(P(shape, sclera, { sw: 2 }));
  if (iris) {
    prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: Boolean(shape) }));
    prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: Boolean(shape), op: 0.5 }));
  }
  if (pupilPath) prims.push(P(pupilPath, 'k', { ns: true, cl: Boolean(shape) }));
  else if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: Boolean(shape) }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: Boolean(shape) }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lidFill) prims.push(P(lidFill, 'p', { ns: true, cl: Boolean(shape) }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  return rPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: rEyeStages(iris, brow) });
}

const OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);

export const R_EYES = [
  rEye({ id: 'round', name: 'Round', tags: ['cute'], w: 3, shape: OVAL, lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  rEye({ id: 'slit', name: 'Slit', tags: ['snake'], w: 3, shape: OVAL, sclera: 'e', iris: [0.4, 0.2, 4.6], irisRole: 'el', pupil: [0.8, 0.2, [1.4, 5.2]], glint: [2.6, -2.4, 1.2], lid: 'M-5,-5.2 Q0,-8.6 5.2,-5.2' }),
  rEye({ id: 'turret', name: 'Turret', tags: ['chameleon'], w: 2, shape: null, before: [C(0, 0, 8, 'p'), L('M-5,-5 C-2,-2 2,-2 5,-5 M-6,2 C-2,4 2,4 6,2', 'k', 1, { op: 0.3 })], iris: [1.5, 0, 3.4], pupil: [2, 0, 1.4], glint: [2.8, -1.4, 0.8], glint2: null, brow: 'M-3,-8 L0,-13.5 L3,-8 Z' }),
  rEye({ id: 'fierce', name: 'Fierce', tags: ['angry'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), iris: [1, 0.6, 3.6], pupil: [1.4, 0.9, [1.4, 3.2]], glint: [2.4, -1, 1.1], lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-5.8 Z', lid: 'M-7,-5.5 L6.5,-1.5', brow: 'M3,-3 L7.5,-8 L8,-1.5 Z' }),
  rEye({ id: 'hooded', name: 'Hooded', tags: ['calm'], w: 2, shape: OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1', brow: 'M-2,-2 L1.5,-7.5 L5,-2 Z' }),
  rEye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5], [4.8, -1.5], [4.2, 3.6], [0, 5.2], [-4.2, 3.6], [-4.8, -1.5]]), iris: [0.4, 0, 4.4], pupil: [0.6, 0.2, 3.2], glint: [1.8, -1.8, 1.2], glint2: [-1, 1.5, 0.6], lid: null, brow: 'M-2,-5.5 L1,-10 L4,-5.5 Z' }),
  rEye({ id: 'gem', name: 'Gem', tags: ['dragon'], w: 2, shape: OVAL, sclera: 'e', iris: [0.6, 0.2, 4.4], irisRole: 'el', pupilPath: 'M1,-4.6 L3.6,0 L1,4.6 L-1.6,0 Z', glint: [2.6, -2.6, 1.2], lid: 'M-5,-5.2 Q0,-8.6 5.2,-5.2' }),
];
