// The bird library, one list per rig slot.
import { B_BODIES } from './bodies.js';
import { B_HEADS } from './heads.js';
import { B_EYES, B_BEAKS, B_CRESTS, B_FACES } from './face.js';
import { B_WINGS, B_TAILS, B_LEGS } from './limbs.js';
import { B_CHESTS, B_BACKS, B_PATTERNS } from './plumage.js';

export const BIRD_PARTS = {
  body: B_BODIES, head: B_HEADS, eyes: B_EYES, beak: B_BEAKS, crest: B_CRESTS, face: B_FACES,
  wings: B_WINGS, tail: B_TAILS, legs: B_LEGS, chest: B_CHESTS, back: B_BACKS, pattern: B_PATTERNS,
};
