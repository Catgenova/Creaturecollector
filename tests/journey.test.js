import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { step } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';
import { cladeOf } from '../src/creature/genome.js';
import { BIOME_ORDER, TILE, tileAt, worldFor, trainerAt } from '../src/game/world.js';
import { JOURNEY, DIRS, newJourney, chooseJourneyStarter, tryMove, facing, talkTo, acceptChallenge, challengeWarden, enterSpire, fleeEncounter, buildJourneyBattle, applyJourneyBattle, journeyPlace, badgeList, canFuseJourney, previewShrineFusion, shrineFuse, respawnJourney, partyHealth } from '../src/game/journey.js';
import { memberMaxHp, XP } from '../src/game/party.js';
import { emptySave, normalizeSave, exportSave, importSave, normalizeJourney } from '../src/game/save.js';
import { findPath } from '../src/game/world.js';
import { WILD_SPECIES } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeMember } from '../src/game/party.js';

function fresh(seed = 'jt') { const j = newJourney(seed); chooseJourneyStarter(j, 0); return j; }

function playOut(state, seed) {
  let guard = 0;
  while (state.phase !== 'over' && guard++ < 600) {
    const rng = makeRng(`${seed}:${state.turn}:${state.phase}`);
    ({ state } = step(state, [0, 1].map((i) => chooseAction(state, i, rng.fork(`s${i}`)))));
  }
  return state;
}

/** A finished battle state with the given winner, without playing it: enough for the bookkeeping. */
function decided(j, winner) {
  const { state } = buildJourneyBattle(j);
  const s = JSON.parse(JSON.stringify(state));
  s.phase = 'over'; s.winner = winner;
  if (winner === 0) for (const f of s.sides[1].party) { f.hp = 0; f.fainted = true; }
  else for (const m of s.sides[0].party) { m.hp = 0; m.fainted = true; }
  return s;
}

/** Walk toward a target with the BFS the UI uses, returning early on any event. */
function walkTo(j, target, max = 600) {
  const world = worldFor(j.seed);
  let path = findPath(world, j.player, target, 400);
  let n = 0;
  while (path && path.length && n++ < max) {
    const nx = path.shift();
    const dir = nx.x > j.player.x ? 'right' : nx.x < j.player.x ? 'left' : nx.y > j.player.y ? 'down' : 'up';
    const r = tryMove(j, dir);
    if (r.event) return r.event;
    if (!r.moved) return null;
  }
  return null;
}

test('a journey starts at the crossroads with three starters and a chosen companion', () => {
  const j = newJourney('start');
  assert.equal(j.phase, 'starter');
  assert.equal(new Set(j.starters.map((g) => g.species)).size, 3);
  assert.equal(tryMove(j, 'down').moved, false, 'no walking before a companion');
  chooseJourneyStarter(j, 2);
  assert.equal(j.phase, 'roam');
  assert.equal(j.party.length, 1);
  assert.equal(j.party[0].level, JOURNEY.starterLevel);
  assert.equal(journeyPlace(j).id, 'hub');
  assert.equal(badgeList(j).length, 7);
  assert.ok(badgeList(j).every((b) => !b.held));
  assert.deepEqual(newJourney('start').starters.map((g) => g.species), j.starters === null ? newJourney('start').starters.map((g) => g.species) : j.starters.map((g) => g.species));
});

