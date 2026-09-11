# Creature Collector — design notes

A mobile-first HTML creature battler in the Pokémon mould, with procedural monster
fusion as the core progression system. Zero dependencies. Ships as one `index.html`.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Deliverable | A single `index.html`, built from `src/` by `node build.js`. The built file is committed so GitHub Pages on `main` serves it as is. |
| Stack | Vanilla JavaScript ES modules, no framework, no bundler dependency. Node's built-in test runner. |
| Creature art | Vector SVG, assembled from a growing part library. Every part is recolourable through colour roles and per-slot paint genes. |
| View | Side view, facing right. The enemy is mirrored. One part set serves both sides of a battle. |
| Types | The classic 18-type chart. |
| Battles | Turn-based, parties of up to 5, switching allowed. |
| Game frame | Endless arena first. Overworld and story are the long-term goal and drive the architecture (screens, save format, event log). |
| Platform | Mobile-first portrait layout, touch targets ≥ 44px, works on desktop too. |

## Repository layout

```
index.html            built artifact (do not edit by hand)
build.js              inlines src/ modules + CSS into index.html
src/app.html          page template
src/styles.css        all styles
src/core/             rng, util — no game knowledge
src/data/types.js     type list, chart, colours
src/data/rigs.js      class skeletons: slot lists, draw trees, sockets each part must expose
src/data/parts/       the part library: one folder per class (mammal/, reptile/, fish/, bird/, insect/, invertebrate/, amphibian/),
                      shared builders (_builders.js), drawing DSL (_dsl.js), registry (index.js)
src/data/species.js   base species recipes
src/data/elements.js  Elementals: the eight elements, their core abilities and one SVG filter each
src/creature/         genome (schema, rolls, codes), palette, render (SVG)
src/ui/               dom helpers, screens (lab, parts), app shell (main.js = build entry)
tests/                node:test suites
scripts/              screenshot helpers for visual review (Playwright, dev only):
                      shot.mjs (app flow), board.mjs <rig> + shot-board.mjs (library board), hero.mjs (close-ups)
```

Bundle conventions the build enforces: named exports only, relative imports on
one line, and every top-level name unique across all modules (the bundle is one
script scope). `node build.js --check` verifies without writing.

## Genome (version 1)

The genome is plain JSON with a fixed shape, so fusion is closed (fusing two
genomes always gives another valid genome) and any creature can be shared as a
`CC1.` code (base64url JSON, versioned).

```
v, seed, species, name, gen, shiny, types [primary, secondary|null], bst, lineage[]
parts   { slot: [expressed, carried] }     diploid: only the expressed allele is drawn
paint   { slot: 0..5 }                      which of c1/c2/c3 each colour role maps to, per slot
palette { c1, c2, c3, eye: [h, s, l] }
traits  { size, bulk, headScale, limbScale, tailScale, wingScale, eyeScale: 0..1 }
stats   { hp, melee, ranged, magic, meleeDef, rangedDef, magicDef, spe }  weights; base stats = weights normalised × bst
vigor   { same keys: 0..1 }                 per-creature quality, like IVs (used at level scaling)
```

Slots: body, head, eyes, mouth, crown, legs, arms, wings, tail, back, pattern.
Every slot except body and eyes has a `none` part. Bodies declare a `kind`
(quad, biped, blob, bird, serpent, fish, float); other parts may declare `fit`
kinds. If an expressed part does not fit the body, the carried allele is tried,
then nothing — so the genome never needs repair.

### Rolling a wild creature

`speciesGenome(species, rng)` is deterministic per seed. Each section uses its
own forked stream, so adding a roll to one section does not disturb the others.
Odds live in `ROLL` in genome.js: carried-allele mutation 10%, visible mutation
3%, paint permutation 12% per slot, shiny 1/64.

## Rendering

`renderCreatureSvg(genome, opts)` is a pure function producing an SVG string.
Parts are authored in a local space whose origin is the attachment point, facing
right, in the units of a 200-wide canvas.

Every creature is built on a **rig** (`src/data/rigs.js`): the skeleton of its
class. A rig lists the genome's slots, which of them carry a paint gene, which
are required, which are linked in fusion, and a **draw tree**. The renderer
walks that tree: each node names a slot and the socket on its parent part it
sits on; `behind` children are drawn before the parent's own shapes and `front`
children after, so ears hide their roots behind the skull and eyes ride the
head. Far-side copies (`far: true`) are drawn darker. Node `scale` picks a
trait scale (head, leg, tail, eye), `anim` a CSS animation group, `small`
marks detail parts that skip the heavy outline treatment. Slots in `clipped`
(markings) are drawn over the body under its silhouette clip, stretched from a
100 × 60 authoring frame onto the body's box. The lowest point of the rig's
`ground` slots is where the feet meet the floor.

