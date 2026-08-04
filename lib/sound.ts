// Synthesizes short sound effects using the Web Audio API — no external
// audio files needed (avoids licensing/asset issues, works fully offline).

export function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    return new Ctx();
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = "sine"
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** Short magical "pluck" for tap feedback — pitch settles down slightly, like a tiny harp pluck. */
function noiseBurst(ctx: AudioContext, startTime: number, duration: number, peakGain: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 0.8;
  bandpass.frequency.setValueAtTime(500, startTime);
  bandpass.frequency.exponentialRampToValueAtTime(3200, startTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  noise.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
  noise.stop(startTime + duration + 0.05);
}

function noiseWhoosh(ctx: AudioContext, startTime: number, duration: number, peakGain: number) {
  noiseBurst(ctx, startTime, duration, peakGain);
}

/** Soft short whoosh — for opening a photo/video in the lightbox. */
export function playWhoosh(ctx: AudioContext) {
  noiseBurst(ctx, ctx.currentTime, 0.28, 0.07);
}

/** A single short mechanical tick, like a wheel passing a peg. */
function tickSound(ctx: AudioContext, startTime: number) {
  tone(ctx, 850 + Math.random() * 120, startTime, 0.045, 0.055, "square");
}

/**
 * Schedules a series of ticks over the spin duration that start fast and
 * gradually slow down, like a real wheel losing momentum to friction.
 */
export function scheduleWheelTicks(ctx: AudioContext, delaySeconds: number, spinDuration: number) {
  const start = ctx.currentTime + delaySeconds;
  let elapsed = 0;
  let i = 0;
  while (elapsed < spinDuration - 0.15) {
    const progress = elapsed / spinDuration;
    const interval = 0.035 + Math.pow(progress, 2.2) * 0.3;
    elapsed += interval;
    if (elapsed >= spinDuration - 0.15) break;
    tickSound(ctx, start + elapsed);
    i++;
    if (i > 60) break;
  }
}

/** Bright ascending arpeggio + sparkle — a "you won!" style jingle. */
export function scheduleWinJingle(ctx: AudioContext, delaySeconds: number) {
  const start = ctx.currentTime + delaySeconds;
  const notes = [659.25, 783.99, 1046.5]; // E5 G5 C6
  notes.forEach((f, i) => tone(ctx, f, start + i * 0.1, 0.4, 0.11, "triangle"));
  for (let i = 0; i < 6; i++) {
    const t = start + 0.32 + Math.random() * 0.55;
    const f = 1400 + Math.random() * 1300;
    tone(ctx, f, t, 0.15, 0.045, "sine");
  }
}

export function playBlip(ctx: AudioContext, freq: number) {
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq * 1.15, start);
  osc.frequency.exponentialRampToValueAtTime(freq, start + 0.08);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.22);
}

/**
 * Schedules a richer "reveal" sting: a stardust whoosh, a two-note fanfare
 * ("ta-DA"), a bright chord bloom, then a sprinkle of high sparkle twinkles.
 * Safe to call from a user-gesture handler even if the sound should play
 * slightly later (delaySeconds) — the AudioContext just needs to be created
 * within the gesture; scheduled events fire fine afterwards.
 */
export function scheduleCelebrationChime(ctx: AudioContext, delaySeconds: number) {
  const start = ctx.currentTime + delaySeconds;

  // stardust whoosh leading into the reveal
  noiseWhoosh(ctx, start, 0.4, 0.1);

  // two-note fanfare: "ta-DA"
  const fanfareStart = start + 0.32;
  tone(ctx, 523.25, fanfareStart, 0.22, 0.11, "sawtooth"); // C5
  tone(ctx, 523.25, fanfareStart, 0.22, 0.05, "triangle");
  tone(ctx, 783.99, fanfareStart + 0.18, 0.9, 0.13, "sawtooth"); // G5, held
  tone(ctx, 783.99, fanfareStart + 0.18, 0.9, 0.06, "triangle");

  // bright chord bloom underneath the held note
  const chordStart = fanfareStart + 0.22;
  const chordFreqs = [523.25, 659.25, 987.77, 1318.5]; // C5 E5 B5 E6 — sparkly add-tone chord
  chordFreqs.forEach((f) => tone(ctx, f, chordStart, 1.1, 0.06, "triangle"));

  // sparkle twinkles
  for (let i = 0; i < 8; i++) {
    const t = chordStart + 0.2 + Math.random() * 1.0;
    const f = 1500 + Math.random() * 1500;
    tone(ctx, f, t, 0.16, 0.045, "sine");
  }
}
