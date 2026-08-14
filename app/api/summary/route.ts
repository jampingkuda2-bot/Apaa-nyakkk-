import { NextResponse } from "next/server";
import { getVisitsData } from "@/lib/visits";
import { getSpinsData } from "@/lib/spins";

export const dynamic = "force-dynamic";

export async function GET() {
  const [visits, spins] = await Promise.all([getVisitsData(), getSpinsData()]);

  const totalSpins = Object.values(spins.byDevice).reduce((sum, d) => sum + d.count, 0);
  const uniqueDevicesSpun = Object.keys(spins.byDevice).length;
  const lastVisit = visits.recent[0] ?? null;

  return NextResponse.json({
    totalVisits: visits.total,
    lastVisit,
    totalSpins,
    uniqueDevicesSpun,
  });
}
