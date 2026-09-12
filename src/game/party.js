// Party members: the creatures a player carries. A member is { uid, genome, level, xp, hp,
// status, moves }. XP, levels, healing, move learning and the party/box rules live here as
// pure functions over any owner object with `party`, `box` and `pendingLearns`, so the
// overworld (and anything added later) shares one set of rules.
import { learnsetOf } from '../creature/genome.js';
import { getMove } from '../data/moves.js';
import { statsAtLevel, movesAtLevel } from '../battle/stats.js';
import { MAX_PARTY } from '../battle/engine.js';
import { stageOf } from '../data/evolution.js';

export const PARTY = { max: MAX_PARTY, maxLevel: 100, starterLevel: 5 };
/** Experience follows Pokémon Red: a foe's base yield (from its stat total and evolution stage) times its level, over seven. */
export const XP = { yieldPerBst: 0.15, stageYield: { 1: 1, 2: 1.6, 3: 2.4 }, trainerBonus: 1.5, benchShare: 0.5 };

/** Medium-fast growth: level L needs L cubed experience. */
export function xpForLevel(L) { return L * L * L; }
/** XP for defeating (or catching) one foe: yield × level / 7, half again for a trainer's, a Warden's or an alpha's creature. Shared by the party members that fought. */
export function xpReward(level, bst, kind) {
  const base = (bst || 400) * XP.yieldPerBst * (XP.stageYield[stageOf(level)] || 1);
  return Math.max(1, Math.round(((base * level) / 7) * (kind === 'wild' ? 1 : XP.trainerBonus)));
}

export function memberMaxHp(m) { return statsAtLevel(m.genome, m.level).hp; }

/** XP progress within the current level: { cur, prev, next, frac }. frac is 1 at the level cap. */
export function xpProgress(m) {
  const prev = xpForLevel(m.level);
  const next = m.level >= PARTY.maxLevel ? prev : xpForLevel(m.level + 1);
  const frac = next > prev ? Math.max(0, Math.min(1, (m.xp - prev) / (next - prev))) : 1;
  return { cur: m.xp, prev, next, frac };
}

export function makeMember(genome, level, uid) {
  const m = { uid, genome, level, xp: xpForLevel(level), hp: 0, status: null, moves: movesAtLevel(learnsetOf(genome), level), held: null, bond: 0 };
  m.hp = memberMaxHp(m);
  return m;
}

/** Moves a member could pick up between two levels (exclusive of `from`, inclusive of `to`). */
export function movesLearnedBetween(m, from, to) {
  const out = [];
  for (const [lvl, id] of learnsetOf(m.genome)) if (lvl > from && lvl <= to && getMove(id) && !m.moves.includes(id) && !out.includes(id)) out.push(id);
  return out;
}

export function memberById(owner, uid) { return [...owner.party, ...(owner.box || [])].find((m) => m.uid === uid) || null; }

/** Resolve a pending learn: replace the move at `replaceIndex`, or skip when it is null. */
export function learnMove(owner, uid, moveId, replaceIndex) {
  const m = memberById(owner, uid);
  owner.pendingLearns = (owner.pendingLearns || []).filter((p) => !(p.uid === uid && p.moveId === moveId));
  if (!m || replaceIndex == null || !getMove(moveId)) return owner;
  if (replaceIndex >= 0 && replaceIndex < m.moves.length) m.moves[replaceIndex] = moveId;
  else if (m.moves.length < 4) m.moves.push(moveId);
  return owner;
}

/** Add xp, level up as far as it goes (current HP grows with max HP), and report moves learned or pending. */
export function gainXp(m, xp) {
  const from = m.level;
  m.xp += xp;
  while (m.level < PARTY.maxLevel && m.xp >= xpForLevel(m.level + 1)) {
    const oldMax = memberMaxHp(m);
    m.level++;
    if (m.hp > 0) m.hp += memberMaxHp(m) - oldMax;
  }
  const learned = [], pending = [];
  for (const id of movesLearnedBetween(m, from, m.level)) {
    if (m.moves.length < 4) { m.moves.push(id); learned.push(id); } else pending.push(id);
  }
  return { from, to: m.level, learned, pending };
}

