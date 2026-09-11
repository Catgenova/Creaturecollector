// The genome is the single source of truth for a creature. It is a plain JSON
// object with a fixed shape, so fusing two genomes always yields another valid
// genome and any creature can be shared as a code string.
//
// Diploid part genes: every slot holds [expressed, carried]. Only the expressed
// allele is drawn; the carried one can resurface in offspring.
import { SLOTS, PARTS_BY_SLOT, getPart, partsFor, partFits } from '../data/parts/index.js';
import { SPECIES, SPECIES_BY_ID, TIER_WEIGHT, WILD_SPECIES } from '../data/species.js';
import { isType } from '../data/types.js';
import { clamp01, round3, normalizeWeights, b64uEncode, b64uDecode } from '../core/util.js';
import { splitName } from './naming.js';
import { getMove, UNIVERSAL_LEARNSET } from '../data/moves.js';
import { ABILITIES } from '../data/abilities.js';
import { CLADES } from '../data/clades.js';
import { jitterPalette, shinyPalette } from './palette.js';

export const GENOME_VERSION = 1;
export const CODE_PREFIX = 'CC1.';
export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const STAT_NAMES = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed' };
export const TRAIT_KEYS = ['size', 'bulk', 'headScale', 'limbScale', 'tailScale', 'wingScale', 'eyeScale'];
export const PAINT_SLOTS = ['body', 'head', 'crown', 'legs', 'arms', 'wings', 'tail', 'back'];
/** Role order [p, s, a] -> colour index into [c1, c2, c3]. */
export const PAINT_PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

/** Odds used when rolling a wild creature from its species. */
export const ROLL = {
  carriedMutation: 0.1,   // hidden allele replaced by a random part
  expressedMutation: 0.03, // visible variant
  bodyCarriedMutation: 0.05,
  paintSwap: 0.12,        // a slot's colour roles get permuted
  shiny: 1 / 64,
};

function allelesFromRecipe(entry, slot) {
  if (Array.isArray(entry)) return [entry[0], entry[1] ?? entry[0]];
  if (typeof entry === 'string') return [entry, entry];
  return [`${slot}.none`, `${slot}.none`];
}

/** Random part id for a slot that fits the body kind, weighted by part rarity. Null when nothing fits. */
export function randomPartId(slot, bodyKind, rng) {
  const pool = partsFor(slot, bodyKind);
  if (!pool.length) return null;
  return rng.weighted(pool, (p) => p.w ?? 1).id;
}

export function defaultTraits() {
  const t = {};
  for (const k of TRAIT_KEYS) t[k] = 0.5;
  return t;
}

