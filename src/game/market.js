// Gold, the Market and the Bag. Trainers pay gold when beaten; the Market at the Crossroads
// sells potions and every move as a single-use scroll priced by power; both sit in the Bag
// (keyed by item or move id) until used. Pure functions over the journey object.
import { MOVES, getMove } from '../data/moves.js';
import { ITEMS, ITEM_IDS, getItem, potionHeal, potionUseful } from '../data/items.js';
import { memberMaxHp } from './party.js';
import { elementalOf } from '../creature/genome.js';
import { ELEMENTS } from '../data/elements.js';

/** A thousand gold per twenty points of power beyond the first forty; status and weak moves cost the base. */
export const MARKET = { unit: 1000, powerPerUnit: 20, maxStack: 99 };
/** Gold for beating a trainer: per creature, per level of their team's average; Wardens and the Council pay double, rematches a quarter. */
export const GOLD = { perLevelPerCreature: 30, bossMultiplier: 2, rematchShare: 0.25 };

export function moveCost(mv) {
  const m = typeof mv === 'string' ? getMove(mv) : mv;
  if (!m || m.struggle) return 0;
  return MARKET.unit * Math.max(1, Math.ceil((m.power || 0) / MARKET.powerPerUnit) - 1);
}

/** Everything the Market sells: every move but the rares' signatures, cheapest first, then by name. */
export function marketCatalogue() {
  return MOVES.filter((m) => !m.struggle && !m.signature).map((move) => ({ move, cost: moveCost(move) })).sort((a, b) => a.cost - b.cost || (a.move.name < b.move.name ? -1 : 1));
}

/** Gold for a beaten team: creature count times average level, scaled for bosses and rematches, rounded to tens. */
export function goldReward(foes, kind = 'trainer', rematch = false) {
  if (!foes || !foes.length) return 0;
  const avg = foes.reduce((s, f) => s + f.level, 0) / foes.length;
  let gold = GOLD.perLevelPerCreature * foes.length * avg;
  if (kind === 'boss' || kind === 'council') gold *= GOLD.bossMultiplier;
  if (rematch) gold *= GOLD.rematchShare;
  return Math.max(10, Math.round(gold / 10) * 10);
}

export function bagCount(j, id) { return (j.bag && j.bag[id]) || 0; }

/** The potions on sale, weakest first. */
export function itemCatalogue() { return ITEM_IDS.map((id) => ({ item: ITEMS[id], cost: ITEMS[id].cost })); }

/** The Bag's potions: [{ item, qty }], weakest first. */
export function itemList(j) {
  return ITEM_IDS.filter((id) => (j.bag && j.bag[id]) > 0).map((id) => ({ item: ITEMS[id], qty: j.bag[id] }));
}

/** Buy one potion. Returns { ok, reason?, cost }. */
export function buyItem(j, itemId) {
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: 'The Market does not sell that.', cost: 0 };
  if (bagCount(j, itemId) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost: item.cost };
  if ((j.gold || 0) < item.cost) return { ok: false, reason: `Not enough gold: a ${item.name} costs ${item.cost}.`, cost: item.cost };
  j.gold -= item.cost;
  j.bag = j.bag || {};
  j.bag[itemId] = bagCount(j, itemId) + 1;
  return { ok: true, cost: item.cost };
}

/** Use a potion on a party member out of battle. Returns { ok, reason?, amount, cured }. */
export function useItem(j, uid, itemId) {
  const item = getItem(itemId);
  if (!item || bagCount(j, itemId) <= 0) return { ok: false, reason: 'No such item in the bag.' };
  const m = j.party.find((x) => x.uid === uid);
  if (!m) return { ok: false, reason: 'Potions are used on party members.' };
  const max = memberMaxHp(m);
  if (m.hp <= 0) return { ok: false, reason: `${m.genome.name} has fainted; a camp will bring it round.` };
  if (!potionUseful(item, m.hp, max, m.status)) return { ok: false, reason: `${m.genome.name} is already at full health.` };
  const amount = potionHeal(item, m.hp, max);
  m.hp += amount;
  const cured = item.cure && m.status ? m.status : null;
  if (cured) m.status = null;
  j.bag[itemId] -= 1;
  if (j.bag[itemId] <= 0) delete j.bag[itemId];
  return { ok: true, amount, healed: amount, cured };
}

/** The potions to carry into a fight: { id: qty } for every stocked potion. */
export function battleItems(j) {
  const out = {};
  for (const id of ITEM_IDS) if (bagCount(j, id) > 0) out[id] = bagCount(j, id);
  return out;
}

