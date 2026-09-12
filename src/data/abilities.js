// Passive abilities. The engine implements behaviour by id; this table holds names and text.
export const ABILITIES = {
  ember_heart: { name: 'Ember Heart', desc: 'Fire moves hit 1.5x harder when HP is a third or less.' },
  tide_heart: { name: 'Tide Heart', desc: 'Water moves hit 1.5x harder when HP is a third or less.' },
  bloom_heart: { name: 'Bloom Heart', desc: 'Grass moves hit 1.5x harder when HP is a third or less.' },
  stonewall: { name: 'Stonewall', desc: 'Survives any single hit from full HP with 1 HP left.' },
  menace: { name: 'Menace', desc: 'Lowers the foe’s Melee Atk and Ranged Atk on entry.' },
  momentum: { name: 'Momentum', desc: 'Speed rises at the end of every turn.' },
  blubber: { name: 'Blubber', desc: 'Takes half damage from Fire and Ice moves.' },
  hover: { name: 'Hover', desc: 'Immune to Ground moves.' },
  second_wind: { name: 'Second Wind', desc: 'Restores a third of max HP when switched out.' },
  grit: { name: 'Grit', desc: 'Melee and Ranged attacks are 1.5x while statused, and burns do not weaken them.' },
  thorn_hide: { name: 'Thorn Hide', desc: 'Attackers that make contact lose an eighth of their HP.' },
  live_fur: { name: 'Live Fur', desc: 'Contact has a 30% chance to paralyze the attacker.' },
  hot_blooded: { name: 'Hot Blooded', desc: 'Contact has a 30% chance to burn the attacker.' },
  venom_barbs: { name: 'Venom Barbs', desc: 'Contact has a 30% chance to poison the attacker.' },
  sponge: { name: 'Sponge', desc: 'Water moves heal a quarter of max HP instead of damaging.' },
  capacitor: { name: 'Capacitor', desc: 'Electric moves heal a quarter of max HP instead of damaging.' },
  purebred: { name: 'Purebred', desc: 'Same-type moves get +50% instead of +25%.' },
  finesse: { name: 'Finesse', desc: 'Moves with 60 power or less hit 1.5x harder.' },
  hawkeye: { name: 'Hawkeye', desc: 'Accuracy cannot be lowered.' },
  restless: { name: 'Restless', desc: 'Cannot fall asleep.' },
  antitoxin: { name: 'Antitoxin', desc: 'Cannot be poisoned.' },
  loose_joints: { name: 'Loose Joints', desc: 'Cannot be paralyzed.' },
  warm_core: { name: 'Warm Core', desc: 'Cannot be frozen.' },
  damp_coat: { name: 'Damp Coat', desc: 'Cannot be burned.' },
  heavy_hands: { name: 'Heavy Hands', desc: 'Punching moves hit 1.2x harder.' },
  vice_jaw: { name: 'Vice Jaw', desc: 'Biting moves hit 1.5x harder.' },
  swagger: { name: 'Swagger', desc: 'Melee Atk and Ranged Atk rise after knocking out a foe.' },
  thick_skull: { name: 'Thick Skull', desc: 'Takes no recoil damage.' },
  daredevil: { name: 'Daredevil', desc: 'Recoil moves hit 1.2x harder.' },
  lucky_streak: { name: 'Lucky Streak', desc: 'Secondary effects are twice as likely.' },
  frost_heart: { name: 'Frost Heart', desc: 'Ice moves hit 1.5x harder when HP is a third or less.' },
  storm_heart: { name: 'Storm Heart', desc: 'Electric moves hit 1.5x harder when HP is a third or less.' },
  venom_heart: { name: 'Venom Heart', desc: 'Poison moves hit 1.5x harder when HP is a third or less.' },
  gale_heart: { name: 'Gale Heart', desc: 'Flying moves hit 1.5x harder when HP is a third or less.' },
  stone_heart: { name: 'Stone Heart', desc: 'Rock moves hit 1.5x harder when HP is a third or less.' },
  regrowth: { name: 'Regrowth', desc: 'Restores a sixteenth of max HP at the end of every turn.' },
  iron_hide: { name: 'Iron Hide', desc: 'Takes three quarters damage from Melee moves.' },
  bulwark: { name: 'Bulwark', desc: 'Takes three quarters damage from Ranged moves.' },
  mirror_scale: { name: 'Mirror Scale', desc: 'Takes three quarters damage from Magic moves.' },
  steady: { name: 'Steady', desc: 'The foe cannot lower its stats.' },
  quick_start: { name: 'Quick Start', desc: 'Speed rises on entry.' },
  keen_edge: { name: 'Keen Edge', desc: 'Critical hits land twice as often.' },
  // Elemental cores: only born on Elementals, and passed down through fusion by chance.
  inferno_core: { name: 'Inferno Core', desc: 'Fire moves hit 1.3x harder. Cannot be burned; contact has a 30% chance to burn the attacker.' },
  tide_core: { name: 'Tide Core', desc: 'Water moves hit 1.3x harder. Restores a sixteenth of max HP every turn.' },
  storm_core: { name: 'Storm Core', desc: 'Electric moves hit 1.3x harder. Cannot be paralyzed; Speed rises on entry.' },
  frost_core: { name: 'Frost Core', desc: 'Ice moves hit 1.3x harder. Cannot be frozen; contact has a 30% chance to chill the attacker\u2019s Speed.' },
  verdant_core: { name: 'Verdant Core', desc: 'Grass moves hit 1.3x harder. Cannot be poisoned; Grass moves heal a quarter of max HP instead of damaging.' },
  umbral_core: { name: 'Umbral Core', desc: 'Dark and Ghost moves hit 1.3x harder. Lowers the foe\u2019s Magic Atk on entry.' },
  radiant_core: { name: 'Radiant Core', desc: 'Fairy and Psychic moves hit 1.3x harder. Immune to Dark moves.' },
  quake_core: { name: 'Quake Core', desc: 'Ground and Rock moves hit 1.3x harder. Takes three quarters damage from Melee moves.' },
  corrosion_core: { name: 'Corrosion Core', desc: 'Steel and Poison moves hit 1.3x harder. Contact lowers the attacker\u2019s Melee Def.' },
  vital_core: { name: 'Vital Core', desc: 'Dark and Fighting moves hit 1.3x harder. Contact moves heal a quarter of the damage they deal.' },
  void_core: { name: 'Void Core', desc: 'Ghost and Psychic moves hit 1.3x harder. Takes half damage from Ranged moves.' },
  lunar_core: { name: 'Lunar Core', desc: 'Dark and Fairy moves hit 1.3x harder. Cannot be put to sleep; Magic Def rises on entry.' },
  resonant_core: { name: 'Resonant Core', desc: 'Rock and Psychic moves hit 1.3x harder. Magic moves that hit it deal a quarter of their damage back to the attacker.' },
  mist_core: { name: 'Mist Core', desc: 'Water and Ghost moves hit 1.3x harder. One attack in five misses it.' },
};