A genome that names no rig or an unknown one (a code saved before the rebuild)
falls back to the default rig; its old part ids no longer resolve, so it is
rejected by the code validator rather than drawn wrong.

Colour roles: `p/pd/pl`, `s/sd/sl`, `a/ad/al`, `w/wd`, `e/ed`, `k`. The root SVG
sets `--c1..--c3` (+ shade/highlight), `--e`, `--ol`, `--w`; each slot group
remaps `p/s/a` onto those through its paint gene; far-side copies remap onto the
shade variants. Outlines come from one CSS rule (`.cr .o`) with
`paint-order: stroke` for the sticker look. Shading is part data: translucent
outline-colour washes (`SH`) and white washes (`HL`) clipped to the part's own
silhouette, so they survive any recolour.

The frame is fixed (200 × 230, ground at y = 208) so sizes are comparable.
`opts.fit` crops to the creature's bounds, computed by flattening every path,
for hero shots. Animation is CSS only: idle bob, head nod, tail sway, wing flap;
disabled under `prefers-reduced-motion`.

### Drawing DSL (`src/data/parts/_dsl.js`)

- Primitives: `P(path, role, opts)`, `E(cx,cy,rx,ry, role)`, `C(cx,cy,r, role)`,
  `L(path, role, width)` (stroke only). Options: `op` opacity, `ns` no outline,
  `sw` outline width, `cl` clip to the part's silhouette.
- Washes and patches: `SH(path, opacity)` shadow, `HL(path, opacity)` highlight,
  `PATCH(path, role)` an outline-free colour patch; all clipped to the part.
- Curves: `spline(points)` turns a point list into a smooth closed path
  (Catmull-Rom); a point is `[x, y]`, `[x, y, 'c']` for a corner, or `[x, y, k]`
  to scale its roundness. `S(points, role)` is the filled shorthand.
- Generators for point lists: `fur(a, b, n, amp)` tufted edge (positive amp is
  the outside of a clockwise outline), `tube(centre, w0, w1)` a tapered tube for
  tails and horns, `puff(cx, cy, r, n, amp)` a fluffy ball, `arcPts`, `xfPts`,
  `mirrorPts`, `leaf`.

### Adding a part

1. Add an entry to the slot's file in the class folder (mammals:
   `src/data/parts/mammal/<slot>.js`), built with the helpers in its `_shared.js`.
2. Draw facing right with the origin at the attachment point. Give it a stable
   `id` (mammal ids are `m.<slot>.<name>`), a `name`, a `dom` (dominance 0..1,
   used by fusion) and `w` (weight when rolled as a mutation). Add `fit` if it
   only suits some body kinds, and `tags` for flavour.
3. Parents must expose every socket the rig's draw tree places children on;
   `npm test` checks that, renders the part on its class mannequin, and insists
   on at least seven real parts per slot of every class rig.
4. Review it: `node scripts/board.mjs <rig>` writes a board of every part of a
   class and its species; `node scripts/hero.mjs fox,drakelet` writes close-ups;
   `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/shot-board.mjs <html> <png>`
   screenshots either.

Never rename or reuse an id: saved creatures reference ids forever.

## Fusion (Phase 2 — implemented)

`fuse(a, b, rng) -> { child, report }` in `src/creature/fusion.js`. Deterministic
per seed; the Fusion Lab seeds it from both parents plus a re-roll counter.

- **Parts.** Per slot the child draws one allele from each parent at random. The
  allele with the higher dominance (`dom` on the part, plus ±0.15 noise) is
  expressed, the other carried. A part that does not fit the chosen body swaps
  with the carried allele when that one fits. Mutation: 3% expressed, 6% carried,
  1% body.
- **Identity parent.** Whichever parent supplied the expressed head (or the body
  when the child is headless). It gives the name prefix, the palette base, the
  primary type and the shiny flag. The other parent gives the name suffix, one
  colour and the secondary type. Shape from one side, colours from the other.
- **Paint** travels with the part: each slot's paint gene comes from the parent
  whose allele is expressed there (5% random permutation).
- **Palette.** c1–c3 from the identity parent with slight jitter, then one of:
  55% the other parent's primary replaces c2 or c3; 30% c1 is blended between
  the parents' primaries and one of c2/c3 comes from the other parent; 15% pure.
  Eyes from either parent.
- **Traits** blend at a random point between the parents with a little noise.
- **Types.** Primary = identity parent's primary. Secondary = the first of the
  other parent's primary, the other parent's secondary, the identity parent's
  secondary that differs from the primary; else none.
