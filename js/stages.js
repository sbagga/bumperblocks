// ======================== STAGE SYSTEM ========================
// Stage progression, target generation, confetti celebration.
// Depends on: config.js, app.js, blocks.js, sound.js
// Loaded between wrecking.js and game-loop.js.

const _stageCfg = CONFIG.stages;
const _confettiCfg = CONFIG.stages.confetti;
const _splitPuffCfg = CONFIG.stages.splitPuff;
const _splitCfg = CONFIG.stages.split;

let currentStage = 1;
let stageTarget = 0;
let stageActive = false;
let celebrationActive = false;
let _stageGeneration = 0; // incremented on each stage load to cancel stale spawn timers
const confettiList = [];
const splitPuffList = [];

// ======================== EQUATION STATE ========================
let equation = [];           // Current operands, e.g. [2, 3, 1]
let equationContainer = null; // PIXI container for the equation display
let equationTexts = [];       // Array of PIXI.Text objects for each operand/operator
let equationHighlightGfx = null;
let _lastStageTarget = 0;    // tracks cumulative target for random increments

// ======================== STAGE GENERATION ========================

function getDifficulty(stage) {
  return Math.ceil(stage / _stageCfg.difficultyInterval);
}

function getStageTarget(stage) {
  if (stage <= 1) {
    _lastStageTarget = _stageCfg.baseTarget + _stageCfg.targetIncrement;
    return _lastStageTarget;
  }
  // Random increment between 2 and 5
  const increment = 2 + Math.floor(Math.random() * 4);
  _lastStageTarget = _lastStageTarget + increment;
  return _lastStageTarget;
}

function getStageBlocks(stage) {
  const target = getStageTarget(stage);
  const difficulty = getDifficulty(stage);
  const numBlocks = _stageCfg.baseBlockCount + difficulty;

  // Generate N random positive integers that sum to target
  if (numBlocks >= target) {
    // More blocks than target: all 1s plus some padding
    const arr = Array(target).fill(1);
    return arr.slice(0, numBlocks);
  }

  // Stars and bars: pick (numBlocks-1) random breakpoints in [1, target-1]
  const breakpoints = new Set();
  let attempts = 0;
  while (breakpoints.size < numBlocks - 1 && attempts < 1000) {
    breakpoints.add(1 + Math.floor(Math.random() * (target - 1)));
    attempts++;
  }
  const sorted = [0, ...Array.from(breakpoints).sort((a, b) => a - b), target];
  const parts = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    parts.push(sorted[i + 1] - sorted[i]);
  }

  // Shuffle
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts;
}

// ======================== STAGE LIFECYCLE ========================

function loadStage(stage) {
  _stageGeneration++;
  const gen = _stageGeneration;

  currentStage = stage;
  stageTarget = getStageTarget(stage);
  celebrationActive = false;

  // Auto-increase zombie difficulty every 2 stages
  if (typeof setZombieDifficulty === 'function' && typeof zombieDifficulty !== 'undefined') {
    const autoDiff = Math.min(10, Math.floor(stage / _stageCfg.difficultyInterval) + (DIFFICULTY.defaultLevel || 2));
    if (autoDiff > zombieDifficulty) {
      setZombieDifficulty(autoDiff);
      const sel = document.getElementById('difficultySelect');
      if (sel) sel.value = autoDiff;
      console.log(`[Stage] Auto-increased zombie difficulty to ${autoDiff}`);
    }
  }

  console.log(`[Stage] Loading stage ${stage}, target: ${stageTarget}, gen: ${gen}`);

  // Clear existing blocks
  clearAllBlocks();
  destroyEquationDisplay();

  // Update UI
  updateStageUI();

  // Spawn blocks after a short delay (guarded by generation check)
  setTimeout(() => {
    if (_stageGeneration !== gen) return;
    const stageBlocks = getStageBlocks(stage);
    equation = stageBlocks.slice(); // store the equation operands
    spawnStageBlocks(stageBlocks, gen);
    buildEquationDisplay();
    stageActive = true;
  }, _stageCfg.stageStartDelayMs);
}

