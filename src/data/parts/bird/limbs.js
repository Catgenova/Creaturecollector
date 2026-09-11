// Bird wings (folded along the flank, origin = shoulder), tails (origin = rear, extend left),
// legs (origin = hip at the body's bottom; near leg drawn in front, far leg behind).
import { bPart } from './_shared.js';
import { NONE, S, L, P, C, SH, HL, fur, tube } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';

const feathers = (root, featherTips, op = 0.3) => L(featherTips.map(([x, y]) => `M${root[0]},${root[1]} L${x},${y}`).join(' '), 'k', 1.1, { op });
const covert = (pts, op = 0.4) => S(pts, 's', { ns: true, cl: true, op });
/** Glowing feather featherTips in the accent colour. */
const featherTips = (pts, r = 2.2) => pts.map(([x, y]) => C(x, y, r, 'a', { ns: true }));

export const B_WINGS = [
  bPart({ id: 'rounded', slot: 'wings', name: 'Rounded', tags: ['songbird'], dom: 0.5, w: 3, shapes: [[[0, -6], [12, -2], [16, 10], [10, 26], [-4, 34], [-18, 28], [-22, 12], [-14, 0]]], extra: [covert([[-2, -3], [8, 0], [12, 10], [8, 20], [-2, 26], [-12, 22], [-16, 12], [-10, 2]]), feathers([-4, 2], [[10, 24], [0, 32], [-12, 28], [-18, 16]]), ...featherTips([[10, 24], [0, 32], [-12, 28]]), SH('M-24,14 C-16,26 -4,32 10,26 L10,40 L-24,40 Z', 0.12)] }),
  bPart({ id: 'pointed', slot: 'wings', name: 'Pointed', tags: ['swift'], dom: 0.5, w: 2, shapes: [[[0, -6], [12, -2], [16, 10], [8, 28], [-8, 46, 'c'], [-16, 30], [-20, 12], [-14, 0]]], extra: [covert([[-2, -3], [8, 0], [12, 10], [6, 24], [-6, 38], [-12, 26], [-14, 12], [-10, 2]]), feathers([-4, 2], [[8, 26], [-6, 42], [-14, 28]]), ...featherTips([[8, 26], [-6, 42], [-14, 28]]), SH('M-22,16 C-14,30 -6,40 -6,46 L10,46 L10,26 Z', 0.12)] }),
  bPart({ id: 'long', slot: 'wings', name: 'Long', tags: ['albatross'], dom: 0.5, w: 2, shapes: [[[0, -6], [12, -2], [16, 8], [12, 22], [2, 38], [-12, 56, 'c'], [-16, 40], [-20, 20], [-16, 4]]], extra: [covert([[-2, -3], [8, 0], [12, 8], [8, 20], [0, 32], [-10, 46], [-14, 32], [-14, 12], [-10, 2]]), feathers([-4, 2], [[10, 22], [0, 38], [-10, 52], [-16, 36]]), ...featherTips([[10, 22], [0, 38], [-10, 52]]), SH('M-22,20 C-16,36 -12,48 -12,56 L14,56 L14,30 Z', 0.12)] }),
  bPart({ id: 'flipper', slot: 'wings', name: 'Flipper', tags: ['penguin'], dom: 0.5, w: 2, shapes: [[[0, -6], [8, -4], [10, 8], [8, 26], [2, 40, 0.4], [-6, 30], [-8, 10], [-6, 0]]], extra: [covert([[0, -3], [6, -1], [7, 8], [5, 24], [1, 34], [-3, 26], [-4, 10], [-3, 2]], 0.35), S([[7, -2], [9, 8], [7, 26], [2, 38], [-1, 32], [3, 10], [3, 0]], 'a', { ns: true, cl: true, op: 0.9 }), SH('M-10,20 C-6,32 0,38 2,40 L12,40 L12,24 Z', 0.12)] }),
  bPart({ id: 'stubby', slot: 'wings', name: 'Stubby', tags: ['chick'], dom: 0.4, w: 2, shapes: [[[0, -4], [8, -2], [10, 6], [6, 16], [-2, 20], [-10, 16], [-12, 6], [-8, 0]]], extra: [covert([[0, -1], [5, 1], [7, 6], [4, 13], [-2, 16], [-8, 12], [-8, 5], [-5, 1]]), feathers([-2, 1], [[6, 14], [-2, 18], [-9, 13]]), ...featherTips([[6, 14], [-2, 18], [-9, 13]], 1.8)] }),
  bPart({ id: 'broad', slot: 'wings', name: 'Broad', tags: ['eagle'], dom: 0.55, w: 2, shapes: [[[0, -8], [14, -4], [20, 10], [16, 24], [8, 34, 0.3], [4, 26], [-2, 38, 0.3], [-6, 26], [-14, 36, 0.3], [-18, 22], [-22, 10], [-16, -2]]], extra: [covert([[-2, -4], [10, -1], [16, 10], [12, 22], [4, 24], [-6, 24], [-16, 20], [-16, 10], [-12, 2]]), feathers([-4, 0], [[12, 22], [6, 30], [-2, 34], [-12, 32], [-18, 20]]), ...featherTips([[6, 30], [-2, 34], [-12, 32]]), SH('M-24,12 C-18,26 -8,32 10,30 L18,34 L18,40 L-24,40 Z', 0.12)] }),
  bPart({ id: 'lacy', slot: 'wings', name: 'Lacy', tags: ['fairy'], dom: 0.45, w: 1, shapes: [[[0, -6], [12, -2], [16, 8], [14, 18, 0.4], [10, 26], [6, 22, 0.4], [0, 34], [-6, 28, 0.4], [-12, 36], [-16, 26, 0.4], [-20, 12], [-14, 0]]], extra: [covert([[-2, -3], [8, 0], [12, 8], [10, 20], [2, 28], [-8, 28], [-14, 20], [-14, 10], [-10, 2]], 0.5), feathers([-4, 2], [[10, 24], [0, 32], [-12, 34], [-16, 22]]), P(sparklePath(-4, 12, 4.2), 'a', { ns: true }), P(sparklePath(7, 2, 2.6, 20), 'a', { ns: true, op: 0.8 }), SH('M-22,14 C-14,28 -4,34 10,26 L10,40 L-22,40 Z', 0.1)] }),
];

