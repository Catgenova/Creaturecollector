// Classes (clades): the anatomical families creatures belong to. Fusion is only
// possible inside a class, and each class links some slots so a child keeps a
// coherent silhouette (a bird's wings and tail come from the same parent, etc.).
// Types (Fire, Water...) are elemental and independent of class.

export const CLADES = {
  mammal: { name: 'Mammal', plural: 'Mammals', linked: [['legs', 'arms']], desc: 'Fur, ears and tails. Quadrupeds and bipeds.' },
  reptile: { name: 'Reptile', plural: 'Reptiles', linked: [['back', 'tail']], desc: 'Scales, spines and long tails. Lizards, serpents and dragons.' },
  fish: { name: 'Fish', plural: 'Fish', linked: [['body', 'tail']], desc: 'Fins and tails. The face sits on the body.' },
  bird: { name: 'Bird', plural: 'Birds', linked: [['wings', 'tail']], desc: 'Beaks, feathers and wings.' },
  insect: { name: 'Insect', plural: 'Insects', linked: [['wings', 'back']], desc: 'Segmented bodies, antennae and thin legs.' },
  invertebrate: { name: 'Invertebrate', plural: 'Invertebrates', linked: [['arms', 'legs']], desc: 'Soft bodies, shells and tentacles. Slugs, crabs, jellies and spirits.' },
  amphibian: { name: 'Amphibian', plural: 'Amphibians', linked: [['legs', 'arms']], desc: 'Wide heads and springy legs. Frogs, newts and swamp things.' },
  flora: { name: 'Flora', plural: 'Flora', linked: [['leaves', 'roots']], desc: 'Walking plants. Stems, blooms, leaves and roots.' },
  ooze: { name: 'Ooze', plural: 'Oozes', linked: [['pseudopods', 'base']], desc: 'Living slime. A core, a puddle and whatever it swallowed.' },
  fungus: { name: 'Fungus', plural: 'Fungi', linked: [['head', 'roots']], desc: 'Walking mushrooms. A cap for a hat, a face on the stalk, roots for feet.' },
  wyrm: { name: 'Wyrm', plural: 'Wyrms', linked: [['mane', 'tail']], desc: 'Serpentine dragons. Long coils, whiskers, small legs and long tails.' },
  draconic: { name: 'Draconic', plural: 'Draconic', linked: [['legsFront', 'legsBack']], desc: 'True dragons. Four legs, two wings, horns and a breath.' },
  skeletal: { name: 'Skeletal', plural: 'Skeletals', linked: [['legsFront', 'legsBack']], desc: 'Walking bone. Skulls, ribcages and a light where the heart was.' },
  nightwing: { name: 'Nightwing', plural: 'Nightwings', linked: [['wings', 'thumbs']], desc: 'Bats of every size. Leathern wings, big ears and a taste for dusk.' },
  crystalline: { name: 'Crystalline', plural: 'Crystallines', linked: [['legsFront', 'legsBack']], desc: 'Living geodes. Faceted bodies, crystal crowns and a glow along every seam.' },
  myriapod: { name: 'Myriapod', plural: 'Myriapods', linked: [['head', 'mandibles']], desc: 'Centipedes and millipedes. Segment after segment, and legs to match.' },
};

export const CLADE_IDS = Object.keys(CLADES);

export function cladeName(id) { return CLADES[id] ? CLADES[id].name : 'Unknown'; }
