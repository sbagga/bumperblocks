// ======================== ENVIRONMENT ========================
// Background, coconut tree, grass, birds.
// Depends on: config.js, app.js (layers, appWidth, appHeight), constants.js (hslToRgb)
// See: docs/SYSTEMS.md § Environment for details.

const _bg = CONFIG.environment.background;
const _tree = CONFIG.environment.tree;
const _grass = CONFIG.environment.grass;
const _bird = CONFIG.environment.birds;

// ======================== BACKGROUND ========================
function createBackground() {
  const canvas = document.createElement('canvas');
  canvas.width = appWidth;
  canvas.height = appHeight;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, appWidth * 0.6, appHeight);
  for (const stop of _bg.gradientStops) {
    grad.addColorStop(stop.offset, stop.color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, appWidth, appHeight);

  // Subtle diamond pattern
  ctx.fillStyle = _bg.diamondPatternFill;
  const size = _bg.diamondPatternSize;
  for (let y = 0; y < appHeight; y += size) {
    for (let x = 0; x < appWidth; x += size) {
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size, y + size/2);
      ctx.lineTo(x + size/2, y + size);
      ctx.lineTo(x, y + size/2);
      ctx.closePath();
      ctx.fill();
    }
  }

  const bgSprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
  bgLayer.addChild(bgSprite);
  return bgSprite;
}

const bgSprite = createBackground();

