// Battle engine. Pure and deterministic: step(state, actions) returns a new
// state plus the list of events that happened, and never touches the input.
// All randomness comes from the battle seed and turn number, so a battle can
// be replayed from its initial state and action log.
//
// Shape: two sides, each with a party (up to 5) and one active battler.
// Phases: 'choose' (both sides act), 'replace' (a side whose active fainted
// must send in another, free), 'over'.
import { makeRng } from '../core/rng.js';
import { clamp } from '../core/util.js';
import { typeEffectiveness } from '../data/types.js';
import { getMove, moveFx, isDamaging, STRUGGLE } from '../data/moves.js';
import { abilityName } from '../data/abilities.js';
import { coreTypes } from '../data/elements.js';
import { learnsetOf } from '../creature/genome.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { statsAtLevel, movesAtLevel } from './stats.js';

export const STATUS_INFO = {
  brn: { name: 'Burn', short: 'BRN', verb: 'was burned' },
  psn: { name: 'Poison', short: 'PSN', verb: 'was poisoned' },
  par: { name: 'Paralysis', short: 'PAR', verb: 'is paralyzed' },
  slp: { name: 'Sleep', short: 'SLP', verb: 'fell asleep' },
  frz: { name: 'Freeze', short: 'FRZ', verb: 'was frozen solid' },
};
export const STAT_LABEL = { atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', acc: 'accuracy', eva: 'evasion' };
export const MAX_PARTY = 5;

const stageMul = (n) => (n >= 0 ? (2 + n) / 2 : 2 / (2 - n));
const accMul = (n) => (n >= 0 ? (3 + n) / 3 : 3 / (3 - n));
const SURGE = { ember_heart: 'Fire', tide_heart: 'Water', bloom_heart: 'Grass' };

/** Build a battler from a genome at a level. opts.moves / opts.ability override the defaults. */
export function makeBattler(genome, level, opts = {}) {
  const stats = statsAtLevel(genome, level);
  const moveIds = (opts.moves && opts.moves.length ? opts.moves : movesAtLevel(learnsetOf(genome), level)).slice(0, 4);
  return {
    uid: opts.uid || null,
    name: genome.name,
    level,
    types: [genome.types[0], genome.types[1] || null],
    genome,
    stats,
    maxHp: stats.hp,
    hp: stats.hp,
    moves: moveIds.map((id) => { const mv = getMove(id) || getMove('bump'); return { id: mv.id, pp: mv.pp, maxPp: mv.pp }; }),
    ability: opts.ability || genome.ability || 'lucky_streak',
    xp: opts.xp || null, // { cur, prev, next } progress toward the next level, for display only
    status: null,
    sleepTurns: 0,
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
    flinch: false,
    moved: false,
    fainted: false,
    lastMove: null,
  };
}

export function activeOf(state, side) { const s = state.sides[side]; return s.party[s.active]; }
export function aliveCount(side) { return side.party.filter((b) => !b.fainted).length; }

/**
 * Chance (0..1) that a capture attempt on this battler succeeds right now.
 * Low HP and status help; rarer species and fusions resist more.
 */
export function captureChance(b) {
  const sp = b.genome && b.genome.species ? SPECIES_BY_ID[b.genome.species] : null;
  let base = sp ? (sp.tier === 'rare' ? 0.45 : sp.tier === 'uncommon' ? 0.7 : 1) : 0.7;
  if (b.genome && b.genome.gen > 0) base *= 0.7;
  const hpFactor = 1 - (2 / 3) * (b.hp / b.maxHp);
  const statusMul = b.status === 'slp' || b.status === 'frz' ? 2 : b.status ? 1.5 : 1;
  return clamp(0.08 + 0.72 * hpFactor * base * statusMul, 0.03, 0.95);
}

/**
 * Start a battle. sides: [{ name, party: [battler...], ai }, ...]. Returns { state, events }.
 * capturable: side 0 may try to capture side 1's active creature (wild encounters).
 */
export function createBattle({ sides, seed = 'battle', capturable = false }) {
  if (!sides || sides.length !== 2) throw new Error('A battle needs exactly two sides.');
  const state = {
    seed: String(seed),
    turn: 0,
    phase: 'choose',
    winner: null,
    capturable: Boolean(capturable),
    captured: null,
    sides: sides.map((s, si) => {
      if (!s.party || !s.party.length) throw new Error(`Side ${si} has an empty party.`);
      return {
        name: s.name || (si === 0 ? 'You' : 'Foe'),
        ai: Boolean(s.ai),
        active: 0,
        needsReplace: false,
        party: s.party.slice(0, MAX_PARTY).map((b, bi) => ({ ...structuredClone(b), uid: `s${si}b${bi}` })),
      };
    }),
  };
  const events = [];
  const rng = makeRng(`${state.seed}:start`);
  for (const i of [0, 1]) events.push({ t: 'switch', side: i, name: activeOf(state, i).name, uid: activeOf(state, i).uid, initial: true });
  for (const i of speedOrder(state, rng)) entryHooks(state, i, events);
  return { state, events };
}

/** What a side may do right now. Empty when it is not this side's turn to act. */
export function legalActions(state, side) {
  const s = state.sides[side];
  const me = activeOf(state, side);
  const switches = s.party.map((b, i) => ({ type: 'switch', index: i })).filter((a) => a.index !== s.active && !s.party[a.index].fainted);
  if (state.phase === 'over') return [];
  if (state.phase === 'replace') return s.needsReplace ? switches : [];
  const moves = me.moves.map((mv, i) => ({ type: 'move', index: i })).filter((a) => me.moves[a.index].pp > 0);
  const capture = state.capturable && side === 0 && !activeOf(state, 1).fainted ? [{ type: 'capture' }] : [];
  return [...(moves.length ? moves : [{ type: 'move', index: -1, struggle: true }]), ...capture, ...switches];
}

function sameAction(a, b) { return a && b && a.type === b.type && a.index === b.index; }

function speedOrder(state, rng) {
  const s0 = effectiveStat(activeOf(state, 0), 'spe'), s1 = effectiveStat(activeOf(state, 1), 'spe');
  if (s0 === s1) return rng.chance(0.5) ? [0, 1] : [1, 0];
  return s0 > s1 ? [0, 1] : [1, 0];
}

export function effectiveStat(b, k) {
  let v = b.stats[k] * stageMul(b.stages[k]);
  if (k === 'spe' && b.status === 'par') v *= 0.5;
  return v;
}

/** One step of the battle. actions[i] is side i's action (null when that side does not act this phase). */
export function step(input, actions) {
  const state = structuredClone(input);
  const events = [];
  if (state.phase === 'over') return { state, events };
  const rng = makeRng(`${state.seed}:t${state.turn}:${state.phase}`);

  if (state.phase === 'replace') {
    for (const i of [0, 1]) {
      const side = state.sides[i];
      if (!side.needsReplace) continue;
      const a = actions[i];
      if (!legalActions(state, i).some((x) => sameAction(x, a))) throw new Error(`Side ${i} must send in a replacement.`);
      doSwitch(state, i, a.index, events, true);
      side.needsReplace = false;
    }
    for (const i of speedOrder(state, rng)) if (state.sides[i].party[state.sides[i].active].justEntered) entryHooks(state, i, events);
    state.phase = 'choose';
    return { state, events };
  }

  for (const i of [0, 1]) {
    if (!legalActions(state, i).some((x) => sameAction(x, actions[i]))) throw new Error(`Illegal action for side ${i}: ${JSON.stringify(actions[i])}`);
  }
  state.turn++;
  events.push({ t: 'turn', n: state.turn });
  for (const i of [0, 1]) { const b = activeOf(state, i); b.moved = false; b.flinch = b.flinch && false; }

  // Order: switches first, then moves by priority, then speed, ties random.
  const order = [0, 1].map((i) => {
    const a = actions[i];
    const prio = a.type === 'switch' || a.type === 'capture' ? 100 : (a.struggle ? 0 : getMove(activeOf(state, i).moves[a.index].id).prio);
    return { i, a, prio, spe: effectiveStat(activeOf(state, i), 'spe'), tie: rng.next() };
  }).sort((x, y) => (y.prio - x.prio) || (y.spe - x.spe) || (y.tie - x.tie));

  for (const o of order) {
    if (state.phase === 'over') break;
    if (o.a.type === 'capture') {
      attemptCapture(state, events, rng);
      if (state.phase === 'over') return { state, events };
    } else if (o.a.type === 'switch') {
      doSwitch(state, o.i, o.a.index, events, false);
      entryHooks(state, o.i, events);
    } else {
      executeMove(state, o.i, o.a, events, rng);
    }
    if (checkEnd(state, events)) return { state, events };
  }

  endOfTurn(state, events, rng);
  if (checkEnd(state, events)) return { state, events };

  for (const i of [0, 1]) {
    if (activeOf(state, i).fainted) { state.sides[i].needsReplace = true; state.phase = 'replace'; }
  }
  return { state, events };
}

function attemptCapture(state, events, rng) {
  const target = activeOf(state, 1);
  const perShake = Math.cbrt(captureChance(target));
  let shakes = 0;
  for (let k = 0; k < 3; k++) { if (rng.chance(perShake)) shakes++; else break; }
  if (shakes === 3) {
    events.push({ t: 'capture', ok: true, side: 1, name: target.name, shakes });
    state.captured = target.uid;
    state.phase = 'over';
    state.winner = 0;
    events.push({ t: 'end', winner: 0, capture: true, name: target.name });
  } else {
    events.push({ t: 'capture', ok: false, side: 1, name: target.name, shakes });
  }
}

function doSwitch(state, i, index, events, forced) {
  const side = state.sides[i];
  const out = side.party[side.active];
  if (!out.fainted && !forced) {
    if (out.ability === 'second_wind' && out.hp < out.maxHp) {
      const amount = Math.min(out.maxHp - out.hp, Math.floor(out.maxHp / 3));
      out.hp += amount;
      events.push({ t: 'ability', side: i, name: out.name, ability: abilityName(out.ability) });
      events.push({ t: 'heal', side: i, name: out.name, amount, hp: out.hp, maxHp: out.maxHp });
    }
  }
  out.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
  out.flinch = false;
  side.active = index;
  const inn = side.party[index];
  inn.justEntered = true;
  events.push({ t: 'switch', side: i, name: inn.name, uid: inn.uid, from: out.name, forced });
}

function entryHooks(state, i, events) {
  const me = activeOf(state, i);
  me.justEntered = false;
  const foe = activeOf(state, 1 - i);
  if (me.ability === 'menace' && !foe.fainted) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, 1 - i, { atk: -1 }, events);
  }
  if (me.ability === 'umbral_core' && !foe.fainted) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, 1 - i, { spa: -1 }, events);
  }
  if (me.ability === 'storm_core' && me.stages.spe < 6) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, i, { spe: 1 }, events);
  }
}

