// Batch seven: the armory. New absorbs and immunities, style plating, status armour and thorns.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, moveEffectiveness, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv7-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv7') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('immunity with a price: Ash Lungs drinks no Fire but fears Water', () => {
  const attacker = mk('pufflet', 'lucky_streak');
  const lungs = mk('pufflet', 'ash_lungs'), bare = mk('pufflet', 'lucky_streak');
  assert.equal(moveEffectiveness(getMove('cinder'), lungs, attacker), 0, 'Fire does nothing');
  assert.ok(near(dmg(attacker, lungs, 'squirt'), dmg(attacker, bare, 'squirt'), 1.5), 'and Water bites harder');
  assert.equal(moveEffectiveness(getMove('cinder'), bare, attacker) > 0, true);
});

test('the new absorbs lift a stat: Sparring Partner takes a Fighting move as practice', () => {
  const r = play(fight(mk('mossbrute', 'lucky_streak', { moves: ['chop'] }), mk('pufflet', 'sparring_partner', { moves: ['brace'] })).state);
  const student = activeOf(r.state, 1);
  assert.equal(student.hp, student.maxHp, 'the Fighting move did nothing');
  assert.equal(student.stages.melee, 1, 'and taught it something');
});

test('plating and thorns: Turtle Up, Arrow Thorns, Prism Scale', () => {
  const bruiser = mk('thornwick', 'lucky_streak'), control = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(bruiser, mk('pufflet', 'turtle_up'), 'bump'), dmg(bruiser, control, 'bump'), 0.6));
  assert.ok(near(dmg(bruiser, mk('pufflet', 'prism_scale'), 'bump', 2), dmg(bruiser, control, 'bump', 2), 0.7));
  assert.ok(near(dmg(mk('pufflet', 'prism_scale'), control, 'bump', 0.5), dmg(control, control, 'bump', 0.5), 1.2));

  const seed = 'thorns';
  const back = (ab) => {
    const st = play(fight(mk('sprigget', 'lucky_streak', { moves: ['seed_volley'] }), mk('pufflet', ab, { moves: ['brace'] }), seed).state).state;
    return activeOf(st, 0).maxHp - activeOf(st, 0).hp;
  };
  assert.ok(back('arrow_thorns') > back('lucky_streak'), 'the volley came back');
});

test('status armour: Sealed Body takes nothing, Firm Footing keeps its feet', () => {
  const sealed = play(fight(mk('pufflet', 'lucky_streak', { moves: ['numb_pulse'] }), mk('pufflet', 'sealed_body', { moves: ['brace'] }), 'sealed').state).state;
  assert.equal(activeOf(sealed, 1).status, null);
  const footed = play(fight(mk('bramblit', 'lucky_streak', { moves: ['web_shot'] }), mk('pufflet', 'firm_footing', { moves: ['brace'] }), 'footing').state).state;
  assert.equal(activeOf(footed, 1).stages.spe, 0, 'Speed held');
  const slowed = play(fight(mk('bramblit', 'lucky_streak', { moves: ['web_shot'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }), 'footing').state).state;
  assert.ok(activeOf(slowed, 1).stages.spe < 0, 'the web works on anyone else');
});
