// Ooze builders: the shared constructors namespaced with "o." (oozes).
// Blobs about 50 wide and 50 tall with the face and the core set straight into the body; pseudopods
// reach out from the sides, a puddle spreads under the bottom edge.
import { partBuilders, torsoShade } from '../_builders.js';

const oozeBuilders = partBuilders('o.');
export const ozBody = oozeBuilders.body;
export const ozLeg = oozeBuilders.leg;
export const ozPart = oozeBuilders.part;
export { torsoShade };
