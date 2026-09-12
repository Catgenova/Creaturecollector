// The journey: the player's state in the overworld and the rules that move it. Pure game
// logic over a plain `journey` object (party, box, position, badges, beaten trainers, the
// pending encounter); the UI calls these and persists the result. Members, XP and healing
// are the shared party helpers in party.js.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES, TIER_WEIGHT } from '../data/species.js';
import { speciesGenome } from '../creature/genome.js';
import { MORPHS } from '../creature/palette.js';
import { fuse, canFuse } from '../creature/fusion.js';
import { createBattle, makeBattler } from '../battle/engine.js';
import { PARTY, XP, makeMember, gainXp, healParty, xpProgress, xpReward, memberMaxHp, canFight } from './party.js';
import { WORLD, TILE, REGIONS, BIOME_ORDER, worldFor, tileAt, biomeAt, trainerAt, isWalkable, inBounds, wildSpawn, levelAt } from './world.js';
import { goldReward, battleItems, syncBagFromBattle, returnCharms } from './market.js';
import { getCharm, heldKind, charmValue, CHARM_RULE, WARDEN_CHARMS } from '../data/charms.js';
import { NATURE_IDS } from '../data/natures.js';
import { TRIAL, trialDay, trialOf, trialState, trialBlock, enterTrial, trialEncounter, trialGold } from './trial.js';
import { abilityWorldMul } from '../data/abilities.js';
import { BIOME_WEATHER, BIOME_TERRAIN } from '../data/field.js';
import { titanOf, titanWaiting } from './titan.js';
import { BOND_TIERS, bondOfMember, bondAfterBattle } from './bond.js';
import { recordTowerWin, towerRecord } from './tower.js';
import { newBoard, ensureBoard, questEvent } from './quests.js';
import { newBounties, ensureBounties } from './bounties.js';

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
    seed: String(seed), world: WORLD.version, phase: 'starter', starters, party: [], box: [], nextId: 1, pendingLearns: [],
    stats: { steps: 0, battles: 0, captures: 0, fusions: 0, trainers: 0, bosses: 0, wipes: 0, tower: 0, quests: 0, bounties: 0 },
    tower: { challenges: 0, wins: {} },
    player: { x: world.start.x, y: world.start.y, dir: 'down' },
    badges: [], beaten: {}, camps: [], lastCamp: { x: world.hubCamp.x, y: world.hubCamp.y }, cooldown: 0,
    gold: 0, bag: {}, quests: newBoard(), bounties: newBounties(),
    gauntlet: null, champion: false, encounter: null, lastReport: null, trial: null, trials: {}, elders: {}, titans: {},
  };
}

