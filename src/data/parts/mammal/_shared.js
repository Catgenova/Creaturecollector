// Mammal builders: the shared constructors namespaced with "m.".
// Every mammal part is authored facing right at a common scale: a mid-sized
// quadruped torso is about 90 wide and 50 tall, its head about 45 across, its
// legs about 40 long.
import { partBuilders, torsoShade, toes, sock } from '../_builders.js';

const mammalBuilders = partBuilders('m.');
export const mBody = (o) => mammalBuilders.body({ kind: 'mammal.quad', ...o });
export const mLeg = mammalBuilders.leg;
export const mPart = mammalBuilders.part;
export { torsoShade, toes, sock };
