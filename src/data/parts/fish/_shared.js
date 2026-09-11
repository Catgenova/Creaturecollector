// Fish builders: the shared constructors namespaced with "f.".
// Fish float: bodies declare `hover` and carry the face themselves (no head slot).
// A mid-sized fish body is about 85 wide and 55 tall; fins are drawn from their root.
import { partBuilders, torsoShade } from '../_builders.js';

const fishBuilders = partBuilders('f.');
export const fBody = fishBuilders.body;
export const fPart = fishBuilders.part;
export { torsoShade };
