// ======================== BLOCK SYSTEM ========================
// Block creation, rendering, faces, drag & drop, fusing, shadows.
// Depends on: config.js, app.js, constants.js, sound.js
// See: docs/SYSTEMS.md § Block System for data model and layout rules.

const _bRender = CONFIG.blocks.rendering;
const _bInteract = CONFIG.blocks.interaction;
const _bAnim = CONFIG.blocks.animation;
const _bShadow = CONFIG.blocks.shadows;
const _bFuseFlash = CONFIG.blocks.fuseFlash;

let blocks = [];
let nextId = 1;
let dragState = null;

// ======================== BLOCK CRUD ========================

function createBlock(value, x, y, animate = true) {
  const id = nextId++;
  const dims = getBlockDimensions(value);
  const bw = dims.cols * UNIT;
  const bh = dims.rows * UNIT;
  const bx = x - bw / 2;
  const by = y - bh / 2;

  const container = new PIXI.Container();
  container.x = bx;
  container.y = by;
  container.interactive = true;
  container.cursor = 'grab';
  container.zIndex = _bInteract.defaultZIndex;

  const block = {
    id, value, container,
    expression: 'happy',
    faceGfx: null,
    cubesGfx: null,
    labelText: null,
    shadowGfx: null,
    fuseZoneGfx: null,
    _origAlpha: 1,
    _origValue: value,
    _spawnAnim: animate ? 0 : 1,
    _deleteAnim: -1,
  };

  renderBlock(block);
  setupBlockInteraction(block);
  blockLayer.addChild(container);

  // Shadow
  const shadow = new PIXI.Graphics();
  shadow.alpha = _bShadow.fillAlpha;
  blockShadowLayer.addChild(shadow);
  block.shadowGfx = shadow;

  blocks.push(block);
  if (animate) playSpawnPop();
  return block;
}

function renderBlock(block) {
  const { container, value } = block;
  container.removeChildren();

  const color = getBlockColor(value);
  const layout = getBlockLayout(value);
  const dims = getBlockDimensions(value);
  const bw = dims.cols * UNIT;
  const bh = dims.rows * UNIT;

  // Cubes
  const cubesGfx = new PIXI.Graphics();
  layout.forEach(([row, col]) => {
    const cx = col * UNIT;
    const cy = (dims.rows - 1 - row) * UNIT;
    const shade = 1 - (row * _bRender.rowShadeFactor);
    const shadedColor = shadeColor(color, shade);

    cubesGfx.lineStyle(_bRender.cubeBorderWidth, _bRender.cubeBorderColor, _bRender.cubeBorderAlpha);
    cubesGfx.beginFill(shadedColor);
    cubesGfx.drawRoundedRect(cx, cy, UNIT, UNIT, _bRender.cubeCornerRadius);
    cubesGfx.endFill();

    cubesGfx.lineStyle(0);
    cubesGfx.beginFill(0xffffff, _bRender.cubeHighlightAlpha);
    cubesGfx.drawRoundedRect(
      cx + _bRender.cubeHighlightOffsetX,
      cy + _bRender.cubeHighlightOffsetY,
      UNIT / 2 - _bRender.cubeHighlightSizeReduction,
      UNIT / 2 - _bRender.cubeHighlightSizeReduction,
      _bRender.cubeHighlightCornerRadius
    );
    cubesGfx.endFill();
  });
  container.addChild(cubesGfx);
  block.cubesGfx = cubesGfx;

  // Face on top-center cube
  const topCubes = layout.filter(([r]) => r === dims.rows - 1);
  if (topCubes.length > 0) {
    const faceCube = topCubes[Math.floor(topCubes.length / 2)];
    const faceGfx = new PIXI.Graphics();
    const faceX = faceCube[1] * UNIT + UNIT / 2 - 20;
    const faceY = (dims.rows - 1 - faceCube[0]) * UNIT + UNIT - 28;
    faceGfx.x = faceX;
    faceGfx.y = faceY;
    drawFace(faceGfx, 'happy');
    container.addChild(faceGfx);
    block.faceGfx = faceGfx;
  }

  // Number label
  const isLightColor = CONFIG.blockColors.lightColorBlockValues.includes(value);
  const label = new PIXI.Text(value.toString(), {
    fontFamily: _bRender.labelFontFamily,
    fontSize: _bRender.labelFontSize,
    fontWeight: _bRender.labelFontWeight,
    fill: isLightColor ? _bRender.labelDarkColor : _bRender.labelLightColor,
    dropShadow: _bRender.labelDropShadow,
    dropShadowDistance: _bRender.labelDropShadowDistance,
    dropShadowBlur: _bRender.labelDropShadowBlur,
    dropShadowAlpha: _bRender.labelDropShadowAlpha,
    dropShadowColor: _bRender.labelDropShadowColor,
  });
  label.anchor.set(0.5, 1);
  label.x = bw / 2;
  label.y = _bRender.labelYOffset;
  container.addChild(label);
  block.labelText = label;

  // Fuse zone indicator (hidden by default)
  const fuseZone = new PIXI.Graphics();
  fuseZone.visible = false;
  container.addChild(fuseZone);
  block.fuseZoneGfx = fuseZone;

  container.hitArea = new PIXI.Rectangle(0, 0, bw, bh);
}

