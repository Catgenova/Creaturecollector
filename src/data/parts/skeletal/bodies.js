// Skeletal bodies (ribcages). Origin = centre. Sockets: head (front, up), tail (back), shoulder / shoulderFar and
// hip / hipFar on the belly line, wing / wingFar on the spine, back (the shroud), light (inside the ribs).
// kinds: 'bone.hound' (lean), 'bone.heavy' (barrel), 'bone.coil' (a serpent spine), 'bone.keel' (a bird's chest),
// 'bone.fish' (a fish spine), 'bone.wrapped' (a mummy), 'bone.giant'.
// Evolutions: stage 2 thickens and grows spine spurs; stage 3 grows more and rings the heart.
import { skBody, torsoShade } from './_shared.js';
import { L, HL, PATCH } from '../_dsl.js';
import { evoFan, evoRing } from '../_evo.js';

const skBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -125, -55, 3, 5, 13, { tip: 'c' })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, -125, -55, 4, 5, 14, { tip: 'c' })], add: [evoRing(-2, 2, 7, 'a', 1.2, { op: 0.5 })] },
});
const skSockets = (o) => ({ head: { x: 26, y: -12, a: -12, s: 1 }, tail: { x: -30, y: 0, a: 0, s: 1 }, shoulder: { x: 18, y: 8, a: 0 }, shoulderFar: { x: 10, y: 6, a: 0 }, hip: { x: -18, y: 8, a: 0 }, hipFar: { x: -24, y: 6, a: 0 }, wing: { x: -2, y: -14, a: 0 }, wingFar: { x: -8, y: -14, a: 0 }, back: { x: -4, y: -12, a: 0 }, light: { x: 2, y: 1, a: 0, s: 1 }, ...o });
/** Rib gaps: dark lines curving from the spine down through the torso. */
const skRibs = (xs, y0, y1) => L(xs.map((x) => `M${x},${y0} C${x - 2},${(y0 + y1) / 2} ${x - 1},${y1 - 4} ${x + 2},${y1}`).join(' '), 'k', 1.4, { op: 0.35 });

