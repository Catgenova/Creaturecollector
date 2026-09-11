// The overworld: one large tile map, generated from a seed, with a hub town in the
// middle and seven biomes around it, one per class. Each biome is home to its class:
// its habitat patches carry the element types found in that class, so a Fire mammal
// turns up on scorched downs and a Water fish in the lagoon shallows. Difficulty rises
// around the ring, so the recommended order is a lap. Every biome has a camp that heals,
// a lair where its Warden waits with a badge, and a few trainers on the paths who fight
// when asked. The Council Spire in the hub opens with seven badges: four fights in a row.
//
// Everything here is pure data derived from the seed. The map is three Uint8Arrays
// (tile kind, biome index, habitat type) plus placed content.
import { hashSeed, makeRng } from '../core/rng.js';
import { WILD_SPECIES } from '../data/species.js';
import { TYPE_LIST } from '../data/types.js';
import { combatStyle } from '../data/damage.js';
import { ELEMENTAL_CHANCE } from '../data/elements.js';
import { speciesGenome, rollElemental } from '../creature/genome.js';
import { fuse, canFuse } from '../creature/fusion.js';

export const WORLD = { w: 112, h: 96, hubR: 6, ringR: 30, lairR: 43, trainersPerBiome: 4, encounterChance: 0.12, encounterCooldown: 4 };

/** Tile kinds. */
export const TILE = { grass: 0, habitat: 1, path: 2, wall: 3, water: 4, hub: 5, lair: 6, door: 7, camp: 8, spire: 9, spireDoor: 10, shrine: 11 };
export const WALKABLE_TILES = new Set([TILE.grass, TILE.habitat, TILE.path, TILE.hub, TILE.door, TILE.camp, TILE.spireDoor, TILE.shrine]);

/** Biomes in difficulty order, clockwise from the south of the hub. */
export const BIOME_ORDER = ['mammal', 'amphibian', 'insect', 'bird', 'fish', 'invertebrate', 'reptile'];

/** Per-class region: name, wild level, palette and the look of its walls. */
export const REGIONS = {
  mammal:       { name: 'Heather Downs',  level: 6,  ground: '#6d9c4e', ground2: '#63914a', habitat: '#4f8a3e', path: '#c9b27b', water: '#3f7fc4', wall: 'tree',     wallColor: '#3f7332', accent: '#e0c86f', waterT: 0.68, warden: 'Warden Marrow', badge: 'Downs Badge' },
  amphibian:    { name: 'Sodden Fen',     level: 15, ground: '#5f8c5a', ground2: '#56825a', habitat: '#456f4a', path: '#b3a26f', water: '#3b6f8a', wall: 'reed',     wallColor: '#6a8a3a', accent: '#a7d36a', waterT: 0.56, warden: 'Warden Sedge',  badge: 'Fen Badge' },
  insect:       { name: 'Hum Meadow',     level: 24, ground: '#8fb050', ground2: '#84a84a', habitat: '#6f9a3c', path: '#d3bd82', water: '#4a94c8', wall: 'hedge',    wallColor: '#4c7d2e', accent: '#f0d25a', waterT: 0.7,  warden: 'Warden Thrum',  badge: 'Meadow Badge' },
  bird:         { name: 'Windward Crags', level: 33, ground: '#7c8f78', ground2: '#72866f', habitat: '#617a5c', path: '#b9b39a', water: '#4d8fc4', wall: 'pine',     wallColor: '#2f5a44', accent: '#cfe3f0', waterT: 0.68, warden: 'Warden Gale',   badge: 'Crag Badge' },
  fish:         { name: 'Glass Lagoon',   level: 42, ground: '#d8c68e', ground2: '#cebb84', habitat: '#8fc7d3', path: '#e6d9a8', water: '#3aa7d8', wall: 'palm',     wallColor: '#4f8f5f', accent: '#7fe0ea', waterT: 0.5,  warden: 'Warden Brine',  badge: 'Lagoon Badge' },
  invertebrate: { name: 'Murk Hollow',    level: 51, ground: '#5a5470', ground2: '#524c68', habitat: '#443f5c', path: '#8c8494', water: '#3b3f6e', wall: 'rock',     wallColor: '#3a3448', accent: '#b98cff', waterT: 0.62, warden: 'Warden Gloam',  badge: 'Hollow Badge' },
  reptile:      { name: 'Ember Scar',     level: 60, ground: '#9c6b4a', ground2: '#906244', habitat: '#7a4d38', path: '#d0a878', water: '#e0562a', wall: 'rock',     wallColor: '#5a3a2c', accent: '#ff9a4a', waterT: 0.7,  warden: 'Warden Cinder', badge: 'Scar Badge' },
};

