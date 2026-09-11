import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { validateGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, captureChance, legalActions } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';
import { ARENA, floorLevel, xpForLevel, newRun, chooseStarter, encounterFor, buildBattle, applyBattle, previewFusion, fuseMembers, moveMember, setLead, memberMaxHp, gainXp, makeMember } from '../src/game/run.js';
import { emptySave, normalizeSave, exportSave, importSave, loadSave, persistSave, recordCollection, endRun, SAVE_KEY } from '../src/game/save.js';

function fakeStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }

function playOut(state, seed) {
  let guard = 0;
  while (state.phase !== 'over' && guard++ < 600) {
    const rng = makeRng(`${seed}:${state.turn}:${state.phase}`);
    const actions = [0, 1].map((i) => chooseAction(state, i, rng.fork(`s${i}`)));
    ({ state } = step(state, actions));
  }
  return state;
}

test('floor curve and xp thresholds', () => {
  assert.equal(floorLevel(1), ARENA.baseLevel + ARENA.levelPerFloor);
  assert.ok(floorLevel(49) === 100 && floorLevel(200) === 100);
  for (let f = 1; f < 60; f++) assert.ok(floorLevel(f + 1) >= floorLevel(f));
  assert.equal(xpForLevel(10), 1000);
});

test('a new run offers three distinct starters and picks deterministically', () => {
  const a = newRun('seed-1'), b = newRun('seed-1');
  assert.deepEqual(a.starters.map((g) => g.species), b.starters.map((g) => g.species));
  assert.equal(new Set(a.starters.map((g) => g.species)).size, 3);
  assert.ok(a.starters.every((g) => g.gen === 0));
  chooseStarter(a, 1);
  assert.equal(a.phase, 'floor');
  assert.equal(a.party.length, 1);
  assert.equal(a.party[0].level, ARENA.starterLevel);
  assert.equal(a.party[0].hp, memberMaxHp(a.party[0]));
  assert.ok(a.encounter && a.encounter.kind === 'wild');
});

test('encounters follow the floor rules and are valid', () => {
  const run = newRun('enc');
  let sawFusion = false;
  for (let f = 1; f <= 30; f++) {
    const e = encounterFor(run, f);
    const L = floorLevel(f);
    if (f % 5 === 0) {
      assert.equal(e.kind, 'boss', `floor ${f}`);
      assert.equal(e.foes[0].genome.gen, 2, 'boss leader is a gen-2 fusion');
      assert.equal(e.foes[0].level, Math.min(100, L));
      assert.equal(e.foes.length, Math.min(5, 1 + Math.floor(f / 5)));
      assert.ok(!e.capturable);
    } else if (f % 3 === 0) {
      assert.equal(e.kind, 'trainer', `floor ${f}`);
      assert.equal(e.foes.length, Math.max(1, Math.min(5, Math.floor(f / 3))));
      assert.ok(!e.capturable);
    } else {
      assert.equal(e.kind, 'wild', `floor ${f}`);
      assert.equal(e.foes.length, 1);
      assert.ok(e.capturable);
      assert.ok(Math.abs(e.foes[0].level - L) <= 1);
    }
    for (const foe of e.foes) {
      assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(foe.genome))), `floor ${f}`);
      assert.ok(foe.level >= 2 && foe.level <= 100);
      if (foe.genome.gen > 0) sawFusion = true;
    }
    assert.deepEqual(encounterFor(run, f), e, 'deterministic');
  }
  assert.ok(sawFusion, 'wild fusions appear in deeper floors');
});

test('winning floors grants xp, levels and advances; losing ends the run', () => {
  const run = chooseStarter(newRun('climb'), 0);
  // give the starter a big head start so early floors are wins
  run.party[0].level = 30; run.party[0].xp = xpForLevel(30); run.party[0].hp = memberMaxHp(run.party[0]);
  let wins = 0;
  for (let i = 0; i < 6 && run.phase === 'floor'; i++) {
    const floor = run.floor;
    const { state } = buildBattle(run);
    assert.equal(state.capturable, run.encounter.capturable);
    const final = playOut(state, `c${i}`);
    const { report } = applyBattle(run, final);
    if (report.won) {
      wins++;
      assert.equal(run.floor, floor + 1);
      assert.ok(report.xp > 0);
      assert.ok(run.party[0].xp >= xpForLevel(run.party[0].level));
      assert.ok(run.encounter, 'next encounter ready');
    } else {
      assert.equal(run.phase, 'gameover');
    }
  }
  assert.ok(wins >= 3, `won ${wins}`);
  assert.ok(run.party[0].level > 30, 'levelled up');
});

