import { P, C, L, NONE } from './_dsl.js';

// Legs: origin at the hip, one leg hanging down with the sole at y = len (scale 1).
export const LEGS = [
  NONE('legs', 0.3),
  { id: 'legs.stub', slot: 'legs', name: 'Stubby', dom: 0.5, w: 3, len: 40,
    prims: [P('M-8,-4 L8,-4 L9,34 Q9,40 3,40 L-6,40 Q-11,40 -10,34 Z', 'p')] },
  { id: 'legs.canine', slot: 'legs', name: 'Canine', tags: ['mammal'], dom: 0.55, w: 3, len: 40,
    prims: [P('M-10,-6 C-14,8 -8,18 -3,24 L-3,34 Q-3,40 5,40 L13,40 Q15,38 11,36 L5,34 L5,22 C9,12 9,4 6,-6 Z', 'p'), L('M2,40 L2,36 M6,40 L6,36', 'k', 1.2, { op: 0.5 })] },
  { id: 'legs.bird', slot: 'legs', name: 'Talons', tags: ['bird'], dom: 0.5, w: 2, len: 40,
    prims: [L('M0,-2 L0,30', 'a', 4.5), L('M0,30 L9,40 M0,30 L1,40 M0,30 L-7,40 M0,30 L-5,24', 'a', 3.5)] },
  { id: 'legs.hoof', slot: 'legs', name: 'Hooves', tags: ['mammal'], dom: 0.5, w: 2, len: 40,
    prims: [P('M-7,-4 L7,-4 L6,30 L-6,30 Z', 'p'), P('M-8,29 L8,29 L9,40 L-9,40 Z', 'k')] },
  { id: 'legs.frog', slot: 'legs', name: 'Springy', tags: ['amphibian'], dom: 0.45, w: 2, len: 40,
    prims: [P('M-6,-4 C-18,2 -22,18 -14,28 L-2,34 L14,40 L15,36 L4,30 L-3,22 C-8,14 -2,6 5,0 Z', 'p')] },
  { id: 'legs.tentacle', slot: 'legs', name: 'Tentacles', tags: ['aquatic'], dom: 0.45, w: 1, len: 40,
    prims: [P('M-7,-2 C-11,10 -3,16 -7,26 C-11,36 -3,42 5,40 C9,36 5,30 7,22 C9,12 8,6 7,-2 Z', 'p'), C(-4, 30, 1.6, 'a', { ns: true }), C(-2, 22, 1.6, 'a', { ns: true }), C(-4, 14, 1.6, 'a', { ns: true })] },
  { id: 'legs.chunky', slot: 'legs', name: 'Clawed', tags: ['dragon', 'beast'], dom: 0.55, w: 2, len: 40,
    prims: [P('M-13,-6 C-17,10 -11,20 -7,26 L-7,34 Q-7,40 3,40 L15,40 Q17,36 11,36 L7,34 L7,26 C11,16 11,6 9,-6 Z', 'p'), P('M12,40 L15,36 L17,40 Z', 'w', { sw: 1.2 }), P('M6,40 L8,36 L10,40 Z', 'w', { sw: 1.2 })] },
  { id: 'legs.insect', slot: 'legs', name: 'Jointed', tags: ['bug'], dom: 0.45, w: 1, len: 40,
    prims: [L('M0,-2 C-10,4 -14,16 -10,30', 'k', 3.4), L('M-10,30 L-8,40', 'k', 3), C(-10, 30, 3, 'p')] },
  { id: 'legs.peg', slot: 'legs', name: 'Pegs', tags: ['steel'], dom: 0.4, w: 1, len: 40,
    prims: [P('M-5,-4 L5,-4 L4,40 L-4,40 Z', 'a')] },
];

