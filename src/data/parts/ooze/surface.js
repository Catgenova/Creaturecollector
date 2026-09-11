// Ooze inclusions (things swallowed and suspended in the jelly, clipped to the body, 100 x 60 frame),
// sheen (surface light, clipped to the body) and bumps (nodules that break the outline at the upper back).
// Evolutions: inclusions and sheen are flat; bumps grow.
import { ozPart } from './_shared.js';
import { NONE, L, C, E, P, spline, arcPts, leaf, puff } from '../_dsl.js';
import { diamondPath, sparklePath } from '../_sigils.js';

const ozBumpStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.1, 1.1], add: [C(-12, 2, 2.2, 'pd', { sw: 1 }), C(16, 1, 1.8, 'pd', { sw: 1 })] } };
const ozRing = (rx, ry) => L(spline(arcPts(0, 0, rx, ry, 0, 330, 11)), 'w', 1.4, { ns: true, op: 0.3 });

export const OZ_INCLUSIONS = [
  NONE('inclusions', 0.3, 'o.'),
  ozPart({ id: 'bubbles', slot: 'inclusions', name: 'Bubbles', tags: ['bubble'], dom: 0.5, w: 3, extra: [C(-24, -8, 5, 'pl', { ns: true, op: 0.85 }), C(-10, 10, 3.5, 'pl', { ns: true, op: 0.85 }), C(12, -12, 4, 'pl', { ns: true, op: 0.85 }), C(26, 6, 6, 'pl', { ns: true, op: 0.85 }), C(4, 18, 2.5, 'pl', { ns: true, op: 0.85 }), C(-25.6, -9.6, 1.2, 'w', { ns: true, op: 0.8 }), C(10.8, -13.4, 1, 'w', { ns: true, op: 0.8 }), C(24, 4, 1.4, 'w', { ns: true, op: 0.8 })] }),
  ozPart({ id: 'bones', slot: 'inclusions', name: 'Bones', tags: ['bone'], dom: 0.5, w: 2, extra: [L('M-30,-6 L-12,-14 M8,8 L26,2', 'w', 3.2, { ns: true, op: 0.9 }), C(-30, -6, 2.4, 'w', { ns: true, op: 0.9 }), C(-12, -14, 2.4, 'w', { ns: true, op: 0.9 }), C(8, 8, 2.2, 'w', { ns: true, op: 0.9 }), C(26, 2, 2.2, 'w', { ns: true, op: 0.9 }), C(18, -14, 1.6, 'w', { ns: true, op: 0.7 })] }),
  ozPart({ id: 'coins', slot: 'inclusions', name: 'Coins', tags: ['gold'], dom: 0.5, w: 2, extra: [...[[-22, 4], [-6, -10], [10, 12], [24, -4]].flatMap(([x, y]) => [C(x, y, 4, 'a', { ns: true }), C(x, y, 2.4, 'ad', { ns: true, op: 0.5 }), C(x - 1.4, y - 1.4, 0.8, 'w', { ns: true, op: 0.8 })])] }),
  ozPart({ id: 'skull', slot: 'inclusions', name: 'Skull', tags: ['bone'], dom: 0.5, w: 2, extra: [C(0, -4, 9, 'w', { ns: true }), P('M-6,2 L6,2 L4,8 L-4,8 Z', 'w', { ns: true }), C(-3.4, -4.5, 2.6, 'k', { ns: true, op: 0.85 }), C(3.4, -4.5, 2.6, 'k', { ns: true, op: 0.85 }), P('M0,-1 L-1.4,1.6 L1.4,1.6 Z', 'k', { ns: true, op: 0.7 }), L('M-2,4 L-2,7 M0,4 L0,7 M2,4 L2,7', 'k', 1, { op: 0.6 })] }),
  ozPart({ id: 'shards', slot: 'inclusions', name: 'Shards', tags: ['crystal'], dom: 0.5, w: 2, extra: [P(diamondPath(-20, -4, 6, 14), 'al', { ns: true, op: 0.9 }), P(diamondPath(-4, 10, 5, 12), 'al', { ns: true, op: 0.9 }), P(diamondPath(14, -10, 6, 16), 'al', { ns: true, op: 0.9 }), P(diamondPath(26, 8, 4, 10), 'al', { ns: true, op: 0.9 }), L('M-20,-10 L-20,2 M14,-16 L14,-4', 'w', 0.9, { op: 0.5 })] }),
  ozPart({ id: 'leaves', slot: 'inclusions', name: 'Leaves', tags: ['leaf'], dom: 0.5, w: 2, extra: [P(leaf([-28, 6], [-12, -6], 4), 'a', { ns: true }), P(leaf([6, 14], [22, 4], 4), 'a', { ns: true }), P(leaf([10, -14], [26, -8], 3.5), 'a', { ns: true }), L('M-26,5 L-14,-5 M8,13 L20,5 M12,-13 L24,-9', 'k', 0.9, { op: 0.3 })] }),
  ozPart({ id: 'pebbles', slot: 'inclusions', name: 'Pebbles', tags: ['stone'], dom: 0.5, w: 2, extra: [E(-24, 8, 5, 3.5, 'sd', { ns: true }), E(-8, -8, 4, 3, 'sd', { ns: true }), E(10, 10, 6, 4, 'sd', { ns: true }), E(26, -4, 4, 3, 'sd', { ns: true }), E(20, 14, 3, 2, 'sd', { ns: true }), C(-25.6, 6.8, 1, 'w', { ns: true, op: 0.5 }), C(8.4, 8.6, 1.2, 'w', { ns: true, op: 0.5 })] }),
];

