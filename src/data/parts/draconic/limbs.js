// Draconic forelegs (origin = the shoulder socket on the belly line), hind legs (origin = the hip) and tails
// (origin = the tail socket at the back, trailing behind).
// Evolutions: legs grow and band; tails grow and spike.
import { drLeg, drPart } from './_shared.js';
import { L, C, P, HL, tube, leaf, fur, puff } from '../_dsl.js';
import { claws } from '../_builders.js';
import { flamePath, diamondPath } from '../_sigils.js';
import { evoBands, evoRing, evoSpike } from '../_evo.js';

const drLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [...evoBands(8, 2, 2.2, 5), evoRing(0, 3, 4, 'a', 1, { op: 0.5 })] } };
const drTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 9, 3.5), f: 'a' }, { pts: evoSpike(x + 10, y + 1, -100, 8, 3.5), f: 'a' }] } });

export const DR_LEGS_FRONT = [
  drLeg({ id: 'claw', slot: 'legsFront', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [2, 8], [0, 16]], 9, 6, { tipK: 1 })], extra: [...claws(-4, 4, 16, 3, 5)], stages: drLegStages }),
  drLeg({ id: 'stout', slot: 'legsFront', name: 'Stout', tags: ['thick'], dom: 0.55, w: 2, shapes: [tube([[0, 0], [1, 8], [0, 16]], 12, 9, { tipK: 1 })], extra: [L('M-4,17 L-5,20 M0,17 L0,20 M4,17 L5,20', 'k', 1.4)], stages: drLegStages }),
  drLeg({ id: 'talon', slot: 'legsFront', name: 'Taloned', tags: ['bird'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [3, 7], [0, 14]], 7, 4, { tipK: 1 })], extra: [...claws(-5, 5, 14, 3, 6)], stages: drLegStages }),
  drLeg({ id: 'slim', slot: 'legsFront', name: 'Slim', tags: ['thin'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [2, 9], [-1, 17]], 6, 3.5, { tipK: 1 })], extra: [L('M-3,17 L-4,20 M0,17 L0,20 M2,17 L3,20', 'k', 1.3)], stages: drLegStages }),
  drLeg({ id: 'armoured', slot: 'legsFront', name: 'Armoured', tags: ['plate'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [1, 8], [0, 16]], 10, 7, { tipK: 1 }), [[-6, 2], [6, 2], [7, 8], [-7, 8]]], extra: [L('M-5,5 L5,5', 'k', 0.9, { op: 0.3 }), ...claws(-4, 4, 16, 3, 4)], stages: drLegStages }),
  drLeg({ id: 'paw', slot: 'legsFront', name: 'Paw', tags: ['soft'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [1, 8], [0, 14]], 9, 6, { tipK: 1 }), { pts: puff(1, 16, 5, 6, 0.8), f: 'p' }], extra: [L('M-3,20 L-3,21.5 M1,20.5 L1,22 M5,20 L5,21.5', 'k', 1.2, { op: 0.5 })], stages: drLegStages }),
  drLeg({ id: 'digger', slot: 'legsFront', name: 'Digger', tags: ['claw'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [3, 7], [4, 14]], 9, 7, { tipK: 1 })], extra: [P('M0,14 L-2,22 L3,15 Z', 'w', { sw: 1 }), P('M4,15 L5,23 L8,15 Z', 'w', { sw: 1 }), P('M8,13 L12,20 L11,13 Z', 'w', { sw: 1 })], stages: drLegStages }),
];

