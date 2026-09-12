// Reusable interactive battle view. Mount it with an engine state and it plays
// events, takes the player's choices, asks the AI for the foe's, and reports
// the final state. Used by the sandbox Battle tab and by the Arena.
import { h, clear, toast, appendChildren } from './dom.js';
import { typeChips, creatureEl, styleChip, stageBadge, dexMark } from './common.js';
import { makeRng } from '../core/rng.js';
import { step, legalActions, activeOf, describeEvent, moveEffectiveness, aliveCount, captureChance, levelCaptureMul, partyTopLevel, STATUS_INFO } from '../battle/engine.js';
import { chooseAction } from '../battle/ai.js';
import { getMove, accuracyText, moveEffects } from '../data/moves.js';
import { ITEM_IDS, getItem } from '../data/items.js';
import { TYPE_INFO } from '../data/types.js';
import { abilityName, getAbility } from '../data/abilities.js';
import { getCharm } from '../data/charms.js';
import { DAMAGE_TYPES, triangleEdge } from '../data/damage.js';
import { STAGE_LEVELS, stageOf, stageName } from '../data/evolution.js';
import { openSheet } from './sheet.js';
import { sfx } from '../core/sfx.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hpClass = (frac) => (frac > 0.5 ? 'ok' : frac > 0.2 ? 'warn' : 'low');

/**
 * cfg: { state, events, names, auto, fast, onEnd(state), onQuit(), resultButtons: [{label, primary, onclick}] }
 * Returns { destroy() }.
 */
export function mountFight(root, cfg) {
  const f = {
    root, state: cfg.state, names: cfg.names || ['You', 'Foe'], wild: Boolean(cfg.wild), auto: Boolean(cfg.auto), fast: Boolean(cfg.fast),
    busy: true, log: [], els: null, token: 1, alive: true, sheetClose: null,
    onEnd: cfg.onEnd || (() => {}), onQuit: cfg.onQuit || null, resultButtons: cfg.resultButtons || null, ended: false,
    dexStatus: cfg.dexStatus || null, // (genome) -> 'caught' | 'seen' | 'unseen' | null, for the mark beside a wild foe's name
  };
  buildFight(f);
  playFightEvents(f, cfg.events || []).then((ok) => { if (ok) afterFightStep(f); });
  return {
    destroy() { f.alive = false; f.token++; if (f.sheetClose) f.sheetClose(); },
    get state() { return f.state; },
  };
}

function buildFight(f) {
  const els = {
    foePanel: h('div', { class: 'panel panel-foe' }),
    foeStage: h('div', { class: 'stage stage-foe' }),
    meStage: h('div', { class: 'stage stage-me' }),
    mePanel: h('div', { class: 'panel panel-me' }),
    log: h('div', { class: 'battle-log', 'aria-live': 'polite' }),
    controls: h('div', { class: 'controls' }),
  };
  f.els = els;
  f.root.classList.add('fight-view');
  clear(f.root).append(
    h('div', { class: 'arena' },
      h('div', { class: 'arena-row' }, els.foePanel, els.foeStage),
      h('div', { class: 'arena-row' }, els.meStage, els.mePanel)),
    els.log,
    els.controls,
  );
  for (const i of [0, 1]) { renderStage(f, i); renderPanel(f, i); }
  renderFightControls(f);
}

/** Sheet options for a battler: your own show their moves, a foe's only its level. */
function sheetOptsFor(i, b) { return i === 0 ? { level: b.level, moves: b.moves.map((x) => x.id) } : { level: b.level }; }

/** The list a battler's sheet cycles through: its whole side, drawn the same way. */
function partyNav(st, i, b) {
  const side = st.sides[i];
  return { label: i === 0 ? 'Your party' : 'Their party', index: side.party.indexOf(b), items: side.party.map((p) => ({ genome: p.genome, opts: sheetOptsFor(i, p) })) };
}

