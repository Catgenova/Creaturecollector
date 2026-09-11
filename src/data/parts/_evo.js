// Shared helpers for hand-authored evolution art: the stage 2 and 3 variants of parts.
// Everything here returns point lists or prims in a part's own frame, so it composes with
// the DSL and the builders' `stages` deltas (addShapes / addBehind / add / grow).
import { P, L, C, E, PATCH, spline, arcPts, leaf, tube } from './_dsl.js';
import { diamondPath } from './_sigils.js';
import { claws } from './_builders.js';

const evoRad = (a) => (a * Math.PI) / 180;

/**
 * A fan of n spikes around (cx, cy) spanning angles a0..a1 (degrees, SVG orientation:
 * 0 = right, 90 = down), rising from radius rIn to rOut. Closed through the centre so it
 * can sit behind a shape and poke out from under its outline. Options: profile 'mid'
 * (middle spikes longest, default), 'flat', 'end' (last spike longest) or 'start';
 * tip / valley roundness (default 'c' / 0.6); wobble (alternating length variation).
 */
export function evoFan(cx, cy, a0, a1, n, rIn, rOut, o = {}) {
  const tip = o.tip == null ? 'c' : o.tip, valley = o.valley == null ? 0.6 : o.valley, wobble = o.wobble || 0;
  const profile = o.profile || 'mid';
  const step = (a1 - a0) / n;
  const at = (a, r, k) => { const p = [cx + Math.cos(evoRad(a)) * r, cy + Math.sin(evoRad(a)) * r]; if (k != null) p.push(k); return p; };
  const pts = [at(a0, rIn, valley)];
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? i / (n - 1) : 0.5;
    let f = 1;
    if (profile === 'mid') f = 1 - 0.45 * Math.abs(2 * u - 1);
    else if (profile === 'end') f = 0.55 + 0.45 * u;
    else if (profile === 'start') f = 1 - 0.45 * u;
    f *= 1 + wobble * (i % 2 ? 0.5 : -0.5);
    pts.push(at(a0 + step * (i + 0.5), rIn + (rOut - rIn) * f, tip));
    pts.push(at(a0 + step * (i + 1), rIn, valley));
  }
  pts.push([cx, cy, 'c']);
  return pts;
}

/** A single spike from base (x, y), w wide, pointing along angle a (degrees) for len. */
export function evoSpike(x, y, a, len, w, tipK = 'c') {
  const dx = Math.cos(evoRad(a)), dy = Math.sin(evoRad(a));
  const nx = (-dy * w) / 2, ny = (dx * w) / 2;
  return [[x + nx, y + ny, 0.3], [x + dx * len, y + dy * len, tipK], [x - nx, y - ny, 0.3]];
}

/** Ring outline as a stroke-only closed spline (no arc commands, so it scales cleanly). */
export function evoRing(cx, cy, r, f = 'a', w = 1.6, o = {}) {
  return L(spline(arcPts(cx, cy, r, r, 0, 330, 11)), f, w, { ns: true, ...o });
}

/** A faceted gem: accent diamond about 2r tall with a highlight facet. */
export function evoGem(cx, cy, r, f = 'a') {
  return [
    P(diamondPath(cx, cy, r * 1.4, r * 2), f, { sw: 1.4 }),
    P(`M${cx - r * 0.45},${cy - r * 0.2} L${cx},${cy - r * 0.75} L${cx + r * 0.05},${cy - r * 0.25} Z`, 'w', { ns: true, op: 0.6 }),
  ];
}

/** Soft glow disc behind a sigil or gem; clipped to the part unless o.cl is false. */
export function evoGlow(cx, cy, r, op = 0.28, f = 'a', o = {}) { return C(cx, cy, r, f, { ns: true, cl: true, op, ...o }); }

/** Armour bands across a limb, clipped to it: n bands h tall from y, spaced by gap. */
export function evoBands(y, n = 2, h = 3, gap = 8, f = 'a', x0 = -40, x1 = 40) {
  const out = [];
  for (let i = 0; i < n; i++) { const yy = y + i * gap; out.push(PATCH(`M${x0},${yy} L${x1},${yy} L${x1},${yy + h} L${x0},${yy + h} Z`, f)); }
  return out;
}

/**
 * Standard limb evolution. foot = [x0, x1, y] is the claw row along the sole; ankleY is where
 * the stage-3 armour bands start. Stage 2 grows the limb and adds claws, stage 3 grows it again,
 * lengthens the claws and adds the bands. o.hoof = [x, y] (back of the fetlock) swaps the claws
 * for a hoof band and fetlock tufts. o.claws sets the claw count; o.grow2 / o.grow3 the factors.
 */
export function evoLegStages(foot, ankleY, o = {}) {
  const [x0, x1, y] = foot;
  const n = o.claws == null ? 3 : o.claws;
  const g2 = o.grow2 || [1.06, 1.08], g3 = o.grow3 || [1.06, 1.08];
  if (o.hoof) {
    const [hx, hy] = o.hoof;
    return {
      2: { grow: g2, addBehind: [evoFan(hx, hy, 120, 200, 2, 4, 14)], add: [PATCH(`M-30,${y - 9} L30,${y - 9} L30,${y - 6} L-30,${y - 6} Z`, 'a')] },
      3: { grow: g3, addBehind: [evoFan(hx, hy - 6, 110, 210, 3, 4, 18)], add: evoBands(ankleY, 2, 2.6, 6) },
    };
  }
  return {
    2: { grow: g2, add: claws(x0, x1, y, n, 4.5, 'w') },
    3: { reset: true, grow: [g2[0] * g3[0], g2[1] * g3[1]], add: [...evoBands(ankleY, 2, 2.6, 6), ...claws(x0 - 1.5, x1 + 1.5, y, n + 1, 6, 'w')] },
  };
}

