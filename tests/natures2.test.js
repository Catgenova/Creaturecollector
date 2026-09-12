// Turning a nature over at the shrine: gold, a random draw, and never the one it already had.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { NATURE_IDS, natureLabel, natureMul } from '../src/data/natures.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { statsAtLevel } from '../src/battle/stats.js';
import { newJourney, rerollNature, natureBlock, NATURE_REROLL } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';

function journeyWith(gold = 100000) {
  const j = newJourney('nature');
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('nat')), 45, 'u0')];
  j.gold = gold;
  return j;
}

test('the shrine draws a new nature for gold, and never the same one', () => {
  const j = journeyWith();
  const m = j.party[0];
  const before = m.genome.nature, gold = j.gold;
  const r = rerollNature(j, 'u0');
  assert.ok(r.ok, r.reason);
  assert.equal(r.from, before);
  assert.notEqual(r.to, before, 'a draw always moves');
  assert.ok(NATURE_IDS.includes(r.to));
  assert.equal(m.genome.nature, r.to);
  assert.equal(j.gold, gold - NATURE_REROLL);
  assert.equal(j.stats.natures, 1);
  assert.ok(natureLabel(r.to).length > 2);
});

test('the draw follows the journey, so reloading cannot fish for a better one', () => {
  const a = journeyWith(), b = journeyWith();
  const first = rerollNature(a, 'u0').to;
  assert.equal(rerollNature(b, 'u0').to, first, 'the same journey and the same count draw the same');
  const second = rerollNature(a, 'u0').to;
  assert.notEqual(second, first, 'and the next draw is its own');
});

test('a new nature moves the stats it should, and gold is required', () => {
  const j = journeyWith();
  const m = j.party[0];
  const before = statsAtLevel(m.genome, m.level);
  const r = rerollNature(j, 'u0');
  const after = statsAtLevel(m.genome, m.level);
  for (const k of Object.keys(after)) {
    if (k === 'hp') { assert.equal(after.hp, before.hp, 'HP is never touched'); continue; }
    const wanted = Math.round(before[k] / natureMul(r.from, k) * natureMul(r.to, k));
    assert.ok(Math.abs(after[k] - wanted) <= 2, `${k}: ${after[k]} vs about ${wanted}`);
  }
  const poor = journeyWith(10);
  assert.match(rerollNature(poor, 'u0').reason, /gold/);
  assert.equal(rerollNature(j, 'nobody').ok, false);
  assert.equal(natureBlock(j.party[0]), null);
});