// Arms: origin at the shoulder, near arm reaching forward and down.
export const ARMS = [
  NONE('arms', 0.35),
  { id: 'arms.stub', slot: 'arms', name: 'Nubs', dom: 0.5, w: 3, prims: [P('M0,-7 C9,-9 17,-2 15,7 C13,13 3,13 0,7 Z', 'p')] },
  { id: 'arms.claw', slot: 'arms', name: 'Claws', dom: 0.55, w: 2,
    prims: [P('M0,-6 C10,-8 19,-1 19,8 L24,16 L18,12 L19,19 L14,13 L12,19 L9,10 C4,10 0,6 0,0 Z', 'p')] },
  { id: 'arms.fin', slot: 'arms', name: 'Fins', tags: ['aquatic'], dom: 0.5, w: 2,
    prims: [P('M0,-7 C10,-11 24,-3 22,10 C15,8 6,11 0,9 Z', 'a'), L('M4,-2 C10,0 14,4 16,8 M3,3 C8,4 11,6 12,9', 'k', 1.1, { op: 0.4 })] },
  { id: 'arms.paw', slot: 'arms', name: 'Paws', tags: ['mammal'], dom: 0.5, w: 2,
    prims: [P('M0,-7 C8,-9 15,0 13,10 C11,17 3,17 0,10 Z', 'p'), L('M4,15 L4,12 M8,15 L8,12', 'k', 1.2, { op: 0.5 })] },
  { id: 'arms.tentacle', slot: 'arms', name: 'Tendrils', dom: 0.45, w: 1,
    prims: [P('M0,-6 C10,-4 18,4 16,14 C14,22 6,24 2,20 C6,18 10,14 8,8 C6,2 2,0 0,2 Z', 'p')] },
  { id: 'arms.blade', slot: 'arms', name: 'Blades', tags: ['steel', 'bug'], dom: 0.5, w: 1,
    prims: [P('M0,-6 C6,-8 12,-4 12,2 L30,14 L12,10 C8,10 2,8 0,2 Z', 'a')] },
];

// Wings: origin at the wing root, extending up and back (left). A far copy is drawn behind the body.
export const WINGS = [
  NONE('wings', 0.4),
  { id: 'wings.feather', slot: 'wings', name: 'Feathered', tags: ['bird'], dom: 0.55, w: 3,
    prims: [P('M0,0 C-10,-12 -30,-30 -56,-30 C-50,-22 -44,-16 -40,-10 C-46,-10 -52,-8 -56,-4 C-46,0 -30,2 -14,6 C-8,6 -2,4 0,0 Z', 'p'), L('M-14,4 C-24,-6 -36,-16 -46,-24 M-18,5 C-28,-2 -38,-6 -48,-8', 'k', 1.2, { op: 0.35 })] },
  { id: 'wings.bat', slot: 'wings', name: 'Membrane', tags: ['dragon', 'dark'], dom: 0.55, w: 2,
    prims: [P('M0,0 C-6,-16 -20,-30 -50,-34 L-40,-20 L-54,-18 L-38,-8 L-50,0 L-30,2 C-20,6 -8,6 0,0 Z', 'a'), L('M-4,-2 L-40,-20 M-4,-2 L-38,-8 M-4,-2 L-30,2', 'k', 1.4, { op: 0.5 })] },
  { id: 'wings.bug', slot: 'wings', name: 'Gossamer', tags: ['bug', 'fairy'], dom: 0.5, w: 2,
    prims: [P('M0,0 C-6,-20 -36,-36 -48,-26 C-56,-16 -30,2 0,0 Z', 'w', { op: 0.8 }), P('M0,2 C-10,-4 -34,-6 -40,4 C-42,12 -20,12 0,2 Z', 'w', { op: 0.7 }), L('M-4,-2 C-16,-12 -30,-20 -42,-24', 'k', 1, { op: 0.3 })] },
  { id: 'wings.leaf', slot: 'wings', name: 'Leaf wings', tags: ['plant'], dom: 0.5, w: 2,
    prims: [P('M0,0 C-10,-14 -30,-30 -52,-24 C-44,-8 -20,2 0,0 Z', 'a'), L('M-4,-2 C-16,-10 -30,-18 -46,-22', 'k', 1.2, { op: 0.45 })] },
  { id: 'wings.fire', slot: 'wings', name: 'Blazing', tags: ['fire'], dom: 0.5, w: 1,
    prims: [P('M0,0 C-8,-10 -18,-14 -30,-14 C-26,-22 -34,-30 -46,-34 C-42,-24 -48,-20 -54,-20 C-46,-12 -40,-4 -30,0 C-20,4 -8,4 0,0 Z', 'a'), P('M-6,-2 C-14,-8 -22,-10 -30,-10 C-26,-16 -30,-22 -38,-26 C-36,-18 -40,-14 -44,-14 C-38,-8 -30,-4 -22,-2 Z', 'al', { ns: true })] },
  { id: 'wings.fin', slot: 'wings', name: 'Fin wings', tags: ['aquatic'], dom: 0.45, w: 1,
    prims: [P('M0,0 C-8,-12 -26,-22 -44,-16 C-40,-8 -30,-2 -20,2 C-12,4 -6,4 0,0 Z', 'a'), L('M-6,-2 C-16,-8 -26,-12 -36,-12 M-8,0 C-18,-4 -26,-4 -34,-4', 'k', 1.1, { op: 0.4 })] },
];
