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
- **Balance.** Rares gained a strong move at 50, so the tuner ran again after
  this patch; see the balance note at the end of the content patches.

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
  species. The Fusions tab is the collection's fused creatures; the Rewards
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
