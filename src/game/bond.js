// Bond: what a creature picks up from travelling with you rather than sitting in a box.
//
// It is not a stat and it cannot be bought. It comes from fighting alongside you, from the levels it
// earns on the road, and from the big fights it survives; it goes back a little when it falls. Five
// tiers, each one buying something small the coach and the Rookery cannot sell: a status shaken off, a
// hit survived, a sharper eye, and at the top a shade more of everything.
//
// Only the player's own creatures carry it. Wild creatures, trainers, Wardens and the tournament
// simulator all fight at bond zero, so the 40-60% band the tuner keeps is untouched by any of this.
export const BOND = {
  perBattle: 2, // fought and still standing at the end
  perLevel: 3,
  perBoss: 12, // a Warden, a Titan, the Council, a Trial
  perFaint: -15,
  perRelease: 0,
  max: 400,
};

/** The five tiers, in order, with what each one is worth in a fight. */
export const BOND_TIERS = [
  { tier: 0, at: 0, name: 'New', line: 'It hardly knows you yet.' },
  { tier: 1, at: 40, name: 'Willing', line: 'Once a battle, shakes off a status at the end of the turn.', cure: true },
  { tier: 2, at: 110, name: 'Trusted', line: 'Once a battle, hangs on with 1 HP when a blow would knock it out.', cure: true, endure: true },
  { tier: 3, at: 220, name: 'Sworn', line: 'Critical hits land half again as often.', cure: true, endure: true, critMul: 1.5 },
  { tier: 4, at: 340, name: 'Inseparable', line: 'Every stat is 1.05x, and everything below.', cure: true, endure: true, critMul: 1.5, statMul: 1.05 },
];

/** Bond points on a member, clamped and never negative. */
export function bondOf(member) { return Math.max(0, Math.min(BOND.max, Math.round((member && member.bond) || 0))); }

/** The tier a number of points sits in. */
export function bondTier(points) {
  let out = BOND_TIERS[0];
  for (const t of BOND_TIERS) if (points >= t.at) out = t;
  return out;
}
/** The tier a member is at. */
export function bondOfMember(member) { return bondTier(bondOf(member)); }

/** What the next tier is and how far off it is, for a bar. { next, need, have, frac } — next is null at the top. */
export function bondProgress(member) {
  const have = bondOf(member);
  const tier = bondTier(have);
  const next = BOND_TIERS[tier.tier + 1] || null;
  if (!next) return { tier, next: null, have, need: 0, frac: 1 };
  const span = next.at - tier.at;
  return { tier, next, have, need: next.at - have, frac: span > 0 ? (have - tier.at) / span : 1 };
}

/** Move a member's bond by some points. Returns { from, to, tier, rose } so a report can mention a new tier. */
export function addBond(member, points) {
  if (!member) return { from: 0, to: 0, tier: BOND_TIERS[0], rose: false };
  const from = bondOf(member);
  const to = Math.max(0, Math.min(BOND.max, from + Math.round(points || 0)));
  member.bond = to;
  const before = bondTier(from), after = bondTier(to);
  return { from, to, tier: after, rose: after.tier > before.tier };
}

/**
 * What one battle did for the creatures that were in it.
 * `outcome`: { won, boss, fought:Set(uid), fainted:Set(uid), levels: { uid: gained } }
 * Returns the tier rises, so the result card can say one of them grew closer to you.
 */
export function bondAfterBattle(party, outcome) {
  const rises = [];
  for (const m of party || []) {
    let points = 0;
    if (outcome.fought && outcome.fought.has(m.uid)) points += outcome.won ? BOND.perBattle : 0;
    if (outcome.won && outcome.boss && outcome.fought && outcome.fought.has(m.uid)) points += BOND.perBoss;
    if (outcome.levels && outcome.levels[m.uid]) points += BOND.perLevel * outcome.levels[m.uid];
    if (outcome.fainted && outcome.fainted.has(m.uid)) points += BOND.perFaint;
    if (!points) continue;
    const r = addBond(m, points);
    if (r.rose) rises.push({ uid: m.uid, name: m.genome ? m.genome.name : '', tier: r.tier });
  }
  return rises;
}

/** The perks a number of bond points hands the engine. Zero points buys nothing, which is what everything but the player's own party has. */
export function bondPerks(points) {
  const t = bondTier(Math.max(0, Math.floor(points || 0)));
  return { tier: t.tier, cure: Boolean(t.cure), endure: Boolean(t.endure), critMul: t.critMul || 1, statMul: t.statMul || 1 };
}
