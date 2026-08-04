import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/blob";
import { getSpinsData, saveSpinsData, SpinRecord } from "@/lib/spins";
import { sendEmail, parseDevice, getClientIp } from "@/lib/email";
import { MAX_SPINS_PER_IP } from "@/lib/types";

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
  const ip = getClientIp(req.headers);
  const spins = await getSpinsData();
  const used = spins.byIp[ip]?.count ?? 0;
  return NextResponse.json({
    remaining: Math.max(0, MAX_SPINS_PER_IP - used),
    max: MAX_SPINS_PER_IP,
  });
}

export async function POST(req: NextRequest) {
  const config = await getConfig();
  if (!config.prizes || config.prizes.length === 0) {
    return NextResponse.json({ error: "Belum ada hadiah yang diatur." }, { status: 400 });
  }

  const ip = getClientIp(req.headers);
  const ua = req.headers.get("user-agent") || "";
  const device = parseDevice(ua);

  const spins = await getSpinsData();
  const entry = spins.byIp[ip] ?? { count: 0, history: [] };

  if (entry.count >= MAX_SPINS_PER_IP) {
    return NextResponse.json(
      { error: "Sudah mencapai batas maksimal putaran.", remaining: 0 },
      { status: 403 }
    );
  }

  const weights = config.prizes.map((p) => p.weight);
  const index = pickWeightedIndex(weights);
  const prizeLabel = config.prizes[index].label;

  const time = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const record: SpinRecord = { prize: prizeLabel, time, ip, device };

  entry.count += 1;
  entry.history.push(record);
  spins.byIp[ip] = entry;
  await saveSpinsData(spins);

  const remaining = MAX_SPINS_PER_IP - entry.count;

  await sendEmail({
    subject: `Spin baru: dapat "${prizeLabel}" 🎡`,
    html: `<p><b>Hadiah:</b> ${prizeLabel}<br/><b>Waktu:</b> ${time} WIB<br/><b>Perangkat:</b> ${device}<br/><b>IP:</b> ${ip}<br/><b>Sisa putaran:</b> ${remaining}</p>`,
  });

  return NextResponse.json({ index, prize: prizeLabel, remaining });
}
