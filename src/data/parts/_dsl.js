// Tiny drawing DSL for creature parts.
//
// Every part is authored facing RIGHT in a local coordinate system whose origin
// (0,0) is the point that attaches to the parent's socket. Units are the same as
// the 200x200 creature canvas at scale 1.
//
// Fill roles (resolved to CSS variables at render time, remapped per slot by paint genes):
//   p / pd / pl   primary colour, its shade, its highlight
//   s / sd / sl   secondary colour family
//   a / ad / al   accent colour family
//   w / wd        white and its shade         e / ed   eye colour and its shade
//   k             outline/dark                none     no fill (stroke only)
//
// Options: op (opacity), ns (no outline stroke), sw (outline stroke width override).

export const P = (d, f = 'p', o = {}) => ({ t: 'path', d, f, ...o });
export const E = (cx, cy, rx, ry, f = 'p', o = {}) => ({ t: 'ellipse', cx, cy, rx, ry, f, ...o });
export const C = (cx, cy, r, f = 'p', o = {}) => ({ t: 'circle', cx, cy, r, f, ...o });
/** Stroke-only path. f is the stroke role, w the stroke width. */
export const L = (d, f = 'k', w = 3, o = {}) => ({ t: 'line', d, f, w, ...o });

/** Convenience for a "none" part in an optional slot. */
export const NONE = (slot, dom = 0.35) => ({ id: `${slot}.none`, slot, name: 'None', none: true, dom, w: 1 });