// ---- data-driven passives ---------------------------------------------------------------------------
// The passives above are implemented by id in the engine. Everything below is described by `fx` entries the
// engine interprets generically (see battle/engine.js, abFx), so a passive is a data row: a kind and a few
// numbers. Descriptions are written from the entries in the game's own stat words unless given by hand.
//
// Kinds (user side unless noted): typeBoost {type, m, low}  catBoost {cat, m}  flagBoost {flag, m}  powerBand {min|max, m}
//   fxBoost {fx, m}  firstStrike {m}  lastStrike {m}  statusBoost {m}  fullHpBoost {m}  foeLowBoost {m}  prioBoost {m}
//   sheerForce {m}  statMul {stat, m}  statusStat {stat, m}  tintedLens {m}  critBoost {m}  critRate {m}  mercilessCrit
//   accBoost {m}  catAcc {cat, m}  noGuard  scrappy  addFlinch {p}  addStatus {s, p, contact}  koStat {stats}  koHeal {r}
//   prioType {type}  prioStatus  prioHeal  quickDraw {p}  earlyBird
// Target side: typeResist {type, m}  typeWeak {type, m}  catResist {cat, m}  flagResist {flag, m}  allResist {m}
//   fullHpResist {m}  lowHpResist {m}  filter {m}  defMul {stat, m}  statusDef {stat, m}  critImmune  evasion {m}
//   typeImmune {type}  typeAbsorb {type, heal, stats}  contactHurt {r}  contactStatus {s, p}  contactStat {stats, p}
//   hurtStat {cat, stats}  hitByTypeStat {type, stats}  hurtFoeStat {stats, p}  catThorns {cat, r}  critStat {stats}
//   lowHpStat {stats, at}  aftermath {r}  shieldDust  flinchImmune  soundImmune  powderImmune  prioImmune  pressure
//   statusImmune {s}  allStatusImmune  statusMoveImmune  synchronize  liquidOoze  noStatDrop {stat}  debuffedStat {stats}
// Either: entryStat {who, stats}  turnHeal {r}  turnStat {stats, p}  turnCure {p}  poisonHeal  turnHurtFoe {r, statusOnly}
//   switchCure  switchHeal {r}  flinchStat {stats}  magicGuard  recoilImmune
import { STAT_NAMES } from './damage.js';