- **Stats.** Weights averaged and renormalised. `bst` = mean of parents +
  4 × min(gen, 5). Because the bonus sits on top of a mean, a line fused over
  and over converges to about 40 above its partners and never runs away.
  Vigor takes the better parent 60% of the time, else the mean.
- **Name** = identity prefix + other suffix, joined at a clean boundary
  (`naming.js`). `gen` = max + 1; `lineage` merged and deduped, most recent 16;
  `parents` = the two names.
- Fusion consumes both parents in the game (the Lab keeps them for experiments).

The report lists, per slot, which parent supplied the expressed part and whether
it mutated, where each colour came from, and where each type came from. The
Fusion Lab shows it and can breed a child five more generations against random
pool members to check that lines stay coherent.

## Battle (Phase 3 — implemented)

Pure engine in `src/battle/engine.js`: `createBattle({ sides, seed })` then
`step(state, actions) -> { state, events }`. The input state is never mutated,
every roll derives from the battle seed plus turn number, and the UI only plays
events back, so a battle is replayable from its start state and action log.

- **Battlers** come from `makeBattler(genome, level)`: classic level formula
  with vigor genes as IVs, up to four moves from the learnset at that level
  (always at least one damaging move), the genome's ability.
- **Turn.** Switches first, then moves by priority, then speed, ties random.
  Pre-move checks: flinch, sleep (1–3 turns), freeze (20% thaw, Fire moves
  thaw), paralysis (25% skip). Accuracy uses the accuracy/evasion stage table.
