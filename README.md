# Creature Collector

A mobile-first HTML creature battler with procedural monster fusion. No
dependencies; the whole game ships as a single `index.html`.

**Play:** open `index.html` in a browser, or serve the repo root
(GitHub Pages from `main` works as is).

## Status

Phase 1 — Creature Lab: seeded procedural creatures assembled from a part
library, with recolouring, diploid part genes, species, stats and shareable
creature codes.

Phase 2 — Fusion Lab: fuse any two creatures, read the inheritance report,
feed children back into the pool, stress-test five generations.

Phase 3 — Battle: a deterministic, headless battle engine (157 moves, 30
abilities, status, stages, switching, parties of five, AI opponent, balance
simulator) and a portrait battle screen.

The endless arena with capture and saving is next. See `DESIGN.md` for the
plan and the decisions behind it.

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

Balance report: `node scripts/sim.mjs [games] [level] [partySize] [seed]` runs
AI-vs-AI tournaments and prints win rates by species and type.

Visual review: `node scripts/shot.mjs [seed]` screenshots the Lab, a detail
sheet and the Parts tab at phone size into `shots/` (needs Playwright installed
globally or locally; dev only).
