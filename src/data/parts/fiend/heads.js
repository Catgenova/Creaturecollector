// Fiend heads. Origin = the neck (bottom centre); the head stands above it and the face looks right. Sockets: eye /
// eyeFar, mouth (the front), horns (the crown of the skull).
// Evolutions: stage 2 marks the brow; stage 3 grows a brow ridge spur and streaks the cheek.
import { fdPart } from './_shared.js';
import { L, HL, PATCH } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const fdHeadStages = {
  2: { grow: [1.05, 1.05], add: [PATCH('M-2,-21 C2,-24 6,-24 10,-21 C6,-20 2,-20 -2,-21 Z', 'a')] },
  3: { grow: [1.05, 1.06], addShapes: [{ pts: evoSpike(-4, -22, -120, 9, 4), f: 'pd' }], add: [PATCH('M-2,-21 C2,-24 6,-24 10,-21 C6,-20 2,-20 -2,-21 Z', 'a'), L('M8,-8 L12,-10 M9,-4 L14,-5', 'a', 1.4, { ns: true })] },
};
const fdHeadSockets = (o = {}) => ({ eye: { x: 6, y: -16, s: 1 }, eyeFar: { x: -3, y: -17, s: 0.9 }, mouth: { x: 9, y: -7, a: 0, s: 1 }, horns: { x: 0, y: -26, a: 0, s: 1 }, ...o });
const fdCheek = (d) => L(d, 'k', 1.2, { op: 0.3 });

export const FD_HEADS = [
  fdPart({ id: 'imp', slot: 'head', name: 'Imp', tags: ['round'], dom: 0.5, w: 3, shapes: [[[-8, -2], [-12, -12], [-8, -24], [2, -28], [12, -22], [14, -12], [10, -4], [4, 0]]], extra: [fdCheek('M-6,-8 L-9,-6 M12,-10 L13,-6'), HL('M-8,-22 C-4,-27 2,-28 8,-25 C2,-24 -4,-22 -8,-16 Z', 0.2)], sockets: fdHeadSockets(), stages: fdHeadStages }),
  fdPart({ id: 'goat', slot: 'head', name: 'Goat', tags: ['long'], dom: 0.5, w: 2, shapes: [[[-8, -2], [-12, -12], [-8, -24], [2, -28], [10, -24], [14, -14], [22, -4], [14, 0], [4, 0]]], extra: [fdCheek('M-6,-8 L-9,-6 M8,-8 L16,-4'), L('M12,-14 C16,-10 19,-7 21,-5', 'k', 1.1, { op: 0.3 }), HL('M-8,-22 C-4,-27 2,-28 8,-25 C2,-24 -4,-22 -8,-16 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 5, y: -17, s: 1 }, mouth: { x: 18, y: -3, a: 0, s: 1 } }), stages: fdHeadStages }),
  fdPart({ id: 'gaunt', slot: 'head', name: 'Gaunt', tags: ['skull'], dom: 0.5, w: 2, shapes: [[[-6, -2], [-10, -12], [-8, -26], [2, -30], [10, -26], [12, -14], [10, -6], [4, 0]]], extra: [fdCheek('M-4,-10 L-7,-6 M8,-10 L10,-6'), L('M-2,-8 C2,-6 6,-6 8,-8', 'k', 1.1, { op: 0.3 }), HL('M-6,-24 C-2,-29 2,-30 8,-27 C2,-26 -2,-24 -6,-18 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 5, y: -18, s: 1 }, eyeFar: { x: -3, y: -19, s: 0.9 }, mouth: { x: 8, y: -8, a: 0, s: 1 }, horns: { x: 0, y: -28, a: 0, s: 1 } }), stages: fdHeadStages }),
  fdPart({ id: 'brute', slot: 'head', name: 'Brute', tags: ['heavy'], dom: 0.55, w: 2, shapes: [[[-10, -2], [-12, -12], [-10, -22], [0, -26], [12, -22], [16, -12], [16, -4], [8, 0]]], extra: [fdCheek('M-8,-8 L-10,-4 M12,-6 L14,-2'), L('M-8,-16 C-2,-18 8,-18 14,-14', 'k', 1.2, { op: 0.3 }), HL('M-8,-20 C-4,-25 2,-26 8,-23 C2,-22 -4,-20 -8,-14 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 7, y: -14, s: 1 }, eyeFar: { x: -3, y: -15, s: 0.9 }, mouth: { x: 11, y: -5, a: 0, s: 1 }, horns: { x: 0, y: -24, a: 0, s: 1 } }), stages: fdHeadStages }),
  fdPart({ id: 'hound', slot: 'head', name: 'Hound', tags: ['snout'], dom: 0.5, w: 2, shapes: [[[-8, -2], [-12, -12], [-8, -24], [2, -27], [10, -22], [20, -14], [22, -8], [14, -2], [4, 0]]], extra: [fdCheek('M-6,-8 L-9,-6 M6,-6 L12,-4'), L('M10,-20 C14,-17 18,-14 20,-10', 'k', 1.1, { op: 0.3 }), HL('M-8,-22 C-4,-26 2,-27 8,-24 C2,-23 -4,-21 -8,-16 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 5, y: -16, s: 1 }, mouth: { x: 17, y: -6, a: 0, s: 1 } }), stages: fdHeadStages }),
  fdPart({ id: 'sly', slot: 'head', name: 'Sly', tags: ['narrow'], dom: 0.5, w: 2, shapes: [[[-6, -2], [-10, -10], [-8, -22], [2, -26], [10, -22], [16, -14], [14, -6], [6, 0]]], extra: [fdCheek('M-4,-8 L-7,-6 M10,-8 L12,-5'), HL('M-6,-20 C-2,-25 2,-26 8,-23 C2,-22 -2,-20 -6,-14 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 6, y: -15, s: 1 }, eyeFar: { x: -2, y: -16, s: 0.9 }, mouth: { x: 11, y: -8, a: 0, s: 1 }, horns: { x: 0, y: -24, a: 0, s: 1 } }), stages: fdHeadStages }),
  fdPart({ id: 'ridged', slot: 'head', name: 'Ridged', tags: ['bony'], dom: 0.5, w: 2, shapes: [[[-8, -2], [-12, -12], [-10, -22, 'c'], [-4, -26], [4, -30, 'c'], [10, -24], [14, -12], [12, -4], [4, 0]]], extra: [fdCheek('M-6,-8 L-9,-6 M10,-8 L12,-4'), L('M-8,-20 L-2,-24 L6,-22 M-6,-18 L0,-20 L6,-18', 'k', 1.1, { op: 0.3 }), HL('M-8,-20 C-4,-25 0,-27 6,-26 C0,-24 -4,-21 -8,-15 Z', 0.2)], sockets: fdHeadSockets({ eye: { x: 6, y: -15, s: 1 }, eyeFar: { x: -3, y: -16, s: 0.9 }, mouth: { x: 10, y: -6, a: 0, s: 1 }, horns: { x: 0, y: -27, a: 0, s: 1 } }), stages: fdHeadStages }),
];
