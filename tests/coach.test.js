// Stat coaching: gold moves a point of the spread, and never adds one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { STAT_KEYS } from '../src/data/damage.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome, validateGenome } from '../src/creature/genome.js';
import { statsAtLevel } from '../src/battle/stats.js';
import { newJourney } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { COACH, coachCost, coachLeft, coachDone, coachBlock, coachMember, statLabel } from '../src/game/coach.js';

const sum = (stats) => Object.values(stats).reduce((a, b) => a + b, 0);
function journeyWith(id = 'emberox', level = 40, gold = 200000) {
  const j = newJourney('coach');
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID[id], makeRng(`co-${id}`)), level, 'u0')];
  j.gold = gold;
  return j;
}

test('a session moves a point across and leaves the total exactly where it was', () => {
  const j = journeyWith();
  const m = j.party[0];
  const before = { ...m.genome.stats }, total = sum(before);
  const meleeBefore = statsAtLevel(m.genome, m.level).melee;
  assert.equal(coachCost(m), COACH.base + COACH.perLevel * m.level);
  assert.equal(coachLeft(m), COACH.sessions);
  const gold = j.gold;
  const r = coachMember(j, 'u0', 'magic', 'melee');
  assert.ok(r.ok, r.reason);
  assert.equal(j.gold, gold - coachCost(m));
  assert.ok(Math.abs(m.genome.stats.magic - (before.magic - COACH.step)) < 1e-9);
  assert.ok(Math.abs(m.genome.stats.melee - (before.melee + COACH.step)) < 1e-9);
  assert.ok(Math.abs(sum(m.genome.stats) - total) < 1e-9, 'the total is untouched');
  assert.ok(statsAtLevel(m.genome, m.level).melee > meleeBefore, 'and the creature feels it');
  assert.equal(coachDone(m), 1);
  assert.equal(coachLeft(m), COACH.sessions - 1);
});

test('coaching stops at ten sessions, at the floor and at the ceiling, and needs gold', () => {
  const j = journeyWith();
  for (let k = 0; k < COACH.sessions; k++) {
    const r = coachMember(j, 'u0', 'magic', 'melee');
    if (!r.ok) break;
  }
  const m = j.party[0];
  assert.ok(coachLeft(m) === 0 || m.genome.stats.magic <= COACH.floor + 1e-9);
  assert.ok(coachBlock(m, 'magic', 'melee'), 'it will not go on for ever');
  assert.ok(m.genome.stats.magic >= COACH.floor - 1e-9, 'nothing is starved past the floor');
  assert.ok(m.genome.stats.melee <= COACH.ceiling + 1e-9, 'and nothing is fattened past the ceiling');

  const fresh = journeyWith();
  assert.match(coachBlock(fresh.party[0], 'melee', 'melee'), /different/);
  assert.match(coachBlock(fresh.party[0], 'melee', 'nonsense'), /not a stat/);
  const poor = journeyWith('emberox', 40, 100);
  assert.match(coachMember(poor, 'u0', 'magic', 'melee').reason, /gold/);
  assert.equal(coachMember(fresh, 'nobody', 'magic', 'melee').ok, false);
});

test('a coached spread survives validation, and every stat has a readable name', () => {
  const j = journeyWith();
  coachMember(j, 'u0', 'magic', 'spe');
  const clean = validateGenome(JSON.parse(JSON.stringify(j.party[0].genome)));
  assert.ok(Math.abs(sum(clean.stats) - 1) < 1e-6, 'the spread still sums to one');
  assert.equal(clean.coached, 1, 'and the sessions are remembered');
  for (const k of STAT_KEYS) assert.ok(statLabel(k).length > 1, k);
});
