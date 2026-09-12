// App shell: the header and the one screen, the overworld.
import { h, clear } from './dom.js';
import { renderWorldScreen } from './world.js';
import { closeSheet } from './sheet.js';
import { partCount } from '../data/parts/index.js';
import { SPECIES } from '../data/species.js';
import { sfx, setSfxEnabled, sfxEnabled } from '../core/sfx.js';
import { setRenderStyle, getRenderStyle, setReducedMotion } from '../creature/render.js';
import { loadSettings, saveSettings, applySettings } from '../game/settings.js';
import { getSettings, setSettings } from './settings.js';

function bootApp() {
  const app = document.getElementById('app');
  clear(app);
  try { const s = new URLSearchParams(location.search).get('style'); if (s) setRenderStyle(s); } catch { /* ignore */ }
  const settings = setSettings(applySettings(loadSettings()));
  try {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const motionOff = () => setReducedMotion(mq.matches || getSettings().motion === 'reduced');
    motionOff(); mq.addEventListener('change', motionOff);
  } catch { /* ignore */ }
  const main = h('main', { class: 'screen' });
  setSfxEnabled(settings.sound);
  const soundBtn = h('button', { class: 'btn small sound', type: 'button', 'aria-label': 'Toggle sound', onclick: () => {
    const next = setSettings({ ...getSettings(), sound: !sfxEnabled() });
    setSfxEnabled(next.sound);
    saveSettings(next);
    soundBtn.textContent = next.sound ? '🔊' : '🔇';
    if (next.sound) sfx.tap();
  } }, settings.sound ? '🔊' : '🔇');
  app.append(
    h('header', { class: 'topbar' }, h('h1', {}, 'Creature Collector'), h('span', { class: 'ver' }, `${SPECIES.length} species · ${partCount()} parts${getRenderStyle() !== 'classic' ? ` · ${getRenderStyle()} style` : ''}`), soundBtn),
    main,
  );
  document.addEventListener('click', (e) => { if (e.target.closest('button') && !e.target.closest('.sound')) sfx.tap(); }, { capture: true });
  const show = () => { closeSheet(); renderWorldScreen(main); window.scrollTo(0, 0); };
  window.addEventListener('hashchange', show);
  show();
  // installable: the service worker keeps the page, manifest and icons for offline play when served over http(s)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { /* optional */ });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootApp);
else bootApp();
