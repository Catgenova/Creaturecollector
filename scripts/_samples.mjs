// Sample creatures for art review, built straight from part ids (no species needed).
import { validateGenome } from '../src/creature/genome.js';
import { getRig } from '../src/data/rigs.js';
import { getPart } from '../src/data/parts/index.js';

const GREY = { c1: [222, 10, 64], c2: [222, 12, 46], c3: [28, 80, 58], eye: [200, 55, 45] };

/** A creature on `rig` using `archetype` for every anatomical slot, with overrides. */
export function sampleGenome(name, rig, archetype, palette = GREY, over = {}, traits = {}) {
  const r = getRig(rig);
  const parts = {};
  for (const slot of r.slots) {
    const want = `${r.prefix}${slot}.${archetype}`;
    parts[slot] = r.required.includes(slot) ? (getPart(want) ? want : r.mannequin.parts[slot]) : `${r.prefix}${slot}.none`;
  }
  Object.assign(parts, over);
  const g = {
    v: 1, seed: `sample-${name}`, species: null, clade: rig, rig, name, nameParts: [name.slice(0, 3), name.slice(3)], gen: 0, shiny: false,
    types: ['Normal', null], parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, [v, v]])), paint: {}, palette,
    traits: { size: 0.7, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: 0.5, ...traits },
    stats: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }, vigor: {}, bst: 400, lineage: [], learnset: [], ability: 'lucky_streak',
  };
  return validateGenome(g);
}

