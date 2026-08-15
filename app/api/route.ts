import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const config = await getConfig();

  if (!config.sitePassword) {
    return NextResponse.json({ ok: true });
  }

  if (typeof password === "string" && password === config.sitePassword) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Password salah." }, { status: 401 });
}
