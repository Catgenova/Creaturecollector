// Amphibian back features (warts, moss, ridges along the spine; origin = the back socket, drawn
// behind the body) and patterns (clipped to the body, 100 x 60 frame).
// Evolutions: backs add warts, flowers, rays, shards or another mushroom, then layer a taller
// silhouette behind; patterns add elements, then a second layer of rings, dots and embers.
import { aPart } from './_shared.js';
import { NONE, S, L, P, C, E, SH, HL, fur, xfPts } from '../_dsl.js';
import { evoGem, evoRing } from '../_evo.js';

const mossBackPts = [[24, 6], ...fur([24, 6], [-34, 6], 7, -8, { tip: 0.7, lean: 0.1, wobble: 0.3 }), [-36, 10], [24, 10]];
const ridgeBackPts = [[26, 6], [24, -1], [19, -9, 0.3], [13, -2], [7, -11, 0.3], [1, -3], [-6, -12, 0.3], [-12, -3], [-19, -11, 0.3], [-25, -2], [-31, -9, 0.3], [-36, -1], [-38, 8], [26, 10]];
const flameBackPts = [[24, 6], [22, -4], [16, -14, 0.2], [12, -4], [4, -18, 0.2], [0, -6], [-8, -20, 0.2], [-12, -6], [-22, -14, 0.2], [-24, -2], [-34, -4, 0.2], [-36, 8], [24, 10]];
const boulderPts = [[22, 6], [18, -8], [4, -18], [-14, -20], [-30, -10], [-36, 4], [-34, 10], [22, 10]];
const shroom = (x, y, r) => [L(`M${x},${y + 6} L${x},${y - r * 0.4}`, 'k', 5), L(`M${x},${y + 6} L${x},${y - r * 0.4}`, 's', 2.6), S([[x - r, y - r * 0.2], [x - r * 0.7, y - r], [x, y - r * 1.3], [x + r * 0.7, y - r], [x + r, y - r * 0.2], [x, y]], 'p'), C(x - r * 0.3, y - r * 0.8, r * 0.18, 'w', { ns: true, op: 0.85 })];

