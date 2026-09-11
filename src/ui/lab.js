// Creature Lab: roll seeded creatures, inspect genes, copy and load creature codes.
import { h, clear, copyText, toast } from './dom.js';
import { typeChips, creatureEl, section } from './common.js';
import { makeRng, freshSeed } from '../core/rng.js';
import { randomGenome, speciesGenome, baseStats, encodeGenome, decodeGenome, resolveParts, STAT_KEYS, STAT_NAMES, TRAIT_KEYS, speciesOf, rigOf } from '../creature/genome.js';
import { swatchCss } from '../creature/palette.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { getPart } from '../data/parts/index.js';
import { slotsFor, slotName } from '../data/rigs.js';
import { addToPool } from './state.js';
import { cladeName } from '../data/clades.js';
import { cladeOf } from '../creature/genome.js';

const labState = { seed: null, species: 'random', count: 12 };

function seedFromUrl() {
  try { return new URLSearchParams(location.search).get('seed'); } catch { return null; }
}

function rollGenomes() {
  const out = [];
  for (let i = 0; i < labState.count; i++) {
    const rng = makeRng(`${labState.seed}:${i}`);
    const sp = SPECIES_BY_ID[labState.species];
    out.push(sp ? speciesGenome(sp, rng) : randomGenome(rng));
  }
  return out;
}

export function renderLabScreen(root) {
  if (!labState.seed) labState.seed = (seedFromUrl() || freshSeed()).toUpperCase();
  clear(root);

  const seedInput = h('input', { class: 'seed', type: 'text', value: labState.seed, spellcheck: 'false', autocapitalize: 'characters', autocomplete: 'off', 'aria-label': 'Seed', placeholder: 'Seed' });
  const speciesSel = h('select', { 'aria-label': 'Species' },
    h('option', { value: 'random' }, 'Any species'),
    SPECIES.map((s) => h('option', { value: s.id, selected: labState.species === s.id }, `${s.name}  (${s.types.join(' / ')})`)));
  speciesSel.addEventListener('change', () => { labState.species = speciesSel.value; draw(); });

  const grid = h('div', { class: 'grid' });
  const codeInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a creature code (CC1....)', 'aria-label': 'Creature code', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });

  const applySeed = (seed) => {
    labState.seed = (seed || freshSeed()).toUpperCase();
    seedInput.value = labState.seed;
    draw();
  };

  const toolbar = h('div', { class: 'toolbar' },
    seedInput,
    h('button', { class: 'btn', onclick: () => applySeed(seedInput.value.trim()) }, 'Go'),
    h('button', { class: 'btn primary', onclick: () => applySeed(null) }, 'Roll'),
    speciesSel,
  );
  seedInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applySeed(seedInput.value.trim()); });

  const loader = h('div', { class: 'toolbar' },
    codeInput,
    h('button', { class: 'btn', onclick: () => {
      try { openSheet(decodeGenome(codeInput.value)); codeInput.value = ''; }
      catch (e) { toast(e.message); }
    } }, 'Load'),
  );

  function draw() {
    clear(grid);
    for (const g of rollGenomes()) {
      grid.append(h('button', { class: 'card', type: 'button', onclick: () => openSheet(g) },
        creatureEl(g, { size: 160 }),
        h('div', { class: 'card-name' }, g.name, g.shiny ? h('span', { class: 'shiny', title: 'Rare colours' }, ' ✦') : null),
        typeChips(g.types)));
    }
  }

  root.append(
    toolbar,
    h('p', { class: 'hint' }, 'Same seed, same creatures, on any device. Tap a creature to see its genes.'),
    grid,
    ...section('Load a creature', loader),
  );
  draw();
}

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

export function openSheet(g) {
  closeSheet();
  const sp = speciesOf(g);
  const code = encodeGenome(g);
  let facing = 'right';
  const hero = h('div', { class: 'hero' }, creatureEl(g, { size: 260, facing, fit: true }));
  const close = () => { backdrop.remove(); sheet.remove(); document.removeEventListener('keydown', onKey); if (activeSheet === close) activeSheet = null; };
  activeSheet = close;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: close });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': g.name },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' },
      h('h2', {}, g.name, g.shiny ? ' ✦' : ''),
      typeChips(g.types),
      h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    h('p', { class: 'meta' }, sp ? `${sp.name} · ${sp.tier}` : 'Fusion', ` · ${cladeName(cladeOf(g))} · gen ${g.gen} · seed ${g.seed}`),
    hero,
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => { facing = facing === 'right' ? 'left' : 'right'; clear(hero).append(creatureEl(g, { size: 260, facing, fit: true })); } }, 'Flip'),
      h('button', { class: 'btn', onclick: async () => toast((await copyText(code)) ? 'Code copied' : 'Copy failed, select the text below') }, 'Copy code'),
      h('button', { class: 'btn', onclick: () => {
        toast(addToPool(g) ? 'Added to the fusion pool' : 'Already in the pool');
        close();
        if (location.hash === '#fusion') window.dispatchEvent(new CustomEvent('pool-changed'));
        else location.hash = 'fusion';
      } }, 'Fuse')),
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
