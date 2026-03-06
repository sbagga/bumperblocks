// ======================== LOCALIZATION MODULE ========================
// Auto-detects browser language and provides translated strings.
// Loaded FIRST, before config.js. All other scripts use L() to get strings.
//
// Usage:
//   L('key')                     → translated string
//   L('stageComplete', {n: 3})   → "Stage 3 Complete!" (with interpolation)
//   L.lang                       → current language code (e.g. 'es')
//   L.setLang('fr')              → switch language at runtime
//
// Adding a new language:
//   Add a new object to L._translations with the ISO 639-1 code as key.
//   Any missing keys fall back to English.

(function() {
  'use strict';

  // ── Translation dictionaries ──
  const translations = {

    // ── English (default / fallback) ──
    en: {
      // App
      appName:              'Bumper Blocks',
      appNameMobile:        'Bumper Blocks — Mobile',

      // Stage
      stage:                'Stage {n}',
      target:               'Target: {n}',
      stageComplete:        'Stage {n} Complete!',
      targetReached:        'Target {n} reached! 🎉',

      // Onboarding
      onboardGoal:          'Fuse blocks to reach the <b>target number</b>',
      onboardDrag:          'Drag blocks near each other to fuse them',
      onboardSplit:         'Double-click a block to split it in half',
      onboardStages:        'Each stage, the target gets bigger!',
      onboardSplitMobile:   'Double-tap a block to split it',
      onboardFuseMobile:    'Drop near another to fuse',
      onboardDragMobile:    'Drag blocks to move them',
      onboardTargetMobile:  'Fuse blocks to reach the target!',
      letsPlay:             "LET'S PLAY!",

      // Header hints
      hintDrag:             '✋ Drag to move',
      hintFuse:             '🔗 Drop near to fuse',
      hintSplit:            '👆👆 Double-click to split',

      // Mobile HUD hints
      mobileHint1:          'Drag to fuse',
      mobileHint2:          'Double-tap to split',
      mobileHint3:          'Reach the target!',
      mobileHint4:          'Drop near to merge',

      // Buttons
      wreckingBall:         '🏗️ Wrecking Ball',
      nightMode:            '🌙 Night Mode',
      restart:              '🔄 Restart',
      wreck:                '💥 WRECK!',

      // Difficulty
      difficultyLabel:      '🧟 Difficulty:',
      difficultyTitle:      '🧟 Zombie Difficulty',
      diff0:                'Off',
      diff1:                'Peaceful',
      diff2:                'Very Easy',
      diff3:                'Easy',
      diff4:                'Normal-',
      diff5:                'Normal',
      diff6:                'Hard-',
      diff7:                'Hard',
      diff8:                'Very Hard',
      diff9:                'Extreme',
      diff10:               'Nightmare',
    },

    // ── Spanish ──
    es: {
      appName:              'Bloques Bumper',
      appNameMobile:        'Bloques Bumper — Móvil',
      stage:                'Etapa {n}',
      target:               'Objetivo: {n}',
      stageComplete:        '¡Etapa {n} Completa!',
      targetReached:        '¡Objetivo {n} alcanzado! 🎉',
      onboardGoal:          'Fusiona bloques para alcanzar el <b>número objetivo</b>',
      onboardDrag:          'Arrastra bloques cerca uno del otro para fusionarlos',
      onboardSplit:         'Haz doble clic en un bloque para dividirlo',
      onboardStages:        '¡En cada etapa, el objetivo crece!',
      onboardSplitMobile:   'Toca dos veces un bloque para dividirlo',
      onboardFuseMobile:    'Suelta cerca de otro para fusionar',
      onboardDragMobile:    'Arrastra los bloques para moverlos',
      onboardTargetMobile:  '¡Fusiona bloques para alcanzar el objetivo!',
      letsPlay:             '¡A JUGAR!',
      hintDrag:             '✋ Arrastra para mover',
      hintFuse:             '🔗 Suelta cerca para fusionar',
      hintSplit:            '👆👆 Doble clic para dividir',
      mobileHint1:          'Arrastra para fusionar',
      mobileHint2:          'Toca dos veces para dividir',
      mobileHint3:          '¡Alcanza el objetivo!',
      mobileHint4:          'Suelta cerca para unir',
      wreckingBall:         '🏗️ Bola de demolición',
      nightMode:            '🌙 Modo nocturno',
      restart:              '🔄 Reiniciar',
      wreck:                '💥 ¡DEMOLER!',
      difficultyLabel:      '🧟 Dificultad:',
      difficultyTitle:      '🧟 Dificultad Zombi',
      diff0:                'Apagado',
      diff1:                'Pacífico',
      diff2:                'Muy fácil',
      diff3:                'Fácil',
      diff4:                'Normal-',
      diff5:                'Normal',
      diff6:                'Difícil-',
      diff7:                'Difícil',
      diff8:                'Muy difícil',
      diff9:                'Extremo',
      diff10:               'Pesadilla',
    },

    // ── French ──
    fr: {
      appName:              'Blocs Bumper',
      appNameMobile:        'Blocs Bumper — Mobile',
      stage:                'Étape {n}',
      target:               'Cible : {n}',
      stageComplete:        'Étape {n} Terminée !',
      targetReached:        'Cible {n} atteinte ! 🎉',
      onboardGoal:          'Fusionnez des blocs pour atteindre le <b>nombre cible</b>',
      onboardDrag:          'Glissez les blocs près les uns des autres pour les fusionner',
      onboardSplit:         'Double-cliquez sur un bloc pour le diviser',
      onboardStages:        'À chaque étape, la cible augmente !',
      onboardSplitMobile:   'Appuyez deux fois sur un bloc pour le diviser',
      onboardFuseMobile:    'Déposez près d\'un autre pour fusionner',
      onboardDragMobile:    'Glissez les blocs pour les déplacer',
      onboardTargetMobile:  'Fusionnez les blocs pour atteindre la cible !',
      letsPlay:             'C\'EST PARTI !',
      hintDrag:             '✋ Glisser pour déplacer',
      hintFuse:             '🔗 Déposer près pour fusionner',
      hintSplit:            '👆👆 Double-clic pour diviser',
      mobileHint1:          'Glissez pour fusionner',
      mobileHint2:          'Appuyez 2× pour diviser',
      mobileHint3:          'Atteignez la cible !',
      mobileHint4:          'Déposez près pour unir',
      wreckingBall:         '🏗️ Boulet de démolition',
      nightMode:            '🌙 Mode nuit',
      restart:              '🔄 Recommencer',
      wreck:                '💥 DÉMOLIR !',
      difficultyLabel:      '🧟 Difficulté :',
      difficultyTitle:      '🧟 Difficulté Zombie',
      diff0:                'Désactivé',
      diff1:                'Paisible',
      diff2:                'Très facile',
      diff3:                'Facile',
      diff4:                'Normal-',
      diff5:                'Normal',
      diff6:                'Difficile-',
      diff7:                'Difficile',
      diff8:                'Très difficile',
      diff9:                'Extrême',
      diff10:               'Cauchemar',
    },

    // ── Hindi ──
    hi: {
      appName:              'बम्पर ब्लॉक्स',
      appNameMobile:        'बम्पर ब्लॉक्स — मोबाइल',
      stage:                'चरण {n}',
      target:               'लक्ष्य: {n}',
      stageComplete:        'चरण {n} पूरा!',
      targetReached:        'लक्ष्य {n} पहुँचा! 🎉',
      onboardGoal:          '<b>लक्ष्य संख्या</b> तक पहुँचने के लिए ब्लॉक जोड़ें',
      onboardDrag:          'ब्लॉक को एक दूसरे के पास खींचकर जोड़ें',
      onboardSplit:         'ब्लॉक को आधा करने के लिए डबल-क्लिक करें',
      onboardStages:        'हर चरण में लक्ष्य बढ़ता है!',
      onboardSplitMobile:   'ब्लॉक को विभाजित करने के लिए डबल-टैप करें',
      onboardFuseMobile:    'जोड़ने के लिए पास छोड़ें',
      onboardDragMobile:    'ब्लॉक को खींचकर ले जाएं',
      onboardTargetMobile:  'लक्ष्य तक पहुँचने के लिए ब्लॉक जोड़ें!',
      letsPlay:             'खेलो!',
      hintDrag:             '✋ खींचें',
      hintFuse:             '🔗 पास छोड़ें',
      hintSplit:            '👆👆 डबल-क्लिक',
      mobileHint1:          'जोड़ने के लिए खींचें',
      mobileHint2:          'विभाजित करने के लिए डबल-टैप',
      mobileHint3:          'लक्ष्य पूरा करें!',
      mobileHint4:          'जोड़ने के लिए पास छोड़ें',
      wreckingBall:         '🏗️ तोड़ने वाली गेंद',
      nightMode:            '🌙 रात मोड',
      restart:              '🔄 पुनः आरंभ',
      wreck:                '💥 तोड़ो!',
      difficultyLabel:      '🧟 कठिनाई:',
      difficultyTitle:      '🧟 ज़ॉम्बी कठिनाई',
      diff0:                'बंद',
      diff1:                'शांत',
      diff2:                'बहुत आसान',
      diff3:                'आसान',
      diff4:                'सामान्य-',
      diff5:                'सामान्य',
      diff6:                'कठिन-',
      diff7:                'कठिन',
      diff8:                'बहुत कठिन',
      diff9:                'चरम',
      diff10:               'दुःस्वप्न',
    },

    // ── Portuguese ──
    pt: {
      appName:              'Blocos Bumper',
      appNameMobile:        'Blocos Bumper — Móvel',
      stage:                'Fase {n}',
      target:               'Alvo: {n}',
      stageComplete:        'Fase {n} Concluída!',
      targetReached:        'Alvo {n} alcançado! 🎉',
      onboardGoal:          'Funda blocos para atingir o <b>número alvo</b>',
      onboardDrag:          'Arraste blocos para perto uns dos outros para fundir',
      onboardSplit:         'Clique duas vezes para dividir um bloco',
      onboardStages:        'A cada fase, o alvo aumenta!',
      onboardSplitMobile:   'Toque duas vezes para dividir',
      onboardFuseMobile:    'Solte perto de outro para fundir',
      onboardDragMobile:    'Arraste os blocos para movê-los',
      onboardTargetMobile:  'Funda blocos para atingir o alvo!',
      letsPlay:             'VAMOS JOGAR!',
      hintDrag:             '✋ Arraste para mover',
      hintFuse:             '🔗 Solte perto para fundir',
      hintSplit:            '👆👆 Duplo clique para dividir',
      mobileHint1:          'Arraste para fundir',
      mobileHint2:          'Toque 2× para dividir',
      mobileHint3:          'Atinja o alvo!',
      mobileHint4:          'Solte perto para unir',
      wreckingBall:         '🏗️ Bola de demolição',
      nightMode:            '🌙 Modo noturno',
      restart:              '🔄 Reiniciar',
      wreck:                '💥 DEMOLIR!',
      difficultyLabel:      '🧟 Dificuldade:',
      difficultyTitle:      '🧟 Dificuldade Zumbi',
      diff0:                'Desligado',
      diff1:                'Pacífico',
      diff2:                'Muito fácil',
      diff3:                'Fácil',
      diff4:                'Normal-',
      diff5:                'Normal',
      diff6:                'Difícil-',
      diff7:                'Difícil',
      diff8:                'Muito difícil',
      diff9:                'Extremo',
      diff10:               'Pesadelo',
    },

    // ── German ──
    de: {
      appName:              'Bumper Blöcke',
      appNameMobile:        'Bumper Blöcke — Mobil',
      stage:                'Stufe {n}',
      target:               'Ziel: {n}',
      stageComplete:        'Stufe {n} Geschafft!',
      targetReached:        'Ziel {n} erreicht! 🎉',
      onboardGoal:          'Verschmelze Blöcke, um die <b>Zielzahl</b> zu erreichen',
      onboardDrag:          'Ziehe Blöcke nahe zueinander, um sie zu verschmelzen',
      onboardSplit:         'Doppelklicke auf einen Block, um ihn zu teilen',
      onboardStages:        'Mit jeder Stufe wird das Ziel größer!',
      onboardSplitMobile:   'Doppeltippe einen Block zum Teilen',
      onboardFuseMobile:    'In der Nähe ablegen zum Verschmelzen',
      onboardDragMobile:    'Ziehe Blöcke um sie zu bewegen',
      onboardTargetMobile:  'Verschmelze Blöcke um das Ziel zu erreichen!',
      letsPlay:             'LOS GEHT\'S!',
      hintDrag:             '✋ Ziehen zum Bewegen',
      hintFuse:             '🔗 Ablegen zum Verschmelzen',
      hintSplit:            '👆👆 Doppelklick zum Teilen',
      mobileHint1:          'Ziehen zum Verschmelzen',
      mobileHint2:          'Doppeltippen zum Teilen',
      mobileHint3:          'Erreiche das Ziel!',
      mobileHint4:          'Nah ablegen zum Verbinden',
      wreckingBall:         '🏗️ Abrissbirne',
      nightMode:            '🌙 Nachtmodus',
      restart:              '🔄 Neustart',
      wreck:                '💥 ABRISS!',
      difficultyLabel:      '🧟 Schwierigkeit:',
      difficultyTitle:      '🧟 Zombie-Schwierigkeit',
      diff0:                'Aus',
      diff1:                'Friedlich',
      diff2:                'Sehr leicht',
      diff3:                'Leicht',
      diff4:                'Normal-',
      diff5:                'Normal',
      diff6:                'Schwer-',
      diff7:                'Schwer',
      diff8:                'Sehr schwer',
      diff9:                'Extrem',
      diff10:               'Albtraum',
    },

    // ── Japanese ──
    ja: {
      appName:              'バンパーブロック',
      appNameMobile:        'バンパーブロック — モバイル',
      stage:                'ステージ {n}',
      target:               '目標: {n}',
      stageComplete:        'ステージ {n} クリア！',
      targetReached:        '目標 {n} 達成！ 🎉',
      onboardGoal:          'ブロックを合体させて<b>目標の数</b>を作ろう',
      onboardDrag:          'ブロックを近くにドラッグして合体',
      onboardSplit:         'ダブルクリックでブロックを分割',
      onboardStages:        'ステージごとに目標が大きくなる！',
      onboardSplitMobile:   'ダブルタップでブロックを分割',
      onboardFuseMobile:    '近くに置いて合体',
      onboardDragMobile:    'ドラッグでブロックを動かす',
      onboardTargetMobile:  'ブロックを合体させて目標を達成！',
      letsPlay:             'スタート！',
      hintDrag:             '✋ ドラッグで移動',
      hintFuse:             '🔗 近くで合体',
      hintSplit:            '👆👆 ダブルクリックで分割',
      mobileHint1:          'ドラッグで合体',
      mobileHint2:          'ダブルタップで分割',
      mobileHint3:          '目標を達成しよう！',
      mobileHint4:          '近くに置いて合体',
      wreckingBall:         '🏗️ 鉄球',
      nightMode:            '🌙 ナイトモード',
      restart:              '🔄 リスタート',
      wreck:                '💥 破壊！',
      difficultyLabel:      '🧟 難易度：',
      difficultyTitle:      '🧟 ゾンビ難易度',
      diff0:                'オフ',
      diff1:                '平和',
      diff2:                'とても簡単',
      diff3:                '簡単',
      diff4:                '普通-',
      diff5:                '普通',
      diff6:                '難しい-',
      diff7:                '難しい',
      diff8:                'とても難しい',
      diff9:                '極限',
      diff10:               '悪夢',
    },

    // ── Chinese (Simplified) ──
    zh: {
      appName:              '碰碰方块',
      appNameMobile:        '碰碰方块 — 手机版',
      stage:                '第 {n} 关',
      target:               '目标：{n}',
      stageComplete:        '第 {n} 关完成！',
      targetReached:        '目标 {n} 达成！🎉',
      onboardGoal:          '合并方块以达到<b>目标数字</b>',
      onboardDrag:          '将方块拖到一起进行合并',
      onboardSplit:         '双击方块将其拆分',
      onboardStages:        '每一关目标都会变大！',
      onboardSplitMobile:   '双击方块进行拆分',
      onboardFuseMobile:    '放在旁边进行合并',
      onboardDragMobile:    '拖动方块移动它们',
      onboardTargetMobile:  '合并方块达到目标！',
      letsPlay:             '开始游戏！',
      hintDrag:             '✋ 拖动移动',
      hintFuse:             '🔗 靠近合并',
      hintSplit:            '👆👆 双击拆分',
      mobileHint1:          '拖动合并',
      mobileHint2:          '双击拆分',
      mobileHint3:          '达到目标！',
      mobileHint4:          '放在旁边合并',
      wreckingBall:         '🏗️ 破坏球',
      nightMode:            '🌙 夜间模式',
      restart:              '🔄 重新开始',
      wreck:                '💥 破坏！',
      difficultyLabel:      '🧟 难度：',
      difficultyTitle:      '🧟 僵尸难度',
      diff0:                '关闭',
      diff1:                '和平',
      diff2:                '非常简单',
      diff3:                '简单',
      diff4:                '普通-',
      diff5:                '普通',
      diff6:                '困难-',
      diff7:                '困难',
      diff8:                '非常困难',
      diff9:                '极限',
      diff10:               '噩梦',
    },

    // ── Korean ──
    ko: {
      appName:              '범퍼 블록',
      appNameMobile:        '범퍼 블록 — 모바일',
      stage:                '스테이지 {n}',
      target:               '목표: {n}',
      stageComplete:        '스테이지 {n} 완료!',
      targetReached:        '목표 {n} 달성! 🎉',
      onboardGoal:          '블록을 합쳐서 <b>목표 숫자</b>를 만드세요',
      onboardDrag:          '블록을 가까이 드래그하여 합치세요',
      onboardSplit:         '더블클릭으로 블록을 나누세요',
      onboardStages:        '매 스테이지마다 목표가 커집니다!',
      onboardSplitMobile:   '더블탭으로 블록 나누기',
      onboardFuseMobile:    '가까이 놓아서 합치기',
      onboardDragMobile:    '드래그로 블록 이동',
      onboardTargetMobile:  '블록을 합쳐서 목표 달성!',
      letsPlay:             '시작!',
      hintDrag:             '✋ 드래그',
      hintFuse:             '🔗 가까이 합치기',
      hintSplit:            '👆👆 더블클릭 나누기',
      mobileHint1:          '드래그로 합치기',
      mobileHint2:          '더블탭으로 나누기',
      mobileHint3:          '목표를 달성하세요!',
      mobileHint4:          '가까이 놓아 합치기',
      wreckingBall:         '🏗️ 철거공',
      nightMode:            '🌙 야간 모드',
      restart:              '🔄 재시작',
      wreck:                '💥 파괴!',
      difficultyLabel:      '🧟 난이도:',
      difficultyTitle:      '🧟 좀비 난이도',
      diff0:                '끔',
      diff1:                '평화',
      diff2:                '매우 쉬움',
      diff3:                '쉬움',
      diff4:                '보통-',
      diff5:                '보통',
      diff6:                '어려움-',
      diff7:                '어려움',
      diff8:                '매우 어려움',
      diff9:                '극한',
      diff10:               '악몽',
    },
  };

  // ── Language detection ──
  function detectLanguage() {
    // 1. Check URL parameter: ?lang=es
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && translations[urlLang]) return urlLang;

    // 2. Check localStorage override
    const stored = localStorage.getItem('bumperblocks_lang');
    if (stored && translations[stored]) return stored;

    // 3. Browser language
    const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0].toLowerCase();
    if (translations[browserLang]) return browserLang;

    return 'en';
  }

  let currentLang = detectLanguage();

  // ── Main lookup function ──
  function L(key, params) {
    const dict = translations[currentLang] || translations.en;
    let str = dict[key] || translations.en[key] || key;
    if (params) {
      Object.keys(params).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  // ── Public API ──
  L.lang = currentLang;
  L._translations = translations;
  L.availableLanguages = Object.keys(translations);

  L.setLang = function(code) {
    if (!translations[code]) {
      console.warn('[L10n] Unknown language:', code);
      return;
    }
    currentLang = code;
    L.lang = code;
    localStorage.setItem('bumperblocks_lang', code);
    // Re-apply DOM translations
    L.applyDOM();
    console.log('[L10n] Language set to:', code);
  };

  // ── Apply translations to DOM elements with data-l10n attributes ──
  L.applyDOM = function() {
    document.querySelectorAll('[data-l10n]').forEach(function(el) {
      var key = el.getAttribute('data-l10n');
      var str = L(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = str;
      } else if (el.tagName === 'OPTION') {
        el.textContent = str;
      } else {
        el.innerHTML = str;
      }
    });
    // Update page title
    document.title = L('appName');
  };

  // ── Difficulty label helpers ──
  L.difficultyLabels = function() {
    var labels = [];
    for (var i = 0; i <= 10; i++) {
      labels.push(i + ' – ' + L('diff' + i));
    }
    return labels;
  };

  // Expose globally
  window.L = L;

  // Auto-apply on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { L.applyDOM(); });
  } else {
    // DOM already loaded (shouldn't happen since this loads first, but just in case)
    L.applyDOM();
  }

  console.log('[L10n] Initialized — language:', currentLang, '(' + (translations[currentLang] === translations.en ? 'default' : 'translated') + ')');
})();
