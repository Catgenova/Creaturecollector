// Reptile torsos. Origin = centre of the torso. Sockets (body coordinates):
//   head        neck point the head's origin sits on
//   shoulder / shoulderFar, hip / hipFar   leg joints (absent on serpents)
//   tail {x,y,a}  back {x,y,a}  wing / wingFar {x,y}
// kind: 'reptile.quad', 'reptile.biped' (upright, forelegs hang as arms) or 'reptile.serpent' (no legs)
import { rBody, torsoShade } from './_shared.js';
import { L, SH, HL, PATCH, tube, arcPts } from '../_dsl.js';

const ring = (cx, cy, rx, ry, n = 12) => arcPts(cx, cy, rx, ry, 0, 360, n).slice(0, n);

export const R_BODIES = [
  rBody({
    id: 'lizard', name: 'Low', kind: 'reptile.quad', tags: ['lizard'], dom: 0.5, w: 3,
    pts: [[34, -18], [10, -22], [-16, -20], [-38, -14], [-46, -2], [-40, 10], [-24, 16], [0, 18], [22, 16], [38, 10], [46, -2], [44, -12]],
    shade: torsoShade(-46, 46, -22, 18),
    sockets: {
      head: { x: 34, y: -9, a: 0, s: 1 },
      shoulder: { x: 28, y: 8 }, shoulderFar: { x: 16, y: 4 }, hip: { x: -28, y: 6 }, hipFar: { x: -38, y: 2 },
      tail: { x: -44, y: 0, a: 0 }, back: { x: -6, y: -22, a: 0 }, wing: { x: -10, y: -16 }, wingFar: { x: -22, y: -18 },
    },
  }),
  rBody({
    id: 'croc', name: 'Armoured', kind: 'reptile.quad', tags: ['croc', 'long'], dom: 0.55, w: 2,
    pts: [[36, -14], [10, -18], [-20, -17], [-42, -12], [-50, 0], [-44, 10], [-24, 16], [0, 18], [26, 16], [42, 10], [50, 0], [46, -8]],
    shade: torsoShade(-50, 50, -18, 18),
    extra: [L('M-34,-10 C-30,-14 -26,-14 -22,-10 M-16,-13 C-12,-17 -8,-17 -4,-13 M2,-14 C6,-18 10,-18 14,-14 M20,-12 C24,-16 28,-16 32,-12', 'k', 1.2, { op: 0.3 })],
    sockets: {
      head: { x: 40, y: -4, a: 0, s: 1 },
      shoulder: { x: 30, y: 8 }, shoulderFar: { x: 18, y: 4 }, hip: { x: -30, y: 6 }, hipFar: { x: -40, y: 2 },
      tail: { x: -48, y: 2, a: 0 }, back: { x: -8, y: -18, a: 0 }, wing: { x: -12, y: -12 }, wingFar: { x: -24, y: -14 },
    },
  }),
  rBody({
    id: 'turtle', name: 'Shelled', kind: 'reptile.quad', tags: ['turtle', 'shell'], dom: 0.55, w: 2,
    shapes: [
      { pts: [[30, 2], [36, 10], [26, 18], [0, 20], [-26, 18], [-36, 10], [-30, 2]], f: 's' },
      [[26, -34], [0, -40], [-26, -34], [-40, -16], [-42, 0], [-34, 10], [-10, 14], [14, 14], [34, 10], [42, 0], [40, -16]],
    ],
    shade: [SH('M-44,2 C-20,12 20,12 44,2 L44,30 L-44,30 Z', 0.14), HL('M-22,-32 C-10,-40 10,-40 22,-32 C10,-34 -10,-34 -22,-28 Z', 0.2)],
    extra: [
      PATCH('M-42,2 C-30,10 30,10 42,2 L42,12 L-42,12 Z', 'a', { op: 0.6 }),
      L('M-12,-30 L-22,-14 L-12,0 L8,0 L18,-14 L8,-30 Z M8,-30 L14,-38 M18,-14 L34,-14 M8,0 L14,10 M-12,0 L-18,10 M-22,-14 L-38,-14 M-12,-30 L-18,-38', 'k', 1.4, { op: 0.28 }),
    ],
    sockets: {
      head: { x: 36, y: 0, a: 0, s: 0.95 },
      shoulder: { x: 26, y: 10 }, shoulderFar: { x: 16, y: 6 }, hip: { x: -26, y: 8 }, hipFar: { x: -36, y: 4 },
      tail: { x: -40, y: 6, a: 0 }, back: { x: 0, y: -40, a: 0 }, wing: { x: -8, y: -30 }, wingFar: { x: -20, y: -32 },
    },
  }),
  rBody({
    id: 'dragon', name: 'Upright', kind: 'reptile.biped', tags: ['dragon', 'upright'], dom: 0.55, w: 2,
    pts: [[4, -40], [20, -34], [30, -16], [32, 4], [26, 24], [10, 34], [-10, 34], [-26, 24], [-32, 4], [-30, -16], [-20, -32], [-6, -40]],
    shade: torsoShade(-32, 32, -40, 34, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 6, y: -36, a: 0, s: 1 },
      shoulder: { x: 14, y: -12 }, shoulderFar: { x: -6, y: -16 }, hip: { x: 8, y: 20 }, hipFar: { x: -12, y: 16 },
      tail: { x: -28, y: 16, a: 20 }, back: { x: -16, y: -34, a: -20 }, wing: { x: -12, y: -26 }, wingFar: { x: -24, y: -28 },
    },
  }),
  rBody({
    id: 'serpent', name: 'Coiled', kind: 'reptile.serpent', tags: ['snake', 'legless'], dom: 0.55, w: 2,
    shapes: [ring(-12, -6, 34, 12), ring(-2, 10, 48, 16), tube([[12, 4], [26, -10], [34, -26], [36, -42]], 22, 17)],
    shade: [SH('M-48,-6 C-30,4 10,4 24,-6 L24,6 L-48,6 Z', 0.12), SH('M-52,12 C-30,22 30,22 50,10 L50,30 L-52,30 Z', 0.14), HL('M-40,-14 C-24,-18 -2,-18 12,-14 L10,-10 C-2,-13 -24,-13 -38,-10 Z', 0.16), HL('M22,-14 C26,-22 30,-30 32,-38 L36,-38 C34,-30 30,-22 28,-12 Z', 0.16)],
    extra: [L('M-44,8 C-20,4 20,4 44,8', 'k', 1.2, { op: 0.2 })],
    bottom: 26,
    sockets: {
      head: { x: 36, y: -40, a: -6, s: 1 },
      shoulder: null, shoulderFar: null, hip: null, hipFar: null,
      tail: { x: -48, y: 12, a: 0 }, back: { x: -12, y: -18, a: 0 }, wing: { x: -4, y: -14 }, wingFar: { x: -16, y: -16 },
    },
  }),
  rBody({
    id: 'chameleon', name: 'Humped', kind: 'reptile.quad', tags: ['chameleon'], dom: 0.5, w: 2,
    pts: [[26, -22], [6, -30], [-14, -30], [-32, -22], [-42, -6], [-38, 8], [-24, 16], [0, 18], [22, 16], [36, 8], [42, -4], [38, -14]],
    shade: torsoShade(-42, 42, -30, 18),
    extra: [L('M-30,-4 C-20,-2 -10,-2 0,-4 M-26,4 C-14,6 -2,6 10,4', 'k', 1.1, { op: 0.2 })],
    sockets: {
      head: { x: 36, y: -16, a: 0, s: 1 },
      shoulder: { x: 24, y: 8 }, shoulderFar: { x: 12, y: 4 }, hip: { x: -26, y: 6 }, hipFar: { x: -36, y: 2 },
      tail: { x: -42, y: 2, a: 0 }, back: { x: -8, y: -31, a: 0 }, wing: { x: -10, y: -24 }, wingFar: { x: -22, y: -26 },
    },
  }),
  rBody({
    id: 'raptor', name: 'Sprinter', kind: 'reptile.biped', tags: ['raptor', 'upright'], dom: 0.5, w: 2,
    pts: [[14, -30], [30, -22], [36, -6], [30, 10], [14, 20], [-6, 22], [-24, 16], [-36, 4], [-34, -12], [-22, -26], [-4, -32]],
    shade: torsoShade(-36, 36, -32, 22, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 30, y: -24, a: -10, s: 1 },
      shoulder: { x: 24, y: -4 }, shoulderFar: { x: 10, y: -8 }, hip: { x: -10, y: 12 }, hipFar: { x: -24, y: 8 },
      tail: { x: -36, y: -2, a: 0 }, back: { x: -10, y: -30, a: 0 }, wing: { x: -8, y: -22 }, wingFar: { x: -20, y: -24 },
    },
  }),
];
