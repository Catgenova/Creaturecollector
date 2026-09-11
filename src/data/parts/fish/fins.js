// Fish fins: dorsal (top, rises up and sweeps back), pectoral (side, hangs down-back),
// tail (rear, extends left), belly (bottom, hangs down). Origin = the fin root.
// Evolutions: stage 2 grows the fin, notches or extends its tips and brightens the rays; stage 3
// layers a larger copy of the fin behind it (a second lobe or curl on the odd ones) and dots the tips.
import { fPart } from './_shared.js';
import { NONE, S, L, C, SH, HL, tube, xfPts } from '../_dsl.js';
import { evoGem } from '../_evo.js';

/** Fin rays: n lines from the root (rx, ry) fanning to the given finTips. */
const rays = (root, finTips, op = 0.3) => L(finTips.map(([x, y]) => `M${root[0]},${root[1]} L${x},${y}`).join(' '), 'k', 1.1, { op });
const inner = (pts, op = 0.45) => S(pts, 's', { ns: true, cl: true, op });
/** Glowing ray finTips in the accent colour. */
const finTips = (pts, r = 2.2) => pts.map(([x, y]) => C(x, y, r, 'a', { ns: true }));
/** Accent rays: the same fan drawn in the accent colour, for the evolved fins. */
const accentRays = (root, pts) => L(pts.map(([x, y]) => `M${root[0]},${root[1]} L${x},${y}`).join(' '), 'a', 1.5, { ns: true, op: 0.7 });
/** Shared fin evolution: grow with `detail2` at stage 2; a larger copy of `pts` behind plus `detail3` at stage 3. */
const finStages = (pts, g2, detail2, detail3 = [], k = 1.28) => ({
  2: { grow: g2, add: detail2 },
  3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(pts, { sx: k, sy: k }), f: 'pd' }], add: detail3 },
});

const dFan = [[6, 4], [2, -14], [-10, -24], [-24, -18], [-30, 4]];
const dSail = [[10, 4], [8, -16], [-2, -28], [-18, -30], [-34, -20], [-42, 4]];
const dShark = [[8, 4], [4, -12], [-6, -28, 'c'], [-14, -16], [-22, 4]];
const dSpiky = [[8, 4], [6, -12, 'c'], [0, -6], [-4, -20, 'c'], [-8, -6], [-14, -22, 'c'], [-18, -6], [-24, -16, 'c'], [-28, 4]];
const dFlowing = [[8, 4], [4, -14], [-6, -26], [-24, -30], [-44, -24], [-56, -10, 0.3], [-48, -4], [-36, 2], [-20, 6]];
const dCrest = [[6, 4], [2, -10], [-6, -14], [-12, -8], [-14, 4]];
const dRibbon = [[20, 4], [16, -4], [6, -7], [-8, -8], [-22, -7], [-36, -5], [-46, -1], [-50, 4]];

