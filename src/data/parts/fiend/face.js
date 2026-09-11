// Fiend eyes (origin = the eye centre), mouths (origin = the front of the face) and horns (origin = the crown of
// the skull, behind the head; they rise from there).
// Evolutions: eyes ring then glow; mouths grow; horns grow.
import { fdPart } from './_shared.js';
import { NONE, P, C, L, tube } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const fdEyeStages = (r) => ({ 2: { grow: [1.06, 1.06], add: [evoRing(0, 0, r * 1.3, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, r * 2, 'a', { ns: true, op: 0.16 })] } });

export const FD_EYES = [
  fdPart({ id: 'ember', slot: 'eyes', name: 'Ember', tags: ['glow'], dom: 0.5, w: 3, extra: [C(0, 0, 4.4, 'a', { ns: true, op: 0.22 }), P('M-3.6,0.4 C-2,-3 2,-3 3.6,0.4 C2,2.4 -2,2.4 -3.6,0.4 Z', 'a', { ns: true }), C(0.4, 0.2, 1.1, 'k', { ns: true }), C(-1.2, -0.8, 0.6, 'w', { ns: true, op: 0.8 })], stages: fdEyeStages(3) }),
  fdPart({ id: 'slit', slot: 'eyes', name: 'Slit', tags: ['sharp'], dom: 0.5, w: 3, extra: [P('M-4,0 C-2,-2.6 2,-2.6 4,0 C2,2.6 -2,2.6 -4,0 Z', 'e', { sw: 1.2 }), P('M0.4,-2.2 C1,-1 1,1 0.4,2.2 C-0.2,1 -0.2,-1 0.4,-2.2 Z', 'k', { ns: true }), C(-1.4, -1, 0.6, 'w', { ns: true, op: 0.85 })], stages: fdEyeStages(3) }),
  fdPart({ id: 'wide', slot: 'eyes', name: 'Wide', tags: ['round'], dom: 0.55, w: 2, extra: [C(0, 0, 4, 'w'), C(0.6, 0.2, 2.6, 'e', { ns: true }), C(1, 0.4, 1.4, 'k', { ns: true }), C(-0.8, -1.4, 0.9, 'w', { ns: true, op: 0.9 })], stages: fdEyeStages(4) }),
  fdPart({ id: 'hollow', slot: 'eyes', name: 'Hollow', tags: ['dark'], dom: 0.45, w: 2, extra: [P('M-4,-1 C-3,-4 3,-4 4,-1 C3,3 -3,3 -4,-1 Z', 'k', { ns: true, op: 0.9 }), C(0.6, 0, 0.9, 'a', { ns: true })], stages: fdEyeStages(3) }),
  fdPart({ id: 'three', slot: 'eyes', name: 'Third eye', tags: ['three'], dom: 0.5, w: 2, extra: [P('M-3.6,0.4 C-2,-2.4 2,-2.4 3.6,0.4 C2,2.4 -2,2.4 -3.6,0.4 Z', 'e', { sw: 1.1 }), C(0.4, 0.4, 1, 'k', { ns: true }), P('M-3,-7 C-1.6,-9.4 1.6,-9.4 3,-7 C1.6,-4.8 -1.6,-4.8 -3,-7 Z', 'a', { ns: true }), C(0.2, -7, 0.8, 'k', { ns: true })], stages: fdEyeStages(3) }),
  fdPart({ id: 'narrow', slot: 'eyes', name: 'Narrow', tags: ['mean'], dom: 0.5, w: 2, extra: [P('M-4,0 C-2,-1.8 2,-1.8 4,0 C2,1.8 -2,1.8 -4,0 Z', 'e', { sw: 1.1 }), C(0.6, 0.1, 1, 'k', { ns: true }), L('M-4,-1 C-2,-2.6 2,-2.6 4,-1', 'k', 1.3, { ns: true })], stages: fdEyeStages(3) }),
  fdPart({ id: 'blank', slot: 'eyes', name: 'Blank', tags: ['white'], dom: 0.5, w: 2, extra: [P('M-3.8,0.4 C-2,-2.6 2,-2.6 3.8,0.4 C2,2.6 -2,2.6 -3.8,0.4 Z', 'w'), C(0, 0, 4.6, 'w', { ns: true, op: 0.16 })], stages: fdEyeStages(3) }),
];

