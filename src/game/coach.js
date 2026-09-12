// Stat coaching at the camps: gold moves a point of a creature's spread from one stat to another.
// The total never changes, so a coached creature is a different build and not a stronger one; a
// creature may be coached ten times, and no stat may be starved below a twentieth or fattened past
// three tenths of its total.
import { STAT_KEYS, STAT_NAMES } from '../data/damage.js';
import { statsAtLevel } from '../battle/stats.js';

export const COACH = { base: 2000, perLevel: 50, step: 0.01, sessions: 10, floor: 0.05, ceiling: 0.3 };

export function coachCost(m) { return COACH.base + COACH.perLevel * (m ? m.level : 1); }
export function coachDone(m) { return (m && m.genome && m.genome.coached) || 0; }
export function coachLeft(m) { return Math.max(0, COACH.sessions - coachDone(m)); }
export const coachStats = () => STAT_KEYS.slice();
export const statLabel = (k) => STAT_NAMES[k] || k;

/** Why this creature cannot move a point from `from` to `to`, or null when it can. */
export function coachBlock(m, from, to) {
  if (!m || !m.genome) return 'No creature.';
  if (!STAT_KEYS.includes(from) || !STAT_KEYS.includes(to)) return 'That is not a stat.';
  if (from === to) return 'Pick two different stats.';
  if (!coachLeft(m)) return `${m.genome.name} has learned all it can: ${COACH.sessions} sessions is the limit.`;
  const stats = m.genome.stats || {};
  if ((stats[from] || 0) - COACH.step < COACH.floor - 1e-9) return `Its ${statLabel(from)} is as low as coaching can take it.`;
  if ((stats[to] || 0) + COACH.step > COACH.ceiling + 1e-9) return `Its ${statLabel(to)} is as high as coaching can take it.`;
  return null;
}

/**
 * Move one point of the spread from one stat to another for gold. The sum is unchanged, so the
 * creature's base total stays exactly where the tuner put it.
 */
export function coachMember(j, uid, from, to) {
  const m = [...(j.party || []), ...(j.box || [])].find((x) => x.uid === uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = coachBlock(m, from, to);
  if (block) return { ok: false, reason: block };
  const cost = coachCost(m);
  if ((j.gold || 0) < cost) return { ok: false, reason: `A session costs ${cost.toLocaleString()} gold.` };
  j.gold -= cost;
  const stats = m.genome.stats;
  stats[from] = Math.round((stats[from] - COACH.step) * 1000) / 1000;
  stats[to] = Math.round((stats[to] + COACH.step) * 1000) / 1000;
  m.genome.coached = coachDone(m) + 1;
  if (from === 'hp' || to === 'hp') m.hp = Math.max(1, Math.min(m.hp, statsAtLevel(m.genome, m.level).hp));
  return { ok: true, member: m, from, to, paid: cost, left: coachLeft(m) };
}
