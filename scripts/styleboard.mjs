// Render the same creatures in every render style, side by side, for art direction.
// Usage: node scripts/styleboard.mjs [out.html]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { renderCreatureSvg, RENDER_STYLES } from '../src/creature/render.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || path.join(root, 'shots', 'styleboard.html');
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const ids = ['emberox', 'finnip', 'drakelet', 'twinklet', 'craggon', 'halowl'];
const gs = ids.map((id) => speciesGenome(SPECIES_BY_ID[id], makeRng(`board-${id}`)));
gs.push(fuse(gs[0], gs[1], makeRng('board-fuse')).child);
let html = `<!doctype html><meta charset="utf-8"><title>Style board</title><style>${css}
body{padding:16px;background:#14151c}table{border-collapse:collapse}th{color:#e9eaf1;font:700 15px system-ui;padding:6px 10px;text-transform:capitalize}
td{padding:4px 8px;text-align:center;vertical-align:bottom}td span{display:block;color:#a8acbe;font:12px system-ui}.big td{padding:10px}
</style><table><tr><th></th>${RENDER_STYLES.map((s) => `<th>${s}</th>`).join('')}</tr>`;
for (const g of gs) {
  html += `<tr><th>${g.name}</th>${RENDER_STYLES.map((s) => `<td>${renderCreatureSvg(g, { size: 150, style: s, animate: false, fit: true })}</td>`).join('')}</tr>`;
}
html += `<tr class="big"><th>close-up</th>${RENDER_STYLES.map((s) => `<td>${renderCreatureSvg(gs[0], { size: 230, style: s, animate: false, fit: true })}</td>`).join('')}</tr></table>`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote', out);
