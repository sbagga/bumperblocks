# Bumper Blocks — Mobile Architecture

## Overview

The mobile version is a **full-screen, touch-optimized** variant of Bumper Blocks.  
It reuses **100% of the game logic** from the desktop version via shared `<script>` tags,  
with a thin mobile-specific layer on top for config overrides and touch UI.

## File Structure

```
mobile/
├── index.html              ← Mobile HTML shell (no header, full-screen, floating buttons)
├── MOBILE_ARCHITECTURE.md   ← You are here
└── js/
    ├── mobile-config.js     ← Patches CONFIG for mobile (smaller units, no header, etc.)
    └── mobile-ui.js         ← Onboarding, floating toolbar, difficulty picker, touch fixes
```

## How It Works

### Script Load Order (mobile/index.html)

```
PixiJS CDN
  → ../js/config.js            ← Creates global CONFIG object
  → ../js/difficulty.config.js ← Creates global DIFFICULTY object
  → mobile-config.js           ← ★ Patches CONFIG + DIFFICULTY for mobile
  → ../js/constants.js         ← Reads CONFIG (now mobile-patched)
  → ../js/app.js               ← Creates PIXI app (headerHeight = 0 → full screen)
  → ../js/sound.js             ← All sounds (reused as-is)
  → ../js/sky.js               ← Day/night cycle (reused as-is)
  → ../js/environment.js       ← Background, tree, grass, birds (reused as-is)
  → ../js/blocks.js            ← Blocks, faces, drag/drop, fuse (reused as-is)
  → ../js/zombies.js           ← Zombie system (reused as-is)
  → ../js/wrecking.js          ← Wrecking ball (reused as-is)
  → ../js/game-loop.js         ← Ticker, init, clearAll (reused as-is)
  → mobile-ui.js               ← ★ Mobile touch UI overlay
```

**Key insight**: `mobile-config.js` loads between `difficulty.config.js` and `constants.js`.  
It mutates the global CONFIG before any game code reads from it. This means all mobile  
adjustments (smaller blocks, no header, fewer starter blocks) are applied transparently.

### What mobile-config.js Changes

| Setting | Desktop Default | Mobile (Small) | Mobile (Medium) |
|---------|----------------|----------------|-----------------|
| `headerHeightInPixels` | 58 | 0 | 0 |
| `unitSizeInPixels` | 48 | 36 | 42 |
| `fuseBaseDistanceInPixels` | 60 | 50 | 55 |
| `sun.bodyRadius` | 40 | 30 | 40 |
| `moon.bodyRadius` | 30 | 22 | 30 |
| `starterBlocks` | 5 blocks | 3 blocks | 4 blocks |
| `DIFFICULTY.defaultLevel` | 3 | 2 | 2 |

Screen breakpoints:
- **Small**: width < 480px (most phones)
- **Medium**: width < 768px (large phones, small tablets)
- **Large**: width ≥ 768px (tablets — uses near-desktop values)

### DOM Compatibility

The mobile HTML provides all DOM elements that existing game scripts expect:

| Element ID | Desktop Location | Mobile Location | Notes |
|------------|-----------------|-----------------|-------|
| `gameContainer` | Main div | Full-screen fixed div | Same structure |
| `wreckBtn` | Inside gameContainer | Inside gameContainer | Position: fixed on mobile |
| `wreckModeBtn` | Header button | FAB toolbar button | Same ID, different styling |
| `nightModeBtn` | Header button | FAB toolbar button | Same ID, different styling |
| `difficultySelect` | Header dropdown | Hidden select + modal | Modal UI, hidden select for compat |

### Mobile UI Features

1. **Floating Action Bar (FAB)**: Bottom-center toolbar with circular buttons  
   - Auto-hides after 6 seconds of inactivity  
   - Stays visible during wreck mode  
   - Tap anywhere to show when hidden

2. **Onboarding Overlay**: First-time user guide  
   - Shows touch-specific instructions (tap, drag, long-press, split)  
   - Persisted in localStorage — only shows once  
   - Unlocks AudioContext on dismiss

3. **Difficulty Picker**: Full-screen modal  
   - Replaces the desktop `<select>` dropdown  
   - Touch-friendly large hit targets

4. **Mini HUD**: Subtle top banner  
   - Logo + rotating hints  
   - Non-interactive (pointer-events: none)

5. **Touch Enhancements**:  
   - Prevents double-tap zoom  
   - Prevents pull-to-refresh  
   - Prevents pinch-zoom  
   - Safe area insets for notched phones  
   - Orientation change detection (reloads)  
   - AudioContext unlock on first touch

### What's Reused vs. New

| Component | Source | Notes |
|-----------|--------|-------|
| Block rendering | `js/blocks.js` | Reused — smaller via CONFIG.grid.unitSizeInPixels |
| Drag & drop | `js/blocks.js` | Reused — touch already works (PixiJS pointer events) |
| Long-press delete | `js/blocks.js` | Reused — already implemented |
| Block splitting | `js/blocks.js` | Reused — drag dead zone enlarged for touch |
| Block fusing | `js/blocks.js` | Reused — fuse distance adjusted |
| Day/night cycle | `js/sky.js` | Reused entirely |
| Trees, grass, birds | `js/environment.js` | Reused — grass/tree scaled via CONFIG |
| Sound effects | `js/sound.js` | Reused — AudioContext unlock added |
| Wrecking ball | `js/wrecking.js` | Reused — touch drag works natively |
| Zombies | `js/zombies.js` | Reused — default difficulty lowered |
| Game loop/ticker | `js/game-loop.js` | Reused entirely |
| **HTML/CSS shell** | — | **New** — mobile-first layout |
| **Touch UI layer** | — | **New** — FAB, modal, onboarding |
| **Config overrides** | — | **New** — responsive sizing |

## Running Locally

```bash
# From the project root, serve with any static server:
python3 -m http.server 8080

# Then open on a mobile device or emulator:
# http://<your-ip>:8080/mobile/
```

## Future Enhancements

- Dynamic PIXI app resize (instead of reload on orientation change)
- Haptic feedback via `navigator.vibrate()` on fuse/wreck
- PWA manifest + service worker for offline play
- Performance profiling for low-end mobile GPUs
- Adaptive grass/star density based on device capability
