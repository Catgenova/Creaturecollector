// Ooze bodies (blobs). Origin = centre. Sockets: core (low and back, inside the jelly), eye / eyeFar and mouth
// (set straight into the front), pod / podFar (sides, for pseudopods), base (bottom centre, for the puddle),
// crown (top), tendril / tendrilFar (rear), drips (lower front edge), bumps (upper back).
// kinds: 'ooze.blob' (domes), 'ooze.tall' (columns), 'ooze.wide' (slabs), 'ooze.drop' (teardrops),
// 'ooze.cube' (gelatin cubes), 'ooze.whirl' (twisted), 'ooze.split' (lumpy amoebas).
// Evolutions: stage 2 swells and buds a lobe; stage 3 buds another and glows from the core outward.
import { ozBody, torsoShade } from './_shared.js';
import { L, E, HL, puff } from '../_dsl.js';
import { spiralPath } from '../_sigils.js';

const ozBodyStages = (x2, y2, x3, y3, r = 10) => ({
  2: { grow: [1.06, 1.06], addBehind: [{ pts: puff(x2, y2, r, 7, 2), f: 'p' }] },
  3: { grow: [1.06, 1.07], addBehind: [{ pts: puff(x3, y3, r + 2, 8, 2.5), f: 'p' }], add: [E(0, 4, r * 1.6, r * 1.2, 'a', { ns: true, cl: true, op: 0.16 })] },
});
/** The glassy inner body every ooze shares: a lighter jelly heart and a gloss on the lit shoulder. */
const ozJelly = (cx, cy, rx, ry, gloss) => [E(cx, cy, rx, ry, 'pl', { ns: true, cl: true, op: 0.4 }), HL(gloss, 0.28)];
const ozSockets = (o) => ({ core: { x: -6, y: 8, a: 0, s: 1 }, eye: { x: 8, y: -8, s: 1 }, eyeFar: { x: -5, y: -9, s: 0.9 }, mouth: { x: 7, y: 1, a: 0, s: 1 }, pod: { x: 22, y: 6, a: 0 }, podFar: { x: -20, y: 6, a: 0 }, base: { x: 0, y: 24, a: 0 }, crown: { x: 0, y: -26, a: 0 }, tendril: { x: -22, y: 0, a: 0 }, tendrilFar: { x: -20, y: -4, a: 0 }, drips: { x: 14, y: 18, a: 0 }, bumps: { x: -6, y: -18, a: 0 }, ...o });

