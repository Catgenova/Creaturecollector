// Wyrm builders: the shared constructors namespaced with "w." (wyrms).
// Serpentine coils about 65 wide and 45 tall, a head reaching forward and up from the front end, small legs
// hanging from the belly at two pairs of sockets, and a long tail trailing from the back end.
import { partBuilders, torsoShade } from '../_builders.js';

const wyrmBuilders = partBuilders('w.');
export const wyBody = wyrmBuilders.body;
export const wyLeg = wyrmBuilders.leg;
export const wyPart = wyrmBuilders.part;
export { torsoShade };
