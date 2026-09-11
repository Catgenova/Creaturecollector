// Fish details: gills (on the flank behind the eye), crests (top of the head, drawn behind the
// body), barbels (whiskers at the mouth corner), spines (a ring of spikes drawn behind the body,
// authored in the 100 x 60 body frame) and patterns (clipped to the body, same frame).
// Evolutions: gills gain slits, rims and glow; crests grow tips, halos and layered copies;
// barbels grow beads and extra whiskers; spines gain accent tips and a second ring or more
// shards; patterns add elements, then rings, dots and embers.
import { fPart } from './_shared.js';
import { NONE, S, L, C, P, E, SH, HL, spline, tube, xfPts } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';
import { evoRing, evoGem, evoFan } from '../_evo.js';

export const F_GILLS = [
  NONE('gills', 0.3, 'f.'),
  fPart({ id: 'slits', slot: 'gills', name: 'Slits', tags: ['shark'], dom: 0.5, w: 3, extra: [L('M0,-10 C-3,-4 -3,4 0,10 M-5,-9 C-8,-3 -8,3 -5,9 M-10,-7 C-12,-2 -12,2 -10,7', 'k', 1.6, { op: 0.55 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M-15,-5 C-16,-2 -16,2 -15,5', 'k', 1.6, { op: 0.55 })] },
      3: { grow: [1.1, 1.1], add: [L('M0,-10 C-3,-4 -3,4 0,10 M-5,-9 C-8,-3 -8,3 -5,9 M-10,-7 C-12,-2 -12,2 -10,7', 'a', 1.2, { ns: true, op: 0.6 })] },
    } }),
  fPart({ id: 'plate', slot: 'gills', name: 'Gill plate', tags: ['classic'], dom: 0.5, w: 3, extra: [L('M2,-14 C-8,-8 -8,8 2,14', 'k', 2, { op: 0.6 }), L('M5,-12 C-3,-7 -3,7 5,12', 'w', 1.4, { op: 0.35 })],
    stages: {
      2: { grow: [1.1, 1.15], add: [L('M6,-16 C-6,-10 -6,10 6,16', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], add: [L('M0,-18 C-12,-10 -12,10 0,18', 'k', 2, { op: 0.5 }), C(-2, -8, 1.6, 'a', { ns: true }), C(-3, 0, 1.6, 'a', { ns: true }), C(-2, 8, 1.6, 'a', { ns: true })] },
    } }),
  fPart({ id: 'plumes', slot: 'gills', name: 'Plumes', tags: ['frilly'], dom: 0.45, w: 1, extra: [
    S([[0, -6], [-8, -14], [-18, -16, 0.3], [-12, -10], [-16, -4, 0.3], [-6, -4]], 'a'), S([[0, 0], [-8, -4], [-20, -4, 0.3], [-12, 0], [-18, 6, 0.3], [-6, 4]], 'a'), S([[0, 6], [-8, 6], [-18, 12, 0.3], [-10, 10], [-14, 18, 0.3], [-4, 10]], 'a'),
  ], stages: {
      2: { grow: [1.15, 1.2], add: [C(-18, -16, 2, 'w', { ns: true, op: 0.8 }), C(-20, -4, 2, 'w', { ns: true, op: 0.8 }), C(-18, 12, 2, 'w', { ns: true, op: 0.8 })] },
      3: { grow: [1.12, 1.15], addBehind: [{ pts: evoFan(0, 0, 120, 240, 4, 6, 26, { tip: 0.5 }), f: 'pd' }] },
    } }),
  fPart({ id: 'armour', slot: 'gills', name: 'Armour plate', tags: ['hard'], dom: 0.5, w: 2, extra: [P('M4,-16 C-8,-14 -12,-4 -10,6 C-8,12 -2,16 6,14 C0,8 -2,-6 4,-16 Z', 'pd', { sw: 2 }), HL('M2,-12 C-4,-8 -6,0 -4,8 L-1,8 C-3,0 -1,-8 3,-12 Z', 0.2)],
    stages: {
      2: { grow: [1.12, 1.15], add: [L('M0,-12 C-6,-6 -8,2 -6,10', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], add: [P('M8,-20 C-4,-18 -14,-6 -12,8 C-10,14 -4,20 8,18 C0,10 -2,-8 8,-20 Z', 'pd', { sw: 2 }), ...evoGem(-3, -1, 2.6)] },
    } }),
  fPart({ id: 'glow', slot: 'gills', name: 'Light spots', tags: ['light'], dom: 0.45, w: 1, extra: [C(-2, -8, 3.5, 'a', { ns: true, op: 0.4 }), C(-2, -8, 1.8, 'w', { ns: true }), C(-6, 1, 3.5, 'a', { ns: true, op: 0.4 }), C(-6, 1, 1.8, 'w', { ns: true }), C(-2, 10, 3.5, 'a', { ns: true, op: 0.4 }), C(-2, 10, 1.8, 'w', { ns: true })],
    stages: {
      2: { grow: [1.12, 1.15], add: [C(-10, -6, 2.6, 'a', { ns: true, op: 0.4 }), C(-10, -6, 1.3, 'w', { ns: true }), C(-11, 6, 2.6, 'a', { ns: true, op: 0.4 }), C(-11, 6, 1.3, 'w', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [C(-4, 1, 12, 'a', { ns: true, op: 0.2 }), evoRing(-2, -8, 4.5, 'a', 1, { op: 0.6 }), evoRing(-6, 1, 4.5, 'a', 1, { op: 0.6 }), evoRing(-2, 10, 4.5, 'a', 1, { op: 0.6 })] },
    } }),
  fPart({ id: 'ridge', slot: 'gills', name: 'Ridge', tags: ['bumps'], dom: 0.45, w: 2, extra: [S([[2, -14], [-3, -10], [-3, -4], [2, -2]], 'pd', { ns: true }), S([[2, 0], [-3, 2], [-3, 8], [2, 12]], 'pd', { ns: true }), L('M2,-14 C-4,-10 -4,-4 2,-2 M2,0 C-4,2 -4,8 2,12', 'k', 1.2, { op: 0.35 })],
    stages: {
      2: { grow: [1.12, 1.15], add: [S([[-4, -12], [-9, -8], [-9, -2], [-4, 0]], 'pd', { ns: true }), S([[-4, 2], [-9, 4], [-9, 10], [-4, 14]], 'pd', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [C(-1, -8, 1.6, 'a', { ns: true }), C(-1, 6, 1.6, 'a', { ns: true }), C(-7, -5, 1.4, 'a', { ns: true }), C(-7, 8, 1.4, 'a', { ns: true })] },
    } }),
  fPart({ id: 'flap', slot: 'gills', name: 'Gill flap', tags: ['classic'], dom: 0.5, w: 2, extra: [P('M4,-14 C-6,-10 -6,10 4,14 C0,8 0,-8 4,-14 Z', 'p', { sw: 2 }), SH('M4,-14 C-6,-10 -6,10 4,14 L-8,14 L-8,-14 Z', 0.15)],
    stages: {
      2: { grow: [1.12, 1.15], add: [L('M2,-12 C-4,-8 -4,8 2,12', 'a', 1.6, { ns: true, op: 0.7 })] },
      3: { grow: [1.1, 1.1], add: [P('M6,-18 C-8,-14 -8,14 6,18 C2,10 2,-10 6,-18 Z', 'pd', { sw: 2 }), C(-1, 0, 2.2, 'a', { ns: true })] },
    } }),
];

const crownPts = [[-10, 4], [-8, -10, 'c'], [-3, -4], [0, -18, 'c'], [3, -4], [8, -12, 'c'], [10, 4]];
const plumeCrestPts = [[-4, 4], [-2, -10], [-8, -24, 0.2], [-10, -8], [-18, -18, 0.2], [-16, -4], [-24, -6, 0.2], [-16, 4]];
const coronetPts = [[-8, 4], [-8, -6], [-4, -12, 'c'], [0, -6], [4, -14, 'c'], [8, -6], [8, 4]];
const frillCrestPts = [[-6, 4], [-2, -8], [-8, -18, 0.2], [-10, -6], [-18, -14, 0.2], [-16, -2], [-26, -4, 0.2], [-20, 4]];

export const F_CRESTS = [
  NONE('crest', 0.3, 'f.'),
  fPart({ id: 'lure', slot: 'crest', name: 'Lure', tags: ['angler', 'light'], dom: 0.55, w: 2, extra: [L('M0,4 C2,-12 10,-24 22,-28', 'k', 2.6), C(24, -30, 9, 'a', { ns: true, op: 0.3 }), C(24, -30, 5, 'a'), C(22.5, -31.5, 1.8, 'w', { ns: true })],
    stages: {
      2: { grow: [1.1, 1.15], add: [C(24, -30, 13, 'a', { ns: true, op: 0.22 }), C(24, -30, 6.2, 'a'), C(22.2, -31.8, 2.2, 'w', { ns: true })] },
      3: { grow: [1.1, 1.1], add: [evoRing(24, -30, 11, 'a', 1.6, { op: 0.7 }), L('M0,4 C-4,-8 -2,-18 6,-24', 'k', 2.2), C(7, -26, 3.4, 'a'), C(6, -27, 1.2, 'w', { ns: true }), P(sparklePath(34, -40, 4), 'a', { ns: true })] },
    } }),
  fPart({ id: 'crown', slot: 'crest', name: 'Fin crown', tags: ['royal'], dom: 0.5, w: 2, shapes: [crownPts], extra: [L('M-6,2 L-7,-8 M0,2 L0,-14 M6,2 L7,-10', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-9,-6 L-8,-14 L-6,-6 Z M-1,-10 L0,-22 L1,-10 Z M7,-8 L8,-16 L9,-8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(crownPts, { sx: 1.35, sy: 1.35 }), f: 'pd' }], add: [...evoGem(0, -4, 2.6)] },
    } }),
  fPart({ id: 'horn', slot: 'crest', name: 'Horn', tags: ['narwhal'], dom: 0.5, w: 2, shapes: [tube([[0, 4], [4, -10], [10, -24]], 8, 2)], extra: [L('M-2,-2 L4,-4 M0,-8 L6,-10 M2,-14 L8,-16', 'k', 1.1, { op: 0.3 })],
    stages: {
      2: { grow: [1.05, 1.22], add: [L('M-2,-2 L4,-4 M0,-8 L6,-10 M2,-14 L8,-16', 'a', 1.8, { ns: true, cl: true, op: 0.8 })] },
      3: { grow: [1.05, 1.1], addShapes: [tube([[-4, 4], [-6, -6], [-8, -16]], 5, 1.6)], add: [C(11, -26, 2.6, 'a', { ns: true, op: 0.9 }), C(-8, -17, 2, 'a', { ns: true, op: 0.8 })] },
    } }),
  fPart({ id: 'plume', slot: 'crest', name: 'Plume', tags: ['feathery'], dom: 0.45, w: 2, shapes: [plumeCrestPts], extra: [L('M-4,2 L-7,-20 M-6,2 L-16,-14', 'k', 1, { op: 0.3 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-9,-20 L-8,-28 L-6,-20 Z M-19,-16 L-18,-22 L-15,-16 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(plumeCrestPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-6, -4, 2.4)] },
    } }),
  fPart({ id: 'coronet', slot: 'crest', name: 'Coronet', tags: ['seahorse'], dom: 0.5, w: 2, shapes: [coronetPts], extra: [HL('M-4,-8 L0,-4 L2,-10 L4,-4 Z', 0.25)],
    stages: {
      2: { grow: [1.1, 1.25], add: [P('M-5,-8 L-4,-16 L-3,-8 Z M3,-10 L4,-18 L5,-10 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(coronetPts, { sx: 1.35, sy: 1.35 }), f: 'pd' }], add: [...evoGem(0, -3, 2.4)] },
    } }),
  fPart({ id: 'unicorn', slot: 'crest', name: 'Spiral horn', tags: ['unicorn'], dom: 0.5, w: 1, shapes: [tube([[0, 4], [2, -12], [4, -28]], 9, 1)], extra: [L('M-3,-2 L5,-5 M-2,-9 L6,-12 M0,-16 L6,-19 M1,-22 L5,-24', 'k', 1.1, { op: 0.3 }), HL('M0,0 L3,0 L4,-24 L3,-24 Z', 0.22)],
    stages: {
      2: { grow: [1.05, 1.2], add: [L('M-3,-2 L5,-5 M-2,-9 L6,-12 M0,-16 L6,-19 M1,-22 L5,-24', 'a', 1.8, { ns: true, cl: true, op: 0.8 }), P(sparklePath(5, -33, 4.5), 'a', { ns: true })] },
      3: { grow: [1.05, 1.1], add: [evoRing(4, -28, 7, 'a', 1.6, { op: 0.8 }), P(sparklePath(-6, -26, 3, 20), 'a', { ns: true, op: 0.85 }), P(sparklePath(12, -20, 2.6, 40), 'a', { ns: true, op: 0.8 })] },
    } }),
  fPart({ id: 'feathery', slot: 'crest', name: 'Frill', tags: ['fancy'], dom: 0.45, w: 2, shapes: [frillCrestPts], extra: [S([[-4, 2], [-4, -8], [-10, -6], [-14, 0]], 's', { ns: true, cl: true, op: 0.5 })],
    stages: {
      2: { grow: [1.1, 1.2], add: [P('M-9,-14 L-8,-22 L-6,-14 Z M-19,-10 L-18,-17 L-15,-10 Z M-25,-2 L-26,-8 L-22,-3 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(frillCrestPts, { sx: 1.3, sy: 1.3 }), f: 'pd' }], add: [...evoGem(-8, -2, 2.4)] },
    } }),
];

/** Shared barbel evolution: accent beads at the tips, then extra whiskers and bigger beads. */
const barbelStages = (tips, extra3 = []) => ({
  2: { grow: [1.15, 1.2], add: tips.map(([x, y]) => C(x, y, 1.8, 'a', { ns: true })) },
  3: { grow: [1.12, 1.15], add: [...extra3, ...tips.map(([x, y]) => C(x, y, 2.4, 'a', { ns: true }))] },
});

export const F_BARBELS = [
  NONE('barbels', 0.3, 'f.'),
  fPart({ id: 'koi', slot: 'barbels', name: 'Koi whiskers', tags: ['koi'], dom: 0.5, w: 3, extra: [L('M-4,-1 C-2,6 -2,12 -6,16', 'pd', 2), L('M0,0 C6,2 10,8 12,14', 'pd', 2.2), L('M-2,2 C0,8 2,12 2,18', 'pd', 2.2)],
    stages: barbelStages([[-6, 16], [12, 14], [2, 18]], [L('M-6,0 C-8,6 -10,10 -14,12', 'pd', 2), C(-14, 12, 2, 'a', { ns: true })]) }),
  fPart({ id: 'catfish', slot: 'barbels', name: 'Long whiskers', tags: ['catfish'], dom: 0.5, w: 2, extra: [L('M0,0 C10,-2 22,4 30,14 M-2,2 C2,10 4,18 2,26 M-4,1 C-10,8 -14,16 -14,24', 'pd', 2)],
    stages: barbelStages([[30, 14], [2, 26], [-14, 24]], [L('M0,-2 C12,-8 26,-8 36,-2', 'pd', 2), C(36, -2, 2.2, 'a', { ns: true })]) }),
  fPart({ id: 'tiny', slot: 'barbels', name: 'Stubs', tags: ['small'], dom: 0.4, w: 2, extra: [L('M0,0 C3,2 4,5 4,8 M-2,2 C-2,5 -3,7 -4,9', 'pd', 1.8)],
    stages: barbelStages([[4, 8], [-4, 9]], [L('M1,-1 C6,0 9,3 10,6', 'pd', 1.8), C(10, 6, 1.8, 'a', { ns: true })]) }),
  fPart({ id: 'beard', slot: 'barbels', name: 'Beard', tags: ['fringe'], dom: 0.45, w: 2, shapes: [[[4, -2], [6, 4], [4, 12, 'c'], [0, 6], [-2, 14, 'c'], [-6, 6], [-8, 12, 'c'], [-10, 0]]], extra: [],
    stages: {
      2: { grow: [1.15, 1.2], add: [P('M3,8 L4,13 L5,8 Z M-3,10 L-2,15 L-1,10 Z M-9,8 L-8,13 L-7,8 Z', 'a', { ns: true, op: 0.85 })] },
      3: { grow: [1.1, 1.15], addBehind: [{ pts: [[6, -2], [8, 4], [6, 16, 'c'], [1, 8], [-2, 19, 'c'], [-7, 8], [-10, 16, 'c'], [-13, 0]], f: 'pd' }], add: [...evoGem(-2, 3, 2.2)] },
    } }),
  fPart({ id: 'tentacles', slot: 'barbels', name: 'Feelers', tags: ['curly'], dom: 0.45, w: 1, extra: [L('M0,0 C8,4 8,12 2,14 C-2,15 -2,10 2,9 M-3,2 C-6,10 -12,12 -14,8', 'pd', 2.2)],
    stages: barbelStages([[2, 9], [-14, 8]], [L('M1,-2 C12,-4 16,6 12,10', 'pd', 2), C(12, 10, 2.2, 'a', { ns: true })]) }),
  fPart({ id: 'curly', slot: 'barbels', name: 'Curly', tags: ['curly'], dom: 0.45, w: 2, extra: [L('M0,0 C10,0 14,8 8,12 C4,14 2,8 6,7 M-3,2 C-8,4 -10,10 -6,12', 'pd', 2)],
    stages: barbelStages([[6, 7], [-6, 12]], [L('M-1,-2 C-8,-6 -14,-2 -12,4', 'pd', 2), C(-12, 4, 2, 'a', { ns: true })]) }),
  fPart({ id: 'spiky', slot: 'barbels', name: 'Chin spikes', tags: ['spiky'], dom: 0.45, w: 1, extra: [P('M0,-1 L10,4 L2,3 Z M-2,1 L4,12 L-2,5 Z M-5,1 L-6,12 L-8,4 Z', 'pd', { sw: 1 })],
    stages: barbelStages([[10, 4], [4, 12], [-6, 12]], [P('M-8,0 L-16,8 L-10,2 Z M-1,-3 L12,-4 L2,0 Z', 'pd', { sw: 1 }), C(-16, 8, 2, 'a', { ns: true })]) }),
];

/** A ring of spikes around the 100 x 60 body frame: n spikes reaching `out` beyond the ellipse. */
function spikeRing(n, out, inset = 0.92, tip = 'c', rot = 0, half = false) {
  const pts = [];
  const count = half ? Math.ceil(n / 2) + 1 : n;
  for (let i = 0; i < count; i++) {
    const a0 = ((i / n) * 360 + rot + (half ? 180 : 0)) * (Math.PI / 180), a1 = (((i + 0.5) / n) * 360 + rot + (half ? 180 : 0)) * (Math.PI / 180);
    pts.push([Math.cos(a0) * 50 * out, Math.sin(a0) * 30 * out, tip]);
    pts.push([Math.cos(a1) * 50 * inset, Math.sin(a1) * 30 * inset, 0.6]);
  }
  if (half) pts.push([50 * inset, 8], [-50 * inset, 8]);
  return pts;
}

export const F_SPINES = [
  NONE('spines', 0.3, 'f.'),
  fPart({ id: 'puffer', slot: 'spines', name: 'Puffer spikes', tags: ['puffer'], dom: 0.55, w: 2, shapes: [spikeRing(16, 1.3)], extra: [],
    stages: {
      2: { grow: [1.06, 1.06], add: spikeRing(16, 1.3).filter((_, i) => i % 2 === 0).map(([x, y]) => C(x, y, 1.6, 'a', { ns: true })) },
      3: { grow: [1.06, 1.06], addBehind: [{ pts: spikeRing(16, 1.52, 0.96, 'c', 11), f: 'pd' }] },
    } }),
  fPart({ id: 'armour', slot: 'spines', name: 'Back plates', tags: ['armour'], dom: 0.5, w: 2, extra: [P('M-30,-24 L-26,-38 L-16,-35 L-14,-24 Z', 'pd'), P('M-10,-27 L-4,-42 L8,-38 L10,-27 Z', 'pd'), P('M14,-25 L22,-38 L32,-33 L32,-24 Z', 'pd'), HL('M-26,-26 L-24,-35 L-18,-33 Z M-6,-29 L-2,-39 L4,-36 Z', 0.25)],
    stages: {
      2: { grow: [1.06, 1.1], add: [P('M36,-20 L44,-30 L52,-24 L50,-16 Z', 'pd'), P('M-46,-14 L-44,-26 L-34,-24 L-32,-14 Z', 'pd')] },
      3: { grow: [1.06, 1.1], add: [P('M-26,-38 L-16,-35 L-18,-31 L-26,-34 Z', 'a', { ns: true, op: 0.8 }), P('M-4,-42 L8,-38 L6,-34 L-4,-38 Z', 'a', { ns: true, op: 0.8 }), P('M22,-38 L32,-33 L30,-29 L22,-34 Z', 'a', { ns: true, op: 0.8 })] },
    } }),
  fPart({ id: 'ridge', slot: 'spines', name: 'Spine ridge', tags: ['spines'], dom: 0.5, w: 2, shapes: [spikeRing(18, 1.25, 0.92, 'c', 0, true)], extra: [],
    stages: {
      2: { grow: [1.06, 1.08], add: spikeRing(18, 1.25, 0.92, 'c', 0, true).filter((p, i) => i % 2 === 0 && p[2] === 'c').map(([x, y]) => C(x, y, 1.6, 'a', { ns: true })) },
      3: { grow: [1.06, 1.08], addBehind: [{ pts: spikeRing(18, 1.48, 0.96, 'c', 10, true), f: 'pd' }] },
    } }),
  fPart({ id: 'side', slot: 'spines', name: 'Side spikes', tags: ['spines'], dom: 0.45, w: 2, extra: [P('M-46,-8 L-72,0 L-46,8 Z', 'pd'), P('M46,-8 L72,0 L46,8 Z', 'pd'), P('M-30,-30 L-44,-46 L-22,-34 Z M30,-30 L44,-46 L22,-34 Z', 'pd')],
    stages: {
      2: { grow: [1.08, 1.08], add: [C(-72, 0, 2.2, 'a', { ns: true }), C(72, 0, 2.2, 'a', { ns: true }), C(-44, -46, 2, 'a', { ns: true }), C(44, -46, 2, 'a', { ns: true })] },
      3: { grow: [1.08, 1.08], add: [P('M-30,30 L-44,46 L-22,34 Z M30,30 L44,46 L22,34 Z', 'pd'), P('M-4,-32 L0,-52 L4,-32 Z', 'pd'), C(0, -52, 2.2, 'a', { ns: true })] },
    } }),
  fPart({ id: 'bumps', slot: 'spines', name: 'Bumps', tags: ['warty'], dom: 0.45, w: 2, shapes: [spikeRing(14, 1.14, 0.96, 0.9)], extra: [],
    stages: {
      2: { grow: [1.06, 1.08] },
      3: { grow: [1.06, 1.08], add: spikeRing(14, 1.14, 0.96, 0.9).filter((_, i) => i % 2 === 0).map(([x, y]) => C(x * 0.97, y * 0.97, 2, 'a', { ns: true, op: 0.85 })) },
    } }),
  fPart({ id: 'thorns', slot: 'spines', name: 'Thorns', tags: ['spines'], dom: 0.5, w: 1, extra: [P('M-20,-28 C-24,-40 -30,-46 -40,-50 C-30,-42 -26,-34 -24,-24 Z', 'pd'), P('M6,-30 C4,-44 0,-52 -8,-58 C0,-48 2,-38 2,-28 Z', 'pd'), P('M30,-24 C32,-36 30,-44 24,-50 C32,-42 34,-34 34,-22 Z', 'pd'), P('M-10,28 C-14,40 -20,46 -30,50 C-20,42 -16,34 -14,24 Z', 'pd'), P('M20,26 C22,38 20,46 14,52 C22,44 24,36 24,24 Z', 'pd')],
    stages: {
      2: { grow: [1.08, 1.1], add: [C(-40, -50, 2, 'a', { ns: true }), C(-8, -58, 2, 'a', { ns: true }), C(24, -50, 2, 'a', { ns: true }), C(-30, 50, 2, 'a', { ns: true }), C(14, 52, 2, 'a', { ns: true })] },
      3: { grow: [1.06, 1.08], add: [P('M-38,-14 C-46,-22 -54,-26 -64,-26 C-54,-20 -48,-16 -42,-8 Z', 'pd'), P('M40,-12 C48,-20 56,-22 66,-22 C56,-16 50,-12 44,-6 Z', 'pd'), P('M-36,16 C-46,20 -54,22 -64,20 C-54,16 -48,12 -40,8 Z', 'pd'), C(-64, -26, 2, 'a', { ns: true }), C(66, -22, 2, 'a', { ns: true }), C(-64, 20, 2, 'a', { ns: true })] },
    } }),
  fPart({ id: 'frills', slot: 'spines', name: 'Frills', tags: ['fancy'], dom: 0.45, w: 1, shapes: [spikeRing(12, 1.28, 0.9, 0.5)], extra: [S(spikeRing(12, 1.14, 0.9, 0.5), 's', { ns: true, op: 0.45 })],
    stages: {
      2: { grow: [1.06, 1.08], add: spikeRing(12, 1.28, 0.9, 0.5).filter((_, i) => i % 2 === 0).map(([x, y]) => C(x, y, 2, 'a', { ns: true, op: 0.85 })) },
      3: { grow: [1.06, 1.08], addBehind: [{ pts: spikeRing(12, 1.5, 0.95, 0.5, 15), f: 'pd' }] },
    } }),
];

export const F_PATTERNS = [
  NONE('pattern', 0.3, 'f.'),
  fPart({ id: 'stripes', slot: 'pattern', name: 'Claw stripes', tags: ['striped'], dom: 0.5, w: 3, extra: [S([[-34, -40], [-16, -40], [-20, -16], [-28, -2, 'c'], [-22, 6], [-32, 22, 'c'], [-32, 4], [-38, -16]], 'a', { ns: true }), S([[-8, -40], [10, -40], [6, -16], [-2, -2, 'c'], [4, 6], [-6, 22, 'c'], [-6, 4], [-12, -16]], 'a', { ns: true }), S([[18, -40], [36, -40], [32, -16], [24, -2, 'c'], [30, 6], [20, 22, 'c'], [20, 4], [14, -16]], 'a', { ns: true })],
    stages: {
      2: { add: [S([[42, -40], [54, -40], [52, -18], [46, -6, 'c'], [50, 2], [42, 12, 'c'], [40, -4], [38, -18]], 'a', { ns: true })] },
      3: { add: [S([[-56, -40], [-46, -40], [-48, -20], [-54, -8, 'c'], [-50, -2], [-56, 6, 'c'], [-58, -6], [-60, -20]], 'a', { ns: true }), C(-22, 18, 2.4, 'a', { ns: true }), C(4, 20, 2.4, 'a', { ns: true }), C(30, 18, 2.4, 'a', { ns: true })] },
    } }),
  fPart({ id: 'belly', slot: 'pattern', name: 'Light belly', tags: ['soft'], dom: 0.5, w: 3, extra: [S([[-54, 12], [-30, 6], [0, 4], [30, 6], [54, 12], [54, 40], [-54, 40]], 's', { ns: true })],
    stages: {
      2: { add: [L('M-50,10 C-26,4 26,4 50,10', 'a', 2.2, { ns: true, op: 0.6 })] },
      3: { add: [L('M-40,22 L40,22 M-42,30 L42,30', 'k', 1.2, { ns: true, op: 0.18 }), C(-24, 16, 1.6, 'w', { ns: true, op: 0.5 }), C(0, 14, 1.6, 'w', { ns: true, op: 0.5 }), C(24, 16, 1.6, 'w', { ns: true, op: 0.5 })] },
    } }),
  fPart({ id: 'spots', slot: 'pattern', name: 'Ringed spots', tags: ['spotted'], dom: 0.45, w: 2, extra: [...[[-30, -14, 6], [-10, -22, 5.5], [10, -16, 6], [30, -14, 5], [-20, 2, 5], [2, 4, 5.5], [24, 6, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })])],
    stages: {
      2: { add: [[-42, 8, 4.5], [40, -26, 4.5], [-4, 16, 4.5]].flatMap(([x, y, r]) => [E(x, y, r * 1.1, r * 0.9, 'a', { ns: true }), C(x + 0.5, y + 0.4, r * 0.48, 's', { ns: true, op: 0.9 })]) },
      3: { add: [evoRing(-10, -22, 8.5, 'a', 1.6), evoRing(10, -16, 9, 'a', 1.6), evoRing(2, 4, 8.5, 'a', 1.6)] },
    } }),
  fPart({ id: 'koi', slot: 'pattern', name: 'Koi patches', tags: ['koi'], dom: 0.5, w: 2, extra: [S([[-40, -30], [-16, -34], [-6, -14], [-20, -2], [-44, -8]], 'a', { ns: true }), S([[10, -30], [34, -34], [44, -16], [30, -2], [12, -6]], 'a', { ns: true }), S([[-10, 6], [8, 4], [12, 18], [-2, 24], [-14, 14]], 'k', { ns: true, op: 0.55 })],
    stages: {
      2: { add: [S([[-42, 6], [-26, 2], [-20, 14], [-30, 22], [-46, 16]], 'a', { ns: true }), S([[26, 8], [42, 4], [48, 16], [38, 24], [24, 18]], 'k', { ns: true, op: 0.5 })] },
      3: { add: [C(-26, -18, 3, 'w', { ns: true, op: 0.55 }), C(24, -18, 3, 'w', { ns: true, op: 0.55 }), C(-2, 14, 2.6, 'w', { ns: true, op: 0.55 }), C(36, 14, 2.4, 'w', { ns: true, op: 0.5 })] },
    } }),
  fPart({ id: 'gradient', slot: 'pattern', name: 'Jagged back', tags: ['gradient'], dom: 0.5, w: 2, extra: [S([[-52, -40], [52, -40], [54, -14], [44, -2, 'c'], [34, -12], [24, 2, 'c'], [14, -10], [4, 4, 'c'], [-6, -10], [-16, 2, 'c'], [-26, -12], [-36, 0, 'c'], [-54, -14]], 'a', { ns: true, spline: { tension: 0.45 } }), S([[-44, -40], [44, -40], [44, -26], [20, -16], [-8, -14], [-30, -16], [-46, -26]], 'k', { ns: true, op: 0.12 })],
    stages: {
      2: { add: [S([[38, -6], [44, 12, 'c'], [48, -4]], 'a', { ns: true }), S([[-2, -4], [2, 16, 'c'], [8, -2]], 'a', { ns: true }), S([[-40, -6], [-38, 12, 'c'], [-32, -4]], 'a', { ns: true })] },
      3: { add: [C(30, -20, 2.4, 'w', { ns: true, op: 0.6 }), C(-10, -24, 2, 'w', { ns: true, op: 0.55 }), C(10, -14, 1.8, 'w', { ns: true, op: 0.55 }), C(-30, -22, 2.2, 'w', { ns: true, op: 0.6 })] },
    } }),
  fPart({ id: 'glow', slot: 'pattern', name: 'Light dots', tags: ['light'], dom: 0.45, w: 1, extra: [...[[-34, -6], [-20, -14], [-4, -8], [12, -14], [28, -6], [-26, 8], [-8, 10], [10, 6], [26, 10]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4.5, f: 'a', ns: true, op: 0.35 }, { t: 'circle', cx: x, cy: y, r: 2, f: 'w', ns: true }])],
    stages: {
      2: { add: [[-44, 2], [40, -18], [-16, 22], [20, 20]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4, f: 'a', ns: true, op: 0.35 }, { t: 'circle', cx: x, cy: y, r: 1.8, f: 'w', ns: true }]) },
      3: { add: [L('M-34,-6 L-20,-14 L-4,-8 L12,-14 L28,-6 M-26,8 L-8,10 L10,6 L26,10', 'a', 1.2, { ns: true, op: 0.5 }), ...[[-20, -14], [12, -14], [-8, 10]].map(([x, y]) => evoRing(x, y, 6.5, 'a', 1, { op: 0.6 }))] },
    } }),
  fPart({ id: 'scales', slot: 'pattern', name: 'Scales', tags: ['texture'], dom: 0.45, w: 2, extra: [L(Array.from({ length: 6 }, (_, r) => Array.from({ length: 9 }, (_, c) => { const x = -48 + c * 12 + (r % 2 ? 6 : 0), y = -30 + r * 10; return `M${x - 5},${y} Q${x},${y + 7} ${x + 5},${y}`; }).join(' ')).join(' '), 'k', 1.1, { op: 0.22 })],
    stages: {
      2: { add: [L(Array.from({ length: 9 }, (_, c) => { const x = -48 + c * 12; return `M${x - 5},-40 Q${x},-33 ${x + 5},-40`; }).join(' '), 'a', 1.4, { ns: true, op: 0.6 })] },
      3: { add: [...[[-30, -20], [-6, -20], [18, -20], [42, -20], [-18, 0], [6, 0], [30, 0]].map(([x, y]) => C(x, y, 1.6, 'a', { ns: true, op: 0.7 }))] },
    } }),
];
