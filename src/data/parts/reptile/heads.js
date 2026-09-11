// Reptile heads. Origin = neck point. Long low skulls in three-quarter view with a pale jaw.
// Sockets: eye / eyeFar {x,y,s}, jaw {x,y,a,s} at the mouth corner, crest {x,y,a,s} on the crown,
// throat {x,y,a,s} under the jaw.
// Evolutions: stage 2 grows the skull, sprouts horn nubs off the back of it and enlarges the
// marking; stage 3 adds a crown of spikes, a glow behind the marking and accent brow streaks.
import { rPart } from './_shared.js';
import { PATCH, SH, HL, L, C, P, S } from '../_dsl.js';
import { diamondPath, sparklePath, spiralPath } from '../_sigils.js';
import { evoFan, evoGlow } from '../_evo.js';

export const R_HEADS = [
  rPart({
    id: 'lizard', slot: 'head', name: 'Wedge', tags: ['lizard'], dom: 0.5, w: 3,
    shapes: [[[-12, -26], [4, -30], [20, -26], [36, -14], [42, -6, 'c'], [36, 2], [18, 6], [0, 6], [-14, 0], [-18, -12]]],
    extra: [
      PATCH('M44,-8 C36,-8 26,-6 14,-4 C4,-2 -8,-4 -18,-10 L-20,10 L44,10 Z', 's'),
      SH('M-18,-6 C-4,2 16,4 40,-2 L40,10 L-18,10 Z', 0.1),
      HL('M-10,-26 C0,-32 14,-30 26,-22 C14,-26 2,-26 -8,-22 Z', 0.18),
      C(36, -11, 1.4, 'k', { ns: true, op: 0.6 }),
      L('M-8,-16 C2,-20 14,-18 24,-12', 'k', 1.2, { op: 0.25 }),
      PATCH('M-16,-20 C-2,-30 16,-28 40,-12 L42,-7 C16,-22 -2,-24 -14,-14 Z', 'a', { op: 0.85 }),
    ],
    sockets: { eye: { x: 12, y: -16, s: 1 }, eyeFar: { x: -4, y: -18, s: 0.8 }, jaw: { x: 36, y: -2, a: 0, s: 1 }, crest: { x: 4, y: -30, a: 0, s: 1 }, throat: { x: 8, y: 6, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-10, -18, 160, 250, 2, 6, 20)], add: [PATCH(diamondPath(6, -21, 6, 9), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(4, -26, 200, 340, 4, 5, 20)], add: [evoGlow(6, -21, 10, 0.25), L('M-6,-19 L-11,-25 M18,-20 L23,-26', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'croc', slot: 'head', name: 'Snapper', tags: ['croc'], dom: 0.55, w: 2,
    shapes: [[[-12, -24], [0, -28], [3, -36, 'c'], [7, -27], [14, -24], [17, -31, 'c'], [21, -22], [26, -18], [50, -12], [56, -6, 'c'], [50, 2], [30, 4], [6, 6], [-12, 2], [-18, -10]]],
    extra: [
      PATCH('M58,-6 C46,-6 30,-4 12,-2 C0,0 -10,-2 -18,-6 L-20,10 L58,10 Z', 's'),
      SH('M-18,-4 C0,4 24,6 54,-2 L54,10 L-18,10 Z', 0.1),
      HL('M-10,-24 C0,-30 12,-28 22,-20 C12,-24 0,-24 -8,-20 Z', 0.18),
      P('M26,-2 L28,3 L30,-2 Z M34,-3 L36,2 L38,-3 Z M42,-4 L44,1 L46,-4 Z', 'w', { sw: 1.1 }),
      L('M2,-24 C6,-28 10,-28 14,-24 M14,-22 C18,-25 22,-25 26,-20', 'k', 1.2, { op: 0.3 }),
      C(50, -11, 1.5, 'k', { ns: true, op: 0.6 }),
    ],
    sockets: { eye: { x: 8, y: -20, s: 1 }, eyeFar: { x: -6, y: -22, s: 0.8 }, jaw: { x: 48, y: 0, a: 0, s: 1 }, crest: { x: 0, y: -28, a: 0, s: 1 }, throat: { x: 6, y: 6, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -18, 160, 250, 3, 6, 18)], add: [P('M18,0 L20,5 L22,0 Z M50,-8 L52,-3 L54,-8 Z', 'w', { sw: 1.1 }), PATCH(diamondPath(10, -18, 5, 8), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(10, -26, 210, 330, 3, 5, 18)], add: [evoGlow(10, -18, 9, 0.25), L('M-4,-18 L-9,-24 M22,-16 L27,-22', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'turtle', slot: 'head', name: 'Stubby', tags: ['turtle'], dom: 0.45, w: 2,
    shapes: [[[-8, -22], [4, -26], [16, -22], [26, -12], [28, -2, 0.4], [22, 6], [8, 8], [-6, 6], [-12, -6]]],
    extra: [
      PATCH('M30,-4 C22,-2 12,0 2,0 C-6,0 -10,-2 -14,-6 L-16,12 L30,12 Z', 's'),
      SH('M-14,-2 C0,6 14,8 28,2 L28,12 L-14,12 Z', 0.1),
      HL('M-6,-22 C2,-28 12,-26 20,-18 C12,-22 2,-22 -4,-18 Z', 0.18),
      C(24, -10, 1.2, 'k', { ns: true, op: 0.6 }),
      PATCH(diamondPath(5, -19, 6, 8), 'a'),
    ],
    sockets: { eye: { x: 12, y: -14, s: 1 }, eyeFar: { x: -2, y: -16, s: 0.8 }, jaw: { x: 24, y: 0, a: 0, s: 1 }, crest: { x: 4, y: -26, a: 0, s: 1 }, throat: { x: 6, y: 8, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-6, -16, 160, 250, 2, 5, 14, { tip: 0.4 })], add: [PATCH(diamondPath(5, -19, 8, 11), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(4, -22, 210, 330, 3, 4, 14, { tip: 0.4 })], add: [evoGlow(5, -19, 9, 0.25), L('M-4,-16 L-8,-21 M14,-16 L18,-21', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'dragon', slot: 'head', name: 'Draconic', tags: ['dragon'], dom: 0.55, w: 2,
    shapes: [[[-10, -34], [6, -40], [22, -36], [32, -26], [44, -14], [46, -6, 'c'], [38, 2], [20, 4], [2, 4], [-14, -4], [-18, -18]]],
    extra: [
      PATCH('M48,-8 C40,-8 28,-6 14,-4 C4,-2 -6,-4 -16,-10 L-18,10 L48,10 Z', 's'),
      SH('M-18,-8 C0,2 20,4 46,-4 L46,10 L-18,10 Z', 0.1),
      HL('M-8,-34 C2,-42 16,-40 28,-30 C16,-34 4,-34 -6,-30 Z', 0.18),
      L('M-4,-26 C8,-32 20,-30 30,-22', 'k', 1.4, { op: 0.35 }),
      L('M-8,-14 L-2,-12 M-6,-8 L0,-6', 'k', 1, { op: 0.25 }),
      C(40, -15, 1.6, 'k', { ns: true, op: 0.6 }),
      PATCH(sparklePath(8, -30, 6), 'a'),
    ],
    sockets: { eye: { x: 18, y: -22, s: 1 }, eyeFar: { x: 0, y: -25, s: 0.8 }, jaw: { x: 40, y: -2, a: 0, s: 1 }, crest: { x: 8, y: -40, a: 0, s: 1 }, throat: { x: 6, y: 4, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-10, -24, 150, 250, 3, 6, 22)], add: [PATCH(sparklePath(8, -30, 8), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(6, -36, 200, 340, 4, 5, 22)], add: [evoGlow(8, -30, 11, 0.25), L('M-4,-26 L-9,-32 M22,-28 L27,-34', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'cobra', slot: 'head', name: 'Hooded', tags: ['snake', 'cobra'], dom: 0.55, w: 2,
    shapes: [
      [[-30, -40], [-10, -52], [16, -50], [30, -36], [26, -20], [12, -10], [-12, -10], [-28, -22]],
      [[-6, -30], [8, -32], [22, -26], [32, -16], [34, -8, 'c'], [26, -2], [10, 0], [-6, -2], [-12, -14]],
    ],
    extra: [
      S([[-14, -40], [-2, -46], [10, -40], [8, -30], [-2, -24], [-12, -30]], 'a', { ns: true, cl: true }),
      L('M-24,-34 C-16,-44 0,-48 14,-44', 'k', 1.2, { op: 0.25 }),
      PATCH('M36,-8 C28,-6 16,-4 4,-4 C-4,-4 -8,-6 -12,-10 L-14,8 L36,8 Z', 's'),
      SH('M-12,-6 C0,2 14,4 32,-2 L32,8 L-12,8 Z', 0.1),
      HL('M-6,-30 C2,-36 12,-34 20,-26 C12,-30 2,-30 -4,-26 Z', 0.18),
      C(28, -14, 1.3, 'k', { ns: true, op: 0.6 }),
      PATCH(diamondPath(8, -25, 5, 8), 'a'),
    ],
    sockets: { eye: { x: 16, y: -20, s: 1 }, eyeFar: { x: 2, y: -22, s: 0.8 }, jaw: { x: 30, y: -6, a: 0, s: 1 }, crest: { x: 4, y: -32, a: 0, s: 1 }, throat: { x: 6, y: 0, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [{ pts: [[-36, -42], [-12, -58], [20, -56], [36, -38], [30, -18], [12, -8], [-14, -8], [-34, -22]], f: 'pd' }], add: [S([[-16, -42], [-2, -49], [12, -42], [10, -29], [-2, -22], [-14, -29]], 'a', { ns: true, cl: true, op: 0.9 })] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(-2, -32, 190, 350, 5, 22, 40)], add: [evoGlow(-2, -36, 12, 0.22), L('M-2,-22 L-7,-28 M20,-22 L25,-28', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'chameleon', slot: 'head', name: 'Casqued', tags: ['chameleon'], dom: 0.5, w: 2,
    shapes: [[[-8, -30], [6, -46, 'c'], [18, -36], [30, -26], [38, -14], [40, -6, 'c'], [32, 2], [14, 6], [-4, 6], [-14, -4], [-16, -18]]],
    extra: [
      PATCH('M42,-6 C34,-4 22,-2 10,-2 C0,-2 -8,-4 -14,-8 L-16,10 L42,10 Z', 's'),
      SH('M-16,-6 C0,2 16,4 38,-2 L38,10 L-16,10 Z', 0.1),
      HL('M-6,-30 C0,-40 8,-42 16,-34 C8,-36 2,-34 -4,-28 Z', 0.18),
      L('M-4,-28 L6,-42', 'k', 1.2, { op: 0.3 }),
      L('M-2,-14 C10,-10 22,-10 34,-12', 'k', 1.2, { op: 0.25 }),
      C(34, -12, 1.2, 'k', { ns: true, op: 0.6 }),
      PATCH('M-9,-29 L6,-48 L11,-40 L-4,-26 Z', 'a'),
      L(spiralPath(24, -6, 5.5, 1.5, 100), 'a', 1.8, { ns: true, cl: true, op: 0.85 }),
    ],
    sockets: { eye: { x: 16, y: -20, s: 1.15 }, eyeFar: { x: -2, y: -22, s: 0.95 }, jaw: { x: 34, y: -2, a: 0, s: 1 }, crest: { x: 6, y: -46, a: 0, s: 1 }, throat: { x: 8, y: 6, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -22, 160, 250, 2, 6, 18)], addShapes: [{ pts: [[0, -38], [6, -58, 'c'], [12, -40]], f: 'a' }] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(0, -30, 190, 300, 3, 8, 24)], add: [evoGlow(24, -6, 9, 0.25), L('M-4,-22 L-9,-28 M20,-24 L25,-30', 'a', 2.2, { ns: true })] },
    },
  }),
  rPart({
    id: 'raptor', slot: 'head', name: 'Toothy', tags: ['raptor'], dom: 0.5, w: 2,
    shapes: [[[-10, -30], [0, -33], [5, -42, 'c'], [9, -32], [18, -30], [30, -22], [48, -10], [52, -4, 'c'], [46, 4], [24, 6], [4, 6], [-12, 0], [-16, -14]]],
    extra: [
      PATCH('M54,-4 C44,-4 30,-2 12,0 C2,1 -8,-1 -16,-6 L-18,10 L54,10 Z', 's'),
      SH('M-16,-4 C0,4 24,6 50,-2 L50,10 L-16,10 Z', 0.1),
      HL('M-8,-30 C2,-36 14,-34 24,-26 C14,-30 2,-30 -6,-26 Z', 0.18),
      P('M24,0 L26,5 L28,0 Z M32,-1 L34,4 L36,-1 Z M40,-3 L42,2 L44,-3 Z', 'w', { sw: 1.1 }),
      L('M0,-22 C10,-26 20,-24 30,-18', 'k', 1.4, { op: 0.35 }),
      C(46, -9, 1.4, 'k', { ns: true, op: 0.6 }),
      PATCH('M2,-27 L32,-13 L32,-7 L0,-20 Z', 'a', { op: 0.85 }),
    ],
    sockets: { eye: { x: 14, y: -20, s: 1 }, eyeFar: { x: -2, y: -22, s: 0.8 }, jaw: { x: 44, y: -1, a: 0, s: 1 }, crest: { x: 4, y: -34, a: 0, s: 1 }, throat: { x: 6, y: 6, a: 0, s: 1 } },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-8, -24, 150, 250, 3, 6, 20)], add: [P('M16,1 L18,6 L20,1 Z M48,-6 L50,-1 L52,-6 Z', 'w', { sw: 1.1 }), PATCH('M2,-29 L34,-14 L34,-7 L0,-20 Z', 'a', { op: 0.9 })] },
      3: { grow: [1.05, 1.06], addBehind: [evoFan(5, -34, 200, 340, 4, 5, 20)], add: [evoGlow(14, -20, 11, 0.22), L('M-4,-24 L-9,-30 M20,-24 L25,-30', 'a', 2.2, { ns: true })] },
    },
  }),
];
