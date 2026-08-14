// Generates a stable per-device identity without relying on IP address
// (IP can rotate on mobile data / wifi reconnects, which was resetting
// limits unintentionally). Combines a persisted random ID (localStorage)
// with a fingerprint hash of stable browser/device signals, so the same
// physical device is recognized consistently across network changes.

const STORAGE_KEY = "hbd_device_id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateId();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  try {
    const parts = [
      navigator.userAgent,
      navigator.platform,
      String(navigator.hardwareConcurrency || ""),
      `${screen.width}x${screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
    ].join("|");

    if (crypto?.subtle) {
      const data = new TextEncoder().encode(parts);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    }
    return parts.slice(0, 64);
  } catch {
    return "";
  }
}
