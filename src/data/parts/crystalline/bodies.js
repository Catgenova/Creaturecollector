// Crystalline bodies (faceted geodes). Origin = centre. Every corner is sharp. Sockets: head (front, up), tail
// (back), shoulder / shoulderFar and hip / hipFar on the belly line, spines (the top of the back).
// kinds: 'crystal.boulder', 'crystal.shard', 'crystal.geode', 'crystal.cluster', 'crystal.slab', 'crystal.prism', 'crystal.pebble'.
// Evolutions: stage 2 grows and sprouts crystal spurs from the back; stage 3 grows more, adds spurs and a core glow.
import { crBody, torsoShade } from './_shared.js';
import { L, HL, P, C } from '../_dsl.js';
import { evoSpike } from '../_evo.js';

const crBodyStages = (x2, y2, x3, y3) => ({
  2: { grow: [1.06, 1.06], addBehind: [{ pts: evoSpike(x2, y2, -100, 12, 6, 'c'), f: 'pd' }, { pts: evoSpike(x2 - 10, y2 + 2, -115, 9, 5, 'c'), f: 'pd' }] },
  3: { grow: [1.06, 1.07], addBehind: [{ pts: evoSpike(x3, y3, -95, 16, 7, 'c'), f: 'pd' }, { pts: evoSpike(x3 - 12, y3 + 2, -115, 12, 6, 'c'), f: 'pd' }, { pts: evoSpike(x3 + 10, y3 + 2, -80, 11, 5, 'c'), f: 'pd' }], add: [C(2, 0, 4, 'a', { ns: true, op: 0.5 })] },
});
const crSockets = (o) => ({ head: { x: 24, y: -12, a: -10, s: 1 }, tail: { x: -30, y: 0, a: 0, s: 1 }, shoulder: { x: 18, y: 10, a: 0 }, shoulderFar: { x: 10, y: 8, a: 0 }, hip: { x: -18, y: 10, a: 0 }, hipFar: { x: -24, y: 8, a: 0 }, spines: { x: -4, y: -16, a: 0, s: 1 }, ...o });
/** Facet edges: thin dark lines across the stone. */
const crFacets = (d) => L(d, 'k', 1, { op: 0.22 });
/** A bright facet: a pale clipped triangle up on the left. */
const crShine = (d) => HL(d, 0.22);

