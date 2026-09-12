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

Phase 3 — Battle: a deterministic, headless battle engine (567 moves, 1,040
passives, weather and terrain, screens and hazards, confusion, binds, taunts,
encores, guards and decoys, status, stages, switching, parties of five, AI
opponent, balance simulator) and a portrait fight view.

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

Natures: every creature is born with one of 49 natures. Forty-two lift one
of the seven battle stats by a tenth and lower another by a tenth (Brash is
more Melee Atk and less Ranged Atk, Timid more Speed and less Melee Atk);
seven are even. HP is never touched. A fusion takes a parent's nature, and
the creature sheet marks the lean on the stat bars.

The Trophy Hall: a room in the Storage building where 20,000 gold buys a wing
of three shelves, up to five wings, and any creature in your collection can
stand on one for free. The hall persists across journeys. The dyer's bench
there draws a party creature a new colour morph for 12,000 gold, random and
never the one it has.

The broker: 2,000 gold at the Market buys word of a creature your Dex has
never seen, naming its region and types and marking it seen. Three offers
stand at a time and the list runs dry once the Dex has seen everything.

Nature draws: the shrine draws a creature a new nature for 8,000 gold, random
and never the one it has. The draw follows the journey and the number of draws
so far, so reloading cannot fish for a better one.

Stat coaching: a camp moves one point of a creature's stat spread from one
stat to another for 2,000 gold plus 50 a level, up to ten times each. The
spread always sums to the same total, so coaching changes a creature's shape
and never its power.

The charm forge: two of the same charm and twice its price in gold make its
greater form, which is never sold. Greater charms carry stronger numbers, and
the once-a-battle ones fire twice.

A second passive slot: 40,000 gold at the Rookery opens a second slot on one
creature for good, and from then on it fights with both passives. Swaps and
wild draws can turn over either slot. Only the player can buy one, so wild
creatures and trainers still field a single passive.

The postgame: once you beat the Council, the Spire opens the Trial of the Day,
one gauntlet a day seeded by the date so everyone meets the same one, with a
rule that narrows what you may bring and three fights at level 70; and each
region you hold a badge for has an Elder waiting at its lair, a rare of that
class at level 78 that shows itself once and can be caught.

Dex, Index and Team: the Dex searches every class at once by name, filters by
type and by caught, seen or missing, indexes all 1,040 passives and 567 moves
with a search that also reads the wording, and reads your party back to you:
what it can hit, what hits it for double, and how it splits across the
Melee, Ranged and Magic triangle.

The field: four weathers (Harsh Sun, Rain, Sandstorm, Snowfall) and three
terrains (Grassy, Charged, Misty), five turns each, set by eighteen new moves,
by a hundred new passives as their owner walks in, or by the region the fight
started in — the Ember Scar opens bright, the Fen wet, the Warren all grit.
Weather lifts and smothers by type and wears down anything not born in it;
terrain only reaches what is standing on it, so a Flying type is above all of
it. A chip under the arena names what is up and how long it has left.

Volatiles and the ground: confusion, binds that also hold a creature in place,
taunts, encores, a guard that turns a turn aside and a decoy that takes the
hits — all dropped the moment a creature leaves the field. Each side can also
raise three screens, a tailwind and a safeguard, and scatter caltrops, toxic
burrs or stone shards for whatever walks in next; a spinning move sweeps your
own ground clear.

Titans: eighteen authored bosses, one per class, waiting in the lair once you
hold that region's badge. A named creature with an escort, twenty levels over
its Warden, both passive slots filled, a greater charm in hand and its own
region's weather already up. Once a journey, and it leaves the greater form of
that region's charm behind.

Settings and slots: sound, a procedural score with a theme per region, battle
speed, text size, motion and contrast are kept in their own key, so they follow
you across saves; three save slots hold three journeys at once, and the picker
shows the badges, party and gold in each.

Storage: the box has a search, six sort orders and a select mode for
withdrawing or releasing a handful at once, plus three saved teams you can put
back on at any time.

Trainers: each of the road's trainers has one of eight personalities that
leans their team towards a damage style and gives them their own rematch
line, and each of the eighteen Wardens fights to an authored theme with a
motto, a badge line and a rematch line. A beaten trainer offers a rematch
once your best creature has outgrown their lead, coming up to two levels
under it, and pays a quarter of the gold.

Learning a move: the Market stocks the basics (every Normal scroll and
anything of 60 power or less), each region's camp has a tutor who teaches
three types at seven tenths of the Market's price once you hold that region's
badge, and any camp will recall a move a creature has outgrown from its own
learnset for 150 gold plus 10 a level.

The Rookery: a hut beside the notice board where a creature's passive can be
turned over. A swap moves it to another passive its own bloodline carries (the
other of its species' pair, or any parent's for a fusion) for 900 gold plus 20
a level, and can be swapped back. A wild draw costs 3,500 plus 40 a level,
cannot be chosen, and takes one at random from the passives that suit the
creature's types or its fighting style. An Elemental keeps its core.

Bounty Office: a small house on the square with five standing bounties, each
wanting a fusion of a given type. Hand over any shrine-born creature carrying
that type, from the party or storage, for the listed gold times a level bonus
that runs from 1.01 at level 1 to 2.00 at level 100. The creature is gone for
good but stays in your Collection, and a new bounty goes up at once.

Notice board: three requests from the townsfolk hang in the Crossroads at a
time, drawn from ten kinds (catch a type above a level, catch a named species,
beat trainers on a biome's roads, fuse two of a class, rest at a camp, win a
Tower floor, beat a Warden, catch an alpha, catch a count, defeat wild
creatures of a type) and scaled to the badges held. Finish one anywhere,
claim it at the board for gold and a potion, a scroll or a charm, and a fresh
notice goes up.

Fusiondex: a dex of all 895 species, per class, with everything you have
faced marked seen and everything you have chosen, caught or fused marked
caught, silhouettes for the seen, numbered blanks for the rest, a habitat hint
on every card, a gallery of your fusions, and milestone rewards (gold and
charms) that pay out once per save. Wild creatures wear a dex mark on the
encounter card and in the fight: a filled ring if you have caught the species
before, a hollow one if not. Colour morphs join the hunt: one wild
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
less often; catch odds follow your strongest party member, 5% up or down per
level between it and the wild creature; trainers on the roads fight when asked; each biome's Warden holds
a badge; camps heal and set the respawn point; a shrine fuses; trainers pay
gold that the Market turns into potions, charms and single-use move scrolls for your
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
