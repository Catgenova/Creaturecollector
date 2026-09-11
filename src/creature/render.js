// Genome -> SVG string. Pure: no DOM access, so it runs in Node for tests.
//
// Draw order (back to front): far wing, near wing, tail, back feature, far legs,
// far arm, near legs, near arm, body (+pattern, +face when headless), head
// (crown behind the skull, then eyes and mouth), and front-mounted arms for
// bodies that ask for it. Limbs sit behind the body so their roots are hidden
// by the silhouette, which keeps outlines clean.
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
import { resolveParts, PAINT_PERMS, typeLabel } from './genome.js';

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

/** Piecewise gradient map for a raster part: black -> shade, mid grey -> base, light grey -> light, white -> near white. */
function tintFilter(id, fam) {
  const rgb = ([h, s, l]) => {
    const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100), x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l / 100 - c / 2;
    const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r1 + m, g1 + m, b1 + m];
  };
  const stops = [rgb(fam.shade), rgb(fam.base), rgb(fam.light), rgb([fam.light[0], Math.max(0, fam.light[1] - 20), 95])];
  const table = (i) => stops.map((c) => num(Math.max(0, Math.min(1, c[i])))).join(' ');
  return `<filter id="${id}" color-interpolation-filters="sRGB" x="-5%" y="-5%" width="110%" height="110%">` +
    '<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/>' +
    `<feComponentTransfer><feFuncR type="table" tableValues="${table(0)}"/><feFuncG type="table" tableValues="${table(1)}"/><feFuncB type="table" tableValues="${table(2)}"/></feComponentTransfer></filter>`;
}

function imagePart(part, ctx) {
  if (ctx.mode === 'outline') return '';
  const s = part.scale, [ox, oy] = part.origin;
  const src = (ctx.shared.images && ctx.shared.images[part.id]) || part.img.src;
  let filter = '';
  if (part.tint !== false) {
    const fid = `${ctx.uid}-t-${ctx.slot}${ctx.far ? 'f' : ''}`;
    if (!ctx.shared.grads.has(fid)) {
      const fam = (ctx.colors || ctx.shared.rasterColors(ctx.slot, ctx.far)).p;
      ctx.shared.defs.push(tintFilter(fid, fam));
      ctx.shared.grads.set(fid, true);
    }
    filter = ` filter="url(#${fid})"`;
  }
  return `<image href="${src}" x="${num(-ox * s)}" y="${num(-oy * s)}" width="${num(part.img.w * s)}" height="${num(part.img.h * s)}" preserveAspectRatio="none"${filter}/>`;
}

