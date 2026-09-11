// Part registry. Part ids are stable forever: a saved creature must decode the
// same way after the library grows, so never rename or reuse an id.
//
// Parts are grouped by rig, then slot. A part fits any body of its own rig
// unless it lists the body kinds it accepts in `fit`.
import { RIGS, slotsFor } from '../rigs.js';
import { BODIES } from './bodies.js';
import { HEADS } from './heads.js';
import { EYES, MOUTHS } from './faces.js';
import { CROWNS } from './crowns.js';
import { LEGS, ARMS, WINGS } from './limbs.js';
import { TAILS } from './tails.js';
import { BACKS } from './backs.js';
import { PATTERNS } from './patterns.js';
import { MAMMAL_PARTS } from './mammal/index.js';
import { REPTILE_PARTS } from './reptile/index.js';
import { FISH_PARTS } from './fish/index.js';

export const RIG_PARTS = {
  legacy: {
    body: BODIES, head: HEADS, eyes: EYES, mouth: MOUTHS, crown: CROWNS, legs: LEGS,
    arms: ARMS, wings: WINGS, tail: TAILS, back: BACKS, pattern: PATTERNS,
  },
  mammal: MAMMAL_PARTS,
  reptile: REPTILE_PARTS,
  fish: FISH_PARTS,
};

export const PARTS = new Map();
for (const rig of Object.keys(RIG_PARTS)) {
  if (!RIGS[rig]) throw new Error(`parts listed for unknown rig ${rig}`);
  for (const slot of slotsFor(rig)) {
    const list = RIG_PARTS[rig][slot];
    if (!Array.isArray(list)) throw new Error(`rig ${rig} has no parts for slot ${slot}`);
    for (const part of list) {
      if (PARTS.has(part.id)) throw new Error(`duplicate part id ${part.id}`);
      if (part.slot !== slot) throw new Error(`part ${part.id} listed under slot ${slot} but declares ${part.slot}`);
      part.rig = rig;
      PARTS.set(part.id, part);
    }
  }
}

export function getPart(id) { return PARTS.get(id) || null; }

/** Does this part fit on a body of the given kind? Parts without a fit list fit every body in their rig. */
export function partFits(part, bodyKind) {
  return !part || part.none || !part.fit || part.fit.includes(bodyKind);
}

/** All parts of a rig's slot. */
export function partsOf(rig, slot) {
  const r = RIG_PARTS[rig] || RIG_PARTS.legacy;
  return r[slot] || [];
}

/** Parts of a rig's slot that fit the given body kind (includes the slot's "none" entry when it has one). */
export function partsFor(rig, slot, bodyKind) {
  return partsOf(rig, slot).filter((p) => partFits(p, bodyKind));
}

export function partCount() { return PARTS.size; }
