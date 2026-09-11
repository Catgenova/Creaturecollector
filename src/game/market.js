// Gold, the Market and the Bag. Trainers pay gold when beaten; the Market at the Crossroads
// sells every move as a single-use scroll priced by power; scrolls sit in the Bag until they
// are taught to a creature. Pure functions over the journey object.
import { MOVES, getMove } from '../data/moves.js';

/** A thousand gold per twenty points of power beyond the first forty; status and weak moves cost the base. */
export const MARKET = { unit: 1000, powerPerUnit: 20, maxStack: 99 };
/** Gold for beating a trainer: per creature, per level of their team's average; Wardens and the Council pay double, rematches a quarter. */
export const GOLD = { perLevelPerCreature: 30, bossMultiplier: 2, rematchShare: 0.25 };

export function moveCost(mv) {
  const m = typeof mv === 'string' ? getMove(mv) : mv;
  if (!m || m.struggle) return 0;
  return MARKET.unit * Math.max(1, Math.ceil((m.power || 0) / MARKET.powerPerUnit) - 1);
}

/** Everything the Market sells: every move, cheapest first, then by name. */
export function marketCatalogue() {
  return MOVES.filter((m) => !m.struggle).map((move) => ({ move, cost: moveCost(move) })).sort((a, b) => a.cost - b.cost || (a.move.name < b.move.name ? -1 : 1));
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

export function bagCount(j, moveId) { return (j.bag && j.bag[moveId]) || 0; }

/** The Bag's contents, one line per move: [{ move, qty }], by type then name. */
export function bagList(j) {
  return Object.entries(j.bag || {}).filter(([id, qty]) => qty > 0 && getMove(id)).map(([id, qty]) => ({ move: getMove(id), qty }))
    .sort((a, b) => (a.move.type < b.move.type ? -1 : a.move.type > b.move.type ? 1 : a.move.name < b.move.name ? -1 : 1));
}

/** Buy one scroll of a move. Returns { ok, reason?, cost }. */
export function buyMove(j, moveId) {
  const mv = getMove(moveId);
  if (!mv || mv.struggle) return { ok: false, reason: 'The Market does not sell that.', cost: 0 };
  const cost = moveCost(mv);
  if (bagCount(j, moveId) >= MARKET.maxStack) return { ok: false, reason: 'Your bag cannot hold more of those.', cost };
  if ((j.gold || 0) < cost) return { ok: false, reason: `Not enough gold: ${mv.name} costs ${cost}.`, cost };
  j.gold -= cost;
  j.bag = j.bag || {};
  j.bag[moveId] = bagCount(j, moveId) + 1;
  return { ok: true, cost };
}

function bagMember(j, uid) { return [...j.party, ...j.box].find((m) => m.uid === uid) || null; }

/** Can this scroll be taught to this creature? { ok, reason?, needsReplace } */
export function canTeach(j, uid, moveId) {
  const mv = getMove(moveId);
  if (!mv || bagCount(j, moveId) <= 0) return { ok: false, reason: 'No such scroll in the bag.', needsReplace: false };
  const m = bagMember(j, uid);
  if (!m) return { ok: false, reason: 'No such creature.', needsReplace: false };
  if (m.moves.includes(moveId)) return { ok: false, reason: `${m.genome.name} already knows ${mv.name}.`, needsReplace: false };
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
