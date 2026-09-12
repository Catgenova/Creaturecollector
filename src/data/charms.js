// Held charms: one per creature, carried into every fight. Type charms lift one type's moves, bands lift
// one damage type, and the utility charms add a small passive of their own. Sold at the Market, given by
// Wardens with their badge, and swapped freely from the Bag; a released or fused creature's charm goes
// back to the Bag. The engine reads `held` on a battler by charm kind.
import { TYPE_LIST, TYPE_INFO } from './types.js';

const TYPE_CHARM_NAMES = {
  Fire: 'Ember Charm', Water: 'Tide Charm', Electric: 'Spark Charm', Grass: 'Leaf Charm', Ice: 'Frost Charm', Fighting: 'Fist Charm',
  Poison: 'Venom Charm', Ground: 'Loam Charm', Flying: 'Feather Charm', Psychic: 'Mind Charm', Bug: 'Chitin Charm', Rock: 'Stone Charm',
  Ghost: 'Wisp Charm', Dragon: 'Scale Charm', Dark: 'Dusk Charm', Steel: 'Rivet Charm', Fairy: 'Glimmer Charm', Normal: 'Plain Charm',
};

/** How much a type charm lifts its type's moves, a band its damage type, the Swift Charm its holder's Speed. */
export const CHARM_RULE = { typeMul: 1.2, styleMul: 1.1, speedMul: 1.1, regen: 1 / 16, siphon: 1 / 8, xpMul: 1.5, goldMul: 1.5, lureMul: 2, prismMul: 10 };

export const CHARMS = {};
for (const t of TYPE_LIST) {
  const id = `${t.toLowerCase()}_charm`;
  CHARMS[id] = { id, name: TYPE_CHARM_NAMES[t], kind: 'type', type: t, cost: 2500, color: TYPE_INFO[t].color, desc: `${t} moves hit 1.2x harder.` };
}
Object.assign(CHARMS, {
  brawler_band: { id: 'brawler_band', name: "Brawler's Band", kind: 'style', style: 'melee', cost: 3000, color: '#e8734a', desc: 'Melee moves hit 1.1x harder.' },
  marksman_band: { id: 'marksman_band', name: "Marksman's Band", kind: 'style', style: 'ranged', cost: 3000, color: '#4fc0a0', desc: 'Ranged moves hit 1.1x harder.' },
  sage_band: { id: 'sage_band', name: "Sage's Band", kind: 'style', style: 'magic', cost: 3000, color: '#a98bff', desc: 'Magic moves hit 1.1x harder.' },
  moss_charm: { id: 'moss_charm', name: 'Moss Charm', kind: 'regen', cost: 3500, color: '#6fbf5a', desc: 'Restores a sixteenth of max HP at the end of every turn.' },
  siphon_charm: { id: 'siphon_charm', name: 'Siphon Charm', kind: 'siphon', cost: 3500, color: '#c95a8a', desc: 'Heals an eighth of the damage its holder deals.' },
  sturdy_charm: { id: 'sturdy_charm', name: 'Sturdy Charm', kind: 'sturdy', cost: 4000, color: '#9a9a9a', desc: 'Once a battle, survives a hit that would knock it out from full HP with 1 HP left.' },
  hawk_charm: { id: 'hawk_charm', name: 'Hawk Charm', kind: 'crit', cost: 3000, color: '#d8a35a', desc: 'Critical hits land twice as often.' },
  swift_charm: { id: 'swift_charm', name: 'Swift Charm', kind: 'speed', cost: 3000, color: '#7fd6e6', desc: 'Speed is 1.1x.' },
  salve_charm: { id: 'salve_charm', name: 'Salve Charm', kind: 'salve', cost: 3000, color: '#f2a5c8', desc: 'Once a battle, cures its holder’s status at the end of the turn.' },
  scholar_charm: { id: 'scholar_charm', name: "Scholar's Charm", kind: 'xp', cost: 5000, color: '#4f8ef7', desc: 'Its holder earns half again the experience.' },
  lucky_coin: { id: 'lucky_coin', name: 'Lucky Coin', kind: 'gold', cost: 4000, color: '#f5c518', desc: 'Trainers pay half again the gold while a party member holds it.' },
  lure_charm: { id: 'lure_charm', name: 'Lure Charm', kind: 'lure', cost: 1500, color: '#b6f06a', desc: 'Wild creatures turn up twice as often while the lead holds it.' },
  prism_charm: { id: 'prism_charm', name: 'Prism Charm', kind: 'prism', cost: 12000, color: '#e6e0ff', desc: 'Wild creatures are born Elemental ten times as often while the lead holds it.' },
});
/**
 * Greater charms: forged at the Market from two of the same charm and gold, never sold. Each carries its
 * own numbers, so the engine reads the charm rather than the table of defaults.
 */
