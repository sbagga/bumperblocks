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

  // ── Sky: Adjust sun/moon for narrower screens ──
  // Reduce overshoot so sun/moon stay visible on narrow screens
  if (isSmallScreen) {
    CONFIG.sky.sun.bodyRadius = 30;
    CONFIG.sky.sun.rayOuterRadius = 55;
    CONFIG.sky.sun.rayInnerRadius = 38;
    CONFIG.sky.sun.arcHorizontalOvershootPx = 20;
    CONFIG.sky.sun.arcHeightFraction = 0.6;
    CONFIG.sky.sun.arcBaselineOffsetFromBottom = 60;
    CONFIG.sky.moon.bodyRadius = 22;
    CONFIG.sky.moon.arcHorizontalOvershootPx = 20;
    CONFIG.sky.moon.arcHeightFraction = 0.6;
    CONFIG.sky.moon.arcBaselineOffsetFromBottom = 60;
  } else if (isMediumScreen) {
    CONFIG.sky.sun.arcHorizontalOvershootPx = 35;
    CONFIG.sky.sun.arcBaselineOffsetFromBottom = 55;
    CONFIG.sky.moon.arcHorizontalOvershootPx = 35;
    CONFIG.sky.moon.arcBaselineOffsetFromBottom = 55;
  }

  // ── Environment: Adjust tree, grass, and floor for mobile ──
  // Increase grass/floor height to remain visible above FAB toolbar
  CONFIG.environment.grass.baseHeightFromBottom = isSmallScreen ? 65 : 55;
  CONFIG.environment.grass.innerTopOffset = isSmallScreen ? 58 : 48;
  CONFIG.environment.grass.innerHeight = isSmallScreen ? 40 : 35;
  CONFIG.environment.grass.bladeBaseOffsetFromBottom = isSmallScreen ? 38 : 28;
  if (isSmallScreen) {
    CONFIG.environment.tree.positionX = 10;
    CONFIG.environment.tree.baseOffsetFromBottom = 45;
    CONFIG.environment.grass.bladeMinHeight = 14;
    CONFIG.environment.grass.bladeHeightRange = 16;
    CONFIG.environment.grass.bladeWidth = 5;
  } else if (isMediumScreen) {
    CONFIG.environment.tree.baseOffsetFromBottom = 40;
  }

  // ── Zombies: Position above the raised floor, easier default ──
  CONFIG.zombies.appearance.groundOffsetPx = isSmallScreen ? 60 : 50;
  CONFIG.zombies.movement.aimDistancePx = isSmallScreen ? 120 : 150;

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

  // ── Stage: Adjust spawn spacing for narrow screens ──
  if (isSmallScreen) {
    CONFIG.stages.spawnSpacingPx = 70;
  } else if (isMediumScreen) {
    CONFIG.stages.spawnSpacingPx = 85;
  }

  // ── Zombies: Slightly easier on mobile by default ──
  DIFFICULTY.defaultLevel = 2;

  console.log(`[Mobile] Config applied — screen: ${screenW}x${screenH}, unit: ${CONFIG.grid.unitSizeInPixels}px`);
})();
