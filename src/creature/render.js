// Genome -> SVG string. Pure: no DOM access, so it runs in Node for tests.
//
// Creatures on a class rig are drawn by walking the rig's draw tree: every
// part is placed on a named socket of its parent part, far-side copies are
// drawn darker behind, and children move with their parent (ears and eyes ride
// the head). Creatures still on the legacy rig use the original fixed
// assembly order (wings, tail, back, legs, arms, body, head).
//
// The frame is fixed so creatures are comparable in size: the ground line sits
// at the same height in every render. opts.fit crops the viewBox to the
// creature's bounds instead, for hero shots.
//
// Render styles. 'classic' is the flat sticker look drawn with CSS variables.
// The others compute literal colours per slot and add volume procedurally from
// the same part data: gradient fills, clipped shadow/highlight rims along the
// edges, a thick silhouette pass under thin interior lines, and a gloss spot.
import { lerp, num, uid, escapeHtml, hsl, mixHue } from '../core/util.js';
import { paletteVars, slotPaintVars, FAR_VARS } from './palette.js';
import { resolveParts, PAINT_PERMS, typeLabel, rigOf } from './genome.js';
import { getRig } from '../data/rigs.js';

export const FRAME = { w: 200, h: 230, ground: 208 };
const FAR_DEFAULT = { dx: -6, dy: -4 };

export const RENDER_STYLES = ['classic', 'soft', 'cel', 'studio', 'sticker'];
const STYLE = {
  classic: { grad: false, rims: false, outlinePass: false, gloss: false, eye: 1, lineIn: 4, lineOut: 4, olL: 13, olS: 45 },
  soft:    { grad: true, rims: false, outlinePass: false, gloss: false, eye: 1.05, lineIn: 3.4, lineOut: 3.4, olL: 18, olS: 50 },
  cel:     { grad: false, rims: 'cel', outlinePass: true, gloss: false, eye: 1.15, lineIn: 2.2, lineOut: 8, olL: 20, olS: 55 },
  studio:  { grad: true, rims: 'cel', outlinePass: true, gloss: true, eye: 1.15, lineIn: 2.2, lineOut: 8, olL: 20, olS: 55 },
  sticker: { grad: false, rims: 'white', outlinePass: true, gloss: true, eye: 1.3, lineIn: 2.6, lineOut: 10, olL: 8, olS: 10 },
};
let renderStyle = 'classic';
export function setRenderStyle(s) { renderStyle = RENDER_STYLES.includes(s) ? s : 'classic'; return renderStyle; }
export function getRenderStyle() { return renderStyle; }

// ---- primitives ---------------------------------------------------------------

function fillAttr(f) { return f === 'none' ? 'none' : `var(--${f})`; }

/** The bare shape tag for a primitive with the given attribute string. */
function shapeTag(pr, attrs) {
  const a = attrs ? ` ${attrs}` : '';
  switch (pr.t) {
    case 'path': case 'line': return `<path d="${pr.d}"${a}/>`;
    case 'ellipse': return `<ellipse cx="${num(pr.cx)}" cy="${num(pr.cy)}" rx="${num(pr.rx)}" ry="${num(pr.ry)}"${a}/>`;
    case 'circle': return `<circle cx="${num(pr.cx)}" cy="${num(pr.cy)}" r="${num(pr.r)}"${a}/>`;
    default: return '';
  }
}

function classicPrim(pr) {
  const cls = pr.ns ? '' : ' class="o"';
  const style = pr.sw != null && !pr.ns ? ` style="stroke-width:${num(pr.sw)}"` : '';
  const op = pr.op != null ? ` opacity="${num(pr.op)}"` : '';
  if (pr.t === 'line') return `<path d="${pr.d}" fill="none" stroke="var(--${pr.f})" stroke-width="${num(pr.w)}" stroke-linecap="round" stroke-linejoin="round"${op}/>`;
  return shapeTag(pr, `${cls.trim()} fill="${fillAttr(pr.f)}"${style}${op}`.trim());
}

