// The nightwing library, one list per rig slot.
import { NW_BODIES } from './bodies.js';
import { NW_HEADS } from './heads.js';
import { NW_EARS, NW_EYES, NW_MUZZLES } from './face.js';
import { NW_WINGS, NW_THUMBS } from './wings.js';
import { NW_LEGS, NW_TAILS } from './limbs.js';
import { NW_CRESTS, NW_RUFFS, NW_MARKINGS } from './dress.js';

export const NIGHTWING_PARTS = {
  body: NW_BODIES, head: NW_HEADS, ears: NW_EARS, eyes: NW_EYES, muzzle: NW_MUZZLES, wings: NW_WINGS,
  legs: NW_LEGS, tail: NW_TAILS, crest: NW_CRESTS, ruff: NW_RUFFS, thumbs: NW_THUMBS, markings: NW_MARKINGS,
};
