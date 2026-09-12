import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { MOVES, SIGNATURE_MOVES, signatureOf, getMove, moveEffects, ppFor } from '../src/data/moves.js';
import { combatStyle } from '../src/data/damage.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeOf, describeEvent } from '../src/battle/engine.js';
import { marketCatalogue, buyMove } from '../src/game/market.js';
import { newJourney, chooseJourneyStarter } from '../src/game/journey.js';
import { movesAtLevel } from '../src/battle/stats.js';

test('every rare has one signature move of its own type and style, learned at level 38, and nobody else learns it', () => {
  const rares = SPECIES.filter((s) => s.tier === 'rare');
  assert.equal(SIGNATURE_MOVES.length, rares.length);
  const owners = new Set();
  for (const s of rares) {
    const mv = signatureOf(s.id);
    assert.ok(mv, `${s.id} has no signature`);
    assert.ok(!owners.has(mv.id), `${mv.id} shared`); owners.add(mv.id);
    assert.ok(s.types.includes(mv.type), `${s.id}: ${mv.id} is ${mv.type}`);
    assert.equal(mv.cat, combatStyle(s.stats), `${s.id}: ${mv.id} is ${mv.cat}`);
    assert.ok(mv.power >= 45, mv.id);
    const entry = s.learnset.find(([, id]) => id === mv.id);
    assert.ok(entry && entry[0] === 38, `${s.id} learns ${mv.id} at ${entry && entry[0]}`);
    assert.ok(movesAtLevel(s.learnset, 50).includes(mv.id), `${s.id} carries its signature at 50`);
  }
  for (const s of SPECIES) for (const [, id] of s.learnset) { const mv = getMove(id); if (mv.signature) assert.equal(mv.signature, s.id, `${s.id} learns ${id}`); }
  for (const mv of SIGNATURE_MOVES) assert.ok(SPECIES_BY_ID[mv.signature] && SPECIES_BY_ID[mv.signature].tier === 'rare', mv.id);
});

test('signature moves are not sold and cannot be bought', () => {
  const sold = new Set(marketCatalogue().map((x) => x.move.id));
  for (const mv of SIGNATURE_MOVES) assert.ok(!sold.has(mv.id), `${mv.id} on sale`);
  assert.ok(sold.has('headbonk'));
  const j = newJourney('sig'); chooseJourneyStarter(j, 0); j.gold = 1e9;
  const r = buyMove(j, SIGNATURE_MOVES[0].id);
  assert.equal(r.ok, false);
  assert.match(r.reason, /one species/);
});

test('the new effect kinds read as short words and price like the other strong extras', () => {
  const kinds = ['restore', 'cure', 'pierce', 'recharge', 'cleanse', 'boostIfLow', 'boostIfFirst'];
  for (const k of kinds) assert.ok(MOVES.some((mv) => mv.fx.some((f) => f.k === k)), `no move uses ${k}`);
  const plain = (fx) => ppFor({ id: 'x', cat: 'melee', power: 90, acc: 100, prio: 0, crit: 0, fx });
  assert.equal(plain([]), 15);
  assert.equal(plain([{ k: 'restore', r: 0.25 }]), 10);
  assert.equal(plain([{ k: 'pierce' }]), 10);
  assert.equal(plain([{ k: 'cleanse' }]), 10);
  assert.equal(plain([{ k: 'boostIfFirst', m: 1.5 }]), 10);
  assert.equal(plain([{ k: 'boostIfLow', m: 1.5 }]), 15, 'a conditional bonus is not a strong extra');
  assert.equal(plain([{ k: 'cure' }]), 15);
  assert.deepEqual(moveEffects(getMove('rekindle')), ['restores 25% HP']);
  assert.deepEqual(moveEffects(getMove('spa_scald')), ['cures own status']);
  assert.deepEqual(moveEffects(getMove('rust_grinder')), ['ignores defence boosts']);
  assert.deepEqual(moveEffects(getMove('storm_shadow')), ['rests next turn']);
  assert.deepEqual(moveEffects(getMove('dusk_answer')), ['resets foe stat changes']);
  assert.deepEqual(moveEffects(getMove('sunwheel')), ['×1.5 at low HP']);
  assert.deepEqual(moveEffects(getMove('thermal_dive')), ['×1.5 moving first']);
  assert.deepEqual(moveEffects(getMove('gone_before_seen')), ['priority +1']);
});

// pinned to a passive that changes no damage, so a species' own passive cannot skew a move's arithmetic
const mk = (id, level = 50, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`sig-${id}`)), level, { ability: 'lucky_streak', ...opts });
const fight = (a, b, seed = 'sigfight') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed }).state;
const play = (state, moveA, moveB) => step(state, [{ type: 'move', index: moveA }, { type: 'move', index: moveB }]);

