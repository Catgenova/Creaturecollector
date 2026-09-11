// Mammal torsos. Origin = centre of the torso. Sockets (body coordinates):
//   head        neck point the head's origin sits on
//   shoulder / shoulderFar   foreleg joints (near, far)
//   hip / hipFar             hind leg joints
//   tail {x,y,a}  mane {x,y,a,s}  back {x,y,a}  horns are on the head
// kind: 'mammal.quad' (four on the floor) or 'mammal.biped' (upright, forelegs hang as arms)
import { mBody, torsoShade } from './_shared.js';
import { fur } from '../_dsl.js';

export const M_BODIES = [
  mBody({
    id: 'fox', name: 'Lean', tags: ['fox', 'lean'], dom: 0.5, w: 3,
    pts: [[28, -28], [12, -30], [-12, -27], [-34, -22], [-46, -8], [-44, 10], [-32, 22], [-8, 25], [16, 22], [32, 14], [42, 0], [42, -14], [36, -25]],
    shade: torsoShade(-46, 42, -28, 25),
    sockets: {
      head: { x: 30, y: -22, a: 0, s: 1 },
      shoulder: { x: 26, y: 8 }, shoulderFar: { x: 14, y: 4 },
      hip: { x: -28, y: 6 }, hipFar: { x: -38, y: 2 },
      tail: { x: -44, y: -6, a: 0 }, mane: { x: 34, y: -16, a: 0, s: 1 }, back: { x: -8, y: -28, a: 0 },
    },
  }),

  mBody({
    id: 'cat', name: 'Sleek', tags: ['cat', 'sleek'], dom: 0.5, w: 3,
    pts: [[26, -28], [8, -31], [-14, -28], [-34, -20], [-42, -4], [-38, 12], [-26, 20], [-4, 23], [18, 20], [32, 12], [40, -2], [40, -16], [34, -25]],
    shade: torsoShade(-42, 40, -30, 23),
    sockets: {
      head: { x: 28, y: -22, a: 0, s: 1 },
      shoulder: { x: 24, y: 8 }, shoulderFar: { x: 12, y: 4 },
      hip: { x: -26, y: 6 }, hipFar: { x: -36, y: 2 },
      tail: { x: -40, y: -4, a: 0 }, mane: { x: 32, y: -16, a: 0, s: 1 }, back: { x: -8, y: -29, a: 0 },
    },
  }),
  mBody({
    id: 'bear', name: 'Stocky', kind: 'mammal.biped', tags: ['bear', 'upright'], dom: 0.55, w: 2,
    pts: [[0, -42], [18, -38], [30, -22], [34, 0], [32, 20], [20, 32], [0, 35], [-20, 32], [-32, 20], [-34, 0], [-30, -22], [-18, -38]],
    shade: torsoShade(-34, 34, -42, 35, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 2, y: -36, a: 0, s: 1 },
      shoulder: { x: 14, y: -14 }, shoulderFar: { x: -6, y: -18 },
      hip: { x: 8, y: 18 }, hipFar: { x: -14, y: 14 },
      tail: { x: -30, y: 14, a: 25 }, mane: { x: 10, y: -30, a: 0, s: 1 }, back: { x: -20, y: -34, a: -15 },
    },
  }),
  mBody({
    id: 'rabbit', name: 'Crouched', tags: ['rabbit', 'compact'], dom: 0.5, w: 2,
    pts: [[22, -24], [4, -28], [-14, -30], [-32, -24], [-42, -6], [-38, 12], [-24, 22], [0, 24], [20, 20], [32, 10], [36, -4], [32, -16]],
    shade: torsoShade(-42, 36, -30, 24),
    sockets: {
      head: { x: 24, y: -18, a: 0, s: 1 },
      shoulder: { x: 18, y: 8 }, shoulderFar: { x: 8, y: 4 },
      hip: { x: -24, y: 4 }, hipFar: { x: -34, y: 0 },
      tail: { x: -38, y: -10, a: -20 }, mane: { x: 26, y: -12, a: 0, s: 1 }, back: { x: -14, y: -30, a: 0 },
    },
  }),

  mBody({
    id: 'deer', name: 'Long-necked', tags: ['deer', 'tall'], dom: 0.5, w: 2,
    pts: [[22, -24], [32, -46], [44, -62], [54, -58], [50, -40], [44, -22], [40, -8], [34, 8], [18, 18], [-6, 20], [-26, 18], [-38, 8], [-42, -8], [-34, -20], [-12, -26], [8, -27]],
    shade: torsoShade(-42, 40, -27, 20),
    sockets: {
      head: { x: 47, y: -56, a: -8, s: 0.95 },
      shoulder: { x: 22, y: 4 }, shoulderFar: { x: 10, y: 0 },
      hip: { x: -24, y: 2 }, hipFar: { x: -34, y: -2 },
      tail: { x: -40, y: -12, a: -30 }, mane: { x: 40, y: -42, a: -10, s: 0.9 }, back: { x: -6, y: -27, a: 0 },
    },
  }),
  mBody({
    id: 'wolf', name: 'Rugged', tags: ['wolf', 'muscular'], dom: 0.55, w: 2,
    pts: [[30, -32], [10, -34], [-14, -30], [-36, -22], [-48, -6], [-44, 12], [-32, 20], [-10, 20], [14, 22], [34, 16], [46, 4], [46, -12], [40, -26]],
    shade: torsoShade(-48, 46, -34, 22),
    sockets: {
      head: { x: 32, y: -26, a: 0, s: 1 },
      shoulder: { x: 28, y: 8 }, shoulderFar: { x: 16, y: 4 },
      hip: { x: -30, y: 6 }, hipFar: { x: -40, y: 2 },
      tail: { x: -46, y: -8, a: 0 }, mane: { x: 36, y: -20, a: 0, s: 1 }, back: { x: -8, y: -32, a: 0 },
    },
  }),
  mBody({
    id: 'mouse', name: 'Round', kind: 'mammal.biped', tags: ['mouse', 'small', 'upright'], dom: 0.45, w: 3,
    pts: [[0, -30], [16, -26], [26, -8], [26, 10], [18, 24], [0, 28], [-18, 24], [-26, 10], [-26, -8], [-16, -26]],
    shade: torsoShade(-26, 26, -30, 28, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 2, y: -24, a: 0, s: 1 },
      shoulder: { x: 12, y: -6 }, shoulderFar: { x: -6, y: -10 },
      hip: { x: 6, y: 16 }, hipFar: { x: -12, y: 12 },
      tail: { x: -24, y: 14, a: 30 }, mane: { x: 8, y: -18, a: 0, s: 0.8 }, back: { x: -14, y: -26, a: -15 },
    },
  }),
];
