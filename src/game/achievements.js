// Achievements: two hundred of them, and the only place the game hands out a milestone reward.
//
// Every one is a row of data rather than a function — a category, a stat to read and a number to reach —
// so the whole table can be checked for well-formedness in a test and none of it can quietly stop working.
// The reading is done once, by `achievementStats`, which flattens the save and the journey you are on into
// a flat bag of numbers; an achievement never touches either object itself.
//
// Earned and claimed are two different things. Earned is stamped into the save the first time a condition
// is seen true and never comes off, because most of what is worth celebrating happens inside one journey
// and would otherwise vanish with it. Claimed is the reward, and it pays into the journey you are on.
import { SPECIES_BY_ID, WILD_SPECIES } from '../data/species.js';
import { CLADE_IDS, cladeName } from '../data/clades.js';
import { TYPE_LIST } from '../data/types.js';
import { REGIONS, BIOME_ORDER } from './world.js';
import { MORPHS } from '../creature/palette.js';
import { elementalOf } from '../creature/genome.js';
import { getCharm } from '../data/charms.js';
import { bondOfMember } from './bond.js';
import { TOWER } from './tower.js';

export const ACH_CATS = [
  { id: 'dex', name: 'The dex' },
  { id: 'rare', name: 'Rare finds' },
  { id: 'road', name: 'The road' },
  { id: 'fight', name: 'Fighting' },
  { id: 'shrine', name: 'The shrine' },
  { id: 'purse', name: 'The purse' },
  { id: 'iron', name: 'Ironman' },
];

/** The eight tiers the Fusiondex used to pay out on its own, kept by id so an old claim still counts. */
export const LEGACY_DEX_TIERS = ['dex_10', 'dex_25', 'dex_50', 'dex_100', 'dex_200', 'dex_400', 'dex_700', 'dex_all'];

const achNum = (v) => (Number.isFinite(v) ? v : 0);

/**
 * Everything an achievement can be measured against, as one flat bag of numbers. The journey is optional:
 * between runs only what the save remembers is readable, which is exactly why earning is stamped and kept.
 */
