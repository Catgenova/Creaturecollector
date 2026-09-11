// Crystalline heads (faceted). Origin = the neck point at the back; the face reaches right. Sockets: eye / eyeFar,
// mouth (the front), crown (the brow).
// Evolutions: stage 2 lights a brow facet; stage 3 grows a brow crystal and streaks the cheek.
import { crPart } from './_shared.js';
import { L, HL, PATCH } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const crHeadStages = {
  2: { grow: [1.05, 1.05], add: [PATCH('M2,-14 L10,-16 L8,-9 Z', 'a')] },
  3: { grow: [1.05, 1.06], addShapes: [{ pts: evoSpike(6, -14, -95, 10, 5, 'c'), f: 'pd' }], add: [PATCH('M2,-14 L10,-16 L8,-9 Z', 'a'), L('M14,-8 L20,-12 M16,-4 L23,-7', 'a', 1.4, { ns: true })] },
};
const crHeadSockets = (o = {}) => ({ eye: { x: 9, y: -6, s: 1 }, eyeFar: { x: 1, y: -7, s: 0.9 }, mouth: { x: 18, y: 2, a: 0, s: 1 }, crown: { x: 4, y: -15, a: 0, s: 1 }, ...o });
const crEdges = (d) => L(d, 'k', 1, { op: 0.22 });

export const CR_HEADS = [
  crPart({ id: 'wedge', slot: 'head', name: 'Wedge', tags: ['sharp'], dom: 0.5, w: 3, shapes: [[[-4, -12, 'c'], [8, -16, 'c'], [22, -10, 'c'], [30, 0, 'c'], [20, 6, 'c'], [6, 8, 'c'], [-4, 6, 'c']]], extra: [crEdges('M8,-16 L10,-4 L30,0 M10,-4 L6,8 M10,-4 L-4,-12'), HL('M-4,-12 L8,-16 L10,-4 Z', 0.22)], sockets: crHeadSockets({ mouth: { x: 24, y: 2, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'cube', slot: 'head', name: 'Block', tags: ['blocky'], dom: 0.55, w: 2, shapes: [[[-4, -14, 'c'], [18, -16, 'c'], [22, 4, 'c'], [18, 8, 'c'], [-4, 8, 'c']]], extra: [crEdges('M-4,-14 L4,-8 L18,-16 M4,-8 L4,8 M4,-8 L22,4'), HL('M-4,-14 L18,-16 L4,-8 Z', 0.2)], sockets: crHeadSockets({ eye: { x: 10, y: -6, s: 1 }, mouth: { x: 18, y: 3, a: 0, s: 1 }, crown: { x: 6, y: -16, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'gem', slot: 'head', name: 'Gem', tags: ['faceted'], dom: 0.5, w: 2, shapes: [[[-4, -10, 'c'], [4, -16, 'c'], [14, -16, 'c'], [24, -8, 'c'], [22, 4, 'c'], [12, 10, 'c'], [2, 10, 'c'], [-4, 4, 'c']]], extra: [crEdges('M4,-16 L8,-4 L14,-16 M8,-4 L24,-8 M8,-4 L2,10 M8,-4 L-4,-10'), HL('M-4,-10 L4,-16 L8,-4 Z', 0.22)], sockets: crHeadSockets({ mouth: { x: 18, y: 4, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'spike', slot: 'head', name: 'Spike', tags: ['long'], dom: 0.5, w: 2, shapes: [[[-4, -12, 'c'], [6, -16, 'c'], [16, -12, 'c'], [34, -4, 'c'], [18, 4, 'c'], [8, 8, 'c'], [-4, 6, 'c']]], extra: [crEdges('M6,-16 L8,-4 L16,-12 M8,-4 L34,-4 M8,-4 L8,8 M8,-4 L-4,-12'), HL('M-4,-12 L6,-16 L8,-4 Z', 0.22)], sockets: crHeadSockets({ eye: { x: 8, y: -7, s: 1 }, mouth: { x: 26, y: -1, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'dome', slot: 'head', name: 'Dome', tags: ['round'], dom: 0.5, w: 2, shapes: [[[-4, -12, 0.8], [6, -17, 0.8], [16, -15, 0.8], [23, -6, 0.8], [22, 4, 0.8], [14, 9, 0.8], [2, 9, 0.8], [-4, 5, 0.8]]], extra: [crEdges('M6,-17 L8,-5 L16,-15 M8,-5 L22,4 M8,-5 L2,9'), HL('M-4,-12 L6,-17 L8,-5 Z', 0.22)], sockets: crHeadSockets({ mouth: { x: 18, y: 4, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'prism', slot: 'head', name: 'Prism', tags: ['tall'], dom: 0.5, w: 2, shapes: [[[-4, -16, 'c'], [8, -20, 'c'], [18, -14, 'c'], [22, 0, 'c'], [16, 8, 'c'], [4, 10, 'c'], [-4, 6, 'c']]], extra: [crEdges('M8,-20 L8,-6 L18,-14 M8,-6 L22,0 M8,-6 L4,10 M8,-6 L-4,-16'), HL('M-4,-16 L8,-20 L8,-6 Z', 0.22)], sockets: crHeadSockets({ eye: { x: 10, y: -8, s: 1 }, eyeFar: { x: 2, y: -9, s: 0.9 }, mouth: { x: 18, y: 3, a: 0, s: 1 }, crown: { x: 4, y: -19, a: 0, s: 1 } }), stages: crHeadStages }),
  crPart({ id: 'cluster', slot: 'head', name: 'Cluster', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[-4, -10, 'c'], [2, -18, 'c'], [8, -12, 'c'], [14, -20, 'c'], [20, -10, 'c'], [26, -2, 'c'], [18, 6, 'c'], [6, 9, 'c'], [-4, 6, 'c']]], extra: [crEdges('M2,-18 L6,-4 L14,-20 M6,-4 L26,-2 M6,-4 L6,9 M6,-4 L-4,-10'), HL('M-4,-10 L2,-18 L6,-4 Z', 0.22)], sockets: crHeadSockets({ eye: { x: 10, y: -5, s: 1 }, eyeFar: { x: 2, y: -6, s: 0.9 }, mouth: { x: 20, y: 3, a: 0, s: 1 }, crown: { x: 8, y: -16, a: 0, s: 1 } }), stages: crHeadStages }),
];