// ======================== FACE DRAWING ========================

function drawFace(g, expression, pupilOffX, pupilOffY) {
  g.clear();
  switch (expression) {
    case 'happy': drawHappyFace(g); break;
    case 'angry': drawAngryFace(g); break;
    case 'sad': drawSadFace(g); break;
    case 'irritated': drawIrritatedFace(g, pupilOffX || 0, pupilOffY || 0); break;
    default: drawHappyFace(g);
  }
}

function drawHappyFace(g) {
  g.beginFill(0xffffff);
  g.drawEllipse(12, 8, 4, 5);
  g.drawEllipse(28, 8, 4, 5);
  g.endFill();
  g.beginFill(0x222222);
  g.drawEllipse(13, 9, 2, 2.5);
  g.drawEllipse(29, 9, 2, 2.5);
  g.endFill();
  g.lineStyle(2.2, 0xffffff);
  g.moveTo(10, 19);
  g.quadraticCurveTo(20, 27, 30, 19);
  g.lineStyle(0);
}

function drawAngryFace(g) {
  g.lineStyle(2.5, 0xffffff);
  g.moveTo(6, 2); g.lineTo(16, 5);
  g.moveTo(34, 2); g.lineTo(24, 5);
  g.lineStyle(0);
  g.beginFill(0xffffff);
  g.drawEllipse(12, 10, 4, 4);
  g.drawEllipse(28, 10, 4, 4);
  g.endFill();
  g.beginFill(0x222222);
  g.drawEllipse(13, 10, 2, 2);
  g.drawEllipse(29, 10, 2, 2);
  g.endFill();
  g.lineStyle(2.2, 0xffffff);
  g.moveTo(12, 22); g.lineTo(20, 19); g.lineTo(28, 22);
  g.lineStyle(0);
}

function drawSadFace(g) {
  g.beginFill(0xffffff);
  g.drawEllipse(12, 9, 4, 5);
  g.drawEllipse(28, 9, 4, 5);
  g.endFill();
  g.beginFill(0x222222);
  g.drawEllipse(12, 11, 2, 2.5);
  g.drawEllipse(28, 11, 2, 2.5);
  g.endFill();
  g.lineStyle(1.8, 0xffffff);
  g.moveTo(7, 4); g.lineTo(15, 2);
  g.moveTo(33, 4); g.lineTo(25, 2);
  g.lineStyle(2.2, 0xffffff);
  g.moveTo(12, 24);
  g.quadraticCurveTo(20, 17, 28, 24);
  g.lineStyle(0);
}

