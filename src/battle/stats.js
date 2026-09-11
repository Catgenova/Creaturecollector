// Level scaling and move selection. Pure functions over genomes.
import { baseStats } from '../creature/genome.js';
import { STAT_KEYS } from '../data/damage.js';
import { getMove, isDamaging } from '../data/moves.js';

/** HP gets a global lift so battles last a hit or two longer than the raw formula gives. */
export const HP_SCALE = 1.15;

/** Classic level formula. Vigor genes play the role of IVs (0..31). */
export function statsAtLevel(genome, level) {
  const base = baseStats(genome);
  const L = Math.max(1, Math.min(100, Math.round(level)));
  const iv = (k) => Math.round((genome.vigor && genome.vigor[k] != null ? genome.vigor[k] : 0.5) * 31);
  const out = { hp: Math.floor((Math.floor(((2 * base.hp + iv('hp')) * L) / 100) + L + 10) * HP_SCALE) };
  for (const k of STAT_KEYS) if (k !== 'hp') out[k] = Math.floor(((2 * base[k] + iv(k)) * L) / 100) + 5;
  return out;
}

/** Up to four moves known at a level: the most recently learned, always including a damaging one. */
export function movesAtLevel(learnset, level) {
  const known = [];
  for (const [lvl, id] of learnset) if (lvl <= level && getMove(id) && !known.includes(id)) known.push(id);
  let picked = known.slice(-4);
  if (!picked.some((id) => isDamaging(getMove(id)))) {
    const dmg = [...known].reverse().find((id) => isDamaging(getMove(id)));
    if (dmg) picked = [dmg, ...picked.slice(1)];
  }
  return picked.length ? picked : ['bump'];
}
