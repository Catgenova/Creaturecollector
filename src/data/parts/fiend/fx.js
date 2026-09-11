// Fiend marks (a pattern clipped to the torso, 100 x 60 frame) and auras (a light fitted behind the body, same
// frame).
// Evolutions: marks are flat; auras spread.
import { fdPart } from './_shared.js';
import { NONE, L, C, E, P, PATCH } from '../_dsl.js';
import { flamePath, starPath } from '../_sigils.js';

const fdAuraStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 72, 46, 'a', { ns: true, op: 0.1 })] } };
const fdMark = (d, w = 1.8) => L(d, 'a', w, { ns: true, cl: true, op: 0.9 });

export const FD_MARKS = [
  NONE('marks', 0.3, 'e.'),
  fdPart({ id: 'runes', slot: 'marks', name: 'Runes', tags: ['glyph'], dom: 0.5, w: 3, extra: [fdMark('M-24,-14 L-24,6 M-30,-6 L-18,-6 M-4,-16 L6,-4 L-4,8 M14,-12 L14,10 M8,-2 L22,-2 M24,10 L32,20', 1.6)] }),
  fdPart({ id: 'stripes', slot: 'marks', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 2, extra: [PATCH('M-50,-20 C-20,-10 20,-30 50,-20 L50,-12 C20,-22 -20,-2 -50,-12 Z M-50,2 C-20,12 20,-8 50,2 L50,10 C20,0 -20,20 -50,10 Z', 's', { op: 0.8 })] }),
  fdPart({ id: 'cracks', slot: 'marks', name: 'Ember cracks', tags: ['fire'], dom: 0.5, w: 2, extra: [fdMark('M-30,-20 L-22,-8 L-28,6 L-20,20 M-4,-26 L2,-12 L-6,2 L0,16 M20,-20 L16,-6 L26,8 L22,22', 1.6), C(-22, -8, 2, 'a', { ns: true, cl: true, op: 0.6 }), C(2, -12, 2, 'a', { ns: true, cl: true, op: 0.6 })] }),
  fdPart({ id: 'sigil', slot: 'marks', name: 'Sigil', tags: ['star'], dom: 0.5, w: 2, extra: [L(starPath(0, -4, 20, 8, 5), 'a', 1.8, { ns: true, cl: true, op: 0.9 }), C(0, -4, 24, 'a', { ns: true, cl: true, op: 0.16 })] }),
  fdPart({ id: 'scars', slot: 'marks', name: 'Scars', tags: ['cut'], dom: 0.5, w: 2, extra: [L('M-24,-18 L6,10 M-16,-4 L-14,2 M-10,2 L-8,8 M10,-16 L24,4 M14,-8 L18,-10', 'k', 1.8, { ns: true, cl: true, op: 0.45 }), L('M-24,-18 L6,10 M10,-16 L24,4', 'pl', 1, { ns: true, cl: true, op: 0.6 })] }),
  fdPart({ id: 'spots', slot: 'marks', name: 'Spots', tags: ['spot'], dom: 0.5, w: 2, extra: [...[[-26, -12], [-10, 4], [8, -14], [22, 6], [-18, 18], [2, 22], [30, -20]].map(([x, y], i) => C(x, y, i % 2 ? 2.6 : 3.6, 's', { ns: true, cl: true, op: 0.8 }))] }),
  fdPart({ id: 'glow', slot: 'marks', name: 'Chest glow', tags: ['light'], dom: 0.5, w: 2, extra: [C(2, -6, 18, 'a', { ns: true, cl: true, op: 0.22 }), P(flamePath(2, -6, 10), 'a', { ns: true, cl: true, op: 0.9 }), P(flamePath(2, -4, 5), 'w', { ns: true, cl: true, op: 0.7 })] }),
];

export const FD_AURAS = [
  NONE('aura', 0.3, 'e.'),
  fdPart({ id: 'flames', slot: 'aura', name: 'Flames', tags: ['fire'], dom: 0.5, w: 3, extra: [E(0, 4, 60, 40, 'a', { ns: true, op: 0.12 }), P(flamePath(-44, -10, 16), 'a', { ns: true, op: 0.4 }), P(flamePath(44, -6, 14), 'a', { ns: true, op: 0.4 }), P(flamePath(-16, -36, 14), 'a', { ns: true, op: 0.4 }), P(flamePath(20, -34, 12), 'a', { ns: true, op: 0.4 })], stages: fdAuraStages }),
  fdPart({ id: 'smoke', slot: 'aura', name: 'Smoke', tags: ['soft'], dom: 0.5, w: 2, extra: [E(-10, -20, 30, 22, 'k', { ns: true, op: 0.16 }), E(16, -30, 24, 18, 'k', { ns: true, op: 0.14 }), E(0, 4, 56, 36, 'k', { ns: true, op: 0.1 })], stages: fdAuraStages }),
  fdPart({ id: 'sparks', slot: 'aura', name: 'Sparks', tags: ['dots'], dom: 0.5, w: 2, extra: [E(0, 0, 50, 34, 'a', { ns: true, op: 0.1 }), ...[[-56, -18], [-46, 22], [-18, -40], [8, 40], [26, -42], [50, 24], [58, -12], [-4, -48]].map(([x, y], i) => C(x, y, i % 2 ? 1.8 : 2.6, 'a', { ns: true, op: 0.75 }))], stages: fdAuraStages }),
  fdPart({ id: 'halo', slot: 'aura', name: 'Dark halo', tags: ['ring'], dom: 0.5, w: 2, extra: [E(0, -34, 26, 8, 'k', { ns: true, op: 0.35 }), E(0, -34, 20, 5, 'a', { ns: true, op: 0.6 }), E(0, 0, 48, 34, 'a', { ns: true, op: 0.1 })], stages: fdAuraStages }),
  fdPart({ id: 'embers', slot: 'aura', name: 'Embers', tags: ['fire'], dom: 0.5, w: 2, extra: [E(0, 6, 54, 36, 'a', { ns: true, op: 0.12 }), ...[[-50, 10], [-40, -20], [-20, -36], [10, -42], [34, -30], [52, -4], [46, 18], [-30, 30]].flatMap(([x, y], i) => [P(flamePath(x, y, i % 2 ? 4 : 5.5), 'a', { ns: true, op: 0.7 })])], stages: fdAuraStages }),
  fdPart({ id: 'haze', slot: 'aura', name: 'Haze', tags: ['soft'], dom: 0.5, w: 2, extra: [E(0, 4, 66, 44, 'a', { ns: true, op: 0.1 }), E(-10, 0, 40, 30, 'a', { ns: true, op: 0.1 }), E(14, 2, 40, 28, 'a', { ns: true, op: 0.1 })], stages: fdAuraStages }),
  fdPart({ id: 'ring', slot: 'aura', name: 'Ring', tags: ['ring'], dom: 0.5, w: 2, extra: [E(0, 0, 46, 30, 'a', { ns: true, op: 0.12 }), E(0, 0, 58, 38, 'a', { ns: true, op: 0.12 }), E(0, 0, 66, 44, 'a', { ns: true, op: 0.1 })], stages: fdAuraStages }),
];
