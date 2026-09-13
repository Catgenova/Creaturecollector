// Overworld screen: a canvas map you walk across with the keyboard, an on-screen pad or a
// tap on the ground; wild encounters on habitat tiles, trainers who fight when asked,
// Wardens in their lairs, the Council Spire, camps that heal and a shrine that fuses.
// Fights hand off to the shared fight view and come back to the same spot.
import { h, clear, toast, copyText, appendChildren } from './dom.js';
import { creatureEl, typeChips, section, stageBadge, moveInfoEl, dexMark } from './common.js';
import { freshSeed, makeRng } from '../core/rng.js';
import { openSheet } from './sheet.js';
import { trapFocus, hpLabel } from './a11y.js';
import { mountFight, xpRow } from './fight.js';
import { STATUS_INFO, levelCaptureMul } from '../battle/engine.js';
import { stageOf, stageName } from '../data/evolution.js';
import { loadSave, persistSave, exportSave, importSave, recordCollection, retireJourney, SLOTS, activeSlot, useSlot, persistSlot, clearSlot, slotSummaries } from '../game/save.js';
import { SPEEDS, TEXT_SIZES, MOTIONS, CONTRASTS, MUSIC_LEVELS, THEMES } from '../game/settings.js';
import { getSettings, updateSetting, fightSpeed } from './settings.js';
import { playTheme } from '../core/music.js';
import { memberMaxHp, xpProgress, learnMove, moveMember, setLead, canFight, releaseMember, renameMember, setLocked, PRESETS, savePreset, applyPreset, presetMembers } from '../game/party.js';
import { JOURNEY, newJourney, chooseJourneyStarter, tryMove, facing, talkTo, acceptChallenge, rematchTeam, challengeWarden, challengeTitan, seekElder, enterSpire, trialToday, startTrial, fleeEncounter, buildJourneyBattle, applyJourneyBattle, journeyPlace, badgeList, canFuseJourney, previewShrineFusion, shrineFuse, NATURE_REROLL, natureBlock, rerollNature, respawnJourney, IRONMAN, fallenList, journeyOver } from '../game/journey.js';
import { WORLD, TILE, REGIONS, HUB, BIOME_ORDER, worldFor, tileAt, biomeAt, habitatTypeAt, trainerAt, findPath, isHubTile } from '../game/world.js';
import { TYPE_INFO, TYPE_LIST } from '../data/types.js';
import { DAMAGE_TYPES } from '../data/damage.js';
import { marketCatalogue, buyMove, bagList, bagCount, canTeach, teachMove, itemCatalogue, itemList, buyItem, useItem, scrollTypes, scrollLearners, listWords, charmCatalogue, charmList, buyCharm, giveCharm, takeCharm, charmHolders, forgeList, forgeCost, forgeCharm, tutorTypes, tutorCatalogue, buyTutorMove, recallOptions, recallCost, recallMove } from '../game/market.js';
import { getCharm } from '../data/charms.js';
import { dexSeen, dexCaught, dexCounts, dexStatus, dexMorphs, dexHabitat, dexRewards, claimDexReward, dexSpeciesOf, BROKER, brokerOffers, buyHint } from '../game/dex.js';
import { speciesGenome } from '../creature/genome.js';
import { MORPHS } from '../creature/palette.js';
import { natureLabel } from '../data/natures.js';
import { HALL, hallOf, nextTierCost, buyTier, setTrophy, trophies, trophyKey, morphBlock, drawMorph } from '../game/hall.js';
import { CLADE_IDS } from '../data/clades.js';
import { openQuests, questReady, rewardText, claimQuest, abandonQuest } from '../game/quests.js';
import { openBounties, bountyCandidates, bountyPayout, bountyLevelMul, turnInBounty } from '../game/bounties.js';
import { swapChoices, wildPool, swapPrice, drawPrice, secondSlotPrice, rookeryBlock, swapPassive, wildDraw, openSecondSlot } from '../game/rookery.js';
import { TITAN_BY_BIOME, titanOf, titanLevel } from '../game/titan.js';
import { BOND, bondOf, bondOfMember, bondProgress } from '../game/bond.js';
import { SPECIES } from '../data/species.js';
import { MOVES } from '../data/moves.js';
import { ABILITY_IDS, ABILITIES } from '../data/abilities.js';
import { isCoreAbility } from '../data/elements.js';
import { teamReport } from '../game/planner.js';
import { COACH, coachCost, coachLeft, coachStats, coachBlock, coachMember, statLabel } from '../game/coach.js';
import { TOWER, TOWER_TRAINERS, challengeTower, towerRecord } from '../game/tower.js';
import { abilityName } from '../data/abilities.js';
import { getMove } from '../data/moves.js';
import { getItem } from '../data/items.js';
import { cladeName } from '../data/clades.js';
import { cladeOf, elementalOf, speciesOf } from '../creature/genome.js';
import { sfx } from '../core/sfx.js';

const MOVE_MS = 150;
const ow = {
  save: null, root: null, j: null, world: null, canvas: null, ctx: null, raf: 0, last: 0, tween: null, queue: [], held: null, keys: new Set(),
  dialog: null, fight: null, starterPick: -1, confirmReset: false, tilePx: 32, cssW: 0, cssH: 0, showReport: true, listeners: [], target: null, bob: 0,
};

function owSave() { if (!persistSave(ow.save)) toast('Could not save (storage blocked?)'); }

function owTeardown() {
  if (ow.fight) { ow.fight.destroy(); ow.fight = null; }
  if (ow.raf) { cancelAnimationFrame(ow.raf); ow.raf = 0; }
  for (const [target, type, fn] of ow.listeners) target.removeEventListener(type, fn);
  ow.listeners = [];
  if (ow.dialogUntrap) { ow.dialogUntrap(); ow.dialogUntrap = null; } // a screen change while a dialog is up must not leave the page inert
  ow.tween = null; ow.queue = []; ow.held = null; ow.keys.clear(); ow.dialog = null; ow.target = null;
}

function owListen(target, type, fn, opts) { target.addEventListener(type, fn, opts); ow.listeners.push([target, type, fn]); }

export function renderWorldScreen(root) {
  ow.root = root;
  if (!ow.save) ow.save = loadSave();
  owTeardown();
  clear(root);
  const j = ow.save.journey;
  ow.j = j;
  if (!j) return owIntroView(root);
  ow.world = worldFor(j.seed);
  if (journeyOver(j)) return owOverView(root, j);
  if (j.phase === 'starter') return owStarterView(root, j);
  if (j.encounter) return owEncounterView(root, j);
  return owMapView(root, j);
}

// ---- intro and starter ----------------------------------------------------------

function owTile(label, value) { return h('div', { class: 'tile' }, h('b', {}, String(value)), h('span', {}, label)); }

function owIntroView(root) {
  playTheme('title');
  const rerender = () => renderWorldScreen(root);
  const importInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a save code (CCSAVE1....)', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Save code' });
  root.append(
    h('div', { class: 'hero-card' },
      h('h2', {}, 'The Overworld'),
      h('p', { class: 'hint' }, `${BIOME_ORDER.length} biomes ring the Crossroads, one for each class of creature, each harder than the last: ${listWords(BIOME_ORDER.map((c) => REGIONS[c].name.toLowerCase()))}. Catch what lives there, ask trainers for a fight, take a badge from every Warden, and when you hold them all the Council Spire opens: four fights, back to back.`),
      h('div', { class: 'tiles' }, owTile('biomes', BIOME_ORDER.length), owTile('wardens', BIOME_ORDER.length), owTile('journeys', ow.save.totals.journeys), owTile('dex', `${dexCounts(ow.save).caught}/${dexCounts(ow.save).total}`)),
      h('div', { class: 'set-row ironman-row' },
        h('div', { class: 'set-label' }, h('b', {}, 'Ironman'),
          h('span', { class: 'hint' }, 'A creature that falls in battle is gone for good — no camp brings it back. The run ends when nothing is left in your party or your storage. Chosen now, and it cannot be turned off afterwards.')),
        h('div', { class: 'toolbar' },
          h('button', { class: `btn small${ow.ironman ? '' : ' on'}`, type: 'button', 'aria-pressed': ow.ironman ? 'false' : 'true', onclick: () => { ow.ironman = false; rerender(); } }, 'Off'),
          h('button', { class: `btn small${ow.ironman ? ' on' : ''}`, type: 'button', 'aria-pressed': ow.ironman ? 'true' : 'false', onclick: () => { ow.ironman = true; rerender(); } }, 'On'))),
      h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => {
        let seed = null;
        try { seed = new URLSearchParams(location.search).get('seed'); } catch { /* ignore */ }
        ow.save.journey = newJourney(seed || freshSeed(), { ironman: Boolean(ow.ironman) }); ow.starterPick = -1; owSave(); rerender();
      } }, ow.ironman ? 'Set out — Ironman' : 'Set out')),
    ...(ow.save.collection.length ? section(`Collection · ${ow.save.collection.length}`, h('p', { class: 'hint' }, 'Every species and fusion that has travelled with you. Tap one for its sheet and code.'), owCollectionGrid()) : []),
    ...section('Save',
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: () => owSlotsSheet() }, `Save slots · in slot ${activeSlot()}`),
        h('button', { class: 'btn', type: 'button', onclick: () => owSettingsSheet() }, 'Settings')),
      h('div', { class: 'toolbar' }, importInput,
        h('button', { class: 'btn', type: 'button', onclick: () => { try { ow.save = importSave(importInput.value); owSave(); toast('Save loaded'); rerender(); } catch (e) { toast(e.message); } } }, 'Import')),
      h('p', { class: 'hint' }, `Progress autosaves in this browser, in whichever of the ${SLOTS} slots is in play. Export gives you a code to move it elsewhere.`)),
  );
}

/** Everything an Ironman run has lost, newest first. Reachable from the HUD while the run is alive. */
function owFallenSheet(j) {
  const lost = fallenList(j);
  const body = h('div');
  if (!lost.length) {
    body.append(h('p', { class: 'hint' }, 'Nobody yet. In Ironman a creature that falls in battle is gone for good, and the run ends when nothing is left in your party or your storage.'));
  } else {
    body.append(h('p', { class: 'hint' }, `${lost.length} lost so far. They stay in your Collection, but they do not travel with you again.`));
    const grid = h('div', { class: 'pool' });
    for (const f of lost.slice(0, IRONMAN.fallenShown)) {
      grid.append(h('button', { class: 'pcard is-off', type: 'button', onclick: () => openSheet(f.genome, { level: f.level }) },
        h('span', { class: 'gen' }, `Lv ${f.level}`),
        creatureEl(f.genome, { size: 104, animate: false, level: f.level }),
        h('span', {}, f.name),
        h('span', { class: 'hint', style: { margin: 0 } }, f.foe ? `fell to ${f.foe}` : 'fell in battle'),
        h('span', { class: 'hint', style: { margin: 0 } }, f.at || '')));
    }
    body.append(grid);
    if (lost.length > IRONMAN.fallenShown) body.append(h('p', { class: 'hint' }, `and ${lost.length - IRONMAN.fallenShown} more.`));
  }
  owSheet('The fallen', body);
}

/** Where an Ironman run stopped. There is no way on from here but a new journey. */
function owOverView(root, j) {
  playTheme('title');
  const o = j.over || {};
  const lost = fallenList(j);
  root.append(
    h('div', { class: 'hero-card over-card' },
      h('h2', {}, 'The run is over'),
      h('p', { class: 'hint' }, `Nothing left in your party and nothing in storage. ${o.foe ? `${o.foe} took the last of them` : 'The last of them fell'} at ${o.at || 'the road'}.`),
      h('div', { class: 'tiles' },
        owTile('badges', `${o.badges || 0}/${BIOME_ORDER.length}`),
        owTile('fallen', lost.length),
        owTile('steps', (o.steps || 0).toLocaleString()),
        owTile('battles', j.stats.battles || 0)),
      h('p', { class: 'hint' }, o.champion ? 'You took the Council before it ended. That much stands.' : 'Every creature that travelled with you is still in your Collection.'),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => {
          retireJourney(ow.save); ow.save.journey = null; ow.starterPick = -1; owSave(); renderWorldScreen(root);
        } }, 'Start a new journey'))),
    ...(lost.length ? section(`The fallen · ${lost.length}`,
      h('p', { class: 'hint' }, 'In the order they were lost.'),
      h('div', { class: 'pool' }, lost.slice(0, IRONMAN.fallenShown).map((f) => h('button', { class: 'pcard is-off', type: 'button', onclick: () => openSheet(f.genome, { level: f.level }) },
        h('span', { class: 'gen' }, `Lv ${f.level}`),
        creatureEl(f.genome, { size: 104, animate: false, level: f.level }),
        h('span', {}, f.name),
        h('span', { class: 'hint', style: { margin: 0 } }, f.foe ? `fell to ${f.foe}` : 'fell in battle'))))) : []),
  );
}

function owStarterView(root, j) {
  const rerender = () => renderWorldScreen(root);
  const cards = h('div', { class: 'starters' });
  j.starters.forEach((g, i) => cards.append(h('button', { class: `pslot${ow.starterPick === i ? ' filled' : ''}`, type: 'button', onclick: () => { ow.starterPick = i; rerender(); } },
    creatureEl(g, { size: 150, animate: true }), h('b', {}, g.name), typeChips(g.types), h('span', { class: 'clade' }, cladeName(cladeOf(g))),
    h('span', { class: 'hint', style: { margin: 0 } }, `Lv ${JOURNEY.starterLevel}`))));
  const pick = j.starters[ow.starterPick];
  root.append(
    h('h2', { class: 'screen-title' }, 'Choose your companion'),
    h('p', { class: 'hint' }, 'Three wild creatures wait at the Crossroads. Pick one to walk out with; the Heather Downs south of town are the gentlest start.'),
    j.ironman ? h('p', { class: 'hint iron-note' }, h('b', {}, '⚑ Ironman. '), 'Whichever you take, if it falls it is gone. With nothing in your party and nothing in storage the run is over.') : null,
    cards,
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary fuse-btn', type: 'button', disabled: !pick, onclick: () => { chooseJourneyStarter(j, ow.starterPick); recordCollection(ow.save, j.party[0].genome); owSave(); rerender(); } }, pick ? `Set out with ${pick.name}` : 'Pick a companion'),
      pick ? h('button', { class: 'btn', type: 'button', onclick: () => openSheet(pick, { level: JOURNEY.starterLevel, nav: { label: 'Starters', index: ow.starterPick, items: j.starters.map((g) => ({ genome: g, opts: { level: JOURNEY.starterLevel } })) } }) }, 'Details') : null,
      h('button', { class: 'btn', type: 'button', onclick: () => { ow.save.journey = null; owSave(); rerender(); } }, 'Cancel')),
  );
}

// ---- map view -------------------------------------------------------------------

function owKindLabel(enc) {
  if (enc.kind === 'wild') { const el = elementalOf(enc.foes[0].genome), g = enc.foes[0].genome; return el && el.pure ? `${el.name} Elemental!` : g.morph && MORPHS[g.morph] ? `${MORPHS[g.morph].name} morph!` : enc.alpha ? 'Alpha encounter' : 'Wild encounter'; }
  return { trainer: 'Trainer battle', boss: 'Warden', council: 'The Council', tower: 'Battle Tower' }[enc.kind] || enc.kind;
}

function owReportCard(j) {
  const r = j.lastReport;
  if (!r || !ow.showReport) return null;
  const lines = [];
  for (const f of r.fallen || []) lines.push(`${f.name} fell at Lv ${f.level}. It is gone for good.`);
  if (r.steppedUp) lines.push(`${r.steppedUp} came out of storage to take its place.`);
  if (r.wiped) lines.push(`Your party was overwhelmed by ${r.foe}. You come to at the last camp, rested.`);
  else if (!r.won) lines.push(`${r.foe} got away.`);
  else {
    lines.push(`Beat ${r.foe}. +${r.xp} XP${r.shared > 1 ? ` each to the ${r.shared} that fought` : ''}${r.bench ? `, +${r.benchXp} to ${r.bench === 1 ? 'the one' : `each of the ${r.bench}`} that sat out` : ''}${r.gold ? `, +${r.gold.toLocaleString()} gold` : ''}.`);
    for (const l of r.levelUps) { lines.push(`${l.name} grew to Lv ${l.to}!`); if (stageOf(l.to) > stageOf(l.from)) lines.push(`${l.name} evolved! ${stageName(stageOf(l.to))}.`); }
    for (const l of r.learned || []) { const mv = getMove(l.move); lines.push(`${l.name} learned ${mv ? mv.name : l.move}!`); }
    if (r.captured) lines.push(`${r.captured.genome.name} joined ${r.toBox ? 'the box' : 'the party'}.`);
    if (r.badge) lines.push(`You earned the ${r.badge}!`);
    if (r.charm && getCharm(r.charm)) lines.push(`The Warden handed over a ${getCharm(r.charm).name}. It is in your Bag.`);
    for (const t of r.quests || []) lines.push(`Notice done: ${t} Claim it at the board in the Crossroads.`);
    for (const b of r.bond || []) lines.push(`${b.name} is ${b.tier.name} now. ${b.tier.line}`);
    if (r.champion) lines.push('The Council is beaten. You are the Champion of the Crossroads!');
  }
  return h('div', { class: `result-card slim${r.badge || r.champion ? ' learn' : ''}` }, lines.map((t) => h('div', {}, t)),
    h('button', { class: 'btn small', type: 'button', onclick: () => { ow.showReport = false; renderWorldScreen(ow.root); } }, 'Dismiss'));
}

function owLearnCard(j) {
  const q = (j.pendingLearns || [])[0];
  if (!q) return null;
  const m = [...j.party, ...j.box].find((x) => x.uid === q.uid);
  if (!m) { learnMove(j, q.uid, q.moveId, null); owSave(); return null; }
  const mv = getMove(q.moveId);
  const done = () => { owSave(); renderWorldScreen(ow.root); };
  const label = (id) => { const x = getMove(id); return x ? `${x.name} · ${x.type}${x.power ? ` ${x.power}` : ''}` : id; };
  return h('div', { class: 'result-card slim learn' },
    h('div', {}, h('b', {}, m.genome.name), ' wants to learn ', h('b', {}, mv.name), ` (${mv.type}${mv.power ? `, ${mv.power} power` : ''}). Replace which move?`),
    h('div', { class: 'moves' }, m.moves.map((id, i) => h('button', { class: 'move-btn', type: 'button', style: { '--chip': TYPE_INFO[getMove(id).type].color }, onclick: () => { learnMove(j, q.uid, q.moveId, i); done(); } }, h('span', { class: 'mv-name' }, getMove(id).name), h('span', { class: 'mv-meta' }, label(id))))),
    h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => { learnMove(j, q.uid, q.moveId, null); done(); } }, `Don't learn ${mv.name}`)));
}

