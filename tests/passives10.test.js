// Batches ten to fourteen: tempo, the party, sleight of hand and what a creature leaves behind.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { ABILITIES } from '../src/data/abilities.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv10-${id}`)), opts.level || 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv10') => createBattle({ sides: [{ name: 'A', party: Array.isArray(a) ? a : [a] }, { name: 'B', party: Array.isArray(b) ? b : [b] }], seed });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('tempo: the clock, the bag and the level gap', () => {
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('pufflet', 'lucky_streak');
  const late = mk('pufflet', 'slow_burn');
  late.battleTurn = 6;
  assert.ok(near(dmg(late, foe, 'bump'), dmg(plain, foe, 'bump'), 1.4));
  late.battleTurn = 2;
  assert.ok(near(dmg(late, foe, 'bump'), dmg(plain, foe, 'bump'), 1), 'not before its hour');
  const early = mk('pufflet', 'blitz');
  early.battleTurn = 1;
  assert.ok(near(dmg(early, foe, 'bump'), dmg(plain, foe, 'bump'), 1.35));

  const held = mk('pufflet', 'charm_bound', { held: 'fire_charm' });
  assert.ok(near(dmg(held, foe, 'bump'), dmg(plain, foe, 'bump'), 1.3), 'a charm in hand');
  assert.ok(near(dmg(mk('pufflet', 'charm_bound'), foe, 'bump'), dmg(plain, foe, 'bump'), 1), 'and nothing without one');
  assert.ok(near(dmg(mk('pufflet', 'bare_hands'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.3), 'bare hands the other way round');

  const small = mk('pufflet', 'giant_slayer', { level: 40 });
  const big = mk('pufflet', 'lucky_streak', { level: 60 });
  const evenFoe = mk('pufflet', 'lucky_streak', { level: 40 });
  const control = mk('pufflet', 'lucky_streak', { level: 40 });
  assert.ok(near(dmg(small, big, 'bump'), dmg(control, big, 'bump'), 1.4), 'harder up the ladder');
  assert.ok(near(dmg(small, evenFoe, 'bump'), dmg(control, evenFoe, 'bump'), 1), 'and nothing against an equal');

  const rally = mk('pufflet', 'formation');
  rally.avenging = false;
  assert.ok(near(dmg(rally, foe, 'bump'), dmg(plain, foe, 'bump'), 1.25));
  rally.avenging = true;
  assert.ok(near(dmg(rally, foe, 'bump'), dmg(plain, foe, 'bump'), 1), 'the formation is broken');
});

test('the party: a medic heals the bench, a last will pays out when it falls', () => {
  const hurt = (ab) => { const b = mk('skinkit', ab, { moves: ['brace'] }); b.hp = Math.floor(b.maxHp / 2); return b; };
  const medic = mk('pufflet', 'field_medic', { moves: ['brace'] });
  const before = hurt('lucky_streak');
  const st = play(fight([medic, before], mk('thornwick', 'lucky_streak', { moves: ['brace'] }), 'medic').state).state;
  assert.ok(st.sides[0].party[1].hp > Math.floor(before.maxHp / 2), 'the one waiting was looked after');

  const dying = mk('pufflet', 'last_will', { moves: ['brace'] });
  dying.stats.hp = 20; dying.maxHp = 20; dying.hp = 20;
  const bench = hurt('lucky_streak');
  const benchHp = bench.hp;
  const out = play(fight([dying, bench], mk('oakfist', 'lucky_streak', { moves: ['all_out_brawl'] }), 'will').state).state;
  assert.ok(out.sides[0].party[0].fainted, 'it fell');
  assert.ok(out.sides[0].party[1].hp > benchHp, 'and left the bench something');
});

