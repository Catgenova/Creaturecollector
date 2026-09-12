import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID, WILD_SPECIES } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { BOARD, QUEST_KINDS, ensureBoard, openQuests, questEvent, questReady, claimQuest, abandonQuest, rewardText, normalizeBoard } from '../src/game/quests.js';
import { newJourney, chooseJourneyStarter, tryMove, facing, acceptChallenge, challengeWarden, buildJourneyBattle, applyJourneyBattle, shrineFuse, canFuseJourney, DIRS } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { normalizeJourney } from '../src/game/save.js';
import { WORLD, TILE, worldFor, tileAt, isWalkable, findPath, WALKABLE_TILES } from '../src/game/world.js';
import { bagCount } from '../src/game/market.js';
import { ITEMS } from '../src/data/items.js';
import { CHARMS } from '../src/data/charms.js';
import { getMove } from '../src/data/moves.js';

const decided = (j, winner) => {
  const { state } = buildJourneyBattle(j);
  const s = JSON.parse(JSON.stringify(state));
  s.phase = 'over'; s.winner = winner;
  if (winner === 0) for (const f of s.sides[1].party) { f.hp = 0; f.fainted = true; }
  return s;
};

test('the board pins three valid notices, deterministically, never two of a kind, with rewards that exist', () => {
  const j = newJourney('board'); chooseJourneyStarter(j, 0);
  const open = openQuests(j);
  assert.equal(open.length, BOARD.open);
  assert.equal(new Set(open.map((q) => q.kind)).size, BOARD.open, 'no two open notices share a kind');
  for (const q of open) {
    assert.ok(QUEST_KINDS.includes(q.kind), q.kind);
    assert.ok(q.text.length > 10 && q.goal >= 1 && q.progress === 0, q.text);
    assert.ok(q.reward.gold >= 400 && q.reward.gold % 10 === 0);
    const it = q.reward.item;
    assert.ok(!it || ITEMS[it] || CHARMS[it] || getMove(it), `reward ${it}`);
    assert.ok(!(it && getMove(it) && getMove(it).signature), 'signatures are never rewards');
    assert.ok(rewardText(q).includes('gold'));
    assert.ok(q.kind !== 'win_tower', 'no tower notice at level 5');
  }
  const k = newJourney('board'); chooseJourneyStarter(k, 0);
  assert.deepEqual(openQuests(k), open, 'the same seed pins the same notices');
  // many boards, every kind well formed
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    const jj = newJourney(`b${i}`); chooseJourneyStarter(jj, 0);
    jj.badges = ['mammal', 'amphibian', 'flora']; jj.party[0].level = 60;
    for (let n = 0; n < 6; n++) { const q = openQuests(jj)[0]; abandonQuest(jj, q.id); }
    for (const q of openQuests(jj)) seen.add(q.kind);
  }
  assert.ok(seen.size >= 8, `${[...seen].join(', ')}`);
});

test('journey events move the right notices along; claiming pays out and pins a new one; tearing down replaces', () => {
  const j = newJourney('events'); chooseJourneyStarter(j, 0);
  const board = ensureBoard(j);
  // plant notices of known kinds
  board.open = [
    { id: 'a', kind: 'catch_count', goal: 2, progress: 0, text: 'Catch 2 wild creatures.', reward: { gold: 500, item: 'potion' } },
    { id: 'b', kind: 'beat_trainers', biome: 'mammal', goal: 1, progress: 0, text: 'Beat a trainer.', reward: { gold: 700, item: 'headbonk' } },
    { id: 'c', kind: 'fuse_class', clade: 'mammal', goal: 1, progress: 0, text: 'Fuse two mammals.', reward: { gold: 900, item: 'moss_charm' } },
  ];
  const wild = speciesGenome(SPECIES_BY_ID.pufflet, makeRng('w'));
  assert.deepEqual(questEvent(j, { kind: 'capture', genome: wild, level: 5, alpha: false }), []);
  assert.equal(board.open[0].progress, 1);
  const done = questEvent(j, { kind: 'capture', genome: wild, level: 5, alpha: false });
  assert.equal(done.length, 1); assert.ok(questReady(board.open[0]));
  assert.equal(questEvent(j, { kind: 'capture', genome: wild, level: 5 }).length, 0, 'a finished notice stops counting');
  assert.equal(questEvent(j, { kind: 'trainer', biome: 'amphibian' }).length, 0, 'wrong biome');
  assert.equal(questEvent(j, { kind: 'trainer', biome: 'mammal' }).length, 1);
  // a real fusion at the shrine books the fusion notice
  const a = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('fa')), 10, 'fa'), b = makeMember(speciesGenome(SPECIES_BY_ID.glacub, makeRng('fb')), 10, 'fb');
  j.party.push(a, b);
  assert.ok(canFuseJourney(j, 'fa', 'fb').ok);
  const fused = shrineFuse(j, 'fa', 'fb');
  assert.deepEqual(fused.quests, ['Fuse two mammals.']);
  // claim: gold, item, a new notice, the counter
  const gold = j.gold;
  const r = claimQuest(j, 'a');
  assert.ok(r.ok && j.gold === gold + 500 && bagCount(j, 'potion') === 1);
  assert.equal(openQuests(j).length, 3);
  assert.ok(!openQuests(j).some((q) => q.id === 'a'));
  assert.equal(j.stats.quests, 1);
  assert.equal(claimQuest(j, 'a').ok, false);
  claimQuest(j, 'b'); claimQuest(j, 'c');
  assert.equal(bagCount(j, 'headbonk'), 1); assert.equal(bagCount(j, 'moss_charm'), 1);
  assert.equal(j.stats.quests, 3);
  const before = openQuests(j).map((q) => q.id);
  assert.equal(claimQuest(j, before[0]).ok, false, 'an open notice cannot be claimed early');
  assert.ok(abandonQuest(j, before[0]).ok);
  const after = openQuests(j).map((q) => q.id);
  assert.equal(after.length, 3); assert.ok(!after.includes(before[0]));
  assert.equal(abandonQuest(j, 'nope').ok, false);
});