function clearAllBlocks() {
  if (typeof clearZombies === 'function') clearZombies();
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block.shadowGfx) {
      blockShadowLayer.removeChild(block.shadowGfx);
      block.shadowGfx.destroy();
    }
    blockLayer.removeChild(block.container);
    block.container.destroy({ children: true });
  }
  blocks.length = 0; // clear in-place instead of reassigning
  if (typeof clearWreckingBall === 'function') clearWreckingBall();
  if (typeof debrisList !== 'undefined') {
    for (const d of debrisList) {
      effectLayer.removeChild(d.gfx);
      d.gfx.destroy();
    }
    debrisList.length = 0;
  }
}

function spawnStageBlocks(values, gen) {
  // Calculate spacing dynamically to fit all blocks within screen width
  const maxVal = Math.max(...values);
  const maxDims = getBlockDimensions(maxVal);
  const maxBlockW = maxDims.cols * UNIT;
  const margin = maxBlockW / 2 + 20;
  const availableWidth = appWidth - margin * 2;
  const desiredSpacing = _stageCfg.spawnSpacingPx;
  const spacing = values.length <= 1 ? 0 : Math.min(desiredSpacing, availableWidth / (values.length - 1));

  const totalWidth = (values.length - 1) * spacing;
  const startX = appWidth / 2 - totalWidth / 2;
  const cy = appHeight * 0.45;

  values.forEach((value, i) => {
    setTimeout(() => {
      // Guard: skip if stage was reloaded since this spawn was queued
      if (_stageGeneration !== gen) return;
      const x = Math.max(margin, Math.min(appWidth - margin, startX + i * spacing));
      createBlock(value, x, cy);
    }, i * 120);
  });
}

// ======================== TARGET CHECK (EQUATION-AWARE) ========================

function checkStageTarget(newBlock) {
  if (!stageActive || celebrationActive) return;
  console.log(`[Stage] checkStageTarget — value: ${newBlock.value}, equation: [${equation}], target: ${stageTarget}`);

  // If equation has been fully reduced to a single value matching the target
  if (equation.length === 1 && equation[0] >= stageTarget) {
    triggerCelebration(newBlock);
    return;
  }

  // Also catch if block value equals/exceeds target even without equation tracking
  if (newBlock.value >= stageTarget) {
    triggerCelebration(newBlock);
  }
}

/**
 * Called from fuseBlocks (blocks.js) when two blocks merge.
 * Tries to find an adjacent pair in the equation matching (a, b) and merges them.
 * Returns true if a match was found and the equation was updated.
 */
function onBlocksFused(valA, valB) {
  if (!stageActive || equation.length <= 1) return false;

  // Find adjacent pair matching (valA, valB) or (valB, valA)
  for (let i = 0; i < equation.length - 1; i++) {
    if ((equation[i] === valA && equation[i + 1] === valB) ||
        (equation[i] === valB && equation[i + 1] === valA)) {
      const sum = equation[i] + equation[i + 1];
      highlightEquationPair(i);
      // After highlight delay, merge the pair
      setTimeout(() => {
        equation.splice(i, 2, sum);
        buildEquationDisplay();
      }, 500);
      return true;
    }
  }
  return false;
}

// ======================== EQUATION DISPLAY ========================

