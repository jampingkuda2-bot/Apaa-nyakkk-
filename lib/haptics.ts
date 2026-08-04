// Small wrapper around the Vibration API. Safe to call anywhere —
// silently does nothing on devices/browsers that don't support it (iOS Safari
// notably doesn't, but Android Chrome does).
export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // haptics are a nice-to-have, never let this break anything
  }
}
