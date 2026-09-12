// The overworld: one large tile map, generated from a seed, with a hub town in the
// middle and a ring of biomes around it, one per class. Each biome is home to its class:
// its habitat patches carry the element types found in that class, so a Fire mammal
// turns up on scorched downs and a Water fish in the lagoon shallows. Difficulty rises
// around the ring, so the recommended order is a lap. Every biome has a camp that heals,
// a lair where its Warden waits with a badge, and a few trainers on the paths who fight
// when asked. The hub also has a fusion
// shrine, a Market selling moves for the gold trainers pay, a Creature Storage holding the box and a Battle Tower
// of six-on-six fights at chosen levels. The Council Spire in the hub opens with every badge: four fights in a row.
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

/** Map size and ring geometry. `version` bumps whenever the layout changes, so saved positions from an older map reset to the Crossroads. */
export const WORLD = { version: 9, w: 224, h: 192, hubR: 6, ringR: 58, lairR: 84, trainersPerBiome: 6, encounterChance: 0.12, encounterCooldown: 4, homeSpawnShare: 0.72 };

/** Tile kinds. */
export const TILE = { grass: 0, habitat: 1, path: 2, wall: 3, water: 4, hub: 5, lair: 6, door: 7, camp: 8, spire: 9, spireDoor: 10, shrine: 11, market: 12, marketDoor: 13, storage: 14, storageDoor: 15, tower: 16, towerDoor: 17 };
export const WALKABLE_TILES = new Set([TILE.grass, TILE.habitat, TILE.path, TILE.hub, TILE.door, TILE.camp, TILE.spireDoor, TILE.shrine, TILE.marketDoor, TILE.storageDoor, TILE.towerDoor]);

/** Biomes in difficulty order, clockwise from the south of the hub. Levels climb 5 to the fifties; the gaps in the ladder are for classes still to come. */
export const BIOME_ORDER = ['mammal', 'amphibian', 'flora', 'insect', 'nightwing', 'fungus', 'bird', 'crystalline', 'ooze', 'fish', 'myriapod', 'wyrm', 'invertebrate', 'skeletal', 'reptile', 'fiend', 'draconic', 'spirit'];

