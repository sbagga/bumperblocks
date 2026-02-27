// ======================== SOUND SYSTEM (Web Audio API) ========================
// All procedural — no audio files loaded. All parameters from CONFIG.sound.
// Depends on: config.js
// See: docs/SYSTEMS.md § Sound System for the full table.

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBubbleBurst() {
  const cfg = CONFIG.sound.bubbleBurst;
  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * cfg.noiseDuration;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(cfg.bandpassStartFreq, now);
  bandpass.frequency.exponentialRampToValueAtTime(cfg.bandpassEndFreq, now + cfg.bandpassSweepTime);
  bandpass.Q.value = cfg.bandpassQ;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(cfg.noiseGainStart, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.noiseDecayTime);
  noise.connect(bandpass).connect(noiseGain).connect(audioCtx.destination);
  noise.start(now); noise.stop(now + cfg.noiseDuration);

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(cfg.oscStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.oscEndFreq, now + cfg.oscSweepTime);
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(cfg.oscGainStart, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.oscDecayTime);
  osc.connect(oscGain).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.oscDecayTime);

  const ping = audioCtx.createOscillator();
  ping.type = 'sine';
  ping.frequency.setValueAtTime(cfg.pingStartFreq, now + cfg.pingDelay);
  ping.frequency.exponentialRampToValueAtTime(cfg.pingEndFreq, now + cfg.pingDelay + cfg.pingSweepTime);
  const pingGain = audioCtx.createGain();
  pingGain.gain.setValueAtTime(cfg.pingGainStart, now + cfg.pingDelay);
  pingGain.gain.exponentialRampToValueAtTime(0.001, now + cfg.pingDelay + cfg.pingDecayTime);
  ping.connect(pingGain).connect(audioCtx.destination);
  ping.start(now + cfg.pingDelay); ping.stop(now + cfg.pingDelay + cfg.pingDecayTime);
}

function playSpawnPop() {
  const cfg = CONFIG.sound.spawnPop;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(cfg.oscStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.oscEndFreq, now + cfg.sweepTime);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(cfg.gainStart, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.decayTime);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.decayTime);
}

function playDeletePoof() {
  const cfg = CONFIG.sound.deletePoof;
  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * cfg.noiseDuration;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = cfg.highpassFreq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(cfg.gainStart, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.decayTime);
  noise.connect(hp).connect(gain).connect(audioCtx.destination);
  noise.start(now); noise.stop(now + cfg.noiseDuration);
}

function playPuckSound() {
  const cfg = CONFIG.sound.puck;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(cfg.oscStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.oscEndFreq, now + cfg.sweepTime);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(cfg.gainStart, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + cfg.decayTime);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.decayTime);
  const click = audioCtx.createOscillator();
  click.type = 'square';
  click.frequency.setValueAtTime(cfg.clickFreq, now);
  const cg = audioCtx.createGain();
  cg.gain.setValueAtTime(cfg.clickGain, now);
  cg.gain.exponentialRampToValueAtTime(0.001, now + cfg.clickDuration);
  click.connect(cg).connect(audioCtx.destination);
  click.start(now); click.stop(now + cfg.clickDuration);
}

function playSmashSound() {
  const cfg = CONFIG.sound.smash;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(cfg.boomStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.boomEndFreq, now + cfg.boomSweepTime);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(cfg.boomGainStart, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + cfg.boomDecayTime);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.boomDecayTime);
  const clang = audioCtx.createOscillator();
  clang.type = 'triangle';
  clang.frequency.setValueAtTime(cfg.clangStartFreq, now);
  clang.frequency.exponentialRampToValueAtTime(cfg.clangEndFreq, now + cfg.clangSweepTime);
  const cg = audioCtx.createGain();
  cg.gain.setValueAtTime(cfg.clangGainStart, now);
  cg.gain.exponentialRampToValueAtTime(0.001, now + cfg.clangDecayTime);
  clang.connect(cg).connect(audioCtx.destination);
  clang.start(now); clang.stop(now + cfg.clangDecayTime);
  const bufSize = audioCtx.sampleRate * cfg.noiseDuration;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const ns = audioCtx.createBufferSource();
  ns.buffer = buf;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = cfg.noiseLowpassFreq;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(cfg.noiseGainStart, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + cfg.noiseDecayTime);
  ns.connect(lp).connect(ng).connect(audioCtx.destination);
  ns.start(now); ns.stop(now + cfg.noiseDuration);
}

