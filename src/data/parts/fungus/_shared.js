// Fungus builders: the shared constructors namespaced with "g." (fungi).
// Caps about 60 wide and 35 tall are the root part; the stalk (the "head" slot) hangs from the cap's stalk
// socket, carries the face, and reaches the ground through the roots.
import { partBuilders, torsoShade } from '../_builders.js';

const fungusBuilders = partBuilders('g.');
export const fgBody = fungusBuilders.body;
export const fgLeg = fungusBuilders.leg;
export const fgPart = fungusBuilders.part;
export { torsoShade };
