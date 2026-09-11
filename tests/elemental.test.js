import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ELEMENTS, ELEMENT_IDS, isCoreAbility, coreTypes, elementFilterSvg } from '../src/data/elements.js';
import { ABILITIES } from '../src/data/abilities.js';
import { slotsFor } from '../src/data/rigs.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome, makeElemental, rollElemental, elementalOf, validateGenome, encodeGenome, decodeGenome, resolveParts } from '../src/creature/genome.js';
import { fuse, FUSE } from '../src/creature/fusion.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { makeBattler, calcDamage, createBattle, step, activeOf } from '../src/battle/engine.js';
import { WILD_ELEMENTAL, worldFor, wildSpawn, tileAt, TILE } from '../src/game/world.js';

const emberox = (seed) => speciesGenome(SPECIES_BY_ID.emberox, makeRng(seed));

test('every element has a core ability, boosted types and a filter', () => {
  assert.equal(ELEMENT_IDS.length, 14);
  for (const id of ELEMENT_IDS) {
    const e = ELEMENTS[id];
    assert.ok(ABILITIES[e.ability], `${id} ability ${e.ability}`);
    assert.ok(isCoreAbility(e.ability) && coreTypes(e.ability).length, id);
    const live = elementFilterSvg(id, 'x', true), still = elementFilterSvg(id, 'x', false);
    assert.ok(live.startsWith('<filter id="x"') && live.includes('<animate'), `${id} live filter`);
    assert.ok(still.startsWith('<filter id="x"') && !still.includes('<animate'), `${id} still filter`);
    assert.ok(!/undefined|NaN|null/.test(live), `${id} filter tokens`);
  }
  assert.equal(coreTypes('lucky_streak'), null);
});

test('rollElemental respects the chance and marks every slot', () => {
  const plain = emberox('p');
  assert.equal(rollElemental(plain, makeRng('r'), 0), null);
  assert.equal(plain.aura, undefined);
  assert.equal(elementalOf(plain), null);
  const g = emberox('q');
  const elem = rollElemental(g, makeRng('r'), 1);
  assert.ok(ELEMENTS[elem]);
  for (const slot of slotsFor(g.rig)) assert.equal(g.aura[slot], elem);
  assert.equal(g.ability, ELEMENTS[elem].ability);
  const e = elementalOf(g);
  assert.ok(e.pure && e.share === 1 && e.id === elem);
  // the default chance is one in a thousand
  let hits = 0;
  for (let i = 0; i < 20000; i++) if (rollElemental(emberox('c'), makeRng(`roll${i}`))) hits++;
  assert.ok(hits >= 6 && hits <= 45, `hits ${hits} of 20000`);
});

test('auras survive codes and validation drops junk', () => {
  const g = makeElemental(emberox('v'), 'frost');
  const back = decodeGenome(encodeGenome(g));
  assert.deepEqual(back.aura, g.aura);
  assert.equal(back.ability, 'frost_core');
  const junk = JSON.parse(JSON.stringify(g));
  junk.aura = { head: 'lava', tail: 'frost', nope: 'frost' };
  const v = validateGenome(junk);
  assert.deepEqual(v.aura, { tail: 'frost' });
  const none = JSON.parse(JSON.stringify(g)); none.aura = { head: 'nothing' };
  assert.equal(validateGenome(none).aura, undefined);
});

test('fusion passes auras with the parts that were expressed, and the core ability by chance', () => {
  let withAbility = 0, withAura = 0, partial = 0;
  const N = 200;
  for (let i = 0; i < N; i++) {
    const a = makeElemental(emberox(`ea${i}`), 'fire');
    const b = speciesGenome(SPECIES_BY_ID.howlune, makeRng(`eb${i}`));
    const { child, report } = fuse(a, b, makeRng(`ef${i}`));
    for (const slot of slotsFor(child.rig)) {
      const expectAura = report.from[slot] === 0 && !report.mutated[slot];
      assert.equal(Boolean(child.aura && child.aura[slot]), expectAura, `seed ${i} slot ${slot}`);
      if (expectAura) assert.equal(child.aura[slot], 'fire');
    }
    if (child.ability === 'inferno_core') withAbility++;
    const e = elementalOf(child);
    if (e) { withAura++; if (!e.pure) partial++; assert.equal(e.id, 'fire'); }
    else assert.ok(!child.aura);
    assert.ok(isCoreAbility(child.ability) || [a, b].some((p) => p.ability === child.ability) || SPECIES_BY_ID.emberox.abilities.includes(child.ability));
  }
  assert.ok(withAbility > N * 0.3 && withAbility < N * 0.7, `core ability passed ${withAbility}/${N}`);
  assert.ok(withAura > N * 0.9 && partial > N * 0.5, `aura ${withAura}, partial ${partial}`);
  // two plain parents never produce a core ability
  for (let i = 0; i < 20; i++) {
    const child = fuse(emberox(`pa${i}`), speciesGenome(SPECIES_BY_ID.howlune, makeRng(`pb${i}`)), makeRng(`pf${i}`)).child;
    assert.ok(!isCoreAbility(child.ability) && !child.aura);
  }
});

