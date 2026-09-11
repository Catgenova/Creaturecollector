// App icons for the home screen: a creature on the game's dark ground, rendered from the same SVG the game
// draws. Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/icons.mjs -> icons/*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID } from '../src/data/species.js';
import { speciesGenome } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'icons');
fs.mkdirSync(out, { recursive: true });
const g = speciesGenome(SPECIES_BY_ID[process.argv[2] || 'hatchdrake'], makeRng('icon'));
const svg = renderCreatureSvg(g, { size: 400, animate: false, level: 70 });
const page = await (await chromium.launch()).newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
const html = (size, { radius, inset, bleed }) => `<!doctype html><style>html,body{margin:0;background:transparent}
  .tile{position:relative;width:${size}px;height:${size}px;border-radius:${bleed ? 0 : radius}px;overflow:hidden;background:radial-gradient(circle at 50% 120%, #2a3350 0%, #12131a 70%)}
  .tile svg{position:absolute;left:50%;bottom:${Math.round(size * (bleed ? 0.1 : 0.04))}px;width:${Math.round(size * inset)}px;height:auto;transform:translateX(-50%)}
  .glow{position:absolute;left:50%;top:78%;width:${Math.round(size * 0.7)}px;height:${Math.round(size * 0.2)}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse, rgba(245,197,24,.35), transparent 70%)}</style>
  <div class="tile"><div class="glow"></div>${svg}</div>`;
const shots = [
  ['icon-512.png', 512, { radius: 112, inset: 1.0 }],
  ['icon-192.png', 192, { radius: 42, inset: 1.0 }],
  ['icon-maskable-512.png', 512, { radius: 0, inset: 0.72, bleed: true }],
  ['apple-touch-icon.png', 180, { radius: 0, inset: 0.96, bleed: true }],
];
for (const [name, size, o] of shots) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, o));
  await page.screenshot({ path: path.join(out, name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote icons/' + name);
}
await page.context().browser().close();
