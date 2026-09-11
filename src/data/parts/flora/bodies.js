// Flora bodies (stems). Origin = centre. Sockets: head (top, where the bloom sits), leaf / leafFar (sides),
// root / rootFar (bottom), vines (rear), pods (front), back (spine, for the canopy behind).
// kinds: 'flora.sprout' (upright stems), 'flora.bulb' (round), 'flora.vine' (low and creeping),
// 'flora.treant' (thick trunks), 'flora.pad' (flat floaters).
// Evolutions: stage 2 thickens the stem and puts out side lobes; stage 3 adds more lobes and rings.
import { flBody, torsoShade } from './_shared.js';
import { L, C, SH, HL, tube } from '../_dsl.js';
import { evoFan, evoRing } from '../_evo.js';

const flBodyStages = (x2, y2, x3, y3, r = 8) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -60, 60, 3, r, r + 12, { tip: 0.5 })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, 150, 250, 3, r, r + 14, { tip: 0.5 })], add: [evoRing(0, 4, 5, 'a', 1.2, { op: 0.45 })] },
});
const flRibs = (xs, y0, y1) => L(xs.map((x) => `M${x},${y0} L${x},${y1}`).join(' '), 'k', 1.2, { op: 0.22 });
// A rearing creeper: the stem lies on the ground at the back, then rises in an S to hold the bloom up front.
const flVineCentre = [[-26, 18], [-12, 14], [2, 4], [2, -8], [10, -20], [22, -28]];

