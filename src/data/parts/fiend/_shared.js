// Fiend builders: the shared constructors namespaced with "e." (evil).
// The first upright rig: torsos about 28 wide and 42 tall standing on two legs, a head on the neck, arms hanging
// from the shoulders with the near hand holding something, a tail and wings behind, marks clipped to the torso and
// an aura fitted behind it.
import { partBuilders, torsoShade } from '../_builders.js';

const fiendBuilders = partBuilders('e.');
export const fdBody = fiendBuilders.body;
export const fdLeg = fiendBuilders.leg;
export const fdPart = fiendBuilders.part;
export { torsoShade };
