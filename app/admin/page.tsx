import { put, list, del } from "@vercel/blob";
import { DEFAULT_CONFIG, SiteConfig, normalizeConfig } from "./types";

const CONFIG_PATH = "data/config.json";

export async function getConfig(): Promise<SiteConfig> {
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONFIG_PATH);
    if (!match) return DEFAULT_CONFIG;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONFIG;
    const data = (await res.json()) as Partial<SiteConfig>;
    return normalizeConfig(data);
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
