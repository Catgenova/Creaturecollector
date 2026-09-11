// Crystalline seams (glowing lines clipped to the body, 100 x 60 frame), facets (pale panes clipped to the body,
// same frame) and auras (a light fitted behind the body, same frame).
// Evolutions: seams and facets are flat; auras spread.
import { crPart } from './_shared.js';
import { NONE, L, C, E, P, PATCH } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';

const crAuraStages = { 2: { grow: [1.08, 1.08] }, 3: { grow: [1.06, 1.06], add: [E(0, 0, 74, 48, 'a', { ns: true, op: 0.1 })] } };
const crSeam = (d, w = 1.8) => L(d, 'a', w, { ns: true, cl: true, op: 0.9 });
const crPane = (d, op = 0.22) => PATCH(d, 'pl', { op: 0.35 + op });

export const CR_SEAMS = [
  NONE('seam', 0.3, 'c.'),
  crPart({ id: 'cracks', slot: 'seam', name: 'Cracks', tags: ['crack'], dom: 0.5, w: 3, extra: [crSeam('M-34,-12 L-24,-2 L-28,12 M-8,-24 L-2,-8 L-10,6 L-4,20 M18,-20 L14,-4 L26,8')] }),
  crPart({ id: 'veins', slot: 'seam', name: 'Veins', tags: ['vein'], dom: 0.5, w: 2, extra: [crSeam('M-44,6 C-30,-6 -16,10 0,-2 C14,-12 28,8 44,-4', 1.6), crSeam('M-24,-18 C-16,-10 -8,-16 0,-8 M10,16 C18,8 26,18 34,10', 1.2)] }),
  crPart({ id: 'rings', slot: 'seam', name: 'Rings', tags: ['ring'], dom: 0.5, w: 2, extra: [crSeam('M-30,-6 L-24,-14 L-16,-8 L-22,0 Z M4,2 L12,-8 L22,-2 L14,8 Z M-6,14 L0,8 L6,14 L0,20 Z', 1.4)] }),
  crPart({ id: 'bands', slot: 'seam', name: 'Bands', tags: ['band'], dom: 0.5, w: 2, extra: [crSeam('M-50,-10 L50,-14 M-50,4 L50,0 M-50,18 L50,14', 2)] }),
  crPart({ id: 'zigzag', slot: 'seam', name: 'Zigzag', tags: ['bolt'], dom: 0.5, w: 2, extra: [crSeam('M-46,-4 L-34,-14 L-24,2 L-12,-12 L-2,4 L10,-10 L20,6 L32,-8 L44,4', 1.8)] }),
  crPart({ id: 'dots', slot: 'seam', name: 'Dots', tags: ['dot'], dom: 0.5, w: 2, extra: [...[[-30, -6], [-16, 8], [-2, -10], [12, 6], [26, -8], [36, 8], [-38, 12], [6, 18]].map(([x, y], i) => C(x, y, i % 2 ? 2 : 2.8, 'a', { ns: true, cl: true, op: 0.9 }))] }),
  crPart({ id: 'lattice', slot: 'seam', name: 'Lattice', tags: ['grid'], dom: 0.5, w: 2, extra: [crSeam('M-50,-20 L50,20 M-50,0 L50,40 M-50,-40 L50,0 M50,-20 L-50,20 M50,-40 L-50,0 M50,0 L-50,40', 1.1)] }),
];

