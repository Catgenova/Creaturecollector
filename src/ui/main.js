// App shell: header, tabs, hash routing between screens.
import { h, clear } from './dom.js';
import { renderLabScreen, closeSheet } from './lab.js';
import { renderPartsScreen } from './parts.js';
import { renderFusionScreen } from './fusion.js';
import { partCount } from '../data/parts/index.js';
import { SPECIES } from '../data/species.js';

const SCREENS = [
  { id: 'lab', title: 'Lab', render: renderLabScreen },
  { id: 'parts', title: 'Parts', render: renderPartsScreen },
  { id: 'fusion', title: 'Fusion', render: renderFusionScreen },
  { id: 'battle', title: 'Battle', soon: true },
];

function bootApp() {
  const app = document.getElementById('app');
  clear(app);
  const nav = h('nav', { class: 'tabs', role: 'tablist' });
  const main = h('main', { class: 'screen' });
  app.append(
    h('header', { class: 'topbar' }, h('h1', {}, 'Creature Collector'), h('span', { class: 'ver' }, `${SPECIES.length} species · ${partCount()} parts`)),
    nav, main,
  );

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
