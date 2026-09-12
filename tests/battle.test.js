import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { MOVES, getMove, isDamaging, moveFx } from '../src/data/moves.js';
import { ABILITIES } from '../src/data/abilities.js';
import { TYPE_LIST } from '../src/data/types.js';
import { speciesGenome, randomGenome, validateGenome, learnsetOf } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { statsAtLevel, movesAtLevel } from '../src/battle/stats.js';
import { createBattle, step, legalActions, makeBattler, calcDamage, describeEvent, activeOf } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';
import { simulate, tournament } from '../src/battle/sim.js';

const wild = (seed) => randomGenome(makeRng(seed));

test('move and ability tables are well formed', () => {
  const ids = new Set();
  for (const mv of MOVES) {
    assert.ok(!ids.has(mv.id), `duplicate move ${mv.id}`); ids.add(mv.id);
    assert.ok(TYPE_LIST.includes(mv.type), mv.id);
    assert.ok(['melee', 'ranged', 'magic', 'status'].includes(mv.cat), mv.id);
    if (mv.cat === 'status') assert.equal(mv.power, 0, mv.id);
    else assert.ok(mv.power > 0 || moveFx(mv, 'fixed'), mv.id);
    assert.ok(mv.pp > 0 && (mv.acc == null || (mv.acc > 0 && mv.acc <= 100)), mv.id);
    for (const f of mv.fx) assert.ok(['status', 'stat', 'flinch', 'drain', 'recoil', 'heal', 'multi', 'fixed', 'boostIfStatus', 'restore', 'cure', 'pierce', 'recharge', 'cleanse', 'boostIfLow', 'boostIfFirst'].includes(f.k), `${mv.id} fx ${f.k}`);
  }
  for (const s of SPECIES) {
    assert.ok(s.learnset.length >= 6, `${s.id} learnset`);
    for (const [lvl, id] of s.learnset) { assert.ok(lvl >= 1 && getMove(id), `${s.id} learns unknown ${id}`); }
    const ids = s.learnset.map(([, id]) => id);
    assert.equal(new Set(ids).size, ids.length, `${s.id} learns the same move twice`);
    assert.ok(s.learnset.some(([, id]) => isDamaging(getMove(id)) && s.learnset.find(([l]) => l === 1)), `${s.id} needs a level-1 move`);
    for (const a of s.abilities) assert.ok(ABILITIES[a], `${s.id} ability ${a}`);
  }
});

test('genomes carry learnsets and abilities through validation and fusion', () => {
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('l'));
  assert.ok(g.learnset.length && ABILITIES[g.ability]);
  const v = validateGenome(JSON.parse(JSON.stringify({ ...g, learnset: [[1, 'nope']], ability: 'x' })));
  assert.equal(v.learnset.length, SPECIES_BY_ID.emberox.learnset.length);
  assert.ok(ABILITIES[v.ability]);
  const { child } = fuse(g, speciesGenome(SPECIES_BY_ID.glacub, makeRng('m')), makeRng('f'));
  assert.ok(child.learnset.length >= 6 && child.learnset.length <= 12);
  for (const [, id] of child.learnset) assert.ok(['Normal', ...child.types].includes(getMove(id).type));
  assert.ok(ABILITIES[child.ability]);
});

test('level stats and move picks are sane', () => {
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('st'));
    const st = statsAtLevel(g, 50);
    assert.ok(st.hp > 80 && st.hp < 260, `${s.id} hp ${st.hp}`);
    for (const k of ['melee', 'ranged', 'magic', 'meleeDef', 'rangedDef', 'magicDef', 'spe']) assert.ok(st[k] > 10 && st[k] < 220, `${s.id} ${k} ${st[k]}`);
    const l1 = statsAtLevel(g, 1), l100 = statsAtLevel(g, 100);
    assert.ok(l1.hp < st.hp && st.hp < l100.hp);
    for (const L of [1, 5, 20, 50, 100]) {
      const mv = movesAtLevel(learnsetOf(g), L);
      assert.ok(mv.length >= 1 && mv.length <= 4, `${s.id} L${L}`);
      assert.ok(mv.some((id) => isDamaging(getMove(id))), `${s.id} L${L} has a damaging move`);
    }
  }
});

function quickBattle(seedA, seedB, level = 50, seed = 'b') {
  return createBattle({
    sides: [
      { name: 'You', party: [makeBattler(wild(seedA), level)] },
      { name: 'Foe', party: [makeBattler(wild(seedB), level)] },
    ],
    seed,
  });
}