/** Roll a wild creature of a species. Deterministic for a given rng seed. */
export function speciesGenome(species, rng) {
  const rParts = rng.fork('parts');
  const rPaint = rng.fork('paint');
  const rPal = rng.fork('palette');
  const rTraits = rng.fork('traits');
  const rStats = rng.fork('stats');
  const rAbility = rng.fork('ability');

  const parts = {};
  const bodyAlleles = allelesFromRecipe(species.recipe.body, 'body');
  if (rParts.chance(ROLL.bodyCarriedMutation)) bodyAlleles[1] = randomPartId('body', getPart(bodyAlleles[0]).kind, rParts) || bodyAlleles[1];
  parts.body = bodyAlleles;
  const bodyKind = getPart(bodyAlleles[0]).kind;
  for (const slot of SLOTS) {
    if (slot === 'body') continue;
    const a = allelesFromRecipe(species.recipe[slot], slot);
    if (rParts.chance(ROLL.carriedMutation)) a[1] = randomPartId(slot, bodyKind, rParts) || a[1];
    if (rParts.chance(ROLL.expressedMutation)) a[0] = randomPartId(slot, bodyKind, rParts) || a[0];
    parts[slot] = a;
  }

  const paint = {};
  for (const slot of PAINT_SLOTS) {
    let idx = (species.paint && species.paint[slot]) || 0;
    if (rPaint.chance(ROLL.paintSwap)) idx = rPaint.int(PAINT_PERMS.length);
    paint[slot] = idx;
  }

  let palette = jitterPalette(species.palette, species.vary, rPal);
  const shiny = rPal.chance(ROLL.shiny);
  if (shiny) palette = shinyPalette(palette, rPal);

  const traits = {};
  for (const k of TRAIT_KEYS) {
    const [lo, hi] = (species.traits && species.traits[k]) || [0.35, 0.65];
    traits[k] = round3(rTraits.range(lo, hi));
  }

  const vigor = {};
  for (const k of STAT_KEYS) vigor[k] = round3(rStats.next());

  return {
    v: GENOME_VERSION,
    seed: rng.seed,
    species: species.id,
    clade: species.clade,
    name: species.name,
    nameParts: species.nameParts ? species.nameParts.slice() : splitName(species.name),
    gen: 0,
    shiny,
    types: [species.types[0], species.types[1] || null],
    parts,
    paint,
    palette,
    traits,
    stats: { ...species.stats },
    vigor,
    bst: species.bst,
    lineage: [species.id],
    learnset: (species.learnset || UNIVERSAL_LEARNSET).map((e) => e.slice()),
    ability: rAbility.pick(species.abilities || ['lucky_streak']),
  };
}

/** The learnset a genome battles with: its own, else its species', else the universal fallback. */
export function learnsetOf(g) {
  if (Array.isArray(g.learnset) && g.learnset.length) return g.learnset;
  const sp = g.species && SPECIES_BY_ID[g.species];
  return sp && sp.learnset ? sp.learnset : UNIVERSAL_LEARNSET;
}

/** A random wild creature: species weighted by rarity tier, then rolled. opts.clade restricts the class. */
export function randomGenome(rng, opts = {}) {
  const pool = opts.clade ? WILD_SPECIES.filter((s) => s.clade === opts.clade) : WILD_SPECIES;
  const species = rng.fork('species').weighted(pool.length ? pool : WILD_SPECIES, (s) => TIER_WEIGHT[s.tier] || 1);
  return speciesGenome(species, rng);
}

/** The class a genome belongs to, inferred from its species or lineage for older genomes. */
export function cladeOf(g) {
  if (g.clade && CLADES[g.clade]) return g.clade;
  const sp = (g.species && SPECIES_BY_ID[g.species]) || (g.lineage && SPECIES_BY_ID[g.lineage[0]]);
  return sp ? sp.clade : 'mammal';
}

export function speciesOf(g) { return SPECIES_BY_ID[g.species] || null; }

/**
 * Expressed part per slot after compatibility checks. If the expressed allele
 * does not fit the body, the carried one is tried, then nothing.
 */
export function resolveParts(g) {
  const out = {};
  const body = getPart(g.parts.body[0]) || getPart(g.parts.body[1]) || PARTS_BY_SLOT.body[0];
  out.body = body;
  for (const slot of SLOTS) {
    if (slot === 'body') continue;
    const [e, c] = g.parts[slot] || [];
    let part = getPart(e);
    if (!part || !partFits(part, body.kind)) {
      const alt = getPart(c);
      part = alt && partFits(alt, body.kind) ? alt : null;
    }
    out[slot] = part && !part.none ? part : null;
  }
  return out;
}

/** Species-level base stats: the fixed budget split by the creature's stat weights. */
export function baseStats(g) {
  const w = normalizeWeights(g.stats);
  const out = {};
  for (const k of STAT_KEYS) out[k] = Math.max(20, Math.round((g.bst || 400) * w[k]));
  return out;
}

export function typeLabel(g) { return g.types.filter(Boolean).join(' / '); }

export function encodeGenome(g) { return CODE_PREFIX + b64uEncode(JSON.stringify(g)); }