const fdMouthStages = { 2: { grow: [1.06, 1.06] }, 3: { grow: [1.08, 1.08], add: [C(-2, 1, 0.8, 'a', { ns: true, op: 0.8 })] } };

export const FD_MOUTHS = [
  fdPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 3, extra: [P('M3,-1 C0,3 -6,4 -12,1 C-7,0 -2,-1 3,-1 Z', 'k', { ns: true, op: 0.85 }), L('M0,-0.4 L-0.4,2 M-3,0 L-3.4,2.6 M-6,0.2 L-6.4,2.6 M-9,0.4 L-9.2,2.2', 'w', 1.2)], stages: fdMouthStages }),
  fdPart({ id: 'fangs', slot: 'mouth', name: 'Fangs', tags: ['sharp'], dom: 0.5, w: 3, extra: [L('M3,0 L-10,1', 'k', 1.6), P('M1,0 L0,4.4 L-1.4,0.4 Z M-6,0.6 L-6.8,5 L-8,0.8 Z', 'w', { sw: 1 })], stages: fdMouthStages }),
  fdPart({ id: 'tusks', slot: 'mouth', name: 'Tusks', tags: ['tusk'], dom: 0.5, w: 2, extra: [L('M3,0 L-10,1', 'k', 1.8), P('M0,1 C1,-2 2,-5 1,-8 C3,-4 3,-1 1,2 Z', 'w', { sw: 1 }), P('M-7,1.6 C-6,-1 -5,-4 -6,-7 C-4,-3 -4,0 -5,2 Z', 'w', { sw: 1 })], stages: fdMouthStages }),
  fdPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['stern'], dom: 0.5, w: 2, extra: [L('M3,1 C0,-1 -6,-1 -10,1', 'k', 1.8), L('M-10,1 L-11,3', 'k', 1.2, { op: 0.6 })], stages: fdMouthStages }),
  fdPart({ id: 'maw', slot: 'mouth', name: 'Maw', tags: ['open'], dom: 0.55, w: 2, extra: [P('M4,-3 C2,4 -6,7 -13,3 C-8,-1 -2,-3 4,-3 Z', 'k', { ns: true, op: 0.9 }), P('M2,-2 L1,1 L0,-2 Z M-3,-2 L-4,1.4 L-5,-1.6 Z M-8,-1 L-9,2 L-10,-0.6 Z', 'w', { ns: true }), P('M-10,3 C-6,5 -1,4 2,1 C-2,4 -6,4 -10,3 Z', 'a', { ns: true, op: 0.6 })], stages: fdMouthStages }),
  fdPart({ id: 'smirk', slot: 'mouth', name: 'Smirk', tags: ['sly'], dom: 0.5, w: 2, extra: [L('M3,-2 C1,1 -4,2 -10,0', 'k', 1.6), P('M1,-1 L0.4,2 L-0.8,-0.6 Z', 'w', { sw: 1 })], stages: fdMouthStages }),
  fdPart({ id: 'needle', slot: 'mouth', name: 'Needle teeth', tags: ['thin'], dom: 0.5, w: 2, extra: [L('M3,0 L-11,1', 'k', 1.6), P('M2,0 L1.6,4 L0.8,0.2 Z M-1,0.2 L-1.4,4.6 L-2.4,0.4 Z M-4,0.4 L-4.6,4.4 L-5.4,0.6 Z M-7,0.6 L-7.6,4 L-8.4,0.8 Z', 'w', { ns: true })], stages: fdMouthStages }),
];

