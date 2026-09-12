// Natures: every creature is born with one. A nature lifts one of the seven battle stats by a tenth and
// lowers another by a tenth (HP is never touched); seven of the forty-nine are even-handed and change
// nothing. Applied to level stats in battle/stats.js, rolled in genome.js and inherited through fusion.
import { STAT_NAMES } from './damage.js';

export const NATURE_STATS = ['melee', 'ranged', 'magic', 'meleeDef', 'rangedDef', 'magicDef', 'spe'];
export const NATURE_RULE = { up: 1.1, down: 0.9 };

// rows: the lifted stat; columns: the lowered stat
const GRID = {
  melee:     { ranged: 'Brash', magic: 'Fierce', meleeDef: 'Reckless', rangedDef: 'Headstrong', magicDef: 'Brazen', spe: 'Burly' },
  ranged:    { melee: 'Keen', magic: 'Cool', meleeDef: 'Restless', rangedDef: 'Rash', magicDef: 'Cocky', spe: 'Patient' },
  magic:     { melee: 'Dreamy', ranged: 'Arcane', meleeDef: 'Frail', rangedDef: 'Absent', magicDef: 'Wild', spe: 'Pensive' },
  meleeDef:  { melee: 'Placid', ranged: 'Sturdy', magic: 'Stubborn', rangedDef: 'Bracing', magicDef: 'Thick', spe: 'Stolid' },
  rangedDef: { melee: 'Cautious', ranged: 'Guarded', magic: 'Shielded', meleeDef: 'Covered', magicDef: 'Hardy', spe: 'Wary' },
  magicDef:  { melee: 'Gentle', ranged: 'Calm', magic: 'Devout', meleeDef: 'Serene', rangedDef: 'Mystic', spe: 'Sage' },
  spe:       { melee: 'Timid', ranged: 'Hasty', magic: 'Jolly', meleeDef: 'Skittish', rangedDef: 'Flighty', magicDef: 'Naive' },
};
const NEUTRAL = ['Even', 'Mild', 'Plain', 'Quiet', 'Docile', 'Bashful', 'Level'];

export const NATURES = {};
for (const up of NATURE_STATS) for (const down of NATURE_STATS) {
  const name = up === down ? NEUTRAL[NATURE_STATS.indexOf(up)] : GRID[up][down];
  const id = name.toLowerCase();
  NATURES[id] = { id, name, up: up === down ? null : up, down: up === down ? null : down };
}
export const NATURE_IDS = Object.keys(NATURES);
export const DEFAULT_NATURE = 'even';
export function getNature(id) { return NATURES[id] || null; }
export function natureMul(natureId, stat) {
  const n = NATURES[natureId];
  if (!n || !n.up) return 1;
  return stat === n.up ? NATURE_RULE.up : stat === n.down ? NATURE_RULE.down : 1;
}
/** 'Brash (+Melee Atk, −Ranged Atk)' or 'Even (no lean)'. */
export function natureLabel(natureId) {
  const n = NATURES[natureId] || NATURES[DEFAULT_NATURE];
  return n.up ? `${n.name} (+${STAT_NAMES[n.up]}, −${STAT_NAMES[n.down]})` : `${n.name} (no lean)`;
}
