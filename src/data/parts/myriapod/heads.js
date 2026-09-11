// Myriapod heads. Origin = the neck point at the back; the face reaches right. Sockets: eye / eyeFar, mandibles
// (the front), antennae (the top), venom (under the front).
// Evolutions: stage 2 marks the brow in the accent colour; stage 3 grows a brow spur and streaks the cheek.
import { myPart } from './_shared.js';
import { L, HL, PATCH } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const myHeadStages = {
  2: { grow: [1.05, 1.05], add: [PATCH('M2,-9 C6,-12 10,-12 14,-9 C10,-8 6,-8 2,-9 Z', 'a')] },
  3: { grow: [1.05, 1.06], addShapes: [{ pts: evoSpike(4, -10, -100, 9, 4), f: 'pd' }], add: [PATCH('M2,-9 C6,-12 10,-12 14,-9 C10,-8 6,-8 2,-9 Z', 'a'), L('M12,4 L16,7 M14,1 L19,3', 'a', 1.4, { ns: true })] },
};
const myHeadSockets = (o = {}) => ({ eye: { x: 9, y: -4, s: 1 }, eyeFar: { x: 2, y: -5, s: 0.9 }, mandibles: { x: 17, y: 3, a: 0, s: 1 }, antennae: { x: 9, y: -9, a: 0, s: 1 }, venom: { x: 15, y: 5, a: 0, s: 1 }, ...o });
const myCheek = (d) => L(d, 'k', 1.2, { op: 0.3 });

export const MY_HEADS = [
  myPart({ id: 'capsule', slot: 'head', name: 'Capsule', tags: ['round'], dom: 0.5, w: 3, shapes: [[[-4, -9], [6, -11], [16, -9], [20, -2], [18, 6], [8, 9], [-4, 7]]], extra: [myCheek('M0,3 L-2,7 M12,6 L14,9'), HL('M-2,-8 C2,-11 8,-11 12,-9 C8,-8 2,-6 -2,-4 Z', 0.2)], sockets: myHeadSockets(), stages: myHeadStages }),
  myPart({ id: 'shield', slot: 'head', name: 'Shield', tags: ['flat'], dom: 0.5, w: 2, shapes: [[[-4, -10], [8, -13], [22, -10], [26, -2], [22, 5], [8, 8], [-4, 6]]], extra: [myCheek('M0,-10 L2,6'), L('M4,-11 C12,-13 20,-11 25,-3', 'k', 1, { op: 0.25 }), HL('M-2,-9 C4,-13 10,-13 14,-11 C8,-10 2,-8 -2,-5 Z', 0.2)], sockets: myHeadSockets({ eye: { x: 12, y: -4, s: 1 }, eyeFar: { x: 4, y: -5, s: 0.9 }, mandibles: { x: 22, y: 3, a: 0, s: 1 }, antennae: { x: 12, y: -12, a: 0, s: 1 }, venom: { x: 20, y: 5, a: 0, s: 1 } }), stages: myHeadStages }),
  myPart({ id: 'pincer', slot: 'head', name: 'Pincer', tags: ['notched'], dom: 0.5, w: 2, shapes: [[[-4, -9], [6, -12], [18, -10], [24, -6, 'c'], [20, -2], [24, 4, 'c'], [16, 7], [6, 9], [-4, 7]]], extra: [myCheek('M0,3 L-2,7'), HL('M-2,-8 C2,-12 8,-12 12,-10 C8,-9 2,-7 -2,-4 Z', 0.2)], sockets: myHeadSockets({ mandibles: { x: 20, y: 0, a: 0, s: 1 }, venom: { x: 18, y: 6, a: 0, s: 1 } }), stages: myHeadStages }),
  myPart({ id: 'bulb', slot: 'head', name: 'Bulb', tags: ['round'], dom: 0.5, w: 2, shapes: [[[-4, -10], [6, -14], [16, -12], [21, -4], [19, 6], [10, 10], [0, 10], [-4, 5]]], extra: [myCheek('M2,5 L0,9'), HL('M-2,-9 C2,-13 8,-14 12,-12 C8,-10 2,-8 -2,-5 Z', 0.2)], sockets: myHeadSockets({ eye: { x: 10, y: -5, s: 1.05 }, eyeFar: { x: 2, y: -6, s: 0.95 }, mandibles: { x: 18, y: 4, a: 0, s: 1 }, antennae: { x: 8, y: -12, a: 0, s: 1 }, venom: { x: 16, y: 7, a: 0, s: 1 } }), stages: myHeadStages }),
  myPart({ id: 'narrow', slot: 'head', name: 'Narrow', tags: ['long'], dom: 0.5, w: 2, shapes: [[[-4, -7], [6, -9], [18, -8], [26, -3], [22, 4], [12, 6], [2, 6], [-4, 4]]], extra: [myCheek('M0,2 L-2,5'), L('M12,-7 C18,-6 22,-4 25,-2', 'k', 1, { op: 0.25 }), HL('M-2,-6 C2,-9 8,-9 12,-8 C8,-7 2,-5 -2,-3 Z', 0.2)], sockets: myHeadSockets({ eye: { x: 8, y: -3, s: 0.95 }, eyeFar: { x: 1, y: -4, s: 0.85 }, mandibles: { x: 24, y: 1, a: 0, s: 1 }, antennae: { x: 8, y: -7, a: 0, s: 1 }, venom: { x: 20, y: 4, a: 0, s: 1 } }), stages: myHeadStages }),
  myPart({ id: 'horned', slot: 'head', name: 'Horned', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-4, -9], [2, -16, 'c'], [8, -10], [14, -17, 'c'], [18, -8], [22, -2], [18, 6], [8, 9], [-4, 7]]], extra: [myCheek('M0,3 L-2,7'), L('M2,-15 L4,-9 M14,-16 L14,-9', 'k', 1, { op: 0.3 }), HL('M-2,-8 C2,-11 6,-11 10,-9 C6,-8 2,-6 -2,-4 Z', 0.2)], sockets: myHeadSockets({ eye: { x: 10, y: -4, s: 1 }, antennae: { x: 8, y: -9, a: 0, s: 1 } }), stages: myHeadStages }),
  myPart({ id: 'helm', slot: 'head', name: 'Helm', tags: ['armour'], dom: 0.55, w: 2, shapes: [[[-4, -11, 'c'], [10, -13, 'c'], [22, -8, 'c'], [24, 2, 'c'], [18, 7, 'c'], [6, 9, 'c'], [-4, 7, 'c']]], extra: [myCheek('M0,3 L-2,7'), L('M4,-12 L6,7 M14,-11 L16,6', 'k', 1, { op: 0.28 }), HL('M-2,-10 C2,-12 8,-13 12,-11 C8,-10 2,-8 -2,-5 Z', 0.2)], sockets: myHeadSockets({ eye: { x: 10, y: -4, s: 1 }, mandibles: { x: 20, y: 4, a: 0, s: 1 }, antennae: { x: 10, y: -12, a: 0, s: 1 }, venom: { x: 18, y: 6, a: 0, s: 1 } }), stages: myHeadStages }),
];
