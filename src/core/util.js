// Small shared helpers. No game logic here.

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const clamp01 = (v) => clamp(v, 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;
export const round1 = (v) => Math.round(v * 10) / 10;
export const round3 = (v) => Math.round(v * 1000) / 1000;
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

/** Wrap a hue into [0,360). */
export const wrapHue = (h) => ((h % 360) + 360) % 360;

/** Shortest signed distance from hue a to hue b, in (-180, 180]. */
export function hueDelta(a, b) {
  let d = wrapHue(b) - wrapHue(a);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/** Move hue h toward target by fraction t along the shortest arc. */
export function mixHue(h, target, t) { return wrapHue(h + hueDelta(h, target) * t); }

export const hsl = (h, s, l) => `hsl(${Math.round(wrapHue(h))} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 0, 100))}%)`;

/** Normalize an object of positive weights so its values sum to 1. */
export function normalizeWeights(obj) {
  const keys = Object.keys(obj);
  const total = sum(keys.map((k) => Math.max(0, obj[k])));
  const out = {};
  for (const k of keys) out[k] = total > 0 ? Math.max(0, obj[k]) / total : 1 / keys.length;
  return out;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Format a number for SVG attributes: short, stable, never "-0". */
export function num(v) {
  const r = Math.round(v * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
}

let uidCounter = 0;
/** Unique id fragment for DOM/SVG ids within a page lifetime. */
export function uid(prefix = 'u') { return `${prefix}${(++uidCounter).toString(36)}`; }

// base64url of UTF-8 text, works in browsers and Node.
export function b64uEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64uDecode(s) {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

export function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
