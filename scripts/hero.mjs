// Creatures very large, for close inspection. Usage: node scripts/hero.mjs <ids> [style]
// ids: comma-separated species ids or preset names (see scripts/_samples.mjs), each optionally
// followed by +slot=part overrides, e.g. fox+eyes=slit or wolf+back=flame
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { getRig } from '../src/data/rigs.js';
import { PRESETS, presetGenome } from './_samples.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const ids = (process.argv[2] || 'fox').split(',');
const style = process.argv[3] || 'classic';

function genomeFor(id) {
  const [base, ...rest] = id.split('+');
  let g;
  if (SPECIES_BY_ID[base]) g = speciesGenome(SPECIES_BY_ID[base], makeRng(`hero-${base}`));
  else if (PRESETS[base]) g = presetGenome(base);
  else throw new Error(`unknown creature ${base}`);
  const prefix = getRig(g.rig).prefix;
  for (const r of rest) { const [slot, name] = r.split('='); g.parts[slot] = [`${prefix}${slot}.${name}`, `${prefix}${slot}.${name}`]; }
  return g;
}
let html = `<!doctype html><meta charset="utf-8"><style>${css} body{background:#1a1b24;padding:10px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end}</style>`;
for (const id of ids) {
  const g = genomeFor(id);
  const big = ids.length > 1 ? 440 : 620;
  html += renderCreatureSvg(g, { size: big, animate: false, fit: true, style }) + renderCreatureSvg(g, { size: 150, animate: false, style }) + renderCreatureSvg(g, { size: 90, animate: false, style });
}
fs.writeFileSync(path.join(root, 'shots', 'hero.html'), html);
console.log('wrote shots/hero.html for', ids.join(', '));
