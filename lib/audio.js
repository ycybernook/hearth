// Cues are synthesised in the browser — no audio files to ship yet.
// When coach recordings land, swap playCue() for an AudioBuffer player
// and keep the same call sites.

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function tone(freq, dur = 0.5, gain = 0.09) {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(gain, t + 0.05);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch (e) {
    // Audio unavailable — the visual cue still carries the session.
  }
}

// Browsers only allow audio after a user gesture. Call this on tap.
export function unlockAudio() {
  tone(528, 0.01, 0.001);
}

export function playCue(label, { heart = false } = {}) {
  if (/in\b|inhale/i.test(label)) tone(heart ? 440 : 528, 0.45);
  else if (/out|exhale/i.test(label)) tone(heart ? 330 : 396, 0.6);
  else tone(660, 0.25, 0.05);
}

export function playChime() {
  tone(528, 1.1, 0.07);
}

export function buzz(pattern) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch (e) {}
}