function renderPanel(f, i) {
  const st = f.state, side = st.sides[i], b = activeOf(st, i);
  const el = i === 0 ? f.els.mePanel : f.els.foePanel;
  const frac = b.hp / b.maxHp;
  // tapping a panel opens the creature's sheet, so the full passive text is always a tap away on a small screen
  el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', `${b.name}: details`);
  const open = () => openSheet(b.genome, { ...sheetOptsFor(i, b), nav: partyNav(st, i, b) });
  el.onclick = open;
  el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  appendChildren(clear(el), [
    h('div', { class: 'panel-head' }, i === 1 && f.wild && f.dexStatus && f.dexStatus(b.genome) ? dexMark(f.dexStatus(b.genome)) : null, h('b', {}, b.name), h('span', { class: 'lvl' }, `Lv ${b.level}`), stageBadge(b.level), styleChip(null, b.style),
      b.status ? h('span', { class: `status st-${b.status}` }, STATUS_INFO[b.status].short) : null,
      h('span', { class: 'panel-info', 'aria-hidden': 'true' }, 'i')),
    typeChips(b.types),
    h('div', { class: 'passive' }, h('b', {}, abilityName(b.ability)), h('span', {}, ` ${(getAbility(b.ability) || { desc: 'No passive skill.' }).desc}`)),
    b.held && getCharm(b.held) ? h('div', { class: 'passive held' }, h('b', {}, getCharm(b.held).name), h('span', {}, ` ${getCharm(b.held).desc}`)) : null,
    h('div', { class: 'hpbar' }, h('i', { class: hpClass(frac), style: { width: `${Math.max(0, frac * 100)}%` } })),
    h('div', { class: 'panel-foot' },
      h('span', { class: 'hpnum' }, i === 0 ? `${b.hp} / ${b.maxHp}` : `${Math.ceil(frac * 100)}%`),
      h('span', { class: 'balls' }, side.party.map((p) => h('i', { class: p.fainted ? 'out' : '' })))),
    b.xp ? xpRow(b.xp) : null,
  ]);
}

function xpFrac(xp) { return xp.next > xp.prev ? Math.max(0, Math.min(1, (xp.cur - xp.prev) / (xp.next - xp.prev))) : 1; }

/** Labelled EXP bar. title carries the exact numbers. */
export function xpRow(xp) {
  const frac = xpFrac(xp);
  const toNext = Math.max(0, xp.next - xp.cur);
  return h('div', { class: 'xprow', title: xp.next > xp.prev ? `${toNext} EXP to the next level` : 'Max level' },
    h('span', {}, 'EXP'),
    h('div', { class: 'xpbar' }, h('i', { style: { width: `${frac * 100}%` } })));
}

/** After a win: fill the active creature's EXP bar, rolling over on each level gained. */
async function animateXp(f, gains) {
  const st = f.state;
  for (const g of gains) { const b = st.sides[0].party[g.index]; if (b && g.after) { b.xp = g.after; b.level = g.to.level; } }
  const g = gains.find((x) => x.index === st.sides[0].active);
  const panel = f.els.mePanel;
  const bar = panel && panel.querySelector('.xpbar i');
  if (!g || !bar) return;
  const lvl = panel.querySelector('.lvl');
  const name = activeOf(st, 0).name;
  const speed = f.fast ? 0.35 : 1;
  let level = g.from.level;
  bar.style.transition = 'none';
  bar.style.width = `${g.from.frac * 100}%`;
  await wait(60);
  while (level < g.to.level && f.alive) {
    bar.style.transition = `width ${0.6 * speed}s ease`;
    bar.style.width = '100%';
    await wait(680 * speed);
    level++;
    sfx.levelUp();
    if (lvl) lvl.textContent = `Lv ${level}`;
    logLine(f, `${name} grew to Lv ${level}!`);
    if (STAGE_LEVELS.includes(level)) logLine(f, `${name} evolved! ${stageName(stageOf(level))}: larger, with its features ${stageOf(level) === 3 ? 'exaggerated' : 'more pronounced'}.`);
    bar.style.transition = 'none';
    bar.style.width = '0%';
    await wait(90);
  }
  bar.style.transition = `width ${0.6 * speed}s ease`;
  bar.style.width = `${g.to.frac * 100}%`;
  await wait(720 * speed);
}

