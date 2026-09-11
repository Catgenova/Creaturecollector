// Ooze cores (the thing suspended in the jelly: a nucleus, a gem, a skull...), eyes (floating in the body)
// and mouths (a line drawn straight into the front).
// Evolutions: cores ring then glow; eyes ring the iris then glow; mouths grow with the face family.
import { ozPart } from './_shared.js';
import { P, C, E, L, spline } from '../_dsl.js';
import { diamondPath, flamePath, starPath } from '../_sigils.js';
import { evoRing, evoGlow } from '../_evo.js';

const ozCoreStages = (r) => ({
  2: { grow: [1.08, 1.08], add: [evoRing(0, 0, r * 1.3, 'a', 1.2, { op: 0.6 })] },
  3: { grow: [1.08, 1.08], add: [C(0, 0, r * 2, 'a', { ns: true, op: 0.16 }), C(-r * 0.35, -r * 0.35, r * 0.25, 'w', { ns: true, op: 0.9 })] },
});

export const OZ_CORES = [
  ozPart({ id: 'nucleus', slot: 'core', name: 'Nucleus', tags: ['orb'], dom: 0.5, w: 3, extra: [C(0, 0, 6.5, 'a', { sw: 1.4 }), C(1.5, 1.5, 2.6, 'ad', { ns: true, op: 0.6 }), C(-2.2, -2.2, 1.6, 'w', { ns: true, op: 0.85 })], stages: ozCoreStages(6.5) }),
  ozPart({ id: 'gem', slot: 'core', name: 'Gem', tags: ['crystal'], dom: 0.5, w: 2, extra: [P(diamondPath(0, 0, 10, 14), 'a', { sw: 1.4 }), L('M-5,0 L5,0 M0,-7 L0,7', 'w', 0.9, { op: 0.4 }), P('M-3,-4 L0,-6.5 L-0.5,-1.5 Z', 'w', { ns: true, op: 0.7 })], stages: ozCoreStages(7) }),
  ozPart({ id: 'skull', slot: 'core', name: 'Skull', tags: ['bone'], dom: 0.5, w: 2, extra: [C(0, -1.5, 6, 'w', { sw: 1.3 }), P('M-4,3 L4,3 L3,7 L-3,7 Z', 'w', { sw: 1.2 }), C(-2.3, -2, 1.7, 'k', { ns: true }), C(2.3, -2, 1.7, 'k', { ns: true }), P('M0,0.4 L-1.1,2.4 L1.1,2.4 Z', 'k', { ns: true, op: 0.8 }), L('M-1.5,4 L-1.5,6.5 M1.5,4 L1.5,6.5', 'k', 0.8, { op: 0.6 })], stages: ozCoreStages(6) }),
  ozPart({ id: 'ember', slot: 'core', name: 'Ember', tags: ['fire'], dom: 0.5, w: 2, extra: [P(flamePath(0, 0, 9), 'a', { sw: 1.3 }), P(flamePath(0, 2, 5), 'w', { ns: true, op: 0.6 }), C(0, 3, 1.2, 'w', { ns: true, op: 0.9 })], stages: ozCoreStages(7) }),
  ozPart({ id: 'bubble', slot: 'core', name: 'Bubble', tags: ['ring'], dom: 0.5, w: 2, extra: [evoRing(0, 0, 7, 'a', 1.8), C(0, 0, 7, 'a', { ns: true, op: 0.16 }), C(-2.6, -2.6, 1.5, 'w', { ns: true, op: 0.85 }), C(2.2, 2.4, 0.9, 'w', { ns: true, op: 0.6 })], stages: ozCoreStages(7) }),
  ozPart({ id: 'star', slot: 'core', name: 'Star', tags: ['star'], dom: 0.5, w: 2, extra: [P(starPath(0, 0, 8.5, 5, 0.48), 'a', { sw: 1.3 }), C(0, 0, 1.8, 'w', { ns: true, op: 0.85 })], stages: ozCoreStages(7) }),
  ozPart({ id: 'cluster', slot: 'core', name: 'Cluster', tags: ['orbs'], dom: 0.5, w: 2, extra: [C(-4, -3, 3.4, 'a', { sw: 1.2 }), C(4.2, -2, 3, 'a', { sw: 1.2 }), C(0, 4.2, 3.6, 'a', { sw: 1.2 }), C(-5.2, -4.2, 1, 'w', { ns: true, op: 0.85 }), C(3.2, -3, 0.9, 'w', { ns: true, op: 0.85 }), C(-1.2, 3, 1, 'w', { ns: true, op: 0.85 })], stages: ozCoreStages(7) }),
];

const ozEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0.6, 0.2, r * 0.95, 'a', 1.2, { cl: true, op: 0.8 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0.6, 0.2, r * 1.5, 0.2), C(-1.2, -1.6, r * 0.3, 'w', { ns: true, op: 0.9 })] },
});
function ozEye({ id, name, shape, sclera = 'w', iris = [0.6, 0.2, 3.4], irisRole = 'e', pupil = [1, 0.5, 1.8], glint = [1.9, -1.6, 1.2], lid, tags = [], w = 2 }) {
  const prims = [P(shape, sclera, { sw: 2 })];
  if (iris) prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: true }));
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (lid) prims.push(L(lid, 'k', 1.6));
  return ozPart({ id, slot: 'eyes', name, tags, dom: 0.5, w, extra: prims, stages: ozEyeStages(iris ? iris[2] : 3) });
}
const OZ_OVAL = spline([[0, -5.5], [5, -1.5], [4.6, 4], [0, 5.8], [-4.6, 4], [-5, -1.5]]);
const OZ_ROUND = spline([[0, -6], [5.6, -2.2], [5.6, 2.8], [0, 6.2], [-5.6, 2.8], [-5.6, -2.2]]);

export const OZ_EYES = [
  ozEye({ id: 'round', name: 'Round', tags: ['round'], w: 3, shape: OZ_ROUND, iris: [0.6, 0.4, 4.2], pupil: [1, 0.8, 2.2], glint: [2.2, -2, 1.5] }),
  ozEye({ id: 'bead', name: 'Bead', tags: ['bead'], w: 2, shape: spline([[0, -4], [3.8, -1.2], [3.6, 2.8], [0, 4.4], [-3.6, 2.8], [-3.8, -1.2]]), iris: [0.3, 0.2, 3], irisRole: 'k', pupil: null, glint: [1.2, -1.2, 1.1] }),
  ozEye({ id: 'wide', name: 'Wide', tags: ['cute'], shape: spline([[0, -7], [6.4, -2.4], [6, 5], [0, 7.4], [-6, 5], [-6.4, -2.4]]), iris: [0.6, 0.4, 4.8], pupil: [1, 0.8, 2.8], glint: [2.6, -2.4, 1.7] }),
  ozEye({ id: 'sleepy', name: 'Drowsy', tags: ['sleepy'], shape: OZ_OVAL, iris: [0.6, 1, 3.4], pupil: [1, 1.2, 1.8], glint: [1.8, -0.4, 1], lid: 'M-5,-2 Q0,-3.5 5,-2' }),
  ozPart({ id: 'cross', slot: 'eyes', name: 'Cross', tags: ['dazed'], dom: 0.45, w: 2, extra: [L('M-3.6,-3.6 L3.6,3.6 M3.6,-3.6 L-3.6,3.6', 'k', 2.2), C(0, 0, 4.6, 'w', { ns: true, op: 0.16 })], stages: { 2: { grow: [1.05, 1.05] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, 5.4, 'a', { ns: true, op: 0.3 })] } } }),
  ozPart({ id: 'void', slot: 'eyes', name: 'Void', tags: ['dark'], dom: 0.5, w: 2, extra: [P(OZ_OVAL, 'k', { sw: 1.6 }), C(1.2, 0.2, 1.5, 'w', { ns: true }), C(-1.4, 2, 0.6, 'w', { ns: true, op: 0.5 })], stages: { 2: { grow: [1.05, 1.05], add: [evoRing(0, 0, 4.6, 'a', 1, { op: 0.7 })] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, 6.5, 'a', { ns: true, op: 0.22 })] } } }),
  ozEye({ id: 'ring', name: 'Ring', tags: ['ring'], shape: OZ_ROUND, iris: [0.6, 0.2, 3.6], pupil: [0.6, 0.2, 1.7], glint: [2, -1.8, 1.1] }),
];

export const OZ_MOUTHS = [
  ozPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2)] }),
  ozPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M4,-1 C0,4 -6,5 -12,1 C-6,2 0,1 4,-1 Z', 'k', { ns: true }), P('M1,0 C-2,2 -6,2.6 -10,1 C-6,1.6 -2,1 1,0 Z', 'w', { ns: true })] }),
  ozPart({ id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.5, w: 2, extra: [E(-3, 1, 4.2, 3.4, 'k', { ns: true }), E(-3, 2.4, 2.4, 1.4, 'a', { ns: true, op: 0.85 }), C(-4.6, -0.6, 0.8, 'w', { ns: true, op: 0.6 })] }),
  ozPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M4,2 C0,-2 -6,-3 -12,0', 'k', 2)] }),
  ozPart({ id: 'wavy', slot: 'mouth', name: 'Wavy', tags: ['queasy'], dom: 0.45, w: 2, extra: [L('M5,0 C3,-2.5 1,2.5 -1,0 C-3,-2.5 -5,2.5 -7,0 C-9,-2.5 -11,1.5 -13,0', 'k', 1.8)] }),
  ozPart({ id: 'fangs', slot: 'mouth', name: 'Fangs', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M5,-1 C1,3 -6,4 -13,1', 'k', 2), P('M1,1 L0,5.5 L-2,1.4 Z', 'w', { ns: true }), P('M-7,2.6 L-8.6,6.4 L-10,2 Z', 'w', { ns: true })] }),
  ozPart({ id: 'tongue', slot: 'mouth', name: 'Tongue', tags: ['tongue'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,3 -6,4 -12,1', 'k', 2), P('M-2,1 C2,5 8,6 12,3 C13,1 11,0 9,0 C5,1 1,0 -2,-1 Z', 'a', { sw: 1.2 }), C(10, 2, 0.9, 'w', { ns: true, op: 0.8 })] }),
];
