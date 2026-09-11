// Crystalline builders: the shared constructors namespaced with "c." (crystal).
// Faceted geode torsos about 60 wide and 36 tall on four angular legs, a faceted head reaching forward, a crystal
// tail behind, crystal clusters on the spine and a glow fitted behind the body.
import { partBuilders, torsoShade } from '../_builders.js';

const crystallineBuilders = partBuilders('c.');
export const crBody = crystallineBuilders.body;
export const crLeg = crystallineBuilders.leg;
export const crPart = crystallineBuilders.part;
export { torsoShade };