function renderStage(f, i) {
  const b = activeOf(f.state, i);
  const el = i === 0 ? f.els.meStage : f.els.foeStage;
  clear(el).append(h('div', { class: 'combatant enter' }, creatureEl(b.genome, { size: 200, facing: i === 0 ? 'right' : 'left', level: b.level })));
  setTimeout(() => { const c = el.firstChild; if (c) c.classList.remove('enter'); }, 400);
}

/** Flash a pose on a combatant: swap its sprite for the posed render, then back to the idle pose after ms (never, when ms is 0). */
function poseStage(f, i, pose, ms) {
  const b = activeOf(f.state, i);
  const el = i === 0 ? f.els.meStage : f.els.foeStage;
  const c = el.firstChild;
  if (!c || !b) return;
  const opts = { size: 200, facing: i === 0 ? 'right' : 'left', level: b.level };
  const swap = (p) => { const svg = c.querySelector('svg'); if (svg) svg.replaceWith(creatureEl(b.genome, { ...opts, pose: p })); };
  swap(pose);
  if (!ms) return;
  const token = f.token;
  setTimeout(() => { if (f.alive && f.token === token && c.isConnected && activeOf(f.state, i) === b) swap(undefined); }, ms);
}

function setHp(f, i, hp, maxHp) {
  const el = i === 0 ? f.els.mePanel : f.els.foePanel;
  const bar = el.querySelector('.hpbar i');
  const frac = hp / maxHp;
  if (bar) { bar.style.width = `${Math.max(0, frac * 100)}%`; bar.className = hpClass(frac); }
  const num = el.querySelector('.hpnum');
  if (num) num.textContent = i === 0 ? `${hp} / ${maxHp}` : `${Math.ceil(frac * 100)}%`;
}

function animateStage(f, i, cls, ms = 500) {
  const el = i === 0 ? f.els.meStage : f.els.foeStage;
  const c = el.firstChild;
  if (!c) return;
  c.classList.add(cls);
  setTimeout(() => c.classList.remove(cls), ms);
}

function logLine(f, text) {
  if (!text) return;
  f.log.push(text);
  const el = f.els.log;
  el.append(h('div', { class: 'line' }, text));
  while (el.children.length > 4) el.removeChild(el.firstChild);
}

/** Apply one event to the DOM. Returns how long to pause after it. */
function applyFightEvent(f, e) {
  const text = describeEvent(e, f.names, { wild: f.wild });
  switch (e.t) {
    case 'turn': logLine(f, text); return 250;
    case 'switch': renderStage(f, e.side); renderPanel(f, e.side); logLine(f, text); sfx.cry(activeOf(f.state, e.side).genome); return 650;
    case 'move': logLine(f, text); animateStage(f, e.side, e.side === 0 ? 'lunge-r' : 'lunge-l', 450); poseStage(f, e.side, 'attack', 450); return 550;
    case 'damage': animateStage(f, e.side, 'hit', 450); poseStage(f, e.side, 'hurt', 450); setHp(f, e.side, e.hp, e.maxHp); logLine(f, text); sfx.hit(e.eff); return e.eff !== 1 || e.crit ? 750 : 550;
    case 'hurt': animateStage(f, e.side, 'hit', 350); poseStage(f, e.side, 'hurt', 350); setHp(f, e.side, e.hp, e.maxHp); logLine(f, text); sfx.hit(1); return 550;
    case 'heal': if (!e.uid || e.uid === activeOf(f.state, e.side).uid) setHp(f, e.side, e.hp, e.maxHp); logLine(f, text); sfx.heal(); return 550;
    case 'item': logLine(f, text); return 500;
    case 'faint': animateStage(f, e.side, 'faint', 900); poseStage(f, e.side, 'hurt', 0); logLine(f, text); renderPanel(f, e.side); sfx.faint(); return 900;
    case 'status': renderPanel(f, e.side); logLine(f, text); sfx.status(); return 550;
    case 'cure': renderPanel(f, e.side); logLine(f, text); return 550;
    case 'stat': logLine(f, text); if (e.stages) sfx.stat(e.stages > 0); return 450;
    case 'miss': logLine(f, text); sfx.miss(); return 450;
    case 'capture': animateStage(f, 1, e.ok ? 'captured' : 'wobble', e.ok ? 900 : 700); logLine(f, text); sfx.capture(e.ok); return e.ok ? 900 : 800;
    case 'end': logLine(f, text); if (e.winner === 0) sfx.win(); else if (e.winner === 1) sfx.lose(); return 600;
    default: logLine(f, text); return text ? 450 : 0;
  }
}