export const OZ_SHEEN = [
  NONE('sheen', 0.3, 'o.'),
  ozPart({ id: 'gloss', slot: 'sheen', name: 'Gloss', tags: ['shine'], dom: 0.5, w: 3, extra: [P('M-34,-16 C-28,-26 -12,-28 -2,-22 C-12,-20 -22,-14 -30,-4 Z', 'w', { ns: true, op: 0.3 }), C(-6, -20, 3, 'w', { ns: true, op: 0.5 })] }),
  ozPart({ id: 'bands', slot: 'sheen', name: 'Light bands', tags: ['stripe'], dom: 0.5, w: 2, extra: [P('M-40,10 L-10,-30 L0,-30 L-30,10 Z', 'w', { ns: true, op: 0.2 }), P('M-16,20 L20,-28 L28,-28 L-8,20 Z', 'w', { ns: true, op: 0.14 })] }),
  ozPart({ id: 'rings', slot: 'sheen', name: 'Rings', tags: ['ring'], dom: 0.5, w: 2, extra: [ozRing(14, 9), ozRing(26, 16), ozRing(38, 23)] }),
  ozPart({ id: 'sparkle', slot: 'sheen', name: 'Sparkle', tags: ['glitter'], dom: 0.5, w: 2, extra: [P(sparklePath(-20, -10, 4), 'w', { ns: true, op: 0.9 }), P(sparklePath(10, -16, 3), 'w', { ns: true, op: 0.9 }), P(sparklePath(24, 4, 3.5), 'w', { ns: true, op: 0.9 }), P(sparklePath(-6, 12, 2.5), 'w', { ns: true, op: 0.9 }), C(-30, 8, 1, 'w', { ns: true, op: 0.7 }), C(30, -12, 1, 'w', { ns: true, op: 0.7 })] }),
  ozPart({ id: 'wave', slot: 'sheen', name: 'Wave', tags: ['band'], dom: 0.5, w: 2, extra: [P('M-44,-4 C-30,-14 -16,6 0,-4 C16,-14 30,6 44,-4 L44,2 C30,12 16,-8 0,2 C-16,12 -30,-8 -44,2 Z', 'w', { ns: true, op: 0.22 })] }),
  ozPart({ id: 'dapple', slot: 'sheen', name: 'Dapple', tags: ['spots'], dom: 0.5, w: 2, extra: [C(-22, -8, 7, 'w', { ns: true, op: 0.22 }), C(0, -14, 5, 'w', { ns: true, op: 0.22 }), C(18, -2, 8, 'w', { ns: true, op: 0.2 }), C(-6, 10, 4, 'w', { ns: true, op: 0.22 }), C(26, 14, 5, 'w', { ns: true, op: 0.2 })] }),
  ozPart({ id: 'crackle', slot: 'sheen', name: 'Crackle', tags: ['crack'], dom: 0.5, w: 2, extra: [L('M-30,-14 L-18,-4 L-22,10 M-4,-24 L2,-8 L-6,6 L0,20 M20,-18 L14,-4 L26,8', 'w', 1.2, { ns: true, op: 0.5 })] }),
];

