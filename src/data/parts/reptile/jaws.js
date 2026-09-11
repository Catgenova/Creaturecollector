// Reptile jaws: the mouth line, teeth, beaks and tongues. Origin = the mouth corner on the head's jaw socket.
// Evolutions: stage 2 grows the jaw and adds teeth, longer fangs, a bigger hook or a longer
// tongue; stage 3 redraws them larger still with venom beads, serrations and tusk bands.
import { rPart } from './_shared.js';
import { L, P, C } from '../_dsl.js';

const MOUTH = 'M2,0 C-6,3 -14,4 -22,2';

export const R_JAWS = [
  rPart({
    id: 'grin', slot: 'jaw', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 3,
    extra: [L(MOUTH, 'k', 1.9), P('M-6,2.2 L-4.5,5.5 L-3,2.4 Z M-12,2.8 L-10.5,6 L-9,2.8 Z M-18,2.6 L-16.5,5.6 L-15,2.4 Z', 'w', { sw: 1 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-24,2.4 L-22.5,5.4 L-21,2.2 Z M0,1.5 L1.5,4.8 L3,1.2 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-6,2.2 L-4.5,7 L-3,2.4 Z M-12,2.8 L-10.5,7.4 L-9,2.8 Z M-18,2.6 L-16.5,7 L-15,2.4 Z M-24,2.4 L-22.5,6.4 L-21,2.2 Z M0,1.5 L1.5,6 L3,1.2 Z', 'w', { sw: 1 })] },
    },
  }),
  rPart({
    id: 'fangs', slot: 'jaw', name: 'Fangs', tags: ['snake'], dom: 0.55, w: 2,
    extra: [L(MOUTH, 'k', 1.9), P('M-4,2.5 L-2,9.5 L0,2 Z', 'w', { sw: 1.2 }), P('M-13,3 L-11,9 L-9,2.8 Z', 'w', { sw: 1.2 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-4,2.5 L-2,12 L0,2 Z', 'w', { sw: 1.2 }), P('M-13,3 L-11,11.5 L-9,2.8 Z', 'w', { sw: 1.2 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-4,2.5 L-1.6,14.5 L0.6,2 Z', 'w', { sw: 1.3 }), P('M-13,3 L-10.6,13.5 L-8.6,2.8 Z', 'w', { sw: 1.3 }), C(-1.4, 15.8, 1.3, 'a', { ns: true }), C(-10.4, 14.8, 1.1, 'a', { ns: true })] },
    },
  }),
  rPart({
    id: 'beak', slot: 'jaw', name: 'Beak', tags: ['turtle'], dom: 0.5, w: 2,
    extra: [P('M4,-6 C8,-4 8,2 3,4 C-2,6 -10,6 -16,3 C-8,2 -2,0 2,-2 Z', 'a', { sw: 1.6 }), L('M-14,3 C-8,2 -2,0 3,-3', 'k', 1.2)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M4,-8 C10,-6 10,3 3,6 C-1,7 -6,7 -10,6 L-8,3 C-2,3 4,1 5,-1 C6,-3 5,-5 2,-6 Z', 'a', { sw: 1.4 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M4,-9 C11,-6 11,4 3,7 C-1,8 -7,8 -12,6.5 L-9,3.5 C-2,3.5 4,1.5 5.5,-1 C6.5,-3.5 5,-6 2,-7 Z', 'a', { sw: 1.4 }), L('M-12,3.6 L-10,5.6 M-6,2.4 L-4,4.4 M0,0 L2,2', 'k', 1.2, { op: 0.5 })] },
    },
  }),
  rPart({
    id: 'tongue', slot: 'jaw', name: 'Forked tongue', tags: ['snake'], dom: 0.5, w: 2,
    extra: [L(MOUTH, 'k', 1.8), P('M2,0 C8,-2 14,-2 18,0 L22,-3 L20,1 L23,3 L17,1 C13,1 8,2 3,2 Z', 'a', { sw: 1 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M2,0 C10,-2 18,-2 24,0 L29,-4 L26,1 L30,4 L23,1.5 C17,1.5 10,2.5 3,2.5 Z', 'a', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M2,0 C10,-2.5 20,-2.5 28,0 L34,-5 L30,1 L35,5 L27,1.5 C20,1.5 10,3 3,2.5 Z', 'a', { sw: 1 }), C(35.5, -6, 1.2, 'a', { ns: true }), C(36.5, 6, 1.2, 'a', { ns: true })] },
    },
  }),
  rPart({
    id: 'tusks', slot: 'jaw', name: 'Tusks', tags: ['boar'], dom: 0.5, w: 1,
    extra: [L(MOUTH, 'k', 1.9), P('M-6,1 L-4,-8 L-1,2 Z', 'w', { sw: 1.2 }), P('M-16,2 L-14,-6 L-11,3 Z', 'w', { sw: 1.2 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-6,1 L-3.6,-12 L-0.6,2 Z', 'w', { sw: 1.2 }), P('M-16,2 L-13.6,-10 L-10.6,3 Z', 'w', { sw: 1.2 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-6,1 L-3,-15 L0,2 Z', 'w', { sw: 1.3 }), P('M-16,2 L-13,-13 L-10,3 Z', 'w', { sw: 1.3 }), L('M-5,-6 L-2,-6 M-15,-5 L-12,-5', 'a', 1.4, { ns: true, op: 0.8 })] },
    },
  }),
  rPart({
    id: 'smirk', slot: 'jaw', name: 'Smirk', tags: ['sly'], dom: 0.45, w: 2,
    extra: [L('M0,-1 C-4,3 -10,4 -16,3 C-13,1 -10,1 -8,1', 'k', 1.8)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-10,1.5 L-8.6,6.5 L-7.2,1.8 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-10,1.5 L-8.4,8 L-6.8,1.8 Z M-3,0.4 L-2,4.4 L-0.8,0.2 Z', 'w', { sw: 1 })] },
    },
  }),
  rPart({
    id: 'underbite', slot: 'jaw', name: 'Underbite', tags: ['teeth'], dom: 0.5, w: 2,
    extra: [L(MOUTH, 'k', 1.9), P('M-4,2 L-3,-3 L-1,2 Z M-10,3 L-9,-2 L-7,3 Z M-16,3 L-15,-2 L-13,3 Z', 'w', { sw: 1 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-22,2.8 L-21,-2.4 L-19,2.8 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-4,2 L-3,-5 L-1,2 Z M-10,3 L-9,-4 L-7,3 Z M-16,3 L-15,-4 L-13,3 Z M-22,2.8 L-21,-3.4 L-19,2.8 Z', 'w', { sw: 1 })] },
    },
  }),
];
