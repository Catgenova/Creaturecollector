// The broker: gold for word of a creature the Dex has never seen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WILD_SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { newJourney } from '../src/game/journey.js';
import { BROKER, brokerOffers, buyHint, dexStatus, dexCounts, dexSeen } from '../src/game/dex.js';

const blankSave = () => ({ dex: { seen: {}, caught: {}, morphs: {} }, collection: [], totals: { battles: 0, captures: 0, fusions: 0, journeys: 0, champions: 0 } });
const richJourney = (seed = 'broker', gold = 50000) => { const j = newJourney(seed); j.gold = gold; return j; };

test('the broker offers three unseen creatures and says where each lives', () => {
  const save = blankSave(), j = richJourney();
  const offers = brokerOffers(save, j);
  assert.equal(offers.length, BROKER.offers);
  const ids = new Set(offers.map((o) => o.species.id));
  assert.equal(ids.size, BROKER.offers, 'no two offers are the same creature');
  for (const o of offers) {
    assert.equal(dexStatus(save, o.species.id), 'unseen');
    assert.equal(o.cost, BROKER.cost);
    assert.ok(o.where.region.length > 3 && o.where.types.length >= 1);
  }
  assert.deepEqual(brokerOffers(save, j).map((o) => o.species.id), offers.map((o) => o.species.id), 'the list holds still until you buy');
});

test('buying a word costs gold, marks the Dex and changes the list', () => {
  const save = blankSave(), j = richJourney();
  const first = brokerOffers(save, j)[0];
  const before = dexCounts(save).seen, gold = j.gold;
  const r = buyHint(save, j, first.species.id);
  assert.ok(r.ok, r.reason);
  assert.equal(j.gold, gold - BROKER.cost);
  assert.equal(dexStatus(save, first.species.id), 'seen');
  assert.equal(dexCounts(save).seen, before + 1);
  assert.equal(j.stats.hints, 1);
  assert.match(buyHint(save, j, first.species.id).reason, /already seen/);
  const next = brokerOffers(save, j);
  assert.ok(!next.some((o) => o.species.id === first.species.id), 'and it drops off the list');
});

test('the broker refuses what it cannot sell, and runs dry when the Dex is full', () => {
  const save = blankSave(), j = richJourney();
  const notOffered = WILD_SPECIES.find((s) => !brokerOffers(save, j).some((o) => o.species.id === s.id));
  assert.match(buyHint(save, j, notOffered.id).reason, /list/);
  assert.equal(buyHint(save, j, 'no_such_creature').ok, false);
  const poor = richJourney('poor', 10);
  assert.match(buyHint(blankSave(), poor, brokerOffers(blankSave(), poor)[0].species.id).reason, /gold/);

  const full = blankSave();
  for (const s of WILD_SPECIES) dexSeen(full, { species: s.id });
  assert.deepEqual(brokerOffers(full, j), []);
});
