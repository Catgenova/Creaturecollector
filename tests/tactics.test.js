// What a creature carries until it leaves the field, and what its side leaves on the ground.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { getMove, MOVE_FX_KINDS } from '../src/data/moves.js';
import { ABILITIES, ABILITY_IDS } from '../src/data/abilities.js';
import { HAZARDS, SIDE_CONDITIONS, SCREEN_OF, VOLATILES, BIND, CONFUSE, TAUNT_TURNS, ENCORE_TURNS } from '../src/data/field.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeOf, effectiveStat, legalActions, canLeave, sideCond, freshSide, PASSIVE_KINDS } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';

const mk = (id, moves, ab = 'lucky_streak', opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`tc-${id}`)), opts.level || 50, { ability: ab, moves, ...opts });
const fight = (a, b, seed = 'tc') => createBattle({ sides: [{ name: 'A', party: Array.isArray(a) ? a : [a] }, { name: 'B', party: Array.isArray(b) ? b : [b] }], seed });
const M = (i) => ({ type: 'move', index: i });
const play = (st, a = 0, b = 0) => step(st, [M(a), M(b)]);
const dmg = (u, t, id, cond) => calcDamage(u, t, getMove(id), 1, 1, false, null, cond);

test('the tables are whole and the engine reads every kind they use', () => {
  for (const k of ['confuse', 'bind', 'taunt', 'encore', 'protect', 'substitute', 'screen', 'hazard', 'tailwind', 'safeguard', 'sweepField']) assert.ok(MOVE_FX_KINDS.includes(k), k);
  for (const k of ['confuseImmune', 'tauntImmune', 'trapImmune', 'trapFoe', 'addConfuse', 'hazardImmune', 'screenBreak', 'entryHazard', 'entryScreen']) assert.ok(PASSIVE_KINDS.includes(k), k);
  for (const [id, h] of Object.entries(HAZARDS)) { assert.equal(h.id, id); assert.ok(h.name && h.line && h.over && h.max >= 1); }
  for (const [id, c] of Object.entries(SIDE_CONDITIONS)) { assert.equal(c.id, id); assert.ok(c.name && c.turns > 0); }
  for (const cat of ['melee', 'ranged', 'magic']) assert.ok(SIDE_CONDITIONS[SCREEN_OF[cat]], cat);
  for (const v of Object.values(VOLATILES)) assert.ok(v.name && v.line && v.over);
  assert.deepEqual(Object.keys(freshSide()).sort(), [...Object.keys(SIDE_CONDITIONS), ...Object.keys(HAZARDS)].sort());
});

test('a guard turns the turn aside, and leaning on it fails', () => {
  const guard = mk('pufflet', ['guard_up', 'bump']);
  const hitter = mk('skinkit', ['headbonk']);
  const r = play(fight(guard, hitter, 'guard').state, 0, 0);
  assert.ok(r.events.some((e) => e.t === 'guard'), 'the guard went up');
  assert.ok(r.events.some((e) => e.t === 'protect'), 'and the attack met it');
  assert.equal(activeOf(r.state, 0).hp, activeOf(r.state, 0).maxHp, 'nothing got through');
  assert.equal(activeOf(r.state, 0).protect, false, 'and it does not hold into the next turn');

  // four in a row: the odds halve each time, so it cannot be the whole plan
  let st = fight(mk('pufflet', ['guard_up']), mk('skinkit', ['headbonk']), 'run').state;
  let held = 0;
  for (let i = 0; i < 5; i++) { const out = play(st, 0, 0); st = out.state; if (out.events.some((e) => e.t === 'guard')) held++; }
  assert.ok(held >= 1 && held <= 3, `${held} guards held out of five`);
});

