// Evolution review board: every species of a class at stages 1, 2 and 3 side by side.
// Usage: node scripts/evolutions.mjs <rig> [out.html]
// then: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot-board.mjs shots/evo-<rig>.html shots/evo-<rig>.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { RIGS } from '../src/data/rigs.js';
import { speciesGenome } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { STAGE_NAMES } from '../src/data/evolution.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rig = process.argv[2] || 'mammal';
if (!RIGS[rig]) { console.error('unknown rig', rig); process.exit(1); }
const out = process.argv[3] || path.join(root, 'shots', `evo-${rig}.html`);
// Optional: EVO_ONLY=fox,bear limits the board to species ids; EVO_SIZE sets the card size.
const only = (process.env.EVO_ONLY || '').split(',').filter(Boolean);
const cardSize = Number(process.env.EVO_SIZE) || 230;
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
let html = `<!doctype html><meta charset="utf-8"><title>${rig} evolutions</title><style>${css}
body{padding:14px;background:#14151c;color:#e9eaf1;font:13px system-ui}h2{font-size:15px;margin:14px 0 6px}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}.cell{background:#1d1f2a;border-radius:8px;padding:6px;text-align:center}
.cell span{display:block;color:#a8acbe;font-size:11px;margin-top:2px}.trio{display:flex;align-items:flex-end;gap:4px}</style>`;
for (const s of SPECIES.filter((x) => x.rig === rig && (!only.length || only.includes(x.id)))) {
  const g = speciesGenome(s, makeRng(`evo-${s.id}`));
  html += `<h2>${s.name}</h2><div class="row">` + [1, 2, 3].map((st) => `<div class="cell">${renderCreatureSvg(g, { size: cardSize, animate: false, fit: true, stage: st })}<span>${STAGE_NAMES[st]}</span></div>`).join('') +
    `<div class="cell"><div class="trio">${[1, 2, 3].map((st) => renderCreatureSvg(g, { size: 100, animate: false, stage: st })).join('')}</div><span>frame size</span></div></div>`;
}
fs.writeFileSync(out, html);
console.log('wrote', path.relative(root, out));
