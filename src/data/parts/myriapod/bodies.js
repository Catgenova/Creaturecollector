// Myriapod bodies (segmented trunks). Origin = centre; the head end is on the right. Sockets: head (front), tail
// (back), leg1..leg3 along the near belly line and leg1Far..leg3Far along the far one, plates (top middle),
// bristles (top, behind the plates).
// kinds: 'pede.segmented', 'pede.armored', 'pede.flat', 'pede.bulbous', 'pede.long', 'pede.spiky', 'pede.coiled'.
// Evolutions: stage 2 grows and raises spurs at two joints; stage 3 grows more, adds spurs and dots every segment.
import { myBody, torsoShade } from './_shared.js';
import { L, HL, PATCH, C, tube } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

/** Top edge of a segmented trunk from x0 to x1: n humps at yTop with the joints dipping to yDip. */
const mySegTop = (x0, x1, n, yTop, yDip) => {
  const out = [], w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { out.push([x0 + w * (i + 0.5), yTop, 1]); if (i < n - 1) out.push([x0 + w * (i + 1), yDip, 0.5]); }
  return out;
};
/** Joint lines down through the trunk. */
const mySegLines = (x0, x1, n, y0, y1) => {
  let d = ''; const w = (x1 - x0) / n;
  for (let i = 1; i < n; i++) { const x = x0 + w * i; d += `M${x},${y0} C${x - 1},${(y0 + y1) / 2} ${x - 1},${(y0 + y1) / 2} ${x},${y1} `; }
  return L(d.trim(), 'k', 1.2, { op: 0.32 });
};
const myBelly = (y) => PATCH(`M-50,${y} C-25,${y + 5} 25,${y + 5} 50,${y} L50,${y + 24} L-50,${y + 24} Z`, 's', { op: 0.7 });
const mySockets = (o) => ({ head: { x: 34, y: -4, a: -6, s: 1 }, tail: { x: -36, y: 0, a: 0, s: 1 }, leg1: { x: 22, y: 8, a: 0 }, leg2: { x: 2, y: 9, a: 0 }, leg3: { x: -18, y: 8, a: 0 }, leg1Far: { x: 16, y: 6, a: 0, s: 0.92 }, leg2Far: { x: -4, y: 7, a: 0, s: 0.92 }, leg3Far: { x: -24, y: 6, a: 0, s: 0.92 }, plates: { x: 0, y: -12, a: 0, s: 1 }, bristles: { x: -8, y: -11, a: 0, s: 1 }, ...o });
const myBodyStages = (xs, y) => ({
  2: { grow: [1.05, 1.06], addBehind: [{ pts: evoSpike(xs[0], y, -95, 9, 5), f: 'pd' }, { pts: evoSpike(xs[1], y, -100, 8, 5), f: 'pd' }] },
  3: { grow: [1.05, 1.07], addBehind: [{ pts: evoSpike(xs[0], y, -95, 12, 6), f: 'pd' }, { pts: evoSpike(xs[1], y, -100, 11, 6), f: 'pd' }, { pts: evoSpike(xs[2], y, -90, 10, 5), f: 'pd' }], add: xs.map((x) => C(x - 4, y + 6, 1.6, 'a', { ns: true, cl: true, op: 0.85 })) },
});