test('xp gain levels up and grows current hp with max hp', () => {
  const run = chooseStarter(newRun('xp'), 0);
  const m = run.party[0];
  const before = { level: m.level, hp: m.hp, max: memberMaxHp(m) };
  const r = gainXp(m, xpForLevel(before.level + 3) - m.xp);
  assert.equal(r.to, before.level + 3);
  assert.equal(m.hp - before.hp, memberMaxHp(m) - before.max);
});

test('capture odds behave and a capture adds a member', () => {
  const run = chooseStarter(newRun('catch'), 0);
  const { state } = buildBattle(run);
  const foe = state.sides[1].party[0];
  const full = captureChance(foe);
  const weak = captureChance({ ...foe, hp: 1 });
  const asleep = captureChance({ ...foe, hp: 1, status: 'slp' });
  assert.ok(full < weak && weak <= asleep && asleep <= 0.95 && full >= 0.03);
  assert.ok(legalActions(state, 0).some((a) => a.type === 'capture'));
  // weaken the foe, then try captures across seeds until one lands
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
  const { report } = applyBattle(run, caught.state);
  assert.ok(report.captured && run.party.length === 2);
  assert.equal(run.stats.captures, 1);
  assert.ok(report.xp > 0, 'captures award xp');
  assert.equal(run.floor, 2);
});

test('party overflow goes to the box; altar fusion consumes two members', () => {
  const run = chooseStarter(newRun('box'), 0);
  for (let i = 0; i < 6; i++) {
    const g = newRun(`extra${i}`).starters[0];
    const nm = makeMember(g, 10, `x${i}`);
    (run.party.length < ARENA.partyMax ? run.party : run.box).push(nm);
  }
  assert.equal(run.party.length, 5);
  assert.equal(run.box.length, 2);
  moveMember(run, run.box[0].uid, 'party');
  assert.equal(run.party.length, 5, 'party stays capped');
  moveMember(run, run.party[4].uid, 'box');
  assert.equal(run.box.length, 3);
  setLead(run, run.party[2].uid);
  const a = run.party[0].uid, b = run.box[0].uid;
  const preview = previewFusion(run, a, b);
  const { child } = fuseMembers(run, a, b);
  assert.deepEqual(child.genome, preview, 'preview matches the real child');
  assert.equal(child.level, 10);
  assert.ok(!run.party.concat(run.box).some((m) => m.uid === a || m.uid === b));
  assert.equal(run.stats.fusions, 1);
  assert.ok(run.party.every((m) => m.hp === memberMaxHp(m)), 'altar heals fully');
  assert.equal(run.altar, false);
});

test('save round-trips, survives garbage, and retires runs into the collection', () => {
  const storage = fakeStorage();
  assert.deepEqual(loadSave(storage), emptySave());
  const s = emptySave();
  s.run = chooseStarter(newRun('save'), 2);
  recordCollection(s, s.run.party[0].genome, 1);
  assert.equal(recordCollection(s, s.run.party[0].genome, 1), false, 'no duplicate species');
  assert.ok(persistSave(s, storage));
  const back = loadSave(storage);
  assert.equal(back.run.seed, 'save');
  assert.equal(back.run.party[0].genome.name, s.run.party[0].genome.name);
  assert.equal(back.collection.length, 1);
  const code = exportSave(s);
  assert.ok(code.startsWith('CCSAVE1.'));
  assert.deepEqual(importSave(code).run.party[0].genome, s.run.party[0].genome);
  assert.throws(() => importSave('nope'));
  assert.deepEqual(normalizeSave({ v: 99 }), emptySave());
  const junk = normalizeSave({ v: 1, run: { phase: 'floor', party: [{ genome: { v: 1 } }] }, collection: [{ genome: null }] });
  assert.equal(junk.run, null);
  assert.equal(junk.collection.length, 0);
  s.run.phase = 'gameover'; s.run.floor = 7; s.run.stats.captures = 2;
  endRun(s);
  assert.equal(s.run, null);
  assert.equal(s.best.floor, 7);
  assert.equal(s.best.runs, 1);
  assert.equal(s.totals.captures, 2);
  storage.setItem(SAVE_KEY, '{not json');
  assert.deepEqual(loadSave(storage), emptySave());
});