/** Heal everyone (party and box) by a fraction of max HP, or fully; statuses clear either way. */
export function healParty(owner, fraction, full) {
  for (const m of [...owner.party, ...(owner.box || [])]) {
    const max = memberMaxHp(m);
    if (full) { m.hp = max; m.status = null; continue; }
    m.hp = Math.min(max, m.hp + Math.round(max * fraction));
    m.status = null;
  }
  return owner;
}

export function moveMember(owner, uid, to) {
  const m = memberById(owner, uid);
  if (!m) return owner;
  if (to === 'box') {
    if (owner.party.length <= 1 || !owner.party.includes(m)) return owner;
    owner.party = owner.party.filter((x) => x !== m); owner.box.push(m);
  } else {
    if (owner.party.length >= PARTY.max || !owner.box.includes(m)) return owner;
    owner.box = owner.box.filter((x) => x !== m); owner.party.push(m);
  }
  return owner;
}

/** Party presets: three arrangements of the roster you can save at Storage and put back on later. */
export const PRESETS = { slots: 3, nameMax: 18 };

/** Save the party as it stands into a preset slot. Returns the preset. */
export function savePreset(owner, index, name) {
  const i = Math.max(0, Math.min(PRESETS.slots - 1, Math.floor(Number(index) || 0)));
  owner.presets = Array.isArray(owner.presets) ? owner.presets.slice(0, PRESETS.slots) : [];
  while (owner.presets.length < PRESETS.slots) owner.presets.push(null);
  const preset = {
    name: String(name || `Team ${i + 1}`).trim().slice(0, PRESETS.nameMax) || `Team ${i + 1}`,
    uids: owner.party.map((m) => m.uid),
  };
  owner.presets[i] = preset;
  return preset;
}

/** What a preset would put in the party, in order: the ones it names that are still on the roster. */
export function presetMembers(owner, index) {
  const preset = (owner.presets || [])[index];
  if (!preset) return [];
  const all = [...owner.party, ...(owner.box || [])];
  const out = [];
  for (const uid of preset.uids) { const m = all.find((x) => x.uid === uid); if (m && !out.includes(m)) out.push(m); }
  return out.slice(0, PARTY.max);
}

/** Put a preset back on: everyone it names into the party, everyone else into the box. { ok, reason?, party } */
export function applyPreset(owner, index) {
  const want = presetMembers(owner, index);
  if (!want.length) return { ok: false, reason: 'That team is empty, or everyone in it is gone.' };
  const rest = [...owner.party, ...(owner.box || [])].filter((m) => !want.includes(m));
  owner.party = want;
  owner.box = rest;
  return { ok: true, party: want };
}

export const NAME_MAX = 16;
/** Nickname a creature: trimmed, single-spaced, 1 to 16 characters. { ok, reason?, name } */
export function renameMember(owner, uid, name) {
  const m = memberById(owner, uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  const clean = String(name == null ? '' : name).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  if (!clean) return { ok: false, reason: 'Give it a name.' };
  m.genome.name = clean;
  return { ok: true, name: clean };
}

/** Lock a creature against release and fusion, or unlock it. { ok, reason?, locked } */
export function setLocked(owner, uid, locked) {
  const m = memberById(owner, uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  m.locked = Boolean(locked);
  return { ok: true, locked: m.locked };
}

/** Let a creature go for good, from the party or the box. The party always keeps at least one; locked creatures stay. { ok, reason?, member? } */
export function releaseMember(owner, uid) {
  const m = memberById(owner, uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  if (m.locked) return { ok: false, reason: `${m.genome.name} is locked. Unlock it first.` };
  if (owner.party.includes(m)) {
    if (owner.party.length <= 1) return { ok: false, reason: 'Keep at least one creature with you.' };
    owner.party = owner.party.filter((x) => x !== m);
  } else owner.box = owner.box.filter((x) => x !== m);
  if (Array.isArray(owner.pendingLearns)) owner.pendingLearns = owner.pendingLearns.filter((p) => p.uid !== uid);
  if (m.held) { owner.bag = owner.bag || {}; owner.bag[m.held] = (owner.bag[m.held] || 0) + 1; m.held = null; } // its charm stays with you
  return { ok: true, member: m };
}

export function setLead(owner, uid) {
  const i = owner.party.findIndex((m) => m.uid === uid);
  if (i > 0) owner.party.unshift(...owner.party.splice(i, 1));
  return owner;
}

export function canFight(owner) { return owner.party.some((m) => m.hp > 0); }