- **Damage.** `((2L/5+2) · P · A/D)/50 + 2`, crit 1.5 (1/24, 1/8 for high-crit
  moves), random 85–100%, affinity (+25% when the move matches one of the
  user's types, +50% with Purebred; another +25% when its damage type matches
  the user's style), chart effectiveness, the damage triangle (below), burn
  halves Melee and Ranged.
  Multi-hit, drain, recoil, fixed damage, and secondary effects are data on the
  move (`src/data/moves.js`, 157 moves, original names).
- **Status:** burn, poison, paralysis, sleep, freeze with the usual type
  immunities; status-inflicting moves also respect the move type's immunity.
  Stat stages ±6. Struggle when all PP is gone.
- **Abilities** (`src/data/abilities.js`, 30): entry (Menace), end of turn
  (Momentum), damage modifiers (Purebred, Finesse, Grit, Blubber…), immunities
  (Hover, Sponge, Capacitor, status guards), contact effects (Thorn Hide, Live
  Fur…), Stonewall, Second Wind, Swagger, Lucky Streak. Implemented by id in the
  engine; the table holds names and text.
- **Phases:** `choose` → `replace` (a side whose active fainted sends in the
  next one for free) → `over`. `legalActions(state, side)` is the single source
  of truth for what a side may do, and `step` rejects anything else.
- **Learnsets.** Species carry level-up lists; a fusion's learnset is both
  parents' moves filtered to the child's types (Normal always allowed), capped
  at twelve. Abilities pass from the identity parent 60% of the time.
- **AI** (`ai.js`): scores each legal action — expected damage as a fraction of
  the foe's HP, knockout bonus, secondary effects, status value, boosts when
  healthy, heals when low, switching when badly matched. A little noise.
- **Simulator** (`sim.js`, `node scripts/sim.mjs`): AI vs AI tournaments with
  per-species and per-type win rates. Baseline at 200 games, level 50, 3v3:
  about 7 turns per battle, no timeouts, win rates from 34% (Pufflet) to 65%
  (Moltrix). Tuning happens in the polish phase.

The battle screen (`ui/battle.js`) is portrait: foe panel and creature on top,
yours below, a four-line log, a 2×2 move grid with type, PP and an
effectiveness marker, party sheet for switching, Fast and Auto toggles, and a
result card with rematch. Events play with lunge, hit-shake, HP transitions
and faint animations.

## Arena and save (Phase 4 — implemented)

`src/game/run.js` holds the rules as pure functions over a `run` object;
`src/ui/arena.js` drives them and persists after every change through
`src/game/save.js`.

- **Run.** Pick one of three seeded starters at level 5, then climb floors.
  Wild level = 4 + 2 × floor, capped at 100. Every floor is one encounter,
  generated deterministically from the run seed and floor number.
- **Encounters.** Wild (one creature, capturable) by default; a trainer with
  1 + floor/3 creatures every third floor; a Warden every fifth floor whose
  leader is a gen-2 fusion three levels up, followed by the fusion altar. From
  floor 6, wild fusions appear with rising odds (cap 35%). Rare species get
  more common as floors climb.
- **Capture** is an in-battle action (engine `{ type: 'capture' }`, wild only).
  Odds shown on the button: `0.08 + 0.72 × hpFactor × tier × status`, where
  hpFactor runs from 1/3 at full HP to 1 at none, tier is 1 / 0.7 / 0.45 for
  common / uncommon / rare (fusions × 0.7), status × 1.5 (sleep, freeze × 2),
  capped at 95%. Three shake checks at the cube root of the odds. A capture
  costs the turn; success ends the battle as a win.
- **XP and levels.** `xpForLevel(L) = L³`. Each defeated or caught foe gives
  `5.5 × L² × bst/400` (× 1.5 for wardens) to every party member, tuned so a
  floor is worth about two levels and the party keeps pace with the curve.
  Levelling raises current HP by the max-HP gain. Movesets follow the learnset
  automatically.
- **Between floors** everyone recovers 40% HP and shakes off sleep and freeze;
  other statuses stick until the altar, which heals fully.
- **Party and box.** Five in the party, overflow in the box, swap freely
  between floors, choose the lead. A fainted lead is rotated out
  automatically. A run ends when the whole party faints in one battle.
- **Altar.** After each warden: fuse any two of your creatures (party or box).
  Both are consumed; the child takes the higher level. Preview before you
  commit; the child also lands in the Fusion Lab pool.
- **Save.** One localStorage key, versioned, normalised on load so junk cannot
  brick it. Holds best floor, totals, the collection (species deduped, fusions
  by name and seed, capped at 200) and the run in progress. Battles themselves
  are not persisted: a reload mid-fight returns you to the floor. Export and
  import as a `CCSAVE1.` code. Ending a run retires the team into the
  collection, where any creature can be inspected or sent to the Fusion Lab.

The fight view is a reusable component (`ui/fight.js`) shared by the Arena and
the sandbox Battle tab.

## Classes and fusion locks (implemented)

Every species belongs to a **class** (`clade` in code): Mammal, Reptile, Fish,
Bird, Insect, Invertebrate or Amphibian. Types stay elemental and independent.

- **Fusion is same-class only.** `canFuse(a, b)` is the single rule; `fuse()`
  throws otherwise. The Fusion Lab and the altar grey out incompatible partners
  and say why. Wild fusions and Warden leaders are built inside one class.
- **Linked slots** keep each class's silhouette coherent: the second slot of a
  pair inherits from whichever parent supplied the first. Mammals and
  amphibians link legs and arms, reptiles back and tail, fish body and tail,
  birds wings and tail, insects wings and back, invertebrates arms and legs.
- **Biomes.** Each Warden stretch of five floors has a biome (Meadow, Marsh,
  Cavern, Reef, Canopy, Dunes, Peaks) whose two or three classes are four
  times as common, so a party finds fusion partners. Biomes are the seed of the
  overworld's regions.
- Each class has its own skeleton (rig) and slot list; see the next section.
  Creatures on different rigs never fuse.

## Class skeletons and the art rebuild (done)

The generic vector library looked amateurish, so the library was rebuilt
one class at a time to a higher bar: each class on its own rig, with seven
detailed parts in every one of its slots, and enough species to use them.

**House style.** Three-quarter view facing right. A big cranium with both
eyes visible (the far eye smaller), a short muzzle projecting right with the
nose at its tip. Bold outline (4 units, rounded joins), thin interior lines,
one shadow wash on the underside and one highlight on the top of every part,
far-side copies a shade darker. Fur tufts are sparse and soft. Colour roles are
used consistently so palettes travel: `p` coat, `s` underside, muzzle, inner
ear and tail tip, `a` accents (socks, ear tips, nose leather, markings).

**Fantasy over field guide.** The anatomy stays readable but no part should
pass for a real animal's. Every head carries a sigil in the accent colour
(`src/data/parts/_sigils.js`: flame, crescent, diamond, star, sparkle, bolt,
heart, spiral, ring); ears are tufted, curled, ringed or leaves; noses are
accent hearts and triangles, the heavy kinds carry tusks or twin fangs; every
tail ends in something an animal's would not (a flame-cut brush, a curled
tuft, a leaf, a floating sparkle, a banner stripe, an orb); horn, antler,
feather and fin tips glow in the accent; body markings are bold and stylised
(claw stripes, ringed spots, flame-hemmed saddles, swirls, jagged bands)
rather than naturalistic; insect and invertebrate bodies carry glowing
segment lights and gem plates. Heads and eyes render a little larger than
life. Species palettes avoid field-guide colours where the type allows, and
each species expresses at least one accessory slot (mane, horns, back, crest,
shell...) rather than carrying it silently.

