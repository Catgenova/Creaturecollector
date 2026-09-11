// Amphibian legs (origin = the joint on the body; folded springy hind legs, small forelegs with
// long fingers) and tails (from the rear socket).
// Evolutions: legs grow accent toe pads, then bands and bigger pads (aLegStages); tails add
// rays, ridges, bands or leaflets, then fork, club or layer a bigger fin behind.
import { aLeg, aPart, toes } from './_shared.js';
import { NONE, S, L, P, C, SH, HL, tube, xfPts } from '../_dsl.js';
import { evoBands, evoRing } from '../_evo.js';

/** A splayed tree-frog toe: a short filled tube from a to b (goes in `shapes` so it is outlined and clipped) plus its sticky pad. */
const padToe = (a, b, w = 4) => tube([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], w, w * 0.8, { tipK: 1 });
const padTip = (b, r = 2.7, f = 'a') => C(b[0], b[1], r, f, { sw: 1.4 });
const fingers = (d) => L(d, 'k', 1.4, { op: 0.45 });

/** tips = finger-tip points that get accent pads; ankleY = where the stage-3 bands start. */
const aLegStages = (tips, ankleY, r = 2.2) => ({
  2: { grow: [1.06, 1.08], add: tips.map((t) => padTip(t, r)) },
  3: { reset: true, grow: [1.12, 1.16], add: [...evoBands(ankleY, 2, 2.4, 5), ...tips.map((t) => padTip(t, r + 0.8)), ...tips.slice(0, 1).map((t) => evoRing(t[0], t[1], r + 3, 'a', 1, { op: 0.5 }))] },
});

export const A_LEGS_FRONT = [
  aLeg({ id: 'frog', slot: 'legsFront', name: 'Frog arms', tags: ['frog'], dom: 0.5, w: 3, shapes: [[[-5, -6], [4, -6], [7, 4], [8, 14], [16, 17, 'c'], [12, 20], [2, 20], [-4, 14], [-6, 4]]], extra: [fingers('M6,18 L14,17 M4,19 L8,24 M0,18 L-4,23'), SH('M-8,-8 L-2,-8 L-1,22 L-8,22 Z', 0.12), HL('M1,-4 L4,-4 L4,10 L2,10 Z', 0.16)], stages: aLegStages([[14, 17], [8, 24], [-4, 23]], 10) }),
  aLeg({ id: 'toad', slot: 'legsFront', name: 'Stout arms', tags: ['toad'], dom: 0.5, w: 2, shapes: [[[-7, -6], [5, -7], [9, 4], [10, 14], [16, 16, 'c'], [12, 20], [0, 20], [-6, 14], [-8, 4]]], extra: [fingers('M8,18 L15,16 M5,19 L9,24 M1,18 L-3,23'), SH('M-10,-8 L-3,-8 L-2,22 L-10,22 Z', 0.12), HL('M1,-4 L5,-4 L5,10 L2,10 Z', 0.16)], stages: aLegStages([[15, 16], [9, 24], [-3, 23]], 10) }),
  aLeg({ id: 'treefrog', slot: 'legsFront', name: 'Padded arms', tags: ['treefrog'], dom: 0.5, w: 2, shapes: [padToe([1, 18], [12, 13]), padToe([1, 19], [10, 24]), padToe([-1, 18], [-8, 21]), [[-4, -6], [3, -6], [5, 4], [6, 16], [3, 20], [-2, 20], [-4, 14], [-5, 4]]], extra: [padTip([12, 13]), padTip([10, 24]), padTip([-8, 21]), SH('M-7,-8 L-1,-8 L0,22 L-7,22 Z', 0.12), HL('M0,-4 L3,-4 L3,10 L1,10 Z', 0.16)], stages: aLegStages([[12, 13], [10, 24], [-8, 21]], 10, 3.2) }),
  aLeg({ id: 'axolotl', slot: 'legsFront', name: 'Tiny arms', tags: ['axolotl'], dom: 0.4, w: 2, shapes: [[[-4, -4], [3, -4], [5, 4], [6, 10], [10, 12, 'c'], [8, 14], [0, 14], [-4, 10], [-5, 4]]], extra: [fingers('M6,12 L10,12 M4,13 L6,17 M1,12 L-2,16'), SH('M-6,-6 L-1,-6 L0,16 L-6,16 Z', 0.12)], stages: aLegStages([[10, 12], [6, 17], [-2, 16]], 6, 1.8) }),
  aLeg({ id: 'newt', slot: 'legsFront', name: 'Thin arms', tags: ['newt'], dom: 0.45, w: 2, shapes: [[[-3, -5], [3, -5], [4, 4], [5, 14], [10, 16, 'c'], [7, 18], [0, 18], [-3, 12], [-4, 4]]], extra: [fingers('M5,16 L10,15 M3,17 L5,21 M0,16 L-3,20'), SH('M-6,-6 L-1,-6 L0,20 L-6,20 Z', 0.12)], stages: aLegStages([[10, 15], [5, 21], [-3, 20]], 8, 1.8) }),
  aLeg({ id: 'salamander', slot: 'legsFront', name: 'Sturdy arms', tags: ['salamander'], dom: 0.5, w: 2, shapes: [[[-6, -6], [5, -7], [8, 4], [9, 16], [16, 18, 'c'], [12, 22], [0, 22], [-6, 16], [-7, 4]]], extra: [fingers('M8,20 L15,18 M5,21 L8,26 M1,20 L-3,25'), SH('M-9,-8 L-2,-8 L-1,24 L-9,24 Z', 0.12), HL('M1,-4 L5,-4 L5,12 L2,12 Z', 0.16)], stages: aLegStages([[15, 18], [8, 26], [-3, 25]], 10) }),
  aLeg({ id: 'polliwog', slot: 'legsFront', name: 'Nubs', tags: ['tadpole'], dom: 0.35, w: 2, shapes: [[[-4, -3], [3, -3], [5, 3], [4, 8], [-1, 9], [-4, 6]]], extra: [SH('M-6,-4 L-1,-4 L0,10 L-6,10 Z', 0.12)], stages: aLegStages([[1, 9]], 3, 1.6) }),
];