async function playFightEvents(f, events) {
  const token = f.token;
  for (const e of events) {
    if (!f.alive || token !== f.token || !f.root.isConnected) return false;
    const ms = applyFightEvent(f, e);
    if (ms) await wait(f.fast ? Math.round(ms * 0.3) : ms);
  }
  return f.alive && token === f.token && f.root.isConnected;
}

function aiFor(st, i) { return chooseAction(st, i, makeRng(`${st.seed}:ai:${st.turn}:${st.phase}:${i}`)); }

async function doFightStep(f, playerAction) {
  const st = f.state;
  let actions;
  if (st.phase === 'replace') actions = [st.sides[0].needsReplace ? (playerAction || aiFor(st, 0)) : null, st.sides[1].needsReplace ? aiFor(st, 1) : null];
  else actions = [playerAction || aiFor(st, 0), aiFor(st, 1)];
  let result;
  try { result = step(st, actions); } catch (e) { toast(e.message); f.busy = false; renderFightControls(f); return; }
  f.state = result.state;
  f.busy = true;
  renderFightControls(f);
  const ok = await playFightEvents(f, result.events);
  if (ok) afterFightStep(f);
}

async function afterFightStep(f) {
  const st = f.state;
  if (st.phase === 'over') {
    f.busy = false;
    renderFightControls(f);
    if (!f.ended) {
      f.ended = true;
      const after = f.onEnd(st);
      if (after && Array.isArray(after.xp) && after.xp.length) await animateXp(f, after.xp);
      if (f.alive) showFightResult(f);
    }
    return;
  }
  if (st.phase === 'replace') {
    if (st.sides[0].needsReplace && !f.auto) { f.busy = false; renderFightControls(f); openFightParty(f, true); return; }
    await wait(f.fast ? 200 : 500);
    if (f.alive) doFightStep(f, null);
    return;
  }
  f.busy = false;
  renderFightControls(f);
  if (f.auto) { await wait(f.fast ? 250 : 700); if (f.alive && f.auto && !f.busy && f.state.phase === 'choose') doFightStep(f, null); }
}

/** Type-chart verdict for a move against the foe, as words. Empty when neutral or not applicable. */
export function effText(mv, foe) {
  if (mv.cat === 'status' && !mv.fx.some((x) => x.k === 'status')) return '';
  const eff = moveEffectiveness(mv, foe);
  if (eff === 0) return 'No effect';
  if (mv.cat === 'status') return '';
  if (eff >= 2) return 'Super effective';
  if (eff < 1) return 'Not very effective';
  return '';
}

/** Damage-triangle verdict for a move against the foe's style. */
export function triangleText(mv, foe) {
  if (!DAMAGE_TYPES[mv.cat]) return '';
  const edge = triangleEdge(mv.cat, foe.style);
  const vs = DAMAGE_TYPES[foe.style] ? DAMAGE_TYPES[foe.style].name : '';
  return edge === 'edge' ? `Strong vs ${vs}` : edge === 'weak' ? `Weak vs ${vs}` : '';
}

