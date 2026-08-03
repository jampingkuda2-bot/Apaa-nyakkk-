// Synthesizes a short celebratory "ta-da" chime using the Web Audio API,
// so no external audio file is needed (avoids licensing/asset issues entirely).

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
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Schedules a short "reveal" chime: a rising anticipation sweep, a bright
 * major chord ("ta-da"), and a sprinkle of high sparkle twinkles.
 * Safe to call from a user-gesture handler even if the sound should play
 * slightly later (delaySeconds) — the AudioContext just needs to be created
 * within the gesture, scheduled events fire fine afterwards.
 */
export function scheduleCelebrationChime(ctx: AudioContext, delaySeconds: number) {
  const start = ctx.currentTime + delaySeconds;

  // rising anticipation sweep
  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  sweep.type = "sine";
  sweep.frequency.setValueAtTime(280, start);
  sweep.frequency.exponentialRampToValueAtTime(880, start + 0.35);
  sweepGain.gain.setValueAtTime(0.0001, start);
  sweepGain.gain.exponentialRampToValueAtTime(0.12, start + 0.3);
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
  sweep.connect(sweepGain);
  sweepGain.connect(ctx.destination);
  sweep.start(start);
  sweep.stop(start + 0.45);

  // bright chord ("ta-da")
  const chordStart = start + 0.35;
  const chordFreqs = [523.25, 659.25, 783.99, 1046.5];
  chordFreqs.forEach((f) => tone(ctx, f, chordStart, 1.1, 0.09, "triangle"));

  // sparkle twinkles
  for (let i = 0; i < 7; i++) {
    const t = chordStart + 0.15 + Math.random() * 0.9;
    const f = 1400 + Math.random() * 1400;
    tone(ctx, f, t, 0.18, 0.05, "sine");
  }
}
