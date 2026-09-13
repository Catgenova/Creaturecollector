// Player settings. These live apart from the save, in their own key, because they belong to the person
// playing rather than to a journey: switch save slots and the sound, the speed and the type size follow.
export const SETTINGS_KEY = 'creaturecollector.settings';
const LEGACY_SFX_KEY = 'creaturecollector.sfx'; // the lone sound toggle these settings grew out of

/** How fast a battle plays: a multiplier on every pause the fight view takes. */
export const SPEEDS = {
  normal: { id: 'normal', name: 'Normal', mul: 1 },
  fast: { id: 'fast', name: 'Fast', mul: 0.35 },
  instant: { id: 'instant', name: 'Instant', mul: 0.08 },
};
/**
 * Type size. The stylesheet is written in pixels rather than ems, so the honest way to grow it is to
 * scale the page itself: everything grows together and the layout reflows as if the screen were smaller.
 */
export const TEXT_SIZES = { normal: { id: 'normal', name: 'Normal', zoom: 1 }, large: { id: 'large', name: 'Large', zoom: 1.12 }, huge: { id: 'huge', name: 'Huge', zoom: 1.25 } };
export const MOTIONS = { full: { id: 'full', name: 'Full' }, reduced: { id: 'reduced', name: 'Reduced' } };
export const CONTRASTS = { normal: { id: 'normal', name: 'Normal' }, high: { id: 'high', name: 'High' } };
/**
 * The look of the thing. `guide` is a naturalist's plate book worked on a dark ground — a book serif, inked
 * rules drawn rather than bordered, type colour on swatches instead of filled pills, and light itself doing
 * the emphasising. `slate` is the interface the game shipped with, kept whole for anyone who prefers it.
 */
export const THEMES = { guide: { id: 'guide', name: 'Field guide' }, slate: { id: 'slate', name: 'Slate' } };
/** The score: off, quiet, or as written. */
export const MUSIC_LEVELS = { off: { id: 'off', name: 'Off', v: 0 }, low: { id: 'low', name: 'Quiet', v: 0.5 }, full: { id: 'full', name: 'Full', v: 1 } };

export function defaultSettings() { return { sound: true, music: 'low', speed: 'normal', text: 'normal', motion: 'full', contrast: 'normal', theme: 'guide' }; }

const pickOption = (table, v, fallback) => (v && table[v] ? v : fallback);
/** Coerce anything into a settings record, so a hand-edited or older key cannot break the boot. */
export function normalizeSettings(raw) {
  const s = defaultSettings();
  if (!raw || typeof raw !== 'object') return s;
  s.sound = raw.sound !== false;
  s.music = pickOption(MUSIC_LEVELS, raw.music, raw.music === false ? 'off' : 'low');
  s.speed = pickOption(SPEEDS, raw.speed, raw.fast ? 'fast' : 'normal'); // `fast` was the old boolean
  s.text = pickOption(TEXT_SIZES, raw.text, 'normal');
  s.motion = pickOption(MOTIONS, raw.motion, 'full');
  s.contrast = pickOption(CONTRASTS, raw.contrast, 'normal');
  s.theme = pickOption(THEMES, raw.theme, 'guide');
  return s;
}

function settingsStorage(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function loadSettings(storage) {
  const st = settingsStorage(storage);
  if (!st) return defaultSettings();
  try {
    const raw = st.getItem(SETTINGS_KEY);
    if (raw) return normalizeSettings(JSON.parse(raw));
    const s = defaultSettings();
    if (st.getItem(LEGACY_SFX_KEY) === 'off') s.sound = false; // carry the old sound switch over
    return s;
  } catch { return defaultSettings(); }
}

export function saveSettings(settings, storage) {
  const st = settingsStorage(storage);
  if (!st) return false;
  try { st.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings))); return true; } catch { return false; }
}

/** The multiplier the fight view puts on every pause it takes. */
export function speedMul(settings) { return SPEEDS[(settings && settings.speed) || 'normal'].mul; }
/** How loud the score should be, 0 when it is off. */
export function musicVolume(settings) { return MUSIC_LEVELS[(settings && settings.music) || 'low'].v; }

/**
 * Stamp the settings onto the document: the stylesheet reads them off the root element, so type size,
 * reduced motion and high contrast are one attribute each rather than a pass over every rule.
 */
export function applySettings(settings, doc) {
  const d = doc || (typeof document !== 'undefined' ? document : null);
  if (!d || !d.documentElement) return settings;
  const s = normalizeSettings(settings);
  const root = d.documentElement;
  root.dataset.text = s.text;
  root.dataset.motion = s.motion;
  root.dataset.contrast = s.contrast;
  root.dataset.theme = s.theme;
  const { zoom } = TEXT_SIZES[s.text];
  root.style.zoom = zoom === 1 ? '' : String(zoom);
  return s;
}
