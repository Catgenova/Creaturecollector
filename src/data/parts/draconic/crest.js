// Draconic horns (on the brow, drawn behind the head), wings (origin = the wing root on the back, rising up and
// back; drawn behind the body) and spines (a row along the spine, drawn behind).
// Evolutions: horns and spines grow with their families; wings grow and spread.
import { drPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, leaf, fur, spline } from '../_dsl.js';
import { flamePath, spiralPath, diamondPath } from '../_sigils.js';
import { evoGem } from '../_evo.js';

const drCrestStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };
const drWingStages = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.15, 1.15], add: [C(-24, -30, 1.6, 'a', { ns: true, op: 0.7 }), C(-32, -14, 1.4, 'a', { ns: true, op: 0.7 })] } };
const drVeins = (d) => L(d, 'k', 1.1, { op: 0.3 });

export const DR_HORNS = [
  NONE('horns', 0.3, 'd.'),
  drPart({ id: 'curved', slot: 'horns', name: 'Curved', tags: ['horn'], dom: 0.5, w: 3, shapes: [{ pts: tube([[-4, 0], [-12, -8], [-18, -20]], 6, 1.5, { tipK: 'c' }), f: 'a' }, { pts: tube([[4, 0], [0, -10], [-4, -22]], 6, 1.5, { tipK: 'c' }), f: 'a' }], extra: [L('M-7,-3 L-12,-9 M2,-4 L-1,-11', 'k', 0.9, { op: 0.3 })], stages: drCrestStages }),
  drPart({ id: 'straight', slot: 'horns', name: 'Straight', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-7, 1], [-14, -18, 'c'], [-2, 0]], [[2, 0], [6, -20, 'c'], [7, 1]]], extra: [HL('M-8,-3 L-12,-12 L-8,-6 Z', 0.25)], stages: drCrestStages }),
  drPart({ id: 'ram', slot: 'horns', name: 'Ram', tags: ['spiral'], dom: 0.5, w: 2, extra: [L(spiralPath(-8, -5, 8, 1.6, 180), 'a', 4.5), L(spiralPath(8, -5, 8, 1.6, 0), 'a', 4.5), L(spiralPath(-8, -5, 8, 1.6, 180), 'k', 0.9, { op: 0.25 }), L(spiralPath(8, -5, 8, 1.6, 0), 'k', 0.9, { op: 0.25 })], stages: drCrestStages }),
  drPart({ id: 'antler', slot: 'horns', name: 'Antlers', tags: ['branch'], dom: 0.5, w: 2, extra: [L('M-3,0 L-9,-14 M-9,-14 L-16,-18 M-9,-14 L-8,-24 M-6,-7 L-12,-9 M3,0 L9,-14 M9,-14 L16,-18 M9,-14 L8,-24 M6,-7 L12,-9', 'a', 3.2), L('M-3,0 L-9,-14 M3,0 L9,-14', 'k', 0.9, { op: 0.25 })], stages: drCrestStages }),
  drPart({ id: 'crown', slot: 'horns', name: 'Crown', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-12, 2], ...fur([-12, 2], [12, 2], 5, 10, { tip: 'c' }), [12, 5], [-12, 5]], f: 'a' }], extra: [C(-6, 0, 1, 'w', { ns: true, op: 0.6 }), C(6, 0, 1, 'w', { ns: true, op: 0.6 })], stages: drCrestStages }),
  drPart({ id: 'nubs', slot: 'horns', name: 'Nubs', tags: ['small'], dom: 0.5, w: 2, extra: [C(-6, -2, 3.2, 'pd', { sw: 1.2 }), C(6, -2, 3.2, 'pd', { sw: 1.2 }), C(-7, -3, 0.9, 'w', { ns: true, op: 0.6 }), C(5, -3, 0.9, 'w', { ns: true, op: 0.6 })], stages: drCrestStages }),
  drPart({ id: 'single', slot: 'horns', name: 'Single horn', tags: ['unicorn'], dom: 0.5, w: 2, shapes: [[[-4, 1], [1, -24, 'c'], [5, 1]]], extra: [L('M-2,-3 L3,-5 M-1,-8 L3,-10 M0,-13 L3,-15', 'k', 0.9, { op: 0.3 }), HL('M-3,-2 L0,-14 L-1,-4 Z', 0.25)], stages: drCrestStages }),
];

