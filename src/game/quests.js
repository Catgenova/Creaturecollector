// The notice board at the Crossroads: three open requests at a time, drawn from ten kinds and scaled to
// the badges held. Progress is booked from journey events (captures, trainer and Warden wins, tower wins,
// fusions, camps) and the reward, gold plus a potion, a scroll or a charm, is claimed back at the board,
// which then pins up a fresh notice. Everything is deterministic from the journey seed and a running count.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { MOVES, getMove } from '../data/moves.js';
import { CLADE_IDS, cladeName } from '../data/clades.js';
import { TYPE_LIST } from '../data/types.js';
import { ITEMS } from '../data/items.js';
import { CHARMS, CHARM_SHOP } from '../data/charms.js';
import { BIOME_ORDER, REGIONS, worldFor, habitatTypesFor } from './world.js';
import { TOWER } from './tower.js';
import { cladeOf } from '../creature/genome.js';

export const BOARD = { open: 3, baseGold: 400, goldPerBadge: 250 };
export const QUEST_KINDS = ['catch_type', 'catch_species', 'beat_trainers', 'fuse_class', 'rest_camp', 'win_tower', 'beat_warden', 'catch_alpha', 'catch_count', 'win_wild'];
const TIER = { catch_type: 1, catch_count: 1, rest_camp: 1, catch_species: 1.6, beat_trainers: 1.6, fuse_class: 1.6, win_wild: 1.6, win_tower: 2.5, beat_warden: 2.5, catch_alpha: 2.5 };

export function newBoard() { return { issued: 0, done: 0, open: [] }; }

function topLevel(j) { return Math.max(0, ...(j.party || []).map((m) => m.level)); }
/** Biomes within reach: every badge held plus the next two on the ring. */
function reachOf(j) { return BIOME_ORDER.slice(0, Math.min(BIOME_ORDER.length, (j.badges || []).length + 2)); }
const round10 = (n) => Math.max(10, Math.round(n / 10) * 10);

function rewardFor(kind, rng, j, hint) {
  const badges = (j.badges || []).length;
  const gold = round10((BOARD.baseGold + BOARD.goldPerBadge * badges) * TIER[kind]);
  const taken = new Set((j.quests.open || []).map((q) => q.reward && q.reward.item)); // no two notices offer the same scroll or charm
  let item = null;
  if (TIER[kind] === 1) item = badges >= 10 ? 'hyper_potion' : badges >= 4 ? 'super_potion' : 'potion';
  else if (TIER[kind] < 2) {
    const pool = MOVES.filter((m) => !m.signature && !m.struggle && m.cat !== 'status' && m.power >= 60 && m.power <= 95 && (!hint || m.type === hint));
    const fresh = pool.filter((m) => !taken.has(m.id));
    item = ((fresh.length ? fresh : pool).length ? rng.pick(fresh.length ? fresh : pool) : getMove('headbonk')).id;
  } else {
    // a notice pays in ordinary charms: the greater ones are the forge's business, bought with gold and a pair
    const utility = CHARM_SHOP.filter((id) => CHARMS[id].kind !== 'type' && CHARMS[id].kind !== 'prism' && !taken.has(id));
    const typed = hint ? `${hint.toLowerCase()}_charm` : null;
    item = typed && CHARMS[typed] && !taken.has(typed) && rng.chance(0.5) ? typed : rng.pick(utility.length ? utility : CHARM_SHOP);
  }
  return { gold, item };
}

/** The kinds that can be offered right now: no two open notices of one kind, and nothing that cannot be done. */
function eligibleKinds(j, world) {
  const open = new Set((j.quests.open || []).map((q) => q.kind));
  const reach = reachOf(j);
  return QUEST_KINDS.filter((k) => {
    if (open.has(k)) return false;
    if (k === 'win_tower') return topLevel(j) >= TOWER.levels[0] - 5;
    if (k === 'beat_trainers') return reach.some((b) => world.trainers.filter((t) => t.biome === b && !j.beaten[t.id]).length >= 2);
    if (k === 'fuse_class') return true;
    return true;
  });
}

