// Flora eyes (seeds, dewdrops, gems set in the bloom) and mouths (small, low on the disc).
// Evolutions: eyes ring the iris then glow; mouths grow with the face family.
import { flPart } from './_shared.js';
import { P, C, E, L, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

const flEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0.6, 0.2, r * 0.95, 'a', 1.2, { cl: true, op: 0.8 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0.6, 0.2, r * 1.5, 0.2), C(-1.2, -1.6, r * 0.3, 'w', { ns: true, op: 0.9 })] },
});
function flEye({ id, name, shape, sclera = 'w', iris = [0.6, 0.2, 3.4], irisRole = 'e', pupil = [1, 0.5, 1.8], glint = [1.9, -1.6, 1.2], lid, tags = [], w = 2 }) {
  const prims = [P(shape, sclera, { sw: 2 })];
  if (iris) prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (lid) prims.push(L(lid, 'k', 1.6));
  return flPart({ id, slot: 'eyes', name, tags, dom: 0.5, w, extra: prims, stages: flEyeStages(iris ? iris[2] : 3) });
}
const FL_OVAL = spline([[0, -5.5], [5, -1.5], [4.6, 4], [0, 5.8], [-4.6, 4], [-5, -1.5]]);
const FL_ROUND = spline([[0, -6], [5.6, -2.2], [5.6, 2.8], [0, 6.2], [-5.6, 2.8], [-5.6, -2.2]]);

export const FL_EYES = [
  flEye({ id: 'seed', name: 'Seed', tags: ['bead'], w: 3, shape: FL_OVAL, iris: [0.4, 0.2, 4], irisRole: 'k', pupil: null, glint: [1.6, -1.6, 1.3] }),
  flEye({ id: 'dew', name: 'Dewdrop', tags: ['round'], w: 3, shape: FL_ROUND, iris: [0.6, 0.4, 4.2], pupil: [1, 0.8, 2.2], glint: [2.2, -2, 1.5] }),
  flEye({ id: 'sleepy', name: 'Drowsy', tags: ['sleepy'], shape: FL_OVAL, iris: [0.6, 1, 3.4], pupil: [1, 1.2, 1.8], glint: [1.8, -0.4, 1], lid: 'M-5,-2 Q0,-3.5 5,-2' }),
  flEye({ id: 'sharp', name: 'Leaf-slit', tags: ['fierce'], shape: spline([[-6, 0, 'c'], [-1, -4], [6, 0, 'c'], [-1, 4]]), iris: [0.4, 0, 3], pupil: [0.8, 0, [1, 2.6]], glint: [1.6, -1.4, 1] }),
  flEye({ id: 'gem', name: 'Gem', tags: ['gem'], shape: FL_ROUND, sclera: 'e', iris: [0.4, 0.2, 4], irisRole: 'el', pupil: [0.8, 0.4, 1.6], glint: [2, -2, 1.4] }),
  flEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: FL_OVAL, sclera: 'e', iris: [0.4, 0, 3.6], irisRole: 'el', pupil: null, glint: [1.6, -1.6, 1.2] }),
  flEye({ id: 'wide', name: 'Wide', tags: ['cute'], shape: spline([[0, -7], [6.4, -2.4], [6, 5], [0, 7.4], [-6, 5], [-6.4, -2.4]]), iris: [0.6, 0.4, 4.8], pupil: [1, 0.8, 2.8], glint: [2.6, -2.4, 1.7] }),
];

export const FL_MOUTHS = [
  flPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2)] }),
  flPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M4,-1 C0,4 -6,5 -12,1 C-6,2 0,1 4,-1 Z', 'k', { ns: true }), P('M1,0 C-2,2 -6,2.6 -10,1 C-6,1.6 -2,1 1,0 Z', 'w', { ns: true })] }),
  flPart({ id: 'pout', slot: 'mouth', name: 'Pout', tags: ['small'], dom: 0.4, w: 2, extra: [E(-3, 0, 2.8, 2, 'k', { ns: true }), C(-3.8, -0.6, 0.8, 'w', { ns: true, op: 0.7 })] }),
  flPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M4,2 C0,-2 -6,-3 -12,0', 'k', 2)] }),
  flPart({ id: 'nectar', slot: 'mouth', name: 'Nectar tongue', tags: ['tongue'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2), P('M-2,1 C2,5 8,6 12,3 C13,1 11,0 9,0 C5,1 1,0 -2,-1 Z', 'a', { sw: 1.2 }), C(10, 2, 0.9, 'w', { ns: true, op: 0.8 })] }),
  flPart({ id: 'maw', slot: 'mouth', name: 'Flytrap maw', tags: ['fierce'], dom: 0.5, w: 2, extra: [P('M5,-2 C2,4 -6,6 -14,2 C-8,0 -2,-1 5,-2 Z', 'k', { ns: true }), P('M3,-1.5 L1,1.5 L-1,-1 L-3,2 L-5,-0.5 L-7,2.4 L-9,0 L-11,1.8 L-11,0.6 C-6,-0.6 -2,-1.4 3,-1.5 Z', 'w', { ns: true })] }),
  flPart({ id: 'whistle', slot: 'mouth', name: 'Whistle', tags: ['round'], dom: 0.45, w: 2, extra: [C(-3, 0, 2.6, 'k', { ns: true }), C(-3, 0, 1.2, 'pd', { ns: true }), L('M1,-2 L3,-3 M1,2 L3,3', 'k', 1, { op: 0.5 })] }),
];