export function chooseJourneyStarter(j, index) {
  const g = j.starters && j.starters[index];
  if (!g) throw new Error('No such starter.');
  j.party = [makeMember(g, JOURNEY.starterLevel, nextJourneyUid(j))];
  j.starters = null;
  j.phase = 'roam';
  ensureBoard(j); // the first three notices go up once there is a party to send
  ensureBounties(j);
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
 * (the shop), storage (the box), tower (the Battle Tower) or encounter (a wild creature is waiting in j.encounter).
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
    const quests = place.id !== 'hub' ? questEvent(j, { kind: 'camp', biome: place.id }) : [];
    return { moved: true, event: { kind: 'camp', place, quests } };
  }
  if (tile === TILE.door) {
    const b = biomeAt(world, nx, ny);
    return { moved: true, event: { kind: 'lair', biome: b.id, warden: world.wardens[b.clade], owned: j.badges.includes(b.id), elder: elderWaiting(j, b.id), titan: titanWaiting(j, b.id) } };
  }
  if (tile === TILE.spireDoor) return { moved: true, event: { kind: 'spire', open: j.badges.length >= JOURNEY.badgesForSpire, champion: j.champion } };
  if (tile === TILE.shrine) return { moved: true, event: { kind: 'shrine' } };
  if (tile === TILE.marketDoor) return { moved: true, event: { kind: 'market' } };
  if (tile === TILE.storageDoor) return { moved: true, event: { kind: 'storage' } };
  if (tile === TILE.towerDoor) return { moved: true, event: { kind: 'tower' } };
  if (tile === TILE.bountyDoor) return { moved: true, event: { kind: 'bounty' } };
  if (tile === TILE.rookeryDoor) return { moved: true, event: { kind: 'rookery' } };
  if (tileAt(world, nx + DIRS[dir][0], ny + DIRS[dir][1]) === TILE.board) return { moved: true, event: { kind: 'board' } };
  if (tile === TILE.habitat && j.cooldown <= 0) {
    const rng = makeRng(`${j.seed}:step:${j.stats.steps}`);
    const leadHeld = heldKind(j.party[0] && j.party[0].held); // the lead's charm shapes the road: a Lure draws creatures out, a Prism draws out Elementals
    const leadCharm = j.party[0] && j.party[0].held;
    if (rng.chance(Math.min(1, WORLD.encounterChance * (leadHeld === 'lure' ? charmValue(leadCharm, 'lureMul') : 1)))) {
      const spawn = wildSpawn(world, nx, ny, rng.fork('spawn'), { elementalMul: leadHeld === 'prism' ? charmValue(leadCharm, 'prismMul') : 1 });
      const name = `${spawn.alpha ? 'Alpha ' : 'Wild '}${spawn.genome.morph ? `${MORPHS[spawn.genome.morph].name} ` : ''}${spawn.genome.name}`;
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

/** The level a beaten trainer brings to a rematch: their own, lifted towards your best creature. */
export function rematchLevel(j, base) {
  const top = Math.max(1, ...(j.party || []).map((m) => m.level), ...(j.box || []).map((m) => m.level));
  return Math.max(base, Math.min(100, top - 2));
}

/** A beaten trainer's team, brought up to meet the party it lost to. */
export function rematchTeam(j, t) {
  return t.team.map((m, i) => ({ genome: m.genome, level: rematchLevel(j, m.level) - (i % 2) }));
}

/** What a trainer says when spoken to, and whether they will fight. A beaten one offers a rematch. */
export function talkTo(j, trainerId) {
  const t = trainerById(j, trainerId);
  if (!t) return null;
  const beaten = Boolean(j.beaten[t.id]);
  const ready = !j.encounter && canFight(j);
  const rematch = beaten && rematchLevel(j, t.team[0].level) > t.team[0].level;
  const text = beaten ? (rematch ? `${t.after} ${t.rematchLine || 'Care to go again?'}` : t.after) : t.line;
  return { trainer: t, beaten, rematch, text, canFight: ready && (!beaten || rematch) };
}

export function acceptChallenge(j, trainerId) {
  const t = trainerById(j, trainerId);
  if (!t || j.encounter) return null;
  const beaten = Boolean(j.beaten[t.id]);
  const foes = beaten ? rematchTeam(j, t) : t.team.map((m) => ({ genome: m.genome, level: m.level }));
  if (beaten && foes[0].level <= t.team[0].level) return null; // nothing new to prove until you have grown
  j.encounter = { kind: 'trainer', trainerId: t.id, name: t.name, foes, capturable: false, biome: t.biome, rematch: beaten };
  return j.encounter;
}

/** The Elders: one ancient creature per region, awake only for a champion, and only once each. */
export const ELDER = { level: 78 };

/** The Elder of a region: the rarest thing that lives there, grown old. Deterministic per journey. */
export function elderOf(j, biomeId) {
  const world = worldFor(j.seed);
  const biome = world.biomes.find((b) => b.id === biomeId);
  if (!biome) return null;
  const pool = WILD_SPECIES.filter((sp) => sp.clade === biome.clade);
  const rares = pool.filter((sp) => sp.tier === 'rare');
  const rng = makeRng(`${j.seed}:elder:${biomeId}`);
  const sp = rng.pick(rares.length ? rares : pool);
  const genome = speciesGenome(sp, rng.fork('g'));
  return { biomeId, clade: biome.clade, genome, level: ELDER.level };
}

/** Whether this region's Elder is still out there for this journey. */
export function elderWaiting(j, biomeId) {
  return Boolean(j.champion && (j.badges || []).includes(biomeId) && !(j.elders || {})[biomeId]);
}

/** Seek the Elder of a region: one creature, high level, and catchable. */
export function seekElder(j, biomeId) {
  if (j.encounter || !elderWaiting(j, biomeId)) return null;
  if (!canFight(j)) return null;
  const elder = elderOf(j, biomeId);
  if (!elder) return null;
  j.encounter = {
    kind: 'elder', biome: biomeId, name: `Elder ${elder.genome.name}`, elderOf: biomeId,
    foes: [{ genome: elder.genome, level: elder.level }], capturable: true, alpha: true,
  };
  return j.encounter;
}

/** Face a region's Titan: two creatures, the second of them enormous, on the ground it grew out of. */
export function challengeTitan(j, biomeId) {
  if (j.encounter || !titanWaiting(j, biomeId) || !canFight(j)) return null;
  const t = titanOf(j, biomeId);
  if (!t) return null;
  j.encounter = {
    kind: 'titan', biome: biomeId, titanOf: biomeId, name: `${t.entry.name}, ${t.entry.title}`,
    foes: t.foes, capturable: false, alpha: true, field: t.field, prize: t.prize, line: t.entry.line,
  };
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

/** Enter the Council Spire: every badge opens four fights in a row. */
/** Today's Trial, what it asks, and whether this party may walk into it. */
export function trialToday(j, now = new Date()) {
  const day = trialDay(now);
  const trial = trialOf(day);
  const state = trialState(j, day);
  const block = j.champion ? trialBlock(j, trial) : 'The Trial opens to champions.';
  return { trial, state, block, canEnter: !block && !state.cleared && !j.encounter };
}

export function startTrial(j, now = new Date()) { return enterTrial(j, trialDay(now)); }

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

/** How often a fight in the open starts under the region's own sky or on its own ground. */
export const FIELD_CHANCE = 0.35;
/**
 * The field a fight opens on. Outdoors the region argues first: the Ember Scar is bright, the Fen is wet,
 * the Warren is all grit. Indoor fights — the Tower, the Trial, a Warden's hall — start on a clear field.
 */
export function openingField(j, kind) {
  if (kind !== 'wild' && kind !== 'trainer') return null;
  const biome = biomeAt(worldFor(j.seed), j.player.x, j.player.y);
  const rng = makeRng(`${j.seed}:field:${j.stats.battles}:${j.player.x},${j.player.y}`);
  const out = {};
  const w = BIOME_WEATHER[biome.id], t = BIOME_TERRAIN[biome.id];
  if (w && rng.chance(FIELD_CHANCE)) out.weather = w;
  if (t && rng.chance(FIELD_CHANCE)) out.terrain = t;
  return Object.keys(out).length ? out : null;
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
    const b = makeBattler(m.genome, m.level, { moves: m.moves, xp: xpProgress(m), held: m.held, bond: bondOfMember(m).tier });
    b.hp = Math.max(0, Math.min(m.hp, b.maxHp));
    b.status = m.status;
    b.fainted = b.hp <= 0;
    return b;
  });
  const foes = enc.foes.map((f) => makeBattler(f.genome, f.level, { moves: f.moves, ability: f.ability, ability2: f.ability2, held: f.held }));
  return createBattle({
    sides: [{ name: 'You', party: mine }, { name: enc.name, ai: true, party: foes }],
    seed: `${j.seed}:battle:${j.stats.battles}:${enc.kind}`,
    capturable: enc.capturable,
    items: battleItems(j),
    field: enc.field || openingField(j, enc.kind),
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
  const report = { won, kind: enc.kind, foe: enc.name, xp: 0, gold: 0, xpGains: [], levelUps: [], learned: [], captured: null, toBox: false, badge: null, charm: null, quests: [], champion: false, nextStage: null, wiped: false, alpha: Boolean(enc.alpha), bond: [] };
  if (!won) {
    if (!canFight(j)) { report.wiped = true; j.stats.wipes++; respawnJourney(j); }
    else { j.encounter = null; j.gauntlet = null; j.cooldown = WORLD.encounterCooldown; }
    j.lastReport = report;
    return { journey: j, report };
  }
  let xp = 0;
  for (const f of foes) if (f.fainted || (capturedBattler && f.uid === capturedBattler.uid)) xp += xpReward(f.level, f.genome.bst, enc.kind === 'boss' || enc.kind === 'council' || enc.kind === 'tower' || enc.kind === 'trial' || enc.kind === 'elder' || enc.kind === 'titan' || enc.alpha ? 'boss' : 'wild');
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
    const scholar = heldKind(m.held) === 'xp' ? charmValue(m.held, 'xpMul') : 1; // a Scholar's Charm lifts its holder's own share
    const studious = abilityWorldMul(m.genome && m.genome.ability, 'worldXp'); // and so does a studious passive
    const r = gainXp(m, Math.floor((bench ? benchShare : share) * scholar * studious));
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
  // (a tower floor counts as beaten per level, so its first win at each level pays in full)
  if (enc.kind !== 'wild') {
    const rematch = enc.kind === 'boss' ? j.badges.includes(enc.biome) : enc.kind === 'council' ? j.champion : enc.kind === 'tower' ? towerRecord(j, enc.floor, enc.level) > 0 : Boolean(enc.rematch);
    report.gold = goldReward(enc.foes, enc.kind, rematch);
    const coin = j.party.find((m) => heldKind(m.held) === 'gold'); // a Lucky Coin anywhere in the party
    if (coin) report.gold = Math.round((report.gold * charmValue(coin.held, 'goldMul')) / 10) * 10;
    const forager = Math.max(...j.party.map((m) => abilityWorldMul(m.genome && m.genome.ability, 'worldGold'))); // the best forager in the party sniffs out the rest
    if (forager > 1) report.gold = Math.round((report.gold * forager) / 10) * 10;
    j.gold = (j.gold || 0) + report.gold;
  }
  if (enc.kind === 'trainer') {
    if (!j.beaten[enc.trainerId]) j.stats.trainers++;
    else j.stats.rematches = (j.stats.rematches || 0) + 1;
    j.beaten[enc.trainerId] = true;
  }
  if (enc.kind === 'tower') { j.stats.tower = (j.stats.tower || 0) + 1; report.tower = { floor: enc.floor, level: enc.level, wins: recordTowerWin(j, enc.towerId, enc.level) }; }
  if (enc.kind === 'trial' && won) { report.gold = trialGold(enc.stage); j.gold += report.gold; }
  if (enc.kind === 'elder' && (won || capturedBattler)) {
    j.elders = j.elders || {};
    j.elders[enc.elderOf] = true;
    j.stats.elders = (j.stats.elders || 0) + 1;
    report.elder = enc.elderOf;
  }
  if (enc.kind === 'titan') {
    j.titans = j.titans || {};
    j.titans[enc.titanOf] = true;
    j.stats.titans = (j.stats.titans || 0) + 1;
    if (enc.prize && getCharm(enc.prize)) { j.bag = j.bag || {}; j.bag[enc.prize] = (j.bag[enc.prize] || 0) + 1; report.charm = enc.prize; }
    report.titan = enc.titanOf;
  }
  if (enc.kind === 'boss') {
    j.stats.bosses++;
    if (!j.badges.includes(enc.biome)) {
      j.badges.push(enc.biome); report.badge = enc.badge;
      const gift = WARDEN_CHARMS[enc.biome]; // every Warden hands over a charm with their badge
      if (getCharm(gift)) { j.bag = j.bag || {}; j.bag[gift] = (j.bag[gift] || 0) + 1; report.charm = gift; }
    }
  }
  // what the fight was worth to the ones who were in it
  const BOND_BOSSES = new Set(['boss', 'council', 'titan', 'trial', 'elder']);
  report.bond = bondAfterBattle(j.party, {
    won,
    boss: BOND_BOSSES.has(enc.kind),
    fought: new Set(j.party.filter((m, i) => mine[i] && mine[i].fought).map((m) => m.uid)),
    fainted: new Set(j.party.filter((m, i) => mine[i] && mine[i].fainted).map((m) => m.uid)),
    levels: Object.fromEntries(report.xpGains.map((g) => [g.uid, Math.max(0, g.to.level - g.from.level)])),
  });

  // the notice board hears about it
  const done = [];
  if (capturedBattler) done.push(...questEvent(j, { kind: 'capture', genome: capturedBattler.genome, level: capturedBattler.level, alpha: Boolean(enc.alpha) }));
  if (enc.kind === 'wild' && !capturedBattler) for (const f of foes) if (f.fainted) done.push(...questEvent(j, { kind: 'wildwin', genome: f.genome }));
  if (enc.kind === 'trainer') done.push(...questEvent(j, { kind: 'trainer', biome: enc.biome }));
  if (enc.kind === 'boss') done.push(...questEvent(j, { kind: 'boss', biome: enc.biome }));
  if (enc.kind === 'tower') done.push(...questEvent(j, { kind: 'tower', floor: enc.floor, level: enc.level }));
  report.quests = done.map((q) => q.text);
  j.encounter = null;
  j.cooldown = WORLD.encounterCooldown;
  if (enc.kind === 'trial') {
    j.trials = j.trials || {};
    const day = enc.day, rec = j.trials[day] || { stage: 0, cleared: false, tries: 1 };
    if (!won) { j.trial = null; j.trials[day] = { ...rec, stage: 0 }; }
    else {
      const stage = enc.stage + 1;
      rec.stage = stage;
      if (stage >= TRIAL.fights) {
        rec.cleared = true; j.trial = null;
        j.stats.trials = (j.stats.trials || 0) + 1;
        report.trialCleared = day;
      } else {
        j.trial = { day, stage };
        healParty(j, JOURNEY.gauntletHeal, false);
        j.encounter = trialEncounter(trialOf(day), stage);
        report.nextStage = stage;
      }
      j.trials[day] = rec;
    }
  }
  if (enc.kind === 'council') {
    const stage = (j.gauntlet ? j.gauntlet.stage : enc.stage) + 1;
    if (stage >= JOURNEY.councilFights) { j.gauntlet = null; j.champion = true; j.phase = 'champion'; report.champion = true; }
    else { j.gauntlet = { stage }; healParty(j, JOURNEY.gauntletHeal, false); j.encounter = councilEncounter(j, stage); report.nextStage = stage; }
  }
  j.lastReport = report;
  return { journey: j, report };
}

// ---- the shrine: fusion, and turning over a nature -------------------------------------

/** What the shrine asks to draw a creature a new nature: a flat sum, and it cannot be chosen. */
export const NATURE_REROLL = 8000;

/** Why the shrine will not reroll this creature's nature, or null when it will. */
export function natureBlock(m) {
  if (!m || !m.genome) return 'No creature.';
  if (NATURE_IDS.length < 2) return 'There is only one nature.';
  return null;
}

/**
 * Draw a new nature at the shrine: random, never the one it already has, and never chosen.
 * Deterministic per journey and per reroll, so a save cannot be reloaded for a better one.
 */
export function rerollNature(j, uid) {
  const m = [...(j.party || []), ...(j.box || [])].find((x) => x.uid === uid);
  if (!m) return { ok: false, reason: 'That creature is not with you.' };
  const block = natureBlock(m);
  if (block) return { ok: false, reason: block };
  if ((j.gold || 0) < NATURE_REROLL) return { ok: false, reason: `The shrine asks ${NATURE_REROLL.toLocaleString()} gold.` };
  j.stats = j.stats || {};
  j.stats.natures = (j.stats.natures || 0) + 1;
  const pool = NATURE_IDS.filter((id) => id !== m.genome.nature);
  const rng = makeRng(`${j.seed}:nature:${uid}:${j.stats.natures}`);
  const from = m.genome.nature;
  const to = pool[Math.floor(rng.next() * pool.length)];
  j.gold -= NATURE_REROLL;
  m.genome.nature = to;
  m.hp = Math.max(1, Math.min(m.hp, memberMaxHp(m)));
  return { ok: true, member: m, from, to, paid: NATURE_REROLL };
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
  returnCharms(j, [a, b]); // both parents' charms come back to the Bag
  const member = makeMember(child, Math.max(a.level, b.level), nextJourneyUid(j));
  j.party = j.party.filter((m) => m !== a && m !== b);
  j.box = j.box.filter((m) => m !== a && m !== b);
  (j.party.length < JOURNEY.partyMax ? j.party : j.box).push(member);
  if (!j.party.length && j.box.length) j.party.push(j.box.shift());
  j.stats.fusions++;
  const quests = questEvent(j, { kind: 'fusion', clade: child.clade });
  return { journey: j, child: member, quests: quests.map((q) => q.text) };
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
