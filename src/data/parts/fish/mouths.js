// Fish mouths. Origin = the front tip of the body; mouths curve back (-x).
import { fPart } from './_shared.js';
import { E, C, L, P } from '../_dsl.js';

export const F_MOUTHS = [
  fPart({ id: 'pout', slot: 'mouth', name: 'Pout', tags: ['cute'], dom: 0.5, w: 3, extra: [E(-1, 0, 2.8, 3.2, 'k', { ns: true }), C(-1.8, -1, 0.9, 'w', { ns: true, op: 0.7 })] }),
  fPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M1,-3 C-2,3 -8,5 -14,3', 'k', 1.9)] }),
  fPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 2, extra: [L('M1,-2 C-3,3 -9,4 -16,2', 'k', 1.9), P('M-4,3 L-3,6.5 L-1.5,3 Z M-9,3.6 L-8,7 L-6.5,3.6 Z M-14,2.8 L-13,6 L-11.5,2.6 Z', 'w', { sw: 1 })] }),
  fPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M1,3 C-2,-2 -8,-4 -14,-2', 'k', 1.9)] }),
  fPart({ id: 'sucker', slot: 'mouth', name: 'Sucker', tags: ['koi'], dom: 0.5, w: 2, extra: [E(-2, 0, 5.5, 4.4, 'pd', { sw: 1.8 }), E(-2, 0, 2.6, 2, 'k', { ns: true }), C(-3.4, -1.4, 0.8, 'w', { ns: true, op: 0.6 })] }),
  fPart({ id: 'gape', slot: 'mouth', name: 'Gape', tags: ['open'], dom: 0.5, w: 2, extra: [P('M2,-6 C-6,-9 -13,-4 -13,0 C-13,4 -6,9 2,6 Z', 'k', { ns: true }), P('M-2,1 C-6,0 -10,1 -11,3 C-8,6 -3,6 0,4 Z', 'a', { ns: true })] }),
  fPart({ id: 'fangs', slot: 'mouth', name: 'Needle teeth', tags: ['angler'], dom: 0.55, w: 1, extra: [L('M1,-2 C-3,3 -10,4 -18,2', 'k', 1.9), P('M-4,2.5 L-3,9 L-1,2.4 Z M-10,3.4 L-9,9.5 L-7,3.2 Z M-16,2.6 L-15,8 L-13,2.4 Z', 'w', { sw: 1 }), P('M-7,2 L-6,-4 L-4.5,2 Z M-13,2.6 L-12,-3 L-10.5,2.4 Z', 'w', { sw: 1 })] }),
];
