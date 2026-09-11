// The journey: the player's state in the overworld and the rules that move it. Pure game
// logic over a plain `journey` object (party, box, position, badges, beaten trainers, the
// pending encounter); the UI calls these and persists the result. Members, XP and healing
// are the shared party helpers in party.js.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES, TIER_WEIGHT } from '../data/species.js';
import { speciesGenome } from '../creature/genome.js';
import { fuse, canFuse } from '../creature/fusion.js';
import { createBattle, makeBattler } from '../battle/engine.js';
import { PARTY, XP, makeMember, gainXp, healParty, xpProgress, xpReward, memberMaxHp, canFight } from './party.js';
import { WORLD, TILE, REGIONS, BIOME_ORDER, worldFor, tileAt, biomeAt, trainerAt, isWalkable, inBounds, wildSpawn, levelAt } from './world.js';
import { goldReward, battleItems, syncBagFromBattle } from './market.js';

export const JOURNEY = { starterLevel: PARTY.starterLevel, maxLevel: PARTY.maxLevel, partyMax: PARTY.max, gauntletHeal: 0.35, badgesForSpire: BIOME_ORDER.length, councilFights: 4 };
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function nextJourneyUid(j) { return `j${j.nextId++}`; }

export function newJourney(seed) {
  const rng = makeRng(`${seed}:starters`);
  const starters = [], used = new Set();
  let guard = 0;
  while (starters.length < 3 && guard++ < 50) {
    const sp = rng.weighted(WILD_SPECIES.filter((s) => s.tier !== 'rare'), (s) => TIER_WEIGHT[s.tier]);
    if (used.has(sp.id)) continue;
    used.add(sp.id);
    starters.push(speciesGenome(sp, rng.fork(`s${starters.length}`)));
  }
  const world = worldFor(seed);
  return {
    seed: String(seed), phase: 'starter', starters, party: [], box: [], nextId: 1, pendingLearns: [],
    stats: { steps: 0, battles: 0, captures: 0, fusions: 0, trainers: 0, bosses: 0, wipes: 0 },
    player: { x: world.start.x, y: world.start.y, dir: 'down' },
    badges: [], beaten: {}, camps: [], lastCamp: { x: world.hubCamp.x, y: world.hubCamp.y }, cooldown: 0,
    gold: 0, bag: {},
    gauntlet: null, champion: false, encounter: null, lastReport: null,
  };
}

export function chooseJourneyStarter(j, index) {
  const g = j.starters && j.starters[index];
  if (!g) throw new Error('No such starter.');
  j.party = [makeMember(g, JOURNEY.starterLevel, nextJourneyUid(j))];
  j.starters = null;
  j.phase = 'roam';
  return j;
}

/** The region the player stands in and its wild level. */
export function journeyPlace(j) {
  const world = worldFor(j.seed);
  const { x, y } = j.player;
  const dx = x - world.hub.x, dy = y - world.hub.y;
  if (dx * dx + dy * dy <= WORLD.hubR * WORLD.hubR) return { id: 'hub', name: 'Crossroads', level: null, clade: null };
  const b = biomeAt(world, x, y);
  return { id: b.id, name: b.name, level: levelAt(world, x, y), areaLevel: b.level, clade: b.clade };
}

/**
 * Take one step. Always turns the player; moves when the tile is free. Returns
 * { moved, blocked?: 'wall'|'trainer', trainer?, event? } where event is one of
 * camp (healed), lair (a Warden's door), spire (the Council), shrine (fusion), market
 * (the shop), storage (the box) or encounter (a wild creature is waiting in j.encounter).
 */
