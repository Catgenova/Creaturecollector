import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { WILD_SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { TYPE_LIST } from '../src/data/types.js';
import { validateGenome, cladeOf } from '../src/creature/genome.js';
import { WORLD, TILE, WALKABLE_TILES, BIOME_ORDER, REGIONS, COUNCIL_LEVELS, generateWorld, worldFor, tileAt, biomeAt, habitatTypeAt, trainerAt, isWalkable, findPath, reachableFrom, worldStats, habitatTypesFor, spawnWeight, wildSpawn, levelAt } from '../src/game/world.js';

const world = worldFor('test-world');

test('the world is deterministic, sized and split into seven biomes around a hub', () => {
  const again = generateWorld('test-world');
  assert.equal(Buffer.from(world.tiles).equals(Buffer.from(again.tiles)), true);
  assert.equal(Buffer.from(world.hab).equals(Buffer.from(again.hab)), true);
  assert.deepEqual(world.trainers.map((t) => [t.id, t.x, t.y]), again.trainers.map((t) => [t.id, t.x, t.y]));
  assert.equal(world.w, WORLD.w); assert.equal(world.h, WORLD.h);
  assert.equal(world.biomes.length, 7);
  assert.deepEqual(world.biomes.map((b) => b.clade), BIOME_ORDER);
  const { kinds, perBiome } = worldStats(world);
  for (const b of BIOME_ORDER) assert.ok(perBiome[b] > world.w * world.h * 0.06, `${b} covers enough ground (${perBiome[b]})`);
  assert.ok(kinds[TILE.habitat] > 1500 && kinds[TILE.wall] > 1000 && kinds[TILE.water] > 500 && kinds[TILE.path] > 400, JSON.stringify(kinds));
  assert.equal(kinds[TILE.door], 7); assert.equal(kinds[TILE.spireDoor], 1); assert.equal(kinds[TILE.shrine], 1); assert.equal(kinds[TILE.camp], 8);
  assert.equal(tileAt(world, world.hub.x, world.hub.y), TILE.hub);
  for (let x = 0; x < world.w; x++) { assert.equal(tileAt(world, x, 0), TILE.wall); assert.equal(tileAt(world, x, world.h - 1), TILE.wall); }
  assert.equal(tileAt(world, -1, 5), TILE.wall, 'outside is wall');
  // difficulty rises around the ring, and every biome deepens from the crossroads to its lair
  for (let i = 1; i < world.biomes.length; i++) assert.ok(world.biomes[i].level > world.biomes[i - 1].level);
  for (const b of world.biomes) {
    assert.equal(levelAt(world, b.lair.x, b.lair.y), b.level, `${b.id} lair at full level`);
    assert.ok(levelAt(world, b.camp.x, b.camp.y) < b.level || b.level <= 6, `${b.id} camp below the lair`);
  }
  let nearMax = 0, edgeMax = 0;
  for (let y = world.hub.y - 9; y <= world.hub.y + 9; y++) for (let x = world.hub.x - 9; x <= world.hub.x + 9; x++) {
    const d = Math.hypot(x - world.hub.x, y - world.hub.y);
    if (d <= 9) nearMax = Math.max(nearMax, levelAt(world, x, y));
    if (d <= 7) edgeMax = Math.max(edgeMax, levelAt(world, x, y));
  }
  assert.ok(edgeMax <= 5, `level 1 to 5 at the town's edge (max ${edgeMax})`);
  assert.ok(nearMax <= 9, `gentle around the crossroads (max ${nearMax})`);
  assert.equal(levelAt(world, world.hub.x, world.hub.y + WORLD.hubR + 1), 1, 'the first steps south are level 1');
  assert.ok(world.biomes[6].level >= 50 && world.biomes[6].level < 60, 'the deepest lair sits in the fifties');
});

test('every camp, lair, the spire and the shrine can be walked to from the start', () => {
  const reach = reachableFrom(world, world.start);
  const key = (p) => p.y * world.w + p.x;
  assert.ok(isWalkable(world, world.start.x, world.start.y));
  for (const p of [world.spireDoor, world.shrine, world.hubCamp]) assert.ok(reach.has(key(p)), `hub point ${p.x},${p.y}`);
  for (const b of world.biomes) {
    assert.ok(reach.has(key(b.camp)), `${b.id} camp`);
    assert.ok(reach.has(key(b.lair.front)), `${b.id} lair front`);
    assert.equal(tileAt(world, b.lair.door.x, b.lair.door.y), TILE.door);
    assert.equal(tileAt(world, b.lair.x, b.lair.y), TILE.lair);
    assert.ok(reach.has(key(b.lair.door)), `${b.id} lair door`);
    assert.equal(biomeAt(world, b.lair.door.x, b.lair.door.y).id, b.id, `${b.id} door sits in its own biome`);
  }
  // paths respect trainers and walls
  const p = findPath(world, world.start, world.biomes[0].camp, 400);
  assert.ok(p && p.length > 10, 'path to the first camp');
  for (const s of p) assert.ok(isWalkable(world, s.x, s.y));
  assert.equal(findPath(world, world.start, { x: 0, y: 0 }), null, 'no path into the border');
  assert.deepEqual(findPath(world, world.start, world.start), []);
});

test('trainers stand on walkable tiles with valid teams of their biome; wardens and the council are strong', () => {
  assert.equal(world.trainers.length, 7 * WORLD.trainersPerBiome);
  const seen = new Set();
  for (const t of world.trainers) {
    assert.ok(!seen.has(`${t.x},${t.y}`), 'one trainer per tile'); seen.add(`${t.x},${t.y}`);
    assert.ok(WALKABLE_TILES.has(tileAt(world, t.x, t.y)), `${t.id} on walkable ground`);
    assert.equal(trainerAt(world, t.x, t.y), t);
    assert.ok(!isWalkable(world, t.x, t.y), 'a trainer blocks the tile');
    assert.ok(t.team.length >= 2 && t.team.length <= 4, `${t.id} team size ${t.team.length}`);
    const L = levelAt(world, t.x, t.y);
    assert.ok(L <= REGIONS[t.biome].level, `${t.id} local level ${L} within its region's ceiling`);
    for (const m of t.team) { assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(m.genome)))); assert.ok(m.level >= L - 1 && m.level <= L + 2, `${t.id} level ${m.level} vs local ${L}`); }
    assert.ok(t.team.filter((m) => cladeOf(m.genome) === t.biome).length >= 1, `${t.id} fields its class`);
    assert.ok(t.name && t.line && t.after);
  }
  for (const b of world.biomes) {
    const w = world.wardens[b.clade];
    assert.equal(w.team.length, 5);
    assert.equal(w.team[0].genome.gen, 2, `${b.id} warden leads with a gen-2 fusion`);
    assert.ok(w.team.every((m) => cladeOf(m.genome) === b.clade), `${b.id} warden team is all ${b.clade}`);
    assert.ok(w.team.every((m) => m.level >= b.level + 3 && m.level <= b.level + 6));
    assert.equal(w.badge, REGIONS[b.clade].badge);
  }
  assert.equal(world.council.length, 4);
  world.council.forEach((c, i) => {
    assert.equal(c.level, COUNCIL_LEVELS[i]);
    assert.equal(c.team.length, 5);
    if (i) assert.ok(c.level > world.council[i - 1].level);
    for (const m of c.team) { assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(m.genome)))); assert.ok(m.level >= c.level - 1 && m.level <= c.level); }
  });
  assert.equal(world.council[3].team.filter((m) => m.genome.gen === 2).length, 2, 'the champion fields two fusions');
});

