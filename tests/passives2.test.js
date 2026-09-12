import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeOf } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv2-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv2') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma, mb) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const hasAbility = (events, name) => events.some((e) => e.t === 'ability' && e.ability === name);

test('entry passives raise the newcomer or lower the foe as it steps in', () => {
  const { state, events } = fight(mk('emberox', 'warcry'), mk('pufflet', 'daunting'));
  assert.equal(activeOf(state, 0).stages.melee, 1);
  assert.equal(activeOf(state, 0).stages.spe, -1, 'Daunting slowed the foe on entry');
  assert.ok(hasAbility(events, 'Warcry') && hasAbility(events, 'Daunting'));
  const { state: s2 } = fight(mk('emberox', 'hex_eye'), mk('pufflet', 'steady'));
  assert.equal(activeOf(s2, 1).stages.magicDef, 0, 'Steady refuses a foe’s drop');
});

test('end-of-turn passives: Overgrowth heals, Venom Feeder turns poison to healing, Rot Aura and Dread Aura wear the foe down, Second Skin sheds a status', () => {
  let { state } = fight(mk('emberox', 'overgrowth', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }));
  state.sides[0].party[0].hp = 10;
  let r = play(state, 0, 0);
  const heal = r.events.find((e) => e.t === 'heal' && e.side === 0);
  assert.ok(heal && heal.amount === Math.floor(activeOf(state, 0).maxHp / 8));
  ({ state } = fight(mk('emberox', 'venom_feeder', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })));
  state.sides[0].party[0].status = 'psn'; state.sides[0].party[0].hp = 10;
  r = play(state, 0, 0);
  assert.ok(activeOf(r.state, 0).hp > 10 && !r.events.some((e) => e.t === 'hurt' && e.side === 0));
  ({ state } = fight(mk('emberox', 'rot_aura', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })));
  r = play(state, 0, 0);
  assert.ok(!r.events.some((e) => e.t === 'hurt' && e.side === 1), 'Rot Aura waits for a status');
  state.sides[1].party[0].status = 'brn';
  r = play(state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'hurt' && e.side === 1 && e.why === 'aura'));
  ({ state } = fight(mk('emberox', 'dread_aura', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] })));
  r = play(state, 0, 0);
  const aura = r.events.find((e) => e.t === 'hurt' && e.side === 1 && e.why === 'aura');
  assert.ok(aura && aura.amount === Math.max(1, Math.floor(activeOf(state, 1).maxHp / 16)));
  let shed = 0;
  for (let s = 0; s < 30; s++) {
    const f = fight(mk('emberox', 'second_skin', { moves: ['brace'] }), mk('pufflet', 'lucky_streak', { moves: ['brace'] }), `skin${s}`);
    f.state.sides[0].party[0].status = 'par';
    if (!play(f.state, 0, 0).state.sides[0].party[0].status) shed++;
  }
  assert.ok(shed > 2 && shed < 20, `${shed} of 30 shed`);
});

test('knockouts feed Soul Eater, Bloodlust and Feast', () => {
  const foe = () => { const b = mk('pufflet', 'lucky_streak', { moves: ['brace'] }); b.hp = 1; return b; };
  let r = play(fight(mk('emberox', 'soul_eater', { moves: ['bump'] }), foe()).state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.magic, 1);
  r = play(fight(mk('emberox', 'bloodlust', { moves: ['bump'] }), foe()).state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.spe, 1);
  const f = fight(mk('emberox', 'feast', { moves: ['bump'] }), foe()); f.state.sides[0].party[0].hp = 5;
  r = play(f.state, 0, 0);
  assert.ok(activeOf(r.state, 0).hp >= 5 + Math.floor(activeOf(f.state, 0).maxHp / 4) - 1);
});

test('contact passives punish the attacker: Barbed hurts, Gooey slows, Frost Fur may freeze', () => {
  let r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'barbed', { moves: ['brace'] })).state, 0, 0);
  const thorn = r.events.find((e) => e.t === 'hurt' && e.side === 0 && e.why === 'thorns');
  assert.ok(thorn && thorn.amount === Math.max(1, Math.floor(activeOf(r.state, 0).maxHp / 6)));
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'gooey', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.spe, -1);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'gooey', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.spe, 0, 'no contact, no slime');
  let frozen = 0;
  for (let s = 0; s < 40; s++) if (play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'frost_fur', { moves: ['brace'] }), `ff${s}`).state, 0, 0).state.sides[0].party[0].status === 'frz') frozen++;
  assert.ok(frozen > 2 && frozen < 22, `${frozen} of 40 frozen`);
});

