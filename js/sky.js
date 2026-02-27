// ======================== SKY SYSTEM ========================
// Sun, moon, stars, constellations, shooting stars, night overlay.
// Depends on: config.js, app.js (appWidth, appHeight, bgLayer, nightSkyLayer), constants.js (hslToRgb, lerpColor)
// See: docs/DAY_NIGHT_CYCLE.md for phase timing and arc math.

const _sun = CONFIG.sky.sun;
const _moon = CONFIG.sky.moon;
const _stars = CONFIG.sky.stars;
const _ss = CONFIG.sky.shootingStars;
const _nightOv = CONFIG.sky.nightOverlay;
const _hGlow = CONFIG.sky.horizonGlow;
const _cycle = CONFIG.sky.dayNightCycle;

// ======================== SUN ========================
const sunContainer = new PIXI.Container();
bgLayer.addChild(sunContainer);

const sunGlow = new PIXI.Graphics();
sunContainer.addChild(sunGlow);

const sunBody = new PIXI.Graphics();
sunContainer.addChild(sunBody);

const sunRays = new PIXI.Graphics();
sunContainer.addChild(sunRays);

function drawSun(warmth) {
  sunGlow.clear();
  for (let i = _sun.glowRingCount - 1; i >= 0; i--) {
    const r = _sun.bodyRadius + i * _sun.glowRingSpacing;
    const a = _sun.glowRingBaseAlpha * (1 - i / _sun.glowRingCount);
    sunGlow.beginFill(_sun.glowColor, a);
    sunGlow.drawCircle(0, 0, r);
    sunGlow.endFill();
  }

  sunBody.clear();
  const baseColor = lerpColor(_sun.bodyCoolColor, _sun.bodyWarmColor, warmth);
  sunBody.beginFill(baseColor);
  sunBody.drawCircle(0, 0, _sun.bodyRadius);
  sunBody.endFill();
  sunBody.beginFill(_sun.highlightColor, _sun.highlightAlpha);
  sunBody.drawCircle(_sun.highlightOffsetX, _sun.highlightOffsetY, _sun.highlightRadius);
  sunBody.endFill();
}

function drawSunRays() {
  sunRays.clear();
  for (let i = 0; i < _sun.rayCount; i++) {
    const angle = (i / _sun.rayCount) * Math.PI * 2;
    sunRays.beginFill(_sun.rayColor, _sun.rayAlpha);
    sunRays.moveTo(Math.cos(angle - _sun.rayHalfAngle) * _sun.rayInnerRadius, Math.sin(angle - _sun.rayHalfAngle) * _sun.rayInnerRadius);
    sunRays.lineTo(Math.cos(angle) * _sun.rayOuterRadius, Math.sin(angle) * _sun.rayOuterRadius);
    sunRays.lineTo(Math.cos(angle + _sun.rayHalfAngle) * _sun.rayInnerRadius, Math.sin(angle + _sun.rayHalfAngle) * _sun.rayInnerRadius);
    sunRays.endFill();
  }
}

drawSun(0.5);
drawSunRays();

// Full day/night cycle duration (ms). See docs/DAY_NIGHT_CYCLE.md.
const SUN_CYCLE_DURATION = _cycle.fullCycleDurationMs;
let sunStartTime = performance.now();
let sunRaysAngle = 0;

// ======================== MOON ========================
const moonContainer = new PIXI.Container();
nightSkyLayer.addChild(moonContainer);

const moonBody = new PIXI.Graphics();

function drawMoon() {
  moonBody.clear();
  // Full moon disc
  moonBody.beginFill(_moon.bodyColor);
  moonBody.drawCircle(0, 0, _moon.bodyRadius);
  moonBody.endFill();
  // Bright highlight
  moonBody.beginFill(_moon.highlightColor, _moon.highlightAlpha);
  moonBody.drawCircle(_moon.highlightOffsetX, _moon.highlightOffsetY, _moon.highlightRadius);
  moonBody.endFill();
  // Crescent shadow
  moonBody.beginFill(_moon.crescentColor, _moon.crescentAlpha);
  moonBody.drawCircle(_moon.crescentOffsetX, _moon.crescentOffsetY, _moon.crescentRadius);
  moonBody.endFill();
  // Craters
  moonBody.beginFill(_moon.craterColor, _moon.craterAlpha);
  for (const c of _moon.craters) {
    moonBody.drawCircle(c.x, c.y, c.radius);
  }
  moonBody.endFill();
}
drawMoon();
moonContainer.addChild(moonBody);

// Moon glow
const moonGlow = new PIXI.Graphics();
moonGlow.beginFill(_moon.glowColor, _moon.innerGlowAlpha);
moonGlow.drawCircle(0, 0, _moon.innerGlowRadius);
moonGlow.endFill();
moonGlow.beginFill(_moon.glowColor, _moon.outerGlowAlpha);
moonGlow.drawCircle(0, 0, _moon.outerGlowRadius);
moonGlow.endFill();
moonContainer.addChildAt(moonGlow, 0);
moonContainer.alpha = 0;

