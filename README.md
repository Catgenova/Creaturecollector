# Creature Collector

A mobile-first HTML creature battler with procedural monster fusion. No
dependencies; the whole game ships as a single `index.html`.

**Play it:** https://catgenova.github.io/Creaturecollector/ (GitHub Pages,
deployed from `main` on every push). Or open `index.html` locally.

## Status

Phase 1 — Creature Lab: seeded procedural creatures assembled from a part
library, with recolouring, diploid part genes, species, stats and shareable
creature codes. The Lab and Parts tabs have since been folded away; the
creature sheet (passive skill, stats, moves and learn levels, parts, palette, stages, Elemental preview) opens from
anywhere in the overworld, and creature codes now live only in saves and tests.

Phase 2 — Fusion: fuse any two creatures of a class into one, with an
inheritance report; stress-tested over five generations. It shipped as a
Fusion Lab tab and now lives at the overworld's shrine.

Phase 3 — Battle: a deterministic, headless battle engine (326 moves, 30
abilities, status, stages, switching, parties of five, AI opponent, balance
simulator) and a portrait fight view.

Phase 4 — The game loop: starters, in-battle capture, XP and levels, party and
box, autosave with export and import, and a persistent collection. It first
shipped as an endless arena, since replaced by the overworld below.

Phase 5 — Polish and balance: learnsets rebuilt on one curve, the level curve
tuned with a whole-run simulator, move-learning prompts, procedural sound, 28
species and 130 parts.

Phase 6 — Art rebuild, class by class: every class gets its own skeleton
(rig) with its own slots, and a hand-drawn library of seven parts per slot.
Done so far: mammals (fox, cat, bear, rabbit, deer, wolf, mouse; 85 parts,
nineteen species), reptiles (lizard, croc, turtle, dragon, serpent, chameleon,
raptor; 85 parts, sixteen species), fish (round, betta, shark, angler, puffer,
seahorse, eel; 84 parts, fifteen species), birds (songbird, owl, hawk, penguin,
duck, parrot, peacock; 84 parts, fifteen species), insects (beetle, bee, mantis,
dragonfly, ladybug, ant, moth; 84 parts, sixteen species), invertebrates (slug,
crab, jelly, octopus, wisp, scorpion, spider; 84 parts, fifteen species),
amphibians (frog, toad, tree frog, axolotl, newt, salamander, polliwog; 84
parts, fifteen species), flora (sprout, bulb, creeper, trunk, lilypad, barrel,
gourd stems; 84 parts, fourteen species), oozes (blob, column, slab, droplet,
cube, whirl, amoeba; 84 parts, fourteen species), fungi (button, parasol, cone,
morel, puffball, bell, funnel caps; 84 parts, fourteen species), wyrms (serpent,
rearing, arch, coil, knot, cloud rider, lindworm coils; 84 parts, fourteen
species) and draconic (drake, brute, wyvern, longback, pudgy, armoured,
serpentine; 84 parts, fourteen species), skeletals (ribcage, barrel, coil,
keel, fishbone, wrapped, giant; 84 parts, fourteen species), nightwings (round,
slim, fluffy, long, pear, tiny, broad bat bodies; 84 parts, fourteen species),
crystallines (boulder, shard, geode, cluster, slab, prism, pebble; 84 parts,
fourteen species), myriapods (segmented, armoured, flat, bulbous, long, spiky,
coiled trunks; 84 parts, fourteen species), fiends (imp, brute, lanky, stout,
armoured, hunched, regal torsos on the first upright rig; 84 parts, fourteen
species) and spirits (wisp, sheet, orb, shade, flame, wraith, blob shrouds on a
headless hovering rig; 84 parts, fourteen species): 265 species in all, every
class covering fourteen or more of the eighteen types, and an element pass
then added fourteen more species to every class as hosts for the six later
elements, and a type pass added twenty-one more to every class (one species
per type, so every class now covers all eighteen types, plus three rare
signatures), taking the roster to 895. Classes lock fusion to
the same anatomy. All eighteen classes are on rigs and the old shared skeleton is gone. A fantasy pass then
pushed every slot away from field-guide realism: forehead sigils, tufted and
leaf ears, orb and flame tails, glowing tips and bold markings. See `DESIGN.md`.

