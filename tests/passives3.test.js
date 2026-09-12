import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, moveEffectiveness, effectiveStat, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv3-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv3') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma, mb) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('situational boosts: first and last strike, statused and low foes, full HP, priority, Sheer Force, Tinted Lens, Filter', () => {
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('emberox', 'lucky_streak');
  const base = dmg(plain, foe, 'bump');
  assert.ok(near(dmg(mk('emberox', 'ambusher'), { ...foe, moved: false }, 'bump'), base, 1.3));
  assert.equal(dmg(mk('emberox', 'ambusher'), { ...foe, moved: true }, 'bump'), base);
  assert.ok(near(dmg(mk('emberox', 'counterpuncher'), { ...foe, moved: true }, 'bump'), base, 1.3));
  assert.ok(near(dmg(mk('emberox', 'merciless_edge'), { ...foe, status: 'brn' }, 'bump'), base, 1.3));
  assert.equal(dmg(mk('emberox', 'merciless_edge'), foe, 'bump'), base);
  assert.ok(near(dmg(mk('emberox', 'fresh'), foe, 'bump'), base, 1.3));
  assert.equal(dmg({ ...mk('emberox', 'fresh'), hp: 5 }, foe, 'bump'), base);
  assert.ok(near(dmg(mk('emberox', 'finisher'), { ...foe, hp: Math.floor(foe.maxHp / 2) }, 'bump'), base, 1.3));
  assert.ok(near(dmg(mk('emberox', 'quickdraw'), foe, 'dash'), dmg(plain, foe, 'dash'), 1.3));
  assert.equal(dmg(mk('emberox', 'quickdraw'), foe, 'bump'), base);
  assert.ok(near(dmg(mk('emberox', 'sheer_force'), foe, 'headbonk'), dmg(plain, foe, 'headbonk'), 1.3));
  assert.equal(dmg(mk('emberox', 'sheer_force'), foe, 'bump'), base, 'no side effect, no bonus');
  let flinches = 0;
  for (let s = 0; s < 40; s++) { const f = fight(mk('emberox', 'sheer_force', { moves: ['headbonk'] }), mk('pufflet', 'lucky_streak', { moves: ['bump'] }), `sf${s}`); f.state.sides[0].party[0].stats.spe = 999; if (play(f.state, 0, 0).events.some((e) => e.t === 'flinch')) flinches++; }
  assert.equal(flinches, 0, 'Sheer Force gives up the flinch');
  assert.ok(near(dmg(mk('emberox', 'tinted_lens'), foe, 'bump', 0.5), dmg(plain, foe, 'bump', 0.5), 2));
  assert.equal(dmg(mk('emberox', 'tinted_lens'), foe, 'bump', 1), base);
  assert.ok(near(dmg(plain, mk('pufflet', 'filter'), 'bump', 2), dmg(plain, foe, 'bump', 2), 0.75));
  assert.equal(dmg(plain, mk('pufflet', 'filter'), 'bump', 1), base);
});

