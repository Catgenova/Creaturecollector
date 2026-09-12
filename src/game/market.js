// Gold, the Market, the biome tutors and the Bag. Trainers pay gold when beaten; the Market at the
// Crossroads sells potions and the basic scrolls, each biome's tutor sells the scrolls of the types
// that live there once you hold its badge, and a camp will recall a move a creature has outgrown.
// Everything bought sits in the Bag (keyed by item or move id) until used. Pure functions over the journey.
import { MOVES, getMove } from '../data/moves.js';
import { ITEMS, ITEM_IDS, getItem, potionHeal, potionUseful } from '../data/items.js';
import { CHARMS, CHARM_IDS, CHARM_SHOP, FORGEABLE, greaterOf, getCharm } from '../data/charms.js';
import { memberMaxHp } from './party.js';
import { elementalOf } from '../creature/genome.js';
import { ELEMENTS } from '../data/elements.js';

/** A thousand gold per twenty points of power beyond the first forty; status and weak moves cost the base. */
export const MARKET = { unit: 1000, powerPerUnit: 20, maxStack: 99, basicPower: 60, tutorShare: 0.7, recallBase: 150, recallPerLevel: 10 };
/** Gold for beating a trainer: per creature, per level of their team's average; Wardens and the Council pay double, a Titan four times, rematches a quarter. */
export const GOLD = { perLevelPerCreature: 30, bossMultiplier: 2, titanMultiplier: 4, rematchShare: 0.25 };

export function moveCost(mv) {
  const m = typeof mv === 'string' ? getMove(mv) : mv;
  if (!m || m.struggle) return 0;
  return MARKET.unit * Math.max(1, Math.ceil((m.power || 0) / MARKET.powerPerUnit) - 1);
}

/** A move the Market itself stocks: the plain Normal scrolls, and anything light enough to be common stock. */
export function isBasicMove(mv) {
  const m = typeof mv === 'string' ? getMove(mv) : mv;
  return Boolean(m) && !m.struggle && !m.signature && (m.type === 'Normal' || (m.power || 0) <= MARKET.basicPower);
}

/** What the Market sells: the basics, cheapest first, then by name. The type kit comes from the tutors. */
export function marketCatalogue() {
  return MOVES.filter(isBasicMove).map((move) => ({ move, cost: moveCost(move) })).sort((a, b) => a.cost - b.cost || (a.move.name < b.move.name ? -1 : 1));
}

/**
 * What each region's tutor teaches. Nearly every class carries nearly every type once the roster is
 * 895 strong, so the kit is authored by region instead: three types apiece, each type taught in two
 * or three places, so a full kit means travelling and holding badges.
 */
export const TUTOR_TYPES = {
  mammal: ['Normal', 'Fighting', 'Ground'],
  amphibian: ['Water', 'Poison', 'Grass'],
  flora: ['Grass', 'Fairy', 'Bug'],
  insect: ['Bug', 'Flying', 'Poison'],
  nightwing: ['Flying', 'Dark', 'Ghost'],
  fungus: ['Grass', 'Poison', 'Psychic'],
  bird: ['Flying', 'Normal', 'Fighting'],
  crystalline: ['Rock', 'Psychic', 'Steel'],
  ooze: ['Poison', 'Water', 'Dark'],
  fish: ['Water', 'Ice', 'Electric'],
  myriapod: ['Bug', 'Ground', 'Steel'],
  wyrm: ['Dragon', 'Ground', 'Rock'],
  invertebrate: ['Water', 'Bug', 'Psychic'],
  skeletal: ['Ghost', 'Dark', 'Ground'],
  reptile: ['Fire', 'Rock', 'Dragon'],
  fiend: ['Fire', 'Dark', 'Fighting'],
  draconic: ['Dragon', 'Fire', 'Flying'],
  spirit: ['Ghost', 'Psychic', 'Fairy'],
};

/** The types a region's tutor teaches. */
export function tutorTypes(clade) { return TUTOR_TYPES[clade] || []; }

/** A tutor asks seven tenths of the Market's price, rounded to tens. */
export function tutorCost(mv) { return Math.round((moveCost(mv) * MARKET.tutorShare) / 10) * 10; }

/** What a region's tutor teaches: the scrolls of the types that live there, minus what the Market already stocks. */
export function tutorCatalogue(clade) {
  const types = tutorTypes(clade);
  return MOVES.filter((m) => !m.struggle && !m.signature && !isBasicMove(m) && types.includes(m.type))
    .map((move) => ({ move, cost: tutorCost(move) })).sort((a, b) => a.cost - b.cost || (a.move.name < b.move.name ? -1 : 1));
}

