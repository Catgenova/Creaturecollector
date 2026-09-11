// Move table. Original names; mechanics follow the classic formula.
// cat: 'phys' | 'spec' | 'status'. acc: percent, or null for moves that never miss.
// fx entries (p = percent chance, default 100):
//   { k:'status', s:'brn'|'psn'|'par'|'slp'|'frz', p }      inflict a major status on the target
//   { k:'stat', who:'self'|'foe', stats:{atk:1,...}, p }      stage changes
//   { k:'flinch', p }                                         target flinches if it has not moved yet
//   { k:'drain', r }  { k:'recoil', r }  { k:'heal', r }      fractions of damage dealt / max HP
//   { k:'multi', min, max }  { k:'fixed', v:'level' }  { k:'boostIfStatus', m }
// flags: contact, punch, bite, powder, sound.

const m = (id, name, type, cat, power, acc, pp, extra = {}) => ({ id, name, type, cat, power, acc, pp, prio: 0, crit: 0, flags: [], fx: [], ...extra });
const ST = (s, p = 100) => ({ k: 'status', s, p });
const STAT = (who, stats, p = 100) => ({ k: 'stat', who, stats, p });
const FLINCH = (p) => ({ k: 'flinch', p });
const CONTACT = ['contact'];

export const MOVES = [
  // Normal
  m('bump', 'Bump', 'Normal', 'phys', 40, 100, 35, { flags: CONTACT }),
  m('swipe', 'Swipe', 'Normal', 'phys', 40, 100, 35, { flags: CONTACT }),
  m('dash', 'Dash', 'Normal', 'phys', 40, 100, 30, { prio: 1, flags: CONTACT }),
  m('headbonk', 'Headbonk', 'Normal', 'phys', 70, 100, 15, { flags: CONTACT, fx: [FLINCH(30)] }),
  m('belly_flop', 'Belly Flop', 'Normal', 'phys', 85, 100, 15, { flags: CONTACT, fx: [ST('par', 30)] }),
  m('ram', 'Ram', 'Normal', 'phys', 90, 85, 20, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.25 }] }),
  m('reckless_charge', 'Reckless Charge', 'Normal', 'phys', 120, 100, 10, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }] }),
  m('rake', 'Rake', 'Normal', 'phys', 70, 100, 20, { crit: 1, flags: CONTACT }),
  m('flurry', 'Flurry', 'Normal', 'phys', 18, 85, 15, { flags: CONTACT, fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('bellow', 'Bellow', 'Normal', 'spec', 90, 100, 10, { flags: ['sound'] }),
  m('blur', 'Blur', 'Normal', 'phys', 80, 100, 5, { prio: 2, flags: CONTACT }),
  m('yowl', 'Yowl', 'Normal', 'status', 0, 100, 40, { flags: ['sound'], fx: [STAT('foe', { atk: -1 })] }),
  m('glare', 'Glare', 'Normal', 'status', 0, 100, 30, { fx: [STAT('foe', { def: -1 })] }),
  m('brace', 'Brace', 'Normal', 'status', 0, null, 30, { fx: [STAT('self', { def: 1 })] }),
  m('mend', 'Mend', 'Normal', 'status', 0, null, 10, { fx: [{ k: 'heal', r: 0.5 }] }),
  m('whetting', 'Whetting', 'Normal', 'status', 0, null, 20, { fx: [STAT('self', { atk: 2 })] }),
  // Fire
  m('cinder', 'Cinder', 'Fire', 'spec', 40, 100, 25, { fx: [ST('brn', 10)] }),
  m('ember_bite', 'Ember Bite', 'Fire', 'phys', 65, 95, 15, { flags: ['contact', 'bite'], fx: [ST('brn', 10), FLINCH(10)] }),
  m('kindle_rush', 'Kindle Rush', 'Fire', 'phys', 50, 100, 20, { flags: CONTACT, fx: [STAT('self', { spe: 1 })] }),
  m('scorch_fist', 'Scorch Fist', 'Fire', 'phys', 75, 100, 15, { flags: ['contact', 'punch'], fx: [ST('brn', 10)] }),
  m('fire_stream', 'Fire Stream', 'Fire', 'spec', 90, 100, 15, { fx: [ST('brn', 10)] }),
  m('blaze_tackle', 'Blaze Tackle', 'Fire', 'phys', 120, 100, 10, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }, ST('brn', 10)] }),
  m('meltdown', 'Meltdown', 'Fire', 'spec', 130, 90, 5, { fx: [STAT('self', { spa: -2 })] }),
  m('ghostflame', 'Ghostflame', 'Fire', 'status', 0, 85, 15, { fx: [ST('brn')] }),
  // Water
  m('squirt', 'Squirt', 'Water', 'spec', 40, 100, 25),
  m('ripple', 'Ripple', 'Water', 'spec', 60, 100, 20, { fx: [STAT('foe', { spd: -1 }, 20)] }),
  m('jetstream', 'Jetstream', 'Water', 'phys', 40, 100, 20, { prio: 1, flags: CONTACT }),
  m('cascade', 'Cascade', 'Water', 'phys', 80, 100, 15, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('riptide', 'Riptide', 'Water', 'phys', 90, 90, 10, { flags: CONTACT }),
  m('boiling_jet', 'Boiling Jet', 'Water', 'spec', 80, 100, 15, { fx: [ST('brn', 30)] }),
  m('tidal_wave', 'Tidal Wave', 'Water', 'spec', 90, 100, 15),
  m('geyser', 'Geyser', 'Water', 'spec', 110, 80, 5),
  // Electric
  m('zap', 'Zap', 'Electric', 'spec', 40, 100, 30, { fx: [ST('par', 10)] }),
  m('arc_beam', 'Arc Beam', 'Electric', 'spec', 50, 90, 10, { fx: [STAT('self', { spa: 1 }, 70)] }),
  m('static_net', 'Static Net', 'Electric', 'spec', 55, 95, 15, { fx: [STAT('foe', { spe: -1 })] }),
  m('shock_fist', 'Shock Fist', 'Electric', 'phys', 75, 100, 15, { flags: ['contact', 'punch'], fx: [ST('par', 10)] }),
  m('voltage', 'Voltage', 'Electric', 'spec', 90, 100, 15, { fx: [ST('par', 10)] }),
  m('live_wire', 'Live Wire', 'Electric', 'phys', 90, 100, 15, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.25 }] }),
  m('skyfall_bolt', 'Skyfall Bolt', 'Electric', 'spec', 110, 70, 10, { fx: [ST('par', 30)] }),
  m('numb_pulse', 'Numb Pulse', 'Electric', 'status', 0, 90, 20, { fx: [ST('par')] }),
  // Grass
  m('vine_lash', 'Vine Lash', 'Grass', 'phys', 45, 100, 25, { flags: CONTACT }),
  m('leaf_razor', 'Leaf Razor', 'Grass', 'phys', 55, 95, 25, { crit: 1 }),
  m('seed_volley', 'Seed Volley', 'Grass', 'phys', 25, 100, 30, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('sap_drain', 'Sap Drain', 'Grass', 'spec', 75, 100, 10, { fx: [{ k: 'drain', r: 0.5 }] }),
  m('spore_burst', 'Spore Burst', 'Grass', 'spec', 90, 100, 10, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('blade_leaf', 'Blade Leaf', 'Grass', 'phys', 90, 100, 15, { crit: 1, flags: CONTACT }),
  m('sunlance', 'Sunlance', 'Grass', 'spec', 120, 100, 5),
  m('leaf_tempest', 'Leaf Tempest', 'Grass', 'spec', 130, 90, 5, { fx: [STAT('self', { spa: -2 })] }),
  m('drowse_dust', 'Drowse Dust', 'Grass', 'status', 0, 75, 15, { flags: ['powder'], fx: [ST('slp')] }),
  m('numb_spores', 'Numb Spores', 'Grass', 'status', 0, 75, 30, { flags: ['powder'], fx: [ST('par')] }),
  m('toxin_dust', 'Toxin Dust', 'Grass', 'status', 0, 75, 35, { flags: ['powder'], fx: [ST('psn')] }),
  m('photosynth', 'Photosynth', 'Grass', 'status', 0, null, 5, { fx: [{ k: 'heal', r: 0.5 }] }),
  // Ice
  m('sleet', 'Sleet', 'Ice', 'spec', 40, 100, 25, { fx: [ST('frz', 10)] }),
  m('chill_gust', 'Chill Gust', 'Ice', 'spec', 55, 95, 15, { fx: [STAT('foe', { spe: -1 })] }),
  m('icicle_dart', 'Icicle Dart', 'Ice', 'phys', 40, 100, 30, { prio: 1 }),
  m('frost_fist', 'Frost Fist', 'Ice', 'phys', 75, 100, 15, { flags: ['contact', 'punch'], fx: [ST('frz', 10)] }),
  m('glacier_ray', 'Glacier Ray', 'Ice', 'spec', 90, 100, 10, { fx: [ST('frz', 10)] }),
  m('snowslide', 'Snowslide', 'Ice', 'phys', 100, 100, 10, { prio: -4, flags: CONTACT }),
  m('whiteout', 'Whiteout', 'Ice', 'spec', 110, 70, 5, { fx: [ST('frz', 10)] }),
  // Fighting
  m('chop', 'Chop', 'Fighting', 'phys', 50, 100, 25, { crit: 1, flags: CONTACT }),
  m('blitz_punch', 'Blitz Punch', 'Fighting', 'phys', 40, 100, 30, { prio: 1, flags: ['contact', 'punch'] }),
  m('shock_palm', 'Shock Palm', 'Fighting', 'spec', 40, 100, 30, { prio: 1 }),
  m('leg_sweep', 'Leg Sweep', 'Fighting', 'phys', 65, 100, 20, { flags: CONTACT, fx: [STAT('foe', { spe: -1 })] }),
  m('slab_break', 'Slab Break', 'Fighting', 'phys', 75, 100, 15, { flags: CONTACT }),
  m('siphon_fist', 'Siphon Fist', 'Fighting', 'phys', 75, 100, 10, { flags: ['contact', 'punch'], fx: [{ k: 'drain', r: 0.5 }] }),
  m('all_out_brawl', 'All-Out Brawl', 'Fighting', 'phys', 120, 100, 5, { flags: CONTACT, fx: [STAT('self', { def: -1, spd: -1 })] }),
  m('overpower', 'Overpower', 'Fighting', 'phys', 120, 100, 5, { flags: CONTACT, fx: [STAT('self', { atk: -1, def: -1 })] }),
  m('aura_cannon', 'Aura Cannon', 'Fighting', 'spec', 120, 70, 5, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('muscle_up', 'Muscle Up', 'Fighting', 'status', 0, null, 20, { fx: [STAT('self', { atk: 1, def: 1 })] }),
  // Poison
  m('venom_prick', 'Venom Prick', 'Poison', 'phys', 30, 100, 35, { fx: [ST('psn', 30)] }),
  m('acid_spit', 'Acid Spit', 'Poison', 'spec', 40, 100, 20, { fx: [STAT('foe', { spd: -2 })] }),
  m('venom_slash', 'Venom Slash', 'Poison', 'phys', 70, 100, 20, { crit: 1, flags: CONTACT, fx: [ST('psn', 10)] }),
  m('venom_stab', 'Venom Stab', 'Poison', 'phys', 80, 100, 20, { flags: CONTACT, fx: [ST('psn', 30)] }),
  m('sludge_blast', 'Sludge Blast', 'Poison', 'spec', 90, 100, 10, { fx: [ST('psn', 30)] }),
  m('sludge_hurl', 'Sludge Hurl', 'Poison', 'phys', 120, 80, 5, { fx: [ST('psn', 30)] }),
  m('blight', 'Blight', 'Poison', 'status', 0, 90, 10, { fx: [ST('psn')] }),
  m('slime_coat', 'Slime Coat', 'Poison', 'status', 0, null, 20, { fx: [STAT('self', { def: 2 })] }),
  // Ground
  m('mud_fling', 'Mud Fling', 'Ground', 'spec', 40, 100, 20, { fx: [STAT('foe', { acc: -1 })] }),
  m('silt_jet', 'Silt Jet', 'Ground', 'spec', 55, 95, 15, { fx: [STAT('foe', { spe: -1 })] }),
  m('stampede', 'Stampede', 'Ground', 'phys', 60, 100, 20, { fx: [STAT('foe', { spe: -1 })] }),
  m('bone_rattle', 'Bone Rattle', 'Ground', 'phys', 25, 90, 10, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('fissure_burst', 'Fissure Burst', 'Ground', 'spec', 90, 100, 10, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('bull_rush', 'Bull Rush', 'Ground', 'phys', 95, 95, 10, { flags: CONTACT }),
  m('tremor', 'Tremor', 'Ground', 'phys', 100, 100, 10),
  m('dust_kick', 'Dust Kick', 'Ground', 'status', 0, 100, 15, { fx: [STAT('foe', { acc: -1 })] }),
  // Flying
  m('gale', 'Gale', 'Flying', 'spec', 40, 100, 35),
  m('wing_strike', 'Wing Strike', 'Flying', 'phys', 60, 100, 35, { flags: CONTACT }),
  m('sky_strike', 'Sky Strike', 'Flying', 'phys', 60, null, 20, { flags: CONTACT }),
  m('slipstream', 'Slipstream', 'Flying', 'spec', 60, 95, 25, { crit: 1 }),
  m('wind_cutter', 'Wind Cutter', 'Flying', 'spec', 75, 95, 15, { fx: [FLINCH(30)] }),
  m('cyclone', 'Cyclone', 'Flying', 'spec', 110, 70, 10),
  m('dive_bomb', 'Dive Bomb', 'Flying', 'phys', 120, 100, 15, { flags: CONTACT, fx: [{ k: 'recoil', r: 0.33 }] }),
  m('preen', 'Preen', 'Flying', 'status', 0, null, 10, { fx: [{ k: 'heal', r: 0.5 }] }),
  // Psychic
  m('mind_jolt', 'Mind Jolt', 'Psychic', 'spec', 50, 100, 25, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('thought_beam', 'Thought Beam', 'Psychic', 'spec', 65, 100, 20, { fx: [STAT('foe', { spa: -1 }, 10)] }),
  m('psi_shock', 'Psi Shock', 'Psychic', 'spec', 80, 100, 10),
  m('mind_ram', 'Mind Ram', 'Psychic', 'phys', 80, 90, 15, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('mind_crush', 'Mind Crush', 'Psychic', 'spec', 90, 100, 10, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('lull', 'Lull', 'Psychic', 'status', 0, 60, 20, { fx: [ST('slp')] }),
  m('meditate', 'Meditate', 'Psychic', 'status', 0, null, 20, { fx: [STAT('self', { spa: 1, spd: 1 })] }),
  m('quicken', 'Quicken', 'Psychic', 'status', 0, null, 30, { fx: [STAT('self', { spe: 2 })] }),
  m('blank_mind', 'Blank Mind', 'Psychic', 'status', 0, null, 20, { fx: [STAT('self', { spd: 2 })] }),
  // Bug
  m('nibble', 'Nibble', 'Bug', 'phys', 60, 100, 20, { flags: ['contact', 'bite'] }),
  m('needle_volley', 'Needle Volley', 'Bug', 'phys', 25, 95, 20, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('swarm_buzz', 'Swarm Buzz', 'Bug', 'spec', 50, 100, 20, { flags: ['sound'], fx: [STAT('foe', { spa: -1 })] }),
  m('scissor_slash', 'Scissor Slash', 'Bug', 'phys', 80, 100, 15, { flags: CONTACT }),
  m('blood_sip', 'Blood Sip', 'Bug', 'phys', 80, 100, 10, { flags: CONTACT, fx: [{ k: 'drain', r: 0.5 }] }),
  m('drone', 'Drone', 'Bug', 'spec', 90, 100, 10, { flags: ['sound'], fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('great_horn', 'Great Horn', 'Bug', 'phys', 120, 85, 10, { flags: CONTACT }),
  m('web_shot', 'Web Shot', 'Bug', 'status', 0, 95, 40, { fx: [STAT('foe', { spe: -2 })] }),
  // Rock
  m('stone_toss', 'Stone Toss', 'Rock', 'phys', 50, 90, 15),
  m('stone_trap', 'Stone Trap', 'Rock', 'phys', 60, 95, 15, { fx: [STAT('foe', { spe: -1 })] }),
  m('primal_surge', 'Primal Surge', 'Rock', 'spec', 60, 100, 5, { fx: [STAT('self', { atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }, 10)] }),
  m('pebble_barrage', 'Pebble Barrage', 'Rock', 'phys', 25, 90, 10, { fx: [{ k: 'multi', min: 2, max: 5 }] }),
  m('boulder_fall', 'Boulder Fall', 'Rock', 'phys', 75, 90, 10, { fx: [FLINCH(30)] }),
  m('gem_gleam', 'Gem Gleam', 'Rock', 'spec', 80, 100, 20),
  m('shard_spire', 'Shard Spire', 'Rock', 'phys', 100, 80, 5, { crit: 1 }),
  m('smooth_stone', 'Smooth Stone', 'Rock', 'status', 0, null, 20, { fx: [STAT('self', { spe: 2 })] }),
  // Ghost
  m('cold_lick', 'Cold Lick', 'Ghost', 'phys', 30, 100, 30, { flags: CONTACT, fx: [ST('par', 30)] }),
  m('wraith_touch', 'Wraith Touch', 'Ghost', 'spec', 0, 100, 15, { fx: [{ k: 'fixed', v: 'level' }] }),
  m('shade_step', 'Shade Step', 'Ghost', 'phys', 40, 100, 30, { prio: 1, flags: CONTACT }),
  m('curse_bolt', 'Curse Bolt', 'Ghost', 'spec', 65, 100, 10, { fx: [{ k: 'boostIfStatus', m: 2 }] }),
  m('phantom_claw', 'Phantom Claw', 'Ghost', 'phys', 70, 100, 15, { crit: 1, flags: CONTACT }),
  m('umbral_orb', 'Umbral Orb', 'Ghost', 'spec', 80, 100, 15, { fx: [STAT('foe', { spd: -1 }, 20)] }),
  m('haunt', 'Haunt', 'Ghost', 'status', 0, 100, 15, { fx: [STAT('foe', { spa: -1, spd: -1 })] }),
  // Dragon
  m('wyrm_breath', 'Wyrm Breath', 'Dragon', 'spec', 60, 100, 20, { fx: [ST('par', 30)] }),
  m('wyrm_claw', 'Wyrm Claw', 'Dragon', 'phys', 80, 100, 15, { flags: CONTACT }),
  m('wyrm_pulse', 'Wyrm Pulse', 'Dragon', 'spec', 85, 100, 10),
  m('wyrm_rush', 'Wyrm Rush', 'Dragon', 'phys', 100, 75, 10, { flags: CONTACT, fx: [FLINCH(20)] }),
  m('rampage', 'Rampage', 'Dragon', 'phys', 110, 100, 10, { flags: CONTACT, fx: [STAT('self', { def: -1 })] }),
  m('comet_roar', 'Comet Roar', 'Dragon', 'spec', 130, 90, 5, { fx: [STAT('self', { spa: -2 })] }),
  m('wyrm_dance', 'Wyrm Dance', 'Dragon', 'status', 0, null, 20, { fx: [STAT('self', { atk: 1, spe: 1 })] }),
  // Dark
  m('chomp', 'Chomp', 'Dark', 'phys', 60, 100, 25, { flags: ['contact', 'bite'], fx: [FLINCH(30)] }),
  m('blindside', 'Blindside', 'Dark', 'phys', 60, null, 20, { flags: CONTACT }),
  m('cheap_shot', 'Cheap Shot', 'Dark', 'phys', 60, 100, 10, { prio: 1, flags: CONTACT }),
  m('mug', 'Mug', 'Dark', 'phys', 65, 100, 20, { flags: CONTACT }),
  m('dusk_slash', 'Dusk Slash', 'Dark', 'phys', 70, 100, 15, { crit: 1, flags: CONTACT }),
  m('crush_bite', 'Crush Bite', 'Dark', 'phys', 80, 100, 15, { flags: ['contact', 'bite'], fx: [STAT('foe', { def: -1 }, 20)] }),
  m('dread_pulse', 'Dread Pulse', 'Dark', 'spec', 80, 100, 15, { fx: [FLINCH(20)] }),
  m('sneer', 'Sneer', 'Dark', 'spec', 55, 95, 15, { flags: ['sound'], fx: [STAT('foe', { spa: -1 })] }),
  m('scheme', 'Scheme', 'Dark', 'status', 0, null, 20, { fx: [STAT('self', { spa: 2 })] }),
  // Steel
  m('iron_claw', 'Iron Claw', 'Steel', 'phys', 50, 95, 35, { flags: CONTACT, fx: [STAT('self', { atk: 1 }, 10)] }),
  m('bolt_jab', 'Bolt Jab', 'Steel', 'phys', 40, 100, 30, { prio: 1, flags: ['contact', 'punch'] }),
  m('steel_fin', 'Steel Fin', 'Steel', 'phys', 70, 90, 25, { flags: CONTACT, fx: [STAT('self', { def: 1 }, 10)] }),
  m('steel_ram', 'Steel Ram', 'Steel', 'phys', 80, 100, 15, { flags: CONTACT, fx: [FLINCH(30)] }),
  m('chrome_beam', 'Chrome Beam', 'Steel', 'spec', 80, 100, 10, { fx: [STAT('foe', { spd: -1 }, 10)] }),
  m('comet_fist', 'Comet Fist', 'Steel', 'phys', 90, 90, 10, { flags: ['contact', 'punch'], fx: [STAT('self', { atk: 1 }, 20)] }),
  m('plate_up', 'Plate Up', 'Steel', 'status', 0, null, 15, { fx: [STAT('self', { def: 2 })] }),
  m('grind_screech', 'Grind Screech', 'Steel', 'status', 0, 85, 40, { flags: ['sound'], fx: [STAT('foe', { spd: -2 })] }),
  // Fairy
  m('glitter_gust', 'Glitter Gust', 'Fairy', 'spec', 40, 100, 30),
  m('sweet_sip', 'Sweet Sip', 'Fairy', 'spec', 50, 100, 10, { flags: CONTACT, fx: [{ k: 'drain', r: 0.75 }] }),
  m('spirit_crack', 'Spirit Crack', 'Fairy', 'phys', 75, 100, 15, { flags: CONTACT, fx: [STAT('foe', { spa: -1 })] }),
  m('dazzle', 'Dazzle', 'Fairy', 'spec', 80, 100, 10),
  m('roughhouse', 'Roughhouse', 'Fairy', 'phys', 90, 90, 10, { flags: CONTACT, fx: [STAT('foe', { atk: -1 }, 10)] }),
  m('lunar_burst', 'Lunar Burst', 'Fairy', 'spec', 95, 100, 15, { fx: [STAT('foe', { spa: -1 }, 30)] }),
  m('doe_eyes', 'Doe Eyes', 'Fairy', 'status', 0, 100, 20, { fx: [STAT('foe', { atk: -2 })] }),
  m('moonbathe', 'Moonbathe', 'Fairy', 'status', 0, null, 5, { fx: [{ k: 'heal', r: 0.5 }] }),
];

/** Used when a battler has no PP left. Typeless, hurts the user. */
export const STRUGGLE = m('struggle', 'Struggle', 'Normal', 'phys', 50, null, 1, { flags: CONTACT, typeless: true, struggle: true });

export const MOVES_BY_ID = new Map(MOVES.map((mv) => [mv.id, mv]));
export function getMove(id) { return id === 'struggle' ? STRUGGLE : MOVES_BY_ID.get(id) || null; }
export function moveFx(mv, kind) { return mv.fx.find((f) => f.k === kind) || null; }
export function isDamaging(mv) { return mv.cat !== 'status'; }

/** Fallback moves any creature can learn, used to pad thin learnsets. */
export const UNIVERSAL_LEARNSET = [[1, 'bump'], [10, 'dash'], [20, 'rake'], [30, 'bellow']];
