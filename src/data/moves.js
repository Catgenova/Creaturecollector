// Move table. Original names; mechanics follow the classic formula.
// cat: 'melee' | 'ranged' | 'magic' | 'status' (see data/damage.js for the triangle). acc: percent, or null for moves that never miss.
// PP is not authored: ppFor() derives it from power and side effects (see PP_RULE).
// fx entries (p = percent chance, default 100):
//   { k:'status', s:'brn'|'psn'|'par'|'slp'|'frz', p }      inflict a major status on the target
//   { k:'stat', who:'self'|'foe', stats:{melee:1,...}, p }    stage changes (melee, ranged, magic, *Def, spe, acc, eva)
//   { k:'flinch', p }                                         target flinches if it has not moved yet
//   { k:'drain', r }  { k:'recoil', r }  { k:'heal', r }      fractions of damage dealt / max HP
//   { k:'multi', min, max }  { k:'fixed', v:'level' }  { k:'boostIfStatus', m }
// flags: contact, punch, bite, powder, sound.

import { STAT_NAMES } from './damage.js';

/**
 * PP rule: the harder a move hits, or the nastier its side effect, the fewer times it can be used.
 * Damaging moves start from a band by power (multi-hit moves count three hits, fixed-damage moves as 60)
 * and drop one band per strong extra: a status at 30%+ (two bands when guaranteed), a flinch at 30%+, a
 * likely (50%+) foe debuff or self buff, draining, and each point of positive priority.
 * Status moves: sleep or freeze 10, other major statuses 15, healing 10, sharp stat changes (±2, three
 * stats or more, accuracy or evasion) 20, ordinary stat changes 30.
 */
export const PP_RULE = {
  bands: [[40, 35], [50, 30], [60, 25], [70, 20], [90, 15], [100, 10], [Infinity, 5]],
  multiHits: 3, fixedAsPower: 60, strongStatus: 30, strongFlinch: 30, strongStat: 50,
  status: { sleepOrFreeze: 10, major: 15, heal: 10, sharpStat: 20, stat: 30, other: 30 },
};
const sharpStat = (f) => Object.entries(f.stats).some(([k, v]) => Math.abs(v) >= 2 || k === 'acc' || k === 'eva') || Object.keys(f.stats).length >= 3;
export function ppFor(mv) {
  const fx = mv.fx || [];
  const find = (k) => fx.find((f) => f.k === k) || null;
  const status = find('status'), flinch = find('flinch'), stat = find('stat'), heal = find('heal'), drain = find('drain'), multi = find('multi'), fixed = find('fixed');
  const R = PP_RULE;
  if (mv.cat === 'status') {
    if (status) return status.s === 'slp' || status.s === 'frz' ? R.status.sleepOrFreeze : R.status.major;
    if (heal) return R.status.heal;
    if (stat) return sharpStat(stat) ? R.status.sharpStat : R.status.stat;
    return R.status.other;
  }
  const power = fixed ? R.fixedAsPower : multi ? mv.power * R.multiHits : mv.power;
  let band = R.bands.findIndex(([max]) => power <= max);
  let steps = 0;
  if (status && (status.p == null || status.p >= R.strongStatus)) steps += status.p == null || status.p >= 100 ? 2 : 1;
  if (flinch && (flinch.p == null || flinch.p >= R.strongFlinch)) steps += 1;
  if (stat && (stat.p == null || stat.p >= R.strongStat)) {
    const vals = Object.values(stat.stats);
    if ((stat.who === 'foe' && vals.some((v) => v < 0)) || (stat.who === 'self' && vals.some((v) => v > 0))) steps += 1;
  }
  if (drain) steps += 1;
  if (mv.prio > 0) steps += Math.min(2, mv.prio);
  band = Math.min(R.bands.length - 1, band + steps);
  return R.bands[band][1];
}