function buildEquationDisplay() {
  destroyEquationDisplay();

  equationContainer = new PIXI.Container();
  equationTexts = [];

  const fontSize = appWidth < 480 ? 26 : 34;
  const opStyle = {
    fontFamily: 'Segoe UI, Comic Sans MS, sans-serif',
    fontSize: fontSize,
    fontWeight: '900',
    fill: '#ffffff',
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowBlur: 5,
    dropShadowAlpha: 0.6,
    dropShadowColor: '#000000',
  };
  const plusStyle = {
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: fontSize - 6,
    fontWeight: '700',
    fill: '#aaffaa',
    dropShadow: true,
    dropShadowDistance: 1,
    dropShadowBlur: 3,
    dropShadowAlpha: 0.4,
    dropShadowColor: '#000000',
  };
  const eqStyle = {
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: fontSize + 2,
    fontWeight: '900',
    fill: '#ffdd44',
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowBlur: 5,
    dropShadowAlpha: 0.6,
    dropShadowColor: '#000000',
  };

  let xCursor = 0;
  const gap = appWidth < 480 ? 8 : 14;
  const operandColors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6, 0xe84393, 0x00bcd4];

  for (let i = 0; i < equation.length; i++) {
    // Colored pill behind each operand
    const numText = new PIXI.Text(equation[i].toString(), opStyle);
    numText.anchor.set(0.5, 0.5);

    const pillW = Math.max(numText.width + 18, fontSize + 8);
    const pillH = fontSize + 10;
    const pill = new PIXI.Graphics();
    const pillColor = operandColors[i % operandColors.length];
    pill.beginFill(pillColor, 0.7);
    pill.drawRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 10);
    pill.endFill();
    pill.beginFill(0xffffff, 0.15);
    pill.drawRoundedRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW - 4, pillH / 2 - 2, 8);
    pill.endFill();

    const operandGroup = new PIXI.Container();
    operandGroup.addChild(pill);
    operandGroup.addChild(numText);
    operandGroup.x = xCursor + pillW / 2;
    operandGroup._eqIndex = i;
    operandGroup._eqType = 'operand';
    operandGroup._pillGfx = pill;
    operandGroup._textObj = numText;
    equationContainer.addChild(operandGroup);
    equationTexts.push(operandGroup);
    xCursor += pillW + gap;

    if (i < equation.length - 1) {
      // Plus sign
      const plus = new PIXI.Text('+', plusStyle);
      plus.anchor.set(0, 0.5);
      plus.x = xCursor;
      plus._eqType = 'operator';
      plus._eqIndex = i;
      equationContainer.addChild(plus);
      equationTexts.push(plus);
      xCursor += plus.width + gap;
    }
  }

  // Equals sign and target
  const eqSign = new PIXI.Text('=', eqStyle);
  eqSign.anchor.set(0, 0.5);
  eqSign.x = xCursor;
  eqSign._eqType = 'equals';
  equationContainer.addChild(eqSign);
  equationTexts.push(eqSign);
  xCursor += eqSign.width + gap;

  const targetText = new PIXI.Text(stageTarget.toString(), eqStyle);
  targetText.anchor.set(0, 0.5);
  targetText.x = xCursor;
  targetText._eqType = 'target';
  equationContainer.addChild(targetText);
  equationTexts.push(targetText);
  xCursor += targetText.width;

  // Scale to fit screen if too wide
  const maxWidth = appWidth * 0.85;
  if (xCursor > maxWidth) {
    equationContainer.scale.set(maxWidth / xCursor);
  }

  // Position — pushed down below header
  const headerOffset = HEADER_HEIGHT > 0 ? 20 : 55;
  equationContainer.x = appWidth / 2 - (Math.min(xCursor, maxWidth)) / 2;
  equationContainer.y = headerOffset;

  // Background pill
  equationHighlightGfx = new PIXI.Graphics();
  equationHighlightGfx.beginFill(0x000000, 0.45);
  equationHighlightGfx.drawRoundedRect(
    -16, -fontSize / 2 - 12,
    xCursor + 32, fontSize + 24,
    14
  );
  equationHighlightGfx.endFill();
  equationContainer.addChildAt(equationHighlightGfx, 0);

  effectLayer.addChild(equationContainer);
}

function destroyEquationDisplay() {
  if (equationContainer) {
    effectLayer.removeChild(equationContainer);
    equationContainer.destroy({ children: true });
    equationContainer = null;
  }
  equationTexts = [];
  equationHighlightGfx = null;
}