export function achievementStats(save, journey) {
  const s = save || {};
  const d = (s.dex && typeof s.dex === 'object') ? s.dex : { seen: {}, caught: {}, morphs: {} };
  const caughtIds = Object.keys(d.caught || {}).filter((id) => d.caught[id] && SPECIES_BY_ID[id]);
  const j = journey && journey.phase && journey.phase !== 'starter' ? journey : null;
  const party = j ? [...(j.party || []), ...(j.box || [])] : [];
  const st = j ? (j.stats || {}) : {};
  const out = {
    caught: caughtIds.length,
    seen: Object.keys(d.seen || {}).filter((id) => d.seen[id] && SPECIES_BY_ID[id]).length,
    dexTotal: WILD_SPECIES.length,
    collection: Array.isArray(s.collection) ? s.collection.length : 0,
    journeys: achNum(s.totals && s.totals.journeys),
    champions: achNum(s.totals && s.totals.champions),
    battles: achNum(s.totals && s.totals.battles) + achNum(st.battles),
    captures: achNum(s.totals && s.totals.captures) + achNum(st.captures),
    fusions: achNum(s.totals && s.totals.fusions) + achNum(st.fusions),
    hallTier: achNum(s.hall && s.hall.tier),
    morphs: 0, morphKinds: 0, elementals: 0,
    badges: j ? (j.badges || []).length : 0,
    camps: j ? (j.camps || []).length : 0,
    steps: achNum(st.steps), trainers: achNum(st.trainers), wardens: achNum(st.bosses),
    quests: achNum(st.quests), bounties: achNum(st.bounties), rematches: achNum(st.rematches),
    elders: achNum(st.elders), titans: achNum(st.titans), trials: achNum(st.trials),
    towerRuns: achNum(st.tower), gold: j ? achNum(j.gold) : 0,
    champion: j && j.champion ? 1 : 0,
    towerBest: 0, party: party.length, bestLevel: 0, bondTier: 0, bondedParty: 0, bestGen: 0, charms: 0,
    ironBadges: 0, ironFallen: 0, ironSteps: 0, ironChampion: 0,
  };
  // morphs: a kind counts once it has actually been caught, and the three kinds are tracked apart
  const kinds = new Set();
  for (const ms of Object.values(d.morphs || {})) {
    for (const [kind, v] of Object.entries(ms || {})) if (v >= 2) { out.morphs++; if (MORPHS[kind]) kinds.add(kind); }
  }
  out.morphKinds = kinds.size;
  for (const e of (Array.isArray(s.collection) ? s.collection : [])) {
    const el = e && e.genome ? elementalOf(e.genome) : null;
    if (el && el.pure) out.elementals++;
    if (e && e.genome && achNum(e.genome.gen) > out.bestGen) out.bestGen = achNum(e.genome.gen);
  }
  // per class and per type, counted off the dex rather than the collection so a fusion cannot inflate it
  for (const c of CLADE_IDS) out[`class.${c}`] = 0;
  for (const t of TYPE_LIST) out[`type.${t}`] = 0;
  for (const id of caughtIds) {
    const sp = SPECIES_BY_ID[id];
    if (out[`class.${sp.clade}`] !== undefined) out[`class.${sp.clade}`]++;
    for (const t of sp.types || []) if (t && out[`type.${t}`] !== undefined) out[`type.${t}`]++;
  }
  if (j) {
    for (const m of party) {
      if (achNum(m.level) > out.bestLevel) out.bestLevel = achNum(m.level);
      const tier = bondOfMember(m).tier;
      if (tier > out.bondTier) out.bondTier = tier;
    }
    out.bondedParty = (j.party || []).filter((m) => bondOfMember(m).tier >= 2).length;
    out.charms = new Set(Object.keys(j.bag || {}).filter((id) => getCharm(id) && achNum(j.bag[id]) > 0)).size;
    const wins = (j.tower && j.tower.wins) || {};
    for (const byLevel of Object.values(wins)) for (const [lv, n] of Object.entries(byLevel || {})) if (achNum(n) > 0 && Number(lv) > out.towerBest) out.towerBest = Number(lv);
    out.towerFloors = Object.keys(wins).length;
    if (j.ironman) {
      out.ironBadges = out.badges; out.ironSteps = out.steps;
      out.ironFallen = Array.isArray(j.fallen) ? j.fallen.length : 0;
      out.ironChampion = j.champion ? 1 : 0;
    }
  }
  out.towerFloors = out.towerFloors || 0;
  return out;
}

// --- the table ------------------------------------------------------------------------------------------
// A family is a stat and a ladder of thresholds up it, each rung with its own name. Written as data so the
// whole two hundred can be walked by a test; nothing here runs, it is only read.
const fam = (cat, stat, rows) => rows.map(([id, name, desc, need, reward]) => ({ id, cat, stat, name, desc, need, ...reward }));
const gold = (n) => ({ gold: n });
const charm = (id) => ({ charm: id });

/** Type titles: one word each, so eighteen rows do not all read the same. */
const TYPE_TITLE = {
  Normal: 'Plainspoken', Fire: 'Ember-handed', Water: 'Tidewise', Electric: 'Storm-fingered', Grass: 'Green-thumbed',
  Ice: 'Frostbitten', Fighting: 'Bare-knuckled', Poison: 'Ill-humoured', Ground: 'Earthfast', Flying: 'Updraughted',
  Psychic: 'Second-sighted', Bug: 'Chitin-eyed', Rock: 'Stonebound', Ghost: 'Haunted', Dragon: 'Wyrm-marked',
  Dark: 'Nightgiven', Steel: 'Iron-shod', Fairy: 'Glamoured',
};

