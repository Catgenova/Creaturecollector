// Insect wings (origin = wing root on the thorax top; wings rise up and back), legs (origin = the
// coxa on the body's underside; jointed sticks that reach the ground) and tail tips (abdomen end).
// Evolutions: wings grow accent tips and veins, then a larger copy layered behind; legs grow accent
// joints, then spurs, claws and a bigger frame; tails grow longer stings, brighter lanterns, extra
// prongs, spiked clubs and layered plumes.
import { iPart, stick } from './_shared.js';
import { NONE, S, L, P, C, E, SH, HL, xfPts } from '../_dsl.js';
import { sparklePath } from '../_sigils.js';
import { evoRing } from '../_evo.js';

const veins = (d, op = 0.3) => L(d, 'k', 1, { op });
const accentVeins = (d) => L(d, 'a', 1.2, { ns: true, op: 0.6 });
const wingDots = (pts, r = 2.4) => pts.map(([x, y]) => C(x, y, r, 'a', { ns: true }));
/** Shared wing evolution: accent veins and tip beads, then a larger copy behind and bigger beads. */
const iWingStages = (pts, veinD, tips, k = 1.25) => ({
  2: { grow: [1.12, 1.12], add: [accentVeins(veinD), ...wingDots(tips, 2.4)] },
  3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(pts, { sx: k, sy: k }), f: 'pd' }], add: [...wingDots(tips, 3)] },
});

const iwClear = [[0, 0], [-4, -14], [-14, -30], [-30, -40], [-46, -38, 0.3], [-40, -24], [-26, -10], [-10, 2]];
const iwLong = [[0, 0], [-2, -10], [-16, -22], [-44, -34], [-72, -38, 0.3], [-68, -28], [-46, -18], [-20, -8], [-8, 2]];
const iwMoth = [[0, 0], [-2, -16], [-14, -36], [-36, -50], [-60, -50, 0.3], [-56, -32], [-44, -18], [-52, -6, 0.3], [-36, 2], [-16, 4]];
const iwButterfly = [[0, 0], [-2, -18], [-12, -40], [-30, -56, 0.3], [-58, -54, 0.3], [-52, -34], [-38, -22], [-48, -12, 0.3], [-56, 4, 0.3], [-40, 8], [-20, 6]];
const iwBeetle = [[0, 0], [-2, -8], [-14, -20], [-34, -26], [-48, -22, 0.3], [-40, -12], [-26, -4], [-12, 2]];
const iwLacewing = [[0, 0], [-4, -12], [-18, -28], [-40, -40], [-60, -40, 0.3], [-54, -26], [-38, -12], [-16, 2]];
const iwFairy = [[0, 0], [-2, -16], [-12, -38], [-32, -52, 0.3], [-50, -46, 0.3], [-44, -28], [-34, -16], [-46, -4, 0.3], [-32, 4], [-14, 4]];

