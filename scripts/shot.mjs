// Screenshot the built index.html at phone size for visual checks.
// Usage: node scripts/shot.mjs [seed]   -> shots/lab.png, shots/parts.png, shots/sheet.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seed = process.argv[2] || 'SHOWCASE';
const out = path.join(root, 'shots');
fs.mkdirSync(out, { recursive: true });
const url = `file://${path.join(root, 'index.html')}?seed=${encodeURIComponent(seed)}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });

await page.goto(`${url}#lab`);
await page.waitForSelector('.card svg');
await page.screenshot({ path: path.join(out, 'lab.png'), fullPage: true });
await page.click('.card');
await page.waitForSelector('.sheet');
await page.screenshot({ path: path.join(out, 'sheet.png') });
await page.goto(`${url}#parts`);
await page.waitForSelector('.part svg');
await page.screenshot({ path: path.join(out, 'parts.png'), fullPage: true });
await browser.close();
console.log('shots written to', out);
