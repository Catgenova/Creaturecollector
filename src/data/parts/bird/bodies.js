// Bird bodies. Origin = centre of the body. Sockets: head (neck point on the top front),
// wing / wingFar (shoulder, wings fold down the flank), tail (rear), leg / legFar (bottom),
// chest (breast, front), back (mantle, top rear). kinds: 'bird.perched', 'bird.upright', 'bird.swim'.
// Evolutions: stage 2 broadens the body and fluffs breast feathers out of the front; stage 3 adds
// mantle tufts over the shoulders so the silhouette reads fuller and more ruffled.
import { bBody, torsoShade } from './_shared.js';
import { L } from '../_dsl.js';
import { evoFan } from '../_evo.js';

export const B_BODIES = [
  bBody({
    id: 'songbird', name: 'Songbird', kind: 'bird.perched', tags: ['small'], dom: 0.5, w: 3,
    pts: [[10, -30], [24, -22], [30, -6], [26, 12], [14, 26], [-4, 30], [-20, 24], [-30, 8], [-28, -10], [-16, -26], [-2, -32]],
    shade: torsoShade(-30, 30, -32, 30, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 8, y: -28, a: 0, s: 1 }, wing: { x: -2, y: -10, a: 0, s: 1 }, wingFar: { x: -14, y: -14, a: 0, s: 0.95 },
      tail: { x: -28, y: 10, a: 20 }, leg: { x: 6, y: 24 }, legFar: { x: -6, y: 22 }, chest: { x: 20, y: 2, a: 0, s: 1 }, back: { x: -12, y: -26, a: -20 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(22, 4, -40, 60, 3, 8, 20, { tip: 0.4 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-16, -22, 200, 290, 3, 6, 18, { tip: 0.3 })] },
    },
  }),
  bBody({
    id: 'owl', name: 'Stout', kind: 'bird.perched', tags: ['owl'], dom: 0.5, w: 2,
    pts: [[12, -34], [26, -26], [30, -4], [26, 16], [14, 28], [-4, 32], [-20, 28], [-30, 12], [-30, -10], [-22, -28], [-6, -36]],
    shade: torsoShade(-30, 30, -36, 32, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 4, y: -32, a: 0, s: 1 }, wing: { x: 2, y: -12, a: 0, s: 1 }, wingFar: { x: -12, y: -16, a: 0, s: 0.95 },
      tail: { x: -26, y: 18, a: 30 }, leg: { x: 6, y: 26 }, legFar: { x: -6, y: 24 }, chest: { x: 16, y: 0, a: 0, s: 1 }, back: { x: -14, y: -30, a: -20 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(22, 4, -40, 60, 3, 8, 20, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-18, -26, 200, 290, 3, 6, 18, { tip: 0.4 })] },
    },
  }),
  bBody({
    id: 'hawk', name: 'Sleek', kind: 'bird.perched', tags: ['raptor'], dom: 0.55, w: 2,
    pts: [[16, -32], [30, -20], [34, -2], [26, 14], [12, 24], [-6, 26], [-22, 20], [-32, 6], [-30, -12], [-18, -28], [-2, -34]],
    shade: torsoShade(-32, 34, -34, 26, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 12, y: -30, a: -10, s: 1 }, wing: { x: 0, y: -10, a: 0, s: 1 }, wingFar: { x: -14, y: -14, a: 0, s: 0.95 },
      tail: { x: -30, y: 12, a: 15 }, leg: { x: 8, y: 22 }, legFar: { x: -4, y: 20 }, chest: { x: 24, y: -2, a: 0, s: 1 }, back: { x: -14, y: -28, a: -25 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(26, 2, -40, 60, 3, 8, 20, { tip: 0.3 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-18, -24, 200, 290, 3, 6, 20, { tip: 0.2 })] },
    },
  }),
  bBody({
    id: 'penguin', name: 'Upright', kind: 'bird.upright', tags: ['penguin'], dom: 0.5, w: 2,
    pts: [[6, -40], [20, -32], [26, -10], [24, 14], [16, 30], [0, 36], [-16, 30], [-24, 14], [-26, -10], [-20, -32], [-6, -40]],
    shade: torsoShade(-26, 26, -40, 36, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 2, y: -38, a: 0, s: 1 }, wing: { x: -6, y: -14, a: 0, s: 1 }, wingFar: { x: -18, y: -18, a: 0, s: 0.95 },
      tail: { x: -22, y: 26, a: 40 }, leg: { x: 6, y: 30 }, legFar: { x: -8, y: 28 }, chest: { x: 14, y: -8, a: 0, s: 1 }, back: { x: -12, y: -34, a: -15 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(20, 6, -40, 60, 3, 8, 18, { tip: 0.5 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-14, -32, 200, 290, 3, 6, 16, { tip: 0.4 })] },
    },
  }),
  bBody({
    id: 'duck', name: 'Waterfowl', kind: 'bird.swim', tags: ['duck'], dom: 0.5, w: 2,
    pts: [[20, -32], [30, -30], [34, -16], [36, -4], [30, 10], [14, 18], [-10, 20], [-30, 14], [-40, 2], [-34, -10], [-18, -18], [4, -20], [16, -24]],
    shade: torsoShade(-40, 36, -20, 20, { shadeFrac: 0.35 }),
    extra: [L('M8,-18 C14,-14 18,-8 22,-2', 'k', 1.2, { op: 0.2 })],
    sockets: {
      head: { x: 26, y: -30, a: 0, s: 0.95 }, wing: { x: -4, y: -8, a: 0, s: 1 }, wingFar: { x: -16, y: -12, a: 0, s: 0.95 },
      tail: { x: -38, y: -2, a: -20 }, leg: { x: 4, y: 16 }, legFar: { x: -8, y: 14 }, chest: { x: 26, y: 0, a: 0, s: 1 }, back: { x: -14, y: -18, a: -10 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(30, 2, -50, 50, 3, 8, 20, { tip: 0.4 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-22, -12, 200, 290, 3, 6, 18, { tip: 0.3 })] },
    },
  }),
  bBody({
    id: 'parrot', name: 'Slim', kind: 'bird.perched', tags: ['parrot'], dom: 0.5, w: 2,
    pts: [[10, -32], [22, -24], [26, -6], [22, 12], [12, 26], [-2, 30], [-18, 24], [-26, 8], [-26, -10], [-18, -26], [-4, -32]],
    shade: torsoShade(-26, 26, -32, 30, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 6, y: -30, a: 0, s: 1 }, wing: { x: -2, y: -10, a: 0, s: 1 }, wingFar: { x: -14, y: -14, a: 0, s: 0.95 },
      tail: { x: -24, y: 12, a: 35 }, leg: { x: 4, y: 26 }, legFar: { x: -6, y: 24 }, chest: { x: 16, y: 0, a: 0, s: 1 }, back: { x: -12, y: -28, a: -20 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(18, 4, -40, 60, 3, 8, 18, { tip: 0.4 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-14, -24, 200, 290, 3, 6, 18, { tip: 0.3 })] },
    },
  }),
  bBody({
    id: 'peacock', name: 'Elegant', kind: 'bird.perched', tags: ['peacock'], dom: 0.5, w: 1,
    pts: [[12, -38], [20, -34], [26, -16], [26, 4], [18, 20], [2, 26], [-14, 22], [-26, 8], [-26, -8], [-18, -24], [-4, -34]],
    shade: torsoShade(-26, 26, -38, 26, { shadeFrac: 0.3 }),
    sockets: {
      head: { x: 14, y: -36, a: -8, s: 0.95 }, wing: { x: -2, y: -8, a: 0, s: 1 }, wingFar: { x: -14, y: -12, a: 0, s: 0.95 },
      tail: { x: -26, y: 4, a: 10 }, leg: { x: 4, y: 22 }, legFar: { x: -6, y: 20 }, chest: { x: 18, y: -4, a: 0, s: 1 }, back: { x: -12, y: -28, a: -20 },
    },
    stages: {
      2: { grow: [1.06, 1.06], addBehind: [evoFan(20, 0, -40, 60, 3, 8, 18, { tip: 0.4 })] },
      3: { grow: [1.06, 1.07], addBehind: [evoFan(-14, -26, 200, 290, 3, 6, 18, { tip: 0.3 })] },
    },
  }),
];