export function tryMove(j, dir) {
  const world = worldFor(j.seed);
  const d = DIRS[dir];
  if (!d || j.phase === 'starter') return { moved: false, blocked: 'wall' };
  j.player.dir = dir;
  if (j.encounter) return { moved: false, blocked: 'encounter' };
  const nx = j.player.x + d[0], ny = j.player.y + d[1];
  const t = trainerAt(world, nx, ny);
  if (t) return { moved: false, blocked: 'trainer', trainer: t };
  if (!isWalkable(world, nx, ny)) return { moved: false, blocked: 'wall' };
  j.player.x = nx; j.player.y = ny;
  j.stats.steps++;
  if (j.cooldown > 0) j.cooldown--;
  const tile = tileAt(world, nx, ny);
  if (tile === TILE.camp) {
    healParty(j, 1, true);
    j.lastCamp = { x: nx, y: ny };
    const place = journeyPlace(j);
    if (place.id !== 'hub' && !j.camps.includes(place.id)) j.camps.push(place.id);
    return { moved: true, event: { kind: 'camp', place } };
  }
  if (tile === TILE.door) {
    const b = biomeAt(world, nx, ny);
    return { moved: true, event: { kind: 'lair', biome: b.id, warden: world.wardens[b.clade], owned: j.badges.includes(b.id) } };
  }
  if (tile === TILE.spireDoor) return { moved: true, event: { kind: 'spire', open: j.badges.length >= JOURNEY.badgesForSpire, champion: j.champion } };
  if (tile === TILE.shrine) return { moved: true, event: { kind: 'shrine' } };
  if (tile === TILE.marketDoor) return { moved: true, event: { kind: 'market' } };
  if (tile === TILE.storageDoor) return { moved: true, event: { kind: 'storage' } };
  if (tile === TILE.habitat && j.cooldown <= 0) {
    const rng = makeRng(`${j.seed}:step:${j.stats.steps}`);
    if (rng.chance(WORLD.encounterChance)) {
      const spawn = wildSpawn(world, nx, ny, rng.fork('spawn'));
      const name = `${spawn.alpha ? 'Alpha ' : 'Wild '}${spawn.genome.name}`;
      j.encounter = { kind: 'wild', name, foes: [{ genome: spawn.genome, level: spawn.level }], capturable: true, biome: spawn.biome, alpha: spawn.alpha, elemental: spawn.elemental, type: spawn.type };
      return { moved: true, event: { kind: 'encounter', encounter: j.encounter } };
    }
  }
  return { moved: true };
}

/** The tile in front of the player and whoever stands on it. */
export function facing(j) {
  const world = worldFor(j.seed);
  const d = DIRS[j.player.dir] || DIRS.down;
  const x = j.player.x + d[0], y = j.player.y + d[1];
  return { x, y, tile: tileAt(world, x, y), trainer: trainerAt(world, x, y) };
}

export function trainerById(j, id) { return worldFor(j.seed).trainers.find((t) => t.id === id) || null; }

/** What a trainer says when spoken to, and whether they will fight. */
export function talkTo(j, trainerId) {
  const t = trainerById(j, trainerId);
  if (!t) return null;
  const beaten = Boolean(j.beaten[t.id]);
  return { trainer: t, beaten, text: beaten ? t.after : t.line, canFight: !beaten && !j.encounter && canFight(j) };
}

export function acceptChallenge(j, trainerId) {
  const t = trainerById(j, trainerId);
  if (!t || j.beaten[t.id] || j.encounter) return null;
  j.encounter = { kind: 'trainer', trainerId: t.id, name: t.name, foes: t.team.map((m) => ({ genome: m.genome, level: m.level })), capturable: false, biome: t.biome };
  return j.encounter;
}

export function challengeWarden(j, biomeId) {
  const world = worldFor(j.seed);
  const wd = world.wardens[biomeId];
  if (!wd || j.encounter) return null;
  j.encounter = { kind: 'boss', wardenId: wd.id, name: wd.name, foes: wd.team.map((m) => ({ genome: m.genome, level: m.level })), capturable: false, biome: biomeId, badge: wd.badge };
  return j.encounter;
}

function councilEncounter(j, stage) {
  const c = worldFor(j.seed).council[stage];
  return { kind: 'council', stage, name: c.name, foes: c.team.map((m) => ({ genome: m.genome, level: m.level })), capturable: false, biome: 'hub', line: c.line };
}

/** Enter the Council Spire: seven badges open four fights in a row. */
export function enterSpire(j) {
  if (j.badges.length < JOURNEY.badgesForSpire) return { ok: false, reason: `The doors need ${JOURNEY.badgesForSpire} badges. You hold ${j.badges.length}.` };
  if (j.encounter) return { ok: false, reason: 'Finish the fight in front of you first.' };
  if (!canFight(j)) return { ok: false, reason: 'Nobody in your party can fight.' };
  j.gauntlet = { stage: 0 };
  j.encounter = councilEncounter(j, 0);
  return { ok: true, encounter: j.encounter };
}

/** Walk away from a wild creature or an unstarted fight. A fight state, when given, keeps what it did to the party and the bag. */
export function fleeEncounter(j, state) {
  if (state && state.sides) {
    j.party.forEach((m, i) => { const b = state.sides[0].party[i]; if (b) { m.hp = Math.max(1, b.hp); m.status = b.status; } });
    syncBagFromBattle(j, state);
  }
  if (j.encounter && j.encounter.kind === 'council') { j.gauntlet = null; }
  j.encounter = null;
  j.cooldown = WORLD.encounterCooldown;
  return j;
}

