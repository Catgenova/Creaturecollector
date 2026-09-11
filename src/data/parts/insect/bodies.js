// Insect bodies (thorax and abdomen). Origin = centre. Sockets: head (front of the thorax),
// legFront / legMid / legBack and their Far copies (underside), wing / wingFar (top of the thorax),
// tail (abdomen tip, rear), shell (top of the abdomen). Flyers hover.
import { iBody, torsoShade } from './_shared.js';
import { L, SH, HL, S, C, PATCH, fur } from '../_dsl.js';

export const I_BODIES = [
  iBody({
    id: 'beetle', name: 'Beetle', kind: 'insect.crawler', tags: ['beetle'], dom: 0.5, w: 3,
    pts: [[26, -16], [36, -6], [34, 8], [22, 14], [0, 16], [-24, 14], [-40, 4], [-38, -10], [-24, -20], [-4, -22], [14, -20]],
    shade: torsoShade(-40, 36, -22, 16, { shadeFrac: 0.35 }),
    extra: [L('M18,-19 C15,-8 15,4 20,13', 'k', 1.6, { op: 0.35 }), S([[13, -20], [18, -19], [15, -8], [15, 4], [20, 13], [15, 14], [11, 4], [11, -8]], 'a', { ns: true, cl: true, op: 0.85 })],
    sockets: {
      head: { x: 34, y: -6, a: 0, s: 1 }, legFront: { x: 26, y: 10 }, legFrontFar: { x: 18, y: 6 }, legMid: { x: 8, y: 14 }, legMidFar: { x: 0, y: 10 },
      legBack: { x: -12, y: 14 }, legBackFar: { x: -20, y: 10 }, wing: { x: 6, y: -20, a: 0, s: 1 }, wingFar: { x: -4, y: -22, a: 0, s: 0.95 },
      tail: { x: -40, y: -2, a: 0 }, shell: { x: -8, y: -6, a: 0, s: 1 },
    },
  }),
  iBody({
    id: 'bee', name: 'Bee', kind: 'insect.flyer', tags: ['bee', 'fuzzy'], dom: 0.5, w: 2, hover: 10,
    pts: [[24, -18], [34, -8], [32, 6], [22, 12], [4, 14], [-16, 14], [-34, 8], [-46, 0, 'c'], [-34, -8], [-16, -16], [2, -20], ...fur([10, -20], [24, -18], 3, 4, { tip: 0.5 })],
    shade: torsoShade(-46, 34, -20, 14, { shadeFrac: 0.35 }),
    extra: [L('M2,-19 C0,-8 0,4 4,13', 'k', 1.6, { op: 0.35 }), S([[-3, -20], [2, -19], [0, -8], [0, 4], [4, 13], [-1, 14], [-4, 4], [-4, -8]], 'a', { ns: true, cl: true, op: 0.85 })],
    sockets: {
      head: { x: 32, y: -8, a: 0, s: 1 }, legFront: { x: 24, y: 10 }, legFrontFar: { x: 16, y: 6 }, legMid: { x: 10, y: 12 }, legMidFar: { x: 2, y: 8 },
      legBack: { x: -6, y: 12 }, legBackFar: { x: -14, y: 8 }, wing: { x: 14, y: -17, a: 0, s: 1 }, wingFar: { x: 6, y: -19, a: 0, s: 0.95 },
      tail: { x: -46, y: 0, a: 0 }, shell: { x: -12, y: -8, a: 0, s: 1 },
    },
  }),
  iBody({
    id: 'mantis', name: 'Mantis', kind: 'insect.upright', tags: ['mantis', 'slender'], dom: 0.5, w: 2,
    pts: [[18, -34], [26, -30], [22, -14], [14, 0], [4, 8], [-12, 12], [-32, 10], [-44, 2], [-40, -6], [-24, -8], [-8, -8], [6, -16]],
    shade: [SH('M-46,2 C-30,10 -10,12 8,6 L10,20 L-46,20 Z', 0.12), HL('M12,-30 C16,-34 22,-34 24,-30 L20,-22 C18,-26 14,-26 12,-24 Z', 0.18)],
    extra: [L('M8,-12 C4,-4 -2,0 -8,2', 'k', 1.4, { op: 0.3 }), S([[12, -30], [22, -28], [20, -22], [13, -21]], 'a', { ns: true, cl: true, op: 0.85 })],
    sockets: {
      head: { x: 24, y: -32, a: -10, s: 1 }, legFront: { x: 16, y: -6 }, legFrontFar: { x: 8, y: -10 }, legMid: { x: 0, y: 10 }, legMidFar: { x: -8, y: 6 },
      legBack: { x: -20, y: 10 }, legBackFar: { x: -28, y: 6 }, wing: { x: -4, y: -8, a: 0, s: 1 }, wingFar: { x: -12, y: -10, a: 0, s: 0.95 },
      tail: { x: -44, y: -2, a: 0 }, shell: { x: -20, y: -4, a: 0, s: 1 },
    },
  }),
  iBody({
    id: 'dragonfly', name: 'Darter', kind: 'insect.flyer', tags: ['dragonfly', 'long'], dom: 0.5, w: 2, hover: 14,
    pts: [[22, -14], [30, -6], [28, 6], [18, 10], [6, 8], [-20, 6], [-56, 4], [-70, 2, 'c'], [-56, -2], [-20, -4], [4, -8], [12, -14]],
    shade: [SH('M-70,0 C-40,6 -10,10 26,4 L28,16 L-70,16 Z', 0.12), HL('M6,-12 C12,-16 20,-16 26,-10 L22,-6 C16,-10 10,-10 6,-8 Z', 0.18)],
    extra: [L('M-14,-3 L-14,5 M-26,-3 L-26,5 M-38,-2 L-38,4 M-50,-1 L-50,3', 'k', 1.2, { op: 0.3 }), C(-20, 1, 2.4, 'a', { ns: true, cl: true }), C(-32, 1, 2.3, 'a', { ns: true, cl: true }), C(-44, 1, 2.1, 'a', { ns: true, cl: true }), C(-56, 1, 1.9, 'a', { ns: true, cl: true })],
    sockets: {
      head: { x: 28, y: -6, a: 0, s: 1 }, legFront: { x: 22, y: 8 }, legFrontFar: { x: 14, y: 4 }, legMid: { x: 12, y: 8 }, legMidFar: { x: 4, y: 4 },
      legBack: { x: 2, y: 8 }, legBackFar: { x: -6, y: 4 }, wing: { x: 8, y: -12, a: 0, s: 1 }, wingFar: { x: -2, y: -14, a: 0, s: 0.95 },
      tail: { x: -70, y: 0, a: 0 }, shell: { x: -10, y: -2, a: 0, s: 0.8 },
    },
  }),
  iBody({
    id: 'ladybug', name: 'Dome', kind: 'insect.crawler', tags: ['ladybug', 'round'], dom: 0.5, w: 3,
    pts: [[22, -16], [30, -4], [26, 10], [10, 18], [-10, 18], [-26, 10], [-30, -4], [-22, -16], [-6, -20], [8, -20]],
    shade: torsoShade(-30, 30, -20, 18, { shadeFrac: 0.35 }),
    extra: [PATCH('M-4,-21 L0,-21 L2,19 L-2,19 Z', 'a', { op: 0.75 })],
    sockets: {
      head: { x: 28, y: -2, a: 0, s: 0.9 }, legFront: { x: 20, y: 12 }, legFrontFar: { x: 12, y: 8 }, legMid: { x: 4, y: 16 }, legMidFar: { x: -4, y: 12 },
      legBack: { x: -14, y: 14 }, legBackFar: { x: -22, y: 10 }, wing: { x: 2, y: -18, a: 0, s: 0.9 }, wingFar: { x: -8, y: -20, a: 0, s: 0.85 },
      tail: { x: -30, y: -2, a: 0 }, shell: { x: -4, y: -4, a: 0, s: 1 },
    },
  }),
  iBody({
    id: 'ant', name: 'Segmented', kind: 'insect.crawler', tags: ['ant'], dom: 0.5, w: 2,
    pts: [[22, -10], [30, -2], [26, 8], [14, 10], [6, 4], [-4, 2], [-10, 6], [-30, 12], [-44, 4], [-40, -8], [-24, -12], [-10, -4], [2, -8], [12, -12]],
    shade: [SH('M-44,4 C-30,12 -10,10 8,6 C16,6 26,6 30,2 L30,16 L-44,16 Z', 0.12), HL('M-30,-10 C-24,-14 -14,-12 -12,-6 L-16,-4 C-20,-8 -26,-8 -30,-6 Z', 0.18), HL('M6,-10 C12,-14 22,-12 26,-6 L22,-4 C18,-8 12,-8 8,-6 Z', 0.18)],
    extra: [C(-32, 1, 4.2, 'a', { ns: true, cl: true, op: 0.9 }), C(-6, 3, 2.2, 'a', { ns: true, cl: true, op: 0.9 })],
    sockets: {
      head: { x: 28, y: -4, a: 0, s: 1 }, legFront: { x: 20, y: 8 }, legFrontFar: { x: 12, y: 4 }, legMid: { x: 12, y: 10 }, legMidFar: { x: 4, y: 6 },
      legBack: { x: 2, y: 4 }, legBackFar: { x: -6, y: 0 }, wing: { x: 10, y: -12, a: 0, s: 0.9 }, wingFar: { x: 2, y: -14, a: 0, s: 0.85 },
      tail: { x: -44, y: 0, a: 0 }, shell: { x: -22, y: -6, a: 0, s: 0.9 },
    },
  }),
  iBody({
    id: 'moth', name: 'Fuzzy', kind: 'insect.flyer', tags: ['moth', 'fuzzy'], dom: 0.5, w: 2, hover: 12,
    pts: [[18, -16], [28, -8], [26, 6], [16, 12], [-2, 14], [-22, 12], [-36, 4], [-38, -6], [-26, -14], ...fur([-14, -18], [12, -18], 4, 5, { tip: 0.5, lean: 0.2 })],
    shade: torsoShade(-38, 28, -18, 14, { shadeFrac: 0.35 }),
    extra: [C(-26, -2, 2.6, 'a', { ns: true, cl: true }), C(-16, 0, 2.3, 'a', { ns: true, cl: true }), C(-6, 1, 2, 'a', { ns: true, cl: true })],
    sockets: {
      head: { x: 26, y: -8, a: 0, s: 1 }, legFront: { x: 18, y: 10 }, legFrontFar: { x: 10, y: 6 }, legMid: { x: 6, y: 12 }, legMidFar: { x: -2, y: 8 },
      legBack: { x: -8, y: 12 }, legBackFar: { x: -16, y: 8 }, wing: { x: 2, y: -16, a: 0, s: 1 }, wingFar: { x: -8, y: -18, a: 0, s: 0.95 },
      tail: { x: -38, y: -2, a: 0 }, shell: { x: -12, y: -6, a: 0, s: 1 },
    },
  }),
];
