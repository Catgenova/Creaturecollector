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
import { lerp, num, uid, escapeHtml } from '../core/util.js';
import { paletteVars, slotPaintVars, FAR_VARS } from './palette.js';
import { resolveParts, PAINT_PERMS, typeLabel } from './genome.js';

export const FRAME = { w: 200, h: 230, ground: 208 };
const FAR_DEFAULT = { dx: -6, dy: -4 };

function fillAttr(f) { return f === 'none' ? 'none' : `var(--${f})`; }

function primSvg(pr) {
  const cls = pr.ns ? '' : ' class="o"';
  const style = pr.sw != null && !pr.ns ? ` style="stroke-width:${num(pr.sw)}"` : '';
  const op = pr.op != null ? ` opacity="${num(pr.op)}"` : '';
  switch (pr.t) {
    case 'path': return `<path${cls} d="${pr.d}" fill="${fillAttr(pr.f)}"${style}${op}/>`;
    case 'ellipse': return `<ellipse${cls} cx="${num(pr.cx)}" cy="${num(pr.cy)}" rx="${num(pr.rx)}" ry="${num(pr.ry)}" fill="${fillAttr(pr.f)}"${style}${op}/>`;
    case 'circle': return `<circle${cls} cx="${num(pr.cx)}" cy="${num(pr.cy)}" r="${num(pr.r)}" fill="${fillAttr(pr.f)}"${style}${op}/>`;
    case 'line': return `<path d="${pr.d}" fill="none" stroke="var(--${pr.f})" stroke-width="${num(pr.w)}" stroke-linecap="round" stroke-linejoin="round"${op}/>`;
    default: return '';
  }
}

export function partPrims(part) { return part.prims.map(primSvg).join(''); }

// ---- bounds -----------------------------------------------------------------

const boundsCache = new Map();

/**
 * Approximate bounding box [x0,y0,x1,y1] of a part in its own coordinates.
 * Reads absolute path coordinates (control points included, so it errs large);
 * relative path segments are ignored, which only matters for clipped patterns.
 */