Fusiondex: a dex of all 895 species, per class, with everything you have
faced marked seen and everything you have chosen, caught or fused marked
caught, silhouettes for the seen, numbered blanks for the rest, a habitat hint
on every card, a gallery of your fusions, and milestone rewards (gold and
charms) that pay out once per save. Colour morphs join the hunt: one wild
creature in 256 is albino, melanistic or pastel, announced by name, kept
through fusion and tracked on the dex card.

Held charms: a creature holds one charm and carries it into every fight.
Eighteen type charms lift one type's moves by a fifth, three bands lift one
damage type by a tenth, and ten utility charms add a small passive (Moss
regenerates, Salve cures once a battle, Sturdy holds one blow from full HP,
Siphon heals on hit, Hawk doubles critical hits, Swift adds Speed, Scholar and
the Lucky Coin lift experience and gold, Lure and Prism shape the road). The
Market sells them, every Warden hands one over with their badge, the Bag gives
and swaps them, and a released or fused creature's charm comes back to you.

Signature moves: every rare species (129 of them) learns a move of its own at
level 38 that no other species has and no scroll teaches; fusion can carry it
on. Seven new move effects came with them: restoring HP on a hit, curing the
user's own status, piercing defence boosts, resting the turn after a huge hit,
sweeping the foe's stat changes, and bonuses at low HP or for moving first.

Damage triangle: every attack is Melee, Ranged or Magic with its own attack and
defense stat; Magic beats Ranged beats Melee beats Magic against a creature's
style, and move cards say so in words. A move matching one of the creature's
types earns +25%, one matching its style another +25%.

Elementals: one wild creature in a thousand is born of one of fourteen elements.
Every part it has carries an animated element filter and it knows the element's
core ability; parts keep their element when passed down in fusion, and the
ability follows by chance.

Evolutions: every species evolves at level 33 and again at 66, growing larger
with its features more pronounced, then exaggerated. Nothing is stored; the
level decides, and the creature sheet previews any creature at any stage. Every part
of every class has hand-drawn stage 2 and stage 3 art, with a procedural growth
pass as the fallback for anything new.

Overworld: the main mode is now a large seeded map with eighteen biomes around
a hub town, one per class in rising difficulty. Habitat patches spawn the
class's species by element type, with stronger and rarer creatures turning up
less often; trainers on the roads fight when asked; each biome's Warden holds
a badge; camps heal and set the respawn point; a shrine fuses; trainers pay
gold that the Market turns into potions and single-use move scrolls for your
Bag (potions work in battle too, and take the turn; a creature learns
scrolls of its own types, of its Elemental element, and any Normal scroll); the Creature Storage
holds the box; the Battle Tower's six floors fight six on six with random
creatures at a level you pick from 50 to 100, paying experience and gold; a creature's Info can rename, lock or release it; experience follows Pokémon Red's formula, is shared by the
creatures that fought and reaches the rest of the party at half rate; move
cards show accuracy and every side effect's odds, and PP follows power (the
harder a move hits or the nastier its status, the fewer uses); and with every badge the Council
Spire opens to four fights back to back. Walk with the
keyboard, the on-screen pad or a tap on the ground. It fits a phone in either
orientation, and the page installs to the home screen and plays offline. The endless arena is gone;
its capture, XP, party and collection systems live on here, and an old save's
arena creatures join the collection.

Creature polish: accents are kept a clear perceptual step away from the base
colours on every roll, fusion and load; a fusion's coat follows the parent that
supplied most of its parts while the accent and eyes travel with the face; and
a head that was not drawn for its body is eased toward the body's designed
proportion. Every creature is lit from the upper left, small renders drop fine
detail so silhouettes stay clean in lists, and shadows are sized to the body
with contact shadows under standing feet. Creatures hold an idle pose that
matches their combat style (melee braces forward, ranged crouches, magic
stands poised) and flash attack and recoil poses in fights. Final evolutions
carry a class signature (ruffs, swept horns, plume trains, riveted plates,
lateral glow, translucent cores) and the shared pattern parts were redrawn
per class.

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
AI-vs-AI tournaments and prints win rates by species and type.

Visual review: `node scripts/shot.mjs [seed]` walks the overworld at phone size
into an encounter, a fight, the map and the party, screenshotting into
`shots/` (needs Playwright installed globally or locally; dev only). Library
boards: `node scripts/evolutions.mjs <rig>` and `node scripts/hero.mjs <ids>`
with `scripts/shot-board.mjs` to render them.
