// Fungus caps (the body slot). Origin = centre of the cap. Sockets: stalk (bottom centre, where the stalk hangs),
// gills and veil (the rim), spores (the top).
// kinds: 'fungus.dome' (buttons), 'fungus.flat' (parasols and funnels), 'fungus.cone' (pointed),
// 'fungus.tall' (morels and bells), 'fungus.ball' (puffballs).
// Evolutions: stage 2 swells and buds a small side cap behind; stage 3 buds another and rings the crown.
import { fgBody, torsoShade } from './_shared.js';
import { L, C, HL } from '../_dsl.js';
import { evoRing } from '../_evo.js';

const fgBud = (x, y, r) => [[x - r, y], [x - r * 0.8, y - r * 0.5], [x - r * 0.4, y - r * 0.9], [x, y - r], [x + r * 0.4, y - r * 0.9], [x + r * 0.8, y - r * 0.5], [x + r, y], [x, y + r * 0.25]];
const fgCapStages = (x2, y2, x3, y3, r = 10) => ({
  2: { grow: [1.06, 1.06], addBehind: [{ pts: fgBud(x2, y2, r), f: 'p' }] },
  3: { grow: [1.06, 1.07], addBehind: [{ pts: fgBud(x3, y3, r + 2), f: 'p' }], add: [evoRing(0, -4, r * 0.8, 'a', 1.2, { op: 0.45 })] },
});
const fgCapSockets = (rim, top, o = {}) => ({ stalk: { x: 0, y: rim - 2, a: 0, s: 1 }, gills: { x: 0, y: rim - 1, a: 0, s: 1 }, veil: { x: 0, y: rim, a: 0, s: 1 }, spores: { x: 0, y: top, a: 0, s: 1 }, ...o });