function canHaveStatus(b, status, mv) {
  if (b.status || b.fainted) return false;
  const t = b.types;
  if (mv && mv.flags.includes('powder') && t.includes('Grass')) return false;
  switch (status) {
    case 'brn': return !t.includes('Fire') && b.ability !== 'damp_coat' && b.ability !== 'inferno_core';
    case 'psn': return !t.includes('Poison') && !t.includes('Steel') && b.ability !== 'antitoxin' && b.ability !== 'verdant_core';
    case 'par': return !t.includes('Electric') && b.ability !== 'loose_joints' && b.ability !== 'storm_core';
    case 'slp': return b.ability !== 'restless';
    case 'frz': return !t.includes('Ice') && b.ability !== 'warm_core' && b.ability !== 'frost_core';
    default: return false;
  }
}

function setStatus(state, side, status, events, rng, mv) {
  const b = activeOf(state, side);
  if (!canHaveStatus(b, status, mv)) return false;
  b.status = status;
  if (status === 'slp') b.sleepTurns = rng.between(1, 3);
  events.push({ t: 'status', side, name: b.name, status });
  return true;
}

function changeStages(state, side, stats, events) {
  const b = activeOf(state, side);
  if (b.fainted) return;
  for (const [k, n] of Object.entries(stats)) {
    if (k === 'acc' && n < 0 && b.ability === 'hawkeye') { events.push({ t: 'ability', side, name: b.name, ability: abilityName(b.ability) }); continue; }
    const cur = b.stages[k];
    const next = clamp(cur + n, -6, 6);
    events.push({ t: 'stat', side, name: b.name, stat: k, stages: next - cur, wanted: n });
    b.stages[k] = next;
  }
}

