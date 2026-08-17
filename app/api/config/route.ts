import { NextResponse } from "next/server";
import { getConfigSafe } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfigSafe();
  return NextResponse.json(config);
}
