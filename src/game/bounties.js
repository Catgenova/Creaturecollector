// The Bounty Office at the Crossroads: five standing requests for a fusion of a given type. Hand over any
// fusion (generation one or more) carrying that type, in the party or in storage, and it pays its gold
// times a level bonus that runs from 1.01 at level 1 to 2.00 at level 100; the creature is gone for good
// (it stays in your Collection) and a fresh bounty goes up in its place. Deterministic from the journey seed.
import { makeRng } from '../core/rng.js';
import { TYPE_LIST } from '../data/types.js';
import { returnCharms } from './market.js';

export const BOUNTY = { open: 5, baseGold: 1500, goldPerBadge: 300, typeSpread: [0.8, 1.4] };

export function newBounties() { return { issued: 0, done: 0, open: [] }; }
const roundTens = (n) => Math.max(10, Math.round(n / 10) * 10);

/** The level bonus: 1.01 at level 1 up to 2.00 at level 100. */
export function bountyLevelMul(level) { return 1 + Math.max(1, Math.min(100, Math.round(level))) / 100; }

function makeBounty(j, n) {
  const rng = makeRng(`${j.seed}:bounty:${n}`);
  const taken = new Set((j.bounties.open || []).map((b) => b.type));
  const fresh = TYPE_LIST.filter((t) => !taken.has(t));
  const type = rng.pick(fresh.length ? fresh : TYPE_LIST);
  const badges = (j.badges || []).length;
  const gold = roundTens((BOUNTY.baseGold + BOUNTY.goldPerBadge * badges) * rng.range(BOUNTY.typeSpread[0], BOUNTY.typeSpread[1]));
  return { id: `b${n}`, type, gold };
}

function issueBounty(j) { const n = j.bounties.issued++; const b = makeBounty(j, n); j.bounties.open.push(b); return b; }

/** The office's list, created or topped up to five, no two of a type. */
export function ensureBounties(j) {
  if (!j.bounties || typeof j.bounties !== 'object') j.bounties = newBounties();
  if (!Array.isArray(j.bounties.open)) j.bounties.open = [];
  let guard = 0;
  while (j.bounties.open.length < BOUNTY.open && guard++ < 10) issueBounty(j);
  return j.bounties;
}
export function openBounties(j) { return ensureBounties(j).open.slice(); }

/** Does this member answer the bounty? A fusion of generation one or more carrying the type. */
export function bountyAccepts(bounty, m) { return Boolean(m && m.genome && m.genome.gen > 0 && (m.genome.types || []).includes(bounty.type)); }
/** What a member would be paid for a bounty. */
export function bountyPayout(bounty, m) { return roundTens(bounty.gold * bountyLevelMul(m.level)); }
/** Party and storage members that answer a bounty, best paid first; locked ones are listed but marked. */
export function bountyCandidates(j, bounty) {
  return [...(j.party || []), ...(j.box || [])].filter((m) => bountyAccepts(bounty, m)).map((m) => ({ member: m, payout: bountyPayout(bounty, m), locked: Boolean(m.locked), last: (j.party || []).length <= 1 && (j.party || []).includes(m) }))
    .sort((a, b) => b.payout - a.payout);
}

/** Hand a fusion over for a bounty. { ok, reason?, paid, mult, bounty, member } */
export function turnInBounty(j, bountyId, uid) {
  const list = ensureBounties(j);
  const bounty = list.open.find((b) => b.id === bountyId);
  if (!bounty) return { ok: false, reason: 'That bounty has been taken down.' };
  const m = [...(j.party || []), ...(j.box || [])].find((x) => x.uid === uid);
  if (!m) return { ok: false, reason: 'No such creature.' };
  if (!(m.genome.gen > 0)) return { ok: false, reason: `${m.genome.name} is no fusion. The office wants creatures born at the shrine.` };
  if (!bountyAccepts(bounty, m)) return { ok: false, reason: `${m.genome.name} is not a ${bounty.type} fusion.` };
  if (m.locked) return { ok: false, reason: `${m.genome.name} is locked. Unlock it first.` };
  if (j.party.includes(m) && j.party.length <= 1) return { ok: false, reason: 'Keep at least one creature with you.' };
  const paid = bountyPayout(bounty, m), mult = bountyLevelMul(m.level);
  returnCharms(j, [m]);
  j.party = j.party.filter((x) => x !== m);
  j.box = (j.box || []).filter((x) => x !== m);
  if (Array.isArray(j.pendingLearns)) j.pendingLearns = j.pendingLearns.filter((p) => p.uid !== uid);
  j.gold = (j.gold || 0) + paid;
  list.open = list.open.filter((b) => b !== bounty);
  list.done++;
  j.stats.bounties = (j.stats.bounties || 0) + 1;
  ensureBounties(j);
  return { ok: true, paid, mult, bounty, member: m };
}

/** Coerce a parsed office: real types, sane gold; the rest are replaced. */
export function normalizeBounties(raw) {
  const b = newBounties();
  if (!raw || typeof raw !== 'object') return b;
  b.issued = Math.max(0, Math.floor(Number(raw.issued) || 0));
  b.done = Math.max(0, Math.floor(Number(raw.done) || 0));
  const seen = new Set();
  for (const x of Array.isArray(raw.open) ? raw.open : []) {
    if (!x || !TYPE_LIST.includes(x.type) || seen.has(x.type) || !Number.isFinite(x.gold) || x.gold <= 0) continue;
    seen.add(x.type);
    b.open.push({ id: String(x.id || `b${b.open.length}`), type: x.type, gold: Math.floor(x.gold) });
    if (b.open.length >= BOUNTY.open) break;
  }
  return b;
}
