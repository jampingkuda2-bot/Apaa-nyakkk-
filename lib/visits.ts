import { put, list, del } from "@vercel/blob";

const VISITS_PATH = "data/visits.json";
const MAX_RECENT = 50;

export type VisitRecord = {
  time: string;
  device: string;
};

export type VisitsData = {
  total: number;
  recent: VisitRecord[];
};

const EMPTY: VisitsData = { total: 0, recent: [] };

export async function getVisitsData(): Promise<VisitsData> {
  try {
    const { blobs } = await list({ prefix: VISITS_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === VISITS_PATH);
    if (!match) return EMPTY;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as VisitsData;
  } catch (err) {
    console.error("getVisitsData failed, falling back to empty:", err);
    return EMPTY;
  }
}

export async function recordVisit(record: VisitRecord): Promise<void> {
  const data = await getVisitsData();
  data.total += 1;
  data.recent = [record, ...data.recent].slice(0, MAX_RECENT);

  try {
    const { blobs } = await list({ prefix: VISITS_PATH, limit: 1 });
    const existing = blobs.find((b) => b.pathname === VISITS_PATH);
    if (existing) await del(existing.url);
  } catch (err) {
    console.error("Failed to remove previous visits blob (continuing anyway):", err);
  }

  await put(VISITS_PATH, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
