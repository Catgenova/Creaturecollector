// Nightwing crests (between the ears, behind the head), ruffs (around the neck, in front of the body) and
// markings (a pattern clipped to the torso, 100 x 60 frame).
// Evolutions: crests and ruffs grow; markings are flat.
import { nwPart } from './_shared.js';
import { NONE, L, C, PATCH, fur, spline, puff, leaf } from '../_dsl.js';

const nwGrowDress = { 2: { grow: [1.1, 1.1] }, 3: { grow: [1.12, 1.15] } };

export const NW_CRESTS = [
  NONE('crest', 0.3, 'n.'),
  nwPart({ id: 'tuft', slot: 'crest', name: 'Tuft', tags: ['fur'], dom: 0.5, w: 3, shapes: [{ pts: [[-6, 2], ...fur([-6, 2], [6, 2], 3, 10, { tip: 'c' }), [6, 4], [-6, 4]], f: 'p' }], extra: [L('M-2,0 L-3,-6 M2,0 L3,-6', 'k', 0.9, { op: 0.25 })], stages: nwGrowDress }),
  nwPart({ id: 'mohawk', slot: 'crest', name: 'Mohawk', tags: ['punk'], dom: 0.5, w: 2, shapes: [{ pts: [[-10, 2], ...fur([-10, 2], [10, 2], 5, 12, { tip: 0.3, lean: 0.4 }), [10, 4], [-10, 4]], f: 'a' }], stages: nwGrowDress }),
  nwPart({ id: 'horns', slot: 'crest', name: 'Horns', tags: ['horn'], dom: 0.5, w: 2, shapes: [[[-8, 2], [-11, -10, 'c'], [-4, 1]], [[4, 1], [9, -11, 'c'], [8, 2]]], extra: [L('M-8,-2 L-9,-6 M6,-3 L7,-7', 'k', 0.9, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'spikes', slot: 'crest', name: 'Spikes', tags: ['sharp'], dom: 0.5, w: 2, shapes: [{ pts: [[-9, 2], ...fur([-9, 2], [9, 2], 4, 9, { tip: 1 }), [9, 4], [-9, 4]], f: 'pd' }], stages: nwGrowDress }),
  nwPart({ id: 'crown', slot: 'crest', name: 'Fur crown', tags: ['royal'], dom: 0.5, w: 2, shapes: [{ pts: [[-8, 2], ...fur([-8, 2], [8, 2], 4, 7, { tip: 'c' }), [8, 4], [-8, 4]], f: 's' }], extra: [C(0, -3, 1.2, 'a', { ns: true })], stages: nwGrowDress }),
  nwPart({ id: 'plume', slot: 'crest', name: 'Plume', tags: ['feather'], dom: 0.5, w: 2, shapes: [{ d: leaf([0, 2], [-6, -22], 4), f: 'a' }], extra: [L('M0,0 L-4,-16', 'k', 0.8, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'leaf', slot: 'crest', name: 'Leaf', tags: ['plant'], dom: 0.5, w: 2, shapes: [{ d: leaf([0, 2], [2, -20], 5), f: 'a' }], extra: [L('M0,0 L1,-14', 'k', 0.8, { op: 0.35 })], stages: nwGrowDress }),
];

export const NW_RUFFS = [
  NONE('ruff', 0.3, 'n.'),
  nwPart({ id: 'collar', slot: 'ruff', name: 'Collar', tags: ['fur'], dom: 0.5, w: 3, shapes: [{ pts: puff(0, 0, 9, 7, 3), f: 's' }], extra: [L('M-5,-4 L-7,-7 M4,-5 L6,-8', 'k', 1, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'mane', slot: 'ruff', name: 'Mane', tags: ['fur'], dom: 0.5, w: 2, shapes: [{ pts: [[-4, 10], ...fur([-4, 10], [-4, -10], 5, 10, { tip: 'c' }), [-8, -10], [-8, 10]], f: 'p' }], extra: [L('M-8,-4 L-12,-6 M-8,2 L-12,4', 'k', 1, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'fluff', slot: 'ruff', name: 'Fluff', tags: ['soft'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, 0, 8, 9, 4, { tip: 'c' }), f: 'sl' }], extra: [C(-2, 2, 1, 'k', { ns: true, op: 0.2 })], stages: nwGrowDress }),
  nwPart({ id: 'spiky', slot: 'ruff', name: 'Spiky', tags: ['sharp'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, 0, 8, 7, 5, { tip: 1 }), f: 'pd' }], extra: [L('M-6,-2 L-9,-4 M5,-3 L8,-6', 'k', 1, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'feathery', slot: 'ruff', name: 'Feathery', tags: ['down'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, 0, 9, 6, 4, { tip: 'c' }), f: 's' }], extra: [L('M-6,-4 L-9,-8 M0,-7 L0,-11 M6,-4 L9,-8', 'k', 1, { op: 0.3 })], stages: nwGrowDress }),
  nwPart({ id: 'beads', slot: 'ruff', name: 'Beads', tags: ['jewel'], dom: 0.5, w: 2, extra: [L('M-9,-2 C-6,6 6,6 9,-2', 'k', 1.2), ...[-7, -3.5, 0, 3.5, 7].map((x) => C(x, 3 - Math.abs(x) * 0.25, 1.8, 'a', { sw: 1 }))], stages: nwGrowDress }),
  nwPart({ id: 'petals', slot: 'ruff', name: 'Petals', tags: ['flower'], dom: 0.5, w: 2, shapes: [{ pts: puff(0, 0, 8, 5, 5, { tip: 'c' }), f: 'a' }], extra: [C(0, 0, 2.4, 'w', { ns: true, op: 0.7 })], stages: nwGrowDress }),
];

export const NW_MARKINGS = [
  NONE('markings', 0.3, 'n.'),
  nwPart({ id: 'belly', slot: 'markings', name: 'Pale belly', tags: ['belly'], dom: 0.5, w: 3, extra: [PATCH('M-50,8 C-25,2 25,2 50,8 L50,30 L-50,30 Z', 's')] }),
  nwPart({ id: 'stripes', slot: 'markings', name: 'Stripes', tags: ['stripe'], dom: 0.5, w: 2, extra: [PATCH('M-30,-30 L-22,-30 L-10,30 L-18,30 Z M-6,-30 L2,-30 L14,30 L6,30 Z M18,-30 L26,-30 L38,30 L30,30 Z', 's', { op: 0.8 })] }),
  nwPart({ id: 'spots', slot: 'markings', name: 'Spots', tags: ['spot'], dom: 0.5, w: 2, extra: [PATCH(spline(puff(-20, -6, 6, 6, 2)), 'a'), PATCH(spline(puff(4, 8, 5, 6, 2)), 'a'), PATCH(spline(puff(24, -8, 5, 6, 2)), 'a'), PATCH(spline(puff(-2, -18, 4, 5, 1.5)), 'a')] }),
  nwPart({ id: 'blaze', slot: 'markings', name: 'Chest blaze', tags: ['blaze'], dom: 0.5, w: 2, extra: [PATCH('M20,-30 L50,-30 L50,10 C40,0 30,-10 20,-30 Z', 'a', { op: 0.85 })] }),
  nwPart({ id: 'mottled', slot: 'markings', name: 'Mottled', tags: ['patch'], dom: 0.5, w: 2, extra: [PATCH(spline(puff(-16, 4, 10, 7, 4)), 's'), PATCH(spline(puff(14, -8, 9, 7, 4)), 's'), PATCH(spline(puff(30, 10, 7, 6, 3)), 's')] }),
  nwPart({ id: 'saddle', slot: 'markings', name: 'Saddle', tags: ['back'], dom: 0.5, w: 2, extra: [PATCH('M-50,-30 L50,-30 L50,-8 C25,-2 -25,-2 -50,-8 Z', 's', { op: 0.8 })] }),
  nwPart({ id: 'collar', slot: 'markings', name: 'Collar band', tags: ['band'], dom: 0.5, w: 2, extra: [PATCH('M14,-30 L22,-30 C24,-10 24,10 22,30 L14,30 C16,10 16,-10 14,-30 Z', 'a', { op: 0.85 })] }),
];