export const B_TAILS = [
  bPart({ id: 'fan', slot: 'tail', name: 'Fan', tags: ['classic'], dom: 0.5, w: 3, shapes: [[[0, -6], [-14, -10], [-30, -8], [-36, 0], [-30, 8], [-14, 10], [0, 6]]], extra: [covert([[-2, -4], [-14, -7], [-28, -5], [-32, 0], [-28, 5], [-14, 7], [-2, 4]]), feathers([-2, 0], [[-30, -6], [-34, 0], [-30, 6]]), ...featherTips([[-30, -6], [-34, 0], [-30, 6]]), SH('M-38,2 C-26,10 -10,12 2,8 L2,20 L-38,20 Z', 0.12)] }),
  bPart({ id: 'forked', slot: 'tail', name: 'Forked', tags: ['swallow'], dom: 0.5, w: 2, shapes: [[[0, -6], [-14, -12], [-34, -24], [-42, -26, 'c'], [-30, -8], [-24, 0], [-30, 8], [-42, 26, 'c'], [-34, 24], [-14, 12], [0, 6]]], extra: [covert([[-2, -4], [-14, -9], [-34, -20], [-26, -6], [-22, 0], [-26, 6], [-34, 20], [-14, 9], [-2, 4]]), feathers([-2, 0], [[-38, -22], [-28, -6], [-28, 6], [-38, 22]]), ...featherTips([[-38, -22], [-38, 22]], 2.6)] }),
  bPart({ id: 'long', slot: 'tail', name: 'Long train', tags: ['pheasant'], dom: 0.5, w: 2, shapes: [[[0, -6], [-16, -8], [-40, -8], [-64, -4], [-74, 2, 'c'], [-64, 6], [-40, 10], [-16, 10], [0, 6]]], extra: [covert([[-2, -4], [-16, -5], [-40, -5], [-64, -1], [-68, 2], [-64, 4], [-40, 7], [-16, 7], [-2, 4]]), L('M-10,-6 L-10,8 M-24,-7 L-24,9 M-38,-7 L-38,9 M-52,-5 L-52,8', 'k', 1.1, { op: 0.25 }), ...featherTips([[-17, 1], [-31, 1], [-45, 2], [-59, 2]], 3), ...featherTips([[-17, 1], [-31, 1], [-45, 2], [-59, 2]].map(([x, y]) => [x, y]), 1.2).map((c) => ({ ...c, f: 'w' })), SH('M-76,4 C-50,12 -20,14 2,8 L2,20 L-76,20 Z', 0.12)] }),
  bPart({ id: 'wedge', slot: 'tail', name: 'Wedge', tags: ['crow'], dom: 0.5, w: 2, shapes: [[[0, -6], [-14, -10], [-30, -10], [-40, -4], [-42, 2, 0.4], [-36, 8], [-22, 10], [0, 6]]], extra: [covert([[-2, -4], [-14, -7], [-30, -7], [-36, -2], [-34, 4], [-22, 7], [-2, 4]]), feathers([-2, 0], [[-34, -8], [-40, 0], [-34, 7]]), ...featherTips([[-34, -8], [-40, 0], [-34, 7]]), SH('M-44,2 C-30,10 -12,12 2,8 L2,20 L-44,20 Z', 0.12)] }),
  bPart({ id: 'pintail', slot: 'tail', name: 'Pintail', tags: ['duck'], dom: 0.45, w: 2, shapes: [[[0, -6], [-12, -8], [-28, -6], [-46, -14, 'c'], [-30, 0], [-24, 4], [-12, 8], [0, 6]]], extra: [covert([[-2, -4], [-12, -5], [-28, -3], [-38, -10], [-28, 0], [-12, 5], [-2, 4]]), feathers([-2, 0], [[-40, -12], [-28, -2], [-22, 4]]), ...featherTips([[-40, -12]], 2.6)] }),
  bPart({ id: 'fantail', slot: 'tail', name: 'Fantail', tags: ['peacock'], dom: 0.6, w: 1,
    shapes: [[[0, -10], [-18, -40], [-40, -58, 0.3], [-60, -50], [-74, -30, 0.3], [-80, -8], [-76, 14, 0.3], [-64, 30], [-44, 38, 0.3], [-22, 36], [0, 10]]],
    extra: [
      covert([[-2, -8], [-18, -34], [-40, -50], [-58, -44], [-70, -26], [-74, -6], [-70, 12], [-60, 26], [-44, 32], [-22, 30], [-2, 8]], 0.35),
      feathers([-4, 0], [[-30, -50], [-56, -46], [-70, -20], [-74, 4], [-66, 24], [-40, 34]], 0.25),
      ...[[-34, -40], [-58, -32], [-66, -6], [-62, 18], [-40, 28], [-16, -24], [-38, -12], [-40, 12]].flatMap(([x, y]) => [{ t: 'ellipse', cx: x, cy: y, rx: 6, ry: 8, f: 'a', ns: true, cl: true }, { t: 'ellipse', cx: x, cy: y, rx: 3.5, ry: 4.5, f: 'e', ns: true, cl: true }, { t: 'circle', cx: x, cy: y - 1, r: 1.6, f: 'k', ns: true, cl: true }]),
      SH('M-82,-8 C-70,20 -40,38 -2,12 L-2,50 L-82,50 Z', 0.12),
    ] }),
  bPart({ id: 'stubby', slot: 'tail', name: 'Stubby', tags: ['penguin'], dom: 0.4, w: 2, shapes: [[[0, -6], [-8, -8], [-18, -6], [-22, 0], [-18, 6], [-8, 8], [0, 6]]], extra: [feathers([-2, 0], [[-18, -4], [-20, 0], [-18, 4]]), ...featherTips([[-20, 0]], 2)] }),
];

