// Fungus gills (a band under the cap's rim, drawn behind the stalk), spores (drifting above the cap, in front)
// and roots (origin = the root socket at the stalk's foot; their lowest point stands on the ground).
// Evolutions: gills and spores grow a little; roots grow and band.
import { fgLeg, fgPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, fur, puff } from '../_dsl.js';
import { sparklePath, spiralPath } from '../_sigils.js';
import { evoBands, evoRing } from '../_evo.js';

const fgGillStages = { 2: { grow: [1.05, 1.1] }, 3: { grow: [1.08, 1.2] } };
const fgSporeStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.12], add: [C(-14, -22, 1.4, 'a', { ns: true, op: 0.8 }), C(16, -24, 1.2, 'a', { ns: true, op: 0.8 })] } };
const fgRootStages = (bandY) => ({
  2: { grow: [1.06, 1.08] },
  3: { reset: true, grow: [1.12, 1.16], add: [...evoBands(bandY, 2, 2.2, 5), evoRing(0, bandY - 4, 5, 'a', 1, { op: 0.5 })] },
});
const fgBand = (w, d) => [[-w, 0], [w, 0], [w * 0.85, d * 0.7], [0, d], [-w * 0.85, d * 0.7]];
const fgRays = (n, w, d) => Array.from({ length: n }, (_, i) => { const t = -1 + (2 * (i + 0.5)) / n; return `M${(t * w * 0.9).toFixed(1)},0.5 L${(t * w * 0.8).toFixed(1)},${(d * (1 - 0.35 * t * t)).toFixed(1)}`; }).join(' ');

export const FG_GILLS = [
  fgPart({ id: 'fine', slot: 'gills', name: 'Fine gills', tags: ['gill'], dom: 0.5, w: 3, shapes: [{ pts: fgBand(24, 8), f: 'sd' }], extra: [L(fgRays(11, 24, 7), 'k', 0.9, { op: 0.35 })], stages: fgGillStages }),
  fgPart({ id: 'broad', slot: 'gills', name: 'Broad gills', tags: ['gill'], dom: 0.5, w: 2, shapes: [{ pts: fgBand(24, 9), f: 'sd' }], extra: [L(fgRays(6, 24, 8), 'k', 1.6, { op: 0.35 })], stages: fgGillStages }),
  fgPart({ id: 'pores', slot: 'gills', name: 'Pores', tags: ['dots'], dom: 0.5, w: 2, shapes: [{ pts: fgBand(24, 8), f: 'sd' }], extra: [...[[-16, 3], [-8, 5], [0, 6], [8, 5], [16, 3], [-12, 1.5], [12, 1.5], [-4, 2.5], [4, 2.5]].map(([x, y]) => C(x, y, 1, 'k', { ns: true, op: 0.35 }))], stages: fgGillStages }),
  fgPart({ id: 'teeth', slot: 'gills', name: 'Teeth', tags: ['spiky'], dom: 0.5, w: 2, shapes: [{ pts: [[22, 0], ...fur([22, 0], [-22, 0], 7, 7, { tip: 'c' }), [-22, -1], [22, -1]], f: 'sd' }], stages: fgGillStages }),
  fgPart({ id: 'ruffle', slot: 'gills', name: 'Ruffle', tags: ['wavy'], dom: 0.5, w: 2, shapes: [[[-24, 0], [24, 0], [20, 6, 'c'], [14, 4], [8, 9, 'c'], [2, 5], [-4, 9, 'c'], [-10, 4], [-16, 8, 'c'], [-21, 5]]], extra: [L(fgRays(7, 22, 5), 'k', 0.9, { op: 0.3 })], stages: fgGillStages }),
  fgPart({ id: 'dark', slot: 'gills', name: 'Dark gills', tags: ['dark'], dom: 0.5, w: 2, shapes: [{ pts: fgBand(24, 8), f: 'k' }], extra: [L(fgRays(9, 24, 7), 'w', 0.8, { op: 0.2 })], stages: fgGillStages }),
  fgPart({ id: 'lace', slot: 'gills', name: 'Lace', tags: ['net'], dom: 0.5, w: 2, shapes: [{ pts: fgBand(24, 9), f: 'sl' }], extra: [L(fgRays(9, 24, 8), 'k', 0.8, { op: 0.3 }), L('M-20,3 C-10,6 10,6 20,3 M-14,6 C-6,8 6,8 14,6', 'k', 0.8, { op: 0.3 })], stages: fgGillStages }),
];

