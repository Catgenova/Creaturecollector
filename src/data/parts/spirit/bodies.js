// Spirit bodies (shrouds). Origin = the middle of the shroud; every body hovers above its shadow and carries the
// face. Sockets: eye / eyeFar and mouth on the face, hood (the crown), mask (the face centre), arm / armFar (the
// sides), tail (the bottom), chains and tatters (low on the shroud, behind).
// kinds: 'spirit.wisp', 'spirit.sheet', 'spirit.orb', 'spirit.shade', 'spirit.flame', 'spirit.wraith', 'spirit.blob'.
// Evolutions: stage 2 grows and raises wisps from the shoulders; stage 3 grows more, adds wisps and a heart light.
import { spBody, torsoShade } from './_shared.js';
import { L, HL, PATCH, C, fur, spline, puff } from '../_dsl.js';
import { evoFan } from '../_evo.js';

const spBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -150, -30, 4, 4, 12, { tip: 'c' })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, -160, -20, 5, 4, 14, { tip: 'c' })], add: [C(2, 8, 4, 'a', { ns: true, op: 0.5 }), C(2, 8, 7, 'a', { ns: true, op: 0.18 })] },
});
const spSockets = (o) => ({ eye: { x: 8, y: -8, s: 1 }, eyeFar: { x: -2, y: -9, s: 0.9 }, mouth: { x: 6, y: 2, a: 0, s: 1 }, hood: { x: 2, y: -18, a: 0, s: 1 }, mask: { x: 4, y: -4, a: 0, s: 1 }, arm: { x: 13, y: 2, a: 0, s: 1 }, armFar: { x: -13, y: 0, a: 0, s: 0.95 }, tail: { x: -2, y: 20, a: 0, s: 1 }, chains: { x: 0, y: 10, a: 0, s: 1 }, tatters: { x: 0, y: 14, a: 0, s: 1 }, ...o });
/** A paler heart of the shroud, clipped to it. */
const spCore = (x, y, rx, ry) => PATCH(`M${x - rx},${y} C${x - rx},${y - ry * 1.35} ${x + rx},${y - ry * 1.35} ${x + rx},${y} C${x + rx},${y + ry * 1.35} ${x - rx},${y + ry * 1.35} ${x - rx},${y} Z`, 'pl', { op: 0.55 });
const spFold = (d) => L(d, 'k', 1.1, { op: 0.2 });

