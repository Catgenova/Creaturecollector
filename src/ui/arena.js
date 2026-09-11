// Endless Arena: the game loop. Starter -> floors of wild, trainer and boss
// encounters -> capture, level up, fuse at altars -> run ends on a wipe.
import { h, clear, toast, copyText, appendChildren } from './dom.js';
import { creatureEl, typeChips, section, stageBadge } from './common.js';
import { freshSeed } from '../core/rng.js';
import { openSheet } from './lab.js';
import { mountFight, xpRow } from './fight.js';
import { STATUS_INFO } from '../battle/engine.js';
import { stageOf, stageName } from '../data/evolution.js';
import { loadSave, persistSave, exportSave, importSave, emptySave, clearSave, recordCollection, endRun } from '../game/save.js';
import { ARENA, floorLevel, newRun, chooseStarter, buildBattle, applyBattle, previewFusion, fuseMembers, skipAltar, moveMember, setLead, memberMaxHp, xpProgress, canFight, learnMove, biomeFor, canFuseMembers } from '../game/run.js';
import { cladeName } from '../data/clades.js';
import { cladeOf, elementalOf } from '../creature/genome.js';
import { getMove } from '../data/moves.js';
import { TYPE_INFO } from '../data/types.js';
import { addToPool } from './state.js';

const ar = { save: null, root: null, fight: null, altar: null, starterPick: -1, confirmReset: false, showReport: true };

function save() { if (!persistSave(ar.save)) toast('Could not save (storage blocked?)'); }

export function renderArenaScreen(root) {
  ar.root = root;
  if (!ar.save) ar.save = loadSave();
  if (ar.fight) { ar.fight.destroy(); ar.fight = null; }
  clear(root);
  const run = ar.save.run;
  if (!run) return homeView(root);
  if (run.phase === 'starter') return starterView(root, run);
  if (run.phase === 'gameover') return gameOverView(root, run);
  if (ar.altar) return altarView(root, run);
  return floorView(root, run);
}

// ---- home -------------------------------------------------------------------

function tile(label, value) { return h('div', { class: 'tile' }, h('b', {}, String(value)), h('span', {}, label)); }

function homeView(root) {
  const s = ar.save;
  const rerender = () => renderArenaScreen(root);
  const importInput = h('input', { class: 'seed code-in', type: 'text', placeholder: 'Paste a save code (CCSAVE1....)', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Save code' });
  root.append(
    h('div', { class: 'hero-card' },
      h('h2', {}, 'Endless Arena'),
      h('p', { class: 'hint' }, 'Climb floors of wild creatures, trainers and wardens. Catch what you weaken, fuse what you catch, and see how deep you get before your party falls.'),
      h('div', { class: 'tiles' }, tile('best floor', s.best.floor), tile('runs', s.best.runs), tile('caught', s.totals.captures), tile('fused', s.totals.fusions)),
      h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => { ar.save.run = newRun(freshSeed()); ar.starterPick = -1; save(); rerender(); } }, 'New run')),
  );
  if (s.collection.length) {
    const grid = h('div', { class: 'pool' });
    for (const e of s.collection.slice().reverse()) {
      grid.append(h('button', { class: 'pcard', type: 'button', onclick: () => openSheet(e.genome) },
        e.genome.gen ? h('span', { class: 'gen' }, `gen ${e.genome.gen}`) : null,
        creatureEl(e.genome, { size: 104, animate: false }), h('span', {}, e.genome.name)));
    }
    root.append(...section(`Collection · ${s.collection.length}`, h('p', { class: 'hint' }, 'Every species and fusion that has been on your team. Tap for details, or send one to the Fusion Lab from its sheet.'), grid));
  }
  root.append(...section('Save',
    h('div', { class: 'toolbar' },
      h('button', { class: 'btn', type: 'button', onclick: async () => toast((await copyText(exportSave(ar.save))) ? 'Save code copied' : 'Copy failed') }, 'Export'),
      h('button', { class: `btn${ar.confirmReset ? ' danger' : ''}`, type: 'button', onclick: () => {
        if (!ar.confirmReset) { ar.confirmReset = true; toast('Tap again to erase everything'); rerender(); setTimeout(() => { ar.confirmReset = false; if (root.isConnected) rerender(); }, 4000); return; }
        ar.save = emptySave(); clearSave(); ar.confirmReset = false; toast('Save erased'); rerender();
      } }, ar.confirmReset ? 'Really erase?' : 'Erase save')),
    h('div', { class: 'toolbar' }, importInput,
      h('button', { class: 'btn', type: 'button', onclick: () => {
        try { ar.save = importSave(importInput.value); save(); toast('Save loaded'); rerender(); } catch (e) { toast(e.message); }
      } }, 'Import')),
    h('p', { class: 'hint' }, 'Progress autosaves in this browser. Export gives you a code to move it elsewhere.')));
}

