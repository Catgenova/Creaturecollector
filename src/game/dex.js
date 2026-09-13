// The Fusiondex: which species have been seen and caught across every journey, which colour morphs
// have turned up, and the rewards that milestones unlock. It lives in the save beside the collection,
// keyed by species id so it stays small however many creatures pass through. Pure functions.
import { SPECIES, SPECIES_BY_ID, WILD_SPECIES } from '../data/species.js';
import { makeRng } from '../core/rng.js';
import { CLADE_IDS } from '../data/clades.js';
import { MORPH_IDS } from '../creature/palette.js';
import { REGIONS } from './world.js';
import { getCharm } from '../data/charms.js';

export function emptyDex() { return { seen: {}, caught: {}, morphs: {}, claimed: [] }; }

/** Milestones by species caught, each claimed once per save: gold into the purse, charms into the Bag. */
export const DEX_REWARDS = [
  { caught: 10, gold: 2000 },
  { caught: 25, charm: 'lure_charm' },
  { caught: 50, gold: 8000 },
  { caught: 100, charm: 'scholar_charm' },
  { caught: 200, gold: 25000 },
  { caught: 400, charm: 'lucky_coin' },
  { caught: 700, gold: 60000 },
  { caught: WILD_SPECIES.length, charm: 'prism_charm' },
];

function dexOf(save) { if (!save.dex || typeof save.dex !== 'object') save.dex = emptyDex(); for (const k of ['seen', 'caught', 'morphs']) if (!save.dex[k] || typeof save.dex[k] !== 'object') save.dex[k] = {}; if (!Array.isArray(save.dex.claimed)) save.dex.claimed = []; return save.dex; }

/** A species has been seen (an encounter, a trainer's team). Returns true when it is new to the dex. */
export function dexSeen(save, genome) {
  if (!genome || !genome.species || !SPECIES_BY_ID[genome.species]) return false;
  const d = dexOf(save);
  const fresh = !d.seen[genome.species];
  d.seen[genome.species] = 1;
  if (genome.morph && MORPH_IDS.includes(genome.morph)) { d.morphs[genome.species] = d.morphs[genome.species] || {}; d.morphs[genome.species][genome.morph] = Math.max(1, d.morphs[genome.species][genome.morph] || 0); }
  return fresh;
}

/** A species has been caught, chosen as a starter, or is riding along in a party. Returns true when newly caught. */
export function dexCaught(save, genome) {
  if (!genome || !genome.species || !SPECIES_BY_ID[genome.species]) return false;
  dexSeen(save, genome);
  const d = dexOf(save);
  const fresh = !d.caught[genome.species];
  d.caught[genome.species] = 1;
  if (genome.morph && MORPH_IDS.includes(genome.morph)) { d.morphs[genome.species][genome.morph] = 2; }
  return fresh;
}

/** Fold the collection and the journey's creatures into the dex (older saves, and a safety net on load). */
export function dexSeed(save) {
  for (const e of save.collection || []) dexCaught(save, e.genome);
  const j = save.journey;
  if (j) for (const m of [...(j.party || []), ...(j.box || [])]) dexCaught(save, m.genome);
  return save;
}

/** Coerce a parsed dex: only real species and morphs survive, counts are 1 (seen) or 2 (caught). */
export function normalizeDex(raw) {
  const d = emptyDex();
  if (!raw || typeof raw !== 'object') return d;
  for (const k of ['seen', 'caught']) if (raw[k] && typeof raw[k] === 'object') for (const id of Object.keys(raw[k])) if (SPECIES_BY_ID[id] && raw[k][id]) d[k][id] = 1;
  for (const id of Object.keys(d.caught)) d.seen[id] = 1;
  if (raw.morphs && typeof raw.morphs === 'object') for (const [id, ms] of Object.entries(raw.morphs)) {
    if (!SPECIES_BY_ID[id] || !ms || typeof ms !== 'object') continue;
    for (const m of MORPH_IDS) if (ms[m]) { d.morphs[id] = d.morphs[id] || {}; d.morphs[id][m] = ms[m] >= 2 ? 2 : 1; }
  }
  if (Array.isArray(raw.claimed)) d.claimed = raw.claimed.filter((i) => Number.isInteger(i) && i >= 0 && i < DEX_REWARDS.length).filter((i, k, arr) => arr.indexOf(i) === k);
  return d;
}

