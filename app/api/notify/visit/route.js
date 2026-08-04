import { NextRequest, NextResponse } from "next/server";
import { sendEmail, parseDevice, getClientIp } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const device = parseDevice(ua);
  const ip = getClientIp(req.headers);
  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  await sendEmail({
    subject: "Website ulang tahun baru saja dibuka 👀",
    html: `<p>Websitenya baru dibuka.</p><p><b>Waktu:</b> ${time} WIB<br/><b>Perangkat:</b> ${device}<br/><b>IP:</b> ${ip}</p>`,
  });

  return NextResponse.json({ success: true });
}