function owHud(j) {
  const place = journeyPlace(j);
  const badges = h('div', { class: 'ow-badges', title: `${j.badges.length} of ${BIOME_ORDER.length} badges` }, badgeList(j).map((b) => h('i', { class: b.held ? 'held' : '', style: { '--b': REGIONS[b.id].accent }, title: `${b.name}${b.held ? ' ✓' : ''}` })));
  return h('div', { class: 'ow-hud' },
    h('div', { class: 'ow-place' }, h('b', {}, place.name), h('span', {}, place.level ? `wild Lv ${place.level}` : j.champion ? 'Champion' : `${j.badges.length}/${BIOME_ORDER.length} badges`)),
    badges,
    h('span', { class: 'ow-gold', title: 'Gold' }, `◆ ${(j.gold || 0).toLocaleString()}`),
    j.ironman ? h('button', { class: 'btn small iron-chip', type: 'button', title: 'Ironman: the fallen do not come back. Tap for those this run has lost.',
      onclick: () => owFallenSheet(j) }, `⚑ ${fallenList(j).length}`) : null,
    h('div', { class: 'ow-tools' },
      h('button', { class: 'btn small', type: 'button', onclick: () => owPartySheet(j) }, 'Party'),
      h('button', { class: 'btn small', type: 'button', onclick: () => owBagSheet(j) }, 'Bag'),
      h('button', { class: 'btn small', type: 'button', onclick: () => owMapSheet(j) }, 'Map'),
      h('button', { class: 'btn small', type: 'button', onclick: () => owDexSheet() }, 'Dex'),
      h('button', { class: 'btn small', type: 'button', onclick: () => owMenuSheet(j) }, 'Menu')));
}

function owPartyMini(j) {
  const open = () => owPartySheet(j);
  const row = h('div', { class: 'ow-party-mini', role: 'button', tabindex: '0', onclick: open,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } } });
  const words = [];
  for (const m of j.party) {
    const max = memberMaxHp(m);
    const frac = Math.max(0, m.hp / max);
    words.push(hpLabel(m.genome.name, Math.max(0, m.hp), max));
    row.append(h('div', { class: `mini${m.hp <= 0 ? ' fainted' : ''}` }, creatureEl(m.genome, { size: 44, animate: false, level: m.level }),
      h('div', { class: 'hpbar' }, h('i', { class: frac > 0.5 ? 'ok' : frac > 0.2 ? 'warn' : 'low', style: { width: `${frac * 100}%` } }))));
  }
  row.setAttribute('aria-label', `Party: ${words.join('; ') || 'empty'}. Open the party.`);
  return row;
}

function owMapView(root, j) {
  owTheme(j);
  const view = h('div', { class: 'ow-view' });
  const canvas = h('canvas', { class: 'ow-map', 'aria-label': 'Overworld map' });
  const dialogHost = h('div', { class: 'ow-dialog-host' });
  view.append(canvas, dialogHost);
  const pad = (dir, label, cls) => h('button', { class: `pad ${cls}`, type: 'button', 'aria-label': `Walk ${dir}`, onpointerdown: (e) => { e.preventDefault(); ow.queue = []; ow.held = dir; owStep(dir); }, onpointerup: () => { if (ow.held === dir) ow.held = null; }, onpointercancel: () => { if (ow.held === dir) ow.held = null; }, onpointerleave: () => { if (ow.held === dir) ow.held = null; } }, label);
  const dpad = h('div', { class: 'dpad' }, pad('up', '▲', 'u'), pad('left', '◀', 'l'), pad('right', '▶', 'r'), pad('down', '▼', 'd'));
  const act = h('button', { class: 'act', type: 'button', 'aria-label': 'Interact', onclick: () => owInteract() }, 'A');
  const wrap = h('div', { class: 'ow' }, owHud(j), owReportCard(j), owLearnCard(j), view, h('div', { class: 'ow-ctl' }, dpad, owPartyMini(j), act),
    h('p', { class: 'hint ow-help' }, 'Arrow keys, WASD or the pad walk; tap the ground to travel there; A talks to whoever is in front of you. Habitat patches hide wild creatures.'));
  root.append(wrap);
  ow.canvas = canvas; ow.ctx = canvas.getContext('2d'); ow.dialogHost = dialogHost;
  owSizeCanvas();
  owListen(window, 'resize', owSizeCanvas);
  owListen(window, 'keydown', owKeyDown);
  owListen(window, 'keyup', owKeyUp);
  owListen(window, 'pointerup', () => { ow.held = null; });
  owListen(canvas, 'pointerdown', owCanvasTap);
  ow.last = 0;
  ow.raf = requestAnimationFrame(owFrame);
}

function owSizeCanvas() {
  const c = ow.canvas;
  if (!c || !c.isConnected) return;
  const cssW = Math.max(240, Math.min(720, c.parentElement.clientWidth || 360));
  const innerH = window.innerHeight || 800;
  // short landscape screens (a phone on its side) give the map most of the height; the pad sits beside it
  const landscape = (window.innerWidth || 0) > innerH && innerH <= 520;
  const cssH = landscape ? Math.max(180, Math.min(460, innerH - 130)) : Math.max(240, Math.min(460, Math.round(Math.min(cssW * 0.78, innerH * 0.46))));
  ow.tilePx = cssW < 480 ? 28 : 36;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr);
  c.style.height = `${cssH}px`;
  ow.cssW = cssW; ow.cssH = cssH; ow.dpr = dpr;
}

const KEY_DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };

function owKeyDown(e) {
  if (!ow.canvas || !ow.canvas.isConnected) return;
  if (document.querySelector('.sheet')) return; // a sheet is open: its keys are its own
  const tag = e.target && e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 'Escape' && ow.dialog) { owCloseDialog(); return; }
  // a button that has the focus keeps its own Enter and Space, or the keyboard could never press one
  const onControl = e.target && e.target.closest && e.target.closest('button, a[href], [role="button"]');
  const dir = KEY_DIRS[e.key];
  if (dir) { e.preventDefault(); ow.queue = []; if (!ow.keys.has(dir)) { ow.keys.add(dir); ow.held = dir; owStep(dir); } return; }
  if (onControl) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') { if (!ow.dialog) { e.preventDefault(); owInteract(); } }
}
function owKeyUp(e) {
  const dir = KEY_DIRS[e.key];
  if (!dir) return;
  ow.keys.delete(dir);
  ow.held = ow.keys.size ? [...ow.keys][ow.keys.size - 1] : null;
}

function owCanvasTap(e) {
  if (!ow.j || ow.dialog || ow.tween) return;
  e.preventDefault();
  const rect = ow.canvas.getBoundingClientRect();
  const T = ow.tilePx;
  const px = (e.clientX - rect.left) * (ow.cssW / rect.width), py = (e.clientY - rect.top) * (ow.cssH / rect.height);
  const cam = owCamera();
  const tx = Math.floor((px + cam.x) / T), ty = Math.floor((py + cam.y) / T);
  const j = ow.j, world = ow.world;
  const t = trainerAt(world, tx, ty);
  if (t && Math.abs(tx - j.player.x) + Math.abs(ty - j.player.y) === 1) { j.player.dir = tx > j.player.x ? 'right' : tx < j.player.x ? 'left' : ty > j.player.y ? 'down' : 'up'; owTalk(t); return; }
  let goal = { x: tx, y: ty };
  if (tileAt(world, tx, ty) === TILE.board) {
    if (Math.abs(tx - j.player.x) + Math.abs(ty - j.player.y) === 1) { j.player.dir = tx > j.player.x ? 'right' : tx < j.player.x ? 'left' : ty > j.player.y ? 'down' : 'up'; owBoardSheet(j); return; }
    // walk to the square below the board (the side facing the town square) and read it from there
    goal = { x: tx, y: ty + 1 };
  }
  const path = findPath(world, j.player, goal, 90);
  if (!path) { toast('No way there'); return; }
  ow.queue = path;
  ow.target = { x: tx, y: ty };
  owNextQueued();
}

function owNextQueued() {
  if (ow.tween || ow.dialog || !ow.queue.length) { if (!ow.queue.length) ow.target = null; return; }
  const j = ow.j;
  const next = ow.queue.shift();
  const dir = next.x > j.player.x ? 'right' : next.x < j.player.x ? 'left' : next.y > j.player.y ? 'down' : 'up';
  const ok = owStep(dir);
  if (!ok) { ow.queue = []; ow.target = null; }
}

/** One step in a direction. Returns true when the player moved (a tween started). */
function owStep(dir) {
  const j = ow.j;
  if (!j || ow.tween || ow.dialog || ow.fight) return false;
  const from = { x: j.player.x, y: j.player.y };
  const r = tryMove(j, dir);
  if (!r.moved) {
    if (r.blocked === 'trainer' && r.trainer) { ow.queue = []; ow.held = null; owTalk(r.trainer); }
    return false;
  }
  ow.tween = { from, to: { x: j.player.x, y: j.player.y }, t: 0, event: r.event || null };
  return true;
}

function owAfterStep(event) {
  const j = ow.j;
  owTheme(j); // the score follows you across a border
  if (j.stats.steps % 10 === 0) owSave();
  if (!event) { if (ow.queue.length) owNextQueued(); else if (ow.held) owStep(ow.held); return; }
  ow.queue = []; ow.target = null;
  if (event.kind === 'encounter') { owSave(); sfx.cry(j.encounter.foes[0].genome); renderWorldScreen(ow.root); return; }
  if (event.kind === 'camp') { owSave(); sfx.heal(); toast(event.place.id === 'hub' ? 'Rested at the Crossroads. Party healed.' : event.quests && event.quests.length ? 'Camp reached. Party healed. A notice is done: claim it at the board.' : 'Camp reached. Party healed.'); owRefreshHud(); return; }
  if (event.kind === 'board') { owBoardSheet(j); return; }
  if (event.kind === 'bounty') { owBountySheet(j); return; }
  if (event.kind === 'rookery') { owRookerySheet(j); return; }
  if (event.kind === 'lair') { owLairDialog(event); return; }
  if (event.kind === 'spire') { owSpireDialog(event); return; }
  if (event.kind === 'shrine') { owShrineSheet(j); return; }
  if (event.kind === 'market') { owMarketSheet(j); return; }
  if (event.kind === 'storage') { owStorageSheet(j); return; }
  if (event.kind === 'tower') { owTowerSheet(j); return; }
}

function owRefreshHud() {
  const wrap = ow.root && ow.root.querySelector('.ow');
  if (!wrap) return;
  const hud = wrap.querySelector('.ow-hud'), mini = wrap.querySelector('.ow-party-mini');
  if (hud) hud.replaceWith(owHud(ow.j));
  if (mini) mini.replaceWith(owPartyMini(ow.j));
}

function owInteract() {
  const j = ow.j;
  if (!j || ow.dialog || ow.tween) return;
  const f = facing(j);
  if (f.trainer) { owTalk(f.trainer); return; }
  const world = ow.world, here = tileAt(world, j.player.x, j.player.y);
  if (here === TILE.door) { const b = biomeAt(world, j.player.x, j.player.y); owLairDialog({ biome: b.id, warden: world.wardens[b.clade], owned: j.badges.includes(b.id) }); return; }
  if (here === TILE.spireDoor) { owSpireDialog({ open: j.badges.length >= JOURNEY.badgesForSpire, champion: j.champion }); return; }
  if (here === TILE.shrine) { owShrineSheet(j); return; }
  if (here === TILE.marketDoor) { owMarketSheet(j); return; }
  if (here === TILE.storageDoor) { owStorageSheet(j); return; }
  if (here === TILE.towerDoor) { owTowerSheet(j); return; }
  if (here === TILE.bountyDoor) { owBountySheet(j); return; }
  if (here === TILE.rookeryDoor) { owRookerySheet(j); return; }
  if (here === TILE.camp) { owCampSheet(j); return; }
  if (tileAt(world, f.x, f.y) === TILE.board) { owBoardSheet(j); return; }
  const ht = habitatTypeAt(world, f.x, f.y);
  if (tileAt(world, f.x, f.y) === TILE.habitat && ht) { toast(`${ht}-type creatures live in this ${biomeAt(world, f.x, f.y).name.toLowerCase()} patch.`); return; }
  toast('Nothing here.');
}

// ---- dialogs -------------------------------------------------------------------

function owCloseDialog() { if (ow.dialogUntrap) { ow.dialogUntrap(); ow.dialogUntrap = null; } if (ow.dialogHost) clear(ow.dialogHost); ow.dialog = null; }

function owShowDialog(...content) {
  owCloseDialog();
  ow.dialog = true;
  ow.held = null; ow.queue = [];
  const box = h('div', { class: 'ow-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Message', tabindex: '-1' }, ...content);
  ow.dialogHost.append(box);
  // the map stops listening while this is up, so the dialog takes the keyboard: the cursor goes to its first
  // answer instead of staying behind on the map, and Tab stays among the answers
  ow.dialogUntrap = trapFocus([box], { onEscape: owCloseDialog });
}

function owTalk(t) {
  const j = ow.j;
  const info = talkTo(j, t.id);
  if (!info) return;
  const lead = t.team[0];
  const levels = info.rematch ? rematchTeam(j, t).map((m) => m.level) : t.team.map((m) => m.level);
  const teamLine = `${t.team.length} creature${t.team.length > 1 ? 's' : ''} · Lv ${Math.min(...levels)}–${Math.max(...levels)}`
    + (t.personality ? ` · ${t.personality}: ${t.tag}` : '') + (info.rematch ? ' · rematch, a quarter of the gold' : '');
  owShowDialog(
    h('div', { class: 'who' }, creatureEl(lead.genome, { size: 64, animate: false, level: lead.level, facing: 'left' })),
    h('div', { class: 'txt' }, h('b', {}, t.name), info.text, h('span', { class: 'hint', style: { margin: 0, display: 'block' } }, teamLine)),
    h('div', { class: 'row' },
      info.canFight ? h('button', { class: 'btn primary', type: 'button', onclick: () => { acceptChallenge(j, t.id); owSave(); owCloseDialog(); renderWorldScreen(ow.root); } }, 'Fight!') : null,
      !info.canFight && !info.beaten ? h('span', { class: 'hint', style: { margin: 0 } }, 'Nobody in your party can fight.') : null,
      h('button', { class: 'btn', type: 'button', onclick: owCloseDialog }, info.beaten && !info.canFight ? 'OK' : 'Not now')));
}

function owLairDialog(ev) {
  const j = ow.j, wd = ev.warden, region = REGIONS[ev.biome];
  const titan = ev.titan && TITAN_BY_BIOME[ev.biome] ? titanOf(j, ev.biome) : null;
  owShowDialog(
    h('div', { class: 'who' }, creatureEl(wd.team[0].genome, { size: 64, animate: false, level: wd.team[0].level, facing: 'left' })),
    h('div', { class: 'txt' }, h('b', {}, `${wd.name}, ${wd.title}`), ev.owned ? `You already hold the ${region.badge}. A rematch is always on.` : wd.line,
      h('span', { class: 'hint', style: { margin: 0, display: 'block' } }, `${wd.team.length} creatures · around Lv ${wd.level}`),
      ev.elder ? h('span', { class: 'hint', style: { margin: '6px 0 0', display: 'block' } }, `Something old stirs deeper in the ${region.name.toLowerCase()}. It will show itself to a champion once.`) : null,
      titan ? h('span', { class: 'hint', style: { margin: '6px 0 0', display: 'block' } }, `${titan.entry.name}, ${titan.entry.title}, has not been fought this journey. Around Lv ${titanLevel(ev.biome)}, and it brings the ${region.name.toLowerCase()} with it.`) : null),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', type: 'button', disabled: !canFight(j), onclick: () => { challengeWarden(j, ev.biome); owSave(); owCloseDialog(); renderWorldScreen(ow.root); } }, canFight(j) ? (ev.owned ? 'Rematch' : 'Challenge') : 'Party down'),
      ev.elder ? h('button', { class: 'btn', type: 'button', disabled: !canFight(j), onclick: () => {
        if (!seekElder(j, ev.biome)) { toast('Not now.'); return; }
        owSave(); owCloseDialog(); renderWorldScreen(ow.root);
      } }, 'Seek the Elder') : null,
      titan ? h('button', { class: 'btn', type: 'button', disabled: !canFight(j), onclick: () => {
        if (!challengeTitan(j, ev.biome)) { toast('Not now.'); return; }
        owSave(); owCloseDialog(); renderWorldScreen(ow.root);
      } }, `Face ${titan.entry.name}`) : null,
      h('button', { class: 'btn', type: 'button', onclick: owCloseDialog }, 'Leave')));
}

function owSpireDialog(ev) {
  const j = ow.j;
  const council = ow.world.council;
  const names = council.map((c) => c.name).join(', ');
  if (!ev.open) {
    owShowDialog(h('div', { class: 'txt' }, h('b', {}, 'The Council Spire'), `The doors need ${JOURNEY.badgesForSpire} badges. You hold ${j.badges.length}.`), h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: owCloseDialog }, 'OK')));
    return;
  }
  const today = ev.champion ? trialToday(j) : null;
  owShowDialog(
    h('div', { class: 'txt' }, h('b', {}, ev.champion ? 'The Council Spire · Champion' : 'The Council Spire'),
      ev.champion ? 'You have beaten them once. The Council will fight you again, all four in a row.' : `Four fights, back to back, with only a short rest between: ${names}. Lose one and you start over.`,
      h('span', { class: 'hint', style: { margin: 0, display: 'block' } }, `Levels ${council[0].level} to ${council[council.length - 1].level}`),
      today ? h('span', { class: 'hint', style: { margin: '6px 0 0', display: 'block' } },
        h('b', {}, `Trial of the Day · ${today.trial.name}. `), today.trial.text,
        ` Three fights at Lv ${today.trial.level}. `,
        today.state.cleared ? 'Cleared today. Another comes tomorrow.' : today.block ? today.block : 'Your party may enter.') : null),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', type: 'button', onclick: () => { const r = enterSpire(j); if (!r.ok) { toast(r.reason); return; } owSave(); owCloseDialog(); renderWorldScreen(ow.root); } }, ev.champion ? 'Rematch' : 'Enter'),
      today ? h('button', { class: `btn${today.canEnter ? ' primary' : ''}`, type: 'button', disabled: !today.canEnter, title: today.block || '', onclick: () => {
        const r = startTrial(j);
        if (!r.ok) { toast(r.reason); return; }
        owSave(); owCloseDialog(); renderWorldScreen(ow.root);
      } }, today.state.cleared ? 'Trial cleared' : 'Trial of the Day') : null,
      h('button', { class: 'btn', type: 'button', onclick: owCloseDialog }, 'Not yet')));
}

// ---- encounter card and fights ------------------------------------------------------

/** The theme for wherever the player is standing: one per region, and the Crossroads has its own. */
function owTheme(j) {
  if (!ow.world || !j || !j.player) return;
  const biome = biomeAt(ow.world, j.player.x, j.player.y);
  playTheme(isHubTile(ow.world, j.player.x, j.player.y) ? 'map:crossroads' : `map:${biome ? biome.clade : 'crossroads'}`);
}

const BOSS_KINDS = new Set(['boss', 'council', 'titan', 'elder', 'trial']);

