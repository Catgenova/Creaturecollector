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
//   mannequin parts and tweaks used by the Part Lab preview
//
// The 'legacy' rig is the original all-purpose skeleton. Classes still on it
// are drawn by the original renderer path until they are rebuilt.

export const RIGS = {
  legacy: {
    id: 'legacy', name: 'Classic', prefix: '',
    slots: ['body', 'head', 'eyes', 'mouth', 'crown', 'legs', 'arms', 'wings', 'tail', 'back', 'pattern'],
    names: {
      body: 'Body', head: 'Head', eyes: 'Eyes', mouth: 'Mouth', crown: 'Crown', legs: 'Legs',
      arms: 'Arms', wings: 'Wings', tail: 'Tail', back: 'Back', pattern: 'Pattern',
    },
    paint: ['body', 'head', 'crown', 'legs', 'arms', 'wings', 'tail', 'back'],
    required: ['body', 'eyes'],
    linked: null, // taken from the class
    ground: ['body', 'legs'],
    tree: null,   // drawn by the legacy renderer
    clipped: ['pattern'],
    mannequin: {
      parts: {
        body: 'body.round', head: 'head.round', eyes: 'eye.round', mouth: 'mouth.smile', crown: 'crown.none', legs: 'legs.stub',
        arms: 'arms.none', wings: 'wings.none', tail: 'tail.none', back: 'back.none', pattern: 'pattern.none',
      },
      // per-slot overrides so a previewed part has something sensible to sit on
      forSlot: {
        arms: { body: 'body.biped' }, wings: { body: 'body.quad' }, tail: { body: 'body.quad' }, back: { body: 'body.quad' },
        eyes: { head: 'head.bulb' }, mouth: { head: 'head.bulb' },
      },
      accentSlots: ['head', 'crown', 'legs', 'arms', 'wings', 'tail', 'back'],
    },
  },

  mammal: {
    id: 'mammal', name: 'Mammal', prefix: 'm.',
    slots: ['body', 'head', 'ears', 'eyes', 'muzzle', 'legsFront', 'legsBack', 'tail', 'mane', 'horns', 'back', 'markings'],
    names: {
      body: 'Body', head: 'Head', ears: 'Ears', eyes: 'Eyes', muzzle: 'Muzzle', legsFront: 'Forelegs', legsBack: 'Hind legs',
      tail: 'Tail', mane: 'Mane', horns: 'Horns', back: 'Back', markings: 'Markings',
    },
    paint: ['body', 'head', 'ears', 'legsFront', 'legsBack', 'tail', 'mane', 'horns', 'back', 'markings'],
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
};

export const RIG_IDS = Object.keys(RIGS);

export function getRig(id) { return RIGS[id] || RIGS.legacy; }
export function slotsFor(rig) { return getRig(rig).slots; }
export function paintSlotsFor(rig) { return getRig(rig).paint; }
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
