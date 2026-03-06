// ======================== ZOMBIE SYSTEM ========================
// Zombies spawn at night, crawl toward blocks, and shoot bullets
// that destroy individual cubes. Block shape is preserved.
// Depends on: config.js, app.js, constants.js, sound.js, blocks.js
// Loaded between blocks.js and wrecking.js.

const _zSpawn = CONFIG.zombies.spawn;
const _zAppear = CONFIG.zombies.appearance;
const _zMove = CONFIG.zombies.movement;
const _zShoot = CONFIG.zombies.shooting;
const _zImpact = CONFIG.zombies.impact;
const _zFade = CONFIG.zombies.fade;

const zombies = [];
const zombieBullets = [];
const zombieDebrisList = [];
let zombieSpawnTimer = 0;
let nextZombieSpawn = 30; // first zombie spawns quickly
let zombieDifficulty = DIFFICULTY.defaultLevel;

/** Get the current difficulty level config (level 0-10). */
function getZombieDiffScale() {
  return DIFFICULTY.levels[zombieDifficulty] || DIFFICULTY.levels[5];
}

/** Set zombie difficulty (called from UI). */
function setZombieDifficulty(level) {
  zombieDifficulty = Math.max(0, Math.min(10, level));
  // If turned off, clear existing zombies
  if (zombieDifficulty === 0) {
    clearZombies();
  }
}
window.setZombieDifficulty = setZombieDifficulty;

// ======================== ZOMBIE LAYER ========================
// Zombies render on the effectLayer so they appear above blocks.

// ======================== SPAWN ========================
function spawnZombie() {
  const ds = getZombieDiffScale();
  if (ds.spawnRate === 0) return; // difficulty 0 = no zombies
  if (zombies.length >= ds.maxZombies) return;
  if (blocks.length === 0) return;

  const fromRight = Math.random() < _zMove.spawnRightProbability;
  const startX = fromRight ? appWidth + _zMove.offScreenBufferPx : -_zMove.offScreenBufferPx;
  const groundY = appHeight - _zAppear.groundOffsetPx;
  const speed = (_zMove.crawlSpeed + Math.random() * _zMove.crawlSpeedRange) * ds.crawlSpeed;
  const direction = fromRight ? -1 : 1;

  const container = new PIXI.Container();
  container.x = startX;
  container.y = groundY;
  container.scale.x = direction; // flip sprite for direction
  effectLayer.addChild(container);

  // Draw zombie
  const gfx = new PIXI.Graphics();
  drawZombieBody(gfx);
  container.addChild(gfx);

  const zombie = {
    container,
    gfx,
    x: startX,
    y: groundY,
    speed,
    direction,
    state: 'crawl', // 'crawl' | 'aim' | 'shoot' | 'flee'
    aimTimer: 0,
    shotCooldown: 0,
    targetBlock: null,
    animPhase: Math.random() * Math.PI * 2,
    fadeAlpha: 1,
  };

  zombies.push(zombie);
}

function drawZombieBody(gfx) {
  gfx.clear();

  // Body
  gfx.beginFill(_zAppear.bodyColor);
  gfx.drawRoundedRect(
    -_zAppear.bodyWidth / 2,
    -_zAppear.bodyHeight,
    _zAppear.bodyWidth,
    _zAppear.bodyHeight,
    4
  );
  gfx.endFill();

  // Head
  gfx.beginFill(_zAppear.headColor);
  gfx.drawCircle(0, -_zAppear.bodyHeight - _zAppear.headRadius + 2, _zAppear.headRadius);
  gfx.endFill();

  // Eyes (glowing red)
  gfx.beginFill(_zAppear.eyeGlowColor, 0.3);
  gfx.drawCircle(-3, -_zAppear.bodyHeight - _zAppear.headRadius + 1, _zAppear.eyeRadius + 2);
  gfx.drawCircle(3, -_zAppear.bodyHeight - _zAppear.headRadius + 1, _zAppear.eyeRadius + 2);
  gfx.endFill();
  gfx.beginFill(_zAppear.eyeColor);
  gfx.drawCircle(-3, -_zAppear.bodyHeight - _zAppear.headRadius + 1, _zAppear.eyeRadius);
  gfx.drawCircle(3, -_zAppear.bodyHeight - _zAppear.headRadius + 1, _zAppear.eyeRadius);
  gfx.endFill();
}

