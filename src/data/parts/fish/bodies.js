// Fish bodies. Origin = centre of the body. The face sits on the body: eye / eyeFar (null on
// side-view fish), mouth at the front tip. Fin sockets: dorsal (top), pectoral / pectoralFar
// (side), tail (rear), belly (bottom); plus gills, crest (top of the head), barbels (mouth corner).
// Fish hover above their shadow (`hover`). kinds: 'fish.round', 'fish.long', 'fish.upright'.
// Evolutions: stage 2 grows the body, enlarges the marking and draws an accent lateral line;
// stage 3 sprouts a row of finlets off the back and sets a glow behind the marking.
import { fBody, torsoShade } from './_shared.js';
import { L, SH, HL, PATCH, C, tube, arcPts } from '../_dsl.js';
import { sparklePath, crescentPath, boltPath, diamondPath, starPath } from '../_sigils.js';
import { evoFan, evoGlow } from '../_evo.js';

const fRing = (cx, cy, rx, ry, n = 12) => arcPts(cx, cy, rx, ry, 0, 360, n).slice(0, n);

export const F_BODIES = [
  fBody({
    id: 'round', name: 'Round', kind: 'fish.round', tags: ['classic'], dom: 0.5, w: 3, hover: 14,
    pts: [[30, -26], [10, -30], [-14, -28], [-36, -14], [-42, 2], [-34, 18], [-12, 28], [12, 28], [32, 18], [44, 4], [42, -12]],
    shade: torsoShade(-42, 44, -30, 28),
    extra: [PATCH(sparklePath(8, -17, 5.5), 'a')],
    sockets: {
      eye: { x: 24, y: -8, s: 1 }, eyeFar: null, mouth: { x: 43, y: 3, a: 0, s: 1 },
      dorsal: { x: -4, y: -30, a: 0, s: 1 }, pectoral: { x: 10, y: 6, a: 0, s: 1 }, pectoralFar: { x: -4, y: -2, a: 0, s: 0.9 },
      tail: { x: -42, y: 2, a: 0, s: 1 }, belly: { x: -6, y: 28, a: 0, s: 1 }, gills: { x: 14, y: -4, a: 0, s: 1 },
      crest: { x: 6, y: -30, a: 0, s: 1 }, barbels: { x: 41, y: 6, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(sparklePath(8, -17, 7.5), 'a'), L('M-36,-2 C-16,4 10,4 38,-2', 'a', 1.8, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-18, -24, 220, 320, 3, 6, 18)], add: [evoGlow(8, -17, 11, 0.25)] },
    },
  }),
  fBody({
    id: 'betta', name: 'Slender', kind: 'fish.round', tags: ['fancy'], dom: 0.5, w: 2, hover: 16,
    pts: [[26, -20], [6, -24], [-16, -22], [-36, -12], [-42, 0], [-36, 12], [-16, 22], [6, 24], [26, 20], [40, 6], [40, -8]],
    shade: torsoShade(-42, 40, -24, 24),
    extra: [PATCH(crescentPath(8, -12, 4.5, -60), 'a')],
    sockets: {
      eye: { x: 24, y: -6, s: 1 }, eyeFar: null, mouth: { x: 40, y: 0, a: 0, s: 1 },
      dorsal: { x: -6, y: -24, a: 0, s: 1 }, pectoral: { x: 12, y: 6, a: 0, s: 1 }, pectoralFar: { x: 0, y: 0, a: 0, s: 0.9 },
      tail: { x: -42, y: 0, a: 0, s: 1 }, belly: { x: -6, y: 24, a: 0, s: 1 }, gills: { x: 14, y: -2, a: 0, s: 1 },
      crest: { x: 4, y: -24, a: 0, s: 1 }, barbels: { x: 38, y: 3, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(crescentPath(8, -12, 6, -60), 'a'), L('M-36,0 C-16,4 10,4 36,0', 'a', 1.8, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-20, -18, 220, 320, 3, 6, 18)], add: [evoGlow(8, -12, 10, 0.25)] },
    },
  }),
  fBody({
    id: 'shark', name: 'Torpedo', kind: 'fish.long', tags: ['shark'], dom: 0.55, w: 2, hover: 16,
    pts: [[26, -18], [4, -24], [-18, -22], [-40, -14], [-48, -2], [-40, 10], [-18, 18], [6, 20], [30, 14], [50, 2, 'c'], [44, -8]],
    shade: torsoShade(-48, 50, -24, 20),
    extra: [PATCH(boltPath(10, -14, 5, 100), 'a')],
    sockets: {
      eye: { x: 28, y: -8, s: 0.9 }, eyeFar: null, mouth: { x: 40, y: 7, a: 0, s: 1 },
      dorsal: { x: -6, y: -24, a: 0, s: 1 }, pectoral: { x: 12, y: 10, a: 0, s: 1 }, pectoralFar: { x: 0, y: 4, a: 0, s: 0.9 },
      tail: { x: -46, y: -2, a: 0, s: 1 }, belly: { x: -8, y: 18, a: 0, s: 1 }, gills: { x: 16, y: -2, a: 0, s: 1 },
      crest: { x: 4, y: -24, a: 0, s: 1 }, barbels: { x: 38, y: 9, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(boltPath(10, -14, 6.5, 100), 'a'), L('M-42,0 C-16,4 14,6 44,2', 'a', 1.8, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-24, -18, 220, 320, 3, 6, 18), evoFan(-24, 14, 40, 140, 2, 6, 14)], add: [evoGlow(10, -14, 10, 0.25)] },
    },
  }),
  fBody({
    id: 'angler', name: 'Big-headed', kind: 'fish.round', tags: ['angler', 'deep'], dom: 0.5, w: 2, hover: 12,
    pts: [[20, -30], [0, -34], [-22, -28], [-38, -10], [-40, 6], [-30, 20], [-8, 26], [14, 24], [32, 14], [40, 0], [36, -16]],
    shade: torsoShade(-40, 40, -34, 26),
    extra: [PATCH(diamondPath(2, -22, 5, 8), 'a')],
    sockets: {
      eye: { x: 20, y: -14, s: 1.1 }, eyeFar: null, mouth: { x: 37, y: 3, a: 0, s: 1 },
      dorsal: { x: -10, y: -34, a: 0, s: 1 }, pectoral: { x: 8, y: 10, a: 0, s: 1 }, pectoralFar: { x: -6, y: 4, a: 0, s: 0.9 },
      tail: { x: -40, y: 4, a: 0, s: 1 }, belly: { x: -8, y: 26, a: 0, s: 1 }, gills: { x: 12, y: 0, a: 0, s: 1 },
      crest: { x: 8, y: -33, a: 0, s: 1 }, barbels: { x: 34, y: 8, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(diamondPath(2, -22, 7, 10), 'a'), L('M-34,0 C-14,6 12,6 36,0', 'a', 1.8, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-20, -26, 220, 320, 3, 6, 18)], add: [evoGlow(2, -22, 10, 0.25), C(-18, 6, 2, 'a', { ns: true, cl: true, op: 0.8 }), C(-6, 12, 1.8, 'a', { ns: true, cl: true, op: 0.7 }), C(10, 10, 1.8, 'a', { ns: true, cl: true, op: 0.7 })] },
    },
  }),
  fBody({
    id: 'puffer', name: 'Ball', kind: 'fish.round', tags: ['puffer', 'round'], dom: 0.5, w: 2, hover: 14,
    pts: fRing(0, 0, 32, 30, 12),
    shade: torsoShade(-32, 32, -30, 30, { shadeFrac: 0.35 }),
    extra: [PATCH(starPath(3, -17, 5, 5, 0.5), 'a')],
    sockets: {
      eye: { x: 18, y: -10, s: 1 }, eyeFar: { x: -8, y: -12, s: 0.85 }, mouth: { x: 30, y: 4, a: 0, s: 1 },
      dorsal: { x: -4, y: -30, a: 0, s: 1 }, pectoral: { x: 12, y: 8, a: 0, s: 1 }, pectoralFar: { x: -4, y: 2, a: 0, s: 0.9 },
      tail: { x: -32, y: 2, a: 0, s: 1 }, belly: { x: -4, y: 30, a: 0, s: 1 }, gills: { x: 12, y: -2, a: 0, s: 1 },
      crest: { x: 2, y: -30, a: 0, s: 1 }, barbels: { x: 28, y: 8, a: 0, s: 1 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(starPath(3, -17, 6.5, 5, 0.5), 'a')] },
      3: { grow: [1.06, 1.06], add: [evoGlow(3, -17, 10, 0.25), L('M-24,8 C-10,14 10,14 24,8', 'a', 1.8, { ns: true, cl: true, op: 0.5 })] },
    },
  }),
  fBody({
    id: 'seahorse', name: 'Upright', kind: 'fish.upright', tags: ['seahorse'], dom: 0.5, w: 2, hover: 6,
    pts: [[2, -50], [12, -48], [20, -42], [34, -40], [40, -35, 'c'], [34, -30], [24, -30], [20, -22], [16, -10], [12, 4], [12, 18], [8, 30], [0, 40], [-10, 44], [-18, 40], [-14, 32], [-8, 20], [-8, 6], [-8, -8], [-6, -22], [-8, -36], [-6, -46]],
    shade: [SH('M-20,10 C-10,24 4,30 12,22 L14,50 L-24,50 Z', 0.12), SH('M-10,-36 C0,-30 10,-30 22,-34 L24,-26 L-10,-26 Z', 0.08), HL('M-4,-46 C6,-50 14,-48 18,-42 L14,-40 C10,-44 4,-44 -2,-42 Z', 0.18), HL('M-4,-20 C-2,-6 0,8 2,22 L-2,22 C-4,8 -6,-6 -7,-20 Z', 0.14)],
    extra: [L('M-4,-14 C0,-12 6,-12 12,-14 M-5,-2 C0,0 6,0 11,-2 M-5,10 C0,12 6,12 10,10 M-3,22 C0,24 4,24 7,22', 'k', 1.1, { op: 0.25 }), PATCH(diamondPath(4, -29, 4.5, 6.5), 'a')],
    sockets: {
      eye: { x: 14, y: -40, s: 0.9 }, eyeFar: null, mouth: { x: 40, y: -35, a: 0, s: 0.8 },
      dorsal: { x: -8, y: 4, a: -12, s: 0.9 }, pectoral: { x: 10, y: -20, a: 30, s: 0.8 }, pectoralFar: { x: 0, y: -22, a: 30, s: 0.7 },
      tail: { x: -14, y: 40, a: 70, s: 1 }, belly: { x: 6, y: 30, a: -30, s: 0.6 }, gills: { x: 9, y: -30, a: 0, s: 0.8 },
      crest: { x: 6, y: -50, a: 0, s: 0.7 }, barbels: { x: 36, y: -31, a: 0, s: 0.8 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [PATCH(diamondPath(4, -29, 6, 8.5), 'a'), L('M-4,-14 C0,-12 6,-12 12,-14 M-5,-2 C0,0 6,0 11,-2 M-5,10 C0,12 6,12 10,10', 'a', 1.6, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-8, -12, 170, 260, 3, 4, 14), evoFan(-10, 14, 150, 240, 2, 4, 12)], add: [evoGlow(4, -29, 8, 0.25)] },
    },
  }),
  fBody({
    id: 'eel', name: 'Ribbon', kind: 'fish.long', tags: ['eel', 'long'], dom: 0.5, w: 2, hover: 12,
    pts: [[30, -9], [8, -12], [-16, -11], [-40, -8], [-60, -3], [-66, 3], [-56, 8], [-36, 9], [-12, 11], [12, 11], [34, 8], [44, 0], [40, -6]],
    shade: torsoShade(-66, 44, -12, 11),
    extra: [C(16, -4, 2.4, 'a', { ns: true, cl: true }), C(0, -4, 2.4, 'a', { ns: true, cl: true }), C(-16, -3, 2.4, 'a', { ns: true, cl: true }), C(-32, -2, 2.2, 'a', { ns: true, cl: true })],
    sockets: {
      eye: { x: 30, y: -3, s: 0.8 }, eyeFar: null, mouth: { x: 43, y: 2, a: 0, s: 0.9 },
      dorsal: { x: -6, y: -10, a: 0, s: 0.85 }, pectoral: { x: 18, y: 5, a: 0, s: 0.7 }, pectoralFar: { x: 8, y: 2, a: 0, s: 0.6 },
      tail: { x: -64, y: 3, a: 0, s: 0.9 }, belly: { x: -6, y: 10, a: 0, s: 0.85 }, gills: { x: 22, y: 0, a: 0, s: 0.8 },
      crest: { x: 16, y: -12, a: 0, s: 0.8 }, barbels: { x: 40, y: 4, a: 0, s: 0.9 },
    },
    stages: {
      2: { grow: [1.06, 1.06], add: [C(-48, 0, 2, 'a', { ns: true, cl: true }), C(32, -4, 2.2, 'a', { ns: true, cl: true }), L('M-60,4 C-30,7 10,7 40,3', 'a', 1.6, { ns: true, cl: true, op: 0.5 })] },
      3: { grow: [1.06, 1.06], addBehind: [evoFan(-34, -6, 220, 320, 3, 4, 14)], add: [C(16, -4, 5, 'a', { ns: true, cl: true, op: 0.3 }), C(0, -4, 5, 'a', { ns: true, cl: true, op: 0.3 }), C(-16, -3, 5, 'a', { ns: true, cl: true, op: 0.3 }), C(-32, -2, 4.6, 'a', { ns: true, cl: true, op: 0.3 })] },
    },
  }),
];