export const OZ_BUMPS = [
  NONE('bumps', 0.3, 'o.'),
  ozPart({ id: 'warts', slot: 'bumps', name: 'Warts', tags: ['wart'], dom: 0.5, w: 3, extra: [C(-6, -2, 3.2, 'pd', { sw: 1.1 }), C(3, -6, 2.6, 'pd', { sw: 1.1 }), C(9, 1, 2.2, 'pd', { sw: 1.1 }), C(-1, 4, 2, 'pd', { sw: 1.1 })], stages: ozBumpStages }),
  ozPart({ id: 'blisters', slot: 'bumps', name: 'Blisters', tags: ['bubble'], dom: 0.5, w: 2, extra: [C(-6, -3, 4, 'pl', { sw: 1.1 }), C(4, -6, 3, 'pl', { sw: 1.1 }), C(10, 1, 3.5, 'pl', { sw: 1.1 }), C(-7.4, -4.4, 1.1, 'w', { ns: true, op: 0.8 }), C(3, -7, 0.9, 'w', { ns: true, op: 0.8 }), C(8.8, -0.2, 1, 'w', { ns: true, op: 0.8 })], stages: ozBumpStages }),
  ozPart({ id: 'crystals', slot: 'bumps', name: 'Crystals', tags: ['crystal'], dom: 0.5, w: 2, extra: [P(diamondPath(-6, -4, 6, 14), 'a', { sw: 1.2 }), P(diamondPath(4, -8, 5, 16), 'a', { sw: 1.2 }), P(diamondPath(12, -2, 4, 10), 'a', { sw: 1.2 }), L('M-6,-10 L-6,2 M4,-15 L4,-1', 'w', 0.9, { op: 0.45 })], stages: ozBumpStages }),
  ozPart({ id: 'nubs', slot: 'bumps', name: 'Nubs', tags: ['spiky'], dom: 0.5, w: 2, extra: [P('M-10,2 L-6,-10 L-2,2 Z', 'p', { sw: 1.2 }), P('M0,0 L5,-12 L10,0 Z', 'p', { sw: 1.2 }), P('M12,3 L15,-6 L18,3 Z', 'p', { sw: 1.2 }), C(-6.6, -5, 0.8, 'w', { ns: true, op: 0.6 }), C(4.4, -7, 0.8, 'w', { ns: true, op: 0.6 })], stages: ozBumpStages }),
  ozPart({ id: 'eyespots', slot: 'bumps', name: 'Eyespots', tags: ['spots'], dom: 0.5, w: 2, extra: [C(-6, -2, 3.6, 'a', { sw: 1.1 }), C(-6, -2, 1.6, 'k', { ns: true }), C(6, -4, 3, 'a', { sw: 1.1 }), C(6, -4, 1.3, 'k', { ns: true }), C(-6.8, -2.8, 0.6, 'w', { ns: true, op: 0.8 }), C(5.4, -4.6, 0.5, 'w', { ns: true, op: 0.8 })], stages: ozBumpStages }),
  ozPart({ id: 'lobes', slot: 'bumps', name: 'Lobes', tags: ['lump'], dom: 0.5, w: 2, shapes: [{ pts: puff(-6, -4, 7, 7, 1.2), f: 'p' }, { pts: puff(8, -2, 5.5, 6, 1), f: 'p' }], extra: [C(-8, -6, 1.2, 'w', { ns: true, op: 0.5 }), C(6.6, -3.6, 1, 'w', { ns: true, op: 0.5 })], stages: ozBumpStages }),
  ozPart({ id: 'barnacles', slot: 'bumps', name: 'Barnacles', tags: ['shell'], dom: 0.5, w: 2, extra: [P('M-10,2 L-5,-8 L0,2 Z', 'sd', { sw: 1.1 }), C(-5, -2, 1.4, 'k', { ns: true, op: 0.6 }), P('M2,3 L7,-9 L12,3 Z', 'sd', { sw: 1.1 }), C(7, -3, 1.4, 'k', { ns: true, op: 0.6 }), P('M13,1 L16,-5 L19,1 Z', 'sd', { sw: 1 }), C(16, -1.6, 1, 'k', { ns: true, op: 0.6 })], stages: ozBumpStages }),
];