function partPrimsCtx(part, ctx) {
  if (part.img) return imagePart(part, ctx);
  return part.prims.map((pr) => primSvg(pr, ctx)).join('');
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

/**
 * Approximate bounding box [x0,y0,x1,y1] of a part in its own coordinates.
 * Reads absolute path coordinates (control points included, so it errs large);
 * relative path segments are ignored, which only matters for clipped patterns.
 */
export function partBounds(part) {
  if (part.img) {
    const s = part.scale, [ox, oy] = part.origin;
    return [-ox * s, -oy * s, (part.img.w - ox) * s, (part.img.h - oy) * s];
  }
  if (boundsCache.has(part.id)) return boundsCache.get(part.id);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; };
  for (const pr of part.prims || []) {
    if (pr.t === 'ellipse') { add(pr.cx - pr.rx, pr.cy - pr.ry); add(pr.cx + pr.rx, pr.cy + pr.ry); }
    else if (pr.t === 'circle') { add(pr.cx - pr.r, pr.cy - pr.r); add(pr.cx + pr.r, pr.cy + pr.r); }
    else if (pr.t === 'path' || pr.t === 'line') {
      const abs = pr.d.replace(/[a-z][^A-Za-z]*/g, ' ');
      const nums = (abs.match(/-?\d*\.?\d+/g) || []).map(Number);
      for (let i = 0; i + 1 < nums.length; i += 2) add(nums[i], nums[i + 1]);
    }
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

/**
 * Build the layered markup and measure it. Returns { layers, defs, box, feet, hover, K, body, clip }
 * where box is the creature's bounds in creature space (body centre = 0,0).
 */
function buildCreature(g, id, styleName, images) {
  const st = STYLE[styleName] || STYLE.classic;
  const styled = st !== STYLE.classic;
  const P = resolveParts(g);
  const body = P.body;
  const S = body.sockets;
  const K = traitScales(g.traits);
  K.eye *= st.eye;

  let feet = body.bottom;
  if (P.legs && S.legs) for (const ls of S.legs) feet = Math.max(feet, ls.y + (P.legs.len || 40) * K.leg);
  const hover = body.hover || 0;

  const shared = { n: 0, defs: [], grads: new Map(), images: images || null, rasterColors: (slot, far) => styledColors(g, slot, far, st) };
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

  let box = null;
  const grow = (part, chain) => { box = union(box, boxThrough(partBounds(part), chain)); };

  const assemble = (mode) => {
    const L = [];
    const pp = (part, slot, far = false, extra) => partPrimsCtx(part, ctxFor(slot, far, mode, extra));
    const wrap = (slot, inner) => (styled ? `<g>${inner}</g>` : `<g style="${paintOf(g, slot)}">${inner}</g>`);
    const farWrap = (inner) => (styled ? inner : `<g style="${FAR_VARS}">${inner}</g>`);

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
      if (P.pattern && !body.img) bodyInner += `<g clip-path="url(#${id}-clip)">${pp(P.pattern, 'body', false, { small: true })}</g>`;
      if (st.gloss && !body.img) {
        const b = partBounds(body);
        const w = b[2] - b[0], hh = b[3] - b[1];
        const cx = b[0] + w * 0.34, cy = b[1] + hh * 0.26;
        bodyInner += `<g clip-path="url(#${id}-clip)"><ellipse cx="${num(cx)}" cy="${num(cy)}" rx="${num(w * 0.17)}" ry="${num(hh * 0.09)}" fill="#fff" opacity="0.22" transform="rotate(-24 ${num(cx)} ${num(cy)})"/></g>`;
      }
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
 *       style (one of RENDER_STYLES; defaults to the global render style),
 *       images ({ partId: dataUrl } overrides for raster parts not yet on disk)
 */
export function renderCreatureSvg(g, opts = {}) {
  const { size = 200, facing = 'right', animate = true, fit = false } = opts;
  const styleName = RENDER_STYLES.includes(opts.style) ? opts.style : renderStyle;
  const id = opts.id || uid('cr');
  const built = buildCreature(g, id, styleName, opts.images);
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
  const delay = animate ? ` style="animation-delay:-${num(((g.seed || '').length * 0.37 + (g.traits ? g.traits.size * 3 : 0)) % 3)}s"` : '';
  const clip = built.clip.map((d) => `<path d="${d}"/>`).join('');
  const shadowFill = styleName === 'classic' ? 'var(--k)' : hsl(g.palette.c1[0], 30, 10);

  return `<svg class="cr cr-${styleName}${animate ? ' cr-live' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(num).join(' ')}" width="${size}" height="${height}" role="img" aria-label="${escapeHtml(label)}" style="${paletteVars(g.palette)}">` +
    `<defs><clipPath id="${id}-clip">${clip}</clipPath>${built.defs}</defs>` +
    `<ellipse class="cr-shadow" cx="${num(FRAME.w / 2)}" cy="${FRAME.ground}" rx="${num(shadowRx)}" ry="${num(shadowRy)}" fill="${shadowFill}" opacity="0.18"/>` +
    `<g transform="${tf(chain[1])} translate(0 ${num(chain[0].y)})">` +
    `<g class="cr-anim"${delay}>${built.layers.join('')}</g></g></svg>`;
}

/** A neutral mannequin genome used by the Part Lab to preview any single part. */
export function mannequinGenome(part) {
  const parts = {
    body: ['body.round', 'body.round'], head: ['head.round', 'head.round'], eyes: ['eye.round', 'eye.round'], mouth: ['mouth.smile', 'mouth.smile'],
    crown: ['crown.none', 'crown.none'], legs: ['legs.stub', 'legs.stub'], arms: ['arms.none', 'arms.none'], wings: ['wings.none', 'wings.none'],
    tail: ['tail.none', 'tail.none'], back: ['back.none', 'back.none'], pattern: ['pattern.none', 'pattern.none'],
  };
  const paint = {};
  if (part.slot === 'arms') parts.body = ['body.biped', 'body.biped'];
  if (part.slot === 'wings' || part.slot === 'tail' || part.slot === 'back') parts.body = ['body.quad', 'body.quad'];
  if (part.slot === 'eyes' || part.slot === 'mouth') parts.head = ['head.bulb', 'head.bulb'];
  if (part.slot === 'body' && part.sockets && !part.sockets.legs.length) parts.legs = ['legs.none', 'legs.none'];
  parts[part.slot] = [part.id, part.id];
  if (!['body', 'pattern', 'eyes', 'mouth'].includes(part.slot)) paint[part.slot] = 4; // accent-first
  return {
    v: 1, seed: 'mannequin', species: null, name: part.name, gen: 0, shiny: false, types: ['Normal', null],
    parts, paint,
    palette: { c1: [222, 10, 64], c2: [222, 12, 46], c3: [28, 80, 58], eye: [200, 55, 45] },
    traits: { size: 0.6, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: part.slot === 'eyes' ? 0.9 : 0.5 },
    stats: {}, vigor: {}, bst: 400, lineage: [],
  };
}
