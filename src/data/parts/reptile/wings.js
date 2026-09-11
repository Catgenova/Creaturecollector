// Reptile wings. Origin = the wing root on the back; wings rise up (-y) and sweep back (-x).
// Both wings are drawn behind the torso, the near one after the far one.
// Evolutions: stage 2 grows the wing and adds a thumb claw, extra primaries, a second leaflet
// or another shard; stage 3 layers a larger membrane, feather row, leaf or flame behind it.
import { rPart } from './_shared.js';
import { NONE, S, L, P, C, SH, HL, xfPts } from '../_dsl.js';

const dragonWing = [[0, 0], [-6, -24], [-18, -46], [-40, -56], [-70, -52, 0.3], [-58, -36], [-74, -26, 0.3], [-56, -16], [-64, -2, 0.3], [-40, -2], [-16, 4]];
const featherWing = [[0, 0], [-4, -22], [-20, -40], [-50, -46], [-72, -38, 0.3], [-56, -30], [-70, -18, 0.3], [-50, -14], [-58, -2, 0.3], [-34, 0], [-12, 4]];
const finWing = [[0, 0], [-6, -20], [-20, -34], [-44, -36], [-52, -20], [-44, -6], [-24, 2], [-8, 4]];
const leafWing = [[0, 0], [-8, -20], [-24, -38], [-50, -42, 'c'], [-52, -24], [-40, -8], [-20, 2]];
const flameWing = [[0, 0], [-6, -18], [-14, -34], [-30, -50, 0.2], [-26, -30], [-42, -38, 0.2], [-34, -18], [-50, -18, 0.2], [-34, -6], [-14, 4]];
const tatteredWing = [[0, 0], [-8, -22], [-24, -42], [-52, -48, 0.3], [-44, -32], [-62, -30, 'c'], [-48, -18], [-60, -8, 'c'], [-40, -6], [-18, 4]];