export const FL_BODIES = [
  flBody({
    id: 'sprout', name: 'Stem', kind: 'flora.sprout', tags: ['sprout'], dom: 0.5, w: 3,
    pts: [[-8, -28], [8, -28], [14, -14], [14, 6], [10, 20], [0, 24], [-10, 20], [-14, 6], [-14, -14]],
    shade: torsoShade(-14, 14, -28, 24, { shadeFrac: 0.35 }),
    sockets: { head: { x: 0, y: -28, a: 0, s: 1 }, leaf: { x: 10, y: -6 }, leafFar: { x: -10, y: -8 }, root: { x: 6, y: 20 }, rootFar: { x: -6, y: 18 }, vines: { x: -12, y: 6, a: 0 }, pods: { x: 8, y: 8 }, back: { x: 0, y: -10, a: 0 } },
    stages: flBodyStages(12, -4, -12, 4, 6),
  }),
  flBody({
    id: 'bulb', name: 'Bulb', kind: 'flora.bulb', tags: ['bulb', 'round'], dom: 0.5, w: 2,
    pts: [[0, -26], [14, -20], [24, -6], [24, 10], [16, 22], [0, 26], [-16, 22], [-24, 10], [-24, -6], [-14, -20]],
    shade: torsoShade(-24, 24, -26, 26, { shadeFrac: 0.35 }),
    extra: [L('M-6,-22 C-8,-6 -8,10 -4,22 M6,-22 C8,-6 8,10 4,22', 'k', 1.1, { op: 0.18 })],
    sockets: { head: { x: 0, y: -26, a: 0, s: 1 }, leaf: { x: 18, y: -4 }, leafFar: { x: -18, y: -6 }, root: { x: 8, y: 24 }, rootFar: { x: -8, y: 22 }, vines: { x: -22, y: 6, a: 0 }, pods: { x: 12, y: 10 }, back: { x: 0, y: -6, a: 0 } },
    stages: flBodyStages(22, 0, -22, 2, 8),
  }),
  flBody({
    id: 'vine', name: 'Creeper', kind: 'flora.vine', tags: ['vine', 'long'], dom: 0.5, w: 2,
    pts: tube(flVineCentre, 16, 11, { tipK: 1 }),
    shade: torsoShade(-32, 30, -30, 24, { shadeFrac: 0.4 }),
    extra: [L('M-18,14 C-10,12 -2,8 2,0 M1,-6 C4,-14 9,-20 18,-26', 'k', 1.1, { op: 0.2 })],
    sockets: { head: { x: 22, y: -29, a: -10, s: 1 }, leaf: { x: 9, y: -2 }, leafFar: { x: -5, y: 0 }, root: { x: -4, y: 18 }, rootFar: { x: -18, y: 20 }, vines: { x: -28, y: 14, a: 0 }, pods: { x: 8, y: 8 }, back: { x: -2, y: -6, a: 0 } },
    stages: flBodyStages(12, -10, -26, 6, 6),
  }),
  flBody({
    id: 'treant', name: 'Trunk', kind: 'flora.treant', tags: ['treant', 'tree'], dom: 0.55, w: 2,
    pts: [[-14, -30], [14, -30], [20, -16], [20, 10], [16, 24], [0, 28], [-16, 24], [-20, 10], [-20, -16]],
    shade: torsoShade(-20, 20, -30, 28, { shadeFrac: 0.35 }),
    extra: [flRibs([-10, -2, 8], -24, 20)],
    sockets: { head: { x: 0, y: -30, a: 0, s: 1 }, leaf: { x: 18, y: -14 }, leafFar: { x: -18, y: -16 }, root: { x: 10, y: 26 }, rootFar: { x: -10, y: 24 }, vines: { x: -18, y: 4, a: 0 }, pods: { x: 12, y: 6 }, back: { x: 0, y: -16, a: 0 } },
    stages: flBodyStages(18, -6, -18, 0, 8),
  }),
  flBody({
    id: 'pad', name: 'Lilypad', kind: 'flora.pad', tags: ['pad', 'float'], dom: 0.45, w: 2, hover: 6,
    pts: [[30, 0], [22, 8], [0, 12], [-20, 9], [-30, 0], [-20, -8], [-6, -11, 'c'], [-2, -4, 'c'], [4, -11, 'c'], [20, -8]],
    shade: torsoShade(-30, 30, -12, 12, { shadeFrac: 0.45 }),
    extra: [L('M-2,-4 C-10,0 -18,2 -26,0 M-2,-4 C4,2 12,4 24,2 M-2,-4 C-4,4 -6,8 -10,10', 'k', 1.1, { op: 0.22 })],
    sockets: { head: { x: 4, y: -9, a: 0, s: 1 }, leaf: { x: 18, y: -4 }, leafFar: { x: -14, y: -6 }, root: { x: 6, y: 10 }, rootFar: { x: -8, y: 10 }, vines: { x: -28, y: 2, a: 0 }, pods: { x: 12, y: 3 }, back: { x: -6, y: -10, a: 0 } },
    stages: flBodyStages(26, 2, -26, 2, 6),
  }),
  flBody({
    id: 'cactus', name: 'Barrel', kind: 'flora.sprout', tags: ['cactus', 'spiky'], dom: 0.5, w: 2,
    pts: [[-12, -30], [12, -30], [18, -18], [20, 4], [16, 20], [0, 26], [-16, 20], [-20, 4], [-18, -18]],
    shade: torsoShade(-20, 20, -30, 26, { shadeFrac: 0.35 }),
    extra: [flRibs([-12, -4, 4, 12], -24, 20), L('M-8,-18 L-11,-21 M0,-12 L-2,-16 M8,-16 L11,-19 M-6,0 L-9,-3 M6,4 L9,1 M-10,12 L-13,9 M4,14 L6,10', 'w', 1.2, { op: 0.8 })],
    sockets: { head: { x: 0, y: -30, a: 0, s: 1 }, leaf: { x: 16, y: -8 }, leafFar: { x: -16, y: -10 }, root: { x: 8, y: 22 }, rootFar: { x: -8, y: 20 }, vines: { x: -18, y: 6, a: 0 }, pods: { x: 12, y: 6 }, back: { x: 0, y: -14, a: 0 } },
    stages: flBodyStages(18, -6, -18, 2, 8),
  }),
  flBody({
    id: 'gourd', name: 'Gourd', kind: 'flora.bulb', tags: ['gourd', 'pumpkin'], dom: 0.55, w: 2,
    pts: [[0, -18], [16, -16], [28, -6], [30, 8], [22, 20], [0, 24], [-22, 20], [-30, 8], [-28, -6], [-16, -16]],
    shade: torsoShade(-30, 30, -18, 24, { shadeFrac: 0.35 }),
    extra: [L('M-12,-14 C-16,0 -16,10 -12,20 M0,-18 C-2,0 -2,10 0,24 M12,-14 C16,0 16,10 12,20', 'k', 1.2, { op: 0.2 })],
    sockets: { head: { x: 0, y: -18, a: 0, s: 1 }, leaf: { x: 22, y: -4 }, leafFar: { x: -22, y: -6 }, root: { x: 10, y: 22 }, rootFar: { x: -10, y: 20 }, vines: { x: -28, y: 4, a: 0 }, pods: { x: 14, y: 8 }, back: { x: 0, y: -8, a: 0 } },
    stages: flBodyStages(28, 0, -28, 2, 8),
  }),
];