**Mammal rig** (done). Slots: body, head, ears, eyes, muzzle, legsFront,
legsBack, tail, mane, horns, back, markings. Linked in fusion: the two leg
slots, and head with muzzle. Body sockets: `head`, `shoulder`/`shoulderFar`,
`hip`/`hipFar`, `tail`, `mane`, `back`; head sockets: `ear`/`earFar`,
`eye`/`eyeFar`, `muzzle`, `horns`. Body kinds `mammal.quad` and
`mammal.biped` (upright: forelegs hang as arms). Seven archetypes supply the
anatomical slots: fox, cat, bear (biped), rabbit, deer, wolf, mouse (biped);
eyes: round, almond, slit, bead, doe, sleepy, fierce; manes add a lion mane;
horns: antlers, ram, goat, bull, spiral, nubs, crest; back: bat wings,
feathered wings, ridge fur, quills, saddle mane, flame crest, crystals;
markings: belly, saddle, stripes, spots, rings, chest star, patches. Twelve
mammal species use them, including the new Howlune (wolf, Psychic) and
Solmane (lion, Fire/Normal).

**Reptile rig** (done). Slots: body, head, eyes, jaw, crest, legsFront,
legsBack, tail, back, wings, throat, scales. Linked: the two leg slots, head
with jaw. Body kinds `reptile.quad`, `reptile.biped` and `reptile.serpent`
(no leg sockets: a serpent body declares them `null` and the legs are simply
not drawn, though the genes stay and resurface on a legged child). Both wings
draw behind the torso. Archetypes: lizard, croc, turtle (the shell is the
body), dragon (biped), serpent (coil with a rising neck), chameleon, raptor
(biped); eyes: round, slit, turret, fierce, hooded, bead, gem; jaws: grin,
fangs, beak, forked tongue, tusks, smirk, underbite; crests: frill, horns,
head fin, casque, plume, antlers, spikes; backs: spines, sail, plates, scute
ridge, dorsal fin, crystals, feather ridge; wings: dragon, feathered, fin,
leaf, crystal, flame, tattered; throats: dewlap, pouch, neck frill, beard,
plates, feather ruff, collar; scales: belly plates, bands, spots, diamonds,
scutes, hex plates, dark back. Nine species: Craggon, Drakelet, Boltmaw and
Tidalisk rebuilt, plus Skinkit (Normal), Tortoak (Grass/Ground), Chamelune
(Psychic), Venomba (Poison) and Raptrix (Dark), which also gives the class its
first commons.

Wild rolls and fusions only permute paint on a rig's `swappable` slots
(accessories: crests, tails, manes, wings...), never on legs or heads, so a
random colour swap reads as a marking rather than a mistake.

**Fish rig** (done). Slots: body, eyes, mouth, dorsal, pectoral, tail, belly,
gills, crest, barbels, spines, pattern. No head slot: the face sits on the
body (eye, optional far eye, mouth at the front tip). Linked: dorsal with
tail, pectoral with belly. Bodies declare `hover` and float above their
shadow. The pectoral pair is drawn far-behind / near-in-front; the spines
slot is drawn behind the body and, like patterns, is authored in the 100 × 60
frame and stretched onto the body's box (`fitBox` on the rig node), so a ring
of spikes pokes out evenly around any body. Archetypes: round, slender
(betta), torpedo (shark), big-headed (angler), ball (puffer), upright
(seahorse), ribbon (eel); eyes: round, wide, fierce, sleepy, bead, deep-sea,
glowing; mouths: pout, smile, grin, frown, sucker, gape, needle teeth; fins
in fan / pointed / flowing / paddle / spiky / tiny / wing families plus shark,
ribbon, curl and lyre shapes; gills, crests (lure, fin crown, horn...),
barbels, spines and patterns each have seven. Eight species: Finnip and
Glimmerfin rebuilt, plus Sharkid (Water/Dark), Lurelight (Water/Ghost),
Puffugu (Water/Poison), Hippodrake (Water/Dragon), Zapeel (Electric/Water)
and Koiwish (Water/Psychic).

