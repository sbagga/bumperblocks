# Copilot Instructions — NumberBlocks Designer

## Project Overview

Single-page PixiJS 7 (WebGL) children's block game. No build tools, no ES modules.  
All code lives in `js/*.js` loaded via plain `<script>` tags in `index.html`.
Do not display so  much text while generating code. Limit your output to critical points only. 

## Quick File Reference

| File | Key Globals | Purpose |
|------|-------------|---------|
| `js/constants.js` | `UNIT`, `BLOCK_COLORS`, `getBlockColor()`, `getBlockLayout()`, `getBlockDimensions()`, `hslToRgb()`, `lerpColor()`, `shadeColor()`, `easeOutBack()` | Pure data & utilities |
| `js/app.js` | `app`, `appWidth`, `appHeight`, `bgLayer`, `nightSkyLayer`, `blockLayer`, `effectLayer`, `wreckLayer`, `birdLayer`, etc. | PIXI app + 10 layers |
| `js/sound.js` | `playSpawnPop()`, `playDeletePoof()`, `playBubbleBurst()`, `playPuckSound()`, `playSmashSound()`, `playBlockSmashSound()`, `playBounceSound()` | Web Audio synth |
| `js/sky.js` | `sunContainer`, `moonContainer`, `allStars`, `shootingStars`, `nightOverlay`, `horizonGlow`, `getDayPhase()`, `SUN_CYCLE_DURATION`, `drawSun()`, `drawSunRays()`, `drawHorizonGlow()`, `spawnShootingStar()` | Day/night cycle |
| `js/environment.js` | `bgSprite`, `treeSprite`, `treeShadowGfx`, `grassBlades`, `grassBackGfx`, `birds`, `spawnBird()` | Scenery |
| `js/blocks.js` | `blocks`, `createBlock()`, `removeBlock()`, `fuseBlocks()`, `renderBlock()`, `drawFace()`, `setBlockExpression()`, `getBlockCenter()`, `updateBlockShadows()` | Core gameplay |
| `js/wrecking.js` | `wreckMode`, `wreckState`, `debrisList`, `toggleWreckMode()`, `placePin()`, `releaseWreckingBall()`, `wreckBlock()`, `spawnDebris()` | Destruction mode |
| `js/game-loop.js` | `clearAll()` (on window) | Main ticker + init |

## Architecture Notes

- **Load order matters**: `constants → app → sound → sky → environment → blocks → wrecking → game-loop`
- **Global scope**: All `let`/`const`/`var`/`function` at top level are shared across script files
- **`window.*`**: Only used for functions called from HTML `onclick` attributes (`clearAll`, `toggleWreckMode`, `releaseWreckingBall`)
- **Single ticker**: Everything animates in one `app.ticker.add()` callback in `game-loop.js`

## Common Modification Patterns

### Adding a new sound effect
1. Add function in `js/sound.js` using Web Audio oscillators/noise
2. Call it from the relevant system file

### Adding a new visual element
1. Pick the correct layer (see ARCHITECTURE.md layer table)
2. Create Graphics/Sprite in the relevant system file
3. Add per-frame updates in `js/game-loop.js` ticker

### Changing day/night timing
- Edit `SUN_CYCLE_DURATION` in `js/sky.js` (currently 120000ms = 2 min)
- Phase boundaries are in `getDayPhase()` in `js/sky.js`

### Adding a new block feature
- Block data model is in `createBlock()` in `js/blocks.js`
- Visual rendering is in `renderBlock()` same file
- Per-frame animation goes in the ticker in `js/game-loop.js`

## Mobile Version

A touch-optimized mobile version lives in `mobile/`. It reuses all game scripts  
from `js/` via relative paths (`../js/`), adding only mobile-specific layers:

| File | Purpose |
|------|---------|
| `mobile/index.html` | Full-screen HTML shell, floating toolbar, no header bar |
| `mobile/js/mobile-config.js` | Patches CONFIG for mobile (smaller units, no header, responsive sizing) |
| `mobile/js/mobile-ui.js` | Onboarding overlay, FAB toolbar, difficulty modal, touch fixes |

**Load order**: `config → difficulty.config → mobile-config → constants → app → ... → game-loop → mobile-ui`

### Modifying mobile behavior
- **Screen-size adjustments**: Edit `mobile/js/mobile-config.js` breakpoints/values
- **Touch UI / buttons**: Edit `mobile/js/mobile-ui.js` and `mobile/index.html` CSS
- **Game logic changes**: Edit `js/*.js` — changes automatically apply to both desktop and mobile

### Key mobile-desktop differences
- No header bar (CONFIG.app.headerHeightInPixels = 0)
- Smaller block units on phones (36-42px vs 48px)
- Floating action buttons instead of header toolbar
- Onboarding overlay for first-time users
- Default zombie difficulty lowered (2 vs 3)

See: [mobile/MOBILE_ARCHITECTURE.md](../mobile/MOBILE_ARCHITECTURE.md)

## Design Docs

- [ARCHITECTURE.md](../ARCHITECTURE.md) — Layer system, file map, design principles
- [docs/DAY_NIGHT_CYCLE.md](../docs/DAY_NIGHT_CYCLE.md) — Phase timing, sun/moon arc math, constellation data
- [docs/SYSTEMS.md](../docs/SYSTEMS.md) — Block, wrecking ball, sound, environment details
- [mobile/MOBILE_ARCHITECTURE.md](../mobile/MOBILE_ARCHITECTURE.md) — Mobile version architecture
