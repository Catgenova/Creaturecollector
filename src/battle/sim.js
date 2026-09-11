// Headless simulation for balance checks and tests.
import { makeRng } from '../core/rng.js';
import { SPECIES } from '../data/species.js';
import { speciesGenome } from '../creature/genome.js';
import { createBattle, step, makeBattler } from './engine.js';
import { chooseAction } from './ai.js';

/** AI vs AI. Returns { winner, turns, state }. */
export function simulate({ partyA, partyB, level = 50, seed = 'sim', maxTurns = 300 }) {
  let { state } = createBattle({
    sides: [
      { name: 'A', ai: true, party: partyA.map((g) => makeBattler(g, level)) },
      { name: 'B', ai: true, party: partyB.map((g) => makeBattler(g, level)) },
    ],
    seed,
  });
  let guard = 0;
  while (state.phase !== 'over' && state.turn < maxTurns && guard++ < maxTurns * 3) {
    const rng = makeRng(`${seed}:ai:${state.turn}:${state.phase}`);
    const actions = [0, 1].map((i) => chooseAction(state, i, rng.fork(`s${i}`)));
    ({ state } = step(state, actions));
  }
  return { winner: state.winner, turns: state.turn, state };
}

/** Random species parties battle each other; returns per-species and per-type win rates. */
export function tournament({ games = 100, level = 50, seed = 'tourney', partySize = 3 } = {}) {
  const rng = makeRng(seed);
  const wins = {}, played = {}, typeWins = {}, typePlayed = {};
  let totalTurns = 0, draws = 0, timeouts = 0;
  const tally = (party, won) => {
    for (const g of party) {
      played[g.species] = (played[g.species] || 0) + 1;
      if (won) wins[g.species] = (wins[g.species] || 0) + 1;
      for (const t of g.types) if (t) { typePlayed[t] = (typePlayed[t] || 0) + 1; if (won) typeWins[t] = (typeWins[t] || 0) + 1; }
    }
  };
  for (let i = 0; i < games; i++) {
    const mk = (tag) => Array.from({ length: partySize }, (_, j) => speciesGenome(rng.pick(SPECIES), makeRng(`${seed}:${i}:${tag}:${j}`)));
    const A = mk('A'), B = mk('B');
    const r = simulate({ partyA: A, partyB: B, level, seed: `${seed}:${i}` });
    totalTurns += r.turns;
    if (r.state.phase !== 'over') timeouts++;
    if (r.winner == null) { draws++; tally(A, false); tally(B, false); continue; }
    tally(A, r.winner === 0); tally(B, r.winner === 1);
  }
  const rate = (w, p) => Object.fromEntries(Object.keys(p).sort().map((k) => [k, { played: p[k], winRate: Math.round(((w[k] || 0) / p[k]) * 100) }]));
  return { games, level, partySize, avgTurns: totalTurns / games, draws, timeouts, species: rate(wins, played), types: rate(typeWins, typePlayed) };
}

// ---- arena run simulation ----------------------------------------------------
import { activeOf, captureChance } from './engine.js';
import { newRun, chooseStarter, buildBattle, applyBattle, fuseMembers, skipAltar, canFight } from '../game/run.js';

/**
 * Play an arena run with the AI driving the player's side. Captures when the
 * odds are decent and the team has room; fuses the two weakest at altars.
 */
export function simulateRun(seed, { maxFloors = 40, capture = true, fuseAtAltar = true, teamCap = 8 } = {}) {
  const run = chooseStarter(newRun(seed), 0);
  const floors = [];
  while (run.phase === 'floor' && run.floor <= maxFloors) {
    if (run.altar) {
      if (fuseAtAltar && run.party.length >= 3) {
        const sorted = [...run.party].sort((a, b) => a.level - b.level);
        fuseMembers(run, sorted[0].uid, sorted[1].uid);
      } else skipAltar(run);
    }
    if (!canFight(run)) break;
    let { state } = buildBattle(run);
    let guard = 0;
    while (state.phase !== 'over' && guard++ < 600) {
      const rng = makeRng(`${seed}:run:${run.floor}:${state.turn}:${state.phase}`);
      let a0 = chooseAction(state, 0, rng.fork('s0'));
      if (capture && state.phase === 'choose' && state.capturable && run.party.length + run.box.length < teamCap) {
        const foe = activeOf(state, 1);
        if (captureChance(foe) >= 0.5) a0 = { type: 'capture' };
      }
      const a1 = chooseAction(state, 1, rng.fork('s1'));
      ({ state } = step(state, [a0, a1]));
    }
    const { report } = applyBattle(run, state);
    floors.push({ floor: report.floor, won: report.won, kind: report.kind, captured: Boolean(report.captured), party: run.party.length, lead: run.party[0] ? run.party[0].level : 0, foeLevel: state.sides[1].party[0].level, turns: state.turn });
    if (!report.won) break;
  }
  return { reached: run.phase === 'gameover' ? run.floor - 1 : Math.min(maxFloors, run.floor - 1), floors, run };
}

/** Many runs; returns the distribution of floors reached and where runs die. */
export function runStudy({ runs = 30, seed = 'study', maxFloors = 40, ...opts } = {}) {
  const reached = [], deaths = {}, kinds = { wild: [0, 0], trainer: [0, 0], boss: [0, 0] };
  let captures = 0, fusions = 0, turns = 0, battles = 0, gapSum = 0, gapN = 0;
  for (let i = 0; i < runs; i++) {
    const r = simulateRun(`${seed}:${i}`, { maxFloors, ...opts });
    reached.push(r.reached);
    captures += r.run.stats.captures; fusions += r.run.stats.fusions;
    for (const f of r.floors) { battles++; turns += f.turns; kinds[f.kind][f.won ? 0 : 1]++; if (!f.won) { deaths[f.floor] = (deaths[f.floor] || 0) + 1; gapSum += f.lead - f.foeLevel; gapN++; } }
  }
  reached.sort((a, b) => a - b);
  const q = (p) => reached[Math.min(reached.length - 1, Math.floor(p * reached.length))];
  return { runs, min: reached[0], p25: q(0.25), median: q(0.5), p75: q(0.75), max: reached[reached.length - 1], avgTurns: turns / battles, captures, fusions, deaths, kinds, levelGapAtDeath: gapN ? gapSum / gapN : 0 };
}