function owEncounterView(root, j) {
  const enc = j.encounter;
  let fresh = false;
  for (const f of enc.foes) if (dexSeen(ow.save, f.genome)) fresh = true; // every foe you face is a species seen
  if (fresh) owSave();
  const kind = owKindLabel(enc);
  playTheme(BOSS_KINDS.has(enc.kind) || enc.alpha ? 'boss' : 'battle');
  const elem = enc.kind === 'wild' ? elementalOf(enc.foes[0].genome) : null;
  const foes = h('div', { class: `foes${enc.foes.length <= 2 ? ' few' : ''}` }, enc.foes.map((f) => h('div', { class: 'foe-card' },
    creatureEl(f.genome, { size: enc.foes.length > 4 ? 70 : enc.foes.length > 2 ? 78 : 120, facing: 'left', animate: enc.foes.length <= 2, level: f.level }),
    h('span', {}, enc.kind === 'wild' && f.genome.species ? dexMark(dexStatus(ow.save, f.genome.species)) : null, `${f.genome.name} · Lv ${f.level}`, stageBadge(f.level)))));
  const caughtBefore = enc.kind === 'wild' && enc.foes[0].genome.species && dexStatus(ow.save, enc.foes[0].genome.species) === 'caught';
  const back = enc.kind === 'wild' ? 'Run' : enc.kind === 'council' ? 'Retreat (forfeits the run)' : enc.kind === 'tower' ? 'Back down' : 'Back out';
  const top = Math.max(...j.party.map((m) => m.level)), capMod = enc.kind === 'wild' ? Math.round((levelCaptureMul(top, enc.foes[0].level) - 1) * 100) : 0;
  const capNote = (capMod === 0 ? '' : ` Your strongest is Lv ${top} to its Lv ${enc.foes[0].level}: catch odds ${capMod > 0 ? '+' : ''}${capMod}%.`) + (enc.kind === 'wild' ? (caughtBefore ? ' You have caught this species before.' : ' A species you have not caught yet.') : '');
  const intro = enc.kind === 'wild' ? (enc.alpha ? `An alpha, well above the local level. Worth more, and harder to catch.${capNote}` : `A wild creature from the ${enc.type ? `${enc.type} ` : ''}patch. Weaken it to capture it.${capNote}`)
    : enc.kind === 'council' ? `${enc.line} Fight ${enc.stage + 1} of ${JOURNEY.councilFights}.` : enc.kind === 'boss' ? `Win for the ${enc.badge}.`
    : enc.kind === 'tower' ? `${enc.line} Six on six at level ${enc.level}. A win pays experience and gold${towerRecord(j, enc.floor, enc.level) ? ', a quarter of the gold now this floor is beaten at this level' : ''}.` : 'A friendly match. No captures.';
  root.append(
    h('div', { class: 'ow' }, owHud(j),
      h('div', { class: `encounter ${enc.kind === 'boss' || enc.kind === 'council' ? 'boss' : enc.kind}${elem && elem.pure ? ` elemental elem-${elem.id}` : ''}`, role: 'group', 'aria-label': `${kind}: ${enc.name}`, tabindex: '-1' },
        h('div', { class: 'enc-head' }, h('span', { class: `kind-badge ${enc.kind === 'council' ? 'boss' : enc.kind}${elem && elem.pure ? ' elemental' : ''}` }, kind), h('b', {}, enc.kind === 'tower' ? `${enc.name} · Lv ${enc.level}` : enc.name)),
        foes,
        h('p', { class: 'hint' }, intro),
        h('div', { class: 'row wrap' },
          h('button', { class: 'btn primary fuse-btn', type: 'button', disabled: !canFight(j), onclick: () => owStartFight() }, canFight(j) ? 'Fight' : 'Nobody can fight'),
          h('button', { class: 'btn', type: 'button', onclick: () => { fleeEncounter(j); owSave(); renderWorldScreen(root); } }, back))),
      owPartyMini(j)),
  );
}

function owStartFight() {
  const j = ow.j;
  let built;
  try { built = buildJourneyBattle(j); } catch (e) { toast(e.message); return; }
  owSave();
  owTeardown();
  clear(ow.root);
  const enc = j.encounter;
  const host = h('div');
  ow.root.append(h('div', { class: 'floor-head compact' }, h('b', {}, `${enc.name}${enc.kind === 'council' ? ` · fight ${enc.stage + 1} of ${JOURNEY.councilFights}` : ''}`)), host);
  ow.fight = mountFight(host, {
    state: built.state, events: built.events, names: ['You', enc.name], wild: enc.capturable, speed: fightSpeed(),
    dexStatus: (g) => (g && g.species ? dexStatus(ow.save, g.species) : null),
    onQuit: enc.kind === 'wild' ? (state) => { fleeEncounter(j, state); owSave(); renderWorldScreen(ow.root); } : null,
    onEnd: (state) => {
      const { report } = applyJourneyBattle(j, state);
      if (report.captured) recordCollection(ow.save, report.captured.genome);
      if (report.champion) { sfx.win(); ow.save.totals.champions++; }
      ow.showReport = true;
      owSave();
      return { xp: report.xpGains || [] };
    },
    resultButtons: [{ label: j.encounter && ((j.encounter.kind === 'council' && j.gauntlet) || (j.encounter.kind === 'trial' && j.trial)) ? 'Next fight' : 'Continue', primary: true, onclick: () => renderWorldScreen(ow.root) }],
  });
}

// ---- sheets: party, map, menu, shrine -----------------------------------------------

function owSheet(title, body, onClose) {
  let untrap = () => {};
  const close = () => { untrap(); backdrop.remove(); sheet.remove(); if (onClose) onClose(); };
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: close });
  const sheet = h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', {}, title), h('button', { class: 'btn close', type: 'button', onclick: close, 'aria-label': 'Close' }, '✕')),
    body);
  document.body.append(backdrop, sheet);
  ow.held = null; ow.queue = []; // a sheet takes the keys: whatever was held down does not carry on walking underneath it
  untrap = trapFocus([sheet, backdrop], { onEscape: close });
  return { close, sheet };
}

/** Re-render a sheet's body without losing the reader's place: clearing the body collapses the sheet and would snap it to the top. */
function owKeepScroll(container, draw) {
  const sheet = container.closest ? container.closest('.sheet') : null;
  const top = sheet ? sheet.scrollTop : 0;
  draw();
  if (sheet) sheet.scrollTop = top;
}

/** How the box can be ordered. Recent is the order they were caught in, which is what the list always was. */
const STORE_SORTS = [
  { id: 'recent', name: 'Newest first' },
  { id: 'oldest', name: 'Oldest first' },
  { id: 'level', name: 'Level' },
  { id: 'name', name: 'Name' },
  { id: 'class', name: 'Class' },
  { id: 'total', name: 'Stat total' },
];

/** The stored creatures a search and a sort leave you with. */
function storeFilter(box, store) {
  const q = (store.q || '').trim().toLowerCase();
  let out = box.slice();
  if (q) {
    out = out.filter((m) => {
      const g = m.genome;
      const hay = [g.name, g.species || '', g.clade || '', ...(g.types || []).filter(Boolean), abilityName(g.ability), abilityName(g.ability2)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  const by = {
    recent: (a, b) => box.indexOf(b) - box.indexOf(a),
    oldest: (a, b) => box.indexOf(a) - box.indexOf(b),
    level: (a, b) => b.level - a.level || a.genome.name.localeCompare(b.genome.name),
    name: (a, b) => a.genome.name.localeCompare(b.genome.name),
    class: (a, b) => String(a.genome.clade).localeCompare(String(b.genome.clade)) || a.genome.name.localeCompare(b.genome.name),
    total: (a, b) => (b.genome.bst || 0) - (a.genome.bst || 0),
  };
  return out.sort(by[store.sort] || by.recent);
}

/** Where a creature stands with you, once it stands anywhere at all. */
function owBondChip(m) {
  const points = bondOf(m);
  if (!points) return null;
  const { tier, next, need } = bondProgress(m);
  const title = `${tier.name}: ${tier.line}${next ? ` · ${need} more to ${next.name}` : ''}`;
  return h('span', { class: `chip bond-chip t${tier.tier}`, title }, `♥ ${tier.name}`);
}

function owMemberRow(j, m, actions) {
  const max = memberMaxHp(m), frac = m.hp / max, xp = xpProgress(m);
  return h('div', { class: `party-row static${m.hp <= 0 ? ' fainted' : ''}` },
    creatureEl(m.genome, { size: 64, animate: false, level: m.level }),
    h('div', { class: 'party-info' },
      h('div', {}, h('b', {}, m.genome.name), ' ', h('span', { class: 'lvl' }, `Lv ${m.level}`), stageBadge(m.level), ' ',
        m.status ? h('span', { class: `status st-${m.status}` }, STATUS_INFO[m.status].short) : null, m.hp <= 0 ? h('span', { class: 'status' }, 'FAINTED') : null, m.locked ? h('span', { class: 'status lock', title: 'Cannot be released or fused' }, 'LOCKED') : null),
      h('div', { class: 'hpbar' }, h('i', { class: frac > 0.5 ? 'ok' : frac > 0.2 ? 'warn' : 'low', style: { width: `${Math.max(0, frac * 100)}%` } })),
      h('div', { class: 'xpline' }, xpRow(xp), h('span', { class: 'xpnum' }, xp.next > xp.prev ? `${xp.cur - xp.prev} / ${xp.next - xp.prev}` : 'MAX')),
      h('div', { class: 'move-chips' }, (m.moves || []).map((id) => { const mv = getMove(id); return mv ? h('span', { class: 'chip', style: { '--chip': TYPE_INFO[mv.type].color } }, mv.name) : null; })),
      h('div', { class: 'row-actions' }, h('span', { class: 'hint', style: { margin: 0 } }, `${m.hp} / ${max} · ${abilityName(m.genome.ability)}`), owBondChip(m), owHeldChip(m), ...actions)));
}

/** '◈ Ember Charm' for a member holding a charm, or nothing. */
function owHeldChip(m) {
  const c = getCharm(m.held);
  return c ? h('span', { class: 'chip held-chip', style: { '--chip': c.color }, title: c.desc }, `◈ ${c.name}`) : null;
}

/** Release: tap once to arm (the button changes in place), again within a few seconds to let the creature go. The party keeps at least one. */
function owReleaseBtn(j, m, render) {
  const block = owReleaseBlock(j, m);
  const armed = () => ow.confirmRelease === m.uid;
  const paint = () => { btn.textContent = armed() ? 'Really release?' : 'Release'; btn.classList.toggle('danger', armed()); };
  const btn = h('button', { class: 'btn small', type: 'button', disabled: Boolean(block), title: block, onclick: () => {
    if (!armed()) {
      ow.confirmRelease = m.uid;
      paint();
      toast(`Tap again to release ${m.genome.name} for good`);
      setTimeout(() => { if (armed()) { ow.confirmRelease = null; if (btn.isConnected) paint(); } }, 4000);
      return;
    }
    ow.confirmRelease = null;
    const r = releaseMember(j, m.uid);
    if (!r.ok) { toast(r.reason); paint(); return; }
    owSave();
    toast(`${m.genome.name} was released. It stays in your Collection.`);
    render();
  } }, 'Release');
  paint();
  return btn;
}

/** Why a member cannot be released right now, or '' when it can. */
function owReleaseBlock(j, m) {
  if (m.locked) return `${m.genome.name} is locked. Unlock it first.`;
  if (j.party.includes(m) && j.party.length <= 1) return 'Keep at least one creature with you.';
  return '';
}

/** Everything the Info sheet needs for a journey member: level, moves, and the Lock, Rename and Release actions. */
function owInfoOpts(j, m, render) {
  return {
    level: m.level,
    moves: m.moves,
    lock: {
      locked: () => Boolean(m.locked),
      onToggle: () => {
        const r = setLocked(j, m.uid, !m.locked);
        if (!r.ok) { toast(r.reason); return r; }
        owSave(); render();
        toast(r.locked ? `${m.genome.name} is locked: it cannot be released or fused.` : `${m.genome.name} is unlocked.`);
        return r;
      },
    },
    held: {
      id: () => m.held,
      onTake: () => {
        const r = takeCharm(j, m.uid);
        if (!r.ok) { toast(r.reason); return r; }
        owSave(); render();
        toast(`Took the ${getCharm(r.charmId).name} back into the Bag.`);
        return r;
      },
    },
    rename: {
      onRename: (name) => {
        const r = renameMember(j, m.uid, name);
        if (!r.ok) { toast(r.reason); return r; }
        owSave(); render();
        toast(`Renamed to ${r.name}.`);
        return r;
      },
    },
    release: {
      can: () => !owReleaseBlock(j, m),
      reason: () => owReleaseBlock(j, m),
      onRelease: () => {
        const r = releaseMember(j, m.uid);
        if (!r.ok) { toast(r.reason); return false; }
        ow.confirmRelease = null;
        owSave();
        toast(`${m.genome.name} was released. It stays in your Collection.`);
        render();
        return true;
      },
    },
  };
}

/** The list an Info sheet cycles through: every member given, each with its own Lock, Rename and Release actions. */
function owMemberNav(j, list, m, render, label) {
  return { label, index: list.indexOf(m), items: list.map((mm) => ({ genome: mm.genome, opts: owInfoOpts(j, mm, render) })) };
}

function owPartySheet(j) {
  const body = h('div');
  const draw = () => {
    clear(body);
    const btn = (label, onclick, disabled) => h('button', { class: 'btn small', type: 'button', disabled, onclick }, label);
    const partyList = h('div', { class: 'party-list' });
    j.party.forEach((m, i) => partyList.append(owMemberRow(j, m, [
      btn('Lead', () => { setLead(j, m.uid); owSave(); render(); }, i === 0),
      btn('Info', () => openSheet(m.genome, { ...owInfoOpts(j, m, render), nav: owMemberNav(j, j.party, m, render, 'Party') })),
      owReleaseBtn(j, m, render),
    ])));
    appendChildren(body, [
      ...section(`Party · ${j.party.length}/${JOURNEY.partyMax}`, h('p', { class: 'hint' }, `The lead goes out first. Camps heal everyone; a wipe sends you back to the last one you rested at. ${j.box.length ? `${j.box.length} in storage` : 'Storage is empty'}; deposit and withdraw at the Creature Storage in the Crossroads. Release lets a creature go for good; it stays in your Collection.`), partyList),
    ]);
    body.append(h('p', { class: 'hint' }, `${j.stats.steps} steps · ${j.stats.battles} battles · ${j.stats.captures} caught · ${j.stats.trainers} trainers · ${j.stats.bosses} wardens · ${j.stats.fusions} fusions · ${j.stats.quests || 0} notices · ${j.stats.bounties || 0} bounties`));
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Party', body, () => owRefreshHud());
}

function owMapSheet(j) {
  const world = ow.world, S = 2;
  const c = h('canvas', { class: 'ow-minimap', width: world.w * S, height: world.h * S, 'aria-label': 'World map' });
  const ctx = c.getContext('2d');
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const t = world.tiles[y * world.w + x], r = REGIONS[world.biomes[world.bio[y * world.w + x]].clade];
    ctx.fillStyle = t === TILE.water ? r.water : t === TILE.wall ? r.wallColor : t === TILE.path || t === TILE.door ? r.path : t === TILE.hub || t === TILE.shrine || t === TILE.spireDoor ? HUB.paving : t === TILE.habitat ? r.habitat : t === TILE.lair || t === TILE.spire || t === TILE.tower || t === TILE.bounty || t === TILE.rookery ? '#1a1a22' : r.ground;
    ctx.fillRect(x * S, y * S, S, S);
  }
  const dot = (p, color, rad) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x * S + S / 2, p.y * S + S / 2, rad, 0, Math.PI * 2); ctx.fill(); };
  for (const b of world.biomes) { dot(b.camp, '#ffffff', 4); dot(b.lair, j.badges.includes(b.id) ? '#ffd166' : '#ff5a5a', 5); }
  dot(world.spireDoor, '#b98cff', 5);
  dot(world.marketDoor, '#7fe38a', 5);
  dot(world.storageDoor, '#4fc0a0', 5);
  dot(world.towerDoor, '#ff9f43', 5);
  dot(world.board, '#e0c86f', 4);
  dot(world.bountyDoor, '#f26aa3', 5);
  for (const t of world.trainers) dot({ x: t.x, y: t.y }, j.beaten[t.id] ? '#8f96a8' : '#4f8ef7', 2.5);
  dot(j.player, '#f5c518', 6); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(j.player.x * S + S / 2, j.player.y * S + S / 2, 6, 0, Math.PI * 2); ctx.stroke();
  const legend = h('div', { class: 'ow-legend' }, world.biomes.map((b) => h('div', {}, h('i', { style: { background: REGIONS[b.clade].ground } }), `${b.name} · to Lv ${b.level}${j.badges.includes(b.id) ? ' · badge ✓' : ''}`)));
  owSheet('World map', h('div', {}, c, legend, h('p', { class: 'hint', style: { marginTop: '8px' } }, 'You are the gold dot. White: camps. Red: Wardens (gold once beaten). Blue: trainers. Purple: the Council Spire. Green: the Market. Teal: Creature Storage. Orange: the Battle Tower. Straw: the notice board. Pink: the Bounty Office.')));
}

/** Sound, speed, type size, motion and contrast. Kept apart from the save, so they hold across slots. */
function owSettingsSheet() {
  const body = h('div');
  const draw = () => {
    clear(body);
    const now = getSettings();
    const choice = (label, hint, key, table) => h('div', { class: 'set-row' },
      h('div', { class: 'set-label' }, h('b', {}, label), h('span', { class: 'hint' }, hint)),
      h('div', { class: 'toolbar' }, Object.values(table).map((o) => h('button', { class: `btn small${now[key] === o.id ? ' on' : ''}`, type: 'button', onclick: () => { updateSetting(key, o.id); render(); } }, o.name))));
    appendChildren(body, [
      h('div', { class: 'set-row' },
        h('div', { class: 'set-label' }, h('b', {}, 'Sound'), h('span', { class: 'hint' }, 'Cries, hits and menu taps, all made on the fly. Nothing is downloaded.')),
        h('div', { class: 'toolbar' },
          h('button', { class: `btn small${now.sound ? ' on' : ''}`, type: 'button', onclick: () => { updateSetting('sound', true); render(); } }, 'On'),
          h('button', { class: `btn small${now.sound ? '' : ' on'}`, type: 'button', onclick: () => { updateSetting('sound', false); render(); } }, 'Off'))),
      choice('Music', 'A score worked out as it plays: a theme for every region, one for a fight and one for something bigger.', 'music', MUSIC_LEVELS),
      choice('Battle speed', 'How long the fight view waits between lines. The Speed button in a fight sets this too.', 'speed', SPEEDS),
      choice('Text size', 'The whole layout is sized off this, so everything grows together.', 'text', TEXT_SIZES),
      choice('Motion', 'Reduced stops the sprites lunging, shaking and sliding.', 'motion', MOTIONS),
      choice('Contrast', 'High firms up every border and drops the see-through panels.', 'contrast', CONTRASTS),
      choice('Look', 'Field guide is a naturalist\u2019s plate book on a dark ground: a book serif, drawn rules, and type colour on swatches. Slate is the interface the game shipped with.', 'theme', THEMES),
      h('p', { class: 'hint' }, 'Settings belong to this browser rather than to a save, so all three slots play the same way.'),
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Settings', body);
}

/** Three journeys, side by side: switch between them, or clear one out. */
function owSlotsSheet() {
  const body = h('div');
  let confirmWipe = 0;
  const draw = () => {
    clear(body);
    const here = activeSlot();
    const list = h('div', { class: 'shop-list' });
    for (const s of slotSummaries()) {
      const j = s.journey;
      const line = s.empty ? 'Empty'
        : j ? `${j.champion ? 'Champion · ' : ''}${j.badges}/${BIOME_ORDER.length} badges · ${j.party} in the party${j.level ? ` · Lv ${j.level}` : ''} · ${j.steps.toLocaleString()} steps · ◆ ${j.gold.toLocaleString()}`
          : `No journey in progress · ${s.journeys} finished · ${s.caught} species caught`;
      list.append(h('div', { class: `shop-row${s.slot === here ? ' on' : ''}` },
        h('div', { class: 'shop-info' }, h('div', {}, h('b', {}, `Slot ${s.slot}${s.slot === here ? ' · in play' : ''}`), h('div', { class: 'shop-meta' }, h('span', {}, line)))),
        h('div', { class: 'toolbar' },
          s.slot === here ? null : h('button', { class: 'btn small primary', type: 'button', onclick: () => switchTo(s.slot) }, 'Play'),
          s.empty ? null : h('button', { class: `btn small${confirmWipe === s.slot ? ' danger' : ''}`, type: 'button', onclick: () => {
            if (confirmWipe !== s.slot) { confirmWipe = s.slot; toast(`Tap again to erase slot ${s.slot}`); render(); setTimeout(() => { confirmWipe = 0; if (body.isConnected) render(); }, 4000); return; }
            clearSlot(s.slot);
            confirmWipe = 0;
            if (s.slot === here) { ow.save = loadSave(); toast(`Slot ${s.slot} erased`); sheetRef.close(); renderWorldScreen(ow.root); return; }
            toast(`Slot ${s.slot} erased`);
            render();
          } }, confirmWipe === s.slot ? 'Really erase?' : 'Erase'))));
    }
    const importInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a save code (CCSAVE1....)', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Save code' });
    appendChildren(body, [
      h('p', { class: 'hint' }, `${SLOTS} journeys can be kept at once. Switching saves what is in play first; the slot you pick is remembered next time the game opens.`),
      list,
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: async () => toast((await copyText(exportSave(ow.save))) ? 'Save code copied' : 'Copy failed') }, 'Export this slot')),
      h('div', { class: 'toolbar' }, importInput,
        h('button', { class: 'btn', type: 'button', onclick: () => {
          try { ow.save = importSave(importInput.value); owSave(); toast(`Loaded into slot ${activeSlot()}`); sheetRef.close(); renderWorldScreen(ow.root); } catch (e) { toast(e.message); }
        } }, 'Import here')),
    ]);
  };
  const switchTo = (n) => {
    persistSlot(ow.save, activeSlot());
    useSlot(n);
    ow.save = loadSave();
    sheetRef.close();
    toast(`Now playing slot ${n}`);
    renderWorldScreen(ow.root);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  const sheetRef = owSheet('Save slots', body);
}

function owMenuSheet(j) {
  const body = h('div');
  const draw = () => {
    clear(body);
    const importInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a save code (CCSAVE1....)', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Save code' });
    appendChildren(body, [
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn small', type: 'button', onclick: () => { sheetRef.close(); owSettingsSheet(); } }, 'Settings'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { sheetRef.close(); owSlotsSheet(); } }, `Slots · ${activeSlot()}`),
        h('button', { class: 'btn small', type: 'button', onclick: () => { respawnJourney(j); owSave(); toast('Back at the last camp, rested.'); sheetRef.close(); renderWorldScreen(ow.root); } }, 'Return to camp'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { sheetRef.close(); owCollectionSheet(); } }, `Collection · ${ow.save.collection.length}`),
        h('button', { class: 'btn small', type: 'button', onclick: () => { sheetRef.close(); owDexSheet(); } }, `Dex · ${dexCounts(ow.save).caught}/${dexCounts(ow.save).total}`)),
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: async () => toast((await copyText(exportSave(ow.save))) ? 'Save code copied' : 'Copy failed') }, 'Export'),
        h('button', { class: `btn${ow.confirmReset ? ' danger' : ''}`, type: 'button', onclick: () => {
          if (!ow.confirmReset) { ow.confirmReset = true; toast('Tap again to abandon this journey'); render(); setTimeout(() => { ow.confirmReset = false; if (body.isConnected) render(); }, 4000); return; }
          retireJourney(ow.save); ow.confirmReset = false; owSave(); toast('Journey abandoned'); sheetRef.close(); renderWorldScreen(ow.root);
        } }, ow.confirmReset ? 'Really abandon?' : 'Abandon journey')),
      h('div', { class: 'toolbar' }, importInput, h('button', { class: 'btn', type: 'button', onclick: () => { try { ow.save = importSave(importInput.value); owSave(); toast('Save loaded'); sheetRef.close(); renderWorldScreen(ow.root); } catch (e) { toast(e.message); } } }, 'Import')),
      h('p', { class: 'hint' }, 'Abandoning sends your creatures to the collection.'),
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  const sheetRef = owSheet('Menu', body);
}

