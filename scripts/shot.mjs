// Headless check of the app: start a journey, pick a starter, walk into an encounter, fight, open the map and the party.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot.mjs [seed] -> shots/world-*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seed = process.argv[2] || 'demo';
const out = path.join(root, 'shots');
fs.mkdirSync(out, { recursive: true });
const url = `file://${path.join(root, 'index.html')}?seed=${encodeURIComponent(seed)}#world`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(url);
await page.waitForSelector('text=Set out');
await page.screenshot({ path: path.join(out, 'world-intro.png'), fullPage: true });
await page.click('text=Set out');
await page.waitForSelector('.starters .pslot');
await page.locator('.starters .pslot').first().click();
await page.click('text=Set out with');
await page.waitForSelector('canvas.ow-map');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, 'world-map.png'), fullPage: true });
// walk south with the keyboard until something happens or 40 steps pass
for (let i = 0; i < 40; i++) {
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(180);
  if (await page.locator('.encounter').count()) break;
  if (await page.locator('.ow-dialog').count()) break;
}
const state = await page.evaluate(() => ({ encounter: document.querySelector('.encounter') ? document.querySelector('.enc-head').textContent : null, dialog: document.querySelector('.ow-dialog') ? document.querySelector('.ow-dialog .txt').textContent : null, place: document.querySelector('.ow-place') ? document.querySelector('.ow-place').textContent : null }));
console.log('after walk:', JSON.stringify(state));
await page.screenshot({ path: path.join(out, 'world-walk.png'), fullPage: true });
if (state.encounter) {
  await page.click('.encounter .btn.primary');
  await page.waitForSelector('.move-btn', { timeout: 20000 });
  await page.screenshot({ path: path.join(out, 'world-fight.png'), fullPage: true });
  await page.click('text=Fast');
  await page.click('text=Auto');
  await page.waitForSelector('.result-card', { timeout: 90000 });
  await page.click('text=Continue');
  await page.waitForSelector('canvas.ow-map');
  console.log('back on the map after the fight');
}
await page.click('text=Map');
await page.waitForSelector('.ow-minimap');
await page.screenshot({ path: path.join(out, 'world-minimap.png'), fullPage: true });
await page.click('.sheet .close');
await page.click('text=Party');
await page.waitForSelector('.party-row');
await page.screenshot({ path: path.join(out, 'world-party.png'), fullPage: true });
await page.click('.sheet .close');
await page.click('text=Bag');
await page.waitForSelector('.sheet');
await page.screenshot({ path: path.join(out, 'world-bag.png'), fullPage: true });
await page.click('.sheet .close');
// stand just south of the Market door (the fight left us out on the downs), reload, step onto it
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.player = { x: 60, y: 47, dir: 'up' }; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
await page.reload();
await page.waitForSelector('canvas.ow-map');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowUp');
await page.waitForSelector('.type-filter', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-market.png'), fullPage: true });
const market = await page.evaluate(() => ({ rows: document.querySelectorAll('.shop-row').length, gold: document.querySelector('.ow-gold') ? document.querySelector('.ow-gold').textContent : null }));
console.log('market:', JSON.stringify(market));
await page.click('.sheet .close');
const saved = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); return s && s.journey ? { steps: s.journey.stats.steps, battles: s.journey.stats.battles, pos: s.journey.player } : null; });
console.log('saved journey:', JSON.stringify(saved));
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
if (errors.length) process.exit(1);