function primSvg(pr, ctx) {
  const st = ctx.st;
  if (ctx.mode === 'outline') {
    if (pr.ns || pr.t === 'line' || pr.f === 'none' || ctx.noOutline) return '';
    return shapeTag(pr, `fill="none" stroke="${ctx.ol}" stroke-width="${num(st.lineOut)}" stroke-linejoin="round" stroke-linecap="round"`);
  }
  if (!ctx.colors) return classicPrim(pr);
  const fam = ctx.colors[pr.f] || ctx.colors.p;
  const op = pr.op != null ? ` opacity="${num(pr.op)}"` : '';
  if (pr.t === 'line') return `<path d="${pr.d}" fill="none" stroke="${hsl(...fam.base)}" stroke-width="${num(pr.w)}" stroke-linecap="round" stroke-linejoin="round"${op}/>`;
  let fill;
  if (pr.f === 'none') fill = 'none';
  else if (st.grad && !pr.ns && pr.f !== 'k') fill = `url(#${ctx.grad(pr.f)})`;
  else fill = hsl(...fam.base);
  const stroke = pr.ns ? ' stroke="none"' : ` stroke="${ctx.ol}" stroke-width="${num(pr.sw != null ? pr.sw : st.lineIn)}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke"`;
  let out = shapeTag(pr, `fill="${fill}"${stroke}${op}`);
  if (st.rims && !pr.ns && pr.f !== 'none' && pr.f !== 'k' && !ctx.small) {
    const id = `${ctx.uid}-c${ctx.shared.n++}`;
    out += `<clipPath id="${id}">${shapeTag(pr, '')}</clipPath><g clip-path="url(#${id})">`;
    if (st.rims === 'white') {
      out += shapeTag(pr, 'fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4"');
    } else {
      out += shapeTag(pr, `fill="none" stroke="${hsl(...fam.shade)}" stroke-width="7" transform="translate(-2 -3)" opacity="0.85"`);
      out += shapeTag(pr, `fill="none" stroke="${hsl(...fam.light)}" stroke-width="3" transform="translate(1.6 2.2)" opacity="0.8"`);
    }
    out += '</g>';
  }
  return out;
}

/** The silhouette a part's clipped prims are cut to: its clip paths, else its first filled shape. */
function partClipShapes(part) {
  if (Array.isArray(part.clip) && part.clip.length) return part.clip.map((d) => `<path d="${d}"/>`).join('');
  const first = (part.prims || []).find((pr) => pr.t !== 'line' && pr.f !== 'none' && !pr.cl);
  return first ? shapeTag(first, '') : '';
}

/** All prims of a part in a context. Prims flagged `cl` are clipped to the part's own silhouette. */
function partPrimsCtx(part, ctx) {
  let out = '', clipped = '';
  for (const pr of part.prims) {
    if (pr.cl) { if (ctx.mode !== 'outline') clipped += primSvg(pr, ctx); }
    else {
      if (clipped) { out += flushClip(part, ctx, clipped); clipped = ''; }
      out += primSvg(pr, ctx);
    }
  }
  if (clipped) out += flushClip(part, ctx, clipped);
  return out;
}
function flushClip(part, ctx, inner) {
  const id = `${ctx.uid}-pc${ctx.shared.n++}`;
  return `<clipPath id="${id}">${partClipShapes(part)}</clipPath><g clip-path="url(#${id})">${inner}</g>`;
}

/** Classic-style primitives for a part (used by tests and tools). */
export function partPrims(part) { return part.prims.map(classicPrim).join(''); }

// ---- colours for the styled renderers ------------------------------------------

const shadeOf = (c) => [mixHue(c[0], 250, 0.12), Math.min(100, c[1] + 8), Math.max(6, c[2] - 14)];
const lightOf = (c) => [mixHue(c[0], 55, 0.1), Math.max(0, c[1] - 6), Math.min(96, c[2] + 12)];
const family = (c) => ({ base: c, shade: shadeOf(c), light: lightOf(c) });