test('a decoy takes the hit, the status and the stat drop', () => {
  let st = fight(mk('pufflet', ['decoy', 'bump']), mk('skinkit', ['brace']), 'sub').state;
  st = play(st, 0, 0).state;
  const me = activeOf(st, 0);
  assert.equal(me.sub, Math.floor(me.maxHp / 4), 'a quarter of its health stands in front of it');
  assert.equal(me.hp, me.maxHp - me.sub);

  // a status move aimed at it the turn after does nothing: the decoy is standing in the way
  let st2 = fight(mk('skinkit', ['brace', 'drowse_dust']), mk('pufflet', ['decoy']), 'sub2').state;
  st2 = play(st2, 0, 0).state;
  assert.ok(activeOf(st2, 1).sub > 0, 'the decoy is up');
  const out = play(st2, 1, 0);
  assert.equal(activeOf(out.state, 1).status, null, 'the sleep never reached it');
  assert.ok(out.events.some((e) => e.t === 'no_effect' && e.reason === 'sub'));
});

test('confusion costs turns, and a clear head is proof against it', () => {
  const spinner = mk('pufflet', ['mind_spin']);
  const target = mk('skinkit', ['brace']);
  let st = play(fight(spinner, target, 'conf').state, 0, 0).state;
  const foe = activeOf(st, 1);
  assert.ok(foe.confuse >= CONFUSE.turns[0] && foe.confuse <= CONFUSE.turns[1], `confused for ${foe.confuse}`);
  let swings = 0;
  for (let i = 0; i < 6 && activeOf(st, 1).confuse > 0; i++) { const out = play(st, 0, 0); st = out.state; if (out.events.some((e) => e.t === 'volatileHit')) swings++; }
  assert.ok(swings >= 1, 'it hurt itself at least once');

  const clear = mk('skinkit', ['brace'], 'clear_head');
  const out = play(fight(spinner, clear, 'conf2').state, 0, 0);
  assert.equal(activeOf(out.state, 1).confuse, 0, 'a clear head never spins');
});

test('a bind holds a creature in place and squeezes it', () => {
  const binder = mk('pufflet', ['coil_grip']);
  const bench = [mk('skinkit', ['brace']), mk('craggon', ['brace'])];
  const out = play(fight(binder, bench, 'bind').state, 0, 0);
  const bound = activeOf(out.state, 1);
  assert.ok(bound.bind && bound.bind.turns >= 1, 'it is held');
  assert.ok(out.events.some((e) => e.t === 'hurt' && e.why === 'bind'), 'and squeezed at the end of the turn');
  assert.equal(legalActions(out.state, 1).some((a) => a.type === 'switch'), false, 'it cannot walk away');
  assert.equal(canLeave(out.state, 1), false);

  const slippy = [mk('skinkit', ['brace'], 'slip_free'), mk('craggon', ['brace'])];
  const free = play(fight(mk('pufflet', ['coil_grip']), slippy, 'bind2').state, 0, 0);
  assert.ok(canLeave(free.state, 1), 'unless it can always slip out');
});

test('a taunt takes the quiet moves away and an encore locks the loud one in', () => {
  const jeerer = mk('pufflet', ['jeer']);
  const quiet = mk('skinkit', ['brace', 'headbonk']);
  const out = play(fight(jeerer, quiet, 'taunt').state, 0, 1);
  assert.equal(activeOf(out.state, 1).taunt, TAUNT_TURNS - 1, 'the clock started and ticked once');
  const moves = legalActions(out.state, 1).filter((a) => a.type === 'move').map((a) => a.index);
  assert.deepEqual(moves, [1], 'only the attack is left');

  const singer = mk('pufflet', ['refrain', 'bump']);
  const repeat = mk('skinkit', ['brace', 'headbonk']);
  // it can only be encored into something it has already used, so let a turn go by first
  const enc = play(play(fight(singer, repeat, 'enc').state, 1, 1).state, 0, 1);
  const stuck = activeOf(enc.state, 1);
  assert.ok(stuck.encore && stuck.encore.id === 'headbonk', 'stuck on what it just used');
  assert.deepEqual(legalActions(enc.state, 1).filter((a) => a.type === 'move').map((a) => a.index), [1]);
  assert.equal(stuck.encore.turns, ENCORE_TURNS - 1);
});

