// The wyrm library, one list per rig slot.
import { WY_BODIES } from './bodies.js';
import { WY_HEADS } from './heads.js';
import { WY_EYES, WY_MAWS } from './face.js';
import { WY_WHISKERS, WY_LEGS, WY_TAILS } from './limbs.js';
import { WY_MANES, WY_PLATES, WY_HORNS } from './crest.js';
import { WY_GLOW, WY_BANDS } from './fx.js';

export const WYRM_PARTS = {
  body: WY_BODIES, head: WY_HEADS, eyes: WY_EYES, maw: WY_MAWS, whiskers: WY_WHISKERS, legs: WY_LEGS,
  tail: WY_TAILS, mane: WY_MANES, plates: WY_PLATES, horns: WY_HORNS, glow: WY_GLOW, bands: WY_BANDS,
};