// ======================== COCONUT TREE ========================
const TREE_SVG = `<svg viewBox="0 0 ${_tree.svgWidth} ${_tree.svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5c3a1a"/>
      <stop offset="25%" stop-color="#7a5a30"/>
      <stop offset="50%" stop-color="#9a7a44"/>
      <stop offset="75%" stop-color="#7a5a30"/>
      <stop offset="100%" stop-color="#5c3a1a"/>
    </linearGradient>
    <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3d7a2a"/>
      <stop offset="40%" stop-color="#5aad3a"/>
      <stop offset="100%" stop-color="#2d6a1e"/>
    </linearGradient>
    <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#347026"/>
      <stop offset="50%" stop-color="#4e9e34"/>
      <stop offset="100%" stop-color="#2a5e1a"/>
    </linearGradient>
  </defs>
  <path d="M115,480 C112,470 108,420 106,370 C103,310 100,260 102,210 C104,170 110,140 118,125 L128,125 C132,140 136,170 137,210 C138,260 136,310 134,370 C132,420 130,470 128,480 Z" fill="url(#trunkGrad)" stroke="#4a2e14" stroke-width="0.5"/>
  <g stroke="rgba(0,0,0,0.12)" stroke-width="1" fill="none">
    <path d="M107,380 Q120,384 133,380"/><path d="M106,355 Q120,359 134,355"/>
    <path d="M105,330 Q120,334 134,330"/><path d="M104,305 Q120,309 135,305"/>
    <path d="M103,280 Q120,284 136,280"/><path d="M103,255 Q120,259 136,255"/>
    <path d="M103,230 Q120,234 136,230"/><path d="M103,210 Q120,214 137,210"/>
    <path d="M104,190 Q120,194 136,190"/><path d="M106,170 Q120,174 135,170"/>
    <path d="M108,155 Q120,158 133,155"/><path d="M110,142 Q120,145 131,142"/>
    <path d="M108,400 Q120,404 133,400"/><path d="M109,420 Q120,424 132,420"/>
    <path d="M111,440 Q120,444 131,440"/><path d="M113,458 Q120,461 130,458"/>
  </g>
  <g><path d="M122,128 C140,115 175,105 210,130" stroke="url(#leafGrad1)" stroke-width="3" fill="none"/>
  <g fill="url(#leafGrad1)"><path d="M140,118 C148,105 155,100 158,108 C152,108 146,114 140,118Z"/>
  <path d="M155,114 C163,100 172,96 174,105 C168,106 160,110 155,114Z"/>
  <path d="M170,112 C178,98 188,95 189,104 C183,106 176,110 170,112Z"/>
  <path d="M185,116 C193,104 202,102 203,110 C197,112 190,114 185,116Z"/>
  <path d="M198,122 C204,112 212,112 212,118 C207,119 202,120 198,122Z"/>
  <path d="M145,122 C150,132 156,135 157,128 C153,127 148,125 145,122Z"/>
  <path d="M160,120 C166,130 174,132 174,125 C170,124 164,122 160,120Z"/>
  <path d="M175,118 C182,128 190,129 190,122 C186,121 180,120 175,118Z"/>
  <path d="M190,122 C196,130 203,130 202,124 C198,123 194,122 190,122Z"/></g></g>
  <g><path d="M122,130 C138,108 168,80 200,70" stroke="url(#leafGrad2)" stroke-width="3" fill="none"/>
  <g fill="url(#leafGrad2)"><path d="M138,110 C144,95 152,88 154,97 C149,98 143,104 138,110Z"/>
  <path d="M155,96 C162,80 170,75 172,84 C167,86 160,90 155,96Z"/>
  <path d="M170,84 C178,68 186,65 187,74 C182,76 175,80 170,84Z"/>
  <path d="M185,76 C192,64 200,63 200,71 C196,72 190,74 185,76Z"/>
  <path d="M145,115 C150,125 158,126 157,118 C153,117 148,116 145,115Z"/>
  <path d="M160,104 C166,114 174,114 173,107 C169,106 164,105 160,104Z"/>
  <path d="M175,92 C182,100 190,100 189,93 C185,92 180,92 175,92Z"/></g></g>
  <g><path d="M120,128 C118,100 122,60 135,25" stroke="url(#leafGrad1)" stroke-width="3" fill="none"/>
  <g fill="url(#leafGrad1)"><path d="M120,100 C108,90 105,82 112,82 C114,86 116,92 120,100Z"/>
  <path d="M120,78 C108,66 106,58 113,58 C115,62 117,70 120,78Z"/>
  <path d="M122,58 C112,44 112,36 118,37 C119,42 120,50 122,58Z"/>
  <path d="M126,40 C120,28 122,22 127,24 C127,28 126,34 126,40Z"/>
  <path d="M122,100 C134,90 138,82 132,82 C130,86 126,92 122,100Z"/>
  <path d="M124,78 C136,66 138,58 132,59 C130,63 127,70 124,78Z"/>
  <path d="M127,58 C136,46 138,38 132,40 C131,44 129,50 127,58Z"/>
  <path d="M130,40 C136,30 136,24 132,26 C131,30 130,35 130,40Z"/></g></g>
  <g><path d="M118,128 C100,115 65,105 30,130" stroke="url(#leafGrad1)" stroke-width="3" fill="none"/>
  <g fill="url(#leafGrad1)"><path d="M100,118 C92,105 85,100 82,108 C88,108 94,114 100,118Z"/>
  <path d="M85,114 C77,100 68,96 66,105 C72,106 80,110 85,114Z"/>
  <path d="M70,112 C62,98 52,95 51,104 C57,106 64,110 70,112Z"/>
  <path d="M55,116 C47,104 38,102 37,110 C43,112 50,114 55,116Z"/>
  <path d="M42,122 C36,112 28,112 28,118 C33,119 38,120 42,122Z"/>
  <path d="M95,122 C90,132 84,135 83,128 C87,127 92,125 95,122Z"/>
  <path d="M80,120 C74,130 66,132 66,125 C70,124 76,122 80,120Z"/>
  <path d="M65,118 C58,128 50,129 50,122 C54,121 60,120 65,118Z"/>
  <path d="M50,122 C44,130 37,130 38,124 C42,123 46,122 50,122Z"/></g></g>
  <g><path d="M118,130 C102,108 72,80 40,70" stroke="url(#leafGrad2)" stroke-width="3" fill="none"/>
  <g fill="url(#leafGrad2)"><path d="M102,110 C96,95 88,88 86,97 C91,98 97,104 102,110Z"/>
  <path d="M85,96 C78,80 70,75 68,84 C73,86 80,90 85,96Z"/>
  <path d="M70,84 C62,68 54,65 53,74 C58,76 65,80 70,84Z"/>
  <path d="M55,76 C48,64 40,63 40,71 C44,72 50,74 55,76Z"/>
  <path d="M95,115 C90,125 82,126 83,118 C87,117 92,116 95,115Z"/>
  <path d="M80,104 C74,114 66,114 67,107 C71,106 76,105 80,104Z"/>
  <path d="M65,92 C58,100 50,100 51,93 C55,92 60,92 65,92Z"/></g></g>
  <g><path d="M116,132 C90,125 50,130 15,155" stroke="#2d6a1e" stroke-width="2.5" fill="none"/>
  <g fill="#2d6a1e" opacity="0.7"><path d="M88,126 C82,116 76,114 76,120 C80,121 84,124 88,126Z"/>
  <path d="M68,128 C60,120 54,118 54,124 C58,125 64,126 68,128Z"/>
  <path d="M48,134 C40,128 34,128 35,133 C38,134 44,134 48,134Z"/>
  <path d="M30,142 C24,136 18,138 20,142 C23,143 26,142 30,142Z"/></g></g>
  <g><path d="M124,132 C150,125 190,130 225,155" stroke="#2d6a1e" stroke-width="2.5" fill="none"/>
  <g fill="#2d6a1e" opacity="0.7"><path d="M152,126 C158,116 164,114 164,120 C160,121 156,124 152,126Z"/>
  <path d="M172,128 C180,120 186,118 186,124 C182,125 176,126 172,128Z"/>
  <path d="M192,134 C200,128 206,128 205,133 C202,134 196,134 192,134Z"/>
  <path d="M210,142 C216,136 222,138 220,142 C217,143 214,142 210,142Z"/></g></g>
  <g><path d="M124,126 C148,108 190,92 235,105" stroke="url(#leafGrad2)" stroke-width="2.5" fill="none"/>
  <g fill="url(#leafGrad2)"><path d="M152,110 C160,96 168,92 170,100 C164,101 158,106 152,110Z"/>
  <path d="M172,104 C180,90 190,88 191,96 C185,98 178,102 172,104Z"/>
  <path d="M195,100 C202,90 210,90 210,97 C205,98 200,99 195,100Z"/>
  <path d="M215,102 C220,94 228,96 226,102 C222,103 218,103 215,102Z"/>
  <path d="M158,114 C164,122 170,122 170,116 C166,115 162,114 158,114Z"/>
  <path d="M178,110 C184,118 192,117 191,111 C187,110 182,110 178,110Z"/>
  <path d="M200,105 C206,112 214,110 212,105 C208,104 204,104 200,105Z"/></g></g>
  <g><path d="M116,126 C92,108 50,92 5,105" stroke="url(#leafGrad2)" stroke-width="2.5" fill="none"/>
  <g fill="url(#leafGrad2)"><path d="M88,110 C80,96 72,92 70,100 C76,101 82,106 88,110Z"/>
  <path d="M68,104 C60,90 50,88 49,96 C55,98 62,102 68,104Z"/>
  <path d="M45,100 C38,90 30,90 30,97 C35,98 40,99 45,100Z"/>
  <path d="M25,102 C20,94 12,96 14,102 C18,103 22,103 25,102Z"/>
  <path d="M82,114 C76,122 70,122 70,116 C74,115 78,114 82,114Z"/>
  <path d="M62,110 C56,118 48,117 49,111 C53,110 58,110 62,110Z"/>
  <path d="M40,105 C34,112 26,110 28,105 C32,104 36,104 40,105Z"/></g></g>
  <g><path d="M124,125 C135,98 155,60 180,40" stroke="url(#leafGrad1)" stroke-width="2.5" fill="none"/>
  <g fill="url(#leafGrad1)"><path d="M136,96 C142,82 150,78 150,86 C146,88 140,92 136,96Z"/>
  <path d="M150,76 C158,60 166,58 165,66 C161,68 156,72 150,76Z"/>
  <path d="M162,58 C168,44 175,44 174,52 C170,54 166,56 162,58Z"/>
  <path d="M138,100 C146,108 152,106 150,100 C146,98 142,98 138,100Z"/>
  <path d="M155,82 C162,90 168,86 166,81 C162,80 158,80 155,82Z"/></g></g>
  <g><path d="M116,125 C105,98 85,60 60,40" stroke="url(#leafGrad1)" stroke-width="2.5" fill="none"/>
  <g fill="url(#leafGrad1)"><path d="M104,96 C98,82 90,78 90,86 C94,88 100,92 104,96Z"/>
  <path d="M90,76 C82,60 74,58 75,66 C79,68 84,72 90,76Z"/>
  <path d="M78,58 C72,44 65,44 66,52 C70,54 74,56 78,58Z"/>
  <path d="M102,100 C94,108 88,106 90,100 C94,98 98,98 102,100Z"/>
  <path d="M85,82 C78,90 72,86 74,81 C78,80 82,80 85,82Z"/></g></g>
  <ellipse cx="112" cy="132" rx="9" ry="8" fill="#6b3d1a" stroke="#4a2a10" stroke-width="1"/>
  <ellipse cx="110" cy="130" rx="5" ry="4" fill="#8a5528" opacity="0.4"/>
  <ellipse cx="128" cy="134" rx="8" ry="7.5" fill="#5c3415" stroke="#4a2a10" stroke-width="1"/>
  <ellipse cx="126" cy="132" rx="4" ry="3.5" fill="#8a5528" opacity="0.4"/>
  <ellipse cx="120" cy="138" rx="8.5" ry="8" fill="#724020" stroke="#4a2a10" stroke-width="1"/>
  <ellipse cx="118" cy="136" rx="4.5" ry="4" fill="#9a6538" opacity="0.35"/>
</svg>`;