/** Per-class region: name, wild level, palette and the look of its walls. */
export const REGIONS = {
  mammal:       { name: 'Heather Downs',  level: 5,  ground: '#6d9c4e', ground2: '#63914a', habitat: '#4f8a3e', path: '#c9b27b', water: '#3f7fc4', wall: 'tree',     wallColor: '#3f7332', accent: '#e0c86f', waterT: 0.68, warden: 'Warden Marrow', badge: 'Downs Badge' },
  amphibian:    { name: 'Sodden Fen',     level: 10, ground: '#5f8c5a', ground2: '#56825a', habitat: '#456f4a', path: '#b3a26f', water: '#3b6f8a', wall: 'reed',     wallColor: '#6a8a3a', accent: '#a7d36a', waterT: 0.56, warden: 'Warden Sedge',  badge: 'Fen Badge' },
  insect:       { name: 'Hum Meadow',     level: 18, ground: '#8fb050', ground2: '#84a84a', habitat: '#6f9a3c', path: '#d3bd82', water: '#4a94c8', wall: 'hedge',    wallColor: '#4c7d2e', accent: '#f0d25a', waterT: 0.7,  warden: 'Warden Thrum',  badge: 'Meadow Badge' },
  bird:         { name: 'Windward Crags', level: 27, ground: '#7c8f78', ground2: '#72866f', habitat: '#617a5c', path: '#b9b39a', water: '#4d8fc4', wall: 'pine',     wallColor: '#2f5a44', accent: '#cfe3f0', waterT: 0.68, warden: 'Warden Gale',   badge: 'Crag Badge' },
  fish:         { name: 'Glass Lagoon',   level: 36, ground: '#d8c68e', ground2: '#cebb84', habitat: '#8fc7d3', path: '#e6d9a8', water: '#3aa7d8', wall: 'palm',     wallColor: '#4f8f5f', accent: '#7fe0ea', waterT: 0.5,  warden: 'Warden Brine',  badge: 'Lagoon Badge' },
  invertebrate: { name: 'Murk Hollow',    level: 45, ground: '#5a5470', ground2: '#524c68', habitat: '#443f5c', path: '#8c8494', water: '#3b3f6e', wall: 'rock',     wallColor: '#3a3448', accent: '#b98cff', waterT: 0.62, warden: 'Warden Gloam',  badge: 'Hollow Badge' },
  flora:        { name: 'Bramble Wilds',  level: 14, ground: '#5f9a3d', ground2: '#578f3a', habitat: '#3f7d31', path: '#c4ad76', water: '#3f86b8', wall: 'hedge',    wallColor: '#3b6b2a', accent: '#f2a5c8', waterT: 0.66, warden: 'Warden Bryony', badge: 'Bramble Badge' },
  fungus:       { name: 'Sporewood',      level: 23, ground: '#7a7f5c', ground2: '#70754f', habitat: '#5b5f47', path: '#c7b48a', water: '#4e7aa0', wall: 'tree',     wallColor: '#5a4a6a', accent: '#d9a3ff', waterT: 0.6,  warden: 'Warden Morel',  badge: 'Spore Badge' },
  wyrm:         { name: 'Coiling Gorge',  level: 41, ground: '#8a8570', ground2: '#807b66', habitat: '#6b6a52', path: '#d2c39a', water: '#4f8fb8', wall: 'rock',     wallColor: '#5c5548', accent: '#8fd3ff', waterT: 0.62, warden: 'Warden Tempest', badge: 'Gorge Badge' },
  ooze:         { name: 'Slurry Sump',    level: 32, ground: '#7a8a4c', ground2: '#707f45', habitat: '#55703a', path: '#c0b27e', water: '#7fb84f', wall: 'rock',     wallColor: '#4c4a3e', accent: '#b6f06a', waterT: 0.6,  warden: 'Warden Dreg',   badge: 'Sump Badge' },
  spirit:       { name: 'Vigil Marsh',    level: 58, ground: '#3f4a5a', ground2: '#394352', habitat: '#2f3a4a', path: '#8a94a4', water: '#2e4a66', wall: 'grave',    wallColor: '#8a93a4', accent: '#a8f0e0', waterT: 0.55, warden: 'Warden Solace', badge: 'Vigil Badge' },
  fiend:        { name: 'Brimstone Sinks', level: 52, ground: '#5a3a3a', ground2: '#523434', habitat: '#6a3028', path: '#b08064', water: '#e8642e', wall: 'ember',    wallColor: '#3a2424', accent: '#ff6a3a', waterT: 0.66, warden: 'Warden Sulfa',  badge: 'Brimstone Badge' },
  myriapod:     { name: 'Rootbound Warren', level: 38, ground: '#5d4a3a', ground2: '#554335', habitat: '#4a3a2c', path: '#a88c6a', water: '#4a6a5a', wall: 'root',     wallColor: '#6b4a34', accent: '#d8b34a', waterT: 0.64, warden: 'Warden Segra',  badge: 'Segment Badge' },
  crystalline:  { name: 'Prism Caverns',  level: 29, ground: '#5b5470', ground2: '#534c68', habitat: '#6a4f8a', path: '#a99cc4', water: '#4a6fb8', wall: 'crystal',  wallColor: '#b9a4ff', accent: '#ffd36a', waterT: 0.62, warden: 'Warden Facet',  badge: 'Prism Badge' },
  nightwing:    { name: 'Echo Chasm',     level: 20, ground: '#4c5566', ground2: '#454e5e', habitat: '#38404f', path: '#98a0ad', water: '#3a6f8a', wall: 'rock',     wallColor: '#5c667a', accent: '#9fd8ff', waterT: 0.62, warden: 'Warden Vesper', badge: 'Echo Badge' },
  skeletal:     { name: 'Barrow Downs',   level: 47, ground: '#6f7466', ground2: '#666b5e', habitat: '#535a4c', path: '#bfb59a', water: '#4a6f88', wall: 'bone',     wallColor: '#e6dfc8', accent: '#9fe8b0', waterT: 0.6,  warden: 'Warden Ossa',   badge: 'Marrow Badge' },
  reptile:      { name: 'Ember Scar',     level: 50, ground: '#9c6b4a', ground2: '#906244', habitat: '#7a4d38', path: '#d0a878', water: '#e0562a', wall: 'rock',     wallColor: '#5a3a2c', accent: '#ff9a4a', waterT: 0.7,  warden: 'Warden Cinder', badge: 'Scar Badge' },
  draconic:     { name: 'Drakefell Peaks', level: 55, ground: '#7d7269', ground2: '#736960', habitat: '#5f5450', path: '#c9b79c', water: '#5a8fc0', wall: 'rock',     wallColor: '#4a3f3c', accent: '#ffb347', waterT: 0.6,  warden: 'Warden Ashfall', badge: 'Peak Badge' },
};

