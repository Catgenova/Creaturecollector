// Crystalline eyes (origin = the eye centre; set gems, lights and sockets) and mouths (origin = the front of the
// face on the head's mouth socket).
// Evolutions: eyes ring then glow; mouths grow.
import { crPart } from './_shared.js';
import { P, C, E, L } from '../_dsl.js';
import { diamondPath, starPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const crEyeStages = (r) => ({ 2: { grow: [1.06, 1.06], add: [evoRing(0, 0, r * 1.3, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, r * 2, 'a', { ns: true, op: 0.16 })] } });

export const CR_EYES = [
  crPart({ id: 'gem', slot: 'eyes', name: 'Set gem', tags: ['gem'], dom: 0.55, w: 3, extra: [P(diamondPath(0, 0, 5, 6.4), 'e', { sw: 1.2 }), P('M-1.6,-2 L0.2,-3.2 L0,-0.4 Z', 'w', { ns: true, op: 0.85 }), L('M-2.5,0 L2.5,0', 'k', 0.8, { op: 0.3 })], stages: crEyeStages(3) }),
  crPart({ id: 'glow', slot: 'eyes', name: 'Glow', tags: ['light'], dom: 0.5, w: 3, extra: [C(0, 0, 5, 'a', { ns: true, op: 0.22 }), C(0, 0, 3, 'a', { ns: true }), C(-0.8, -0.8, 1, 'w', { ns: true, op: 0.85 })], stages: crEyeStages(3) }),
  crPart({ id: 'slit', slot: 'eyes', name: 'Slit', tags: ['sharp'], dom: 0.5, w: 2, extra: [P('M-4,-1 L0,-4 L4,-1 L0,4 Z', 'e', { sw: 1.2 }), P('M0,-3 L0.8,0 L0,3 L-0.8,0 Z', 'k', { ns: true }), C(-1.4, -1.6, 0.7, 'w', { ns: true, op: 0.85 })], stages: crEyeStages(3) }),
  crPart({ id: 'dot', slot: 'eyes', name: 'Dot', tags: ['small'], dom: 0.5, w: 2, extra: [C(0, 0, 2.6, 'k'), C(-0.7, -0.8, 0.9, 'w', { ns: true, op: 0.9 })], stages: crEyeStages(2.4) }),
  crPart({ id: 'twin', slot: 'eyes', name: 'Twin lights', tags: ['two'], dom: 0.5, w: 2, extra: [C(-1.6, 0.6, 2.4, 'a', { ns: true, op: 0.3 }), C(-1.6, 0.6, 1.6, 'a', { ns: true }), C(1.8, -0.8, 1.2, 'a', { ns: true }), C(-2, 0.2, 0.5, 'w', { ns: true, op: 0.85 })], stages: crEyeStages(2.4) }),
  crPart({ id: 'hollow', slot: 'eyes', name: 'Hollow', tags: ['dark'], dom: 0.45, w: 2, extra: [P('M-4,-3 L0,-4 L4,-2 L3,3 L-3,3 Z', 'k', { ns: true, op: 0.9 }), C(0.6, 0.2, 0.9, 'a', { ns: true })], stages: crEyeStages(3) }),
  crPart({ id: 'star', slot: 'eyes', name: 'Star', tags: ['star'], dom: 0.5, w: 2, extra: [C(0, 0, 4.4, 'a', { ns: true, op: 0.2 }), P(starPath(0, 0, 4, 1.8, 4), 'a', { ns: true }), C(0, 0, 1.2, 'w', { ns: true, op: 0.9 })], stages: crEyeStages(3) }),
];

const crMouthStages = { 2: { grow: [1.06, 1.06] }, 3: { grow: [1.08, 1.08], add: [C(-2, 1, 0.8, 'a', { ns: true, op: 0.8 })] } };

export const CR_MOUTHS = [
  crPart({ id: 'crack', slot: 'mouth', name: 'Crack', tags: ['line'], dom: 0.5, w: 3, extra: [L('M3,0 L-2,2 L-6,1 L-11,3', 'k', 1.6), L('M-2,2 L-3,4', 'k', 1, { op: 0.6 })], stages: crMouthStages }),
  crPart({ id: 'grin', slot: 'mouth', name: 'Jagged grin', tags: ['teeth'], dom: 0.5, w: 3, extra: [P('M4,-1 L-12,1 L-10,5 L4,4 Z', 'k', { ns: true, op: 0.85 }), P('M2,0 L1,3 L-1,0 L-3,3.4 L-5,0.4 L-7,3.6 L-9,0.8 L-10,3 L-11,1 Z', 'w', { ns: true, op: 0.9 })], stages: crMouthStages }),
  crPart({ id: 'flat', slot: 'mouth', name: 'Flat', tags: ['plain'], dom: 0.5, w: 2, extra: [L('M3,1 L-10,1', 'k', 1.8), L('M-2,1 L-2,3 M-7,1 L-7,3', 'k', 1, { op: 0.5 })], stages: crMouthStages }),
  crPart({ id: 'point', slot: 'mouth', name: 'Point', tags: ['beak'], dom: 0.5, w: 2, extra: [P('M-6,-3 L6,0 L-6,3 Z', 'pd', { sw: 1.2 }), L('M-5,0 L4,0', 'k', 1, { op: 0.5 })], stages: crMouthStages }),
  crPart({ id: 'wide', slot: 'mouth', name: 'Wide', tags: ['open'], dom: 0.5, w: 2, extra: [P('M4,-2 L-14,0 L-12,6 L2,5 Z', 'k', { ns: true, op: 0.85 }), P('M-12,1 L2,0 L2,2 L-12,3 Z', 'a', { ns: true, op: 0.5 })], stages: crMouthStages }),
  crPart({ id: 'small', slot: 'mouth', name: 'Small', tags: ['tiny'], dom: 0.5, w: 2, extra: [P('M-2,-1 L2,-1 L1,2 L-1,2 Z', 'k', { ns: true, op: 0.85 })], stages: crMouthStages }),
  crPart({ id: 'fanged', slot: 'mouth', name: 'Fanged', tags: ['fierce'], dom: 0.5, w: 2, extra: [L('M3,0 L-11,2', 'k', 1.6), P('M1,0 L0,5 L-1.5,0.4 Z M-6,1 L-6.8,6 L-8,1.4 Z', 'w', { sw: 1 })], stages: crMouthStages }),
];
