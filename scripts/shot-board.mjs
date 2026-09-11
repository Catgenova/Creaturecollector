import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1.6 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await page.goto(`file://${path.join(root, 'shots', 'styleboard.html')}`);
await page.screenshot({ path: path.join(root, 'shots', 'styleboard.png'), fullPage: true });
await browser.close();
console.log('board shot written');