export const OZ_BODIES = [
  ozBody({
    id: 'blob', name: 'Blob', kind: 'ooze.blob', tags: ['blob', 'round'], dom: 0.5, w: 3,
    pts: [[-24, -4], [-16, -20], [0, -26], [16, -20], [24, -4], [26, 12], [18, 22], [0, 25], [-18, 22], [-26, 12]],
    shade: torsoShade(-26, 26, -26, 25, { shadeFrac: 0.35 }),
    extra: ozJelly(2, 4, 17, 13, 'M-16,-14 C-12,-20 -4,-23 3,-21 C-4,-18 -10,-14 -14,-7 Z'),
    sockets: ozSockets({}),
    stages: ozBodyStages(22, 6, -24, 4, 10),
  }),
  ozBody({
    id: 'tall', name: 'Column', kind: 'ooze.tall', tags: ['tall', 'wisp'], dom: 0.5, w: 2,
    pts: [[-14, -34], [-4, -40], [8, -38], [16, -28], [18, -10], [20, 10], [16, 22], [0, 26], [-16, 22], [-20, 8], [-18, -12]],
    shade: torsoShade(-20, 20, -40, 26, { shadeFrac: 0.35 }),
    extra: ozJelly(0, 2, 12, 20, 'M-12,-30 C-9,-36 -2,-38 4,-35 C-2,-32 -7,-27 -10,-20 Z'),
    sockets: ozSockets({ core: { x: -4, y: 4, a: 0, s: 1 }, eye: { x: 6, y: -22, s: 1 }, eyeFar: { x: -6, y: -23, s: 0.9 }, mouth: { x: 5, y: -12, a: 0, s: 1 }, pod: { x: 17, y: 0, a: 0 }, podFar: { x: -17, y: -2, a: 0 }, base: { x: 0, y: 25, a: 0 }, crown: { x: 2, y: -40, a: 0 }, tendril: { x: -18, y: -4, a: 0 }, tendrilFar: { x: -16, y: -8, a: 0 }, drips: { x: 14, y: 16, a: 0 }, bumps: { x: -8, y: -30, a: 0 } }),
    stages: ozBodyStages(16, -14, -18, -6, 8),
  }),
  ozBody({
    id: 'wide', name: 'Slab', kind: 'ooze.wide', tags: ['wide', 'flat'], dom: 0.5, w: 2,
    pts: [[-34, 0], [-26, -14], [-8, -18], [10, -18], [28, -12], [36, 0], [34, 12], [20, 18], [0, 20], [-20, 18], [-34, 12]],
    shade: torsoShade(-34, 36, -18, 20, { shadeFrac: 0.35 }),
    extra: ozJelly(2, 2, 26, 10, 'M-26,-8 C-20,-14 -8,-16 2,-15 C-8,-12 -16,-10 -22,-2 Z'),
    sockets: ozSockets({ core: { x: -10, y: 4, a: 0, s: 1 }, eye: { x: 12, y: -6, s: 1 }, eyeFar: { x: -1, y: -7, s: 0.9 }, mouth: { x: 12, y: 4, a: 0, s: 1 }, pod: { x: 32, y: 4, a: 0 }, podFar: { x: -30, y: 4, a: 0 }, base: { x: 0, y: 19, a: 0 }, crown: { x: 0, y: -18, a: 0 }, tendril: { x: -32, y: -2, a: 0 }, tendrilFar: { x: -28, y: -6, a: 0 }, drips: { x: 24, y: 14, a: 0 }, bumps: { x: -16, y: -14, a: 0 } }),
    stages: ozBodyStages(32, 2, -34, 0, 9),
  }),
  ozBody({
    id: 'drop', name: 'Droplet', kind: 'ooze.drop', tags: ['drop', 'point'], dom: 0.5, w: 2,
    pts: [[0, -36], [8, -22], [20, -8], [24, 8], [18, 22], [0, 26], [-18, 22], [-24, 8], [-20, -8], [-8, -22]],
    shade: torsoShade(-24, 24, -36, 26, { shadeFrac: 0.35 }),
    extra: ozJelly(0, 6, 15, 13, 'M-14,-8 C-11,-16 -6,-22 -1,-26 C-3,-20 -6,-13 -10,-4 Z'),
    sockets: ozSockets({ core: { x: -6, y: 8, a: 0, s: 1 }, eye: { x: 8, y: -6, s: 1 }, eyeFar: { x: -5, y: -7, s: 0.9 }, mouth: { x: 6, y: 4, a: 0, s: 1 }, pod: { x: 22, y: 8, a: 0 }, podFar: { x: -20, y: 8, a: 0 }, base: { x: 0, y: 25, a: 0 }, crown: { x: 0, y: -34, a: 0 }, tendril: { x: -20, y: 0, a: 0 }, tendrilFar: { x: -18, y: -4, a: 0 }, drips: { x: 14, y: 18, a: 0 }, bumps: { x: -8, y: -16, a: 0 } }),
    stages: ozBodyStages(20, 8, -22, 6, 9),
  }),
  ozBody({
    id: 'cube', name: 'Cube', kind: 'ooze.cube', tags: ['cube', 'gelatin'], dom: 0.55, w: 2,
    pts: [[-24, -24], [24, -24], [26, -20], [26, 20], [24, 24], [-24, 24], [-26, 20], [-26, -20]],
    shade: torsoShade(-26, 26, -24, 24, { shadeFrac: 0.35 }),
    extra: [...ozJelly(0, 2, 18, 16, 'M-20,-20 C-14,-22 -6,-22 2,-20 C-6,-18 -12,-16 -18,-10 Z'), L('M-17,-17 L17,-17 L17,17 M-17,-17 L-17,17', 'k', 1, { op: 0.16 })],
    sockets: ozSockets({ core: { x: -8, y: 8, a: 0, s: 1 }, eye: { x: 8, y: -8, s: 1 }, eyeFar: { x: -6, y: -9, s: 0.9 }, mouth: { x: 8, y: 2, a: 0, s: 1 }, pod: { x: 24, y: 4, a: 0 }, podFar: { x: -22, y: 4, a: 0 }, base: { x: 0, y: 23, a: 0 }, crown: { x: 0, y: -24, a: 0 }, tendril: { x: -24, y: -2, a: 0 }, tendrilFar: { x: -22, y: -6, a: 0 }, drips: { x: 16, y: 18, a: 0 }, bumps: { x: -6, y: -22, a: 0 } }),
    stages: ozBodyStages(24, 0, -26, -2, 9),
  }),
  ozBody({
    id: 'whirl', name: 'Whirl', kind: 'ooze.whirl', tags: ['whirl', 'twist'], dom: 0.5, w: 2,
    pts: [[-20, -6], [-10, -22], [8, -28], [22, -18], [26, -2], [22, 12], [10, 22], [-6, 25], [-20, 20], [-26, 8]],
    shade: torsoShade(-26, 26, -28, 25, { shadeFrac: 0.35 }),
    extra: [...ozJelly(2, 2, 16, 14, 'M-12,-14 C-8,-22 0,-26 8,-25 C0,-21 -6,-16 -10,-8 Z'), L(spiralPath(0, 0, 14, 1.5, 20), 'k', 1.4, { op: 0.2 })],
    sockets: ozSockets({ core: { x: -4, y: 8, a: 0, s: 1 }, eye: { x: 10, y: -10, s: 1 }, eyeFar: { x: -2, y: -12, s: 0.9 }, mouth: { x: 10, y: 0, a: 0, s: 1 }, pod: { x: 22, y: 4, a: 0 }, podFar: { x: -20, y: 2, a: 0 }, base: { x: 0, y: 24, a: 0 }, crown: { x: 6, y: -28, a: 0 }, tendril: { x: -22, y: -2, a: 0 }, tendrilFar: { x: -20, y: -6, a: 0 }, drips: { x: 14, y: 18, a: 0 }, bumps: { x: -6, y: -20, a: 0 } }),
    stages: ozBodyStages(22, 8, -24, -4, 9),
  }),
  ozBody({
    id: 'split', name: 'Amoeba', kind: 'ooze.split', tags: ['lumpy', 'amoeba'], dom: 0.5, w: 2,
    pts: [[-28, -2], [-22, -16], [-10, -20], [-2, -12, 'c'], [8, -22], [22, -18], [28, -4], [26, 12], [14, 22], [0, 24], [-14, 22], [-28, 12]],
    shade: torsoShade(-28, 28, -22, 24, { shadeFrac: 0.35 }),
    extra: ozJelly(0, 4, 20, 12, 'M-22,-8 C-19,-14 -14,-18 -8,-18 C-12,-14 -16,-10 -18,-2 Z'),
    sockets: ozSockets({ core: { x: -14, y: 4, a: 0, s: 1 }, eye: { x: 12, y: -8, s: 1 }, eyeFar: { x: 1, y: -8, s: 0.9 }, mouth: { x: 12, y: 2, a: 0, s: 1 }, pod: { x: 26, y: 6, a: 0 }, podFar: { x: -24, y: 6, a: 0 }, base: { x: 0, y: 23, a: 0 }, crown: { x: -12, y: -20, a: 0 }, tendril: { x: -26, y: 0, a: 0 }, tendrilFar: { x: -22, y: -6, a: 0 }, drips: { x: 16, y: 18, a: 0 }, bumps: { x: 16, y: -18, a: 0 } }),
    stages: ozBodyStages(26, 4, -28, 2, 9),
  }),
];