const AB_CAT_NAME = { melee: 'Melee', ranged: 'Ranged', magic: 'Magic' };
const AB_STATUS_NAME = { brn: 'burn', psn: 'poison', par: 'paralysis', slp: 'sleep', frz: 'freeze' };
const AB_STATUS_VERB = { brn: 'burned', psn: 'poisoned', par: 'paralyzed', slp: 'put to sleep', frz: 'frozen' };
const AB_FLAG_NAME = { contact: 'Contact', punch: 'Punching', bite: 'Biting', sound: 'Sound', powder: 'Powder' };
const AB_FX_NAME = { drain: 'Draining', recoil: 'Recoil', multi: 'Multi-hit', status: 'Status-inflicting', flinch: 'Flinching' };
const abFrac = (r) => (Math.abs(r - 1 / 16) < 1e-9 ? 'a sixteenth' : Math.abs(r - 1 / 8) < 1e-9 ? 'an eighth' : Math.abs(r - 1 / 6) < 1e-9 ? 'a sixth' : Math.abs(r - 1 / 4) < 1e-9 ? 'a quarter' : Math.abs(r - 1 / 3) < 1e-9 ? 'a third' : Math.abs(r - 1 / 2) < 1e-9 ? 'half' : `${Math.round(r * 100)}%`);
const abStages = (stats, who) => Object.entries(stats).map(([k, n]) => `${who} ${STAT_NAMES[k] || k} ${n > 0 ? 'rises' : 'falls'}${Math.abs(n) > 1 ? ' sharply' : ''}`).join(' and ');
const abChance = (p) => (p == null || p >= 100 ? '' : `${p}% chance to `);
const abX = (m) => `${m}x`;
export function describeFx(f) {
  switch (f.k) {
    case 'typeBoost': return f.low ? `${f.type} moves hit ${abX(f.m)} harder when HP is a third or less.` : `${f.type} moves hit ${abX(f.m)} harder.`;
    case 'catBoost': return `${AB_CAT_NAME[f.cat]} moves hit ${abX(f.m)} harder.`;
    case 'flagBoost': return `${AB_FLAG_NAME[f.flag]} moves hit ${abX(f.m)} harder.`;
    case 'powerBand': return f.max != null ? `Moves with ${f.max} power or less hit ${abX(f.m)} harder.` : `Moves with ${f.min} power or more hit ${abX(f.m)} harder.`;
    case 'fxBoost': return `${AB_FX_NAME[f.fx]} moves hit ${abX(f.m)} harder.`;
    case 'firstStrike': return `Hits ${abX(f.m)} harder when it moves before the foe.`;
    case 'lastStrike': return `Hits ${abX(f.m)} harder when it moves after the foe.`;
    case 'statusBoost': return `Hits ${abX(f.m)} harder against a foe with a status.`;
    case 'fullHpBoost': return `Hits ${abX(f.m)} harder at full HP.`;
    case 'foeLowBoost': return `Hits ${abX(f.m)} harder against a foe at half HP or less.`;
    case 'prioBoost': return `Priority moves hit ${abX(f.m)} harder.`;
    case 'sheerForce': return `Moves with a side effect hit ${abX(f.m)} harder but lose the effect.`;
    case 'statMul': return `${STAT_NAMES[f.stat]} is ${abX(f.m)}.`;
    case 'statusStat': return `${STAT_NAMES[f.stat]} is ${abX(f.m)} while statused.`;
    case 'tintedLens': return `Not very effective moves hit ${abX(f.m)} harder.`;
    case 'critBoost': return `Critical hits deal ${abX(f.m)} damage instead of 1.5x.`;
    case 'critRate': return `Critical hits land ${f.m}x as often.`;
    case 'mercilessCrit': return 'Always lands a critical hit on a foe with a status.';
    case 'accBoost': return `Accuracy is ${abX(f.m)}.`;
    case 'catAcc': return `${AB_CAT_NAME[f.cat]} moves have ${abX(f.m)} accuracy.`;
    case 'noGuard': return 'Neither side can miss.';
    case 'scrappy': return 'Normal and Fighting moves hit Ghost types.';
    case 'addFlinch': return `Damaging moves have a ${f.p}% chance to make the foe flinch.`;
    case 'addStatus': return `${f.contact ? 'Contact' : 'Damaging'} moves have a ${f.p}% chance to ${AB_STATUS_VERB[f.s] === 'put to sleep' ? 'put the foe to sleep' : `leave the foe ${AB_STATUS_VERB[f.s]}`}.`;
    case 'koStat': return `${abStages(f.stats, 'Own')} after knocking out a foe.`;
    case 'koHeal': return `Restores ${abFrac(f.r)} of max HP after knocking out a foe.`;
    case 'prioType': return `${f.type} moves gain +1 priority${f.full ? ' at full HP' : ''}.`;
    case 'prioStatus': return 'Status moves gain +1 priority.';
    case 'prioHeal': return 'Healing moves gain +1 priority.';
    case 'quickDraw': return `${f.p}% chance to move first each turn.`;
    case 'earlyBird': return 'Sleeps half as long.';
    case 'typeResist': return `Takes ${abX(f.m)} damage from ${f.type} moves.`;
    case 'typeWeak': return `Takes ${abX(f.m)} damage from ${f.type} moves.`;
    case 'catResist': return `Takes ${abX(f.m)} damage from ${AB_CAT_NAME[f.cat]} moves.`;
    case 'flagResist': return `Takes ${abX(f.m)} damage from ${AB_FLAG_NAME[f.flag].toLowerCase()} moves.`;
    case 'allResist': return `Takes ${abX(f.m)} damage from every move.`;
    case 'fullHpResist': return `Takes ${abX(f.m)} damage while at full HP.`;
    case 'lowHpResist': return `Takes ${abX(f.m)} damage when HP is a third or less.`;
    case 'filter': return `Takes ${abX(f.m)} damage from super effective moves.`;
    case 'defMul': return `${STAT_NAMES[f.stat]} is ${abX(f.m)}.`;
    case 'statusDef': return `${STAT_NAMES[f.stat]} is ${abX(f.m)} while statused.`;
    case 'critImmune': return 'Cannot be hit critically.';
    case 'evasion': return `Foes’ moves have ${abX(f.m)} accuracy against it.`;
    case 'typeImmune': return `Immune to ${f.type} moves.`;
    case 'typeAbsorb': return f.heal ? `${f.type} moves heal ${abFrac(f.heal)} of max HP instead of damaging.` : `Immune to ${f.type} moves; ${abStages(f.stats, 'own')} when hit by one.`;
    case 'contactHurt': return `Attackers that make contact lose ${abFrac(f.r)} of their HP.`;
    case 'contactStatus': return f.s === 'random' ? `Contact has a ${f.p}% chance to leave the attacker burned, poisoned or paralyzed.` : `Contact has a ${f.p}% chance to leave the attacker ${AB_STATUS_VERB[f.s]}.`;
    case 'contactStat': return `${abChance(f.p) ? `Contact has a ${f.p}% chance: the attacker’s ` : 'Contact: the attacker’s '}${abStages(f.stats, '').trim().replace(/^ /, '')}.`;
    case 'hurtStat': return `${abStages(f.stats, 'Own')} when hit by a ${f.cat ? `${AB_CAT_NAME[f.cat]} ` : ''}move.`;
    case 'hitByTypeStat': return `${abStages(f.stats, 'Own')} when hit by a ${f.type} move.`;
    case 'hurtFoeStat': return `${abChance(f.p) ? `When hit, ${f.p}% chance that the attacker’s ` : 'When hit, the attacker’s '}${abStages(f.stats, '').trim()}.`;
    case 'catThorns': return `${AB_CAT_NAME[f.cat]} moves that hit it deal ${abFrac(f.r)} of their damage back.`;
    case 'critStat': return `${abStages(f.stats, 'Own')} when hit critically.`;
    case 'lowHpStat': return `${abStages(f.stats, 'Own')} the first time HP falls to ${abFrac(f.at)} or less.`;
    case 'aftermath': return `An attacker that knocks it out with contact loses ${abFrac(f.r)} of its HP.`;
    case 'shieldDust': return 'Foes’ moves never trigger their side effects on it.';
    case 'flinchImmune': return 'Cannot flinch.';
    case 'soundImmune': return 'Immune to sound moves.';
    case 'powderImmune': return 'Immune to powder moves.';
    case 'prioImmune': return 'Immune to priority moves.';
    case 'pressure': return 'Foes spend two PP on every move against it.';
    case 'statusImmune': return `Cannot be ${AB_STATUS_VERB[f.s]}.`;
    case 'allStatusImmune': return 'Cannot be given any status.';
    case 'statusMoveImmune': return 'Immune to foes’ status moves.';
    case 'synchronize': return 'A status a foe inflicts on it is inflicted back.';
    case 'liquidOoze': return 'Foes that drain HP from it are hurt instead.';
    case 'noStatDrop': return `Foes cannot lower its ${STAT_NAMES[f.stat]}.`;
    case 'debuffedStat': return `${abStages(f.stats, 'Own')} whenever a foe lowers one of its stats.`;
    case 'entryStat': return `${abStages(f.stats, f.who === 'self' ? 'Own' : 'The foe’s')} on entry.`;
    case 'turnHeal': return `Restores ${abFrac(f.r)} of max HP at the end of every turn.`;
    case 'turnStat': return `${abChance(f.p) ? `${f.p}% chance each turn: ` : 'Each turn '}${abStages(f.stats, 'own')}.`;
    case 'turnCure': return `${f.p}% chance to shake off a status at the end of each turn.`;
    case 'poisonHeal': return 'Poison heals an eighth of max HP each turn instead of hurting.';
    case 'turnHurtFoe': return f.statusOnly ? `A foe with a status loses ${abFrac(f.r)} of its HP at the end of every turn.` : `The foe loses ${abFrac(f.r)} of its HP at the end of every turn.`;
    case 'switchCure': return 'Sheds any status when switched out.';
    case 'switchHeal': return `Restores ${abFrac(f.r)} of max HP when switched out.`;
    case 'flinchStat': return `${abStages(f.stats, 'Own')} when it flinches.`;
    case 'magicGuard': return 'Takes no damage from burns, poison, recoil or thorns.';
    case 'recoilImmune': return 'Takes no recoil damage.';
    default: return '';
  }
}
const abCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/** Register a data-driven passive: id, name, fx entries and an optional hand-written description. */
function defA(id, name, fx, desc) {
  const list = Array.isArray(fx) ? fx : [fx];
  ABILITIES[id] = { id, name, desc: desc || list.map((f) => abCap(describeFx(f))).join(' '), fx: list };
}
const AB_TYPES = ['Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Normal'];

