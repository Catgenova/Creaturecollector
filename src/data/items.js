// Consumable items: potions of rising strength, sold at the Market, carried in the Bag and
// used on the map or in a fight (a use costs the turn). Potions never revive.
export const ITEMS = {
  potion: { id: 'potion', name: 'Potion', heal: 20, cost: 300, color: '#7fe38a', desc: 'Restores 20 HP.' },
  super_potion: { id: 'super_potion', name: 'Super Potion', heal: 60, cost: 700, color: '#4fb7ff', desc: 'Restores 60 HP.' },
  hyper_potion: { id: 'hyper_potion', name: 'Hyper Potion', heal: 150, cost: 1500, color: '#b98cff', desc: 'Restores 150 HP.' },
  max_potion: { id: 'max_potion', name: 'Max Potion', full: true, cost: 2500, color: '#ffd166', desc: 'Restores all HP.' },
  full_restore: { id: 'full_restore', name: 'Full Restore', full: true, cure: true, cost: 3000, color: '#ff7ab6', desc: 'Restores all HP and cures any status.' },
};
export const ITEM_IDS = Object.keys(ITEMS);
export function getItem(id) { return ITEMS[id] || null; }

/** HP a potion would restore on a creature with hp of maxHp (0 for a fainted or full one). */
export function potionHeal(item, hp, maxHp) {
  if (!item || hp <= 0) return 0;
  return Math.max(0, item.full ? maxHp - hp : Math.min(item.heal || 0, maxHp - hp));
}

/** Would using this potion do anything for this creature? */
export function potionUseful(item, hp, maxHp, status) {
  return potionHeal(item, hp, maxHp) > 0 || Boolean(item && item.cure && status && hp > 0);
}
