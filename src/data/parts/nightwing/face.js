// Nightwing ears (origin = the base, pointing up), eyes (origin = the eye centre) and muzzles (origin = the nose
// tip on the head's muzzle socket).
// Evolutions: ears grow and tip in the accent colour, then ring; eyes ring then glow; muzzles grow and glint.
import { nwPart } from './_shared.js';
import { P, C, E, L, S, PATCH, fur, tube } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

const nwEarStages = (tipY) => ({
  2: { grow: [1.06, 1.1], add: [PATCH(`M-3,${tipY + 7} L0,${tipY - 2} L3,${tipY + 7} Z`, 'a')] },
  3: { grow: [1.06, 1.1], add: [PATCH(`M-4,${tipY + 9} L0,${tipY - 3} L4,${tipY + 9} Z`, 'a'), evoRing(0, -7, 3, 'a', 1.2, { cl: true, op: 0.8 })] },
});
const nwInner = (pts) => S(pts, 's', { ns: true, cl: true });

export const NW_EARS = [
  nwPart({ id: 'tall', slot: 'ears', name: 'Tall', tags: ['point'], dom: 0.55, w: 3, shapes: [[[-7, 2], [-7, -10], [-3, -24], [0, -32, 'c'], [3, -24], [7, -10], [7, 2]]], extra: [nwInner([[-3, 0], [-3, -10], [0, -22, 0.3], [3, -10], [3, 0]]), L('M-1,-6 L0,-16', 'k', 0.9, { op: 0.25 })], stages: nwEarStages(-32) }),
  nwPart({ id: 'round', slot: 'ears', name: 'Round', tags: ['mouse'], dom: 0.5, w: 3, shapes: [[[-9, 2], [-10, -8], [-6, -16], [0, -19], [6, -16], [10, -8], [9, 2]]], extra: [E(0, -7, 5, 7, 's', { ns: true, cl: true }), L('M-3,-4 L-3,-10', 'k', 0.9, { op: 0.25 })], stages: nwEarStages(-19) }),
  nwPart({ id: 'leaf', slot: 'ears', name: 'Leaf', tags: ['broad'], dom: 0.5, w: 2, shapes: [[[-8, 2], [-11, -8], [-8, -20], [0, -28, 'c'], [8, -20], [11, -8], [8, 2]]], extra: [nwInner([[-5, 0], [-6, -9], [0, -21, 0.3], [6, -9], [5, 0]]), L('M0,-2 L0,-18 M0,-8 L-3,-12 M0,-12 L3,-16', 'k', 0.9, { op: 0.3 })], stages: nwEarStages(-28) }),
  nwPart({ id: 'tufted', slot: 'ears', name: 'Tufted', tags: ['fur'], dom: 0.5, w: 2, shapes: [[[-7, 2], [-8, -10], [-4, -22], ...fur([-4, -22], [4, -22], 3, 7, { tip: 'c' }), [8, -10], [7, 2]]], extra: [nwInner([[-3, 0], [-4, -9], [0, -19, 0.3], [4, -9], [3, 0]])], stages: nwEarStages(-28) }),
  nwPart({ id: 'curled', slot: 'ears', name: 'Curled', tags: ['curl'], dom: 0.5, w: 2, shapes: [tube([[0, 2], [-1, -12], [2, -24], [8, -28], [12, -24]], 12, 4, { tipK: 'c' })], extra: [nwInner([[-2, 0], [-3, -12], [1, -22, 0.3], [4, -14], [3, 0]]), C(11, -24, 1.2, 'a', { ns: true })], stages: nwEarStages(-28) }),
  nwPart({ id: 'huge', slot: 'ears', name: 'Huge', tags: ['long'], dom: 0.55, w: 2, shapes: [[[-8, 2], [-10, -14], [-6, -32], [0, -42, 'c'], [6, -32], [10, -14], [8, 2]]], extra: [nwInner([[-4, 0], [-5, -14], [0, -32, 0.3], [5, -14], [4, 0]]), L('M-5,-10 L5,-12 M-5,-18 L5,-20 M-4,-26 L4,-28', 'k', 0.9, { op: 0.25 })], stages: nwEarStages(-42) }),
  nwPart({ id: 'notched', slot: 'ears', name: 'Notched', tags: ['torn'], dom: 0.5, w: 2, shapes: [[[-7, 2], [-8, -10], [-5, -22], [-1, -28], [1, -20], [4, -26, 'c'], [7, -10], [7, 2]]], extra: [nwInner([[-3, 0], [-4, -10], [-1, -20, 0.3], [3, -10], [3, 0]]), C(4, -14, 1.2, 'k', { ns: true, op: 0.5 })], stages: nwEarStages(-28) }),
];

