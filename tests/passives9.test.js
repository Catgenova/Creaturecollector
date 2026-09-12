// Batch nine, and the shape of the whole pool: six hundred passives, each with a distinct name and a
// distinct set of entries, spread two to six deep across the roster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ABILITY_IDS, ABILITIES, DATA_ABILITY_IDS, describeFx, abilityWorldMul } from '../src/data/abilities.js';
import { isCoreAbility } from '../src/data/elements.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeMove, activeOf, PASSIVE_KINDS } from '../src/battle/engine.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`pv9-${id}`)), 50, { ability: ab, ...opts });
const fight = (a, b, seed = 'pv9') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false);

test('nine hundred passives, every one distinct in name and in what it does', () => {
  assert.equal(ABILITY_IDS.length, 900);
  assert.ok(DATA_ABILITY_IDS.length >= 844, `${DATA_ABILITY_IDS.length} data rows`);
  const names = new Map(), signatures = new Map();
  for (const id of ABILITY_IDS) {
    const a = ABILITIES[id];
    assert.ok(a.name && a.desc, id);
    assert.ok(!names.has(a.name), `${id} repeats the name of ${names.get(a.name)}`);
    names.set(a.name, id);
    if (!a.fx) continue;
    const sig = JSON.stringify(a.fx);
    assert.ok(!signatures.has(sig), `${id} does exactly what ${signatures.get(sig)} does`);
    signatures.set(sig, id);
    for (const f of a.fx) {
      assert.ok(PASSIVE_KINDS.includes(f.k), `${id}: the engine does not read ${f.k}`);
      assert.ok(describeFx(f).length > 8, `${id}: ${f.k} has no words`);
    }
    assert.ok(!/\b(Attack|Defense|Sp\. Atk|Sp\. Def)\b/.test(a.desc), `${id} uses another game's stat words`);
  }
});

test('the pool sits one to four deep on the roster, cores stay Elemental', () => {
  const use = {};
  for (const s of SPECIES) for (const ab of s.abilities) use[ab] = (use[ab] || 0) + 1;
  const ordinary = ABILITY_IDS.filter((id) => !isCoreAbility(id));
  // 886 ordinary passives over 1,790 slots is barely two deep, so the floor is one home each
  for (const id of ordinary) {
    assert.ok(use[id] >= 1, `${id} is carried by ${use[id] || 0} species`);
    assert.ok(use[id] <= 4, `${id} is carried by ${use[id]} species`);
  }
  for (const id of ABILITY_IDS.filter(isCoreAbility)) assert.ok(!use[id], `${id} is an Elemental core and should not be on a species`);
  for (const s of SPECIES) {
    assert.notEqual(s.abilities[0], s.abilities[1], s.id);
    for (const ab of s.abilities) assert.ok(ABILITIES[ab], `${s.id} carries the unknown passive ${ab}`);
  }
});

test('Storm Crown hurries its Electric moves and shrugs off paralysis', () => {
  const slow = mk('pufflet', 'storm_crown', { moves: ['zap'] });
  slow.stats.spe = 1; // slower than anything, but the passive gives its Electric moves priority
  const quick = mk('thornwick', 'lucky_streak', { moves: ['bump'] });
  const order = play(fight(slow, quick, 'crown').state).events.filter((e) => e.t === 'move').map((e) => e.side);
  assert.equal(order[0], 0, 'the crowned one struck first');
  const bare = mk('pufflet', 'lucky_streak', { moves: ['zap'] });
  bare.stats.spe = 1;
  assert.equal(play(fight(bare, quick, 'crown').state).events.filter((e) => e.t === 'move').map((e) => e.side)[0], 1, 'anyone else goes second');
  for (let k = 0; k < 6; k++) { // paralysis never sticks, whichever seed lands it
    const zapped = play(fight(mk('pufflet', 'lucky_streak', { moves: ['numb_pulse'] }), mk('pufflet', 'storm_crown', { moves: ['brace'] }), `crown${k}`).state).state;
    assert.equal(activeOf(zapped, 1).status, null);
  }
});

test('Phoenix Down catches a fall, and Moonwater turns a Water move Fairy', () => {
  const falling = (ab) => {
    const b = mk('pufflet', ab, { moves: ['brace'] });
    b.hp = Math.floor(b.maxHp * 0.3);
    const st = play(fight(mk('thornwick', 'lucky_streak', { moves: ['bump'] }), b, 'phoenix').state).state;
    return activeOf(st, 1).hp;
  };
  assert.ok(falling('phoenix_down') > falling('lucky_streak'), 'it rose from the ashes');
  const tide = activeMove(mk('pufflet', 'moonwater'), getMove('squirt'));
  assert.equal(tide.type, 'Fairy');
  assert.equal(tide.power, Math.round(getMove('squirt').power * 1.1));
});

test('a Nemesis cuts both ways, and the world passives stack their multipliers', () => {
  const hunter = mk('pufflet', 'dragon_nemesis'), plain = mk('pufflet', 'lucky_streak');
  const drake = mk('drakelet', 'lucky_streak'), bare = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(hunter, drake, 'bump'), dmg(plain, drake, 'bump'), 1.25), 'harder against dragons');
  assert.ok(near(dmg(drake, mk('pufflet', 'dragon_nemesis'), 'wyrm_pulse'), dmg(drake, bare, 'wyrm_pulse'), 0.7), 'and softer from them');
  assert.equal(abilityWorldMul('sniffer', 'worldGold'), 1.2);
  assert.equal(abilityWorldMul('sniffer', 'worldXp'), 1.2);
});
