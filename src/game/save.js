// Persistent save: totals, the creature collection, the journey in progress and settings.
// One localStorage key, versioned, normalised on load so junk cannot brick it.
import { TOWER, TOWER_TRAINERS } from './tower.js';
import { b64uEncode, b64uDecode } from '../core/util.js';
import { validateGenome, learnsetOf } from '../creature/genome.js';
import { getMove } from '../data/moves.js';
import { movesAtLevel } from '../battle/stats.js';
import { WORLD, BIOME_ORDER } from './world.js';
import { getItem } from '../data/items.js';
import { getCharm } from '../data/charms.js';
import { BOND } from './bond.js';
import { emptyDex, normalizeDex, dexSeed } from './dex.js';
import { normalizeBoard, ensureBoard } from './quests.js';
import { normalizeBounties, ensureBounties } from './bounties.js';

export const SAVE_KEY = 'creaturecollector.save';
export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'CCSAVE1.';
export const COLLECTION_MAX = 200;

export function emptySave() {
  return {
    v: SAVE_VERSION,
    totals: { battles: 0, captures: 0, fusions: 0, journeys: 0, champions: 0 },
    collection: [],
    hall: { tier: 0, slots: [] }, // the Trophy Hall: shelf room bought with gold, and who stands on it
    journey: null,
    settings: { fast: false },
    dex: emptyDex(),
  };
}

const validGenome = (g) => { try { validateGenome(g); return true; } catch { return false; } };

function cleanMember(m) {
  if (!m || typeof m !== 'object' || !validGenome(m.genome)) return null;
  if (!Number.isFinite(m.level)) return null;
  const level = Math.max(1, Math.min(100, Math.round(m.level)));
  let moves = Array.isArray(m.moves) ? m.moves.filter((id) => typeof id === 'string' && getMove(id)).slice(0, 4) : [];
  if (!moves.length) moves = movesAtLevel(learnsetOf(m.genome), level);
  return { uid: String(m.uid || ''), genome: m.genome, level, xp: Number.isFinite(m.xp) ? m.xp : 0, hp: Number.isFinite(m.hp) ? Math.max(0, m.hp) : 1, status: m.status || null, moves, locked: Boolean(m.locked), held: getCharm(m.held) ? m.held : null, bond: Number.isFinite(m.bond) ? Math.max(0, Math.min(BOND.max, Math.round(m.bond))) : 0 };
}

/** One of an Ironman run's dead. Enough to name it, place it and draw it, and nothing else. */
function cleanFallen(f) {
  if (!f || typeof f !== 'object' || !validGenome(f.genome)) return null;
  return { uid: String(f.uid || ''), name: String(f.name || f.genome.name || '?').slice(0, 24), genome: f.genome,
    level: Math.max(1, Math.min(100, Math.round(Number(f.level) || 1))),
    foe: f.foe ? String(f.foe).slice(0, 40) : null, at: f.at ? String(f.at).slice(0, 32) : null,
    step: Math.max(0, Math.floor(Number(f.step) || 0)) };
}

/** Coerce any parsed object into a valid save, dropping anything broken. */
export function normalizeSave(raw) {
  const s = emptySave();
  if (!raw || typeof raw !== 'object' || raw.v !== SAVE_VERSION) return s;
  if (raw.totals) for (const k of Object.keys(s.totals)) s.totals[k] = Math.max(0, Number(raw.totals[k]) || 0);
  if (raw.settings) s.settings.fast = Boolean(raw.settings.fast);
  if (raw.hall && typeof raw.hall === 'object') {
    s.hall = {
      tier: Math.max(0, Math.min(5, Math.floor(Number(raw.hall.tier) || 0))),
      slots: Array.isArray(raw.hall.slots) ? raw.hall.slots.filter((k) => typeof k === 'string').slice(0, 15) : [],
    };
  }
  if (Array.isArray(raw.collection)) {
    for (const e of raw.collection) {
      if (e && validGenome(e.genome)) s.collection.push({ genome: e.genome, when: Number(e.when) || 0 });
      if (s.collection.length >= COLLECTION_MAX) break;
    }
  }
  // Saves from before the overworld carried an arena run: its creatures join the collection and its tallies the totals.
  const r = raw.run;
  if (r && typeof r === 'object') {
    for (const list of [r.party, r.box]) if (Array.isArray(list)) for (const m of list) if (m && validGenome(m.genome)) recordCollection(s, m.genome);
    if (r.stats) for (const k of ['battles', 'captures', 'fusions']) s.totals[k] += Math.max(0, Number(r.stats[k]) || 0);
  }
  s.journey = normalizeJourney(raw.journey);
  s.dex = normalizeDex(raw.dex);
  dexSeed(s); // whatever travelled with you counts as caught, so older saves fill their dex on load
  return s;
}

