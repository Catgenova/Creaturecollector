// Spirit auras (a light fitted behind the shroud, 100 x 60 frame) and veils (a pattern clipped to the shroud, same
// frame).
// Evolutions: auras spread; veils are flat.
import { spPart } from './_shared.js';
import { NONE, L, C, E, P, PATCH, spline, puff } from '../_dsl.js';
import { sparklePath, starPath } from '../_sigils.js';

const spAuraStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 72, 46, 'a', { ns: true, op: 0.1 })] } };
const spVeilLine = (d, w = 1.6) => L(d, 'a', w, { ns: true, cl: true, op: 0.8 });

export const SP_AURAS = [
  NONE('aura', 0.3, 's.'),
  spPart({ id: 'glow', slot: 'aura', name: 'Glow', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 62, 40, 'a', { ns: true, op: 0.14 }), E(0, 0, 52, 32, 'a', { ns: true, op: 0.14 })], stages: spAuraStages }),
  spPart({ id: 'motes', slot: 'aura', name: 'Motes', tags: ['dots'], dom: 0.5, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), ...[[-58, -20], [-50, 16], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38], [0, -50]].map(([x, y], i) => C(x, y, i % 2 ? 2 : 2.8, 'a', { ns: true, op: 0.7 }))], stages: spAuraStages }),
  spPart({ id: 'ring', slot: 'aura', name: 'Ring', tags: ['ring'], dom: 0.5, w: 2, extra: [E(0, 0, 46, 30, 'a', { ns: true, op: 0.12 }), E(0, 0, 58, 38, 'a', { ns: true, op: 0.12 }), E(0, 0, 66, 44, 'a', { ns: true, op: 0.1 })], stages: spAuraStages }),
  spPart({ id: 'mist', slot: 'aura', name: 'Mist', tags: ['soft'], dom: 0.5, w: 2, extra: [P(spline(puff(-20, 10, 30, 8, 8)), 'w', { ns: true, op: 0.12 }), P(spline(puff(24, -6, 26, 8, 7)), 'w', { ns: true, op: 0.12 }), P(spline(puff(0, 24, 34, 9, 8)), 'w', { ns: true, op: 0.1 })], stages: spAuraStages }),
  spPart({ id: 'sparks', slot: 'aura', name: 'Sparks', tags: ['fairy'], dom: 0.45, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), ...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [P(sparklePath(x, y, 5), 'a', { ns: true, op: 0.85 }), C(x, y, 1.6, 'w', { ns: true, op: 0.6 })])], stages: spAuraStages }),
  spPart({ id: 'halo', slot: 'aura', name: 'Halo', tags: ['crown'], dom: 0.5, w: 2, extra: [P('M-56,-6 C-40,-48 40,-48 56,-6 C40,-34 -40,-34 -56,-6 Z', 'a', { ns: true, op: 0.3 }), E(0, -6, 50, 30, 'a', { ns: true, op: 0.1 })], stages: spAuraStages }),
  spPart({ id: 'cold', slot: 'aura', name: 'Cold', tags: ['frost'], dom: 0.5, w: 2, extra: [E(0, 4, 60, 40, 'w', { ns: true, op: 0.1 }), ...[[-54, -16], [-44, 24], [-16, -44], [12, 42], [30, -40], [52, 20], [58, -10]].map(([x, y]) => P(starPath(x, y, 4, 1.6, 6), 'w', { ns: true, op: 0.6 }))], stages: spAuraStages }),
];

export const SP_VEILS = [
  NONE('veil', 0.3, 's.'),
  spPart({ id: 'stripes', slot: 'veil', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 3, extra: [PATCH('M-50,-30 C-20,-20 20,-40 50,-30 L50,-20 C20,-30 -20,-10 -50,-20 Z M-50,0 C-20,10 20,-10 50,0 L50,10 C20,0 -20,20 -50,10 Z', 's', { op: 0.7 })] }),
  spPart({ id: 'swirl', slot: 'veil', name: 'Swirl', tags: ['curl'], dom: 0.5, w: 2, extra: [spVeilLine('M-40,20 C-30,-10 -10,-20 10,-10 C26,-2 26,18 10,22 C-4,24 -10,10 2,4 C10,0 16,8 10,12', 1.8)] }),
  spPart({ id: 'runes', slot: 'veil', name: 'Runes', tags: ['glyph'], dom: 0.5, w: 2, extra: [spVeilLine('M-28,-14 L-28,6 M-34,-6 L-22,-6 M-6,-18 L4,-6 L-6,6 M14,-12 L14,10 M8,-2 L22,-2 M24,10 L32,20', 1.6)] }),
  spPart({ id: 'stars', slot: 'veil', name: 'Stars', tags: ['star'], dom: 0.5, w: 2, extra: [...[[-28, -12], [-8, 8], [12, -14], [28, 6], [-18, 20], [4, 24]].map(([x, y], i) => P(starPath(x, y, i % 2 ? 4 : 5.5, i % 2 ? 1.6 : 2.2, 5), 'a', { ns: true, cl: true, op: 0.85 }))] }),
  spPart({ id: 'drips', slot: 'veil', name: 'Drips', tags: ['drop'], dom: 0.5, w: 2, extra: [PATCH('M-50,-30 L50,-30 L50,-18 C40,-14 36,-2 30,-6 C26,-10 26,-18 20,-16 C14,-14 16,-2 8,-6 C2,-10 4,-18 -4,-16 C-10,-14 -8,0 -16,-4 C-22,-8 -20,-18 -28,-16 C-34,-14 -34,-4 -40,-8 C-44,-12 -46,-18 -50,-16 Z', 's', { op: 0.75 })] }),
  spPart({ id: 'ripples', slot: 'veil', name: 'Ripples', tags: ['wave'], dom: 0.5, w: 2, extra: [spVeilLine('M-46,-12 C-30,-20 -14,-4 2,-12 C18,-20 34,-4 48,-12 M-46,4 C-30,-4 -14,12 2,4 C18,-4 34,12 48,4 M-46,20 C-30,12 -14,28 2,20 C18,12 34,28 48,20', 1.4)] }),
  spPart({ id: 'spots', slot: 'veil', name: 'Spots', tags: ['spot'], dom: 0.5, w: 2, extra: [...[[-26, -12], [-8, 6], [10, -16], [24, 8], [-18, 20], [4, 24], [30, -22]].map(([x, y], i) => C(x, y, i % 2 ? 2.8 : 4, 's', { ns: true, cl: true, op: 0.8 }))] }),
];
