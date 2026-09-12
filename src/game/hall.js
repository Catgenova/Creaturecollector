// The Trophy Hall at the Crossroads: gold buys shelf room for the creatures you are proudest of, and
// a dyer's bench that draws a creature a new colour morph. Both are vanity, which is the point: the
// hall changes nothing in a fight.
import { MORPHS, MORPH_IDS } from '../creature/palette.js';
import { makeRng } from '../core/rng.js';

export const HALL = { tierCost: 20000, tiers: 5, perTier: 3, morphCost: 12000 };

/** The hall as it stands: tier bought, shelf room, and who is on display. */
export function hallOf(save) {
  const h = (save && save.hall) || {};
  const tier = Math.max(0, Math.min(HALL.tiers, Math.floor(Number(h.tier) || 0)));
  const slots = Array.isArray(h.slots) ? h.slots.filter((k) => typeof k === 'string').slice(0, tier * HALL.perTier) : [];
  return { tier, slots, room: tier * HALL.perTier };
}

/** What the next tier costs, or 0 when the hall is finished. */
export function nextTierCost(save) { return hallOf(save).tier >= HALL.tiers ? 0 : HALL.tierCost; }

/** The key a collection entry is displayed under. */
export function trophyKey(genome) { return genome.gen ? `${genome.name}#${genome.seed}` : genome.species; }

/** Buy the next tier of shelf room. */
export function buyTier(save, j) {
  const hall = hallOf(save);
  if (hall.tier >= HALL.tiers) return { ok: false, reason: 'The hall is as grand as it gets.' };
  const cost = nextTierCost(save);
  if ((j.gold || 0) < cost) return { ok: false, reason: `The next wing costs ${cost.toLocaleString()} gold.` };
  j.gold -= cost;
  save.hall = { tier: hall.tier + 1, slots: hall.slots };
  return { ok: true, tier: hall.tier + 1, room: (hall.tier + 1) * HALL.perTier, paid: cost };
}

/** Put a creature from the collection on a shelf, or take it down. Free: the room was the expensive part. */
export function setTrophy(save, key, on) {
  const hall = hallOf(save);
  const slots = hall.slots.filter((k) => k !== key);
  if (on) {
    if (!hall.room) return { ok: false, reason: 'Buy a wing first.' };
    if (slots.length >= hall.room) return { ok: false, reason: 'Every shelf is full. Take one down, or buy a wing.' };
    slots.push(key);
  }
  save.hall = { tier: hall.tier, slots };
  return { ok: true, slots };
}

/** The creatures on display, in the order they were put up. */
export function trophies(save) {
  const hall = hallOf(save);
  const byKey = new Map((save.collection || []).map((e) => [trophyKey(e.genome), e]));
  return hall.slots.map((k) => byKey.get(k)).filter(Boolean);
}

/** Why the dyer cannot work on this creature, or null when it can. */
export function morphBlock(m) {
  if (!m || !m.genome) return 'No creature.';
  if (m.genome.shiny) return 'A shiny keeps the colours it was born with.';
  return null;
}

/**
 * Draw a creature a new colour morph: one of the three, or none at all, and never the one it has.
 * Deterministic per journey and per drawing, so a reload cannot fish for a better colour.
 */
export function drawMorph(j, uid) {
  const m = [...(j.party || []), ...(j.box || [])].find((x) => x.uid === uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = morphBlock(m);
  if (block) return { ok: false, reason: block };
  if ((j.gold || 0) < HALL.morphCost) return { ok: false, reason: `The dyer asks ${HALL.morphCost.toLocaleString()} gold.` };
  j.stats = j.stats || {};
  j.stats.morphs = (j.stats.morphs || 0) + 1;
  const pool = [null, ...MORPH_IDS].filter((id) => id !== (m.genome.morph || null));
  const rng = makeRng(`${j.seed}:morph:${uid}:${j.stats.morphs}`);
  const to = pool[Math.floor(rng.next() * pool.length)];
  const from = m.genome.morph || null;
  j.gold -= HALL.morphCost;
  if (to) m.genome.morph = to; else delete m.genome.morph;
  return { ok: true, member: m, from, to, paid: HALL.morphCost, name: to ? MORPHS[to].name : 'its own colours' };
}
