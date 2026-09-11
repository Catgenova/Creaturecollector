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
  raptor: ['reptile', 'raptor', { c1: [190, 30, 35], c2: [40, 60, 72], c3: [20, 80, 55], eye: [50, 90, 55] }, { eyes: 'r.eyes.fierce', crest: 'r.crest.plume', back: 'r.back.feathers', scales: 'r.scales.saddle' }],
};

export function presetGenome(id) {
  const [rig, arch, palette, over] = PRESETS[id];
  return sampleGenome(id[0].toUpperCase() + id.slice(1), rig, arch, palette, over);
}
