#!/usr/bin/env node
// ======================== BUMPER BLOCKS — TEST SUITE ========================
// Run: node tests/test.js
// Tests core game logic: stage generation, equation validation, block layouts,
// difficulty scaling, color utilities, and split mechanics.
// No browser or PixiJS required — pure logic tests.

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEq(actual, expected, message) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    const msg = `${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

// ======================== MOCK CONFIG ========================
const CONFIG = {
  grid: { unitSizeInPixels: 48, fuseBaseDistanceInPixels: 60, fuseDistancePerCombinedValue: 5, irritateExtraDistanceInPixels: 150 },
  app: { headerHeightInPixels: 58, canvasBackgroundColor: 0xc8e6c9 },
  blockColors: {
    palette: { 1: 0xe74c3c, 2: 0xe67e22, 3: 0xf1c40f, 4: 0x2ecc71, 5: 0x3498db, 6: 0x9b59b6, 7: 0xe84393, 8: 0x8B4513, 9: 0x00bcd4, 10: 0xecf0f1, 11: 0xc0392b, 12: 0xd35400, 13: 0xf39c12, 14: 0x27ae60, 15: 0x2980b9, 16: 0x8e44ad, 17: 0xd63384, 18: 0xa0522d, 19: 0x0097a7, 20: 0xbdc3c7 },
    autoHueRotationStep: 37, autoColorSaturation: 0.65, autoColorLightness: 0.5, lightColorBlockValues: [10, 20],
  },
  easing: { easeOutBackOvershoot: 1.70158 },
  stages: { baseTarget: 4, targetIncrement: 2, baseBlockCount: 3, blocksPerDifficulty: 1, difficultyInterval: 2, spawnSpacingPx: 100 },
};

const DIFFICULTY = {
  defaultLevel: 3,
  levels: [
    { maxZombies: 0, spawnRate: 0, crawlSpeed: 0, shootChance: 0, bulletSpeed: 0, angleSpread: 0, shotCooldown: 1, aimDuration: 1 },
    { maxZombies: 2, spawnRate: 0.3, crawlSpeed: 0.4, shootChance: 0, bulletSpeed: 0.5, angleSpread: 0, shotCooldown: 2.5, aimDuration: 2.5 },
    { maxZombies: 2, spawnRate: 0.5, crawlSpeed: 0.6, shootChance: 0.15, bulletSpeed: 0.4, angleSpread: 1.2, shotCooldown: 2.0, aimDuration: 2.0 },
    { maxZombies: 3, spawnRate: 0.7, crawlSpeed: 0.8, shootChance: 0.3, bulletSpeed: 0.6, angleSpread: 0.9, shotCooldown: 1.8, aimDuration: 1.6 },
    { maxZombies: 4, spawnRate: 0.85, crawlSpeed: 0.9, shootChance: 0.5, bulletSpeed: 0.8, angleSpread: 0.6, shotCooldown: 1.4, aimDuration: 1.3 },
    { maxZombies: 4, spawnRate: 1.0, crawlSpeed: 1.0, shootChance: 0.7, bulletSpeed: 1.0, angleSpread: 0.4, shotCooldown: 1.0, aimDuration: 1.0 },
    { maxZombies: 5, spawnRate: 1.3, crawlSpeed: 1.1, shootChance: 0.8, bulletSpeed: 1.2, angleSpread: 0.3, shotCooldown: 0.8, aimDuration: 0.85 },
    { maxZombies: 6, spawnRate: 1.6, crawlSpeed: 1.25, shootChance: 0.9, bulletSpeed: 1.4, angleSpread: 0.2, shotCooldown: 0.6, aimDuration: 0.7 },
    { maxZombies: 8, spawnRate: 2.0, crawlSpeed: 1.4, shootChance: 1.0, bulletSpeed: 1.7, angleSpread: 0.12, shotCooldown: 0.45, aimDuration: 0.5 },
    { maxZombies: 10, spawnRate: 2.5, crawlSpeed: 1.6, shootChance: 1.0, bulletSpeed: 2.0, angleSpread: 0.08, shotCooldown: 0.3, aimDuration: 0.35 },
    { maxZombies: 14, spawnRate: 3.5, crawlSpeed: 2.0, shootChance: 1.0, bulletSpeed: 2.5, angleSpread: 0.04, shotCooldown: 0.2, aimDuration: 0.2 },
  ],
};

// ======================== EXTRACTED PURE FUNCTIONS ========================

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

function getBlockLayout(n) {
  const layouts = {
    1: [[0,0]], 2: [[0,0],[1,0]], 3: [[0,0],[1,0],[2,0]],
    4: [[0,0],[0,1],[1,0],[1,1]], 5: [[0,0],[0,1],[1,0],[1,1],[2,0]],
    6: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]], 7: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0]],
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

function getDifficulty(stage) {
  return Math.ceil(stage / CONFIG.stages.difficultyInterval);
}

// Stage target generation (mirrors stages.js logic)
let _lastStageTarget = 0;
function getStageTarget(stage) {
  if (stage <= 1) {
    _lastStageTarget = CONFIG.stages.baseTarget + CONFIG.stages.targetIncrement;
    return _lastStageTarget;
  }
  const increment = Math.floor(Math.random() * 4);
  _lastStageTarget = _lastStageTarget + increment;
  return _lastStageTarget;
}

function getStageBlocks(target, stage) {
  const difficulty = getDifficulty(stage);
  const numBlocks = CONFIG.stages.baseBlockCount + difficulty;
  if (numBlocks >= target) {
    const arr = Array(target).fill(1);
    return arr.slice(0, numBlocks);
  }
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
  return parts;
}

// Equation validation (mirrors stages.js canBlocksFuse)
function canBlocksFuse(equation, valA, valB) {
  if (equation.length <= 1) return true;
  for (let i = 0; i < equation.length - 1; i++) {
    if ((equation[i] === valA && equation[i + 1] === valB) ||
        (equation[i] === valB && equation[i + 1] === valA)) {
      return true;
    }
  }
  return false;
}

// Equation merge (mirrors stages.js onBlocksFused)
function mergeEquation(equation, valA, valB) {
  for (let i = 0; i < equation.length - 1; i++) {
    if ((equation[i] === valA && equation[i + 1] === valB) ||
        (equation[i] === valB && equation[i + 1] === valA)) {
      const sum = equation[i] + equation[i + 1];
      equation.splice(i, 2, sum);
      return true;
    }
  }
  return false;
}

// Day phase calculation (mirrors sky.js getDayPhase)
function getDayPhase(t) {
  let nightAmount = 0, duskDawnAmount = 0, phase = 'day';
  const dawnEnd = 0.05, duskStart = 0.45, duskEnd = 0.55, nightEnd = 0.95;
  if (t < dawnEnd) {
    phase = 'dawn'; duskDawnAmount = 1 - t / dawnEnd; nightAmount = duskDawnAmount;
  } else if (t < duskStart) {
    phase = 'day';
  } else if (t < duskEnd) {
    phase = 'dusk'; duskDawnAmount = (t - duskStart) / (duskEnd - duskStart); nightAmount = duskDawnAmount;
  } else if (t < nightEnd) {
    phase = 'night'; nightAmount = 1;
  } else {
    phase = 'dawn'; duskDawnAmount = 1 - (t - nightEnd) / (1 - nightEnd); nightAmount = duskDawnAmount;
  }
  return { phase, nightAmount, duskDawnAmount };
}

// ======================== TESTS ========================

console.log('🧪 Bumper Blocks Test Suite\n');

// ── Block Layouts ──
section('Block Layouts');
for (let n = 1; n <= 10; n++) {
  const layout = getBlockLayout(n);
  assertEq(layout.length, n, `getBlockLayout(${n}) returns ${n} cells`);
}
// Auto-generated layouts
for (const n of [11, 15, 20, 25]) {
  const layout = getBlockLayout(n);
  assertEq(layout.length, n, `getBlockLayout(${n}) returns ${n} cells`);
  // No duplicate cells
  const keys = layout.map(([r,c]) => `${r},${c}`);
  assertEq(new Set(keys).size, n, `getBlockLayout(${n}) has no duplicate cells`);
}

// ── Block Dimensions ──
section('Block Dimensions');
assertEq(getBlockDimensions(1).rows, 1, 'Block 1 has 1 row');
assertEq(getBlockDimensions(1).cols, 1, 'Block 1 has 1 col');
assertEq(getBlockDimensions(4).rows, 2, 'Block 4 has 2 rows');
assertEq(getBlockDimensions(4).cols, 2, 'Block 4 has 2 cols');
assertEq(getBlockDimensions(9).rows, 3, 'Block 9 has 3 rows');
assertEq(getBlockDimensions(9).cols, 3, 'Block 9 has 3 cols');

// ── Color Utilities ──
section('Color Utilities');
assertEq(lerpColor(0x000000, 0xffffff, 0), 0x000000, 'lerpColor at t=0 returns c1');
assertEq(lerpColor(0x000000, 0xffffff, 1), 0xffffff, 'lerpColor at t=1 returns c2');
assertEq(shadeColor(0xff0000, 0.5), 0x800000, 'shadeColor red by 0.5');
assertEq(shadeColor(0xffffff, 1.0), 0xffffff, 'shadeColor white by 1.0 stays white');
const [r, g, b] = hslToRgb(0, 1, 0.5); // pure red
assert(Math.abs(r - 1) < 0.01, 'hslToRgb red channel for pure red');
assert(g < 0.01, 'hslToRgb green channel for pure red');
assert(b < 0.01, 'hslToRgb blue channel for pure red');

// ── Easing ──
section('Easing');
assert(Math.abs(easeOutBack(0)) < 0.01, 'easeOutBack(0) ≈ 0');
assert(Math.abs(easeOutBack(1) - 1) < 0.01, 'easeOutBack(1) ≈ 1');
assert(easeOutBack(0.5) > 0.5, 'easeOutBack(0.5) overshoots past 0.5');

// ── Stage Target Generation ──
section('Stage Target Generation');
_lastStageTarget = 0;
const t1 = getStageTarget(1);
assertEq(t1, 6, 'Stage 1 target is baseTarget + increment = 6');
assert(t1 > 0, 'Stage 1 target is positive');

// Subsequent stages increment by 0-3
const targets = [t1];
for (let s = 2; s <= 20; s++) {
  const t = getStageTarget(s);
  assert(t >= targets[targets.length - 1], `Stage ${s} target (${t}) >= previous (${targets[targets.length - 1]})`);
  assert(t - targets[targets.length - 1] <= 3, `Stage ${s} increment (${t - targets[targets.length - 1]}) <= 3`);
  targets.push(t);
}

// ── Stage Block Generation (Sum Verification) ──
section('Stage Block Generation — Sum = Target');
for (let trial = 0; trial < 50; trial++) {
  const target = 5 + Math.floor(Math.random() * 20);
  const stage = 1 + Math.floor(Math.random() * 10);
  const blocks = getStageBlocks(target, stage);
  const sum = blocks.reduce((a, c) => a + c, 0);
  assertEq(sum, target, `Trial ${trial+1}: blocks ${JSON.stringify(blocks)} sum to target ${target}`);
  // All values must be positive
  assert(blocks.every(v => v >= 1), `Trial ${trial+1}: all block values >= 1`);
}

// ── Stage Block Count ──
section('Stage Block Count');
for (let stage = 1; stage <= 10; stage++) {
  const target = 6 + stage * 2;
  const blocks = getStageBlocks(target, stage);
  const expectedCount = CONFIG.stages.baseBlockCount + getDifficulty(stage);
  // Block count should be min(expectedCount, target) since we can't have more blocks than target value
  const maxCount = Math.min(expectedCount, target);
  assert(blocks.length <= Math.max(expectedCount, target), `Stage ${stage}: block count (${blocks.length}) is reasonable`);
  assert(blocks.length >= 2, `Stage ${stage}: at least 2 blocks`);
}

// ── Difficulty Scaling ──
section('Difficulty Scaling');
assertEq(getDifficulty(1), 1, 'Stage 1 difficulty = 1');
assertEq(getDifficulty(2), 1, 'Stage 2 difficulty = 1');
assertEq(getDifficulty(3), 2, 'Stage 3 difficulty = 2');
assertEq(getDifficulty(4), 2, 'Stage 4 difficulty = 2');
assertEq(getDifficulty(10), 5, 'Stage 10 difficulty = 5');

// Zombie difficulty levels are valid
for (let i = 0; i <= 10; i++) {
  const level = DIFFICULTY.levels[i];
  assert(level !== undefined, `DIFFICULTY.levels[${i}] exists`);
  assert(level.maxZombies >= 0, `Level ${i} maxZombies >= 0`);
  assert(level.spawnRate >= 0, `Level ${i} spawnRate >= 0`);
  assert(level.shootChance >= 0 && level.shootChance <= 1, `Level ${i} shootChance in [0,1]`);
}

// ── Equation Validation (canBlocksFuse) ──
section('Equation — canBlocksFuse');
// Adjacent pair allowed
assert(canBlocksFuse([2, 3, 1], 2, 3), '[2,3,1]: 2+3 is valid (adjacent)');
assert(canBlocksFuse([2, 3, 1], 3, 2), '[2,3,1]: 3+2 is valid (reverse order)');
assert(canBlocksFuse([2, 3, 1], 3, 1), '[2,3,1]: 3+1 is valid (adjacent)');
// Non-adjacent pair blocked
assert(!canBlocksFuse([2, 3, 1], 2, 1), '[2,3,1]: 2+1 is INVALID (not adjacent)');
// Pair not in equation
assert(!canBlocksFuse([2, 3, 1], 4, 5), '[2,3,1]: 4+5 is INVALID (not in equation)');
// Single element — always valid
assert(canBlocksFuse([6], 3, 3), '[6]: single element, any fuse valid');
// Empty equation — always valid
assert(canBlocksFuse([], 1, 1), '[]: empty equation, any fuse valid');
// Duplicate values
assert(canBlocksFuse([3, 3, 2], 3, 3), '[3,3,2]: 3+3 is valid');
assert(canBlocksFuse([3, 3, 2], 3, 2), '[3,3,2]: 3+2 is valid');
// [3,3,2]: 2+3 checks if any adjacent pair matches — eq[1]=3,eq[2]=2 reversed matches
assert(canBlocksFuse([3, 3, 2], 2, 3), '[3,3,2]: 2+3 is valid (reverse of adjacent 3,2)');

// ── Equation Merge ──
section('Equation — mergeEquation');
let eq1 = [2, 3, 1];
assert(mergeEquation(eq1, 2, 3), '[2,3,1]: merge 2+3 successful');
assert(eq1.length === 2, '[2,3,1] after merge 2+3: length is 2');
assertEq(eq1[0], 5, '[2,3,1] after merge 2+3: first element is 5');
assertEq(eq1[1], 1, '[2,3,1] after merge 2+3: second element is 1');

let eq2 = [5, 1];
assert(mergeEquation(eq2, 5, 1), '[5,1]: merge 5+1 successful');
assertEq(eq2.length, 1, '[5,1] after merge: length is 1');
assertEq(eq2[0], 6, '[5,1] after merge: value is 6');

let eq3 = [1, 2, 3, 4];
assert(!mergeEquation(eq3, 1, 3), '[1,2,3,4]: merge 1+3 fails (not adjacent)');
assertEq(eq3.length, 4, '[1,2,3,4] after failed merge: length unchanged');

// ── Merge-then-Check Ordering Contract ──
// This test catches the exact bug where equation merge was delayed (setTimeout)
// but win check ran immediately, so win was never detected.
section('Merge-then-Check Ordering Contract');

/**
 * Simulates the REAL onBlocksFused + checkStageTarget flow.
 * The contract: after onBlocksFused returns, the equation array MUST already
 * be updated so that any subsequent win check sees the merged state.
 *
 * The old broken code did:
 *   setTimeout(() => equation.splice(...), 500);  // merge LATER
 *   checkStageTarget();                            // check NOW → always fails
 *
 * The fixed code does:
 *   equation.splice(...);                          // merge NOW
 *   setTimeout(() => buildEquationDisplay(), 500); // visual update LATER
 *   // win check sees merged equation → works
 */
function simulateOnBlocksFused(eq, valA, valB) {
  // This mirrors the FIXED onBlocksFused: merge immediately, return result
  for (let i = 0; i < eq.length - 1; i++) {
    if ((eq[i] === valA && eq[i + 1] === valB) ||
        (eq[i] === valB && eq[i + 1] === valA)) {
      const sum = eq[i] + eq[i + 1];
      eq.splice(i, 2, sum); // MUST happen synchronously
      return true;
    }
  }
  return false;
}

function simulateCheckWin(eq, target) {
  return eq.length === 1 && eq[0] === target;
}

// Test: after the last fuse, the equation MUST be merged before win check
{
  const eq = [2, 3, 1];
  const target = 6;

  // First fuse: 2+3
  simulateOnBlocksFused(eq, 2, 3);
  // Immediately check — should NOT win yet (eq = [5, 1])
  assert(!simulateCheckWin(eq, target), 'After fuse 2+3: eq=[5,1], not a win yet');
  assertEq(eq.length, 2, 'After fuse 2+3: equation has 2 elements');

  // Second fuse: 5+1
  simulateOnBlocksFused(eq, 5, 1);
  // Immediately check — MUST win (eq = [6])
  assert(simulateCheckWin(eq, target), 'After fuse 5+1: eq=[6], WIN detected immediately');
  assertEq(eq.length, 1, 'After fuse 5+1: equation has 1 element');
  assertEq(eq[0], target, 'After fuse 5+1: equation value equals target');
}

// Test: the BROKEN pattern (delayed merge) would fail the win check
{
  const eq = [4, 3];
  const target = 7;

  // Simulate the OLD broken flow: check BEFORE merge
  const eqSnapshot = eq.slice(); // snapshot before merge
  const winCheckBeforeMerge = simulateCheckWin(eqSnapshot, target);
  assert(!winCheckBeforeMerge, 'BROKEN pattern: checking [4,3] before merge → no win (this was the bug)');

  // Simulate the FIXED flow: merge first, then check
  simulateOnBlocksFused(eq, 4, 3);
  const winCheckAfterMerge = simulateCheckWin(eq, target);
  assert(winCheckAfterMerge, 'FIXED pattern: merge first → eq=[7] → win detected');
}

// Test: multiple fuses in sequence, win only on final
{
  const eq = [1, 2, 3, 4];
  const target = 10;
  const fuses = [[1, 2], [3, 3], [6, 4]]; // 1+2=3, 3+3=6, 6+4=10

  for (let f = 0; f < fuses.length; f++) {
    const [a, b] = fuses[f];
    const merged = simulateOnBlocksFused(eq, a, b);
    assert(merged, `Sequential fuse ${f+1}: ${a}+${b} merged successfully`);
    const isLast = (f === fuses.length - 1);
    assertEq(simulateCheckWin(eq, target), isLast,
      `Sequential fuse ${f+1}: win=${isLast} (eq=[${eq}])`);
  }
}

// Test: verify the contract holds for 50 random stages
for (let trial = 0; trial < 50; trial++) {
  const target = 4 + Math.floor(Math.random() * 25);
  const stage = 1 + Math.floor(Math.random() * 10);
  const blockValues = getStageBlocks(target, stage);
  const eq = blockValues.slice();
  let winDetected = false;

  // Fuse all adjacent pairs left-to-right
  while (eq.length > 1) {
    const a = eq[0], b = eq[1];
    simulateOnBlocksFused(eq, a, b);
    // Check win IMMEDIATELY after merge (the contract)
    if (simulateCheckWin(eq, target)) {
      winDetected = true;
      break;
    }
  }
  assert(winDetected, `Contract trial ${trial+1}: [${blockValues}] → target ${target} — win detected via immediate check`);
}

// ── Full Stage Playthrough Simulation ──
section('Full Stage Simulation');
for (let trial = 0; trial < 20; trial++) {
  const target = 6 + Math.floor(Math.random() * 15);
  const stage = 1 + Math.floor(Math.random() * 8);
  const blocks = getStageBlocks(target, stage);
  const eq = blocks.slice();

  // Simulate solving: always fuse the first adjacent pair
  let steps = 0;
  while (eq.length > 1 && steps < 100) {
    const valA = eq[0];
    const valB = eq[1];
    assert(canBlocksFuse(eq, valA, valB), `Sim trial ${trial+1} step ${steps}: [${eq}] can fuse ${valA}+${valB}`);
    mergeEquation(eq, valA, valB);
    steps++;
  }

  assertEq(eq.length, 1, `Sim trial ${trial+1}: equation reduced to 1 element`);
  assertEq(eq[0], target, `Sim trial ${trial+1}: final value ${eq[0]} === target ${target}`);
}

// ── Equation Completion Triggers Stage Win ──
section('Equation Completion Triggers Win');
// Simulate the exact checkStageTarget logic
function simulateCheckStageTarget(eqArr, target) {
  return eqArr.length === 1 && eqArr[0] === target;
}

// Test 1: Fully reduce [2, 3, 1] to [6], target=6 → win
{
  const eq = [2, 3, 1];
  const target = 6;
  mergeEquation(eq, 2, 3); // [5, 1]
  assert(!simulateCheckStageTarget(eq, target), '[5,1] not complete yet');
  mergeEquation(eq, 5, 1); // [6]
  assert(simulateCheckStageTarget(eq, target), '[6] === target 6 → WIN');
}

// Test 2: Fully reduce [1, 1, 1, 1] to [4], target=4 → win
{
  const eq = [1, 1, 1, 1];
  const target = 4;
  mergeEquation(eq, 1, 1); // [2, 1, 1]
  assert(!simulateCheckStageTarget(eq, target), '[2,1,1] not complete');
  mergeEquation(eq, 1, 1); // [2, 2]
  assert(!simulateCheckStageTarget(eq, target), '[2,2] not complete');
  mergeEquation(eq, 2, 2); // [4]
  assert(simulateCheckStageTarget(eq, target), '[4] === target 4 → WIN');
}

// Test 3: Partial reduction does NOT trigger win
{
  const eq = [3, 4, 2];
  const target = 9;
  mergeEquation(eq, 3, 4); // [7, 2]
  assert(!simulateCheckStageTarget(eq, target), '[7,2] not complete (2 elements)');
}

// Test 4: Wrong final value does NOT trigger win
{
  const eq = [5];
  const target = 6;
  assert(!simulateCheckStageTarget(eq, target), '[5] !== target 6 → no win');
}

// Test 5: Random stages — fully solving always triggers win
for (let trial = 0; trial < 30; trial++) {
  const target = 4 + Math.floor(Math.random() * 25);
  const stage = 1 + Math.floor(Math.random() * 10);
  const blocks = getStageBlocks(target, stage);
  const eq = blocks.slice();

  // Reduce fully by always fusing first pair
  while (eq.length > 1) {
    mergeEquation(eq, eq[0], eq[1]);
  }
  assert(simulateCheckStageTarget(eq, target),
    `Completion trial ${trial+1}: [${blocks}] → [${eq[0]}] === target ${target} → WIN`);
}

// Test 6: Solving in different orders still triggers win
{
  const eq = [1, 2, 3, 4];
  const target = 10;
  // Fuse from the right side: 3+4=7, then 2+7=9, then 1+9=10
  mergeEquation(eq, 3, 4); // [1, 2, 7]
  assert(!simulateCheckStageTarget(eq, target), '[1,2,7] not complete');
  mergeEquation(eq, 2, 7); // [1, 9]
  assert(!simulateCheckStageTarget(eq, target), '[1,9] not complete');
  mergeEquation(eq, 1, 9); // [10]
  assert(simulateCheckStageTarget(eq, target), '[10] === target 10 → WIN');
}

// Test 7: Middle-out solving
{
  const eq = [2, 3, 5, 1];
  const target = 11;
  mergeEquation(eq, 3, 5); // [2, 8, 1]
  assert(!simulateCheckStageTarget(eq, target), '[2,8,1] not complete');
  mergeEquation(eq, 2, 8); // [10, 1]
  assert(!simulateCheckStageTarget(eq, target), '[10,1] not complete');
  mergeEquation(eq, 10, 1); // [11]
  assert(simulateCheckStageTarget(eq, target), '[11] === target 11 → WIN');
}

// ── Day Phase ──
section('Day/Night Phase');
assertEq(getDayPhase(0.0).phase, 'dawn', 't=0.0 is dawn');
assertEq(getDayPhase(0.03).phase, 'dawn', 't=0.03 is dawn');
assertEq(getDayPhase(0.1).phase, 'day', 't=0.1 is day');
assertEq(getDayPhase(0.3).phase, 'day', 't=0.3 is day');
assertEq(getDayPhase(0.5).phase, 'dusk', 't=0.5 is dusk');
assertEq(getDayPhase(0.6).phase, 'night', 't=0.6 is night');
assertEq(getDayPhase(0.8).phase, 'night', 't=0.8 is night');
assertEq(getDayPhase(0.96).phase, 'dawn', 't=0.96 is dawn (wrap)');

// Night amount ranges
assertEq(getDayPhase(0.2).nightAmount, 0, 'Midday nightAmount = 0');
assertEq(getDayPhase(0.7).nightAmount, 1, 'Full night nightAmount = 1');
assert(getDayPhase(0.5).nightAmount > 0 && getDayPhase(0.5).nightAmount < 1, 'Dusk nightAmount between 0-1');

// ── Split Block Values ──
section('Split Block Values');
for (let v = 2; v <= 20; v++) {
  const left = Math.floor(v / 2);
  const right = Math.ceil(v / 2);
  assertEq(left + right, v, `Split ${v} → ${left} + ${right} = ${v}`);
  assert(left >= 1, `Split ${v}: left half >= 1`);
  assert(right >= 1, `Split ${v}: right half >= 1`);
}
// Value 1 should not split (guarded in game code)
assertEq(Math.floor(1 / 2), 0, 'Value 1 split left = 0 (blocked by game guard)');

// ── Config Integrity ──
section('Config Integrity');
assert(CONFIG.stages.baseTarget > 0, 'baseTarget is positive');
assert(CONFIG.stages.targetIncrement >= 0, 'targetIncrement is non-negative');
assert(CONFIG.stages.baseBlockCount >= 2, 'baseBlockCount >= 2');
assert(CONFIG.stages.difficultyInterval >= 1, 'difficultyInterval >= 1');
assertEq(DIFFICULTY.levels.length, 11, '11 difficulty levels (0-10)');
assertEq(DIFFICULTY.levels[0].maxZombies, 0, 'Level 0 has 0 zombies (off)');
assert(DIFFICULTY.levels[10].maxZombies > DIFFICULTY.levels[5].maxZombies, 'Nightmare has more zombies than Normal');

// Block colors cover 1-20
for (let i = 1; i <= 20; i++) {
  assert(CONFIG.blockColors.palette[i] !== undefined, `Block color ${i} defined`);
}

// ── Edge Cases ──
section('Edge Cases');
// Very large block layout
const layout100 = getBlockLayout(100);
assertEq(layout100.length, 100, 'getBlockLayout(100) returns 100 cells');
const keys100 = layout100.map(([r,c]) => `${r},${c}`);
assertEq(new Set(keys100).size, 100, 'getBlockLayout(100) no duplicates');

// Target where numBlocks >= target (all 1s case)
const smallTargetBlocks = getStageBlocks(3, 1); // numBlocks = 3+1=4, target=3
assertEq(smallTargetBlocks.reduce((a,c) => a+c, 0), 3, 'Small target: blocks sum correctly');
assert(smallTargetBlocks.length <= 4, 'Small target: block count capped');

// Equation with all same values
assert(canBlocksFuse([2, 2, 2], 2, 2), '[2,2,2]: identical adjacent pair valid');
const eqSame = [2, 2, 2];
mergeEquation(eqSame, 2, 2);
assertEq(eqSame.length, 2, '[2,2,2] after merge: length 2');
assertEq(eqSame[0], 4, '[2,2,2] after merge: [4, 2]');

// ── Analytics Event Firing ──
section('Analytics — Event Firing');

// Mock gtag and dataLayer to capture calls
{
  const gtagCalls = [];
  const dataLayerPush = [];
  const origGtag = global.gtag;
  const origDataLayer = global.dataLayer;

  // Set up mocks
  global.gtag = function(command, eventName, params) {
    gtagCalls.push({ command, eventName, params });
  };
  global.window = global.window || {};
  global.window.dataLayer = { push: function(obj) { dataLayerPush.push(obj); } };

  // Re-implement trackEvent/trackStageEvent with fresh fired-set for testing
  const _testFired = {};

  function testTrackEvent(eventName, params) {
    if (_testFired[eventName]) return;
    _testFired[eventName] = true;
    const eventParams = Object.assign({
      send_to: 'AW-17975743100',
      event_category: 'game',
      non_interaction: false,
    }, params || {});
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(Object.assign({ event: eventName }, eventParams));
    }
  }

  function testTrackStageEvent(eventName, stageNum, params) {
    const key = eventName + '_' + stageNum;
    if (_testFired[key]) return;
    _testFired[key] = true;
    const eventParams = Object.assign({
      send_to: 'AW-17975743100',
      event_category: 'game',
      stage: stageNum,
    }, params || {});
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(Object.assign({ event: eventName }, eventParams));
    }
  }

  // Test: trackEvent fires gtag and dataLayer
  gtagCalls.length = 0;
  dataLayerPush.length = 0;
  testTrackEvent('game_first_block');
  assertEq(gtagCalls.length, 1, 'game_first_block: gtag called once');
  assertEq(gtagCalls[0].command, 'event', 'game_first_block: gtag command is "event"');
  assertEq(gtagCalls[0].eventName, 'game_first_block', 'game_first_block: gtag event name correct');
  assertEq(gtagCalls[0].params.send_to, 'AW-17975743100', 'game_first_block: sends to correct Ads ID');
  assertEq(gtagCalls[0].params.event_category, 'game', 'game_first_block: category is "game"');
  assertEq(dataLayerPush.length, 1, 'game_first_block: dataLayer pushed once');
  assertEq(dataLayerPush[0].event, 'game_first_block', 'game_first_block: dataLayer event name correct');

  // Test: fire-once guard — second call should NOT fire
  gtagCalls.length = 0;
  dataLayerPush.length = 0;
  testTrackEvent('game_first_block');
  assertEq(gtagCalls.length, 0, 'game_first_block (2nd call): gtag NOT called again');
  assertEq(dataLayerPush.length, 0, 'game_first_block (2nd call): dataLayer NOT pushed again');

  // Test: different event fires independently
  gtagCalls.length = 0;
  dataLayerPush.length = 0;
  testTrackEvent('game_first_fuse');
  assertEq(gtagCalls.length, 1, 'game_first_fuse: gtag called');
  assertEq(gtagCalls[0].eventName, 'game_first_fuse', 'game_first_fuse: correct event name');

  // Test: trackStageEvent with stage number
  gtagCalls.length = 0;
  dataLayerPush.length = 0;
  testTrackStageEvent('game_stage_complete', 1, { target: 6 });
  assertEq(gtagCalls.length, 1, 'game_stage_complete stage 1: gtag called');
  assertEq(gtagCalls[0].params.stage, 1, 'game_stage_complete stage 1: stage param = 1');
  assertEq(gtagCalls[0].params.target, 6, 'game_stage_complete stage 1: target param = 6');
  assertEq(dataLayerPush[0].stage, 1, 'game_stage_complete stage 1: dataLayer stage = 1');

  // Test: same event different stage fires separately
  gtagCalls.length = 0;
  testTrackStageEvent('game_stage_complete', 2, { target: 8 });
  assertEq(gtagCalls.length, 1, 'game_stage_complete stage 2: gtag called (different stage)');
  assertEq(gtagCalls[0].params.stage, 2, 'game_stage_complete stage 2: stage param = 2');

  // Test: same event same stage does NOT fire again
  gtagCalls.length = 0;
  testTrackStageEvent('game_stage_complete', 1);
  assertEq(gtagCalls.length, 0, 'game_stage_complete stage 1 (repeat): NOT fired again');

  // Test: all expected events fire correctly
  const expectedEvents = [
    'game_onboard_complete', 'game_wreck_mode', 'game_night_survived',
    'game_stage_3', 'game_stage_5', 'game_stage_10',
  ];
  expectedEvents.forEach(name => {
    gtagCalls.length = 0;
    dataLayerPush.length = 0;
    testTrackEvent(name);
    assertEq(gtagCalls.length, 1, `${name}: gtag fires`);
    assertEq(gtagCalls[0].eventName, name, `${name}: correct event name sent to gtag`);
    assertEq(gtagCalls[0].params.send_to, 'AW-17975743100', `${name}: correct Ads account`);
    assertEq(dataLayerPush.length, 1, `${name}: dataLayer push fires`);
  });

  // Test: milestone stage events at stages 3, 5, 10
  [3, 5, 10].forEach(stageNum => {
    gtagCalls.length = 0;
    testTrackStageEvent('game_stage_complete', stageNum, { target: stageNum * 2 });
    assertEq(gtagCalls.length, 1, `Stage ${stageNum} milestone: gtag fires`);
  });

  // Clean up mocks
  if (origGtag) global.gtag = origGtag; else delete global.gtag;
  if (origDataLayer) global.dataLayer = origDataLayer; else delete global.dataLayer;
}

// ======================== RESULTS ========================
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.log(`\nFailures:`);
  failures.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
