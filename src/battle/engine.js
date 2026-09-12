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
import { abilityName, abilityFx } from '../data/abilities.js';
import { coreTypes } from '../data/elements.js';
import { DAMAGE_TYPES, STAGE_KEYS, STAT_NAMES, combatStyle, triangleMul } from '../data/damage.js';
import { learnsetOf } from '../creature/genome.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { statsAtLevel, movesAtLevel } from './stats.js';
import { ITEM_IDS, getItem, potionHeal, potionUseful } from '../data/items.js';
import { getCharm, charmPowerMul, heldKind, charmValue, charmUses, CHARM_RULE } from '../data/charms.js';

export const STATUS_INFO = {
  brn: { name: 'Burn', short: 'BRN', verb: 'was burned' },
  psn: { name: 'Poison', short: 'PSN', verb: 'was poisoned' },
  par: { name: 'Paralysis', short: 'PAR', verb: 'is paralyzed' },
  slp: { name: 'Sleep', short: 'SLP', verb: 'fell asleep' },
  frz: { name: 'Freeze', short: 'FRZ', verb: 'was frozen solid' },
};
export const STAT_LABEL = { ...STAT_NAMES, acc: 'accuracy', eva: 'evasion' };
const freshStages = () => Object.fromEntries(STAGE_KEYS.map((k) => [k, 0]));
export const MAX_PARTY = 5;

const stageMul = (n) => (n >= 0 ? (2 + n) / 2 : 2 / (2 - n));
const accMul = (n) => (n >= 0 ? (3 + n) / 3 : 3 / (3 - n));
const SURGE = { ember_heart: 'Fire', tide_heart: 'Water', bloom_heart: 'Grass', frost_heart: 'Ice', storm_heart: 'Electric', venom_heart: 'Poison', gale_heart: 'Flying', stone_heart: 'Rock' };

// ---- data-driven passives: the fx entries on a battler's ability, read by kind at each hook below ----
/** The passives a battler is fighting with: the one it was born with, and a second bought at the Rookery. */
const abIds = (b) => (b ? (b.ability2 ? [b.ability, b.ability2] : [b.ability]) : []);
/** Whether a battler carries a named passive in either slot, for the hand-implemented ones. */
export const abIs = (b, id) => Boolean(b) && (b.ability === id || b.ability2 === id);
const abFx = (b, kind) => {
  if (!b || !b.ability) return [];
  const first = abilityFx(b.ability, kind);
  if (!b.ability2) return first;
  const second = abilityFx(b.ability2, kind);
  return second.length ? first.concat(second) : first;
};
const abHas = (b, kind) => abFx(b, kind).length > 0;
/** The passive of this battler that owns an entry of `kind`, so the log names the one that fired. */
const abSource = (b, kind) => (b && b.ability2 && !abilityFx(b.ability, kind).length ? b.ability2 : b && b.ability);
/** Product of the `m` of every entry of a kind that passes `pred` (1 when none do). */
const abMul = (b, kind, pred) => { let m = 1; for (const f of abFx(b, kind)) if (!pred || pred(f)) m *= f.m; return m; };
/** The target's defensive entries of a kind — none of them when the attacker's passive breaks through guards. */
const guardFx = (user, target, kind) => (abHas(user, 'moldBreaker') ? [] : abFx(target, kind));
const guardMul = (user, target, kind, pred) => { let m = 1; for (const f of guardFx(user, target, kind)) if (!pred || pred(f)) m *= f.m; return m; };
const announce = (events, side, b, kind) => events.push({ t: 'ability', side, name: b.name, ability: abilityName(kind ? abSource(b, kind) : b.ability) });
const hasSecondary = (mv) => mv.fx.some((f) => f.k === 'status' || f.k === 'flinch' || (f.k === 'stat' && f.who === 'foe'));
/** Every fx kind the engine interprets; abilities.js must not use others. */
export const PASSIVE_KINDS = ['typeBoost', 'catBoost', 'flagBoost', 'powerBand', 'fxBoost', 'firstStrike', 'lastStrike', 'statusBoost', 'fullHpBoost', 'foeLowBoost', 'prioBoost', 'sheerForce', 'statMul', 'statusStat', 'tintedLens', 'critBoost', 'critRate', 'mercilessCrit', 'accBoost', 'catAcc', 'noGuard', 'scrappy', 'addFlinch', 'addStatus', 'koStat', 'koHeal', 'prioType', 'prioStatus', 'prioHeal', 'quickDraw', 'earlyBird',
  'typeResist', 'typeWeak', 'catResist', 'flagResist', 'allResist', 'fullHpResist', 'lowHpResist', 'filter', 'defMul', 'statusDef', 'critImmune', 'evasion', 'typeImmune', 'typeAbsorb', 'contactHurt', 'contactStatus', 'contactStat', 'hurtStat', 'hitByTypeStat', 'hurtFoeStat', 'catThorns', 'critStat', 'lowHpStat', 'aftermath', 'shieldDust', 'flinchImmune', 'soundImmune', 'powderImmune', 'prioImmune', 'pressure', 'statusImmune', 'allStatusImmune', 'statusMoveImmune', 'synchronize', 'liquidOoze', 'noStatDrop', 'debuffedStat',
  'entryStat', 'turnHeal', 'turnStat', 'turnCure', 'poisonHeal', 'turnHurtFoe', 'switchCure', 'switchHeal', 'flinchStat', 'magicGuard', 'recoilImmune',
  // the second three hundred: matchup power, conversion, tactics, once-a-battle guards and the world hooks
  'stab', 'foeTypeBoost', 'foeStatusBoost', 'foeCatBoost', 'foeFullBoost', 'effBoost', 'neutralBoost', 'lowHpBoost', 'firstTurnBoost', 'lastOneBoost', 'revengeBoost', 'repeatBoost',
  'slowStart', 'defeatist', 'hpCostBoost', 'multiExtra', 'drainMul', 'recoilMul', 'moveTypeChange', 'protean', 'colorChange', 'statusChanceMul', 'critStatus',
  'moldBreaker', 'unaware', 'contrary', 'simple', 'download', 'avengeStat', 'trace', 'disguise', 'endure', 'lowHpHeal', 'magicBounce', 'critShield', 'firstHitResist', 'fxResist', 'bandResist',
  'worldXp', 'worldGold', 'worldCatch',
  // the third three hundred: tempo, the party around it, sleight of hand and what it leaves behind
  'lateBoost', 'earlyBoost', 'charmBoost', 'charmless', 'underdogBoost', 'bullyBoost', 'fullPartyBoost', 'ppSave', 'benchHeal', 'benchCure',
  'statSwap', 'stageSteal', 'stageClear', 'statusSwap', 'healBlock', 'drainImmune', 'noContact', 'sureShot', 'ignoreEvasion', 'damageCap', 'critIf', 'actAsleep', 'thawFast',
  'faintStatus', 'faintStat', 'faintHealParty'];

/** Build a battler from a genome at a level. opts.moves / opts.ability override the defaults; opts.held is the charm it carries. */
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
    ability2: opts.ability2 || genome.ability2 || null, // the Rookery's second slot, when it has been opened
    held: getCharm(opts.held) ? opts.held : null, // the charm it carries into the fight, if any
    style: combatStyle(stats), // melee | ranged | magic: the damage type of its best attack stat
    xp: opts.xp || null, // { cur, prev, next } progress toward the next level, for display only
    status: null,
    sleepTurns: 0,
    stages: freshStages(),
    flinch: false,
    moved: false,
    fainted: false,
    lastMove: null,
    turnsOut: 0, // turns since it came in, for the passives that open or close strong
  };
}

export function activeOf(state, side) { const s = state.sides[side]; return s.party[s.active]; }
export function aliveCount(side) { return side.party.filter((b) => !b.fainted).length; }

