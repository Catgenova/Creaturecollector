// Wyrm manes (a ridge along the spine, drawn behind at the mane socket), plates (armour on the back, in front)
// and horns (on the brow, drawn behind the head).
// Evolutions: manes and plates grow; horns grow with the crown family.
import { wyPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, leaf, fur, spline, arcPts } from '../_dsl.js';
import { flamePath, spiralPath } from '../_sigils.js';
import { evoGem } from '../_evo.js';

const wyCrestStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };
const wyPlate = (x, y, w, h) => [[x - w, y], [x - w * 0.5, y - h], [x + w * 0.5, y - h], [x + w, y], [x, y + h * 0.5]];

export const WY_MANES = [
  NONE('mane', 0.3, 'w.'),
  wyPart({ id: 'ridge', slot: 'mane', name: 'Ridge', tags: ['fin'], dom: 0.5, w: 3, shapes: [{ pts: [[-16, 2], ...fur([-16, 2], [16, 2], 6, 9, { tip: 'c' }), [16, 6], [-16, 6]], f: 'a' }], stages: wyCrestStages }),
  wyPart({ id: 'fur', slot: 'mane', name: 'Fur', tags: ['fluffy'], dom: 0.5, w: 2, shapes: [{ pts: [[-16, 2], ...fur([-16, 2], [16, 2], 8, 6, { tip: 0.5 }), [16, 6], [-16, 6]], f: 'a' }], extra: [C(-8, -1, 0.9, 'w', { ns: true, op: 0.5 }), C(4, -2, 0.9, 'w', { ns: true, op: 0.5 })], stages: wyCrestStages }),
  wyPart({ id: 'flames', slot: 'mane', name: 'Flames', tags: ['fire'], dom: 0.5, w: 2, extra: [P(flamePath(-12, -4, 8), 'a', { sw: 1.2 }), P(flamePath(-2, -8, 11), 'a', { sw: 1.2 }), P(flamePath(9, -4, 8), 'a', { sw: 1.2 }), P(flamePath(-2, -5, 5), 'w', { ns: true, op: 0.5 })], stages: wyCrestStages }),
  wyPart({ id: 'spines', slot: 'mane', name: 'Spines', tags: ['spiky'], dom: 0.5, w: 2, extra: [L('M-14,3 L-16,-8 M-7,2 L-8,-11 M0,1 L0,-13 M7,2 L8,-11 M14,3 L16,-8', 'pd', 2.6), L('M-14,3 L-16,-8 M0,1 L0,-13 M14,3 L16,-8', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
  wyPart({ id: 'feathers', slot: 'mane', name: 'Feathers', tags: ['plume'], dom: 0.5, w: 2, shapes: [{ d: leaf([-12, 3], [-20, -10], 3.5), f: 'a' }, { d: leaf([-4, 2], [-8, -13], 3.5), f: 'a' }, { d: leaf([4, 2], [6, -14], 3.5), f: 'a' }, { d: leaf([12, 3], [20, -10], 3.5), f: 'a' }], extra: [L('M-12,3 L-19,-8 M-4,2 L-7,-11 M4,2 L6,-12 M12,3 L19,-8', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
  wyPart({ id: 'frill', slot: 'mane', name: 'Frill', tags: ['wavy'], dom: 0.5, w: 2, shapes: [{ pts: [[-16, 3], [-12, -7, 'c'], [-6, -2], [-1, -12, 'c'], [4, -2], [10, -9, 'c'], [16, 3]], f: 'a' }], extra: [L('M-12,-4 L-10,2 M-1,-9 L-1,1 M10,-6 L9,2', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
  wyPart({ id: 'fins', slot: 'mane', name: 'Twin fins', tags: ['fin'], dom: 0.5, w: 2, shapes: [[[-16, 3], [-12, -10, 'c'], [-2, 2]], [[2, 2], [8, -11, 'c'], [16, 3]]], extra: [L('M-10,-6 L-8,1 M8,-7 L9,0', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
];

export const WY_PLATES = [
  NONE('plates', 0.3, 'w.'),
  wyPart({ id: 'scutes', slot: 'plates', name: 'Scutes', tags: ['plate'], dom: 0.5, w: 3, shapes: [{ pts: wyPlate(-12, 0, 6, 5), f: 'pd' }, { pts: wyPlate(0, -1, 7, 6), f: 'pd' }, { pts: wyPlate(12, 0, 6, 5), f: 'pd' }], extra: [HL('M-15,-1 L-13,-4 L-10,-4 L-13,-1 Z', 0.25), HL('M-3,-2 L-1,-6 L2,-6 L-1,-2 Z', 0.25)], stages: wyCrestStages }),
  wyPart({ id: 'shell', slot: 'plates', name: 'Shell', tags: ['plate'], dom: 0.5, w: 2, shapes: [{ pts: [[-14, 2], [-8, -6], [0, -8], [8, -6], [14, 2], [0, 5]], f: 'pd' }], extra: [L('M-8,-2 L8,-2 M-4,-5 L4,-5', 'k', 0.9, { op: 0.3 }), HL('M-11,0 C-8,-4 -4,-6 -1,-6 C-4,-4 -7,-2 -9,1 Z', 0.22)], stages: wyCrestStages }),
  wyPart({ id: 'ridges', slot: 'plates', name: 'Ridges', tags: ['lines'], dom: 0.5, w: 2, extra: [L('M-14,2 C-10,-3 -6,-3 -2,2 M-2,2 C2,-3 6,-3 10,2 M10,2 C12,-1 14,-1 16,2', 'pd', 3), L('M-14,2 C-10,-3 -6,-3 -2,2 M-2,2 C2,-3 6,-3 10,2', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
  wyPart({ id: 'scales', slot: 'plates', name: 'Scales', tags: ['overlap'], dom: 0.5, w: 2, extra: [...[[-12, 0], [-4, -1], [4, -1], [12, 0], [-8, 4], [0, 3], [8, 4]].map(([x, y]) => P(`M${x - 4},${y} A4,4 0 0 1 ${x + 4},${y} L${x + 3},${y + 3} L${x - 3},${y + 3} Z`, 'pd', { sw: 1 }))], stages: wyCrestStages }),
  wyPart({ id: 'gems', slot: 'plates', name: 'Gems', tags: ['crystal'], dom: 0.5, w: 2, extra: [...evoGem(-11, 0, 3), ...evoGem(0, -2, 4), ...evoGem(11, 0, 3)], stages: wyCrestStages }),
  wyPart({ id: 'spikes', slot: 'plates', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[-14, 2], [-11, -8, 'c'], [-8, 2]], [[-4, 2], [0, -11, 'c'], [4, 2]], [[8, 2], [11, -8, 'c'], [14, 2]]], extra: [HL('M-13,0 L-11,-6 L-10,-2 Z', 0.25), HL('M-3,0 L0,-8 L1,-3 Z', 0.25)], stages: wyCrestStages }),
  wyPart({ id: 'saddle', slot: 'plates', name: 'Saddle', tags: ['tack'], dom: 0.5, w: 2, shapes: [{ pts: [[-11, -2], [11, -2], [13, 4], [-13, 4]], f: 's' }], extra: [L('M-9,-1 L9,-1 M-9,2 L9,2', 'k', 0.8, { op: 0.3 }), C(-10, 1, 1, 'a', { ns: true }), C(10, 1, 1, 'a', { ns: true })], stages: wyCrestStages }),
];

export const WY_HORNS = [
  NONE('horns', 0.3, 'w.'),
  wyPart({ id: 'antler', slot: 'horns', name: 'Antlers', tags: ['branch'], dom: 0.5, w: 3, extra: [L('M-3,0 L-8,-12 M-8,-12 L-14,-16 M-8,-12 L-6,-20 M3,0 L8,-12 M8,-12 L14,-16 M8,-12 L6,-20', 'a', 3.2), L('M-3,0 L-8,-12 M3,0 L8,-12', 'k', 0.9, { op: 0.25 })], stages: wyCrestStages }),
  wyPart({ id: 'curved', slot: 'horns', name: 'Curved', tags: ['horn'], dom: 0.5, w: 2, shapes: [{ pts: tube([[-4, 0], [-9, -8], [-6, -18]], 5, 1.5, { tipK: 'c' }), f: 'a' }, { pts: tube([[4, 0], [9, -8], [6, -18]], 5, 1.5, { tipK: 'c' }), f: 'a' }], extra: [L('M-6,-4 L-8,-10 M6,-4 L8,-10', 'k', 0.8, { op: 0.3 })], stages: wyCrestStages }),
  wyPart({ id: 'straight', slot: 'horns', name: 'Straight', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-6, 1], [-10, -16, 'c'], [-2, 0]], [[2, 0], [8, -18, 'c'], [6, 1]]], extra: [HL('M-7,-2 L-9,-10 L-6,-4 Z', 0.25)], stages: wyCrestStages }),
  wyPart({ id: 'ram', slot: 'horns', name: 'Ram', tags: ['spiral'], dom: 0.5, w: 2, extra: [L(spiralPath(-8, -4, 7, 1.6, 180), 'a', 4), L(spiralPath(8, -4, 7, 1.6, 0), 'a', 4), L(spiralPath(-8, -4, 7, 1.6, 180), 'k', 0.9, { op: 0.25 }), L(spiralPath(8, -4, 7, 1.6, 0), 'k', 0.9, { op: 0.25 })], stages: wyCrestStages }),
  wyPart({ id: 'crest', slot: 'horns', name: 'Crest', tags: ['fan'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 0], ...fur([-10, 0], [10, 0], 5, 12, { tip: 'c' }), [10, 3], [-10, 3]], f: 'a' }], stages: wyCrestStages }),
  wyPart({ id: 'nubs', slot: 'horns', name: 'Nubs', tags: ['small'], dom: 0.5, w: 2, extra: [C(-6, -2, 3, 'pd', { sw: 1.2 }), C(6, -2, 3, 'pd', { sw: 1.2 }), C(-7, -3, 0.9, 'w', { ns: true, op: 0.6 }), C(5, -3, 0.9, 'w', { ns: true, op: 0.6 })], stages: wyCrestStages }),
  wyPart({ id: 'crown', slot: 'horns', name: 'Crown', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 2], [-10, -8], [-6, -3], [-2, -10], [2, -3], [6, -10], [10, -3], [10, 2]], f: 'a' }], extra: [C(-6, -1, 1, 'w', { ns: true, op: 0.7 }), C(0, -1, 1, 'w', { ns: true, op: 0.7 }), C(6, -1, 1, 'w', { ns: true, op: 0.7 })], stages: wyCrestStages }),
];
