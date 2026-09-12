import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome, learnsetOf } from '../src/creature/genome.js';
import { createBattle, makeBattler, captureChance, legalActions, step } from '../src/battle/engine.js';
import { PARTY, XP, xpForLevel, xpReward, makeMember, memberMaxHp, xpProgress, gainXp, movesLearnedBetween, learnMove, healParty, moveMember, setLead, canFight, memberById, releaseMember, renameMember, setLocked, NAME_MAX, PRESETS, savePreset, applyPreset, presetMembers } from '../src/game/party.js';

const ember = (seed, level = 8) => makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng(seed)), level, `u-${seed}`);

test('xp thresholds, rewards and progress', () => {
  assert.equal(xpForLevel(10), 1000);
  // Red's formula: yield x level / 7, with yields around 60 for a 400 stat total
  assert.equal(xpReward(10, 400, 'wild'), Math.round((400 * XP.yieldPerBst * 10) / 7));
  assert.equal(xpReward(10, 400, 'wild'), 86);
  assert.equal(xpReward(40, 430, 'wild'), Math.round((430 * XP.yieldPerBst * XP.stageYield[2] * 40) / 7), 'evolved foes yield more');
  assert.ok(xpReward(20, 400, 'wild') > xpReward(10, 400, 'wild'));
  assert.equal(xpReward(20, 400, 'boss'), Math.round(xpReward(20, 400, 'wild') * XP.trainerBonus));
  assert.equal(xpReward(20, 400, 'trainer'), xpReward(20, 400, 'boss'));
  assert.ok(xpReward(1, 400, 'wild') >= 1);
  const m = ember('p');
  assert.equal(m.xp, xpForLevel(8));
  assert.equal(m.hp, memberMaxHp(m));
  const p = xpProgress(m);
  assert.ok(p.frac === 0 && p.next === xpForLevel(9) && p.prev === xpForLevel(8));
  m.level = PARTY.maxLevel; m.xp = xpForLevel(PARTY.maxLevel);
  assert.equal(xpProgress(m).frac, 1, 'capped members are full');
});

test('xp gain levels up, grows current hp with max hp, and learns or queues moves', () => {
  const m = ember('xp');
  const before = { level: m.level, hp: m.hp, max: memberMaxHp(m) };
  const r = gainXp(m, xpForLevel(before.level + 3) - m.xp);
  assert.equal(r.to, before.level + 3);
  assert.equal(m.hp - before.hp, memberMaxHp(m) - before.max);
  assert.ok(m.moves.length <= 4 && m.moves.every((id) => getMove(id)));
  // a member with four moves queues the rest for a prompt
  const late = ember('late', 5);
  const owner = { party: [late], box: [], pendingLearns: [] };
  const r2 = gainXp(late, xpForLevel(40) - late.xp);
  assert.equal(late.level, 40);
  const expected = movesLearnedBetween({ ...late, moves: late.moves }, 5, 40);
  assert.ok(r2.learned.length + r2.pending.length >= 1);
  assert.ok(learnsetOf(late.genome).some(([lvl]) => lvl > 5 && lvl <= 40));
  for (const id of r2.pending) owner.pendingLearns.push({ uid: late.uid, moveId: id });
  if (r2.pending.length) {
    const first = owner.pendingLearns[0];
    const old = late.moves[0];
    learnMove(owner, first.uid, first.moveId, 0);
    assert.equal(late.moves[0], first.moveId);
    assert.ok(!owner.pendingLearns.some((q) => q.moveId === first.moveId));
    learnMove(owner, late.uid, old, null);
    assert.equal(late.moves.length, 4);
  }
  void expected;
});

test('party and box rules: caps, lead, healing, fighting', () => {
  const owner = { party: [], box: [], pendingLearns: [] };
  for (let i = 0; i < 7; i++) { const m = ember(`m${i}`, 10); (owner.party.length < PARTY.max ? owner.party : owner.box).push(m); }
  assert.equal(owner.party.length, 5); assert.equal(owner.box.length, 2);
  moveMember(owner, owner.box[0].uid, 'party');
  assert.equal(owner.party.length, 5, 'party stays capped');
  const outUid = owner.party[4].uid;
  moveMember(owner, outUid, 'box');
  assert.equal(owner.box.length, 3); assert.ok(owner.box.some((m) => m.uid === outUid));
  setLead(owner, owner.party[2].uid);
  assert.equal(owner.party[0].uid, 'u-m2');
  assert.equal(memberById(owner, outUid).uid, outUid); assert.equal(memberById(owner, 'nope'), null);
  for (const m of owner.party) m.hp = 0;
  assert.equal(canFight(owner), false);
  healParty(owner, 0.5, false);
  assert.ok(owner.party.every((m) => m.hp === Math.round(memberMaxHp(m) * 0.5)));
  owner.party[0].status = 'brn';
  healParty(owner, 1, true);
  assert.ok(owner.party.every((m) => m.hp === memberMaxHp(m) && !m.status) && canFight(owner));
  // a lone member cannot be boxed
  const solo = { party: [ember('solo')], box: [], pendingLearns: [] };
  moveMember(solo, solo.party[0].uid, 'box');
  assert.equal(solo.party.length, 1);
});

