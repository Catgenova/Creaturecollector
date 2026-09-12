// Trainers with a way of fighting and something of their own to say, and rematches that come up to
// meet the party that beat them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { combatStyle } from '../src/data/damage.js';
import { worldFor, PERSONALITIES, PERSONALITY_IDS, WARDEN_PROFILES, BIOME_ORDER, REGIONS } from '../src/game/world.js';
import { newJourney, chooseJourneyStarter, talkTo, acceptChallenge, rematchLevel, rematchTeam } from '../src/game/journey.js';

test('every trainer has a personality that leans their team, and every Warden a stated way of fighting', () => {
  const world = worldFor('personality');
  const seen = new Set();
  for (const t of world.trainers) {
    assert.ok(t.personality && t.tag && t.rematchLine, `${t.id} has no personality`);
    const person = Object.values(PERSONALITIES).find((p) => p.name === t.personality);
    assert.ok(person, t.personality);
    seen.add(t.personality);
    const leaning = t.team.filter((m) => combatStyle(m.genome.stats) === t.style).length;
    assert.ok(leaning >= 1, `${t.id} (${t.personality}) has nothing of its own style`);
  }
  assert.ok(seen.size >= 6, `only ${seen.size} personalities across the map`);
  assert.equal(PERSONALITY_IDS.length, Object.keys(PERSONALITIES).length);

  for (const clade of BIOME_ORDER) {
    const profile = WARDEN_PROFILES[clade];
    assert.ok(profile && profile.motto && profile.after && profile.rematch, `${clade} Warden has no profile`);
    assert.ok(['melee', 'ranged', 'magic'].includes(profile.theme), clade);
    const wd = world.wardens[clade];
    assert.equal(wd.line, profile.motto);
    assert.equal(wd.theme, profile.theme);
    assert.equal(wd.name, REGIONS[clade].warden);
    const onTheme = wd.team.filter((m) => combatStyle(m.genome.stats) === profile.theme).length;
    assert.ok(onTheme >= 2, `${clade} Warden fields ${onTheme} of their own style`);
  }
});

test('a beaten trainer offers a rematch once your team has outgrown theirs, at your level', () => {
  const j = newJourney('rematch');
  chooseJourneyStarter(j, 0);
  const world = worldFor(j.seed);
  const t = world.trainers[0];
  j.beaten[t.id] = true;

  // a party at their level has nothing to prove
  for (const m of j.party) m.level = t.team[0].level;
  const early = talkTo(j, t.id);
  assert.equal(early.rematch, false);
  assert.equal(early.canFight, false);
  assert.equal(acceptChallenge(j, t.id), null);

  // a stronger party gets the offer, and the trainer comes up to meet it
  for (const m of j.party) m.level = t.team[0].level + 20;
  const later = talkTo(j, t.id);
  assert.ok(later.rematch && later.canFight);
  assert.ok(later.text.includes(t.rematchLine), later.text);
  assert.equal(rematchLevel(j, t.team[0].level), Math.min(100, t.team[0].level + 18));
  const foes = rematchTeam(j, t);
  assert.ok(foes.every((f, i) => f.level >= t.team[i].level), 'nobody comes down for a rematch');
  const enc = acceptChallenge(j, t.id);
  assert.ok(enc && enc.rematch);
  assert.equal(enc.foes.length, t.team.length);
  assert.ok(enc.foes[0].level > t.team[0].level);
});
