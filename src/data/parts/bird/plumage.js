// Bird chest plumage (front of the breast, drawn over the body), back features (mantle and capes,
// drawn behind the body from the back socket) and patterns (clipped to the body, 100 x 60 frame).
// Evolutions: chests grow accent tips, rings and extra layers, then a larger copy behind and a
// gem; backs grow accent barbs, stars, shards or leaves, then a larger cape behind; patterns add
// elements, then rings, dots and embers.
import { bPart } from './_shared.js';
import { NONE, S, L, P, C, E, SH, HL, fur, xfPts, arcPts } from '../_dsl.js';
import { spiralPath, sparklePath } from '../_sigils.js';
import { evoRing, evoGem } from '../_evo.js';

const chestRuffPts = [[-16, -12], [0, -16], [12, -10], ...fur([12, -6], [6, 18], 4, 5, { lean: 0.3, tip: 0.4 }), [-6, 22], [-18, 14], [-22, 0]];
const fluffyPts = [[-16, -10], [2, -14], [12, -6], ...fur([12, -2], [8, 22], 5, 4, { lean: 0.2, tip: 0.6 }), ...fur([4, 26], [-14, 22], 3, 4, { lean: 0.2, tip: 0.6 }), [-20, 8]];
const bibPts = [[-14, -10], [2, -14], [12, -6], [12, 10], [4, 22], [-8, 22], [-16, 10]];
const tuxPts = [[-8, -30], [8, -32], [18, -14], [20, 6], [14, 24], [0, 30], [-14, 24], [-20, 6], [-18, -14]];

