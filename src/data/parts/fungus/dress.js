// Fungus rings (the annulus around the stalk, origin = the ring socket), shelves (bracket fungi growing from the
// stalk's side, origin = the shelf socket, reaching right) and veils (a short fringe hanging from the cap's rim,
// origin = the veil socket, drawn over the stalk).
// Evolutions: rings grow with the face family; shelves and veils grow.
import { fgPart } from './_shared.js';
import { NONE, L, C, P, HL, fur, leaf } from '../_dsl.js';

const fgDressStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.12, 1.12] } };
const fgSkirt = (w, d) => [[-w, 0], [w, 0], [w * 0.85, d * 0.7], [0, d], [-w * 0.85, d * 0.7]];
const fgBracket = (x, y, w, h) => [[x, y - h * 0.4], [x + w * 0.5, y - h], [x + w, y - h * 0.3], [x + w * 0.9, y + h * 0.4], [x + w * 0.4, y + h * 0.6], [x, y + h * 0.4]];

export const FG_RINGS = [
  NONE('ring', 0.3, 'g.'),
  fgPart({ id: 'skirt', slot: 'ring', name: 'Skirt', tags: ['ring'], dom: 0.5, w: 3, shapes: [{ pts: fgSkirt(16, 7), f: 'pd' }], extra: [HL('M-14,1 C-10,0 -4,0 0,1 C-4,2 -8,3 -12,3 Z', 0.2)], stages: fgDressStages }),
  fgPart({ id: 'band', slot: 'ring', name: 'Band', tags: ['thin'], dom: 0.5, w: 2, shapes: [[[-13, 0], [13, 0], [13, 3.5], [0, 4.5], [-13, 3.5]]], extra: [L('M-11,2 L11,2', 'k', 0.8, { op: 0.25 })], stages: fgDressStages }),
  fgPart({ id: 'frill', slot: 'ring', name: 'Frill', tags: ['wavy'], dom: 0.5, w: 2, shapes: [{ pts: [[16, 0], ...fur([16, 0], [-16, 0], 6, 5, { tip: 0.6 }), [-16, -1], [16, -1]], f: 'pd' }], stages: fgDressStages }),
  fgPart({ id: 'collar', slot: 'ring', name: 'Collar', tags: ['upturned'], dom: 0.5, w: 2, shapes: [[[-15, 2], [-14, -6], [-10, -2], [0, -1], [10, -2], [14, -6], [15, 2], [0, 4]]], extra: [HL('M-13,-4 C-11,-2 -8,-1 -5,-1 C-8,0 -11,0 -13,1 Z', 0.2)], stages: fgDressStages }),
  fgPart({ id: 'double', slot: 'ring', name: 'Double ring', tags: ['two'], dom: 0.5, w: 2, shapes: [{ pts: fgSkirt(15, 5), f: 'pd' }, { pts: fgSkirt(14, 5).map(([x, y]) => [x, y + 6]), f: 'pd' }], stages: fgDressStages }),
  fgPart({ id: 'torn', slot: 'ring', name: 'Torn ring', tags: ['ragged'], dom: 0.5, w: 2, shapes: [[[-16, 0], [-4, 0], [-3, 5], [-7, 3], [-10, 7], [-13, 3], [-16, 5]], [[4, 0], [16, 0], [16, 4], [12, 7], [9, 3], [5, 6]]], stages: fgDressStages }),
  fgPart({ id: 'cuff', slot: 'ring', name: 'Cuff', tags: ['thick'], dom: 0.5, w: 2, shapes: [[[-15, 0], [15, 0], [16, 6], [0, 8], [-16, 6]]], extra: [L('M-13,3 L13,3', 'k', 1, { op: 0.25 }), HL('M-13,1 C-9,0 -4,0 -1,1 C-4,2 -8,2 -12,3 Z', 0.18)], stages: fgDressStages }),
];