test('battles are deterministic and never mutate input state', () => {
  const { state } = quickBattle('a1', 'b1');
  const before = JSON.stringify(state);
  const r1 = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  const r2 = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(r1, r2);
  assert.ok(r1.events.some((e) => e.t === 'move'));
  assert.ok(r1.events.every((e) => typeof describeEvent(e) === 'string'));
});

test('damage formula respects STAB, effectiveness and burn', () => {
  const fire = makeBattler(speciesGenome(SPECIES_BY_ID.emberox, makeRng('x')), 50, { ability: 'lucky_streak' });
  const grass = makeBattler(speciesGenome(SPECIES_BY_ID.sprigget, makeRng('y')), 50);
  const water = makeBattler(speciesGenome(SPECIES_BY_ID.finnip, makeRng('z')), 50);
  const mv = getMove('fire_stream');
  const vsGrass = calcDamage(fire, grass, mv, 2, 1, false);
  const vsWater = calcDamage(fire, water, mv, 0.5, 1, false);
  assert.ok(vsGrass > vsWater * 2, `${vsGrass} vs ${vsWater}`);
  const phys = getMove('blaze_tackle');
  const healthy = calcDamage(fire, grass, phys, 2, 1, false);
  const burned = calcDamage({ ...fire, status: 'brn' }, grass, phys, 2, 1, false);
  assert.ok(burned <= Math.floor(healthy / 2) + 1, `${burned} vs ${healthy}`);
  const crit = calcDamage(fire, grass, phys, 2, 1, true);
  assert.ok(crit > healthy);
  assert.equal(calcDamage(fire, grass, getMove('wraith_touch'), 1, 1, false), 50);
});

test('illegal actions are rejected', () => {
  const { state } = quickBattle('a2', 'b2');
  assert.throws(() => step(state, [{ type: 'switch', index: 0 }, { type: 'move', index: 0 }]));
  assert.throws(() => step(state, [{ type: 'move', index: 9 }, { type: 'move', index: 0 }]));
});

test('knockouts force replacements and the battle ends with a winner', () => {
  const strong = makeBattler(speciesGenome(SPECIES_BY_ID.drakelet, makeRng('s')), 100);
  const weakA = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('w1')), 5);
  const weakB = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('w2')), 5);
  let { state } = createBattle({ sides: [{ party: [strong] }, { party: [weakA, weakB] }], seed: 'ko' });
  let r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  state = r.state;
  assert.ok(r.events.some((e) => e.t === 'faint' && e.side === 1), 'foe fainted');
  assert.equal(state.phase, 'replace');
  assert.deepEqual(legalActions(state, 0), []);
  assert.deepEqual(legalActions(state, 1), [{ type: 'switch', index: 1 }]);
  r = step(state, [null, { type: 'switch', index: 1 }]);
  state = r.state;
  assert.equal(state.phase, 'choose');
  assert.equal(activeOf(state, 1).name, weakB.name);
  r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  state = r.state;
  assert.equal(state.phase, 'over');
  assert.equal(state.winner, 0);
  assert.ok(r.events.some((e) => e.t === 'end' && e.winner === 0));
  assert.deepEqual(legalActions(state, 0), []);
});

test('switching is a legal action that changes the active battler', () => {
  const a = makeBattler(wild('sw1'), 30), b = makeBattler(wild('sw2'), 30), c = makeBattler(wild('sw3'), 30);
  const { state } = createBattle({ sides: [{ party: [a, b] }, { party: [c] }], seed: 'sw' });
  assert.ok(legalActions(state, 0).some((x) => x.type === 'switch' && x.index === 1));
  const r = step(state, [{ type: 'switch', index: 1 }, { type: 'move', index: 0 }]);
  assert.equal(r.state.sides[0].active, 1);
  assert.ok(r.events.some((e) => e.t === 'switch' && e.side === 0 && !e.initial));
});

