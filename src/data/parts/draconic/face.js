// Draconic eyes, jaws (the mouth under the snout, drawn back toward the cheek) and breath (a small effect at
// the snout tip, drawn in front of the head).
// Evolutions: eyes ring the iris then glow; jaws and breath grow with the face family.
import { drPart } from './_shared.js';
import { NONE, P, C, E, L, spline, puff } from '../_dsl.js';
import { flamePath, diamondPath, boltPath, sparklePath } from '../_sigils.js';
import { evoRing, evoGlow } from '../_evo.js';

const drEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0.6, 0.2, r * 0.95, 'a', 1.2, { cl: true, op: 0.8 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0.6, 0.2, r * 1.5, 0.2), C(-1.2, -1.6, r * 0.3, 'w', { ns: true, op: 0.9 })] },
});
function drEye({ id, name, shape, sclera = 'w', iris = [0.6, 0.2, 3.4], irisRole = 'e', pupil = [1, 0.5, 1.8], glint = [1.9, -1.6, 1.2], lid, tags = [], w = 2 }) {
  const prims = [P(shape, sclera, { sw: 2 })];
  if (iris) prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (lid) prims.push(L(lid, 'k', 1.6));
  return drPart({ id, slot: 'eyes', name, tags, dom: 0.5, w, extra: prims, stages: drEyeStages(iris ? iris[2] : 3) });
}
const DR_OVAL = spline([[0, -5.5], [5, -1.5], [4.6, 4], [0, 5.8], [-4.6, 4], [-5, -1.5]]);
const DR_ROUND = spline([[0, -6], [5.6, -2.2], [5.6, 2.8], [0, 6.2], [-5.6, 2.8], [-5.6, -2.2]]);
const DR_SLIT = spline([[-6, 0, 'c'], [-1, -3.8], [6, 0, 'c'], [-1, 3.8]]);

export const DR_EYES = [
  drEye({ id: 'slit', name: 'Slit', tags: ['reptile'], w: 3, shape: DR_SLIT, iris: [0.4, 0, 3.2], pupil: [0.8, 0, [0.9, 2.8]], glint: [1.6, -1.4, 1] }),
  drEye({ id: 'round', name: 'Round', tags: ['round'], w: 2, shape: DR_ROUND, iris: [0.6, 0.4, 4.2], pupil: [1, 0.8, 2.2], glint: [2.2, -2, 1.5] }),
  drEye({ id: 'fierce', name: 'Fierce', tags: ['angry'], shape: spline([[-6, -1, 'c'], [0, -4.5], [6, -2.5, 'c'], [2, 4], [-4, 3.5]]), iris: [0.6, 0, 3.2], pupil: [1, 0.2, 1.6], glint: [2, -1.8, 1], lid: 'M-6,-2 L5,-4.5' }),
  drEye({ id: 'sleepy', name: 'Drowsy', tags: ['sleepy'], shape: DR_OVAL, iris: [0.6, 1, 3.4], pupil: [1, 1.2, 1.8], glint: [1.8, -0.4, 1], lid: 'M-5,-2 Q0,-3.5 5,-2' }),
  drEye({ id: 'gem', name: 'Gem', tags: ['gem'], shape: DR_ROUND, sclera: 'e', iris: [0.4, 0.2, 4], irisRole: 'el', pupil: [0.8, 0.4, 1.6], glint: [2, -2, 1.4] }),
  drEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: DR_OVAL, sclera: 'e', iris: [0.4, 0, 3.6], irisRole: 'el', pupil: null, glint: [1.6, -1.6, 1.2] }),
  drEye({ id: 'narrow', name: 'Narrow', tags: ['sly'], shape: spline([[-6.5, 0, 'c'], [-1, -2.6], [6.5, 0, 'c'], [-1, 2.6]]), iris: [0.4, 0, 2.4], pupil: [0.8, 0, [0.8, 2]], glint: [1.6, -1, 0.8] }),
];