// ---- starter ----------------------------------------------------------------

function starterView(root, run) {
  const rerender = () => renderArenaScreen(root);
  const cards = h('div', { class: 'starters' });
  run.starters.forEach((g, i) => cards.append(h('button', { class: `pslot${ar.starterPick === i ? ' filled' : ''}`, type: 'button', onclick: () => { ar.starterPick = i; rerender(); } },
    creatureEl(g, { size: 150, animate: true }), h('b', {}, g.name), typeChips(g.types),
    h('span', { class: 'hint', style: { margin: 0 } }, `Lv ${ARENA.starterLevel}`))));
  const pick = run.starters[ar.starterPick];
  root.append(
    h('h2', { class: 'screen-title' }, 'Choose your starter'),
    h('p', { class: 'hint' }, 'Three wild creatures are willing to come along. Tap one to see it, then start the climb.'),
    cards,
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary fuse-btn', type: 'button', disabled: !pick, onclick: () => {
        chooseStarter(run, ar.starterPick); recordCollection(ar.save, run.party[0].genome, 1); save(); rerender();
      } }, pick ? `Start with ${pick.name}` : 'Pick a starter'),
      pick ? h('button', { class: 'btn', type: 'button', onclick: () => openSheet(pick) }, 'Details') : null,
      h('button', { class: 'btn', type: 'button', onclick: () => { ar.save.run = null; save(); rerender(); } }, 'Cancel')),
  );
}

// ---- floor ------------------------------------------------------------------

function memberRow(run, m, actions) {
  const max = memberMaxHp(m);
  const frac = m.hp / max;
  const xp = xpProgress(m);
  return h('div', { class: `party-row static${m.hp <= 0 ? ' fainted' : ''}` },
    creatureEl(m.genome, { size: 64, animate: false, level: m.level }),
    h('div', { class: 'party-info' },
      h('div', {}, h('b', {}, m.genome.name), ' ', h('span', { class: 'lvl' }, `Lv ${m.level}`), stageBadge(m.level), ' ',
        m.status ? h('span', { class: `status st-${m.status}` }, STATUS_INFO[m.status].short) : null,
        m.hp <= 0 ? h('span', { class: 'status' }, 'FAINTED') : null),
      h('div', { class: 'hpbar' }, h('i', { class: frac > 0.5 ? 'ok' : frac > 0.2 ? 'warn' : 'low', style: { width: `${Math.max(0, frac * 100)}%` } })),
      h('div', { class: 'xpline' }, xpRow(xp), h('span', { class: 'xpnum' }, xp.next > xp.prev ? `${xp.cur - xp.prev} / ${xp.next - xp.prev}` : 'MAX')),
      h('div', { class: 'move-chips' }, (m.moves || []).map((id) => { const mv = getMove(id); return mv ? h('span', { class: 'chip', style: { '--chip': TYPE_INFO[mv.type].color } }, mv.name) : null; })),
      h('div', { class: 'row-actions' }, h('span', { class: 'hint', style: { margin: 0 } }, `${m.hp} / ${max}`), ...actions)));
}

function moveLabel(id) {
  const mv = getMove(id);
  return mv ? `${mv.name} · ${mv.type}${mv.power ? ` ${mv.power}` : ''}` : id;
}

function learnCard(run) {
  const q = (run.pendingLearns || [])[0];
  if (!q) return null;
  const m = [...run.party, ...run.box].find((x) => x.uid === q.uid);
  if (!m) { learnMove(run, q.uid, q.moveId, null); save(); return null; }
  const mv = getMove(q.moveId);
  const done = () => { save(); renderArenaScreen(ar.root); };
  return h('div', { class: 'result-card slim learn' },
    h('div', {}, h('b', {}, m.genome.name), ` wants to learn `, h('b', {}, mv.name), ` (${mv.type}${mv.power ? `, ${mv.power} power` : ''}). Replace which move?`),
    h('div', { class: 'moves' }, m.moves.map((id, i) => h('button', { class: 'move-btn', type: 'button', style: { '--chip': TYPE_INFO[getMove(id).type].color }, onclick: () => { learnMove(run, q.uid, q.moveId, i); done(); } }, h('span', { class: 'mv-name' }, getMove(id).name), h('span', { class: 'mv-meta' }, moveLabel(id))))),
    h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => { learnMove(run, q.uid, q.moveId, null); done(); } }, `Don't learn ${mv.name}`)));
}

function smallBtn(label, onclick, disabled) { return h('button', { class: 'btn small', type: 'button', disabled, onclick }, label); }

