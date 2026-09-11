// Names. Species carry hand-picked [prefix, suffix] halves; a fusion takes the
// prefix of the parent that gives its face and the suffix of the other one.

const VOWELS = 'aeiouy';

/** Join two name halves at a clean boundary. "Gla"+"ox" -> "Glox", "Puff"+"fin" -> "Puffin". */
export function joinNameParts(prefix, suffix) {
  let p = String(prefix || '').trim(), s = String(suffix || '').trim();
  if (!p) return capitalize(s || 'Fusion');
  if (!s) return capitalize(p);
  const pl = p[p.length - 1].toLowerCase(), s0 = s[0].toLowerCase();
  if (pl === s0) p = p.slice(0, -1);
  else if (VOWELS.includes(pl) && VOWELS.includes(s0)) p = p.slice(0, -1);
  return capitalize((p + s).slice(0, 20));
}

/** Fallback split for names without authored halves: after the first vowel cluster and the consonants that follow it. */
export function splitName(name) {
  const n = String(name || 'Fusion');
  const m = n.match(/^([^aeiouy]*[aeiouy]+[^aeiouy]+)(.+)$/i);
  if (m && m[2].length >= 2 && m[1].length >= 2) return [m[1], m[2].toLowerCase()];
  const cut = Math.ceil(n.length / 2);
  return [n.slice(0, cut), n.slice(cut).toLowerCase()];
}

export function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