test('struggle appears when PP runs out', () => {
  const g = wild('pp');
  const b = makeBattler(g, 50, { moves: ['blur'] }); // 5 PP
  const foe = makeBattler(speciesGenome(SPECIES_BY_ID.craggon, makeRng('rock')), 100, { moves: ['brace'] });
  let { state } = createBattle({ sides: [{ party: [b] }, { party: [foe] }], seed: 'pp' });
  for (let i = 0; i < 5 && state.phase === 'choose'; i++) state = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]).state;
  if (state.phase === 'choose') {
    const legal = legalActions(state, 0);
    assert.ok(legal.some((x) => x.struggle), JSON.stringify(legal));
    const r = step(state, [legal.find((x) => x.struggle), { type: 'move', index: 0 }]);
    assert.ok(r.events.some((e) => e.t === 'move' && e.moveId === 'struggle'));
  }
});

test('status moves apply status and stat changes with the expected text', () => {
  const user = makeBattler(wild('u'), 50, { moves: ['numb_pulse', 'whetting', 'mend'] });
  const target = makeBattler(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('t')), 50, { moves: ['brace'] });
  let paralyzed = false, rose = false;
  for (let s = 0; s < 12 && !paralyzed; s++) {
    const { state } = createBattle({ sides: [{ party: [user] }, { party: [target] }], seed: `st${s}` });
    const r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
    if (r.events.some((e) => e.t === 'status' && e.status === 'par' && e.side === 1)) {
      paralyzed = true;
      assert.equal(activeOf(r.state, 1).status, 'par');
      const again = step(r.state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
      assert.ok(again.events.some((e) => e.t === 'no_effect' && e.reason === 'already'));
    }
    const r2 = step(state, [{ type: 'move', index: 1 }, { type: 'move', index: 0 }]);
    const ev = r2.events.find((e) => e.t === 'stat' && e.side === 0);
    if (ev) { rose = true; assert.equal(ev.stages, 2); assert.match(describeEvent(ev), /sharply rose/); }
  }
  assert.ok(paralyzed, 'Numb Pulse never paralyzed in 12 seeds');
  assert.ok(rose);
});

test('AI always returns legal actions and random battles finish', () => {
  let finished = 0, turns = 0;
  for (let i = 0; i < 60; i++) {
    const level = 50;
    const partyA = [wild(`A${i}a`), wild(`A${i}b`), wild(`A${i}c`)];
    const partyB = [wild(`B${i}a`), wild(`B${i}b`), wild(`B${i}c`)];
    const r = simulate({ partyA, partyB, level, seed: `sim${i}`, maxTurns: 300 });
    assert.equal(r.state.phase, 'over', `battle ${i} did not finish in ${r.turns} turns`);
    finished++;
    turns += r.turns;
    for (const side of r.state.sides) for (const b of side.party) {
      assert.ok(b.hp >= 0 && b.hp <= b.maxHp, 'hp bounds');
      assert.ok(b.moves.every((m) => m.pp >= 0 && m.pp <= m.maxPp), 'pp bounds');
      assert.ok(Object.values(b.stages).every((s) => s >= -6 && s <= 6), 'stage bounds');
      assert.equal(b.fainted, b.hp === 0);
    }
  }
  assert.equal(finished, 60);
  assert.ok(turns / 60 < 60, `average turns ${turns / 60}`);
});

test('AI picks obvious knockouts and legal replacements', () => {
  const { state } = quickBattle('ai1', 'ai2');
  const rng = makeRng('ai');
  for (const side of [0, 1]) {
    const a = chooseAction(state, side, rng);
    assert.ok(legalActions(state, side).some((x) => x.type === a.type && x.index === a.index));
  }
  const t = tournament({ games: 12, level: 50, seed: 'tt', partySize: 2 });
  assert.equal(t.timeouts, 0);
  assert.ok(Object.keys(t.species).length > 3);
});

test('status-inflicting moves respect type immunity', () => {
  const zapper = makeBattler(wild('zz'), 50, { moves: ['numb_pulse'] });
  const ground = makeBattler(speciesGenome(SPECIES_BY_ID.dustoat, makeRng('g')), 50, { moves: ['brace'] });
  const { state } = createBattle({ sides: [{ party: [zapper] }, { party: [ground] }], seed: 'imm' });
  const r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
  assert.ok(r.events.some((e) => e.t === 'immune' && e.side === 1) || r.events.some((e) => e.t === 'miss'));
  assert.equal(activeOf(r.state, 1).status, null);
});

test('every passive skill has a name and a description in the game\'s own stat words', () => {
  for (const [id, a] of Object.entries(ABILITIES)) {
    assert.ok(a.name && a.desc && a.desc.length > 12, id);
    assert.ok(!/\bSp\. ?Atk\b|\bSp\. ?Def\b|\bAttack\b|\bDefense\b/.test(a.desc), `${id} names a stat this game does not have: ${a.desc}`);
  }
});

