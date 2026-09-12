// The Rookery: swapping a creature's passive within its bloodline, and drawing one from the wild.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ABILITIES } from '../src/data/abilities.js';
import { isCoreAbility } from '../src/data/elements.js';
import { speciesGenome, makeElemental, validateGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { newJourney, chooseJourneyStarter, tryMove } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { WORLD, worldFor, TILE, tileAt, isWalkable, findPath } from '../src/game/world.js';
import { makeBattler, calcDamage } from '../src/battle/engine.js';
import { getMove } from '../src/data/moves.js';
import { bloodlinePassives, swapChoices, wildPool, swapPrice, drawPrice, secondSlotPrice, rookeryBlock, swapPassive, wildDraw, openSecondSlot, ROOKERY } from '../src/game/rookery.js';

const gen = (id, seed = 'r') => speciesGenome(SPECIES_BY_ID[id], makeRng(`${seed}-${id}`));
function journeyWith(members, gold = 50000) {
  const j = newJourney('rookery');
  j.party = members.map((g, i) => makeMember(g, 40, `u${i}`));
  j.gold = gold;
  return j;
}

test('the Rookery stands on the square with a walkable door', () => {
  const world = worldFor('rookery');
  assert.equal(tileAt(world, world.rookery.x, world.rookery.y), TILE.rookery);
  assert.equal(tileAt(world, world.rookeryDoor.x, world.rookeryDoor.y), TILE.rookeryDoor);
  assert.ok(isWalkable(world, world.rookeryDoor.x, world.rookeryDoor.y), 'you can stand in the doorway');
  for (const other of ['tower', 'bounty', 'market', 'storage', 'board']) {
    assert.notEqual(`${world.rookery.x},${world.rookery.y}`, `${world[other].x},${world[other].y}`, `it sits on the ${other}`);
  }
  assert.equal(WORLD.version, 12, 'the map changed, so saved worlds reset');

  // walking into the doorway opens it, the way the other hub buildings do
  const j = newJourney('rookery-walk');
  chooseJourneyStarter(j, 0);
  const path = findPath(worldFor(j.seed), j.player, worldFor(j.seed).rookeryDoor, 60);
  assert.ok(path && path.length, 'the door is reachable');
  let ev = null;
  for (const p of path) {
    const dir = p.x > j.player.x ? 'right' : p.x < j.player.x ? 'left' : p.y > j.player.y ? 'down' : 'up';
    const r = tryMove(j, dir);
    if (r.event) ev = r.event;
  }
  assert.ok(ev && ev.kind === 'rookery', JSON.stringify(ev));
});

test('a swap moves a creature to the other passive of its own bloodline, and charges by level', () => {
  const g = gen('emberox');
  const pair = SPECIES_BY_ID.emberox.abilities;
  assert.deepEqual(bloodlinePassives(g).sort(), [...pair].sort());
  const j = journeyWith([g]);
  const m = j.party[0];
  const other = pair.find((id) => id !== m.genome.ability);
  assert.deepEqual(swapChoices(m.genome), [other]);
  const price = swapPrice(m);
  assert.equal(price, ROOKERY.swapBase + ROOKERY.swapPerLevel * m.level);
  const before = j.gold;
  const r = swapPassive(j, m.uid);
  assert.ok(r.ok, r.reason);
  assert.equal(m.genome.ability, other);
  assert.equal(j.gold, before - price);
  // and back again
  assert.ok(swapPassive(j, m.uid).ok);
  assert.equal(m.genome.ability, pair.find((id) => id !== other));
});

test('a fusion may choose from every parent bloodline', () => {
  const a = gen('emberox'), b = gen('solmane');
  const { child } = fuse(a, b, makeRng('fuse'));
  const want = new Set([...SPECIES_BY_ID.emberox.abilities, ...SPECIES_BY_ID.solmane.abilities]);
  assert.deepEqual(new Set(bloodlinePassives(child)), want);
  const j = journeyWith([child]);
  const r = swapPassive(j, j.party[0].uid);
  assert.ok(r.ok, r.reason);
  assert.ok(want.has(r.to) && r.to !== r.from);
});

test('a wild draw takes a passive suited to its types or style, and never a core', () => {
  const g = gen('emberox');
  const pool = wildPool(g);
  assert.ok(pool.length > 20, `${pool.length} in the pool`);
  const style = 'magic';
  for (const id of pool) {
    assert.ok(!isCoreAbility(id), `${id} is an Elemental core`);
    const fx = ABILITIES[id].fx;
    assert.ok(fx.some((f) => (f.type && g.types.includes(f.type)) || f.cat === style || f.stat === style), `${id} suits nothing about it`);
  }
  const j = journeyWith([g]);
  const m = j.party[0];
  const price = drawPrice(m), before = j.gold;
  const r = wildDraw(j, m.uid);
  assert.ok(r.ok, r.reason);
  assert.ok(pool.includes(r.to), 'it drew from the pool');
  assert.equal(j.gold, before - price);
  // a second draw asks again and can land elsewhere
  const second = wildDraw(j, m.uid);
  assert.ok(second.ok, second.reason);
  assert.equal(j.gold, before - price - drawPrice(m));
});

test('an Elemental keeps its core in the first slot, and gold is required', () => {
  const g = makeElemental(gen('emberox'), 'fire', makeRng('e'));
  assert.ok(isCoreAbility(g.ability));
  const j = journeyWith([g]);
  assert.match(rookeryBlock(j.party[0], 'swap'), /Elemental/);
  assert.equal(swapPassive(j, j.party[0].uid).ok, false);
  assert.equal(wildDraw(j, j.party[0].uid).ok, false);
  assert.equal(j.party[0].genome.ability, g.ability, 'and neither one moved it');

  const poor = journeyWith([gen('pufflet')], 10);
  const r = swapPassive(poor, poor.party[0].uid);
  assert.equal(r.ok, false);
  assert.match(r.reason, /gold/);
});

test('a second slot is bought once, and the engine fights with both passives', () => {
  const j = journeyWith([gen('emberox')]);
  const m = j.party[0];
  assert.equal(m.genome.ability2, undefined, 'one slot until it is bought');
  const price = secondSlotPrice();
  assert.equal(price, ROOKERY.secondSlot);
  const before = j.gold;
  const r = openSecondSlot(j, m.uid);
  assert.ok(r.ok, r.reason);
  assert.equal(j.gold, before - price);
  assert.ok(m.genome.ability2 && m.genome.ability2 !== m.genome.ability);
  assert.match(openSecondSlot(j, m.uid).reason, /already/);

  // both passives reach the battle: a creature with two type boosts hits harder than with either alone
  const plain = makeBattler(gen('pufflet'), 50, { ability: 'lucky_streak' });
  const one = makeBattler(gen('emberox'), 50, { ability: 'fire_affinity' });
  const two = makeBattler(gen('emberox'), 50, { ability: 'fire_affinity', ability2: 'fire_zeal' }); // both lift Fire at any HP
  const hit = (u) => calcDamage(u, plain, getMove('fire_stream'), 1, 1, false);
  assert.ok(hit(two) > hit(one), `${hit(two)} vs ${hit(one)}`);
  // and a defensive second passive is read too
  const soft = makeBattler(gen('pufflet'), 50, { ability: 'lucky_streak' });
  const armoured = makeBattler(gen('pufflet'), 50, { ability: 'lucky_streak', ability2: 'fire_proof' });
  assert.ok(calcDamage(one, armoured, getMove('fire_stream'), 1, 1, false) < calcDamage(one, soft, getMove('fire_stream'), 1, 1, false));
});

test('an Elemental can buy a second slot beside its core, and turn that one over', () => {
  const elem = journeyWith([makeElemental(gen('emberox'), 'fire', makeRng('e2'))]);
  const m = elem.party[0];
  const core = m.genome.ability;
  assert.ok(isCoreAbility(core));
  assert.equal(rookeryBlock(m, 'second'), null, 'the second slot is open to it');
  const bought = openSecondSlot(elem, m.uid);
  assert.ok(bought.ok, bought.reason);
  assert.equal(m.genome.ability, core, 'the core did not move');
  assert.ok(m.genome.ability2 && !isCoreAbility(m.genome.ability2), 'and what it bought is no core');

  // the bought slot behaves like anyone else's: it can be swapped and drawn over, the core cannot
  const swapped = swapPassive(elem, m.uid, null, 2);
  assert.ok(swapped.ok, swapped.reason);
  assert.equal(m.genome.ability, core);
  const drawn = wildDraw(elem, m.uid, 2);
  assert.ok(drawn.ok, drawn.reason);
  assert.ok(!isCoreAbility(m.genome.ability2));
  assert.equal(m.genome.ability, core, 'still itself');
  assert.match(rookeryBlock(m, 'draw', 1), /Elemental/, 'the first slot is still its own');

  // and both reach the battle
  const both = makeBattler(m.genome, 50);
  assert.equal(both.ability, core);
  assert.equal(both.ability2, m.genome.ability2);
});

test('the second slot survives a save round trip', () => {

  const j = journeyWith([gen('glacub')]);
  assert.ok(openSecondSlot(j, j.party[0].uid).ok);
  const second = j.party[0].genome.ability2;
  const clean = validateGenome(JSON.parse(JSON.stringify(j.party[0].genome)));
  assert.equal(clean.ability2, second, 'validation keeps a bought slot');
  const nonsense = validateGenome({ ...JSON.parse(JSON.stringify(j.party[0].genome)), ability2: 'not_a_passive' });
  assert.equal(nonsense.ability2, undefined, 'and drops a slot that names nothing');
  const doubled = validateGenome({ ...JSON.parse(JSON.stringify(j.party[0].genome)), ability2: j.party[0].genome.ability });
  assert.equal(doubled.ability2, undefined, 'and refuses the same passive twice');
});
