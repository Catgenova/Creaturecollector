import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ELEMENTS, ELEMENT_IDS, isCoreAbility, coreTypes, elementFilterSvg, elementFilterPad } from '../src/data/elements.js';
import { ABILITIES } from '../src/data/abilities.js';
import { slotsFor } from '../src/data/rigs.js';
import { getMove } from '../src/data/moves.js';
import { speciesGenome, makeElemental, rollElemental, elementalOf, validateGenome, encodeGenome, decodeGenome, resolveParts } from '../src/creature/genome.js';
import { fuse, FUSE } from '../src/creature/fusion.js';
import { renderCreatureSvg, partBounds } from '../src/creature/render.js';
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
  // A mixed aura filters each part on its own, so the filter is keyed by slot, not by element:
  // its region is sized to that part (see the region test below).
  const one = emberox('r2'); one.aura = { head: 'storm' };
  const mixed = renderCreatureSvg(one, { id: 't' });
  assert.equal((mixed.match(/<filter id="t-fx-head"/g) || []).length, 1);
  assert.equal((mixed.match(/filter="url\(#t-fx-head\)"/g) || []).length, 1, 'only the head is filtered');
  const two = emberox('r3'); two.aura = { head: 'storm', tail: 'shadow', markings: 'shadow' };
  const svg2 = renderCreatureSvg(two, { id: 't' });
  const drawn = resolveParts(two);
  const slots = ['head', 'tail', 'markings'].filter((s) => drawn[s]);
  for (const slot of slots) assert.ok(svg2.includes(`id="t-fx-${slot}"`), `${slot} filter`);
  assert.equal((svg2.match(/filter="url\(#t-fx-/g) || []).length, slots.length);
});

test('an aura filter is given room in user units, so a small part is not squared off', () => {
  // Regression: the region used to be a percentage of the bounding box, which gave a whole
  // creature plenty of room and a single horn almost none. The glow then hit the edge of the
  // region and was clipped into a hard rectangle around the part.
  for (const id of ELEMENT_IDS) {
    const pad = elementFilterPad(id);
    assert.ok(pad >= 8 && pad <= 80, `${id} pad ${pad} looks wrong`);
    const box = [-11, -8, 11, 4];
    const f = elementFilterSvg(id, 'x', true, box);
    assert.ok(f.includes('filterUnits="userSpaceOnUse"'), `${id} uses user units`);
    const at = (a) => Number(f.match(new RegExp(`\\b${a}="(-?[\\d.]+)"`))[1]);
    assert.ok(at('x') <= box[0] - pad && at('y') <= box[1] - pad, `${id} origin`);
    assert.ok(at('x') + at('width') >= box[2] + pad && at('y') + at('height') >= box[3] + pad, `${id} extent`);
  }
  // no box given, no user-space region: callers that cannot measure still get the old behaviour
  assert.ok(elementFilterSvg('mist', 'x', true).includes('width="160%"'));

  const g = emberox('rg');
  g.aura = { head: 'mist', horns: 'bloom' };
  const svg = renderCreatureSvg(g, { id: 'q', animate: false });
  const regions = [...svg.matchAll(/<filter id="q-fx-(\w+)"([^>]*)>/g)];
  assert.ok(regions.length >= 1);
  const P = resolveParts(g);
  for (const [, slot, attrs] of regions) {
    assert.ok(!attrs.includes('%'), `${slot} region must not be bounding-box relative`);
    const b = partBounds(P[slot]);
    const w = Number(attrs.match(/\bwidth="([\d.]+)"/)[1]), h = Number(attrs.match(/\bheight="(-?[\d.]+)"/)[1]);
    const pad = elementFilterPad(g.aura[slot]);
    assert.ok(w >= b[2] - b[0] + pad * 2 - 0.2, `${slot} width ${w} vs part ${b[2] - b[0]} + 2x${pad}`);
    assert.ok(h >= b[3] - b[1] + pad * 2 - 0.2, `${slot} height ${h} vs part ${b[3] - b[1]} + 2x${pad}`);
  }

  // a pure Elemental still gets one filter, sized to the whole creature
  const pure2 = emberox('rp'); rollElemental(pure2, makeRng('r'), 1);
  const one = renderCreatureSvg(pure2, { id: 'w', animate: false });
  assert.equal((one.match(/<filter /g) || []).length, 1);
  assert.ok(one.includes('filterUnits="userSpaceOnUse"'));
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
