// Skeletal grave lights (what burns in the eye sockets) and jaws (the lower jaw under the snout).
// Evolutions: lights ring then glow; jaws grow with the face family.
import { skPart } from './_shared.js';
import { P, C, E, L } from '../_dsl.js';
import { flamePath, starPath, diamondPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const skEyeStages = (r) => ({ 2: { grow: [1.08, 1.08], add: [evoRing(0, 0, r * 1.4, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.1, 1.1], add: [C(0, 0, r * 2.2, 'a', { ns: true, op: 0.18 })] } });
const skGlow = (r) => C(0, 0, r * 1.7, 'a', { ns: true, op: 0.2 });

export const SK_EYES = [
  skPart({ id: 'ember', slot: 'eyes', name: 'Ember', tags: ['dot'], dom: 0.5, w: 3, extra: [skGlow(2.4), C(0, 0, 2.4, 'a', { ns: true }), C(-0.6, -0.6, 0.9, 'w', { ns: true, op: 0.8 })], stages: skEyeStages(2.4) }),
  skPart({ id: 'ghostlight', slot: 'eyes', name: 'Ghost light', tags: ['flame'], dom: 0.5, w: 2, extra: [skGlow(3), P(flamePath(0, 0, 4.2), 'a', { ns: true }), P(flamePath(0, 0.8, 2.2), 'w', { ns: true, op: 0.7 })], stages: skEyeStages(3) }),
  skPart({ id: 'hollow', slot: 'eyes', name: 'Hollow', tags: ['dark'], dom: 0.45, w: 2, extra: [E(0, 0, 3.2, 2.8, 'k', { ns: true, op: 0.9 }), C(0.6, 0.2, 0.7, 'a', { ns: true, op: 0.8 })], stages: skEyeStages(2) }),
  skPart({ id: 'pinprick', slot: 'eyes', name: 'Pinprick', tags: ['tiny'], dom: 0.5, w: 2, extra: [skGlow(1.6), C(0, 0, 1.3, 'w', { ns: true }), C(0, 0, 0.6, 'a', { ns: true })], stages: skEyeStages(1.6) }),
  skPart({ id: 'twin', slot: 'eyes', name: 'Twin sparks', tags: ['two'], dom: 0.5, w: 2, extra: [skGlow(2.6), C(-1.4, 0.4, 1.4, 'a', { ns: true }), C(1.6, -0.6, 1.1, 'a', { ns: true }), C(-1.8, 0, 0.5, 'w', { ns: true, op: 0.8 })], stages: skEyeStages(2.6) }),
  skPart({ id: 'blaze', slot: 'eyes', name: 'Blaze', tags: ['flame', 'big'], dom: 0.55, w: 2, extra: [skGlow(3.6), P(flamePath(0, -1, 5.5), 'a', { ns: true }), P(flamePath(0.4, 0.6, 3), 'w', { ns: true, op: 0.6 })], stages: skEyeStages(3.6) }),
  skPart({ id: 'gem', slot: 'eyes', name: 'Set gem', tags: ['gem'], dom: 0.5, w: 2, extra: [skGlow(2.6), P(diamondPath(0, 0, 4.4, 5.6), 'a', { ns: true }), P('M-1.2,-1.6 L0.2,-2.6 L0,-0.4 Z', 'w', { ns: true, op: 0.8 })], stages: skEyeStages(2.6) }),
];

export const SK_JAWS = [
  skPart({ id: 'fangs', slot: 'jaw', name: 'Fangs', tags: ['teeth'], dom: 0.5, w: 3, extra: [P('M4,-1 C1,3 -6,4 -14,2 C-9,0 -3,-1 4,-1 Z', 'k', { ns: true, op: 0.8 }), P('M2,0 L1,3.4 L-1,0.4 L-3,3.6 L-5,0.8 L-7,3.2 L-9,1 L-11,2.8 L-12,1.4 C-8,0.4 -3,-0.2 2,0 Z', 'p', { ns: true })] }),
  skPart({ id: 'tusked', slot: 'jaw', name: 'Tusked', tags: ['tusk'], dom: 0.5, w: 2, extra: [L('M4,-1 C0,2 -6,3 -13,1', 'k', 2), P('M2,1 C3,-3 4,-6 3,-9 C5,-5 5,-1 3,2 Z', 'p', { sw: 1 }), P('M-8,2.4 C-7,-1 -6,-4 -7,-7 C-5,-3 -5,0 -6,3 Z', 'p', { sw: 1 })] }),
  skPart({ id: 'beak', slot: 'jaw', name: 'Beak', tags: ['bird'], dom: 0.5, w: 2, extra: [P('M6,-2 C2,3 -6,4 -12,1 C-6,3 0,4 5,3 Z', 'pd', { sw: 1.2 }), L('M5,-1 C1,3 -6,4 -12,1', 'k', 1.4)] }),
  skPart({ id: 'needle', slot: 'jaw', name: 'Needle teeth', tags: ['sharp'], dom: 0.5, w: 2, extra: [L('M5,-1 C1,3 -6,4 -13,1', 'k', 2), P('M3,0 L2.4,5 L1.2,0.6 Z', 'p', { ns: true }), P('M-1,1.4 L-1.4,6 L-2.8,1.6 Z', 'p', { ns: true }), P('M-5,2.4 L-5.6,6.8 L-6.8,2.4 Z', 'p', { ns: true }), P('M-9,2.4 L-9.8,6 L-10.8,2.2 Z', 'p', { ns: true })] }),
  skPart({ id: 'grin', slot: 'jaw', name: 'Wide grin', tags: ['happy'], dom: 0.5, w: 2, extra: [P('M6,-2 C2,4 -6,6 -15,2 C-8,0 -1,-1 6,-2 Z', 'k', { ns: true, op: 0.85 }), L('M3,-1 L2,2.6 M-1,-0.4 L-1.6,3.4 M-5,0 L-5.6,3.8 M-9,0.6 L-9.6,3.6 M-12,1.4 L-12.6,3.2', 'p', 1.4)] }),
  skPart({ id: 'slack', slot: 'jaw', name: 'Slack jaw', tags: ['open'], dom: 0.5, w: 2, extra: [P('M5,-2 C4,4 -4,8 -12,5 C-8,2 -2,-1 5,-2 Z', 'k', { ns: true, op: 0.85 }), P('M-11,5 C-6,6 0,6 4,4 L5,7 C0,9 -6,9 -12,7 Z', 'p', { sw: 1.2 }), L('M-8,6 L-8,8 M-4,6.5 L-4,8.5 M0,6 L0,8', 'k', 1, { op: 0.6 })] }),
  skPart({ id: 'split', slot: 'jaw', name: 'Split jaw', tags: ['fierce'], dom: 0.5, w: 2, extra: [P('M5,-2 C1,3 -5,4 -13,2 C-8,0 -2,-1 5,-2 Z', 'k', { ns: true, op: 0.8 }), P('M-3,1 L-4,7 L-1,2 Z', 'p', { ns: true }), P('M-5,1.6 L-7,7 L-6,1.8 Z', 'p', { ns: true }), L('M-4,1 L-4,7', 'k', 0.8, { op: 0.6 })] }),
];