// Batch 1: type affinities, the ten surges the first eight left out, type resists, absorbs and a few style boosts.
const AB_AFFINITY = { Fire: 'Kindled', Water: 'Tidewise', Electric: 'Charged', Grass: 'Verdant', Ice: 'Frostbound', Fighting: 'Pugnacious', Poison: 'Toxic Blood', Ground: 'Earthbound', Flying: 'Windborne', Psychic: 'Clairvoyant', Bug: 'Swarming', Rock: 'Stonebound', Ghost: 'Haunting', Dragon: 'Drakeblood', Dark: 'Nightborn', Steel: 'Tempered', Fairy: 'Enchanted', Normal: 'Plainspoken' };
for (const t of AB_TYPES) defA(`${t.toLowerCase()}_affinity`, AB_AFFINITY[t], { k: 'typeBoost', type: t, m: 1.2 });
const AB_SURGE2 = { Fighting: 'Fist Heart', Ground: 'Quake Heart', Psychic: 'Mind Heart', Bug: 'Hive Heart', Ghost: 'Grave Heart', Dragon: 'Wyrm Heart', Dark: 'Dusk Heart', Steel: 'Iron Heart', Fairy: 'Glimmer Heart', Normal: 'Plain Heart' };
for (const [t, name] of Object.entries(AB_SURGE2)) defA(`${t.toLowerCase()}_heart`, name, { k: 'typeBoost', type: t, m: 1.5, low: true });
const AB_RESIST = { Fire: 'Heatproof', Water: 'Waterproof', Electric: 'Insulated', Grass: 'Thornproof', Ice: 'Frostproof', Fighting: 'Padded', Poison: 'Detoxed', Ground: 'Dustproof', Flying: 'Windproof', Psychic: 'Dull Mind', Bug: 'Chitinous', Rock: 'Rockproof', Ghost: 'Warded', Dragon: 'Drakeproof', Dark: 'Lightbearer', Steel: 'Rustproof', Fairy: 'Cold Iron', Normal: 'Blunted' };
for (const t of AB_TYPES) defA(`${t.toLowerCase()}_proof`, AB_RESIST[t], { k: 'typeResist', type: t, m: 0.6 });
defA('ember_eater', 'Ember Eater', { k: 'typeAbsorb', type: 'Fire', heal: 0.25 });
defA('sap_drinker', 'Sap Drinker', { k: 'typeAbsorb', type: 'Grass', stats: { melee: 1 } });
defA('storm_drinker', 'Storm Drinker', { k: 'typeAbsorb', type: 'Electric', stats: { magic: 1 } });
defA('earth_eater', 'Earth Eater', { k: 'typeAbsorb', type: 'Ground', heal: 0.25 });
defA('frost_feeder', 'Frost Feeder', { k: 'typeAbsorb', type: 'Ice', heal: 0.25 });
defA('toxin_drinker', 'Toxin Drinker', { k: 'typeAbsorb', type: 'Poison', heal: 0.25 });
defA('wind_rider', 'Wind Rider', { k: 'typeAbsorb', type: 'Flying', stats: { spe: 1 } });
defA('soul_sieve', 'Soul Sieve', { k: 'typeAbsorb', type: 'Ghost', stats: { magicDef: 1 } });
defA('heavy_blows', 'Heavy Blows', { k: 'catBoost', cat: 'melee', m: 1.15 });
defA('steady_aim', 'Steady Aim', { k: 'catBoost', cat: 'ranged', m: 1.15 });
defA('deep_focus', 'Deep Focus', { k: 'catBoost', cat: 'magic', m: 1.15 });
defA('tough_claws', 'Tough Claws', { k: 'flagBoost', flag: 'contact', m: 1.25 });
defA('loud_voice', 'Loud Voice', { k: 'flagBoost', flag: 'sound', m: 1.3 });
defA('power_hitter', 'Power Hitter', { k: 'powerBand', min: 100, m: 1.2 });
defA('barrage', 'Barrage', { k: 'fxBoost', fx: 'multi', m: 1.3 });
defA('leech', 'Leech', { k: 'fxBoost', fx: 'drain', m: 1.3 });

