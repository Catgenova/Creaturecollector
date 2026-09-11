// Invertebrate eyes (on the body, or on stalks rising from it), mouths and feelers.
// Evolutions: eyes ring then glow; mouths grow teeth, fangs, beaks and bubbles; feelers grow accent
// tips, then extra feelers and bigger tips.
import { vPart, tendril } from './_shared.js';
import { NONE, E, C, L, P, S, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

function vEyeStages(cx, cy, r) {
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(cx, cy, r * 0.9, 'a', 1.2, { op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [C(cx, cy, r * 1.4, 'a', { ns: true, op: 0.2 }), C(cx - r * 0.4, cy - r * 0.45, r * 0.25, 'w', { ns: true, op: 0.9 })] },
  };
}

function vEye({ id, name, shape, sclera = 'w', iris = [0.8, 0.2, 3.8], irisRole = 'e', pupil = [1.2, 0.5, 2], glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], lid, before = [], after = [], evo, dom = 0.5, w = 2, tags = [] }) {
  const prims = [...before];
  if (shape) prims.push(P(shape, sclera, { sw: 2 }));
  if (iris) { prims.push(C(iris[0], iris[1], iris[2], irisRole, { ns: true, cl: Boolean(shape) })); prims.push(C(iris[0] + 0.5, iris[1] + 1, iris[2] * 0.72, 'ed', { ns: true, cl: Boolean(shape), op: 0.5 })); }
  if (pupil) prims.push(C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: Boolean(shape) }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  prims.push(...after);
  const [ex, ey, er] = evo || (iris ? [iris[0], iris[1], iris[2]] : [0, 0, 5]);
  return vPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: vEyeStages(ex, ey, er) });
}
const V_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const V_BIG = spline([[0, -8], [7.4, -2.6], [6.8, 6], [0, 8.4], [-6.8, 6], [-7.4, -2.6]]);
// stalk eyes: the eyeball sits at the tip of a stalk rising from the socket
const stalkUp = (h) => [...tendril(`M0,4 C0,${-h * 0.4} 2,${-h * 0.8} 4,${-h}`, 4.5), ...[]];

export const V_EYES = [
  vEye({ id: 'stalks', name: 'Eyestalks', tags: ['slug'], w: 3, shape: null, before: stalkUp(18), iris: null, pupil: null, glint: null, glint2: null, after: [C(4, -20, 5, 'w', { sw: 2 }), C(4.8, -19.6, 3, 'e', { ns: true }), C(5.4, -19.4, 1.6, 'k', { ns: true }), C(6.4, -21.4, 1, 'w', { ns: true })], evo: [4, -20, 5] }),
  vEye({ id: 'bead', name: 'Bead', tags: ['small'], w: 3, shape: spline([[0, -5.2], [5, -1.5], [4.4, 3.8], [0, 5.4], [-4.4, 3.8], [-5, -1.5]]), iris: [0.4, 0, 4.6], irisRole: 'k', pupil: null, glint: [1.9, -1.9, 1.4], glint2: [-1, 1.6, 0.6], lid: null }),
  vEye({ id: 'big', name: 'Big', tags: ['cute'], w: 3, shape: V_BIG, iris: [0.8, 0.4, 5], pupil: [1.4, 0.8, 2.8], glint: [2.8, -2.4, 1.7], glint2: [-1.4, 2.4, 0.9], lid: 'M-6,-6.5 Q0,-10 6,-6.5' }),
  vEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 2, shape: V_OVAL, sclera: 'e', iris: [0.4, 0, 4.4], irisRole: 'el', pupil: [0.8, 0.2, 2], glint: [2.4, -2.4, 1.3], before: [C(0, 0, 9, 'e', { ns: true, op: 0.3 })] }),
  vEye({ id: 'hollow', name: 'Hollow', tags: ['ghost'], w: 2, shape: spline([[0, -7], [6, -3], [5, 5], [0, 7.5], [-5, 5], [-6, -3]]), sclera: 'k', iris: null, pupil: null, glint: [1.5, -1, 1.5], glint2: null, after: [C(1, 1, 2.2, 'e', { ns: true, op: 0.8 })], evo: [0, 0, 5.5] }),
  vEye({ id: 'cluster', name: 'Cluster', tags: ['spider'], w: 2, shape: spline([[0, -5.5], [5.4, -1.8], [4.8, 4.2], [0, 5.8], [-4.8, 4.2], [-5.4, -1.8]]), iris: [0.4, 0, 4.8], irisRole: 'k', pupil: null, glint: [1.9, -2, 1.4], glint2: null, lid: null, after: [C(-7, -6, 2.4, 'k', { sw: 1.2 }), C(-2, -9, 2, 'k', { sw: 1.2 }), C(5, -8, 2.2, 'k', { sw: 1.2 }), C(-6.4, -6.8, 0.7, 'w', { ns: true }), C(-1.4, -9.8, 0.6, 'w', { ns: true }), C(5.6, -8.8, 0.7, 'w', { ns: true })] }),
  vEye({ id: 'stalked', name: 'Stalked', tags: ['crab'], w: 2, shape: null, before: [...tendril('M0,4 L1,-8', 4)], iris: null, pupil: null, glint: null, glint2: null, after: [C(1, -12, 5, 'w', { sw: 2 }), C(1.8, -11.6, 3, 'k', { ns: true }), C(3, -13.2, 1.1, 'w', { ns: true })], evo: [1, -12, 5] }),
];

