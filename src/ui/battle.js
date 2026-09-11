// Battle screen: party setup, then a portrait arena that plays back engine events.
import { h, clear, toast } from './dom.js';
import { typeChips, creatureEl, section } from './common.js';
import { makeRng, freshSeed } from '../core/rng.js';
import { randomGenome } from '../creature/genome.js';
import { createBattle, step, legalActions, makeBattler, activeOf, describeEvent, moveEffectiveness, aliveCount, STATUS_INFO, MAX_PARTY } from '../battle/engine.js';
import { chooseAction } from '../battle/ai.js';
import { getMove } from '../data/moves.js';
import { TYPE_INFO } from '../data/types.js';
import { abilityName } from '../data/abilities.js';
import { fusionPool } from './state.js';
import { openSheet } from './lab.js';

const LEVELS = [10, 30, 50, 100];
const bs = {
  mode: 'setup', level: 30, rosterSeed: null, roster: [], chosen: [],
  state: null, names: ['You', 'Foe'], log: [], auto: false, fast: false, busy: false,
  root: null, els: null, last: null, token: 0, sheetClose: null,
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

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
  if (!bs.rosterSeed) bs.rosterSeed = 'ARENA';
  buildRoster();
  clear(root);
  if (bs.mode === 'setup') setupView(root);
  else fightView(root);
}

