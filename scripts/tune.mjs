// Balance tuner: pull every species' tournament win rate into the 40-60% band by adjusting base stat totals.
// Usage: node scripts/tune.mjs [rounds] [gamesPerRound] [gain] [verifyGames]
// Each round runs a fresh-seeded tournament (level 50, 3v3), nudges each species' bst toward 50% (gain points of
// bst per 100% of deviation, so gain 160 moves a 60% species down 16), then a final larger tournament verifies.
// The tuned totals are written back into src/data/species.js in place.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECIES, WILD_SPECIES } from '../src/data/species.js';
import { tournament } from '../src/battle/sim.js';

const [rounds = 6, games = 4000, gain = 160, verifyGames = 10000] = process.argv.slice(2).map(Number);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'src/data/species.js');
const MIN = 360, MAX = 520, LOW = 40, HIGH = 60;

if (!WILD_SPECIES.every((s) => SPECIES.includes(s))) throw new Error('wild species are not the shared objects');
const before = Object.fromEntries(SPECIES.map((s) => [s.id, s.bst]));
const spread = (r) => {
  const rates = Object.entries(r.species).map(([id, v]) => [id, v.winRate]);
  const out = rates.filter(([, w]) => w < LOW || w > HIGH);
  return { min: Math.min(...rates.map((x) => x[1])), max: Math.max(...rates.map((x) => x[1])), outside: out.sort((a, b) => a[1] - b[1]) };
};

for (let round = 0; round < rounds; round++) {
  const t0 = Date.now();
  const r = tournament({ games, level: 50, partySize: 3, seed: `tune:${round}:${Date.now() % 1000}` });
  const sp = spread(r);
  let moved = 0;
  for (const s of SPECIES) {
    const v = r.species[s.id];
    if (!v || v.played < 20) continue;
    const delta = 0.5 - v.winRate / 100;
    // ease off inside the band so species already close only drift a little
    const k = Math.abs(delta) <= 0.05 ? gain * 0.5 : gain;
    const step = Math.round(delta * k);
    if (!step) continue;
    s.bst = Math.max(MIN, Math.min(MAX, s.bst + step));
    moved++;
  }
  console.log(`round ${round + 1}/${rounds}: ${games} games in ${((Date.now() - t0) / 1000).toFixed(0)}s, spread ${sp.min}-${sp.max}%, ${sp.outside.length} outside ${LOW}-${HIGH}, ${moved} totals moved`);
  if (sp.outside.length) console.log('  outside: ' + sp.outside.map(([id, w]) => `${id} ${w}%`).join(', '));
}

// write the totals back
let src = fs.readFileSync(file, 'utf8');
let changed = 0;
for (const s of SPECIES) {
  if (s.bst === before[s.id]) continue;
  const re = new RegExp(`(id: '${s.id}',[^\\n]*?bst: )(\\d+)`);
  if (!re.test(src)) throw new Error(`could not find bst for ${s.id}`);
  src = src.replace(re, `$1${s.bst}`);
  changed++;
}
fs.writeFileSync(file, src);
console.log(`\nwrote ${changed} base stat totals to species.js`);
console.log('changes: ' + SPECIES.filter((s) => s.bst !== before[s.id]).map((s) => `${s.id} ${before[s.id]}->${s.bst}`).join(', '));

if (verifyGames > 0) {
  const t0 = Date.now();
  const r = tournament({ games: verifyGames, level: 50, partySize: 3, seed: `verify:${Date.now() % 1000}` });
  const sp = spread(r);
  console.log(`\nverify: ${verifyGames} games in ${((Date.now() - t0) / 1000).toFixed(0)}s, spread ${sp.min}-${sp.max}%, ${sp.outside.length} outside ${LOW}-${HIGH}`);
  if (sp.outside.length) console.log('  outside: ' + sp.outside.map(([id, w]) => `${id} ${w}%`).join(', '));
  const rows = Object.entries(r.species).sort((a, b) => b[1].winRate - a[1].winRate);
  console.log('\nBy species:');
  for (const [k, v] of rows) console.log(`  ${k.padEnd(13)} ${String(v.winRate).padStart(3)}%  (${v.played})`);
}
