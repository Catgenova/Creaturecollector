// Wyrm bodies (coils). Origin = centre. Sockets: head (the front end, up and forward), tail (the back end),
// leg / legFar (front pair) and legBack / legBackFar (hind pair) on the belly, mane and plates on the spine.
// kinds: 'wyrm.low' (serpents), 'wyrm.rear' (rearing), 'wyrm.arch' (humped), 'wyrm.coil' (looped),
// 'wyrm.float' (cloud riders), 'wyrm.stout' (lindworms).
// Evolutions: stage 2 thickens and raises a dorsal fin; stage 3 raises a second and rings the flank.
import { wyBody, torsoShade } from './_shared.js';
import { L, HL, PATCH, tube } from '../_dsl.js';
import { evoFan, evoRing } from '../_evo.js';

const wyBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [evoFan(x2, y2, -130, -50, 3, 6, 16, { tip: 0.5 })] },
  3: { grow: [1.06, 1.07], addBehind: [evoFan(x3, y3, -140, -40, 4, 6, 18, { tip: 0.5 })], add: [evoRing(0, 2, 6, 'a', 1.2, { op: 0.45 })] },
});
const wySockets = (o) => ({ head: { x: 30, y: -6, a: -20, s: 1 }, tail: { x: -32, y: 10, a: 0, s: 1 }, leg: { x: 14, y: 16, a: 0 }, legFar: { x: 8, y: 14, a: 0 }, legBack: { x: -14, y: 20, a: 0 }, legBackFar: { x: -20, y: 18, a: 0 }, mane: { x: 0, y: -2, a: 0 }, plates: { x: 0, y: 0, a: 0 }, ...o });

