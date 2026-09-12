// Batch eight: field craft. Coming in, holding the field, going out, and what touching it costs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ABILITIES } from '../src/data/abilities.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv8-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv8') => createBattle({ sides: [{ name: 'A', party: Array.isArray(a) ? a : [a] }, { name: 'B', party: Array.isArray(b) ? b : [b] }], seed });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);

test('entry passives read in accuracy and evasion, not raw stage keys', () => {
  for (const id of ['dust_veil', 'skulk', 'sharpening']) {
    assert.ok(/accuracy|evasion/.test(ABILITIES[id].desc), `${id}: ${ABILITIES[id].desc}`);
    assert.ok(!/\bacc\b|\beva\b/.test(ABILITIES[id].desc), `${id} leaked a stage key`);
  }
  const dust = fight(mk('pufflet', 'dust_veil'), mk('thornwick', 'lucky_streak')).state;
  assert.equal(activeOf(dust, 1).stages.acc, -1);
  assert.equal(activeOf(fight(mk('pufflet', 'skulk'), mk('thornwick', 'lucky_streak')).state, 0).stages.eva, 1);
  const bearer = activeOf(fight(mk('pufflet', 'standard_bearer'), mk('thornwick', 'lucky_streak')).state, 0);
  assert.deepEqual([bearer.stages.meleeDef, bearer.stages.rangedDef, bearer.stages.magicDef], [1, 1, 1]);
  const herald = fight(mk('pufflet', 'herald'), mk('thornwick', 'lucky_streak')).state;
  assert.equal(activeOf(herald, 0).stages.spe, 1);
  assert.equal(activeOf(herald, 1).stages.spe, -1);
});

test('Field Dressing patches up on the way out, Trophy Rack on a knockout', () => {
  const hurt = (ab) => { const b = mk('pufflet', ab, { moves: ['brace'] }); b.hp = Math.floor(b.maxHp / 2); return b; };
  const dressed = fight([hurt('field_dressing'), mk('skinkit', 'lucky_streak', { moves: ['brace'] })], mk('thornwick', 'lucky_streak', { moves: ['brace'] })).state;
  const out = step(dressed, [{ type: 'switch', index: 1 }, { type: 'move', index: 0 }]).state;
  const patched = out.sides[0].party[0];
  assert.ok(patched.hp > Math.floor(patched.maxHp / 2), 'it left the field healthier than it stood on it');

  const killer = mk('oakfist', 'trophy_rack', { moves: ['all_out_brawl'] });
  killer.hp = Math.floor(killer.maxHp / 2);
  const frail = () => { const b = mk('pufflet', 'lucky_streak', { moves: ['brace'] }); b.stats.hp = 30; b.maxHp = 30; b.hp = 30; return b; };
  const after = play(fight(killer, [frail(), frail()], 'trophy').state).state;
  assert.ok(after.sides[1].party[0].fainted, 'the foe went down');
  assert.ok(activeOf(after, 0).hp > Math.floor(killer.maxHp / 2), 'and the trophy paid for it');
});

test('Grasping Vines drags an attacker to a halt on contact', () => {
  let caught = 0, tries = 0;
  for (let k = 0; k < 40; k++) { // one contact in four
    const r = play(fight(mk('thornwick', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'grasping_vines', { moves: ['brace'] }), `vines${k}`).state);
    const spe = activeOf(r.state, 0).stages.spe;
    tries++;
    if (spe) { caught++; assert.equal(spe, -2, 'both stages of Speed at once'); }
  }
  assert.ok(caught > 0 && caught < tries, `the vines caught ${caught} of ${tries} attackers`);
});