**Bird rig** (done). Slots: body, head, eyes, beak, crest, face, wings, tail,
legs, chest, back, pattern. Linked: wings with tail, head with beak. Wings
are drawn folded along the flank (far one behind the body, near one in front,
behind the head); the tail and back features hang behind; legs are a thin
outlined stroke with toes so they stay crisp at card size. The `face` slot
carries facial discs, cheek patches, masks and brows drawn on the head under
the eyes. Archetypes: songbird, owl (stout), hawk (sleek), penguin (upright),
duck (waterfowl, with a neck), parrot (slim), peacock (elegant); beaks: short,
hooked, dagger, bill, stout, needle, parrot; crests: tuft, cockatoo, ear
tufts, halo, mohawk, crown plumes, fluff; wings: rounded, pointed, long,
flipper, stubby, broad, lacy; tails: fan, forked, long train, wedge, pintail,
fantail (with eyespots), stubby; legs: thin, talons, flat feet, webbed, stilts,
gripping, feathered; chests, backs and patterns each have seven. Eight
species: Zephyrn, Moltrix and Halowl rebuilt, plus Pengloo (Ice/Water),
Corvex (Dark/Flying), Squawkeet (Grass/Flying), Plumaura (Fairy/Flying) and
Quackle (Water/Flying).

**Insect rig** (done). Slots: body, head, eyes, mandibles, antennae, wings,
front / middle / hind legs, tail tip, shell, pattern. All three leg slots are
linked (one leg style per creature) and head with mandibles. Legs are
generated jointed sticks (coxa, knee, foot, tarsus) in seven styles per pair,
angled forward, straight or back by slot, plus a mantis' raptorial forelegs
and a grasshopper's jumping hind legs; the antennae part draws both feelers;
shells (wing cases, domes, armour, fuzz, leaf) sit on the abdomen in front of
the body; wings rise from the thorax, far one behind, near one in front.
Archetypes: beetle, bee, mantis (upright), darter (dragonfly), dome
(ladybug), segmented (ant), fuzzy (moth). Nine species: Chitterbug and
Gloamoth rebuilt, plus Scarabolt (Bug/Steel), Stingbuzz (Bug/Poison),
Mantislash (Bug/Fighting), Skimmerfly (Bug/Flying), Antlas (Bug/Ground),
Glimbug (Bug/Electric) and Dottalie (Bug/Fairy).

**Invertebrate rig** (done). Slots: body, eyes, mouth, arms, legs, shell,
tail, crown, feelers, pattern, glow, skirt. Only body and eyes are required:
everything else may be "none", which is how a wisp has no legs and a slug no
arms. Linked: arms with legs, skirt with tail. The face sits on the body;
eyes may be eyestalks rising from it. Legs are one part per side (a crab's
four, a spider's four); glows are drawn behind the body and stretched onto
its box (aura, sparkles, mist, embers, bubbles, motes, static); skirts hang
from the underside behind the body (frills, tentacles, a ghost hem, a slug's
foot fringe). Archetypes: slug, crab, bell (jelly), mantle (octopus), wisp,
scorpion, spider; a snail is a slug with a spiral shell. Eight species:
Slugmire, Mystril, Phantoom, Voltcrab and Nightstalk rebuilt, plus Inkurl
(Water), Silkspin (Dark) and Shellwick (Rock/Water).

**Amphibian rig** (done). Slots: body, head, eyes, mouth, gills, front legs,
hind legs, tail, throat, crest, back, pattern. Linked: front with hind legs,
head with mouth. Squat bodies carry the head high at the front; the hind legs
fold under the haunches and each pair is drawn far-behind / near-in-front as
on the mammal rig. Gills, crest and throat hang off the head (gills behind
the eyes, the vocal sac under the chin); tails and back features sit behind
the body. Archetypes: frog, toad (warty), tree frog (long limbs, sticky toe
pads), axolotl (external gills, fin tail), newt (slender, tapered tail),
salamander (sturdy), polliwog (a round tadpole on nub legs). Eyes: bulging,
big, heavy-lidded, slotted gold, bead, wide, glowing; mouths: wide smile,
grin, frown, tongue, gape, smirk, pout; gills: frills, feathery, stubs,
plumes, fan, spiky, leafy; throats: vocal sac, double sac, bubble, dewlap,
glowing sac, striped, frilled; crests: sprout, leaf pair, head fin, brow
horns, mushroom cap, moss tuft, spikes; backs: warts, moss, crest ridge,
spikes, mushrooms, flame ridge, boulder; tails: fin, tapered, thick, tadpole,
stub, leaf, flame; patterns seven. Eight species: Sprigget and Mossbrute
rebuilt, plus Axolune (Water/Fairy), Newtorch (Fire), Toadstool (Poison),
Mudpup (Ground/Water), Wigglet (Water) and Leapfern (Grass/Water).

All seven classes are now on rigs, so the legacy skeleton and its parts are
retired: every species carries a `rig`, and the part registry, renderer and
mannequins only know the seven class rigs.

## Damage types and the triangle

Every attack is **Melee**, **Ranged** or **Magic** (`src/data/damage.js`), and
each has its own pair of stats: Melee Atk against Melee Def, Ranged Atk
against Ranged Def, Magic Atk against Magic Def. With HP and Speed that is
eight stats; species weights sum to 1 as before. A creature's **style** is the
damage type of its highest attack stat (`combatStyle`), shown as a chip on
cards, sheets and in the fight. The triangle is Magic > Ranged > Melee >
Magic: a hit whose type beats the target's style does 1.25×, a hit the
target's style beats does 0.8× (`triangleMul`). Style also pays on offence:
a move whose damage type matches the user's own style earns +25%, on top of
the +25% for matching one of its types (`affinityBonus`), so a Magic-style
Fairy using a Magic Fairy move hits for +50%. The move card shows the bonus. Burn halves Melee and Ranged
damage; Grit and Quake Core follow the same split. Stat-changing moves that
used to touch Attack or Defense now touch both Melee and Ranged (Attack and
Defense were the old "physical" pair); Sp. Atk and Sp. Def became Magic Atk
and Magic Def.

The fight screen tints each move card with its type colour and replaces the
old arrows with words: "Super effective", "Not very effective" or "No effect"
from the type chart, and "Strong vs Magic" / "Weak vs Ranged" from the
triangle against the foe's style. The card also names the move's damage type
and power.

Species styles were assigned by hand from each creature's concept (a bull is
Melee, a spitting slug Ranged, a jellyfish Magic), then the species weights
were derived from the old six with the style taking half of the attack pool
and the rest split 30/20, old Defense feeding Melee Def (two thirds) and
Ranged Def, old Sp. Def feeding Magic Def (two thirds) and Ranged Def. Forty
moves were added so every type offers Melee, Ranged and Magic attacks at low,
mid and high power, and learnsets were patched so every species has an
on-style attack before level 23, between 23 and 40, and after 40 (a test
guards both facts). The distribution is 25 Melee, 16 Ranged, 21 Magic.

