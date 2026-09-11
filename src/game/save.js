// Persistent save: best results, the creature collection, and the run in progress.
import { b64uEncode, b64uDecode } from '../core/util.js';
import { validateGenome, learnsetOf } from '../creature/genome.js';
import { getMove } from '../data/moves.js';
import { movesAtLevel } from '../battle/stats.js';

export const SAVE_KEY = 'creaturecollector.save';
export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'CCSAVE1.';
export const COLLECTION_MAX = 200;

export function emptySave() {
  return {
    v: SAVE_VERSION,
    best: { floor: 0, runs: 0 },
    totals: { battles: 0, captures: 0, fusions: 0 },
    collection: [],
    run: null,
    settings: { fast: false },
  };
}

function cleanMember(m) {
  if (!m || typeof m !== 'object') return null;
  try { validateGenome(m.genome); } catch { return null; }
  if (!Number.isFinite(m.level)) return null;
  const level = Math.max(1, Math.min(100, Math.round(m.level)));
  let moves = Array.isArray(m.moves) ? m.moves.filter((id) => typeof id === 'string' && getMove(id)).slice(0, 4) : [];
  if (!moves.length) moves = movesAtLevel(learnsetOf(m.genome), level);
  return { uid: String(m.uid || ''), genome: m.genome, level, xp: Number.isFinite(m.xp) ? m.xp : 0, hp: Number.isFinite(m.hp) ? Math.max(0, m.hp) : 1, status: m.status || null, moves };
}

/** Coerce any parsed object into a valid save, dropping anything broken. */
export function normalizeSave(raw) {
  const s = emptySave();
  if (!raw || typeof raw !== 'object' || raw.v !== SAVE_VERSION) return s;
  if (raw.best) { s.best.floor = Number(raw.best.floor) || 0; s.best.runs = Number(raw.best.runs) || 0; }
  if (raw.totals) for (const k of Object.keys(s.totals)) s.totals[k] = Number(raw.totals[k]) || 0;
  if (raw.settings) s.settings.fast = Boolean(raw.settings.fast);
  if (Array.isArray(raw.collection)) {
    for (const e of raw.collection) {
      try { validateGenome(e.genome); s.collection.push({ genome: e.genome, floor: Number(e.floor) || 0, when: Number(e.when) || 0 }); } catch { /* skip */ }
      if (s.collection.length >= COLLECTION_MAX) break;
    }
  }
  const r = raw.run;
  if (r && typeof r === 'object' && ['starter', 'floor', 'gameover'].includes(r.phase)) {
    const run = {
      seed: String(r.seed || 'run'), floor: Math.max(1, Number(r.floor) || 1), phase: r.phase,
      party: (Array.isArray(r.party) ? r.party : []).map(cleanMember).filter(Boolean),
      box: (Array.isArray(r.box) ? r.box : []).map(cleanMember).filter(Boolean),
      starters: null, altar: Boolean(r.altar), encounter: r.encounter && r.encounter.foes ? r.encounter : null,
      nextId: Number(r.nextId) || 1, stats: { battles: 0, captures: 0, fusions: 0, bosses: 0, ...(r.stats || {}) }, lastReport: r.lastReport || null,
      pendingLearns: (Array.isArray(r.pendingLearns) ? r.pendingLearns : []).filter((q) => q && typeof q.uid === 'string' && getMove(q.moveId)),
    };
    if (Array.isArray(r.starters)) {
      run.starters = r.starters.filter((g) => { try { validateGenome(g); return true; } catch { return false; } });
    }
    const usable = run.phase === 'starter' ? run.starters && run.starters.length === 3 : run.party.length > 0;
    if (usable) s.run = run;
  }
  return s;
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
export function recordCollection(save, genome, floor) {
  const key = genome.gen ? `${genome.name}#${genome.seed}` : genome.species;
  const exists = save.collection.some((e) => (e.genome.gen ? `${e.genome.name}#${e.genome.seed}` : e.genome.species) === key);
  if (exists) return false;
  save.collection.push({ genome, floor: floor || 0, when: Date.now() });
  while (save.collection.length > COLLECTION_MAX) save.collection.shift();
  return true;
}

/** Close out a run: tally totals, update the best floor, retire its creatures to the collection. */
export function endRun(save) {
  const run = save.run;
  if (!run) return save;
  const reached = run.phase === 'gameover' ? run.floor : Math.max(1, run.floor - 1);
  save.best.floor = Math.max(save.best.floor, reached);
  save.best.runs++;
  save.totals.battles += run.stats.battles || 0;
  save.totals.captures += run.stats.captures || 0;
  save.totals.fusions += run.stats.fusions || 0;
  for (const m of [...run.party, ...run.box]) recordCollection(save, m.genome, run.floor);
  save.run = null;
  return save;
}
