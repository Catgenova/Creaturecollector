// The Trophy Hall: shelf room bought with gold, and a dyer who cannot be told what to make.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { MORPH_IDS } from '../src/creature/palette.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { newJourney } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { loadSave, recordCollection } from '../src/game/save.js';
import { HALL, hallOf, nextTierCost, buyTier, setTrophy, trophies, trophyKey, morphBlock, drawMorph } from '../src/game/hall.js';

const blankSave = () => ({ dex: { seen: {}, caught: {}, morphs: {} }, collection: [], totals: { battles: 0, captures: 0, fusions: 0, journeys: 0, champions: 0 }, hall: { tier: 0, slots: [] } });
function setup(gold = 200000) {
  const save = blankSave();
  const j = newJourney('hall');
  j.gold = gold;
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('h1')), 40, 'u0'), makeMember(speciesGenome(SPECIES_BY_ID.glacub, makeRng('h2')), 40, 'u1')];
  for (const m of j.party) recordCollection(save, m.genome);
  return { save, j };
}

test('a wing costs gold and buys three shelves, up to five wings', () => {
  const { save, j } = setup();
  assert.deepEqual(hallOf(save), { tier: 0, slots: [], room: 0 });
  assert.equal(nextTierCost(save), HALL.tierCost);
  const gold = j.gold;
  const r = buyTier(save, j);
  assert.ok(r.ok, r.reason);
  assert.equal(j.gold, gold - HALL.tierCost);
  assert.equal(hallOf(save).room, HALL.perTier);
  for (let k = 1; k < HALL.tiers; k++) assert.ok(buyTier(save, j).ok, `wing ${k + 1}`);
  assert.equal(hallOf(save).tier, HALL.tiers);
  assert.equal(nextTierCost(save), 0);
  assert.match(buyTier(save, j).reason, /grand/);
  const poor = setup(10);
  assert.match(buyTier(poor.save, poor.j).reason, /gold/);
});

test('putting a creature up is free, and the shelves fill and empty', () => {
  const { save, j } = setup();
  const key = trophyKey(j.party[0].genome);
  assert.match(setTrophy(save, key, true).reason, /wing/, 'nothing goes up before a wing exists');
  buyTier(save, j);
  assert.ok(setTrophy(save, key, true).ok);
  assert.equal(trophies(save).length, 1);
  assert.equal(trophies(save)[0].genome.name, j.party[0].genome.name);
  assert.ok(setTrophy(save, key, true).ok, 'putting the same one up twice does not double it');
  assert.equal(trophies(save).length, 1);
  assert.ok(setTrophy(save, key, false).ok);
  assert.equal(trophies(save).length, 0);
});

test('the dyer draws a colour that is never the one it had, and the hall survives a save round trip', () => {
  const { save, j } = setup();
  const m = j.party[0];
  const before = m.genome.morph || null, gold = j.gold;
  const r = drawMorph(j, m.uid);
  assert.ok(r.ok, r.reason);
  assert.notEqual(r.to, before);
  assert.ok(r.to === null || MORPH_IDS.includes(r.to));
  assert.equal(j.gold, gold - HALL.morphCost);
  assert.equal(m.genome.morph || null, r.to);
  const poor = setup(10);
  assert.match(drawMorph(poor.j, poor.j.party[0].uid).reason, /gold/);
  const shiny = setup();
  shiny.j.party[0].genome.shiny = true;
  assert.match(morphBlock(shiny.j.party[0]), /shiny/);

  buyTier(save, j);
  setTrophy(save, trophyKey(j.party[1].genome), true);
  const stored = JSON.stringify({ ...save, v: 1 });
  const round = loadSave({ getItem: () => stored, setItem: () => {} }); // the save reads from storage, so hand it one
  assert.equal(hallOf(round).tier, 1);
  assert.equal(hallOf(round).slots.length, 1);
});
