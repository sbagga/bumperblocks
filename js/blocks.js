// ======================== BLOCK SYSTEM ========================
// Block creation, rendering, faces, drag & drop, fusing, shadows.
// Depends on: config.js, app.js, constants.js, sound.js
// See: docs/SYSTEMS.md § Block System for data model and layout rules.

const _bRender = CONFIG.blocks.rendering;
const _bInteract = CONFIG.blocks.interaction;
const _bAnim = CONFIG.blocks.animation;
const _bShadow = CONFIG.blocks.shadows;
const _bFuseFlash = CONFIG.blocks.fuseFlash;
const _bSelect = CONFIG.blocks.selection;
const _bSplit = CONFIG.blocks.splitting;

let blocks = [];
let nextId = 1;
let dragState = null;
let selectedBlock = null;       // The block in selection mode
let selectedCubes = [];         // Array of [row, col] pairs the user toggled for detachment
let selectionOverlayGfx = null; // Graphics overlay for selected cube highlights
let splitDragState = null;

/** Get block dims, respecting custom layouts from split blocks. */
function getBlockDims(block) {
  if (block._customCols) return { rows: block._customRows, cols: block._customCols };
  return getBlockDimensions(block.value);
}

/** Get block cell layout, respecting custom layouts from split blocks. */
function getBlockCells(block) {
  return block._customLayout || getBlockLayout(block.value);
}

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

// ======================== SELECTION MODE ========================

function selectBlock(block) {
  if (selectedBlock === block) return;
  deselectBlock();
  selectedBlock = block;
  selectedCubes = [];

  // Darken entire block
  block.cubesGfx.tint = _bSelect.blockDarkenTint;

  // Draw selection border around the whole block
  const dims = getBlockDims(block);
  const bw = dims.cols * UNIT;
  const bh = dims.rows * UNIT;
  const pad = _bSelect.borderPadding;
  const border = new PIXI.Graphics();
  border.lineStyle(_bSelect.borderWidth, _bSelect.borderColor, _bSelect.borderAlpha);
  border.drawRoundedRect(-pad, -pad, bw + pad * 2, bh + pad * 2, _bSelect.borderCornerRadius);
  block.container.addChild(border);
  block._selectionBorder = border;

  // Create overlay container for per-cube highlights
  selectionOverlayGfx = new PIXI.Graphics();
  block.container.addChild(selectionOverlayGfx);
}

function deselectBlock() {
  if (!selectedBlock) return;
  const block = selectedBlock;
  block.cubesGfx.tint = 0xffffff;
  if (block._selectionBorder) {
    block.container.removeChild(block._selectionBorder);
    block._selectionBorder.destroy();
    block._selectionBorder = null;
  }
  if (selectionOverlayGfx && block.container.children.includes(selectionOverlayGfx)) {
    block.container.removeChild(selectionOverlayGfx);
    selectionOverlayGfx.destroy();
  }
  selectionOverlayGfx = null;
  selectedCubes = [];
  selectedBlock = null;
}

/** Hit-test: which [row, col] cube within a block was clicked? */
function getCubeAtLocalPos(block, localX, localY) {
  const dims = getBlockDims(block);
  const layout = getBlockCells(block);
  const col = Math.floor(localX / UNIT);
  const visualRow = Math.floor(localY / UNIT);       // y=0 is top of container
  const row = (dims.rows - 1) - visualRow;           // convert to layout row (0=bottom)
  for (const cell of layout) {
    if (cell[0] === row && cell[1] === col) return [row, col];
  }
  return null;
}

/** Is [row, col] orthogonally adjacent to any cube already in selectedCubes? */
function isAdjacentToSelection(row, col) {
  if (selectedCubes.length === 0) return true; // first pick is always valid
  for (const [sr, sc] of selectedCubes) {
    if ((Math.abs(sr - row) === 1 && sc === col) ||
        (sr === row && Math.abs(sc - col) === 1)) {
      return true;
    }
  }
  return false;
}