function drawIrritatedFace(g, pupilOffX, pupilOffY) {
  g.beginFill(0xffffff);
  g.drawEllipse(12, 9, 5, 3);
  g.drawEllipse(28, 9, 5, 3);
  g.endFill();
  g.beginFill(0x222222);
  g.drawEllipse(12 + pupilOffX, 9 + pupilOffY, 2.5, 2);
  g.drawEllipse(28 + pupilOffX, 9 + pupilOffY, 2.5, 2);
  g.endFill();
  g.lineStyle(2.2, 0xffffff);
  g.moveTo(6, 3); g.lineTo(17, 4);
  g.moveTo(34, 3); g.lineTo(23, 4);
  g.moveTo(11, 21);
  g.quadraticCurveTo(16, 18, 20, 21);
  g.quadraticCurveTo(24, 24, 29, 21);
  g.lineStyle(0);
}

function setBlockExpression(block, expression, pupilOffX, pupilOffY) {
  if (!block || !block.faceGfx) return;
  if (block.expression === expression && expression !== 'irritated') return;
  block.expression = expression;
  drawFace(block.faceGfx, expression, pupilOffX, pupilOffY);
}

// ======================== BLOCK INTERACTION ========================

function setupBlockInteraction(block) {
  const c = block.container;
  c.on('pointerdown', (e) => onBlockPointerDown(e, block));
  c.on('rightclick', (e) => onBlockRightClick(e, block));
  c.on('rightdown', (e) => { e.data.originalEvent.preventDefault(); });
}

function getBlockCenter(block) {
  const dims = getBlockDimensions(block.value);
  return {
    x: block.container.x + (dims.cols * UNIT) / 2,
    y: block.container.y + (dims.rows * UNIT) / 2,
  };
}

function getDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function findFuseTarget(draggedBlock) {
  let closest = null;
  let closestDist = Infinity;
  for (const block of blocks) {
    if (block.id === draggedBlock.id) continue;
    if (block._deleteAnim >= 0) continue;
    const c1 = getBlockCenter(draggedBlock);
    const c2 = getBlockCenter(block);
    const dist = getDistance(c1, c2);
    const fuseDist = FUSE_DISTANCE + (draggedBlock.value + block.value) * CONFIG.grid.fuseDistancePerCombinedValue;
    if (dist < fuseDist && dist < closestDist) {
      closest = block;
      closestDist = dist;
    }
  }
  return closest;
}

function onBlockPointerDown(e, block) {
  if (e.data.button !== 0) return;
  e.stopPropagation();

  const pos = e.data.getLocalPosition(app.stage);
  dragState = {
    block,
    offsetX: pos.x - block.container.x,
    offsetY: pos.y - block.container.y,
    startX: block.container.x,
    startY: block.container.y,
    fuseTarget: null,
    lastX: pos.x,
    lastY: pos.y,
    lastTime: performance.now(),
    velocity: 0,
  };

  block.container.zIndex = _bInteract.dragZIndex;
  block.container.cursor = 'grabbing';
  block.container.alpha = _bInteract.dragAlpha;

  app.stage.on('pointermove', onDragMove);
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);
}

function updateProximityExpressions(draggedBlock) {
  const dragCenter = getBlockCenter(draggedBlock);
  for (const block of blocks) {
    if (block.id === draggedBlock.id) continue;
    if (block._deleteAnim >= 0) continue;
    const c2 = getBlockCenter(block);
    const dist = getDistance(dragCenter, c2);
    const fuseDist = FUSE_DISTANCE + (draggedBlock.value + block.value) * CONFIG.grid.fuseDistancePerCombinedValue;
    const irritateDist = fuseDist + IRRITATE_DISTANCE;

    if (dist < irritateDist) {
      const blockCenter = getBlockCenter(block);
      const dx = dragCenter.x - blockCenter.x;
      const dy = dragCenter.y - blockCenter.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const offX = (dx / d) * _bInteract.irritatedPupilOffsetX;
      const offY = (dy / d) * _bInteract.irritatedPupilOffsetY;
      setBlockExpression(block, 'irritated', offX, offY);
    } else {
      setBlockExpression(block, 'happy');
    }
  }
}