test('habitats carry the element types of their class and spawns follow class, element and rarity', () => {
  for (const b of world.biomes) {
    const types = new Set(habitatTypesFor(b.clade).map(([t]) => t));
    assert.ok(types.size >= 2, `${b.id} has several habitat types`);
    let n = 0;
    for (let y = 0; y < world.h; y += 2) for (let x = 0; x < world.w; x += 2) {
      if (tileAt(world, x, y) !== TILE.habitat || biomeAt(world, x, y) !== b) continue;
      const t = habitatTypeAt(world, x, y);
      assert.ok(TYPE_LIST.includes(t) && types.has(t), `${b.id} habitat type ${t}`);
      n++;
    }
    assert.ok(n > 40, `${b.id} has habitat (${n})`);
  }
  assert.ok(spawnWeight(SPECIES_BY_ID.emberox, 'mammal', 'Fire') > spawnWeight(SPECIES_BY_ID.pufflet, 'mammal', 'Fire'), 'class and element beat class alone');
  assert.ok(spawnWeight(SPECIES_BY_ID.solmane, 'mammal', 'Fire') < spawnWeight(SPECIES_BY_ID.emberox, 'mammal', 'Fire'), 'rare species are rarer');
  assert.ok(spawnWeight(SPECIES_BY_ID.finnip, 'mammal', 'Fire') < 0.05, 'strangers are rare visitors');
  // sample spawns on the downs and in the lagoon
  for (const b of [world.biomes[0], world.biomes[4]]) {
    const spots = [];
    for (let y = 0; y < world.h && spots.length < 20; y++) for (let x = 0; x < world.w && spots.length < 20; x++) if (tileAt(world, x, y) === TILE.habitat && biomeAt(world, x, y) === b) spots.push([x, y]);
    let home = 0, typed = 0, alpha = 0, rare = 0, n = 0, strong = 0;
    for (let i = 0; i < 600; i++) {
      const [x, y] = spots[i % spots.length];
      const s = wildSpawn(world, x, y, makeRng(`sp${b.id}${i}`));
      const L = levelAt(world, x, y);
      n++;
      if (cladeOf(s.genome) === b.clade) home++;
      if (s.genome.types.includes(habitatTypeAt(world, x, y))) typed++;
      if (s.alpha) alpha++;
      if (SPECIES_BY_ID[s.genome.species].tier === 'rare') rare++;
      if (s.level > L + 2) strong++;
      assert.equal(s.areaLevel, L);
      assert.ok(s.level >= Math.max(1, L - 2) && s.level <= L + 15, `level ${s.level} at local ${L}`);
      assert.doesNotThrow(() => validateGenome(JSON.parse(JSON.stringify(s.genome))));
    }
    assert.ok(home / n > 0.6, `${b.id}: ${home}/${n} at home`);
    assert.ok(typed / n > 0.3, `${b.id}: ${typed}/${n} match the patch element`);
    assert.ok(alpha / n > 0.005 && alpha / n < 0.1, `${b.id}: ${alpha} alphas`);
    assert.ok(rare / n < 0.15, `${b.id}: ${rare} rares`);
    assert.ok(strong / n > 0.06 && strong / n < 0.3, `${b.id}: ${strong} stronger than the area`);
  }
});
