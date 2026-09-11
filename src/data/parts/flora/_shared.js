// Flora builders: the shared constructors namespaced with "p." (plants).
// Stems about 30 wide and 55 tall, blooms about 40 across sitting on top, leaves reaching out like arms
// and roots reaching down like legs.
import { partBuilders, torsoShade } from '../_builders.js';

const floraBuilders = partBuilders('p.');
export const flBody = floraBuilders.body;
export const flLeg = floraBuilders.leg;
export const flPart = floraBuilders.part;
export { torsoShade };