/** Catch odds follow your strongest party member: 5% up or down per level between it and the target, from a fifth to double. */
export const CAPTURE_LEVEL = { perLevel: 0.05, min: 0.2, max: 2 };
export function levelCaptureMul(partyLevel, targetLevel) {
  if (!Number.isFinite(partyLevel) || !Number.isFinite(targetLevel)) return 1;
  return clamp(1 + CAPTURE_LEVEL.perLevel * (partyLevel - targetLevel), CAPTURE_LEVEL.min, CAPTURE_LEVEL.max);
}
/** The highest level on your side, fainted or not: the party that faces the wild creature. */
export function partyTopLevel(state) { return Math.max(...state.sides[0].party.map((p) => p.level)); }

/**
 * Chance (0..1) that a capture attempt on this battler succeeds right now.
 * Low HP and status help; rarer species and fusions resist more; a party whose strongest member
 * is below the target's level finds it harder (5% per level), one above it easier.
 */
export function captureChance(b, partyLevel) {
  const sp = b.genome && b.genome.species ? SPECIES_BY_ID[b.genome.species] : null;
  let base = sp ? (sp.tier === 'rare' ? 0.45 : sp.tier === 'uncommon' ? 0.7 : 1) : 0.7;
  if (b.genome && b.genome.gen > 0) base *= 0.7;
  const hpFactor = 1 - (2 / 3) * (b.hp / b.maxHp);
  const statusMul = b.status === 'slp' || b.status === 'frz' ? 2 : b.status ? 1.5 : 1;
  return clamp((0.08 + 0.72 * hpFactor * base * statusMul) * levelCaptureMul(partyLevel, b.level), 0.03, 0.95);
}

/**
 * Start a battle. sides: [{ name, party: [battler...], ai }, ...]. Returns { state, events }.
 * capturable: side 0 may try to capture side 1's active creature (wild encounters).
 * items: { itemId: qty } — potions side 0 may use during the battle (a turn each).
 */
export function createBattle({ sides, seed = 'battle', capturable = false, items = null }) {
  if (!sides || sides.length !== 2) throw new Error('A battle needs exactly two sides.');
  const state = {
    seed: String(seed),
    turn: 0,
    phase: 'choose',
    winner: null,
    capturable: Boolean(capturable),
    captured: null,
    items: Object.fromEntries(Object.entries(items || {}).filter(([id, n]) => getItem(id) && n > 0).map(([id, n]) => [id, Math.floor(n)])),
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
  for (const s of state.sides) s.party[s.active].fought = true; // participants share the experience
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
  return [...(moves.length ? moves : [{ type: 'move', index: -1, struggle: true }]), ...capture, ...itemActions(state, side), ...switches];
}

/** Potion uses open to a side: one action per (stocked item, party member it would help). Only side 0 carries a bag. */
export function itemActions(state, side) {
  if (side !== 0 || !state.items) return [];
  const out = [];
  for (const id of ITEM_IDS) {
    if (!(state.items[id] > 0)) continue;
    const item = getItem(id);
    state.sides[side].party.forEach((b, index) => {
      if (!b.fainted && potionUseful(item, b.hp, b.maxHp, b.status)) out.push({ type: 'item', id, index });
    });
  }
  return out;
}

function sameAction(a, b) { return a && b && a.type === b.type && a.index === b.index && (a.type !== 'item' || a.id === b.id); }

function speedOrder(state, rng) {
  const s0 = effectiveStat(activeOf(state, 0), 'spe'), s1 = effectiveStat(activeOf(state, 1), 'spe');
  if (s0 === s1) return rng.chance(0.5) ? [0, 1] : [1, 0];
  return s0 > s1 ? [0, 1] : [1, 0];
}

export function effectiveStat(b, k) {
  let v = b.stats[k] * stageMul(b.stages[k]);
  if (k === 'spe' && b.status === 'par') v *= 0.5;
  if (k === 'spe' && heldKind(b.held) === 'speed') v *= charmValue(b.held, 'speedMul');
  if (k === 'spe') { v *= abMul(b, 'statMul', (f) => f.stat === 'spe'); if (b.status) v *= abMul(b, 'statusStat', (f) => f.stat === 'spe'); }
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
  for (const i of [0, 1]) {
    const b = activeOf(state, i);
    b.moved = false; b.flinch = false;
    b.battleTurn = state.turn; // for the passives that read the clock
    b.lastStanding = aliveCount(state.sides[i]) === 1; // for the passives that rally when it is the last one up
    b.avenging = state.sides[i].party.some((p) => p.fainted); // and those that answer for a fallen teammate
  }

  // Order: switches first, then moves by priority, then speed, ties random.
  const order = [0, 1].map((i) => {
    const a = actions[i];
    const prio = a.type === 'switch' || a.type === 'capture' || a.type === 'item' ? 100 : (a.struggle ? 0 : movePrio(activeOf(state, i), getMove(activeOf(state, i).moves[a.index].id), rng));
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
    } else if (o.a.type === 'item') {
      useBattleItem(state, o.i, o.a, events);
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

/** A move's priority for this user: its own, plus what the user's passive adds. */
function movePrio(user, mv, rng) {
  let p = mv.prio;
  if (abFx(user, 'prioType').some((f) => f.type === mv.type && (!f.full || user.hp === user.maxHp))) p += 1;
  if (mv.cat === 'status' && abHas(user, 'prioStatus')) p += 1;
  if (mv.cat === 'status' && mv.fx.some((f) => f.k === 'heal') && abHas(user, 'prioHeal')) p += 1;
  const qd = abFx(user, 'quickDraw')[0];
  if (qd && mv.cat !== 'status' && rng.chance(qd.p / 100)) p += 0.5;
  return p;
}

function attemptCapture(state, events, rng) {
  const target = activeOf(state, 1);
  const catcher = activeOf(state, 0);
  const perShake = Math.cbrt(clamp(captureChance(target, partyTopLevel(state)) * abMul(catcher, 'worldCatch'), 0.03, 0.97));
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

/** Spend one potion on a party member (active or benched). Takes the side's turn. */
function useBattleItem(state, i, action, events) {
  const item = getItem(action.id);
  const target = state.sides[i].party[action.index];
  if (!item || !target || !(state.items[action.id] > 0)) return;
  state.items[action.id]--;
  if (state.items[action.id] <= 0) delete state.items[action.id];
  events.push({ t: 'item', side: i, name: target.name, uid: target.uid, item: item.name, id: item.id });
  const amount = potionHeal(item, target.hp, target.maxHp);
  if (amount > 0) {
    target.hp += amount;
    events.push({ t: 'heal', side: i, name: target.name, uid: target.uid, amount, hp: target.hp, maxHp: target.maxHp, why: 'item' });
  }
  if (item.cure && target.status) {
    const status = target.status;
    target.status = null;
    target.sleepTurns = 0;
    events.push({ t: 'cure', side: i, name: target.name, uid: target.uid, status, why: 'item' });
  }
}

function doSwitch(state, i, index, events, forced) {
  const side = state.sides[i];
  const out = side.party[side.active];
  if (!out.fainted && !forced) {
    if (abIs(out, 'second_wind') && out.hp < out.maxHp) {
      const amount = Math.min(out.maxHp - out.hp, Math.floor(out.maxHp / 3));
      out.hp += amount;
      events.push({ t: 'ability', side: i, name: out.name, ability: abilityName(out.ability) });
      events.push({ t: 'heal', side: i, name: out.name, amount, hp: out.hp, maxHp: out.maxHp });
    }
    for (const f of abFx(out, 'switchHeal')) if (out.hp < out.maxHp) {
      const amount = Math.min(out.maxHp - out.hp, Math.floor(out.maxHp * f.r));
      out.hp += amount;
      announce(events, i, out);
      events.push({ t: 'heal', side: i, name: out.name, amount, hp: out.hp, maxHp: out.maxHp });
    }
    if (out.status && abHas(out, 'switchCure')) { announce(events, i, out); events.push({ t: 'cure', side: i, name: out.name, status: out.status }); out.status = null; out.sleepTurns = 0; }
  }
  out.stages = freshStages();
  out.flinch = false;
  out.recharge = false;
  side.active = index;
  side.party[index].fought = true;
  const inn = side.party[index];
  inn.justEntered = true;
  inn.turnsOut = 0;
  events.push({ t: 'switch', side: i, name: inn.name, uid: inn.uid, from: out.name, forced });
}

function entryHooks(state, i, events) {
  const me = activeOf(state, i);
  me.justEntered = false;
  const foe = activeOf(state, 1 - i);
  if (abIs(me, 'menace') && !foe.fainted) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, 1 - i, { melee: -1, ranged: -1 }, events, true);
  }
  if (abIs(me, 'umbral_core') && !foe.fainted) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, 1 - i, { magic: -1 }, events, true);
  }
  if ((abIs(me, 'storm_core') || abIs(me, 'quick_start')) && me.stages.spe < 6) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, i, { spe: 1 }, events);
  }
  if (abIs(me, 'lunar_core') && me.stages.magicDef < 6) {
    events.push({ t: 'ability', side: i, name: me.name, ability: abilityName(me.ability) });
    changeStages(state, i, { magicDef: 1 }, events);
  }
  for (const f of abFx(me, 'entryStat')) {
    if (f.who === 'foe' && foe.fainted) continue;
    announce(events, i, me);
    changeStages(state, f.who === 'foe' ? 1 - i : i, f.stats, events, f.who === 'foe');
  }
  for (const f of abFx(me, 'download')) if (!foe.fainted) { // read the foe's guard and raise the attack it answers worst
    announce(events, i, me);
    changeStages(state, i, foe.stats.meleeDef <= foe.stats.magicDef ? { melee: f.n || 1 } : { magic: f.n || 1 }, events);
  }
  for (const f of abFx(me, 'avengeStat')) if (state.sides[i].party.some((p) => p.fainted)) { announce(events, i, me); changeStages(state, i, f.stats, events); }
  for (const f of abFx(me, 'statSwap')) if (!me.swapUsed) {
    me.swapUsed = true;
    const a = me.stats[f.a], b = me.stats[f.b];
    me.stats[f.a] = b; me.stats[f.b] = a;
    me.style = combatStyle(me.stats);
    announce(events, i, me);
  }
  if (abHas(me, 'stageSteal') && !foe.fainted) {
    const taken = Object.fromEntries(Object.entries(foe.stages).filter(([, n]) => n > 0));
    if (Object.keys(taken).length) {
      announce(events, i, me);
      for (const k of Object.keys(taken)) foe.stages[k] = 0;
      changeStages(state, i, taken, events);
      events.push({ t: 'cleanse', side: 1 - i, name: foe.name });
    }
  }
  if (abHas(me, 'stageClear') && !foe.fainted && Object.values(foe.stages).some((n) => n !== 0)) {
    announce(events, i, me);
    foe.stages = freshStages();
    events.push({ t: 'cleanse', side: 1 - i, name: foe.name });
  }
  if (abHas(me, 'statusSwap') && me.status && !foe.fainted && canHaveStatus(foe, me.status)) {
    const was = me.status;
    announce(events, i, me);
    me.status = null; me.sleepTurns = 0;
    events.push({ t: 'cure', side: i, name: me.name, status: was });
    setStatus(state, 1 - i, was, events, makeRng(`${state.seed}:swap:${me.uid}`));
  }
  if (abHas(me, 'trace') && !foe.fainted && foe.ability && !abilityFx(foe.ability, 'trace').length) {
    announce(events, i, me);
    me.ability = foe.ability;
    announce(events, i, me);
  }
}

