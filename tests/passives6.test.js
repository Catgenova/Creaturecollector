// Batch six: tactics that read or ignore the other side, guards that fire once a battle, and the
// three passives that reach outside the fight (experience, gold, catch odds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { abilityWorldMul } from '../src/data/abilities.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, moveEffectiveness, activeOf, captureChance } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv6-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv6', extra = {}) => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed, ...extra });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1, crit = false) => calcDamage(u, t, getMove(id), eff, 1, crit);

test('Guard Breaker walks through resists and absorbs; Plain Sight ignores stat stages', () => {
  const plain = mk('pufflet', 'lucky_streak'); // Lucky Streak touches side effects only, so damage is untouched
  const breaker = mk('pufflet', 'guard_breaker');
  const proofed = mk('pufflet', 'fire_proof');
  const bare = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(plain, proofed, 'cinder'), dmg(plain, bare, 'cinder'), 0.6), 'the resist is real');
  assert.ok(near(dmg(breaker, proofed, 'cinder'), dmg(breaker, bare, 'cinder'), 1), 'and the breaker walks through it');
  const drinker = mk('pufflet', 'dry_skin');
  assert.equal(moveEffectiveness(getMove('squirt'), drinker, plain), 0);
  assert.ok(moveEffectiveness(getMove('squirt'), drinker, breaker) > 0, 'no absorbing through a broken guard');

  const boasting = mk('pufflet', 'lucky_streak');
  boasting.stages.melee = 2;
  const target = mk('pufflet', 'lucky_streak'), blind = mk('pufflet', 'plain_sight');
  assert.ok(dmg(boasting, target, 'bump') > dmg(mk('pufflet', 'lucky_streak'), target, 'bump'), 'the boast counts normally');
  assert.equal(dmg(boasting, blind, 'bump'), dmg(mk('pufflet', 'lucky_streak'), blind, 'bump'), 'Plain Sight does not see it');
});

test('Topsy reverses stat changes and Open Book doubles them', () => {
  const drop = (ab) => {
    const r = play(fight(mk('pufflet', 'steady_aim', { moves: ['yowl'] }), mk('pufflet', ab, { moves: ['brace'] })).state);
    return activeOf(r.state, 1).stages.melee;
  };
  const control = drop('steady_aim');
  assert.equal(control, -1);
  assert.equal(drop('topsy'), 1, 'the drop became a rise');
  assert.equal(drop('open_book'), -2, 'and doubled for Open Book');
});

test('Downlink reads the foe on entry, and Mimicry copies its passive', () => {
  const foe = mk('thornwick', 'brawn');
  const st = fight(mk('pufflet', 'downlink'), foe).state;
  const me = activeOf(st, 0);
  const wanted = foe.stats.meleeDef <= foe.stats.magicDef ? 'melee' : 'magic';
  assert.equal(me.stages[wanted], 1, `Downlink raised ${wanted}`);
  assert.equal(me.stages[wanted === 'melee' ? 'magic' : 'melee'], 0);
  assert.equal(activeOf(fight(mk('pufflet', 'deep_scan'), mk('thornwick', 'brawn')).state, 0).stages[wanted], 2, 'Deep Scan reads twice as hard');
  assert.equal(activeOf(fight(mk('pufflet', 'mimicry'), mk('thornwick', 'brawn')).state, 0).ability, 'brawn');
});

test('once a battle: Costume eats the first hit, Sturdy Frame survives the knockout blow, Berry Heart heals', () => {
  const hit = (ab, seed) => {
    let st = fight(mk('thornwick', 'steady_aim', { moves: ['bump'] }), mk('pufflet', ab, { moves: ['brace'] }), seed).state;
    const first = play(st);
    const afterFirst = activeOf(first.state, 1).hp;
    const second = play(first.state);
    return { first: activeOf(first.state, 1).maxHp - afterFirst, second: afterFirst - activeOf(second.state, 1).hp };
  };
  const costume = hit('costume', 'costume');
  assert.equal(costume.first, 0, 'the costume took the first hit');
  assert.ok(costume.second > 0, 'the second one landed');
  assert.ok(hit('steady_aim', 'costume').first > 0);

  const heavy = mk('oakfist', 'steady_aim', { moves: ['all_out_brawl'] });
  const frail = (ab) => { const b = mk('pufflet', ab, { moves: ['brace'] }); b.stats.hp = 40; b.maxHp = 40; b.hp = 40; return b; };
  const control = play(fight(heavy, frail('steady_aim'), 'endure').state).state;
  assert.ok(activeOf(control, 1).fainted, 'the blow is lethal');
  const endured = play(fight(heavy, frail('sturdy_frame'), 'endure').state).state;
  assert.equal(activeOf(endured, 1).hp, 1, 'Sturdy Frame held on with 1 HP');

  const berry = (ab) => {
    const b = mk('pufflet', ab, { moves: ['brace'] });
    b.hp = Math.floor(b.maxHp * 0.3);
    const st = play(fight(mk('thornwick', 'steady_aim', { moves: ['bump'] }), b, 'berry').state).state;
    return activeOf(st, 1).hp;
  };
  assert.ok(berry('berry_heart') > berry('steady_aim'), 'Berry Heart topped itself up');
});

