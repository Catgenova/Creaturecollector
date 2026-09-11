// Wyrm whiskers (origin = the snout tip, trailing forward and down), legs (origin = a belly socket, hanging
// down to the ground; one part stands at four sockets) and tails (origin = the back end, trailing behind).
// Evolutions: whiskers grow with the crown family; legs grow and band; tails grow and spike.
import { wyLeg, wyPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, leaf, fur, puff } from '../_dsl.js';
import { claws } from '../_builders.js';
import { spiralPath, flamePath, diamondPath } from '../_sigils.js';
import { evoBands, evoRing, evoSpike } from '../_evo.js';

const wyWhiskerStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.15, 1.15] } };
const wyLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [...evoBands(6, 2, 2, 4), evoRing(0, 2, 3.5, 'a', 1, { op: 0.5 })] } };
const wyTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 8, 3), f: 'a' }, { pts: evoSpike(x + 10, y + 1, -100, 7, 3), f: 'a' }] } });

export const WY_WHISKERS = [
  NONE('whiskers', 0.3, 'w.'),
  wyPart({ id: 'long', slot: 'whiskers', name: 'Long', tags: ['flowing'], dom: 0.5, w: 3, extra: [L('M0,0 C8,-2 14,4 12,12 C10,16 6,16 4,14', 'p', 2.2)], stages: wyWhiskerStages }),
  wyPart({ id: 'short', slot: 'whiskers', name: 'Short', tags: ['stub'], dom: 0.5, w: 2, extra: [L('M0,0 C5,1 8,4 7,8', 'p', 2.2)], stages: wyWhiskerStages }),
  wyPart({ id: 'curled', slot: 'whiskers', name: 'Curled', tags: ['spiral'], dom: 0.5, w: 2, extra: [L('M0,0 L5,2', 'p', 2.2), L(spiralPath(9, 5, 4.5, 1.5, -90), 'p', 2)], stages: wyWhiskerStages }),
  wyPart({ id: 'wavy', slot: 'whiskers', name: 'Wavy', tags: ['flowing'], dom: 0.5, w: 2, extra: [L('M0,0 C6,-4 8,4 14,0 C18,-3 20,3 24,1', 'p', 2)], stages: wyWhiskerStages }),
  wyPart({ id: 'droop', slot: 'whiskers', name: 'Drooping', tags: ['sad'], dom: 0.5, w: 2, extra: [L('M0,0 C3,8 1,16 -3,22', 'p', 2.2), C(-3.5, 23, 1.2, 'p', { sw: 1 })], stages: wyWhiskerStages }),
  wyPart({ id: 'forked', slot: 'whiskers', name: 'Forked', tags: ['two'], dom: 0.5, w: 2, extra: [L('M0,0 C6,-3 10,-6 16,-8 M0,0 C6,3 10,8 12,14', 'p', 2)], stages: wyWhiskerStages }),
  wyPart({ id: 'tufted', slot: 'whiskers', name: 'Tufted', tags: ['puff'], dom: 0.5, w: 2, extra: [L('M0,0 C6,0 10,4 12,9', 'p', 2.2), P(`${puff(13, 11, 3.5, 6, 1).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`, 'a', { sw: 1 })], stages: wyWhiskerStages }),
];