Creatures saved with the old six stats are migrated on load
(`migrateStatWeights`, `migrateVigor`): the old attack pools are split three
ways with the species' style taking half, old Defense feeds Melee Def and
Ranged Def, old Sp. Def feeds Magic Def and Ranged Def.

## Elementals

One capturable wild creature in a thousand (`ARENA.elementalChance`, rolled in
`encounterFor` for the plain wild encounter) is born of an element. The eight
elements live in `src/data/elements.js`: Fire, Water, Storm, Frost, Bloom,
Shadow, Light and Earth, each with a core ability and one SVG filter.

- **Genome.** `g.aura` maps slot → element id. A wild Elemental carries its
  element on every slot (`makeElemental`), and `elementalOf(g)` reports the
  dominant element with the share of slots that carry it (`pure` when all do).
  `validateGenome` keeps only known slots and elements, so codes round-trip.
- **Render.** Each element is exactly one animated `<filter>` (turbulence
  displacement, glows, flicker, sparkle grain, smoke, halo, grit and rumble).
  Parts with an aura are wrapped in `filter="url(#…-fx-<element>)"`; when
  every drawn slot shares one element the whole creature gets a single filter
  instead, which is what a wild Elemental costs to draw. Static renders and
  `prefers-reduced-motion` (`setReducedMotion`) get the same look frozen.
- **Fusion.** The aura travels with the part that was expressed, so a child
  keeps the element on exactly the slots it inherited from the Elemental
  parent; a mutated part is born plain. Core abilities pass with
  `FUSE.elementalAbility` (50%) per Elemental parent; otherwise the usual
  draw between the parents' ordinary abilities. Descendants show as
  "Fire-touched" with the share of elemental slots.
