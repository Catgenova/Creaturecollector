// The field: the weather overhead and the ground underfoot, what sets it, what pays for it and who it spares.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { getMove, MOVE_FX_KINDS } from '../src/data/moves.js';
import { ABILITIES, ABILITY_IDS } from '../src/data/abilities.js';
import { WEATHER, TERRAIN, WEATHER_IDS, TERRAIN_IDS, FIELD, emptyField, weatherChips, weatherGuard } from '../src/data/field.js';
import { speciesGenome } from '../src/creature/genome.js';
import { createBattle, step, makeBattler, calcDamage, activeMove, activeOf, effectiveStat, grounded, liveField, PASSIVE_KINDS } from '../src/battle/engine.js';
import { chooseAction } from '../src/battle/ai.js';

const mk = (id, ab, opts = {}) => makeBattler(speciesGenome(SPECIES_BY_ID[id], makeRng(`fld-${id}`)), opts.level || 50, { ability: ab, ...opts });
const fight = (a, b, opts = {}) => createBattle({ sides: [{ name: 'A', party: Array.isArray(a) ? a : [a] }, { name: 'B', party: Array.isArray(b) ? b : [b] }], seed: opts.seed || 'fld', field: opts.field || null });
const play = (st, ma = 0, mb = 0) => step(st, [{ type: 'move', index: ma }, { type: 'move', index: mb }]);
const near = (a, b, m) => Math.abs(a - b * m) <= Math.ceil(b * 0.03) + 1;
const dmg = (u, t, id, field, eff = 1) => calcDamage(u, t, getMove(id), eff, 1, false, field);
const F = (weather, terrain) => ({ ...emptyField(), weather, terrain });

test('the tables are well formed and the engine reads every kind they use', () => {
  for (const id of WEATHER_IDS) {
    const w = WEATHER[id];
    assert.ok(w.name && w.line && w.over && w.desc && w.icon && w.color, id);
    if (w.chip) assert.ok(Array.isArray(w.safe) && w.safe.length, `${id} chips but spares nobody`);
  }
  for (const id of TERRAIN_IDS) {
    const t = TERRAIN[id];
    assert.ok(t.name && t.line && t.over && t.desc, id);
    assert.ok(t.boost || t.damp || t.heal || t.noSleep || t.noStatus, `${id} does nothing`);
  }
  for (const k of ['weather', 'terrain', 'clearField', 'weatherPower', 'terrainPower', 'sureShotIn', 'weatherType']) assert.ok(MOVE_FX_KINDS.includes(k), k);
});

test('the sky doubles down on its own and smothers its opposite', () => {
  const foe = mk('pufflet', 'lucky_streak'), fire = mk('emberox', 'lucky_streak'), water = mk('finnip', 'lucky_streak');
  assert.ok(near(dmg(fire, foe, 'fire_stream', F('sun')), dmg(fire, foe, 'fire_stream', null), 1.5), 'Fire in the sun');
  assert.ok(near(dmg(fire, foe, 'fire_stream', F('rain')), dmg(fire, foe, 'fire_stream', null), 0.5), 'and smothered in the rain');
  assert.ok(near(dmg(water, foe, 'water_jet', F('rain')), dmg(water, foe, 'water_jet', null), 1.5), 'Water in the rain');
  assert.ok(near(dmg(water, foe, 'water_jet', F('sun')), dmg(water, foe, 'water_jet', null), 0.5), 'and steaming away in the sun');
  assert.ok(near(dmg(fire, foe, 'headbonk', F('sun')), dmg(fire, foe, 'headbonk', null), 1), 'a Normal move is nobody’s business');
});