// ---- class tells for the final stage ---------------------------------------------
//
// Stage 3 used to give every head the same crown of tufts. Each class now grows its own
// signature: mammals a shaggy ruff, reptiles swept horns and brow plates, birds a train of
// plumes, insects a riveted armour plate, fish bioluminescent dots along the lateral line and
// invertebrates a translucent core with inner motes. Amphibians keep their soft lobes.

/** Mammal: a two-layer fur ruff around the back and top of the skull, for addBehind. */
export function evoRuff(cx, cy, r, n = 8) {
  return [
    { pts: evoFan(cx, cy, 100, 320, n, r * 0.35, r * 1.05, { profile: 'flat', tip: 0.35, wobble: 0.3 }), f: 'pd' },
    { pts: evoFan(cx + 2, cy - 2, 150, 330, Math.max(3, n - 3), r * 0.3, r * 0.78, { profile: 'flat', tip: 0.4, wobble: 0.2 }), f: 'p' },
  ];
}

/** Reptile: a horn swept back and up from (x, y), len long and w wide at the base. Point list for addBehind. */
export function evoHorn(x, y, len, o = {}) {
  const w = o.w || 6, sweep = o.sweep == null ? 1 : o.sweep;
  const centre = [[x, y], [x - len * 0.22 * sweep, y - len * 0.42], [x - len * 0.62 * sweep, y - len * 0.7], [x - len * 0.95 * sweep, y - len * 0.78]];
  return tube(centre, w, w * 0.22, { tipK: 'c' });
}

/** Reptile: a small angular brow scale centred on (x, y) with an accent point. */
export function evoBrowPlate(x, y, s = 4.5, f = 'pd') {
  return [
    P(`M${x - s},${y + s * 0.3} L${x - s * 0.4},${y - s} L${x + s * 0.8},${y - s * 0.8} L${x + s},${y + s * 0.2} Z`, f, { sw: 1.2 }),
    C(x + s * 0.1, y - s * 0.35, s * 0.28, 'a', { ns: true }),
  ];
}

/** Bird: n plumes sweeping back and up from (cx, cy), for addBehind; long and short alternate. */
export function evoPlumes(cx, cy, n = 4, len = 26, a0 = 196, a1 = 262) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / n;
    const l = len * (i % 2 ? 0.72 : 1) * (1 - 0.12 * Math.abs(i - (n - 1) / 2) / n);
    const tip = [cx + Math.cos(evoRad(a)) * l, cy + Math.sin(evoRad(a)) * l];
    out.push({ d: leaf([cx, cy], tip, l * 0.16 * (i % 2 ? -1 : 1)), f: i % 2 ? 'pd' : 'p' });
  }
  return out;
}

/** Bird: accent dots on the tips of the long plumes made by evoPlumes with the same arguments. */
export function evoPlumeTips(cx, cy, n = 4, len = 26, a0 = 196, a1 = 262) {
  const out = [];
  for (let i = 0; i < n; i += 2) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / n;
    const l = len * (1 - 0.12 * Math.abs(i - (n - 1) / 2) / n);
    out.push(C(cx + Math.cos(evoRad(a)) * l * 0.9, cy + Math.sin(evoRad(a)) * l * 0.9, 1.8, 'a', { ns: true }));
  }
  return out;
}

/** Insect: an angular armour plate w wide and h tall standing on (cx, cy), for addBehind. */
export function evoPlate(cx, cy, w, h, f = 'pd') {
  return { pts: [[cx - w / 2, cy], [cx - w * 0.36, cy - h * 0.78, 0.3], [cx - w * 0.1, cy - h, 0.3], [cx + w * 0.16, cy - h * 0.94, 0.3], [cx + w * 0.42, cy - h * 0.58, 0.3], [cx + w / 2, cy]], f };
}

/** Insect: n rivet dots evenly spaced from (x0, y0) to (x1, y1). */
export function evoRivets(x0, y0, x1, y1, n = 4, r = 1.3) {
  return Array.from({ length: n }, (_, i) => { const t = n > 1 ? i / (n - 1) : 0.5; return C(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, 'a', { ns: true }); });
}

/** Fish: bioluminescent dots (a soft accent halo with a bright core) at each point, clipped to the body. */
export function evoLumen(points, r = 2) {
  return points.flatMap(([x, y]) => [C(x, y, r * 2.2, 'a', { ns: true, cl: true, op: 0.28 }), C(x, y, r, 'w', { ns: true, cl: true, op: 0.92 })]);
}

/** Invertebrate: a translucent core (a lighter inner ellipse and a highlight) with three glowing motes, clipped to the body. */
export function evoTranslucent(cx, cy, rx, ry) {
  return [
    E(cx, cy, rx, ry, 'al', { ns: true, cl: true, op: 0.3 }),
    E(cx - rx * 0.3, cy - ry * 0.35, rx * 0.45, ry * 0.4, 'w', { ns: true, cl: true, op: 0.22 }),
    ...evoLumen([[cx - rx * 0.6, cy + ry * 0.5], [cx + rx * 0.5, cy - ry * 0.6], [cx + rx * 0.95, cy + ry * 0.3]], 1.7),
  ];
}
