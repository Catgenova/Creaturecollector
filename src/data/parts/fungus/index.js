// The fungus library, one list per rig slot.
import { FG_CAPS } from './caps.js';
import { FG_STALKS } from './stalks.js';
import { FG_EYES, FG_MOUTHS } from './face.js';
import { FG_GILLS, FG_SPORES, FG_ROOTS } from './growth.js';
import { FG_RINGS, FG_SHELVES, FG_VEILS } from './dress.js';
import { FG_GLOW, FG_PATTERNS } from './fx.js';

export const FUNGUS_PARTS = {
  body: FG_CAPS, head: FG_STALKS, eyes: FG_EYES, mouth: FG_MOUTHS, gills: FG_GILLS, spores: FG_SPORES,
  roots: FG_ROOTS, ring: FG_RINGS, shelves: FG_SHELVES, veil: FG_VEILS, glow: FG_GLOW, pattern: FG_PATTERNS,
};
