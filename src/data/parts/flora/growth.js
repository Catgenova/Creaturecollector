// Flora vines (origin = the rear socket, trailing behind like a tail), pods (hanging from the front of the
// stem) and thorns (a crown drawn behind the bloom).
// Evolutions: the tail and crown families grow and spike; pods add more of themselves.
import { flPart } from './_shared.js';
import { NONE, L, C, E, P, HL, tube, leaf, fur, puff } from '../_dsl.js';
import { spiralPath, diamondPath } from '../_sigils.js';
import { evoRing, evoGem } from '../_evo.js';

const flThornTri = (x, y, a) => { const r = (a * Math.PI) / 180; const dx = Math.cos(r), dy = Math.sin(r); return P(`M${x - dy * 2},${y + dx * 2} L${x + dx * 6},${y + dy * 6} L${x + dy * 2},${y - dx * 2} Z`, 'a', { sw: 1.1 }); };
const flPodStages = (more) => ({ 2: { grow: [1.08, 1.1], add: more }, 3: { grow: [1.06, 1.08], add: [evoRing(0, 6, 4, 'a', 1, { op: 0.5 })] } });

export const FL_VINES = [
  NONE('vines', 0.3, 'p.'),
  flPart({ id: 'tendril', slot: 'vines', name: 'Tendril', tags: ['curl'], dom: 0.5, w: 3, shapes: [tube([[0, 0], [-12, 3], [-22, -4], [-30, 4]], 6, 2.5, { tipK: 1 })], extra: [L(spiralPath(-34, 3, 4, 1.5), 'p', 2)] }),
  flPart({ id: 'creeper', slot: 'vines', name: 'Creeper', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 6], [-30, 8], [-46, 10]], 6, 2, { tipK: 'c' })], extra: [P(leaf([-18, 6], [-24, -2], 3), 'p', { sw: 1.2 }), P(leaf([-34, 8], [-40, 0], 3), 'p', { sw: 1.2 })] }),
  flPart({ id: 'thorny', slot: 'vines', name: 'Thorny vine', tags: ['thorn'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 2], [-28, -2], [-40, 2]], 6, 3, { tipK: 'c' })], extra: [flThornTri(-8, -2, -110), flThornTri(-18, 4, 80), flThornTri(-28, -4, -100), flThornTri(-36, 4, 70)] }),
  flPart({ id: 'flowering', slot: 'vines', name: 'Flowering vine', tags: ['bloom'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-12, 4], [-24, 0], [-36, 4]], 6, 2.5, { tipK: 1 })], extra: [C(-12, -2, 3.2, 'a', { sw: 1.2 }), C(-12, -2, 1.1, 'w', { ns: true }), C(-26, 6, 3.4, 'a', { sw: 1.2 }), C(-26, 6, 1.1, 'w', { ns: true }), C(-38, 0, 2.8, 'a', { sw: 1.2 }), C(-38, 0, 1, 'w', { ns: true })] }),
  flPart({ id: 'hanging', slot: 'vines', name: 'Hanging vine', tags: ['down'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-6, 10], [-8, 22]], 5, 2, { tipK: 'c' })], extra: [P(leaf([-6, 10], [-12, 14], 2.5), 'p', { sw: 1.1 }), P(leaf([-8, 20], [-14, 22], 2.5), 'p', { sw: 1.1 })] }),
  flPart({ id: 'coil', slot: 'vines', name: 'Coil', tags: ['spiral'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-8, 2]], 6, 4, { tipK: 1 })], extra: [L(spiralPath(-18, 0, 10, 2.2), 'p', 4), L(spiralPath(-18, 0, 10, 2.2), 'k', 1, { op: 0.3 })] }),
  flPart({ id: 'whip', slot: 'vines', name: 'Whip vine', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-18, -4], [-34, -14], [-46, -26]], 5, 1.5, { tipK: 'c' })], extra: [L('M-4,-1 C-16,-4 -28,-12 -42,-24', 'k', 1, { op: 0.25 })] }),
];

