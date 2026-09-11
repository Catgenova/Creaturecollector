// Crystalline forelegs (origin = the shoulder), hind legs (origin = the hip) and tails (origin = the tail socket,
// trailing behind): angular stone limbs and crystal tails.
// Evolutions: legs grow and gain an accent band; tails grow and spike.
import { crLeg, crPart } from './_shared.js';
import { L, C, P } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const crLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [L('M-4,8 L4,8', 'a', 1.6, { ns: true, op: 0.7 })] } };
const crTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 8, 4, 'c'), f: 'a' }] } });
/** An angular leg segment from (x0,y0) to (x1,y1), w wide at the top and w1 at the foot. */
const crSeg = (x0, y0, x1, y1, w, w1 = w) => ({ pts: [[x0 - w / 2, y0, 'c'], [x0 + w / 2, y0, 'c'], [x1 + w1 / 2, y1, 'c'], [x1 - w1 / 2, y1, 'c']], f: 'p' });
const crEdge = (d) => L(d, 'k', 1, { op: 0.25 });
const crFoot = (x, y, w) => P(`M${x - w / 2},${y - 1} L${x + w / 2},${y - 1} L${x + w / 2 + 1},${y + 3} L${x - w / 2 - 1},${y + 3} Z`, 'pd', { sw: 1.2 });

export const CR_LEGS_FRONT = [
  crLeg({ id: 'block', slot: 'legsFront', name: 'Block', tags: ['square'], dom: 0.5, w: 3, shapes: [crSeg(0, 0, 0, 14, 8, 7)], extra: [crEdge('M-2,0 L-2,14'), crFoot(0, 14, 8)], stages: crLegStages }),
  crLeg({ id: 'column', slot: 'legsFront', name: 'Column', tags: ['tall'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, 0, 18, 6, 5)], extra: [crEdge('M-1,0 L-1,18 M-3,9 L3,9'), crFoot(0, 18, 6)], stages: crLegStages }),
  crLeg({ id: 'shard', slot: 'legsFront', name: 'Shard', tags: ['sharp'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, 0, 'c'], [4, 0, 'c'], [1, 16, 'c']], f: 'p' }], extra: [crEdge('M0,0 L1,14')], stages: crLegStages }),
  crLeg({ id: 'stubby', slot: 'legsFront', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, 0, 9, 8, 8)], extra: [crEdge('M-2,0 L-2,9'), crFoot(0, 9, 8)], stages: crLegStages }),
  crLeg({ id: 'split', slot: 'legsFront', name: 'Split', tags: ['fork'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, 0, 7, 8, 8), { pts: [[-4, 6, 'c'], [-1, 6, 'c'], [-3, 15, 'c']], f: 'p' }, { pts: [[1, 6, 'c'], [4, 6, 'c'], [4, 15, 'c']], f: 'p' }], extra: [crEdge('M-2,0 L-2,7')], stages: crLegStages }),
  crLeg({ id: 'tall', slot: 'legsFront', name: 'Tall', tags: ['thin'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, 1, 22, 5, 4)], extra: [crEdge('M-1,0 L0,22 M-2,11 L3,11'), crFoot(1, 22, 5)], stages: crLegStages }),
  crLeg({ id: 'crystal', slot: 'legsFront', name: 'Crystal', tags: ['faceted'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, 0, 'c'], [4, 0, 'c'], [5, 10, 'c'], [2, 16, 'c'], [-2, 16, 'c'], [-5, 10, 'c']], f: 'p' }], extra: [crEdge('M-1,0 L-1,16 M-5,10 L-1,8 L5,10'), C(0, 5, 1.2, 'a', { ns: true, op: 0.8 })], stages: crLegStages }),
];

export const CR_LEGS_BACK = [
  crLeg({ id: 'block', slot: 'legsBack', name: 'Block', tags: ['square'], dom: 0.5, w: 3, shapes: [crSeg(0, 0, -2, 14, 9, 7)], extra: [crEdge('M-3,0 L-4,14'), crFoot(-2, 14, 8)], stages: crLegStages }),
  crLeg({ id: 'column', slot: 'legsBack', name: 'Column', tags: ['tall'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, -1, 18, 7, 5)], extra: [crEdge('M-2,0 L-2,18 M-4,9 L2,9'), crFoot(-1, 18, 6)], stages: crLegStages }),
  crLeg({ id: 'shard', slot: 'legsBack', name: 'Shard', tags: ['sharp'], dom: 0.5, w: 2, shapes: [{ pts: [[-5, 0, 'c'], [4, 0, 'c'], [-2, 16, 'c']], f: 'p' }], extra: [crEdge('M-1,0 L-2,14')], stages: crLegStages }),
  crLeg({ id: 'stubby', slot: 'legsBack', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, -1, 9, 9, 8)], extra: [crEdge('M-3,0 L-3,9'), crFoot(-1, 9, 8)], stages: crLegStages }),
  crLeg({ id: 'split', slot: 'legsBack', name: 'Split', tags: ['fork'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, -1, 7, 9, 8), { pts: [[-5, 6, 'c'], [-2, 6, 'c'], [-5, 15, 'c']], f: 'p' }, { pts: [[0, 6, 'c'], [3, 6, 'c'], [2, 15, 'c']], f: 'p' }], extra: [crEdge('M-3,0 L-3,7')], stages: crLegStages }),
  crLeg({ id: 'tall', slot: 'legsBack', name: 'Tall', tags: ['thin'], dom: 0.5, w: 2, shapes: [crSeg(0, 0, -3, 22, 6, 4)], extra: [crEdge('M-2,0 L-4,22 M-4,11 L1,11'), crFoot(-3, 22, 5)], stages: crLegStages }),
  crLeg({ id: 'crystal', slot: 'legsBack', name: 'Crystal', tags: ['faceted'], dom: 0.5, w: 2, shapes: [{ pts: [[-5, 0, 'c'], [4, 0, 'c'], [4, 10, 'c'], [1, 16, 'c'], [-3, 16, 'c'], [-6, 10, 'c']], f: 'p' }], extra: [crEdge('M-2,0 L-2,16 M-6,10 L-2,8 L4,10'), C(-1, 5, 1.2, 'a', { ns: true, op: 0.8 })], stages: crLegStages }),
];

