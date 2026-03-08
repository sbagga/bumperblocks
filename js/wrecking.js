// ======================== WRECKING BALL SYSTEM ========================
// Pin + chain + ball pendulum, block destruction, debris particles.
// Depends on: config.js, app.js, blocks.js, constants.js, sound.js
// See: docs/SYSTEMS.md § Wrecking Ball System for physics model.

const _wBall = CONFIG.wrecking.ball;
const _wChain = CONFIG.wrecking.chain;
const _wPin = CONFIG.wrecking.pin;
const _wPend = CONFIG.wrecking.pendulum;
const _wDebris = CONFIG.wrecking.debris;
const _wFlash = CONFIG.wrecking.smashFlash;

let wreckMode = false;
let wreckState = null;
const WB_RADIUS = _wBall.radius;
const CHAIN_SEGMENTS = _wChain.segmentCount;

window.toggleWreckMode = function() {
  wreckMode = !wreckMode;
  document.getElementById('wreckModeBtn').classList.toggle('active', wreckMode);
  if (!wreckMode) clearWreckingBall();
  // Analytics: wreck mode used
  if (wreckMode && typeof trackEvent === 'function') trackEvent('game_wreck_mode');
};

function clearWreckingBall() {
  if (wreckState) {
    if (wreckState.pinGfx) { wreckLayer.removeChild(wreckState.pinGfx); wreckState.pinGfx.destroy(); }
    if (wreckState.chainGfx) { wreckLayer.removeChild(wreckState.chainGfx); wreckState.chainGfx.destroy(); }
    if (wreckState.ballGfx) { wreckLayer.removeChild(wreckState.ballGfx); wreckState.ballGfx.destroy(); }
    wreckState = null;
  }
  document.getElementById('wreckBtn').style.display = 'none';
}

function placePin(x, y) {
  clearWreckingBall();

  const pinGfx = new PIXI.Graphics();
  pinGfx.beginFill(_wPin.fillColor);
  pinGfx.lineStyle(_wPin.strokeWidth, _wPin.strokeColor);
  pinGfx.drawCircle(0, 0, _wPin.radius);
  pinGfx.endFill();
  pinGfx.x = x; pinGfx.y = y;
  wreckLayer.addChild(pinGfx);

  const chainGfx = new PIXI.Graphics();
  wreckLayer.addChild(chainGfx);

  const ballGfx = new PIXI.Graphics();
  drawWreckBall(ballGfx);
  ballGfx.x = x; ballGfx.y = y + _wBall.defaultChainLengthPx;
  ballGfx.interactive = true;
  ballGfx.cursor = 'grab';
  wreckLayer.addChild(ballGfx);

  wreckState = {
    pinX: x, pinY: y,
    ballX: x, ballY: y + _wBall.defaultChainLengthPx,
    pinGfx, chainGfx, ballGfx,
    placed: true, draggingBall: false, swinging: false,
  };

  drawChain();

  const wb = document.getElementById('wreckBtn');
  wb.style.display = 'block';
  wb.style.left = (x + 20) + 'px';
  wb.style.top = Math.max(5, y - 30) + 'px';

  ballGfx.on('pointerdown', onBallPointerDown);
}

function drawWreckBall(g) {
  g.clear();
  g.beginFill(_wBall.fillColor);
  g.lineStyle(_wBall.strokeWidth, _wBall.strokeColor);
  g.drawCircle(0, 0, WB_RADIUS);
  g.endFill();
  g.lineStyle(0);
  g.beginFill(0xffffff, _wBall.highlightAlpha);
  g.drawEllipse(_wBall.highlightOffsetX, _wBall.highlightOffsetY, _wBall.highlightRadiusX, _wBall.highlightRadiusY);
  g.endFill();
}

function drawChain() {
  if (!wreckState) return;
  const { pinX, pinY, ballX, ballY, chainGfx } = wreckState;
  chainGfx.clear();

  chainGfx.lineStyle({ width: _wChain.lineWidth, color: _wChain.lineColor });
  chainGfx.moveTo(pinX, pinY);
  chainGfx.lineTo(ballX, ballY);
  chainGfx.lineStyle(0);

  const dx = ballX - pinX, dy = ballY - pinY;
  for (let i = 1; i < CHAIN_SEGMENTS; i++) {
    const t = i / CHAIN_SEGMENTS;
    const cx = pinX + dx * t, cy = pinY + dy * t;
    chainGfx.beginFill(_wChain.dotFillColor);
    chainGfx.lineStyle(_wChain.dotStrokeWidth, _wChain.dotStrokeColor);
    chainGfx.drawCircle(cx, cy, _wChain.dotRadius);
    chainGfx.endFill();
  }
}