export const DR_LEGS_BACK = [
  drLeg({ id: 'haunch', slot: 'legsBack', name: 'Haunch', tags: ['strong'], dom: 0.5, w: 3, shapes: [{ pts: puff(-2, 2, 9, 7, 0.8), f: 'p' }, tube([[0, 4], [-3, 10], [1, 16]], 8, 5, { tipK: 1 })], extra: [...claws(-3, 5, 16, 3, 5), HL('M-8,-2 C-6,-6 -2,-7 2,-6 C-2,-5 -5,-3 -6,2 Z', 0.2)], stages: drLegStages }),
  drLeg({ id: 'stout', slot: 'legsBack', name: 'Stout', tags: ['thick'], dom: 0.55, w: 2, shapes: [tube([[0, 0], [-1, 8], [0, 16]], 12, 9, { tipK: 1 })], extra: [L('M-4,17 L-5,20 M0,17 L0,20 M4,17 L5,20', 'k', 1.4)], stages: drLegStages }),
  drLeg({ id: 'talon', slot: 'legsBack', name: 'Taloned', tags: ['bird'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-3, 7], [0, 14]], 8, 4, { tipK: 1 })], extra: [...claws(-5, 5, 14, 3, 6)], stages: drLegStages }),
  drLeg({ id: 'slim', slot: 'legsBack', name: 'Slim', tags: ['thin'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [-2, 9], [1, 17]], 6, 3.5, { tipK: 1 })], extra: [L('M-2,17 L-3,20 M1,17 L1,20 M3,17 L4,20', 'k', 1.3)], stages: drLegStages }),
  drLeg({ id: 'armoured', slot: 'legsBack', name: 'Armoured', tags: ['plate'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-1, 8], [0, 16]], 10, 7, { tipK: 1 }), [[-7, 2], [7, 2], [7, 8], [-7, 8]]], extra: [L('M-5,5 L5,5', 'k', 0.9, { op: 0.3 }), ...claws(-4, 4, 16, 3, 4)], stages: drLegStages }),
  drLeg({ id: 'paw', slot: 'legsBack', name: 'Paw', tags: ['soft'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-1, 8], [0, 14]], 9, 6, { tipK: 1 }), { pts: puff(1, 16, 5, 6, 0.8), f: 'p' }], extra: [L('M-3,20 L-3,21.5 M1,20.5 L1,22 M5,20 L5,21.5', 'k', 1.2, { op: 0.5 })], stages: drLegStages }),
  drLeg({ id: 'spring', slot: 'legsBack', name: 'Sprung', tags: ['bent'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-8, 6], [-6, 12], [2, 16]], 9, 5, { tipK: 1 })], extra: [...claws(-1, 6, 16, 3, 5)], stages: drLegStages }),
];

export const DR_TAILS = [
  drPart({ id: 'spade', slot: 'tail', name: 'Spade', tags: ['arrow'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -4]], 12, 3, { tipK: 'c' })], extra: [P(diamondPath(-38, -6, 13, 10), 'a', { sw: 1.3 })], stages: drTailStages(-14, -2) }),
  drPart({ id: 'spiked', slot: 'tail', name: 'Spiked', tags: ['spiky'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-34, -2]], 12, 2, { tipK: 'c' }), { pts: [[-4, -5], ...fur([-4, -5], [-26, -4], 5, 6, { tip: 'c' }), [-26, 0], [-4, 0]], f: 'a' }], stages: drTailStages(-14, -6) }),
  drPart({ id: 'club', slot: 'tail', name: 'Club', tags: ['heavy'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2]], 12, 6, { tipK: 1 }), { pts: puff(-30, 1, 7, 7, 1.4), f: 'pd' }], extra: [C(-32, -2, 1.2, 'w', { ns: true, op: 0.5 }), L('M-27,-4 L-29,-7 M-34,-4 L-36,-7 M-35,4 L-38,6', 'k', 1.3, { op: 0.6 })], stages: drTailStages(-12, -2) }),
  drPart({ id: 'tuft', slot: 'tail', name: 'Tufted', tags: ['lion'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' }), { pts: puff(-36, -3, 6, 7, 2), f: 'a' }], stages: drTailStages(-14, -2) }),
  drPart({ id: 'fin', slot: 'tail', name: 'Finned', tags: ['fin'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' }), { d: leaf([-30, -1], [-42, -14], 5), f: 'a' }, { d: leaf([-30, 0], [-40, 10], 4), f: 'a' }], stages: drTailStages(-14, -2) }),
  drPart({ id: 'flame', slot: 'tail', name: 'Flame-tipped', tags: ['fire'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' })], extra: [P(flamePath(-36, -8, 10, -30), 'a', { sw: 1.3 }), P(flamePath(-36, -5, 5, -30), 'w', { ns: true, op: 0.5 })], stages: drTailStages(-14, -2) }),
  drPart({ id: 'whip', slot: 'tail', name: 'Whip', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 6], [-28, 0], [-40, -10]], 11, 1.5, { tipK: 'c' })], extra: [L('M-4,-3 C-14,0 -24,-4 -36,-10', 'k', 1, { op: 0.2 })], stages: drTailStages(-14, -2) }),
];