/** Named presets: archetype samples per rig with fitting palettes and accessories. */
export const PRESETS = {
  fox: ['mammal', 'fox', { c1: [24, 85, 55], c2: [38, 50, 92], c3: [20, 20, 16], eye: [38, 90, 45] }, { markings: 'm.markings.belly', mane: 'm.mane.fox', eyes: 'm.eyes.almond' }],
  cat: ['mammal', 'cat', { c1: [230, 12, 40], c2: [40, 30, 92], c3: [350, 60, 72], eye: [90, 70, 45] }, { eyes: 'm.eyes.slit', mane: 'm.mane.cat' }],
  bear: ['mammal', 'bear', { c1: [26, 45, 34], c2: [30, 40, 62], c3: [20, 30, 20], eye: [30, 40, 25] }, { eyes: 'm.eyes.bead', markings: 'm.markings.belly' }],
  rabbit: ['mammal', 'rabbit', { c1: [30, 30, 80], c2: [30, 30, 95], c3: [345, 60, 78], eye: [200, 50, 40] }, { eyes: 'm.eyes.doe', mane: 'm.mane.rabbit', markings: 'm.markings.belly' }],
  deer: ['mammal', 'deer', { c1: [30, 55, 52], c2: [36, 45, 88], c3: [26, 30, 30], eye: [25, 60, 25] }, { eyes: 'm.eyes.doe', mane: 'm.mane.deer', horns: 'm.horns.antlers', markings: 'm.markings.spots' }],
  wolf: ['mammal', 'wolf', { c1: [215, 12, 48], c2: [215, 10, 82], c3: [215, 14, 30], eye: [48, 90, 50] }, { eyes: 'm.eyes.fierce', mane: 'm.mane.wolf', markings: 'm.markings.belly' }],
  mouse: ['mammal', 'mouse', { c1: [40, 30, 66], c2: [40, 30, 90], c3: [350, 70, 78], eye: [220, 30, 15] }, { eyes: 'm.eyes.bead', mane: 'm.mane.mouse' }],
  lizard: ['reptile', 'lizard', { c1: [95, 45, 42], c2: [70, 50, 78], c3: [35, 70, 55], eye: [45, 90, 50] }, { scales: 'r.scales.bands' }],
  croc: ['reptile', 'croc', { c1: [110, 30, 32], c2: [70, 30, 72], c3: [110, 25, 22], eye: [50, 90, 55] }, { back: 'r.back.ridge', scales: 'r.scales.scutes' }],
  turtle: ['reptile', 'turtle', { c1: [120, 35, 34], c2: [60, 40, 62], c3: [45, 40, 40], eye: [30, 60, 30] }, { eyes: 'r.eyes.bead', jaw: 'r.jaw.beak', scales: 'r.scales.hex' }],
  dragon: ['reptile', 'dragon', { c1: [0, 65, 45], c2: [40, 80, 70], c3: [20, 20, 20], eye: [50, 90, 55] }, { eyes: 'r.eyes.slit', jaw: 'r.jaw.fangs', crest: 'r.crest.horns', back: 'r.back.spines', wings: 'r.wings.dragon', scales: 'r.scales.belly' }],
  serpent: ['reptile', 'serpent', { c1: [275, 40, 40], c2: [50, 80, 70], c3: [280, 30, 15], eye: [0, 80, 50] }, { head: 'r.head.cobra', jaw: 'r.jaw.tongue', eyes: 'r.eyes.slit', tail: 'r.tail.rattle', scales: 'r.scales.diamonds' }],
  chameleon: ['reptile', 'chameleon', { c1: [150, 45, 42], c2: [80, 55, 68], c3: [190, 50, 50], eye: [40, 90, 55] }, { eyes: 'r.eyes.turret', jaw: 'r.jaw.smirk', tail: 'r.tail.curl', throat: 'r.throat.pouch', scales: 'r.scales.spots' }],
  fishround: ['fish', 'round', { c1: [205, 80, 54], c2: [190, 70, 78], c3: [28, 90, 62], eye: [42, 90, 50] }, { belly: 'f.belly.pelvic', gills: 'f.gills.plate', pattern: 'f.pattern.stripes' }],
  betta: ['fish', 'betta', { c1: [330, 60, 60], c2: [200, 60, 80], c3: [50, 80, 70], eye: [200, 70, 45] }, { eyes: 'f.eyes.wide', mouth: 'f.mouth.smile', dorsal: 'f.dorsal.flowing', pectoral: 'f.pectoral.flowing', tail: 'f.tail.flowing', belly: 'f.belly.flowing', gills: 'f.gills.plate', pattern: 'f.pattern.gradient' }],
  shark: ['fish', 'shark', { c1: [210, 25, 50], c2: [210, 20, 88], c3: [210, 30, 28], eye: [50, 90, 55] }, { eyes: 'f.eyes.fierce', mouth: 'f.mouth.grin', dorsal: 'f.dorsal.shark', pectoral: 'f.pectoral.pointed', tail: 'f.tail.shark', belly: 'f.belly.pelvic', gills: 'f.gills.slits', pattern: 'f.pattern.belly' }],
  angler: ['fish', 'angler', { c1: [265, 35, 30], c2: [190, 70, 60], c3: [170, 90, 62], eye: [180, 90, 70] }, { eyes: 'f.eyes.deadeye', mouth: 'f.mouth.fangs', dorsal: 'f.dorsal.spiky', pectoral: 'f.pectoral.tiny', tail: 'f.tail.fan', belly: 'f.belly.tiny', crest: 'f.crest.lure', pattern: 'f.pattern.glow' }],
  puffer: ['fish', 'puffer', { c1: [50, 60, 60], c2: [48, 50, 88], c3: [30, 40, 30], eye: [200, 60, 40] }, { eyes: 'f.eyes.wide', dorsal: 'f.dorsal.crest', pectoral: 'f.pectoral.tiny', tail: 'f.tail.fan', belly: 'f.belly.tiny', spines: 'f.spines.puffer', pattern: 'f.pattern.spots' }],
  seahorse: ['fish', 'seahorse', { c1: [30, 85, 58], c2: [45, 80, 82], c3: [15, 70, 40], eye: [200, 60, 40] }, { dorsal: 'f.dorsal.crest', pectoral: 'f.pectoral.tiny', tail: 'f.tail.curl', crest: 'f.crest.coronet', gills: 'f.gills.plate', spines: 'f.spines.armour', pattern: 'f.pattern.scales' }],
  eel: ['fish', 'eel', { c1: [55, 85, 55], c2: [50, 70, 85], c3: [230, 40, 25], eye: [220, 30, 15] }, { eyes: 'f.eyes.bead', mouth: 'f.mouth.grin', dorsal: 'f.dorsal.ribbon', pectoral: 'f.pectoral.tiny', tail: 'f.tail.eel', belly: 'f.belly.ribbon', gills: 'f.gills.slits', pattern: 'f.pattern.stripes' }],
  songbird: ['bird', 'songbird', { c1: [210, 70, 68], c2: [200, 20, 96], c3: [40, 90, 58], eye: [222, 60, 25] }, { head: 'b.head.round', eyes: 'b.eyes.bead', beak: 'b.beak.short', wings: 'b.wings.rounded', tail: 'b.tail.fan', legs: 'b.legs.thin', face: 'b.face.cheeks', pattern: 'b.pattern.belly' }],
  owl: ['bird', 'owl', { c1: [35, 35, 55], c2: [40, 35, 88], c3: [30, 40, 32], eye: [48, 100, 60] }, { head: 'b.head.owl', eyes: 'b.eyes.big', beak: 'b.beak.hooked', crest: 'b.crest.eartufts', face: 'b.face.disc', wings: 'b.wings.rounded', tail: 'b.tail.fan', legs: 'b.legs.feathered', pattern: 'b.pattern.bars' }],
  hawk: ['bird', 'hawk', { c1: [25, 40, 40], c2: [35, 40, 86], c3: [40, 90, 55], eye: [45, 95, 55] }, { head: 'b.head.hawk', eyes: 'b.eyes.fierce', beak: 'b.beak.hooked', wings: 'b.wings.broad', tail: 'b.tail.wedge', legs: 'b.legs.raptor', chest: 'b.chest.speckled', pattern: 'b.pattern.belly' }],
  penguin: ['bird', 'penguin', { c1: [220, 25, 22], c2: [220, 15, 96], c3: [35, 90, 60], eye: [220, 20, 15] }, { head: 'b.head.penguin', eyes: 'b.eyes.bead', beak: 'b.beak.short', wings: 'b.wings.flipper', tail: 'b.tail.stubby', legs: 'b.legs.penguin', chest: 'b.chest.tuxedo' }],
  duck: ['bird', 'duck', { c1: [140, 40, 30], c2: [45, 30, 88], c3: [40, 85, 55], eye: [30, 50, 20] }, { head: 'b.head.duck', eyes: 'b.eyes.round', beak: 'b.beak.flat', wings: 'b.wings.pointed', tail: 'b.tail.pintail', legs: 'b.legs.webbed', chest: 'b.chest.bib', face: 'b.face.none' }],
  parrot: ['bird', 'parrot', { c1: [0, 75, 52], c2: [50, 90, 62], c3: [210, 70, 50], eye: [40, 60, 40] }, { head: 'b.head.parrot', eyes: 'b.eyes.ring', beak: 'b.beak.parrot', crest: 'b.crest.cockatoo', wings: 'b.wings.long', tail: 'b.tail.long', legs: 'b.legs.zygo', pattern: 'b.pattern.patches' }],
  peacock: ['bird', 'peacock', { c1: [200, 70, 40], c2: [160, 60, 50], c3: [45, 90, 60], eye: [200, 60, 30] }, { head: 'b.head.peacock', eyes: 'b.eyes.sparkle', beak: 'b.beak.short', crest: 'b.crest.plume', wings: 'b.wings.lacy', tail: 'b.tail.fantail', legs: 'b.legs.stilts', chest: 'b.chest.scales' }],
  beetle: ['insect', 'beetle', { c1: [95, 50, 40], c2: [50, 90, 55], c3: [222, 12, 18], eye: [0, 0, 12] }, { eyes: 'i.eyes.round', mandibles: 'i.mandibles.grin', antennae: 'i.antennae.short', legsFront: 'i.legsFront.thin', legsMid: 'i.legsMid.thin', legsBack: 'i.legsBack.thin', shell: 'i.shell.elytra', pattern: 'i.pattern.stripes' }],
  bee: ['insect', 'bee', { c1: [45, 95, 56], c2: [45, 80, 80], c3: [220, 15, 14], eye: [220, 15, 14] }, { eyes: 'i.eyes.compound', mandibles: 'i.mandibles.tiny', antennae: 'i.antennae.straight', legsFront: 'i.legsFront.hairy', legsMid: 'i.legsMid.hairy', legsBack: 'i.legsBack.hairy', wings: 'i.wings.clear', tail: 'i.tail.stinger', shell: 'i.shell.fuzz', pattern: 'i.pattern.stripes' }],
  mantis: ['insect', 'mantis', { c1: [100, 50, 44], c2: [70, 60, 72], c3: [40, 70, 55], eye: [50, 90, 55] }, { eyes: 'i.eyes.compound', mandibles: 'i.mandibles.fangs', antennae: 'i.antennae.straight', legsFront: 'i.legsFront.raptorial', legsMid: 'i.legsMid.long', legsBack: 'i.legsBack.long', wings: 'i.wings.lacewing', shell: 'i.shell.leaf' }],
  dragonfly: ['insect', 'dragonfly', { c1: [190, 70, 45], c2: [200, 60, 80], c3: [40, 90, 60], eye: [160, 80, 50] }, { eyes: 'i.eyes.compound', mandibles: 'i.mandibles.tiny', antennae: 'i.antennae.short', legsFront: 'i.legsFront.thin', legsMid: 'i.legsMid.thin', legsBack: 'i.legsBack.thin', wings: 'i.wings.long', tail: 'i.tail.cerci', pattern: 'i.pattern.bands' }],
  ladybug: ['insect', 'ladybug', { c1: [5, 80, 52], c2: [40, 30, 90], c3: [220, 15, 14], eye: [220, 15, 14] }, { eyes: 'i.eyes.round', mandibles: 'i.mandibles.smile', antennae: 'i.antennae.clubbed', legsFront: 'i.legsFront.sturdy', legsMid: 'i.legsMid.stubby', legsBack: 'i.legsBack.sturdy', shell: 'i.shell.dome', pattern: 'i.pattern.spots' }],
  ant: ['insect', 'ant', { c1: [18, 60, 40], c2: [30, 50, 62], c3: [20, 60, 25], eye: [0, 0, 12] }, { eyes: 'i.eyes.dot', mandibles: 'i.mandibles.pincers', antennae: 'i.antennae.elbowed', legsFront: 'i.legsFront.sturdy', legsMid: 'i.legsMid.sturdy', legsBack: 'i.legsBack.sturdy' }],
  moth: ['insect', 'moth', { c1: [250, 30, 40], c2: [260, 25, 62], c3: [170, 60, 68], eye: [170, 80, 65] }, { eyes: 'i.eyes.glow', mandibles: 'i.mandibles.proboscis', antennae: 'i.antennae.feathered', legsFront: 'i.legsFront.hairy', legsMid: 'i.legsMid.hairy', legsBack: 'i.legsBack.hairy', wings: 'i.wings.moth', shell: 'i.shell.fuzz', pattern: 'i.pattern.eyespots' }],
  slug: ['invertebrate', 'slug', { c1: [280, 50, 46], c2: [95, 60, 52], c3: [305, 70, 66], eye: [95, 90, 55] }, { eyes: 'v.eyes.stalks', mouth: 'v.mouth.smile', feelers: 'v.feelers.slug', tail: 'v.tail.slugtip', skirt: 'v.skirt.fringe', pattern: 'v.pattern.spots' }],
  snail: ['invertebrate', 'slug', { c1: [30, 45, 62], c2: [40, 40, 80], c3: [20, 55, 40], eye: [30, 50, 25] }, { eyes: 'v.eyes.stalks', mouth: 'v.mouth.smile', feelers: 'v.feelers.slug', shell: 'v.shell.spiral', tail: 'v.tail.slugtip' }],
  crab: ['invertebrate', 'crab', { c1: [10, 75, 52], c2: [30, 60, 80], c3: [200, 60, 60], eye: [50, 95, 60] }, { eyes: 'v.eyes.stalked', mouth: 'v.mouth.grin', arms: 'v.arms.claws', legs: 'v.legs.crab', shell: 'v.shell.spiky', pattern: 'v.pattern.gradient' }],
  jelly: ['invertebrate', 'jelly', { c1: [320, 60, 68], c2: [270, 50, 62], c3: [48, 90, 62], eye: [200, 70, 50] }, { eyes: 'v.eyes.big', mouth: 'v.mouth.smile', skirt: 'v.skirt.tentacles', glow: 'v.glow.motes', pattern: 'v.pattern.dots' }],
  octopus: ['invertebrate', 'octopus', { c1: [345, 55, 52], c2: [20, 60, 82], c3: [345, 40, 30], eye: [50, 90, 55] }, { eyes: 'v.eyes.big', mouth: 'v.mouth.beak', arms: 'v.arms.tentacles', skirt: 'v.skirt.tentacles', pattern: 'v.pattern.rings' }],
  wisp: ['invertebrate', 'wisp', { c1: [255, 40, 42], c2: [250, 30, 72], c3: [180, 60, 70], eye: [180, 80, 60] }, { eyes: 'v.eyes.hollow', mouth: 'v.mouth.wavy', arms: 'v.arms.wisps', crown: 'v.crown.flame', tail: 'v.tail.wisp', skirt: 'v.skirt.hem', glow: 'v.glow.mist' }],
  scorpion: ['invertebrate', 'scorpion', { c1: [265, 20, 24], c2: [290, 50, 45], c3: [120, 70, 55], eye: [120, 90, 60] }, { eyes: 'v.eyes.bead', mouth: 'v.mouth.fangs', arms: 'v.arms.pedipalps', legs: 'v.legs.scorpion', tail: 'v.tail.stinger', shell: 'v.shell.plates', glow: 'v.glow.none' }],
  spider: ['invertebrate', 'spider', { c1: [230, 20, 22], c2: [230, 15, 40], c3: [0, 80, 50], eye: [0, 80, 50] }, { eyes: 'v.eyes.cluster', mouth: 'v.mouth.fangs', arms: 'v.arms.feelers', legs: 'v.legs.spider', pattern: 'v.pattern.swirl' }],
  frog: ['amphibian', 'frog', { c1: [110, 50, 46], c2: [70, 55, 78], c3: [30, 80, 55], eye: [40, 90, 45] }, { eyes: 'a.eyes.bulge', mouth: 'a.mouth.smile', throat: 'a.throat.sac', pattern: 'a.pattern.spots' }],
  toad: ['amphibian', 'toad', { c1: [40, 30, 42], c2: [45, 30, 72], c3: [25, 40, 28], eye: [40, 80, 45] }, { eyes: 'a.eyes.sleepy', mouth: 'a.mouth.frown', back: 'a.back.warts', pattern: 'a.pattern.blotches' }],
  treefrog: ['amphibian', 'treefrog', { c1: [95, 60, 45], c2: [60, 70, 72], c3: [20, 90, 55], eye: [0, 80, 50] }, { eyes: 'a.eyes.big', mouth: 'a.mouth.grin', throat: 'a.throat.bubble', pattern: 'a.pattern.stripes' }],
  axolotl: ['amphibian', 'axolotl', { c1: [340, 45, 80], c2: [350, 40, 92], c3: [340, 70, 60], eye: [220, 20, 20] }, { eyes: 'a.eyes.bead', mouth: 'a.mouth.smile', gills: 'a.gills.frills', tail: 'a.tail.fin', pattern: 'a.pattern.speckles' }],
  newt: ['amphibian', 'newt', { c1: [15, 70, 32], c2: [40, 95, 60], c3: [50, 100, 55], eye: [50, 90, 55] }, { eyes: 'a.eyes.gold', mouth: 'a.mouth.smirk', tail: 'a.tail.newt', back: 'a.back.ridge', pattern: 'a.pattern.spots' }],
  salamander: ['amphibian', 'salamander', { c1: [25, 40, 38], c2: [35, 35, 72], c3: [200, 40, 50], eye: [40, 60, 40] }, { eyes: 'a.eyes.bead', mouth: 'a.mouth.smile', tail: 'a.tail.salamander', gills: 'a.gills.stubs', pattern: 'a.pattern.belly' }],
  polliwog: ['amphibian', 'polliwog', { c1: [200, 55, 50], c2: [195, 40, 82], c3: [30, 80, 60], eye: [220, 40, 25] }, { eyes: 'a.eyes.wide', mouth: 'a.mouth.pout', tail: 'a.tail.polliwog', pattern: 'a.pattern.speckles' }],
  raptor: ['reptile', 'raptor', { c1: [190, 30, 35], c2: [40, 60, 72], c3: [20, 80, 55], eye: [50, 90, 55] }, { eyes: 'r.eyes.fierce', crest: 'r.crest.plume', back: 'r.back.feathers', scales: 'r.scales.saddle' }],
};

export function presetGenome(id) {
  const [rig, arch, palette, over] = PRESETS[id];
  return sampleGenome(id[0].toUpperCase() + id.slice(1), rig, arch, palette, over);
}
