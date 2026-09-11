// The skeletal library, one list per rig slot.
import { SK_BODIES } from './bodies.js';
import { SK_HEADS } from './heads.js';
import { SK_EYES, SK_JAWS } from './face.js';
import { SK_LEGS_FRONT, SK_LEGS_BACK, SK_TAILS } from './limbs.js';
import { SK_HORNS, SK_WINGS, SK_LIGHTS } from './crest.js';
import { SK_SHROUDS, SK_CRACKS } from './dress.js';

export const SKELETAL_PARTS = {
  body: SK_BODIES, head: SK_HEADS, eyes: SK_EYES, jaw: SK_JAWS, legsFront: SK_LEGS_FRONT, legsBack: SK_LEGS_BACK,
  tail: SK_TAILS, horns: SK_HORNS, wings: SK_WINGS, light: SK_LIGHTS, shroud: SK_SHROUDS, cracks: SK_CRACKS,
};