export const A_BACKS = [
  NONE('back', 0.3, 'a.'),
  aPart({ id: 'warts', slot: 'back', name: 'Warts', tags: ['toad'], dom: 0.5, w: 3, extra: [...[[18, 2, 4, 'a'], [6, -2, 5, 'p'], [-8, -1, 4.5, 'a'], [-22, 2, 4, 'p'], [-32, 6, 3, 'a']].map(([x, y, r, f]) => C(x, y, r, f, { sw: 1.6 })), HL('M4,-5 C6,-7 9,-6 9,-3 L6,-3 Z M-10,-4 C-8,-6 -5,-5 -5,-2 L-8,-2 Z', 0.3)],
    stages: {
      2: { grow: [1.1, 1.2], add: [C(26, 4, 3, 'p', { sw: 1.4 }), C(-2, -6, 3.2, 'a', { sw: 1.4 }), C(-16, -4, 3, 'p', { sw: 1.4 })] },
      3: { grow: [1.05, 1.1], add: [evoRing(6, -2, 7.5, 'a', 1.2, { op: 0.6 }), evoRing(-8, -1, 7, 'a', 1.2, { op: 0.6 }), evoRing(18, 2, 6.5, 'a', 1.2, { op: 0.6 }), C(6, -2, 2, 'w', { ns: true, op: 0.6 }), C(-22, 2, 1.6, 'w', { ns: true, op: 0.6 })] },
    } }),
  aPart({ id: 'moss', slot: 'back', name: 'Moss', tags: ['grass'], dom: 0.5, w: 2, shapes: [mossBackPts], extra: [S([[18, 4], [8, -1], [-6, -2], [-20, 0], [-28, 4]], 's', { ns: true, cl: true, op: 0.35 })],
    stages: {
      2: { grow: [1.05, 1.35], add: [C(12, -4, 1.8, 'a', { ns: true }), C(-4, -6, 1.8, 'a', { ns: true }), C(-22, -3, 1.8, 'a', { ns: true })] },
      3: { grow: [1.05, 1.25], addBehind: [{ pts: xfPts(mossBackPts, { sx: 1.08, sy: 1.6 }), f: 'pd' }], add: [C(4, -10, 2.2, 'a', { ns: true }), C(-14, -9, 2, 'a', { ns: true }), C(20, -6, 1.8, 'a', { ns: true })] },
    } }),
  aPart({ id: 'ridge', slot: 'back', name: 'Crest ridge', tags: ['newt', 'fin'], dom: 0.5, w: 2, shapes: [ridgeBackPts], extra: [S([[22, 4], [18, -5], [13, 0], [7, -7], [1, -1], [-6, -8], [-12, -1], [-19, -7], [-25, 0], [-31, -5], [-34, 4]], 's', { ns: true, cl: true, op: 0.45 }), L('M19,-7 L17,2 M7,-9 L5,1 M-6,-10 L-8,1 M-19,-9 L-21,1 M-31,-7 L-32,2', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.05, 1.3], add: [L('M19,-7 L17,2 M7,-9 L5,1 M-6,-10 L-8,1 M-19,-9 L-21,1 M-31,-7 L-32,2', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.05, 1.2], addBehind: [{ pts: xfPts(ridgeBackPts, { sx: 1.08, sy: 1.6 }), f: 'pd' }], add: [...evoGem(-6, -3, 2.6)] },
    } }),
  aPart({ id: 'spikes', slot: 'back', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[26, 6], ...fur([26, 6], [-32, 6], 5, -12, { lean: 0.4, tip: 'c', wobble: 0.2 }), [-36, 10], [26, 10]]], extra: [SH('M-38,4 L28,4 L28,14 L-38,14 Z', 0.12)],
    stages: {
      2: { grow: [1.05, 1.3], add: [L('M12,-6 L14,-12 M0,-7 L2,-13 M-12,-6 L-10,-12 M-24,-5 L-22,-10', 'a', 2, { ns: true, op: 0.85 })] },
      3: { grow: [1.05, 1.25], addBehind: [{ pts: [[30, 8], ...fur([30, 8], [-36, 8], 6, -20, { lean: 0.4, tip: 'c', wobble: 0.2 }), [-40, 12], [30, 12]], f: 'pd' }], spikes: true },
    } }),
  aPart({ id: 'mushrooms', slot: 'back', name: 'Mushrooms', tags: ['poison'], dom: 0.5, w: 2, extra: [...[[14, 0, 7], [-4, -4, 9], [-22, 0, 6]].flatMap(([x, y, r]) => shroom(x, y, r))],
    stages: {
      2: { grow: [1.08, 1.18], add: [...shroom(28, 4, 4.5), ...shroom(-34, 4, 4)] },
      3: { grow: [1.05, 1.1], add: [C(-4, -18, 1.8, 'a', { ns: true, op: 0.8 }), C(4, -20, 1.4, 'a', { ns: true, op: 0.7 }), C(-12, -20, 1.4, 'a', { ns: true, op: 0.7 }), C(14, -12, 1.4, 'a', { ns: true, op: 0.7 }), C(-24, -10, 1.2, 'a', { ns: true, op: 0.7 }), ...shroom(4, 6, 3.5)] },
    } }),
  aPart({ id: 'flames', slot: 'back', name: 'Flame ridge', tags: ['fire'], dom: 0.5, w: 1, shapes: [flameBackPts], extra: [S([[18, 4], [14, -6], [10, -2], [4, -10], [0, -2], [-8, -12], [-12, -2], [-20, -6], [-24, 2], [-30, 4]], 's', { ns: true, cl: true }), HL('M2,-6 C4,-10 4,-14 6,-16 L8,-14 C6,-10 6,-6 4,-2 Z', 0.3)],
    stages: {
      2: { grow: [1.08, 1.25], add: [S([[16, 4], [13, -4], [10, 0], [4, -8], [0, 0], [-8, -10], [-12, 0], [-20, -4], [-24, 3], [-28, 5]], 'a', { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.05, 1.2], addBehind: [{ pts: xfPts(flameBackPts, { sx: 1.15, sy: 1.5 }), f: 'a' }] },
    } }),
  aPart({ id: 'boulder', slot: 'back', name: 'Boulder', tags: ['rock'], dom: 0.5, w: 2, shapes: [boulderPts], extra: [L('M8,-12 L2,-4 M-12,-14 L-16,-4 M-22,-8 L-26,2', 'k', 1.2, { op: 0.3 }), S([[12, -4], [4, -10], [-8, -12], [-18, -6], [-20, 2]], 'a', { ns: true, cl: true, op: 0.4 }), HL('M2,-14 C-4,-16 -12,-14 -18,-10 L-14,-6 C-8,-10 -2,-12 4,-10 Z', 0.2)],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-2,-16 L4,-30 L10,-14 Z', 'a', { sw: 1.4 }), P('M-20,-14 L-18,-26 L-10,-12 Z', 'a', { sw: 1.4 })] },
      3: { grow: [1.05, 1.1], addBehind: [{ pts: xfPts(boulderPts, { sx: 1.25, sy: 1.35 }), f: 'pd' }], add: [P('M14,-10 L22,-26 L26,-8 Z', 'a', { sw: 1.4 }), C(-8, -6, 2, 'a', { ns: true, op: 0.6 }), C(6, -4, 1.6, 'a', { ns: true, op: 0.6 })] },
    } }),
];

