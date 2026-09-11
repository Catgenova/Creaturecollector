// Poses: small socket deltas that break the one stiff stance every creature used to share.
//
// A pose is a table of per-slot adjustments applied where a part sits on its parent's
// socket: dx/dy move it (parent units), da turns it (degrees, clockwise), ds scales it.
// `far` overrides the far-side copy so a near and a far leg can swing apart. The body is
// the root, so its delta tilts the whole creature; the feet still find the ground because
// the renderer measures the posed parts.
//
// Sign guide for a right-facing creature: negative da on the body or head lifts the nose;
// negative da on a hanging leg swings the foot forward; positive da raises a tail or wing
// that points backward.
//
// Idle poses follow temperament, read from the combat style: melee fighters brace forward,
// ranged ones crouch low, magic users hold a poised, upright stance. Fights flash `attack`
// on the mover and `hurt` on the target.
import { combatStyleOf } from '../creature/genome.js';

export const POSE_NAMES = ['stand', 'brace', 'crouch', 'poise', 'attack', 'hurt'];
export const IDLE_BY_STYLE = { melee: 'brace', ranged: 'crouch', magic: 'poise' };

/** The shared four-legged core: head, forelegs, hind legs, tail and the body tilt. */
const quadCore = {
  stand: {},
  brace: { body: { da: 3, dx: 2 }, head: { da: 5, dx: 2, dy: 1 }, legsFront: { da: -6 }, legsBack: { da: 6 }, tail: { da: 10 } },
  crouch: { body: { dy: 5, da: 2 }, head: { dy: 2, da: 3 }, legsFront: { ds: 0.88, da: -4 }, legsBack: { ds: 0.9, da: 4 }, tail: { da: 14 } },
  poise: { body: { da: -4, dy: -1 }, head: { da: -6, dy: -2 }, legsFront: { da: 4 }, legsBack: { da: -4 }, tail: { da: 2 } },
  attack: { body: { da: 5, dx: 6 }, head: { da: -4, dx: 5 }, legsFront: { da: -22, far: { da: -10 } }, legsBack: { da: 14, far: { da: 8 } }, tail: { da: 16 } },
  hurt: { body: { da: -8, dx: -4 }, head: { da: -14, dx: -3 }, legsFront: { da: -12, far: { da: 10 } }, legsBack: { da: 12 }, tail: { da: 8 } },
};

/** Merge per-class extras onto the shared core, pose by pose. */
function mergePose(core, extras) {
  const out = {};
  for (const name of POSE_NAMES) out[name] = { ...(core[name] || {}), ...((extras && extras[name]) || {}) };
  return out;
}

