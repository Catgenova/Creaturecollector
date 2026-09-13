// Two hundred achievements, and the one door every milestone reward now comes through.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, ACH_BY_ID, ACH_CATS, ACH_TOTAL, LEGACY_DEX_TIERS, achievementStats, achievementState,
  achievementSummary, claimAchievement, claimAllAchievements, syncAchievements, achievementReward } from '../src/game/achievements.js';
import { emptySave, normalizeSave } from '../src/game/save.js';
import { newJourney, chooseJourneyStarter } from '../src/game/journey.js';
import { getCharm } from '../src/data/charms.js';
import { CLADE_IDS } from '../src/data/clades.js';
import { TYPE_LIST } from '../src/data/types.js';

const onTheRoad = () => { const j = newJourney('ach-seed'); chooseJourneyStarter(j, 0); return j; };

test('there are two hundred of them and every row is well formed', () => {
  assert.equal(ACHIEVEMENTS.length, 200);
  assert.equal(ACH_TOTAL, 200);
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, 200, 'ids are unique');
  const cats = new Set(ACH_CATS.map((c) => c.id));
  const stats = achievementStats(emptySave(), onTheRoad());
  for (const a of ACHIEVEMENTS) {
    assert.match(a.id, /^[a-z0-9_.]+$/, `${a.id} is a plain id`);
    assert.ok(a.name && a.name.length <= 48, `${a.id} has a name`);
    assert.ok(a.desc && /[.!]$/.test(a.desc), `${a.id} describes itself in a sentence: ${a.desc}`);
    assert.ok(cats.has(a.cat), `${a.id} is in a real category`);
    assert.ok(Number.isFinite(a.need) && a.need > 0, `${a.id} has a threshold`);
    assert.ok(a.stat in stats, `${a.id} reads ${a.stat}, which the stat context does not have`);
    assert.ok(a.gold > 0 || getCharm(a.charm), `${a.id} pays something real`);
    assert.ok(achievementReward(a).length > 0);
  }
  for (const c of ACH_CATS) assert.ok(ACHIEVEMENTS.some((a) => a.cat === c.id), `${c.id} has entries`);
});

test('a ladder up one stat always climbs', () => {
  const byStat = {};
  for (const a of ACHIEVEMENTS) (byStat[a.stat] = byStat[a.stat] || []).push(a);
  for (const [stat, rungs] of Object.entries(byStat)) {
    const needs = rungs.map((a) => a.need);
    assert.equal(new Set(needs).size, needs.length, `${stat} has two rungs at the same height`);
    const sorted = [...rungs].sort((a, b) => a.need - b.need);
    let last = 0;
    for (const a of sorted) { assert.ok(a.need > last, `${a.id} does not climb`); last = a.need; }
  }
});

test('every class and every type has one, so no corner of the dex is unrewarded', () => {
  for (const c of CLADE_IDS) assert.ok(ACH_BY_ID[`class_${c}`], `${c} has none`);
  for (const t of TYPE_LIST) assert.ok(ACH_BY_ID[`type_${t.toLowerCase()}`], `${t} has none`);
});

test('the stat context reads a save and a journey without needing either', () => {
  const alone = achievementStats(emptySave(), null);
  assert.equal(alone.caught, 0);
  assert.equal(alone.badges, 0, 'no journey means no journey numbers, rather than a crash');
  assert.equal(achievementStats(null, null).caught, 0, 'and neither does no save');
  const save = emptySave();
  save.dex = { seen: { emberox: 1 }, caught: { emberox: 1 }, morphs: {}, claimed: [] };
  save.totals.battles = 40;
  const j = onTheRoad();
  j.badges = ['mammal', 'insect'];
  j.stats.steps = 620;
  j.stats.battles = 12;
  const s = achievementStats(save, j);
  assert.equal(s.caught, 1);
  assert.equal(s.seen, 1);
  assert.equal(s.badges, 2);
  assert.equal(s.steps, 620);
  assert.equal(s.battles, 52, 'the save’s total and the run’s own are added');
  assert.equal(s['class.mammal'], 1, 'and the catch counts against its class');
});

test('earning is one-way: what a journey proved outlives the journey', () => {
  const save = emptySave();
  const j = onTheRoad();
  j.stats.steps = 600;
  const fresh = syncAchievements(save, j);
  assert.ok(fresh.some((a) => a.id === 'step_500'), 'five hundred steps is noticed');
  assert.equal(syncAchievements(save, j).length, 0, 'and only noticed once');
  const after = achievementState(save, null).find((r) => r.id === 'step_500');
  assert.equal(after.earned, true, 'it is still earned with no journey at all');
  assert.equal(after.claimed, false);
});

test('claiming pays into the journey you are on, once', () => {
  const save = emptySave();
  const j = onTheRoad();
  j.stats.steps = 600;
  j.gold = 0;
  syncAchievements(save, j);
  const a = ACH_BY_ID.step_500;
  const got = claimAchievement(save, j, a.id);
  assert.equal(got.ok, true);
  assert.equal(j.gold, a.gold);
  assert.equal(claimAchievement(save, j, a.id).ok, false, 'a second claim pays nothing');
  assert.equal(j.gold, a.gold);
  assert.equal(claimAchievement(save, j, 'no_such_thing').ok, false);
  assert.equal(claimAchievement(save, j, 'dex_all').ok, false, 'and one that is not earned pays nothing');
});