function healBattler(state, side, amount, events, why) {
  const b = activeOf(state, side);
  const real = Math.max(0, Math.min(b.maxHp - b.hp, Math.floor(amount)));
  if (real <= 0) return 0;
  b.hp += real;
  events.push({ t: 'heal', side, name: b.name, amount: real, hp: b.hp, maxHp: b.maxHp, why });
  return real;
}

function hurtBattler(state, side, amount, events, why) {
  const b = activeOf(state, side);
  if (b.fainted) return 0;
  const real = Math.max(1, Math.min(b.hp, Math.floor(amount)));
  b.hp -= real;
  events.push({ t: 'hurt', side, name: b.name, amount: real, hp: b.hp, maxHp: b.maxHp, why });
  if (b.hp <= 0) faint(state, side, events);
  return real;
}

function faint(state, side, events) {
  const b = activeOf(state, side);
  b.hp = 0;
  b.fainted = true;
  b.status = null;
  events.push({ t: 'faint', side, name: b.name, uid: b.uid });
}

function moveOfAction(b, a) { return a.struggle ? STRUGGLE : getMove(b.moves[a.index].id); }

/**
 * Damage for one hit. `roll` is the random factor in [0.85, 1], `crit` a boolean.
 * Exported so the AI can estimate with roll = 0.925 and no crit.
 */