function highlightEquationPair(pairIndex) {
  const operandA = equationTexts.find(t => t._eqType === 'operand' && t._eqIndex === pairIndex);
  const operandB = equationTexts.find(t => t._eqType === 'operand' && t._eqIndex === pairIndex + 1);
  const plusSign = equationTexts.find(t => t._eqType === 'operator' && t._eqIndex === pairIndex);

  if (!operandA || !operandB) return;

  // Bright flash: turn pills white-green, scale up big
  if (operandA._pillGfx) operandA._pillGfx.tint = 0x88ffaa;
  if (operandB._pillGfx) operandB._pillGfx.tint = 0x88ffaa;
  if (operandA._textObj) operandA._textObj.style.fill = '#00ff66';
  if (operandB._textObj) operandB._textObj.style.fill = '#00ff66';
  if (plusSign) plusSign.style.fill = '#ffffff';

  // Animated pulse with glow ring
  let t = 0;
  const pulseAnim = () => {
    t += 0.04;
    const s = 1 + Math.sin(t * Math.PI * 2) * 0.3;
    if (operandA) operandA.scale.set(s);
    if (operandB) operandB.scale.set(s);
    if (plusSign) plusSign.scale.set(s);
    // Alpha flash
    const flash = 0.5 + Math.sin(t * Math.PI * 4) * 0.5;
    if (operandA._pillGfx) operandA._pillGfx.alpha = 0.5 + flash * 0.5;
    if (operandB._pillGfx) operandB._pillGfx.alpha = 0.5 + flash * 0.5;
    if (t >= 1) {
      if (operandA) { operandA.scale.set(1); if (operandA._pillGfx) { operandA._pillGfx.tint = 0xffffff; operandA._pillGfx.alpha = 1; } if (operandA._textObj) operandA._textObj.style.fill = '#ffffff'; }
      if (operandB) { operandB.scale.set(1); if (operandB._pillGfx) { operandB._pillGfx.tint = 0xffffff; operandB._pillGfx.alpha = 1; } if (operandB._textObj) operandB._textObj.style.fill = '#ffffff'; }
      if (plusSign) { plusSign.scale.set(1); plusSign.style.fill = '#aaffaa'; }
      app.ticker.remove(pulseAnim);
    }
  };
  app.ticker.add(pulseAnim);

  // Play a short "ding" for equation match
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.12, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

// ======================== CELEBRATION ========================

function triggerCelebration(winningBlock) {
  console.log(`[Stage] CELEBRATION! Stage ${currentStage} complete, value ${winningBlock.value} >= target ${stageTarget}`);
  celebrationActive = true;
  stageActive = false;

  // Winning block animation
  setBlockExpression(winningBlock, 'happy');
  winningBlock._celebrateAnim = 0;

  // Spawn confetti
  const cx = appWidth / 2;
  for (let i = 0; i < _confettiCfg.count; i++) {
    spawnConfetti(cx + (Math.random() - 0.5) * appWidth * 0.6, appHeight * 0.3);
  }

  // Play celebration sound
  playCelebrationSound();

  // Show celebration banner
  showCelebrationBanner();

  // Next stage after delay
  setTimeout(() => {
    clearConfetti();
    hideCelebrationBanner();
    destroyEquationDisplay();
    loadStage(currentStage + 1);
  }, _stageCfg.nextStageDelayMs);
}

function playCelebrationSound() {
  // A joyful rising arpeggio
  const now = audioCtx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.4);
  });
}

// ======================== CONFETTI SYSTEM ========================

function spawnConfetti(x, y) {
  const color = _confettiCfg.colors[Math.floor(Math.random() * _confettiCfg.colors.length)];
  const gfx = new PIXI.Graphics();
  const w = _confettiCfg.size * (0.5 + Math.random() * 0.5);
  const h = _confettiCfg.size * (0.3 + Math.random() * 0.7);
  gfx.beginFill(color);
  gfx.drawRoundedRect(-w / 2, -h / 2, w, h, 2);
  gfx.endFill();
  gfx.x = x;
  gfx.y = y;
  effectLayer.addChild(gfx);

  confettiList.push({
    gfx,
    x, y,
    vx: (Math.random() - 0.5) * _confettiCfg.spreadX,
    vy: -_confettiCfg.launchSpeed * (0.5 + Math.random() * 0.5),
    spin: (Math.random() - 0.5) * _confettiCfg.maxSpin,
    angle: Math.random() * Math.PI * 2,
    life: _confettiCfg.lifeFrames,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.05,
  });
}

function updateConfetti(delta) {
  for (let i = confettiList.length - 1; i >= 0; i--) {
    const c = confettiList[i];
    c.vy += _confettiCfg.gravity;
    c.vx += Math.sin(c.wobblePhase) * 0.1;
    c.wobblePhase += c.wobbleSpeed;
    c.x += c.vx * delta;
    c.y += c.vy * delta;
    c.angle += c.spin;
    c.life -= delta;

    c.gfx.x = c.x;
    c.gfx.y = c.y;
    c.gfx.rotation = c.angle;

    if (c.life < 30) {
      c.gfx.alpha = c.life / 30;
    }

    if (c.life <= 0 || c.y > appHeight + 50) {
      effectLayer.removeChild(c.gfx);
      c.gfx.destroy();
      confettiList.splice(i, 1);
    }
  }
}

function clearConfetti() {
  for (const c of confettiList) {
    effectLayer.removeChild(c.gfx);
    c.gfx.destroy();
  }
  confettiList.length = 0;
}