test('grit and cold wear a fight down, and prop up the ones born in them', () => {
  assert.equal(weatherChips('sand', ['Normal']), FIELD.chip);
  assert.equal(weatherChips('sand', ['Rock']), 0);
  assert.equal(weatherChips('snow', ['Ice']), 0);
  assert.equal(weatherChips('snow', ['Rock']), FIELD.chip);
  assert.equal(weatherChips('sun', ['Normal']), 0);
  assert.equal(weatherGuard('sand', ['Rock'], 'magicDef'), 1.5);
  assert.equal(weatherGuard('sand', ['Rock'], 'meleeDef'), 1);
  assert.equal(weatherGuard('snow', ['Ice'], 'meleeDef'), 1.5);

  const rock = mk('craggon', 'lucky_streak', { moves: ['brace'] }), plain = mk('pufflet', 'lucky_streak', { moves: ['brace'] });
  const st = play(fight(rock, plain, { field: { weather: 'sand' }, seed: 'grit' }).state).state;
  assert.equal(activeOf(st, 0).hp, activeOf(st, 0).maxHp, 'the rock does not mind the sand');
  assert.ok(activeOf(st, 1).hp < activeOf(st, 1).maxHp, 'and everything else does');

  const hitter = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(hitter, rock, 'ghostflame', F('sand')), dmg(hitter, rock, 'ghostflame', null), 1 / 1.5), 'Rock keeps its Magic Def up in the sand');
});

test('a terrain only reaches what is standing on it', () => {
  const grass = mk('sprigget', 'lucky_streak'), foe = mk('pufflet', 'lucky_streak'), flyer = mk('zephyrn', 'lucky_streak');
  assert.ok(grounded(grass) && !grounded(flyer), 'the bird is above it');
  assert.ok(near(dmg(grass, foe, 'vine_lash', F(null, 'grassy')), dmg(grass, foe, 'vine_lash', null), 1.3), 'grass on grass');
  const flyerGrass = makeBattler(speciesGenome(SPECIES_BY_ID.zephyrn, makeRng('fly')), 50, { ability: 'lucky_streak', moves: ['vine_lash'] });
  assert.ok(near(dmg(flyerGrass, foe, 'vine_lash', F(null, 'grassy')), dmg(flyerGrass, foe, 'vine_lash', null), 1), 'nothing for the one in the air');

  const drake = mk('drakelet', 'lucky_streak');
  assert.ok(near(dmg(drake, foe, 'wyrm_pulse', F(null, 'misty')), dmg(drake, foe, 'wyrm_pulse', null), 0.5), 'mist blunts a Dragon');
  assert.ok(near(dmg(drake, flyer, 'wyrm_pulse', F(null, 'misty'), 1), dmg(drake, flyer, 'wyrm_pulse', null, 1), 1), 'but not against a target in the air');

  const hurt = mk('pufflet', 'lucky_streak', { moves: ['brace'] });
  hurt.hp = Math.floor(hurt.maxHp / 2);
  const air = mk('zephyrn', 'lucky_streak', { moves: ['brace'] });
  air.hp = Math.floor(air.maxHp / 2);
  const st = play(fight(hurt, air, { field: { terrain: 'grassy' }, seed: 'turf' }).state).state;
  assert.ok(activeOf(st, 0).hp > Math.floor(hurt.maxHp / 2), 'the grass mends what stands on it');
  assert.equal(activeOf(st, 1).hp, Math.floor(air.maxHp / 2), 'and nothing that does not');
});

test('the ground and the sky refuse some statuses outright', () => {
  // these moves can miss, so each rule is read over a run of seeds: never once on the field that refuses it.
  const lands = (user, foe, field, status, tries = 10) => {
    let n = 0;
    for (let i = 0; i < tries; i++) {
      const st = play(fight(user, foe, { field, seed: `st${status}${i}` }).state).state;
      if (activeOf(st, 1).status === status) n++;
    }
    return n;
  };
  const sleeper = mk('pufflet', 'lucky_streak', { moves: ['drowse_dust'] });
  const target = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  assert.ok(lands(sleeper, target, null, 'slp') > 0, 'sleep lands on bare ground');
  assert.equal(lands(sleeper, target, { terrain: 'charged' }, 'slp'), 0, 'and never on a charged floor');

  const burner = mk('pufflet', 'lucky_streak', { moves: ['ghostflame'] });
  assert.ok(lands(burner, target, null, 'brn') > 0);
  assert.equal(lands(burner, target, { terrain: 'misty' }, 'brn'), 0, 'the mist turns a status away');
  const flyer = mk('zephyrn', 'lucky_streak', { moves: ['brace'] });
  assert.ok(lands(burner, flyer, { terrain: 'misty' }, 'brn') > 0, 'but not for a target above it');

  const freezer = mk('pufflet', 'lucky_streak', { moves: ['frost_fang'] });
  assert.ok(lands(freezer, target, null, 'frz', 20) > 0, 'a fanging can freeze');
  assert.equal(lands(freezer, target, { weather: 'sun' }, 'frz', 20), 0, 'and nothing freezes under that sun');
});