export function calcDamage(user, target, mv, eff, roll, crit) {
  const fixed = moveFx(mv, 'fixed');
  if (fixed) return user.level;
  const atkKey = mv.cat === 'phys' ? 'atk' : 'spa';
  const defKey = mv.cat === 'phys' ? 'def' : 'spd';
  const aStage = crit ? Math.max(0, user.stages[atkKey]) : user.stages[atkKey];
  const dStage = crit ? Math.min(0, target.stages[defKey]) : target.stages[defKey];
  let A = user.stats[atkKey] * stageMul(aStage);
  const D = Math.max(1, target.stats[defKey] * stageMul(dStage));
  if (user.ability === 'grit' && user.status && mv.cat === 'phys') A *= 1.5;
  let power = mv.power;
  const bis = moveFx(mv, 'boostIfStatus');
  if (bis && target.status) power *= bis.m;
  if (user.ability === 'finesse' && power <= 60) power *= 1.5;
  if (user.ability === 'heavy_hands' && mv.flags.includes('punch')) power *= 1.2;
  if (user.ability === 'vice_jaw' && mv.flags.includes('bite')) power *= 1.5;
  if (user.ability === 'daredevil' && moveFx(mv, 'recoil')) power *= 1.2;
  if (SURGE[user.ability] === mv.type && user.hp <= user.maxHp / 3) power *= 1.5;
  const core = coreTypes(user.ability);
  if (core && core.includes(mv.type)) power *= 1.3;
  let dmg = Math.floor(Math.floor((Math.floor((2 * user.level) / 5) + 2) * power * A / D) / 50) + 2;
  if (crit) dmg = Math.floor(dmg * 1.5);
  dmg = Math.floor(dmg * roll);
  if (!mv.typeless && user.types.includes(mv.type)) dmg = Math.floor(dmg * (user.ability === 'purebred' ? 2 : 1.5));
  dmg = Math.floor(dmg * eff);
  if (user.status === 'brn' && mv.cat === 'phys' && user.ability !== 'grit') dmg = Math.floor(dmg / 2);
  if (target.ability === 'blubber' && (mv.type === 'Fire' || mv.type === 'Ice')) dmg = Math.floor(dmg / 2);
  if (target.ability === 'quake_core' && mv.cat === 'phys') dmg = Math.floor(dmg * 0.75);
  return Math.max(1, dmg);
}

/** Type effectiveness of a move against a battler, including ability immunities. 0 means no effect. */
export function moveEffectiveness(mv, target) {
  if (mv.typeless) return 1;
  if (mv.type === 'Ground' && target.ability === 'hover') return 0;
  if ((mv.type === 'Water' && target.ability === 'sponge') || (mv.type === 'Electric' && target.ability === 'capacitor')) return 0;
  if ((mv.type === 'Grass' && target.ability === 'verdant_core') || (mv.type === 'Dark' && target.ability === 'radiant_core')) return 0;
  return typeEffectiveness(mv.type, target.types);
}

