// Nightwing bodies (bat torsos). Origin = centre; every body hovers above its shadow. Sockets: head (front, up),
// wing / wingFar on the shoulders, leg / legFar under the hips, tail (back), ruff (the neck).
// kinds: 'bat.round', 'bat.slim', 'bat.fluffy', 'bat.long', 'bat.pear', 'bat.tiny', 'bat.broad'.
// Evolutions: stage 2 grows and raises a fur ridge on the back; stage 3 grows more and lights a chest patch.
import { nwBody, torsoShade } from './_shared.js';
import { L, HL, PATCH, fur, spline, puff } from '../_dsl.js';
import { evoFan } from '../_evo.js';

const nwBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -130, -60, 4, 4, 12, { tip: 'c' })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, -135, -55, 5, 4, 14, { tip: 'c' })], add: [PATCH(spline(puff(8, 2, 7, 6, 2)), 'a')] },
});
const nwSockets = (o) => ({ head: { x: 20, y: -10, a: -10, s: 1 }, wing: { x: -4, y: -12, a: 0, s: 1 }, wingFar: { x: -10, y: -12, a: 0, s: 0.95 }, leg: { x: -12, y: 12, a: 0, s: 1 }, legFar: { x: -18, y: 10, a: 0, s: 0.95 }, tail: { x: -24, y: 4, a: 0, s: 1 }, ruff: { x: 10, y: -6, a: 0, s: 1 }, ...o });
/** A pale belly, clipped to the torso, from x0 to x1 with its top at y. */
const nwBelly = (x0, x1, y) => PATCH(`M${x0},${y} C${x0 + (x1 - x0) * 0.3},${y + 12} ${x0 + (x1 - x0) * 0.7},${y + 12} ${x1},${y - 2} L${x1},${y + 30} L${x0},${y + 30} Z`, 's', { op: 0.85 });
/** Short fur ticks along the back. */
const nwTicks = (d) => L(d, 'k', 1.2, { op: 0.28 });

