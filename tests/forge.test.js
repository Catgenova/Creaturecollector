// The charm forge: two of the same charm and gold make its greater form, which is never sold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { CHARMS, CHARM_SHOP, CHARM_IDS, FORGEABLE, greaterOf, charmValue, charmUses, charmPowerMul, CHARM_RULE } from '../src/data/charms.js';
import { getMove } from '../src/data/moves.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { makeBattler, calcDamage, createBattle, step, activeOf } from '../src/battle/engine.js';
import { newJourney } from '../src/game/journey.js';
import { makeMember } from '../src/game/party.js';
import { forgeList, forgeCost, forgeCharm, bagCount, charmCatalogue } from '../src/game/market.js';

const mk = (id, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`fg-${id}`)), 50, { ability: 'lucky_streak', ...opts });
function journeyWithBag(bag, gold = 60000) {
  const j = newJourney('forge');
  j.party = [makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('fp')), 40, 'u0')];
  j.bag = { ...bag };
  j.gold = gold;
  return j;
}

test('every ordinary charm has a greater form with its own numbers, and none of them are for sale', () => {
  assert.equal(FORGEABLE.length, CHARM_SHOP.length);
  for (const id of FORGEABLE) {
    const up = greaterOf(id);
    assert.ok(up && up.grade === 2 && up.from === id, id);
    assert.equal(up.kind, CHARMS[id].kind, 'a greater charm keeps its kind');
    assert.equal(up.cost, CHARMS[id].cost * 3);
    assert.ok(up.desc.length > 10 && up.name.startsWith('Greater '));
    assert.ok(!CHARM_SHOP.includes(up.id) && !charmCatalogue().some((row) => row.charm.id === up.id), `${up.id} is on the shelf`);
  }
  assert.equal(CHARM_IDS.length, CHARM_SHOP.length * 2);
});

test('a greater charm hits harder, heals more and fires twice', () => {
  assert.ok(charmValue('fire_charm_2', 'typeMul') > charmValue('fire_charm', 'typeMul'));
  assert.equal(charmValue('fire_charm', 'typeMul'), CHARM_RULE.typeMul, 'an ordinary charm keeps the ordinary rule');
  assert.ok(charmValue('moss_charm_2', 'regen') > CHARM_RULE.regen);
  assert.ok(charmValue('swift_charm_2', 'speedMul') > CHARM_RULE.speedMul);
  assert.equal(charmUses('sturdy_charm_2'), 2);
  assert.equal(charmUses('sturdy_charm'), 1);

  const foe = mk('pufflet');
  const plain = mk('emberox', { held: 'fire_charm' }), greater = mk('emberox', { held: 'fire_charm_2' });
  const hit = (u) => calcDamage(u, foe, getMove('fire_stream'), 1, 1, false);
  assert.ok(hit(greater) > hit(plain), `${hit(greater)} vs ${hit(plain)}`);
  assert.equal(charmPowerMul('fire_charm_2', getMove('squirt')), 1, 'and only for its own type');
});

test('the forge eats two charms and the gold, and refuses anything else', () => {
  const j = journeyWithBag({ fire_charm: 2 });
  const cost = forgeCost('fire_charm');
  assert.equal(cost, CHARMS.fire_charm.cost * 2);
  const list = forgeList(j);
  assert.equal(list.length, 1);
  assert.ok(list[0].ready && list[0].into.id === 'fire_charm_2');
  const before = j.gold;
  const r = forgeCharm(j, 'fire_charm');
  assert.ok(r.ok, r.reason);
  assert.equal(bagCount(j, 'fire_charm'), 0, 'both went into it');
  assert.equal(bagCount(j, 'fire_charm_2'), 1);
  assert.equal(j.gold, before - cost);

  const one = journeyWithBag({ water_charm: 1 });
  assert.match(forgeCharm(one, 'water_charm').reason, /two/);
  const poor = journeyWithBag({ water_charm: 2 }, 10);
  assert.match(forgeCharm(poor, 'water_charm').reason, /gold/);
  assert.equal(forgeCharm(journeyWithBag({ fire_charm_2: 2 }), 'fire_charm_2').ok, false, 'a greater charm is the top');
  assert.equal(forgeCharm(journeyWithBag({}), 'nonsense').ok, false);
});

test('a Greater Sturdy Charm saves its holder twice in one battle', () => {
  const frail = (held) => { const b = mk('pufflet', { held, moves: ['brace'] }); b.stats.hp = 30; b.maxHp = 30; b.hp = 30; return b; };
  const heavy = () => mk('oakfist', { moves: ['all_out_brawl'] });
  const run = (held) => {
    let st = createBattle({ sides: [{ name: 'A', party: [heavy()] }, { name: 'B', party: [frail(held)] }], seed: 'sturdy' }).state;
    const saves = [];
    for (let turn = 0; turn < 2 && !activeOf(st, 1).fainted; turn++) {
      const out = step(st, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
      st = out.state;
      saves.push(activeOf(st, 1).hp);
      if (!activeOf(st, 1).fainted) activeOf(st, 1).hp = activeOf(st, 1).maxHp; // back to full, so the charm can fire again
    }
    return saves;
  };
  assert.deepEqual(run('sturdy_charm_2'), [1, 1], 'twice a battle');
  assert.equal(run('sturdy_charm')[0], 1, 'the ordinary one holds once');
});
