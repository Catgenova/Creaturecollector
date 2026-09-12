import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { CHARMS, CHARM_IDS, CHARM_SHOP, getCharm, charmPowerMul, WARDEN_CHARMS, CHARM_RULE } from '../src/data/charms.js';
import { getMove } from '../src/data/moves.js';
import { TYPE_LIST } from '../src/data/types.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeOf, effectiveStat } from '../src/battle/engine.js';
import { charmCatalogue, charmList, buyCharm, giveCharm, takeCharm, charmHolders, bagCount, bagList, marketCatalogue } from '../src/game/market.js';
import { newJourney, chooseJourneyStarter, tryMove, challengeWarden, buildJourneyBattle, applyJourneyBattle, shrineFuse, canFuseJourney } from '../src/game/journey.js';
import { makeMember, releaseMember, xpProgress } from '../src/game/party.js';
import { normalizeJourney } from '../src/game/save.js';
import { BIOME_ORDER, worldFor, WORLD } from '../src/game/world.js';

test('the charm table: one type charm per type, distinct Warden gifts, prices and text', () => {
  assert.equal(CHARM_SHOP.length, 31, 'the Market sells the ordinary charms');
  assert.equal(CHARM_IDS.length, 62, 'and every one has a greater form, forged rather than sold');
  for (const t of TYPE_LIST) { const c = CHARMS[`${t.toLowerCase()}_charm`]; assert.ok(c && c.kind === 'type' && c.type === t, t); }
  const names = new Set();
  for (const id of CHARM_IDS) {
    const c = CHARMS[id];
    assert.equal(c.id, id);
    assert.ok(!names.has(c.name), c.name); names.add(c.name);
    assert.ok(c.cost >= 1000 && c.cost % 500 === 0 && c.desc.length >= 10 && /^#/.test(c.color), id);
    assert.ok(['type', 'style', 'regen', 'siphon', 'sturdy', 'crit', 'speed', 'salve', 'xp', 'gold', 'lure', 'prism'].includes(c.kind), id);
  }
  assert.deepEqual(Object.keys(WARDEN_CHARMS).sort(), [...BIOME_ORDER].sort());
  assert.equal(new Set(Object.values(WARDEN_CHARMS)).size, BIOME_ORDER.length, 'no two Wardens give the same charm');
  for (const id of Object.values(WARDEN_CHARMS)) assert.ok(getCharm(id), id);
  assert.equal(charmPowerMul('fire_charm', getMove('cinder')), CHARM_RULE.typeMul);
  assert.equal(charmPowerMul('fire_charm', getMove('squirt')), 1);
  assert.equal(charmPowerMul('brawler_band', getMove('bump')), CHARM_RULE.styleMul);
  assert.equal(charmPowerMul('brawler_band', getMove('bellow')), 1);
  assert.equal(charmPowerMul('nope', getMove('bump')), 1);
  assert.equal(charmCatalogue().length, CHARM_SHOP.length, 'the shop lists the ordinary charms only');
  for (const id of CHARM_IDS.filter((x) => CHARMS[x].grade)) assert.ok(!CHARM_SHOP.includes(id), `${id} is on sale`);
  assert.ok(!marketCatalogue().some((x) => getCharm(x.move.id)), 'charms are not scrolls');
});

const mk = (id, level = 50, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`ch-${id}`)), level, opts);
const fight = (a, b, seed = 'charmfight') => createBattle({ sides: [{ name: 'A', party: [a] }, { name: 'B', party: [b] }], seed }).state;
const play = (state, ma, mb) => step(state, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);

test('type charms and bands lift the right moves; the Swift Charm lifts Speed; an unknown charm is dropped', () => {
  const plain = mk('emberox'), foe = mk('pufflet');
  const ember = mk('emberox', 50, { held: 'fire_charm' }), band = mk('emberox', 50, { held: 'brawler_band' }), junk = mk('emberox', 50, { held: 'wooden_spoon' });
  assert.equal(junk.held, null);
  const fire = getMove('cinder'), normal = getMove('bump');
  const base = calcDamage(plain, foe, fire, 1, 1, false);
  assert.ok(calcDamage(ember, foe, fire, 1, 1, false) > base * 1.1 && calcDamage(ember, foe, fire, 1, 1, false) <= Math.ceil(base * 1.25));
  assert.equal(calcDamage(ember, foe, normal, 1, 1, false), calcDamage(plain, foe, normal, 1, 1, false), 'the wrong type gets nothing');
  assert.ok(calcDamage(band, foe, normal, 1, 1, false) > calcDamage(plain, foe, normal, 1, 1, false), 'a band lifts its damage type');
  assert.equal(calcDamage(band, foe, fire, 1, 1, false), base, 'but not another');
  const swift = mk('emberox', 50, { held: 'swift_charm' });
  assert.equal(effectiveStat(swift, 'spe'), plain.stats.spe * CHARM_RULE.speedMul);
});