export const NW_BODIES = [
  nwBody({
    id: 'round', name: 'Round', kind: 'bat.round', tags: ['plump'], dom: 0.5, w: 3, hover: 12,
    pts: [[-24, -4], [-18, -13], [-4, -17], [12, -15], [24, -7], [26, 3], [20, 11], ...fur([20, 11], [-18, 12], 6, 2.5), [-22, 8]],
    shade: torsoShade(-24, 26, -17, 12, { shadeFrac: 0.35 }),
    extra: [nwBelly(-20, 24, 2), nwTicks('M-14,-10 L-12,-13 M-4,-14 L-2,-17 M8,-13 L10,-16'), HL('M-18,-8 C-12,-14 -2,-16 6,-15 C-2,-12 -10,-9 -14,-4 Z', 0.2)],
    sockets: nwSockets({}), stages: nwBodyStages(6, -15, -12, -13),
  }),
  nwBody({
    id: 'slim', name: 'Slim', kind: 'bat.slim', tags: ['lean'], dom: 0.5, w: 3, hover: 14,
    pts: [[-28, -2], [-22, -10], [-8, -13], [10, -12], [24, -6], [28, 2], [22, 8], ...fur([22, 8], [-22, 8], 7, 2), [-28, 4]],
    shade: torsoShade(-28, 28, -13, 8, { shadeFrac: 0.35 }),
    extra: [nwBelly(-24, 26, 1), nwTicks('M-16,-8 L-14,-11 M-4,-11 L-2,-14 M10,-10 L12,-13'), HL('M-22,-6 C-14,-11 -4,-12 6,-12 C-4,-9 -12,-6 -18,-2 Z', 0.2)],
    sockets: nwSockets({ head: { x: 22, y: -8, a: -12, s: 1 }, wing: { x: -6, y: -10, a: 0, s: 1 }, wingFar: { x: -12, y: -10, a: 0, s: 0.95 }, leg: { x: -14, y: 8, a: 0, s: 1 }, legFar: { x: -20, y: 6, a: 0, s: 0.95 }, tail: { x: -28, y: 2, a: 0, s: 1 }, ruff: { x: 12, y: -5, a: 0, s: 1 } }),
    stages: nwBodyStages(4, -12, -14, -10),
  }),
  nwBody({
    id: 'fluffy', name: 'Fluffy', kind: 'bat.fluffy', tags: ['fur'], dom: 0.5, w: 2, hover: 12,
    pts: [[-22, -6], ...fur([-22, -6], [-6, -18], 3, 3), ...fur([-6, -18], [12, -16], 3, 3), [24, -8], [26, 2], [20, 12], ...fur([20, 12], [-18, 12], 6, 3), [-24, 6]],
    shade: torsoShade(-24, 26, -18, 12, { shadeFrac: 0.35 }),
    extra: [nwBelly(-20, 24, 2), nwTicks('M-12,-12 L-10,-16 M0,-14 L2,-18 M10,-13 L12,-17 M-16,4 L-18,7'), HL('M-16,-10 C-10,-16 0,-17 8,-16 C0,-13 -8,-10 -12,-5 Z', 0.2)],
    sockets: nwSockets({}), stages: nwBodyStages(4, -17, -12, -14),
  }),
  nwBody({
    id: 'long', name: 'Long', kind: 'bat.long', tags: ['long'], dom: 0.5, w: 2, hover: 13,
    pts: [[-32, 0], [-26, -9], [-10, -12], [10, -11], [26, -6], [32, 2], [26, 8], ...fur([26, 8], [-26, 8], 8, 2), [-32, 4]],
    shade: torsoShade(-32, 32, -12, 8, { shadeFrac: 0.35 }),
    extra: [nwBelly(-28, 30, 1), nwTicks('M-20,-7 L-18,-10 M-6,-10 L-4,-13 M10,-9 L12,-12 M22,-5 L24,-8'), HL('M-26,-6 C-16,-10 -6,-11 6,-11 C-6,-8 -16,-5 -22,-1 Z', 0.2)],
    sockets: nwSockets({ head: { x: 26, y: -8, a: -10, s: 1 }, wing: { x: -8, y: -10, a: 0, s: 1 }, wingFar: { x: -14, y: -10, a: 0, s: 0.95 }, leg: { x: -18, y: 8, a: 0, s: 1 }, legFar: { x: -24, y: 6, a: 0, s: 0.95 }, tail: { x: -32, y: 2, a: 0, s: 1 }, ruff: { x: 14, y: -5, a: 0, s: 1 } }),
    stages: nwBodyStages(2, -11, -16, -9),
  }),
  nwBody({
    id: 'pear', name: 'Pear', kind: 'bat.pear', tags: ['heavy'], dom: 0.5, w: 2, hover: 10,
    pts: [[-20, -6], [-14, -14], [2, -16], [16, -12], [24, -2], [26, 8], [18, 16], ...fur([18, 16], [-16, 16], 6, 2.5), [-24, 6]],
    shade: torsoShade(-24, 26, -16, 16, { shadeFrac: 0.35 }),
    extra: [nwBelly(-20, 24, 4), nwTicks('M-10,-12 L-8,-15 M2,-13 L4,-16 M12,-10 L14,-13'), HL('M-14,-10 C-8,-15 0,-16 8,-14 C0,-11 -6,-8 -10,-4 Z', 0.2)],
    sockets: nwSockets({ head: { x: 18, y: -11, a: -12, s: 1 }, wing: { x: -4, y: -12, a: 0, s: 1 }, wingFar: { x: -10, y: -12, a: 0, s: 0.95 }, leg: { x: -8, y: 16, a: 0, s: 1 }, legFar: { x: -14, y: 14, a: 0, s: 0.95 }, tail: { x: -22, y: 8, a: 0, s: 1 }, ruff: { x: 8, y: -8, a: 0, s: 1 } }),
    stages: nwBodyStages(2, -15, -10, -13),
  }),
  nwBody({
    id: 'tiny', name: 'Tiny', kind: 'bat.tiny', tags: ['small'], dom: 0.45, w: 2, hover: 12,
    pts: [[-16, -2], [-12, -10], [-2, -13], [10, -11], [17, -5], [18, 3], [13, 9], ...fur([13, 9], [-12, 9], 4, 2), [-17, 4]],
    shade: torsoShade(-17, 18, -13, 9, { shadeFrac: 0.35 }),
    extra: [nwBelly(-14, 16, 1), nwTicks('M-8,-8 L-6,-11 M2,-10 L4,-13'), HL('M-12,-6 C-8,-10 -2,-12 4,-11 C-2,-9 -6,-6 -10,-2 Z', 0.2)],
    sockets: nwSockets({ head: { x: 14, y: -8, a: -12, s: 1 }, wing: { x: -2, y: -10, a: 0, s: 0.9 }, wingFar: { x: -7, y: -10, a: 0, s: 0.85 }, leg: { x: -8, y: 9, a: 0, s: 0.9 }, legFar: { x: -12, y: 8, a: 0, s: 0.85 }, tail: { x: -16, y: 2, a: 0, s: 0.9 }, ruff: { x: 6, y: -5, a: 0, s: 0.9 } }),
    stages: nwBodyStages(2, -12, -8, -10),
  }),
  nwBody({
    id: 'broad', name: 'Broad', kind: 'bat.broad', tags: ['heavy'], dom: 0.55, w: 2, hover: 11,
    pts: [[-26, -4], [-20, -14], [-4, -20], [14, -18], [28, -10], [30, 2], [24, 12], ...fur([24, 12], [-20, 12], 6, 2.5), [-28, 6]],
    shade: torsoShade(-28, 30, -20, 12, { shadeFrac: 0.35 }),
    extra: [nwBelly(-24, 28, 2), nwTicks('M-16,-12 L-14,-15 M-4,-17 L-2,-20 M10,-16 L12,-19 M20,-10 L22,-13'), HL('M-20,-10 C-12,-17 -2,-19 8,-18 C0,-15 -10,-11 -16,-5 Z', 0.2)],
    sockets: nwSockets({ head: { x: 24, y: -12, a: -8, s: 1 }, wing: { x: -4, y: -15, a: 0, s: 1 }, wingFar: { x: -10, y: -15, a: 0, s: 0.95 }, leg: { x: -12, y: 12, a: 0, s: 1 }, legFar: { x: -18, y: 10, a: 0, s: 0.95 }, tail: { x: -26, y: 4, a: 0, s: 1 }, ruff: { x: 12, y: -8, a: 0, s: 1 } }),
    stages: nwBodyStages(6, -18, -12, -16),
  }),
];
