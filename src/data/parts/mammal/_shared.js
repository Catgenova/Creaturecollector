// Shared builders for the mammal library. Every mammal part is authored facing
// right at a common scale: a mid-sized quadruped torso is about 90 wide and 50
// tall, its head about 45 across, its legs about 40 long.
import { P, S, SH, HL, PATCH, spline } from '../_dsl.js';

export const MAMMAL = 'm.';

/** A body part: torso silhouette from points, clip and box derived, shading layered on. */
export function mBody({ id, name, kind = 'mammal.quad', pts, sockets, dom = 0.5, w = 2, tags = [], shade = [], extra = [], hover }) {
  const d = spline(pts);
  const prims = [P(d, 'p'), ...shade, ...extra];
  return { id: `${MAMMAL}body.${id}`, slot: 'body', name, kind, tags, dom, w, clip: [d], hover, prims, sockets };
}

/** Standard belly shadow and back highlight for a torso spanning x0..x1 with belly line at yBelly and spine at ySpine. */
export function torsoShade(x0, x1, ySpine, yBelly, o = {}) {
  const midY = yBelly - (yBelly - ySpine) * (o.shadeFrac == null ? 0.42 : o.shadeFrac);
  const shade = SH(`M${x0 - 10},${midY} C${x0 + (x1 - x0) * 0.3},${midY + 8} ${x0 + (x1 - x0) * 0.7},${midY + 8} ${x1 + 10},${midY - 4} L${x1 + 10},${yBelly + 20} L${x0 - 10},${yBelly + 20} Z`, o.shade == null ? 0.14 : o.shade);
  const hy = ySpine + (yBelly - ySpine) * 0.18;
  const light = HL(`M${x0 + 6},${ySpine - 10} C${x0 + (x1 - x0) * 0.3},${ySpine - 12} ${x1 - 20},${ySpine - 12} ${x1 - 4},${ySpine - 4} L${x1 - 8},${hy} C${x1 - 24},${hy - 6} ${x0 + (x1 - x0) * 0.3},${hy - 4} ${x0 + 6},${hy + 2} Z`, o.light == null ? 0.16 : o.light);
  return [shade, light];
}

/** A leg part. clip = union of its shapes so socks and shading stay inside the silhouette. */
export function mLeg({ id, slot, name, shapes, extra = [], dom = 0.5, w = 2, tags = [], fit }) {
  const clip = shapes.map((s) => (typeof s === 'string' ? s : spline(s)));
  return { id: `${MAMMAL}${slot}.${id}`, slot, name, tags, dom, w, fit, clip, prims: [...clip.map((d) => P(d, 'p')), ...extra] };
}

/** Generic part with a silhouette (first shape) and details. */
export function mPart({ id, slot, name, shapes = [], extra = [], dom = 0.5, w = 2, tags = [], sockets, fit, fitBox, hover }) {
  const clip = shapes.map((s) => (typeof s === 'string' ? s : spline(s)));
  const part = { id: `${MAMMAL}${slot}.${id}`, slot, name, tags, dom, w, prims: [...clip.map((d) => P(d, 'p')), ...extra] };
  if (clip.length) part.clip = clip;
  if (sockets) part.sockets = sockets;
  if (fit) part.fit = fit;
  if (fitBox != null) part.fitBox = fitBox;
  if (hover) part.hover = hover;
  return part;
}

/** Toe lines on a paw: n short dark ticks across x0..x1 at y, pointing down. */
export function toes(x0, x1, y, n = 2, len = 3, op = 0.55) {
  let d = '';
  for (let i = 1; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / (n + 1); d += `M${x},${y - len} L${x},${y} `; }
  return { t: 'line', d: d.trim(), f: 'k', w: 1.6, op };
}

/** A dark "sock" from y down over the leg, clipped to the leg silhouette. */
export function sock(y, role = 'a', x0 = -30, x1 = 30, curve = 3) {
  return PATCH(`M${x0},${y + curve} Q0,${y - curve} ${x1},${y + curve} L${x1},${y + 60} L${x0},${y + 60} Z`, role);
}
export { S, SH, HL, PATCH };