export const SK_BODIES = [
  skBody({
    id: 'ribcage', name: 'Ribcage', kind: 'bone.hound', tags: ['lean'], dom: 0.5, w: 3,
    pts: [[-28, -4], [-20, -14], [-4, -18], [14, -16], [26, -10], [30, -2], [26, 8], [14, 14], [-2, 16], [-18, 12], [-30, 4]],
    shade: torsoShade(-30, 30, -18, 16, { shadeFrac: 0.3 }),
    extra: [skRibs([-18, -8, 2, 12], -10, 12), L('M-26,-6 C-14,-14 6,-18 26,-10', 'k', 1.2, { op: 0.25 }), HL('M-22,-8 C-16,-14 -6,-16 2,-16 C-6,-13 -14,-10 -18,-4 Z', 0.2)],
    sockets: skSockets({}), stages: skBodyStages(12, -16, -18, -14),
  }),
  skBody({
    id: 'barrel', name: 'Barrel', kind: 'bone.heavy', tags: ['heavy'], dom: 0.55, w: 2,
    pts: [[-30, -2], [-24, -16], [-8, -24], [14, -22], [30, -12], [34, 0], [30, 12], [14, 18], [-8, 18], [-26, 12], [-34, 4]],
    shade: torsoShade(-34, 34, -24, 18, { shadeFrac: 0.3 }),
    extra: [skRibs([-22, -12, -2, 8, 18], -16, 14), L('M-28,-4 C-14,-18 8,-24 28,-12', 'k', 1.2, { op: 0.25 }), HL('M-24,-10 C-18,-18 -8,-22 2,-22 C-6,-18 -14,-14 -20,-6 Z', 0.2)],
    sockets: skSockets({ head: { x: 26, y: -16, a: -8, s: 1 }, tail: { x: -32, y: 2, a: 0, s: 1 }, shoulder: { x: 20, y: 12, a: 0 }, shoulderFar: { x: 12, y: 10, a: 0 }, hip: { x: -18, y: 12, a: 0 }, hipFar: { x: -24, y: 10, a: 0 }, wing: { x: -2, y: -20, a: 0 }, wingFar: { x: -8, y: -20, a: 0 }, back: { x: -4, y: -18, a: 0 }, light: { x: 2, y: 0, a: 0, s: 1.1 } }),
    stages: skBodyStages(14, -22, -20, -18),
  }),
  skBody({
    id: 'coil', name: 'Serpent spine', kind: 'bone.coil', tags: ['long', 'low'], dom: 0.5, w: 2,
    pts: [[-34, 8], [-26, -2], [-12, -8], [4, -10], [18, -8], [28, -4], [32, 4], [26, 12], [10, 14], [-8, 12], [-22, 14], [-34, 14]],
    shade: torsoShade(-34, 32, -10, 14, { shadeFrac: 0.3 }),
    extra: [L('M-30,10 L-30,2 M-22,8 L-22,-2 M-14,6 L-14,-6 M-6,6 L-6,-8 M2,6 L2,-8 M10,6 L10,-6 M18,6 L18,-4 M26,8 L26,0', 'k', 1.4, { op: 0.35 }), HL('M-28,0 C-20,-6 -8,-8 2,-8 C-8,-6 -18,-2 -24,4 Z', 0.2)],
    sockets: skSockets({ head: { x: 30, y: -4, a: -18, s: 1 }, tail: { x: -34, y: 10, a: 0, s: 1 }, shoulder: { x: 20, y: 10, a: 0 }, shoulderFar: { x: 12, y: 10, a: 0 }, hip: { x: -16, y: 12, a: 0 }, hipFar: { x: -24, y: 12, a: 0 }, wing: { x: -4, y: -8, a: 0 }, wingFar: { x: -10, y: -8, a: 0 }, back: { x: -6, y: -8, a: 0 }, light: { x: 6, y: 2, a: 0, s: 0.9 } }),
    stages: skBodyStages(10, -10, -20, -6),
  }),
  skBody({
    id: 'keel', name: 'Keel', kind: 'bone.keel', tags: ['bird', 'upright'], dom: 0.5, w: 2,
    pts: [[-24, -4], [-16, -16], [-2, -22], [12, -18], [22, -8], [24, 6], [18, 18], [4, 22], [-12, 16], [-24, 8]],
    shade: torsoShade(-24, 24, -22, 22, { shadeFrac: 0.3 }),
    extra: [L('M-16,-4 C-16,4 -12,10 -6,16 M-8,-10 C-8,0 -4,8 2,16 M2,-14 C2,-4 6,6 10,14 M12,-12 C12,-4 14,2 16,10', 'k', 1.4, { op: 0.35 }), L('M4,-18 L2,20', 'k', 1.6, { op: 0.3 }), HL('M-16,-8 C-12,-15 -6,-19 2,-19 C-6,-16 -12,-12 -14,-4 Z', 0.2)],
    sockets: skSockets({ head: { x: 16, y: -16, a: -20, s: 1 }, tail: { x: -22, y: 6, a: 0, s: 1 }, shoulder: { x: 12, y: 16, a: 0 }, shoulderFar: { x: 4, y: 16, a: 0 }, hip: { x: -10, y: 14, a: 0 }, hipFar: { x: -18, y: 10, a: 0 }, wing: { x: -4, y: -18, a: 0 }, wingFar: { x: -10, y: -16, a: 0 }, back: { x: -8, y: -14, a: 0 }, light: { x: 4, y: -2, a: 0, s: 1 } }),
    stages: skBodyStages(8, -20, -14, -14),
  }),
  skBody({
    id: 'fishbone', name: 'Fish spine', kind: 'bone.fish', tags: ['fish', 'flat'], dom: 0.5, w: 2,
    pts: [[-32, 2], [-22, -10], [-6, -16], [12, -14], [26, -8], [32, 0], [26, 8], [12, 14], [-6, 16], [-22, 12]],
    shade: torsoShade(-32, 32, -16, 16, { shadeFrac: 0.3 }),
    extra: [L('M-30,2 L30,0', 'k', 1.8, { op: 0.35 }), L('M-24,-2 L-20,-10 M-24,4 L-20,12 M-14,-2 L-12,-14 M-14,4 L-12,14 M-4,-2 L-2,-16 M-4,4 L-2,16 M6,-2 L8,-14 M6,4 L8,14 M16,-2 L18,-10 M16,4 L18,12', 'k', 1.3, { op: 0.32 }), HL('M-24,-4 C-18,-10 -8,-14 2,-14 C-8,-11 -16,-8 -20,-2 Z', 0.2)],
    sockets: skSockets({ head: { x: 28, y: -6, a: -10, s: 1 }, tail: { x: -32, y: 2, a: 0, s: 1 }, shoulder: { x: 16, y: 12, a: 0 }, shoulderFar: { x: 8, y: 12, a: 0 }, hip: { x: -16, y: 10, a: 0 }, hipFar: { x: -24, y: 8, a: 0 }, wing: { x: -2, y: -14, a: 0 }, wingFar: { x: -8, y: -14, a: 0 }, back: { x: -6, y: -12, a: 0 }, light: { x: 2, y: 1, a: 0, s: 0.9 } }),
    stages: skBodyStages(12, -14, -18, -10),
  }),
  skBody({
    id: 'wrapped', name: 'Wrapped', kind: 'bone.wrapped', tags: ['mummy'], dom: 0.5, w: 2,
    pts: [[-28, -4], [-20, -14], [-4, -18], [14, -16], [26, -10], [30, -2], [26, 8], [14, 14], [-2, 16], [-18, 12], [-30, 4]],
    shade: torsoShade(-30, 30, -18, 16, { shadeFrac: 0.3 }),
    extra: [PATCH('M-30,-2 C-10,-8 10,-6 30,-4 L30,2 C10,0 -10,-2 -30,4 Z', 's'), PATCH('M-28,8 C-8,4 12,6 28,4 L26,8 C12,10 -8,8 -26,12 Z', 's'), L('M-22,-10 L-16,10 M-6,-16 L-2,14 M12,-14 L14,12', 'k', 1.2, { op: 0.22 }), HL('M-22,-8 C-16,-14 -6,-16 2,-16 C-6,-13 -14,-10 -18,-4 Z', 0.18)],
    sockets: skSockets({}), stages: skBodyStages(12, -16, -18, -14),
  }),
  skBody({
    id: 'giant', name: 'Giant', kind: 'bone.giant', tags: ['huge'], dom: 0.6, w: 2,
    pts: [[-34, -6], [-26, -20], [-8, -28], [16, -26], [32, -14], [38, 0], [34, 14], [16, 22], [-8, 22], [-28, 16], [-38, 4]],
    shade: torsoShade(-38, 38, -28, 22, { shadeFrac: 0.3 }),
    extra: [skRibs([-26, -14, -2, 10, 22], -20, 18), L('M-32,-6 C-16,-22 8,-28 32,-14', 'k', 1.3, { op: 0.25 }), HL('M-28,-12 C-22,-20 -10,-26 2,-26 C-8,-22 -18,-16 -24,-6 Z', 0.2)],
    sockets: skSockets({ head: { x: 30, y: -20, a: -10, s: 1 }, tail: { x: -36, y: 2, a: 0, s: 1 }, shoulder: { x: 22, y: 16, a: 0 }, shoulderFar: { x: 14, y: 14, a: 0 }, hip: { x: -20, y: 16, a: 0 }, hipFar: { x: -28, y: 12, a: 0 }, wing: { x: -4, y: -24, a: 0 }, wingFar: { x: -10, y: -24, a: 0 }, back: { x: -6, y: -22, a: 0 }, light: { x: 2, y: -2, a: 0, s: 1.2 } }),
    stages: skBodyStages(16, -26, -24, -22),
  }),
];