export const POSES = {
  mammal: mergePose(quadCore, {
    brace: { ears: { da: -4 } },
    poise: { ears: { da: 4 }, mane: { ds: 1.04 } },
    attack: { ears: { da: -14 }, mane: { ds: 1.06 } },
    hurt: { ears: { da: -22 } },
  }),
  reptile: mergePose(quadCore, {
    brace: { jaw: { da: 4 }, wings: { da: -4 } },
    crouch: { wings: { da: -8 } },
    poise: { wings: { da: 8 }, crest: { ds: 1.05 } },
    attack: { jaw: { da: 12 }, wings: { da: 20, far: { da: 12 } }, crest: { da: -6 } },
    hurt: { jaw: { da: 14 }, wings: { da: 26, far: { da: 16 } } },
  }),
  amphibian: mergePose(quadCore, {
    brace: { throat: { ds: 1.08 } },
    crouch: { throat: { ds: 1.12 }, gills: { da: 6 } },
    poise: { gills: { da: -6 }, crest: { ds: 1.05 } },
    attack: { mouth: { ds: 1.15 }, throat: { ds: 1.15 }, gills: { da: 10 } },
    hurt: { mouth: { ds: 1.1 }, gills: { da: -14 } },
  }),
  bird: {
    stand: {},
    brace: { body: { da: 6, dx: 2 }, head: { dx: 3, dy: 1, da: 4 }, legs: { da: -6 }, tail: { da: 6 }, wings: { da: -4 } },
    crouch: { body: { dy: 4, da: 3 }, head: { dy: 3 }, legs: { ds: 0.85 }, wings: { da: 4, ds: 1.03 }, tail: { da: 8 } },
    poise: { body: { da: -5 }, head: { da: -6, dy: -3 }, wings: { da: -6 }, legs: { da: 4 }, tail: { da: -6 }, crest: { ds: 1.06 } },
    attack: { body: { da: 6, dx: 6 }, head: { dx: 5, da: 4 }, beak: { ds: 1.12 }, wings: { da: 24, far: { da: 14 } }, legs: { da: -10, far: { da: 6 } }, tail: { da: 10 } },
    hurt: { body: { da: -10, dx: -4 }, head: { da: -12, dy: -2 }, wings: { da: 30, far: { da: 18 } }, legs: { da: 12 }, tail: { da: -10 }, crest: { da: -10 } },
  },
  fish: {
    stand: {},
    brace: { body: { da: 4, dx: 3 }, pectoral: { da: -12 }, tail: { da: 6 }, dorsal: { ds: 1.05 } },
    crouch: { body: { da: 10, dy: 3 }, tail: { da: 12 }, pectoral: { da: 10 }, belly: { da: 6 } },
    poise: { body: { da: -8, dy: -4 }, tail: { da: -10 }, pectoral: { da: -8 }, dorsal: { da: -4, ds: 1.06 } },
    attack: { body: { da: 3, dx: 8 }, mouth: { ds: 1.15 }, tail: { da: 18 }, pectoral: { da: -18, far: { da: -8 } }, gills: { ds: 1.1 } },
    hurt: { body: { da: -10, dx: -5 }, tail: { da: -16 }, pectoral: { da: 20, far: { da: 10 } }, dorsal: { da: 8 } },
  },
  insect: {
    stand: {},
    brace: { body: { da: 3, dx: 2 }, head: { dx: 2, da: 4 }, legsFront: { da: -8 }, legsBack: { da: 6 }, antennae: { da: 8 }, mandibles: { ds: 1.05 } },
    crouch: { body: { dy: 4, da: 2 }, legsFront: { ds: 0.85, da: -6 }, legsMid: { ds: 0.85 }, legsBack: { ds: 0.85, da: 6 }, antennae: { da: -6 }, wings: { da: -4 } },
    poise: { body: { da: -5, dy: -2 }, head: { da: -6 }, legsFront: { da: 8 }, legsBack: { da: -6 }, wings: { da: 6 }, antennae: { da: -10 } },
    attack: { body: { da: 4, dx: 6 }, head: { dx: 4, da: 6 }, mandibles: { ds: 1.2, da: 4 }, legsFront: { da: -24, far: { da: -12 } }, legsMid: { da: -6 }, legsBack: { da: 12 }, antennae: { da: 14 }, wings: { da: 14 }, tail: { da: 10 } },
    hurt: { body: { da: -8, dx: -4 }, head: { da: -10 }, legsFront: { da: -14 }, legsBack: { da: 14 }, antennae: { da: -20 }, wings: { da: 22 } },
  },
  invertebrate: {
    stand: {},
    brace: { body: { da: 3, dx: 2 }, arms: { da: -10 }, legs: { da: -4 }, feelers: { da: 6 } },
    crouch: { body: { dy: 4 }, arms: { da: 6 }, legs: { ds: 0.88 }, skirt: { ds: 1.05 }, tail: { da: 6 } },
    poise: { body: { da: -4, dy: -3 }, arms: { da: -16 }, crown: { ds: 1.06 }, feelers: { da: -8 }, skirt: { ds: 1.04 } },
    attack: { body: { da: 3, dx: 6 }, arms: { da: -28, far: { da: -14 } }, legs: { da: -6 }, feelers: { da: 12 }, tail: { da: 14 }, mouth: { ds: 1.15 } },
    hurt: { body: { da: -8, dx: -4 }, arms: { da: 20 }, legs: { da: 8 }, feelers: { da: -18 }, skirt: { da: 6 }, tail: { da: -10 } },
  },
};

POSES.flora = {
  stand: {},
  brace: { body: { da: 3, dx: 2 }, head: { da: 5, dx: 2, dy: 1 }, leaves: { da: -8 }, vines: { da: 10 }, roots: { da: -3 } },
  crouch: { body: { dy: 4, da: 2 }, head: { dy: 2, da: 3 }, leaves: { ds: 0.9, da: 8 }, roots: { ds: 0.9 }, canopy: { ds: 0.96 } },
  poise: { body: { da: -4, dy: -1 }, head: { da: -6, dy: -2 }, leaves: { da: -10 }, canopy: { ds: 1.05 }, thorns: { ds: 1.05 } },
  attack: { body: { da: 5, dx: 6 }, head: { da: -4, dx: 5 }, leaves: { da: -26, far: { da: -12 } }, vines: { da: 18 }, mouth: { ds: 1.15 }, roots: { da: -6 } },
  hurt: { body: { da: -8, dx: -4 }, head: { da: -14, dx: -3 }, leaves: { da: 20, far: { da: 10 } }, vines: { da: -8 }, roots: { da: 8 } },
};

