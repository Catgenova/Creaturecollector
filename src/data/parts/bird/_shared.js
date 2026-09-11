// Bird builders: the shared constructors namespaced with "b.".
// Birds perch upright: a mid-sized body is about 60 wide and 65 tall, the head about 34 across,
// legs 16 to 28 long. Wings are drawn folded along the flank.
import { partBuilders, torsoShade } from '../_builders.js';

const birdBuilders = partBuilders('b.');
export const bBody = birdBuilders.body;
export const bPart = birdBuilders.part;
export { torsoShade };
