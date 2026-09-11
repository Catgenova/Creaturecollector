// The flora library, one list per rig slot.
import { FL_BODIES } from './bodies.js';
import { FL_HEADS } from './heads.js';
import { FL_EYES, FL_MOUTHS } from './face.js';
import { FL_LEAVES, FL_ROOTS } from './limbs.js';
import { FL_VINES, FL_PODS, FL_THORNS } from './growth.js';
import { FL_CANOPY, FL_BARK, FL_FRUIT } from './back.js';

export const FLORA_PARTS = {
  body: FL_BODIES, head: FL_HEADS, eyes: FL_EYES, mouth: FL_MOUTHS, leaves: FL_LEAVES, roots: FL_ROOTS,
  vines: FL_VINES, pods: FL_PODS, thorns: FL_THORNS, canopy: FL_CANOPY, bark: FL_BARK, fruit: FL_FRUIT,
};