test('capture odds behave and a capture ends the battle as a win', () => {
  const mine = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, makeRng('me')), 30);
  const wild = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('wild')), 8);
  const { state } = createBattle({ sides: [{ name: 'You', party: [mine] }, { name: 'Wild', ai: true, party: [wild] }], seed: 'cap', capturable: true });
  const foe = state.sides[1].party[0];
  const full = captureChance(foe), weak = captureChance({ ...foe, hp: 1 }), asleep = captureChance({ ...foe, hp: 1, status: 'slp' });
  assert.ok(full < weak && weak <= asleep && asleep <= 0.95 && full >= 0.03);
  assert.ok(legalActions(state, 0).some((a) => a.type === 'capture'));
  let caught = null;
  for (let s = 0; s < 40 && !caught; s++) {
    const st = structuredClone(state);
    st.seed = `catch${s}`;
    st.sides[1].party[0].hp = 1;
    const r = step(st, [{ type: 'capture' }, { type: 'move', index: 0 }]);
    if (r.state.captured) caught = r;
    else assert.ok(r.events.some((e) => e.t === 'capture' && !e.ok));
  }
  assert.ok(caught, 'a capture landed within 40 seeds');
  assert.equal(caught.state.phase, 'over');
  assert.equal(caught.state.winner, 0);
});

test('release lets a creature go from the party or the box, but never the last one with you', () => {
  const owner = { party: [ember('r1'), ember('r2')], box: [ember('r3')], pendingLearns: [{ uid: 'u-r2', moveId: 'rake' }, { uid: 'u-r1', moveId: 'mend' }] };
  assert.equal(releaseMember(owner, 'nobody').ok, false);
  assert.equal(releaseMember(owner, 'u-r3').ok, true);
  assert.deepEqual(owner.box, []);
  const r = releaseMember(owner, 'u-r2');
  assert.equal(r.ok, true); assert.equal(r.member.uid, 'u-r2');
  assert.deepEqual(owner.party.map((m) => m.uid), ['u-r1']);
  assert.deepEqual(owner.pendingLearns, [{ uid: 'u-r1', moveId: 'mend' }], 'queued learns for the released creature are dropped');
  const last = releaseMember(owner, 'u-r1');
  assert.equal(last.ok, false); assert.match(last.reason, /at least one/);
  assert.equal(owner.party.length, 1);
  assert.equal(memberById(owner, 'u-r2'), null);
});

test('rename trims and caps a nickname; lock keeps a creature from release', () => {
  const owner = { party: [ember('n1'), ember('n2')], box: [] };
  assert.equal(renameMember(owner, 'nobody', 'X').ok, false);
  assert.deepEqual(renameMember(owner, 'u-n1', '  Big   Red \n'), { ok: true, name: 'Big Red' });
  assert.equal(owner.party[0].genome.name, 'Big Red');
  assert.equal(renameMember(owner, 'u-n1', '   ').ok, false, 'empty names are refused');
  assert.equal(owner.party[0].genome.name, 'Big Red');
  const long = renameMember(owner, 'u-n1', 'A'.repeat(40));
  assert.equal(long.name.length, NAME_MAX);
  assert.deepEqual(setLocked(owner, 'u-n2', true), { ok: true, locked: true });
  assert.equal(owner.party[1].locked, true);
  const r = releaseMember(owner, 'u-n2');
  assert.equal(r.ok, false); assert.match(r.reason, /locked/);
  assert.equal(owner.party.length, 2);
  assert.deepEqual(setLocked(owner, 'u-n2', false), { ok: true, locked: false });
  assert.equal(releaseMember(owner, 'u-n2').ok, true);
  assert.equal(setLocked(owner, 'nobody', true).ok, false);
});

test('teams: three saved arrangements of the roster, put back on at a tap', () => {
  const owner = { party: [], box: [] };
  const mk = (n) => makeMember(speciesGenome(SPECIES_BY_ID.pufflet, makeRng(`team${n}`)), 10 + n, `u${n}`);
  for (let i = 0; i < 7; i++) (i < 3 ? owner.party : owner.box).push(mk(i));

  const saved = savePreset(owner, 0, 'Sweepers');
  assert.equal(saved.name, 'Sweepers');
  assert.deepEqual(saved.uids, ['u0', 'u1', 'u2']);
  assert.equal(owner.presets.length, PRESETS.slots, 'the other slots are there and empty');

  // shuffle the roster about, then put the team back on
  moveMember(owner, 'u3', 'party');
  moveMember(owner, 'u0', 'box');
  assert.deepEqual(owner.party.map((m) => m.uid), ['u1', 'u2', 'u3']);
  const r = applyPreset(owner, 0);
  assert.equal(r.ok, true);
  assert.deepEqual(owner.party.map((m) => m.uid), ['u0', 'u1', 'u2'], 'and in the order it was saved in');
  assert.equal(owner.box.length, 4);
  assert.equal(owner.party.length + owner.box.length, 7, 'nobody was lost or copied');

  // a released member simply drops out of the team
  releaseMember(owner, 'u1');
  assert.deepEqual(presetMembers(owner, 0).map((m) => m.uid), ['u0', 'u2']);
  assert.equal(applyPreset(owner, 0).ok, true);
  assert.equal(applyPreset(owner, 2).ok, false, 'an empty slot has nothing to put on');
  assert.equal(savePreset(owner, 99, '').name, `Team ${PRESETS.slots}`, 'a slot outside the three is the last one');
});
