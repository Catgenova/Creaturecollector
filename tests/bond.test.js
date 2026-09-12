// Bond: the points, the tiers, and what each tier is actually worth once a battler is built.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOND, BOND_TIERS, bondOf, bondTier, bondOfMember, bondProgress, addBond, bondAfterBattle, bondPerks } from '../src/game/bond.js';
import { makeBattler, createBattle, step } from '../src/battle/engine.js';
import { speciesGenome } from '../src/creature/genome.js';
import { SPECIES } from '../src/data/species.js';
import { makeMember } from '../src/game/party.js';
import { makeRng } from '../src/core/rng.js';

const genome = () => speciesGenome(SPECIES[0], makeRng('bond:seed'));

test('tiers come in order and each one keeps what the one below it bought', () => {
  assert.equal(BOND_TIERS.length, 5);
  let last = -1;
  for (const t of BOND_TIERS) { assert.ok(t.at > last, `${t.name} sits above the tier below`); last = t.at; }
  assert.ok(BOND_TIERS[BOND_TIERS.length - 1].at < BOND.max, 'the top tier is reachable');
  for (let i = 1; i < BOND_TIERS.length; i++) {
    const below = bondPerks(BOND_TIERS[i - 1].at), here = bondPerks(BOND_TIERS[i].at);
    assert.ok(!below.cure || here.cure, 'a tier never takes a perk away');
    assert.ok(!below.endure || here.endure);
    assert.ok(here.critMul >= below.critMul && here.statMul >= below.statMul);
  }
});

test('perks are read from points, not from a tier number', () => {
  assert.deepEqual(bondPerks(0), { tier: 0, cure: false, endure: false, critMul: 1, statMul: 1 });
  assert.equal(bondPerks(39).cure, false, 'one point short of Willing buys nothing');
  assert.equal(bondPerks(40).cure, true);
  assert.equal(bondPerks(40).endure, false, 'Willing is not Trusted');
  assert.equal(bondPerks(110).endure, true);
  assert.equal(bondPerks(219).critMul, 1);
  assert.equal(bondPerks(220).critMul, 1.5);
  assert.equal(bondPerks(340).statMul, 1.05);
  assert.equal(bondPerks(BOND.max * 10).tier, 4, 'above the top is still the top');
});

test('points clamp, and a member reports the tier it is in', () => {
  const m = makeMember(genome(), 20, 'm');
  assert.equal(m.bond, 0, 'a new member starts at nothing');
  assert.equal(bondOfMember(m).tier, 0);
  addBond(m, 45);
  assert.equal(bondOf(m), 45);
  assert.equal(bondOfMember(m).name, 'Willing');
  const over = addBond(m, 10_000);
  assert.equal(over.to, BOND.max, 'bond stops at the cap');
  const under = addBond(m, -10_000);
  assert.equal(under.to, 0, 'and never goes below nothing');
  assert.equal(addBond(null, 10).to, 0, 'a missing member is not a crash');
});

test('a bar can be drawn from any point on the road', () => {
  const m = makeMember(genome(), 20, 'm');
  const start = bondProgress(m);
  assert.equal(start.tier.tier, 0);
  assert.equal(start.next.name, 'Willing');
  assert.equal(start.need, 40);
  assert.ok(start.frac >= 0 && start.frac < 1);
  addBond(m, BOND.max);
  const top = bondProgress(m);
  assert.equal(top.next, null, 'there is nothing past the top tier');
  assert.equal(top.frac, 1);
});

test('a battle moves the bond of the creatures that were in it', () => {
  const a = makeMember(genome(), 20, 'a'), b = makeMember(genome(), 20, 'b'), c = makeMember(genome(), 20, 'c');
  const party = [a, b, c];
  bondAfterBattle(party, { won: true, fought: new Set([a.uid, b.uid]), fainted: new Set([b.uid]), levels: { [a.uid]: 2 } });
  assert.equal(a.bond, BOND.perBattle + BOND.perLevel * 2, 'fought and levelled');
  assert.equal(b.bond, 0, 'fought but fell: the loss cancels the battle out and stops at nothing');
  assert.equal(c.bond, 0, 'sat it out');
  const d = makeMember(genome(), 20, 'd');
  const rises = bondAfterBattle([d], { won: true, boss: true, fought: new Set([d.uid]), levels: { [d.uid]: 12 } });
  assert.equal(d.bond, BOND.perBattle + BOND.perBoss + BOND.perLevel * 12);
  assert.equal(rises.length, 1, 'crossing a tier is reported');
  assert.equal(rises[0].tier.name, 'Willing');
  bondAfterBattle([d], { won: false, fought: new Set([d.uid]) });
  assert.equal(d.bond, BOND.perBattle + BOND.perBoss + BOND.perLevel * 12, 'losing on its own costs nothing');
});

test('only the top tier touches the stats, and only the player can carry one', () => {
  const g = genome();
  const plain = makeBattler(g, 50);
  const sworn = makeBattler(g, 50, { bond: 220 });
  const top = makeBattler(g, 50, { bond: 400 });
  assert.deepEqual(sworn.stats, plain.stats, 'a sharper eye is not a stat');
  assert.ok(top.stats.hp > plain.stats.hp, 'Inseparable is worth a little of everything');
  assert.ok(top.stats.hp <= Math.ceil(plain.stats.hp * 1.05));
  assert.equal(plain.bond, 0, 'anything built without a bond fights at zero');
  assert.equal(makeBattler(g, 50, { bond: -50 }).bond, 0);
});

test('the cure fires once a battle and then waits for the next one', () => {
  const g = genome();
  const { state } = createBattle({ sides: [{ party: [makeBattler(g, 50, { bond: 400 })] }, { party: [makeBattler(g, 50)] }], seed: 'bond:cure' });
  state.sides[0].party[0].status = 'burn';
  const first = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  const mine = first.state.sides[0].party[0];
  assert.equal(mine.status, null, 'the burn is shaken off for you');
  assert.equal(mine.bondCureUsed, true);
  assert.ok(first.events.some((e) => e.t === 'bond' && e.kind === 'cure'), 'and the log says so');
  mine.status = 'poison';
  const second = step(first.state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  assert.equal(second.state.sides[0].party[0].status, 'poison', 'it only happens once');
});

test('a bonded creature hangs on once, and only once', () => {
  const g = genome();
  const mine = makeBattler(g, 5, { bond: 400 });
  const { state } = createBattle({ sides: [{ party: [mine] }, { party: [makeBattler(g, 100)] }], seed: 'bond:endure' });
  assert.equal(state.sides[0].party[0].bondEndureUsed, false, 'the hold is waiting at the start');
  const first = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  const held = first.state.sides[0].party[0];
  assert.equal(held.fainted, false, 'a level 100 blow does not put it down');
  assert.equal(held.hp, 1);
  assert.equal(held.bondEndureUsed, true);
  assert.ok(first.events.some((e) => e.t === 'bond' && e.kind === 'endure'));
  const second = step(first.state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  assert.equal(second.state.sides[0].party[0].fainted, true, 'the next one lands');
});

test('nothing outside the party carries a bond into a fight', () => {
  const g = genome();
  const { state } = createBattle({ sides: [{ party: [makeBattler(g, 50)] }, { party: [makeBattler(g, 50)] }], seed: 'bond:none' });
  for (const side of state.sides) for (const b of side.party) {
    assert.equal(b.bond, 0);
    assert.equal(bondPerks(b.bond).critMul, 1, 'the tuner measures a game with no bond in it');
  }
});
