// UI pieces shared between screens.
import { h, svgEl } from './dom.js';
import { elementalOf, combatStyleOf } from '../creature/genome.js';
import { DAMAGE_TYPES } from '../data/damage.js';
import { stageOf, STAGE_MARK, stageName } from '../data/evolution.js';
import { TYPE_INFO } from '../data/types.js';
import { renderCreatureSvg } from '../creature/render.js';
import { accuracyText, moveEffects } from '../data/moves.js';

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

/** 'Melee', 'Ranged' or 'Magic' chip for a genome's combat style (or a battler's, via opts.style). */
export function styleChip(g, style) {
  const id = style || combatStyleOf(g);
  const dt = DAMAGE_TYPES[id];
  return h('span', { class: `chip style-chip style-${id}`, style: { '--chip': dt.color }, title: `${dt.name} style: its best attack stat is ${dt.name}. ${dt.name} beats ${DAMAGE_TYPES[dt.beats].name}.` }, h('b', {}, dt.icon), dt.name);
}

/** 'II' / 'III' chip for an evolved creature's level, or null before level 33. */
export function stageBadge(level) {
  const st = stageOf(level);
  return st > 1 ? h('span', { class: `stage-badge stage-${st}`, title: `${stageName(st)} evolution` }, STAGE_MARK[st]) : null;
}

export function creatureEl(genome, opts) {
  return svgEl(renderCreatureSvg(genome, opts));
}

export function section(title, ...children) {
  return [h('h3', { class: 'sec' }, title), ...children];
}

/** A move's name with its type, damage type and power, accuracy and PP, its side effects with their odds, and an optional tag. */
export function moveInfoEl(move, tag) {
  const dt = DAMAGE_TYPES[move.cat];
  const fx = moveEffects(move);
  return h('div', { class: 'shop-info' }, h('b', {}, move.name),
    h('div', { class: 'shop-meta' },
      h('span', { class: 'chip', style: { '--chip': TYPE_INFO[move.type].color } }, move.type),
      h('span', { class: 'chip dt-chip', style: { '--chip': dt ? dt.color : '#9aa0b4' } }, dt ? `${dt.name}${move.power ? ` ${move.power}` : ''}` : 'Status'),
      h('span', {}, `${accuracyText(move)} · ${move.pp} PP`),
      tag ? h('span', { class: 'shop-tag' }, tag) : null),
    fx.length ? h('div', { class: 'shop-fx' }, fx.map((t) => h('em', {}, t))) : null);
}
