// Procedural sound effects on WebAudio. No assets. Everything is a few tones or
// a burst of noise, so it costs nothing to ship and never needs loading.
let ctx = null;
let enabled = true;

export function setSfxEnabled(v) { enabled = Boolean(v); if (enabled) audioCtx(); }
export function sfxEnabled() { return enabled; }

function audioCtx() {
  if (!enabled) return null;
  return sharedAudio();
}

/** The one audio context the whole app plays through, sound effects and score alike. */
export function sharedAudio() {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}

function tone({ freq = 440, to = null, type = 'square', dur = 0.12, gain = 0.07, delay = 0 }) {
  const c = audioCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(20, freq), t0);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.15, gain = 0.1, delay = 0, cutoff = 1200 }) {
  const c = audioCtx();
  if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime + delay);
}

const arp = (freqs, type, dur, gap, gain = 0.06) => freqs.forEach((f, i) => tone({ freq: f, type, dur, gain, delay: i * gap }));

export const sfx = {
  tap: () => tone({ freq: 660, type: 'triangle', dur: 0.05, gain: 0.035 }),
  hit: (eff = 1) => { noise({ dur: 0.12, gain: eff >= 2 ? 0.18 : 0.1, cutoff: eff >= 2 ? 2400 : 1200 }); tone({ freq: eff >= 2 ? 240 : 160, to: 55, type: 'square', dur: 0.16, gain: 0.07 }); },
  miss: () => tone({ freq: 520, to: 300, type: 'sine', dur: 0.16, gain: 0.04 }),
  heal: () => arp([523, 784], 'sine', 0.14, 0.09),
  status: () => tone({ freq: 320, to: 190, type: 'sawtooth', dur: 0.22, gain: 0.045 }),
  stat: (up) => (up ? arp([440, 660], 'triangle', 0.08, 0.06, 0.04) : arp([660, 440], 'triangle', 0.08, 0.06, 0.04)),
  faint: () => tone({ freq: 420, to: 50, type: 'sawtooth', dur: 0.55, gain: 0.07 }),
  wobble: () => tone({ freq: 330, to: 270, type: 'triangle', dur: 0.14, gain: 0.05 }),
  capture: (ok) => (ok ? arp([523, 659, 784, 1047], 'square', 0.13, 0.1) : tone({ freq: 220, to: 110, type: 'square', dur: 0.28, gain: 0.06 })),
  levelUp: () => arp([659, 784, 988, 1319], 'triangle', 0.15, 0.08),
  win: () => arp([523, 659, 784, 1047, 1319], 'square', 0.16, 0.11, 0.05),
  lose: () => arp([392, 349, 311, 196], 'sawtooth', 0.28, 0.2, 0.05),
  fuse: () => { arp([262, 330, 392, 523, 659, 784], 'sine', 0.2, 0.07, 0.05); noise({ dur: 0.5, gain: 0.05, cutoff: 600, delay: 0.3 }); },
  /** A short cry shaped by the genome: bigger creatures are lower, type picks the timbre. */
  cry: (genome) => {
    const size = genome && genome.traits && genome.traits.size != null ? genome.traits.size : 0.5;
    const base = 720 - size * 420;
    const t = genome && genome.types ? genome.types[0] : 'Normal';
    const type = ['Electric', 'Steel', 'Rock', 'Bug'].includes(t) ? 'square' : ['Ghost', 'Psychic', 'Fairy', 'Ice', 'Water'].includes(t) ? 'sine' : ['Dragon', 'Fire', 'Fighting', 'Dark'].includes(t) ? 'sawtooth' : 'triangle';
    tone({ freq: base, to: base * 1.45, type, dur: 0.13, gain: 0.06 });
    tone({ freq: base * 1.3, to: base * 0.75, type, dur: 0.22, gain: 0.055, delay: 0.13 });
  },
};
