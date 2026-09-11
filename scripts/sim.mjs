// Balance report: node scripts/sim.mjs [games] [level] [partySize] [seed]
import { tournament } from '../src/battle/sim.js';
const [games = 200, level = 50, partySize = 3, seed = 'tourney'] = process.argv.slice(2);
const r = tournament({ games: Number(games), level: Number(level), partySize: Number(partySize), seed });
console.log(`${r.games} games, level ${r.level}, ${r.partySize}v${r.partySize}, avg ${r.avgTurns.toFixed(1)} turns, draws ${r.draws}, timeouts ${r.timeouts}\n`);
const row = (k, v) => `${k.padEnd(12)} ${String(v.winRate).padStart(3)}%  (${v.played})`;
console.log('By species:');
for (const [k, v] of Object.entries(r.species).sort((a, b) => b[1].winRate - a[1].winRate)) console.log('  ' + row(k, v));
console.log('\nBy type:');
for (const [k, v] of Object.entries(r.types).sort((a, b) => b[1].winRate - a[1].winRate)) console.log('  ' + row(k, v));