/** Affinity tag for a move card: '+25% type', '+25% style' or '+50% type & style' (Purebred shows its larger share). */
export function bonusText(mv, me) {
  if (!DAMAGE_TYPES[mv.cat]) return '';
  const type = !mv.typeless && me.types.includes(mv.type) ? (me.ability === 'purebred' ? 50 : 25) : 0;
  const style = mv.cat === me.style ? 25 : 0;
  if (!type && !style) return '';
  return `+${type + style}% ${type && style ? 'type & style' : type ? 'type' : 'style'}`;
}

/** rgba() tint of a hex colour. */
function tintOf(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function renderFightControls(f) {
  const el = f.els && f.els.controls;
  if (!el) return;
  const st = f.state;
  clear(el);
  const util = h('div', { class: 'util-row' },
    h('button', { class: `btn small${f.fast ? ' on' : ''}`, type: 'button', onclick: () => { f.fast = !f.fast; renderFightControls(f); } }, f.fast ? 'Fast ✓' : 'Fast'),
    h('button', { class: `btn small${f.auto ? ' on' : ''}`, type: 'button', onclick: () => { f.auto = !f.auto; renderFightControls(f); if (f.auto && !f.busy && st.phase !== 'over') afterFightStep(f); } }, f.auto ? 'Auto ✓' : 'Auto'),
    f.onQuit ? h('button', { class: 'btn small', type: 'button', onclick: () => { f.alive = false; f.token++; f.onQuit(f.state); } }, 'Quit') : null,
  );
  if (st.phase === 'over') { el.append(util); return; }
  if (f.busy || f.auto) { el.append(h('div', { class: 'waiting' }, f.auto ? 'Auto battle running…' : '…'), util); return; }
  if (st.phase === 'replace') {
    el.append(h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => openFightParty(f, true) }, 'Choose next creature'), util);
    return;
  }
  const me = activeOf(st, 0), foe = activeOf(st, 1);
  const legal = legalActions(st, 0);
  const grid = h('div', { class: 'moves' });
  me.moves.forEach((m, i) => {
    const mv = getMove(m.id);
    const info = TYPE_INFO[mv.type];
    const ok = legal.some((a) => a.type === 'move' && a.index === i);
    const dt = DAMAGE_TYPES[mv.cat];
    const eff = effText(mv, foe), tri = triangleText(mv, foe), bonus = bonusText(mv, me);
    grid.append(h('button', { class: `move-btn cat-${mv.cat}`, type: 'button', disabled: !ok, style: { '--chip': info.color, '--tint': tintOf(info.color, 0.42) }, onclick: () => doFightStep(f, { type: 'move', index: i }) },
      h('span', { class: 'mv-name' }, mv.name, h('span', { class: 'pp' }, `${m.pp}/${m.maxPp}`)),
      h('span', { class: 'mv-meta' },
        h('span', { class: 'chip' }, h('b', {}, info.glyph), mv.type),
        h('span', { class: `chip dt-chip dt-${mv.cat}`, style: dt ? { '--chip': dt.color } : null }, dt ? h('b', {}, dt.icon) : null, dt ? `${dt.name}${mv.power ? ` ${mv.power}` : ''}` : 'Status')),
      h('span', { class: 'mv-fx' }, h('em', { class: 'acc' }, accuracyText(mv)), ...moveEffects(mv).map((t) => h('em', { class: /burn|poison|paralys|sleep|freeze|flinch/.test(t) ? 'st' : '' }, t))),
      eff || tri || bonus ? h('span', { class: 'mv-tags' },
        eff ? h('em', { class: `eff ${eff === 'Super effective' ? 'good' : 'bad'}` }, eff) : null,
        tri ? h('em', { class: `tri ${tri.startsWith('Strong') ? 'good' : 'bad'}` }, tri) : null,
        bonus ? h('em', { class: 'bonus' }, bonus) : null) : null));
  });
  const struggle = legal.find((a) => a.struggle);
  if (struggle) grid.append(h('button', { class: 'move-btn cat-melee', type: 'button', onclick: () => doFightStep(f, struggle) }, h('span', { class: 'mv-name' }, 'Struggle'), h('span', { class: 'mv-meta' }, 'No PP left')));
  const row = h('div', { class: 'row wrap' },
    h('button', { class: 'btn', type: 'button', onclick: () => openFightParty(f, false) }, `Party (${aliveCount(st.sides[0])})`),
    h('button', { class: 'btn', type: 'button', onclick: () => openSheet(me.genome, { ...sheetOptsFor(0, me), nav: partyNav(st, 0, me) }) }, 'Info'));
  const stock = itemStock(st);
  if (stock > 0) row.append(h('button', { class: 'btn', type: 'button', onclick: () => openFightItems(f) }, `Items (${stock})`));
  if (legal.some((a) => a.type === 'capture')) {
    const top = partyTopLevel(st), mul = levelCaptureMul(top, foe.level);
    const pct = Math.round(captureChance(foe, top) * 100);
    const diff = Math.round((mul - 1) * 100);
    const why = diff === 0 ? 'Your strongest matches its level.' : `Your strongest is Lv ${top} against its Lv ${foe.level}: catch odds ${diff > 0 ? '+' : ''}${diff}%.`;
    row.prepend(h('button', { class: 'btn capture', type: 'button', title: why, onclick: () => doFightStep(f, { type: 'capture' }) }, `Capture · ${pct}%`, diff ? h('span', { class: `cap-mod ${diff > 0 ? 'good' : 'bad'}` }, `${diff > 0 ? '+' : ''}${diff}%`) : null));
  }
  el.append(grid, row, util);
}