function canHaveStatus(b, status, mv) {
  if (b.status || b.fainted) return false;
  if (abHas(b, 'allStatusImmune') || abFx(b, 'statusImmune').some((f) => f.s === status)) return false;
  const t = b.types;
  if (mv && mv.flags.includes('powder') && t.includes('Grass')) return false;
  switch (status) {
    case 'brn': return !t.includes('Fire') && !abIs(b, 'damp_coat') && !abIs(b, 'inferno_core');
    case 'psn': return !t.includes('Poison') && !t.includes('Steel') && !abIs(b, 'antitoxin') && !abIs(b, 'verdant_core');
    case 'par': return !t.includes('Electric') && !abIs(b, 'loose_joints') && !abIs(b, 'storm_core');
    case 'slp': return !abIs(b, 'restless') && !abIs(b, 'lunar_core');
    case 'frz': return !t.includes('Ice') && !abIs(b, 'warm_core') && !abIs(b, 'frost_core');
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

/** Apply stage changes to a side's active creature. byFoe marks changes the other side caused, which Steady refuses. */
function changeStages(state, side, stats, events, byFoe = false) {
  const b = activeOf(state, side);
  if (b.fainted) return;
  let dropped = false;
  const twist = (n) => { let v = abHas(b, 'simple') ? n * 2 : n; if (abHas(b, 'contrary')) v = -v; return v; };
  for (const [k, raw] of Object.entries(stats)) {
    const n = twist(raw);
    if (k === 'acc' && n < 0 && abIs(b, 'hawkeye')) { events.push({ t: 'ability', side, name: b.name, ability: abilityName(b.ability) }); continue; }
    if (byFoe && n < 0 && abIs(b, 'steady')) { events.push({ t: 'ability', side, name: b.name, ability: abilityName(b.ability) }); continue; }
    if (byFoe && n < 0 && abFx(b, 'noStatDrop').some((f) => f.stat === k)) { announce(events, side, b); continue; }
    const cur = b.stages[k];
    const next = clamp(cur + n, -6, 6);
    events.push({ t: 'stat', side, name: b.name, stat: k, stages: next - cur, wanted: n });
    b.stages[k] = next;
    if (byFoe && next < cur) dropped = true;
  }
  if (dropped) for (const f of abFx(b, 'debuffedStat')) { announce(events, side, b); changeStages(state, side, f.stats, events, false); }
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
  if ((why === 'brn' || why === 'psn' || why === 'recoil' || why === 'thorns') && abHas(b, 'magicGuard')) return 0;
  const real = Math.max(1, Math.min(b.hp, Math.floor(amount)));
  b.hp -= real;
  events.push({ t: 'hurt', side, name: b.name, amount: real, hp: b.hp, maxHp: b.maxHp, why });
  if (b.hp <= 0) faint(state, side, events);
  return real;
}

function faint(state, side, events) {
  const b = activeOf(state, side);
  const carried = b.status;
  b.hp = 0;
  b.fainted = true;
  b.status = null;
  events.push({ t: 'faint', side, name: b.name, uid: b.uid });
  const foe = activeOf(state, 1 - side);
  const rng = makeRng(`${state.seed}:faint:${b.uid}`);
  for (const f of abFx(b, 'faintStatus')) {
    const status = f.s === 'own' ? carried : f.s;
    if (!foe.fainted && status && canHaveStatus(foe, status)) { announce(events, side, b); setStatus(state, 1 - side, status, events, rng); }
  }
  for (const f of abFx(b, 'faintStat')) if (!foe.fainted) { announce(events, side, b); changeStages(state, 1 - side, f.stats, events, true); }
  for (const f of abFx(b, 'faintHealParty')) {
    const bench = state.sides[side].party.filter((p) => !p.fainted && p !== b && p.hp < p.maxHp);
    if (!bench.length) continue;
    announce(events, side, b);
    for (const p of bench) {
      const amount = Math.max(1, Math.min(p.maxHp - p.hp, Math.floor(p.maxHp * f.r)));
      p.hp += amount;
      events.push({ t: 'heal', side, name: p.name, uid: p.uid, amount, hp: p.hp, maxHp: p.maxHp, why: 'ability' });
    }
  }
}

function moveOfAction(b, a) { return a.struggle ? STRUGGLE : getMove(b.moves[a.index].id); }

/** The move as this user throws it: a conversion passive retypes it and may lift its power. */
export function activeMove(user, mv) {
  const f = abFx(user, 'moveTypeChange').find((x) => x.from === mv.type && !mv.typeless);
  let out = f ? { ...mv, type: f.to, power: Math.round(mv.power * (f.m || 1)) } : mv;
  if (abHas(user, 'noContact') && out.flags.includes('contact')) out = { ...out, flags: out.flags.filter((x) => x !== 'contact') };
  return out;
}

/**
 * Damage for one hit. `roll` is the random factor in [0.85, 1], `crit` a boolean.
 * Exported so the AI can estimate with roll = 0.925 and no crit.
 */
export function calcDamage(user, target, mv, eff, roll, crit) {
  const fixed = moveFx(mv, 'fixed');
  if (fixed) return user.level;
  const dt = DAMAGE_TYPES[mv.cat] || DAMAGE_TYPES.melee;
  const atkKey = dt.atk, defKey = dt.def;
  const pierce = crit || Boolean(moveFx(mv, 'pierce')); // a critical hit, or a piercing move, ignores the target's guard and the user's own drops
  let aStage = pierce ? Math.max(0, user.stages[atkKey]) : user.stages[atkKey];
  let dStage = pierce ? Math.min(0, target.stages[defKey]) : target.stages[defKey];
  if (abHas(target, 'unaware')) aStage = Math.min(0, aStage); // it does not see the attacker's boasting
  if (abHas(user, 'unaware')) dStage = Math.min(0, dStage);
  let A = user.stats[atkKey] * stageMul(aStage);
  let D = Math.max(1, target.stats[defKey] * stageMul(dStage));
  if (abIs(user, 'grit') && user.status && mv.cat !== 'magic') A *= 1.5;
  A *= abMul(user, 'statMul', (f) => f.stat === atkKey);
  if (user.status) A *= abMul(user, 'statusStat', (f) => f.stat === atkKey);
  D *= guardMul(user, target, 'defMul', (f) => f.stat === defKey);
  if (target.status) D *= guardMul(user, target, 'statusDef', (f) => f.stat === defKey);
  let power = mv.power;
  const bis = moveFx(mv, 'boostIfStatus');
  if (bis && target.status) power *= bis.m;
  const low = moveFx(mv, 'boostIfLow');
  if (low && user.hp <= user.maxHp / 3) power *= low.m;
  const first = moveFx(mv, 'boostIfFirst');
  if (first && !target.moved) power *= first.m;
  if (abIs(user, 'finesse') && power <= 60) power *= 1.5;
  if (abIs(user, 'heavy_hands') && mv.flags.includes('punch')) power *= 1.2;
  if (abIs(user, 'vice_jaw') && mv.flags.includes('bite')) power *= 1.5;
  if (abIs(user, 'daredevil') && moveFx(mv, 'recoil')) power *= 1.2;
  if (SURGE[user.ability] === mv.type && user.hp <= user.maxHp / 3) power *= 1.5;
  const core = coreTypes(user.ability);
  if (core && core.includes(mv.type)) power *= 1.3;
  power *= charmPowerMul(user.held, mv);
  power *= abMul(user, 'typeBoost', (f) => f.type === mv.type && !mv.typeless && (!f.low || user.hp <= user.maxHp / 3));
  power *= abMul(user, 'catBoost', (f) => f.cat === mv.cat);
  power *= abMul(user, 'flagBoost', (f) => mv.flags.includes(f.flag));
  power *= abMul(user, 'powerBand', (f) => mv.power > 0 && (f.max != null ? mv.power <= f.max : mv.power >= f.min));
  power *= abMul(user, 'fxBoost', (f) => mv.fx.some((x) => x.k === f.fx));
  power *= target.moved ? abMul(user, 'lastStrike') : abMul(user, 'firstStrike');
  if (target.status) power *= abMul(user, 'statusBoost');
  if (user.hp === user.maxHp) power *= abMul(user, 'fullHpBoost');
  if (target.hp <= target.maxHp / 2) power *= abMul(user, 'foeLowBoost');
  if (mv.prio > 0) power *= abMul(user, 'prioBoost');
  if (hasSecondary(mv)) power *= abMul(user, 'sheerForce');
  power *= abMul(user, 'foeTypeBoost', (f) => target.types.includes(f.type));
  power *= abMul(user, 'foeCatBoost', (f) => target.style === f.cat);
  if (target.status) power *= abMul(user, 'foeStatusBoost', (f) => !f.s || f.s === target.status);
  if (target.hp === target.maxHp) power *= abMul(user, 'foeFullBoost');
  if (user.hp <= user.maxHp / 3) power *= abMul(user, 'lowHpBoost');
  if (user.lastStanding) power *= abMul(user, 'lastOneBoost');
  if (user.avenging) power *= abMul(user, 'revengeBoost');
  if (user.repeating) power *= abMul(user, 'repeatBoost');
  if (!user.turnsOut) power *= abMul(user, 'firstTurnBoost');
  power *= abMul(user, 'slowStart', (f) => (user.turnsOut || 0) < (f.turns || 2));
  power *= abMul(user, 'defeatist', (f) => user.hp <= user.maxHp * (f.at || 0.5));
  power *= abMul(user, 'hpCostBoost');
  power *= abMul(user, 'lateBoost', (f) => (user.battleTurn || 0) >= (f.from || 5));
  power *= abMul(user, 'earlyBoost', (f) => (user.battleTurn || 1) <= (f.until || 3));
  power *= user.held ? abMul(user, 'charmBoost') : abMul(user, 'charmless');
  power *= abMul(user, 'underdogBoost', () => target.level > user.level);
  power *= abMul(user, 'bullyBoost', () => target.level < user.level);
  if (!user.avenging) power *= abMul(user, 'fullPartyBoost');
  let dmg = Math.floor(Math.floor((Math.floor((2 * user.level) / 5) + 2) * power * A / D) / 50) + 2;
  if (crit) { const cb = abFx(user, 'critBoost')[0]; dmg = Math.floor(dmg * (cb ? cb.m : 1.5) * guardMul(user, target, 'critShield')); }
  dmg = Math.floor(dmg * roll);
  dmg = Math.floor(dmg * affinityBonus(user, mv));
  let effMul = eff;
  if (effMul > 0 && effMul < 1) effMul *= abMul(user, 'tintedLens');
  if (effMul >= 2) effMul *= abMul(user, 'effBoost') * guardMul(user, target, 'filter');
  if (effMul === 1) effMul *= abMul(user, 'neutralBoost');
  dmg = Math.floor(dmg * effMul);
  dmg = Math.floor(dmg * triangleMul(mv.cat, target.style)); // Magic > Ranged > Melee > Magic
  if (user.status === 'brn' && mv.cat !== 'magic' && !abIs(user, 'grit')) dmg = Math.floor(dmg / 2);
  if (abIs(target, 'blubber') && (mv.type === 'Fire' || mv.type === 'Ice')) dmg = Math.floor(dmg / 2);
  if (abIs(target, 'quake_core') && mv.cat === 'melee') dmg = Math.floor(dmg * 0.75);
  if (abIs(target, 'void_core') && mv.cat === 'ranged') dmg = Math.floor(dmg / 2);
  if (abIs(target, 'iron_hide') && mv.cat === 'melee') dmg = Math.floor(dmg * 0.75);
  if (abIs(target, 'bulwark') && mv.cat === 'ranged') dmg = Math.floor(dmg * 0.75);
  if (abIs(target, 'mirror_scale') && mv.cat === 'magic') dmg = Math.floor(dmg * 0.75);
  const guard = guardMul(user, target, 'typeResist', (f) => f.type === mv.type && !mv.typeless) * abMul(target, 'typeWeak', (f) => f.type === mv.type && !mv.typeless)
    * guardMul(user, target, 'catResist', (f) => f.cat === mv.cat) * guardMul(user, target, 'flagResist', (f) => mv.flags.includes(f.flag)) * guardMul(user, target, 'allResist')
    * guardMul(user, target, 'fxResist', (f) => mv.fx.some((x) => x.k === f.fx))
    * guardMul(user, target, 'bandResist', (f) => mv.power > 0 && (f.max != null ? mv.power <= f.max : mv.power >= f.min))
    * (target.hp === target.maxHp ? guardMul(user, target, 'fullHpResist') : 1) * (target.hp <= target.maxHp / 3 ? guardMul(user, target, 'lowHpResist') : 1);
  if (guard !== 1) dmg = Math.floor(dmg * guard);
  for (const f of guardFx(user, target, 'damageCap')) dmg = Math.min(dmg, Math.max(1, Math.floor(target.maxHp * f.r)));
  return Math.max(1, dmg);
}

/**
 * Affinity: a move that matches one of the user's types earns +25% (+50% with Purebred), and a
 * move whose damage type matches the user's style earns another +25%, so a Magic-style Fairy
 * using a Magic Fairy move hits for +50%. Returns the multiplier.
 */
export function affinityBonus(user, mv) {
  let bonus = 1;
  if (!mv.typeless && user.types.includes(mv.type)) { const st = abFx(user, 'stab')[0]; bonus += abIs(user, 'purebred') ? 0.5 : st ? st.m : 0.25; }
  if (mv.cat === user.style) bonus += 0.25;
  return bonus;
}

/** Type effectiveness of a move against a battler, including ability immunities. 0 means no effect. `user` lets Scrappy reach Ghosts. */
export function moveEffectiveness(mv, target, user) {
  if (mv.typeless) return 1;
  const breaks = Boolean(user && abHas(user, 'moldBreaker')); // a passive that walks through the target's guards
  if (!breaks) {
    if (mv.type === 'Ground' && abIs(target, 'hover')) return 0;
    if ((mv.type === 'Water' && abIs(target, 'sponge')) || (mv.type === 'Electric' && abIs(target, 'capacitor'))) return 0;
    if ((mv.type === 'Grass' && abIs(target, 'verdant_core')) || (mv.type === 'Dark' && abIs(target, 'radiant_core'))) return 0;
    if (abFx(target, 'typeImmune').some((f) => f.type === mv.type) || abFx(target, 'typeAbsorb').some((f) => f.type === mv.type)) return 0;
  }
  if (user && abHas(user, 'scrappy') && (mv.type === 'Normal' || mv.type === 'Fighting') && target.types.includes('Ghost')) return typeEffectiveness(mv.type, target.types.map((t) => (t === 'Ghost' ? null : t)));
  return typeEffectiveness(mv.type, target.types);
}

function hitChance(user, target, mv) {
  if (mv.acc == null || abHas(user, 'noGuard') || abHas(target, 'noGuard') || abHas(user, 'sureShot')) return 1;
  const blind = abHas(user, 'ignoreEvasion');
  const stage = clamp(user.stages.acc - (blind ? 0 : target.stages.eva), -6, 6);
  let base = Math.min(1, (mv.acc / 100) * accMul(stage) * abMul(user, 'accBoost') * abMul(user, 'catAcc', (f) => f.cat === mv.cat));
  if (!blind) base *= abMul(target, 'evasion');
  return abIs(target, 'mist_core') ? base * 0.8 : base; // one attack in five slips through the mist
}

function executeMove(state, i, action, events, rng) {
  const user = activeOf(state, i);
  const foeSide = 1 - i;
  const target = activeOf(state, foeSide);
  if (user.fainted) return;
  const mv = activeMove(user, moveOfAction(user, action));

  if (user.flinch) {
    user.flinch = false; user.moved = true; events.push({ t: 'flinch', side: i, name: user.name });
    for (const f of abFx(user, 'flinchStat')) { announce(events, i, user); changeStages(state, i, f.stats, events); }
    return;
  }
  if (user.recharge) { user.recharge = false; user.moved = true; events.push({ t: 'recharge', side: i, name: user.name }); return; }
  if (user.status === 'slp') {
    user.sleepTurns -= abHas(user, 'earlyBird') ? 2 : 1;
    const dreaming = abHas(user, 'actAsleep'); // it fights on through the dream
    if (user.sleepTurns > 0 && !dreaming) { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'slp' }); return; }
    if (user.sleepTurns <= 0) { user.status = null; events.push({ t: 'cure', side: i, name: user.name, status: 'slp' }); }
    else announce(events, i, user);
  }
  if (user.status === 'frz') {
    if (mv.type === 'Fire' || abHas(user, 'thawFast') || rng.chance(0.2)) { user.status = null; events.push({ t: 'cure', side: i, name: user.name, status: 'frz' }); }
    else { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'frz' }); return; }
  }
  if (user.status === 'par' && rng.chance(0.25)) { user.moved = true; events.push({ t: 'status_skip', side: i, name: user.name, status: 'par' }); return; }

  const saver = abFx(user, 'ppSave')[0];
  const spared = saver && rng.chance(saver.p / 100);
  if (!action.struggle && !spared) user.moves[action.index].pp = Math.max(0, user.moves[action.index].pp - (abHas(target, 'pressure') && !target.fainted ? 2 : 1));
  user.repeating = user.lastMove === mv.id; // pressing the same attack again feeds the passives that build
  user.lastMove = mv.id;
  user.moved = true;
  events.push({ t: 'move', side: i, name: user.name, move: mv.name, moveId: mv.id, type: mv.type, cat: mv.cat });
  if (abHas(user, 'protean') && !mv.typeless && !user.types.includes(mv.type)) { announce(events, i, user); user.types = [mv.type, null]; }

  const targetsFoe = isDamaging(mv) || mv.fx.some((f) => f.k === 'status' || (f.k === 'stat' && f.who === 'foe'));
  if (targetsFoe) {
    if (target.fainted) { events.push({ t: 'no_target', side: i }); return; }
    if ((mv.flags.includes('sound') && abHas(target, 'soundImmune')) || (mv.flags.includes('powder') && abHas(target, 'powderImmune')) || (mv.prio > 0 && abHas(target, 'prioImmune'))) {
      announce(events, foeSide, target); events.push({ t: 'immune', side: foeSide, name: target.name }); return;
    }
    if (!rng.chance(hitChance(user, target, mv))) { events.push({ t: 'miss', side: i, name: user.name, target: target.name }); return; }
  }

  if (!isDamaging(mv)) { applyStatusMove(state, i, mv, events, rng); return; }

  const eff = moveEffectiveness(mv, target, user);
  if (eff === 0) {
    const absorb = abFx(target, 'typeAbsorb').find((f) => f.type === mv.type);
    if (absorb) {
      announce(events, foeSide, target);
      if (absorb.heal) { if (!healBattler(state, foeSide, target.maxHp * absorb.heal, events, 'absorb')) events.push({ t: 'immune', side: foeSide, name: target.name }); }
      else { events.push({ t: 'immune', side: foeSide, name: target.name }); if (absorb.stats) changeStages(state, foeSide, absorb.stats, events); }
      return;
    }
    if (abFx(target, 'typeImmune').some((f) => f.type === mv.type)) announce(events, foeSide, target);
    if ((abIs(target, 'hover') && mv.type === 'Ground') || (abIs(target, 'radiant_core') && mv.type === 'Dark')) events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
    if ((abIs(target, 'sponge') && mv.type === 'Water') || (abIs(target, 'capacitor') && mv.type === 'Electric') || (abIs(target, 'verdant_core') && mv.type === 'Grass')) {
      events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
      if (!healBattler(state, foeSide, target.maxHp / 4, events, 'absorb')) events.push({ t: 'immune', side: foeSide, name: target.name });
      return;
    }
    events.push({ t: 'immune', side: foeSide, name: target.name });
    return;
  }

  if (guardFx(user, target, 'disguise').length && !target.disguiseUsed) { // the first hit only meets the costume
    target.disguiseUsed = true;
    announce(events, foeSide, target);
    events.push({ t: 'immune', side: foeSide, name: target.name });
    return;
  }
  const multi = moveFx(mv, 'multi');
  let hits = multi ? rng.pick([2, 2, 3, 3, 4, 5].filter((n) => n >= multi.min && n <= multi.max)) : 1;
  if (multi && abHas(user, 'multiExtra')) hits = Math.min(6, hits + 1);
  let total = 0, landed = 0, anyCrit = false;
  for (let h = 0; h < hits; h++) {
    if (target.fainted) break;
    let crit = rng.chance((mv.crit >= 1 ? 1 / 8 : 1 / 24) * (abIs(user, 'keen_edge') ? 2 : 1) * (heldKind(user.held) === 'crit' ? charmValue(user.held, 'critMul') || 2 : 1) * abMul(user, 'critRate'));
    if (guardFx(user, target, 'critImmune').length) crit = false;
    else if (target.status && abHas(user, 'mercilessCrit')) crit = true;
    else if (abFx(user, 'critIf').some((f) => (f.when === 'firstTurn' ? !user.turnsOut : f.when === 'lowHp' ? user.hp <= user.maxHp / 3 : user.hp === user.maxHp))) crit = true;
    if (crit) anyCrit = true;
    const roll = rng.between(85, 100) / 100;
    let dmg = calcDamage(user, target, mv, eff, roll, crit);
    const fhr = guardFx(user, target, 'firstHitResist')[0];
    if (fhr && !target.firstHitUsed) { target.firstHitUsed = true; dmg = Math.max(1, Math.floor(dmg * fhr.m)); announce(events, foeSide, target); }
    let held = false, sturdy = false, endured = false;
    if (dmg >= target.hp && target.hp === target.maxHp && abIs(target, 'stonewall')) { dmg = target.hp - 1; held = true; }
    else if (dmg >= target.hp && target.hp === target.maxHp && guardFx(user, target, 'endure').length && !target.endureUsed) { dmg = target.hp - 1; endured = true; target.endureUsed = true; }
    else if (dmg >= target.hp && target.hp === target.maxHp && heldKind(target.held) === 'sturdy' && (target.sturdyUsed || 0) < charmUses(target.held)) { dmg = target.hp - 1; sturdy = true; target.sturdyUsed = (target.sturdyUsed || 0) + 1; }
    dmg = Math.min(dmg, target.hp);
    target.hp -= dmg;
    total += dmg; landed++;
    events.push({ t: 'damage', side: foeSide, name: target.name, amount: dmg, hp: target.hp, maxHp: target.maxHp, eff, crit });
    if (held || endured) events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
    if (sturdy) events.push({ t: 'held', side: foeSide, name: target.name, item: getCharm(target.held).name });
    if (target.hp <= 0) faint(state, foeSide, events);
  }
  if (hits > 1) events.push({ t: 'multihit', side: i, hits: landed });

  // the target's reactions to being hit
  if (total > 0 && !target.fainted) {
    for (const f of abFx(target, 'hurtStat')) if (!f.cat || f.cat === mv.cat) { announce(events, foeSide, target); changeStages(state, foeSide, f.stats, events); }
    for (const f of abFx(target, 'hitByTypeStat')) if (f.type === mv.type && !mv.typeless) { announce(events, foeSide, target); changeStages(state, foeSide, f.stats, events); }
    if (anyCrit) for (const f of abFx(target, 'critStat')) { announce(events, foeSide, target); changeStages(state, foeSide, f.stats, events); }
    for (const f of abFx(target, 'lowHpStat')) if (!target.lowHpUsed && target.hp <= target.maxHp * f.at) { target.lowHpUsed = true; announce(events, foeSide, target); changeStages(state, foeSide, f.stats, events); }
    for (const f of abFx(target, 'hurtFoeStat')) if (!user.fainted && (f.p == null || rng.chance(f.p / 100))) { announce(events, foeSide, target); changeStages(state, i, f.stats, events, true); }
    for (const f of abFx(target, 'catThorns')) if (f.cat === mv.cat && !user.fainted) { announce(events, foeSide, target); hurtBattler(state, i, Math.max(1, total * f.r), events, 'thorns'); }
    for (const f of abFx(target, 'lowHpHeal')) if (!target.lowHpHealUsed && target.hp <= target.maxHp * (f.at || 0.25)) {
      target.lowHpHealUsed = true; announce(events, foeSide, target); healBattler(state, foeSide, target.maxHp * f.r, events, 'ability');
    }
    if (abHas(target, 'colorChange') && !mv.typeless && !target.types.includes(mv.type)) { announce(events, foeSide, target); target.types = [mv.type, null]; }
  }
  if (anyCrit && !target.fainted) for (const f of abFx(user, 'critStatus')) {
    if (rng.chance((f.p == null ? 100 : f.p) / 100) && canHaveStatus(target, f.s, mv)) { announce(events, i, user); setStatus(state, foeSide, f.s, events, rng, mv); }
  }
  const drain = moveFx(mv, 'drain');
  if (drain && total > 0) {
    if (abHas(target, 'liquidOoze')) { announce(events, foeSide, target); hurtBattler(state, i, Math.max(1, total * drain.r), events, 'thorns'); }
    else if (abHas(target, 'drainImmune')) announce(events, foeSide, target); // nothing in it to drink
    else healBattler(state, i, Math.max(1, total * drain.r * abMul(user, 'drainMul')), events, 'drain');
  }
  if (heldKind(user.held) === 'siphon' && total > 0 && user.hp < user.maxHp) {
    events.push({ t: 'held', side: i, name: user.name, item: getCharm(user.held).name });
    healBattler(state, i, Math.max(1, total * charmValue(user.held, 'siphon')), events, 'drain');
  }
  if (abIs(user, 'vital_core') && mv.flags.includes('contact') && total > 0 && user.hp < user.maxHp) {
    events.push({ t: 'ability', side: i, name: user.name, ability: abilityName(user.ability) });
    healBattler(state, i, Math.max(1, total / 4), events, 'drain');
  }
  if (abIs(target, 'resonant_core') && mv.cat === 'magic' && total > 0 && !user.fainted) {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(target.ability) });
    hurtBattler(state, i, Math.max(1, total / 4), events, 'thorns');
  }
  const recoil = moveFx(mv, 'recoil');
  if (recoil && total > 0 && !abIs(user, 'thick_skull') && !abHas(user, 'recoilImmune')) hurtBattler(state, i, Math.max(1, total * recoil.r * abMul(user, 'recoilMul')), events, 'recoil');
  const cost = abFx(user, 'hpCostBoost')[0];
  if (cost && total > 0 && !user.fainted) { announce(events, i, user); hurtBattler(state, i, Math.max(1, user.maxHp * cost.r), events, 'recoil'); }
  const restore = moveFx(mv, 'restore');
  if (restore && total > 0 && !user.fainted && !(abHas(target, 'healBlock') && !target.fainted)) healBattler(state, i, Math.max(1, user.maxHp * restore.r), events, 'restore');
  if (moveFx(mv, 'cure') && total > 0 && user.status) { const was = user.status; user.status = null; user.sleepTurns = 0; events.push({ t: 'cure', side: i, name: user.name, status: was, why: 'move' }); }
  if (moveFx(mv, 'recharge') && total > 0 && !user.fainted) user.recharge = true;
  if (moveFx(mv, 'cleanse') && total > 0 && !target.fainted && Object.values(target.stages).some((n) => n !== 0)) { target.stages = freshStages(); events.push({ t: 'cleanse', side: foeSide, name: target.name }); }
  if (mv.struggle) hurtBattler(state, i, Math.max(1, user.maxHp / 4), events, 'struggle');

  if (!target.fainted) applySecondaries(state, i, mv, events, rng);
  if (mv.flags.includes('contact') && !user.fainted) contactEffects(state, i, events, rng);
  if (target.fainted && !user.fainted && abIs(user, 'swagger')) {
    events.push({ t: 'ability', side: i, name: user.name, ability: abilityName(user.ability) });
    changeStages(state, i, { melee: 1, ranged: 1 }, events);
  }
  if (target.fainted && !user.fainted) {
    for (const f of abFx(user, 'koStat')) { announce(events, i, user); changeStages(state, i, f.stats, events); }
    for (const f of abFx(user, 'koHeal')) if (user.hp < user.maxHp) { announce(events, i, user); healBattler(state, i, user.maxHp * f.r, events, 'ability'); }
    const am = abFx(target, 'aftermath')[0];
    if (am && mv.flags.includes('contact')) { announce(events, foeSide, target); hurtBattler(state, i, Math.max(1, user.maxHp * am.r), events, 'thorns'); }
  }
}