export const I_WINGS = [
  NONE('wings', 0.3, 'i.'),
  iPart({ id: 'clear', slot: 'wings', name: 'Clear pair', tags: ['bee'], dom: 0.5, w: 3, shapes: [iwClear], extra: [C(-44, -36, 2.6, 'a', { ns: true }), S([[-2, -2], [-8, -16], [-18, -28], [-30, -34], [-40, -32], [-34, -22], [-22, -10], [-8, 0]], 'w', { ns: true, cl: true, op: 0.55 }), veins('M-2,-2 C-14,-14 -26,-24 -42,-34 M-4,-8 C-14,-14 -24,-18 -36,-24 M-8,-2 C-16,-8 -24,-12 -34,-14')],
    stages: iWingStages(iwClear, 'M-2,-2 C-14,-14 -26,-24 -42,-34 M-4,-8 C-14,-14 -24,-18 -36,-24', [[-44, -36], [-36, -24], [-34, -14]]) }),
  iPart({ id: 'long', slot: 'wings', name: 'Long pair', tags: ['dragonfly'], dom: 0.5, w: 2, shapes: [iwLong], extra: [C(-69, -36, 2.6, 'a', { ns: true }), C(-44, -32, 2, 'a', { ns: true }), S([[-2, -2], [-4, -10], [-18, -20], [-44, -30], [-64, -34], [-60, -26], [-42, -16], [-18, -6], [-6, 0]], 'w', { ns: true, cl: true, op: 0.5 }), veins('M-2,-4 C-20,-14 -44,-24 -70,-34 M-4,-10 C-24,-16 -44,-20 -64,-30 M-8,-4 C-24,-8 -40,-12 -60,-22 M-14,-16 L-16,-8 M-30,-24 L-32,-14 M-46,-30 L-48,-18')],
    stages: iWingStages(iwLong, 'M-2,-4 C-20,-14 -44,-24 -70,-34 M-8,-4 C-24,-8 -40,-12 -60,-22', [[-69, -36], [-44, -32], [-60, -22]], 1.2) }),
  iPart({ id: 'moth', slot: 'wings', name: 'Moth', tags: ['moth', 'wide'], dom: 0.55, w: 2, shapes: [iwMoth], extra: [S([[-4, -4], [-6, -18], [-16, -32], [-36, -44], [-52, -44], [-48, -30], [-38, -18], [-44, -6], [-32, 0], [-14, 0]], 's', { ns: true, cl: true, op: 0.6 }), E(-34, -34, 7, 5, 'a', { ns: true, cl: true }), E(-34, -34, 3.5, 2.5, 'k', { ns: true, cl: true, op: 0.6 }), veins('M-4,-4 C-20,-20 -36,-34 -56,-46 M-6,-2 C-22,-10 -36,-12 -50,-10')],
    stages: { 2: { grow: [1.12, 1.12], add: [E(-34, -34, 9, 6.5, 'a', { ns: true, cl: true }), E(-34, -34, 4.5, 3.2, 'k', { ns: true, cl: true, op: 0.6 }), accentVeins('M-6,-2 C-22,-10 -36,-12 -50,-10'), ...wingDots([[-58, -48], [-50, -8]], 2.4)] }, 3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(iwMoth, { sx: 1.25, sy: 1.25 }), f: 'pd' }], add: [E(-16, -12, 5, 3.6, 'a', { ns: true, cl: true }), E(-16, -12, 2.4, 1.8, 'k', { ns: true, cl: true, op: 0.6 }), ...wingDots([[-58, -48], [-50, -8]], 3)] } } }),
  iPart({ id: 'butterfly', slot: 'wings', name: 'Butterfly', tags: ['butterfly', 'wide'], dom: 0.55, w: 2, shapes: [iwButterfly], extra: [S([[-4, -4], [-6, -20], [-14, -38], [-30, -50], [-50, -48], [-46, -32], [-34, -20], [-44, -10], [-48, 2], [-38, 4], [-18, 2]], 's', { ns: true, cl: true }), ...[[-20, -34], [-40, -42], [-36, -4]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 5, f: 'a', ns: true, cl: true }, { t: 'circle', cx: x, cy: y, r: 2.4, f: 'k', ns: true, cl: true, op: 0.55 }]), veins('M-4,-4 C-16,-22 -30,-40 -54,-52 M-6,-2 C-24,-4 -40,-2 -54,4')],
    stages: { 2: { grow: [1.12, 1.12], add: [...[[-20, -34], [-40, -42], [-36, -4]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 6.5, f: 'a', ns: true, cl: true }, { t: 'circle', cx: x, cy: y, r: 3, f: 'k', ns: true, cl: true, op: 0.55 }]), accentVeins('M-4,-4 C-16,-22 -30,-40 -54,-52 M-6,-2 C-24,-4 -40,-2 -54,4')] }, 3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(iwButterfly, { sx: 1.25, sy: 1.25 }), f: 'pd' }], add: [...[[-10, -20], [-50, -24]].flatMap(([x, y]) => [{ t: 'circle', cx: x, cy: y, r: 4.5, f: 'a', ns: true, cl: true }, { t: 'circle', cx: x, cy: y, r: 2, f: 'k', ns: true, cl: true, op: 0.55 }]), ...wingDots([[-58, -54], [-56, 4]], 3)] } } }),
  iPart({ id: 'beetle', slot: 'wings', name: 'Flight wings', tags: ['beetle', 'small'], dom: 0.45, w: 2, shapes: [iwBeetle], extra: [C(-45, -21, 2.4, 'a', { ns: true }), S([[-2, -2], [-4, -8], [-14, -16], [-34, -22], [-42, -20], [-36, -12], [-24, -4], [-10, 0]], 'w', { ns: true, cl: true, op: 0.5 }), veins('M-2,-2 C-16,-12 -30,-18 -46,-22 M-6,-2 C-16,-6 -28,-8 -40,-12')],
    stages: iWingStages(iwBeetle, 'M-2,-2 C-16,-12 -30,-18 -46,-22 M-6,-2 C-16,-6 -28,-8 -40,-12', [[-45, -21], [-40, -12]], 1.3) }),
  iPart({ id: 'lacewing', slot: 'wings', name: 'Lacewing', tags: ['delicate'], dom: 0.45, w: 2, shapes: [iwLacewing], extra: [C(-57, -38, 2.6, 'a', { ns: true }), C(-40, -38, 1.8, 'a', { ns: true }), S([[-2, -2], [-6, -12], [-18, -24], [-40, -34], [-52, -34], [-48, -24], [-34, -10], [-14, 0]], 'w', { ns: true, cl: true, op: 0.45 }), veins('M-2,-2 C-18,-16 -36,-28 -58,-38 M-4,-8 C-18,-16 -34,-22 -52,-28 M-8,-2 C-20,-8 -32,-12 -48,-16 M-12,-10 L-14,-2 M-24,-20 L-26,-8 M-38,-30 L-40,-14', 0.35)],
    stages: iWingStages(iwLacewing, 'M-2,-2 C-18,-16 -36,-28 -58,-38 M-8,-2 C-20,-8 -32,-12 -48,-16', [[-57, -38], [-40, -38], [-48, -16]]) }),
  iPart({ id: 'fairy', slot: 'wings', name: 'Glow wings', tags: ['fairy', 'light'], dom: 0.45, w: 1, shapes: [iwFairy], extra: [S([[-4, -4], [-6, -18], [-14, -36], [-32, -46], [-44, -42], [-40, -28], [-30, -14], [-38, -4], [-28, 0], [-12, 0]], 'a', { ns: true, cl: true, op: 0.5 }), ...[[-18, -30], [-34, -38], [-30, -6]].map(([x, y]) => ({ t: 'circle', cx: x, cy: y, r: 2.2, f: 'w', ns: true, cl: true })), veins('M-4,-4 C-16,-22 -28,-38 -48,-46 M-6,-2 C-20,-4 -32,-2 -44,0', 0.25)],
    stages: { 2: { grow: [1.12, 1.12], add: [...[[-18, -30], [-34, -38], [-30, -6], [-10, -16], [-40, -20]].map(([x, y]) => ({ t: 'circle', cx: x, cy: y, r: 2.6, f: 'w', ns: true, cl: true })), P(sparklePath(-50, -50, 4), 'a', { ns: true })] }, 3: { grow: [1.08, 1.1], addBehind: [{ pts: xfPts(iwFairy, { sx: 1.25, sy: 1.25 }), f: 'a' }], add: [P(sparklePath(-50, -50, 5), 'a', { ns: true }), P(sparklePath(-46, -2, 3.6, 20), 'a', { ns: true, op: 0.85 })] } } }),
];