test('elemental parts render with one filter per element', () => {
  const plain = renderCreatureSvg(emberox('r0'), { id: 't' });
  assert.ok(!plain.includes('<filter') && !plain.includes('filter="url('));
  const pure = makeElemental(emberox('r1'), 'water');
  const svg = renderCreatureSvg(pure, { id: 't' });
  assert.equal((svg.match(/<filter id="t-fx-water"/g) || []).length, 1);
  assert.equal((svg.match(/filter="url\(#t-fx-water\)"/g) || []).length, 1, 'a pure Elemental gets one filter on the whole creature');
  assert.ok(svg.includes('<animate'));
  assert.ok(!renderCreatureSvg(pure, { id: 't', animate: false }).includes('<animate'), 'static renders are frozen');
  const one = emberox('r2'); one.aura = { head: 'storm' };
  const mixed = renderCreatureSvg(one, { id: 't' });
  assert.equal((mixed.match(/<filter id="t-fx-storm"/g) || []).length, 1);
  assert.equal((mixed.match(/filter="url\(#t-fx-storm\)"/g) || []).length, 1, 'only the head is filtered');
  const two = emberox('r3'); two.aura = { head: 'storm', tail: 'shadow', markings: 'shadow' };
  const svg2 = renderCreatureSvg(two, { id: 't' });
  assert.ok(svg2.includes('id="t-fx-storm"') && svg2.includes('id="t-fx-shadow"'));
  const drawn = resolveParts(two);
  const expected = ['head', 'tail', 'markings'].filter((s) => drawn[s]).length;
  assert.equal((svg2.match(/filter="url\(#t-fx-/g) || []).length, expected);
});

test('core abilities work in battle', () => {
  const g = emberox('b');
  const foe = speciesGenome(SPECIES_BY_ID.howlune, makeRng('bf'));
  const phys = getMove('bump'), fire = getMove('cinder');
  const plainUser = makeBattler(g, 50, { ability: 'lucky_streak' }), coreUser = makeBattler(g, 50, { ability: 'inferno_core' });
  const plainTarget = makeBattler(foe, 50, { ability: 'lucky_streak' }), quake = makeBattler(foe, 50, { ability: 'quake_core' });
  assert.ok(calcDamage(coreUser, plainTarget, fire, 1, 1, false) > calcDamage(plainUser, plainTarget, fire, 1, 1, false), 'Inferno Core boosts Fire');
  assert.equal(calcDamage(coreUser, plainTarget, phys, 1, 1, false), calcDamage(plainUser, plainTarget, phys, 1, 1, false), 'but not Normal');
  assert.ok(calcDamage(plainUser, quake, phys, 1, 1, false) < calcDamage(plainUser, plainTarget, phys, 1, 1, false), 'Quake Core softens melee hits');
  // Tide Core heals at the end of the turn; Storm Core raises Speed on entry
  const tide = makeBattler(g, 50, { ability: 'tide_core', moves: ['glare'] });
  const storm = makeBattler(foe, 50, { ability: 'storm_core', moves: ['glare'] });
  const { state } = createBattle({ seed: 'tide', sides: [{ name: 'You', party: [tide] }, { name: 'Foe', party: [storm] }] });
  const me = activeOf(state, 0);
  me.hp = Math.floor(me.maxHp / 2);
  const before = me.hp;
  const after = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]).state;
  assert.ok(activeOf(after, 0).hp > before, 'Tide Core healed');
  assert.ok(activeOf(after, 1).stages.spe >= 1, 'Storm Core sped up on entry');
});

test('capturable wild encounters roll the Elemental chance', () => {
  const old = WILD_ELEMENTAL.chance;
  const world = worldFor('elemental-world');
  const spots = [];
  for (let y = 0; y < world.h && spots.length < 8; y++) for (let x = 0; x < world.w && spots.length < 8; x++) if (tileAt(world, x, y) === TILE.habitat) spots.push([x, y]);
  try {
    WILD_ELEMENTAL.chance = 1;
    spots.forEach(([x, y], i) => {
      const s = wildSpawn(world, x, y, makeRng(`el${i}`));
      assert.ok(ELEMENTS[s.elemental], `spot ${i}`);
      const e = elementalOf(s.genome);
      assert.ok(e && e.pure && e.id === s.elemental);
      assert.equal(s.genome.ability, ELEMENTS[s.elemental].ability);
    });
    WILD_ELEMENTAL.chance = 0;
    spots.forEach(([x, y], i) => assert.ok(!wildSpawn(world, x, y, makeRng(`el${i}`)).elemental));
  } finally { WILD_ELEMENTAL.chance = old; }
});
