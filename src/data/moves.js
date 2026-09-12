// Move table. Original names; mechanics follow the classic formula.
// cat: 'melee' | 'ranged' | 'magic' | 'status' (see data/damage.js for the triangle). acc: percent, or null for moves that never miss.
// PP is not authored: ppFor() derives it from power and side effects (see PP_RULE).
// fx entries (p = percent chance, default 100):
//   { k:'status', s:'brn'|'psn'|'par'|'slp'|'frz', p }      inflict a major status on the target
//   { k:'stat', who:'self'|'foe', stats:{melee:1,...}, p }    stage changes (melee, ranged, magic, *Def, spe, acc, eva)
//   { k:'flinch', p }                                         target flinches if it has not moved yet
//   { k:'drain', r }  { k:'recoil', r }  { k:'heal', r }      fractions of damage dealt / max HP
//   { k:'multi', min, max }  { k:'fixed', v:'level' }  { k:'boostIfStatus', m }
//   { k:'restore', r }   heal the user r of its max HP after a hit     { k:'cure' }      clear the user's own status after a hit
//   { k:'pierce' }       ignore the target's defence boosts (and the user's attack drops), like a critical hit
//   { k:'recharge' }     the user rests the turn after a hit           { k:'cleanse' }   reset the target's stat stages
//   { k:'boostIfLow', m } power ×m at a third HP or less               { k:'boostIfFirst', m } power ×m when the target has not moved yet
//   { k:'weather', w } / { k:'terrain', t } / { k:'clearField' }        set the sky, set the ground, or sweep both away
//   { k:'weatherPower', w, m } / { k:'terrainPower', t, m }             power ×m while that weather holds / on that ground
//   { k:'sureShotIn', w } never misses in that weather                  { k:'weatherType' } the move takes the weather's own type
// flags: contact, punch, bite, powder, sound. `signature: speciesId` marks a rare's own move: learned at 38, never sold.

import { STAT_NAMES } from './damage.js';
import { WEATHER, TERRAIN } from './field.js';

/**
 * PP rule: the harder a move hits, or the nastier its side effect, the fewer times it can be used.
 * Damaging moves start from a band by power (multi-hit moves count three hits, fixed-damage moves as 60)
 * and drop one band per strong extra: a status at 30%+ (two bands when guaranteed), a flinch at 30%+, a
 * likely (50%+) foe debuff or self buff, draining, restoring, piercing, cleansing, a first-mover bonus, and each point of positive priority.
 * Status moves: sleep or freeze 10, other major statuses 15, healing 10, sharp stat changes (±2, three
 * stats or more, accuracy or evasion) 20, ordinary stat changes 30.
 */
