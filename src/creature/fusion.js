// Fusion: two genomes in, one genome out, plus a report of what came from where.
//
// Heredity is diploid. For every slot the child draws one allele from each
// parent at random; the allele with the higher dominance (plus a little noise)
// is expressed and the other is carried. That keeps identities crisp across
// generations and lets a grandparent's trait resurface.
//
// The "identity parent" is whichever parent supplied the expressed head (or the
// body, for headless children). It gives the name prefix, the palette base and
// the primary type. The other parent gives the suffix, one accent colour and the
// secondary type. Shape from one side, colours from the other: that is what
// makes a fusion read as half and half.
import { getPart, partFits } from '../data/parts/index.js';
import { getRig, slotsFor, paintSlotsFor, swappableSlotsFor } from '../data/rigs.js';
import { clamp01, lerp, round3, normalizeWeights } from '../core/util.js';
import { GENOME_VERSION, PAINT_PERMS, TRAIT_KEYS, STAT_KEYS, randomPartId, learnsetOf, cladeOf, rigOf } from './genome.js';
import { CLADES, cladeName } from '../data/clades.js';
import { getMove, UNIVERSAL_LEARNSET } from '../data/moves.js';
import { blendColor } from './palette.js';
import { joinNameParts, splitName } from './naming.js';

export const FUSE = {
  dominanceNoise: 0.15,   // +/- added to each allele's dominance before comparing
  expressedMutation: 0.03,
  carriedMutation: 0.06,
  bodyMutation: 0.01,
  paintSwap: 0.05,
  genBonusPerGen: 4,      // bst bonus per generation
  genBonusCap: 5,         // generations that count toward the bonus
  maxLineage: 16,
};

function dominanceOf(id) {
  const p = getPart(id);
  return p ? p.dom : 0.3;
}

function fitsBody(id, kind) {
  const p = getPart(id);
  return Boolean(p) && partFits(p, kind);
}

function nudgeColor(c, rng) {
  return [c[0] + rng.gauss() * 3, clamp01((c[1] + rng.gauss() * 2) / 100) * 100, clamp01((c[2] + rng.gauss() * 2) / 100) * 100].map(round3);
}

function namePartsOf(g) {
  return Array.isArray(g.nameParts) && g.nameParts.length === 2 ? g.nameParts : splitName(g.name);
}

/** Can these two fuse? Only creatures of the same class can. Returns { ok, reason }. */
export function canFuse(a, b) {
  if (!a || !b) return { ok: false, reason: 'Pick two creatures.' };
  if (a === b) return { ok: false, reason: 'Pick two different creatures.' };
  const ca = cladeOf(a), cb = cladeOf(b);
  if (ca !== cb) return { ok: false, reason: `${cladeName(ca)}s only fuse with ${cladeName(ca)}s.` };
  if (rigOf(a) !== rigOf(b)) return { ok: false, reason: 'These two were built on different skeletons and cannot fuse.' };
  return { ok: true, reason: '' };
}

/**
 * Fuse a and b. Deterministic for a given rng seed. Throws if the classes differ.
 * Returns { child, report } where report = { from: {slot: 0|1}, mutated: {slot: true},
 *   identity: 0|1, palette: {c1|c2|c3|eye: 0|1|'blend'}, types: {primary: 0|1, secondary: 0|1|null} }.
 */
