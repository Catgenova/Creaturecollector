// The score: no audio ships, so what there is to check is that the numbers a theme is made of are sane.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MUSIC, themeSpec, playTheme, stopMusic, currentTheme, setMusicEnabled, musicEnabled, setMusicVolume } from '../src/core/music.js';
import { BIOME_ORDER } from '../src/game/world.js';

test('a theme is worked out from its name and comes out the same every time', () => {
  const a = themeSpec('map:mammal'), b = themeSpec('map:mammal');
  assert.deepEqual(a, b, 'the same name gives the same theme');
  assert.notDeepEqual(themeSpec('map:mammal'), themeSpec('map:fiend'), 'two regions do not sound alike');
  for (const clade of BIOME_ORDER) {
    const t = themeSpec(`map:${clade}`);
    assert.ok(t.tempo >= 80 && t.tempo <= 160, `${clade} tempo ${t.tempo}`);
    assert.ok(t.root > 30 && t.root < 70, `${clade} root ${t.root}`);
    assert.ok(['sine', 'square', 'triangle', 'sawtooth'].includes(t.wave), `${clade} wave ${t.wave}`);
    assert.ok(t.density > 0 && t.density <= 1);
    assert.equal(t.drums, false, 'the road is quiet underneath');
  }
});

test('a fight is faster and lower than a walk, and a boss is darker than a fight', () => {
  const walk = themeSpec('map:bird'), fight = themeSpec('battle'), boss = themeSpec('boss');
  assert.ok(fight.tempo > walk.tempo && boss.tempo > fight.tempo);
  assert.ok(fight.root < walk.root, 'a fight sits lower');
  assert.equal(boss.mode, 'phrygian');
  assert.ok(fight.drums && boss.drums, 'both keep time');
  assert.equal(themeSpec('title').mode, 'ionian', 'the title is the bright one');
});

test('the player is inert with no audio to play through', () => {
  assert.equal(musicEnabled(), false, 'off until something turns it on');
  setMusicEnabled(true);
  assert.equal(musicEnabled(), true);
  playTheme('battle');
  assert.equal(currentTheme(), 'battle');
  playTheme('battle');
  assert.equal(currentTheme(), 'battle', 'asking for the same theme changes nothing');
  playTheme('map:ooze');
  assert.equal(currentTheme(), 'map:ooze');
  setMusicVolume(0.5);
  stopMusic();
  assert.equal(currentTheme(), null);
  setMusicEnabled(false);
  assert.ok(MUSIC.lookahead > 0 && MUSIC.tick > 0);
});
