// Mammal heads. Origin = neck point (where the head sits on the body's head socket).
// Heads are drawn in three-quarter view: a big cranium, both eyes visible (the far one smaller),
// a short muzzle projecting to the right with the nose at its tip.
// Sockets: ear / earFar {x,y,a,s}, eye / eyeFar {x,y,s}, muzzle {x,y,a,s} at the nose tip, horns {x,y,a,s} on the crown.
// Evolutions: stage 2 grows the skull, fans cheek tufts out behind the jaw and enlarges the
// brow sigil; stage 3 adds a crown of tufts, a glow behind the sigil and accent brow streaks.
import { mPart } from './_shared.js';
import { fur, PATCH, SH, HL, L, C, E } from '../_dsl.js';
import { flamePath, crescentPath, diamondPath, starPath, sparklePath, boltPath } from '../_sigils.js';
import { evoFan, evoGlow, evoRuff } from '../_evo.js';

export const M_HEADS = [
  mPart({
    id: 'fox', slot: 'head', name: 'Vulpine', tags: ['fox'], dom: 0.55, w: 3,
    shapes: [[[-8, -42], [8, -45], [22, -40], [31, -30], [39, -16, 'c'], [35, -8], [22, -3], ...fur([10, 0], [-16, -8], 4, 7, { lean: 0.4 }), [-23, -20], [-20, -34]]],
    extra: [
      // cream muzzle and cheeks
      PATCH('M44,-19 C36,-23 26,-23 20,-21 C14,-19 8,-14 -4,-12 C-12,-11 -18,-14 -26,-19 L-30,10 L44,10 Z', 's'),
      // shadow under the brow ridge and along the jaw, highlight on the cranium
      SH('M-26,-24 C-14,-16 6,-14 20,-20 C26,-23 32,-24 42,-20 L42,-4 L-26,-2 Z', 0.08),
      SH('M-30,-6 C-10,4 14,6 40,-6 L40,14 L-30,14 Z', 0.12),
      HL('M-10,-42 C0,-49 16,-47 26,-38 C16,-42 4,-41 -6,-36 Z', 0.2),
      // bridge of the nose
      L('M24,-22 C29,-21 33,-19 36,-17', 'k', 1.4, { op: 0.35 }),
      PATCH(flamePath(9, -36, 6.5), 'a'),
    ],
    sockets: {
      ear: { x: 20, y: -40, a: 14, s: 1 }, earFar: { x: 2, y: -43, a: -8, s: 0.95 },
      eye: { x: 18, y: -27, s: 1 }, eyeFar: { x: 1, y: -29, s: 0.8 },
      muzzle: { x: 38, y: -16, a: 0, s: 1 }, horns: { x: 8, y: -45, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-14, -10, 130, 230, 3, 8, 26)], add: [PATCH(flamePath(9, -36, 8.5), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(2, -30, 24, 8)], add: [evoGlow(9, -36, 12, 0.25), L('M-6,-33 L-11,-39 M20,-34 L25,-40', 'a', 2.2, { ns: true })] },
    },
  }),

  mPart({
    id: 'cat', slot: 'head', name: 'Feline', tags: ['cat'], dom: 0.5, w: 3,
    shapes: [[[-10, -40], [6, -45], [20, -40], [28, -30], [32, -18], [28, -8], [18, -2], ...fur([10, 0], [-18, -4], 4, 6, { lean: 0.35 }), [-26, -16], [-24, -30]]],
    extra: [
      PATCH('M35,-20 C31,-25 22,-25 18,-21 C13,-16 12,-8 17,-4 C23,1 33,-1 36,-8 Z', 's'),
      SH('M-30,-8 C-10,4 14,6 36,-8 L36,14 L-30,14 Z', 0.12),
      HL('M-12,-40 C-2,-49 14,-47 24,-38 C14,-42 2,-41 -8,-36 Z', 0.2),
      PATCH(crescentPath(6, -36, 5, -60), 'a'),
    ],
    sockets: {
      ear: { x: 18, y: -40, a: 16, s: 1 }, earFar: { x: -4, y: -43, a: -12, s: 0.95 },
      eye: { x: 15, y: -26, s: 1 }, eyeFar: { x: -4, y: -27, s: 0.85 },
      muzzle: { x: 26, y: -16, a: 0, s: 1 }, horns: { x: 6, y: -45, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-16, -8, 130, 230, 3, 8, 24)], add: [PATCH(crescentPath(6, -36, 6.5, -60), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(0, -30, 22, 8)], add: [evoGlow(6, -36, 11, 0.25), L('M-8,-32 L-13,-38 M18,-33 L23,-39', 'a', 2.2, { ns: true })] },
    },
  }),
  mPart({
    id: 'bear', slot: 'head', name: 'Ursine', tags: ['bear'], dom: 0.55, w: 2,
    shapes: [[[-14, -36], [-2, -43], [3, -51, 'c'], [8, -44], [20, -40], [28, -28], [34, -16], [34, -6], [26, 2], [10, 6], [-8, 4], [-20, -6], [-24, -22]]],
    extra: [
      PATCH('M37,-13 C37,-22 27,-27 18,-23 C11,-19 11,-5 18,-1 C27,3 37,-3 37,-13 Z', 's'),
      SH('M-28,-6 C-10,6 14,8 36,-4 L36,14 L-28,14 Z', 0.12),
      HL('M-14,-34 C-4,-46 14,-46 24,-36 C14,-40 2,-40 -8,-33 Z', 0.2),
      PATCH(diamondPath(5, -35, 7, 10), 'a'),
    ],
    sockets: {
      ear: { x: 17, y: -40, a: 12, s: 1 }, earFar: { x: -7, y: -41, a: -12, s: 0.95 },
      eye: { x: 12, y: -26, s: 0.95 }, eyeFar: { x: -6, y: -27, s: 0.82 },
      muzzle: { x: 31, y: -12, a: 0, s: 1 }, horns: { x: 4, y: -44, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-18, -12, 140, 230, 3, 8, 24, { tip: 0.3 })], add: [PATCH(diamondPath(5, -35, 9, 13), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(-2, -34, 22, 8)], add: [evoGlow(5, -35, 12, 0.25), L('M-8,-30 L-13,-36 M16,-31 L21,-37', 'a', 2.2, { ns: true })] },
    },
  }),
  mPart({
    id: 'rabbit', slot: 'head', name: 'Lapine', tags: ['rabbit'], dom: 0.5, w: 2,
    shapes: [[[-10, -38], [6, -44], [20, -40], [28, -30], [32, -18], [30, -8], [22, -2], [8, 2], [-8, 0], [-20, -8], [-24, -22]]],
    extra: [
      PATCH('M34,-16 C32,-22 24,-24 18,-20 C10,-14 -2,-12 -12, -14 L-14,6 L34,6 Z', 's'),
      SH('M-28,-8 C-10,4 14,6 36,-6 L36,14 L-28,14 Z', 0.1),
      HL('M-12,-36 C-2,-47 14,-46 24,-36 C14,-40 2,-40 -8,-34 Z', 0.2),
      PATCH(starPath(5, -35, 5, 5, 0.5), 'a'),
      E(22, -9, 4.5, 2.8, 'a', { ns: true, cl: true, op: 0.45 }), E(-12, -12, 3.4, 2.2, 'a', { ns: true, cl: true, op: 0.35 }),
    ],
    sockets: {
      ear: { x: 14, y: -40, a: 6, s: 1 }, earFar: { x: -4, y: -42, a: -8, s: 0.95 },
      eye: { x: 13, y: -25, s: 1 }, eyeFar: { x: -5, y: -26, s: 0.85 },
      muzzle: { x: 29, y: -14, a: 0, s: 1 }, horns: { x: 4, y: -44, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-18, -12, 140, 230, 2, 8, 22, { tip: 0.4 })], add: [PATCH(starPath(5, -35, 6.5, 5, 0.5), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(0, -30, 20, 8)], add: [evoGlow(5, -35, 11, 0.25), L('M-6,-31 L-11,-37 M16,-31 L21,-37', 'a', 2.2, { ns: true })] },
    },
  }),

  mPart({
    id: 'deer', slot: 'head', name: 'Cervine', tags: ['deer'], dom: 0.5, w: 2,
    shapes: [[[-8, -38], [6, -42], [18, -38], [28, -28], [36, -14], [38, -5, 0.4], [32, 2], [20, 4], [4, 2], [-12, -4], [-20, -16], [-18, -30]]],
    extra: [
      PATCH('M41,-9 C39,-18 31,-23 23,-19 C15,-14 4,-10 -8,-10 L-14,8 L41,8 Z', 's'),
      SH('M-24,-8 C-6,4 14,6 40,-4 L40,14 L-24,14 Z', 0.1),
      HL('M-10,-36 C0,-46 14,-45 24,-36 C14,-40 2,-40 -6,-33 Z', 0.2),
      L('M26,-22 C30,-19 33,-15 35,-11', 'k', 1.3, { op: 0.3 }),
      PATCH(sparklePath(6, -33, 6), 'a'),
    ],
    sockets: {
      ear: { x: 14, y: -38, a: 34, s: 1 }, earFar: { x: -2, y: -40, a: -34, s: 0.95 },
      eye: { x: 14, y: -24, s: 1 }, eyeFar: { x: -4, y: -26, s: 0.85 },
      muzzle: { x: 36, y: -8, a: 0, s: 1 }, horns: { x: 6, y: -42, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-14, -10, 140, 230, 3, 8, 24)], add: [PATCH(sparklePath(6, -33, 8), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(0, -28, 20, 8)], add: [evoGlow(6, -33, 11, 0.25), L('M-4,-30 L-9,-36 M16,-30 L21,-36', 'a', 2.2, { ns: true })] },
    },
  }),
  mPart({
    id: 'wolf', slot: 'head', name: 'Lupine', tags: ['wolf'], dom: 0.55, w: 2,
    shapes: [[[-10, -42], [6, -46], [20, -42], [30, -32], [40, -20], [46, -12, 'c'], [42, -6], [30, -2], ...fur([16, 0], [-16, -6], 4, 7, { lean: 0.4 }), [-24, -18], [-22, -32]]],
    extra: [
      PATCH('M50,-14 C42,-22 30,-24 22,-22 C14,-20 6,-14 -6,-12 C-14,-11 -20,-14 -26,-18 L-30,8 L50,8 Z', 's'),
      SH('M-26,-30 C-12,-22 6,-20 22,-26 C30,-29 38,-28 46,-22 L46,-6 L-26,-4 Z', 0.1),
      SH('M-30,-6 C-10,6 14,8 46,-6 L46,14 L-30,14 Z', 0.12),
      HL('M-12,-42 C-2,-50 14,-48 26,-40 C14,-44 2,-43 -8,-37 Z', 0.2),
      L('M26,-26 C32,-24 38,-21 43,-16', 'k', 1.4, { op: 0.35 }),
      PATCH(boltPath(8, -37, 5.5, 8), 'a'),
    ],
    sockets: {
      ear: { x: 18, y: -42, a: 12, s: 1 }, earFar: { x: 0, y: -45, a: -8, s: 0.95 },
      eye: { x: 16, y: -29, s: 1 }, eyeFar: { x: -2, y: -31, s: 0.8 },
      muzzle: { x: 45, y: -12, a: 0, s: 1 }, horns: { x: 6, y: -46, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-16, -10, 130, 230, 4, 8, 28)], add: [PATCH(boltPath(8, -37, 7, 8), 'a')] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(0, -32, 24, 8)], add: [evoGlow(8, -37, 12, 0.25), L('M-6,-34 L-11,-40 M20,-35 L25,-41', 'a', 2.2, { ns: true })] },
    },
  }),
  mPart({
    id: 'mouse', slot: 'head', name: 'Murine', tags: ['mouse'], dom: 0.45, w: 3,
    shapes: [[[-12, -36], [4, -42], [18, -38], [28, -28], [36, -16, 'c'], [32, -8], [22, -2], [8, 2], [-8, 0], [-20, -8], [-24, -22]]],
    extra: [
      PATCH('M40,-18 C34,-22 26,-22 20,-19 C12, -14 2,-11 -10,-12 L-14,6 L40,6 Z', 's'),
      SH('M-28,-8 C-10,4 14,6 36,-8 L36,14 L-28,14 Z', 0.1),
      HL('M-14,-34 C-4,-45 12,-45 22,-36 C12,-40 0,-40 -8,-33 Z', 0.2),
      C(23, -11, 4.8, 'a', { ns: true, cl: true, op: 0.75 }), C(-13, -13, 3.6, 'a', { ns: true, cl: true, op: 0.55 }),
    ],
    sockets: {
      ear: { x: 16, y: -36, a: 20, s: 1 }, earFar: { x: -7, y: -38, a: -16, s: 0.95 },
      eye: { x: 14, y: -24, s: 1 }, eyeFar: { x: -4, y: -26, s: 0.85 },
      muzzle: { x: 34, y: -15, a: 0, s: 1 }, horns: { x: 4, y: -42, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.05, 1.06], addBehind: [evoFan(-18, -12, 140, 230, 2, 8, 20, { tip: 0.5 })], add: [C(23, -11, 6, 'a', { ns: true, cl: true, op: 0.8 }), C(-13, -13, 4.6, 'a', { ns: true, cl: true, op: 0.6 })] },
      3: { grow: [1.05, 1.06], addBehind: [...evoRuff(-2, -28, 18, 8)], add: [PATCH(sparklePath(4, -33, 6), 'a'), L('M-6,-30 L-11,-36 M14,-30 L19,-36', 'a', 2.2, { ns: true })] },
    },
  }),
];