/** Buy a scroll from a region's tutor. The badge of that region is the price of admission. */
export function buyTutorMove(j, biomeId, clade, moveId) {
  const mv = getMove(moveId);
  if (!mv || !tutorCatalogue(clade).some((row) => row.move.id === moveId)) return { ok: false, reason: 'This tutor does not teach that.', cost: 0 };
  if (biomeId && !(j.badges || []).includes(biomeId)) return { ok: false, reason: 'The tutor teaches those who hold this region\'s badge.', cost: 0 };
  const cost = tutorCost(mv);
  if (bagCount(j, moveId) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost };
  if ((j.gold || 0) < cost) return { ok: false, reason: `Not enough gold: ${mv.name} costs ${cost.toLocaleString()}.`, cost };
  j.gold -= cost;
  bagAdd(j, moveId);
  return { ok: true, cost };
}

/** Gold for a beaten team: creature count times average level, scaled for bosses and rematches, rounded to tens. */
export function goldReward(foes, kind = 'trainer', rematch = false) {
  if (!foes || !foes.length) return 0;
  const avg = foes.reduce((s, f) => s + f.level, 0) / foes.length;
  let gold = GOLD.perLevelPerCreature * foes.length * avg;
  if (kind === 'boss' || kind === 'council') gold *= GOLD.bossMultiplier;
  if (kind === 'titan') gold *= GOLD.titanMultiplier; // it comes once a journey and it is the size of the region
  if (rematch) gold *= GOLD.rematchShare;
  return Math.max(10, Math.round(gold / 10) * 10);
}

export function bagCount(j, id) { return (j.bag && j.bag[id]) || 0; }

function bagAdd(j, id, n = 1) { j.bag = j.bag || {}; j.bag[id] = bagCount(j, id) + n; if (j.bag[id] <= 0) delete j.bag[id]; }

// ---- charms: held items, one per creature ------------------------------------------------

/** The charms on sale: type charms first, then the bands and the rest. Greater charms are forged, not sold. */
export function charmCatalogue() { return CHARM_SHOP.map((id) => ({ charm: CHARMS[id], cost: CHARMS[id].cost })); }

/** What the forge asks in gold on top of the two charms it consumes: twice the ordinary charm's price. */
export function forgeCost(charmId) { const c = getCharm(charmId); return c && !c.grade ? c.cost * 2 : 0; }

/** Every charm the Bag could forge right now: [{ from, into, cost, have, ready }]. */
export function forgeList(j) {
  return FORGEABLE.map((id) => {
    const have = bagCount(j, id), cost = forgeCost(id), into = greaterOf(id);
    return { from: CHARMS[id], into, cost, have, ready: have >= 2 && (j.gold || 0) >= cost };
  }).filter((row) => row.have > 0);
}

/** Forge two of a charm into its greater form. Consumes both and the gold. */
export function forgeCharm(j, charmId) {
  const c = getCharm(charmId), into = greaterOf(charmId);
  if (!c || !into) return { ok: false, reason: 'That charm cannot be forged.', cost: 0 };
  const cost = forgeCost(charmId);
  if (bagCount(j, charmId) < 2) return { ok: false, reason: `The forge wants two ${c.name}s; you have ${bagCount(j, charmId)}.`, cost };
  if ((j.gold || 0) < cost) return { ok: false, reason: `Forging asks ${cost.toLocaleString()} gold on top of the pair.`, cost };
  if (bagCount(j, into.id) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost };
  j.gold -= cost;
  bagAdd(j, charmId, -2);
  bagAdd(j, into.id);
  return { ok: true, cost, into };
}

/**
 * The Bag's charms: [{ charm, qty }] in shop order, with a greater charm beside the one it was forged
 * from. It reads the whole table rather than the shop, or a forged charm would sit in the bag unseen.
 */
export function charmList(j) {
  const order = new Map(CHARM_SHOP.map((id, i) => [id, i]));
  const rank = (c) => (order.has(c.from || c.id) ? order.get(c.from || c.id) : order.size);
  return CHARM_IDS.filter((id) => bagCount(j, id) > 0).map((id) => ({ charm: CHARMS[id], qty: j.bag[id] }))
    .sort((a, b) => rank(a.charm) - rank(b.charm) || (a.charm.grade || 1) - (b.charm.grade || 1));
}