/** Check if a set of cells forms one connected group (flood-fill via orthogonal adjacency). */
function isConnected(cells) {
  if (cells.length <= 1) return true;
  const key = (r, c) => `${r},${c}`;
  const set = new Set(cells.map(([r, c]) => key(r, c)));
  const visited = new Set();
  const queue = [cells[0]];
  visited.add(key(cells[0][0], cells[0][1]));
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const k = key(r + dr, c + dc);
      if (set.has(k) && !visited.has(k)) {
        visited.add(k);
        queue.push([r + dr, c + dc]);
      }
    }
  }
  return visited.size === cells.length;
}

/** Would toggling this cube keep both the selected set and the remaining set each connected? */
function wouldMaintainValidShapes(block, row, col, isAdding) {
  const layout = getBlockCells(block);
  let newSelected, newRemaining;
  if (isAdding) {
    newSelected = [...selectedCubes, [row, col]];
    newRemaining = layout.filter(([r, c]) => !newSelected.some(([sr, sc]) => sr === r && sc === c));
  } else {
    newSelected = selectedCubes.filter(([sr, sc]) => !(sr === row && sc === col));
    newRemaining = layout.filter(([r, c]) => !newSelected.some(([sr, sc]) => sr === r && sc === c));
  }
  // Both parts must be contiguous (empty set is trivially valid)
  if (newSelected.length > 0 && !isConnected(newSelected)) return false;
  if (newRemaining.length > 0 && !isConnected(newRemaining)) return false;
  // Can't select ALL cubes
  if (newRemaining.length === 0) return false;
  return true;
}

/** Toggle a cube in/out of the selection, redraw highlights. */
function toggleCubeSelection(block, row, col) {
  const idx = selectedCubes.findIndex(([r, c]) => r === row && c === col);
  if (idx >= 0) {
    // Removing — check remaining selected set stays connected
    if (!wouldMaintainValidShapes(block, row, col, false)) return;
    selectedCubes.splice(idx, 1);
  } else {
    // Adding — must be adjacent and keep both halves connected
    if (!isAdjacentToSelection(row, col)) return;
    if (!wouldMaintainValidShapes(block, row, col, true)) return;
    selectedCubes.push([row, col]);
  }
  redrawSelectionOverlay(block);
}

/** Redraw the per-cube highlight overlay. */
function redrawSelectionOverlay(block) {
  if (!selectionOverlayGfx) return;
  selectionOverlayGfx.clear();
  const dims = getBlockDims(block);
  for (const [row, col] of selectedCubes) {
    const cx = col * UNIT;
    const cy = (dims.rows - 1 - row) * UNIT;
    // Filled overlay
    selectionOverlayGfx.beginFill(_bSelect.selectedCubeTint, _bSelect.selectedCubeOverlayAlpha);
    selectionOverlayGfx.drawRoundedRect(cx + 1, cy + 1, UNIT - 2, UNIT - 2, _bRender.cubeCornerRadius);
    selectionOverlayGfx.endFill();
    // Border highlight
    selectionOverlayGfx.lineStyle(_bSelect.cubeBorderWidth, _bSelect.cubeBorderColor, _bSelect.cubeBorderAlpha);
    selectionOverlayGfx.drawRoundedRect(cx + 1, cy + 1, UNIT - 2, UNIT - 2, _bRender.cubeCornerRadius);
    selectionOverlayGfx.lineStyle(0);
  }
}

// ======================== BLOCK INTERACTION ========================