export const A_LEGS_BACK = [
  aLeg({ id: 'frog', slot: 'legsBack', name: 'Spring legs', tags: ['frog'], dom: 0.55, w: 3, shapes: [[[-2, -10], [8, -6], [10, 4], [12, 12], [24, 16], [30, 20, 'c'], [22, 22], [8, 22], [-8, 20], [-16, 12], [-16, 0], [-10, -8]]], extra: [L('M-12,6 C-4,12 4,12 10,6', 'k', 1.5, { op: 0.3 }), fingers('M14,20 L26,18 M12,21 L20,24 M8,21 L10,26'), SH('M-20,10 C-8,20 6,22 14,14 L14,24 L-20,24 Z', 0.12), HL('M-6,-8 C0,-10 6,-8 8,-2 C4,-5 -2,-5 -8,-2 Z', 0.16)], stages: aLegStages([[26, 18], [20, 24], [10, 26]], 12) }),
  aLeg({ id: 'toad', slot: 'legsBack', name: 'Thick legs', tags: ['toad'], dom: 0.55, w: 2, shapes: [[[-2, -12], [10, -8], [12, 4], [14, 14], [26, 18], [30, 22, 'c'], [22, 24], [6, 24], [-10, 22], [-18, 12], [-18, -2], [-10, -10]]], extra: [L('M-14,6 C-4,14 6,14 12,6', 'k', 1.5, { op: 0.3 }), fingers('M16,22 L26,20 M12,23 L20,26 M8,23 L10,27'), SH('M-22,10 C-8,22 6,24 16,16 L16,26 L-22,26 Z', 0.12), HL('M-6,-10 C0,-12 6,-10 8,-4 C4,-7 -2,-7 -8,-4 Z', 0.16)], stages: aLegStages([[26, 20], [20, 26], [10, 27]], 14) }),
  aLeg({ id: 'treefrog', slot: 'legsBack', name: 'Long legs', tags: ['treefrog'], dom: 0.5, w: 2, shapes: [padToe([14, 19], [26, 14], 4.5), padToe([14, 20], [24, 25], 4.5), padToe([8, 20], [4, 28], 4.5), [[-2, -8], [6, -6], [8, 4], [10, 14], [20, 18], [22, 22], [16, 22], [4, 22], [-8, 20], [-14, 12], [-14, 0], [-8, -6]]], extra: [L('M-10,6 C-4,12 2,12 8,6', 'k', 1.5, { op: 0.3 }), padTip([26, 14], 3), padTip([24, 25], 3), padTip([4, 28], 3), SH('M-18,10 C-6,20 4,22 12,14 L12,24 L-18,24 Z', 0.12), HL('M-5,-6 C0,-8 5,-6 7,-1 C3,-4 -2,-4 -7,-1 Z', 0.16)], stages: aLegStages([[26, 14], [24, 25], [4, 28]], 12, 3.4) }),
  aLeg({ id: 'axolotl', slot: 'legsBack', name: 'Tiny legs', tags: ['axolotl'], dom: 0.4, w: 2, shapes: [[[-4, -6], [4, -6], [6, 4], [8, 12], [14, 14, 'c'], [10, 16], [0, 16], [-6, 12], [-8, 4]]], extra: [fingers('M8,14 L13,14 M6,15 L8,19 M2,14 L-1,18'), SH('M-10,-8 L-3,-8 L-2,18 L-10,18 Z', 0.12)], stages: aLegStages([[13, 14], [8, 19], [-1, 18]], 8, 1.8) }),
  aLeg({ id: 'newt', slot: 'legsBack', name: 'Thin legs', tags: ['newt'], dom: 0.45, w: 2, shapes: [[[-4, -6], [4, -6], [6, 4], [7, 14], [14, 16, 'c'], [10, 18], [0, 18], [-5, 12], [-7, 4]]], extra: [fingers('M8,16 L13,15 M6,17 L8,21 M2,16 L-1,20'), SH('M-9,-8 L-3,-8 L-2,20 L-9,20 Z', 0.12)], stages: aLegStages([[13, 15], [8, 21], [-1, 20]], 8, 1.8) }),
  aLeg({ id: 'salamander', slot: 'legsBack', name: 'Sturdy legs', tags: ['salamander'], dom: 0.5, w: 2, shapes: [[[-6, -8], [6, -8], [10, 4], [12, 16], [20, 18, 'c'], [16, 22], [2, 22], [-6, 16], [-10, 4]]], extra: [fingers('M12,20 L19,18 M9,21 L12,26 M4,20 L1,25'), SH('M-12,-10 L-4,-10 L-3,24 L-12,24 Z', 0.12), HL('M-2,-6 L4,-6 L6,10 L1,10 Z', 0.14)], stages: aLegStages([[19, 18], [12, 26], [1, 25]], 10) }),
  aLeg({ id: 'polliwog', slot: 'legsBack', name: 'Nub legs', tags: ['tadpole'], dom: 0.35, w: 2, shapes: [[[-5, -4], [4, -4], [6, 4], [5, 10], [-1, 11], [-5, 7]]], extra: [SH('M-7,-6 L-1,-6 L0,12 L-7,12 Z', 0.12)], stages: aLegStages([[0, 11]], 4, 1.6) }),
];

