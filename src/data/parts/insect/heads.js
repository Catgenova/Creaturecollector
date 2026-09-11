// Insect heads. Origin = neck point on the thorax front. Sockets: eye / eyeFar, mandibles {x,y,a,s}
// at the front, antennae {x,y,a,s} on the crown.
// Evolutions: stage 2 grows the head, sprouts brow spines off the back of it and enlarges the
// marking; stage 3 adds a crown of spines, a glow behind the marking and accent brow streaks.
import { iPart } from './_shared.js';
import { SH, HL, L, C, PATCH } from '../_dsl.js';
import { diamondPath, sparklePath, starPath, boltPath, crescentPath } from '../_sigils.js';
import { evoFan, evoGlow } from '../_evo.js';

export const I_HEADS = [
  iPart({ id: 'beetle', slot: 'head', name: 'Beetle', tags: ['beetle'], dom: 0.5, w: 3, shapes: [[[-4, -18], [8, -20], [16, -14], [18, -4], [12, 4], [0, 6], [-8, 2], [-12, -8]]], extra: [SH('M-12,-4 C-4,4 8,6 18,0 L18,8 L-12,8 Z', 0.12), HL('M-4,-16 C2,-20 10,-19 14,-14 C8,-16 2,-16 -2,-14 Z', 0.2), PATCH(diamondPath(-3, -11, 4, 6), 'a')],
    sockets: { eye: { x: 8, y: -10, s: 0.9 }, eyeFar: { x: -4, y: -12, s: 0.7 }, mandibles: { x: 16, y: -2, a: 0, s: 1 }, antennae: { x: 8, y: -19, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -10, 150, 250, 2, 4, 12)], add: [PATCH(diamondPath(-3, -11, 5.5, 8), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(4, -18, 200, 340, 3, 3, 12)], add: [evoGlow(-3, -11, 6, 0.25), L('M-6,-8 L-9,-12 M10,-8 L13,-12', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'bee', slot: 'head', name: 'Bee', tags: ['bee'], dom: 0.5, w: 2, shapes: [[[-2, -18], [10, -16], [16, -8], [14, 2], [6, 8], [-6, 6], [-12, -2], [-10, -12]]], extra: [SH('M-12,-2 C-4,6 6,8 16,2 L16,10 L-12,10 Z', 0.12), HL('M-4,-16 C2,-19 8,-18 12,-13 C6,-15 0,-15 -4,-13 Z', 0.2), C(-5, -11, 2.2, 'a', { ns: true, cl: true })],
    sockets: { eye: { x: 7, y: -6, s: 1.1 }, eyeFar: null, mandibles: { x: 12, y: 4, a: 0, s: 0.9 }, antennae: { x: 6, y: -17, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -8, 150, 250, 2, 4, 12, { tip: 0.4 })], add: [C(-5, -11, 3, 'a', { ns: true, cl: true })] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(4, -16, 200, 340, 3, 3, 12, { tip: 0.4 })], add: [evoGlow(-5, -11, 5, 0.25), L('M-6,-6 L-9,-10 M10,-6 L13,-10', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'mantis', slot: 'head', name: 'Mantis', tags: ['mantis', 'triangle'], dom: 0.55, w: 2, shapes: [[[-8, -20], [10, -22], [20, -14, 'c'], [10, -4], [4, 4, 'c'], [-4, 0], [-14, -8]]], extra: [SH('M-14,-10 C-6,-2 4,0 12,-6 L14,6 L-14,6 Z', 0.12), HL('M-6,-19 C2,-22 10,-21 16,-16 C8,-18 2,-18 -4,-16 Z', 0.2), PATCH(sparklePath(-2, -14, 3.6), 'a')],
    sockets: { eye: { x: 12, y: -14, s: 1 }, eyeFar: { x: -6, y: -16, s: 0.8 }, mandibles: { x: 6, y: 1, a: 0, s: 0.9 }, antennae: { x: 4, y: -21, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-10, -12, 150, 250, 2, 4, 12)], add: [PATCH(sparklePath(-2, -14, 5), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(2, -20, 200, 340, 3, 3, 12)], add: [evoGlow(-2, -14, 6, 0.25), L('M-8,-12 L-11,-16 M12,-12 L15,-16', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'dragonfly', slot: 'head', name: 'Bulb', tags: ['dragonfly'], dom: 0.5, w: 2, shapes: [[[-4, -18], [8, -18], [16, -10], [16, 0], [8, 6], [-4, 6], [-12, 0], [-12, -10]]], extra: [SH('M-12,-2 C-4,6 8,8 16,2 L16,10 L-12,10 Z', 0.12)],
    sockets: { eye: { x: 6, y: -8, s: 1.3 }, eyeFar: null, mandibles: { x: 14, y: 2, a: 0, s: 0.8 }, antennae: { x: 4, y: -17, a: 0, s: 0.8 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -10, 150, 250, 2, 4, 12, { tip: 0.4 })], add: [C(2, -12, 2.6, 'a', { ns: true, cl: true })] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(2, -16, 200, 340, 3, 3, 12, { tip: 0.4 })], add: [evoGlow(2, -12, 5, 0.25), L('M-8,-6 L-11,-10 M12,-6 L15,-10', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'ladybug', slot: 'head', name: 'Small', tags: ['ladybug'], dom: 0.45, w: 3, shapes: [[[-4, -14], [6, -14], [12, -8], [12, 0], [6, 4], [-4, 4], [-10, 0], [-10, -8]]], extra: [SH('M-10,-2 C-4,4 6,6 12,0 L12,8 L-10,8 Z', 0.12), HL('M-4,-12 C0,-15 6,-14 9,-10 C5,-12 0,-12 -3,-10 Z', 0.2), PATCH(starPath(-3, -8, 3, 5, 0.5), 'a')],
    sockets: { eye: { x: 5, y: -6, s: 0.8 }, eyeFar: { x: -4, y: -7, s: 0.65 }, mandibles: { x: 11, y: 0, a: 0, s: 0.8 }, antennae: { x: 4, y: -13, a: 0, s: 0.9 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-6, -8, 150, 250, 2, 3, 10, { tip: 0.4 })], add: [PATCH(starPath(-3, -8, 4, 5, 0.5), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(0, -12, 200, 340, 3, 3, 10, { tip: 0.4 })], add: [evoGlow(-3, -8, 5, 0.25), L('M-6,-4 L-9,-8 M8,-4 L11,-8', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'ant', slot: 'head', name: 'Ant', tags: ['ant'], dom: 0.5, w: 2, shapes: [[[-6, -18], [10, -20], [18, -12], [20, -2], [14, 6], [2, 8], [-8, 4], [-14, -6]]], extra: [SH('M-14,-4 C-6,4 6,8 20,0 L20,10 L-14,10 Z', 0.12), HL('M-6,-16 C2,-20 10,-19 16,-13 C8,-15 2,-15 -4,-13 Z', 0.2), PATCH(boltPath(0, -12, 3.6, 10), 'a')],
    sockets: { eye: { x: 8, y: -9, s: 0.85 }, eyeFar: { x: -4, y: -11, s: 0.7 }, mandibles: { x: 18, y: 2, a: 0, s: 1.1 }, antennae: { x: 8, y: -19, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-10, -10, 150, 250, 2, 4, 12)], add: [PATCH(boltPath(0, -12, 4.8, 10), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(2, -18, 200, 340, 3, 3, 12)], add: [evoGlow(0, -12, 6, 0.25), L('M-8,-8 L-11,-12 M12,-8 L15,-12', 'a', 1.6, { ns: true })] },
    } }),
  iPart({ id: 'moth', slot: 'head', name: 'Fluffy', tags: ['moth'], dom: 0.45, w: 2, shapes: [[[-6, -16], [6, -18], [14, -12], [16, -4], [10, 4], [0, 6], [-8, 2], [-12, -6]]], extra: [L('M-6,-14 L-10,-20 M0,-16 L-2,-22 M6,-16 L6,-22', 'k', 1.4, { op: 0.3 }), SH('M-12,-2 C-4,6 6,8 16,0 L16,10 L-12,10 Z', 0.12), PATCH(crescentPath(-3, -9, 3.2, -60), 'a')],
    sockets: { eye: { x: 7, y: -7, s: 1 }, eyeFar: { x: -4, y: -9, s: 0.75 }, mandibles: { x: 14, y: 0, a: 0, s: 0.9 }, antennae: { x: 4, y: -17, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -10, 150, 250, 2, 4, 12, { tip: 0.5 })], add: [PATCH(crescentPath(-3, -9, 4.2, -60), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(0, -16, 200, 340, 3, 3, 12, { tip: 0.5 })], add: [evoGlow(-3, -9, 5, 0.25), L('M-8,-6 L-11,-10 M10,-6 L13,-10', 'a', 1.6, { ns: true })] },
    } }),
];