export const DR_WINGS = [
  drPart({ id: 'bat', slot: 'wings', name: 'Bat wings', tags: ['membrane'], dom: 0.5, w: 3, shapes: [[[0, 0], [-6, -16], [-16, -30], [-30, -38, 'c'], [-28, -24], [-38, -12, 'c'], [-30, -4], [-36, 6, 'c'], [-22, 2], [-10, 4]]], extra: [drVeins('M0,0 L-30,-38 M0,0 L-38,-12 M0,0 L-36,6'), L('M0,0 C-4,-10 -10,-22 -16,-30', 'pd', 3)], stages: drWingStages }),
  drPart({ id: 'feathered', slot: 'wings', name: 'Feathered', tags: ['bird'], dom: 0.5, w: 2, shapes: [[[0, 0], [-8, -14], [-20, -26], [-36, -32, 'c'], [-30, -22], [-38, -16, 'c'], [-28, -12], [-36, -4, 'c'], [-24, -2], [-30, 6, 'c'], [-16, 4], [-6, 4]]], extra: [drVeins('M-4,-4 C-14,-14 -24,-20 -34,-30 M-4,-2 C-14,-8 -24,-12 -34,-14 M-4,0 C-14,-2 -22,0 -30,4')], stages: drWingStages }),
  drPart({ id: 'small', slot: 'wings', name: 'Stubby', tags: ['small'], dom: 0.5, w: 2, shapes: [[[0, 0], [-4, -10], [-12, -18], [-20, -22, 'c'], [-18, -12], [-24, -6, 'c'], [-16, -2], [-8, 2]]], extra: [drVeins('M0,0 L-20,-22 M0,0 L-24,-6'), L('M0,0 C-3,-6 -8,-12 -12,-18', 'pd', 2.6)], stages: drWingStages }),
  drPart({ id: 'tattered', slot: 'wings', name: 'Tattered', tags: ['ragged'], dom: 0.5, w: 2, shapes: [[[0, 0], [-6, -16], [-16, -30], [-30, -36, 'c'], [-26, -26], [-34, -20, 'c'], [-26, -16], [-36, -10, 'c'], [-28, -6], [-34, 4, 'c'], [-24, 0], [-28, 8, 'c'], [-18, 2], [-10, 4]]], extra: [drVeins('M0,0 L-30,-36 M0,0 L-36,-10 M0,0 L-34,4'), L('M0,0 C-4,-10 -10,-22 -16,-30', 'pd', 3), C(-20, -14, 2, 'k', { ns: true, op: 0.4 }), C(-26, -2, 1.6, 'k', { ns: true, op: 0.4 })], stages: drWingStages }),
  drPart({ id: 'fairy', slot: 'wings', name: 'Fairy wings', tags: ['light'], dom: 0.45, w: 2, shapes: [{ d: leaf([0, 0], [-32, -32], 12), f: 'sl' }, { d: leaf([0, 2], [-30, 8], 9), f: 'sl' }], extra: [C(-18, -18, 2.4, 'a', { ns: true, op: 0.6 }), C(-18, 6, 2, 'a', { ns: true, op: 0.6 }), drVeins('M-2,-2 L-26,-26 M-2,2 L-24,6')], stages: drWingStages }),
  drPart({ id: 'fin', slot: 'wings', name: 'Sail fins', tags: ['fin'], dom: 0.5, w: 2, shapes: [[[0, 0], [-4, -14], [-10, -28], [-18, -38, 'c'], [-22, -26], [-30, -14], [-34, 0, 'c'], [-22, -2], [-10, 2]]], extra: [drVeins('M0,0 L-18,-38 M0,0 L-30,-14 M0,0 L-34,0'), HL('M-4,-10 C-8,-18 -12,-26 -16,-32 C-12,-24 -8,-16 -6,-8 Z', 0.2)], stages: drWingStages }),
  drPart({ id: 'crystal', slot: 'wings', name: 'Crystal', tags: ['gem'], dom: 0.5, w: 2, shapes: [[[0, 0], [-8, -18], [-14, -36], [-22, -30], [-24, -14], [-36, -8], [-28, 2], [-14, 4]]], extra: [drVeins('M0,0 L-14,-36 M0,0 L-36,-8 M-8,-18 L-24,-14'), HL('M-6,-10 L-12,-30 L-14,-20 L-10,-8 Z', 0.28)], stages: drWingStages }),
];

