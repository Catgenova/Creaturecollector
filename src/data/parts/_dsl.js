// Drawing DSL for creature parts.
//
// Every part is authored facing RIGHT in a local coordinate system whose origin
// (0,0) is the point that attaches to the parent's socket. Units are the same as
// the 200x230 creature canvas at scale 1. y grows downward, as in SVG.
//
// Fill roles (resolved to CSS variables at render time, remapped per slot by paint genes):
//   p / pd / pl   primary colour, its shade, its highlight
//   s / sd / sl   secondary colour family
//   a / ad / al   accent colour family
//   w / wd        white and its shade         e / ed   eye colour and its shade
//   k             outline/dark                none     no fill (stroke only)
//
// Prim options: op (opacity), ns (no outline stroke), sw (outline stroke width
// override), cl (clip this prim to the part's own silhouette: the part's `clip`
// paths, or its first prim when it has none).

export const P = (d, f = 'p', o = {}) => ({ t: 'path', d, f, ...o });
export const E = (cx, cy, rx, ry, f = 'p', o = {}) => ({ t: 'ellipse', cx, cy, rx, ry, f, ...o });
export const C = (cx, cy, r, f = 'p', o = {}) => ({ t: 'circle', cx, cy, r, f, ...o });
/** Stroke-only path. f is the stroke role, w the stroke width. */
export const L = (d, f = 'k', w = 3, o = {}) => ({ t: 'line', d, f, w, ...o });

/** Shadow: translucent outline-colour wash, clipped to the part. Keeps its hue on any recolour. */
export const SH = (d, op = 0.16, o = {}) => ({ t: 'path', d, f: 'k', ns: true, cl: true, op, ...o });
/** Highlight: translucent white, clipped to the part. */
export const HL = (d, op = 0.22, o = {}) => ({ t: 'path', d, f: 'w', ns: true, cl: true, op, ...o });
/** A colour patch (belly, muzzle, socks) drawn without an outline and clipped to the part. */
export const PATCH = (d, f = 's', o = {}) => ({ t: 'path', d, f, ns: true, cl: true, ...o });

/** Convenience for a "none" part in an optional slot. prefix namespaces the id per rig ("m." for mammals). */
export const NONE = (slot, dom = 0.35, prefix = '') => ({ id: `${prefix}${slot}.none`, slot, name: 'None', none: true, dom, w: 1 });

// ---- curves -------------------------------------------------------------------

const fmt = (v) => {
  const r = Math.round(v * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
};

/**
 * Smooth curve through points, as an SVG path string.
 * Each point is [x, y], [x, y, 'c'] for a sharp corner, or [x, y, k] where k
 * scales the roundness at that point (0 = corner, 1 = normal, 1.5 = fuller).
 * Catmull-Rom converted to cubic Beziers; opts.tension (default 0.5) sets the
 * overall roundness and opts.closed (default true) closes the loop.
 */
export function spline(pts, opts = {}) {
  const closed = opts.closed !== false;
  const k = (opts.tension == null ? 0.5 : opts.tension) / 3;
  const n = pts.length;
  if (n < 2) return '';
  const at = (i) => {
    if (closed) return pts[((i % n) + n) % n];
    return pts[Math.max(0, Math.min(n - 1, i))];
  };
  const smooth = (p) => (p[2] === 'c' ? 0 : p[2] == null ? 1 : Number(p[2]));
  let d = `M${fmt(pts[0][0])},${fmt(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const k1 = k * smooth(p1), k2 = k * smooth(p2);
    const c1x = p1[0] + (p2[0] - p0[0]) * k1, c1y = p1[1] + (p2[1] - p0[1]) * k1;
    const c2x = p2[0] - (p3[0] - p1[0]) * k2, c2y = p2[1] - (p3[1] - p1[1]) * k2;
    d += `C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

/** Shorthand: a filled spline part primitive. */
export const S = (pts, f = 'p', o = {}) => P(spline(pts, o.spline), f, stripSpline(o));
/** Stroke-only open spline. */
export const SL = (pts, f = 'k', w = 2.5, o = {}) => L(spline(pts, { closed: false, ...(o.spline || {}) }), f, w, stripSpline(o));
function stripSpline(o) { const { spline: _s, ...rest } = o; return rest; }

// ---- point-list helpers -------------------------------------------------------

/** Points on an arc of an ellipse, from angle a0 to a1 (degrees, SVG orientation: 0 = right, 90 = down). */
export function arcPts(cx, cy, rx, ry, a0, a1, n, smoothK) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const p = [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    if (smoothK != null) p.push(smoothK);
    out.push(p);
  }
  return out;
}

/**
 * A tufted (fur) edge from a to b. Returns points to splice into a spline list:
 * n tufts, each a sharp tip pushed `amp` units to the outside of a clockwise
 * silhouette (use a negative amp for the inside), ending on b. a itself is not
 * included. Options: lean (0..1, tips lean toward b like fur lying flat),
 * taper (amplitude multiplier at b relative to a), valley (roundness of the
 * bases, default 0.6), wobble (per-tuft amplitude variation, deterministic),
 * tip (roundness of the tips, default 0.2; 'c' for razor points).
 */
export function fur(a, b, n, amp, o = {}) {
  const lean = o.lean == null ? 0.25 : o.lean, taper = o.taper == null ? 1 : o.taper;
  const valley = o.valley == null ? 0.6 : o.valley, wobble = o.wobble == null ? 0.15 : o.wobble;
  const tip = o.tip == null ? 0.2 : o.tip;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = dy / len, ny = -dx / len;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const tt = t0 + (t1 - t0) * (0.5 + lean * 0.4);
    const w = 1 + wobble * Math.sin(i * 2.399 + 0.7) * (i % 2 ? 1 : -1);
    const A = amp * (1 + (taper - 1) * tt) * w;
    out.push([a[0] + dx * tt + nx * A, a[1] + dy * tt + ny * A, tip]);
    const bp = [a[0] + dx * t1, a[1] + dy * t1];
    if (i < n - 1) bp.push(valley);
    out.push(bp);
  }
  return out;
}

