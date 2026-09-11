// Headless check of the app: start a journey, pick a starter, walk into an encounter, fight, open the map and the party.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot.mjs [seed] -> shots/world-*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { worldFor, findPath } from '../src/game/world.js';
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
// slip two potions into the bag and some gold into the purse so the item flows can be exercised
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.bag = { potion: 2, headbonk: 1, squirt: 1 }; s.journey.gold = 5000; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
await page.reload();
await page.waitForSelector('canvas.ow-map');
await page.waitForTimeout(300);
// follow the road toward the first biome's camp with the keyboard until something happens or 140 steps pass
const world = worldFor(seed);
const route = findPath(world, world.start, world.biomes[0].camp, 600) || [];
let at = { ...world.start };
for (let i = 0; i < Math.min(140, route.length); i++) {
  const nx = route[i];
  const key = nx.x > at.x ? 'ArrowRight' : nx.x < at.x ? 'ArrowLeft' : nx.y > at.y ? 'ArrowDown' : 'ArrowUp';
  await page.keyboard.press(key);
  await page.waitForTimeout(150);
  at = nx;
  if (await page.locator('.encounter').count()) break;
  if (await page.locator('.ow-dialog').count()) break;
}
const state = await page.evaluate(() => ({ encounter: document.querySelector('.encounter') ? document.querySelector('.enc-head').textContent : null, dialog: document.querySelector('.ow-dialog') ? document.querySelector('.ow-dialog .txt').textContent : null, place: document.querySelector('.ow-place') ? document.querySelector('.ow-place').textContent : null }));
console.log('after walk:', JSON.stringify(state));
await page.screenshot({ path: path.join(out, 'world-walk.png'), fullPage: true });
let fighting = false;
if (state.encounter) { await page.click('.encounter .btn.primary'); fighting = true; }
else if (state.dialog && await page.locator('.ow-dialog .btn.primary', { hasText: 'Fight' }).count()) {
  await page.click('.ow-dialog .btn.primary');
  await page.waitForSelector('.encounter .btn.primary', { timeout: 5000 });
  await page.click('.encounter .btn.primary');
  fighting = true;
}
if (fighting) {
  await page.waitForSelector('.move-btn', { timeout: 20000 });
  await page.screenshot({ path: path.join(out, 'world-fight.png'), fullPage: true });
  await page.click('text=Items');
  await page.waitForSelector('.sheet .item-icon', { timeout: 5000 });
  await page.screenshot({ path: path.join(out, 'world-fight-items.png'), fullPage: true });
  console.log('fight items:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.sheet .party-row')].map((r) => ({ text: r.textContent.trim().slice(0, 40), disabled: r.disabled })))));
  await page.click('.sheet .close');
  await page.click('text=Info');
  await page.waitForSelector('.sheet .shop-row', { timeout: 5000 });
  await page.screenshot({ path: path.join(out, 'world-fight-info.png'), fullPage: true });
  console.log('info moves:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.sheet .shop-row')].slice(0, 3).map((r) => r.textContent.trim().replace(/\s+/g, ' ').slice(0, 70)))));
  console.log('info skill:', JSON.stringify(await page.evaluate(() => { const c = document.querySelector('.sheet .ability-card'); return c ? c.textContent : null; })));
  console.log('learn tags:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.sheet .shop-row .shop-tag')].map((t) => t.textContent))));
  await page.click('.sheet .close');
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
console.log('party actions:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.sheet .row-actions .btn')].map((b) => `${b.textContent}${b.disabled ? ' (off)' : ''}`))));
await page.click('.sheet .close');
await page.click('text=Bag');
await page.waitForSelector('.sheet');
await page.screenshot({ path: path.join(out, 'world-bag.png'), fullPage: true });
await page.locator('.sheet .shop-row .btn', { hasText: 'Teach' }).first().click();
await page.waitForSelector('.teach-row', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-bag-teach.png'), fullPage: true });
console.log('teach rows:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.teach-row')].map((r) => ({ learns: r.querySelector('.learns') && r.querySelector('.learns').textContent, btn: r.querySelector('.btn').textContent, off: r.querySelector('.btn').disabled })))));
await page.click('.sheet .close');
// stand just south of the Market door (hub is at 112,96 on the 224 by 192 map), reload, step onto it
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.player = { x: 116, y: 95, dir: 'up' }; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
await page.reload();
await page.waitForSelector('canvas.ow-map');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowUp');
await page.waitForSelector('.type-filter', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-market.png'), fullPage: true });
const market = await page.evaluate(() => ({ rows: document.querySelectorAll('.shop-row').length, potions: document.querySelectorAll('.shop-row .item-icon').length, learnable: document.querySelectorAll('.shop-who:not(.none)').length, gold: document.querySelector('.ow-gold') ? document.querySelector('.ow-gold').textContent : null }));
console.log('market:', JSON.stringify(market));
await page.click('.sheet .type-filter .btn:has-text("My team")');
console.log('market, my team:', JSON.stringify(await page.evaluate(() => ({ rows: document.querySelectorAll('.shop-row .shop-who').length, none: document.querySelectorAll('.shop-who.none').length }))));
await page.click('.sheet .type-filter .btn:has-text("My team")');
await page.click('.shop-row:has(.item-icon) .btn.primary');
await page.waitForTimeout(200);
console.log('bought:', JSON.stringify(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); return { bag: s.journey.bag, gold: s.journey.gold }; })));
await page.click('.sheet .close');
await page.click('text=Bag');
await page.waitForSelector('.sheet .item-icon', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-bag-potions.png'), fullPage: true });
await page.click('.shop-row:has(.item-icon) .btn.primary');
await page.waitForSelector('.sheet .party-row', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-bag-use.png'), fullPage: true });
await page.click('.sheet .party-row .btn.primary');
await page.waitForTimeout(200);
console.log('use toast:', JSON.stringify(await page.evaluate(() => { const t = document.querySelector('.toast'); return t ? t.textContent : null; })));
await page.click('.sheet .close');
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.player = { x: 108, y: 95, dir: 'up' }; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
await page.reload();
await page.waitForSelector('canvas.ow-map');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowUp');
await page.waitForSelector('text=Creature Storage', { timeout: 5000 });
await page.screenshot({ path: path.join(out, 'world-storage.png'), fullPage: true });
await page.click('.sheet .close');
const saved = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); return s && s.journey ? { steps: s.journey.stats.steps, battles: s.journey.stats.battles, pos: s.journey.player } : null; });
console.log('saved journey:', JSON.stringify(saved));
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
if (errors.length) process.exit(1);
