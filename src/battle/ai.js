// Opponent AI: a scored heuristic. Deterministic given its rng.
import { STRUGGLE, getMove, isDamaging, moveFx } from '../data/moves.js';
import { legalActions, activeOf, calcDamage, moveEffectiveness, effectiveStat } from './engine.js';

function bestEffVs(attacker, defender) {
  let best = 0;
  for (const m of attacker.moves) {
    const mv = getMove(m.id);
    if (!mv || !isDamaging(mv) || m.pp <= 0) continue;
    best = Math.max(best, moveEffectiveness(mv, defender) * (attacker.types.includes(mv.type) ? 1.5 : 1));
  }
  return best;
}

function scoreMove(state, side, action, rng) {
  const me = activeOf(state, side), foe = activeOf(state, 1 - side);
  const mv = action.struggle ? STRUGGLE : getMove(me.moves[action.index].id);
  const acc = mv.acc == null ? 1 : mv.acc / 100;
  const faster = effectiveStat(me, 'spe') > effectiveStat(foe, 'spe') || mv.prio > 0;
  if (isDamaging(mv)) {
    const eff = moveEffectiveness(mv, foe);
    if (eff === 0) return -60;
    const est = calcDamage(me, foe, mv, eff, 0.925, false);
    const frac = Math.min(1, est / Math.max(1, foe.hp));
    let s = frac * 100 * acc;
    if (est >= foe.hp) s = 110 * acc + (faster ? 25 : 0);
    for (const f of mv.fx) {
      const p = (f.p == null ? 100 : f.p) / 100;
      if (f.k === 'status' && !foe.status) s += 25 * p;
      if (f.k === 'stat' && f.who === 'foe') s += 6 * p * Object.values(f.stats).reduce((a, b) => a + Math.abs(b), 0);
      if (f.k === 'stat' && f.who === 'self') s += 5 * p * Object.values(f.stats).reduce((a, b) => a + b, 0);
      if (f.k === 'drain') s += frac * 25 * f.r;
      if (f.k === 'recoil') s -= frac * 20 * f.r;
      if (f.k === 'flinch' && faster) s += 15 * p;
    }
    if (mv.struggle) s -= 30;
    return s;
  }
  let s = 0;
  for (const f of mv.fx) {
    if (f.k === 'status') {
      if (foe.status) s -= 25;
      else s += (f.s === 'slp' ? 50 : f.s === 'par' ? 38 : f.s === 'brn' ? (foe.stats.atk > foe.stats.spa ? 42 : 24) : f.s === 'psn' ? 30 : 30) * acc;
    } else if (f.k === 'stat' && f.who === 'self') {
      const room = Object.entries(f.stats).reduce((a, [k, n]) => a + Math.max(0, Math.min(n, 6 - me.stages[k])), 0);
      s += me.hp > me.maxHp * 0.55 ? 15 * room + (state.turn < 2 ? 6 : 0) : 4 * room;
    } else if (f.k === 'stat' && f.who === 'foe') {
      const room = Object.entries(f.stats).reduce((a, [k, n]) => a + Math.max(0, Math.min(-n, 6 + foe.stages[k])), 0);
      s += 9 * room * acc;
    } else if (f.k === 'heal') {
      s += me.hp < me.maxHp * 0.45 ? 55 : me.hp < me.maxHp * 0.7 ? 18 : -30;
    }
  }
  return s + rng.range(0, 2);
}

function scoreSwitch(state, side, action) {
  const s = state.sides[side];
  const me = activeOf(state, side), foe = activeOf(state, 1 - side), cand = s.party[action.index];
  const threatNow = bestEffVs(foe, me), threatThen = bestEffVs(foe, cand);
  const myBest = bestEffVs(me, foe), candBest = bestEffVs(cand, foe);
  let score = -12;
  if (threatNow >= 2 && threatThen <= 1 && candBest >= myBest) score += 45;
  if (myBest === 0 && candBest > 0) score += 40;
  if (me.hp < me.maxHp * 0.2 && cand.hp > cand.maxHp * 0.6 && candBest >= 1) score += 10;
  score += (cand.hp / cand.maxHp) * 5;
  return score;
}

function scoreReplacement(state, side, action) {
  const foe = activeOf(state, 1 - side), cand = state.sides[side].party[action.index];
  return bestEffVs(cand, foe) * 20 - bestEffVs(foe, cand) * 15 + (cand.hp / cand.maxHp) * 10;
}

/** Pick an action for a side. Returns null when the side has nothing to do. */
export function chooseAction(state, side, rng) {
  const legal = legalActions(state, side);
  if (!legal.length) return null;
  let best = null, bestScore = -Infinity;
  for (const a of legal) {
    let score;
    if (state.phase === 'replace') score = scoreReplacement(state, side, a);
    else if (a.type === 'switch') score = scoreSwitch(state, side, a);
    else score = scoreMove(state, side, a, rng);
    score += rng.range(0, 3);
    if (score > bestScore) { best = a; bestScore = score; }
  }
  return best;
}
