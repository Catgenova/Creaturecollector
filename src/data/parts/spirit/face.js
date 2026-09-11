// Spirit eyes (origin = the eye centre), mouths (origin = the middle of the mouth) and masks (a face plate on the
// shroud, drawn under the eyes; origin = the face centre).
// Evolutions: eyes ring then glow; mouths grow; masks grow.
import { spPart } from './_shared.js';
import { NONE, P, C, E, L } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const spEyeStages = (r) => ({ 2: { grow: [1.06, 1.06], add: [evoRing(0, 0, r * 1.3, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.08, 1.08], add: [C(0, 0, r * 2, 'a', { ns: true, op: 0.16 })] } });

export const SP_EYES = [
  spPart({ id: 'hollow', slot: 'eyes', name: 'Hollow', tags: ['dark'], dom: 0.5, w: 3, extra: [E(0, 0, 3.4, 4.2, 'k', { ns: true, op: 0.9 }), C(0.6, 0.4, 0.9, 'a', { ns: true, op: 0.8 })], stages: spEyeStages(3.4) }),
  spPart({ id: 'glow', slot: 'eyes', name: 'Glow', tags: ['light'], dom: 0.5, w: 3, extra: [C(0, 0, 4.8, 'a', { ns: true, op: 0.22 }), C(0, 0, 2.8, 'a', { ns: true }), C(-0.8, -0.8, 0.9, 'w', { ns: true, op: 0.85 })], stages: spEyeStages(2.8) }),
  spPart({ id: 'dot', slot: 'eyes', name: 'Dot', tags: ['small'], dom: 0.5, w: 2, extra: [C(0, 0, 2.2, 'k', { ns: true, op: 0.9 }), C(-0.6, -0.7, 0.7, 'w', { ns: true, op: 0.9 })], stages: spEyeStages(2.2) }),
  spPart({ id: 'sad', slot: 'eyes', name: 'Sad', tags: ['slant'], dom: 0.5, w: 2, extra: [P('M-4,-1 C-2,-4 2,-3 4,1 C2,3 -2,3 -4,-1 Z', 'k', { ns: true, op: 0.9 }), C(0.4, 0.4, 0.8, 'a', { ns: true, op: 0.8 }), L('M-4,-3 L3,-1', 'k', 1.2, { ns: true, op: 0.6 })], stages: spEyeStages(3) }),
  spPart({ id: 'slit', slot: 'eyes', name: 'Slit', tags: ['sharp'], dom: 0.5, w: 2, extra: [P('M-4.4,0 C-2,-2.6 2,-2.6 4.4,0 C2,2.6 -2,2.6 -4.4,0 Z', 'a', { ns: true }), P('M0.4,-2 C1,-1 1,1 0.4,2 C-0.2,1 -0.2,-1 0.4,-2 Z', 'k', { ns: true })], stages: spEyeStages(3) }),
  spPart({ id: 'wide', slot: 'eyes', name: 'Wide', tags: ['round'], dom: 0.55, w: 2, extra: [C(0, 0, 4.2, 'w'), C(0.6, 0.2, 2.6, 'e', { ns: true }), C(1, 0.4, 1.4, 'k', { ns: true }), C(-0.8, -1.4, 0.9, 'w', { ns: true, op: 0.9 })], stages: spEyeStages(4.2) }),
  spPart({ id: 'spiral', slot: 'eyes', name: 'Spiral', tags: ['hypnotic'], dom: 0.5, w: 2, extra: [C(0, 0, 4, 'w'), L(spiralPath(0, 0, 3.4, 2.2, 0), 'k', 1.2, { ns: true, op: 0.85 })], stages: spEyeStages(4) }),
];

const spMouthStages = { 2: { grow: [1.06, 1.06] }, 3: { grow: [1.08, 1.08], add: [C(-1, 3, 0.8, 'a', { ns: true, op: 0.8 })] } };

export const SP_MOUTHS = [
  spPart({ id: 'o', slot: 'mouth', name: 'O', tags: ['round'], dom: 0.5, w: 3, extra: [E(0, 0, 2.6, 3.4, 'k', { ns: true, op: 0.85 })], stages: spMouthStages }),
  spPart({ id: 'wail', slot: 'mouth', name: 'Wail', tags: ['open'], dom: 0.55, w: 2, extra: [P('M-6,-2 C-4,-5 4,-5 6,-2 C5,4 3,8 0,8 C-3,8 -5,4 -6,-2 Z', 'k', { ns: true, op: 0.9 }), P('M-4,0 C-2,2 2,2 4,0 C3,4 -3,4 -4,0 Z', 'a', { ns: true, op: 0.4 })], stages: spMouthStages }),
  spPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M-6,-1 C-3,3 3,3 6,-1', 'k', 1.6, { ns: true, op: 0.85 })], stages: spMouthStages }),
  spPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['sad'], dom: 0.5, w: 2, extra: [L('M-6,2 C-3,-2 3,-2 6,2', 'k', 1.6, { ns: true, op: 0.85 })], stages: spMouthStages }),
  spPart({ id: 'jagged', slot: 'mouth', name: 'Jagged', tags: ['teeth'], dom: 0.5, w: 2, extra: [P('M-7,-2 L-4,2 L-1,-2 L2,2 L5,-2 L7,2 L-7,2 Z', 'k', { ns: true, op: 0.9 }), L('M-7,-2 L-4,2 L-1,-2 L2,2 L5,-2 L7,2', 'w', 0.9, { ns: true, op: 0.6 })], stages: spMouthStages }),
  spPart({ id: 'line', slot: 'mouth', name: 'Line', tags: ['plain'], dom: 0.5, w: 2, extra: [L('M-5,0 L5,0', 'k', 1.6, { ns: true, op: 0.8 })], stages: spMouthStages }),
  spPart({ id: 'fangs', slot: 'mouth', name: 'Fangs', tags: ['sharp'], dom: 0.5, w: 2, extra: [L('M-6,-1 C-3,2 3,2 6,-1', 'k', 1.6, { ns: true, op: 0.85 }), P('M-4,0 L-3,4 L-2,0.4 Z M2,0.4 L3,4 L4,0 Z', 'w', { sw: 1 })], stages: spMouthStages }),
];

