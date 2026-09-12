// Titans: the authored thing each region grew around, above the Warden who guards its door.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TITAN, TITANS, TITAN_BY_BIOME, titanOf, titanLevel, titanMoves, titanField, titanPrize, titanWaiting, titansLeft } from '../src/game/titan.js';
import { BIOME_ORDER, REGIONS } from '../src/game/world.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { ABILITIES } from '../src/data/abilities.js';
import { CHARMS, WARDEN_CHARMS } from '../src/data/charms.js';
import { WEATHER, TERRAIN } from '../src/data/field.js';
import { newJourney, challengeTitan, buildJourneyBattle, applyJourneyBattle } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeRng } from '../src/core/rng.js';
import { activeOf, sideCond } from '../src/battle/engine.js';

const ready = (biome, level = 90) => {
  const j = newJourney(`titan-${biome}`);
  j.phase = 'walk';
  j.badges = [biome];
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID.kirinth, makeRng('p1')), level, 'u0'), makeMember(speciesGenome(SPECIES_BY_ID.craggon, makeRng('p2')), level, 'u1')];
  return j;
};

test('there is one Titan per region, each with a name, a title and a line', () => {
  assert.equal(TITANS.length, BIOME_ORDER.length);
  const names = new Set(), species = new Set();
  for (const t of TITANS) {
    assert.ok(BIOME_ORDER.includes(t.biome), t.biome);
    assert.ok(t.name && t.title && t.line.length > 20, t.name);
    assert.ok(!names.has(t.name), `${t.name} twice`);
    names.add(t.name);
    const sp = SPECIES_BY_ID[t.species], esc = SPECIES_BY_ID[t.escort];
    assert.ok(sp && esc, `${t.name}: ${t.species}/${t.escort}`);
    assert.equal(sp.clade, t.biome, `${t.name} is not of its own class`);
    assert.equal(esc.clade, t.biome);
    assert.notEqual(t.species, t.escort);
    species.add(t.species);
    assert.ok(getMove(t.tactic) && getMove(t.setter), `${t.name}: ${t.tactic}/${t.setter}`);
    assert.ok(ABILITIES[sp.abilities[0]] && ABILITIES[sp.abilities[1]]);
  }
  assert.equal(species.size, TITANS.length, 'no two Titans are the same creature');
  assert.equal(Object.keys(TITAN_BY_BIOME).length, TITANS.length);
});

test('a Titan fights well over its Warden, with an escort at its heel', () => {
  for (const b of BIOME_ORDER) {
    const lvl = titanLevel(b);
    assert.equal(lvl, Math.min(TITAN.cap, REGIONS[b].level + TITAN.over), b);
    assert.ok(lvl > REGIONS[b].level, `${b}: ${lvl} vs warden ${REGIONS[b].level}`);
    const j = ready(b);
    const t = titanOf(j, b);
    assert.equal(t.foes.length, 2);
    assert.equal(t.foes[0].level, lvl);
    assert.equal(t.foes[1].level, Math.max(5, lvl - TITAN.escortUnder));
    assert.equal(t.foes[0].genome.name, TITAN_BY_BIOME[b].name, 'it goes by its own name');
    assert.ok(t.foes[0].ability && t.foes[0].ability2 && t.foes[0].ability !== t.foes[0].ability2, 'both slots filled');
    assert.equal(t.foes[0].moves.length, 4);
    assert.equal(new Set(t.foes[0].moves).size, 4, `${b} repeats a move`);
    for (const id of t.foes[0].moves) assert.ok(getMove(id), `${b}: ${id}`);
    assert.ok(t.foes[0].moves.includes(TITAN_BY_BIOME[b].tactic) && t.foes[0].moves.includes(TITAN_BY_BIOME[b].setter));
  }
});

test('a Titan brings its own weather or ground, and the greater charm of its region', () => {
  for (const b of BIOME_ORDER) {
    const f = titanField(b);
    if (f) assert.ok((f.weather && WEATHER[f.weather]) || (f.terrain && TERRAIN[f.terrain]), b);
    const prize = titanPrize(b);
    assert.ok(prize && CHARMS[prize] && CHARMS[prize].grade === 2, `${b}: ${prize}`);
    assert.equal(CHARMS[prize].from, WARDEN_CHARMS[b], 'the greater form of what its Warden hands out');
  }
});

test('it waits behind the badge, comes once, and pays out when it falls', () => {
  const j = newJourney('titan-run');
  assert.deepEqual(titansLeft(j), [], 'nothing before a badge');
  const biome = 'reptile';
  const armed = ready(biome);
  assert.ok(titanWaiting(armed, biome));
  assert.deepEqual(titansLeft(armed), [biome]);

  const enc = challengeTitan(armed, biome);
  assert.ok(enc && enc.kind === 'titan' && enc.foes.length === 2);
  assert.equal(enc.capturable, false, 'a Titan is not caught');
  assert.equal(challengeTitan(armed, biome), null, 'and not queued twice');

  const built = buildJourneyBattle(armed);
  assert.equal(built.state.field.weather, titanField(biome).weather, 'the Scar opens bright');
  const boss = built.state.sides[1].party[0];
  assert.equal(boss.ability2 !== null && boss.ability2 !== undefined, true, 'it fights with both passives');
  assert.ok(boss.held, 'and a charm in hand');
  assert.deepEqual(boss.moves.map((m) => m.id), enc.foes[0].moves);

  // hand it a win and read the purse
  const state = built.state;
  for (const f of state.sides[1].party) { f.hp = 0; f.fainted = true; }
  state.winner = 0; state.phase = 'over';
  const goldBefore = armed.gold || 0;
  const { report } = applyJourneyBattle(armed, state);
  assert.equal(report.won, true);
  assert.equal(report.titan, biome);
  assert.ok(report.gold > 0 && armed.gold === goldBefore + report.gold, 'it paid');
  assert.equal(report.charm, titanPrize(biome));
  assert.equal(armed.bag[titanPrize(biome)], 1, 'the greater charm is in the bag');
  assert.equal(armed.stats.titans, 1);
  assert.equal(titanWaiting(armed, biome), false, 'and it does not come back this journey');
});

test('every Titan can actually be built and fought', () => {
  for (const b of BIOME_ORDER) {
    const j = ready(b);
    assert.ok(challengeTitan(j, b), b);
    const built = buildJourneyBattle(j);
    assert.equal(built.state.sides[1].party.length, 2, b);
    const boss = activeOf(built.state, 1);
    assert.ok(boss.moves.every((m) => m.pp > 0), `${b} has a move with no PP`);
    assert.ok(sideCond(built.state, 0), 'the sides are set up');
  }
});
