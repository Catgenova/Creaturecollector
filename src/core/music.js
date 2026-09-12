// A score with no music in it: every theme is a handful of numbers, and the notes are worked out as
// they are needed. One region's theme differs from the next because its name hashes differently, so
// eighteen places sound like eighteen places without a byte of audio being shipped.
//
// The scheduler is the usual one for WebAudio: a musicTimer wakes often, and every wake queues the notes
// that fall inside the next look-ahead window, so the timing lives in the audio clock rather than in
// setInterval's drift.
import { sharedAudio } from './sfx.js';

export const MUSIC = { lookahead: 0.5, tick: 120, gain: 0.16, fade: 0.6 };

/** The modes a theme can be in: bright to dark, chosen by what the theme is for. */
const MODES = {
  ionian: [0, 2, 4, 7, 9], // major pentatonic: open country
  dorian: [0, 2, 3, 5, 7, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10], // the minor of caves and marshes
  phrygian: [0, 1, 3, 5, 7, 8, 10], // something is wrong here
  blues: [0, 3, 5, 6, 7, 10],
};
const MODE_IDS = Object.keys(MODES);

let musicOn = false, musicLevel = 1, musicBus = null, musicTimer = null;
let musicTheme = null, musicNext = 0, musicStep = 0, musicSeed = 1;

const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/** A tiny deterministic generator so a theme plays the same way every time it is heard. */
const nextRandom = () => { musicSeed = (Math.imul(musicSeed, 1664525) + 1013904223) >>> 0; return musicSeed / 4294967296; };
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

/**
 * A theme is worked out from its name: the key, the mode, the tempo and how busy it is.
 * `kind` shapes it further — a battle is faster and lower, a boss darker still.
 */
export function themeSpec(id) {
  const h = hash(id);
  const kind = id.split(':')[0];
  const root = 45 + (h % 7) + (kind === 'battle' || kind === 'boss' ? -5 : 0); // A2-ish, lower for a fight
  let mode = MODE_IDS[h % MODE_IDS.length];
  if (kind === 'boss') mode = 'phrygian';
  if (kind === 'battle') mode = h % 2 ? 'blues' : 'dorian';
  if (kind === 'title') mode = 'ionian';
  const tempo = kind === 'boss' ? 148 : kind === 'battle' ? 138 : kind === 'title' ? 92 : 96 + (h % 5) * 6;
  return {
    id, kind, root, mode, tempo,
    density: kind === 'battle' || kind === 'boss' ? 0.85 : 0.6 + ((h >>> 3) % 3) * 0.08,
    wave: kind === 'boss' ? 'sawtooth' : kind === 'battle' ? 'square' : ['triangle', 'square', 'sine'][(h >>> 5) % 3],
    bass: kind === 'title' ? 'sine' : 'triangle',
    drums: kind === 'battle' || kind === 'boss',
    seed: h || 1,
  };
}

function bus() {
  const ctx = sharedAudio();
  if (!ctx) return null;
  if (!musicBus || musicBus.context !== ctx) {
    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(ctx.destination);
  }
  return ctx;
}

function ramp(ctx, to, seconds) {
  if (!musicBus) return;
  const now = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.setValueAtTime(musicBus.gain.value, now);
  musicBus.gain.linearRampToValueAtTime(to, now + seconds);
}

function voice(ctx, { freq, when, dur, type, gain, glide }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), when + dur);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g).connect(musicBus);
  o.start(when);
  o.stop(when + dur + 0.05);
}

function hit(ctx, when, gain) {
  const n = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  n.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
  n.connect(g).connect(musicBus);
  n.start(when);
}

/** One sixteenth of the bar: bass on the beat, a walk over the mode above it, a tick to keep time. */
function scheduleStep(ctx, spec, when, i) {
  const scale = MODES[spec.mode];
  const bar = i % 16;
  if (bar % 4 === 0) { // the low end, root and fifth
    const deg = bar === 0 ? 0 : bar === 8 ? 4 : 2;
    voice(ctx, { freq: midi(spec.root + (scale[deg % scale.length] || 0)), when, dur: 0.5, type: spec.bass, gain: 0.09 });
  }
  if (nextRandom() < spec.density && bar % 2 === 0) { // the tune
    const up = 12 + (nextRandom() < 0.25 ? 12 : 0);
    const note = spec.root + up + scale[Math.floor(nextRandom() * scale.length)];
    voice(ctx, { freq: midi(note), when, dur: bar % 8 === 0 ? 0.28 : 0.16, type: spec.wave, gain: 0.05 });
  }
  if (spec.drums && bar % 4 === 2) hit(ctx, when, 0.05);
  if (spec.drums && bar === 12 && nextRandom() < 0.5) hit(ctx, when + 0.12, 0.03);
}

function pump() {
  const ctx = bus();
  if (!ctx || !musicTheme) return;
  const spb = 60 / musicTheme.tempo / 4; // one sixteenth
  while (musicNext < ctx.currentTime + MUSIC.lookahead) {
    if (musicNext < ctx.currentTime) musicNext = ctx.currentTime + 0.05;
    scheduleStep(ctx, musicTheme, musicNext, musicStep);
    musicNext += spb;
    musicStep++;
  }
}

/** Put a theme on. Calling it again with the same name does nothing, so it survives a re-render. */
export function playTheme(id) {
  if (!id) return stopMusic();
  if (musicTheme && musicTheme.id === id) return;
  musicTheme = themeSpec(id);
  musicSeed = musicTheme.seed;
  musicStep = 0;
  const ctx = bus();
  if (!ctx || !musicOn) return;
  musicNext = ctx.currentTime + 0.08;
  ramp(ctx, MUSIC.gain * musicLevel, MUSIC.fade);
  if (!musicTimer) musicTimer = setInterval(pump, MUSIC.tick);
  pump();
}

export function stopMusic() {
  musicTheme = null;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  const ctx = bus();
  if (ctx) ramp(ctx, 0, 0.25);
}

/** The theme that is playing, or null. */
export function currentTheme() { return musicTheme ? musicTheme.id : null; }

export function setMusicEnabled(on) {
  musicOn = Boolean(on);
  const ctx = bus();
  if (!ctx) return;
  if (!musicOn) { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } ramp(ctx, 0, 0.2); return; }
  if (musicTheme) { musicNext = ctx.currentTime + 0.08; ramp(ctx, MUSIC.gain * musicLevel, MUSIC.fade); if (!musicTimer) musicTimer = setInterval(pump, MUSIC.tick); }
}
export function musicEnabled() { return musicOn; }
export function setMusicVolume(v) {
  musicLevel = Math.max(0, Math.min(1, Number(v) || 0));
  const ctx = bus();
  if (ctx && musicOn && musicTheme) ramp(ctx, MUSIC.gain * musicLevel, 0.2);
}