test('a field runs down, and the passive that holds it makes it last', () => {
  const a = mk('pufflet', 'lucky_streak', { moves: ['brace'] }), b = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  let st = fight(a, b, { field: { weather: 'rain' }, seed: 'clock' }).state;
  assert.equal(st.field.weatherTurns, FIELD.turns);
  for (let i = 0; i < FIELD.turns - 1; i++) st = play(st).state;
  assert.equal(st.field.weather, 'rain', 'still raining on the last turn');
  const last = play(st);
  assert.equal(last.state.field.weather, null, 'and over on the next');
  assert.ok(last.events.some((e) => e.t === 'fieldOver' && e.id === 'rain'), 'the log says so');

  const holder = mk('pufflet', 'long_season', { moves: ['sunflare'] });
  const long = play(fight(holder, b, { seed: 'hold' }).state).state;
  assert.equal(long.field.weather, 'sun');
  assert.equal(long.field.weatherTurns, FIELD.longTurns - 1, 'eight turns, one of them already spent');
});

test('moves set the field, fail when it is already set, and sweep it clear', () => {
  const setter = mk('pufflet', 'lucky_streak', { moves: ['duststorm', 'clear_skies', 'wildgrass'] });
  const foe = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  let st = fight(setter, foe, { seed: 'set' }).state;
  let r = play(st, 0); st = r.state;
  assert.equal(st.field.weather, 'sand');
  assert.ok(r.events.some((e) => e.t === 'field' && e.id === 'sand'));
  r = play(st, 0); st = r.state;
  assert.ok(r.events.some((e) => e.t === 'no_effect'), 'the same storm twice is no storm at all');
  st = play(st, 2).state;
  assert.equal(st.field.terrain, 'grassy', 'the ground is a separate argument');
  r = play(st, 1); st = r.state;
  assert.equal(st.field.weather, null);
  assert.equal(st.field.terrain, null);
  assert.ok(r.events.some((e) => e.t === 'fieldClear'));
});

test('the moves that cash the field in', () => {
  const fire = mk('emberox', 'lucky_streak'), foe = mk('pufflet', 'lucky_streak');
  assert.ok(near(dmg(fire, foe, 'solar_lance', F('sun')), dmg(fire, foe, 'solar_lance', null), 1.5 * 1.5), 'the lance and the sun both count');
  const ice = mk('glacub', 'lucky_streak');
  assert.ok(near(dmg(ice, foe, 'hailstone', F('snow')), dmg(ice, foe, 'hailstone', null), 1.5));
  const bolt = mk('voltmite', 'lucky_streak');
  assert.ok(near(dmg(bolt, foe, 'static_spike', F(null, 'charged')), dmg(bolt, foe, 'static_spike', null), 1.4 * 1.3), 'the spike and the floor');

  const vane = getMove('weathervane');
  assert.equal(activeMove(foe, vane, F('rain')).type, 'Water');
  assert.equal(activeMove(foe, vane, F('sand')).type, 'Rock');
  assert.equal(activeMove(foe, vane, null).type, 'Normal', 'a clear sky leaves it plain');

  const gunner = mk('pufflet', 'lucky_streak', { moves: ['thunderline'] });
  const dodger = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  let hits = 0;
  for (let i = 0; i < 12; i++) {
    const r = play(fight(gunner, dodger, { field: { weather: 'rain' }, seed: `rainshot${i}` }).state);
    if (!r.events.some((e) => e.t === 'miss')) hits++;
  }
  assert.equal(hits, 12, 'a 70% move never misses in the rain');
});