/** A potion's name, effect and price or quantity. */
function owItemInfo(item, tag) {
  return h('div', { class: 'shop-info item-info' }, h('div', { class: 'item-icon small', style: { '--chip': item.color } }, '+'),
    h('div', {}, h('b', {}, item.name),
      h('div', { class: 'shop-meta' }, h('span', {}, item.desc), tag ? h('span', { class: 'shop-tag' }, tag) : null)));
}

/** The Bag: potions to use on the party, and move scrolls, each taught once to any creature. */
function owBagSheet(j) {
  const body = h('div');
  let teaching = null, using = null, giving = null;
  const draw = () => {
    clear(body);
    const scrolls = bagList(j), potions = itemList(j), charms = charmList(j);
    if (teaching) { body.append(owTeachPanel(j, teaching, () => { teaching = null; render(); })); return; }
    if (using) { body.append(owUsePanel(j, using, () => { using = null; render(); })); return; }
    if (giving) { body.append(owGivePanel(j, giving, () => { giving = null; render(); })); return; }
    body.append(h('p', { class: 'hint' }, `◆ ${(j.gold || 0).toLocaleString()} gold.${scrolls.length || potions.length || charms.length ? '' : ' The bag is empty. The Market at the Crossroads sells potions, charms and move scrolls.'}`));
    if (charms.length) {
      const list = h('div', { class: 'shop-list' });
      for (const { charm, qty } of charms) list.append(h('div', { class: 'shop-row' }, owCharmInfo(charm, `×${qty}`), h('button', { class: 'btn small primary', type: 'button', onclick: () => { giving = charm.id; render(); } }, 'Give')));
      body.append(...section('Charms', h('p', { class: 'hint' }, 'A creature holds one charm and carries it into every fight. Give swaps it for whatever the creature held; Take it back from its Info sheet.'), list));
    }
    const held = j.party.filter((m) => getCharm(m.held));
    if (held.length) body.append(h('p', { class: 'hint' }, `Held now: ${held.map((m) => `${m.genome.name} (${getCharm(m.held).name})`).join(', ')}.`));
    if (potions.length) {
      const list = h('div', { class: 'shop-list' });
      for (const { item, qty } of potions) list.append(h('div', { class: 'shop-row' }, owItemInfo(item, `×${qty}`), h('button', { class: 'btn small primary', type: 'button', onclick: () => { using = item.id; render(); } }, 'Use')));
      body.append(...section('Potions', h('p', { class: 'hint' }, 'Potions work on the party in and out of battle; in battle a potion takes your turn. They cannot revive a fainted creature.'), list));
    }
    if (scrolls.length) {
      const list = h('div', { class: 'shop-list' });
      for (const { move, qty } of scrolls) list.append(h('div', { class: 'shop-row' }, moveInfoEl(move, `×${qty}`), h('button', { class: 'btn small primary', type: 'button', onclick: () => { teaching = { moveId: move.id, uid: null }; render(); } }, 'Teach')));
      body.append(...section('Move scrolls', h('p', { class: 'hint' }, 'A scroll teaches its move to one creature and is used up. Any creature can learn any move.'), list));
    }
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Bag', body, () => owRefreshHud());
}

/** A charm's name, effect and price or quantity. */
function owCharmInfo(charm, tag) {
  return h('div', { class: 'shop-info item-info' }, h('div', { class: 'item-icon small charm-icon', style: { '--chip': charm.color } }, '◈'),
    h('div', {}, h('b', {}, charm.name),
      h('div', { class: 'shop-meta' }, h('span', {}, charm.desc), tag ? h('span', { class: 'shop-tag' }, tag) : null)));
}

/** Pick the party member a charm is given to; it swaps with whatever that creature held. */
function owGivePanel(j, charmId, back) {
  const charm = getCharm(charmId);
  const panel = h('div');
  const draw = () => {
    clear(panel);
    const qty = bagCount(j, charmId);
    panel.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'btn small', type: 'button', onclick: back }, '‹ Bag'), h('span', { class: 'hint', style: { margin: 0 } }, `Give ${charm.name} (×${qty}) to…`)));
    const list = h('div', { class: 'party-list' });
    for (const m of j.party) {
      const same = m.held === charmId;
      list.append(owMemberRow(j, m, [h('button', { class: 'btn small primary', type: 'button', disabled: qty <= 0 || same, title: same ? 'Already holds it' : '', onclick: () => {
        const r = giveCharm(j, m.uid, charmId);
        if (!r.ok) { toast(r.reason); return; }
        owSave(); sfx.levelUp();
        toast(`${m.genome.name} now holds the ${charm.name}${r.swapped ? `; the ${getCharm(r.swapped).name} is back in the Bag` : ''}.`);
        if (bagCount(j, charmId) > 0) render(); else back();
      } }, m.held ? 'Swap' : 'Give')]));
    }
    panel.append(list);
  };
  const render = () => owKeepScroll(panel, draw);
  render();
  return panel;
}

/** Pick the party member a potion is used on. */
function owUsePanel(j, itemId, back) {
  const item = getItem(itemId);
  const panel = h('div');
  const draw = () => {
    clear(panel);
    const qty = bagCount(j, itemId);
    panel.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'btn small', type: 'button', onclick: back }, '‹ Bag'), h('span', { class: 'hint', style: { margin: 0 } }, `Use ${item.name} (×${qty}) on…`)));
    const list = h('div', { class: 'party-list' });
    for (const m of j.party) {
      list.append(owMemberRow(j, m, [h('button', { class: 'btn small primary', type: 'button', disabled: qty <= 0, onclick: () => {
        const r = useItem(j, m.uid, itemId);
        if (!r.ok) { toast(r.reason); return; }
        owSave(); sfx.heal();
        toast(`${m.genome.name}${r.healed ? ` recovered ${r.healed} HP` : ''}${r.healed && r.cured ? ' and' : ''}${r.cured ? ` was cured of ${STATUS_INFO[r.cured].name.toLowerCase()}` : ''}.`);
        if (bagCount(j, itemId) > 0) render(); else back();
      } }, 'Use')]));
    }
    panel.append(list);
  };
  const render = () => owKeepScroll(panel, draw);
  render();
  return panel;
}

/** Pick a creature for a scroll, then (with four moves) the move it replaces. */
function owTeachPanel(j, teaching, back) {
  const move = getMove(teaching.moveId);
  const panel = h('div');
  const draw = () => {
    clear(panel);
    panel.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'btn small', type: 'button', style: { whiteSpace: 'nowrap' }, onclick: back }, '‹ Bag'), h('span', { class: 'hint', style: { margin: 0 } }, `Teach ${move.name} (${move.type}) to… ${move.type === 'Normal' ? 'Any creature can learn a Normal scroll.' : `Only a ${move.type} creature, or an Elemental of that element, can learn it.`} Party only; withdraw stored creatures first.`)));
    const done = (uid, index) => {
      const m = [...j.party, ...j.box].find((x) => x.uid === uid);
      const r = teachMove(j, uid, move.id, index);
      if (!r.ok) { toast(r.reason); return; }
      owSave(); sfx.levelUp();
      toast(`${m.genome.name} learned ${move.name}!${r.replaced ? ` (forgot ${getMove(r.replaced).name})` : ''}`);
      back();
    };
    for (const m of j.party) {
      const c = canTeach(j, m.uid, move.id);
      const picked = teaching.uid === m.uid;
      panel.append(h('div', { class: 'teach-row' }, creatureEl(m.genome, { size: 44, animate: false, level: m.level }),
        h('div', {}, h('b', {}, m.genome.name), ' ', h('span', { class: 'lvl' }, `Lv ${m.level}`),
          h('div', { class: 'move-chips' }, m.moves.map((id) => { const mv = getMove(id); return mv ? h('span', { class: 'chip', style: { '--chip': TYPE_INFO[mv.type].color } }, mv.name) : null; })),
          h('div', { class: `hint learns${c.code === 'type' ? ' no' : ''}`, style: { margin: '2px 0 0' } }, `Learns ${listWords(scrollTypes(m.genome))} scrolls`)),
        h('button', { class: 'btn small', type: 'button', disabled: !c.ok, title: c.ok ? '' : c.reason, onclick: () => { if (!c.needsReplace) done(m.uid, null); else { teaching.uid = picked ? null : m.uid; render(); } } }, c.ok ? (c.needsReplace ? (picked ? 'Cancel' : 'Replace…') : 'Teach') : c.code === 'type' ? 'Can’t learn' : 'Knows it')));
      if (picked && c.ok && c.needsReplace) {
        panel.append(h('div', { class: 'moves' }, m.moves.map((id, i) => { const mv = getMove(id); return h('button', { class: 'move-btn', type: 'button', style: { '--chip': TYPE_INFO[mv.type].color }, onclick: () => done(m.uid, i) }, h('span', { class: 'mv-name' }, `Forget ${mv.name}`), h('span', { class: 'mv-meta' }, `${mv.type}${mv.power ? ` · ${mv.power}` : ''}`)); })));
      }
    }
  };
  const render = () => owKeepScroll(panel, draw);
  render();
  return panel;
}

