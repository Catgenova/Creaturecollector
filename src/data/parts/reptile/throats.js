// Reptile throats: dewlaps, pouches and frills under the jaw. Origin = the head's throat socket.
// Drawn behind the skull so the top edge hides under the jaw.
import { rPart } from './_shared.js';
import { NONE, S, L, E, SH, HL, fur } from '../_dsl.js';

export const R_THROATS = [
  NONE('throat', 0.3, 'r.'),
  rPart({
    id: 'dewlap', slot: 'throat', name: 'Dewlap', tags: ['anole'], dom: 0.5, w: 2,
    shapes: [[[-8, -6], [8, -4], [12, 10], [4, 20], [-8, 18], [-14, 6]]],
    extra: [L('M-4,-2 L0,16 M-4,-2 L8,10 M-4,-2 L-8,12', 'k', 1.1, { op: 0.3 }), SH('M-16,10 C-8,18 4,20 12,12 L14,24 L-16,24 Z', 0.12)],
  }),
  rPart({
    id: 'pouch', slot: 'throat', name: 'Pouch', tags: ['bulge'], dom: 0.45, w: 2,
    extra: [E(0, 6, 12, 10, 'p'), SH('M-14,8 C-8,16 8,16 14,8 L14,20 L-14,20 Z', 0.12), HL('M-8,-1 C-4,-4 4,-4 8,-1 L6,2 C2,0 -2,0 -6,2 Z', 0.2)],
  }),
  rPart({
    id: 'frill', slot: 'throat', name: 'Neck frill', tags: ['frill'], dom: 0.55, w: 1,
    shapes: [[[-20, -16], [0, -18], [16, -8], [18, 8], [6, 20], [-10, 20], [-24, 6]]],
    extra: [S([[-14, -10], [0, -12], [10, -4], [12, 6], [4, 14], [-8, 14], [-18, 4]], 's', { ns: true, cl: true, op: 0.5 }), L('M-2,0 L14,-6 M-2,0 L16,6 M-2,0 L6,18 M-2,0 L-8,18 M-2,0 L-20,4 M-2,0 L-16,-12', 'k', 1.1, { op: 0.3 })],
  }),
  rPart({
    id: 'beard', slot: 'throat', name: 'Beard', tags: ['spiky'], dom: 0.5, w: 2,
    shapes: [[[-12, -6], [10, -4], [12, 4], ...fur([12, 6], [-10, 14], 5, 5, { lean: 0.2, tip: 'c' }), [-14, 6]]],
    extra: [SH('M-16,6 C-8,12 4,14 12,8 L14,20 L-16,20 Z', 0.12)],
  }),
  rPart({
    id: 'plates', slot: 'throat', name: 'Throat plates', tags: ['armour'], dom: 0.5, w: 2,
    shapes: [[[-12, -6], [12, -4], [14, 4], [12, 14], [0, 18], [-12, 14], [-14, 4]]],
    extra: [L('M-12,2 C-4,5 6,5 13,2 M-11,8 C-4,11 6,11 12,8', 'k', 1.2, { op: 0.3 }), SH('M-16,8 C-8,16 6,16 14,8 L14,22 L-16,22 Z', 0.12), HL('M-10,-4 C-4,-6 4,-6 10,-4 L8,0 C4,-2 -4,-2 -8,0 Z', 0.16)],
  }),
  rPart({
    id: 'ruff', slot: 'throat', name: 'Feather ruff', tags: ['feathers'], dom: 0.45, w: 2,
    shapes: [[[-16, -10], [8, -8], [12, 0], ...fur([12, 2], [-4, 20], 3, 6, { lean: 0.3, tip: 0.5 }), [-16, 16], [-20, 2]]],
    extra: [S([[-10, -6], [2, -6], [4, 4], [-2, 12], [-12, 8]], 's', { ns: true, cl: true, op: 0.5 }), SH('M-22,8 C-10,18 4,18 12,10 L14,24 L-22,24 Z', 0.12)],
  }),
  rPart({
    id: 'collar', slot: 'throat', name: 'Collar', tags: ['band'], dom: 0.45, w: 2,
    shapes: [[[-14, -8], [12, -6], [14, 4], [12, 8], [-12, 10], [-16, 2]]],
    extra: [S([[-13, -2], [12, 0], [12, 5], [-12, 6]], 's', { ns: true, cl: true }), SH('M-16,4 L14,4 L14,12 L-16,12 Z', 0.12)],
  }),
];
