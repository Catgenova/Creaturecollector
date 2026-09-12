import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES_BY_ID, WILD_SPECIES } from '../src/data/species.js';
import { speciesGenome, validateGenome, randomGenome, ROLL } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { MORPHS, MORPH_IDS, morphPalette, harmonizePalette } from '../src/creature/palette.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { emptySave, normalizeSave, recordCollection, exportSave, importSave } from '../src/game/save.js';
import { dexSeen, dexCaught, dexCounts, dexStatus, dexMorphs, dexHabitat, dexRewards, claimDexReward, dexSpeciesOf, DEX_REWARDS, normalizeDex } from '../src/game/dex.js';
import { newJourney, chooseJourneyStarter, tryMove } from '../src/game/journey.js';
import { worldFor } from '../src/game/world.js';
import { bagCount } from '../src/game/market.js';

test('colour morphs: rare on the roll, pinned palettes that apply twice unchanged, kept through validation and fusion', () => {
  let morphs = 0, byKind = {};
  const N = 6000;
  for (let i = 0; i < N; i++) { const g = randomGenome(makeRng(`morph${i}`)); if (g.morph) { morphs++; byKind[g.morph] = (byKind[g.morph] || 0) + 1; assert.ok(MORPH_IDS.includes(g.morph)); } }
  assert.ok(morphs > N * ROLL.morph * 0.4 && morphs < N * ROLL.morph * 2.5, `${morphs} morphs in ${N}`);
  assert.ok(Object.keys(byKind).length >= 2, JSON.stringify(byKind));
  const base = speciesGenome(SPECIES_BY_ID.emberox, makeRng('plain')).palette;
  for (const m of MORPH_IDS) {
    const once = morphPalette(base, m), twice = morphPalette(once, m);
    assert.deepEqual(twice, once, `${m} is idempotent`);
    assert.ok(MORPHS[m].name && MORPHS[m].desc);
  }
  assert.ok(morphPalette(base, 'albino').c1[2] >= 85 && morphPalette(base, 'melanistic').c1[2] <= 20 && morphPalette(base, 'pastel').c1[1] < base.c1[1] + 40);
  // an albino renders and its coat is pale after harmonizing
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('albino-me'));
  g.morph = 'albino'; g.palette = harmonizePalette(morphPalette(g.palette, 'albino'));
  assert.ok(g.palette.c1[2] > 80);
  assert.ok(renderCreatureSvg(g, { id: 'a', animate: false }).length > 500);
  const v = validateGenome(JSON.parse(JSON.stringify(g)));
  assert.equal(v.morph, 'albino');
  const junk = validateGenome(JSON.parse(JSON.stringify({ ...g, morph: 'plaid' })));
  assert.equal(junk.morph, undefined);
  // the morph travels with the face in fusion
  const other = speciesGenome(SPECIES_BY_ID.glacub, makeRng('glacub-plain'));
  let seenMorph = 0, trials = 0;
  for (let i = 0; i < 12; i++) {
    const { child, report } = fuse(g, other, makeRng(`mf${i}`));
    trials++;
    if (report.identity === 0) { assert.equal(child.morph, 'albino'); assert.ok(child.palette.c1[2] > 80, 'the child coat is pinned pale'); seenMorph++; }
    else assert.equal(child.morph, undefined);
  }
  assert.ok(seenMorph > 0 && trials === 12);
});

test('the dex records seen and caught species and morphs, counts per class, and gives habitat hints', () => {
  const save = emptySave();
  const a = speciesGenome(SPECIES_BY_ID.emberox, makeRng('d1')), b = speciesGenome(SPECIES_BY_ID.glacub, makeRng('d2'));
  assert.equal(dexStatus(save, 'emberox'), 'unseen');
  assert.equal(dexSeen(save, a), true);
  assert.equal(dexSeen(save, a), false, 'seen once is seen');
  assert.equal(dexStatus(save, 'emberox'), 'seen');
  assert.equal(dexCaught(save, a), true);
  assert.equal(dexStatus(save, 'emberox'), 'caught');
  assert.equal(dexCaught(save, a), false);
  b.morph = 'pastel';
  dexSeen(save, b);
  assert.deepEqual(dexMorphs(save, 'glacub'), { pastel: 1 });
  dexCaught(save, b);
  assert.deepEqual(dexMorphs(save, 'glacub'), { pastel: 2 });
  const c = dexCounts(save);
  assert.equal(c.total, WILD_SPECIES.length);
  assert.equal(c.caught, 2); assert.equal(c.seen, 2); assert.equal(c.morphs, 1);
  assert.equal(c.byClass.mammal.caught, 2);
  assert.equal(c.byClass.mammal.total, WILD_SPECIES.filter((s) => s.clade === 'mammal').length);
  const fusion = fuse(a, b, makeRng('df')).child;
  assert.equal(dexCaught(save, fusion), false, 'fusions have no species entry');
  assert.deepEqual(dexHabitat('emberox'), { region: 'Heather Downs', types: SPECIES_BY_ID.emberox.types.filter(Boolean) });
  assert.equal(dexHabitat('nope'), null);
  const list = dexSpeciesOf('mammal');
  assert.equal(list.length, c.byClass.mammal.total);
  assert.ok(list.findIndex((s) => s.tier === 'rare') > list.findIndex((s) => s.tier === 'common'), 'commons first, rares last');
});