export const PP_RULE = {
  bands: [[40, 35], [50, 30], [60, 25], [70, 20], [90, 15], [100, 10], [Infinity, 5]],
  multiHits: 3, fixedAsPower: 60, strongStatus: 30, strongFlinch: 30, strongStat: 50,
  status: { sleepOrFreeze: 10, major: 15, heal: 10, sharpStat: 20, stat: 30, field: 10, other: 30 },
};
const sharpStat = (f) => Object.entries(f.stats).some(([k, v]) => Math.abs(v) >= 2 || k === 'acc' || k === 'eva') || Object.keys(f.stats).length >= 3;
export function ppFor(mv) {
  const fx = mv.fx || [];
  const find = (k) => fx.find((f) => f.k === k) || null;
  const status = find('status'), flinch = find('flinch'), stat = find('stat'), heal = find('heal'), drain = find('drain'), multi = find('multi'), fixed = find('fixed');
  const R = PP_RULE;
  if (mv.cat === 'status') {
    if (fx.some((f) => f.k === 'weather' || f.k === 'terrain' || f.k === 'clearField')) return R.status.field;
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
  for (const k of ['restore', 'pierce', 'cleanse', 'boostIfFirst']) if (find(k)) steps += 1;
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
      case 'restore': out.push(`restores ${Math.round(f.r * 100)}% HP`); break;
      case 'cure': out.push('cures own status'); break;
      case 'pierce': out.push('ignores defence boosts'); break;
      case 'recharge': out.push('rests next turn'); break;
      case 'cleanse': out.push('resets foe stat changes'); break;
      case 'boostIfLow': out.push(`×${f.m} at low HP`); break;
      case 'boostIfFirst': out.push(`×${f.m} moving first`); break;
      case 'weather': out.push(`sets ${WEATHER[f.w].name}`); break;
      case 'terrain': out.push(`sets ${TERRAIN[f.t].name}`); break;
      case 'clearField': out.push('clears the field'); break;
      case 'weatherPower': out.push(`×${f.m} in ${WEATHER[f.w].name}`); break;
      case 'terrainPower': out.push(`×${f.m} on ${TERRAIN[f.t].name}`); break;
      case 'sureShotIn': out.push(`never misses in ${WEATHER[f.w].name}`); break;
      case 'weatherType': out.push('takes the weather’s type'); break;
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
  // ---- signature moves: one per rare species, learned at level 38 and never sold at the Market ----
  m('pebble_hoard_slam', 'Pebble Hoard Slam', 'Dragon', 'melee', 95, 100, { signature: 'drakelet', flags: ['contact'], fx: [STAT('foe', { meleeDef: -1 })] }),
  m('rust_grinder', 'Rust Grinder', 'Steel', 'melee', 90, 100, { signature: 'boltmaw', flags: ['contact', 'bite'], fx: [{ k: 'pierce' }] }),
  m('harbour_coil', 'Harbour Coil', 'Water', 'magic', 95, 100, { signature: 'tidalisk', fx: [STAT('foe', { spe: -1 })] }),
  m('thermal_dive', 'Thermal Dive', 'Flying', 'ranged', 85, 100, { signature: 'wyvernet', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('shadow_fang', 'Shadow Fang', 'Ghost', 'magic', 80, 100, { signature: 'voidviper', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('heat_sight_strike', 'Heat Sight Strike', 'Dark', 'melee', 90, null, { signature: 'bloodrake', flags: ['contact'] }),
  m('lava_wallow', 'Lava Wallow', 'Fire', 'melee', 100, 100, { signature: 'magmasaur', flags: ['contact'], fx: [ST('brn', 20)] }),
  m('frost_mirror', 'Frost Mirror', 'Ice', 'magic', 100, 100, { signature: 'mirrorviper', fx: [ST('frz', 10), STAT('foe', { spe: -1 }, 20)] }),
  m('quill_lightning', 'Quill Lightning', 'Electric', 'ranged', 100, 100, { signature: 'thunderguana', fx: [ST('par', 20)] }),
  m('dusk_answer', 'Dusk Answer', 'Psychic', 'magic', 90, 100, { signature: 'halowl', fx: [{ k: 'cleanse' }] }),
  m('hundred_eyes', 'Hundred Eyes', 'Fairy', 'magic', 90, 95, { signature: 'plumaura', fx: [STAT('foe', { acc: -1 }, 50)] }),
  m('sunwheel', 'Sunwheel', 'Dragon', 'magic', 90, 100, { signature: 'aurodrake', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('silent_hoot', 'Silent Hoot', 'Ghost', 'magic', 90, 100, { signature: 'voidowl', fx: [FLINCH(30)] }),
  m('carrion_dive', 'Carrion Dive', 'Dark', 'melee', 70, 100, { signature: 'bloodkite', prio: 1, flags: ['contact'] }),
  m('rekindle', 'Rekindle', 'Fire', 'magic', 90, 100, { signature: 'phoenixquill', fx: [{ k: 'restore', r: 0.25 }] }),
  m('storm_shadow', 'Storm Shadow', 'Electric', 'ranged', 140, 90, { signature: 'thunderroc', fx: [{ k: 'recharge' }] }),
  m('causeway_lament', 'Causeway Lament', 'Ice', 'magic', 100, 100, { signature: 'gravecrane', fx: [ST('frz', 10), STAT('foe', { spe: -1 }, 20)] }),
  m('noon_roar', 'Noon Roar', 'Fire', 'melee', 85, 100, { signature: 'solmane', flags: ['contact', 'sound'], fx: [STAT('self', { melee: 1 })] }),
  m('unbent_grass', 'Unbent Grass', 'Dragon', 'magic', 90, null, { signature: 'kirinth' }),
  m('room_gap', 'Room Gap', 'Ghost', 'magic', 85, 100, { signature: 'voidlynx', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('unmentioned_maul', 'Unmentioned Maul', 'Fighting', 'melee', 130, 100, { signature: 'bloodmane', flags: ['contact'], fx: [{ k: 'recoil', r: 0.33 }] }),
  m('smoulder_swipe', 'Smoulder Swipe', 'Fire', 'melee', 100, 100, { signature: 'emberclaw', flags: ['contact'], fx: [ST('brn', 20)] }),
  m('northern_veil', 'Northern Veil', 'Ice', 'magic', 85, 100, { signature: 'auroralynx', fx: [STAT('self', { spe: 1 })] }),
  m('furrow_charge', 'Furrow Charge', 'Ground', 'melee', 95, 100, { signature: 'ironboar', flags: ['contact'], fx: [STAT('foe', { meleeDef: -1 })] }),
  m('grudge_current', 'Grudge Current', 'Water', 'magic', 80, 100, { signature: 'hippodrake', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('reflection_bout', 'Reflection Bout', 'Fighting', 'melee', 85, 100, { signature: 'brawlfin', flags: ['contact'], fx: [STAT('self', { melee: 1 })] }),
  m('almost_thought', 'Almost Thought', 'Psychic', 'magic', 90, 95, { signature: 'voidangler', fx: [STAT('foe', { acc: -1 }, 50)] }),
  m('red_water', 'Red Water', 'Dark', 'melee', 90, 100, { signature: 'bloodgill', flags: ['contact', 'bite'], fx: [{ k: 'drain', r: 0.5 }] }),
  m('yearly_surfacing', 'Yearly Surfacing', 'Water', 'magic', 140, 90, { signature: 'leviatide', fx: [{ k: 'recharge' }] }),
  m('thunderhead_fall', 'Thunderhead Fall', 'Electric', 'ranged', 85, 100, { signature: 'stormgill', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('rivet_jaws', 'Rivet Jaws', 'Steel', 'melee', 90, 100, { signature: 'bonepike', flags: ['contact', 'bite'], fx: [{ k: 'pierce' }] }),
  m('spot_count', 'Spot Count', 'Psychic', 'magic', 90, null, { signature: 'oraclebug' }),
  m('window_wings', 'Window Wings', 'Ghost', 'magic', 90, 100, { signature: 'voidmoth', fx: [STAT('foe', { magic: -1 })] }),
  m('enforcer_sting', 'Enforcer Sting', 'Fighting', 'melee', 100, 100, { signature: 'bloodhornet', flags: ['contact'], fx: [ST('psn', 20)] }),
  m('short_prayer', 'Short Prayer', 'Fire', 'melee', 70, 100, { signature: 'infernomantis', prio: 1, flags: ['contact'] }),
  m('meadow_frost', 'Meadow Frost', 'Ice', 'magic', 100, 100, { signature: 'glassmoth', fx: [ST('frz', 10), STAT('foe', { spe: -1 }, 20)] }),
  m('union_pincer', 'Union Pincer', 'Steel', 'melee', 120, 100, { signature: 'ironstag', flags: ['contact'], fx: [STAT('self', { meleeDef: -1, rangedDef: -1, magicDef: -1 })] }),
  m('boiling_punch', 'Boiling Punch', 'Fighting', 'melee', 100, 100, { signature: 'smashrimp', flags: ['contact', 'punch'], fx: [ST('brn', 20)] }),
  m('last_light_bell', 'Last Light Bell', 'Ghost', 'magic', 90, 100, { signature: 'voidjelly', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('wrestle_drink', 'Wrestle Drink', 'Fighting', 'melee', 90, 100, { signature: 'bloodleech', flags: ['contact'], fx: [{ k: 'drain', r: 0.5 }] }),
  m('small_grip', 'Small Grip', 'Water', 'melee', 95, 100, { signature: 'krakenling', flags: ['contact'], fx: [STAT('foe', { spe: -1 })] }),
  m('reef_thought', 'Reef Thought', 'Psychic', 'magic', 120, 100, { signature: 'coralmind', fx: [STAT('self', { magic: -2 })] }),
  m('drowned_lantern', 'Drowned Lantern', 'Electric', 'magic', 100, 100, { signature: 'voltmedusa', fx: [ST('par', 20)] }),
  m('regrow_spit', 'Regrow Spit', 'Dragon', 'ranged', 90, 100, { signature: 'wyrmlotl', fx: [{ k: 'restore', r: 0.25 }] }),
  m('nothing_smile', 'Nothing Smile', 'Ghost', 'magic', 90, 100, { signature: 'voidlotl', fx: [{ k: 'cleanse' }] }),
  m('fen_breaker', 'Fen Breaker', 'Fighting', 'melee', 120, 100, { signature: 'bloodnewt', flags: ['contact'], fx: [STAT('self', { meleeDef: -1, rangedDef: -1, magicDef: -1 })] }),
  m('spa_scald', 'Spa Scald', 'Fire', 'magic', 95, 100, { signature: 'lavalotl', fx: [{ k: 'cure' }] }),
  m('thunder_croak', 'Thunder Croak', 'Electric', 'melee', 100, 100, { signature: 'thunderbull', flags: ['contact', 'punch'], fx: [ST('par', 20)] }),
  m('old_toad_decree', 'Old Toad Decree', 'Grass', 'ranged', 90, 100, { signature: 'marshwarden', fx: [STAT('foe', { ranged: -1 })] }),
  m('pond_dream', 'Pond Dream', 'Psychic', 'magic', 80, 100, { signature: 'dreamlotus', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('root_memory', 'Root Memory', 'Grass', 'magic', 140, 90, { signature: 'wyrmwood', fx: [{ k: 'recharge' }] }),
  m('inward_bloom', 'Inward Bloom', 'Ghost', 'magic', 90, 100, { signature: 'voidbloom', fx: [{ k: 'drain', r: 0.5 }] }),
  m('duel_thorn', 'Duel Thorn', 'Fighting', 'melee', 90, 100, { signature: 'bloodrose', crit: 1, flags: ['contact'] }),
  m('outshine', 'Outshine', 'Fire', 'magic', 90, 100, { signature: 'sunflare', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('slow_century', 'Slow Century', 'Grass', 'melee', 140, 90, { signature: 'ancientoak', flags: ['contact'], fx: [{ k: 'recharge' }] }),
  m('monthly_wish', 'Monthly Wish', 'Fairy', 'magic', 90, 100, { signature: 'moonlily', fx: [{ k: 'restore', r: 0.25 }] }),
  m('ripple_thought', 'Ripple Thought', 'Psychic', 'magic', 90, 100, { signature: 'mindmuck', fx: [STAT('foe', { magic: -1 })] }),
  m('sump_breath', 'Sump Breath', 'Dragon', 'magic', 100, 100, { signature: 'dragoop', fx: [ST('psn', 20)] }),
  m('absence_step', 'Absence Step', 'Ghost', 'magic', 85, 100, { signature: 'voidslime', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('crimson_rush', 'Crimson Rush', 'Dark', 'melee', 70, 100, { signature: 'bloodooze', prio: 1, flags: ['contact'] }),
  m('first_tide', 'First Tide', 'Water', 'magic', 90, 100, { signature: 'primordium', fx: [{ k: 'cleanse' }] }),
  m('jarless_storm', 'Jarless Storm', 'Electric', 'ranged', 100, 100, { signature: 'plasmoid', fx: [ST('par', 20)] }),
  m('worst_mood', 'Worst Mood', 'Poison', 'melee', 100, 100, { signature: 'bilebeast', flags: ['contact', 'bite'], fx: [ST('psn', 20)] }),
  m('unreal_colours', 'Unreal Colours', 'Psychic', 'magic', 90, 95, { signature: 'mindcap', fx: [STAT('foe', { acc: -1 }, 50)] }),
  m('century_spore', 'Century Spore', 'Dragon', 'magic', 80, 100, { signature: 'drakecap', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('memory_gap', 'Memory Gap', 'Ghost', 'magic', 90, 100, { signature: 'voidcap', fx: [{ k: 'cleanse' }] }),
  m('faster_warning', 'Faster Warning', 'Fighting', 'melee', 70, 100, { signature: 'bloodmorel', prio: 1, flags: ['contact'] }),
  m('litter_dominion', 'Litter Dominion', 'Grass', 'magic', 90, 100, { signature: 'sporelord', fx: [{ k: 'drain', r: 0.5 }] }),
  m('cold_blue_light', 'Cold Blue Light', 'Electric', 'ranged', 95, 100, { signature: 'glowshroom', fx: [STAT('foe', { spe: -1 })] }),
  m('granite_cap_drop', 'Granite Cap Drop', 'Rock', 'melee', 140, 90, { signature: 'stonecap', flags: ['contact'], fx: [{ k: 'recharge' }] }),
  m('empty_hoard', 'Empty Hoard', 'Ghost', 'magic', 90, 100, { signature: 'gloomwyrm', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('hidden_pearl', 'Hidden Pearl', 'Fairy', 'magic', 90, 100, { signature: 'pearlwyrm', fx: [{ k: 'restore', r: 0.25 }] }),
  m('nine_hundred_years', 'Nine Hundred Years', 'Psychic', 'magic', 140, 90, { signature: 'sagecoil', fx: [{ k: 'recharge' }] }),
  m('star_gap', 'Star Gap', 'Ghost', 'magic', 90, 100, { signature: 'voidwyrm', fx: [{ k: 'pierce' }] }),
  m('quiet_gorge', 'Quiet Gorge', 'Dark', 'melee', 85, 100, { signature: 'bloodwyrm', flags: ['contact'], fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('noon_crossing', 'Noon Crossing', 'Fire', 'magic', 100, 100, { signature: 'sunwyrm', fx: [ST('brn', 20)] }),
  m('freeze_and_thaw', 'Freeze and Thaw', 'Ice', 'ranged', 100, 100, { signature: 'tidalcoil', fx: [ST('frz', 10), STAT('foe', { spe: -1 }, 20)] }),
  m('inside_stars', 'Inside Stars', 'Psychic', 'magic', 90, null, { signature: 'starcoil' }),
  m('sleep_hum', 'Sleep Hum', 'Fairy', 'magic', 90, 100, { signature: 'lightdrake', flags: ['sound'], fx: [{ k: 'restore', r: 0.25 }] }),
  m('unslain_breath', 'Unslain Breath', 'Ghost', 'magic', 80, 100, { signature: 'wraithdrake', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('eldest_word', 'Eldest Word', 'Dragon', 'magic', 90, 100, { signature: 'eldrake', flags: ['sound'], fx: [STAT('foe', { magic: -1 })] }),
  m('colourless_breath', 'Colourless Breath', 'Ghost', 'magic', 120, 100, { signature: 'voiddrake', fx: [STAT('self', { magic: -2 })] }),
  m('second_try', 'Second Try', 'Fighting', 'melee', 90, null, { signature: 'blooddrake', flags: ['contact'] }),
  m('snowline_furnace', 'Snowline Furnace', 'Fire', 'magic', 140, 90, { signature: 'infernodrake', fx: [{ k: 'recharge' }] }),
  m('cloud_argument', 'Cloud Argument', 'Electric', 'ranged', 90, 100, { signature: 'tempestdrake', fx: [FLINCH(30)] }),
  m('bell_scale_slam', 'Bell Scale Slam', 'Steel', 'melee', 120, 100, { signature: 'titandrake', flags: ['contact'], fx: [STAT('self', { meleeDef: -1, rangedDef: -1, magicDef: -1 })] }),
  m('half_thought', 'Half Thought', 'Psychic', 'magic', 85, 100, { signature: 'wispbone', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('barrow_waking', 'Barrow Waking', 'Dragon', 'magic', 90, 100, { signature: 'dreadrake', fx: [FLINCH(30)] }),
  m('marrow_reader', 'Marrow Reader', 'Ghost', 'magic', 90, 100, { signature: 'voidmarrow', fx: [STAT('foe', { magic: -1 })] }),
  m('dry_bone_haymaker', 'Dry Bone Haymaker', 'Fighting', 'melee', 130, 100, { signature: 'bloodmarrow', flags: ['contact', 'punch'], fx: [{ k: 'recoil', r: 0.33 }] }),
  m('iron_crown_kneel', 'Iron Crown Kneel', 'Steel', 'melee', 95, 100, { signature: 'ossarch', flags: ['contact'], fx: [STAT('foe', { meleeDef: -1 })] }),
  m('planned_pyre', 'Planned Pyre', 'Fire', 'magic', 100, 100, { signature: 'pyrelich', fx: [ST('brn', 20)] }),
  m('old_sea_volley', 'Old Sea Volley', 'Water', 'ranged', 45, 90, { signature: 'deepfossil', fx: [{ k: 'multi', min: 2, max: 3 }] }),
  m('gone_before_seen', 'Gone Before Seen', 'Ghost', 'magic', 60, 100, { signature: 'wraithwing', prio: 1 }),
  m('blot_out', 'Blot Out', 'Dark', 'melee', 90, 100, { signature: 'nightmaw', flags: ['contact'], fx: [FLINCH(30)] }),
  m('nowhere_echo', 'Nowhere Echo', 'Psychic', 'magic', 90, null, { signature: 'voidbat', flags: ['sound'] }),
  m('fight_back_drink', 'Fight Back Drink', 'Dark', 'melee', 90, 100, { signature: 'bloodwing', flags: ['contact', 'bite'], fx: [{ k: 'drain', r: 0.5 }] }),
  m('heat_drink', 'Heat Drink', 'Fire', 'melee', 90, 100, { signature: 'vampryre', flags: ['contact', 'bite'], fx: [{ k: 'restore', r: 0.25 }] }),
  m('chasm_echo', 'Chasm Echo', 'Psychic', 'magic', 90, 100, { signature: 'sonarch', flags: ['sound'], fx: [{ k: 'cleanse' }] }),
  m('shadow_roost', 'Shadow Roost', 'Dark', 'magic', 80, 100, { signature: 'umbrabat', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('hum_back', 'Hum Back', 'Psychic', 'magic', 90, 100, { signature: 'mindshard', flags: ['sound'], fx: [STAT('foe', { magic: -1 })] }),
  m('garnet_fang', 'Garnet Fang', 'Rock', 'melee', 90, 100, { signature: 'drakonyx', crit: 1, flags: ['contact', 'bite'] }),
  m('light_sink', 'Light Sink', 'Ghost', 'magic', 90, 100, { signature: 'voidcrystal', fx: [{ k: 'drain', r: 0.5 }] }),
  m('lamp_read', 'Lamp Read', 'Psychic', 'magic', 90, 100, { signature: 'prismgeode', fx: [{ k: 'pierce' }] }),
  m('cut_back', 'Cut Back', 'Fighting', 'melee', 90, 100, { signature: 'bloodgarnet', flags: ['contact'], fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('hardest_thing', 'Hardest Thing', 'Rock', 'melee', 90, 100, { signature: 'diamondrake', flags: ['contact'], fx: [{ k: 'pierce' }] }),
  m('trapped_lights', 'Trapped Lights', 'Ice', 'magic', 100, 100, { signature: 'auroragem', fx: [ST('frz', 10), STAT('foe', { spe: -1 }, 20)] }),
  m('unquenched_fire', 'Unquenched Fire', 'Fire', 'magic', 90, 100, { signature: 'emberonyx', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('spiral_thought', 'Spiral Thought', 'Psychic', 'magic', 120, 100, { signature: 'mindcoil', fx: [STAT('self', { magic: -2 })] }),
  m('longest_coil', 'Longest Coil', 'Dragon', 'melee', 95, 100, { signature: 'wyrmpede', flags: ['contact'], fx: [STAT('foe', { spe: -1 })] }),
  m('two_answers', 'Two Answers', 'Ghost', 'magic', 90, 95, { signature: 'voidcrawl', fx: [STAT('foe', { acc: -1 }, 50)] }),
  m('tightening_coil', 'Tightening Coil', 'Fighting', 'melee', 95, 100, { signature: 'bloodcoil', flags: ['contact'], fx: [STAT('foe', { spe: -1 })] }),
  m('root_kindler', 'Root Kindler', 'Fire', 'melee', 100, 100, { signature: 'scolopyre', flags: ['contact'], fx: [ST('brn', 20)] }),
  m('unmeasured_deep', 'Unmeasured Deep', 'Water', 'ranged', 140, 90, { signature: 'deepcrawl', fx: [{ k: 'recharge' }] }),
  m('make_way', 'Make Way', 'Bug', 'melee', 120, 100, { signature: 'kingpede', flags: ['contact'], fx: [STAT('self', { meleeDef: -1, rangedDef: -1, magicDef: -1 })] }),
  m('signed_already', 'Signed Already', 'Psychic', 'magic', 80, 100, { signature: 'pactling', fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('sink_answer', 'Sink Answer', 'Fire', 'magic', 140, 90, { signature: 'archfiend', fx: [{ k: 'recharge' }] }),
  m('sold_shadow', 'Sold Shadow', 'Ghost', 'magic', 85, 100, { signature: 'voidfiend', fx: [{ k: 'boostIfFirst', m: 1.5 }] }),
  m('scar_collector', 'Scar Collector', 'Fighting', 'melee', 85, 100, { signature: 'bloodfiend', flags: ['contact'], fx: [STAT('self', { melee: 1 })] }),
  m('spite_haymaker', 'Spite Haymaker', 'Fighting', 'melee', 130, 100, { signature: 'hellion', flags: ['contact', 'punch'], fx: [{ k: 'recoil', r: 0.33 }] }),
  m('brimstone_bargain', 'Brimstone Bargain', 'Poison', 'ranged', 100, 100, { signature: 'sulfurax', fx: [ST('psn', 20)] }),
  m('already_known', 'Already Known', 'Dark', 'magic', 90, null, { signature: 'nightsovereign' }),
  m('sleeper_key', 'Sleeper Key', 'Psychic', 'magic', 90, 95, { signature: 'dreamveil', fx: [STAT('foe', { acc: -1 }, 50)] }),
  m('what_is_left', 'What Is Left', 'Dragon', 'magic', 90, 100, { signature: 'eldershade', fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('something_behind', 'Something Behind', 'Ghost', 'magic', 90, 100, { signature: 'voidwraith', fx: [FLINCH(30)] }),
  m('vigil_fists', 'Vigil Fists', 'Fighting', 'melee', 85, 100, { signature: 'bloodwraith', flags: ['contact', 'punch'], fx: [STAT('self', { melee: 1 })] }),
  m('lamp_wail', 'Lamp Wail', 'Ghost', 'magic', 95, 100, { signature: 'banshee', flags: ['sound'], fx: [STAT('foe', { spe: -1 })] }),
  m('one_more_fight', 'One More Fight', 'Fighting', 'melee', 90, 100, { signature: 'revenant', flags: ['contact'], fx: [{ k: 'boostIfLow', m: 1.5 }] }),
  m('lamp_throw', 'Lamp Throw', 'Electric', 'ranged', 90, 100, { signature: 'polterwisp', fx: [FLINCH(30)] }),

  // ---- the kit pass: every type filled to six melee, six ranged, six magic and four status ----
  // Normal — filling the kit
  m('scamper_cast', 'Scamper Cast', 'Normal', 'ranged', 50, 100),
  m('stampede_sling', 'Stampede Sling', 'Normal', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('clout_lob', 'Clout Lob', 'Normal', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('wallop_volley', 'Wallop Volley', 'Normal', 'ranged', 75, 100, { fx: [ST('par', 20)] }),
  m('wallop_brand', 'Wallop Brand', 'Normal', 'magic', 55, 100),
  m('rally_veil', 'Rally Veil', 'Normal', 'magic', 80, 100, { fx: [ST('par', 15)] }),
  m('pounce_song', 'Pounce Song', 'Normal', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('rally_brand', 'Rally Brand', 'Normal', 'magic', 100, 90),
  m('stampede_hex', 'Stampede Hex', 'Normal', 'magic', 75, 100, { fx: [{ k: 'drain', r: 0.5 }] }),
  // Fire — filling the kit
  m('ash_crush', 'Ash Crush', 'Fire', 'melee', 70, 100, { flags: ['contact'] }),
  m('ember_arc', 'Ember Arc', 'Fire', 'ranged', 50, 100),
  m('scorch_shot', 'Scorch Shot', 'Fire', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('scorch_lob', 'Scorch Lob', 'Fire', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('furnace_arc', 'Furnace Arc', 'Fire', 'ranged', 75, 100, { fx: [ST('brn', 20)] }),
  m('scorch_wave', 'Scorch Wave', 'Fire', 'magic', 55, 100),
  m('furnace_veil', 'Furnace Veil', 'Fire', 'magic', 80, 100, { fx: [ST('brn', 15)] }),
  m('brand_song', 'Brand Song', 'Fire', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('ember_stance', 'Ember Stance', 'Fire', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('kindle_stance', 'Kindle Stance', 'Fire', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('magma_form', 'Magma Form', 'Fire', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Water — filling the kit
  m('tide_headbutt', 'Tide Headbutt', 'Water', 'melee', 70, 100, { flags: ['contact'] }),
  m('brine_kick', 'Brine Kick', 'Water', 'melee', 95, 90, { flags: ['contact'] }),
  m('undertow_lob', 'Undertow Lob', 'Water', 'ranged', 50, 100),
  m('surf_arc', 'Surf Arc', 'Water', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('surf_sigil', 'Surf Sigil', 'Water', 'magic', 55, 100),
  m('tide_brand', 'Tide Brand', 'Water', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('rain_brand', 'Rain Brand', 'Water', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('tide_oath', 'Tide Oath', 'Water', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('delta_stance', 'Delta Stance', 'Water', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('rain_stance', 'Rain Stance', 'Water', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  m('delta_form', 'Delta Form', 'Water', 'status', 0, 100, { fx: [STAT('foe', {spe: -2})] }),
  // Electric — filling the kit
  m('storm_tackle', 'Storm Tackle', 'Electric', 'melee', 70, 100, { flags: ['contact'] }),
  m('surge_claw', 'Surge Claw', 'Electric', 'melee', 95, 90, { flags: ['contact'] }),
  m('storm_crush', 'Storm Crush', 'Electric', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('filament_kick', 'Filament Kick', 'Electric', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [ST('par', 20)] }),
  m('filament_barrage', 'Filament Barrage', 'Electric', 'ranged', 50, 100),
  m('coil_spray', 'Coil Spray', 'Electric', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('surge_barrage', 'Surge Barrage', 'Electric', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('volt_veil', 'Volt Veil', 'Electric', 'magic', 55, 100),
  m('coil_rite', 'Coil Rite', 'Electric', 'magic', 80, 100, { fx: [ST('par', 15)] }),
  m('storm_brand', 'Storm Brand', 'Electric', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('coil_ward', 'Coil Ward', 'Electric', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('dynamo_chant', 'Dynamo Chant', 'Electric', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('storm_chant', 'Storm Chant', 'Electric', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Grass — filling the kit
  m('orchard_fang', 'Orchard Fang', 'Grass', 'melee', 70, 100, { flags: ['contact'] }),
  m('creeper_fang', 'Creeper Fang', 'Grass', 'melee', 95, 90, { flags: ['contact'] }),
  m('sap_headbutt', 'Sap Headbutt', 'Grass', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('thicket_fang', 'Thicket Fang', 'Grass', 'melee', 75, 100, { flags: ['contact'], fx: [ST('slp', 20)] }),
  m('root_burst', 'Root Burst', 'Grass', 'ranged', 50, 100),
  m('thicket_arc', 'Thicket Arc', 'Grass', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('orchard_rite', 'Orchard Rite', 'Grass', 'magic', 55, 100),
  m('seed_rite', 'Seed Rite', 'Grass', 'magic', 80, 100, { fx: [ST('slp', 15)] }),
  m('thicket_rite', 'Thicket Rite', 'Grass', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('seed_aura', 'Seed Aura', 'Grass', 'magic', 100, 90),
  // Ice — filling the kit
  m('hail_strike', 'Hail Strike', 'Ice', 'melee', 70, 100, { flags: ['contact'] }),
  m('sleet_tackle', 'Sleet Tackle', 'Ice', 'melee', 95, 90, { flags: ['contact'] }),
  m('sleet_crush', 'Sleet Crush', 'Ice', 'melee', 80, 100, { flags: ['contact', 'bite'], fx: [FLINCH(20)] }),
  m('frost_fang', 'Frost Fang', 'Ice', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [ST('frz', 20)] }),
  m('icicle_arc', 'Icicle Arc', 'Ice', 'ranged', 50, 100),
  m('sleet_burst', 'Sleet Burst', 'Ice', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('chill_wave', 'Chill Wave', 'Ice', 'magic', 55, 100),
  m('chill_pulse', 'Chill Pulse', 'Ice', 'magic', 80, 100, { fx: [ST('frz', 15)] }),
  m('hail_veil', 'Hail Veil', 'Ice', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('frost_form', 'Frost Form', 'Ice', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('icicle_oath', 'Icicle Oath', 'Ice', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('glacier_call', 'Glacier Call', 'Ice', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  m('floe_chant', 'Floe Chant', 'Ice', 'status', 0, 100, { fx: [STAT('foe', {spe: -2})] }),
  // Fighting — filling the kit
  m('grapple_cast', 'Grapple Cast', 'Fighting', 'ranged', 50, 100),
  m('temper_burst', 'Temper Burst', 'Fighting', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('temper_shot', 'Temper Shot', 'Fighting', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('ringside_spray', 'Ringside Spray', 'Fighting', 'ranged', 75, 100, { fx: [STAT('foe', {spe: -1}, 30)] }),
  m('footwork_chant', 'Footwork Chant', 'Fighting', 'magic', 55, 100),
  m('headlock_veil', 'Headlock Veil', 'Fighting', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('grapple_chant', 'Grapple Chant', 'Fighting', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('sparring_hex', 'Sparring Hex', 'Fighting', 'magic', 100, 90),
  m('temper_form', 'Temper Form', 'Fighting', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('shove_chant', 'Shove Chant', 'Fighting', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('footwork_stance', 'Footwork Stance', 'Fighting', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Poison — filling the kit
  m('bile_headbutt', 'Bile Headbutt', 'Poison', 'melee', 70, 100, { flags: ['contact'] }),
  m('bile_fang', 'Bile Fang', 'Poison', 'melee', 95, 90, { flags: ['contact'] }),
  m('miasma_cast', 'Miasma Cast', 'Poison', 'ranged', 50, 100),
  m('venom_spray', 'Venom Spray', 'Poison', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('fume_barrage', 'Fume Barrage', 'Poison', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('bile_veil', 'Bile Veil', 'Poison', 'magic', 55, 100),
  m('rot_hex', 'Rot Hex', 'Poison', 'magic', 80, 100, { fx: [ST('psn', 15)] }),
  m('blight_rite', 'Blight Rite', 'Poison', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('canker_brand', 'Canker Brand', 'Poison', 'magic', 100, 90),
  m('sludge_call', 'Sludge Call', 'Poison', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('venom_stance', 'Venom Stance', 'Poison', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  // Ground — filling the kit
  m('loam_headbutt', 'Loam Headbutt', 'Ground', 'melee', 70, 100, { flags: ['contact'] }),
  m('clay_strike', 'Clay Strike', 'Ground', 'melee', 95, 90, { flags: ['contact'] }),
  m('burrow_lunge', 'Burrow Lunge', 'Ground', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('burrow_volley', 'Burrow Volley', 'Ground', 'ranged', 50, 100),
  m('gravel_cast', 'Gravel Cast', 'Ground', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('furrow_veil', 'Furrow Veil', 'Ground', 'magic', 55, 100),
  m('furrow_aura', 'Furrow Aura', 'Ground', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('tremor_pulse', 'Tremor Pulse', 'Ground', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('burrow_focus', 'Burrow Focus', 'Ground', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('loam_ward', 'Loam Ward', 'Ground', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('clay_focus', 'Clay Focus', 'Ground', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Flying — filling the kit
  m('cirrus_slam', 'Cirrus Slam', 'Flying', 'melee', 70, 100, { flags: ['contact'] }),
  m('thermal_claw', 'Thermal Claw', 'Flying', 'melee', 95, 90, { flags: ['contact'] }),
  m('squall_kick', 'Squall Kick', 'Flying', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('gale_cast', 'Gale Cast', 'Flying', 'ranged', 50, 100),
  m('thermal_cast', 'Thermal Cast', 'Flying', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('skyline_song', 'Skyline Song', 'Flying', 'magic', 55, 100),
  m('cirrus_hex', 'Cirrus Hex', 'Flying', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('gale_song', 'Gale Song', 'Flying', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('feather_call', 'Feather Call', 'Flying', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('eyrie_focus', 'Eyrie Focus', 'Flying', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('skyline_form', 'Skyline Form', 'Flying', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Psychic — filling the kit
  m('psyche_lunge', 'Psyche Lunge', 'Psychic', 'melee', 70, 100, { flags: ['contact'] }),
  m('notion_tackle', 'Notion Tackle', 'Psychic', 'melee', 95, 90, { flags: ['contact'] }),
  m('trance_grip', 'Trance Grip', 'Psychic', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('mantra_slam', 'Mantra Slam', 'Psychic', 'melee', 75, 100, { flags: ['contact'], fx: [ST('slp', 20)] }),
  m('reverie_tackle', 'Reverie Tackle', 'Psychic', 'melee', 20, 90, { flags: ['contact'], fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('augur_lob', 'Augur Lob', 'Psychic', 'ranged', 50, 100),
  m('foresight_sling', 'Foresight Sling', 'Psychic', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('lucid_spray', 'Lucid Spray', 'Psychic', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('insight_pelt', 'Insight Pelt', 'Psychic', 'ranged', 75, 100, { fx: [ST('slp', 20)] }),
  m('mantra_aura', 'Mantra Aura', 'Psychic', 'magic', 55, 100),
  // Bug — filling the kit
  m('carapace_claw', 'Carapace Claw', 'Bug', 'melee', 70, 100, { flags: ['contact'] }),
  m('drone_kick', 'Drone Kick', 'Bug', 'melee', 95, 90, { flags: ['contact'] }),
  m('mandible_pelt', 'Mandible Pelt', 'Bug', 'ranged', 50, 100),
  m('nectar_pelt', 'Nectar Pelt', 'Bug', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('nectar_spray', 'Nectar Spray', 'Bug', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('swarm_aura', 'Swarm Aura', 'Bug', 'magic', 55, 100),
  m('carapace_pulse', 'Carapace Pulse', 'Bug', 'magic', 80, 100, { fx: [ST('psn', 15)] }),
  m('mandible_hex', 'Mandible Hex', 'Bug', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('hive_pulse', 'Hive Pulse', 'Bug', 'magic', 100, 90),
  m('nectar_oath', 'Nectar Oath', 'Bug', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('silk_call', 'Silk Call', 'Bug', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('drone_focus', 'Drone Focus', 'Bug', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Rock — filling the kit
  m('shale_headbutt', 'Shale Headbutt', 'Rock', 'melee', 70, 100, { flags: ['contact'] }),
  m('granite_fang', 'Granite Fang', 'Rock', 'melee', 95, 90, { flags: ['contact'] }),
  m('basalt_claw', 'Basalt Claw', 'Rock', 'melee', 80, 100, { flags: ['contact', 'bite'], fx: [FLINCH(20)] }),
  m('flint_crush', 'Flint Crush', 'Rock', 'melee', 75, 100, { flags: ['contact', 'punch'], fx: [STAT('self', {melee: 1}, 30)] }),
  m('granite_spray', 'Granite Spray', 'Rock', 'ranged', 50, 100),
  m('granite_pulse', 'Granite Pulse', 'Rock', 'magic', 55, 100),
  m('granite_chant', 'Granite Chant', 'Rock', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('scree_aura', 'Scree Aura', 'Rock', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('granite_brand', 'Granite Brand', 'Rock', 'magic', 100, 90),
  m('flint_oath', 'Flint Oath', 'Rock', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('granite_ward', 'Granite Ward', 'Rock', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('cairn_form', 'Cairn Form', 'Rock', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Ghost — filling the kit
  m('phantom_strike', 'Phantom Strike', 'Ghost', 'melee', 70, 100, { flags: ['contact'] }),
  m('sepulchre_crush', 'Sepulchre Crush', 'Ghost', 'melee', 95, 90, { flags: ['contact'] }),
  m('hollow_slam', 'Hollow Slam', 'Ghost', 'melee', 80, 100, { flags: ['contact', 'bite'], fx: [FLINCH(20)] }),
  m('lament_burst', 'Lament Burst', 'Ghost', 'ranged', 50, 100),
  m('vigil_lob', 'Vigil Lob', 'Ghost', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('cerement_arc', 'Cerement Arc', 'Ghost', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('phantom_arc', 'Phantom Arc', 'Ghost', 'ranged', 75, 100, { fx: [ST('brn', 20)] }),
  m('wraith_aura', 'Wraith Aura', 'Ghost', 'magic', 55, 100),
  m('vigil_pulse', 'Vigil Pulse', 'Ghost', 'magic', 80, 100, { fx: [ST('brn', 15)] }),
  m('phantom_chant', 'Phantom Chant', 'Ghost', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('shroud_call', 'Shroud Call', 'Ghost', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('vigil_call', 'Vigil Call', 'Ghost', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('sepulchre_form', 'Sepulchre Form', 'Ghost', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Dragon — filling the kit
  m('wyrm_lunge', 'Wyrm Lunge', 'Dragon', 'melee', 70, 100, { flags: ['contact'] }),
  m('primeval_headbutt', 'Primeval Headbutt', 'Dragon', 'melee', 95, 90, { flags: ['contact'] }),
  m('primeval_slam', 'Primeval Slam', 'Dragon', 'melee', 80, 100, { flags: ['contact', 'bite'], fx: [FLINCH(20)] }),
  m('wyrm_burst', 'Wyrm Burst', 'Dragon', 'ranged', 50, 100),
  m('primeval_shot', 'Primeval Shot', 'Dragon', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('ridge_lob', 'Ridge Lob', 'Dragon', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('hoard_lob', 'Hoard Lob', 'Dragon', 'ranged', 75, 100, { fx: [STAT('foe', {spe: -1}, 30)] }),
  m('ancient_brand', 'Ancient Brand', 'Dragon', 'magic', 55, 100),
  m('roost_pulse', 'Roost Pulse', 'Dragon', 'magic', 80, 100, { fx: [STAT('foe', {magicDef: -1}, 30)] }),
  m('scale_aura', 'Scale Aura', 'Dragon', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('hoard_aura', 'Hoard Aura', 'Dragon', 'magic', 100, 90),
  m('hoard_oath', 'Hoard Oath', 'Dragon', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('ridge_oath', 'Ridge Oath', 'Dragon', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('ancient_call', 'Ancient Call', 'Dragon', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Dark — filling the kit
  m('pitch_cast', 'Pitch Cast', 'Dark', 'ranged', 50, 100),
  m('umbra_sling', 'Umbra Sling', 'Dark', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('eclipse_shot', 'Eclipse Shot', 'Dark', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('gutter_hex', 'Gutter Hex', 'Dark', 'magic', 55, 100),
  m('grudge_chant', 'Grudge Chant', 'Dark', 'magic', 80, 100, { fx: [ST('par', 15)] }),
  m('gutter_sigil', 'Gutter Sigil', 'Dark', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('pitch_wave', 'Pitch Wave', 'Dark', 'magic', 100, 90),
  m('cinderdark_focus', 'Cinderdark Focus', 'Dark', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('cinderdark_mark', 'Cinderdark Mark', 'Dark', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  m('cinderdark_form', 'Cinderdark Form', 'Dark', 'status', 0, 100, { fx: [STAT('foe', {melee: -1, ranged: -1})] }),
  // Steel — filling the kit
  m('sprocket_barrage', 'Sprocket Barrage', 'Steel', 'ranged', 50, 100),
  m('alloy_volley', 'Alloy Volley', 'Steel', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('girder_cast', 'Girder Cast', 'Steel', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('forge_barrage', 'Forge Barrage', 'Steel', 'ranged', 75, 100, { fx: [ST('par', 20)] }),
  m('plate_cast', 'Plate Cast', 'Steel', 'ranged', 80, 100, { fx: [{ k: 'pierce' }] }),
  m('bearing_sigil', 'Bearing Sigil', 'Steel', 'magic', 55, 100),
  m('anvil_song', 'Anvil Song', 'Steel', 'magic', 80, 100, { fx: [ST('par', 15)] }),
  m('girder_aura', 'Girder Aura', 'Steel', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('rivet_sigil', 'Rivet Sigil', 'Steel', 'magic', 100, 90),
  m('sprocket_form', 'Sprocket Form', 'Steel', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('ingot_call', 'Ingot Call', 'Steel', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),
  // Fairy — filling the kit
  m('charm_lunge', 'Charm Lunge', 'Fairy', 'melee', 70, 100, { flags: ['contact'] }),
  m('glimmer_lunge', 'Glimmer Lunge', 'Fairy', 'melee', 95, 90, { flags: ['contact'] }),
  m('lullaby_fang', 'Lullaby Fang', 'Fairy', 'melee', 80, 100, { flags: ['contact'], fx: [FLINCH(20)] }),
  m('trinket_shot', 'Trinket Shot', 'Fairy', 'ranged', 50, 100),
  m('wisp_shot', 'Wisp Shot', 'Fairy', 'ranged', 85, 95, { fx: [FLINCH(20)] }),
  m('petal_pelt', 'Petal Pelt', 'Fairy', 'ranged', 25, 90, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('wisp_sigil', 'Wisp Sigil', 'Fairy', 'magic', 55, 100),
  m('trinket_sigil', 'Trinket Sigil', 'Fairy', 'magic', 80, 100, { fx: [ST('slp', 15)] }),
  m('gossamer_veil', 'Gossamer Veil', 'Fairy', 'magic', 70, 100, { fx: [{ k: 'boostIfStatus', m: 1.5 }] }),
  m('moonbeam_chant', 'Moonbeam Chant', 'Fairy', 'magic', 100, 90),
  m('wisp_focus', 'Wisp Focus', 'Fairy', 'status', 0, null, { fx: [STAT('self', {melee: 1, meleeDef: 1})] }),
  m('charm_focus', 'Charm Focus', 'Fairy', 'status', 0, null, { fx: [STAT('self', {magic: 2})] }),

  // ---- the field pass: moves that argue with the sky and the ground, and the ones that cash it in ----
  m('sunflare', 'Sunflare', 'Fire', 'status', 0, null, { fx: [{ k: 'weather', w: 'sun' }] }),
  m('cloudburst', 'Cloudburst', 'Water', 'status', 0, null, { fx: [{ k: 'weather', w: 'rain' }] }),
  m('duststorm', 'Duststorm', 'Ground', 'status', 0, null, { fx: [{ k: 'weather', w: 'sand' }] }),
  m('snowveil', 'Snowveil', 'Ice', 'status', 0, null, { fx: [{ k: 'weather', w: 'snow' }] }),
  m('wildgrass', 'Wildgrass', 'Grass', 'status', 0, null, { fx: [{ k: 'terrain', t: 'grassy' }] }),
  m('sparkbed', 'Sparkbed', 'Electric', 'status', 0, null, { fx: [{ k: 'terrain', t: 'charged' }] }),
  m('mistfall', 'Mistfall', 'Fairy', 'status', 0, null, { fx: [{ k: 'terrain', t: 'misty' }] }),
  m('clear_skies', 'Clear Skies', 'Normal', 'status', 0, null, { fx: [{ k: 'clearField' }] }),
  m('solar_lance', 'Solar Lance', 'Fire', 'magic', 85, 100, { fx: [{ k: 'weatherPower', w: 'sun', m: 1.5 }] }),
  m('steam_burst', 'Steam Burst', 'Water', 'magic', 80, 100, { fx: [{ k: 'weatherPower', w: 'sun', m: 1.4 }] }),
  m('thunderline', 'Thunderline', 'Electric', 'ranged', 110, 70, { fx: [{ k: 'sureShotIn', w: 'rain' }, ST('par', 30)] }),
  m('frost_gale', 'Frost Gale', 'Ice', 'magic', 110, 70, { fx: [{ k: 'sureShotIn', w: 'snow' }, ST('frz', 10)] }),
  m('sandblast', 'Sandblast', 'Rock', 'ranged', 75, 100, { fx: [{ k: 'weatherPower', w: 'sand', m: 1.4 }] }),
  m('hailstone', 'Hailstone', 'Ice', 'ranged', 60, 100, { fx: [{ k: 'weatherPower', w: 'snow', m: 1.5 }, FLINCH(10)] }),
  m('weathervane', 'Weathervane', 'Normal', 'magic', 80, 100, { fx: [{ k: 'weatherType' }] }),
  m('rootdraw', 'Rootdraw', 'Grass', 'magic', 85, 100, { fx: [{ k: 'terrainPower', t: 'grassy', m: 1.4 }] }),
  m('static_spike', 'Static Spike', 'Electric', 'melee', 75, 100, { flags: CONTACT, fx: [{ k: 'terrainPower', t: 'charged', m: 1.4 }] }),
  m('mist_lash', 'Mist Lash', 'Fairy', 'ranged', 80, 100, { fx: [{ k: 'terrainPower', t: 'misty', m: 1.4 }] }),
];


/** Used when a battler has no PP left. Typeless, hurts the user. */
export const STRUGGLE = m('struggle', 'Struggle', 'Normal', 'melee', 50, null, { pp: 1, flags: CONTACT, typeless: true, struggle: true });

export const MOVES_BY_ID = new Map(MOVES.map((mv) => [mv.id, mv]));
export function getMove(id) { return id === 'struggle' ? STRUGGLE : MOVES_BY_ID.get(id) || null; }
/** Every fx kind the engine reads off a move; the move table must not invent others. */
export const MOVE_FX_KINDS = ['status', 'stat', 'flinch', 'drain', 'recoil', 'heal', 'multi', 'fixed', 'boostIfStatus', 'restore', 'cure', 'pierce', 'recharge', 'cleanse', 'boostIfLow', 'boostIfFirst',
  'weather', 'terrain', 'clearField', 'weatherPower', 'terrainPower', 'sureShotIn', 'weatherType'];
export function moveFx(mv, kind) { return mv.fx.find((f) => f.k === kind) || null; }
export function isDamaging(mv) { return mv.cat !== 'status'; }
/** Moves that belong to one rare species: never sold, and tagged on sheets and cards. */
export const SIGNATURE_MOVES = MOVES.filter((mv) => mv.signature);
export function signatureOf(speciesId) { return SIGNATURE_MOVES.find((mv) => mv.signature === speciesId) || null; }

/** Fallback moves any creature can learn, used to pad thin learnsets. */
export const UNIVERSAL_LEARNSET = [[1, 'bump'], [10, 'dash'], [20, 'rake'], [30, 'bellow']];
