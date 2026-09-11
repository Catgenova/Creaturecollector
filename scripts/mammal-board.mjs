// Review board for the mammal library: sample creatures at two sizes plus every part on the mannequin.
// Usage: node scripts/mammal-board.mjs && PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot-board.mjs shots/mammal-board.html shots/mammal-board.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { speciesGenome, validateGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { renderCreatureSvg, mannequinGenome } from '../src/creature/render.js';
import { partsOf } from '../src/data/parts/index.js';
import { slotsFor, slotName } from '../src/data/rigs.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** A creature straight from part ids (no species needed) for art review. */
export function sampleGenome(name, archetype, palette, over = {}, traits = {}) {
  const A = (slot, arch = archetype) => `m.${slot}.${arch}`;
  const parts = {
    body: A('body'), head: A('head'), ears: A('ears'), eyes: 'm.eyes.round', muzzle: A('muzzle'), legsFront: A('legsFront'), legsBack: A('legsBack'),
    tail: A('tail'), mane: 'm.mane.none', horns: 'm.horns.none', back: 'm.back.none', markings: 'm.markings.none', ...over,
  };
  const g = {
    v: 1, seed: `sample-${name}`, species: null, clade: 'mammal', rig: 'mammal', name, nameParts: [name.slice(0, 3), name.slice(3)], gen: 0, shiny: false,
    types: ['Normal', null], parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, [v, v]])), paint: {}, palette,
    traits: { size: 0.7, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: 0.5, ...traits },
    stats: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }, vigor: {}, bst: 400, lineage: [], learnset: [], ability: 'lucky_streak',
  };
  return validateGenome(g);
}

export const PALETTES = {};
const FOX = { c1: [24, 85, 55], c2: [38, 50, 92], c3: [20, 20, 16], eye: [38, 90, 45] };
const CAT = { c1: [230, 12, 40], c2: [40, 30, 92], c3: [350, 60, 72], eye: [90, 70, 45] };
const BEAR = { c1: [26, 45, 34], c2: [30, 40, 62], c3: [20, 30, 20], eye: [30, 40, 25] };
const RABBIT = { c1: [30, 30, 80], c2: [30, 30, 95], c3: [345, 60, 78], eye: [200, 50, 40] };
const DEER = { c1: [30, 55, 52], c2: [36, 45, 88], c3: [26, 30, 30], eye: [25, 60, 25] };
const WOLF = { c1: [215, 12, 48], c2: [215, 10, 82], c3: [215, 14, 30], eye: [48, 90, 50] };
const MOUSE = { c1: [40, 30, 66], c2: [40, 30, 90], c3: [350, 70, 78], eye: [220, 30, 15] };
Object.assign(PALETTES, { fox: FOX, cat: CAT, bear: BEAR, rabbit: RABBIT, deer: DEER, wolf: WOLF, mouse: MOUSE });
export const SAMPLE_OVER = {
  fox: { markings: 'm.markings.belly', mane: 'm.mane.fox', eyes: 'm.eyes.almond' },
  cat: { eyes: 'm.eyes.slit', mane: 'm.mane.cat' },
  bear: { eyes: 'm.eyes.bead', markings: 'm.markings.belly' },
  rabbit: { eyes: 'm.eyes.doe', mane: 'm.mane.rabbit', markings: 'm.markings.belly' },
  deer: { eyes: 'm.eyes.doe', mane: 'm.mane.deer', horns: 'm.horns.antlers', markings: 'm.markings.spots' },
  wolf: { eyes: 'm.eyes.fierce', mane: 'm.mane.wolf', markings: 'm.markings.belly' },
  mouse: { eyes: 'm.eyes.bead', mane: 'm.mane.mouse' },
};
function writeBoard(out) {
  const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
  const samples = [
    sampleGenome('Fox', 'fox', FOX, { markings: 'm.markings.belly', mane: 'm.mane.fox', eyes: 'm.eyes.almond' }),
    sampleGenome('Cat', 'cat', CAT, { eyes: 'm.eyes.slit', mane: 'm.mane.cat' }),
    sampleGenome('Bear', 'bear', BEAR, { eyes: 'm.eyes.bead', markings: 'm.markings.belly' }),
    sampleGenome('Rabbit', 'rabbit', RABBIT, { eyes: 'm.eyes.doe', mane: 'm.mane.rabbit', markings: 'm.markings.belly' }),
    sampleGenome('Deer', 'deer', DEER, SAMPLE_OVER.deer),
    sampleGenome('Wolf', 'wolf', WOLF, SAMPLE_OVER.wolf),
    sampleGenome('Mouse', 'mouse', MOUSE, SAMPLE_OVER.mouse),
  ];
  const mammalSpecies = SPECIES.filter((s) => s.rig === 'mammal');
  for (const s of mammalSpecies) samples.push(speciesGenome(s, makeRng(`board-${s.id}`)));
  if (mammalSpecies.length >= 2) {
    for (let i = 0; i + 1 < mammalSpecies.length && i < 6; i += 2) {
      const a = speciesGenome(mammalSpecies[i], makeRng(`fa${i}`)), b = speciesGenome(mammalSpecies[i + 1], makeRng(`fb${i}`));
      samples.push(fuse(a, b, makeRng(`board-fuse-${i}`)).child);
    }
  }

  let html = `<!doctype html><meta charset="utf-8"><title>Mammal board</title><style>${css}
  body{padding:14px;background:#14151c;color:#e9eaf1;font:13px system-ui}h2{font-size:15px;margin:14px 0 6px}
  .row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}.cell{background:#1d1f2a;border-radius:8px;padding:6px;text-align:center}
  .cell span{display:block;color:#a8acbe;font-size:11px;margin-top:2px}
  </style>`;
  html += `<h2>Samples · large</h2><div class="row">${samples.slice(0, 8).map((g) => `<div class="cell">${renderCreatureSvg(g, { size: 260, animate: false, fit: true })}<span>${g.name}</span></div>`).join('')}</div>`;
  html += `<h2>Samples · card size, both facings</h2><div class="row">${samples.map((g) => `<div class="cell">${renderCreatureSvg(g, { size: 110, animate: false })}${renderCreatureSvg(g, { size: 110, animate: false, facing: 'left' })}<span>${g.name}</span></div>`).join('')}</div>`;
  for (const slot of slotsFor('mammal')) {
    const parts = partsOf('mammal', slot).filter((p) => !p.none);
    html += `<h2>${slotName('mammal', slot)} · ${parts.length}</h2><div class="row">${parts.map((p) => `<div class="cell">${renderCreatureSvg(mannequinGenome(p), { size: 120, animate: false, fit: true })}<span>${p.name}</span></div>`).join('')}</div>`;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('wrote', out, 'samples', samples.length);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeBoard(process.argv[2] || path.join(root, 'shots', 'mammal-board.html'));
}