const cleanFoes = (list) => (Array.isArray(list) ? list.filter((f) => f && validGenome(f.genome) && Number.isFinite(f.level)).map((f) => ({ genome: f.genome, level: Math.max(1, Math.min(100, Math.round(f.level))) })) : []);
const cleanPoint = (p, fallback) => (p && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: Math.max(0, Math.min(WORLD.w - 1, Math.round(p.x))), y: Math.max(0, Math.min(WORLD.h - 1, Math.round(p.y))) } : { ...fallback });

/** Coerce a parsed journey into a valid one, or null when it cannot be trusted. */
export function normalizeJourney(r) {
  if (!r || typeof r !== 'object' || !['starter', 'roam', 'champion', 'over'].includes(r.phase)) return null;
  const hub = { x: Math.floor(WORLD.w / 2), y: Math.floor(WORLD.h / 2) };
  // a journey saved on an older map keeps its creatures, badges and bag but starts again from the Crossroads
  const sameWorld = Number(r.world) === WORLD.version;
  const j = {
    seed: String(r.seed || 'journey'), world: WORLD.version, phase: r.phase, starters: null,
    party: (Array.isArray(r.party) ? r.party : []).map(cleanMember).filter(Boolean),
    box: (Array.isArray(r.box) ? r.box : []).map(cleanMember).filter(Boolean),
    nextId: Number(r.nextId) || 1,
    // Ironman rides along with the run and can never be turned off mid-journey, so it is read once and kept
    ironman: Boolean(r.ironman),
    fallen: (Array.isArray(r.fallen) ? r.fallen : []).map(cleanFallen).filter(Boolean).slice(0, 60),
    over: null,
    pendingLearns: (Array.isArray(r.pendingLearns) ? r.pendingLearns : []).filter((q) => q && typeof q.uid === 'string' && getMove(q.moveId)),
    stats: { steps: 0, battles: 0, captures: 0, fusions: 0, trainers: 0, bosses: 0, wipes: 0, tower: 0, quests: 0, bounties: 0 },
    tower: { challenges: 0, wins: {} },
    player: { ...cleanPoint(sameWorld ? r.player : null, { x: hub.x, y: hub.y + 1 }), dir: ['up', 'down', 'left', 'right'].includes(r.player && r.player.dir) ? r.player.dir : 'down' },
    badges: Array.isArray(r.badges) ? r.badges.filter((b, i, arr) => BIOME_ORDER.includes(b) && arr.indexOf(b) === i) : [],
    beaten: {}, camps: sameWorld && Array.isArray(r.camps) ? r.camps.filter((b) => BIOME_ORDER.includes(b)) : [],
    lastCamp: cleanPoint(sameWorld ? r.lastCamp : null, { x: hub.x - 3, y: hub.y }), cooldown: Math.max(0, Number(r.cooldown) || 0),
    gauntlet: r.gauntlet && Number.isFinite(r.gauntlet.stage) && r.gauntlet.stage >= 0 && r.gauntlet.stage < 4 ? { stage: Math.round(r.gauntlet.stage) } : null,
    champion: Boolean(r.champion), encounter: null, lastReport: r.lastReport || null,
    trial: null, // a Trial run does not survive a reload; the day's record does
    elders: r.elders && typeof r.elders === 'object' ? Object.fromEntries(Object.keys(r.elders).filter((b) => BIOME_ORDER.includes(b) && r.elders[b]).map((b) => [b, true])) : {},
    titans: r.titans && typeof r.titans === 'object' ? Object.fromEntries(Object.keys(r.titans).filter((b) => BIOME_ORDER.includes(b) && r.titans[b]).map((b) => [b, true])) : {},
    presets: Array.isArray(r.presets) ? r.presets.slice(0, 3).map((p) => (p && Array.isArray(p.uids) ? { name: String(p.name || 'Team').slice(0, 18), uids: p.uids.filter((u) => typeof u === 'string').slice(0, 5) } : null)) : [],
    trials: r.trials && typeof r.trials === 'object' ? Object.fromEntries(Object.entries(r.trials).slice(-30).filter(([day, v]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && v && typeof v === 'object')
      .map(([day, v]) => [day, { stage: Math.max(0, Math.min(3, Math.floor(Number(v.stage) || 0))), cleared: Boolean(v.cleared), tries: Math.max(0, Math.floor(Number(v.tries) || 0)) }])) : {},
    gold: Math.max(0, Math.floor(Number(r.gold) || 0)), bag: {}, quests: normalizeBoard(r.quests), bounties: normalizeBounties(r.bounties),
  };
  if (r.bag && typeof r.bag === 'object') for (const [id, q] of Object.entries(r.bag)) { const n = Math.min(99, Math.floor(Number(q) || 0)); if (n > 0 && (getItem(id) || getCharm(id) || getMove(id)) && id !== 'struggle') j.bag[id] = n; }
  if (r.stats && typeof r.stats === 'object') for (const k of Object.keys(j.stats)) j.stats[k] = Math.max(0, Number(r.stats[k]) || 0);
  if (r.beaten && typeof r.beaten === 'object') for (const [k, v] of Object.entries(r.beaten)) if (v) j.beaten[k] = true;
  if (r.tower && typeof r.tower === 'object') {
    j.tower.challenges = Math.max(0, Math.floor(Number(r.tower.challenges) || 0));
    if (r.tower.wins && typeof r.tower.wins === 'object') {
      for (const [id, byLevel] of Object.entries(r.tower.wins)) {
        if (!TOWER_TRAINERS.some((t) => t.id === id) || !byLevel || typeof byLevel !== 'object') continue;
        for (const [lv, n] of Object.entries(byLevel)) { const c = Math.floor(Number(n) || 0); if (c > 0 && TOWER.levels.includes(Number(lv))) { j.tower.wins[id] = j.tower.wins[id] || {}; j.tower.wins[id][lv] = c; } }
      }
    }
  }
  if (r.encounter && typeof r.encounter === 'object' && ['wild', 'trainer', 'boss', 'council', 'tower'].includes(r.encounter.kind)) {
    const foes = cleanFoes(r.encounter.foes);
    if (foes.length) j.encounter = { ...r.encounter, foes, capturable: r.encounter.kind === 'wild' };
  }
  if (j.gauntlet && (!j.encounter || j.encounter.kind !== 'council')) j.gauntlet = null;
  if (j.phase === 'starter') {
    j.starters = Array.isArray(r.starters) ? r.starters.filter(validGenome) : [];
    return j.starters.length === 3 ? j : null;
  }
  if (j.phase === 'over') {
    // an Ironman run that ended keeps its ending: it is not restocked from the box and not thrown away for
    // being empty, because the whole point of it is that the player gets to see where it stopped
    const o = r.over && typeof r.over === 'object' ? r.over : {};
    j.over = { at: o.at ? String(o.at).slice(0, 32) : 'the road', steps: Math.max(0, Math.floor(Number(o.steps) || 0)),
      badges: Math.max(0, Math.floor(Number(o.badges) || 0)), fallen: j.fallen.length,
      champion: Boolean(o.champion), foe: o.foe ? String(o.foe).slice(0, 40) : null };
    j.ironman = true;
    return j;
  }
  if (!j.party.length) { if (!j.box.length) return null; j.party.push(j.box.shift()); }
  ensureBoard(j); // top the board back up to three notices
  ensureBounties(j);
  return j;
}

function storageOf(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

// ---- save slots -------------------------------------------------------------------------------
// Three journeys can be kept at once. Each slot is its own key; one more key remembers which is in
// play, and everything that already said loadSave/persistSave goes on meaning "the slot in play".
export const SLOTS = 3;
export const SLOT_KEY = 'creaturecollector.slot';
/** The storage key a slot lives under. Slot 1 keeps the original key, so an old save is already in it. */
export function slotKey(n) { return n === 1 ? SAVE_KEY : `${SAVE_KEY}.${n}`; }
export function slotNumber(n) { const v = Math.floor(Number(n)); return v >= 1 && v <= SLOTS ? v : 1; }

/** Which slot is in play (1 when nothing has been chosen). */
export function activeSlot(storage) {
  const st = storageOf(storage);
  if (!st) return 1;
  try { return slotNumber(st.getItem(SLOT_KEY)); } catch { return 1; }
}
/** Put a slot in play. Returns the slot number actually set. */
export function useSlot(n, storage) {
  const st = storageOf(storage);
  const slot = slotNumber(n);
  try { if (st) st.setItem(SLOT_KEY, String(slot)); } catch { /* a blocked storage still plays, it just forgets */ }
  return slot;
}

export function loadSlot(n, storage) {
  const st = storageOf(storage);
  if (!st) return emptySave();
  try { const raw = st.getItem(slotKey(slotNumber(n))); return raw ? normalizeSave(JSON.parse(raw)) : emptySave(); } catch { return emptySave(); }
}
export function persistSlot(save, n, storage) {
  const st = storageOf(storage);
  if (!st) return false;
  try { st.setItem(slotKey(slotNumber(n)), JSON.stringify(save)); return true; } catch { return false; }
}
export function clearSlot(n, storage) {
  const st = storageOf(storage);
  try { if (st) st.removeItem(slotKey(slotNumber(n))); } catch { /* ignore */ }
}

/** What a slot looks like from the outside, for the picker: enough to tell three journeys apart. */
export function slotSummary(n, storage) {
  const slot = slotNumber(n);
  const st = storageOf(storage);
  let raw = null;
  try { raw = st ? st.getItem(slotKey(slot)) : null; } catch { raw = null; }
  if (!raw) return { slot, empty: true, journey: null, journeys: 0, caught: 0, collection: 0, champion: false };
  const save = loadSlot(slot, storage);
  const j = save.journey;
  return {
    slot,
    empty: false,
    journey: j ? { seed: j.seed, phase: j.phase, badges: (j.badges || []).length, party: j.party.length, level: j.party.length ? Math.max(...j.party.map((m) => m.level)) : 0, steps: j.stats.steps, gold: j.gold || 0, champion: Boolean(j.champion) } : null,
    journeys: save.totals.journeys,
    caught: Object.keys((save.dex && save.dex.caught) || {}).length,
    collection: save.collection.length,
    champion: save.totals.champions > 0,
  };
}
export function slotSummaries(storage) { return Array.from({ length: SLOTS }, (_, i) => slotSummary(i + 1, storage)); }

export function loadSave(storage) { return loadSlot(activeSlot(storage), storage); }
export function persistSave(save, storage) { return persistSlot(save, activeSlot(storage), storage); }
export function clearSave(storage) { clearSlot(activeSlot(storage), storage); }

export function exportSave(save) { return SAVE_PREFIX + b64uEncode(JSON.stringify(save)); }

export function importSave(code) {
  const s = String(code || '').trim();
  if (!s.startsWith(SAVE_PREFIX)) throw new Error('That is not a save code.');
  let raw;
  try { raw = JSON.parse(b64uDecode(s.slice(SAVE_PREFIX.length))); } catch { throw new Error('That save code is damaged.'); }
  return normalizeSave(raw);
}

function dexCaughtSafe(save, genome) { try { dexSeed({ collection: [{ genome }], journey: null, dex: (save.dex = save.dex || emptyDex()) }); } catch { /* the dex never blocks a save */ } }

/** Remember a creature in the collection (and mark its species caught in the dex). Wild species dedupe by species; fusions by name and seed. */
export function recordCollection(save, genome) {
  dexCaughtSafe(save, genome);
  const key = genome.gen ? `${genome.name}#${genome.seed}` : genome.species;
  const exists = save.collection.some((e) => (e.genome.gen ? `${e.genome.name}#${e.genome.seed}` : e.genome.species) === key);
  if (exists) return false;
  save.collection.push({ genome, when: Date.now() });
  while (save.collection.length > COLLECTION_MAX) save.collection.shift();
  return true;
}

/** Close out a journey: tally its totals and retire its creatures to the collection. */
export function retireJourney(save) {
  const j = save.journey;
  if (!j) return save;
  save.totals.journeys++;
  for (const k of ['battles', 'captures', 'fusions']) save.totals[k] += j.stats[k] || 0;
  if (j.champion) save.totals.champions++;
  for (const m of [...j.party, ...j.box]) recordCollection(save, m.genome);
  save.journey = null;
  return save;
}
