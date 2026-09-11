// Reptile scale patterns, drawn on the torso and clipped to it. Authored in a 100 x 60 frame
// centred on the origin; the renderer stretches that frame over the body's box.
import { rPart } from './_shared.js';
import { NONE, S, L } from '../_dsl.js';

export const R_SCALES = [
  NONE('scales', 0.3, 'r.'),
  rPart({ id: 'belly', slot: 'scales', name: 'Belly plates', tags: ['soft'], dom: 0.5, w: 3, extra: [
    S([[-54, 18], [-30, 12], [0, 10], [30, 12], [54, 18], [54, 40], [-54, 40]], 's', { ns: true }),
    L('M-44,22 L44,22 M-46,27 L46,27 M-40,32 L40,32', 'k', 1.1, { op: 0.2 }),
  ] }),
  rPart({ id: 'bands', slot: 'scales', name: 'Bands', tags: ['striped'], dom: 0.5, w: 2, extra: [
    S([[-36, -40], [-24, -40], [-26, 40], [-38, 40]], 'a', { ns: true }), S([[-8, -40], [4, -40], [2, 40], [-10, 40]], 'a', { ns: true }), S([[20, -40], [32, -40], [30, 40], [18, 40]], 'a', { ns: true }),
  ] }),
  rPart({ id: 'spots', slot: 'scales', name: 'Spots', tags: ['spotted'], dom: 0.45, w: 2, extra: [
    ...[[-34, -14, 5], [-16, -22, 4], [2, -18, 5.5], [20, -24, 4], [34, -14, 5], [-24, 0, 4], [-6, -4, 3.5], [14, -6, 4.5], [30, 2, 3.5], [-38, 6, 3]].map(([x, y, r]) => ({ t: 'ellipse', cx: x, cy: y, rx: r * 1.15, ry: r * 0.85, f: 'a', ns: true })),
  ] }),
  rPart({ id: 'diamonds', slot: 'scales', name: 'Diamonds', tags: ['snake'], dom: 0.5, w: 2, extra: [
    S([[-44, -30], [-32, -18], [-44, -6], [-56, -18]], 'a', { ns: true, spline: { tension: 0.1 } }), S([[-20, -30], [-8, -18], [-20, -6], [-32, -18]], 'a', { ns: true, spline: { tension: 0.1 } }), S([[4, -30], [16, -18], [4, -6], [-8, -18]], 'a', { ns: true, spline: { tension: 0.1 } }), S([[28, -30], [40, -18], [28, -6], [16, -18]], 'a', { ns: true, spline: { tension: 0.1 } }), S([[52, -30], [64, -18], [52, -6], [40, -18]], 'a', { ns: true, spline: { tension: 0.1 } }),
  ] }),
  rPart({ id: 'scutes', slot: 'scales', name: 'Scutes', tags: ['croc'], dom: 0.45, w: 2, extra: [
    L('M-50,-20 L50,-20 M-50,-8 L50,-8 M-50,4 L50,4 M-50,16 L50,16 M-36,-40 L-36,40 M-18,-40 L-18,40 M0,-40 L0,40 M18,-40 L18,40 M36,-40 L36,40', 'k', 1.2, { op: 0.2 }),
    S([[-54, 18], [-30, 14], [0, 12], [30, 14], [54, 18], [54, 40], [-54, 40]], 's', { ns: true, op: 0.7 }),
  ] }),
  rPart({ id: 'hex', slot: 'scales', name: 'Hex plates', tags: ['turtle'], dom: 0.45, w: 2, extra: [
    L('M-30,-26 L-38,-12 L-30,2 L-14,2 L-6,-12 L-14,-26 Z M6,-26 L-2,-12 L6,2 L22,2 L30,-12 L22,-26 Z M-14,2 L-22,16 L-14,30 L2,30 L10,16 L2,2 M22,2 L30,16 L22,30 M-38,-12 L-52,-12 M30,-12 L46,-12 M-14,-26 L-8,-38 M22,-26 L28,-38', 'k', 1.3, { op: 0.25 }),
  ] }),
  rPart({ id: 'saddle', slot: 'scales', name: 'Dark back', tags: ['gradient'], dom: 0.5, w: 2, extra: [
    S([[-48, -40], [48, -40], [52, -12], [24, 2], [-6, 6], [-32, 2], [-52, -12]], 'a', { ns: true }),
    S([[-40, -40], [40, -40], [42, -24], [20, -14], [-8, -12], [-30, -14], [-44, -24]], 'k', { ns: true, op: 0.12 }),
  ] }),
];
