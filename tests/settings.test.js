// Settings that belong to the player rather than to a save, and the three slots a save can sit in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SETTINGS_KEY, SPEEDS, TEXT_SIZES, MOTIONS, CONTRASTS, defaultSettings, normalizeSettings, loadSettings, saveSettings, speedMul, applySettings } from '../src/game/settings.js';
import { SAVE_KEY, SLOTS, SLOT_KEY, slotKey, emptySave, loadSave, persistSave, clearSave, activeSlot, useSlot, loadSlot, persistSlot, clearSlot, slotSummary, slotSummaries } from '../src/game/save.js';
import { newJourney } from '../src/game/journey.js';

const store = (seed = {}) => {
  const mem = { ...seed };
  return { mem, getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
};

test('settings default sanely and refuse nonsense', () => {
  const d = defaultSettings();
  assert.deepEqual(d, { sound: true, speed: 'normal', text: 'normal', motion: 'full', contrast: 'normal' });
  assert.equal(normalizeSettings({ speed: 'warp', text: 'tiny', motion: 'jerky', contrast: 'none' }).speed, 'normal');
  assert.deepEqual(normalizeSettings(null), d);
  assert.equal(normalizeSettings({ sound: false }).sound, false);
  assert.equal(normalizeSettings({ fast: true }).speed, 'fast', 'the old fast switch becomes a speed');
  for (const table of [SPEEDS, TEXT_SIZES, MOTIONS, CONTRASTS]) {
    for (const [id, o] of Object.entries(table)) { assert.equal(o.id, id); assert.ok(o.name); }
  }
  assert.ok(SPEEDS.instant.mul < SPEEDS.fast.mul && SPEEDS.fast.mul < SPEEDS.normal.mul);
  assert.equal(speedMul({ speed: 'fast' }), SPEEDS.fast.mul);
  assert.equal(speedMul({}), 1);
});

test('settings survive a round trip and carry the old sound switch over', () => {
  const st = store();
  assert.equal(loadSettings(st).sound, true);
  assert.ok(saveSettings({ sound: false, speed: 'instant', text: 'huge', motion: 'reduced', contrast: 'high' }, st));
  const back = loadSettings(st);
  assert.deepEqual(back, { sound: false, speed: 'instant', text: 'huge', motion: 'reduced', contrast: 'high' });
  assert.ok(st.getItem(SETTINGS_KEY).includes('instant'));
  assert.equal(loadSettings(store({ 'creaturecollector.sfx': 'off' })).sound, false, 'the lone sound key is honoured once');
  assert.deepEqual(loadSettings(store({ [SETTINGS_KEY]: '{broken' })), defaultSettings());
  assert.deepEqual(loadSettings(null), defaultSettings());
});

test('settings stamp themselves onto the document', () => {
  const root = { dataset: {}, style: {} };
  applySettings({ text: 'large', motion: 'reduced', contrast: 'high' }, { documentElement: root });
  assert.equal(root.dataset.text, 'large');
  assert.equal(root.dataset.motion, 'reduced');
  assert.equal(root.dataset.contrast, 'high');
  assert.equal(root.style.zoom, String(TEXT_SIZES.large.zoom));
  applySettings(defaultSettings(), { documentElement: root });
  assert.equal(root.style.zoom, '', 'normal type leaves the page alone');
});

test('three slots, each its own key, with slot one where the old save already is', () => {
  assert.equal(SLOTS, 3);
  assert.equal(slotKey(1), SAVE_KEY, 'an existing save is already slot one');
  assert.notEqual(slotKey(2), SAVE_KEY);
  const st = store();
  assert.equal(activeSlot(st), 1, 'slot one until told otherwise');
  const a = emptySave(); a.totals.journeys = 4;
  persistSave(a, st);
  assert.ok(st.getItem(SAVE_KEY), 'the first slot writes the plain key');
  useSlot(2, st);
  assert.equal(activeSlot(st), 2);
  assert.equal(st.getItem(SLOT_KEY), '2');
  assert.deepEqual(loadSave(st), emptySave(), 'a fresh slot starts empty');
  const b = emptySave(); b.totals.journeys = 9;
  persistSave(b, st);
  assert.equal(loadSlot(1, st).totals.journeys, 4, 'the other slot is untouched');
  assert.equal(loadSlot(2, st).totals.journeys, 9);
  useSlot(1, st);
  assert.equal(loadSave(st).totals.journeys, 4, 'and switching back finds it as it was');
  assert.equal(useSlot(99, st), 1, 'a slot outside the three is slot one');
  clearSave(st);
  assert.equal(loadSave(st).totals.journeys, 0);
  assert.equal(loadSlot(2, st).totals.journeys, 9, 'erasing one leaves the others');
});

test('a slot describes itself well enough to tell three journeys apart', () => {
  const st = store();
  assert.deepEqual(slotSummary(3, st), { slot: 3, empty: true, journey: null, journeys: 0, caught: 0, collection: 0, champion: false });
  const save = emptySave();
  save.journey = newJourney('slots-seed');
  save.journey.gold = 1234;
  save.journey.badges = ['mammal', 'insect'];
  save.totals.journeys = 2;
  persistSlot(save, 2, st);
  const s = slotSummary(2, st);
  assert.equal(s.empty, false);
  assert.equal(s.journeys, 2);
  assert.equal(s.journey.badges, 2);
  assert.equal(s.journey.gold, 1234);
  assert.equal(s.journey.seed, 'slots-seed');
  assert.equal(slotSummaries(st).length, SLOTS);
  clearSlot(2, st);
  assert.ok(slotSummary(2, st).empty, 'and it is empty again once erased');
});
