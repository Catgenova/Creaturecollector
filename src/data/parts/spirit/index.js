// The spirit library, one list per rig slot.
import { SP_BODIES } from './bodies.js';
import { SP_EYES, SP_MOUTHS, SP_MASKS } from './face.js';
import { SP_ARMS, SP_TAILS, SP_LANTERNS } from './limbs.js';
import { SP_HOODS, SP_CHAINS, SP_TATTERS } from './dress.js';
import { SP_AURAS, SP_VEILS } from './fx.js';

export const SPIRIT_PARTS = {
  body: SP_BODIES, eyes: SP_EYES, mouth: SP_MOUTHS, arms: SP_ARMS, tail: SP_TAILS, hood: SP_HOODS,
  chains: SP_CHAINS, lantern: SP_LANTERNS, aura: SP_AURAS, tatters: SP_TATTERS, mask: SP_MASKS, veil: SP_VEILS,
};
