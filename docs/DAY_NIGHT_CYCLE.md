# Day/Night Cycle

The entire cycle lasts **120 seconds** (`SUN_CYCLE_DURATION = 120000ms`).

## Phase Timeline

A single normalized parameter `t` (0→1) drives everything:

```
t = 0.00 ─── 0.05 ─── 0.45 ─── 0.55 ─── 0.95 ─── 1.00
  │  DAWN  │       DAY       │  DUSK  │      NIGHT      │ DAWN │
  │ 3s     │      24s        │  6s    │      24s         │ 3s   │
```

### Phase Details

| Phase | t range       | `nightAmount` | `duskDawnAmount` | Visuals |
|-------|---------------|---------------|------------------|---------|
| Dawn  | 0.00 – 0.05   | 1→0           | 1→0              | Orange horizon glow fading, stars/moon fading out, sun rising |
| Day   | 0.05 – 0.45   | 0             | 0                | Sun arcs across sky, birds fly, full-color scenery |
| Dusk  | 0.45 – 0.55   | 0→1           | 0→1              | Orange horizon glow, sun setting, stars/moon fading in |
| Night | 0.55 – 0.95   | 1             | 0                | Dark overlay (0.85 alpha), constellations, moon arc, shooting stars |
| Dawn  | 0.95 – 1.00   | 1→0           | 1→0              | Same as first dawn, cycle wraps |

### `getDayPhase(t)` Return Value

```js
{ phase: 'day'|'dusk'|'night'|'dawn', nightAmount: 0–1, duskDawnAmount: 0–1 }
```

- `nightAmount` — overall darkness (0 = full day, 1 = full night)
- `duskDawnAmount` — intensity of the horizon glow (0 = none, 1 = peak glow)

## Sun Arc (Day Half: t = 0.0 → 0.5)

```
sunT = t / 0.5                           // 0→1 across day half
sunX = -60 + (appWidth + 120) * sunT     // left edge → right edge
sunY = appHeight - 40 - arcHeight * 4 * sunT * (1 - sunT)
       where arcHeight = appHeight * 0.75
```

- Base Y = `appHeight - 40` (near grass line)
- Peak (sunT=0.5) reaches `appHeight * 0.25 - 40` (high in sky)
- Parabolic: `4 * t * (1-t)` peaks at 1.0 when t=0.5

## Moon Arc (Night Half: t = 0.5 → 1.0)

Same formula as the sun, mapped to the night half:

```
moonT = (t - 0.5) / 0.5                  // 0→1 across night half
moonX = -60 + (appWidth + 120) * moonT
moonY = appHeight - 40 - moonArcH * 4 * moonT * (1 - moonT)
        where moonArcH = appHeight * 0.75
```

At dawn (t < 0.05), the moon does NOT animate back — it holds its last position and fades out via `nightAmount`.

## Constellations

Seven real constellations are plotted, each with:
- `ox, oy` — normalized offset (0–1) for screen placement
- `stars` — array of `[relX, relY, brightness]`
- `lines` — array of `[starIndexA, starIndexB]` for connecting lines

| Name         | Screen Region | Star Count |
|--------------|---------------|------------|
| Orion        | Top-left      | 8          |
| Ursa Major   | Top-center    | 7          |
| Cassiopeia   | Top-right     | 5          |
| Leo          | Mid-left      | 7          |
| Scorpius     | Mid-right     | 7          |
| Cygnus       | Center        | 6          |
| Gemini       | Left          | 6          |

Plus **80 ambient stars** scattered randomly across the upper 55% of the screen.

All stars twinkle via sinusoidal alpha/scale modulation.

## Shooting Stars

- Only spawn during `phase === 'night'`
- Random interval: 200–700 frames between spawns
- Each has a diagonal trajectory, trail rendering (head glow + fading tail), and a max life of 40–60 frames
- Destroyed and removed from `nightSkyLayer` when life expires

## Night Effects on Other Systems

| System      | Night Behavior |
|-------------|----------------|
| Night overlay | `alpha = nightAmount * 0.85` — darkens background |
| Tree        | `tint` interpolated toward `0x445566` |
| Grass blades | `tint` interpolated toward `0x334455` |
| Grass backing | `tint` interpolated toward `0x223344` |
| Birds       | Only spawn during day/dawn; fade out with `1 - nightAmount`; removed at `nightAmount >= 1` |
| Block shadows | Hidden at night (`opacity = 0`) |
| Horizon glow | Visible only during dusk (orange `0xff6030`) and dawn (pink `0xff8866`) |
