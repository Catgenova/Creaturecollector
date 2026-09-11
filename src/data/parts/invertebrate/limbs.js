// Invertebrate arms (paired: arm / armFar), legs (one part draws a whole side, placed at legs / legsFar)
// and tails (from the rear socket).
// Evolutions: arms grow accent claw tips and suckers, then bigger claws, extra tentacles and spikes;
// legs grow accent joints, then spurs and bulk; tails grow accent tips and bands, then longer stings,
// extra streamers, a second coil and glow.
import { vPart, tendril } from './_shared.js';
import { NONE, S, L, P, C, E, SH, HL, tube, xfPts } from '../_dsl.js';
import { evoRing, evoGem } from '../_evo.js';

export const V_ARMS = [
  NONE('arms', 0.3, 'v.'),
  vPart({ id: 'claws', slot: 'arms', name: 'Pincers', tags: ['crab'], dom: 0.6, w: 3, extra: [...tendril('M0,0 L8,-6 L16,-2', 5), S([[14, -8], [24, -14], [34, -10, 0.3], [30, -2], [22, 2], [14, 2]], 'p'), S([[26, -4], [34, -8], [36, -2, 0.3], [28, 4], [22, 4]], 'p'), L('M22,-2 L30,-4', 'k', 1.6), HL('M18,-10 C22,-12 28,-12 30,-8 L26,-6 C22,-8 20,-8 18,-6 Z', 0.2)],
    stages: { 2: { grow: [1.1, 1.12], add: [L('M22,-10 L24,-8 M27,-12 L29,-10 M24,2 L26,0 M29,1 L31,-1', 'k', 1, { op: 0.5 }), C(34, -10, 1.8, 'a', { ns: true }), C(36, -2, 1.8, 'a', { ns: true })] }, 3: { reset: true, grow: [1.2, 1.22], add: [S([[14, -9], [26, -17], [40, -12, 0.3], [34, -2], [24, 3], [14, 3]], 'p'), S([[28, -4], [38, -9], [42, -2, 0.3], [32, 5], [24, 5]], 'p'), L('M24,-2 L34,-4', 'k', 1.6), L('M22,-12 L24,-10 M28,-14 L30,-12 M34,-12 L36,-10', 'k', 1, { op: 0.5 }), C(40, -12, 2.2, 'a', { ns: true }), C(42, -2, 2.2, 'a', { ns: true }), C(8, -6, 2, 'a', { ns: true })] } } }),
  vPart({ id: 'tentacles', slot: 'arms', name: 'Tentacles', tags: ['octopus'], dom: 0.55, w: 3, extra: [...tendril('M0,0 C8,4 14,10 12,18 C10,24 4,22 6,18', 5.5), L('M4,6 L6,8 M8,10 L10,12 M10,15 L12,16', 'w', 1.3, { op: 0.6 }), ...tendril('M-2,2 C4,8 4,16 -2,22 C-6,26 -10,22 -8,18', 4.5), L('M0,8 L2,10 M-1,14 L1,16', 'w', 1.2, { op: 0.6 })],
    stages: { 2: { grow: [1.1, 1.12], add: [C(6, 18, 1.8, 'a', { ns: true }), C(-8, 18, 1.6, 'a', { ns: true }), C(5, 7, 1.2, 'a', { ns: true, op: 0.8 }), C(9, 11, 1.2, 'a', { ns: true, op: 0.8 })] }, 3: { grow: [1.1, 1.1], add: [...tendril('M2,-2 C12,-2 18,6 16,14 C15,18 10,18 11,14', 4), L('M8,2 L10,4 M13,6 L15,8', 'w', 1.2, { op: 0.6 }), C(11, 14, 1.8, 'a', { ns: true }), C(6, 18, 2.4, 'a', { ns: true }), C(-8, 18, 2.2, 'a', { ns: true })] } } }),
  vPart({ id: 'stubs', slot: 'arms', name: 'Stubs', tags: ['small'], dom: 0.4, w: 2, extra: [S([[-3, -4], [6, -5], [10, 0], [8, 6], [0, 6], [-4, 2]], 'p'), HL('M-1,-3 C3,-4 7,-3 8,-1 L4,0 C2,-1 0,-1 -1,0 Z', 0.2)],
    stages: { 2: { grow: [1.15, 1.15], add: [C(9, 1, 1.6, 'a', { ns: true })] }, 3: { grow: [1.12, 1.12], add: [S([[8, -3], [14, -4], [16, 0], [14, 4], [9, 4]], 'p'), C(15, 0, 1.6, 'a', { ns: true }), L('M4,-2 L4,4', 'a', 1.6, { ns: true, cl: true, op: 0.6 })] } } }),
  vPart({ id: 'pedipalps', slot: 'arms', name: 'Pedipalps', tags: ['scorpion'], dom: 0.55, w: 2, extra: [...tendril('M0,0 L10,-4 L18,2', 4), S([[16, -3], [22, -8], [28, -5, 0.3], [26, 0], [20, 2]], 'p'), S([[20, 1], [26, 3], [28, 0], [24, -1]], 'p'), L('M20,0 L25,-1', 'k', 1.4)],
    stages: { 2: { grow: [1.1, 1.12], add: [C(28, -5, 1.6, 'a', { ns: true }), C(28, 0, 1.4, 'a', { ns: true }), C(10, -4, 1.4, 'a', { ns: true })] }, 3: { reset: true, grow: [1.2, 1.22], add: [S([[16, -4], [24, -11], [33, -6, 0.3], [30, 0], [22, 3]], 'p'), S([[22, 2], [30, 4], [33, 0], [27, -1]], 'p'), L('M22,0 L29,-1', 'k', 1.4), L('M22,-8 L24,-6 M27,-9 L29,-7', 'k', 1, { op: 0.5 }), C(33, -6, 2, 'a', { ns: true }), C(33, 0, 1.8, 'a', { ns: true }), C(10, -4, 1.8, 'a', { ns: true })] } } }),
  vPart({ id: 'wisps', slot: 'arms', name: 'Wisp hands', tags: ['ghost'], dom: 0.45, w: 2, extra: [S([[4, -6], [12, -10], [18, -6], [16, 2], [10, 4], [4, 2]], 'p', { op: 0.85 }), C(0, -2, 3, 'p', { ns: true, op: 0.6 }), C(-5, 0, 2, 'p', { ns: true, op: 0.4 })],
    stages: { 2: { grow: [1.12, 1.12], add: [C(18, -6, 1.8, 'a', { ns: true, op: 0.8 }), C(-9, 2, 1.4, 'p', { ns: true, op: 0.3 })] }, 3: { grow: [1.1, 1.1], add: [S([[6, -12], [16, -18], [24, -12], [22, -4], [16, -6]], 'p', { op: 0.7 }), C(24, -12, 1.8, 'a', { ns: true, op: 0.8 }), C(12, -2, 6, 'a', { ns: true, op: 0.2 })] } } }),
  vPart({ id: 'feelers', slot: 'arms', name: 'Long feelers', tags: ['thin'], dom: 0.45, w: 2, extra: [...tendril('M0,0 C10,-6 18,-4 28,-10', 2.6), ...tendril('M-2,2 C8,4 16,10 24,8', 2.4)],
    stages: { 2: { grow: [1.12, 1.15], add: [C(28, -10, 1.8, 'a', { ns: true }), C(24, 8, 1.8, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], add: [...tendril('M0,-2 C8,-12 16,-14 24,-20', 2.2), C(24, -20, 1.8, 'a', { ns: true }), C(28, -10, 2.4, 'a', { ns: true }), C(24, 8, 2.4, 'a', { ns: true })] } } }),
  vPart({ id: 'paddles', slot: 'arms', name: 'Paddles', tags: ['swimmer'], dom: 0.45, w: 2, extra: [S([[0, -4], [8, -6], [16, 0], [14, 10], [6, 12], [0, 6]], 'p'), L('M4,-2 L10,6 M2,2 L8,8', 'k', 1, { op: 0.3 })],
    stages: { 2: { grow: [1.12, 1.15], add: [L('M4,-2 L10,6 M2,2 L8,8', 'a', 1.2, { ns: true, op: 0.6 }), C(16, 0, 1.6, 'a', { ns: true }), C(14, 10, 1.6, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], addBehind: [{ pts: [[0, -6], [10, -9], [20, 0], [18, 13], [8, 16], [0, 8]], f: 'pd' }], add: [C(16, 0, 2.2, 'a', { ns: true }), C(14, 10, 2.2, 'a', { ns: true })] } } }),
];

/** Several jointed legs on one side, from x offsets. Each leg: hip at (x,0), knee, foot. Stage 2 adds accent knees, stage 3 spurs and bulk. */
function legSet(id, name, legs, w, tags, extra = []) {
  const prims = [];
  for (const [x, kx, ky, fx, fy] of legs) prims.push(...tendril(`M${x},0 L${x + kx},${ky} L${x + fx},${fy}`, w));
  const knees = (r) => legs.map(([x, kx, ky]) => C(x + kx, ky, r, 'a', { ns: true }));
  const spurs = legs.map(([x, kx, ky]) => P(`M${x + kx},${ky} L${x + kx + (kx >= 0 ? 3 : -3)},${ky - 5} L${x + kx + (kx >= 0 ? -1 : 1)},${ky + 1} Z`, 'pd', { sw: 1 }));
  const feet = legs.map(([x, , , fx, fy]) => P(`M${x + fx},${fy} L${x + fx + 2},${fy + 4} L${x + fx - 2},${fy + 1} Z`, 'w', { sw: 1 }));
  return vPart({ id, slot: 'legs', name, tags, dom: 0.5, w: 2, extra: [...prims, ...extra], stages: { 2: { grow: [1.06, 1.1], add: knees(1.6) }, 3: { reset: true, grow: [1.12, 1.2], add: [...knees(2.2), ...spurs, ...feet] } } });
}

export const V_LEGS = [
  NONE('legs', 0.3, 'v.'),
  legSet('crab', 'Crab legs', [[8, 4, -8, 10, 12], [-2, 0, -9, 2, 13], [-12, -4, -8, -8, 12], [-22, -8, -6, -18, 10]], 3.4, ['crab']),
  legSet('spider', 'Spider legs', [[6, 12, -14, 22, 10], [0, 4, -18, 8, 12], [-6, -8, -18, -12, 12], [-12, -20, -14, -32, 10]], 2.6, ['spider'], [L('M14,-10 L16,-8 M4,-14 L6,-12 M-10,-14 L-8,-12 M-24,-10 L-22,-8', 'k', 1, { op: 0.4 })]),
  legSet('scorpion', 'Scorpion legs', [[8, 6, -8, 12, 10], [0, 2, -10, 4, 12], [-8, -4, -10, -6, 12], [-16, -10, -8, -16, 10]], 3, ['scorpion']),
  vPart({ id: 'stubby', slot: 'legs', name: 'Stubby legs', tags: ['small'], dom: 0.45, w: 2, extra: [...[6, -4, -14].flatMap((x) => [S([[x - 4, -2], [x + 4, -2], [x + 5, 8], [x + 2, 11], [x - 3, 11], [x - 5, 8]], 'p')])],
    stages: { 2: { grow: [1.06, 1.1], add: [6, -4, -14].map((x) => C(x, 9, 1.6, 'a', { ns: true })) }, 3: { reset: true, grow: [1.12, 1.2], add: [...[6, -4, -14].map((x) => C(x, 9, 2, 'a', { ns: true })), ...[6, -4, -14].map((x) => L(`M${x - 4},3 L${x + 4},3`, 'a', 1.6, { ns: true, cl: true, op: 0.6 }))] } } }),
  vPart({ id: 'tubefeet', slot: 'legs', name: 'Tube feet', tags: ['starfish'], dom: 0.4, w: 2, extra: [...[10, 4, -2, -8, -14, -20].flatMap((x) => [...tendril(`M${x},0 L${x - 1},8`, 2.6), C(x - 1, 9, 2, 'a', { sw: 1 })])],
    stages: { 2: { grow: [1.06, 1.15], add: [10, 4, -2, -8, -14, -20].map((x) => C(x - 1, 9, 2.6, 'a', { sw: 1 })) }, 3: { reset: true, grow: [1.12, 1.3], add: [...[16, -26].flatMap((x) => [...tendril(`M${x},0 L${x - 1},8`, 2.6), C(x - 1, 9, 2.4, 'a', { sw: 1 })]), ...[10, 4, -2, -8, -14, -20].map((x) => C(x - 1, 9, 3, 'a', { sw: 1 })), ...[10, -2, -14].map((x) => C(x - 1, 9, 1, 'w', { ns: true, op: 0.7 }))] } } }),
  legSet('spindly', 'Spindly legs', [[6, 8, -18, 10, 14], [-4, 0, -20, -2, 14], [-14, -8, -18, -14, 14]], 2, ['thin']),
  legSet('jointed', 'Jointed legs', [[8, 6, -10, 10, 14], [-2, 0, -12, 0, 14], [-12, -6, -10, -10, 14]], 2.6, ['insect']),
];

const vtSlugtip = [[2, -6], [-8, -8], [-20, -4], [-30, 2, 'c'], [-20, 6], [-8, 8], [2, 6]];
const vtWisp = [[2, -8], [-10, -10], [-22, -4], [-34, 4], [-46, 2, 0.2], [-36, 10], [-24, 14, 0.2], [-14, 10], [-4, 12]];

export const V_TAILS = [
  NONE('tail', 0.3, 'v.'),
  vPart({ id: 'slugtip', slot: 'tail', name: 'Tail tip', tags: ['slug'], dom: 0.45, w: 3, shapes: [vtSlugtip], extra: [SH('M-30,2 C-20,8 -8,10 2,8 L2,14 L-30,14 Z', 0.12)],
    stages: { 2: { grow: [1.15, 1.12], add: [C(-14, 0, 2.4, 'a', { ns: true, cl: true }), C(-24, 2, 2, 'a', { ns: true, cl: true })] }, 3: { grow: [1.12, 1.1], addBehind: [{ pts: xfPts(vtSlugtip, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [C(-14, 0, 5, 'a', { ns: true, cl: true, op: 0.3 }), C(-30, 2, 2.2, 'a', { ns: true })] } } }),
  vPart({ id: 'stinger', slot: 'tail', name: 'Stinger tail', tags: ['scorpion'], dom: 0.6, w: 2, shapes: [tube([[0, 0], [-10, -6], [-16, -18], [-12, -32], [0, -40], [10, -38]], 12, 6)], extra: [L('M-8,-8 L-4,-4 M-14,-16 L-10,-14 M-14,-26 L-10,-26 M-6,-36 L-4,-32', 'k', 1.2, { op: 0.3 }), C(12, -38, 5, 'p', { sw: 2 }), P('M15,-36 L24,-30 L14,-33 Z', 'k', { sw: 1 }), C(12, -38, 8, 'a', { ns: true, op: 0.25 })],
    stages: { 2: { grow: [1.1, 1.12], add: [L('M-10,-8 L-6,-4 M-16,-16 L-12,-14 M-16,-26 L-12,-26 M-8,-36 L-6,-32', 'a', 2, { ns: true, cl: true, op: 0.7 }), P('M15,-36 L27,-29 L14,-32 Z', 'k', { sw: 1 }), C(26, -30, 1.4, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], addShapes: [{ pts: [[-14, -10], [-20, -20, 'c'], [-10, -16]], f: 'a' }, { pts: [[-10, -28], [-14, -40, 'c'], [-4, -34]], f: 'a' }], add: [C(12, -38, 6.5, 'p', { sw: 2 }), P('M16,-36 L30,-28 L15,-32 Z', 'k', { sw: 1 }), C(29, -29, 1.8, 'a', { ns: true }), C(12, -38, 12, 'a', { ns: true, op: 0.2 })] } } }),
  vPart({ id: 'wisp', slot: 'tail', name: 'Ghost trail', tags: ['ghost'], dom: 0.5, w: 2, shapes: [vtWisp], extra: [SH('M-46,4 C-30,12 -14,14 2,10 L2,20 L-46,20 Z', 0.1)],
    stages: { 2: { grow: [1.12, 1.12], add: [C(-46, 2, 2, 'a', { ns: true, op: 0.8 }), C(-24, 14, 1.8, 'a', { ns: true, op: 0.8 }), C(-12, -2, 3, 'a', { ns: true, cl: true, op: 0.4 })] }, 3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(vtWisp, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [C(-46, 2, 2.6, 'a', { ns: true, op: 0.8 }), C(-24, 14, 2.4, 'a', { ns: true, op: 0.8 }), C(-58, 4, 1.8, 'a', { ns: true, op: 0.7 })] } } }),
  vPart({ id: 'tentacle', slot: 'tail', name: 'Trailing tentacle', tags: ['octopus'], dom: 0.5, w: 2, extra: [...tendril('M0,0 C-12,2 -22,10 -30,20 C-36,28 -34,36 -26,34', 5), L('M-16,8 L-14,10 M-24,16 L-22,18 M-30,26 L-28,28', 'w', 1.2, { op: 0.6 })],
    stages: { 2: { grow: [1.12, 1.12], add: [C(-26, 34, 2, 'a', { ns: true }), C(-15, 9, 1.4, 'a', { ns: true, op: 0.8 }), C(-23, 17, 1.4, 'a', { ns: true, op: 0.8 })] }, 3: { grow: [1.1, 1.1], add: [...tendril('M0,-2 C-14,-6 -26,-2 -36,6 C-40,10 -40,16 -34,16', 3.6), C(-34, 16, 1.8, 'a', { ns: true }), C(-26, 34, 2.6, 'a', { ns: true }), L('M-20,-2 L-18,0 M-30,4 L-28,6', 'w', 1.2, { op: 0.6 })] } } }),
  vPart({ id: 'sting', slot: 'tail', name: 'Sting', tags: ['small'], dom: 0.45, w: 2, extra: [P('M2,-4 L-14,-1 L2,4 Z', 'k', { sw: 1.6 }), HL('M0,-2 L-8,-1 L0,1 Z', 0.3)],
    stages: { 2: { grow: [1.15, 1.15], add: [P('M2,-4.5 L-18,-1 L2,4.5 Z', 'k', { sw: 1.6 }), HL('M0,-2.4 L-10,-1 L0,1.2 Z', 0.3), C(-18.5, -1, 1.4, 'a', { ns: true })] }, 3: { reset: true, grow: [1.3, 1.3], add: [P('M2,-5 L-22,-1 L2,5 Z', 'k', { sw: 1.6 }), HL('M0,-2.6 L-12,-1 L0,1.4 Z', 0.3), C(-22.5, -1, 1.8, 'a', { ns: true }), C(-20, -1, 6, 'a', { ns: true, op: 0.2 })] } } }),
  vPart({ id: 'streamer', slot: 'tail', name: 'Streamers', tags: ['ribbons'], dom: 0.45, w: 2, extra: [L('M0,-4 C-10,-8 -20,-4 -30,-10 C-36,-14 -40,-10 -46,-14', 'pd', 3), L('M0,2 C-10,2 -18,8 -28,6 C-34,5 -38,10 -44,8', 'p', 3), L('M0,6 C-8,12 -16,10 -24,16', 'pl', 2.4)],
    stages: { 2: { grow: [1.12, 1.12], add: [C(-46, -14, 2, 'a', { ns: true }), C(-44, 8, 2, 'a', { ns: true }), C(-24, 16, 1.8, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], add: [L('M0,-8 C-12,-14 -24,-12 -36,-20 C-42,-24 -48,-20 -54,-24', 'pd', 2.6), L('M0,10 C-10,16 -20,14 -30,22 C-36,26 -42,22 -48,26', 'pl', 2.4), C(-54, -24, 2, 'a', { ns: true }), C(-48, 26, 2, 'a', { ns: true }), C(-46, -14, 2.6, 'a', { ns: true }), C(-44, 8, 2.6, 'a', { ns: true })] } } }),
  vPart({ id: 'coil', slot: 'tail', name: 'Coil', tags: ['snail'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [-12, 2], [-22, -4], [-22, -14], [-14, -18], [-8, -12], [-12, -8]], 10, 3)], extra: [SH('M-26,-6 C-22,2 -12,6 2,6 L2,12 L-26,12 Z', 0.12)],
    stages: { 2: { grow: [1.12, 1.12], add: [L('M-8,-2 L-8,4 M-16,-4 L-18,2 M-22,-12 L-18,-12', 'a', 2.2, { ns: true, cl: true, op: 0.8 }), C(-12, -8, 2, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], addShapes: [tube([[-12, -8], [-16, -4], [-20, -2], [-24, -6]], 5, 2)], add: [...evoGem(-15, -10, 2.4), C(-25, -7, 1.8, 'a', { ns: true })] } } }),
];
