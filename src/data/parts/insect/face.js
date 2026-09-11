// Insect eyes (compound and otherwise), mandibles and antennae. Antennae draw both the near and the
// far feeler from the crown socket; they sit behind the head.
// Evolutions: eyes ring then glow; mandibles grow teeth, serrations, longer coils and beaks; antennae
// grow accent tips, then extra branches, plumes and bigger clubs.
import { iPart, stick } from './_shared.js';
import { E, C, L, P, S, SH, HL, spline } from '../_dsl.js';
import { evoRing, evoGlow } from '../_evo.js';

function iEyeStages(cx, cy, r) {
  return {
    2: { grow: [1.05, 1.05], add: [evoRing(cx, cy, r * 0.9, 'a', 1.2, { cl: true, op: 0.85 })] },
    3: { grow: [1.05, 1.05], add: [evoGlow(cx, cy, r * 1.4, 0.2), C(cx - r * 0.4, cy - r * 0.45, r * 0.25, 'w', { ns: true, op: 0.9 })] },
  };
}

function iEye({ id, name, shape, sclera = 'e', iris, pupil, glint = [2.2, -1.8, 1.3], glint2 = [-1, 1.8, 0.7], facets, lid, before = [], after = [], dom = 0.5, w = 2, tags = [] }) {
  const prims = [...before, P(shape, sclera, { sw: 2 })];
  if (iris) { prims.push(C(iris[0], iris[1], iris[2], 'el', { ns: true, cl: true, op: 0.6 })); }
  if (pupil) prims.push(Array.isArray(pupil[2]) ? E(pupil[0], pupil[1], pupil[2][0], pupil[2][1], 'k', { ns: true, cl: true }) : C(pupil[0], pupil[1], pupil[2], 'k', { ns: true, cl: true }));
  if (facets) prims.push(L(facets, 'k', 0.9, { op: 0.3, cl: true }));
  if (glint) prims.push(C(glint[0], glint[1], glint[2], 'w', { ns: true }));
  if (glint2) prims.push(C(glint2[0], glint2[1], glint2[2], 'w', { ns: true, op: 0.7 }));
  if (lid) prims.push(L(lid, 'k', 1.8));
  prims.push(...after);
  const [ex, ey, er] = iris || [0.5, 0, 4.5];
  return iPart({ id, slot: 'eyes', name, tags, dom, w, extra: prims, stages: iEyeStages(ex, ey, er) });
}

const I_OVAL = spline([[0, -6.5], [6, -2], [5.4, 5], [0, 6.8], [-5.4, 5], [-6, -2]]);
const HEX = 'M-4,-4 L0,-6 L4,-4 L4,0 L0,2 L-4,0 Z M0,2 L0,6 M4,0 L8,2 M-4,0 L-8,2 M0,-6 L0,-9';

export const I_EYES = [
  iEye({ id: 'compound', name: 'Compound', tags: ['bug'], w: 3, shape: spline([[0, -8], [7, -4], [7.5, 4], [1, 8.5], [-6, 5], [-7, -3]]), facets: HEX, pupil: null, glint: [2.6, -3, 1.6] }),
  iEye({ id: 'round', name: 'Round', tags: ['cute'], w: 3, shape: I_OVAL, sclera: 'w', iris: [0.8, 0.2, 3.8], pupil: [1.2, 0.5, 2], lid: 'M-5,-5 Q0,-8.4 5,-5' }),
  iEye({ id: 'dot', name: 'Dot', tags: ['small'], w: 3, shape: spline([[0, -4.5], [4.2, -1.3], [3.8, 3.2], [0, 4.6], [-3.8, 3.2], [-4.2, -1.3]]), sclera: 'k', pupil: null, glint: [1.6, -1.6, 1.2], glint2: null }),
  iEye({ id: 'fierce', name: 'Fierce', tags: ['angry'], w: 2, shape: spline([[-6.5, -4], [0, -5.5], [6.5, -2], [6.5, 3], [2, 5.5], [-4, 5], [-7, 1]]), pupil: [1.4, 0.9, [1.4, 3.2]], glint: [2.4, -1, 1.1], lid: 'M-7,-5.5 L6.5,-1.5' }),
  iEye({ id: 'wide', name: 'Wide', tags: ['cute'], w: 2, shape: spline([[0, -8], [7.4, -2.6], [6.8, 6], [0, 8.4], [-6.8, 6], [-7.4, -2.6]]), sclera: 'w', iris: [0.8, 0.4, 5], pupil: [1.4, 0.8, 2.8], glint: [2.8, -2.4, 1.7], lid: 'M-6,-6.5 Q0,-10 6,-6.5' }),
  // the ocelli eye gets three small extra eyes on top
  iEye({ id: 'ocelli', name: 'Ocelli', tags: ['many'], w: 1, shape: I_OVAL, facets: HEX, pupil: null, glint: [2.2, -2.2, 1.4], glint2: null, lid: null, after: [C(-5, -9, 1.6, 'e', { sw: 1 }), C(0, -11, 1.6, 'e', { sw: 1 }), C(5, -9, 1.6, 'e', { sw: 1 })] }),
  // glowing eyes get a halo
  iEye({ id: 'glow', name: 'Glowing', tags: ['light'], w: 1, shape: I_OVAL, iris: [0.4, 0, 4.4], pupil: [0.8, 0.2, [1.4, 4.6]], glint: [2.4, -2.4, 1.3], before: [C(0, 0, 9, 'e', { ns: true, op: 0.3 })] }),
];