function setupBlockInteraction(block) {
  const c = block.container;
  c.on('pointerdown', (e) => onBlockPointerDown(e, block));
  c.on('rightclick', (e) => onBlockRightClick(e, block));
  c.on('rightdown', (e) => { e.data.originalEvent.preventDefault(); });

  // Long-press to delete on touch (equivalent of right-click)
  c.on('pointerdown', (e) => {
    if (e.data.pointerType !== 'touch') return;
    block._lpTimer = setTimeout(() => {
      block._lpTimer = null;
      removeBlock(block.id, true);
    }, 600);
  });
  const cancelLp = () => { if (block._lpTimer) { clearTimeout(block._lpTimer); block._lpTimer = null; } };
  c.on('pointermove', cancelLp);
  c.on('pointerup', cancelLp);
  c.on('pointerupoutside', cancelLp);
}

function getBlockCenter(block) {
  const dims = getBlockDims(block);
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
  if (e.data.button !== 0 && e.data.button !== -1) return;
  e.stopPropagation();

  // Cancel long-press timer (will be re-evaluated by drag/tap outcome)
  if (block._lpTimer) { clearTimeout(block._lpTimer); block._lpTimer = null; }

  const pos = e.data.getLocalPosition(app.stage);
  const localPos = e.data.getLocalPosition(block.container);

  // If this block is selected and has cubes marked → start split drag
  if (selectedBlock === block && selectedCubes.length > 0) {
    startSplitDrag(block, pos);
    return;
  }

  // If this block is already in selection mode → tap toggles individual cubes
  if (selectedBlock === block) {
    const cube = getCubeAtLocalPos(block, localPos.x, localPos.y);
    if (cube) {
      // Track for tap (toggle cube) vs drag (start split if cubes selected)
      const tapTrack = { startX: pos.x, startY: pos.y, tapped: false };
      const onTapUp = () => {
        app.stage.off('pointermove', onTapMove);
        app.stage.off('pointerup', onTapUp);
        app.stage.off('pointerupoutside', onTapUp);
        if (!tapTrack.tapped) {
          toggleCubeSelection(block, cube[0], cube[1]);
        }
      };
      const onTapMove = (me) => {
        const mp = me.data.getLocalPosition(app.stage);
        const dx = mp.x - tapTrack.startX;
        const dy = mp.y - tapTrack.startY;
        if (dx * dx + dy * dy > _bSplit.dragDeadZonePx * _bSplit.dragDeadZonePx) {
          tapTrack.tapped = true; // moved too much, not a tap
          app.stage.off('pointermove', onTapMove);
          app.stage.off('pointerup', onTapUp);
          app.stage.off('pointerupoutside', onTapUp);
          // If cubes are selected, start split drag
          if (selectedCubes.length > 0) {
            startSplitDrag(block, mp);
          }
        }
      };
      app.stage.on('pointermove', onTapMove);
      app.stage.on('pointerup', onTapUp);
      app.stage.on('pointerupoutside', onTapUp);
    }
    return;
  }

  // Not selected yet — track for click (select) vs drag (move)
  const trackState = {
    block,
    startX: pos.x,
    startY: pos.y,
    offsetX: pos.x - block.container.x,
    offsetY: pos.y - block.container.y,
    hasDragged: false,
  };

  const onTrackMove = (me) => {
    const mp = me.data.getLocalPosition(app.stage);
    const dx = mp.x - trackState.startX;
    const dy = mp.y - trackState.startY;
    if (!trackState.hasDragged && (dx * dx + dy * dy) > _bSplit.dragDeadZonePx * _bSplit.dragDeadZonePx) {
      trackState.hasDragged = true;
      // Cancel long-press timer on drag
      if (block._lpTimer) { clearTimeout(block._lpTimer); block._lpTimer = null; }
      // Convert to normal drag (move)
      deselectBlock();
      dragState = {
        block: trackState.block,
        offsetX: trackState.offsetX,
        offsetY: trackState.offsetY,
        startX: trackState.block.container.x,
        startY: trackState.block.container.y,
        fuseTarget: null,
        lastX: mp.x,
        lastY: mp.y,
        lastTime: performance.now(),
        velocity: 0,
      };
      block.container.zIndex = _bInteract.dragZIndex;
      block.container.cursor = 'grabbing';
      block.container.alpha = _bInteract.dragAlpha;

      app.stage.off('pointermove', onTrackMove);
      app.stage.off('pointerup', onTrackUp);
      app.stage.off('pointerupoutside', onTrackUp);

      app.stage.on('pointermove', onDragMove);
      app.stage.on('pointerup', onDragEnd);
      app.stage.on('pointerupoutside', onDragEnd);
    }
  };

  const onTrackUp = () => {
    app.stage.off('pointermove', onTrackMove);
    app.stage.off('pointerup', onTrackUp);
    app.stage.off('pointerupoutside', onTrackUp);
    if (!trackState.hasDragged) {
      // Tap → enter selection mode for this block (select it)
      selectBlock(block);
    }
  };

  app.stage.on('pointermove', onTrackMove);
  app.stage.on('pointerup', onTrackUp);
  app.stage.on('pointerupoutside', onTrackUp);
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
    const dims = getBlockDims(block);
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

  const dims = getBlockDims(dragState.block);
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

  // Clear selection if this block is selected
  if (selectedBlock === block) selectedBlock = null;

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
  if (splitDragState && splitDragState.block === block) return;
  removeBlock(block.id, true);
}

