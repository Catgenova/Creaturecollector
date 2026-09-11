// Cross-screen state. In-memory for now; the save system (Phase 4) will persist it.
export const fusionPool = { seed: null, genomes: [] };

export const POOL_MAX = 24;

/** Add a genome to the fusion pool, newest first. Returns false if it was already there. */
export function addToPool(g) {
  if (fusionPool.genomes.some((x) => x === g || (x.seed === g.seed && x.name === g.name && x.gen === g.gen))) return false;
  fusionPool.genomes.unshift(g);
  if (fusionPool.genomes.length > POOL_MAX) fusionPool.genomes.length = POOL_MAX;
  return true;
}

export function removeFromPool(g) {
  const i = fusionPool.genomes.indexOf(g);
  if (i >= 0) fusionPool.genomes.splice(i, 1);
}
