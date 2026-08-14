import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/blob";
import { getSpinsData, saveSpinsData, SpinRecord } from "@/lib/spins";
import { sendEmail, parseDevice } from "@/lib/email";

export const dynamic = "force-dynamic";

function pickWeightedIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return Math.floor(Math.random() * weights.length);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export async function GET(req: NextRequest) {
  const config = await getConfig();
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId") || "";
  const fingerprint = searchParams.get("fp") || "";
  const key = deviceId || fingerprint || "unknown";

  const spins = await getSpinsData();
  const used = spins.byDevice[key]?.count ?? 0;
  return NextResponse.json({
    remaining: Math.max(0, config.maxSpinsPerIp - used),
    max: config.maxSpinsPerIp,
  });
}

export async function POST(req: NextRequest) {
  const config = await getConfig();
  if (!config.prizes || config.prizes.length === 0) {
    return NextResponse.json({ error: "Belum ada hadiah yang diatur." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
  const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint : "";
  const key = deviceId || fingerprint || "unknown";

  const ua = req.headers.get("user-agent") || "";
  const device = parseDevice(ua);

  const spins = await getSpinsData();
  const entry = spins.byDevice[key] ?? { count: 0, history: [] };

  if (entry.count >= config.maxSpinsPerIp) {
    return NextResponse.json(
      { error: "Sudah mencapai batas maksimal putaran.", remaining: 0 },
      { status: 403 }
    );
  }

  const weights = config.prizes.map((p) => p.weight);
  const index = pickWeightedIndex(weights);
  const prizeLabel = config.prizes[index].label;

  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const record: SpinRecord = { prize: prizeLabel, time, device };

  entry.count += 1;
  entry.history.push(record);
  spins.byDevice[key] = entry;
  await saveSpinsData(spins);

  const remaining = config.maxSpinsPerIp - entry.count;

  await sendEmail({
    subject: `Spin baru: dapat "${prizeLabel}" 🎡`,
    html: `<p><b>Hadiah:</b> ${prizeLabel}<br/><b>Waktu:</b> ${time} WIB<br/><b>Perangkat:</b> ${device}<br/><b>Sisa putaran:</b> ${remaining}</p>`,
  });

  return NextResponse.json({ index, prize: prizeLabel, remaining });
}
