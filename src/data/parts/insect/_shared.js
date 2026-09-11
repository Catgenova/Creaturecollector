// Insect builders: the shared constructors namespaced with "i.".
// Insects are small and low: a body is 60 to 90 wide and 30 tall, the head about 24 across,
// legs jointed sticks about 26 long. Three leg pairs hang from the thorax and abdomen.
import { partBuilders, torsoShade } from '../_builders.js';
import { L } from '../_dsl.js';

const insectBuilders = partBuilders('i.');
export const iBody = insectBuilders.body;
export const iPart = insectBuilders.part;
export { torsoShade };

/** An outlined stick: a dark wide stroke under a coloured narrower one. */
export function stick(d, w = 3, role = 'p') {
  return [L(d, 'k', w + 2.6), L(d, role, w)];
}