export const DR_JAWS = [
  drPart({ id: 'grin', slot: 'jaw', name: 'Grin', tags: ['happy'], dom: 0.5, w: 3, extra: [P('M4,-1 C0,4 -6,5 -12,1 C-6,2 0,1 4,-1 Z', 'k', { ns: true }), P('M1,0 C-2,2 -6,2.6 -10,1 C-6,1.6 -2,1 1,0 Z', 'w', { ns: true })] }),
  drPart({ id: 'fangs', slot: 'jaw', name: 'Fangs', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M5,-1 C1,3 -6,4 -13,1', 'k', 2), P('M1,1 L0,5.5 L-2,1.4 Z', 'w', { ns: true }), P('M-7,2.6 L-8.6,6.4 L-10,2 Z', 'w', { ns: true })] }),
  drPart({ id: 'roar', slot: 'jaw', name: 'Roar', tags: ['open'], dom: 0.5, w: 2, extra: [P('M6,-2 C3,6 -6,9 -14,3 C-9,0 -2,-1 6,-2 Z', 'k', { ns: true }), P('M4,-1 L2,2.5 L0,-0.4 L-2,3 L-4,0.2 L-6,3.4 L-8,1 L-11,2.6 L-11,1.4 C-6,-0.4 -2,-1 4,-1 Z', 'w', { ns: true }), E(-4, 4, 3.4, 1.6, 'a', { ns: true, op: 0.8 })] }),
  drPart({ id: 'underbite', slot: 'jaw', name: 'Underbite', tags: ['tough'], dom: 0.5, w: 2, extra: [L('M5,0 C1,2 -6,3 -13,1', 'k', 2), P('M2,0 L2,-3.6 L0,0 Z', 'w', { ns: true }), P('M-5,1.6 L-5,-2 L-7,1.4 Z', 'w', { ns: true }), P('M-10,1.6 L-10.4,-1.4 L-12,1.2 Z', 'w', { ns: true })] }),
  drPart({ id: 'beak', slot: 'jaw', name: 'Beak', tags: ['sharp'], dom: 0.5, w: 2, extra: [P('M6,-2 C2,3 -6,4 -12,1 C-6,3 0,4 5,3 Z', 'pd', { sw: 1.4 }), L('M5,-1 C1,3 -6,4 -12,1', 'k', 1.4)] }),
  drPart({ id: 'tusks', slot: 'jaw', name: 'Tusks', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M5,-1 C1,3 -6,4 -13,1', 'k', 2), P('M3,1 C4,-3 5,-6 4,-9 C6,-5 6,-1 4,2 Z', 'w', { sw: 1 }), P('M-8,2.6 C-7,-1 -6,-4 -7,-7 C-5,-3 -5,0 -6,3 Z', 'w', { sw: 1 })] }),
  drPart({ id: 'smile', slot: 'jaw', name: 'Smile', tags: ['happy'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2)] }),
];

const drBreathStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.15, 1.15] } };
export const DR_BREATH = [
  NONE('breath', 0.3, 'd.'),
  drPart({ id: 'flame', slot: 'breath', name: 'Flame', tags: ['fire'], dom: 0.5, w: 3, extra: [P(flamePath(9, -2, 11, 90), 'a', { sw: 1.2 }), P(flamePath(8, -2, 6, 90), 'w', { ns: true, op: 0.6 })], stages: drBreathStages }),
  drPart({ id: 'frost', slot: 'breath', name: 'Frost', tags: ['ice'], dom: 0.5, w: 2, extra: [P(diamondPath(7, -2, 5, 9), 'a', { sw: 1 }), P(diamondPath(14, -5, 4, 7), 'a', { sw: 1 }), P(diamondPath(13, 3, 3.5, 6), 'a', { sw: 1 }), P(sparklePath(19, -1, 2.4), 'w', { ns: true, op: 0.8 })], stages: drBreathStages }),
  drPart({ id: 'sparks', slot: 'breath', name: 'Sparks', tags: ['electric'], dom: 0.5, w: 2, extra: [P(boltPath(9, -3, 5, 90), 'a', { sw: 1 }), C(15, 2, 1.6, 'a', { ns: true }), C(18, -4, 1.3, 'a', { ns: true }), C(12, 5, 1.1, 'a', { ns: true, op: 0.8 })], stages: drBreathStages }),
  drPart({ id: 'smoke', slot: 'breath', name: 'Smoke', tags: ['dark'], dom: 0.45, w: 2, extra: [P(`${puff(8, -3, 5, 7, 1.4).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`, 'k', { ns: true, op: 0.3 }), P(`${puff(15, -7, 4, 6, 1.2).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`, 'k', { ns: true, op: 0.25 }), C(20, -11, 2, 'k', { ns: true, op: 0.2 })], stages: drBreathStages }),
  drPart({ id: 'bubbles', slot: 'breath', name: 'Bubbles', tags: ['water'], dom: 0.5, w: 2, extra: [C(7, -2, 2.6, 'a', { sw: 1 }), C(13, -5, 2, 'a', { sw: 1 }), C(17, 0, 1.6, 'a', { sw: 1 }), C(6.2, -2.8, 0.8, 'w', { ns: true, op: 0.8 }), C(12.4, -5.6, 0.7, 'w', { ns: true, op: 0.8 })], stages: drBreathStages }),
  drPart({ id: 'lightning', slot: 'breath', name: 'Lightning', tags: ['storm'], dom: 0.5, w: 2, extra: [L('M2,-1 L8,-4 L7,0 L14,-3 L12,2 L20,-1', 'a', 2.2), L('M2,-1 L8,-4 L7,0 L14,-3 L12,2 L20,-1', 'w', 0.8, { op: 0.6 })], stages: drBreathStages }),
  drPart({ id: 'void', slot: 'breath', name: 'Void', tags: ['dark'], dom: 0.5, w: 2, extra: [C(10, -2, 5, 'k', { ns: true, op: 0.85 }), evoRing(10, -2, 6.5, 'a', 1.4), C(8.4, -3.6, 1, 'a', { ns: true, op: 0.8 })], stages: drBreathStages }),
];