test('stat leans: Brawn, Deadeye, Insight, Fleet, the guards, and the status-fed Quick Feet, Flare Boost, Toxic Boost and Marvel Scale', () => {
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('emberox', 'lucky_streak');
  assert.ok(near(dmg(mk('emberox', 'brawn'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.3));
  assert.equal(dmg(mk('emberox', 'brawn'), foe, 'cinder'), dmg(plain, foe, 'cinder'));
  assert.ok(near(dmg(mk('emberox', 'deadeye'), foe, 'cinder'), dmg(plain, foe, 'cinder'), 1.3));
  assert.ok(near(dmg(mk('emberox', 'insight'), foe, 'flare'), dmg(plain, foe, 'flare'), 1.3));
  assert.ok(Math.abs(effectiveStat(mk('emberox', 'fleet'), 'spe') - plain.stats.spe * 1.3) < 1e-9);
  assert.ok(near(dmg(plain, mk('pufflet', 'thick_coat'), 'bump'), dmg(plain, foe, 'bump'), 1 / 1.3));
  assert.equal(dmg(plain, mk('pufflet', 'thick_coat'), 'cinder'), dmg(plain, foe, 'cinder'));
  const quick = mk('emberox', 'quick_feet');
  assert.equal(effectiveStat(quick, 'spe'), plain.stats.spe);
  assert.ok(Math.abs(effectiveStat({ ...quick, status: 'psn' }, 'spe') - plain.stats.spe * 1.5) < 1e-9);
  assert.ok(near(dmg({ ...mk('emberox', 'flare_boost'), status: 'brn' }, foe, 'flare'), dmg({ ...plain, status: 'brn' }, foe, 'flare'), 1.5));
  assert.ok(near(dmg({ ...mk('emberox', 'toxic_boost'), status: 'psn' }, foe, 'bump'), dmg({ ...plain, status: 'psn' }, foe, 'bump'), 1.5));
  assert.ok(near(dmg(plain, { ...mk('pufflet', 'marvel_scale'), status: 'par' }, 'bump'), dmg(plain, { ...foe, status: 'par' }, 'bump'), 1 / 1.5));
  assert.equal(dmg(plain, mk('pufflet', 'marvel_scale'), 'bump'), dmg(plain, foe, 'bump'));
});

test('priority: Gale Wings at full HP, Prankster for status moves, Triage for healing, Quick Draw sometimes; Armor Tail shrugs priority off', () => {
  const slowBird = (ab, moves) => { const b = mk('emberox', ab, { moves }); b.stats.spe = 1; return b; };
  const fast = (moves) => { const b = mk('pufflet', 'lucky_streak', { moves }); b.stats.spe = 999; return b; };
  let r = play(fight(slowBird('gale_wings', ['gale']), fast(['bump'])).state, 0, 0);
  assert.equal(r.events.filter((e) => e.t === 'move')[0].side, 0, 'Gale Wings went first');
  const g = fight(slowBird('gale_wings', ['gale']), fast(['bump'])); g.state.sides[0].party[0].hp -= 1;
  assert.equal(play(g.state, 0, 0).events.filter((e) => e.t === 'move')[0].side, 1, 'not below full HP');
  r = play(fight(slowBird('prankster', ['glare']), fast(['bump'])).state, 0, 0);
  assert.equal(r.events.filter((e) => e.t === 'move')[0].side, 0);
  r = play(fight(slowBird('triage', ['mend']), fast(['bump'])).state, 0, 0);
  assert.equal(r.events.filter((e) => e.t === 'move')[0].side, 0);
  let first = 0;
  for (let s = 0; s < 60; s++) if (play(fight(slowBird('quick_draw', ['bump']), fast(['bump']), `qd${s}`).state, 0, 0).events.filter((e) => e.t === 'move')[0].side === 0) first++;
  assert.ok(first > 6 && first < 36, `${first} of 60 first`);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['dash'] }), mk('pufflet', 'armor_tail', { moves: ['brace'] })).state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'immune' && e.side === 1) && !r.events.some((e) => e.t === 'damage'));
});

test('immunities and status tricks: Earplugs, Overcoat, Good as Gold, Purity, Shield Dust, Magic Guard, Rock Head, Liquid Ooze, Synchronize, Pressure, Scrappy, Early Bird', () => {
  let r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bellow'] }), mk('pufflet', 'earplugs', { moves: ['brace'] })).state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'immune') && !r.events.some((e) => e.t === 'damage'));
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['drowse_dust'] }), mk('pufflet', 'overcoat', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).status, null);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['glare'] }), mk('pufflet', 'good_as_gold', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.meleeDef, 1, 'only Brace moved it');
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['ghostflame'] }), mk('pufflet', 'purity', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).status, null);
  let statused = 0;
  for (let s = 0; s < 40; s++) if (play(fight(mk('emberox', 'lucky_streak', { moves: ['belly_flop'] }), mk('pufflet', 'shield_dust', { moves: ['brace'] }), `sd${s}`).state, 0, 0).state.sides[1].party[0].status) statused++;
  assert.equal(statused, 0);
  let f = fight(mk('emberox', 'magic_guard', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }));
  f.state.sides[0].party[0].status = 'brn';
  r = play(f.state, 0, 0);
  assert.ok(!r.events.some((e) => e.t === 'hurt' && e.side === 0));
  r = play(fight(mk('emberox', 'rock_head', { moves: ['reckless_charge'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })).state, 0, 0);
  assert.ok(!r.events.some((e) => e.t === 'hurt' && e.why === 'recoil'));
  f = fight(mk('emberox', 'lucky_streak', { moves: ['sap_drain'] }), mk('pufflet', 'liquid_ooze', { moves: ['brace'] }));
  f.state.sides[0].party[0].hp = 20;
  r = play(f.state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'hurt' && e.side === 0 && e.why === 'thorns') && !r.events.some((e) => e.t === 'heal' && e.side === 0));
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['ghostflame'] }), mk('pufflet', 'synchronize', { moves: ['brace'] })).state, 0, 0);
  if (activeOf(r.state, 1).status === 'brn') assert.equal(activeOf(r.state, 0).status, null, 'a Fire type cannot be burned back');
  r = play(fight(mk('glacub', 'lucky_streak', { moves: ['numb_pulse'] }), mk('pufflet', 'synchronize', { moves: ['brace'] })).state, 0, 0);
  if (activeOf(r.state, 1).status === 'par') assert.equal(activeOf(r.state, 0).status, 'par');
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'pressure', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 0).moves[0].pp, getMove('bump').pp - 2);
  const ghost = mk('gloomshade', 'lucky_streak');
  assert.equal(moveEffectiveness(getMove('bump'), ghost, mk('emberox', 'lucky_streak')), 0);
  assert.ok(moveEffectiveness(getMove('bump'), ghost, mk('emberox', 'scrappy')) > 0);
  f = fight(mk('emberox', 'early_bird', { moves: ['bump'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }));
  f.state.sides[0].party[0].status = 'slp'; f.state.sides[0].party[0].sleepTurns = 2;
  r = play(f.state, 0, 0);
  assert.equal(activeOf(r.state, 0).status, null, 'two turns of sleep gone in one');
});