// ======================== SPLIT DRAG (RUBBER BAND) ========================

function startSplitDrag(block, pos) {
  const center = getBlockCenter(block);
  const dims = getBlockDims(block);
  const bw = dims.cols * UNIT;
  const bh = dims.rows * UNIT;

  // Shift pivot to center for clean deformation
  block.container.pivot.set(bw / 2, bh / 2);
  block.container.x += bw / 2;
  block.container.y += bh / 2;

  splitDragState = {
    block,
    centerX: center.x,
    centerY: center.y,
    pivotW: bw,
    pivotH: bh,
    lastDragX: pos.x,
    lastDragY: pos.y,
    lastProgress: 0,
    rubberBandGfx: new PIXI.Graphics(),
    splitDone: false,
  };
  effectLayer.addChild(splitDragState.rubberBandGfx);
  setBlockExpression(block, 'angry');
  startStretchSound();

  app.stage.on('pointermove', onSplitDragMove);
  app.stage.on('pointerup', onSplitDragEnd);
  app.stage.on('pointerupoutside', onSplitDragEnd);
}

function onSplitDragMove(e) {
  if (!splitDragState || splitDragState.splitDone) return;
  const pos = e.data.getLocalPosition(app.stage);
  const { block, centerX, centerY, rubberBandGfx, pivotW, pivotH } = splitDragState;

  const dx = pos.x - centerX;
  const dy = pos.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < _bSplit.dragDeadZonePx) {
    block.container.skew.set(0, 0);
    block.container.scale.set(1, 1);
    rubberBandGfx.clear();
    splitDragState.lastProgress = 0;
    updateStretchSound(0);
    return;
  }

  const threshold = _bSplit.thresholdDistancePx;
  const rawProgress = Math.min(dist / threshold, 1.5);
  const progress = Math.pow(rawProgress, _bSplit.resistanceExponent);
  const ndx = dx / dist;
  const ndy = dy / dist;

  // Skew & stretch deformation
  block.container.skew.x = ndx * progress * _bSplit.maxSkew;
  block.container.skew.y = -ndy * progress * _bSplit.maxSkew * 0.4;

  const stretchAmount = 1 + progress * (_bSplit.maxStretch - 1);
  const compressAmount = 1 / Math.sqrt(stretchAmount);
  block.container.scale.x = 1 + Math.abs(ndx) * (stretchAmount - 1) + Math.abs(ndy) * (compressAmount - 1);
  block.container.scale.y = 1 + Math.abs(ndy) * (stretchAmount - 1) + Math.abs(ndx) * (compressAmount - 1);

  // Rubber band visual
  const halfSize = Math.max(pivotW, pivotH) / 2;
  const edgeX = centerX + ndx * halfSize;
  const edgeY = centerY + ndy * halfSize;
  drawRubberBand(rubberBandGfx, edgeX, edgeY, pos.x, pos.y, rawProgress);

  // Update stretch sound pitch
  updateStretchSound(rawProgress);

  // Expression
  if (rawProgress > 0.8) {
    setBlockExpression(block, 'sad');
  } else {
    setBlockExpression(block, 'angry');
  }

  splitDragState.lastDragX = pos.x;
  splitDragState.lastDragY = pos.y;
  splitDragState.lastProgress = rawProgress;

  // ---- SPLIT MID-DRAG when threshold is crossed ----
  if (rawProgress >= 1.0) {
    splitDragState.splitDone = true;
    stopStretchSound();

    // Clean up listeners and graphics
    app.stage.off('pointermove', onSplitDragMove);
    app.stage.off('pointerup', onSplitDragEnd);
    app.stage.off('pointerupoutside', onSplitDragEnd);
    effectLayer.removeChild(rubberBandGfx);
    rubberBandGfx.destroy();

    // Restore pivot
    block.container.pivot.set(0, 0);
    block.container.x -= pivotW / 2;
    block.container.y -= pivotH / 2;
    block.container.skew.set(0, 0);
    block.container.scale.set(1, 1);

    // Execute split with selected cubes
    splitBlockByCubes(block, selectedCubes.slice(), ndx, ndy);
    splitDragState = null;
  }
}