function hitChance(user, target, mv) {
  if (mv.acc == null) return 1;
  const stage = clamp(user.stages.acc - target.stages.eva, -6, 6);
  return Math.min(1, (mv.acc / 100) * accMul(stage));
}

function executeMove(state, i, action, events, rng) {
  const user = activeOf(state, i);
  const foeSide = 1 - i;
  const target = activeOf(state, foeSide);
  if (user.fainted) return;
  const mv = moveOfAction(user, action);

  if (user.flinch) { user.flinch = false; user.moved = true; events.push({ t: 'flinch', side: i, name: user.name }); return; }
  if (user.status === 'slp') {
    user.sleepTurns--;
    if (user.sleepTurns > 0) { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'slp' }); return; }
    user.status = null;
    events.push({ t: 'cure', side: i, name: user.name, status: 'slp' });
  }
  if (user.status === 'frz') {
    if (mv.type === 'Fire' || rng.chance(0.2)) { user.status = null; events.push({ t: 'cure', side: i, name: user.name, status: 'frz' }); }
    else { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'frz' }); return; }
  }
  if (user.status === 'par' && rng.chance(0.25)) { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'par' }); return; }

  if (!action.struggle) user.moves[action.index].pp = Math.max(0, user.moves[action.index].pp - 1);
  user.lastMove = mv.id;
  user.moved = true;
  events.push({ t: 'move', side: i, name: user.name, move: mv.name, moveId: mv.id, type: mv.type, cat: mv.cat });

  const targetsFoe = isDamaging(mv) || mv.fx.some((f) => f.k === 'status' || (f.k === 'stat' && f.who === 'foe'));
  if (targetsFoe) {
    if (target.fainted) { events.push({ t: 'no_target', side: i }); return; }
    if (!rng.chance(hitChance(user, target, mv))) { events.push({ t: 'miss', side: i, name: user.name, target: target.name }); return; }
  }

  if (!isDamaging(mv)) { applyStatusMove(state, i, mv, events, rng); return; }

  const eff = moveEffectiveness(mv, target);
  if (eff === 0) {
    if ((target.ability === 'hover' && mv.type === 'Ground') || (target.ability === 'radiant_core' && mv.type === 'Dark')) events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
    if ((target.ability === 'sponge' && mv.type === 'Water') || (target.ability === 'capacitor' && mv.type === 'Electric') || (target.ability === 'verdant_core' && mv.type === 'Grass')) {
      events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
      if (!healBattler(state, foeSide, target.maxHp / 4, events, 'absorb')) events.push({ t: 'immune', side: foeSide, name: target.name });
      return;
    }
    events.push({ t: 'immune', side: foeSide, name: target.name });
    return;
  }

  const multi = moveFx(mv, 'multi');
  const hits = multi ? rng.pick([2, 2, 3, 3, 4, 5].filter((n) => n >= multi.min && n <= multi.max)) : 1;
  let total = 0, landed = 0;
  for (let h = 0; h < hits; h++) {
    if (target.fainted) break;
    const crit = rng.chance(mv.crit >= 1 ? 1 / 8 : 1 / 24);
    const roll = rng.between(85, 100) / 100;
    let dmg = calcDamage(user, target, mv, eff, roll, crit);
    let held = false;
    if (dmg >= target.hp && target.hp === target.maxHp && target.ability === 'stonewall') { dmg = target.hp - 1; held = true; }
    dmg = Math.min(dmg, target.hp);
    target.hp -= dmg;
    total += dmg; landed++;
    events.push({ t: 'damage', side: foeSide, name: target.name, amount: dmg, hp: target.hp, maxHp: target.maxHp, eff, crit });
    if (held) events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
    if (target.hp <= 0) faint(state, foeSide, events);
  }
  if (hits > 1) events.push({ t: 'multihit', side: i, hits: landed });

  const drain = moveFx(mv, 'drain');
  if (drain && total > 0) healBattler(state, i, Math.max(1, total * drain.r), events, 'drain');
  const recoil = moveFx(mv, 'recoil');
  if (recoil && total > 0 && user.ability !== 'thick_skull') hurtBattler(state, i, Math.max(1, total * recoil.r), events, 'recoil');
  if (mv.struggle) hurtBattler(state, i, Math.max(1, user.maxHp / 4), events, 'struggle');

  if (!target.fainted) applySecondaries(state, i, mv, events, rng);
  if (mv.flags.includes('contact') && !user.fainted) contactEffects(state, i, events, rng);
  if (target.fainted && !user.fainted && user.ability === 'swagger') {
    events.push({ t: 'ability', side: i, name: user.name, ability: abilityName(user.ability) });
    changeStages(state, i, { atk: 1 }, events);
  }
}