export function fuse(a, b, rng) {
  const compat = canFuse(a, b);
  if (!compat.ok) throw new Error(compat.reason);
  const clade = cladeOf(a);
  const rig = rigOf(a);
  const rParts = rng.fork('parts');
  const rMut = rng.fork('mutation');
  const rPaint = rng.fork('paint');
  const rPal = rng.fork('palette');
  const rTraits = rng.fork('traits');
  const rStats = rng.fork('stats');
  const rAbility = rng.fork('ability');
  const parents = [a, b];

  const draw = (slot) => {
    const fromA = a.parts[slot][rParts.int(2)];
    const fromB = b.parts[slot][rParts.int(2)];
    const dA = dominanceOf(fromA) + rParts.range(-FUSE.dominanceNoise, FUSE.dominanceNoise);
    const dB = dominanceOf(fromB) + rParts.range(-FUSE.dominanceNoise, FUSE.dominanceNoise);
    return dA >= dB ? { alleles: [fromA, fromB], from: 0 } : { alleles: [fromB, fromA], from: 1 };
  };

  const parts = {}, from = {}, mutated = {};
  const bodyDraw = draw('body');
  parts.body = bodyDraw.alleles;
  from.body = bodyDraw.from;
  if (rMut.chance(FUSE.bodyMutation)) { const nb = randomPartId(rig, 'body', getPart(parts.body[0]).kind, rMut); if (nb) { parts.body = [nb, parts.body[0]]; mutated.body = true; } }
  const bodyKind = getPart(parts.body[0]).kind;

  for (const slot of slotsFor(rig)) {
    if (slot === 'body') continue;
    const d = draw(slot);
    let [e, c] = d.alleles;
    let f = d.from;
    if (!fitsBody(e, bodyKind) && fitsBody(c, bodyKind)) { [e, c] = [c, e]; f = 1 - f; }
    if (rMut.chance(FUSE.expressedMutation)) { const ne = randomPartId(rig, slot, bodyKind, rMut); if (ne) { c = e; e = ne; mutated[slot] = true; } }
    else if (rMut.chance(FUSE.carriedMutation)) c = randomPartId(rig, slot, bodyKind, rMut) || c;
    parts[slot] = [e, c];
    from[slot] = f;
  }

  // Linked slots inherit together so the class silhouette stays coherent.
  const linked = getRig(rig).linked || (CLADES[clade] && CLADES[clade].linked) || [];
  for (const group of linked) {
    const lead = group[0];
    if (from[lead] == null) continue;
    for (const slot of group.slice(1)) {
      if (from[slot] === from[lead] || mutated[slot]) continue;
      const src = parents[from[lead]], other = parents[1 - from[lead]];
      const want = src.parts[slot][0];
      if (!fitsBody(want, bodyKind) && !getPart(want)?.none) continue;
      parts[slot] = [want, other.parts[slot][0]];
      from[slot] = from[lead];
    }
  }

  const headPart = parts.head ? getPart(parts.head[0]) : null;
  const identity = headPart && !headPart.none && !mutated.head ? from.head : from.body;
  const P1 = parents[identity], P2 = parents[1 - identity];

  // Paint travels with the part that was expressed.
  const paint = {};
  const swappable = swappableSlotsFor(rig);
  for (const slot of paintSlotsFor(rig)) {
    const src = parents[from[slot] == null ? identity : from[slot]];
    paint[slot] = (src.paint && PAINT_PERMS[src.paint[slot]]) ? src.paint[slot] : 0;
    if (swappable.includes(slot) && rPaint.chance(FUSE.paintSwap)) paint[slot] = rPaint.int(PAINT_PERMS.length);
  }

  // Palette: base from the identity parent, one colour from the other parent.
  const palette = {}, palFrom = {};
  for (const k of ['c1', 'c2', 'c3']) { palette[k] = nudgeColor(P1.palette[k], rPal); palFrom[k] = identity; }
  const roll = rPal.next();
  if (roll < 0.55) {
    const k = rPal.pick(['c2', 'c3']);
    palette[k] = nudgeColor(P2.palette.c1, rPal); palFrom[k] = 1 - identity;
  } else if (roll < 0.85) {
    palette.c1 = blendColor(P1.palette.c1, P2.palette.c1, rPal.range(0.35, 0.65)); palFrom.c1 = 'blend';
    const k = rPal.pick(['c2', 'c3']);
    palette[k] = nudgeColor(P2.palette[k], rPal); palFrom[k] = 1 - identity;
  }
  const eyeFrom = rPal.chance(0.5) ? identity : 1 - identity;
  palette.eye = parents[eyeFrom].palette.eye.slice();
  palFrom.eye = eyeFrom;

  const traits = {};
  for (const k of TRAIT_KEYS) {
    const t = clamp01(0.5 + rTraits.gauss() * 0.15);
    const av = a.traits && a.traits[k] != null ? a.traits[k] : 0.5;
    const bv = b.traits && b.traits[k] != null ? b.traits[k] : 0.5;
    traits[k] = round3(clamp01(lerp(av, bv, t) + rTraits.gauss() * 0.04));
  }

  const primary = P1.types[0];
  let secondary = null, secondaryFrom = null;
  const candidates = [[P2.types[0], 1 - identity], [P2.types[1], 1 - identity], [P1.types[1], identity]];
  for (const [t, src] of candidates) if (t && t !== primary) { secondary = t; secondaryFrom = src; break; }

  const wa = normalizeWeights(a.stats), wb = normalizeWeights(b.stats);
  const stats = {};
  for (const k of STAT_KEYS) stats[k] = round3((wa[k] + wb[k]) / 2);
  const gen = Math.max(a.gen || 0, b.gen || 0) + 1;
  const bst = Math.round(((a.bst || 400) + (b.bst || 400)) / 2 + Math.min(gen, FUSE.genBonusCap) * FUSE.genBonusPerGen);
  const vigor = {};
  for (const k of STAT_KEYS) {
    const av = a.vigor && a.vigor[k] != null ? a.vigor[k] : 0.5;
    const bv = b.vigor && b.vigor[k] != null ? b.vigor[k] : 0.5;
    const base = rStats.chance(0.6) ? Math.max(av, bv) : (av + bv) / 2;
    vigor[k] = round3(clamp01(base + rStats.gauss() * 0.03));
  }

  const nameParts = [namePartsOf(P1)[0], namePartsOf(P2)[1]];
  const lineage = [...(a.lineage || []), ...(b.lineage || [])].filter((x, i, arr) => arr.indexOf(x) === i).slice(-FUSE.maxLineage);

  const child = {
    v: GENOME_VERSION,
    seed: rng.seed,
    species: null,
    clade,
    rig,
    name: joinNameParts(nameParts[0], nameParts[1]),
    nameParts,
    gen,
    shiny: Boolean(P1.shiny),
    types: [primary, secondary],
    parts, paint, palette, traits, stats, vigor, bst, lineage,
    parents: [a.name, b.name],
    learnset: fuseLearnsets(a, b, [primary, secondary]),
    ability: rAbility.chance(0.6) ? P1.ability : P2.ability,
  };
  return {
    child,
    report: { from, mutated, identity, palette: palFrom, types: { primary: identity, secondary: secondaryFrom } },
  };
}