export const CR_TAILS = [
  crPart({ id: 'shard', slot: 'tail', name: 'Shard', tags: ['spike'], dom: 0.5, w: 3, shapes: [{ pts: [[0, -4, 'c'], [-22, -2, 'c'], [-30, 0, 'c'], [-22, 3, 'c'], [0, 4, 'c']], f: 'a' }], extra: [L('M-2,0 L-26,0', 'k', 0.9, { op: 0.25 })], stages: crTailStages(-22, -2) }),
  crPart({ id: 'cluster', slot: 'tail', name: 'Cluster', tags: ['spiky'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3, 'c'], [-20, -6, 'c'], [-12, -1, 'c'], [-26, 2, 'c'], [-14, 4, 'c'], [-20, 10, 'c'], [-6, 5, 'c'], [0, 4, 'c']], f: 'a' }], extra: [L('M-2,0 L-14,0', 'k', 0.9, { op: 0.25 })], stages: crTailStages(-18, -4) }),
  crPart({ id: 'club', slot: 'tail', name: 'Geode club', tags: ['heavy'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3, 'c'], [-10, -3, 'c'], [-14, -9, 'c'], [-24, -8, 'c'], [-28, 0, 'c'], [-24, 8, 'c'], [-14, 9, 'c'], [-10, 3, 'c'], [0, 3, 'c']], f: 'p' }], extra: [P('M-16,-4 L-22,-3 L-24,2 L-18,4 L-14,0 Z', 'k', { ns: true, cl: true, op: 0.4 }), P('M-20,-2 L-18,-5 L-16,-1 Z M-22,2 L-19,-1 L-17,3 Z', 'a', { ns: true, cl: true })], stages: crTailStages(-20, -8) }),
  crPart({ id: 'beads', slot: 'tail', name: 'Beads', tags: ['chain'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3, 'c'], [-8, -3, 'c'], [-8, 3, 'c'], [0, 3, 'c']], f: 'p' }, { pts: [[-9, -3, 'c'], [-13, -6, 'c'], [-17, -3, 'c'], [-13, 0, 'c']], f: 'a' }, { pts: [[-18, -1, 'c'], [-22, -4, 'c'], [-26, -1, 'c'], [-22, 2, 'c']], f: 'a' }, { pts: [[-26, 2, 'c'], [-29, -1, 'c'], [-32, 2, 'c'], [-29, 5, 'c']], f: 'a' }], stages: crTailStages(-28, 0) }),
  crPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -4, 'c'], [-8, -3, 'c'], [-11, 0, 'c'], [-8, 4, 'c'], [0, 4, 'c']], f: 'p' }], extra: [C(-6, 0, 1.2, 'a', { ns: true, op: 0.8 })], stages: crTailStages(-9, -2) }),
  crPart({ id: 'fan', slot: 'tail', name: 'Fan', tags: ['fan'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3, 'c'], [-16, -14, 'c'], [-12, -4, 'c'], [-26, -2, 'c'], [-12, 2, 'c'], [-18, 12, 'c'], [-6, 4, 'c'], [0, 3, 'c']], f: 'a' }], extra: [L('M-2,0 L-14,-12 M-2,0 L-24,-2 M-2,0 L-16,10', 'k', 0.9, { op: 0.25 })], stages: crTailStages(-14, -12) }),
  crPart({ id: 'spike', slot: 'tail', name: 'Spike', tags: ['long'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3, 'c'], [-14, -3, 'c'], [-36, -8, 'c'], [-14, 2, 'c'], [0, 3, 'c']], f: 'p' }], extra: [L('M-2,0 L-30,-5', 'k', 0.9, { op: 0.25 }), P('M-34,-8 L-24,-6 L-26,-3 Z', 'a', { ns: true, cl: true })], stages: crTailStages(-30, -6) }),
];