// ======================== CONSTELLATIONS ========================
// 7 real constellations. See docs/DAY_NIGHT_CYCLE.md for placement details.
const CONSTELLATIONS = [
  { // Orion
    name: 'Orion', ox: 0.15, oy: 0.05,
    stars: [[0,0,1],[.06,0,1],[.12,0,.9],
            [-.03,-.08,1.2],[.15,-.08,1.1],
            [-.05,.1,.9],[.17,.1,.8],
            [.06,-.14,.7]],
    lines: [[0,1],[1,2],[3,0],[2,4],[3,7],[4,7],[5,0],[2,6]]
  },
  { // Ursa Major (Big Dipper)
    name: 'Ursa Major', ox: 0.45, oy: 0.03,
    stars: [[0,0,1],[.06,.02,1],[.12,.01,.9],[.16,.05,1],
            [.22,.04,1.1],[.26,.02,1],[.24,-.02,.9]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]
  },
  { // Cassiopeia (W shape)
    name: 'Cassiopeia', ox: 0.7, oy: 0.02,
    stars: [[0,.02,1],[.04,0,1.1],[.08,.03,.9],[.12,0,1],[.16,.02,.9]],
    lines: [[0,1],[1,2],[2,3],[3,4]]
  },
  { // Leo
    name: 'Leo', ox: 0.3, oy: 0.22,
    stars: [[0,0,1],[.04,-.04,1.1],[.08,-.02,.9],[.12,0,1],
            [.06,.04,.8],[.02,.06,.9],[-.01,.03,.8]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]]
  },
  { // Scorpius (tail section)
    name: 'Scorpius', ox: 0.82, oy: 0.18,
    stars: [[0,0,1.2],[.03,.03,1],[.05,.07,.9],[.04,.11,1],
            [.02,.14,.9],[-.01,.16,.8],[-.04,.14,.7]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
  },
  { // Cygnus (Northern Cross)
    name: 'Cygnus', ox: 0.55, oy: 0.1,
    stars: [[.04,0,1.1],[.04,.04,1],[.04,.08,.9],[.04,.12,1],
            [0,.06,.8],[.08,.06,.8]],
    lines: [[0,1],[1,2],[2,3],[4,2],[2,5]]
  },
  { // Gemini (the twins)
    name: 'Gemini', ox: 0.05, oy: 0.28,
    stars: [[0,0,1.2],[.06,0,1.1],[0,.05,.8],[.06,.05,.8],
            [-.01,.1,.7],[.07,.1,.7]],
    lines: [[0,1],[0,2],[1,3],[2,4],[3,5]]
  },
];

// Build star container
const starContainer = new PIXI.Container();
nightSkyLayer.addChild(starContainer);
starContainer.alpha = 0;

const constellationLineGfx = new PIXI.Graphics();
starContainer.addChild(constellationLineGfx);

const allStars = []; // { gfx, screenX, screenY, brightness, twinklePhase, twinkleSpeed }

CONSTELLATIONS.forEach(c => {
  const hMargin = _stars.constellationHorizontalMargin;
  const vFrac = _stars.constellationVerticalFraction;
  const vOff = _stars.constellationVerticalOffset;

  const screenStars = c.stars.map(([sx, sy, br]) => {
    const screenX = (c.ox + sx) * appWidth * (1 - 2 * hMargin) + appWidth * hMargin;
    const screenY = (c.oy + sy) * appHeight * vFrac + appHeight * vOff;
    return { screenX, screenY, brightness: br };
  });

  // Constellation lines
  c.lines.forEach(([i, j]) => {
    constellationLineGfx.lineStyle(_stars.constellationLineWidth, 0xffffff, _stars.constellationLineAlpha);
    constellationLineGfx.moveTo(screenStars[i].screenX, screenStars[i].screenY);
    constellationLineGfx.lineTo(screenStars[j].screenX, screenStars[j].screenY);
  });

  // Star sprites
  screenStars.forEach(({ screenX, screenY, brightness }) => {
    const star = new PIXI.Graphics();
    const size = _stars.constellationStarBaseSize + brightness * _stars.constellationStarSizeMultiplier;
    star.beginFill(0xffffff, _stars.starGlowAlpha);
    star.drawCircle(0, 0, size * _stars.starGlowRadiusMultiplier);
    star.endFill();
    star.beginFill(0xffffff, _stars.starBodyAlpha);
    star.drawCircle(0, 0, size);
    star.endFill();
    star.beginFill(0xffffff, 1);
    star.drawCircle(0, 0, size * _stars.starCoreRadiusMultiplier);
    star.endFill();
    star.x = screenX;
    star.y = screenY;
    starContainer.addChild(star);
    allStars.push({
      gfx: star, screenX, screenY, brightness,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: _stars.twinkleMinSpeed + Math.random() * _stars.twinkleSpeedRange,
    });
  });
});

