// Myriapod legs (origin = a belly socket; one part is drawn under three segments on each side, so it is a single
// leg hanging down and out) and tail ends (origin = the tail socket, trailing behind).
// Evolutions: legs grow and gain a knee ring; tails grow and spike.
import { myPart } from './_shared.js';
import { L, C, P, tube, fur, puff } from '../_dsl.js';
import { evoRing, evoSpike } from '../_evo.js';

const myLegStages = { 2: { grow: [1.06, 1.08] }, 3: { grow: [1.1, 1.14], add: [evoRing(3, 6, 2.4, 'a', 1, { op: 0.6 })] } };
const myTailStages = (x, y) => ({ 2: { grow: [1.1, 1.06] }, 3: { grow: [1.15, 1.1], addShapes: [{ pts: evoSpike(x, y, -100, 7, 3), f: 'a' }] } });
const myShin = (d, w = 2.6) => [L(d, 'k', w + 2.4), L(d, 'p', w)];
const myKnee = (x, y, r = 1.6) => C(x, y, r, 'pd', { sw: 1 });
const myClaw = (x, y) => P(`M${x - 1.6},${y - 1} L${x + 0.6},${y + 3.5} L${x + 2.2},${y - 1} Z`, 'w', { sw: 1 });

export const MY_LEGS = [
  myPart({ id: 'thin', slot: 'legs', name: 'Thin', tags: ['centipede'], dom: 0.5, w: 3, extra: [...myShin('M0,0 L4,6 L2,14'), myKnee(4, 6), myClaw(2, 14)], stages: myLegStages }),
  myPart({ id: 'hooked', slot: 'legs', name: 'Hooked', tags: ['hook'], dom: 0.5, w: 2, extra: [...myShin('M0,0 L4,6 L3,13 C1,15 -1,15 -2,13'), myKnee(4, 6), C(-2, 13, 0.8, 'w', { ns: true, op: 0.8 })], stages: myLegStages }),
  myPart({ id: 'spiny', slot: 'legs', name: 'Spiny', tags: ['spines'], dom: 0.5, w: 2, extra: [...myShin('M0,0 L5,6 L3,14'), L('M2,3 L0,5 M5,9 L7,11 M3,11 L1,13', 'p', 1.2), myKnee(5, 6), myClaw(3, 14)], stages: myLegStages }),
  myPart({ id: 'thick', slot: 'legs', name: 'Thick', tags: ['millipede'], dom: 0.55, w: 3, extra: [...myShin('M0,0 L3,6 L2,13', 4), myKnee(3, 6, 2.2), P('M-1,12 L5,12 L6,15 L-2,15 Z', 'pd', { sw: 1 })], stages: myLegStages }),
  myPart({ id: 'long', slot: 'legs', name: 'Long', tags: ['tall'], dom: 0.5, w: 2, extra: [...myShin('M0,0 L6,8 L3,20'), myKnee(6, 8), myClaw(3, 20)], stages: myLegStages }),
  myPart({ id: 'paddle', slot: 'legs', name: 'Paddle', tags: ['swim'], dom: 0.5, w: 2, extra: [...myShin('M0,0 L3,5 L2,10'), myKnee(3, 5), P('M-2,10 C-3,14 0,17 3,17 C6,17 8,14 6,10 Z', 'pd', { sw: 1.2 }), L('M2,11 L2,16', 'k', 0.8, { op: 0.3 })], stages: myLegStages }),
  myPart({ id: 'stilt', slot: 'legs', name: 'Stilt', tags: ['straight'], dom: 0.5, w: 2, extra: [...myShin('M0,0 L2,9 L1,18', 2.2), myKnee(2, 9, 1.4), myClaw(1, 18)], stages: myLegStages }),
];

export const MY_TAILS = [
  myPart({ id: 'forks', slot: 'tail', name: 'Forks', tags: ['terminal'], dom: 0.5, w: 3, extra: [L('M0,-2 L-14,-9 M0,2 L-14,9', 'k', 4.4), L('M0,-2 L-14,-9 M0,2 L-14,9', 'p', 2.2), C(-14, -9, 1.1, 'a', { ns: true }), C(-14, 9, 1.1, 'a', { ns: true })], stages: myTailStages(-12, -8) }),
  myPart({ id: 'pincer', slot: 'tail', name: 'Pincer', tags: ['earwig'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -4], [-8, -7], [-16, -6], [-20, -1, 'c'], [-15, -3], [-8, -3], [0, -1]], f: 'p' }, { pts: [[0, 4], [-8, 7], [-16, 6], [-20, 1, 'c'], [-15, 3], [-8, 3], [0, 1]], f: 'p' }], extra: [C(-19, -1, 0.8, 'w', { ns: true, op: 0.7 }), C(-19, 1, 0.8, 'w', { ns: true, op: 0.7 })], stages: myTailStages(-16, -6) }),
  myPart({ id: 'stinger', slot: 'tail', name: 'Stinger', tags: ['sting'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-10, 2], [-18, -2], [-24, -10]], 6, 1.4, { tipK: 'c' })], extra: [C(-23, -9, 1, 'a', { ns: true }), L('M-6,2 L-6,4 M-12,1 L-12,3', 'k', 0.9, { op: 0.3 })], stages: myTailStages(-20, -6) }),
  myPart({ id: 'blunt', slot: 'tail', name: 'Blunt', tags: ['short'], dom: 0.5, w: 3, shapes: [[[0, -6], [-8, -6], [-12, -2, 0.8], [-12, 2, 0.8], [-8, 6], [0, 6]]], extra: [L('M-4,-5 L-4,5', 'k', 1, { op: 0.3 })], stages: myTailStages(-10, -4) }),
  myPart({ id: 'plume', slot: 'tail', name: 'Plume', tags: ['fur'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3], ...fur([0, -3], [0, 3], 0, 0), [-6, -4], ...fur([-6, -4], [-6, 4], 3, 0), [0, 3]], f: 'p' }, { pts: puff(-14, 0, 6, 9, 2.5, { tip: 'c' }), f: 'a' }], extra: [C(-14, 0, 1.6, 'w', { ns: true, op: 0.5 })], stages: myTailStages(-14, -8) }),
  myPart({ id: 'fan', slot: 'tail', name: 'Fan', tags: ['fan'], dom: 0.5, w: 2, shapes: [{ pts: [[0, -3], [-14, -12], [-20, -4, 'c'], [-22, 4, 'c'], [-14, 12], [0, 3]], f: 's' }], extra: [L('M0,0 L-14,-12 M0,0 L-20,-4 M0,0 L-22,4 M0,0 L-14,12', 'pd', 1.6)], stages: myTailStages(-18, -6) }),
  myPart({ id: 'spike', slot: 'tail', name: 'Spike', tags: ['long'], dom: 0.5, w: 2, shapes: [tube([[0, 0], [-14, 0], [-30, -3]], 6, 1.2, { tipK: 'c' })], extra: [L('M-6,-1 L-6,2 M-12,-1 L-12,2', 'k', 0.9, { op: 0.3 }), C(-28, -3, 0.9, 'a', { ns: true })], stages: myTailStages(-26, -2) }),
];
