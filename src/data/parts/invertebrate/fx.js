// Invertebrate patterns (clipped to the body, 100 x 60 frame), glows (drawn behind the body and
// stretched onto its box) and skirts (hanging from the underside, drawn behind the body).
// Evolutions: patterns add elements, then rings, dots and embers; glows add more motes, sparks,
// bubbles and rings; skirts grow accent tips and longer strands, then a layered copy behind.
import { vPart } from './_shared.js';
import { NONE, S, L, P, C, E, SH, xfPts } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

export const V_PATTERNS = [
  NONE('pattern', 0.3, 'v.'),
  vPart({ id: 'spots', slot: 'pattern', name: 'Ringed spots', tags: ['spotted'], dom: 0.5, w: 3, extra: [...[[-30, -12, 6], [-10, -22, 5], [10, -14, 6.5], [30, -20, 5], [-20, 6, 5], [4, 4, 4.5], [24, 4, 5.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })])],
    stages: { 2: { add: [[-42, 6, 4.5], [40, -4, 4.5], [-4, 18, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })]) }, 3: { add: [evoRing(-10, -22, 8, 'a', 1.6), evoRing(10, -14, 9.5, 'a', 1.6), evoRing(24, 4, 8.5, 'a', 1.6)] } } }),
  vPart({ id: 'stripes', slot: 'pattern', name: 'Claw stripes', tags: ['striped'], dom: 0.5, w: 2, extra: [S([[-36, -40], [-18, -40], [-22, -16], [-30, -2, 'c'], [-24, 6], [-34, 22, 'c'], [-34, 4], [-40, -16]], 'a', { ns: true }), S([[-10, -40], [8, -40], [4, -16], [-4, -2, 'c'], [2, 6], [-8, 22, 'c'], [-8, 4], [-14, -16]], 'a', { ns: true }), S([[16, -40], [34, -40], [30, -16], [22, -2, 'c'], [28, 6], [18, 22, 'c'], [18, 4], [12, -16]], 'a', { ns: true })],
    stages: { 2: { add: [S([[40, -40], [52, -40], [50, -18], [44, -6, 'c'], [48, 2], [40, 12, 'c'], [38, -4], [36, -18]], 'a', { ns: true })] }, 3: { add: [S([[-58, -40], [-48, -40], [-50, -20], [-56, -8, 'c'], [-52, -2], [-58, 6, 'c'], [-60, -6], [-62, -20]], 'a', { ns: true }), C(-24, 18, 2.4, 'a', { ns: true }), C(2, 20, 2.4, 'a', { ns: true }), C(28, 18, 2.4, 'a', { ns: true })] } } }),
  vPart({ id: 'mottled', slot: 'pattern', name: 'Mottled', tags: ['texture'], dom: 0.45, w: 2, extra: [S([[-40, -20], [-24, -28], [-14, -14], [-26, -4], [-44, -8]], 'a', { ns: true, op: 0.6 }), S([[-6, -26], [14, -30], [24, -16], [10, -6], [-8, -12]], 'a', { ns: true, op: 0.6 }), S([[-18, 4], [0, 0], [8, 14], [-6, 22], [-22, 14]], 'a', { ns: true, op: 0.6 }), S([[16, 2], [34, -4], [44, 10], [30, 20], [16, 14]], 'a', { ns: true, op: 0.6 })],
    stages: { 2: { add: [S([[34, -30], [48, -34], [54, -22], [44, -16], [32, -22]], 'a', { ns: true, op: 0.6 }), S([[-54, 6], [-42, 2], [-36, 14], [-46, 22], [-56, 16]], 'a', { ns: true, op: 0.6 })] }, 3: { add: [C(-28, -16, 3, 's', { ns: true, op: 0.8 }), C(8, -18, 3, 's', { ns: true, op: 0.8 }), C(-6, 12, 3, 's', { ns: true, op: 0.8 }), C(30, 8, 2.8, 's', { ns: true, op: 0.8 })] } } }),
  vPart({ id: 'swirl', slot: 'pattern', name: 'Swirl', tags: ['spiral'], dom: 0.45, w: 2, extra: [L('M-10,0 C-10,-14 6,-18 14,-8 C20,0 12,12 2,10 C-6,8 -6,-2 0,-4 C4,-6 8,-2 6,2', 'a', 4), L('M-36,-8 C-30,-18 -18,-16 -18,-8 C-18,-2 -26,0 -28,-4', 'a', 3), L('M24,10 C28,2 38,4 38,10 C38,14 32,16 30,12', 'a', 3)],
    stages: { 2: { add: [L('M-30,14 C-26,6 -18,8 -18,14 C-18,18 -24,20 -26,16', 'a', 2.6), L('M30,-18 C34,-26 44,-24 44,-18 C44,-14 38,-12 36,-16', 'a', 2.6)] }, 3: { add: [C(-42, -20, 2.4, 'a', { ns: true }), C(46, 0, 2.4, 'a', { ns: true }), C(-4, -26, 2, 'a', { ns: true, op: 0.8 }), C(12, 22, 2, 'a', { ns: true, op: 0.8 }), C(4, 2, 2, 'w', { ns: true, op: 0.7 })] } } }),
  vPart({ id: 'dots', slot: 'pattern', name: 'Light dots', tags: ['light'], dom: 0.45, w: 2, extra: [...[[-32, -8], [-16, -18], [0, -10], [16, -18], [30, -8], [-24, 8], [-6, 12], [10, 8], [26, 12]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4.5, f: 'a', ns: true, op: 0.35 }, { t: 'circle', cx: x, cy: y, r: 2, f: 'w', ns: true }])],
    stages: { 2: { add: [[-44, 2], [40, -20], [-14, 24], [20, 22]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4, f: 'a', ns: true, op: 0.35 }, { t: 'circle', cx: x, cy: y, r: 1.8, f: 'w', ns: true }]) }, 3: { add: [L('M-32,-8 L-16,-18 L0,-10 L16,-18 L30,-8 M-24,8 L-6,12 L10,8 L26,12', 'a', 1.2, { ns: true, op: 0.5 }), ...[[-16, -18], [16, -18], [-6, 12]].map(([x, y]) => evoRing(x, y, 6.5, 'a', 1, { op: 0.6 }))] } } }),
  vPart({ id: 'rings', slot: 'pattern', name: 'Rings', tags: ['ringed'], dom: 0.45, w: 2, extra: [...[[-26, -10, 8], [2, -16, 9], [28, -6, 7], [-10, 10, 7], [18, 12, 6]].flatMap(([x, y, r]) => [{ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }, { t: 'circle', cx: x, cy: y, r: r * 0.55, f: 'p', ns: true }])],
    stages: { 2: { add: [[-46, 6, 5], [44, -22, 5]].flatMap(([x, y, r]) => [{ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }, { t: 'circle', cx: x, cy: y, r: r * 0.55, f: 'p', ns: true }]) }, 3: { add: [C(-26, -10, 2, 'a', { ns: true }), C(2, -16, 2.4, 'a', { ns: true }), C(28, -6, 1.8, 'a', { ns: true }), C(-10, 10, 1.8, 'a', { ns: true }), C(18, 12, 1.6, 'a', { ns: true })] } } }),
  vPart({ id: 'gradient', slot: 'pattern', name: 'Jagged back', tags: ['gradient'], dom: 0.5, w: 2, extra: [S([[-54, -40], [54, -40], [54, -12], [44, 0, 'c'], [34, -10], [24, 4, 'c'], [14, -8], [4, 6, 'c'], [-6, -8], [-16, 4, 'c'], [-26, -10], [-38, 2, 'c'], [-56, -12]], 'a', { ns: true, spline: { tension: 0.45 } }), S([[-46, -40], [46, -40], [46, -26], [22, -16], [-6, -14], [-30, -18], [-48, -26]], 'k', { ns: true, op: 0.12 })],
    stages: { 2: { add: [S([[38, -4], [44, 12, 'c'], [48, -6]], 'a', { ns: true }), S([[-2, 0], [2, 16, 'c'], [8, -2]], 'a', { ns: true }), S([[-40, -4], [-38, 12, 'c'], [-32, -6]], 'a', { ns: true })] }, 3: { add: [C(30, -22, 2.4, 'w', { ns: true, op: 0.5 }), C(-10, -26, 2, 'w', { ns: true, op: 0.45 }), C(10, -16, 1.8, 'w', { ns: true, op: 0.45 }), C(-30, -24, 2.2, 'w', { ns: true, op: 0.5 })] } } }),
];