export const GREATER = {
  type: { typeMul: 1.35, desc: (c) => `${c.type} moves hit 1.35x harder.` },
  style: { styleMul: 1.18, desc: (c) => `${c.style[0].toUpperCase()}${c.style.slice(1)} moves hit 1.18x harder.` },
  regen: { regen: 1 / 10, desc: () => 'Restores a tenth of max HP at the end of every turn.' },
  siphon: { siphon: 1 / 5, desc: () => 'Heals a fifth of the damage its holder deals.' },
  sturdy: { uses: 2, desc: () => 'Twice a battle, survives a hit that would knock it out from full HP with 1 HP left.' },
  crit: { critMul: 3, desc: () => 'Critical hits land three times as often.' },
  speed: { speedMul: 1.18, desc: () => 'Speed is 1.18x.' },
  salve: { uses: 2, desc: () => 'Twice a battle, cures its holder’s status at the end of the turn.' },
  xp: { xpMul: 2, desc: () => 'Its holder earns twice the experience.' },
  gold: { goldMul: 2, desc: () => 'Trainers pay twice the gold while a party member holds it.' },
  lure: { lureMul: 3, desc: () => 'Wild creatures turn up three times as often while the lead holds it.' },
  prism: { prismMul: 25, desc: () => 'Wild creatures are born Elemental twenty-five times as often while the lead holds it.' },
};
for (const id of Object.keys(CHARMS)) {
  const base = CHARMS[id], up = GREATER[base.kind];
  if (!up) continue;
  const { desc, ...values } = up;
  CHARMS[`${id}_2`] = { ...base, ...values, id: `${id}_2`, name: `Greater ${base.name}`, grade: 2, from: id, cost: base.cost * 3, desc: desc(base) };
}

export const CHARM_IDS = Object.keys(CHARMS);
export function getCharm(id) { return CHARMS[id] || null; }
/** Everything the Market sells, type charms first, then the bands and the rest by price. Greater charms are forged, never sold. */
export const CHARM_SHOP = CHARM_IDS.filter((id) => !CHARMS[id].grade);
/** The charms a forge can make: every ordinary charm whose kind has a greater form. */
export const FORGEABLE = CHARM_SHOP.filter((id) => CHARMS[`${id}_2`]);
/** The greater form of a charm, or null. */
export function greaterOf(id) { return CHARMS[`${id}_2`] || null; }

/** The charm a Warden hands over with their badge: one per biome, no two alike. */
export const WARDEN_CHARMS = {
  mammal: 'brawler_band', amphibian: 'water_charm', flora: 'grass_charm', insect: 'bug_charm', nightwing: 'dark_charm', fungus: 'salve_charm',
  bird: 'flying_charm', crystalline: 'rock_charm', ooze: 'poison_charm', fish: 'marksman_band', myriapod: 'swift_charm', wyrm: 'dragon_charm',
  invertebrate: 'siphon_charm', skeletal: 'ghost_charm', reptile: 'fire_charm', fiend: 'hawk_charm', draconic: 'sage_band', spirit: 'moss_charm',
};

/** A charm's own number for a rule, or the ordinary one. A greater charm carries its own. */
export function charmValue(heldId, key) {
  const c = CHARMS[heldId];
  return c && c[key] != null ? c[key] : CHARM_RULE[key];
}
/** How many times a once-a-battle charm may fire. */
export function charmUses(heldId) { const c = CHARMS[heldId]; return c && c.uses ? c.uses : 1; }

/** Power multiplier a held charm gives a move (1 when it does not apply). */
export function charmPowerMul(heldId, mv) {
  const c = CHARMS[heldId];
  if (!c || !mv || mv.typeless) return 1;
  if (c.kind === 'type' && c.type === mv.type) return charmValue(heldId, 'typeMul');
  if (c.kind === 'style' && c.style === mv.cat) return charmValue(heldId, 'styleMul');
  return 1;
}
/** Is this charm of this kind? */
export function heldKind(heldId) { const c = CHARMS[heldId]; return c ? c.kind : null; }
