// Draconic bodies. Origin = centre. Sockets: head (front, up), tail (back), shoulder / shoulderFar and hip / hipFar
// on the belly line, wing / wingFar on the back, spines along the spine.
// kinds: 'dragon.drake' (lean), 'dragon.brute' (heavy), 'dragon.wyvern' (chest-up), 'dragon.long', 'dragon.pudgy',
// 'dragon.armour', 'dragon.sleek'.
// Evolutions: stage 2 thickens and raises a shoulder fan; stage 3 raises a second on the hip and rings the flank.
import { drBody, torsoShade } from './_shared.js';
import { L, HL, PATCH } from '../_dsl.js';
import { evoFan, evoRing } from '../_evo.js';

const drBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -130, -60, 3, 6, 15, { tip: 0.5 })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, -125, -55, 3, 6, 16, { tip: 0.5 })], add: [evoRing(4, 0, 6, 'a', 1.2, { op: 0.45 })] },
});
const drSockets = (o) => ({ head: { x: 26, y: -14, a: -15, s: 1 }, tail: { x: -30, y: 2, a: 0, s: 1 }, shoulder: { x: 18, y: 8, a: 0 }, shoulderFar: { x: 10, y: 6, a: 0 }, hip: { x: -18, y: 8, a: 0 }, hipFar: { x: -24, y: 6, a: 0 }, wing: { x: -2, y: -14, a: 0 }, wingFar: { x: -8, y: -14, a: 0 }, spines: { x: -2, y: -16, a: 0 }, ...o });

