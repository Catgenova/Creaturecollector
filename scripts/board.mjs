// Review board for one class library: its species and a few fusions at two sizes, then every
// part on the class mannequin. Usage: node scripts/board.mjs <rig> [out.html]
// then: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot-board.mjs shots/<rig>-board.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { renderCreatureSvg, mannequinGenome } from '../src/creature/render.js';
import { partsOf } from '../src/data/parts/index.js';
import { RIGS, slotsFor, slotName } from '../src/data/rigs.js';
import { PRESETS, presetGenome } from './_samples.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rig = process.argv[2] || 'mammal';
if (!RIGS[rig]) { console.error('unknown rig', rig); process.exit(1); }
const out = process.argv[3] || path.join(root, 'shots', `${rig}-board.html`);
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');

const samples = Object.keys(PRESETS).filter((k) => PRESETS[k][0] === rig).map(presetGenome);
const species = SPECIES.filter((s) => s.rig === rig);
for (const s of species) samples.push(speciesGenome(s, makeRng(`board-${s.id}`)));
for (let i = 0; i + 1 < species.length && i < 6; i += 2) {
  const a = speciesGenome(species[i], makeRng(`fa${i}`)), b = speciesGenome(species[i + 1], makeRng(`fb${i}`));
  samples.push(fuse(a, b, makeRng(`board-fuse-${i}`)).child);
}

let html = `<!doctype html><meta charset="utf-8"><title>${rig} board</title><style>${css}
body{padding:14px;background:#14151c;color:#e9eaf1;font:13px system-ui}h2{font-size:15px;margin:14px 0 6px}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}.cell{background:#1d1f2a;border-radius:8px;padding:6px;text-align:center}
.cell span{display:block;color:#a8acbe;font-size:11px;margin-top:2px}
</style>`;
html += `<h2>Samples · large</h2><div class="row">${samples.slice(0, 8).map((g) => `<div class="cell">${renderCreatureSvg(g, { size: 260, animate: false, fit: true })}<span>${g.name}</span></div>`).join('')}</div>`;
html += `<h2>Samples · card size, both facings</h2><div class="row">${samples.map((g) => `<div class="cell">${renderCreatureSvg(g, { size: 110, animate: false })}${renderCreatureSvg(g, { size: 110, animate: false, facing: 'left' })}<span>${g.name}</span></div>`).join('')}</div>`;
for (const slot of slotsFor(rig)) {
  const parts = partsOf(rig, slot).filter((p) => !p.none);
  html += `<h2>${slotName(rig, slot)} · ${parts.length}</h2><div class="row">${parts.map((p) => `<div class="cell">${renderCreatureSvg(mannequinGenome(p), { size: 120, animate: false, fit: true })}<span>${p.name}</span></div>`).join('')}</div>`;
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote', path.relative(root, out), 'samples', samples.length);
