// App shell: header, tabs, hash routing between screens.
import { h, clear } from './dom.js';
import { renderLabScreen, closeSheet } from './lab.js';
import { renderPartsScreen } from './parts.js';
import { renderFusionScreen } from './fusion.js';
import { renderBattleScreen } from './battle.js';
import { renderArenaScreen } from './arena.js';
import { renderWorldScreen } from './world.js';
import { partCount } from '../data/parts/index.js';
import { SPECIES } from '../data/species.js';
import { sfx, setSfxEnabled, sfxEnabled } from '../core/sfx.js';
import { setRenderStyle, getRenderStyle, setReducedMotion } from '../creature/render.js';

const SCREENS = [
  { id: 'world', title: 'World', render: renderWorldScreen },
  { id: 'arena', title: 'Arena', render: renderArenaScreen },
  { id: 'battle', title: 'Battle', render: renderBattleScreen },
  { id: 'fusion', title: 'Fusion', render: renderFusionScreen },
  { id: 'lab', title: 'Lab', render: renderLabScreen },
  { id: 'parts', title: 'Parts', render: renderPartsScreen },
];

function bootApp() {
  const app = document.getElementById('app');
  clear(app);
  try { const s = new URLSearchParams(location.search).get('style'); if (s) setRenderStyle(s); } catch { /* ignore */ }
  try { const mq = matchMedia('(prefers-reduced-motion: reduce)'); setReducedMotion(mq.matches); mq.addEventListener('change', (e) => setReducedMotion(e.matches)); } catch { /* ignore */ }
  const nav = h('nav', { class: 'tabs', role: 'tablist' });
  const main = h('main', { class: 'screen' });
  try { setSfxEnabled(localStorage.getItem('creaturecollector.sfx') !== 'off'); } catch { /* default on */ }
  const soundBtn = h('button', { class: 'btn small sound', type: 'button', 'aria-label': 'Toggle sound', onclick: () => {
    setSfxEnabled(!sfxEnabled());
    try { localStorage.setItem('creaturecollector.sfx', sfxEnabled() ? 'on' : 'off'); } catch { /* ignore */ }
    soundBtn.textContent = sfxEnabled() ? '🔊' : '🔇';
    if (sfxEnabled()) sfx.tap();
  } }, sfxEnabled() ? '🔊' : '🔇');
  app.append(
    h('header', { class: 'topbar' }, h('h1', {}, 'Creature Collector'), h('span', { class: 'ver' }, `${SPECIES.length} species · ${partCount()} parts${getRenderStyle() !== 'classic' ? ` · ${getRenderStyle()} style` : ''}`), soundBtn),
    nav, main,
  );
  document.addEventListener('click', (e) => { if (e.target.closest('button') && !e.target.closest('.sound')) sfx.tap(); }, { capture: true });

  function go(id) {
    const screen = SCREENS.find((s) => s.id === id && !s.soon) || SCREENS[0];
    closeSheet();
    clear(nav);
    for (const s of SCREENS) {
      nav.append(h('button', {
        class: 'tab', role: 'tab', type: 'button', disabled: s.soon, 'aria-selected': String(s === screen),
        onclick: () => { location.hash = s.id; },
      }, s.title, s.soon ? h('small', {}, 'soon') : null));
    }
    screen.render(main);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  go(location.hash.slice(1));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootApp);
else bootApp();
