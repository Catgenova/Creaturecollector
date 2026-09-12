// The team panel's numbers: what a party can hit, what hits it, and how its damage types split.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { TYPE_LIST, typeEffectiveness } from '../src/data/types.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { combatStyle } from '../src/data/damage.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeMember } from '../src/game/party.js';
import { teamCoverage, teamThreats, teamStyles, teamReport } from '../src/game/planner.js';

const member = (id, moves, level = 40) => {
  const m = makeMember(speciesGenome(SPECIES_BY_ID[id], makeRng(`plan-${id}`)), level, `u-${id}`);
  if (moves) m.moves = moves;
  return m;
};

test('coverage reads the best multiplier the party can bring against each type', () => {
  const party = [member('emberox', ['cinder']), member('glacub', ['frost_bite'])];
  const cover = teamCoverage(party);
  assert.equal(cover.length, TYPE_LIST.length);
  const grass = cover.find((c) => c.type === 'Grass');
  assert.ok(grass.best >= 2, 'Fire answers Grass');
  assert.equal(grass.move, getMove('cinder').name);
  const water = cover.find((c) => c.type === 'Water');
  assert.ok(water.best < 1, 'neither of them likes Water');

  // a party that knows only status moves can touch nothing
  const quiet = teamCoverage([member('emberox', ['brace'])]);
  assert.ok(quiet.every((c) => c.best === 0));
  assert.equal(teamReport([member('emberox', ['brace'])]).blind.length, TYPE_LIST.length);
});

test('threats count the party members a type hits for double, and styles split by the triangle', () => {
  const party = [member('emberox', ['cinder']), member('sprigget', ['seed_volley'])];
  for (const { type, count, names } of teamThreats(party)) {
    const wanted = party.filter((m) => typeEffectiveness(type, m.genome.types.filter(Boolean)) >= 2);
    assert.equal(count, wanted.length, type);
    assert.deepEqual(names, wanted.map((m) => m.genome.name));
  }
  const styles = teamStyles(party);
  assert.equal(Object.values(styles).reduce((a, b) => a + b, 0), party.length);
  for (const m of party) assert.ok(styles[combatStyle(m.genome.stats)] >= 1);
  assert.deepEqual(teamStyles([]), { melee: 0, ranged: 0, magic: 0 });
});

test('the report names the holes: what is strong, what is resisted, what cannot be touched', () => {
  const rep = teamReport([member('emberox', ['cinder', 'bump'])]);
  for (const t of rep.strong) assert.ok(typeEffectiveness('Fire', [t]) >= 2 || typeEffectiveness('Normal', [t]) >= 2, t);
  for (const t of rep.blind) assert.ok(!rep.strong.includes(t) && !rep.resisted.includes(t), t);
  // Normal cannot touch a Ghost at all, but the same creature's Fire move is neutral, so the party is not blind
  assert.equal(teamCoverage([member('pufflet', ['bump'])]).find((c) => c.type === 'Ghost').best, 0);
  assert.equal(rep.coverage.find((c) => c.type === 'Ghost').best, typeEffectiveness('Fire', ['Ghost']));
});
