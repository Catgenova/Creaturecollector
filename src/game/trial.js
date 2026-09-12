// The Trial of the Day: one gauntlet a day, the same for every player on that date, entered from the
// Council Spire once you are champion. Three fights back to back under a rule drawn from the day's
// seed, at a fixed level, with the party you walked in with. Wins pay gold and set a personal best.
import { makeRng } from '../core/rng.js';
import { WILD_SPECIES } from '../data/species.js';
import { TYPE_LIST } from '../data/types.js';
import { CLADE_IDS } from '../data/clades.js';
import { combatStyle } from '../data/damage.js';
import { speciesGenome } from '../creature/genome.js';
import { fuse, canFuse } from '../creature/fusion.js';

export const TRIAL = { fights: 3, level: 70, teamSize: 4, goldPerFight: 900, bonus: 2500 };

/** The day a trial belongs to, in UTC, as YYYY-MM-DD. */
export function trialDay(now = new Date()) { return new Date(now).toISOString().slice(0, 10); }

/**
 * The rules a day can draw. Each one narrows what the player may bring, or what the day's teams are
 * made of, so the same party cannot walk every trial.
 */
export const TRIAL_RULES = [
  { id: 'banned', name: 'Type Ban', text: (r) => `No ${r.type} creatures in your party.`, pick: (rng) => ({ type: rng.pick(TYPE_LIST) }) },
  { id: 'style', name: 'One Discipline', text: (r) => `Only ${r.style} fighters may enter.`, pick: (rng) => ({ style: rng.pick(['melee', 'ranged', 'magic']) }) },
  { id: 'clade', name: 'One Kind', text: (r) => `Only ${r.clade}s may enter.`, pick: (rng) => ({ clade: rng.pick(CLADE_IDS) }) },
  { id: 'small', name: 'Short Handed', text: () => 'Bring no more than three creatures.', pick: () => ({ max: 3 }) },
  { id: 'bare', name: 'Bare Handed', text: () => 'No held charms.', pick: () => ({ noCharms: true }) },
  { id: 'pure', name: 'No Fusions', text: () => 'No shrine-born creatures.', pick: () => ({ noFusions: true }) },
];

/** The rule and the theme for a given day. Everyone who plays that day gets the same one. */
export function trialOf(day = trialDay()) {
  const rng = makeRng(`trial:${day}`);
  const rule = TRIAL_RULES[Math.floor(rng.next() * TRIAL_RULES.length)];
  const params = rule.pick(rng.fork('params'));
  const theme = rng.pick(CLADE_IDS); // the day's opposition leans one class
  return { day, ruleId: rule.id, name: rule.name, text: rule.text(params), params, theme, level: TRIAL.level, fights: TRIAL.fights };
}

/** Why a party cannot enter today, or null when it may. */
export function trialBlock(j, trial = trialOf()) {
  const party = (j.party || []).filter((m) => m.hp > 0);
  if (!party.length) return 'Nothing in your party can fight.';
  const p = trial.params;
  if (p.max != null && party.length > p.max) return `Today asks for no more than ${p.max}; you have ${party.length}.`;
  if (p.type && party.some((m) => m.genome.types.includes(p.type))) return `Today bars ${p.type} creatures.`;
  if (p.style && party.some((m) => combatStyle(m.genome.stats) !== p.style)) return `Today is for ${p.style} fighters alone.`;
  if (p.clade && party.some((m) => m.genome.clade !== p.clade)) return `Today is for ${p.clade}s alone.`;
  if (p.noCharms && party.some((m) => m.held)) return 'Today is bare handed: take the charms off first.';
  if (p.noFusions && party.some((m) => m.genome.gen > 0)) return 'Today bars shrine-born creatures.';
  return null;
}

/** The opposition for one fight of the day: four creatures leaning the day's class, at the trial level. */
export function trialTeam(trial, stage) {
  const rng = makeRng(`trial:${trial.day}:${stage}`);
  const themed = WILD_SPECIES.filter((s) => s.clade === trial.theme);
  const used = new Set();
  const team = [];
  const pick = (pool) => {
    const fresh = pool.filter((s) => !used.has(s.id));
    const sp = rng.pick(fresh.length ? fresh : pool);
    used.add(sp.id);
    return sp;
  };
  // the last fight leads with a fusion of the day's class
  if (stage === TRIAL.fights - 1 && themed.length > 2) {
    const a = speciesGenome(pick(themed), rng.fork('fa')), b = speciesGenome(pick(themed), rng.fork('fb'));
    if (canFuse(a, b).ok) team.push({ genome: fuse(a, b, rng.fork('ff')).child, level: trial.level });
  }
  while (team.length < TRIAL.teamSize) {
    const pool = rng.chance(0.7) && themed.length ? themed : WILD_SPECIES;
    team.push({ genome: speciesGenome(pick(pool), rng.fork(`g${team.length}`)), level: trial.level - (team.length % 2) });
  }
  return team;
}

/** The journey's record for a day: how far it has gone, and whether it has been cleared. */
export function trialState(j, day = trialDay()) {
  const t = (j.trials && j.trials[day]) || null;
  return { day, stage: t ? t.stage : 0, cleared: Boolean(t && t.cleared), tries: t ? t.tries : 0 };
}

/** Start today's trial: sets the run and hands back the first encounter. */
export function enterTrial(j, day = trialDay()) {
  if (j.encounter || j.gauntlet) return { ok: false, reason: 'Finish what you are in first.' };
  if (!j.champion) return { ok: false, reason: 'The Trial opens to champions.' };
  const trial = trialOf(day);
  const state = trialState(j, day);
  if (state.cleared) return { ok: false, reason: 'Today\'s Trial is already behind you. Another comes tomorrow.' };
  const block = trialBlock(j, trial);
  if (block) return { ok: false, reason: block };
  j.trials = j.trials || {};
  j.trials[day] = { stage: 0, cleared: false, tries: (j.trials[day] ? j.trials[day].tries : 0) + 1 };
  j.trial = { day, stage: 0 };
  j.encounter = trialEncounter(trial, 0);
  return { ok: true, trial, encounter: j.encounter };
}

export function trialEncounter(trial, stage) {
  return {
    kind: 'trial', day: trial.day, stage, name: `Trial of ${trial.day}`, line: trial.text,
    foes: trialTeam(trial, stage).map((m) => ({ genome: m.genome, level: m.level })), capturable: false, biome: trial.theme,
  };
}

/** Gold for finishing a stage, with a bonus for the last one. */
export function trialGold(stage) { return TRIAL.goldPerFight + (stage === TRIAL.fights - 1 ? TRIAL.bonus : 0); }
