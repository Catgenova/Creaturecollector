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
| Game frame | The overworld: a seeded map with eighteen class biomes, trainers, Wardens and the Council. It started as an endless arena, which was removed once the overworld shipped; the capture, XP, party and collection systems carried over. |
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
src/data/parts/       the part library: one folder per class (eighteen, mammal/ through spirit/),
                      shared builders (_builders.js), drawing DSL (_dsl.js), registry (index.js)
src/data/species.js   base species recipes
src/data/elements.js  Elementals: the fourteen elements, their core abilities and one SVG filter each
src/creature/         genome (schema, rolls, codes), palette, render (SVG)
src/game/             world (map generation and content), journey (rules), party (members, xp), save
src/ui/               dom helpers, the overworld screen, the creature sheet, the fight view, app shell (main.js = build entry)
tests/                node:test suites
scripts/              screenshot helpers for visual review (Playwright, dev only):
                      shot.mjs (app flow through the overworld), board.mjs <rig> + shot-board.mjs (library board), hero.mjs (close-ups)
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

**Proportion.** Species are drawn with heads sized for their bodies, but a
fusion or a wild mutant can pair a wide head with a slight body. When the head
and body were not designed together (`headFitScale` in `render.js`), the head
socket gets an extra scale that pulls the head's width part of the way toward
the proportion the body's own species were drawn with (the mean over species
built on that body, else over the class): the ratio is clamped to 0.78–1.25 and
eased with an exponent of 0.6, so a wolf head on a rabbit shrinks about a tenth
and a turtle head on a raptor grows about a seventh. Species wearing their own
head and mannequins (review boards) are left alone.

**Accent contrast.** `harmonizePalette` (`palette.js`) measures the three colours
in CIE Lab and, when the accent sits within ΔE 30 of the primary or ΔE 24 of the
secondary, moves the accent by the smallest perceptual step (over hue, lightness
and saturation adjustments) that clears both. It runs on every wild roll, every
fusion and every load, is idempotent, and leaves compliant palettes untouched,
so accents always read as accents without redrawing any species.

Colour roles: `p/pd/pl`, `s/sd/sl`, `a/ad/al`, `w/wd`, `e/ed`, `k`. The root SVG
sets `--c1..--c3` (+ shade/highlight), `--e`, `--ol`, `--w`; each slot group
remaps `p/s/a` onto those through its paint gene; far-side copies remap onto the
shade variants. Outlines come from one CSS rule (`.cr .o`) with
`paint-order: stroke` for the sticker look. Shading is part data: translucent
outline-colour washes (`SH`) and white washes (`HL`) clipped to the part's own
silhouette, so they survive any recolour.

**One light.** Every creature is lit from the upper left: highlight washes
(`HL`) sit on upper-left faces and shade washes (`SH`) on lower-right ones, the
styled renderers' gradients run light top-left to dark bottom-right and their
rims put the light edge top-left. A data test scores each translucent path wash
by its position in the part's box and fails when a highlight drifts lower-right
or a shade upper-left. Dots and eyespots drawn in the same roles are pattern,
not lighting, and are exempt.

**Level of detail.** Below about half a pixel per creature unit (`LOD.minPx`:
party rows, collection grids) hairline strokes (width ≤ 1.2), dots
(radius < 1.8), tiny unstroked marks and faint clipped washes (opacity ≤ 0.14)
only blur the fill and cost clip paths, so `renderCreatureSvg` drops them;
`isFinePrim` tags them once per part. Eyes are never thinned, and the styled
rims are skipped too. `opts.detail: 'full' | 'low'` overrides the size rule.

**Grounding.** The ground shadow is an ellipse half the body's width (clamped
14–60), one fifth as tall, centred under the body box and shifted a little to
the right so it agrees with the light; a hovering body gets a smaller, lighter
shadow pushed further right. Standing feet (the rig's `ground` slots whose
lowest point reaches the floor) each get a small contact shadow on the ground
line, drawn outside the idle-bob group so the body lifts off them; a near and
a far foot that stand together share one. Small renders skip contact shadows.

**Poses** (`src/data/poses.js`). A pose is a per-rig table of per-slot socket
deltas: `dx`/`dy` move a part on its parent's socket, `da` turns it (degrees,
clockwise), `ds` scales it, and `far` overrides the far-side copy so a near and
a far leg can swing apart. The body is the root, so its delta tilts the whole
creature, and the feet still find the floor because the renderer measures the
posed parts. Six poses per class: `stand` (neutral, what mannequins use), the
three idle stances `brace` (melee: forward, head low), `crouch` (ranged: low,
tail up) and `poise` (magic: upright, head high), chosen by the creature's
combat style, and the two action poses `attack` (lunge: legs swung, jaws and
wings open) and `hurt` (recoil: thrown back, ears flat) that the fight view
flashes on the mover and the target for the length of the hit animation.
`opts.pose` overrides; the default is the idle pose.

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
per seed; the shrine seeds it from the journey, its fusion count and both parents.

- **Parts.** Per slot the child draws one allele from each parent at random. The
  allele with the higher dominance (`dom` on the part, plus ±0.15 noise) is
  expressed, the other carried. A part that does not fit the chosen body swaps
  with the carried allele when that one fits. Mutation: 3% expressed, 6% carried,
  1% body.
- **Identity parent.** Whichever parent supplied the expressed head (or the body
  when the child is headless). It gives the name prefix, the accent and eye
  colours, the primary type and the shiny flag. The other parent gives the name
  suffix and the secondary type.
- **Dominant parent.** Whichever parent supplied more of the expressed parts
  (the identity parent on a tie). It sets the base colours, so a child's coat
  matches the parts it mostly wears. `report.dominant` names it.
- **Paint** travels with the part: each slot's paint gene comes from the parent
  whose allele is expressed there (5% random permutation).
- **Palette.** c1 and c2 are the dominant parent's, each pulled part of the way
  toward the other parent's (`FUSE.paletteBlend`: 10–35% for the primary, 20–60%
  for the secondary) with slight jitter; the report calls a colour a blend above
  30%. c3 and the eyes come from the identity parent, so the head keeps the trim
  it was drawn with. The result then goes through `harmonizePalette` (below).
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
- Fusion consumes both parents.

The report lists, per slot, which parent supplied the expressed part and whether
it mutated, where each colour came from, and where each type came from. The
shrine shows a preview built from it. During development a Fusion Lab tab bred
children five more generations against random pool members to check that lines
stay coherent; the fusion tests still do.

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
  move (`src/data/moves.js`, 326 moves, original names, 129 of them signatures).
- **Status:** burn, poison, paralysis, sleep, freeze with the usual type
  immunities; status-inflicting moves also respect the move type's immunity.
  Stat stages ±6. Struggle when all PP is gone. PP is not authored but derived
  (`ppFor`, `PP_RULE` in `src/data/moves.js`): damaging moves start from a band
  by power (35 up to 40, 30 to 50, 25 to 60, 20 to 70, 15 to 90, 10 to 100, 5
  above; multi-hit moves count three hits) and drop one band per strong extra
  (a status at 30%+, two bands when guaranteed; a flinch at 30%+; a likely foe
  debuff or self buff; draining; each point of positive priority). Status
  moves: sleep or freeze 10, other major statuses 15, heals 10, sharp stat
  changes (±2, three stats, accuracy or evasion) 20, ordinary ones 30.
- **Abilities** (`src/data/abilities.js`, 42 plus the fourteen Elemental cores):
  entry (Menace, Quick Start), end of turn (Momentum, Regrowth), damage
  modifiers (Purebred, Finesse, Grit, Blubber, the eight type Hearts that
  surge at a third HP, Iron Hide / Bulwark / Mirror Scale that take three
  quarters from one damage type, Keen Edge for double crits), immunities
  (Hover, Sponge, Capacitor, status guards, Steady against the foe's stat
  drops), contact effects (Thorn Hide, Live Fur…), Stonewall, Second Wind,
  Swagger, Lucky Streak. Implemented by id in the engine; the table holds
  names and text.
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

The fight view (`ui/fight.js`) is portrait: foe panel and creature on top,
yours below, a four-line log, then move cards with type, damage type, power,
PP, accuracy, every side effect with its odds (`moveEffects`: "30% burn", "+1
own Speed", "hits 2–5×", "priority +1") and effectiveness words, plus Party,
Info, Items, capture, Fast and Auto. Each panel names the creature's passive
skill with its description under the type chips. Info opens the creature
sheet, which leads with the passive skill card, then the moves it knows (the same
details) and a Learns by level list: every move on its learnset with the
level, the known ones marked, the next one ahead flagged. It plays
the engine's events back with sprite poses and sound, and is mounted by the
overworld for every wild, trainer, Warden and Council fight.

## Capture, XP and save

These began as the endless arena's rules and are now the overworld's, shared
through `src/game/party.js` and `src/game/save.js`.

- **Capture** is an in-battle action (engine `{ type: 'capture' }`, wild only).
  Odds shown on the button: `0.08 + 0.72 × hpFactor × tier × status`, where
  hpFactor runs from 1/3 at full HP to 1 at none, tier is 1 / 0.7 / 0.45 for
  common / uncommon / rare (fusions × 0.7), status × 1.5 (sleep, freeze × 2),
  then × a level factor: 1 + 0.05 per level your strongest party member
  (fainted or not) stands above the target, or below it, clamped between 0.2
  and 2, so a Lv 30 best against a Lv 32 wild is × 0.9 and against a Lv 25 is
  × 1.25. Capped at 95% and floored at 3%. Three shake checks at the cube root
  of the odds. A capture costs the turn; success ends the battle as a win. The
  button shows the odds with the level factor beside them, and the encounter
  card says it in words.
- **XP and levels.** Pokémon Red's pace. `xpForLevel(L) = L³` (the
  medium-fast group). A defeated or caught foe yields `bst × 0.15 × stage × L
  / 7` (`XP` in `party.js`; stage 1 / 1.6 / 2.4 for its evolution stage, so a
  400-total creature yields about 60 like an early-route wild), half again
  when it belonged to a trainer, a Warden, the Council or was an alpha. The
  reward is shared equally by the party members that fought and are still
  standing (the engine flags `fought` on every creature sent out); each
  standing creature that sat out is granted half of a fighter's share
  (`XP.benchShare`); fainted creatures get nothing. Levelling raises current HP by the
  max-HP gain. Members keep their own four moves: levelling into a new one
  fills an empty slot or queues a prompt asking which move to replace, with a
  skip.
- **Party and box.** Five in the party, overflow in the box, swap freely on
  the map, choose the lead. A fainted lead is rotated out automatically.
- **Save.** One localStorage key, versioned, normalised on load so junk cannot
  brick it. Holds totals (battles, captures, fusions, journeys, champions),
  the collection (species deduped, fusions by name and seed, capped at 200),
  the journey in progress and settings. Battles themselves are not persisted:
  a reload mid-fight returns you to the encounter card. Export and import as a
  `CCSAVE1.` code. Abandoning a journey retires the team into the collection,
  where any creature can be inspected. A save from
  the arena days folds its run's creatures into the collection on load.

The fight view is a reusable component (`ui/fight.js`) mounted by the overworld.

## Classes and fusion locks (implemented)

Every species belongs to a **class** (`clade` in code): Mammal, Reptile, Fish,
Bird, Insect, Invertebrate, Amphibian, Flora, Ooze, Fungus, Wyrm, Draconic,
Skeletal, Nightwing, Crystalline, Myriapod, Fiend or Spirit. Types stay
elemental and independent.

- **Fusion is same-class only.** `canFuse(a, b)` is the single rule; `fuse()`
  throws otherwise. The shrine greys out incompatible partners
  and say why. Wild fusions and Warden leaders are built inside one class.
- **Linked slots** keep each class's silhouette coherent: the second slot of a
  pair inherits from whichever parent supplied the first. Mammals and
  amphibians link legs and arms, reptiles back and tail, fish body and tail,
  birds wings and tail, insects wings and back, invertebrates arms and legs;
  the later classes follow the same idea (skeletals and crystallines fore and
  hind legs, nightwings wings and thumbs, myriapods head and mandibles, fiends
  arms and legs, spirits hood and mask).