export const R_WINGS = [
  NONE('wings', 0.3, 'r.'),
  rPart({
    id: 'dragon', slot: 'wings', name: 'Dragon', tags: ['dragon', 'membrane'], dom: 0.6, w: 2,
    shapes: [dragonWing],
    extra: [
      S([[-8, -20], [-20, -40], [-44, -48], [-58, -44], [-48, -32], [-58, -22], [-44, -14], [-24, -8]], 's', { ns: true, cl: true, op: 0.6 }),
      P('M-6,-24 C-20,-36 -36,-46 -52,-50 M-8,-22 C-24,-30 -40,-36 -60,-38 M-10,-16 C-26,-18 -42,-20 -60,-22', 'none', { sw: 1.6 }),
      SH('M-74,-14 C-50,-4 -24,2 4,4 L4,12 L-74,12 Z', 0.14),
    ],
    stages: {
      2: { grow: [1.12, 1.12], addShapes: [{ pts: [[-10, -28], [-16, -50, 'c'], [-4, -36]], f: 'a' }], add: [P('M-10,-10 C-26,-8 -42,-6 -60,-4', 'none', { sw: 1.6 })] },
      3: { grow: [1.12, 1.12], addBehind: [{ pts: xfPts(dragonWing, { sx: 1.22, sy: 1.22 }), f: 'pd' }], add: [P('M-70,-52 L-80,-64 L-66,-58 Z', 'a', { sw: 1.2 }), P('M-74,-26 L-86,-30 L-74,-34 Z', 'a', { sw: 1.2 })] },
    },
  }),
  rPart({
    id: 'feathered', slot: 'wings', name: 'Feathered', tags: ['bird', 'feathers'], dom: 0.55, w: 1,
    shapes: [featherWing],
    extra: [
      S([[-4, -18], [-18, -34], [-44, -40], [-56, -34], [-46, -26], [-40, -14], [-20, -8]], 's', { ns: true, cl: true, op: 0.6 }),
      L('M-10,-16 C-26,-20 -42,-24 -58,-30 M-10,-10 C-26,-10 -40,-12 -56,-16 M-12,-4 C-26,-2 -36,-2 -50,-4', 'k', 1.3, { op: 0.3 }),
      SH('M-72,-10 C-48,-2 -24,2 4,4 L4,12 L-72,12 Z', 0.12),
    ],
    stages: {
      2: { grow: [1.12, 1.12], addShapes: [[[-50, -44], [-70, -52], [-82, -44, 0.3], [-64, -36]], [[-56, -26], [-76, -28], [-82, -18, 0.3], [-62, -14]]] },
      3: { grow: [1.12, 1.12], addBehind: [{ pts: xfPts(featherWing, { sx: 1.25, sy: 1.25 }), f: 'pd' }], add: [L('M-20,-30 C-40,-36 -56,-40 -74,-44 M-18,-20 C-38,-22 -54,-24 -70,-26', 'a', 1.6, { ns: true, op: 0.6 })] },
    },
  }),
  rPart({
    id: 'fin', slot: 'wings', name: 'Fin wings', tags: ['aquatic'], dom: 0.5, w: 1,
    shapes: [finWing],
    extra: [S([[-4, -16], [-16, -28], [-38, -30], [-44, -18], [-38, -6], [-20, -2]], 's', { ns: true, cl: true, op: 0.5 }), L('M-8,-14 C-22,-24 -36,-30 -46,-30 M-10,-8 C-24,-14 -38,-18 -48,-18 M-12,-2 C-24,-4 -36,-6 -46,-8', 'k', 1.2, { op: 0.3 }), SH('M-54,-8 C-36,0 -18,4 4,4 L4,12 L-54,12 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.15], addShapes: [{ pts: [[-40, -34], [-56, -48, 'c'], [-48, -28]], f: 'p' }, { pts: [[-50, -20], [-66, -20, 'c'], [-50, -12]], f: 'p' }], add: [L('M-8,-14 C-22,-24 -36,-30 -46,-30 M-10,-8 C-24,-14 -38,-18 -48,-18', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(finWing, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [C(-52, -40, 2.4, 'a', { ns: true }), C(-60, -18, 2.4, 'a', { ns: true }), C(-50, -2, 2.2, 'a', { ns: true })] },
    },
  }),
  rPart({
    id: 'leaf', slot: 'wings', name: 'Leaf wings', tags: ['grass'], dom: 0.5, w: 1,
    shapes: [leafWing],
    extra: [L('M-4,-4 C-18,-14 -32,-26 -48,-40', 'k', 1.4, { op: 0.35 }), L('M-14,-12 L-8,-20 M-24,-20 L-20,-30 M-34,-28 L-32,-38', 'k', 1, { op: 0.3 }), S([[-6,-6],[-16,-16],[-30,-28],[-44,-38],[-46,-28],[-34,-12],[-18,-2]], 's', { ns: true, cl: true, op: 0.4 }), SH('M-54,-10 C-38,-2 -18,2 4,4 L4,12 L-54,12 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.15], addBehind: [[[-10, -4], [-28, -14], [-50, -26, 'c'], [-44, -8], [-24, 2]]] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(leafWing, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [C(-20, -8, 2.4, 'a', { ns: true }), C(-26, -3, 2.2, 'a', { ns: true }), C(-16, -2, 2, 'a', { ns: true })] },
    },
  }),
  rPart({
    id: 'crystal', slot: 'wings', name: 'Crystal wings', tags: ['ice', 'rock'], dom: 0.5, w: 1,
    extra: [
      P('M0,0 L-14,-30 L-6,-46 L4,-20 Z', 'pl'), P('M-2,-4 L-30,-34 L-44,-40 L-28,-14 L-6,2 Z', 'p'), P('M-8,2 L-40,-8 L-58,-6 L-34,6 L-12,6 Z', 'pd'),
      HL('M-12,-28 L-8,-42 L-6,-22 Z', 0.35), HL('M-26,-30 L-40,-36 L-28,-18 Z', 0.3),
      SH('M-58,-4 C-40,2 -20,4 4,6 L4,12 L-58,12 Z', 0.12),
    ],
    stages: {
      2: { grow: [1.12, 1.15], add: [P('M-4,-2 L-24,-46 L-14,-58 L2,-24 Z', 'pl'), P('M-16,-36 L-14,-50 L-12,-30 Z', 'w', { ns: true, op: 0.35 })] },
      3: { grow: [1.1, 1.12], addBehind: [{ pts: [[-10, 0, 'c'], [-52, -24, 'c'], [-72, -24, 'c'], [-46, -6, 'c'], [-16, 4, 'c']], f: 'pd' }, { pts: [[-6, -6, 'c'], [-36, -48, 'c'], [-54, -54, 'c'], [-30, -22, 'c'], [-8, 0, 'c']], f: 'pd' }] },
    },
  }),
  rPart({
    id: 'flame', slot: 'wings', name: 'Flame wings', tags: ['fire'], dom: 0.5, w: 1,
    shapes: [flameWing],
    extra: [S([[-4, -4], [-8, -18], [-16, -32], [-20, -22], [-30, -26], [-26, -12], [-32, -8], [-14, 0]], 's', { ns: true, cl: true }), HL('M-10,-14 C-14,-22 -18,-28 -22,-36 L-18,-36 C-16,-28 -12,-20 -8,-12 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.15], add: [S([[-6, -6], [-10, -20], [-16, -30, 0.2], [-18, -20], [-26, -24], [-22, -12], [-26, -8], [-14, -2]], 'a', { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(flameWing, { sx: 1.3, sy: 1.3 }), f: 'a' }] },
    },
  }),
  rPart({
    id: 'tattered', slot: 'wings', name: 'Tattered', tags: ['ghost'], dom: 0.45, w: 1,
    shapes: [tatteredWing],
    extra: [P('M-8,-22 C-22,-30 -34,-38 -48,-44 M-10,-16 C-26,-22 -38,-24 -56,-30 M-12,-10 C-26,-12 -40,-12 -56,-10', 'none', { sw: 1.4 }), SH('M-40,-20 L-32,-28 L-28,-18 Z M-52,-14 L-46,-24 L-40,-12 Z', 0.3), SH('M-62,-6 C-40,0 -20,2 4,4 L4,12 L-62,12 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.12], addShapes: [{ pts: [[-40, -6], [-54, -4], [-64, 4, 'c'], [-48, 2]], f: 'p' }], add: [SH('M-24,-30 L-18,-36 L-14,-26 Z', 0.3)] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(tatteredWing, { sx: 1.28, sy: 1.28 }), f: 'pd' }], add: [C(-58, -40, 2.2, 'a', { ns: true, op: 0.8 }), C(-66, -22, 2, 'a', { ns: true, op: 0.7 }), C(-62, -2, 1.8, 'a', { ns: true, op: 0.7 })] },
    },
  }),
];
