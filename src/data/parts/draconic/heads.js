// Draconic heads. Origin = the neck point at the back; the snout reaches right. Sockets: eye / eyeFar, jaw (under
// the snout), horns (the brow, drawn behind), breath (the snout tip, in front).
// Evolutions: stage 2 raises a brow plate; stage 3 adds cheek spikes and a bigger plate.
import { drPart } from './_shared.js';
import { C, L, HL } from '../_dsl.js';
import { evoBrowPlate, evoSpike, evoRing } from '../_evo.js';

const drHeadStages = {
  2: { grow: [1.05, 1.05], add: [...evoBrowPlate(6, -13, 4.2)] },
  3: { grow: [1.05, 1.06], addShapes: [{ pts: evoSpike(-2, -4, 175, 8, 4), f: 'a' }, { pts: evoSpike(-2, 2, 185, 7, 4), f: 'a' }], add: [...evoBrowPlate(6, -13, 4.8), evoRing(14, -2, 4, 'a', 1, { op: 0.5 })] },
};
const drHeadSockets = (o = {}) => ({ eye: { x: 8, y: -8, s: 1 }, eyeFar: { x: 0, y: -9, s: 0.9 }, jaw: { x: 16, y: 2, a: 0, s: 1 }, horns: { x: 2, y: -14, a: 0, s: 1 }, breath: { x: 26, y: -2, a: 0, s: 1 }, ...o });
const drBrow = HL('M-2,-11 C2,-14 8,-14 12,-12 C8,-11 2,-10 -2,-8 Z', 0.2);

export const DR_HEADS = [
  drPart({ id: 'classic', slot: 'head', name: 'Classic', tags: ['dragon'], dom: 0.5, w: 3, shapes: [[[-4, -12], [8, -16], [20, -12], [28, -5], [30, 1], [22, 5], [14, 9], [4, 10], [-4, 7]]], extra: [drBrow, C(25, -3, 1, 'k', { ns: true, op: 0.6 }), L('M10,-14 L18,-11', 'k', 1.2, { op: 0.3 })], sockets: drHeadSockets(), stages: drHeadStages }),
  drPart({ id: 'blunt', slot: 'head', name: 'Blunt', tags: ['bulldog'], dom: 0.5, w: 2, shapes: [[[-4, -13], [8, -17], [18, -14], [24, -6], [25, 3], [18, 9], [6, 11], [-4, 8]]], extra: [drBrow, C(21, -4, 1.1, 'k', { ns: true, op: 0.6 })], sockets: drHeadSockets({ jaw: { x: 15, y: 4, a: 0, s: 1 }, breath: { x: 23, y: 0, a: 0, s: 1 } }), stages: drHeadStages }),
  drPart({ id: 'crested', slot: 'head', name: 'Crested', tags: ['crest'], dom: 0.5, w: 2, shapes: [{ pts: [[-2, -14], [-10, -24, 'c'], [2, -18], [-2, -30, 'c'], [8, -18], [10, -26, 'c'], [12, -14]], f: 'a' }, [[-4, -12], [8, -16], [20, -12], [28, -5], [30, 1], [22, 5], [14, 9], [4, 10], [-4, 7]]], extra: [drBrow, C(25, -3, 1, 'k', { ns: true, op: 0.6 })], sockets: drHeadSockets(), stages: drHeadStages }),
  drPart({ id: 'narrow', slot: 'head', name: 'Needle', tags: ['narrow'], dom: 0.5, w: 2, shapes: [[[-4, -10], [8, -13], [22, -9], [34, -4], [34, 0], [22, 3], [12, 7], [4, 8], [-4, 6]]], extra: [HL('M-2,-9 C2,-11 8,-11 12,-10 C8,-9 2,-8 -2,-6 Z', 0.2), L('M22,-6 L30,-3', 'k', 1, { op: 0.3 })], sockets: drHeadSockets({ eye: { x: 8, y: -6, s: 1 }, eyeFar: { x: 0, y: -7, s: 0.9 }, jaw: { x: 18, y: 1, a: 0, s: 1 }, horns: { x: 2, y: -12, a: 0, s: 1 }, breath: { x: 32, y: -2, a: 0, s: 1 } }), stages: drHeadStages }),
  drPart({ id: 'frilled', slot: 'head', name: 'Frilled', tags: ['frill'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, -10], [-16, -18, 'c'], [-8, -8], [-18, -2, 'c'], [-8, 0], [-16, 10, 'c'], [-4, 6]], f: 'a' }, [[-4, -12], [8, -16], [20, -12], [28, -5], [30, 1], [22, 5], [14, 9], [4, 10], [-4, 7]]], extra: [drBrow, C(25, -3, 1, 'k', { ns: true, op: 0.6 })], sockets: drHeadSockets(), stages: drHeadStages }),
  drPart({ id: 'croc', slot: 'head', name: 'Crocodile', tags: ['flat', 'long'], dom: 0.5, w: 2, shapes: [[[-4, -10], [6, -13], [18, -12], [32, -8], [36, -3], [34, 2], [22, 5], [10, 8], [2, 9], [-4, 6]]], extra: [HL('M-2,-9 C2,-12 8,-12 12,-11 C8,-10 2,-9 -2,-6 Z', 0.2), L('M20,-3 L32,-2', 'k', 1.2, { op: 0.3 }), C(31, -5, 1, 'k', { ns: true, op: 0.6 })], sockets: drHeadSockets({ eye: { x: 8, y: -7, s: 1 }, eyeFar: { x: 0, y: -8, s: 0.9 }, jaw: { x: 20, y: 2, a: 0, s: 1 }, horns: { x: 2, y: -12, a: 0, s: 1 }, breath: { x: 34, y: -2, a: 0, s: 1 } }), stages: drHeadStages }),
  drPart({ id: 'round', slot: 'head', name: 'Round', tags: ['cute'], dom: 0.5, w: 2, shapes: [[[-4, -12], [6, -18], [18, -17], [26, -8], [26, 2], [18, 9], [6, 11], [-4, 8]]], extra: [drBrow, C(22, -5, 1.1, 'k', { ns: true, op: 0.6 }), C(23, -1, 0.9, 'k', { ns: true, op: 0.5 })], sockets: drHeadSockets({ eye: { x: 9, y: -8, s: 1.05 }, eyeFar: { x: 0, y: -9, s: 0.95 }, jaw: { x: 15, y: 3, a: 0, s: 1 }, breath: { x: 25, y: -1, a: 0, s: 1 } }), stages: drHeadStages }),
];
