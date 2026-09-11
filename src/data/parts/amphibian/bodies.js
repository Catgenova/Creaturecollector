// Amphibian bodies. Origin = centre. Sockets: head (front top), shoulder / shoulderFar, hip / hipFar,
// tail (rear), back (spine). kinds: 'amph.squat', 'amph.long', 'amph.swim'.
// Evolutions: stage 2 broadens the body and bulges soft lobes out of the chest (a belly fin on
// the polliwog); stage 3 adds rump lobes and, on the warty kinds, more warts.
import { aBody, torsoShade } from './_shared.js';
import { C, L, SH, HL } from '../_dsl.js';
import { evoFan } from '../_evo.js';

const warts = (pts) => pts.map(([x, y, r]) => C(x, y, r, 'pd', { sw: 1.4 }));

export const A_BODIES = [
  aBody({
    id: 'frog', name: 'Squat', kind: 'amph.squat', tags: ['frog'], dom: 0.5, w: 3,
    pts: [[20, -22], [30, -10], [30, 6], [20, 16], [0, 20], [-22, 18], [-36, 8], [-38, -6], [-28, -20], [-8, -26], [8, -26]],
    shade: torsoShade(-38, 30, -26, 20, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 16, y: -20, a: 0, s: 1 }, shoulder: { x: 18, y: 10 }, shoulderFar: { x: 8, y: 6 }, hip: { x: -22, y: 8 }, hipFar: { x: -30, y: 4 },
      tail: { x: -36, y: 2, a: 0 }, back: { x: -10, y: -26, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(26, -4, -50, 50, 3, 8, 20, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-30, -8, 170, 260, 3, 8, 22, { tip: 0.5 })], add: warts([[-14, -16, 2.6], [4, -20, 2.2]]) },
    },
  }),
  aBody({
    id: 'toad', name: 'Warty', kind: 'amph.squat', tags: ['toad'], dom: 0.55, w: 2,
    pts: [[22, -20], [34, -8], [36, 8], [24, 18], [0, 22], [-26, 20], [-40, 8], [-40, -6], [-30, -20], [-8, -26], [10, -26]],
    shade: torsoShade(-40, 36, -26, 22, { shadeFrac: 0.35 }),
    extra: warts([[-20, -12, 3], [-4, -18, 2.5], [10, -14, 3], [-28, 2, 2.5], [-10, -2, 2], [4, 0, 2.5]]),
    sockets: {
      head: { x: 18, y: -18, a: 0, s: 1.05 }, shoulder: { x: 22, y: 12 }, shoulderFar: { x: 10, y: 8 }, hip: { x: -24, y: 10 }, hipFar: { x: -32, y: 6 },
      tail: { x: -40, y: 2, a: 0 }, back: { x: -8, y: -27, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(30, -2, -50, 50, 3, 8, 20, { tip: 0.5 })], add: warts([[-34, -8, 2.4], [-18, 8, 2.2], [16, 4, 2.4]]) },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-34, -6, 170, 260, 3, 8, 22, { tip: 0.5 })], add: warts([[-20, -12, 4], [10, -14, 4], [-2, 8, 3]]) },
    },
  }),
  aBody({
    id: 'treefrog', name: 'Slim', kind: 'amph.squat', tags: ['treefrog'], dom: 0.5, w: 2,
    pts: [[16, -18], [26, -8], [26, 6], [16, 14], [-2, 16], [-20, 14], [-30, 6], [-30, -6], [-22, -16], [-6, -20], [6, -20]],
    shade: torsoShade(-30, 26, -20, 16, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 14, y: -16, a: 0, s: 1 }, shoulder: { x: 14, y: 8 }, shoulderFar: { x: 6, y: 4 }, hip: { x: -18, y: 6 }, hipFar: { x: -26, y: 2 },
      tail: { x: -30, y: 0, a: 0 }, back: { x: -8, y: -20, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(22, -4, -50, 50, 3, 6, 18, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-24, -6, 170, 260, 3, 6, 20, { tip: 0.5 })] },
    },
  }),
  aBody({
    id: 'axolotl', name: 'Soft', kind: 'amph.long', tags: ['axolotl'], dom: 0.5, w: 2,
    pts: [[24, -16], [34, -8], [34, 4], [26, 12], [6, 14], [-16, 14], [-40, 10], [-56, 4], [-58, -4], [-44, -12], [-20, -16], [4, -18]],
    shade: torsoShade(-58, 34, -18, 14, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 26, y: -14, a: 0, s: 1 }, shoulder: { x: 20, y: 10 }, shoulderFar: { x: 10, y: 6 }, hip: { x: -24, y: 10 }, hipFar: { x: -32, y: 6 },
      tail: { x: -56, y: 0, a: 0 }, back: { x: -14, y: -16, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(30, -4, -50, 50, 3, 8, 20, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-48, -2, 150, 250, 3, 8, 20, { tip: 0.5 })] },
    },
  }),
  aBody({
    id: 'newt', name: 'Newt', kind: 'amph.long', tags: ['newt'], dom: 0.5, w: 2,
    pts: [[22, -12], [32, -6], [32, 4], [24, 10], [6, 12], [-16, 12], [-38, 8], [-48, 2], [-46, -6], [-34, -10], [-14, -12], [6, -14]],
    shade: torsoShade(-48, 32, -14, 12, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 26, y: -10, a: 0, s: 1 }, shoulder: { x: 20, y: 8 }, shoulderFar: { x: 10, y: 4 }, hip: { x: -24, y: 8 }, hipFar: { x: -32, y: 4 },
      tail: { x: -48, y: -2, a: 0 }, back: { x: -12, y: -12, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(28, -2, -50, 50, 3, 6, 18, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-40, 0, 150, 250, 3, 6, 18, { tip: 0.5 })] },
    },
  }),
  aBody({
    id: 'salamander', name: 'Chunky', kind: 'amph.long', tags: ['salamander'], dom: 0.55, w: 2,
    pts: [[26, -18], [38, -8], [38, 6], [28, 14], [6, 18], [-18, 18], [-40, 12], [-52, 4], [-50, -6], [-38, -14], [-16, -20], [6, -22]],
    shade: torsoShade(-52, 38, -22, 18, { shadeFrac: 0.35 }),
    extra: [L('M-30,-6 C-20,-2 -8,-2 4,-6 M-26,4 C-16,8 -4,8 8,4', 'k', 1.1, { op: 0.2 })],
    sockets: {
      head: { x: 30, y: -16, a: 0, s: 1 }, shoulder: { x: 24, y: 12 }, shoulderFar: { x: 12, y: 8 }, hip: { x: -26, y: 12 }, hipFar: { x: -34, y: 8 },
      tail: { x: -52, y: -2, a: 0 }, back: { x: -12, y: -21, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(34, -4, -50, 50, 3, 8, 20, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-44, -2, 150, 250, 3, 8, 20, { tip: 0.5 })], add: [L('M-34,-12 C-22,-8 -8,-8 6,-12 M-30,12 C-18,16 -4,16 10,12', 'a', 1.6, { ns: true, cl: true, op: 0.5 })] },
    },
  }),
  aBody({
    id: 'polliwog', name: 'Polliwog', kind: 'amph.swim', tags: ['tadpole', 'round'], dom: 0.45, w: 2, hover: 8,
    pts: [[16, -16], [24, -6], [24, 6], [16, 14], [0, 18], [-16, 14], [-24, 6], [-24, -6], [-16, -16], [0, -20]],
    shade: torsoShade(-24, 24, -20, 18, { shadeFrac: 0.35 }),
    sockets: {
      head: { x: 10, y: -14, a: 0, s: 0.95 }, shoulder: { x: 14, y: 10 }, shoulderFar: { x: 6, y: 6 }, hip: { x: -14, y: 10 }, hipFar: { x: -20, y: 6 },
      tail: { x: -24, y: 0, a: 0 }, back: { x: -4, y: -20, a: 0 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(0, 14, 40, 140, 3, 6, 18, { tip: 0.4 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(0, -14, 220, 320, 3, 6, 18, { tip: 0.4 })] },
    },
  }),
];