function onSplitDragEnd(e) {
  if (!splitDragState) return;
  app.stage.off('pointermove', onSplitDragMove);
  app.stage.off('pointerup', onSplitDragEnd);
  app.stage.off('pointerupoutside', onSplitDragEnd);

  const { block, rubberBandGfx, pivotW, pivotH, splitDone } = splitDragState;

  // Clean up rubber band
  if (rubberBandGfx.parent) {
    effectLayer.removeChild(rubberBandGfx);
  }
  rubberBandGfx.destroy();
  stopStretchSound();

  if (!splitDone) {
    // Released before threshold — snap back
    snapBackBlock(block, pivotW, pivotH);
  }

  splitDragState = null;
}

function drawRubberBand(gfx, fromX, fromY, toX, toY, progress) {
  gfx.clear();
  if (progress <= 0) return;
  const alpha = _bSplit.rubberBandAlpha * Math.max(0.2, 1 - progress * 0.5);
  const width = _bSplit.rubberBandWidth * Math.max(0.3, 1 - progress * 0.6);

  // Outer glow
  gfx.lineStyle(width + 4, _bSplit.rubberBandColor, alpha * 0.25);
  gfx.moveTo(fromX, fromY);
  gfx.lineTo(toX, toY);
  // Core
  gfx.lineStyle(width, _bSplit.rubberBandColor, alpha);
  gfx.moveTo(fromX, fromY);
  gfx.lineTo(toX, toY);
}

function snapBackBlock(block, pivotW, pivotH) {
  setBlockExpression(block, 'happy');
  const speed = _bSplit.snapBackSpeed;
  const tick = () => {
    block.container.skew.x *= (1 - speed);
    block.container.skew.y *= (1 - speed);
    block.container.scale.x += (1 - block.container.scale.x) * speed;
    block.container.scale.y += (1 - block.container.scale.y) * speed;

    if (Math.abs(block.container.skew.x) < 0.002 &&
        Math.abs(block.container.scale.x - 1) < 0.002) {
      block.container.skew.set(0, 0);
      block.container.scale.set(1, 1);
      // Restore pivot to top-left
      block.container.pivot.set(0, 0);
      block.container.x -= pivotW / 2;
      block.container.y -= pivotH / 2;
      app.ticker.remove(tick);
    }
  };
  app.ticker.add(tick);
}

// ======================== SHAPE-PRESERVING SPLIT ========================