test('rewards unlock by species caught, pay into the journey once per save, and the dex survives the save', () => {
  const save = emptySave();
  save.journey = newJourney('dexj'); chooseJourneyStarter(save.journey, 0);
  const tiers = dexRewards(save);
  assert.equal(tiers.length, DEX_REWARDS.length);
  assert.ok(tiers.every((t) => t.state === 'locked'));
  assert.equal(claimDexReward(save, 0).ok, false);
  const species = WILD_SPECIES.slice(0, 30);
  for (const s of species) dexCaught(save, speciesGenome(s, makeRng(`r${s.id}`)));
  const now = dexRewards(save);
  assert.equal(now[0].state, 'ready'); assert.equal(now[1].state, 'ready'); assert.equal(now[2].state, 'locked');
  const gold = save.journey.gold || 0;
  const r0 = claimDexReward(save, 0);
  assert.ok(r0.ok && save.journey.gold === gold + DEX_REWARDS[0].gold);
  assert.equal(claimDexReward(save, 0).ok, false, 'once');
  const r1 = claimDexReward(save, 1);
  assert.ok(r1.ok && bagCount(save.journey, DEX_REWARDS[1].charm) === 1);
  assert.equal(dexRewards(save)[0].state, 'claimed');
  // round trip, with junk mixed in
  const raw = JSON.parse(exportSave(save).length ? JSON.stringify(save) : '{}');
  raw.dex.seen.nope = 1; raw.dex.caught.nope = 1; raw.dex.morphs.emberox = { plaid: 1 }; raw.dex.claimed.push(99, 0);
  const back = normalizeSave(raw);
  assert.equal(back.dex.seen.nope, undefined);
  assert.equal(back.dex.morphs.emberox, undefined);
  assert.deepEqual(back.dex.claimed, [0, 1]);
  // the journey's starter is folded in on load, unless it was already among the thirty
  const starter = save.journey.party[0].genome.species;
  const expected = 30 + (species.some((s) => s.id === starter) ? 0 : 1);
  assert.equal(dexCounts(back).caught, expected);
  const again = importSave(exportSave(save));
  assert.equal(dexCounts(again).caught, expected);
  // an older save without a dex fills it from the collection and the party
  const old = emptySave();
  recordCollection(old, speciesGenome(SPECIES_BY_ID.pufflet, makeRng('old')));
  old.journey = newJourney('olds'); chooseJourneyStarter(old.journey, 1);
  const rawOld = JSON.parse(JSON.stringify(old)); delete rawOld.dex;
  const seeded = normalizeSave(rawOld);
  assert.equal(dexStatus(seeded, 'pufflet'), 'caught');
  assert.equal(dexStatus(seeded, seeded.journey.party[0].genome.species), 'caught');
  assert.equal(normalizeDex(null).claimed.length, 0);
});

test('a wild morph is announced by name', () => {
  // find a seed whose spawn is a morph by walking a habitat tile many times
  const j = newJourney('morphwalk'); chooseJourneyStarter(j, 0);
  const world = worldFor(j.seed);
  let x = -1, y = -1;
  outer: for (let yy = 2; yy < world.h - 2; yy++) for (let xx = 2; xx < world.w - 2; xx++) if (world.tiles[yy * world.w + xx] === 1 && world.tiles[yy * world.w + xx + 1] === 1) { x = xx; y = yy; break outer; }
  let found = null;
  for (let i = 0; i < 20000 && !found; i++) {
    j.player.x = x; j.player.y = y; j.cooldown = 0; j.encounter = null; j.stats.steps = i;
    const r = tryMove(j, 'right');
    if (r.event && r.event.kind === 'encounter' && r.event.encounter.foes[0].genome.morph) found = r.event.encounter;
  }
  assert.ok(found, 'a morph turned up within twenty thousand steps');
  assert.ok(found.name.includes(MORPHS[found.foes[0].genome.morph].name), found.name);
});
