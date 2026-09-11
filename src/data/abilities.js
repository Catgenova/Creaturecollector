// Passive abilities. The engine implements behaviour by id; this table holds names and text.
export const ABILITIES = {
  ember_heart: { name: 'Ember Heart', desc: 'Fire moves hit 1.5x harder when HP is a third or less.' },
  tide_heart: { name: 'Tide Heart', desc: 'Water moves hit 1.5x harder when HP is a third or less.' },
  bloom_heart: { name: 'Bloom Heart', desc: 'Grass moves hit 1.5x harder when HP is a third or less.' },
  stonewall: { name: 'Stonewall', desc: 'Survives any single hit from full HP with 1 HP left.' },
  menace: { name: 'Menace', desc: 'Lowers the foe’s Attack on entry.' },
  momentum: { name: 'Momentum', desc: 'Speed rises at the end of every turn.' },
  blubber: { name: 'Blubber', desc: 'Takes half damage from Fire and Ice moves.' },
  hover: { name: 'Hover', desc: 'Immune to Ground moves.' },
  second_wind: { name: 'Second Wind', desc: 'Restores a third of max HP when switched out.' },
  grit: { name: 'Grit', desc: 'Attack is 1.5x while statused, and burns do not weaken it.' },
  thorn_hide: { name: 'Thorn Hide', desc: 'Attackers that make contact lose an eighth of their HP.' },
  live_fur: { name: 'Live Fur', desc: 'Contact has a 30% chance to paralyze the attacker.' },
  hot_blooded: { name: 'Hot Blooded', desc: 'Contact has a 30% chance to burn the attacker.' },
  venom_barbs: { name: 'Venom Barbs', desc: 'Contact has a 30% chance to poison the attacker.' },
  sponge: { name: 'Sponge', desc: 'Water moves heal a quarter of max HP instead of damaging.' },
  capacitor: { name: 'Capacitor', desc: 'Electric moves heal a quarter of max HP instead of damaging.' },
  purebred: { name: 'Purebred', desc: 'Same-type moves get a 2x bonus instead of 1.5x.' },
  finesse: { name: 'Finesse', desc: 'Moves with 60 power or less hit 1.5x harder.' },
  hawkeye: { name: 'Hawkeye', desc: 'Accuracy cannot be lowered.' },
  restless: { name: 'Restless', desc: 'Cannot fall asleep.' },
  antitoxin: { name: 'Antitoxin', desc: 'Cannot be poisoned.' },
  loose_joints: { name: 'Loose Joints', desc: 'Cannot be paralyzed.' },
  warm_core: { name: 'Warm Core', desc: 'Cannot be frozen.' },
  damp_coat: { name: 'Damp Coat', desc: 'Cannot be burned.' },
  heavy_hands: { name: 'Heavy Hands', desc: 'Punching moves hit 1.2x harder.' },
  vice_jaw: { name: 'Vice Jaw', desc: 'Biting moves hit 1.5x harder.' },
  swagger: { name: 'Swagger', desc: 'Attack rises after knocking out a foe.' },
  thick_skull: { name: 'Thick Skull', desc: 'Takes no recoil damage.' },
  daredevil: { name: 'Daredevil', desc: 'Recoil moves hit 1.2x harder.' },
  lucky_streak: { name: 'Lucky Streak', desc: 'Secondary effects are twice as likely.' },
};

export const ABILITY_IDS = Object.keys(ABILITIES);
export function getAbility(id) { return ABILITIES[id] || null; }
export function abilityName(id) { const a = ABILITIES[id]; return a ? a.name : 'None'; }