export const HUB = { name: 'Crossroads', ground: '#b8ad8e', paving: '#a89c7e' };

/** Rarity by tier: the stronger a species, the rarer it is in the wild. */
export const WILD_RARITY = { common: 1, uncommon: 0.45, rare: 0.12 };
/** Odds of a stronger wild creature: an alpha well above the area level, or one a few levels up. */
export const WILD_LEVEL = { alpha: 0.04, alphaBoost: [8, 12], strong: 0.14, strongBoost: [3, 6], spread: 2 };
export const COUNCIL_LEVELS = [66, 70, 74, 80];
/** Odds that a wild creature is born of an element (a knob so tests can force it). */
export const WILD_ELEMENTAL = { chance: ELEMENTAL_CHANCE };

// ---- noise ---------------------------------------------------------------------

function lerp01(a, b, t) { return a + (b - a) * t; }
function latticeHash(seedNum, i, j) {
  let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + seedNum) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
/** Smooth value noise in [0,1). */
function valueNoise(seedNum, x, y, scale) {
  const fx = x / scale, fy = y / scale;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  return lerp01(lerp01(latticeHash(seedNum, x0, y0), latticeHash(seedNum, x0 + 1, y0), sx), lerp01(latticeHash(seedNum, x0, y0 + 1), latticeHash(seedNum, x0 + 1, y0 + 1), sx), sy);
}
function fbm(seedNum, x, y, scale) { return 0.65 * valueNoise(seedNum, x, y, scale) + 0.35 * valueNoise(seedNum ^ 0x9e3779b9, x, y, scale / 2); }

// ---- map helpers ---------------------------------------------------------------

export function inBounds(world, x, y) { return x >= 0 && y >= 0 && x < world.w && y < world.h; }
export function tileAt(world, x, y) { return inBounds(world, x, y) ? world.tiles[y * world.w + x] : TILE.wall; }
export function biomeAt(world, x, y) { return inBounds(world, x, y) ? world.biomes[world.bio[y * world.w + x]] : world.biomes[0]; }
/** The element type of a habitat tile (null elsewhere). */
export function habitatTypeAt(world, x, y) { const k = inBounds(world, x, y) ? world.hab[y * world.w + x] : 0; return k ? TYPE_LIST[k - 1] : null; }
export function trainerAt(world, x, y) { return world.trainerAt.get(`${x},${y}`) || null; }
/** Can the player stand here? Walkable ground with no trainer on it. */
export function isWalkable(world, x, y) { return WALKABLE_TILES.has(tileAt(world, x, y)) && !trainerAt(world, x, y); }
export function isHubTile(world, x, y) { const dx = x - world.hub.x, dy = y - world.hub.y; return dx * dx + dy * dy <= WORLD.hubR * WORLD.hubR; }

/**
 * The wild level at a tile. Each biome deepens from the Crossroads to its lair: about a third
 * of the region's level at the hub's edge (a quarter, never below 4), the full level at the lair. So the
 * ring's hard side is survivable near town and the danger reads on the HUD as you walk out.
 */
export function levelAt(world, x, y) {
  const b = biomeAt(world, x, y);
  const d = Math.hypot(x - world.hub.x, y - world.hub.y);
  const t = Math.max(0, Math.min(1, (d - WORLD.hubR) / (WORLD.lairR - WORLD.hubR)));
  const edge = Math.max(4, b.level * 0.25);
  return Math.round(edge + (b.level - edge) * t);
}