test('walking respects walls and trainers, and habitat patches spring wild encounters', () => {
  const j = fresh('walk');
  const world = worldFor(j.seed);
  const start = { ...j.player };
  // find a wall next to some reachable tile by walking toward the border: eventually blocked
  let blockedWall = false, blockedTrainer = false, encounters = 0, steps = 0;
  const rng = makeRng('wander');
  for (let i = 0; i < 4000 && (!blockedWall || encounters < 3); i++) {
    const dir = rng.pick(Object.keys(DIRS));
    const r = tryMove(j, dir);
    assert.equal(j.player.dir, dir, 'always turns');
    if (r.moved) { steps++; assert.ok(tileAt(world, j.player.x, j.player.y) !== TILE.wall); }
    else if (r.blocked === 'wall') blockedWall = true;
    else if (r.blocked === 'trainer') { blockedTrainer = true; assert.ok(trainerAt(world, j.player.x + DIRS[dir][0], j.player.y + DIRS[dir][1])); }
    if (r.event && r.event.kind === 'encounter') {
      encounters++;
      const e = j.encounter;
      assert.equal(e.kind, 'wild'); assert.ok(e.capturable); assert.equal(e.foes.length, 1);
      assert.equal(tryMove(j, 'up').blocked, 'encounter', 'no walking with a creature in front of you');
      fleeEncounter(j);
      assert.equal(j.encounter, null);
    }
  }
  assert.ok(blockedWall, 'ran into a wall at some point');
  assert.ok(encounters >= 3, `encounters ${encounters} over ${steps} steps`);
  assert.equal(j.stats.steps, steps);
  assert.notDeepEqual([j.player.x, j.player.y], [start.x, start.y]);
  void blockedTrainer;
});

test('a wild fight pays xp, can capture, and a wipe sends the party back to the last camp', () => {
  const j = fresh('fight');
  const rng = makeRng('roam');
  let guard = 0;
  while (!j.encounter && guard++ < 5000) tryMove(j, rng.pick(Object.keys(DIRS)));
  assert.ok(j.encounter, 'found a wild creature');
  const foe = j.encounter.foes[0];
  const { state } = buildJourneyBattle(j);
  assert.equal(state.sides[1].party[0].level, foe.level);
  assert.ok(state.capturable);
  const before = j.party[0].xp;
  const won = decided(j, 0);
  const { report } = applyJourneyBattle(j, won);
  assert.ok(report.won && report.xp > 0 && j.party[0].xp > before);
  assert.equal(j.encounter, null);
  assert.equal(j.stats.battles, 1);
  // a capture joins the party
  guard = 0;
  while (!j.encounter && guard++ < 5000) tryMove(j, rng.pick(Object.keys(DIRS)));
  const cap = decided(j, 0);
  cap.captured = cap.sides[1].party[0].uid; cap.sides[1].party[0].hp = 3; cap.sides[1].party[0].fainted = false;
  const r2 = applyJourneyBattle(j, cap).report;
  assert.ok(r2.captured && j.party.length === 2 && j.stats.captures === 1);
  // a wipe: everyone down, back at the camp, healed
  const camp = { ...j.lastCamp };
  guard = 0;
  while (!j.encounter && guard++ < 5000) tryMove(j, rng.pick(Object.keys(DIRS)));
  const lost = decided(j, 1);
  const r3 = applyJourneyBattle(j, lost).report;
  assert.ok(!r3.won && r3.wiped);
  assert.deepEqual([j.player.x, j.player.y], [camp.x, camp.y]);
  assert.ok(j.party.every((m) => m.hp === memberMaxHp(m)));
  assert.equal(j.stats.wipes, 1);
  assert.equal(partyHealth(j), 1);
  // a real fight plays out with the AI on both sides and resolves cleanly
  guard = 0;
  while (!j.encounter && guard++ < 5000) tryMove(j, rng.pick(Object.keys(DIRS)));
  const played = playOut(buildJourneyBattle(j).state, 'ai');
  assert.equal(played.phase, 'over');
  assert.doesNotThrow(() => applyJourneyBattle(j, played));
});