export function partBounds(part) {
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
 * Build the layered markup and measure it. Returns { layers, box, feet, hover, K, body, clip }
 * where box is the creature's bounds in creature space (body centre = 0,0).
 */
function buildCreature(g, id) {
  const P = resolveParts(g);
  const body = P.body;
  const S = body.sockets;
  const K = traitScales(g.traits);

  let feet = body.bottom;
  if (P.legs && S.legs) for (const ls of S.legs) feet = Math.max(feet, ls.y + (P.legs.len || 40) * K.leg);
  const hover = body.hover || 0;

  const L = [];
  let box = null;
  const grow = (part, chain) => { box = union(box, boxThrough(partBounds(part), chain)); };

  if (P.wings && S.wing) {
    const w = partPrims(P.wings);
    const tn = xf(S.wing.x, S.wing.y, 0, K.wing), tfar = xf(S.wing.x - 6, S.wing.y - 6, 0, K.wing);
    grow(P.wings, [tn]); grow(P.wings, [tfar]);
    L.push(`<g style="${paintOf(g, 'wings')}">` +
      `<g transform="${tf(tfar)}"><g class="g-wing" style="${FAR_VARS}">${w}</g></g>` +
      `<g transform="${tf(tn)}"><g class="g-wing">${w}</g></g></g>`);
  }
  if (P.tail && S.tail) {
    const t = xf(S.tail.x, S.tail.y, S.tail.a, K.tail);
    grow(P.tail, [t]);
    L.push(`<g style="${paintOf(g, 'tail')}"><g transform="${tf(t)}"><g class="g-tail">${partPrims(P.tail)}</g></g></g>`);
  }
  if (P.back && S.back) {
    const t = xf(S.back.x, S.back.y, S.back.a);
    grow(P.back, [t]);
    L.push(`<g style="${paintOf(g, 'back')}"><g transform="${tf(t)}">${partPrims(P.back)}</g></g>`);
  }
  if (P.legs && S.legs && S.legs.length) {
    const lp = partPrims(P.legs);
    let far = '', near = '';
    for (const ls of S.legs) {
      const f = ls.far || FAR_DEFAULT;
      const tfar = xf(ls.x + f.dx, ls.y + f.dy, 0, K.leg), tn = xf(ls.x, ls.y, 0, K.leg);
      grow(P.legs, [tfar]); grow(P.legs, [tn]);
      far += `<g transform="${tf(tfar)}" style="${FAR_VARS}">${lp}</g>`;
      near += `<g transform="${tf(tn)}">${lp}</g>`;
    }
    L.push(`<g style="${paintOf(g, 'legs')}">${far}${near}</g>`);
  }
  const armsFront = Boolean(body.armsFront);
  const armSvg = () => {
    const ap = partPrims(P.arms);
    const tn = xf(S.arm.x, S.arm.y), tfar = xf(S.arm.x - 14, S.arm.y - 3);
    grow(P.arms, [tn]);
    let s = `<g style="${paintOf(g, 'arms')}">`;
    if (!armsFront) { grow(P.arms, [tfar]); s += `<g transform="${tf(tfar)}" style="${FAR_VARS}">${ap}</g>`; }
    return s + `<g transform="${tf(tn)}">${ap}</g></g>`;
  };
  if (P.arms && S.arm && !armsFront) L.push(armSvg());

  // Face: crown behind the skull, then far eye, near eye, mouth. `outer` is the
  // transform chain of whatever the face sits on (head or body).
  const face = (F, outer) => {
    let behind = '', front = '';
    if (P.crown && F.crown) {
      const t = xf(F.crown.x, F.crown.y, F.crown.a, F.crown.s == null ? 1 : F.crown.s);
      grow(P.crown, [t, ...outer]);
      behind += `<g style="${paintOf(g, 'crown')}"><g transform="${tf(t)}">${partPrims(P.crown)}</g></g>`;
    }
    if (P.eyes) {
      const ep = partPrims(P.eyes);
      if (F.eye2) {
        const t = xf(F.eye2.x, F.eye2.y, 0, (F.eye2.s == null ? 0.85 : F.eye2.s) * K.eye);
        grow(P.eyes, [t, ...outer]);
        front += `<g transform="${tf(t)}" style="${FAR_VARS}">${ep}</g>`;
      }
      if (F.eye) {
        const t = xf(F.eye.x, F.eye.y, 0, (F.eye.s == null ? 1 : F.eye.s) * K.eye);
        grow(P.eyes, [t, ...outer]);
        front += `<g transform="${tf(t)}">${ep}</g>`;
      }
    }
    if (P.mouth && F.mouth) {
      const t = xf(F.mouth.x, F.mouth.y, 0, F.mouth.s == null ? 1 : F.mouth.s);
      grow(P.mouth, [t, ...outer]);
      front += `<g transform="${tf(t)}">${partPrims(P.mouth)}</g>`;
    }
    return { behind, front };
  };

  const headless = !P.head || !S.head;
  const bodyFace = headless && S.face ? face(S.face, []) : null;
  grow(body, []);
  let bodyInner = bodyFace ? bodyFace.behind : '';
  bodyInner += partPrims(body);
  if (P.pattern) bodyInner += `<g clip-path="url(#${id}-clip)">${partPrims(P.pattern)}</g>`;
  if (bodyFace) bodyInner += bodyFace.front;
  L.push(`<g class="g-body" style="${paintOf(g, 'body')}">${bodyInner}</g>`);

  if (P.arms && S.arm && armsFront) L.push(armSvg());

  if (!headless) {
    const hs = S.head;
    const th = xf(hs.x, hs.y, hs.a, (hs.s == null ? 1 : hs.s) * K.head);
    grow(P.head, [th]);
    const hf = face(P.head.sockets, [th]);
    L.push(`<g style="${paintOf(g, 'head')}"><g transform="${tf(th)}"><g class="g-head">${hf.behind}${partPrims(P.head)}${hf.front}</g></g></g>`);
  }

  return { layers: L, box: box || [-40, -40, 40, 40], feet, hover, K, body, clip: body.clip || [] };
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
  const built = buildCreature(g, 'm');
  const chain = placement(built, facing);
  const box = boxThrough(built.box, chain);
  const sc = built.K.size;
  const shadowRx = 36 * sc * (built.hover ? 0.7 : 1), shadowRy = 7 * sc;
  return union(box, [FRAME.w / 2 - shadowRx, FRAME.ground - shadowRy, FRAME.w / 2 + shadowRx, FRAME.ground + shadowRy]);
}

/**
 * Render a creature.
 * opts: size (px width), facing ('right' | 'left'), animate (bool), id (svg id prefix),
 *       label (aria), fit (crop the viewBox to the creature instead of the fixed frame)
 */
export function renderCreatureSvg(g, opts = {}) {
  const { size = 200, facing = 'right', animate = true, fit = false } = opts;
  const id = opts.id || uid('cr');
  const built = buildCreature(g, id);
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

  return `<svg class="cr${animate ? ' cr-live' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(num).join(' ')}" width="${size}" height="${height}" role="img" aria-label="${escapeHtml(label)}" style="${paletteVars(g.palette)}">` +
    `<defs><clipPath id="${id}-clip">${clip}</clipPath></defs>` +
    `<ellipse class="cr-shadow" cx="${num(FRAME.w / 2)}" cy="${FRAME.ground}" rx="${num(shadowRx)}" ry="${num(shadowRy)}" fill="var(--k)" opacity="0.18"/>` +
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
