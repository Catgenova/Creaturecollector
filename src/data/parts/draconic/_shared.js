// Draconic builders: the shared constructors namespaced with "d." (dragons).
// Four-legged torsos about 64 wide and 38 tall, a horned head reaching forward and up, wings rising from the
// back, a long tail and a breath effect at the snout.
import { partBuilders, torsoShade } from '../_builders.js';

const draconicBuilders = partBuilders('d.');
export const drBody = draconicBuilders.body;
export const drLeg = draconicBuilders.leg;
export const drPart = draconicBuilders.part;
export { torsoShade };