test('a passive can hold the other side on the field', () => {
  const jailer = mk('pufflet', ['bump'], 'shadow_hold');
  const runner = [mk('skinkit', ['brace']), mk('craggon', ['brace'])];
  const st = fight(jailer, runner, 'hold').state;
  assert.equal(canLeave(st, 1), false, 'the foe is held');
  assert.equal(canLeave(st, 0), true, 'the holder is not');
  const proof = [mk('skinkit', ['brace'], 'slip_free'), mk('craggon', ['brace'])];
  assert.equal(canLeave(fight(jailer, proof, 'hold2').state, 1), true);
});

test('screens halve their own damage type, and a passive walks through them', () => {
  const atk = mk('pufflet', ['bump']), def = mk('skinkit', ['brace']);
  const screen = { ...freshSide(), screenMagic: 5 };
  assert.equal(dmg(atk, def, 'moonbeam_chant', screen), Math.floor(dmg(atk, def, 'moonbeam_chant', null) / 2), 'a Ward Screen halves Magic');
  assert.equal(dmg(atk, def, 'bump', screen), dmg(atk, def, 'bump', null), 'and leaves Melee alone');
  const melee = { ...freshSide(), screenMelee: 5 };
  assert.equal(dmg(atk, def, 'bump', melee), Math.floor(dmg(atk, def, 'bump', null) / 2));
  const breaker = mk('pufflet', ['bump'], 'pane_breaker');
  assert.equal(dmg(breaker, def, 'bump', melee), dmg(breaker, def, 'bump', null), 'a Pane Breaker does not see it');
});

test('a tailwind carries the whole side', () => {
  const b = mk('pufflet', ['bump']);
  assert.equal(effectiveStat(b, 'spe', null, { ...freshSide(), tailwind: 4 }), effectiveStat(b, 'spe') * SIDE_CONDITIONS.tailwind.speed);
});

test('hazards bite what walks into them, and spare the ones that are proof', () => {
  const layer = mk('pufflet', ['caltrops', 'bump']);
  const pair = [mk('skinkit', ['brace']), mk('craggon', ['brace'])];
  let out = play(fight(layer, pair, 'haz').state, 0, 0);
  assert.equal(sideCond(out.state, 1).spikes, 1);
  out = step(out.state, [M(1), { type: 'switch', index: 1 }]);
  assert.ok(out.events.some((e) => e.t === 'hurt' && e.why === 'spikes'), 'the one coming in is pricked');

  const booted = [mk('skinkit', ['brace']), mk('craggon', ['brace'], 'sure_footing')];
  let safe = play(fight(mk('pufflet', ['caltrops', 'bump']), booted, 'haz2').state, 0, 0);
  safe = step(safe.state, [M(1), { type: 'switch', index: 1 }]);
  assert.equal(safe.events.some((e) => e.t === 'hurt' && e.why === 'spikes'), false, 'sure footing walks over them');

  // a grounded Poison type soaks the burrs up rather than taking them
  const burrs = mk('pufflet', ['toxic_burrs', 'bump']);
  const poison = [mk('skinkit', ['brace']), mk('thornwick', ['brace'])];
  let soak = play(fight(burrs, poison, 'haz3').state, 0, 0);
  soak = step(soak.state, [M(1), { type: 'switch', index: 1 }]);
  assert.ok(soak.events.some((e) => e.t === 'sideOver' && e.kind === 'barbs'), 'the burrs are gone');
  assert.equal(sideCond(soak.state, 1).barbs, 0);
});

