import { P, E, L } from './_dsl.js';

// Body sockets (all in body coordinates, body centre = 0,0):
//   head  {x,y,a,s}  neck point where a head's bottom-centre attaches
//   face  {eye,eye2,mouth,crown}  used when the head slot is "none" (face drawn on the body)
//   legs  [{x,y,far?}] near-leg hip points; a darker far copy is drawn automatically
//   arm, wing {x,y}; tail, back {x,y,a}
// bottom: lowest y of the silhouette. hover: floats this far above its shadow.

const QUAD = 'M40,-22 C52,-14 52,14 40,22 C20,28 -30,28 -44,18 C-56,8 -54,-18 -42,-26 C-30,-34 20,-34 40,-22 Z';
const BULK = 'M44,-14 C56,-6 56,18 44,26 C20,34 -32,34 -48,24 C-62,12 -58,-16 -44,-26 C-28,-38 24,-36 44,-14 Z';
const ROUND = 'M0,-34 C21,-34 38,-19 38,0 C38,19 21,34 0,34 C-21,34 -38,19 -38,0 C-38,-19 -21,-34 0,-34 Z';
const BIPED = 'M0,-36 C14,-36 24,-24 26,-6 C30,14 24,34 0,34 C-24,34 -30,14 -26,-6 C-24,-24 -14,-36 0,-36 Z';
const BIRD = 'M0,-38 C22,-38 34,-16 30,8 C26,30 6,38 -6,36 C-26,32 -34,10 -28,-12 C-22,-30 -14,-38 0,-38 Z';
const COIL = 'M-50,14 a44,16 0 1,0 88,0 a44,16 0 1,0 -88,0 Z';
const NECK = 'M6,14 C10,-8 18,-26 32,-38 L46,-34 C36,-22 30,-4 34,16 Z';
const FISH = 'M44,0 C40,-20 10,-30 -14,-26 C-34,-22 -46,-12 -50,0 C-46,12 -34,22 -14,26 C10,30 40,20 44,0 Z';
const FLOAT = 'M-34,4 C-34,-30 34,-30 34,4 C28,14 22,4 16,14 C10,22 4,10 -2,16 C-8,22 -14,10 -20,14 C-26,20 -30,10 -34,4 Z';