/** Shortest walk from `from` to `to` (list of steps excluding the start), or null. Trainers block; `to` may be a trainer tile, in which case the path stops next to it. */
export function findPath(world, from, to, maxSteps = 90) {
  if (from.x === to.x && from.y === to.y) return [];
  const goalTrainer = Boolean(trainerAt(world, to.x, to.y));
  if (!goalTrainer && !isWalkable(world, to.x, to.y)) return null;
  const key = (x, y) => y * world.w + x;
  const prev = new Map([[key(from.x, from.y), -1]]);
  const queue = [[from.x, from.y, 0]];
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (let qi = 0; qi < queue.length; qi++) {
    const [x, y, d] = queue[qi];
    if (d >= maxSteps) continue;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (prev.has(k)) continue;
      const isGoal = nx === to.x && ny === to.y;
      if (!isGoal && !isWalkable(world, nx, ny)) continue;
      if (isGoal && goalTrainer) { return unwind(prev, key(x, y), key); }
      prev.set(k, key(x, y));
      if (isGoal) return unwind(prev, k, key);
      queue.push([nx, ny, d + 1]);
    }
  }
  return null;
  function unwind(map, k, keyFn) {
    const out = [];
    while (k !== -1 && k !== keyFn(from.x, from.y)) { out.push({ x: k % world.w, y: Math.floor(k / world.w) }); k = map.get(k); }
    return out.reverse();
  }
}

// ---- species tables ------------------------------------------------------------

