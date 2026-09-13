// Ironman: a creature that falls is gone, storage is the only thing between a wipe and the end of the run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeRng } from '../src/core/rng.js';
import { makeMember } from '../src/game/party.js';
import { newJourney, chooseJourneyStarter, reapFallen, endJourney, fallenList, journeyOver, tryMove } from '../src/game/journey.js';
import { normalizeJourney } from '../src/game/save.js';

const genome = (seed) => speciesGenome(SPECIES[0], makeRng(seed));
const member = (uid, hp) => { const m = makeMember(genome(`g:${uid}`), 10, uid); m.hp = hp; return m; };
const run = (ironman, party, box = []) => {
  const j = newJourney('iron-seed', { ironman });
  chooseJourneyStarter(j, 0);
  j.party = party; j.box = box;
  return j;
};

test('a run is ordinary unless it was started as an Ironman', () => {
  const plain = newJourney('iron-seed');
  assert.equal(plain.ironman, false);
  assert.deepEqual(plain.fallen, []);
  assert.equal(plain.over, null);
  assert.equal(newJourney('iron-seed', { ironman: true }).ironman, true);
  // the flag is the only difference: the same seed still offers the same three starters
  assert.deepEqual(newJourney('iron-seed', { ironman: true }).starters.map((g) => g.name), plain.starters.map((g) => g.name));
});

test('nothing is reaped from an ordinary run', () => {
  const j = run(false, [member('a', 0), member('b', 12)]);
  const dead = reapFallen(j, null);
  assert.deepEqual(dead, []);
  assert.equal(j.party.length, 2, 'a fainted creature is still yours outside Ironman');
  assert.equal(j.party[0].hp, 0);
  assert.equal(journeyOver(j), false);
});

test('the fallen leave the party for good and are written down', () => {
  const j = run(true, [member('a', 0), member('b', 12), member('c', 0)]);
  const report = { foe: 'Herder Tobin' };
  const dead = reapFallen(j, report);
  assert.equal(dead.length, 2);
  assert.deepEqual(j.party.map((m) => m.uid), ['b'], 'only the standing are left');
  assert.equal(fallenList(j).length, 2);
  assert.equal(fallenList(j)[0].name, j.party[0].genome.name, 'a headstone keeps the name');
  assert.equal(fallenList(j)[0].foe, 'Herder Tobin', 'and what took it down');
  assert.ok(fallenList(j)[0].at, 'and where it happened');
  assert.deepEqual(report.fallen.map((f) => f.level), [10, 10], 'the report says who was lost');
  assert.equal(journeyOver(j), false, 'one still stands, so the run goes on');
});

test('a wiped party is not the end while storage still holds someone', () => {
  const j = run(true, [member('a', 0)], [member('boxed', 9)]);
  const report = {};
  reapFallen(j, report);
  assert.equal(journeyOver(j), false);
  assert.deepEqual(j.party.map((m) => m.uid), ['boxed'], 'the next one out of storage steps up');
  assert.equal(j.box.length, 0);
  assert.equal(report.steppedUp, j.party[0].genome.name);
  assert.equal(fallenList(j).length, 1);
});

test('nothing in the party and nothing in storage ends the run', () => {
  const j = run(true, [member('a', 0), member('b', 0)]);
  j.stats.steps = 431;
  j.badges = ['mammal', 'insect'];
  const report = { foe: 'Warden Marrow' };
  reapFallen(j, report);
  assert.equal(journeyOver(j), true);
  assert.equal(j.phase, 'over');
  assert.equal(j.over.badges, 2);
  assert.equal(j.over.steps, 431);
  assert.equal(j.over.fallen, 2);
  assert.equal(j.over.foe, 'Warden Marrow');
  assert.ok(j.over.at, 'the run records where it stopped');
  assert.equal(report.over, j.over);
  assert.equal(j.encounter, null, 'and it is not left mid-fight');
  assert.equal(tryMove(j, 'up').moved, false, 'a finished run does not walk');
});

test('the ending is written once and does not move afterwards', () => {
  const j = run(true, [member('a', 0)]);
  const first = endJourney(j, null);
  j.stats.steps = 9999;
  assert.equal(endJourney(j, null), first, 'a second ending is the first one');
  assert.notEqual(first.steps, 9999);
});

test('an Ironman run survives a save round trip, ending and all', () => {
  const j = run(true, [member('a', 0), member('b', 4)]);
  reapFallen(j, { foe: 'a wild thing' });
  const back = normalizeJourney(JSON.parse(JSON.stringify(j)));
  assert.equal(back.ironman, true, 'the mode rides along with the run');
  assert.equal(back.fallen.length, 1);
  assert.equal(back.fallen[0].foe, 'a wild thing');
  assert.ok(back.fallen[0].genome, 'a headstone keeps enough to draw the creature');

  const over = run(true, [member('a', 0)]);
  reapFallen(over, {});
  const ended = normalizeJourney(JSON.parse(JSON.stringify(over)));
  assert.ok(ended, 'a finished run is not thrown away for having an empty party');
  assert.equal(ended.phase, 'over');
  assert.equal(ended.over.fallen, 1);
  assert.equal(ended.party.length, 0, 'and it is not quietly restocked either');
});

test('an ordinary run still gets its empty party topped up from the box', () => {
  const j = run(false, [], [member('boxed', 7)]);
  const back = normalizeJourney(JSON.parse(JSON.stringify(j)));
  assert.equal(back.party.length, 1, 'the old mercy is untouched outside Ironman');
  assert.equal(back.ironman, false);
  const gone = run(false, [], []);
  assert.equal(normalizeJourney(JSON.parse(JSON.stringify(gone))), null, 'and an empty ordinary run is still discarded');
});
