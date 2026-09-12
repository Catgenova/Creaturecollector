// The field a battle is fought on: the weather overhead and the terrain underfoot.
//
// A weather is set by a move, by a passive as its owner walks in, or by the ground the encounter
// happened on, and it touches everything in the fight. A terrain is set by a move and only reaches
// what is standing on it: Flying types and anything that hovers float above the whole business.
// Both run down after a set number of turns, and setting a new one replaces the old.
export const FIELD = { turns: 5, longTurns: 8, chip: 1 / 16 };

/**
 * boost: multiplier on a move's power by its type, for anyone.
 * chip / safe: the fraction of max HP the weather takes at the end of a turn, and the types it spares.
 * guard: types that keep one defence higher while it holds.
 */
export const WEATHER = {
  sun: {
    id: 'sun', name: 'Harsh Sun', short: 'Sun', icon: '☀', color: '#ffb347',
    boost: { Fire: 1.5, Water: 0.5 },
    line: 'The sun blazes down!', over: 'The sunlight faded.',
    desc: 'Fire moves hit 1.5x harder and Water moves at half strength.',
  },
  rain: {
    id: 'rain', name: 'Rain', short: 'Rain', icon: '☂', color: '#5aa9e6',
    boost: { Water: 1.5, Fire: 0.5 },
    line: 'Rain begins to fall!', over: 'The rain stopped.',
    desc: 'Water moves hit 1.5x harder and Fire moves at half strength.',
  },
  sand: {
    id: 'sand', name: 'Sandstorm', short: 'Sand', icon: '⛭', color: '#d8b45a',
    chip: FIELD.chip, safe: ['Rock', 'Ground', 'Steel'],
    guard: { types: ['Rock'], stat: 'magicDef', m: 1.5 },
    line: 'A sandstorm whips up!', over: 'The sandstorm blew itself out.',
    desc: 'Everything but Rock, Ground and Steel loses a sixteenth of its HP each turn, and Rock types keep 1.5x Magic Def.',
  },
  snow: {
    id: 'snow', name: 'Snowfall', short: 'Snow', icon: '❄', color: '#bfe6ff',
    chip: FIELD.chip, safe: ['Ice'],
    guard: { types: ['Ice'], stat: 'meleeDef', m: 1.5 },
    line: 'Snow starts to fall!', over: 'The snow let up.',
    desc: 'Everything but Ice loses a sixteenth of its HP each turn, and Ice types keep 1.5x Melee Def.',
  },
};

/**
 * boost: multiplier for a grounded user's move by type.  damp: multiplier against a grounded target.
 * heal: fraction of max HP a grounded creature mends each turn.  noSleep / noStatus: what it refuses to allow.
 */
export const TERRAIN = {
  grassy: {
    id: 'grassy', name: 'Grassy Field', short: 'Grass', icon: '❦', color: '#7fd05a',
    boost: { Grass: 1.3 }, heal: FIELD.chip,
    line: 'Grass surges up underfoot!', over: 'The grass withered away.',
    desc: 'Grass moves hit 1.3x harder and anything on the ground mends a sixteenth of its HP each turn.',
  },
  charged: {
    id: 'charged', name: 'Charged Field', short: 'Charge', icon: '⚡', color: '#ffd84a',
    boost: { Electric: 1.3 }, noSleep: true,
    line: 'The ground crackles with charge!', over: 'The charge earthed itself.',
    desc: 'Electric moves hit 1.3x harder and nothing on the ground can be put to sleep.',
  },
  misty: {
    id: 'misty', name: 'Misty Field', short: 'Mist', icon: '☁', color: '#e4b3ff',
    damp: { Dragon: 0.5 }, noStatus: true,
    line: 'Mist rolls in over the ground!', over: 'The mist thinned out.',
    desc: 'Dragon moves land at half strength on the ground and nothing on the ground can be given a status.',
  },
};

export const WEATHER_IDS = Object.keys(WEATHER);
export const TERRAIN_IDS = Object.keys(TERRAIN);
export function getWeather(id) { return (id && WEATHER[id]) || null; }
export function getTerrain(id) { return (id && TERRAIN[id]) || null; }

/** A fresh, clear field. */
export function emptyField() { return { weather: null, weatherTurns: 0, terrain: null, terrainTurns: 0 }; }

