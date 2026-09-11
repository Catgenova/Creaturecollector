// Fiend bodies (upright torsos). Origin = the middle of the chest; the creature faces right, so the chest bulges to
// +x. Sockets: head (the neck, top), arm / armFar (the shoulders), leg / legFar (the hips), tail (low on the back),
// wing / wingFar (high on the back).
// kinds: 'fiend.imp', 'fiend.brute', 'fiend.lanky', 'fiend.stout', 'fiend.armoured', 'fiend.hunched', 'fiend.regal'.
// Evolutions: stage 2 grows and raises shoulder spurs; stage 3 grows more, adds spurs and lights the chest.
import { fdBody, torsoShade } from './_shared.js';
import { L, HL, PATCH, C } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const fdBodyStages = (x2, y2, xf, yf) => ({
  2: { grow: [1.06, 1.05], addBehind: [{ pts: evoSpike(x2, y2, -70, 10, 5), f: 'pd' }, { pts: evoSpike(xf, yf, -110, 9, 5), f: 'pd' }] },
  3: { grow: [1.06, 1.06], addBehind: [{ pts: evoSpike(x2, y2, -70, 13, 6), f: 'pd' }, { pts: evoSpike(x2 + 3, y2 + 6, -60, 9, 4), f: 'pd' }, { pts: evoSpike(xf, yf, -110, 12, 6), f: 'pd' }], add: [C(4, -6, 4, 'a', { ns: true, op: 0.45 })] },
});
const fdSockets = (o) => ({ head: { x: 4, y: -22, a: 0, s: 1 }, arm: { x: 9, y: -13, a: 0, s: 1 }, armFar: { x: -7, y: -14, a: 0, s: 0.95 }, leg: { x: 6, y: 18, a: 0, s: 1 }, legFar: { x: -5, y: 17, a: 0, s: 0.95 }, tail: { x: -12, y: 12, a: 0, s: 1 }, wing: { x: -8, y: -14, a: 0, s: 1 }, wingFar: { x: -13, y: -14, a: 0, s: 0.95 }, ...o });
/** A lighter belly and chest plate down the front, clipped to the torso. */
const fdBelly = (x, y0, y1, w) => PATCH(`M${x - w},${y0} C${x + w * 0.4},${y0 - 2} ${x + w * 1.4},${y0 + 4} ${x + w * 1.3},${(y0 + y1) / 2} C${x + w * 1.4},${y1 - 4} ${x + w * 0.4},${y1 + 2} ${x - w},${y1} Z`, 's', { op: 0.75 });
const fdRibs = (d) => L(d, 'k', 1.1, { op: 0.25 });