export const DR_SPINES = [
  NONE('spines', 0.3, 'd.'),
  drPart({ id: 'ridge', slot: 'spines', name: 'Ridge', tags: ['spiky'], dom: 0.5, w: 3, shapes: [{ pts: [[-20, 2], ...fur([-20, 2], [20, 2], 7, 9, { tip: 'c' }), [20, 6], [-20, 6]], f: 'a' }], stages: drCrestStages }),
  drPart({ id: 'sail', slot: 'spines', name: 'Sail', tags: ['fin'], dom: 0.5, w: 2, shapes: [{ pts: [[-22, 4], [-14, -10], [-4, -18], [8, -16], [18, -8], [24, 4]], f: 'a' }], extra: [L('M-14,3 L-12,-8 M-4,2 L-3,-15 M8,2 L8,-13 M18,3 L17,-6', 'k', 0.9, { op: 0.3 })], stages: drCrestStages }),
  drPart({ id: 'plates', slot: 'spines', name: 'Plates', tags: ['plate'], dom: 0.5, w: 2, shapes: [[[-20, 3], [-16, -8], [-10, 3]], [[-8, 3], [-3, -13], [4, 3]], [[6, 3], [12, -9], [18, 3]]], extra: [HL('M-18,1 L-16,-6 L-14,-1 Z', 0.25), HL('M-6,1 L-3,-10 L-1,-2 Z', 0.25)], stages: drCrestStages }),
  drPart({ id: 'fur', slot: 'spines', name: 'Mane', tags: ['fluffy'], dom: 0.5, w: 2, shapes: [{ pts: [[-20, 2], ...fur([-20, 2], [20, 2], 9, 6, { tip: 0.5 }), [20, 6], [-20, 6]], f: 'a' }], extra: [C(-10, -1, 0.9, 'w', { ns: true, op: 0.5 }), C(6, -2, 0.9, 'w', { ns: true, op: 0.5 })], stages: drCrestStages }),
  drPart({ id: 'flames', slot: 'spines', name: 'Flames', tags: ['fire'], dom: 0.5, w: 2, extra: [P(flamePath(-14, -4, 8), 'a', { sw: 1.2 }), P(flamePath(-2, -8, 11), 'a', { sw: 1.2 }), P(flamePath(10, -4, 8), 'a', { sw: 1.2 }), P(flamePath(-2, -5, 5), 'w', { ns: true, op: 0.5 })], stages: drCrestStages }),
  drPart({ id: 'crystals', slot: 'spines', name: 'Crystals', tags: ['gem'], dom: 0.5, w: 2, extra: [P(diamondPath(-14, -4, 6, 14), 'a', { sw: 1.2 }), P(diamondPath(-2, -8, 7, 18), 'a', { sw: 1.2 }), P(diamondPath(10, -4, 6, 14), 'a', { sw: 1.2 }), L('M-14,-10 L-14,2 M-2,-16 L-2,0 M10,-10 L10,2', 'w', 0.9, { op: 0.45 })], stages: drCrestStages }),
  drPart({ id: 'frill', slot: 'spines', name: 'Frill', tags: ['wavy'], dom: 0.5, w: 2, shapes: [{ pts: [[-20, 3], [-16, -8, 'c'], [-10, -2], [-4, -12, 'c'], [2, -2], [8, -12, 'c'], [14, -2], [18, -8, 'c'], [22, 3]], f: 'a' }], extra: [L('M-16,-4 L-14,2 M-4,-8 L-3,1 M8,-8 L8,1', 'k', 0.8, { op: 0.3 })], stages: drCrestStages }),
];
