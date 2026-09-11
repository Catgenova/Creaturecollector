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
};

export const CLADE_IDS = Object.keys(CLADES);

export function cladeName(id) { return CLADES[id] ? CLADES[id].name : 'Unknown'; }
