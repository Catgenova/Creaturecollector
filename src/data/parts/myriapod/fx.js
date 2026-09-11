// Myriapod glow (a light fitted behind the body, 100 x 60 frame) and bands (a pattern clipped to the body, same
// frame).
// Evolutions: glows spread; bands are flat.
import { myPart } from './_shared.js';
import { NONE, L, C, E, P, PATCH } from '../_dsl.js';

const myGlowStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 74, 44, 'a', { ns: true, op: 0.1 })] } };
const myRow = (n, x0, x1, y, r, op = 0.75) => Array.from({ length: n }, (_, i) => C(x0 + ((x1 - x0) * i) / (n - 1), y, r, 'a', { ns: true, op }));

export const MY_GLOW = [
  NONE('glow', 0.3, 'y.'),
  myPart({ id: 'soft', slot: 'glow', name: 'Soft', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 64, 36, 'a', { ns: true, op: 0.14 }), E(0, 0, 54, 28, 'a', { ns: true, op: 0.14 })], stages: myGlowStages }),
  myPart({ id: 'dots', slot: 'glow', name: 'Dots', tags: ['row'], dom: 0.5, w: 2, extra: [E(0, 0, 56, 30, 'a', { ns: true, op: 0.1 }), ...myRow(7, -54, 54, -34, 2.4), ...myRow(7, -54, 54, 34, 2.4)], stages: myGlowStages }),
  myPart({ id: 'lines', slot: 'glow', name: 'Lines', tags: ['streak'], dom: 0.5, w: 2, extra: [E(0, 0, 56, 30, 'a', { ns: true, op: 0.1 }), L('M-60,-36 L60,-36 M-64,0 L64,0 M-60,36 L60,36', 'a', 1.6, { op: 0.35 })], stages: myGlowStages }),
  myPart({ id: 'pulse', slot: 'glow', name: 'Pulse', tags: ['rings'], dom: 0.5, w: 2, extra: [E(0, 0, 50, 28, 'a', { ns: true, op: 0.12 }), E(0, 0, 60, 34, 'a', { ns: true, op: 0.1 }), E(0, 0, 70, 40, 'a', { ns: true, op: 0.08 })], stages: myGlowStages }),
  myPart({ id: 'stripes', slot: 'glow', name: 'Stripes', tags: ['bars'], dom: 0.5, w: 2, extra: [E(0, 0, 56, 30, 'a', { ns: true, op: 0.1 }), ...[-48, -32, -16, 0, 16, 32, 48].map((x) => L(`M${x},-40 L${x},40`, 'a', 3, { op: 0.22 }))], stages: myGlowStages }),
  myPart({ id: 'halo', slot: 'glow', name: 'Halo', tags: ['crown'], dom: 0.5, w: 2, extra: [P('M-56,-6 C-40,-46 40,-46 56,-6 C40,-32 -40,-32 -56,-6 Z', 'a', { ns: true, op: 0.3 }), E(0, -4, 50, 28, 'a', { ns: true, op: 0.1 })], stages: myGlowStages }),
  myPart({ id: 'sparks', slot: 'glow', name: 'Sparks', tags: ['dots'], dom: 0.5, w: 2, extra: [E(0, 0, 50, 28, 'a', { ns: true, op: 0.1 }), ...[[-58, -18], [-46, 20], [-20, -40], [6, 38], [24, -42], [50, 22], [60, -14], [-4, -46]].map(([x, y], i) => C(x, y, i % 2 ? 1.8 : 2.6, 'a', { ns: true, op: 0.75 }))], stages: myGlowStages }),
];

export const MY_BANDS = [
  NONE('bands', 0.3, 'y.'),
  myPart({ id: 'stripes', slot: 'bands', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 3, extra: [PATCH('M-42,-30 L-30,-30 L-30,30 L-42,30 Z M-14,-30 L-2,-30 L-2,30 L-14,30 Z M14,-30 L26,-30 L26,30 L14,30 Z', 's', { op: 0.8 })] }),
  myPart({ id: 'segments', slot: 'bands', name: 'Dark joints', tags: ['joint'], dom: 0.5, w: 2, extra: [L('M-36,-30 L-36,30 M-22,-30 L-22,30 M-8,-30 L-8,30 M6,-30 L6,30 M20,-30 L20,30 M34,-30 L34,30', 'k', 3, { ns: true, cl: true, op: 0.3 })] }),
  myPart({ id: 'rings', slot: 'bands', name: 'Rings', tags: ['ring'], dom: 0.5, w: 2, extra: [L('M-40,-30 L-40,30 M-32,-30 L-32,30 M-4,-30 L-4,30 M4,-30 L4,30 M32,-30 L32,30 M40,-30 L40,30', 'a', 2, { ns: true, cl: true, op: 0.85 })] }),
  myPart({ id: 'dots', slot: 'bands', name: 'Dots', tags: ['dot'], dom: 0.5, w: 2, extra: [...[-36, -22, -8, 6, 20, 34].map((x) => C(x, -12, 2.6, 'a', { ns: true, cl: true, op: 0.9 })), ...[-29, -15, -1, 13, 27].map((x) => C(x, 4, 1.8, 'a', { ns: true, cl: true, op: 0.7 }))] }),
  myPart({ id: 'dashes', slot: 'bands', name: 'Dashes', tags: ['dash'], dom: 0.5, w: 2, extra: [L('M-40,-8 L-30,-8 M-24,-8 L-14,-8 M-8,-8 L2,-8 M8,-8 L18,-8 M24,-8 L34,-8 M-34,6 L-26,6 M-18,6 L-10,6 M-2,6 L6,6 M14,6 L22,6 M30,6 L38,6', 'a', 2.2, { ns: true, cl: true, op: 0.85 })] }),
  myPart({ id: 'chevrons', slot: 'bands', name: 'Chevrons', tags: ['arrow'], dom: 0.5, w: 2, extra: [PATCH('M-40,-30 L-32,-30 L-22,0 L-32,30 L-40,30 L-30,0 Z M-14,-30 L-6,-30 L4,0 L-6,30 L-14,30 L-4,0 Z M12,-30 L20,-30 L30,0 L20,30 L12,30 L22,0 Z', 's', { op: 0.8 })] }),
  myPart({ id: 'saddle', slot: 'bands', name: 'Saddle', tags: ['back'], dom: 0.5, w: 2, extra: [PATCH('M-50,-30 L50,-30 L50,-6 C25,0 -25,0 -50,-6 Z', 's', { op: 0.8 }), L('M-30,-20 L-30,-8 M0,-22 L0,-6 M30,-20 L30,-8', 'k', 1.2, { ns: true, cl: true, op: 0.3 })] }),
];
