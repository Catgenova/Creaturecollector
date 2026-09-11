// Mobile fit check: the key screens at phone, landscape and tablet sizes. Fails if anything scrolls sideways,
// or if the map with its pad, or a fight's move buttons, sit outside the first screen.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/mobile-audit.mjs [sizes] -> shots/mobile/*.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shots', 'mobile');
fs.mkdirSync(out, { recursive: true });
const url = `file://${path.join(root, 'index.html')}?seed=audit#world`;
const sizes = (process.argv[2] || '360x640,390x844,430x932,844x390,1024x768').split(',').map((s) => s.split('x').map(Number));
const browser = await chromium.launch();
const failures = [];
const measure = (page) => page.evaluate(() => {
  const de = document.documentElement;
  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), inView: r.top >= -1 && r.bottom <= window.innerHeight + 1 }; };
  return { overflowX: de.scrollWidth > window.innerWidth + 1, scrollH: de.scrollHeight, innerH: window.innerHeight, map: box('canvas.ow-map'), ctl: box('.ow-ctl'), moves: box('.moves'), arena: box('.arena'), foePassive: box('.panel-foe .passive') };
});
for (const [w, h] of sizes) {
  const tag = `${w}x${h}`;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, reducedMotion: 'reduce', hasTouch: w < 900, isMobile: w < 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const check = async (name, expect = {}) => {
    const m = await measure(page);
    await page.screenshot({ path: path.join(out, `${tag}-${name}.png`) });
    const notes = [];
    if (m.overflowX) notes.push('scrolls sideways');
    for (const k of expect.inView || []) if (!m[k] || !m[k].inView) notes.push(`${k} not within the first screen (${m[k] ? `${m[k].top}..${m[k].bottom} of ${m.innerH}` : 'missing'})`);
    console.log(`  ${name.padEnd(10)} ${notes.length ? 'FAIL ' + notes.join('; ') : 'ok'}${m.scrollH > m.innerH + 1 ? ` (page ${m.scrollH}px tall)` : ''}`);
    for (const n of notes) failures.push(`${tag} ${name}: ${n}`);
  };
  console.log(`== ${tag}`);
  await page.goto(url);
  await page.waitForSelector('text=Set out');
  await check('intro');
  await page.click('text=Set out');
  await page.waitForSelector('.starters .pslot');
  await check('starters');
  await page.locator('.starters .pslot').first().click();
  await page.click('text=Set out with');
  await page.waitForSelector('canvas.ow-map');
  await page.waitForTimeout(300);
  await check('world', { inView: ['map', 'ctl'] });
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.player = { x: 108, y: 97, dir: 'down' }; s.journey.gold = 5000; s.journey.bag = { potion: 2 }; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
  await page.reload(); await page.waitForSelector('canvas.ow-map'); await page.waitForTimeout(200);
  await page.keyboard.press('ArrowDown');
  await page.waitForSelector('.tower-row', { timeout: 5000 });
  await check('tower');
  await page.click('.tower-row:first-child .btn');
  await page.waitForSelector('.encounter.tower', { timeout: 5000 });
  await check('encounter');
  await page.click('.encounter .btn.primary');
  await page.waitForSelector('.move-btn', { timeout: 20000 });
  await page.waitForTimeout(300);
  await check('fight', { inView: ['moves', 'foePassive'] });
  await page.click('text=Info');
  await page.waitForSelector('.sheet .shop-row', { timeout: 5000 });
  await check('fight-info');
  await page.click('.sheet .close');
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('creaturecollector.save')); s.journey.encounter = null; s.journey.player = { x: 116, y: 95, dir: 'up' }; localStorage.setItem('creaturecollector.save', JSON.stringify(s)); });
  await page.reload(); await page.waitForSelector('canvas.ow-map'); await page.waitForTimeout(200);
  await page.click('text=Party'); await page.waitForSelector('.party-row'); await check('party');
  await page.locator('.sheet .row-actions .btn', { hasText: 'Info' }).first().click();
  await page.waitForSelector('.sheet .ability-card', { timeout: 5000 }); await page.waitForTimeout(200);
  await check('info');
  await page.evaluate(() => document.querySelectorAll('.sheet .close').forEach((b) => b.click()));
  await page.click('text=Map'); await page.waitForSelector('.ow-minimap'); await check('minimap');
  await page.click('.sheet .close');
  await page.keyboard.press('ArrowUp');
  await page.waitForSelector('.type-filter', { timeout: 5000 }); await check('market');
  if (errors.length) { console.log('  page errors: ' + errors.join(' | ')); failures.push(`${tag}: ${errors.join(' | ')}`); }
  await page.close();
}
await browser.close();
console.log(failures.length ? `\n${failures.length} problem(s):\n  ${failures.join('\n  ')}` : '\nevery screen fits');
if (failures.length) process.exit(1);
