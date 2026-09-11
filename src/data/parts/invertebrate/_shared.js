// Invertebrate builders: the shared constructors namespaced with "v.".
// Soft bodies about 70 wide and 40 tall, drawn low or floating; the face sits on the body.
import { partBuilders, torsoShade } from '../_builders.js';
import { L } from '../_dsl.js';

const invBuilders = partBuilders('v.');
export const vBody = invBuilders.body;
export const vPart = invBuilders.part;
export { torsoShade };

/** An outlined tendril: a dark wide stroke under a coloured narrower one. */
export function tendril(d, w = 4, role = 'p') {
  return [L(d, 'k', w + 3), L(d, role, w)];
}