/** Translate, scale and rotate a point list about the origin (scale then rotate then move). Keeps corner flags. */
export function xfPts(pts, { x = 0, y = 0, sx = 1, sy, a = 0 } = {}) {
  const syy = sy == null ? sx : sy;
  const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return pts.map((p) => {
    const px = p[0] * sx, py = p[1] * syy;
    const q = [px * c - py * s + x, px * s + py * c + y];
    if (p.length > 2) q.push(p[2]);
    return q;
  });
}

/** Mirror a point list across x = 0 (for symmetric halves); reverses order so the winding stays consistent. */
export function mirrorPts(pts) {
  return pts.map((p) => (p.length > 2 ? [-p[0], p[1], p[2]] : [-p[0], p[1]])).reverse();
}

/** A closed lens / leaf between a and b with belly `bulge` (positive = to the outside of clockwise travel). */
export function leaf(a, b, bulge, tipK = 'c') {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = dy / len, ny = -dx / len;
  return spline([[a[0], a[1], tipK], [mx + nx * bulge, my + ny * bulge], [b[0], b[1], tipK], [mx - nx * bulge, my - ny * bulge]]);
}

/**
 * Closed outline around a centreline (for tails, horns, thin limbs): width w0 at
 * the start tapering to w1 at the end, with a rounded end cap. Returns a point
 * list for spline(). The start is left open-ended (it usually sits inside the parent).
 * o.tipK sets the tip roundness (default 1), o.bulge scales the width mid-way (1 = linear).
 */
export function tube(centre, w0, w1, o = {}) {
  const n = centre.length;
  const left = [], right = [];
  const bulge = o.bulge == null ? 1 : o.bulge;
  for (let i = 0; i < n; i++) {
    const p = centre[i], prev = centre[Math.max(0, i - 1)], next = centre[Math.min(n - 1, i + 1)];
    const dx = next[0] - prev[0], dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const t = n > 1 ? i / (n - 1) : 0;
    const w = ((w0 + (w1 - w0) * t) * (1 + (bulge - 1) * Math.sin(t * Math.PI))) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  const end = centre[n - 1], pe = centre[Math.max(0, n - 2)];
  const dx = end[0] - pe[0], dy = end[1] - pe[1];
  const len = Math.hypot(dx, dy) || 1;
  const cap = [end[0] + (dx / len) * (w1 / 2), end[1] + (dy / len) * (w1 / 2), o.tipK == null ? 1 : o.tipK];
  return [...left, cap, ...right.reverse()];
}

/** Points of a fluffy ball: n tufts around (cx, cy) with radius r and tuft depth amp. */
export function puff(cx, cy, r, n, amp, o = {}) {
  const out = [];
  const rot = o.rot || 0;
  for (let i = 0; i < n; i++) {
    const a0 = ((i / n) * 360 + rot) * (Math.PI / 180), a1 = (((i + 0.5) / n) * 360 + rot) * (Math.PI / 180);
    out.push([cx + Math.cos(a0) * (r + amp), cy + Math.sin(a0) * (r + amp), o.tip == null ? 0.5 : o.tip]);
    out.push([cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, 0.7]);
  }
  return out;
}
