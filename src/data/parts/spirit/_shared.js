// Spirit builders: the shared constructors namespaced with "s." (spirit).
// Headless shrouds about 32 wide and 44 tall that hover above their shadow: the face sits on the body, arms of mist
// hang from its sides with the near hand holding a lantern, a wisp tail trails below, and hoods, chains, tatters,
// masks, veils and auras dress the shroud.
import { partBuilders, torsoShade } from '../_builders.js';

const spiritBuilders = partBuilders('s.');
export const spBody = spiritBuilders.body;
export const spPart = spiritBuilders.part;
export { torsoShade };
