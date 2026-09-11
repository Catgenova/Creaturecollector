import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { MOVES, getMove } from '../src/data/moves.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome, makeElemental } from '../src/creature/genome.js';
import { makeMember } from '../src/game/party.js';
import { TILE, tileAt, worldFor, isWalkable, findPath, isHubTile } from '../src/game/world.js';
import { newJourney, chooseJourneyStarter, tryMove, acceptChallenge, challengeWarden, buildJourneyBattle, applyJourneyBattle, fleeEncounter } from '../src/game/journey.js';
import { MARKET, GOLD, moveCost, marketCatalogue, goldReward, buyMove, bagList, bagCount, canTeach, teachMove, itemCatalogue, itemList, buyItem, useItem, scrollTypes, canLearnScroll, scrollLearners, listWords } from '../src/game/market.js';
import { normalizeJourney } from '../src/game/save.js';
import { ITEMS, ITEM_IDS, getItem, potionHeal, potionUseful } from '../src/data/items.js';
import { memberMaxHp } from '../src/game/party.js';
import { createBattle, legalActions, step, describeEvent, makeBattler } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';

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
  // teach a scroll of the starter's own type
  const m = j.party[0];
  const own = MOVES.find((x) => x.type === m.genome.types[0] && x.id !== 'squirt');
  m.moves = ['squirt'];
  j.bag[own.id] = 2;
  assert.deepEqual(canTeach(j, m.uid, 'headbonk'), { ok: true, needsReplace: false }, 'a Normal scroll suits anyone');
  assert.deepEqual(canTeach(j, m.uid, own.id), { ok: true, needsReplace: false });
  assert.deepEqual(teachMove(j, m.uid, own.id), { ok: true, replaced: null, needsReplace: false });
  assert.deepEqual(m.moves, ['squirt', own.id]);
  assert.equal(bagCount(j, own.id), 1);
  assert.equal(canTeach(j, m.uid, own.id).code, 'known', 'already known');
  assert.equal(teachMove(j, m.uid, own.id).ok, false);
  assert.equal(bagCount(j, own.id), 1, 'a refused teach keeps the scroll');
  // a second member with four moves must replace one
  const other = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('o')), 20, 'o1');
  other.moves = ['bump', 'swipe', 'dash', 'rake'];
  j.box.push(other);
  const fire = MOVES.find((x) => x.type === other.genome.types[0] && !other.moves.includes(x.id));
  j.bag[fire.id] = 1;
  assert.deepEqual(canTeach(j, 'o1', fire.id), { ok: true, needsReplace: true });
  assert.equal(teachMove(j, 'o1', fire.id).ok, false, 'needs a slot');
  assert.equal(teachMove(j, 'o1', fire.id, 9).ok, false);
  const r = teachMove(j, 'o1', fire.id, 2);
  assert.deepEqual(r, { ok: true, replaced: 'dash', needsReplace: true });
  assert.deepEqual(other.moves, ['bump', 'swipe', fire.id, 'rake']);
  assert.equal(bagCount(j, fire.id), 0);
  assert.ok(!(fire.id in j.bag), 'empty stacks disappear');
  assert.equal(canTeach(j, 'nobody', 'bump').ok, false);
  assert.equal(teachMove(j, m.uid, 'nope').ok, false);
});

