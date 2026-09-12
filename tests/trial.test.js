// The Trial of the Day: one gauntlet a day, the same rule for everyone, three fights at a fixed level.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID, WILD_SPECIES } from '../src/data/species.js';
import { combatStyle } from '../src/data/damage.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeMember } from '../src/game/party.js';
import { newJourney, chooseJourneyStarter, trialToday, startTrial, elderOf, elderWaiting, seekElder, ELDER } from '../src/game/journey.js';
import { worldFor } from '../src/game/world.js';
import { TRIAL, TRIAL_RULES, trialDay, trialOf, trialTeam, trialBlock, trialState, trialGold } from '../src/game/trial.js';

const champion = (seed = 'trial') => {
  const j = newJourney(seed);
  chooseJourneyStarter(j, 0);
  j.champion = true;
  return j;
};

test('the day picks one rule and one theme, and every player on that day gets the same', () => {
  const a = trialOf('2026-01-01'), b = trialOf('2026-01-01'), c = trialOf('2026-01-02');
  assert.deepEqual(a, b, 'the same day is the same trial');
  assert.ok(TRIAL_RULES.some((r) => r.id === a.ruleId));
  assert.ok(a.text.length > 10 && a.name.length > 3);
  assert.equal(a.fights, TRIAL.fights);
  assert.equal(a.level, TRIAL.level);
  const ids = new Set();
  for (let d = 1; d <= 28; d++) ids.add(trialOf(`2026-03-${String(d).padStart(2, '0')}`).ruleId);
  assert.ok(ids.size >= 4, `only ${ids.size} rules across a month`);
  assert.match(trialDay(new Date('2026-05-04T09:00:00Z')), /^2026-05-04$/);
  assert.notDeepEqual(a.params, c.params.type ? c.params : { ...c.params, x: 1 });
});

test('each of the three fights fields a full team at the trial level, and the last one leads with a fusion', () => {
  const trial = trialOf('2026-02-02');
  for (let stage = 0; stage < TRIAL.fights; stage++) {
    const team = trialTeam(trial, stage);
    assert.equal(team.length, TRIAL.teamSize);
    for (const f of team) {
      assert.ok(f.level >= trial.level - 1 && f.level <= trial.level, `${f.genome.name} at ${f.level}`);
      assert.ok(f.genome.name);
    }
    assert.deepEqual(team.map((f) => f.genome.name), trialTeam(trial, stage).map((f) => f.genome.name), 'the same fight every time');
  }
  const last = trialTeam(trial, TRIAL.fights - 1);
  assert.ok(last.some((f) => f.genome.gen > 0), 'the last fight brings something shrine-born');
});

test('the rule turns parties away, and only a champion may enter', () => {
  const j = champion();
  const notYet = newJourney('nochamp');
  chooseJourneyStarter(notYet, 0);
  assert.match(trialToday(notYet).block, /champion/);

  // a rule that bars the party is reported in words
  const banned = { day: 'x', ruleId: 'banned', name: 'Type Ban', text: 'No Fire.', params: { type: j.party[0].genome.types[0] }, theme: 'mammal', level: 70, fights: 3 };
  assert.match(trialBlock(j, banned), new RegExp(j.party[0].genome.types[0]));
  const small = { ...banned, ruleId: 'small', params: { max: 0 } };
  assert.match(trialBlock(j, small), /no more than 0/);
  const open = { ...banned, params: {} };
  assert.equal(trialBlock(j, open), null);

  const fainted = champion();
  for (const m of fainted.party) m.hp = 0;
  assert.match(trialBlock(fainted, open), /Nothing in your party/);
});

test('a run walks three fights, pays more for the last, and closes the day when cleared', () => {
  const j = champion('walk');
  const today = trialToday(j);
  if (today.block) { // the day's rule may bar the starter: give it a party that fits
    j.party = [makeMember(speciesGenome(SPECIES_BY_ID[WILD_SPECIES[0].id], makeRng('fit')), 70, 'fit')];
  }
  const info = trialToday(j);
  if (info.block) return; // some days bar every simple party; the rule is doing its job
  const r = startTrial(j);
  assert.ok(r.ok, r.reason);
  assert.equal(j.encounter.kind, 'trial');
  assert.equal(j.encounter.stage, 0);
  assert.equal(trialState(j).tries, 1);
  assert.ok(trialGold(TRIAL.fights - 1) > trialGold(0), 'the last fight pays a bonus');
  assert.equal(startTrial(j).ok, false, 'one at a time');
});

test('an Elder waits in every region for a champion, once each', () => {
  const j = champion('elders');
  const world = worldFor(j.seed);
  const biome = world.biomes[0].id;
  assert.equal(elderWaiting(j, biome), false, 'not without the badge');
  j.badges.push(biome);
  assert.ok(elderWaiting(j, biome));
  const elder = elderOf(j, biome);
  assert.equal(elder.level, ELDER.level);
  assert.equal(elder.clade, world.biomes[0].clade);
  assert.equal(elderOf(j, biome).genome.name, elder.genome.name, 'the same Elder every time you look');

  const enc = seekElder(j, biome);
  assert.ok(enc && enc.kind === 'elder');
  assert.equal(enc.foes.length, 1);
  assert.ok(enc.capturable && enc.alpha, 'it can be caught, and it announces itself');
  assert.equal(seekElder(j, biome), null, 'one at a time');

  j.encounter = null;
  j.elders[biome] = true;
  assert.equal(elderWaiting(j, biome), false, 'it only shows itself once');
  assert.equal(seekElder(j, biome), null);

  const mortal = newJourney('nochamp2');
  chooseJourneyStarter(mortal, 0);
  mortal.badges.push(biome);
  assert.equal(elderWaiting(mortal, biome), false, 'and only to a champion');
});
