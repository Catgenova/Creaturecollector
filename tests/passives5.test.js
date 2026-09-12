// Batch five: reading the matchup (the foe's type, style, status and health), the user's own situation,
// and the passives that change a move on its way out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeMove, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv5-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv5') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('matchup passives read the foe: its type, its style, its status and its health', () => {
  const plain = mk('pufflet', 'lucky_streak');
  const drake = mk('drakelet', 'lucky_streak');
  assert.ok(near(dmg(mk('pufflet', 'dragon_hunter'), drake, 'bump'), dmg(plain, drake, 'bump'), 1.3));
  assert.ok(near(dmg(mk('pufflet', 'dragon_hunter'), mk('pufflet', 'lucky_streak'), 'bump'), dmg(plain, plain, 'bump'), 1), 'only against dragons');

  const burned = mk('pufflet', 'lucky_streak');
  burned.status = 'brn';
  assert.ok(near(dmg(mk('pufflet', 'cinder_reaper'), burned, 'bump'), dmg(plain, burned, 'bump'), 1.4));
  assert.ok(near(dmg(mk('pufflet', 'cinder_reaper'), mk('pufflet', 'lucky_streak', { ability: 'lucky_streak' }), 'bump'), dmg(plain, plain, 'bump'), 1), 'a healthy foe is no feast');
  const poisoned = mk('pufflet', 'lucky_streak');
  poisoned.status = 'psn';
  assert.ok(near(dmg(mk('pufflet', 'cinder_reaper'), poisoned, 'bump'), dmg(plain, poisoned, 'bump'), 1), 'the wrong status does nothing');

  const bruiser = mk('thornwick', 'lucky_streak');
  assert.equal(bruiser.style, 'melee');
  assert.ok(near(dmg(mk('pufflet', 'brawl_reader'), bruiser, 'bump'), dmg(plain, bruiser, 'bump'), 1.25));

  const hurt = mk('pufflet', 'lucky_streak');
  hurt.hp = Math.floor(hurt.maxHp / 2);
  assert.ok(near(dmg(mk('pufflet', 'opening_blow'), plain, 'bump'), dmg(plain, plain, 'bump'), 1.3));
  assert.ok(near(dmg(mk('pufflet', 'opening_blow'), hurt, 'bump'), dmg(plain, hurt, 'bump'), 1), 'only a foe at full HP');
});

test('and the user reads its own situation: cornered, first out, last up, avenging, repeating', () => {
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('pufflet', 'lucky_streak');
  const low = mk('pufflet', 'cornered');
  low.hp = Math.floor(low.maxHp / 4);
  assert.ok(near(dmg(low, foe, 'bump'), dmg(plain, foe, 'bump'), 1.5));
  const charge = mk('pufflet', 'cavalry_charge');
  assert.ok(near(dmg(charge, foe, 'bump'), dmg(plain, foe, 'bump'), 1.5));
  charge.turnsOut = 2;
  assert.ok(near(dmg(charge, foe, 'bump'), dmg(plain, foe, 'bump'), 1), 'the charge is over');
  const last = mk('pufflet', 'last_legion');
  last.lastStanding = true;
  assert.ok(near(dmg(last, foe, 'bump'), dmg(plain, foe, 'bump'), 1.5));
  const avenger = mk('pufflet', 'vengeance');
  avenger.avenging = true;
  assert.ok(near(dmg(avenger, foe, 'bump'), dmg(plain, foe, 'bump'), 1.3));
  const drum = mk('pufflet', 'drumbeat');
  drum.repeating = true;
  assert.ok(near(dmg(drum, foe, 'bump'), dmg(plain, foe, 'bump'), 1.2));

  const slow = mk('pufflet', 'slow_burner');
  assert.ok(near(dmg(slow, foe, 'bump'), dmg(plain, foe, 'bump'), 0.75), 'half power, half again the Melee Atk');
  slow.turnsOut = 3;
  assert.ok(near(dmg(slow, foe, 'bump'), dmg(plain, foe, 'bump'), 1.5));
  const faint = mk('pufflet', 'faint_heart');
  assert.ok(near(dmg(faint, foe, 'bump'), dmg(plain, foe, 'bump'), 1.4));
  faint.hp = Math.floor(faint.maxHp / 2);
  assert.ok(near(dmg(faint, foe, 'bump'), dmg(plain, foe, 'bump'), 0.5));
});

test('effectiveness keys: Executioner on super effective, Steady Aim on neutral, Kindred on its own type', () => {
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(mk('pufflet', 'executioner'), foe, 'bump', 2), dmg(plain, foe, 'bump', 2), 1.3));
  assert.ok(near(dmg(mk('pufflet', 'executioner'), foe, 'bump', 1), dmg(plain, foe, 'bump', 1), 1));
  assert.ok(near(dmg(mk('pufflet', 'steady_aim'), foe, 'bump', 1), dmg(plain, foe, 'bump', 1), 1.2));
  assert.ok(near(dmg(mk('pufflet', 'steady_aim'), foe, 'bump', 2), dmg(plain, foe, 'bump', 2), 1));
  // Pufflet is Normal: Bump matches its type, so the same-type bonus goes from 1.25 to 1.4.
  assert.ok(near(dmg(mk('pufflet', 'kindred'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.4 / 1.25));
});

