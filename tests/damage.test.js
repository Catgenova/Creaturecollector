import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { MOVES, getMove, isDamaging } from '../src/data/moves.js';
import { DAMAGE_TYPES, DAMAGE_TYPE_IDS, STAT_KEYS, STAGE_KEYS, triangleMul, triangleEdge, combatStyle, migrateStatWeights, migrateVigor, isOldStatLayout } from '../src/data/damage.js';
import { speciesGenome, validateGenome, baseStats, combatStyleOf, encodeGenome, decodeGenome } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { makeBattler, calcDamage, createBattle, step, activeOf } from '../src/battle/engine.js';
import { effText, triangleText } from '../src/ui/fight.js';

test('the triangle: Magic > Ranged > Melee > Magic', () => {
  assert.ok(triangleMul('magic', 'ranged') > 1 && triangleMul('ranged', 'melee') > 1 && triangleMul('melee', 'magic') > 1);
  assert.ok(triangleMul('ranged', 'magic') < 1 && triangleMul('melee', 'ranged') < 1 && triangleMul('magic', 'melee') < 1);
  for (const k of DAMAGE_TYPE_IDS) assert.equal(triangleMul(k, k), 1);
  assert.equal(triangleMul('status', 'melee'), 1);
  assert.equal(triangleEdge('magic', 'ranged'), 'edge');
  assert.equal(triangleEdge('ranged', 'magic'), 'weak');
  assert.equal(triangleEdge('melee', 'melee'), null);
  for (const k of DAMAGE_TYPE_IDS) assert.equal(DAMAGE_TYPES[DAMAGE_TYPES[k].beats].beats !== k, true, 'no two-way beats');
});

test('every damaging move has a damage type and every species eight weights and a style', () => {
  for (const mv of MOVES) {
    if (isDamaging(mv)) assert.ok(DAMAGE_TYPES[mv.cat], `${mv.id} cat ${mv.cat}`);
    else assert.equal(mv.cat, 'status', mv.id);
    for (const f of mv.fx) if (f.k === 'stat') for (const k of Object.keys(f.stats)) assert.ok(STAGE_KEYS.includes(k), `${mv.id} stat ${k}`);
  }
  const styles = { melee: 0, ranged: 0, magic: 0 };
  for (const s of SPECIES) {
    for (const k of STAT_KEYS) assert.ok(Number.isFinite(s.stats[k]) && s.stats[k] > 0, `${s.id} ${k}`);
    assert.equal(Object.keys(s.stats).length, STAT_KEYS.length, `${s.id} extra stats`);
    styles[combatStyle(s.stats)]++;
  }
  for (const k of DAMAGE_TYPE_IDS) assert.ok(styles[k] >= 10, `${k} styles ${styles[k]}`);
  assert.equal(combatStyle(SPECIES_BY_ID.bruxor.stats), 'melee');
  assert.equal(combatStyle(SPECIES_BY_ID.mystril.stats), 'magic');
  assert.equal(combatStyle(SPECIES_BY_ID.craggon.stats), 'ranged');
});

test('every species can fight in its own style at low, mid and high levels', () => {
  const bands = [[1, 22], [23, 40], [41, 99]];
  for (const s of SPECIES) {
    const style = combatStyle(s.stats);
    for (const [lo, hi] of bands) {
      const ok = s.learnset.some(([l, id]) => l >= lo && l <= hi && isDamaging(getMove(id)) && getMove(id).cat === style);
      assert.ok(ok, `${s.id} (${style}) has no ${style} attack between levels ${lo} and ${hi}`);
    }
  }
  // and every type offers all three damage types somewhere
  for (const t of new Set(MOVES.map((m) => m.type))) {
    for (const dt of DAMAGE_TYPE_IDS) assert.ok(MOVES.some((m) => m.type === t && m.cat === dt), `${t} has no ${dt} move`);
  }
});

