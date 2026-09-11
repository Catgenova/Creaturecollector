import { P, E, C, L, NONE } from './_dsl.js';

// Head origin = neck point (bottom centre of the skull). Heads face right.
// Sockets: eye (near), eye2 (far, optional), mouth (null = the head has its own, e.g. a beak), crown (top).

export const HEADS = [
  NONE('head', 0.3),
  {
    id: 'head.round', slot: 'head', name: 'Round', tags: ['cute'], dom: 0.5, w: 3,
    prims: [C(0, -18, 20, 'p')],
    sockets: { eye: { x: 8, y: -22, s: 1 }, eye2: { x: -7, y: -23, s: 0.85 }, mouth: { x: 12, y: -10, s: 1 }, crown: { x: 0, y: -38, a: 0, s: 1 } },
  },
  {
    id: 'head.snout', slot: 'head', name: 'Snout', tags: ['mammal', 'canine'], dom: 0.55, w: 3,
    prims: [
      P('M-19,-20 C-19,-34 -8,-42 4,-40 C14,-39 20,-32 22,-26 C30,-24 40,-16 40,-8 C40,-1 34,2 26,2 C14,6 -2,6 -10,0 C-17,-4 -19,-12 -19,-20 Z', 'p'),
      E(37, -11, 3.2, 2.4, 'k', { ns: true }),
    ],
    sockets: { eye: { x: 8, y: -26, s: 1 }, eye2: { x: -7, y: -28, s: 0.8 }, mouth: { x: 32, y: -4, s: 0.9 }, crown: { x: 2, y: -40, a: 0, s: 1 } },
  },
  {
    id: 'head.beak', slot: 'head', name: 'Beaked', tags: ['bird'], dom: 0.55, w: 2,
    prims: [C(0, -18, 18, 'p'), P('M12,-22 L36,-14 L12,-6 Z', 'a'), P('M12,-14 L34,-14', 'none', { sw: 1.6 })],
    sockets: { eye: { x: 6, y: -22, s: 1 }, eye2: { x: -8, y: -22, s: 0.8 }, mouth: null, crown: { x: 0, y: -36, a: 0, s: 1 } },
  },
  {
    id: 'head.block', slot: 'head', name: 'Blocky', tags: ['reptile', 'sturdy'], dom: 0.5, w: 2,
    prims: [P('M-18,-36 L30,-36 Q38,-36 38,-28 L38,-8 Q38,0 30,0 L-10,0 Q-18,0 -18,-8 Z', 'p'), E(33, -14, 2.4, 2, 'k', { ns: true })],
    sockets: { eye: { x: 14, y: -24, s: 1 }, eye2: { x: -4, y: -26, s: 0.8 }, mouth: { x: 28, y: -6, s: 1 }, crown: { x: 4, y: -36, a: 0, s: 1 } },
  },
  {
    id: 'head.cat', slot: 'head', name: 'Feline', tags: ['mammal', 'feline'], dom: 0.5, w: 2,
    prims: [P('M-20,-14 C-22,-32 -8,-40 4,-40 C16,-40 26,-32 24,-14 C26,-6 22,0 14,2 L10,-1 L6,3 L0,0 L-6,3 L-10,-1 L-14,2 C-20,0 -22,-6 -20,-14 Z', 'p')],
    sockets: { eye: { x: 8, y: -22, s: 1 }, eye2: { x: -6, y: -23, s: 0.85 }, mouth: { x: 12, y: -9, s: 1 }, crown: { x: 2, y: -40, a: 0, s: 1 } },
  },
  {
    id: 'head.bulb', slot: 'head', name: 'Bulb', tags: ['cute', 'big'], dom: 0.5, w: 2,
    prims: [E(2, -18, 25, 21, 'p')],
    sockets: { eye: { x: 10, y: -20, s: 1.1 }, eye2: { x: -7, y: -22, s: 0.9 }, mouth: { x: 16, y: -8, s: 1 }, crown: { x: 2, y: -39, a: 0, s: 1 } },
  },
  {
    id: 'head.skull', slot: 'head', name: 'Angular', tags: ['menacing'], dom: 0.5, w: 2,
    prims: [P('M-16,-34 L26,-36 L34,-20 L30,-4 L14,2 L-10,0 L-18,-14 Z', 'p')],
    sockets: { eye: { x: 12, y: -22, s: 1 }, eye2: { x: -4, y: -24, s: 0.8 }, mouth: { x: 22, y: -6, s: 1 }, crown: { x: 4, y: -36, a: 0, s: 1 } },
  },
  {
    id: 'head.long', slot: 'head', name: 'Muzzle', tags: ['dragon', 'equine'], dom: 0.55, w: 2,
    prims: [
      P('M-18,-22 C-18,-40 2,-44 12,-38 C20,-34 40,-20 44,-10 C46,-2 38,2 30,2 C18,4 -6,6 -14,-2 C-18,-8 -18,-14 -18,-22 Z', 'p'),
      E(40, -11, 2.6, 2, 'k', { ns: true }),
    ],
    sockets: { eye: { x: 10, y: -28, s: 1 }, eye2: { x: -4, y: -30, s: 0.8 }, mouth: { x: 34, y: -5, s: 0.9 }, crown: { x: 4, y: -41, a: 0, s: 1 } },
  },
  {
    id: 'head.wide', slot: 'head', name: 'Wide', tags: ['amphibian'], dom: 0.45, w: 2,
    prims: [P('M-22,-14 C-22,-30 -6,-34 6,-34 C22,-34 34,-26 34,-14 C36,-4 30,2 18,2 L-10,2 C-20,2 -24,-4 -22,-14 Z', 'p')],
    sockets: { eye: { x: 14, y: -28, s: 1.1 }, eye2: { x: -6, y: -30, s: 0.9 }, mouth: { x: 16, y: -8, s: 1.3 }, crown: { x: 4, y: -34, a: 0, s: 0.9 } },
  },
  {
    id: 'head.owl', slot: 'head', name: 'Owlish', tags: ['bird'], dom: 0.5, w: 2,
    prims: [C(0, -18, 20, 'p'), P('M-20,-30 L-12,-42 L-4,-32 Z', 'p'), P('M4,-32 L12,-42 L20,-30 Z', 'p'), P('M10,-12 L24,-8 L10,-2 Z', 'a')],
    sockets: { eye: { x: 6, y: -20, s: 1.15 }, eye2: { x: -9, y: -20, s: 0.9 }, mouth: null, crown: { x: 0, y: -38, a: 0, s: 1 } },
  },
  {
    id: 'head.rodent', slot: 'head', name: 'Rodent', tags: ['mammal'], dom: 0.5, w: 2,
    prims: [P('M-20,-16 C-22,-36 0,-42 10,-36 C22,-30 30,-18 26,-8 C24,0 14,4 4,4 C-6,4 -18,0 -20,-16 Z', 'p'), P('M14,-2 L14,4 L20,4 L20,-3 Z', 'w', { sw: 1 }), E(24, -14, 2.4, 2, 'k', { ns: true })],
    sockets: { eye: { x: 8, y: -24, s: 1 }, eye2: { x: -6, y: -25, s: 0.85 }, mouth: { x: 17, y: -8, s: 0.9 }, crown: { x: 0, y: -40, a: 0, s: 1 } },
  },
  {
    id: 'head.helm', slot: 'head', name: 'Helmed', tags: ['steel'], dom: 0.55, w: 1,
    prims: [P('M-18,-30 L26,-34 L36,-22 L36,-6 L28,2 L-12,2 L-18,-8 Z', 'p'), L('M-12,-20 L30,-22', 'k', 2), P('M-6,-34 L0,-44 L10,-36 Z', 'a')],
    sockets: { eye: { x: 12, y: -14, s: 0.9 }, eye2: { x: -4, y: -15, s: 0.75 }, mouth: { x: 26, y: -4, s: 0.9 }, crown: { x: 4, y: -34, a: 0, s: 0.9 } },
  },
];
