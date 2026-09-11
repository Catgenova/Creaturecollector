// Mammal coat markings, drawn on the torso and clipped to it. Authored in a 100 x 60 frame
// centred on the origin; the renderer stretches that frame over the body's box.
import { mPart } from './_shared.js';
import { NONE, S } from '../_dsl.js';

export const M_MARKINGS = [
  NONE('markings', 0.3, 'm.'),
  mPart({ id: 'belly', slot: 'markings', name: 'Belly', tags: ['soft'], dom: 0.5, w: 3, extra: [S([[-54, 22], [-34, 14], [-8, 11], [18, 9], [36, 2], [50, -10], [56, -6], [56, 40], [-54, 40]], 's', { ns: true })] }),

  mPart({ id: 'saddle', slot: 'markings', name: 'Saddle', tags: ['dark'], dom: 0.5, w: 2, extra: [S([[-48, -40], [48, -40], [50, -14], [26, 2], [-4, 6], [-30, 2], [-50, -12]], 'a', { ns: true })] }),
  mPart({ id: 'stripes', slot: 'markings', name: 'Stripes', tags: ['tiger'], dom: 0.5, w: 2, extra: [
    S([[-34, -40], [-22, -40], [-28, -14], [-38, 0, 0.3], [-36, -16]], 'a', { ns: true }),
    S([[-12, -40], [2, -40], [-2, -12], [-14, 4, 0.3], [-14, -16]], 'a', { ns: true }),
    S([[12, -40], [26, -40], [24, -14], [12, 2, 0.3], [10, -16]], 'a', { ns: true }),
    S([[34, -40], [46, -40], [46, -18], [36, -6, 0.3], [32, -20]], 'a', { ns: true }),
  ] }),
  mPart({ id: 'spots', slot: 'markings', name: 'Spots', tags: ['fawn'], dom: 0.45, w: 2, extra: [
    ...[[-30, -16, 4], [-14, -22, 3.5], [2, -20, 4.5], [18, -24, 3.5], [30, -16, 4], [-22, -4, 3.5], [-4, -6, 3], [12, -8, 4], [26, -2, 3], [-36, 2, 3]].map(([x, y, r]) => ({ t: 'ellipse', cx: x, cy: y, rx: r * 1.1, ry: r * 0.85, f: 's', ns: true })),
  ] }),
  mPart({ id: 'rings', slot: 'markings', name: 'Rings', tags: ['bands'], dom: 0.5, w: 1, extra: [
    S([[-30, -40], [-16, -40], [-14, 40], [-30, 40]], 'a', { ns: true }), S([[4, -40], [18, -40], [20, 40], [4, 40]], 'a', { ns: true }), S([[34, -40], [46, -40], [50, 40], [36, 40]], 'a', { ns: true }),
  ] }),
  mPart({ id: 'star', slot: 'markings', name: 'Chest star', tags: ['blaze'], dom: 0.45, w: 2, extra: [
    S([[30, -14], [34, -4], [44, -2], [36, 5], [38, 16], [30, 10], [22, 16], [24, 5], [16, -2], [26, -4]], 's', { ns: true, spline: { tension: 0.2 } }),
  ] }),
  mPart({ id: 'patches', slot: 'markings', name: 'Patches', tags: ['calico'], dom: 0.45, w: 2, extra: [
    S([[-40, -30], [-16, -34], [-8, -16], [-22, -4], [-42, -10]], 'a', { ns: true }), S([[8, -30], [30, -34], [40, -18], [30, -4], [10, -8]], 'a', { ns: true }), S([[-6, 4], [10, 2], [14, 16], [-2, 22], [-12, 12]], 's', { ns: true }),
  ] }),
];