// ---- setup ------------------------------------------------------------------

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
      creatureEl(g, { size: 104, animate: false }),
      h('span', {}, g.name)));
  }
  const start = (auto) => {
    let party = bs.chosen.slice();
    if (!party.length) party = bs.roster.slice(0, 3);
    bs.auto = auto;
    startBattle(party);
  };
  root.append(
    h('p', { class: 'hint' }, `Pick up to ${MAX_PARTY} creatures. The opponent gets a random party of the same size at the same level.`),
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

// ---- battle flow ------------------------------------------------------------

function startBattle(partyGenomes, opts = {}) {
  const seed = opts.seed || freshSeed();
  const rng = makeRng(`${seed}:foe`);
  const foeParty = opts.foeParty || Array.from({ length: partyGenomes.length }, (_, i) => randomGenome(rng.fork(`f${i}`)));
  const { state, events } = createBattle({
    sides: [
      { name: bs.names[0], party: partyGenomes.map((g) => makeBattler(g, bs.level)) },
      { name: bs.names[1], ai: true, party: foeParty.map((g) => makeBattler(g, bs.level)) },
    ],
    seed,
  });
  bs.last = { mine: partyGenomes, foe: foeParty };
  bs.state = state;
  bs.mode = 'fight';
  bs.log = [];
  bs.busy = true;
  bs.token++;
  renderBattleScreen(bs.root);
  playEvents(events, bs.token).then((ok) => { if (ok) afterStep(); });
}

function aiFor(st, i) { return chooseAction(st, i, makeRng(`${st.seed}:ai:${st.turn}:${st.phase}:${i}`)); }

async function doStep(playerAction) {
  const st = bs.state;
  let actions;
  if (st.phase === 'replace') actions = [st.sides[0].needsReplace ? (playerAction || aiFor(st, 0)) : null, st.sides[1].needsReplace ? aiFor(st, 1) : null];
  else actions = [playerAction || aiFor(st, 0), aiFor(st, 1)];
  let result;
  try { result = step(st, actions); } catch (e) { toast(e.message); bs.busy = false; renderControls(); return; }
  bs.state = result.state;
  bs.busy = true;
  renderControls();
  const ok = await playEvents(result.events, bs.token);
  if (ok) afterStep();
}

async function afterStep() {
  const st = bs.state;
  if (st.phase === 'over') { bs.busy = false; renderControls(); showResult(); return; }
  if (st.phase === 'replace') {
    if (st.sides[0].needsReplace && !bs.auto) { bs.busy = false; renderControls(); openParty(true); return; }
    await wait(bs.fast ? 200 : 500);
    doStep(null);
    return;
  }
  bs.busy = false;
  renderControls();
  if (bs.auto) { await wait(bs.fast ? 250 : 700); if (bs.auto && bs.mode === 'fight' && !bs.busy) doStep(null); }
}

// ---- fight view -------------------------------------------------------------

function fightView(root) {
  const st = bs.state;
  const els = {
    foePanel: h('div', { class: 'panel panel-foe' }),
    foeStage: h('div', { class: 'stage stage-foe' }),
    meStage: h('div', { class: 'stage stage-me' }),
    mePanel: h('div', { class: 'panel panel-me' }),
    log: h('div', { class: 'battle-log', 'aria-live': 'polite' }),
    controls: h('div', { class: 'controls' }),
  };
  bs.els = els;
  root.append(
    h('div', { class: 'arena' },
      h('div', { class: 'arena-row' }, els.foePanel, els.foeStage),
      h('div', { class: 'arena-row' }, els.meStage, els.mePanel)),
    els.log,
    els.controls,
  );
  for (const i of [0, 1]) { renderStage(i); renderPanel(i); }
  for (const line of bs.log.slice(-4)) els.log.append(h('div', { class: 'line' }, line));
  renderControls();
  if (st.phase === 'over') showResult();
}

function hpClass(frac) { return frac > 0.5 ? 'ok' : frac > 0.2 ? 'warn' : 'low'; }

function renderPanel(i) {
  const st = bs.state, side = st.sides[i], b = activeOf(st, i);
  const el = i === 0 ? bs.els.mePanel : bs.els.foePanel;
  const frac = b.hp / b.maxHp;
  clear(el).append(
    h('div', { class: 'panel-head' }, h('b', {}, b.name), h('span', { class: 'lvl' }, `Lv ${b.level}`),
      b.status ? h('span', { class: `status st-${b.status}` }, STATUS_INFO[b.status].short) : null),
    typeChips(b.types),
    h('div', { class: 'hpbar' }, h('i', { class: hpClass(frac), style: { width: `${Math.max(0, frac * 100)}%` } })),
    h('div', { class: 'panel-foot' },
      h('span', { class: 'hpnum' }, i === 0 ? `${b.hp} / ${b.maxHp}` : `${Math.ceil(frac * 100)}%`),
      h('span', { class: 'balls' }, side.party.map((p) => h('i', { class: p.fainted ? 'out' : '' })))),
  );
  el.dataset.uid = b.uid;
}

function renderStage(i) {
  const b = activeOf(bs.state, i);
  const el = i === 0 ? bs.els.meStage : bs.els.foeStage;
  clear(el).append(h('div', { class: 'combatant enter', dataset: { uid: b.uid } }, creatureEl(b.genome, { size: 200, facing: i === 0 ? 'right' : 'left' })));
  setTimeout(() => { const c = el.firstChild; if (c) c.classList.remove('enter'); }, 400);
}

function setHp(i, hp, maxHp) {
  const el = i === 0 ? bs.els.mePanel : bs.els.foePanel;
  const bar = el.querySelector('.hpbar i');
  const frac = hp / maxHp;
  if (bar) { bar.style.width = `${Math.max(0, frac * 100)}%`; bar.className = hpClass(frac); }
  const num = el.querySelector('.hpnum');
  if (num) num.textContent = i === 0 ? `${hp} / ${maxHp}` : `${Math.ceil(frac * 100)}%`;
}

function animate(i, cls, ms = 500) {
  const el = i === 0 ? bs.els.meStage : bs.els.foeStage;
  const c = el.firstChild;
  if (!c) return;
  c.classList.add(cls);
  setTimeout(() => c.classList.remove(cls), ms);
}

function logLine(text) {
  if (!text) return;
  bs.log.push(text);
  const el = bs.els.log;
  el.append(h('div', { class: 'line' }, text));
  while (el.children.length > 4) el.removeChild(el.firstChild);
}

/** Apply one event to the DOM. Returns how long to pause after it. */
function applyEvent(e) {
  const text = describeEvent(e, bs.names);
  switch (e.t) {
    case 'turn': logLine(text); return 250;
    case 'switch': renderStage(e.side); renderPanel(e.side); logLine(text); return 650;
    case 'move': logLine(text); animate(e.side, e.side === 0 ? 'lunge-r' : 'lunge-l', 450); return 550;
    case 'damage': animate(e.side, 'hit', 450); setHp(e.side, e.hp, e.maxHp); logLine(text); return e.eff !== 1 || e.crit ? 750 : 550;
    case 'hurt': animate(e.side, 'hit', 350); setHp(e.side, e.hp, e.maxHp); logLine(text); return 550;
    case 'heal': setHp(e.side, e.hp, e.maxHp); logLine(text); return 550;
    case 'faint': animate(e.side, 'faint', 900); logLine(text); renderPanel(e.side); return 900;
    case 'status': case 'cure': renderPanel(e.side); logLine(text); return 550;
    case 'end': logLine(text); return 600;
    default: logLine(text); return text ? 450 : 0;
  }
}

async function playEvents(events, token) {
  for (const e of events) {
    if (token !== bs.token || !bs.root.isConnected || bs.mode !== 'fight') return false;
    const ms = applyEvent(e);
    if (ms) await wait(bs.fast ? Math.round(ms * 0.3) : ms);
  }
  return token === bs.token && bs.root.isConnected && bs.mode === 'fight';
}

function effMarker(mv, foe) {
  if (mv.cat === 'status' && !mv.fx.some((f) => f.k === 'status')) return '';
  const eff = moveEffectiveness(mv, foe);
  if (mv.cat === 'status') return eff === 0 ? '✕' : '';
  if (eff === 0) return '✕';
  if (eff >= 4) return '▲▲';
  if (eff >= 2) return '▲';
  if (eff <= 0.25) return '▼▼';
  if (eff < 1) return '▼';
  return '';
}

function renderControls() {
  const el = bs.els && bs.els.controls;
  if (!el) return;
  const st = bs.state;
  clear(el);
  const util = h('div', { class: 'util-row' },
    h('button', { class: `btn small${bs.fast ? ' on' : ''}`, type: 'button', onclick: () => { bs.fast = !bs.fast; renderControls(); } }, bs.fast ? 'Fast ✓' : 'Fast'),
    h('button', { class: `btn small${bs.auto ? ' on' : ''}`, type: 'button', onclick: () => { bs.auto = !bs.auto; renderControls(); if (bs.auto && !bs.busy && st.phase !== 'over') afterStep(); } }, bs.auto ? 'Auto ✓' : 'Auto'),
    h('button', { class: 'btn small', type: 'button', onclick: () => { bs.token++; bs.mode = 'setup'; bs.auto = false; renderBattleScreen(bs.root); } }, 'Quit'),
  );
  if (st.phase === 'over') { el.append(util); return; }
  if (bs.busy || bs.auto) {
    el.append(h('div', { class: 'waiting' }, bs.auto ? 'Auto battle running…' : '…'), util);
    return;
  }
  if (st.phase === 'replace') {
    el.append(h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => openParty(true) }, 'Choose next creature'), util);
    return;
  }
  const me = activeOf(st, 0), foe = activeOf(st, 1);
  const legal = legalActions(st, 0);
  const grid = h('div', { class: 'moves' });
  me.moves.forEach((m, i) => {
    const mv = getMove(m.id);
    const info = TYPE_INFO[mv.type];
    const ok = legal.some((a) => a.type === 'move' && a.index === i);
    grid.append(h('button', { class: 'move-btn', type: 'button', disabled: !ok, style: { '--chip': info.color }, onclick: () => doStep({ type: 'move', index: i }) },
      h('span', { class: 'mv-name' }, mv.name, h('em', { class: 'eff' }, effMarker(mv, foe))),
      h('span', { class: 'mv-meta' }, h('span', { class: 'chip' }, h('b', {}, info.glyph), mv.type), h('span', { class: 'pp' }, `${m.pp}/${m.maxPp}`))));
  });
  const struggle = legal.find((a) => a.struggle);
  if (struggle) grid.append(h('button', { class: 'move-btn', type: 'button', onclick: () => doStep(struggle) }, h('span', { class: 'mv-name' }, 'Struggle'), h('span', { class: 'mv-meta' }, 'No PP left')));
  el.append(grid, h('div', { class: 'row' },
    h('button', { class: 'btn', type: 'button', onclick: () => openParty(false) }, `Party (${aliveCount(st.sides[0])})`),
    h('button', { class: 'btn', type: 'button', onclick: () => openSheet(me.genome) }, 'Info')), util);
}

