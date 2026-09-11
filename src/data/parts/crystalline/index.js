// The crystalline library, one list per rig slot.
import { CR_BODIES } from './bodies.js';
import { CR_HEADS } from './heads.js';
import { CR_EYES, CR_MOUTHS } from './face.js';
import { CR_LEGS_FRONT, CR_LEGS_BACK, CR_TAILS } from './limbs.js';
import { CR_SPINES, CR_CROWNS } from './crest.js';
import { CR_SEAMS, CR_FACETS, CR_AURAS } from './fx.js';

export const CRYSTALLINE_PARTS = {
  body: CR_BODIES, head: CR_HEADS, eyes: CR_EYES, mouth: CR_MOUTHS, legsFront: CR_LEGS_FRONT, legsBack: CR_LEGS_BACK,
  spines: CR_SPINES, crown: CR_CROWNS, tail: CR_TAILS, seam: CR_SEAMS, facets: CR_FACETS, aura: CR_AURAS,
};