export function dexStatus(save, speciesId) { const d = dexOf(save); return d.caught[speciesId] ? 'caught' : d.seen[speciesId] ? 'seen' : 'unseen'; }
/** Morphs recorded for a species: { albino: 1|2, ... } (1 seen, 2 caught). */
export function dexMorphs(save, speciesId) { return dexOf(save).morphs[speciesId] || {}; }

/** Totals for the dex header and per class. */
export function dexCounts(save) {
  const d = dexOf(save);
  const out = { total: WILD_SPECIES.length, seen: 0, caught: 0, morphs: 0, byClass: {} };
  for (const c of CLADE_IDS) out.byClass[c] = { total: 0, seen: 0, caught: 0 };
  for (const s of WILD_SPECIES) {
    const b = out.byClass[s.clade];
    b.total++;
    if (d.seen[s.id]) { out.seen++; b.seen++; }
    if (d.caught[s.id]) { out.caught++; b.caught++; }
  }
  for (const ms of Object.values(d.morphs)) for (const v of Object.values(ms)) if (v >= 2) out.morphs++;
  return out;
}

/** Where a species lives: its class's region and its types, for the dex hint. */
/** The broker at the Market: gold for word of a creature you have never seen. */
export const BROKER = { cost: 2000, offers: 3 };

/** Three creatures the broker knows of that the Dex has never seen. Deterministic per journey and purchase. */
export function brokerOffers(save, j) {
  const unseen = WILD_SPECIES.filter((s) => dexStatus(save, s.id) === 'unseen');
  if (!unseen.length) return [];
  const rng = makeRng(`${j ? j.seed : 'broker'}:broker:${(j && j.stats && j.stats.hints) || 0}`);
  const picked = [];
  const pool = unseen.slice();
  for (let k = 0; k < Math.min(BROKER.offers, pool.length); k++) {
    const i = Math.floor(rng.next() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked.map((sp) => ({ species: sp, cost: BROKER.cost, where: dexHabitat(sp.id) }));
}

/** Buy word of one creature: it costs gold and the Dex counts it as seen. */
export function buyHint(save, j, speciesId) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp || sp.hidden) return { ok: false, reason: 'The broker has never heard of it.' };
  if (dexStatus(save, speciesId) !== 'unseen') return { ok: false, reason: `You have already seen a ${sp.name}.` };
  if (!brokerOffers(save, j).some((row) => row.species.id === speciesId)) return { ok: false, reason: 'That is not on the broker\'s list today.' };
  if ((j.gold || 0) < BROKER.cost) return { ok: false, reason: `A word costs ${BROKER.cost.toLocaleString()} gold.` };
  j.gold -= BROKER.cost;
  j.stats = j.stats || {};
  j.stats.hints = (j.stats.hints || 0) + 1;
  dexSeen(save, { species: sp.id });
  return { ok: true, species: sp, where: dexHabitat(sp.id), paid: BROKER.cost };
}

export function dexHabitat(speciesId) {
  const s = SPECIES_BY_ID[speciesId];
  if (!s) return null;
  const r = REGIONS[s.clade];
  return { region: r ? r.name : '', types: s.types.filter(Boolean) };
}

// The eight tiers below used to be claimed here. Achievements took the door over (see achievements.js,
// LEGACY_DEX_TIERS); DEX_REWARDS stays because `claimed` still records which of them a save already paid,
// and that list is exactly what the migration reads so nobody is paid for the same milestone twice.

/** Species of a class in dex order: by tier then name. */
export function dexSpeciesOf(clade) {
  const rank = { common: 0, uncommon: 1, rare: 2 };
  return SPECIES.filter((s) => s.clade === clade && !s.hidden).sort((a, b) => rank[a.tier] - rank[b.tier] || (a.name < b.name ? -1 : 1));
}
