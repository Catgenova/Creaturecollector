// Flora canopy (foliage drawn behind the stem at its back socket), bark (a pattern clipped to the stem,
// 100 x 60 frame) and fruit (a small accent hanging low on the bloom).
// Evolutions: canopy grows with the fur family; bark is flat; fruit grows with the face family.
import { flPart } from './_shared.js';
import { NONE, L, C, E, P, PATCH, S, puff, leaf, spline, arcPts } from '../_dsl.js';
import { evoGlow } from '../_evo.js';

const flStrand = (x0, y0, x1, y1) => `M${x0},${y0} C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1} `;
const flRingD = (rx, ry) => spline(arcPts(0, 0, rx, ry, 0, 330, 11));

export const FL_CANOPY = [
  NONE('canopy', 0.3, 'p.'),
  flPart({ id: 'bush', slot: 'canopy', name: 'Bush', tags: ['round'], dom: 0.5, w: 3, shapes: [{ pts: puff(0, -8, 22, 12, 6), f: 's' }], extra: [C(-10, -18, 1.4, 'w', { ns: true, op: 0.5 }), C(6, -22, 1.2, 'w', { ns: true, op: 0.5 })] }),
  flPart({ id: 'fronds', slot: 'canopy', name: 'Fronds', tags: ['palm'], dom: 0.5, w: 2, shapes: [{ d: leaf([0, -4], [-30, -20], 6), f: 'pd' }, { d: leaf([0, -4], [-14, -32], 5), f: 'pd' }, { d: leaf([0, -4], [12, -34], 5), f: 'pd' }, { d: leaf([0, -4], [30, -22], 6), f: 'pd' }] }),
  flPart({ id: 'willow', slot: 'canopy', name: 'Willow', tags: ['hanging'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, -14, 18, 10, 4), f: 's' }], extra: [L(flStrand(-22, -8, -26, 18) + flStrand(-12, -2, -16, 24) + flStrand(14, -2, 18, 24) + flStrand(24, -8, 28, 18), 'sd', 1.6)] }),
  flPart({ id: 'branches', slot: 'canopy', name: 'Bare branches', tags: ['twig'], dom: 0.5, w: 2, extra: [L('M0,0 L-12,-18 M-12,-18 L-22,-22 M-12,-18 L-14,-30 M0,0 L10,-20 M10,-20 L20,-24 M10,-20 L8,-32 M0,0 L0,-26', 'pd', 3.4), L('M0,0 L-12,-18 M0,0 L10,-20 M0,0 L0,-26', 'k', 1, { op: 0.25 })] }),
  flPart({ id: 'flowerbed', slot: 'canopy', name: 'Flowerbed', tags: ['bloom'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, -6, 18, 10, 4), f: 'pd' }], extra: [...[[-12, -14], [4, -20], [16, -8], [-4, -4]].flatMap(([x, y]) => [P(spline(puff(x, y, 3.2, 6, 1.6)), 'a', { sw: 1.1 }), C(x, y, 1.2, 'w', { ns: true })])] }),
  flPart({ id: 'pollen', slot: 'canopy', name: 'Pollen cloud', tags: ['light'], dom: 0.4, w: 1, extra: [evoGlow(0, -12, 20, 0.14, 'a', { cl: false }), ...[[-16, -6], [-8, -20], [4, -26], [16, -16], [22, -2], [-2, -10], [10, -6]].map(([x, y], i) => C(x, y, i % 2 ? 1.2 : 1.7, 'a', { ns: true, op: 0.85 }))] }),
  flPart({ id: 'brambles', slot: 'canopy', name: 'Brambles', tags: ['thorn'], dom: 0.5, w: 2, extra: [L('M-4,0 C-20,-10 -26,-22 -14,-30 C-4,-36 6,-28 2,-18 M4,0 C18,-8 28,-18 20,-28 C14,-34 4,-30 6,-20', 'pd', 3), ...[[-20, -14], [-12, -30], [24, -16], [14, -30], [6, -20]].map(([x, y]) => P(`M${x},${y} L${x + 3},${y - 5} L${x + 5},${y} Z`, 'a', { sw: 1 }))] }),
];

