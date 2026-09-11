// Fusion Lab: pick two creatures from a pool, fuse them, read the inheritance
// report, feed children back into the pool, and stress-test five generations.
import { h, clear, copyText, toast } from './dom.js';
import { typeChips, creatureEl, section } from './common.js';
import { makeRng, freshSeed } from '../core/rng.js';
import { randomGenome, decodeGenome, encodeGenome, resolveParts, rigOf } from '../creature/genome.js';
import { fuse, fuseChain, canFuse } from '../creature/fusion.js';
import { cladeName } from '../data/clades.js';
import { cladeOf } from '../creature/genome.js';
import { swatchCss } from '../creature/palette.js';
import { fusionPool, addToPool, removeFromPool } from './state.js';
import { openSheet } from './lab.js';
import { slotsFor, slotName } from '../data/rigs.js';

const fs = { a: null, b: null, child: null, report: null, rerolls: 0, chain: null, next: 'a' };

function seedPool(seed) {
  fusionPool.seed = seed;
  fusionPool.genomes = [];
  for (let i = 0; i < 8; i++) fusionPool.genomes.push(randomGenome(makeRng(`${seed}:pool:${i}`)));
  Object.assign(fs, { a: null, b: null, child: null, report: null, chain: null, rerolls: 0, next: 'a' });
}

function badge(who, extra) {
  if (who === 'blend') return h('span', { class: 'badge blend' }, 'A+B');
  return h('span', { class: `badge ${who === 0 ? 'a' : 'b'}` }, who === 0 ? 'A' : 'B', extra || null);
}

let poolListener = null;

