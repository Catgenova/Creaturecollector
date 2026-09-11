// Spirit hoods (what sits on the crown of the shroud, in front of it and behind the eyes), chains (hanging low on
// the shroud, behind it) and tatters (cloth trailing from the lower shroud, behind it).
// Evolutions: all grow.
import { spPart } from './_shared.js';
import { NONE, L, C, P, fur, spline, puff } from '../_dsl.js';
import { flamePath } from '../_sigils.js';

const spGrowDress = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };

export const SP_HOODS = [
  NONE('hood', 0.3, 's.'),
  spPart({ id: 'cowl', slot: 'hood', name: 'Cowl', tags: ['hood'], dom: 0.5, w: 3, shapes: [{ pts: [[-14, 8], [-14, -4], [-8, -12], [0, -14], [8, -12], [14, -4], [14, 8], [10, 2], [6, -4, 0.6], [0, -6], [-6, -4, 0.6], [-10, 2]], f: 'pd' }], extra: [L('M-12,-2 C-8,-9 -2,-12 0,-12', 'k', 1, { op: 0.25 })], stages: spGrowDress }),
  spPart({ id: 'hat', slot: 'hood', name: 'Pointed hat', tags: ['witch'], dom: 0.5, w: 2, shapes: [{ pts: [[-16, 2], [16, 2], [16, 5], [-16, 5]], f: 'pd' }, { pts: [[-9, 3], [-4, -12], [4, -28, 'c'], [6, -12], [9, 3]], f: 'pd' }], extra: [L('M-9,-1 L9,-1', 'a', 1.6, { ns: true, op: 0.8 }), C(0, -1, 1.4, 'a', { ns: true })], stages: spGrowDress }),
  spPart({ id: 'crown', slot: 'hood', name: 'Circlet', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 2], ...fur([-10, 2], [10, 2], 4, 7, { tip: 0.4 }), [10, 5], [-10, 5]], f: 'a' }], extra: [C(0, 1, 1.4, 'w', { ns: true, op: 0.8 })], stages: spGrowDress }),
  spPart({ id: 'halo', slot: 'hood', name: 'Halo', tags: ['light'], dom: 0.5, w: 2, extra: [P('M-12,-4 C-12,-9 12,-9 12,-4 C12,1 -12,1 -12,-4 Z M-8,-4 C-8,-6 8,-6 8,-4 C8,-2 -8,-2 -8,-4 Z', 'a', { ns: true, op: 0.9 }), P('M-12,-4 C-12,-9 12,-9 12,-4 C12,1 -12,1 -12,-4 Z', 'a', { ns: true, op: 0.25 })], stages: spGrowDress }),
  spPart({ id: 'bonnet', slot: 'hood', name: 'Bonnet', tags: ['cloth'], dom: 0.5, w: 2, shapes: [{ pts: [[-14, 6], [-12, -6], [-4, -12], [6, -12], [14, -4], [14, 6], [10, 4], [4, 0, 0.6], [-4, 0, 0.6], [-10, 4]], f: 's' }], extra: [L('M-10,-4 C-6,-9 0,-10 6,-8', 'k', 1, { op: 0.25 }), C(12, 4, 1.6, 'a', { ns: true })], stages: spGrowDress }),
  spPart({ id: 'horns', slot: 'hood', name: 'Horns', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-10, 4], [-14, -8], [-10, -20, 'c'], [-6, -8], [-4, 4]], [[4, 4], [6, -8], [10, -20, 'c'], [14, -8], [10, 4]]], extra: [L('M-10,-6 L-11,-12 M10,-6 L11,-12', 'k', 0.9, { op: 0.3 })], stages: spGrowDress }),
  spPart({ id: 'candle', slot: 'hood', name: 'Candle', tags: ['light'], dom: 0.5, w: 2, extra: [P('M-3,2 L3,2 L3,-10 L-3,-10 Z', 'w', { sw: 1.2 }), L('M-3,2 C-1,4 1,4 3,2', 'pd', 1.4), C(0, -14, 5, 'a', { ns: true, op: 0.22 }), P(flamePath(0, -14, 4), 'a', { ns: true }), P(flamePath(0, -13, 2), 'w', { ns: true, op: 0.7 })], stages: spGrowDress }),
];

const spLink = (x, y) => C(x, y, 2, 'pd', { sw: 1.4 });
const spChain = (x0, n, sway = 1.2) => Array.from({ length: n }, (_, i) => spLink(x0 + (i % 2) * sway, 2 + i * 3.6));

