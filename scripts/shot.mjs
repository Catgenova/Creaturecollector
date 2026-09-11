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
await page.goto(`${url}#fusion`);
await page.waitForSelector('.pcard');
const cards = page.locator('.pool .pcard');
await cards.nth(0).click();
await cards.nth(1).click();
await page.click('.fuse-btn');
await page.waitForSelector('.result');
await page.screenshot({ path: path.join(out, 'fusion.png'), fullPage: true });
await page.click('text=Breed 5 generations');
await page.waitForSelector('.chain');
await page.locator('.chain').scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(out, 'fusion-chain.png') });
await page.goto(`${url}#battle`);
await page.waitForSelector('.pool .pcard');
const roster = page.locator('.pool .pcard');
await roster.nth(0).click(); await roster.nth(1).click(); await roster.nth(2).click();
await page.screenshot({ path: path.join(out, 'battle-setup.png'), fullPage: true });
await page.click('text=Battle!');
await page.waitForSelector('.move-btn', { timeout: 20000 });
await page.screenshot({ path: path.join(out, 'battle.png'), fullPage: true });
await page.locator('.move-btn').first().click();
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(out, 'battle-turn.png'), fullPage: true });
await page.goto(`${url}#arena`);
await page.waitForSelector('text=New run');
await page.screenshot({ path: path.join(out, 'arena-home.png'), fullPage: true });
await page.click('text=New run');
await page.waitForSelector('.starters .pslot');
await page.locator('.starters .pslot').first().click();
await page.screenshot({ path: path.join(out, 'arena-starter.png'), fullPage: true });
await page.click('text=Start with');
await page.waitForSelector('.encounter');
await page.screenshot({ path: path.join(out, 'arena-floor.png'), fullPage: true });
await page.click('.encounter .btn.primary');
await page.waitForSelector('.move-btn', { timeout: 20000 });
await page.locator('.move-btn').first().click();
await page.waitForTimeout(2600);
await page.screenshot({ path: path.join(out, 'arena-fight.png'), fullPage: true });
await page.goto(`${url}#parts`);
await page.waitForSelector('.part svg');
await page.screenshot({ path: path.join(out, 'parts.png'), fullPage: true });
await browser.close();
console.log('shots written to', out);
