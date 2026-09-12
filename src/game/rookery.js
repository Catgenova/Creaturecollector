// The Rookery: a hut on the Crossroads where a creature's passive can be turned over.
// A swap moves it to another passive its own bloodline carries; a wild draw takes one from the
// pool that suits its types or its fighting style, for a good deal more gold. An Elemental's core
// passive is what makes it an Elemental, so the Rookery will not touch it.
import { SPECIES_BY_ID } from '../data/species.js';
import { ABILITIES, ABILITY_IDS, abilityName } from '../data/abilities.js';
import { isCoreAbility } from '../data/elements.js';
import { combatStyle } from '../data/damage.js';
import { makeRng } from '../core/rng.js';

export const ROOKERY = { swapBase: 900, swapPerLevel: 20, drawBase: 3500, drawPerLevel: 40 };

/** The passives this creature's bloodline carries: its species' pair, or every parent's pair for a fusion. */
export function bloodlinePassives(genome) {
  if (!genome) return [];
  const ids = new Set();
  const add = (sid) => { const sp = SPECIES_BY_ID[sid]; if (sp) for (const ab of sp.abilities || []) ids.add(ab); };
  if (genome.species) add(genome.species);
  for (const sid of genome.lineage || []) add(sid);
  return [...ids].filter((id) => ABILITIES[id] && !isCoreAbility(id));
}

/** What a swap would offer: the bloodline passives it is not already carrying. */
export function swapChoices(genome) {
  return bloodlinePassives(genome).filter((id) => id !== (genome && genome.ability));
}

/** Passives the wild draw may hand out: those keyed to one of its types, or to its own style. */
export function wildPool(genome) {
  if (!genome) return [];
  const types = (genome.types || []).filter(Boolean);
  const style = combatStyle(genome.stats || {});
  const carried = new Set([genome.ability, ...bloodlinePassives(genome)]);
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
export function rookeryBlock(member, kind = 'swap') {
  if (!member || !member.genome) return 'No creature.';
  if (isCoreAbility(member.genome.ability)) return `An Elemental keeps its core: ${abilityName(member.genome.ability)} is what it is.`;
  if (kind === 'swap' && !swapChoices(member.genome).length) return 'Its bloodline knows no other passive. A wild draw still can.';
  if (kind === 'draw' && !wildPool(member.genome).length) return 'Nothing in the wild suits it.';
  return null;
}

function rookeryMember(j, uid) {
  return (j.party || []).find((m) => m.uid === uid) || (j.box || []).find((m) => m.uid === uid) || null;
}

/** Turn a creature over to the other passive of its bloodline. Charges gold; returns what changed. */
export function swapPassive(j, uid, choice = null) {
  const m = rookeryMember(j, uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = rookeryBlock(m, 'swap');
  if (block) return { ok: false, reason: block };
  const price = swapPrice(m);
  if (j.gold < price) return { ok: false, reason: `The Rookery asks ${price.toLocaleString()} gold.` };
  const options = swapChoices(m.genome);
  const to = choice && options.includes(choice) ? choice : options[0];
  const from = m.genome.ability;
  j.gold -= price;
  m.genome.ability = to;
  return { ok: true, member: m, from, to, paid: price };
}

/** Draw a passive from the wild pool that suits its types or style. Deterministic per creature and draw count. */
export function wildDraw(j, uid) {
  const m = rookeryMember(j, uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = rookeryBlock(m, 'draw');
  if (block) return { ok: false, reason: block };
  const price = drawPrice(m);
  if (j.gold < price) return { ok: false, reason: `A wild draw costs ${price.toLocaleString()} gold.` };
  j.stats = j.stats || {};
  j.stats.draws = (j.stats.draws || 0) + 1;
  const pool = wildPool(m.genome);
  const rng = makeRng(`${j.seed}:rookery:${uid}:${j.stats.draws}`);
  const to = pool[Math.floor(rng.next() * pool.length)];
  const from = m.genome.ability;
  j.gold -= price;
  m.genome.ability = to;
  return { ok: true, member: m, from, to, paid: price };
}
