import { put, list, del } from "@vercel/blob";

const SPINS_PATH = "data/spins.json";

export type SpinRecord = {
  prize: string;
  time: string;
  device: string;
};

export type SpinsData = {
  byDevice: Record<string, { count: number; history: SpinRecord[] }>;
};

const EMPTY: SpinsData = { byDevice: {} };

// NOTE: this file is intentionally separate from data/config.json (which is
// exposed publicly via /api/config) so spin history / IPs are never leaked
// through the public-facing config endpoint.
export async function getSpinsData(): Promise<SpinsData> {
  try {
    const { blobs } = await list({ prefix: SPINS_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === SPINS_PATH);
    if (!match) return EMPTY;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as SpinsData;
  } catch (err) {
    console.error("getSpinsData failed, falling back to empty:", err);
    return EMPTY;
  }
}

export async function saveSpinsData(data: SpinsData): Promise<void> {
  try {
    const { blobs } = await list({ prefix: SPINS_PATH, limit: 1 });
    const existing = blobs.find((b) => b.pathname === SPINS_PATH);
    if (existing) await del(existing.url);
  } catch (err) {
    console.error("Failed to remove previous spins blob (continuing anyway):", err);
  }

  await put(SPINS_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