export function decodeGenome(code) {
  const s = String(code || '').trim();
  if (!s.startsWith(CODE_PREFIX)) throw new Error('That is not a creature code.');
  let g;
  try { g = JSON.parse(b64uDecode(s.slice(CODE_PREFIX.length))); } catch { throw new Error('That creature code is damaged.'); }
  return validateGenome(g);
}

/** Throws on structural problems; fills harmless gaps with defaults. Returns the genome. */
export function validateGenome(g) {
  if (!g || typeof g !== 'object') throw new Error('Not a creature.');
  if (g.v !== GENOME_VERSION) throw new Error(`Unsupported creature version ${g.v}.`);
  if (!g.parts || typeof g.parts !== 'object') throw new Error('Creature has no parts.');
  for (const slot of SLOTS) {
    const a = g.parts[slot];
    if (!Array.isArray(a) || a.length !== 2 || !a.every((x) => typeof x === 'string')) throw new Error(`Bad ${slot} genes.`);
  }
  if (!getPart(g.parts.body[0]) && !getPart(g.parts.body[1])) throw new Error('Unknown body part.');
  for (const k of ['c1', 'c2', 'c3', 'eye']) {
    const c = g.palette && g.palette[k];
    if (!Array.isArray(c) || c.length !== 3 || !c.every(Number.isFinite)) throw new Error('Bad palette.');
  }
  if (!Array.isArray(g.types) || !isType(g.types[0]) || (g.types[1] != null && !isType(g.types[1]))) throw new Error('Bad types.');
  g.types = [g.types[0], g.types[1] || null];
  g.traits = { ...defaultTraits(), ...(g.traits || {}) };
  for (const k of TRAIT_KEYS) g.traits[k] = clamp01(Number(g.traits[k]) || 0.5);
  g.paint = g.paint && typeof g.paint === 'object' ? g.paint : {};
  for (const slot of PAINT_SLOTS) g.paint[slot] = PAINT_PERMS[g.paint[slot]] ? g.paint[slot] : 0;
  if (!g.stats || typeof g.stats !== 'object') g.stats = Object.fromEntries(STAT_KEYS.map((k) => [k, 1]));
  if (!g.vigor || typeof g.vigor !== 'object') g.vigor = Object.fromEntries(STAT_KEYS.map((k) => [k, 0.5]));
  g.bst = Number.isFinite(g.bst) ? g.bst : 400;
  g.gen = Number.isFinite(g.gen) ? g.gen : 0;
  g.name = typeof g.name === 'string' && g.name.trim() ? g.name.trim().slice(0, 24) : 'Unknown';
  if (!Array.isArray(g.nameParts) || g.nameParts.length !== 2 || !g.nameParts.every((x) => typeof x === 'string' && x)) {
    const sp = g.species && SPECIES_BY_ID[g.species];
    g.nameParts = sp && sp.nameParts ? sp.nameParts.slice() : splitName(g.name);
  }
  g.species = typeof g.species === 'string' && SPECIES_BY_ID[g.species] ? g.species : null;
  g.clade = cladeOf(g);
  g.parents = Array.isArray(g.parents) ? g.parents.filter((x) => typeof x === 'string').slice(0, 2) : undefined;
  if (g.parents === undefined) delete g.parents;
  g.lineage = Array.isArray(g.lineage) ? g.lineage.filter((x) => typeof x === 'string').slice(0, 16) : [];
  g.shiny = Boolean(g.shiny);
  const sp = g.species ? SPECIES_BY_ID[g.species] : null;
  g.learnset = Array.isArray(g.learnset) ? g.learnset.filter((e) => Array.isArray(e) && Number.isFinite(e[0]) && getMove(e[1])).map((e) => [e[0], e[1]]) : [];
  if (!g.learnset.length) g.learnset = ((sp && sp.learnset) || UNIVERSAL_LEARNSET).map((e) => e.slice());
  if (!ABILITIES[g.ability]) g.ability = (sp && sp.abilities && sp.abilities[0]) || 'lucky_streak';
  return g;
}
