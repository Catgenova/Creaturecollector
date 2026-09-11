// Myriapod plates (armour on the middle of the back, behind the body) and bristles (hairs standing along the back,
// behind the body and the plates).
// Evolutions: both grow.
import { myPart } from './_shared.js';
import { NONE, L, C, P, S, fur } from '../_dsl.js';

const myGrowBack = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };

export const MY_PLATES = [
  NONE('plates', 0.3, 'y.'),
  myPart({ id: 'ridge', slot: 'plates', name: 'Ridge', tags: ['serrated'], dom: 0.5, w: 3, shapes: [{ pts: [[-22, 2], ...fur([-22, 2], [22, 2], 7, 5, { tip: 0.3 }), [22, 4], [-22, 4]], f: 'pd' }], extra: [L('M-16,0 L-16,-3 M0,0 L0,-3 M16,0 L16,-3', 'k', 0.9, { op: 0.3 })], stages: myGrowBack }),
  myPart({ id: 'scutes', slot: 'plates', name: 'Scutes', tags: ['plates'], dom: 0.5, w: 2, shapes: [[[-24, 3], [-20, -5, 0.5], [-8, -5, 0.5], [-4, 3]], [[-10, 3], [-6, -6, 0.5], [6, -6, 0.5], [10, 3]], [[4, 3], [8, -5, 0.5], [20, -5, 0.5], [24, 3]]], extra: [L('M-14,-3 L-14,1 M0,-4 L0,1 M14,-3 L14,1', 'k', 0.9, { op: 0.3 })], stages: myGrowBack }),
  myPart({ id: 'spikes', slot: 'plates', name: 'Spikes', tags: ['sharp'], dom: 0.5, w: 2, shapes: [[[-16, 3], [-12, -12, 'c'], [-8, 3]], [[-4, 3], [0, -16, 'c'], [4, 3]], [[8, 3], [12, -12, 'c'], [16, 3]]], extra: [L('M-12,-8 L-11,0 M0,-12 L1,0 M12,-8 L13,0', 'k', 0.9, { op: 0.25 })], stages: myGrowBack }),
  myPart({ id: 'dome', slot: 'plates', name: 'Dome', tags: ['round'], dom: 0.5, w: 2, shapes: [[[-18, 3], [-14, -6], [0, -9], [14, -6], [18, 3]]], extra: [L('M-10,-4 C-4,-7 4,-7 10,-4', 'k', 1, { op: 0.3 }), C(0, -4, 1.4, 'a', { ns: true, op: 0.8 })], stages: myGrowBack }),
  myPart({ id: 'crest', slot: 'plates', name: 'Crest', tags: ['fin'], dom: 0.5, w: 2, shapes: [[[-18, 3], [-12, -8], [-2, -18], [10, -12], [18, 3]]], extra: [L('M-10,0 L-6,-10 M0,0 L-1,-14 M10,0 L8,-9', 'k', 1, { op: 0.3 })], stages: myGrowBack }),
  myPart({ id: 'keel', slot: 'plates', name: 'Keel', tags: ['sharp'], dom: 0.5, w: 2, shapes: [[[-24, 3, 'c'], [-20, -3, 'c'], [0, -8, 'c'], [20, -3, 'c'], [24, 3, 'c']]], extra: [L('M-20,-3 L20,-3', 'k', 1, { op: 0.3 })], stages: myGrowBack }),
  myPart({ id: 'horns', slot: 'plates', name: 'Horns', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-10, 3], [-14, -8], [-8, -18, 'c'], [-6, -6], [-4, 3]], [[4, 3], [6, -6], [8, -18, 'c'], [14, -8], [10, 3]]], extra: [L('M-9,-4 L-11,-10 M9,-4 L11,-10', 'k', 0.9, { op: 0.3 })], stages: myGrowBack }),
];

const myHairs = (xs, len, f = 'pd', w = 1.2) => L(xs.map((x, i) => `M${x},0 L${x + (i % 2 ? 1 : -1)},${-len - (i % 3)}`).join(' '), f, w);

export const MY_BRISTLES = [
  NONE('bristles', 0.3, 'y.'),
  myPart({ id: 'fine', slot: 'bristles', name: 'Fine', tags: ['hair'], dom: 0.5, w: 3, extra: [myHairs([-24, -20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20, 24], 6, 'pd', 1)], stages: myGrowBack }),
  myPart({ id: 'spiky', slot: 'bristles', name: 'Spiky', tags: ['sharp'], dom: 0.5, w: 2, extra: [myHairs([-24, -16, -8, 0, 8, 16, 24], 10, 'pd', 1.8), ...[-24, -8, 8, 24].map((x) => C(x, -11, 0.8, 'a', { ns: true, op: 0.8 }))], stages: myGrowBack }),
  myPart({ id: 'dense', slot: 'bristles', name: 'Dense', tags: ['fur'], dom: 0.5, w: 2, shapes: [{ pts: [[-26, 2], ...fur([-26, 2], [26, 2], 13, 7, { tip: 0.3, wobble: 0.3 }), [26, 4], [-26, 4]], f: 'pd' }], stages: myGrowBack }),
  myPart({ id: 'tufted', slot: 'bristles', name: 'Tufted', tags: ['tuft'], dom: 0.5, w: 2, extra: [myHairs([-22, -19, -16, -2, 1, 4, 16, 19, 22], 8, 'pd', 1.4), ...[-19, 1, 19].map((x) => C(x, -9, 1.4, 'a', { ns: true }))], stages: myGrowBack }),
  myPart({ id: 'feathered', slot: 'bristles', name: 'Feathered', tags: ['plume'], dom: 0.5, w: 2, extra: [myHairs([-20, -10, 0, 10, 20], 11, 'p', 1.6), L('M-22,-6 L-18,-6 M-21,-9 L-17,-9 M-12,-6 L-8,-6 M-11,-9 L-7,-9 M-2,-6 L2,-6 M-1,-9 L3,-9 M8,-6 L12,-6 M9,-9 L13,-9 M18,-6 L22,-6 M19,-9 L23,-9', 'p', 1)], stages: myGrowBack }),
  myPart({ id: 'long', slot: 'bristles', name: 'Long', tags: ['long'], dom: 0.5, w: 2, extra: [L('M-22,0 C-24,-8 -28,-12 -30,-16 M-12,0 C-13,-9 -16,-14 -18,-18 M-2,0 C-2,-10 -4,-15 -6,-20 M8,0 C8,-9 6,-14 4,-18 M18,0 C17,-8 14,-12 12,-16', 'pd', 1.4)], stages: myGrowBack }),
  myPart({ id: 'short', slot: 'bristles', name: 'Short', tags: ['stubble'], dom: 0.5, w: 2, extra: [myHairs([-24, -18, -12, -6, 0, 6, 12, 18, 24], 3.5, 'pd', 1.4)], stages: myGrowBack }),
];
