// Team planning: what the party can hit, what hits the party, and how its damage types are spread.
// Pure functions over party members, so the Dex screen and the tests read the same numbers.
import { TYPE_LIST, typeEffectiveness } from '../data/types.js';
import { getMove, isDamaging } from '../data/moves.js';
import { combatStyle } from '../data/damage.js';

/** The damaging moves a member currently knows. */
function attacks(m) {
  return (m.moves || []).map((id) => getMove(id)).filter((mv) => mv && isDamaging(mv) && !mv.typeless);
}

/**
 * For every type, the best multiplier the party can bring against a creature of that single type,
 * and who brings it. 0 means nobody can touch it, 1 means nobody is strong against it.
 */
export function teamCoverage(party) {
  return TYPE_LIST.map((type) => {
    let best = 0, by = null, move = null;
    for (const m of party || []) {
      for (const mv of attacks(m)) {
        const eff = typeEffectiveness(mv.type, [type]);
        if (eff > best) { best = eff; by = m; move = mv; }
      }
    }
    return { type, best, by: by && by.genome ? by.genome.name : null, move: move ? move.name : null };
  });
}

/** For every attacking type, how many of the party take double damage or more from it. */
export function teamThreats(party) {
  return TYPE_LIST.map((type) => {
    const hit = (party || []).filter((m) => typeEffectiveness(type, (m.genome.types || []).filter(Boolean)) >= 2);
    return { type, count: hit.length, names: hit.map((m) => m.genome.name) };
  });
}

/** How the party's attackers split across the damage triangle, by each creature's own style. */
export function teamStyles(party) {
  const out = { melee: 0, ranged: 0, magic: 0 };
  for (const m of party || []) out[combatStyle(m.genome.stats)] = (out[combatStyle(m.genome.stats)] || 0) + 1;
  return out;
}

/** The short reading of a party: holes it cannot hit, types that maul it, and its triangle spread. */
export function teamReport(party) {
  const coverage = teamCoverage(party);
  return {
    coverage,
    threats: teamThreats(party),
    styles: teamStyles(party),
    blind: coverage.filter((c) => c.best === 0).map((c) => c.type),
    resisted: coverage.filter((c) => c.best > 0 && c.best < 1).map((c) => c.type),
    strong: coverage.filter((c) => c.best >= 2).map((c) => c.type),
  };
}