/** A status a foe just inflicted comes back to it when the victim carries Synchronize (burn, poison and paralysis only). */
function syncBack(state, from, victimSide, status, events, rng) {
  const victim = activeOf(state, victimSide);
  if (!abHas(victim, 'synchronize') || !['brn', 'psn', 'par'].includes(status)) return;
  if (!canHaveStatus(activeOf(state, from), status)) return;
  announce(events, victimSide, victim);
  setStatus(state, from, status, events, rng);
}

function chanceOf(user, p) { return Math.min(100, (abIs(user, 'lucky_streak') ? p * 2 : p) * abMul(user, 'statusChanceMul')) / 100; }

function applySecondaries(state, i, mv, events, rng) {
  const user = activeOf(state, i), foeSide = 1 - i, target = activeOf(state, foeSide);
  const sheer = abHas(user, 'sheerForce'), shield = abHas(target, 'shieldDust');
  const onFoe = (f) => f.k === 'status' || f.k === 'flinch' || (f.k === 'stat' && f.who === 'foe');
  for (const f of mv.fx) {
    const p = f.p == null ? 100 : f.p;
    if ((sheer || shield) && onFoe(f)) continue; // Sheer Force traded the effect for power; Shield Dust shrugs it off
    if (f.k === 'status') { if (rng.chance(chanceOf(user, p)) && setStatus(state, foeSide, f.s, events, rng, mv)) syncBack(state, i, foeSide, f.s, events, rng); }
    else if (f.k === 'stat') { if (rng.chance(chanceOf(user, p))) changeStages(state, f.who === 'self' ? i : foeSide, f.stats, events, f.who !== 'self'); }
    else if (f.k === 'flinch') { if (!target.moved && !abHas(target, 'flinchImmune') && rng.chance(chanceOf(user, p))) target.flinch = true; }
  }
  if (sheer || shield) return;
  for (const f of abFx(user, 'addFlinch')) if (!target.moved && !abHas(target, 'flinchImmune') && rng.chance(chanceOf(user, f.p))) { announce(events, i, user); target.flinch = true; }
  for (const f of abFx(user, 'addStatus')) if ((!f.contact || mv.flags.includes('contact')) && rng.chance(chanceOf(user, f.p)) && canHaveStatus(target, f.s, mv)) {
    announce(events, i, user);
    if (setStatus(state, foeSide, f.s, events, rng, mv)) syncBack(state, i, foeSide, f.s, events, rng);
  }
}

