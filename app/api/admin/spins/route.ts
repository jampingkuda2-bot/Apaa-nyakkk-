import { NextRequest, NextResponse } from "next/server";
import { getSpinsData, saveSpinsData } from "@/lib/spins";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSpinsData();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  try {
    const data = await getSpinsData();
    if (ip) {
      delete data.byIp[ip];
    } else {
      data.byIp = {};
    }
    await saveSpinsData(data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("reset spins failed:", err);
    return NextResponse.json({ error: "Gagal mereset data spin." }, { status: 500 });
  }
}
