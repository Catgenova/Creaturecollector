// Desktop-width screenshots of the Part Lab, split into chunks for review.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shots'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce' });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await page.goto(`file://${path.join(root, 'index.html')}#parts`);
await page.waitForSelector('.part svg');
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const chunk = 900; let i = 0;
for (let y = 0; y < total; y += chunk, i++) {
  await page.screenshot({ path: path.join(out, `parts-${i}.png`), clip: { x: 0, y, width: 1100, height: Math.min(chunk, total - y) }, fullPage: true });
}
await browser.close();
console.log('chunks:', i, 'height', total);