test('Mirror Cloak bounces a status move back at its sender', () => {
  let landed = false;
  for (let k = 0; k < 12 && !landed; k++) { // Numb Pulse can miss; take the first seed where it does not
    const r = play(fight(mk('pufflet', 'steady_aim', { moves: ['numb_pulse'] }), mk('pufflet', 'mirror_cloak', { moves: ['brace'] }), `bounce${k}`).state);
    if (r.events.some((e) => e.t === 'miss')) continue;
    landed = true;
    assert.equal(activeOf(r.state, 1).status, null, 'the cloak took nothing');
    assert.equal(activeOf(r.state, 0).status, 'par', 'the sender caught it instead');
  }
  assert.ok(landed, 'the status move landed in twelve tries');
});

test('cushions: Soft Landing, Thick Padding, Featherweight, Shock Absorber, Clotted Hide, Gap Guard', () => {
  const seed = 'cushion';
  const took = (ab) => {
    const st = play(fight(mk('thornwick', 'steady_aim', { moves: ['bump'] }), mk('pufflet', ab, { moves: ['brace'] }), seed).state).state;
    return activeOf(st, 1).maxHp - activeOf(st, 1).hp;
  };
  assert.ok(near(took('soft_landing'), took('steady_aim'), 0.5), `${took('soft_landing')} vs ${took('steady_aim')}`);

  const plain = mk('thornwick', 'steady_aim'), control = mk('pufflet', 'steady_aim');
  assert.ok(near(dmg(plain, mk('pufflet', 'thick_padding'), 'bump', 1, true), dmg(plain, control, 'bump', 1, true), 0.5));
  assert.ok(near(dmg(plain, mk('pufflet', 'thick_padding'), 'bump'), dmg(plain, control, 'bump'), 1), 'only critical hits');
  assert.ok(near(dmg(plain, mk('pufflet', 'featherweight'), 'bump'), dmg(plain, control, 'bump'), 0.6), 'light moves only');
  assert.ok(near(dmg(plain, mk('pufflet', 'featherweight'), 'blaze_tackle'), dmg(plain, control, 'blaze_tackle'), 1));
  assert.ok(near(dmg(plain, mk('pufflet', 'shock_absorber'), 'blaze_tackle'), dmg(plain, control, 'blaze_tackle'), 0.7), 'heavy moves only');
  assert.ok(near(dmg(plain, mk('pufflet', 'clotted_hide'), 'sap_drain'), dmg(plain, control, 'sap_drain'), 0.6));
  assert.ok(near(dmg(plain, mk('pufflet', 'gap_guard'), 'flurry'), dmg(plain, control, 'flurry'), 0.6));
});

test('the world passives: experience, gold and catch odds', () => {
  assert.equal(abilityWorldMul('prodigy', 'worldXp'), 1.5);
  assert.equal(abilityWorldMul('coin_hoard', 'worldGold'), 1.75);
  assert.equal(abilityWorldMul('beastmaster', 'worldCatch'), 1.5);
  assert.equal(abilityWorldMul('steady_aim', 'worldGold'), 1, 'an ordinary passive leaves the world alone');
  assert.equal(abilityWorldMul(undefined, 'worldXp'), 1);

  const caught = (ab) => {
    let n = 0;
    for (let k = 0; k < 40; k++) {
      const wild = mk('pufflet', 'steady_aim', { moves: ['brace'] });
      wild.hp = Math.floor(wild.maxHp / 3);
      const st = fight(mk('skinkit', ab, { moves: ['brace'] }), wild, `catch${k}`, { capturable: true }).state;
      const r = step(st, [{ type: 'capture' }, { type: 'move', index: 0 }]);
      if (r.state.captured) n++;
    }
    return n;
  };
  const helped = caught('beastmaster'), bare = caught('steady_aim');
  assert.ok(helped > bare, `${helped} caught with a Beastmaster leading, ${bare} without`);
  assert.ok(captureChance(mk('pufflet', 'steady_aim'), 50) > 0, 'the base odds are unchanged');
});