/**
 * Create a block from an arbitrary layout of cells.
 * Normalises the cell coordinates so the layout starts at [0,0].
 * Positions the new block so its center matches originX, originY.
 */
function createBlockFromLayout(cells, originX, originY, animate) {
  const value = cells.length;
  if (value < 1) return null;

  // Normalize cells to start at row=0, col=0
  let minR = Infinity, minC = Infinity;
  for (const [r, c] of cells) { minR = Math.min(minR, r); minC = Math.min(minC, c); }
  const normCells = cells.map(([r, c]) => [r - minR, c - minC]);

  // Compute dimensions
  let maxR = 0, maxC = 0;
  for (const [r, c] of normCells) { maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
  const rows = maxR + 1;
  const cols = maxC + 1;
  const bw = cols * UNIT;
  const bh = rows * UNIT;

  const id = nextId++;
  const container = new PIXI.Container();
  container.x = originX - bw / 2;
  container.y = originY - bh / 2;
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
    _customLayout: normCells,         // flag: custom layout
    _customRows: rows,
    _customCols: cols,
  };

  renderBlockFromLayout(block, normCells, rows, cols);
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

/** Render a block using an explicit cell layout (not the standard getBlockLayout). */
function renderBlockFromLayout(block, cells, rows, cols) {
  const { container, value } = block;
  container.removeChildren();

  const color = getBlockColor(value);
  const bw = cols * UNIT;
  const bh = rows * UNIT;

  const cubesGfx = new PIXI.Graphics();
  cells.forEach(([row, col]) => {
    const cx = col * UNIT;
    const cy = (rows - 1 - row) * UNIT;
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
  const topRow = Math.max(...cells.map(([r]) => r));
  const topCubes = cells.filter(([r]) => r === topRow);
  if (topCubes.length > 0) {
    const faceCube = topCubes[Math.floor(topCubes.length / 2)];
    const faceGfx = new PIXI.Graphics();
    const faceX = faceCube[1] * UNIT + UNIT / 2 - 20;
    const faceY = (rows - 1 - faceCube[0]) * UNIT + UNIT - 28;
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

  // Fuse zone indicator
  const fuseZone = new PIXI.Graphics();
  fuseZone.visible = false;
  container.addChild(fuseZone);
  block.fuseZoneGfx = fuseZone;

  container.hitArea = new PIXI.Rectangle(0, 0, bw, bh);
}

/**
 * Split a block by detaching the selected cubes.
 * Both pieces preserve their shapes. The detached piece pops in the drag direction.
 */
function splitBlockByCubes(block, detachCells, ndx, ndy) {
  const layout = getBlockCells(block);
  const remainCells = layout.filter(([r, c]) => !detachCells.some(([sr, sc]) => sr === r && sc === c));
  const center = getBlockCenter(block);

  // Clear selection state before removing
  deselectBlock();
  removeBlock(block.id, false);

  playSplitSound();

  // Create remaining piece at original position
  if (remainCells.length > 0) {
    const rb = createBlockFromLayout(remainCells, center.x, center.y, false);
    if (rb) rb._fuseAnim = 0;
  }

  // Create detached piece popped out in drag direction
  const popDist = _bSplit.splitPopDistancePx;
  const detachX = center.x + ndx * popDist;
  const detachY = center.y + ndy * popDist;
  if (detachCells.length > 0) {
    createBlockFromLayout(detachCells, detachX, detachY, true);
  }

  // Flash
  showFuseFlash(center.x + ndx * 20, center.y + ndy * 20);
}

// ======================== SHADOW SYSTEM ========================

function updateBlockShadows(dirX, lengthFactor, altitude, opacity) {
  for (const block of blocks) {
    if (!block.shadowGfx) continue;
    if (block._deleteAnim >= 0) { block.shadowGfx.visible = false; continue; }

    const dims = getBlockDims(block);
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