export const FD_BODIES = [
  fdBody({
    id: 'imp', name: 'Imp', kind: 'fiend.imp', tags: ['small'], dom: 0.45, w: 3,
    pts: [[-10, -20], [6, -22], [14, -14], [14, 0], [12, 14], [6, 20], [-6, 20], [-12, 12], [-14, -4]],
    shade: torsoShade(-14, 14, -22, 20, { shadeFrac: 0.5 }),
    extra: [fdBelly(4, -8, 16, 6), fdRibs('M2,-10 L8,-9 M1,-4 L8,-3'), HL('M-8,-18 C-2,-22 4,-22 8,-18 C2,-18 -4,-16 -8,-12 Z', 0.2)],
    sockets: fdSockets({}), stages: fdBodyStages(8, -20, -8, -20),
  }),
  fdBody({
    id: 'brute', name: 'Brute', kind: 'fiend.brute', tags: ['broad'], dom: 0.55, w: 2,
    pts: [[-16, -20], [4, -24], [18, -18], [20, -4], [16, 12], [8, 20], [-6, 20], [-14, 12], [-20, -4]],
    shade: torsoShade(-20, 20, -24, 20, { shadeFrac: 0.5 }),
    extra: [fdBelly(5, -12, 16, 8), fdRibs('M0,-12 L10,-11 M0,-6 L10,-5 M1,0 L10,1'), HL('M-14,-18 C-6,-24 4,-24 10,-20 C2,-20 -6,-18 -12,-12 Z', 0.2)],
    sockets: fdSockets({ head: { x: 4, y: -24, a: 0, s: 1 }, arm: { x: 14, y: -16, a: 0, s: 1 }, armFar: { x: -12, y: -17, a: 0, s: 0.95 }, leg: { x: 6, y: 18, a: 0, s: 1 }, legFar: { x: -6, y: 17, a: 0, s: 0.95 }, tail: { x: -14, y: 12, a: 0, s: 1 }, wing: { x: -10, y: -16, a: 0, s: 1 }, wingFar: { x: -16, y: -16, a: 0, s: 0.95 } }),
    stages: fdBodyStages(12, -22, -12, -22),
  }),
  fdBody({
    id: 'lanky', name: 'Lanky', kind: 'fiend.lanky', tags: ['thin'], dom: 0.5, w: 2,
    pts: [[-8, -24], [4, -26], [11, -18], [11, 0], [9, 16], [4, 24], [-4, 24], [-9, 16], [-11, -6]],
    shade: torsoShade(-11, 11, -26, 24, { shadeFrac: 0.5 }),
    extra: [fdBelly(3, -10, 20, 5), fdRibs('M0,-14 L6,-13 M0,-8 L6,-7 M0,-2 L6,-1'), HL('M-6,-22 C-1,-26 4,-26 7,-22 C2,-22 -3,-20 -6,-14 Z', 0.2)],
    sockets: fdSockets({ head: { x: 3, y: -26, a: 0, s: 1 }, arm: { x: 7, y: -18, a: 0, s: 1 }, armFar: { x: -5, y: -19, a: 0, s: 0.95 }, leg: { x: 4, y: 22, a: 0, s: 1 }, legFar: { x: -4, y: 21, a: 0, s: 0.95 }, tail: { x: -9, y: 14, a: 0, s: 1 }, wing: { x: -6, y: -18, a: 0, s: 1 }, wingFar: { x: -10, y: -18, a: 0, s: 0.95 } }),
    stages: fdBodyStages(6, -24, -6, -24),
  }),
  fdBody({
    id: 'stout', name: 'Stout', kind: 'fiend.stout', tags: ['round'], dom: 0.5, w: 2,
    pts: [[-12, -18], [4, -20], [14, -12], [18, 2], [16, 14], [8, 20], [-6, 20], [-16, 12], [-18, 0]],
    shade: torsoShade(-18, 18, -20, 20, { shadeFrac: 0.5 }),
    extra: [fdBelly(4, -6, 16, 8), fdRibs('M2,-8 L10,-7'), L('M0,4 C6,4 10,8 12,12', 'k', 1.1, { op: 0.25 }), HL('M-10,-16 C-4,-20 4,-20 8,-16 C2,-16 -4,-14 -8,-10 Z', 0.2)],
    sockets: fdSockets({ head: { x: 4, y: -20, a: 0, s: 1 }, arm: { x: 10, y: -12, a: 0, s: 1 }, armFar: { x: -8, y: -13, a: 0, s: 0.95 }, leg: { x: 6, y: 18, a: 0, s: 1 }, legFar: { x: -6, y: 17, a: 0, s: 0.95 }, tail: { x: -14, y: 10, a: 0, s: 1 }, wing: { x: -8, y: -14, a: 0, s: 1 }, wingFar: { x: -13, y: -14, a: 0, s: 0.95 } }),
    stages: fdBodyStages(8, -18, -8, -18),
  }),
  fdBody({
    id: 'armoured', name: 'Armoured', kind: 'fiend.armoured', tags: ['plate'], dom: 0.55, w: 2,
    pts: [[-14, -20, 'c'], [4, -24, 'c'], [18, -16, 'c'], [18, -2, 'c'], [14, 14, 'c'], [6, 20, 'c'], [-6, 20, 'c'], [-14, 12, 'c'], [-18, -4, 'c']],
    shade: torsoShade(-18, 18, -24, 20, { shadeFrac: 0.5 }),
    extra: [PATCH('M-8,-14 L12,-12 L14,2 L10,14 L-6,14 L-10,2 Z', 'pd', { op: 0.9 }), L('M-8,-14 L12,-12 M-9,-4 L13,-2 M-8,6 L12,8', 'k', 1.1, { op: 0.35 }), C(2, -8, 1.2, 'a', { ns: true, op: 0.85 }), C(2, 2, 1.2, 'a', { ns: true, op: 0.85 }), HL('M-12,-18 C-6,-23 2,-24 8,-20 C2,-20 -6,-18 -10,-12 Z', 0.2)],
    sockets: fdSockets({ head: { x: 4, y: -24, a: 0, s: 1 }, arm: { x: 13, y: -15, a: 0, s: 1 }, armFar: { x: -11, y: -16, a: 0, s: 0.95 }, leg: { x: 6, y: 18, a: 0, s: 1 }, legFar: { x: -6, y: 17, a: 0, s: 0.95 }, tail: { x: -13, y: 12, a: 0, s: 1 }, wing: { x: -10, y: -16, a: 0, s: 1 }, wingFar: { x: -15, y: -16, a: 0, s: 0.95 } }),
    stages: fdBodyStages(12, -22, -12, -22),
  }),
  fdBody({
    id: 'hunched', name: 'Hunched', kind: 'fiend.hunched', tags: ['bent'], dom: 0.5, w: 2,
    pts: [[-14, -14], [-4, -24], [10, -22], [18, -12], [16, 2], [12, 14], [4, 20], [-6, 20], [-14, 12], [-18, -2]],
    shade: torsoShade(-18, 18, -24, 20, { shadeFrac: 0.5 }),
    extra: [fdBelly(4, -6, 16, 7), fdRibs('M-4,-16 L6,-14 M-2,-8 L8,-6'), HL('M-10,-16 C-6,-22 2,-24 8,-22 C0,-20 -6,-16 -10,-10 Z', 0.2)],
    sockets: fdSockets({ head: { x: 10, y: -20, a: 10, s: 1 }, arm: { x: 12, y: -12, a: 0, s: 1 }, armFar: { x: -8, y: -16, a: 0, s: 0.95 }, leg: { x: 4, y: 18, a: 0, s: 1 }, legFar: { x: -6, y: 17, a: 0, s: 0.95 }, tail: { x: -14, y: 10, a: 0, s: 1 }, wing: { x: -10, y: -18, a: 0, s: 1 }, wingFar: { x: -15, y: -16, a: 0, s: 0.95 } }),
    stages: fdBodyStages(6, -22, -10, -20),
  }),
  fdBody({
    id: 'regal', name: 'Regal', kind: 'fiend.regal', tags: ['tall'], dom: 0.55, w: 2,
    pts: [[-14, -24], [4, -28], [16, -22], [16, -8], [12, 8], [8, 22], [-6, 22], [-10, 8], [-16, -8]],
    shade: torsoShade(-16, 16, -28, 22, { shadeFrac: 0.5 }),
    extra: [fdBelly(4, -14, 18, 6), fdRibs('M0,-16 L8,-15 M0,-10 L8,-9 M1,-4 L8,-3'), HL('M-12,-22 C-6,-27 2,-28 8,-24 C2,-24 -6,-22 -10,-16 Z', 0.2)],
    sockets: fdSockets({ head: { x: 4, y: -28, a: 0, s: 1 }, arm: { x: 12, y: -20, a: 0, s: 1 }, armFar: { x: -10, y: -21, a: 0, s: 0.95 }, leg: { x: 6, y: 20, a: 0, s: 1 }, legFar: { x: -5, y: 19, a: 0, s: 0.95 }, tail: { x: -10, y: 12, a: 0, s: 1 }, wing: { x: -8, y: -20, a: 0, s: 1 }, wingFar: { x: -13, y: -20, a: 0, s: 0.95 } }),
    stages: fdBodyStages(10, -26, -10, -26),
  }),
];