function chanceOf(user, p) { return Math.min(100, user.ability === 'lucky_streak' ? p * 2 : p) / 100; }

function applySecondaries(state, i, mv, events, rng) {
  const user = activeOf(state, i), foeSide = 1 - i, target = activeOf(state, foeSide);
  for (const f of mv.fx) {
    const p = f.p == null ? 100 : f.p;
    if (f.k === 'status') { if (rng.chance(chanceOf(user, p))) setStatus(state, foeSide, f.s, events, rng, mv); }
    else if (f.k === 'stat') { if (rng.chance(chanceOf(user, p))) changeStages(state, f.who === 'self' ? i : foeSide, f.stats, events); }
    else if (f.k === 'flinch') { if (!target.moved && rng.chance(chanceOf(user, p))) target.flinch = true; }
  }
}

function contactEffects(state, i, events, rng) {
  const user = activeOf(state, i), foeSide = 1 - i, target = activeOf(state, foeSide);
  const ab = target.ability;
  if (ab === 'thorn_hide') {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
    hurtBattler(state, i, Math.max(1, user.maxHp / 8), events, 'thorns');
  } else if (ab === 'frost_core' && rng.chance(0.3) && user.stages.spe > -6) {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
    changeStages(state, i, { spe: -1 }, events);
  } else if ((ab === 'live_fur' || ab === 'hot_blooded' || ab === 'venom_barbs' || ab === 'inferno_core') && rng.chance(0.3)) {
    const status = ab === 'live_fur' ? 'par' : (ab === 'hot_blooded' || ab === 'inferno_core') ? 'brn' : 'psn';
    if (canHaveStatus(user, status)) {
      events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
      setStatus(state, i, status, events, rng);
    }
  }
}

function applyStatusMove(state, i, mv, events, rng) {
  const foeSide = 1 - i;
  let didSomething = false;
  if (mv.fx.some((f) => f.k === 'status') && moveEffectiveness(mv, activeOf(state, foeSide)) === 0) {
    events.push({ t: 'immune', side: foeSide, name: activeOf(state, foeSide).name });
    return;
  }
  for (const f of mv.fx) {
    if (f.k === 'status') {
      const target = activeOf(state, foeSide);
      if (setStatus(state, foeSide, f.s, events, rng, mv)) didSomething = true;
      else events.push({ t: 'no_effect', side: foeSide, name: target.name, reason: target.status ? 'already' : 'immune' });
    } else if (f.k === 'stat') {
      const who = f.who === 'self' ? i : foeSide;
      const before = { ...activeOf(state, who).stages };
      changeStages(state, who, f.stats, events);
      if (Object.keys(f.stats).some((k) => activeOf(state, who).stages[k] !== before[k])) didSomething = true;
    } else if (f.k === 'heal') {
      const me = activeOf(state, i);
      if (healBattler(state, i, me.maxHp * f.r, events, 'heal')) didSomething = true;
      else events.push({ t: 'no_effect', side: i, name: me.name, reason: 'full' });
    }
  }
  if (!didSomething && !mv.fx.length) events.push({ t: 'no_effect', side: i, name: activeOf(state, i).name, reason: 'failed' });
}

function endOfTurn(state, events, rng) {
  for (const i of speedOrder(state, rng)) {
    const b = activeOf(state, i);
    if (b.fainted) continue;
    if (b.status === 'brn') hurtBattler(state, i, Math.max(1, b.maxHp / 16), events, 'brn');
    else if (b.status === 'psn') hurtBattler(state, i, Math.max(1, b.maxHp / 8), events, 'psn');
    if (!b.fainted && b.ability === 'momentum' && b.stages.spe < 6) {
      events.push({ t: 'ability', side: i, name: b.name, ability: abilityName(b.ability) });
      changeStages(state, i, { spe: 1 }, events);
    }
    if (!b.fainted && b.ability === 'tide_core' && b.hp < b.maxHp) {
      events.push({ t: 'ability', side: i, name: b.name, ability: abilityName(b.ability) });
      healBattler(state, i, Math.max(1, b.maxHp / 16), events, 'ability');
    }
  }
}

