import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, makeBattler, captureChance, levelCaptureMul, partyTopLevel, step, CAPTURE_LEVEL } from '../src/battle/engine.js';

test('catch odds move 5% per level between your strongest party member and the target, from a fifth to double', () => {
  assert.equal(levelCaptureMul(30, 32), 0.9, 'two levels under: minus ten percent');
  assert.equal(levelCaptureMul(30, 25), 1.25, 'five levels over: plus a quarter');
  assert.equal(levelCaptureMul(30, 30), 1);
  assert.equal(levelCaptureMul(5, 60), CAPTURE_LEVEL.min, 'floored');
  assert.equal(levelCaptureMul(100, 5), CAPTURE_LEVEL.max, 'capped at double');
  assert.equal(levelCaptureMul(undefined, 30), 1, 'no party level, no change');
  const wild = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('w')), 32);
  const plain = captureChance(wild), under = captureChance(wild, 30), over = captureChance(wild, 40);
  assert.ok(Math.abs(under - plain * 0.9) < 1e-9, `${under} vs ${plain * 0.9}`);
  assert.ok(Math.abs(over - Math.min(0.95, plain * 1.4)) < 1e-9);
  assert.ok(captureChance({ ...wild, hp: 1, status: 'slp' }, 100) <= 0.95 && captureChance(wild, 1) >= 0.03, 'the usual caps hold');
});

test('the battle uses the highest level on your side, fainted or not, when a capture is attempted', () => {
  const lead = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, makeRng('a')), 12);
  const big = makeBattler(speciesGenome(SPECIES_BY_ID.glacub, makeRng('b')), 40);
  const wild = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('c')), 30);
  const { state } = createBattle({ sides: [{ name: 'You', party: [lead, big] }, { name: 'Wild', ai: true, party: [wild] }], seed: 'lvcap', capturable: true });
  assert.equal(partyTopLevel(state), 40);
  state.sides[0].party[1].hp = 0; state.sides[0].party[1].fainted = true;
  assert.equal(partyTopLevel(state), 40, 'a fainted heavyweight still counts');
  // a party far below the target lands captures less often than one far above it, over the same seeds
  const attempts = (partyLevel) => {
    let hits = 0;
    for (let s = 0; s < 120; s++) {
      const st = structuredClone(state);
      st.seed = `lv${s}`;
      st.sides[0].party[1].level = partyLevel; st.sides[0].party[0].level = Math.min(partyLevel, 12);
      st.sides[1].party[0].hp = Math.floor(st.sides[1].party[0].maxHp / 2);
      const r = step(st, [{ type: 'capture' }, { type: 'move', index: 0 }]);
      if (r.state.captured) hits++;
    }
    return hits;
  };
  const weak = attempts(14), strong = attempts(46);
  assert.ok(strong > weak, `${strong} catches at Lv 46 vs ${weak} at Lv 14`);
});