test('scrolls teach only a creature\'s own types, or its Elemental element on top', () => {
  const j = fresh('types');
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('t1'));
  const fireling = makeMember(g, 12, 'f1');
  j.box.push(fireling);
  assert.deepEqual(scrollTypes(g), [...g.types, 'Normal']);
  assert.ok(g.types.includes('Fire') && !g.types.includes('Normal'));
  assert.equal(canLearnScroll(g, 'scorch_fist').ok, true);
  assert.equal(canLearnScroll(g, 'squirt').ok, false);
  assert.match(canLearnScroll(g, 'squirt').reason, /cannot learn Water moves.*learns Fire.* and Normal/);
  assert.equal(canLearnScroll(g, 'headbonk').ok, true, 'Normal scrolls suit every creature');
  assert.equal(canLearnScroll(g, 'yowl').ok, true);
  assert.equal(canLearnScroll(g, 'nope').ok, false);
  j.bag = { squirt: 1, scorch_fist: 1 };
  const refused = canTeach(j, 'f1', 'squirt');
  assert.equal(refused.ok, false); assert.equal(refused.code, 'type');
  assert.equal(teachMove(j, 'f1', 'squirt').ok, false);
  assert.equal(bagCount(j, 'squirt'), 1, 'the scroll is kept');
  assert.equal(canTeach(j, 'f1', 'scorch_fist').ok, fireling.moves.includes('scorch_fist') ? false : true);
  // a Water Elemental of that same species learns Water on top of its own types
  const elem = makeElemental(JSON.parse(JSON.stringify(g)), 'water');
  assert.deepEqual(scrollTypes(elem), [...g.types, 'Water', 'Normal'].filter((t, i, a) => a.indexOf(t) === i));
  assert.equal(scrollTypes(elem).filter((t) => t === 'Normal').length, 1, 'Normal listed once');
  assert.equal(canLearnScroll(elem, 'squirt').ok, true);
  assert.equal(canLearnScroll(elem, 'scorch_fist').ok, true);
  const shadow = makeElemental(JSON.parse(JSON.stringify(g)), 'shadow');
  assert.ok(scrollTypes(shadow).includes('Dark') && scrollTypes(shadow).includes('Ghost'), 'two-type elements open both');
  const w = makeMember(elem, 12, 'w1');
  j.party.push(w);
  assert.ok(scrollLearners(j, 'squirt').includes(elem.name));
  assert.equal(scrollLearners(j, 'squirt').length, [...j.party, ...j.box].filter((m) => scrollTypes(m.genome).includes('Water')).length);
  assert.equal(canTeach(j, 'w1', 'squirt').ok, w.moves.includes('squirt') ? false : true);
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

test('potions come in rising strengths and heal what they say, never reviving', () => {
  const cat = itemCatalogue();
  assert.deepEqual(cat.map((e) => e.item.id), ITEM_IDS);
  for (let i = 1; i < cat.length; i++) assert.ok(cat[i].cost > cat[i - 1].cost, 'dearer as they get stronger');
  assert.equal(potionHeal(ITEMS.potion, 10, 100), 20);
  assert.equal(potionHeal(ITEMS.potion, 95, 100), 5);
  assert.equal(potionHeal(ITEMS.potion, 100, 100), 0);
  assert.equal(potionHeal(ITEMS.potion, 0, 100), 0, 'a fainted creature gets nothing');
  assert.equal(potionHeal(ITEMS.hyper_potion, 1, 400), 150);
  assert.equal(potionHeal(ITEMS.max_potion, 1, 250), 249);
  assert.equal(potionUseful(ITEMS.full_restore, 100, 100, 'psn'), true, 'a cure alone is worth it');
  assert.equal(potionUseful(ITEMS.max_potion, 100, 100, 'psn'), false);
  assert.equal(potionUseful(ITEMS.full_restore, 0, 100, 'psn'), false);
  assert.equal(getItem('nope'), null);
});

test('buying potions stacks them in the bag; using one heals a party member and is spent', () => {
  const j = fresh('potion');
  assert.equal(buyItem(j, 'potion').ok, false, 'no gold, no potion');
  j.gold = 1000;
  assert.deepEqual(buyItem(j, 'potion'), { ok: true, cost: 300 });
  assert.deepEqual(buyItem(j, 'potion'), { ok: true, cost: 300 });
  assert.equal(j.gold, 400);
  assert.equal(buyItem(j, 'super_potion').ok, false, 'too poor');
  assert.equal(buyItem(j, 'nope').ok, false);
  assert.equal(buyMove(j, 'potion').ok, false, 'potions are not scrolls');
  assert.deepEqual(itemList(j).map((e) => [e.item.id, e.qty]), [['potion', 2]]);
  assert.deepEqual(bagList(j), [], 'the scroll list leaves potions out');
  const m = j.party[0];
  const max = memberMaxHp(m);
  assert.equal(useItem(j, m.uid, 'potion').ok, false, 'full health refuses');
  assert.equal(bagCount(j, 'potion'), 2, 'a refused use keeps the potion');
  m.hp = max - 5;
  assert.deepEqual(useItem(j, m.uid, 'potion'), { ok: true, amount: 5, healed: 5, cured: null });
  assert.equal(m.hp, max);
  assert.equal(bagCount(j, 'potion'), 1);
  m.hp = 0;
  assert.equal(useItem(j, m.uid, 'potion').ok, false, 'no reviving');
  m.hp = 1; m.status = 'brn';
  j.bag.full_restore = 1;
  assert.deepEqual(useItem(j, m.uid, 'full_restore'), { ok: true, amount: max - 1, healed: max - 1, cured: 'brn' });
  assert.equal(m.status, null);
  assert.ok(!('full_restore' in j.bag), 'empty stacks disappear');
  assert.equal(useItem(j, 'nobody', 'potion').ok, false);
  assert.equal(useItem(j, m.uid, 'hyper_potion').ok, false, 'not in the bag');
  const stored = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('st')), 9, 'st1');
  stored.hp = 1; j.box.push(stored);
  assert.equal(useItem(j, 'st1', 'potion').ok, false, 'party members only');
});