const finTailPts = [[2, -12], [-14, -18], [-32, -16], [-48, -8], [-56, 2, 'c'], [-48, 10], [-32, 14], [-14, 14], [2, 10]];
const polliwogTailPts = [[2, -8], [-12, -12], [-28, -10], [-42, -2, 'c'], [-28, 8], [-12, 10], [2, 8]];
const flameTailPts = [[2, -6], [-10, -12], [-24, -22, 0.2], [-22, -10], [-38, -14, 0.2], [-30, -2], [-44, 2, 0.2], [-28, 8], [-12, 10], [2, 6]];

export const A_TAILS = [
  NONE('tail', 0.3, 'a.'),
  aPart({ id: 'fin', slot: 'tail', name: 'Fin tail', tags: ['axolotl'], dom: 0.55, w: 3, shapes: [finTailPts], extra: [S([[0, -4], [-16, -6], [-34, -4], [-46, 2], [-34, 6], [-16, 7], [0, 5]], 'pd', { ns: true, cl: true, op: 0.35 }), L('M-10,-14 L-12,-6 M-24,-14 L-26,-6 M-38,-10 L-38,-4 M-10,12 L-12,6 M-24,12 L-26,6', 'k', 1, { op: 0.25 }), SH('M-56,4 C-40,12 -20,16 2,12 L2,22 L-56,22 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.15], addShapes: [{ pts: [[-44, -10], [-62, -22, 'c'], [-50, -4]], f: 'p' }], add: [L('M-10,-14 L-12,-6 M-24,-14 L-26,-6 M-38,-10 L-38,-4', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(finTailPts, { sx: 1.28, sy: 1.3 }), f: 'pd' }], add: [C(-56, 2, 2.6, 'a', { ns: true }), C(-60, -18, 2.2, 'a', { ns: true })] },
    } }),
  aPart({ id: 'newt', slot: 'tail', name: 'Tapered', tags: ['newt', 'long'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-16, 2], [-32, 0], [-46, -6], [-58, -14]], 12, 2)], extra: [SH('M-60,-6 C-40,4 -20,8 2,8 L2,18 L-60,18 Z', 0.12), HL('M-44,-8 C-30,-6 -16,-4 -2,-5 L-2,-2 C-16,-1 -30,-2 -42,-4 Z', 0.16)],
    stages: {
      2: { grow: [1.12, 1.08], addBehind: [[[-4, -6], [-14, -16, 0.3], [-24, -8], [-34, -18, 0.3], [-44, -10], [-40, -4], [-6, -2]]] },
      3: { grow: [1.1, 1.1], addBehind: [[[-50, -10], [-64, -24], [-74, -16, 'c'], [-62, -6]]], add: [S([[-56, -12], [-66, -20], [-58, -8]], 'a', { ns: true, op: 0.85 })] },
    } }),
  aPart({ id: 'salamander', slot: 'tail', name: 'Thick tail', tags: ['salamander'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 4], [-30, 4], [-44, -2], [-54, -8]], 16, 4)], extra: [L('M-10,-6 L-10,8 M-22,-4 L-22,10 M-34,-4 L-34,8', 'k', 1.1, { op: 0.2 }), SH('M-56,-2 C-40,8 -20,12 2,10 L2,20 L-56,20 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.1], add: [L('M-10,-8 L-10,10 M-22,-6 L-22,12 M-34,-6 L-34,10', 'a', 2.4, { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.1, 1.1], addShapes: [[[-50, -12], [-62, -18], [-72, -6, 0.3], [-62, 6], [-50, 2]]], add: [P('M-62,-18 L-66,-28 L-56,-20 Z M-72,-8 L-82,-10 L-72,-2 Z M-64,6 L-70,14 L-58,8 Z', 'a', { sw: 1.4 })] },
    } }),
  aPart({ id: 'polliwog', slot: 'tail', name: 'Tadpole tail', tags: ['tadpole'], dom: 0.5, w: 2, shapes: [polliwogTailPts], extra: [S([[0, -3], [-14, -5], [-28, -4], [-36, -2], [-28, 2], [-14, 4], [0, 3]], 'pd', { ns: true, cl: true, op: 0.4 }), L('M-8,-9 L-10,-4 M-20,-9 L-22,-4 M-8,8 L-10,3 M-20,7 L-22,3', 'k', 1, { op: 0.25 })],
    stages: {
      2: { grow: [1.15, 1.15], add: [L('M-8,-9 L-10,-4 M-20,-9 L-22,-4 M-8,8 L-10,3 M-20,7 L-22,3', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(polliwogTailPts, { sx: 1.3, sy: 1.35 }), f: 'pd' }], add: [C(-40, -2, 2.4, 'a', { ns: true }), C(-32, -10, 2, 'a', { ns: true, op: 0.8 }), C(-32, 8, 2, 'a', { ns: true, op: 0.8 })] },
    } }),
  aPart({ id: 'stub', slot: 'tail', name: 'Stub', tags: ['short'], dom: 0.4, w: 2, shapes: [[[2, -5], [-8, -7], [-14, -2], [-12, 4], [-4, 6], [2, 5]]], extra: [SH('M-16,2 L4,2 L4,10 L-16,10 Z', 0.14)],
    stages: {
      2: { grow: [1.3, 1.3], add: [C(-11, -1, 2.4, 'a', { ns: true })] },
      3: { grow: [1.2, 1.2], addShapes: [[[-12, -6], [-22, -12], [-27, -2, 'c'], [-22, 8], [-12, 6]]], add: [C(-21, -2, 3, 'a', { ns: true }), C(-22.5, -3.5, 1, 'w', { ns: true, op: 0.8 })] },
    } }),
  aPart({ id: 'leaf', slot: 'tail', name: 'Leaf tail', tags: ['grass'], dom: 0.45, w: 2, shapes: [[[2, -4], [-10, -12], [-26, -14], [-40, -6, 'c'], [-28, 4], [-12, 8], [2, 4]]], extra: [L('M0,0 C-12,-2 -24,-4 -36,-6', 'k', 1.3, { op: 0.35 }), L('M-10,-2 L-12,-10 M-20,-4 L-24,-11', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.15, 1.15], addBehind: [[[-6, 2], [-16, 10], [-30, 16, 'c'], [-22, 4], [-12, -2]], [[-10, -10], [-22, -22], [-36, -28, 'c'], [-26, -16], [-16, -8]]] },
      3: { grow: [1.12, 1.12], addBehind: [[[-16, -6], [-34, -4], [-50, 0, 'c'], [-34, -10], [-20, -12]]], add: [C(-14, -10, 2.6, 'a', { ns: true }), C(-19, -6, 2.2, 'a', { ns: true }), C(-13, -4, 2, 'a', { ns: true })] },
    } }),
  aPart({ id: 'flame', slot: 'tail', name: 'Flame tail', tags: ['fire'], dom: 0.5, w: 2, shapes: [flameTailPts], extra: [S([[0, -2], [-10, -6], [-20, -12], [-18, -4], [-28, -4], [-22, 2], [-12, 6], [0, 3]], 's', { ns: true, cl: true }), HL('M-8,-6 C-12,-8 -16,-12 -18,-16 L-14,-16 C-12,-12 -8,-10 -4,-6 Z', 0.3)],
    stages: {
      2: { grow: [1.12, 1.15], add: [S([[-2, -2], [-10, -8], [-18, -16, 0.2], [-16, -6], [-26, -8], [-20, 0], [-12, 4], [-2, 2]], 'a', { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(flameTailPts, { sx: 1.3, sy: 1.3 }), f: 'a' }] },
    } }),
];
