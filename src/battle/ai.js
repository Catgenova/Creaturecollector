// Opponent AI: a scored heuristic. Deterministic given its rng.
import { STRUGGLE, getMove, isDamaging, moveFx } from '../data/moves.js';
import { legalActions, activeOf, calcDamage, moveEffectiveness, effectiveStat, affinityBonus } from './engine.js';

function bestEffVs(attacker, defender) {
  let best = 0;
  for (const m of attacker.moves) {
    const mv = getMove(m.id);
    if (!mv || !isDamaging(mv) || m.pp <= 0) continue;
    best = Math.max(best, moveEffectiveness(mv, defender) * affinityBonus(attacker, mv));
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
      else s += (f.s === 'slp' ? 50 : f.s === 'par' ? 38 : f.s === 'brn' ? (foe.style !== 'magic' ? 42 : 24) : f.s === 'psn' ? 30 : 30) * acc;
    } else if (f.k === 'stat' && f.who === 'self') {
      // Boosts are worth it early and healthy, and not past +2 in a stat we already raised.
      const room = Object.entries(f.stats).reduce((a, [k, n]) => a + Math.max(0, Math.min(n, 2 - me.stages[k])), 0);
      s += me.hp > me.maxHp * 0.55 ? 15 * room + (state.turn < 2 ? 6 : 0) : 4 * room;
    } else if (f.k === 'stat' && f.who === 'foe') {
      // Lowering a stat is only worth it while the foe actually uses that stat, and it decays fast.
      let v = 0;
      for (const [k, n] of Object.entries(f.stats)) {
        const already = -foe.stages[k];
        const room = Math.max(0, Math.min(-n, 6 - already));
        let use = 1;
        if (k === 'spe') use = faster ? 0 : 1;
        else if (k === 'melee' || k === 'ranged' || k === 'magic') use = foe.style === k ? 1 : 0.2;
        else if (k === 'meleeDef' || k === 'rangedDef' || k === 'magicDef') use = `${me.style}Def` === k ? 0.8 : 0.2;
        else if (k === 'acc') use = 0.6;
        v += 9 * room * use * (already >= 2 ? 0.3 : 1);
      }
      s += v * acc;
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
    if (a.type === 'capture') continue; // the AI never captures
    let score;
    if (state.phase === 'replace') score = scoreReplacement(state, side, a);
    else if (a.type === 'switch') score = scoreSwitch(state, side, a);
    else score = scoreMove(state, side, a, rng);
    score += rng.range(0, 3);
    if (score > bestScore) { best = a; bestScore = score; }
  }
  return best;
}