test('in battle a potion is an action: it heals any standing member, is used up and costs the turn', () => {
  const rng = makeRng('potbattle');
  const a = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, rng.fork('a')), 20);
  const b = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, rng.fork('b')), 20);
  const c = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, rng.fork('c')), 20);
  b.hp = 1;
  const { state } = createBattle({ sides: [{ name: 'You', party: [a, b] }, { name: 'Foe', ai: true, party: [c] }], seed: 'pot', items: { potion: 2, full_restore: 1, junk: 3, super_potion: 0 } });
  assert.deepEqual(state.items, { potion: 2, full_restore: 1 }, 'unknown and empty stacks are dropped');
  assert.deepEqual(legalActions(state, 0).filter((x) => x.type === 'item'), [{ type: 'item', id: 'potion', index: 1 }, { type: 'item', id: 'full_restore', index: 1 }], 'only the hurt bench member needs one');
  assert.deepEqual(legalActions(state, 1).filter((x) => x.type === 'item'), [], 'the foe has no bag');
  assert.throws(() => step(state, [{ type: 'item', id: 'potion', index: 0 }, { type: 'move', index: 0 }]), /Illegal/, 'a full member is not a target');
  assert.throws(() => step(state, [{ type: 'item', id: 'hyper_potion', index: 1 }, { type: 'move', index: 0 }]), /Illegal/, 'not in the bag');
  const r = step(state, [{ type: 'item', id: 'potion', index: 1 }, { type: 'move', index: 0 }]);
  const bench = r.state.sides[0].party[1];
  assert.equal(bench.hp, 21);
  assert.equal(r.state.sides[0].active, 0, 'the active creature stays out');
  assert.deepEqual(r.state.items, { potion: 1, full_restore: 1 });
  const kinds = r.events.map((e) => e.t);
  assert.ok(kinds.indexOf('item') >= 0 && kinds.indexOf('item') < kinds.indexOf('move'), 'the potion goes before the foe moves');
  const heal = r.events.find((e) => e.t === 'heal');
  assert.equal(heal.uid, bench.uid); assert.equal(heal.why, 'item'); assert.equal(heal.amount, 20);
  assert.equal(describeEvent(r.events.find((e) => e.t === 'item'), ['You', 'Foe']), `You used a Potion on ${bench.name}!`);
  assert.equal(r.state.turn, 1);
  // a Full Restore also cures
  const s2 = JSON.parse(JSON.stringify(r.state));
  s2.sides[0].party[1].status = 'psn';
  const r2 = step(s2, [{ type: 'item', id: 'full_restore', index: 1 }, { type: 'move', index: 0 }]);
  const cured = r2.state.sides[0].party[1];
  assert.equal(cured.hp, cured.maxHp); assert.equal(cured.status, null);
  assert.ok(!('full_restore' in r2.state.items));
  const cure = r2.events.find((e) => e.t === 'cure');
  assert.equal(cure.status, 'psn'); assert.equal(cure.why, 'item');
  assert.match(describeEvent(cure), /cured of its poison/);
  assert.equal(chooseAction(r2.state, 0, makeRng('ai')).type !== 'item', true, 'the auto battler never spends potions');
  assert.equal(createBattle({ sides: [{ party: [a] }, { party: [c] }] }).state.items && Object.keys(createBattle({ sides: [{ party: [a] }, { party: [c] }] }).state.items).length, 0, 'no bag by default');
});

test('potions spent in a fight leave the bag whether you win or flee', () => {
  const j = fresh('potsync');
  j.bag = { potion: 3 };
  const world = worldFor(j.seed);
  const foe = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('wf')), 3, 'wf');
  j.encounter = { kind: 'wild', name: foe.genome.name, foes: [{ genome: foe.genome, level: 3 }], capturable: true, biome: world.biomes[0].id };
  const { state } = buildJourneyBattle(j);
  assert.deepEqual(state.items, { potion: 3 });
  const s = JSON.parse(JSON.stringify(state));
  s.items = { potion: 1 };
  s.phase = 'over'; s.winner = 0;
  for (const f of s.sides[1].party) { f.hp = 0; f.fainted = true; }
  applyJourneyBattle(j, s);
  assert.deepEqual(j.bag, { potion: 1 });
  // fleeing keeps the HP and bag as they were when you ran
  const k = fresh('potflee');
  k.bag = { potion: 1, super_potion: 2 };
  k.encounter = { kind: 'wild', name: foe.genome.name, foes: [{ genome: foe.genome, level: 3 }], capturable: true, biome: world.biomes[0].id };
  const built = buildJourneyBattle(k);
  const f = JSON.parse(JSON.stringify(built.state));
  f.items = { super_potion: 2 };
  f.sides[0].party[0].hp = 0;
  fleeEncounter(k, f);
  assert.deepEqual(k.bag, { super_potion: 2 });
  assert.equal(k.party[0].hp, 1, 'you never flee with a fainted lead');
  assert.equal(k.encounter, null);
  const back = normalizeJourney(JSON.parse(JSON.stringify(k)));
  assert.deepEqual(back.bag, { super_potion: 2 }, 'item ids survive the save');
  assert.deepEqual(normalizeJourney({ ...JSON.parse(JSON.stringify(k)), bag: { max_potion: 500, potion: 0, nope: 1 } }).bag, { max_potion: 99 });
});

test('listWords joins like a sentence', () => {
  assert.equal(listWords([]), '');
  assert.equal(listWords(['Fire']), 'Fire');
  assert.equal(listWords(['Fire', 'Normal']), 'Fire and Normal');
  assert.equal(listWords(['Ice', 'Water', 'Normal']), 'Ice, Water and Normal');
});