export const V_MOUTHS = [
  NONE('mouth', 0.25, 'v.'),
  vPart({ id: 'smile', slot: 'mouth', name: 'Smile', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M-7,-1 Q0,5 7,-2', 'k', 2.2)],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-3,1.8 L-2,5 L-1,1.8 Z', 'w', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-3,1.8 L-2,5.4 L-1,1.8 Z M2,1.6 L3,4.6 L4,1.4 Z', 'w', { sw: 1 })] } } }),
  vPart({ id: 'frown', slot: 'mouth', name: 'Frown', tags: ['grumpy'], dom: 0.45, w: 2, extra: [L('M-7,2 Q0,-4 7,2', 'k', 2.2)],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-3,-1 L-2,2.4 L-1,-1 Z', 'w', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-3,-1 L-2,3 L-1,-1 Z M2,-1 L3,2.6 L4,-1 Z', 'w', { sw: 1 })] } } }),
  vPart({ id: 'o', slot: 'mouth', name: 'Gasp', tags: ['surprised'], dom: 0.45, w: 2, extra: [E(0, 1, 4, 5, 'k', { ns: true }), E(0, 2.5, 2.2, 2, 'a', { ns: true })],
    stages: { 2: { grow: [1.12, 1.12], add: [C(6, -6, 1.8, 'w', { ns: true, op: 0.5 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [C(6, -6, 2, 'w', { ns: true, op: 0.5 }), C(9, -10, 1.2, 'w', { ns: true, op: 0.4 }), P('M-2,-3.4 L-1.4,-1 L-0.8,-3.4 Z M0.8,-3.4 L1.4,-1 L2,-3.4 Z', 'w', { ns: true })] } } }),
  vPart({ id: 'fangs', slot: 'mouth', name: 'Chelicerae', tags: ['spider'], dom: 0.55, w: 2, extra: [P('M-6,-4 C-4,2 -2,6 -1,10 C-4,6 -8,2 -9,-3 Z', 'pd', { sw: 1.4 }), P('M6,-4 C4,2 2,6 1,10 C4,6 8,2 9,-3 Z', 'pd', { sw: 1.4 }), P('M-1,8 L0,13 L1,8 Z', 'w', { sw: 1 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-1,8 L0,15 L1,8 Z', 'w', { sw: 1 }), C(0, 15.5, 1.1, 'a', { ns: true })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-7,-5 C-5,2 -2,7 -1,12 C-4,7 -9,2 -10,-4 Z', 'pd', { sw: 1.4 }), P('M7,-5 C5,2 2,7 1,12 C4,7 9,2 10,-4 Z', 'pd', { sw: 1.4 }), P('M-1,9 L0,17 L1,9 Z', 'w', { sw: 1 }), C(0, 17.5, 1.3, 'a', { ns: true })] } } }),
  vPart({ id: 'beak', slot: 'mouth', name: 'Beak', tags: ['octopus'], dom: 0.5, w: 2, extra: [P('M-5,-3 C-2,-6 2,-6 5,-3 L0,5 Z', 'k', { ns: true }), P('M-3,-2 C-1,-4 1,-4 3,-2 L0,1 Z', 'a', { ns: true, op: 0.6 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-6,-4 C-2,-7.5 2,-7.5 6,-4 L0,6 Z', 'k', { ns: true }), P('M-3.5,-2.6 C-1,-4.6 1,-4.6 3.5,-2.6 L0,1.4 Z', 'a', { ns: true, op: 0.6 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-7,-5 C-2,-9 2,-9 7,-5 L0,8 Z', 'k', { ns: true }), P('M-4,-3 C-1,-5.5 1,-5.5 4,-3 L0,2 Z', 'a', { ns: true, op: 0.7 }), L('M-2,-6 L2,-6', 'w', 1, { ns: true, op: 0.5 })] } } }),
  vPart({ id: 'grin', slot: 'mouth', name: 'Grin', tags: ['teeth'], dom: 0.5, w: 2, extra: [P('M-9,-2 Q0,9 9,-2 Z', 'k', { ns: true }), P('M-6,-1 L6,-1 L5,2 L-5,2 Z', 'w', { ns: true }), L('M-2,-1 L-2,2 M2,-1 L2,2', 'k', 0.8, { op: 0.5 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-6,-1 L6,-1 L5,3 L-5,3 Z', 'w', { ns: true }), L('M-2,-1 L-2,3 M2,-1 L2,3 M-4.5,-1 L-4.5,2 M4.5,-1 L4.5,2', 'k', 0.8, { op: 0.5 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-11,-2 Q0,11 11,-2 Z', 'k', { ns: true }), P('M-7,-1 L7,-1 L6,3.5 L-6,3.5 Z', 'w', { ns: true }), L('M-2,-1 L-2,3.5 M2,-1 L2,3.5 M-4.8,-1 L-4.8,2.6 M4.8,-1 L4.8,2.6', 'k', 0.8, { op: 0.5 }), P('M-6.5,-1 L-5.8,4.5 L-5,-1 Z M5,-1 L5.8,4.5 L6.5,-1 Z', 'w', { ns: true })] } } }),
  vPart({ id: 'wavy', slot: 'mouth', name: 'Wavy', tags: ['ghost'], dom: 0.45, w: 2, extra: [L('M-8,0 Q-4,-4 0,0 T8,0', 'k', 2.2)],
    stages: { 2: { grow: [1.12, 1.12], add: [L('M-8,0 Q-4,-4 0,0 T8,0', 'a', 0.9, { ns: true, op: 0.6 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [L('M-10,0 Q-6,-4 -2,0 T6,0 T10,-2', 'k', 2.2), C(-6, -3, 1.2, 'a', { ns: true, op: 0.7 }), C(2, -3, 1.2, 'a', { ns: true, op: 0.7 })] } } }),
];

/** Shared feeler evolution: accent beads at the tips, then bigger beads and an extra feeler. */
const feelerStages = (tips, extra3 = []) => ({
  2: { grow: [1.15, 1.2], add: tips.map(([x, y]) => C(x, y, 1.8, 'a', { ns: true })) },
  3: { grow: [1.12, 1.15], add: [...extra3, ...tips.map(([x, y]) => C(x, y, 2.4, 'a', { ns: true }))] },
});

export const V_FEELERS = [
  NONE('feelers', 0.3, 'v.'),
  vPart({ id: 'slug', slot: 'feelers', name: 'Lower tentacles', tags: ['slug'], dom: 0.5, w: 3, extra: [...tendril('M0,2 C4,2 8,4 10,8', 3.4), ...tendril('M-2,4 C0,6 2,9 2,12', 3)],
    stages: feelerStages([[10, 8], [2, 12]], [...tendril('M-4,0 C-2,-6 2,-10 6,-12', 2.8), C(6, -12, 2.2, 'a', { ns: true })]) }),
  vPart({ id: 'antennae', slot: 'feelers', name: 'Antennae', tags: ['thin'], dom: 0.5, w: 2, extra: [...tendril('M-2,-2 C4,-12 10,-18 20,-22', 2.2), ...tendril('M-4,0 C0,-12 4,-20 10,-28', 2)],
    stages: feelerStages([[20, -22], [10, -28]], [...tendril('M0,0 C8,-4 16,-4 24,-8', 2), C(24, -8, 2, 'a', { ns: true })]) }),
  vPart({ id: 'whiskers', slot: 'feelers', name: 'Whiskers', tags: ['sensory'], dom: 0.45, w: 2, extra: [L('M0,-2 C6,-4 12,-4 18,-6 M0,0 C6,0 12,1 18,3 M0,2 C4,6 8,9 12,13', 'k', 1.2, { op: 0.5 })],
    stages: feelerStages([[18, -6], [18, 3], [12, 13]], [L('M0,-4 C6,-8 12,-10 16,-14', 'k', 1.2, { op: 0.5 }), C(16, -14, 1.8, 'a', { ns: true })]) }),
  vPart({ id: 'hairs', slot: 'feelers', name: 'Sensory hairs', tags: ['fuzzy'], dom: 0.45, w: 2, extra: [L('M-2,-6 L2,-12 M2,-5 L7,-10 M5,-2 L11,-5 M6,2 L12,2 M5,6 L10,10 M2,8 L4,14', 'k', 1.4, { op: 0.5 })],
    stages: feelerStages([[2, -12], [11, -5], [12, 2], [10, 10]], [L('M-4,-2 L-8,-8 M-2,4 L-6,10', 'k', 1.4, { op: 0.5 }), C(-8, -8, 1.6, 'a', { ns: true }), C(-6, 10, 1.6, 'a', { ns: true })]) }),
  vPart({ id: 'frills', slot: 'feelers', name: 'Frills', tags: ['gills'], dom: 0.45, w: 2, extra: [S([[-2, -8], [6, -12], [12, -8, 0.3], [6, -4], [10, 0, 0.3], [4, 2], [8, 8, 0.3], [2, 8], [-2, 4]], 'a')],
    stages: { 2: { grow: [1.15, 1.2], add: [C(12, -8, 1.8, 'w', { ns: true, op: 0.85 }), C(10, 0, 1.8, 'w', { ns: true, op: 0.85 }), C(8, 8, 1.8, 'w', { ns: true, op: 0.85 })] }, 3: { grow: [1.12, 1.15], addBehind: [{ pts: [[-4, -12], [8, -18], [18, -12, 0.3], [10, -6], [16, 0, 0.3], [8, 4], [14, 12, 0.3], [4, 12], [-4, 6]], f: 'pd' }] } } }),
  vPart({ id: 'flaps', slot: 'feelers', name: 'Ear flaps', tags: ['fins'], dom: 0.45, w: 2, extra: [S([[-2, -10], [8, -16], [16, -10], [12, -2], [4, 0]], 'p', { sw: 2 }), S([[0, -8], [6, -12], [12, -9], [10, -4], [4, -3]], 's', { ns: true, cl: true, op: 0.5 })],
    stages: { 2: { grow: [1.15, 1.2], add: [L('M2,-6 L10,-12 M4,-2 L12,-6', 'a', 1.4, { ns: true, op: 0.6 }), C(16, -10, 1.8, 'a', { ns: true })] }, 3: { grow: [1.12, 1.15], addBehind: [{ pts: [[-4, -12], [10, -22], [22, -12], [16, 0], [4, 2]], f: 'pd' }], add: [C(16, -10, 2.4, 'a', { ns: true }), C(22, -12, 2, 'a', { ns: true })] } } }),
  vPart({ id: 'threads', slot: 'feelers', name: 'Threads', tags: ['thin'], dom: 0.4, w: 2, extra: [L('M0,-2 C10,-6 16,-2 26,-8 M0,0 C10,2 18,-2 28,2 M0,2 C8,8 16,6 24,12', 'pd', 1.6)],
    stages: feelerStages([[26, -8], [28, 2], [24, 12]], [L('M0,-4 C10,-12 18,-10 26,-16', 'pd', 1.6), C(26, -16, 1.8, 'a', { ns: true })]) }),
];