export const BODIES = [
  {
    id: 'body.quad', slot: 'body', name: 'Quadruped', kind: 'quad', tags: ['mammal'], dom: 0.55, w: 3,
    bottom: 27, clip: [QUAD], prims: [P(QUAD, 'p')],
    sockets: {
      head: { x: 42, y: -22, a: 0, s: 1 },
      face: { eye: { x: 30, y: -12, s: 1 }, eye2: { x: 12, y: -14, s: 0.85 }, mouth: { x: 44, y: 4, s: 1 }, crown: { x: 26, y: -30, a: 0, s: 0.9 } },
      legs: [{ x: 26, y: 16 }, { x: -30, y: 16 }],
      arm: null, wing: { x: -8, y: -28 }, tail: { x: -46, y: -8, a: 0 }, back: { x: -4, y: -31, a: 0 },
    },
  },
  {
    id: 'body.bulk', slot: 'body', name: 'Heavy', kind: 'quad', tags: ['beast'], dom: 0.6, w: 2,
    bottom: 33, clip: [BULK], prims: [P(BULK, 'p')],
    sockets: {
      head: { x: 44, y: -18, a: 0, s: 1.05 },
      face: { eye: { x: 30, y: -8, s: 1.1 }, eye2: { x: 10, y: -10, s: 0.9 }, mouth: { x: 46, y: 8, s: 1.1 }, crown: { x: 24, y: -32, a: 0, s: 1 } },
      legs: [{ x: 28, y: 22 }, { x: -32, y: 22 }],
      arm: null, wing: { x: -10, y: -32 }, tail: { x: -50, y: 0, a: 0 }, back: { x: -6, y: -35, a: 0 },
    },
  },
  {
    id: 'body.round', slot: 'body', name: 'Round', kind: 'blob', tags: ['blob'], dom: 0.5, w: 3,
    bottom: 34, clip: [ROUND], prims: [P(ROUND, 'p')],
    sockets: {
      head: { x: 6, y: -30, a: 0, s: 1 },
      face: { eye: { x: 14, y: -8, s: 1.1 }, eye2: { x: -7, y: -9, s: 0.95 }, mouth: { x: 16, y: 7, s: 1 }, crown: { x: 2, y: -34, a: 0, s: 1 } },
      legs: [{ x: 10, y: 26, far: { dx: -16, dy: -2 } }],
      arm: { x: 32, y: -2 }, wing: { x: -16, y: -22 }, tail: { x: -36, y: 4, a: -25 }, back: { x: -8, y: -33, a: 0 },
    },
  },
  {
    id: 'body.biped', slot: 'body', name: 'Biped', kind: 'biped', tags: ['upright'], dom: 0.5, w: 3,
    bottom: 34, clip: [BIPED], prims: [P(BIPED, 'p')],
    sockets: {
      head: { x: 2, y: -34, a: 0, s: 1 },
      face: { eye: { x: 12, y: -14, s: 1 }, eye2: { x: -6, y: -15, s: 0.9 }, mouth: { x: 12, y: 2, s: 1 }, crown: { x: 0, y: -36, a: 0, s: 1 } },
      legs: [{ x: 8, y: 28, far: { dx: -16, dy: -2 } }],
      arm: { x: 25, y: -6 }, wing: { x: -18, y: -16 }, tail: { x: -26, y: 14, a: -20 }, back: { x: -10, y: -32, a: -10 },
    },
  },
  {
    id: 'body.bird', slot: 'body', name: 'Avian', kind: 'bird', tags: ['bird'], dom: 0.5, w: 2,
    bottom: 38, clip: [BIRD], prims: [P(BIRD, 'p')],
    sockets: {
      head: { x: 6, y: -36, a: 0, s: 0.95 },
      face: { eye: { x: 12, y: -18, s: 1 }, eye2: { x: -6, y: -20, s: 0.85 }, mouth: { x: 20, y: -4, s: 1 }, crown: { x: 2, y: -38, a: 0, s: 1 } },
      legs: [{ x: 2, y: 30, far: { dx: -12, dy: -2 } }],
      arm: null, wing: { x: -8, y: -10 }, tail: { x: -30, y: 12, a: 25 }, back: { x: -14, y: -30, a: -20 },
    },
  },
  {
    id: 'body.serpent', slot: 'body', name: 'Serpent', kind: 'serpent', tags: ['reptile'], dom: 0.55, w: 2,
    bottom: 30, clip: [COIL, NECK], prims: [E(-6, 14, 44, 16, 'p'), P(NECK, 'p')],
    sockets: {
      head: { x: 40, y: -36, a: -12, s: 0.95 },
      face: { eye: { x: 34, y: -26, s: 0.9 }, eye2: null, mouth: { x: 42, y: -16, s: 0.9 }, crown: { x: 40, y: -36, a: -12, s: 0.8 } },
      legs: [],
      arm: null, wing: { x: 2, y: -6 }, tail: { x: -48, y: 12, a: 0 }, back: { x: 26, y: -24, a: -50 },
    },
  },
  {
    id: 'body.fish', slot: 'body', name: 'Fish', kind: 'fish', tags: ['aquatic'], dom: 0.5, w: 2,
    bottom: 30, hover: 12, armsFront: true, clip: [FISH], prims: [P(FISH, 'p')],
    sockets: {
      head: { x: 34, y: -10, a: 0, s: 0.85 },
      face: { eye: { x: 24, y: -8, s: 1 }, eye2: null, mouth: { x: 40, y: 5, s: 0.9 }, crown: { x: 8, y: -27, a: 0, s: 0.9 } },
      legs: [],
      arm: { x: 10, y: 8 }, wing: { x: -4, y: -22 }, tail: { x: -48, y: 0, a: 0 }, back: { x: -6, y: -26, a: 0 },
    },
  },
  {
    id: 'body.float', slot: 'body', name: 'Wisp', kind: 'float', tags: ['spirit'], dom: 0.45, w: 2,
    bottom: 22, hover: 18, clip: [FLOAT], prims: [P(FLOAT, 'p')],
    sockets: {
      head: { x: 2, y: -24, a: 0, s: 0.9 },
      face: { eye: { x: 12, y: -8, s: 1.1 }, eye2: { x: -8, y: -9, s: 0.95 }, mouth: { x: 4, y: 6, s: 1 }, crown: { x: 0, y: -26, a: 0, s: 1 } },
      legs: [],
      arm: { x: 31, y: -2 }, wing: { x: -18, y: -16 }, tail: { x: -30, y: 0, a: -15 }, back: { x: -6, y: -26, a: 0 },
    },
  },
  {
    id: 'body.tall', slot: 'body', name: 'Long-necked', kind: 'quad', tags: ['hoofed'], dom: 0.5, w: 2,
    bottom: 22, clip: ['M36,-30 C50,-24 50,6 36,14 C18,20 -26,20 -40,12 C-52,4 -50,-22 -38,-30 C-24,-38 18,-40 36,-30 Z', 'M24,-28 C30,-44 36,-56 46,-64 L58,-58 C50,-46 46,-34 44,-22 Z'],
    prims: [P('M24,-28 C30,-44 36,-56 46,-64 L58,-58 C50,-46 46,-34 44,-22 Z', 'p'), P('M36,-30 C50,-24 50,6 36,14 C18,20 -26,20 -40,12 C-52,4 -50,-22 -38,-30 C-24,-38 18,-40 36,-30 Z', 'p')],
    sockets: {
      head: { x: 53, y: -62, a: -10, s: 0.9 },
      face: { eye: { x: 28, y: -16, s: 1 }, eye2: { x: 10, y: -18, s: 0.85 }, mouth: { x: 40, y: -2, s: 1 }, crown: { x: 22, y: -36, a: 0, s: 0.9 } },
      legs: [{ x: 26, y: 10 }, { x: -30, y: 10 }],
      arm: null, wing: { x: -10, y: -34 }, tail: { x: -46, y: -8, a: 0 }, back: { x: -6, y: -37, a: 0 },
    },
  },
  {
    id: 'body.slug', slot: 'body', name: 'Grub', kind: 'serpent', tags: ['bug', 'slime'], dom: 0.45, w: 2,
    bottom: 24, clip: ['M44,10 C50,-4 40,-20 20,-22 C0,-24 -30,-22 -46,-10 C-56,0 -52,14 -40,18 C-20,24 20,24 44,10 Z'],
    prims: [P('M44,10 C50,-4 40,-20 20,-22 C0,-24 -30,-22 -46,-10 C-56,0 -52,14 -40,18 C-20,24 20,24 44,10 Z', 'p'), L('M-30,-8 C-28,4 -26,10 -24,16 M-14,-16 C-12,0 -10,8 -8,18 M2,-20 C4,-4 6,6 8,18 M18,-20 C20,-6 22,4 24,14', 'k', 1.3, { op: 0.25 })],
    sockets: {
      head: { x: 34, y: -16, a: 0, s: 0.9 },
      face: { eye: { x: 30, y: -8, s: 1 }, eye2: { x: 14, y: -10, s: 0.85 }, mouth: { x: 42, y: 2, s: 0.9 }, crown: { x: 20, y: -22, a: 0, s: 0.9 } },
      legs: [],
      arm: null, wing: { x: -4, y: -20 }, tail: { x: -50, y: 4, a: 0 }, back: { x: -10, y: -23, a: 0 },
    },
  },
];
