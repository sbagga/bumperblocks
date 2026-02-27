# NumberBlocks Designer — Architecture

A playful block-stacking & fusing game rendered entirely with **PixiJS 7** (WebGL).

---

## File Map

```
bumperblocks/
├── index.html              ← HTML shell: header UI, CSS, <script> includes
├── ARCHITECTURE.md          ← You are here
├── index-original.html      ← Pre-migration DOM backup (reference only)
│
├── .github/
│   └── copilot-instructions.md  ← Quick-reference for AI agents
│
├── docs/
│   ├── DAY_NIGHT_CYCLE.md   ← Phase timing, constellation data, moon/sun arcs
│   └── SYSTEMS.md           ← Block, wrecking ball, sound, environment details
│
└── js/                      ← All game code (plain <script> tags, shared global scope)
    ├── constants.js          ← Pure data: sizes, colors, layouts, utility functions
    ├── app.js                ← PIXI.Application, 10-layer Container hierarchy
    ├── sound.js              ← Web Audio API — all procedural sound effects
    ├── sky.js                ← Sun, moon, stars, constellations, shooting stars, night overlay
    ├── environment.js        ← Background texture, coconut tree, grass blades, birds
    ├── blocks.js             ← Block CRUD, face drawing, drag/drop, fuse, shadows
    ├── wrecking.js           ← Wrecking ball pendulum, debris particles, collisions
    └── game-loop.js          ← Main ticker loop, per-frame updates, init & clearAll
```

## Script Load Order

Scripts are loaded as **plain `<script>` tags** (no ES modules, no bundler).  
Order matters — each file may reference globals from earlier scripts.

```
PixiJS CDN  →  constants  →  app  →  sound  →  sky  →  environment  →  blocks  →  wrecking  →  game-loop
```

## Rendering Pipeline

| Layer (bottom → top) | Container        | Contents                          |
|----------------------|------------------|-----------------------------------|
| 0                    | `bgLayer`        | Background sprite, night overlay, horizon glow, sun |
| 1                    | `nightSkyLayer`  | Stars, constellation lines, moon, shooting stars    |
| 2                    | `treeShadowLayer`| Tree shadow ellipse                                 |
| 3                    | `treeLayer`      | Coconut tree sprite                                  |
| 4                    | `grassLayer`     | Grass backing rect + individual blades               |
| 5                    | `blockShadowLayer`| Per-block shadows                                   |
| 6                    | `blockLayer`     | Block containers (sortable by zIndex)                |
| 7                    | `effectLayer`    | Fuse flashes, smash flashes, debris particles        |
| 8                    | `wreckLayer`     | Pin, chain, wrecking ball                            |
| 9                    | `birdLayer`      | Bird V-shapes                                        |

## Key Design Decisions

1. **Single game loop** — One `app.ticker.add()` callback drives everything.  
   No scattered `requestAnimationFrame` calls.

2. **Graphics reuse** — Objects like sun, moon, chain, debris trails call `.clear()` + redraw  
   rather than creating new Graphics each frame.

3. **No external assets** — All visuals are procedural (PIXI.Graphics, SVG→canvas→texture).  
   All sounds are synthesized via Web Audio API oscillators + noise buffers.

4. **Flat global scope** — No module system. All variables are in the global lexical scope.  
   Cross-file communication is via shared globals. `window.*` is only used for  
   functions called from HTML `onclick` attributes.

5. **Layer-based z-ordering** — Instead of managing z-index per sprite, content is placed  
   into the correct Container layer. Only `blockLayer` uses `sortableChildren`.

## Performance Principles

1. GPU-batched rendering via WebGL (PixiJS).
2. Single ticker loop — no duplicate RAF calls.
3. Graphics objects reused (clear + redraw) not recreated per frame.
4. Destroyed objects properly `.destroy()`'d and removed from parent containers.
5. Constellation geometry drawn once; only alpha/scale change per frame.
6. Debris and birds are pooled-style: created on demand, destroyed when done.