export const FG_SPORES = [
  NONE('spores', 0.3, 'g.'),
  fgPart({ id: 'motes', slot: 'spores', name: 'Motes', tags: ['dots'], dom: 0.5, w: 3, extra: [C(-8, -6, 1.8, 'a', { ns: true, op: 0.85 }), C(4, -10, 1.4, 'a', { ns: true, op: 0.85 }), C(12, -4, 1.2, 'a', { ns: true, op: 0.85 })], stages: fgSporeStages }),
  fgPart({ id: 'drift', slot: 'spores', name: 'Drift', tags: ['trail'], dom: 0.5, w: 2, extra: [...[[2, -4], [8, -9], [16, -12], [24, -13], [30, -18], [12, -18], [20, -22]].map(([x, y], i) => C(x, y, i % 2 ? 1.1 : 1.6, 'a', { ns: true, op: 0.8 }))], stages: fgSporeStages }),
  fgPart({ id: 'cloud', slot: 'spores', name: 'Spore cloud', tags: ['puff'], dom: 0.5, w: 2, extra: [P(`${puff(0, -12, 14, 9, 3).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`, 'a', { ns: true, op: 0.22 }), C(-6, -14, 1.4, 'a', { ns: true, op: 0.8 }), C(5, -18, 1.2, 'a', { ns: true, op: 0.8 }), C(10, -8, 1, 'a', { ns: true, op: 0.8 })], stages: fgSporeStages }),
  fgPart({ id: 'sparkle', slot: 'spores', name: 'Sparkle', tags: ['light'], dom: 0.5, w: 2, extra: [P(sparklePath(-10, -8, 3.5), 'a', { ns: true }), P(sparklePath(6, -14, 3), 'a', { ns: true }), P(sparklePath(16, -4, 2.6), 'a', { ns: true }), C(-2, -18, 1, 'a', { ns: true, op: 0.8 })], stages: fgSporeStages }),
  fgPart({ id: 'ring', slot: 'spores', name: 'Spore ring', tags: ['ring'], dom: 0.5, w: 2, extra: [...[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => C(Math.cos((a * Math.PI) / 180) * 18, -8 + Math.sin((a * Math.PI) / 180) * 7, 1.4, 'a', { ns: true, op: 0.85 }))], stages: fgSporeStages }),
  fgPart({ id: 'fall', slot: 'spores', name: 'Falling spores', tags: ['rain'], dom: 0.5, w: 2, extra: [...[[-30, 14], [-34, 26], [-28, 38], [30, 16], [34, 28], [28, 40], [-36, 6], [36, 6]].map(([x, y], i) => C(x, y, i % 3 ? 1.1 : 1.5, 'a', { ns: true, op: 0.8 }))], stages: fgSporeStages }),
  fgPart({ id: 'swirl', slot: 'spores', name: 'Swirl', tags: ['spiral'], dom: 0.5, w: 2, extra: [L(spiralPath(4, -12, 11, 1.6, -40), 'a', 1, { op: 0.4 }), ...[[-6, -6], [8, -18], [14, -8], [-2, -20]].map(([x, y]) => C(x, y, 1.3, 'a', { ns: true, op: 0.85 }))], stages: fgSporeStages }),
];

export const FG_ROOTS = [
  fgLeg({ id: 'mycelium', slot: 'roots', name: 'Mycelium', tags: ['threads'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [1, 6]], 8, 5, { tipK: 1 }), tube([[-3, 4], [-8, 10], [-11, 15]], 3, 1.5, { tipK: 1 }), tube([[0, 5], [1, 11], [0, 16]], 3, 1.5, { tipK: 1 }), tube([[3, 4], [8, 9], [11, 14]], 3, 1.5, { tipK: 1 })], stages: fgRootStages(4) }),
  fgLeg({ id: 'stump', slot: 'roots', name: 'Stump foot', tags: ['thick'], dom: 0.55, w: 2, shapes: [[[-8, 0], [8, 0], [10, 10], [7, 15], [-7, 15], [-10, 10]]], extra: [L('M-4,15 L-4,11 M2,15 L2,11', 'k', 1.4, { op: 0.4 }), HL('M-8,0 L-3,0 L-4,12 L-8,10 Z', 0.13)], stages: fgRootStages(7) }),
  fgLeg({ id: 'pad', slot: 'roots', name: 'Pad', tags: ['flat'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [0, 8]], 8, 6, { tipK: 1 }), [[-12, 8], [12, 8], [13, 12], [0, 14], [-13, 12]]], extra: [HL('M-11,9 C-8,8 -4,8 -1,9 C-4,10 -8,10 -11,11 Z', 0.16)], stages: fgRootStages(5) }),
  fgLeg({ id: 'toes', slot: 'roots', name: 'Toes', tags: ['nubs'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [0, 7]], 9, 7, { tipK: 1 }), tube([[-4, 6], [-7, 12]], 4, 3, { tipK: 1 }), tube([[0, 7], [0, 13]], 4, 3, { tipK: 1 }), tube([[4, 6], [7, 12]], 4, 3, { tipK: 1 })], stages: fgRootStages(4) }),
  fgLeg({ id: 'stilts', slot: 'roots', name: 'Stilt roots', tags: ['tall'], dom: 0.45, w: 2, shapes: [tube([[0, 0], [1, 10], [0, 20]], 4, 3, { tipK: 1 }), [[-6, 18], [8, 18], [8, 22], [-6, 22]]], stages: fgRootStages(8) }),
  fgLeg({ id: 'knot', slot: 'roots', name: 'Knotted root', tags: ['gnarled'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-3, 5], [2, 10], [-1, 15]], 8, 4, { tipK: 'c' })], extra: [C(-2, 4, 2, 'pd', { sw: 1.2 }), C(2, 9, 1.8, 'pd', { sw: 1.2 })], stages: fgRootStages(6) }),
  fgLeg({ id: 'bulb', slot: 'roots', name: 'Bulb', tags: ['round'], dom: 0.5, w: 2, shapes: [[[-6, 0], [6, 0], [10, 6], [10, 12], [6, 16], [-6, 16], [-10, 12], [-10, 6]]], extra: [HL('M-8,4 C-7,2 -4,1 -1,1 C-4,3 -6,6 -7,10 Z', 0.16), L('M-3,16 L-3,13 M3,16 L3,13', 'k', 1.2, { op: 0.35 })], stages: fgRootStages(8) }),
];