export const F_DORSALS = [
  fPart({ id: 'fan', slot: 'dorsal', name: 'Fan', tags: ['classic'], dom: 0.5, w: 3, shapes: [dFan], extra: [inner([[2, 2], [0, -10], [-10, -18], [-20, -12], [-24, 2]]), rays([-8, 2], [[0, -12], [-10, -21], [-20, -16]]), ...finTips([[0, -12], [-10, -21], [-20, -16]]), SH('M-32,2 L8,2 L8,10 L-32,10 Z', 0.12)],
    stages: finStages(dFan, [1.1, 1.25], [accentRays([-8, 2], [[0, -12], [-10, -21], [-20, -16]])], [...finTips([[0, -12], [-10, -21], [-20, -16]], 2.8)]) }),
  fPart({ id: 'sail', slot: 'dorsal', name: 'Sail', tags: ['tall'], dom: 0.5, w: 2, shapes: [dSail], extra: [inner([[6, 2], [4, -12], [-4, -22], [-18, -24], [-30, -16], [-36, 2]]), rays([-12, 2], [[6, -14], [-4, -26], [-18, -28], [-32, -18]]), ...finTips([[6, -14], [-4, -26], [-18, -28], [-32, -18]]), SH('M-44,2 L12,2 L12,10 L-44,10 Z', 0.12)],
    stages: finStages(dSail, [1.08, 1.25], [accentRays([-12, 2], [[6, -14], [-4, -26], [-18, -28], [-32, -18]])], [...evoGem(-12, -14, 3)]) }),
  fPart({ id: 'shark', slot: 'dorsal', name: 'Shark fin', tags: ['shark'], dom: 0.55, w: 2, shapes: [dShark], extra: [HL('M2,-6 C0,-14 -2,-20 -6,-26 L-8,-20 C-6,-14 -4,-10 -4,-4 Z', 0.18), SH('M-24,2 L10,2 L10,10 L-24,10 Z', 0.12)],
    stages: finStages(dShark, [1.08, 1.3], [L('M6,0 C4,-10 0,-20 -6,-28', 'a', 1.8, { ns: true, cl: true, op: 0.6 })], [C(-6, -30, 2.6, 'a', { ns: true })], 1.32) }),
  fPart({ id: 'spiky', slot: 'dorsal', name: 'Spiky', tags: ['spines'], dom: 0.5, w: 2, shapes: [dSpiky], extra: [inner([[4, 2], [2, -6], [-6, -4], [-12, -8], [-18, -4], [-24, 2]]), rays([-8, 2], [[6, -12], [-4, -20], [-14, -22], [-24, -16]]), ...finTips([[6, -12], [-4, -20], [-14, -22], [-24, -16]], 1.9), SH('M-30,2 L10,2 L10,10 L-30,10 Z', 0.12)],
    stages: finStages(dSpiky, [1.08, 1.3], [accentRays([-8, 2], [[6, -12], [-4, -20], [-14, -22], [-24, -16]])], [...finTips([[6, -12], [-4, -20], [-14, -22], [-24, -16]], 2.6)]) }),
  fPart({ id: 'flowing', slot: 'dorsal', name: 'Flowing', tags: ['fancy'], dom: 0.5, w: 2, shapes: [dFlowing], extra: [inner([[4, 2], [0, -12], [-8, -22], [-24, -26], [-42, -20], [-50, -10], [-42, -4], [-22, 2]]), rays([-10, 2], [[2, -14], [-10, -24], [-26, -28], [-44, -22], [-52, -8]]), ...finTips([[-26, -28], [-44, -22], [-52, -8]], 2.6), SH('M-58,0 L10,0 L10,10 L-58,10 Z', 0.12)],
    stages: finStages(dFlowing, [1.12, 1.2], [accentRays([-10, 2], [[2, -14], [-10, -24], [-26, -28], [-44, -22], [-52, -8]])], [...finTips([[-26, -28], [-44, -22], [-52, -8]], 3.2)], 1.25) }),
  fPart({ id: 'crest', slot: 'dorsal', name: 'Crest fin', tags: ['small'], dom: 0.45, w: 2, shapes: [dCrest], extra: [rays([-4, 2], [[2, -9], [-6, -12], [-11, -7]]), SH('M-16,2 L8,2 L8,10 L-16,10 Z', 0.12)],
    stages: finStages(dCrest, [1.12, 1.3], [accentRays([-4, 2], [[2, -9], [-6, -12], [-11, -7]])], [...finTips([[2, -9], [-6, -12], [-11, -7]], 2)], 1.35) }),
  fPart({ id: 'ribbon', slot: 'dorsal', name: 'Ribbon fin', tags: ['eel', 'long'], dom: 0.5, w: 2, shapes: [dRibbon], extra: [inner([[16, 2], [12, -2], [4, -4], [-10, -5], [-28, -3], [-42, 0], [-46, 2]]), L('M12,2 L10,-4 M2,2 L0,-5 M-8,2 L-10,-6 M-18,2 L-20,-5 M-28,2 L-30,-4 M-38,2 L-40,-2', 'k', 1.1, { op: 0.3 }), ...finTips([[10, -4], [-10, -6], [-30, -4]], 1.8), SH('M-52,2 L22,2 L22,10 L-52,10 Z', 0.12)],
    stages: finStages(dRibbon, [1.05, 1.5], [L('M12,2 L10,-4 M2,2 L0,-5 M-8,2 L-10,-6 M-18,2 L-20,-5 M-28,2 L-30,-4', 'a', 1.5, { ns: true, op: 0.7 })], [...finTips([[10, -4], [-10, -6], [-30, -4]], 2.6)], 1.25) }),
];