const sparkle8 = (x, y, r = 5) => P(`M${x},${y - r} L${x + r * 0.3},${y - r * 0.3} L${x + r},${y} L${x + r * 0.3},${y + r * 0.3} L${x},${y + r} L${x - r * 0.3},${y + r * 0.3} L${x - r},${y} L${x - r * 0.3},${y - r * 0.3} Z`, 'w', { ns: true, op: 0.9 });

export const V_GLOWS = [
  NONE('glow', 0.3, 'v.'),
  vPart({ id: 'aura', slot: 'glow', name: 'Aura', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 60, 38, 'a', { ns: true, op: 0.18 }), E(0, 0, 54, 33, 'a', { ns: true, op: 0.18 })],
    stages: { 2: { grow: [1.08, 1.08], add: [E(0, 0, 66, 42, 'a', { ns: true, op: 0.12 })] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 72, 46, 'a', { ns: true, op: 0.1 }), ...[[-56, -20], [58, -22], [0, -46], [-40, 36], [42, 34]].map(([x, y]) => sparkle8(x, y, 4))] } } }),
  vPart({ id: 'sparkles', slot: 'glow', name: 'Sparkles', tags: ['fairy'], dom: 0.45, w: 2, extra: [...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [sparkle8(x, y), C(x, y, 2, 'a', { ns: true, op: 0.6 })])],
    stages: { 2: { grow: [1.08, 1.08], add: [...[[-64, -2], [64, 0], [6, -50], [0, 46]].flatMap(([x, y]) => [sparkle8(x, y, 4), C(x, y, 1.6, 'a', { ns: true, op: 0.6 })])] }, 3: { grow: [1.06, 1.06], add: [...[[-58, -22], [56, -18], [-30, 40], [30, 38]].map(([x, y]) => evoRing(x, y, 7, 'a', 1, { op: 0.5 })), ...[[-40, -40], [44, -38], [-46, 32], [48, 30]].flatMap(([x, y]) => [sparkle8(x, y, 3.4), C(x, y, 1.4, 'a', { ns: true, op: 0.6 })])] } } }),
  vPart({ id: 'mist', slot: 'glow', name: 'Mist', tags: ['ghost'], dom: 0.45, w: 2, extra: [E(-20, 30, 22, 9, 'a', { ns: true, op: 0.3 }), E(14, 34, 26, 10, 'a', { ns: true, op: 0.25 }), E(-42, 18, 14, 7, 'a', { ns: true, op: 0.22 }), E(46, 22, 14, 7, 'a', { ns: true, op: 0.22 })],
    stages: { 2: { grow: [1.08, 1.08], add: [E(-30, 40, 24, 8, 'a', { ns: true, op: 0.2 }), E(26, 44, 28, 9, 'a', { ns: true, op: 0.18 })] }, 3: { grow: [1.06, 1.06], add: [E(-54, 4, 14, 6, 'a', { ns: true, op: 0.18 }), E(56, 6, 14, 6, 'a', { ns: true, op: 0.18 }), E(0, 52, 34, 9, 'a', { ns: true, op: 0.16 }), ...[[-40, 30], [30, 34], [0, 44]].map(([x, y]) => C(x, y, 2.2, 'w', { ns: true, op: 0.6 }))] } } }),
  vPart({ id: 'embers', slot: 'glow', name: 'Embers', tags: ['fire'], dom: 0.45, w: 2, extra: [...[[-56, -10], [-48, -30], [-20, -44], [8, -46], [36, -40], [56, -16], [50, 12], [-54, 12]].flatMap(([x, y], i) => [C(x, y, 3 + (i % 3), 'a', { ns: true, op: 0.8 }), C(x, y, 1.4, 'w', { ns: true, op: 0.8 })])],
    stages: { 2: { grow: [1.08, 1.08], add: [...[[-62, -22], [-36, -48], [24, -52], [58, -30], [60, 2], [-60, 4]].flatMap(([x, y], i) => [C(x, y, 2.4 + (i % 2), 'a', { ns: true, op: 0.75 }), C(x, y, 1.1, 'w', { ns: true, op: 0.8 })])] }, 3: { grow: [1.06, 1.06], add: [...[[-56, -10], [8, -46], [56, -16]].map(([x, y]) => C(x, y, 8, 'a', { ns: true, op: 0.22 })), ...[[-44, 30], [40, 32], [-10, -58], [50, -46]].flatMap(([x, y]) => [C(x, y, 3, 'a', { ns: true, op: 0.8 }), C(x, y, 1.3, 'w', { ns: true, op: 0.8 })])] } } }),
  vPart({ id: 'bubbles', slot: 'glow', name: 'Bubbles', tags: ['water'], dom: 0.45, w: 2, extra: [...[[-56, -20, 5], [-50, -38, 3], [50, -30, 6], [58, -8, 3.5], [-6, -46, 4], [30, -46, 3], [-58, 10, 4]].flatMap(([x, y, r]) => [C(x, y, r, 'w', { ns: true, op: 0.3 }), C(x, y, r, 'none', { sw: 1.6 }), C(x - r * 0.35, y - r * 0.35, r * 0.3, 'w', { ns: true, op: 0.9 })])],
    stages: { 2: { grow: [1.08, 1.08], add: [...[[-64, -4, 4], [64, 6, 4.5], [14, -54, 3.5], [-30, -52, 3]].flatMap(([x, y, r]) => [C(x, y, r, 'w', { ns: true, op: 0.3 }), C(x, y, r, 'none', { sw: 1.6 }), C(x - r * 0.35, y - r * 0.35, r * 0.3, 'w', { ns: true, op: 0.9 })])] }, 3: { grow: [1.06, 1.06], add: [...[[-46, 30, 6], [46, 30, 5], [0, -60, 6], [62, -46, 4]].flatMap(([x, y, r]) => [C(x, y, r, 'w', { ns: true, op: 0.3 }), C(x, y, r, 'none', { sw: 1.6 }), C(x - r * 0.35, y - r * 0.35, r * 0.3, 'w', { ns: true, op: 0.9 })]), ...[[-56, -20], [50, -30]].map(([x, y]) => C(x, y, 1.6, 'a', { ns: true, op: 0.7 }))] } } }),
  vPart({ id: 'motes', slot: 'glow', name: 'Motes', tags: ['psychic'], dom: 0.45, w: 2, extra: [...[[-60, -4], [-46, -34], [-12, -48], [26, -46], [54, -26], [60, 8], [-38, 34], [36, 36]].flatMap(([x, y]) => [C(x, y, 6, 'a', { ns: true, op: 0.25 }), C(x, y, 2.6, 'a', { ns: true, op: 0.9 })])],
    stages: { 2: { grow: [1.08, 1.08], add: [...[[-66, -24], [6, -58], [66, -10], [0, 50], [-60, 24]].flatMap(([x, y]) => [C(x, y, 5, 'a', { ns: true, op: 0.25 }), C(x, y, 2.2, 'a', { ns: true, op: 0.9 })])] }, 3: { grow: [1.06, 1.06], add: [L('M-60,-4 L-46,-34 L-12,-48 L26,-46 L54,-26 L60,8', 'a', 1, { ns: true, op: 0.35 }), ...[[-46, -34], [26, -46], [-38, 34], [36, 36]].map(([x, y]) => evoRing(x, y, 8, 'a', 1, { op: 0.5 }))] } } }),
  vPart({ id: 'static', slot: 'glow', name: 'Static', tags: ['electric'], dom: 0.45, w: 1, extra: [L('M-58,-20 L-50,-14 L-56,-6 L-46,0 M52,-24 L46,-16 L54,-10 L46,-2 M-16,-48 L-10,-42 L-18,-38 L-10,-32 M24,-46 L30,-40 L22,-36 L30,-30', 'a', 2.6), L('M-58,-20 L-50,-14 L-56,-6 L-46,0 M52,-24 L46,-16 L54,-10 L46,-2 M-16,-48 L-10,-42 L-18,-38 L-10,-32 M24,-46 L30,-40 L22,-36 L30,-30', 'w', 1, { op: 0.8 })],
    stages: { 2: { grow: [1.08, 1.08], add: [L('M-62,14 L-54,20 L-60,28 L-50,34 M58,10 L52,18 L60,24 L52,32', 'a', 2.6), L('M-62,14 L-54,20 L-60,28 L-50,34 M58,10 L52,18 L60,24 L52,32', 'w', 1, { op: 0.8 })] }, 3: { grow: [1.06, 1.06], add: [L('M-40,-52 L-34,-46 L-42,-42 L-34,-36 M44,-54 L50,-48 L42,-44 L50,-38 M0,-60 L6,-54 L-2,-50 L6,-44', 'a', 2.6), L('M-40,-52 L-34,-46 L-42,-42 L-34,-36 M44,-54 L50,-48 L42,-44 L50,-38 M0,-60 L6,-54 L-2,-50 L6,-44', 'w', 1, { op: 0.8 }), ...[[-46, 0], [46, -2], [-10, -32], [30, -30]].map(([x, y]) => C(x, y, 2.2, 'w', { ns: true, op: 0.9 }))] } } }),
];

