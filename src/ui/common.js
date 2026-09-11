// UI pieces shared between screens.
import { h, svgEl } from './dom.js';
import { elementalOf } from '../creature/genome.js';
import { TYPE_INFO } from '../data/types.js';
import { renderCreatureSvg } from '../creature/render.js';

export function typeChip(type) {
  const info = TYPE_INFO[type] || { color: '#999', glyph: '?' };
  return h('span', { class: 'chip', style: { '--chip': info.color } }, h('b', {}, info.glyph), type);
}

export function typeChips(types) {
  return h('div', { class: 'chips' }, types.filter(Boolean).map(typeChip));
}

/** '◆ Fire Elemental' (or 'Fire-touched' for a fused descendant that kept some elemental parts), or null. */
export function elementalBadge(g) {
  const e = elementalOf(g);
  if (!e) return null;
  const label = e.pure ? `${e.name} Elemental` : `${e.name}-touched`;
  return h('span', { class: `elem-badge elem-${e.id}`, title: `${label}: its parts carry the ${e.name.toLowerCase()} element` }, `◆ ${label}`);
}

export function creatureEl(genome, opts) {
  return svgEl(renderCreatureSvg(genome, opts));
}

export function section(title, ...children) {
  return [h('h3', { class: 'sec' }, title), ...children];
}