const pFan = [[0, -4], [6, 4], [4, 16], [-6, 22], [-16, 16], [-14, 4]];
const pPointed = [[0, -4], [8, 2], [10, 14], [0, 26, 'c'], [-10, 14], [-10, 2]];
const pFlowing = [[0, -4], [8, 4], [8, 18], [0, 32], [-14, 40, 0.3], [-20, 26], [-18, 10], [-12, 0]];
const pPaddle = [[0, -6], [8, -2], [12, 10], [6, 22], [-6, 24], [-14, 14], [-12, 2]];
const pSpiky = [[0, -4], [6, 2], [8, 14, 'c'], [2, 10], [0, 22, 'c'], [-6, 10], [-12, 18, 'c'], [-12, 4]];
const pTiny = [[0, -3], [4, 2], [3, 10], [-3, 12], [-8, 8], [-7, 1]];
const pWing = [[0, -6], [10, -2], [18, 6], [14, 18], [2, 24], [-10, 20], [-14, 8], [-10, 0]];

export const F_PECTORALS = [
  fPart({ id: 'fan', slot: 'pectoral', name: 'Fan', tags: ['classic'], dom: 0.5, w: 3, shapes: [pFan], extra: [inner([[0, -1], [3, 5], [2, 14], [-6, 18], [-12, 13], [-10, 5]]), rays([-2, -2], [[4, 14], [-4, 20], [-13, 15]]), ...finTips([[4, 14], [-4, 20], [-13, 15]], 1.9)],
    stages: finStages(pFan, [1.1, 1.15], [accentRays([-2, -2], [[4, 14], [-4, 20], [-13, 15]])], [...finTips([[4, 14], [-4, 20], [-13, 15]], 2.6)]) }),
  fPart({ id: 'pointed', slot: 'pectoral', name: 'Pointed', tags: ['shark'], dom: 0.55, w: 2, shapes: [pPointed], extra: [HL('M2,0 C6,6 6,12 2,20 L-2,20 C0,12 0,6 -2,0 Z', 0.16), rays([0, -2], [[6, 12], [0, 22], [-7, 12]])],
    stages: finStages(pPointed, [1.1, 1.2], [L('M0,-2 L0,24', 'a', 1.6, { ns: true, cl: true, op: 0.6 })], [C(0, 27, 2.4, 'a', { ns: true })]) }),
  fPart({ id: 'flowing', slot: 'pectoral', name: 'Flowing', tags: ['fancy'], dom: 0.5, w: 2, shapes: [pFlowing], extra: [inner([[0, -1], [5, 5], [5, 17], [-2, 28], [-12, 34], [-16, 24], [-14, 10], [-9, 2]]), rays([-3, -2], [[6, 16], [-2, 30], [-12, 36], [-16, 22]]), ...finTips([[-2, 30], [-12, 36]])],
    stages: finStages(pFlowing, [1.1, 1.18], [accentRays([-3, -2], [[6, 16], [-2, 30], [-12, 36], [-16, 22]])], [...finTips([[-2, 30], [-12, 36]], 3)], 1.25) }),
  fPart({ id: 'paddle', slot: 'pectoral', name: 'Paddle', tags: ['koi'], dom: 0.5, w: 2, shapes: [pPaddle], extra: [inner([[0, -3], [6, 0], [9, 10], [4, 19], [-5, 20], [-10, 12], [-9, 3]]), rays([-2, -3], [[8, 10], [2, 20], [-8, 16]])],
    stages: finStages(pPaddle, [1.1, 1.15], [accentRays([-2, -3], [[8, 10], [2, 20], [-8, 16]])], [...finTips([[8, 10], [2, 20], [-8, 16]], 2.4)]) }),
  fPart({ id: 'spiky', slot: 'pectoral', name: 'Spiky', tags: ['spines'], dom: 0.5, w: 2, shapes: [pSpiky], extra: [rays([-2, -2], [[6, 12], [0, 20], [-10, 16]])],
    stages: finStages(pSpiky, [1.1, 1.2], [accentRays([-2, -2], [[6, 12], [0, 20], [-10, 16]])], [...finTips([[8, 14], [0, 22], [-12, 18]], 2.2)]) }),
  fPart({ id: 'tiny', slot: 'pectoral', name: 'Tiny', tags: ['small'], dom: 0.4, w: 2, shapes: [pTiny], extra: [rays([-2, -1], [[2, 9], [-5, 7]])],
    stages: finStages(pTiny, [1.15, 1.25], [accentRays([-2, -1], [[2, 9], [-5, 7]])], [...finTips([[2, 9], [-5, 7]], 1.8)], 1.4) }),
  fPart({ id: 'wing', slot: 'pectoral', name: 'Wing fin', tags: ['flying'], dom: 0.5, w: 1, shapes: [pWing], extra: [inner([[0, -3], [8, 0], [14, 7], [10, 15], [1, 20], [-8, 16], [-10, 8]]), rays([-2, -3], [[14, 8], [8, 18], [-2, 21], [-9, 14]]), ...finTips([[14, 8], [8, 18], [-2, 21]])],
    stages: finStages(pWing, [1.12, 1.15], [accentRays([-2, -3], [[14, 8], [8, 18], [-2, 21], [-9, 14]])], [...finTips([[14, 8], [8, 18], [-2, 21]], 3)]) }),
];

