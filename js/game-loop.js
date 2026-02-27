// ======================== GAME LOOP ========================
// Main ticker — all per-frame updates live here.
// Depends on: ALL other js files (this is the last script loaded).
// See: ARCHITECTURE.md for design principles.
// See: docs/DAY_NIGHT_CYCLE.md for sun/moon arc math.

const _sunCfg = CONFIG.sky.sun;
const _moonCfg = CONFIG.sky.moon;
const _starsCfg = CONFIG.sky.stars;
const _ssCfg = CONFIG.sky.shootingStars;
const _nightCfg = CONFIG.sky.nightOverlay;
const _hGlowCfg = CONFIG.sky.horizonGlow;
const _treeCfg = CONFIG.environment.tree;
const _grassCfg = CONFIG.environment.grass;
const _birdCfg = CONFIG.environment.birds;
const _bAnimCfg = CONFIG.blocks.animation;
const _gameCfg = CONFIG.game;

// --- Stage click handler (create block or place pin) ---
app.stage.interactive = true;
app.stage.hitArea = new PIXI.Rectangle(0, 0, appWidth, appHeight);
app.view.addEventListener('contextmenu', (e) => e.preventDefault());

app.stage.on('pointerdown', (e) => {
  if (e.data.button !== 0) return;
  const target = e.target;
  if (target !== app.stage) return;

  const pos = e.data.getLocalPosition(app.stage);

  // If a block is selected, clicking empty space deselects it (don't create a new block)
  if (selectedBlock && !wreckMode) {
    deselectBlock();
    return;
  }

  // Don't spawn a block if the click is within one UNIT of an existing block
  if (!wreckMode) {
    for (const block of blocks) {
      if (block._deleteAnim >= 0) continue;
      const dims = getBlockDims(block);
      const bx = block.container.x - UNIT;
      const by = block.container.y - UNIT;
      const bw = dims.cols * UNIT + UNIT * 2;
      const bh = dims.rows * UNIT + UNIT * 2;
      if (pos.x >= bx && pos.x <= bx + bw && pos.y >= by && pos.y <= by + bh) {
        return; // click is too close to an existing block — do nothing
      }
    }
  }

  if (wreckMode) {
    placePin(pos.x, pos.y);
  } else {
    createBlock(_gameCfg.defaultNewBlockValue, pos.x, pos.y);
  }
});

// --- Main ticker ---
let elapsedTime = 0;

