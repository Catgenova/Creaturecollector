// Damage types. Every attack is Melee, Ranged or Magic, each with its own offensive and
// defensive stat, and they form a triangle: Magic beats Ranged, Ranged beats Melee, Melee
// beats Magic. A creature's combat style is the damage type of its highest attack stat; hits
// that beat the target's style land harder and hits its style beats land softer.
export const DAMAGE_TYPES = {
  melee:  { id: 'melee',  name: 'Melee',  icon: '⚔', atk: 'melee',  def: 'meleeDef',  beats: 'magic',  color: '#e8734a' },
  ranged: { id: 'ranged', name: 'Ranged', icon: '➶', atk: 'ranged', def: 'rangedDef', beats: 'melee',  color: '#4fc0a0' },
  magic:  { id: 'magic',  name: 'Magic',  icon: '✦', atk: 'magic',  def: 'magicDef',  beats: 'ranged', color: '#a98bff' },
};
export const DAMAGE_TYPE_IDS = Object.keys(DAMAGE_TYPES);
export const TRIANGLE = { edge: 1.25, weak: 0.8 };

export const STAT_KEYS = ['hp', 'melee', 'ranged', 'magic', 'meleeDef', 'rangedDef', 'magicDef', 'spe'];
export const STAT_NAMES = { hp: 'HP', melee: 'Melee Atk', ranged: 'Ranged Atk', magic: 'Magic Atk', meleeDef: 'Melee Def', rangedDef: 'Ranged Def', magicDef: 'Magic Def', spe: 'Speed' };
export const STAT_SHORT = { hp: 'HP', melee: 'MEL', ranged: 'RNG', magic: 'MAG', meleeDef: 'M.DEF', rangedDef: 'R.DEF', magicDef: 'G.DEF', spe: 'SPE' };
/** Stage-able stats in battle (the seven scaling stats plus accuracy and evasion). */
export const STAGE_KEYS = ['melee', 'ranged', 'magic', 'meleeDef', 'rangedDef', 'magicDef', 'spe', 'acc', 'eva'];

export function damageTypeName(id) { return DAMAGE_TYPES[id] ? DAMAGE_TYPES[id].name : 'Status'; }

/** Multiplier for a hit of damage type `dt` against a creature of combat style `style`. */
export function triangleMul(dt, style) {
  const a = DAMAGE_TYPES[dt];
  if (!a || !DAMAGE_TYPES[style]) return 1;
  if (a.beats === style) return TRIANGLE.edge;
  if (DAMAGE_TYPES[style].beats === dt) return TRIANGLE.weak;
  return 1;
}
/** 'edge' when dt beats the style, 'weak' when the style beats dt, else null. */
export function triangleEdge(dt, style) {
  const m = triangleMul(dt, style);
  return m > 1 ? 'edge' : m < 1 ? 'weak' : null;
}

/** The damage type of the highest attack stat in a stat table (base stats, weights or level stats). Ties go melee, ranged, magic. */
export function combatStyle(stats) {
  let best = 'melee';
  for (const id of DAMAGE_TYPE_IDS) if ((stats[id] || 0) > (stats[best] || 0)) best = id;
  return best;
}

// ---- migration from the old six-stat layout (hp, atk, def, spa, spd, spe) ----------------
const r3 = (v) => Math.round(v * 1000) / 1000;

/**
 * Convert old stat weights to the eight-stat layout. The old attack and special pools are
 * split three ways with `style` taking half; old Defense feeds Melee Def (two thirds) and Ranged
 * Def, old Sp. Def feeds Magic Def (two thirds) and Ranged Def. Returns weights that sum to 1.
 */
export function migrateStatWeights(old, style = 'melee') {
  const atk = old.atk || 0, spa = old.spa || 0, def = old.def || 0, spd = old.spd || 0;
  const O = atk + spa, D = def + spd;
  const phys = atk >= spa;
  const off = { melee: 0, ranged: 0, magic: 0 };
  off[style] = 0.5 * O;
  const others = DAMAGE_TYPE_IDS.filter((k) => k !== style);
  // the leftover that matches the old dominant pool (physical -> melee/ranged, special -> magic) gets the larger share
  const favoured = others.find((k) => (k === 'magic') !== phys) || others[0];
  for (const k of others) off[k] = (k === favoured ? 0.3 : 0.2) * O;
  const w = {
    hp: old.hp || 0, melee: off.melee, ranged: off.ranged, magic: off.magic,
    meleeDef: (2 / 3) * def, rangedDef: (def + spd) / 3, magicDef: (2 / 3) * spd, spe: old.spe || 0,
  };
  const total = STAT_KEYS.reduce((a, k) => a + w[k], 0) || 1;
  for (const k of STAT_KEYS) w[k] = r3(w[k] / total);
  w.hp = r3(w.hp + (1 - STAT_KEYS.reduce((a, k) => a + w[k], 0)));
  return w;
}

/** Old vigor (IV-like genes) mapped onto the new keys. */
export function migrateVigor(old) {
  const v = (k, d = 0.5) => (old && old[k] != null ? old[k] : d);
  return { hp: v('hp'), melee: v('atk'), ranged: v('atk'), magic: v('spa'), meleeDef: v('def'), rangedDef: v('def'), magicDef: v('spd'), spe: v('spe') };
}
export function isOldStatLayout(stats) { return Boolean(stats) && typeof stats === 'object' && stats.melee == null && (stats.atk != null || stats.spa != null); }
