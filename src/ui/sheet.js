// The creature sheet: a bottom sheet with the hero render (flip, stage, Elemental preview),
// base stats, parts, palette, traits and the shareable creature code. Opened from party rows,
// the collection, fusion previews and the fight view.
import { h, clear, copyText, toast } from './dom.js';
import { typeChips, creatureEl, section, elementalBadge, styleChip } from './common.js';
import { baseStats, encodeGenome, resolveParts, TRAIT_KEYS, speciesOf, rigOf, makeElemental, elementalOf, cladeOf } from '../creature/genome.js';
import { STAT_KEYS, STAT_NAMES } from '../data/damage.js';
import { ELEMENT_IDS, ELEMENTS } from '../data/elements.js';
import { stageOf, stageName } from '../data/evolution.js';
import { swatchCss } from '../creature/palette.js';
import { getPart } from '../data/parts/index.js';
import { slotsFor, slotName } from '../data/rigs.js';
import { cladeName } from '../data/clades.js';

function statRows(g) {
  const base = baseStats(g);
  const rows = [];
  for (const k of STAT_KEYS) {
    rows.push(h('span', {}, STAT_NAMES[k]), h('div', { class: 'bar' }, h('i', { style: { width: `${Math.min(100, base[k] / 1.6)}%` } })), h('b', {}, String(base[k])));
  }
  const total = STAT_KEYS.reduce((a, k) => a + base[k], 0);
  rows.push(h('span', {}, 'Total'), h('span', {}), h('b', {}, String(total)));
  return h('div', { class: 'stats' }, rows);
}

function partRows(g) {
  const resolved = resolveParts(g);
  const rig = rigOf(g);
  const rows = [];
  for (const slot of slotsFor(rig)) {
    const [e, c] = g.parts[slot];
    const shown = resolved[slot];
    const expressed = getPart(e);
    const carried = getPart(c);
    let label = shown ? shown.name : 'None';
    if (expressed && !expressed.none && (!shown || shown.id !== expressed.id)) label += ` (${expressed.name} does not fit)`;
    rows.push(h('span', {}, slotName(rig, slot)), h('span', {}, label, c !== e ? h('span', { class: 'carried' }, ` · carries ${carried ? carried.name : c}`) : null));
  }
  return h('div', { class: 'kv' }, rows);
}

function traitRows(g) {
  const rows = [];
  for (const k of TRAIT_KEYS) rows.push(h('span', {}, k), h('div', { class: 'bar' }, h('i', { style: { width: `${Math.round(g.traits[k] * 100)}%` } })), h('b', {}, g.traits[k].toFixed(2)));
  return h('div', { class: 'stats' }, rows);
}

let activeSheet = null;
export function closeSheet() { if (activeSheet) { activeSheet(); activeSheet = null; } }

export function openSheet(g, sheetOpts = {}) {
  closeSheet();
  const sp = speciesOf(g);
  const code = encodeGenome(g);
  let facing = 'right';
  let shown = g; // the sheet can preview the creature as an Elemental without changing it
  let stage = stageOf(sheetOpts.level); // and at any evolution stage
  const hero = h('div', { class: 'hero' }, creatureEl(g, { size: 260, facing, fit: true, stage }));
  const redraw = () => clear(hero).append(creatureEl(shown, { size: 260, facing, fit: true, stage }));
  const stageRow = h('div', { class: 'chips-row stage-row' }, [1, 2, 3].map((st) => h('button', { class: `btn small stage-pick${stage === st ? ' on' : ''}`, type: 'button', title: st === 1 ? 'Below level 33' : st === 2 ? 'Level 33 and up' : 'Level 66 and up', onclick: () => { stage = st; for (const b of stageRow.children) b.classList.toggle('on', Number(b.dataset.stage) === st); redraw(); }, dataset: { stage: String(st) } }, stageName(st))));
  const close = () => { backdrop.remove(); sheet.remove(); document.removeEventListener('keydown', onKey); if (activeSheet === close) activeSheet = null; };
  activeSheet = close;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: close });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': g.name },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' },
      h('h2', {}, g.name, g.shiny ? ' ✦' : ''),
      typeChips(g.types),
      styleChip(g),
      elementalBadge(g),
      h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    h('p', { class: 'meta' }, sp ? `${sp.name} · ${sp.tier}` : 'Fusion', ` · ${cladeName(cladeOf(g))} · gen ${g.gen} · seed ${g.seed}`),
    hero,
    stageRow,
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => { facing = facing === 'right' ? 'left' : 'right'; redraw(); } }, 'Flip'),
      h('button', { class: 'btn', onclick: async () => toast((await copyText(code)) ? 'Code copied' : 'Copy failed, select the text below') }, 'Copy code'),
      elementalOf(g) ? null : h('select', { class: 'btn elem-preview', title: 'Preview this creature as an Elemental (one wild creature in a thousand is born as one)', onchange: (e) => {
        const elem = e.target.value;
        shown = elem ? makeElemental(JSON.parse(JSON.stringify(g)), elem) : g;
        redraw();
      } }, h('option', { value: '' }, 'Elemental preview'), ...ELEMENT_IDS.map((id) => h('option', { value: id }, `${ELEMENTS[id].name} Elemental`)))),
    sp ? h('p', { class: 'desc' }, sp.desc) : null,
    ...section('Base stats', statRows(g)),
    ...section('Parts', partRows(g)),
    ...section('Palette', h('div', { class: 'swatches' }, ['c1', 'c2', 'c3', 'eye'].map((k) => h('span', { class: 'sw', title: k, style: { background: swatchCss(g.palette[k]) } })))),
    ...section('Traits', traitRows(g)),
    ...section('Creature code', h('textarea', { class: 'code', readonly: true, rows: 3, onclick: (e) => e.target.select() }, code)),
  );
  document.body.append(backdrop, sheet);
  document.addEventListener('keydown', onKey);
}
