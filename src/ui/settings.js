// The settings the screens read: one copy in memory, written through to storage and to the document.
import { loadSettings, saveSettings, applySettings, defaultSettings, normalizeSettings, speedMul, musicVolume } from '../game/settings.js';
import { setSfxEnabled } from '../core/sfx.js';
import { setMusicEnabled, setMusicVolume } from '../core/music.js';
import { setReducedMotion } from '../creature/render.js';

let liveSettings = defaultSettings();

/** The settings in play. */
export function getSettings() { return liveSettings; }
/** Put a settings record in play (without writing it) and return the cleaned copy. */
export function setSettings(next) { liveSettings = normalizeSettings(next); return liveSettings; }
/** The multiplier the fight view puts on its pauses. */
export function fightSpeed() { return speedMul(liveSettings); }

/** Change one setting: applied to the document, to the sound and to the renderer, then stored. */
export function updateSetting(key, value) {
  const next = setSettings({ ...liveSettings, [key]: value });
  applySettings(next);
  setSfxEnabled(next.sound);
  applyMusic(next);
  if (key === 'sound' && typeof document !== 'undefined') { const b = document.querySelector('.topbar .sound'); if (b) b.textContent = next.sound ? '🔊' : '🔇'; }
  if (key === 'motion') { try { setReducedMotion(next.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches); } catch { setReducedMotion(next.motion === 'reduced'); } }
  saveSettings(next);
  return next;
}

/** Put the score's own switch where the settings say it should be. */
export function applyMusic(settings) {
  const v = musicVolume(settings || liveSettings);
  setMusicVolume(v);
  setMusicEnabled(v > 0);
  return v;
}

/** Read storage into play at boot. */
export function initSettings(storage) { const s = setSettings(applySettings(loadSettings(storage))); applyMusic(s); return s; }