// Load tree as texture (SVG → Image → Canvas → PIXI.Texture)
let treeSprite = null;
{
  const blob = new Blob([TREE_SVG], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const tc = document.createElement('canvas');
    tc.width = _tree.svgWidth; tc.height = _tree.svgHeight;
    const tctx = tc.getContext('2d');
    tctx.drawImage(img, 0, 0, _tree.svgWidth, _tree.svgHeight);
    const tex = PIXI.Texture.from(tc);
    treeSprite = new PIXI.Sprite(tex);
    treeSprite.x = _tree.positionX;
    treeSprite.y = appHeight - _tree.svgHeight - _tree.baseOffsetFromBottom;
    treeSprite.pivot.set(_tree.svgWidth / 2, _tree.svgHeight);
    treeSprite.x = _tree.positionX + _tree.svgWidth / 2;
    treeSprite.y = appHeight - _tree.baseOffsetFromBottom;
    treeLayer.addChild(treeSprite);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// Tree shadow
const treeShadowGfx = new PIXI.Graphics();
treeShadowGfx.beginFill(0x000000, _tree.shadowAlpha);
treeShadowGfx.drawEllipse(0, 0, _tree.shadowRadiusX, _tree.shadowRadiusY);
treeShadowGfx.endFill();
treeShadowGfx.x = _tree.shadowPositionX;
treeShadowGfx.y = appHeight - _tree.baseOffsetFromBottom;
treeShadowLayer.addChild(treeShadowGfx);

// ======================== GRASS SYSTEM ========================
const grassBackGfx = new PIXI.Graphics();
grassBackGfx.beginFill(_grass.baseColor);
grassBackGfx.drawRect(0, appHeight - _grass.baseHeightFromBottom, appWidth, _grass.baseHeightFromBottom);
grassBackGfx.endFill();
grassBackGfx.beginFill(_grass.innerColor, _grass.innerAlpha);
grassBackGfx.drawRect(0, appHeight - _grass.innerTopOffset, appWidth, _grass.innerHeight);
grassBackGfx.endFill();
grassLayer.addChild(grassBackGfx);

const grassBlades = [];
const grassBladeCount = Math.ceil(appWidth / _grass.bladeSpacingPx);
for (let i = 0; i < grassBladeCount; i++) {
  const blade = new PIXI.Graphics();
  const h = _grass.bladeMinHeight + Math.random() * _grass.bladeHeightRange;
  const w = _grass.bladeWidth;
  const left = i * (appWidth / grassBladeCount) + (Math.random() - 0.5) * _grass.bladeJitterPx;
  const hue = _grass.bladeHueBase + Math.random() * _grass.bladeHueRange;
  const light = _grass.bladeLightnessBase + Math.random() * _grass.bladeLightnessRange;
  const [r, g, b] = hslToRgb(hue / 360, _grass.bladeSaturation, light / 100);
  const color = (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);

  blade.beginFill(color);
  blade.drawRoundedRect(-w/2, -h, w, h, _grass.bladeCornerRadius);
  blade.endFill();

  blade.x = left;
  blade.y = appHeight - _grass.bladeBaseOffsetFromBottom;
  blade.pivot.set(0, 0);
  const skew = (Math.random() - 0.5) * _grass.bladeMaxInitialSkew;
  blade.skew.x = skew;

  grassLayer.addChild(blade);
  grassBlades.push({
    gfx: blade,
    baseSkew: skew,
    phase: Math.random() * Math.PI * 2,
    speed: _grass.bladeSwayMinSpeed + Math.random() * _grass.bladeSwaySpeedRange,
    amplitude: _grass.bladeSwayMinAmplitude + Math.random() * _grass.bladeSwayAmplitudeRange,
  });
}

// ======================== BIRD SYSTEM ========================
const birds = [];

function createBird() {
  const goRight = Math.random() > (1 - _bird.flyRightProbability);
  const startX = goRight ? -_bird.offScreenBufferPx : appWidth + _bird.offScreenBufferPx;
  const startY = _bird.minAltitudePx + Math.random() * (appHeight * _bird.altitudeFraction);
  const duration = _bird.minFlightDurationSec + Math.random() * _bird.flightDurationRangeSec;
  const dy = (Math.random() - 0.5) * _bird.maxVerticalDriftPx * 2;
  const endX = goRight ? appWidth + _bird.destinationBufferPx : -_bird.destinationBufferPx;

  const birdGfx = new PIXI.Graphics();
  birdGfx.lineStyle(_bird.lineWidth, _bird.wingColor);
  birdGfx.moveTo(-_bird.wingSpanPx, 0);
  birdGfx.quadraticCurveTo(-_bird.wingSpanPx / 2.6, -_bird.wingArchHeight, 0, -2);
  birdGfx.moveTo(0, -2);
  birdGfx.quadraticCurveTo(_bird.wingSpanPx / 2.6, -_bird.wingArchHeight, _bird.wingSpanPx, 0);
  birdGfx.lineStyle(0);
  birdGfx.beginFill(_bird.bodyColor);
  birdGfx.drawCircle(0, 1, _bird.bodyRadius);
  birdGfx.endFill();

  if (!goRight) birdGfx.scale.x = -1;

  birdGfx.x = startX;
  birdGfx.y = startY;

  birdLayer.addChild(birdGfx);

  birds.push({
    gfx: birdGfx,
    startX, startY, endX, endY: startY + dy,
    duration: duration * 60,
    elapsed: 0,
    wingPhase: Math.random() * Math.PI * 2,
  });
}

function spawnBird() {
  createBird();
}

// Bird scheduling
let birdTimer = 0;
let nextBirdSpawn = _bird.initialSpawnIntervalMinFrames + Math.random() * _bird.initialSpawnIntervalRandomFrames;