export const B_CHESTS = [
  NONE('chest', 0.3, 'b.'),
  bPart({ id: 'ruff', slot: 'chest', name: 'Ruff', tags: ['collar'], dom: 0.5, w: 2, shapes: [chestRuffPts], extra: [SH('M-24,8 C-14,20 0,22 10,14 L12,30 L-24,30 Z', 0.12)],
    stages: {
      2: { grow: [1.1, 1.12], add: [L('M11,0 L13,4 M9,8 L11,12 M7,16 L9,20', 'a', 1.6, { ns: true, op: 0.8 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(chestRuffPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-4, 4, 3)] },
    } }),
  bPart({ id: 'bib', slot: 'chest', name: 'Bib', tags: ['patch'], dom: 0.5, w: 3, extra: [S(bibPts, 's', { sw: 2 }), SH('M-18,10 C-10,20 4,22 12,12 L12,28 L-18,28 Z', 0.1)],
    stages: {
      2: { grow: [1.1, 1.12], add: [S([[-10, -6], [2, -10], [8, -4], [8, 8], [2, 16], [-6, 16], [-12, 8]], 'a', { ns: true, op: 0.35 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(bibPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-1, 4, 3.2)] },
    } }),
  bPart({ id: 'fluffy', slot: 'chest', name: 'Fluffy', tags: ['down'], dom: 0.45, w: 2, shapes: [fluffyPts], extra: [S([[-10, -6], [2, -8], [8, 0], [6, 14], [-4, 18], [-12, 8]], 's', { ns: true, cl: true, op: 0.4 })],
    stages: {
      2: { grow: [1.1, 1.12], add: [C(12, 2, 1.6, 'a', { ns: true }), C(11, 12, 1.6, 'a', { ns: true }), C(2, 26, 1.6, 'a', { ns: true }), C(-10, 22, 1.6, 'a', { ns: true })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(fluffyPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-2, 4, 2.8)] },
    } }),
  bPart({ id: 'speckled', slot: 'chest', name: 'Speckled', tags: ['thrush'], dom: 0.45, w: 2, extra: [...[[-8, -8], [2, -10], [8, -2], [-4, 0], [4, 8], [-8, 10], [0, 16], [-12, 18], [8, 18]].map(([x, y]) => ({ t: 'ellipse', cx: x, cy: y, rx: 2.6, ry: 3.4, f: 'a', ns: true, op: 0.8 }))],
    stages: {
      2: { grow: [1.1, 1.1], add: [...[[-14, -2], [12, 6], [-2, 24], [10, -12]].map(([x, y]) => ({ t: 'ellipse', cx: x, cy: y, rx: 2.4, ry: 3.2, f: 'a', ns: true, op: 0.8 }))] },
      3: { grow: [1.08, 1.08], add: [evoRing(2, -10, 4.6, 'a', 1.2, { op: 0.7 }), evoRing(-4, 0, 4.6, 'a', 1.2, { op: 0.7 }), evoRing(0, 16, 4.6, 'a', 1.2, { op: 0.7 })] },
    } }),
  bPart({ id: 'tuxedo', slot: 'chest', name: 'Tuxedo', tags: ['penguin'], dom: 0.5, w: 2, extra: [S(tuxPts, 's', { ns: true }), SH('M-22,10 C-12,24 12,26 22,10 L22,34 L-22,34 Z', 0.1)],
    stages: {
      2: { grow: [1.08, 1.08], add: [L('M-8,-30 C-2,-22 2,-22 8,-32', 'a', 2, { ns: true, op: 0.7 }), C(0, -12, 1.6, 'a', { ns: true }), C(0, 0, 1.6, 'a', { ns: true }), C(0, 12, 1.6, 'a', { ns: true })] },
      3: { grow: [1.06, 1.06], add: [S([[-8, -26], [0, -20], [8, -26], [4, -18], [8, -12], [0, -14], [-8, -12], [-4, -18]], 'a', { ns: true, op: 0.9 }), ...evoGem(0, 2, 2.6)] },
    } }),
  bPart({ id: 'medallion', slot: 'chest', name: 'Medallion', tags: ['mark'], dom: 0.45, w: 1, extra: [E(0, 2, 9, 11, 'a', { sw: 2 }), E(0, 2, 5, 6.5, 's', { ns: true }), C(0, 2, 2.2, 'k', { ns: true, op: 0.5 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [L(spline9(0, 2, 12, 14), 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.08, 1.08], add: [P(sparklePath(-12, -10, 3.6), 'a', { ns: true }), P(sparklePath(12, -8, 3, 20), 'a', { ns: true }), P(sparklePath(0, 18, 3, 40), 'a', { ns: true, op: 0.85 }), C(0, 2, 16, 'a', { ns: true, op: 0.15 })] },
    } }),
  bPart({ id: 'scales', slot: 'chest', name: 'Scaled breast', tags: ['pattern'], dom: 0.45, w: 2, extra: [L('M-12,-6 Q-8,0 -4,-6 Q0,0 4,-6 Q8,0 12,-6 M-10,4 Q-6,10 -2,4 Q2,10 6,4 Q10,10 14,4 M-12,14 Q-8,20 -4,14 Q0,20 4,14 Q8,20 12,14', 'k', 1.3, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.1], add: [L('M-12,-16 Q-8,-10 -4,-16 Q0,-10 4,-16 Q8,-10 12,-16', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.08, 1.08], add: [...[[-8, -3], [0, -3], [8, -3], [-4, 7], [4, 7], [-8, 17], [0, 17], [8, 17]].map(([x, y]) => C(x, y, 1.4, 'a', { ns: true, op: 0.8 }))] },
    } }),
];

/** Ellipse outline as a closed spline path (no arcs, so it scales cleanly). */
function spline9(cx, cy, rx, ry) { return xfPtsPath(arcPts(cx, cy, rx, ry, 0, 330, 11)); }
function xfPtsPath(pts) { let d = ''; pts.forEach(([x, y], i) => { d += `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)} `; }); return d.trim() + 'Z'; }

const mantlePts = [[14, 2], [4, -8], [-12, -10], [-28, -4], [-36, 10], [-34, 24, 0.3], [-26, 18], [-22, 30, 0.3], [-14, 20], [-8, 30, 0.3], [-2, 18], [8, 12]];
const flameCapePts = [[14, 2], [6, -12], [-2, -30, 0.2], [-8, -12], [-18, -34, 0.2], [-20, -12], [-32, -26, 0.2], [-30, -6], [-44, -8, 0.2], [-32, 6], [-40, 20, 0.2], [-24, 16], [-10, 20]];
const starCloakPts = [[14, 2], [2, -10], [-14, -12], [-30, -6], [-40, 10], [-38, 28, 0.3], [-28, 22], [-20, 32, 0.3], [-10, 22], [0, 30, 0.3], [8, 14]];
const covertsPts = [[14, 2], [6, -6], [-8, -8], [-22, -4], [-30, 6, 0.4], [-24, 8], [-28, 16, 0.4], [-18, 14], [-20, 22, 0.4], [-10, 18], [-8, 26, 0.4], [0, 16], [8, 10]];
const saddlePts = [[16, 0], [4, -8], [-12, -10], [-26, -6], [-32, 4], [-26, 14], [-12, 18], [4, 14]];

export const B_BACKS = [
  NONE('back', 0.3, 'b.'),
  bPart({ id: 'mantle', slot: 'back', name: 'Mantle', tags: ['cape'], dom: 0.5, w: 2, shapes: [mantlePts], extra: [L('M-4,-4 L-6,24 M-14,-6 L-20,26 M-24,-2 L-30,20', 'k', 1.1, { op: 0.25 }), SH('M-38,12 C-28,26 -12,30 8,16 L10,36 L-38,36 Z', 0.12)],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M-4,-4 L-6,24 M-14,-6 L-20,26 M-24,-2 L-30,20', 'a', 1.5, { ns: true, op: 0.6 }), C(-8, 30, 2.2, 'a', { ns: true }), C(-22, 30, 2.2, 'a', { ns: true }), C(-34, 24, 2.2, 'a', { ns: true })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(mantlePts, { sx: 1.28, sy: 1.28 }), f: 'pd' }], add: [...evoGem(-12, 4, 3)] },
    } }),
  bPart({ id: 'flame', slot: 'back', name: 'Flame cape', tags: ['fire'], dom: 0.5, w: 1, shapes: [flameCapePts], extra: [S([[10, 0], [4, -12], [-4, -20], [-10, -8], [-18, -18], [-20, -4], [-30, -6], [-24, 6], [-14, 10]], 's', { ns: true, cl: true }), HL('M-2,-6 C-6,-14 -10,-16 -14,-24 L-10,-24 C-6,-16 -2,-12 2,-6 Z', 0.3)],
    stages: {
      2: { grow: [1.1, 1.15], add: [S([[8, 0], [3, -12], [-3, -22, 0.2], [-9, -8], [-17, -22, 0.2], [-19, -4], [-30, -10, 0.2], [-24, 4], [-14, 8]], 'a', { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(flameCapePts, { sx: 1.3, sy: 1.3 }), f: 'a' }] },
    } }),
  bPart({ id: 'starcloak', slot: 'back', name: 'Star cloak', tags: ['night'], dom: 0.5, w: 1, shapes: [starCloakPts], extra: [...[[-10, 0], [-24, 8], [-30, 22], [-14, 18], [0, 12], [-22, -4]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 3, f: 'a', ns: true, cl: true, op: 0.4 }, { t: 'circle', cx: x, cy: y, r: 1.3, f: 'w', ns: true, cl: true }]), SH('M-42,14 C-30,28 -12,32 10,18 L12,38 L-42,38 Z', 0.12)],
    stages: {
      2: { grow: [1.1, 1.15], add: [...[[-34, 4], [-4, 22], [-18, 28], [4, 0]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 2.6, f: 'a', ns: true, cl: true, op: 0.4 }, { t: 'circle', cx: x, cy: y, r: 1.2, f: 'w', ns: true, cl: true }])] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(starCloakPts, { sx: 1.28, sy: 1.28 }), f: 'pd' }], add: [P(sparklePath(-24, 8, 4.5), 'w', { ns: true, cl: true, op: 0.9 }), P(sparklePath(-10, 0, 3.4, 20), 'w', { ns: true, cl: true, op: 0.8 }), L('M-10,0 L-24,8 L-30,22 M-24,8 L-22,-4', 'w', 1, { ns: true, cl: true, op: 0.35 })] },
    } }),
  bPart({ id: 'coverts', slot: 'back', name: 'Coverts', tags: ['feathers'], dom: 0.45, w: 2, shapes: [covertsPts], extra: [L('M-2,-2 Q-8,4 -2,10 M-12,-4 Q-18,4 -12,12 M-22,0 Q-26,6 -22,12', 'k', 1.1, { op: 0.3 }), SH('M-32,10 C-22,24 -8,28 8,14 L10,34 L-32,34 Z', 0.12)],
    stages: {
      2: { grow: [1.1, 1.15], add: [C(-30, 6, 2, 'a', { ns: true }), C(-28, 16, 2, 'a', { ns: true }), C(-20, 22, 2, 'a', { ns: true }), C(-8, 26, 2, 'a', { ns: true })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(covertsPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [L('M-2,-2 Q-8,4 -2,10 M-12,-4 Q-18,4 -12,12 M-22,0 Q-26,6 -22,12', 'a', 1.4, { ns: true, op: 0.6 })] },
    } }),
  bPart({ id: 'saddle', slot: 'back', name: 'Saddle', tags: ['patch'], dom: 0.45, w: 2, shapes: [saddlePts], extra: [S([[10, 0], [2, -5], [-12, -7], [-24, -4], [-26, 4], [-22, 10], [-12, 13], [2, 10]], 's', { ns: true, cl: true, op: 0.45 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M-24,-4 C-16,-8 -6,-8 4,-6', 'a', 1.6, { ns: true, cl: true, op: 0.7 })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(saddlePts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-10, 4, 3)] },
    } }),
  bPart({ id: 'icicles', slot: 'back', name: 'Icicles', tags: ['ice'], dom: 0.45, w: 1, extra: [P('M8,0 L2,-14 L-4,-30 L-2,-10 Z', 'pl'), P('M-6,2 L-14,-10 L-22,-26 L-16,-8 Z', 'p'), P('M-18,6 L-28,-2 L-40,-12 L-30,0 Z', 'pd'), HL('M2,-12 L-2,-24 L0,-24 L4,-12 Z M-14,-8 L-20,-20 L-18,-20 L-12,-8 Z', 0.35)],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M14,-2 L12,-14 L10,-24 L8,-8 Z', 'pl'), C(-4, -31, 1.8, 'a', { ns: true, op: 0.8 }), C(-22, -27, 1.8, 'a', { ns: true, op: 0.8 }), C(-40, -13, 1.8, 'a', { ns: true, op: 0.8 })] },
      3: { grow: [1.08, 1.1], add: [P('M-30,10 L-44,4 L-58,0 L-42,10 Z', 'pd'), P('M-12,-20 L-8,-36 L-6,-46 L-10,-30 Z', 'pl'), C(-6, -47, 2, 'a', { ns: true, op: 0.8 }), C(-58, 0, 1.8, 'a', { ns: true, op: 0.8 }), P(sparklePath(2, -34, 3, 20), 'w', { ns: true, op: 0.7 })] },
    } }),
  bPart({ id: 'leaves', slot: 'back', name: 'Leaf cloak', tags: ['grass'], dom: 0.45, w: 1, extra: [S([[8, 0], [0, -14], [-10, -22, 'c'], [-12, -8], [-6, 2]], 'p'), S([[-4, 4], [-16, -6], [-30, -8, 'c'], [-26, 4], [-14, 12]], 'pd'), S([[-6, 12], [-20, 14], [-34, 24, 'c'], [-22, 24], [-10, 20]], 'p'), L('M0,-2 L-8,-18 M-8,6 L-26,-4 M-10,16 L-30,22', 'k', 1.2, { op: 0.35 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [S([[6, -4], [8, -18], [4, -30, 'c'], [-2, -18], [0, -6]], 'pd'), C(-2, -4, 2.2, 'a', { ns: true }), C(-8, 6, 2, 'a', { ns: true })] },
      3: { grow: [1.08, 1.1], addBehind: [{ pts: [[10, 2], [-4, -18], [-18, -30, 'c'], [-16, -10], [-40, -14, 'c'], [-34, 4], [-46, 28, 'c'], [-28, 30], [-12, 24], [-4, 12]], f: 'pd' }], add: [C(-6, 14, 2.4, 'a', { ns: true }), C(-14, 2, 2, 'a', { ns: true }), C(-4, -12, 1.8, 'a', { ns: true })] },
    } }),
];

export const B_PATTERNS = [
  NONE('pattern', 0.3, 'b.'),
  bPart({ id: 'belly', slot: 'pattern', name: 'Light belly', tags: ['soft'], dom: 0.5, w: 3, extra: [S([[54, -10], [36, -20], [10, -22], [-14, -14], [-28, 6], [-24, 28], [0, 40], [54, 40]], 's', { ns: true })],
    stages: {
      2: { add: [L('M34,-16 C12,-18 -10,-12 -22,6', 'a', 2.2, { ns: true, op: 0.6 })] },
      3: { add: [L('M-16,16 L20,16 M-10,26 L26,26', 'k', 1.2, { ns: true, op: 0.18 }), C(0, 0, 1.6, 'w', { ns: true, op: 0.5 }), C(16, -8, 1.6, 'w', { ns: true, op: 0.5 }), C(-12, 6, 1.6, 'w', { ns: true, op: 0.5 })] },
    } }),
  bPart({ id: 'stripes', slot: 'pattern', name: 'Chevrons', tags: ['striped'], dom: 0.5, w: 2, extra: [S([[-40, -22], [-20, -28], [0, -20], [20, -28], [40, -22], [40, -14], [20, -20], [0, -12], [-20, -20], [-40, -14]], 'a', { ns: true }), S([[-40, -2], [-20, -8], [0, 0], [20, -8], [40, -2], [40, 6], [20, 0], [0, 8], [-20, 0], [-40, 6]], 'a', { ns: true }), S([[-40, 18], [-20, 12], [0, 20], [20, 12], [40, 18], [40, 26], [20, 20], [0, 28], [-20, 20], [-40, 26]], 'a', { ns: true })],
    stages: {
      2: { add: [S([[-40, -40], [-20, -46], [0, -38], [20, -46], [40, -40], [40, -34], [20, -40], [0, -32], [-20, -40], [-40, -34]], 'a', { ns: true })] },
      3: { add: [C(-30, -8, 2.2, 'w', { ns: true, op: 0.55 }), C(-10, -14, 2.2, 'w', { ns: true, op: 0.55 }), C(10, -14, 2.2, 'w', { ns: true, op: 0.55 }), C(30, -8, 2.2, 'w', { ns: true, op: 0.55 }), C(-30, 12, 2, 'w', { ns: true, op: 0.5 }), C(0, 14, 2, 'w', { ns: true, op: 0.5 }), C(30, 12, 2, 'w', { ns: true, op: 0.5 })] },
    } }),
  bPart({ id: 'spots', slot: 'pattern', name: 'Iridescent patches', tags: ['iridescent', 'sheen'], dom: 0.45, w: 2, extra: [{ t: 'ellipse', cx: -24, cy: -12, rx: 13, ry: 8, f: 'a', ns: true, op: 0.75 }, { t: 'ellipse', cx: -10, cy: -4, rx: 10, ry: 7, f: 'al', ns: true, op: 0.6 }, { t: 'ellipse', cx: 12, cy: -14, rx: 12, ry: 7.5, f: 'a', ns: true, op: 0.7 }, { t: 'ellipse', cx: 26, cy: -2, rx: 11, ry: 7, f: 'al', ns: true, op: 0.6 }, { t: 'ellipse', cx: 4, cy: 12, rx: 12, ry: 7, f: 'a', ns: true, op: 0.65 }, L('M-32,-16 C-26,-21 -18,-21 -12,-17 M4,-18 C10,-22 18,-22 24,-18 M-4,8 C2,4 10,4 16,8', 'w', 1.6, { ns: true, op: 0.45 })],
    stages: {
      2: { add: [{ t: 'ellipse', cx: -40, cy: 8, rx: 9, ry: 6, f: 'al', ns: true, op: 0.6 }, { t: 'ellipse', cx: 36, cy: -20, rx: 9, ry: 6, f: 'a', ns: true, op: 0.7 }, { t: 'ellipse', cx: 30, cy: 16, rx: 10, ry: 6, f: 'a', ns: true, op: 0.6 }, L('M-46,6 C-42,2 -36,2 -32,6 M30,-24 C34,-27 40,-27 44,-24', 'w', 1.4, { ns: true, op: 0.45 })] },
      3: { add: [L('M-30,-4 C-20,-10 -8,-10 2,-6 M8,-2 C18,-8 30,-8 40,-4 M-12,16 C-2,10 12,10 22,16', 'w', 2.2, { ns: true, op: 0.4 }), evoRing(-24, -12, 8, 'w', 1, { op: 0.4 }), evoRing(12, -14, 7.5, 'w', 1, { op: 0.4 }), C(-10, -4, 1.6, 'w', { ns: true, op: 0.8 }), C(26, -2, 1.6, 'w', { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'bars', slot: 'pattern', name: 'Barred', tags: ['hawk'], dom: 0.45, w: 2, extra: [L('M-44,-26 Q-20,-20 4,-26 Q28,-32 52,-26 M-46,-12 Q-20,-6 4,-12 Q28,-18 52,-12 M-46,2 Q-20,8 4,2 Q28,-4 52,2 M-44,16 Q-20,22 4,16 Q28,10 50,16 M-40,30 Q-20,36 4,30 Q26,24 46,30', 'k', 3, { op: 0.3 })],
    stages: {
      2: { add: [L('M-44,-38 Q-20,-32 4,-38 Q28,-44 52,-38', 'a', 3, { ns: true, op: 0.6 })] },
      3: { add: [...[[-20, -19], [28, -19], [-20, 9], [28, 9], [4, -5], [4, 23]].map(([x, y]) => C(x, y, 2, 'a', { ns: true, op: 0.7 }))] },
    } }),
  bPart({ id: 'patches', slot: 'pattern', name: 'Wing bars', tags: ['bars', 'wing'], dom: 0.45, w: 2, extra: [S([[-46, 4], [-12, -11.3], [-8.5, -4.300000000000001], [-42.5, 11]], 'a', { ns: true }), S([[-30, 16], [4, 0.6999999999999993], [7.5, 7.699999999999999], [-26.5, 23]], 'a', { ns: true }), S([[-12, 26], [18, 12.5], [21, 18.5], [-9, 32]], 'a', { ns: true }), L('M-46,3 L-12,-12 M-30,15 L4,0 M-12,25 L18,12', 'w', 1.6, { ns: true, op: 0.5 })],
    stages: {
      2: { add: [S([[-56, -10], [-26, -23.5], [-23, -17.5], [-53, -4]], 'a', { ns: true }), L('M-56,-11 L-26,-24', 'w', 1.6, { ns: true, op: 0.5 })] },
      3: { add: [L('M-40,12 L-6,-3 M-24,24 L10,9', 'k', 1.4, { ns: true, op: 0.22 }), C(-10, -10, 1.8, 'w', { ns: true, op: 0.8 }), C(6, 2, 1.8, 'w', { ns: true, op: 0.8 }), C(20, 14, 1.6, 'w', { ns: true, op: 0.8 }), S([[-44, 6], [-10, -9.3], [-8.5, -6.300000000000001], [-42.5, 9]], 'ad', { ns: true, op: 0.8 })] },
    } }),
  bPart({ id: 'gradient', slot: 'pattern', name: 'Cap and bib', tags: ['cap', 'bib'], dom: 0.5, w: 2, extra: [S([[-56, -40], [56, -40], [56, -16], [40, -10, 'c'], [26, -14], [12, -8, 'c'], [-2, -14], [-16, -8, 'c'], [-30, -14], [-44, -10, 'c'], [-56, -16]], 'a', { ns: true, spline: { tension: 0.45 } }), S([[16, -4], [32, -8], [46, -2], [54, 10], [54, 40], [14, 40], [8, 22], [10, 6]], 's', { ns: true }), L('M14,-2 C20,-6 30,-7 40,-4', 'k', 1.2, { ns: true, op: 0.25 })],
    stages: {
      2: { add: [L('M-40,-30 C-20,-36 10,-36 36,-28', 'w', 2, { ns: true, op: 0.3 }), S([[22, 4], [36, 0], [46, 8], [46, 28], [22, 28], [18, 16]], 'sl', { ns: true, op: 0.7 })] },
      3: { add: [S([[-8, -14], [4, -30], [14, -12]], 'a', { ns: true }), ...[[24, 10], [38, 8], [30, 20], [44, 22], [22, 30]].map(([x, y]) => C(x, y, 2, 'a', { ns: true, op: 0.85 })), L('M-50,-20 C-30,-26 10,-26 40,-20', 'k', 1.2, { ns: true, op: 0.2 })] },
    } }),
  bPart({ id: 'speckles', slot: 'pattern', name: 'Speckles', tags: ['starling'], dom: 0.45, w: 2, extra: [...Array.from({ length: 22 }, (_, i) => { const x = -42 + (i % 6) * 16 + (Math.floor(i / 6) % 2 ? 8 : 0), y = -28 + Math.floor(i / 6) * 16; return { t: 'ellipse', cx: x, cy: y, rx: 1.8, ry: 2.6, f: 's', ns: true, op: 0.85 }; })],
    stages: {
      2: { add: Array.from({ length: 18 }, (_, i) => { const x = -34 + (i % 6) * 16 + (Math.floor(i / 6) % 2 ? 8 : 0), y = -20 + Math.floor(i / 6) * 16; return { t: 'ellipse', cx: x, cy: y, rx: 1.3, ry: 2, f: 'a', ns: true, op: 0.7 }; }) },
      3: { add: [C(-26, -28, 3, 'a', { ns: true, op: 0.8 }), C(6, -12, 3, 'a', { ns: true, op: 0.8 }), C(38, 4, 3, 'a', { ns: true, op: 0.8 }), C(-18, 20, 2.8, 'a', { ns: true, op: 0.8 }), C(22, 20, 2.8, 'a', { ns: true, op: 0.8 })] },
    } }),
];