export const WY_LEGS = [
  wyLeg({ id: 'claw', slot: 'legs', name: 'Clawed', tags: ['claw'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [1, 7], [0, 13]], 7, 5, { tipK: 1 })], extra: [L('M-3,13 L-4,17 M0,13 L0,17 M3,13 L4,17', 'k', 1.4)], stages: wyLegStages }),
  wyLeg({ id: 'stub', slot: 'legs', name: 'Stub', tags: ['short'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [0, 8]], 7, 5, { tipK: 1 })], extra: [L('M-2,8 L-2,11 M2,8 L2,11', 'k', 1.3, { op: 0.6 })], stages: wyLegStages }),
  wyLeg({ id: 'talon', slot: 'legs', name: 'Taloned', tags: ['bird'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [2, 6], [0, 12]], 6, 4, { tipK: 1 })], extra: [...claws(-4, 4, 12, 3, 5)], stages: wyLegStages }),
  wyLeg({ id: 'paw', slot: 'legs', name: 'Paw', tags: ['soft'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [1, 6], [0, 11]], 7, 5, { tipK: 1 }), { pts: puff(1, 13, 4.5, 6, 0.8), f: 'p' }], extra: [C(-1, 12, 1, 'w', { ns: true, op: 0.5 }), L('M-2,16 L-2,17.5 M1,16.5 L1,18 M4,16 L4,17.5', 'k', 1.2, { op: 0.5 })], stages: wyLegStages }),
  wyLeg({ id: 'fin', slot: 'legs', name: 'Flipper', tags: ['fin'], dom: 0.5, w: 2, shapes: [{ d: leaf([0, 0], [8, 14], 5), f: 'p' }], extra: [L('M1,2 L6,10 M0,3 L3,11', 'k', 1, { op: 0.3 })], stages: wyLegStages }),
  wyLeg({ id: 'hook', slot: 'legs', name: 'Hooked', tags: ['hook'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [1, 6], [0, 11], [4, 14]], 6, 3, { tipK: 'c' })], extra: [L('M-1,10 L-2,13', 'k', 1.2, { op: 0.5 })], stages: wyLegStages }),
  wyLeg({ id: 'spur', slot: 'legs', name: 'Spurred', tags: ['spike'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [1, 7], [0, 13]], 7, 5, { tipK: 1 }), [[-3, 4], [-9, 8, 'c'], [-3, 8]]], extra: [L('M-2,13 L-3,16 M2,13 L3,16', 'k', 1.4)], stages: wyLegStages }),
];

export const WY_TAILS = [
  wyPart({ id: 'taper', slot: 'tail', name: 'Taper', tags: ['plain'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-34, -2]], 12, 2, { tipK: 'c' })], extra: [L('M-4,-3 C-12,-2 -20,-4 -28,-4', 'k', 1, { op: 0.2 })], stages: wyTailStages(-14, -2) }),
  wyPart({ id: 'fin', slot: 'tail', name: 'Finned', tags: ['fin'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' }), { d: leaf([-30, -1], [-42, -14], 5), f: 'a' }, { d: leaf([-30, 0], [-40, 10], 4), f: 'a' }], stages: wyTailStages(-14, -2) }),
  wyPart({ id: 'tuft', slot: 'tail', name: 'Tufted', tags: ['lion'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' }), { pts: puff(-36, -3, 6, 7, 2), f: 'a' }], stages: wyTailStages(-14, -2) }),
  wyPart({ id: 'spade', slot: 'tail', name: 'Spade', tags: ['arrow'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' })], extra: [P(diamondPath(-38, -3, 12, 9), 'a', { sw: 1.3 })], stages: wyTailStages(-14, -2) }),
  wyPart({ id: 'spiked', slot: 'tail', name: 'Spiked', tags: ['spiky'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-34, -2]], 12, 2, { tipK: 'c' }), { pts: [[-4, -5], ...fur([-4, -5], [-26, -4], 5, 6, { tip: 'c' }), [-26, 0], [-4, 0]], f: 'a' }], stages: wyTailStages(-14, -6) }),
  wyPart({ id: 'flame', slot: 'tail', name: 'Flame-tipped', tags: ['fire'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 2], [-32, -2]], 12, 3, { tipK: 'c' })], extra: [P(flamePath(-36, -8, 10, -30), 'a', { sw: 1.3 }), P(flamePath(-36, -5, 5, -30), 'w', { ns: true, op: 0.5 })], stages: wyTailStages(-14, -2) }),
  wyPart({ id: 'curl', slot: 'tail', name: 'Curled', tags: ['spiral'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-22, 0], [-26, -8], [-20, -14]], 12, 3, { tipK: 1 })], extra: [L('M-4,-3 C-12,-2 -20,-4 -24,-8', 'k', 1, { op: 0.2 })], stages: wyTailStages(-12, -2) }),
];
