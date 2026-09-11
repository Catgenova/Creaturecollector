// Reptile jaws: the mouth line, teeth, beaks and tongues. Origin = the mouth corner on the head's jaw socket.
import { rPart } from './_shared.js';
import { L, P } from '../_dsl.js';

const MOUTH = 'M2,0 C-6,3 -14,4 -22,2';

export const R_JAWS = [
  rPart({ id: 'grin', slot: 'jaw', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 3, extra: [L(MOUTH, 'k', 1.9), P('M-6,2.2 L-4.5,5.5 L-3,2.4 Z M-12,2.8 L-10.5,6 L-9,2.8 Z M-18,2.6 L-16.5,5.6 L-15,2.4 Z', 'w', { sw: 1 })] }),
  rPart({ id: 'fangs', slot: 'jaw', name: 'Fangs', tags: ['snake'], dom: 0.55, w: 2, extra: [L(MOUTH, 'k', 1.9), P('M-4,2.5 L-2,9.5 L0,2 Z', 'w', { sw: 1.2 }), P('M-13,3 L-11,9 L-9,2.8 Z', 'w', { sw: 1.2 })] }),
  rPart({ id: 'beak', slot: 'jaw', name: 'Beak', tags: ['turtle'], dom: 0.5, w: 2, extra: [P('M4,-6 C8,-4 8,2 3,4 C-2,6 -10,6 -16,3 C-8,2 -2,0 2,-2 Z', 'a', { sw: 1.6 }), L('M-14,3 C-8,2 -2,0 3,-3', 'k', 1.2)] }),
  rPart({ id: 'tongue', slot: 'jaw', name: 'Forked tongue', tags: ['snake'], dom: 0.5, w: 2, extra: [L(MOUTH, 'k', 1.8), P('M2,0 C8,-2 14,-2 18,0 L22,-3 L20,1 L23,3 L17,1 C13,1 8,2 3,2 Z', 'a', { sw: 1 })] }),
  rPart({ id: 'tusks', slot: 'jaw', name: 'Tusks', tags: ['boar'], dom: 0.5, w: 1, extra: [L(MOUTH, 'k', 1.9), P('M-6,1 L-4,-8 L-1,2 Z', 'w', { sw: 1.2 }), P('M-16,2 L-14,-6 L-11,3 Z', 'w', { sw: 1.2 })] }),
  rPart({ id: 'smirk', slot: 'jaw', name: 'Smirk', tags: ['sly'], dom: 0.45, w: 2, extra: [L('M0,-1 C-4,3 -10,4 -16,3 C-13,1 -10,1 -8,1', 'k', 1.8)] }),
  rPart({ id: 'underbite', slot: 'jaw', name: 'Underbite', tags: ['teeth'], dom: 0.5, w: 2, extra: [L(MOUTH, 'k', 1.9), P('M-4,2 L-3,-3 L-1,2 Z M-10,3 L-9,-2 L-7,3 Z M-16,3 L-15,-2 L-13,3 Z', 'w', { sw: 1 })] }),
];