export const DR_BODIES = [
  drBody({
    id: 'drake', name: 'Drake', kind: 'dragon.drake', tags: ['lean'], dom: 0.5, w: 3,
    pts: [[-30, -6], [-22, -14], [-6, -18], [12, -16], [26, -10], [32, -2], [28, 8], [16, 14], [-4, 16], [-22, 12], [-32, 4]],
    shade: torsoShade(-32, 32, -18, 16, { shadeFrac: 0.35 }),
    extra: [HL('M-24,-8 C-18,-14 -8,-16 0,-16 C-8,-13 -16,-10 -20,-4 Z', 0.2)],
    sockets: drSockets({}), stages: drBodyStages(12, -16, -18, -14),
  }),
  drBody({
    id: 'brute', name: 'Brute', kind: 'dragon.brute', tags: ['heavy'], dom: 0.55, w: 2,
    pts: [[-30, -4], [-24, -16], [-8, -24], [14, -22], [30, -12], [34, 0], [30, 12], [14, 18], [-8, 18], [-26, 12], [-34, 4]],
    shade: torsoShade(-34, 34, -24, 18, { shadeFrac: 0.35 }),
    extra: [HL('M-24,-10 C-18,-18 -8,-22 2,-22 C-6,-18 -14,-14 -20,-6 Z', 0.2), PATCH('M-26,8 C-10,18 12,18 28,8 L30,12 C12,22 -10,22 -28,12 Z', 's')],
    sockets: drSockets({ head: { x: 26, y: -18, a: -10, s: 1 }, tail: { x: -32, y: 4, a: 0, s: 1 }, shoulder: { x: 20, y: 12, a: 0 }, shoulderFar: { x: 12, y: 10, a: 0 }, hip: { x: -18, y: 12, a: 0 }, hipFar: { x: -24, y: 10, a: 0 }, wing: { x: -2, y: -20, a: 0 }, wingFar: { x: -8, y: -20, a: 0 }, spines: { x: -2, y: -22, a: 0 } }),
    stages: drBodyStages(14, -22, -20, -18),
  }),
  drBody({
    id: 'wyvern', name: 'Wyvern', kind: 'dragon.wyvern', tags: ['upright'], dom: 0.5, w: 2,
    pts: [[-26, -2], [-18, -14], [-2, -20], [14, -16], [24, -6], [26, 4], [18, 12], [2, 14], [-14, 10], [-26, 6]],
    shade: torsoShade(-26, 26, -20, 14, { shadeFrac: 0.35 }),
    extra: [HL('M-18,-8 C-14,-15 -6,-18 2,-18 C-6,-15 -12,-12 -16,-4 Z', 0.2)],
    sockets: drSockets({ head: { x: 20, y: -14, a: -25, s: 1 }, tail: { x: -24, y: 2, a: 0, s: 1 }, shoulder: { x: 14, y: 8, a: 0 }, shoulderFar: { x: 8, y: 6, a: 0 }, hip: { x: -12, y: 8, a: 0 }, hipFar: { x: -18, y: 6, a: 0 }, wing: { x: -2, y: -16, a: 0 }, wingFar: { x: -8, y: -16, a: 0 }, spines: { x: -2, y: -18, a: 0 } }),
    stages: drBodyStages(10, -18, -16, -12),
  }),
  drBody({
    id: 'long', name: 'Longback', kind: 'dragon.long', tags: ['long'], dom: 0.5, w: 2,
    pts: [[-36, -4], [-28, -12], [-8, -16], [14, -14], [32, -8], [38, 0], [34, 8], [18, 12], [-6, 14], [-28, 10], [-38, 4]],
    shade: torsoShade(-38, 38, -16, 14, { shadeFrac: 0.35 }),
    extra: [HL('M-30,-6 C-24,-12 -14,-14 -4,-14 C-12,-11 -20,-9 -26,-2 Z', 0.2)],
    sockets: drSockets({ head: { x: 32, y: -10, a: -15, s: 1 }, tail: { x: -36, y: 0, a: 0, s: 1 }, shoulder: { x: 24, y: 8, a: 0 }, shoulderFar: { x: 16, y: 6, a: 0 }, hip: { x: -22, y: 8, a: 0 }, hipFar: { x: -28, y: 6, a: 0 }, wing: { x: -4, y: -12, a: 0 }, wingFar: { x: -10, y: -12, a: 0 }, spines: { x: -4, y: -14, a: 0 } }),
    stages: drBodyStages(16, -14, -22, -12),
  }),
  drBody({
    id: 'pudgy', name: 'Pudgy', kind: 'dragon.pudgy', tags: ['round'], dom: 0.5, w: 2,
    pts: [[-26, 0], [-20, -14], [-4, -22], [14, -20], [26, -8], [28, 6], [20, 16], [0, 20], [-18, 16], [-28, 8]],
    shade: torsoShade(-28, 28, -22, 20, { shadeFrac: 0.35 }),
    extra: [HL('M-18,-8 C-14,-16 -6,-20 2,-20 C-6,-16 -12,-12 -16,-4 Z', 0.2), PATCH('M-20,10 C-8,20 10,20 22,10 L24,14 C10,24 -8,24 -22,14 Z', 's')],
    sockets: drSockets({ head: { x: 20, y: -18, a: -10, s: 1 }, tail: { x: -26, y: 4, a: 0, s: 1 }, shoulder: { x: 16, y: 12, a: 0 }, shoulderFar: { x: 8, y: 12, a: 0 }, hip: { x: -14, y: 14, a: 0 }, hipFar: { x: -20, y: 12, a: 0 }, wing: { x: -2, y: -18, a: 0 }, wingFar: { x: -8, y: -18, a: 0 }, spines: { x: -2, y: -20, a: 0 } }),
    stages: drBodyStages(10, -20, -16, -16),
  }),
  drBody({
    id: 'armour', name: 'Armoured', kind: 'dragon.armour', tags: ['plated'], dom: 0.55, w: 2,
    pts: [[-32, -4], [-24, -14], [-10, -20], [10, -20], [26, -14], [34, -4], [32, 8], [18, 14], [-6, 16], [-24, 12], [-34, 4]],
    shade: torsoShade(-34, 34, -20, 16, { shadeFrac: 0.35 }),
    extra: [L('M-22,-12 L-18,10 M-8,-18 L-6,14 M8,-18 L8,14 M22,-12 L20,12', 'k', 1.2, { op: 0.22 }), HL('M-26,-6 C-20,-14 -12,-18 -4,-18 C-12,-15 -18,-11 -22,-2 Z', 0.2)],
    sockets: drSockets({ head: { x: 26, y: -16, a: -12, s: 1 }, tail: { x: -32, y: 2, a: 0, s: 1 }, shoulder: { x: 18, y: 10, a: 0 }, shoulderFar: { x: 10, y: 8, a: 0 }, hip: { x: -18, y: 10, a: 0 }, hipFar: { x: -24, y: 8, a: 0 }, wing: { x: -2, y: -16, a: 0 }, wingFar: { x: -8, y: -16, a: 0 }, spines: { x: -2, y: -18, a: 0 } }),
    stages: drBodyStages(12, -18, -18, -16),
  }),
  drBody({
    id: 'sleek', name: 'Serpentine', kind: 'dragon.sleek', tags: ['low', 'long'], dom: 0.5, w: 2,
    pts: [[-34, 0], [-26, -8], [-8, -12], [14, -12], [30, -6], [36, 2], [32, 10], [16, 14], [-6, 14], [-28, 10], [-36, 6]],
    shade: torsoShade(-36, 36, -12, 14, { shadeFrac: 0.35 }),
    extra: [HL('M-28,-2 C-22,-8 -14,-10 -6,-10 C-14,-8 -20,-6 -24,0 Z', 0.2)],
    sockets: drSockets({ head: { x: 30, y: -8, a: -20, s: 1 }, tail: { x: -34, y: 4, a: 0, s: 1 }, shoulder: { x: 24, y: 10, a: 0 }, shoulderFar: { x: 16, y: 8, a: 0 }, hip: { x: -24, y: 10, a: 0 }, hipFar: { x: -30, y: 8, a: 0 }, wing: { x: -4, y: -8, a: 0 }, wingFar: { x: -10, y: -8, a: 0 }, spines: { x: -4, y: -10, a: 0 } }),
    stages: drBodyStages(14, -12, -22, -8),
  }),
];
