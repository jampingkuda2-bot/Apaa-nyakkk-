import { put, list, del } from "@vercel/blob";
import { DEFAULT_CONFIG, SiteConfig, normalizeConfig } from "./types";

const CONFIG_PATH = "data/config.json";

export async function getConfig(): Promise<SiteConfig> {
  const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
  const match = blobs.find((b) => b.pathname === CONFIG_PATH);
  // No config has ever been saved yet — this is a legitimate first-run state.
  if (!match) return DEFAULT_CONFIG;

  // A config exists but we failed to read/parse it — this is NOT a normal
  // state, so we throw instead of silently returning defaults. Silently
  // falling back here previously let a transient fetch failure look like
  // "no data", which an admin could then accidentally save over real data.
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Gagal mengambil data tersimpan (status ${res.status}).`);
  }
  const data = (await res.json()) as Partial<SiteConfig>;
  return normalizeConfig(data);
}

/**
 * Same as getConfig(), but never throws — falls back to DEFAULT_CONFIG on
 * any failure instead. Use this ONLY where the caller must never crash
 * (public-facing pages/APIs that real visitors hit). Anywhere the admin
 * is reading data to edit/save, use getConfig() directly so failures are
 * visible instead of silently masked.
 */
export async function getConfigSafe(): Promise<SiteConfig> {
  try {
    return await getConfig();
  } catch (err) {
    console.error("getConfig failed, falling back to default:", err);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
    const existing = blobs.find((b) => b.pathname === CONFIG_PATH);
    if (existing) {
      await del(existing.url);
    }
  } catch (err) {
    console.error("Failed to remove previous config blob (continuing anyway):", err);
  }

  await put(CONFIG_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const pathname = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deletePhoto(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error("deletePhoto failed:", err);
  }
}