const tForked = [[0, -8], [-10, -12], [-24, -24], [-34, -26, 'c'], [-26, -6], [-22, 0], [-26, 8], [-34, 28, 'c'], [-24, 26], [-10, 12], [0, 8]];
const tFan = [[0, -8], [-12, -14], [-26, -22], [-36, -16], [-38, 0], [-36, 16], [-26, 22], [-12, 14], [0, 8]];
const tFlowing = [[0, -8], [-14, -18], [-34, -30], [-56, -34, 0.3], [-48, -18], [-44, -4], [-46, 10], [-58, 30, 0.3], [-38, 28], [-18, 18], [0, 8]];
const tShark = [[0, -8], [-10, -14], [-24, -30], [-36, -40, 'c'], [-28, -16], [-22, -2], [-26, 6], [-34, 18, 'c'], [-24, 16], [-10, 10], [0, 8]];
const tEel = [[0, -8], [-14, -8], [-28, -4], [-40, 2, 'c'], [-28, 8], [-14, 12], [0, 8]];
const tLyre = [[0, -8], [-12, -16], [-26, -30], [-32, -34, 'c'], [-36, -20], [-26, -8], [-20, 0], [-26, 8], [-36, 20], [-32, 34, 'c'], [-26, 30], [-12, 16], [0, 8]];