export const ACHIEVEMENTS = [
  // --- the dex: how much of the world you have written down -------------------------------------------
  ...fam('dex', 'caught', [
    ['dex_10', 'First ten', 'Catch ten species.', 10, gold(2000)],
    ['dex_25', 'A proper start', 'Catch twenty-five species.', 25, charm('lure_charm')],
    ['dex_50', 'Fifty names', 'Catch fifty species.', 50, gold(8000)],
    ['dex_75', 'Three quarters of a hundred', 'Catch seventy-five species.', 75, gold(12000)],
    ['dex_100', 'A hundred hands shaken', 'Catch a hundred species.', 100, charm('scholar_charm')],
    ['dex_150', 'Past the easy ones', 'Catch a hundred and fifty species.', 150, gold(18000)],
    ['dex_200', 'Two hundred', 'Catch two hundred species.', 200, gold(25000)],
    ['dex_300', 'A third of everything', 'Catch three hundred species.', 300, gold(35000)],
    ['dex_400', 'Four hundred', 'Catch four hundred species.', 400, charm('lucky_coin')],
    ['dex_550', 'Well past halfway', 'Catch five hundred and fifty species.', 550, gold(45000)],
    ['dex_700', 'Seven hundred', 'Catch seven hundred species.', 700, gold(60000)],
    ['dex_all', 'The whole book', `Catch all ${WILD_SPECIES.length} species.`, WILD_SPECIES.length, charm('prism_charm')],
  ]),
  ...fam('dex', 'seen', [
    ['seen_50', 'Fifty faces', 'See fifty species, caught or not.', 50, gold(1500)],
    ['seen_150', 'A hundred and fifty faces', 'See a hundred and fifty species.', 150, gold(4000)],
    ['seen_300', 'Three hundred faces', 'See three hundred species.', 300, gold(9000)],
    ['seen_600', 'Six hundred faces', 'See six hundred species.', 600, gold(20000)],
    ['seen_all', 'Nothing left to meet', `See all ${WILD_SPECIES.length} species.`, WILD_SPECIES.length, gold(50000)],
  ]),
  // one per class, named for the region it comes out of
  ...CLADE_IDS.map((id) => ({
    id: `class_${id}`, cat: 'dex', stat: `class.${id}`, need: 7, gold: 4000,
    name: `Naturalist of the ${REGIONS[id] ? REGIONS[id].name : cladeName(id)}`,
    desc: `Catch seven ${cladeName(id).toLowerCase()}s.`,
  })),
  // one per type
  ...TYPE_LIST.map((t) => ({
    id: `type_${t.toLowerCase()}`, cat: 'dex', stat: `type.${t}`, need: 10, gold: 4000,
    name: TYPE_TITLE[t] || `${t} student`, desc: `Catch ten ${t} species.`,
  })),
  ...fam('dex', 'collection', [
    ['coll_25', 'A shelf of them', 'Twenty-five creatures in your Collection.', 25, gold(2000)],
    ['coll_100', 'A room of them', 'A hundred creatures in your Collection.', 100, gold(7000)],
    ['coll_300', 'A wing of them', 'Three hundred creatures in your Collection.', 300, gold(20000)],
    ['coll_1000', 'An archive', 'A thousand creatures in your Collection.', 1000, gold(70000)],
  ]),

  // --- rare finds: morphs, Elementals, and the things one run in a hundred turns up --------------------
  ...fam('rare', 'morphs', [
    ['morph_1', 'An odd colour', 'Catch a colour morph.', 1, gold(5000)],
    ['morph_5', 'Five odd colours', 'Catch five colour morphs.', 5, gold(15000)],
    ['morph_10', 'Ten odd colours', 'Catch ten colour morphs.', 10, gold(30000)],
    ['morph_25', 'A palette', 'Catch twenty-five colour morphs.', 25, gold(60000)],
    ['morph_50', 'A collector of oddities', 'Catch fifty colour morphs.', 50, charm('prism_charm')],
  ]),
  ...fam('rare', 'morphKinds', [
    ['morph_kinds', 'Albino, melanistic, pastel', 'Catch one of each of the three colour morphs.', 3, gold(25000)],
  ]),
  ...fam('rare', 'elementals', [
    ['elem_1', 'One in a thousand', 'Catch an Elemental.', 1, gold(20000)],
    ['elem_3', 'Three in three thousand', 'Catch three Elementals.', 3, gold(40000)],
    ['elem_5', 'Five Elementals', 'Catch five Elementals.', 5, charm('prism_charm')],
    ['elem_10', 'Ten Elementals', 'Catch ten Elementals.', 10, gold(90000)],
    ['elem_25', 'The aura hunter', 'Catch twenty-five Elementals.', 25, gold(200000)],
  ]),
  ...fam('rare', 'bestGen', [
    ['gen_2', 'Second generation', 'Make a second-generation fusion.', 2, gold(3000)],
    ['gen_3', 'Third generation', 'Make a third-generation fusion.', 3, gold(6000)],
    ['gen_4', 'Fourth generation', 'Make a fourth-generation fusion.', 4, gold(10000)],
    ['gen_5', 'Fifth generation', 'Make a fifth-generation fusion.', 5, gold(16000)],
    ['gen_7', 'Seventh generation', 'Make a seventh-generation fusion.', 7, gold(30000)],
    ['gen_10', 'Tenth generation', 'Make a tenth-generation fusion.', 10, gold(80000)],
  ]),

  // --- the road: badges, the places you get to and the miles under you --------------------------------
  ...fam('road', 'badges', [
    ['badge_1', 'The first badge', 'Take a badge from a Warden.', 1, gold(3000)],
    ['badge_3', 'Three badges', 'Hold three badges at once.', 3, gold(8000)],
    ['badge_6', 'Six badges', 'Hold six badges at once.', 6, gold(15000)],
    ['badge_9', 'Halfway round the ring', 'Hold nine badges at once.', 9, gold(25000)],
    ['badge_12', 'Twelve badges', 'Hold twelve badges at once.', 12, gold(40000)],
    ['badge_15', 'Fifteen badges', 'Hold fifteen badges at once.', 15, gold(60000)],
    ['badge_all', 'Every Warden beaten', `Hold all ${BIOME_ORDER.length} badges at once.`, BIOME_ORDER.length, charm('lucky_coin')],
  ]),
  ...fam('road', 'champion', [
    ['champ_now', 'Champion of the Crossroads', 'Beat the Council.', 1, gold(100000)],
  ]),
  ...fam('road', 'champions', [
    ['champ_5', 'Champion five times over', 'Beat the Council on five journeys.', 5, gold(150000)],
  ]),
  ...fam('road', 'journeys', [
    ['run_1', 'Set out', 'Finish one journey and start another.', 1, gold(1000)],
    ['run_3', 'Three roads walked', 'Begin a third journey.', 3, gold(5000)],
    ['run_10', 'Ten roads walked', 'Begin a tenth journey.', 10, gold(20000)],
    ['run_25', 'A life on the road', 'Begin a twenty-fifth journey.', 25, gold(60000)],
  ]),
  ...fam('road', 'steps', [
    ['step_500', 'Five hundred steps', 'Walk five hundred steps in one journey.', 500, gold(1000)],
    ['step_2k', 'Two thousand steps', 'Walk two thousand steps in one journey.', 2000, gold(3000)],
    ['step_5k', 'Five thousand steps', 'Walk five thousand steps in one journey.', 5000, gold(7000)],
    ['step_10k', 'Ten thousand steps', 'Walk ten thousand steps in one journey.', 10000, gold(14000)],
    ['step_25k', 'Twenty-five thousand steps', 'Walk twenty-five thousand steps in one journey.', 25000, gold(30000)],
    ['step_50k', 'Fifty thousand steps', 'Walk fifty thousand steps in one journey.', 50000, gold(60000)],
  ]),
  ...fam('road', 'camps', [
    ['camp_3', 'Three fires', 'Rest at three of the road\u2019s camps.', 3, gold(2000)],
    ['camp_9', 'Nine fires', 'Rest at nine of the road\u2019s camps.', 9, gold(6000)],
    ['camp_all', 'Every fire on the ring', `Rest at all ${BIOME_ORDER.length} camps.`, BIOME_ORDER.length, gold(20000)],
  ]),
  ...fam('road', 'quests', [
    ['notice_1', 'A word from the board', 'Finish a notice.', 1, gold(1500)],
    ['notice_10', 'Ten notices', 'Finish ten notices.', 10, gold(6000)],
    ['notice_25', 'Twenty-five notices', 'Finish twenty-five notices.', 25, gold(15000)],
    ['notice_50', 'Fifty notices', 'Finish fifty notices.', 50, gold(30000)],
    ['notice_100', 'The board\u2019s favourite', 'Finish a hundred notices.', 100, charm('scholar_charm')],
  ]),
  ...fam('road', 'elders', [
    ['elder_1', 'An elder heard out', 'Seek out an elder.', 1, gold(5000)],
    ['elder_3', 'Three elders', 'Seek out three elders.', 3, gold(12000)],
    ['elder_7', 'Seven elders', 'Seek out seven elders.', 7, gold(25000)],
    ['elder_12', 'Twelve elders', 'Seek out twelve elders.', 12, gold(45000)],
    ['elder_all', 'Every elder on the ring', `Seek out all ${BIOME_ORDER.length} elders.`, BIOME_ORDER.length, gold(90000)],
  ]),

  // --- fighting: what you have beaten, caught and raised ----------------------------------------------
  ...fam('fight', 'battles', [
    ['fight_10', 'Ten fights', 'Fight ten battles.', 10, gold(1000)],
    ['fight_50', 'Fifty fights', 'Fight fifty battles.', 50, gold(3000)],
    ['fight_150', 'A hundred and fifty fights', 'Fight a hundred and fifty battles.', 150, gold(7000)],
    ['fight_400', 'Four hundred fights', 'Fight four hundred battles.', 400, gold(15000)],
    ['fight_800', 'Eight hundred fights', 'Fight eight hundred battles.', 800, gold(28000)],
    ['fight_1500', 'Fifteen hundred fights', 'Fight fifteen hundred battles.', 1500, gold(50000)],
    ['fight_3000', 'Three thousand fights', 'Fight three thousand battles.', 3000, gold(90000)],
    ['fight_6000', 'Six thousand fights', 'Fight six thousand battles.', 6000, gold(160000)],
  ]),
  ...fam('fight', 'captures', [
    ['catch_5', 'Five caught', 'Catch five creatures.', 5, gold(1000)],
    ['catch_25', 'Twenty-five caught', 'Catch twenty-five creatures.', 25, gold(3000)],
    ['catch_75', 'Seventy-five caught', 'Catch seventy-five creatures.', 75, gold(8000)],
    ['catch_200', 'Two hundred caught', 'Catch two hundred creatures.', 200, gold(18000)],
    ['catch_400', 'Four hundred caught', 'Catch four hundred creatures.', 400, gold(35000)],
    ['catch_800', 'Eight hundred caught', 'Catch eight hundred creatures.', 800, gold(70000)],
    ['catch_1500', 'The net never dries', 'Catch fifteen hundred creatures.', 1500, charm('lure_charm')],
  ]),
  ...fam('fight', 'trainers', [
    ['train_5', 'Five trainers', 'Beat five trainers on the road.', 5, gold(2000)],
    ['train_15', 'Fifteen trainers', 'Beat fifteen trainers on the road.', 15, gold(5000)],
    ['train_30', 'Thirty trainers', 'Beat thirty trainers on the road.', 30, gold(11000)],
    ['train_60', 'Sixty trainers', 'Beat sixty trainers on the road.', 60, gold(22000)],
    ['train_all', 'Nobody left to ask', `Beat all ${BIOME_ORDER.length * 6} trainers on the road.`, BIOME_ORDER.length * 6, gold(60000)],
  ]),
  ...fam('fight', 'wardens', [
    ['warden_1', 'A Warden beaten', 'Beat a Warden.', 1, gold(3000)],
    ['warden_5', 'Five Wardens', 'Beat five Wardens.', 5, gold(10000)],
    ['warden_10', 'Ten Wardens', 'Beat ten Wardens.', 10, gold(22000)],
    ['warden_15', 'Fifteen Wardens', 'Beat fifteen Wardens.', 15, gold(38000)],
    ['warden_all', 'Every Warden', `Beat all ${BIOME_ORDER.length} Wardens.`, BIOME_ORDER.length, gold(70000)],
  ]),
  ...fam('fight', 'titans', [
    ['titan_1', 'A Titan felled', 'Beat a Titan in its lair.', 1, gold(10000)],
    ['titan_3', 'Three Titans', 'Beat three Titans.', 3, gold(25000)],
    ['titan_7', 'Seven Titans', 'Beat seven Titans.', 7, gold(50000)],
    ['titan_12', 'Twelve Titans', 'Beat twelve Titans.', 12, gold(90000)],
    ['titan_all', 'Every Titan', `Beat all ${BIOME_ORDER.length} Titans.`, BIOME_ORDER.length, charm('lucky_coin')],
  ]),
  ...fam('fight', 'towerFloors', [
    ['tower_1', 'The first floor', 'Beat a floor of the Battle Tower.', 1, gold(4000)],
    ['tower_3', 'Three floors', 'Beat three floors of the Battle Tower.', 3, gold(12000)],
    ['tower_all', 'The Keeper\u2019s floor', 'Beat all six floors of the Battle Tower.', 6, gold(40000)],
  ]),
  ...fam('fight', 'towerBest', [
    ['tower_lv50', 'Tower at fifty', 'Win a Tower floor at level 50.', 50, gold(6000)],
    ['tower_lv70', 'Tower at seventy', 'Win a Tower floor at level 70.', 70, gold(14000)],
    ['tower_lv90', 'Tower at ninety', 'Win a Tower floor at level 90.', 90, gold(30000)],
    ['tower_lv100', 'Tower at a hundred', `Win a Tower floor at level ${TOWER.levels[TOWER.levels.length - 1]}.`, TOWER.levels[TOWER.levels.length - 1], gold(60000)],
  ]),
  ...fam('fight', 'trials', [
    ['trial_1', 'A day\u2019s trial', 'Clear a daily Trial.', 1, gold(5000)],
    ['trial_3', 'Three trials', 'Clear three daily Trials.', 3, gold(12000)],
    ['trial_7', 'A week of trials', 'Clear seven daily Trials.', 7, gold(25000)],
    ['trial_15', 'Fifteen trials', 'Clear fifteen daily Trials.', 15, gold(45000)],
    ['trial_30', 'A month of trials', 'Clear thirty daily Trials.', 30, gold(90000)],
  ]),
  ...fam('fight', 'bestLevel', [
    ['lv_25', 'Level twenty-five', 'Raise a creature to level 25.', 25, gold(2000)],
    ['lv_50', 'Level fifty', 'Raise a creature to level 50.', 50, gold(8000)],
    ['lv_75', 'Level seventy-five', 'Raise a creature to level 75.', 75, gold(20000)],
    ['lv_100', 'Level a hundred', 'Raise a creature to level 100.', 100, charm('scholar_charm')],
  ]),
  ...fam('fight', 'bondTier', [
    ['bond_1', 'Willing', 'Bring a creature to the Willing tier.', 1, gold(3000)],
    ['bond_2', 'Trusted', 'Bring a creature to the Trusted tier.', 2, gold(8000)],
    ['bond_3', 'Sworn', 'Bring a creature to the Sworn tier.', 3, gold(20000)],
    ['bond_4', 'Inseparable', 'Bring a creature to the Inseparable tier.', 4, gold(45000)],
  ]),
  ...fam('fight', 'bondedParty', [
    ['bond_party', 'A party that trusts you', 'Have five creatures in your party at Trusted or better.', 5, gold(60000)],
  ]),

  // --- the shrine: what fusion is worth ---------------------------------------------------------------
  ...fam('shrine', 'fusions', [
    ['fuse_1', 'The first fusion', 'Fuse two creatures at the shrine.', 1, gold(2000)],
    ['fuse_5', 'Five fusions', 'Make five fusions.', 5, gold(5000)],
    ['fuse_10', 'Ten fusions', 'Make ten fusions.', 10, gold(9000)],
    ['fuse_25', 'Twenty-five fusions', 'Make twenty-five fusions.', 25, gold(18000)],
    ['fuse_50', 'Fifty fusions', 'Make fifty fusions.', 50, gold(32000)],
    ['fuse_100', 'A hundred fusions', 'Make a hundred fusions.', 100, gold(55000)],
    ['fuse_200', 'Two hundred fusions', 'Make two hundred fusions.', 200, gold(90000)],
    ['fuse_350', 'Three hundred and fifty fusions', 'Make three hundred and fifty fusions.', 350, gold(140000)],
    ['fuse_500', 'Five hundred fusions', 'Make five hundred fusions.', 500, charm('prism_charm')],
    ['fuse_750', 'The shrine keeper', 'Make seven hundred and fifty fusions.', 750, gold(250000)],
  ]),

  // --- the purse: gold, charms and the Trophy Hall ----------------------------------------------------
  ...fam('purse', 'gold', [
    ['gold_5k', 'Five thousand gold', 'Hold five thousand gold.', 5000, gold(1000)],
    ['gold_25k', 'Twenty-five thousand gold', 'Hold twenty-five thousand gold.', 25000, gold(4000)],
    ['gold_75k', 'Seventy-five thousand gold', 'Hold seventy-five thousand gold.', 75000, gold(10000)],
    ['gold_150k', 'A hundred and fifty thousand gold', 'Hold a hundred and fifty thousand gold.', 150000, gold(20000)],
    ['gold_400k', 'Four hundred thousand gold', 'Hold four hundred thousand gold.', 400000, gold(50000)],
    ['gold_1m', 'A million', 'Hold a million gold.', 1000000, charm('lucky_coin')],
  ]),
  ...fam('purse', 'bounties', [
    ['bounty_1', 'A bounty paid', 'Hand a fusion in at the Bounty Office.', 1, gold(2000)],
    ['bounty_10', 'Ten bounties', 'Hand in ten bounties.', 10, gold(8000)],
    ['bounty_25', 'Twenty-five bounties', 'Hand in twenty-five bounties.', 25, gold(18000)],
    ['bounty_50', 'Fifty bounties', 'Hand in fifty bounties.', 50, gold(35000)],
    ['bounty_100', 'The office regular', 'Hand in a hundred bounties.', 100, gold(70000)],
  ]),
  ...fam('purse', 'charms', [
    ['charm_5', 'Five charms', 'Hold five different charms at once.', 5, gold(3000)],
    ['charm_15', 'Fifteen charms', 'Hold fifteen different charms at once.', 15, gold(12000)],
    ['charm_30', 'Thirty charms', 'Hold thirty different charms at once.', 30, gold(35000)],
  ]),
  ...fam('purse', 'hallTier', [
    ['hall_1', 'A shelf of your own', 'Buy the first tier of the Trophy Hall.', 1, gold(3000)],
    ['hall_2', 'A second shelf', 'Buy the second tier of the Trophy Hall.', 2, gold(10000)],
    ['hall_3', 'The full hall', 'Buy the third tier of the Trophy Hall.', 3, gold(30000)],
  ]),
  ...fam('purse', 'rematches', [
    ['rematch_10', 'Ten rematches', 'Take ten rematches from trainers you have already beaten.', 10, gold(6000)],
    ['rematch_40', 'Forty rematches', 'Take forty rematches.', 40, gold(20000)],
  ]),

  // --- Ironman: what a run with no second chances is worth --------------------------------------------
  ...fam('iron', 'ironSteps', [
    ['iron_steps', 'A thousand steps, no second chances', 'Walk a thousand steps in an Ironman run.', 1000, gold(6000)],
  ]),
  ...fam('iron', 'ironBadges', [
    ['iron_1', 'Ironman: a badge', 'Take a badge in an Ironman run.', 1, gold(8000)],
    ['iron_3', 'Ironman: three badges', 'Hold three badges in an Ironman run.', 3, gold(20000)],
    ['iron_6', 'Ironman: six badges', 'Hold six badges in an Ironman run.', 6, gold(40000)],
    ['iron_9', 'Ironman: nine badges', 'Hold nine badges in an Ironman run.', 9, gold(70000)],
    ['iron_12', 'Ironman: twelve badges', 'Hold twelve badges in an Ironman run.', 12, gold(110000)],
    ['iron_all', 'Ironman: every badge', `Hold all ${BIOME_ORDER.length} badges in an Ironman run.`, BIOME_ORDER.length, charm('prism_charm')],
  ]),
  ...fam('iron', 'ironChampion', [
    ['iron_champ', 'Ironman Champion', 'Beat the Council in an Ironman run.', 1, gold(300000)],
  ]),

  // --- the last few rungs -----------------------------------------------------------------------------
  ...fam('road', 'party', [
    ['party_5', 'A full party', 'Travel with five creatures at once.', 5, gold(2000)],
  ]),
  ...fam('road', 'camps', [
    ['camp_1', 'The first fire', 'Rest at a camp on the road.', 1, gold(500)],
  ]),
  ...fam('fight', 'towerRuns', [
    ['tower_runs_5', 'Five turns in the Tower', 'Take five runs at the Battle Tower.', 5, gold(8000)],
    ['tower_runs_25', 'Twenty-five turns in the Tower', 'Take twenty-five runs at the Battle Tower.', 25, gold(40000)],
  ]),
  ...fam('road', 'quests', [
    ['notice_200', 'Two hundred notices', 'Finish two hundred notices.', 200, gold(120000)],
  ]),
  ...fam('rare', 'morphs', [
    ['morph_100', 'A hundred oddities', 'Catch a hundred colour morphs.', 100, gold(200000)],
  ]),
];

