// Wyrm glow (a light behind the coil, fitted to its box) and bands (markings clipped to the coil, 100 x 60 frame).
// Evolutions: glows spread; bands are flat.
import { wyPart } from './_shared.js';
import { NONE, L, C, E, P, spline, arcPts, puff } from '../_dsl.js';
import { sparklePath, diamondPath } from '../_sigils.js';

const wyGlowStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 74, 48, 'a', { ns: true, op: 0.1 })] } };
const wyPuffPath = (cx, cy, r, n, amp) => `${puff(cx, cy, r, n, amp).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`;

export const WY_GLOW = [
  NONE('glow', 0.3, 'w.'),
  wyPart({ id: 'halo', slot: 'glow', name: 'Halo', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 62, 40, 'a', { ns: true, op: 0.16 }), E(0, 0, 54, 34, 'a', { ns: true, op: 0.14 })], stages: wyGlowStages }),
  wyPart({ id: 'aura', slot: 'glow', name: 'Aura', tags: ['light'], dom: 0.5, w: 2, extra: [E(0, 2, 70, 46, 'a', { ns: true, op: 0.12 }), E(0, 0, 60, 38, 'a', { ns: true, op: 0.14 }), E(0, -2, 50, 30, 'a', { ns: true, op: 0.14 })], stages: wyGlowStages }),
  wyPart({ id: 'stormcloud', slot: 'glow', name: 'Storm cloud', tags: ['cloud'], dom: 0.5, w: 2, extra: [P(wyPuffPath(-20, 18, 22, 9, 4), 'k', { ns: true, op: 0.22 }), P(wyPuffPath(18, 22, 20, 9, 4), 'k', { ns: true, op: 0.22 }), P(wyPuffPath(0, 26, 18, 8, 3), 'w', { ns: true, op: 0.14 }), L('M-30,-30 L-36,-16 L-30,-14 L-38,0', 'a', 2, { op: 0.8 })], stages: wyGlowStages }),
  wyPart({ id: 'sparkles', slot: 'glow', name: 'Sparkles', tags: ['fairy'], dom: 0.45, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), ...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [P(sparklePath(x, y, 5), 'a', { ns: true, op: 0.85 }), C(x, y, 1.6, 'w', { ns: true, op: 0.6 })])], stages: wyGlowStages }),
  wyPart({ id: 'rays', slot: 'glow', name: 'Rays', tags: ['sun'], dom: 0.5, w: 2, extra: [E(0, 0, 56, 36, 'a', { ns: true, op: 0.14 }), ...[-70, -40, -10, 20, 50, 80, 110, 140, 170, 200, 230, 260].map((a) => { const r = (a * Math.PI) / 180; return L(`M${(Math.cos(r) * 40).toFixed(1)},${(Math.sin(r) * 26).toFixed(1)} L${(Math.cos(r) * 68).toFixed(1)},${(Math.sin(r) * 44).toFixed(1)}`, 'a', 2, { op: 0.3 }); })], stages: wyGlowStages }),
  wyPart({ id: 'mist', slot: 'glow', name: 'Mist', tags: ['soft'], dom: 0.5, w: 2, extra: [E(-20, 14, 34, 16, 'w', { ns: true, op: 0.12 }), E(16, 18, 36, 14, 'w', { ns: true, op: 0.12 }), E(0, 24, 50, 10, 'w', { ns: true, op: 0.1 }), E(0, -6, 60, 36, 'a', { ns: true, op: 0.08 })], stages: wyGlowStages }),
  wyPart({ id: 'embers', slot: 'glow', name: 'Embers', tags: ['fire'], dom: 0.5, w: 2, extra: [E(0, 4, 56, 36, 'a', { ns: true, op: 0.1 }), ...[[-54, -10], [-44, -30], [-20, -40], [10, -44], [36, -34], [54, -14], [50, 12], [-50, 16]].map(([x, y], i) => C(x, y, i % 2 ? 1.6 : 2.4, 'a', { ns: true, op: 0.8 }))], stages: wyGlowStages }),
];

export const WY_BANDS = [
  NONE('bands', 0.3, 'w.'),
  wyPart({ id: 'rings', slot: 'bands', name: 'Rings', tags: ['band'], dom: 0.5, w: 3, extra: [...[-32, -12, 8, 28].map((x) => P(`M${x},-30 L${x + 7},-30 L${x + 5},30 L${x - 2},30 Z`, 'k', { ns: true, op: 0.18 }))] }),
  wyPart({ id: 'belly', slot: 'bands', name: 'Belly plates', tags: ['belly'], dom: 0.5, w: 2, extra: [P('M-50,10 C-25,18 25,18 50,10 L50,30 L-50,30 Z', 'w', { ns: true, op: 0.3 }), L('M-40,20 L40,20 M-44,16 L44,16 M-36,24 L36,24', 'k', 0.8, { op: 0.16 })] }),
  wyPart({ id: 'diamonds', slot: 'bands', name: 'Diamonds', tags: ['pattern'], dom: 0.5, w: 2, extra: [...[-36, -18, 0, 18, 36].map((x) => P(diamondPath(x, -4, 12, 18), 'a', { ns: true, op: 0.7 }))] }),
  wyPart({ id: 'stripes', slot: 'bands', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 2, extra: [L('M-40,-30 L-30,30 M-24,-30 L-14,30 M-8,-30 L2,30 M8,-30 L18,30 M24,-30 L34,30', 'k', 3, { op: 0.18 })] }),
  wyPart({ id: 'spots', slot: 'bands', name: 'Spots', tags: ['dots'], dom: 0.5, w: 2, extra: [...[[-36, -8], [-24, 6], [-14, -12], [0, 2], [12, -10], [24, 8], [36, -4], [-6, 14], [18, -22], [-30, -22]].map(([x, y], i) => C(x, y, i % 3 ? 2.6 : 3.6, 'ad', { ns: true, op: 0.55 }))] }),
  wyPart({ id: 'scales', slot: 'bands', name: 'Scales', tags: ['scale'], dom: 0.5, w: 2, extra: [L([-24, -12, 0, 12, 24].map((y) => `M-50,${y} ${[-40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((x) => `A5,5 0 0 0 ${x},${y}`).join(' ')}`).join(' '), 'k', 0.9, { op: 0.22 })] }),
  wyPart({ id: 'dorsal', slot: 'bands', name: 'Dorsal wash', tags: ['dark'], dom: 0.5, w: 2, extra: [P('M-50,-30 L50,-30 L50,-12 C25,-4 -25,-4 -50,-12 Z', 'k', { ns: true, op: 0.16 }), L('M-44,-8 L44,-8', 'w', 0.8, { op: 0.2 })] }),
];
