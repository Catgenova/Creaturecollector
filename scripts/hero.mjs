// One creature, very large, for close inspection. Usage: node scripts/hero.mjs <sample|species id> [style]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { sampleGenome, PALETTES, SAMPLE_OVER } from './mammal-board.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const ids = (process.argv[2] || 'fox').split(',');
const style = process.argv[3] || 'classic';
const GREY = { c1: [222, 10, 64], c2: [222, 12, 46], c3: [28, 80, 58], eye: [200, 55, 45] };
function genomeFor(id) {
  if (SPECIES_BY_ID[id]) return speciesGenome(SPECIES_BY_ID[id], makeRng(`hero-${id}`));
  const [arch, ...rest] = id.split('+');
  const over = { ...(SAMPLE_OVER[arch] || {}) };
  for (const r of rest) { const [slot, name] = r.split('='); over[slot] = `m.${slot}.${name}`; }
  return sampleGenome(arch, arch, PALETTES[arch] || GREY, over);
}
let html = `<!doctype html><meta charset="utf-8"><style>${css} body{background:#1a1b24;padding:10px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end}</style>`;
for (const id of ids) {
  const g = genomeFor(id);
  const big = ids.length > 1 ? 440 : 620;
  html += renderCreatureSvg(g, { size: big, animate: false, fit: true, style }) + renderCreatureSvg(g, { size: 150, animate: false, style }) + renderCreatureSvg(g, { size: 90, animate: false, style });
}
fs.writeFileSync(path.join(root, 'shots', 'hero.html'), html);
console.log('wrote shots/hero.html for', ids.join(', '));
