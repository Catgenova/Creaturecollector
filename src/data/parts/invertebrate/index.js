// The invertebrate library, one list per rig slot.
import { V_BODIES } from './bodies.js';
import { V_EYES, V_MOUTHS, V_FEELERS } from './face.js';
import { V_ARMS, V_LEGS, V_TAILS } from './limbs.js';
import { V_SHELLS, V_CROWNS } from './shells.js';
import { V_PATTERNS, V_GLOWS, V_SKIRTS } from './fx.js';

export const INVERTEBRATE_PARTS = {
  body: V_BODIES, eyes: V_EYES, mouth: V_MOUTHS, arms: V_ARMS, legs: V_LEGS, shell: V_SHELLS, tail: V_TAILS,
  crown: V_CROWNS, feelers: V_FEELERS, pattern: V_PATTERNS, glow: V_GLOWS, skirt: V_SKIRTS,
};
