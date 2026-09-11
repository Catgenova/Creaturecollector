// Evolution. Every creature reaches its first evolution at level 33 and its final one at 66:
// larger, with its features more pronounced, then exaggerated. The stage is a function of
// level, so a creature grows and shrinks with nothing to store. Art comes from hand-authored
// stage variants on a part (`part.stages[2|3]`) or, for every part without one, from the
// procedural pass in creature/evolve.js driven by the growth table below.
export const STAGE_LEVELS = [1, 33, 66];
export const STAGE_NAMES = { 1: 'Stage 1', 2: 'Stage 2', 3: 'Stage 3' };
export const STAGE_MARK = { 1: '', 2: 'II', 3: 'III' };
/** Whole-creature size multiplier per stage, on top of the part growth. */
export const STAGE_SIZE = { 1: 1, 2: 1.1, 3: 1.22 };

export function stageOf(level) {
  const L = Number(level) || 1;
  return L >= STAGE_LEVELS[2] ? 3 : L >= STAGE_LEVELS[1] ? 2 : 1;
}
export function stageName(stage) { return STAGE_NAMES[stage] || STAGE_NAMES[1]; }

/**
 * Procedural growth per slot family: [sx, sy] scale about the part's attachment point for
 * stages 2 and 3, and whether the part sprouts spikes (stage 2: same colour, stage 3: accent
 * "energy" tips) along its far edge.
 */
export const SLOT_GROWTH = {
  body:  { 2: [1.06, 1.06], 3: [1.12, 1.13] },
  head:  { 2: [1.05, 1.06], 3: [1.1, 1.12] },
  eyes:  { 2: [1.02, 1.02], 3: [1.06, 1.06] },
  face:  { 2: [1.05, 1.05], 3: [1.1, 1.1] },
  limb:  { 2: [1.06, 1.08], 3: [1.12, 1.16] },
  crown: { 2: [1.15, 1.25], 3: [1.35, 1.55], spikes: true },
  tail:  { 2: [1.25, 1.15], 3: [1.55, 1.35], spikes: true },
  wing:  { 2: [1.15, 1.15], 3: [1.35, 1.35], spikes: true },
  fin:   { 2: [1.15, 1.2], 3: [1.35, 1.45], spikes: true },
  fur:   { 2: [1.12, 1.15], 3: [1.28, 1.35], spikes: true },
  flat:  { 2: [1, 1], 3: [1, 1] },
};
export const SLOT_FAMILY = {
  body: 'body', head: 'head', eyes: 'eyes',
  muzzle: 'face', mouth: 'face', jaw: 'face', beak: 'face', mandibles: 'face', face: 'face', throat: 'face',
  legsFront: 'limb', legsBack: 'limb', legsMid: 'limb', legs: 'limb', arms: 'limb',
  ears: 'crown', horns: 'crown', crest: 'crown', antennae: 'crown', crown: 'crown', gills: 'crown', feelers: 'crown', barbels: 'crown',
  tail: 'tail', wings: 'wing',
  dorsal: 'fin', pectoral: 'fin', belly: 'fin', spines: 'fin',
  mane: 'fur', chest: 'fur', back: 'fur', shell: 'fur', skirt: 'fur',
  markings: 'flat', pattern: 'flat', scales: 'flat', glow: 'flat',
  // flora
  leaves: 'fin', roots: 'limb', vines: 'tail', pods: 'fur', thorns: 'crown', canopy: 'fur', bark: 'flat', fruit: 'face',
  // ooze
  core: 'face', pseudopods: 'limb', drips: 'face', tendrils: 'tail', base: 'fur', inclusions: 'flat', sheen: 'flat', bumps: 'fur',
  // fungus
  spores: 'fur', ring: 'face', shelves: 'fur', veil: 'fur',
  // wyrm
  maw: 'face', whiskers: 'crown', plates: 'fur', bands: 'flat',
  // draconic
  breath: 'face',
  // skeletal
  light: 'face', shroud: 'fur', cracks: 'flat',
  // nightwing
  ruff: 'fur', thumbs: 'face',
  // crystalline
  seam: 'flat', facets: 'flat', aura: 'flat',
};
export function growthFor(slot) { return SLOT_GROWTH[SLOT_FAMILY[slot] || 'face']; }
