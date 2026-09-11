// The mammal library, one list per rig slot.
import { M_BODIES } from './bodies.js';
import { M_HEADS } from './heads.js';
import { M_EARS } from './ears.js';
import { M_EYES } from './eyes.js';
import { M_MUZZLES } from './muzzles.js';
import { M_LEGS_FRONT, M_LEGS_BACK } from './legs.js';
import { M_TAILS } from './tails.js';
import { M_MANES } from './manes.js';
import { M_HORNS } from './horns.js';
import { M_BACKS } from './backs.js';
import { M_MARKINGS } from './markings.js';

export const MAMMAL_PARTS = {
  body: M_BODIES, head: M_HEADS, ears: M_EARS, eyes: M_EYES, muzzle: M_MUZZLES,
  legsFront: M_LEGS_FRONT, legsBack: M_LEGS_BACK, tail: M_TAILS, mane: M_MANES,
  horns: M_HORNS, back: M_BACKS, markings: M_MARKINGS,
};
