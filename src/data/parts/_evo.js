// Shared helpers for hand-authored evolution art: the stage 2 and 3 variants of parts.
// Everything here returns point lists or prims in a part's own frame, so it composes with
// the DSL and the builders' `stages` deltas (addShapes / addBehind / add / grow).
import { P, L, C, PATCH, spline, arcPts } from './_dsl.js';
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