export const FL_PODS = [
  NONE('pods', 0.3, 'p.'),
  flPart({ id: 'seedpods', slot: 'pods', name: 'Seed pods', tags: ['pod'], dom: 0.5, w: 3, extra: [L('M0,0 L-3,6 M0,0 L5,7', 'k', 1.4), E(-4, 10, 3.2, 5, 'a', { sw: 1.3 }), E(6, 11, 3.2, 5, 'a', { sw: 1.3 }), C(-5, 8, 0.9, 'w', { ns: true, op: 0.7 }), C(5, 9, 0.9, 'w', { ns: true, op: 0.7 })], stages: flPodStages([E(1, 16, 3, 4.6, 'a', { sw: 1.3 })]) }),
  flPart({ id: 'buds', slot: 'pods', name: 'Buds', tags: ['bud'], dom: 0.5, w: 2, extra: [L('M0,0 L-6,4 M0,0 L2,7 M0,0 L8,3', 'k', 1.3), C(-7, 5, 2.8, 's', { sw: 1.2 }), C(2, 9, 3, 's', { sw: 1.2 }), C(9, 4, 2.6, 's', { sw: 1.2 }), C(2, 9, 1.2, 'a', { ns: true })], stages: flPodStages([C(-3, 12, 3, 'a', { sw: 1.2 }), C(8, 11, 2.6, 'a', { sw: 1.2 })]) }),
  flPart({ id: 'berries', slot: 'pods', name: 'Berries', tags: ['berry'], dom: 0.5, w: 2, extra: [C(-4, 4, 2.8, 'a', { sw: 1.2 }), C(2, 2, 2.8, 'a', { sw: 1.2 }), C(6, 7, 2.8, 'a', { sw: 1.2 }), C(-1, 9, 2.8, 'a', { sw: 1.2 }), C(-5, 3, 0.8, 'w', { ns: true, op: 0.8 }), C(1, 1, 0.8, 'w', { ns: true, op: 0.8 }), C(5, 6, 0.8, 'w', { ns: true, op: 0.8 })], stages: flPodStages([C(8, 1, 2.6, 'a', { sw: 1.2 }), C(4, 13, 2.6, 'a', { sw: 1.2 })]) }),
  flPart({ id: 'pinecone', slot: 'pods', name: 'Pinecone', tags: ['cone'], dom: 0.5, w: 2, shapes: [[[0, 0], [5, 3], [7, 9], [4, 16], [0, 18], [-4, 16], [-7, 9], [-5, 3]]], extra: [L('M-5,5 L5,5 M-6,9 L6,9 M-5,13 L5,13 M0,2 L0,17 M-3,3 L-3,15 M3,3 L3,15', 'k', 1, { op: 0.35 })], stages: flPodStages([...evoGem(0, 10, 2.4)]) }),
  flPart({ id: 'acorn', slot: 'pods', name: 'Acorn', tags: ['nut'], dom: 0.5, w: 2, extra: [E(2, 10, 4.5, 5.5, 's', { sw: 1.3 }), P('M-3.5,7 C-2,3 6,3 7.5,7 Z', 'pd', { sw: 1.3 }), L('M2,3 L2,0', 'k', 1.6), C(0, 8, 0.9, 'w', { ns: true, op: 0.7 })], stages: flPodStages([E(-6, 12, 3.6, 4.4, 's', { sw: 1.2 }), P('M-10,9.6 C-9,6.5 -3,6.5 -2,9.6 Z', 'pd', { sw: 1.2 })]) }),
  flPart({ id: 'lantern', slot: 'pods', name: 'Lantern', tags: ['physalis'], dom: 0.5, w: 2, extra: [L('M0,0 L1,4', 'k', 1.4), P(diamondPath(1, 12, 10, 16), 'a', { sw: 1.3 }), C(1, 13, 2.6, 'pd', { ns: true, op: 0.6 }), L('M1,4 L1,20 M-3,8 L-2,17 M5,8 L4,17', 'k', 0.9, { op: 0.3 })], stages: flPodStages([C(1, 13, 1.2, 'w', { ns: true, op: 0.8 })]) }),
  flPart({ id: 'bulbs', slot: 'pods', name: 'Bulblets', tags: ['bulb'], dom: 0.5, w: 2, extra: [P('M-6,4 C-6,0 -2,-1 -1,3 C0,7 -2,11 -4,11 C-7,11 -8,7 -6,4 Z', 's', { sw: 1.2 }), P('M4,6 C4,2 8,1 9,5 C10,9 8,13 6,13 C3,13 2,9 4,6 Z', 's', { sw: 1.2 }), L('M-3,0 L-2,-3 M7,2 L8,-1', 'k', 1.2)], stages: flPodStages([P('M-1,12 C-1,8 3,7 4,11 C5,15 3,19 1,19 C-2,19 -3,15 -1,12 Z', 's', { sw: 1.2 })]) }),
];

