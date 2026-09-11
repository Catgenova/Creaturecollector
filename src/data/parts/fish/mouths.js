// Fish mouths. Origin = the front tip of the body; mouths curve back (-x).
// Evolutions: stage 2 grows the mouth and adds teeth, an accent lip ring or bubbles; stage 3
// redraws them larger with more teeth, glow and bubbles.
import { fPart } from './_shared.js';
import { E, C, L, P } from '../_dsl.js';
import { evoRing } from '../_evo.js';

export const F_MOUTHS = [
  fPart({ id: 'pout', slot: 'mouth', name: 'Pout', tags: ['cute'], dom: 0.5, w: 3, extra: [E(-1, 0, 2.8, 3.2, 'k', { ns: true }), C(-1.8, -1, 0.9, 'w', { ns: true, op: 0.7 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [evoRing(-1, 0, 3.8, 'a', 1.2, { op: 0.7 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [evoRing(-1, 0, 3.8, 'a', 1.2, { op: 0.7 }), C(3, -6, 2, 'w', { ns: true, op: 0.5 }), C(5.5, -10, 1.2, 'w', { ns: true, op: 0.4 })] },
    } }),
  fPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M1,-3 C-2,3 -8,5 -14,3', 'k', 1.9)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-8,4 L-6.8,7.4 L-5.4,4 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-8,4 L-6.8,8 L-5.4,4 Z M-12,3.6 L-11,6.8 L-9.8,3.4 Z', 'w', { sw: 1 })] },
    } }),
  fPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 2, extra: [L('M1,-2 C-3,3 -9,4 -16,2', 'k', 1.9), P('M-4,3 L-3,6.5 L-1.5,3 Z M-9,3.6 L-8,7 L-6.5,3.6 Z M-14,2.8 L-13,6 L-11.5,2.6 Z', 'w', { sw: 1 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-1,2 L0,5 L1.2,1.6 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-4,3 L-3,8 L-1.5,3 Z M-9,3.6 L-8,8.5 L-6.5,3.6 Z M-14,2.8 L-13,7.5 L-11.5,2.6 Z M-1,2 L0,6 L1.2,1.6 Z', 'w', { sw: 1 })] },
    } }),
  fPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M1,3 C-2,-2 -8,-4 -14,-2', 'k', 1.9)],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-8,-3 L-6.8,1 L-5.4,-3 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-8,-3 L-6.8,2 L-5.4,-3 Z M-12,-2.6 L-11,1 L-9.8,-2.6 Z', 'w', { sw: 1 })] },
    } }),
  fPart({ id: 'sucker', slot: 'mouth', name: 'Sucker', tags: ['koi'], dom: 0.5, w: 2, extra: [E(-2, 0, 5.5, 4.4, 'pd', { sw: 1.8 }), E(-2, 0, 2.6, 2, 'k', { ns: true }), C(-3.4, -1.4, 0.8, 'w', { ns: true, op: 0.6 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [evoRing(-2, 0, 6.8, 'a', 1.4, { op: 0.7 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [evoRing(-2, 0, 6.8, 'a', 1.4, { op: 0.7 }), C(3, -7, 2, 'w', { ns: true, op: 0.5 }), C(6, -11, 1.2, 'w', { ns: true, op: 0.4 })] },
    } }),
  fPart({ id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.5, w: 2, extra: [P('M2,-6 C-6,-9 -13,-4 -13,0 C-13,4 -6,9 2,6 Z', 'k', { ns: true }), P('M-2,1 C-6,0 -10,1 -11,3 C-8,6 -3,6 0,4 Z', 'a', { ns: true })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-2,-5 L-1,-2 L0,-5 Z M-7,-6.5 L-6,-3.5 L-5,-6.5 Z M-11,-4 L-10,-1 L-9,-4 Z', 'w', { ns: true })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-2,-5 L-1,-1.4 L0,-5 Z M-7,-6.5 L-6,-2.8 L-5,-6.5 Z M-11,-4 L-10,-0.6 L-9,-4 Z', 'w', { ns: true }), C(-7, 1, 1.4, 'a', { ns: true }), C(-6, 0, 6, 'a', { ns: true, op: 0.2 })] },
    } }),
  fPart({ id: 'fangs', slot: 'mouth', name: 'Needle teeth', tags: ['angler'], dom: 0.55, w: 1, extra: [L('M1,-2 C-3,3 -10,4 -18,2', 'k', 1.9), P('M-4,2.5 L-3,9 L-1,2.4 Z M-10,3.4 L-9,9.5 L-7,3.2 Z M-16,2.6 L-15,8 L-13,2.4 Z', 'w', { sw: 1 }), P('M-7,2 L-6,-4 L-4.5,2 Z M-13,2.6 L-12,-3 L-10.5,2.4 Z', 'w', { sw: 1 })],
    stages: {
      2: { grow: [1.12, 1.12], add: [P('M-4,2.5 L-3,11 L-1,2.4 Z M-10,3.4 L-9,11.5 L-7,3.2 Z', 'w', { sw: 1 })] },
      3: { reset: true, grow: [1.25, 1.25], add: [P('M-4,2.5 L-3,13 L-1,2.4 Z M-10,3.4 L-9,13.5 L-7,3.2 Z M-16,2.6 L-15,10 L-13,2.4 Z', 'w', { sw: 1 }), P('M-7,2 L-6,-6 L-4.5,2 Z M-13,2.6 L-12,-5 L-10.5,2.4 Z', 'w', { sw: 1 }), C(-3, 13.6, 1.1, 'a', { ns: true }), C(-9, 14, 1.1, 'a', { ns: true })] },
    } }),
];