function onBallPointerDown(e) {
  if ((e.data.button !== 0 && e.data.button !== -1) || !wreckState || !wreckState.placed) return;
  if (wreckState.swinging) return;
  e.stopPropagation();
  wreckState.draggingBall = true;
  wreckState.ballGfx.cursor = 'grabbing';
  app.stage.on('pointermove', onBallDragMove);
  app.stage.on('pointerup', onBallDragEnd);
  app.stage.on('pointerupoutside', onBallDragEnd);
}

function onBallDragMove(e) {
  if (!wreckState || !wreckState.draggingBall) return;
  const pos = e.data.getLocalPosition(app.stage);
  let bx = pos.x, by = pos.y;
  const dx = bx - wreckState.pinX, dy = by - wreckState.pinY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > _wBall.maxDragDistance) {
    bx = wreckState.pinX + (dx / dist) * _wBall.maxDragDistance;
    by = wreckState.pinY + (dy / dist) * _wBall.maxDragDistance;
  }
  wreckState.ballX = bx;
  wreckState.ballY = by;
  wreckState.ballGfx.x = bx;
  wreckState.ballGfx.y = by;
  drawChain();
}

function onBallDragEnd(e) {
  if (!wreckState) return;
  wreckState.draggingBall = false;
  wreckState.ballGfx.cursor = 'grab';
  app.stage.off('pointermove', onBallDragMove);
  app.stage.off('pointerup', onBallDragEnd);
  app.stage.off('pointerupoutside', onBallDragEnd);
}

window.releaseWreckingBall = function() {
  if (!wreckState || wreckState.swinging) return;
  document.getElementById('wreckBtn').style.display = 'none';
  wreckState.swinging = true;
  wreckState.ballGfx.cursor = 'default';

  const { pinX, pinY, ballX, ballY } = wreckState;
  const dx = ballX - pinX, dy = ballY - pinY;
  const chainLen = Math.sqrt(dx * dx + dy * dy) || _wBall.defaultChainLengthPx;
  let angle = Math.atan2(dx, dy);
  let angularVel = 0;
  let frameCount = 0;

  playSmashSound();

  const swingUpdate = () => {
    if (!wreckState) { app.ticker.remove(swingUpdate); return; }

    const angularAccel = -_wPend.gravity * Math.sin(angle);
    angularVel += angularAccel;
    angularVel *= _wPend.damping;
    angle += angularVel;

    let curX = pinX + Math.sin(angle) * chainLen;
    let curY = pinY + Math.cos(angle) * chainLen;
    const vx = Math.cos(angle) * angularVel * chainLen;
    const vy = -Math.sin(angle) * angularVel * chainLen;

    let bounced = false;
    if (curX < WB_RADIUS) { curX = WB_RADIUS; angularVel = Math.abs(angularVel) * _wPend.wallBounceFactor; bounced = true; }
    if (curX > appWidth - WB_RADIUS) { curX = appWidth - WB_RADIUS; angularVel = -Math.abs(angularVel) * _wPend.wallBounceFactor; bounced = true; }
    if (curY < WB_RADIUS) { curY = WB_RADIUS; angularVel *= -_wPend.wallBounceFactor; bounced = true; }
    if (curY > appHeight - WB_RADIUS) { curY = appHeight - WB_RADIUS; angularVel *= -_wPend.wallBounceFactor; bounced = true; }
    if (bounced) angle = Math.atan2(curX - pinX, curY - pinY);

    wreckState.ballX = curX;
    wreckState.ballY = curY;
    wreckState.ballGfx.x = curX;
    wreckState.ballGfx.y = curY;
    drawChain();

    checkWreckCollisions(curX, curY, vx, vy);
    frameCount++;

    if (frameCount > _wPend.minFramesBeforeStop && Math.abs(angularVel) < _wPend.minAngularVelocity && Math.abs(angle) < _wPend.minAngleForStop) {
      wreckState.swinging = false;
      wreckState.ballGfx.cursor = 'grab';
      const wb = document.getElementById('wreckBtn');
      wb.style.display = 'block';
      wb.style.left = (pinX + 20) + 'px';
      wb.style.top = Math.max(5, pinY - 30) + 'px';
      app.ticker.remove(swingUpdate);
      return;
    }
  };
  app.ticker.add(swingUpdate);
};

