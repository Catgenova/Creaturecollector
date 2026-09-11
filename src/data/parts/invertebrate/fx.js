// Invertebrate patterns (clipped to the body, 100 x 60 frame), glows (drawn behind the body and
// stretched onto its box) and skirts (hanging from the underside, drawn behind the body).
import { vPart } from './_shared.js';
import { NONE, S, L, P, C, E, SH } from '../_dsl.js';

export const V_PATTERNS = [
  NONE('pattern', 0.3, 'v.'),
  vPart({ id: 'spots', slot: 'pattern', name: 'Ringed spots', tags: ['spotted'], dom: 0.5, w: 3, extra: [...[[-30, -12, 6], [-10, -22, 5], [10, -14, 6.5], [30, -20, 5], [-20, 6, 5], [4, 4, 4.5], [24, 4, 5.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })])] }),
  vPart({ id: 'stripes', slot: 'pattern', name: 'Claw stripes', tags: ['striped'], dom: 0.5, w: 2, extra: [S([[-36, -40], [-18, -40], [-22, -16], [-30, -2, 'c'], [-24, 6], [-34, 22, 'c'], [-34, 4], [-40, -16]], 'a', { ns: true }), S([[-10, -40], [8, -40], [4, -16], [-4, -2, 'c'], [2, 6], [-8, 22, 'c'], [-8, 4], [-14, -16]], 'a', { ns: true }), S([[16, -40], [34, -40], [30, -16], [22, -2, 'c'], [28, 6], [18, 22, 'c'], [18, 4], [12, -16]], 'a', { ns: true })] }),
  vPart({ id: 'mottled', slot: 'pattern', name: 'Mottled', tags: ['texture'], dom: 0.45, w: 2, extra: [S([[-40, -20], [-24, -28], [-14, -14], [-26, -4], [-44, -8]], 'a', { ns: true, op: 0.6 }), S([[-6, -26], [14, -30], [24, -16], [10, -6], [-8, -12]], 'a', { ns: true, op: 0.6 }), S([[-18, 4], [0, 0], [8, 14], [-6, 22], [-22, 14]], 'a', { ns: true, op: 0.6 }), S([[16, 2], [34, -4], [44, 10], [30, 20], [16, 14]], 'a', { ns: true, op: 0.6 })] }),
  vPart({ id: 'swirl', slot: 'pattern', name: 'Swirl', tags: ['spiral'], dom: 0.45, w: 2, extra: [L('M-10,0 C-10,-14 6,-18 14,-8 C20,0 12,12 2,10 C-6,8 -6,-2 0,-4 C4,-6 8,-2 6,2', 'a', 4), L('M-36,-8 C-30,-18 -18,-16 -18,-8 C-18,-2 -26,0 -28,-4', 'a', 3), L('M24,10 C28,2 38,4 38,10 C38,14 32,16 30,12', 'a', 3)] }),
  vPart({ id: 'dots', slot: 'pattern', name: 'Light dots', tags: ['light'], dom: 0.45, w: 2, extra: [...[[-32, -8], [-16, -18], [0, -10], [16, -18], [30, -8], [-24, 8], [-6, 12], [10, 8], [26, 12]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4.5, f: 'a', ns: true, op: 0.35 }, { t: 'circle', cx: x, cy: y, r: 2, f: 'w', ns: true }])] }),
  vPart({ id: 'rings', slot: 'pattern', name: 'Rings', tags: ['ringed'], dom: 0.45, w: 2, extra: [...[[-26, -10, 8], [2, -16, 9], [28, -6, 7], [-10, 10, 7], [18, 12, 6]].flatMap(([x, y, r]) => [{ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }, { t: 'circle', cx: x, cy: y, r: r * 0.55, f: 'p', ns: true }])] }),
  vPart({ id: 'gradient', slot: 'pattern', name: 'Jagged back', tags: ['gradient'], dom: 0.5, w: 2, extra: [S([[-54, -40], [54, -40], [54, -12], [44, 0, 'c'], [34, -10], [24, 4, 'c'], [14, -8], [4, 6, 'c'], [-6, -8], [-16, 4, 'c'], [-26, -10], [-38, 2, 'c'], [-56, -12]], 'a', { ns: true, spline: { tension: 0.45 } }), S([[-46, -40], [46, -40], [46, -26], [22, -16], [-6, -14], [-30, -18], [-48, -26]], 'k', { ns: true, op: 0.12 })] }),
];

