// Nightwing builders: the shared constructors namespaced with "n." (night).
// Bat torsos about 50 wide and 32 tall that hover above their shadow, a head reaching forward, membrane wings
// spread from the shoulders behind the body, hooked legs hanging under the hips and a tail behind.
import { partBuilders, torsoShade } from '../_builders.js';

const nightwingBuilders = partBuilders('n.');
export const nwBody = nightwingBuilders.body;
export const nwLeg = nightwingBuilders.leg;
export const nwPart = nightwingBuilders.part;
export { torsoShade };