/** Hanging strokes under the body: n tendrils across the width with a wave. */
function hang(n, len, spread, w, wave = 6, role = 'p') {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = -spread / 2 + (spread * i) / Math.max(1, n - 1);
    const s = i % 2 ? 1 : -1;
    d += `M${x},0 C${x + wave * s},${len * 0.35} ${x - wave * s},${len * 0.7} ${x + wave * s * 0.5},${len} `;
  }
  return [L(d.trim(), 'k', w + 2.6), L(d.trim(), role, w)];
}
/** Tip beads for hanging strands: n strands across `spread` ending at `len`. */
function hangTips(n, len, spread, wave, r) {
  const out = [];
  for (let i = 0; i < n; i++) { const x = -spread / 2 + (spread * i) / Math.max(1, n - 1); const s = i % 2 ? 1 : -1; out.push(C(x + wave * s * 0.5, len, r, 'a', { ns: true })); }
  return out;
}

const vskFrills = [[-30, -4], [30, -4], [30, 4], [24, 12, 0.4], [18, 4], [12, 12, 0.4], [6, 4], [0, 12, 0.4], [-6, 4], [-12, 12, 0.4], [-18, 4], [-24, 12, 0.4], [-30, 4]];
const vskHem = [[-28, -6], [28, -6], [28, 2], [20, 14, 0.3], [12, 4], [4, 16, 0.3], [-4, 4], [-12, 16, 0.3], [-20, 4], [-28, 2]];
const vskFringe = [[-30, -4], [30, -4], [30, 1], [24, 4], [16, 1.5], [8, 4], [0, 1.5], [-8, 4], [-16, 1.5], [-24, 4], [-30, 1]];