/** Literal role colours for one slot (and its far copy) in a styled render. */
function styledColors(g, slot, far, st) {
  const perm = PAINT_PERMS[(g.paint && g.paint[slot]) || 0] || PAINT_PERMS[0];
  const cs = ['c1', 'c2', 'c3'].map((k) => g.palette[k]);
  const hue0 = g.palette.c1[0];
  const roles = { p: family(cs[perm[0]]), s: family(cs[perm[1]]), a: family(cs[perm[2]]), w: family([hue0, 20, 97]), e: family(g.palette.eye) };
  if (far) for (const r of Object.keys(roles)) { const f = roles[r]; roles[r] = { base: f.shade, shade: shadeOf(f.shade), light: f.base }; }
  const out = {};
  for (const [r, f] of Object.entries(roles)) {
    out[r] = f;
    out[`${r}d`] = { base: f.shade, shade: shadeOf(f.shade), light: f.base };
    out[`${r}l`] = { base: f.light, shade: f.base, light: lightOf(f.light) };
  }
  const k = [hue0, Math.min(g.palette.c1[1], st.olS), st.olL];
  out.k = { base: k, shade: k, light: k };
  return out;
}

// ---- bounds -----------------------------------------------------------------

const boundsCache = new Map();

/** Sample points along an SVG path (absolute and relative commands; curves are flattened). */
export function pathPoints(d) {
  const pts = [];
  const tok = d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) || [];
  let i = 0, cmd = 'M', cx = 0, cy = 0, sx = 0, sy = 0, pcx = 0, pcy = 0, prevCurve = '';
  const rd = () => Number(tok[i++]);
  const cubic = (x1, y1, x2, y2, x, y) => {
    for (let k = 1; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
    }
    pcx = x2; pcy = y2; cx = x; cy = y; prevCurve = 'C';
  };
  const quad = (x1, y1, x, y) => {
    for (let k = 1; k <= 6; k++) {
      const t = k / 6, u = 1 - t;
      pts.push([u * u * cx + 2 * u * t * x1 + t * t * x, u * u * cy + 2 * u * t * y1 + t * t * y]);
    }
    pcx = x1; pcy = y1; cx = x; cy = y; prevCurve = 'Q';
  };
  while (i < tok.length) {
    if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    switch (cmd.toUpperCase()) {
      case 'M': { const x = rd() + ox, y = rd() + oy; cx = sx = x; cy = sy = y; pts.push([x, y]); cmd = rel ? 'l' : 'L'; prevCurve = ''; break; }
      case 'L': { const x = rd() + ox, y = rd() + oy; cx = x; cy = y; pts.push([x, y]); prevCurve = ''; break; }
      case 'H': { cx = rd() + ox; pts.push([cx, cy]); prevCurve = ''; break; }
      case 'V': { cy = rd() + oy; pts.push([cx, cy]); prevCurve = ''; break; }
      case 'C': { const x1 = rd() + ox, y1 = rd() + oy, x2 = rd() + ox, y2 = rd() + oy, x = rd() + ox, y = rd() + oy; cubic(x1, y1, x2, y2, x, y); break; }
      case 'S': { const x2 = rd() + ox, y2 = rd() + oy, x = rd() + ox, y = rd() + oy; const x1 = prevCurve === 'C' ? 2 * cx - pcx : cx, y1 = prevCurve === 'C' ? 2 * cy - pcy : cy; cubic(x1, y1, x2, y2, x, y); break; }
      case 'Q': { const x1 = rd() + ox, y1 = rd() + oy, x = rd() + ox, y = rd() + oy; quad(x1, y1, x, y); break; }
      case 'T': { const x = rd() + ox, y = rd() + oy; const x1 = prevCurve === 'Q' ? 2 * cx - pcx : cx, y1 = prevCurve === 'Q' ? 2 * cy - pcy : cy; quad(x1, y1, x, y); break; }
      case 'A': { const rx = rd(), ry = rd(); rd(); rd(); rd(); const x = rd() + ox, y = rd() + oy; const mx = (cx + x) / 2, my = (cy + y) / 2; pts.push([mx - rx, my - ry], [mx + rx, my + ry], [x, y]); cx = x; cy = y; prevCurve = ''; break; }
      case 'Z': { cx = sx; cy = sy; prevCurve = ''; break; }
      default: i++;
    }
  }
  return pts;
}