function checkEnd(state, events) {
  const dead = [0, 1].map((i) => aliveCount(state.sides[i]) === 0);
  if (!dead[0] && !dead[1]) return false;
  state.phase = 'over';
  state.winner = dead[0] && dead[1] ? null : dead[0] ? 1 : 0;
  events.push({ t: 'end', winner: state.winner });
  return true;
}

/** Human-readable line for an event. `names` = [sideName0, sideName1]; opts.wild for wild encounters. */
export function describeEvent(e, names = ['You', 'Foe'], opts = {}) {
  const foe = e.side === 1;
  const who = foe ? (opts.wild ? `The wild ${e.name}` : `The foe's ${e.name}`) : e.name;
  switch (e.t) {
    case 'turn': return `— Turn ${e.n} —`;
    case 'switch':
      if (!foe) return e.initial ? `Go, ${e.name}!` : `Come back! Go, ${e.name}!`;
      return opts.wild ? `A wild ${e.name} appeared!` : `${names[1]} sends out ${e.name}!`;
    case 'move': return `${who} used ${e.move}!`;
    case 'damage': {
      const bits = [];
      if (e.crit) bits.push('A critical hit!');
      if (e.eff >= 2) bits.push("It's super effective!");
      else if (e.eff > 0 && e.eff < 1) bits.push("It's not very effective…");
      return bits.join(' ');
    }
    case 'multihit': return `Hit ${e.hits} times!`;
    case 'miss': return `${who}'s attack missed!`;
    case 'no_target': return 'But there was no target…';
    case 'immune': return `It doesn't affect ${who}…`;
    case 'no_effect': return e.reason === 'already' ? `${who} is already affected.` : e.reason === 'full' ? `${who}'s HP is already full.` : e.reason === 'immune' ? `It doesn't affect ${who}…` : 'But it failed!';
    case 'status': return `${who} ${STATUS_INFO[e.status].verb}!`;
    case 'status_skip': return e.status === 'slp' ? `${who} is fast asleep.` : e.status === 'frz' ? `${who} is frozen solid!` : `${who} is paralyzed and can't move!`;
    case 'cure': return e.status === 'slp' ? `${who} woke up!` : e.status === 'frz' ? `${who} thawed out!` : `${who} recovered.`;
    case 'flinch': return `${who} flinched!`;
    case 'stat': {
      const label = STAT_LABEL[e.stat] || e.stat;
      if (e.stages === 0) return `${who}'s ${label} won't go any ${e.wanted > 0 ? 'higher' : 'lower'}!`;
      const size = Math.abs(e.stages) >= 2 ? 'sharply ' : '';
      return `${who}'s ${label} ${size}${e.stages > 0 ? 'rose' : 'fell'}!`;
    }
    case 'heal': return e.why === 'drain' ? `${who} drained some HP!` : `${who} recovered ${e.amount} HP.`;
    case 'hurt': return e.why === 'recoil' || e.why === 'struggle' ? `${who} is hit with recoil!` : e.why === 'brn' ? `${who} is hurt by its burn!` : e.why === 'psn' ? `${who} is hurt by poison!` : e.why === 'thorns' ? `${who} is pricked by thorns!` : `${who} took ${e.amount} damage.`;
    case 'ability': return `[${who}'s ${e.ability}]`;
    case 'faint': return `${who} fainted!`;
    case 'capture': return e.ok ? `Gotcha! ${e.name} was caught!` : e.shakes === 0 ? 'Oh no! It broke free right away!' : e.shakes === 1 ? 'It shook once… and broke free!' : 'So close! It broke free!';
    case 'end': return e.capture ? `${e.name} joined the team!` : e.winner == null ? 'Both sides are out of creatures. It is a draw!' : e.winner === 0 ? `${names[0]} won the battle!` : opts.wild ? 'Your team was defeated…' : `${names[1]} won the battle!`;
    default: return '';
  }
}