export const FG_SHELVES = [
  NONE('shelves', 0.3, 'g.'),
  fgPart({ id: 'bracket', slot: 'shelves', name: 'Bracket', tags: ['shelf'], dom: 0.5, w: 3, shapes: [fgBracket(0, 0, 16, 6)], extra: [L('M3,3 L13,2', 'k', 0.9, { op: 0.3 }), HL('M2,-2 C6,-5 10,-5 13,-3 C9,-3 5,-2 3,0 Z', 0.2)], stages: fgDressStages }),
  fgPart({ id: 'stack', slot: 'shelves', name: 'Stack', tags: ['many'], dom: 0.5, w: 2, shapes: [fgBracket(0, -6, 12, 4), fgBracket(0, 1, 14, 4.5), fgBracket(0, 8, 11, 4)], extra: [L('M2,-5 L10,-5 M2,2 L12,2 M2,9 L9,9', 'k', 0.8, { op: 0.3 })], stages: fgDressStages }),
  fgPart({ id: 'ears', slot: 'shelves', name: 'Ears', tags: ['ear'], dom: 0.5, w: 2, shapes: [{ d: leaf([0, 0], [14, -8], 6, 1), f: 'p' }, { d: leaf([0, 4], [12, 10], 5, 1), f: 'p' }], extra: [L('M2,0 L11,-6 M2,5 L9,9', 'k', 0.9, { op: 0.3 })], stages: fgDressStages }),
  fgPart({ id: 'shelf', slot: 'shelves', name: 'Flat shelf', tags: ['flat'], dom: 0.5, w: 2, shapes: [[[0, -2], [18, -3], [20, 0], [18, 3], [0, 3]]], extra: [L('M2,0 L17,0', 'k', 0.9, { op: 0.25 }), HL('M2,-1.5 L14,-2 L12,-0.5 L2,-0.5 Z', 0.2)], stages: fgDressStages }),
  fgPart({ id: 'cups', slot: 'shelves', name: 'Cups', tags: ['cup'], dom: 0.5, w: 2, extra: [P('M1,-5 C1,-9 9,-9 9,-5 C9,-2 6,0 5,0 C4,0 1,-2 1,-5 Z', 'p', { sw: 1.2 }), C(5, -5.5, 2.4, 'a', { ns: true, op: 0.6 }), P('M3,3 C3,0 10,0 10,3 C10,5.5 7.6,7 6.5,7 C5.4,7 3,5.5 3,3 Z', 'p', { sw: 1.2 }), C(6.5, 2.6, 2, 'a', { ns: true, op: 0.6 })], stages: fgDressStages }),
  fgPart({ id: 'buttons', slot: 'shelves', name: 'Buttons', tags: ['mini'], dom: 0.5, w: 2, extra: [L('M4,4 L4,-2 M11,6 L11,1', 'w', 2.4), P('M-1,-2 C0,-7 8,-7 9,-2 Z', 'a', { sw: 1.2 }), P('M7,1 C8,-3 14,-3 15,1 Z', 'a', { sw: 1.2 }), C(2, -4, 0.8, 'w', { ns: true, op: 0.8 }), C(9.4, -0.6, 0.6, 'w', { ns: true, op: 0.8 })], stages: fgDressStages }),
  fgPart({ id: 'coral', slot: 'shelves', name: 'Coral', tags: ['branch'], dom: 0.5, w: 2, extra: [L('M0,2 L8,-2 M8,-2 L12,-8 M8,-2 L14,-3 M0,4 L9,6 M9,6 L13,3 M9,6 L14,10', 'p', 3), L('M0,2 L8,-2 M0,4 L9,6', 'k', 0.9, { op: 0.25 }), C(12, -8, 1.6, 'a', { ns: true }), C(14, -3, 1.4, 'a', { ns: true }), C(13, 3, 1.4, 'a', { ns: true }), C(14, 10, 1.6, 'a', { ns: true })], stages: fgDressStages }),
];

export const FG_VEILS = [
  NONE('veil', 0.3, 'g.'),
  fgPart({ id: 'fringe', slot: 'veil', name: 'Fringe', tags: ['tassels'], dom: 0.5, w: 3, shapes: [{ pts: [[22, 0], ...fur([22, 0], [-22, 0], 9, 6, { tip: 0.5 }), [-22, -1], [22, -1]], f: 's' }], stages: fgDressStages }),
  fgPart({ id: 'tatters', slot: 'veil', name: 'Tatters', tags: ['ragged'], dom: 0.5, w: 2, shapes: [[[-22, 0], [-16, 0], [-15, 7], [-18, 4], [-21, 8]], [[-8, 0], [-2, 0], [-1, 9], [-4, 5], [-7, 8]], [[8, 0], [15, 0], [15, 6], [12, 9], [10, 4]], [[18, 0], [23, 0], [23, 7], [20, 5]]], stages: fgDressStages }),
  fgPart({ id: 'lace', slot: 'veil', name: 'Lace', tags: ['net'], dom: 0.5, w: 2, shapes: [{ pts: [[-22, 0], [22, 0], [20, 6], [0, 9], [-20, 6]], f: 'sl' }], extra: [L('M-18,1 L-14,6 L-10,1 L-6,7 L-2,1 L2,7 L6,1 L10,7 L14,1 L18,5', 'k', 0.8, { op: 0.3 })], stages: fgDressStages }),
  fgPart({ id: 'cobweb', slot: 'veil', name: 'Cobweb', tags: ['thread'], dom: 0.45, w: 2, extra: [L('M-20,0 C-18,4 -14,7 -10,8 M-10,0 C-9,5 -6,8 -2,9 M4,0 C5,5 8,8 12,8 M14,0 C15,4 18,6 22,6 M-20,0 L-19,10 M0,0 L0,11 M14,0 L16,10', 'sl', 1.2, { op: 0.8 })], stages: fgDressStages }),
  fgPart({ id: 'scallop', slot: 'veil', name: 'Scallop', tags: ['wavy'], dom: 0.5, w: 2, shapes: [[[-22, 0], [22, 0], [20, 4, 'c'], [16, 6], [10, 4, 'c'], [6, 7], [0, 5, 'c'], [-6, 7], [-10, 4, 'c'], [-16, 6], [-20, 4, 'c']]], extra: [L('M-16,4 L-16,1 M-6,5 L-6,1 M6,5 L6,1 M16,4 L16,1', 'k', 0.8, { op: 0.25 })], stages: fgDressStages }),
  fgPart({ id: 'curtain', slot: 'veil', name: 'Curtain', tags: ['long'], dom: 0.5, w: 2, shapes: [{ pts: [[-20, 0], [20, 0], [19, 8], [17, 11], [15, 8], [-15, 8], [-17, 11], [-19, 8]], f: 's' }], extra: [L('M-12,1 L-12,7 M0,1 L0,7 M12,1 L12,7', 'k', 0.8, { op: 0.2 })], stages: fgDressStages }),
  fgPart({ id: 'beads', slot: 'veil', name: 'Beaded', tags: ['drops'], dom: 0.45, w: 2, extra: [L('M-20,0 L-20,5 M-10,0 L-10,7 M0,0 L0,6 M10,0 L10,8 M20,0 L20,5', 'sd', 1.2), C(-20, 6, 1.6, 'a', { sw: 1 }), C(-10, 8.4, 1.6, 'a', { sw: 1 }), C(0, 7.4, 1.6, 'a', { sw: 1 }), C(10, 9.4, 1.6, 'a', { sw: 1 }), C(20, 6, 1.6, 'a', { sw: 1 })], stages: fgDressStages }),
];
