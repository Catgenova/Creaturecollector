// Invertebrate shells (worn on the back, drawn in front of the body from the shell socket) and crowns
// (spirit flames, horns and growths on top, drawn behind the body).
import { vPart } from './_shared.js';
import { NONE, S, L, P, C, E, SH, HL, arcPts } from '../_dsl.js';

export const V_SHELLS = [
  NONE('shell', 0.3, 'v.'),
  vPart({ id: 'spiral', slot: 'shell', name: 'Spiral shell', tags: ['snail'], dom: 0.6, w: 3, shapes: [[[16, 2], [12, -14], [0, -26], [-16, -26], [-28, -14], [-28, 2], [-18, 12], [-2, 14]]], extra: [L('M14,-4 C6,-20 -14,-24 -22,-10 C-26,0 -18,8 -8,6 C0,4 2,-4 -4,-8 C-8,-10 -12,-6 -10,-2', 'k', 2, { op: 0.45 }), HL('M2,-22 C-8,-24 -18,-18 -20,-8 L-14,-6 C-12,-14 -4,-18 4,-18 Z', 0.22), SH('M-30,4 C-18,14 0,16 16,6 L16,20 L-30,20 Z', 0.14)] }),
  vPart({ id: 'cone', slot: 'shell', name: 'Cone shell', tags: ['limpet'], dom: 0.5, w: 2, shapes: [[[18, 6], [8, -8], [-4, -24, 'c'], [-16, -8], [-26, 6]]], extra: [L('M-4,-22 L-2,4 M-4,-22 L-12,4 M-4,-22 L8,4', 'k', 1.2, { op: 0.3 }), HL('M-6,-20 L-2,-6 L-8,-2 L-12,-6 Z', 0.22)] }),
  vPart({ id: 'spiky', slot: 'shell', name: 'Urchin spines', tags: ['spiky'], dom: 0.5, w: 2, extra: [P('M-24,4 L-30,-14 L-18,-2 Z M-12,-4 L-14,-24 L-4,-6 Z M2,-6 L6,-26 L10,-6 Z M14,-2 L24,-18 L20,0 Z M-4,-2 L-2,-16 L4,-4 Z', 'pd', { sw: 1.4 }), S([[-26, 6], [-14, -6], [4, -8], [20, 2], [16, 10], [-14, 12]], 'p'), HL('M-14,-4 C-6,-8 6,-8 14,-2 L10,2 C4,-2 -4,-2 -10,2 Z', 0.2)] }),
  vPart({ id: 'hermit', slot: 'shell', name: 'Hermit shell', tags: ['borrowed'], dom: 0.55, w: 2, shapes: [[[20, 6], [22, -8], [12, -22], [-8, -26], [-24, -16], [-26, 0], [-14, 12]]], extra: [L('M18,-6 C10,-18 -8,-20 -18,-10 C-22,-4 -16,4 -6,2 C2,0 2,-8 -4,-10', 'k', 1.8, { op: 0.4 }), L('M-8,-24 L-6,-30 M2,-24 L6,-30 M10,-18 L16,-22', 'k', 1.2, { op: 0.3 }), HL('M8,-20 C0,-24 -12,-20 -18,-12 L-12,-8 C-8,-14 0,-16 8,-16 Z', 0.2)] }),
  vPart({ id: 'plates', slot: 'shell', name: 'Armour plates', tags: ['hard'], dom: 0.5, w: 2, shapes: [[[22, 6], [16, -8], [0, -14], [-16, -12], [-26, -2], [-24, 8]]], extra: [L('M10,-10 C8,-2 8,2 12,6 M-4,-13 C-6,-4 -6,2 -2,6 M-18,-10 C-20,-2 -20,4 -16,8', 'k', 1.4, { op: 0.4 }), HL('M8,-10 C0,-12 -10,-10 -16,-6 L-14,-2 C-8,-6 0,-8 8,-6 Z', 0.2)] }),
  vPart({ id: 'barnacles', slot: 'shell', name: 'Barnacles', tags: ['crusty'], dom: 0.45, w: 2, extra: [...[[-14, -2, 6], [0, -8, 7], [12, -2, 5], [-4, 4, 4]].flatMap(([x, y, r]) => [P(`M${x - r},${y + r * 0.6} L${x - r * 0.5},${y - r} L${x + r * 0.5},${y - r} L${x + r},${y + r * 0.6} Z`, 'p', { sw: 1.6 }), E(x, y - r, r * 0.5, r * 0.25, 'k', { ns: true, op: 0.5 })])] }),
  vPart({ id: 'geode', slot: 'shell', name: 'Geode', tags: ['crystal'], dom: 0.45, w: 1, extra: [P('M-22,6 L-26,-8 L-16,-20 L-8,-6 L-10,6 Z', 'pd'), P('M-4,6 L-10,-10 L2,-30 L14,-12 L10,6 Z', 'p'), P('M14,6 L12,-4 L22,-16 L30,-4 L26,6 Z', 'pl'), HL('M-6,-8 L2,-24 L4,-22 L-2,-6 Z M14,-6 L22,-14 L24,-12 L18,-4 Z', 0.35)] }),
];