test('trainers fight when asked and remember it; wardens give badges; the spire needs all seven', () => {
  const j = fresh('trainers');
  const world = worldFor(j.seed);
  const t = world.trainers[0];
  const talk = talkTo(j, t.id);
  assert.equal(talk.beaten, false); assert.equal(talk.text, t.line); assert.ok(talk.canFight);
  const enc = acceptChallenge(j, t.id);
  assert.equal(enc.kind, 'trainer'); assert.equal(enc.foes.length, t.team.length); assert.ok(!enc.capturable);
  assert.equal(acceptChallenge(j, world.trainers[1].id), null, 'one fight at a time');
  const r = applyJourneyBattle(j, decided(j, 0)).report;
  assert.ok(r.won && j.beaten[t.id] && j.stats.trainers === 1);
  assert.equal(talkTo(j, t.id).text, t.after);
  assert.equal(acceptChallenge(j, t.id), null, 'beaten trainers do not fight again');
  // wardens
  assert.equal(enterSpire(j).ok, false);
  for (const b of BIOME_ORDER) {
    const w = challengeWarden(j, b);
    assert.equal(w.kind, 'boss'); assert.equal(w.foes.length, 5);
    assert.ok(w.foes.every((f) => cladeOf(f.genome) === b));
    const rep = applyJourneyBattle(j, decided(j, 0)).report;
    assert.equal(rep.badge, world.wardens[b].badge);
    assert.ok(j.badges.includes(b));
  }
  assert.equal(j.badges.length, 7);
  assert.equal(applyJourneyBattle(Object.assign(j, { encounter: challengeWarden(j, 'mammal') }), decided(j, 0)).report.badge, null, 'a rematch gives no second badge');
  // the council: four fights back to back, a short rest between, champion at the end
  const opened = enterSpire(j);
  assert.ok(opened.ok && j.gauntlet && j.gauntlet.stage === 0 && j.encounter.kind === 'council');
  for (let stage = 0; stage < JOURNEY.councilFights; stage++) {
    assert.equal(j.encounter.stage, stage);
    assert.equal(j.encounter.foes.length, 5);
    for (const m of j.party) m.hp = Math.max(1, Math.floor(memberMaxHp(m) * 0.2));
    const rep = applyJourneyBattle(j, decided(j, 0)).report;
    if (stage < JOURNEY.councilFights - 1) {
      assert.equal(rep.nextStage, stage + 1);
      assert.ok(j.encounter && j.encounter.kind === 'council' && j.gauntlet.stage === stage + 1, 'the next fight is queued at once');
      assert.ok(j.party.every((m) => m.hp > Math.floor(memberMaxHp(m) * 0.2) && m.hp < memberMaxHp(m)), 'only a partial rest between fights');
    } else {
      assert.ok(rep.champion && j.champion && j.phase === 'champion' && !j.gauntlet && !j.encounter);
    }
  }
  // losing inside the spire ends the run and sends you back to camp
  enterSpire(j);
  applyJourneyBattle(j, decided(j, 0));
  assert.equal(j.gauntlet.stage, 1);
  applyJourneyBattle(j, decided(j, 1));
  assert.equal(j.gauntlet, null); assert.equal(j.encounter, null);
});

test('camps heal and become the respawn point; the shrine fuses same-class members', () => {
  const j = fresh('camp');
  const world = worldFor(j.seed);
  for (const m of j.party) m.hp = 1;
  const ev = walkTo(j, world.hubCamp);
  assert.ok(ev && ev.kind === 'camp', 'reached the hub camp');
  assert.ok(j.party.every((m) => m.hp === memberMaxHp(m)));
  assert.deepEqual(j.lastCamp, world.hubCamp);
  j.player.x = world.hub.x; j.player.y = world.hub.y;
  respawnJourney(j);
  assert.deepEqual([j.player.x, j.player.y], [world.hubCamp.x, world.hubCamp.y]);
  // two same-class members fuse into one at the shrine
  const a = j.party[0];
  const clade = cladeOf(a.genome);
  const sp = WILD_SPECIES.find((s) => s.clade === clade && s.id !== a.genome.species);
  j.party.push(makeMember(speciesGenome(sp, makeRng('mate')), 12, 'j99'));
  assert.ok(canFuseJourney(j, a.uid, 'j99').ok);
  const preview = previewShrineFusion(j, a.uid, 'j99');
  assert.ok(preview && preview.gen === 1);
  const { child } = shrineFuse(j, a.uid, 'j99');
  assert.equal(j.party.length, 1); assert.equal(j.party[0], child); assert.equal(child.level, 12); assert.equal(j.stats.fusions, 1);
  assert.equal(child.genome.name, preview.name);
  assert.equal(facing(j).tile, tileAt(world, j.player.x + DIRS[j.player.dir][0], j.player.y + DIRS[j.player.dir][1]));
});

