// Ooze pseudopods (origin = the pod socket on the body's side, reaching forward and out like arms) and
// bases (origin = the bottom centre; the puddle the blob sits in, whose lowest point is the ground).
// Evolutions: pseudopods swell and ring; puddles spread and bubble.
import { ozLeg } from './_shared.js';
import { L, C, HL, tube, leaf, puff, arcPts, xfPts } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const ozPodStages = (x, y) => ({
  2: { grow: [1.08, 1.08] },
  3: { grow: [1.1, 1.1], add: [evoRing(x, y, 3.2, 'a', 1, { op: 0.55 }), C(x + 6, y - 1, 1.4, 'a', { ns: true, op: 0.8 })] },
});
const ozBaseStages = {
  2: { grow: [1.1, 1.05] },
  3: { grow: [1.14, 1.08], add: [C(-10, -1, 1.7, 'a', { ns: true, op: 0.8 }), C(14, -2, 1.3, 'a', { ns: true, op: 0.8 }), C(4, -3, 1, 'a', { ns: true, op: 0.7 })] },
};
const ozOval = (cx, cy, rx, ry, f = 'pd') => ({ pts: arcPts(cx, cy, rx, ry, 0, 337.5, 16), f });

export const OZ_PSEUDOPODS = [
  ozLeg({ id: 'stubs', slot: 'pseudopods', name: 'Stub arm', tags: ['stub'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [10, 2], [16, 6]], 10, 6, { tipK: 1 })], extra: [C(13, 5, 1.2, 'w', { ns: true, op: 0.6 })], stages: ozPodStages(8, 1) }),
  ozLeg({ id: 'reach', slot: 'pseudopods', name: 'Long reach', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [12, -2], [24, -6], [32, -4]], 8, 4, { tipK: 1 })], extra: [L('M4,-2 C12,-4 20,-7 28,-6', 'k', 1, { op: 0.25 })], stages: ozPodStages(10, -2) }),
  ozLeg({ id: 'club', slot: 'pseudopods', name: 'Club', tags: ['heavy'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [10, 2], [18, 4]], 8, 5, { tipK: 1 }), { pts: arcPts(23, 5, 7, 6.5, 0, 337.5, 16), f: 'p' }], extra: [C(20, 2, 1.4, 'w', { ns: true, op: 0.6 })], stages: ozPodStages(8, 1) }),
  ozLeg({ id: 'fork', slot: 'pseudopods', name: 'Forked', tags: ['fork'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [10, 0], [18, -6]], 7, 3, { tipK: 1 }), tube([[6, 1], [14, 5], [22, 8]], 6, 3, { tipK: 1 })], stages: ozPodStages(6, 0) }),
  ozLeg({ id: 'fist', slot: 'pseudopods', name: 'Fist', tags: ['fist'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [8, 2], [14, 4]], 8, 6, { tipK: 1 }), { pts: puff(19, 5, 6.5, 6, 1.2), f: 'p' }], extra: [L('M16,3 L22,2 M16,6 L23,6', 'k', 1, { op: 0.3 })], stages: ozPodStages(7, 1) }),
  ozLeg({ id: 'curl', slot: 'pseudopods', name: 'Curl', tags: ['spiral'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [10, -2], [18, -8], [20, -16]], 7, 3, { tipK: 1 })], extra: [L(spiralPath(20, -21, 4.5, 1.5), 'p', 2.6)], stages: ozPodStages(8, -2) }),
  ozLeg({ id: 'paddle', slot: 'pseudopods', name: 'Paddle', tags: ['flat'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [10, 2]], 8, 7, { tipK: 1 }), { d: leaf([8, 2], [28, 8], 7), f: 'p' }], extra: [L('M10,3 L24,7', 'k', 1, { op: 0.3 })], stages: ozPodStages(6, 1) }),
];

export const OZ_BASES = [
  ozLeg({ id: 'puddle', slot: 'base', name: 'Puddle', tags: ['puddle'], dom: 0.5, w: 3, shapes: [ozOval(0, 2, 30, 6)], extra: [HL('M-22,0 C-16,-3 -8,-4 0,-3 C-8,-1 -16,0 -22,2 Z', 0.2)], stages: ozBaseStages }),
  ozLeg({ id: 'splat', slot: 'base', name: 'Splat', tags: ['splash'], dom: 0.5, w: 2, shapes: [{ pts: xfPts(puff(0, 0, 26, 9, 4), { y: 2, sx: 1, sy: 0.28 }), f: 'pd' }], extra: [C(-34, 0, 2.4, 'pd', { sw: 1 }), C(34, -1, 2, 'pd', { sw: 1 }), C(30, 6, 1.5, 'pd', { sw: 1 })], stages: ozBaseStages }),
  ozLeg({ id: 'ring', slot: 'base', name: 'Slime ring', tags: ['ring'], dom: 0.5, w: 2, shapes: [ozOval(0, 2, 30, 7), ozOval(0, 2, 19, 3.6, 's')], stages: ozBaseStages }),
  ozLeg({ id: 'trail', slot: 'base', name: 'Trail', tags: ['trail'], dom: 0.5, w: 2, shapes: [ozOval(0, 2, 24, 6), { pts: tube([[-20, 2], [-34, 0], [-46, 3]], 6, 2, { tipK: 1 }), f: 'pd' }], extra: [C(-50, 5, 1.6, 'pd', { sw: 1 }), C(-40, 7, 1.2, 'pd', { sw: 1 })], stages: ozBaseStages }),
  ozLeg({ id: 'feet', slot: 'base', name: 'Blob feet', tags: ['feet'], dom: 0.5, w: 2, shapes: [ozOval(-12, 3, 10, 5, 'p'), ozOval(12, 3, 10, 5, 'p')], extra: [L('M-16,7 L-17,9 M-12,7 L-12,9 M-8,7 L-7,9 M8,7 L7,9 M12,7 L12,9 M16,7 L17,9', 'k', 1.2, { op: 0.4 })], stages: ozBaseStages }),
  ozLeg({ id: 'bubbles', slot: 'base', name: 'Bubbling puddle', tags: ['bubble'], dom: 0.5, w: 2, shapes: [ozOval(0, 2, 28, 6)], extra: [C(-16, -2, 2.4, 'pl', { ns: true, op: 0.85 }), C(12, -3, 1.8, 'pl', { ns: true, op: 0.85 }), C(22, 0, 1.4, 'pl', { ns: true, op: 0.85 }), C(-6, -1, 1.2, 'pl', { ns: true, op: 0.85 })], stages: ozBaseStages }),
  ozLeg({ id: 'drops', slot: 'base', name: 'Scattered drops', tags: ['drops'], dom: 0.5, w: 2, shapes: [ozOval(0, 2, 16, 4)], extra: [C(-26, 3, 3, 'pd', { sw: 1 }), C(26, 2, 3.4, 'pd', { sw: 1 }), C(-34, 1, 1.8, 'pd', { sw: 1 }), C(36, 4, 1.6, 'pd', { sw: 1 })], stages: ozBaseStages }),
];