export const CR_BODIES = [
  crBody({
    id: 'boulder', name: 'Boulder', kind: 'crystal.boulder', tags: ['chunky'], dom: 0.5, w: 3,
    pts: [[-28, -2, 'c'], [-20, -16, 'c'], [-2, -20, 'c'], [16, -16, 'c'], [28, -6, 'c'], [30, 6, 'c'], [20, 16, 'c'], [-4, 18, 'c'], [-22, 14, 'c'], [-32, 6, 'c']],
    shade: torsoShade(-32, 30, -20, 18, { shadeFrac: 0.3 }),
    extra: [crFacets('M-20,-16 L-6,-2 L16,-16 M-6,-2 L-4,18 M-6,-2 L-28,-2 M-6,-2 L28,-6'), crShine('M-20,-16 L-2,-20 L-6,-2 Z')],
    sockets: crSockets({}), stages: crBodyStages(8, -18, -14, -16),
  }),
  crBody({
    id: 'shard', name: 'Shard', kind: 'crystal.shard', tags: ['long'], dom: 0.5, w: 2,
    pts: [[-34, 2, 'c'], [-24, -12, 'c'], [-4, -16, 'c'], [18, -14, 'c'], [34, -4, 'c'], [30, 8, 'c'], [12, 14, 'c'], [-10, 14, 'c'], [-28, 12, 'c']],
    shade: torsoShade(-34, 34, -16, 14, { shadeFrac: 0.3 }),
    extra: [crFacets('M-24,-12 L-8,0 L18,-14 M-8,0 L-10,14 M-8,0 L34,-4 M-8,0 L-34,2'), crShine('M-24,-12 L-4,-16 L-8,0 Z')],
    sockets: crSockets({ head: { x: 28, y: -10, a: -12, s: 1 }, tail: { x: -34, y: 2, a: 0, s: 1 }, shoulder: { x: 20, y: 8, a: 0 }, shoulderFar: { x: 12, y: 6, a: 0 }, hip: { x: -18, y: 8, a: 0 }, hipFar: { x: -26, y: 6, a: 0 }, spines: { x: -6, y: -14, a: 0, s: 1 } }),
    stages: crBodyStages(6, -15, -16, -13),
  }),
  crBody({
    id: 'geode', name: 'Geode', kind: 'crystal.geode', tags: ['hollow'], dom: 0.5, w: 2,
    pts: [[-26, -4, 'c'], [-18, -16, 'c'], [0, -20, 'c'], [18, -16, 'c'], [28, -4, 'c'], [26, 10, 'c'], [12, 18, 'c'], [-8, 18, 'c'], [-24, 12, 'c']],
    shade: torsoShade(-26, 28, -20, 18, { shadeFrac: 0.3 }),
    extra: [P('M-10,-6 L4,-10 L14,0 L8,10 L-6,10 L-14,2 Z', 'k', { ns: true, cl: true, op: 0.4 }), P('M-8,0 L-4,-8 L0,-2 Z M0,2 L6,-6 L10,2 Z M-4,8 L0,0 L4,8 Z', 'a', { ns: true, cl: true, op: 0.9 }), crFacets('M-18,-16 L-10,-6 M18,-16 L14,0 M-24,12 L-14,2'), crShine('M-18,-16 L0,-20 L-8,-8 Z')],
    sockets: crSockets({ head: { x: 22, y: -12, a: -10, s: 1 }, tail: { x: -26, y: 2, a: 0, s: 1 }, spines: { x: -2, y: -18, a: 0, s: 1 } }),
    stages: crBodyStages(6, -18, -12, -16),
  }),
  crBody({
    id: 'cluster', name: 'Cluster', kind: 'crystal.cluster', tags: ['spiky'], dom: 0.5, w: 2,
    pts: [[-26, 0, 'c'], [-22, -12, 'c'], [-12, -10, 'c'], [-6, -22, 'c'], [4, -14, 'c'], [14, -20, 'c'], [20, -8, 'c'], [30, -4, 'c'], [28, 8, 'c'], [16, 16, 'c'], [-4, 16, 'c'], [-20, 14, 'c'], [-30, 8, 'c']],
    shade: torsoShade(-30, 30, -22, 16, { shadeFrac: 0.3 }),
    extra: [crFacets('M-12,-10 L-6,0 L4,-14 M-6,0 L20,-8 M-6,0 L-4,16 M-6,0 L-26,0 M14,-20 L12,-6'), crShine('M-22,-12 L-12,-10 L-8,-2 L-20,0 Z')],
    sockets: crSockets({ head: { x: 24, y: -10, a: -10, s: 1 }, tail: { x: -28, y: 2, a: 0, s: 1 }, spines: { x: -8, y: -16, a: 0, s: 1 } }),
    stages: crBodyStages(6, -14, -16, -10),
  }),
  crBody({
    id: 'slab', name: 'Slab', kind: 'crystal.slab', tags: ['flat'], dom: 0.5, w: 2,
    pts: [[-34, -2, 'c'], [-30, -10, 'c'], [-8, -12, 'c'], [20, -12, 'c'], [36, -6, 'c'], [36, 6, 'c'], [24, 12, 'c'], [-10, 12, 'c'], [-34, 8, 'c']],
    shade: torsoShade(-34, 36, -12, 12, { shadeFrac: 0.3 }),
    extra: [crFacets('M-30,-10 L-12,0 L20,-12 M-12,0 L-10,12 M-12,0 L36,-6 M-12,0 L-34,-2'), crShine('M-30,-10 L-8,-12 L-12,0 Z')],
    sockets: crSockets({ head: { x: 30, y: -8, a: -12, s: 1 }, tail: { x: -34, y: 2, a: 0, s: 1 }, shoulder: { x: 22, y: 8, a: 0 }, shoulderFar: { x: 14, y: 6, a: 0 }, hip: { x: -20, y: 8, a: 0 }, hipFar: { x: -28, y: 6, a: 0 }, spines: { x: -4, y: -12, a: 0, s: 1 } }),
    stages: crBodyStages(4, -12, -14, -10),
  }),
  crBody({
    id: 'prism', name: 'Prism', kind: 'crystal.prism', tags: ['tall'], dom: 0.5, w: 2,
    pts: [[-18, -4, 'c'], [-12, -24, 'c'], [4, -28, 'c'], [18, -22, 'c'], [24, -4, 'c'], [22, 12, 'c'], [10, 20, 'c'], [-8, 20, 'c'], [-22, 12, 'c']],
    shade: torsoShade(-22, 24, -28, 20, { shadeFrac: 0.3 }),
    extra: [crFacets('M-12,-24 L-2,-8 L18,-22 M-2,-8 L-4,20 M-2,-8 L-18,-4 M-2,-8 L24,-4'), crShine('M-12,-24 L4,-28 L-2,-8 Z')],
    sockets: crSockets({ head: { x: 20, y: -18, a: -8, s: 1 }, tail: { x: -20, y: 6, a: 0, s: 1 }, shoulder: { x: 14, y: 14, a: 0 }, shoulderFar: { x: 6, y: 12, a: 0 }, hip: { x: -12, y: 14, a: 0 }, hipFar: { x: -18, y: 12, a: 0 }, spines: { x: 0, y: -26, a: 0, s: 1 } }),
    stages: crBodyStages(6, -26, -10, -24),
  }),
  crBody({
    id: 'pebble', name: 'Pebble', kind: 'crystal.pebble', tags: ['small', 'round'], dom: 0.45, w: 2,
    pts: [[-18, -2, 0.6], [-12, -12, 0.6], [0, -15, 0.6], [12, -12, 0.6], [19, -3, 0.6], [16, 8, 0.6], [6, 13, 0.6], [-8, 13, 0.6], [-18, 8, 0.6]],
    shade: torsoShade(-18, 19, -15, 13, { shadeFrac: 0.3 }),
    extra: [crFacets('M-12,-12 L-4,-2 L12,-12 M-4,-2 L-6,13 M-4,-2 L19,-3'), crShine('M-12,-12 L0,-15 L-4,-2 Z')],
    sockets: crSockets({ head: { x: 16, y: -8, a: -12, s: 1 }, tail: { x: -18, y: 2, a: 0, s: 1 }, shoulder: { x: 12, y: 8, a: 0 }, shoulderFar: { x: 6, y: 6, a: 0 }, hip: { x: -10, y: 8, a: 0 }, hipFar: { x: -16, y: 6, a: 0 }, spines: { x: -2, y: -14, a: 0, s: 0.9 } }),
    stages: crBodyStages(4, -13, -8, -11),
  }),
];