export const V_SKIRTS = [
  NONE('skirt', 0.3, 'v.'),
  vPart({ id: 'frills', slot: 'skirt', name: 'Frills', tags: ['jelly'], dom: 0.5, w: 3, shapes: [vskFrills], extra: [S([[-26, -2], [26, -2], [26, 2], [-26, 2]], 's', { ns: true, cl: true, op: 0.4 })],
    stages: { 2: { grow: [1.05, 1.25], add: [...[-24, -12, 0, 12, 24].map((x) => C(x, 12, 1.6, 'a', { ns: true }))] }, 3: { grow: [1.05, 1.15], addBehind: [{ pts: xfPts(vskFrills, { sx: 1.15, sy: 1.9 }), f: 'pd' }] } } }),
  vPart({ id: 'tentacles', slot: 'skirt', name: 'Tentacles', tags: ['jelly', 'long'], dom: 0.55, w: 2, extra: hang(6, 44, 44, 2.6),
    stages: { 2: { grow: [1.05, 1.15], add: hangTips(6, 44, 44, 6, 1.8) }, 3: { grow: [1.05, 1.12], add: [...hang(5, 56, 36, 2, 5, 'pd'), ...hangTips(6, 44, 44, 6, 2.4), ...hangTips(5, 56, 36, 5, 1.8)] } } }),
  vPart({ id: 'hem', slot: 'skirt', name: 'Ghost hem', tags: ['ghost'], dom: 0.5, w: 2, shapes: [vskHem], extra: [SH('M-30,-2 L30,-2 L30,6 L-30,6 Z', 0.1)],
    stages: { 2: { grow: [1.05, 1.25], add: [...[-12, 4, 20].map((x) => C(x, 16, 1.6, 'a', { ns: true, op: 0.8 }))] }, 3: { grow: [1.05, 1.15], addBehind: [{ pts: xfPts(vskHem, { sx: 1.15, sy: 1.8 }), f: 'pd' }] } } }),
  vPart({ id: 'fringe', slot: 'skirt', name: 'Foot fringe', tags: ['slug'], dom: 0.45, w: 3, shapes: [vskFringe], extra: [],
    stages: { 2: { grow: [1.05, 1.5], add: [L('M-28,-1 L28,-1', 'a', 1.4, { ns: true, cl: true, op: 0.6 })] }, 3: { grow: [1.05, 1.3], addBehind: [{ pts: xfPts(vskFringe, { sx: 1.15, sy: 2.2 }), f: 'pd' }] } } }),
  vPart({ id: 'tassels', slot: 'skirt', name: 'Tassels', tags: ['decor'], dom: 0.45, w: 2, extra: [...hang(5, 26, 40, 3.2, 3), ...[[-20, 27], [-10, 27], [0, 27], [10, 27], [20, 27]].map(([x, y]) => C(x, y, 3.2, 'a', { sw: 1.4 }))],
    stages: { 2: { grow: [1.05, 1.15], add: [...[[-20, 27], [-10, 27], [0, 27], [10, 27], [20, 27]].map(([x, y]) => C(x, y, 4, 'a', { sw: 1.4 }))] }, 3: { grow: [1.05, 1.12], add: [...hang(4, 36, 30, 2.6, 3, 'pd'), ...[[-15, 37], [-5, 37], [5, 37], [15, 37]].map(([x, y]) => C(x, y, 3, 'a', { sw: 1.4 })), ...[[-20, 27], [0, 27], [20, 27]].map(([x, y]) => C(x, y, 1.4, 'w', { ns: true, op: 0.7 }))] } } }),
  vPart({ id: 'roots', slot: 'skirt', name: 'Roots', tags: ['grass'], dom: 0.45, w: 2, extra: [...hang(4, 30, 36, 2.2, 8), L('M-12,16 L-18,22 M6,14 L12,20 M-2,22 L2,28', 'k', 4.6), L('M-12,16 L-18,22 M6,14 L12,20 M-2,22 L2,28', 'pd', 2)],
    stages: { 2: { grow: [1.05, 1.15], add: [...hangTips(4, 30, 36, 8, 1.6), C(-18, 22, 1.6, 'a', { ns: true }), C(12, 20, 1.6, 'a', { ns: true })] }, 3: { grow: [1.05, 1.12], add: [...hang(3, 42, 24, 2, 6, 'pd'), L('M-20,24 L-26,30 M14,22 L20,28', 'k', 4.2), L('M-20,24 L-26,30 M14,22 L20,28', 'pd', 1.8), ...hangTips(3, 42, 24, 6, 1.8)] } } }),
  vPart({ id: 'ribbons', slot: 'skirt', name: 'Ribbons', tags: ['fancy'], dom: 0.45, w: 1, extra: [...[[-18, 1], [0, -1], [18, 1]].flatMap(([x, s]) => [S([[x - 4, 0], [x + 4, 0], [x + 6 * s, 14], [x - 2 * s, 28], [x + 3 * s, 40, 0.3], [x - 5 * s, 30], [x - 8 * s, 14]], 'p'), S([[x - 2, 2], [x + 2, 2], [x + 3 * s, 14], [x - 1 * s, 26], [x - 4 * s, 14]], 's', { ns: true, cl: true, op: 0.5 })])],
    stages: { 2: { grow: [1.05, 1.15], add: [...[[-18, 1], [0, -1], [18, 1]].map(([x, s]) => C(x + 3 * s, 40, 2, 'a', { ns: true })), P(sparklePath(-30, 20, 3), 'a', { ns: true, op: 0.85 }), P(sparklePath(30, 24, 3, 20), 'a', { ns: true, op: 0.85 })] }, 3: { grow: [1.05, 1.12], addBehind: [...[[-30, -1], [30, 1]].map(([x, s]) => ({ pts: [[x - 4, 0], [x + 4, 0], [x + 6 * s, 14], [x - 2 * s, 30], [x + 3 * s, 44, 0.3], [x - 5 * s, 32], [x - 8 * s, 14]], f: 'pd' }))], add: [...[[-30, -1], [30, 1]].map(([x, s]) => C(x + 3 * s, 44, 2, 'a', { ns: true })), ...[[-18, 1], [0, -1], [18, 1]].map(([x, s]) => C(x + 3 * s, 40, 2.6, 'a', { ns: true }))] } } }),
];
