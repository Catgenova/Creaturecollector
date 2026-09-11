// Review sheet for Elementals: one creature per element, large and at card size, plus a
// fused descendant that kept only some elemental parts. Usage: node scripts/elementals.mjs [style]
// then: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot-board.mjs shots/elementals.html shots/elementals.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { ELEMENT_IDS, ELEMENTS } from '../src/data/elements.js';
import { speciesGenome, makeElemental, elementalOf } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { renderCreatureSvg } from '../src/creature/render.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const style = process.argv[2] || 'classic';
const picks = { fire: 'emberox', water: 'finnip', storm: 'voltmite', frost: 'glacub', bloom: 'sprigget', shadow: 'nyxcat', light: 'twinklet', earth: 'craggon' };

let html = `<!doctype html><meta charset="utf-8"><style>${css} body{background:#1a1b24;padding:14px;color:#e9eaf1;font:13px system-ui}
.row{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;margin-bottom:10px}.cell{background:#1d1f2a;border-radius:10px;padding:8px;text-align:center}.cell span{display:block;color:#a8acbe;margin-top:4px}</style>`;
html += '<h2>Elementals · one filter per element</h2><div class="row">';
for (const e of ELEMENT_IDS) {
  const g = makeElemental(speciesGenome(SPECIES_BY_ID[picks[e]], makeRng(`el-${e}`)), e);
  html += `<div class="cell">${renderCreatureSvg(g, { size: 300, animate: true, fit: true, style })}${renderCreatureSvg(g, { size: 110, animate: false, style })}<span>${ELEMENTS[e].name} Elemental · ${g.name}</span></div>`;
}
html += '</div><h2>Descendants · parts keep their element through fusion</h2><div class="row">';
for (const [i, e] of ['fire', 'water', 'shadow', 'light'].entries()) {
  const a = makeElemental(speciesGenome(SPECIES_BY_ID[picks[e]], makeRng(`pa-${e}`)), e);
  const mates = { fire: 'howlune', water: 'sharkid', shadow: 'solmane', light: 'bramblit' };
  const b = speciesGenome(SPECIES_BY_ID[mates[e]], makeRng(`pb-${e}`));
  const child = fuse(a, b, makeRng(`fuse-${e}-${i}`)).child;
  const el = elementalOf(child);
  html += `<div class="cell">${renderCreatureSvg(child, { size: 300, animate: true, fit: true, style })}<span>${child.name} · ${el ? `${el.name}-touched, ${Math.round(el.share * 100)}% of slots` : 'no aura'} · ${child.ability}</span></div>`;
}
html += '</div>';
fs.writeFileSync(path.join(root, 'shots', 'elementals.html'), html);
console.log('wrote shots/elementals.html');