function reportCard(report) {
  if (!report || !report.won) return null;
  const lines = [];
  lines.push(`Beat ${report.foe} on floor ${report.floor}. +${report.xp} XP each.`);
  for (const l of report.levelUps) { lines.push(`${l.name} grew to Lv ${l.to}!`); if (stageOf(l.to) > stageOf(l.from)) lines.push(`${l.name} evolved! ${stageName(stageOf(l.to))}: larger, with its features ${stageOf(l.to) === 3 ? 'exaggerated' : 'more pronounced'}.`); }
  for (const l of report.learned || []) lines.push(`${l.name} learned ${l.move}!`);
  if (report.captured) lines.push(`${report.captured.genome.name} joined ${report.toBox ? 'the box' : 'the party'}.`);
  return h('div', { class: 'result-card slim' }, lines.map((t) => h('div', {}, t)),
    h('button', { class: 'btn small', type: 'button', onclick: () => { ar.showReport = false; renderArenaScreen(ar.root); } }, 'Dismiss'));
}

function floorView(root, run) {
  const rerender = () => renderArenaScreen(root);
  const enc = run.encounter;
  const L = floorLevel(run.floor);
  const elem = enc.foes.map((f) => elementalOf(f.genome)).find((e) => e && e.pure) || null;
  const kindLabel = elem ? `${elem.name} Elemental!` : { wild: 'Wild encounter', trainer: 'Trainer battle', boss: 'Warden' }[enc.kind];
  const foesRow = h('div', { class: 'foes' }, enc.foes.map((f) => h('div', { class: 'foe-card' },
    creatureEl(f.genome, { size: enc.foes.length > 2 ? 78 : 120, facing: 'left', animate: enc.foes.length <= 2, level: f.level }),
    h('span', {}, `${f.genome.name} · Lv ${f.level}`, stageBadge(f.level)))));
  appendChildren(root, [
    h('div', { class: 'floor-head' },
      h('div', {}, h('h2', { class: 'screen-title' }, `Floor ${run.floor} · ${biomeFor(run.floor).name}`), h('span', { class: 'hint' }, `wild level ${L} · ${run.stats.captures} caught · ${run.stats.fusions} fused`)),
      h('button', { class: 'btn small', type: 'button', onclick: () => { if (confirm('Abandon this run? Your party retires to the collection.')) { run.phase = 'gameover'; endRun(ar.save); save(); rerender(); } } }, 'Abandon')),
    ar.showReport ? reportCard(run.lastReport) : null,
    learnCard(run),
    h('div', { class: `encounter ${enc.kind}${elem ? ` elemental elem-${elem.id}` : ''}` },
      h('div', { class: 'enc-head' }, h('span', { class: `kind-badge ${enc.kind}${elem ? ' elemental' : ''}` }, kindLabel), h('b', {}, enc.name)),
      foesRow,
      elem ? h('p', { class: 'hint elem-hint' }, `One in a thousand: a creature born of ${elem.name.toLowerCase()}. Every part it has carries the element, and its parts keep it when passed down in fusion.`) : null,
      enc.capturable ? h('p', { class: 'hint' }, 'Wild creatures can be captured during the fight. Weaken them first.') : null,
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn primary fuse-btn', type: 'button', disabled: !canFight(run), onclick: () => startArenaBattle(root, run) }, canFight(run) ? 'Fight' : 'Nobody can fight'),
        run.altar ? h('button', { class: 'btn altar-btn', type: 'button', onclick: () => { ar.altar = { a: null, b: null }; rerender(); } }, '✦ Fusion altar') : null)),
  ]);
  const partyList = h('div', { class: 'party-list' });
  run.party.forEach((m, i) => partyList.append(memberRow(run, m, [
    smallBtn('Lead', () => { setLead(run, m.uid); save(); rerender(); }, i === 0),
    smallBtn('Box', () => { moveMember(run, m.uid, 'box'); save(); rerender(); }, run.party.length <= 1),
    smallBtn('Info', () => openSheet(m.genome)),
  ])));
  root.append(...section(`Party · ${run.party.length}/${ARENA.partyMax}`, h('p', { class: 'hint' }, `The lead goes out first. Everyone recovers ${Math.round(ARENA.healBetweenFloors * 100)}% HP between floors, fully before a Warden, and the altar heals everyone.`), partyList));
  if (run.box.length) {
    const boxList = h('div', { class: 'party-list' });
    for (const m of run.box) boxList.append(memberRow(run, m, [
      smallBtn('To party', () => { moveMember(run, m.uid, 'party'); save(); rerender(); }, run.party.length >= ARENA.partyMax),
      smallBtn('Info', () => openSheet(m.genome)),
    ]));
    root.append(...section(`Box · ${run.box.length}`, boxList));
  }
}