export const MY_BODIES = [
  myBody({
    id: 'segmented', name: 'Segmented', kind: 'pede.segmented', tags: ['centipede'], dom: 0.5, w: 3,
    pts: [[-36, -2], [-34, -9, 0.5], ...mySegTop(-34, 34, 7, -13, -9), [34, -9, 0.5], [36, -2], [34, 6], [20, 10], [0, 11], [-20, 10], [-34, 6]],
    shade: torsoShade(-36, 36, -13, 11, { shadeFrac: 0.35 }),
    extra: [myBelly(4), mySegLines(-34, 34, 7, -11, 9), HL('M-30,-8 C-20,-12 -6,-13 6,-12 C-6,-10 -18,-8 -26,-4 Z', 0.18)],
    sockets: mySockets({}), stages: myBodyStages([-14, 6, 24], -12),
  }),
  myBody({
    id: 'armored', name: 'Armoured', kind: 'pede.armored', tags: ['millipede'], dom: 0.55, w: 2,
    pts: [[-36, -2], [-34, -8, 0.5], ...mySegTop(-34, 34, 9, -14, -7), [34, -8, 0.5], [36, -2], [34, 7], [20, 11], [0, 12], [-20, 11], [-34, 7]],
    shade: torsoShade(-36, 36, -14, 12, { shadeFrac: 0.35 }),
    extra: [myBelly(5), mySegLines(-34, 34, 9, -12, 10), HL('M-30,-8 C-20,-13 -6,-14 4,-13 C-6,-11 -18,-8 -26,-4 Z', 0.18)],
    sockets: mySockets({ plates: { x: 0, y: -13, a: 0, s: 1 }, bristles: { x: -8, y: -12, a: 0, s: 1 } }), stages: myBodyStages([-12, 4, 20], -13),
  }),
  myBody({
    id: 'flat', name: 'Flat', kind: 'pede.flat', tags: ['house'], dom: 0.5, w: 2,
    pts: [[-40, -1], [-38, -6, 0.5], ...mySegTop(-38, 38, 6, -9, -6), [38, -6, 0.5], [40, -1], [38, 5], [20, 8], [0, 8], [-20, 8], [-38, 5]],
    shade: torsoShade(-40, 40, -9, 8, { shadeFrac: 0.35 }),
    extra: [myBelly(3), mySegLines(-38, 38, 6, -8, 7), HL('M-34,-5 C-24,-9 -8,-9 4,-8 C-8,-7 -20,-5 -30,-2 Z', 0.18)],
    sockets: mySockets({ head: { x: 38, y: -3, a: -4, s: 1 }, tail: { x: -40, y: 0, a: 0, s: 1 }, leg1: { x: 26, y: 6, a: 0 }, leg2: { x: 2, y: 7, a: 0 }, leg3: { x: -22, y: 6, a: 0 }, leg1Far: { x: 18, y: 4, a: 0, s: 0.92 }, leg2Far: { x: -6, y: 5, a: 0, s: 0.92 }, leg3Far: { x: -30, y: 4, a: 0, s: 0.92 }, plates: { x: 0, y: -8, a: 0, s: 1 }, bristles: { x: -10, y: -7, a: 0, s: 1 } }),
    stages: myBodyStages([-16, 6, 26], -8),
  }),
  myBody({
    id: 'bulbous', name: 'Bulbous', kind: 'pede.bulbous', tags: ['grub'], dom: 0.55, w: 2,
    pts: [[-32, 0], [-30, -9, 0.5], ...mySegTop(-30, 30, 5, -16, -10), [30, -9, 0.5], [32, 0], [30, 8], [16, 13], [0, 14], [-16, 13], [-30, 8]],
    shade: torsoShade(-32, 32, -16, 14, { shadeFrac: 0.35 }),
    extra: [myBelly(5), mySegLines(-30, 30, 5, -14, 12), HL('M-26,-9 C-18,-15 -6,-16 4,-15 C-6,-12 -14,-9 -22,-4 Z', 0.18)],
    sockets: mySockets({ head: { x: 30, y: -5, a: -8, s: 1 }, tail: { x: -32, y: 2, a: 0, s: 1 }, leg1: { x: 20, y: 10, a: 0 }, leg2: { x: 0, y: 12, a: 0 }, leg3: { x: -18, y: 10, a: 0 }, leg1Far: { x: 12, y: 8, a: 0, s: 0.92 }, leg2Far: { x: -8, y: 9, a: 0, s: 0.92 }, leg3Far: { x: -26, y: 7, a: 0, s: 0.92 }, plates: { x: 0, y: -15, a: 0, s: 1 }, bristles: { x: -8, y: -14, a: 0, s: 1 } }),
    stages: myBodyStages([-12, 6, 22], -15),
  }),
  myBody({
    id: 'long', name: 'Long', kind: 'pede.long', tags: ['long'], dom: 0.5, w: 2,
    pts: [[-44, -1], [-42, -6, 0.5], ...mySegTop(-42, 42, 9, -10, -7), [42, -6, 0.5], [44, -1], [42, 5], [22, 8], [0, 9], [-22, 8], [-42, 5]],
    shade: torsoShade(-44, 44, -10, 9, { shadeFrac: 0.35 }),
    extra: [myBelly(3), mySegLines(-42, 42, 9, -9, 7), HL('M-38,-5 C-28,-10 -10,-10 2,-9 C-10,-7 -22,-5 -34,-2 Z', 0.18)],
    sockets: mySockets({ head: { x: 42, y: -3, a: -4, s: 1 }, tail: { x: -44, y: 0, a: 0, s: 1 }, leg1: { x: 28, y: 6, a: 0 }, leg2: { x: 2, y: 8, a: 0 }, leg3: { x: -24, y: 6, a: 0 }, leg1Far: { x: 20, y: 4, a: 0, s: 0.92 }, leg2Far: { x: -6, y: 6, a: 0, s: 0.92 }, leg3Far: { x: -32, y: 4, a: 0, s: 0.92 }, plates: { x: 0, y: -9, a: 0, s: 1 }, bristles: { x: -12, y: -8, a: 0, s: 1 } }),
    stages: myBodyStages([-20, 4, 28], -9),
  }),
  myBody({
    id: 'spiky', name: 'Spiky', kind: 'pede.spiky', tags: ['spines'], dom: 0.5, w: 2,
    pts: [[-36, -2], [-34, -8, 0.5], [-30, -14, 'c'], [-26, -8, 0.5], [-20, -15, 'c'], [-14, -8, 0.5], [-8, -16, 'c'], [-2, -8, 0.5], [4, -16, 'c'], [10, -8, 0.5], [16, -15, 'c'], [22, -8, 0.5], [28, -14, 'c'], [34, -8, 0.5], [36, -2], [34, 6], [20, 10], [0, 11], [-20, 10], [-34, 6]],
    shade: torsoShade(-36, 36, -16, 11, { shadeFrac: 0.35 }),
    extra: [myBelly(4), mySegLines(-34, 34, 6, -8, 9), HL('M-30,-8 C-22,-12 -10,-13 2,-12 C-10,-10 -20,-8 -26,-4 Z', 0.18)],
    sockets: mySockets({ plates: { x: 0, y: -10, a: 0, s: 1 }, bristles: { x: -8, y: -9, a: 0, s: 1 } }), stages: myBodyStages([-14, 6, 24], -11),
  }),
  myBody({
    id: 'coiled', name: 'Coiled', kind: 'pede.coiled', tags: ['curve'], dom: 0.5, w: 2,
    pts: tube([[-36, 4], [-22, -6], [-6, 4], [10, -6], [26, 2], [36, -2]], 18, 15, { tipK: 0.6 }),
    shade: torsoShade(-36, 36, -14, 12, { shadeFrac: 0.35 }),
    extra: [myBelly(5), L('M-30,-4 L-28,10 M-22,-14 L-18,4 M-14,-8 L-12,12 M-6,-6 L-4,12 M2,-12 L4,6 M10,-14 L12,4 M18,-8 L18,10 M26,-6 L26,10', 'k', 1.2, { op: 0.3 }), HL('M-32,-2 C-28,-10 -18,-14 -10,-10 C-18,-8 -24,-4 -28,2 Z', 0.18)],
    sockets: mySockets({ head: { x: 36, y: -4, a: -12, s: 1 }, tail: { x: -36, y: 4, a: 4, s: 1 }, leg1: { x: 24, y: 8, a: 0 }, leg2: { x: -4, y: 10, a: 0 }, leg3: { x: -22, y: 2, a: 0 }, leg1Far: { x: 16, y: 4, a: 0, s: 0.92 }, leg2Far: { x: -12, y: 8, a: 0, s: 0.92 }, leg3Far: { x: -30, y: 4, a: 0, s: 0.92 }, plates: { x: -22, y: -14, a: 0, s: 1 }, bristles: { x: 10, y: -14, a: 0, s: 1 } }),
    stages: myBodyStages([-22, 10, 28], -13),
  }),
];
