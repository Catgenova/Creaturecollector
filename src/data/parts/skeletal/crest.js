// Skeletal horns (on the brow, behind the skull), wings (bone wings from the spine, drawn behind the body) and the
// heart light (a small glow set among the ribs, in front).
// Evolutions: horns grow with the crown family; wings grow; lights ring then glow.
import { skPart } from './_shared.js';
import { NONE, L, C, P, HL, tube, fur } from '../_dsl.js';
import { flamePath, spiralPath, starPath, diamondPath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const skGrow = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };
const skLightStages = (r) => ({ 2: { grow: [1.08, 1.08], add: [evoRing(0, 0, r * 1.5, 'a', 1, { op: 0.6 })] }, 3: { grow: [1.1, 1.1], add: [C(0, 0, r * 2.4, 'a', { ns: true, op: 0.16 })] } });
const skFingers = (d) => L(d, 'p', 2.6);

export const SK_HORNS = [
  NONE('horns', 0.3, 'k.'),
  skPart({ id: 'antler', slot: 'horns', name: 'Antlers', tags: ['branch'], dom: 0.5, w: 3, extra: [L('M-3,0 L-9,-14 M-9,-14 L-16,-18 M-9,-14 L-8,-24 M-6,-7 L-12,-9 M3,0 L9,-14 M9,-14 L16,-18 M9,-14 L8,-24 M6,-7 L12,-9', 'p', 3.2), L('M-3,0 L-9,-14 M3,0 L9,-14', 'k', 0.9, { op: 0.25 })], stages: skGrow }),
  skPart({ id: 'ram', slot: 'horns', name: 'Ram', tags: ['spiral'], dom: 0.5, w: 2, extra: [L(spiralPath(-8, -5, 8, 1.6, 180), 'p', 4.5), L(spiralPath(8, -5, 8, 1.6, 0), 'p', 4.5), L(spiralPath(-8, -5, 8, 1.6, 180), 'k', 0.9, { op: 0.25 }), L(spiralPath(8, -5, 8, 1.6, 0), 'k', 0.9, { op: 0.25 })], stages: skGrow }),
  skPart({ id: 'straight', slot: 'horns', name: 'Straight', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-7, 1], [-14, -18, 'c'], [-2, 0]], [[2, 0], [6, -20, 'c'], [7, 1]]], extra: [HL('M-8,-3 L-12,-12 L-8,-6 Z', 0.25)], stages: skGrow }),
  skPart({ id: 'crown', slot: 'horns', name: 'Bone crown', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-12, 2], ...fur([-12, 2], [12, 2], 5, 10, { tip: 'c' }), [12, 5], [-12, 5]], f: 'p' }], extra: [C(-6, 0, 1, 'a', { ns: true, op: 0.7 }), C(6, 0, 1, 'a', { ns: true, op: 0.7 })], stages: skGrow }),
  skPart({ id: 'single', slot: 'horns', name: 'Single horn', tags: ['unicorn'], dom: 0.5, w: 2, shapes: [[[-4, 1], [1, -24, 'c'], [5, 1]]], extra: [L('M-2,-3 L3,-5 M-1,-8 L3,-10 M0,-13 L3,-15', 'k', 0.9, { op: 0.3 })], stages: skGrow }),
  skPart({ id: 'curved', slot: 'horns', name: 'Curved', tags: ['horn'], dom: 0.5, w: 2, shapes: [tube([[-4, 0], [-12, -8], [-18, -20]], 6, 1.5, { tipK: 'c' }), tube([[4, 0], [0, -10], [-4, -22]], 6, 1.5, { tipK: 'c' })], extra: [L('M-7,-3 L-12,-9 M2,-4 L-1,-11', 'k', 0.9, { op: 0.3 })], stages: skGrow }),
  skPart({ id: 'nubs', slot: 'horns', name: 'Nubs', tags: ['small'], dom: 0.5, w: 2, extra: [C(-6, -2, 3.2, 'pd', { sw: 1.2 }), C(6, -2, 3.2, 'pd', { sw: 1.2 }), C(-7, -3, 0.9, 'w', { ns: true, op: 0.6 }), C(5, -3, 0.9, 'w', { ns: true, op: 0.6 })], stages: skGrow }),
];

