// Sandbox battles: pick a party, fight a random opponent, or watch AI vs AI.
import { h, clear, toast } from './dom.js';
import { creatureEl, section } from './common.js';
import { makeRng, freshSeed } from '../core/rng.js';
import { randomGenome } from '../creature/genome.js';
import { createBattle, makeBattler, MAX_PARTY } from '../battle/engine.js';
import { fusionPool } from './state.js';
import { mountFight } from './fight.js';

const LEVELS = [10, 30, 50, 100];
const bs = { mode: 'setup', level: 30, rosterSeed: 'ARENA', roster: [], chosen: [], root: null, fight: null, last: null, auto: false };
let seededRoster = { seed: null, genomes: [] };

function buildRoster() {
  if (seededRoster.seed !== bs.rosterSeed) {
    seededRoster = { seed: bs.rosterSeed, genomes: Array.from({ length: 6 }, (_, i) => randomGenome(makeRng(`${bs.rosterSeed}:roster:${i}`))) };
  }
  const out = seededRoster.genomes.slice();
  for (const g of fusionPool.genomes) if (!out.includes(g)) out.push(g);
  bs.roster = out;
  bs.chosen = bs.chosen.filter((g) => out.includes(g));
}

export function renderBattleScreen(root) {
  bs.root = root;
  if (bs.fight) { bs.fight.destroy(); bs.fight = null; }
  buildRoster();
  clear(root);
  if (bs.mode === 'fight' && bs.last) startSandboxBattle(bs.last.mine, { foeParty: bs.last.foe, seed: bs.last.seed });
  else setupView(root);
}

function setupView(root) {
  const rerender = () => renderBattleScreen(root);
  const levelRow = h('div', { class: 'chips-row' }, LEVELS.map((L) => h('button', {
    class: `btn lvl${bs.level === L ? ' on' : ''}`, type: 'button', onclick: () => { bs.level = L; rerender(); },
  }, `Lv ${L}`)));
  const grid = h('div', { class: 'pool' });
  for (const g of bs.roster) {
    const idx = bs.chosen.indexOf(g);
    grid.append(h('button', { class: `pcard${idx >= 0 ? ' is-on' : ''}`, type: 'button', onclick: () => {
      if (idx >= 0) bs.chosen.splice(idx, 1);
      else if (bs.chosen.length < MAX_PARTY) bs.chosen.push(g);
      else { toast(`Party is full (${MAX_PARTY}).`); return; }
      rerender();
    } },
      idx >= 0 ? h('span', { class: 'sel badge a' }, String(idx + 1)) : null,
      g.gen ? h('span', { class: 'gen' }, `gen ${g.gen}`) : null,
      creatureEl(g, { size: 104, animate: false, level: bs.level }),
      h('span', {}, g.name)));
  }
  const start = (auto) => {
    let party = bs.chosen.slice();
    if (!party.length) party = bs.roster.slice(0, 3);
    bs.auto = auto;
    startSandboxBattle(party);
  };
  root.append(
    h('p', { class: 'hint' }, `Free battles for testing. Pick up to ${MAX_PARTY} creatures; the opponent gets a random party of the same size and level.`),
    ...section('Level', levelRow),
    ...section(`Your party · ${bs.chosen.length}/${MAX_PARTY}`,
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: () => { bs.rosterSeed = freshSeed(); bs.chosen = []; rerender(); } }, 'New roster'),
        h('button', { class: 'btn', type: 'button', onclick: () => { bs.chosen = []; rerender(); } }, 'Clear')),
      h('p', { class: 'hint' }, 'Creatures from the fusion pool show up here too.'),
      grid),
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => start(false) }, bs.chosen.length ? 'Battle!' : 'Quick battle'),
      h('button', { class: 'btn', type: 'button', onclick: () => start(true) }, 'Watch AI vs AI')),
  );
}

function startSandboxBattle(partyGenomes, opts = {}) {
  const seed = opts.seed || freshSeed();
  const rng = makeRng(`${seed}:foe`);
  const foeParty = opts.foeParty || Array.from({ length: partyGenomes.length }, (_, i) => randomGenome(rng.fork(`f${i}`)));
  const { state, events } = createBattle({
    sides: [
      { name: 'You', party: partyGenomes.map((g) => makeBattler(g, bs.level)) },
      { name: 'Foe', ai: true, party: foeParty.map((g) => makeBattler(g, bs.level)) },
    ],
    seed,
  });
  bs.last = { mine: partyGenomes, foe: foeParty, seed };
  bs.mode = 'fight';
  if (bs.fight) bs.fight.destroy();
  clear(bs.root);
  const host = h('div');
  bs.root.append(host);
  bs.fight = mountFight(host, {
    state, events, names: ['You', 'Foe'], auto: bs.auto,
    onQuit: () => { bs.mode = 'setup'; bs.auto = false; renderBattleScreen(bs.root); },
    resultButtons: [
      { label: 'Rematch', primary: true, onclick: () => { bs.auto = false; startSandboxBattle(bs.last.mine, { foeParty: bs.last.foe }); } },
      { label: 'New opponent', onclick: () => { bs.auto = false; startSandboxBattle(bs.last.mine); } },
      { label: 'Change party', onclick: () => { bs.mode = 'setup'; bs.auto = false; renderBattleScreen(bs.root); } },
    ],
  });
}