test('new passives: surges, regrowth, hide, bulwark, mirror, steady, quick start and keen edge', () => {
  const mk = (id, level, ability, moves) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`${id}${level}`)), level, { ability, moves });
  // surges: 1.5x for the type when HP is a third or less
  for (const [ab, mvId, id] of [['frost_heart', 'sleet', 'glacub'], ['storm_heart', 'zap', 'voltmite'], ['venom_heart', 'acid_spit', 'slugmire'], ['gale_heart', 'gale', 'zephyrn'], ['stone_heart', 'stone_toss', 'craggon']]) {
    // level 100 keeps the numbers large enough that integer rounding cannot hide the 1.5x
    const me = mk(id, 100, ab), foe = mk('pufflet', 100, 'lucky_streak');
    const full = calcDamage(me, foe, getMove(mvId), 1, 1, false);
    me.hp = Math.floor(me.maxHp / 3);
    assert.ok(calcDamage(me, foe, getMove(mvId), 1, 1, false) >= Math.floor(full * 1.4), ab);
  }
  // damage-type hides: three quarters
  const atk = mk('bruxor', 50, 'lucky_streak');
  for (const [ab, mvId] of [['iron_hide', 'bump'], ['bulwark', 'squirt'], ['mirror_scale', 'ripple']]) {
    const plain = mk('pufflet', 50, 'lucky_streak'), hard = mk('pufflet', 50, ab);
    const a = calcDamage(atk, plain, getMove(mvId), 1, 1, false), b = calcDamage(atk, hard, getMove(mvId), 1, 1, false);
    assert.ok(b < a && b >= Math.floor(a * 0.7), `${ab} ${b} of ${a}`);
    for (const other of ['bump', 'squirt', 'ripple']) if (other !== mvId) assert.equal(calcDamage(atk, hard, getMove(other), 1, 1, false), calcDamage(atk, plain, getMove(other), 1, 1, false), `${ab} leaves ${other} alone`);
  }
  // steady: the foe cannot lower its stats, its own drawbacks still apply
  {
    const { state } = createBattle({ sides: [{ party: [mk('pufflet', 1, 'steady', ['all_out_brawl'])] }, { party: [mk('craggon', 100, 'lucky_streak', ['yowl'])] }], seed: 'steady' });
    const r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
    const me = r.state.sides[0].party[0];
    assert.equal(me.stages.melee, 0, 'Yowl was refused'); assert.equal(me.stages.ranged, 0);
    assert.equal(me.stages.meleeDef, -1, 'its own All-Out Brawl still cost defence');
    assert.ok(r.events.some((e) => e.t === 'ability' && e.ability === 'Steady'));
  }
  // quick start: +1 Speed on entry
  {
    const { state, events } = createBattle({ sides: [{ party: [mk('pufflet', 20, 'quick_start')] }, { party: [mk('pufflet', 20, 'lucky_streak')] }], seed: 'qs' });
    assert.equal(state.sides[0].party[0].stages.spe, 1); assert.equal(state.sides[1].party[0].stages.spe, 0);
    assert.ok(events.some((e) => e.t === 'ability' && e.ability === 'Quick Start'));
  }
  // regrowth: a sixteenth back each turn
  {
    const me = mk('glacub', 40, 'regrowth', ['brace']); me.hp = 10;
    const { state } = createBattle({ sides: [{ party: [me] }, { party: [mk('pufflet', 40, 'lucky_streak', ['brace'])] }], seed: 'rg' });
    const r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
    assert.equal(r.state.sides[0].party[0].hp, 10 + Math.max(1, Math.floor(me.maxHp / 16)));
  }
  // keen edge: crits about twice as often
  const crits = (ability) => {
    let n = 0;
    for (let k = 0; k < 400; k++) {
      const { state } = createBattle({ sides: [{ party: [mk('bruxor', 30, ability, ['bump'])] }, { party: [mk('craggon', 100, 'lucky_streak', ['brace'])] }], seed: `ke${k}` });
      const r = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]);
      if (r.events.some((e) => e.t === 'damage' && e.crit)) n++;
    }
    return n;
  };
  const base = crits('lucky_streak'), keen = crits('keen_edge');
  assert.ok(keen > base * 1.4 && keen < base * 3.2, `${keen} keen vs ${base} base crits in 400`);
});
