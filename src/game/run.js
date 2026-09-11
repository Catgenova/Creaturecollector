// Endless arena rules. Pure game logic over a plain `run` object; the UI calls
// these and persists the result. Every roll is seeded by the run seed and floor.
import { makeRng } from '../core/rng.js';
import { SPECIES, TIER_WEIGHT } from '../data/species.js';
import { speciesGenome } from '../creature/genome.js';
import { fuse } from '../creature/fusion.js';
import { statsAtLevel } from '../battle/stats.js';
import { createBattle, makeBattler, MAX_PARTY } from '../battle/engine.js';

export const ARENA = {
  partyMax: MAX_PARTY,
  starterLevel: 5,
  baseLevel: 4,
  levelPerFloor: 2,
  maxLevel: 100,
  bossEvery: 5,
  trainerEvery: 3,
  healBetweenFloors: 0.4,
  xpK: 5.5,
  wildFusionFrom: 6,
};

const TRAINER_NAMES = ['Ranger Ivy', 'Scout Bram', 'Herder Tobin', 'Keeper Sable', 'Drifter Wren', 'Tamer Oakes', 'Courier Pim', 'Warden’s Aide Lise'];
const WARDEN_NAMES = ['Ashvale', 'Brine', 'Cinder', 'Duskmoor', 'Emberlake', 'Frostgate', 'Gloam', 'Hollowreach'];

export function floorLevel(floor) { return Math.min(ARENA.maxLevel, ARENA.baseLevel + floor * ARENA.levelPerFloor); }
export function xpForLevel(L) { return L * L * L; }
/** XP for defeating (or catching) one foe. Tuned so a floor is worth roughly two levels. */
export function xpReward(level, bst, kind) {
  return Math.round(ARENA.xpK * level * level * ((bst || 400) / 400) * (kind === 'boss' ? 1.5 : 1));
}

export function memberMaxHp(m) { return statsAtLevel(m.genome, m.level).hp; }

export function makeMember(genome, level, uid) {
  const m = { uid, genome, level, xp: xpForLevel(level), hp: 0, status: null };
  m.hp = memberMaxHp(m);
  return m;
}

function nextUid(run) { return `m${run.nextId++}`; }

export function newRun(seed) {
  const rng = makeRng(`${seed}:starters`);
  const starters = [];
  const used = new Set();
  let guard = 0;
  while (starters.length < 3 && guard++ < 50) {
    const sp = rng.weighted(SPECIES.filter((s) => s.tier !== 'rare'), (s) => TIER_WEIGHT[s.tier]);
    if (used.has(sp.id)) continue;
    used.add(sp.id);
    starters.push(speciesGenome(sp, rng.fork(`s${starters.length}`)));
  }
  return {
    seed: String(seed), floor: 1, phase: 'starter', party: [], box: [], starters, altar: false, encounter: null,
    nextId: 1, stats: { battles: 0, captures: 0, fusions: 0, bosses: 0 }, lastReport: null,
  };
}

export function chooseStarter(run, index) {
  const g = run.starters[index];
  if (!g) throw new Error('No such starter.');
  run.party = [makeMember(g, ARENA.starterLevel, nextUid(run))];
  run.starters = null;
  run.phase = 'floor';
  run.encounter = encounterFor(run, run.floor);
  return run;
}

function wildGenome(rng, floor) {
  const sp = rng.weighted(SPECIES, (s) => (s.tier === 'rare' ? Math.min(0.9, 0.2 + floor * 0.02) : s.tier === 'uncommon' ? Math.min(1, 0.55 + floor * 0.01) : 1));
  return speciesGenome(sp, rng.fork(`w${sp.id}`));
}

function wildOrFusion(rng, floor) {
  const fusionChance = floor >= ARENA.wildFusionFrom ? Math.min(0.35, (floor - ARENA.wildFusionFrom + 1) * 0.04) : 0;
  const a = wildGenome(rng.fork('a'), floor);
  if (!rng.chance(fusionChance)) return a;
  const b = wildGenome(rng.fork('b'), floor);
  return fuse(a, b, rng.fork('fuse')).child;
}

/** The encounter waiting on a floor. Deterministic per run seed and floor. */
export function encounterFor(run, floor) {
  const rng = makeRng(`${run.seed}:floor:${floor}`);
  const L = floorLevel(floor);
  const cap = (x) => Math.max(2, Math.min(ARENA.maxLevel, x));
  if (floor % ARENA.bossEvery === 0) {
    const count = Math.min(ARENA.partyMax, 2 + Math.floor(floor / ARENA.bossEvery));
    const a = wildGenome(rng.fork('b1'), floor), b = wildGenome(rng.fork('b2'), floor), c = wildGenome(rng.fork('b3'), floor);
    const leader = fuse(fuse(a, b, rng.fork('f1')).child, c, rng.fork('f2')).child;
    const foes = [{ genome: leader, level: cap(L + 3) }];
    for (let i = 1; i < count; i++) foes.push({ genome: wildOrFusion(rng.fork(`m${i}`), floor), level: cap(L + 1) });
    return { kind: 'boss', name: `Warden ${rng.pick(WARDEN_NAMES)}`, foes, capturable: false };
  }
  if (floor % ARENA.trainerEvery === 0) {
    const count = Math.min(ARENA.partyMax, 1 + Math.floor(floor / ARENA.trainerEvery));
    const foes = [];
    for (let i = 0; i < count; i++) foes.push({ genome: wildOrFusion(rng.fork(`t${i}`), floor), level: cap(L - rng.int(2)) });
    return { kind: 'trainer', name: rng.pick(TRAINER_NAMES), foes, capturable: false };
  }
  const g = wildOrFusion(rng.fork('wild'), floor);
  return { kind: 'wild', name: `Wild ${g.name}`, foes: [{ genome: g, level: cap(L + rng.between(-1, 1)) }], capturable: true };
}