function contactEffects(state, i, events, rng) {
  const user = activeOf(state, i), foeSide = 1 - i, target = activeOf(state, foeSide);
  const ab = target.ability;
  if (ab === 'thorn_hide') {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
    hurtBattler(state, i, Math.max(1, user.maxHp / 8), events, 'thorns');
  } else if (ab === 'corrosion_core' && user.stages.meleeDef > -6) {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
    changeStages(state, i, { meleeDef: -1 }, events, true);
  } else if (ab === 'frost_core' && rng.chance(0.3) && user.stages.spe > -6) {
    events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
    changeStages(state, i, { spe: -1 }, events, true);
  } else if ((ab === 'live_fur' || ab === 'hot_blooded' || ab === 'venom_barbs' || ab === 'inferno_core') && rng.chance(0.3)) {
    const status = ab === 'live_fur' ? 'par' : (ab === 'hot_blooded' || ab === 'inferno_core') ? 'brn' : 'psn';
    if (canHaveStatus(user, status)) {
      events.push({ t: 'ability', side: foeSide, name: target.name, ability: abilityName(ab) });
      setStatus(state, i, status, events, rng);
    }
  }
  for (const f of abFx(target, 'contactHurt')) if (!user.fainted) { announce(events, foeSide, target); hurtBattler(state, i, Math.max(1, user.maxHp * f.r), events, 'thorns'); }
  for (const f of abFx(target, 'contactStatus')) if (!user.fainted && rng.chance(f.p / 100)) {
    const status = f.s === 'random' ? rng.pick(['brn', 'psn', 'par']) : f.s;
    if (canHaveStatus(user, status)) { announce(events, foeSide, target); setStatus(state, i, status, events, rng); }
  }
  for (const f of abFx(target, 'contactStat')) if (!user.fainted && (f.p == null || rng.chance(f.p / 100))) { announce(events, foeSide, target); changeStages(state, i, f.stats, events, true); }
}