export const ACH_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const ACH_TOTAL = ACHIEVEMENTS.length;

/** The save's achievement record, made if it is not there yet. */
function achOf(save) {
  if (!save.ach || typeof save.ach !== 'object') save.ach = { earned: {}, claimed: {} };
  for (const k of ['earned', 'claimed']) if (!save.ach[k] || typeof save.ach[k] !== 'object') save.ach[k] = {};
  // the Fusiondex used to pay eight tiers of its own; anything already claimed there stays claimed here,
  // so a save that has had those rewards cannot take them again through the new door
  const old = save.dex && Array.isArray(save.dex.claimed) ? save.dex.claimed : [];
  for (const i of old) {
    const id = LEGACY_DEX_TIERS[i];
    if (id && ACH_BY_ID[id]) { save.ach.earned[id] = 1; save.ach.claimed[id] = 1; }
  }
  return save.ach;
}

/** What a reward is worth, in words. */
export function achievementReward(a) {
  if (!a) return '';
  if (a.charm) { const c = getCharm(a.charm); return c ? c.name : a.charm; }
  return `${(a.gold || 0).toLocaleString()} gold`;
}

/**
 * Stamp everything now true as earned, and hand back the ones that were not earned a moment ago so the
 * screen can say so. Earning is one-way: what a journey proved stays proved once the journey is gone.
 */