const STATUS_WORD = { brn: 'burn', psn: 'poison', par: 'paralysis', slp: 'sleep', frz: 'freeze' };
const STATUS_VERB = { brn: 'burns', psn: 'poisons', par: 'paralyzes', slp: 'puts to sleep', frz: 'freezes' };
const STAT_WORD = { ...STAT_NAMES, acc: 'accuracy', eva: 'evasion' };
/** Accuracy as words for cards and sheets. */
export function accuracyText(mv) { return mv.acc == null ? 'never misses' : `${mv.acc}% acc`; }
/** A move's extras in plain words with their odds, one string each: '30% burn', '+1 own Speed', 'hits 2–5×', 'priority +1'. */
export function moveEffects(mv) {
  const out = [];
  const odds = (p) => (p == null || p >= 100 ? '' : `${p}% `);
  for (const f of mv.fx || []) {
    switch (f.k) {
      case 'status': out.push(f.p == null || f.p >= 100 ? STATUS_VERB[f.s] : `${odds(f.p)}${STATUS_WORD[f.s]}`); break;
      case 'flinch': out.push(`${odds(f.p)}flinch`); break;
      case 'stat': {
        const groups = new Map();
        for (const [k, v] of Object.entries(f.stats)) { if (!groups.has(v)) groups.set(v, []); groups.get(v).push(k); }
        for (const [v, keys] of groups) {
          const all = (...ks) => ks.every((k) => keys.includes(k)) && keys.length === ks.length;
          const names = keys.length >= 5 ? 'all stats' : all('melee', 'ranged', 'magic') ? 'all attacks' : all('meleeDef', 'rangedDef', 'magicDef') ? 'all defences' : keys.map((k) => STAT_WORD[k] || k).join(', ');
          out.push(`${odds(f.p)}${v > 0 ? '+' : '−'}${Math.abs(v)} ${f.who === 'self' ? 'own' : 'foe'} ${names}`);
        }
        break;
      }
      case 'drain': out.push(`drains ${Math.round(f.r * 100)}%`); break;
      case 'recoil': out.push(`${Math.round(f.r * 100)}% recoil`); break;
      case 'heal': out.push(`heals ${Math.round(f.r * 100)}% HP`); break;
      case 'multi': out.push(`hits ${f.min}–${f.max}×`); break;
      case 'fixed': out.push('damage = level'); break;
      case 'boostIfStatus': out.push(`×${f.m} vs status`); break;
      default: break;
    }
  }
  if (mv.prio) out.push(`priority ${mv.prio > 0 ? '+' : '−'}${Math.abs(mv.prio)}`);
  if (mv.crit) out.push('high crit');
  return out;
}

const m = (id, name, type, cat, power, acc, extra = {}) => { const mv = { id, name, type, cat, power, acc, pp: 0, prio: 0, crit: 0, flags: [], fx: [], ...extra }; mv.pp = extra.pp || ppFor(mv); return mv; };
const ST = (s, p = 100) => ({ k: 'status', s, p });
const STAT = (who, stats, p = 100) => ({ k: 'stat', who, stats, p });
const FLINCH = (p) => ({ k: 'flinch', p });
const CONTACT = ['contact'];