test('touches, defiance and the rest: Poison Touch, Stench, Defiant, Big Pecks, Steadfast, Aftermath, Hustle, Technician', () => {
  let poisoned = 0;
  for (let s = 0; s < 60; s++) if (play(fight(mk('emberox', 'poison_touch', { moves: ['bump'] }), mk('glacub', 'lucky_streak', { moves: ['brace'] }), `pt${s}`).state, 0, 0).state.sides[1].party[0].status === 'psn') poisoned++;
  assert.ok(poisoned > 3 && poisoned < 30, `${poisoned} of 60 poisoned`);
  assert.equal(play(fight(mk('emberox', 'poison_touch', { moves: ['cinder'] }), mk('glacub', 'lucky_streak', { moves: ['brace'] })).state, 0, 0).state.sides[1].party[0].status, null, 'no contact, no touch');
  let flinched = 0;
  for (let s = 0; s < 60; s++) { const f = fight(mk('emberox', 'stench', { moves: ['bump'] }), mk('pufflet', 'lucky_streak', { moves: ['bump'] }), `st${s}`); f.state.sides[0].party[0].stats.spe = 999; if (play(f.state, 0, 0).events.some((e) => e.t === 'flinch')) flinched++; }
  assert.ok(flinched > 0 && flinched < 25, `${flinched} of 60 flinched`);
  let r = play(fight(mk('emberox', 'lucky_streak', { moves: ['glare'] }), mk('pufflet', 'defiant', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.melee, 2);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['glare'] }), mk('pufflet', 'big_pecks', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.meleeDef, 1, 'Glare could not touch Melee Def; Brace raised it');
  assert.equal(activeOf(r.state, 1).stages.rangedDef, 0, 'Glare and Brace cancelled on Ranged Def');
  const f = fight(mk('emberox', 'lucky_streak', { moves: ['headbonk'] }), mk('pufflet', 'steadfast', { moves: ['bump'] }));
  f.state.sides[0].party[0].stats.spe = 999;
  let sped = false;
  for (let s = 0; s < 40 && !sped; s++) { const g = structuredClone(f.state); g.seed = `sf${s}`; const rr = play(g, 0, 0); if (rr.events.some((e) => e.t === 'flinch')) { assert.equal(activeOf(rr.state, 1).stages.spe, 1); sped = true; } }
  assert.ok(sped, 'a flinch happened within forty seeds');
  const a = fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'aftermath', { moves: ['brace'] }));
  a.state.sides[1].party[0].hp = 1;
  r = play(a.state, 0, 0);
  assert.ok(activeOf(r.state, 1).fainted, 'the foe fell');
  assert.ok(r.events.some((e) => e.t === 'hurt' && e.side === 0 && e.why === 'thorns'), 'Aftermath bit back');
  const foe = mk('pufflet', 'lucky_streak'), plain = mk('emberox', 'lucky_streak');
  assert.ok(near(dmg(mk('emberox', 'hustle'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.4), 'Hustle');
  assert.ok(near(dmg(mk('emberox', 'technician'), foe, 'bump'), dmg(plain, foe, 'bump'), 1.4), 'Technician');
  assert.equal(dmg(mk('emberox', 'technician'), foe, 'headbonk'), dmg(plain, foe, 'headbonk'));
});