export const FL_THORNS = [
  NONE('thorns', 0.3, 'p.'),
  flPart({ id: 'crown', slot: 'thorns', name: 'Thorn crown', tags: ['spiky'], dom: 0.5, w: 3, shapes: [[[-14, 0], ...fur([-14, 0], [14, 0], 5, 10, { tip: 'c' }), [14, 4], [-14, 4]]] }),
  flPart({ id: 'sepals', slot: 'thorns', name: 'Sepals', tags: ['leaf'], dom: 0.5, w: 2, shapes: [leaf([0, 0], [-13, -14], 4), leaf([0, 0], [0, -17], 4), leaf([0, 0], [13, -14], 4)], extra: [L('M0,0 L-10,-11 M0,0 L0,-14 M0,0 L10,-11', 'k', 1, { op: 0.3 })] }),
  flPart({ id: 'collar', slot: 'thorns', name: 'Collar', tags: ['ruff'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, -2, 13, 10, 4), f: 's' }] }),
  flPart({ id: 'halo', slot: 'thorns', name: 'Pollen halo', tags: ['light'], dom: 0.45, w: 2, extra: [evoRing(0, -4, 13, 'a', 1.4, { op: 0.7 }), ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => C(Math.cos((a * Math.PI) / 180) * 13, -4 + Math.sin((a * Math.PI) / 180) * 13, 1.8, 'a', { ns: true }))] }),
  flPart({ id: 'antlers', slot: 'thorns', name: 'Twig antlers', tags: ['branch'], dom: 0.5, w: 2, extra: [L('M-4,0 L-10,-14 M-10,-14 L-16,-18 M-10,-14 L-8,-22 M4,0 L10,-14 M10,-14 L16,-18 M10,-14 L8,-22', 'pd', 3.2), L('M-4,0 L-10,-14 M-10,-14 L-16,-18 M-10,-14 L-8,-22 M4,0 L10,-14 M10,-14 L16,-18 M10,-14 L8,-22', 'k', 1, { op: 0.25 })] }),
  flPart({ id: 'spikes', slot: 'thorns', name: 'Thorn pair', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[-12, 2], [-16, -14, 'c'], [-6, 0]], [[12, 2], [16, -14, 'c'], [6, 0]]], extra: [HL('M-14,-4 L-15,-11 L-13,-6 Z', 0.25)] }),
  flPart({ id: 'tuft', slot: 'thorns', name: 'Pollen tuft', tags: ['fluff'], dom: 0.45, w: 2, shapes: [{ pts: puff(0, -6, 8, 8, 3), f: 'a' }], extra: [C(-3, -9, 1, 'w', { ns: true, op: 0.7 }), C(2, -4, 0.8, 'w', { ns: true, op: 0.6 })] }),
];