export const MOVES = [
  // Normal
  m('bump', 'Bump', 'Normal', 'melee', 40, 100, { flags: CONTACT }),
  m('swipe', 'Swipe', 'Normal', 'melee', 40, 100, { flags: CONTACT }),
  m('dash', 'Dash', 'Normal', 'melee', 40, 100, { prio: 1, flags: CONTACT }),
  m('headbonk', 'Headbonk', 'Normal', 'melee', 70, 100, { flags: CONTACT, fx: [FLINCH(30)] }),
  m('belly_flop', 'Belly Flop', 'Normal', 'melee', 85, 100, { flags: CONTACT, fx: [ST('par', 30)] }),
  m('ram', 'Ram', 'Normal', 'melee', 90, 85, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.25 }] }),
  m('reckless_charge', 'Reckless Charge', 'Normal', 'melee', 120, 100, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }] }),
  m('rake', 'Rake', 'Normal', 'melee', 70, 100, { crit: 1, flags: CONTACT }),
  m('flurry', 'Flurry', 'Normal', 'melee', 18, 85, { flags: CONTACT, fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('bellow', 'Bellow', 'Normal', 'ranged', 90, 100, { flags: ['sound'] }),
  m('blur', 'Blur', 'Normal', 'melee', 80, 100, { prio: 2, flags: CONTACT }),
  m('yowl', 'Yowl', 'Normal', 'status', 0, 100, { flags: ['sound'], fx: [STAT('foe', { melee: -1, ranged: -1 })] }),
  m('glare', 'Glare', 'Normal', 'status', 0, 100, { fx: [STAT('foe', { meleeDef: -1, rangedDef: -1 })] }),
  m('brace', 'Brace', 'Normal', 'status', 0, null, { fx: [STAT('self', { meleeDef: 1, rangedDef: 1 })] }),
  m('mend', 'Mend', 'Normal', 'status', 0, null, { fx: [{ k: 'heal', r: 0.5 }] }),
  m('whetting', 'Whetting', 'Normal', 'status', 0, null, { fx: [STAT('self', { melee: 2, ranged: 2 })] }),
  // Fire
  m('cinder', 'Cinder', 'Fire', 'ranged', 40, 100, { fx: [ST('brn', 10)] }),
  m('ember_bite', 'Ember Bite', 'Fire', 'melee', 65, 95, { flags: ['contact', 'bite'], fx: [ST('brn', 10), FLINCH(10)] }),
  m('kindle_rush', 'Kindle Rush', 'Fire', 'melee', 50, 100, { flags: CONTACT, fx: [STAT('self', { spe: 1 })] }),
  m('scorch_fist', 'Scorch Fist', 'Fire', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [ST('brn', 10)] }),
  m('fire_stream', 'Fire Stream', 'Fire', 'ranged', 90, 100, { fx: [ST('brn', 10)] }),
  m('blaze_tackle', 'Blaze Tackle', 'Fire', 'melee', 120, 100, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }, ST('brn', 10)] }),
  m('meltdown', 'Meltdown', 'Fire', 'magic', 130, 90, { fx: [STAT('self', { magic: -2 })] }),
  m('ghostflame', 'Ghostflame', 'Fire', 'status', 0, 85, { fx: [ST('brn')] }),
  // Water
  m('squirt', 'Squirt', 'Water', 'ranged', 40, 100),
  m('ripple', 'Ripple', 'Water', 'magic', 60, 100, { fx: [STAT('foe', { magicDef: -1 }, 20)] }),
  m('jetstream', 'Jetstream', 'Water', 'melee', 40, 100, { prio: 1, flags: CONTACT }),
  m('cascade', 'Cascade', 'Water', 'melee', 80, 100, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('riptide', 'Riptide', 'Water', 'melee', 90, 90, { flags: CONTACT }),
  m('boiling_jet', 'Boiling Jet', 'Water', 'ranged', 80, 100, { fx: [ST('brn', 30)] }),
  m('tidal_wave', 'Tidal Wave', 'Water', 'magic', 90, 100),
  m('geyser', 'Geyser', 'Water', 'ranged', 110, 80),
  // Electric
  m('zap', 'Zap', 'Electric', 'ranged', 40, 100, { fx: [ST('par', 10)] }),
  m('arc_beam', 'Arc Beam', 'Electric', 'magic', 50, 90, { fx: [STAT('self', { magic: 1 }, 70)] }),
  m('static_net', 'Static Net', 'Electric', 'ranged', 55, 95, { fx: [STAT('foe', { spe: -1 })] }),
  m('shock_fist', 'Shock Fist', 'Electric', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [ST('par', 10)] }),
  m('voltage', 'Voltage', 'Electric', 'magic', 90, 100, { fx: [ST('par', 10)] }),
  m('live_wire', 'Live Wire', 'Electric', 'melee', 90, 100, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.25 }] }),
  m('skyfall_bolt', 'Skyfall Bolt', 'Electric', 'ranged', 110, 70, { fx: [ST('par', 30)] }),
  m('numb_pulse', 'Numb Pulse', 'Electric', 'status', 0, 90, { fx: [ST('par')] }),
  // Grass
  m('vine_lash', 'Vine Lash', 'Grass', 'melee', 45, 100, { flags: CONTACT }),
  m('leaf_razor', 'Leaf Razor', 'Grass', 'ranged', 55, 95, { crit: 1 }),
  m('seed_volley', 'Seed Volley', 'Grass', 'ranged', 25, 100, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('sap_drain', 'Sap Drain', 'Grass', 'magic', 75, 100, { fx: [{ k: 'drain', r: 0.5 }] }),
  m('spore_burst', 'Spore Burst', 'Grass', 'ranged', 90, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('blade_leaf', 'Blade Leaf', 'Grass', 'melee', 90, 100, { crit: 1, flags: CONTACT }),
  m('sunlance', 'Sunlance', 'Grass', 'magic', 120, 100),
  m('leaf_tempest', 'Leaf Tempest', 'Grass', 'ranged', 130, 90, { fx: [STAT('self', { magic: -2 })] }),
  m('drowse_dust', 'Drowse Dust', 'Grass', 'status', 0, 75, { flags: ['powder'], fx: [ST('slp')] }),
  m('numb_spores', 'Numb Spores', 'Grass', 'status', 0, 75, { flags: ['powder'], fx: [ST('par')] }),
  m('toxin_dust', 'Toxin Dust', 'Grass', 'status', 0, 75, { flags: ['powder'], fx: [ST('psn')] }),
  m('photosynth', 'Photosynth', 'Grass', 'status', 0, null, { fx: [{ k: 'heal', r: 0.5 }] }),
  // Ice
  m('sleet', 'Sleet', 'Ice', 'ranged', 40, 100, { fx: [ST('frz', 10)] }),
  m('chill_gust', 'Chill Gust', 'Ice', 'magic', 55, 95, { fx: [STAT('foe', { spe: -1 })] }),
  m('icicle_dart', 'Icicle Dart', 'Ice', 'ranged', 40, 100, { prio: 1 }),
  m('frost_fist', 'Frost Fist', 'Ice', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [ST('frz', 10)] }),
  m('glacier_ray', 'Glacier Ray', 'Ice', 'magic', 90, 100, { fx: [ST('frz', 10)] }),
  m('snowslide', 'Snowslide', 'Ice', 'melee', 100, 100, { prio: -4, flags: CONTACT }),
  m('whiteout', 'Whiteout', 'Ice', 'magic', 110, 70, { fx: [ST('frz', 10)] }),
  // Fighting
  m('chop', 'Chop', 'Fighting', 'melee', 50, 100, { crit: 1, flags: CONTACT }),
  m('blitz_punch', 'Blitz Punch', 'Fighting', 'melee', 40, 100, { prio: 1, flags: ['contact', 'punch'] }),
  m('shock_palm', 'Shock Palm', 'Fighting', 'magic', 40, 100, { prio: 1 }),
  m('leg_sweep', 'Leg Sweep', 'Fighting', 'melee', 65, 100, { flags: CONTACT, fx: [STAT('foe', { spe: -1 })] }),
  m('slab_break', 'Slab Break', 'Fighting', 'melee', 75, 100, { flags: CONTACT }),
  m('siphon_fist', 'Siphon Fist', 'Fighting', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [{ k: 'drain', r: 0.5 }] }),
  m('all_out_brawl', 'All-Out Brawl', 'Fighting', 'melee', 120, 100, { flags: CONTACT, fx: [STAT('self', { meleeDef: -1, rangedDef: -1, magicDef: -1 })] }),
  m('overpower', 'Overpower', 'Fighting', 'melee', 120, 100, { flags: CONTACT, fx: [STAT('self', { melee: -1, ranged: -1, meleeDef: -1, rangedDef: -1 })] }),
  m('aura_cannon', 'Aura Cannon', 'Fighting', 'ranged', 120, 70, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('muscle_up', 'Muscle Up', 'Fighting', 'status', 0, null, { fx: [STAT('self', { melee: 1, ranged: 1, meleeDef: 1, rangedDef: 1 })] }),
  // Poison
  m('venom_prick', 'Venom Prick', 'Poison', 'melee', 30, 100, { fx: [ST('psn', 30)] }),
  m('acid_spit', 'Acid Spit', 'Poison', 'ranged', 40, 100, { fx: [STAT('foe', { magicDef: -2 })] }),
  m('venom_slash', 'Venom Slash', 'Poison', 'melee', 70, 100, { crit: 1, flags: CONTACT, fx: [ST('psn', 10)] }),
  m('venom_stab', 'Venom Stab', 'Poison', 'melee', 80, 100, { flags: CONTACT, fx: [ST('psn', 30)] }),
  m('sludge_blast', 'Sludge Blast', 'Poison', 'ranged', 90, 100, { fx: [ST('psn', 30)] }),
  m('sludge_hurl', 'Sludge Hurl', 'Poison', 'ranged', 120, 80, { fx: [ST('psn', 30)] }),
  m('blight', 'Blight', 'Poison', 'status', 0, 90, { fx: [ST('psn')] }),
  m('slime_coat', 'Slime Coat', 'Poison', 'status', 0, null, { fx: [STAT('self', { meleeDef: 2, rangedDef: 2 })] }),
  // Ground
  m('mud_fling', 'Mud Fling', 'Ground', 'ranged', 40, 100, { fx: [STAT('foe', { acc: -1 })] }),
  m('silt_jet', 'Silt Jet', 'Ground', 'ranged', 55, 95, { fx: [STAT('foe', { spe: -1 })] }),
  m('stampede', 'Stampede', 'Ground', 'melee', 60, 100, { fx: [STAT('foe', { spe: -1 })] }),
  m('bone_rattle', 'Bone Rattle', 'Ground', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('fissure_burst', 'Fissure Burst', 'Ground', 'ranged', 90, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('bull_rush', 'Bull Rush', 'Ground', 'melee', 95, 95, { flags: CONTACT }),
  m('tremor', 'Tremor', 'Ground', 'magic', 100, 100),
  m('dust_kick', 'Dust Kick', 'Ground', 'status', 0, 100, { fx: [STAT('foe', { acc: -1 })] }),
  // Flying
  m('gale', 'Gale', 'Flying', 'ranged', 40, 100),
  m('wing_strike', 'Wing Strike', 'Flying', 'melee', 60, 100, { flags: CONTACT }),
  m('sky_strike', 'Sky Strike', 'Flying', 'melee', 60, null, { flags: CONTACT }),
  m('slipstream', 'Slipstream', 'Flying', 'ranged', 60, 95, { crit: 1 }),
  m('wind_cutter', 'Wind Cutter', 'Flying', 'ranged', 75, 95, { fx: [FLINCH(30)] }),
  m('cyclone', 'Cyclone', 'Flying', 'magic', 110, 70),
  m('dive_bomb', 'Dive Bomb', 'Flying', 'melee', 120, 100, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }] }),
  m('preen', 'Preen', 'Flying', 'status', 0, null, { fx: [{ k: 'heal', r: 0.5 }] }),
  // Psychic
  m('mind_jolt', 'Mind Jolt', 'Psychic', 'magic', 50, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('thought_beam', 'Thought Beam', 'Psychic', 'magic', 65, 100, { fx: [STAT('foe', { magic: -1 }, 10)] }),
  m('psi_shock', 'Psi Shock', 'Psychic', 'magic', 80, 100),
  m('mind_ram', 'Mind Ram', 'Psychic', 'melee', 80, 90, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('mind_crush', 'Mind Crush', 'Psychic', 'magic', 90, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('lull', 'Lull', 'Psychic', 'status', 0, 60, { fx: [ST('slp')] }),
  m('meditate', 'Meditate', 'Psychic', 'status', 0, null, { fx: [STAT('self', { magic: 1, magicDef: 1 })] }),
  m('quicken', 'Quicken', 'Psychic', 'status', 0, null, { fx: [STAT('self', { spe: 2 })] }),
  m('blank_mind', 'Blank Mind', 'Psychic', 'status', 0, null, { fx: [STAT('self', { magicDef: 2 })] }),
  // Bug
  m('nibble', 'Nibble', 'Bug', 'melee', 60, 100, { flags: ['contact', 'bite'] }),
  m('needle_volley', 'Needle Volley', 'Bug', 'ranged', 25, 95, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('swarm_buzz', 'Swarm Buzz', 'Bug', 'ranged', 50, 100, { flags: ['sound'], fx: [STAT('foe', { magic: -1 })] }),
  m('scissor_slash', 'Scissor Slash', 'Bug', 'melee', 80, 100, { flags: CONTACT }),
  m('blood_sip', 'Blood Sip', 'Bug', 'melee', 80, 100, { flags: CONTACT, fx: [{ k: 'drain', r: 0.5 }] }),
  m('drone', 'Drone', 'Bug', 'ranged', 90, 100, { flags: ['sound'], fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('great_horn', 'Great Horn', 'Bug', 'melee', 120, 85, { flags: CONTACT }),
  m('web_shot', 'Web Shot', 'Bug', 'status', 0, 95, { fx: [STAT('foe', { spe: -2 })] }),
  // Rock
  m('stone_toss', 'Stone Toss', 'Rock', 'ranged', 50, 90),
  m('stone_trap', 'Stone Trap', 'Rock', 'ranged', 60, 95, { fx: [STAT('foe', { spe: -1 })] }),
  m('primal_surge', 'Primal Surge', 'Rock', 'magic', 60, 100, { fx: [STAT('self', { melee: 1, ranged: 1, meleeDef: 1, rangedDef: 1, magic: 1, magicDef: 1, spe: 1 }, 10)] }),
  m('pebble_barrage', 'Pebble Barrage', 'Rock', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('boulder_fall', 'Boulder Fall', 'Rock', 'ranged', 75, 90, { fx: [FLINCH(30)] }),
  m('gem_gleam', 'Gem Gleam', 'Rock', 'magic', 80, 100),
  m('shard_spire', 'Shard Spire', 'Rock', 'ranged', 100, 80, { crit: 1 }),
  m('smooth_stone', 'Smooth Stone', 'Rock', 'status', 0, null, { fx: [STAT('self', { spe: 2 })] }),
  // Ghost
  m('cold_lick', 'Cold Lick', 'Ghost', 'melee', 30, 100, { flags: CONTACT, fx: [ST('par', 30)] }),
  m('wraith_touch', 'Wraith Touch', 'Ghost', 'magic', 0, 100, { fx: [{ k: 'fixed', v: 'level' }] }),
  m('shade_step', 'Shade Step', 'Ghost', 'melee', 40, 100, { prio: 1, flags: CONTACT }),
  m('curse_bolt', 'Curse Bolt', 'Ghost', 'magic', 65, 100, { fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('phantom_claw', 'Phantom Claw', 'Ghost', 'melee', 70, 100, { crit: 1, flags: CONTACT }),
  m('umbral_orb', 'Umbral Orb', 'Ghost', 'magic', 80, 100, { fx: [STAT('foe', { magicDef: -1 }, 20)] }),
  m('haunt', 'Haunt', 'Ghost', 'status', 0, 100, { fx: [STAT('foe', { magic: -1, magicDef: -1 })] }),
  // Dragon
  m('wyrm_breath', 'Wyrm Breath', 'Dragon', 'ranged', 60, 100, { fx: [ST('par', 30)] }),
  m('wyrm_claw', 'Wyrm Claw', 'Dragon', 'melee', 80, 100, { flags: CONTACT }),
  m('wyrm_pulse', 'Wyrm Pulse', 'Dragon', 'magic', 85, 100),
  m('wyrm_rush', 'Wyrm Rush', 'Dragon', 'melee', 100, 75, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('rampage', 'Rampage', 'Dragon', 'melee', 110, 100, { flags: CONTACT, fx: [STAT('self', { meleeDef: -1, rangedDef: -1 })] }),
  m('comet_roar', 'Comet Roar', 'Dragon', 'magic', 130, 90, { fx: [STAT('self', { magic: -2 })] }),
  m('wyrm_dance', 'Wyrm Dance', 'Dragon', 'status', 0, null, { fx: [STAT('self', { melee: 1, ranged: 1, spe: 1 })] }),
  // Dark
  m('chomp', 'Chomp', 'Dark', 'melee', 60, 100, { flags: ['contact', 'bite'], fx: [FLINCH(30)] }),
  m('blindside', 'Blindside', 'Dark', 'melee', 60, null, { flags: CONTACT }),
  m('cheap_shot', 'Cheap Shot', 'Dark', 'melee', 60, 100, { prio: 1, flags: CONTACT }),
  m('mug', 'Mug', 'Dark', 'melee', 65, 100, { flags: CONTACT }),
  m('dusk_slash', 'Dusk Slash', 'Dark', 'melee', 70, 100, { crit: 1, flags: CONTACT }),
  m('crush_bite', 'Crush Bite', 'Dark', 'melee', 80, 100, { flags: ['contact', 'bite'], fx: [STAT('foe', { meleeDef: -1, rangedDef: -1 }, 20)] }),
  m('dread_pulse', 'Dread Pulse', 'Dark', 'magic', 80, 100, { fx: [FLINCH(20)] }),
  m('sneer', 'Sneer', 'Dark', 'ranged', 55, 95, { flags: ['sound'], fx: [STAT('foe', { magic: -1 })] }),
  m('scheme', 'Scheme', 'Dark', 'status', 0, null, { fx: [STAT('self', { magic: 2 })] }),
  // Steel
  m('iron_claw', 'Iron Claw', 'Steel', 'melee', 50, 95, { flags: CONTACT, fx: [STAT('self', { melee: 1, ranged: 1 }, 10)] }),
  m('bolt_jab', 'Bolt Jab', 'Steel', 'melee', 40, 100, { prio: 1, flags: ['contact', 'punch'] }),
  m('steel_fin', 'Steel Fin', 'Steel', 'melee', 70, 90, { flags: CONTACT, fx: [STAT('self', { meleeDef: 1, rangedDef: 1 }, 10)] }),
  m('steel_ram', 'Steel Ram', 'Steel', 'melee', 80, 100, { flags: CONTACT, fx: [FLINCH(30)] }),
  m('chrome_beam', 'Chrome Beam', 'Steel', 'ranged', 80, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('comet_fist', 'Comet Fist', 'Steel', 'melee', 90, 90, { flags: ['contact', 'punch'], fx: [STAT('self', { melee: 1, ranged: 1 }, 20)] }),
  m('plate_up', 'Plate Up', 'Steel', 'status', 0, null, { fx: [STAT('self', { meleeDef: 2, rangedDef: 2 })] }),
  m('grind_screech', 'Grind Screech', 'Steel', 'status', 0, 85, { flags: ['sound'], fx: [STAT('foe', { magicDef: -2 })] }),
  // Fairy
  m('glitter_gust', 'Glitter Gust', 'Fairy', 'ranged', 40, 100),
  m('sweet_sip', 'Sweet Sip', 'Fairy', 'melee', 50, 100, { flags: CONTACT, fx: [{ k: 'drain', r: 0.75 }] }),
  m('spirit_crack', 'Spirit Crack', 'Fairy', 'melee', 75, 100, { flags: CONTACT, fx: [STAT('foe', { magic: -1 })] }),
  m('dazzle', 'Dazzle', 'Fairy', 'magic', 80, 100),
  m('roughhouse', 'Roughhouse', 'Fairy', 'melee', 90, 90, { flags: CONTACT, fx: [STAT('foe', { melee: -1, ranged: -1 }, 10)] }),
  m('lunar_burst', 'Lunar Burst', 'Fairy', 'magic', 95, 100, { fx: [STAT('foe', { magic: -1 }, 30)] }),
  m('doe_eyes', 'Doe Eyes', 'Fairy', 'status', 0, 100, { fx: [STAT('foe', { melee: -2, ranged: -2 })] }),
  m('moonbathe', 'Moonbathe', 'Fairy', 'status', 0, null, { fx: [{ k: 'heal', r: 0.5 }] }),
  // ---- damage-triangle coverage: every type gets Melee, Ranged and Magic options ----
  m('shout', 'Shout', 'Normal', 'ranged', 45, 100, { flags: ['sound'] }),
  m('echo_burst', 'Echo Burst', 'Normal', 'magic', 75, 100, { flags: ['sound'] }),
  m('flare', 'Flare', 'Fire', 'magic', 45, 100, { fx: [ST('brn', 10)] }),
  m('heat_wave', 'Heat Wave', 'Fire', 'magic', 80, 100, { fx: [ST('brn', 10)] }),
  m('hail_volley', 'Hail Volley', 'Ice', 'ranged', 70, 100, { fx: [ST('frz', 10)] }),
  m('glacier_toss', 'Glacier Toss', 'Ice', 'ranged', 95, 90),
  m('chi_shot', 'Chi Shot', 'Fighting', 'ranged', 45, 100),
  m('ki_wave', 'Ki Wave', 'Fighting', 'magic', 75, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('venom_haze', 'Venom Haze', 'Poison', 'magic', 50, 100, { fx: [ST('psn', 20)] }),
  m('toxic_wave', 'Toxic Wave', 'Poison', 'magic', 85, 100, { fx: [ST('psn', 30)] }),
  m('sand_hex', 'Sand Hex', 'Ground', 'magic', 55, 100, { fx: [STAT('foe', { acc: -1 }, 20)] }),
  m('quake_pulse', 'Quake Pulse', 'Ground', 'magic', 85, 100),
  m('air_whisper', 'Air Whisper', 'Flying', 'magic', 45, 100),
  m('jet_wave', 'Jet Wave', 'Flying', 'magic', 80, 100, { fx: [FLINCH(10)] }),
  m('psi_dart', 'Psi Dart', 'Psychic', 'ranged', 45, 100, { prio: 1 }),
  m('mind_lance', 'Mind Lance', 'Psychic', 'ranged', 85, 100, { crit: 1 }),
  m('hive_hum', 'Hive Hum', 'Bug', 'magic', 55, 100, { flags: ['sound'], fx: [STAT('foe', { magic: -1 }, 10)] }),
  m('pheromone_burst', 'Pheromone Burst', 'Bug', 'magic', 85, 100, { fx: [STAT('foe', { magicDef: -1 }, 10)] }),
  m('rock_smash', 'Rock Smash', 'Rock', 'melee', 60, 100, { flags: CONTACT }),
  m('boulder_bash', 'Boulder Bash', 'Rock', 'melee', 95, 90, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.2 }] }),
  m('soul_dart', 'Soul Dart', 'Ghost', 'ranged', 45, 100, { fx: [STAT('foe', { spe: -1 }, 10)] }),
  m('grave_volley', 'Grave Volley', 'Ghost', 'ranged', 85, 100),
  m('star_breath', 'Star Breath', 'Dragon', 'ranged', 100, 85, { fx: [ST('par', 10)] }),
  m('hex_glare', 'Hex Glare', 'Dark', 'magic', 50, 100, { fx: [STAT('foe', { magic: -1 }, 20)] }),
  m('shadow_shot', 'Shadow Shot', 'Dark', 'ranged', 70, 100),
  m('night_volley', 'Night Volley', 'Dark', 'ranged', 95, 90, { fx: [FLINCH(10)] }),
  m('magnet_pulse', 'Magnet Pulse', 'Steel', 'magic', 55, 100, { fx: [STAT('foe', { spe: -1 }, 20)] }),
  m('steel_resonance', 'Steel Resonance', 'Steel', 'magic', 85, 100, { flags: ['sound'] }),
  m('sparkle_shot', 'Sparkle Shot', 'Fairy', 'ranged', 70, 100),
  m('star_shower', 'Star Shower', 'Fairy', 'ranged', 95, 90),
  m('water_jet', 'Water Jet', 'Water', 'ranged', 65, 100),
  m('maelstrom', 'Maelstrom', 'Water', 'magic', 105, 85, { fx: [STAT('foe', { spe: -1 }, 20)] }),
  m('wave_crash', 'Wave Crash', 'Water', 'melee', 100, 90, { flags: CONTACT }),
  m('plasma_burst', 'Plasma Burst', 'Electric', 'magic', 100, 85, { fx: [ST('par', 20)] }),
  m('quake_stomp', 'Quake Stomp', 'Ground', 'melee', 105, 90, { flags: CONTACT, fx: [STAT('foe', { spe: -1 }, 20)] }),
  m('tempest_shot', 'Tempest Shot', 'Flying', 'ranged', 100, 85),
  m('psystorm', 'Psystorm', 'Psychic', 'magic', 110, 80, { fx: [STAT('foe', { magicDef: -1 }, 20)] }),
  m('chrome_slam', 'Chrome Slam', 'Steel', 'melee', 85, 100, { flags: CONTACT, fx: [STAT('self', { meleeDef: 1, rangedDef: 1 }, 20)] }),
  m('venom_gore', 'Venom Gore', 'Poison', 'melee', 100, 90, { flags: CONTACT, fx: [ST('psn', 30)] }),
  m('inferno_charge', 'Inferno Charge', 'Fire', 'melee', 100, 90, { flags: CONTACT, fx: [ST('brn', 20)] }),
];


/** Used when a battler has no PP left. Typeless, hurts the user. */
export const STRUGGLE = m('struggle', 'Struggle', 'Normal', 'melee', 50, null, { pp: 1, flags: CONTACT, typeless: true, struggle: true });

export const MOVES_BY_ID = new Map(MOVES.map((mv) => [mv.id, mv]));
export function getMove(id) { return id === 'struggle' ? STRUGGLE : MOVES_BY_ID.get(id) || null; }
export function moveFx(mv, kind) { return mv.fx.find((f) => f.k === kind) || null; }
export function isDamaging(mv) { return mv.cat !== 'status'; }

/** Fallback moves any creature can learn, used to pad thin learnsets. */
export const UNIVERSAL_LEARNSET = [[1, 'bump'], [10, 'dash'], [20, 'rake'], [30, 'bellow']];
