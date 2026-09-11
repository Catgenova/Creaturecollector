// The draconic library, one list per rig slot.
import { DR_BODIES } from './bodies.js';
import { DR_HEADS } from './heads.js';
import { DR_EYES, DR_JAWS, DR_BREATH } from './face.js';
import { DR_HORNS, DR_WINGS, DR_SPINES } from './crest.js';
import { DR_LEGS_FRONT, DR_LEGS_BACK, DR_TAILS } from './limbs.js';
import { DR_CHEST } from './chest.js';

export const DRACONIC_PARTS = {
  body: DR_BODIES, head: DR_HEADS, eyes: DR_EYES, jaw: DR_JAWS, horns: DR_HORNS, wings: DR_WINGS,
  legsFront: DR_LEGS_FRONT, legsBack: DR_LEGS_BACK, tail: DR_TAILS, spines: DR_SPINES, chest: DR_CHEST, breath: DR_BREATH,
};