- **Battle.** Every core ability boosts its element's move types 1.3× and adds
  a passive: Inferno (burn immunity, contact burns), Tide (heals a sixteenth
  each turn), Storm (paralysis immunity, Speed on entry), Frost (freeze
  immunity, contact chills Speed), Verdant (poison immunity, absorbs Grass),
  Umbral (lowers the foe's Magic Atk on entry), Radiant (immune to Dark), Quake
  (Melee hits do three quarters).
- **UI.** The encounter card announces "Fire Elemental!" with the element's
  glow, cards and sheets carry a "◆ Fire Elemental" badge, and the Lab sheet
  has a preview selector so any creature can be seen as any Elemental
  without changing it. `node scripts/elementals.mjs` renders one creature per
  element plus fused descendants; `scripts/hero.mjs fox+elemental=fire`
  previews one.

## Evolution

Every species evolves twice, by level alone: stage 2 at level 33 and stage 3
at level 66 (`STAGE_LEVELS` in `src/data/evolution.js`). Nothing is stored on
the genome or the save: `stageOf(level)` decides, so a code shared from the
Lab is the same creature at any level and old saves pick up their stages the
moment they load. Stats are untouched: evolution is a look; the level curve
already carries the power.

- **Render.** `renderCreatureSvg(g, { level })` (or `{ stage }`) resolves the
  parts through `evolvedPart(part, stage)` (`src/creature/evolve.js`) and
  scales the whole creature by `STAGE_SIZE` (1 / 1.1 / 1.22). Bounds are
  cached per `boundsKey`, so evolved parts never reuse their base boxes.
- **Hand-authored art.** A part spec takes `stages: { 2: {...}, 3: {...} }`.
  Each stage overrides any drawing key of the base (`shapes`, `extra`,
  `sockets`, ...) or uses the deltas: `addBehind` / `addShapes` (extra
  silhouette shapes behind or on top of the originals, joining the clip),
  `add` (detail prims), `grow: [sx, sy]` (scales the compiled art about the
  origin, compounding across stages), `spikes` (runs the procedural tip pass
  on the result) and `reset` (stage 3 starts from the base instead of from
  stage 2). The builders compile these into `part.stages[stage]`. Shared
  shape helpers live in `src/data/parts/_evo.js`: `evoFan` (tuft fans that
  poke out from behind a shape), `evoGem`, `evoRing`, `evoGlow`, `evoBands`
  and `evoLegStages` (claws at stage 2, longer claws and armour bands at 3;
  hoof bands and fetlock tufts for hoofed legs).
- **Procedural fallback.** Any part without a hand stage grows by its slot
  family's factors (`SLOT_GROWTH`: bodies and heads a little; ears, tails,
  wings, fins and fur a lot) and, for the protruding families, lengthens its
  tips: the outline points locally farthest from their shape's centre get a
  spike in the shape's own colour, drawn behind it so it reads as the tip
  growing longer; stage 3 spikes carry an accent "energy" tip. This keeps
  every species complete while the hand batches land.
- **The art language.** Stage 2 is "more pronounced": the defining feature
  gains one extra element (a second flame lick, ear tufts, a fourth stripe,
  claws, a darker ruff layered behind the mane). Stage 3 is "exaggerated":
  the feature dominates (a forked tail, a crown of tufts, a sunburst mane,
  gems and glows, armour bands, a second wing membrane). Hand batches so far:
  mammals, reptiles and amphibians (254 parts).
- **UI.** Cards and sheets show a II / III chip (`stageBadge`), sprites in the
  arena, fights and battle setup draw at their level, level-up reports and the
  fight log announce evolutions, and the Lab sheet has Stage 1 / 2 / 3
  buttons to preview any creature at any stage. `node scripts/evolutions.mjs
  <rig>` renders every species of a class at all three stages;
  `scripts/hero.mjs fox+stage=3` previews one.

## Polish and balance (Phase 5 — implemented)

Balance was done with the two simulators, not by feel:

- `node scripts/sim-run.mjs` plays whole arena runs with the AI on the
  player's side (capturing at decent odds, fusing the two weakest at altars).
  The first study had a median run of floor 2 and a third of runs dying on the
  first Warden. The causes were early learnsets full of 40-power moves against
  fused bosses that inherit the best early moves of two parents, plus a party
  arriving at the Warden half-healed. Fixes: every species learnset now follows
  one curve (a real STAB move by level 6, four moves by 11, coverage in the
  20s and 30s, nukes in the 50s); starters at level 8 with wild level
  3 + 2 × floor; trainers and Wardens grow one floor later and Wardens fight
  at floor level with a full rest before them; 50% recovery and a status cure
  between floors; no rares before floor 4; XP constant raised so low levels
  keep pace. Result: median run floor 8, a quarter past floor 39, Warden win
  rate above 90%.
- `node scripts/sim.mjs` tournaments (800–1200 games, level 50, 3v3) gave a
  species spread of roughly 36%–67%. Extremes were compressed with base stat
  totals and a few stat weights; Grass and Bug species remain at the bottom
  because the type chart resists them widely, which is faithful to the source
  material. HP gets a global 1.15× lift so battles last about eight turns.
- Move learning: members keep their own four moves. Levelling into a new move
  fills an empty slot or queues a prompt on the floor screen asking which move
  to replace, with a skip.
- Sound: procedural WebAudio effects for hits (louder when super effective),
  misses, heals, statuses, stat changes, faints, captures, wins and losses, and
  a per-creature cry shaped by size and primary type. Toggle in the header,
  remembered per browser.
- Library growth: 28 species (six new dual types) and 130 parts.

## Later

More parts and species, trainer personalities, items, weather, a Fusiondex
with discovery tracking, and then the overworld: tile map, movement,
encounters, NPC dialogue, story beats. Single-file distribution stays.
