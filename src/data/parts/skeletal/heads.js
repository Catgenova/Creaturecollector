// Skeletal heads (skulls). Origin = the neck point at the back; the snout reaches right. Dark sockets are drawn
// on the skull and the grave lights sit in them. Sockets: eye / eyeFar, jaw (under the snout), horns (the brow).
// Evolutions: stage 2 raises a brow ridge; stage 3 adds cheek spurs.
import { skPart } from './_shared.js';
import { C, E, L, HL } from '../_dsl.js';
import { evoBrowPlate, evoSpike } from '../_evo.js';

const skHeadStages = {
  2: { grow: [1.05, 1.05], add: [...evoBrowPlate(6, -13, 4)] },
  3: { grow: [1.05, 1.06], addShapes: [{ pts: evoSpike(-2, -3, 178, 8, 4), f: 'p' }, { pts: evoSpike(0, 3, 190, 7, 4), f: 'p' }], add: [...evoBrowPlate(6, -13, 4.6)] },
};
const skHeadSockets = (o = {}) => ({ eye: { x: 8, y: -7, s: 1 }, eyeFar: { x: 0, y: -8, s: 0.9 }, jaw: { x: 16, y: 3, a: 0, s: 1 }, horns: { x: 2, y: -14, a: 0, s: 1 }, ...o });
const skEyeSockets = (x, y, rx = 4.4, ry = 3.8) => [E(x, y, rx, ry, 'k', { ns: true, op: 0.85 }), E(x - 8, y - 1, rx * 0.8, ry * 0.8, 'k', { ns: true, op: 0.7 })];
const skNose = (x, y) => C(x, y, 1.6, 'k', { ns: true, op: 0.7 });

export const SK_HEADS = [
  skPart({ id: 'canine', slot: 'head', name: 'Canine', tags: ['long'], dom: 0.5, w: 3, shapes: [[[-4, -12], [8, -16], [18, -13], [28, -6], [30, 0], [22, 4], [12, 7], [4, 8], [-4, 6]]], extra: [...skEyeSockets(8, -7), skNose(26, -3), L('M12,2 L20,3', 'k', 1, { op: 0.35 }), HL('M-2,-11 C2,-14 8,-15 12,-13 C8,-12 2,-10 -2,-8 Z', 0.2)], sockets: skHeadSockets(), stages: skHeadStages }),
  skPart({ id: 'feline', slot: 'head', name: 'Feline', tags: ['round'], dom: 0.5, w: 2, shapes: [[[-4, -13], [6, -17], [16, -15], [23, -7], [23, 2], [16, 8], [6, 10], [-4, 7]]], extra: [...skEyeSockets(7, -7, 4.8, 4.2), skNose(20, -2), HL('M-2,-12 C2,-15 8,-15 12,-14 C8,-12 2,-10 -2,-8 Z', 0.2)], sockets: skHeadSockets({ jaw: { x: 14, y: 4, a: 0, s: 1 } }), stages: skHeadStages }),
  skPart({ id: 'beaked', slot: 'head', name: 'Beaked', tags: ['bird'], dom: 0.5, w: 2, shapes: [[[-4, -12], [6, -16], [16, -13], [24, -8], [34, -3], [24, 1], [14, 6], [4, 8], [-4, 6]]], extra: [...skEyeSockets(7, -7), L('M18,-5 L30,-3', 'k', 1, { op: 0.35 }), HL('M-2,-11 C2,-14 8,-15 12,-13 C8,-12 2,-10 -2,-8 Z', 0.2)], sockets: skHeadSockets({ jaw: { x: 18, y: 1, a: 0, s: 1 } }), stages: skHeadStages }),
  skPart({ id: 'serpent', slot: 'head', name: 'Serpent', tags: ['flat'], dom: 0.5, w: 2, shapes: [[[-4, -9], [6, -12], [18, -11], [28, -6], [30, 0], [24, 4], [12, 6], [2, 7], [-4, 5]]], extra: [...skEyeSockets(8, -5, 4, 3.4), skNose(26, -3), HL('M-2,-8 C2,-11 8,-11 12,-10 C8,-9 2,-7 -2,-5 Z', 0.2)], sockets: skHeadSockets({ eye: { x: 8, y: -5, s: 1 }, eyeFar: { x: 0, y: -6, s: 0.9 }, jaw: { x: 18, y: 3, a: 0, s: 1 }, horns: { x: 2, y: -11, a: 0, s: 1 } }), stages: skHeadStages }),
  skPart({ id: 'ram', slot: 'head', name: 'Ram', tags: ['broad'], dom: 0.5, w: 2, shapes: [[[-4, -14], [8, -18], [20, -14], [26, -6], [26, 2], [20, 8], [8, 10], [-4, 8]]], extra: [...skEyeSockets(8, -8, 4.6, 4), skNose(23, -1), L('M-2,-14 C4,-20 14,-20 20,-14', 'k', 1.2, { op: 0.3 }), HL('M-2,-13 C2,-16 8,-17 12,-15 C8,-13 2,-11 -2,-9 Z', 0.2)], sockets: skHeadSockets({ jaw: { x: 16, y: 4, a: 0, s: 1 }, horns: { x: 4, y: -17, a: 0, s: 1 } }), stages: skHeadStages }),
  skPart({ id: 'fish', slot: 'head', name: 'Fish', tags: ['fish'], dom: 0.5, w: 2, shapes: [[[-4, -10], [6, -14], [18, -13], [28, -8], [32, -2], [26, 4], [14, 7], [2, 8], [-4, 6]]], extra: [...skEyeSockets(10, -7, 5, 4.4), L('M14,-1 L26,0 M4,-12 L2,6', 'k', 1, { op: 0.3 }), HL('M-2,-9 C2,-12 8,-13 12,-12 C8,-10 2,-8 -2,-6 Z', 0.2)], sockets: skHeadSockets({ eye: { x: 10, y: -7, s: 1.05 }, eyeFar: { x: 2, y: -8, s: 0.95 }, jaw: { x: 18, y: 3, a: 0, s: 1 } }), stages: skHeadStages }),
  skPart({ id: 'brute', slot: 'head', name: 'Brute', tags: ['heavy'], dom: 0.55, w: 2, shapes: [[[-4, -14], [8, -18], [22, -16], [30, -8], [30, 2], [24, 8], [10, 11], [-4, 8]]], extra: [...skEyeSockets(9, -8, 5, 4.4), skNose(27, -3), L('M12,3 L24,4', 'k', 1, { op: 0.35 }), L('M4,-16 L6,-8 M18,-16 L18,-9', 'k', 1, { op: 0.25 }), HL('M-2,-13 C2,-16 8,-17 12,-15 C8,-13 2,-11 -2,-9 Z', 0.2)], sockets: skHeadSockets({ eye: { x: 9, y: -8, s: 1.05 }, eyeFar: { x: 1, y: -9, s: 0.95 }, jaw: { x: 18, y: 5, a: 0, s: 1 }, horns: { x: 4, y: -17, a: 0, s: 1 } }), stages: skHeadStages }),
];
