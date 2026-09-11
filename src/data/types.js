// The classic 18-type chart. Attacker -> defender multipliers.
// Colors are ours; each type also gets a one-letter glyph so type is never color-only.

export const TYPE_LIST = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

export const TYPE_INFO = {
  Normal:   { color: '#a8a290', glyph: 'N' },
  Fire:     { color: '#f0762e', glyph: 'F' },
  Water:    { color: '#4f8ef7', glyph: 'W' },
  Electric: { color: '#f5c518', glyph: 'E' },
  Grass:    { color: '#5fbf4a', glyph: 'G' },
  Ice:      { color: '#7fd6e6', glyph: 'I' },
  Fighting: { color: '#c23b3b', glyph: 'T' },
  Poison:   { color: '#a349b8', glyph: 'P' },
  Ground:   { color: '#d6a95a', glyph: 'R' },
  Flying:   { color: '#9aa8f0', glyph: 'Y' },
  Psychic:  { color: '#f26aa3', glyph: 'S' },
  Bug:      { color: '#9fb52a', glyph: 'B' },
  Rock:     { color: '#b09a5c', glyph: 'K' },
  Ghost:    { color: '#6d5aa6', glyph: 'H' },
  Dragon:   { color: '#6a4de8', glyph: 'D' },
  Dark:     { color: '#5b4a42', glyph: 'A' },
  Steel:    { color: '#9fa6b8', glyph: 'M' },
  Fairy:    { color: '#f096b8', glyph: 'X' },
};

// se = super effective (2x), nve = not very effective (0.5x), imm = immune (0x)
const RULES = {
  Normal:   { nve: ['Rock', 'Steel'], imm: ['Ghost'] },
  Fire:     { se: ['Grass', 'Ice', 'Bug', 'Steel'], nve: ['Fire', 'Water', 'Rock', 'Dragon'] },
  Water:    { se: ['Fire', 'Ground', 'Rock'], nve: ['Water', 'Grass', 'Dragon'] },
  Electric: { se: ['Water', 'Flying'], nve: ['Electric', 'Grass', 'Dragon'], imm: ['Ground'] },
  Grass:    { se: ['Water', 'Ground', 'Rock'], nve: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'] },
  Ice:      { se: ['Grass', 'Ground', 'Flying', 'Dragon'], nve: ['Fire', 'Water', 'Ice', 'Steel'] },
  Fighting: { se: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], nve: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], imm: ['Ghost'] },
  Poison:   { se: ['Grass', 'Fairy'], nve: ['Poison', 'Ground', 'Rock', 'Ghost'], imm: ['Steel'] },
  Ground:   { se: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], nve: ['Grass', 'Bug'], imm: ['Flying'] },
  Flying:   { se: ['Grass', 'Fighting', 'Bug'], nve: ['Electric', 'Rock', 'Steel'] },
  Psychic:  { se: ['Fighting', 'Poison'], nve: ['Psychic', 'Steel'], imm: ['Dark'] },
  Bug:      { se: ['Grass', 'Psychic', 'Dark'], nve: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'] },
  Rock:     { se: ['Fire', 'Ice', 'Flying', 'Bug'], nve: ['Fighting', 'Ground', 'Steel'] },
  Ghost:    { se: ['Psychic', 'Ghost'], nve: ['Dark'], imm: ['Normal'] },
  Dragon:   { se: ['Dragon'], nve: ['Steel'], imm: ['Fairy'] },
  Dark:     { se: ['Psychic', 'Ghost'], nve: ['Fighting', 'Dark', 'Fairy'] },
  Steel:    { se: ['Ice', 'Rock', 'Fairy'], nve: ['Fire', 'Water', 'Electric', 'Steel'] },
  Fairy:    { se: ['Fighting', 'Dragon', 'Dark'], nve: ['Fire', 'Poison', 'Steel'] },
};

/** Multiplier for a single attacking type against a single defending type. */
export function typeMultiplier(attacker, defender) {
  const r = RULES[attacker];
  if (!r) return 1;
  if (r.imm && r.imm.includes(defender)) return 0;
  if (r.se && r.se.includes(defender)) return 2;
  if (r.nve && r.nve.includes(defender)) return 0.5;
  return 1;
}

/** Multiplier against a creature with one or two types (second may be null). */
export function typeEffectiveness(attacker, defenderTypes) {
  let m = 1;
  for (const t of defenderTypes) if (t) m *= typeMultiplier(attacker, t);
  return m;
}

export function isType(t) { return TYPE_LIST.includes(t); }
