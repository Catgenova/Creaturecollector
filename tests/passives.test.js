import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID, SPECIES } from '../src/data/species.js';
import { ABILITIES, ABILITY_IDS, DATA_ABILITY_IDS, abilityFx, describeFx } from '../src/data/abilities.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, moveEffectiveness, activeOf, PASSIVE_KINDS } from '../src/battle/engine.js';

const mk = (id, ab, level = 50, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv-${id}`)), level, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed }).state;
const play = (st, ma, mb) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const dmg = (user, target, moveId) => calcDamage(user, target, getMove(moveId), moveEffectiveness(getMove(moveId), target, user), 1, false);

test('data-driven passives use only kinds the engine interprets, read in the game\'s own words, and every one is carried by some species', () => {
  assert.ok(DATA_ABILITY_IDS.length >= 62, `${DATA_ABILITY_IDS.length} data passives`);
  const names = new Set();
  for (const id of ABILITY_IDS) { assert.ok(!names.has(ABILITIES[id].name), `duplicate name ${ABILITIES[id].name}`); names.add(ABILITIES[id].name); }
  for (const id of DATA_ABILITY_IDS) {
    const a = ABILITIES[id];
    assert.ok(a.fx.length >= 1, id);
    for (const f of a.fx) { assert.ok(PASSIVE_KINDS.includes(f.k), `${id}: unknown kind ${f.k}`); assert.ok(describeFx(f).length > 8, `${id}: ${f.k} has no words`); }
    assert.ok(a.desc.endsWith('.') && !/undefined|NaN|\[object/.test(a.desc), `${id}: ${a.desc}`);
  }
  const used = new Set(); for (const s of SPECIES) for (const ab of s.abilities) used.add(ab);
  for (const id of DATA_ABILITY_IDS) assert.ok(used.has(id), `${id} is carried by no species`);
  assert.deepEqual(abilityFx('nope', 'typeBoost'), []);
  assert.deepEqual(abilityFx('grit', 'typeBoost'), [], 'hand-written passives carry no entries');
});

test('type affinities and surges lift a type\'s moves; resists soften them; absorbs heal or lift a stat', () => {
  const foe = mk('pufflet', 'lucky_streak');
  const plain = mk('emberox', 'lucky_streak'), kindled = mk('emberox', 'fire_affinity'), grave = mk('emberox', 'ghost_heart');
  const base = dmg(plain, foe, 'cinder');
  assert.ok(dmg(kindled, foe, 'cinder') > base && dmg(kindled, foe, 'cinder') <= Math.ceil(base * 1.21), `${dmg(kindled, foe, 'cinder')} vs ${base}`);
  assert.equal(dmg(kindled, foe, 'bump'), dmg(plain, foe, 'bump'), 'other types unchanged');
  const ghostly = mk('glacub', 'lucky_streak'); // not a Normal type, which Ghost moves cannot touch
  assert.equal(dmg(grave, ghostly, 'phantom_claw'), dmg(plain, ghostly, 'phantom_claw'), 'a surge waits for low HP');
  const hurt = { ...grave, hp: Math.floor(grave.maxHp / 3) };
  assert.ok(dmg(plain, ghostly, 'phantom_claw') >= 5, 'a measurable hit');
  assert.ok(dmg(hurt, ghostly, 'phantom_claw') > dmg(plain, ghostly, 'phantom_claw') * 1.3, `${dmg(hurt, ghostly, 'phantom_claw')} vs ${dmg(plain, ghostly, 'phantom_claw')}`);
  const proof = mk('pufflet', 'fire_proof');
  assert.ok(dmg(plain, proof, 'cinder') < base * 0.7 && dmg(plain, proof, 'cinder') >= Math.floor(base * 0.6) - 1);
  assert.equal(dmg(plain, proof, 'bump'), dmg(plain, foe, 'bump'));
  // absorbs: immune, and healed or lifted
  const eater = mk('pufflet', 'ember_eater', 50, { moves: ['brace'] });
  assert.equal(moveEffectiveness(getMove('cinder'), eater), 0);
  let st = fight(mk('emberox', 'lucky_streak', 50, { moves: ['cinder'] }), eater);
  st.sides[1].party[0].hp = 10;
  let r = play(st, 0, 0);
  const heal = r.events.find((e) => e.t === 'heal' && e.side === 1);
  assert.ok(heal && heal.why === 'absorb' && heal.amount === Math.floor(eater.maxHp / 4), JSON.stringify(heal));
  assert.ok(!r.events.some((e) => e.t === 'damage'));
  const sipper = mk('pufflet', 'sap_drinker', 50, { moves: ['brace'] });
  st = fight(mk('emberox', 'lucky_streak', 50, { moves: ['vine_lash'] }), sipper);
  r = play(st, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'immune' && e.side === 1));
  assert.equal(activeOf(r.state, 1).stages.melee, 1);
});

test('style, flag, power-band and effect boosts lift the right moves', () => {
  const foe = mk('pufflet', 'lucky_streak');
  const plain = mk('emberox', 'lucky_streak');
  const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.02) + 1;
  assert.ok(near(dmg(mk('emberox', 'heavy_blows'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.15));
  assert.equal(dmg(mk('emberox', 'heavy_blows'), foe, 'cinder'), dmg(plain, foe, 'cinder'), 'ranged untouched by a melee boost');
  assert.ok(near(dmg(mk('emberox', 'deep_focus'), foe, 'flare'), dmg(plain, foe, 'flare'), 1.15));
  assert.ok(near(dmg(mk('emberox', 'tough_claws'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.25));
  assert.equal(dmg(mk('emberox', 'tough_claws'), foe, 'cinder'), dmg(plain, foe, 'cinder'));
  assert.ok(near(dmg(mk('emberox', 'loud_voice'), foe, 'bellow'), dmg(plain, foe, 'bellow'), 1.3));
  assert.ok(near(dmg(mk('emberox', 'power_hitter'), foe, 'reckless_charge'), dmg(plain, foe, 'reckless_charge'), 1.2));
  assert.equal(dmg(mk('emberox', 'power_hitter'), foe, 'bump'), dmg(plain, foe, 'bump'));
  assert.ok(near(dmg(mk('emberox', 'barrage'), foe, 'flurry'), dmg(plain, foe, 'flurry'), 1.3));
  assert.ok(near(dmg(mk('emberox', 'leech'), foe, 'sap_drain'), dmg(plain, foe, 'sap_drain'), 1.3));
});