/** Build the engine state for the current floor. Rotates a fainted lead out of the first slot. */
export function buildBattle(run) {
  const enc = run.encounter;
  if (!enc) throw new Error('No encounter on this floor.');
  if (run.party[0].hp <= 0) {
    const k = run.party.findIndex((m) => m.hp > 0);
    if (k < 0) throw new Error('Nobody in the party can fight.');
    run.party.unshift(...run.party.splice(k, 1));
  }
  const mine = run.party.map((m) => {
    const b = makeBattler(m.genome, m.level);
    b.hp = Math.max(0, Math.min(m.hp, b.maxHp));
    b.status = m.status;
    b.fainted = b.hp <= 0;
    return b;
  });
  const foes = enc.foes.map((f) => makeBattler(f.genome, f.level));
  return createBattle({
    sides: [{ name: 'You', party: mine }, { name: enc.name, ai: true, party: foes }],
    seed: `${run.seed}:battle:${run.floor}`,
    capturable: enc.capturable,
  });
}

export function gainXp(m, xp) {
  const from = m.level;
  m.xp += xp;
  while (m.level < ARENA.maxLevel && m.xp >= xpForLevel(m.level + 1)) {
    const oldMax = memberMaxHp(m);
    m.level++;
    if (m.hp > 0) m.hp += memberMaxHp(m) - oldMax;
  }
  return { from, to: m.level };
}

export function healParty(run, fraction, full) {
  for (const m of [...run.party, ...run.box]) {
    const max = memberMaxHp(m);
    if (full) { m.hp = max; m.status = null; continue; }
    m.hp = Math.min(max, m.hp + Math.round(max * fraction));
    if (m.status === 'slp' || m.status === 'frz') m.status = null;
  }
  return run;
}

/** Fold a finished battle back into the run. Returns { run, report }. */
export function applyBattle(run, state) {
  const enc = run.encounter;
  const mine = state.sides[0].party;
  const foes = state.sides[1].party;
  run.party.forEach((m, i) => { const b = mine[i]; if (b) { m.hp = b.hp; m.status = b.status; } });
  const won = state.winner === 0;
  const capturedBattler = state.captured ? foes.find((f) => f.uid === state.captured) : null;
  let xp = 0;
  for (const f of foes) if (f.fainted || (capturedBattler && f.uid === capturedBattler.uid)) xp += xpReward(f.level, f.genome.bst, enc.kind);
  run.stats.battles++;
  const report = { won, kind: enc.kind, foe: enc.name, xp: 0, levelUps: [], captured: null, floor: run.floor };
  if (!won) { run.phase = 'gameover'; run.lastReport = report; return { run, report }; }
  report.xp = xp;
  for (const m of run.party) {
    const r = gainXp(m, xp);
    if (r.to > r.from) report.levelUps.push({ name: m.genome.name, from: r.from, to: r.to });
  }
  if (capturedBattler) {
    const nm = makeMember(capturedBattler.genome, capturedBattler.level, nextUid(run));
    nm.hp = Math.max(1, capturedBattler.hp);
    nm.status = capturedBattler.status;
    (run.party.length < ARENA.partyMax ? run.party : run.box).push(nm);
    run.stats.captures++;
    report.captured = nm;
    report.toBox = !run.party.includes(nm);
  }
  if (enc.kind === 'boss') { run.stats.bosses++; run.altar = true; }
  run.floor++;
  run.encounter = encounterFor(run, run.floor);
  healParty(run, ARENA.healBetweenFloors, false);
  run.phase = 'floor';
  run.lastReport = report;
  return { run, report };
}

function findMember(run, uid) { return [...run.party, ...run.box].find((m) => m.uid === uid) || null; }

export function altarSeed(run, uidA, uidB) { return `${run.seed}:altar:${run.floor}:${uidA}:${uidB}`; }

/** Preview the altar child without changing the run. */
export function previewFusion(run, uidA, uidB) {
  const a = findMember(run, uidA), b = findMember(run, uidB);
  if (!a || !b || a === b) return null;
  return fuse(a.genome, b.genome, makeRng(altarSeed(run, uidA, uidB))).child;
}

/** Fuse two members at the altar. Both are consumed; the child takes the higher level and full HP. */
export function fuseMembers(run, uidA, uidB) {
  const a = findMember(run, uidA), b = findMember(run, uidB);
  if (!a || !b || a === b) throw new Error('Pick two different creatures.');
  const child = previewFusion(run, uidA, uidB);
  const member = makeMember(child, Math.max(a.level, b.level), nextUid(run));
  run.party = run.party.filter((m) => m !== a && m !== b);
  run.box = run.box.filter((m) => m !== a && m !== b);
  (run.party.length < ARENA.partyMax ? run.party : run.box).push(member);
  run.stats.fusions++;
  run.altar = false;
  healParty(run, 1, true);
  return { run, child: member };
}

export function skipAltar(run) { run.altar = false; healParty(run, 1, true); return run; }

export function moveMember(run, uid, to) {
  const m = findMember(run, uid);
  if (!m) return run;
  if (to === 'box') {
    if (run.party.length <= 1 || !run.party.includes(m)) return run;
    run.party = run.party.filter((x) => x !== m); run.box.push(m);
  } else {
    if (run.party.length >= ARENA.partyMax || !run.box.includes(m)) return run;
    run.box = run.box.filter((x) => x !== m); run.party.push(m);
  }
  return run;
}

export function setLead(run, uid) {
  const i = run.party.findIndex((m) => m.uid === uid);
  if (i > 0) run.party.unshift(...run.party.splice(i, 1));
  return run;
}

export function canFight(run) { return run.party.some((m) => m.hp > 0); }
