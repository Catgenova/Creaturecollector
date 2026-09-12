// What a move looks like when it lands. Nothing is drawn ahead of time: an effect is a handful of
// spans over the target's stage, coloured by the move's own type and animated once by the stylesheet.
//
// Every effect runs a single pass and is gone inside 600ms, so nothing in here flashes more than once —
// a page with several effects still stays well under three flashes a second. Reduced motion skips them
// altogether rather than shortening them.
import { h } from './dom.js';
import { TYPE_INFO } from '../data/types.js';

/** Which shape a type throws. Eleven shapes over eighteen types: the colour does the rest. */
export const EFFECT_OF_TYPE = {
  Normal: 'impact', Fighting: 'impact',
  Fire: 'ember', Water: 'splash', Electric: 'spark', Grass: 'leaf', Ice: 'shard',
  Rock: 'chunk', Ground: 'chunk', Steel: 'gleam',
  Poison: 'bubble', Bug: 'bubble',
  Ghost: 'wisp', Dark: 'wisp',
  Psychic: 'ring', Fairy: 'ring', Dragon: 'ring',
  Flying: 'gust',
};
/** How many pieces each shape throws, and how long it takes to be gone. */
export const EFFECT_SHAPE = {
  impact: { n: 4, ms: 420 }, ember: { n: 6, ms: 560 }, splash: { n: 6, ms: 520 }, spark: { n: 4, ms: 400 },
  leaf: { n: 5, ms: 600 }, shard: { n: 5, ms: 520 }, chunk: { n: 5, ms: 520 }, gleam: { n: 2, ms: 420 },
  bubble: { n: 5, ms: 560 }, wisp: { n: 4, ms: 580 }, ring: { n: 3, ms: 480 }, gust: { n: 4, ms: 440 },
};

export function effectKind(mv) { return (mv && EFFECT_OF_TYPE[mv.type]) || 'impact'; }

/**
 * Put a move's effect over an element and take it away again. Returns the node, or null when there is
 * nothing to draw (no host, or the player asked for less motion).
 * opts.crit doubles nothing — it only widens the burst a little, so a critical hit reads at a glance.
 */
export function playMoveEffect(host, mv, opts = {}) {
  if (!host || opts.reduced) return null;
  const kind = effectKind(mv);
  const shape = EFFECT_SHAPE[kind] || EFFECT_SHAPE.impact;
  const colour = (TYPE_INFO[mv && mv.type] || TYPE_INFO.Normal).color;
  const layer = h('div', {
    class: `fx fx-${kind}${opts.crit ? ' fx-crit' : ''}${opts.eff >= 2 ? ' fx-super' : ''}`,
    'aria-hidden': 'true',
    style: { '--fx': colour, '--fx-ms': `${shape.ms}ms` },
  }, Array.from({ length: shape.n }, (_, i) => h('i', { style: { '--i': String(i), '--n': String(shape.n) } })));
  host.append(layer);
  setTimeout(() => layer.remove(), shape.ms + 80);
  return layer;
}