test('a spin sweeps your own side clear, and a passive lays the ground as it enters', () => {
  const layer = mk('pufflet', ['caltrops', 'bump']);
  const spinner = [mk('skinkit', ['spin_out']), mk('craggon', ['brace'])];
  let out = play(fight(layer, spinner, 'spin').state, 0, 0);
  assert.equal(sideCond(out.state, 1).spikes, 1);
  out = play(out.state, 1, 0);
  assert.equal(sideCond(out.state, 1).spikes, 0, 'the spin cleared it');
  assert.ok(out.events.some((e) => e.t === 'sweep'));

  const setter = mk('pufflet', ['bump'], 'snare_setter');
  const opened = fight(setter, mk('skinkit', ['brace']), 'setter');
  assert.equal(sideCond(opened.state, 1).spikes, 1, 'it laid them as it walked in');
  const warder = fight(mk('pufflet', ['bump'], 'screen_weaver'), mk('skinkit', ['brace']), 'ward');
  assert.equal(sideCond(warder.state, 0).screenMagic, SIDE_CONDITIONS.screenMagic.turns, 'and this one raised a screen');
});

test('a safeguard turns the foe’s statuses away while it holds', () => {
  const warder = mk('pufflet', ['ward_song', 'bump']);
  const burner = mk('skinkit', ['brace', 'ghostflame']);
  let out = play(fight(warder, burner, 'ward2').state, 0, 0);
  assert.equal(sideCond(out.state, 0).safeguard, SIDE_CONDITIONS.safeguard.turns - 1);
  assert.equal(activeOf(out.state, 0).status, null);
  let statused = false;
  for (let i = 0; i < 3; i++) { out = play(out.state, 1, 1); if (activeOf(out.state, 0).status) statused = true; }
  assert.equal(statused, false, 'nothing landed while the ward was up');
});

test('every clock runs down and clears itself', () => {
  let st = fight(mk('pufflet', ['following_wind', 'bump']), mk('skinkit', ['brace']), 'clock').state;
  st = play(st, 0, 0).state;
  const start = sideCond(st, 0).tailwind;
  assert.equal(start, SIDE_CONDITIONS.tailwind.turns - 1);
  for (let i = 0; i < start; i++) st = play(st, 1, 0).state;
  assert.equal(sideCond(st, 0).tailwind, 0, 'the wind dropped');
});

test('the AI reaches for the new tools and does not repeat itself', () => {
  const rng = makeRng('tactics-ai');
  const foe = mk('skinkit', ['brace']);
  // a screen against the kind of attacker it is facing
  const warder = mk('pufflet', ['ward_screen', 'bulwark_screen']);
  const magicFoe = mk('twinklet', ['moonbeam_chant']);
  const pick = chooseAction(fight(warder, magicFoe, 'aiw').state, 0, rng.fork('a'));
  assert.equal(pick.index, 0, 'the Ward Screen answers a Magic attacker');
  // and it will not put the same screen up twice
  let st = fight(mk('pufflet', ['ward_screen', 'bump']), magicFoe, 'aiw2').state;
  st = play(st, 0, 0).state;
  const again = chooseAction(st, 0, rng.fork('b'));
  assert.equal(again.index, 1, 'the second one would be wasted');
});

test('the batch is homed and reads in plain words', () => {
  const kinds = new Set(['confuseImmune', 'tauntImmune', 'trapImmune', 'trapFoe', 'addConfuse', 'hazardImmune', 'screenBreak', 'entryHazard', 'entryScreen']);
  const use = {};
  for (const s of SPECIES) for (const ab of s.abilities) use[ab] = (use[ab] || 0) + 1;
  const batch = ABILITY_IDS.filter((id) => (ABILITIES[id].fx || []).some((f) => kinds.has(f.k)));
  // three of the forty read the new fx families through fxBoost rather than a kind of their own
  assert.equal(batch.length, 37, `${batch.length} in the batch`);
  for (const id of ['constrictor', 'trickster', 'pin_down']) assert.ok(/Binding|Confusing/.test(ABILITIES[id].desc), id);
  for (const id of batch) {
    assert.ok(use[id] >= 1, `${ABILITIES[id].name} is carried by nobody`);
    assert.ok(ABILITIES[id].desc.length > 12 && !/undefined/i.test(ABILITIES[id].desc), `${id}: ${ABILITIES[id].desc}`);
  }
});
