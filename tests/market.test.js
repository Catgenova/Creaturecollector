import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { MOVES, getMove } from '../src/data/moves.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeMember } from '../src/game/party.js';
import { TILE, tileAt, worldFor, isWalkable, findPath, isHubTile } from '../src/game/world.js';
import { newJourney, chooseJourneyStarter, tryMove, acceptChallenge, challengeWarden, buildJourneyBattle, applyJourneyBattle } from '../src/game/journey.js';
import { MARKET, GOLD, moveCost, marketCatalogue, goldReward, buyMove, bagList, bagCount, canTeach, teachMove } from '../src/game/market.js';
import { normalizeJourney } from '../src/game/save.js';

function fresh(seed = 'mk') { const j = newJourney(seed); chooseJourneyStarter(j, 0); return j; }
function decided(j, winner) {
  const { state } = buildJourneyBattle(j);
  const s = JSON.parse(JSON.stringify(state));
  s.phase = 'over'; s.winner = winner;
  if (winner === 0) for (const f of s.sides[1].party) { f.hp = 0; f.fainted = true; }
  else for (const m of s.sides[0].party) { m.hp = 0; m.fainted = true; }
  return s;
}

test('move prices climb with power in steps of a thousand', () => {
  assert.equal(moveCost('bump'), 1000);
  assert.equal(moveCost('yowl'), 1000, 'status moves cost the base');
  assert.equal(moveCost('headbonk'), 3000);
  assert.equal(moveCost('reckless_charge'), 5000);
  assert.equal(moveCost('struggle'), 0);
  assert.equal(moveCost('nope'), 0);
  const cat = marketCatalogue();
  assert.equal(cat.length, MOVES.length);
  for (const { move, cost } of cat) {
    assert.ok(cost >= MARKET.unit && cost % MARKET.unit === 0, `${move.id} ${cost}`);
    assert.ok(!move.struggle);
  }
  const byPower = [...MOVES].sort((a, b) => (a.power || 0) - (b.power || 0));
  for (let i = 1; i < byPower.length; i++) assert.ok(moveCost(byPower[i]) >= moveCost(byPower[i - 1]), 'never cheaper with more power');
  for (let i = 1; i < cat.length; i++) assert.ok(cat[i].cost >= cat[i - 1].cost, 'catalogue sorted cheapest first');
});

test('gold scales with team size and average level, doubles for bosses, quarters on rematches', () => {
  const two = goldReward([{ level: 10 }, { level: 10 }]), four = goldReward([{ level: 10 }, { level: 10 }, { level: 10 }, { level: 10 }]);
  assert.equal(four, two * 2);
  assert.equal(goldReward([{ level: 20 }, { level: 20 }]), two * 2);
  assert.equal(goldReward([{ level: 10 }, { level: 30 }]), goldReward([{ level: 20 }, { level: 20 }]), 'average level');
  assert.equal(goldReward([{ level: 10 }], 'boss'), goldReward([{ level: 10 }]) * GOLD.bossMultiplier);
  assert.equal(goldReward([{ level: 40 }, { level: 40 }], 'boss', true), goldReward([{ level: 40 }, { level: 40 }], 'boss') * GOLD.rematchShare);
  assert.equal(goldReward([]), 0);
  assert.ok(goldReward([{ level: 1 }]) >= 10 && goldReward([{ level: 1 }]) % 10 === 0);
});

test('beating trainers and wardens pays gold; wild fights do not', () => {
  const j = fresh('pay');
  const world = worldFor(j.seed);
  assert.equal(j.gold, 0);
  const t = world.trainers[0];
  acceptChallenge(j, t.id);
  const expected = goldReward(t.team, 'trainer', false);
  const r = applyJourneyBattle(j, decided(j, 0)).report;
  assert.equal(r.gold, expected); assert.equal(j.gold, expected);
  // losing pays nothing
  acceptChallenge(j, world.trainers[1].id);
  for (const m of j.party) m.hp = 1;
  const lost = applyJourneyBattle(j, decided(j, 1)).report;
  assert.equal(lost.gold, 0);
  // a wild win pays nothing
  const rng = makeRng('roam');
  let guard = 0;
  while (!j.encounter && guard++ < 5000) tryMove(j, rng.pick(['up', 'down', 'left', 'right']));
  const before = j.gold;
  assert.equal(applyJourneyBattle(j, decided(j, 0)).report.gold, 0);
  assert.equal(j.gold, before);
  // a warden pays double once, a quarter of that on the rematch
  challengeWarden(j, 'mammal');
  const first = applyJourneyBattle(j, decided(j, 0)).report.gold;
  assert.equal(first, goldReward(world.wardens.mammal.team, 'boss', false));
  challengeWarden(j, 'mammal');
  const again = applyJourneyBattle(j, decided(j, 0)).report.gold;
  assert.equal(again, goldReward(world.wardens.mammal.team, 'boss', true));
  assert.ok(again < first);
});