export const SK_WINGS = [
  NONE('wings', 0.3, 'k.'),
  skPart({ id: 'bare', slot: 'wings', name: 'Bare bones', tags: ['bone'], dom: 0.5, w: 3, extra: [skFingers('M0,0 L-10,-22 M-10,-22 L-30,-38 M-10,-22 L-36,-16 M-10,-22 L-34,4'), C(-10, -22, 2.4, 'pd', { sw: 1 })], stages: skGrow }),
  skPart({ id: 'tattered', slot: 'wings', name: 'Tattered', tags: ['membrane'], dom: 0.5, w: 2, shapes: [{ pts: [[0, 0], [-6, -16], [-16, -30], [-30, -36, 'c'], [-26, -26], [-34, -20, 'c'], [-26, -16], [-36, -10, 'c'], [-28, -6], [-34, 4, 'c'], [-24, 0], [-10, 4]], f: 'sd' }], extra: [skFingers('M0,0 L-10,-22 M-10,-22 L-30,-36 M-10,-22 L-36,-10 M-10,-22 L-34,4'), C(-20, -14, 2, 'k', { ns: true, op: 0.4 })], stages: skGrow }),
  skPart({ id: 'ribbed', slot: 'wings', name: 'Ribbed', tags: ['bone'], dom: 0.5, w: 2, extra: [skFingers('M0,0 C-8,-10 -14,-20 -16,-30 M-4,-4 C-14,-10 -22,-14 -32,-14 M-4,-2 C-14,-2 -24,0 -34,4'), L('M-16,-30 L-14,-24 M-32,-14 L-28,-10 M-34,4 L-30,2', 'p', 2)], stages: skGrow }),
  skPart({ id: 'feather', slot: 'wings', name: 'Feather bones', tags: ['bird'], dom: 0.5, w: 2, extra: [skFingers('M0,0 L-8,-14 M-8,-14 L-36,-30 M-8,-14 L-38,-16 M-8,-14 L-36,-2 M-8,-14 L-30,10'), L('M-30,-30 L-36,-30 M-32,-16 L-38,-16 M-30,-2 L-36,-2', 'p', 1.6)], stages: skGrow }),
  skPart({ id: 'stub', slot: 'wings', name: 'Stub', tags: ['small'], dom: 0.5, w: 2, extra: [skFingers('M0,0 L-6,-12 M-6,-12 L-18,-20 M-6,-12 L-22,-8'), C(-6, -12, 2, 'pd', { sw: 1 })], stages: skGrow }),
  skPart({ id: 'wide', slot: 'wings', name: 'Wide', tags: ['big'], dom: 0.55, w: 2, extra: [skFingers('M0,0 L-12,-24 M-12,-24 L-40,-44 M-12,-24 L-46,-24 M-12,-24 L-44,0 M-12,-24 L-34,12'), C(-12, -24, 2.6, 'pd', { sw: 1 })], stages: skGrow }),
  skPart({ id: 'fan', slot: 'wings', name: 'Fan', tags: ['fan'], dom: 0.5, w: 2, extra: [skFingers('M0,0 L-20,-30 M0,0 L-30,-22 M0,0 L-36,-8 M0,0 L-34,6 M0,0 L-26,16'), L('M-20,-30 C-28,-28 -34,-18 -36,-8 C-36,-2 -32,10 -26,16', 'p', 1.6, { op: 0.6 })], stages: skGrow }),
];

export const SK_LIGHTS = [
  NONE('light', 0.3, 'k.'),
  skPart({ id: 'ember', slot: 'light', name: 'Ember', tags: ['fire'], dom: 0.5, w: 3, extra: [C(0, 0, 7, 'a', { ns: true, op: 0.2 }), C(0, 0, 3.6, 'a', { ns: true }), C(-1, -1, 1.2, 'w', { ns: true, op: 0.8 })], stages: skLightStages(3.6) }),
  skPart({ id: 'flame', slot: 'light', name: 'Heart flame', tags: ['fire'], dom: 0.5, w: 2, extra: [C(0, -1, 8, 'a', { ns: true, op: 0.18 }), P(flamePath(0, -1, 7), 'a', { ns: true }), P(flamePath(0, 1, 3.6), 'w', { ns: true, op: 0.7 })], stages: skLightStages(4) }),
  skPart({ id: 'orb', slot: 'light', name: 'Orb', tags: ['orb'], dom: 0.5, w: 2, extra: [C(0, 0, 8, 'a', { ns: true, op: 0.16 }), C(0, 0, 4.4, 'a', { sw: 1.2 }), C(-1.4, -1.4, 1.4, 'w', { ns: true, op: 0.85 })], stages: skLightStages(4.4) }),
  skPart({ id: 'star', slot: 'light', name: 'Star', tags: ['star'], dom: 0.5, w: 2, extra: [C(0, 0, 8, 'a', { ns: true, op: 0.16 }), P(starPath(0, 0, 5.5, 5, 0.45), 'a', { ns: true }), C(0, 0, 1.2, 'w', { ns: true, op: 0.85 })], stages: skLightStages(4) }),
  skPart({ id: 'moth', slot: 'light', name: 'Light moth', tags: ['moth'], dom: 0.5, w: 2, extra: [C(0, 0, 7, 'a', { ns: true, op: 0.16 }), P('M0,0 C-3,-5 -8,-5 -8,-1 C-8,2 -4,3 0,1 C4,3 8,2 8,-1 C8,-5 3,-5 0,0 Z', 'a', { ns: true }), L('M0,-1 L0,3', 'w', 1, { op: 0.7 })], stages: skLightStages(4) }),
  skPart({ id: 'coal', slot: 'light', name: 'Coal', tags: ['dark'], dom: 0.5, w: 2, extra: [C(0, 0, 6, 'a', { ns: true, op: 0.14 }), P('M-4,-2 L-1,-4 L3,-3 L4,1 L1,4 L-3,3 Z', 'k', { ns: true, op: 0.9 }), L('M-2,-1 L2,1', 'a', 1.2, { op: 0.9 })], stages: skLightStages(3.4) }),
  skPart({ id: 'gem', slot: 'light', name: 'Heart gem', tags: ['gem'], dom: 0.5, w: 2, extra: [C(0, 0, 8, 'a', { ns: true, op: 0.16 }), P(diamondPath(0, 0, 7, 9), 'a', { ns: true }), P('M-2,-2.6 L0.4,-4.2 L0,-0.6 Z', 'w', { ns: true, op: 0.8 })], stages: skLightStages(4.2) }),
];
