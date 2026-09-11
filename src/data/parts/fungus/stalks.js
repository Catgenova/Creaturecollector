// Fungus stalks (the head slot). Origin = the top centre, where the stalk meets the cap; the stalk hangs down
// from there. Sockets: eye / eyeFar and mouth on the front, ring (high), shelf (the side), root / rootFar (bottom).
// Evolutions: stage 2 thickens; stage 3 bands the stalk like an old trunk.
import { fgPart } from './_shared.js';
import { L, C, HL, tube } from '../_dsl.js';
import { evoBands, evoRing } from '../_evo.js';

const fgStalkStages = (bandY) => ({
  2: { grow: [1.04, 1.06] },
  3: { grow: [1.06, 1.1], add: [...evoBands(bandY, 2, 2.2, 6), evoRing(0, bandY - 5, 4, 'a', 1, { op: 0.5 })] },
});
const fgStalkSockets = (L, o = {}) => ({ eye: { x: 5, y: 10, s: 1 }, eyeFar: { x: -4, y: 9, s: 0.9 }, mouth: { x: 3, y: 18, a: 0, s: 1 }, ring: { x: 0, y: 6, a: 0, s: 1 }, shelf: { x: 9, y: 22, a: 0, s: 1 }, root: { x: 4, y: L, a: 0 }, rootFar: { x: -4, y: L - 2, a: 0 }, ...o });

export const FG_STALKS = [
  fgPart({
    id: 'stout', slot: 'head', name: 'Stout', tags: ['stalk'], dom: 0.5, w: 3,
    shapes: [[[-10, 0], [10, 0], [12, 14], [12, 28], [10, 36], [0, 38], [-10, 36], [-12, 28], [-12, 14]]],
    extra: [HL('M-10,4 C-9,12 -9,22 -8,32 C-6,22 -6,12 -6,4 Z', 0.18)],
    sockets: fgStalkSockets(36), stages: fgStalkStages(28),
  }),
  fgPart({
    id: 'slender', slot: 'head', name: 'Slender', tags: ['thin', 'tall'], dom: 0.5, w: 2,
    shapes: [[[-9, 0], [9, 0], [10, 16], [9, 34], [7, 42], [0, 44], [-7, 42], [-9, 34], [-10, 16]]],
    extra: [HL('M-8,4 C-8,14 -7,26 -6,38 C-5,26 -5,14 -5,4 Z', 0.18)],
    sockets: fgStalkSockets(42, { shelf: { x: 8, y: 26, a: 0, s: 1 } }), stages: fgStalkStages(32),
  }),
  fgPart({
    id: 'bulb', slot: 'head', name: 'Bulbous', tags: ['fat'], dom: 0.5, w: 2,
    shapes: [[[-10, 0], [10, 0], [11, 14], [14, 26], [16, 36], [10, 42], [0, 44], [-10, 42], [-16, 36], [-14, 26], [-11, 14]]],
    extra: [HL('M-9,4 C-10,14 -12,26 -12,36 C-9,26 -7,14 -6,4 Z', 0.18)],
    sockets: fgStalkSockets(42, { root: { x: 6, y: 42, a: 0 }, rootFar: { x: -6, y: 40, a: 0 } }), stages: fgStalkStages(32),
  }),
  fgPart({
    id: 'bent', slot: 'head', name: 'Bent', tags: ['curved'], dom: 0.5, w: 2,
    shapes: [tube([[0, 0], [5, 12], [3, 24], [-3, 36]], 20, 15, { tipK: 1 })],
    extra: [HL('M-8,4 C-5,14 -6,24 -10,32 C-8,24 -6,14 -4,4 Z', 0.18)],
    sockets: fgStalkSockets(40, { eye: { x: 7, y: 10, s: 1 }, eyeFar: { x: -2, y: 9, s: 0.9 }, mouth: { x: 5, y: 18, a: 0, s: 1 }, ring: { x: 2, y: 6, a: 0, s: 1 }, shelf: { x: 10, y: 22, a: 0, s: 1 }, root: { x: 0, y: 40, a: 0 }, rootFar: { x: -7, y: 38, a: 0 } }),
    stages: fgStalkStages(28),
  }),
  fgPart({
    id: 'ribbed', slot: 'head', name: 'Ribbed', tags: ['ribbed'], dom: 0.5, w: 2,
    shapes: [[[-11, 0], [11, 0], [13, 14], [13, 30], [10, 38], [0, 40], [-10, 38], [-13, 30], [-13, 14]]],
    extra: [L('M-6,4 L-7,34 M0,22 L0,36 M6,4 L7,34', 'k', 1.2, { op: 0.22 }), HL('M-11,4 C-11,14 -11,24 -10,34 C-9,24 -8,14 -8,4 Z', 0.16)],
    sockets: fgStalkSockets(38), stages: fgStalkStages(30),
  }),
  fgPart({
    id: 'woody', slot: 'head', name: 'Woody', tags: ['thick', 'trunk'], dom: 0.55, w: 2,
    shapes: [[[-14, 0], [14, 0], [16, 12], [16, 30], [14, 40], [0, 42], [-14, 40], [-16, 30], [-16, 12]]],
    extra: [L('M-10,24 C-8,30 -10,36 -8,40 M8,26 C10,30 8,36 10,40', 'k', 1.2, { op: 0.25 }), HL('M-13,4 C-13,14 -13,26 -12,36 C-10,26 -9,14 -9,4 Z', 0.16)],
    sockets: fgStalkSockets(40, { eye: { x: 6, y: 11, s: 1 }, eyeFar: { x: -5, y: 10, s: 0.9 }, mouth: { x: 4, y: 20, a: 0, s: 1 }, shelf: { x: 13, y: 24, a: 0, s: 1 }, root: { x: 6, y: 40, a: 0 }, rootFar: { x: -6, y: 38, a: 0 } }),
    stages: fgStalkStages(30),
  }),
  fgPart({
    id: 'stubby', slot: 'head', name: 'Stubby', tags: ['short'], dom: 0.5, w: 2,
    shapes: [[[-12, 0], [12, 0], [14, 10], [13, 20], [10, 26], [0, 28], [-10, 26], [-13, 20], [-14, 10]]],
    extra: [HL('M-11,3 C-11,10 -11,17 -10,23 C-8,17 -7,10 -7,3 Z', 0.18)],
    sockets: fgStalkSockets(26, { eye: { x: 5, y: 8, s: 1 }, eyeFar: { x: -4, y: 7, s: 0.9 }, mouth: { x: 3, y: 15, a: 0, s: 1 }, ring: { x: 0, y: 4, a: 0, s: 1 }, shelf: { x: 11, y: 16, a: 0, s: 1 }, root: { x: 4, y: 26, a: 0 }, rootFar: { x: -4, y: 24, a: 0 } }),
    stages: fgStalkStages(20),
  }),
];
