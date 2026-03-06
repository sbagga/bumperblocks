// ======================== MOBILE UI ========================
// Touch-optimized UI layer for the mobile version.
// Loaded AFTER all game scripts. Adds floating buttons,
// onboarding, difficulty picker, and touch enhancements.
// Depends on: all game scripts (loaded), mobile-config.js

(function() {
  'use strict';

  // ======================== ONBOARDING ========================
  const onboarding = document.getElementById('onboarding');
  const startBtn = document.getElementById('startBtn');
  const ONBOARDING_KEY = 'bumperblocks_mobile_onboarded';

  // Skip onboarding if user has seen it before
  if (localStorage.getItem(ONBOARDING_KEY)) {
    onboarding.classList.add('hidden');
    setTimeout(() => onboarding.remove(), 600);
  } else {
    startBtn.addEventListener('click', () => {
      onboarding.classList.add('hidden');
      localStorage.setItem(ONBOARDING_KEY, '1');
      // Resume audio context (required by browsers after user gesture)
      if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setTimeout(() => onboarding.remove(), 600);
    });
  }

  // ======================== DIFFICULTY PICKER ========================
  const DIFF_LABELS = (typeof L === 'function') ? L.difficultyLabels() : [
    '0 — Off',
    '1 — Peaceful',
    '2 — Very Easy',
    '3 — Easy',
    '4 — Normal-',
    '5 — Normal',
    '6 — Hard-',
    '7 — Hard',
    '8 — Very Hard',
    '9 — Extreme',
    '10 — Nightmare',
  ];

  const diffModal = document.getElementById('difficultyModal');
  const diffOptions = document.getElementById('difficultyOptions');
  const diffBtn = document.getElementById('difficultyBtn');

  // Build difficulty options
  DIFF_LABELS.forEach((label, i) => {
    const opt = document.createElement('div');
    opt.className = 'diff-option' + (i === (DIFFICULTY.defaultLevel || 2) ? ' selected' : '');
    opt.innerHTML = `<span class="diff-num">${i}</span><span>${label.split(' — ')[1] || label}</span>`;
    opt.addEventListener('click', () => {
      selectDifficulty(i);
    });
    diffOptions.appendChild(opt);
  });

  function selectDifficulty(level) {
    // Update UI
    diffOptions.querySelectorAll('.diff-option').forEach((el, i) => {
      el.classList.toggle('selected', i === level);
    });
    diffBtn.textContent = level === 0 ? '🧟' : `${level}`;

    // Update game
    if (typeof setZombieDifficulty === 'function') {
      setZombieDifficulty(level);
    }
    // Update hidden select for compatibility
    const sel = document.getElementById('difficultySelect');
    if (sel) sel.value = level;

    closeDifficultyPicker();
  }

  window.openDifficultyPicker = function() {
    diffModal.classList.add('open');
  };

  function closeDifficultyPicker() {
    diffModal.classList.remove('open');
  }

  // Tap outside modal to close
  diffModal.addEventListener('click', (e) => {
    if (e.target === diffModal) closeDifficultyPicker();
  });

  // ======================== FAB TOOLBAR VISIBILITY ========================
  const fabToolbar = document.getElementById('fabToolbar');
  let fabHideTimer = null;
  let toolbarVisible = true;

  function showToolbar() {
    if (fabHideTimer) { clearTimeout(fabHideTimer); fabHideTimer = null; }
    fabToolbar.classList.remove('hidden');
    toolbarVisible = true;
  }

  function autoHideToolbar() {
    if (fabHideTimer) clearTimeout(fabHideTimer);
    fabHideTimer = setTimeout(() => {
      // Don't hide during wreck mode
      if (typeof wreckMode !== 'undefined' && wreckMode) return;
      fabToolbar.classList.add('hidden');
      toolbarVisible = false;
    }, 6000);
  }

  // Show toolbar on tap anywhere (if hidden)
  document.addEventListener('touchstart', (e) => {
    if (!toolbarVisible) {
      // Only show if not tapping game elements
      const tag = e.target.tagName;
      if (tag !== 'BUTTON') {
        showToolbar();
        autoHideToolbar();
      }
    }
  }, { passive: true });

  // Auto-hide after initial display
  autoHideToolbar();

  // ======================== HUD HINTS ========================
  const hudHint = document.getElementById('hudHint');
  const hints = (typeof L === 'function')
    ? [L('mobileHint1'), L('mobileHint2'), L('mobileHint3'), L('mobileHint4')]
    : ['Drag to fuse', 'Double-tap to split', 'Reach the target!', 'Drop near to merge'];
  let hintIndex = 0;

  setInterval(() => {
    hintIndex = (hintIndex + 1) % hints.length;
    hudHint.style.opacity = '0';
    setTimeout(() => {
      hudHint.textContent = hints[hintIndex];
      hudHint.style.opacity = '1';
    }, 300);
  }, 5000);
  hudHint.style.transition = 'opacity 0.3s';

  // ======================== AUDIO CONTEXT UNLOCK ========================
  // Mobile browsers require user gesture to unlock audio
  function unlockAudio() {
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('touchend', unlockAudio);
  }
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('touchend', unlockAudio, { once: true });

  // ======================== VIEWPORT FIX ========================
  // Prevent iOS Safari bounce and address bar resize issues
  function fixViewport() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  fixViewport();
  window.addEventListener('resize', fixViewport);

  // Prevent double-tap zoom
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  });

  // Prevent pull-to-refresh
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // ======================== ORIENTATION HANDLING ========================
  let lastOrientation = screen.orientation?.type || '';

  function handleOrientationChange() {
    const currentOrientation = screen.orientation?.type || '';
    if (currentOrientation !== lastOrientation) {
      lastOrientation = currentOrientation;
      // The game uses window dimensions at load time, so we need a full reload
      // for now. A future enhancement could resize the PIXI app dynamically.
      setTimeout(() => {
        location.reload();
      }, 200);
    }
  }

  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOrientationChange);
  } else {
    window.addEventListener('orientationchange', handleOrientationChange);
  }

  // ======================== PERFORMANCE HINTS ========================
  // Reduce grass density on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    // Already loaded, can't change grass count, but log for awareness
    console.log('[Mobile] Low-end device detected');
  }

  // ======================== WRECK MODE MOBILE ENHANCEMENTS ========================
  // Override toggleWreckMode to also update mobile FAB styling
  const _originalToggleWreckMode = window.toggleWreckMode;
  window.toggleWreckMode = function() {
    _originalToggleWreckMode();
    const btn = document.getElementById('wreckModeBtn');
    const isActive = btn.classList.contains('active');
    // Show toolbar persistently during wreck mode
    if (isActive) {
      showToolbar();
    } else {
      autoHideToolbar();
    }
  };

  // ======================== NIGHT MODE MOBILE ENHANCEMENTS ========================
  const _originalToggleNightMode = window.toggleNightMode;
  window.toggleNightMode = function() {
    _originalToggleNightMode();
    const btn = document.getElementById('nightModeBtn');
    const isActive = typeof forceNightMode !== 'undefined' && forceNightMode;
    btn.classList.toggle('active', isActive);
  };

  // ======================== SAFE AREA BOTTOM OFFSET ========================
  // Ensure wreck button doesn't overlap with FAB toolbar
  const _origPlacePin = (typeof placePin !== 'undefined') ? placePin : null;
  if (_origPlacePin) {
    // The wreck button positioning is handled by wrecking.js, which uses
    // fixed pixel positions. The button has position:fixed in mobile CSS,
    // so it stays on-screen. We update its position to avoid the toolbar.
    const observer = new MutationObserver(() => {
      const wb = document.getElementById('wreckBtn');
      if (wb && wb.style.display === 'block') {
        const top = parseInt(wb.style.top);
        const windowH = window.innerHeight;
        // If button would overlap toolbar, move it up
        if (top > windowH - 120) {
          wb.style.top = (windowH - 130) + 'px';
        }
      }
    });
    const wb = document.getElementById('wreckBtn');
    if (wb) {
      observer.observe(wb, { attributes: true, attributeFilter: ['style'] });
    }
  }

  // ======================== INITIALIZATION COMPLETE ========================
  console.log('[Mobile] UI initialized');

})();
