// Myriapod eyes (origin = the eye centre), mandibles (origin = the front of the head, reaching forward), antennae
// (origin = the top of the head, sweeping up and forward) and venom (origin = under the mandibles).
// Evolutions: eyes ring then glow; mandibles, antennae and venom grow.
import { myPart } from './_shared.js';
import { NONE, P, C, L } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const myEyeStages = (r) => ({ 2: { grow: [1.06, 1.06], add: [evoRing(0, 0, r * 1.3, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, r * 2, 'a', { ns: true, op: 0.16 })] } });

export const MY_EYES = [
  myPart({ id: 'bead', slot: 'eyes', name: 'Bead', tags: ['dark'], dom: 0.5, w: 3, extra: [C(0, 0, 2.6, 'k'), C(-0.7, -0.8, 0.9, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(2.6) }),
  myPart({ id: 'cluster', slot: 'eyes', name: 'Ocelli', tags: ['many'], dom: 0.5, w: 2, extra: [C(-1.6, 0.8, 1.6, 'k'), C(1.4, -1, 1.4, 'k'), C(1.8, 1.8, 1, 'k'), C(-2, 0.2, 0.5, 'w', { ns: true, op: 0.9 }), C(1, -1.4, 0.4, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(2.6) }),
  myPart({ id: 'slit', slot: 'eyes', name: 'Slit', tags: ['sharp'], dom: 0.5, w: 2, extra: [P('M-4,0 C-2,-3 2,-3 4,0 C2,3 -2,3 -4,0 Z', 'e', { sw: 1.2 }), P('M0.4,-2.6 C1.2,-1 1.2,1 0.4,2.6 C-0.4,1 -0.4,-1 0.4,-2.6 Z', 'k', { ns: true }), C(-1.4, -1.2, 0.7, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(3) }),
  myPart({ id: 'glow', slot: 'eyes', name: 'Glow', tags: ['light'], dom: 0.5, w: 2, extra: [C(0, 0, 4.6, 'a', { ns: true, op: 0.22 }), C(0, 0, 2.8, 'a', { ns: true }), C(-0.8, -0.8, 0.9, 'w', { ns: true, op: 0.85 })], stages: myEyeStages(2.8) }),
  myPart({ id: 'big', slot: 'eyes', name: 'Big', tags: ['round'], dom: 0.55, w: 2, extra: [C(0, 0, 4.2, 'w'), C(0.6, 0.2, 3, 'e', { ns: true }), C(1, 0.4, 1.6, 'k', { ns: true }), C(-0.6, -1.4, 1, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(4.2) }),
  myPart({ id: 'dot', slot: 'eyes', name: 'Dot', tags: ['tiny'], dom: 0.5, w: 2, extra: [C(0, 0, 1.8, 'k'), C(-0.5, -0.6, 0.6, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(1.8) }),
  myPart({ id: 'ring', slot: 'eyes', name: 'Ring', tags: ['ring'], dom: 0.5, w: 2, extra: [C(0, 0, 3.6, 'a', { sw: 1.2 }), C(0.2, 0, 2.2, 'k', { ns: true }), C(-0.8, -1, 0.7, 'w', { ns: true, op: 0.9 })], stages: myEyeStages(3.6) }),
];

const myGrowFace = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.12, 1.12], add: [C(2, 0, 1, 'a', { ns: true, op: 0.8 })] } };
/** A curved pincer reaching forward from the origin, curling toward y = 0 from side dir (-1 up, 1 down). */
const myPincer = (dir, len = 12, f = 'pd') => P(`M0,${dir * 3} C${len * 0.5},${dir * 5} ${len * 0.85},${dir * 3} ${len},${dir * 0.5} C${len * 0.7},${dir * 1.5} ${len * 0.4},${dir * 1} 0,${dir * 1} Z`, f, { sw: 1.2 });

export const MY_MANDIBLES = [
  myPart({ id: 'pincers', slot: 'mandibles', name: 'Pincers', tags: ['forcipule'], dom: 0.55, w: 3, extra: [myPincer(-1), myPincer(1), C(0, 0, 1.6, 'k', { ns: true, op: 0.6 })], stages: myGrowFace }),
  myPart({ id: 'hooks', slot: 'mandibles', name: 'Hooks', tags: ['sharp'], dom: 0.5, w: 2, extra: [P('M0,-3 C6,-6 12,-6 14,-2 C10,-3 7,-2 4,0 Z', 'pd', { sw: 1.2 }), P('M0,3 C6,6 12,6 14,2 C10,3 7,2 4,0 Z', 'pd', { sw: 1.2 }), C(13, -2, 0.8, 'w', { ns: true, op: 0.7 }), C(13, 2, 0.8, 'w', { ns: true, op: 0.7 })], stages: myGrowFace }),
  myPart({ id: 'saw', slot: 'mandibles', name: 'Saw', tags: ['toothed'], dom: 0.5, w: 2, extra: [P('M0,-3 L4,-5 L6,-3 L9,-5 L11,-3 L13,-4 L12,-1 L0,-1 Z', 'pd', { sw: 1.2 }), P('M0,3 L4,5 L6,3 L9,5 L11,3 L13,4 L12,1 L0,1 Z', 'pd', { sw: 1.2 })], stages: myGrowFace }),
  myPart({ id: 'small', slot: 'mandibles', name: 'Small', tags: ['tiny'], dom: 0.5, w: 2, extra: [P('M0,-2 C3,-4 6,-3 7,-1 C5,-1 3,-1 0,-1 Z', 'pd', { sw: 1 }), P('M0,2 C3,4 6,3 7,1 C5,1 3,1 0,1 Z', 'pd', { sw: 1 })], stages: myGrowFace }),
  myPart({ id: 'wide', slot: 'mandibles', name: 'Wide', tags: ['broad'], dom: 0.5, w: 2, extra: [P('M0,-5 C6,-7 12,-6 14,-3 C12,-1 6,-1 0,-2 Z', 'pd', { sw: 1.2 }), P('M0,5 C6,7 12,6 14,3 C12,1 6,1 0,2 Z', 'pd', { sw: 1.2 }), L('M4,-3 L10,-3 M4,3 L10,3', 'k', 0.9, { op: 0.3 })], stages: myGrowFace }),
  myPart({ id: 'needles', slot: 'mandibles', name: 'Needles', tags: ['thin'], dom: 0.5, w: 2, extra: [L('M0,-3 L14,-2 M0,3 L14,2 M0,0 L11,0', 'pd', 1.8), C(14, -2, 0.7, 'a', { ns: true }), C(14, 2, 0.7, 'a', { ns: true })], stages: myGrowFace }),
  myPart({ id: 'crushers', slot: 'mandibles', name: 'Crushers', tags: ['blunt'], dom: 0.55, w: 2, extra: [P('M0,-5 L8,-6 L11,-3 L10,-1 L0,-1 Z', 'pd', { sw: 1.4 }), P('M0,5 L8,6 L11,3 L10,1 L0,1 Z', 'pd', { sw: 1.4 }), L('M3,-4 L8,-4 M3,4 L8,4', 'k', 0.9, { op: 0.3 })], stages: myGrowFace }),
];

const myAntStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.15, 1.15], add: [C(18, -18, 1.4, 'a', { ns: true, op: 0.8 })] } };
const myAnt = (d, w = 2) => L(d, 'p', w);
const myAntFar = (d, w = 1.8) => L(d, 'pd', w);

export const MY_ANTENNAE = [
  myPart({ id: 'long', slot: 'antennae', name: 'Long', tags: ['long'], dom: 0.5, w: 3, extra: [myAntFar('M0,0 C2,-10 4,-18 8,-26'), myAnt('M0,0 C4,-8 10,-14 18,-18'), C(18, -18, 1.2, 'a', { ns: true }), C(8, -26, 1, 'a', { ns: true })], stages: myAntStages }),
  myPart({ id: 'short', slot: 'antennae', name: 'Short', tags: ['short'], dom: 0.5, w: 3, extra: [myAntFar('M0,0 C1,-6 2,-10 4,-14'), myAnt('M0,0 C3,-5 6,-8 10,-10'), C(10, -10, 1.1, 'a', { ns: true }), C(4, -14, 0.9, 'a', { ns: true })], stages: myAntStages }),
  myPart({ id: 'feathered', slot: 'antennae', name: 'Feathered', tags: ['plume'], dom: 0.5, w: 2, extra: [myAntFar('M0,0 C2,-10 4,-18 8,-24'), myAnt('M0,0 C4,-8 10,-14 16,-18'), L('M4,-7 L2,-11 M7,-10 L5,-14 M10,-13 L8,-17 M13,-15 L11,-19', 'p', 1.2), L('M4,-8 L7,-10 M6,-12 L9,-13 M8,-16 L11,-16', 'p', 1.2)], stages: myAntStages }),
  myPart({ id: 'clubbed', slot: 'antennae', name: 'Clubbed', tags: ['club'], dom: 0.5, w: 2, extra: [myAntFar('M0,0 C2,-8 4,-14 6,-20'), myAnt('M0,0 C4,-6 8,-10 14,-14'), C(15, -15, 2.6, 'a', { sw: 1 }), C(6, -21, 2, 'a', { sw: 1 })], stages: myAntStages }),
  myPart({ id: 'curled', slot: 'antennae', name: 'Curled', tags: ['spiral'], dom: 0.5, w: 2, extra: [myAntFar('M0,0 C2,-8 4,-14 6,-18'), L(spiralPath(8, -21, 3.5, 1.4, 90), 'pd', 1.6), myAnt('M0,0 C4,-6 8,-10 12,-12'), L(spiralPath(15, -14, 4, 1.4, 90), 'p', 1.8), C(15, -14, 1, 'a', { ns: true })], stages: myAntStages }),
  myPart({ id: 'bent', slot: 'antennae', name: 'Bent', tags: ['angled'], dom: 0.5, w: 2, extra: [myAntFar('M0,0 L2,-12 L10,-18'), myAnt('M0,0 L6,-8 L18,-10'), C(6, -8, 1.4, 'pd', { sw: 1 }), C(18, -10, 1.2, 'a', { ns: true }), C(10, -18, 1, 'a', { ns: true })], stages: myAntStages }),
  myPart({ id: 'twin', slot: 'antennae', name: 'Twin pairs', tags: ['four'], dom: 0.5, w: 2, extra: [myAntFar('M0,0 C2,-10 4,-16 8,-22 M0,0 C0,-8 -2,-14 -4,-18'), myAnt('M0,0 C4,-8 10,-12 16,-14 M0,0 C6,-4 12,-4 18,-2'), C(16, -14, 1.1, 'a', { ns: true }), C(18, -2, 1.1, 'a', { ns: true })], stages: myAntStages }),
];

const myVenomStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.12, 1.12], add: [C(0, 6, 1.2, 'a', { ns: true, op: 0.8 })] } };

export const MY_VENOM = [
  NONE('venom', 0.3, 'y.'),
  myPart({ id: 'drips', slot: 'venom', name: 'Drips', tags: ['drop'], dom: 0.5, w: 3, extra: [P('M-2,0 C-4,3 -4,6 -2,7 C0,6 0,3 -2,0 Z', 'a', { ns: true }), P('M3,1 C1,4 1,8 3,9 C5,8 5,4 3,1 Z', 'a', { ns: true }), C(-2.4, 5, 0.5, 'w', { ns: true, op: 0.8 })], stages: myVenomStages }),
  myPart({ id: 'sacs', slot: 'venom', name: 'Sacs', tags: ['gland'], dom: 0.5, w: 2, extra: [C(-3, 2, 2.6, 'a', { sw: 1, op: 0.9 }), C(3, 3, 2.2, 'a', { sw: 1, op: 0.9 }), C(-3.6, 1.2, 0.7, 'w', { ns: true, op: 0.8 })], stages: myVenomStages }),
  myPart({ id: 'spit', slot: 'venom', name: 'Spit', tags: ['spray'], dom: 0.5, w: 2, extra: [C(4, 1, 1.2, 'a', { ns: true }), C(8, 0, 0.9, 'a', { ns: true, op: 0.8 }), C(11, -1, 0.7, 'a', { ns: true, op: 0.6 }), C(7, 3, 0.6, 'a', { ns: true, op: 0.6 })], stages: myVenomStages }),
  myPart({ id: 'fangs', slot: 'venom', name: 'Fangs', tags: ['teeth'], dom: 0.5, w: 2, extra: [P('M-3,-1 L-2,5 L-1,-1 Z M2,-1 L3,5 L4,-1 Z', 'w', { sw: 1 }), C(-2, 5, 0.6, 'a', { ns: true }), C(3, 5, 0.6, 'a', { ns: true })], stages: myVenomStages }),
  myPart({ id: 'mist', slot: 'venom', name: 'Mist', tags: ['soft'], dom: 0.45, w: 2, extra: [C(2, 2, 5, 'a', { ns: true, op: 0.18 }), C(6, 0, 3.6, 'a', { ns: true, op: 0.16 }), C(-1, 4, 3, 'a', { ns: true, op: 0.16 })], stages: myVenomStages }),
  myPart({ id: 'bubbles', slot: 'venom', name: 'Bubbles', tags: ['foam'], dom: 0.5, w: 2, extra: [C(-2, 2, 2, 'w', { ns: true, op: 0.6 }), C(2, 4, 1.4, 'w', { ns: true, op: 0.6 }), C(4, 0, 1, 'w', { ns: true, op: 0.6 }), C(-1, 5, 0.8, 'a', { ns: true, op: 0.8 })], stages: myVenomStages }),
  myPart({ id: 'glow', slot: 'venom', name: 'Glow', tags: ['light'], dom: 0.5, w: 2, extra: [C(1, 2, 4.4, 'a', { ns: true, op: 0.22 }), C(1, 2, 2.2, 'a', { ns: true, op: 0.9 }), C(0.4, 1.4, 0.7, 'w', { ns: true, op: 0.8 })], stages: myVenomStages }),
];