/** Bounding box [x0,y0,x1,y1] of a part in its own coordinates, with a small margin for the outline. */
export function partBounds(part) {
  if (boundsCache.has(part.id)) return boundsCache.get(part.id);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; };
  for (const pr of part.prims || []) {
    if (pr.cl) continue; // clipped prims never extend the silhouette
    if (pr.t === 'ellipse') { add(pr.cx - pr.rx, pr.cy - pr.ry); add(pr.cx + pr.rx, pr.cy + pr.ry); }
    else if (pr.t === 'circle') { add(pr.cx - pr.r, pr.cy - pr.r); add(pr.cx + pr.r, pr.cy + pr.r); }
    else if (pr.t === 'path' || pr.t === 'line') for (const [x, y] of pathPoints(pr.d)) add(x, y);
  }
  const box = x0 === Infinity ? [0, 0, 0, 0] : [x0 - 2, y0 - 2, x1 + 2, y1 + 2];
  boundsCache.set(part.id, box);
  return box;
}

// transform = { x, y, a, sx, sy } applied as translate(x,y) rotate(a) scale(sx,sy)
function applyT([px, py], t) {
  let x = px * (t.sx == null ? 1 : t.sx), y = py * (t.sy == null ? 1 : t.sy);
  if (t.a) {
    const r = (t.a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    const rx = x * c - y * s, ry = x * s + y * c;
    x = rx; y = ry;
  }
  return [x + (t.x || 0), y + (t.y || 0)];
}

/** Push a box through a chain of transforms, innermost first. */
function boxThrough(box, chain) {
  let pts = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]];
  for (const t of chain) pts = pts.map((p) => applyT(p, t));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}

function union(a, b) {
  if (!a) return b.slice();
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
}

const xf = (x, y, a = 0, s = 1) => ({ x, y, a, sx: s, sy: s });

function tf(t) {
  let out = `translate(${num(t.x)} ${num(t.y)})`;
  if (t.a) out += ` rotate(${num(t.a)})`;
  const sy = t.sy == null ? t.sx : t.sy;
  if (t.sx !== 1 || sy !== 1) out += t.sx === sy ? ` scale(${num(t.sx)})` : ` scale(${num(t.sx)} ${num(sy)})`;
  return out;
}

function paintOf(g, slot) {
  const perm = PAINT_PERMS[(g.paint && g.paint[slot]) || 0] || PAINT_PERMS[0];
  return slotPaintVars(perm);
}

/** Scales derived from continuous trait genes. Exported so the UI can explain them. */
export function traitScales(traits = {}) {
  const t = (k) => (traits[k] == null ? 0.5 : traits[k]);
  return {
    size: lerp(0.68, 1.0, t('size')),
    leg: lerp(0.8, 1.2, t('limbScale')),
    head: lerp(0.85, 1.15, t('headScale')),
    tail: lerp(0.75, 1.25, t('tailScale')),
    wing: lerp(0.75, 1.25, t('wingScale')),
    eye: lerp(0.8, 1.25, t('eyeScale')),
  };
}

/** Shared per-render state: style, outline colour, gradient defs and the per-slot context cache. */
function renderSetup(g, id, styleName) {
  const st = STYLE[styleName] || STYLE.classic;
  const styled = st !== STYLE.classic;
  const shared = { n: 0, defs: [], grads: new Map() };
  const ol = styled ? hsl(g.palette.c1[0], Math.min(g.palette.c1[1], st.olS), st.olL) : 'var(--ol)';
  const ctxCache = new Map();
  const ctxFor = (slot, far, mode, extra = {}) => {
    const key = `${slot}|${far}|${mode}|${extra.small ? 1 : 0}|${extra.noOutline ? 1 : 0}`;
    if (ctxCache.has(key)) return ctxCache.get(key);
    const colors = styled ? styledColors(g, slot, far, st) : null;
    const ctx = {
      st, uid: id, slot, far, mode, ol, shared, colors, small: Boolean(extra.small), noOutline: Boolean(extra.noOutline),
      grad(role) {
        const gid = `${id}-g-${slot}${far ? 'f' : ''}-${role}`;
        if (!shared.grads.has(gid)) {
          const fam = colors[role] || colors.p;
          shared.defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hsl(...fam.light)}"/><stop offset="0.5" stop-color="${hsl(...fam.base)}"/><stop offset="1" stop-color="${hsl(...fam.shade)}"/></linearGradient>`);
          shared.grads.set(gid, true);
        }
        return gid;
      },
    };
    ctxCache.set(key, ctx);
    return ctx;
  };
  const wrap = (slot, inner) => (styled ? `<g>${inner}</g>` : `<g style="${paintOf(g, slot)}">${inner}</g>`);
  const farWrap = (inner) => (styled ? inner : `<g style="${FAR_VARS}">${inner}</g>`);
  return { st, styled, shared, ol, ctxFor, wrap, farWrap };
}

