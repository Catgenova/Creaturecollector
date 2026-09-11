// The insect library, one list per rig slot.
import { I_BODIES } from './bodies.js';
import { I_HEADS } from './heads.js';
import { I_EYES, I_MANDIBLES, I_ANTENNAE } from './face.js';
import { I_WINGS, I_LEGS_FRONT, I_LEGS_MID, I_LEGS_BACK, I_TAILS } from './limbs.js';
import { I_SHELLS, I_PATTERNS } from './plating.js';

export const INSECT_PARTS = {
  body: I_BODIES, head: I_HEADS, eyes: I_EYES, mandibles: I_MANDIBLES, antennae: I_ANTENNAE, wings: I_WINGS,
  legsFront: I_LEGS_FRONT, legsMid: I_LEGS_MID, legsBack: I_LEGS_BACK, tail: I_TAILS, shell: I_SHELLS, pattern: I_PATTERNS,
};
