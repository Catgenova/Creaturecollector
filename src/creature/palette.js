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

// ---- perceptual distance and accent contrast -------------------------------------
//
// Accents have to read as accents: an accent within a few steps of the primary or the
// secondary vanishes into the coat. harmonizePalette measures the three colours in CIE
// Lab (an approximation good enough for "can you tell these apart") and, when the accent
// sits too close to either base colour, moves it by the smallest perceptual step that
// clears both thresholds. It is deterministic and idempotent, so it is safe to run on
// every roll, every fusion and every load.

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

function rgbToLab([r, g, b]) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  r = lin(r); g = lin(g); b = lin(b);
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** CIE Lab coordinates of an [h, s, l] colour. */
export function labOf([h, s, l]) { return rgbToLab(hslToRgb(wrapHue(h), clamp(s, 0, 100), clamp(l, 0, 100))); }

/** Approximate perceptual distance (CIE76 delta E) between two [h, s, l] colours. About 2 is just noticeable; 30 is clearly a different colour. */
export function colorDistance(a, b) {
  const p = labOf(a), q = labOf(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/** Minimum perceptual distance the accent keeps from the primary and the secondary colour. */
export const ACCENT_CONTRAST = { primary: 30, secondary: 24 };

const HARMONY_HUES = [0, 20, -20, 40, -40, 60, -60, 90, -90, 120, -120, 150, -150, 180];
const HARMONY_LIGHT = [[0, 0], [0, 10], [0, -10], [0, 20], [0, -20], [0, 30], [0, -30], [1, 20], [1, 50], [1, 80]]; // [absolute?, value]
const HARMONY_SAT = [[0, 0], [0, 20], [0, 40], [0, -20], [1, 90]];

/** Does the accent of this palette clear the contrast thresholds against both base colours? */
export function accentContrastOk(pal) {
  return colorDistance(pal.c3, pal.c1) >= ACCENT_CONTRAST.primary && colorDistance(pal.c3, pal.c2) >= ACCENT_CONTRAST.secondary;
}

/**
 * Enforce accent contrast. Returns the palette itself when it already complies, else a copy
 * whose accent has been moved by the smallest perceptual step (searching hue, lightness and
 * saturation adjustments) that clears both thresholds. Deterministic and idempotent.
 */
export function harmonizePalette(pal) {
  if (!pal || !Array.isArray(pal.c1) || !Array.isArray(pal.c2) || !Array.isArray(pal.c3)) return pal;
  if (accentContrastOk(pal)) return pal;
  const [h, s, l] = pal.c3;
  const P = labOf(pal.c1), S = labOf(pal.c2), A = labOf(pal.c3);
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  let best = null, bestCost = Infinity, fallback = null, fallbackScore = -Infinity;
  for (const dh of HARMONY_HUES) {
    for (const [absL, vl] of HARMONY_LIGHT) {
      for (const [absS, vs] of HARMONY_SAT) {
        const cand = [wrapHue(h + dh), clamp(absS ? vs : s + vs, 8, 100), clamp(absL ? vl : l + vl, 12, 92)].map((x) => Math.round(x * 10) / 10);
        const lab = labOf(cand);
        const dP = dist(lab, P) - ACCENT_CONTRAST.primary, dS = dist(lab, S) - ACCENT_CONTRAST.secondary;
        const cost = dist(lab, A);
        if (dP >= 0 && dS >= 0) { if (cost < bestCost) { best = cand; bestCost = cost; } }
        else { const score = Math.min(dP, dS) - cost * 0.05; if (score > fallbackScore) { fallback = cand; fallbackScore = score; } }
      }
    }
  }
  return { ...pal, c3: best || fallback };
}
