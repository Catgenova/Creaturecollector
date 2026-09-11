// Nightwing wings (origin = the shoulder; the membrane spreads up and back, drawn behind the body) and thumbs
// (the wrist claw, nested on the wing's thumb socket).
// Evolutions: wings grow and light accent motes along the membrane; thumbs grow.
import { nwPart } from './_shared.js';
import { NONE, L, C, P } from '../_dsl.js';

const nwWingStages = {
  2: { grow: [1.1, 1.1], add: [C(-26, -30, 1.6, 'a', { ns: true, op: 0.7 })] },
  3: { grow: [1.15, 1.15], add: [C(-26, -30, 1.8, 'a', { ns: true, op: 0.7 }), C(-34, -12, 1.5, 'a', { ns: true, op: 0.7 }), C(-30, 2, 1.4, 'a', { ns: true, op: 0.7 })] },
};
const nwGrow = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.14, 1.14] } };
const nwFingers = (d) => L(d, 'pd', 2.4);
const nwArm = (d, w = 3.2) => L(d, 'p', w);
const nwVeins = (d) => L(d, 'k', 1, { op: 0.3 });
const nwWingSock = (x, y) => ({ thumb: { x, y, a: 0, s: 1 } });

export const NW_WINGS = [
  nwPart({ id: 'broad', slot: 'wings', name: 'Broad', tags: ['round'], dom: 0.5, w: 3, shapes: [{ pts: [[0, 0], [-6, -16], [-14, -30], [-30, -40, 'c'], [-30, -26], [-40, -14, 'c'], [-32, -6], [-40, 6, 'c'], [-26, 4], [-12, 6]], f: 's' }], extra: [nwFingers('M0,0 L-14,-30 M-14,-30 L-30,-40 M-14,-30 L-40,-14 M-14,-30 L-40,6'), nwArm('M0,0 C-4,-10 -10,-22 -14,-30', 3.4), nwVeins('M-18,-24 L-26,-20 M-20,-14 L-30,-4')], sockets: nwWingSock(-14, -30), stages: nwWingStages }),
  nwPart({ id: 'narrow', slot: 'wings', name: 'Narrow', tags: ['swift'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -14], [-12, -28], [-40, -46, 'c'], [-34, -30], [-44, -20, 'c'], [-34, -12], [-36, -2, 'c'], [-22, 0], [-10, 4]], f: 's' }], extra: [nwFingers('M0,0 L-12,-28 M-12,-28 L-40,-46 M-12,-28 L-44,-20 M-12,-28 L-36,-2'), nwArm('M0,0 C-4,-10 -8,-20 -12,-28'), nwVeins('M-20,-30 L-30,-32 M-22,-18 L-32,-10')], sockets: nwWingSock(-12, -28), stages: nwWingStages }),
  nwPart({ id: 'scalloped', slot: 'wings', name: 'Scalloped', tags: ['frilled'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -16], [-14, -30], [-28, -40, 'c'], [-26, -30], [-36, -26, 'c'], [-30, -18], [-40, -12, 'c'], [-30, -6], [-38, 2, 'c'], [-26, 2], [-30, 10, 'c'], [-18, 4], [-10, 6]], f: 's' }], extra: [nwFingers('M0,0 L-14,-30 M-14,-30 L-28,-40 M-14,-30 L-36,-26 M-14,-30 L-40,-12 M-14,-30 L-38,2 M-14,-30 L-30,10'), nwArm('M0,0 C-4,-10 -10,-22 -14,-30')], sockets: nwWingSock(-14, -30), stages: nwWingStages }),
  nwPart({ id: 'ragged', slot: 'wings', name: 'Ragged', tags: ['torn'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -16], [-14, -30], [-30, -38, 'c'], [-26, -28], [-36, -22, 'c'], [-28, -16], [-38, -10, 'c'], [-28, -6], [-36, 4, 'c'], [-24, 0], [-28, 8, 'c'], [-16, 4], [-10, 6]], f: 's' }], extra: [nwFingers('M0,0 L-14,-30 M-14,-30 L-30,-38 M-14,-30 L-38,-10 M-14,-30 L-36,4'), nwArm('M0,0 C-4,-10 -10,-22 -14,-30'), C(-22, -16, 2, 'k', { ns: true, op: 0.4 }), C(-28, -2, 1.6, 'k', { ns: true, op: 0.4 })], sockets: nwWingSock(-14, -30), stages: nwWingStages }),
  nwPart({ id: 'short', slot: 'wings', name: 'Short', tags: ['small'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-4, -10], [-10, -20], [-22, -26, 'c'], [-22, -16], [-28, -8, 'c'], [-22, -2], [-24, 6, 'c'], [-16, 4], [-8, 4]], f: 's' }], extra: [nwFingers('M0,0 L-10,-20 M-10,-20 L-22,-26 M-10,-20 L-28,-8 M-10,-20 L-24,6'), nwArm('M0,0 C-3,-7 -7,-14 -10,-20', 3)], sockets: nwWingSock(-10, -20), stages: nwWingStages }),
  nwPart({ id: 'huge', slot: 'wings', name: 'Huge', tags: ['big'], dom: 0.55, w: 2, shapes: [{ pts: [[0, 0], [-8, -18], [-18, -36], [-40, -52, 'c'], [-38, -34], [-52, -22, 'c'], [-42, -10], [-50, 6, 'c'], [-34, 4], [-40, 16, 'c'], [-22, 8], [-12, 8]], f: 's' }], extra: [nwFingers('M0,0 L-18,-36 M-18,-36 L-40,-52 M-18,-36 L-52,-22 M-18,-36 L-50,6 M-18,-36 L-40,16'), nwArm('M0,0 C-6,-12 -12,-24 -18,-36', 3.6), nwVeins('M-24,-34 L-34,-32 M-28,-22 L-40,-12 M-28,-10 L-36,0')], sockets: nwWingSock(-18, -36), stages: nwWingStages }),
  nwPart({ id: 'hooked', slot: 'wings', name: 'Hooked', tags: ['sharp'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -16], [-14, -32], [-22, -44, 'c'], [-26, -30], [-40, -16, 'c'], [-32, -8], [-40, 4, 'c'], [-26, 2], [-12, 6]], f: 's' }], extra: [nwFingers('M0,0 L-14,-32 M-14,-32 L-22,-44 M-14,-32 L-40,-16 M-14,-32 L-40,4'), nwArm('M0,0 C-4,-10 -10,-24 -14,-32'), P('M-14,-32 L-12,-40 L-9,-33 Z', 'w', { sw: 1 })], sockets: nwWingSock(-14, -32), stages: nwWingStages }),
];