/** Gloss spot for the styled renderers, clipped to the body. */
function glossSvg(body, id) {
  const b = partBounds(body);
  const w = b[2] - b[0], hh = b[3] - b[1];
  const cx = b[0] + w * 0.34, cy = b[1] + hh * 0.26;
  return `<g clip-path="url(#${id}-clip)"><ellipse cx="${num(cx)}" cy="${num(cy)}" rx="${num(w * 0.17)}" ry="${num(hh * 0.09)}" fill="#fff" opacity="0.22" transform="rotate(-24 ${num(cx)} ${num(cy)})"/></g>`;
}

// ---- legacy rig ---------------------------------------------------------------

/**
 * Build the layered markup for a legacy-rig creature and measure it.
 * Returns { layers, defs, box, feet, hover, K, body, clip } where box is the
 * creature's bounds in creature space (body centre = 0,0).
 */
function buildLegacy(g, id, styleName) {
  const R = renderSetup(g, id, styleName);
  const { st, styled, shared, ctxFor, wrap, farWrap } = R;
  const P = resolveParts(g);
  const body = P.body;
  const S = body.sockets;
  const K = traitScales(g.traits);
  K.eye *= st.eye;

  let feet = body.bottom;
  if (P.legs && S.legs) for (const ls of S.legs) feet = Math.max(feet, ls.y + (P.legs.len || 40) * K.leg);
  const hover = body.hover || 0;

  let box = null;
  const grow = (part, chain) => { box = union(box, boxThrough(partBounds(part), chain)); };

  const assemble = (mode) => {
    const L = [];
    const pp = (part, slot, far = false, extra) => partPrimsCtx(part, ctxFor(slot, far, mode, extra));

    if (P.wings && S.wing) {
      const tn = xf(S.wing.x, S.wing.y, 0, K.wing), tfar = xf(S.wing.x - 6, S.wing.y - 6, 0, K.wing);
      grow(P.wings, [tn]); grow(P.wings, [tfar]);
      L.push(wrap('wings',
        `<g transform="${tf(tfar)}"><g class="g-wing">${farWrap(pp(P.wings, 'wings', true))}</g></g>` +
        `<g transform="${tf(tn)}"><g class="g-wing">${pp(P.wings, 'wings')}</g></g>`));
    }
    if (P.tail && S.tail) {
      const t = xf(S.tail.x, S.tail.y, S.tail.a, K.tail);
      grow(P.tail, [t]);
      L.push(wrap('tail', `<g transform="${tf(t)}"><g class="g-tail">${pp(P.tail, 'tail')}</g></g>`));
    }
    if (P.back && S.back) {
      const t = xf(S.back.x, S.back.y, S.back.a);
      grow(P.back, [t]);
      L.push(wrap('back', `<g transform="${tf(t)}">${pp(P.back, 'back')}</g>`));
    }
    if (P.legs && S.legs && S.legs.length) {
      let far = '', near = '';
      for (const ls of S.legs) {
        const f = ls.far || FAR_DEFAULT;
        const tfar = xf(ls.x + f.dx, ls.y + f.dy, 0, K.leg), tn = xf(ls.x, ls.y, 0, K.leg);
        grow(P.legs, [tfar]); grow(P.legs, [tn]);
        far += `<g transform="${tf(tfar)}">${farWrap(pp(P.legs, 'legs', true))}</g>`;
        near += `<g transform="${tf(tn)}">${pp(P.legs, 'legs')}</g>`;
      }
      L.push(wrap('legs', far + near));
    }
    const armsFront = Boolean(body.armsFront);
    const armSvg = () => {
      const tn = xf(S.arm.x, S.arm.y), tfar = xf(S.arm.x - 14, S.arm.y - 3);
      grow(P.arms, [tn]);
      let s = '';
      if (!armsFront) { grow(P.arms, [tfar]); s += `<g transform="${tf(tfar)}">${farWrap(pp(P.arms, 'arms', true))}</g>`; }
      return wrap('arms', s + `<g transform="${tf(tn)}">${pp(P.arms, 'arms')}</g>`);
    };
    if (P.arms && S.arm && !armsFront) L.push(armSvg());

    const face = (F, outer) => {
      let behind = '', front = '';
      if (P.crown && F.crown) {
        const t = xf(F.crown.x, F.crown.y, F.crown.a, F.crown.s == null ? 1 : F.crown.s);
        grow(P.crown, [t, ...outer]);
        behind += wrap('crown', `<g transform="${tf(t)}">${pp(P.crown, 'crown')}</g>`);
      }
      if (P.eyes) {
        if (F.eye2) {
          const t = xf(F.eye2.x, F.eye2.y, 0, (F.eye2.s == null ? 0.85 : F.eye2.s) * K.eye);
          grow(P.eyes, [t, ...outer]);
          front += `<g transform="${tf(t)}">${farWrap(pp(P.eyes, 'eyes', true, { small: true, noOutline: true }))}</g>`;
        }
        if (F.eye) {
          const t = xf(F.eye.x, F.eye.y, 0, (F.eye.s == null ? 1 : F.eye.s) * K.eye);
          grow(P.eyes, [t, ...outer]);
          front += `<g transform="${tf(t)}">${pp(P.eyes, 'eyes', false, { small: true, noOutline: true })}</g>`;
        }
      }
      if (P.mouth && F.mouth) {
        const t = xf(F.mouth.x, F.mouth.y, 0, F.mouth.s == null ? 1 : F.mouth.s);
        grow(P.mouth, [t, ...outer]);
        front += `<g transform="${tf(t)}">${pp(P.mouth, 'mouth', false, { small: true, noOutline: true })}</g>`;
      }
      return { behind, front };
    };

    const headless = !P.head || !S.head;
    const bodyFace = headless && S.face ? face(S.face, []) : null;
    grow(body, []);
    let bodyInner = bodyFace ? bodyFace.behind : '';
    bodyInner += pp(body, 'body');
    if (mode !== 'outline') {
      if (P.pattern) bodyInner += `<g clip-path="url(#${id}-clip)">${pp(P.pattern, 'body', false, { small: true })}</g>`;
      if (st.gloss) bodyInner += glossSvg(body, id);
    }
    if (bodyFace) bodyInner += bodyFace.front;
    L.push(`<g class="g-body">${styled ? bodyInner : `<g style="${paintOf(g, 'body')}">${bodyInner}</g>`}</g>`);

    if (P.arms && S.arm && armsFront) L.push(armSvg());

    if (!headless) {
      const hs = S.head;
      const th = xf(hs.x, hs.y, hs.a, (hs.s == null ? 1 : hs.s) * K.head);
      grow(P.head, [th]);
      const hf = face(P.head.sockets, [th]);
      L.push(wrap('head', `<g transform="${tf(th)}"><g class="g-head">${hf.behind}${pp(P.head, 'head')}${hf.front}</g></g>`));
    }
    return L;
  };

  const outline = st.outlinePass ? assemble('outline') : [];
  const layers = assemble('normal');
  return { layers: [...outline, ...layers], defs: shared.defs.join(''), box: box || [-40, -40, 40, 40], feet, hover, K, body, clip: body.clip || [] };
}

