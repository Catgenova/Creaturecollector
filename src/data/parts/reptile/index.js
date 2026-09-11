// The reptile library, one list per rig slot.
import { R_BODIES } from './bodies.js';
import { R_HEADS } from './heads.js';
import { R_EYES } from './eyes.js';
import { R_JAWS } from './jaws.js';
import { R_CRESTS } from './crests.js';
import { R_LEGS_FRONT, R_LEGS_BACK } from './legs.js';
import { R_TAILS } from './tails.js';
import { R_BACKS } from './backs.js';
import { R_WINGS } from './wings.js';
import { R_THROATS } from './throats.js';
import { R_SCALES } from './scales.js';

export const REPTILE_PARTS = {
  body: R_BODIES, head: R_HEADS, eyes: R_EYES, jaw: R_JAWS, crest: R_CRESTS,
  legsFront: R_LEGS_FRONT, legsBack: R_LEGS_BACK, tail: R_TAILS, back: R_BACKS,
  wings: R_WINGS, throat: R_THROATS, scales: R_SCALES,
};