/** After a fight, the bag keeps what the fight left: potions used in battle are gone. */
export function syncBagFromBattle(j, state) {
  if (!state || !state.items) return j;
  j.bag = j.bag || {};
  for (const id of ITEM_IDS) {
    const left = Math.max(0, Math.floor(state.items[id] || 0));
    if (left > 0) j.bag[id] = left; else delete j.bag[id];
  }
  return j;
}

/** The Bag's contents, one line per move: [{ move, qty }], by type then name. */
export function bagList(j) {
  return Object.entries(j.bag || {}).filter(([id, qty]) => qty > 0 && !getItem(id) && getMove(id)).map(([id, qty]) => ({ move: getMove(id), qty }))
    .sort((a, b) => (a.move.type < b.move.type ? -1 : a.move.type > b.move.type ? 1 : a.move.name < b.move.name ? -1 : 1));
}

/** Buy one scroll of a move. Returns { ok, reason?, cost }. */
export function buyMove(j, moveId) {
  const mv = getMove(moveId);
  if (!mv || mv.struggle || getItem(moveId)) return { ok: false, reason: 'The Market does not sell that.', cost: 0 };
  if (mv.signature) return { ok: false, reason: `${mv.name} belongs to one species alone; no scroll of it exists.`, cost: 0 };
  const cost = moveCost(mv);
  if (bagCount(j, moveId) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost };
  if ((j.gold || 0) < cost) return { ok: false, reason: `Not enough gold: ${mv.name} costs ${cost}.`, cost };
  j.gold -= cost;
  j.bag = j.bag || {};
  j.bag[moveId] = bagCount(j, moveId) + 1;
  return { ok: true, cost };
}

function bagMember(j, uid) { return [...j.party, ...j.box].find((m) => m.uid === uid) || null; }

/** "Ice, Water and Normal" */
export function listWords(items) { return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] || ''; }

/** The move types a creature can learn from scrolls: its own types, its Elemental aura's element when it has one, and Normal, which everyone learns. */
export function scrollTypes(g) {
  const out = [...(g && g.types ? g.types : [])];
  const elem = elementalOf(g);
  if (elem) for (const t of ELEMENTS[elem.id].types) if (!out.includes(t)) out.push(t);
  if (!out.includes('Normal')) out.push('Normal');
  return out;
}

/** Could this creature ever learn this scroll? Moves of its own types, of its Elemental element, or Normal. { ok, reason? } */
export function canLearnScroll(g, moveId) {
  const mv = getMove(moveId);
  if (!mv) return { ok: false, reason: 'No such move.' };
  const types = scrollTypes(g);
  if (types.includes(mv.type)) return { ok: true };
  return { ok: false, reason: `${g.name} cannot learn ${mv.type} moves from a scroll; it learns ${listWords(types)}.` };
}

/** Names of the party and box members who can learn this scroll's type. */
export function scrollLearners(j, moveId) {
  return [...j.party, ...j.box].filter((m) => canLearnScroll(m.genome, moveId).ok).map((m) => m.genome.name);
}

/** Can this scroll be taught to this creature now? { ok, reason?, code?: 'type'|'known', needsReplace } */
export function canTeach(j, uid, moveId) {
  const mv = getMove(moveId);
  if (!mv || bagCount(j, moveId) <= 0) return { ok: false, reason: 'No such scroll in the bag.', needsReplace: false };
  const m = bagMember(j, uid);
  if (!m) return { ok: false, reason: 'No such creature.', needsReplace: false };
  const learn = canLearnScroll(m.genome, moveId);
  if (!learn.ok) return { ok: false, reason: learn.reason, code: 'type', needsReplace: false };
  if (m.moves.includes(moveId)) return { ok: false, reason: `${m.genome.name} already knows ${mv.name}.`, code: 'known', needsReplace: false };
  return { ok: true, needsReplace: m.moves.length >= 4 };
}

/** Teach a scroll to a creature, replacing the move at replaceIndex when it already knows four. Consumes the scroll. */
export function teachMove(j, uid, moveId, replaceIndex) {
  const check = canTeach(j, uid, moveId);
  if (!check.ok) return check;
  const m = bagMember(j, uid);
  let replaced = null;
  if (check.needsReplace) {
    if (!(replaceIndex >= 0 && replaceIndex < m.moves.length)) return { ok: false, reason: 'Choose a move to replace.', needsReplace: true };
    replaced = m.moves[replaceIndex];
    m.moves[replaceIndex] = moveId;
  } else m.moves.push(moveId);
  j.bag[moveId] -= 1;
  if (j.bag[moveId] <= 0) delete j.bag[moveId];
  return { ok: true, replaced, needsReplace: check.needsReplace };
}
