// Persistent save: totals, the creature collection, the journey in progress and settings.
// One localStorage key, versioned, normalised on load so junk cannot brick it.
import { TOWER, TOWER_TRAINERS } from './tower.js';
import { b64uEncode, b64uDecode } from '../core/util.js';
import { validateGenome, learnsetOf } from '../creature/genome.js';
import { getMove } from '../data/moves.js';
import { movesAtLevel } from '../battle/stats.js';
import { WORLD, BIOME_ORDER } from './world.js';
import { getItem } from '../data/items.js';

export const SAVE_KEY = 'creaturecollector.save';
export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'CCSAVE1.';
export const COLLECTION_MAX = 200;

export function emptySave() {
  return {
    v: SAVE_VERSION,
    totals: { battles: 0, captures: 0, fusions: 0, journeys: 0, champions: 0 },
    collection: [],
    journey: null,
    settings: { fast: false },
  };
}

const validGenome = (g) => { try { validateGenome(g); return true; } catch { return false; } };

function cleanMember(m) {
  if (!m || typeof m !== 'object' || !validGenome(m.genome)) return null;
  if (!Number.isFinite(m.level)) return null;
  const level = Math.max(1, Math.min(100, Math.round(m.level)));
  let moves = Array.isArray(m.moves) ? m.moves.filter((id) => typeof id === 'string' && getMove(id)).slice(0, 4) : [];
  if (!moves.length) moves = movesAtLevel(learnsetOf(m.genome), level);
  return { uid: String(m.uid || ''), genome: m.genome, level, xp: Number.isFinite(m.xp) ? m.xp : 0, hp: Number.isFinite(m.hp) ? Math.max(0, m.hp) : 1, status: m.status || null, moves, locked: Boolean(m.locked) };
}

/** Coerce any parsed object into a valid save, dropping anything broken. */
export function normalizeSave(raw) {
  const s = emptySave();
  if (!raw || typeof raw !== 'object' || raw.v !== SAVE_VERSION) return s;
  if (raw.totals) for (const k of Object.keys(s.totals)) s.totals[k] = Math.max(0, Number(raw.totals[k]) || 0);
  if (raw.settings) s.settings.fast = Boolean(raw.settings.fast);
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
  return s;
}

const cleanFoes = (list) => (Array.isArray(list) ? list.filter((f) => f && validGenome(f.genome) && Number.isFinite(f.level)).map((f) => ({ genome: f.genome, level: Math.max(1, Math.min(100, Math.round(f.level))) })) : []);
const cleanPoint = (p, fallback) => (p && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: Math.max(0, Math.min(WORLD.w - 1, Math.round(p.x))), y: Math.max(0, Math.min(WORLD.h - 1, Math.round(p.y))) } : { ...fallback });

/** Coerce a parsed journey into a valid one, or null when it cannot be trusted. */
export function normalizeJourney(r) {
  if (!r || typeof r !== 'object' || !['starter', 'roam', 'champion'].includes(r.phase)) return null;
  const hub = { x: Math.floor(WORLD.w / 2), y: Math.floor(WORLD.h / 2) };
  // a journey saved on an older map keeps its creatures, badges and bag but starts again from the Crossroads
  const sameWorld = Number(r.world) === WORLD.version;
  const j = {
    seed: String(r.seed || 'journey'), world: WORLD.version, phase: r.phase, starters: null,
    party: (Array.isArray(r.party) ? r.party : []).map(cleanMember).filter(Boolean),
    box: (Array.isArray(r.box) ? r.box : []).map(cleanMember).filter(Boolean),
    nextId: Number(r.nextId) || 1,
    pendingLearns: (Array.isArray(r.pendingLearns) ? r.pendingLearns : []).filter((q) => q && typeof q.uid === 'string' && getMove(q.moveId)),
    stats: { steps: 0, battles: 0, captures: 0, fusions: 0, trainers: 0, bosses: 0, wipes: 0, tower: 0 },
    tower: { challenges: 0, wins: {} },
    player: { ...cleanPoint(sameWorld ? r.player : null, { x: hub.x, y: hub.y + 1 }), dir: ['up', 'down', 'left', 'right'].includes(r.player && r.player.dir) ? r.player.dir : 'down' },
    badges: Array.isArray(r.badges) ? r.badges.filter((b, i, arr) => BIOME_ORDER.includes(b) && arr.indexOf(b) === i) : [],
    beaten: {}, camps: sameWorld && Array.isArray(r.camps) ? r.camps.filter((b) => BIOME_ORDER.includes(b)) : [],
    lastCamp: cleanPoint(sameWorld ? r.lastCamp : null, { x: hub.x - 3, y: hub.y }), cooldown: Math.max(0, Number(r.cooldown) || 0),
    gauntlet: r.gauntlet && Number.isFinite(r.gauntlet.stage) && r.gauntlet.stage >= 0 && r.gauntlet.stage < 4 ? { stage: Math.round(r.gauntlet.stage) } : null,
    champion: Boolean(r.champion), encounter: null, lastReport: r.lastReport || null,
    gold: Math.max(0, Math.floor(Number(r.gold) || 0)), bag: {},
  };
  if (r.bag && typeof r.bag === 'object') for (const [id, q] of Object.entries(r.bag)) { const n = Math.min(99, Math.floor(Number(q) || 0)); if (n > 0 && (getItem(id) || getMove(id)) && id !== 'struggle') j.bag[id] = n; }
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
  if (!j.party.length) { if (!j.box.length) return null; j.party.push(j.box.shift()); }
  return j;
}

function storageOf(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function loadSave(storage) {
  const st = storageOf(storage);
  if (!st) return emptySave();
  try { const raw = st.getItem(SAVE_KEY); return raw ? normalizeSave(JSON.parse(raw)) : emptySave(); } catch { return emptySave(); }
}

export function persistSave(save, storage) {
  const st = storageOf(storage);
  if (!st) return false;
  try { st.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; }
}

export function clearSave(storage) {
  const st = storageOf(storage);
  try { if (st) st.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

export function exportSave(save) { return SAVE_PREFIX + b64uEncode(JSON.stringify(save)); }

export function importSave(code) {
  const s = String(code || '').trim();
  if (!s.startsWith(SAVE_PREFIX)) throw new Error('That is not a save code.');
  let raw;
  try { raw = JSON.parse(b64uDecode(s.slice(SAVE_PREFIX.length))); } catch { throw new Error('That save code is damaged.'); }
  return normalizeSave(raw);
}

/** Remember a creature in the collection. Wild species dedupe by species; fusions by name and seed. */
export function recordCollection(save, genome) {
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
