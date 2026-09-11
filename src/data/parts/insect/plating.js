// Insect shells (wing cases and back armour over the abdomen; origin = the body's shell socket)
// and patterns (clipped to the body, authored in the 100 x 60 frame).
import { iPart } from './_shared.js';
import { NONE, S, L, P, C, SH, HL, fur } from '../_dsl.js';

export const I_SHELLS = [
  NONE('shell', 0.3, 'i.'),
  iPart({ id: 'elytra', slot: 'shell', name: 'Wing cases', tags: ['beetle'], dom: 0.55, w: 3, shapes: [[[22, -8], [8, -16], [-16, -16], [-32, -8], [-30, 4], [-16, 10], [4, 10], [20, 4]]], extra: [L('M20,-2 C4,-4 -14,-4 -30,-2', 'k', 1.6, { op: 0.5 }), HL('M4,-14 C-6,-15 -20,-12 -26,-6 L-22,-2 C-16,-8 -6,-10 4,-10 Z', 0.2), SH('M-32,2 C-16,10 4,12 20,6 L20,14 L-32,14 Z', 0.12)] }),
  iPart({ id: 'dome', slot: 'shell', name: 'Dome', tags: ['ladybug'], dom: 0.55, w: 2, extra: [L('M18,-6 C10,-14 -10,-18 -26,-10 C-32,-4 -30,4 -24,10', 'k', 1.8, { op: 0.45 }), L('M-4,-17 L-6,12', 'k', 1.8, { op: 0.5 }), HL('M6,-14 C-4,-16 -18,-12 -24,-6 L-20,-2 C-14,-8 -4,-10 6,-10 Z', 0.22)] }),
  iPart({ id: 'armour', slot: 'shell', name: 'Armour plates', tags: ['hard'], dom: 0.5, w: 2, shapes: [[[22, -8], [8, -16], [-16, -16], [-32, -8], [-30, 4], [-16, 10], [4, 10], [20, 4]]], extra: [L('M12,-14 C10,-4 10,4 14,10 M-4,-16 C-6,-4 -6,4 -2,10 M-20,-14 C-22,-4 -22,4 -18,8', 'k', 1.4, { op: 0.4 }), HL('M6,-14 C-2,-14 -10,-13 -14,-10 L-12,-6 C-8,-9 -2,-10 6,-10 Z', 0.2)] }),
  iPart({ id: 'spiky', slot: 'shell', name: 'Spiked carapace', tags: ['spiky'], dom: 0.5, w: 2, shapes: [[[22, -8], ...fur([22, -8], [-32, -8], 5, 10, { tip: 'c', lean: 0.3 }), [-30, 4], [-16, 10], [4, 10], [20, 4]]], extra: [SH('M-32,2 C-16,10 4,12 20,6 L20,14 L-32,14 Z', 0.12)] }),
  iPart({ id: 'fuzz', slot: 'shell', name: 'Fuzz', tags: ['bee', 'fuzzy'], dom: 0.45, w: 2, shapes: [[[22, -4], ...fur([22, -4], [2, -10], 4, 6, { tip: 0.5, lean: 0.1, wobble: 0.3 }), [-2, -2], [2, 6], [14, 8], [24, 4]]], extra: [S([[18, -2], [10, -6], [2, -4], [4, 2], [14, 4]], 's', { ns: true, cl: true, op: 0.4 })] }),
  iPart({ id: 'crystal', slot: 'shell', name: 'Crystal back', tags: ['gem'], dom: 0.45, w: 1, extra: [P('M16,4 L12,-8 L4,-20 L-4,-8 L-6,4 Z', 'pl'), P('M-6,4 L-10,-12 L-18,-24 L-26,-10 L-28,4 Z', 'p'), HL('M4,-18 L8,-8 L4,-6 Z M-18,-22 L-12,-10 L-16,-8 Z', 0.35)] }),
  iPart({ id: 'leaf', slot: 'shell', name: 'Leaf back', tags: ['grass', 'camouflage'], dom: 0.45, w: 1, shapes: [[[24, -4], [8, -16], [-14, -18], [-34, -10, 'c'], [-20, -2], [-32, 6, 'c'], [-12, 10], [8, 10]]], extra: [L('M22,-4 C6,-6 -12,-6 -30,-2', 'k', 1.4, { op: 0.4 }), L('M6,-6 L2,-14 M-6,-6 L-10,-15 M-18,-4 L-22,-12', 'k', 1, { op: 0.3 })] }),
];