function openParty(forced) {
  if (bs.sheetClose) bs.sheetClose();
  const st = bs.state, side = st.sides[0];
  const legal = legalActions(st, 0);
  const close = () => { backdrop.remove(); sheet.remove(); bs.sheetClose = null; };
  bs.sheetClose = close;
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: forced ? null : close });
  const list = h('div', { class: 'party-list' });
  side.party.forEach((b, i) => {
    const can = legal.some((a) => a.type === 'switch' && a.index === i);
    const frac = b.hp / b.maxHp;
    list.append(h('button', { class: `party-row${i === side.active ? ' active' : ''}${b.fainted ? ' fainted' : ''}`, type: 'button', disabled: !can, onclick: () => { close(); doStep({ type: 'switch', index: i }); } },
      creatureEl(b.genome, { size: 64, animate: false }),
      h('div', { class: 'party-info' },
        h('div', {}, h('b', {}, b.name), ' ', h('span', { class: 'lvl' }, `Lv ${b.level}`), b.status ? h('span', { class: `status st-${b.status}` }, STATUS_INFO[b.status].short) : null, i === side.active ? h('span', { class: 'status' }, 'ACTIVE') : null),
        h('div', { class: 'hpbar' }, h('i', { class: hpClass(frac), style: { width: `${frac * 100}%` } })),
        h('div', { class: 'hint', style: { margin: 0 } }, `${b.hp} / ${b.maxHp} · ${abilityName(b.ability)}`))));
  });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Party' },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, forced ? 'Choose your next creature' : 'Party'), forced ? null : h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    list);
  document.body.append(backdrop, sheet);
}

function showResult() {
  const st = bs.state;
  const won = st.winner === 0, draw = st.winner == null;
  const card = h('div', { class: 'result-card' },
    h('h2', {}, draw ? 'Draw!' : won ? 'You won!' : 'You lost…'),
    h('p', { class: 'hint' }, `${st.turn} turns · ${aliveCount(st.sides[0])} of yours still standing`),
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary', type: 'button', onclick: () => { bs.auto = false; startBattle(bs.last.mine, { foeParty: bs.last.foe }); } }, 'Rematch'),
      h('button', { class: 'btn', type: 'button', onclick: () => { bs.auto = false; startBattle(bs.last.mine); } }, 'New opponent'),
      h('button', { class: 'btn', type: 'button', onclick: () => { bs.mode = 'setup'; bs.auto = false; renderBattleScreen(bs.root); } }, 'Change party')));
  bs.els.controls.prepend(card);
}
