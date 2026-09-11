import { P, E, C, L, NONE } from './_dsl.js';

// Patterns are drawn in body coordinates and clipped to the body silhouette.
// They inherit the body's paint, so "s" is the secondary colour and "pd"/"pl" the body shade/highlight.
const SCALE_ROW = 'q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0 q5,-6 10,0';

export const PATTERNS = [
  NONE('pattern', 0.4),
  { id: 'pat.stripes', slot: 'pattern', name: 'Stripes', dom: 0.55, w: 3,
    prims: [-34, -12, 10, 32].map((x) => P(`M${x},-40 L${x + 12},-40 L${x + 4},40 L${x - 8},40 Z`, 'pd', { ns: true, op: 0.85 })) },
  { id: 'pat.spots', slot: 'pattern', name: 'Spots', dom: 0.5, w: 3,
    prims: [C(-20, -10, 7, 's', { ns: true }), C(4, -18, 5, 's', { ns: true }), C(20, 2, 6, 's', { ns: true }), C(-6, 10, 8, 's', { ns: true }), C(-30, 12, 4, 's', { ns: true }), C(28, -16, 4, 's', { ns: true })] },
  { id: 'pat.belly', slot: 'pattern', name: 'Belly', dom: 0.5, w: 3, prims: [E(6, 16, 34, 17, 'pl', { ns: true })] },
  { id: 'pat.saddle', slot: 'pattern', name: 'Saddle', dom: 0.5, w: 2, prims: [E(-6, -24, 38, 20, 'pd', { ns: true, op: 0.9 })] },
  { id: 'pat.scales', slot: 'pattern', name: 'Scales', dom: 0.45, w: 2,
    prims: [-16, -4, 8, 20].map((y, i) => L(`M${i % 2 ? -45 : -50},${y} ${SCALE_ROW}`, 'k', 1.2, { op: 0.28 })) },
  { id: 'pat.gradient', slot: 'pattern', name: 'Shaded', dom: 0.45, w: 2,
    prims: [P('M-60,10 L60,10 L60,60 L-60,60 Z', 'pd', { ns: true, op: 0.25 }), P('M-60,22 L60,22 L60,60 L-60,60 Z', 'pd', { ns: true, op: 0.3 })] },
  { id: 'pat.speckle', slot: 'pattern', name: 'Speckled', dom: 0.4, w: 2,
    prims: [[-28, -6], [-18, -20], [-6, -26], [8, -22], [22, -14], [30, 2], [18, 12], [4, 20], [-12, 18], [-26, 10], [-2, 2], [14, -4]].map(([x, y]) => C(x, y, 1.7, 'pl', { ns: true, op: 0.9 })) },
  { id: 'pat.chest', slot: 'pattern', name: 'Chest patch', dom: 0.45, w: 2, prims: [E(22, -2, 14, 18, 'pl', { ns: true })] },
  { id: 'pat.bands', slot: 'pattern', name: 'Bands', dom: 0.5, w: 1,
    prims: [P('M-60,-14 L60,-14 L60,-6 L-60,-6 Z', 'pd', { ns: true, op: 0.8 }), P('M-60,6 L60,6 L60,14 L-60,14 Z', 'pd', { ns: true, op: 0.8 })] },
  { id: 'pat.diamonds', slot: 'pattern', name: 'Diamonds', dom: 0.45, w: 1,
    prims: [P('M-20,-8 L-12,-20 L-4,-8 L-12,4 Z', 's', { ns: true }), P('M6,-4 L14,-16 L22,-4 L14,8 Z', 's', { ns: true }), P('M-40,4 L-34,-6 L-28,4 L-34,14 Z', 's', { ns: true })] },
  { id: 'pat.tiger', slot: 'pattern', name: 'Tiger stripes', dom: 0.55, w: 1,
    prims: [P('M-30,-40 L-16,-40 L-34,12 L-46,12 Z', 'pd', { ns: true, op: 0.9 }), P('M-6,-40 L8,-40 L-10,14 L-22,14 Z', 'pd', { ns: true, op: 0.9 }), P('M18,-40 L32,-40 L14,14 L2,14 Z', 'pd', { ns: true, op: 0.9 }), P('M42,-40 L56,-40 L38,14 L26,14 Z', 'pd', { ns: true, op: 0.9 })] },
  { id: 'pat.hex', slot: 'pattern', name: 'Hex plates', dom: 0.45, w: 1,
    prims: [[-30, -10], [-10, -22], [10, -10], [30, -22], [-20, 12], [0, 2], [20, 14]].map(([x, y]) => L(`M${x - 7},${y - 4} L${x},${y - 8} L${x + 7},${y - 4} L${x + 7},${y + 4} L${x},${y + 8} L${x - 7},${y + 4} Z`, 'k', 1.1, { op: 0.28 })) },
];
