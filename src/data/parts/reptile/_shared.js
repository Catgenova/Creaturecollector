// Reptile builders: the shared constructors namespaced with "r.".
// Reptiles are long and low: a quadruped torso is about 95 wide and 38 tall,
// heads 40 to 55 long, legs about 28 long and splayed. Serpents coil.
import { partBuilders, torsoShade, toes, sock, claws } from '../_builders.js';

const reptileBuilders = partBuilders('r.');
export const rBody = reptileBuilders.body;
export const rLeg = reptileBuilders.leg;
export const rPart = reptileBuilders.part;
export { torsoShade, toes, sock, claws };
