// Flora blooms: the flower that carries the face. Origin = the neck point at the bottom centre.
// Sockets: eye / eyeFar on the disc, mouth low on the disc, thorns behind at the crown, fruit low in front.
// Evolutions: stage 2 puts a second ring of petals behind; stage 3 a third, brighter ring with a glow and ring.
import { flPart } from './_shared.js';
import { P, C, L, S, SH, HL, PATCH, puff, leaf } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';
import { evoGlow, evoRing } from '../_evo.js';

const flBloomSockets = (o = {}) => ({ eye: { x: 6, y: -14, s: 1 }, eyeFar: { x: -5, y: -15, s: 0.9 }, mouth: { x: 2, y: -7, a: 0, s: 1 }, thorns: { x: 0, y: -14, a: 0, s: 1 }, fruit: { x: 9, y: -5, a: 0, s: 1 }, ...o });
const flBloomStages = (cx, cy, r) => ({
  2: { grow: [1.06, 1.06], addBehind: [{ pts: puff(cx, cy, r * 1.15, 9, r * 0.35, { rot: 18 }), f: 'pd' }] },
  3: { grow: [1.06, 1.06], addBehind: [{ pts: puff(cx, cy, r * 1.35, 11, r * 0.4, { rot: 8 }), f: 'a' }], add: [evoGlow(cx, cy, r * 0.7, 0.22), evoRing(cx, cy, r * 0.55, 'a', 1.2, { op: 0.5 })] },
});