test('sleight of hand: trades, thefts and a sickness handed over', () => {
  const tricky = mk('thornwick', 'power_trick');
  const before = { melee: tricky.stats.melee, meleeDef: tricky.stats.meleeDef };
  const st = fight(tricky, mk('pufflet', 'lucky_streak')).state;
  const after = activeOf(st, 0);
  assert.equal(after.stats.melee, before.meleeDef);
  assert.equal(after.stats.meleeDef, before.melee);

  const sick = mk('pufflet', 'hot_potato', { moves: ['brace'] });
  sick.status = 'psn';
  const swapped = fight(sick, mk('mossbrute', 'lucky_streak', { moves: ['brace'] })).state; // not a Poison type, so it can catch it
  assert.equal(activeOf(swapped, 0).status, null, 'it handed the poison over');
  assert.equal(activeOf(swapped, 1).status, 'psn');

  // the thief comes in after the foe has puffed itself up
  const thief = mk('pufflet', 'larceny', { moves: ['brace'] });
  const opener = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  let state = fight([opener, thief], mk('thornwick', 'lucky_streak', { moves: ['brace', 'bump'] }), 'theft').state;
  state = play(state).state; // the foe braces: its guards rise
  assert.ok(activeOf(state, 1).stages.meleeDef > 0);
  // it swings instead of bracing again, so what the thief takes stays taken
  state = step(state, [{ type: 'switch', index: 1 }, { type: 'move', index: 1 }]).state;
  assert.equal(activeOf(state, 1).stages.meleeDef, 0, 'the boast was taken');
  assert.ok(activeOf(state, 0).stages.meleeDef > 0, 'and worn by the thief');
});

test('seals and denials: no healing, no drinking, no touching, no missing', () => {
  const sealed = play(fight(mk('pufflet', 'sealed_well', { moves: ['brace'] }), mk('sprigget', 'lucky_streak', { moves: ['mend'] }), 'seal').state).state;
  assert.equal(activeOf(sealed, 1).hp, activeOf(sealed, 1).maxHp, 'it was at full HP and the heal failed anyway');
  const thirsty = mk('sprigget', 'lucky_streak', { moves: ['sap_drain'] });
  thirsty.hp = Math.floor(thirsty.maxHp / 2);
  const dry = play(fight(thirsty, mk('pufflet', 'hollow_blood', { moves: ['brace'] }), 'dry').state).state;
  assert.equal(activeOf(dry, 0).hp, Math.floor(thirsty.maxHp / 2), 'nothing to drink');

  const ghostly = play(fight(mk('pufflet', 'ghost_hands', { moves: ['bump'] }), mk('thornwick', 'caltrops', { moves: ['brace'] }), 'ghost').state).state;
  assert.equal(activeOf(ghostly, 0).hp, activeOf(ghostly, 0).maxHp, 'the thorns never met it');

  let hits = 0;
  for (let k = 0; k < 20; k++) {
    const dodgy = mk('thornwick', 'lucky_streak', { moves: ['brace'] });
    dodgy.stages.eva = 6;
    const r = play(fight(mk('pufflet', 'dead_eye', { moves: ['drowse_dust'] }), dodgy, `sure${k}`).state);
    if (!r.events.some((e) => e.t === 'miss')) hits++;
  }
  assert.equal(hits, 20, 'a dead eye does not miss');
});

test('caps, certain crits, sleepwalking and the mark it leaves', () => {
  const heavy = mk('oakfist', 'lucky_streak');
  const capped = mk('pufflet', 'padded_soul');
  const bare = mk('pufflet', 'lucky_streak');
  const cap = ABILITIES.padded_soul.fx.find((f) => f.k === 'damageCap').r; // read the fraction, so a balance change cannot rot the test
  assert.ok(dmg(heavy, bare, 'all_out_brawl') > Math.floor(bare.maxHp * cap), 'the blow would take more than the cap');
  assert.ok(dmg(heavy, capped, 'all_out_brawl') <= Math.floor(capped.maxHp * cap) + 1, 'but the cap holds it');

  const r = play(fight(mk('pufflet', 'first_blood', { moves: ['bump'] }), mk('thornwick', 'lucky_streak', { moves: ['brace'] }), 'crit1').state);
  assert.ok(r.events.some((e) => e.t === 'damage' && e.crit), 'the first turn always lands true');

  const dozy = mk('pufflet', 'sleepwalker', { moves: ['bump'] });
  dozy.status = 'slp'; dozy.sleepTurns = 3;
  const walked = play(fight(dozy, mk('thornwick', 'lucky_streak', { moves: ['brace'] }), 'sleep').state);
  assert.ok(walked.events.some((e) => e.t === 'move' && e.side === 0), 'it swung in its sleep');
  assert.equal(activeOf(walked.state, 0).status, 'slp', 'and stayed asleep');

  const doomed = mk('pufflet', 'final_curse', { moves: ['brace'] });
  doomed.stats.hp = 20; doomed.maxHp = 20; doomed.hp = 20;
  const cursed = play(fight(doomed, mk('oakfist', 'lucky_streak', { moves: ['all_out_brawl'] }), 'curse').state).state;
  assert.ok(activeOf(cursed, 0).fainted);
  assert.equal(activeOf(cursed, 1).status, 'psn', 'its last act was a curse');
});
