// Skeletal builders: the shared constructors namespaced with "k." (bone).
// Ribcage torsos about 60 wide and 34 tall on four bone legs, a skull reaching forward, a spine for a tail,
// and a light where the heart was.
import { partBuilders, torsoShade } from '../_builders.js';

const skeletalBuilders = partBuilders('k.');
export const skBody = skeletalBuilders.body;
export const skLeg = skeletalBuilders.leg;
export const skPart = skeletalBuilders.part;
export { torsoShade };