export const SP_BODIES = [
  spBody({
    id: 'wisp', name: 'Wisp', kind: 'spirit.wisp', tags: ['teardrop'], dom: 0.5, w: 3, hover: 14,
    pts: [[-16, -6], [-12, -18], [0, -24], [12, -18], [16, -6], [12, 8], [4, 18], [-2, 22], [-8, 16], [-14, 6]],
    shade: torsoShade(-16, 16, -24, 22, { shadeFrac: 0.5 }),
    extra: [spCore(0, -4, 8, 10), spFold('M-6,6 C-4,12 -2,16 -2,20 M6,8 C4,12 3,15 2,17'), HL('M-12,-14 C-8,-21 0,-24 6,-22 C0,-20 -6,-16 -10,-8 Z', 0.22)],
    sockets: spSockets({}), stages: spBodyStages(4, -22, -6, -20),
  }),
  spBody({
    id: 'sheet', name: 'Sheet', kind: 'spirit.sheet', tags: ['classic'], dom: 0.5, w: 3, hover: 14,
    pts: [[-16, -4], [-12, -18], [0, -24], [12, -18], [16, -4], [16, 14], ...fur([16, 14], [-16, 14], 4, 6, { tip: 'c', lean: 0 }), [-16, 6]],
    shade: torsoShade(-16, 16, -24, 20, { shadeFrac: 0.5 }),
    extra: [spCore(0, -4, 8, 10), spFold('M-8,2 L-9,14 M0,4 L0,16 M8,2 L9,14'), HL('M-12,-14 C-8,-21 0,-24 6,-22 C0,-20 -6,-16 -10,-8 Z', 0.22)],
    sockets: spSockets({ tail: { x: -4, y: 18, a: 0, s: 0.9 } }), stages: spBodyStages(4, -22, -6, -20),
  }),
  spBody({
    id: 'orb', name: 'Orb', kind: 'spirit.orb', tags: ['round'], dom: 0.45, w: 2, hover: 16,
    pts: [[-16, -2], [-12, -14], [0, -19], [12, -14], [17, -2], [13, 10], [2, 15], [-9, 12], [-15, 6]],
    shade: torsoShade(-17, 17, -19, 15, { shadeFrac: 0.5 }),
    extra: [spCore(0, -2, 8, 8), HL('M-12,-10 C-8,-16 0,-19 6,-17 C0,-15 -6,-12 -10,-5 Z', 0.22)],
    sockets: spSockets({ eye: { x: 7, y: -5, s: 1 }, eyeFar: { x: -2, y: -6, s: 0.9 }, mouth: { x: 5, y: 4, a: 0, s: 1 }, hood: { x: 1, y: -14, a: 0, s: 1 }, mask: { x: 3, y: -1, a: 0, s: 1 }, arm: { x: 13, y: 2, a: 0, s: 1 }, armFar: { x: -13, y: 1, a: 0, s: 0.95 }, tail: { x: -2, y: 14, a: 0, s: 1 }, chains: { x: 0, y: 8, a: 0, s: 1 }, tatters: { x: 0, y: 10, a: 0, s: 1 } }),
    stages: spBodyStages(4, -17, -6, -15),
  }),
  spBody({
    id: 'shade', name: 'Shade', kind: 'spirit.shade', tags: ['tall'], dom: 0.5, w: 2, hover: 12,
    pts: [[-12, -8], [-10, -22], [0, -28], [10, -22], [13, -8], [11, 10], [5, 22], [-2, 26], [-7, 20], [-12, 6]],
    shade: torsoShade(-13, 13, -28, 26, { shadeFrac: 0.5 }),
    extra: [spCore(0, -6, 6, 10), spFold('M-4,4 C-3,12 -3,18 -2,24 M5,6 C5,12 4,16 3,20'), HL('M-9,-18 C-6,-25 0,-28 5,-26 C0,-24 -4,-20 -8,-12 Z', 0.22)],
    sockets: spSockets({ eye: { x: 6, y: -12, s: 1 }, eyeFar: { x: -2, y: -13, s: 0.9 }, mouth: { x: 5, y: -2, a: 0, s: 1 }, hood: { x: 1, y: -22, a: 0, s: 1 }, mask: { x: 3, y: -8, a: 0, s: 1 }, arm: { x: 11, y: 0, a: 0, s: 1 }, armFar: { x: -11, y: -2, a: 0, s: 0.95 }, tail: { x: -2, y: 24, a: 0, s: 1 }, chains: { x: 0, y: 12, a: 0, s: 1 }, tatters: { x: 0, y: 16, a: 0, s: 1 } }),
    stages: spBodyStages(3, -26, -6, -24),
  }),
  spBody({
    id: 'flame', name: 'Flame', kind: 'spirit.flame', tags: ['fire'], dom: 0.5, w: 2, hover: 14,
    pts: [[-14, 0], [-12, -12], [-4, -20], [2, -30, 'c'], [6, -20], [14, -10], [16, 2], [10, 14], [2, 20], [-6, 16], [-13, 10]],
    shade: torsoShade(-14, 16, -30, 20, { shadeFrac: 0.5 }),
    extra: [spCore(1, 0, 8, 10), spFold('M-4,-14 C-2,-8 -2,-4 -3,0 M6,-12 C6,-6 5,-2 4,2'), HL('M-10,-10 C-8,-16 -4,-20 0,-24 C-2,-18 -4,-12 -8,-4 Z', 0.22)],
    sockets: spSockets({ eye: { x: 8, y: -6, s: 1 }, eyeFar: { x: -2, y: -8, s: 0.9 }, mouth: { x: 7, y: 4, a: 0, s: 1 }, hood: { x: 2, y: -20, a: 0, s: 1 }, mask: { x: 4, y: -2, a: 0, s: 1 }, arm: { x: 14, y: 4, a: 0, s: 1 }, armFar: { x: -13, y: 2, a: 0, s: 0.95 }, tail: { x: -2, y: 18, a: 0, s: 1 }, chains: { x: 0, y: 10, a: 0, s: 1 }, tatters: { x: 0, y: 12, a: 0, s: 1 } }),
    stages: spBodyStages(6, -18, -8, -14),
  }),
  spBody({
    id: 'wraith', name: 'Wraith', kind: 'spirit.wraith', tags: ['hooded'], dom: 0.55, w: 2, hover: 12,
    pts: [[-18, -2], [-16, -14], [-8, -22], [2, -26], [12, -20], [18, -10], [18, 4], [12, 16], [4, 24], [-4, 24], [-12, 16], [-18, 8]],
    shade: torsoShade(-18, 18, -26, 24, { shadeFrac: 0.5 }),
    extra: [spCore(1, -4, 8, 10), spFold('M-10,0 C-10,8 -8,16 -6,22 M10,0 C10,8 8,14 6,20'), HL('M-14,-12 C-10,-20 -2,-25 6,-24 C-2,-21 -8,-16 -12,-6 Z', 0.22)],
    sockets: spSockets({ eye: { x: 8, y: -9, s: 1 }, eyeFar: { x: -2, y: -10, s: 0.9 }, mouth: { x: 6, y: 1, a: 0, s: 1 }, hood: { x: 2, y: -20, a: 0, s: 1 }, mask: { x: 4, y: -5, a: 0, s: 1 }, arm: { x: 16, y: 0, a: 0, s: 1 }, armFar: { x: -15, y: -2, a: 0, s: 0.95 }, tail: { x: -2, y: 22, a: 0, s: 1 }, chains: { x: 0, y: 12, a: 0, s: 1 }, tatters: { x: 0, y: 16, a: 0, s: 1 } }),
    stages: spBodyStages(6, -24, -8, -22),
  }),
  spBody({
    id: 'blob', name: 'Blob', kind: 'spirit.blob', tags: ['wide'], dom: 0.5, w: 2, hover: 10,
    pts: [[-20, 0], [-16, -12], [-4, -18], [10, -16], [20, -8], [22, 4], [16, 12], [4, 16], [-8, 16], [-18, 10]],
    shade: torsoShade(-20, 22, -18, 16, { shadeFrac: 0.5 }),
    extra: [spCore(0, -2, 10, 8), spFold('M-10,6 C-8,10 -6,12 -6,14 M12,4 C12,8 10,11 8,13'), HL('M-16,-8 C-12,-15 -4,-18 4,-17 C-4,-14 -10,-11 -14,-3 Z', 0.22)],
    sockets: spSockets({ eye: { x: 8, y: -6, s: 1 }, eyeFar: { x: -3, y: -7, s: 0.9 }, mouth: { x: 6, y: 3, a: 0, s: 1 }, hood: { x: 2, y: -15, a: 0, s: 1 }, mask: { x: 4, y: -3, a: 0, s: 1 }, arm: { x: 18, y: 2, a: 0, s: 1 }, armFar: { x: -16, y: 0, a: 0, s: 0.95 }, tail: { x: -2, y: 15, a: 0, s: 0.9 }, chains: { x: 0, y: 8, a: 0, s: 1 }, tatters: { x: 0, y: 12, a: 0, s: 1 } }),
    stages: spBodyStages(6, -16, -8, -14),
  }),
];