export const CR_FACETS = [
  NONE('facets', 0.3, 'c.'),
  crPart({ id: 'triangles', slot: 'facets', name: 'Triangles', tags: ['tri'], dom: 0.5, w: 3, extra: [crPane('M-40,-10 L-20,-26 L-12,-4 Z'), crPane('M-4,-28 L18,-22 L2,-6 Z', 0.16), crPane('M24,-10 L44,-16 L38,6 Z', 0.18)] }),
  crPart({ id: 'diamonds', slot: 'facets', name: 'Diamonds', tags: ['gem'], dom: 0.5, w: 2, extra: [crPane('M-28,-20 L-18,-8 L-28,4 L-38,-8 Z'), crPane('M2,-24 L12,-12 L2,0 L-8,-12 Z', 0.18), crPane('M30,-16 L40,-4 L30,8 L20,-4 Z', 0.16)] }),
  crPart({ id: 'hexes', slot: 'facets', name: 'Hexes', tags: ['hex'], dom: 0.5, w: 2, extra: [crPane('M-30,-18 L-20,-18 L-15,-9 L-20,0 L-30,0 L-35,-9 Z'), crPane('M-2,-22 L8,-22 L13,-13 L8,-4 L-2,-4 L-7,-13 Z', 0.16), crPane('M26,-14 L36,-14 L41,-5 L36,4 L26,4 L21,-5 Z', 0.18), L('M-15,-9 L-7,-13 M13,-13 L21,-5', 'k', 1, { ns: true, cl: true, op: 0.25 })] }),
  crPart({ id: 'stripes', slot: 'facets', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 2, extra: [crPane('M-40,-30 L-30,-30 L-10,30 L-20,30 Z', 0.16), crPane('M-10,-30 L0,-30 L20,30 L10,30 Z', 0.2), crPane('M20,-30 L30,-30 L50,30 L40,30 Z', 0.14)] }),
  crPart({ id: 'shards', slot: 'facets', name: 'Shards', tags: ['sharp'], dom: 0.5, w: 2, extra: [crPane('M-44,4 L-30,-24 L-22,-6 L-34,10 Z'), crPane('M-8,-30 L4,-20 L-2,6 L-12,-4 Z', 0.16), crPane('M22,-26 L40,-18 L34,4 L18,-8 Z', 0.18), L('M-30,-24 L-34,10 M4,-20 L-12,-4', 'k', 1, { ns: true, cl: true, op: 0.22 })] }),
  crPart({ id: 'panes', slot: 'facets', name: 'Panes', tags: ['pane'], dom: 0.5, w: 2, extra: [crPane('M-50,-30 L-10,-30 L-20,-6 L-50,-2 Z', 0.16), crPane('M-4,-30 L30,-30 L36,-10 L-8,-4 Z', 0.12), L('M-20,-6 L-8,-4 M-10,-30 L-4,-30', 'k', 1, { ns: true, cl: true, op: 0.22 })] }),
  crPart({ id: 'mosaic', slot: 'facets', name: 'Mosaic', tags: ['tile'], dom: 0.5, w: 2, extra: [crPane('M-38,-20 L-26,-24 L-22,-12 L-34,-8 Z', 0.2), crPane('M-20,-26 L-6,-28 L-4,-14 L-18,-12 Z', 0.14), crPane('M-32,-6 L-20,-10 L-16,4 L-28,8 Z', 0.16), crPane('M0,-24 L14,-24 L16,-10 L2,-8 Z', 0.18), crPane('M18,-16 L32,-20 L36,-6 L22,-2 Z', 0.14), crPane('M-12,-8 L2,-6 L0,8 L-14,6 Z', 0.12)] }),
];

export const CR_AURAS = [
  NONE('aura', 0.3, 'c.'),
  crPart({ id: 'glow', slot: 'aura', name: 'Glow', tags: ['light'], dom: 0.5, w: 3, extra: [E(0, 0, 62, 40, 'a', { ns: true, op: 0.14 }), E(0, 0, 52, 32, 'a', { ns: true, op: 0.14 })], stages: crAuraStages }),
  crPart({ id: 'sparkles', slot: 'aura', name: 'Sparkles', tags: ['fairy'], dom: 0.45, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), ...[[-58, -22], [-50, 14], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38]].flatMap(([x, y]) => [P(sparklePath(x, y, 5), 'a', { ns: true, op: 0.85 }), C(x, y, 1.6, 'w', { ns: true, op: 0.6 })])], stages: crAuraStages }),
  crPart({ id: 'motes', slot: 'aura', name: 'Motes', tags: ['dots'], dom: 0.5, w: 2, extra: [E(0, 0, 52, 34, 'a', { ns: true, op: 0.1 }), ...[[-58, -20], [-50, 16], [56, -18], [58, 16], [-10, -42], [22, -40], [-30, 40], [30, 38], [0, -50]].map(([x, y], i) => C(x, y, i % 2 ? 2 : 2.8, 'a', { ns: true, op: 0.7 }))], stages: crAuraStages }),
  crPart({ id: 'ring', slot: 'aura', name: 'Ring', tags: ['ring'], dom: 0.5, w: 2, extra: [E(0, 0, 48, 30, 'a', { ns: true, op: 0.12 }), E(0, 0, 58, 37, 'a', { ns: true, op: 0.12 }), E(0, 0, 66, 42, 'a', { ns: true, op: 0.1 })], stages: crAuraStages }),
  crPart({ id: 'shards', slot: 'aura', name: 'Floating shards', tags: ['shard'], dom: 0.5, w: 2, extra: [E(0, 0, 50, 32, 'a', { ns: true, op: 0.1 }), P('M-60,-12 L-54,-26 L-48,-12 Z M50,-24 L58,-34 L62,-20 Z M-48,26 L-40,16 L-36,30 Z M44,22 L54,14 L56,28 Z M-6,-46 L0,-58 L6,-46 Z', 'a', { ns: true, op: 0.85 }), P('M-57,-14 L-54,-22 L-52,-14 Z M53,-24 L58,-30 L59,-22 Z', 'w', { ns: true, op: 0.5 })], stages: crAuraStages }),
  crPart({ id: 'halo', slot: 'aura', name: 'Halo', tags: ['crown'], dom: 0.5, w: 2, extra: [P('M-56,-6 C-40,-48 40,-48 56,-6 C40,-34 -40,-34 -56,-6 Z', 'a', { ns: true, op: 0.3 }), E(0, -6, 50, 30, 'a', { ns: true, op: 0.1 })], stages: crAuraStages }),
  crPart({ id: 'haze', slot: 'aura', name: 'Haze', tags: ['soft'], dom: 0.5, w: 2, extra: [E(0, 4, 70, 44, 'a', { ns: true, op: 0.1 }), E(-10, 0, 40, 30, 'a', { ns: true, op: 0.1 }), E(14, 2, 40, 28, 'a', { ns: true, op: 0.1 })], stages: crAuraStages }),
];