export const I_PATTERNS = [
  NONE('pattern', 0.3, 'i.'),
  iPart({ id: 'stripes', slot: 'pattern', name: 'Stripes', tags: ['bee'], dom: 0.5, w: 3, extra: [S([[-30, -40], [-18, -40], [-20, 40], [-32, 40]], 'a', { ns: true }), S([[-4, -40], [8, -40], [6, 40], [-6, 40]], 'a', { ns: true }), S([[20, -40], [32, -40], [30, 40], [18, 40]], 'a', { ns: true })] }),
  iPart({ id: 'spots', slot: 'pattern', name: 'Spots', tags: ['ladybug'], dom: 0.5, w: 3, extra: [...[[-30, -12, 6], [-8, -22, 5], [14, -14, 6], [34, -20, 4.5], [-18, 10, 5], [8, 8, 5.5], [30, 6, 4]].map(([x, y, r]) => ({ t: 'circle', cx: x, cy: y, r, f: 'a', ns: true }))] }),
  iPart({ id: 'bands', slot: 'pattern', name: 'Bands', tags: ['ringed'], dom: 0.5, w: 2, extra: [S([[-44, -40], [-36, -40], [-38, 40], [-46, 40]], 'a', { ns: true }), S([[-22, -40], [-14, -40], [-16, 40], [-24, 40]], 'a', { ns: true }), S([[0, -40], [8, -40], [6, 40], [-2, 40]], 'a', { ns: true }), S([[22, -40], [30, -40], [28, 40], [20, 40]], 'a', { ns: true })] }),
  iPart({ id: 'chevrons', slot: 'pattern', name: 'Chevrons', tags: ['arrows'], dom: 0.45, w: 2, extra: [L('M-36,-16 L-26,0 L-36,16 M-20,-16 L-10,0 L-20,16 M-4,-16 L6,0 L-4,16 M12,-16 L22,0 L12,16 M28,-16 L38,0 L28,16', 'a', 3.2)] }),
  iPart({ id: 'eyespots', slot: 'pattern', name: 'Eyespots', tags: ['moth'], dom: 0.45, w: 2, extra: [...[[-24, -8], [16, -10]].flatMap(([x, y]) => [{ t: 'ellipse', cx: x, cy: y, rx: 11, ry: 9, f: 'a', ns: true }, { t: 'ellipse', cx: x, cy: y, rx: 6.5, ry: 5.5, f: 's', ns: true }, { t: 'circle', cx: x + 1, cy: y, r: 3, f: 'k', ns: true, op: 0.7 }])] }),
  iPart({ id: 'gradient', slot: 'pattern', name: 'Dark back', tags: ['gradient'], dom: 0.5, w: 2, extra: [S([[-54, -40], [54, -40], [54, -12], [26, 0], [-8, 2], [-36, -2], [-56, -12]], 'a', { ns: true }), S([[-46, -40], [46, -40], [46, -26], [22, -16], [-6, -14], [-30, -18], [-48, -26]], 'k', { ns: true, op: 0.12 })] }),
  iPart({ id: 'speckles', slot: 'pattern', name: 'Speckles', tags: ['texture'], dom: 0.45, w: 2, extra: [...Array.from({ length: 24 }, (_, i) => { const x = -44 + (i % 8) * 12 + (Math.floor(i / 8) % 2 ? 6 : 0), y = -22 + Math.floor(i / 8) * 18; return { t: 'circle', cx: x, cy: y, r: 2, f: 's', ns: true, op: 0.8 }; })] }),
];