function resetAllExpressions() {
  for (const block of blocks) {
    if (block._deleteAnim >= 0) continue;
    setBlockExpression(block, 'happy');
  }
}

function showFuseZone(block, show) {
  if (!block.fuseZoneGfx) return;
  const fz = block.fuseZoneGfx;
  fz.clear();
  if (show) {
    const dims = getBlockDimensions(block.value);
    const bw = dims.cols * UNIT;
    const bh = dims.rows * UNIT;
    const pad = _bInteract.fuseZonePadding;
    fz.lineStyle({ width: _bInteract.fuseZoneLineWidth, color: _bInteract.fuseZoneColor, alpha: _bInteract.fuseZoneAlpha, alignment: 0.5 });
    drawDashedRect(fz, -pad, -pad, bw + pad * 2, bh + pad * 2, _bInteract.fuseZoneCornerRadius, _bInteract.fuseZoneDashLength, _bInteract.fuseZoneGapLength);
    fz.visible = true;
  } else {
    fz.visible = false;
  }
}

function drawDashedRect(g, x, y, w, h, r, dashLen, gapLen) {
  g.drawRoundedRect(x, y, w, h, r);
}

function showFusePreview(targetBlock, draggedBlock) {
  targetBlock.container.alpha = _bInteract.fusePreviewAlpha;
}

function revertFusePreview(targetBlock) {
  if (!targetBlock) return;
  targetBlock.container.alpha = 1;
}

function onDragMove(e) {
  if (!dragState) return;
  const pos = e.data.getLocalPosition(app.stage);
  let newX = pos.x - dragState.offsetX;
  let newY = pos.y - dragState.offsetY;

  const dims = getBlockDimensions(dragState.block.value);
  const bw = dims.cols * UNIT;
  const bh = dims.rows * UNIT;
  newX = Math.max(0, Math.min(newX, appWidth - bw));
  newY = Math.max(0, Math.min(newY, appHeight - bh));

  dragState.block.container.x = newX;
  dragState.block.container.y = newY;

  // Velocity tracking
  const now = performance.now();
  const dt = now - dragState.lastTime;
  if (dt > 0) {
    const dx = pos.x - dragState.lastX;
    const dy = pos.y - dragState.lastY;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    dragState.velocity = dragState.velocity * _bInteract.velocitySmoothingPrevious + speed * _bInteract.velocitySmoothingCurrent;
  }
  dragState.lastX = pos.x;
  dragState.lastY = pos.y;
  dragState.lastTime = now;

  if (dragState.velocity > _bInteract.angrySpeedThreshold) {
    setBlockExpression(dragState.block, 'angry');
  } else {
    setBlockExpression(dragState.block, 'happy');
  }

  updateProximityExpressions(dragState.block);

  // Fuse target detection
  const target = findFuseTarget(dragState.block);
  const prevTarget = dragState.fuseTarget;

  if (prevTarget && prevTarget !== target) {
    showFuseZone(prevTarget, false);
    revertFusePreview(prevTarget);
  }

  dragState.fuseTarget = target;
  if (target) {
    showFuseZone(target, true);
    if (prevTarget !== target) {
      playPuckSound();
      showFusePreview(target, dragState.block);
    }
  }
}

function onDragEnd(e) {
  if (!dragState) return;
  app.stage.off('pointermove', onDragMove);
  app.stage.off('pointerup', onDragEnd);
  app.stage.off('pointerupoutside', onDragEnd);

  dragState.block.container.zIndex = _bInteract.defaultZIndex;
  dragState.block.container.cursor = 'grab';
  dragState.block.container.alpha = 1;
  setBlockExpression(dragState.block, 'happy');
  resetAllExpressions();

  if (dragState.fuseTarget) {
    showFuseZone(dragState.fuseTarget, false);
    revertFusePreview(dragState.fuseTarget);
    fuseBlocks(dragState.block, dragState.fuseTarget);
  }

  dragState = null;
}