export const NW_THUMBS = [
  NONE('thumbs', 0.3, 'n.'),
  nwPart({ id: 'hook', slot: 'thumbs', name: 'Hook', tags: ['claw'], dom: 0.5, w: 3, extra: [P('M0,0 C-2,-4 -1,-8 3,-10 C1,-6 1,-3 2,0 Z', 'w', { sw: 1.2 })], stages: nwGrow }),
  nwPart({ id: 'double', slot: 'thumbs', name: 'Double claw', tags: ['claw'], dom: 0.5, w: 2, extra: [P('M-1,0 C-3,-4 -2,-7 1,-9 C-1,-5 -1,-3 0,0 Z', 'w', { sw: 1 }), P('M2,0 C1,-4 2,-7 5,-8 C3,-5 3,-2 3,0 Z', 'w', { sw: 1 })], stages: nwGrow }),
  nwPart({ id: 'long', slot: 'thumbs', name: 'Long claw', tags: ['claw'], dom: 0.5, w: 2, extra: [P('M0,0 C-3,-6 -2,-12 4,-16 C1,-10 1,-5 2,0 Z', 'w', { sw: 1.2 }), L('M0,-4 L1,-8', 'k', 0.8, { op: 0.3 })], stages: nwGrow }),
  nwPart({ id: 'bony', slot: 'thumbs', name: 'Knuckle', tags: ['bone'], dom: 0.5, w: 2, extra: [C(0, 0, 2.6, 'p', { sw: 1.2 }), P('M1,-2 C0,-6 2,-9 5,-10 C3,-6 3,-3 3,-1 Z', 'w', { sw: 1 })], stages: nwGrow }),
  nwPart({ id: 'glowing', slot: 'thumbs', name: 'Glowing', tags: ['light'], dom: 0.5, w: 2, extra: [C(0, 0, 3, 'a', { ns: true, op: 0.3 }), C(0, 0, 1.8, 'a', { ns: true }), C(-0.5, -0.5, 0.7, 'w', { ns: true, op: 0.8 })], stages: nwGrow }),
  nwPart({ id: 'rings', slot: 'thumbs', name: 'Wrist rings', tags: ['ring'], dom: 0.5, w: 2, extra: [L('M-3,-2 L3,-2 M-3,1 L3,1', 'a', 1.4, { ns: true, op: 0.8 }), P('M0,-3 C-1,-6 0,-8 3,-9 C2,-6 2,-4 2,-3 Z', 'w', { sw: 1 })], stages: nwGrow }),
  nwPart({ id: 'blunt', slot: 'thumbs', name: 'Blunt', tags: ['pad'], dom: 0.5, w: 2, extra: [P('M-2,0 C-3,-3 -2,-6 1,-7 C3,-6 3,-3 2,0 Z', 'pd', { sw: 1.2 })], stages: nwGrow }),
];
