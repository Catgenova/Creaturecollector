// Rigs: the skeletons creatures are assembled on. Each class (clade) gets its
// own rig with its own slot list, so a mammal has ears and a muzzle where a
// fish has fins and gills. Parts belong to exactly one rig and are never mixed
// across rigs, which is what keeps fusions inside a class looking like members
// of that class.
//
// A rig declares:
//   slots     every slot in the genome, in display order
//   names     UI labels per slot
//   paint     slots that carry their own colour-role permutation gene
//   swappable paint slots a wild roll or fusion may permute at random (accessories only, so
//             a creature never ends up with one odd-coloured leg)
//   required  slots that have no "none" part (always drawn)
//   linked    slot groups that inherit from the same parent in fusion
//   ground    slots whose lowest point defines where the feet touch the floor
//   tree      the draw tree: a root node (the body) whose children are placed
//             on named sockets of their parent part. `behind` children are drawn
//             before the parent's own shapes, `front` children after. A child
//             with `far` is the far-side copy (drawn darker); `scale` names a
//             trait scale; `anim` a CSS animation group; `small` marks detail
//             parts that skip the heavy outline treatment; `fitBox` scales the
//             part from its 100x60 authoring frame onto the parent's box.
//   clipped   slots drawn right after the body's shapes, clipped to the body
//   mannequin parts and tweaks used to preview a single part (review boards, tests)
//
export const RIGS = {
  mammal: {
    id: 'mammal', name: 'Mammal', prefix: 'm.',
    slots: ['body', 'head', 'ears', 'eyes', 'muzzle', 'legsFront', 'legsBack', 'tail', 'mane', 'horns', 'back', 'markings'],
    names: {
      body: 'Body', head: 'Head', ears: 'Ears', eyes: 'Eyes', muzzle: 'Muzzle', legsFront: 'Forelegs', legsBack: 'Hind legs',
      tail: 'Tail', mane: 'Mane', horns: 'Horns', back: 'Back', markings: 'Markings',
    },
    paint: ['body', 'head', 'ears', 'legsFront', 'legsBack', 'tail', 'mane', 'horns', 'back', 'markings'],
    swappable: ['ears', 'tail', 'mane', 'horns', 'back', 'markings'],
    required: ['body', 'head', 'ears', 'eyes', 'muzzle', 'legsFront', 'legsBack', 'tail'],
    linked: [['legsFront', 'legsBack'], ['head', 'muzzle']],
    ground: ['body', 'legsFront', 'legsBack'],
    clipped: ['markings'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'back', socket: 'back', anim: 'sway' },
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'legsBack', socket: 'hipFar', far: true, scale: 'leg' },
        { slot: 'legsFront', socket: 'shoulderFar', far: true, scale: 'leg' },
      ],
      front: [
        { slot: 'legsBack', socket: 'hip', scale: 'leg' },
        { slot: 'mane', socket: 'mane' },
        { slot: 'legsFront', socket: 'shoulder', scale: 'leg' },
        {
          slot: 'head', socket: 'head', scale: 'head', anim: 'head',
          behind: [
            { slot: 'ears', socket: 'earFar', far: true },
            { slot: 'horns', socket: 'horns' },
            { slot: 'ears', socket: 'ear' },
          ],
          front: [
            { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
            { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
            { slot: 'muzzle', socket: 'muzzle', small: true },
          ],
        },
      ],
    },
    mannequin: {
      parts: {
        body: 'm.body.fox', head: 'm.head.fox', ears: 'm.ears.fox', eyes: 'm.eyes.round', muzzle: 'm.muzzle.fox',
        legsFront: 'm.legsFront.fox', legsBack: 'm.legsBack.fox', tail: 'm.tail.fox', mane: 'm.mane.none',
        horns: 'm.horns.none', back: 'm.back.none', markings: 'm.markings.none',
      },
      forSlot: {},
      accentSlots: ['ears', 'tail', 'mane', 'horns', 'back', 'markings'],
    },
  },

  reptile: {
    id: 'reptile', name: 'Reptile', prefix: 'r.',
    slots: ['body', 'head', 'eyes', 'jaw', 'crest', 'legsFront', 'legsBack', 'tail', 'back', 'wings', 'throat', 'scales'],
    names: {
      body: 'Body', head: 'Head', eyes: 'Eyes', jaw: 'Jaw', crest: 'Crest', legsFront: 'Forelegs', legsBack: 'Hind legs',
      tail: 'Tail', back: 'Back', wings: 'Wings', throat: 'Throat', scales: 'Scales',
    },
    paint: ['body', 'head', 'crest', 'legsFront', 'legsBack', 'tail', 'back', 'wings', 'throat', 'scales'],
    swappable: ['crest', 'tail', 'back', 'wings', 'throat', 'scales'],
    required: ['body', 'head', 'eyes', 'jaw', 'legsFront', 'legsBack', 'tail'],
    linked: [['legsFront', 'legsBack'], ['head', 'jaw']],
    ground: ['body', 'legsFront', 'legsBack'],
    clipped: ['scales'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'wings', socket: 'wingFar', far: true, scale: 'wing', anim: 'flap' },
        { slot: 'wings', socket: 'wing', scale: 'wing', anim: 'flap' },
        { slot: 'back', socket: 'back' },
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'legsBack', socket: 'hipFar', far: true, scale: 'leg' },
        { slot: 'legsFront', socket: 'shoulderFar', far: true, scale: 'leg' },
      ],
      front: [
        { slot: 'legsBack', socket: 'hip', scale: 'leg' },
        { slot: 'legsFront', socket: 'shoulder', scale: 'leg' },
        {
          slot: 'head', socket: 'head', scale: 'head', anim: 'head',
          behind: [
            { slot: 'crest', socket: 'crest' },
            { slot: 'throat', socket: 'throat' },
          ],
          front: [
            { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
            { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
            { slot: 'jaw', socket: 'jaw', small: true },
          ],
        },
      ],
    },
    mannequin: {
      parts: {
        body: 'r.body.lizard', head: 'r.head.lizard', eyes: 'r.eyes.round', jaw: 'r.jaw.grin', crest: 'r.crest.none',
        legsFront: 'r.legsFront.lizard', legsBack: 'r.legsBack.lizard', tail: 'r.tail.lizard', back: 'r.back.none',
        wings: 'r.wings.none', throat: 'r.throat.none', scales: 'r.scales.none',
      },
      forSlot: {},
      accentSlots: ['crest', 'tail', 'back', 'wings', 'throat', 'scales'],
    },
  },

  fish: {
    id: 'fish', name: 'Fish', prefix: 'f.',
    slots: ['body', 'eyes', 'mouth', 'dorsal', 'pectoral', 'tail', 'belly', 'gills', 'crest', 'barbels', 'spines', 'pattern'],
    names: {
      body: 'Body', eyes: 'Eyes', mouth: 'Mouth', dorsal: 'Dorsal fin', pectoral: 'Side fins', tail: 'Tail fin', belly: 'Belly fins',
      gills: 'Gills', crest: 'Crest', barbels: 'Barbels', spines: 'Spines', pattern: 'Pattern',
    },
    paint: ['body', 'dorsal', 'pectoral', 'tail', 'belly', 'gills', 'crest', 'barbels', 'spines', 'pattern'],
    swappable: ['dorsal', 'tail', 'belly', 'crest', 'spines', 'pattern'],
    required: ['body', 'eyes', 'mouth', 'dorsal', 'pectoral', 'tail'],
    linked: [['dorsal', 'tail'], ['pectoral', 'belly']],
    ground: ['body'],
    clipped: ['pattern'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'spines', fitBox: true },
        { slot: 'pectoral', socket: 'pectoralFar', far: true, anim: 'flap' },
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'dorsal', socket: 'dorsal' },
        { slot: 'belly', socket: 'belly' },
        { slot: 'crest', socket: 'crest' },
      ],
      front: [
        { slot: 'gills', socket: 'gills', small: true },
        { slot: 'barbels', socket: 'barbels', small: true },
        { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
        { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
        { slot: 'mouth', socket: 'mouth', small: true },
        { slot: 'pectoral', socket: 'pectoral', anim: 'flap' },
      ],
    },
    mannequin: {
      parts: {
        body: 'f.body.round', eyes: 'f.eyes.round', mouth: 'f.mouth.pout', dorsal: 'f.dorsal.fan', pectoral: 'f.pectoral.fan',
        tail: 'f.tail.forked', belly: 'f.belly.none', gills: 'f.gills.none', crest: 'f.crest.none', barbels: 'f.barbels.none',
        spines: 'f.spines.none', pattern: 'f.pattern.none',
      },
      forSlot: {},
      accentSlots: ['dorsal', 'pectoral', 'tail', 'belly', 'gills', 'crest', 'barbels', 'spines', 'pattern'],
    },
  },

  bird: {
    id: 'bird', name: 'Bird', prefix: 'b.',
    slots: ['body', 'head', 'eyes', 'beak', 'crest', 'face', 'wings', 'tail', 'legs', 'chest', 'back', 'pattern'],
    names: {
      body: 'Body', head: 'Head', eyes: 'Eyes', beak: 'Beak', crest: 'Crest', face: 'Face', wings: 'Wings', tail: 'Tail',
      legs: 'Legs', chest: 'Chest', back: 'Back', pattern: 'Pattern',
    },
    paint: ['body', 'head', 'beak', 'crest', 'face', 'wings', 'tail', 'legs', 'chest', 'back', 'pattern'],
    swappable: ['crest', 'tail', 'chest', 'back', 'pattern'],
    required: ['body', 'head', 'eyes', 'beak', 'wings', 'tail', 'legs'],
    linked: [['wings', 'tail'], ['head', 'beak']],
    ground: ['body', 'legs'],
    clipped: ['pattern'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'wings', socket: 'wingFar', far: true, scale: 'wing', anim: 'flap' },
        { slot: 'back', socket: 'back' },
        { slot: 'legs', socket: 'legFar', far: true, scale: 'leg' },
      ],
      front: [
        { slot: 'chest', socket: 'chest' },
        { slot: 'legs', socket: 'leg', scale: 'leg' },
        { slot: 'wings', socket: 'wing', scale: 'wing', anim: 'flap' },
        {
          slot: 'head', socket: 'head', scale: 'head', anim: 'head',
          behind: [{ slot: 'crest', socket: 'crest' }],
          front: [
            { slot: 'face', socket: 'face', small: true },
            { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
            { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
            { slot: 'beak', socket: 'beak', small: true },
          ],
        },
      ],
    },
    mannequin: {
      parts: {
        body: 'b.body.songbird', head: 'b.head.round', eyes: 'b.eyes.bead', beak: 'b.beak.short', crest: 'b.crest.none', face: 'b.face.none',
        wings: 'b.wings.rounded', tail: 'b.tail.fan', legs: 'b.legs.thin', chest: 'b.chest.none', back: 'b.back.none', pattern: 'b.pattern.none',
      },
      forSlot: {},
      accentSlots: ['beak', 'crest', 'face', 'wings', 'tail', 'legs', 'chest', 'back', 'pattern'],
    },
  },

  insect: {
    id: 'insect', name: 'Insect', prefix: 'i.',
    slots: ['body', 'head', 'eyes', 'mandibles', 'antennae', 'wings', 'legsFront', 'legsMid', 'legsBack', 'tail', 'shell', 'pattern'],
    names: {
      body: 'Body', head: 'Head', eyes: 'Eyes', mandibles: 'Mandibles', antennae: 'Antennae', wings: 'Wings', legsFront: 'Front legs',
      legsMid: 'Middle legs', legsBack: 'Hind legs', tail: 'Tail tip', shell: 'Shell', pattern: 'Pattern',
    },
    paint: ['body', 'head', 'antennae', 'wings', 'legsFront', 'legsMid', 'legsBack', 'tail', 'shell', 'pattern'],
    swappable: ['antennae', 'wings', 'tail', 'shell', 'pattern'],
    required: ['body', 'head', 'eyes', 'mandibles', 'antennae', 'legsFront', 'legsMid', 'legsBack'],
    linked: [['legsFront', 'legsMid', 'legsBack'], ['head', 'mandibles']],
    ground: ['body', 'legsFront', 'legsMid', 'legsBack'],
    clipped: ['pattern'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'legsBack', socket: 'legBackFar', far: true, scale: 'leg' },
        { slot: 'legsMid', socket: 'legMidFar', far: true, scale: 'leg' },
        { slot: 'legsFront', socket: 'legFrontFar', far: true, scale: 'leg' },
        { slot: 'wings', socket: 'wingFar', far: true, scale: 'wing', anim: 'flap' },
        { slot: 'tail', socket: 'tail', scale: 'tail' },
      ],
      front: [
        { slot: 'shell', socket: 'shell' },
        { slot: 'legsBack', socket: 'legBack', scale: 'leg' },
        { slot: 'legsMid', socket: 'legMid', scale: 'leg' },
        { slot: 'legsFront', socket: 'legFront', scale: 'leg' },
        { slot: 'wings', socket: 'wing', scale: 'wing', anim: 'flap' },
        {
          slot: 'head', socket: 'head', scale: 'head', anim: 'head',
          behind: [{ slot: 'antennae', socket: 'antennae' }],
          front: [
            { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
            { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
            { slot: 'mandibles', socket: 'mandibles', small: true },
          ],
        },
      ],
    },
    mannequin: {
      parts: {
        body: 'i.body.beetle', head: 'i.head.beetle', eyes: 'i.eyes.round', mandibles: 'i.mandibles.grin', antennae: 'i.antennae.short',
        wings: 'i.wings.none', legsFront: 'i.legsFront.thin', legsMid: 'i.legsMid.thin', legsBack: 'i.legsBack.thin', tail: 'i.tail.none',
        shell: 'i.shell.none', pattern: 'i.pattern.none',
      },
      forSlot: {},
      accentSlots: ['antennae', 'wings', 'tail', 'shell', 'pattern'],
    },
  },

  invertebrate: {
    id: 'invertebrate', name: 'Invertebrate', prefix: 'v.',
    slots: ['body', 'eyes', 'mouth', 'arms', 'legs', 'shell', 'tail', 'crown', 'feelers', 'pattern', 'glow', 'skirt'],
    names: {
      body: 'Body', eyes: 'Eyes', mouth: 'Mouth', arms: 'Arms', legs: 'Legs', shell: 'Shell', tail: 'Tail', crown: 'Crown',
      feelers: 'Feelers', pattern: 'Pattern', glow: 'Glow', skirt: 'Skirt',
    },
    paint: ['body', 'arms', 'legs', 'shell', 'tail', 'crown', 'feelers', 'pattern', 'glow', 'skirt'],
    swappable: ['shell', 'tail', 'crown', 'feelers', 'pattern', 'glow', 'skirt'],
    required: ['body', 'eyes'],
    linked: [['arms', 'legs'], ['skirt', 'tail']],
    ground: ['body', 'legs'],
    clipped: ['pattern'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'glow', fitBox: true },
        { slot: 'skirt', socket: 'skirt', anim: 'sway' },
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'crown', socket: 'crown' },
        { slot: 'legs', socket: 'legsFar', far: true, scale: 'leg' },
        { slot: 'arms', socket: 'armFar', far: true },
      ],
      front: [
        { slot: 'shell', socket: 'shell' },
        { slot: 'legs', socket: 'legs', scale: 'leg' },
        { slot: 'arms', socket: 'arm' },
        { slot: 'feelers', socket: 'feelers', small: true },
        { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
        { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
        { slot: 'mouth', socket: 'mouth', small: true },
      ],
    },
    mannequin: {
      parts: {
        body: 'v.body.slug', eyes: 'v.eyes.stalks', mouth: 'v.mouth.smile', arms: 'v.arms.none', legs: 'v.legs.none', shell: 'v.shell.none',
        tail: 'v.tail.none', crown: 'v.crown.none', feelers: 'v.feelers.none', pattern: 'v.pattern.none', glow: 'v.glow.none', skirt: 'v.skirt.none',
      },
      forSlot: { arms: { body: 'v.body.crab' }, legs: { body: 'v.body.crab' }, skirt: { body: 'v.body.jelly' }, glow: { body: 'v.body.wisp' } },
      accentSlots: ['arms', 'legs', 'shell', 'tail', 'crown', 'feelers', 'pattern', 'glow', 'skirt'],
    },
  },

  amphibian: {
    id: 'amphibian', name: 'Amphibian', prefix: 'a.',
    slots: ['body', 'head', 'eyes', 'mouth', 'gills', 'legsFront', 'legsBack', 'tail', 'throat', 'crest', 'back', 'pattern'],
    names: {
      body: 'Body', head: 'Head', eyes: 'Eyes', mouth: 'Mouth', gills: 'Gills', legsFront: 'Forelegs', legsBack: 'Hind legs',
      tail: 'Tail', throat: 'Throat', crest: 'Crest', back: 'Back', pattern: 'Pattern',
    },
    paint: ['body', 'head', 'gills', 'legsFront', 'legsBack', 'tail', 'throat', 'crest', 'back', 'pattern'],
    swappable: ['gills', 'tail', 'crest', 'back', 'pattern'],
    required: ['body', 'head', 'eyes', 'mouth', 'legsFront', 'legsBack'],
    linked: [['legsFront', 'legsBack'], ['head', 'mouth']],
    ground: ['body', 'legsFront', 'legsBack'],
    clipped: ['pattern'],
    tree: {
      slot: 'body', anim: 'body',
      behind: [
        { slot: 'back', socket: 'back' },
        { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
        { slot: 'legsBack', socket: 'hipFar', far: true, scale: 'leg' },
        { slot: 'legsFront', socket: 'shoulderFar', far: true, scale: 'leg' },
      ],
      front: [
        { slot: 'legsBack', socket: 'hip', scale: 'leg' },
        { slot: 'legsFront', socket: 'shoulder', scale: 'leg' },
        {
          slot: 'head', socket: 'head', scale: 'head', anim: 'head',
          behind: [
            { slot: 'gills', socket: 'gills' },
            { slot: 'crest', socket: 'crest' },
            { slot: 'throat', socket: 'throat' },
          ],
          front: [
            { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
            { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
            { slot: 'mouth', socket: 'mouth', small: true },
          ],
        },
      ],
    },
    mannequin: {
      parts: {
        body: 'a.body.frog', head: 'a.head.frog', eyes: 'a.eyes.bulge', mouth: 'a.mouth.smile', gills: 'a.gills.none',
        legsFront: 'a.legsFront.frog', legsBack: 'a.legsBack.frog', tail: 'a.tail.none', throat: 'a.throat.none',
        crest: 'a.crest.none', back: 'a.back.none', pattern: 'a.pattern.none',
      },
      forSlot: { tail: { body: 'a.body.newt', head: 'a.head.newt', legsFront: 'a.legsFront.newt', legsBack: 'a.legsBack.newt' }, gills: { body: 'a.body.axolotl', head: 'a.head.axolotl' } },
      accentSlots: ['gills', 'tail', 'throat', 'crest', 'back', 'pattern'],
    },
  },
};

RIGS.flora = {
  id: 'flora', name: 'Flora', prefix: 'p.',
  slots: ['body', 'head', 'eyes', 'mouth', 'leaves', 'roots', 'vines', 'pods', 'thorns', 'canopy', 'bark', 'fruit'],
  names: {
    body: 'Stem', head: 'Bloom', eyes: 'Eyes', mouth: 'Mouth', leaves: 'Leaves', roots: 'Roots',
    vines: 'Vines', pods: 'Pods', thorns: 'Thorns', canopy: 'Canopy', bark: 'Bark', fruit: 'Fruit',
  },
  paint: ['body', 'head', 'leaves', 'roots', 'vines', 'pods', 'thorns', 'canopy', 'bark', 'fruit'],
  swappable: ['vines', 'pods', 'thorns', 'canopy', 'bark', 'fruit'],
  required: ['body', 'head', 'eyes', 'mouth', 'leaves', 'roots'],
  linked: [['leaves', 'roots'], ['head', 'mouth']],
  ground: ['body', 'roots'],
  clipped: ['bark'],
  tree: {
    slot: 'body', anim: 'body',
    behind: [
      { slot: 'canopy', socket: 'back', anim: 'sway' },
      { slot: 'vines', socket: 'vines', scale: 'tail', anim: 'tail' },
      { slot: 'leaves', socket: 'leafFar', far: true, scale: 'wing' },
      { slot: 'roots', socket: 'rootFar', far: true, scale: 'leg' },
    ],
    front: [
      { slot: 'roots', socket: 'root', scale: 'leg' },
      { slot: 'leaves', socket: 'leaf', scale: 'wing', anim: 'sway' },
      { slot: 'pods', socket: 'pods' },
      {
        slot: 'head', socket: 'head', scale: 'head', anim: 'head',
        behind: [{ slot: 'thorns', socket: 'thorns' }],
        front: [
          { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
          { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
          { slot: 'mouth', socket: 'mouth', small: true },
          { slot: 'fruit', socket: 'fruit', small: true },
        ],
      },
    ],
  },
  mannequin: {
    parts: {
      body: 'p.body.sprout', head: 'p.head.daisy', eyes: 'p.eyes.dew', mouth: 'p.mouth.smile', leaves: 'p.leaves.broad', roots: 'p.roots.taproot',
      vines: 'p.vines.none', pods: 'p.pods.none', thorns: 'p.thorns.none', canopy: 'p.canopy.none', bark: 'p.bark.none', fruit: 'p.fruit.none',
    },
    forSlot: { vines: { body: 'p.body.vine' }, canopy: { body: 'p.body.treant' } },
    accentSlots: ['leaves', 'vines', 'pods', 'thorns', 'canopy', 'bark', 'fruit'],
  },
};

RIGS.ooze = {
  id: 'ooze', name: 'Ooze', prefix: 'o.',
  slots: ['body', 'core', 'eyes', 'mouth', 'pseudopods', 'drips', 'crown', 'tendrils', 'base', 'inclusions', 'sheen', 'bumps'],
  names: {
    body: 'Blob', core: 'Core', eyes: 'Eyes', mouth: 'Mouth', pseudopods: 'Pseudopods', drips: 'Drips',
    crown: 'Crown', tendrils: 'Tendrils', base: 'Puddle', inclusions: 'Inclusions', sheen: 'Sheen', bumps: 'Bumps',
  },
  paint: ['body', 'core', 'pseudopods', 'drips', 'crown', 'tendrils', 'base', 'inclusions', 'sheen', 'bumps'],
  swappable: ['drips', 'crown', 'tendrils', 'inclusions', 'sheen', 'bumps'],
  required: ['body', 'core', 'eyes', 'mouth', 'pseudopods', 'base'],
  linked: [['pseudopods', 'base'], ['core', 'eyes']],
  ground: ['body', 'base'],
  clipped: ['inclusions', 'sheen'],
  tree: {
    slot: 'body', anim: 'body',
    behind: [
      { slot: 'crown', socket: 'crown', anim: 'sway' },
      { slot: 'tendrils', socket: 'tendrilFar', far: true, scale: 'tail', anim: 'tail' },
      { slot: 'pseudopods', socket: 'podFar', far: true, scale: 'leg' },
      { slot: 'base', socket: 'base', scale: 'leg' },
    ],
    front: [
      { slot: 'tendrils', socket: 'tendril', scale: 'tail', anim: 'tail' },
      { slot: 'pseudopods', socket: 'pod', scale: 'leg' },
      { slot: 'bumps', socket: 'bumps', small: true },
      { slot: 'drips', socket: 'drips', small: true },
      { slot: 'core', socket: 'core', scale: 'head', anim: 'head' },
      { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
      { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
      { slot: 'mouth', socket: 'mouth', small: true },
    ],
  },
  mannequin: {
    parts: {
      body: 'o.body.blob', core: 'o.core.nucleus', eyes: 'o.eyes.round', mouth: 'o.mouth.smile', pseudopods: 'o.pseudopods.stubs', base: 'o.base.puddle',
      drips: 'o.drips.none', crown: 'o.crown.none', tendrils: 'o.tendrils.none', inclusions: 'o.inclusions.none', sheen: 'o.sheen.none', bumps: 'o.bumps.none',
    },
    forSlot: { tendrils: { body: 'o.body.tall' } },
    accentSlots: ['core', 'pseudopods', 'drips', 'crown', 'tendrils', 'base', 'inclusions', 'sheen', 'bumps'],
  },
};

RIGS.fungus = {
  id: 'fungus', name: 'Fungus', prefix: 'g.',
  slots: ['body', 'head', 'eyes', 'mouth', 'gills', 'spores', 'roots', 'ring', 'shelves', 'veil', 'glow', 'pattern'],
  names: {
    body: 'Cap', head: 'Stalk', eyes: 'Eyes', mouth: 'Mouth', gills: 'Gills', spores: 'Spores',
    roots: 'Roots', ring: 'Ring', shelves: 'Shelves', veil: 'Veil', glow: 'Glow', pattern: 'Spots',
  },
  paint: ['body', 'head', 'gills', 'spores', 'roots', 'ring', 'shelves', 'veil', 'glow', 'pattern'],
  swappable: ['spores', 'ring', 'shelves', 'veil', 'glow', 'pattern'],
  required: ['body', 'head', 'eyes', 'mouth', 'gills', 'roots'],
  linked: [['gills', 'veil'], ['head', 'roots']],
  ground: ['head', 'roots'],
  clipped: ['pattern'],
  // The cap is the root: the stalk hangs from it and carries the face, the roots stand on the ground.
  tree: {
    slot: 'body', anim: 'body',
    behind: [
      { slot: 'glow', fitBox: true },
      { slot: 'gills', socket: 'gills' },
      {
        slot: 'head', socket: 'stalk', scale: 'head', anim: 'head',
        behind: [{ slot: 'roots', socket: 'rootFar', far: true, scale: 'leg' }],
        front: [
          { slot: 'roots', socket: 'root', scale: 'leg' },
          { slot: 'shelves', socket: 'shelf' },
          { slot: 'ring', socket: 'ring' },
          { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
          { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
          { slot: 'mouth', socket: 'mouth', small: true },
        ],
      },
      { slot: 'veil', socket: 'veil', anim: 'sway' },
    ],
    front: [{ slot: 'spores', socket: 'spores', anim: 'sway', small: true }],
  },
  mannequin: {
    parts: {
      body: 'g.body.button', head: 'g.head.stout', eyes: 'g.eyes.round', mouth: 'g.mouth.smile', gills: 'g.gills.fine', roots: 'g.roots.mycelium',
      spores: 'g.spores.none', ring: 'g.ring.none', shelves: 'g.shelves.none', veil: 'g.veil.none', glow: 'g.glow.none', pattern: 'g.pattern.none',
    },
    forSlot: {},
    accentSlots: ['gills', 'spores', 'roots', 'ring', 'shelves', 'veil', 'glow', 'pattern'],
  },
};

RIGS.wyrm = {
  id: 'wyrm', name: 'Wyrm', prefix: 'w.',
  slots: ['body', 'head', 'eyes', 'maw', 'whiskers', 'legs', 'tail', 'mane', 'plates', 'horns', 'glow', 'bands'],
  names: {
    body: 'Coil', head: 'Head', eyes: 'Eyes', maw: 'Maw', whiskers: 'Whiskers', legs: 'Legs',
    tail: 'Tail', mane: 'Mane', plates: 'Plates', horns: 'Horns', glow: 'Glow', bands: 'Bands',
  },
  paint: ['body', 'head', 'whiskers', 'legs', 'tail', 'mane', 'plates', 'horns', 'glow', 'bands'],
  swappable: ['whiskers', 'mane', 'plates', 'horns', 'glow', 'bands'],
  required: ['body', 'head', 'eyes', 'maw', 'legs', 'tail'],
  linked: [['head', 'maw'], ['mane', 'tail']],
  ground: ['body', 'legs'],
  clipped: ['bands'],
  // One leg part stands at four sockets: a front and a hind pair, near and far.
  tree: {
    slot: 'body', anim: 'body',
    behind: [
      { slot: 'glow', fitBox: true },
      { slot: 'mane', socket: 'mane', anim: 'sway' },
      { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
      { slot: 'legs', socket: 'legBackFar', far: true, scale: 'leg' },
      { slot: 'legs', socket: 'legFar', far: true, scale: 'leg' },
    ],
    front: [
      { slot: 'plates', socket: 'plates' },
      { slot: 'legs', socket: 'legBack', scale: 'leg' },
      { slot: 'legs', socket: 'leg', scale: 'leg' },
      {
        slot: 'head', socket: 'head', scale: 'head', anim: 'head',
        behind: [
          { slot: 'horns', socket: 'horns' },
          { slot: 'whiskers', socket: 'whiskerFar', far: true, small: true },
        ],
        front: [
          { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
          { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
          { slot: 'maw', socket: 'maw', small: true },
          { slot: 'whiskers', socket: 'whisker', small: true },
        ],
      },
    ],
  },
  mannequin: {
    parts: {
      body: 'w.body.serpent', head: 'w.head.sleek', eyes: 'w.eyes.round', maw: 'w.maw.grin', whiskers: 'w.whiskers.none', legs: 'w.legs.claw',
      tail: 'w.tail.taper', mane: 'w.mane.none', plates: 'w.plates.none', horns: 'w.horns.none', glow: 'w.glow.none', bands: 'w.bands.none',
    },
    forSlot: {},
    accentSlots: ['whiskers', 'legs', 'tail', 'mane', 'plates', 'horns', 'glow', 'bands'],
  },
};

RIGS.draconic = {
  id: 'draconic', name: 'Draconic', prefix: 'd.',
  slots: ['body', 'head', 'eyes', 'jaw', 'horns', 'wings', 'legsFront', 'legsBack', 'tail', 'spines', 'chest', 'breath'],
  names: {
    body: 'Body', head: 'Head', eyes: 'Eyes', jaw: 'Jaw', horns: 'Horns', wings: 'Wings', legsFront: 'Forelegs',
    legsBack: 'Hind legs', tail: 'Tail', spines: 'Spines', chest: 'Chest', breath: 'Breath',
  },
  paint: ['body', 'head', 'horns', 'wings', 'legsFront', 'legsBack', 'tail', 'spines', 'chest', 'breath'],
  swappable: ['horns', 'spines', 'chest', 'breath'],
  required: ['body', 'head', 'eyes', 'jaw', 'wings', 'legsFront', 'legsBack', 'tail'],
  linked: [['legsFront', 'legsBack'], ['head', 'jaw']],
  ground: ['body', 'legsFront', 'legsBack'],
  clipped: ['chest'],
  tree: {
    slot: 'body', anim: 'body',
    behind: [
      { slot: 'wings', socket: 'wingFar', far: true, scale: 'wing', anim: 'flap' },
      { slot: 'wings', socket: 'wing', scale: 'wing', anim: 'flap' },
      { slot: 'spines', socket: 'spines' },
      { slot: 'tail', socket: 'tail', scale: 'tail', anim: 'tail' },
      { slot: 'legsBack', socket: 'hipFar', far: true, scale: 'leg' },
      { slot: 'legsFront', socket: 'shoulderFar', far: true, scale: 'leg' },
    ],
    front: [
      { slot: 'legsBack', socket: 'hip', scale: 'leg' },
      { slot: 'legsFront', socket: 'shoulder', scale: 'leg' },
      {
        slot: 'head', socket: 'head', scale: 'head', anim: 'head',
        behind: [{ slot: 'horns', socket: 'horns' }],
        front: [
          { slot: 'eyes', socket: 'eyeFar', far: true, scale: 'eye', small: true },
          { slot: 'eyes', socket: 'eye', scale: 'eye', small: true },
          { slot: 'jaw', socket: 'jaw', small: true },
          { slot: 'breath', socket: 'breath', small: true },
        ],
      },
    ],
  },
  mannequin: {
    parts: {
      body: 'd.body.drake', head: 'd.head.classic', eyes: 'd.eyes.slit', jaw: 'd.jaw.grin', horns: 'd.horns.none', wings: 'd.wings.bat',
      legsFront: 'd.legsFront.claw', legsBack: 'd.legsBack.haunch', tail: 'd.tail.spade', spines: 'd.spines.none', chest: 'd.chest.none', breath: 'd.breath.none',
    },
    forSlot: {},
    accentSlots: ['horns', 'wings', 'tail', 'spines', 'chest', 'breath'],
  },
};

export const RIG_IDS = Object.keys(RIGS);

/** Rig used when a genome names none or an unknown one (old saves): the first class. */
export const DEFAULT_RIG = 'mammal';

export function getRig(id) { return RIGS[id] || RIGS[DEFAULT_RIG]; }
export function slotsFor(rig) { return getRig(rig).slots; }
export function paintSlotsFor(rig) { return getRig(rig).paint; }
export function swappableSlotsFor(rig) { const r = getRig(rig); return r.swappable || r.paint; }
export function slotName(rig, slot) { return getRig(rig).names[slot] || slot; }
export function noneId(rig, slot) { return `${getRig(rig).prefix}${slot}.none`; }

/** Every placement node of a rig's draw tree, flattened (parents before children). */
export function rigNodes(rig) {
  const out = [];
  const walk = (node) => {
    out.push(node);
    for (const c of node.behind || []) walk(c);
    for (const c of node.front || []) walk(c);
  };
  const r = getRig(rig);
  if (r.tree) walk(r.tree);
  return out;
}