const fdGrowHorns = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };

export const FD_HORNS = [
  NONE('horns', 0.3, 'e.'),
  fdPart({ id: 'curled', slot: 'horns', name: 'Curled', tags: ['ram'], dom: 0.5, w: 3, shapes: [tube([[-6, 2], [-10, -6], [-14, -14], [-10, -20], [-4, -18]], 6, 1.6, { tipK: 'c' }), tube([[6, 2], [10, -6], [14, -14], [10, -20], [4, -18]], 6, 1.6, { tipK: 'c' })], extra: [L('M-9,-5 L-12,-9 M9,-5 L12,-9', 'k', 0.9, { op: 0.3 })], stages: fdGrowHorns }),
  fdPart({ id: 'straight', slot: 'horns', name: 'Straight', tags: ['horn'], dom: 0.5, w: 3, shapes: [[[-8, 2], [-12, -22, 'c'], [-3, 1]], [[3, 1], [8, -24, 'c'], [8, 2]]], extra: [L('M-8,-4 L-10,-10 M6,-4 L7,-10', 'k', 0.9, { op: 0.3 })], stages: fdGrowHorns }),
  fdPart({ id: 'ram', slot: 'horns', name: 'Ram', tags: ['spiral'], dom: 0.5, w: 2, extra: [L(spiralPath(-9, -6, 9, 1.6, 180), 'p', 5), L(spiralPath(9, -6, 9, 1.6, 0), 'p', 5), L(spiralPath(-9, -6, 9, 1.6, 180), 'k', 1, { op: 0.25 }), L(spiralPath(9, -6, 9, 1.6, 0), 'k', 1, { op: 0.25 })], stages: fdGrowHorns }),
  fdPart({ id: 'crown', slot: 'horns', name: 'Crown of horns', tags: ['many'], dom: 0.5, w: 2, shapes: [[[-12, 2], [-16, -10, 'c'], [-8, 0]], [[-7, 0], [-8, -16, 'c'], [-2, -1]], [[-1, -1], [2, -20, 'c'], [5, -1]], [[6, -1], [12, -14, 'c'], [11, 1]]], extra: [L('M-14,-6 L-12,-2 M0,-14 L1,-6', 'k', 0.9, { op: 0.25 })], stages: fdGrowHorns }),
  fdPart({ id: 'twin', slot: 'horns', name: 'Twin nubs', tags: ['small'], dom: 0.5, w: 2, shapes: [[[-9, 2], [-10, -8, 'c'], [-4, 1]], [[4, 1], [10, -9, 'c'], [9, 2]]], extra: [C(-9, -6, 0.9, 'w', { ns: true, op: 0.6 }), C(9, -7, 0.9, 'w', { ns: true, op: 0.6 })], stages: fdGrowHorns }),
  fdPart({ id: 'antler', slot: 'horns', name: 'Antlers', tags: ['branch'], dom: 0.5, w: 2, extra: [L('M-4,0 L-9,-12 M-9,-12 L-16,-16 M-9,-12 L-8,-22 M-6,-6 L-12,-8 M4,0 L9,-12 M9,-12 L16,-16 M9,-12 L8,-22 M6,-6 L12,-8', 'p', 3.2), L('M-4,0 L-9,-12 M4,0 L9,-12', 'k', 0.9, { op: 0.25 })], stages: fdGrowHorns }),
  fdPart({ id: 'stub', slot: 'horns', name: 'Stubs', tags: ['short'], dom: 0.5, w: 2, shapes: [[[-8, 2], [-10, -6, 0.5], [-6, -7, 0.5], [-3, 1]], [[3, 1], [6, -7, 0.5], [10, -6, 0.5], [8, 2]]], extra: [L('M-8,-2 L-6,-5 M8,-2 L6,-5', 'k', 0.9, { op: 0.3 })], stages: fdGrowHorns }),
];