const nwEyeStages = (r) => ({
  2: { grow: [1.05, 1.05], add: [evoRing(0, 0, r * 0.7, 'a', 1.2, { op: 0.85 })] },
  3: { grow: [1.05, 1.05], add: [evoGlow(0, 0, r * 1.5, 0.2, 'a', { cl: false }), C(-r * 0.4, -r * 0.5, r * 0.25, 'w', { ns: true, op: 0.9 })] },
});
const nwBall = (r, f = 'w') => C(0, 0, r, f);

export const NW_EYES = [
  nwPart({ id: 'bead', slot: 'eyes', name: 'Bead', tags: ['dark'], dom: 0.5, w: 3, extra: [nwBall(3, 'k'), C(0.6, -0.8, 1, 'w', { ns: true, op: 0.9 })], stages: nwEyeStages(3) }),
  nwPart({ id: 'big', slot: 'eyes', name: 'Big', tags: ['round'], dom: 0.55, w: 3, extra: [nwBall(4.4), C(0.6, 0.2, 3, 'e', { ns: true }), C(1, 0.4, 1.6, 'k', { ns: true }), C(-0.6, -1.4, 1, 'w', { ns: true, op: 0.9 })], stages: nwEyeStages(4.4) }),
  nwPart({ id: 'slit', slot: 'eyes', name: 'Slit', tags: ['sharp'], dom: 0.5, w: 2, extra: [nwBall(3.8, 'e'), P('M0.6,-3.2 C1.6,-1 1.6,1 0.6,3.2 C-0.4,1 -0.4,-1 0.6,-3.2 Z', 'k', { ns: true }), C(-0.8, -1.2, 0.8, 'w', { ns: true, op: 0.9 })], stages: nwEyeStages(3.8) }),
  nwPart({ id: 'glow', slot: 'eyes', name: 'Glowing', tags: ['light'], dom: 0.5, w: 2, extra: [C(0, 0, 5.4, 'a', { ns: true, op: 0.22 }), nwBall(3.6, 'a'), C(0.4, 0, 1.6, 'w', { ns: true, op: 0.9 })], stages: nwEyeStages(3.6) }),
  nwPart({ id: 'sleepy', slot: 'eyes', name: 'Sleepy', tags: ['lid'], dom: 0.5, w: 2, extra: [nwBall(4), C(0.6, 0.4, 2.6, 'e', { ns: true }), C(1, 0.6, 1.3, 'k', { ns: true }), P('M-4,-0.4 C-2,-3.4 2,-3.4 4,-0.4 C3,-3 1.5,-4 0,-4 C-1.5,-4 -3,-3 -4,-0.4 Z', 'p', { ns: true }), L('M-4,-0.6 C-2,-2.8 2,-2.8 4,-0.6', 'k', 1.2, { ns: true })], stages: nwEyeStages(4) }),
  nwPart({ id: 'wide', slot: 'eyes', name: 'Wide', tags: ['ring'], dom: 0.5, w: 2, extra: [nwBall(4.4), C(0.4, 0, 2.2, 'e', { ns: true }), C(0.8, 0.2, 1.2, 'k', { ns: true }), C(-0.8, -1.4, 0.8, 'w', { ns: true, op: 0.9 }), evoRing(0, 0, 3.4, 'a', 0.8, { op: 0.7 })], stages: nwEyeStages(4.4) }),
  nwPart({ id: 'red', slot: 'eyes', name: 'Pinprick', tags: ['dark'], dom: 0.5, w: 2, extra: [nwBall(3.4, 'k'), C(0.4, 0, 2.6, 'e', { ns: true, op: 0.25 }), C(0.4, 0, 1.4, 'e', { ns: true }), C(-0.6, -1, 0.6, 'w', { ns: true, op: 0.8 })], stages: nwEyeStages(3.4) }),
];

