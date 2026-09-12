// The Rookery: a hut on the Crossroads where a creature's passive can be turned over.
// A swap moves it to another passive its own bloodline carries; a wild draw takes one from the
// pool that suits its types or its fighting style, for a good deal more gold.
//
// An Elemental's core is what makes it an Elemental, so nothing turns over the first slot of one:
// no swap, no draw. The second slot is a different matter — it is bought, it is empty, and an
// Elemental may buy and fill it like anything else. A core is never handed out for it: neither the
// bloodline list nor the wild pool has one in it.
import { SPECIES_BY_ID } from '../data/species.js';
import { ABILITIES, ABILITY_IDS, abilityName } from '../data/abilities.js';
import { isCoreAbility } from '../data/elements.js';
import { combatStyle } from '../data/damage.js';
import { makeRng } from '../core/rng.js';

export const ROOKERY = { swapBase: 900, swapPerLevel: 20, drawBase: 3500, drawPerLevel: 40, secondSlot: 40000 };

/** The passives this creature's bloodline carries: its species' pair, or every parent's pair for a fusion. */
export function bloodlinePassives(genome) {
  if (!genome) return [];
  const ids = new Set();
  const add = (sid) => { const sp = SPECIES_BY_ID[sid]; if (sp) for (const ab of sp.abilities || []) ids.add(ab); };
  if (genome.species) add(genome.species);
  for (const sid of genome.lineage || []) add(sid);
  return [...ids].filter((id) => ABILITIES[id] && !isCoreAbility(id));
}

/** What a swap would offer for a slot: the bloodline passives neither slot is already carrying. */
export function swapChoices(genome, slot = 1) {
  const held = new Set([genome && genome.ability, genome && genome.ability2].filter(Boolean));
  const keep = slot === 2 ? genome && genome.ability : genome && genome.ability2;
  return bloodlinePassives(genome).filter((id) => !held.has(id) || id === (slot === 2 ? genome.ability2 : genome.ability)).filter((id) => id !== keep && id !== (slot === 2 ? genome.ability2 : genome.ability));
}

/** Passives the wild draw may hand out: those keyed to one of its types, or to its own style. */
export function wildPool(genome) {
  if (!genome) return [];
  const types = (genome.types || []).filter(Boolean);
  const style = combatStyle(genome.stats || {});
  const carried = new Set([genome.ability, genome.ability2, ...bloodlinePassives(genome)].filter(Boolean));
  return ABILITY_IDS.filter((id) => {
    if (isCoreAbility(id) || carried.has(id)) return false;
    const fx = ABILITIES[id].fx;
    if (!fx) return false;
    return fx.some((f) => (f.type && types.includes(f.type)) || (f.cat && f.cat === style) || (f.stat && f.stat === style));
  });
}

export function swapPrice(member) { return ROOKERY.swapBase + ROOKERY.swapPerLevel * (member ? member.level : 1); }
export function drawPrice(member) { return ROOKERY.drawBase + ROOKERY.drawPerLevel * (member ? member.level : 1); }

/** Why the Rookery would turn this creature away, or null when it can help. */
export function rookeryBlock(member, kind = 'swap', slot = 1) {
  if (!member || !member.genome) return 'No creature.';
  // the core sits in the first slot and stays there; everything else about an Elemental is ordinary
  if (isCoreAbility(member.genome.ability) && slot === 1 && (kind === 'swap' || kind === 'draw')) {
    return `An Elemental keeps its core: ${abilityName(member.genome.ability)} cannot be turned over. Its second slot can.`;
  }
  if (slot === 2 && !member.genome.ability2) return 'This creature has only one slot. Open the second one first.';
  if (kind === 'swap' && !swapChoices(member.genome, slot).length) return 'Its bloodline knows no other passive. A wild draw still can.';
  if (kind === 'draw' && !wildPool(member.genome).length) return 'Nothing in the wild suits it.';
  if (kind === 'second') {
    if (member.genome.ability2) return 'Both of its slots are open already.';
    if (!swapChoices(member.genome, 2).length && !wildPool(member.genome).length) return 'There is nothing to put in a second slot.';
  }
  return null;
}

/** What the Rookery asks to open a creature's second slot: a flat, deliberate sum. */
export function secondSlotPrice() { return ROOKERY.secondSlot; }

/**
 * Open a creature's second passive slot for good and fill it: with a bloodline passive when it has one
 * spare, otherwise with the first of the wild pool. It is bought once and never closes.
 */
export function openSecondSlot(j, uid, choice = null) {
  const m = rookeryMember(j, uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = rookeryBlock(m, 'second');
  if (block) return { ok: false, reason: block };
  const price = secondSlotPrice();
  if (j.gold < price) return { ok: false, reason: `A second slot costs ${price.toLocaleString()} gold.` };
  const options = swapChoices(m.genome, 2);
  const pool = options.length ? options : wildPool(m.genome);
  const to = choice && pool.includes(choice) ? choice : pool[0];
  if (!to) return { ok: false, reason: 'There is nothing to put in a second slot.' };
  j.gold -= price;
  m.genome.ability2 = to;
  return { ok: true, member: m, to, paid: price };
}

function rookeryMember(j, uid) {
  return (j.party || []).find((m) => m.uid === uid) || (j.box || []).find((m) => m.uid === uid) || null;
}

/** Turn a creature over to the other passive of its bloodline. Charges gold; returns what changed. */
export function swapPassive(j, uid, choice = null, slot = 1) {
  const m = rookeryMember(j, uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = rookeryBlock(m, 'swap', slot);
  if (block) return { ok: false, reason: block };
  const price = swapPrice(m);
  if (j.gold < price) return { ok: false, reason: `The Rookery asks ${price.toLocaleString()} gold.` };
  const options = swapChoices(m.genome, slot);
  const to = choice && options.includes(choice) ? choice : options[0];
  const from = slot === 2 ? m.genome.ability2 : m.genome.ability;
  j.gold -= price;
  if (slot === 2) m.genome.ability2 = to; else m.genome.ability = to;
  return { ok: true, member: m, from, to, paid: price, slot };
}

/** Draw a passive from the wild pool that suits its types or style. Deterministic per creature and draw count. */
export function wildDraw(j, uid, slot = 1) {
  const m = rookeryMember(j, uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = rookeryBlock(m, 'draw', slot);
  if (block) return { ok: false, reason: block };
  const price = drawPrice(m);
  if (j.gold < price) return { ok: false, reason: `A wild draw costs ${price.toLocaleString()} gold.` };
  j.stats = j.stats || {};
  j.stats.draws = (j.stats.draws || 0) + 1;
  const pool = wildPool(m.genome);
  const rng = makeRng(`${j.seed}:rookery:${uid}:${j.stats.draws}`);
  const to = pool[Math.floor(rng.next() * pool.length)];
  const from = slot === 2 ? m.genome.ability2 : m.genome.ability;
  j.gold -= price;
  if (slot === 2) m.genome.ability2 = to; else m.genome.ability = to;
  return { ok: true, member: m, from, to, paid: price, slot };
}
