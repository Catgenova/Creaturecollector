// Fantasy motifs shared by every class library: forehead sigils, sparkles, swirls and
// flame tips. All return SVG path strings in the part's local units, so they can be
// filled with any role (usually the accent 'a', or 'w' for glints).
import { spline, arcPts } from './_dsl.js';

const sigXf = (pts, cx, cy, s, rot = 0) => {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return pts.map((p) => {
    const q = [cx + (p[0] * c - p[1] * sn) * s, cy + (p[0] * sn + p[1] * c) * s];
    if (p.length > 2) q.push(p[2]);
    return q;
  });
};

/** n-pointed star of outer radius r; inner radius as a fraction (default 0.45). Sharp points. */
export function starPath(cx, cy, r, n = 5, inner = 0.45, rot = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180, rr = i % 2 ? r * inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 'c']);
  }
  return spline(pts);
}

/** Four-point sparkle with pinched, concave sides. */
export function sparklePath(cx, cy, r, rot = 0) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = ((rot - 90 + i * 45) * Math.PI) / 180, rr = i % 2 ? r * 0.28 : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, i % 2 ? 1.6 : 'c']);
  }
  return spline(pts, { tension: 0.9 });
}

/** Crescent moon, horns pointing to angle `rot` (degrees, 0 = right, -90 = up). */
export function crescentPath(cx, cy, r, rot = 30) {
  const outer = arcPts(0, 0, r, r, 140, 400, 10, 1).map((p) => [p[0], p[1]]);
  const inner = arcPts(0.5 * r, 0, 0.78 * r, 0.78 * r, 380, 160, 10, 1).map((p) => [p[0], p[1]]);
  outer[0].push('c'); outer[outer.length - 1].push('c');
  return spline(sigXf([...outer, ...inner.slice(1, -1)], cx, cy, 1, rot), { tension: 0.35 });
}

/** Candle-flame teardrop with a bent tip, height about 2s. */
export function flamePath(cx, cy, s, rot = 0) {
  const pts = [[0.12, -1, 'c'], [0.46, -0.42], [0.5, 0.12], [0.26, 0.5], [0, 0.56], [-0.3, 0.5], [-0.5, 0.1], [-0.36, -0.4], [-0.06, -0.58, 0.4]];
  return spline(sigXf(pts, cx, cy, s, rot), { tension: 0.6 });
}

/** Plain teardrop, point up. */
export function dropPath(cx, cy, s, rot = 0) {
  return spline(sigXf([[0, -1, 'c'], [0.5, 0.1], [0.3, 0.6], [0, 0.7], [-0.3, 0.6], [-0.5, 0.1]], cx, cy, s, rot), { tension: 0.6 });
}

/** Diamond (rhombus) w wide, h tall. */
export function diamondPath(cx, cy, w, h) {
  return spline([[cx, cy - h / 2, 'c'], [cx + w / 2, cy, 'c'], [cx, cy + h / 2, 'c'], [cx - w / 2, cy, 'c']]);
}

/** Lightning bolt about 2s tall. */
export function boltPath(cx, cy, s, rot = 0) {
  return spline(sigXf([[0.2, -1, 'c'], [-0.5, 0.1, 'c'], [-0.05, 0.1, 'c'], [-0.3, 1, 'c'], [0.5, -0.15, 'c'], [0.05, -0.15, 'c']], cx, cy, s, rot));
}

/** Heart, point down, about 2s wide. */
export function heartPath(cx, cy, s) {
  return spline(sigXf([[0, -0.35, 'c'], [0.5, -0.9], [1, -0.4], [0.7, 0.3], [0, 0.95, 'c'], [-0.7, 0.3], [-1, -0.4], [-0.5, -0.9]], cx, cy, s), { tension: 0.55 });
}

/** Open spiral stroke of outer radius r, `turns` revolutions, unwinding clockwise from the centre. */
export function spiralPath(cx, cy, r, turns = 1.75, rot = 0, n = 28) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = ((rot + t * turns * 360) * Math.PI) / 180, rr = r * (0.08 + 0.92 * t);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return spline(pts, { closed: false, tension: 0.7 });
}

/** Ring (annulus) outline as a filled shape with a hole: outer r, inner ri. */
export function ringPath(cx, cy, r, ri) {
  const outer = arcPts(cx, cy, r, r, 0, 360, 16).slice(0, -1);
  const inner = arcPts(cx, cy, ri, ri, 360, 0, 16).slice(0, -1);
  return spline(outer) + spline(inner);
}
