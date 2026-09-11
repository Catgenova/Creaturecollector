// Part Lab: every part in the library on a neutral mannequin, grouped by rig and slot.
import { h, clear } from './dom.js';
import { creatureEl } from './common.js';
import { RIG_PARTS, partsOf } from '../data/parts/index.js';
import { RIGS, slotsFor, slotName } from '../data/rigs.js';
import { mannequinGenome } from '../creature/render.js';

export function renderPartsScreen(root) {
  clear(root);
  root.append(h('p', { class: 'hint' }, 'Every part, drawn on a neutral mannequin of its class with the part in orange. Add parts in src/data/parts and they show up here.'));
  for (const rigId of Object.keys(RIG_PARTS)) {
    const rig = RIGS[rigId];
    const total = slotsFor(rigId).reduce((n, slot) => n + partsOf(rigId, slot).filter((p) => !p.none).length, 0);
    root.append(h('h2', { class: 'rig-title' }, `${rig.name} skeleton · ${total} parts`));
    for (const slot of slotsFor(rigId)) {
      const parts = partsOf(rigId, slot).filter((p) => !p.none);
      if (!parts.length) continue;
      const row = h('div', { class: 'slot-row' });
      for (const part of parts) {
        row.append(h('div', { class: 'part', title: part.id },
          creatureEl(mannequinGenome(part), { size: 96, animate: false }),
          h('span', {}, part.name)));
      }
      root.append(h('section', { class: 'slot-sec' }, h('h3', { class: 'sec' }, `${slotName(rigId, slot)} · ${parts.length}`), row));
    }
  }
}
