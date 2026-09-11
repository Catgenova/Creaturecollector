# Creature Collector

A mobile-first HTML creature battler with procedural monster fusion. No
dependencies; the whole game ships as a single `index.html`.

**Play it:** https://catgenova.github.io/Creaturecollector/ (GitHub Pages,
deployed from `main` on every push). Or open `index.html` locally.

## Status

Phase 1 — Creature Lab: seeded procedural creatures assembled from a part
library, with recolouring, diploid part genes, species, stats and shareable
creature codes.

Phase 2 — Fusion Lab: fuse any two creatures, read the inheritance report,
feed children back into the pool, stress-test five generations.

Phase 3 — Battle: a deterministic, headless battle engine (157 moves, 30
abilities, status, stages, switching, parties of five, AI opponent, balance
simulator) and a portrait battle screen.

Phase 4 — Endless Arena: the game loop. Starters, scaling floors of wild
creatures, trainers and wardens, in-battle capture, XP and levels, party and
box, fusion altars after bosses, autosave with export and import, and a
persistent collection.

Phase 5 — Polish and balance: learnsets rebuilt on one curve, arena curve tuned
with a whole-run simulator, move-learning prompts, procedural sound, 28 species
and 130 parts.

Phase 6 — Art rebuild, class by class: every class gets its own skeleton
(rig) with its own slots, and a hand-drawn library of seven parts per slot.
Done so far: mammals (fox, cat, bear, rabbit, deer, wolf, mouse; 85 parts,
twelve species), reptiles (lizard, croc, turtle, dragon, serpent, chameleon,
raptor; 85 parts, nine species), fish (round, betta, shark, angler, puffer,
seahorse, eel; 84 parts, eight species), birds (songbird, owl, hawk, penguin,
duck, parrot, peacock; 84 parts, eight species), insects (beetle, bee, mantis,
dragonfly, ladybug, ant, moth; 84 parts, nine species), invertebrates (slug,
crab, jelly, octopus, wisp, scorpion, spider; 84 parts, eight species) and
amphibians (frog, toad, tree frog, axolotl, newt, salamander, polliwog; 84
parts, eight species). Classes lock fusion to the same anatomy. All seven
classes are on rigs and the old shared skeleton is gone. A fantasy pass then
pushed every slot away from field-guide realism: forehead sigils, tufted and
leaf ears, orb and flame tails, glowing tips and bold markings. See `DESIGN.md`.

Damage triangle: every attack is Melee, Ranged or Magic with its own attack and
defense stat; Magic beats Ranged beats Melee beats Magic against a creature's
style, and move cards say so in words. A move matching one of the creature's
types earns +25%, one matching its style another +25%.

Elementals: one wild creature in a thousand is born of one of eight elements.
Every part it has carries an animated element filter and it knows the element's
core ability; parts keep their element when passed down in fusion, and the
ability follows by chance.

## Develop

```
npm run build      # src/ -> index.html (zero-dependency bundler in build.js)
npm test           # node:test suites (data integrity, genome, rendering, build)
npm run check      # both
npm run dev        # static server on :8080 (uses npx http-server)
```

Edit files in `src/`, never `index.html`. Every part of the game logic is a
plain ES module that Node can import, so the renderer and (soon) the battle
engine are testable headlessly.

Balance reports: `node scripts/sim.mjs [games] [level] [partySize] [seed]` runs
AI-vs-AI tournaments and prints win rates by species and type;
`node scripts/sim-run.mjs [runs] [seed] [maxFloors]` plays whole arena runs and
reports how far they get and where they die.

Visual review: `node scripts/shot.mjs [seed]` screenshots the Lab, a detail
sheet and the Parts tab at phone size into `shots/` (needs Playwright installed
globally or locally; dev only).