export function syncAchievements(save, journey) {
  const rec = achOf(save);
  const stats = achievementStats(save, journey);
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (rec.earned[a.id]) continue;
    if (achNum(stats[a.stat]) >= a.need) { rec.earned[a.id] = 1; fresh.push(a); }
  }
  return fresh;
}

/** Every achievement with where it stands. Pure: it stamps nothing. */
export function achievementState(save, journey) {
  const rec = achOf(save);
  const stats = achievementStats(save, journey);
  return ACHIEVEMENTS.map((a) => {
    const have = achNum(stats[a.stat]);
    const earned = Boolean(rec.earned[a.id]) || have >= a.need;
    return { ...a, have, earned, claimed: Boolean(rec.claimed[a.id]),
      frac: a.need > 0 ? Math.max(0, Math.min(1, have / a.need)) : 1, label: achievementReward(a) };
  });
}

/** The header numbers: how many are earned, how many are waiting to be claimed, and the same per category. */
export function achievementSummary(save, journey) {
  const rows = achievementState(save, journey);
  const byCat = {};
  for (const c of ACH_CATS) byCat[c.id] = { earned: 0, total: 0, ready: 0 };
  let earned = 0, ready = 0;
  for (const r of rows) {
    const b = byCat[r.cat];
    b.total++;
    if (r.earned) { earned++; b.earned++; }
    if (r.earned && !r.claimed) { ready++; b.ready++; }
  }
  return { earned, ready, total: rows.length, byCat, rows };
}

