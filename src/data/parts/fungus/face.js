// Fungus eyes and mouths, drawn on the stalk under the cap.
// Evolutions: eyes ring the iris then glow; mouths grow with the face family.
import { fgPart } from './_shared.js';
import { P, C, E, L, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

const fgEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0.6, 0.2, r * 0.95, 'a', 1.2, { cl: true, op: 0.8 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0.6, 0.2, r * 1.5, 0.2), C(-1.2, -1.6, r * 0.3, 'w', { ns: true, op: 0.9 })] },
});
function fgEye({ id, name, shape, sclera = 'w', iris = [0.6, 0.2, 3.4], irisRole = 'e', pupil = [1, 0.5, 1.8], glint = [1.9, -1.6, 1.2], lid, extra = [], tags = [], w = 2 }) {
  const prims = [P(shape, sclera, { sw: 2 })];
  if (iris) prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (lid) prims.push(L(lid, 'k', 1.6));
  return fgPart({ id, slot: 'eyes', name, tags, dom: 0.5, w, extra: [...prims, ...extra], stages: fgEyeStages(iris ? iris[2] : 3) });
}
const FG_OVAL = spline([[0, -5.5], [5, -1.5], [4.6, 4], [0, 5.8], [-4.6, 4], [-5, -1.5]]);
const FG_ROUND = spline([[0, -6], [5.6, -2.2], [5.6, 2.8], [0, 6.2], [-5.6, 2.8], [-5.6, -2.2]]);

export const FG_EYES = [
  fgEye({ id: 'round', name: 'Round', tags: ['round'], w: 3, shape: FG_ROUND, iris: [0.6, 0.4, 4.2], pupil: [1, 0.8, 2.2], glint: [2.2, -2, 1.5] }),
  fgEye({ id: 'bead', name: 'Bead', tags: ['bead'], w: 2, shape: spline([[0, -4], [3.8, -1.2], [3.6, 2.8], [0, 4.4], [-3.6, 2.8], [-3.8, -1.2]]), iris: [0.3, 0.2, 3], irisRole: 'k', pupil: null, glint: [1.2, -1.2, 1.1] }),
  fgEye({ id: 'sleepy', name: 'Drowsy', tags: ['sleepy'], shape: FG_OVAL, iris: [0.6, 1, 3.4], pupil: [1, 1.2, 1.8], glint: [1.8, -0.4, 1], lid: 'M-5,-2 Q0,-3.5 5,-2' }),
  fgEye({ id: 'wide', name: 'Wide', tags: ['cute'], shape: spline([[0, -7], [6.4, -2.4], [6, 5], [0, 7.4], [-6, 5], [-6.4, -2.4]]), iris: [0.6, 0.4, 4.8], pupil: [1, 0.8, 2.8], glint: [2.6, -2.4, 1.7] }),
  fgEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: FG_OVAL, sclera: 'e', iris: [0.4, 0, 3.6], irisRole: 'el', pupil: null, glint: [1.6, -1.6, 1.2] }),
  fgEye({ id: 'squint', name: 'Squint', tags: ['sly'], shape: spline([[-6, 0, 'c'], [-1, -3.4], [6, 0, 'c'], [-1, 3.4]]), iris: [0.4, 0, 2.8], pupil: [0.8, 0, [1, 2.2]], glint: [1.6, -1.2, 0.9] }),
  fgEye({ id: 'spore', name: 'Spore-eyed', tags: ['dotted'], shape: FG_ROUND, iris: [0.6, 0.2, 4], pupil: [0.8, 0.4, 1.4], glint: [2, -1.8, 1.1], extra: [C(-2.4, 1.8, 0.7, 'a', { ns: true, op: 0.8 }), C(2.8, 2.4, 0.6, 'a', { ns: true, op: 0.8 }), C(-1.6, -2.6, 0.6, 'a', { ns: true, op: 0.8 })] }),
];

export const FG_MOUTHS = [
  fgPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2)] }),
  fgPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M4,-1 C0,4 -6,5 -12,1 C-6,2 0,1 4,-1 Z', 'k', { ns: true }), P('M1,0 C-2,2 -6,2.6 -10,1 C-6,1.6 -2,1 1,0 Z', 'w', { ns: true })] }),
  fgPart({ id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.5, w: 2, extra: [E(-3, 1, 4.2, 3.4, 'k', { ns: true }), E(-3, 2.4, 2.4, 1.4, 'a', { ns: true, op: 0.85 }), C(-4.6, -0.6, 0.8, 'w', { ns: true, op: 0.6 })] }),
  fgPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M4,2 C0,-2 -6,-3 -12,0', 'k', 2)] }),
  fgPart({ id: 'tooth', slot: 'mouth', name: 'Buck tooth', tags: ['tooth'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2), P('M-2,2 L-2,6.5 L-6,6 L-6,2.6 Z', 'w', { sw: 1 })] }),
  fgPart({ id: 'whistle', slot: 'mouth', name: 'Whistle', tags: ['round'], dom: 0.45, w: 2, extra: [C(-3, 0, 2.6, 'k', { ns: true }), C(-3, 0, 1.2, 'pd', { ns: true }), L('M1,-2 L3,-3 M1,2 L3,3', 'k', 1, { op: 0.5 })] }),
  fgPart({ id: 'wavy', slot: 'mouth', name: 'Wavy', tags: ['queasy'], dom: 0.45, w: 2, extra: [L('M5,0 C3,-2.5 1,2.5 -1,0 C-3,-2.5 -5,2.5 -7,0 C-9,-2.5 -11,1.5 -13,0', 'k', 1.8)] }),
];