POSES.ooze = {
  stand: {},
  brace: { body: { da: 3, dx: 2 }, core: { dx: 1, dy: 1 }, pseudopods: { da: -10, far: { da: -4 } }, tendrils: { da: 8 }, crown: { da: 4 } },
  crouch: { body: { dy: 5, ds: 0.96 }, core: { dy: 2, ds: 0.95 }, pseudopods: { ds: 0.88, da: 6 }, base: { ds: 1.1 }, tendrils: { da: 12 } },
  poise: { body: { da: -3, dy: -2 }, core: { dy: -2, ds: 1.06 }, pseudopods: { da: 8, dy: -2 }, crown: { ds: 1.06 }, tendrils: { da: -6 } },
  attack: { body: { da: 4, dx: 6 }, core: { dx: 3, ds: 1.1 }, pseudopods: { da: -28, far: { da: -12 } }, tendrils: { da: 16 }, mouth: { ds: 1.15 }, drips: { dy: 2 } },
  hurt: { body: { da: -8, dx: -4, ds: 0.96 }, core: { dx: -2, dy: 1 }, pseudopods: { da: 18, far: { da: 10 } }, tendrils: { da: -10 }, crown: { da: -12 }, base: { ds: 1.08 } },
};

POSES.fungus = {
  stand: {},
  brace: { body: { da: 3, dx: 2 }, head: { da: 4, dx: 1 }, roots: { da: -4 }, spores: { dy: -2 }, gills: { ds: 1.04 } },
  crouch: { body: { dy: 4, da: 2 }, head: { dy: 2, ds: 0.94 }, roots: { ds: 0.9 }, veil: { ds: 1.06 }, shelves: { ds: 0.96 } },
  poise: { body: { da: -4, dy: -2 }, head: { da: -3, dy: -1 }, spores: { dy: -4, ds: 1.06 }, ring: { ds: 1.04 }, gills: { ds: 1.02 } },
  attack: { body: { da: 8, dx: 6 }, head: { da: 6, dx: 4 }, roots: { da: -12, far: { da: -6 } }, spores: { dx: 6, dy: -4, ds: 1.15 }, mouth: { ds: 1.15 }, gills: { ds: 1.08 } },
  hurt: { body: { da: -10, dx: -4 }, head: { da: -8, dx: -3 }, roots: { da: 10, far: { da: 6 } }, spores: { dy: 4 }, veil: { da: 6 }, shelves: { da: -6 } },
};

POSES.wyrm = {
  stand: {},
  brace: { body: { da: 3, dx: 2 }, head: { da: 5, dx: 2 }, legs: { da: -6, far: { da: -2 } }, tail: { da: 10 }, whiskers: { da: 6 } },
  crouch: { body: { dy: 5, da: 2 }, head: { dy: 2, da: 3 }, legs: { ds: 0.88 }, tail: { da: 14 }, mane: { ds: 0.96 } },
  poise: { body: { da: -4, dy: -2 }, head: { da: -8, dy: -2 }, legs: { da: 4 }, tail: { da: -6 }, mane: { ds: 1.06 }, whiskers: { da: -10 } },
  attack: { body: { da: 5, dx: 6 }, head: { da: -6, dx: 5 }, maw: { ds: 1.2 }, legs: { da: -22, far: { da: -10 } }, tail: { da: 18 }, whiskers: { da: 14 }, mane: { ds: 1.06 } },
  hurt: { body: { da: -8, dx: -4 }, head: { da: -14, dx: -3 }, legs: { da: 12, far: { da: 8 } }, tail: { da: -10 }, whiskers: { da: -18 }, horns: { da: -8 } },
};

POSES.draconic = mergePose(quadCore, {
  brace: { jaw: { da: 4 }, wings: { da: -4 } },
  crouch: { wings: { da: -8 }, spines: { ds: 0.96 } },
  poise: { wings: { da: 8 }, spines: { ds: 1.05 }, horns: { ds: 1.03 } },
  attack: { jaw: { da: 12 }, wings: { da: 20, far: { da: 12 } }, breath: { ds: 1.25, dx: 2 }, spines: { ds: 1.05 } },
  hurt: { jaw: { da: 14 }, wings: { da: 26, far: { da: 16 } }, horns: { da: -6 } },
});

/** The slot deltas of a pose on a rig ({} for an unknown pose or 'stand'). */
export function poseTable(rig, pose) { return (POSES[rig] && POSES[rig][pose]) || {}; }

/** The idle pose a creature holds, from its temperament (combat style). */
export function idlePoseFor(g) { return IDLE_BY_STYLE[combatStyleOf(g)] || 'stand'; }

/** The pose a render uses: an explicit valid name wins; mannequins stand; everyone else holds their idle pose. */
export function resolvePose(g, pose) {
  if (POSE_NAMES.includes(pose)) return pose;
  if (g && g.mannequin) return 'stand';
  return idlePoseFor(g);
}
