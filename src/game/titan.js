// Titans: one authored thing per region, older and larger than the Warden who guards the door.
//
// A Warden is a trainer with a team; a Titan is a single creature that the region grew around, with an
// escort at its heel, both of its passive slots filled, a greater charm in hand and the weather or ground
// of its home already up as the fight opens. One per journey per region, once you hold that region's badge.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { speciesGenome } from '../creature/genome.js';
import { signatureOf, MOVES, getMove } from '../data/moves.js';
import { REGIONS, BIOME_ORDER } from './world.js';
import { BIOME_WEATHER, BIOME_TERRAIN } from '../data/field.js';
import { WARDEN_CHARMS, greaterOf } from '../data/charms.js';
import { learnsetOf } from '../creature/genome.js';

/** Levels over the region's own, what the escort gives away, and how the purse is worked out. */
export const TITAN = { over: 20, escortUnder: 4, cap: 95, goldMul: 2 };

/**
 * The eighteen. `tactic` and `setter` are the two moves each one is authored with; the other two are its
 * own (a signature where it has one, then the hardest thing of its types it could reasonably know).
 */
export const TITANS = [
  { biome: 'mammal', name: 'Hartfell', title: 'The Antlered Judge', species: 'kirinth', escort: 'bloodmane', tactic: 'refrain', setter: 'wildgrass', line: 'The heather goes quiet. Something with antlers is watching you from the ridge.' },
  { biome: 'amphibian', name: 'Grumroar', title: 'The Fen’s Own Thunder', species: 'thunderbull', escort: 'bloodnewt', tactic: 'following_wind', setter: 'cloudburst', line: 'The fen water shivers, and a bellow rolls out of it like weather.' },
  { biome: 'flora', name: 'Old Bramblewyrm', title: 'The Wilds That Walk', species: 'wyrmwood', escort: 'ancientoak', tactic: 'caltrops', setter: 'wildgrass', line: 'A stand of bramble uproots itself and turns its knotted head toward you.' },
  { biome: 'insect', name: 'Nine-Eyes', title: 'The Meadow’s Oracle', species: 'oraclebug', escort: 'ironstag', tactic: 'ward_screen', setter: 'mistfall', line: 'Nine eyes open in the long grass, one after another, all of them on you.' },
  { biome: 'nightwing', name: 'Chasmjaw', title: 'The Long Echo', species: 'nightmaw', escort: 'voidbat', tactic: 'jeer', setter: 'mistfall', line: 'Your own footsteps come back wrong: deeper, closer, hungrier.' },
  { biome: 'fungus', name: 'Greatcap', title: 'The Standing Stone', species: 'stonecap', escort: 'drakecap', tactic: 'toxic_burrs', setter: 'mistfall', line: 'What you took for a boulder unfolds a cap the width of the clearing.' },
  { biome: 'bird', name: 'Ringlight', title: 'The Crag Halo', species: 'halowl', escort: 'thunderroc', tactic: 'deflect_screen', setter: 'snowveil', line: 'A ring of pale light banks over the crags and does not flap once.' },
  { biome: 'crystalline', name: 'Facetmaw', title: 'The Hundred Faces', species: 'diamondrake', escort: 'mindshard', tactic: 'stone_shards', setter: 'duststorm', line: 'The cavern shows you a hundred of yourself, and one of them moves first.' },
  { biome: 'ooze', name: 'Sumpmother', title: 'The Slow Flood', species: 'dragoop', escort: 'bilebeast', tactic: 'toxic_burrs', setter: 'sparkbed', line: 'The sump rises. It keeps rising after it should have stopped.' },
  { biome: 'fish', name: 'Lanternvoid', title: 'The Light Below', species: 'voidangler', escort: 'hippodrake', tactic: 'mind_spin', setter: 'cloudburst', line: 'A lantern swings far under the glass water, and the lagoon goes cold.' },
  { biome: 'myriapod', name: 'Thousandking', title: 'The Warren Crown', species: 'kingpede', escort: 'mindcoil', tactic: 'coil_grip', setter: 'duststorm', line: 'The warren floor is not floor. It is segments, and they are all turning.' },
  { biome: 'wyrm', name: 'Gorgesage', title: 'The Coil That Remembers', species: 'sagecoil', escort: 'starcoil', tactic: 'ward_screen', setter: 'duststorm', line: 'The gorge wall uncoils, and it says your name before you give it.' },
  { biome: 'invertebrate', name: 'Hollowmind', title: 'The Murk’s Memory', species: 'coralmind', escort: 'bloodleech', tactic: 'mind_spin', setter: 'mistfall', line: 'Something in the hollow is thinking, slowly and enormously, about you.' },
  { biome: 'skeletal', name: 'Barrowdread', title: 'The Bone Wyrm', species: 'dreadrake', escort: 'bloodmarrow', tactic: 'stone_shards', setter: 'duststorm', line: 'The barrow opens along its length, the way a jaw does.' },
  { biome: 'reptile', name: 'Scarblood', title: 'The Scar Itself', species: 'magmasaur', escort: 'drakelet', tactic: 'bulwark_screen', setter: 'sunflare', line: 'The Scar bleeds light, stands up on four legs, and looks at you.' },
  { biome: 'fiend', name: 'Sinklord', title: 'The Third Pact', species: 'pactling', escort: 'archfiend', tactic: 'jeer', setter: 'sunflare', line: 'A hand is offered out of the brimstone. Two others already took it.' },
  { biome: 'draconic', name: 'Peakelder', title: 'The Old Wing', species: 'eldrake', escort: 'infernodrake', tactic: 'following_wind', setter: 'snowveil', line: 'The mountain has a shadow it did not have a moment ago.' },
  { biome: 'spirit', name: 'Marshvigil', title: 'The Long Watch', species: 'eldershade', escort: 'bloodwraith', tactic: 'ward_song', setter: 'cloudburst', line: 'Every light in the marsh turns at once, and none of them blink.' },
];
export const TITAN_BY_BIOME = Object.fromEntries(TITANS.map((t) => [t.biome, t]));