/** The element types found in a class, weighted by how many of its species carry them (primary counts double). */
export function habitatTypesFor(clade) {
  const w = new Map();
  for (const s of WILD_SPECIES) {
    if (s.clade !== clade) continue;
    if (s.types[0]) w.set(s.types[0], (w.get(s.types[0]) || 0) + 2);
    if (s.types[1]) w.set(s.types[1], (w.get(s.types[1]) || 0) + 1);
  }
  return [...w.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

/** Weight of a species in a habitat: its class at home, its type in its element, rare visitors otherwise; scaled by tier rarity. */
export function spawnWeight(species, clade, type) {
  const affinity = (species.clade === clade ? 3 : 0) + (type && species.types.includes(type) ? 2 : 0);
  return (WILD_RARITY[species.tier] || 1) * (affinity || 0.03);
}

/** Roll the wild creature for a habitat tile: species by class and element, level by the area with rarer stronger rolls, and the 1/1000 Elemental. */
export function wildSpawn(world, x, y, rng) {
  const biome = biomeAt(world, x, y);
  const type = habitatTypeAt(world, x, y);
  const sp = rng.weighted(WILD_SPECIES, (s) => spawnWeight(s, biome.clade, type));
  const genome = speciesGenome(sp, rng.fork(`g:${sp.id}`));
  const L = levelAt(world, x, y);
  const r = rng.next();
  let level = L + rng.between(-WILD_LEVEL.spread, WILD_LEVEL.spread), alpha = false;
  if (r < WILD_LEVEL.alpha) { level = L + rng.between(WILD_LEVEL.alphaBoost[0], WILD_LEVEL.alphaBoost[1]); alpha = true; }
  else if (r < WILD_LEVEL.alpha + WILD_LEVEL.strong) level = L + rng.between(WILD_LEVEL.strongBoost[0], WILD_LEVEL.strongBoost[1]);
  level = Math.max(2, Math.min(100, level));
  const elemental = rollElemental(genome, rng.fork('elemental'), WILD_ELEMENTAL.chance);
  return { genome, level, alpha, elemental, type, biome: biome.id, areaLevel: L };
}

// ---- content: trainers, wardens, council -----------------------------------------

const WORLD_TRAINER_NAMES = ['Ivy', 'Bram', 'Tobin', 'Sable', 'Wren', 'Oakes', 'Pim', 'Lise', 'Marlo', 'Quill', 'Hesper', 'Dov', 'Nell', 'Corin', 'Ada', 'Rook', 'Tamsin', 'Fenn', 'Orla', 'Bastien', 'Mira', 'Jun', 'Petra', 'Silas', 'Yara', 'Emeric', 'Lark', 'Odile'];
const TRAINER_TITLES = {
  mammal: ['Herder', 'Shepherd', 'Drover'], amphibian: ['Bog Walker', 'Fen Keeper', 'Reed Cutter'], insect: ['Beekeeper', 'Gardener', 'Lantern Girl'],
  bird: ['Falconer', 'Cliff Runner', 'Skywatch'], fish: ['Angler', 'Tide Watcher', 'Pearl Diver'], invertebrate: ['Cave Diver', 'Lamplighter', 'Shell Seller'], reptile: ['Ash Ranger', 'Scale Tamer', 'Kiln Hand'],
};
const TRAINER_LINES = {
  mammal: ['My team was raised on these downs. Care for a bout?', 'Fur and fang against whatever you have. Fight?'],
  amphibian: ['The fen teaches patience. Let me test yours.', 'Careful where you step. Care to battle instead?'],
  insect: ['Hear that hum? That is my team warming up. Fight?', 'Small, many and quick. Want to see?'],
  bird: ['The wind favours me today. A battle?', 'From up here I saw you coming a mile off. Fight?'],
  fish: ['The tide is in and so am I. Battle?', 'Land legs and a fish team. Try me.'],
  invertebrate: ['Not everything in the dark is slow. Shall we?', 'You look lost. A fight will warm you up.'],
  reptile: ['Ash in the air and fire in my team. Fight?', 'The Scar breaks the unready. Prove me wrong.'],
};
const TRAINER_AFTER = ['Good match. Come back stronger.', 'Well fought. The Warden is another matter.', 'You earned that one.', 'My team will remember you.'];

const COUNCIL = [
  { name: 'Marshal Kord', style: 'melee', line: 'Strength first. Show me yours.' },
  { name: 'Ranger Selene', style: 'ranged', line: 'Distance is a weapon. Close it if you can.' },
  { name: 'Oracle Vesh', style: 'magic', line: 'Every battle is already decided. Let us see how.' },
  { name: 'Champion Aurel', style: null, line: 'Seven badges brought you here. Only one thing remains.' },
];

function tierPref(s) { return s.tier === 'rare' ? 3 : s.tier === 'uncommon' ? 2 : 1; }

function pickSpecies(rng, pool, prefer, used) {
  const fresh = pool.filter((s) => !used.has(s.id));
  const from = fresh.length ? fresh : pool;
  const sp = rng.weighted(from, (s) => (prefer ? tierPref(s) : 1));
  used.add(sp.id);
  return sp;
}

function trainersFor(rng, world, biome, spots) {
  const out = [];
  const clade = biome.clade;
  const home = WILD_SPECIES.filter((s) => s.clade === clade);
  const sizes = [2, 2, 3, 4];
  const names = rng.shuffle(WORLD_TRAINER_NAMES);
  spots.forEach((spot, i) => {
    const r = rng.fork(`t${i}`);
    const used = new Set();
    const team = [];
    for (let k = 0; k < sizes[i % sizes.length]; k++) {
      const pool = k === 0 || r.chance(0.75) ? home : WILD_SPECIES; // the lead is always from the home class
      const sp = pickSpecies(r.fork(`s${k}`), pool, false, used);
      const L = levelAt(world, spot.x, spot.y);
      team.push({ genome: speciesGenome(sp, r.fork(`g${k}`)), level: Math.max(2, Math.min(100, L + (i === 3 ? 1 + r.int(2) : r.between(-1, 1)))) });
    }
    out.push({
      id: `${clade}-${i}`, biome: clade, name: `${r.pick(TRAINER_TITLES[clade])} ${names[i % names.length]}`, x: spot.x, y: spot.y, dir: spot.dir || 'down',
      line: r.pick(TRAINER_LINES[clade]), after: r.pick(TRAINER_AFTER), team,
    });
  });
  return out;
}

function wardenFor(rng, biome) {
  const pool = WILD_SPECIES.filter((s) => s.clade === biome.clade);
  const used = new Set();
  const L = biome.level;
  const a = speciesGenome(pickSpecies(rng.fork('a'), pool, true, used), rng.fork('ga'));
  const b = speciesGenome(pickSpecies(rng.fork('b'), pool, true, used), rng.fork('gb'));
  const c = speciesGenome(pickSpecies(rng.fork('c'), pool, true, used), rng.fork('gc'));
  let leader = a;
  if (canFuse(a, b).ok) { const ab = fuse(a, b, rng.fork('f1')).child; leader = canFuse(ab, c).ok ? fuse(ab, c, rng.fork('f2')).child : ab; }
  const team = [{ genome: leader, level: Math.min(100, L + 6) }];
  for (let i = 0; i < 4; i++) team.push({ genome: speciesGenome(pickSpecies(rng.fork(`m${i}`), pool, i < 2, used), rng.fork(`gm${i}`)), level: Math.min(100, L + 3 + (i % 2)) });
  const region = REGIONS[biome.clade];
  return { id: `warden-${biome.clade}`, name: region.warden, title: `Warden of ${biome.name}`, biome: biome.clade, badge: region.badge, level: L + 6, team, line: `I keep the ${region.badge}. Earn it.` };
}

function councilFor(rng) {
  return COUNCIL.map((c, i) => {
    const r = rng.fork(`council${i}`);
    const level = COUNCIL_LEVELS[i];
    const pool = c.style ? WILD_SPECIES.filter((s) => combatStyle(s.stats) === c.style) : WILD_SPECIES;
    const used = new Set();
    const team = [];
    if (!c.style) {
      // the champion fields two gen-2 fusions built from rare stock
      for (let f = 0; f < 2; f++) {
        const clade = r.pick(BIOME_ORDER);
        const cp = WILD_SPECIES.filter((s) => s.clade === clade);
        const a = speciesGenome(pickSpecies(r.fork(`fa${f}`), cp, true, used), r.fork(`ga${f}`));
        const b = speciesGenome(pickSpecies(r.fork(`fb${f}`), cp, true, used), r.fork(`gb${f}`));
        const d = speciesGenome(pickSpecies(r.fork(`fc${f}`), cp, true, used), r.fork(`gc${f}`));
        const ab = fuse(a, b, r.fork(`f1${f}`)).child;
        team.push({ genome: fuse(ab, d, r.fork(`f2${f}`)).child, level });
      }
    }
    while (team.length < 5) team.push({ genome: speciesGenome(pickSpecies(r.fork(`s${team.length}`), pool.length >= 5 ? pool : WILD_SPECIES, true, used), r.fork(`g${team.length}`)), level: level - (team.length === 4 ? 0 : 1) });
    return { id: `council-${i}`, stage: i, name: c.name, style: c.style, line: c.line, level, team };
  });
}

// ---- generation ------------------------------------------------------------------

const worldCache = new Map();

/** The world for a seed, generated once and cached. */
export function worldFor(seed) {
  const key = String(seed);
  if (!worldCache.has(key)) { if (worldCache.size > 4) worldCache.delete(worldCache.keys().next().value); worldCache.set(key, generateWorld(key)); }
  return worldCache.get(key);
}

export function generateWorld(seed) {
  const w = WORLD.w, h = WORLD.h;
  const rng = makeRng(`${seed}:world`);
  const [n1, n2, n3, n4] = hashSeed(`${seed}:noise`);
  const tiles = new Uint8Array(w * h), bio = new Uint8Array(w * h), hab = new Uint8Array(w * h);
  const hub = { x: Math.floor(w / 2), y: Math.floor(h / 2) };
  const idx = (x, y) => y * w + x;

  // biome centres on a ring, clockwise from the south, with a little jitter
  const biomes = BIOME_ORDER.map((clade, i) => {
    const a = ((90 + (i * 360) / BIOME_ORDER.length + rng.range(-6, 6)) * Math.PI) / 180;
    const centre = { x: Math.round(hub.x + Math.cos(a) * WORLD.ringR), y: Math.round(hub.y + Math.sin(a) * WORLD.ringR) };
    const lair = { x: Math.max(4, Math.min(w - 5, Math.round(hub.x + Math.cos(a) * WORLD.lairR))), y: Math.max(4, Math.min(h - 5, Math.round(hub.y + Math.sin(a) * WORLD.lairR))) };
    const region = REGIONS[clade];
    return { id: clade, clade, index: i, name: region.name, level: region.level, angle: a, centre, camp: { ...centre }, lair: { x: lair.x, y: lair.y, door: null } };
  });

  // assign biomes (jittered Voronoi) and terrain
  const habTypes = Object.fromEntries(BIOME_ORDER.map((c) => [c, habitatTypesFor(c)]));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const jx = x + (fbm(n1, x, y, 9) - 0.5) * 8, jy = y + (fbm(n2, x, y, 9) - 0.5) * 8;
      let best = 0, bd = Infinity;
      biomes.forEach((b, i) => { const d = (jx - b.centre.x) ** 2 + (jy - b.centre.y) ** 2; if (d < bd) { bd = d; best = i; } });
      const i = idx(x, y);
      bio[i] = best;
      const region = REGIONS[biomes[best].clade];
      let t = TILE.grass;
      if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) t = TILE.wall;
      else if (fbm(n3, x, y, 7) > region.waterT) t = TILE.water;
      else if (fbm(n4, x, y, 6) > 0.6) t = TILE.wall;
      else if (fbm(n1 ^ n4, x + 37, y + 91, 5) > 0.5) t = TILE.habitat;
      tiles[i] = t;
      if (t === TILE.habitat) {
        // one element per coarse cell so a patch reads as one kind of place
        const cellR = latticeHash(n2 ^ n3, Math.floor(x / 6), Math.floor(y / 6));
        const list = habTypes[biomes[best].clade];
        let total = 0; for (const [, wt] of list) total += wt;
        let acc = cellR * total, type = list[list.length - 1][0];
        for (const [ty, wt] of list) { acc -= wt; if (acc < 0) { type = ty; break; } }
        hab[i] = TYPE_LIST.indexOf(type) + 1;
      }
    }
  }
  const world = { seed: String(seed), w, h, tiles, bio, hab, hub, biomes, trainers: [], trainerAt: new Map(), wardens: {}, council: [], start: { x: hub.x, y: hub.y + 1 }, spireDoor: { x: hub.x, y: hub.y - 5 }, shrine: { x: hub.x + 3, y: hub.y }, hubCamp: { x: hub.x - 3, y: hub.y } };

  // the hub disc, its spire, shrine and camp
  for (let y = hub.y - WORLD.hubR; y <= hub.y + WORLD.hubR; y++) for (let x = hub.x - WORLD.hubR; x <= hub.x + WORLD.hubR; x++) if (isHubTile(world, x, y)) tiles[idx(x, y)] = TILE.hub;
  for (let y = hub.y - 7; y <= hub.y - 6; y++) for (let x = hub.x - 1; x <= hub.x + 1; x++) tiles[idx(x, y)] = TILE.spire;
  tiles[idx(world.spireDoor.x, world.spireDoor.y)] = TILE.spireDoor;
  tiles[idx(world.shrine.x, world.shrine.y)] = TILE.shrine;
  tiles[idx(world.hubCamp.x, world.hubCamp.y)] = TILE.camp;

  const carvable = (t) => t === TILE.grass || t === TILE.habitat || t === TILE.wall || t === TILE.water;
  const carve = (ax, ay, bx, by) => {
    const pts = [];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= n; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / n), y = Math.round(ay + ((by - ay) * s) / n);
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) { const px = x + dx, py = y + dy; if (inBounds(world, px, py) && px > 1 && py > 1 && px < w - 2 && py < h - 2 && carvable(tiles[idx(px, py)])) tiles[idx(px, py)] = TILE.path; }
      pts.push({ x, y });
    }
    return pts;
  };
  /** A path in two legs through a sideways midpoint, so roads bend. */
  const road = (a, b, bend) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const mid = { x: Math.round(mx - (dy / len) * bend), y: Math.round(my + (dx / len) * bend) };
    const p1 = carve(a.x, a.y, mid.x, mid.y), p2 = carve(mid.x, mid.y, b.x, b.y);
    return [...p1, ...p2.slice(1)];
  };

  // lairs, camps, roads and trainers per biome
  for (const b of biomes) {
    const L = b.lair;
    // door on the side facing the hub
    const toHub = { x: hub.x - L.x, y: hub.y - L.y };
    const side = Math.abs(toHub.x) > Math.abs(toHub.y) ? (toHub.x > 0 ? 'right' : 'left') : (toHub.y > 0 ? 'down' : 'up');
    const door = side === 'up' ? { x: L.x, y: L.y - 1 } : side === 'down' ? { x: L.x, y: L.y + 1 } : side === 'left' ? { x: L.x - 1, y: L.y } : { x: L.x + 1, y: L.y };
    const front = { x: door.x + (side === 'left' ? -1 : side === 'right' ? 1 : 0), y: door.y + (side === 'up' ? -1 : side === 'down' ? 1 : 0) };
    for (let y = L.y - 1; y <= L.y + 1; y++) for (let x = L.x - 1; x <= L.x + 1; x++) tiles[idx(x, y)] = TILE.lair;
    tiles[idx(door.x, door.y)] = TILE.door;
    b.lair.door = door; b.lair.front = front; b.lair.side = side;
    const legA = road(hub, b.centre, rng.range(-3, 3));
    const legB = road(b.centre, front, rng.range(-4, 4));
    tiles[idx(b.camp.x, b.camp.y)] = TILE.camp;
    tiles[idx(front.x, front.y)] = TILE.path;
    // trainers stand on the road: three on the way in, one before the lair
    const spots = [];
    const pathTileNear = (p) => {
      for (let r = 0; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = p.x + dx, y = p.y + dy; if (tileAt(world, x, y) === TILE.path && !world.trainerAt.has(`${x},${y}`) && !isHubTile(world, x, y)) return { x, y }; }
      return null;
    };
    for (const f of [0.4, 0.62, 0.84]) { const s = pathTileNear(legA[Math.floor((legA.length - 1) * f)]); if (s) spots.push(s); }
    { const s = pathTileNear(legB[Math.floor((legB.length - 1) * 0.5)]); if (s) spots.push(s); }
    const ts = trainersFor(rng.fork(`trainers:${b.clade}`), world, b, spots.slice(0, WORLD.trainersPerBiome));
    for (const t of ts) { world.trainers.push(t); world.trainerAt.set(`${t.x},${t.y}`, t); }
    world.wardens[b.clade] = wardenFor(rng.fork(`warden:${b.clade}`), b);
  }
  // a ring road between neighbouring camps
  for (let i = 0; i < biomes.length; i++) road(biomes[i].centre, biomes[(i + 1) % biomes.length].centre, rng.range(-6, 6));
  world.council = councilFor(rng.fork('council'));

  // guarantee: every camp, lair front, the spire door and the shrine are reachable from the start
  const targets = [world.spireDoor, world.shrine, world.hubCamp, ...biomes.map((b) => b.camp), ...biomes.map((b) => b.lair.front)];
  for (let round = 0; round < 3; round++) {
    const reach = reachableFrom(world, world.start);
    const missing = targets.filter((t) => !reach.has(idx(t.x, t.y)));
    if (!missing.length) break;
    for (const t of missing) carve(hub.x, hub.y, t.x, t.y);
  }
  return world;
}

/** Set of tile indexes reachable on foot from a point, ignoring trainers. */
export function reachableFrom(world, from) {
  const seen = new Set([from.y * world.w + from.x]);
  const queue = [[from.x, from.y]];
  for (let qi = 0; qi < queue.length; qi++) {
    const [x, y] = queue[qi];
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, k = ny * world.w + nx;
      if (seen.has(k) || !WALKABLE_TILES.has(tileAt(world, nx, ny))) continue;
      seen.add(k); queue.push([nx, ny]);
    }
  }
  return seen;
}

/** Tile counts per kind and biome, for tests and the map legend. */
export function worldStats(world) {
  const kinds = {}, perBiome = {};
  for (let i = 0; i < world.tiles.length; i++) {
    const t = world.tiles[i], b = world.biomes[world.bio[i]].clade;
    kinds[t] = (kinds[t] || 0) + 1;
    perBiome[b] = (perBiome[b] || 0) + 1;
  }
  return { kinds, perBiome };
}
