import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { TYPE_LIST } from '../src/data/types.js';
import { speciesGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { BOUNTY, bountyLevelMul, ensureBounties, openBounties, bountyAccepts, bountyPayout, bountyCandidates, turnInBounty, normalizeBounties } from '../src/game/bounties.js';
import { newJourney, chooseJourneyStarter, tryMove } from '../src/game/journey.js';
import { makeMember, setLocked } from '../src/game/party.js';
import { giveCharm, bagCount } from '../src/game/market.js';
import { normalizeJourney } from '../src/game/save.js';
import { WORLD, TILE, worldFor, tileAt, isWalkable, findPath, reachableFrom } from '../src/game/world.js';

const fusionOf = (a, b, seed, level, uid) => makeMember(fuse(speciesGenome(SPECIES_BY_ID[a], makeRng(`${seed}a`)), speciesGenome(SPECIES_BY_ID[b], makeRng(`${seed}b`)), makeRng(seed)).child, level, uid);

test('five bounties stand at a time, no two of a type, deterministic, priced by badges; the level bonus runs 1.01 to 2.00', () => {
  const j = newJourney('bounty'); chooseJourneyStarter(j, 0);
  const open = openBounties(j);
  assert.equal(open.length, BOUNTY.open);
  assert.equal(new Set(open.map((b) => b.type)).size, BOUNTY.open);
  for (const b of open) { assert.ok(TYPE_LIST.includes(b.type)); assert.ok(b.gold >= BOUNTY.baseGold * BOUNTY.typeSpread[0] - 10 && b.gold <= BOUNTY.baseGold * BOUNTY.typeSpread[1] + 10 && b.gold % 10 === 0, `${b.type} ${b.gold}`); }
  const k = newJourney('bounty'); chooseJourneyStarter(k, 0);
  assert.deepEqual(openBounties(k), open);
  assert.equal(bountyLevelMul(1), 1.01); assert.equal(bountyLevelMul(50), 1.5); assert.equal(bountyLevelMul(100), 2); assert.equal(bountyLevelMul(0), 1.01); assert.equal(bountyLevelMul(140), 2);
  const rich = newJourney('rich'); chooseJourneyStarter(rich, 0); rich.badges = ['mammal', 'amphibian', 'flora', 'insect']; rich.bounties = { issued: 0, done: 0, open: [] };
  const avg = (jj) => openBounties(jj).reduce((s, b) => s + b.gold, 0) / BOUNTY.open;
  assert.ok(avg(rich) > avg(j), 'badges raise the prices');
});

test('a bounty takes a fusion of its type from the party or storage, pays gold times the level bonus, and is replaced', () => {
  const j = newJourney('turnin'); chooseJourneyStarter(j, 0);
  const bounty = openBounties(j)[0];
  // build a fusion carrying the wanted type: an emberox (Fire) fused with a glacub (Ice) gives Fire/Ice or Ice/Fire; pick species by type instead
  const withType = Object.values(SPECIES_BY_ID).filter((s) => s.clade === 'mammal' && s.types[0] === bounty.type && !s.hidden);
  const partner = Object.values(SPECIES_BY_ID).find((s) => s.clade === 'mammal' && s.types[0] !== bounty.type && !s.hidden);
  if (!withType.length) { assert.ok(true, `no mammal leads with ${bounty.type}`); return; }
  const m = fusionOf(withType[0].id, partner.id, 'fz', 40, 'fz');
  assert.ok(m.genome.gen === 1 && m.genome.types.includes(bounty.type), m.genome.types.join('/'));
  const plain = makeMember(speciesGenome(withType[0], makeRng('plain')), 40, 'pl');
  assert.equal(bountyAccepts(bounty, plain), false, 'a wild creature of the type is not a fusion');
  assert.equal(bountyAccepts(bounty, m), true);
  assert.equal(bountyPayout(bounty, m), Math.round((bounty.gold * 1.4) / 10) * 10);
  j.box.push(m); j.party.push(plain);
  assert.deepEqual(bountyCandidates(j, bounty).map((c) => c.member.uid), ['fz']);
  assert.equal(turnInBounty(j, bounty.id, 'pl').ok, false);
  assert.equal(turnInBounty(j, 'nope', 'fz').ok, false);
  j.bag = { fire_charm: 1 }; giveCharm(j, 'fz', 'fire_charm');
  setLocked(j, 'fz', true);
  assert.match(turnInBounty(j, bounty.id, 'fz').reason, /locked/);
  setLocked(j, 'fz', false);
  const gold = j.gold;
  const r = turnInBounty(j, bounty.id, 'fz');
  assert.ok(r.ok, r.reason);
  assert.equal(r.paid, bountyPayout(bounty, m)); assert.equal(r.mult, 1.4);
  assert.equal(j.gold, gold + r.paid);
  assert.ok(!j.box.some((x) => x.uid === 'fz'));
  assert.equal(bagCount(j, 'fire_charm'), 1, 'its charm came back');
  assert.equal(j.stats.bounties, 1);
  const after = openBounties(j);
  assert.equal(after.length, BOUNTY.open);
  assert.ok(!after.some((b) => b.id === bounty.id));
  assert.equal(new Set(after.map((b) => b.type)).size, BOUNTY.open);
  assert.equal(turnInBounty(j, bounty.id, 'fz').ok, false, 'gone');
});

test('the last party member cannot be handed over; the office survives the save and drops junk', () => {
  const j = newJourney('last'); chooseJourneyStarter(j, 0);
  const bounty = openBounties(j)[0];
  const lead = j.party[0];
  lead.genome.gen = 1; lead.genome.types = [bounty.type, null];
  assert.match(turnInBounty(j, bounty.id, lead.uid).reason, /at least one/);
  const raw = JSON.parse(JSON.stringify(j));
  raw.bounties.open[1] = { id: 'x', type: 'Plaid', gold: 100 };
  raw.bounties.open[2].gold = -5;
  raw.bounties.open[3].type = raw.bounties.open[0].type;
  const back = normalizeJourney(raw);
  assert.equal(back.bounties.open.length, BOUNTY.open);
  assert.equal(new Set(back.bounties.open.map((b) => b.type)).size, BOUNTY.open);
  assert.ok(!back.bounties.open.some((b) => b.type === 'Plaid' || b.gold <= 0));
  assert.equal(back.bounties.open[0].id, raw.bounties.open[0].id, 'the good ones keep their place');
  assert.equal(normalizeBounties(null).open.length, 0);
  assert.equal(ensureBounties({ seed: 'x', badges: [] }).open.length, BOUNTY.open);
});

test('the Bounty Office stands on the square with its door walkable, and stepping on the door opens it', () => {
  const world = worldFor('office');
  assert.equal(tileAt(world, world.bountyDoor.x, world.bountyDoor.y), TILE.bountyDoor);
  assert.ok(isWalkable(world, world.bountyDoor.x, world.bountyDoor.y));
  for (let y = world.bounty.y; y <= world.bounty.y + 1; y++) for (let x = world.bounty.x - 1; x <= world.bounty.x + 1; x++) assert.equal(tileAt(world, x, y), TILE.bounty);
  const reach = reachableFrom(world, world.start);
  assert.ok(reach.has(world.bountyDoor.y * world.w + world.bountyDoor.x));
  assert.ok(reach.has((world.board.y + 1) * world.w + world.board.x), 'the board is still readable');
  for (const b of world.biomes) assert.ok(reach.has(b.camp.y * world.w + b.camp.x), `${b.id} camp reachable`);
  const j = newJourney('office'); chooseJourneyStarter(j, 0);
  const path = findPath(world, j.player, world.bountyDoor, 60);
  assert.ok(path && path.length);
  let ev = null;
  for (const p of path) { const dir = p.x > j.player.x ? 'right' : p.x < j.player.x ? 'left' : p.y > j.player.y ? 'down' : 'up'; const r = tryMove(j, dir); if (r.event) ev = r.event; }
  assert.ok(ev && ev.kind === 'bounty', JSON.stringify(ev));
  assert.equal(WORLD.version, 12);
});