- **Biomes.** The overworld gives each class its own biome, so fusion partners of one class are found together (see Overworld).

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

All classes are on rigs, so the legacy skeleton and its parts are
retired: every species carries a `rig`, and the part registry, renderer and
mannequins only know the class rigs.

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

One wild creature in a thousand (`WILD_ELEMENTAL.chance` in `world.js`, rolled in
`wildSpawn`) is born of an element; the encounter card and the fight view
announce it.

- **Genome.** `g.aura` maps slot → element id. A wild Elemental carries its
  element on every slot (`makeElemental`), and `elementalOf(g)` reports the
  dominant element with the share of slots that carry it (`pure` when all do).
  `validateGenome` keeps only known slots and elements, so codes round-trip.
- **Render.** Each element is exactly one animated `<filter>` (turbulence
  displacement, glows, flicker, sparkle grain, smoke, halo, grit and rumble;
  the six later elements add rust mottling with falling flakes, a heartbeat
  swell, a slow inverting swirl, an orbiting crescent, posterised facets with
  travelling glints, and edges that erode and re-form).
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
  (Melee hits do three quarters), Corrosion (contact lowers the attacker's
  Melee Def), Vital (contact moves heal a quarter of their damage), Void
  (Ranged hits do half), Lunar (sleep immunity, Magic Def on entry), Resonant
  (Magic hits reflect a quarter of their damage) and Mist (one attack in five
  misses). The roll favours an element that shares a type with the species
  two times in three.
- **UI.** The encounter card announces "Fire Elemental!" with the element's
  glow, cards and sheets carry a "◆ Fire Elemental" badge, and the creature sheet
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
  growing longer; stage 3 spikes carry an accent "energy" tip. It stays as the
  safety net for any part added later without stages.
- **Class tells at stage 3.** Heads (and the head-like bodies of fish and
  invertebrates) no longer share one crown of tufts. Each class grows its own
  signature from helpers in `_evo.js`: mammals a two-layer fur ruff behind
  the skull (`evoRuff`), reptiles three horns swept back from the crown and
  angular brow plates (`evoHorn`, `evoBrowPlate`), birds a train of plumes
  with accent tips (`evoPlumes`, `evoPlumeTips`), insects a riveted armour
  plate standing behind the head (`evoPlate`, `evoRivets`), fish a row of
  bioluminescent dots along the lateral line (`evoLumen`) and invertebrates
  a translucent inner core with glowing motes (`evoTranslucent`). Amphibians
  keep their soft lobes.
- **Class patterns.** The generic pattern parts that every class shared were
  redrawn per class, keeping their ids: fish `stripes` are tiger bars,
  `spots` eyespots and `gradient` a countershade with a lateral line; birds
  `spots` are iridescent patches, `gradient` a cap and bib and `patches` wing
  bars; insects `stripes` are warning bands, `speckles` a metallic sheen and
  `gradient` chitin segments; invertebrates `spots` are chromatophore rings,
  `stripes` sucker rows and `gradient` an inner glow. Each has stage 2 and 3
  art.
- **The art language.** Stage 2 is "more pronounced": the defining feature
  gains one extra element (a second flame lick, ear tufts, a fourth stripe,
  claws, a darker ruff layered behind the mane). Stage 3 is "exaggerated":
  the feature dominates (a forked tail, the class's head signature, a sunburst mane,
  gems and glows, armour bands, a second wing membrane). Every part of
  all eighteen classes has hand-authored stages (1,514 drawn parts).
- **UI.** Cards and sheets show a II / III chip (`stageBadge`), sprites in the
  overworld, fights and battle setup draw at their level, level-up reports and the
  fight log announce evolutions, and the creature sheet has Stage 1 / 2 / 3
  buttons to preview any creature at any stage. `node scripts/evolutions.mjs
  <rig>` renders every species of a class at all three stages;
  `scripts/hero.mjs fox+stage=3` previews one.

## Overworld (implemented)

The main mode. `src/game/world.js` generates one large map from a seed and
`src/game/journey.js` holds the player's state and rules; `src/ui/world.js`
draws it on a canvas and hands fights to the shared fight view. It replaced
the endless arena; a save that still holds an arena run folds its creatures
into the collection on load.

- **Map.** 224 × 192 tiles (four times the original 112 × 96; `WORLD`, whose
  `version` resets saved positions to the Crossroads when the layout changes):
  grass, habitat, path, wall, water, hub, lair, door, camp, spire, spire door,
  shrine, market, storage (`TILE`). The Crossroads hub sits in the middle (a
  disc of paving with a camp, the fusion shrine, the Market, the Storage, the
  Battle Tower and the Council Spire's door). Biome centres sit on a ring of radius 58 around
  it with lairs at 84, clockwise from the south, one per class in difficulty
  order (`BIOME_ORDER`, with `REGIONS` giving the wild level at the lair:
  Heather Downs 5, Sodden Fen 10, Bramble Wilds 14, Hum Meadow 18, Echo Chasm
  20, Sporewood 23, Windward Crags 27, Prism Caverns 29, Slurry Sump 32, Glass
  Lagoon 36, Rootbound Warren 38, Coiling Gorge 41, Murk Hollow 45, Barrow
  Downs 47, Ember Scar 50, Brimstone Sinks 52, Drakefell Peaks 55, Vigil Marsh
  58). Six trainers stand on each biome's roads. Each biome is a wedge around
  the hub: a tile belongs to the class whose ring angle is nearest its own,
  measured in a space where the map is square so every wedge covers an equal
  share of the wide map, and from the unjittered ring angle so the wedges stay
  even however many classes share the ring. The tile coordinates are jittered
  by value noise that grows with distance from the hub, so borders wander out
  in the wild but stay crisp near town, and the gentlest region always begins
  straight south of the Crossroads. Terrain is value noise per biome: water
  (more in the fen and lagoon), walls drawn as that region's trees, reeds,
  hedges, pines, palms, rocks, bones, crystals, roots, embers or gravestones,
  and habitat patches. Roads are carved in two
  bent legs from the hub to each camp, on to each lair, and around the ring;
  a final pass carves straight roads to anything still unreachable, so every
  camp, lair door, the spire and the shrine are always walkable from the start.
- **Habitats and spawns.** A habitat patch carries one element type, chosen
  per 6 × 6 cell from the types of the biome's class weighted by the square of
  how many of its species have them (two per primary type, one per secondary,
  then squared), so a class's signature elements own most of its patches and a
  lone oddball species makes a rare pocket rather than a third of the region. `wildSpawn` weights every wild species by affinity
  (3 for the home class, 4 for the patch's type, 10 for both; strangers 0.03)
  times tier rarity (common 1, uncommon 0.45, rare 0.12), so stronger species
  are rarer; `spawnTable` then scales the visitors so the home class always
  holds 72% of the table (`WORLD.homeSpawnShare`) however many same-element
  species the other classes add.
  Level: the local level ±2, where `levelAt` starts every biome at level 1
  to 4 at the hub's edge (a tenth of the region's level, clamped) and deepens
  to the full level at its lair, so the first steps out of town meet level 1 to
  5 creatures and the deepest lairs the fifties; 14% a few levels higher and
  4% an **alpha** (worth Warden XP), both boosts scaling with the area (up to
  +6 and +14). The 1/1000 Elemental roll applies. Each
  habitat step has a 12% encounter chance, with a four-step cooldown after a
  fight; rolls are seeded by the step count so a replayed save spawns the same.
- **Trainers.** Six per biome (`WORLD.trainersPerBiome`), standing on the
  roads between the camp and the lair. Talking to one shows their line and a Fight / Not now
  choice; a beaten trainer only chats. Teams of 2–4 led by the home class
  (others 75% home), at the local level where they stand. Trainers block their tile; roads are
  two wide.
- **Wardens.** One lair per biome. The Warden's team is five of the class:
  a gen-2 fusion leader at area level +6 and four more at +3/+4. Winning earns
  the region's badge (once); rematches are free. Camps (the biome centre and
  the hub) heal fully and set the respawn point.
- **Council.** The spire opens with every badge (`JOURNEY.badgesForSpire`, one per biome): four fights back to back
  (`COUNCIL_LEVELS` 58, 62, 66, 70): Marshal Kord (melee species), Ranger
  Selene (ranged), Oracle Vesh (magic) and Champion Aurel (two gen-2 fusions
  and three rares). Only a 35% heal between fights; a loss ends the run and
  the wipe rule applies. Beating all four sets `champion`; rematches allowed.