function itemStock(st) { return Object.values(st.items || {}).reduce((a, n) => a + (n > 0 ? n : 0), 0); }

/** Bottom sheet listing the potions in the bag; picking one asks which party member to use it on. */
function openFightItems(f) {
  if (f.sheetClose) f.sheetClose();
  const st = f.state;
  const legal = legalActions(st, 0);
  const close = () => { backdrop.remove(); sheet.remove(); f.sheetClose = null; };
  f.sheetClose = close;
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: close });
  const list = h('div', { class: 'party-list' });
  for (const id of ITEM_IDS) {
    const qty = st.items && st.items[id];
    if (!(qty > 0)) continue;
    const item = getItem(id);
    const can = legal.some((a) => a.type === 'item' && a.id === id);
    list.append(h('button', { class: 'party-row', type: 'button', disabled: !can, onclick: () => { close(); openFightTarget(f, id); } },
      h('div', { class: 'item-icon', style: { '--chip': item.color } }, '+'),
      h('div', { class: 'party-info' },
        h('div', {}, h('b', {}, item.name), ' ', h('span', { class: 'lvl' }, `×${qty}`)),
        h('div', { class: 'hint', style: { margin: 0 } }, can ? item.desc : `${item.desc} Nobody needs it right now.`))));
  }
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Items' },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, 'Items'), h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    h('p', { class: 'hint' }, 'Using an item takes your turn.'),
    list);
  document.body.append(backdrop, sheet);
}