/**
 * A jointed leg: coxa at the origin, femur to the knee, tibia to the foot, tarsus to the tip.
 * dir = 1 for front legs (reaching forward), 0 middle, -1 hind (reaching back). Styles change the
 * proportions and add spines or hairs. Stage 2 adds accent joints, stage 3 spurs, claws and bulk.
 */
function insectLeg(slot, style, dir) {
  const S_ = {
    thin: { knee: [8, -10], foot: [10, 16], tip: [8, 2], w: 2 },
    spiny: { knee: [9, -12], foot: [10, 16], tip: [8, 2], w: 2.2, spines: true },
    sturdy: { knee: [8, -8], foot: [8, 16], tip: [8, 2], w: 3 },
    hairy: { knee: [8, -10], foot: [9, 16], tip: [7, 2], w: 2.3, hairs: true },
    hooked: { knee: [8, -10], foot: [9, 16], tip: [4, 4], w: 2.2, hook: true },
    long: { knee: [12, -18], foot: [12, 24], tip: [8, 2], w: 1.9 },
    raptorial: null, jumping: null, stubby: { knee: [5, -5], foot: [5, 10], tip: [6, 2], w: 3 },
  }[style];
  const name = { thin: 'Thin', spiny: 'Spiny', sturdy: 'Sturdy', hairy: 'Hairy', hooked: 'Hooked', long: 'Long', raptorial: 'Raptorial', jumping: 'Jumping', stubby: 'Stubby' }[style];
  if (style === 'raptorial') {
    // praying arm: upper arm forward-up, forearm folded back down with a spiked edge
    const d = 'M0,0 L14,-14 L22,-2';
    return iPart({ id: style, slot, name, tags: ['mantis'], dom: 0.55, w: 1, extra: [...stick(d, 3.4), P('M14,-14 L18,-8 L22,-2 L20,-2 L16,-6 L13,-12 Z', 'pd', { sw: 1 }), L('M15,-10 L18,-9 M17,-6 L20,-5', 'k', 1.2, { op: 0.5 }), P('M22,-2 L25,3 L21,1 Z', 'w', { sw: 1 })],
      stages: {
        2: { grow: [1.06, 1.1], add: [L('M15,-10 L18,-9 M17,-6 L20,-5', 'a', 1.4, { ns: true }), C(14, -14, 1.8, 'a', { ns: true }), P('M22,-2 L26,4 L21,1 Z', 'w', { sw: 1 })] },
        3: { reset: true, grow: [1.12, 1.2], add: [P('M14,-14 L19,-7 L23,-2 L20,-2 L15,-7 L12,-12 Z', 'pd', { sw: 1 }), L('M15,-10 L19,-9 M17,-6 L21,-5 M19,-3 L23,-2', 'a', 1.4, { ns: true }), C(14, -14, 2.4, 'a', { ns: true }), P('M22,-2 L27,5 L21,1 Z', 'w', { sw: 1 })] },
      } });
  }
  if (style === 'jumping') {
    const d = 'M0,0 L-10,-16 L-4,14 L4,16';
    return iPart({ id: style, slot, name, tags: ['grasshopper'], dom: 0.55, w: 1, extra: [S([[-2, -4], [-8, -14], [-12, -16], [-14, -8], [-8, 2], [-2, 4]], 'p', { sw: 2 }), ...stick(d, 2.6), L('M-6,4 L-8,6 M-5,8 L-7,10', 'k', 1.2, { op: 0.5 })],
      stages: {
        2: { grow: [1.06, 1.1], add: [C(-10, -16, 1.8, 'a', { ns: true }), C(-4, 14, 1.6, 'a', { ns: true }), L('M-6,4 L-8,6 M-5,8 L-7,10', 'a', 1.4, { ns: true })] },
        3: { reset: true, grow: [1.12, 1.2], add: [S([[-2, -5], [-9, -16], [-14, -18], [-16, -8], [-9, 3], [-2, 5]], 'p', { sw: 2 }), C(-10, -16, 2.4, 'a', { ns: true }), C(-4, 14, 2, 'a', { ns: true }), L('M-6,4 L-9,6 M-5,8 L-8,11 M-4,12 L-7,15', 'a', 1.4, { ns: true }), P('M4,16 L7,20 L3,18 Z', 'w', { sw: 1 })] },
      } });
  }
  const f = (v) => v * dir;
  const kx = dir === 0 ? -2 : f(S_.knee[0]), ky = S_.knee[1];
  const fx = kx + (dir === 0 ? 2 : f(S_.foot[0]) * 0.5), fy = S_.foot[1];
  const tx = fx + S_.tip[0], ty = fy + S_.tip[1];
  const d = `M0,0 L${kx},${ky} L${fx},${fy} L${tx},${ty}`;
  const extra = [...stick(d, S_.w)];
  if (S_.spines) extra.push(L(`M${(kx + fx) / 2 - 2},${(ky + fy) / 2} L${(kx + fx) / 2 - 5},${(ky + fy) / 2 + 3} M${(kx + fx) / 2},${(ky + fy) / 2 + 6} L${(kx + fx) / 2 - 3},${(ky + fy) / 2 + 9}`, 'k', 1.4, { op: 0.6 }));
  if (S_.hairs) extra.push(L(`M${kx - 1},${ky + 4} L${kx - 4},${ky + 5} M${kx},${ky + 9} L${kx - 3},${ky + 11} M${(kx + fx) / 2},${(ky + fy) / 2 + 4} L${(kx + fx) / 2 - 3},${(ky + fy) / 2 + 6}`, 'k', 1.2, { op: 0.45 }));
  if (S_.hook) extra.push(P(`M${tx},${ty} L${tx + 3},${ty - 3} L${tx + 1},${ty + 1} Z`, 'w', { sw: 1 }));
  const sx = dir > 0 ? 1 : dir < 0 ? -1 : 0;
  const joints = (r) => [C(kx, ky, r, 'a', { ns: true }), C(fx, fy, r * 0.85, 'a', { ns: true })];
  const spur = P(`M${kx},${ky} L${kx + 4 * sx},${ky - 5} L${kx + 1.5 * sx + (sx ? 0 : 1.5)},${ky + 1} Z`, 'pd', { sw: 1 });
  const claw = P(`M${tx},${ty} L${tx + 2},${ty + 4} L${tx - 2},${ty + 1} Z`, 'w', { sw: 1 });
  const stages = {
    2: { grow: [1.06, 1.1], add: joints(1.6) },
    3: { reset: true, grow: [1.12, 1.2], add: [...joints(2.2), spur, claw] },
  };
  return iPart({ id: style, slot, name, tags: [style], dom: style === 'thin' ? 0.5 : 0.5, w: style === 'thin' ? 3 : 2, extra, stages });
}