test('pierce ignores the target\'s defence boosts; low-HP and first-mover bonuses multiply power', () => {
  const user = mk('boltmaw'), foe = mk('pufflet');
  const pierce = getMove('rust_grinder'), plain = { ...pierce, fx: [] };
  const base = calcDamage(user, foe, plain, 1, 1, false);
  const boosted = { ...foe, stages: { ...foe.stages, meleeDef: 6 } };
  assert.ok(calcDamage(user, boosted, plain, 1, 1, false) < base, 'a +6 guard blunts a plain move');
  assert.equal(calcDamage(user, boosted, pierce, 1, 1, false), calcDamage(user, foe, pierce, 1, 1, false), 'but not a piercing one');
  const sun = mk('aurodrake'), target = mk('pufflet');
  const wheel = getMove('sunwheel');
  const full = calcDamage(sun, target, wheel, 1, 1, false);
  const hurt = { ...sun, hp: Math.floor(sun.maxHp / 3) };
  assert.ok(calcDamage(hurt, target, wheel, 1, 1, false) > full * 1.3, 'half again at a third HP');
  const wyv = mk('wyvernet'), dive = getMove('thermal_dive');
  const early = calcDamage(wyv, { ...target, moved: false }, dive, 1, 1, false), late = calcDamage(wyv, { ...target, moved: true }, dive, 1, 1, false);
  assert.ok(early > late * 1.3, 'more when the target has not moved');
});

test('restore heals, cure clears the user\'s status, cleanse resets the foe, recharge costs the next turn', () => {
  // restore: Phoenixquill's Rekindle heals a quarter of max HP after it lands
  let a = mk('phoenixquill', 50, { moves: ['rekindle'] }), b = mk('pufflet', 50, { moves: ['brace'] });
  let st = fight(a, b);
  st.sides[0].party[0].hp = 10;
  let r = play(st, 0, 0);
  const heal = r.events.find((e) => e.t === 'heal' && e.side === 0);
  assert.ok(heal && heal.why === 'restore' && heal.amount === Math.floor(a.maxHp * 0.25), JSON.stringify(heal));
  assert.match(describeEvent(heal), /restored/);
  // cure: a burned Lavalotl shakes the burn off with Spa Scald
  a = mk('lavalotl', 50, { moves: ['spa_scald'] }); b = mk('pufflet', 50, { moves: ['brace'] });
  st = fight(a, b); st.sides[0].party[0].status = 'brn';
  r = play(st, 0, 0);
  assert.equal(activeOf(r.state, 0).status, null);
  assert.ok(r.events.some((e) => e.t === 'cure' && e.side === 0 && e.why === 'move'));
  // cleanse: Halowl's Dusk Answer sweeps the foe's boosts
  a = mk('halowl', 50, { moves: ['dusk_answer'] }); b = mk('pufflet', 50, { moves: ['brace'] });
  st = fight(a, b); st.sides[1].party[0].stages.meleeDef = 4; st.sides[1].party[0].stages.spe = 2;
  st.sides[0].party[0].stats.spe = 999; // act first so the sweep is measured after the hit
  r = play(st, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'cleanse' && e.side === 1));
  const foeAfter = activeOf(r.state, 1);
  assert.equal(foeAfter.stages.spe, 0);
  assert.equal(foeAfter.stages.meleeDef, 1, 'the sweep lands before Brace raises it again');
  // recharge: Thunderroc rests the turn after Storm Shadow lands
  a = mk('thunderroc', 100, { moves: ['storm_shadow', 'zap'] }); b = mk('pufflet', 100, { moves: ['brace'] });
  b.maxHp = b.hp = 9999; b.stats.rangedDef = 9999;
  st = fight(a, b, 'recharge-seed');
  let landed = false;
  for (let i = 0; i < 6 && !landed; i++) { r = play(st, 0, 0); st = r.state; landed = r.events.some((e) => e.t === 'damage' && e.side === 1); }
  assert.ok(landed && activeOf(st, 0).recharge, 'the user owes a rest');
  r = play(st, 1, 0);
  assert.ok(r.events.some((e) => e.t === 'recharge' && e.side === 0), 'the next turn is spent recharging');
  assert.ok(!r.events.some((e) => e.t === 'move' && e.side === 0));
  assert.equal(activeOf(r.state, 0).recharge, false);
  assert.match(describeEvent(r.events.find((e) => e.t === 'recharge')), /recharge/);
});
