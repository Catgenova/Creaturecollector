// The Battle Tower: six trainers at the Crossroads who fight six on six with random teams, at a level the
// player picks (50 to 100 in steps of ten). Each challenge rolls a fresh team, so the tower never repeats;
// higher floors field more gen-2 fusions. Wins pay experience every time and trainer-rate gold, a quarter of
// it once a floor has been beaten at that level. Losses follow the ordinary wipe rule.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES } from '../data/species.js';
import { CLADE_IDS } from '../data/clades.js';
import { speciesGenome } from '../creature/genome.js';
import { fuse, canFuse } from '../creature/fusion.js';
import { canFight } from './party.js';

export const TOWER = { levels: [50, 60, 70, 80, 90, 100], teamSize: 6 };

export const TOWER_TRAINERS = [
  { id: 'tower-0', name: 'Initiate Bea', title: 'First floor', fusions: 0, line: 'Six against six and no favours. Show me you belong in here.' },
  { id: 'tower-1', name: 'Adept Corvin', title: 'Second floor', fusions: 1, line: 'I never fight the same team twice. Neither will you.' },
  { id: 'tower-2', name: 'Veteran Ysolde', title: 'Third floor', fusions: 2, line: 'The stairs get steeper from here. So do I.' },
  { id: 'tower-3', name: 'Warcaller Rook', title: 'Fourth floor', fusions: 3, line: 'Half my team was born in the shrine. Guess which half.' },
  { id: 'tower-4', name: 'Grandmaster Ilse', title: 'Fifth floor', fusions: 4, line: 'Most who reach this floor go back down. Some are carried.' },
  { id: 'tower-5', name: 'The Keeper', title: 'The top', fusions: 5, line: 'Nothing above me but sky. Let us see what you brought.' },
];

export function towerTrainer(k) { return TOWER_TRAINERS[k] || null; }

/** Pick a species nobody on the team has yet. */
function towerPick(rng, pool, used) {
  const fresh = pool.filter((s) => !used.has(s.id));
  const sp = rng.pick(fresh.length ? fresh : pool);
  used.add(sp.id);
  return sp;
}

/**
 * A random team of six for floor k at the given level: `fusions` gen-2 fusions built from three species of one
 * class, the rest single species from anywhere in the roster, no species twice.
 */
export function towerTeam(seed, k, level) {
  const t = towerTrainer(k);
  if (!t) throw new Error(`No tower floor ${k}.`);
  const rng = makeRng(seed);
  const used = new Set();
  const team = [];
  for (let f = 0; f < Math.min(t.fusions, TOWER.teamSize); f++) {
    const r = rng.fork(`fusion${f}`);
    const clade = r.pick(CLADE_IDS);
    const pool = WILD_SPECIES.filter((s) => s.clade === clade);
    const a = speciesGenome(towerPick(r.fork('a'), pool, used), r.fork('ga'));
    const b = speciesGenome(towerPick(r.fork('b'), pool, used), r.fork('gb'));
    const c = speciesGenome(towerPick(r.fork('c'), pool, used), r.fork('gc'));
    let g = a;
    if (canFuse(a, b).ok) { const ab = fuse(a, b, r.fork('f1')).child; g = canFuse(ab, c).ok ? fuse(ab, c, r.fork('f2')).child : ab; }
    team.push({ genome: g, level });
  }
  while (team.length < TOWER.teamSize) {
    const r = rng.fork(`species${team.length}`);
    team.push({ genome: speciesGenome(towerPick(r, WILD_SPECIES, used), r.fork('g')), level });
  }
  return rng.shuffle(team);
}

function towerState(j) {
  if (!j.tower || typeof j.tower !== 'object') j.tower = { challenges: 0, wins: {} };
  if (!j.tower.wins) j.tower.wins = {};
  return j.tower;
}

/** Wins recorded against floor k at a level. */
export function towerRecord(j, k, level) {
  const t = towerTrainer(k);
  const w = j.tower && j.tower.wins && j.tower.wins[t ? t.id : k];
  return w && w[level] ? w[level] : 0;
}

/** Every recorded win at a level, floors in order. */
export function towerRecords(j, level) { return TOWER_TRAINERS.map((t, k) => towerRecord(j, k, level)); }

/** Book a win against a floor at a level (called when the fight is folded back into the journey). */
export function recordTowerWin(j, towerId, level) {
  const st = towerState(j);
  st.wins[towerId] = st.wins[towerId] || {};
  st.wins[towerId][level] = (st.wins[towerId][level] || 0) + 1;
  return st.wins[towerId][level];
}

/** Challenge floor k at a level: rolls the team and sets the journey's pending encounter. */
export function challengeTower(j, k, level) {
  const t = towerTrainer(k);
  if (!t) return { ok: false, reason: 'No such floor.' };
  if (!TOWER.levels.includes(level)) return { ok: false, reason: `The tower fights at levels ${TOWER.levels.join(', ')}.` };
  if (j.encounter) return { ok: false, reason: 'Finish the fight in front of you first.' };
  if (!canFight(j)) return { ok: false, reason: 'Nobody in your party can fight.' };
  const st = towerState(j);
  st.challenges++;
  const team = towerTeam(`${j.seed}:tower:${t.id}:${level}:${st.challenges}`, k, level);
  j.encounter = {
    kind: 'tower', towerId: t.id, floor: k, level, name: t.name, line: t.line, capturable: false, biome: 'hub',
    foes: team.map((m) => ({ genome: m.genome, level: m.level })),
  };
  return { ok: true, encounter: j.encounter };
}