// ---- class rigs -----------------------------------------------------------------

const ANIM_CLASS = { body: 'g-body', head: 'g-head', tail: 'g-tail', sway: 'g-sway', flap: 'g-wing', ear: 'g-ear' };

/** Frame markings and other box-fitted parts are authored in: 100 wide, 60 tall, centred on the origin. */
export const FIT_FRAME = { w: 100, h: 60 };

/** Build a creature on a class rig by walking the rig's draw tree. Same return shape as buildLegacy. */
function buildRigged(g, id, styleName, rig) {
  const R = renderSetup(g, id, styleName);
  const { st, styled, shared, ctxFor, wrap, farWrap } = R;
  const P = resolveParts(g);
  const body = P.body;
  const K = traitScales(g.traits);
  K.eye *= st.eye;
  const hover = body.hover || 0;
  const ground = new Set(rig.ground || ['body']);
  const bodyBox = body.box || partBounds(body);

  let box = null, feet = -Infinity;
  const grow = (part, chain, slot) => {
    const b = boxThrough(partBounds(part), chain);
    box = union(box, b);
    if (ground.has(slot)) feet = Math.max(feet, b[3] - 2);
  };

  /** The slots drawn on the body under its clip (markings), scaled from the authoring frame onto the body box. */
  const clippedSvg = (mode, pp) => {
    if (mode === 'outline') return '';
    let out = '';
    for (const slot of rig.clipped || []) {
      const part = P[slot];
      if (!part) continue;
      const sx = (bodyBox[2] - bodyBox[0]) / FIT_FRAME.w, sy = (bodyBox[3] - bodyBox[1]) / FIT_FRAME.h;
      const t = { x: (bodyBox[0] + bodyBox[2]) / 2, y: (bodyBox[1] + bodyBox[3]) / 2, a: 0, sx: part.fitBox === false ? 1 : sx, sy: part.fitBox === false ? 1 : sy };
      out += wrap(slot, `<g clip-path="url(#${id}-clip)"><g transform="${tf(t)}">${pp(part, slot, false, { small: true })}</g></g>`);
    }
    if (st.gloss) out += glossSvg(body, id);
    return out;
  };

  const assemble = (mode) => {
    const measure = mode === 'normal';
    const pp = (part, slot, far = false, extra) => partPrimsCtx(part, ctxFor(slot, far, mode, extra));
    const drawNode = (node, parentPart, outer) => {
      const part = P[node.slot];
      if (!part) return '';
      let t;
      if (node.fitBox && parentPart) {
        const bb = parentPart.box || partBounds(parentPart);
        t = { x: (bb[0] + bb[2]) / 2, y: (bb[1] + bb[3]) / 2, a: 0, sx: (bb[2] - bb[0]) / FIT_FRAME.w, sy: (bb[3] - bb[1]) / FIT_FRAME.h };
      } else if (node.socket) {
        const sk = parentPart && parentPart.sockets ? parentPart.sockets[node.socket] : null;
        if (!sk) return '';
        const s = (sk.s == null ? 1 : sk.s) * (node.scale ? K[node.scale] : 1);
        t = xf(sk.x, sk.y, sk.a || 0, s);
        if (sk.flip) t.sx = -t.sx;
      } else t = xf(0, 0, 0, 1);
      const chain = [t, ...outer];
      if (measure) grow(part, chain, node.slot);
      let inner = '';
      for (const c of node.behind || []) inner += drawNode(c, part, chain);
      let own = pp(part, node.slot, Boolean(node.far), { small: node.small, noOutline: node.noOutline });
      if (node.far) own = farWrap(own);
      inner += own;
      if (node.slot === 'body') inner += clippedSvg(mode, pp);
      for (const c of node.front || []) inner += drawNode(c, part, chain);
      const cls = node.anim && ANIM_CLASS[node.anim] ? ANIM_CLASS[node.anim] : '';
      const body_ = cls ? `<g class="${cls}">${inner}</g>` : inner;
      return wrap(node.slot, `<g transform="${tf(t)}">${body_}</g>`);
    };
    return [drawNode(rig.tree, null, [])];
  };

  const outline = st.outlinePass ? assemble('outline') : [];
  const layers = assemble('normal');
  if (!Number.isFinite(feet)) feet = bodyBox[3];
  if (typeof body.bottom === 'number') feet = Math.max(feet, body.bottom);
  return { layers: [...outline, ...layers], defs: shared.defs.join(''), box: box || [-40, -40, 40, 40], feet, hover, K, body, clip: body.clip || [] };
}

