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
  moves), random 85–100%, STAB 1.5, chart effectiveness, burn halves physical.
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

## Later

Balance pass with the simulator, more parts and species, sound (WebAudio),
move-learning choices, trainer personalities, and then the overworld: tile map,
movement, encounters, NPC dialogue, story beats. Single-file distribution stays.

## Limitations to keep in mind

- Art ceiling is set by the part library; iterate with the Parts tab.
- Balance is formulaic (budgets + chart), verified by simulation, not hand-tuned.
- No backend: no accounts, no online play. Sharing is via codes.
- Determinism depends on every roll going through `makeRng`; never use
  `Math.random` in game logic.