/** The level a region's Titan fights at: well over its Warden, and never past the cap. */
export function titanLevel(biomeId) {
  const region = REGIONS[biomeId];
  return Math.min(TITAN.cap, (region ? region.level : 30) + TITAN.over);
}

/** The hardest thing of a type a creature could plausibly know, ignoring anyone else's signature. */
function bestOfType(type, cat) {
  let best = null;
  for (const mv of MOVES) {
    if (mv.signature || mv.struggle || mv.type !== type || mv.cat === 'status') continue;
    if (cat && mv.cat !== cat) continue;
    if (mv.power > 110 || (mv.acc != null && mv.acc < 85)) continue;
    if (!best || mv.power > best.power) best = mv;
  }
  return best;
}

/** The four moves a Titan brings: its own signature or best hit, a second type, its tactic and its field. */
export function titanMoves(entry) {
  const sp = SPECIES_BY_ID[entry.species];
  const out = [];
  const sig = signatureOf(entry.species);
  if (sig) out.push(sig.id);
  for (const type of (sp ? sp.types : []).filter(Boolean)) {
    const mv = bestOfType(type);
    if (mv && !out.includes(mv.id)) out.push(mv.id);
    if (out.length >= 2) break;
  }
  for (const id of [entry.tactic, entry.setter]) if (getMove(id) && !out.includes(id)) out.push(id);
  if (out.length < 4) for (const [, id] of learnsetOf(sp).slice().reverse()) { if (!out.includes(id)) out.push(id); if (out.length >= 4) break; }
  return out.slice(0, 4);
}

/** The field a Titan opens the fight on: whatever its own region is known for. */
export function titanField(biomeId) {
  const weather = BIOME_WEATHER[biomeId] || null, terrain = BIOME_TERRAIN[biomeId] || null;
  return weather || terrain ? { weather, terrain } : null;
}

/** The charm a Titan leaves behind: the greater form of the one its Warden hands out. */
export function titanPrize(biomeId) {
  const plain = WARDEN_CHARMS[biomeId];
  const up = plain && greaterOf(plain);
  return up ? up.id : null;
}

/** The Titan of a region, built the same way every time for a given journey. */
export function titanOf(j, biomeId) {
  const entry = TITAN_BY_BIOME[biomeId];
  if (!entry) return null;
  const rng = makeRng(`${j.seed}:titan:${biomeId}`);
  const sp = SPECIES_BY_ID[entry.species], esc = SPECIES_BY_ID[entry.escort];
  if (!sp) return null;
  const level = titanLevel(biomeId);
  const genome = speciesGenome(sp, rng.fork('t'));
  genome.name = entry.name; // it has a name of its own, not its species'
  const foes = [{
    genome, level, moves: titanMoves(entry), ability: sp.abilities[0], ability2: sp.abilities[1], held: titanPrize(biomeId),
  }];
  if (esc) foes.push({ genome: speciesGenome(esc, rng.fork('e')), level: Math.max(5, level - TITAN.escortUnder) });
  return { biome: biomeId, entry, level, foes, field: titanField(biomeId), prize: titanPrize(biomeId) };
}

/** Is this region's Titan still out there this journey? */
export function titanWaiting(j, biomeId) {
  return Boolean((j.badges || []).includes(biomeId) && !(j.titans || {})[biomeId] && TITAN_BY_BIOME[biomeId]);
}

/** Every region whose Titan is still waiting, for a list. */
export function titansLeft(j) { return BIOME_ORDER.filter((b) => titanWaiting(j, b)); }