export const FL_HEADS = [
  flPart({
    id: 'daisy', slot: 'head', name: 'Daisy', tags: ['daisy'], dom: 0.5, w: 3,
    shapes: [puff(0, -14, 13, 10, 6)],
    extra: [C(0, -14, 8.5, 's', { sw: 1.6 }), HL('M-9,-22 C-5,-26 2,-25 5,-22 C1,-23 -4,-22 -8,-19 Z', 0.2), C(-3, -17, 1, 'w', { ns: true, op: 0.7 })],
    sockets: flBloomSockets(), stages: flBloomStages(0, -14, 13),
  }),
  flPart({
    id: 'tulip', slot: 'head', name: 'Tulip', tags: ['tulip', 'cup'], dom: 0.5, w: 2,
    shapes: [[[-13, -4], [-15, -22], [-7, -16, 'c'], [0, -27, 'c'], [7, -16, 'c'], [15, -22], [13, -4], [0, 1]]],
    extra: [PATCH('M-7,-6 L7,-6 L5,-15 L-5,-15 Z', 's'), HL('M-12,-20 C-10,-24 -8,-22 -7,-18 C-9,-16 -11,-15 -12,-12 Z', 0.22), L('M-7,-16 L-6,-6 M7,-16 L6,-6', 'k', 1, { op: 0.25 })],
    sockets: flBloomSockets({ eye: { x: 5, y: -12, s: 0.95 }, eyeFar: { x: -5, y: -13, s: 0.85 }, mouth: { x: 1, y: -6, a: 0, s: 0.9 }, thorns: { x: 0, y: -18, a: 0, s: 1 }, fruit: { x: 8, y: -4, a: 0, s: 0.9 } }),
    stages: flBloomStages(0, -13, 12),
  }),
  flPart({
    id: 'rose', slot: 'head', name: 'Rose', tags: ['rose'], dom: 0.5, w: 2,
    shapes: [puff(0, -15, 12, 7, 3, { tip: 0.9 })],
    extra: [L(spiralPath(0, -15, 10, 2, 40), 'k', 1.3, { op: 0.45 }), HL('M-9,-22 C-6,-26 -1,-26 2,-24 C-2,-23 -6,-22 -8,-19 Z', 0.2)],
    sockets: flBloomSockets({ eye: { x: 5, y: -13, s: 0.9 }, eyeFar: { x: -5, y: -14, s: 0.8 }, mouth: { x: 1, y: -7, a: 0, s: 0.9 } }),
    stages: flBloomStages(0, -15, 12),
  }),
  flPart({
    id: 'sunflower', slot: 'head', name: 'Sunflower', tags: ['sunflower', 'big'], dom: 0.55, w: 2,
    shapes: [{ pts: puff(0, -16, 15, 16, 7, { tip: 'c' }), f: 's' }],
    extra: [C(0, -16, 9.5, 'pd', { sw: 1.6 }), C(-3, -19, 1, 'k', { ns: true, op: 0.5 }), C(2, -13, 1, 'k', { ns: true, op: 0.5 }), C(-4, -13, 0.9, 'k', { ns: true, op: 0.5 }), C(3, -20, 0.9, 'k', { ns: true, op: 0.5 }), HL('M-13,-26 C-9,-30 -3,-30 0,-28 C-4,-27 -8,-26 -11,-22 Z', 0.2)],
    sockets: flBloomSockets({ eye: { x: 6, y: -16, s: 1.05 }, eyeFar: { x: -5, y: -17, s: 0.95 }, mouth: { x: 2, y: -9, a: 0, s: 1 }, thorns: { x: 0, y: -16, a: 0, s: 1.1 }, fruit: { x: 10, y: -6, a: 0, s: 1 } }),
    stages: flBloomStages(0, -16, 15),
  }),
  flPart({
    id: 'bell', slot: 'head', name: 'Bell', tags: ['bell', 'hanging'], dom: 0.5, w: 2,
    shapes: [[[-12, -27], [12, -27], [15, -8], [9, -1, 'c'], [3, -4], [0, 0, 'c'], [-3, -4], [-9, -1, 'c'], [-15, -8]]],
    extra: [C(0, -4, 2.6, 'a', { sw: 1.2 }), HL('M-10,-24 C-8,-27 -4,-27 -2,-25 C-5,-24 -8,-22 -10,-18 Z', 0.22), L('M-6,-24 L-8,-8 M6,-24 L8,-8', 'k', 1, { op: 0.22 })],
    sockets: flBloomSockets({ eye: { x: 5, y: -16, s: 0.95 }, eyeFar: { x: -5, y: -17, s: 0.85 }, mouth: { x: 1, y: -9, a: 0, s: 0.9 }, thorns: { x: 0, y: -26, a: 0, s: 1 }, fruit: { x: 9, y: -6, a: 0, s: 0.9 } }),
    stages: flBloomStages(0, -14, 12),
  }),
  flPart({
    id: 'orchid', slot: 'head', name: 'Orchid', tags: ['orchid'], dom: 0.5, w: 2,
    shapes: [{ d: leaf([0, -12], [-17, -29], 6), f: 'p' }, { d: leaf([0, -12], [17, -29], 6), f: 'p' }, { d: leaf([0, -12], [0, -33], 5), f: 'p' }, { pts: [[-9, -10], [9, -10], [6, -1], [0, 2], [-6, -1]], f: 'a' }],
    extra: [C(0, -12, 4, 's', { sw: 1.4 }), HL('M-14,-25 C-11,-28 -8,-27 -6,-24 C-9,-23 -12,-22 -14,-20 Z', 0.2)],
    sockets: flBloomSockets({ eye: { x: 5, y: -14, s: 0.9 }, eyeFar: { x: -5, y: -15, s: 0.8 }, mouth: { x: 1, y: -6, a: 0, s: 0.9 }, thorns: { x: 0, y: -14, a: 0, s: 1 }, fruit: { x: 7, y: -3, a: 0, s: 0.9 } }),
    stages: flBloomStages(0, -16, 12),
  }),
  flPart({
    id: 'thistle', slot: 'head', name: 'Thistle', tags: ['thistle', 'spiky'], dom: 0.5, w: 2,
    shapes: [{ pts: puff(0, -19, 10, 14, 8, { tip: 'c' }), f: 'a' }, { pts: [[-10, -9], [10, -9], [8, 2], [0, 4], [-8, 2]], f: 'p' }],
    extra: [L('M-6,-8 L-4,1 M0,-8 L0,2 M6,-8 L4,1', 'k', 1, { op: 0.3 }), HL('M-8,-24 C-5,-28 0,-28 2,-26 C-1,-25 -5,-24 -7,-21 Z', 0.2)],
    sockets: flBloomSockets({ eye: { x: 5, y: -4, s: 0.85 }, eyeFar: { x: -5, y: -5, s: 0.75 }, mouth: { x: 1, y: 1, a: 0, s: 0.8 }, thorns: { x: 0, y: -19, a: 0, s: 1 }, fruit: { x: 8, y: 1, a: 0, s: 0.8 } }),
    stages: flBloomStages(0, -19, 10),
  }),
];
