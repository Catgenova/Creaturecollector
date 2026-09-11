// Draconic chest markings, clipped to the body (100 x 60 frame). Flat: they do not grow.
import { drPart } from './_shared.js';
import { NONE, L, C, E, P } from '../_dsl.js';
import { diamondPath } from '../_sigils.js';

const drFlat = { 2: {}, 3: {} };

export const DR_CHEST = [
  NONE('chest', 0.3, 'd.'),
  drPart({ id: 'plates', slot: 'chest', name: 'Belly plates', tags: ['belly'], dom: 0.5, w: 3, extra: [P('M-50,8 C-25,16 25,16 50,8 L50,30 L-50,30 Z', 'w', { ns: true, op: 0.3 }), L('M-40,18 L40,18 M-44,13 L44,13 M-36,23 L36,23', 'k', 0.8, { op: 0.16 })], stages: drFlat }),
  drPart({ id: 'scales', slot: 'chest', name: 'Scales', tags: ['scale'], dom: 0.5, w: 2, extra: [L([-22, -10, 2, 14, 26].map((y) => `M-50,${y} ${[-40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((x) => `A5,5 0 0 0 ${x},${y}`).join(' ')}`).join(' '), 'k', 0.9, { op: 0.22 })], stages: drFlat }),
  drPart({ id: 'gem', slot: 'chest', name: 'Chest gem', tags: ['gem'], dom: 0.5, w: 2, extra: [P(diamondPath(4, 6, 16, 22), 'a', { ns: true, op: 0.95 }), P('M-2,-1 L4,-5 L2,2 Z', 'w', { ns: true, op: 0.7 }), L('M-4,6 L12,6', 'w', 0.8, { op: 0.4 })], stages: drFlat }),
  drPart({ id: 'stripes', slot: 'chest', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 2, extra: [L('M-36,-30 L-30,30 M-18,-30 L-12,30 M0,-30 L6,30 M18,-30 L24,30 M36,-30 L42,30', 'k', 3, { op: 0.18 })], stages: drFlat }),
  drPart({ id: 'spots', slot: 'chest', name: 'Spots', tags: ['dots'], dom: 0.5, w: 2, extra: [...[[-36, -8], [-24, 6], [-14, -14], [0, 2], [12, -12], [24, 8], [36, -4], [-6, 14], [18, -24], [-30, -22]].map(([x, y], i) => C(x, y, i % 3 ? 2.6 : 3.6, 'ad', { ns: true, op: 0.55 }))], stages: drFlat }),
  drPart({ id: 'cracks', slot: 'chest', name: 'Molten cracks', tags: ['glow'], dom: 0.5, w: 2, extra: [L('M-34,-10 L-24,0 L-28,14 M-10,-20 L-4,-6 L-12,8 L-6,22 M12,-16 L8,-2 L18,10 M30,-8 L24,4 L34,14', 'a', 2, { op: 0.9 }), L('M-34,-10 L-24,0 L-28,14 M-10,-20 L-4,-6 L-12,8 L-6,22 M12,-16 L8,-2 L18,10', 'w', 0.7, { op: 0.6 })], stages: drFlat }),
  drPart({ id: 'dorsal', slot: 'chest', name: 'Dorsal wash', tags: ['dark'], dom: 0.5, w: 2, extra: [P('M-50,-30 L50,-30 L50,-10 C25,-2 -25,-2 -50,-10 Z', 'k', { ns: true, op: 0.16 }), L('M-44,-6 L44,-6', 'w', 0.8, { op: 0.2 })], stages: drFlat }),
];
