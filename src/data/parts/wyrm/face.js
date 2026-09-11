// Wyrm eyes and maws (the mouth at the snout, drawn back toward the cheek).
// Evolutions: eyes ring the iris then glow; maws grow with the face family.
import { wyPart } from './_shared.js';
import { P, C, E, L, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

const wyEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0.6, 0.2, r * 0.95, 'a', 1.2, { cl: true, op: 0.8 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0.6, 0.2, r * 1.5, 0.2), C(-1.2, -1.6, r * 0.3, 'w', { ns: true, op: 0.9 })] },
});
function wyEye({ id, name, shape, sclera = 'w', iris = [0.6, 0.2, 3.4], irisRole = 'e', pupil = [1, 0.5, 1.8], glint = [1.9, -1.6, 1.2], lid, tags = [], w = 2 }) {
  const prims = [P(shape, sclera, { sw: 2 })];
  if (iris) prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (lid) prims.push(L(lid, 'k', 1.6));
  return wyPart({ id, slot: 'eyes', name, tags, dom: 0.5, w, extra: prims, stages: wyEyeStages(iris ? iris[2] : 3) });
}
const WY_OVAL = spline([[0, -5.5], [5, -1.5], [4.6, 4], [0, 5.8], [-4.6, 4], [-5, -1.5]]);
const WY_ROUND = spline([[0, -6], [5.6, -2.2], [5.6, 2.8], [0, 6.2], [-5.6, 2.8], [-5.6, -2.2]]);
const WY_SLIT = spline([[-6, 0, 'c'], [-1, -3.6], [6, 0, 'c'], [-1, 3.6]]);

export const WY_EYES = [
  wyEye({ id: 'slit', name: 'Slit', tags: ['reptile'], w: 3, shape: WY_SLIT, iris: [0.4, 0, 3], pupil: [0.8, 0, [0.9, 2.6]], glint: [1.6, -1.4, 1] }),
  wyEye({ id: 'round', name: 'Round', tags: ['round'], w: 3, shape: WY_ROUND, iris: [0.6, 0.4, 4.2], pupil: [1, 0.8, 2.2], glint: [2.2, -2, 1.5] }),
  wyEye({ id: 'fierce', name: 'Fierce', tags: ['angry'], shape: spline([[-6, -1, 'c'], [0, -4.5], [6, -2.5, 'c'], [2, 4], [-4, 3.5]]), iris: [0.6, 0, 3.2], pupil: [1, 0.2, 1.6], glint: [2, -1.8, 1], lid: 'M-6,-2 L5,-4.5' }),
  wyEye({ id: 'sleepy', name: 'Drowsy', tags: ['sleepy'], shape: WY_OVAL, iris: [0.6, 1, 3.4], pupil: [1, 1.2, 1.8], glint: [1.8, -0.4, 1], lid: 'M-5,-2 Q0,-3.5 5,-2' }),
  wyEye({ id: 'gem', name: 'Gem', tags: ['gem'], shape: WY_ROUND, sclera: 'e', iris: [0.4, 0.2, 4], irisRole: 'el', pupil: [0.8, 0.4, 1.6], glint: [2, -2, 1.4] }),
  wyEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: WY_OVAL, sclera: 'e', iris: [0.4, 0, 3.6], irisRole: 'el', pupil: null, glint: [1.6, -1.6, 1.2] }),
  wyEye({ id: 'bead', name: 'Bead', tags: ['bead'], shape: spline([[0, -4], [3.8, -1.2], [3.6, 2.8], [0, 4.4], [-3.6, 2.8], [-3.8, -1.2]]), iris: [0.3, 0.2, 3], irisRole: 'k', pupil: null, glint: [1.2, -1.2, 1.1] }),
];

export const WY_MAWS = [
  wyPart({ id: 'grin', slot: 'maw', name: 'Grin', tags: ['happy'], dom: 0.5, w: 3, extra: [P('M4,-1 C0,4 -6,5 -12,1 C-6,2 0,1 4,-1 Z', 'k', { ns: true }), P('M1,0 C-2,2 -6,2.6 -10,1 C-6,1.6 -2,1 1,0 Z', 'w', { ns: true })] }),
  wyPart({ id: 'fangs', slot: 'maw', name: 'Fangs', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M5,-1 C1,3 -6,4 -13,1', 'k', 2), P('M1,1 L0,5.5 L-2,1.4 Z', 'w', { ns: true }), P('M-7,2.6 L-8.6,6.4 L-10,2 Z', 'w', { ns: true })] }),
  wyPart({ id: 'roar', slot: 'maw', name: 'Roar', tags: ['open'], dom: 0.5, w: 2, extra: [P('M5,-2 C2,5 -6,7 -13,2 C-8,0 -2,-1 5,-2 Z', 'k', { ns: true }), P('M3,-1 L1,2 L-1,-0.6 L-3,2.6 L-5,0 L-7,2.8 L-9,0.6 L-11,2 L-11,1 C-6,-0.4 -2,-1 3,-1 Z', 'w', { ns: true }), E(-4, 3, 3, 1.4, 'a', { ns: true, op: 0.8 })] }),
  wyPart({ id: 'smile', slot: 'maw', name: 'Smile', tags: ['happy'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2)] }),
  wyPart({ id: 'snarl', slot: 'maw', name: 'Snarl', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M5,0 C2,-2 -2,3 -6,1 C-9,-1 -11,2 -13,1', 'k', 2), P('M-1,1 L-2,4.6 L-4,1.2 Z', 'w', { ns: true }), L('M3,-3 L6,-4', 'k', 1.4, { op: 0.6 })] }),
  wyPart({ id: 'beard', slot: 'maw', name: 'Bearded', tags: ['wise'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2), L('M-2,3 C-1,8 -3,12 -2,16 M-6,3 C-6,7 -8,10 -7,14', 'a', 2.2), L('M2,2 C4,5 3,8 4,11', 'a', 1.8)] }),
  wyPart({ id: 'tongue', slot: 'maw', name: 'Forked tongue', tags: ['tongue'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2), L('M4,0 C8,0 11,1 14,2 M14,2 L17,0 M14,2 L17,4', 'a', 1.6)] }),
];
