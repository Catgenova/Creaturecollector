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