const spGrowMask = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.1, 1.1], add: [C(-6, -2, 1, 'a', { ns: true, op: 0.8 }), C(6, -2, 1, 'a', { ns: true, op: 0.8 })] } };
/** A face plate with two eye holes; the shroud's eyes sit on top of it. */
const spPlate = (d, f = 'w') => P(d, f, { sw: 1.2 });

export const SP_MASKS = [
  NONE('mask', 0.3, 's.'),
  spPart({ id: 'porcelain', slot: 'mask', name: 'Porcelain', tags: ['pale'], dom: 0.5, w: 3, extra: [spPlate('M-10,-10 C-6,-16 8,-16 12,-10 C14,-2 12,8 4,12 C-4,12 -12,4 -10,-10 Z'), L('M-4,6 C-2,8 2,8 4,6', 'k', 0.9, { op: 0.35 })], stages: spGrowMask }),
  spPart({ id: 'skull', slot: 'mask', name: 'Skull', tags: ['bone'], dom: 0.5, w: 2, extra: [spPlate('M-10,-8 C-8,-16 8,-16 12,-8 C13,0 10,6 8,10 L-6,10 C-10,6 -12,0 -10,-8 Z'), E(-4, -4, 3, 3.4, 'k', { ns: true, op: 0.7 }), E(6, -4, 3, 3.4, 'k', { ns: true, op: 0.7 }), L('M-3,6 L-3,9 M0,6 L0,10 M3,6 L3,9', 'k', 1, { op: 0.5 })], stages: spGrowMask }),
  spPart({ id: 'fox', slot: 'mask', name: 'Fox', tags: ['kitsune'], dom: 0.5, w: 2, extra: [spPlate('M-12,-12 C-6,-14 6,-14 12,-12 C14,-4 10,6 2,12 C-6,8 -12,-2 -12,-12 Z'), P('M-9,-6 C-6,-9 -2,-8 -1,-4 C-4,-4 -7,-4 -9,-6 Z M3,-5 C4,-9 8,-9 11,-7 C9,-4 6,-4 3,-5 Z', 'a', { ns: true, op: 0.85 }), C(2, 9, 1.2, 'k', { ns: true, op: 0.7 })], stages: spGrowMask }),
  spPart({ id: 'theatre', slot: 'mask', name: 'Theatre', tags: ['drama'], dom: 0.5, w: 2, extra: [spPlate('M-10,-10 C-6,-15 8,-15 12,-10 C13,-2 11,8 3,12 C-5,10 -12,2 -10,-10 Z', 'sl'), P('M-8,-4 C-6,-7 -2,-7 -1,-4 Z M3,-4 C5,-7 9,-7 10,-4 Z', 'k', { ns: true, op: 0.8 }), P('M-5,4 C-2,9 6,9 8,4 C6,6 -2,6 -5,4 Z', 'k', { ns: true, op: 0.8 })], stages: spGrowMask }),
  spPart({ id: 'bandage', slot: 'mask', name: 'Bandaged', tags: ['wrapped'], dom: 0.5, w: 2, extra: [spPlate('M-10,-10 C-6,-14 8,-14 12,-10 C13,-2 11,8 3,12 C-5,10 -12,2 -10,-10 Z', 's'), L('M-10,-6 C-2,-4 6,-8 12,-6 M-10,0 C-2,2 6,-2 12,0 M-8,6 C-2,8 4,4 10,6', 'k', 1, { op: 0.3 })], stages: spGrowMask }),
  spPart({ id: 'cracked', slot: 'mask', name: 'Cracked', tags: ['broken'], dom: 0.5, w: 2, extra: [spPlate('M-10,-10 C-6,-15 8,-15 12,-10 C13,-2 11,8 3,12 C-5,10 -12,2 -10,-10 Z'), L('M2,-14 L0,-6 L4,0 L1,8 M6,-8 L10,-4', 'k', 1.2, { op: 0.5 }), C(3, -1, 1.2, 'a', { ns: true, op: 0.8 })], stages: spGrowMask }),
  spPart({ id: 'gilded', slot: 'mask', name: 'Gilded', tags: ['gold'], dom: 0.5, w: 2, extra: [spPlate('M-10,-10 C-6,-15 8,-15 12,-10 C13,-2 11,8 3,12 C-5,10 -12,2 -10,-10 Z', 'a'), L('M-8,-8 C-2,-12 6,-12 10,-8 M-6,8 C-2,10 4,10 8,6', 'w', 1, { ns: true, op: 0.5 }), C(1, -13, 1.4, 'w', { ns: true, op: 0.7 })], stages: spGrowMask }),
];