export const WY_BODIES = [
  wyBody({
    id: 'serpent', name: 'Serpent', kind: 'wyrm.low', tags: ['low', 'long'], dom: 0.5, w: 3,
    pts: tube([[-32, 10], [-18, 14], [-4, 6], [10, 10], [22, 2], [30, -6]], 11, 16, { tipK: 1 }),
    shade: torsoShade(-32, 30, -12, 22, { shadeFrac: 0.35 }),
    extra: [HL('M-30,6 C-24,2 -18,4 -14,8 C-18,8 -24,8 -28,10 Z', 0.2), L('M-26,16 C-16,20 -6,12 8,16 C16,10 22,6 28,0', 'k', 1, { op: 0.16 })],
    sockets: wySockets({}), stages: wyBodyStages(-4, -2, 12, 2),
  }),
  wyBody({
    id: 'rearing', name: 'Rearing', kind: 'wyrm.rear', tags: ['tall', 'rearing'], dom: 0.5, w: 2,
    pts: tube([[-30, 18], [-14, 16], [-2, 6], [0, -8], [8, -20], [20, -30]], 11, 16, { tipK: 1 }),
    shade: torsoShade(-32, 24, -32, 24, { shadeFrac: 0.35 }),
    extra: [HL('M-8,-4 C-6,-12 -2,-18 4,-24 C2,-16 -2,-10 -4,-2 Z', 0.2), L('M-26,22 C-16,22 -6,16 4,6 C8,-4 12,-14 18,-22', 'k', 1, { op: 0.16 })],
    sockets: wySockets({ head: { x: 20, y: -30, a: -15, s: 1 }, tail: { x: -30, y: 18, a: 0, s: 1 }, leg: { x: 9, y: -8, a: 0 }, legFar: { x: 4, y: -10, a: 0 }, legBack: { x: -8, y: 22, a: 0 }, legBackFar: { x: -14, y: 20, a: 0 }, mane: { x: -6, y: -8, a: 0 }, plates: { x: -4, y: -6, a: 0 } }),
    stages: wyBodyStages(-8, -10, -20, 12),
  }),
  wyBody({
    id: 'arch', name: 'Arch', kind: 'wyrm.arch', tags: ['humped'], dom: 0.5, w: 2,
    pts: tube([[-32, 14], [-20, -2], [-4, -14], [12, -8], [24, 2], [32, -4]], 11, 16, { tipK: 1 }),
    shade: torsoShade(-32, 32, -22, 20, { shadeFrac: 0.35 }),
    extra: [HL('M-22,-2 C-18,-10 -10,-16 -2,-18 C-8,-14 -14,-10 -18,-2 Z', 0.2), L('M-28,18 C-20,8 -12,-2 -2,-6 C8,-2 16,6 24,8', 'k', 1, { op: 0.16 })],
    sockets: wySockets({ head: { x: 32, y: -4, a: -25, s: 1 }, tail: { x: -32, y: 14, a: 0, s: 1 }, leg: { x: 16, y: 6, a: 0 }, legFar: { x: 10, y: 2, a: 0 }, legBack: { x: -18, y: 8, a: 0 }, legBackFar: { x: -24, y: 6, a: 0 }, mane: { x: -6, y: -20, a: 0 }, plates: { x: -4, y: -18, a: 0 } }),
    stages: wyBodyStages(-6, -20, 14, -12),
  }),
  wyBody({
    id: 'coil', name: 'Coil', kind: 'wyrm.coil', tags: ['looped'], dom: 0.5, w: 2,
    shapes: [{ pts: tube([[-4, 12], [-18, 8], [-20, -6], [-8, -14], [6, -10]], 9, 11, { tipK: 1 }), f: 'pd' }, tube([[-30, 18], [-12, 18], [4, 12], [16, 2], [28, -8]], 11, 16, { tipK: 1 })],
    shade: torsoShade(-32, 30, -18, 26, { shadeFrac: 0.35 }),
    extra: [HL('M-18,-4 C-16,-10 -10,-14 -4,-14 C-8,-10 -12,-8 -14,-2 Z', 0.2), L('M-26,22 C-14,24 -2,20 10,12 C16,6 20,0 26,-4', 'k', 1, { op: 0.16 })],
    sockets: wySockets({ head: { x: 28, y: -8, a: -20, s: 1 }, tail: { x: -30, y: 18, a: 0, s: 1 }, leg: { x: 16, y: 10, a: 0 }, legFar: { x: 10, y: 10, a: 0 }, legBack: { x: -10, y: 25, a: 0 }, legBackFar: { x: -16, y: 24, a: 0 }, mane: { x: -8, y: -16, a: 0 }, plates: { x: 0, y: 4, a: 0 } }),
    stages: wyBodyStages(-8, -16, 14, 0),
  }),
  wyBody({
    id: 'knot', name: 'Knot', kind: 'wyrm.coil', tags: ['knotted'], dom: 0.5, w: 2,
    shapes: [{ pts: tube([[-16, 6], [-26, -6], [-16, -18], [-4, -10]], 8, 9, { tipK: 1 }), f: 'pd' }, { pts: tube([[6, 4], [20, -8], [12, -20], [0, -10]], 8, 9, { tipK: 1 }), f: 'pd' }, tube([[-30, 20], [-12, 16], [8, 16], [22, 6], [30, -4]], 11, 16, { tipK: 1 })],
    shade: torsoShade(-32, 32, -22, 26, { shadeFrac: 0.35 }),
    extra: [HL('M-24,-4 C-22,-12 -16,-16 -10,-16 C-14,-12 -18,-8 -20,-2 Z', 0.2), L('M-26,24 C-14,22 4,22 16,14 C20,8 24,2 28,-2', 'k', 1, { op: 0.16 })],
    sockets: wySockets({ head: { x: 30, y: -4, a: -25, s: 1 }, tail: { x: -30, y: 20, a: 0, s: 1 }, leg: { x: 18, y: 12, a: 0 }, legFar: { x: 12, y: 14, a: 0 }, legBack: { x: -12, y: 22, a: 0 }, legBackFar: { x: -18, y: 22, a: 0 }, mane: { x: -2, y: -4, a: 0 }, plates: { x: 0, y: 6, a: 0 } }),
    stages: wyBodyStages(-2, 8, 14, 8),
  }),
  wyBody({
    id: 'hover', name: 'Cloud rider', kind: 'wyrm.float', tags: ['floating'], dom: 0.5, w: 2, hover: 6,
    pts: tube([[-34, 6], [-20, -4], [-6, 6], [8, -4], [22, 4], [32, -4]], 11, 15, { tipK: 1 }),
    shade: torsoShade(-34, 32, -12, 14, { shadeFrac: 0.35 }),
    extra: [HL('M-30,2 C-26,-4 -20,-8 -14,-6 C-20,-4 -24,-2 -28,4 Z', 0.2), L('M-30,10 C-20,2 -10,10 0,2 C10,-4 20,8 28,2', 'k', 1, { op: 0.16 })],
    sockets: wySockets({ head: { x: 32, y: -4, a: -15, s: 1 }, tail: { x: -34, y: 6, a: 0, s: 1 }, leg: { x: 12, y: 3, a: 0 }, legFar: { x: 6, y: 4, a: 0 }, legBack: { x: -16, y: 3, a: 0 }, legBackFar: { x: -22, y: 2, a: 0 }, mane: { x: -6, y: -10, a: 0 }, plates: { x: -4, y: -8, a: 0 } }),
    stages: wyBodyStages(-6, -10, 10, -10),
  }),
  wyBody({
    id: 'stout', name: 'Lindworm', kind: 'wyrm.stout', tags: ['thick', 'low'], dom: 0.55, w: 2,
    pts: [[-30, -4], [-22, -14], [-6, -18], [12, -16], [24, -10], [30, -2], [30, 8], [24, 16], [6, 20], [-14, 20], [-28, 14], [-32, 6]],
    shade: torsoShade(-32, 30, -18, 20, { shadeFrac: 0.35 }),
    extra: [PATCH('M-26,10 C-14,18 8,20 24,12 L26,16 C8,24 -14,22 -28,14 Z', 's'), HL('M-24,-8 C-18,-14 -8,-16 0,-16 C-8,-13 -16,-10 -20,-4 Z', 0.2)],
    sockets: wySockets({ head: { x: 28, y: -10, a: -10, s: 1 }, tail: { x: -31, y: 2, a: 0, s: 1 }, leg: { x: 18, y: 18, a: 0 }, legFar: { x: 12, y: 18, a: 0 }, legBack: { x: -16, y: 20, a: 0 }, legBackFar: { x: -22, y: 18, a: 0 }, mane: { x: -4, y: -18, a: 0 }, plates: { x: -2, y: -16, a: 0 } }),
    stages: wyBodyStages(-6, -18, 14, -16),
  }),
];