/** The weather multiplier on a move of this type (1 when the sky has nothing to say about it). */
export function weatherPower(weatherId, type) {
  const w = getWeather(weatherId);
  return (w && w.boost && w.boost[type]) || 1;
}
/** The terrain multiplier for a grounded user (boost) or against a grounded target (damp). */
export function terrainPower(terrainId, type, side = 'user') {
  const t = getTerrain(terrainId);
  if (!t) return 1;
  const table = side === 'user' ? t.boost : t.damp;
  return (table && table[type]) || 1;
}
/** Does this weather wear a creature of these types down at the end of the turn? */
export function weatherChips(weatherId, types) {
  const w = getWeather(weatherId);
  if (!w || !w.chip) return 0;
  return (w.safe || []).some((t) => types.includes(t)) ? 0 : w.chip;
}
/** The defence a weather props up for a creature of these types (1 when it does nothing for it). */
export function weatherGuard(weatherId, types, stat) {
  const w = getWeather(weatherId);
  if (!w || !w.guard || w.guard.stat !== stat) return 1;
  return w.guard.types.some((t) => types.includes(t)) ? w.guard.m : 1;
}

/** Name of whatever is set, for a banner or a log line. */
export function fieldName(field) {
  if (!field) return '';
  const bits = [];
  const w = getWeather(field.weather), t = getTerrain(field.terrain);
  if (w) bits.push(w.name);
  if (t) bits.push(t.name);
  return bits.join(' · ');
}

/**
 * The weather a biome hands a fight that starts in it, before anyone throws a move. Deserts and
 * volcanoes are bright, marshes are wet, high stone is cold: the map is already an argument.
 */
export const BIOME_WEATHER = {
  reptile: 'sun', fiend: 'sun', draconic: 'snow', bird: 'snow', spirit: 'rain', amphibian: 'rain',
  fish: 'rain', myriapod: 'sand', skeletal: 'sand', crystalline: 'sand', wyrm: 'sand',
};
/** The terrain a biome starts a fight on, where its ground has a character of its own. */
export const BIOME_TERRAIN = {
  mammal: 'grassy', flora: 'grassy', insect: 'grassy', fungus: 'misty', nightwing: 'misty',
  invertebrate: 'misty', ooze: 'charged',
};

/** The type a weather lends a move that takes after the sky. */
export const WEATHER_TYPE = { sun: 'Fire', rain: 'Water', sand: 'Rock', snow: 'Ice' };

/** What a hazard on the ground does to whatever walks into it. */
export const HAZARDS = {
  spikes: { id: 'spikes', name: 'Caltrops', max: 3, hurt: [1 / 8, 1 / 6, 1 / 4], grounded: true, line: 'Caltrops are scattered underfoot!', over: 'The caltrops were swept away.' },
  barbs: { id: 'barbs', name: 'Toxic Burrs', max: 1, status: 'psn', grounded: true, line: 'Toxic burrs litter the ground!', over: 'The burrs were swept away.' },
  shards: { id: 'shards', name: 'Stone Shards', max: 1, typed: 'Rock', hurt: [1 / 8], grounded: false, line: 'Sharp stones hang in the air!', over: 'The stones were swept away.' },
};
/** Screens and the other things a side can put up. Screens are read by damage type. */
export const SIDE_CONDITIONS = {
  screenMelee: { id: 'screenMelee', name: 'Bulwark Screen', turns: 5, cat: 'melee', m: 0.5 },
  screenRanged: { id: 'screenRanged', name: 'Deflect Screen', turns: 5, cat: 'ranged', m: 0.5 },
  screenMagic: { id: 'screenMagic', name: 'Ward Screen', turns: 5, cat: 'magic', m: 0.5 },
  tailwind: { id: 'tailwind', name: 'Tailwind', turns: 4, speed: 2 },
  safeguard: { id: 'safeguard', name: 'Safeguard', turns: 5 },
};
export const SCREEN_OF = { melee: 'screenMelee', ranged: 'screenRanged', magic: 'screenMagic' };
/** The volatile states a creature carries until it leaves the field. */
export const VOLATILES = {
  confuse: { name: 'Confusion', line: 'is confused!', over: 'shook off its confusion.' },
  bind: { name: 'Bind', line: 'is bound tight!', over: 'broke free.' },
  taunt: { name: 'Taunt', line: 'is taunted into attacking!', over: 'shook off the taunt.' },
  encore: { name: 'Encore', line: 'is stuck on its last move!', over: 'is free to choose again.' },
};
export const BIND = { turns: [4, 5], r: 1 / 8 };
export const SUB = { r: 1 / 4 };
export const CONFUSE = { turns: [2, 5], self: 40, chance: 1 / 3 };
export const TAUNT_TURNS = 3, ENCORE_TURNS = 3;
