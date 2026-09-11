// Part registry. Part ids are stable forever: a saved creature must decode the
// same way after the library grows, so never rename or reuse an id.
import { BODIES } from './bodies.js';
import { HEADS } from './heads.js';
import { EYES, MOUTHS } from './faces.js';
import { CROWNS } from './crowns.js';
import { LEGS, ARMS, WINGS } from './limbs.js';
import { TAILS } from './tails.js';
import { BACKS } from './backs.js';
import { PATTERNS } from './patterns.js';

export const SLOTS = ['body', 'head', 'eyes', 'mouth', 'crown', 'legs', 'arms', 'wings', 'tail', 'back', 'pattern'];
export const SLOT_NAMES = {
  body: 'Body', head: 'Head', eyes: 'Eyes', mouth: 'Mouth', crown: 'Crown', legs: 'Legs',
  arms: 'Arms', wings: 'Wings', tail: 'Tail', back: 'Back', pattern: 'Pattern',
};

export const PARTS_BY_SLOT = {
  body: BODIES, head: HEADS, eyes: EYES, mouth: MOUTHS, crown: CROWNS, legs: LEGS,
  arms: ARMS, wings: WINGS, tail: TAILS, back: BACKS, pattern: PATTERNS,
};

export const PARTS = new Map();
for (const slot of SLOTS) {
  for (const part of PARTS_BY_SLOT[slot]) {
    if (PARTS.has(part.id)) throw new Error(`duplicate part id ${part.id}`);
    if (part.slot !== slot) throw new Error(`part ${part.id} listed under slot ${slot} but declares ${part.slot}`);
    PARTS.set(part.id, part);
  }
}

export function getPart(id) { return PARTS.get(id) || null; }

/** Does this part fit on a body of the given kind? Parts without a fit list fit everything in their rig. */
export function partFits(part, bodyKind) {
  return !part || part.none || !part.fit || part.fit.includes(bodyKind);
}

/** All parts for a slot that fit the given body kind (includes the slot's "none" entry when it has one). */
export function partsFor(slot, bodyKind) {
  return PARTS_BY_SLOT[slot].filter((p) => partFits(p, bodyKind));
}

export function partCount() { return PARTS.size; }