test('being hit stokes Stoked, Stamina, Righteous, Water Compaction, Cotton Down and Anger Point; Weak Armor trades guard for speed', () => {
  let r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'stoked', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.melee, 1);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'stoked', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.melee, 0, 'a ranged hit does not stoke it');
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'stamina', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.meleeDef, 2, 'Brace and Stamina');
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['chomp'] }), mk('glacub', 'righteous', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.melee, 1);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['squirt'] }), mk('pufflet', 'water_compaction', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.meleeDef, 3);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'cotton_down', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 0).stages.spe, -1);
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['bump'] }), mk('pufflet', 'weak_armor', { moves: ['brace'] })).state, 0, 0);
  assert.equal(activeOf(r.state, 1).stages.spe, 2);
  // Anger Point on a critical hit: Merciless always crits a statused foe
  const f = fight(mk('emberox', 'merciless', { moves: ['bump'] }), mk('pufflet', 'anger_point', { moves: ['brace'] }));
  f.state.sides[1].party[0].status = 'brn';
  r = play(f.state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'damage' && e.crit));
  assert.equal(activeOf(r.state, 1).stages.melee, 2);
});

test('Ricochet and Backlash return a share of the hit; Natural Cure and Rest Easy work on switching out; Multiscale and Last Stand soften hits by HP', () => {
  let r = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'ricochet', { moves: ['brace'] })).state, 0, 0);
  const dealt = r.events.find((e) => e.t === 'damage' && e.side === 1), back = r.events.find((e) => e.t === 'hurt' && e.side === 0 && e.why === 'thorns');
  assert.ok(dealt && back && back.amount === Math.max(1, Math.floor(dealt.amount / 4)));
  r = play(fight(mk('emberox', 'lucky_streak', { moves: ['cinder'] }), mk('pufflet', 'backlash', { moves: ['brace'] })).state, 0, 0);
  assert.ok(!r.events.some((e) => e.t === 'hurt' && e.side === 0), 'Backlash answers Melee only');
  // switching out
  const a = mk('emberox', 'natural_cure', { moves: ['brace'] }), b = mk('glacub', 'rest_easy', { moves: ['brace'] });
  const { state } = createBattle({ sides: [{ name: 'A', party: [a, b] }, { name: 'B', party: [mk('pufflet', 'lucky_streak', { moves: ['brace'] })] }], seed: 'sw' });
  state.sides[0].party[0].status = 'psn';
  r = step(state, [{ type: 'switch', index: 1 }, { type: 'move', index: 0 }]);
  assert.equal(r.state.sides[0].party[0].status, null);
  r.state.sides[0].party[1].hp = 10;
  const r2 = step(r.state, [{ type: 'switch', index: 0 }, { type: 'move', index: 0 }]);
  assert.equal(r2.state.sides[0].party[1].hp, 10 + Math.floor(b.maxHp / 4));
  // HP-gated guards
  const user = mk('emberox', 'lucky_streak'), scale = mk('pufflet', 'multiscale'), stand = mk('pufflet', 'last_stand'), plain = mk('pufflet', 'lucky_streak');
  const base = calcDamage(user, plain, getMove('bump'), 1, 1, false);
  assert.ok(calcDamage(user, scale, getMove('bump'), 1, 1, false) <= Math.floor(base * 0.5) + 1);
  assert.equal(calcDamage(user, { ...scale, hp: scale.maxHp - 1 }, getMove('bump'), 1, 1, false), base);
  assert.equal(calcDamage(user, stand, getMove('bump'), 1, 1, false), base);
  assert.ok(calcDamage(user, { ...stand, hp: Math.floor(stand.maxHp / 3) }, getMove('bump'), 1, 1, false) <= Math.floor(base * 0.7) + 1);
});

test('accuracy and critical passives: No Guard never misses, Sand Veil dodges, Sniper hits harder on a crit, Shell Armor never takes one, Steady Nerves never flinches', () => {
  const misses = (userAb, foeAb, moveId, seeds = 60) => { let n = 0; for (let s = 0; s < seeds; s++) { const f = fight(mk('emberox', userAb, { moves: [moveId] }), mk('pufflet', foeAb, { moves: ['brace'] }), `acc${s}`); if (play(f.state, 0, 0).events.some((e) => e.t === 'miss')) n++; } return n; };
  assert.equal(misses('no_guard', 'lucky_streak', 'skyfall_bolt'), 0);
  assert.ok(misses('lucky_streak', 'sand_veil', 'bump') > misses('lucky_streak', 'lucky_streak', 'bump'));
  const user = mk('emberox', 'sniper'), foe = mk('pufflet', 'lucky_streak');
  assert.ok(Math.abs(calcDamage(user, foe, getMove('bump'), 1, 1, true) - Math.floor(calcDamage(user, foe, getMove('bump'), 1, 1, false) * 2.25)) <= 2);
  let crits = 0;
  for (let s = 0; s < 80; s++) if (play(fight(mk('emberox', 'super_luck', { moves: ['rake'] }), mk('pufflet', 'shell_armor', { moves: ['brace'] }), `sa${s}`).state, 0, 0).events.some((e) => e.t === 'damage' && e.crit)) crits++;
  assert.equal(crits, 0);
  let flinched = 0;
  for (let s = 0; s < 40; s++) { const f = fight(mk('emberox', 'lucky_streak', { moves: ['headbonk'] }), mk('pufflet', 'steady_nerves', { moves: ['bump'] }), `fl${s}`); f.state.sides[0].party[0].stats.spe = 999; if (play(f.state, 0, 0).events.some((e) => e.t === 'flinch')) flinched++; }
  assert.equal(flinched, 0);
});
