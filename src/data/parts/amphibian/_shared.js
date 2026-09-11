// Amphibian builders: the shared constructors namespaced with "a.".
// Squat bodies about 70 wide and 40 tall, wide flat heads about 45 across, folded springy legs.
import { partBuilders, torsoShade, toes } from '../_builders.js';

const amphBuilders = partBuilders('a.');
export const aBody = amphBuilders.body;
export const aLeg = amphBuilders.leg;
export const aPart = amphBuilders.part;
export { torsoShade, toes };