test('fights report finished notices: captures, trainer and Warden wins', () => {
  const j = newJourney('fights'); chooseJourneyStarter(j, 0);
  j.party[0].level = 60; j.party[0].hp = 9999;
  ensureBoard(j).open = [
    { id: 'w', kind: 'beat_warden', biome: 'mammal', goal: 1, progress: 0, text: 'Beat Warden Marrow.', reward: { gold: 1000, item: null } },
    { id: 'x', kind: 'catch_type', type: 'Normal', minLevel: 1, goal: 1, progress: 0, text: 'Catch a Normal creature.', reward: { gold: 400, item: 'potion' } },
    { id: 'y', kind: 'beat_trainers', biome: 'mammal', goal: 2, progress: 0, text: 'Beat 2 trainers.', reward: { gold: 600, item: null } },
  ];
  challengeWarden(j, 'mammal');
  const { report } = applyJourneyBattle(j, decided(j, 0));
  assert.deepEqual(report.quests, ['Beat Warden Marrow.']);
  const world = worldFor(j.seed);
  const t = world.trainers.find((x) => x.biome === 'mammal');
  acceptChallenge(j, t.id);
  const r2 = applyJourneyBattle(j, decided(j, 0)).report;
  assert.deepEqual(r2.quests, []);
  assert.equal(openQuests(j).find((q) => q.id === 'y').progress, 1);
  // a capture of a Normal creature
  const pufflet = speciesGenome(SPECIES_BY_ID.pufflet, makeRng('cap'));
  j.encounter = { kind: 'wild', name: 'Wild Pufflet', foes: [{ genome: pufflet, level: 4 }], capturable: true, biome: 'mammal' };
  const { state } = buildJourneyBattle(j);
  const s = JSON.parse(JSON.stringify(state)); s.phase = 'over'; s.winner = 0; s.captured = s.sides[1].party[0].uid;
  const r3 = applyJourneyBattle(j, s).report;
  assert.ok(r3.captured);
  assert.deepEqual(r3.quests, ['Catch a Normal creature.']);
});

test('the notice board stands in the town square, is faced rather than walked on, and the save keeps it', () => {
  const world = worldFor('boardtile');
  assert.equal(tileAt(world, world.board.x, world.board.y), TILE.board);
  assert.ok(!WALKABLE_TILES.has(TILE.board) && !isWalkable(world, world.board.x, world.board.y));
  assert.ok(isWalkable(world, world.board.x, world.board.y + 1), 'the square in front is open');
  const j = newJourney('boardtile'); chooseJourneyStarter(j, 0);
  const path = findPath(world, j.player, { x: world.board.x, y: world.board.y + 1 }, 60);
  assert.ok(path && path.length, 'a short walk from the start');
  for (const p of path) { const dir = p.x > j.player.x ? 'right' : p.x < j.player.x ? 'left' : p.y > j.player.y ? 'down' : 'up'; tryMove(j, dir); }
  const r = tryMove(j, 'up');
  assert.equal(r.moved, false);
  assert.equal(facing(j).tile, TILE.board);
  // walking up to it from below opens it
  j.player.y += 1; j.player.dir = 'up';
  const up = tryMove(j, 'up');
  assert.ok(up.moved && up.event && up.event.kind === 'board');
  // save round trip keeps progress and drops junk
  ensureBoard(j).open[0].progress = 1; ensureBoard(j).open[0].goal = 3;
  const raw = JSON.parse(JSON.stringify(j));
  raw.quests.open[1] = { kind: 'steal_moon', text: 'x', reward: { gold: 1 } };
  raw.quests.open[2].reward.item = 'wooden_spoon';
  const back = normalizeJourney(raw);
  assert.equal(back.quests.open.length, 3);
  assert.equal(back.quests.open[0].progress, 1);
  assert.equal(back.quests.open[0].goal, 3);
  assert.ok(!back.quests.open.some((q) => q.kind === 'steal_moon'));
  assert.ok(back.quests.issued >= 3);
  assert.equal(normalizeBoard(null).open.length, 0);
  assert.equal(WORLD.version, 10, 'the map changed, so saved positions reset');
});
