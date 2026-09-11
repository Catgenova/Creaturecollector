// The myriapod library, one list per rig slot.
import { MY_BODIES } from './bodies.js';
import { MY_HEADS } from './heads.js';
import { MY_EYES, MY_MANDIBLES, MY_ANTENNAE, MY_VENOM } from './face.js';
import { MY_LEGS, MY_TAILS } from './limbs.js';
import { MY_PLATES, MY_BRISTLES } from './back.js';
import { MY_GLOW, MY_BANDS } from './fx.js';

export const MYRIAPOD_PARTS = {
  body: MY_BODIES, head: MY_HEADS, eyes: MY_EYES, mandibles: MY_MANDIBLES, antennae: MY_ANTENNAE, legs: MY_LEGS,
  tail: MY_TAILS, plates: MY_PLATES, bristles: MY_BRISTLES, glow: MY_GLOW, bands: MY_BANDS, venom: MY_VENOM,
};
