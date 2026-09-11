// Part builders shared by the class libraries. partBuilders(prefix) returns
// body / leg / part constructors that namespace ids with the rig's prefix
// ("m." mammals, "r." reptiles) and derive clip paths from the silhouettes.
import { P, SH, HL, PATCH, spline } from './_dsl.js';

const shapeToPath = (s) => (typeof s === 'string' ? s : Array.isArray(s) ? spline(s) : s.d || spline(s.pts));
const shapeRole = (s) => (s && !Array.isArray(s) && typeof s === 'object' && s.f) || 'p';

/**
 * Compile a spec's `stages: { 2: over, 3: over }` into hand-authored stage art on the part.
 * Each override is applied on top of the spec (stage 3 on top of stage 2's result unless it
 * says `reset: true`) and may replace any spec key (`shapes`, `extra`, `sockets`, `bottom`,
 * `hover`...) or use the deltas:
 *   addShapes  extra silhouette shapes drawn on top of (and clipping with) the originals
 *   addBehind  extra silhouette shapes drawn behind the originals
 *   add        extra detail prims appended to `extra`
 *   grow       [sx, sy] applied to the compiled art about the origin (compounds across stages)
 *   spikes     also run the procedural tip-spike pass on the result
 */
function withStages(make, spec, part) {
  if (!spec.stages) return part;
  part.stages = {};
  const base = () => ({ ...spec, stages: undefined });
  let cur = base(), grow = null, spikes = false;
  for (const stage of [2, 3]) {
    const over = spec.stages[stage];
    if (!over) continue;
    const { add, addShapes, addBehind, grow: g, spikes: sp, reset, ...rest } = over;
    if (reset) { cur = base(); grow = null; spikes = false; }
    const next = { ...cur, ...rest };
    if (addShapes || addBehind) {
      const shapes = next.shapes || (next.pts ? [next.pts] : []);
      next.shapes = [...(addBehind || []), ...shapes, ...(addShapes || [])];
      delete next.pts;
    }
    if (add) next.extra = [...(next.extra || []), ...add];
    cur = next;
    if (g) grow = grow ? [grow[0] * g[0], grow[1] * g[1]] : [g[0], g[1]];
    if (sp) spikes = true;
    const v = make(cur);
    const out = { prims: v.prims, clip: v.clip, sockets: v.sockets };
    if (v.bottom != null) out.bottom = v.bottom;
    if (v.hover != null) out.hover = v.hover;
    if (grow) out.grow = grow;
    if (spikes) out.spikes = true;
    part.stages[stage] = out;
  }
  return part;
}

export function partBuilders(prefix) {
  /** A torso: silhouette shapes (point lists, paths or {pts|d, f}), clip and box derived, shading layered on. */
  const makeBody = ({ id, name, kind, pts, shapes, sockets, dom = 0.5, w = 2, tags = [], shade = [], extra = [], hover, bottom }) => {
    const list = shapes || [pts];
    const clip = list.map(shapeToPath);
    const prims = [...list.map((s, i) => P(clip[i], shapeRole(s))), ...shade, ...extra];
    const part = { id: `${prefix}body.${id}`, slot: 'body', name, kind, tags, dom, w, clip, prims, sockets };
    if (hover) part.hover = hover;
    if (bottom != null) part.bottom = bottom;
    return part;
  };
  const body = (spec) => withStages(makeBody, spec, makeBody(spec));

  /** A leg: clip = union of its shapes so socks and shading stay inside the silhouette. */
  const makeLeg = ({ id, slot, name, shapes, extra = [], dom = 0.5, w = 2, tags = [], fit }) => {
    const clip = shapes.map(shapeToPath);
    const part = { id: `${prefix}${slot}.${id}`, slot, name, tags, dom, w, clip, prims: [...shapes.map((s, i) => P(clip[i], shapeRole(s))), ...extra] };
    if (fit) part.fit = fit;
    return part;
  };
  const leg = (spec) => withStages(makeLeg, spec, makeLeg(spec));

  /** Generic part: silhouette shapes first (they form the clip), then details. */
  const makePart = ({ id, slot, name, shapes = [], extra = [], dom = 0.5, w = 2, tags = [], sockets, fit, fitBox, hover }) => {
    const clip = shapes.map(shapeToPath);
    const out = { id: `${prefix}${slot}.${id}`, slot, name, tags, dom, w, prims: [...shapes.map((s, i) => P(clip[i], shapeRole(s))), ...extra] };
    if (clip.length) out.clip = clip;
    if (sockets) out.sockets = sockets;
    if (fit) out.fit = fit;
    if (fitBox != null) out.fitBox = fitBox;
    if (hover) out.hover = hover;
    return out;
  };
  const part = (spec) => withStages(makePart, spec, makePart(spec));

  return { body, leg, part };
}

/** Standard belly shadow and back highlight for a torso spanning x0..x1 with spine at ySpine and belly line at yBelly. */
export function torsoShade(x0, x1, ySpine, yBelly, o = {}) {
  const midY = yBelly - (yBelly - ySpine) * (o.shadeFrac == null ? 0.42 : o.shadeFrac);
  const shade = SH(`M${x0 - 10},${midY} C${x0 + (x1 - x0) * 0.3},${midY + 8} ${x0 + (x1 - x0) * 0.7},${midY + 8} ${x1 + 10},${midY - 4} L${x1 + 10},${yBelly + 20} L${x0 - 10},${yBelly + 20} Z`, o.shade == null ? 0.14 : o.shade);
  const hy = ySpine + (yBelly - ySpine) * 0.18;
  const light = HL(`M${x0 + 6},${ySpine - 10} C${x0 + (x1 - x0) * 0.3},${ySpine - 12} ${x1 - 20},${ySpine - 12} ${x1 - 4},${ySpine - 4} L${x1 - 8},${hy} C${x1 - 24},${hy - 6} ${x0 + (x1 - x0) * 0.3},${hy - 4} ${x0 + 6},${hy + 2} Z`, o.light == null ? 0.16 : o.light);
  return [shade, light];
}

/** Toe lines on a paw: n short dark ticks across x0..x1 at y, pointing down. */
export function toes(x0, x1, y, n = 2, len = 3, op = 0.55) {
  let d = '';
  for (let i = 1; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / (n + 1); d += `M${x},${y - len} L${x},${y} `; }
  return { t: 'line', d: d.trim(), f: 'k', w: 1.6, op };
}

/** Claws: n small pale triangles along the front of a foot from x0..x1 at y, pointing down-right. */
export function claws(x0, x1, y, n = 3, len = 4, f = 'w') {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / Math.max(1, n - 1);
    out.push({ t: 'path', d: `M${x - 2},${y - 1} L${x + 1.5},${y + len} L${x + 3.5},${y - 1} Z`, f, sw: 1.2 });
  }
  return out;
}

/** A dark "sock" from y down over the leg, clipped to the leg silhouette. */
export function sock(y, role = 'a', x0 = -30, x1 = 30, curve = 3) {
  return PATCH(`M${x0},${y + curve} Q0,${y - curve} ${x1},${y + curve} L${x1},${y + 60} L${x0},${y + 60} Z`, role);
}