export const HUB = { name: 'Crossroads', ground: '#b8ad8e', paving: '#a89c7e' };

/** Rarity by tier: the stronger a species, the rarer it is in the wild. */
export const WILD_RARITY = { common: 1, uncommon: 0.45, rare: 0.12 };
/** Odds of a stronger wild creature: an alpha well above the area level, or one a few levels up (boosts scale with the area, capped). */
export const WILD_LEVEL = { alpha: 0.04, alphaMax: 12, strong: 0.14, strongMax: 6, spread: 2 };
export const COUNCIL_LEVELS = [58, 62, 66, 70];
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
 * The wild level at a tile. Every biome starts gentle at the Crossroads (level 1 to 4 at the edge, a
 * tenth of the region's level clamped, so the first patches are level 1 to 5) and deepens to the region's full level at its lair, so the first
 * steps out of town meet level 1 to 5 creatures and the deepest lairs reach the fifties. The HUD
 * shows the local level as you walk out.
 */
export function levelAt(world, x, y) {
  const b = biomeAt(world, x, y);
  const d = Math.hypot(x - world.hub.x, y - world.hub.y);
  const t = Math.max(0, Math.min(1, (d - WORLD.hubR) / (WORLD.lairR - WORLD.hubR)));
  const edge = Math.max(1, Math.min(4, Math.round(b.level * 0.1)));
  return Math.max(1, Math.round(edge + (b.level - edge) * t));
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
  // squared so a class's signature elements own most of its patches and a lone oddball species makes a rare pocket, not a third of the region
  return [...w.entries()].map(([t, n]) => [t, n * n]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

/** Weight of a species in a habitat: its class at home (3), its type in its element (4), both together (10), rare visitors otherwise; scaled by tier rarity. */
export function spawnWeight(species, clade, type) {
  const home = species.clade === clade, typed = Boolean(type && species.types.includes(type));
  const affinity = home && typed ? 10 : home ? 3 : typed ? 4 : 0;
  return (WILD_RARITY[species.tier] || 1) * (affinity || 0.03);
}

/**
 * The spawn table for a habitat: every wild species with its weight, the home class holding a fixed share of the
 * total (WORLD.homeSpawnShare) however many visitors of the patch's element the wider roster offers.
 */
export function spawnTable(clade, type) {
  const raw = WILD_SPECIES.map((s) => spawnWeight(s, clade, type));
  let home = 0, away = 0;
  WILD_SPECIES.forEach((s, i) => { if (s.clade === clade) home += raw[i]; else away += raw[i]; });
  const share = WORLD.homeSpawnShare;
  const scale = home > 0 && away > 0 ? (home * (1 - share) / share) / away : 1;
  return WILD_SPECIES.map((s, i) => [s, s.clade === clade ? raw[i] : raw[i] * scale]);
}

/** Roll the wild creature for a habitat tile: species by class and element, level by the area with rarer stronger rolls, and the 1/1000 Elemental. */
export function wildSpawn(world, x, y, rng, opts = {}) {
  const biome = biomeAt(world, x, y);
  const type = habitatTypeAt(world, x, y);
  const sp = rng.weighted(spawnTable(biome.clade, type), ([, w]) => w)[0];
  const genome = speciesGenome(sp, rng.fork(`g:${sp.id}`));
  const L = levelAt(world, x, y);
  const r = rng.next();
  let level = L + rng.between(-WILD_LEVEL.spread, WILD_LEVEL.spread), alpha = false;
  // the boosts scale with the area so an alpha near town is a handful, not a wall
  if (r < WILD_LEVEL.alpha) { level = L + Math.min(WILD_LEVEL.alphaMax, 3 + Math.round(L * 0.3)) + rng.between(0, 2); alpha = true; }
  else if (r < WILD_LEVEL.alpha + WILD_LEVEL.strong) level = L + Math.min(WILD_LEVEL.strongMax, 2 + Math.round(L * 0.15)) + rng.between(0, 1);
  level = Math.max(1, Math.min(100, level));
  const elemental = rollElemental(genome, rng.fork('elemental'), Math.min(1, WILD_ELEMENTAL.chance * (opts.elementalMul || 1)));
  return { genome, level, alpha, elemental, type, biome: biome.id, areaLevel: L };
}

// ---- content: trainers, wardens, council -----------------------------------------

const WORLD_TRAINER_NAMES = ['Ivy', 'Bram', 'Tobin', 'Sable', 'Wren', 'Oakes', 'Pim', 'Lise', 'Marlo', 'Quill', 'Hesper', 'Dov', 'Nell', 'Corin', 'Ada', 'Rook', 'Tamsin', 'Fenn', 'Orla', 'Bastien', 'Mira', 'Jun', 'Petra', 'Silas', 'Yara', 'Emeric', 'Lark', 'Odile'];
const TRAINER_TITLES = {
  mammal: ['Herder', 'Shepherd', 'Drover'], amphibian: ['Bog Walker', 'Fen Keeper', 'Reed Cutter'], insect: ['Beekeeper', 'Gardener', 'Lantern Girl'],
  bird: ['Falconer', 'Cliff Runner', 'Skywatch'], fish: ['Angler', 'Tide Watcher', 'Pearl Diver'], invertebrate: ['Cave Diver', 'Lamplighter', 'Shell Seller'], reptile: ['Ash Ranger', 'Scale Tamer', 'Kiln Hand'],
  flora: ['Gardener', 'Hedge Witch', 'Orchard Keeper'],
  ooze: ['Sump Dredger', 'Slime Wrangler', 'Vat Keeper'],
  fungus: ['Forager', 'Spore Sweeper', 'Cellar Keeper'],
  wyrm: ['Storm Chaser', 'Ridge Runner', 'Kite Flyer'],
  draconic: ['Dragon Tamer', 'Egg Warmer', 'Sky Knight'],
  skeletal: ['Gravedigger', 'Bone Setter', 'Mourner'],
  nightwing: ['Cave Guide', 'Night Watch', 'Guano Sweeper'],
  crystalline: ['Gem Cutter', 'Lamp Bearer', 'Prospector'],
  myriapod: ['Tunneller', 'Compost Keeper', 'Root Cutter'],
  fiend: ['Ash Broker', 'Pact Keeper', 'Imp Herder'],
  spirit: ['Vigil Keeper', 'Séance Host', 'Grave Tender'],
};
const TRAINER_LINES = {
  mammal: ['My team was raised on these downs. Care for a bout?', 'Fur and fang against whatever you have. Fight?'],
  amphibian: ['The fen teaches patience. Let me test yours.', 'Careful where you step. Care to battle instead?'],
  insect: ['Hear that hum? That is my team warming up. Fight?', 'Small, many and quick. Want to see?'],
  bird: ['The wind favours me today. A battle?', 'From up here I saw you coming a mile off. Fight?'],
  fish: ['The tide is in and so am I. Battle?', 'Land legs and a fish team. Try me.'],
  invertebrate: ['Not everything in the dark is slow. Shall we?', 'You look lost. A fight will warm you up.'],
  reptile: ['Ash in the air and fire in my team. Fight?', 'The Scar breaks the unready. Prove me wrong.'],
  flora: ['Everything in the Wilds grows back. Your pride might not. Fight?', 'My team put down roots here. Try pulling them up.'],
  ooze: ['Mind the puddles. Some of them mind you back. Fight?', 'My team has no bones to break. How about yours?'],
  fungus: ['Everything down here is quietly eating something. Fight?', 'Breathe shallow and battle quick. Ready?'],
  wyrm: ['Feel that wind? That is my team breathing. Fight?', 'Up here the sky bites back. Battle?'],
  draconic: ['My team was hatched on this mountain. Yours was not. Fight?', 'Every dragon here answers to me. Let us see if yours answers to you.'],
  skeletal: ['Nothing down here stays buried for long. Fight?', 'My team has been dead for years and still beats most of the living.'],
  nightwing: ['Mind your head in here. My team hangs from the ceiling. Fight?', 'They only come out at dusk, and so do I. Care for a bout?'],
  crystalline: ['Every stone in here is worth something. Prove your team is too?', 'Careful with the walls, they sing. Care for a bout?'],
  myriapod: ['Watch your step. Everything down here has more legs than you. Fight?', 'My team lives under the roots and likes it there. Care for a bout?'],
  fiend: ['Sign here, fight there. My imps are waiting.', 'Everything down here costs something. Care for a bout?'],
  spirit: ['Keep your voice down, they are listening. Fight?', 'My team passed on years ago and still turns up for battles. Care for a bout?'],
};
const TRAINER_AFTER = ['Good match. Come back stronger.', 'Well fought. The Warden is another matter.', 'You earned that one.', 'My team will remember you.'];

const COUNCIL = [
  { name: 'Marshal Kord', style: 'melee', line: 'Strength first. Show me yours.' },
  { name: 'Ranger Selene', style: 'ranged', line: 'Distance is a weapon. Close it if you can.' },
  { name: 'Oracle Vesh', style: 'magic', line: 'Every battle is already decided. Let us see how.' },
  { name: 'Champion Aurel', style: null, line: 'Every badge brought you here. Only one thing remains.' },
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
  const sizes = [2, 2, 3, 3, 4, 4];
  const names = rng.shuffle(WORLD_TRAINER_NAMES);
  spots.forEach((spot, i) => {
    const r = rng.fork(`t${i}`);
    const used = new Set();
    const team = [];
    const last = i === spots.length - 1; // the trainer before the lair runs a little hot
    for (let k = 0; k < sizes[i % sizes.length]; k++) {
      const pool = k === 0 || r.chance(0.75) ? home : WILD_SPECIES; // the lead is always from the home class
      const sp = pickSpecies(r.fork(`s${k}`), pool, false, used);
      const L = levelAt(world, spot.x, spot.y);
      team.push({ genome: speciesGenome(sp, r.fork(`g${k}`)), level: Math.max(1, Math.min(100, L + (last ? 1 + r.int(2) : r.between(-1, 1)))) });
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
    const a0 = ((90 + (i * 360) / BIOME_ORDER.length) * Math.PI) / 180, a = a0 + (rng.range(-6, 6) * Math.PI) / 180;
    const centre = { x: Math.round(hub.x + Math.cos(a) * WORLD.ringR), y: Math.round(hub.y + Math.sin(a) * WORLD.ringR) };
    const lair = { x: Math.max(4, Math.min(w - 5, Math.round(hub.x + Math.cos(a) * WORLD.lairR))), y: Math.max(4, Math.min(h - 5, Math.round(hub.y + Math.sin(a) * WORLD.lairR))) };
    const region = REGIONS[clade];
    // the wedge direction, unjittered and in a space where the map is square, so every class gets an equal slice of a wide map
    const wedge = Math.atan2(Math.sin(a0) / h, Math.cos(a0) / w);
    return { id: clade, clade, index: i, name: region.name, level: region.level, angle: a, wedge, centre, camp: { ...centre }, lair: { x: lair.x, y: lair.y, door: null } };
  });

  // assign biomes (jittered Voronoi) and terrain
  const habTypes = Object.fromEntries(BIOME_ORDER.map((c) => [c, habitatTypesFor(c)]));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // boundaries stay crisp near the Crossroads, so the gentlest biome always begins straight south of town, and wander further out
      const jit = 8 * Math.min(1, Math.max(0, (Math.hypot(x - hub.x, y - hub.y) - WORLD.hubR) / 24));
      const jx = x + (fbm(n1, x, y, 9) - 0.5) * jit, jy = y + (fbm(n2, x, y, 9) - 0.5) * jit;
      // wedges around the hub by angle: the centres sit on one ring, so this is their Voronoi split with even slices that stay put as classes are added
      const ta = Math.atan2((jy - hub.y) / h, (jx - hub.x) / w), TAU = Math.PI * 2;
      let best = 0, bd = Infinity;
      biomes.forEach((b, i) => { let d = Math.abs((((ta - b.wedge) % TAU) + TAU) % TAU); d = Math.min(d, TAU - d); if (d < bd) { bd = d; best = i; } });
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
  const world = { seed: String(seed), w, h, tiles, bio, hab, hub, biomes, trainers: [], trainerAt: new Map(), wardens: {}, council: [], start: { x: hub.x, y: hub.y + 1 }, spireDoor: { x: hub.x, y: hub.y - 5 }, shrine: { x: hub.x + 3, y: hub.y }, hubCamp: { x: hub.x - 3, y: hub.y }, market: { x: hub.x + 4, y: hub.y - 4 }, marketDoor: { x: hub.x + 4, y: hub.y - 2 }, storage: { x: hub.x - 4, y: hub.y - 4 }, storageDoor: { x: hub.x - 4, y: hub.y - 2 }, tower: { x: hub.x - 4, y: hub.y + 3 }, towerDoor: { x: hub.x - 4, y: hub.y + 2 } };

  // the hub disc, its spire, shrine and camp
  for (let y = hub.y - WORLD.hubR; y <= hub.y + WORLD.hubR; y++) for (let x = hub.x - WORLD.hubR; x <= hub.x + WORLD.hubR; x++) if (isHubTile(world, x, y)) tiles[idx(x, y)] = TILE.hub;
  for (let y = hub.y - 7; y <= hub.y - 6; y++) for (let x = hub.x - 1; x <= hub.x + 1; x++) tiles[idx(x, y)] = TILE.spire;
  tiles[idx(world.spireDoor.x, world.spireDoor.y)] = TILE.spireDoor;
  tiles[idx(world.shrine.x, world.shrine.y)] = TILE.shrine;
  tiles[idx(world.hubCamp.x, world.hubCamp.y)] = TILE.camp;
  // the Market: a 3 x 2 shop on the hub's north-east edge, door facing the square
  for (let y = world.market.y; y <= world.market.y + 1; y++) for (let x = world.market.x - 1; x <= world.market.x + 1; x++) tiles[idx(x, y)] = TILE.market;
  tiles[idx(world.marketDoor.x, world.marketDoor.y)] = TILE.marketDoor;
  // Creature Storage: its twin on the north-west edge, where the box lives
  for (let y = world.storage.y; y <= world.storage.y + 1; y++) for (let x = world.storage.x - 1; x <= world.storage.x + 1; x++) tiles[idx(x, y)] = TILE.storage;
  tiles[idx(world.storageDoor.x, world.storageDoor.y)] = TILE.storageDoor;
  // the Battle Tower: a 3 x 2 keep on the hub's south-west edge, door facing the square
  for (let y = world.tower.y; y <= world.tower.y + 1; y++) for (let x = world.tower.x - 1; x <= world.tower.x + 1; x++) tiles[idx(x, y)] = TILE.tower;
  tiles[idx(world.towerDoor.x, world.towerDoor.y)] = TILE.towerDoor;

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
    // trainers stand on the road: four on the way in, two between the camp and the lair
    const spots = [];
    const pathTileNear = (p) => {
      for (let r = 0; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = p.x + dx, y = p.y + dy; if (tileAt(world, x, y) === TILE.path && !world.trainerAt.has(`${x},${y}`) && !isHubTile(world, x, y)) return { x, y }; }
      return null;
    };
    for (const f of [0.3, 0.5, 0.68, 0.86]) { const s = pathTileNear(legA[Math.floor((legA.length - 1) * f)]); if (s) spots.push(s); }
    for (const f of [0.35, 0.7]) { const s = pathTileNear(legB[Math.floor((legB.length - 1) * f)]); if (s) spots.push(s); }
    const ts = trainersFor(rng.fork(`trainers:${b.clade}`), world, b, spots.slice(0, WORLD.trainersPerBiome));
    for (const t of ts) { world.trainers.push(t); world.trainerAt.set(`${t.x},${t.y}`, t); }
    world.wardens[b.clade] = wardenFor(rng.fork(`warden:${b.clade}`), b);
  }
  // a ring road between neighbouring camps
  for (let i = 0; i < biomes.length; i++) road(biomes[i].centre, biomes[(i + 1) % biomes.length].centre, rng.range(-6, 6));
  world.council = councilFor(rng.fork('council'));

  // guarantee: every camp, lair front, the spire door and the shrine are reachable from the start
  const targets = [world.spireDoor, world.shrine, world.hubCamp, world.marketDoor, world.storageDoor, world.towerDoor, ...biomes.map((b) => b.camp), ...biomes.map((b) => b.lair.front)];
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