function applyStatusMove(state, i, mv, events, rng, bounced = false) {
  const foeSide = 1 - i;
  let didSomething = false;
  const aimsAtFoe = mv.fx.some((f) => f.k === 'status' || (f.k === 'stat' && f.who === 'foe'));
  if (aimsAtFoe && !bounced && abHas(activeOf(state, foeSide), 'magicBounce')) { // the move turns round and looks for its sender
    announce(events, foeSide, activeOf(state, foeSide));
    applyStatusMove(state, foeSide, { ...mv, fx: mv.fx.filter((f) => f.k === 'status' || (f.k === 'stat' && f.who === 'foe')) }, events, rng, true);
    return;
  }
  if (aimsAtFoe && abHas(activeOf(state, foeSide), 'statusMoveImmune')) {
    announce(events, foeSide, activeOf(state, foeSide));
    events.push({ t: 'immune', side: foeSide, name: activeOf(state, foeSide).name });
    return;
  }
  if (mv.fx.some((f) => f.k === 'status') && moveEffectiveness(mv, activeOf(state, foeSide), activeOf(state, i)) === 0) {
    events.push({ t: 'immune', side: foeSide, name: activeOf(state, foeSide).name });
    return;
  }
  for (const f of mv.fx) {
    if (f.k === 'status') {
      const target = activeOf(state, foeSide);
      if (setStatus(state, foeSide, f.s, events, rng, mv)) { didSomething = true; syncBack(state, i, foeSide, f.s, events, rng); }
      else events.push({ t: 'no_effect', side: foeSide, name: target.name, reason: target.status ? 'already' : 'immune' });
    } else if (f.k === 'stat') {
      const who = f.who === 'self' ? i : foeSide;
      const before = { ...activeOf(state, who).stages };
      changeStages(state, who, f.stats, events, f.who !== 'self');
      if (Object.keys(f.stats).some((k) => activeOf(state, who).stages[k] !== before[k])) didSomething = true;
    } else if (f.k === 'heal') {
      const me = activeOf(state, i);
      const sealer = activeOf(state, foeSide);
      if (abHas(sealer, 'healBlock') && !sealer.fainted) { announce(events, foeSide, sealer); events.push({ t: 'no_effect', side: i, name: me.name, reason: 'failed' }); }
      else if (healBattler(state, i, me.maxHp * f.r, events, 'heal')) didSomething = true;
      else events.push({ t: 'no_effect', side: i, name: me.name, reason: 'full' });
    }
  }
  if (!didSomething && !mv.fx.length) events.push({ t: 'no_effect', side: i, name: activeOf(state, i).name, reason: 'failed' });
}