function buildCreature(g, id, styleName) {
  const rig = getRig(rigOf(g));
  return rig.tree ? buildRigged(g, id, styleName, rig) : buildLegacy(g, id, styleName);
}

/** Canvas-space transform that places a built creature on the ground line. */
function placement(built, facing) {
  const flip = facing === 'left' ? -1 : 1;
  const sc = built.K.size;
  return [
    { x: 0, y: -(built.feet + built.hover) },
    { x: FRAME.w / 2, y: FRAME.ground, a: 0, sx: flip * sc, sy: sc },
  ];
}

/** Bounding box of a creature in canvas coordinates, shadow included. */
export function measureCreature(g, facing = 'right') {
  const built = buildCreature(g, 'm', 'classic');
  const chain = placement(built, facing);
  const box = boxThrough(built.box, chain);
  const sc = built.K.size;
  const shadowRx = 36 * sc * (built.hover ? 0.7 : 1), shadowRy = 7 * sc;
  return union(box, [FRAME.w / 2 - shadowRx, FRAME.ground - shadowRy, FRAME.w / 2 + shadowRx, FRAME.ground + shadowRy]);
}

/**
 * Render a creature.
 * opts: size (px width), facing ('right' | 'left'), animate (bool), id (svg id prefix),
 *       label (aria), fit (crop the viewBox to the creature instead of the fixed frame),
 *       style (one of RENDER_STYLES; defaults to the global render style)
 */
