// Plays admin-uploaded MP3 sound effects. Falls back to the synthesized
// Web Audio sounds (in lib/sound.ts) wherever a custom file hasn't been
// uploaded, so the site always has sound either way.

export function playCustomSound(url: string, volume = 1) {
  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
      // ignore autoplay-policy or format errors — sound is a nice-to-have
    });
  } catch {
    // ignore
  }
}

/**
 * Approximates the same "ticks that slow down like a real wheel" pattern
 * as scheduleWheelTicks, but using a custom MP3 clip instead of a
 * synthesized tone. Uses setTimeout since HTMLAudioElement doesn't support
 * sample-accurate scheduling the way Web Audio does — the slight timing
 * jitter is not noticeable for this purpose.
 */
export function scheduleCustomTicks(url: string, spinDuration: number, volume = 0.6) {
  let elapsed = 0;
  let i = 0;
  while (elapsed < spinDuration - 0.15) {
    const progress = elapsed / spinDuration;
    const interval = 0.035 + Math.pow(progress, 2.2) * 0.3;
    elapsed += interval;
    if (elapsed >= spinDuration - 0.15) break;
    window.setTimeout(() => playCustomSound(url, volume), elapsed * 1000);
    i++;
    if (i > 60) break;
  }
}