/** Build the engine state for the pending encounter. Rotates a fainted lead out of the first slot. */
export function buildJourneyBattle(j) {
  const enc = j.encounter;
  if (!enc) throw new Error('Nothing to fight.');
  if (j.party[0].hp <= 0) {
    const k = j.party.findIndex((m) => m.hp > 0);
    if (k < 0) throw new Error('Nobody in the party can fight.');
    j.party.unshift(...j.party.splice(k, 1));
  }
  const mine = j.party.map((m) => {
    const b = makeBattler(m.genome, m.level, { moves: m.moves, xp: xpProgress(m) });
    b.hp = Math.max(0, Math.min(m.hp, b.maxHp));
    b.status = m.status;
    b.fainted = b.hp <= 0;
    return b;
  });
  const foes = enc.foes.map((f) => makeBattler(f.genome, f.level));
  return createBattle({
    sides: [{ name: 'You', party: mine }, { name: enc.name, ai: true, party: foes }],
    seed: `${j.seed}:battle:${j.stats.battles}:${enc.kind}`,
    capturable: enc.capturable,
    items: battleItems(j),
  });
}

/** Everyone back to the last camp at full health. */
export function respawnJourney(j) {
  j.player.x = j.lastCamp.x; j.player.y = j.lastCamp.y; j.player.dir = 'down';
  healParty(j, 1, true);
  j.encounter = null;
  j.gauntlet = null;
  j.cooldown = WORLD.encounterCooldown;
  return j;
}

/** Fold a finished battle back into the journey. Returns { journey, report }. */
export function applyJourneyBattle(j, state) {
  const enc = j.encounter;
  if (!enc) throw new Error('No encounter to resolve.');
  const mine = state.sides[0].party, foes = state.sides[1].party;
  j.party.forEach((m, i) => { const b = mine[i]; if (b) { m.hp = b.hp; m.status = b.status; } });
  syncBagFromBattle(j, state);
  const capturedBattler = state.captured ? foes.find((f) => f.uid === state.captured) : null;
  const won = state.winner === 0 || Boolean(capturedBattler);
  j.stats.battles++;
  const report = { won, kind: enc.kind, foe: enc.name, xp: 0, gold: 0, xpGains: [], levelUps: [], learned: [], captured: null, toBox: false, badge: null, champion: false, nextStage: null, wiped: false, alpha: Boolean(enc.alpha) };
  if (!won) {
    if (!canFight(j)) { report.wiped = true; j.stats.wipes++; respawnJourney(j); }
    else { j.encounter = null; j.gauntlet = null; j.cooldown = WORLD.encounterCooldown; }
    j.lastReport = report;
    return { journey: j, report };
  }
  let xp = 0;
  for (const f of foes) if (f.fainted || (capturedBattler && f.uid === capturedBattler.uid)) xp += xpReward(f.level, f.genome.bst, enc.kind === 'boss' || enc.kind === 'council' || enc.alpha ? 'boss' : 'wild');
  // Red's rule: the experience is shared equally by the party members that fought and are still standing;
  // the rest of the party, if still standing, is granted half of a fighter's share
  let took = j.party.map((m, i) => i).filter((i) => mine[i] && mine[i].fought && j.party[i].hp > 0);
  if (!took.length) took = j.party.map((m, i) => i).filter((i) => mine[i] && mine[i].fought);
  if (!took.length) took = [0];
  const share = Math.max(1, Math.floor(xp / took.length));
  const benchShare = Math.floor(share * XP.benchShare);
  report.xp = share; report.shared = took.length; report.benchXp = benchShare; report.bench = 0;
  j.pendingLearns = j.pendingLearns || [];
  j.party.forEach((m, index) => {
    const bench = !took.includes(index);
    if (bench && (m.hp <= 0 || benchShare <= 0)) return;
    if (bench) report.bench++;
    const before = xpProgress(m);
    const r = gainXp(m, bench ? benchShare : share);
    const after = xpProgress(m);
    report.xpGains.push({ uid: m.uid, index, bench, from: { level: r.from, frac: before.frac }, to: { level: r.to, frac: after.frac }, after });
    if (r.to > r.from) report.levelUps.push({ name: m.genome.name, from: r.from, to: r.to });
    for (const id of r.learned) report.learned.push({ name: m.genome.name, move: id });
    for (const id of r.pending) j.pendingLearns.push({ uid: m.uid, moveId: id });
  });
  if (capturedBattler) {
    const nm = makeMember(capturedBattler.genome, capturedBattler.level, nextJourneyUid(j));
    nm.hp = Math.max(1, capturedBattler.hp);
    nm.status = capturedBattler.status;
    (j.party.length < JOURNEY.partyMax ? j.party : j.box).push(nm);
    j.stats.captures++;
    report.captured = nm;
    report.toBox = !j.party.includes(nm);
  }
  // trainers pay gold: by team size and average level, double for Wardens and the Council, a quarter on rematches
  if (enc.kind !== 'wild') {
    const rematch = enc.kind === 'boss' ? j.badges.includes(enc.biome) : enc.kind === 'council' ? j.champion : false;
    report.gold = goldReward(enc.foes, enc.kind, rematch);
    j.gold = (j.gold || 0) + report.gold;
  }
  if (enc.kind === 'trainer') { j.beaten[enc.trainerId] = true; j.stats.trainers++; }
  if (enc.kind === 'boss') { j.stats.bosses++; if (!j.badges.includes(enc.biome)) { j.badges.push(enc.biome); report.badge = enc.badge; } }
  j.encounter = null;
  j.cooldown = WORLD.encounterCooldown;
  if (enc.kind === 'council') {
    const stage = (j.gauntlet ? j.gauntlet.stage : enc.stage) + 1;
    if (stage >= JOURNEY.councilFights) { j.gauntlet = null; j.champion = true; j.phase = 'champion'; report.champion = true; }
    else { j.gauntlet = { stage }; healParty(j, JOURNEY.gauntletHeal, false); j.encounter = councilEncounter(j, stage); report.nextStage = stage; }
  }
  j.lastReport = report;
  return { journey: j, report };
}

