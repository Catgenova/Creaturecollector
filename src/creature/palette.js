// Palette genes -> CSS custom properties. Every part references abstract roles
// (p/s/a and their shades); the per-slot paint gene decides which of the
// creature's three colours each role maps to. That is how one part gets
// recoloured differently on different creatures.
import { hsl, clamp, wrapHue } from '../core/util.js';

export const COLOR_KEYS = ['c1', 'c2', 'c3'];

/** Root CSS variables for a creature: the three colour families, eye colour, outline and whites. */
export function paletteVars(pal) {
  const v = [];
  for (const k of COLOR_KEYS) {
    const [h, s, l] = pal[k];
    v.push(`--${k}:${hsl(h, s, l)}`, `--${k}d:${hsl(h, Math.min(100, s + 6), l - 14)}`, `--${k}l:${hsl(h, Math.max(0, s - 8), Math.min(96, l + 14))}`);
  }
  const [eh, es, el] = pal.eye;
  v.push(`--e:${hsl(eh, es, el)}`, `--ed:${hsl(eh, es, el - 16)}`);
  const [h1, s1] = pal.c1;
  const ol = hsl(h1, Math.min(s1, 45), 13);
  const hue = Math.round(wrapHue(h1));
  v.push(`--ol:${ol}`, `--k:${ol}`, `--w:hsl(${hue} 20% 97%)`, `--wd:hsl(${hue} 15% 80%)`);
  return v.join(';');
}

/** Per-slot role mapping. perm = indexes into [c1,c2,c3] for roles [p,s,a]. */
export function slotPaintVars(perm) {
  const [p, s, a] = perm.map((i) => COLOR_KEYS[i]);
  return `--p:var(--${p});--pd:var(--${p}d);--pl:var(--${p}l);--s:var(--${s});--sd:var(--${s}d);--sl:var(--${s}l);--a:var(--${a});--ad:var(--${a}d);--al:var(--${a}l)`;
}

/** Applied to far-side copies (far legs, far wing, far eye): everything one shade darker. */
export const FAR_VARS = '--p:var(--pd);--pl:var(--pd);--s:var(--sd);--sl:var(--sd);--a:var(--ad);--al:var(--ad);--w:var(--wd);--e:var(--ed)';

function jitterColor([h, s, l], vary, rng, sharedHue) {
  return [
    wrapHue(h + sharedHue + rng.gauss() * vary.h * 0.5),
    clamp(s + rng.gauss() * vary.s, 8, 100),
    clamp(l + rng.gauss() * vary.l, 12, 92),
  ].map((x) => Math.round(x * 10) / 10);
}

/** Genetic roll on a species palette: a shared hue drift plus small independent wobble per colour. */
export function jitterPalette(base, vary, rng) {
  const v = { h: 10, s: 8, l: 6, ...(vary || {}) };
  const sharedHue = rng.gauss() * v.h;
  return {
    c1: jitterColor(base.c1, v, rng, sharedHue),
    c2: jitterColor(base.c2, v, rng, sharedHue),
    c3: jitterColor(base.c3, v, rng, sharedHue),
    eye: jitterColor(base.eye, v, rng, 0),
  };
}

/** Rare recolour: rotate the whole palette to a new harmony. */
export function shinyPalette(pal, rng) {
  const rot = rng.range(140, 220);
  const out = {};
  for (const k of ['c1', 'c2', 'c3', 'eye']) {
    const [h, s, l] = pal[k];
    out[k] = [wrapHue(h + rot), clamp(s + 5, 8, 100), l].map((x) => Math.round(x * 10) / 10);
  }
  return out;
}

/** Blend two palettes colour by colour. t=0 -> a, t=1 -> b. Hues take the short way round. */
export function blendColor(a, b, t) {
  let dh = wrapHue(b[0]) - wrapHue(a[0]);
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return [wrapHue(a[0] + dh * t), a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map((x) => Math.round(x * 10) / 10);
}

export function swatchCss([h, s, l]) { return hsl(h, s, l); }
