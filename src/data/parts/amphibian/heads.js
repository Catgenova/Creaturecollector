// Amphibian heads: wide and flat, eyes bulging on top. Origin = neck point.
// Sockets: eye / eyeFar, mouth {x,y,a,s} at the front, gills {x,y,a,s} on the neck sides (behind),
// throat {x,y,a,s} under the jaw (behind), crest {x,y,a,s} on top (behind).
// Evolutions: stage 2 grows the head, bulges soft lobes off the back of it and enlarges the
// marking; stage 3 adds a crown of lobes, a glow behind the marking and accent brow streaks.
import { aPart } from './_shared.js';
import { PATCH, SH, HL, L, C } from '../_dsl.js';
import { sparklePath, diamondPath, starPath, heartPath, flamePath, boltPath } from '../_sigils.js';
import { evoFan, evoGlow } from '../_evo.js';

const jaw = (d) => PATCH(d, 's');
/** Shared head evolution: lobes behind the skull at (bx, by), a bigger marking, then a crown at (cx, cy), glow at the marking and brow streaks. */
const aHeadStages = (bx, by, mark2, cx, cy, glow, brows) => ({
  2: { grow: [1.05, 1.06], addBehind: [evoFan(bx, by, 150, 250, 2, 6, 16, { tip: 0.5 })], add: mark2 },
  3: { grow: [1.05, 1.06], addBehind: [evoFan(cx, cy, 200, 340, 3, 5, 16, { tip: 0.4 })], add: [evoGlow(glow[0], glow[1], glow[2], 0.25), L(brows, 'a', 2, { ns: true })] },
});