function checkWreckCollisions(bx, by, bvx, bvy) {
  const hitRadius = WB_RADIUS + _wBall.collisionPadding;
  const toRemove = [];
  for (const block of blocks) {
    if (block._deleteAnim >= 0) continue;
    const center = getBlockCenter(block);
    const dims = getBlockDims(block);
    const blockRadius = Math.max(dims.cols, dims.rows) * UNIT / 2;
    const dx = bx - center.x, dy = by - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < hitRadius + blockRadius) toRemove.push(block);
  }
  for (const block of toRemove) wreckBlock(block, bvx, bvy);
}

function wreckBlock(block, impactVx, impactVy) {
  const center = getBlockCenter(block);
  const value = block.value;
  const layout = getBlockCells(block);
  const dims = getBlockDims(block);
  const idx = blocks.findIndex(b => b.id === block.id);
  if (idx === -1) return;

  if (block.shadowGfx) { blockShadowLayer.removeChild(block.shadowGfx); block.shadowGfx.destroy(); }
  blockLayer.removeChild(block.container);
  block.container.destroy({ children: true });
  blocks.splice(idx, 1);

  playBlockSmashSound();

  const topLeftX = center.x - (dims.cols * UNIT) / 2;
  const topLeftY = center.y - (dims.rows * UNIT) / 2;
  const impactSpeed = Math.sqrt(impactVx * impactVx + impactVy * impactVy) || 5;
  const color = getBlockColor(value);

  for (const [row, col] of layout) {
    const cubeX = topLeftX + col * UNIT + UNIT / 2;
    const cubeY = topLeftY + (dims.rows - 1 - row) * UNIT + UNIT / 2;
    const dvx = impactVx * _wDebris.impactVelocityFraction + (Math.random() - 0.5) * _wDebris.scatterMultiplier * impactSpeed;
    const dvy = impactVy * _wDebris.impactVelocityFraction + (Math.random() - 0.5) * _wDebris.scatterMultiplier * impactSpeed;
    spawnDebris(cubeX, cubeY, dvx, dvy, color);
  }
  showSmashFlash(center.x, center.y);
}

// ======================== DEBRIS SYSTEM ========================
const debrisList = [];
const DEBRIS_FRICTION = _wDebris.friction;
const DEBRIS_BOUNCE = _wDebris.bounceFactor;
const DEBRIS_GRAVITY = _wDebris.gravity;
const DEBRIS_SIZE = _wDebris.size;

function spawnDebris(x, y, vx, vy, color) {
  const gfx = new PIXI.Graphics();
  gfx.beginFill(color);
  gfx.lineStyle(_wDebris.borderWidth, _wDebris.borderColor, _wDebris.borderAlpha);
  gfx.drawRoundedRect(-DEBRIS_SIZE / 2, -DEBRIS_SIZE / 2, DEBRIS_SIZE, DEBRIS_SIZE, _wDebris.cornerRadius);
  gfx.endFill();
  gfx.x = x; gfx.y = y;
  effectLayer.addChild(gfx);

  const spin = (Math.random() - 0.5) * _wDebris.maxInitialSpin;
  debrisList.push({ gfx, x, y, vx, vy, spin, angle: 0, life: _wDebris.lifetimeFrames });
}

function showSmashFlash(x, y) {
  const flash = new PIXI.Graphics();
  for (let i = _wFlash.ringCount - 1; i >= 0; i--) {
    const r = _wFlash.baseRadius + i * _wFlash.ringSpacing;
    flash.beginFill(_wFlash.color, _wFlash.peakAlpha * (1 - i / _wFlash.ringCount));
    flash.drawCircle(0, 0, r);
    flash.endFill();
  }
  flash.x = x; flash.y = y;
  effectLayer.addChild(flash);
  let life = 0;
  const anim = () => {
    life++;
    flash.alpha = 1 - life / _wFlash.durationFrames;
    flash.scale.set(1 + life * _wFlash.scalePerFrame);
    if (life >= _wFlash.durationFrames) {
      effectLayer.removeChild(flash);
      flash.destroy();
      app.ticker.remove(anim);
    }
  };
  app.ticker.add(anim);
}
