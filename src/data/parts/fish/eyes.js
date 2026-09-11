// Fish eyes. Origin = eye centre.
// Evolutions: stage 2 rings the iris in the accent colour; stage 3 adds a glow and a second glint.
import { fPart } from './_shared.js';
import { E, C, L, P, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

/** Shared eye evolution: an accent iris ring, then glow and a second glint. */
function fEyeStages(iris) {
  const [ix, iy, r] = iris;
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(ix, iy, r * 0.95, 'a', 1.3, { cl: true, op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [evoGlow(ix, iy, r * 1.5, 0.2), C(ix - r * 0.45, iy - r * 0.5, r * 0.28, 'w', { ns: true, op: 0.9 })] },
  };
}

function fEye({ id, name, shape, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, ring, dom = 0.5, w = 2, tags = [] }) {
  const prims = [];
  if (ring) prims.push(C(0, 0, ring[0], ring[1], { ns: true, op: ring[2] }));
  prims.push(P(shape, sclera, { sw: 2 }));
  if (iris) {
    prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
    prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: true, op: 0.5 }));
  }
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lidFill) prims.push(P(lidFill, 'p', { ns: true, cl: true }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  return fPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: fEyeStages(iris) });
}

const F_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const F_BIG = spline([[0, -8], [7.4, -2.6], [6.8, 6], [0, 8.4], [-6.8, 6], [-7.4, -2.6]]);

export const F_EYES = [
  fEye({ id: 'round', name: 'Round', tags: ['classic'], w: 3, shape: F_OVAL, lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  fEye({ id: 'wide', name: 'Wide', tags: ['cute'], w: 3, shape: F_BIG, iris: [0.8, 0.4, 5], pupil: [1.4, 0.8, 2.8], glint: [2.8, -2.4, 1.7], glint2: [-1.4, 2.4, 0.9], lid: 'M-6,-6.5 Q0,-10 6,-6.5' }),
  fEye({ id: 'fierce', name: 'Fierce', tags: ['angry'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), iris: [1, 0.6, 3.6], pupil: [1.4, 0.9, 1.9], glint: [2.4, -1, 1.1], lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-5.8 Z', lid: 'M-7,-5.5 L6.5,-1.5' }),
  fEye({ id: 'sleepy', name: 'Sleepy', tags: ['calm'], w: 2, shape: F_OVAL, iris: [0.8, 1.2, 3.8], pupil: [1.2, 1.5, 2], glint: [2.2, -0.4, 1.1], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1 L-9,-1 Z', lid: 'M-6,-1 L6,-1' }),
  fEye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5], [4.8, -1.5], [4.2, 3.6], [0, 5.2], [-4.2, 3.6], [-4.8, -1.5]]), iris: [0.4, 0, 4.4], pupil: [0.6, 0.2, 3.2], glint: [1.8, -1.8, 1.2], glint2: [-1, 1.5, 0.6], lid: null }),
  fEye({ id: 'deadeye', name: 'Deep-sea', tags: ['angler', 'eerie'], w: 1, shape: F_BIG, iris: [0.6, 0.2, 5.4], irisRole: 'el', pupil: [0.8, 0.4, 1.4], glint: [3, -3, 1], glint2: null, lid: null, ring: [9.5, 'e', 0.35] }),
  fEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: F_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.8, 0.2, [1.4, 4.6]], glint: [2.4, -2.4, 1.3], ring: [9, 'e', 0.3] }),
];