function endOfTurn(state, events, rng) {
  for (const i of [0, 1]) { const b = activeOf(state, i); if (!b.fainted) b.turnsOut = (b.turnsOut || 0) + 1; }
  for (const i of speedOrder(state, rng)) {
    const b = activeOf(state, i);
    if (b.fainted) continue;
    if (b.status === 'brn') hurtBattler(state, i, Math.max(1, b.maxHp / 16), events, 'brn');
    else if (b.status === 'psn') {
      if (abHas(b, 'poisonHeal')) { if (b.hp < b.maxHp) { announce(events, i, b); healBattler(state, i, Math.max(1, b.maxHp / 8), events, 'ability'); } }
      else hurtBattler(state, i, Math.max(1, b.maxHp / 8), events, 'psn');
    }
    if (!b.fainted && abIs(b, 'momentum') && b.stages.spe < 6) {
      events.push({ t: 'ability', side: i, name: b.name, ability: abilityName(b.ability) });
      changeStages(state, i, { spe: 1 }, events);
    }
    if (!b.fainted && (abIs(b, 'tide_core') || abIs(b, 'regrowth')) && b.hp < b.maxHp) {
      events.push({ t: 'ability', side: i, name: b.name, ability: abilityName(b.ability) });
      healBattler(state, i, Math.max(1, b.maxHp / 16), events, 'ability');
    }
    if (!b.fainted && heldKind(b.held) === 'regen' && b.hp < b.maxHp) {
      events.push({ t: 'held', side: i, name: b.name, item: getCharm(b.held).name });
      healBattler(state, i, Math.max(1, b.maxHp * charmValue(b.held, 'regen')), events, 'ability');
    }
    if (!b.fainted && heldKind(b.held) === 'salve' && b.status && (b.salveUsed || 0) < charmUses(b.held)) {
      const was = b.status;
      b.status = null; b.sleepTurns = 0; b.salveUsed = (b.salveUsed || 0) + 1;
      events.push({ t: 'held', side: i, name: b.name, item: getCharm(b.held).name });
      events.push({ t: 'cure', side: i, name: b.name, status: was, why: 'held' });
    }
    for (const f of abFx(b, 'turnHeal')) if (!b.fainted && b.hp < b.maxHp) { announce(events, i, b); healBattler(state, i, Math.max(1, b.maxHp * f.r), events, 'ability'); }
    for (const f of abFx(b, 'turnStat')) if (!b.fainted && (f.p == null || rng.chance(f.p / 100))) { announce(events, i, b); changeStages(state, i, f.stats, events); }
    for (const f of abFx(b, 'turnCure')) if (!b.fainted && b.status && rng.chance(f.p / 100)) { const was = b.status; b.status = null; b.sleepTurns = 0; announce(events, i, b); events.push({ t: 'cure', side: i, name: b.name, status: was }); }
    for (const f of abFx(b, 'benchHeal')) {
      const bench = state.sides[i].party.filter((p) => p !== b && !p.fainted && p.hp < p.maxHp);
      if (!b.fainted && bench.length) {
        announce(events, i, b);
        for (const p of bench) {
          const amount = Math.max(1, Math.min(p.maxHp - p.hp, Math.floor(p.maxHp * f.r)));
          p.hp += amount;
          events.push({ t: 'heal', side: i, name: p.name, uid: p.uid, amount, hp: p.hp, maxHp: p.maxHp, why: 'ability' });
        }
      }
    }
    for (const f of abFx(b, 'benchCure')) {
      const sick = state.sides[i].party.find((p) => p !== b && !p.fainted && p.status);
      if (!b.fainted && sick && rng.chance(f.p / 100)) {
        const was = sick.status;
        sick.status = null; sick.sleepTurns = 0;
        announce(events, i, b);
        events.push({ t: 'cure', side: i, name: sick.name, uid: sick.uid, status: was });
      }
    }
    for (const f of abFx(b, 'turnHurtFoe')) {
      const foe = activeOf(state, 1 - i);
      if (!b.fainted && !foe.fainted && (!f.statusOnly || foe.status)) { announce(events, i, b); hurtBattler(state, 1 - i, Math.max(1, foe.maxHp * f.r), events, 'aura'); }
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
    case 'cure': return e.why === 'item' || e.why === 'move' || e.why === 'held' ? `${who} was cured of its ${STATUS_INFO[e.status].name.toLowerCase()}!` : e.status === 'slp' ? `${who} woke up!` : e.status === 'frz' ? `${who} thawed out!` : `${who} recovered.`;
    case 'item': return `${foe ? names[1] : names[0]} used a ${e.item} on ${e.name}!`;
    case 'flinch': return `${who} flinched!`;
    case 'recharge': return `${who} must recharge!`;
    case 'cleanse': return `${who}'s stat changes were swept away!`;
    case 'stat': {
      const label = STAT_LABEL[e.stat] || e.stat;
      if (e.stages === 0) return `${who}'s ${label} won't go any ${e.wanted > 0 ? 'higher' : 'lower'}!`;
      const size = Math.abs(e.stages) >= 2 ? 'sharply ' : '';
      return `${who}'s ${label} ${size}${e.stages > 0 ? 'rose' : 'fell'}!`;
    }
    case 'heal': return e.why === 'drain' ? `${who} drained some HP!` : e.why === 'restore' ? `${who} restored ${e.amount} HP!` : `${who} recovered ${e.amount} HP.`;
    case 'hurt': return e.why === 'recoil' || e.why === 'struggle' ? `${who} is hit with recoil!` : e.why === 'brn' ? `${who} is hurt by its burn!` : e.why === 'psn' ? `${who} is hurt by poison!` : e.why === 'thorns' ? `${who} is pricked by thorns!` : `${who} took ${e.amount} damage.`;
    case 'ability': return `[${who}'s ${e.ability}]`;
    case 'held': return `[${who}'s ${e.item}]`;
    case 'faint': return `${who} fainted!`;
    case 'capture': return e.ok ? `Gotcha! ${e.name} was caught!` : e.shakes === 0 ? 'Oh no! It broke free right away!' : e.shakes === 1 ? 'It shook once… and broke free!' : 'So close! It broke free!';
    case 'end': return e.capture ? `${e.name} joined the team!` : e.winner == null ? 'Both sides are out of creatures. It is a draw!' : e.winner === 0 ? `${names[0]} won the battle!` : opts.wild ? 'Your team was defeated…' : `${names[1]} won the battle!`;
    default: return '';
  }
}
