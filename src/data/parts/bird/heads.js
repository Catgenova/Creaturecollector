// Bird heads. Origin = neck point (bottom centre of the head). Sockets: eye / eyeFar (null on
// side-view heads), beak {x,y,a,s} at the front, crest {x,y,a,s} on the crown, face {x,y,s} centre of the face.
import { bPart } from './_shared.js';
import { PATCH, SH, HL, L, C } from '../_dsl.js';
import { sparklePath, diamondPath, boltPath, heartPath, starPath, crescentPath } from '../_sigils.js';

export const B_HEADS = [
  bPart({
    id: 'round', slot: 'head', name: 'Round', tags: ['songbird'], dom: 0.5, w: 3,
    shapes: [[[0, -34], [14, -30], [20, -18], [18, -6], [8, 2], [-6, 2], [-16, -6], [-18, -18], [-12, -30]]],
    extra: [PATCH('M22,-10 C14,-4 4,-2 -8,-4 C-14,-6 -18,-8 -20,-12 L-22,6 L22,6 Z', 's'), SH('M-18,-8 C-8,0 8,2 20,-6 L20,6 L-18,6 Z', 0.1), HL('M-8,-31 C-2,-36 8,-36 14,-30 C8,-32 0,-32 -6,-28 Z', 0.2), PATCH(sparklePath(3, -27, 4.5), 'a')],
    sockets: { eye: { x: 8, y: -20, s: 1 }, eyeFar: { x: -8, y: -21, s: 0.8 }, beak: { x: 19, y: -14, a: 0, s: 1 }, crest: { x: 2, y: -34, a: 0, s: 1 }, face: { x: 4, y: -16, s: 1 } },
  }),
  bPart({
    id: 'owl', slot: 'head', name: 'Owl', tags: ['owl', 'wide'], dom: 0.55, w: 2,
    shapes: [[[-16, -34, 0.3], [0, -36], [16, -34, 0.3], [24, -20], [22, -6], [12, 2], [-12, 2], [-22, -6], [-24, -20]]],
    extra: [SH('M-24,-8 C-10,2 10,2 24,-8 L24,6 L-24,6 Z', 0.1), HL('M-12,-33 C-4,-37 6,-37 14,-33 C6,-34 -4,-34 -10,-31 Z', 0.18), PATCH(diamondPath(0, -29, 5, 7), 'a')],
    sockets: { eye: { x: 9, y: -20, s: 1.2 }, eyeFar: { x: -9, y: -20, s: 1.1 }, beak: { x: 0, y: -10, a: 0, s: 0.8 }, crest: { x: 0, y: -36, a: 0, s: 1 }, face: { x: 0, y: -18, s: 1 } },
  }),
  bPart({
    id: 'hawk', slot: 'head', name: 'Hawk', tags: ['raptor'], dom: 0.55, w: 2,
    shapes: [[[-2, -32], [14, -30], [22, -22], [24, -12], [16, -2], [4, 2], [-10, 2], [-18, -8], [-18, -20], [-12, -28]]],
    extra: [PATCH('M26,-10 C16,-4 4,-2 -8,-4 C-14,-6 -18,-8 -20,-12 L-22,6 L26,6 Z', 's'), L('M-4,-24 C4,-28 12,-26 18,-20', 'k', 1.5, { op: 0.4 }), SH('M-18,-8 C-8,0 8,2 22,-6 L22,6 L-18,6 Z', 0.1), HL('M-8,-29 C-2,-34 8,-34 14,-28 C8,-30 0,-30 -6,-26 Z', 0.18), PATCH(boltPath(2, -26, 4.5, 10), 'a')],
    sockets: { eye: { x: 10, y: -19, s: 0.95 }, eyeFar: null, beak: { x: 23, y: -16, a: 0, s: 1 }, crest: { x: 2, y: -32, a: 0, s: 1 }, face: { x: 6, y: -16, s: 1 } },
  }),
  bPart({
    id: 'penguin', slot: 'head', name: 'Small round', tags: ['penguin'], dom: 0.45, w: 2,
    shapes: [[[0, -30], [12, -26], [16, -16], [14, -6], [6, 2], [-6, 2], [-14, -6], [-16, -16], [-12, -26]]],
    extra: [PATCH('M12,-20 C14,-12 10,-4 2,-2 C-6,-2 -12,-8 -12,-16 C-10,-22 -4,-22 0,-18 C4,-22 10,-24 12,-20 Z', 's'), SH('M-16,-6 C-8,2 8,2 16,-6 L16,6 L-16,6 Z', 0.1), HL('M-8,-27 C-2,-32 6,-32 12,-26 C6,-28 0,-28 -6,-24 Z', 0.18), PATCH(heartPath(0, -25, 2.8), 'a')],
    sockets: { eye: { x: 6, y: -18, s: 0.85 }, eyeFar: { x: -7, y: -19, s: 0.75 }, beak: { x: 15, y: -12, a: 0, s: 0.9 }, crest: { x: 0, y: -30, a: 0, s: 0.9 }, face: { x: 2, y: -14, s: 0.9 } },
  }),
  bPart({
    id: 'duck', slot: 'head', name: 'Duck', tags: ['duck', 'long'], dom: 0.5, w: 2,
    shapes: [[[-4, -30], [10, -30], [20, -24], [22, -14], [16, -4], [4, 2], [-8, 2], [-16, -8], [-16, -20], [-12, -28]]],
    extra: [SH('M-16,-8 C-6,0 8,2 20,-6 L20,6 L-16,6 Z', 0.1), HL('M-8,-28 C-2,-33 8,-33 14,-27 C8,-29 0,-29 -6,-25 Z', 0.18), L('M2,-8 C6,-6 10,-6 14,-8', 'k', 1.2, { op: 0.2 }), C(2, -25, 2.6, 'a', { ns: true, cl: true })],
    sockets: { eye: { x: 8, y: -20, s: 0.9 }, eyeFar: null, beak: { x: 21, y: -14, a: 0, s: 1 }, crest: { x: 2, y: -30, a: 0, s: 1 }, face: { x: 4, y: -16, s: 1 } },
  }),
  bPart({
    id: 'parrot', slot: 'head', name: 'Parrot', tags: ['parrot'], dom: 0.5, w: 2,
    shapes: [[[-2, -36], [14, -32], [22, -20], [20, -8], [10, 2], [-6, 2], [-16, -6], [-20, -18], [-14, -30]]],
    extra: [PATCH('M22,-14 C20,-6 14,-2 6,-4 C2,-8 4,-16 10,-20 C16,-22 22,-20 22,-14 Z', 's'), SH('M-20,-8 C-8,0 8,2 20,-6 L20,6 L-20,6 Z', 0.1), HL('M-10,-32 C-2,-38 8,-38 14,-30 C8,-33 0,-33 -6,-29 Z', 0.18), PATCH(starPath(4, -29, 4.5, 5, 0.5), 'a')],
    sockets: { eye: { x: 10, y: -22, s: 0.9 }, eyeFar: { x: -8, y: -23, s: 0.8 }, beak: { x: 20, y: -16, a: 0, s: 1 }, crest: { x: 2, y: -35, a: 0, s: 1 }, face: { x: 6, y: -18, s: 1 } },
  }),
  bPart({
    id: 'peacock', slot: 'head', name: 'Dainty', tags: ['peacock'], dom: 0.5, w: 1,
    shapes: [[[0, -30], [12, -27], [17, -18], [16, -8], [8, 0], [-4, 2], [-12, -4], [-16, -14], [-12, -26]]],
    extra: [PATCH('M8,-20 C12,-18 14,-14 12,-10 C8,-8 4,-10 2,-14 C2,-18 4,-21 8,-20 Z', 's', { op: 0.8 }), SH('M-14,-6 C-6,2 8,2 16,-6 L16,6 L-14,6 Z', 0.1), HL('M-8,-27 C-2,-32 6,-32 12,-26 C6,-28 0,-28 -6,-24 Z', 0.18), PATCH(crescentPath(2, -24, 4, -60), 'a')],
    sockets: { eye: { x: 7, y: -18, s: 0.9 }, eyeFar: null, beak: { x: 16, y: -13, a: 0, s: 0.9 }, crest: { x: 2, y: -30, a: 0, s: 1 }, face: { x: 4, y: -14, s: 0.9 } },
  }),
];