/** Buy one charm. Returns { ok, reason?, cost }. */
export function buyCharm(j, charmId) {
  const c = getCharm(charmId);
  if (!c) return { ok: false, reason: 'The Market does not sell that.', cost: 0 };
  if (bagCount(j, charmId) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost: c.cost };
  if ((j.gold || 0) < c.cost) return { ok: false, reason: `Not enough gold: a ${c.name} costs ${c.cost.toLocaleString()}.`, cost: c.cost };
  j.gold -= c.cost;
  bagAdd(j, charmId);
  return { ok: true, cost: c.cost };
}

/** Names of the party and box members holding a charm. */
export function charmHolders(j, charmId) { return [...j.party, ...(j.box || [])].filter((m) => m.held === charmId).map((m) => m.genome.name); }

/** Hand a charm from the Bag to a member; whatever it held before goes back to the Bag. { ok, reason?, swapped? } */
export function giveCharm(j, uid, charmId) {
  const c = getCharm(charmId);
  if (!c || bagCount(j, charmId) <= 0) return { ok: false, reason: 'No such charm in the bag.' };
  const m = bagMember(j, uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  if (m.held === charmId) return { ok: false, reason: `${m.genome.name} already holds a ${c.name}.` };
  const swapped = m.held || null;
  bagAdd(j, charmId, -1);
  if (swapped) bagAdd(j, swapped, 1);
  m.held = charmId;
  return { ok: true, swapped };
}

/** Take a member's charm back into the Bag. { ok, reason?, charmId } */
export function takeCharm(j, uid) {
  const m = bagMember(j, uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  if (!m.held) return { ok: false, reason: `${m.genome.name} holds nothing.` };
  const charmId = m.held;
  m.held = null;
  bagAdd(j, charmId, 1);
  return { ok: true, charmId };
}

/** Every charm a list of members holds goes back to the Bag (release, fusion). */
export function returnCharms(j, members) {
  for (const m of members) if (m && m.held) { bagAdd(j, m.held, 1); m.held = null; }
  return j;
}

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
  return Object.entries(j.bag || {}).filter(([id, qty]) => qty > 0 && !getItem(id) && !getCharm(id) && getMove(id)).map(([id, qty]) => ({ move: getMove(id), qty }))
    .sort((a, b) => (a.move.type < b.move.type ? -1 : a.move.type > b.move.type ? 1 : a.move.name < b.move.name ? -1 : 1));
}

/** Buy one scroll of a move. Returns { ok, reason?, cost }. */
export function buyMove(j, moveId) {
  const mv = getMove(moveId);
  if (!mv || mv.struggle || getItem(moveId) || getCharm(moveId)) return { ok: false, reason: 'The Market does not sell that.', cost: 0 };
  if (mv.signature) return { ok: false, reason: `${mv.name} belongs to one species alone; no scroll of it exists.`, cost: 0 };
  if (!isBasicMove(mv)) return { ok: false, reason: `The Market stocks the basics. A ${mv.type} tutor out in the regions teaches ${mv.name}.`, cost: moveCost(mv) };
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

/** Moves in this creature's own learnset that it has passed in level but no longer knows. */
export function recallOptions(j, uid) {
  const m = bagMember(j, uid);
  if (!m) return [];
  const seen = new Set();
  return (m.genome.learnset || [])
    .filter(([lvl, id]) => lvl <= m.level && getMove(id) && !m.moves.includes(id) && !seen.has(id) && seen.add(id))
    .map(([lvl, id]) => ({ move: getMove(id), level: lvl }))
    .sort((a, b) => a.level - b.level);
}

/** What a camp asks to bring a move back: a base fee and a little per level. */
export function recallCost(m) { return MARKET.recallBase + MARKET.recallPerLevel * (m ? m.level : 1); }

/** Bring back a move the creature has outgrown. No scroll: the camp teaches it for gold. */
export function recallMove(j, uid, moveId, replaceIndex) {
  const m = bagMember(j, uid);
  if (!m) return { ok: false, reason: 'No such creature.', needsReplace: false };
  if (!recallOptions(j, uid).some((row) => row.move.id === moveId)) return { ok: false, reason: `${m.genome.name} never knew that.`, needsReplace: false };
  const cost = recallCost(m);
  if ((j.gold || 0) < cost) return { ok: false, reason: `Recalling a move costs ${cost.toLocaleString()} gold.`, needsReplace: false };
  const needsReplace = m.moves.length >= 4;
  let replaced = null;
  if (needsReplace) {
    if (!(replaceIndex >= 0 && replaceIndex < m.moves.length)) return { ok: false, reason: 'Choose a move to replace.', needsReplace: true };
    replaced = m.moves[replaceIndex];
    m.moves[replaceIndex] = moveId;
  } else m.moves.push(moveId);
  j.gold -= cost;
  return { ok: true, replaced, needsReplace, cost };
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