test('journeys survive the save round trip and broken ones are dropped', () => {
  const j = fresh('save');
  const rng = makeRng('r');
  for (let i = 0; i < 200; i++) { tryMove(j, rng.pick(Object.keys(DIRS))); if (j.encounter) break; }
  const save = emptySave();
  save.journey = j;
  const back = importSave(exportSave(save));
  assert.ok(back.journey);
  assert.equal(back.journey.seed, j.seed);
  assert.deepEqual(back.journey.player, j.player);
  assert.equal(back.journey.party.length, j.party.length);
  assert.equal(back.journey.stats.steps, j.stats.steps);
  if (j.encounter) { assert.ok(back.journey.encounter); assert.equal(back.journey.encounter.kind, 'wild'); }
  assert.equal(normalizeJourney(null), null);
  assert.equal(normalizeJourney({ phase: 'roam', party: [] }), null, 'no creatures, no journey');
  const broken = JSON.parse(JSON.stringify(j)); broken.player = { x: -50, y: 9999 }; broken.badges = ['mammal', 'nope', 'mammal']; broken.gauntlet = { stage: 9 };
  const n = normalizeJourney(broken);
  assert.ok(n.player.x >= 0 && n.player.y < 96); assert.deepEqual(n.badges, ['mammal']); assert.equal(n.gauntlet, null);
  assert.equal(normalizeSave({ v: 1, journey: j }).journey.seed, j.seed);
});

test('the save survives garbage, retires journeys and folds old arena runs into the collection', async () => {
  const { loadSave, persistSave, retireJourney, SAVE_KEY } = await import('../src/game/save.js');
  const m = new Map();
  const storage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  assert.deepEqual(loadSave(storage), emptySave());
  const s = emptySave();
  s.journey = fresh('persist');
  assert.ok(persistSave(s, storage));
  const back = loadSave(storage);
  assert.equal(back.journey.seed, 'persist');
  assert.equal(back.journey.party[0].genome.name, s.journey.party[0].genome.name);
  storage.setItem(SAVE_KEY, '{not json');
  assert.deepEqual(loadSave(storage), emptySave());
  assert.deepEqual(normalizeSave({ v: 99 }), emptySave());
  const junk = normalizeSave({ v: 1, journey: { phase: 'roam', party: [{ genome: { v: 1 } }] }, collection: [{ genome: null }] });
  assert.equal(junk.journey, null); assert.equal(junk.collection.length, 0);
  // retiring tallies and keeps the creatures
  const t = emptySave();
  t.journey = fresh('retire');
  t.journey.stats.captures = 3; t.journey.stats.battles = 9; t.journey.champion = true;
  retireJourney(t);
  assert.equal(t.journey, null);
  assert.equal(t.totals.journeys, 1); assert.equal(t.totals.captures, 3); assert.equal(t.totals.battles, 9); assert.equal(t.totals.champions, 1);
  assert.equal(t.collection.length, 1);
  // a save from the arena days: the run's creatures land in the collection and its tallies in the totals
  const legacy = { v: 1, best: { floor: 12, runs: 3 }, totals: { battles: 4, captures: 1, fusions: 0 }, collection: [], run: { seed: 'old', floor: 5, phase: 'floor', party: [{ uid: 'a', genome: fresh('legacy').party[0].genome, level: 12, xp: 0, hp: 5, moves: [] }], box: [], stats: { battles: 6, captures: 2, fusions: 1 } } };
  const migrated = normalizeSave(JSON.parse(JSON.stringify(legacy)));
  assert.equal(migrated.run, undefined);
  assert.equal(migrated.collection.length, 1);
  assert.equal(migrated.totals.battles, 10); assert.equal(migrated.totals.captures, 3); assert.equal(migrated.totals.fusions, 1);
  assert.equal(migrated.journey, null);
});