// Batch 2: entry effects, end-of-turn effects, knockouts, contact, reactions to being hit, switches, low HP, accuracy and critical hits.
defA('warcry', 'Warcry', { k: 'entryStat', who: 'self', stats: { melee: 1 } });
defA('take_aim', 'Take Aim', { k: 'entryStat', who: 'self', stats: { ranged: 1 } });
defA('centered', 'Centered', { k: 'entryStat', who: 'self', stats: { magic: 1 } });
defA('brace_up', 'Brace Up', { k: 'entryStat', who: 'self', stats: { meleeDef: 1 } });
defA('shield_up', 'Shield Up', { k: 'entryStat', who: 'self', stats: { rangedDef: 1 } });
defA('ward_up', 'Ward Up', { k: 'entryStat', who: 'self', stats: { magicDef: 1 } });
defA('daunting', 'Daunting', { k: 'entryStat', who: 'foe', stats: { spe: -1 } });
defA('piercing_gaze', 'Piercing Gaze', { k: 'entryStat', who: 'foe', stats: { meleeDef: -1 } });
defA('unsettling', 'Unsettling', { k: 'entryStat', who: 'foe', stats: { rangedDef: -1 } });
defA('hex_eye', 'Hex Eye', { k: 'entryStat', who: 'foe', stats: { magicDef: -1 } });
defA('cowing', 'Cowing', { k: 'entryStat', who: 'foe', stats: { melee: -1 } });
defA('withering_stare', 'Withering Stare', { k: 'entryStat', who: 'foe', stats: { magic: -1 } });
defA('overgrowth', 'Overgrowth', { k: 'turnHeal', r: 1 / 8 });
defA('second_skin', 'Second Skin', { k: 'turnCure', p: 30 });
defA('rising_fury', 'Rising Fury', { k: 'turnStat', stats: { melee: 1 }, p: 30 });
defA('gathering_storm', 'Gathering Storm', { k: 'turnStat', stats: { magic: 1 }, p: 30 });
defA('steadying', 'Steadying', { k: 'turnStat', stats: { ranged: 1 }, p: 30 });
defA('hardening', 'Hardening', { k: 'turnStat', stats: { meleeDef: 1 }, p: 30 });
defA('venom_feeder', 'Venom Feeder', { k: 'poisonHeal' });
defA('rot_aura', 'Rot Aura', { k: 'turnHurtFoe', r: 1 / 16, statusOnly: true });
defA('dread_aura', 'Dread Aura', { k: 'turnHurtFoe', r: 1 / 16 });
defA('soul_eater', 'Soul Eater', { k: 'koStat', stats: { magic: 1 } });
defA('bloodlust', 'Bloodlust', { k: 'koStat', stats: { spe: 1 } });
defA('feast', 'Feast', { k: 'koHeal', r: 1 / 4 });
defA('barbed', 'Barbed', { k: 'contactHurt', r: 1 / 6 });
defA('frost_fur', 'Frost Fur', { k: 'contactStatus', s: 'frz', p: 20 });
defA('sleep_spores', 'Sleep Spores', { k: 'contactStatus', s: 'slp', p: 20 });
defA('spore_cloud', 'Spore Cloud', { k: 'contactStatus', s: 'random', p: 30 });
defA('gooey', 'Gooey', { k: 'contactStat', stats: { spe: -1 } });
defA('corroding_hide', 'Corroding Hide', { k: 'contactStat', stats: { meleeDef: -1 } });
defA('numbing_slime', 'Numbing Slime', { k: 'contactStat', stats: { melee: -1 }, p: 50 });
defA('blinding_dust', 'Blinding Dust', { k: 'contactStat', stats: { acc: -1 }, p: 30 });
defA('stoked', 'Stoked', { k: 'hurtStat', cat: 'melee', stats: { melee: 1 } });
defA('spiteful', 'Spiteful', { k: 'hurtStat', cat: 'magic', stats: { magic: 1 } });
defA('stamina', 'Stamina', { k: 'hurtStat', stats: { meleeDef: 1 } });
defA('weak_armor', 'Weak Armor', { k: 'hurtStat', cat: 'melee', stats: { meleeDef: -1, spe: 2 } });
defA('righteous', 'Righteous', { k: 'hitByTypeStat', type: 'Dark', stats: { melee: 1 } });
defA('rattled', 'Rattled', [{ k: 'hitByTypeStat', type: 'Ghost', stats: { spe: 1 } }, { k: 'hitByTypeStat', type: 'Bug', stats: { spe: 1 } }, { k: 'hitByTypeStat', type: 'Dark', stats: { spe: 1 } }], 'Own Speed rises when hit by a Ghost, Bug or Dark move.');
defA('water_compaction', 'Water Compaction', { k: 'hitByTypeStat', type: 'Water', stats: { meleeDef: 2 } });
defA('steam_engine', 'Steam Engine', [{ k: 'hitByTypeStat', type: 'Fire', stats: { spe: 2 } }, { k: 'hitByTypeStat', type: 'Water', stats: { spe: 2 } }], 'Own Speed rises sharply when hit by a Fire or Water move.');
defA('thermal_exchange', 'Thermal Exchange', [{ k: 'hitByTypeStat', type: 'Fire', stats: { melee: 1 } }, { k: 'statusImmune', s: 'brn' }]);
defA('cotton_down', 'Cotton Down', { k: 'hurtFoeStat', stats: { spe: -1 } });
defA('sapping_hide', 'Sapping Hide', { k: 'hurtFoeStat', stats: { melee: -1 }, p: 30 });
defA('anger_point', 'Anger Point', { k: 'critStat', stats: { melee: 2 } });
defA('ricochet', 'Ricochet', { k: 'catThorns', cat: 'ranged', r: 1 / 4 });
defA('backlash', 'Backlash', { k: 'catThorns', cat: 'melee', r: 1 / 4 });
defA('natural_cure', 'Natural Cure', { k: 'switchCure' });
defA('rest_easy', 'Rest Easy', { k: 'switchHeal', r: 1 / 4 });
defA('berserk', 'Berserk', { k: 'lowHpStat', stats: { magic: 1 }, at: 0.5 });
defA('anger_shell', 'Anger Shell', { k: 'lowHpStat', stats: { melee: 1, spe: 1, meleeDef: -1 }, at: 0.5 });
defA('last_stand', 'Last Stand', { k: 'lowHpResist', m: 0.7 });
defA('multiscale', 'Multiscale', { k: 'fullHpResist', m: 0.5 });
defA('compound_eyes', 'Compound Eyes', { k: 'accBoost', m: 1.3 });
defA('sand_veil', 'Sand Veil', { k: 'evasion', m: 0.8 });
defA('tangled_feet', 'Tangled Feet', { k: 'evasion', m: 0.85 });
defA('no_guard', 'No Guard', { k: 'noGuard' });
defA('sniper', 'Sniper', { k: 'critBoost', m: 2.25 });
defA('super_luck', 'Super Luck', { k: 'critRate', m: 3 });
defA('shell_armor', 'Shell Armor', { k: 'critImmune' });
defA('merciless', 'Merciless', { k: 'mercilessCrit' });
defA('steady_nerves', 'Steady Nerves', { k: 'flinchImmune' });

export const ABILITY_IDS = Object.keys(ABILITIES);
export function getAbility(id) { return ABILITIES[id] || null; }
export function abilityName(id) { const a = ABILITIES[id]; return a ? a.name : 'None'; }
/** The fx entries of a kind on a passive (empty for the hand-implemented ones and unknown ids). */
export function abilityFx(id, kind) { const a = ABILITIES[id]; return a && a.fx ? a.fx.filter((f) => f.k === kind) : []; }
/** Every data-driven passive. */
export const DATA_ABILITY_IDS = ABILITY_IDS.filter((id) => ABILITIES[id].fx);
