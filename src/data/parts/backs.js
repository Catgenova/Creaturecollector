import { P, E, C, L, NONE } from './_dsl.js';

// Back features: origin on the spine near its highest point; bases are sunk a few units into the body.
export const BACKS = [
  NONE('back', 0.4),
  { id: 'back.spikes', slot: 'back', name: 'Spines', tags: ['dragon', 'rock'], dom: 0.55, w: 3,
    prims: [P('M4,6 L10,-12 L16,6 Z', 'a'), P('M-10,6 L-4,-14 L2,6 Z', 'a'), P('M-24,8 L-18,-8 L-12,8 Z', 'a'), P('M-36,12 L-32,-2 L-26,12 Z', 'a')] },
  { id: 'back.shell', slot: 'back', name: 'Shell', tags: ['sturdy'], dom: 0.6, w: 2,
    prims: [P('M-34,10 C-34,-24 30,-24 30,10 Z', 'a'), L('M-30,4 L28,4 M-16,-18 L-16,4 M6,-18 L6,4 M-28,-8 L26,-8', 'k', 1.3, { op: 0.35 })] },
  { id: 'back.fin', slot: 'back', name: 'Dorsal fin', tags: ['aquatic'], dom: 0.5, w: 2,
    prims: [P('M-6,6 C-4,-14 6,-28 22,-30 C14,-18 12,-6 14,6 Z', 'a'), L('M0,4 C2,-8 8,-16 14,-22', 'k', 1.1, { op: 0.4 })] },
  { id: 'back.mane', slot: 'back', name: 'Mane', tags: ['mammal'], dom: 0.5, w: 2,
    prims: [P('M-32,10 C-34,-4 -22,-10 -18,-2 C-16,-14 -6,-16 -2,-6 C0,-18 12,-18 12,-6 C18,-10 26,-4 22,8 Z', 's')] },
  { id: 'back.plates', slot: 'back', name: 'Plates', tags: ['rock', 'steel'], dom: 0.5, w: 2,
    prims: [P('M6,6 C6,-8 20,-8 20,6 Z', 'a'), P('M-12,6 C-12,-12 4,-12 4,6 Z', 'a'), P('M-30,8 C-30,-6 -16,-6 -16,8 Z', 'a')] },
  { id: 'back.wisps', slot: 'back', name: 'Wisps', tags: ['spirit'], dom: 0.4, w: 2,
    prims: [P('M-10,6 C-14,-6 -6,-14 -2,-8 C0,-16 8,-16 6,-8 C12,-12 16,-2 10,4 Z', 'w', { op: 0.55 }), C(-20, -2, 4, 'w', { op: 0.4, ns: true }), C(16, -6, 3, 'w', { op: 0.4, ns: true })] },
  { id: 'back.crystal', slot: 'back', name: 'Crystals', tags: ['rock', 'ice'], dom: 0.5, w: 1,
    prims: [P('M-4,8 L0,-24 L8,8 Z', 'al'), P('M-20,10 L-14,-10 L-8,10 Z', 'a'), P('M8,10 L14,-6 L20,10 Z', 'a')] },
  { id: 'back.bolts', slot: 'back', name: 'Sparks', tags: ['electric'], dom: 0.45, w: 1,
    prims: [P('M-2,6 L4,-8 L0,-8 L8,-22 L-2,-8 L2,-8 L-4,6 Z', 'a'), P('M-22,8 L-16,-4 L-20,-4 L-12,-16 L-22,-4 L-18,-4 L-24,8 Z', 'a')] },
  { id: 'back.leaf', slot: 'back', name: 'Foliage', tags: ['plant'], dom: 0.5, w: 1,
    prims: [P('M0,6 C-4,-10 8,-26 24,-26 C22,-10 12,2 0,6 Z', 'a'), P('M-4,8 C-10,-6 -22,-14 -34,-10 C-26,0 -14,6 -4,8 Z', 'a'), L('M2,4 C6,-6 12,-14 20,-20', 'k', 1.1, { op: 0.4 })] },
  { id: 'back.sail', slot: 'back', name: 'Sail', tags: ['reptile', 'aquatic'], dom: 0.55, w: 1,
    prims: [P('M-36,10 C-30,-14 -14,-34 4,-34 C18,-34 22,-14 24,8 Z', 'a'), L('M-24,6 C-16,-12 -4,-24 4,-28 M-8,8 C-2,-8 6,-18 12,-22 M8,8 C12,-4 16,-10 20,-12', 'k', 1.1, { op: 0.4 })] },
  { id: 'back.mushrooms', slot: 'back', name: 'Mushrooms', tags: ['plant', 'poison'], dom: 0.45, w: 1,
    prims: [P('M-18,4 L-18,-4 L-14,-4 L-14,4 Z', 'pl'), E(-16, -4, 8, 5, 'a'), P('M6,6 L6,-8 L10,-8 L10,6 Z', 'pl'), E(8, -8, 6, 4, 'a'), C(-16, -5, 1.5, 'w', { ns: true }), C(9, -9, 1.2, 'w', { ns: true })] },
];