- **Gold, Market and Bag** (`src/game/market.js`). Trainers pay gold when
  beaten: 30 per creature per level of their team's average, double for
  Wardens and the Council, a quarter on rematches, rounded to tens (a first
  biome's four trainers pay about 1,300 together; a late Warden pays over
  15,000). Wild fights pay nothing. The Market, a shop on the hub's north-east
  edge, sells every move as a single-use scroll priced by power in steps of
  1,000 (`moveCost`: 1,000 up to 40 power, 2,000 at 60, 3,000 at 70–80, 4,000
  at 85–100, 5,000 at 120, 6,000 at 130; status moves 1,000), filterable by
  type. Scrolls stack in the Bag (`journey.bag`, up to 99 each); teaching one
  to a party member adds the move or replaces a chosen one when it already
  knows four, and uses the scroll up. A creature learns only scrolls of its
  own types, plus its Elemental element's types when it is one (a Water
  creature born a Fire Elemental learns Water and Fire; `scrollTypes`,
  `canLearnScroll`), and any Normal scroll; the Market says who on the team
  can learn each scroll and can hide the rest. Every creature carries one
  passive skill (`genome.ability`, rolled from its species' pair at birth;
  Elementals take their element's core), shown with its description on the
  battle panel and at the top of the sheet, and by name in party rows. The Market also sells potions
  (`src/data/items.js`): Potion 20 HP for 300, Super Potion 60 for 700, Hyper
  Potion 150 for 1,500, Max Potion full for 2,500, Full Restore full plus any
  status cured for 3,000. A potion works on a standing party member from the
  Bag or in battle, where it is an action with switch priority: it heals the
  chosen member, active or benched, is used up, and costs the turn
  (`createBattle({ items })`, `legalActions` lists one `{ type: 'item', id,
  index }` per stocked potion and member it would help; the foe's AI never
  uses items). Nothing revives a fainted creature; camps do that. Potions
  spent in a fight leave the bag whether you win, lose or flee. Gold and the
  bag are saved and normalised with the journey.
- **Creature Storage.** The Market's twin on the hub's north-west edge holds
  the box. Deposit and withdraw happen only there (the Party sheet elsewhere
  reorders and inspects); a capture with a full party goes straight to
  storage, and scrolls teach party members only. Release (Party or Storage
  sheet, or the Release button in the head of the creature's own Info sheet;
  two taps, the button arms in place) lets a creature go for good; the party always keeps at least one,
  and released creatures remain in the collection. The Info head also offers
  Rename (a nickname of up to 16 characters, stored as the genome's name) and
  Lock: a locked creature cannot be released or fused at the shrine
  (`member.locked`, kept by the save). Sheet re-renders keep the scroll
  position (`owKeepScroll`). Arrows at the top of the sheet, and the left and
  right keys, cycle through the list it was opened from (`sheetOpts.nav`):
  the party, party and storage together, the collection, the three starters,
  or in a fight your own or the opposing party, each creature drawn with its
  own actions; the map ignores keys while any sheet is open.
- **Battle Tower** (`src/game/tower.js`). A keep on the hub's south-west edge
  with six floors, each a trainer who fights six on six with random creatures at
  a level the player picks from 50, 60, 70, 80, 90 or 100 (`TOWER.levels`).
  Every challenge rolls a fresh team (seeded by the journey and a challenge
  counter, so a save replays the same one): single species drawn from the whole
  roster with no repeats, plus as many gen-2 fusions as the floor number minus
  one (the first floor none, the Keeper at the top five), each built from three
  species of one class the way the Council's champion builds hers. The player's
  party fights as it is; the sheet defaults the level to the strongest member.
  A win pays experience like a Warden's team and trainer-rate gold, a quarter
  of it once that floor has been beaten at that level (`journey.tower.wins`,
  kept in the save with the challenge counter and shown as "beaten ×n"); a loss
  follows the ordinary wipe rule, and the hub camp is next door. The encounter
  card names the floor and level and offers "Back down".
- **Wipe.** When nobody can fight after a loss the party returns to the last
  camp at full health (`respawnJourney`). No other penalty.
- **Journey state.** `{ seed, phase: starter|roam|champion, party, box,
  player {x,y,dir}, badges, beaten, camps, lastCamp, cooldown, gauntlet,
  encounter, stats, gold, bag }`. Members, XP, level-ups, move learning and healing are
  the shared party helpers in `src/game/party.js`. Saved as
  `save.journey` and normalised on load like the run.
- **UI.** Canvas map with a camera on the player (28 px tiles on phones, 36
  wider), drawn every frame: biome grounds, typed tufts on habitat, animated
  water, region walls, roads, camps with fires, lairs with roofs in the
  region's accent (gold door once its badge is held), the glowing spire and
  the shrine. Trainers are little figures in their lead's type colour with a
  "!" when adjacent; the player walks with a bob. Controls: arrows/WASD, an
  on-screen pad (hold to keep walking), tap the ground to path there (BFS,
  stops on any event) and A / Space to talk. HUD shows the place, its wild
  level, a badge dot per biome, gold and Party / Bag / Map / Menu sheets (party order
  and the learn-move prompt, a minimap with camps, lairs, trainers
  and the spire, fast battles, return to camp, export/import, abandon). An
  encounter shows a card with the foes and Fight / Run before the fight view.

## Roster expansion (implemented)

Seven more species per class, 49 in all, took the roster from 62 to 111 and
every class from a handful of types to fourteen or more of the eighteen.
Each is a full recipe from its class library (twelve slots, recessive
alleles where a hidden trait suits the creature), a palette, trait ranges,
stat weights that name a clear combat style, an eleven-move level-up list
on the shared curve (two moves at level 1, then 6, 11, 16, 22, 28, 34, 40,
46, 52) with a damaging move of its own style in every level band, two
different passives and a line of flavour. Nothing is stored for evolution:
the three stages come from the part art, and `scripts/evolutions.mjs` with
`EVO_ONLY=<ids>` renders any set of species at all three for review. Tiers
follow the old bands (common 395–440, uncommon 415–455, rare 440–470), one
rare per class or so. Twelve passives were added alongside (the five type
Hearts, Regrowth, Iron Hide, Bulwark, Mirror Scale, Steady, Quick Start,
Keen Edge) so the new creatures do not all share the old thirty. The data
test pins the shape: stat weights sum to one, eleven learnset entries, two
distinct passives, unique names, at least fifteen species and ten types per
class.

## Five new classes and the wider world (implemented)

The map grew fourfold (224 × 192) and the ring took five more classes, each
built the same way as the first seven: a rig with twelve slots, seven
hand-drawn parts per slot with stage art, poses, a clade, fourteen species and
a biome of its own. The roster then stood at 181 species on twelve rigs.

- **Flora** (`p.`, the Bramble Wilds, level 14): walking plants. A stem
  carries a bloom for a head, leaves reach out like arms and roots stand like
  legs; vines trail, pods hang, thorns crown the bloom, a canopy rises
  behind, bark is clipped to the stem and fruit hangs from the bloom. Grass
  with thirteen partners.
- **Oozes** (`o.`, the Slurry Sump, level 32): living slime, headless. The
  face and a core sit straight in the body, pseudopods reach from the sides,
  a puddle spreads under the bottom edge; drips, a crown, tendrils,
  swallowed inclusions, surface sheen and bumps dress it. Poison with twelve
  partners and a Normal gelatin cube.
- **Fungi** (`g.`, the Sporewood, level 23): walking mushrooms. The rig is
  rooted at the cap: the stalk hangs from it as the head slot and carries the
  face, the roots reach the ground, gills and a veil hang under the rim,
  spores drift above, a ring and shelves dress the stalk, a glow sits behind
  the cap and spots are clipped to it.
- **Wyrms** (`w.`, the Coiling Gorge, level 41): serpentine dragons. A long
  coil with a head reaching forward, one leg part standing at four belly
  sockets, a long tail, whiskers, a mane along the spine, back plates, horns,
  a glow and bands clipped to the coil. Dragon with thirteen partners.
- **Draconic** (`d.`, Drakefell Peaks, level 55): true dragons. A winged
  quadruped on the shared four-legged pose core: horned head, jaw and a
  breath effect at the snout, wings rising from the back, fore and hind legs,
  tail, spines and chest markings.

Two rules changed underneath. Habitat spawns give the home class a fixed
share of the table (`spawnTable`, `WORLD.homeSpawnShare` 0.72) so the growing
roster of same-element visitors cannot crowd the locals out, and a fused base
colour reported as the dominant parent's stays on that parent's side of the
lightness midpoint after its random nudge. Saves carry `WORLD.version`; a
journey from an older layout keeps its party and badges but restarts at the
Crossroads.

Balance: every species now sits inside a 40–60% tournament band. The tuner
(`node scripts/tune.mjs [rounds] [games] [gain] [verifyGames]`, default six
rounds of 4,000 games at level 50, 3v3) nudges each base stat total toward a
50% win rate after every fresh-seeded round (160 points of total per 100% of
deviation, half that inside ±5%, clamped to 360–520), writes the totals back
into `species.js` and verifies with a 10,000-game run (about 330 games a
species, so a true 50% reads 45–55%). The last verification read 41–59% with
nothing outside the band. Tiers therefore no longer imply a total: common,
uncommon and rare govern only how often a species spawns and how much it is
worth, while the total is whatever the tournament needed (Tortoak 520,
Mantislash 362). Rerun the tuner after any change to moves, abilities, the
type chart or the roster; the roster-expansion pass (three attacks in every
level-50 move set) stays in place underneath it. The six-class expansion below
reran it over the full roster.

## Six more classes (implemented)

The ring took six more classes, built the same way: a rig with twelve slots,
seven hand-drawn parts per slot with stage art, poses, a clade, fourteen
species and a biome slotted into the difficulty order. The roster then stood
at 265 species on eighteen rigs, 1,514 drawn parts.

- **Skeletals** (`k.`, the Barrow Downs, level 47): walking bone on the
  four-legged pose core. Ribcage bodies with a heart-light socket inside the
  ribs, skulls with dark eye sockets that the grave lights burn in, jaws, bone
  legs, spine tails, horns, bone wings, heart lights, shrouds hanging from the
  spine and cracks clipped to the ribcage. Ghost with thirteen partners.
- **Nightwings** (`n.`, the Echo Chasm, level 20): bats. Every body hovers
  above its shadow; membrane wings spread up and back behind the body with a
  wrist thumb nested on each wing's `thumb` socket (the far wing carries a far
  thumb), hooked legs hang under the hips, heads take ears, a crest and a
  muzzle, a ruff sits at the neck and markings are clipped to the body. Dark
  with thirteen partners.
- **Crystallines** (`c.`, the Prism Caverns, level 29): living geodes on the
  four-legged core. Every silhouette corner is sharp (`'c'` point flags),
  torsos carry facet edges and a bright upper-left pane, heads take a crown,
  crystal clusters stand on the spine, tails are shards, and three overlays
  dress the stone: glowing seams and pale facets clipped to the body and an
  aura fitted behind it (`fitBox`). Rock with thirteen partners.
- **Myriapods** (`y.`, the Rootbound Warren, level 38): centipedes and
  millipedes. Long trunks with humped segments and joint lines; one leg part
  is drawn under three segments on each side (`leg1..leg3` and their far
  copies), the head carries mandible, antenna and venom sockets, a tail end
  trails behind, plates and bristles stand on the back, a glow is fitted
  behind and bands are clipped to the trunk. Bug with thirteen partners.
- **Fiends** (`e.`, the Brimstone Sinks, level 52): imps and devils on the
  first upright rig. Torsos with neck, shoulder, hip, tail and wing sockets;
  heads on the neck with horns; arms built as generic parts so they can carry
  a `hand` socket at the wrist, where the near hand holds claws, a pitchfork,
  a fireball, an orb, a chain, a dagger or a torch; standing legs; tails and
  wings behind; marks clipped to the torso and an aura fitted behind it. The
  pose table swings the arms about the shoulder (attack throws the near arm
  forward 34°). Fire and Dark anchored.
- **Spirits** (`s.`, the Vigil Marsh, level 58): ghosts and wisps on a rig
  with no head. The face sits on a hovering shroud that carries eye, mouth,
  hood and mask sockets (the mask is drawn under the eyes as a face plate),
  arms of mist hang from the sides with the near hand holding a lantern,
  candle, skull, orb, bell, scythe or key, a wisp tail trails below toward
  the shadow (`ground` is the body and the tail), and chains, tatters, a
  clipped veil and a fitted aura dress the shroud. Ghost with thirteen
  partners.

Two world rules changed to make room. Biomes are wedges by ring angle rather
than a jittered Voronoi (see Overworld), because with narrow slices the old
jitter could hand the first steps out of town to a level-50 region, and the
wedge width comes from the unjittered angle in a square-normalised space so
every class covers an equal share of the map. Habitat patch types are weighted
by the square of the species count, so a class with nine Grass species and one
Fighting species no longer paints a third of its region Fighting. Every class
push bumped `WORLD.version` (now 9), so saved positions restart at the
Crossroads while parties, boxes and badges carry over.

Balance: the tuner ran twice over the 265 species, a coarse pass at the
defaults and then a finer one (`node scripts/tune.mjs 6 8000 100 12000`: six
rounds of 8,000 games with a gain of 100). The final 12,000-game verification
read 40–60% with nothing outside the band; totals still span 360 to 520.

## Six more elements and the element pass (implemented)

Rust, Blood, Void, Moon, Crystal and Mist joined the eight elements, each in
the same shape: one animated filter, one core ability and a colour (see
Elementals). To give every element natural hosts, an element pass added
fourteen species to every class, 252 in all, taking the roster to 517.

- **Coverage.** In each class the fourteen are, for each of the six elements,
  one species carrying the element's exact type pair (Steel and Poison, Dark
  and Fighting, Ghost and Psychic, Dark and Fairy, Rock and Psychic, Water and
  Ghost) and one mixing a type of the pair with the class's anchor type
  (Normal for mammals, Water for fish, Dragon for wyrms and so on), plus two
  more of the elements that suit the class best. With the Elemental roll
  favouring an element that shares a type with the species, a Rustcrab is far
  more likely to be born of Rust than of Bloom.
- **Authored and derived.** Names, name parts, types, tiers, combat styles
  and the one-line descriptions were written by hand; everything else was
  derived once and written into `species.js` as ordinary data. Recipes pick,
  per slot, the class part whose tags and name best fit the element (iron,
  plate and rivet words for Rust, fang and fist words for Blood, hollow and
  spiral for Void, crescent and silver for Moon, gem and facet for Crystal,
  drip and veil for Mist), avoiding the body, head and eyes a sibling of the
  same element already took; optional slots are carried as expressed-plus-none
  pairs three times in five. Palettes come from the element's base colours
  shifted per class and per sibling; stats follow the style archetype (tank
  and fast variants shift a few points); learnsets are assembled from the
  species' types plus Normal so a style attack lands in each of the three
  level bands; the two passives come from an element pool of ordinary
  abilities.

Balance: with 517 species a 12,000-game round gives each one only about
seventy games, so the tuner needed three passes (two at
`6 12000 100 16000`, then `3 30000 100 20000`) to settle, and one species that
sat at the 520 cap with a slow tank spread was given the plain melee spread
instead. A final 40,000-game verification tournament (`node scripts/sim.mjs
40000 50 3`) read 42–59% with nothing outside the band; totals still span 360
to 520. Larger rounds are the lever when the roster grows again.

