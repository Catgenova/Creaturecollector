// The fiend library, one list per rig slot.
import { FD_BODIES } from './bodies.js';
import { FD_HEADS } from './heads.js';
import { FD_EYES, FD_MOUTHS, FD_HORNS } from './face.js';
import { FD_ARMS, FD_LEGS, FD_HANDS } from './limbs.js';
import { FD_TAILS, FD_WINGS } from './back.js';
import { FD_MARKS, FD_AURAS } from './fx.js';

export const FIEND_PARTS = {
  body: FD_BODIES, head: FD_HEADS, eyes: FD_EYES, mouth: FD_MOUTHS, horns: FD_HORNS, arms: FD_ARMS,
  legs: FD_LEGS, tail: FD_TAILS, wings: FD_WINGS, hand: FD_HANDS, marks: FD_MARKS, aura: FD_AURAS,
};
