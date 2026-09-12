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
const AB_STAT_NAME = { ...STAT_NAMES, acc: 'accuracy', eva: 'evasion' };
const abAn = (word) => `${/^[AEIOU]/i.test(word) ? 'an' : 'a'} ${word}`;
const abList = (words) => (words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`);
const abStages = (stats, who) => {
  const rows = Object.entries(stats);
  const same = rows.every(([, n]) => (n > 0) === (rows[0][1] > 0) && Math.abs(n) === Math.abs(rows[0][1]));
  const verb = (n, many) => `${n > 0 ? (many ? 'rise' : 'rises') : (many ? 'fall' : 'falls')}${Math.abs(n) > 1 ? ' sharply' : ''}`;
  if (same && rows.length > 1) return `${who} ${abList(rows.map(([k]) => AB_STAT_NAME[k] || k))} ${verb(rows[0][1], true)}`.trim();
  return abList(rows.map(([k, n]) => `${who} ${AB_STAT_NAME[k] || k} ${verb(n, false)}`.trim()));
};
const abChance = (p) => (p == null || p >= 100 ? '' : `${p}% chance to `);
const abX = (m) => `${m}x`;
// a multiplier below one is not "harder": say it plainly
const abHarder = (m) => (m >= 1 ? `${abX(m)} harder` : `at ${abX(m)}`);
export function describeFx(f) {
  switch (f.k) {
    case 'typeBoost': return f.low ? `${f.type} moves hit ${abHarder(f.m)} when HP is a third or less.` : `${f.type} moves hit ${abHarder(f.m)}.`;
    case 'catBoost': return `${AB_CAT_NAME[f.cat]} moves hit ${abHarder(f.m)}.`;
    case 'flagBoost': return `${AB_FLAG_NAME[f.flag]} moves hit ${abHarder(f.m)}.`;
    case 'powerBand': return f.max != null ? `Moves with ${f.max} power or less hit ${abHarder(f.m)}.` : `Moves with ${f.min} power or more hit ${abHarder(f.m)}.`;
    case 'fxBoost': return `${AB_FX_NAME[f.fx]} moves hit ${abHarder(f.m)}.`;
    case 'firstStrike': return `Hits ${abHarder(f.m)} when it moves before the foe.`;
    case 'lastStrike': return `Hits ${abHarder(f.m)} when it moves after the foe.`;
    case 'statusBoost': return `Hits ${abHarder(f.m)} against a foe with a status.`;
    case 'fullHpBoost': return `Hits ${abHarder(f.m)} at full HP.`;
    case 'foeLowBoost': return `Hits ${abHarder(f.m)} against a foe at half HP or less.`;
    case 'prioBoost': return `Priority moves hit ${abHarder(f.m)}.`;
    case 'sheerForce': return `Moves with a side effect hit ${abHarder(f.m)} but lose the effect.`;
    case 'statMul': return `${STAT_NAMES[f.stat]} is ${abX(f.m)}.`;
    case 'statusStat': return `${STAT_NAMES[f.stat]} is ${abX(f.m)} while statused.`;
    case 'tintedLens': return `Not very effective moves hit ${abHarder(f.m)}.`;
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
    case 'hitByTypeStat': return `${abStages(f.stats, 'Own')} when hit by ${abAn(`${f.type} move`)}.`;
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
    case 'stab': return `Moves of its own type earn ${Math.round(f.m * 100)}% instead of 25%.`;
    case 'foeTypeBoost': return `Hits ${abHarder(f.m)} against ${f.type} types.`;
    case 'foeCatBoost': return `Hits ${abHarder(f.m)} against ${AB_CAT_NAME[f.cat]} fighters.`;
    case 'foeStatusBoost': return `Hits ${abHarder(f.m)} against a foe with ${f.s ? `a ${AB_STATUS_NAME[f.s]}` : 'a status'}.`;
    case 'foeFullBoost': return `Hits ${abHarder(f.m)} against a foe at full HP.`;
    case 'effBoost': return `Super effective moves hit ${abHarder(f.m)}.`;
    case 'neutralBoost': return `Moves the foe neither resists nor fears hit ${abHarder(f.m)}.`;
    case 'lowHpBoost': return `Hits ${abHarder(f.m)} when its own HP is a third or less.`;
    case 'firstTurnBoost': return `Hits ${abHarder(f.m)} on the turn it comes in.`;
    case 'lastOneBoost': return `Hits ${abHarder(f.m)} as the last one standing.`;
    case 'revengeBoost': return `Hits ${abHarder(f.m)} once a teammate has fallen.`;
    case 'repeatBoost': return `Hits ${abHarder(f.m)} when it uses the same move again.`;
    case 'slowStart': return `Hits ${abHarder(f.m)} for its first ${f.turns || 2} turns out.`;
    case 'defeatist': return `Hits ${abHarder(f.m)} while its HP is ${abFrac(f.at || 0.5)} or less.`;
    case 'hpCostBoost': return `Moves hit ${abHarder(f.m)} but cost ${abFrac(f.r)} of max HP.`;
    case 'multiExtra': return 'Multi-hit moves land one extra hit.';
    case 'drainMul': return `Draining moves recover ${abX(f.m)} as much.`;
    case 'recoilMul': return `Recoil costs ${abX(f.m)} as much.`;
    case 'moveTypeChange': return `${f.from} moves become ${f.to}${f.m && f.m !== 1 ? ` and hit ${abHarder(f.m)}` : ''}.`;
    case 'protean': return 'Becomes the type of the move it uses.';
    case 'colorChange': return 'Becomes the type of the move that hits it.';
    case 'statusChanceMul': return `Its moves’ side effects are ${abX(f.m)} as likely.`;
    case 'critStatus': return `A critical hit ${abChance(f.p) ? `has a ${f.p}% chance to leave` : 'leaves'} the foe ${AB_STATUS_VERB[f.s]}.`;
    case 'moldBreaker': return 'Ignores the guards and immunities of the creature it attacks.';
    case 'unaware': return 'Ignores the stat changes on the creature it faces.';
    case 'contrary': return 'Stat changes on it are reversed.';
    case 'simple': return 'Stat changes on it count double.';
    case 'download': return `On entry, reads the foe and raises its own Melee Atk or Magic Atk${f.n > 1 ? ' sharply' : ''}.`;
    case 'avengeStat': return `${abStages(f.stats, 'Own')} on entry once a teammate has fallen.`;
    case 'trace': return 'Copies the passive of the creature it faces on entry.';
    case 'disguise': return 'The first attack of the battle deals it no damage.';
    case 'endure': return 'Survives with 1 HP when hit by a knockout blow at full HP.';
    case 'lowHpHeal': return `The first time HP falls to ${abFrac(f.at || 0.25)} or less, restores ${abFrac(f.r)} of max HP.`;
    case 'magicBounce': return 'Foes’ status moves are bounced back at them.';
    case 'critShield': return `Critical hits against it deal ${abX(f.m)} damage.`;
    case 'firstHitResist': return `The first attack of the battle deals ${abX(f.m)} damage to it.`;
    case 'fxResist': return `Takes ${abX(f.m)} damage from ${AB_FX_NAME[f.fx].toLowerCase()} moves.`;
    case 'bandResist': return f.max != null ? `Takes ${abX(f.m)} damage from moves with ${f.max} power or less.` : `Takes ${abX(f.m)} damage from moves with ${f.min} power or more.`;
    case 'worldXp': return `Earns ${abX(f.m)} experience.`;
    case 'worldGold': return `Trainers pay ${abX(f.m)} gold while it is in the party.`;
    case 'worldCatch': return `Wild creatures are ${abX(f.m)} as easy to catch while it leads the fight.`;
    case 'lateBoost': return `Hits ${abHarder(f.m)} from turn ${f.from || 5} onward.`;
    case 'earlyBoost': return `Hits ${abHarder(f.m)} for the first ${f.until || 3} turns of a battle.`;
    case 'charmBoost': return `Hits ${abHarder(f.m)} while it holds a charm.`;
    case 'charmless': return `Hits ${abHarder(f.m)} while it holds nothing.`;
    case 'underdogBoost': return `Hits ${abHarder(f.m)} against a higher-level foe.`;
    case 'bullyBoost': return `Hits ${abHarder(f.m)} against a lower-level foe.`;
    case 'fullPartyBoost': return `Hits ${abHarder(f.m)} while the whole team still stands.`;
    case 'ppSave': return `${f.p}% chance to use a move without spending its PP.`;
    case 'benchHeal': return `Waiting teammates recover ${abFrac(f.r)} of max HP at the end of every turn.`;
    case 'benchCure': return `${f.p}% chance each turn to cure a waiting teammate's status.`;
    case 'statSwap': return `Trades its own ${AB_STAT_NAME[f.a]} and ${AB_STAT_NAME[f.b]} on entry.`;
    case 'stageSteal': return 'Takes the foe’s stat boosts for itself on entry.';
    case 'stageClear': return 'Sweeps away the foe’s stat changes on entry.';
    case 'statusSwap': return 'Hands its own status to the foe on entry.';
    case 'healBlock': return 'Foes cannot heal themselves.';
    case 'drainImmune': return 'Foes drain no HP from it.';
    case 'noContact': return 'Its moves never count as contact.';
    case 'sureShot': return 'Its own moves never miss.';
    case 'ignoreEvasion': return 'Ignores everything the foe does to dodge.';
    case 'damageCap': return `No single hit takes more than ${abFrac(f.r)} of its max HP.`;
    case 'critIf': return `Always lands a critical hit ${f.when === 'firstTurn' ? 'on the turn it comes in' : f.when === 'lowHp' ? 'when its HP is a third or less' : 'at full HP'}.`;
    case 'actAsleep': return 'Attacks in its sleep.';
    case 'thawFast': return 'Thaws the moment it acts.';
    case 'faintStatus': return f.s === 'own' ? 'When it faints, its status passes to the foe.' : `When it faints, the foe ${AB_STATUS_VERB[f.s] === 'put to sleep' ? 'is put to sleep' : `is ${AB_STATUS_VERB[f.s]}`}.`;
    case 'faintStat': return `${abStages(f.stats, 'The foe’s')} when it faints.`;
    case 'faintHealParty': return `When it faints, waiting teammates recover ${abFrac(f.r)} of max HP.`;
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

// Batch 3: situational boosts, raw stat leans, priority, immunities, status tricks and a few classics.
defA('ambusher', 'Ambusher', { k: 'firstStrike', m: 1.3 });
defA('counterpuncher', 'Counterpuncher', { k: 'lastStrike', m: 1.3 });
defA('merciless_edge', 'Merciless Edge', { k: 'statusBoost', m: 1.3 });
defA('fresh', 'Fresh', { k: 'fullHpBoost', m: 1.3 });
defA('finisher', 'Finisher', { k: 'foeLowBoost', m: 1.3 });
defA('quickdraw', 'Quickdraw', { k: 'prioBoost', m: 1.3 });
defA('sheer_force', 'Sheer Force', { k: 'sheerForce', m: 1.3 });
defA('tinted_lens', 'Tinted Lens', { k: 'tintedLens', m: 2 });
defA('filter', 'Filter', { k: 'filter', m: 0.75 });
defA('brawn', 'Brawn', { k: 'statMul', stat: 'melee', m: 1.3 });
defA('deadeye', 'Deadeye', { k: 'statMul', stat: 'ranged', m: 1.3 });
defA('insight', 'Insight', { k: 'statMul', stat: 'magic', m: 1.3 });
defA('fleet', 'Fleet', { k: 'statMul', stat: 'spe', m: 1.3 });
defA('thick_coat', 'Thick Coat', { k: 'defMul', stat: 'meleeDef', m: 1.3 });
defA('dense_plate', 'Dense Plate', { k: 'defMul', stat: 'rangedDef', m: 1.3 });
defA('clear_mind', 'Clear Mind', { k: 'defMul', stat: 'magicDef', m: 1.3 });
defA('quick_feet', 'Quick Feet', { k: 'statusStat', stat: 'spe', m: 1.5 });
defA('flare_boost', 'Flare Boost', { k: 'statusStat', stat: 'magic', m: 1.5 });
defA('toxic_boost', 'Toxic Boost', { k: 'statusStat', stat: 'melee', m: 1.5 });
defA('marvel_scale', 'Marvel Scale', { k: 'statusDef', stat: 'meleeDef', m: 1.5 });
defA('fever_ward', 'Fever Ward', { k: 'statusDef', stat: 'magicDef', m: 1.5 });
defA('gale_wings', 'Gale Wings', { k: 'prioType', type: 'Flying', full: true });
defA('shadow_step', 'Shadow Step', { k: 'prioType', type: 'Ghost', full: true });
defA('prankster', 'Prankster', { k: 'prioStatus' });
defA('triage', 'Triage', { k: 'prioHeal' });
defA('quick_draw', 'Quick Draw', { k: 'quickDraw', p: 30 });
defA('early_bird', 'Early Bird', { k: 'earlyBird' });
defA('earplugs', 'Earplugs', { k: 'soundImmune' });
defA('overcoat', 'Overcoat', { k: 'powderImmune' });
defA('armor_tail', 'Armor Tail', { k: 'prioImmune' });
defA('good_as_gold', 'Good as Gold', { k: 'statusMoveImmune' });
defA('purity', 'Purity', { k: 'allStatusImmune' });
defA('shield_dust', 'Shield Dust', { k: 'shieldDust' });
defA('magic_guard', 'Magic Guard', { k: 'magicGuard' });
defA('rock_head', 'Rock Head', { k: 'recoilImmune' });
defA('liquid_ooze', 'Liquid Ooze', { k: 'liquidOoze' });
defA('synchronize', 'Synchronize', { k: 'synchronize' });
defA('pressure', 'Pressure', { k: 'pressure' });
defA('scrappy', 'Scrappy', { k: 'scrappy' });
defA('stench', 'Stench', { k: 'addFlinch', p: 10 });
defA('poison_touch', 'Poison Touch', { k: 'addStatus', s: 'psn', p: 20, contact: true });
defA('scorching_touch', 'Scorching Touch', { k: 'addStatus', s: 'brn', p: 20, contact: true });
defA('static_touch', 'Static Touch', { k: 'addStatus', s: 'par', p: 20, contact: true });
defA('toxic_chain', 'Toxic Chain', { k: 'addStatus', s: 'psn', p: 15 });
defA('chilling_touch', 'Chilling Touch', { k: 'addStatus', s: 'frz', p: 10, contact: true });
defA('big_pecks', 'Big Pecks', { k: 'noStatDrop', stat: 'meleeDef' });
defA('clear_amber', 'Clear Amber', { k: 'noStatDrop', stat: 'magicDef' });
defA('sure_footed', 'Sure-Footed', { k: 'noStatDrop', stat: 'spe' });
defA('defiant', 'Defiant', { k: 'debuffedStat', stats: { melee: 2 } });
defA('competitive', 'Competitive', { k: 'debuffedStat', stats: { magic: 2 } });
defA('steadfast', 'Steadfast', { k: 'flinchStat', stats: { spe: 1 } });
defA('aftermath', 'Aftermath', { k: 'aftermath', r: 1 / 4 });
defA('hustle', 'Hustle', [{ k: 'catBoost', cat: 'melee', m: 1.4 }, { k: 'catAcc', cat: 'melee', m: 0.8 }]);
defA('wide_stance', 'Wide Stance', { k: 'catAcc', cat: 'ranged', m: 1.2 });
defA('focused_mind', 'Focused Mind', { k: 'catAcc', cat: 'magic', m: 1.2 });
defA('vampiric', 'Vampiric', { k: 'fxBoost', fx: 'drain', m: 1.15 });
defA('opportunist', 'Opportunist', { k: 'fxBoost', fx: 'status', m: 1.2 });
defA('bully', 'Bully', { k: 'fxBoost', fx: 'flinch', m: 1.2 });
defA('technician', 'Technician', { k: 'powerBand', max: 45, m: 1.4 });
defA('grand_slam', 'Grand Slam', { k: 'powerBand', min: 120, m: 1.25 });

// Batch 4: paired resists, classic combinations, class-flavoured blends and the last knockout, turn, entry, contact and reaction variants.
defA('amphibious', 'Amphibious', [{ k: 'typeResist', type: 'Water', m: 0.7 }, { k: 'typeResist', type: 'Grass', m: 0.7 }]);
defA('cold_forge', 'Cold Forge', [{ k: 'typeResist', type: 'Fire', m: 0.7 }, { k: 'typeResist', type: 'Ice', m: 0.7 }]);
defA('grounded', 'Grounded', [{ k: 'typeResist', type: 'Electric', m: 0.7 }, { k: 'typeResist', type: 'Ground', m: 0.7 }]);
defA('sky_scales', 'Sky Scales', [{ k: 'typeResist', type: 'Flying', m: 0.7 }, { k: 'typeResist', type: 'Dragon', m: 0.7 }]);
defA('lucid', 'Lucid', [{ k: 'typeResist', type: 'Psychic', m: 0.7 }, { k: 'typeResist', type: 'Ghost', m: 0.7 }]);
defA('gravel_gut', 'Gravel Gut', [{ k: 'typeResist', type: 'Rock', m: 0.7 }, { k: 'typeResist', type: 'Steel', m: 0.7 }]);
defA('bramble_skin', 'Bramble Skin', [{ k: 'typeResist', type: 'Bug', m: 0.7 }, { k: 'typeResist', type: 'Poison', m: 0.7 }]);
defA('twilight_veil', 'Twilight Veil', [{ k: 'typeResist', type: 'Dark', m: 0.7 }, { k: 'typeResist', type: 'Fairy', m: 0.7 }]);
defA('brawlers_hide', "Brawler's Hide", [{ k: 'typeResist', type: 'Fighting', m: 0.7 }, { k: 'typeResist', type: 'Normal', m: 0.7 }]);
defA('slick_scales', 'Slick Scales', [{ k: 'typeResist', type: 'Water', m: 0.7 }, { k: 'typeResist', type: 'Ice', m: 0.7 }]);
defA('dry_skin', 'Dry Skin', [{ k: 'typeAbsorb', type: 'Water', heal: 0.25 }, { k: 'typeWeak', type: 'Fire', m: 1.25 }]);
defA('fluffy', 'Fluffy', [{ k: 'flagResist', flag: 'contact', m: 0.5 }, { k: 'typeWeak', type: 'Fire', m: 2 }]);
defA('water_bubble', 'Water Bubble', [{ k: 'typeBoost', type: 'Water', m: 1.5 }, { k: 'typeResist', type: 'Fire', m: 0.5 }, { k: 'statusImmune', s: 'brn' }]);
defA('punk_rock', 'Punk Rock', [{ k: 'flagBoost', flag: 'sound', m: 1.3 }, { k: 'flagResist', flag: 'sound', m: 0.5 }]);
defA('purifying_salt', 'Purifying Salt', [{ k: 'allStatusImmune' }, { k: 'typeResist', type: 'Ghost', m: 0.5 }]);
defA('steelworker', 'Steelworker', { k: 'typeBoost', type: 'Steel', m: 1.5 });
defA('dragons_maw', "Dragon's Maw", { k: 'typeBoost', type: 'Dragon', m: 1.5 });
defA('transistor', 'Transistor', { k: 'typeBoost', type: 'Electric', m: 1.5 });
defA('rocky_payload', 'Rocky Payload', { k: 'typeBoost', type: 'Rock', m: 1.5 });
defA('shell_home', 'Shell Home', [{ k: 'defMul', stat: 'meleeDef', m: 1.2 }, { k: 'typeResist', type: 'Rock', m: 0.7 }]);
defA('hollow_bones', 'Hollow Bones', [{ k: 'statMul', stat: 'spe', m: 1.2 }, { k: 'typeWeak', type: 'Rock', m: 1.3 }]);
defA('deep_roots', 'Deep Roots', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'typeResist', type: 'Ground', m: 0.6 }]);
defA('cold_blood', 'Cold Blood', [{ k: 'statusImmune', s: 'frz' }, { k: 'typeBoost', type: 'Ice', m: 1.1 }]);
defA('ember_core_skin', 'Cinder Skin', [{ k: 'statusImmune', s: 'brn' }, { k: 'typeBoost', type: 'Fire', m: 1.1 }]);
defA('iron_stomach', 'Iron Stomach', [{ k: 'statusImmune', s: 'psn' }, { k: 'typeBoost', type: 'Poison', m: 1.1 }]);
defA('storm_skin', 'Storm Skin', [{ k: 'statusImmune', s: 'par' }, { k: 'typeBoost', type: 'Electric', m: 1.1 }]);
defA('grave_chill', 'Grave Chill', [{ k: 'contactStatus', s: 'frz', p: 10 }, { k: 'typeResist', type: 'Ice', m: 0.7 }]);
defA('night_eyes', 'Night Eyes', [{ k: 'accBoost', m: 1.1 }, { k: 'evasion', m: 0.9 }]);
defA('bruiser', 'Bruiser', { k: 'powerBand', min: 80, m: 1.15 });
defA('pinpoint', 'Pinpoint', [{ k: 'accBoost', m: 1.15 }, { k: 'critRate', m: 1.5 }]);
defA('glass_cannon', 'Glass Cannon', [{ k: 'statMul', stat: 'melee', m: 1.5 }, { k: 'defMul', stat: 'meleeDef', m: 0.7 }]);
defA('glass_wand', 'Glass Wand', [{ k: 'statMul', stat: 'magic', m: 1.5 }, { k: 'defMul', stat: 'magicDef', m: 0.7 }]);
defA('long_shot', 'Long Shot', [{ k: 'statMul', stat: 'ranged', m: 1.5 }, { k: 'defMul', stat: 'rangedDef', m: 0.7 }]);
defA('chilling_neigh', 'Chilling Neigh', { k: 'koStat', stats: { melee: 1 } });
defA('grim_neigh', 'Grim Neigh', { k: 'koStat', stats: { ranged: 1 } });
defA('trophy_hunter', 'Trophy Hunter', [{ k: 'koHeal', r: 1 / 8 }, { k: 'koStat', stats: { spe: 1 } }]);
defA('regenerating_shell', 'Regenerating Shell', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'defMul', stat: 'rangedDef', m: 1.1 }]);
defA('simmer', 'Simmer', [{ k: 'turnStat', stats: { magic: 1 }, p: 20 }, { k: 'statusImmune', s: 'brn' }]);
defA('limber_up', 'Limber Up', [{ k: 'turnStat', stats: { spe: 1 }, p: 20 }, { k: 'statusImmune', s: 'par' }]);
defA('intimidating_bulk', 'Intimidating Bulk', [{ k: 'entryStat', who: 'foe', stats: { melee: -1 } }, { k: 'entryStat', who: 'self', stats: { meleeDef: 1 } }]);
defA('battle_cry', 'Battle Cry', [{ k: 'entryStat', who: 'self', stats: { melee: 1 } }, { k: 'entryStat', who: 'foe', stats: { magic: -1 } }]);
defA('eerie_calm', 'Eerie Calm', [{ k: 'entryStat', who: 'self', stats: { magicDef: 1 } }, { k: 'entryStat', who: 'foe', stats: { spe: -1 } }]);
defA('sweet_scent', 'Sweet Scent', { k: 'entryStat', who: 'foe', stats: { eva: -1 } });
defA('bright_flash', 'Bright Flash', { k: 'entryStat', who: 'foe', stats: { acc: -1 } });
defA('static_spines', 'Static Spines', [{ k: 'contactStatus', s: 'par', p: 20 }, { k: 'contactHurt', r: 1 / 16 }]);
defA('molten_hide', 'Molten Hide', [{ k: 'contactStatus', s: 'brn', p: 20 }, { k: 'typeResist', type: 'Fire', m: 0.7 }]);
defA('toxic_slime', 'Toxic Slime', [{ k: 'contactStatus', s: 'psn', p: 20 }, { k: 'contactStat', stats: { spe: -1 }, p: 30 }]);
defA('charged_hide', 'Charged Hide', { k: 'hitByTypeStat', type: 'Electric', stats: { spe: 1 } });
defA('sun_drinker', 'Sun Drinker', { k: 'hitByTypeStat', type: 'Fire', stats: { magic: 1 } });
defA('stone_setter', 'Stone Setter', { k: 'hitByTypeStat', type: 'Rock', stats: { meleeDef: 1 } });
defA('wind_reader', 'Wind Reader', { k: 'hitByTypeStat', type: 'Flying', stats: { rangedDef: 1 } });
defA('grudge', 'Grudge', { k: 'hurtStat', cat: 'ranged', stats: { ranged: 1 } });
defA('mirror_nerve', 'Mirror Nerve', { k: 'hurtStat', cat: 'magic', stats: { magicDef: 1 } });
defA('thick_skin', 'Thick Skin', { k: 'allResist', m: 0.9 });
defA('frost_scales', 'Frost Scales', { k: 'catResist', cat: 'magic', m: 0.5 });
defA('bramble_coat', 'Bramble Coat', { k: 'catResist', cat: 'melee', m: 0.6 });
defA('slipstream_hide', 'Slipstream Hide', { k: 'catResist', cat: 'ranged', m: 0.6 });
defA('venom_veins', 'Venom Veins', [{ k: 'addStatus', s: 'psn', p: 10 }, { k: 'typeBoost', type: 'Poison', m: 1.1 }]);
defA('sparking_fists', 'Sparking Fists', [{ k: 'flagBoost', flag: 'punch', m: 1.3 }, { k: 'addStatus', s: 'par', p: 10, contact: true }]);
defA('razor_maw', 'Razor Maw', [{ k: 'flagBoost', flag: 'bite', m: 1.3 }, { k: 'critRate', m: 1.5 }]);
defA('spore_bearer', 'Spore Bearer', [{ k: 'powderImmune' }, { k: 'contactStatus', s: 'slp', p: 10 }]);