## The type pass (implemented)

Every class now covers every type. A type pass added twenty-one species to
each of the eighteen classes, 378 in all, taking the roster from 517 to 895.

- **Coverage.** In each class, eighteen of the twenty-one carry one type each
  in a fixed order (Fire, Water, Electric, Grass, Ice, Fighting, Poison,
  Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy,
  Normal), paired with the class's anchor type (Normal for mammals, Rock for
  reptiles and crystallines, Water for fish, invertebrates and amphibians,
  Flying for birds, Bug for insects and myriapods, Grass for flora and fungi,
  Poison for oozes, Dragon for wyrms and draconics, Ghost for skeletals and
  spirits, Dark for nightwings, Fire for fiends); the anchor's own row is
  mono-typed. Rows alternate common and uncommon, with the odd rows leading
  with the anchor so the pair reads both ways. The last three in each class
  are rare signatures with hand-picked type pairs and styles: the mammals'
  Emberclaw, Auroralynx and Ironboar, the spirits' Banshee, Revenant and
  Polterwisp, and so on.
- **Style by type.** Each type has a fixed combat style (Fire, Ice, Psychic,
  Ghost and Fairy magic; Water, Grass, Poison, Flying and Bug ranged;
  Electric and Dark fast ranged; Fighting, Ground, Dragon and Normal melee;
  Rock and Steel melee tanks), so a class's eighteen typed rows spread across
  the three styles and the idle poses that follow them.
- **Authored and derived.** As in the element pass, names, name parts and the
  one-line descriptions were written by hand and everything else was derived
  once into `species.js` as ordinary data. Recipes score each class part by
  type keywords (ember and flame words for Fire, fin and drip for Water, bolt
  and spark for Electric, leaf and moss for Grass, and so on) while avoiding
  the body, head and eyes a sibling in the class already took; palettes come
  from the type's base colours shifted per class and per species, a little
  darker for melee and lighter for magic; stats follow the style archetype;
  the two passives come from the types' ability pools. Learnsets are built
  band-first: the strongest style attack of the species' types (plus Normal)
  is reserved for level 46, the next for 28 and the weakest for level 1, 16
  or 22 by power, and only then are the remaining slots filled with status
  moves and off-style attacks. That ordering is what lets a three-move style
  pool (Fairy and Normal magic, for instance) still put a style attack in
  every band.

Balance: the 378 newcomers arrived at archetype totals (400 common, 435
uncommon, 465 rare) and a first 30,000-game tournament read 27–79% with 85
species outside the band. Four tuner passes over the 895 followed, all at
40,000 games a round so each species sees about 270 games: `4 40000 100 0`,
then three runs of `2 40000 100 40000`. Between passes, fourteen type-pass
learnsets that had put a 110 or 120-power move at level 28 were reordered so
the strongest move waits for level 52 (the tournament plays at level 50, so
this also took the move out of their hands); the four species pinned at the
520 cap were given an on-type 75-power attack at level 34 in place of an
off-style one; and Sparkwisp, still at 62% on the 360 floor, traded its fast
spread for the plain ranged one. The final 40,000-game verification read
40–61% with one species at 61% and a mean of 50.0%. Totals still span 360 to
520: 72 fast Dark, Ghost and Electric attackers rest on the floor and one
Fighting brawler on the cap, all inside the band.

## Signature moves (implemented)

Every rare species owns one move. The 129 rares each learn a signature at
level 38, a twelfth entry on the shared curve, so by the level-50 tournament it
sits among their four known moves. A signature carries `signature: speciesId`
in the move table: the Market never lists it, `buyMove` refuses it, and sheets
and cards tag it. Fusion can pass one down like any other move of the child's
types, which is the only way a second species ever knows one.

- **Shape.** Each is typed to one of its species' types and cast in the
  species' own combat style, so it is always the creature's best move rather
  than a curiosity: 90 power and fully accurate as the baseline, 85 with a
  first-mover bonus, 70 at priority, 100 with a status chance, 95 with a stat
  drop, 120 with a self-debuff, 130 with recoil, 140 with a rest turn.
  Names come from the species' own descriptions (Phoenixquill's Rekindle,
  Nightsovereign's Already Known, Bloodmarrow's Dry Bone Haymaker).
- **Seven new effect kinds** were added to the engine for them and are priced
  by the PP rule like the other extras: `restore` (heal a share of max HP
  after a hit), `cure` (shake off the user's own status), `pierce` (ignore the
  target's defence boosts and the user's attack drops, as a critical hit
  does), `recharge` (the user rests the turn after a hit; switching clears
  it), `cleanse` (reset the target's stat stages), `boostIfLow` (half again
  at a third HP or less) and `boostIfFirst` (half again while the target has
  not moved this turn). The AI weighs each of them.
- **Balance.** Rares gained a strong move at 50: the first tuner round after
  this patch read 34–79% with twenty species outside the band, the void rares
  and Thunderbull highest. Three passes of `2 40000 100 40000` followed
  (each round now takes about 200 seconds with the new effects), moving 740,
  731 and 741 totals; between the second and third, Wraithwing, sitting on
  the 360 floor at 63%, had its priority signature Gone Before Seen softened
  from 70 to 60 power. The final 40,000-game verification read 40–61% with
  one species at 61% (Thunderbull, still drifting down) and a mean of 49.9%;
  totals span 360 to 520 with 70 species on the floor and two on the cap.
  Natures, added afterwards, lean stats at random and add noise but no bias,
  so the loop stands.

## Held charms (implemented)

One held item per creature, read by the engine from `held` on the battler.
`src/data/charms.js` holds 31 charms in three families:

- **Type charms** (18): one per type, lifting that type's moves by a fifth.
- **Bands** (3): Brawler's, Marksman's and Sage's, lifting one damage type by
  a tenth.
