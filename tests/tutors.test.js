// Learning a move is a journey: the Market keeps the basics, each region's camp teaches its own three
// types once you hold its badge, and any camp can bring back a move a creature has outgrown.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { MOVES, getMove } from '../src/data/moves.js';
import { TYPE_LIST } from '../src/data/types.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { newJourney } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { MARKET, TUTOR_TYPES, isBasicMove, marketCatalogue, moveCost, tutorTypes, tutorCatalogue, tutorCost, buyTutorMove, buyMove, recallOptions, recallCost, recallMove, bagCount } from '../src/game/market.js';

function journeyWith(id, level = 40, gold = 60000) {
  const j = newJourney('tutors');
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID[id], makeRng(`t-${id}`)), level, 'u0')];
  j.gold = gold;
  return j;
}

test('the Market stocks the basics only, and says where the rest is taught', () => {
  const cat = marketCatalogue();
  assert.ok(cat.length > 100 && cat.length < MOVES.length / 2, `${cat.length} on the shelf`);
  for (const { move } of cat) assert.ok(isBasicMove(move), `${move.id} is not a basic`);
  const heavy = MOVES.find((m) => !m.signature && !isBasicMove(m));
  const j = journeyWith('emberox');
  const r = buyMove(j, heavy.id);
  assert.equal(r.ok, false);
  assert.match(r.reason, /tutor/);
  assert.equal(j.gold, 60000, 'and it took no gold');
});

test('every region teaches three types, every type is taught somewhere, and a tutor undercuts the Market', () => {
  const covered = new Set();
  for (const clade of Object.keys(TUTOR_TYPES)) {
    const types = tutorTypes(clade);
    assert.equal(types.length, 3, clade);
    for (const t of types) { assert.ok(TYPE_LIST.includes(t), `${clade} teaches ${t}`); covered.add(t); }
    const cat = tutorCatalogue(clade);
    assert.ok(cat.length > 15, `${clade} teaches only ${cat.length}`);
    for (const { move, cost } of cat) {
      assert.ok(types.includes(move.type), `${clade} sells a ${move.type} scroll`);
      assert.ok(!isBasicMove(move), `${move.id} is already on the Market shelf`);
      assert.ok(cost < moveCost(move), 'a tutor undercuts the Market');
      assert.equal(cost, tutorCost(move));
    }
  }
  assert.equal(covered.size, TYPE_LIST.length, 'every type is taught in some region');
});

test('a tutor wants the region badge, then sells the scroll', () => {
  const j = journeyWith('emberox');
  const { move, cost } = tutorCatalogue('draconic')[0];
  const denied = buyTutorMove(j, 'draconic-1', 'draconic', move.id);
  assert.equal(denied.ok, false);
  assert.match(denied.reason, /badge/);
  j.badges.push('draconic-1');
  const before = j.gold;
  const r = buyTutorMove(j, 'draconic-1', 'draconic', move.id);
  assert.ok(r.ok, r.reason);
  assert.equal(bagCount(j, move.id), 1);
  assert.equal(j.gold, before - cost);
  // and it will not sell what it does not teach
  const wrong = tutorCatalogue('fish').find((row) => !tutorTypes('draconic').includes(row.move.type));
  assert.equal(buyTutorMove(j, 'draconic-1', 'draconic', wrong.move.id).ok, false);
});

test('a camp recalls a move the creature has outgrown, for a fee that rises with level', () => {
  const j = journeyWith('emberox', 52);
  const m = j.party[0];
  const options = recallOptions(j, m.uid);
  assert.ok(options.length, 'a level 52 creature has passed more than four moves');
  for (const { move, level } of options) {
    assert.ok(level <= m.level, `${move.id} is learned at ${level}`);
    assert.ok(!m.moves.includes(move.id), `${move.id} is already known`);
  }
  assert.equal(recallCost(m), MARKET.recallBase + MARKET.recallPerLevel * m.level);
  const want = options[0].move.id, replaced = m.moves[0], before = j.gold;
  const r = recallMove(j, m.uid, want, 0);
  assert.ok(r.ok, r.reason);
  assert.equal(r.replaced, replaced);
  assert.ok(m.moves.includes(want) && !m.moves.includes(replaced));
  assert.equal(j.gold, before - recallCost(m));
  assert.equal(recallMove(j, m.uid, 'bump', 0).ok, false, 'it never knew that');
  const poor = journeyWith('emberox', 52, 10);
  assert.equal(recallMove(poor, poor.party[0].uid, recallOptions(poor, poor.party[0].uid)[0].move.id, 0).ok, false);
});
