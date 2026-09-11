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

Battles are next. See `DESIGN.md` for the plan and the decisions behind it.

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

Visual review: `node scripts/shot.mjs [seed]` screenshots the Lab, a detail
sheet and the Parts tab at phone size into `shots/` (needs Playwright installed
globally or locally; dev only).