export const FG_CAPS = [
  fgBody({
    id: 'button', name: 'Button', kind: 'fungus.dome', tags: ['dome'], dom: 0.5, w: 3,
    pts: [[-30, 10], [-30, 2], [-24, -10], [-12, -18], [0, -20], [12, -18], [24, -10], [30, 2], [30, 10], [0, 14]],
    shade: torsoShade(-30, 30, -20, 14, { shadeFrac: 0.35 }),
    extra: [HL('M-22,-6 C-18,-13 -10,-17 -2,-17 C-10,-15 -16,-11 -20,-4 Z', 0.22)],
    sockets: fgCapSockets(12, -20), stages: fgCapStages(26, 4, -28, 2, 9),
  }),
  fgBody({
    id: 'parasol', name: 'Parasol', kind: 'fungus.flat', tags: ['flat', 'wide'], dom: 0.5, w: 2,
    pts: [[-40, 6], [-36, -2], [-24, -8], [-10, -12], [0, -13], [10, -12], [24, -8], [36, -2], [40, 6], [20, 9], [0, 10], [-20, 9]],
    shade: torsoShade(-40, 40, -13, 10, { shadeFrac: 0.35 }),
    extra: [HL('M-30,-2 C-24,-8 -14,-11 -4,-11 C-14,-9 -22,-6 -28,0 Z', 0.22), L('M-26,-4 L-22,6 M-8,-10 L-6,8 M10,-10 L8,8 M26,-4 L22,6', 'k', 1, { op: 0.16 })],
    sockets: fgCapSockets(8, -13), stages: fgCapStages(34, 2, -36, 0, 8),
  }),
  fgBody({
    id: 'cone', name: 'Cone', kind: 'fungus.cone', tags: ['pointed'], dom: 0.5, w: 2,
    pts: [[-26, 12], [-22, 0], [-14, -14], [-6, -26], [0, -34], [6, -26], [14, -14], [22, 0], [26, 12], [0, 15]],
    shade: torsoShade(-26, 26, -34, 15, { shadeFrac: 0.35 }),
    extra: [HL('M-14,-6 C-11,-14 -7,-22 -2,-30 C-4,-22 -7,-14 -10,-4 Z', 0.22)],
    sockets: fgCapSockets(13, -34), stages: fgCapStages(22, 6, -24, 4, 8),
  }),
  fgBody({
    id: 'morel', name: 'Morel', kind: 'fungus.tall', tags: ['tall', 'honeycomb'], dom: 0.5, w: 2,
    pts: [[-18, 14], [-22, 0], [-18, -16], [-10, -28], [0, -32], [10, -28], [18, -16], [22, 0], [18, 14], [0, 17]],
    shade: torsoShade(-22, 22, -32, 17, { shadeFrac: 0.35 }),
    extra: [L('M-14,-16 L-6,-22 L4,-18 L12,-22 M-16,-4 L-6,-8 L2,-2 L10,-8 L16,-2 M-14,8 L-4,4 L4,10 L12,4', 'k', 1.2, { op: 0.3 }), C(-8, -14, 1.6, 'k', { ns: true, op: 0.2 }), C(6, -12, 1.6, 'k', { ns: true, op: 0.2 }), C(-6, 2, 1.6, 'k', { ns: true, op: 0.2 }), C(8, 0, 1.6, 'k', { ns: true, op: 0.2 })],
    sockets: fgCapSockets(15, -32), stages: fgCapStages(18, 8, -20, 6, 8),
  }),
  fgBody({
    id: 'puffball', name: 'Puffball', kind: 'fungus.ball', tags: ['round'], dom: 0.5, w: 2,
    pts: [[-24, 6], [-22, -8], [-14, -20], [0, -24], [14, -20], [22, -8], [24, 6], [16, 16], [0, 20], [-16, 16]],
    shade: torsoShade(-24, 24, -24, 20, { shadeFrac: 0.35 }),
    extra: [HL('M-16,-8 C-13,-15 -7,-20 0,-21 C-7,-18 -12,-13 -14,-4 Z', 0.22), C(-6, 4, 1.4, 'k', { ns: true, op: 0.18 }), C(8, -2, 1.4, 'k', { ns: true, op: 0.18 }), C(2, 12, 1.2, 'k', { ns: true, op: 0.18 })],
    sockets: fgCapSockets(18, -24), stages: fgCapStages(22, 10, -24, 8, 8),
  }),
  fgBody({
    id: 'bell', name: 'Bell', kind: 'fungus.tall', tags: ['tall', 'bell'], dom: 0.5, w: 2,
    pts: [[-22, 14], [-22, -4], [-16, -18], [-8, -26], [0, -28], [8, -26], [16, -18], [22, -4], [22, 14], [12, 17], [0, 18], [-12, 17]],
    shade: torsoShade(-22, 22, -28, 18, { shadeFrac: 0.35 }),
    extra: [HL('M-16,-10 C-13,-18 -8,-23 -2,-25 C-7,-21 -11,-16 -14,-6 Z', 0.22), L('M-8,-22 L-9,12 M6,-23 L8,12', 'k', 1, { op: 0.16 })],
    sockets: fgCapSockets(16, -28), stages: fgCapStages(20, 8, -22, 6, 8),
  }),
  fgBody({
    id: 'funnel', name: 'Funnel', kind: 'fungus.flat', tags: ['flat', 'wavy'], dom: 0.5, w: 2,
    pts: [[-34, 4], [-28, -8, 'c'], [-18, -4], [-10, -12, 'c'], [0, -6], [10, -12, 'c'], [18, -4], [28, -8, 'c'], [34, 4], [20, 8], [0, 10], [-20, 8]],
    shade: torsoShade(-34, 34, -12, 10, { shadeFrac: 0.35 }),
    extra: [HL('M-26,-4 C-22,-8 -14,-8 -8,-6 C-14,-4 -20,-2 -24,2 Z', 0.22), L('M-20,-3 L-16,6 M0,-5 L0,8 M20,-3 L16,6', 'k', 1, { op: 0.16 })],
    sockets: fgCapSockets(8, -8), stages: fgCapStages(30, 2, -32, 0, 8),
  }),
];