test('the passives: calling it up, running in it, standing it and turning it off', () => {
  const foe = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  const caller = mk('emberox', 'sunmaker', { moves: ['brace'] });
  const opened = fight(caller, foe, { seed: 'call' });
  assert.equal(opened.state.field.weather, 'sun', 'it brings its own sky');
  assert.ok(opened.events.some((e) => e.t === 'ability'), 'and the log names it');

  const runner = mk('emberox', 'sun_sprint');
  const plainRunner = mk('emberox', 'lucky_streak');
  assert.ok(near(effectiveStat(runner, 'spe', F('sun')), effectiveStat(plainRunner, 'spe'), 2));
  assert.ok(near(effectiveStat(runner, 'spe', F('rain')), effectiveStat(plainRunner, 'spe'), 1), 'only in its own weather');

  const tough = mk('pufflet', 'sandshield'), soft = mk('pufflet', 'lucky_streak');
  const hitter = mk('skinkit', 'lucky_streak');
  assert.ok(near(dmg(hitter, tough, 'headbonk', F('sand')), dmg(hitter, soft, 'headbonk', F('sand')), 0.75));

  const proof = mk('pufflet', 'weatherworn', { moves: ['brace'] });
  const st = play(fight(proof, foe, { field: { weather: 'sand' }, seed: 'proof' }).state).state;
  assert.equal(activeOf(st, 0).hp, activeOf(st, 0).maxHp, 'the grit does not touch it');

  const flat = mk('pufflet', 'skyless');
  const flatState = fight(flat, foe, { field: { weather: 'sun' }, seed: 'flat' }).state;
  assert.equal(flatState.field.weather, 'sun', 'the sky is still there');
  assert.equal(liveField(flatState).weather, null, 'but it does nothing while this one is out');
  assert.ok(near(dmg(mk('emberox', 'lucky_streak'), flat, 'fire_stream', liveField(flatState)), dmg(mk('emberox', 'lucky_streak'), flat, 'fire_stream', null), 1));

  const drinker = mk('pufflet', 'sun_drinking', { moves: ['brace'] });
  drinker.hp = Math.floor(drinker.maxHp / 2);
  const drank = play(fight(drinker, foe, { field: { weather: 'sun' }, seed: 'drink' }).state).state;
  assert.ok(activeOf(drank, 0).hp > Math.floor(drinker.maxHp / 2), 'and this one drinks the sunlight');
});

test('the AI picks the sky it can use and never calls for one already up', () => {
  const rng = makeRng('ai-field');
  const foe = mk('skinkit', 'lucky_streak', { moves: ['brace'] });
  const choosy = mk('emberox', 'lucky_streak', { moves: ['sunflare', 'cloudburst'] });
  const pick = chooseAction(fight(choosy, foe, { seed: 'aif' }).state, 0, rng.fork('a'));
  assert.equal(pick.index, 0, 'a Fire team asks for sun, not rain');
  const sunny = mk('emberox', 'lucky_streak', { moves: ['sunflare', 'fire_stream'] });
  for (let i = 0; i < 6; i++) {
    const again = chooseAction(fight(sunny, foe, { field: { weather: 'sun' }, seed: `aif${i}` }).state, 0, rng.fork(`b${i}`));
    assert.equal(again.index, 1, 'and it never calls for a sun that is already up');
  }
});

test('the pool has grown again, and every field passive lives on the roster', () => {
  assert.equal(ABILITY_IDS.length, 1040);
  const fieldKinds = new Set(['entryWeather', 'entryTerrain', 'weatherBoost', 'terrainBoost', 'weatherStat', 'terrainStat', 'weatherDef', 'weatherHeal', 'terrainHeal', 'weatherEvade', 'weatherImmune', 'fieldExtend', 'noWeather']);
  for (const k of fieldKinds) assert.ok(PASSIVE_KINDS.includes(k), `the engine does not read ${k}`);
  const use = {};
  for (const s of SPECIES) for (const ab of s.abilities) use[ab] = (use[ab] || 0) + 1;
  const field = ABILITY_IDS.filter((id) => (ABILITIES[id].fx || []).some((f) => fieldKinds.has(f.k)));
  assert.equal(field.length, 100, `${field.length} field passives`);
  for (const id of field) {
    assert.ok(use[id] >= 1, `${ABILITIES[id].name} is carried by nobody`);
    const w = (ABILITIES[id].fx || []).map((f) => f.w || f.t).filter(Boolean);
    assert.ok(ABILITIES[id].desc.length > 12, id);
    assert.ok(w.every((x) => WEATHER[x] || TERRAIN[x]), `${id} names a field that does not exist`);
  }
});