export function renderFusionScreen(root) {
  if (!fusionPool.genomes.length) seedPool('FUSE');
  else if (!fusionPool.seed) fusionPool.seed = 'FUSE';
  clear(root);

  const rerender = () => renderFusionScreen(root);
  if (poolListener) window.removeEventListener('pool-changed', poolListener);
  poolListener = () => { if (root.isConnected) rerender(); else window.removeEventListener('pool-changed', poolListener); };
  window.addEventListener('pool-changed', poolListener);

  const pick = (g) => {
    const other = fs.a && fs.a !== g ? fs.a : fs.b && fs.b !== g ? fs.b : null;
    if (other && g !== fs.a && g !== fs.b && !canFuse(other, g).ok) { toast(canFuse(other, g).reason); return; }
    if (fs.a === g) { fs.a = null; fs.next = 'a'; }
    else if (fs.b === g) { fs.b = null; fs.next = 'b'; }
    else if (!fs.a) { fs.a = g; fs.next = fs.b ? 'a' : 'b'; }
    else if (!fs.b) { fs.b = g; fs.next = 'a'; }
    else if (fs.next === 'a') { fs.a = g; fs.next = 'b'; }
    else { fs.b = g; fs.next = 'a'; }
    rerender();
  };

  const slot = (who, g) => h('button', { class: `pslot${g ? ' filled' : ''}`, type: 'button', onclick: () => { if (g) pick(g); } },
    h('span', { class: 'tag' }, `PARENT ${who}`),
    g ? [creatureEl(g, { size: 150, animate: false }), h('b', {}, g.name), typeChips(g.types), h('span', { class: 'clade' }, cladeName(cladeOf(g)))] : h('span', { class: 'hint' }, 'Tap a creature in the pool'));

  const doFuse = () => {
    const rng = makeRng(`${fs.a.seed}|${fs.a.name}+${fs.b.seed}|${fs.b.name}#${fs.rerolls}`);
    const { child, report } = fuse(fs.a, fs.b, rng);
    fs.child = child; fs.report = report; fs.chain = null;
    rerender();
    setTimeout(() => { const r = root.querySelector('.result'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
  };

  root.append(
    h('div', { class: 'parents' }, slot('A', fs.a), h('div', { class: 'times' }, '×'), slot('B', fs.b)),
    h('button', { class: 'btn primary fuse-btn', type: 'button', disabled: !(fs.a && fs.b), onclick: () => { fs.rerolls = 0; doFuse(); } }, 'Fuse'),
  );

  if (fs.child) root.append(resultPanel(fs.child, fs.report, fs.a, fs.b, {
    reroll: () => { fs.rerolls++; doFuse(); },
    breed: () => {
      const rng = makeRng(`${fs.child.seed}:chain`);
      const partners = [];
      const kin = fusionPool.genomes.filter((g) => canFuse(fs.child, g).ok);
      for (let i = 0; i < 5; i++) partners.push(kin.length ? rng.pick(kin) : randomGenome(rng.fork(`kin${i}`), { clade: cladeOf(fs.child) }));
      fs.chain = fuseChain(fs.child, partners, rng);
      rerender();
      setTimeout(() => { const c = root.querySelector('.chain'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 0);
    },
    chain: fs.chain,
  }));

  // pool
  const codeInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a creature code to add it', 'aria-label': 'Creature code', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
  const poolGrid = h('div', { class: 'pool' });
  const anchor = fs.a || fs.b;
  for (const g of fusionPool.genomes) {
    const incompatible = anchor && g !== fs.a && g !== fs.b && !canFuse(anchor, g).ok;
    const cls = g === fs.a ? ' is-a' : g === fs.b ? ' is-b' : incompatible ? ' is-off' : '';
    poolGrid.append(h('button', { class: `pcard${cls}`, type: 'button', onclick: () => pick(g), title: incompatible ? canFuse(anchor, g).reason : '' },
      g === fs.a ? h('span', { class: 'sel badge a' }, 'A') : g === fs.b ? h('span', { class: 'sel badge b' }, 'B') : null,
      h('span', { class: 'gen' }, `${g.gen ? `gen ${g.gen} · ` : ''}${cladeName(cladeOf(g))}`),
      creatureEl(g, { size: 104, animate: false }),
      h('span', {}, g.name)));
  }
  root.append(
    ...section(`Pool · ${fusionPool.genomes.length}`,
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: () => { seedPool(freshSeed()); rerender(); } }, 'New pool'),
        h('button', { class: 'btn', type: 'button', onclick: () => { for (let i = 0; i < 4; i++) addToPool(randomGenome(makeRng(freshSeed()))); rerender(); } }, '+4 wild')),
      h('div', { class: 'toolbar' },
        codeInput,
        h('button', { class: 'btn', type: 'button', onclick: () => {
          try { addToPool(decodeGenome(codeInput.value)); codeInput.value = ''; rerender(); } catch (e) { toast(e.message); }
        } }, 'Add')),
      h('p', { class: 'hint' }, 'Tap to choose parents. Only creatures of the same class can fuse: mammals with mammals, birds with birds. Tap a chosen one again to clear it.'),
      poolGrid),
  );
}

function resultPanel(child, report, a, b, actions) {
  const parents = [a, b];
  const parts = resolveParts(child);
  const rig = rigOf(child);
  const rows = [];
  for (const slot of slotsFor(rig)) {
    const p = parts[slot];
    rows.push(h('span', {}, slotName(rig, slot)), h('span', {}, p ? p.name : 'None'),
      h('span', {}, report.mutated[slot] ? h('span', { class: 'badge m' }, 'mutation') : badge(report.from[slot])));
  }
  const palRows = ['c1', 'c2', 'c3', 'eye'].map((k) => h('div', { class: 'sw-row' },
    h('span', { class: 'sw small', style: { background: swatchCss(child.palette[k]) } }),
    h('span', {}, { c1: 'Primary', c2: 'Secondary', c3: 'Accent', eye: 'Eyes' }[k]), badge(report.palette[k])));
  const typeRow = h('div', { class: 'sw-row' }, typeChips([child.types[0]]), badge(report.types.primary),
    child.types[1] ? [typeChips([child.types[1]]), badge(report.types.secondary)] : h('span', { class: 'hint', style: { margin: 0 } }, 'no second type'));

  const panel = h('div', { class: 'result' },
    h('div', { class: 'sheet-head' }, h('h2', {}, child.name, child.shiny ? ' ✦' : ''), typeChips(child.types)),
    h('p', { class: 'meta' }, `${cladeName(cladeOf(child))} · gen ${child.gen} · ${a.name} × ${b.name} · face from ${parents[report.identity].name}`),
    h('div', { class: 'hero' }, creatureEl(child, { size: 240, fit: true })),
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn', type: 'button', onclick: actions.reroll }, 'Re-roll'),
      h('button', { class: 'btn', type: 'button', onclick: () => { toast(addToPool(child) ? 'Added to pool' : 'Already in pool'); window.dispatchEvent(new CustomEvent('pool-changed')); } }, 'Add to pool'),
      h('button', { class: 'btn', type: 'button', onclick: () => openSheet(child) }, 'Details'),
      h('button', { class: 'btn', type: 'button', onclick: async () => toast((await copyText(encodeGenome(child))) ? 'Code copied' : 'Copy failed') }, 'Copy code')),
    ...section('Inheritance', h('div', { class: 'inherit' }, rows)),
    ...section('Colours', h('div', { class: 'stack' }, palRows)),
    ...section('Types', typeRow),
    ...section('Stability test',
      h('p', { class: 'hint' }, 'Breed this child with random pool members for five more generations to check that fusions stay coherent.'),
      h('button', { class: 'btn', type: 'button', onclick: actions.breed }, 'Breed 5 generations')),
  );
  if (actions.chain) {
    const strip = h('div', { class: 'chain' });
    actions.chain.forEach((g, i) => strip.append(h('button', { class: 'pcard', type: 'button', onclick: () => openSheet(g) },
      h('span', { class: 'gen' }, `gen ${g.gen}`), creatureEl(g, { size: 120, animate: false }), h('span', {}, g.name))));
    panel.append(strip);
  }
  return panel;
}