export const F_TAILS = [
  fPart({ id: 'forked', slot: 'tail', name: 'Forked', tags: ['classic'], dom: 0.5, w: 3, shapes: [tForked], extra: [inner([[-2, -6], [-12, -12], [-26, -20], [-22, -6], [-20, 0], [-22, 8], [-26, 22], [-12, 12], [-2, 6]]), rays([-2, 0], [[-30, -22], [-26, -8], [-26, 8], [-30, 24]]), ...finTips([[-30, -22], [-30, 24]], 2.6), SH('M-36,6 C-24,14 -10,14 2,10 L2,32 L-36,32 Z', 0.12)],
    stages: finStages(tForked, [1.12, 1.12], [accentRays([-2, 0], [[-30, -22], [-26, -8], [-26, 8], [-30, 24]])], [...finTips([[-30, -22], [-30, 24]], 3.4)]) }),
  fPart({ id: 'fan', slot: 'tail', name: 'Fan', tags: ['round'], dom: 0.5, w: 2, shapes: [tFan], extra: [inner([[-2, -6], [-14, -12], [-26, -18], [-32, -12], [-33, 0], [-32, 12], [-26, 18], [-14, 12], [-2, 6]]), rays([-2, 0], [[-30, -18], [-34, -6], [-34, 6], [-30, 18]]), C(-26, 0, 6.5, 'a', { ns: true, cl: true }), C(-25, -0.5, 3, 'w', { ns: true, cl: true }), SH('M-40,6 C-26,14 -10,14 2,10 L2,32 L-40,32 Z', 0.12)],
    stages: finStages(tFan, [1.12, 1.12], [accentRays([-2, 0], [[-30, -18], [-34, -6], [-34, 6], [-30, 18]])], [C(-26, 0, 8.5, 'a', { ns: true, cl: true }), C(-25, -0.5, 4, 'w', { ns: true, cl: true }), ...finTips([[-30, -18], [-30, 18]], 2.6)]) }),
  fPart({ id: 'flowing', slot: 'tail', name: 'Flowing', tags: ['fancy'], dom: 0.5, w: 2, shapes: [tFlowing], extra: [inner([[-2, -6], [-16, -16], [-34, -26], [-50, -30], [-44, -16], [-40, -2], [-42, 12], [-50, 26], [-36, 24], [-18, 14], [-2, 6]]), rays([-2, 0], [[-50, -30], [-44, -12], [-42, 6], [-52, 26]]), ...finTips([[-50, -30], [-52, 26]], 2.8), ...finTips([[-44, -12], [-42, 6]], 1.8), SH('M-60,8 C-40,18 -18,18 2,10 L2,36 L-60,36 Z', 0.12)],
    stages: finStages(tFlowing, [1.12, 1.15], [accentRays([-2, 0], [[-50, -30], [-44, -12], [-42, 6], [-52, 26]])], [...finTips([[-50, -30], [-52, 26]], 3.6)], 1.25) }),
  fPart({ id: 'shark', slot: 'tail', name: 'Shark tail', tags: ['shark'], dom: 0.55, w: 2, shapes: [tShark], extra: [HL('M-8,-10 C-16,-18 -24,-28 -32,-36 L-30,-30 C-24,-22 -16,-14 -10,-8 Z', 0.16), SH('M-36,4 C-24,12 -10,12 2,10 L2,24 L-36,24 Z', 0.12)],
    stages: finStages(tShark, [1.12, 1.15], [L('M-4,-4 C-14,-14 -24,-26 -34,-38', 'a', 1.8, { ns: true, cl: true, op: 0.6 })], [C(-36, -42, 2.8, 'a', { ns: true }), C(-34, 20, 2.2, 'a', { ns: true })]) }),
  fPart({ id: 'eel', slot: 'tail', name: 'Pointed', tags: ['eel'], dom: 0.5, w: 2, shapes: [tEel], extra: [inner([[-2, -6], [-14, -6], [-28, -2], [-34, 2], [-28, 6], [-14, 10], [-2, 6]]), rays([-2, 2], [[-30, -4], [-36, 2], [-30, 8]]), ...finTips([[-36, 2]], 2.4), SH('M-42,4 C-28,10 -12,12 2,10 L2,20 L-42,20 Z', 0.12)],
    stages: finStages(tEel, [1.15, 1.15], [accentRays([-2, 2], [[-30, -4], [-36, 2], [-30, 8]])], [...finTips([[-36, 2]], 3.4)], 1.3) }),
  fPart({ id: 'curl', slot: 'tail', name: 'Curl', tags: ['seahorse'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-8, 10], [-8, 22], [2, 28], [10, 20], [6, 12]], 10, 3)], extra: [L('M-3,6 L-8,6 M-5,14 L-11,14 M-2,22 L-6,26', 'k', 1, { op: 0.25 }), SH('M-14,18 C-8,26 0,30 10,24 L10,34 L-14,34 Z', 0.12)],
    stages: {
      2: { grow: [1.12, 1.12], add: [L('M-3,6 L-9,6 M-5,14 L-12,14 M-2,22 L-7,26', 'a', 2.2, { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.1, 1.1], addShapes: [tube([[6, 12], [12, 8], [14, 2]], 5, 2)], add: [...evoGem(-1, 18, 2.8), C(15, 0, 2.2, 'a', { ns: true })] },
    } }),
  fPart({ id: 'lyre', slot: 'tail', name: 'Lyre', tags: ['fancy'], dom: 0.5, w: 1, shapes: [tLyre], extra: [inner([[-2, -6], [-14, -14], [-28, -28], [-30, -20], [-22, -8], [-18, 0], [-22, 8], [-30, 20], [-28, 28], [-14, 14], [-2, 6]]), rays([-2, 0], [[-30, -30], [-32, -18], [-32, 18], [-30, 30]]), ...finTips([[-30, -30], [-30, 30]], 2.6), SH('M-38,6 C-26,14 -10,14 2,10 L2,36 L-38,36 Z', 0.12)],
    stages: finStages(tLyre, [1.12, 1.15], [accentRays([-2, 0], [[-30, -30], [-32, -18], [-32, 18], [-30, 30]])], [...finTips([[-30, -30], [-30, 30]], 3.4), ...evoGem(-20, 0, 2.6)]) }),
];

