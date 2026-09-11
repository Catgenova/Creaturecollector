// Evolution art. `evolvedPart(part, stage)` returns the stage-2 or stage-3 version of a part:
// the hand-authored variant when the part has one (`part.stages`, compiled by the builders from
// a `stages: { 2: {...}, 3: {...} }` spec), otherwise a procedural pass that grows the part about
// its attachment point by its slot family's factors and, for protruding families, lengthens its
// tips with spikes (same colour as the shape they extend; accent "energy" tips at stage 3).
// Variants are cached; stage 1 returns the part itself.
import { pathPoints, transformPathD } from './geom.js';
import { growthFor } from '../data/evolution.js';

const cache = new Map();

export function evolvedPart(part, stage) {
  if (!part || part.none || !(stage > 1)) return part;
  const key = `${part.id}@${stage}`;
  if (cache.has(key)) return cache.get(key);
  const hand = part.stages && part.stages[stage];
  const out = hand ? handStage(part, hand, stage, key) : proceduralStage(part, stage, key);
  cache.set(key, out);
  return out;
}

/** A hand-authored variant: its compiled art, optionally scaled (`grow`) and tipped with spikes. */
function handStage(part, hand, stage, key) {
  const { grow, spikes, ...over } = hand;
  let out = { ...part, ...over, stage, boundsKey: key, box: undefined };
  if (grow) out = scaleVariant(out, grow[0], grow[1]);
  if (spikes) out.prims = withSpikes(out.prims, out.clip, stage);
  return out;
}

function proceduralStage(part, stage, key) {
  const g = growthFor(part.slot);
  const [sx, sy] = g[stage];
  const out = scaleVariant({ ...part, stage, boundsKey: key }, sx, sy);
  if (g.spikes) out.prims = withSpikes(out.prims, out.clip, stage);
  return out;
}

function scalePrim(pr, sx, sy) {
  switch (pr.t) {
    case 'path': case 'line': return { ...pr, d: transformPathD(pr.d, (x, y) => [x * sx, y * sy]) };
    case 'ellipse': return { ...pr, cx: pr.cx * sx, cy: pr.cy * sy, rx: pr.rx * sx, ry: pr.ry * sy };
    case 'circle': return { ...pr, cx: pr.cx * sx, cy: pr.cy * sy, r: pr.r * Math.sqrt(sx * sy) };
    default: return pr;
  }
}

/** Scale a part's art, clip, sockets, ground line and box about its origin. */
function scaleVariant(v, sx, sy) {
  const out = { ...v, prims: v.prims.map((pr) => scalePrim(pr, sx, sy)) };
  if (Array.isArray(v.clip)) out.clip = v.clip.map((d) => transformPathD(d, (x, y) => [x * sx, y * sy]));
  if (v.sockets) out.sockets = Object.fromEntries(Object.entries(v.sockets).map(([k, s]) => [k, s ? { ...s, x: s.x * sx, y: s.y * sy } : s]));
  if (typeof v.bottom === 'number') out.bottom = v.bottom * sy;
  out.box = v.box ? [v.box[0] * sx, v.box[1] * sy, v.box[2] * sx, v.box[3] * sy] : undefined;
  return out;
}

/** The silhouette shapes of a part: its clip paths paired with the shape prims that formed them. */
function silhouettes(prims, clip) {
  if (!Array.isArray(clip) || !clip.length) return [];
  return clip.map((d, i) => ({ pts: pathPoints(d), f: prims[i] && prims[i].t !== 'line' && prims[i].f !== 'none' ? prims[i].f : 'p' }));
}

/** Indices of the outline points that are locally farthest from (cx, cy). */
function tipIndices(pts, cx, cy) {
  const n = pts.length;
  const d = pts.map(([x, y]) => Math.hypot(x - cx, y - cy));
  const out = [];
  for (let i = 0; i < n; i++) {
    let isMax = true;
    for (let k = 1; k <= 3 && isMax; k++) if (d[(i - k + n) % n] > d[i] || d[(i + k) % n] > d[i]) isMax = false;
    if (isMax) out.push(i);
  }
  return out;
}

/**
 * Spikes that lengthen a part's tips: the outline points locally farthest from their shape's
 * centre, ranked by distance from the attachment point. Drawn *behind* the shapes with their
 * bases sunk in, so each reads as the shape's own tip growing longer.
 */
function withSpikes(prims, clip, stage) {
  const shapes = silhouettes(prims, clip);
  if (!shapes.length) return prims;
  const cands = [];
  let maxD = 0;
  for (const { pts, f } of shapes) {
    if (pts.length < 6) continue;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x; cy += y; }
    cx /= pts.length; cy /= pts.length;
    for (const i of tipIndices(pts, cx, cy)) {
      const [x, y] = pts[i];
      const d = Math.hypot(x, y);
      maxD = Math.max(maxD, d);
      let dx = x - cx, dy = y - cy;
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl; dy /= dl;
      cands.push({ x, y, d, f, dx, dy });
    }
  }
  if (!(maxD > 6) || !cands.length) return prims;
  cands.sort((a, b) => b.d - a.d);
  const n = stage === 3 ? 5 : 3;
  const len = Math.min(16, Math.max(5, maxD * (stage === 3 ? 0.2 : 0.12)));
  const minSep = len * 1.4;
  const picked = [];
  for (const c of cands) {
    if (c.d < maxD * 0.55) break;
    if (picked.some((p) => Math.hypot(p.x - c.x, p.y - c.y) < minSep)) continue;
    picked.push(c);
    if (picked.length >= n) break;
  }
  const fmt = (v) => Math.round(v * 100) / 100;
  const w = len * 0.55;
  const spikes = [];
  for (const c of picked) {
    const bx = c.x - c.dx * len * 0.5, by = c.y - c.dy * len * 0.5;
    const tx = c.x + c.dx * len, ty = c.y + c.dy * len;
    const nx = -c.dy * w / 2, ny = c.dx * w / 2;
    spikes.push({ t: 'path', d: `M${fmt(bx + nx)},${fmt(by + ny)} L${fmt(tx)},${fmt(ty)} L${fmt(bx - nx)},${fmt(by - ny)} Z`, f: c.f, sw: 1.6 });
    if (stage === 3) {
      const ax = c.x + c.dx * len * 0.3, ay = c.y + c.dy * len * 0.3, aw = w * 0.45;
      const anx = -c.dy * aw / 2, any = c.dx * aw / 2;
      spikes.push({ t: 'path', d: `M${fmt(ax + anx)},${fmt(ay + any)} L${fmt(tx)},${fmt(ty)} L${fmt(ax - anx)},${fmt(ay - any)} Z`, f: 'a', ns: true, op: 0.9 });
    }
  }
  return [...spikes, ...prims];
}

/** For tests and tools: drop the cache. */
export function clearEvolutionCache() { cache.clear(); }