const nwMuzzleStages = { 2: { grow: [1.06, 1.06] }, 3: { grow: [1.08, 1.08], add: [C(-2, -1, 0.8, 'w', { ns: true, op: 0.8 })] } };
const nwMouth = (d = 'M-5,3 C-3,5 1,5 3,3') => L(d, 'k', 1.3);

export const NW_MUZZLES = [
  nwPart({ id: 'leaf', slot: 'muzzle', name: 'Nose leaf', tags: ['leaf'], dom: 0.55, w: 3, extra: [P('M-3,-8 C-6,-4 -6,2 -2,4 C0,5 2,5 4,4 C6,0 4,-6 1,-8 Z', 'a', { sw: 1.2 }), C(-1, -1, 1.2, 'k', { ns: true, op: 0.7 }), nwMouth('M-5,5 C-3,7 1,7 3,5')], stages: nwMuzzleStages }),
  nwPart({ id: 'snub', slot: 'muzzle', name: 'Snub', tags: ['pug'], dom: 0.5, w: 3, extra: [E(-1, -2, 3.2, 2.4, 'a', { sw: 1.2 }), C(-2.2, -2.2, 0.8, 'k', { ns: true, op: 0.6 }), C(0.4, -2.2, 0.8, 'k', { ns: true, op: 0.6 }), nwMouth('M-5,2 C-3,4 1,4 3,2')], stages: nwMuzzleStages }),
  nwPart({ id: 'long', slot: 'muzzle', name: 'Pointed', tags: ['fox'], dom: 0.5, w: 2, extra: [P('M-3.6,-2 L2.4,-2 L-0.6,2 Z', 'a', { sw: 1.4 }), L('M-0.6,2 L-0.6,4 M-4,4 C-2,6 0,6 2,4', 'k', 1.3), L('M-8,-1 L-14,-2 M-8,1 L-14,2', 'k', 1, { op: 0.4 })], stages: nwMuzzleStages }),
  nwPart({ id: 'fanged', slot: 'muzzle', name: 'Fanged', tags: ['vampire'], dom: 0.55, w: 2, extra: [P('M-6,0 C-4,5 2,5 4,0 Z', 'k', { ns: true, op: 0.85 }), P('M-4,0 L-3,4 L-2,0 Z M2,0 L3,4 L4,0 Z', 'w', { sw: 1 }), C(-1, -2.6, 1.6, 'a', { sw: 1 })], stages: nwMuzzleStages }),
  nwPart({ id: 'tube', slot: 'muzzle', name: 'Tube-nosed', tags: ['tube'], dom: 0.5, w: 2, extra: [E(-2, -2, 2, 2.6, 'a', { sw: 1.2 }), E(2, -2, 2, 2.6, 'a', { sw: 1.2 }), C(-2, -2, 0.7, 'k', { ns: true, op: 0.7 }), C(2, -2, 0.7, 'k', { ns: true, op: 0.7 }), nwMouth('M-4,3 C-2,5 2,5 4,3')], stages: nwMuzzleStages }),
  nwPart({ id: 'grin', slot: 'muzzle', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 2, extra: [P('M-7,0 C-4,5 4,5 7,0 C4,2 -4,2 -7,0 Z', 'k', { ns: true, op: 0.85 }), L('M-4,0.6 L-4,2.6 M-1,1.4 L-1,3.4 M2,1.2 L2,3.2 M5,0.6 L5,2.4', 'w', 1.2), C(0, -2.6, 1.6, 'a', { sw: 1 })], stages: nwMuzzleStages }),
  nwPart({ id: 'whiskered', slot: 'muzzle', name: 'Whiskered', tags: ['whisker'], dom: 0.5, w: 2, extra: [C(-0.6, -1.6, 1.8, 'a', { sw: 1.2 }), nwMouth('M-4,3 C-2,5 2,5 4,3'), L('M-6,-3 L-14,-6 M-6,0 L-15,0 M-6,3 L-14,6', 'k', 1, { op: 0.45 }), C(-14, -6, 0.9, 'a', { ns: true }), C(-15, 0, 0.9, 'a', { ns: true }), C(-14, 6, 0.9, 'a', { ns: true })], stages: nwMuzzleStages }),
];
