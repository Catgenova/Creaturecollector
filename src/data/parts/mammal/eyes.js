// Mammal eyes. Origin = eye centre, near-eye size; the far eye is a scaled copy.
// Sclera first (it is the clip for the iris and pupil), then iris, pupil, highlights, lid.
import { mPart } from './_shared.js';
import { E, C, L, P, spline } from '../_dsl.js';

/** Eye builder: shape = sclera path, iris/pupil positions and sizes, lid = upper lid line path or null. */
function eye({ id, name, shape, iris = [0.8, 0.2, 3.8], pupil = [1.2, 0.5, 2], glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, lidFill, lash, dom = 0.5, w = 2, tags = [] }) {
  const prims = [P(shape, 'w', { sw: 2 })];
  prims.push(C(iris[0], iris[1], iris[2], 'e', { ns: true, cl: true }));
  prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: true, op: 0.55 }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lidFill) prims.push(P(lidFill, 'p', { ns: true, cl: true }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  if (lash) prims.push(L(lash, 'k', 1.5));
  return mPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims });
}

export const M_EYES = [
  eye({ id: 'round', name: 'Round', tags: ['cute'], w: 3, shape: spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]), lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  eye({ id: 'almond', name: 'Almond', tags: ['fox', 'sly'], w: 3, shape: spline([[-6.5, -3], [0, -6.5], [6.5, -4.5], [7, 0.5], [3, 4.5], [-3, 4.5], [-7, 1]]), iris: [1, 0, 3.6], pupil: [1.4, 0.3, [1.5, 3]], lid: 'M-6,-4.5 Q0,-8.5 6.5,-6' }),

  eye({ id: 'slit', name: 'Slit', tags: ['cat'], w: 3, shape: spline([[0, -6.5], [6.2, -2], [5.6, 4.6], [0, 6.6], [-5.6, 4.6], [-6.2, -2]]), iris: [0.6, 0, 5], pupil: [0.8, 0.2, [1.4, 4.6]], glint: [2.6, -2.2, 1.3], lid: 'M-5,-5.2 Q0,-8.6 5.2,-5.2' }),
  eye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], pupil: [0.6, 0.2, 3.4], glint: [1.9, -1.9, 1.3], glint2: [-1, 1.6, 0.6], lid: null }),
  eye({ id: 'doe', name: 'Doe', tags: ['deer', 'rabbit'], w: 3, shape: spline([[-1, -7], [6, -3], [6.4, 4], [1, 7.4], [-5, 5], [-7, -1]]), iris: [0.8, 0.4, 4.4], pupil: [1.2, 0.8, 2.6], glint: [2.6, -1.6, 1.5], lid: 'M-6,-4 Q0,-9 6.4,-5', lash: 'M6,-5.6 L8.6,-8 M4,-7 L5.6,-9.6' }),

  eye({ id: 'sleepy', name: 'Sleepy', tags: ['calm'], w: 2, shape: spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]), iris: [0.8, 1, 3.8], pupil: [1.2, 1.3, 2], glint: [2.2, -0.6, 1.2], glint2: null, lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-1.5 Z', lid: 'M-6,-1.5 L6,-1.5' }),
  eye({ id: 'fierce', name: 'Fierce', tags: ['angry'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), iris: [1, 0.6, 3.6], pupil: [1.4, 0.9, 1.9], glint: [2.4, -1, 1.1], lidFill: 'M-9,-10 L9,-10 L9,-1.5 L-9,-5.8 Z', lid: 'M-7,-5.5 L6.5,-1.5' }),
];