/** Second step of the item flow: pick the party member to use the potion on. */
function openFightTarget(f, itemId) {
  if (f.sheetClose) f.sheetClose();
  const st = f.state, side = st.sides[0], item = getItem(itemId);
  const legal = legalActions(st, 0);
  const close = () => { backdrop.remove(); sheet.remove(); f.sheetClose = null; };
  f.sheetClose = close;
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: close });
  const list = h('div', { class: 'party-list' });
  side.party.forEach((b, i) => {
    const can = legal.some((a) => a.type === 'item' && a.id === itemId && a.index === i);
    const frac = b.hp / b.maxHp;
    list.append(h('button', { class: `party-row${i === side.active ? ' active' : ''}${b.fainted ? ' fainted' : ''}`, type: 'button', disabled: !can, onclick: () => { close(); doFightStep(f, { type: 'item', id: itemId, index: i }); } },
      creatureEl(b.genome, { size: 64, animate: false, level: b.level }),
      h('div', { class: 'party-info' },
        h('div', {}, h('b', {}, b.name), ' ', h('span', { class: 'lvl' }, `Lv ${b.level}`), ' ', b.status ? h('span', { class: `status st-${b.status}` }, STATUS_INFO[b.status].short) : null, i === side.active ? h('span', { class: 'status' }, 'ACTIVE') : null),
        h('div', { class: 'hpbar' }, h('i', { class: hpClass(frac), style: { width: `${frac * 100}%` } })),
        h('div', { class: 'hint', style: { margin: 0 } }, b.fainted ? 'Fainted — a potion cannot help.' : can ? `${b.hp} / ${b.maxHp}` : `${b.hp} / ${b.maxHp} · nothing to restore`))));
  });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Use item' },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, `Use ${item.name} on…`), h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    h('p', { class: 'hint' }, item.desc),
    list);
  document.body.append(backdrop, sheet);
}

function openFightParty(f, forced) {
  if (f.sheetClose) f.sheetClose();
  const st = f.state, side = st.sides[0];
  const legal = legalActions(st, 0);
  const close = () => { backdrop.remove(); sheet.remove(); f.sheetClose = null; };
  f.sheetClose = close;
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: forced ? null : close });
  const list = h('div', { class: 'party-list' });
  side.party.forEach((b, i) => {
    const can = legal.some((a) => a.type === 'switch' && a.index === i);
    const frac = b.hp / b.maxHp;
    list.append(h('button', { class: `party-row${i === side.active ? ' active' : ''}${b.fainted ? ' fainted' : ''}`, type: 'button', disabled: !can, onclick: () => { close(); doFightStep(f, { type: 'switch', index: i }); } },
      creatureEl(b.genome, { size: 64, animate: false, level: b.level }),
      h('div', { class: 'party-info' },
        h('div', {}, h('b', {}, b.name), ' ', h('span', { class: 'lvl' }, `Lv ${b.level}`), ' ', b.status ? h('span', { class: `status st-${b.status}` }, STATUS_INFO[b.status].short) : null, i === side.active ? h('span', { class: 'status' }, 'ACTIVE') : null),
        h('div', { class: 'hpbar' }, h('i', { class: hpClass(frac), style: { width: `${frac * 100}%` } })),
        b.xp ? xpRow(b.xp) : null,
        h('div', { class: 'hint', style: { margin: 0 } }, `${b.hp} / ${b.maxHp} · ${abilityName(b.ability)}`))));
  });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Party' },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, forced ? 'Choose your next creature' : 'Party'), forced ? null : h('button', { class: 'btn close', onclick: close, 'aria-label': 'Close' }, '✕')),
    list);
  document.body.append(backdrop, sheet);
}

function showFightResult(f) {
  const st = f.state;
  const won = st.winner === 0, draw = st.winner == null;
  const title = st.captured ? 'Caught!' : draw ? 'Draw!' : won ? 'You won!' : 'You lost…';
  const buttons = (f.resultButtons || []).map((b) => h('button', { class: `btn${b.primary ? ' primary' : ''}`, type: 'button', onclick: b.onclick }, b.label));
  f.els.controls.prepend(h('div', { class: 'result-card' },
    h('h2', {}, title),
    h('p', { class: 'hint' }, `${st.turn} turns · ${aliveCount(st.sides[0])} of yours still standing`),
    buttons.length ? h('div', { class: 'row wrap' }, buttons) : null));
}
