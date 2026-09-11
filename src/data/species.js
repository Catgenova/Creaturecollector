// Base species: recipes of parts, a palette, trait ranges and stat weights.
// Recipe entries are a part id, or [expressed, carried] to give the species a
// hidden recessive allele that fusion can bring back out.
// Palette colours are [hue, saturation, lightness]. c1 = primary, c2 = secondary, c3 = accent.

const T = (size, head, limb, tail, wing, eye) => ({
  size, bulk: [0.35, 0.65], headScale: head, limbScale: limb, tailScale: tail, wingScale: wing, eyeScale: eye,
});
const MID = [0.35, 0.65];

export const SPECIES = [
  {
    id: 'pufflet', name: 'Pufflet', types: ['Normal'], tier: 'common', bst: 385,
    stats: { hp: 0.2, atk: 0.16, def: 0.16, spa: 0.14, spd: 0.16, spe: 0.18 },
    recipe: { body: 'body.round', head: 'head.round', eyes: 'eye.round', mouth: 'mouth.smile', crown: ['crown.catears', 'crown.bunny'], legs: 'legs.stub', arms: 'arms.none', wings: 'wings.none', tail: 'tails.stubby', back: 'back.none', pattern: 'pat.belly' },
    palette: { c1: [38, 45, 72], c2: [36, 40, 88], c3: [350, 60, 72], eye: [205, 35, 28] }, vary: { h: 10, s: 8, l: 6 },
    traits: T([0.3, 0.55], MID, [0.3, 0.5], MID, MID, [0.5, 0.8]),
    desc: 'A soft, round creature that puffs up when startled. Happiest in a warm pocket.',
  },
  {
    id: 'emberox', name: 'Emberox', types: ['Fire'], tier: 'common', bst: 405,
    stats: { hp: 0.14, atk: 0.19, def: 0.13, spa: 0.2, spd: 0.13, spe: 0.21 },
    recipe: { body: 'body.quad', head: 'head.snout', eyes: 'eye.angry', mouth: 'mouth.fangs', crown: ['crown.catears', 'crown.horns'], legs: 'legs.canine', arms: 'arms.none', wings: ['wings.none', 'wings.fire'], tail: 'tails.flame', back: 'back.none', pattern: 'pat.saddle' },
    palette: { c1: [22, 88, 52], c2: [40, 95, 58], c3: [8, 88, 52], eye: [48, 95, 55] }, vary: { h: 8, s: 6, l: 6 },
    traits: T([0.4, 0.7], MID, [0.45, 0.7], [0.6, 0.9], MID, MID),
    desc: 'Its tail flame burns hotter the more it wants to impress. Kicks up sparks when it runs.',
  },
  {
    id: 'finnip', name: 'Finnip', types: ['Water'], tier: 'common', bst: 395,
    stats: { hp: 0.16, atk: 0.14, def: 0.17, spa: 0.19, spd: 0.18, spe: 0.16 },
    recipe: { body: 'body.fish', head: 'head.none', eyes: 'eye.big', mouth: 'mouth.open', crown: 'crown.fin', legs: 'legs.none', arms: 'arms.fin', wings: 'wings.none', tail: 'tails.fish', back: 'back.fin', pattern: 'pat.stripes' },
    palette: { c1: [205, 80, 54], c2: [190, 70, 72], c3: [28, 90, 62], eye: [42, 90, 50] }, vary: { h: 10, s: 6, l: 6 },
    traits: T([0.35, 0.6], MID, MID, [0.5, 0.8], MID, [0.5, 0.8]),
    desc: 'Swims through air as easily as water by beating its fins very fast. Curious about shiny things.',
  },
  {
    id: 'sprigget', name: 'Sprigget', types: ['Grass'], tier: 'common', bst: 395,
    stats: { hp: 0.18, atk: 0.15, def: 0.18, spa: 0.17, spd: 0.18, spe: 0.14 },
    recipe: { body: 'body.biped', head: 'head.bulb', eyes: 'eye.round', mouth: 'mouth.smile', crown: 'crown.sprout', legs: 'legs.stub', arms: 'arms.stub', wings: ['wings.none', 'wings.leaf'], tail: 'tails.leaf', back: 'back.none', pattern: 'pat.spots' },
    palette: { c1: [110, 45, 48], c2: [95, 55, 66], c3: [98, 55, 40], eye: [22, 60, 30] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.3, 0.6], [0.5, 0.75], [0.3, 0.55], MID, MID, [0.5, 0.75]),
    desc: 'The sprout on its head leans toward sunlight. It naps in flowerbeds and wakes covered in pollen.',
  },
  {
    id: 'voltmite', name: 'Voltmite', types: ['Electric'], tier: 'common', bst: 400,
    stats: { hp: 0.13, atk: 0.16, def: 0.12, spa: 0.21, spd: 0.14, spe: 0.24 },
    recipe: { body: 'body.round', head: 'head.none', eyes: 'eye.big', mouth: 'mouth.grin', crown: 'crown.bolts', legs: 'legs.stub', arms: 'arms.stub', wings: 'wings.none', tail: 'tails.whip', back: ['back.none', 'back.bolts'], pattern: 'pat.stripes' },
    palette: { c1: [50, 95, 58], c2: [222, 15, 22], c3: [30, 95, 55], eye: [222, 40, 22] }, vary: { h: 6, s: 5, l: 6 },
    traits: T([0.25, 0.5], MID, [0.3, 0.5], [0.5, 0.8], MID, [0.6, 0.9]),
    desc: 'Static crackles in its fur. It clings to power lines and hums along with them.',
  },
  {
    id: 'glacub', name: 'Glacub', types: ['Ice'], tier: 'uncommon', bst: 420,
    stats: { hp: 0.2, atk: 0.18, def: 0.17, spa: 0.14, spd: 0.17, spe: 0.14 },
    recipe: { body: 'body.biped', head: 'head.round', eyes: 'eye.sleepy', mouth: 'mouth.flat', crown: 'crown.catears', legs: 'legs.chunky', arms: 'arms.paw', wings: 'wings.none', tail: 'tails.stubby', back: ['back.none', 'back.crystal'], pattern: 'pat.belly' },
    palette: { c1: [196, 55, 80], c2: [200, 30, 95], c3: [210, 60, 62], eye: [222, 50, 35] }, vary: { h: 8, s: 8, l: 5 },
    traits: T([0.5, 0.8], [0.45, 0.65], [0.4, 0.6], [0.3, 0.5], MID, [0.4, 0.6]),
    desc: 'Sleeps through blizzards. Its breath leaves frost on anything it sniffs.',
  },
  {
    id: 'bruxor', name: 'Bruxor', types: ['Fighting'], tier: 'uncommon', bst: 430,
    stats: { hp: 0.17, atk: 0.25, def: 0.18, spa: 0.08, spd: 0.14, spe: 0.18 },
    recipe: { body: 'body.biped', head: 'head.block', eyes: 'eye.angry', mouth: 'mouth.frown', crown: ['crown.horns', 'crown.mohawk'], legs: 'legs.chunky', arms: 'arms.claw', wings: 'wings.none', tail: 'tail.none', back: 'back.none', pattern: 'pat.chest' },
    palette: { c1: [15, 55, 46], c2: [30, 45, 70], c3: [40, 30, 88], eye: [10, 80, 40] }, vary: { h: 8, s: 8, l: 6 },
    traits: T([0.55, 0.85], [0.4, 0.6], [0.5, 0.75], MID, MID, [0.3, 0.5]),
    desc: 'Headbutts boulders to keep its horns sharp. Loyal to whoever beats it fairly.',
  },
  {
    id: 'slugmire', name: 'Slugmire', types: ['Poison'], tier: 'common', bst: 390,
    stats: { hp: 0.19, atk: 0.14, def: 0.15, spa: 0.18, spd: 0.2, spe: 0.14 },
    recipe: { body: 'body.serpent', head: 'head.bulb', eyes: 'eye.slit', mouth: 'mouth.tongue', crown: 'crown.antennae', legs: 'legs.none', arms: 'arms.none', wings: 'wings.none', tail: 'tails.whip', back: ['back.none', 'back.spikes'], pattern: 'pat.spots' },
    palette: { c1: [280, 50, 46], c2: [95, 60, 52], c3: [305, 70, 66], eye: [95, 90, 55] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.35, 0.65], [0.4, 0.6], MID, [0.5, 0.8], MID, [0.5, 0.75]),
    desc: 'Leaves a faintly glowing trail. Gardeners both dread and admire it.',
  },
  {
    id: 'dustoat', name: 'Dustoat', types: ['Ground'], tier: 'common', bst: 400,
    stats: { hp: 0.18, atk: 0.2, def: 0.2, spa: 0.1, spd: 0.16, spe: 0.16 },
    recipe: { body: 'body.quad', head: 'head.snout', eyes: 'eye.dot', mouth: 'mouth.flat', crown: ['crown.none', 'crown.horns'], legs: 'legs.hoof', arms: 'arms.none', wings: 'wings.none', tail: 'tails.whip', back: 'back.none', pattern: 'pat.saddle' },
    palette: { c1: [32, 45, 50], c2: [40, 50, 76], c3: [25, 35, 30], eye: [30, 60, 25] }, vary: { h: 8, s: 8, l: 6 },
    traits: T([0.45, 0.75], MID, [0.4, 0.6], [0.3, 0.5], MID, [0.3, 0.5]),
    desc: 'Digs shallow burrows and forgets where they are. Its hooves never seem to get dirty.',
  },
  {
    id: 'zephyrn', name: 'Zephyrn', types: ['Flying'], tier: 'common', bst: 395,
    stats: { hp: 0.14, atk: 0.17, def: 0.12, spa: 0.16, spd: 0.13, spe: 0.28 },
    recipe: { body: 'body.bird', head: 'head.beak', eyes: 'eye.round', mouth: 'mouth.none', crown: 'crown.crest', legs: 'legs.bird', arms: 'arms.none', wings: 'wings.feather', tail: 'tails.feathers', back: 'back.none', pattern: 'pat.belly' },
    palette: { c1: [210, 70, 72], c2: [200, 20, 96], c3: [40, 90, 58], eye: [222, 60, 25] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.3, 0.6], MID, [0.4, 0.6], MID, [0.55, 0.85], MID),
    desc: 'Rides thermals for hours without a single flap. Whistles at travellers to show them the way.',
  },
  {
    id: 'mystril', name: 'Mystril', types: ['Psychic'], tier: 'uncommon', bst: 440,
    stats: { hp: 0.14, atk: 0.08, def: 0.13, spa: 0.26, spd: 0.21, spe: 0.18 },
    recipe: { body: 'body.float', head: 'head.none', eyes: 'eye.big', mouth: 'mouth.smile', crown: ['crown.antennae', 'crown.halo'], legs: 'legs.none', arms: 'arms.none', wings: 'wings.none', tail: 'tails.curl', back: 'back.wisps', pattern: 'pat.spots' },
    palette: { c1: [320, 60, 68], c2: [270, 50, 62], c3: [48, 90, 62], eye: [200, 70, 50] }, vary: { h: 14, s: 8, l: 6 },
    traits: T([0.35, 0.6], MID, MID, [0.5, 0.8], MID, [0.6, 0.9]),
    desc: 'Hovers a hand-width above the ground and always seems to be listening to something far away.',
  },
  {
    id: 'chitterbug', name: 'Chitterbug', types: ['Bug'], tier: 'common', bst: 380,
    stats: { hp: 0.16, atk: 0.18, def: 0.17, spa: 0.12, spd: 0.15, spe: 0.22 },
    recipe: { body: 'body.round', head: 'head.round', eyes: 'eye.bug', mouth: 'mouth.fangs', crown: 'crown.antennae', legs: 'legs.insect', arms: 'arms.none', wings: 'wings.bug', tail: 'tail.none', back: 'back.plates', pattern: 'pat.stripes' },
    palette: { c1: [95, 50, 42], c2: [222, 10, 18], c3: [50, 90, 55], eye: [0, 0, 12] }, vary: { h: 14, s: 8, l: 6 },
    traits: T([0.25, 0.5], [0.4, 0.6], [0.4, 0.7], MID, [0.4, 0.7], [0.5, 0.8]),
    desc: 'Chatters constantly by rubbing its plates together. Swarms are loud enough to hear from the next valley.',
  },
  {
    id: 'craggon', name: 'Craggon', types: ['Rock'], tier: 'uncommon', bst: 430,
    stats: { hp: 0.17, atk: 0.21, def: 0.27, spa: 0.08, spd: 0.15, spe: 0.12 },
    recipe: { body: 'body.biped', head: 'head.block', eyes: 'eye.dot', mouth: 'mouth.flat', crown: 'crown.spikes', legs: 'legs.chunky', arms: 'arms.claw', wings: 'wings.none', tail: 'tails.club', back: ['back.plates', 'back.crystal'], pattern: 'pat.scales' },
    palette: { c1: [30, 15, 50], c2: [30, 12, 36], c3: [32, 22, 68], eye: [45, 80, 50] }, vary: { h: 10, s: 6, l: 6 },
    traits: T([0.5, 0.85], [0.4, 0.6], [0.4, 0.6], [0.5, 0.75], MID, [0.3, 0.5]),
    desc: 'Mistaken for a boulder until it yawns. Lichen grows on the ones that sit still longest.',
  },
  {
    id: 'phantoom', name: 'Phantoom', types: ['Ghost'], tier: 'uncommon', bst: 425,
    stats: { hp: 0.13, atk: 0.1, def: 0.14, spa: 0.24, spd: 0.2, spe: 0.19 },
    recipe: { body: 'body.float', head: 'head.none', eyes: 'eye.sleepy', mouth: 'mouth.grin', crown: ['crown.none', 'crown.halo'], legs: 'legs.none', arms: 'arms.stub', wings: 'wings.none', tail: 'tail.none', back: 'back.wisps', pattern: 'pattern.none' },
    palette: { c1: [255, 40, 42], c2: [250, 30, 72], c3: [180, 60, 70], eye: [180, 80, 60] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.35, 0.65], MID, MID, MID, MID, [0.5, 0.8]),
    desc: 'Drifts through walls when it forgets they are there. Giggles in empty rooms.',
  },
  {
    id: 'drakelet', name: 'Drakelet', types: ['Dragon'], tier: 'rare', bst: 480,
    stats: { hp: 0.17, atk: 0.21, def: 0.16, spa: 0.18, spd: 0.14, spe: 0.14 },
    recipe: { body: 'body.quad', head: 'head.long', eyes: 'eye.slit', mouth: 'mouth.fangs', crown: 'crown.horns', legs: 'legs.chunky', arms: 'arms.none', wings: 'wings.bat', tail: ['tails.whip', 'tails.club'], back: 'back.spikes', pattern: 'pat.gradient' },
    palette: { c1: [175, 55, 40], c2: [25, 80, 58], c3: [45, 70, 76], eye: [40, 90, 50] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.5, 0.8], MID, [0.45, 0.7], [0.5, 0.8], [0.5, 0.8], [0.3, 0.5]),
    desc: 'A young dragon that hoards pebbles and sleeps on them. Its wings are still too small to carry it far.',
  },
  {
    id: 'nyxcat', name: 'Nyxcat', types: ['Dark'], tier: 'uncommon', bst: 425,
    stats: { hp: 0.14, atk: 0.21, def: 0.13, spa: 0.15, spd: 0.13, spe: 0.24 },
    recipe: { body: 'body.quad', head: 'head.cat', eyes: 'eye.slit', mouth: 'mouth.smirk', crown: 'crown.catears', legs: 'legs.canine', arms: 'arms.none', wings: 'wings.none', tail: ['tails.curl', 'tails.spade'], back: 'back.none', pattern: 'pattern.none' },
    palette: { c1: [262, 22, 22], c2: [270, 30, 45], c3: [45, 90, 60], eye: [50, 95, 55] }, vary: { h: 12, s: 8, l: 5 },
    traits: T([0.35, 0.6], MID, [0.5, 0.75], [0.6, 0.9], MID, [0.5, 0.8]),
    desc: 'Only ever seen out of the corner of the eye. Steals one sock, never the pair.',
  },
  {
    id: 'boltmaw', name: 'Boltmaw', types: ['Steel'], tier: 'rare', bst: 470,
    stats: { hp: 0.16, atk: 0.22, def: 0.26, spa: 0.1, spd: 0.16, spe: 0.1 },
    recipe: { body: 'body.biped', head: 'head.skull', eyes: 'eye.dot', mouth: 'mouth.teeth', crown: 'crown.spikes', legs: 'legs.peg', arms: ['arms.claw', 'arms.blade'], wings: 'wings.none', tail: 'tails.club', back: 'back.plates', pattern: 'pat.bands' },
    palette: { c1: [220, 12, 62], c2: [220, 15, 40], c3: [200, 60, 55], eye: [0, 90, 52] }, vary: { h: 8, s: 5, l: 6 },
    traits: T([0.5, 0.8], MID, [0.4, 0.6], [0.4, 0.6], MID, [0.3, 0.5]),
    desc: 'Nobody knows whether it was built or born. It sharpens its teeth on rusty nails.',
  },
  {
    id: 'twinklet', name: 'Twinklet', types: ['Fairy'], tier: 'common', bst: 400,
    stats: { hp: 0.17, atk: 0.1, def: 0.15, spa: 0.22, spd: 0.21, spe: 0.15 },
    recipe: { body: 'body.round', head: 'head.bulb', eyes: 'eye.big', mouth: 'mouth.smile', crown: 'crown.bunny', legs: 'legs.stub', arms: 'arms.stub', wings: 'wings.bug', tail: 'tails.fluffy', back: 'back.none', pattern: 'pat.speckle' },
    palette: { c1: [335, 75, 78], c2: [330, 30, 97], c3: [48, 90, 66], eye: [200, 70, 55] }, vary: { h: 12, s: 8, l: 5 },
    traits: T([0.25, 0.5], [0.5, 0.75], [0.3, 0.5], MID, [0.4, 0.7], [0.6, 0.9]),
    desc: 'Sheds glitter when happy, which is nearly always. Impossible to stay angry at.',
  },
  // Dual-typed species
  {
    id: 'moltrix', name: 'Moltrix', types: ['Fire', 'Flying'], tier: 'uncommon', bst: 445,
    stats: { hp: 0.14, atk: 0.18, def: 0.12, spa: 0.22, spd: 0.12, spe: 0.22 },
    recipe: { body: 'body.bird', head: 'head.beak', eyes: 'eye.angry', mouth: 'mouth.none', crown: 'crown.crest', legs: 'legs.bird', arms: 'arms.none', wings: 'wings.fire', tail: 'tails.feathers', back: 'back.none', pattern: 'pat.gradient' },
    palette: { c1: [18, 85, 50], c2: [40, 95, 60], c3: [48, 95, 58], eye: [48, 95, 55] }, vary: { h: 8, s: 6, l: 6 },
    traits: T([0.4, 0.7], MID, [0.4, 0.6], [0.5, 0.8], [0.6, 0.9], MID),
    desc: 'Its wingbeats leave trails of embers. Nests on chimney tops in winter.',
  },
  {
    id: 'tidalisk', name: 'Tidalisk', types: ['Water', 'Dragon'], tier: 'rare', bst: 490,
    stats: { hp: 0.18, atk: 0.17, def: 0.17, spa: 0.2, spd: 0.15, spe: 0.13 },
    recipe: { body: 'body.serpent', head: 'head.long', eyes: 'eye.slit', mouth: 'mouth.fangs', crown: 'crown.fin', legs: 'legs.none', arms: 'arms.none', wings: 'wings.fin', tail: 'tails.fish', back: 'back.fin', pattern: 'pat.scales' },
    palette: { c1: [200, 65, 42], c2: [185, 60, 68], c3: [165, 70, 60], eye: [45, 90, 55] }, vary: { h: 10, s: 6, l: 6 },
    traits: T([0.55, 0.85], MID, MID, [0.5, 0.8], [0.4, 0.7], [0.3, 0.5]),
    desc: 'Coils around harbour posts during storms. Sailors leave it fish and it leaves them alone.',
  },
  {
    id: 'mossbrute', name: 'Mossbrute', types: ['Grass', 'Fighting'], tier: 'uncommon', bst: 440,
    stats: { hp: 0.19, atk: 0.23, def: 0.2, spa: 0.1, spd: 0.16, spe: 0.12 },
    recipe: { body: 'body.biped', head: 'head.block', eyes: 'eye.angry', mouth: 'mouth.frown', crown: 'crown.sprout', legs: 'legs.chunky', arms: 'arms.claw', wings: 'wings.none', tail: 'tails.stubby', back: 'back.leaf', pattern: 'pat.spots' },
    palette: { c1: [100, 35, 40], c2: [80, 45, 55], c3: [95, 55, 62], eye: [40, 80, 50] }, vary: { h: 10, s: 8, l: 6 },
    traits: T([0.55, 0.85], [0.4, 0.6], [0.5, 0.75], [0.3, 0.5], MID, [0.3, 0.5]),
    desc: 'Moss grows thick on its shoulders. It uproots trees to practise its throws, then replants them.',
  },
  {
    id: 'gloamoth', name: 'Gloamoth', types: ['Bug', 'Ghost'], tier: 'uncommon', bst: 430,
    stats: { hp: 0.14, atk: 0.12, def: 0.12, spa: 0.22, spd: 0.18, spe: 0.22 },
    recipe: { body: 'body.float', head: 'head.none', eyes: 'eye.bug', mouth: 'mouth.flat', crown: 'crown.antennae', legs: 'legs.none', arms: 'arms.none', wings: 'wings.bug', tail: 'tail.none', back: 'back.wisps', pattern: 'pat.speckle' },
    palette: { c1: [250, 30, 38], c2: [260, 25, 60], c3: [170, 60, 68], eye: [170, 80, 65] }, vary: { h: 12, s: 8, l: 6 },
    traits: T([0.3, 0.6], MID, MID, MID, [0.6, 0.9], [0.5, 0.8]),
    desc: 'Drawn to lanterns, but the light passes straight through it. Dust from its wings causes vivid dreams.',
  },
];

export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

export const TIER_WEIGHT = { common: 1, uncommon: 0.55, rare: 0.25 };