function playBlockSmashSound() {
  const cfg = CONFIG.sound.blockSmash;
  const now = audioCtx.currentTime;
  const bufSize = audioCtx.sampleRate * cfg.noiseDuration;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const ns = audioCtx.createBufferSource();
  ns.buffer = buf;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = cfg.bandpassFreq; bp.Q.value = cfg.bandpassQ;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(cfg.noiseGainStart, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + cfg.noiseDecayTime);
  ns.connect(bp).connect(g).connect(audioCtx.destination);
  ns.start(now); ns.stop(now + cfg.noiseDuration);
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(cfg.sawStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.sawEndFreq, now + cfg.sawSweepTime);
  const og = audioCtx.createGain();
  og.gain.setValueAtTime(cfg.sawGainStart, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + cfg.sawDecayTime);
  osc.connect(og).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.sawDecayTime);
}

let lastBounceTime = 0;
function playBounceSound() {
  const cfg = CONFIG.sound.bounce;
  const now = audioCtx.currentTime;
  if (now - lastBounceTime < cfg.minInterval) return;
  lastBounceTime = now;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(cfg.baseFreq + Math.random() * cfg.freqRange, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.sweepTime);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(cfg.gainStart, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + cfg.decayTime);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.decayTime);
}

function playSplitSound() {
  const cfg = CONFIG.sound.split;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(cfg.oscStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.oscEndFreq, now + cfg.sweepTime);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(cfg.gainStart, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.decayTime);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.decayTime);
  const twang = audioCtx.createOscillator();
  twang.type = 'triangle';
  twang.frequency.setValueAtTime(cfg.twangStartFreq, now);
  twang.frequency.exponentialRampToValueAtTime(cfg.twangEndFreq, now + cfg.twangSweepTime);
  const tg = audioCtx.createGain();
  tg.gain.setValueAtTime(cfg.twangGainStart, now);
  tg.gain.exponentialRampToValueAtTime(0.001, now + cfg.twangDecayTime);
  twang.connect(tg).connect(audioCtx.destination);
  twang.start(now); twang.stop(now + cfg.twangDecayTime);
}

// Continuous rubber band stretch tone — starts/stops/updates as user drags
let _stretchOsc = null;
let _stretchGain = null;
let _stretchFilter = null;

function startStretchSound() {
  if (_stretchOsc) return; // already playing
  const cfg = CONFIG.sound.rubberBandStretch;
  _stretchOsc = audioCtx.createOscillator();
  _stretchOsc.type = cfg.waveType;
  _stretchOsc.frequency.value = cfg.baseFreq;
  _stretchFilter = audioCtx.createBiquadFilter();
  _stretchFilter.type = 'lowpass';
  _stretchFilter.frequency.value = cfg.filterBaseFreq;
  _stretchFilter.Q.value = cfg.filterQ;
  _stretchGain = audioCtx.createGain();
  _stretchGain.gain.value = 0; // fade in during update
  _stretchOsc.connect(_stretchFilter).connect(_stretchGain).connect(audioCtx.destination);
  _stretchOsc.start();
}

function updateStretchSound(progress) {
  if (!_stretchOsc) return;
  const cfg = CONFIG.sound.rubberBandStretch;
  const p = Math.max(0, Math.min(progress, 1.5));
  _stretchOsc.frequency.value = cfg.baseFreq + cfg.freqRange * p;
  _stretchFilter.frequency.value = cfg.filterBaseFreq + cfg.filterFreqRange * p;
  _stretchGain.gain.value = cfg.gain * Math.min(p * 2, 1); // fade in over first 50%
}

function stopStretchSound() {
  if (!_stretchOsc) return;
  try {
    _stretchGain.gain.setValueAtTime(_stretchGain.gain.value, audioCtx.currentTime);
    _stretchGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    _stretchOsc.stop(audioCtx.currentTime + 0.06);
  } catch (e) { /* already stopped */ }
  _stretchOsc = null;
  _stretchGain = null;
  _stretchFilter = null;
}
