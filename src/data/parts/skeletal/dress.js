// Skeletal shrouds (what hangs from the spine, drawn behind at the back socket) and cracks (a pattern clipped to
// the ribcage, 100 x 60 frame).
// Evolutions: shrouds grow; cracks are flat.
import { skPart } from './_shared.js';
import { NONE, L, C, P, PATCH, spline, puff } from '../_dsl.js';

const skGrowDress = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };
const skStrand = (x0, y0, x1, y1) => `M${x0},${y0} C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1} `;

export const SK_SHROUDS = [
  NONE('shroud', 0.3, 'k.'),
  skPart({ id: 'tatters', slot: 'shroud', name: 'Tatters', tags: ['cloth'], dom: 0.5, w: 3, shapes: [{ pts: [[-18, -2], [18, -2], [16, 14], [12, 22, 'c'], [8, 12], [2, 26, 'c'], [-2, 14], [-8, 24, 'c'], [-12, 12], [-18, 18, 'c']], f: 's' }], extra: [L('M-8,2 L-10,14 M4,2 L4,12', 'k', 0.9, { op: 0.25 })], stages: skGrowDress }),
  skPart({ id: 'moss', slot: 'shroud', name: 'Moss', tags: ['green'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, -2, 18, 10, 4), f: 'a' }], extra: [L(skStrand(-12, 6, -14, 22) + skStrand(2, 8, 4, 24) + skStrand(12, 6, 16, 20), 'a', 2.2)], stages: skGrowDress }),
  skPart({ id: 'cobwebs', slot: 'shroud', name: 'Cobwebs', tags: ['thread'], dom: 0.45, w: 2, extra: [L('M-16,-4 L-20,20 M-8,-6 L-8,24 M2,-6 L4,22 M12,-4 L18,18 M-18,6 C-8,10 6,10 16,6 M-19,14 C-8,18 6,18 17,12', 'sl', 1.1, { op: 0.85 })], stages: skGrowDress }),
  skPart({ id: 'cape', slot: 'shroud', name: 'Cape', tags: ['cloth'], dom: 0.5, w: 2, shapes: [{ pts: [[-16, -4], [16, -4], [22, 24], [0, 30], [-22, 24]], f: 's' }], extra: [L('M-6,0 C-8,12 -8,20 -6,28 M6,0 C8,12 8,20 6,28', 'k', 1, { op: 0.2 })], stages: skGrowDress }),
  skPart({ id: 'bandages', slot: 'shroud', name: 'Bandages', tags: ['wrapped'], dom: 0.5, w: 2, extra: [L(skStrand(-14, -2, -18, 26) + skStrand(-4, 0, -2, 28) + skStrand(8, -2, 14, 24), 's', 3.4), L(skStrand(-14, -2, -18, 26) + skStrand(8, -2, 14, 24), 'k', 0.8, { op: 0.25 })], stages: skGrowDress }),
  skPart({ id: 'roots', slot: 'shroud', name: 'Roots', tags: ['root'], dom: 0.5, w: 2, extra: [L('M-12,-2 C-16,8 -12,16 -18,26 M-12,10 L-20,14 M2,-2 C4,8 0,16 4,26 M2,12 L8,16 M12,-2 C16,6 12,14 18,22', 'pd', 2.6), L('M-12,-2 C-16,8 -12,16 -18,26 M2,-2 C4,8 0,16 4,26', 'k', 0.8, { op: 0.25 })], stages: skGrowDress }),
  skPart({ id: 'mist', slot: 'shroud', name: 'Grave mist', tags: ['soft'], dom: 0.45, w: 2, extra: [P(spline(puff(-8, 10, 12, 8, 3)), 'w', { ns: true, op: 0.14 }), P(spline(puff(10, 14, 11, 8, 3)), 'w', { ns: true, op: 0.14 }), P(spline(puff(0, 22, 16, 9, 3)), 'w', { ns: true, op: 0.1 })], stages: skGrowDress }),
];

export const SK_CRACKS = [
  NONE('cracks', 0.3, 'k.'),
  skPart({ id: 'cracks', slot: 'cracks', name: 'Cracks', tags: ['crack'], dom: 0.5, w: 3, extra: [L('M-30,-14 L-22,-4 L-26,10 M-6,-24 L0,-10 L-8,4 L-2,18 M18,-18 L14,-4 L24,8', 'k', 1.5, { op: 0.45 })] }),
  skPart({ id: 'runes', slot: 'cracks', name: 'Runes', tags: ['glyph'], dom: 0.5, w: 2, extra: [L('M-30,-10 L-30,6 M-34,-6 L-26,-6 M-14,-12 L-8,-2 L-14,8 M4,-12 L4,8 M0,-4 L8,-4 M20,-12 L26,-2 L20,8 M16,-2 L30,-2', 'a', 1.6, { op: 0.9 })] }),
  skPart({ id: 'moss', slot: 'cracks', name: 'Moss patches', tags: ['moss'], dom: 0.5, w: 2, extra: [PATCH(spline(puff(-20, 6, 9, 7, 3)), 'a'), PATCH(spline(puff(16, -10, 8, 7, 3)), 'a'), PATCH(spline(puff(28, 12, 6, 6, 2)), 'a')] }),
  skPart({ id: 'bands', slot: 'cracks', name: 'Bandage bands', tags: ['wrapped'], dom: 0.5, w: 2, extra: [P('M-50,-14 C-25,-8 25,-18 50,-12 L50,-6 C25,-12 -25,-2 -50,-8 Z', 's', { ns: true, op: 0.9 }), P('M-50,8 C-25,14 25,4 50,10 L50,16 C25,10 -25,20 -50,14 Z', 's', { ns: true, op: 0.9 })] }),
  skPart({ id: 'scorch', slot: 'cracks', name: 'Scorch', tags: ['burnt'], dom: 0.5, w: 2, extra: [P('M-50,30 C-30,18 -10,26 10,14 C26,6 40,18 50,10 L50,30 Z', 'k', { ns: true, op: 0.32 }), L('M-26,20 L-20,10 M4,16 L8,6 M30,14 L36,4', 'a', 1.2, { op: 0.8 })] }),
  skPart({ id: 'frost', slot: 'cracks', name: 'Frost', tags: ['ice'], dom: 0.5, w: 2, extra: [L('M-34,-6 L-24,-14 L-20,-4 M-24,-14 L-26,-24 M2,-20 L6,-8 L-2,0 M6,-8 L16,-10 M22,10 L30,0 L36,8 M30,0 L28,-10', 'w', 1.3, { ns: true, op: 0.55 })] }),
  skPart({ id: 'gilt', slot: 'cracks', name: 'Gilt veins', tags: ['gold'], dom: 0.5, w: 2, extra: [L('M-40,10 C-28,-2 -14,14 0,0 C12,-12 26,10 40,-4', 'a', 1.6, { op: 0.9 }), L('M-20,-16 C-12,-8 -6,-14 2,-6 M10,16 C18,8 26,18 34,10', 'a', 1.2, { op: 0.8 })] }),
];
