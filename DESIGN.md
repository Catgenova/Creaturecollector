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
src/data/parts/       the part library, one file per slot, plus the registry (index.js)
src/data/species.js   base species recipes
src/creature/         genome (schema, rolls, codes), palette, render (SVG)
src/ui/               dom helpers, screens (lab, parts), app shell (main.js = build entry)
tests/                node:test suites
scripts/              screenshot helpers for visual review (Playwright, dev only)
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
stats   { hp, atk, def, spa, spd, spe }     weights; base stats = weights normalised × bst
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
right, in the units of a 200-wide canvas. Bodies define sockets; heads define
face sockets; a body also carries `face` sockets for headless creatures.

Colour roles: `p/pd/pl`, `s/sd/sl`, `a/ad/al`, `w/wd`, `e/ed`, `k`. The root SVG
sets `--c1..--c3` (+ shade/highlight), `--e`, `--ol`, `--w`; each slot group
remaps `p/s/a` onto those through its paint gene; far-side copies remap onto the
shade variants. Outlines come from one CSS rule (`.cr .o`) with
`paint-order: stroke` for the sticker look.

Draw order back to front: wings, tail, back feature, legs, arms, body
(+ clipped pattern, + face when headless), head (crown behind skull, eyes, mouth).
Limbs sit behind the body so their roots are hidden by the silhouette.

The frame is fixed (200 × 230, ground at y = 208) so sizes are comparable.
`opts.fit` crops to the creature's bounds, computed from part coordinates, for
hero shots. Animation is CSS only: idle bob, tail sway, wing flap; disabled
under `prefers-reduced-motion`.

### Adding a part (the library is meant to grow a lot)

1. Add an entry to the slot's file in `src/data/parts/`. Use the DSL in `_dsl.js`:
   `P(path, role, opts)`, `E(cx,cy,rx,ry, role)`, `C(cx,cy,r, role)`, `L(path, role, width)`.
2. Draw facing right with the origin at the attachment point. Legs hang down with
   the sole at `y = len`. Crowns extend their bases to about `y = 10` (hidden by
   the skull). Wings and tails extend to the left.
3. Give it a stable `id` (`slot.name`), a `name`, a `dom` (dominance 0..1, used by
   fusion) and `w` (weight when rolled as a mutation). Add `fit` if it only suits
   some body kinds, and `tags` for flavour.
4. Run `npm test` (validates fields and renders it on the mannequin), then open
   the Parts tab to eyeball it.

Never rename or reuse an id: saved creatures reference ids forever.

## Fusion (Phase 2 — next)

`fuse(a, b, rng) -> child`:
- Parts: per slot, take one random allele from each parent; the higher dominance
  (plus a small random tiebreak) is expressed. Small mutation chance per slot.
- Body: same rule; parts that no longer fit fall back as above.
- Paint: per slot, inherit the paint gene from whichever parent supplied the
  expressed allele.
- Palette: per colour, inherit from one parent or blend (short way round the hue
  wheel) with a little noise; eye colour from one parent.
- Traits: blend with noise, clamped.
- Types: primary from one parent, secondary from the other (dedupe; may end up
  mono-typed).
- Stats: average the weights, renormalise; `bst` = mean of parents + a small
  generation bonus capped at gen 5. Fusion changes shape, not raw power.
- Name: portmanteau at a syllable boundary. `gen` = max(parents) + 1.
  `lineage` = merged, most recent 16.
- Fusion consumes both parents (party stays bounded, decisions matter).

## Battle (Phase 3)

Pure engine: `step(state, actions, rng) -> { state, events }`. UI plays events
back. Classic damage formula with STAB, type chart, crits, accuracy, stat
stages, burn/poison/paralysis/sleep/freeze, priority, switching, parties of 5.
A headless simulator runs thousands of battles for balance. Moves are a
hand-authored table (~80) with a small set of effect templates; a creature's
learnable pool is filtered by its types. Abilities are hooks on engine events.

## Arena and save (Phase 4)

Endless floors with rising level and party size, fusion altar between floors,
capture on weakened wild creatures, run ends on wipe. Save in localStorage with
a versioned schema plus export/import strings. Team codes for sharing.

## Later

Overworld (tile map, movement, encounters, NPC dialogue, story beats), sound
(WebAudio), Fusiondex, single-file distribution stays.

## Limitations to keep in mind

- Art ceiling is set by the part library; iterate with the Parts tab.
- Balance is formulaic (budgets + chart), verified by simulation, not hand-tuned.
- No backend: no accounts, no online play. Sharing is via codes.
- Determinism depends on every roll going through `makeRng`; never use
  `Math.random` in game logic.