export const A_HEADS = [
  aPart({ id: 'frog', slot: 'head', name: 'Frog', tags: ['frog'], dom: 0.5, w: 3, shapes: [[[-14, -18], [0, -24], [14, -22], [24, -14], [28, -4], [22, 4], [8, 8], [-8, 8], [-20, 2], [-22, -8]]], extra: [jaw('M30,-4 C22,0 8,2 -8,2 C-16,2 -20,0 -24,-4 L-26,12 L30,12 Z'), SH('M-22,-6 C-10,2 10,4 26,-2 L26,12 L-22,12 Z', 0.1), HL('M-10,-20 C0,-26 12,-25 20,-18 C12,-21 2,-21 -6,-17 Z', 0.2), PATCH(sparklePath(6, -9, 4.5), 'a')],
    sockets: { eye: { x: 10, y: -20, s: 1.1 }, eyeFar: { x: -7, y: -21, s: 1 }, mouth: { x: 14, y: 4, a: 0, s: 1 }, gills: { x: -18, y: -6, a: 0, s: 1 }, throat: { x: 2, y: 8, a: 0, s: 1 }, crest: { x: 2, y: -24, a: 0, s: 1 } },
    stages: aHeadStages(-14, -12, [PATCH(sparklePath(6, -9, 6.5), 'a')], 2, -20, [6, -9, 9], 'M-8,-12 L-12,-17 M18,-12 L22,-17') }),
  aPart({ id: 'toad', slot: 'head', name: 'Toad', tags: ['toad', 'wide'], dom: 0.55, w: 2, shapes: [[[-18, -16], [-2, -22], [14, -20], [26, -12], [32, -2], [26, 6], [10, 10], [-10, 10], [-24, 4], [-28, -6]]], extra: [jaw('M34,-2 C24,2 8,4 -10,4 C-20,4 -26,2 -30,-2 L-32,14 L34,14 Z'), C(-6, -16, 2.2, 'pd', { sw: 1.2 }), C(8, -17, 2, 'pd', { sw: 1.2 }), SH('M-28,-4 C-12,4 10,6 30,0 L30,14 L-28,14 Z', 0.1), HL('M-14,-18 C-4,-24 10,-23 20,-16 C10,-19 0,-19 -8,-15 Z', 0.2), PATCH(diamondPath(4, -7, 6, 8), 'a')],
    sockets: { eye: { x: 10, y: -18, s: 1.05 }, eyeFar: { x: -10, y: -19, s: 0.95 }, mouth: { x: 16, y: 6, a: 0, s: 1.1 }, gills: { x: -22, y: -4, a: 0, s: 1 }, throat: { x: 0, y: 10, a: 0, s: 1.1 }, crest: { x: 0, y: -22, a: 0, s: 1 } },
    stages: aHeadStages(-18, -10, [PATCH(diamondPath(4, -7, 8, 11), 'a'), C(-16, -12, 2.2, 'pd', { sw: 1.2 }), C(18, -14, 2, 'pd', { sw: 1.2 })], 0, -18, [4, -7, 9], 'M-10,-10 L-14,-15 M18,-10 L22,-15') }),
  aPart({ id: 'treefrog', slot: 'head', name: 'Bright-eyed', tags: ['treefrog'], dom: 0.5, w: 2, shapes: [[[-12, -18], [2, -22], [16, -18], [24, -10], [26, -2], [20, 4], [6, 8], [-8, 8], [-18, 2], [-20, -8]]], extra: [jaw('M28,-2 C20,2 6,3 -8,3 C-14,3 -18,1 -22,-2 L-24,12 L28,12 Z'), SH('M-20,-4 C-8,2 8,4 24,0 L24,12 L-20,12 Z', 0.1), HL('M-8,-18 C0,-24 10,-23 18,-16 C10,-19 2,-19 -4,-15 Z', 0.2), PATCH(starPath(6, -8, 4.5, 5, 0.5), 'a')],
    sockets: { eye: { x: 10, y: -16, s: 1.2 }, eyeFar: { x: -7, y: -17, s: 1.05 }, mouth: { x: 12, y: 4, a: 0, s: 1 }, gills: { x: -16, y: -6, a: 0, s: 0.9 }, throat: { x: 0, y: 8, a: 0, s: 1 }, crest: { x: 2, y: -22, a: 0, s: 1 } },
    stages: aHeadStages(-12, -12, [PATCH(starPath(6, -8, 6, 5, 0.5), 'a')], 2, -18, [6, -8, 9], 'M-6,-12 L-10,-17 M16,-12 L20,-17') }),
  aPart({ id: 'axolotl', slot: 'head', name: 'Axolotl', tags: ['axolotl', 'round'], dom: 0.5, w: 2, shapes: [[[-14, -20], [2, -26], [16, -22], [26, -12], [26, 0], [18, 6], [4, 8], [-10, 6], [-20, 0], [-22, -10]]], extra: [jaw('M28,-2 C20,2 6,4 -8,4 C-16,4 -20,2 -24,-2 L-26,12 L28,12 Z'), SH('M-22,-4 C-8,4 8,6 26,0 L26,12 L-22,12 Z', 0.1), HL('M-10,-22 C0,-28 12,-26 20,-18 C12,-22 2,-22 -6,-18 Z', 0.2), PATCH(heartPath(4, -19, 3.6), 'a')],
    sockets: { eye: { x: 12, y: -12, s: 0.9 }, eyeFar: { x: -6, y: -13, s: 0.8 }, mouth: { x: 16, y: 2, a: 0, s: 1 }, gills: { x: -16, y: -14, a: 0, s: 1 }, throat: { x: 0, y: 8, a: 0, s: 1 }, crest: { x: 2, y: -26, a: 0, s: 1 } },
    stages: aHeadStages(-14, -14, [PATCH(heartPath(4, -19, 4.8), 'a')], 2, -22, [4, -19, 8], 'M-6,-8 L-10,-13 M16,-6 L20,-11') }),
  aPart({ id: 'newt', slot: 'head', name: 'Newt', tags: ['newt', 'pointed'], dom: 0.5, w: 2, shapes: [[[-12, -16], [2, -20], [14, -18], [24, -10], [30, -2, 0.4], [22, 4], [8, 6], [-8, 6], [-18, 0], [-18, -8]]], extra: [jaw('M32,-2 C22,2 8,4 -8,4 C-14,4 -18,2 -20,-2 L-22,12 L32,12 Z'), SH('M-18,-4 C-6,2 8,4 28,0 L28,12 L-18,12 Z', 0.1), HL('M-8,-16 C0,-22 10,-21 18,-14 C10,-17 2,-17 -4,-13 Z', 0.2), PATCH(flamePath(3, -14, 4.5), 'a')],
    sockets: { eye: { x: 10, y: -12, s: 0.9 }, eyeFar: { x: -6, y: -13, s: 0.8 }, mouth: { x: 20, y: 2, a: 0, s: 0.9 }, gills: { x: -14, y: -8, a: 0, s: 0.9 }, throat: { x: 0, y: 6, a: 0, s: 0.9 }, crest: { x: 2, y: -20, a: 0, s: 1 } },
    stages: aHeadStages(-12, -10, [PATCH(flamePath(3, -14, 6), 'a')], 2, -16, [3, -14, 8], 'M-6,-8 L-10,-13 M16,-6 L20,-11') }),
  aPart({ id: 'salamander', slot: 'head', name: 'Broad', tags: ['salamander'], dom: 0.55, w: 2, shapes: [[[-16, -16], [0, -22], [16, -20], [28, -12], [34, -2], [28, 6], [12, 10], [-10, 10], [-24, 4], [-26, -6]]], extra: [jaw('M36,-2 C26,2 10,4 -10,4 C-20,4 -26,2 -28,-2 L-30,14 L36,14 Z'), SH('M-26,-4 C-10,4 10,6 32,0 L32,14 L-26,14 Z', 0.1), HL('M-12,-18 C-2,-24 12,-23 22,-16 C12,-19 2,-19 -6,-15 Z', 0.2), PATCH(boltPath(3, -14, 5, 10), 'a')],
    sockets: { eye: { x: 12, y: -14, s: 0.95 }, eyeFar: { x: -8, y: -15, s: 0.85 }, mouth: { x: 20, y: 4, a: 0, s: 1.05 }, gills: { x: -20, y: -6, a: 0, s: 1 }, throat: { x: 0, y: 10, a: 0, s: 1 }, crest: { x: 0, y: -22, a: 0, s: 1 } },
    stages: aHeadStages(-16, -10, [PATCH(boltPath(3, -14, 6.5, 10), 'a')], 0, -18, [3, -14, 9], 'M-8,-10 L-12,-15 M18,-10 L22,-15') }),
  aPart({ id: 'polliwog', slot: 'head', name: 'Round', tags: ['tadpole'], dom: 0.45, w: 2, shapes: [[[-12, -16], [0, -20], [12, -18], [18, -10], [18, 0], [12, 6], [0, 8], [-12, 6], [-18, 0], [-18, -10]]], extra: [jaw('M20,-2 C14,2 4,4 -6,4 C-12,4 -16,2 -18,-2 L-20,12 L20,12 Z'), SH('M-18,-4 C-8,4 6,6 18,0 L18,12 L-18,12 Z', 0.1), HL('M-8,-16 C0,-21 8,-20 14,-14 C8,-17 0,-17 -4,-13 Z', 0.2), C(1, -15, 2.8, 'a', { ns: true, cl: true })],
    sockets: { eye: { x: 8, y: -10, s: 1 }, eyeFar: { x: -6, y: -11, s: 0.9 }, mouth: { x: 12, y: 2, a: 0, s: 0.9 }, gills: { x: -14, y: -6, a: 0, s: 0.8 }, throat: { x: 0, y: 8, a: 0, s: 0.9 }, crest: { x: 0, y: -20, a: 0, s: 1 } },
    stages: aHeadStages(-12, -10, [C(1, -15, 3.8, 'a', { ns: true, cl: true })], 0, -16, [1, -15, 7], 'M-6,-6 L-10,-11 M12,-6 L16,-11') }),
];
