// Part Lab: every part in the library on a neutral mannequin, grouped by slot.
import { h, clear } from './dom.js';
import { creatureEl } from './common.js';
import { SLOTS, SLOT_NAMES, PARTS_BY_SLOT } from '../data/parts/index.js';
import { mannequinGenome } from '../creature/render.js';

export function renderPartsScreen(root) {
  clear(root);
  root.append(h('p', { class: 'hint' }, 'Every part, drawn on a grey mannequin with the part in orange. Add parts in src/data/parts and they show up here.'));
  for (const slot of SLOTS) {
    const parts = PARTS_BY_SLOT[slot].filter((p) => !p.none);
    const row = h('div', { class: 'slot-row' });
    for (const part of parts) {
      row.append(h('div', { class: 'part', title: part.id },
        creatureEl(mannequinGenome(part), { size: 96, animate: false }),
        h('span', {}, part.name)));
    }
    root.append(h('section', { class: 'slot-sec' }, h('h3', { class: 'sec' }, `${SLOT_NAMES[slot]} · ${parts.length}`), row));
  }
}
