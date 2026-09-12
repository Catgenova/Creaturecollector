import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { ABILITY_IDS, ABILITIES, DATA_ABILITY_IDS } from '../src/data/abilities.js';
import { isCoreAbility } from '../src/data/elements.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, moveEffectiveness, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv4-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv4') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma, mb) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('the whole passive pool is spread across the roster', () => {
  assert.equal(ABILITY_IDS.length, 419);
  assert.ok(DATA_ABILITY_IDS.length >= 363);
  const use = {};
  for (const s of SPECIES) for (const ab of s.abilities) use[ab] = (use[ab] || 0) + 1;
  const ordinary = ABILITY_IDS.filter((id) => !isCoreAbility(id));
  for (const id of ordinary) assert.ok(use[id] >= 3, `${id} is carried by ${use[id] || 0} species`);
  const counts = ordinary.map((id) => use[id]);
  assert.ok(Math.max(...counts) <= 12, `most carried: ${Math.max(...counts)}`);
  for (const s of SPECIES) assert.ok(s.abilities[0] !== s.abilities[1] && s.abilities.every((a) => ABILITIES[a] && !isCoreAbility(a)), s.id);
});

test('combined passives: Dry Skin drinks Water and fears Fire, Fluffy halves contact and doubles Fire, Water Bubble, Punk Rock, Purifying Salt, Glass Cannon', () => {
  const plain = mk('emberox', 'lucky_streak'), foe = mk('pufflet', 'lucky_streak');
  const dry = mk('pufflet', 'dry_skin');
  assert.equal(moveEffectiveness(getMove('squirt'), dry), 0);
  assert.ok(near(dmg(plain, dry, 'cinder'), dmg(plain, foe, 'cinder'), 1.25));
  const fluffy = mk('pufflet', 'fluffy');
  assert.ok(near(dmg(plain, fluffy, 'bump'), dmg(plain, foe, 'bump'), 0.5));
  assert.ok(near(dmg(plain, fluffy, 'cinder'), dmg(plain, foe, 'cinder'), 2));
  const bubble = mk('emberox', 'water_bubble');
  assert.ok(near(dmg(bubble, foe, 'squirt'), dmg(plain, foe, 'squirt'), 1.5));
  assert.ok(near(dmg(plain, mk('pufflet', 'water_bubble'), 'cinder'), dmg(plain, foe, 'cinder'), 0.5));
  const r = play(fight(mk('emberox', 'lucky_streak', { moves: ['ghostflame'] }), mk('pufflet', 'water_bubble', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).status, null, 'no burn through the bubble');
  const punk = mk('emberox', 'punk_rock');
  assert.ok(near(dmg(punk, foe, 'bellow'), dmg(plain, foe, 'bellow'), 1.3));
  assert.ok(near(dmg(plain, mk('pufflet', 'punk_rock'), 'bellow'), dmg(plain, foe, 'bellow'), 0.5));
  const salt = play(fight(mk('emberox', 'lucky_streak', { moves: ['numb_pulse'] }), mk('pufflet', 'purifying_salt', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(salt.state, 1).status, null);
  assert.ok(near(dmg(plain, mk('pufflet', 'purifying_salt'), 'cold_lick', 1), dmg(plain, foe, 'cold_lick', 1), 0.5) || dmg(plain, foe, 'cold_lick', 1) <= 2);
  const cannon = mk('emberox', 'glass_cannon');
  assert.ok(near(dmg(cannon, foe, 'bump'), dmg(plain, foe, 'bump'), 1.5));
  assert.ok(near(dmg(plain, mk('pufflet', 'glass_cannon'), 'bump'), dmg(plain, foe, 'bump'), 1 / 0.7));
});

test('entry combinations and the last variants: Intimidating Bulk, Sweet Scent, Trophy Hunter, Spore Bearer', () => {
  const { state } = fight(mk('emberox', 'intimidating_bulk'), mk('pufflet', 'lucky_streak'));
  assert.equal(activeOf(state, 0).stages.meleeDef, 1);
  assert.equal(activeOf(state, 1).stages.melee, -1);
  const { state: s2 } = fight(mk('emberox', 'sweet_scent'), mk('pufflet', 'lucky_streak'));
  assert.equal(activeOf(s2, 1).stages.eva, -1);
  const f = fight(mk('emberox', 'trophy_hunter', { moves: ['bump'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }));
  f.state.sides[1].party[0].hp = 1; f.state.sides[0].party[0].hp = 10;
  const r = play(f.state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.spe, 1);
  assert.ok(activeOf(r.state, 0).hp > 10);
  const r2 = play(fight(mk('emberox', 'lucky_streak', { moves: ['drowse_dust'] }), mk('pufflet', 'spore_bearer', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r2.state, 1).status, null, 'Overcoat half of Spore Bearer');
});