const LEG_STYLES_FRONT = ['thin', 'spiny', 'sturdy', 'hairy', 'hooked', 'long', 'raptorial'];
const LEG_STYLES_MID = ['thin', 'spiny', 'sturdy', 'hairy', 'hooked', 'long', 'stubby'];
const LEG_STYLES_BACK = ['thin', 'spiny', 'sturdy', 'hairy', 'hooked', 'long', 'jumping'];
export const I_LEGS_FRONT = LEG_STYLES_FRONT.map((s) => insectLeg('legsFront', s, 1));
export const I_LEGS_MID = LEG_STYLES_MID.map((s) => insectLeg('legsMid', s, 0));
export const I_LEGS_BACK = LEG_STYLES_BACK.map((s) => insectLeg('legsBack', s, -1));

const itPlume = [[2, -4], [-8, -8], [-20, -12, 0.2], [-12, -3], [-24, 0, 0.2], [-12, 3], [-20, 12, 0.2], [-8, 8], [2, 4]];

export const I_TAILS = [
  NONE('tail', 0.3, 'i.'),
  iPart({ id: 'stinger', slot: 'tail', name: 'Stinger', tags: ['bee'], dom: 0.55, w: 3, extra: [P('M2,-4 L-14,-1 L2,4 Z', 'k', { sw: 1.6 }), HL('M0,-2 L-8,-1 L0,1 Z', 0.3)],
    stages: { 2: { grow: [1.15, 1.15], add: [P('M2,-4.5 L-18,-1 L2,4.5 Z', 'k', { sw: 1.6 }), HL('M0,-2.4 L-10,-1 L0,1.2 Z', 0.3), C(-18.5, -1, 1.4, 'a', { ns: true })] }, 3: { reset: true, grow: [1.3, 1.3], add: [P('M2,-5 L-22,-1 L2,5 Z', 'k', { sw: 1.6 }), HL('M0,-2.6 L-12,-1 L0,1.4 Z', 0.3), C(-22.5, -1, 1.8, 'a', { ns: true }), C(-20, -1, 6, 'a', { ns: true, op: 0.2 })] } } }),
  iPart({ id: 'lantern', slot: 'tail', name: 'Lantern', tags: ['firefly', 'light'], dom: 0.5, w: 2, extra: [C(-6, 0, 12, 'a', { ns: true, op: 0.3 }), E(-4, 0, 8, 6.5, 'a', { sw: 1.8 }), E(-6, -2, 3, 2, 'w', { ns: true, op: 0.7 })],
    stages: { 2: { grow: [1.12, 1.12], add: [C(-6, 0, 16, 'a', { ns: true, op: 0.22 })] }, 3: { grow: [1.1, 1.1], add: [evoRing(-4, 0, 11, 'a', 1.4, { op: 0.6 }), evoRing(-4, 0, 14, 'a', 1, { op: 0.35 }), P(sparklePath(-16, -10, 3.4), 'w', { ns: true, op: 0.8 }), P(sparklePath(6, 8, 2.6, 20), 'w', { ns: true, op: 0.7 })] } } }),
  iPart({ id: 'cerci', slot: 'tail', name: 'Cerci', tags: ['prongs'], dom: 0.45, w: 2, extra: [...stick('M0,-2 C-8,-4 -14,-8 -20,-14', 2, 'pd'), ...stick('M0,2 C-8,4 -14,8 -20,14', 2, 'pd')],
    stages: { 2: { grow: [1.15, 1.15], add: [C(-20, -14, 2, 'a', { ns: true }), C(-20, 14, 2, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], add: [...stick('M0,0 C-10,0 -18,0 -26,0', 2, 'pd'), C(-26, 0, 2.4, 'a', { ns: true }), C(-20, -14, 2.6, 'a', { ns: true }), C(-20, 14, 2.6, 'a', { ns: true })] } } }),
  iPart({ id: 'pincers', slot: 'tail', name: 'Forceps', tags: ['earwig'], dom: 0.5, w: 2, extra: [P('M2,-4 C-8,-6 -16,-4 -20,2 C-16,0 -10,-1 -4,0 Z', 'pd', { sw: 1.6 }), P('M2,4 C-8,6 -16,4 -20,-2 C-16,0 -10,1 -4,0 Z', 'pd', { sw: 1.6 })],
    stages: { 2: { grow: [1.15, 1.15], add: [L('M-8,-4 L-9,-2 M-13,-3 L-14,-1 M-8,4 L-9,2 M-13,3 L-14,1', 'k', 1, { op: 0.5 }), C(-20, 2, 1.4, 'a', { ns: true }), C(-20, -2, 1.4, 'a', { ns: true })] }, 3: { reset: true, grow: [1.3, 1.3], add: [P('M2,-5 C-10,-8 -20,-5 -25,3 C-20,0 -12,-1 -4,0 Z', 'pd', { sw: 1.6 }), P('M2,5 C-10,8 -20,5 -25,-3 C-20,0 -12,1 -4,0 Z', 'pd', { sw: 1.6 }), C(-25, 3, 1.8, 'a', { ns: true }), C(-25, -3, 1.8, 'a', { ns: true })] } } }),
  iPart({ id: 'club', slot: 'tail', name: 'Club', tags: ['heavy'], dom: 0.5, w: 2, extra: [L('M0,0 L-10,0', 'k', 6), L('M0,0 L-10,0', 'p', 3.4), C(-15, 0, 6, 'p', { sw: 2 }), L('M-13,-3 L-17,-3 M-13,3 L-17,3', 'k', 1.2, { op: 0.4 })],
    stages: { 2: { grow: [1.12, 1.12], add: [P('M-19,-4 L-25,-8 L-18,-6 Z M-19,4 L-25,8 L-18,6 Z M-21,0 L-27,0 L-20,-2 Z', 'pd', { sw: 1 })] }, 3: { reset: true, grow: [1.25, 1.25], add: [C(-16, 0, 7.5, 'p', { sw: 2 }), P('M-20,-5 L-27,-10 L-19,-7 Z M-20,5 L-27,10 L-19,7 Z M-23,0 L-30,0 L-22,-2 Z', 'pd', { sw: 1 }), evoRing(-16, 0, 4, 'a', 1.4, { op: 0.8 })] } } }),
  iPart({ id: 'plume', slot: 'tail', name: 'Plume', tags: ['tufts'], dom: 0.45, w: 2, shapes: [itPlume], extra: [HL('M-4,-4 L-14,-8 L-10,-2 Z', 0.25)],
    stages: { 2: { grow: [1.15, 1.15], add: [C(-20, -12, 2, 'a', { ns: true }), C(-24, 0, 2, 'a', { ns: true }), C(-20, 12, 2, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], addBehind: [{ pts: xfPts(itPlume, { sx: 1.35, sy: 1.35 }), f: 'pd' }], add: [C(-20, -12, 2.6, 'a', { ns: true }), C(-24, 0, 2.6, 'a', { ns: true }), C(-20, 12, 2.6, 'a', { ns: true })] } } }),
  iPart({ id: 'silk', slot: 'tail', name: 'Silk thread', tags: ['spinner'], dom: 0.4, w: 1, extra: [L('M0,0 C-8,2 -16,-2 -24,4 C-30,8 -36,4 -42,8', 'w', 1.8, { op: 0.85 }), C(-1, 0, 3.5, 'pd', { sw: 1.4 })],
    stages: { 2: { grow: [1.15, 1.15], add: [L('M-42,8 C-48,12 -54,8 -60,12', 'w', 1.8, { op: 0.85 }), C(-60, 12, 1.6, 'a', { ns: true })] }, 3: { grow: [1.1, 1.1], add: [C(-14, -1, 1.6, 'w', { ns: true, op: 0.9 }), C(-30, 7, 1.6, 'w', { ns: true, op: 0.9 }), C(-48, 10, 1.6, 'w', { ns: true, op: 0.9 }), L('M0,-2 C-10,-6 -20,-4 -30,-8', 'w', 1.4, { op: 0.7 }), C(-30, -8, 1.6, 'a', { ns: true })] } } }),
];
