// Crystalline spines (crystal clusters on the back, behind the body at the spines socket) and crowns (on the
// brow, behind the head).
// Evolutions: both grow.
import { crPart } from './_shared.js';
import { NONE, L, C } from '../_dsl.js';

const crGrowCrest = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };
/** A crystal spike standing on (x, y), w wide at the base and h tall, leaning by lean. */
const crSpike = (x, y, w, h, lean = 0, f = 'a') => ({ pts: [[x - w / 2, y, 'c'], [x + lean, y - h, 'c'], [x + w / 2, y, 'c']], f });
const crGleam = (x, y, h) => L(`M${x - 1},${y - 2} L${x - 0.5},${y - h * 0.7}`, 'w', 1, { ns: true, op: 0.5 });

export const CR_SPINES = [
  NONE('spines', 0.3, 'c.'),
  crPart({ id: 'cluster', slot: 'spines', name: 'Cluster', tags: ['spiky'], dom: 0.5, w: 3, shapes: [crSpike(-10, 2, 8, 14, -2), crSpike(0, 2, 10, 22, 1), crSpike(10, 2, 8, 12, 3)], extra: [crGleam(0, 2, 22), crGleam(-10, 2, 14)], stages: crGrowCrest }),
  crPart({ id: 'ridge', slot: 'spines', name: 'Ridge', tags: ['row'], dom: 0.5, w: 2, shapes: [crSpike(-16, 2, 8, 8), crSpike(-8, 2, 8, 12), crSpike(0, 2, 8, 14), crSpike(8, 2, 8, 12), crSpike(16, 2, 8, 8)], extra: [crGleam(0, 2, 14)], stages: crGrowCrest }),
  crPart({ id: 'single', slot: 'spines', name: 'Single spire', tags: ['tall'], dom: 0.5, w: 2, shapes: [crSpike(0, 2, 10, 28, -3)], extra: [crGleam(-1, 2, 28), L('M-4,-4 L3,-6', 'k', 0.9, { op: 0.3 })], stages: crGrowCrest }),
  crPart({ id: 'twin', slot: 'spines', name: 'Twin', tags: ['two'], dom: 0.5, w: 2, shapes: [crSpike(-7, 2, 9, 20, -4), crSpike(7, 2, 9, 18, 4)], extra: [crGleam(-7, 2, 20), crGleam(7, 2, 18)], stages: crGrowCrest }),
  crPart({ id: 'fan', slot: 'spines', name: 'Fan', tags: ['fan'], dom: 0.5, w: 2, shapes: [crSpike(-12, 2, 7, 14, -8), crSpike(-5, 2, 7, 18, -3), crSpike(3, 2, 7, 18, 3), crSpike(11, 2, 7, 14, 8)], extra: [crGleam(-5, 2, 18)], stages: crGrowCrest }),
  crPart({ id: 'tall', slot: 'spines', name: 'Tall', tags: ['big'], dom: 0.55, w: 2, shapes: [crSpike(-6, 2, 10, 24, -6), crSpike(4, 2, 12, 34, 2)], extra: [crGleam(4, 2, 34), crGleam(-6, 2, 24)], stages: crGrowCrest }),
  crPart({ id: 'low', slot: 'spines', name: 'Low', tags: ['small'], dom: 0.5, w: 2, shapes: [crSpike(-8, 2, 8, 7, -1), crSpike(1, 2, 8, 9, 1), crSpike(9, 2, 7, 6, 2)], extra: [crGleam(1, 2, 9)], stages: crGrowCrest }),
];

export const CR_CROWNS = [
  NONE('crown', 0.3, 'c.'),
  crPart({ id: 'points', slot: 'crown', name: 'Points', tags: ['three'], dom: 0.5, w: 3, shapes: [crSpike(-7, 2, 6, 10, -2), crSpike(0, 2, 7, 14), crSpike(7, 2, 6, 10, 2)], extra: [crGleam(0, 2, 14)], stages: crGrowCrest }),
  crPart({ id: 'spire', slot: 'crown', name: 'Spire', tags: ['tall'], dom: 0.5, w: 2, shapes: [crSpike(0, 2, 8, 22, -2)], extra: [crGleam(0, 2, 22), L('M-3,-4 L2,-6', 'k', 0.9, { op: 0.3 })], stages: crGrowCrest }),
  crPart({ id: 'halo', slot: 'crown', name: 'Halo', tags: ['ring'], dom: 0.5, w: 2, shapes: [crSpike(-12, -2, 4, 6, -3), crSpike(-6, -6, 4, 7, -1), crSpike(0, -8, 4, 8), crSpike(6, -6, 4, 7, 1), crSpike(12, -2, 4, 6, 3)], extra: [L('M-12,-2 C-8,-8 8,-8 12,-2', 'a', 1.2, { op: 0.6 })], stages: crGrowCrest }),
  crPart({ id: 'tiara', slot: 'crown', name: 'Tiara', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 2, 'c'], [-8, -3, 'c'], [-4, -1, 'c'], [0, -8, 'c'], [4, -1, 'c'], [8, -3, 'c'], [10, 2, 'c']], f: 'a' }], extra: [C(0, -2, 1.2, 'w', { ns: true, op: 0.8 }), C(-6, 0, 0.8, 'w', { ns: true, op: 0.7 }), C(6, 0, 0.8, 'w', { ns: true, op: 0.7 })], stages: crGrowCrest }),
  crPart({ id: 'twin', slot: 'crown', name: 'Twin horns', tags: ['horn'], dom: 0.5, w: 2, shapes: [crSpike(-7, 2, 7, 16, -6), crSpike(7, 2, 7, 16, 6)], extra: [crGleam(-7, 2, 16), crGleam(7, 2, 16)], stages: crGrowCrest }),
  crPart({ id: 'cluster', slot: 'crown', name: 'Cluster', tags: ['spiky'], dom: 0.5, w: 2, shapes: [crSpike(-8, 2, 6, 8, -3), crSpike(-3, 2, 6, 14, -1), crSpike(3, 2, 6, 11, 2), crSpike(8, 2, 5, 7, 3)], extra: [crGleam(-3, 2, 14)], stages: crGrowCrest }),
  crPart({ id: 'antler', slot: 'crown', name: 'Crystal antlers', tags: ['branch'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, 2, 'c'], [-8, -8, 'c'], [-14, -12, 'c'], [-9, -10, 'c'], [-10, -20, 'c'], [-6, -9, 'c'], [-1, 1, 'c']], f: 'a' }, { pts: [[1, 1, 'c'], [6, -9, 'c'], [10, -20, 'c'], [9, -10, 'c'], [14, -12, 'c'], [8, -8, 'c'], [4, 2, 'c']], f: 'a' }], extra: [L('M-6,-4 L-9,-14 M6,-4 L9,-14', 'w', 0.9, { ns: true, op: 0.4 })], stages: crGrowCrest }),
];