export const FL_BARK = [
  NONE('bark', 0.3, 'p.'),
  flPart({ id: 'rings', slot: 'bark', name: 'Growth rings', tags: ['ring'], dom: 0.5, w: 2, extra: [L(flRingD(12, 9), 'k', 1.2, { op: 0.25 }), L(flRingD(22, 15), 'k', 1.2, { op: 0.22 }), L(flRingD(32, 21), 'k', 1.2, { op: 0.2 })] }),
  flPart({ id: 'grain', slot: 'bark', name: 'Grain', tags: ['stripe'], dom: 0.5, w: 2, extra: [L('M-30,-26 C-34,-8 -34,8 -30,26 M-14,-28 C-18,-8 -18,8 -14,28 M4,-28 C0,-8 0,8 4,28 M20,-26 C16,-8 16,8 20,26 M34,-22 C30,-6 30,6 34,22', 'k', 1.2, { op: 0.28 })] }),
  flPart({ id: 'knots', slot: 'bark', name: 'Knots', tags: ['knot'], dom: 0.5, w: 2, extra: [E(-18, -8, 6, 4.5, 'pd', { ns: true }), E(-18, -8, 2.6, 1.8, 'k', { ns: true, op: 0.5 }), E(14, 6, 7, 5, 'pd', { ns: true }), E(14, 6, 3, 2, 'k', { ns: true, op: 0.5 }), E(26, -14, 4, 3, 'pd', { ns: true })] }),
  flPart({ id: 'moss', slot: 'bark', name: 'Moss patches', tags: ['moss'], dom: 0.5, w: 2, extra: [PATCH(spline(puff(-20, 6, 9, 7, 3)), 'a'), PATCH(spline(puff(16, -10, 8, 7, 3)), 'a'), PATCH(spline(puff(28, 12, 6, 6, 2)), 'a')] }),
  flPart({ id: 'speckles', slot: 'bark', name: 'Speckles', tags: ['dots'], dom: 0.5, w: 2, extra: [...[[-30, -12], [-22, 10], [-10, -22], [-4, 4], [8, -12], [12, 16], [24, -4], [30, 12], [-16, 20], [20, 22]].map(([x, y], i) => C(x, y, i % 3 ? 1.4 : 2.2, 'a', { ns: true, op: 0.85 }))] }),
  flPart({ id: 'veins', slot: 'bark', name: 'Veins', tags: ['vein'], dom: 0.5, w: 2, extra: [L('M0,28 L0,-28 M0,10 L-18,-6 M0,10 L16,-8 M0,-8 L-14,-22 M0,-8 L12,-24 M-18,-6 L-30,-10 M16,-8 L28,-14', 'k', 1.3, { op: 0.3 })] }),
  flPart({ id: 'cracks', slot: 'bark', name: 'Cracks', tags: ['crack'], dom: 0.5, w: 2, extra: [L('M-26,-24 L-20,-10 L-26,4 L-18,18 M6,-26 L2,-12 L10,-2 L4,14 L10,26 M28,-18 L22,-6 L30,8', 'k', 1.6, { op: 0.45 })] }),
];

export const FL_FRUIT = [
  NONE('fruit', 0.3, 'p.'),
  flPart({ id: 'berry', slot: 'fruit', name: 'Berry', tags: ['berry'], dom: 0.5, w: 3, extra: [L('M0,0 L1,3', 'k', 1.3), C(1, 6, 3.6, 'a', { sw: 1.3 }), C(-0.3, 4.6, 1, 'w', { ns: true, op: 0.85 })] }),
  flPart({ id: 'apple', slot: 'fruit', name: 'Apple', tags: ['apple'], dom: 0.5, w: 2, extra: [L('M0,0 L1,3', 'k', 1.3), P('M-4,6 C-4,2 6,2 6,6 C6,10 3,12 1,12 C-1,12 -4,10 -4,6 Z', 'a', { sw: 1.3 }), P(leaf([1, 3], [5, 0], 1.6), 'p', { sw: 1 }), C(-1.5, 5, 1, 'w', { ns: true, op: 0.8 })] }),
  flPart({ id: 'cherries', slot: 'fruit', name: 'Cherries', tags: ['cherry'], dom: 0.5, w: 2, extra: [L('M0,0 L-4,6 M0,0 L5,7', 'k', 1.3), C(-4.5, 8.5, 3, 'a', { sw: 1.3 }), C(5.5, 9.5, 3, 'a', { sw: 1.3 }), C(-5.6, 7.4, 0.9, 'w', { ns: true, op: 0.8 }), C(4.4, 8.4, 0.9, 'w', { ns: true, op: 0.8 })] }),
  flPart({ id: 'nut', slot: 'fruit', name: 'Nut', tags: ['nut'], dom: 0.5, w: 2, extra: [E(1, 6, 3.8, 4.6, 's', { sw: 1.3 }), P('M-3,4 C-2,1 4,1 5,4 Z', 'pd', { sw: 1.2 }), C(-0.4, 5.4, 0.9, 'w', { ns: true, op: 0.7 })] }),
  flPart({ id: 'grapes', slot: 'fruit', name: 'Grapes', tags: ['grape'], dom: 0.5, w: 2, extra: [L('M0,0 L1,3', 'k', 1.3), ...[[-3, 5], [3, 5], [0, 8], [-2, 11], [2, 11], [0, 14]].map(([x, y]) => C(x, y, 2.2, 'a', { sw: 1.1 })), C(-3.6, 4.4, 0.7, 'w', { ns: true, op: 0.8 })] }),
  flPart({ id: 'pepper', slot: 'fruit', name: 'Pepper', tags: ['hot'], dom: 0.5, w: 2, extra: [L('M0,0 L0,3', 'k', 1.3), P('M-2,3 C-4,7 -3,12 2,15 C4,11 3,6 1,3 Z', 'a', { sw: 1.3 }), C(-1.4, 5, 0.8, 'w', { ns: true, op: 0.8 })] }),
  flPart({ id: 'seed', slot: 'fruit', name: 'Seed', tags: ['seed'], dom: 0.5, w: 2, extra: [E(1, 6, 3, 4.4, 's', { sw: 1.3 }), L('M1,2.6 L1,9.6', 'k', 1, { op: 0.4 }), C(-0.2, 4.4, 0.8, 'w', { ns: true, op: 0.7 })] }),
];