// ======================== FIND TARGET ========================
function findClosestBlock(zombie) {
  let closest = null;
  let closestDist = Infinity;
  for (const block of blocks) {
    if (block._deleteAnim >= 0) continue;
    const bc = getBlockCenter(block);
    const dist = Math.abs(bc.x - zombie.x);
    if (dist < closestDist) {
      closest = block;
      closestDist = dist;
    }
  }
  return closest;
}

// ======================== SHOOT ========================
function shootBullet(zombie) {
  if (!zombie.targetBlock || zombie.targetBlock._deleteAnim >= 0) return;

  const ds = getZombieDiffScale();
  const bc = getBlockCenter(zombie.targetBlock);
  const fromX = zombie.x + zombie.direction * 10;
  const fromY = zombie.y - _zAppear.bodyHeight * 0.6;

  const angleToTarget = Math.atan2(bc.y - fromY, bc.x - fromX);
  const angle = angleToTarget + (Math.random() - 0.5) * ds.angleSpread;
  const speed = _zShoot.bulletSpeed * ds.bulletSpeed;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const gfx = new PIXI.Graphics();
  // Glow
  gfx.beginFill(_zShoot.bulletGlowColor, _zShoot.bulletGlowAlpha);
  gfx.drawCircle(0, 0, _zShoot.bulletGlowRadius);
  gfx.endFill();
  // Core
  gfx.beginFill(_zShoot.bulletColor);
  gfx.drawCircle(0, 0, _zShoot.bulletRadius);
  gfx.endFill();
  gfx.x = fromX;
  gfx.y = fromY;
  effectLayer.addChild(gfx);

  zombieBullets.push({
    gfx,
    x: fromX,
    y: fromY,
    vx,
    vy,
    life: _zShoot.bulletLifetimeFrames,
    trail: [], // stores last N positions for trail rendering
    trailGfx: new PIXI.Graphics(),
  });

  // Add trail gfx behind bullet
  effectLayer.addChild(zombieBullets[zombieBullets.length - 1].trailGfx);

  zombie.shotCooldown = _zShoot.shotCooldownFrames * getZombieDiffScale().shotCooldown;
}

// ======================== BULLET → BLOCK COLLISION ========================
function checkBulletBlockCollision(bullet) {
  for (const block of blocks) {
    if (block._deleteAnim >= 0) continue;

    const dims = getBlockDims(block);
    const bx = block.container.x;
    const by = block.container.y;
    const bw = dims.cols * UNIT;
    const bh = dims.rows * UNIT;

    // AABB check
    if (bullet.x >= bx && bullet.x <= bx + bw && bullet.y >= by && bullet.y <= by + bh) {
      // Find which cube was hit
      const localX = bullet.x - bx;
      const localY = bullet.y - by;
      const col = Math.floor(localX / UNIT);
      const row = (dims.rows - 1) - Math.floor(localY / UNIT);

      const cells = getBlockCells(block);
      const hitIdx = cells.findIndex(([r, c]) => r === row && c === col);
      if (hitIdx === -1) continue; // hit empty cell in bounding box

      // Remove this cube from the block
      destroyCubeFromBlock(block, row, col, bullet.vx, bullet.vy);
      return true;
    }
  }
  return false;
}