export const SP_CHAINS = [
  NONE('chains', 0.3, 's.'),
  spPart({ id: 'chain', slot: 'chains', name: 'Chain', tags: ['iron'], dom: 0.5, w: 3, extra: [...spChain(-8, 5), C(-7, 21, 2.8, 'pd', { sw: 1.4 })], stages: spGrowDress }),
  spPart({ id: 'double', slot: 'chains', name: 'Double', tags: ['iron'], dom: 0.5, w: 2, extra: [...spChain(-10, 5), ...spChain(8, 4, -1.2), C(-9, 21, 2.6, 'pd', { sw: 1.4 }), C(7, 17, 2.6, 'pd', { sw: 1.4 })], stages: spGrowDress }),
  spPart({ id: 'shackles', slot: 'chains', name: 'Shackles', tags: ['cuff'], dom: 0.5, w: 2, extra: [P('M-14,0 L-4,0 L-4,5 L-14,5 Z', 'pd', { sw: 1.4 }), P('M4,0 L14,0 L14,5 L4,5 Z', 'pd', { sw: 1.4 }), ...spChain(-9, 3), ...spChain(9, 3, -1.2), L('M-12,2.5 L-6,2.5 M6,2.5 L12,2.5', 'k', 1, { op: 0.4 })], stages: spGrowDress }),
  spPart({ id: 'heavy', slot: 'chains', name: 'Heavy links', tags: ['iron'], dom: 0.55, w: 2, extra: [...Array.from({ length: 4 }, (_, i) => C(-6 + (i % 2) * 2, 3 + i * 5, 3.2, 'pd', { sw: 1.8 })), P('M-8,20 L-2,20 L-1,28 L-9,28 Z', 'pd', { sw: 1.4 })], stages: spGrowDress }),
  spPart({ id: 'beads', slot: 'chains', name: 'Beads', tags: ['jewel'], dom: 0.5, w: 2, extra: [L('M-12,0 C-8,12 8,12 12,0', 'k', 1.2), ...[-10, -6, -2, 2, 6, 10].map((x) => C(x, 8 - Math.abs(x) * 0.5, 1.8, 'a', { sw: 1 }))], stages: spGrowDress }),
  spPart({ id: 'rope', slot: 'chains', name: 'Rope', tags: ['knot'], dom: 0.5, w: 2, extra: [L('M-12,0 C-8,10 8,10 12,0 M-2,7 C-3,12 -1,16 -2,20', 's', 3), L('M-10,3 L-8,6 M-4,7 L-3,9 M4,7 L6,5 M-3,12 L-1,13 M-3,16 L-1,17', 'k', 1, { op: 0.35 }), C(-2, 21, 2.4, 's', { sw: 1.2 })], stages: spGrowDress }),
  spPart({ id: 'barbed', slot: 'chains', name: 'Barbed', tags: ['thorn'], dom: 0.5, w: 2, extra: [L('M-12,0 C-8,10 8,10 12,0 M-2,7 C-3,12 -1,16 -2,20', 'pd', 2.2), P('M-9,3 L-11,7 L-7,6 Z M-4,7 L-5,11 L-1,9 Z M4,7 L5,11 L1,9 Z M-2,12 L-6,13 L-3,15 Z M-2,17 L2,18 L-1,20 Z', 'w', { ns: true, op: 0.85 })], stages: spGrowDress }),
];

const spStrand = (x0, y0, x1, y1) => `M${x0},${y0} C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1} `;

export const SP_TATTERS = [
  NONE('tatters', 0.3, 's.'),
  spPart({ id: 'strips', slot: 'tatters', name: 'Strips', tags: ['cloth'], dom: 0.5, w: 3, shapes: [{ pts: [[-14, -2], [14, -2], [14, 6], [10, 16, 'c'], [6, 6], [2, 18, 'c'], [-2, 6], [-8, 16, 'c'], [-10, 6], [-14, 12, 'c']], f: 'p' }], extra: [L('M-6,2 L-8,10 M4,2 L4,10', 'k', 0.9, { op: 0.2 })], stages: spGrowDress }),
  spPart({ id: 'ribbons', slot: 'tatters', name: 'Ribbons', tags: ['ribbon'], dom: 0.5, w: 2, extra: [L(spStrand(-10, 0, -14, 20) + spStrand(0, 0, 4, 22) + spStrand(10, 0, 12, 18), 'a', 2.4), L(spStrand(-10, 0, -14, 20) + spStrand(10, 0, 12, 18), 'w', 0.8, { ns: true, op: 0.4 })], stages: spGrowDress }),
  spPart({ id: 'rags', slot: 'tatters', name: 'Rags', tags: ['torn'], dom: 0.5, w: 2, shapes: [{ pts: [[-16, -2], [16, -2], [14, 8], [10, 4, 'c'], [8, 14, 'c'], [4, 6], [0, 16, 'c'], [-4, 6], [-8, 14, 'c'], [-10, 6], [-14, 10, 'c']], f: 'pd' }], extra: [C(-6, 4, 1.6, 'k', { ns: true, op: 0.3 }), C(8, 6, 1.4, 'k', { ns: true, op: 0.3 })], stages: spGrowDress }),
  spPart({ id: 'trail', slot: 'tatters', name: 'Veil trail', tags: ['soft'], dom: 0.45, w: 2, shapes: [{ pts: [[-12, -2], [12, -2], [16, 10], [10, 22, 'c'], [4, 12], [-2, 24, 'c'], [-6, 12], [-14, 20, 'c']], f: 'sl' }], extra: [L('M-4,2 C-4,8 -6,14 -10,18 M6,2 C6,8 8,14 10,18', 'k', 0.9, { op: 0.15 })], stages: spGrowDress }),
  spPart({ id: 'long', slot: 'tatters', name: 'Long', tags: ['trail'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, -2], [10, -2], [12, 10], [6, 28, 'c'], [2, 12], [-2, 30, 'c'], [-6, 12], [-12, 26, 'c']], f: 'p' }], extra: [L('M-4,2 L-6,20 M4,2 L4,20', 'k', 0.9, { op: 0.2 })], stages: spGrowDress }),
  spPart({ id: 'short', slot: 'tatters', name: 'Short', tags: ['fringe'], dom: 0.5, w: 2, shapes: [{ pts: [[-14, -2], [14, -2], [14, 4], ...fur([14, 4], [-14, 4], 6, 5, { tip: 'c' })], f: 'p' }], stages: spGrowDress }),
  spPart({ id: 'web', slot: 'tatters', name: 'Cobweb', tags: ['thread'], dom: 0.45, w: 2, extra: [L('M-12,-2 L-14,18 M-4,-2 L-4,22 M4,-2 L6,20 M12,-2 L14,16 M-13,6 C-6,10 6,10 13,6 M-14,12 C-6,16 6,16 14,12', 'sl', 1.1, { op: 0.85 })], stages: spGrowDress }),
];