test('experience is shared by the party members that fought, as in Red; the bench gets half a share', () => {
  const j = fresh('share');
  j.party.push(makeMember(speciesGenome(WILD_SPECIES.find((sp) => sp.id !== j.party[0].genome.species), makeRng('second')), 5, 'j2'));
  const world = worldFor(j.seed);
  acceptChallenge(j, world.trainers[0].id);
  const beforeA = j.party[0].xp, beforeB = j.party[1].xp;
  // only the lead fought: it takes the whole reward, the benched creature half of that
  const solo = decided(j, 0);
  const rSolo = applyJourneyBattle(j, solo).report;
  assert.equal(rSolo.shared, 1);
  assert.equal(rSolo.bench, 1);
  assert.equal(rSolo.benchXp, Math.floor(rSolo.xp * XP.benchShare));
  assert.equal(j.party[0].xp - beforeA, rSolo.xp);
  assert.equal(j.party[1].xp - beforeB, rSolo.benchXp, 'the benched creature gets half a share');
  assert.ok(rSolo.benchXp > 0 && rSolo.benchXp < rSolo.xp);
  assert.equal(rSolo.xpGains.length, 2);
  assert.deepEqual(rSolo.xpGains.map((g) => g.bench), [false, true]);
  // both fought: the reward splits in two and nobody sat out
  j.beaten = {};
  acceptChallenge(j, world.trainers[0].id);
  const both = decided(j, 0);
  both.sides[0].party[1].fought = true;
  const a0 = j.party[0].xp, b0 = j.party[1].xp;
  const rBoth = applyJourneyBattle(j, both).report;
  assert.equal(rBoth.shared, 2); assert.equal(rBoth.bench, 0);
  assert.equal(j.party[0].xp - a0, rBoth.xp); assert.equal(j.party[1].xp - b0, rBoth.xp);
  assert.ok(rBoth.xp <= Math.ceil(rSolo.xp / 2) + 1, `${rBoth.xp} is about half of ${rSolo.xp}`);
  // a fainted participant gets nothing, and neither does a fainted bench
  j.beaten = {};
  acceptChallenge(j, world.trainers[0].id);
  const down = decided(j, 0);
  down.sides[0].party[1].fought = true; down.sides[0].party[1].hp = 0; down.sides[0].party[1].fainted = true;
  const b1 = j.party[1].xp;
  const rDown = applyJourneyBattle(j, down).report;
  assert.equal(rDown.shared, 1); assert.equal(rDown.bench, 0); assert.equal(j.party[1].xp, b1);
  assert.equal(j.party[1].hp, 0);
  j.beaten = {};
  acceptChallenge(j, world.trainers[0].id);
  const sat = decided(j, 0);
  sat.sides[0].party[1].hp = 0; sat.sides[0].party[1].fainted = true;
  const rSat = applyJourneyBattle(j, sat).report;
  assert.equal(rSat.bench, 0, 'a fainted creature on the bench gets nothing');
  assert.equal(j.party[1].xp, b1);
});

test('Creature Storage stands at the crossroads and opens when you step on its door', () => {
  const j = fresh('storage');
  const world = worldFor(j.seed);
  const d = world.storageDoor;
  assert.equal(tileAt(world, d.x, d.y), TILE.storageDoor);
  assert.ok(findPath(world, j.player, d, 60));
  j.player.x = d.x; j.player.y = d.y + 1; j.player.dir = 'up';
  const r = tryMove(j, 'up');
  assert.ok(r.moved); assert.deepEqual(r.event, { kind: 'storage' });
});