export const I_MANDIBLES = [
  iPart({ id: 'grin', slot: 'mandibles', name: 'Grin', tags: ['happy'], dom: 0.5, w: 3, extra: [L('M2,-2 C-2,3 -8,4 -14,2', 'k', 1.8)],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-6,3 L-5,6 L-4,3 Z', 'w', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-6,3 L-5,6.6 L-4,3 Z M-11,3 L-10,6.2 L-9,3 Z', 'w', { sw: 1 })] } } }),
  iPart({ id: 'pincers', slot: 'mandibles', name: 'Pincers', tags: ['beetle', 'ant'], dom: 0.55, w: 2, extra: [P('M-2,-6 C6,-8 12,-4 12,2 C10,-1 6,-2 2,-1 Z', 'pd', { sw: 1.6 }), P('M-2,6 C6,8 12,4 12,-2 C10,1 6,2 2,1 Z', 'pd', { sw: 1.6 }), L('M-2,0 L2,0', 'k', 1.6)],
    stages: { 2: { grow: [1.12, 1.12], add: [L('M4,-4 L5,-2 M7,-3 L8,-1 M4,4 L5,2 M7,3 L8,1', 'k', 1, { op: 0.5 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-2,-8 C8,-10 16,-5 16,3 C13,-1 8,-3 2,-2 Z', 'pd', { sw: 1.6 }), P('M-2,8 C8,10 16,5 16,-3 C13,1 8,3 2,2 Z', 'pd', { sw: 1.6 }), L('M4,-5 L5,-3 M8,-4 L9,-2 M12,-2 L13,0 M4,5 L5,3 M8,4 L9,2 M12,2 L13,0', 'k', 1, { op: 0.5 }), C(16, 3, 1.4, 'a', { ns: true }), C(16, -3, 1.4, 'a', { ns: true })] } } }),
  iPart({ id: 'proboscis', slot: 'mandibles', name: 'Proboscis', tags: ['moth'], dom: 0.5, w: 2, extra: [L('M0,0 C6,0 10,4 8,8 C6,11 2,10 3,7 C4,5 6,6 6,7', 'k', 2.6), L('M0,0 C6,0 10,4 8,8 C6,11 2,10 3,7 C4,5 6,6 6,7', 'pd', 1.2)],
    stages: { 2: { grow: [1.12, 1.12], add: [L('M0,0 C8,0 13,5 10,10 C8,13 3,12 4,9 C5,7 7,8 7,9', 'k', 2.6), L('M0,0 C8,0 13,5 10,10 C8,13 3,12 4,9 C5,7 7,8 7,9', 'pd', 1.2)] }, 3: { reset: true, grow: [1.25, 1.25], add: [L('M0,0 C10,0 16,6 12,12 C9,16 3,14 4,10 C5,8 8,9 8,11', 'k', 2.6), L('M0,0 C10,0 16,6 12,12 C9,16 3,14 4,10 C5,8 8,9 8,11', 'pd', 1.2), C(8, 11, 1.6, 'a', { ns: true })] } } }),
  iPart({ id: 'fangs', slot: 'mandibles', name: 'Fangs', tags: ['mantis'], dom: 0.55, w: 2, extra: [L('M2,-2 C-2,3 -8,4 -14,2', 'k', 1.8), P('M-3,2.4 L-1.5,8 L0,2 Z M-10,3.2 L-8.5,8.5 L-7,3.2 Z', 'w', { sw: 1 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-3,2.4 L-1.5,10 L0,2 Z M-10,3.2 L-8.5,10.5 L-7,3.2 Z', 'w', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-3,2.4 L-1.2,12 L0.4,2 Z M-10,3.2 L-8.2,12.5 L-6.6,3.2 Z', 'w', { sw: 1 }), C(-1.2, 12.8, 1, 'a', { ns: true }), C(-8.2, 13.2, 1, 'a', { ns: true })] } } }),
  iPart({ id: 'beak', slot: 'mandibles', name: 'Sucking tube', tags: ['bug'], dom: 0.5, w: 2, extra: [P('M-2,-3 L14,0 L-2,3 Z', 'pd', { sw: 1.6 }), L('M-1,0 L11,0', 'k', 1, { op: 0.4 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M9,-1 L14,0 L9,1 Z', 'a', { ns: true })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-2,-3 L18,0 L-2,3 Z', 'pd', { sw: 1.6 }), L('M-1,0 L15,0', 'k', 1, { op: 0.4 }), P('M12,-1.2 L18,0 L12,1.2 Z', 'a', { ns: true })] } } }),
  iPart({ id: 'smile', slot: 'mandibles', name: 'Smile', tags: ['cute'], dom: 0.5, w: 3, extra: [L('M2,-3 C0,3 -6,5 -12,3', 'k', 1.8), C(-4, -6, 1.2, 'k', { ns: true, op: 0.5 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-8,4.4 L-7,7.4 L-6,4.4 Z', 'w', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-8,4.4 L-7,8 L-6,4.4 Z M-3,2.6 L-2,5.6 L-1,2.4 Z', 'w', { sw: 1 }), C(-11, 0, 1.4, 'a', { ns: true, op: 0.7 })] } } }),
  iPart({ id: 'tiny', slot: 'mandibles', name: 'Tiny', tags: ['small'], dom: 0.4, w: 2, extra: [L('M1,-1 L-3,3 M1,1 L-3,4', 'k', 1.6)],
    stages: { 2: { grow: [1.12, 1.12], add: [L('M1,-1 L-4,4 M1,1 L-4,5', 'k', 1.6)] }, 3: { reset: true, grow: [1.25, 1.25], add: [P('M-3,2 L-7,4 L-3,4 Z M-3,4 L-7,6 L-3,5 Z', 'pd', { ns: true }), C(-7, 5, 1, 'a', { ns: true })] } } }),
];

const antenna = (near, far, w = 2.4) => [...stick(far, w - 0.6, 'pd'), ...stick(near, w)];
/** Shared antenna evolution: accent beads at the tips, then bigger beads and rings. */
const antStages = (near, far, extra3 = []) => ({
  2: { grow: [1.1, 1.2], add: [C(near[0], near[1], 2, 'a', { ns: true }), C(far[0], far[1], 1.7, 'a', { ns: true })] },
  3: { grow: [1.1, 1.1], add: [...extra3, C(near[0], near[1], 2.8, 'a', { ns: true }), C(far[0], far[1], 2.4, 'a', { ns: true }), evoRing(near[0], near[1], 4.6, 'a', 1, { op: 0.6 })] },
});

export const I_ANTENNAE = [
  iPart({ id: 'short', slot: 'antennae', name: 'Short', tags: ['beetle'], dom: 0.5, w: 3, extra: [...antenna('M0,0 C4,-8 8,-12 14,-16', 'M-5,0 C-3,-8 -1,-14 4,-18'), C(15, -17, 2.2, 'p', { sw: 1.4 }), C(5, -19, 2, 'pd', { sw: 1.4 })],
    stages: antStages([15, -17], [5, -19], [...stick('M2,-2 C6,-6 12,-6 18,-8', 1.6), C(18, -8, 1.6, 'a', { ns: true })]) }),
  iPart({ id: 'straight', slot: 'antennae', name: 'Long', tags: ['thin'], dom: 0.5, w: 2, extra: antenna('M0,0 C8,-12 16,-22 30,-30', 'M-5,0 C-2,-14 4,-26 14,-36', 2),
    stages: antStages([30, -30], [14, -36], [L('M10,-14 L14,-10 M18,-22 L22,-18', 'k', 1.2, { op: 0.5 })]) }),
  iPart({ id: 'clubbed', slot: 'antennae', name: 'Clubbed', tags: ['butterfly'], dom: 0.5, w: 2, extra: [...antenna('M0,0 C6,-10 12,-18 22,-24', 'M-5,0 C-3,-12 2,-22 10,-30', 2), E(23, -25, 3.6, 2.4, 'p', { sw: 1.4 }), E(11, -31, 3.2, 2.2, 'pd', { sw: 1.4 })],
    stages: { 2: { grow: [1.1, 1.2], add: [E(23, -25, 4.4, 3, 'p', { sw: 1.4 }), E(11, -31, 4, 2.8, 'pd', { sw: 1.4 }), C(23, -25, 1.4, 'a', { ns: true }), C(11, -31, 1.2, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], add: [E(23, -25, 5.2, 3.6, 'p', { sw: 1.4 }), E(11, -31, 4.6, 3.2, 'pd', { sw: 1.4 }), C(23, -25, 2, 'a', { ns: true }), C(11, -31, 1.8, 'a', { ns: true }), evoRing(23, -25, 7, 'a', 1, { op: 0.6 })] } } }),
  iPart({ id: 'elbowed', slot: 'antennae', name: 'Elbowed', tags: ['ant'], dom: 0.5, w: 2, extra: antenna('M0,0 L8,-12 L24,-10', 'M-5,0 L-2,-16 L12,-18', 2.4),
    stages: antStages([24, -10], [12, -18], [C(8, -12, 1.8, 'a', { ns: true }), C(-2, -16, 1.6, 'a', { ns: true })]) }),
  iPart({ id: 'feathered', slot: 'antennae', name: 'Feathered', tags: ['moth'], dom: 0.55, w: 2, extra: [S([[-4, -2], [-2, -12], [2, -24], [6, -30, 0.3], [10, -22], [10, -12], [6, -2]], 'pd'), L('M-2,-6 L6,-8 M-1,-12 L8,-14 M0,-18 L8,-20 M2,-24 L8,-25', 'k', 1, { op: 0.3 }), S([[2, 0], [6, -10], [12, -22], [18, -28, 0.3], [20, -20], [18, -10], [12, 0]], 'p'), L('M6,-4 L14,-6 M8,-10 L16,-12 M10,-16 L18,-18 M12,-22 L18,-23', 'k', 1, { op: 0.3 })],
    stages: { 2: { grow: [1.1, 1.2], add: [C(18, -28, 2, 'a', { ns: true }), C(6, -30, 1.8, 'a', { ns: true }), L('M6,-4 L14,-6 M8,-10 L16,-12 M10,-16 L18,-18', 'a', 1.2, { ns: true, op: 0.6 })] }, 3: { grow: [1.1, 1.1], addBehind: [{ pts: [[0, 2], [6, -12], [14, -26], [22, -34, 0.3], [26, -22], [24, -10], [16, 2]], f: 'pd' }], add: [C(18, -28, 2.8, 'a', { ns: true }), C(6, -30, 2.4, 'a', { ns: true })] } } }),
  iPart({ id: 'curly', slot: 'antennae', name: 'Curly', tags: ['cute'], dom: 0.45, w: 2, extra: antenna('M0,0 C6,-10 14,-16 18,-10 C20,-6 16,-4 14,-8', 'M-5,0 C-2,-12 4,-20 8,-14 C10,-10 6,-8 4,-12', 2.2),
    stages: antStages([14, -8], [4, -12], [...stick('M2,-2 C10,-8 20,-6 22,0', 1.6), C(22, 0, 1.6, 'a', { ns: true })]) }),
  iPart({ id: 'horn', slot: 'antennae', name: 'Horn', tags: ['rhino'], dom: 0.55, w: 1, shapes: [[[-6, 2], [-2, -10], [4, -22], [12, -30, 'c'], [10, -18], [8, -8], [8, 2]]], extra: [HL('M0,-8 L4,-20 L8,-26 L6,-14 L4,-6 Z', 0.22), L('M-2,-6 L6,-8 M0,-14 L7,-16', 'k', 1, { op: 0.25 })],
    stages: { 2: { grow: [1.1, 1.2], addShapes: [{ pts: [[7, -22], [12, -34, 'c'], [11, -20]], f: 'a' }] }, 3: { grow: [1.1, 1.1], addBehind: [[[-12, 2], [-10, -8], [-6, -18, 'c'], [-2, -8], [-2, 2]]], add: [C(12, -32, 5, 'a', { ns: true, op: 0.25 })] } } }),
];