/**
 * A child's learnset: both parents' moves that match the child's types (Normal
 * always counts), lowest level wins on duplicates, padded with universal moves
 * when thin, capped at twelve keeping the two earliest and the ten latest.
 */
export function fuseLearnsets(a, b, types) {
  const ok = new Set(['Normal', ...types.filter(Boolean)]);
  const byId = new Map();
  for (const [lvl, id] of [...learnsetOf(a), ...learnsetOf(b)]) {
    const mv = getMove(id);
    if (!mv || !ok.has(mv.type)) continue;
    if (!byId.has(id) || byId.get(id) > lvl) byId.set(id, lvl);
  }
  for (const [lvl, id] of UNIVERSAL_LEARNSET) if (byId.size < 6 && !byId.has(id)) byId.set(id, lvl);
  const list = [...byId.entries()].map(([id, lvl]) => [lvl, id]).sort((p, q) => p[0] - q[0] || (p[1] < q[1] ? -1 : 1));
  return list.length <= 12 ? list : [...list.slice(0, 2), ...list.slice(-10)];
}

/** Fuse a chain: start with `first`, then fold in each partner in turn. Returns every generation. */
export function fuseChain(first, partners, rng) {
  const out = [first];
  let cur = first;
  partners.forEach((p, i) => {
    if (!canFuse(cur, p).ok) return;
    cur = fuse(cur, p, rng.fork(`gen${i}`)).child;
    out.push(cur);
  });
  return out;
}