// ---- batch five: reading the matchup, and moves that change on the way out ----------------------------
// A hunter for every type: it knows where that kind of creature is soft.
const AB_HUNTER = { Normal: 'Beast Hunter', Fire: 'Flame Douser', Water: 'Tide Breaker', Electric: 'Storm Breaker', Grass: 'Bramble Cutter', Ice: 'Ice Breaker', Fighting: 'Brawl Ender', Poison: 'Vermin Culler', Ground: 'Burrow Hunter', Flying: 'Fowler', Psychic: 'Mind Hunter', Bug: 'Pest Hunter', Rock: 'Stone Splitter', Ghost: 'Ghostbane', Dragon: 'Dragonslayer', Dark: 'Shade Hunter', Steel: 'Rust Bringer', Fairy: 'Fae Hunter' };
for (const t of AB_TYPES) defA(`${t.toLowerCase()}_hunter`, AB_HUNTER[t], { k: 'foeTypeBoost', type: t, m: 1.3 });

defA('cinder_reaper', 'Cinder Reaper', { k: 'foeStatusBoost', s: 'brn', m: 1.4 });
defA('blight_reaper', 'Blight Reaper', { k: 'foeStatusBoost', s: 'psn', m: 1.4 });
defA('spark_reaper', 'Spark Reaper', { k: 'foeStatusBoost', s: 'par', m: 1.4 });
defA('dream_reaper', 'Dream Reaper', { k: 'foeStatusBoost', s: 'slp', m: 1.4 });
defA('rime_reaper', 'Rime Reaper', { k: 'foeStatusBoost', s: 'frz', m: 1.4 });
defA('brawl_reader', 'Brawl Reader', { k: 'foeCatBoost', cat: 'melee', m: 1.25 });
defA('volley_reader', 'Volley Reader', { k: 'foeCatBoost', cat: 'ranged', m: 1.25 });
defA('spell_reader', 'Spell Reader', { k: 'foeCatBoost', cat: 'magic', m: 1.25 });
defA('kindred', 'Kindred', { k: 'stab', m: 0.4 });
defA('heritage', 'Heritage', [{ k: 'stab', m: 0.35 }, { k: 'accBoost', m: 1.1 }]);
defA('zealot', 'Zealot', [{ k: 'stab', m: 0.5 }, { k: 'allResist', m: 1.15 }]);
defA('executioner', 'Executioner', { k: 'effBoost', m: 1.3 });
defA('true_line', 'True Line', { k: 'neutralBoost', m: 1.2 });
defA('overwhelm', 'Overwhelm', [{ k: 'effBoost', m: 1.5 }, { k: 'accBoost', m: 0.9 }]);
defA('lens_grinder', 'Lens Grinder', [{ k: 'tintedLens', m: 1.5 }, { k: 'neutralBoost', m: 1.1 }]);
defA('cornered', 'Cornered', { k: 'lowHpBoost', m: 1.5 });
defA('opening_blow', 'Opening Blow', { k: 'foeFullBoost', m: 1.3 });
defA('cavalry_charge', 'Cavalry Charge', { k: 'firstTurnBoost', m: 1.5 });
defA('last_legion', 'Last Legion', { k: 'lastOneBoost', m: 1.5 });
defA('vengeance', 'Vengeance', { k: 'revengeBoost', m: 1.3 });
defA('drumbeat', 'Drumbeat', { k: 'repeatBoost', m: 1.2 });
defA('repeater', 'Repeater', { k: 'multiExtra' });
defA('big_gulp', 'Big Gulp', { k: 'drainMul', m: 1.5 });
defA('emberform', 'Emberform', { k: 'moveTypeChange', from: 'Normal', to: 'Fire', m: 1.2 });
defA('tideform', 'Tideform', { k: 'moveTypeChange', from: 'Normal', to: 'Water', m: 1.2 });
defA('sparkform', 'Sparkform', { k: 'moveTypeChange', from: 'Normal', to: 'Electric', m: 1.2 });
defA('bloomform', 'Bloomform', { k: 'moveTypeChange', from: 'Normal', to: 'Grass', m: 1.2 });
defA('rimeform', 'Rimeform', { k: 'moveTypeChange', from: 'Normal', to: 'Ice', m: 1.2 });
defA('galeform', 'Galeform', { k: 'moveTypeChange', from: 'Normal', to: 'Flying', m: 1.2 });
defA('faeform', 'Faeform', { k: 'moveTypeChange', from: 'Normal', to: 'Fairy', m: 1.2 });
defA('shadeform', 'Shadeform', { k: 'moveTypeChange', from: 'Normal', to: 'Ghost', m: 1.2 });
defA('ironform', 'Ironform', { k: 'moveTypeChange', from: 'Normal', to: 'Steel', m: 1.2 });
defA('heart_burn', 'Heart Burn', { k: 'hpCostBoost', m: 1.3, r: 1 / 8 });
defA('crash_helmet', 'Crash Helmet', [{ k: 'recoilMul', m: 0.5 }, { k: 'fxBoost', fx: 'recoil', m: 1.2 }]);
defA('slow_burner', 'Slow Burner', [{ k: 'slowStart', m: 0.5, turns: 2 }, { k: 'statMul', stat: 'melee', m: 1.5 }]);
defA('faint_heart', 'Faint Heart', [{ k: 'defeatist', m: 0.5, at: 0.5 }, { k: 'fullHpBoost', m: 1.4 }]);
defA('serene_touch', 'Serene Touch', { k: 'statusChanceMul', m: 2 });
defA('bleeding_edge', 'Bleeding Edge', { k: 'critStatus', s: 'psn', p: 100 });
defA('scorch_edge', 'Scorch Edge', { k: 'critStatus', s: 'brn', p: 50 });
defA('rime_edge', 'Rime Edge', { k: 'critStatus', s: 'frz', p: 50 });
defA('shifter', 'Shifter', { k: 'protean' });
defA('chameleon_skin', 'Chameleon Skin', { k: 'colorChange' });