function startArenaBattle(root, run) {
  let built;
  try { built = buildBattle(run); } catch (e) { toast(e.message); return; }
  save();
  clear(root);
  const host = h('div');
  root.append(h('div', { class: 'floor-head compact' }, h('b', {}, `Floor ${run.floor} · ${run.encounter.name}`)), host);
  ar.fight = mountFight(host, {
    state: built.state, events: built.events, names: ['You', run.encounter.name], wild: run.encounter.capturable, fast: ar.save.settings.fast,
    onEnd: (state) => {
      const { report } = applyBattle(run, state);
      if (report.captured) recordCollection(ar.save, report.captured.genome, report.floor);
      ar.showReport = true;
      save();
      return { xp: report.xpGains || [] };
    },
    resultButtons: [{ label: 'Continue', primary: true, onclick: () => renderArenaScreen(root) }],
  });
}

// ---- altar ------------------------------------------------------------------

function altarView(root, run) {
  const rerender = () => renderArenaScreen(root);
  const pick = ar.altar;
  const all = [...run.party, ...run.box];
  const list = h('div', { class: 'pool' });
  const anchorUid = pick.a || pick.b;
  for (const m of all) {
    const tag = pick.a === m.uid ? 'A' : pick.b === m.uid ? 'B' : null;
    const off = anchorUid && !tag && !canFuseMembers(run, anchorUid, m.uid).ok;
    list.append(h('button', { class: `pcard${tag === 'A' ? ' is-a' : tag === 'B' ? ' is-b' : off ? ' is-off' : ''}`, type: 'button', onclick: () => {
      if (off) { toast(canFuseMembers(run, anchorUid, m.uid).reason); return; }
      if (pick.a === m.uid) pick.a = null; else if (pick.b === m.uid) pick.b = null; else if (!pick.a) pick.a = m.uid; else if (!pick.b) pick.b = m.uid; else pick.b = m.uid;
      rerender();
    } }, tag ? h('span', { class: `sel badge ${tag.toLowerCase()}` }, tag) : null, h('span', { class: 'gen' }, cladeName(cladeOf(m.genome))), creatureEl(m.genome, { size: 104, animate: false, level: m.level }), h('span', {}, `${m.genome.name} · Lv ${m.level}`)));
  }
  const child = pick.a && pick.b ? previewFusion(run, pick.a, pick.b) : null;
  appendChildren(root, [
    h('h2', { class: 'screen-title' }, '✦ Fusion altar'),
    h('p', { class: 'hint' }, 'Fuse two creatures of the same class into one. Both are consumed; the child keeps the higher level and starts at full health. Everyone is fully healed when you leave.'),
    ...section('Choose two', list),
    child ? h('div', { class: 'result' },
      h('div', { class: 'sheet-head' }, h('h2', {}, child.name), typeChips(child.types)),
      h('p', { class: 'meta' }, `gen ${child.gen} · ${child.parents.join(' × ')}`),
      h('div', { class: 'hero' }, creatureEl(child, { size: 240, fit: true })),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => {
          const { child: member } = fuseMembers(run, pick.a, pick.b);
          recordCollection(ar.save, member.genome, run.floor);
          addToPool(member.genome);
          ar.altar = null; save(); toast(`${member.genome.name} is born!`); rerender();
        } }, 'Fuse them'),
        h('button', { class: 'btn', type: 'button', onclick: () => openSheet(child) }, 'Details'))) : null,
    h('div', { class: 'row wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => { skipAltar(run); ar.altar = null; save(); rerender(); } }, 'Leave without fusing')),
  ]);
}

// ---- game over --------------------------------------------------------------

function gameOverView(root, run) {
  const rerender = () => renderArenaScreen(root);
  const fallen = h('div', { class: 'pool' });
  for (const m of [...run.party, ...run.box]) fallen.append(h('button', { class: 'pcard', type: 'button', onclick: () => openSheet(m.genome, { level: m.level }) }, creatureEl(m.genome, { size: 104, animate: false, level: m.level }), h('span', {}, `${m.genome.name} · Lv ${m.level}`)));
  root.append(
    h('div', { class: 'hero-card' },
      h('h2', {}, `Run over on floor ${run.floor}`),
      h('p', { class: 'hint' }, `${run.stats.battles} battles · ${run.stats.captures} caught · ${run.stats.fusions} fused · ${run.stats.bosses} wardens beaten`),
      h('button', { class: 'btn primary fuse-btn', type: 'button', onclick: () => { endRun(ar.save); save(); rerender(); } }, 'Retire the team and return')),
    ...section('Your team', h('p', { class: 'hint' }, 'They join the collection, and you can still fuse them in the Fusion Lab.'), fallen),
  );
}