function removeBlock(id, animate = true) {
  const idx = blocks.findIndex(b => b.id === id);
  if (idx === -1) return;
  const block = blocks[idx];

  if (animate) {
    setBlockExpression(block, 'sad');
    playDeletePoof();
    block._deleteAnim = 0;
    block.container.interactive = false;
  } else {
    if (block.shadowGfx) {
      blockShadowLayer.removeChild(block.shadowGfx);
      block.shadowGfx.destroy();
    }
    blockLayer.removeChild(block.container);
    block.container.destroy({ children: true });
    blocks.splice(idx, 1);
  }
}

function fuseBlocks(blockA, blockB) {
  const newValue = blockA.value + blockB.value;
  const centerA = getBlockCenter(blockA);
  const centerB = getBlockCenter(blockB);
  const midX = (centerA.x + centerB.x) / 2;
  const midY = (centerA.y + centerB.y) / 2;

  removeBlock(blockA.id, false);
  removeBlock(blockB.id, false);
  playBubbleBurst();

  const newBlock = createBlock(newValue, midX, midY, false);
  newBlock._fuseAnim = 0;

  showFuseFlash(midX, midY);
}

function showFuseFlash(x, y) {
  const flash = new PIXI.Graphics();
  for (let i = _bFuseFlash.ringCount - 1; i >= 0; i--) {
    const r = _bFuseFlash.baseRadius + i * _bFuseFlash.ringSpacing;
    flash.beginFill(_bFuseFlash.color, _bFuseFlash.peakAlpha * (1 - i / _bFuseFlash.ringCount));
    flash.drawCircle(0, 0, r);
    flash.endFill();
  }
  flash.x = x;
  flash.y = y;
  effectLayer.addChild(flash);
  let flashLife = 0;
  const flashAnim = () => {
    flashLife++;
    flash.alpha = 1 - flashLife / _bFuseFlash.durationFrames;
    flash.scale.set(1 + flashLife * _bFuseFlash.scalePerFrame);
    if (flashLife >= _bFuseFlash.durationFrames) {
      effectLayer.removeChild(flash);
      flash.destroy();
      app.ticker.remove(flashAnim);
    }
  };
  app.ticker.add(flashAnim);
}

function onBlockRightClick(e, block) {
  e.data.originalEvent.preventDefault();
  e.stopPropagation();
  removeBlock(block.id, true);
}

// ======================== SHADOW SYSTEM ========================

function updateBlockShadows(dirX, lengthFactor, altitude, opacity) {
  for (const block of blocks) {
    if (!block.shadowGfx) continue;
    if (block._deleteAnim >= 0) { block.shadowGfx.visible = false; continue; }

    const dims = getBlockDimensions(block.value);
    const bw = dims.cols * UNIT;
    const bh = dims.rows * UNIT;
    const offX = dirX * _bShadow.horizontalShiftMultiplier * lengthFactor;
    const scaleX = 1 + Math.abs(dirX) * _bShadow.stretchFactor;

    const shadowGfx = block.shadowGfx;
    shadowGfx.clear();
    shadowGfx.beginFill(0x000000, _bShadow.fillAlpha);
    shadowGfx.drawRoundedRect(0, 0, bw, bh * _bShadow.heightFraction, _bShadow.cornerRadius);
    shadowGfx.endFill();

    shadowGfx.x = block.container.x + offX;
    shadowGfx.y = block.container.y + bh;
    shadowGfx.scale.x = scaleX;
    shadowGfx.skew.x = -dirX * _bShadow.skewFactor;
    shadowGfx.alpha = Math.max(_bShadow.minAlpha, opacity * _bShadow.alphaMultiplier);
    shadowGfx.visible = true;
  }
}