export const V_GLOWS = [
  NONE('glow', 0.3, 'v.'),
  vPart({ id: 'aura', slot: 'glow', name: 'Aura', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 60, 38, 'a', { ns: true, op: 0.18 }), E(0, 0, 54, 33, 'a', { ns: true, op: 0.18 })] }),
  vPart({ id: 'sparkles', slot: 'glow', name: 'Sparkles', tags: ['fairy'], dom: 0.45, w: 2, extra: [...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [P(`M${x},${y - 5} L${x + 1.5},${y - 1.5} L${x + 5},${y} L${x + 1.5},${y + 1.5} L${x},${y + 5} L${x - 1.5},${y + 1.5} L${x - 5},${y} L${x - 1.5},${y - 1.5} Z`, 'w', { ns: true, op: 0.9 }), C(x, y, 2, 'a', { ns: true, op: 0.6 })])] }),
  vPart({ id: 'mist', slot: 'glow', name: 'Mist', tags: ['ghost'], dom: 0.45, w: 2, extra: [E(-20, 30, 22, 9, 'a', { ns: true, op: 0.3 }), E(14, 34, 26, 10, 'a', { ns: true, op: 0.25 }), E(-42, 18, 14, 7, 'a', { ns: true, op: 0.22 }), E(46, 22, 14, 7, 'a', { ns: true, op: 0.22 })] }),
  vPart({ id: 'embers', slot: 'glow', name: 'Embers', tags: ['fire'], dom: 0.45, w: 2, extra: [...[[-56, -10], [-48, -30], [-20, -44], [8, -46], [36, -40], [56, -16], [50, 12], [-54, 12]].flatMap(([x, y], i) => [C(x, y, 3 + (i % 3), 'a', { ns: true, op: 0.8 }), C(x, y, 1.4, 'w', { ns: true, op: 0.8 })])] }),
  vPart({ id: 'bubbles', slot: 'glow', name: 'Bubbles', tags: ['water'], dom: 0.45, w: 2, extra: [...[[-56, -20, 5], [-50, -38, 3], [50, -30, 6], [58, -8, 3.5], [-6, -46, 4], [30, -46, 3], [-58, 10, 4]].flatMap(([x, y, r]) => [C(x, y, r, 'w', { ns: true, op: 0.3 }), C(x, y, r, 'none', { sw: 1.6 }), C(x - r * 0.35, y - r * 0.35, r * 0.3, 'w', { ns: true, op: 0.9 })])] }),
  vPart({ id: 'motes', slot: 'glow', name: 'Motes', tags: ['psychic'], dom: 0.45, w: 2, extra: [...[[-60, -4], [-46, -34], [-12, -48], [26, -46], [54, -26], [60, 8], [-38, 34], [36, 36]].flatMap(([x, y]) => [C(x, y, 6, 'a', { ns: true, op: 0.25 }), C(x, y, 2.6, 'a', { ns: true, op: 0.9 })])] }),
  vPart({ id: 'static', slot: 'glow', name: 'Static', tags: ['electric'], dom: 0.45, w: 1, extra: [L('M-58,-20 L-50,-14 L-56,-6 L-46,0 M52,-24 L46,-16 L54,-10 L46,-2 M-16,-48 L-10,-42 L-18,-38 L-10,-32 M24,-46 L30,-40 L22,-36 L30,-30', 'a', 2.6), L('M-58,-20 L-50,-14 L-56,-6 L-46,0 M52,-24 L46,-16 L54,-10 L46,-2 M-16,-48 L-10,-42 L-18,-38 L-10,-32 M24,-46 L30,-40 L22,-36 L30,-30', 'w', 1, { op: 0.8 })] }),
];

