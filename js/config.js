// ======================== GAME CONFIGURATION ========================
// Central configuration for all tunable game parameters.
// Loaded first — every other script reads from this object.
//
// HOW TO USE:
//   Access any value via CONFIG.<category>.<subcategory>.<property>
//   e.g. CONFIG.grid.unitSizeInPixels, CONFIG.sky.sun.bodyRadius
//
// Each property has a descriptive name and a comment explaining
// what it controls, its unit (px, ms, 0–1, radians, etc.),
// and what changing it would do.

const CONFIG = {

  // ──────────────────────────── GRID & UNITS ────────────────────────────
  // Controls the fundamental sizing of block cubes and interaction distances.
  grid: {
    /** Side length of one block cube, in pixels. Increasing makes everything bigger. */
    unitSizeInPixels: 48,

    /** Base distance (px) at which two blocks can fuse when dropped near each other. */
    fuseBaseDistanceInPixels: 60,

    /** Extra fuse distance added per combined block value. Formula: fuseBase + (a.value + b.value) * this. */
    fuseDistancePerCombinedValue: 5,

    /** Distance (px) beyond the fuse zone where nearby blocks show an irritated expression. */
    irritateExtraDistanceInPixels: 150,
  },

  // ──────────────────────────── APPLICATION ────────────────────────────
  // PixiJS app bootstrap settings.
  app: {
    /** Default background color of the PIXI canvas (before the scenery draws). */
    canvasBackgroundColor: 0xc8e6c9,

    /** Height of the HTML header bar in pixels. The game canvas fills the remaining vertical space. */
    headerHeightInPixels: 58,
  },

  // ──────────────────────────── BLOCK COLORS ────────────────────────────
  // Color palette for blocks 1-20 and auto-generation rules for higher values.
  blockColors: {
    /** Explicit hex colors for block values 1 through 20. */
    palette: {
      1: 0xe74c3c,   // Red
      2: 0xe67e22,   // Orange
      3: 0xf1c40f,   // Yellow
      4: 0x2ecc71,   // Green
      5: 0x3498db,   // Blue
      6: 0x9b59b6,   // Purple
      7: 0xe84393,   // Pink
      8: 0x8B4513,   // Brown
      9: 0x00bcd4,   // Cyan
      10: 0xecf0f1,  // White/Light
      11: 0xc0392b,  // Dark Red
      12: 0xd35400,  // Dark Orange
      13: 0xf39c12,  // Amber
      14: 0x27ae60,  // Dark Green
      15: 0x2980b9,  // Dark Blue
      16: 0x8e44ad,  // Dark Purple
      17: 0xd63384,  // Magenta
      18: 0xa0522d,  // Sienna
      19: 0x0097a7,  // Teal
      20: 0xbdc3c7,  // Silver
    },

    /** For blocks > 20, hue = (value * this) % 360. Spreads colors evenly around the wheel. */
    autoHueRotationStep: 37,

    /** HSL saturation (0–1) for auto-generated block colors (values > 20). */
    autoColorSaturation: 0.65,

    /** HSL lightness (0–1) for auto-generated block colors (values > 20). */
    autoColorLightness: 0.5,

    /** Block values that use dark (#333) label text instead of white — typically light-colored blocks. */
    lightColorBlockValues: [10, 20],
  },

  // ──────────────────────────── EASING ────────────────────────────
  easing: {
    /** Overshoot constant for the easeOutBack curve. Higher = more bounce past target. */
    easeOutBackOvershoot: 1.70158,
  },

  // ──────────────────────────── SKY SYSTEM ────────────────────────────
  sky: {

    // ── Day/Night Cycle Timing ──
    dayNightCycle: {
      /** Total duration of one full day→night→day cycle, in milliseconds. */
      fullCycleDurationMs: 120_000,

      /** Fraction of cycle where dawn ends and full daylight begins (0–1). */
      dawnEndFraction: 0.05,

      /** Fraction of cycle where daylight ends and dusk begins (0–1). */
      duskStartFraction: 0.45,

      /** Fraction of cycle where dusk ends and full night begins (0–1). */
      duskEndFraction: 0.55,

      /** Fraction of cycle where night ends and dawn begins again (0–1). */
      nightEndFraction: 0.95,
    },

    // ── Sun ──
    sun: {
      /** Radius of the sun body circle in pixels. */
      bodyRadius: 40,

      /** Number of concentric glow rings around the sun. */
      glowRingCount: 6,

      /** Radius increment per glow ring, in pixels. Each ring is bodyRadius + i * this. */
      glowRingSpacing: 18,

      /** Base alpha of the outermost glow ring. Inner rings are scaled up by (1 – i/count). */
      glowRingBaseAlpha: 0.03,

      /** Color of the glow rings. */
      glowColor: 0xffa500,

      /** Cool-end color (low warmth) of the sun body gradient. Blended toward warm end at midday. */
      bodyCoolColor: 0xffa500,

      /** Warm-end color (high warmth) of the sun body gradient. */
      bodyWarmColor: 0xffd93d,

      /** Inner highlight circle offset X/Y from sun center. */
      highlightOffsetX: -8,
      highlightOffsetY: -8,

      /** Inner highlight circle radius. */
      highlightRadius: 18,

      /** Inner highlight color and alpha. */
      highlightColor: 0xfff6a8,
      highlightAlpha: 0.6,

      /** Number of triangular ray segments around the sun. */
      rayCount: 12,

      /** Inner radius where rays start (px from center). */
      rayInnerRadius: 50,

      /** Outer radius where ray tips extend to (px). */
      rayOuterRadius: 70,

      /** Half-angle width of each ray triangle, in radians. */
      rayHalfAngle: 0.08,

      /** Color and alpha of the ray fill. */
      rayColor: 0xffd93d,
      rayAlpha: 0.12,

      /** Rotation speed of sun rays per ticker delta. */
      rayRotationSpeedPerDelta: 0.002,

      /** Speed multiplier for the subtle sun body pulsing. */
      pulseFrequency: 0.001,

      /** Amplitude of the sun body scale pulse (fraction of 1.0). */
      pulseAmplitude: 0.02,

      /** How far off-screen (px) the sun starts/ends its horizontal arc. */
      arcHorizontalOvershootPx: 60,

      /** Sun arc height as a fraction of appHeight. Controls how high the sun climbs. */
      arcHeightFraction: 0.75,

      /** Y offset from bottom of canvas for the sun arc baseline, in pixels. */
      arcBaselineOffsetFromBottom: 40,
    },

    // ── Moon ──
    moon: {
      /** Radius of the moon body circle in pixels. */
      bodyRadius: 30,

      /** Moon body base color. */
      bodyColor: 0xf5f5dc,

      /** Bright highlight: offset from center (X, Y) and radius. */
      highlightOffsetX: -5,
      highlightOffsetY: -5,
      highlightRadius: 14,
      highlightColor: 0xffffff,
      highlightAlpha: 0.5,

      /** Crescent shadow: offset (X, Y), radius, and color+alpha. Creates the crescent shape. */
      crescentOffsetX: 10,
      crescentOffsetY: -2,
      crescentRadius: 22,
      crescentColor: 0x0a0e2a,
      crescentAlpha: 0.6,

      /** Craters: array of { x, y, radius }. Subtle surface detail marks. */
      craters: [
        { x: -8, y: 8, radius: 5 },
        { x: -2, y: -10, radius: 3 },
        { x: 4, y: 5, radius: 4 },
      ],
      craterColor: 0xd0d0b8,
      craterAlpha: 0.35,

      /** Inner glow ring radius and alpha. */
      innerGlowRadius: 80,
      innerGlowAlpha: 0.06,

      /** Outer glow ring radius and alpha. */
      outerGlowRadius: 120,
      outerGlowAlpha: 0.03,

      /** Glow color (same for both rings). */
      glowColor: 0xf5f5dc,

      /** Moon arc uses same formula as sun. These override if different (currently same). */
      arcHorizontalOvershootPx: 60,
      arcHeightFraction: 0.75,
      arcBaselineOffsetFromBottom: 40,
    },

    // ── Stars ──
    stars: {
      /** Number of random ambient (non-constellation) stars scattered in the sky. */
      ambientStarCount: 80,

      /** Ambient stars are placed in the top fraction of appHeight. 0.55 = top 55%. */
      ambientStarVerticalFraction: 0.55,

      /** Minimum brightness for ambient stars (0–1). */
      ambientMinBrightness: 0.3,

      /** Brightness range added randomly: final = min + random * range. */
      ambientBrightnessRange: 0.5,

      /** Constellation star base size in pixels. Final size = baseSize + brightness * sizeMultiplier. */
      constellationStarBaseSize: 1.2,

      /** Multiplier applied to brightness to get additional star size. */
      constellationStarSizeMultiplier: 1.5,

      /** Outer glow circle radius = starSize * this. */
      starGlowRadiusMultiplier: 3,

      /** Outer glow alpha. */
      starGlowAlpha: 0.15,

      /** Visible body alpha. */
      starBodyAlpha: 0.9,

      /** Bright core radius = starSize * this. */
      starCoreRadiusMultiplier: 0.5,

      /** Ambient star outer glow multiplier (slightly smaller than constellation). */
      ambientGlowRadiusMultiplier: 2.5,

      /** Ambient star outer glow alpha. */
      ambientGlowAlpha: 0.1,

      /** Ambient star body alpha. */
      ambientBodyAlpha: 0.7,

      /** Constellation connecting line width. */
      constellationLineWidth: 0.6,

      /** Constellation connecting line alpha. */
      constellationLineAlpha: 0.15,

      /** Constellation lines overall alpha at full night. */
      constellationLineNightAlpha: 0.5,

      /** Horizontal margin fraction: stars placed within appWidth * (1 - 2*margin). */
      constellationHorizontalMargin: 0.05,

      /** Vertical fraction of appHeight used for constellation placement. */
      constellationVerticalFraction: 0.55,

      /** Vertical offset fraction (from top of screen). */
      constellationVerticalOffset: 0.03,

      /** Twinkle: minimum speed (radians per second). */
      twinkleMinSpeed: 0.5,

      /** Twinkle: random additional speed range. Final = min + random * range. */
      twinkleSpeedRange: 1.5,

      /** Ambient star twinkle minimum speed. */
      ambientTwinkleMinSpeed: 0.8,

      /** Ambient star twinkle speed range. */
      ambientTwinkleSpeedRange: 2.0,

      /** Twinkle animation: delta multiplier for phase advancement. */
      twinklePhaseMultiplier: 0.016,

      /** Twinkle alpha range: minimum alpha during twinkle cycle. */
      twinkleMinAlpha: 0.4,

      /** Twinkle alpha range: additional alpha range. Max = min + range. */
      twinkleAlphaRange: 0.6,

      /** Twinkle scale range: minimum scale during twinkle cycle. */
      twinkleMinScale: 0.8,

      /** Twinkle scale range: additional scale. Max = min + range. */
      twinkleScaleRange: 0.4,
    },

    // ── Shooting Stars ──
    shootingStars: {
      /** Minimum interval (in ticker frames) between shooting star spawns during night. */
      spawnIntervalMinFrames: 200,

      /** Random additional frames added to spawn interval. */
      spawnIntervalRandomFrames: 500,

      /** Initial spawn interval minimum (used at startup). */
      initialSpawnIntervalMinFrames: 300,

      /** Initial spawn interval random range. */
      initialSpawnIntervalRandomFrames: 600,

      /** Horizontal spawn range: random fraction of appWidth, centered. */
      spawnHorizontalMarginFraction: 0.1,

      /** Horizontal spawn width fraction (0.8 = middle 80%). */
      spawnHorizontalWidthFraction: 0.8,

      /** Maximum Y position as fraction of appHeight (spawns in top portion). */
      spawnVerticalFraction: 0.25,

      /** Minimum angle of the shooting star trajectory (radians from horizontal). */
      trajectoryMinAngle: Math.PI * 0.15,

      /** Random additional angle range. */
      trajectoryAngleRange: Math.PI * 0.2,

      /** Minimum speed (px per frame). */
      minSpeed: 8,

      /** Random additional speed. */
      speedRange: 6,

      /** Minimum visible trail length in pixels. */
      minTrailLength: 60,

      /** Random additional trail length. */
      trailLengthRange: 40,

      /** Minimum lifetime in frames. */
      minLifeFrames: 40,

      /** Random additional life frames. */
      lifeFrameRange: 20,

      /** Head (bright dot) radius in pixels. */
      headRadius: 2,

      /** Head alpha multiplier. */
      headAlphaMultiplier: 0.8,

      /** Primary trail line width. */
      primaryTrailWidth: 2,

      /** Primary trail alpha multiplier. */
      primaryTrailAlpha: 0.6,

      /** Secondary (faint outer) trail width. */
      secondaryTrailWidth: 1,

      /** Secondary trail color. */
      secondaryTrailColor: 0xaaddff,

      /** Secondary trail alpha multiplier. */
      secondaryTrailAlpha: 0.3,

      /** How much the trail shortens as progress increases (0–1). */
      trailShrinkFactor: 0.5,

      /** Secondary trail length multiplier (extends beyond primary). */
      secondaryTrailLengthMultiplier: 1.3,
    },

    // ── Night Overlay ──
    nightOverlay: {
      /** Color of the full-screen night darkness overlay. */
      color: 0x0a0e2a,

      /** Maximum alpha at full night (0–1). 1.0 = pitch black. */
      maxAlpha: 0.85,
    },

    // ── Horizon Glow ──
    horizonGlow: {
      /** Number of gradient bands in the horizon glow effect. */
      bandCount: 8,

      /** Height of the glow region as a fraction of appHeight. */
      heightFraction: 0.4,

      /** Peak alpha intensity of the brightest (bottom) band. */
      peakAlpha: 0.5,

      /** Color used during dusk glow. */
      duskColor: 0xff6030,

      /** Color used during dawn glow. */
      dawnColor: 0xff8866,
    },
  },

  // ──────────────────────────── ENVIRONMENT ────────────────────────────
  environment: {

    // ── Background ──
    background: {
      /** Gradient stops for the static background. Array of { offset, color }. */
      gradientStops: [
        { offset: 0, color: '#e8f5e9' },
        { offset: 0.3, color: '#c8e6c9' },
        { offset: 0.6, color: '#dcedc8' },
        { offset: 1, color: '#f1f8e9' },
      ],

      /** Diamond pattern overlay size (px). Creates subtle texture. */
      diamondPatternSize: 40,

      /** Diamond pattern fill style (CSS color string). */
      diamondPatternFill: 'rgba(0,0,0,0.03)',
    },

    // ── Tree ──
    tree: {
      /** Horizontal position of the tree (px from left edge). */
      positionX: 40,

      /** Distance from the bottom of the canvas to the tree base (px). */
      baseOffsetFromBottom: 28,

      /** SVG canvas dimensions (width x height). Must match the SVG viewBox. */
      svgWidth: 240,
      svgHeight: 480,

      /** Tree shadow ellipse: horizontal radius. */
      shadowRadiusX: 100,

      /** Tree shadow ellipse: vertical radius. */
      shadowRadiusY: 20,

      /** Tree shadow X position (px from left). */
      shadowPositionX: 140,

      /** Tree shadow base alpha. */
      shadowAlpha: 0.18,

      /** Primary sway frequency (radians per ms). Lower = slower. */
      primarySwayFrequency: 0.0012,

      /** Primary sway amplitude (radians). */
      primarySwayAmplitude: 0.015,

      /** Secondary sway frequency for complex motion. */
      secondarySwayFrequency: 0.0019,

      /** Secondary sway amplitude. */
      secondarySwayAmplitude: 0.008,

      /** Night tint target color. Tree blends toward this at night. */
      nightTintColor: 0x445566,

      /** Night tint strength (0–1). How much the tint is applied at full night. */
      nightTintStrength: 0.6,

      /** Shadow direction multiplier (how far shadow shifts with sun position). */
      shadowDirectionMultiplier: 120,

      /** Base shadow scale at noon. */
      shadowBaseScale: 0.8,

      /** Additional shadow scale when sun is near horizon. */
      shadowHorizonExtraScale: 1.5,
    },

    // ── Grass ──
    grass: {
      /** Base fill color for the grass back rectangle. */
      baseColor: 0x4a8c3f,

      /** Inner highlight color for the grass back rectangle. */
      innerColor: 0x6abf5e,

      /** Alpha of the inner highlight. */
      innerAlpha: 0.7,

      /** Total height of the grass base rectangle from the bottom edge (px). */
      baseHeightFromBottom: 40,

      /** Inner rectangle top offset from bottom (px). */
      innerTopOffset: 35,

      /** Inner rectangle height (px). */
      innerHeight: 25,

      /** Approximate spacing between grass blade centers (px). bladeCount = appWidth / this. */
      bladeSpacingPx: 10,

      /** Minimum blade height in pixels. Final = min + random * range. */
      bladeMinHeight: 18,

      /** Random additional blade height range. */
      bladeHeightRange: 22,

      /** Blade width in pixels. */
      bladeWidth: 6,

      /** Random horizontal jitter for each blade (±px). */
      bladeJitterPx: 8,

      /** HSL hue base for blade color (degrees). */
      bladeHueBase: 100,

      /** Random hue range added to base. */
      bladeHueRange: 30,

      /** HSL lightness base for blade color (percent 0–100). */
      bladeLightnessBase: 40,

      /** Random lightness range. */
      bladeLightnessRange: 20,

      /** HSL saturation for blade color (0–1). */
      bladeSaturation: 0.55,

      /** Y position of blade bases, measured from bottom of canvas (px). */
      bladeBaseOffsetFromBottom: 15,

      /** Blade corner rounding radius (px). */
      bladeCornerRadius: 3,

      /** Maximum random initial skew of each blade (radians, ±). */
      bladeMaxInitialSkew: 0.4,

      /** Minimum sway speed multiplier (radians per ms). */
      bladeSwayMinSpeed: 0.8,

      /** Random additional sway speed. */
      bladeSwaySpeedRange: 0.6,

      /** Minimum sway amplitude (radians). */
      bladeSwayMinAmplitude: 0.03,

      /** Random additional sway amplitude. */
      bladeSwayAmplitudeRange: 0.04,

      /** Sway time scale: multiplied by performance.now() for the sine wave. */
      bladeSwayTimeScale: 0.001,

      /** Night tint target color (grass blades). */
      bladeNightTintColor: 0x334455,

      /** Night tint strength for grass blades. */
      bladeNightTintStrength: 0.5,

      /** Night tint target color (grass base rectangle). */
      baseNightTintColor: 0x223344,

      /** Night tint strength for grass base. */
      baseNightTintStrength: 0.6,
    },

    // ── Birds ──
    birds: {
      /** Probability of a bird flying right (0–1). Remainder fly left. */
      flyRightProbability: 0.6,

      /** How far off-screen (px) birds start and end their flight. */
      offScreenBufferPx: 40,

      /** Destination off-screen buffer (px). Birds fly to here before being removed. */
      destinationBufferPx: 80,

      /** Minimum Y position for bird flight paths (px from top). */
      minAltitudePx: 30,

      /** Birds fly within this fraction of appHeight (vertical range). */
      altitudeFraction: 0.35,

      /** Minimum flight duration in seconds. */
      minFlightDurationSec: 6,

      /** Random additional flight duration in seconds. */
      flightDurationRangeSec: 8,

      /** Maximum vertical drift during flight (±px). */
      maxVerticalDriftPx: 80,

      /** Wing/body line width for drawing. */
      lineWidth: 1.8,

      /** Wing color. */
      wingColor: 0x333333,

      /** Body fill color. */
      bodyColor: 0x444444,

      /** Body dot radius. */
      bodyRadius: 2.5,

      /** Wing span: half-width of each wing arc (px). */
      wingSpanPx: 13,

      /** Wing height: how high the wing arches above the body at peak flap. */
      wingArchHeight: 8,

      /** Wing flap animation speed (phase advance per delta). */
      wingFlapSpeed: 0.3,

      /** Wing flap: minimum Y scale during flap cycle. */
      wingFlapMinScale: 0.7,

      /** Wing flap: scale range added by flap. Max = min + range. */
      wingFlapScaleRange: 0.6,

      /** Fraction of flight at start during which bird fades in. */
      fadeInFraction: 0.05,

      /** Fraction of flight at end during which bird fades out. */
      fadeOutFraction: 0.1,

      /** Minimum spawn interval (ticker frames) between bird spawning checks. */
      spawnIntervalMinFrames: 180,

      /** Random additional spawn interval frames. */
      spawnIntervalRandomFrames: 360,

      /** Initial spawn interval min frames (first spawn after load). */
      initialSpawnIntervalMinFrames: 90,

      /** Initial spawn interval random frames. */
      initialSpawnIntervalRandomFrames: 360,

      /** Probability of spawning a flock instead of a single bird (0–1). */
      flockProbability: 0.3,

      /** Minimum flock size (birds). */
      flockMinSize: 2,

      /** Random additional flock size. Total = min + random * range. */
      flockSizeRange: 3,

      /** Delay between spawning each bird in a flock (ms). */
      flockSpawnDelayMs: 400,

      /** Time before the first bird spawns after page load (ms). */
      firstBirdDelayMs: 1500,
    },
  },

  // ──────────────────────────── BLOCK SYSTEM ────────────────────────────
  blocks: {

    // ── Rendering ──
    rendering: {
      /** Corner radius for each cube tile (px). */
      cubeCornerRadius: 8,

      /** Border line width around each cube. */
      cubeBorderWidth: 2,

      /** Border line color. */
      cubeBorderColor: 0xffffff,

      /** Border line alpha. */
      cubeBorderAlpha: 0.35,

      /** Inner highlight: offset from cube corner (px). */
      cubeHighlightOffsetX: 3,
      cubeHighlightOffsetY: 3,

      /** Inner highlight width = UNIT/2 – this value (px). */
      cubeHighlightSizeReduction: 3,

      /** Inner highlight corner radius. */
      cubeHighlightCornerRadius: 4,

      /** Inner highlight alpha. */
      cubeHighlightAlpha: 0.25,

      /** Row-based shade darkening: each row darkens by this factor. shade = 1 – row * factor. */
      rowShadeFactor: 0.03,

      /** Label font family. */
      labelFontFamily: 'Segoe UI, Comic Sans MS, sans-serif',

      /** Label font size in px. */
      labelFontSize: 20,

      /** Label font weight. */
      labelFontWeight: '900',

      /** Label color for dark-background blocks. */
      labelLightColor: '#fff',

      /** Label color for light-background blocks (values in blockColors.lightColorBlockValues). */
      labelDarkColor: '#333',

      /** Label drop shadow: enabled. */
      labelDropShadow: true,

      /** Label drop shadow: distance. */
      labelDropShadowDistance: 1,

      /** Label drop shadow: blur radius. */
      labelDropShadowBlur: 3,

      /** Label drop shadow: alpha. */
      labelDropShadowAlpha: 0.5,

      /** Label drop shadow: color. */
      labelDropShadowColor: '#000',

      /** Vertical offset of label above the block (px). Negative = above. */
      labelYOffset: -4,
    },

    // ── Interaction (Drag & Drop) ──
    interaction: {
      /** Alpha of the block while being dragged. */
      dragAlpha: 0.9,

      /** Z-index applied to a block while being dragged. */
      dragZIndex: 1000,

      /** Default z-index for blocks at rest. */
      defaultZIndex: 1,

      /** Velocity smoothing: weight of previous velocity (0–1). Rest goes to current. */
      velocitySmoothingPrevious: 0.6,

      /** Velocity smoothing: weight of current sample. */
      velocitySmoothingCurrent: 0.4,

      /** Drag speed threshold to trigger angry face expression. */
      angrySpeedThreshold: 1.5,

      /** Irritated face: pupil offset X multiplier (how far pupils track the dragged block). */
      irritatedPupilOffsetX: 2.5,

      /** Irritated face: pupil offset Y multiplier. */
      irritatedPupilOffsetY: 1.0,

      /** Alpha applied to the fuse-target block preview (dims it). */
      fusePreviewAlpha: 0.5,

      /** Fuse zone dashed outline width. */
      fuseZoneLineWidth: 3,

      /** Fuse zone outline color. */
      fuseZoneColor: 0xffff64,

      /** Fuse zone outline alpha. */
      fuseZoneAlpha: 0.6,

      /** Fuse zone padding around the block (px). */
      fuseZonePadding: 4,

      /** Fuse zone corner radius (px). */
      fuseZoneCornerRadius: 8,

      /** Fuse zone dash length (px). */
      fuseZoneDashLength: 8,

      /** Fuse zone gap length (px). */
      fuseZoneGapLength: 6,
    },

    // ── Animation ──
    animation: {
      /** Spawn pop-in animation speed (fraction per delta frame). 0.08 = ~12 frames to complete. */
      spawnAnimationSpeed: 0.08,

      /** Fuse celebration bounce animation speed. */
      fuseAnimationSpeed: 0.04,

      /** Fuse bounce: scale overshoot amplitude. Block scales to 1 + this at peak. */
      fuseBounceAmplitude: 0.3,

      /** Delete animation: delay before poof starts (fraction 0–1 of animation). */
      deleteDelayFraction: 0.4,

      /** Delete animation: poof speed per delta. */
      deleteSpeed: 0.06,

      /** Delete poof: final scale reduction (1 – this). */
      deleteScaleShrink: 0.7,

      /** Delete poof: final rotation (radians). */
      deleteRotation: 0.35,
    },

    // ── Fuse Flash Effect ──
    fuseFlash: {
      /** Number of concentric glow rings. */
      ringCount: 4,

      /** Base radius of innermost ring (px). */
      baseRadius: 15,

      /** Radius increment per ring (px). */
      ringSpacing: 12,

      /** Flash color. */
      color: 0xffff64,

      /** Peak alpha of the innermost ring. */
      peakAlpha: 0.6,

      /** Total duration in frames. */
      durationFrames: 24,

      /** Scale increase per frame. */
      scalePerFrame: 0.03,
    },

    // ── Shadows ──
    shadows: {
      /** Shadow fill alpha (inside the shadow shape). */
      fillAlpha: 0.12,

      /** Shadow height as a fraction of block height. */
      heightFraction: 0.3,

      /** Shadow corner radius (px). */
      cornerRadius: 6,

      /** Shadow horizontal shift multiplier: offset = dirX * this * lengthFactor. */
      horizontalShiftMultiplier: 30,

      /** Shadow X scale stretch: 1 + |dirX| * this. */
      stretchFactor: 0.3,

      /** Shadow skew factor: skew.x = -dirX * this. */
      skewFactor: 0.35,

      /** Minimum shadow alpha (prevents shadows from disappearing entirely). */
      minAlpha: 0.03,

      /** Shadow alpha multiplier applied to the overall opacity. */
      alphaMultiplier: 0.18,
    },

    // ── Selection Mode ──
    selection: {
      /** Tint color multiplied onto the whole block when entering selection mode. */
      blockDarkenTint: 0xAABBDD,

      /** Tint color applied to individual cubes that the user has toggled for detachment. */
      selectedCubeTint: 0xFF8844,

      /** Highlight overlay alpha drawn on top of selected cubes (0–1). */
      selectedCubeOverlayAlpha: 0.35,

      /** Selection border stroke width around the whole block (px). */
      borderWidth: 2.5,

      /** Selection border color. */
      borderColor: 0xFFFFFF,

      /** Selection border alpha (0–1). */
      borderAlpha: 0.75,

      /** Selection border padding around block edges (px). */
      borderPadding: 4,

      /** Selection border corner radius (px). */
      borderCornerRadius: 8,

      /** Highlight border drawn on each individually-selected cube: width (px). */
      cubeBorderWidth: 2,

      /** Highlight border on selected cubes: color. */
      cubeBorderColor: 0xFFFFFF,

      /** Highlight border on selected cubes: alpha. */
      cubeBorderAlpha: 0.9,
    },

    // ── Block Splitting (Rubber Band) ──
    splitting: {
      /** Drag distance (px) from the block center at which the split executes mid-drag. */
      thresholdDistancePx: 100,

      /** Maximum skew deformation at full stretch (radians). */
      maxSkew: 0.25,

      /** Maximum scale multiplier in drag direction at full stretch. */
      maxStretch: 1.25,

      /** Resistance curve exponent. <1 = easy start, hard end. */
      resistanceExponent: 0.6,

      /** Rubber band connector base line width (px). */
      rubberBandWidth: 5,

      /** Rubber band connector color. */
      rubberBandColor: 0xFFDD44,

      /** Rubber band connector base alpha (0–1). */
      rubberBandAlpha: 0.65,

      /** Speed at which block snaps back if released below threshold (0–1 lerp per frame). */
      snapBackSpeed: 0.18,

      /** Distance (px) the split-off piece pops away from the remaining piece. */
      splitPopDistancePx: 80,

      /** Minimum pointer movement (px) before deformation starts. */
      dragDeadZonePx: 5,
    },
  },

  // ──────────────────────────── WRECKING BALL SYSTEM ────────────────────────────
  wrecking: {

    // ── Ball ──
    ball: {
      /** Radius of the wrecking ball circle (px). */
      radius: 25,

      /** Ball fill color. */
      fillColor: 0x555555,

      /** Ball stroke (outline) width. */
      strokeWidth: 3,

      /** Ball stroke color. */
      strokeColor: 0x222222,

      /** Highlight ellipse offset X, Y from center. */
      highlightOffsetX: -5,
      highlightOffsetY: -8,

      /** Highlight ellipse radii (X, Y). */
      highlightRadiusX: 7,
      highlightRadiusY: 5,

      /** Highlight alpha. */
      highlightAlpha: 0.25,

      /** Maximum drag distance from pin (px). Limits how far the ball stretches. */
      maxDragDistance: 250,

      /** Default chain length when first placed (ball drops this far below pin). */
      defaultChainLengthPx: 120,

      /** Extra px added to ball radius for collision detection against blocks. */
      collisionPadding: 10,
    },

    // ── Chain ──
    chain: {
      /** Number of decorative link dots along the chain. */
      segmentCount: 6,

      /** Chain line width (px). */
      lineWidth: 3,

      /** Chain line color. */
      lineColor: 0x555555,

      /** Chain link dot radius (px). */
      dotRadius: 3,

      /** Chain link dot fill color. */
      dotFillColor: 0x666666,

      /** Chain link dot stroke color. */
      dotStrokeColor: 0x444444,

      /** Chain link dot stroke width. */
      dotStrokeWidth: 1,
    },

    // ── Pin ──
    pin: {
      /** Pin circle radius (px). */
      radius: 7,

      /** Pin fill color. */
      fillColor: 0x555555,

      /** Pin stroke width. */
      strokeWidth: 2,

      /** Pin stroke color. */
      strokeColor: 0x333333,
    },

    // ── Pendulum Physics ──
    pendulum: {
      /** Gravitational acceleration constant for the pendulum swing. Higher = faster swing. */
      gravity: 0.0015,

      /** Velocity damping per frame (0–1). 1.0 = no damping. Lower = quicker stop. */
      damping: 0.997,

      /** Minimum angular velocity before the ball is considered "stopped". */
      minAngularVelocity: 0.0003,

      /** Minimum angle threshold for stop check (radians). Ball must be nearly vertical. */
      minAngleForStop: 0.02,

      /** Number of frames that must pass before stop-check kicks in. */
      minFramesBeforeStop: 60,

      /** Velocity retention when bouncing off walls (fraction). */
      wallBounceFactor: 0.5,
    },

    // ── Debris ──
    debris: {
      /** Size of each debris cube (px). Square. */
      size: 20,

      /** Per-frame velocity friction (multiplied each frame). 1.0 = no friction. */
      friction: 0.985,

      /** Velocity retained after bouncing off a wall (fraction). */
      bounceFactor: 0.55,

      /** Gravitational acceleration applied to debris Y velocity each frame. */
      gravity: 0.15,

      /** Maximum initial spin speed (±radians per frame). */
      maxInitialSpin: 0.25,

      /** Spin damping per frame. */
      spinDamping: 0.98,

      /** Lifetime of debris in frames before removal. */
      lifetimeFrames: 300,

      /** Debris starts fading out when remaining life drops below this many frames. */
      fadeStartRemainingFrames: 60,

      /** Minimum speed below which debris can be removed early (when life < earlyRemoveLifeThreshold). */
      earlyRemoveSpeedThreshold: 0.2,

      /** Life threshold below which slow debris is removed early. */
      earlyRemoveLifeThreshold: 200,

      /** Border width on debris cubes. */
      borderWidth: 1.5,

      /** Border color on debris cubes. */
      borderColor: 0xffffff,

      /** Border alpha. */
      borderAlpha: 0.3,

      /** Corner radius on debris cubes. */
      cornerRadius: 4,

      /** Scatter multiplier: how much random velocity is added. Higher = more spread. */
      scatterMultiplier: 3,

      /** Impact direction velocity retention: fraction of wrecking ball velocity transferred. */
      impactVelocityFraction: 0.6,

      /** Minimum speed for debris to cause chain-reaction block destruction. */
      chainReactionMinSpeed: 2,

      /** Velocity fraction retained by debris after a chain-reaction hit. */
      chainReactionDebrisRetention: 0.3,

      /** Velocity fraction transferred from debris to the wrecked block in chain reaction. */
      chainReactionBlockFraction: 0.5,
    },

    // ── Smash Flash Effect ──
    smashFlash: {
      /** Number of concentric glow rings. */
      ringCount: 4,

      /** Base radius of innermost ring (px). */
      baseRadius: 20,

      /** Radius increment per ring (px). */
      ringSpacing: 15,

      /** Flash color. */
      color: 0xffa032,

      /** Peak alpha of the innermost ring. */
      peakAlpha: 0.7,

      /** Total duration in frames. */
      durationFrames: 21,

      /** Scale increase per frame. */
      scalePerFrame: 0.04,
    },
  },

  // ──────────────────────────── SOUND SYSTEM ────────────────────────────
  // All sounds are procedurally synthesized via Web Audio API.
  // Each sub-object configures one sound effect's oscillators, filters, and envelopes.
  sound: {

    bubbleBurst: {
      /** Duration of the noise burst component (seconds). */
      noiseDuration: 0.15,
      /** Bandpass filter start frequency (Hz). Sweeps down to endFreq. */
      bandpassStartFreq: 3000,
      /** Bandpass filter end frequency (Hz). */
      bandpassEndFreq: 300,
      /** Bandpass filter sweep time (seconds). */
      bandpassSweepTime: 0.12,
      /** Bandpass filter Q (resonance). Higher = narrower band. */
      bandpassQ: 1.5,
      /** Noise gain at onset. */
      noiseGainStart: 0.6,
      /** Time for noise gain to decay to near-zero (seconds). */
      noiseDecayTime: 0.12,
      /** Sine oscillator start frequency (Hz). Deep "pop" tone. */
      oscStartFreq: 600,
      /** Sine oscillator end frequency. */
      oscEndFreq: 120,
      /** Oscillator sweep time (seconds). */
      oscSweepTime: 0.18,
      /** Oscillator gain at onset. */
      oscGainStart: 0.4,
      /** Oscillator decay time. */
      oscDecayTime: 0.2,
      /** High ping start frequency (Hz). Adds sparkle. */
      pingStartFreq: 1800,
      /** High ping end frequency. */
      pingEndFreq: 2400,
      /** Ping delay before start (seconds). */
      pingDelay: 0.02,
      /** Ping sweep time (seconds). */
      pingSweepTime: 0.06,
      /** Ping gain at onset. */
      pingGainStart: 0.15,
      /** Ping decay time. */
      pingDecayTime: 0.13,
    },

    spawnPop: {
      /** Oscillator start frequency (Hz). Quick upward chirp. */
      oscStartFreq: 400,
      /** Oscillator end frequency. */
      oscEndFreq: 800,
      /** Frequency sweep time (seconds). */
      sweepTime: 0.08,
      /** Gain at onset. */
      gainStart: 0.25,
      /** Gain decay time. */
      decayTime: 0.1,
    },

    deletePoof: {
      /** Noise burst duration (seconds). */
      noiseDuration: 0.12,
      /** Highpass filter cutoff (Hz). Only high frequencies pass through. */
      highpassFreq: 2000,
      /** Gain at onset. */
      gainStart: 0.2,
      /** Gain decay time. */
      decayTime: 0.1,
    },

    puck: {
      /** Triangle wave start frequency (Hz). Downward thunk. */
      oscStartFreq: 520,
      /** Triangle wave end frequency. */
      oscEndFreq: 380,
      /** Sweep time (seconds). */
      sweepTime: 0.07,
      /** Main gain at onset. */
      gainStart: 0.18,
      /** Main decay time. */
      decayTime: 0.09,
      /** Click transient frequency (Hz). */
      clickFreq: 1200,
      /** Click gain. */
      clickGain: 0.06,
      /** Click duration (seconds). */
      clickDuration: 0.03,
    },

    smash: {
      /** Deep boom start frequency (Hz). */
      boomStartFreq: 80,
      /** Deep boom end frequency. */
      boomEndFreq: 30,
      /** Boom sweep time (seconds). */
      boomSweepTime: 0.3,
      /** Boom gain at onset. */
      boomGainStart: 0.5,
      /** Boom decay time. */
      boomDecayTime: 0.35,
      /** Metallic clang start frequency (Hz). */
      clangStartFreq: 800,
      /** Clang end frequency. */
      clangEndFreq: 200,
      /** Clang sweep time. */
      clangSweepTime: 0.15,
      /** Clang gain at onset. */
      clangGainStart: 0.3,
      /** Clang decay time. */
      clangDecayTime: 0.2,
      /** Low-frequency noise lowpass cutoff (Hz). */
      noiseLowpassFreq: 1500,
      /** Noise gain at onset. */
      noiseGainStart: 0.25,
      /** Noise decay time. */
      noiseDecayTime: 0.12,
      /** Noise burst duration. */
      noiseDuration: 0.15,
    },

    blockSmash: {
      /** Bandpass center frequency (Hz). */
      bandpassFreq: 2500,
      /** Bandpass Q (resonance). */
      bandpassQ: 2,
      /** Noise gain at onset. */
      noiseGainStart: 0.35,
      /** Noise decay time. */
      noiseDecayTime: 0.08,
      /** Noise duration. */
      noiseDuration: 0.1,
      /** Sawtooth wave start frequency. */
      sawStartFreq: 300,
      /** Sawtooth end frequency. */
      sawEndFreq: 60,
      /** Sawtooth sweep time. */
      sawSweepTime: 0.15,
      /** Sawtooth gain at onset. */
      sawGainStart: 0.12,
      /** Sawtooth decay time. */
      sawDecayTime: 0.15,
    },

    bounce: {
      /** Minimum interval between bounce sounds (seconds). Prevents rapid-fire noise. */
      minInterval: 0.08,
      /** Base frequency (Hz). Random range added on top. */
      baseFreq: 200,
      /** Random frequency range added to base. */
      freqRange: 300,
      /** End frequency (Hz). Pitch drops to here. */
      endFreq: 100,
      /** Sweep time (seconds). */
      sweepTime: 0.06,
      /** Gain at onset. */
      gainStart: 0.08,
      /** Gain decay time. */
      decayTime: 0.06,
    },

    split: {
      /** Main downward "snap" oscillator start frequency (Hz). */
      oscStartFreq: 500,
      /** Snap oscillator end frequency. */
      oscEndFreq: 150,
      /** Frequency sweep time (seconds). */
      sweepTime: 0.1,
      /** Gain at onset. */
      gainStart: 0.25,
      /** Gain decay time. */
      decayTime: 0.12,
      /** High "twang" oscillator start frequency (Hz). Adds elastic snap character. */
      twangStartFreq: 1000,
      /** Twang end frequency. */
      twangEndFreq: 600,
      /** Twang sweep time. */
      twangSweepTime: 0.06,
      /** Twang gain at onset. */
      twangGainStart: 0.12,
      /** Twang decay time. */
      twangDecayTime: 0.08,
    },

    rubberBandStretch: {
      /** Base oscillator frequency (Hz) at 0% stretch. Rises with stretch progress. */
      baseFreq: 120,
      /** Additional frequency added at 100% stretch (Hz). Total freq = base + this * progress. */
      freqRange: 280,
      /** Oscillator gain (volume). Kept low for ambient tension effect. */
      gain: 0.06,
      /** Oscillator waveform type. "sawtooth" gives a tense, raspy quality. */
      waveType: 'sawtooth',
      /** Lowpass filter cutoff at 0% stretch (Hz). Opens up as stretch increases. */
      filterBaseFreq: 200,
      /** Additional filter cutoff added at 100% stretch (Hz). */
      filterFreqRange: 800,
      /** Filter Q (resonance). Higher = more resonant/rubber-like overtone. */
      filterQ: 3,
    },

    // ── Zombie Cube Break ──
    zombieCubeBreak: {
      /** Noise duration (seconds). Short crackle. */
      noiseDuration: 0.08,
      /** Bandpass center frequency (Hz). */
      bandpassFreq: 3500,
      /** Bandpass Q. */
      bandpassQ: 2,
      /** Noise gain start. */
      noiseGainStart: 0.15,
      /** Noise decay time (seconds). */
      noiseDecayTime: 0.07,
      /** Crack oscillator start frequency (Hz). */
      crackStartFreq: 800,
      /** Crack oscillator end frequency (Hz). */
      crackEndFreq: 200,
      /** Crack sweep time (seconds). */
      crackSweepTime: 0.06,
      /** Crack gain start. */
      crackGainStart: 0.1,
      /** Crack decay time (seconds). */
      crackDecayTime: 0.08,
    },
  },

  // ──────────────────────────── GAME / STARTUP ────────────────────────────
  game: {
    /** Delay (ms) before spawning the starter blocks after page load. */
    starterBlockDelayMs: 100,

    /** Starter blocks to spawn: array of { value, offsetX }. offsetX is relative to center. */
    starterBlocks: [
      { value: 1, offsetX: -150 },
      { value: 2, offsetX: -50 },
      { value: 3, offsetX: 70 },
      { value: 4, offsetX: 200 },
      { value: 5, offsetX: 340 },
    ],

    /** Default block value created on a stage click. */
    defaultNewBlockValue: 1,
  },

  // ──────────────────────────── ZOMBIES ────────────────────────────
  zombies: {
    // ── Spawning ──
    spawn: {
      /** Minimum interval (frames) between zombie spawns at night. */
      intervalMinFrames: 90,
      /** Random additional frames added to spawn interval. */
      intervalRandomFrames: 150,
      /** Maximum number of zombies alive at once. */
      maxAlive: 4,
    },

    // ── Appearance ──
    appearance: {
      /** Zombie body width (px). */
      bodyWidth: 22,
      /** Zombie body height (px). */
      bodyHeight: 30,
      /** Zombie body color. */
      bodyColor: 0x2d5a1e,
      /** Zombie head radius (px). */
      headRadius: 10,
      /** Zombie head color. */
      headColor: 0x4a8c3a,
      /** Zombie eye color. */
      eyeColor: 0xff0000,
      /** Zombie eye glow color. */
      eyeGlowColor: 0xff4444,
      /** Zombie eye radius (px). */
      eyeRadius: 2,
      /** Zombie arm length (px). */
      armLength: 14,
      /** Zombie arm width (px line width). */
      armWidth: 3,
      /** Zombie arm color. */
      armColor: 0x3d7a2e,
      /** Zombie leg length (px). */
      legLength: 12,
      /** Zombie leg width (px line width). */
      legWidth: 3,
      /** Zombie leg color. */
      legColor: 0x3d6a2e,
      /** How far above the grass the zombie walks (px). */
      groundOffsetPx: 35,
    },

    // ── Movement ──
    movement: {
      /** Base crawl speed (px per frame). */
      crawlSpeed: 1.2,
      /** Random additional crawl speed. */
      crawlSpeedRange: 0.6,
      /** Arm sway animation speed multiplier. */
      armSwaySpeed: 0.06,
      /** Arm sway amplitude (radians). */
      armSwayAmplitude: 0.4,
      /** Leg sway speed multiplier. */
      legSwaySpeed: 0.08,
      /** Leg sway amplitude (radians). */
      legSwayAmplitude: 0.3,
      /** Body bob speed multiplier. */
      bobSpeed: 0.1,
      /** Body bob amplitude (px). */
      bobAmplitude: 2,
      /** Probability (0–1) of spawning from the right side. */
      spawnRightProbability: 0.5,
      /** Off-screen buffer for spawn/despawn (px). */
      offScreenBufferPx: 50,
      /** Minimum distance to a block before stopping to aim (px). */
      aimDistancePx: 180,
    },

    // ── Shooting ──
    shooting: {
      /** Frames the zombie pauses to aim before firing. */
      aimDurationFrames: 60,
      /** Bullet speed (px per frame). */
      bulletSpeed: 4,
      /** Bullet radius (px). */
      bulletRadius: 4,
      /** Bullet color. */
      bulletColor: 0xaaff44,
      /** Bullet glow color. */
      bulletGlowColor: 0x88cc22,
      /** Bullet glow radius (px). */
      bulletGlowRadius: 8,
      /** Bullet glow alpha. */
      bulletGlowAlpha: 0.3,
      /** Maximum bullet lifetime (frames) before auto-removal. */
      bulletLifetimeFrames: 300,
      /** Cooldown frames between shots for a single zombie. */
      shotCooldownFrames: 120,
      /** Aim wobble (radians) — random inaccuracy added to aim angle. */
      aimWobble: 0.15,
    },

    // ── Impact ──
    impact: {
      /** Flash color on cube break. */
      flashColor: 0xaaff44,
      /** Flash radius (px). */
      flashRadius: 12,
      /** Flash duration (frames). */
      flashDurationFrames: 15,
      /** Number of small debris particles on break. */
      debrisCount: 4,
      /** Debris size (px). */
      debrisSize: 8,
      /** Debris speed multiplier. */
      debrisSpeed: 3,
      /** Debris lifetime (frames). */
      debrisLifeFrames: 40,
      /** Debris gravity. */
      debrisGravity: 0.08,
      /** Debris friction. */
      debrisFriction: 0.97,
    },

    // ── Fade ──
    fade: {
      /** Alpha multiplied by nightAmount to show/hide zombies. */
      nightAlphaMultiplier: 1.0,
      /** Frames to fade out when dawn arrives. */
      dawnFadeFrames: 60,
    },

  },

  // ──────────────────────────── STAGE SYSTEM ────────────────────────────
  stages: {
    /** Base target value for stage 1. Target = baseTarget + stageNum * increment. */
    baseTarget: 4,
    /** Target increase per stage. */
    targetIncrement: 2,
    /** Minimum number of blocks given per stage. */
    baseBlockCount: 3,
    /** Extra blocks given per difficulty tier. */
    blocksPerDifficulty: 1,
    /** A new difficulty tier every N stages. */
    difficultyInterval: 2,
    /** Horizontal spacing (px) between spawned blocks. */
    spawnSpacingPx: 100,
    /** Time (ms) between stage completion and next stage loading. */
    nextStageDelayMs: 3500,
    /** Time (ms) before starter blocks appear for a new stage. */
    stageStartDelayMs: 600,

    // ── Double-Tap Split ──
    split: {
      /** Maximum ms between two taps to register as double-tap. */
      doubleTapThresholdMs: 400,
      /** Velocity magnitude of split pieces (px/frame). */
      force: 7,
      /** Upward bias added to split velocity Y. */
      upwardBias: 0,
      /** Per-frame velocity friction for split pieces. */
      friction: 0.91,
      /** Gravity applied to split pieces per frame. */
      gravity: 0,
      /** Wall bounce retention factor. */
      bounceFactor: 0.4,
      /** Speed threshold below which split velocity is cleared. */
      stopSpeed: 0.4,
      /** Frames to wait after stopping before auto-fuse check. */
      autoFuseDelayFrames: 10,
    },

    // ── Split Puff Effect ──
    splitPuff: {
      /** Number of puff particles. */
      particleCount: 12,
      /** Particle size (px). */
      particleSize: 6,
      /** Particle speed. */
      speed: 4,
      /** Particle lifetime (frames). */
      lifeFrames: 25,
      /** Particle gravity. */
      gravity: 0.06,
      /** Particle colors — randomized per particle. */
      colors: [0xffffff, 0xffeecc, 0xffddaa, 0xeeddcc],
    },

    // ── Confetti Celebration ──
    confetti: {
      /** Number of confetti pieces. */
      count: 80,
      /** Confetti piece size (px). */
      size: 8,
      /** Gravity for confetti fall. */
      gravity: 0.08,
      /** Horizontal spread speed. */
      spreadX: 6,
      /** Initial upward velocity. */
      launchSpeed: 12,
      /** Lifetime (frames). */
      lifeFrames: 250,
      /** Confetti colors. */
      colors: [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6, 0xe84393, 0xffffff],
      /** Spin speed range. */
      maxSpin: 0.2,
    },
  },
};
