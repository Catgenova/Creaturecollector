import { P, E, C, L, NONE } from './_dsl.js';

// Eyes: origin at the eye centre, base radius about 7. Drawn for the near eye; the far eye is a scaled copy.
export const EYES = [
  { id: 'eye.round', slot: 'eyes', name: 'Round', dom: 0.5, w: 3,
    prims: [C(0, 0, 7, 'w'), C(1.2, 0.4, 4, 'k', { ns: true }), C(2.6, -2.2, 1.6, 'w', { ns: true })] },
  { id: 'eye.big', slot: 'eyes', name: 'Big', dom: 0.5, w: 3,
    prims: [E(0, 0, 8, 9, 'w'), C(1, 0.5, 5.5, 'e', { ns: true }), C(1.6, 1, 3, 'k', { ns: true }), C(3.2, -2.6, 2, 'w', { ns: true }), C(-1, 3, 1, 'w', { ns: true, op: 0.7 })] },
  { id: 'eye.angry', slot: 'eyes', name: 'Fierce', dom: 0.55, w: 2,
    prims: [C(0, 0, 7, 'w'), C(1.2, 0.6, 4, 'k', { ns: true }), C(2.6, -1.6, 1.4, 'w', { ns: true }), P('M-9,-9 L9,-9 L9,-3 L-9,-6 Z', 'p', { ns: true }), L('M-9,-6 L9,-3', 'k', 2.2)] },
  { id: 'eye.sleepy', slot: 'eyes', name: 'Sleepy', dom: 0.45, w: 2,
    prims: [C(0, 0, 7, 'w'), C(1, 1, 4, 'k', { ns: true }), C(2.4, -0.4, 1.4, 'w', { ns: true }), P('M-8,-1 A8,8 0 0,1 8,-1 Z', 'p', { ns: true }), L('M-8,-1 L8,-1', 'k', 2.2)] },
  { id: 'eye.dot', slot: 'eyes', name: 'Dot', dom: 0.4, w: 2,
    prims: [C(0, 0, 4.5, 'k', { ns: true }), C(1.5, -1.5, 1.6, 'w', { ns: true })] },
  { id: 'eye.bug', slot: 'eyes', name: 'Compound', dom: 0.5, w: 1,
    prims: [C(0, 0, 8, 'e'), C(0, 0, 5, 'k', { ns: true, op: 0.35 }), C(2.5, -2.5, 2.2, 'w', { ns: true }), L('M-4,3 L4,3 M-4,0 L5,0 M-3,-3 L4,-3', 'k', 0.8, { op: 0.35 })] },
  { id: 'eye.slit', slot: 'eyes', name: 'Slit', dom: 0.55, w: 2,
    prims: [C(0, 0, 7, 'e'), E(1, 0, 1.8, 5.2, 'k', { ns: true }), C(2.8, -2.4, 1.4, 'w', { ns: true })] },
  { id: 'eye.sad', slot: 'eyes', name: 'Worried', dom: 0.4, w: 1,
    prims: [C(0, 0, 7, 'w'), C(1, 0.6, 4, 'k', { ns: true }), C(2.4, -1.6, 1.4, 'w', { ns: true }), P('M-9,-4 L9,-9 L9,-11 L-9,-11 Z', 'p', { ns: true }), L('M-9,-4 L9,-9', 'k', 2.2)] },
  { id: 'eye.spiral', slot: 'eyes', name: 'Spiral', dom: 0.4, w: 1,
    prims: [C(0, 0, 7, 'w'), L('M0,0 C2,-1 3,1 1,2 C-2,3 -4,0 -2,-3 C1,-5 5,-3 5,1', 'k', 1.6)] },
];

// Mouths: origin at the mouth centre.
export const MOUTHS = [
  NONE('mouth', 0.2),
  { id: 'mouth.smile', slot: 'mouth', name: 'Smile', dom: 0.5, w: 3, prims: [L('M-7,-1 Q0,5 7,-2', 'k', 2.4)] },
  { id: 'mouth.grin', slot: 'mouth', name: 'Grin', dom: 0.5, w: 2,
    prims: [P('M-9,-2 Q0,9 9,-2 Z', 'k', { ns: true }), P('M-6,-1 L6,-1 L5,2 L-5,2 Z', 'w', { ns: true })] },
  { id: 'mouth.fangs', slot: 'mouth', name: 'Fangs', dom: 0.55, w: 2,
    prims: [L('M-8,-1 Q0,4 8,-1', 'k', 2.2), P('M-5,0 L-3,6 L-1,1 Z', 'w', { sw: 1.2 }), P('M2,1 L4,6 L6,0 Z', 'w', { sw: 1.2 })] },
  { id: 'mouth.flat', slot: 'mouth', name: 'Flat', dom: 0.4, w: 2, prims: [L('M-6,0 L6,0', 'k', 2.4)] },
  { id: 'mouth.open', slot: 'mouth', name: 'Open', dom: 0.45, w: 2,
    prims: [E(0, 1, 4.5, 5.5, 'k', { ns: true }), E(0, 3, 2.6, 2.2, 'a', { ns: true })] },
  { id: 'mouth.tongue', slot: 'mouth', name: 'Tongue', dom: 0.45, w: 1,
    prims: [L('M-7,-1 Q0,4 7,-2', 'k', 2.4), P('M-1,1 C0,7 5,8 6,3 L3,0 Z', 'a', { sw: 1.2 })] },
  { id: 'mouth.frown', slot: 'mouth', name: 'Frown', dom: 0.45, w: 1, prims: [L('M-7,2 Q0,-4 7,2', 'k', 2.4)] },
  { id: 'mouth.teeth', slot: 'mouth', name: 'Teeth', dom: 0.5, w: 1,
    prims: [P('M-9,-3 L9,-3 L9,3 L-9,3 Z', 'w', { sw: 1.8 }), L('M-6,-3 L-6,3 M-2,-3 L-2,3 M2,-3 L2,3 M6,-3 L6,3', 'k', 1.4)] },
  { id: 'mouth.smirk', slot: 'mouth', name: 'Smirk', dom: 0.45, w: 2, prims: [L('M-6,1 Q2,4 7,-3', 'k', 2.4)] },
];