export function renderCreatureSvg(g, opts = {}) {
  const { size = 200, facing = 'right', animate = true, fit = false } = opts;
  const styleName = RENDER_STYLES.includes(opts.style) ? opts.style : renderStyle;
  const id = opts.id || uid('cr');
  const built = buildCreature(g, id, styleName);
  const chain = placement(built, facing);
  const sc = built.K.size;
  const shadowRx = 36 * sc * (built.hover ? 0.7 : 1), shadowRy = 7 * sc;

  let vb = [0, 0, FRAME.w, FRAME.h];
  if (fit) {
    const b = union(boxThrough(built.box, chain), [FRAME.w / 2 - shadowRx, FRAME.ground - shadowRy, FRAME.w / 2 + shadowRx, FRAME.ground + shadowRy]);
    const pad = 8;
    vb = [b[0] - pad, b[1] - pad, b[2] - b[0] + pad * 2, b[3] - b[1] + pad * 2];
  }
  const height = Math.round((size * vb[3]) / vb[2]);
  const label = opts.label || `${g.name}, ${typeLabel(g)}`;
  const live = animate;
  const delay = live ? ` style="animation-delay:-${num(((g.seed || '').length * 0.37 + (g.traits ? g.traits.size * 3 : 0)) % 3)}s"` : '';
  const clip = built.clip.map((d) => `<path d="${d}"/>`).join('');
  const shadowFill = styleName === 'classic' ? 'var(--k)' : hsl(g.palette.c1[0], 30, 10);

  return `<svg class="cr cr-${styleName}${live ? ' cr-live' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(num).join(' ')}" width="${size}" height="${height}" role="img" aria-label="${escapeHtml(label)}" style="${paletteVars(g.palette)}">` +
    `<defs><clipPath id="${id}-clip">${clip}</clipPath>${built.defs}</defs>` +
    `<ellipse class="cr-shadow" cx="${num(FRAME.w / 2)}" cy="${FRAME.ground}" rx="${num(shadowRx)}" ry="${num(shadowRy)}" fill="${shadowFill}" opacity="0.18"/>` +
    `<g transform="${tf(chain[1])} translate(0 ${num(chain[0].y)})">` +
    `<g class="cr-anim"${delay}>${built.layers.join('')}</g></g></svg>`;
}

/** A neutral mannequin genome used by the Part Lab to preview any single part. */
export function mannequinGenome(part) {
  const rig = getRig(part.rig);
  const m = rig.mannequin;
  const parts = {};
  for (const slot of rig.slots) parts[slot] = [m.parts[slot], m.parts[slot]];
  for (const [slot, pid] of Object.entries(m.forSlot[part.slot] || {})) parts[slot] = [pid, pid];
  if (rig.id === 'legacy' && part.slot === 'body' && part.sockets && !part.sockets.legs.length) parts.legs = ['legs.none', 'legs.none'];
  parts[part.slot] = [part.id, part.id];
  const paint = {};
  if (m.accentSlots.includes(part.slot)) paint[part.slot] = 4; // accent-first
  return {
    v: 1, seed: 'mannequin', species: null, rig: rig.id, name: part.name, gen: 0, shiny: false, types: ['Normal', null],
    parts, paint,
    palette: { c1: [222, 10, 64], c2: [222, 12, 46], c3: [28, 80, 58], eye: [200, 55, 45] },
    traits: { size: 0.6, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: part.slot === 'eyes' ? 0.9 : 0.5 },
    stats: {}, vigor: {}, bst: 400, lineage: [],
  };
}