/** A thin bird leg as an outlined stroke: shin from (0,0) down to (x, len), then toes. */
function thinLeg(len, toesD, o = {}) {
  const shin = `M0,0 L${o.lean == null ? 1 : o.lean},${len}`;
  return [L(shin, 'k', 6.5), L(shin, 'p', 3.5), L(toesD, 'k', 5), L(toesD, 'p', 2.4)];
}

export const B_LEGS = [
  bPart({ id: 'thin', slot: 'legs', name: 'Thin', tags: ['songbird'], dom: 0.5, w: 3, extra: thinLeg(16, 'M1,16 L9,20 M1,16 L2,23 M1,16 L-6,20 M1,16 L-6,14') }),
  bPart({ id: 'raptor', slot: 'legs', name: 'Talons', tags: ['raptor'], dom: 0.55, w: 2, extra: [S([[-8, -4], [4, -6], [10, 4], [8, 14], [-2, 16], [-8, 8]], 'p'), ...thinLeg(24, 'M1,24 L9,29 M1,24 L2,32 M1,24 L-7,29 M1,24 L-6,20', { lean: 1 }), P('M9,29 L12,33 L10,28 Z M2,32 L3,36 L4,31 Z M-7,29 L-10,33 L-8,28 Z', 'w', { sw: 1 })] }),
  bPart({ id: 'penguin', slot: 'legs', name: 'Flat feet', tags: ['penguin'], dom: 0.45, w: 2, extra: [L('M0,0 L1,8', 'k', 7), L('M0,0 L1,8', 'p', 4), S([[-6, 8], [4, 6], [14, 9], [16, 12, 0.3], [10, 14], [-2, 14], [-8, 12]], 'p'), L('M6,9 L8,13 M11,9 L12,13', 'k', 1.2, { op: 0.4 })] }),
  bPart({ id: 'webbed', slot: 'legs', name: 'Webbed', tags: ['duck'], dom: 0.5, w: 2, extra: [L('M0,0 L1,14', 'k', 6.5), L('M0,0 L1,14', 'p', 3.5), S([[-6, 14], [4, 12], [14, 15], [16, 18, 0.3], [8, 20], [-2, 20], [-8, 18]], 'p'), L('M4,14 L6,19 M10,15 L11,19', 'k', 1.2, { op: 0.4 })] }),
  bPart({ id: 'stilts', slot: 'legs', name: 'Stilts', tags: ['wader'], dom: 0.5, w: 2, extra: thinLeg(30, 'M1,30 L12,34 M1,30 L2,38 M1,30 L-8,34 M1,30 L-6,27', { lean: 1 }) }),
  bPart({ id: 'zygo', slot: 'legs', name: 'Gripping', tags: ['parrot'], dom: 0.5, w: 2, extra: thinLeg(14, 'M1,14 L9,19 M1,14 L5,21 M1,14 L-4,21 M1,14 L-8,18', { lean: 1 }) }),
  bPart({ id: 'feathered', slot: 'legs', name: 'Feathered', tags: ['owl'], dom: 0.5, w: 2, extra: [S([[-9, -4], [4, -6], [10, 6], [8, 16, 0.3], [2, 12], [-2, 18, 0.3], [-6, 12], [-10, 6]], 'p'), ...thinLeg(20, 'M1,20 L9,25 M1,20 L2,28 M1,20 L-7,25 M1,20 L-6,17', { lean: 1 }), P('M9,25 L11,29 L10,24 Z M2,28 L3,32 L4,27 Z M-7,25 L-10,29 L-8,24 Z', 'w', { sw: 1 })] }),
];