test('conversion: Emberform makes a Normal move Fire, and Shifter and Chameleon Skin change the creature', () => {
  const mover = mk('pufflet', 'emberform');
  const converted = activeMove(mover, getMove('bump'));
  assert.equal(converted.type, 'Fire');
  assert.equal(converted.power, Math.round(getMove('bump').power * 1.2));
  assert.equal(activeMove(mk('pufflet', 'emberform'), getMove('cinder')).type, 'Fire', 'a Fire move is left alone');
  assert.equal(activeMove(mk('pufflet', 'lucky_streak'), getMove('bump')).type, 'Normal');

  const r = play(fight(mk('pufflet', 'shifter', { moves: ['cinder'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })).state);
  assert.deepEqual(activeOf(r.state, 0).types, ['Fire', null], 'Shifter took the type of its move');
  const c = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'chameleon_skin', { moves: ['brace'] })).state);
  assert.deepEqual(activeOf(c.state, 1).types, ['Fire', null], 'Chameleon Skin took the type that hit it');
});

test('costs and yields: Heart Burn, Crash Helmet, Big Gulp and Repeater', () => {
  const heart = play(fight(mk('pufflet', 'heart_burn', { moves: ['bump'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })).state).state;
  const user = activeOf(heart, 0);
  assert.ok(near(user.maxHp - user.hp, user.maxHp / 8, 1), 'an eighth of max HP for the extra power');

  const helmSeed = 'recoil';
  const withHelm = play(fight(mk('pufflet', 'crash_helmet', { moves: ['ram'] }), mk('thornwick', 'lucky_streak', { moves: ['brace'] }), helmSeed).state).state;
  const without = play(fight(mk('pufflet', 'lucky_streak', { moves: ['ram'] }), mk('thornwick', 'lucky_streak', { moves: ['brace'] }), helmSeed).state).state;
  const lost = (st) => activeOf(st, 0).maxHp - activeOf(st, 0).hp;
  assert.ok(lost(withHelm) < lost(without), `${lost(withHelm)} < ${lost(without)}`);

  const gulpSeed = 'drain';
  const drained = (ab) => {
    const me = mk('sprigget', ab, { moves: ['sap_drain'] });
    me.hp = Math.floor(me.maxHp / 2);
    const st = play(fight(me, mk('pufflet', 'lucky_streak', { moves: ['brace'] }), gulpSeed).state).state;
    return activeOf(st, 0).hp - Math.floor(me.maxHp / 2);
  };
  assert.ok(drained('big_gulp') > drained('lucky_streak'), 'a bigger gulp');

  const hitsAt = (ab, seed) => {
    const st = play(fight(mk('pufflet', ab, { moves: ['flurry'] }), mk('thornwick', 'lucky_streak', { moves: ['brace'] }), seed).state);
    const e = st.events.find((x) => x.t === 'multihit');
    return e ? e.hits : 0;
  };
  let counted = false;
  for (let k = 0; k < 20 && !counted; k++) {
    const base = hitsAt('steady_aim', `multi${k}`);
    if (!base) continue; // that seed missed
    counted = true;
    assert.equal(hitsAt('repeater', `multi${k}`), Math.min(6, base + 1));
  }
  assert.ok(counted, 'a multi-hit move landed in twenty tries');
});

test('Serene Touch doubles a side effect, and Bleeding Edge poisons on a critical hit', () => {
  const burns = (ab) => {
    let n = 0;
    for (let k = 0; k < 40; k++) {
      const st = play(fight(mk('pufflet', ab, { moves: ['belly_flop'] }), mk('thornwick', 'steady_aim', { moves: ['brace'] }), `serene${k}`).state).state;
      if (activeOf(st, 1).status) n++;
    }
    return n;
  };
  assert.ok(burns('serene_touch') > burns('steady_aim'), 'the touch lands more often');

  let sawCrit = false;
  for (let k = 0; k < 60 && !sawCrit; k++) {
    // Mossbrute is neither Poison nor Steel, so the poison has somewhere to land.
    const r = play(fight(mk('pufflet', 'bleeding_edge', { moves: ['rake'] }), mk('mossbrute', 'steady_aim', { moves: ['brace'] }), `crit${k}`).state);
    if (!r.events.some((e) => e.t === 'damage' && e.crit)) continue;
    sawCrit = true;
    assert.equal(activeOf(r.state, 1).status, 'psn', 'the edge left poison behind');
  }
  assert.ok(sawCrit, 'a critical hit landed somewhere in sixty tries');
});
