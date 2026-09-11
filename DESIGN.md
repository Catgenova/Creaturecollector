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
| Game frame | The overworld: a seeded map with seven class biomes, trainers, Wardens and the Council. It started as an endless arena, which was removed once the overworld shipped; the capture, XP, party and collection systems carried over. |
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
  move (`src/data/moves.js`, 157 moves, original names).
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
  capped at 95%. Three shake checks at the cube root of the odds. A capture
  costs the turn; success ends the battle as a win.
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
Bird, Insect, Invertebrate or Amphibian. Types stay elemental and independent.

- **Fusion is same-class only.** `canFuse(a, b)` is the single rule; `fuse()`
  throws otherwise. The shrine greys out incompatible partners
  and say why. Wild fusions and Warden leaders are built inside one class.
- **Linked slots** keep each class's silhouette coherent: the second slot of a
  pair inherits from whichever parent supplied the first. Mammals and
  amphibians link legs and arms, reptiles back and tail, fish body and tail,
  birds wings and tail, insects wings and back, invertebrates arms and legs.
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

One wild creature in a thousand (`WILD_ELEMENTAL.chance` in `world.js`, rolled in
`wildSpawn`) is born of an element; the encounter card and the fight view
announce it.

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
  all seven classes has hand-authored stages (590 parts).
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

- **Map.** 112 × 96 tiles: grass, habitat, path, wall, water, hub, lair, door,
  camp, spire, spire door, shrine (`TILE`). The Crossroads hub sits in the
  middle (a disc of paving with a camp, the fusion shrine and the Council
  Spire's door). Seven biome centres sit on a ring around it, clockwise from
  the south, one per class in difficulty order (`BIOME_ORDER`: mammal 5,
  amphibian 12, insect 20, bird 28, fish 36, invertebrate 44, reptile 52 =
  the wild level at the lair, `REGIONS`). Tiles take the nearest centre through jittered
  coordinates so borders wander. Terrain is value noise per biome: water
  (more in the fen and lagoon), walls drawn as that region's trees, reeds,
  hedges, pines, palms or rocks, and habitat patches. Roads are carved in two
  bent legs from the hub to each camp, on to each lair, and around the ring;
  a final pass carves straight roads to anything still unreachable, so every
  camp, lair door, the spire and the shrine are always walkable from the start.
- **Habitats and spawns.** A habitat patch carries one element type, chosen
  per 6 × 6 cell from the types of the biome's class weighted by how many of
  its species have them. `wildSpawn` weights every wild species by affinity
  (3 for the home class, +2 for the patch's type; strangers 0.03) times tier
  rarity (common 1, uncommon 0.45, rare 0.12), so stronger species are rarer.
  Level: the local level ±2, where `levelAt` starts every biome at level 1
  to 4 at the hub's edge (a tenth of the region's level, clamped) and deepens
  to the full level at its lair, so the first steps out of town meet level 1 to
  5 creatures and the deepest lairs the fifties; 14% a few levels higher and
  4% an **alpha** (worth Warden XP), both boosts scaling with the area (up to
  +6 and +14). The 1/1000 Elemental roll applies. Each
  habitat step has a 12% encounter chance, with a four-step cooldown after a
  fight; rolls are seeded by the step count so a replayed save spawns the same.
- **Trainers.** Four per biome, standing on the road (three on the way in,
  one before the lair). Talking to one shows their line and a Fight / Not now
  choice; a beaten trainer only chats. Teams of 2–4 led by the home class
  (others 75% home), at the local level where they stand. Trainers block their tile; roads are
  two wide.
- **Wardens.** One lair per biome. The Warden's team is five of the class:
  a gen-2 fusion leader at area level +6 and four more at +3/+4. Winning earns
  the region's badge (once); rematches are free. Camps (the biome centre and
  the hub) heal fully and set the respawn point.
- **Council.** The spire opens with seven badges: four fights back to back
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
  position (`owKeepScroll`).
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
  level, seven badge dots, gold and Party / Bag / Map / Menu sheets (party order
  and the learn-move prompt, a minimap with camps, lairs, trainers
  and the spire, fast battles, return to camp, export/import, abandon). An
  encounter shows a card with the foes and Fight / Run before the fight view.

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