export const V_CROWNS = [
  NONE('crown', 0.3, 'v.'),
  vPart({ id: 'flame', slot: 'crown', name: 'Spirit flame', tags: ['ghost', 'fire'], dom: 0.55, w: 3, shapes: [[[-8, 4], [-10, -8], [-4, -20, 0.2], [0, -8], [4, -30, 0.2], [6, -12], [12, -22, 0.2], [10, -4], [10, 4]]], extra: [S([[-4, 2], [-4, -8], [0, -16, 0.2], [2, -6], [6, -12, 0.2], [6, 2]], 's', { ns: true, cl: true }), HL('M0,-4 C0,-10 2,-14 4,-20 L6,-20 C4,-14 4,-10 4,-4 Z', 0.3)] }),
  vPart({ id: 'horns', slot: 'crown', name: 'Horns', tags: ['devil'], dom: 0.5, w: 2, extra: [S([[-14, 4], [-16, -6], [-12, -18, 'c'], [-6, -8], [-4, 4]], 'pd'), S([[4, 4], [6, -8], [12, -18, 'c'], [16, -6], [14, 4]], 'p'), HL('M8,-6 L12,-14 L12,-8 L10,-2 Z', 0.25)] }),
  vPart({ id: 'spikes', slot: 'crown', name: 'Spikes', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[-16, 4], [-16, -4], [-11, -14, 'c'], [-6, -4], [-1, -18, 'c'], [4, -4], [9, -14, 'c'], [12, -4], [14, 4]]], extra: [HL('M-3,-14 L-1,-6 L1,-14 Z', 0.25)] }),
  vPart({ id: 'tuft', slot: 'crown', name: 'Tentacle tuft', tags: ['octopus'], dom: 0.45, w: 2, extra: [L('M-6,2 C-10,-6 -12,-12 -8,-18 M0,2 C0,-8 -2,-14 2,-20 M6,2 C10,-6 12,-12 8,-18', 'k', 5), L('M-6,2 C-10,-6 -12,-12 -8,-18 M0,2 C0,-8 -2,-14 2,-20 M6,2 C10,-6 12,-12 8,-18', 'p', 2.4)] }),
  vPart({ id: 'crystal', slot: 'crown', name: 'Crystal', tags: ['gem'], dom: 0.45, w: 1, extra: [P('M-6,4 L-8,-10 L0,-26 L8,-10 L6,4 Z', 'pl'), P('M-14,4 L-16,-4 L-10,-14 L-4,-6 L-6,4 Z', 'p'), HL('M-4,-8 L0,-22 L2,-20 L-1,-8 Z', 0.4)] }),
  vPart({ id: 'bubble', slot: 'crown', name: 'Bubble', tags: ['water'], dom: 0.4, w: 2, extra: [C(0, -10, 12, 'w', { ns: true, op: 0.35 }), C(0, -10, 12, 'none', { sw: 2 }), C(-4, -14, 3, 'w', { ns: true, op: 0.8 })] }),
  vPart({ id: 'coral', slot: 'crown', name: 'Coral', tags: ['reef'], dom: 0.45, w: 1, extra: [L('M0,4 L0,-8 M0,-8 L-8,-18 M0,-8 L8,-16 M-8,-18 L-14,-24 M-8,-18 L-6,-28 M8,-16 L14,-22 M8,-16 L10,-26', 'k', 6), L('M0,4 L0,-8 M0,-8 L-8,-18 M0,-8 L8,-16 M-8,-18 L-14,-24 M-8,-18 L-6,-28 M8,-16 L14,-22 M8,-16 L10,-26', 'p', 3.2)] }),
];