test('a charm lands in the bag rather than the purse', () => {
  const save = emptySave();
  const j = onTheRoad();
  save.dex = { seen: {}, caught: {}, morphs: {}, claimed: [] };
  for (let i = 0; i < 25; i++) save.dex.caught[`x${i}`] = 1; // ids the dex does not know are not counted
  assert.equal(achievementStats(save, j).caught, 0, 'only real species count');
  const charmAch = ACHIEVEMENTS.find((x) => x.charm);
  save.ach.earned[charmAch.id] = 1;
  const got = claimAchievement(save, j, charmAch.id);
  assert.equal(got.ok, true);
  assert.equal(j.bag[charmAch.charm], 1);
});

test('there is nowhere to claim into before setting out, or after a run has ended', () => {
  const save = emptySave();
  save.ach.earned.step_500 = 1;
  const fresh = newJourney('ach-seed'); // still on the starter screen
  assert.equal(claimAchievement(save, fresh, 'step_500').ok, false);
  const over = onTheRoad();
  over.over = { at: 'the road' };
  assert.equal(claimAchievement(save, over, 'step_500').ok, false);
  assert.equal(claimAchievement(save, null, 'step_500').ok, false);
});

test('claim all takes everything waiting and reports the lot', () => {
  const save = emptySave();
  const j = onTheRoad();
  j.stats.steps = 6000;
  j.gold = 0;
  syncAchievements(save, j);
  const ready = achievementSummary(save, j).ready;
  assert.ok(ready >= 3, 'several rungs at once');
  const waiting = achievementSummary(save, j).rows.filter((r) => r.earned && !r.claimed).map((r) => r.id);
  const got = claimAllAchievements(save, j);
  assert.equal(got.ok, true);
  assert.equal(got.count, ready);
  assert.equal(j.gold, got.gold);
  for (const id of waiting) assert.equal(achievementState(save, j).find((r) => r.id === id).claimed, true, `${id} was left behind`);
  // the payout is itself worth something: enough gold lands in the purse to earn a purse award, which is
  // newly ready rather than missed, so a second sweep is finite
  const left = achievementSummary(save, j).rows.filter((r) => r.earned && !r.claimed);
  assert.ok(left.every((r) => !waiting.includes(r.id)), 'anything still waiting was earned by the payout, not skipped');
  assert.ok(left.every((r) => r.cat === 'purse'), `only the purse can be earned by being paid: ${left.map((r) => r.id)}`);
  claimAllAchievements(save, j);
  assert.equal(achievementSummary(save, j).ready, 0, 'and a second sweep settles it');
});

test('the Fusiondex tiers came in here, and an old claim is still a claim', () => {
  assert.equal(LEGACY_DEX_TIERS.length, 8);
  for (const id of LEGACY_DEX_TIERS) assert.ok(ACH_BY_ID[id], `${id} is missing from the table`);
  const save = emptySave();
  save.dex = { seen: {}, caught: {}, morphs: {}, claimed: [0, 3] }; // ten caught and a hundred caught, already paid
  const rows = achievementState(save, onTheRoad());
  assert.equal(rows.find((r) => r.id === 'dex_10').claimed, true);
  assert.equal(rows.find((r) => r.id === 'dex_100').claimed, true);
  assert.equal(rows.find((r) => r.id === 'dex_50').claimed, false, 'and one that was not paid is still open');
  const j = onTheRoad();
  assert.equal(claimAchievement(save, j, 'dex_10').ok, false, 'the old reward cannot be taken twice');
});

test('the record survives a save round trip and drops anything it does not recognise', () => {
  const save = emptySave();
  save.ach.earned.badge_1 = 1;
  save.ach.claimed.badge_1 = 1;
  save.ach.earned.fuse_1 = 1;
  save.ach.earned.a_thing_that_never_was = 1;
  save.ach.claimed.also_not_real = 1;
  const back = normalizeSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(Object.keys(back.ach.earned).sort(), ['badge_1', 'fuse_1']);
  assert.deepEqual(Object.keys(back.ach.claimed), ['badge_1']);
  assert.equal(back.ach.earned.badge_1, 1);
  const bare = normalizeSave({ v: save.v });
  assert.deepEqual(bare.ach, { earned: {}, claimed: {} }, 'a save with no record gets an empty one');
});

test('the summary adds up to two hundred however it is sliced', () => {
  const save = emptySave();
  const j = onTheRoad();
  j.stats.steps = 600;
  syncAchievements(save, j);
  const sum = achievementSummary(save, j);
  assert.equal(sum.total, 200);
  assert.equal(sum.rows.length, 200);
  assert.equal(Object.values(sum.byCat).reduce((n, b) => n + b.total, 0), 200, 'every one belongs to a category');
  assert.equal(sum.earned, sum.rows.filter((r) => r.earned).length);
  assert.equal(sum.ready, sum.rows.filter((r) => r.earned && !r.claimed).length);
  for (const r of sum.rows) assert.ok(r.frac >= 0 && r.frac <= 1, `${r.id} has a sane bar`);
});