test('buying stacks scrolls in the bag and teaching uses them up', () => {
  const j = fresh('shop');
  assert.equal(buyMove(j, 'headbonk').ok, false, 'no gold, no scroll');
  j.gold = 7500;
  assert.deepEqual(buyMove(j, 'headbonk'), { ok: true, cost: 3000 });
  assert.deepEqual(buyMove(j, 'headbonk'), { ok: true, cost: 3000 });
  assert.equal(j.gold, 1500);
  assert.equal(bagCount(j, 'headbonk'), 2);
  assert.equal(buyMove(j, 'headbonk').ok, false);
  assert.ok(buyMove(j, 'bump').ok && j.gold === 500);
  assert.equal(buyMove(j, 'struggle').ok, false);
  assert.deepEqual(bagList(j).map((e) => [e.move.id, e.qty]), [['bump', 1], ['headbonk', 2]]);
  const m = j.party[0];
  m.moves = ['squirt'];
  assert.deepEqual(canTeach(j, m.uid, 'headbonk'), { ok: true, needsReplace: false });
  assert.deepEqual(teachMove(j, m.uid, 'headbonk'), { ok: true, replaced: null, needsReplace: false });
  assert.deepEqual(m.moves, ['squirt', 'headbonk']);
  assert.equal(bagCount(j, 'headbonk'), 1);
  assert.equal(canTeach(j, m.uid, 'headbonk').ok, false, 'already known');
  assert.equal(teachMove(j, m.uid, 'headbonk').ok, false);
  assert.equal(bagCount(j, 'headbonk'), 1, 'a refused teach keeps the scroll');
  // a second member with four moves must replace one
  const other = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('o')), 20, 'o1');
  other.moves = ['bump', 'swipe', 'dash', 'rake'];
  j.box.push(other);
  assert.deepEqual(canTeach(j, 'o1', 'headbonk'), { ok: true, needsReplace: true });
  assert.equal(teachMove(j, 'o1', 'headbonk').ok, false, 'needs a slot');
  assert.equal(teachMove(j, 'o1', 'headbonk', 9).ok, false);
  const r = teachMove(j, 'o1', 'headbonk', 2);
  assert.deepEqual(r, { ok: true, replaced: 'dash', needsReplace: true });
  assert.deepEqual(other.moves, ['bump', 'swipe', 'headbonk', 'rake']);
  assert.equal(bagCount(j, 'headbonk'), 0);
  assert.ok(!('headbonk' in j.bag), 'empty stacks disappear');
  assert.equal(canTeach(j, 'nobody', 'bump').ok, false);
  assert.equal(teachMove(j, m.uid, 'nope').ok, false);
});

test('gold and the bag survive the save and junk is dropped', () => {
  const j = fresh('bagsave');
  j.gold = 4321; j.bag = { bump: 3, headbonk: 1 };
  const back = normalizeJourney(JSON.parse(JSON.stringify(j)));
  assert.equal(back.gold, 4321); assert.deepEqual(back.bag, { bump: 3, headbonk: 1 });
  const junk = normalizeJourney({ ...JSON.parse(JSON.stringify(j)), gold: -50, bag: { bump: 2.7, nope: 4, struggle: 1, swipe: 0, dash: 500 } });
  assert.equal(junk.gold, 0); assert.deepEqual(junk.bag, { bump: 2, dash: 99 });
  assert.equal(normalizeJourney({ ...JSON.parse(JSON.stringify(j)), gold: 'lots', bag: null }).gold, 0);
});

test('the Market stands at the crossroads and opens when you step on its door', () => {
  const j = fresh('market');
  const world = worldFor(j.seed);
  const d = world.marketDoor;
  assert.equal(tileAt(world, d.x, d.y), TILE.marketDoor);
  assert.ok(isWalkable(world, d.x, d.y) && isHubTile(world, d.x, d.y));
  assert.equal(tileAt(world, world.market.x, world.market.y), TILE.market);
  assert.ok(!isWalkable(world, world.market.x, world.market.y), 'the shop itself is solid');
  const path = findPath(world, j.player, d, 60);
  assert.ok(path && path.length > 0);
  let ev = null;
  for (const step of path) {
    const dir = step.x > j.player.x ? 'right' : step.x < j.player.x ? 'left' : step.y > j.player.y ? 'down' : 'up';
    const r = tryMove(j, dir);
    assert.ok(r.moved, 'walking across the square');
    if (r.event) ev = r.event;
  }
  assert.deepEqual(ev, { kind: 'market' });
  assert.deepEqual([j.player.x, j.player.y], [d.x, d.y]);
});