const bAnal = [[10, -2], [6, 8], [-4, 18], [-18, 20], [-30, 14], [-24, 4], [-14, -2]];
const bFlowing = [[8, -2], [8, 10], [0, 24], [-12, 36, 0.3], [-20, 26], [-18, 12], [-12, 2]];
const bSpiky = [[8, -2], [8, 10, 'c'], [2, 4], [-2, 14, 'c'], [-8, 4], [-14, 12, 'c'], [-14, -2]];
const bPaddle = [[6, -2], [10, 6], [4, 16], [-6, 18], [-12, 10], [-8, 0]];
const bRibbon = [[20, -2], [16, 4], [4, 7], [-10, 8], [-26, 7], [-40, 4], [-46, 0], [-48, -2]];
const bTiny = [[-2, -2], [4, 0], [3, 7], [-3, 8], [-7, 4]];

export const F_BELLIES = [
  NONE('belly', 0.3, 'f.'),
  fPart({ id: 'pelvic', slot: 'belly', name: 'Pelvic pair', tags: ['classic'], dom: 0.5, w: 3, extra: [S([[-12, -4], [-2, -2], [-4, 8], [-12, 12], [-18, 6]], 'pd'), S([[-4, -2], [6, 0], [4, 10], [-4, 14], [-10, 8]], 'p'), rays([-2, 0], [[3, 9], [-4, 12]]), ...finTips([[3, 9], [-4, 12]], 1.8)],
    stages: {
      2: { grow: [1.12, 1.18], add: [accentRays([-2, 0], [[3, 9], [-4, 12]])] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: [[-16, -6], [0, -2], [-2, 12], [-14, 18], [-24, 8]], f: 'pd' }, { pts: [[-4, -2], [10, 0], [8, 14], [-2, 20], [-12, 10]], f: 'pd' }], add: [...finTips([[3, 9], [-4, 12]], 2.6)] },
    } }),
  fPart({ id: 'anal', slot: 'belly', name: 'Long fin', tags: ['long'], dom: 0.5, w: 2, shapes: [bAnal], extra: [inner([[6, 0], [4, 7], [-4, 14], [-16, 16], [-24, 11], [-20, 4], [-12, 0]]), rays([-8, 0], [[4, 8], [-6, 16], [-18, 17], [-26, 12]])],
    stages: finStages(bAnal, [1.1, 1.2], [accentRays([-8, 0], [[4, 8], [-6, 16], [-18, 17], [-26, 12]])], [...finTips([[4, 8], [-6, 16], [-18, 17], [-26, 12]], 2.2)]) }),
  fPart({ id: 'flowing', slot: 'belly', name: 'Flowing', tags: ['fancy'], dom: 0.5, w: 2, shapes: [bFlowing], extra: [inner([[5, 0], [5, 10], [-2, 22], [-10, 30], [-16, 24], [-14, 12], [-9, 3]]), rays([-3, 0], [[5, 12], [-2, 24], [-12, 32], [-16, 20]]), ...finTips([[-2, 24], [-12, 32]])],
    stages: finStages(bFlowing, [1.1, 1.18], [accentRays([-3, 0], [[5, 12], [-2, 24], [-12, 32], [-16, 20]])], [...finTips([[-2, 24], [-12, 32]], 3)], 1.25) }),
  fPart({ id: 'spiky', slot: 'belly', name: 'Spiky', tags: ['spines'], dom: 0.5, w: 2, shapes: [bSpiky], extra: [rays([-3, 0], [[6, 8], [-3, 12], [-12, 10]])],
    stages: finStages(bSpiky, [1.1, 1.2], [accentRays([-3, 0], [[6, 8], [-3, 12], [-12, 10]])], [...finTips([[8, 10], [-2, 14], [-14, 12]], 2.2)]) }),
  fPart({ id: 'paddle', slot: 'belly', name: 'Paddle', tags: ['koi'], dom: 0.5, w: 2, shapes: [bPaddle], extra: [inner([[4, 0], [7, 6], [3, 13], [-5, 14], [-9, 9], [-6, 2]]), rays([-1, 0], [[6, 9], [-2, 14], [-8, 9]])],
    stages: finStages(bPaddle, [1.1, 1.15], [accentRays([-1, 0], [[6, 9], [-2, 14], [-8, 9]])], [...finTips([[6, 9], [-2, 14], [-8, 9]], 2.2)]) }),
  fPart({ id: 'ribbon', slot: 'belly', name: 'Ribbon fin', tags: ['eel'], dom: 0.5, w: 2, shapes: [bRibbon], extra: [inner([[16, 0], [12, 3], [2, 5], [-12, 5], [-28, 4], [-40, 1]]), L('M12,-1 L10,4 M2,-1 L0,6 M-8,-1 L-10,6 M-18,-1 L-20,5 M-28,-1 L-30,4 M-38,-1 L-40,2', 'k', 1.1, { op: 0.3 })],
    stages: finStages(bRibbon, [1.05, 1.5], [L('M12,-1 L10,4 M2,-1 L0,6 M-8,-1 L-10,6 M-18,-1 L-20,5 M-28,-1 L-30,4', 'a', 1.5, { ns: true, op: 0.7 })], [...finTips([[10, 5], [-10, 7], [-30, 5]], 2.4)], 1.25) }),
  fPart({ id: 'tiny', slot: 'belly', name: 'Tiny', tags: ['small'], dom: 0.4, w: 2, shapes: [bTiny], extra: [rays([0, 0], [[2, 6], [-4, 5]])],
    stages: finStages(bTiny, [1.15, 1.25], [accentRays([0, 0], [[2, 6], [-4, 5]])], [...finTips([[2, 6], [-4, 5]], 1.8)], 1.4) }),
];