test('Moss regenerates, Salve cures once, Siphon heals on hit, Sturdy holds one blow from full HP', () => {
  let a = mk('emberox', 50, { held: 'moss_charm', moves: ['brace'] }), b = mk('pufflet', 50, { moves: ['brace'] });
  let st = fight(a, b); st.sides[0].party[0].hp = 10;
  let r = play(st, 0, 0);
  const heal = r.events.find((e) => e.t === 'heal' && e.side === 0);
  assert.ok(heal && heal.amount === Math.max(1, Math.floor(a.maxHp / 16)) && r.events.some((e) => e.t === 'held' && e.item === 'Moss Charm'));
  a = mk('emberox', 50, { held: 'salve_charm', moves: ['brace'] });
  st = fight(a, b); st.sides[0].party[0].status = 'psn';
  r = play(st, 0, 0);
  assert.equal(activeOf(r.state, 0).status, null);
  assert.ok(r.events.some((e) => e.t === 'cure' && e.why === 'held'));
  let again = r.state; again.sides[0].party[0].status = 'brn';
  r = play(again, 0, 0);
  assert.equal(activeOf(r.state, 0).status, 'brn', 'the salve works once a battle');
  a = mk('emberox', 50, { held: 'siphon_charm', moves: ['bump'] }); b = mk('pufflet', 50, { moves: ['brace'] });
  st = fight(a, b); st.sides[0].party[0].hp = 20;
  r = play(st, 0, 0);
  const dmg = r.events.find((e) => e.t === 'damage' && e.side === 1), sip = r.events.find((e) => e.t === 'heal' && e.side === 0);
  assert.ok(dmg && sip && sip.amount === Math.max(1, Math.floor(dmg.amount / 8)), JSON.stringify([dmg, sip]));
  a = mk('emberox', 100, { moves: ['blaze_tackle'] }); b = mk('pufflet', 5, { held: 'sturdy_charm', moves: ['brace'] });
  st = fight(a, b, 'sturdy-seed');
  r = play(st, 0, 0);
  const foe = activeOf(r.state, 1);
  assert.equal(foe.hp, 1, 'held on at 1 HP');
  assert.ok(r.events.some((e) => e.t === 'held' && e.item === 'Sturdy Charm') && foe.sturdyUsed);
  r = play(r.state, 0, 0);
  assert.ok(activeOf(r.state, 1).fainted, 'the second blow lands');
});

test('charms are bought into the Bag, given, swapped, taken back, and come back on release and fusion', () => {
  const j = newJourney('charms'); chooseJourneyStarter(j, 0);
  j.gold = 20000;
  assert.equal(buyCharm(j, 'nope').ok, false);
  assert.equal(buyCharm(j, 'fire_charm').ok, true);
  assert.equal(buyCharm(j, 'fire_charm').ok, true);
  assert.equal(buyCharm(j, 'moss_charm').ok, true);
  assert.equal(j.gold, 20000 - 2500 * 2 - 3500);
  assert.deepEqual(charmList(j).map((x) => [x.charm.id, x.qty]), [['fire_charm', 2], ['moss_charm', 1]]);
  assert.equal(bagList(j).length, 0, 'charms are not listed among the scrolls');
  const lead = j.party[0];
  assert.equal(giveCharm(j, lead.uid, 'fire_charm').ok, true);
  assert.equal(lead.held, 'fire_charm');
  assert.equal(bagCount(j, 'fire_charm'), 1);
  assert.equal(giveCharm(j, lead.uid, 'fire_charm').ok, false, 'already holds it');
  const swap = giveCharm(j, lead.uid, 'moss_charm');
  assert.equal(swap.ok, true); assert.equal(swap.swapped, 'fire_charm');
  assert.equal(lead.held, 'moss_charm'); assert.equal(bagCount(j, 'fire_charm'), 2); assert.equal(bagCount(j, 'moss_charm'), 0);
  assert.deepEqual(charmHolders(j, 'moss_charm'), [lead.genome.name]);
  assert.equal(takeCharm(j, lead.uid).charmId, 'moss_charm');
  assert.equal(lead.held, null); assert.equal(bagCount(j, 'moss_charm'), 1);
  assert.equal(takeCharm(j, lead.uid).ok, false);
  // release returns the charm
  const extra = makeMember(speciesGenome(SPECIES_BY_ID.pufflet, makeRng('x')), 5, 'jx'); j.party.push(extra);
  giveCharm(j, 'jx', 'fire_charm');
  assert.equal(bagCount(j, 'fire_charm'), 1);
  assert.equal(releaseMember(j, 'jx').ok, true);
  assert.equal(bagCount(j, 'fire_charm'), 2);
  // fusion returns both parents' charms
  const a = makeMember(speciesGenome(SPECIES_BY_ID.emberox, makeRng('a')), 10, 'ja'), b = makeMember(speciesGenome(SPECIES_BY_ID.glacub, makeRng('b')), 10, 'jb');
  j.party.push(a, b);
  giveCharm(j, 'ja', 'fire_charm'); giveCharm(j, 'jb', 'moss_charm');
  assert.ok(canFuseJourney(j, 'ja', 'jb').ok);
  const { child } = shrineFuse(j, 'ja', 'jb');
  assert.equal(child.held, null);
  assert.equal(bagCount(j, 'fire_charm'), 2); assert.equal(bagCount(j, 'moss_charm'), 1);
  // the save keeps held charms and the bag, and drops junk
  giveCharm(j, lead.uid, 'fire_charm');
  const raw = JSON.parse(JSON.stringify(j)); raw.bag.wooden_spoon = 3; raw.party[0].held = 'fire_charm';
  const back = normalizeJourney(raw);
  assert.equal(back.party[0].held, 'fire_charm');
  assert.equal(back.bag.wooden_spoon, undefined);
  assert.equal(back.bag.moss_charm, 1);
  raw.party[0].held = 'wooden_spoon';
  assert.equal(normalizeJourney(raw).party[0].held, null);
});

