// ======================== CONSTANTS ========================
// Pure data and utility functions. Reads from CONFIG (js/config.js).
// See: docs/SYSTEMS.md for block layout & color details.

const UNIT = CONFIG.grid.unitSizeInPixels;
const FUSE_DISTANCE = CONFIG.grid.fuseBaseDistanceInPixels;
const IRRITATE_DISTANCE = CONFIG.grid.irritateExtraDistanceInPixels;
const HEADER_HEIGHT = CONFIG.app.headerHeightInPixels;

// ======================== COLORS ========================
const BLOCK_COLORS = CONFIG.blockColors.palette;

function getBlockColor(n) {
  if (n <= 20) return BLOCK_COLORS[n];
  const hue = (n * CONFIG.blockColors.autoHueRotationStep) % 360;
  return PIXI.utils.rgb2hex(hslToRgb(hue / 360, CONFIG.blockColors.autoColorSaturation, CONFIG.blockColors.autoColorLightness));
}

// ======================== LAYOUTS ========================
// Hand-crafted layouts for 1-10; auto-grid for larger values.
function getBlockLayout(n) {
  const layouts = {
    1: [[0,0]],
    2: [[0,0],[1,0]],
    3: [[0,0],[1,0],[2,0]],
    4: [[0,0],[0,1],[1,0],[1,1]],
    5: [[0,0],[0,1],[1,0],[1,1],[2,0]],
    6: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    7: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0]],
    8: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1]],
    9: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    10: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,1]],
  };
  if (layouts[n]) return layouts[n];
  const cols = Math.ceil(Math.sqrt(n));
  const result = [];
  let count = 0, row = 0;
  while (count < n) {
    for (let col = 0; col < cols && count < n; col++) {
      result.push([row, col]);
      count++;
    }
    row++;
  }
  return result;
}

function getBlockDimensions(n) {
  const layout = getBlockLayout(n);
  let maxRow = 0, maxCol = 0;
  layout.forEach(([r, c]) => { maxRow = Math.max(maxRow, r); maxCol = Math.max(maxCol, c); });
  return { rows: maxRow + 1, cols: maxCol + 1 };
}

// ======================== UTILITY FUNCTIONS ========================

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r, g, b];
}

function lerpColor(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

function shadeColor(color, factor) {
  let r = (color >> 16) & 0xff;
  let g = (color >> 8) & 0xff;
  let b = color & 0xff;
  r = Math.round(Math.min(255, r * factor));
  g = Math.round(Math.min(255, g * factor));
  b = Math.round(Math.min(255, b * factor));
  return (r << 16) | (g << 8) | b;
}

function easeOutBack(t) {
  const c1 = CONFIG.easing.easeOutBackOvershoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