/** Hanging strokes under the body: n tendrils across the width with a wave. */
function hang(n, len, spread, w, wave = 6) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = -spread / 2 + (spread * i) / Math.max(1, n - 1);
    const s = i % 2 ? 1 : -1;
    d += `M${x},0 C${x + wave * s},${len * 0.35} ${x - wave * s},${len * 0.7} ${x + wave * s * 0.5},${len} `;
  }
  return [L(d.trim(), 'k', w + 2.6), L(d.trim(), 'p', w)];
}

export const V_SKIRTS = [
  NONE('skirt', 0.3, 'v.'),
  vPart({ id: 'frills', slot: 'skirt', name: 'Frills', tags: ['jelly'], dom: 0.5, w: 3, shapes: [[[-30, -4], [30, -4], [30, 4], [24, 12, 0.4], [18, 4], [12, 12, 0.4], [6, 4], [0, 12, 0.4], [-6, 4], [-12, 12, 0.4], [-18, 4], [-24, 12, 0.4], [-30, 4]]], extra: [S([[-26, -2], [26, -2], [26, 2], [-26, 2]], 's', { ns: true, cl: true, op: 0.4 })] }),
  vPart({ id: 'tentacles', slot: 'skirt', name: 'Tentacles', tags: ['jelly', 'long'], dom: 0.55, w: 2, extra: hang(6, 44, 44, 2.6) }),
  vPart({ id: 'hem', slot: 'skirt', name: 'Ghost hem', tags: ['ghost'], dom: 0.5, w: 2, shapes: [[[-28, -6], [28, -6], [28, 2], [20, 14, 0.3], [12, 4], [4, 16, 0.3], [-4, 4], [-12, 16, 0.3], [-20, 4], [-28, 2]]], extra: [SH('M-30,-2 L30,-2 L30,6 L-30,6 Z', 0.1)] }),
  vPart({ id: 'fringe', slot: 'skirt', name: 'Foot fringe', tags: ['slug'], dom: 0.45, w: 3, shapes: [[[-30, -4], [30, -4], [30, 1], [24, 4], [16, 1.5], [8, 4], [0, 1.5], [-8, 4], [-16, 1.5], [-24, 4], [-30, 1]]], extra: [] }),
  vPart({ id: 'tassels', slot: 'skirt', name: 'Tassels', tags: ['decor'], dom: 0.45, w: 2, extra: [...hang(5, 26, 40, 3.2, 3), ...[[-20, 27], [-10, 27], [0, 27], [10, 27], [20, 27]].map(([x, y]) => C(x, y, 3.2, 'a', { sw: 1.4 }))] }),
  vPart({ id: 'roots', slot: 'skirt', name: 'Roots', tags: ['grass'], dom: 0.45, w: 2, extra: [...hang(4, 30, 36, 2.2, 8), L('M-12,16 L-18,22 M6,14 L12,20 M-2,22 L2,28', 'k', 4.6), L('M-12,16 L-18,22 M6,14 L12,20 M-2,22 L2,28', 'pd', 2)] }),
  vPart({ id: 'ribbons', slot: 'skirt', name: 'Ribbons', tags: ['fancy'], dom: 0.45, w: 1, extra: [...[[-18, 1], [0, -1], [18, 1]].flatMap(([x, s]) => [S([[x - 4, 0], [x + 4, 0], [x + 6 * s, 14], [x - 2 * s, 28], [x + 3 * s, 40, 0.3], [x - 5 * s, 30], [x - 8 * s, 14]], 'p'), S([[x - 2, 2], [x + 2, 2], [x + 3 * s, 14], [x - 1 * s, 26], [x - 4 * s, 14]], 's', { ns: true, cl: true, op: 0.5 })])] }),
];