// ======================== CELEBRATION BANNER ========================

let celebrationContainer = null;

function showCelebrationBanner() {
  if (celebrationContainer) hideCelebrationBanner();

  celebrationContainer = new PIXI.Container();

  // Semi-transparent backdrop
  const backdrop = new PIXI.Graphics();
  backdrop.beginFill(0x000000, 0.3);
  backdrop.drawRoundedRect(-180, -50, 360, 100, 20);
  backdrop.endFill();
  celebrationContainer.addChild(backdrop);

  // "Stage Complete!" text
  const _stageCompleteStr = (typeof L === 'function') ? L('stageComplete', {n: currentStage}) : `Stage ${currentStage} Complete!`;
  const completeText = new PIXI.Text(_stageCompleteStr, {
    fontFamily: 'Segoe UI, Comic Sans MS, sans-serif',
    fontSize: 28,
    fontWeight: '900',
    fill: '#ffffff',
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowBlur: 4,
    dropShadowAlpha: 0.5,
    dropShadowColor: '#000000',
  });
  completeText.anchor.set(0.5, 0.5);
  completeText.y = -12;
  celebrationContainer.addChild(completeText);

  // "Target: X" subtext
  const _targetReachedStr = (typeof L === 'function') ? L('targetReached', {n: stageTarget}) : `Target ${stageTarget} reached! 🎉`;
  const subText = new PIXI.Text(_targetReachedStr, {
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: 16,
    fill: '#aaffaa',
    dropShadow: true,
    dropShadowDistance: 1,
    dropShadowBlur: 2,
    dropShadowAlpha: 0.4,
    dropShadowColor: '#000000',
  });
  subText.anchor.set(0.5, 0.5);
  subText.y = 20;
  celebrationContainer.addChild(subText);

  celebrationContainer.x = appWidth / 2;
  celebrationContainer.y = appHeight * 0.25;
  celebrationContainer.alpha = 0;
  effectLayer.addChild(celebrationContainer);

  // Fade in
  let fadeIn = 0;
  const fadeAnim = () => {
    fadeIn += 0.05;
    celebrationContainer.alpha = Math.min(1, fadeIn);
    celebrationContainer.scale.set(0.5 + Math.min(1, fadeIn) * 0.5);
    if (fadeIn >= 1) {
      app.ticker.remove(fadeAnim);
    }
  };
  app.ticker.add(fadeAnim);
}

function hideCelebrationBanner() {
  if (celebrationContainer) {
    effectLayer.removeChild(celebrationContainer);
    celebrationContainer.destroy({ children: true });
    celebrationContainer = null;
  }
}

// ======================== SPLIT PUFF EFFECT ========================

