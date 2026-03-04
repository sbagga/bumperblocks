// ======================== MOBILE CONFIG OVERRIDES ========================
// Loaded AFTER config.js, BEFORE constants.js.
// Patches the global CONFIG object with mobile-optimized values.
// All game scripts read from CONFIG, so these overrides propagate everywhere.

(function() {
  'use strict';

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const isSmallScreen = screenW < 480;
  const isMediumScreen = screenW < 768;

  // ── App: No header on mobile, full-screen canvas ──
  CONFIG.app.headerHeightInPixels = 0;

  // ── Grid: Scale blocks for mobile screens ──
  if (isSmallScreen) {
    CONFIG.grid.unitSizeInPixels = 36;
    CONFIG.grid.fuseBaseDistanceInPixels = 50;
    CONFIG.grid.irritateExtraDistanceInPixels = 100;
  } else if (isMediumScreen) {
    CONFIG.grid.unitSizeInPixels = 42;
    CONFIG.grid.fuseBaseDistanceInPixels = 55;
    CONFIG.grid.irritateExtraDistanceInPixels = 120;
  }
  // else keep default 48px for tablets

  // ── Blocks: Touch-friendly adjustments ──
  CONFIG.blocks.rendering.labelFontSize = isSmallScreen ? 16 : 18;
  CONFIG.blocks.rendering.cubeCornerRadius = isSmallScreen ? 6 : 8;

  // Larger interaction zones for touch
  CONFIG.blocks.interaction.fuseZonePadding = 6;

  // Splitting: larger dead zone for imprecise touch
  CONFIG.blocks.splitting.dragDeadZonePx = 12;
  CONFIG.blocks.splitting.thresholdDistancePx = isSmallScreen ? 80 : 100;

  // ── Sky: Keep timings, adjust sun/moon for smaller screens ──
  if (isSmallScreen) {
    CONFIG.sky.sun.bodyRadius = 30;
    CONFIG.sky.sun.rayOuterRadius = 55;
    CONFIG.sky.sun.rayInnerRadius = 38;
    CONFIG.sky.moon.bodyRadius = 22;
  }

  // ── Environment: Adjust tree and grass for mobile ──
  if (isSmallScreen) {
    CONFIG.environment.tree.positionX = 10;
    CONFIG.environment.grass.bladeMinHeight = 14;
    CONFIG.environment.grass.bladeHeightRange = 16;
    CONFIG.environment.grass.bladeWidth = 5;
  }

  // ── Wrecking: Slightly smaller on mobile ──
  if (isSmallScreen) {
    CONFIG.wrecking.ball.radius = 20;
    CONFIG.wrecking.ball.defaultChainLengthPx = 90;
    CONFIG.wrecking.ball.maxDragDistance = 180;
    CONFIG.wrecking.debris.size = 16;
  }

  // ── Game: Fewer starter blocks on small screens ──
  if (isSmallScreen) {
    CONFIG.game.starterBlocks = [
      { value: 1, offsetX: -80 },
      { value: 2, offsetX: 0 },
      { value: 3, offsetX: 80 },
    ];
  } else if (isMediumScreen) {
    CONFIG.game.starterBlocks = [
      { value: 1, offsetX: -120 },
      { value: 2, offsetX: -30 },
      { value: 3, offsetX: 60 },
      { value: 4, offsetX: 150 },
    ];
  }

  // ── Zombies: Slightly easier on mobile by default ──
  DIFFICULTY.defaultLevel = 2;

  console.log(`[Mobile] Config applied — screen: ${screenW}x${screenH}, unit: ${CONFIG.grid.unitSizeInPixels}px`);
})();
