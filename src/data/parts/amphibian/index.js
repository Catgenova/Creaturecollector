// The amphibian library, one list per rig slot.
import { A_BODIES } from './bodies.js';
import { A_HEADS } from './heads.js';
import { A_EYES, A_MOUTHS, A_GILLS, A_THROATS, A_CRESTS } from './face.js';
import { A_LEGS_FRONT, A_LEGS_BACK, A_TAILS } from './limbs.js';
import { A_BACKS, A_PATTERNS } from './back.js';

export const AMPHIBIAN_PARTS = {
  body: A_BODIES, head: A_HEADS, eyes: A_EYES, mouth: A_MOUTHS, gills: A_GILLS, legsFront: A_LEGS_FRONT, legsBack: A_LEGS_BACK,
  tail: A_TAILS, throat: A_THROATS, crest: A_CRESTS, back: A_BACKS, pattern: A_PATTERNS,
};
