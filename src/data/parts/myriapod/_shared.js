// Myriapod builders: the shared constructors namespaced with "y." (many legs).
// Long segmented bodies about 72 wide and 24 tall, a head at the front, one leg part drawn under three segments
// on each side, a tail end behind, plates and bristles on the back and a glow fitted behind the body.
import { partBuilders, torsoShade } from '../_builders.js';

const myriapodBuilders = partBuilders('y.');
export const myBody = myriapodBuilders.body;
export const myPart = myriapodBuilders.part;
export { torsoShade };
