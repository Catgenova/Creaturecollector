// The fish library, one list per rig slot.
import { F_BODIES } from './bodies.js';
import { F_EYES } from './eyes.js';
import { F_MOUTHS } from './mouths.js';
import { F_DORSALS, F_PECTORALS, F_TAILS, F_BELLIES } from './fins.js';
import { F_GILLS, F_CRESTS, F_BARBELS, F_SPINES, F_PATTERNS } from './details.js';

export const FISH_PARTS = {
  body: F_BODIES, eyes: F_EYES, mouth: F_MOUTHS, dorsal: F_DORSALS, pectoral: F_PECTORALS, tail: F_TAILS,
  belly: F_BELLIES, gills: F_GILLS, crest: F_CRESTS, barbels: F_BARBELS, spines: F_SPINES, pattern: F_PATTERNS,
};
