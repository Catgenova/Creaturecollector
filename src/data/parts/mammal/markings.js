// Mammal coat markings, drawn on the torso and clipped to it. Authored in a 100 x 60 frame
// centred on the origin; the renderer stretches that frame over the body's box.
// Bold and stylised on purpose: claw stripes, ringed spots, a flame-hemmed saddle, swirls.
import { mPart } from './_shared.js';
import { NONE, S, L, E, C } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';

export const M_MARKINGS = [
  NONE('markings', 0.3, 'm.'),
  mPart({ id: 'belly', slot: 'markings', name: 'Belly', tags: ['soft'], dom: 0.5, w: 3, extra: [S([[-54, 22], [-34, 14], [-8, 11], [18, 9], [36, 2], [50, -10], [56, -6], [56, 40], [-54, 40]], 's', { ns: true })] }),

  mPart({ id: 'saddle', slot: 'markings', name: 'Flame saddle', tags: ['dark'], dom: 0.5, w: 2, extra: [S([[-48, -40], [48, -40], [50, -14], [42, -2, 'c'], [32, -12], [24, 4, 'c'], [14, -8], [4, 6, 'c'], [-6, -8], [-16, 4, 'c'], [-26, -10], [-36, 0, 'c'], [-50, -14]], 'a', { ns: true, spline: { tension: 0.45 } })] }),
  mPart({ id: 'stripes', slot: 'markings', name: 'Claw stripes', tags: ['tiger'], dom: 0.5, w: 2, extra: [
    S([[-36, -40], [-18, -40], [-22, -20], [-30, -6, 'c'], [-24, 0], [-36, 12, 'c'], [-36, -4], [-40, -20]], 'a', { ns: true }),
    S([[-10, -40], [8, -40], [4, -18], [-4, -4, 'c'], [2, 2], [-10, 14, 'c'], [-10, -2], [-14, -20]], 'a', { ns: true }),
    S([[18, -40], [36, -40], [34, -20], [26, -8, 'c'], [32, -2], [20, 10, 'c'], [18, -4], [14, -20]], 'a', { ns: true }),
  ] }),
  mPart({ id: 'spots', slot: 'markings', name: 'Ringed spots', tags: ['fawn'], dom: 0.45, w: 2, extra: [
    ...[[-30, -14, 5], [-8, -20, 5.5], [16, -22, 5], [32, -10, 4.5], [-18, 2, 4.5], [6, -2, 5], [26, 8, 4]].flatMap(([x, y, r]) => [E(x, y, r * 1.15, r * 0.9, 's', { ns: true }), C(x + 0.5, y + 0.3, r * 0.5, 'a', { ns: true, op: 0.9 })]),
  ] }),
  mPart({ id: 'rings', slot: 'markings', name: 'Rings', tags: ['bands'], dom: 0.5, w: 1, extra: [
    S([[-30, -40], [-16, -40], [-14, 40], [-30, 40]], 'a', { ns: true }), S([[4, -40], [18, -40], [20, 40], [4, 40]], 'a', { ns: true }), S([[34, -40], [46, -40], [50, 40], [36, 40]], 'a', { ns: true }),
  ] }),
  mPart({ id: 'star', slot: 'markings', name: 'Chest star', tags: ['blaze'], dom: 0.45, w: 2, extra: [
    S([[30, -14], [34, -4], [44, -2], [36, 5], [38, 16], [30, 10], [22, 16], [24, 5], [16, -2], [26, -4]], 's', { ns: true, spline: { tension: 0.2 } }),
  ] }),
  mPart({ id: 'patches', slot: 'markings', name: 'Swirls', tags: ['spiral'], dom: 0.45, w: 2, extra: [
    L(spiralPath(-18, -10, 15, 1.7, 160), 'a', 4.2, { ns: true }),
    L(spiralPath(22, -4, 12, 1.6, -20), 'a', 3.6, { ns: true }),
    C(-34, 14, 3, 'a', { ns: true, op: 0.8 }), C(38, -24, 2.5, 'a', { ns: true, op: 0.8 }),
  ] }),
];