test('damage uses the matching attack and defense stat, and the triangle', () => {
  const g = speciesGenome(SPECIES_BY_ID.bruxor, makeRng('d'));
  const foeG = speciesGenome(SPECIES_BY_ID.mystril, makeRng('df'));
  const user = makeBattler(g, 50), foe = makeBattler(foeG, 50);
  assert.equal(user.style, 'melee');
  assert.equal(foe.style, 'magic');
  const melee = getMove('slab_break'), magic = getMove('psi_shock'), ranged = getMove('stone_toss');
  // melee beats a magic-style foe, ranged loses to it
  const meleeVsMagic = calcDamage(user, foe, melee, 1, 1, false);
  const softFoe = { ...foe, style: 'melee' };
  assert.ok(meleeVsMagic > calcDamage(user, softFoe, melee, 1, 1, false), 'melee hits a Magic-style target harder');
  const rangedVsMagic = calcDamage(user, foe, ranged, 1, 1, false);
  assert.ok(rangedVsMagic < calcDamage(user, { ...foe, style: 'ranged' }, ranged, 1, 1, false), 'ranged hits a Magic-style target softer');
  // the defensive stat matters: a magic move against boosted Magic Def does less
  const base = calcDamage(user, foe, magic, 1, 1, false);
  const tough = structuredClone(foe); tough.stats.magicDef *= 2;
  assert.ok(calcDamage(user, tough, magic, 1, 1, false) < base);
  const toughMelee = structuredClone(foe); toughMelee.stats.meleeDef *= 2;
  assert.equal(calcDamage(user, toughMelee, magic, 1, 1, false), base, 'Melee Def does not touch magic');
  // burn halves melee and ranged, not magic
  const burned = { ...user, status: 'brn' };
  assert.ok(calcDamage(burned, foe, melee, 1, 1, false) < calcDamage(user, foe, melee, 1, 1, false));
  assert.equal(calcDamage(burned, foe, magic, 1, 1, false), calcDamage(user, foe, magic, 1, 1, false));
  // stat moves stage the new keys and a whole battle turn runs
  const { state } = createBattle({ seed: 'tri', sides: [{ name: 'You', party: [makeBattler(g, 50, { moves: ['muscle_up'] })] }, { name: 'Foe', party: [makeBattler(foeG, 50, { moves: ['meditate'] })] }] });
  const after = step(state, [{ type: 'move', index: 0 }, { type: 'move', index: 0 }]).state;
  assert.equal(activeOf(after, 0).stages.melee, 1);
  assert.equal(activeOf(after, 0).stages.meleeDef, 1);
  assert.equal(activeOf(after, 1).stages.magic, 1);
  assert.equal(activeOf(after, 1).stages.magicDef, 1);
});

test('move cards describe effectiveness and the triangle in words', () => {
  const foe = makeBattler(speciesGenome(SPECIES_BY_ID.mystril, makeRng('t')), 50); // Psychic, magic style
  assert.equal(effText(getMove('chomp'), foe), 'Super effective');
  assert.equal(effText(getMove('aura_cannon'), foe), 'Not very effective');
  assert.equal(effText(getMove('bump'), foe), '');
  assert.equal(triangleText(getMove('chomp'), foe), 'Strong vs Magic');
  assert.equal(triangleText(getMove('stone_toss'), foe), 'Weak vs Magic');
  assert.equal(triangleText(getMove('psi_shock'), foe), '');
  assert.equal(triangleText(getMove('glare'), foe), '');
  const ghost = makeBattler(speciesGenome(SPECIES_BY_ID.phantoom, makeRng('gh')), 50);
  assert.equal(effText(getMove('bump'), ghost), 'No effect');
});

test('creatures saved with the old six stats migrate onto the eight', () => {
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('m'));
  const old = JSON.parse(JSON.stringify(g));
  old.stats = { hp: 0.16, atk: 0.19, def: 0.13, spa: 0.2, spd: 0.13, spe: 0.19 };
  old.vigor = { hp: 0.5, atk: 0.9, def: 0.1, spa: 0.7, spd: 0.3, spe: 0.6 };
  assert.ok(isOldStatLayout(old.stats));
  const v = validateGenome(old);
  const sum = STAT_KEYS.reduce((a, k) => a + v.stats[k], 0);
  assert.ok(Math.abs(sum - 1) < 0.01, `weights sum ${sum}`);
  for (const k of STAT_KEYS) assert.ok(v.stats[k] > 0 && v.vigor[k] >= 0 && v.vigor[k] <= 1, k);
  assert.equal(combatStyleOf(v), combatStyle(SPECIES_BY_ID.emberox.stats), 'a known species keeps its species style');
  assert.equal(v.vigor.magic, 0.7);
  assert.equal(v.vigor.rangedDef, 0.1);
  const bs = baseStats(v);
  for (const k of STAT_KEYS) assert.ok(bs[k] >= 20, k);
  // an unknown-species (fused) old creature leans on its bigger old pool
  const fused = fuse(g, speciesGenome(SPECIES_BY_ID.howlune, makeRng('m2')), makeRng('mf')).child;
  const oldFused = JSON.parse(JSON.stringify(fused));
  oldFused.stats = { hp: 0.2, atk: 0.25, def: 0.15, spa: 0.1, spd: 0.15, spe: 0.15 };
  assert.equal(combatStyleOf(validateGenome(oldFused)), 'melee');
  const w = migrateStatWeights({ hp: 0.2, atk: 0.1, def: 0.15, spa: 0.25, spd: 0.15, spe: 0.15 }, 'ranged');
  assert.equal(combatStyle(w), 'ranged');
  assert.deepEqual(Object.keys(migrateVigor({})).sort(), [...STAT_KEYS].sort());
  // and codes round-trip in the new layout
  assert.deepEqual(decodeGenome(encodeGenome(v)).stats, v.stats);
});