function makeQuest(j, n) {
  const rng = makeRng(`${j.seed}:quest:${n}`);
  const world = worldFor(j.seed);
  const reach = reachOf(j);
  const kinds = eligibleKinds(j, world);
  const kind = rng.pick(kinds.length ? kinds : ['catch_count']);
  const q = { id: `q${n}`, kind, progress: 0, goal: 1 };
  const biomeOf = () => rng.pick(reach);
  let hint = null;
  if (kind === 'catch_type') {
    const b = biomeOf(); const types = habitatTypesFor(b).slice(0, 4).map(([t]) => t);
    q.type = rng.pick(types); q.minLevel = Math.max(2, REGIONS[b].level - 3); hint = q.type;
    q.text = `Catch a ${q.type} creature of Lv ${q.minLevel} or higher.`;
  } else if (kind === 'catch_species') {
    const b = biomeOf(); const pool = WILD_SPECIES.filter((s) => s.clade === b && s.tier !== 'rare');
    const sp = rng.pick(pool); q.species = sp.id; hint = sp.types[0];
    q.text = `Catch a ${sp.name}. They live in the ${REGIONS[b].name}.`;
  } else if (kind === 'beat_trainers') {
    const options = reach.filter((b) => world.trainers.filter((t) => t.biome === b && !j.beaten[t.id]).length >= 2);
    const b = rng.pick(options.length ? options : reach); const left = world.trainers.filter((t) => t.biome === b && !j.beaten[t.id]).length;
    q.biome = b; q.goal = Math.max(1, Math.min(3, left));
    q.text = `Beat ${q.goal} trainer${q.goal > 1 ? 's' : ''} on the roads of the ${REGIONS[b].name}.`;
  } else if (kind === 'fuse_class') {
    const counts = {}; for (const m of [...(j.party || []), ...(j.box || [])]) { const c = cladeOf(m.genome); counts[c] = (counts[c] || 0) + 1; }
    const pairs = Object.keys(counts).filter((c) => counts[c] >= 2);
    q.clade = pairs.length ? rng.pick(pairs) : cladeOf((j.party && j.party[0] ? j.party[0] : { genome: {} }).genome) || rng.pick(CLADE_IDS);
    q.text = `Fuse two ${cladeName(q.clade).toLowerCase()}s at the shrine.`;
  } else if (kind === 'rest_camp') {
    const fresh = reach.filter((b) => !(j.camps || []).includes(b));
    q.biome = rng.pick(fresh.length ? fresh : reach);
    q.text = `Rest at the camp in the ${REGIONS[q.biome].name}.`;
  } else if (kind === 'win_tower') {
    q.floor = rng.int(3); q.level = TOWER.levels.filter((L) => L <= topLevel(j) + 5).pop() || TOWER.levels[0];
    q.text = `Win floor ${q.floor + 1} of the Battle Tower at Lv ${q.level}.`;
  } else if (kind === 'beat_warden') {
    const next = BIOME_ORDER.find((b) => !(j.badges || []).includes(b));
    q.biome = next && rng.chance(0.6) ? next : rng.pick((j.badges || []).length ? j.badges : [next || BIOME_ORDER[0]]);
    const held = (j.badges || []).includes(q.biome);
    q.text = `Beat ${REGIONS[q.biome].warden} of the ${REGIONS[q.biome].name}${held ? ' again' : ''}.`;
  } else if (kind === 'catch_alpha') {
    q.text = 'Catch an alpha: a wild creature well above its patch’s level.';
  } else if (kind === 'catch_count') {
    q.goal = 3 + rng.int(3);
    q.text = `Catch ${q.goal} wild creatures.`;
  } else if (kind === 'win_wild') {
    const b = biomeOf(); const types = habitatTypesFor(b).slice(0, 3).map(([t]) => t);
    q.type = rng.pick(types); q.goal = 4 + rng.int(4); hint = q.type;
    q.text = `Defeat ${q.goal} wild ${q.type} creatures.`;
  }
  q.reward = rewardFor(kind, rng.fork('reward'), j, hint);
  return q;
}

function issue(j) { const n = j.quests.issued++; const q = makeQuest(j, n); j.quests.open.push(q); return q; }

/** The board, created or topped up to three notices. */
export function ensureBoard(j) {
  if (!j.quests || typeof j.quests !== 'object') j.quests = newBoard();
  if (!Array.isArray(j.quests.open)) j.quests.open = [];
  let guard = 0;
  while (j.quests.open.length < BOARD.open && guard++ < 10) issue(j);
  return j.quests;
}

