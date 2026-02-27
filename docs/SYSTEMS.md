# Game Systems Reference

Detailed documentation for the block system, wrecking ball, sound engine, and environment.

---

## Block System (`js/blocks.js`)

### Data Model

Each block is an object:

```js
{
  id: number,              // Unique auto-incrementing ID
  value: number,           // Numeric value (1–∞), determines color, size, layout
  container: PIXI.Container,
  expression: 'happy' | 'angry' | 'sad' | 'irritated',
  faceGfx: PIXI.Graphics,
  cubesGfx: PIXI.Graphics,
  labelText: PIXI.Text,
  shadowGfx: PIXI.Graphics,
  fuseZoneGfx: PIXI.Graphics,
  _spawnAnim: 0–1,         // Spawn scale animation progress
  _deleteAnim: -1 | 0–1,   // Delete animation (-1 = not deleting)
  _fuseAnim: 0–1,          // Fuse highlight animation (optional)
}
```

### Layout Rules

- Values 1–10 have **hand-crafted layouts** (see `getBlockLayout`).
- Values > 10 use an **auto-grid** based on `ceil(sqrt(n))` columns.
- Each cell is `UNIT × UNIT` (48×48 px).

### Colors

- Values 1–20 have a fixed color map (`BLOCK_COLORS`).
- Values > 20 generate colors via HSL with `hue = (n*37) % 360`.

### Faces

Drawn procedurally on the top-center cube:

| Expression | Trigger |
|------------|---------|
| Happy      | Default, idle |
| Angry      | Block is dragged fast (velocity > 1.5) |
| Irritated  | Nearby block being dragged (eye-tracking toward dragger) |
| Sad        | Block is being deleted |

### Drag & Fuse

1. **Pointer down** → start drag, set `zIndex = 1000`, cursor → `grabbing`
2. **Pointer move** → clamp to canvas, track velocity, update proximity expressions
3. **Nearby detection** → `FUSE_DISTANCE + (valueA + valueB) * 5` pixels
4. **Pointer up + fuse target** → merge: delete both blocks, create new block at midpoint  
   with `value = valueA + valueB`, play fuse sound + flash effect
5. **No fuse target** → drop in place, reset expressions

### Shadows

- Each block has a shadow `PIXI.Graphics` in `blockShadowLayer`.
- Shadow direction/length/skew computed from sun position.
- Hidden at night (alpha → 0).

---

## Wrecking Ball System (`js/wrecking.js`)

### Components

| Part    | GFX Type        | Description |
|---------|-----------------|-------------|
| Pin     | PIXI.Graphics   | Grey circle (r=7) — pivot point |
| Chain   | PIXI.Graphics   | Line + 6 link circles between pin and ball |
| Ball    | PIXI.Graphics   | Dark circle (r=25) with highlight |

### Physics Model

Pendulum simulation:

```
angularAccel = -(GRAVITY / chainLen) * sin(angle)
angularVel   += angularAccel
angularVel   *= DAMPING (0.997)
angle        += angularVel

ballX = pinX + sin(angle) * chainLen
ballY = pinY + cos(angle) * chainLen
```

- `GRAVITY = 0.0015`
- Ball bounces off canvas edges (velocity reversal × 0.5)
- Swing stops when `angularVel < 0.0003` and `angle < 0.02` after 60+ frames

### Collision Detection

Each frame during swing, check all blocks:
```
dist(ball, blockCenter) < WB_RADIUS + 10 + blockRadius
```
Hit blocks are **wrecked** → debris spawned.

### Debris Particles

- One debris per cube in the wrecked block's layout
- Physics: gravity (0.15), friction (0.985), bounce (0.55)
- Bounce off all 4 canvas edges with sound
- **Chain reaction**: fast debris hitting other blocks wreck those too
- Fade out over last 60 frames of 300-frame lifetime

---

## Sound System (`js/sound.js`)

All sounds are synthesized — no audio files loaded.

| Function             | Used For | Technique |
|----------------------|----------|-----------|
| `playSpawnPop()`     | Block created | Sine sweep 400→800Hz, 0.1s |
| `playDeletePoof()`   | Block deleted | Highpass noise burst, 0.12s |
| `playBubbleBurst()`  | Blocks fused | Noise + sine sweep + ping |
| `playPuckSound()`    | Fuse proximity | Triangle 520→380Hz + click |
| `playSmashSound()`   | Ball released | Low sine + triangle clang + noise |
| `playBlockSmashSound()` | Block wrecked | Bandpass noise + sawtooth |
| `playBounceSound()`  | Debris bounce | Short sine pip (rate-limited 80ms) |

---

## Environment (`js/environment.js`)

### Background

- Off-screen canvas with linear gradient (#e8f5e9 → #f1f8e9) + diamond pattern overlay
- Rendered once to `PIXI.Texture`, displayed as a `PIXI.Sprite`

### Coconut Tree

- Full SVG with trunk (gradient fill + ring marks), 10+ frond groups  
- Rendered: SVG → Blob URL → Image → Canvas → `PIXI.Texture` → `Sprite`
- Pivot at base for swaying rotation
- Shadow: simple ellipse in `treeShadowLayer`

### Grass

- Backing rectangle (`grassBackGfx`) with layered green fills
- Individual blades: `Math.ceil(appWidth / 10)` PIXI.Graphics rounded-rects
- Each blade has random height, color (HSL), base skew, and per-frame sinusoidal sway
- Night tinting applied per frame

### Birds

- V-shape body with dot center, drawn with `PIXI.Graphics`
- Fly from one screen edge to the other over 6–14 seconds
- Wing flap: `scale.y` oscillation
- Flock spawning: 30% chance of 2–4 birds instead of 1
- Only spawn during day/dawn phases; fade out at night