// ======================== CUBE REMOVAL (shape-preserving) ========================
function destroyCubeFromBlock(block, hitRow, hitCol, bvx, bvy) {
  const cells = getBlockCells(block);

  // If only 1 cube, just delete the whole block
  if (cells.length <= 1) {
    const center = getBlockCenter(block);
    spawnImpactEffect(center.x, center.y, getBlockColor(block.value), bvx, bvy);
    playZombieCubeBreak();
    removeBlock(block.id, true);
    return;
  }

  // Remove the hit cube
  const remaining = cells.filter(([r, c]) => !(r === hitRow && c === hitCol));

  // Get impact position in world coords
  const dims = getBlockDims(block);
  const impactX = block.container.x + hitCol * UNIT + UNIT / 2;
  const impactY = block.container.y + (dims.rows - 1 - hitRow) * UNIT + UNIT / 2;
  const color = getBlockColor(block.value);

  // Effects
  spawnImpactEffect(impactX, impactY, color, bvx, bvy);
  playZombieCubeBreak();

  // Preserve shape: recreate block with remaining cells
  const center = getBlockCenter(block);

  removeBlock(block.id, false);

  // Create the block with remaining cells, keeping the original center
  if (remaining.length > 0) {
    const newBlock = createBlockFromLayout(remaining, center.x, center.y, false);
    if (newBlock) {
      newBlock._fuseAnim = 0; // little bounce
    }
  }
}

// ======================== IMPACT EFFECTS ========================
function spawnImpactEffect(x, y, color, bvx, bvy) {
  // Flash
  const flash = new PIXI.Graphics();
  flash.beginFill(_zImpact.flashColor, 0.7);
  flash.drawCircle(0, 0, _zImpact.flashRadius);
  flash.endFill();
  flash.beginFill(0xffffff, 0.5);
  flash.drawCircle(0, 0, _zImpact.flashRadius * 0.4);
  flash.endFill();
  flash.x = x;
  flash.y = y;
  effectLayer.addChild(flash);

  let flashLife = 0;
  const flashAnim = () => {
    flashLife++;
    flash.alpha = 1 - flashLife / _zImpact.flashDurationFrames;
    flash.scale.set(1 + flashLife * 0.04);
    if (flashLife >= _zImpact.flashDurationFrames) {
      effectLayer.removeChild(flash);
      flash.destroy();
      app.ticker.remove(flashAnim);
    }
  };
  app.ticker.add(flashAnim);

  // Small debris particles
  for (let i = 0; i < _zImpact.debrisCount; i++) {
    const dg = new PIXI.Graphics();
    dg.beginFill(color);
    dg.drawRoundedRect(-_zImpact.debrisSize / 2, -_zImpact.debrisSize / 2,
      _zImpact.debrisSize, _zImpact.debrisSize, 2);
    dg.endFill();
    dg.x = x;
    dg.y = y;
    effectLayer.addChild(dg);

    const angle = Math.random() * Math.PI * 2;
    const spd = _zImpact.debrisSpeed * (0.5 + Math.random());
    zombieDebrisList.push({
      gfx: dg,
      x, y,
      vx: Math.cos(angle) * spd + (bvx || 0) * 0.2,
      vy: Math.sin(angle) * spd + (bvy || 0) * 0.2,
      spin: (Math.random() - 0.5) * 0.3,
      angle: 0,
      life: _zImpact.debrisLifeFrames,
    });
  }
}