/** Book a journey event against every open notice. Returns the notices it finished. */
export function questEvent(j, ev) {
  const board = ensureBoard(j), done = [];
  for (const q of board.open) {
    if (q.progress >= q.goal) continue;
    let hit = false;
    switch (q.kind) {
      case 'catch_type': hit = ev.kind === 'capture' && ev.genome.types.includes(q.type) && ev.level >= q.minLevel; break;
      case 'catch_species': hit = ev.kind === 'capture' && ev.genome.species === q.species; break;
      case 'beat_trainers': hit = ev.kind === 'trainer' && ev.biome === q.biome; break;
      case 'fuse_class': hit = ev.kind === 'fusion' && ev.clade === q.clade; break;
      case 'rest_camp': hit = ev.kind === 'camp' && ev.biome === q.biome; break;
      case 'win_tower': hit = ev.kind === 'tower' && ev.floor === q.floor && ev.level >= q.level; break;
      case 'beat_warden': hit = ev.kind === 'boss' && ev.biome === q.biome; break;
      case 'catch_alpha': hit = ev.kind === 'capture' && Boolean(ev.alpha); break;
      case 'catch_count': hit = ev.kind === 'capture'; break;
      case 'win_wild': hit = ev.kind === 'wildwin' && ev.genome.types.includes(q.type); break;
      default: break;
    }
    if (hit) { q.progress++; if (q.progress >= q.goal) done.push(q); }
  }
  return done;
}

export function openQuests(j) { return ensureBoard(j).open.slice(); }
export function questReady(q) { return q.progress >= q.goal; }

/** What a reward's item is called on the board. */
export function rewardText(q) {
  const it = q.reward.item;
  const name = !it ? '' : ITEMS[it] ? ITEMS[it].name : CHARMS[it] ? CHARMS[it].name : getMove(it) ? `${getMove(it).name} scroll` : '';
  return `${q.reward.gold.toLocaleString()} gold${name ? ` and a ${name}` : ''}`;
}

/** Claim a finished notice: gold to the purse, the item to the Bag, a new notice pinned up. { ok, reason?, quest } */
export function claimQuest(j, id) {
  const board = ensureBoard(j);
  const q = board.open.find((x) => x.id === id);
  if (!q) return { ok: false, reason: 'That notice is gone.' };
  if (!questReady(q)) return { ok: false, reason: 'Not finished yet.' };
  j.gold = (j.gold || 0) + q.reward.gold;
  if (q.reward.item) { j.bag = j.bag || {}; j.bag[q.reward.item] = Math.min(99, (j.bag[q.reward.item] || 0) + 1); }
  board.open = board.open.filter((x) => x !== q);
  board.done++;
  j.stats.quests = (j.stats.quests || 0) + 1;
  ensureBoard(j);
  return { ok: true, quest: q };
}

/** Tear a notice down unfinished; another takes its place. */
export function abandonQuest(j, id) {
  const board = ensureBoard(j);
  const q = board.open.find((x) => x.id === id);
  if (!q) return { ok: false, reason: 'That notice is gone.' };
  board.open = board.open.filter((x) => x !== q);
  ensureBoard(j);
  return { ok: true };
}

/** Coerce a parsed board: notices with a known kind, sane numbers and real targets survive; the rest are replaced. */
export function normalizeBoard(raw) {
  const b = newBoard();
  if (!raw || typeof raw !== 'object') return b;
  b.issued = Math.max(0, Math.floor(Number(raw.issued) || 0));
  b.done = Math.max(0, Math.floor(Number(raw.done) || 0));
  const okItem = (it) => it == null || ITEMS[it] || CHARMS[it] || (getMove(it) && it !== 'struggle');
  for (const q of Array.isArray(raw.open) ? raw.open : []) {
    if (!q || !QUEST_KINDS.includes(q.kind) || typeof q.text !== 'string' || !q.reward || !Number.isFinite(q.reward.gold) || !okItem(q.reward.item)) continue;
    if ((q.biome != null && !BIOME_ORDER.includes(q.biome)) || (q.species != null && !SPECIES_BY_ID[q.species]) || (q.type != null && !TYPE_LIST.includes(q.type)) || (q.clade != null && !CLADE_IDS.includes(q.clade))) continue;
    if (q.floor != null && !(Number.isInteger(q.floor) && q.floor >= 0 && q.floor < 6)) continue;
    if (q.level != null && !TOWER.levels.includes(q.level)) continue;
    const goal = Math.max(1, Math.floor(Number(q.goal) || 1));
    b.open.push({ ...q, id: String(q.id || `q${b.open.length}`), goal, progress: Math.max(0, Math.min(goal, Math.floor(Number(q.progress) || 0))), reward: { gold: Math.max(0, Math.floor(q.reward.gold)), item: q.reward.item || null } });
    if (b.open.length >= BOARD.open) break;
  }
  return b;
}