app.ticker.add((delta) => {
  elapsedTime += delta;
  const now = performance.now();

  // ---- FULL DAY/NIGHT CYCLE ----
  const cycleElapsed = (now - sunStartTime) % SUN_CYCLE_DURATION;
  const t = cycleElapsed / SUN_CYCLE_DURATION;
  const { phase, nightAmount, duskDawnAmount } = getDayPhase(t);

  // ---- SUN (day half: t = 0.0 → 0.5) ----
  const sunVisible = (t < 0.55);
  if (sunVisible) {
    const sunT = Math.min(1, t / 0.5);
    const sunOvershoot = _sunCfg.arcHorizontalOvershootPx;
    const sunX = -sunOvershoot + (appWidth + sunOvershoot * 2) * sunT;
    const arcHeight = appHeight * _sunCfg.arcHeightFraction;
    const sunBaseY = appHeight - _sunCfg.arcBaselineOffsetFromBottom;
    const sunY = sunBaseY - arcHeight * 4 * sunT * (1 - sunT);

    sunContainer.x = sunX + _sunCfg.bodyRadius;
    sunContainer.y = sunY + _sunCfg.bodyRadius;

    const horizonFade = Math.min(1, 4 * sunT * (1 - sunT) * 2);
    sunContainer.alpha = Math.max(0, horizonFade * (1 - nightAmount));

    // Rotate rays
    sunRaysAngle += _sunCfg.rayRotationSpeedPerDelta * delta;
    sunRays.rotation = sunRaysAngle;

    // Sun pulse
    const pulse = 1 + Math.sin(now * _sunCfg.pulseFrequency) * _sunCfg.pulseAmplitude;
    sunBody.scale.set(pulse);

    const warmth = 1 - 4 * Math.pow(sunT - 0.5, 2);
    drawSun(warmth);

    // Shadow direction
    const sunCenterX = sunX + _sunCfg.bodyRadius;
    const sunAltitude = Math.max(0.1, 1 - (sunY / appHeight));
    const shadowLengthFactor = 1.5 / Math.max(0.3, sunAltitude);
    const shadowDirX = (appWidth / 2 - sunCenterX) / appWidth;

    // Tree shadow
    if (treeShadowGfx) {
      const treeShX = shadowDirX * _treeCfg.shadowDirectionMultiplier * shadowLengthFactor;
      const treeScale = _treeCfg.shadowBaseScale + (1 - sunAltitude) * _treeCfg.shadowHorizonExtraScale;
      treeShadowGfx.scale.x = treeScale;
      treeShadowGfx.x = _treeCfg.shadowPositionX + treeShX;
      treeShadowGfx.alpha = Math.max(0.05, horizonFade * 0.25) * (1 - nightAmount);
    }

    // Block shadows
    updateBlockShadows(shadowDirX, shadowLengthFactor, sunAltitude, horizonFade * (1 - nightAmount));
  } else {
    sunContainer.alpha = 0;
    if (treeShadowGfx) treeShadowGfx.alpha = 0;
    updateBlockShadows(0, 1, 1, 0);
  }

  // ---- NIGHT OVERLAY ----
  nightOverlay.alpha = nightAmount * _nightCfg.maxAlpha;

  // ---- DAWN / DUSK GLOW ----
  if (phase === 'dusk') {
    drawHorizonGlow(_hGlowCfg.duskColor, duskDawnAmount);
    horizonGlow.alpha = 1;
  } else if (phase === 'dawn') {
    drawHorizonGlow(_hGlowCfg.dawnColor, duskDawnAmount);
    horizonGlow.alpha = 1;
  } else {
    horizonGlow.alpha = 0;
  }

  // ---- MOON (night half: t = 0.5 → 1.0, same arc as sun) ----
  if (t >= 0.5) {
    const moonT = (t - 0.5) / 0.5;
    const moonOvershoot = _moonCfg.arcHorizontalOvershootPx;
    const moonX = -moonOvershoot + (appWidth + moonOvershoot * 2) * moonT;
    const moonArcH = appHeight * _moonCfg.arcHeightFraction;
    const moonBaseY = appHeight - _moonCfg.arcBaselineOffsetFromBottom;
    const moonY = moonBaseY - moonArcH * 4 * moonT * (1 - moonT);

    moonContainer.x = moonX + _moonCfg.bodyRadius;
    moonContainer.y = moonY + _moonCfg.bodyRadius;
    moonContainer.alpha = nightAmount * Math.min(1, 4 * moonT * (1 - moonT) * 3);
  } else if (nightAmount > 0) {
    // Dawn wrap: keep moon at last position, just fade out with nightAmount
    moonContainer.alpha = nightAmount * 0.5;
  } else {
    moonContainer.alpha = 0;
  }

  // ---- STARS ----
  starContainer.alpha = nightAmount;
  for (const star of allStars) {
    star.twinklePhase += delta * _starsCfg.twinklePhaseMultiplier * star.twinkleSpeed;
    const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
    star.gfx.alpha = _starsCfg.twinkleMinAlpha + twinkle * _starsCfg.twinkleAlphaRange * star.brightness;
    star.gfx.scale.set(_starsCfg.twinkleMinScale + twinkle * _starsCfg.twinkleScaleRange);
  }

  constellationLineGfx.alpha = nightAmount * _starsCfg.constellationLineNightAlpha;

  // ---- SHOOTING STARS (only at night) ----
  if (phase === 'night') {
    shootingStarTimer += delta;
    if (shootingStarTimer >= nextShootingStarSpawn) {
      shootingStarTimer = 0;
      nextShootingStarSpawn = _ssCfg.spawnIntervalMinFrames + Math.random() * _ssCfg.spawnIntervalRandomFrames;
      spawnShootingStar();
    }
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.life += delta;
    ss.x += ss.vx * delta;
    ss.y += ss.vy * delta;

    ss.trail.clear();
    const progress = ss.life / ss.maxLife;
    const alpha = 1 - progress;
    if (alpha > 0) {
      ss.trail.beginFill(0xffffff, alpha * _ssCfg.headAlphaMultiplier);
      ss.trail.drawCircle(ss.x, ss.y, _ssCfg.headRadius);
      ss.trail.endFill();
      const tailLen = ss.length * (1 - progress * _ssCfg.trailShrinkFactor);
      const tailX = ss.x - Math.cos(ss.angle) * tailLen;
      const tailY = ss.y - Math.sin(ss.angle) * tailLen;
      ss.trail.lineStyle({ width: _ssCfg.primaryTrailWidth, color: 0xffffff, alpha: alpha * _ssCfg.primaryTrailAlpha });
      ss.trail.moveTo(ss.x, ss.y);
      ss.trail.lineTo(tailX, tailY);
      ss.trail.lineStyle({ width: _ssCfg.secondaryTrailWidth, color: _ssCfg.secondaryTrailColor, alpha: alpha * _ssCfg.secondaryTrailAlpha });
      const tailX2 = ss.x - Math.cos(ss.angle) * tailLen * _ssCfg.secondaryTrailLengthMultiplier;
      const tailY2 = ss.y - Math.sin(ss.angle) * tailLen * _ssCfg.secondaryTrailLengthMultiplier;
      ss.trail.moveTo(tailX, tailY);
      ss.trail.lineTo(tailX2, tailY2);
    }

    if (ss.life >= ss.maxLife) {
      nightSkyLayer.removeChild(ss.trail);
      ss.trail.destroy();
      shootingStars.splice(i, 1);
    }
  }

  // ---- TREE SWAY ----
  if (treeSprite) {
    const sway = Math.sin(now * _treeCfg.primarySwayFrequency) * _treeCfg.primarySwayAmplitude
               + Math.sin(now * _treeCfg.secondarySwayFrequency) * _treeCfg.secondarySwayAmplitude;
    treeSprite.rotation = sway;
    treeSprite.tint = lerpColor(0xffffff, _treeCfg.nightTintColor, nightAmount * _treeCfg.nightTintStrength);
  }

  // ---- GRASS SWAY & NIGHT TINT ----
  const grassNightTint = lerpColor(0xffffff, _grassCfg.bladeNightTintColor, nightAmount * _grassCfg.bladeNightTintStrength);
  for (const blade of grassBlades) {
    const swayAngle = Math.sin(now * _grassCfg.bladeSwayTimeScale * blade.speed + blade.phase) * blade.amplitude;
    blade.gfx.skew.x = blade.baseSkew + swayAngle;
    blade.gfx.tint = grassNightTint;
  }
  grassBackGfx.tint = lerpColor(0xffffff, _grassCfg.baseNightTintColor, nightAmount * _grassCfg.baseNightTintStrength);

  // ---- BIRDS (day/dawn only) ----
  const birdsAllowed = (phase === 'day' || phase === 'dawn');
  birdTimer += delta;
  if (birdsAllowed && birdTimer >= nextBirdSpawn) {
    birdTimer = 0;
    nextBirdSpawn = _birdCfg.spawnIntervalMinFrames + Math.random() * _birdCfg.spawnIntervalRandomFrames;
    const flockSize = Math.random() < _birdCfg.flockProbability
      ? (_birdCfg.flockMinSize + Math.floor(Math.random() * _birdCfg.flockSizeRange))
      : 1;
    for (let i = 0; i < flockSize; i++) {
      setTimeout(() => {
        if (getDayPhase((performance.now() - sunStartTime) % SUN_CYCLE_DURATION / SUN_CYCLE_DURATION).phase !== 'night') spawnBird();
      }, i * _birdCfg.flockSpawnDelayMs);
    }
  }

  for (let i = birds.length - 1; i >= 0; i--) {
    const bird = birds[i];
    bird.elapsed += delta;
    const bt = Math.min(1, bird.elapsed / bird.duration);

    bird.gfx.x = bird.startX + (bird.endX - bird.startX) * bt;
    bird.gfx.y = bird.startY + (bird.endY - bird.startY) * bt;

    bird.wingPhase += delta * _birdCfg.wingFlapSpeed;
    const flapScale = _birdCfg.wingFlapMinScale + Math.abs(Math.sin(bird.wingPhase)) * _birdCfg.wingFlapScaleRange;
    bird.gfx.scale.y = flapScale;

    let birdAlpha = 1;
    if (bt < _birdCfg.fadeInFraction) birdAlpha = bt / _birdCfg.fadeInFraction;
    else if (bt > 1 - _birdCfg.fadeOutFraction) birdAlpha = (1 - bt) / _birdCfg.fadeOutFraction;
    bird.gfx.alpha = birdAlpha * (1 - nightAmount);

    if (bt >= 1 || nightAmount >= 1) {
      birdLayer.removeChild(bird.gfx);
      bird.gfx.destroy();
      birds.splice(i, 1);
    }
  }

  // ---- BLOCK SPAWN ANIMATIONS ----
  for (const block of blocks) {
    if (block._spawnAnim < 1) {
      block._spawnAnim = Math.min(1, block._spawnAnim + _bAnimCfg.spawnAnimationSpeed * delta);
      const s = easeOutBack(block._spawnAnim);
      block.container.scale.set(s);
    }

    if (block._fuseAnim !== undefined && block._fuseAnim < 1) {
      block._fuseAnim = Math.min(1, block._fuseAnim + _bAnimCfg.fuseAnimationSpeed * delta);
      const s = 1 + _bAnimCfg.fuseBounceAmplitude * (1 - block._fuseAnim) * Math.sin(block._fuseAnim * Math.PI);
      block.container.scale.set(s);
      if (block._fuseAnim >= 1) {
        block.container.scale.set(1);
        delete block._fuseAnim;
      }
    }
  }

  // ---- BLOCK DELETE ANIMATIONS ----
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block._deleteAnim >= 0) {
      block._deleteAnim += _bAnimCfg.deleteSpeed * delta;
      const dt = block._deleteAnim;
      if (dt >= _bAnimCfg.deleteDelayFraction) {
        const poof = (dt - _bAnimCfg.deleteDelayFraction) / (1 - _bAnimCfg.deleteDelayFraction);
        block.container.scale.set(1 - poof * _bAnimCfg.deleteScaleShrink);
        block.container.rotation = poof * _bAnimCfg.deleteRotation;
        block.container.alpha = 1 - poof;
        if (poof >= 1) {
          if (block.shadowGfx) {
            blockShadowLayer.removeChild(block.shadowGfx);
            block.shadowGfx.destroy();
          }
          blockLayer.removeChild(block.container);
          block.container.destroy({ children: true });
          blocks.splice(i, 1);
        }
      }
    }
  }

  // ---- DEBRIS ----
  for (let i = debrisList.length - 1; i >= 0; i--) {
    const d = debrisList[i];
    d.vy += DEBRIS_GRAVITY;
    d.vx *= DEBRIS_FRICTION;
    d.vy *= DEBRIS_FRICTION;
    d.x += d.vx;
    d.y += d.vy;
    d.angle += d.spin;
    d.spin *= _wDebris.spinDamping;
    d.life--;

    const half = DEBRIS_SIZE / 2;
    if (d.x - half < 0) { d.x = half; d.vx = Math.abs(d.vx) * DEBRIS_BOUNCE; playBounceSound(); }
    if (d.x + half > appWidth) { d.x = appWidth - half; d.vx = -Math.abs(d.vx) * DEBRIS_BOUNCE; playBounceSound(); }
    if (d.y - half < 0) { d.y = half; d.vy = Math.abs(d.vy) * DEBRIS_BOUNCE; playBounceSound(); }
    if (d.y + half > appHeight) { d.y = appHeight - half; d.vy = -Math.abs(d.vy) * DEBRIS_BOUNCE; playBounceSound(); }

    // Debris → block collision (chain reaction)
    const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
    if (speed > _wDebris.chainReactionMinSpeed) {
      for (let j = blocks.length - 1; j >= 0; j--) {
        const block = blocks[j];
        if (block._deleteAnim >= 0) continue;
        const bc = getBlockCenter(block);
        const dims = getBlockDims(block);
        const br = Math.max(dims.cols, dims.rows) * UNIT / 2;
        const dist = Math.sqrt((d.x - bc.x) ** 2 + (d.y - bc.y) ** 2);
        if (dist < br + half) {
          wreckBlock(block, d.vx * _wDebris.chainReactionBlockFraction, d.vy * _wDebris.chainReactionBlockFraction);
          d.vx *= _wDebris.chainReactionDebrisRetention;
          d.vy *= _wDebris.chainReactionDebrisRetention;
          break;
        }
      }
    }

    d.gfx.x = d.x;
    d.gfx.y = d.y;
    d.gfx.rotation = d.angle;

    if (d.life < _wDebris.fadeStartRemainingFrames) d.gfx.alpha = d.life / _wDebris.fadeStartRemainingFrames;

    if (d.life <= 0 || (speed < _wDebris.earlyRemoveSpeedThreshold && d.life < _wDebris.earlyRemoveLifeThreshold)) {
      effectLayer.removeChild(d.gfx);
      d.gfx.destroy();
      debrisList.splice(i, 1);
    }
  }
});

// ======================== CLEAR ALL ========================
window.clearAll = function() {
  deselectBlock();
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block.shadowGfx) {
      blockShadowLayer.removeChild(block.shadowGfx);
      block.shadowGfx.destroy();
    }
    blockLayer.removeChild(block.container);
    block.container.destroy({ children: true });
  }
  blocks = [];
  clearWreckingBall();

  for (const d of debrisList) {
    effectLayer.removeChild(d.gfx);
    d.gfx.destroy();
  }
  debrisList.length = 0;
};

// ======================== STARTER BLOCKS ========================
setTimeout(() => {
  const cx = appWidth / 2;
  const cy = appHeight / 2;
  for (const sb of _gameCfg.starterBlocks) {
    createBlock(sb.value, cx + sb.offsetX, cy);
  }
}, _gameCfg.starterBlockDelayMs);

// Spawn first bird soon
setTimeout(spawnBird, _birdCfg.firstBirdDelayMs);
