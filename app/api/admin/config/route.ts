import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/blob";
import { SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SiteConfig;

  if (!body.recipientName || !Array.isArray(body.steps) || !Array.isArray(body.prizes)) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  await saveConfig(body);
  return NextResponse.json({ success: true });
}
