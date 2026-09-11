// Arena progression study: node scripts/sim-run.mjs [runs] [seed] [maxFloors]
import { runStudy } from '../src/battle/sim.js';
const [runs = 30, seed = 'study', maxFloors = 40] = process.argv.slice(2);
const r = runStudy({ runs: Number(runs), seed, maxFloors: Number(maxFloors) });
console.log(`${r.runs} runs · floors reached: min ${r.min}, p25 ${r.p25}, median ${r.median}, p75 ${r.p75}, max ${r.max}`);
console.log(`avg turns/battle ${r.avgTurns.toFixed(1)} · captures ${r.captures} · fusions ${r.fusions} · lead level minus foe level at death ${r.levelGapAtDeath.toFixed(1)}`);
console.log('win/loss by kind:', JSON.stringify(r.kinds));
console.log('deaths by floor:', Object.entries(r.deaths).sort((a, b) => a[0] - b[0]).map(([f, n]) => `${f}:${n}`).join(' '));
