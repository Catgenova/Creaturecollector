import { P, E, C, L, NONE } from './_dsl.js';

// Crowns (ears, horns, crests...) attach at the top centre of the head and are
// drawn BEHIND the skull, so every base extends down to about y=10 and the head
// hides it. Both sides live in one part; the far side uses the shade roles.
export const CROWNS = [
  NONE('crown', 0.35),
  { id: 'crown.catears', slot: 'crown', name: 'Pointed ears', tags: ['mammal'], dom: 0.55, w: 3,
    prims: [P('M-22,10 L-14,-18 L-2,8 Z', 'pd'), P('M-17,4 L-14,-10 L-8,3 Z', 'ad', { ns: true }), P('M2,8 L11,-19 L22,10 Z', 'p'), P('M7,3 L11,-12 L16,4 Z', 'a', { ns: true })] },
  { id: 'crown.bunny', slot: 'crown', name: 'Long ears', tags: ['mammal'], dom: 0.5, w: 2,
    prims: [P('M-14,10 C-19,-14 -12,-40 -5,-40 C1,-40 -1,-14 -5,10 Z', 'pd'), P('M4,10 C0,-14 6,-42 13,-40 C19,-38 17,-12 12,10 Z', 'p'), P('M7,0 C5,-14 8,-32 12,-32 C15,-32 14,-14 11,0 Z', 'a', { ns: true })] },
  { id: 'crown.horns', slot: 'crown', name: 'Horns', tags: ['beast', 'dragon'], dom: 0.6, w: 2,
    prims: [P('M-8,10 C-12,-6 -18,-14 -28,-14 C-18,-10 -14,-2 -14,10 Z', 'ad'), P('M6,10 C8,-6 16,-18 28,-16 C18,-12 14,-2 14,10 Z', 'a')] },
  { id: 'crown.spikes', slot: 'crown', name: 'Spikes', tags: ['rock'], dom: 0.5, w: 2,
    prims: [P('M-22,10 L-14,-13 L-6,10 Z', 'a'), P('M-8,10 L0,-17 L8,10 Z', 'a'), P('M6,10 L14,-13 L22,10 Z', 'a')] },
  { id: 'crown.antennae', slot: 'crown', name: 'Antennae', tags: ['bug'], dom: 0.45, w: 2,
    prims: [L('M-4,8 C-6,-8 -14,-18 -20,-26', 'k', 2.6), C(-21, -28, 3.5, 'a'), L('M4,8 C8,-8 14,-20 20,-26', 'k', 2.6), C(21, -28, 3.5, 'a')] },
  { id: 'crown.fin', slot: 'crown', name: 'Head fin', tags: ['aquatic'], dom: 0.5, w: 2,
    prims: [P('M-16,10 C-12,-14 6,-24 18,10 Z', 'a'), L('M-8,4 C-4,-10 2,-14 8,-6 M-2,4 C0,-6 4,-8 10,-2', 'k', 1.2, { op: 0.4 })] },
  { id: 'crown.sprout', slot: 'crown', name: 'Sprout', tags: ['plant'], dom: 0.45, w: 2,
    prims: [L('M0,8 C0,-4 -2,-10 -2,-16', 'k', 2.6), P('M-2,-16 C-12,-14 -16,-22 -14,-30 C-6,-30 -2,-24 -2,-16 Z', 'a'), P('M-2,-16 C8,-16 12,-26 8,-32 C2,-30 -2,-24 -2,-16 Z', 'a')] },
  { id: 'crown.crest', slot: 'crown', name: 'Feather crest', tags: ['bird'], dom: 0.5, w: 2,
    prims: [P('M-2,10 C-6,-6 -16,-18 -24,-16 C-16,-12 -10,-2 -6,10 Z', 'ad'), P('M0,10 C-2,-10 -8,-26 -14,-32 C-4,-26 2,-10 4,10 Z', 'a'), P('M2,10 C6,-6 14,-24 22,-26 C16,-16 10,-4 8,10 Z', 'al')] },
  { id: 'crown.halo', slot: 'crown', name: 'Halo', tags: ['spirit'], dom: 0.4, w: 1,
    prims: [E(0, -24, 16, 5, 'a'), E(0, -24, 10, 2.6, 'w', { ns: true, op: 0.6 })] },
  { id: 'crown.mohawk', slot: 'crown', name: 'Mohawk', tags: ['fighter'], dom: 0.5, w: 1,
    prims: [P('M-18,10 C-14,-4 -12,-14 -10,-22 C-6,-12 -4,-10 -2,-18 C2,-10 4,-12 6,-24 C10,-12 12,-8 16,-2 C20,4 18,10 14,10 Z', 'a')] },
  { id: 'crown.bolts', slot: 'crown', name: 'Static tufts', tags: ['electric'], dom: 0.5, w: 1,
    prims: [P('M-12,10 L-20,-10 L-14,-8 L-18,-22 L-8,-6 L-13,-6 L-6,10 Z', 'a'), P('M6,10 L16,-12 L10,-10 L18,-24 L4,-8 L10,-8 L2,10 Z', 'a')] },
  { id: 'crown.leafhat', slot: 'crown', name: 'Leaf cap', tags: ['plant'], dom: 0.45, w: 2,
    prims: [P('M-22,10 C-18,-12 18,-12 22,10 Z', 'a'), L('M0,8 C0,-2 2,-6 6,-10', 'k', 1.2, { op: 0.45 })] },
  { id: 'crown.flame', slot: 'crown', name: 'Flame tuft', tags: ['fire'], dom: 0.5, w: 1,
    prims: [P('M-10,10 C-14,-6 -6,-12 -4,-20 C0,-10 6,-14 4,-24 C12,-14 14,-4 10,10 Z', 'a'), P('M-4,10 C-6,0 -2,-4 0,-10 C2,-4 6,-2 4,10 Z', 'al', { ns: true })] },
  { id: 'crown.gem', slot: 'crown', name: 'Gem', tags: ['rock', 'fairy'], dom: 0.45, w: 1,
    prims: [P('M-8,10 L-6,-14 L0,-24 L6,-14 L8,10 Z', 'al'), L('M-6,-14 L6,-14 M0,-24 L0,8', 'k', 1, { op: 0.35 })] },
];
