// Flora leaves (origin = the leaf socket on the stem, reaching out and up like arms) and roots
// (origin = the root socket under the stem, reaching down like legs; their lowest point stands on the ground).
// Evolutions: leaves grow and put a second, darker leaf behind; roots grow and band.
import { flLeg, flPart } from './_shared.js';
import { L, C, P, HL, SH, tube, leaf, fur } from '../_dsl.js';
import { evoBands, evoRing } from '../_evo.js';

const flLeafStages = (a, b, bulge) => ({
  2: { grow: [1.1, 1.1] },
  3: { grow: [1.1, 1.1], addBehind: [{ d: leaf(a, b, bulge), f: 'pd' }] },
});
const flRootStages = (bandY) => ({
  2: { grow: [1.06, 1.08] },
  3: { reset: true, grow: [1.12, 1.16], add: [...evoBands(bandY, 2, 2.2, 5), evoRing(0, bandY - 4, 5, 'a', 1, { op: 0.5 })] },
});
const flVein = (d) => L(d, 'k', 1.2, { op: 0.35 });
const flFernPts = [[0, 0], ...fur([0, 0], [28, -12], 7, 5, { tip: 0.3, lean: 0.3 }).slice(0, -1), [28, -12, 'c'], ...fur([28, -12], [0, 0], 7, 5, { tip: 0.3, lean: 0.3 }).slice(0, -1)];

export const FL_LEAVES = [
  flPart({ id: 'broad', slot: 'leaves', name: 'Broad leaf', tags: ['leaf'], dom: 0.5, w: 3, shapes: [leaf([0, 0], [26, -14], 8)], extra: [flVein('M2,-1 L22,-12'), HL('M4,-6 C10,-11 16,-13 20,-13 C15,-10 9,-7 5,-4 Z', 0.18)], stages: flLeafStages([2, 2], [30, -10], 9) }),
  flPart({ id: 'fern', slot: 'leaves', name: 'Fern', tags: ['fern'], dom: 0.5, w: 2, shapes: [flFernPts], extra: [flVein('M1,0 L26,-11')], stages: flLeafStages([2, 3], [32, -8], 7) }),
  flPart({ id: 'needle', slot: 'leaves', name: 'Needles', tags: ['pine'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [14, -10], [26, -16]], 4, 2, { tipK: 'c' }), tube([[0, 0], [18, -4], [30, -6]], 4, 2, { tipK: 'c' }), tube([[0, 0], [14, 2], [26, 4]], 4, 2, { tipK: 'c' })], stages: flLeafStages([2, 1], [32, -2], 5) }),
  flPart({ id: 'frond', slot: 'leaves', name: 'Frond', tags: ['palm'], dom: 0.5, w: 2, shapes: [[[0, 0], [10, -8], [22, -14], [34, -16, 'c'], [30, -10, 'c'], [24, -6], [16, -2], [8, 2]]], extra: [flVein('M2,0 C12,-6 22,-10 32,-15'), L('M10,-6 L12,-2 M18,-10 L20,-6 M26,-13 L28,-9', 'k', 1, { op: 0.3 })], stages: flLeafStages([2, 2], [38, -12], 6) }),
  flPart({ id: 'maple', slot: 'leaves', name: 'Maple', tags: ['maple'], dom: 0.5, w: 2, shapes: [[[0, 0], [8, -6], [8, -14, 'c'], [14, -8], [22, -12, 'c'], [18, -4], [26, -2, 'c'], [18, 2], [20, 8, 'c'], [10, 4], [4, 8, 'c'], [2, 4]]], extra: [flVein('M2,0 L20,-4 M4,-2 L8,-12 M6,2 L18,6')], stages: flLeafStages([2, 2], [30, -4], 10) }),
  flPart({ id: 'blade', slot: 'leaves', name: 'Grass blade', tags: ['grass'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [6, -10], [10, -22], [12, -34]], 6, 2, { tipK: 'c' })], extra: [flVein('M1,-1 C5,-10 8,-20 11,-32')], stages: flLeafStages([1, 1], [16, -36], 4) }),
  flPart({ id: 'succulent', slot: 'leaves', name: 'Succulent', tags: ['fat'], dom: 0.5, w: 2, shapes: [leaf([0, 0], [20, -10], 10, 1)], extra: [HL('M3,-5 C7,-10 12,-12 16,-11 C12,-9 8,-6 5,-3 Z', 0.2), SH('M8,3 C12,4 16,2 19,-2 C17,2 13,5 9,5 Z', 0.14)], stages: flLeafStages([2, 2], [24, -6], 11) }),
];

export const FL_ROOTS = [
  flLeg({ id: 'taproot', slot: 'roots', name: 'Taproot', tags: ['root'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [2, 7], [0, 15]], 9, 3, { tipK: 'c' })], extra: [L('M-3,6 L-8,10 M3,8 L7,12', 'k', 1.4, { op: 0.5 })], stages: flRootStages(6) }),
  flLeg({ id: 'tangle', slot: 'roots', name: 'Tangle', tags: ['root'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-6, 7], [-9, 14]], 5, 2, { tipK: 'c' }), tube([[0, 0], [1, 8], [0, 16]], 5, 2, { tipK: 'c' }), tube([[0, 0], [7, 6], [10, 13]], 5, 2, { tipK: 'c' })], stages: flRootStages(6) }),
  flLeg({ id: 'stump', slot: 'roots', name: 'Stump foot', tags: ['treant'], dom: 0.55, w: 2, shapes: [[[-8, 0], [8, 0], [10, 10], [7, 15], [-7, 15], [-10, 10]]], extra: [L('M-4,15 L-4,11 M2,15 L2,11', 'k', 1.4, { op: 0.4 }), HL('M-8,0 L-3,0 L-4,12 L-8,10 Z', 0.13)], stages: flRootStages(7) }),
  flLeg({ id: 'hairy', slot: 'roots', name: 'Root hairs', tags: ['bulb'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [0, 10]], 10, 6, { tipK: 1 })], extra: [L('M-4,10 L-6,15 M-1,11 L-1,16 M2,11 L4,16 M-3,4 L-8,6 M3,5 L8,7', 'k', 1.2, { op: 0.5 })], stages: flRootStages(5) }),
  flLeg({ id: 'stilts', slot: 'roots', name: 'Stilt roots', tags: ['tall'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [1, 10], [0, 20]], 4, 3, { tipK: 1 }), [[-6, 18], [8, 18], [8, 22], [-6, 22]]], stages: flRootStages(8) }),
  flLeg({ id: 'knot', slot: 'roots', name: 'Knotted root', tags: ['gnarled'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-3, 5], [2, 10], [-1, 15]], 8, 4, { tipK: 'c' })], extra: [C(-2, 4, 2, 'pd', { sw: 1.2 }), C(2, 9, 1.8, 'pd', { sw: 1.2 })], stages: flRootStages(6) }),
  flLeg({ id: 'threads', slot: 'roots', name: 'Threads', tags: ['float'], dom: 0.35, w: 2, shapes: [tube([[0, 0], [1, 7]], 3, 1.5, { tipK: 1 }), tube([[-4, 0], [-6, 8]], 3, 1.5, { tipK: 1 }), tube([[4, 0], [6, 7]], 3, 1.5, { tipK: 1 })], stages: flRootStages(3) }),
];