// Ambient (non-constellation) stars
for (let i = 0; i < _stars.ambientStarCount; i++) {
  const sx = Math.random() * appWidth;
  const sy = Math.random() * appHeight * _stars.ambientStarVerticalFraction;
  const br = _stars.ambientMinBrightness + Math.random() * _stars.ambientBrightnessRange;
  const star = new PIXI.Graphics();
  const size = 0.6 + br;
  star.beginFill(0xffffff, _stars.ambientGlowAlpha);
  star.drawCircle(0, 0, size * _stars.ambientGlowRadiusMultiplier);
  star.endFill();
  star.beginFill(0xffffff, _stars.ambientBodyAlpha);
  star.drawCircle(0, 0, size);
  star.endFill();
  star.x = sx;
  star.y = sy;
  starContainer.addChild(star);
  allStars.push({
    gfx: star, screenX: sx, screenY: sy, brightness: br,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: _stars.ambientTwinkleMinSpeed + Math.random() * _stars.ambientTwinkleSpeedRange,
  });
}

// ======================== SHOOTING STARS ========================
const shootingStars = [];
let shootingStarTimer = 0;
let nextShootingStarSpawn = _ss.initialSpawnIntervalMinFrames + Math.random() * _ss.initialSpawnIntervalRandomFrames;

function spawnShootingStar() {
  const startX = Math.random() * appWidth * _ss.spawnHorizontalWidthFraction + appWidth * _ss.spawnHorizontalMarginFraction;
  const startY = Math.random() * appHeight * _ss.spawnVerticalFraction;
  const angle = _ss.trajectoryMinAngle + Math.random() * _ss.trajectoryAngleRange;
  const speed = _ss.minSpeed + Math.random() * _ss.speedRange;
  const length = _ss.minTrailLength + Math.random() * _ss.trailLengthRange;

  const trail = new PIXI.Graphics();
  nightSkyLayer.addChild(trail);

  shootingStars.push({
    trail, x: startX, y: startY, angle, speed, length,
    life: 0, maxLife: _ss.minLifeFrames + Math.random() * _ss.lifeFrameRange,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  });
}

// ======================== NIGHT OVERLAY ========================
const nightOverlay = new PIXI.Graphics();
nightOverlay.beginFill(_nightOv.color);
nightOverlay.drawRect(0, 0, appWidth, appHeight);
nightOverlay.endFill();
nightOverlay.alpha = 0;
bgLayer.addChild(nightOverlay);

// ======================== HORIZON GLOW ========================
const horizonGlow = new PIXI.Graphics();
horizonGlow.alpha = 0;
bgLayer.addChild(horizonGlow);

function drawHorizonGlow(color, intensity) {
  horizonGlow.clear();
  const bands = _hGlow.bandCount;
  const glowH = appHeight * _hGlow.heightFraction;
  for (let i = 0; i < bands; i++) {
    const bandY = appHeight - glowH + (i / bands) * glowH;
    const bandH = glowH / bands + 2;
    const alpha = intensity * (1 - i / bands) * _hGlow.peakAlpha;
    horizonGlow.beginFill(color, alpha);
    horizonGlow.drawRect(0, bandY, appWidth, bandH);
    horizonGlow.endFill();
  }
}

// ======================== DAY PHASE HELPER ========================
// Returns { phase, nightAmount, duskDawnAmount } for a given t (0–1).
// See docs/DAY_NIGHT_CYCLE.md for the phase table.
function getDayPhase(t) {
  let nightAmount = 0;
  let duskDawnAmount = 0;
  let phase = 'day';

  const dawnEnd = _cycle.dawnEndFraction;
  const duskStart = _cycle.duskStartFraction;
  const duskEnd = _cycle.duskEndFraction;
  const nightEnd = _cycle.nightEndFraction;

  if (t < dawnEnd) {
    phase = 'dawn';
    duskDawnAmount = 1 - t / dawnEnd;
    nightAmount = duskDawnAmount;
  } else if (t < duskStart) {
    phase = 'day';
  } else if (t < duskEnd) {
    phase = 'dusk';
    duskDawnAmount = (t - duskStart) / (duskEnd - duskStart);
    nightAmount = duskDawnAmount;
  } else if (t < nightEnd) {
    phase = 'night';
    nightAmount = 1;
  } else {
    phase = 'dawn';
    duskDawnAmount = 1 - (t - nightEnd) / (1 - nightEnd);
    nightAmount = duskDawnAmount;
  }
  return { phase, nightAmount, duskDawnAmount };
}
