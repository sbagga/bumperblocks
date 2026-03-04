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
  // Legacy — kept for zombie system compatibility
  playSplitExplosionSound();
}

// Forceful split explosion — short punchy "crack + boom" for double-tap split
function playSplitExplosionSound() {
  const now = audioCtx.currentTime;
  // Impact thud
  const thud = audioCtx.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(200, now);
  thud.frequency.exponentialRampToValueAtTime(60, now + 0.15);
  const thudGain = audioCtx.createGain();
  thudGain.gain.setValueAtTime(0.35, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  thud.connect(thudGain).connect(audioCtx.destination);
  thud.start(now); thud.stop(now + 0.2);
  // Crack noise
  const bufSize = audioCtx.sampleRate * 0.1;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const ns = audioCtx.createBufferSource();
  ns.buffer = buf;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 1.5;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.25, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  ns.connect(bp).connect(ng).connect(audioCtx.destination);
  ns.start(now); ns.stop(now + 0.1);
  // High snap
  const snap = audioCtx.createOscillator();
  snap.type = 'triangle';
  snap.frequency.setValueAtTime(800, now);
  snap.frequency.exponentialRampToValueAtTime(300, now + 0.06);
  const snapGain = audioCtx.createGain();
  snapGain.gain.setValueAtTime(0.15, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  snap.connect(snapGain).connect(audioCtx.destination);
  snap.start(now); snap.stop(now + 0.1);
}

// Stretch sound stubs — kept for compatibility, no-ops now
function startStretchSound() {}
function updateStretchSound() {}
function stopStretchSound() {}

function playZombieCubeBreak() {
  const cfg = CONFIG.sound.zombieCubeBreak;
  const now = audioCtx.currentTime;
  // Short noise crackle
  const bufSize = audioCtx.sampleRate * cfg.noiseDuration;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const ns = audioCtx.createBufferSource();
  ns.buffer = buf;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = cfg.bandpassFreq; bp.Q.value = cfg.bandpassQ;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(cfg.noiseGainStart, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + cfg.noiseDecayTime);
  ns.connect(bp).connect(ng).connect(audioCtx.destination);
  ns.start(now); ns.stop(now + cfg.noiseDuration);
  // Crack tone
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(cfg.crackStartFreq, now);
  osc.frequency.exponentialRampToValueAtTime(cfg.crackEndFreq, now + cfg.crackSweepTime);
  const og = audioCtx.createGain();
  og.gain.setValueAtTime(cfg.crackGainStart, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + cfg.crackDecayTime);
  osc.connect(og).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + cfg.crackDecayTime);
}
