// Raster (image) parts: AI-drawn PNGs assembled by the engine. Each entry maps
// pixel coordinates to creature space through `origin` (the pixel that sits on
// the parent's socket) and `scale` (creature units per pixel). Sockets are
// authored in pixel coordinates and converted here. Raster parts only combine
// with raster parts of the same class rig, never with vector parts.
//
// Kinds are 'r-<clade>'. Slots reuse the vector slot names:
//   body, head, crown, legs, arms, wings, tail, back  (eyes, mouth, pattern are baked into images)
//
// Records are added as images arrive; anchors come from the Art tab's "Copy entry".
export const RASTER_RECORDS = [
  // Mammal style test: grey fox drawn by ChatGPT image generation, 640px assets.
  { id: 'r.mammal.body.fox', clade: 'mammal', slot: 'body', name: 'fox', img: { src: 'assets/parts/mammal/body/fox.png', w: 640, h: 326 },
    origin: [330, 180], scale: 0.16, sockets: { head: { x: 548, y: 34 }, legFront: { x: 520, y: 235 }, legBack: { x: 140, y: 240 }, tail: { x: 25, y: 170 }, back: { x: 300, y: 55 }, wing: { x: 240, y: 100 } }, dom: 0.55, weight: 3 },
  { id: 'r.mammal.head.fox', clade: 'mammal', slot: 'head', name: 'fox', img: { src: 'assets/parts/mammal/head/fox.png', w: 543, h: 640 },
    origin: [340, 530], scale: 0.1, sockets: { crown: { x: 300, y: 130 } }, dom: 0.55, weight: 3 },
  { id: 'r.mammal.legs.fox', clade: 'mammal', slot: 'legs', name: 'fox', img: { src: 'assets/parts/mammal/legs/fox.png', w: 221, h: 640 },
    origin: [125, 30], scale: 0.085, dom: 0.5, weight: 3 },
];

/** Default anchor and size guesses for a freshly uploaded image, by slot. */
export function rasterDefaults(slot, w, h) {
  const d = {
    body: { origin: [w * 0.5, h * 0.55], target: 100 },
    head: { origin: [w * 0.5, h * 0.92], target: 52 },
    legs: { origin: [w * 0.5, h * 0.08], target: 22 },
    arms: { origin: [w * 0.1, h * 0.2], target: 30 },
    wings: { origin: [w * 0.92, h * 0.85], target: 70 },
    tail: { origin: [w * 0.92, h * 0.5], target: 60 },
    back: { origin: [w * 0.5, h * 0.92], target: 50 },
    crown: { origin: [w * 0.5, h * 0.95], target: 40 },
  }[slot] || { origin: [w / 2, h / 2], target: 60 };
  return { origin: d.origin.map(Math.round), scale: d.target / w };
}

/** Build a raster part from an editor record. Converts pixel sockets to creature units. */
export function rasterPart(rec) {
  const { id, clade, slot, name, img, tint = true, dom = 0.5, weight = 2, hover = 0 } = rec;
  const d = rasterDefaults(slot, img.w, img.h);
  const origin = rec.origin || d.origin;
  const scale = rec.scale || d.scale;
  const cv = (px) => (px ? { ...px, x: (px.x - origin[0]) * scale, y: (px.y - origin[1]) * scale } : null);
  const part = { id, slot, kind: `r-${clade}`, clade, name: name || id, img: { src: img.src, w: img.w, h: img.h }, origin, scale, dom, w: weight, fit: [`r-${clade}`], tint, prims: [], pxSockets: rec.sockets || {} };
  const px = rec.sockets || {};
  if (slot === 'body') {
    part.bottom = rec.bottom != null ? rec.bottom : (img.h - origin[1]) * scale;
    part.hover = hover;
    part.clip = [];
    const legs = [];
    if (px.legFront) legs.push({ ...cv(px.legFront), far: { dx: -8, dy: -4 } });
    if (px.legBack) legs.push({ ...cv(px.legBack), far: { dx: -8, dy: -4 } });
    part.sockets = {
      head: px.head ? { a: 0, s: 1, ...cv(px.head) } : null,
      face: null,
      legs,
      arm: cv(px.arm), wing: cv(px.wing),
      tail: px.tail ? { a: 0, ...cv(px.tail) } : null,
      back: px.back ? { a: 0, ...cv(px.back) } : null,
    };
  } else if (slot === 'head') {
    part.sockets = { eye: null, eye2: null, mouth: null, crown: px.crown ? { a: 0, s: 1, ...cv(px.crown) } : null };
  } else if (slot === 'legs') {
    part.len = rec.len != null ? rec.len : (img.h - origin[1]) * scale;
  }
  return part;
}

/** Anchors the editor asks for, per slot. 'origin' is always first. */
export const RASTER_ANCHORS = {
  body: ['origin', 'head', 'legFront', 'legBack', 'tail', 'back', 'wing', 'arm'],
  head: ['origin', 'crown'],
  legs: ['origin'], arms: ['origin'], wings: ['origin'], tail: ['origin'], back: ['origin'], crown: ['origin'],
};

export const RASTER_PARTS = RASTER_RECORDS.map(rasterPart);