// ======================== UPDATE (called from game-loop ticker) ========================
function updateZombies(delta, nightAmount, phase) {
  const isNight = phase === 'night' || phase === 'dusk';
  const ds = getZombieDiffScale();

  // ---- SPAWN ----
  if (isNight && blocks.length > 0 && ds.spawnRate > 0) {
    zombieSpawnTimer += delta;
    const spawnInterval = (_zSpawn.intervalMinFrames + Math.random() * _zSpawn.intervalRandomFrames) / ds.spawnRate;
    if (zombieSpawnTimer >= nextZombieSpawn) {
      zombieSpawnTimer = 0;
      nextZombieSpawn = spawnInterval;
      spawnZombie();
    }
  }

  // ---- UPDATE ZOMBIES ----
  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];
    z.animPhase += delta;

    // Fade with night
    if (isNight) {
      z.fadeAlpha = Math.min(1, z.fadeAlpha + delta / _zFade.dawnFadeFrames);
    } else {
      z.fadeAlpha -= delta / _zFade.dawnFadeFrames;
      if (z.fadeAlpha <= 0) {
        effectLayer.removeChild(z.container);
        z.container.destroy({ children: true });
        zombies.splice(i, 1);
        continue;
      }
    }
    z.container.alpha = z.fadeAlpha * nightAmount * _zFade.nightAlphaMultiplier;

    // Cooldown
    if (z.shotCooldown > 0) z.shotCooldown -= delta;

    // Find target
    z.targetBlock = findClosestBlock(z);

    if (z.state === 'crawl') {
      // Move toward nearest block
      if (z.targetBlock) {
        const bc = getBlockCenter(z.targetBlock);
        const distToTarget = Math.abs(bc.x - z.x);

        if (distToTarget <= _zMove.aimDistancePx) {
          z.state = 'aim';
          z.aimTimer = 0;
        } else {
          // Move toward block
          const dir = bc.x > z.x ? 1 : -1;
          z.x += dir * z.speed * delta;
          z.direction = dir;
          z.container.scale.x = dir;
        }
      } else {
        // No blocks, wander
        z.x += z.direction * z.speed * delta;
      }

      // Remove if offscreen (past other side)
      if ((z.direction === 1 && z.x > appWidth + _zMove.offScreenBufferPx) ||
          (z.direction === -1 && z.x < -_zMove.offScreenBufferPx)) {
        effectLayer.removeChild(z.container);
        z.container.destroy({ children: true });
        zombies.splice(i, 1);
        continue;
      }
    } else if (z.state === 'aim') {
      z.aimTimer += delta;
      if (z.aimTimer >= _zShoot.aimDurationFrames * ds.aimDuration) {
        z.state = 'shoot';
      }
      // Face the target
      if (z.targetBlock) {
        const bc = getBlockCenter(z.targetBlock);
        z.direction = bc.x > z.x ? 1 : -1;
        z.container.scale.x = z.direction;
      }
    } else if (z.state === 'shoot') {
      if (z.shotCooldown <= 0 && z.targetBlock && z.targetBlock._deleteAnim < 0) {
        // shootChance gates whether this zombie actually fires
        if (ds.shootChance > 0 && Math.random() < ds.shootChance) {
          shootBullet(z);
        }
      }
      z.state = 'crawl'; // go back to crawling after shooting
    }

    // Animate
    const bob = Math.sin(z.animPhase * _zMove.bobSpeed) * _zMove.bobAmplitude;
    z.container.x = z.x;
    z.container.y = z.y + bob;

    // Arm sway animation
    const armAngle = Math.sin(z.animPhase * _zMove.armSwaySpeed) * _zMove.armSwayAmplitude;
    const legAngle = Math.sin(z.animPhase * _zMove.legSwaySpeed) * _zMove.legSwayAmplitude;

    // Redraw with animation
    const g = z.gfx;
    g.clear();
    drawZombieBody(g);

    // Left arm
    g.lineStyle(_zAppear.armWidth, _zAppear.armColor);
    g.moveTo(-_zAppear.bodyWidth / 2, -_zAppear.bodyHeight * 0.7);
    g.lineTo(
      -_zAppear.bodyWidth / 2 - Math.cos(armAngle + 0.5) * _zAppear.armLength,
      -_zAppear.bodyHeight * 0.7 + Math.sin(armAngle + 0.5) * _zAppear.armLength
    );
    // Right arm
    g.moveTo(_zAppear.bodyWidth / 2, -_zAppear.bodyHeight * 0.7);
    g.lineTo(
      _zAppear.bodyWidth / 2 + Math.cos(-armAngle + 0.5) * _zAppear.armLength,
      -_zAppear.bodyHeight * 0.7 + Math.sin(-armAngle + 0.5) * _zAppear.armLength
    );

    // Left leg
    g.lineStyle(_zAppear.legWidth, _zAppear.legColor);
    g.moveTo(-_zAppear.bodyWidth / 4, 0);
    g.lineTo(
      -_zAppear.bodyWidth / 4 + Math.sin(legAngle) * _zAppear.legLength * 0.3,
      _zAppear.legLength
    );
    // Right leg
    g.moveTo(_zAppear.bodyWidth / 4, 0);
    g.lineTo(
      _zAppear.bodyWidth / 4 + Math.sin(-legAngle) * _zAppear.legLength * 0.3,
      _zAppear.legLength
    );
    g.lineStyle(0);
  }

  // ---- UPDATE BULLETS ----
  for (let i = zombieBullets.length - 1; i >= 0; i--) {
    const b = zombieBullets[i];
    b.x += b.vx * delta;
    b.y += b.vy * delta;
    b.life -= delta;
    b.gfx.x = b.x;
    b.gfx.y = b.y;

    // Trail: store position history (max 8 points)
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 8) b.trail.shift();

    // Draw trail
    b.trailGfx.clear();
    for (let t = 0; t < b.trail.length - 1; t++) {
      const frac = t / b.trail.length;
      const alpha = frac * 0.4;
      const width = 1 + frac * 3;
      b.trailGfx.lineStyle(width, _zShoot.bulletColor, alpha);
      b.trailGfx.moveTo(b.trail[t].x, b.trail[t].y);
      b.trailGfx.lineTo(b.trail[t + 1].x, b.trail[t + 1].y);
    }
    b.trailGfx.lineStyle(0);

    // Check collision with blocks
    if (checkBulletBlockCollision(b)) {
      effectLayer.removeChild(b.gfx);
      effectLayer.removeChild(b.trailGfx);
      b.gfx.destroy();
      b.trailGfx.destroy();
      zombieBullets.splice(i, 1);
      continue;
    }

    // Off-screen or expired
    if (b.life <= 0 || b.x < -50 || b.x > appWidth + 50 || b.y < -50 || b.y > appHeight + 50) {
      effectLayer.removeChild(b.gfx);
      effectLayer.removeChild(b.trailGfx);
      b.gfx.destroy();
      b.trailGfx.destroy();
      zombieBullets.splice(i, 1);
    }
  }

  // ---- UPDATE ZOMBIE DEBRIS ----
  for (let i = zombieDebrisList.length - 1; i >= 0; i--) {
    const d = zombieDebrisList[i];
    d.vy += _zImpact.debrisGravity;
    d.vx *= _zImpact.debrisFriction;
    d.vy *= _zImpact.debrisFriction;
    d.x += d.vx * delta;
    d.y += d.vy * delta;
    d.angle += d.spin;
    d.life -= delta;
    d.gfx.x = d.x;
    d.gfx.y = d.y;
    d.gfx.rotation = d.angle;
    d.gfx.alpha = Math.max(0, d.life / _zImpact.debrisLifeFrames);

    if (d.life <= 0) {
      effectLayer.removeChild(d.gfx);
      d.gfx.destroy();
      zombieDebrisList.splice(i, 1);
    }
  }
}

// ======================== CLEAR ========================
function clearZombies() {
  for (const z of zombies) {
    effectLayer.removeChild(z.container);
    z.container.destroy({ children: true });
  }
  zombies.length = 0;
  for (const b of zombieBullets) {
    effectLayer.removeChild(b.gfx);
    b.gfx.destroy();
    if (b.trailGfx) {
      effectLayer.removeChild(b.trailGfx);
      b.trailGfx.destroy();
    }
  }
  zombieBullets.length = 0;
  for (const d of zombieDebrisList) {
    effectLayer.removeChild(d.gfx);
    d.gfx.destroy();
  }
  zombieDebrisList.length = 0;
  zombieSpawnTimer = 0;
}