/** Claim one earned achievement into the journey you are on: gold to the purse, a charm to the Bag. */
export function claimAchievement(save, journey, id) {
  const a = ACH_BY_ID[id];
  if (!a) return { ok: false, reason: 'No such achievement.' };
  const rec = achOf(save);
  if (rec.claimed[id]) return { ok: false, reason: 'Already claimed.' };
  if (!rec.earned[id] && achNum(achievementStats(save, journey)[a.stat]) < a.need) return { ok: false, reason: 'Not earned yet.' };
  const j = journey || save.journey;
  if (!j || j.phase === 'starter' || j.over) return { ok: false, reason: 'Set out on a journey to claim it.' };
  rec.earned[id] = 1;
  rec.claimed[id] = 1;
  if (a.gold) j.gold = (j.gold || 0) + a.gold;
  if (a.charm) { j.bag = j.bag || {}; j.bag[a.charm] = (j.bag[a.charm] || 0) + 1; }
  return { ok: true, ach: a, label: achievementReward(a) };
}

/** Claim everything that is waiting. Returns what it came to, so one line can report the lot. */
export function claimAllAchievements(save, journey) {
  const ready = achievementState(save, journey).filter((r) => r.earned && !r.claimed);
  let count = 0, goldPaid = 0;
  const charms = [];
  for (const r of ready) {
    const got = claimAchievement(save, journey, r.id);
    if (!got.ok) return count ? { ok: true, count, gold: goldPaid, charms } : { ok: false, reason: got.reason };
    count++;
    if (r.gold) goldPaid += r.gold;
    if (r.charm) charms.push(achievementReward(r));
  }
  return { ok: true, count, gold: goldPaid, charms };
}
