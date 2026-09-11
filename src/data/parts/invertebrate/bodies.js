// Invertebrate bodies. Origin = centre. The face sits on the body (eye / eyeFar, mouth).
// Sockets: arm / armFar, legs / legsFar (one part draws a whole side), shell (top), tail (rear),
// crown (top), feelers (front), skirt (underside). Floaters hover. kinds: 'inv.crawler', 'inv.floater'.
import { vBody, torsoShade } from './_shared.js';
import { L, SH, HL, C, PATCH } from '../_dsl.js';
import { diamondPath, sparklePath, crescentPath, boltPath } from '../_sigils.js';

export const V_BODIES = [
  vBody({
    id: 'slug', name: 'Slug', kind: 'inv.crawler', tags: ['slug', 'soft'], dom: 0.5, w: 3,
    pts: [[30, -16], [36, -8], [34, 4], [26, 10], [8, 12], [-14, 12], [-34, 10], [-48, 4, 'c'], [-36, 0], [-20, -4], [0, -8], [16, -14]],
    shade: torsoShade(-48, 36, -16, 12, { shadeFrac: 0.35 }),
    extra: [L('M-44,6 C-20,8 8,9 30,6', 'k', 1.4, { op: 0.3 }), L('M-10,-3 C-6,2 0,2 4,-4', 'k', 1.1, { op: 0.2 }), C(8, -8, 2.8, 'a', { ns: true, cl: true }), C(-8, -4, 2.6, 'a', { ns: true, cl: true }), C(-24, 0, 2.4, 'a', { ns: true, cl: true })],
    sockets: {
      eye: { x: 26, y: -14, s: 1 }, eyeFar: { x: 16, y: -16, s: 0.85 }, mouth: { x: 35, y: -3, a: 0, s: 1 },
      arm: { x: 22, y: 4, a: 0, s: 1 }, armFar: { x: 12, y: 0, a: 0, s: 0.9 }, legs: { x: 8, y: 12, a: 0, s: 1 }, legsFar: { x: 0, y: 8, a: 0, s: 0.9 },
      shell: { x: -14, y: -6, a: 0, s: 1 }, tail: { x: -40, y: 4, a: 0 }, crown: { x: 28, y: -16, a: 0, s: 1 }, feelers: { x: 34, y: -10, a: 0, s: 1 }, skirt: { x: -4, y: 12, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'crab', name: 'Crab', kind: 'inv.crawler', tags: ['crab', 'hard'], dom: 0.55, w: 2,
    pts: [[34, -12], [44, 0], [36, 12], [14, 18], [-14, 18], [-36, 12], [-44, 0], [-34, -12], [-12, -18], [12, -18]],
    shade: torsoShade(-44, 44, -18, 18, { shadeFrac: 0.35 }),
    extra: [L('M-30,-8 C-14,-14 14,-14 30,-8', 'k', 1.4, { op: 0.3 }), L('M-24,-2 C-8,2 8,2 24,-2', 'k', 1.1, { op: 0.2 }), PATCH(diamondPath(0, -4, 16, 12), 'a', { op: 0.85 }), HL('M-4,-9 L2,-9 L4,-4 L-6,-4 Z', 0.35)],
    sockets: {
      eye: { x: 22, y: -14, s: 1 }, eyeFar: { x: 6, y: -16, s: 0.85 }, mouth: { x: 36, y: 6, a: 0, s: 1 },
      arm: { x: 30, y: 8, a: 0, s: 1 }, armFar: { x: 18, y: 4, a: 0, s: 0.9 }, legs: { x: -6, y: 10, a: 0, s: 1 }, legsFar: { x: -14, y: 6, a: 0, s: 0.9 },
      shell: { x: -6, y: -8, a: 0, s: 1 }, tail: { x: -44, y: 2, a: 0 }, crown: { x: 6, y: -18, a: 0, s: 1 }, feelers: { x: 40, y: -4, a: 0, s: 1 }, skirt: { x: -4, y: 18, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'jelly', name: 'Bell', kind: 'inv.floater', tags: ['jelly', 'floating'], dom: 0.5, w: 2, hover: 26, bottom: 12,
    pts: [[0, -30], [22, -22], [32, -4], [26, 8], [0, 12], [-26, 8], [-32, -4], [-22, -22]],
    shade: [SH('M-34,-2 C-20,10 20,10 34,-2 L34,20 L-34,20 Z', 0.12), HL('M-14,-26 C-6,-32 8,-32 16,-26 C8,-28 -4,-28 -12,-24 Z', 0.22)],
    extra: [L('M-26,4 C-14,10 14,10 26,4', 'k', 1.2, { op: 0.25 }), L('M-8,-20 C-6,-8 -6,0 -4,6 M8,-20 C6,-8 6,0 4,6', 'k', 1, { op: 0.15 }), C(-13, -14, 2.6, 'a', { ns: true, cl: true, op: 0.85 }), C(0, -19, 2.8, 'a', { ns: true, cl: true, op: 0.85 }), C(13, -14, 2.6, 'a', { ns: true, cl: true, op: 0.85 })],
    sockets: {
      eye: { x: 12, y: -6, s: 1 }, eyeFar: { x: -8, y: -8, s: 0.9 }, mouth: { x: 4, y: 6, a: 0, s: 1 },
      arm: { x: 24, y: 6, a: 0, s: 0.9 }, armFar: { x: -20, y: 4, a: 0, s: 0.85 }, legs: { x: 0, y: 10, a: 0, s: 0.8 }, legsFar: { x: -8, y: 8, a: 0, s: 0.75 },
      shell: { x: 0, y: -30, a: 0, s: 0.8 }, tail: { x: -30, y: 2, a: -20 }, crown: { x: 2, y: -30, a: 0, s: 1 }, feelers: { x: 30, y: -2, a: 0, s: 1 }, skirt: { x: 0, y: 10, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'octopus', name: 'Mantle', kind: 'inv.floater', tags: ['octopus', 'soft'], dom: 0.5, w: 2, hover: 14, bottom: 16,
    pts: [[6, -34], [24, -26], [30, -8], [26, 8], [12, 16], [-10, 16], [-26, 8], [-30, -8], [-24, -26], [-8, -34]],
    shade: torsoShade(-30, 30, -34, 16, { shadeFrac: 0.3 }),
    extra: [PATCH(sparklePath(2, -23, 6), 'a')],
    sockets: {
      eye: { x: 14, y: -8, s: 1.1 }, eyeFar: { x: -10, y: -10, s: 0.95 }, mouth: { x: 6, y: 8, a: 0, s: 1 },
      arm: { x: 24, y: 10, a: 0, s: 1 }, armFar: { x: -22, y: 8, a: 0, s: 0.9 }, legs: { x: 0, y: 14, a: 0, s: 0.9 }, legsFar: { x: -8, y: 12, a: 0, s: 0.8 },
      shell: { x: 0, y: -34, a: 0, s: 0.9 }, tail: { x: -30, y: 0, a: -20 }, crown: { x: 0, y: -34, a: 0, s: 1 }, feelers: { x: 28, y: -2, a: 0, s: 1 }, skirt: { x: 0, y: 14, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'wisp', name: 'Wisp', kind: 'inv.floater', tags: ['spirit', 'ghost'], dom: 0.5, w: 2, hover: 22, bottom: 14,
    pts: [[0, -30], [20, -22], [26, -4], [20, 10], [10, 6], [0, 14], [-10, 6], [-20, 12], [-26, -4], [-20, -22]],
    shade: [SH('M-28,-2 C-14,8 14,8 28,-2 L28,20 L-28,20 Z', 0.1), HL('M-12,-26 C-4,-32 8,-32 14,-26 C6,-28 -2,-28 -10,-24 Z', 0.22)],
    extra: [PATCH(crescentPath(0, -19, 5, -90), 'a')],
    sockets: {
      eye: { x: 10, y: -8, s: 1 }, eyeFar: { x: -10, y: -10, s: 0.9 }, mouth: { x: 2, y: 4, a: 0, s: 1 },
      arm: { x: 22, y: 0, a: 0, s: 0.9 }, armFar: { x: -20, y: -2, a: 0, s: 0.85 }, legs: null, legsFar: null,
      shell: { x: 0, y: -30, a: 0, s: 0.8 }, tail: { x: -24, y: 6, a: -30 }, crown: { x: 0, y: -30, a: 0, s: 1 }, feelers: { x: 24, y: -8, a: 0, s: 1 }, skirt: { x: 0, y: 12, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'scorpion', name: 'Scorpion', kind: 'inv.crawler', tags: ['scorpion', 'armoured'], dom: 0.55, w: 2,
    pts: [[30, -14], [40, -6], [38, 6], [26, 12], [6, 14], [-16, 14], [-36, 10], [-46, 2], [-40, -6], [-24, -10], [-6, -12], [14, -14]],
    shade: torsoShade(-46, 40, -14, 14, { shadeFrac: 0.35 }),
    extra: [L('M-34,-4 L-34,10 M-22,-8 L-22,12 M-10,-10 L-10,13 M4,-12 L4,13', 'k', 1.2, { op: 0.3 }), C(-40, 2, 2.4, 'a', { ns: true, cl: true }), C(-28, 1, 2.4, 'a', { ns: true, cl: true }), C(-16, 0, 2.4, 'a', { ns: true, cl: true }), C(-3, 0, 2.4, 'a', { ns: true, cl: true })],
    sockets: {
      eye: { x: 24, y: -10, s: 0.85 }, eyeFar: { x: 12, y: -12, s: 0.75 }, mouth: { x: 36, y: 2, a: 0, s: 1 },
      arm: { x: 32, y: 4, a: 0, s: 1 }, armFar: { x: 22, y: 0, a: 0, s: 0.9 }, legs: { x: 0, y: 12, a: 0, s: 1 }, legsFar: { x: -8, y: 8, a: 0, s: 0.9 },
      shell: { x: -10, y: -6, a: 0, s: 1 }, tail: { x: -44, y: -4, a: 0 }, crown: { x: 14, y: -14, a: 0, s: 1 }, feelers: { x: 40, y: -4, a: 0, s: 1 }, skirt: { x: -6, y: 14, a: 0, s: 1 },
    },
  }),
  vBody({
    id: 'spider', name: 'Spider', kind: 'inv.crawler', tags: ['spider'], dom: 0.5, w: 2,
    pts: [[16, -12], [26, -6], [24, 6], [14, 10], [6, 4], [-4, 0], [-14, 4], [-34, 10], [-46, 0], [-40, -14], [-24, -20], [-10, -12], [2, -10], [10, -14]],
    shade: [SH('M-46,2 C-34,12 -14,12 -4,4 C4,8 14,10 26,4 L26,16 L-46,16 Z', 0.12), HL('M-34,-14 C-26,-20 -14,-18 -10,-12 L-14,-10 C-18,-14 -26,-14 -32,-10 Z', 0.18)],
    extra: [PATCH(boltPath(-28, -6, 6.5, 10), 'a')],
    sockets: {
      eye: { x: 14, y: -4, s: 1 }, eyeFar: { x: 4, y: -6, s: 0.85 }, mouth: { x: 22, y: 4, a: 0, s: 1 },
      arm: { x: 18, y: 4, a: 0, s: 0.9 }, armFar: { x: 10, y: 0, a: 0, s: 0.8 }, legs: { x: 2, y: 6, a: 0, s: 1 }, legsFar: { x: -6, y: 2, a: 0, s: 0.9 },
      shell: { x: -24, y: -10, a: 0, s: 1 }, tail: { x: -46, y: 0, a: 0 }, crown: { x: 8, y: -14, a: 0, s: 1 }, feelers: { x: 24, y: -2, a: 0, s: 1 }, skirt: { x: -12, y: 12, a: 0, s: 1 },
    },
  }),
];