function showSplitPuff(x, y, color) {
  for (let i = 0; i < _splitPuffCfg.particleCount; i++) {
    const angle = (i / _splitPuffCfg.particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = _splitPuffCfg.speed * (0.5 + Math.random() * 0.5);
    const pColor = color || _splitPuffCfg.colors[Math.floor(Math.random() * _splitPuffCfg.colors.length)];
    const size = _splitPuffCfg.particleSize * (0.5 + Math.random() * 0.5);

    const gfx = new PIXI.Graphics();
    gfx.beginFill(pColor, 0.8);
    gfx.drawCircle(0, 0, size);
    gfx.endFill();
    gfx.x = x;
    gfx.y = y;
    effectLayer.addChild(gfx);

    splitPuffList.push({
      gfx,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: _splitPuffCfg.lifeFrames,
    });
  }
}

function updateSplitPuff(delta) {
  for (let i = splitPuffList.length - 1; i >= 0; i--) {
    const p = splitPuffList[i];
    p.vy += _splitPuffCfg.gravity;
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.life -= delta;

    p.gfx.x = p.x;
    p.gfx.y = p.y;
    p.gfx.alpha = Math.max(0, p.life / _splitPuffCfg.lifeFrames);
    p.gfx.scale.set(0.5 + (p.life / _splitPuffCfg.lifeFrames) * 0.5);

    if (p.life <= 0) {
      effectLayer.removeChild(p.gfx);
      p.gfx.destroy();
      splitPuffList.splice(i, 1);
    }
  }
}

// ======================== DOUBLE-TAP SPLIT ========================

function splitBlock(block) {
  if (block.value <= 1) return;
  if (block._deleteAnim >= 0) return;
  if (block._splitVx !== undefined) return; // already flying from a split

  const center = getBlockCenter(block);
  const value = block.value;
  const leftVal = Math.floor(value / 2);
  const rightVal = Math.ceil(value / 2);
  const color = getBlockColor(value);

  // Remove original block
  removeBlock(block.id, false);

  // Sound effect
  playSplitExplosionSound();

  // Puff effect at center
  showSplitPuff(center.x, center.y, color);

  // Create two new blocks at center with opposing velocities
  const force = _splitCfg.force;

  const blockA = createBlock(leftVal, center.x - 15, center.y, true);
  blockA._splitVx = -force;
  blockA._splitVy = 0;
  blockA._splitSettleTimer = 0;

  const blockB = createBlock(rightVal, center.x + 15, center.y, true);
  blockB._splitVx = force;
  blockB._splitVy = 0;
  blockB._splitSettleTimer = 0;
}

// ======================== SPLIT PHYSICS (called from game loop) ========================

function updateSplitPhysics(delta) {
  for (const block of blocks) {
    if (block._splitVx === undefined && block._splitVy === undefined) continue;
    if (block._deleteAnim >= 0) continue;

    // Apply velocity
    block.container.x += (block._splitVx || 0) * delta;
    block.container.y += (block._splitVy || 0) * delta;

    // Apply friction & gravity
    block._splitVx *= _splitCfg.friction;
    block._splitVy *= _splitCfg.friction;
    block._splitVy += _splitCfg.gravity;

    // Wall bouncing
    const dims = getBlockDims(block);
    const bw = dims.cols * UNIT;
    const bh = dims.rows * UNIT;

    if (block.container.x < 0) {
      block.container.x = 0;
      block._splitVx = Math.abs(block._splitVx) * _splitCfg.bounceFactor;
    }
    if (block.container.x + bw > appWidth) {
      block.container.x = appWidth - bw;
      block._splitVx = -Math.abs(block._splitVx) * _splitCfg.bounceFactor;
    }
    if (block.container.y < 0) {
      block.container.y = 0;
      block._splitVy = Math.abs(block._splitVy) * _splitCfg.bounceFactor;
    }
    if (block.container.y + bh > appHeight) {
      block.container.y = appHeight - bh;
      block._splitVy = -Math.abs(block._splitVy) * _splitCfg.bounceFactor;
    }

    // Check if settled
    const speed = Math.sqrt((block._splitVx || 0) ** 2 + (block._splitVy || 0) ** 2);
    if (speed < _splitCfg.stopSpeed) {
      block._splitSettleTimer = (block._splitSettleTimer || 0) + delta;
      if (block._splitSettleTimer >= _splitCfg.autoFuseDelayFrames) {
        // Clear velocity
        delete block._splitVx;
        delete block._splitVy;
        delete block._splitSettleTimer;

        // Check for auto-fuse with nearby blocks
        const target = findFuseTarget(block);
        if (target && target._splitVx === undefined) {
          fuseBlocks(block, target);
        }
      }
    } else {
      block._splitSettleTimer = 0;
    }
  }
}

// ======================== STAGE UI UPDATE ========================

function updateStageUI() {
  // Update stage/target display elements (if they exist in the DOM)
  const stageEl = document.getElementById('stageDisplay');
  const targetEl = document.getElementById('targetDisplay');
  const _stageStr = (typeof L === 'function') ? L('stage', {n: currentStage}) : `Stage ${currentStage}`;
  const _targetStr = (typeof L === 'function') ? L('target', {n: stageTarget}) : `Target: ${stageTarget}`;
  if (stageEl) stageEl.textContent = _stageStr;
  if (targetEl) targetEl.textContent = _targetStr;
}

// ======================== WINNING BLOCK ANIMATION (called from game loop) ========================

function updateCelebrationAnim(delta) {
  for (const block of blocks) {
    if (block._celebrateAnim !== undefined) {
      block._celebrateAnim += 0.03 * delta;
      const pulse = 1 + Math.sin(block._celebrateAnim * 5) * 0.08;
      block.container.scale.set(pulse);
    }
  }
}

// ======================== RESTART STAGE ========================

window.restartStage = function() {
  celebrationActive = false;
  hideCelebrationBanner();
  clearConfetti();
  destroyEquationDisplay();
  loadStage(currentStage);
};