// ---- batch six: tactics, once-a-battle guards and the passives that reach outside the fight -----------
defA('guard_breaker', 'Guard Breaker', { k: 'moldBreaker' });
defA('bulldozer', 'Bulldozer', [{ k: 'moldBreaker' }, { k: 'catBoost', cat: 'melee', m: 1.1 }]);
defA('spellbreaker', 'Spellbreaker', [{ k: 'moldBreaker' }, { k: 'catBoost', cat: 'magic', m: 1.1 }]);
defA('wall_breaker', 'Wall Breaker', [{ k: 'moldBreaker' }, { k: 'powerBand', min: 100, m: 1.1 }]);
defA('keyhole', 'Keyhole', [{ k: 'moldBreaker' }, { k: 'accBoost', m: 1.1 }]);
defA('plain_sight', 'Plain Sight', { k: 'unaware' });
defA('level_head', 'Level Head', [{ k: 'unaware' }, { k: 'defMul', stat: 'meleeDef', m: 1.15 }]);
defA('even_ground', 'Even Ground', [{ k: 'unaware' }, { k: 'turnCure', p: 30 }]);
defA('mirror_mind', 'Mirror Mind', [{ k: 'unaware' }, { k: 'defMul', stat: 'magicDef', m: 1.15 }]);
defA('topsy', 'Topsy', { k: 'contrary' });
defA('wrong_way', 'Wrong Way', [{ k: 'contrary' }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('upside_down', 'Upside Down', [{ k: 'contrary' }, { k: 'hurtStat', stats: { melee: -1 } }]);
defA('open_book', 'Open Book', { k: 'simple' });
defA('eager_student', 'Eager Student', [{ k: 'simple' }, { k: 'entryStat', who: 'self', stats: { melee: 1 } }]);
defA('beginners_luck', "Beginner's Luck", [{ k: 'simple' }, { k: 'turnStat', stats: { spe: 1 }, p: 20 }]);
defA('downlink', 'Downlink', { k: 'download', n: 1 });
defA('deep_scan', 'Deep Scan', { k: 'download', n: 2 });
defA('sly_scan', 'Sly Scan', [{ k: 'download', n: 1 }, { k: 'accBoost', m: 1.1 }]);
defA('mimicry', 'Mimicry', { k: 'trace' });
defA('copycat', 'Copycat', [{ k: 'trace' }, { k: 'statMul', stat: 'spe', m: 1.05 }]);

defA('costume', 'Costume', { k: 'disguise' });
defA('straw_double', 'Straw Double', [{ k: 'disguise' }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('false_face', 'False Face', [{ k: 'disguise' }, { k: 'evasion', m: 0.9 }]);
defA('sturdy_frame', 'Sturdy Frame', { k: 'endure' });
defA('last_breath', 'Last Breath', [{ k: 'endure' }, { k: 'turnHeal', r: 1 / 16 }]);
defA('crash_test', 'Crash Test', [{ k: 'endure' }, { k: 'recoilImmune' }]);
defA('berry_heart', 'Berry Heart', { k: 'lowHpHeal', r: 1 / 4, at: 0.25 });
defA('deep_reserve', 'Deep Reserve', { k: 'lowHpHeal', r: 1 / 3, at: 0.3 });
defA('iron_reserve', 'Iron Reserve', [{ k: 'lowHpHeal', r: 1 / 4, at: 0.5 }, { k: 'lowHpResist', m: 0.8 }]);
defA('hard_candy', 'Hard Candy', { k: 'lowHpHeal', r: 1 / 2, at: 0.2 });
defA('mirror_cloak', 'Mirror Cloak', { k: 'magicBounce' });
defA('hex_mirror', 'Hex Mirror', [{ k: 'magicBounce' }, { k: 'defMul', stat: 'magicDef', m: 1.1 }]);
defA('bounce_back', 'Bounce Back', [{ k: 'magicBounce' }, { k: 'turnCure', p: 25 }]);
defA('soft_landing', 'Soft Landing', { k: 'firstHitResist', m: 0.5 });
defA('warm_up', 'Warm Up', [{ k: 'firstHitResist', m: 0.5 }, { k: 'slowStart', m: 0.8, turns: 1 }]);
defA('plate_armor', 'Plate Armor', [{ k: 'firstHitResist', m: 0.5 }, { k: 'critShield', m: 0.7 }]);

defA('thick_padding', 'Thick Padding', { k: 'critShield', m: 0.5 });
defA('dense_bone', 'Dense Bone', [{ k: 'critShield', m: 0.7 }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('blunt_scales', 'Blunt Scales', [{ k: 'critShield', m: 0.6 }, { k: 'bandResist', min: 100, m: 0.8 }]);
defA('shock_absorber', 'Shock Absorber', { k: 'bandResist', min: 100, m: 0.7 });
defA('featherweight', 'Featherweight', { k: 'bandResist', max: 60, m: 0.6 });
defA('gap_guard', 'Gap Guard', { k: 'fxResist', fx: 'multi', m: 0.6 });
defA('clotted_hide', 'Clotted Hide', { k: 'fxResist', fx: 'drain', m: 0.6 });
defA('braced', 'Braced', { k: 'fxResist', fx: 'recoil', m: 0.5 });
defA('unshakable', 'Unshakable', [{ k: 'fxResist', fx: 'flinch', m: 0.7 }, { k: 'flinchImmune' }]);
defA('serum_skin', 'Serum Skin', { k: 'fxResist', fx: 'status', m: 0.75 });

defA('treasure_nose', 'Treasure Nose', { k: 'worldGold', m: 1.25 });
defA('coin_hoard', 'Coin Hoard', { k: 'worldGold', m: 1.75 });
defA('toll_keeper', 'Toll Keeper', [{ k: 'worldGold', m: 1.5 }, { k: 'entryStat', who: 'foe', stats: { spe: -1 } }]);
defA('quick_study', 'Quick Study', { k: 'worldXp', m: 1.25 });
defA('prodigy', 'Prodigy', { k: 'worldXp', m: 1.5 });
defA('mentor', 'Mentor', [{ k: 'worldXp', m: 1.5 }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('charmer', 'Charmer', { k: 'worldCatch', m: 1.3 });
defA('beastmaster', 'Beastmaster', { k: 'worldCatch', m: 1.5 });
defA('pied_piper', 'Pied Piper', [{ k: 'worldCatch', m: 1.4 }, { k: 'soundImmune' }]);

defA('grief', 'Grief', { k: 'avengeStat', stats: { melee: 1, ranged: 1 } });
defA('mourning_veil', 'Mourning Veil', { k: 'avengeStat', stats: { magic: 1, magicDef: 1 } });
defA('rally', 'Rally', { k: 'avengeStat', stats: { spe: 2 } });
defA('shieldbearer', 'Shieldbearer', { k: 'avengeStat', stats: { meleeDef: 1, rangedDef: 1 } });
defA('torchbearer', 'Torchbearer', [{ k: 'avengeStat', stats: { magic: 2 } }, { k: 'revengeBoost', m: 1.15 }]);

// ---- batch seven: the armory — what it drinks, what it shrugs off, and what it gives back ------------
defA('slipstream', 'Slipstream', { k: 'typeAbsorb', type: 'Water', stats: { spe: 1 } });
defA('featherbed', 'Featherbed', { k: 'typeAbsorb', type: 'Normal', heal: 1 / 4 });
defA('sparring_partner', 'Sparring Partner', { k: 'typeAbsorb', type: 'Fighting', stats: { melee: 1 } });
defA('mind_sponge', 'Mind Sponge', { k: 'typeAbsorb', type: 'Psychic', stats: { magic: 1 } });
defA('hive_sense', 'Hive Sense', { k: 'typeAbsorb', type: 'Bug', stats: { spe: 1 } });
defA('stone_eater', 'Stone Eater', { k: 'typeAbsorb', type: 'Rock', heal: 1 / 4 });
defA('wyrm_ward', 'Wyrm Ward', { k: 'typeAbsorb', type: 'Dragon', stats: { magicDef: 1 } });
defA('umbral_drinker', 'Umbral Drinker', { k: 'typeAbsorb', type: 'Dark', heal: 1 / 4 });
defA('rust_feeder', 'Rust Feeder', { k: 'typeAbsorb', type: 'Steel', heal: 1 / 4 });
defA('glamour_ward', 'Glamour Ward', { k: 'typeAbsorb', type: 'Fairy', stats: { magicDef: 1 } });

defA('spirit_step', 'Spirit Step', [{ k: 'typeImmune', type: 'Fighting' }, { k: 'typeWeak', type: 'Fairy', m: 1.25 }]);
defA('ash_lungs', 'Ash Lungs', [{ k: 'typeImmune', type: 'Fire' }, { k: 'typeWeak', type: 'Water', m: 1.5 }]);
defA('earthed', 'Earthed', [{ k: 'typeImmune', type: 'Electric' }, { k: 'typeWeak', type: 'Ground', m: 1.5 }]);
defA('sky_born', 'Sky Born', [{ k: 'typeImmune', type: 'Ground' }, { k: 'typeWeak', type: 'Ice', m: 1.5 }]);
defA('dream_shell', 'Dream Shell', [{ k: 'typeImmune', type: 'Psychic' }, { k: 'typeWeak', type: 'Bug', m: 1.5 }]);
defA('iron_lung', 'Iron Lung', [{ k: 'typeImmune', type: 'Poison' }, { k: 'typeWeak', type: 'Fire', m: 1.25 }]);

defA('guard_stance', 'Guard Stance', [{ k: 'catResist', cat: 'melee', m: 0.75 }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('volley_screen', 'Volley Screen', [{ k: 'catResist', cat: 'ranged', m: 0.75 }, { k: 'defMul', stat: 'rangedDef', m: 1.1 }]);
defA('ward_sign', 'Ward Sign', [{ k: 'catResist', cat: 'magic', m: 0.75 }, { k: 'defMul', stat: 'magicDef', m: 1.1 }]);
defA('turtle_up', 'Turtle Up', [{ k: 'catResist', cat: 'melee', m: 0.6 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('arrow_catcher', 'Arrow Catcher', [{ k: 'catResist', cat: 'ranged', m: 0.6 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('hex_eater', 'Hex Eater', [{ k: 'catResist', cat: 'magic', m: 0.6 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);

defA('fireproof_blood', 'Fireproof Blood', [{ k: 'statusImmune', s: 'brn' }, { k: 'typeResist', type: 'Fire', m: 0.75 }]);
defA('clean_veins', 'Clean Veins', [{ k: 'statusImmune', s: 'psn' }, { k: 'turnHeal', r: 1 / 16 }]);
defA('grounded_nerves', 'Grounded Nerves', [{ k: 'statusImmune', s: 'par' }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('insomniac', 'Insomniac', [{ k: 'statusImmune', s: 'slp' }, { k: 'accBoost', m: 1.05 }]);
defA('warm_blood', 'Warm Blood', [{ k: 'statusImmune', s: 'frz' }, { k: 'typeResist', type: 'Ice', m: 0.75 }]);
defA('sealed_body', 'Sealed Body', [{ k: 'allStatusImmune' }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('fever_plate', 'Fever Plate', [{ k: 'statusDef', stat: 'meleeDef', m: 1.5 }, { k: 'turnCure', p: 20 }]);
defA('toxic_patience', 'Toxic Patience', [{ k: 'poisonHeal' }, { k: 'statusDef', stat: 'magicDef', m: 1.3 }]);

defA('steam_vent', 'Steam Vent', { k: 'hitByTypeStat', type: 'Water', stats: { spe: 1 } });
defA('sun_bath', 'Sun Bath', [{ k: 'hitByTypeStat', type: 'Fire', stats: { magic: 1 } }, { k: 'typeResist', type: 'Fire', m: 0.8 }]);
defA('rime_coat', 'Rime Coat', { k: 'hitByTypeStat', type: 'Ice', stats: { meleeDef: 1 } });
defA('live_coat', 'Live Coat', { k: 'hitByTypeStat', type: 'Electric', stats: { spe: 2 } });
defA('rooted_answer', 'Rooted Answer', { k: 'hitByTypeStat', type: 'Grass', stats: { rangedDef: 1 } });
defA('gale_answer', 'Gale Answer', { k: 'hitByTypeStat', type: 'Flying', stats: { spe: 1 } });
defA('bruised_pride', 'Bruised Pride', { k: 'hurtStat', cat: 'melee', stats: { melee: 1, spe: 1 } });
defA('sniped_pride', 'Sniped Pride', { k: 'hurtStat', cat: 'ranged', stats: { ranged: 1, spe: 1 } });
defA('hexed_pride', 'Hexed Pride', { k: 'hurtStat', cat: 'magic', stats: { magic: 1, spe: 1 } });
defA('scar_tissue', 'Scar Tissue', { k: 'critStat', stats: { meleeDef: 2 } });

defA('caltrops', 'Caltrops', [{ k: 'contactHurt', r: 1 / 6 }, { k: 'contactStat', stats: { spe: -1 }, p: 30 }]);
defA('acid_skin', 'Acid Skin', [{ k: 'contactHurt', r: 1 / 8 }, { k: 'contactStatus', s: 'psn', p: 20 }]);
defA('static_coat', 'Static Coat', [{ k: 'contactHurt', r: 1 / 8 }, { k: 'contactStatus', s: 'par', p: 20 }]);
defA('ash_coat', 'Ash Coat', [{ k: 'contactHurt', r: 1 / 8 }, { k: 'contactStatus', s: 'brn', p: 20 }]);
defA('arrow_thorns', 'Arrow Thorns', { k: 'catThorns', cat: 'ranged', r: 1 / 3 });
defA('hex_thorns', 'Hex Thorns', { k: 'catThorns', cat: 'magic', r: 0.25 });
defA('death_cap', 'Death Cap', { k: 'aftermath', r: 0.5 });
defA('bitter_sap', 'Bitter Sap', [{ k: 'liquidOoze' }, { k: 'turnHeal', r: 1 / 16 }]);

defA('heat_haze', 'Heat Haze', [{ k: 'evasion', m: 0.85 }, { k: 'accBoost', m: 1.1 }]);
defA('bodyguard', 'Bodyguard', [{ k: 'prioImmune' }, { k: 'prioBoost', m: 1.2 }]);
defA('overseer', 'Overseer', [{ k: 'pressure' }, { k: 'defMul', stat: 'magicDef', m: 1.1 }]);
defA('dust_cloak', 'Dust Cloak', [{ k: 'shieldDust' }, { k: 'evasion', m: 0.9 }]);
defA('firm_footing', 'Firm Footing', [{ k: 'noStatDrop', stat: 'spe' }, { k: 'noStatDrop', stat: 'meleeDef' }]);
defA('proud_horns', 'Proud Horns', [{ k: 'noStatDrop', stat: 'melee' }, { k: 'debuffedStat', stats: { melee: 1 } }]);
defA('fresh_plate', 'Fresh Plate', [{ k: 'fullHpResist', m: 0.7 }, { k: 'turnHeal', r: 1 / 16 }]);
defA('last_wall', 'Last Wall', [{ k: 'lowHpResist', m: 0.6 }, { k: 'lowHpStat', stats: { meleeDef: 1, rangedDef: 1 }, at: 1 / 3 }]);
defA('prism_scale', 'Prism Scale', [{ k: 'filter', m: 0.7 }, { k: 'tintedLens', m: 1.2 }]);
defA('mirror_polish', 'Mirror Polish', [{ k: 'critImmune' }, { k: 'evasion', m: 0.95 }]);
defA('sealed_vents', 'Sealed Vents', [{ k: 'soundImmune' }, { k: 'powderImmune' }]);
defA('iron_curtain', 'Iron Curtain', [{ k: 'allResist', m: 0.9 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);

// ---- batch eight: field craft — coming in, holding the field, going out, and what touching it costs --
defA('war_drums', 'War Drums', { k: 'entryStat', who: 'self', stats: { melee: 1, spe: 1 } });
defA('battle_hymn', 'Battle Hymn', { k: 'entryStat', who: 'self', stats: { magic: 1, magicDef: 1 } });
defA('standard_bearer', 'Standard Bearer', { k: 'entryStat', who: 'self', stats: { meleeDef: 1, rangedDef: 1, magicDef: 1 } });
defA('dread_gaze', 'Dread Gaze', { k: 'entryStat', who: 'foe', stats: { magic: -1, magicDef: -1 } });
defA('hobble', 'Hobble', { k: 'entryStat', who: 'foe', stats: { spe: -2 } });
defA('dust_veil', 'Dust Veil', [{ k: 'entryStat', who: 'foe', stats: { acc: -1 } }, { k: 'powderImmune' }]);
defA('skulk', 'Skulk', { k: 'entryStat', who: 'self', stats: { eva: 1 } });
defA('herald', 'Herald', [{ k: 'entryStat', who: 'self', stats: { spe: 1 } }, { k: 'entryStat', who: 'foe', stats: { spe: -1 } }]);
defA('loom', 'Loom', [{ k: 'entryStat', who: 'foe', stats: { melee: -1 } }, { k: 'foeFullBoost', m: 1.2 }]);
defA('scout_report', 'Scout Report', [{ k: 'entryStat', who: 'self', stats: { acc: 1 } }, { k: 'accBoost', m: 1.05 }]);
defA('chorus', 'Chorus', [{ k: 'entryStat', who: 'self', stats: { magic: 1 } }, { k: 'soundImmune' }]);
defA('sunroot', 'Sunroot', [{ k: 'turnHeal', r: 1 / 8 }, { k: 'typeResist', type: 'Grass', m: 0.75 }]);

defA('spring_water', 'Spring Water', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'turnCure', p: 15 }]);
defA('nightmare_aura', 'Nightmare Aura', { k: 'turnHurtFoe', r: 1 / 8, statusOnly: true });
defA('withering_aura', 'Withering Aura', [{ k: 'turnHurtFoe', r: 1 / 16 }, { k: 'turnHeal', r: 1 / 16 }]);
defA('grinding_gears', 'Grinding Gears', { k: 'turnStat', stats: { melee: 1 }, p: 25 });
defA('winding_up', 'Winding Up', { k: 'turnStat', stats: { ranged: 1 }, p: 25 });
defA('focusing', 'Focusing', { k: 'turnStat', stats: { magic: 1 }, p: 25 });
defA('shell_set', 'Shell Set', { k: 'turnStat', stats: { meleeDef: 1, rangedDef: 1 }, p: 20 });
defA('quickening', 'Quickening', { k: 'turnStat', stats: { spe: 1 }, p: 30 });
defA('sharpening', 'Sharpening', [{ k: 'turnStat', stats: { acc: 1 }, p: 30 }, { k: 'critRate', m: 1.5 }]);
defA('fading', 'Fading', { k: 'turnStat', stats: { eva: 1 }, p: 25 });
defA('metabolism', 'Metabolism', { k: 'turnCure', p: 40 });

defA('field_dressing', 'Field Dressing', { k: 'switchHeal', r: 1 / 3 });
defA('fresh_air', 'Fresh Air', [{ k: 'switchCure' }, { k: 'switchHeal', r: 1 / 6 }]);
defA('rotation', 'Rotation', [{ k: 'switchHeal', r: 1 / 4 }, { k: 'entryStat', who: 'self', stats: { spe: 1 } }]);
defA('baton', 'Baton', [{ k: 'switchHeal', r: 1 / 8 }, { k: 'turnStat', stats: { spe: 1 }, p: 20 }]);
defA('retreat_drill', 'Retreat Drill', [{ k: 'switchHeal', r: 1 / 2 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('second_breath', 'Second Breath', [{ k: 'switchCure' }, { k: 'turnHeal', r: 1 / 16 }]);
defA('regroup', 'Regroup', [{ k: 'switchHeal', r: 1 / 4 }, { k: 'avengeStat', stats: { meleeDef: 1 } }]);
defA('hand_off', 'Hand-off', [{ k: 'switchHeal', r: 1 / 6 }, { k: 'koHeal', r: 1 / 8 }]);

defA('blood_rush', 'Blood Rush', { k: 'koStat', stats: { melee: 1, spe: 1 } });
defA('soul_harvest', 'Soul Harvest', { k: 'koStat', stats: { magic: 2 } });
defA('trophy_rack', 'Trophy Rack', { k: 'koHeal', r: 1 / 3 });
defA('victors_rest', "Victor's Rest", [{ k: 'koHeal', r: 1 / 4 }, { k: 'koStat', stats: { meleeDef: 1 } }]);
defA('hunters_high', "Hunter's High", { k: 'koStat', stats: { spe: 2 } });
defA('cannibal', 'Cannibal', [{ k: 'koHeal', r: 1 / 2 }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('reapers_toll', "Reaper's Toll", [{ k: 'koStat', stats: { magic: 1 } }, { k: 'turnHurtFoe', r: 1 / 16 }]);
defA('momentum_kill', 'Momentum Kill', { k: 'koStat', stats: { ranged: 1, spe: 1 } });

defA('barbed_coat', 'Barbed Coat', { k: 'contactStat', stats: { melee: -1 }, p: 30 });
defA('slick_coat', 'Slick Coat', { k: 'contactStat', stats: { ranged: -1 }, p: 30 });
defA('hex_coat', 'Hex Coat', { k: 'contactStat', stats: { magic: -1 }, p: 30 });
defA('cracking_shell', 'Cracking Shell', { k: 'contactStat', stats: { meleeDef: -1, rangedDef: -1 }, p: 20 });
defA('numbing_fur', 'Numbing Fur', [{ k: 'contactStatus', s: 'par', p: 30 }, { k: 'contactStat', stats: { spe: -1 }, p: 20 }]);
defA('blistering_hide', 'Blistering Hide', [{ k: 'contactStatus', s: 'brn', p: 30 }, { k: 'contactHurt', r: 1 / 16 }]);
defA('septic_spines', 'Septic Spines', [{ k: 'contactStatus', s: 'psn', p: 30 }, { k: 'contactHurt', r: 1 / 16 }]);
defA('freezing_fur', 'Freezing Fur', [{ k: 'contactStatus', s: 'frz', p: 20 }, { k: 'typeResist', type: 'Ice', m: 0.75 }]);
defA('sleep_coat', 'Sleep Coat', [{ k: 'contactStatus', s: 'slp', p: 15 }, { k: 'powderImmune' }]);
defA('grasping_vines', 'Grasping Vines', { k: 'contactStat', stats: { spe: -2 }, p: 25 });
defA('sticky_sap', 'Sticky Sap', [{ k: 'contactHurt', r: 1 / 8 }, { k: 'contactStat', stats: { spe: -1 }, p: 25 }]);
defA('mirror_barbs', 'Mirror Barbs', { k: 'hurtFoeStat', stats: { melee: -1, ranged: -1 }, p: 25 });

defA('startle', 'Startle', [{ k: 'addFlinch', p: 20 }, { k: 'firstStrike', m: 1.1 }]);
defA('thunderclap', 'Thunderclap', { k: 'addFlinch', p: 30 });
defA('braced_nerves', 'Braced Nerves', { k: 'flinchStat', stats: { meleeDef: 2 } });
defA('adrenaline', 'Adrenaline', { k: 'flinchStat', stats: { melee: 2 } });
defA('fast_hands', 'Fast Hands', [{ k: 'quickDraw', p: 30 }, { k: 'flagBoost', flag: 'punch', m: 1.1 }]);
defA('open_guard', 'Open Guard', [{ k: 'accBoost', m: 1.2 }, { k: 'evasion', m: 1.1 }]);
defA('storm_rider', 'Storm Rider', { k: 'prioType', type: 'Electric' });
defA('deep_breath', 'Deep Breath', [{ k: 'earlyBird' }, { k: 'turnCure', p: 20 }]);

// ---- batch nine: legends of the twelve biomes, class marks, specialists and the grand finishers ------
defA('meadow_king', 'Meadow King', [{ k: 'typeBoost', type: 'Grass', m: 1.2 }, { k: 'turnHeal', r: 1 / 16 }, { k: 'entryStat', who: 'self', stats: { melee: 1 } }]);
defA('dune_walker', 'Dune Walker', [{ k: 'typeResist', type: 'Ground', m: 0.6 }, { k: 'statusImmune', s: 'brn' }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('tundra_heart', 'Tundra Heart', [{ k: 'typeBoost', type: 'Ice', m: 1.2 }, { k: 'statusImmune', s: 'frz' }, { k: 'typeResist', type: 'Ice', m: 0.6 }]);
defA('marsh_lord', 'Marsh Lord', [{ k: 'typeBoost', type: 'Poison', m: 1.2 }, { k: 'poisonHeal' }, { k: 'contactStatus', s: 'psn', p: 20 }]);
defA('peak_warden', 'Peak Warden', [{ k: 'typeBoost', type: 'Rock', m: 1.2 }, { k: 'critShield', m: 0.7 }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('deep_current', 'Deep Current', [{ k: 'typeBoost', type: 'Water', m: 1.2 }, { k: 'switchHeal', r: 1 / 4 }, { k: 'statMul', stat: 'spe', m: 1.05 }]);
defA('emberwake', 'Emberwake', [{ k: 'typeBoost', type: 'Fire', m: 1.2 }, { k: 'contactStatus', s: 'brn', p: 20 }, { k: 'statusImmune', s: 'brn' }]);
defA('storm_crown', 'Storm Crown', [{ k: 'typeBoost', type: 'Electric', m: 1.2 }, { k: 'prioType', type: 'Electric' }, { k: 'statusImmune', s: 'par' }]);
defA('gloomweaver', 'Gloomweaver', [{ k: 'typeBoost', type: 'Ghost', m: 1.2 }, { k: 'evasion', m: 0.9 }, { k: 'turnHurtFoe', r: 1 / 16 }]);
defA('grove_ancient', 'Grove Ancient', [{ k: 'typeResist', type: 'Grass', m: 0.6 }, { k: 'turnHeal', r: 1 / 8 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('skyfather', 'Skyfather', [{ k: 'typeBoost', type: 'Flying', m: 1.2 }, { k: 'typeImmune', type: 'Ground' }, { k: 'statMul', stat: 'spe', m: 1.05 }]);
defA('cave_mother', 'Cave Mother', [{ k: 'typeResist', type: 'Rock', m: 0.6 }, { k: 'contactHurt', r: 1 / 8 }, { k: 'defMul', stat: 'rangedDef', m: 1.15 }]);

defA('alpha_beast', 'Alpha Beast', [{ k: 'statMul', stat: 'melee', m: 1.15 }, { k: 'koStat', stats: { melee: 1 } }, { k: 'entryStat', who: 'foe', stats: { melee: -1 } }]);
defA('coldblood_patience', 'Coldblood Patience', [{ k: 'statusDef', stat: 'meleeDef', m: 1.3 }, { k: 'turnCure', p: 25 }, { k: 'typeResist', type: 'Ice', m: 0.75 }]);
defA('shoal_mind', 'Shoal Mind', [{ k: 'catBoost', cat: 'ranged', m: 1.15 }, { k: 'evasion', m: 0.9 }, { k: 'hitByTypeStat', type: 'Water', stats: { spe: 1 } }]);
defA('wingmaster', 'Wingmaster', [{ k: 'flagBoost', flag: 'contact', m: 1.2 }, { k: 'prioType', type: 'Flying' }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('hive_queen', 'Hive Queen', [{ k: 'addStatus', s: 'psn', p: 20 }, { k: 'turnStat', stats: { ranged: 1 }, p: 20 }, { k: 'powderImmune' }]);
defA('tidepool_mind', 'Tidepool Mind', [{ k: 'catBoost', cat: 'magic', m: 1.15 }, { k: 'statusMoveImmune' }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('bog_chorus', 'Bog Chorus', [{ k: 'flagBoost', flag: 'sound', m: 1.3 }, { k: 'soundImmune' }, { k: 'addFlinch', p: 15 }]);
defA('bloomcaller', 'Bloomcaller', [{ k: 'typeBoost', type: 'Grass', m: 1.15 }, { k: 'turnStat', stats: { magic: 1 }, p: 25 }, { k: 'powderImmune' }]);
defA('ooze_logic', 'Ooze Logic', [{ k: 'allResist', m: 0.85 }, { k: 'contactStat', stats: { spe: -1 }, p: 30 }, { k: 'statMul', stat: 'spe', m: 0.85 }]);
defA('sporeheart', 'Sporeheart', [{ k: 'contactStatus', s: 'slp', p: 20 }, { k: 'powderImmune' }, { k: 'turnHeal', r: 1 / 16 }]);
defA('wyrm_coil', 'Wyrm Coil', [{ k: 'typeBoost', type: 'Dragon', m: 1.2 }, { k: 'bandResist', min: 100, m: 0.85 }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('dracoform', 'Dracoform', [{ k: 'typeBoost', type: 'Dragon', m: 1.15 }, { k: 'stab', m: 0.35 }, { k: 'fullHpBoost', m: 1.2 }]);

defA('blade_sage', 'Blade Sage', [{ k: 'catAcc', cat: 'melee', m: 1.2 }, { k: 'catBoost', cat: 'melee', m: 1.1 }]);
defA('bow_sage', 'Bow Sage', [{ k: 'catAcc', cat: 'ranged', m: 1.2 }, { k: 'catBoost', cat: 'ranged', m: 1.1 }]);
defA('rune_sage', 'Rune Sage', [{ k: 'catAcc', cat: 'magic', m: 1.2 }, { k: 'catBoost', cat: 'magic', m: 1.1 }]);
defA('duelist', 'Duelist', [{ k: 'firstStrike', m: 1.2 }, { k: 'critRate', m: 1.5 }]);
defA('closer', 'Closer', [{ k: 'lastStrike', m: 1.2 }, { k: 'foeLowBoost', m: 1.2 }]);
defA('opener', 'Opener', [{ k: 'firstTurnBoost', m: 1.3 }, { k: 'entryStat', who: 'self', stats: { spe: 1 } }]);
defA('featherhand', 'Featherhand', [{ k: 'powerBand', max: 50, m: 1.3 }, { k: 'quickDraw', p: 20 }]);
defA('sledger', 'Sledger', [{ k: 'powerBand', min: 110, m: 1.2 }, { k: 'accBoost', m: 1.1 }]);
defA('bleeder', 'Bleeder', [{ k: 'fxBoost', fx: 'drain', m: 1.3 }, { k: 'drainMul', m: 1.25 }]);
defA('crasher', 'Crasher', [{ k: 'fxBoost', fx: 'recoil', m: 1.3 }, { k: 'recoilMul', m: 0.75 }]);
defA('swarmer', 'Swarmer', [{ k: 'fxBoost', fx: 'multi', m: 1.2 }, { k: 'multiExtra' }]);
defA('hexer', 'Hexer', [{ k: 'fxBoost', fx: 'status', m: 1.2 }, { k: 'statusChanceMul', m: 1.5 }]);

defA('dragon_nemesis', 'Dragon Nemesis', [{ k: 'foeTypeBoost', type: 'Dragon', m: 1.25 }, { k: 'typeResist', type: 'Dragon', m: 0.7 }]);
defA('ghost_nemesis', 'Ghost Nemesis', [{ k: 'foeTypeBoost', type: 'Ghost', m: 1.25 }, { k: 'typeResist', type: 'Ghost', m: 0.7 }]);
defA('steel_nemesis', 'Steel Nemesis', [{ k: 'foeTypeBoost', type: 'Steel', m: 1.25 }, { k: 'typeResist', type: 'Steel', m: 0.7 }]);
defA('fire_nemesis', 'Fire Nemesis', [{ k: 'foeTypeBoost', type: 'Fire', m: 1.25 }, { k: 'typeResist', type: 'Fire', m: 0.7 }]);
defA('water_nemesis', 'Water Nemesis', [{ k: 'foeTypeBoost', type: 'Water', m: 1.25 }, { k: 'typeResist', type: 'Water', m: 0.7 }]);
defA('dark_nemesis', 'Dark Nemesis', [{ k: 'foeTypeBoost', type: 'Dark', m: 1.25 }, { k: 'typeResist', type: 'Dark', m: 0.7 }]);
defA('fairy_nemesis', 'Fairy Nemesis', [{ k: 'foeTypeBoost', type: 'Fairy', m: 1.25 }, { k: 'typeResist', type: 'Fairy', m: 0.7 }]);
defA('bug_nemesis', 'Bug Nemesis', [{ k: 'foeTypeBoost', type: 'Bug', m: 1.25 }, { k: 'typeResist', type: 'Bug', m: 0.7 }]);

defA('blazing_fists', 'Blazing Fists', { k: 'moveTypeChange', from: 'Fighting', to: 'Fire', m: 1.1 });
defA('frostbite_fists', 'Frostbite Fists', { k: 'moveTypeChange', from: 'Fighting', to: 'Ice', m: 1.1 });
defA('thunder_fists', 'Thunder Fists', { k: 'moveTypeChange', from: 'Fighting', to: 'Electric', m: 1.1 });
defA('venom_bloom', 'Venom Bloom', { k: 'moveTypeChange', from: 'Grass', to: 'Poison', m: 1.1 });
defA('sunflare', 'Sunflare', { k: 'moveTypeChange', from: 'Grass', to: 'Fire', m: 1.1 });
defA('moonwater', 'Moonwater', { k: 'moveTypeChange', from: 'Water', to: 'Fairy', m: 1.1 });

defA('sniffer', 'Sniffer', [{ k: 'worldGold', m: 1.2 }, { k: 'worldXp', m: 1.2 }]);
defA('lure', 'Lure', [{ k: 'worldCatch', m: 1.25 }, { k: 'entryStat', who: 'foe', stats: { spe: -1 } }]);
defA('trainers_pet', "Trainer's Pet", [{ k: 'worldXp', m: 1.3 }, { k: 'koHeal', r: 1 / 8 }]);
defA('tomb_robber', 'Tomb Robber', [{ k: 'worldGold', m: 1.4 }, { k: 'foeTypeBoost', type: 'Ghost', m: 1.2 }]);
defA('beast_whisperer', 'Beast Whisperer', [{ k: 'worldCatch', m: 1.35 }, { k: 'statusMoveImmune' }]);
defA('prospector', 'Prospector', [{ k: 'worldGold', m: 1.3 }, { k: 'typeResist', type: 'Rock', m: 0.8 }]);

defA('titan_heart', 'Titan Heart', [{ k: 'statMul', stat: 'melee', m: 1.2 }, { k: 'statMul', stat: 'spe', m: 0.85 }, { k: 'endure' }]);
defA('phoenix_down', 'Phoenix Down', [{ k: 'lowHpHeal', r: 1 / 2, at: 0.25 }, { k: 'typeResist', type: 'Fire', m: 0.5 }, { k: 'statusImmune', s: 'brn' }]);
defA('void_mantle', 'Void Mantle', [{ k: 'allResist', m: 0.85 }, { k: 'statusMoveImmune' }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('sunrise_aura', 'Sunrise Aura', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'turnStat', stats: { magic: 1 }, p: 20 }, { k: 'typeBoost', type: 'Fire', m: 1.15 }]);
defA('moonshadow', 'Moonshadow', [{ k: 'evasion', m: 0.85 }, { k: 'prioStatus' }, { k: 'statMul', stat: 'magic', m: 1.1 }]);
defA('iron_will', 'Iron Will', [{ k: 'noStatDrop', stat: 'melee' }, { k: 'noStatDrop', stat: 'spe' }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('bloodmoon', 'Bloodmoon', [{ k: 'lowHpBoost', m: 1.4 }, { k: 'drainMul', m: 1.25 }, { k: 'contactHurt', r: 1 / 16 }]);
defA('starcaller', 'Starcaller', [{ k: 'statMul', stat: 'magic', m: 1.2 }, { k: 'magicBounce' }, { k: 'defMul', stat: 'meleeDef', m: 0.9 }]);
defA('world_serpent', 'World Serpent', [{ k: 'stab', m: 0.45 }, { k: 'allResist', m: 0.95 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);

// ---- batch ten: tempo, the bag, the level gap and the team standing behind it ------------------------
defA('slow_burn', 'Slow Burn', { k: 'lateBoost', m: 1.4, from: 5 });
defA('war_of_attrition', 'War of Attrition', [{ k: 'lateBoost', m: 1.25, from: 4 }, { k: 'turnHeal', r: 1 / 16 }]);
defA('blitz', 'Blitz', { k: 'earlyBoost', m: 1.35, until: 3 });
defA('opening_gambit', 'Opening Gambit', [{ k: 'earlyBoost', m: 1.5, until: 2 }, { k: 'lateBoost', m: 0.9, from: 6 }]);
defA('marathon', 'Marathon', [{ k: 'lateBoost', m: 1.2, from: 6 }, { k: 'turnStat', stats: { meleeDef: 1 }, p: 20 }]);
defA('sprinter', 'Sprinter', [{ k: 'earlyBoost', m: 1.3, until: 2 }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('endgame', 'Endgame', { k: 'lateBoost', m: 1.5, from: 8 });
defA('ambush_timer', 'Ambush Timer', [{ k: 'earlyBoost', m: 1.4, until: 1 }, { k: 'firstStrike', m: 1.1 }]);
defA('second_act', 'Second Act', [{ k: 'lateBoost', m: 1.3, from: 5 }, { k: 'switchHeal', r: 1 / 8 }]);
defA('patient_hunter', 'Patient Hunter', [{ k: 'lateBoost', m: 1.25, from: 5 }, { k: 'accBoost', m: 1.1 }]);

defA('charm_bound', 'Charm Bound', { k: 'charmBoost', m: 1.3 });
defA('bare_hands', 'Bare Hands', { k: 'charmless', m: 1.3 });
defA('trinket_love', 'Trinket Love', [{ k: 'charmBoost', m: 1.2 }, { k: 'turnHeal', r: 1 / 16 }]);
defA('unburdened', 'Unburdened', [{ k: 'charmless', m: 1.2 }, { k: 'statMul', stat: 'spe', m: 1.15 }]);
defA('talisman', 'Talisman', [{ k: 'charmBoost', m: 1.15 }, { k: 'defMul', stat: 'magicDef', m: 1.1 }]);
defA('ascetic', 'Ascetic', [{ k: 'charmless', m: 1.25 }, { k: 'turnCure', p: 20 }]);
defA('collector', 'Collector', [{ k: 'charmBoost', m: 1.1 }, { k: 'worldGold', m: 1.2 }]);

defA('giant_slayer', 'Giant Slayer', { k: 'underdogBoost', m: 1.4 });
defA('pack_leader', 'Pack Leader', { k: 'bullyBoost', m: 1.3 });
defA('upstart', 'Upstart', [{ k: 'underdogBoost', m: 1.25 }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('veteran', 'Veteran', [{ k: 'bullyBoost', m: 1.2 }, { k: 'accBoost', m: 1.1 }]);
defA('underdog_heart', 'Underdog Heart', [{ k: 'underdogBoost', m: 1.3 }, { k: 'lowHpResist', m: 0.8 }]);
defA('schoolyard', 'Schoolyard', [{ k: 'bullyBoost', m: 1.25 }, { k: 'addFlinch', p: 15 }]);

defA('formation', 'Formation', { k: 'fullPartyBoost', m: 1.25 });
defA('standard', 'Standard', [{ k: 'fullPartyBoost', m: 1.15 }, { k: 'entryStat', who: 'self', stats: { meleeDef: 1 } }]);
defA('field_medic', 'Field Medic', { k: 'benchHeal', r: 1 / 16 });
defA('chaplain', 'Chaplain', { k: 'benchCure', p: 25 });
defA('quartermaster', 'Quartermaster', [{ k: 'benchHeal', r: 1 / 8 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('nurse_log', 'Nurse Log', [{ k: 'benchHeal', r: 1 / 16 }, { k: 'turnHeal', r: 1 / 16 }]);
defA('herbalist', 'Herbalist', [{ k: 'benchCure', p: 35 }, { k: 'statusImmune', s: 'psn' }]);
defA('last_will', 'Last Will', { k: 'faintHealParty', r: 1 / 4 });
defA('martyr', 'Martyr', [{ k: 'faintHealParty', r: 1 / 3 }, { k: 'defMul', stat: 'meleeDef', m: 0.9 }]);
defA('bequest', 'Bequest', [{ k: 'faintHealParty', r: 1 / 6 }, { k: 'benchCure', p: 20 }]);

defA('efficient', 'Efficient', { k: 'ppSave', p: 20 });
defA('bottomless', 'Bottomless', [{ k: 'ppSave', p: 35 }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('conservationist', 'Conservationist', [{ k: 'ppSave', p: 25 }, { k: 'pressure' }]);
defA('well_rehearsed', 'Well Rehearsed', [{ k: 'ppSave', p: 15 }, { k: 'repeatBoost', m: 1.15 }]);

defA('plague_bearer', 'Plague Bearer', { k: 'faintStatus', s: 'own' });
defA('final_curse', 'Final Curse', { k: 'faintStatus', s: 'psn' });
defA('dying_ember', 'Dying Ember', { k: 'faintStatus', s: 'brn' });
defA('static_death', 'Static Death', { k: 'faintStatus', s: 'par' });
defA('last_laugh', 'Last Laugh', { k: 'faintStat', stats: { melee: -1, ranged: -1 } });
defA('withering_death', 'Withering Death', { k: 'faintStat', stats: { magic: -1, magicDef: -1 } });
defA('collapse', 'Collapse', { k: 'faintStat', stats: { spe: -2 } });
defA('deathgrip', 'Deathgrip', [{ k: 'faintStat', stats: { meleeDef: -1 } }, { k: 'aftermath', r: 1 / 4 }]);

defA('stalwart_clock', 'Stalwart Clock', [{ k: 'lateBoost', m: 1.2, from: 5 }, { k: 'lowHpResist', m: 0.85 }]);
defA('warm_machine', 'Warm Machine', [{ k: 'earlyBoost', m: 0.8, until: 2 }, { k: 'lateBoost', m: 1.4, from: 5 }]);
defA('flash_in_the_pan', 'Flash in the Pan', [{ k: 'earlyBoost', m: 1.5, until: 2 }, { k: 'lateBoost', m: 0.8, from: 5 }]);
defA('steady_drip', 'Steady Drip', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'lateBoost', m: 1.15, from: 4 }]);
defA('battle_rhythm', 'Battle Rhythm', [{ k: 'repeatBoost', m: 1.15 }, { k: 'turnStat', stats: { spe: 1 }, p: 20 }]);
defA('relay_runner', 'Relay Runner', [{ k: 'switchHeal', r: 1 / 4 }, { k: 'earlyBoost', m: 1.2, until: 2 }]);
defA('tag_team', 'Tag Team', [{ k: 'switchHeal', r: 1 / 6 }, { k: 'benchHeal', r: 1 / 16 }]);
defA('anchor', 'Anchor', [{ k: 'fullPartyBoost', m: 1.2 }, { k: 'defMul', stat: 'rangedDef', m: 1.1 }]);
defA('rearguard', 'Rearguard', [{ k: 'benchHeal', r: 1 / 16 }, { k: 'catResist', cat: 'ranged', m: 0.85 }]);
defA('camp_cook', 'Camp Cook', [{ k: 'benchHeal', r: 1 / 8 }, { k: 'worldXp', m: 1.15 }]);
defA('drill_sergeant', 'Drill Sergeant', [{ k: 'benchCure', p: 20 }, { k: 'entryStat', who: 'self', stats: { melee: 1 } }]);
defA('long_campaign', 'Long Campaign', [{ k: 'lateBoost', m: 1.3, from: 6 }, { k: 'benchHeal', r: 1 / 16 }]);

// ---- batch eleven: sleight of hand — trades, thefts, seals and the blows it will not feel ------------
defA('power_trick', 'Power Trick', { k: 'statSwap', a: 'melee', b: 'meleeDef' });
defA('mind_trick', 'Mind Trick', { k: 'statSwap', a: 'magic', b: 'magicDef' });
defA('volley_trick', 'Volley Trick', { k: 'statSwap', a: 'ranged', b: 'rangedDef' });
defA('fleet_trade', 'Fleet Trade', { k: 'statSwap', a: 'spe', b: 'meleeDef' });
defA('brawn_trade', 'Brawn Trade', { k: 'statSwap', a: 'melee', b: 'magic' });
defA('larceny', 'Larceny', { k: 'stageSteal' });
defA('thiefs_eye', "Thief's Eye", [{ k: 'stageSteal' }, { k: 'statMul', stat: 'spe', m: 1.05 }]);
defA('housekeeping', 'Housekeeping', { k: 'stageClear' });
defA('cold_reset', 'Cold Reset', [{ k: 'stageClear' }, { k: 'entryStat', who: 'self', stats: { spe: 1 } }]);
defA('hot_potato', 'Hot Potato', { k: 'statusSwap' });

defA('sealed_well', 'Sealed Well', { k: 'healBlock' });
defA('dry_well', 'Dry Well', [{ k: 'healBlock' }, { k: 'drainImmune' }]);
defA('hollow_blood', 'Hollow Blood', { k: 'drainImmune' });
defA('bitter_blood', 'Bitter Blood', [{ k: 'drainImmune' }, { k: 'contactHurt', r: 1 / 16 }]);
defA('ghost_hands', 'Ghost Hands', { k: 'noContact' });
defA('long_reach', 'Long Reach', [{ k: 'noContact' }, { k: 'flagBoost', flag: 'contact', m: 1.1 }]);
defA('dead_eye', 'Dead Eye', { k: 'sureShot' });
defA('perfect_aim', 'Perfect Aim', [{ k: 'sureShot' }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('clear_sight', 'Clear Sight', { k: 'ignoreEvasion' });
defA('hawk_sight', 'Hawk Sight', [{ k: 'ignoreEvasion' }, { k: 'accBoost', m: 1.1 }]);

defA('padded_soul', 'Padded Soul', { k: 'damageCap', r: 1 / 2 });
defA('iron_cap', 'Iron Cap', [{ k: 'damageCap', r: 0.45 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('bulk_frame', 'Bulk Frame', [{ k: 'damageCap', r: 0.6 }, { k: 'defMul', stat: 'meleeDef', m: 1.1 }]);
defA('first_blood', 'First Blood', { k: 'critIf', when: 'firstTurn' });
defA('desperate_edge', 'Desperate Edge', { k: 'critIf', when: 'lowHp' });
defA('fresh_edge', 'Fresh Edge', { k: 'critIf', when: 'fullHp' });
defA('executioners_eye', "Executioner's Eye", [{ k: 'critIf', when: 'lowHp' }, { k: 'critBoost', m: 1.75 }]);
defA('ambush_edge', 'Ambush Edge', [{ k: 'critIf', when: 'firstTurn' }, { k: 'firstStrike', m: 1.15 }]);
defA('keen_opening', 'Keen Opening', [{ k: 'critIf', when: 'fullHp' }, { k: 'fullHpBoost', m: 1.15 }]);
defA('glass_edge', 'Glass Edge', [{ k: 'critBoost', m: 2 }, { k: 'defMul', stat: 'meleeDef', m: 0.85 }]);

defA('sleepwalker', 'Sleepwalker', { k: 'actAsleep' });
defA('dream_fighter', 'Dream Fighter', [{ k: 'actAsleep' }, { k: 'statusStat', stat: 'melee', m: 1.3 }]);
defA('deep_sleeper', 'Deep Sleeper', [{ k: 'actAsleep' }, { k: 'turnHeal', r: 1 / 16 }]);
defA('quick_thaw', 'Quick Thaw', { k: 'thawFast' });
defA('thaw_blood', 'Thaw Blood', [{ k: 'thawFast' }, { k: 'typeResist', type: 'Ice', m: 0.8 }]);
defA('restless_dream', 'Restless Dream', [{ k: 'actAsleep' }, { k: 'earlyBird' }]);

defA('sickly_gift', 'Sickly Gift', [{ k: 'statusSwap' }, { k: 'turnCure', p: 15 }]);
defA('curse_carrier', 'Curse Carrier', [{ k: 'statusSwap' }, { k: 'faintStatus', s: 'own' }]);
defA('contagion', 'Contagion', [{ k: 'addStatus', s: 'psn', p: 15 }, { k: 'faintStatus', s: 'psn' }]);
defA('blight_aura', 'Blight Aura', [{ k: 'turnHurtFoe', r: 1 / 16, statusOnly: true }, { k: 'addStatus', s: 'psn', p: 15 }]);
defA('feverish', 'Feverish', [{ k: 'statusStat', stat: 'melee', m: 1.4 }, { k: 'turnCure', p: 10 }]);
defA('delirium', 'Delirium', [{ k: 'statusStat', stat: 'magic', m: 1.4 }, { k: 'statusDef', stat: 'magicDef', m: 1.2 }]);
defA('numb_hide', 'Numb Hide', [{ k: 'statusImmune', s: 'par' }, { k: 'contactStatus', s: 'par', p: 25 }]);
defA('cold_sweat', 'Cold Sweat', [{ k: 'statusImmune', s: 'frz' }, { k: 'contactStatus', s: 'frz', p: 15 }]);
defA('ash_blood', 'Ash Blood', [{ k: 'statusImmune', s: 'brn' }, { k: 'contactStatus', s: 'brn', p: 25 }]);
defA('sleepless_watch', 'Sleepless Watch', [{ k: 'statusImmune', s: 'slp' }, { k: 'entryStat', who: 'foe', stats: { acc: -1 } }]);

defA('pickpocket', 'Pickpocket', [{ k: 'worldGold', m: 1.3 }, { k: 'stageSteal' }]);
defA('trap_sense', 'Trap Sense', [{ k: 'ignoreEvasion' }, { k: 'evasion', m: 0.9 }]);
defA('shell_game', 'Shell Game', [{ k: 'damageCap', r: 1 / 2 }, { k: 'evasion', m: 0.9 }]);
defA('feint', 'Feint', [{ k: 'noContact' }, { k: 'addFlinch', p: 15 }]);
defA('phantom_step', 'Phantom Step', [{ k: 'noContact' }, { k: 'typeResist', type: 'Fighting', m: 0.7 }]);
defA('silent_kill', 'Silent Kill', [{ k: 'sureShot' }, { k: 'koStat', stats: { spe: 1 } }]);
defA('cheap_shot', 'Cheap Shot', [{ k: 'bullyBoost', m: 1.2 }, { k: 'addFlinch', p: 20 }]);
defA('stolen_valor', 'Stolen Valor', [{ k: 'stageSteal' }, { k: 'koStat', stats: { melee: 1 } }]);
defA('mercy_rule', 'Mercy Rule', [{ k: 'damageCap', r: 0.45 }, { k: 'lowHpHeal', r: 1 / 4, at: 0.25 }]);
defA('blackout', 'Blackout', { k: 'faintStat', stats: { acc: -2 } });
defA('sabotage', 'Sabotage', [{ k: 'healBlock' }, { k: 'entryStat', who: 'foe', stats: { magic: -1 } }]);
defA('hex_seal', 'Hex Seal', [{ k: 'healBlock' }, { k: 'statusMoveImmune' }]);
defA('numbing_sleep', 'Numbing Sleep', [{ k: 'contactStatus', s: 'slp', p: 20 }, { k: 'actAsleep' }]);
defA('second_sight', 'Second Sight', [{ k: 'ignoreEvasion' }, { k: 'critRate', m: 1.5 }]);

// ---- batch twelve: a full kit for every type — wardens, zealots, banes and more conversions ----------
const AB_WARDEN = { Normal: 'Plain Warden', Fire: 'Flame Warden', Water: 'Wave Warden', Electric: 'Spark Warden', Grass: 'Leaf Warden', Ice: 'Frost Warden', Fighting: 'Fist Warden', Poison: 'Fume Warden', Ground: 'Loam Warden', Flying: 'Gale Warden', Psychic: 'Mind Warden', Bug: 'Hive Warden', Rock: 'Stone Warden', Ghost: 'Grave Warden', Dragon: 'Wyrm Warden', Dark: 'Night Warden', Steel: 'Iron Warden', Fairy: 'Wisp Warden' };
const AB_WARD_STAT = { Normal: 'meleeDef', Fire: 'magicDef', Water: 'rangedDef', Electric: 'spe', Grass: 'rangedDef', Ice: 'meleeDef', Fighting: 'meleeDef', Poison: 'magicDef', Ground: 'meleeDef', Flying: 'spe', Psychic: 'magicDef', Bug: 'rangedDef', Rock: 'meleeDef', Ghost: 'magicDef', Dragon: 'magicDef', Dark: 'rangedDef', Steel: 'meleeDef', Fairy: 'magicDef' };
for (const t of AB_TYPES) defA(`${t.toLowerCase()}_warden`, AB_WARDEN[t], [{ k: 'typeResist', type: t, m: 0.7 }, { k: 'hitByTypeStat', type: t, stats: { [AB_WARD_STAT[t]]: 1 } }]);

// a zealot of one type, and thin-skinned against the type that answers it
const AB_ZEAL = { Normal: 'Plain Zeal', Fire: 'Flame Zeal', Water: 'Wave Zeal', Electric: 'Spark Zeal', Grass: 'Leaf Zeal', Ice: 'Frost Zeal', Fighting: 'Fist Zeal', Poison: 'Fume Zeal', Ground: 'Loam Zeal', Flying: 'Gale Zeal', Psychic: 'Mind Zeal', Bug: 'Hive Zeal', Rock: 'Stone Zeal', Ghost: 'Grave Zeal', Dragon: 'Wyrm Zeal', Dark: 'Night Zeal', Steel: 'Iron Zeal', Fairy: 'Wisp Zeal' };
const AB_ANSWER = { Normal: 'Fighting', Fire: 'Water', Water: 'Electric', Electric: 'Ground', Grass: 'Fire', Ice: 'Fire', Fighting: 'Psychic', Poison: 'Ground', Ground: 'Water', Flying: 'Electric', Psychic: 'Dark', Bug: 'Flying', Rock: 'Water', Ghost: 'Dark', Dragon: 'Fairy', Dark: 'Fighting', Steel: 'Fire', Fairy: 'Poison' };
for (const t of AB_TYPES) defA(`${t.toLowerCase()}_zeal`, AB_ZEAL[t], [{ k: 'typeBoost', type: t, m: 1.25 }, { k: 'typeWeak', type: AB_ANSWER[t], m: 1.2 }]);

// a bane hunts one type and pays for the obsession
const AB_BANE = { Normal: 'Beast Bane', Electric: 'Storm Bane', Grass: 'Bramble Bane', Ice: 'Rime Bane', Fighting: 'Brawler Bane', Poison: 'Venom Bane', Ground: 'Burrow Bane', Flying: 'Sky Bane', Psychic: 'Psion Bane', Rock: 'Boulder Bane' };
for (const t of Object.keys(AB_BANE)) defA(`${t.toLowerCase()}_bane`, AB_BANE[t], [{ k: 'foeTypeBoost', type: t, m: 1.3 }, { k: 'typeWeak', type: t, m: 1.2 }]);
defA('elder_hunter', 'Elder Hunter', [{ k: 'foeTypeBoost', type: 'Ghost', m: 1.15 }, { k: 'foeTypeBoost', type: 'Psychic', m: 1.15 }]);

defA('terraform', 'Terraform', { k: 'moveTypeChange', from: 'Normal', to: 'Ground', m: 1.2 });
defA('miasmaform', 'Miasmaform', { k: 'moveTypeChange', from: 'Normal', to: 'Poison', m: 1.2 });
defA('nightform', 'Nightform', { k: 'moveTypeChange', from: 'Normal', to: 'Dark', m: 1.2 });
defA('swarmform', 'Swarmform', { k: 'moveTypeChange', from: 'Normal', to: 'Bug', m: 1.2 });
defA('psychform', 'Psychform', { k: 'moveTypeChange', from: 'Normal', to: 'Psychic', m: 1.2 });
defA('wyrmform', 'Wyrmform', { k: 'moveTypeChange', from: 'Normal', to: 'Dragon', m: 1.2 });
defA('brawlform', 'Brawlform', { k: 'moveTypeChange', from: 'Normal', to: 'Fighting', m: 1.2 });
defA('stoneform', 'Stoneform', { k: 'moveTypeChange', from: 'Normal', to: 'Rock', m: 1.2 });
defA('drakeflame', 'Drakeflame', { k: 'moveTypeChange', from: 'Fire', to: 'Dragon', m: 1.1 });
defA('freezeflow', 'Freezeflow', { k: 'moveTypeChange', from: 'Water', to: 'Ice', m: 1.1 });
defA('railgun', 'Railgun', { k: 'moveTypeChange', from: 'Electric', to: 'Steel', m: 1.1 });
defA('fae_bloom', 'Fae Bloom', { k: 'moveTypeChange', from: 'Grass', to: 'Fairy', m: 1.1 });

// ---- batch thirteen: marks of the kinds, and the plain leans a builder reaches for -------------------
defA('beast_mark', 'Beast Mark', [{ k: 'statMul', stat: 'melee', m: 1.1 }, { k: 'koStat', stats: { melee: 1 } }, { k: 'contactHurt', r: 1 / 16 }]);
defA('scale_mark', 'Scale Mark', [{ k: 'defMul', stat: 'meleeDef', m: 1.12 }, { k: 'statusImmune', s: 'psn' }, { k: 'thawFast' }]);
defA('fin_mark', 'Fin Mark', [{ k: 'typeBoost', type: 'Water', m: 1.15 }, { k: 'drainMul', m: 1.2 }, { k: 'switchHeal', r: 1 / 8 }]);
defA('wing_mark', 'Wing Mark', [{ k: 'statMul', stat: 'spe', m: 1.1 }, { k: 'prioType', type: 'Flying' }, { k: 'evasion', m: 0.95 }]);
defA('chitin_mark', 'Chitin Mark', [{ k: 'flagResist', flag: 'contact', m: 0.8 }, { k: 'contactStat', stats: { spe: -1 }, p: 20 }, { k: 'powderImmune' }]);
defA('tentacle_mark', 'Tentacle Mark', [{ k: 'catThorns', cat: 'melee', r: 0.2 }, { k: 'drainImmune' }, { k: 'defMul', stat: 'rangedDef', m: 1.1 }]);
defA('spawn_mark', 'Spawn Mark', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'statusImmune', s: 'brn' }, { k: 'benchHeal', r: 1 / 16 }]);
defA('root_mark', 'Root Mark', [{ k: 'turnHeal', r: 1 / 16 }, { k: 'typeResist', type: 'Grass', m: 0.7 }, { k: 'noStatDrop', stat: 'meleeDef' }]);
defA('ooze_mark', 'Ooze Mark', [{ k: 'allResist', m: 0.9 }, { k: 'contactStatus', s: 'psn', p: 20 }, { k: 'damageCap', r: 0.6 }]);
defA('spore_mark', 'Spore Mark', [{ k: 'powderImmune' }, { k: 'contactStatus', s: 'slp', p: 15 }, { k: 'benchCure', p: 20 }]);
defA('coil_mark', 'Coil Mark', [{ k: 'flagBoost', flag: 'bite', m: 1.2 }, { k: 'statusStat', stat: 'melee', m: 1.2 }, { k: 'thawFast' }]);
defA('draconic_mark', 'Draconic Mark', [{ k: 'typeBoost', type: 'Dragon', m: 1.15 }, { k: 'bandResist', min: 100, m: 0.9 }, { k: 'stab', m: 0.3 }]);
defA('bone_mark', 'Bone Mark', [{ k: 'statusImmune', s: 'psn' }, { k: 'critShield', m: 0.6 }, { k: 'faintStat', stats: { melee: -1 } }]);
defA('crystal_mark', 'Crystal Mark', [{ k: 'filter', m: 0.75 }, { k: 'critImmune' }, { k: 'statMul', stat: 'magic', m: 1.05 }]);
defA('nightwing_mark', 'Nightwing Mark', [{ k: 'flagBoost', flag: 'sound', m: 1.2 }, { k: 'soundImmune' }, { k: 'prioBoost', m: 1.1 }]);
defA('myriapod_mark', 'Myriapod Mark', [{ k: 'multiExtra' }, { k: 'fxBoost', fx: 'multi', m: 1.15 }, { k: 'statMul', stat: 'spe', m: 1.05 }]);
defA('fiend_mark', 'Fiend Mark', [{ k: 'typeBoost', type: 'Dark', m: 1.15 }, { k: 'drainMul', m: 1.2 }, { k: 'contactHurt', r: 1 / 16 }]);
defA('spirit_mark', 'Spirit Mark', [{ k: 'evasion', m: 0.9 }, { k: 'magicGuard' }, { k: 'defMul', stat: 'magicDef', m: 1.05 }]);
defA('rust_mark', 'Rust Mark', [{ k: 'typeBoost', type: 'Steel', m: 1.15 }, { k: 'contactStat', stats: { meleeDef: -1 }, p: 25 }, { k: 'typeWeak', type: 'Water', m: 1.2 }]);
defA('blood_mark', 'Blood Mark', [{ k: 'drainMul', m: 1.3 }, { k: 'lowHpBoost', m: 1.2 }, { k: 'hpCostBoost', m: 1.1, r: 1 / 16 }]);
defA('void_mark', 'Void Mark', [{ k: 'typeBoost', type: 'Ghost', m: 1.15 }, { k: 'statusMoveImmune' }, { k: 'damageCap', r: 1 / 2 }]);
defA('moon_mark', 'Moon Mark', [{ k: 'statMul', stat: 'magic', m: 1.1 }, { k: 'turnHeal', r: 1 / 16 }, { k: 'prioStatus' }]);
defA('prism_mark', 'Prism Mark', [{ k: 'tintedLens', m: 1.3 }, { k: 'filter', m: 0.8 }, { k: 'accBoost', m: 1.05 }]);
defA('mist_mark', 'Mist Mark', [{ k: 'evasion', m: 0.85 }, { k: 'ignoreEvasion' }, { k: 'statMul', stat: 'spe', m: 1.05 }]);

defA('sinew', 'Sinew', { k: 'statMul', stat: 'melee', m: 1.2 });
defA('steady_hand', 'Steady Hand', { k: 'statMul', stat: 'ranged', m: 1.2 });
defA('deep_well', 'Deep Well', { k: 'statMul', stat: 'magic', m: 1.2 });
defA('bracer', 'Bracer', { k: 'defMul', stat: 'meleeDef', m: 1.2 });
defA('buckler', 'Buckler', { k: 'defMul', stat: 'rangedDef', m: 1.2 });
defA('aegis', 'Aegis', { k: 'defMul', stat: 'magicDef', m: 1.2 });
defA('fleet_foot', 'Fleet Foot', { k: 'statMul', stat: 'spe', m: 1.2 });

defA('berserker_build', 'Berserker Build', [{ k: 'statMul', stat: 'melee', m: 1.3 }, { k: 'defMul', stat: 'meleeDef', m: 0.85 }]);
defA('sniper_build', 'Sniper Build', [{ k: 'statMul', stat: 'ranged', m: 1.3 }, { k: 'defMul', stat: 'rangedDef', m: 0.85 }]);
defA('mage_build', 'Mage Build', [{ k: 'statMul', stat: 'magic', m: 1.3 }, { k: 'defMul', stat: 'magicDef', m: 0.85 }]);
defA('turtle_build', 'Turtle Build', [{ k: 'defMul', stat: 'meleeDef', m: 1.3 }, { k: 'statMul', stat: 'spe', m: 0.85 }]);
defA('bastion_build', 'Bastion Build', [{ k: 'defMul', stat: 'magicDef', m: 1.3 }, { k: 'statMul', stat: 'melee', m: 0.85 }]);
defA('runner_build', 'Runner Build', [{ k: 'statMul', stat: 'spe', m: 1.3 }, { k: 'defMul', stat: 'meleeDef', m: 0.85 }]);
defA('tank_build', 'Tank Build', [{ k: 'defMul', stat: 'rangedDef', m: 1.3 }, { k: 'statMul', stat: 'ranged', m: 0.85 }]);

defA('sick_speed', 'Sick Speed', [{ k: 'statusStat', stat: 'spe', m: 1.5 }, { k: 'turnCure', p: 10 }]);
defA('sick_guard', 'Sick Guard', { k: 'statusDef', stat: 'rangedDef', m: 1.4 });
defA('sick_mind', 'Sick Mind', [{ k: 'statusStat', stat: 'magic', m: 1.5 }, { k: 'statusDef', stat: 'magicDef', m: 1.1 }]);
defA('plague_bulk', 'Plague Bulk', [{ k: 'statusDef', stat: 'meleeDef', m: 1.4 }, { k: 'poisonHeal' }]);
defA('burning_rage', 'Burning Rage', [{ k: 'statusStat', stat: 'melee', m: 1.3 }, { k: 'statusImmune', s: 'brn' }]);
defA('frozen_focus', 'Frozen Focus', [{ k: 'statusStat', stat: 'magic', m: 1.3 }, { k: 'statusImmune', s: 'frz' }]);

defA('marksman', 'Marksman', { k: 'accBoost', m: 1.15 });
defA('deadshot', 'Deadshot', { k: 'catAcc', cat: 'ranged', m: 1.3 });
defA('cleaver', 'Cleaver', { k: 'critRate', m: 2 });
defA('butcher', 'Butcher', { k: 'critBoost', m: 1.8 });
defA('slippery', 'Slippery', [{ k: 'evasion', m: 0.8 }, { k: 'statMul', stat: 'spe', m: 1.05 }]);
defA('blur', 'Blur', [{ k: 'evasion', m: 0.9 }, { k: 'statMul', stat: 'spe', m: 1.1 }]);
defA('precision_drill', 'Precision Drill', [{ k: 'accBoost', m: 1.1 }, { k: 'critRate', m: 1.25 }]);
defA('killer_instinct', 'Killer Instinct', [{ k: 'critRate', m: 1.5 }, { k: 'critBoost', m: 1.6 }]);

defA('iron_grip', 'Iron Grip', { k: 'flagBoost', flag: 'punch', m: 1.3 });
defA('jaws', 'Jaws', { k: 'flagBoost', flag: 'bite', m: 1.3 });
defA('loudmouth', 'Loudmouth', { k: 'flagBoost', flag: 'sound', m: 1.25 });
defA('duster', 'Duster', { k: 'flagBoost', flag: 'powder', m: 1.3 });
defA('grappler', 'Grappler', [{ k: 'flagBoost', flag: 'contact', m: 1.15 }, { k: 'statMul', stat: 'melee', m: 1.05 }]);
defA('heavy_artillery', 'Heavy Artillery', [{ k: 'powerBand', min: 120, m: 1.3 }, { k: 'accBoost', m: 0.95 }]);
defA('peashooter', 'Peashooter', { k: 'powerBand', max: 40, m: 1.4 });

// ---- batch fourteen: double-edged builds, sovereigns, the journey, and the last of the classics -----
defA('all_in', 'All In', [{ k: 'statMul', stat: 'melee', m: 1.4 }, { k: 'defMul', stat: 'meleeDef', m: 0.7 }, { k: 'defMul', stat: 'rangedDef', m: 0.7 }]);
defA('fragile_genius', 'Fragile Genius', [{ k: 'statMul', stat: 'magic', m: 1.4 }, { k: 'allResist', m: 1.15 }]);
defA('reckless_aim', 'Reckless Aim', [{ k: 'accBoost', m: 1.3 }, { k: 'allResist', m: 1.1 }]);
defA('blood_price', 'Blood Price', { k: 'hpCostBoost', m: 1.4, r: 1 / 6 });
defA('short_fuse', 'Short Fuse', [{ k: 'earlyBoost', m: 1.6, until: 2 }, { k: 'defeatist', m: 0.6, at: 0.5 }]);
defA('overclock', 'Overclock', [{ k: 'statMul', stat: 'spe', m: 1.35 }, { k: 'lowHpResist', m: 1.2 }]);
defA('brittle_bones', 'Brittle Bones', [{ k: 'critBoost', m: 2 }, { k: 'critShield', m: 1.5 }]);
defA('loud_and_proud', 'Loud and Proud', [{ k: 'flagBoost', flag: 'sound', m: 1.4 }, { k: 'typeWeak', type: 'Fighting', m: 1.25 }]);
defA('toxic_gambit', 'Toxic Gambit', [{ k: 'statusStat', stat: 'melee', m: 1.6 }, { k: 'statusDef', stat: 'meleeDef', m: 0.8 }]);
defA('iron_price', 'Iron Price', [{ k: 'defMul', stat: 'meleeDef', m: 1.4 }, { k: 'defMul', stat: 'magicDef', m: 1.4 }, { k: 'statMul', stat: 'spe', m: 0.7 }]);
defA('wild_swing', 'Wild Swing', [{ k: 'critRate', m: 3 }, { k: 'accBoost', m: 0.85 }]);
defA('berserk_rush', 'Berserk Rush', [{ k: 'lowHpBoost', m: 1.6 }, { k: 'lowHpResist', m: 1.2 }]);

defA('worldbreaker', 'Worldbreaker', [{ k: 'moldBreaker' }, { k: 'powerBand', min: 100, m: 1.15 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('kingmaker', 'Kingmaker', [{ k: 'entryStat', who: 'foe', stats: { melee: -1, magic: -1 } }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('eternal_watch', 'Eternal Watch', [{ k: 'turnHeal', r: 1 / 8 }, { k: 'damageCap', r: 1 / 2 }, { k: 'statMul', stat: 'spe', m: 0.85 }]);
defA('storm_herald', 'Storm Herald', [{ k: 'typeBoost', type: 'Electric', m: 1.2 }, { k: 'addStatus', s: 'par', p: 20 }, { k: 'statusImmune', s: 'par' }]);
defA('frost_sovereign', 'Frost Sovereign', [{ k: 'typeBoost', type: 'Ice', m: 1.2 }, { k: 'critStatus', s: 'frz', p: 30 }, { k: 'statusImmune', s: 'frz' }]);
defA('ash_sovereign', 'Ash Sovereign', [{ k: 'typeBoost', type: 'Fire', m: 1.25 }, { k: 'contactStatus', s: 'brn', p: 25 }, { k: 'typeWeak', type: 'Water', m: 1.3 }]);
defA('deep_sovereign', 'Deep Sovereign', [{ k: 'typeBoost', type: 'Water', m: 1.25 }, { k: 'drainMul', m: 1.3 }, { k: 'typeWeak', type: 'Electric', m: 1.3 }]);
defA('verdant_sovereign', 'Verdant Sovereign', [{ k: 'typeBoost', type: 'Grass', m: 1.25 }, { k: 'turnHeal', r: 1 / 8 }, { k: 'typeWeak', type: 'Fire', m: 1.3 }]);
defA('grave_sovereign', 'Grave Sovereign', [{ k: 'typeBoost', type: 'Ghost', m: 1.25 }, { k: 'faintStatus', s: 'own' }, { k: 'evasion', m: 0.9 }]);
defA('iron_sovereign', 'Iron Sovereign', [{ k: 'typeBoost', type: 'Steel', m: 1.25 }, { k: 'critImmune' }, { k: 'statMul', stat: 'spe', m: 0.85 }]);
defA('fae_sovereign', 'Fae Sovereign', [{ k: 'typeBoost', type: 'Fairy', m: 1.25 }, { k: 'magicBounce' }, { k: 'typeWeak', type: 'Poison', m: 1.3 }]);
defA('wyrm_sovereign', 'Wyrm Sovereign', [{ k: 'typeBoost', type: 'Dragon', m: 1.25 }, { k: 'stab', m: 0.4 }, { k: 'typeWeak', type: 'Fairy', m: 1.3 }]);

defA('treasure_hunter', 'Treasure Hunter', [{ k: 'worldGold', m: 1.5 }, { k: 'worldCatch', m: 1.2 }]);
defA('scholars_heir', "Scholar's Heir", [{ k: 'worldXp', m: 1.6 }, { k: 'statMul', stat: 'spe', m: 0.9 }]);
defA('merchant', 'Merchant', [{ k: 'worldGold', m: 1.6 }, { k: 'statMul', stat: 'melee', m: 0.95 }]);
defA('ranger', 'Ranger', [{ k: 'worldCatch', m: 1.6 }, { k: 'statMul', stat: 'spe', m: 0.95 }]);
defA('naturalist', 'Naturalist', [{ k: 'worldCatch', m: 1.3 }, { k: 'worldXp', m: 1.3 }]);
defA('tracker', 'Tracker', [{ k: 'worldCatch', m: 1.3 }, { k: 'accBoost', m: 1.1 }]);
defA('apprentice', 'Apprentice', [{ k: 'worldXp', m: 1.4 }, { k: 'defMul', stat: 'meleeDef', m: 0.95 }]);
defA('fence', 'Fence', [{ k: 'worldGold', m: 1.45 }, { k: 'evasion', m: 0.95 }]);
defA('beast_caller', 'Beast Caller', [{ k: 'worldCatch', m: 1.45 }, { k: 'entryStat', who: 'foe', stats: { spe: -1 } }]);
defA('curator', 'Curator', [{ k: 'worldGold', m: 1.25 }, { k: 'worldXp', m: 1.25 }, { k: 'worldCatch', m: 1.25 }]);

defA('anticipation', 'Anticipation', [{ k: 'entryStat', who: 'self', stats: { eva: 1 } }, { k: 'firstHitResist', m: 0.7 }]);
defA('forewarn', 'Forewarn', [{ k: 'entryStat', who: 'self', stats: { acc: 1 } }, { k: 'ignoreEvasion' }]);
defA('frisk', 'Frisk', [{ k: 'entryStat', who: 'foe', stats: { eva: -1 } }, { k: 'accBoost', m: 1.05 }]);
defA('rivalry', 'Rivalry', [{ k: 'foeCatBoost', cat: 'melee', m: 1.15 }, { k: 'foeCatBoost', cat: 'ranged', m: 1.15 }]);
defA('justified', 'Justified', { k: 'hitByTypeStat', type: 'Dark', stats: { melee: 2 } });
defA('water_veil', 'Water Veil', [{ k: 'statusImmune', s: 'brn' }, { k: 'typeResist', type: 'Fire', m: 0.7 }]);
defA('leaf_guard', 'Leaf Guard', [{ k: 'statusImmune', s: 'slp' }, { k: 'typeResist', type: 'Grass', m: 0.7 }]);
defA('vital_spirit', 'Vital Spirit', [{ k: 'statusImmune', s: 'slp' }, { k: 'addFlinch', p: 15 }]);
defA('own_tempo', 'Own Tempo', [{ k: 'noStatDrop', stat: 'spe' }, { k: 'flinchImmune' }]);
defA('inner_focus', 'Inner Focus', [{ k: 'flinchImmune' }, { k: 'prioImmune' }]);
defA('sturdy_jaw', 'Sturdy Jaw', [{ k: 'flagBoost', flag: 'bite', m: 1.2 }, { k: 'critRate', m: 1.25 }]);
defA('iron_fist', 'Iron Fist', [{ k: 'flagBoost', flag: 'punch', m: 1.2 }, { k: 'critBoost', m: 1.6 }]);
defA('mega_launcher', 'Mega Launcher', [{ k: 'catBoost', cat: 'ranged', m: 1.25 }, { k: 'powerBand', min: 90, m: 1.1 }]);
defA('crushing_bite', 'Crushing Bite', [{ k: 'flagBoost', flag: 'bite', m: 1.25 }, { k: 'addFlinch', p: 10 }]);
defA('sap_sipper', 'Sap Sipper', { k: 'typeAbsorb', type: 'Grass', stats: { melee: 2 } });
defA('motor_drive', 'Motor Drive', { k: 'typeAbsorb', type: 'Electric', stats: { spe: 2 } });
defA('flash_fire', 'Flash Fire', { k: 'typeAbsorb', type: 'Fire', stats: { magic: 1 } });
defA('storm_drain', 'Storm Drain', { k: 'typeAbsorb', type: 'Water', stats: { magic: 1 } });
defA('well_baked', 'Well Baked', { k: 'typeAbsorb', type: 'Fire', stats: { meleeDef: 2 } });
defA('stone_stomach', 'Stone Stomach', { k: 'typeAbsorb', type: 'Ground', stats: { meleeDef: 1 } });
defA('updraft', 'Updraft', { k: 'typeAbsorb', type: 'Flying', stats: { melee: 1 } });
defA('purifying_flame', 'Purifying Flame', { k: 'typeAbsorb', type: 'Fire', heal: 1 / 3 });
defA('poison_feast', 'Poison Feast', { k: 'typeAbsorb', type: 'Poison', stats: { melee: 1 } });
defA('ghost_feast', 'Ghost Feast', { k: 'typeAbsorb', type: 'Ghost', heal: 1 / 3 });
defA('last_word', 'Last Word', [{ k: 'lastOneBoost', m: 1.3 }, { k: 'lastStrike', m: 1.2 }]);
defA('sky_sovereign', 'Sky Sovereign', [{ k: 'typeBoost', type: 'Flying', m: 1.25 }, { k: 'typeImmune', type: 'Ground' }, { k: 'typeWeak', type: 'Electric', m: 1.3 }]);
defA('loam_sovereign', 'Loam Sovereign', [{ k: 'typeBoost', type: 'Ground', m: 1.25 }, { k: 'typeImmune', type: 'Electric' }, { k: 'typeWeak', type: 'Water', m: 1.3 }]);

export const ABILITY_IDS = Object.keys(ABILITIES);
export function getAbility(id) { return ABILITIES[id] || null; }
export function abilityName(id) { const a = ABILITIES[id]; return a ? a.name : 'None'; }
/** The fx entries of a kind on a passive (empty for the hand-implemented ones and unknown ids). */
/** Product of a world-facing passive's multipliers (experience, gold, catch odds); 1 when it has none. */
export function abilityWorldMul(id, kind) { let m = 1; for (const f of abilityFx(id, kind)) m *= f.m; return m; }

export function abilityFx(id, kind) { const a = ABILITIES[id]; return a && a.fx ? a.fx.filter((f) => f.k === kind) : []; }
/** Every data-driven passive. */
export const DATA_ABILITY_IDS = ABILITY_IDS.filter((id) => ABILITIES[id].fx);