// ---- the shrine: fusion at the crossroads ----------------------------------------------

function memberOf(j, uid) { return [...j.party, ...j.box].find((m) => m.uid === uid) || null; }

export function canFuseJourney(j, uidA, uidB) {
  const a = memberOf(j, uidA), b = memberOf(j, uidB);
  if (!a || !b) return { ok: false, reason: 'Pick two creatures.' };
  if (a === b) return { ok: false, reason: 'Pick two different creatures.' };
  if (a.locked || b.locked) return { ok: false, reason: `${(a.locked ? a : b).genome.name} is locked. Unlock it first.` };
  return canFuse(a.genome, b.genome);
}

function shrineSeed(j, uidA, uidB) { return `${j.seed}:shrine:${j.stats.fusions}:${uidA}:${uidB}`; }

export function previewShrineFusion(j, uidA, uidB) {
  const a = memberOf(j, uidA), b = memberOf(j, uidB);
  if (!a || !b || a === b || !canFuse(a.genome, b.genome).ok) return null;
  return fuse(a.genome, b.genome, makeRng(shrineSeed(j, uidA, uidB))).child;
}

/** Fuse two members at the shrine. Both are consumed; the child takes the higher level and full health. */
export function shrineFuse(j, uidA, uidB) {
  const a = memberOf(j, uidA), b = memberOf(j, uidB);
  const compat = canFuseJourney(j, uidA, uidB);
  if (!compat.ok) throw new Error(compat.reason);
  if (j.party.length + j.box.length <= 2 && j.party.includes(a) && j.party.includes(b) && j.party.length === 2 && j.box.length === 0) {
    // fusing the whole party is fine: the child is the party
  }
  const child = previewShrineFusion(j, uidA, uidB);
  const member = makeMember(child, Math.max(a.level, b.level), nextJourneyUid(j));
  j.party = j.party.filter((m) => m !== a && m !== b);
  j.box = j.box.filter((m) => m !== a && m !== b);
  (j.party.length < JOURNEY.partyMax ? j.party : j.box).push(member);
  if (!j.party.length && j.box.length) j.party.push(j.box.shift());
  j.stats.fusions++;
  return { journey: j, child: member };
}

/** Badge summary for the HUD: every biome with whether its badge is held. */
export function badgeList(j) {
  return BIOME_ORDER.map((id) => ({ id, name: REGIONS[id].badge, region: REGIONS[id].name, held: j.badges.includes(id) }));
}

/** Total party health as a fraction, for the HUD. */
export function partyHealth(j) {
  let hp = 0, max = 0;
  for (const m of j.party) { hp += Math.max(0, m.hp); max += memberMaxHp(m); }
  return max ? hp / max : 0;
}

export { inBounds };