/** The Market: potions of rising strength, and every move as a single-use scroll priced by power. */
function owMarketSheet(j) {
  const body = h('div');
  let filter = 'All', onlyMine = false;
  const catalogue = marketCatalogue();
  const potions = itemCatalogue();
  const charms = charmCatalogue();
  const draw = () => {
    clear(body);
    const charmRows = h('div', { class: 'shop-list' });
    for (const { charm, cost } of charms) {
      const owned = bagCount(j, charm.id), holders = charmHolders(j, charm.id);
      charmRows.append(h('div', { class: 'shop-row' }, owCharmInfo(charm, [owned ? `in bag ×${owned}` : '', holders.length ? `held by ${holders.join(', ')}` : ''].filter(Boolean).join(' · ')),
        h('button', { class: `btn small${(j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < cost, onclick: () => {
          const r = buyCharm(j, charm.id);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.heal(); toast(`Bought a ${charm.name} for ${cost.toLocaleString()} gold`); render();
        } }, `${cost.toLocaleString()} ◆`)));
    }
    const forgeRows = h('div', { class: 'shop-list' });
    const forgeable = forgeList(j);
    for (const row of forgeable) {
      forgeRows.append(h('div', { class: `shop-row${row.ready ? ' next' : ''}` },
        owCharmInfo(row.into, `two ${row.from.name}s (you have ${row.have}) and ${row.cost.toLocaleString()} gold`),
        h('button', { class: `btn small${row.ready ? ' primary' : ''}`, type: 'button', disabled: !row.ready, title: row.have < 2 ? 'The forge wants two of them' : '', onclick: () => {
          const r = forgeCharm(j, row.from.id);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.win(); toast(`Forged a ${r.into.name} for ${r.cost.toLocaleString()} gold and the pair.`);
          render(); owRefreshHud();
        } }, `Forge ◆ ${row.cost.toLocaleString()}`)));
    }
    const brokerRows = h('div', { class: 'shop-list' });
    const offers = brokerOffers(ow.save, j);
    for (const row of offers) {
      brokerRows.append(h('div', { class: 'shop-row' },
        h('div', { class: 'shop-info' }, h('b', {}, 'Word of something unseen'),
          h('div', { class: 'shop-meta' }, h('span', {}, `Lives in the ${row.where.region}`), h('span', { class: 'shop-tag' }, row.where.types.join('/')))),
        h('button', { class: `btn small${(j.gold || 0) >= row.cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < row.cost, onclick: () => {
          const r = buyHint(ow.save, j, row.species.id);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.heal(); toast(`${r.species.name} lives in the ${r.where.region}. The Dex has it now.`);
          render(); owRefreshHud();
        } }, `${row.cost.toLocaleString()} ◆`)));
    }
    const potionList = h('div', { class: 'shop-list' });
    for (const { item, cost } of potions) {
      const owned = bagCount(j, item.id);
      potionList.append(h('div', { class: 'shop-row' }, owItemInfo(item, owned ? `in bag ×${owned}` : ''),
        h('button', { class: `btn small${(j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < cost, onclick: () => {
          const r = buyItem(j, item.id);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.heal(); toast(`Bought a ${item.name} for ${cost.toLocaleString()} gold`); render();
        } }, `${cost.toLocaleString()} ◆`)));
    }
    const chips = h('div', { class: 'type-filter' },
      h('button', { class: `btn small${onlyMine ? ' on' : ''}`, type: 'button', onclick: () => { onlyMine = !onlyMine; render(); } }, 'My team'),
      ['All', ...TYPE_LIST].map((t) => h('button', { class: `btn small${filter === t ? ' on' : ''}`, type: 'button', style: t !== 'All' ? { '--chip': TYPE_INFO[t].color } : null, onclick: () => { filter = t; render(); } }, t)));
    const list = h('div', { class: 'shop-list' });
    let shown = 0;
    for (const { move, cost } of catalogue) {
      if (filter !== 'All' && move.type !== filter) continue;
      const who = scrollLearners(j, move.id);
      if (onlyMine && !who.length) continue;
      shown++;
      const owned = bagCount(j, move.id);
      const info = moveInfoEl(move, owned ? `in bag ×${owned}` : '');
      info.append(h('div', { class: `shop-who${who.length ? '' : ' none'}` }, who.length ? `for ${who.join(', ')}` : 'no one on your team can learn this'));
      list.append(h('div', { class: 'shop-row' }, info,
        h('button', { class: `btn small${(j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < cost, onclick: () => {
          const r = buyMove(j, move.id);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.heal(); toast(`Bought ${move.name} for ${cost.toLocaleString()} gold`); render();
        } }, `${cost.toLocaleString()} ◆`)));
    }
    appendChildren(body, [
      h('p', { class: 'hint' }, `◆ ${(j.gold || 0).toLocaleString()} gold. Everything goes to your Bag. Trainers pay gold when beaten.`),
      ...section('Potions', potionList),
      ...section('The broker', h('p', { class: 'hint' }, offers.length
        ? `A word costs ${BROKER.cost.toLocaleString()} gold: the broker names a creature your Dex has never seen and the region it lives in, and the Dex counts it as seen.`
        : 'The broker has nothing left to tell you: your Dex has seen everything alive.'), brokerRows),
      ...section('The forge', h('p', { class: 'hint' }, forgeable.length
        ? 'Two of the same charm and gold make its greater form: stronger numbers, and the once-a-battle charms fire twice. Greater charms are never sold.'
        : 'Bring two of the same charm and the forge will make its greater form. Nothing in your bag is doubled up yet.'), forgeRows),
      ...section('Charms', h('p', { class: 'hint' }, 'A held charm goes into every fight with its creature: a type charm lifts that type’s moves by a fifth, a band lifts one damage type by a tenth, and the rest carry a small passive of their own. Give them out from the Bag. Every Warden hands one over with their badge.'), charmRows),
      ...section('Move scrolls', h('p', { class: 'hint' }, 'The Market stocks the basics: every Normal scroll and anything of 60 power or less. The heavier type scrolls are taught at the camps out in the regions, three types apiece, once you hold that region\'s badge. A creature learns scrolls of its own types, of its Elemental element, and any Normal scroll; "My team" hides the rest.'), chips, shown ? list : h('p', { class: 'hint' }, 'No scroll here suits your team.')),
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Market', body, () => owRefreshHud());
}

/** Creature Storage: the only place the box opens. Deposit from the party, withdraw into it. */
function owStorageSheet(j) {
  const body = h('div');
  let tab = 'store';
  const store = ow.storeView || (ow.storeView = { q: '', sort: 'recent', selecting: false, picked: new Set(), confirmRelease: false });
  store.picked = store.picked || new Set();
  const draw = () => {
    clear(body);
    body.append(h('div', { class: 'type-filter' },
      h('button', { class: `btn small${tab === 'store' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'store'; render(); } }, 'Storage'),
      h('button', { class: `btn small${tab === 'hall' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'hall'; render(); } }, 'Trophy Hall')));
    if (tab === 'hall') { body.append(owHallPanel(j)); return; }
    const btn = (label, onclick, disabled) => h('button', { class: 'btn small', type: 'button', disabled, onclick }, label);
    const partyList = h('div', { class: 'party-list' });
    j.party.forEach((m, i) => partyList.append(owMemberRow(j, m, [
      btn('Lead', () => { setLead(j, m.uid); owSave(); render(); }, i === 0),
      btn('Deposit', () => { moveMember(j, m.uid, 'box'); owSave(); render(); }, j.party.length <= 1),
      btn('Info', () => openSheet(m.genome, { ...owInfoOpts(j, m, render), nav: owMemberNav(j, [...j.party, ...j.box], m, render, 'Party and storage') })),
      owReleaseBtn(j, m, render),
    ])));
    // the box outgrew a plain list a long time ago: search it, sort it, and work on a handful at once
    const shown = storeFilter(j.box, store);
    const boxList = h('div', { class: 'party-list' });
    for (const m of shown) {
      const picked = store.picked.has(m.uid);
      boxList.append(owMemberRow(j, m, store.selecting ? [
        h('button', { class: `btn small${picked ? ' primary' : ''}`, type: 'button', onclick: () => { if (picked) store.picked.delete(m.uid); else store.picked.add(m.uid); render(); } }, picked ? 'Picked ✓' : 'Pick'),
      ] : [
        btn('Withdraw', () => { moveMember(j, m.uid, 'party'); owSave(); render(); }, j.party.length >= JOURNEY.partyMax),
        btn('Info', () => openSheet(m.genome, { ...owInfoOpts(j, m, render), nav: owMemberNav(j, [...j.party, ...j.box], m, render, 'Party and storage') })),
        owReleaseBtn(j, m, render),
      ]));
    }
    const search = h('input', { class: 'seed code-in', type: 'search', placeholder: 'Search stored creatures', value: store.q, 'aria-label': 'Search storage',
      oninput: (e) => { store.q = e.target.value; owKeepScroll(body, draw); const el = body.querySelector('input[type=search]'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } } });
    const sorter = h('select', { class: 'seed', 'aria-label': 'Sort storage', onchange: (e) => { store.sort = e.target.value; render(); } },
      STORE_SORTS.map((o) => h('option', { value: o.id, selected: store.sort === o.id }, o.name)));
    const tools = h('div', { class: 'toolbar' }, search, sorter,
      h('button', { class: `btn small${store.selecting ? ' on' : ''}`, type: 'button', onclick: () => { store.selecting = !store.selecting; store.picked.clear(); render(); } }, store.selecting ? 'Done' : 'Select'));
    const picked = [...store.picked].map((uid) => j.box.find((m) => m.uid === uid)).filter(Boolean);
    const bulk = store.selecting ? h('div', { class: 'toolbar' },
      h('button', { class: 'btn small', type: 'button', onclick: () => { for (const m of shown) store.picked.add(m.uid); render(); } }, `Pick all ${shown.length}`),
      h('button', { class: 'btn small', type: 'button', disabled: !picked.length, onclick: () => { store.picked.clear(); render(); } }, 'Clear'),
      h('button', { class: `btn small${picked.length && j.party.length < JOURNEY.partyMax ? ' primary' : ''}`, type: 'button', disabled: !picked.length || j.party.length >= JOURNEY.partyMax,
        onclick: () => { let took = 0; for (const m of picked) { if (j.party.length >= JOURNEY.partyMax) break; moveMember(j, m.uid, 'party'); store.picked.delete(m.uid); took++; } owSave(); toast(`Withdrew ${took}.`); render(); } }, `Withdraw ${picked.length || ''}`.trim()),
      h('button', { class: `btn small${store.confirmRelease ? ' danger' : ''}`, type: 'button', disabled: !picked.length,
        onclick: () => {
          const free = picked.filter((m) => !m.locked);
          if (!free.length) { toast('Every one of those is locked.'); return; }
          if (!store.confirmRelease) { store.confirmRelease = true; toast(`Tap again to release ${free.length}`); render(); setTimeout(() => { store.confirmRelease = false; if (body.isConnected) render(); }, 4000); return; }
          for (const m of free) { releaseMember(j, m.uid); store.picked.delete(m.uid); }
          store.confirmRelease = false; owSave(); toast(`Released ${free.length}.`); render();
        } }, store.confirmRelease ? 'Really release?' : `Release ${picked.length || ''}`.trim())) : null;
    const presets = h('div', { class: 'toolbar' }, Array.from({ length: PRESETS.slots }, (_, i) => {
      const preset = (j.presets || [])[i];
      const ready = preset ? presetMembers(j, i).length : 0;
      return h('button', { class: `btn small${preset ? '' : ' '}`, type: 'button', title: preset ? `${preset.name}: ${preset.uids.length} saved, ${ready} still on the roster` : 'Empty slot',
        onclick: () => {
          if (!preset) { savePreset(j, i, `Team ${i + 1}`); owSave(); toast(`Saved this party as Team ${i + 1}.`); render(); return; }
          const r = applyPreset(j, i);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); sfx.tap(); toast(`${preset.name} is out.`); render();
        } }, preset ? `${preset.name} · ${ready}` : `Save Team ${i + 1}`);
    }), h('button', { class: 'btn small', type: 'button', title: 'Overwrite the first team with the party as it stands',
      onclick: () => { const i = (j.presets || []).findIndex((x) => !x); savePreset(j, i >= 0 ? i : 0, `Team ${(i >= 0 ? i : 0) + 1}`); owSave(); toast('Party saved.'); render(); } }, 'Save party'));
    appendChildren(body, [
      h('p', { class: 'hint' }, `Up to ${JOURNEY.partyMax} travel with you; the rest wait here. Creatures caught with a full party come straight to storage. Release lets a creature go for good; it stays in your Collection.`),
      ...section(`Party · ${j.party.length}/${JOURNEY.partyMax}`, partyList),
      ...section('Teams', h('p', { class: 'hint' }, 'Three arrangements of the roster. Tap an empty slot to save the party as it stands; tap a saved one to put it back on.'), presets),
      ...section(`Stored · ${j.box.length}${shown.length !== j.box.length ? ` · ${shown.length} shown` : ''}`, tools, bulk,
        j.box.length ? (shown.length ? boxList : h('p', { class: 'hint' }, 'Nothing matches that.')) : h('p', { class: 'hint' }, 'Nothing stored yet.')),
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Creature Storage', body, () => owRefreshHud());
}

/** The Trophy Hall: shelf room bought with gold, and a dyer who draws new colours. */
function owHallPanel(j) {
  const wrap = h('div');
  const hall = hallOf(ow.save);
  const cost = nextTierCost(ow.save);
  const shown = trophies(ow.save);
  const head = h('p', { class: 'hint' }, hall.tier
    ? `Wing ${hall.tier} of ${HALL.tiers}: ${shown.length} of ${hall.room} shelves filled. `
    : 'The hall is bare. A wing buys three shelves for the creatures you are proudest of. ');
  const buy = h('div', { class: 'row' }, cost
    ? h('button', { class: `btn${(j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < cost, onclick: () => {
      const r = buyTier(ow.save, j);
      if (!r.ok) { toast(r.reason); return; }
      owSave(); sfx.win(); toast(`Wing ${r.tier} opens: ${r.room} shelves.`);
      renderHall();
    } }, `Build wing ${hall.tier + 1} ◆ ${cost.toLocaleString()}`)
    : h('span', { class: 'hint', style: { margin: 0 } }, 'Every wing is built.'));
  const shelf = h('div', { class: 'pool dex-grid' });
  for (const e of shown) {
    shelf.append(h('button', { class: 'pcard dex-card caught', type: 'button', onclick: () => openSheet(e.genome) },
      creatureEl(e.genome, { size: 96, animate: false }), h('span', {}, e.genome.name)));
  }
  const pickable = (ow.save.collection || []).slice().reverse().slice(0, 40);
  const picker = h('div', { class: 'shop-list' });
  for (const e of pickable) {
    const key = trophyKey(e.genome), on = hall.slots.includes(key);
    picker.append(h('div', { class: `shop-row${on ? ' known' : ''}` },
      h('div', { class: 'shop-info' }, h('b', {}, e.genome.name),
        h('div', { class: 'shop-meta' }, h('span', {}, e.genome.gen ? `gen ${e.genome.gen} fusion` : 'caught'), on ? h('span', { class: 'shop-tag' }, 'on show') : null)),
      h('button', { class: 'btn small', type: 'button', disabled: !hall.room, onclick: () => {
        const r = setTrophy(ow.save, key, !on);
        if (!r.ok) { toast(r.reason); return; }
        owSave(); renderHall();
      } }, on ? 'Take down' : 'Put up')));
  }
  const dye = h('div', { class: 'party-list' });
  for (const m of j.party) {
    const block = morphBlock(m);
    dye.append(owMemberRow(j, m, [
      h('span', { class: 'hint', style: { margin: 0 } }, m.genome.morph ? MORPHS[m.genome.morph].name : 'its own colours'),
      h('button', { class: `btn small${!block && (j.gold || 0) >= HALL.morphCost ? ' primary' : ''}`, type: 'button', disabled: Boolean(block) || (j.gold || 0) < HALL.morphCost, title: block || '', onclick: () => {
        if (ow.confirmMorph !== m.uid) { ow.confirmMorph = m.uid; toast('Tap again: the dyer cannot be told what to make'); setTimeout(() => { if (ow.confirmMorph === m.uid) ow.confirmMorph = null; }, 4000); return; }
        ow.confirmMorph = null;
        const r = drawMorph(j, m.uid);
        if (!r.ok) { toast(r.reason); return; }
        if (r.to) dexCaught(ow.save, r.member.genome);
        owSave(); sfx.win(); toast(`${r.member.genome.name} came out ${r.name}.`);
        renderHall();
      } }, `Dye ◆ ${HALL.morphCost.toLocaleString()}`),
    ]));
  }
  appendChildren(wrap, [
    head, buy,
    ...section('On show', shown.length ? shelf : h('p', { class: 'hint' }, 'No shelves filled yet.')),
    ...section('The collection', h('p', { class: 'hint' }, 'The last forty creatures you recorded. Putting one up is free; the room was the expensive part.'), picker),
    ...section("The dyer's bench", h('p', { class: 'hint' }, `${HALL.morphCost.toLocaleString()} gold draws a party creature a new colour morph, or its own colours back. It cannot be chosen, and a caught morph goes into the Dex.`), dye),
  ]);
  return wrap;
  function renderHall() { const parent = wrap.parentNode; if (!parent) return; const next = owHallPanel(j); parent.replaceChild(next, wrap); owRefreshHud(); }
}

/** The Battle Tower: six floors, six on six, at a level of the player's choosing. */
function owTowerSheet(j) {
  const body = h('div');
  const top = Math.max(...j.party.map((m) => m.level));
  let level = ow.towerLevel && TOWER.levels.includes(ow.towerLevel) ? ow.towerLevel : (TOWER.levels.filter((L) => L <= top + 5).pop() || TOWER.levels[0]);
  const draw = () => {
    clear(body);
    const tiers = h('div', { class: 'type-filter tower-tiers' }, TOWER.levels.map((L) => h('button', { class: `btn small${level === L ? ' on' : ''}`, type: 'button', onclick: () => { level = L; ow.towerLevel = L; render(); } }, `Lv ${L}`)));
    const list = h('div', { class: 'shop-list' });
    TOWER_TRAINERS.forEach((t, k) => {
      const wins = towerRecord(j, k, level);
      list.append(h('div', { class: 'shop-row tower-row' },
        h('div', { class: 'tower-info' }, h('b', {}, `${t.title} · ${t.name}`), h('span', { class: 'hint' }, t.line), h('span', { class: 'tower-meta' }, `${TOWER.teamSize} random creatures at Lv ${level}${t.fusions ? ` · ${t.fusions} fusion${t.fusions > 1 ? 's' : ''}` : ''}${wins ? ` · beaten ×${wins}` : ''}`)),
        h('button', { class: `btn small${canFight(j) ? ' primary' : ''}`, type: 'button', disabled: !canFight(j), onclick: () => {
          const r = challengeTower(j, k, level);
          if (!r.ok) { toast(r.reason); return; }
          owSave(); close(); renderWorldScreen(ow.root);
        } }, wins ? 'Again' : 'Challenge')));
    });
    appendChildren(body, [
      h('p', { class: 'hint' }, `Six floors, each a trainer with six random creatures at the level you pick. Every challenge rolls a new team, and the higher floors field gen-2 fusions. Wins pay experience every time and trainer gold, a quarter of it once a floor is beaten at that level. Your party fights as it is: strongest member Lv ${top}.`),
      ...section('Level', tiers),
      ...section('Floors', list),
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  const { close } = owSheet('Battle Tower', body, () => owRefreshHud());
}

// ---- the Bounty Office ------------------------------------------------------------

/** Five standing bounties for fusions by type; hand one over for its gold times the level bonus. */
function owBountySheet(j) {
  const body = h('div');
  let picking = null; // bounty id whose candidates are shown
  const draw = () => {
    clear(body);
    if (picking) {
      const bounty = openBounties(j).find((b) => b.id === picking);
      if (!bounty) { picking = null; render(); return; }
      const cands = bountyCandidates(j, bounty);
      body.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'btn small', type: 'button', onclick: () => { picking = null; render(); } }, '‹ Bounties'),
        h('span', { class: 'hint', style: { margin: 0 } }, `Hand over a ${bounty.type} fusion for ${bounty.gold.toLocaleString()} gold × its level bonus. One tap hands it over for good.`)));
      if (!cands.length) body.append(h('p', { class: 'hint' }, `No ${bounty.type} fusion travels with you or waits in storage. The shrine fuses two creatures of one class; the child keeps its parents' types.`));
      const list = h('div', { class: 'party-list' });
      for (const c of cands) {
        const m = c.member, block = c.locked ? `${m.genome.name} is locked. Unlock it in Info first.` : c.last ? 'Keep at least one creature with you.' : '';
        list.append(owMemberRow(j, m, [
          h('span', { class: 'hint', style: { margin: 0 } }, `× ${bountyLevelMul(m.level).toFixed(2)} at Lv ${m.level} = `, h('b', { class: 'ow-gold' }, `◆ ${c.payout.toLocaleString()}`)),
          h('button', { class: `btn small${block ? '' : ' primary'}`, type: 'button', disabled: Boolean(block), title: block, onclick: () => {
            const r = turnInBounty(j, bounty.id, m.uid);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.win(); toast(`${r.member.genome.name} handed over: +${r.paid.toLocaleString()} gold (× ${r.mult.toFixed(2)}). It stays in your Collection.`);
            picking = null; render(); owRefreshHud();
          } }, 'Hand over'),
        ]));
      }
      body.append(list);
      return;
    }
    const list = h('div', { class: 'shop-list' });
    for (const b of openBounties(j)) {
      const cands = bountyCandidates(j, b);
      const best = cands.find((c) => !c.locked && !c.last);
      list.append(h('div', { class: `shop-row bounty${best ? ' next' : ''}` },
        h('div', { class: 'shop-info' }, h('b', {}, 'Wanted: a ', h('span', { class: 'chip', style: { '--chip': TYPE_INFO[b.type].color } }, b.type), ' fusion'),
          h('div', { class: 'shop-meta' }, h('span', {}, `${b.gold.toLocaleString()} gold × 1.01 to 2.00 by level`), h('span', { class: 'shop-tag' }, best ? `${best.member.genome.name} would fetch ${best.payout.toLocaleString()}` : cands.length ? 'yours are locked' : 'none with you'))),
        h('button', { class: `btn small${best ? ' primary' : ''}`, type: 'button', onclick: () => { picking = b.id; render(); } }, cands.length ? 'Hand over…' : 'Who fits?')));
    }
    appendChildren(body, [
      h('p', { class: 'hint' }, `The office buys fusions: any creature born at the shrine that carries the wanted type, from the party or storage, for the listed gold times a level bonus (1.01 at Lv 1, 2.00 at Lv 100). The creature is gone for good but stays in your Collection; a new bounty goes up at once. ${j.stats.bounties || 0} paid so far.`),
      list,
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Bounty Office', body, () => owRefreshHud());
}

// ---- camps: the region's tutor, and recalling a move a creature has outgrown ----------------

/** What the camp under the player belongs to: a region and its badge, or the Crossroads. */
function owCampPlace(j) {
  const world = ow.world, p = j.player;
  if (isHubTile(world, p.x, p.y)) return { hub: true };
  const b = biomeAt(world, p.x, p.y);
  return b ? { hub: false, biome: b, clade: b.clade, region: REGIONS[b.clade], badge: (j.badges || []).includes(b.id) } : { hub: true };
}

/** The camp sheet: buy the region's scrolls from its tutor, or pay to recall a move. */
function owCampSheet(j) {
  const body = h('div');
  let tab = 'tutor';
  let recalling = null; // uid whose recall list is open
  const place = owCampPlace(j);
  if (place.hub) tab = 'recall';
  const draw = () => {
    clear(body);
    const tabs = h('div', { class: 'type-filter' },
      place.hub ? null : h('button', { class: `btn small${tab === 'tutor' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'tutor'; render(); } }, 'Tutor'),
      h('button', { class: `btn small${tab === 'recall' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'recall'; recalling = null; render(); } }, 'Recall'),
      h('button', { class: `btn small${tab === 'coach' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'coach'; render(); } }, 'Coach'));
    body.append(tabs);
    if (tab === 'tutor' && !place.hub) {
      const types = tutorTypes(place.clade);
      body.append(h('p', { class: 'hint' }, place.badge
        ? `The tutor at this camp teaches ${listWords(types)} scrolls at seven tenths of the Market's price.`
        : `The tutor teaches ${listWords(types)} scrolls to those who hold the ${place.region.badge}. Beat the Warden first.`));
      const list = h('div', { class: 'shop-list' });
      for (const { move, cost } of tutorCatalogue(place.clade)) {
        const who = scrollLearners(j, move.id);
        const owned = bagCount(j, move.id);
        const info = moveInfoEl(move, owned ? `in bag ×${owned}` : '');
        info.append(h('div', { class: `shop-who${who.length ? '' : ' none'}` }, who.length ? `for ${who.join(', ')}` : 'no one on your team can learn this'));
        list.append(h('div', { class: 'shop-row' }, info,
          h('button', { class: `btn small${place.badge && (j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: !place.badge || (j.gold || 0) < cost, onclick: () => {
            const r = buyTutorMove(j, place.biome.id, place.clade, move.id);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.heal(); toast(`The tutor sold you ${move.name} for ${cost.toLocaleString()} gold`); render(); owRefreshHud();
          } }, `${cost.toLocaleString()} ◆`)));
      }
      body.append(list);
      return;
    }
    if (tab === 'coach') {
      body.append(h('p', { class: 'hint' }, `A coach moves one point of a creature's spread from one stat to another for `
        + `${COACH.base.toLocaleString()} gold and ${COACH.perLevel} a level. The total never changes, so this is a different build and not a stronger creature. `
        + `Ten sessions each, and no stat goes below a twentieth or above three tenths.`));
      const list = h('div', { class: 'party-list' });
      for (const m of j.party) {
        const left = coachLeft(m), cost = coachCost(m);
        const from = (ow.coachFrom && ow.coachFrom[m.uid]) || 'magic';
        const to = (ow.coachTo && ow.coachTo[m.uid]) || 'melee';
        const block = coachBlock(m, from, to);
        const picker = (which, value) => h('select', {
          class: 'coach-pick',
          onchange: (e) => { ow[which] = ow[which] || {}; ow[which][m.uid] = e.target.value; render(); },
        }, coachStats().map((k) => h('option', { value: k, selected: k === value ? '' : null }, statLabel(k))));
        list.append(owMemberRow(j, m, [
          h('span', { class: 'hint', style: { margin: 0 } }, `${left} session${left === 1 ? '' : 's'} left`),
          picker('coachFrom', from), h('span', { class: 'hint', style: { margin: 0 } }, '→'), picker('coachTo', to),
          h('button', { class: `btn small${!block && j.gold >= cost ? ' primary' : ''}`, type: 'button', disabled: Boolean(block) || j.gold < cost, title: block || '', onclick: () => {
            const r = coachMember(j, m.uid, from, to);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.levelUp(); toast(`${r.member.genome.name} moved a point from ${statLabel(r.from)} to ${statLabel(r.to)}.`);
            render(); owRefreshHud();
          } }, `Coach ◆ ${cost.toLocaleString()}`),
        ]));
      }
      body.append(list);
      return;
    }
    body.append(h('p', { class: 'hint' }, 'A camp can bring back a move a creature has outgrown: anything from its own learnset it has passed but no longer knows, for a small fee that rises with its level.'));
    const list = h('div', { class: 'party-list' });
    for (const m of j.party) {
      const options = recallOptions(j, m.uid);
      const cost = recallCost(m);
      if (recalling === m.uid && options.length) {
        const rows = h('div', { class: 'shop-list' });
        for (const { move, level } of options) {
          rows.append(h('div', { class: 'shop-row' }, moveInfoEl(move, `learned at Lv ${level}`),
            h('button', { class: `btn small${(j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: (j.gold || 0) < cost, onclick: () => {
              const r = recallMove(j, m.uid, move.id, 0);
              if (!r.ok) { toast(r.reason); return; }
              owSave(); sfx.levelUp();
              toast(r.replaced ? `${m.genome.name} forgot ${getMove(r.replaced).name} and remembered ${move.name}.` : `${m.genome.name} remembered ${move.name}.`);
              recalling = null; render(); owRefreshHud();
            } }, `${cost.toLocaleString()} ◆`)));
        }
        list.append(h('div', { class: 'party-row static' }, h('div', { class: 'party-info' },
          h('div', {}, h('b', {}, m.genome.name), ' ', h('span', { class: 'hint' }, 'picks one back; the first of its four moves makes way')), rows,
          h('button', { class: 'btn small', type: 'button', onclick: () => { recalling = null; render(); } }, 'Never mind'))));
        continue;
      }
      list.append(owMemberRow(j, m, [
        h('span', { class: 'hint', style: { margin: 0 } }, options.length ? `${options.length} to recall` : 'nothing to recall'),
        h('button', { class: `btn small${options.length && (j.gold || 0) >= cost ? ' primary' : ''}`, type: 'button', disabled: !options.length || (j.gold || 0) < cost, onclick: () => { recalling = m.uid; render(); } }, `Recall ◆ ${cost.toLocaleString()}`),
      ]));
    }
    body.append(list);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet(place.hub ? 'Crossroads camp' : `${place.region.name} camp`, body, () => owRefreshHud());
}

// ---- the Rookery ------------------------------------------------------------------

/** Turn a creature's passive over: to another its bloodline carries, or to one drawn from the wild. */
function owRookerySheet(j) {
  const body = h('div');
  const draw = () => {
    clear(body);
    const list = h('div', { class: 'party-list' });
    const roster = [...(j.party || []), ...(j.box || [])];
    for (const m of roster) {
      const slot = (ow.rookerySlot && ow.rookerySlot[m.uid]) || 1;
      const swapBlock = rookeryBlock(m, 'swap', slot), drawBlock = rookeryBlock(m, 'draw', slot);
      const secondBlock = rookeryBlock(m, 'second');
      const options = swapChoices(m.genome, slot);
      const swapTo = options[0];
      const swapGold = swapPrice(m), drawGold = drawPrice(m), slotGold = secondSlotPrice();
      // a blocked creature says why on the row itself: a disabled button's tooltip is no use on a phone
      const line = swapBlock
        ? h('span', { class: 'hint', style: { margin: 0 } }, swapBlock)
        : h('span', { class: 'hint', style: { margin: 0 } }, swapTo ? [`Slot ${slot} would become `, h('b', {}, abilityName(swapTo))] : (secondBlock || ''));
      list.append(owMemberRow(j, m, [
        line,
        m.genome.ability2 ? h('button', { class: `btn small${slot === 2 ? ' on' : ''}`, type: 'button', title: 'Which slot these buttons act on',
          onclick: () => { ow.rookerySlot = ow.rookerySlot || {}; ow.rookerySlot[m.uid] = slot === 1 ? 2 : 1; render(); } }, `Slot ${slot}`) : null,
        m.genome.ability2 ? null : h('button', {
          class: `btn small${!secondBlock && j.gold >= slotGold ? ' primary' : ''}`, type: 'button',
          disabled: Boolean(secondBlock) || j.gold < slotGold, title: secondBlock || `A second passive, for good: ${slotGold.toLocaleString()} gold`,
          onclick: () => {
            if (ow.confirmSlot !== m.uid) { ow.confirmSlot = m.uid; toast(`Tap again: ${slotGold.toLocaleString()} gold opens a second slot for good`); setTimeout(() => { if (ow.confirmSlot === m.uid) ow.confirmSlot = null; }, 4000); return; }
            ow.confirmSlot = null;
            const r = openSecondSlot(j, m.uid);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.win(); toast(`${r.member.genome.name} opened a second slot: ${abilityName(r.to)}.`);
            render(); owRefreshHud();
          },
        }, `Second slot ◆ ${slotGold.toLocaleString()}`),
        h('button', {
          class: `btn small${!swapBlock && j.gold >= swapGold ? ' primary' : ''}`, type: 'button',
          disabled: Boolean(swapBlock) || j.gold < swapGold, title: swapBlock || `${swapGold.toLocaleString()} gold`,
          onclick: () => {
            const r = swapPassive(j, m.uid, null, slot);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.levelUp(); toast(`${r.member.genome.name}: ${abilityName(r.from)} → ${abilityName(r.to)} for ${r.paid.toLocaleString()} gold.`);
            render(); owRefreshHud();
          },
        }, `Swap ◆ ${swapGold.toLocaleString()}`),
        h('button', {
          class: 'btn small', type: 'button',
          disabled: Boolean(drawBlock) || j.gold < drawGold, title: drawBlock || `A passive suited to its types or style, ${drawGold.toLocaleString()} gold`,
          onclick: () => {
            if (ow.confirmDraw !== m.uid) { ow.confirmDraw = m.uid; toast('Tap again: a wild draw cannot be chosen or undone'); setTimeout(() => { if (ow.confirmDraw === m.uid) ow.confirmDraw = null; }, 4000); return; }
            ow.confirmDraw = null;
            const r = wildDraw(j, m.uid, slot);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.win(); toast(`${r.member.genome.name} drew ${abilityName(r.to)} for ${r.paid.toLocaleString()} gold.`);
            render(); owRefreshHud();
          },
        }, `Wild ◆ ${drawGold.toLocaleString()}`),
      ]));
    }
    const sample = roster.length ? wildPool(roster[0].genome).length : 0;
    appendChildren(body, [
      h('p', { class: 'hint' }, `A second slot costs ${secondSlotPrice().toLocaleString()} gold, opens once and never closes: from then on the creature fights with both passives, and the Slot button says which one the other two buttons act on. `
        + 'A swap turns a creature over to another passive its own bloodline carries, for gold that rises with its level. '
        + `A wild draw is dearer and cannot be chosen: it takes one at random from the passives that suit its types or its fighting style${sample ? ` (${sample} of them for the first on this list)` : ''}. `
        + 'An Elemental keeps its core.'),
      list,
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('The Rookery', body, () => owRefreshHud());
}

// ---- the notice board -------------------------------------------------------------

/** The board's three notices: what to do, how far along, what it pays; Claim when done, or tear one down for another. */
function owBoardSheet(j) {
  const body = h('div');
  const draw = () => {
    clear(body);
    const list = h('div', { class: 'shop-list' });
    for (const q of openQuests(j)) {
      const ready = questReady(q);
      list.append(h('div', { class: `shop-row notice${ready ? ' next' : ''}` },
        h('div', { class: 'shop-info' }, h('b', {}, q.text),
          h('div', { class: 'shop-meta' }, h('span', {}, `Pays ${rewardText(q)}.`), h('span', { class: 'shop-tag' }, ready ? 'done' : q.goal > 1 ? `${q.progress} / ${q.goal}` : 'open'))),
        h('div', { class: 'stack' },
          h('button', { class: `btn small${ready ? ' primary' : ''}`, type: 'button', disabled: !ready, onclick: () => {
            const r = claimQuest(j, q.id);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.levelUp(); toast(`Claimed ${rewardText(r.quest)}.`); render(); owRefreshHud();
          } }, 'Claim'),
          ready ? null : h('button', { class: 'btn small', type: 'button', title: 'Take this notice down; another goes up', onclick: () => {
            if (ow.confirmTear !== q.id) { ow.confirmTear = q.id; toast('Tap again to tear it down'); setTimeout(() => { if (ow.confirmTear === q.id) ow.confirmTear = null; }, 4000); return; }
            ow.confirmTear = null;
            abandonQuest(j, q.id); owSave(); render();
          } }, 'Tear down'))));
    }
    appendChildren(body, [
      h('p', { class: 'hint' }, `Three requests from the townsfolk at a time, pinned for whoever passes. Finish one anywhere on the ring and claim it here; a fresh notice goes up in its place. ${j.stats.quests || 0} done so far.`),
      list,
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Notice board', body, () => owRefreshHud());
}

// ---- the Fusiondex ----------------------------------------------------------------

const DEX_SEED = 'dex';
function owDexGenome(sp) { ow.dexCache = ow.dexCache || new Map(); if (!ow.dexCache.has(sp.id)) ow.dexCache.set(sp.id, speciesGenome(sp, makeRngDex(sp.id))); return ow.dexCache.get(sp.id); }
function makeRngDex(id) { return makeRng(`${DEX_SEED}:${id}`); }

/** One card per species of a class: caught species drawn in full, seen ones as silhouettes, the rest as numbered blanks. */
function owDexGrid(clade, filter = {}) {
  const grid = h('div', { class: 'pool dex-grid' });
  const q = (filter.q || '').trim().toLowerCase();
  let list = q ? SPECIES.filter((sp) => !sp.hidden) : dexSpeciesOf(clade); // a search reaches across every class
  if (q) list = list.filter((sp) => sp.name.toLowerCase().includes(q) || sp.id.includes(q));
  if (filter.type && filter.type !== 'All') list = list.filter((sp) => sp.types.includes(filter.type));
  if (filter.state && filter.state !== 'all') list = list.filter((sp) => {
    const st = dexStatus(ow.save, sp.id);
    return filter.state === 'caught' ? st === 'caught' : filter.state === 'seen' ? st === 'seen' : st === 'unseen';
  });
  if (!list.length) { grid.append(h('p', { class: 'hint' }, 'Nothing matches.')); return grid; }
  const items = list.map((sp) => ({ sp, status: dexStatus(ow.save, sp.id) }));
  const known = items.filter((it) => it.status !== 'unseen');
  items.forEach((it, i) => {
    const { sp, status } = it;
    const morphs = dexMorphs(ow.save, sp.id);
    const morphTags = Object.entries(morphs).map(([m, v]) => h('span', { class: `morph-dot morph-${m}${v >= 2 ? ' got' : ''}`, title: `${MORPHS[m].name}${v >= 2 ? ' caught' : ' seen'}` }));
    if (status === 'unseen') {
      grid.append(h('div', { class: 'pcard dex-card unseen' }, h('span', { class: 'gen' }, `#${i + 1}`), h('div', { class: 'dex-blank' }, '?'), h('span', {}, sp.tier === 'rare' ? 'rare · not yet seen' : 'not yet seen')));
      return;
    }
    const g = owDexGenome(sp), hab = dexHabitat(sp.id);
    grid.append(h('button', { class: `pcard dex-card ${status}`, type: 'button', onclick: () => openSheet(g, { nav: { label: `${cladeName(clade)} dex`, index: known.indexOf(it), items: known.map((k) => ({ genome: owDexGenome(k.sp) })) } }) },
      h('span', { class: 'gen' }, `#${i + 1}${status === 'seen' ? ' · seen' : ''}`),
      morphTags.length ? h('span', { class: 'sel morphs' }, morphTags) : null,
      creatureEl(g, { size: 104, animate: false }), h('span', {}, sp.name),
      h('span', { class: 'dex-hab' }, `${hab.region} · ${hab.types.join(' / ')}`)));
  });
  return grid;
}

/** The index: every passive and every move, searchable, because there are 900 and 531 of them. */
function owIndexPanel() {
  const wrap = h('div');
  const draw = () => {
    clear(wrap);
    const kind = ow.indexKind || 'passives';
    const q = (ow.indexQuery || '').trim().toLowerCase();
    const tabs = h('div', { class: 'type-filter' }, [['passives', `Passives (${ABILITY_IDS.length})`], ['moves', `Moves (${MOVES.length})`]]
      .map(([id, label]) => h('button', { class: `btn small${kind === id ? ' on' : ''}`, type: 'button', onclick: () => { ow.indexKind = id; draw(); } }, label)));
    const search = h('input', { class: 'dex-search', type: 'search', placeholder: kind === 'passives' ? 'Search passives by name or wording…' : 'Search moves by name or type…', value: ow.indexQuery || '',
      oninput: (e) => { ow.indexQuery = e.target.value; draw(); } });
    const list = h('div', { class: 'shop-list' });
    let shown = 0;
    if (kind === 'passives') {
      for (const id of ABILITY_IDS) {
        const a = ABILITIES[id];
        if (q && !a.name.toLowerCase().includes(q) && !a.desc.toLowerCase().includes(q)) continue;
        if (++shown > 120) break;
        list.append(h('div', { class: 'shop-row' }, h('div', { class: 'shop-info' },
          h('b', {}, a.name, isCoreAbility(id) ? h('span', { class: 'shop-tag' }, 'Elemental core') : null),
          h('div', { class: 'shop-meta' }, h('span', {}, a.desc)))));
      }
    } else {
      for (const mv of MOVES) {
        if (q && !mv.name.toLowerCase().includes(q) && !mv.type.toLowerCase().includes(q) && !mv.cat.includes(q)) continue;
        if (++shown > 120) break;
        const info = moveInfoEl(mv, mv.signature ? 'signature move' : '');
        list.append(h('div', { class: 'shop-row' }, info));
      }
    }
    appendChildren(wrap, [tabs, search,
      h('p', { class: 'hint' }, shown > 120 ? 'Showing the first 120. Keep typing to narrow it.' : `${shown} match${shown === 1 ? '' : 'es'}.`),
      list]);
  };
  draw();
  return wrap;
}

/** The team panel: what the party can hit, what hits it back, and how its damage types are spread. */
function owTeamPanel(j) {
  const wrap = h('div');
  if (!j || !j.party || !j.party.length) { wrap.append(h('p', { class: 'hint' }, 'No party yet.')); return wrap; }
  const rep = teamReport(j.party);
  const chip = (t, label, cls) => h('span', { class: `chip ${cls || ''}`, style: { '--chip': TYPE_INFO[t].color } }, label || t);
  const cover = h('div', { class: 'move-chips' }, rep.coverage.map((c) => chip(c.type, `${c.type} ${c.best >= 2 ? '×2' : c.best === 0 ? '×0' : c.best < 1 ? '½' : '·'}`, c.best >= 2 ? 'on' : c.best === 0 ? 'none' : '')));
  const threat = h('div', { class: 'move-chips' }, rep.threats.filter((t) => t.count).map((t) => chip(t.type, `${t.type} ×${t.count}`, t.count >= 3 ? 'none' : '')));
  const styles = h('div', { class: 'move-chips' }, Object.entries(rep.styles).map(([k, n]) => h('span', { class: 'chip' }, `${DAMAGE_TYPES[k] ? DAMAGE_TYPES[k].name : k}: ${n}`)));
  appendChildren(wrap, [
    h('p', { class: 'hint' }, 'What your party of ' + j.party.length + ' can do with the moves it knows right now.'),
    ...section('Coverage', h('p', { class: 'hint' }, rep.strong.length ? `Strong against ${listWords(rep.strong)}.` : 'Nothing your party knows is strong against anything.'), cover,
      rep.blind.length ? h('p', { class: 'hint' }, `Nothing you know touches ${listWords(rep.blind)}.`) : null),
    ...section('What hits back', threat.childNodes.length ? threat : h('p', { class: 'hint' }, 'Nothing on the chart hits your party for double.')),
    ...section('The triangle', h('p', { class: 'hint' }, 'Melee beats Ranged, Ranged beats Magic, Magic beats Melee.'), styles),
  ]);
  return wrap;
}

function owDexSheet() {
  const body = h('div');
  let clade = ow.dexClade || (ow.j && journeyPlace(ow.j).clade) || CLADE_IDS[0];
  let tab = ow.dexTab || 'species';
  const draw = () => {
    clear(body);
    const c = dexCounts(ow.save);
    const tabs = h('div', { class: 'type-filter' }, [['species', 'Species'], ['fusions', 'Fusions'], ['index', 'Index'], ['team', 'Team'], ['rewards', 'Rewards']].map(([id, label]) => h('button', { class: `btn small${tab === id ? ' on' : ''}`, type: 'button', onclick: () => { tab = id; ow.dexTab = id; render(); } }, label)));
    body.append(h('p', { class: 'hint' }, `Caught ${c.caught} and seen ${c.seen} of ${c.total} species${c.morphs ? ` · ${c.morphs} colour morph${c.morphs > 1 ? 's' : ''} caught` : ''} · ${ow.save.totals.fusions + (ow.j ? ow.j.stats.fusions : 0)} fusions made. Every creature you face counts as seen; every one you choose, catch or fuse counts as caught.`), tabs);
    if (tab === 'species') {
      const chips = h('div', { class: 'type-filter' }, CLADE_IDS.map((id) => { const b = c.byClass[id]; return h('button', { class: `btn small${clade === id ? ' on' : ''}`, type: 'button', style: { '--chip': REGIONS[id].accent }, onclick: () => { clade = id; ow.dexClade = id; render(); } }, `${cladeName(id)} ${b.caught}/${b.total}`); }));
      const b = c.byClass[clade];
      const search = h('input', { class: 'dex-search', type: 'search', placeholder: 'Search every class by name…', value: ow.dexQuery || '',
        oninput: (e) => { ow.dexQuery = e.target.value; render(); } });
      const typeChipRow = h('div', { class: 'type-filter' }, ['All', ...TYPE_LIST].map((t) => h('button', { class: `btn small${(ow.dexType || 'All') === t ? ' on' : ''}`, type: 'button', style: t !== 'All' ? { '--chip': TYPE_INFO[t].color } : null, onclick: () => { ow.dexType = t; render(); } }, t)));
      const stateRow = h('div', { class: 'type-filter' }, [['all', 'All'], ['caught', 'Caught'], ['seen', 'Seen only'], ['missing', 'Missing']].map(([id, label]) => h('button', { class: `btn small${(ow.dexState || 'all') === id ? ' on' : ''}`, type: 'button', onclick: () => { ow.dexState = id; render(); } }, label)));
      const filter = { q: ow.dexQuery, type: ow.dexType, state: ow.dexState };
      const searching = Boolean((ow.dexQuery || '').trim()) || (ow.dexType && ow.dexType !== 'All') || (ow.dexState && ow.dexState !== 'all');
      appendChildren(body, [chips, search, typeChipRow, stateRow,
        h('p', { class: 'hint' }, searching
          ? 'Searching every class. Clear the box and the filters to go back to one at a time.'
          : `${cladeName(clade)}s of the ${REGIONS[clade].name}: ${b.caught} caught, ${b.seen} seen of ${b.total}. Tap a card for its sheet.`),
        owDexGrid(clade, filter)]);
    } else if (tab === 'index') {
      body.append(owIndexPanel());
    } else if (tab === 'team') {
      body.append(owTeamPanel(ow.j));
    } else if (tab === 'fusions') {
      const fusions = ow.save.collection.filter((e) => e.genome.gen > 0).slice().reverse();
      appendChildren(body, [h('p', { class: 'hint' }, fusions.length ? `${fusions.length} fusion${fusions.length > 1 ? 's' : ''} remembered in the collection, newest first.` : 'No fusions yet. The shrine at the Crossroads fuses two creatures of one class.'), owCollectionGrid(fusions)]);
    } else {
      const list = h('div', { class: 'shop-list' });
      for (const t of dexRewards(ow.save)) {
        list.append(h('div', { class: `shop-row${t.state === 'claimed' ? ' known' : t.state === 'ready' ? ' next' : ''}` },
          h('div', { class: 'shop-info' }, h('b', {}, `${t.caught} species caught`), h('div', { class: 'shop-meta' }, h('span', {}, t.label), h('span', { class: 'shop-tag' }, t.state === 'claimed' ? 'claimed' : t.state === 'ready' ? 'ready' : `${Math.max(0, t.caught - c.caught)} to go`))),
          h('button', { class: `btn small${t.state === 'ready' ? ' primary' : ''}`, type: 'button', disabled: t.state !== 'ready', onclick: () => {
            const r = claimDexReward(ow.save, t.index);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.levelUp(); toast(`Claimed: ${t.label}${t.charm ? ' is in your Bag' : ''}.`); render(); owRefreshHud();
          } }, t.state === 'claimed' ? 'Done' : 'Claim')));
      }
      appendChildren(body, [h('p', { class: 'hint' }, 'Milestones pay out once per save, into the journey you are on.'), list]);
    }
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Fusiondex', body, () => owRefreshHud());
}

/** Grid of everything caught, chosen or fused, newest first. */
function owCollectionGrid(entries) {
  const grid = h('div', { class: 'pool' });
  entries = entries || ow.save.collection.slice().reverse();
  entries.forEach((e, i) => {
    grid.append(h('button', { class: 'pcard', type: 'button', onclick: () => openSheet(e.genome, { nav: { label: 'Collection', index: i, items: entries.map((x) => ({ genome: x.genome })) } }) },
      e.genome.gen ? h('span', { class: 'gen' }, `gen ${e.genome.gen}`) : null,
      creatureEl(e.genome, { size: 104, animate: false }), h('span', {}, e.genome.name)));
  });
  return grid;
}

function owCollectionSheet() {
  const n = ow.save.collection.length;
  owSheet(`Collection · ${n}`, h('div', {}, h('p', { class: 'hint' }, n ? 'Every species and fusion that has travelled with you. Tap one for its sheet and code.' : 'Nothing yet. Creatures you choose, catch or fuse are remembered here, even after a journey ends.'), owCollectionGrid()));
}

/** Born as a species rather than made at the shrine: a starter or something caught in the wild. A fusion
 *  carries no species and a generation above zero, so this is the whole test. */
function neverFused(m) { return Boolean(m && m.genome && speciesOf(m.genome)); }

function owShrineSheet(j) {
  const pick = { a: null, b: null };
  const body = h('div');
  let tab = 'fuse';
  let wildOnly = false;
  const draw = () => {
    clear(body);
    body.append(h('div', { class: 'type-filter' },
      h('button', { class: `btn small${tab === 'fuse' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'fuse'; render(); } }, 'Fuse'),
      h('button', { class: `btn small${tab === 'nature' ? ' on' : ''}`, type: 'button', onclick: () => { tab = 'nature'; render(); } }, 'Natures')));
    if (tab === 'nature') {
      body.append(h('p', { class: 'hint' }, `The shrine will draw a creature a new nature for ${NATURE_REROLL.toLocaleString()} gold. `
        + 'It cannot be chosen and it is never the one it already has, so it is a throw of the dice, not a purchase.'));
      const rows = h('div', { class: 'party-list' });
      for (const m of [...j.party, ...j.box]) {
        const block = natureBlock(m);
        rows.append(owMemberRow(j, m, [
          h('span', { class: 'hint', style: { margin: 0 } }, natureLabel(m.genome.nature)),
          h('button', { class: `btn small${!block && j.gold >= NATURE_REROLL ? ' primary' : ''}`, type: 'button', disabled: Boolean(block) || j.gold < NATURE_REROLL, title: block || '', onclick: () => {
            if (ow.confirmNature !== m.uid) { ow.confirmNature = m.uid; toast('Tap again: the draw cannot be chosen or undone'); setTimeout(() => { if (ow.confirmNature === m.uid) ow.confirmNature = null; }, 4000); return; }
            ow.confirmNature = null;
            const r = rerollNature(j, m.uid);
            if (!r.ok) { toast(r.reason); return; }
            owSave(); sfx.win(); toast(`${r.member.genome.name}: ${natureLabel(r.from)} → ${natureLabel(r.to)}.`);
            render(); owRefreshHud();
          } }, `Draw ◆ ${NATURE_REROLL.toLocaleString()}`),
        ]));
      }
      body.append(rows);
      return;
    }
    const all = [...j.party, ...j.box];
    const anchor = pick.a || pick.b;
    const isPicked = (m) => pick.a === m.uid || pick.b === m.uid;
    // Once one is chosen the pool narrows to what can actually pair with it — a fusion needs two of the same
    // class, and canFuseJourney also rules out anything locked. Unchoose it and the whole pool comes back.
    const canPair = (m) => !anchor || canFuseJourney(j, anchor, m.uid).ok;
    // Whatever either filter says, a creature you have already chosen stays on the board: hiding half of a
    // pair you picked, and leaving it picked, would be a nasty little trap.
    const shown = all.filter((m) => isPicked(m) || (canPair(m) && (!wildOnly || neverFused(m))));
    const hidden = all.length - shown.length;
    const list = h('div', { class: 'pool' });
    for (const m of shown) {
      const tag = pick.a === m.uid ? 'A' : pick.b === m.uid ? 'B' : null;
      const off = Boolean(m.locked) && !tag; // only reachable before a pick: after one, a locked creature is filtered out
      list.append(h('button', { class: `pcard${tag === 'A' ? ' is-a' : tag === 'B' ? ' is-b' : off ? ' is-off' : ''}`, type: 'button', onclick: () => {
        if (off) { toast(`${m.genome.name} is locked. Unlock it in Info first.`); return; }
        if (pick.a === m.uid) pick.a = null; else if (pick.b === m.uid) pick.b = null; else if (!pick.a) pick.a = m.uid; else pick.b = m.uid;
        render();
      } }, tag ? h('span', { class: `sel badge ${tag.toLowerCase()}` }, tag) : null, h('span', { class: 'gen' }, cladeName(cladeOf(m.genome))), creatureEl(m.genome, { size: 104, animate: false, level: m.level }), h('span', {}, `${m.genome.name} · Lv ${m.level}`)));
    }
    const child = pick.a && pick.b ? previewShrineFusion(j, pick.a, pick.b) : null;
    const wildCount = all.filter(neverFused).length;
    const anchorName = anchor ? (all.find((m) => m.uid === anchor) || { genome: {} }).genome.name : null;
    const partners = shown.filter((m) => !isPicked(m)).length;
    const count = anchor
      ? `${partners} can pair with ${anchorName}${hidden ? `, ${hidden} hidden` : ''}`
      : wildOnly ? `${wildCount} of ${all.length} never fused${hidden ? `, ${hidden} hidden` : ''}` : `${all.length} to choose from`;
    const empty = anchor
      ? `Nothing ${wildOnly ? 'born as a species ' : ''}can pair with ${anchorName}. A fusion needs two of the same class.`
      : wildCount ? 'Nothing here but fusions.' : 'Nothing you own was born as a species.';
    appendChildren(body, [
      h('p', { class: 'hint' }, 'The shrine fuses two creatures of the same class into one. Both are consumed; the child keeps the higher level at full health.'),
      h('div', { class: 'type-filter' },
        h('button', { class: `btn small${wildOnly ? ' on' : ''}`, type: 'button', 'aria-pressed': wildOnly ? 'true' : 'false',
          title: 'Show only creatures born as a species — a starter, or something caught. Anything the shrine has already made is hidden.',
          onclick: () => { wildOnly = !wildOnly; render(); } }, `Wild only${wildOnly ? ' ✓' : ''}`),
        anchor ? h('button', { class: 'btn small', type: 'button', onclick: () => { pick.a = null; pick.b = null; render(); } }, 'Clear') : null,
        h('span', { class: 'hint', style: { margin: 0, alignSelf: 'center' } }, count)),
      partners || !anchor ? null : h('p', { class: 'hint' }, empty),
      shown.length ? list : h('p', { class: 'hint' }, empty),
      child ? h('div', { class: 'result' },
        h('div', { class: 'sheet-head' }, h('h2', {}, child.name), typeChips(child.types)),
        h('p', { class: 'meta' }, `gen ${child.gen} · ${child.parents.join(' × ')}`),
        h('div', { class: 'hero' }, creatureEl(child, { size: 240, fit: true })),
        h('div', { class: 'row wrap' },
          h('button', { class: 'btn primary', type: 'button', onclick: () => {
            const { child: member, quests } = shrineFuse(j, pick.a, pick.b);
            recordCollection(ow.save, member.genome);
            owSave(); toast(`${member.genome.name} is born!${quests && quests.length ? ' A notice is done: claim it at the board.' : ''}`); pick.a = null; pick.b = null; render();
          } }, 'Fuse them'),
          h('button', { class: 'btn', type: 'button', onclick: () => openSheet(child) }, 'Details'))) : null,
    ]);
  };
  const render = () => owKeepScroll(body, draw);
  render();
  owSheet('Fusion shrine', body, () => owRefreshHud());
}

// ---- the map renderer ------------------------------------------------------------

function owHash(x, y) { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); }
const owEase = (t) => t;

function owPlayerPx() {
  const j = ow.j, T = ow.tilePx;
  if (!ow.tween) return { x: j.player.x * T, y: j.player.y * T };
  const k = owEase(ow.tween.t);
  return { x: (ow.tween.from.x + (ow.tween.to.x - ow.tween.from.x) * k) * T, y: (ow.tween.from.y + (ow.tween.to.y - ow.tween.from.y) * k) * T };
}

function owCamera() {
  const T = ow.tilePx, p = owPlayerPx();
  const maxX = ow.world.w * T - ow.cssW, maxY = ow.world.h * T - ow.cssH;
  return { x: Math.max(0, Math.min(maxX, p.x + T / 2 - ow.cssW / 2)), y: Math.max(0, Math.min(maxY, p.y + T / 2 - ow.cssH / 2)) };
}

function owFrame(ts) {
  if (!ow.canvas || !ow.canvas.isConnected) { ow.raf = 0; return; }
  const dt = Math.min(64, ts - (ow.last || ts));
  ow.last = ts;
  if (ow.tween) {
    ow.tween.t = Math.min(1, ow.tween.t + dt / MOVE_MS);
    ow.bob += dt;
    if (ow.tween.t >= 1) { const ev = ow.tween.event; ow.tween = null; owAfterStep(ev); }
  } else if (ow.held && !ow.dialog) owStep(ow.held);
  owDraw(ts);
  ow.raf = requestAnimationFrame(owFrame);
}

function owRoundRect(ctx, x, y, w, h_, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h_ - r); ctx.quadraticCurveTo(x + w, y + h_, x + w - r, y + h_);
  ctx.lineTo(x + r, y + h_); ctx.quadraticCurveTo(x, y + h_, x, y + h_ - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function owFigure(ctx, px, py, T, cloth, hat, dir, bob) {
  const s = T / 32, cx = px + T / 2, base = py + T - 3 * s;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, base, 9 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
  const by = base - bob;
  ctx.fillStyle = '#2b2530'; ctx.fillRect(cx - 6 * s, by - 9 * s, 5 * s, 9 * s); ctx.fillRect(cx + 1 * s, by - 9 * s, 5 * s, 9 * s);
  ctx.fillStyle = cloth; owRoundRect(ctx, cx - 8 * s, by - 22 * s, 16 * s, 14 * s, 4 * s); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cx - 8 * s, by - 12 * s, 16 * s, 3 * s);
  ctx.fillStyle = '#f1c9a5'; ctx.beginPath(); ctx.arc(cx, by - 27 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hat; ctx.beginPath(); ctx.arc(cx, by - 29 * s, 7.5 * s, Math.PI, 0); ctx.fill(); ctx.fillRect(cx - 9.5 * s, by - 30 * s, 19 * s, 2.5 * s);
  if (dir !== 'up') { const ex = dir === 'left' ? -2.5 * s : dir === 'right' ? 2.5 * s : 0; ctx.fillStyle = '#222'; ctx.fillRect(cx + ex - 3 * s, by - 27 * s, 2 * s, 2 * s); ctx.fillRect(cx + ex + 1 * s, by - 27 * s, 2 * s, 2 * s); }
}

function owDrawWall(ctx, kind, color, x, y, T, hsh) {
  const s = T / 32;
  if (kind === 'tree' || kind === 'hedge') {
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x + T / 2 - 2 * s, y + T * 0.6, 4 * s, T * 0.35);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x + T / 2, y + T * 0.42, T * (kind === 'hedge' ? 0.36 : 0.4), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(x + T * 0.4, y + T * 0.32, T * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'pine') {
    ctx.fillStyle = '#3b2d24'; ctx.fillRect(x + T / 2 - 2 * s, y + T * 0.7, 4 * s, T * 0.25);
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + T / 2, y + T * 0.05); ctx.lineTo(x + T * 0.9, y + T * 0.78); ctx.lineTo(x + T * 0.1, y + T * 0.78); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(x + T / 2, y + T * 0.05); ctx.lineTo(x + T * 0.62, y + T * 0.5); ctx.lineTo(x + T * 0.42, y + T * 0.5); ctx.closePath(); ctx.fill();
  } else if (kind === 'palm') {
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x + T * 0.5, y + T * 0.95); ctx.quadraticCurveTo(x + T * 0.6, y + T * 0.5, x + T * 0.55, y + T * 0.25); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round';
    for (const a of [-2.6, -1.8, -1.1, -0.4, 0.4]) { ctx.beginPath(); ctx.moveTo(x + T * 0.55, y + T * 0.25); ctx.quadraticCurveTo(x + T * 0.55 + Math.cos(a) * T * 0.3, y + T * 0.25 + Math.sin(a) * T * 0.1 + T * 0.05, x + T * 0.55 + Math.cos(a) * T * 0.45, y + T * 0.25 + Math.sin(a) * T * 0.25 + T * 0.15); ctx.stroke(); }
    ctx.lineCap = 'butt';
  } else if (kind === 'reed') {
    ctx.strokeStyle = color; ctx.lineWidth = 2 * s;
    for (let i = 0; i < 3; i++) { const rx = x + T * (0.25 + i * 0.25) + (hsh - 0.5) * 3 * s; ctx.beginPath(); ctx.moveTo(rx, y + T * 0.95); ctx.lineTo(rx + 2 * s, y + T * (0.15 + i * 0.08)); ctx.stroke(); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(rx + 0.5 * s, y + T * (0.12 + i * 0.08), 3 * s, 7 * s); }
  } else if (kind === 'bone') {
    // a rib arch: two curved bones meeting at the top, a smaller one inside
    ctx.strokeStyle = color; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + T * 0.2, y + T * 0.9); ctx.quadraticCurveTo(x + T * 0.15, y + T * 0.3, x + T * 0.5, y + T * 0.15); ctx.quadraticCurveTo(x + T * 0.85, y + T * 0.3, x + T * 0.8, y + T * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + T * 0.36, y + T * 0.9); ctx.quadraticCurveTo(x + T * 0.36, y + T * 0.55, x + T * 0.5, y + T * 0.45); ctx.quadraticCurveTo(x + T * 0.64, y + T * 0.55, x + T * 0.64, y + T * 0.9); ctx.stroke();
    ctx.lineCap = 'butt';
  } else if (kind === 'crystal') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + T * 0.2, y + T * 0.9); ctx.lineTo(x + T * 0.3, y + T * 0.35); ctx.lineTo(x + T * 0.45, y + T * 0.08); ctx.lineTo(x + T * 0.6, y + T * 0.4); ctx.lineTo(x + T * 0.85, y + T * 0.25); ctx.lineTo(x + T * 0.8, y + T * 0.9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(x + T * 0.3, y + T * 0.35); ctx.lineTo(x + T * 0.45, y + T * 0.08); ctx.lineTo(x + T * 0.47, y + T * 0.6); ctx.closePath(); ctx.fill();
  } else if (kind === 'root') {
    ctx.strokeStyle = color; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + T * 0.1, y + T * 0.2); ctx.bezierCurveTo(x + T * 0.5, y + T * 0.1, x + T * 0.4, y + T * 0.8, x + T * 0.9, y + T * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + T * 0.2, y + T * 0.9); ctx.bezierCurveTo(x + T * 0.3, y + T * 0.5, x + T * 0.7, y + T * 0.6, x + T * 0.8, y + T * 0.15); ctx.stroke();
    ctx.lineCap = 'butt';
  } else if (kind === 'ember') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + T * 0.12, y + T * 0.88); ctx.lineTo(x + T * 0.2, y + T * 0.4); ctx.lineTo(x + T * 0.45, y + T * 0.12); ctx.lineTo(x + T * 0.7, y + T * 0.3); ctx.lineTo(x + T * 0.9, y + T * 0.55); ctx.lineTo(x + T * 0.86, y + T * 0.88); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,122,26,.9)'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x + T * 0.3, y + T * 0.85); ctx.lineTo(x + T * 0.42, y + T * 0.6); ctx.lineTo(x + T * 0.36, y + T * 0.45); ctx.lineTo(x + T * 0.5, y + T * 0.25); ctx.stroke();
  } else if (kind === 'grave') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + T * 0.25, y + T * 0.9); ctx.lineTo(x + T * 0.25, y + T * 0.38); ctx.arc(x + T * 0.5, y + T * 0.38, T * 0.25, Math.PI, 0); ctx.lineTo(x + T * 0.75, y + T * 0.9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + T * 0.37, y + T * 0.45, T * 0.26, 2 * s); ctx.fillRect(x + T * 0.4, y + T * 0.58, T * 0.2, 2 * s);
  } else {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + T * 0.15, y + T * 0.85); ctx.lineTo(x + T * 0.25, y + T * 0.35); ctx.lineTo(x + T * 0.55, y + T * 0.15); ctx.lineTo(x + T * 0.88, y + T * 0.45); ctx.lineTo(x + T * 0.85, y + T * 0.85); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(x + T * 0.25, y + T * 0.35); ctx.lineTo(x + T * 0.55, y + T * 0.15); ctx.lineTo(x + T * 0.62, y + T * 0.4); ctx.closePath(); ctx.fill();
  }
}

function owDraw(ts) {
  const ctx = ow.ctx, j = ow.j, world = ow.world, T = ow.tilePx;
  if (!ctx || !j) return;
  ctx.setTransform(ow.dpr, 0, 0, ow.dpr, 0, 0);
  ctx.fillStyle = '#0d0e14'; ctx.fillRect(0, 0, ow.cssW, ow.cssH);
  const cam = owCamera();
  const x0 = Math.max(0, Math.floor(cam.x / T)), y0 = Math.max(0, Math.floor(cam.y / T));
  const x1 = Math.min(world.w - 1, Math.ceil((cam.x + ow.cssW) / T)), y1 = Math.min(world.h - 1, Math.ceil((cam.y + ow.cssH) / T) + 1);
  const s = T / 32;
  const deferred = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * world.w + x, t = world.tiles[i], region = REGIONS[world.biomes[world.bio[i]].clade];
      const px = x * T - cam.x, py = y * T - cam.y, hsh = owHash(x, y);
      let ground = hsh > 0.5 ? region.ground : region.ground2;
      if (t === TILE.hub || t === TILE.shrine || t === TILE.spireDoor || t === TILE.board || t === TILE.camp && isHubTile(world, x, y)) ground = (x + y) % 2 ? HUB.paving : HUB.ground;
      else if (t === TILE.path || t === TILE.door) ground = region.path;
      else if (t === TILE.water) ground = region.water;
      else if (t === TILE.habitat) ground = region.habitat;
      else if (t === TILE.lair || t === TILE.spire || t === TILE.market || t === TILE.storage || t === TILE.tower || t === TILE.bounty || t === TILE.rookery) ground = '#2a2731';
      ctx.fillStyle = ground; ctx.fillRect(px, py, T + 0.5, T + 0.5);
      if (t === TILE.grass && hsh > 0.6) { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(px + T * 0.3, py + T * 0.7); ctx.lineTo(px + T * 0.35, py + T * 0.5); ctx.moveTo(px + T * 0.62, py + T * 0.6); ctx.lineTo(px + T * 0.66, py + T * 0.42); ctx.stroke(); }
      else if (t === TILE.habitat) {
        const type = habitatTypeAt(world, x, y), color = type && TYPE_INFO[type] ? TYPE_INFO[type].color : '#fff';
        ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) { const hx = px + T * (0.2 + 0.3 * k) + (owHash(x + k, y) - 0.5) * 6 * s, hy = py + T * (0.85 - 0.1 * (k % 2)); ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 1.5 * s, hy - T * 0.32); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.lineCap = 'butt';
      } else if (t === TILE.water) {
        ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.5 * s; ctx.beginPath();
        const wy = py + T * 0.45 + Math.sin(ts / 700 + x * 1.7 + y) * 2 * s; ctx.moveTo(px + T * 0.15, wy); ctx.quadraticCurveTo(px + T * 0.4, wy - 3 * s, px + T * 0.6, wy); ctx.quadraticCurveTo(px + T * 0.75, wy + 2 * s, px + T * 0.88, wy - 1 * s); ctx.stroke();
      } else if (t === TILE.path) { ctx.fillStyle = 'rgba(0,0,0,.06)'; if (hsh > 0.7) ctx.fillRect(px + T * 0.3, py + T * 0.4, 3 * s, 2 * s); }
      else if (t === TILE.wall) owDrawWall(ctx, region.wall, region.wallColor, px, py, T, hsh);
      else if (t === TILE.camp) {
        ctx.fillStyle = '#c9b27b'; ctx.beginPath(); ctx.moveTo(px + T * 0.1, py + T * 0.72); ctx.lineTo(px + T * 0.42, py + T * 0.22); ctx.lineTo(px + T * 0.74, py + T * 0.72); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6b4b2a'; ctx.beginPath(); ctx.moveTo(px + T * 0.32, py + T * 0.72); ctx.lineTo(px + T * 0.42, py + T * 0.5); ctx.lineTo(px + T * 0.52, py + T * 0.72); ctx.closePath(); ctx.fill();
        const fl = 0.7 + 0.3 * Math.sin(ts / 120 + x); ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.arc(px + T * 0.82, py + T * 0.8, T * 0.09 * fl, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(px + T * 0.82, py + T * 0.78, T * 0.045 * fl, 0, Math.PI * 2); ctx.fill();
      } else if (t === TILE.shrine) {
        ctx.fillStyle = '#f5c518'; ctx.beginPath(); ctx.moveTo(px + T / 2, py + T * 0.12); ctx.lineTo(px + T * 0.78, py + T / 2); ctx.lineTo(px + T / 2, py + T * 0.88); ctx.lineTo(px + T * 0.22, py + T / 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, T * 0.1, 0, Math.PI * 2); ctx.fill();
      } else if (t === TILE.door || t === TILE.spireDoor || t === TILE.marketDoor || t === TILE.storageDoor || t === TILE.towerDoor || t === TILE.bountyDoor || t === TILE.rookeryDoor) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + T * 0.2, py + T * 0.3, T * 0.6, T * 0.4); }
      else if (t === TILE.board) {
        // the notice board: two posts, a straw-coloured panel and three pinned slips
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(px + T * 0.15, py + T * 0.82, T * 0.7, 3 * s);
        ctx.fillStyle = '#5b3a22'; ctx.fillRect(px + T * 0.2, py + T * 0.35, 3 * s, T * 0.5); ctx.fillRect(px + T * 0.8 - 3 * s, py + T * 0.35, 3 * s, T * 0.5);
        ctx.fillStyle = '#7a5230'; ctx.fillRect(px + T * 0.1, py + T * 0.12, T * 0.8, T * 0.5);
        ctx.fillStyle = '#e0c86f'; ctx.fillRect(px + T * 0.14, py + T * 0.16, T * 0.72, T * 0.42);
        ctx.fillStyle = '#fff7e0'; ctx.fillRect(px + T * 0.2, py + T * 0.22, T * 0.18, T * 0.26); ctx.fillRect(px + T * 0.42, py + T * 0.2, T * 0.18, T * 0.3); ctx.fillRect(px + T * 0.64, py + T * 0.24, T * 0.16, T * 0.24);
        ctx.fillStyle = '#c23b3b'; ctx.fillRect(px + T * 0.27, py + T * 0.2, 2 * s, 2 * s); ctx.fillRect(px + T * 0.49, py + T * 0.18, 2 * s, 2 * s); ctx.fillRect(px + T * 0.7, py + T * 0.22, 2 * s, 2 * s);
      }
      if (t === TILE.lair || t === TILE.spire) deferred.push({ x, y, t, region, px, py });
    }
  }
  // buildings on top of their blocks
  for (const b of world.biomes) {
    const L = b.lair, region = REGIONS[b.clade];
    if (L.x + 1 < x0 || L.x - 1 > x1 || L.y + 1 < y0 || L.y - 1 > y1) continue;
    const bx = (L.x - 1) * T - cam.x, by = (L.y - 1) * T - cam.y, W = 3 * T;
    // seen from above: dark walls, a roof in the region's colour with ridge lines, and a gate on the road side
    ctx.fillStyle = '#2a2731'; ctx.fillRect(bx + 1 * s, by + 1 * s, W - 2 * s, W - 2 * s);
    ctx.fillStyle = region.accent; ctx.fillRect(bx + 5 * s, by + 5 * s, W - 10 * s, W - 10 * s);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(bx + 5 * s, by + 5 * s, W - 10 * s, 4 * s); ctx.fillRect(bx + 5 * s, by + 5 * s, 4 * s, W - 10 * s);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(bx + W / 2 - 1.5 * s, by + 5 * s, 3 * s, W - 10 * s); ctx.fillRect(bx + 5 * s, by + W / 2 - 1.5 * s, W - 10 * s, 3 * s);
    const g = 6 * s, gw = T * 0.5;
    ctx.fillStyle = j.badges.includes(b.id) ? '#ffd166' : '#14151c';
    if (L.side === 'up') owRoundRect(ctx, bx + W / 2 - gw / 2, by + 1 * s, gw, g, 2 * s);
    else if (L.side === 'down') owRoundRect(ctx, bx + W / 2 - gw / 2, by + W - 1 * s - g, gw, g, 2 * s);
    else if (L.side === 'left') owRoundRect(ctx, bx + 1 * s, by + W / 2 - gw / 2, g, gw, 2 * s);
    else owRoundRect(ctx, bx + W - 1 * s - g, by + W / 2 - gw / 2, g, gw, 2 * s);
    ctx.fill();
  }
  {
    const sx = (world.hub.x - 1) * T - cam.x, sy = (world.hub.y - 7) * T - cam.y;
    if (sx + 3 * T > 0 && sx < ow.cssW && sy + 2 * T > 0 && sy < ow.cssH + T) {
      ctx.fillStyle = '#4a4560'; ctx.fillRect(sx + 3 * s, sy - T * 0.4, 3 * T - 6 * s, 2.4 * T);
      ctx.fillStyle = '#6a63a0'; ctx.fillRect(sx + T * 0.8, sy - T * 1.6, 1.4 * T, 1.3 * T);
      ctx.fillStyle = '#b98cff'; ctx.beginPath(); ctx.moveTo(sx + T * 0.7, sy - T * 1.6); ctx.lineTo(sx + 1.5 * T, sy - T * 2.6); ctx.lineTo(sx + T * 2.3, sy - T * 1.6); ctx.closePath(); ctx.fill();
      const glow = 0.5 + 0.5 * Math.sin(ts / 600); ctx.fillStyle = `rgba(255,241,168,${0.5 + glow * 0.5})`; ctx.beginPath(); ctx.arc(sx + 1.5 * T, sy - T * 2.5, 3 * s, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < 3; k++) { ctx.fillStyle = '#ffe9a8'; ctx.fillRect(sx + T * (0.5 + k * 0.9), sy + T * 0.3, 5 * s, 8 * s); }
    }
  }
  {
    // the Market: a timber shop with a striped awning over the square-side door and a coin sign
    const m = world.market, mx = (m.x - 1) * T - cam.x, my = m.y * T - cam.y, W = 3 * T, H = 2 * T;
    if (mx + W > 0 && mx < ow.cssW && my + H + T > 0 && my < ow.cssH) {
      ctx.fillStyle = '#7a5230'; ctx.fillRect(mx + 2 * s, my + 2 * s, W - 4 * s, H - 2 * s);
      ctx.fillStyle = '#5b3a22'; ctx.fillRect(mx + 2 * s, my + 2 * s, W - 4 * s, T * 0.5);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#f4e7c9' : '#d94f4f'; ctx.fillRect(mx + (W * k) / 6, my + H - T * 0.45, W / 6 + 0.5, T * 0.55); }
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(mx, my + H + T * 0.1, W, 3 * s);
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(mx + T * 0.45, my + T * 0.75, 7 * s, 8 * s); ctx.fillRect(mx + W - T * 0.45 - 7 * s, my + T * 0.75, 7 * s, 8 * s);
      ctx.fillStyle = '#f5c518'; ctx.beginPath(); ctx.arc(mx + W / 2, my + T * 0.3, T * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a5230'; ctx.font = `bold ${Math.round(T * 0.3)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('◆', mx + W / 2, my + T * 0.31);
    }
  }
  {
    // Creature Storage: a stone house with a teal roof, shuttered windows and a crate sign
    const st = world.storage, sx2 = (st.x - 1) * T - cam.x, sy2 = st.y * T - cam.y, W = 3 * T, H = 2 * T;
    if (sx2 + W > 0 && sx2 < ow.cssW && sy2 + H + T > 0 && sy2 < ow.cssH) {
      ctx.fillStyle = '#5c6b7a'; ctx.fillRect(sx2 + 2 * s, sy2 + 2 * s, W - 4 * s, H - 2 * s);
      ctx.fillStyle = '#2f7f74'; ctx.fillRect(sx2, sy2, W, T * 0.7);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(sx2, sy2 + T * 0.7, W, 3 * s);
      ctx.fillStyle = '#243a44'; ctx.fillRect(sx2 + T * 0.4, sy2 + T * 0.95, 8 * s, 9 * s); ctx.fillRect(sx2 + W - T * 0.4 - 8 * s, sy2 + T * 0.95, 8 * s, 9 * s);
      ctx.fillStyle = '#9fe8d8'; ctx.fillRect(sx2 + W / 2 - 7 * s, sy2 + T * 0.9, 14 * s, 11 * s);
      ctx.fillStyle = '#2f7f74'; ctx.fillRect(sx2 + W / 2 - 5 * s, sy2 + T * 0.9 + 2 * s, 10 * s, 7 * s);
      ctx.fillStyle = '#9fe8d8'; ctx.fillRect(sx2 + W / 2 - 1 * s, sy2 + T * 0.9 + 2 * s, 2 * s, 7 * s); ctx.fillRect(sx2 + W / 2 - 5 * s, sy2 + T * 0.9 + 4.5 * s, 10 * s, 2 * s);
    }
  }
  {
    // the Battle Tower: a tall stone keep with battlements, a lit arch over the square-side door and an orange banner
    const tw = world.tower, tx = (tw.x - 1) * T - cam.x, ty = tw.y * T - cam.y, W = 3 * T, H = 2 * T, rise = T * 1.6;
    if (tx + W > 0 && tx < ow.cssW && ty + H + T > 0 && ty - rise < ow.cssH) {
      ctx.fillStyle = '#4a4553'; ctx.fillRect(tx + 2 * s, ty - rise, W - 4 * s, H + rise - 2 * s);
      ctx.fillStyle = '#5c5766'; ctx.fillRect(tx + 2 * s, ty - rise, W - 4 * s, T * 0.35);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = '#3a3542'; ctx.fillRect(tx + 2 * s + (k * (W - 4 * s)) / 4 + 3 * s, ty - rise - T * 0.35, (W - 4 * s) / 4 - 6 * s, T * 0.35); }
      ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 1; k < 4; k++) ctx.fillRect(tx + 2 * s, ty - rise + k * T * 0.8, W - 4 * s, 2 * s);
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(tx + T * 0.55, ty - rise + T * 0.6, 5 * s, 8 * s); ctx.fillRect(tx + W - T * 0.55 - 5 * s, ty - rise + T * 0.6, 5 * s, 8 * s); ctx.fillRect(tx + W / 2 - 2.5 * s, ty - rise + T * 1.4, 5 * s, 8 * s);
      ctx.fillStyle = '#ff9f43'; ctx.fillRect(tx + W / 2 - 6 * s, ty - rise + T * 0.2, 12 * s, T * 0.9); ctx.fillStyle = '#2a1f1a'; ctx.font = `bold ${Math.round(T * 0.42)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VI', tx + W / 2, ty - rise + T * 0.65);
      ctx.fillStyle = '#2a2731'; ctx.beginPath(); ctx.arc(tx + W / 2, ty - T * 0.1, T * 0.42, Math.PI, 0); ctx.lineTo(tx + W / 2 + T * 0.42, ty + T * 0.3); ctx.lineTo(tx + W / 2 - T * 0.42, ty + T * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(tx, ty + H, W, 3 * s);
    }
  }
  {
    // the Bounty Office: a low pink-roofed house with a wanted poster by the square-side door and a coin scale sign
    const bo = world.bounty, bx = (bo.x - 1) * T - cam.x, by = bo.y * T - cam.y, W = 3 * T, H = 2 * T;
    if (bx + W > 0 && bx < ow.cssW && by + H + T > 0 && by - T < ow.cssH) {
      ctx.fillStyle = '#6b5a5e'; ctx.fillRect(bx + 2 * s, by + 2 * s, W - 4 * s, H - 2 * s);
      ctx.fillStyle = '#c95a8a'; ctx.fillRect(bx, by - T * 0.25, W, T * 0.75);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(bx, by + T * 0.5, W, 3 * s);
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(bx + T * 0.4, by + T * 0.85, 7 * s, 8 * s); ctx.fillRect(bx + W - T * 0.4 - 7 * s, by + T * 0.85, 7 * s, 8 * s);
      ctx.fillStyle = '#fff7e0'; ctx.fillRect(bx + W / 2 - 8 * s, by + T * 0.8, 16 * s, 14 * s);
      ctx.fillStyle = '#c23b3b'; ctx.fillRect(bx + W / 2 - 6 * s, by + T * 0.8 + 2 * s, 12 * s, 2 * s); ctx.fillRect(bx + W / 2 - 6 * s, by + T * 0.8 + 6 * s, 12 * s, 1.5 * s); ctx.fillRect(bx + W / 2 - 6 * s, by + T * 0.8 + 9 * s, 8 * s, 1.5 * s);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(bx, by + H, W, 3 * s);
    }
  }
  // tap target
  if (ow.target) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ow.target.x * T - cam.x + T / 2, ow.target.y * T - cam.y + T / 2, T * 0.3, 0, Math.PI * 2); ctx.stroke(); }
  // trainers and the player, sorted by row so nearer figures draw on top
  const figures = [];
  for (const t of world.trainers) if (t.x >= x0 - 1 && t.x <= x1 + 1 && t.y >= y0 - 1 && t.y <= y1 + 1) figures.push({ y: t.y, trainer: t });
  const pp = owPlayerPx();
  figures.push({ y: pp.y / T, player: true });
  figures.sort((a, b) => a.y - b.y);
  for (const f of figures) {
    if (f.player) { owFigure(ctx, pp.x - cam.x, pp.y - cam.y, T, '#f5c518', '#5a3d2b', j.player.dir, ow.tween ? Math.abs(Math.sin(ow.bob / 60)) * 2 * s : 0); continue; }
    const t = f.trainer, lead = t.team[0].genome, color = TYPE_INFO[lead.types[0]] ? TYPE_INFO[lead.types[0]].color : '#999';
    const px = t.x * T - cam.x, py = t.y * T - cam.y;
    owFigure(ctx, px, py, T, j.beaten[t.id] ? '#8f96a8' : color, '#2f2a3a', t.dir, 0);
    const near = Math.abs(t.x - j.player.x) + Math.abs(t.y - j.player.y) === 1;
    if (near && !ow.tween) {
      ctx.fillStyle = '#fff'; owRoundRect(ctx, px + T * 0.3, py - T * 0.55, T * 0.4, T * 0.42, 3 * s); ctx.fill();
      ctx.fillStyle = '#222'; ctx.font = `bold ${Math.round(T * 0.34)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(j.beaten[t.id] ? '…' : '!', px + T * 0.5, py - T * 0.33);
    }
  }
  // soft vignette
  const g = ctx.createRadialGradient(ow.cssW / 2, ow.cssH / 2, Math.min(ow.cssW, ow.cssH) * 0.45, ow.cssW / 2, ow.cssH / 2, Math.max(ow.cssW, ow.cssH) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, ow.cssW, ow.cssH);
}