test('a Warden hands over a charm with the badge; Scholar and Lucky Coin lift experience and gold; a Lure draws creatures out', () => {
  const j = newJourney('gift'); chooseJourneyStarter(j, 0);
  j.party[0].level = 60; j.party[0].hp = 9999;
  challengeWarden(j, 'mammal');
  const { state } = buildJourneyBattle(j);
  const s = JSON.parse(JSON.stringify(state)); s.phase = 'over'; s.winner = 0; for (const f of s.sides[1].party) { f.hp = 0; f.fainted = true; }
  const { report } = applyJourneyBattle(j, s);
  assert.equal(report.badge, 'Downs Badge');
  assert.equal(report.charm, WARDEN_CHARMS.mammal);
  assert.equal(bagCount(j, WARDEN_CHARMS.mammal), 1);
  const goldPlain = report.gold;
  // a rematch with a Lucky Coin in the party pays half again (on the quarter rematch rate)
  giveCharm(j, j.party[0].uid, 'lucky_coin'); j.bag.lucky_coin = 1; giveCharm(j, j.party[0].uid, 'lucky_coin');
  j.party[0].held = 'lucky_coin';
  challengeWarden(j, 'mammal');
  const { state: st2 } = buildJourneyBattle(j);
  const s2 = JSON.parse(JSON.stringify(st2)); s2.phase = 'over'; s2.winner = 0; for (const f of s2.sides[1].party) { f.hp = 0; f.fainted = true; }
  const r2 = applyJourneyBattle(j, s2).report;
  assert.equal(r2.charm, null, 'only the first win brings a charm');
  const rematchGold = Math.max(10, Math.round((goldPlain * 0.25) / 10) * 10); // the quarter share is rounded to tens first, then the coin's half again
  assert.equal(r2.gold, Math.round((rematchGold * CHARM_RULE.goldMul) / 10) * 10);
  // Scholar: the holder's share is half again
  const k = newJourney('scholar'); chooseJourneyStarter(k, 0);
  const plain = newJourney('scholar'); chooseJourneyStarter(plain, 0);
  k.party[0].held = 'scholar_charm';
  const gained = [];
  for (const jj of [k, plain]) {
    challengeWarden(jj, 'mammal'); jj.party[0].level = 60; jj.party[0].xp = Math.pow(60, 3); jj.party[0].hp = 9999;
    const { state: st } = buildJourneyBattle(jj);
    const d = JSON.parse(JSON.stringify(st)); d.phase = 'over'; d.winner = 0; for (const f of d.sides[1].party) { f.hp = 0; f.fainted = true; }
    const before = jj.party[0].xp;
    applyJourneyBattle(jj, d);
    gained.push(jj.party[0].xp - before);
  }
  assert.ok(gained[1] > 0);
  assert.equal(gained[0], Math.floor(gained[1] * CHARM_RULE.xpMul));
  // Lure: walking the same habitat patch with the lead holding a Lure springs at least as many encounters
  const count = (held) => {
    const jj = newJourney('lure'); chooseJourneyStarter(jj, 0); jj.party[0].held = held;
    const world = worldFor(jj.seed);
    let n = 0;
    for (let i = 0; i < 400; i++) {
      // stand on a habitat tile and step back and forth across it
      const b = world.biomes[0];
      let x = -1, y = -1;
      outer: for (let yy = 2; yy < world.h - 2; yy++) for (let xx = 2; xx < world.w - 2; xx++) if (world.tiles[yy * world.w + xx] === 1 && world.tiles[yy * world.w + xx + 1] === 1) { x = xx; y = yy; break outer; }
      jj.player.x = x; jj.player.y = y; jj.cooldown = 0; jj.encounter = null; jj.stats.steps = i * 7;
      const r = tryMove(jj, 'right');
      if (r.event && r.event.kind === 'encounter') n++;
      void b;
    }
    return n;
  };
  const withLure = count('lure_charm'), without = count(null);
  assert.ok(withLure > without, `${withLure} with a lure vs ${without} without`);
  assert.ok(withLure > 400 * WORLD.encounterChance * 1.4, `${withLure} encounters in 400 tries`);
});
