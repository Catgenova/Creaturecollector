// Fungus glow (a light behind the cap, fitted to its box) and cap patterns (spots clipped to the cap, 100 x 60 frame).
// Evolutions: glows spread; patterns are flat.
import { fgPart } from './_shared.js';
import { NONE, L, C, E, P, spline, arcPts } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';

const fgGlowStages = (extra = []) => ({ 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 74, 48, 'a', { ns: true, op: 0.1 }), ...extra] } });
const fgArc = (rx, ry, a0, a1, n) => L(spline(arcPts(0, 4, rx, ry, a0, a1, n), { closed: false }), 'k', 1.2, { op: 0.22 });

export const FG_GLOW = [
  NONE('glow', 0.3, 'g.'),
  fgPart({ id: 'halo', slot: 'glow', name: 'Halo', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 62, 40, 'a', { ns: true, op: 0.16 }), E(0, 0, 54, 34, 'a', { ns: true, op: 0.14 })], stages: fgGlowStages() }),
  fgPart({ id: 'aura', slot: 'glow', name: 'Aura', tags: ['light'], dom: 0.5, w: 2, extra: [E(0, 2, 70, 46, 'a', { ns: true, op: 0.12 }), E(0, 0, 60, 38, 'a', { ns: true, op: 0.14 }), E(0, -2, 50, 30, 'a', { ns: true, op: 0.14 })], stages: fgGlowStages() }),
  fgPart({ id: 'rays', slot: 'glow', name: 'Rays', tags: ['sun'], dom: 0.5, w: 2, extra: [E(0, 0, 56, 36, 'a', { ns: true, op: 0.14 }), ...[-70, -40, -10, 20, 50, 80, 110, 140, 170, 200, 230, 260].map((a) => { const r = (a * Math.PI) / 180; return L(`M${(Math.cos(r) * 40).toFixed(1)},${(Math.sin(r) * 26).toFixed(1)} L${(Math.cos(r) * 68).toFixed(1)},${(Math.sin(r) * 44).toFixed(1)}`, 'a', 2, { op: 0.3 }); })], stages: fgGlowStages() }),
  fgPart({ id: 'motes', slot: 'glow', name: 'Motes', tags: ['dots'], dom: 0.5, w: 2, extra: [E(0, 0, 52, 34, 'a', { ns: true, op: 0.1 }), ...[[-58, -20], [-50, 16], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38], [0, -50]].map(([x, y], i) => C(x, y, i % 2 ? 2 : 2.8, 'a', { ns: true, op: 0.7 }))], stages: fgGlowStages([C(-64, 0, 2, 'a', { ns: true, op: 0.7 }), C(64, 2, 2, 'a', { ns: true, op: 0.7 })]) }),
  fgPart({ id: 'pulse', slot: 'glow', name: 'Pulse', tags: ['rings'], dom: 0.5, w: 2, extra: [E(0, 0, 48, 30, 'a', { ns: true, op: 0.12 }), L(spline(arcPts(0, 0, 58, 37, 0, 330, 12)), 'a', 1.6, { op: 0.45 }), L(spline(arcPts(0, 0, 68, 44, 0, 330, 12)), 'a', 1.2, { op: 0.3 })], stages: fgGlowStages() }),
  fgPart({ id: 'crescent', slot: 'glow', name: 'Crescent', tags: ['moon'], dom: 0.5, w: 2, extra: [P('M-56,-6 C-40,-48 40,-48 56,-6 C40,-34 -40,-34 -56,-6 Z', 'a', { ns: true, op: 0.3 }), E(0, -6, 50, 30, 'a', { ns: true, op: 0.1 })], stages: fgGlowStages() }),
  fgPart({ id: 'sparkles', slot: 'glow', name: 'Sparkles', tags: ['fairy'], dom: 0.45, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), ...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [P(sparklePath(x, y, 5), 'a', { ns: true, op: 0.85 }), C(x, y, 1.6, 'w', { ns: true, op: 0.6 })])], stages: fgGlowStages() }),
];

export const FG_PATTERNS = [
  NONE('pattern', 0.3, 'g.'),
  fgPart({ id: 'spots', slot: 'pattern', name: 'Spots', tags: ['white'], dom: 0.5, w: 3, extra: [...[[-28, -8, 7], [-6, -18, 6], [16, -12, 8], [32, 2, 5], [-12, 6, 5], [8, 8, 4], [-36, 8, 4], [30, -20, 3.5]].map(([x, y, r]) => C(x, y, r, 'w', { ns: true, op: 0.9 }))] }),
  fgPart({ id: 'dots', slot: 'pattern', name: 'Dots', tags: ['small'], dom: 0.5, w: 2, extra: [...[[-34, -6], [-24, -16], [-14, -4], [-4, -20], [6, -8], [16, -18], [26, -6], [36, -14], [-30, 8], [-10, 12], [10, 6], [30, 10], [0, 0], [-20, 20], [20, 20]].map(([x, y], i) => C(x, y, i % 3 ? 1.8 : 2.6, 'a', { ns: true, op: 0.85 }))] }),
  fgPart({ id: 'rings', slot: 'pattern', name: 'Rings', tags: ['ring'], dom: 0.5, w: 2, extra: [fgArc(14, 9, 180, 360, 9), fgArc(26, 16, 180, 360, 11), fgArc(38, 23, 180, 360, 13)] }),
  fgPart({ id: 'stripes', slot: 'pattern', name: 'Stripes', tags: ['radial'], dom: 0.5, w: 2, extra: [L('M-40,12 L-30,-26 M-24,16 L-18,-28 M-8,18 L-6,-30 M8,18 L6,-30 M24,16 L18,-28 M40,12 L30,-26', 'k', 2.6, { op: 0.2 })] }),
  fgPart({ id: 'freckles', slot: 'pattern', name: 'Freckles', tags: ['dark'], dom: 0.5, w: 2, extra: [...[[-30, -10], [-22, 2], [-16, -18], [-8, -6], [0, -22], [4, 4], [12, -14], [20, -2], [28, -16], [34, 4], [-36, 6], [16, 12], [-4, 14]].map(([x, y], i) => C(x, y, i % 2 ? 1.2 : 1.7, 'ad', { ns: true, op: 0.6 }))] }),
  fgPart({ id: 'scales', slot: 'pattern', name: 'Scales', tags: ['patches'], dom: 0.5, w: 2, extra: [...[[-30, -6, 7, 4], [-12, -16, 6, 3.5], [8, -10, 8, 4.5], [28, -4, 6, 3.5], [-18, 8, 6, 3.5], [6, 10, 7, 4], [30, 12, 5, 3], [-4, -26, 5, 3]].map(([x, y, rx, ry]) => E(x, y, rx, ry, 'sd', { ns: true, op: 0.85 }))] }),
  fgPart({ id: 'crackle', slot: 'pattern', name: 'Crackle', tags: ['crack'], dom: 0.5, w: 2, extra: [L('M-34,-4 L-24,-12 L-26,2 L-14,8 M-8,-24 L-2,-10 L-10,0 L-4,14 M12,-20 L8,-8 L18,0 L14,12 M30,-12 L24,-2 L34,6', 'w', 1.3, { ns: true, op: 0.55 })] }),
];