export const A_PATTERNS = [
  NONE('pattern', 0.3, 'a.'),
  aPart({ id: 'belly', slot: 'pattern', name: 'Light belly', tags: ['soft'], dom: 0.5, w: 3, extra: [S([[-54, 12], [-30, 6], [0, 4], [30, 6], [54, 12], [54, 40], [-54, 40]], 's', { ns: true })],
    stages: {
      2: { add: [L('M-50,10 C-26,4 26,4 50,10', 'a', 2.2, { ns: true, op: 0.6 })] },
      3: { add: [L('M-40,22 L40,22 M-42,30 L42,30', 'k', 1.2, { ns: true, op: 0.18 }), C(-24, 16, 1.6, 'w', { ns: true, op: 0.5 }), C(0, 14, 1.6, 'w', { ns: true, op: 0.5 }), C(24, 16, 1.6, 'w', { ns: true, op: 0.5 })] },
    } }),
  aPart({ id: 'spots', slot: 'pattern', name: 'Ringed spots', tags: ['spotted'], dom: 0.5, w: 3, extra: [...[[-30, -14, 6], [-8, -22, 5.5], [12, -16, 6], [32, -14, 5], [-20, 2, 5], [2, 0, 5.5], [24, 6, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })])],
    stages: {
      2: { add: [[-42, 8, 4.5], [40, -26, 4.5], [-4, 14, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })]) },
      3: { add: [evoRing(-8, -22, 8.5, 'a', 1.6), evoRing(12, -16, 9, 'a', 1.6), evoRing(2, 0, 8.5, 'a', 1.6)] },
    } }),
  aPart({ id: 'stripes', slot: 'pattern', name: 'Wave bands', tags: ['striped'], dom: 0.5, w: 2, extra: [S([[-46, -20], [-24, -26], [0, -18], [24, -26], [46, -20], [46, -12], [24, -18], [0, -10], [-24, -18], [-46, -12]], 'a', { ns: true }), S([[-46, 0], [-24, -6], [0, 2], [24, -6], [46, 0], [46, 8], [24, 2], [0, 10], [-24, 2], [-46, 8]], 'a', { ns: true }), S([[-44, 20], [-22, 14], [0, 22], [22, 14], [44, 20], [44, 28], [22, 22], [0, 30], [-22, 22], [-44, 28]], 'a', { ns: true })],
    stages: {
      2: { add: [S([[-46, -36], [-24, -42], [0, -34], [24, -42], [46, -36], [46, -30], [24, -36], [0, -28], [-24, -36], [-46, -30]], 'a', { ns: true })] },
      3: { add: [C(-34, -6, 2.2, 'w', { ns: true, op: 0.55 }), C(-12, -12, 2.2, 'w', { ns: true, op: 0.55 }), C(12, -12, 2.2, 'w', { ns: true, op: 0.55 }), C(34, -6, 2.2, 'w', { ns: true, op: 0.55 }), C(-34, 14, 2, 'w', { ns: true, op: 0.5 }), C(0, 16, 2, 'w', { ns: true, op: 0.5 }), C(34, 14, 2, 'w', { ns: true, op: 0.5 })] },
    } }),
  aPart({ id: 'blotches', slot: 'pattern', name: 'Blotches', tags: ['toad'], dom: 0.45, w: 2, extra: [S([[-40, -22], [-22, -30], [-12, -14], [-24, -4], [-44, -10]], 'a', { ns: true, op: 0.8 }), S([[-4, -28], [16, -32], [26, -16], [12, -6], [-6, -12]], 'a', { ns: true, op: 0.8 }), S([[-16, 6], [2, 2], [10, 16], [-4, 24], [-20, 16]], 'a', { ns: true, op: 0.8 }), S([[20, 4], [38, -2], [46, 12], [32, 20], [18, 14]], 'a', { ns: true, op: 0.8 })],
    stages: {
      2: { add: [S([[36, -30], [50, -34], [54, -22], [44, -16], [34, -22]], 'a', { ns: true, op: 0.8 }), S([[-52, 6], [-40, 2], [-34, 14], [-44, 22], [-54, 16]], 'a', { ns: true, op: 0.8 })] },
      3: { add: [C(-28, -16, 3, 's', { ns: true, op: 0.8 }), C(10, -18, 3, 's', { ns: true, op: 0.8 }), C(-4, 12, 3, 's', { ns: true, op: 0.8 }), C(32, 8, 2.8, 's', { ns: true, op: 0.8 })] },
    } }),
  aPart({ id: 'speckles', slot: 'pattern', name: 'Speckles', tags: ['texture'], dom: 0.45, w: 2, extra: [...Array.from({ length: 24 }, (_, i) => { const x = -44 + (i % 8) * 12 + (Math.floor(i / 8) % 2 ? 6 : 0), y = -22 + Math.floor(i / 8) * 18; return { t: 'circle', cx: x, cy: y, r: 2, f: 'a', ns: true, op: 0.8 }; })],
    stages: {
      2: { add: Array.from({ length: 16 }, (_, i) => { const x = -38 + (i % 8) * 12 + (Math.floor(i / 8) % 2 ? 6 : 0), y = -13 + Math.floor(i / 8) * 18; return { t: 'circle', cx: x, cy: y, r: 1.4, f: 'a', ns: true, op: 0.7 }; }) },
      3: { add: [C(-32, -22, 3.4, 's', { ns: true, op: 0.8 }), C(4, -4, 3.4, 's', { ns: true, op: 0.8 }), C(34, 14, 3.4, 's', { ns: true, op: 0.8 }), C(-20, 14, 3, 's', { ns: true, op: 0.8 }), C(28, -22, 3, 's', { ns: true, op: 0.8 })] },
    } }),
  aPart({ id: 'gradient', slot: 'pattern', name: 'Dark back', tags: ['gradient'], dom: 0.5, w: 2, extra: [S([[-54, -40], [54, -40], [54, -12], [26, 0], [-8, 2], [-36, -2], [-56, -12]], 'a', { ns: true }), S([[-46, -40], [46, -40], [46, -26], [22, -16], [-6, -14], [-30, -18], [-48, -26]], 'k', { ns: true, op: 0.12 })],
    stages: {
      2: { add: [S([[38, -4], [44, 12, 'c'], [48, -6]], 'a', { ns: true }), S([[-2, 0], [2, 16, 'c'], [8, -2]], 'a', { ns: true }), S([[-40, -4], [-38, 12, 'c'], [-32, -6]], 'a', { ns: true })] },
      3: { add: [C(30, -22, 2.4, 'w', { ns: true, op: 0.5 }), C(-10, -26, 2, 'w', { ns: true, op: 0.45 }), C(10, -16, 1.8, 'w', { ns: true, op: 0.45 }), C(-30, -24, 2.2, 'w', { ns: true, op: 0.5 })] },
    } }),
  aPart({ id: 'rings', slot: 'pattern', name: 'Rings', tags: ['ringed'], dom: 0.45, w: 2, extra: [...[[-28, -12, 8], [0, -18, 9], [26, -8, 7], [-12, 10, 7], [18, 12, 6]].flatMap(([x, y, r]) => [{ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }, { t: 'circle', cx: x, cy: y, r: r * 0.5, f: 'p', ns: true }])],
    stages: {
      2: { add: [[-46, 4, 5], [44, -22, 5]].flatMap(([x, y, r]) => [{ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }, { t: 'circle', cx: x, cy: y, r: r * 0.5, f: 'p', ns: true }]) },
      3: { add: [C(-28, -12, 2, 'a', { ns: true }), C(0, -18, 2.4, 'a', { ns: true }), C(26, -8, 1.8, 'a', { ns: true }), C(-12, 10, 1.8, 'a', { ns: true }), C(18, 12, 1.6, 'a', { ns: true })] },
    } }),
];
