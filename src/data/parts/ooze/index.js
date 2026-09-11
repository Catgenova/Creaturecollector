// The ooze library, one list per rig slot.
import { OZ_BODIES } from './bodies.js';
import { OZ_CORES, OZ_EYES, OZ_MOUTHS } from './face.js';
import { OZ_PSEUDOPODS, OZ_BASES } from './limbs.js';
import { OZ_DRIPS, OZ_CROWNS, OZ_TENDRILS } from './growth.js';
import { OZ_INCLUSIONS, OZ_SHEEN, OZ_BUMPS } from './surface.js';

export const OOZE_PARTS = {
  body: OZ_BODIES, core: OZ_CORES, eyes: OZ_EYES, mouth: OZ_MOUTHS, pseudopods: OZ_PSEUDOPODS, drips: OZ_DRIPS,
  crown: OZ_CROWNS, tendrils: OZ_TENDRILS, base: OZ_BASES, inclusions: OZ_INCLUSIONS, sheen: OZ_SHEEN, bumps: OZ_BUMPS,
};