- **Utility charms** (10): Moss (a sixteenth of max HP back every turn),
  Siphon (heals an eighth of damage dealt), Sturdy (holds one hit that would
  knock the holder out from full HP, once a battle), Hawk (critical hits twice
  as often), Swift (Speed times 1.1), Salve (cures the holder's status at the
  end of the turn, once a battle), Scholar's (the holder's experience share
  times 1.5), Lucky Coin (trainer gold times 1.5 with the coin anywhere in the
  party), Lure (wild encounters twice as often while the lead holds it) and
  Prism (the lead's Elemental roll ten times as likely).

Charms live in the Bag under their own ids beside potions and scrolls, so the
save, the Market and the Bag share one structure. The Market sells them all
(2,500 to 12,000 gold); every Warden also hands one over with their badge, a
different charm per biome (`WARDEN_CHARMS`), so a lap of the ring collects
eighteen. Give from the Bag swaps with whatever the creature held; Take on the
Info sheet returns it; release and fusion return charms to the Bag. Foes never
hold charms, and the tournament simulator does not use them, so they sit
outside the balance loop as a player-side edge.

## Fusiondex and colour morphs (implemented)

`src/game/dex.js` keeps a compact record in the save, keyed by species id so
it never grows with the collection: `seen`, `caught`, `morphs` (species to
morph to 1 seen or 2 caught) and `claimed` reward tiers. Every foe you face
(wild, trainer, Warden, Council or Tower) is marked seen when the encounter
card draws; starters, captures and fusions go through `recordCollection`,
which now marks the species caught; and `normalizeSave` seeds the dex from
the collection and the journey so older saves fill in on load.

- **The sheet.** Dex from the HUD or the Menu. The Species tab shows one class
  at a time (a chip per class with its caught count): caught species drawn in
  full from a fixed dex seed, seen ones as silhouettes, unseen ones as
  numbered blanks that give away only the tier. Cards carry a habitat hint
  (the class's region and the species' types) and morph dots. Tapping a known
  card opens the ordinary creature sheet, cycling through the class's known
  species. A wild encounter carries the dex mark beside the creature's name,
  on its card and in the fight's foe panel: a filled gold ring for a species
  caught before, a hollow one for a species not yet caught, and the card says
  which in words. The Fusions tab is the collection's fused creatures; the Rewards
  tab lists eight milestones (10, 25, 50, 100, 200, 400, 700 and all 895
  species caught) paying gold or a charm into the current journey, once per
  save.
- **Morphs.** One wild roll in 256 is a colour morph: albino (bone white,
  pink eyes), melanistic (coal dark, amber eyes) or pastel (chalk tints).
  `morphPalette` pins hue-preserving saturation and lightness rather than
  shifting them, so applying it twice changes nothing; the accent
  harmonizer runs afterwards as usual. The genome carries `morph`, validation
  drops unknown values, a morph travels with the face in fusion and re-pins
  the blended coat, the wild encounter is announced as an Albino Fernhare,
  and the creature sheet shows a morph chip beside the types.

## The notice board (implemented)

A board in the town square (`TILE.board`, faced and read rather than walked
on; `WORLD.version` 10) carries three open requests. `src/game/quests.js`
draws each from ten kinds, deterministically from the journey seed and a
running count, never two of a kind at once and never one that cannot be done
(a trainer notice needs two unbeaten trainers in reach, a Tower notice a
party within five levels of the first floor). Targets come from the biomes
in reach: every badge held plus the next two on the ring.

- **Kinds.** Catch a type at or above a level, catch a named common or
  uncommon species (with its region named), beat two or three trainers on a
  biome's roads, fuse two creatures of a class, rest at a biome's camp, win a
  Tower floor at a level, beat a Warden (the next one, or a rematch), catch
  an alpha, catch a count of wild creatures, or defeat wild creatures of a
  type.
- **Rewards.** Gold scales with badges held (400 plus 250 a badge) times a
  tier (1, 1.6 or 2.5 by difficulty) rounded to tens, plus an item: a potion
  for easy notices, a 60 to 95 power scroll matching the notice's type for
  middling ones, and a utility charm (or the type's charm) for the hard ones.
  Signature moves are never rewards.
- **Flow.** `questEvent` is booked from the journey: captures (with level and
  alpha), wild wins, trainer, Warden and Tower wins, fusions at the shrine
  and camps. Finished notices are named in the battle report and camp toast;
  claiming happens at the board, which pays into the purse and the Bag and
  pins a new notice. A notice can be torn down for another. The board
  survives the save with its progress; unknown kinds or rewards are dropped
  and the board topped back up.

## Natures (implemented)

`src/data/natures.js` holds forty-nine natures over the seven battle stats
(HP is never leaned): a seven by seven grid where the row is the stat lifted
and the column the stat lowered, the diagonal being the seven even natures
(Even, Mild, Plain, Quiet, Docile, Bashful, Level). `statsAtLevel` multiplies
the finished level stat by 1.1 or 0.9, floored, so the lean scales with level
like everything else. Every wild roll draws a nature uniformly (one in seven
is even); validation gives creatures from before natures the Even nature so
nothing they had changes; fusion takes the face parent's nature three times
in five and the other's otherwise. The creature sheet names the nature under
the title, says what it leans in the stats section and marks the lifted and
lowered rows with green and red arrows. Natures add noise but no bias to the
tournament, so the balance loop stands.

## The Bounty Office (implemented)

A 3 by 2 house on the hub's south-east edge (`TILE.bounty`, door
`TILE.bountyDoor` on the square; `WORLD.version` 11, and the notice board
moved a step to make room). `src/game/bounties.js` keeps five standing
bounties, each wanting a fusion of one type (no two alike), priced at 1,500
gold plus 300 a badge, times a per-bounty spread of 0.8 to 1.4, rounded to
tens. Any member of the party or storage with generation one or more that
carries the type qualifies; the payout is the bounty's gold times a level
bonus of 1 + level/100 (1.01 at level 1, 2.00 at level 100). Handing one over
returns its charm to the Bag, removes it (it stays in the Collection), pays
the purse, counts toward `stats.bounties` and pins a fresh bounty. Locked
creatures and the last member of the party are refused. The office sheet
lists the five with the best candidate's payout, then the candidates with
their multipliers; a second tap confirms. The save keeps the list and drops
junk types, prices and duplicates.

## Passives at scale

The first forty-two passives and the fourteen Elemental cores are implemented
by id in the engine. To grow the pool to three hundred without three
hundred hand-written hooks, every later passive is a data row: `defA(id, name,
fx)` in `src/data/abilities.js`, where `fx` is a list of typed entries the
engine interprets at its hooks (`abFx` in `src/battle/engine.js`, kinds listed
in `PASSIVE_KINDS`). Descriptions are written from the entries in the game's
own stat words, so text and behaviour cannot drift apart. Seventy-odd kinds
cover power and accuracy multipliers by type, style, flag, power band, move
effect and situation; resists, weaknesses, absorbs and immunities; entry,
end-of-turn, switch, knockout and contact effects; reactions to being hit;
status rules; priority tweaks; and a few classics (Sheer Force, Shield Dust,
Synchronize, Magic Guard, Scrappy, Pressure, Early Bird, Quick Draw).

Batches so far:

- **Batch 1 (62).** Eighteen type affinities (a type's moves times 1.2),
  the ten low-HP surges the first eight left out, eighteen type resists (times
  0.6), eight absorbs (Fire, Ground, Ice and Poison heal a quarter; Grass,
  Electric, Flying and Ghost lift a stat) and eight style boosts (Melee,
  Ranged and Magic times 1.15, contact times 1.25, sound times 1.3, moves of
  100 power or more, multi-hit and draining moves).

- **Batch 2 (61).** Twelve entry effects (a stat of your own up, or one of
  the foe's down, on entry), nine end-of-turn effects (Overgrowth, Second
  Skin, the chance-a-turn risers, Venom Feeder, Rot Aura and Dread Aura),
  three knockout rewards, eight contact punishments (Barbed, Frost Fur,
  Sleep Spores, Spore Cloud, Gooey and the stat-sapping hides), twelve
  reactions to being hit (Stoked, Stamina, Weak Armor, Righteous, Rattled,
  Water Compaction, Steam Engine, Thermal Exchange, Cotton Down, Sapping
  Hide, Anger Point), Ricochet and Backlash, Natural Cure and Rest Easy,
  Berserk, Anger Shell, Last Stand and Multiscale, Compound Eyes, Sand Veil,
  Tangled Feet and No Guard, and Sniper, Super Luck, Shell Armor, Merciless
  and Steady Nerves.

- **Batch 3 (60).** Situational boosts (Ambusher, Counterpuncher, Merciless
  Edge, Fresh, Finisher, Quickdraw, Sheer Force, Tinted Lens, Filter), raw
  stat leans (Brawn, Deadeye, Insight, Fleet, Thick Coat, Dense Plate, Clear
  Mind) and status-fed ones (Quick Feet, Flare Boost, Toxic Boost, Marvel
  Scale, Fever Ward), priority (Gale Wings, Shadow Step, Prankster, Triage,
  Quick Draw, Early Bird), immunities (Earplugs, Overcoat, Armor Tail, Good as
  Gold, Purity, Shield Dust, Magic Guard, Rock Head), Liquid Ooze,
  Synchronize, Pressure, Scrappy, the touches (Poison, Scorching, Static,
  Chilling, Toxic Chain, Stench), the stat guards (Big Pecks, Clear Amber,
  Sure-Footed), Defiant, Competitive, Steadfast, Aftermath, Hustle, Wide
  Stance, Focused Mind, Vampiric, Opportunist, Bully, Technician and Grand
  Slam.

- **Batch 4 (61).** Passives that combine two or three entries, which is where
  the data rows pay off. Ten pairings for two-type creatures (Amphibious,
  Cold Forge, Grounded, Sky Scales, Lucid, Gravel Gut, Bramble Skin, Twilight
  Veil, Brawler's Hide, Slick Scales: a boost or resist for one type with a
  weakness or immunity for another), eighteen classics rebuilt from entries
  (Dry Skin, Fluffy, Water Bubble, Punk Rock, Purifying Salt, Steelworker,
  Dragon's Maw, Transistor, Rocky Payload, Shell Home, Hollow Bones, Deep
  Roots, Cold Blood, Cinder Skin, Iron Stomach, Storm Skin, Grave Chill, Night
  Eyes), the glass builds that trade a defence for an attack (Bruiser,
  Pinpoint, Glass Cannon, Glass Wand, Long Shot), the knockout risers
  (Chilling Neigh, Grim Neigh, Trophy Hunter), Regenerating Shell, Simmer and
  Limber Up, five entry combinations (Intimidating Bulk, Battle Cry, Eerie
  Calm, Sweet Scent, Bright Flash), four contact combinations (Static Spines,
  Molten Hide, Toxic Slime, Charged Hide), and the flavoured hides and maws
  that pair a resist or thorns with a lean (Sun Drinker, Stone Setter, Wind
  Reader, Grudge, Mirror Nerve, Thick Skin, Frost Scales, Bramble Coat,
  Slipstream Hide, Venom Veins, Sparking Fists, Razor Maw, Spore Bearer).

That makes three hundred passives: fifty-six implemented by id (forty-two
originals and fourteen Elemental cores) and two hundred and forty-four data
rows. A test walks every data row through `describeFx` to check the text uses
the game's stat words, and every kind in a row is one the engine interprets.

Distribution (as it stood at three hundred; the pass below rebuilt it).
While the batches landed, a script handed each new passive to
about six species by affinity (its type first, then its style, then
anywhere), preferring species not yet touched. After the last batch a final
pass redistributed the whole pool: each species picks two passives from the
two hundred and eighty-six ordinary ones (the Elemental cores stay
Elemental-only), scored by affinity with a bonus for what it already carried,
under a global cap so no passive gathers more than seven homes, and a second
pass lifts anything under three. The result: every ordinary passive sits on
five to seven of the 895 species (the pool cannot be flatter than that with
1,790 slots; the balance swaps below nudge one passive to eight), 603 species
kept at least one of the passives they had before,
no species carries the same passive twice, and 94% of the typed passives
(a type's affinity, resist, absorb or immunity) sit on a species of that type.
Tests hold the floor at three and the ceiling at twelve so later hand edits
cannot orphan a passive.

Balance. New passives on every species shift the tournament, so the tuner
ran four passes of `2 40000 100 40000` (each round about 215 seconds). The
first round after the redistribution read 34–66% with nine species outside
the band; the passes moved 786, 746, 757 and 723 totals. Between passes,
four species pinned at a clamp had a passive swapped rather than a total the
tuner could not move: Wraithwing (360 floor, 62%) lost the snowballing Soul
Eater for Natural Cure, Voltskull (floor, 60%) traded Storm Drinker, redundant
beside Capacitor, for Steady Nerves, Glidefin (floor, 60%) traded Glass Cannon
for Sure-Footed, and Brawlshroom (520 cap, 40%) traded the rarely-live Toxic
Boost for Heavy Blows. The second round of the last pass read 40–60% with
nothing outside, and the final 40,000-game verification 39–60% with one
species at 39% (Brawlimp, not pinned) and a mean of 49.9%; totals span 360 to
520 with 21 species on the floor and 11 on the cap. Wraithwing and Voltskull
now read 52%, Glidefin 56% and Brawlshroom 49%.

### The second three hundred

Three hundred more followed, and they needed mechanics the first three
hundred could not express, so the engine learned forty new entry kinds:
matchup power (the foe's type, style, status or health), the user's own
situation (first turn out, last one standing, avenging a fallen teammate,
repeating a move, cornered, a slow starter, a faint heart), conversion (a
move retyped on the way out, Shifter, Chameleon Skin), costs and yields
(HP for power, halved recoil, bigger gulps, an extra multi-hit), tactics
(Mold Breaker, Unaware, Contrary, Simple, Download, Trace, Magic Bounce),
guards that fire once a battle (Disguise, Endure, a low-HP heal, a softer
first hit), cushions against critical hits, heavy moves, light moves,
draining and multi-hit, and three hooks that reach outside the fight.

- **Batch 5 (59).** Eighteen type hunters (a Dragonslayer is not a dragon:
  the type names its prey), five status reapers, three style readers, the
  same-type sharpeners, nine conversions from Normal, and the costed builds
  (Heart Burn, Crash Helmet, Slow Burner, Faint Heart).

- **Batch 6 (60).** Twenty tactics, sixteen once-a-battle guards, ten
  cushions, nine world passives and five that answer for a fallen teammate.

- **Batch 7 (60).** The armoury: ten absorbs for the types that had none, six
  immunities bought with a weakness, six style platings, eight pieces of
  status armour, ten reactions to a type or a style, eight sets of thorns and
  twelve odd guards.

- **Batch 8 (60).** Field craft: twelve entry effects, eleven that hold the
  field turn by turn, eight for going out and coming back, eight paid on a
  knockout, twelve that punish contact, and eight around flinching, priority
  and the odds. Accuracy and evasion are stage keys like any other, so the
  generator now names them in words.

- **Batch 9 (65).** Legends of the twelve biomes and twelve class marks (three
  entries each), style sages, power-band and move-effect specialists, eight
  Nemesis pairs that hit a type harder and take less from it, six more
  conversions, six world combinations, and nine grand finishers (Titan Heart,
  Phoenix Down, Void Mantle, Sunrise Aura, Moonshadow, Iron Will, Bloodmoon,
  Starcaller, World Serpent).

Six hundred passives in all: fifty-six implemented by id and five hundred and
forty-four data rows. A test holds every name and every set of entries
distinct, so no two passives share a name or do exactly the same thing, and
every entry is a kind the engine reads and can describe.

**Outside the fight.** Three kinds leave the battle: `worldXp` lifts its
carrier's own share of experience, `worldGold` pays the party more when the
best forager in it is holding, and `worldCatch` makes wild creatures easier
to catch while that passive leads the fight. They read in the same words as
the charms that do the same jobs, and stack with them.

**Distribution.** With 586 ordinary passives over 1,790 species slots the
pool can only sit about three deep, so the final pass rebuilt every species'
pair: each picks two by affinity with a bonus for what it already carried,
under a cap of four, and a second pass lifts anything under two. The result:
every ordinary passive sits on two to four of the 895 species, 550 species
kept at least one of the passives they had before, no species carries the
same passive twice, and 94% of the typed passives sit on a species of that
type. The tests hold the floor at two and the ceiling at six.


### The third three hundred

The pool doubled again, and again the engine learned what the rows needed:
twenty-six more kinds for tempo (the turn count, the charm in its hand, the
level gap, whether the whole team still stands), the party around it (a bench
that heals or is cured while it fights, a legacy paid out when it falls),
sleight of hand (trading two of its own stats, stealing or sweeping the foe's
boasting, handing over its own sickness, sealing healing, souring its blood,
striking without contact, never missing, ignoring evasion, capping any single
blow, certain critical hits, fighting in its sleep, thawing at once) and the
mark it leaves behind when it faints.

- **Batch 10 (60).** Ten that read the clock, eight built around holding a
  charm or holding nothing, six for the level gap, ten for the party
  (formations, field medics, chaplains, last wills), four that spare PP,
  eight death marks, and fourteen tempo mixes.

- **Batch 11 (60).** Five stat trades, five thefts and sweeps, ten seals and
  denials, ten caps and certain crits, six around sleep and thaw, ten
  sicknesses, and fourteen tricks.

- **Batch 12 (60).** A full kit for every type: eighteen wardens (resist the
  type, harden when it lands), eighteen zealots (master one type, thin-skinned
  against its answer), ten banes with the same bargain reversed, two twin
  hunters, and twelve more conversions, which leaves seventeen of the
  eighteen types reachable from Normal.

- **Batch 13 (60).** Twenty-four marks of the creature kinds, each combining
  three entries, and thirty-six plain leans a builder reaches for: single
  stats, seven trade-off builds, status-fed leans, accuracy and crit, and the
  move-flag specialists.

- **Batch 14 (62).** Twelve double-edged builds, fourteen sovereigns of the
  types, twelve journey passives, and the last of the classics, including
  eleven absorbs that lift a stat or heal.

Nine hundred passives: fifty-six implemented by id and eight hundred and
forty-four data rows, over 146 entry kinds. Every name and every set of
entries is distinct, and the tests check both.

**Distribution.** 886 ordinary passives over 1,790 species slots is barely two
deep, so the last pass caps a passive at three homes and asks only that each
has one. Every ordinary passive is carried by one to three of the 895 species,
and 91% of the typed passives sit on a species of that type. Because the pool
is now larger than the roster, a species' pair is closer to a fingerprint than
a build: two creatures rarely share both.

**A collision worth recording.** Seven rows in these batches reused an id from
the first six hundred. Nothing errors when that happens: the second row simply
replaces the first, so seven older passives quietly changed behaviour, and the
duplicate check missed it because it compared names and entries rather than
ids. The newer designs were renamed (Dust Veil, Blood Rush, Deep Well, Stone
Stomach, Shell Set, True Line, Updraft), the older ones restored, seven of the
thinnest new rows dropped to keep the count at nine hundred, and the pool test
now reads the table and fails on a repeated id.

**Balance.** Three tuner passes of `2 40000 100 40000`. The first read 39-70%
with sixteen species outside the band, and five of the worst carried a passive
that caps a single hit at a quarter or a third of max HP: in a seven-turn
fight that blunts almost every blow rather than only the biggest, so every cap
moved up a step (a quarter to 45%, a third to half, half to 60%). Two species
then sat on the 360 floor above the band with nothing left for the tuner to
take, and each traded its strongest passive with a mid-band species, which
leaves every passive with the same number of homes. The last verification over
40,000 games reads 38-60% with three species outside, a mean of 50.0%, and
nothing pinned at a clamp outside the band; totals span 360 to 520 with 17
species on the floor and 9 on the cap.

## The move kit pass (implemented)

The passive pool had grown to nine hundred while the move table stood at 197
ordinary moves and 129 signatures, and it showed: Glare sat on 498 of the 895
species and Brace on 471, because for most buckets there was nothing else to
give. Ranged had 67 moves against 115 each for melee and magic, and only 29
moves were status at all.

**The fill.** Every type now carries at least six melee, six ranged, six magic
and four status moves, which took 205 new ones and lands the ordinary table at
402 (531 with the signatures). They are generated from templates rather than
typed out one by one: nine shapes per damaging category (a solid hit, a heavy
one, a snapping bite, a jab that leaves the type's own status, a flurry, a
drain, a reckless recoil, a keen edge, a quick strike) and eight for status
moves, crossed with a word pool per type. Each type deals in the status it
should (Fire burns, Poison poisons, Electric paralyses, Ice freezes, Grass and
the other powdery types put to sleep), and the flags follow the type too, so
biting belongs to Dark, Dragon and Water, punching to Fighting, Fire and
Steel, powder to Grass, Bug, Poison and Fairy, sound to the callers.

**The weave.** New moves nobody learns would only be shop stock, so a pass
rewrote learnsets: any move carried by more than a hundred species counts as
filler, and up to four of a species' filler slots are swapped for a move of
its own type at the same level. The swap is like for like, damaging for
damaging and status for status in the same category, so every species keeps an
attack of its own style in each level band. It moved 3,026 entries across 859
species. The commonest move is now Belly Flop on 202 species rather than Glare
on 498, the median move is learned by six species rather than eleven, and 525
of the 531 moves appear in some learnset. A test now also refuses a learnset
that repeats a move, which caught one that already did.

## The second slot (implemented)

Gold had nowhere to go: a trainer rematch pays 2,630 at level 70 and a Tower
floor 18,000, while the dearest thing in the game was a 12,000 charm and every
charm ever printed came to 96,500 together. The first of the sinks is also the
one that opens the passive library up.

**A second passive slot**, 40,000 gold, bought once per creature at the
Rookery and never closed. From then on the creature fights with both: the
engine reads a battler's passives from `ability` and `ability2` together, the
log names whichever of them fired, and every hand-implemented passive check
looks in both slots. The Rookery's swap and wild draw take a slot number, so
either can be turned over afterwards, and the creature sheet lists both.

It is a player-only purchase. Wild creatures, trainers, Wardens and the
tournament simulator all field one passive as before, so the 40-60% band the
tuner maintains is untouched; what the player buys is a build, not a stat.
**Changed since:** an Elemental may buy the second slot after all. Its core
is what makes it an Elemental, so the first slot is still not for turning
over — no swap, no wild draw — but the second is bought empty and filled
like anyone else's, and a core is never what goes into it: neither the
bloodline list nor the wild pool has one in them. The Rookery also says the
rule on the row now rather than in a tooltip, which is invisible on a phone.

## The Trophy Hall (implemented)

The Storage building gained a second room. A wing costs 20,000 gold and buys
three shelves, up to five wings and fifteen shelves; putting a creature from
the collection up on one is free, because the room was the expensive part. The
hall persists in the save across journeys, so it is the one place a finished
run leaves something behind.

Beside it stands the dyer's bench: 12,000 gold draws a party creature a new
colour morph, one of the three or its own colours back, never the one it has
and never chosen. A morph drawn this way goes into the Dex like any other. A
shiny is left alone, since its colours are what make it one.

Both are vanity and neither touches a fight, which is what a gold sink at this
end of the game should be.

## The broker (implemented)

The Market keeps a broker who sells word of creatures the Dex has never seen:
2,000 gold names one, says which region it lives in and what types it carries,
and the Dex counts it as seen, which counts towards the collection rewards.
Three offers stand at a time, drawn from everything unseen and held still
until one is bought, and the list runs dry when the Dex has seen the roster.

It converts gold into collection progress and nothing else: a seen creature is
still one you have to go and catch.

## Nature draws at the shrine (implemented)

A nature is rolled at capture and was fixed for life, which made 49 of them
into 49 shrugs. The shrine will now draw a creature a new one for 8,000 gold:
random, never the nature it already has, and never chosen. The draw is seeded
by the journey and the number of draws so far, so reloading a save cannot fish
for a better one, and the sheet asks for a second tap before it spends.

It is the purest of the sinks. A nature lifts one stat a tenth and drops
another, so a draw is a small, permanent lean, and chasing a particular one
costs as much gold as the player is willing to lose.

## Stat coaching (implemented)

A camp will move one point of a creature's stat spread from one stat to
another for 2,000 gold plus 50 a level. The spread is a set of fractions that
sum to one, and coaching moves a hundredth from one to another, so the sum,
and therefore the creature's base total, is exactly where the tuner left it.
What changes is the shape: a Magic-leaning starter can be walked towards Melee
over several sessions, and its damage type may change with it.

The limits keep it a build rather than a min-max: ten sessions a creature, no
stat below a twentieth of the total, none above three tenths. The camp sheet
picks the two stats from dropdowns and says how many sessions are left.

## The charm forge (implemented)

Thirty-one charms, each bought once and then done with. Every one now has a
greater form, forged rather than sold: two of the same charm and twice its
price in gold. A Greater Ember Charm lifts Fire moves 1.35x instead of 1.2x,
Greater Moss heals a tenth a turn instead of a sixteenth, Greater Swift is
1.18x Speed, and the once-a-battle charms, Sturdy and Salve, fire twice.

The charms carry their own numbers now. The engine used to read one table of
constants, so every charm of a kind behaved alike; it reads the charm itself
and falls back to the table, which is what lets a greater charm differ. That
covers the battle rules and the world ones: a Greater Scholar's Charm doubles
its holder's experience, a Greater Lucky Coin doubles the gold, a Greater Lure
triples the encounters and a Greater Prism makes Elementals twenty-five times
as likely.

The forge sits in the Market and lists only what the Bag has doubled up.
Greater charms are never on the shelf, and the Wardens hand over ordinary
ones, so the only way to a greater charm is two of the same and the gold.

**Fixed since:** the Bag listed the charms the Market *sells*, which is the
ordinary thirty-one by definition, so a forged charm went into the bag and
vanished: it could not be seen, and since Give starts from that list, it could
not be handed to anything. The Bag now reads the whole charm table and shows
each greater charm beside the plain one it was forged from. The same slip had
notices paying out in greater charms — the reward pool was drawn from every
charm id rather than the shop's — which both gave away a gold sink and handed
over something invisible; notices now pay in ordinary charms only.

## The postgame (implemented)

Beating the Council left the Battle Tower as the only thing to do. Two more
now open at that point.

- **The Trial of the Day.** One gauntlet a day, entered from the Spire as
  champion. The date seeds it, so everyone playing on the same day meets the
  same trial: one rule from six (a banned type, one discipline, one class,
  no more than three, no charms, no fusions), one class the opposition leans
  on, and three fights of four creatures at level 70, with a short rest
  between and a fusion leading the last. The rule is checked against the
  party at the door and refused in words. It pays 900 gold a fight and 2,500
  more for finishing, and the journey records the day so it cannot be farmed.
- **The Elders.** Once you are champion, each region you hold a badge for has
  one ancient creature waiting at its lair, drawn from the rares of that
  class at level 78. It is catchable and it shows itself once per journey.
  The lair dialog hints at it before you go in.

**A bundler footgun, closed.** The single-file build concatenates modules into
one scope and strips import lines, so `import { x as y }` left `y` undefined at
runtime, and nothing caught it: the tests import the modules directly, where
aliases work fine, and only a headless walk through the built page found it.
The build now refuses an aliased import by name.

## Searching and planning (implemented)

The game held 895 species, 900 passives and 531 moves, and nothing in it
could search any of them. The Dex grew three things.

- **Search and filters** on the species tab: a box that reaches across every
  class at once, type chips, and a caught / seen only / missing filter. With
  the box empty it still browses one class at a time, as before.
- **An Index tab** listing every passive and every move, searchable by name,
  by wording (so "thorns" finds the passives that mention thorns) or by type,
  showing the first 120 matches. This is the only place the whole library is
  legible.
- **A Team tab** that reads the party as it stands: the best multiplier it can
  bring against each of the eighteen types, which types nothing it knows can
  touch, how many members each attacking type hits for double, and the
  Melee / Ranged / Magic split of the party. The numbers come from
  `src/game/planner.js`, so the tests read exactly what the screen shows.

## Trainers with a name to them (implemented)

The road had 108 trainers who each said one line, fielded a spread of
whatever lived nearby, and went quiet for good once beaten.

- **Personalities.** Eight of them (Bold, Patient, Keen, Showy, Grim,
  Cheerful, Careful, Wild), each leaning its team towards one damage style
  and carrying its own rematch line. The card names it: "Falconer Ines ·
  Keen: keeps its distance". Two Falconers on the same path now fight
  differently.
- **Wardens fight to a plan.** Each of the eighteen has an authored theme, a
  motto, a line for handing over the badge and a line for a rematch, and
  their team is drawn from the species of that theme's style, so a badge is
  earned against a strategy rather than a spread. The Fen drowns you slowly
  with Magic, the Meadow shoots from range, the Scar comes straight at you.
- **Rematches.** A beaten trainer waits until your best creature has outgrown
  their lead, then offers again with their team lifted to two levels under
  your best, capped at 100. It pays a quarter of the gold, like a Warden
  rematch, and the count sits in the journey stats.

## Learning a move (implemented)

Every move but the signatures was sold at one shop, priced by power alone,
from the first hour of the game: a shopping trip, not a decision. The scroll
system stays, but where a scroll comes from now depends on the move.

- **The Market keeps the basics**: every Normal scroll and anything of 60
  power or less, 199 of the 402. Buying anything heavier there is refused with
  a line pointing at the tutors.
- **Each region's camp has a tutor** who teaches three types, authored per
  region rather than derived: the Downs teach Normal, Fighting and Ground, the
  Lagoon Water, Ice and Electric, the draconic reaches Dragon, Fire and
  Flying, and so on. Every one of the eighteen types is taught in two or three
  places, so a full kit means travelling. A tutor asks seven tenths of the
  Market's price and wants that region's badge first, which puts the strong
  scrolls behind the Warden who guards them.
- **Any camp will recall a move** the creature has outgrown: anything in its
  own learnset it has passed in level but no longer knows, for 150 gold plus
  10 a level. Four move slots and a twelve-entry learnset meant most of what a
  creature learned was gone for good.

Camps still heal the party when you walk onto them; the sheet opens when you
press A there.

## The Rookery (implemented)

A creature's passive was rolled once, at capture, from the two its species
carries, and could never change. With nine hundred passives in the game that
was a lot of depth the player could not touch, so the Crossroads gained a
fourth building on its south side, next to the notice board.

- **A swap** turns a creature over to another passive its own bloodline
  carries: the other one of its species' pair, or, for a fusion, any passive
  from either parent species. It costs 900 gold plus 20 a level, so turning
  over a level-70 fusion is a real decision rather than pocket change, and it
  can always be swapped back.
- **A wild draw** is dearer (3,500 plus 40 a level) and cannot be chosen. It
  takes one at random from the passives that suit the creature: any whose
  entries name one of its types, or whose category or stat matches its
  fighting style. A level-40 Fire creature has around sixty of those. The
  draw is deterministic per creature and draw count, and it asks for a second
  tap before it spends the gold.
- **An Elemental keeps its core.** The core passive is what makes it an
  Elemental, so the Rookery refuses, and says so.

The hut is a 3 x 2 block with its door facing the square, and stepping into
the doorway opens it like the Market, the Storage, the Tower and the Bounty
Office. The map changed, so the world version moves to 12 and saved journeys
regenerate their map.

## The field: weather and terrain (implemented)

The engine had no field layer at all. Nine hundred passives and 531 moves read
the two creatures in front of them and nothing else, so every fight was played
on the same blank floor under the same blank sky.

**The sky.** Four weathers, each five turns long: Harsh Sun (Fire 1.5x, Water
at half), Rain (the reverse), Sandstorm (a sixteenth of max HP a turn off
everything but Rock, Ground and Steel, and Rock types keep 1.5x Magic Def) and
Snowfall (the same bite, sparing Ice, and Ice types keep 1.5x Melee Def).
Harsh Sun also refuses to let anything freeze.

**The ground.** Three terrains, five turns each, and they only reach what is
standing on them — a Flying type or anything that hovers is above the whole
argument. Grassy Field lifts Grass moves by 30% and mends a sixteenth of max HP
a turn; Charged Field lifts Electric by 30% and lets nothing sleep; Misty Field
halves Dragon moves and refuses every status.

**Who sets it.** Eighteen new moves: four weather callers, three ground
raisers, Clear Skies to sweep both away, and ten that cash the field in —
Solar Lance at 1.5x in the sun (2.25x with the sun's own Fire bonus),
Thunderline and Frost Gale, 70% accuracy moves that never miss in their own
weather, Static Spike and Rootdraw and Mist Lash for the ground, and
Weathervane, a Normal magic attack that takes whatever type the sky is. A
weather move that names the weather already up simply fails, which is what
stops the AI looping on it.

**A hundred new passives**, taking the pool to a round thousand. Thirteen new
entry kinds carry them: `entryWeather` and `entryTerrain` bring a field in as
their owner walks on, `weatherBoost`/`terrainBoost` pay for attacks,
`weatherStat`/`terrainStat` move a stat while it holds (Sun Sprint doubles
Speed in the sun; Dune Racer does it in the sand), `weatherDef` softens what
lands, `weatherHeal`/`terrainHeal` mend each turn, `weatherEvade` hides in the
grit, `weatherImmune` shrugs the chip damage off, `fieldExtend` makes what its
owner sets last eight turns instead of five, and `noWeather` flattens the sky
for both sides while it is out. They are homed by climate: sun passives sit on
Fire and Grass species, rain on Water and Electric, sand on Ground, Rock and
Steel, snow on Ice and Flying, the terrains on Grass, Bug, Electric, Fairy,
Ghost and Psychic, with the weatherproof ones on Rock, Steel, Normal, Ground
and Dragon. 122 homes over 100 passives, every one of them carried.

**The map argues first.** A fight in the open has a 35% chance of opening under
the region's own sky and another 35% of its own ground: the Ember Scar and the
Brimstone Sinks are bright, Drakefell Peaks and Windward Crags are cold, the
Fen, the Marsh and the Lagoon are wet, the Warren, the Barrows, the Caverns and
the Gorge are all grit, the Downs and the Wilds and the Meadow are grass, the
Sporewood and the Chasm and the Hollow are misty, and the Sump crackles.
Indoor fights — the Tower, the Trial, a Warden's hall, the Council — start on a
clear field.

**The AI** scores a field by what it would actually get out of it: the attacks
it holds that the weather pays for, whether its own types are lifted or
smothered, whether the grit would wear it down, and the same sum for the
creature opposite. It never calls for weather that is already up, and Clear
Skies is worth something only when the field favours the other side.

**Reading it.** A chip under the arena names each of the two with its clock,
in the weather's own colour, and the log calls it as it lands and as it runs
out. Move cards say `×1.5 in Harsh Sun` or `never misses in Rain` in the same
plain words as every other side effect, and a passive's text is generated from
its entries as usual, so `Speed is 2x in Harsh Sun` needs no hand-writing.

## Settings and save slots (implemented)

The game had one switch (a speaker in the header) and one save (a single
`creaturecollector.save` key), which is thin for something with this many
screens.

**Settings** live in their own key, apart from the save, because they belong to
the person playing rather than to a journey: sound on or off, battle speed
(Normal, Fast at 0.35x every pause, Instant at 0.08x), text size, motion and
contrast. The Speed button in a fight walks the same three speeds and writes
the choice back, so setting it mid-battle sets it for good. Text size is the
awkward one: the stylesheet is written in pixels rather than ems, so growing
the type honestly means scaling the page — `zoom` on the root element at 1.12
and 1.25, which reflows the layout as if the screen were smaller instead of
overflowing it. Reduced motion and high contrast are one data attribute each
on the root, read by a handful of rules at the end of the stylesheet, and
reduced motion also reaches the sprite renderer's own animation switch. The
old lone sound key is carried over the first time the new one is written.

**Three save slots.** Slot one keeps the original key, so anyone who was
already playing is in slot one without a migration; slots two and three are
`creaturecollector.save.2` and `.3`, and one more key remembers which is in
play. Everything in the game that already said `loadSave`/`persistSave` now
means "the slot in play", so the whole app took the change without edits.
The picker shows what is in each: badges, party size, top level, steps and
gold for a journey in progress, or the journeys finished and species caught
for a slot between runs. Switching saves what is in play first. Export and
import work on the slot in play, so a code can be moved from one to another.

## Volatiles and the side's own field (implemented)

The engine knew five major statuses and nothing else, and a fight was two
creatures hitting each other on an empty floor with no memory. Two layers went
in together, because they answer each other: what a creature carries until it
leaves the field, and what its side leaves on the ground.

**Volatiles.** Confusion (two to five turns, a third of them spent hitting
itself), Bind (four or five turns of a squeeze that also holds it on the
field), Taunt (three turns with no status moves), Encore (three turns locked
into what it just used), a Guard that turns the whole turn aside, and a Decoy
that takes a quarter of its owner's health and then takes the hits, the
statuses and the stat drops until it breaks. All of them are dropped the moment
a creature leaves the field. The Guard halves its own odds every time it is
used in a row, so it cannot be the plan; a Decoy is deaf to sound moves and to
the passive that sees through it.

**The side's own field.** Three screens, one per damage type, halving what
comes in for five turns. Three hazards that bite whatever walks in: Caltrops in
one to three layers, Toxic Burrs that poison (and that a grounded Poison type
soaks up and clears), and Stone Shards that scale with the entrant's weakness
to Rock. A Tailwind that doubles the whole side's Speed for four turns, and a
Safeguard that turns the foe's statuses away for five. Sweeping is a damaging
move with a spin on it, which clears your own ground as it lands.

**Eighteen moves** carry it: setters for every one of the above, two binders,
three ways to confuse, a taunt, an encore, a guard, a decoy and a spin. They
are woven into 426 learnset slots by type and class, like for like at the same
level, so the wild and the road use them and not only the shops.

**Forty passives** (the pool is 1,040) read the new state: proof against
confusion, taunts, traps or hazards; a Shadow Hold that keeps the other side
on the field; a Pane Breaker that walks through screens and decoys; passives
that lay their own hazard or raise their own screen as they enter; and three
that lift binding and confusing moves through the existing fx-boost kind.

**Reading it.** A creature's panel carries a badge for each volatile with its
clock (CONF, BIND, TAUNT, ENC, DECOY), and the bar under the arena grew a chip
per side condition, marked ▲ for yours and ▼ for theirs. The party sheet says
plainly when a creature is held and cannot be swapped out.

**The AI** weighs each of them: it will not raise a screen that is already up,
will not lean on a guard twice, taunts a foe that actually carries status
moves, encores one that has just used one, lays hazards while the other side
still has a bench to send in, and only spins when its own ground is dirty.

## Titans (implemented)

Every region had a Warden — a trainer with a team — and nothing above them
until the Council. The Titans sit between: eighteen authored creatures, one per
class, waiting in the lair once you hold that region's badge.

A Titan is a single named creature with an escort at its heel, at the region's
level plus twenty. Both of its passive slots are filled, it carries the greater
charm of its own region, and it opens the fight on the weather or ground its
region is known for: Scarblood brings the sun, Hartfell the grass, Barrowdread
the grit. Its four moves are its own signature (where it has one), the hardest
thing of its types it could know, and two authored ones — a tactic and a field
setter — so each of them plays like something rather than swinging.

It comes once a journey and pays four times a trainer's rate, plus the greater
form of its Warden's charm: the Warden hands over an Ember Charm, Scarblood
leaves a Greater Ember Charm. It cannot be caught.

## Storage that scales (implemented)

The box was a flat list of rows with Withdraw, Info and Release on each, which
is fine at ten creatures and miserable at eighty. It now has a search over
names, species, classes, types and passives, six sort orders (newest, oldest,
level, name, class, stat total), and a Select mode that turns the rows into a
multiple choice: pick all of what the search left, then withdraw or release the
lot in one go, with the same tap-twice confirmation a single release has.
Locked creatures are skipped by a mass release rather than blocking it.

**Teams.** Three saved arrangements of the roster, kept on the journey. Tap an
empty slot to save the party as it stands; tap a saved one to put it back on,
which pulls its members out of the box and sends everyone else back in. A team
remembers uids, so a creature that has been released simply drops out of it.

## Procedural music (implemented)

The sound effects were already made on the fly, so the score is too: no audio
is shipped, and there is nothing to load. A theme is a handful of numbers
hashed out of its own name — a key, one of five modes, a tempo, a waveform and
how busy it is — so the eighteen regions sound like eighteen places without
anyone writing eighteen tunes. A battle drops the key and speeds up; a boss
gets the phrygian mode and a saw wave.

The player is the usual look-ahead scheduler: a timer wakes every 120 ms and
queues whatever notes fall in the next half second, so the timing lives on the
audio clock rather than in `setInterval`'s drift. Bass on the beat, a walk over
the mode above it, and a noise tick for fights. It plays through the same
AudioContext as the sound effects, which is what unlocks it after the first tap.
The Settings screen has it at three levels — Off, Quiet, Full — and Quiet is
where it starts.

## Load time (implemented)

The single file had grown to 2.66 MB and nothing was painted until all of it
had been parsed: on a phone that is a second or two of empty screen. Rather
than guess, the boot was profiled in the browser (Chrome's sampling profiler
driven over CDP) and in Node, and the numbers redirected the work twice.

**What the profile said.** Cold, the browser spent 409 ms in `(program)` —
parsing and compiling the script — and only about 40 ms in our own top-level
code, most of it building the 1,614 part objects. Loading straight into a
journey added roughly 140 ms of world generation and 77 ms of collection. So
the part library was not worth making lazy (40 ms), and neither was the idea
of shipping the species table as JSON: a benchmark of the same 895 records as
an object literal against `JSON.parse` came out at 88 ms versus 84 ms from
navigation, for 24% more bytes. Both ideas were dropped on the evidence.

**A card that paints before the script runs.** The template now carries a
small boot card inside `#app`, which the app clears when it takes over. First
contentful paint went from 456 ms to 60 ms cold, and from 480 ms to 36 ms when
loading into a journey: the same work happens, but the player is looking at
the game's name rather than at nothing.

**A squeeze on the way out.** `build.js` now strips comments and indentation
from the bundle: 2.66 MB to 2.43 MB, about 230 KB less to parse. It is a
scanner rather than a regex, because a `//` inside a string, a slash that
starts a regex and a template literal that spans lines all have to be told
apart, and it never joins lines, so automatic semicolon insertion behaves
exactly as it did. The result is compiled with `new Function` during the build,
so a squeeze that broke the syntax could never reach a browser, and
`node build.js --pretty` keeps the built file readable when you want to read it.

**The world loop.** Generation is 43,008 tiles of jittered Voronoi and value
noise, so everything inside it is paid forty thousand times: the per-tile
closure over the eighteen biomes, the region lookup, and the habitat weight
sum are now worked out once into flat tables. The generated world is byte for
byte what it was — checked by hashing the tile, biome and habitat arrays for
three seeds before and after — since every existing save reads its map back
out of the same seed.

## Mobile view (implemented)

The game was drawn for a phone from the start (portrait layout, 44px targets,
safe-area insets, a pad and an A button, bottom sheets); this pass made it fit
every phone in either orientation and made it installable.

- **Fit.** The fight arena is capped by the viewport height (stage height and
  creature size in `dvh`), the log shrinks, and on screens under 720px tall
  the panels tighten their chips and clamp the passive line to two lines;
  tapping either panel opens that creature's sheet with the full passive, so
  the foe's skill is always readable. The move buttons
  and the Party / Info / Items and Fast / Auto rows sit in a sticky block pinned
  to the bottom of the screen, so a fight never needs a scroll to act. Short
  landscape screens (a phone on its side, under 520px tall) lay the arena beside
  the log and moves, and the map beside its pad, party strip and A button, with
  the map taking most of the height. The encounter card lays foes out in a
  grid (three across for a six-strong tower team) and the whole game sits in a
  760px column on tablets and desktops.
- **Touch.** Every button uses `touch-action: manipulation` (no double-tap
  zoom delay), the map, pad and A button suppress the long-press callout, and
  inputs are 16px on coarse pointers so iOS does not zoom into them.
- **Install.** `manifest.webmanifest` (standalone, any orientation, dark
  theme) with `icons/` rendered by `scripts/icons.mjs` from the game's own
  creature SVG (192, 512, a maskable 512 and an Apple touch icon), plus
  `sw.js`, a network-first service worker that keeps the page, manifest and
  icons for offline play and is registered only over http(s). The single-file
  build still runs on its own from `file:`; the extras only add the home-screen
  install.
- **Check.** `node scripts/mobile-audit.mjs` drives the intro, starters, map,
  tower, encounter, fight (with its Info sheet), party, creature sheet, minimap
  and market at 360×640, 390×844, 430×932, 844×390 and 1024×768, fails on any
  sideways scroll or if the map with its pad, or a fight's move buttons, fall
  outside the first screen, and writes `shots/mobile/*.png` for review.

## Bond (implemented)

A creature picks something up from travelling with you that a creature in a
box does not. Bond is points on the party member, not a stat on the genome: two
for a battle it fought and won, three a level, twelve for a Warden, a Titan,
the Council or a Trial, and fifteen back when it faints. Five tiers sit on top
of that — New, Willing at 40, Trusted at 110, Sworn at 220, Inseparable at 340
— and each buys one thing the coach and the Rookery cannot sell: a status shaken
off once a battle, a knockout survived at 1 HP once a battle, critical hits half
again as often, and at the top 1.05× on every stat.

Only the player's own creatures ever carry one. Wild creatures, trainers,
Wardens and the tournament simulator all fight at zero, so the 40–60% band the
tuner keeps is measuring the same game it always was. `bondPerks` reads points
and resolves the tier itself, so there is one place that decides what a number
of points is worth and no caller can pass the wrong kind of number.

## Move effects on screen (implemented)

A move that lands now throws something over the creature it hit. Nothing is
drawn ahead of time: an effect is a handful of `<i>` spans on a layer over the
target's stage, coloured by the move's own type through a CSS variable and
animated once by the stylesheet. Eighteen types map onto twelve shapes — a
burst, embers, a splash, sparks, leaves, shards, chunks, a gleam, bubbles,
wisps, rings and gusts — so the colour carries the type and the shape carries
the feel. A critical hit brightens the pieces and a super-effective hit adds a
glow; nothing about the effect changes what happened.

Every effect runs a single pass and is gone inside 600 ms, and the layer is
removed after it. Reduced motion — the system setting or the game's own — skips
them entirely rather than shortening them.

## Getting around without a touchscreen (implemented)

The game was built for a phone, and a few things only a finger could do had
crept in. This pass made the keyboard a first-class way to play.

- **One dialog behaviour, shared.** `src/ui/a11y.js` holds what a bottom sheet
  owes its reader: focus moves into it when it opens, Tab cannot walk out of
  it, Escape closes it, and focus goes back to whatever opened it. Behind it
  the rest of the page is marked `inert`, so a screen reader reads the dialog
  and nothing else. All six dialogs use it — the creature sheet, the three
  fight sheets, the overworld sheets and the in-map dialog — and the two that
  must be answered (a forced switch, and the map dialog while it is up) simply
  withhold `onEscape`.
- **Focus survives a redraw.** Closing a sheet usually redraws the screen
  underneath it, so the button that opened it is a different node by the time
  focus goes home. The restore looks for a control with the same name and tag
  and lands there instead of dropping the reader at the top of the page.
- **The map stopped stealing keys.** The overworld listens on `window` for
  Enter and Space to interact; that also swallowed Enter on whatever button had
  the focus, so the HUD could be reached by Tab but never pressed. It now
  leaves a focused control alone.
- **A ring you can see.** There was no focus styling at all, and one rule that
  removed the browser's. There is now one `:focus-visible` ring everywhere,
  drawn outside the shape so it never moves a layout, with a `forced-colors`
  variant.
- **The battle in words.** HP bars carry a spoken label kept in step with the
  bar ("Ghastshell: 12 of 48 health, 25 percent"), weather, terrain, screens
  and hazards each say which side they are on and how many turns are left, and
  the short volatile badges (CONF, BIND, ENC) carry their full names. The log
  was already a polite live region.
- **Nothing flashes.** Every move effect runs once; the fastest repeating
  animation in the stylesheet is a 1.3 s wingbeat, well under three a second,
  and both the system setting and the game's own Motion setting stop all of it.

## The look: a field guide on a dark ground (implemented)

The interface the game grew up with was a blue-grey slate: every list a rounded card, every surface the same
two greys, and one yellow marking prices, locks, evolution stages and primary buttons all at once, so the eye
could not tell money from importance. Three directions were drawn up as boards and this one was built.

**The idea.** A naturalist's plate book, worked on a dark ground. A mezzotint is engraved the other way round
from a line plate — the ground starts black and the engraver works up into the light — and that is the whole
logic of the theme: **light is the emphasis**, not an accent colour. Which frees the accent, so the three
signals stay separate and nothing carries two jobs at once:

- **brass** is money, and only money;
- **ember** is the action in hand, and only that — a shop's buy buttons are transactions rather than the
  action a screen is asking for, so they take the brass instead;
- **brightness** is importance: a creature's best stat is simply its brightest measure.

**The frame is drawn, not bordered.** One SVG carries four corners and four repeating edges, applied with
`border-image` so the corners hold their shape while the edges tile. The outer rule turns square with a hair
of a radius, the inner rule chamfers off at 45 degrees the way an engraved plate does, and a lozenge sits in
the triangle the chamfer leaves. The line wanders about a third of a pixel, which is what makes it read as
ink rather than as a 1px border, and the caps are butt rather than round because a round cap stacking where
the corner meets its edge tile blots the seam at any magnification. It goes on the two surfaces that really
are plates: the fight stages and the creature sheet's hero. The ornament scales with the box, so a stage
squeezed into a short screen gets a slimmer frame.

**What dark changed, beyond the palette.** A light hairline on dark blooms — the eye takes a light shape on
dark as heavier than the same shape reversed — so the rules keep their geometry and lose value instead: the
weights barely move from the paper study and the opacity does the work. The rules between list rows go
entirely, because on a dark ground the contrast already separates them; rows come in shorter than the cards
they replace, so the market's 266 rows got denser rather than looser. Bars became instrument scales: a
hairline track with quarter ticks and a solid measure that covers the ticks it has passed. Health keeps its
traffic light, because that reading is worth more than tidiness, but in the theme's own inks.

**Type colour.** The eighteen type colours move off filled pills and onto an 8px swatch beside tracked caps:
the ink carries the word, the colour carries the meaning, and no type colour has to pass a text-contrast bar.
They needed no migration at all — they were already tuned for a dark ground. The paper study, by contrast,
had to darken every one of them.

**Two themes, one set of tokens.** `guide` is the default and `slate` is the interface the game shipped with,
kept whole under Settings → Look. Every structural rule is written under `html:not([data-theme="slate"])`, so
slate reads exactly as it always did; the theme is one attribute on the root, the same mechanism type size,
motion and contrast already used. Every ink in the guide clears WCAG AA against the lit panel, which is the
tighter of its two grounds: fg 13.4:1, fg2 5.8:1, fg3 4.9:1, ember 5.0:1, brass 7.7:1. The dim ink went up
two steps from where it first looked right — it carries item descriptions and battle-log history, which are
body text however quiet they are meant to be.

The world keeps its own colours. The map is drawn on a canvas from the eighteen region palettes, and those
are the world rather than the chrome; only the shell around it joins the theme.

`node scripts/theme-fieldguide.mjs` still draws the study board the theme came from, and `light` draws the
paper variant it was compared against.

## A deeper AI for the fights that matter (cut)

Wardens, Titans and the Council pick their move with the same one-ply heuristic
as a wild creature, so a two-ply search — score my move, then the best reply to
it, with a switch-out term and an urgency term for a creature about to be
knocked out — looked like an easy way to make the big fights read as
deliberate. It was built and measured, and it did not survive the measurement.

A parameter sweep on one seed suggested +8.3 points of win rate. Fresh seeds
gave −1.0 and +2.5. A pooled run of 800 games a side gave +1.0 for search with
urgency and +1.4 for urgency alone, against a standard error of about 2.5 —
indistinguishable from the one-ply heuristic it was meant to beat, at several
times the cost per turn. It was cut on the evidence rather than shipped, and
this note is here so nobody builds it twice.

## Polish and balance (Phase 5 — implemented)

Balance was done with the two simulators, not by feel:

- A whole-run simulator drove the first tuning while the game was an endless
  arena (it went with the arena). What it settled stays: every species
  learnset follows one curve (a real STAB move by level 6, four moves by 11,
  coverage in the 20s and 30s, nukes in the 50s) and an XP constant that keeps
  low levels pacing the wild level. Starters set out at level 5.
- `node scripts/sim.mjs` tournaments (800–1200 games, level 50, 3v3) gave a
  species spread of roughly 36%–67%. Extremes were compressed with base stat
  totals and a few stat weights; Grass and Bug species remain at the bottom
  because the type chart resists them widely, which is faithful to the source
  material. HP gets a global 1.15× lift so battles last about eight turns.
- Move learning: members keep their own four moves. Levelling into a new move
  fills an empty slot or queues a prompt on the map screen asking which move
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
