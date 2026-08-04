import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Same principle as the photo/message routes: this only forwards the clip
// in-memory to Resend, then the request ends. Nothing is written to Blob,
// disk, or any database.
export async function POST(req: NextRequest) {
  const { videoBase64 } = await req.json().catch(() => ({ videoBase64: "" }));

  if (!videoBase64 || typeof videoBase64 !== "string" || !videoBase64.startsWith("data:video/")) {
    return NextResponse.json({ error: "Video tidak valid." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!apiKey || !ownerEmail) {
    return NextResponse.json(
      { error: "Fitur ini belum diatur di server (RESEND_API_KEY / OWNER_EMAIL belum diisi)." },
      { status: 500 }
    );
  }

  const base64Data = videoBase64.split(",")[1] ?? "";
  const approxBytes = (base64Data.length * 3) / 4;
  if (approxBytes > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran video terlalu besar." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Website HBD <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: "Video reaksi dari website ulang tahun 🎥",
        html: "<p>Ini video reaksinya, direkam dengan izin pas dia buka website.</p>",
        attachments: [
          {
            filename: `reaksi-${Date.now()}.webm`,
            content: base64Data,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Resend reaction send failed:", res.status, errText);
      return NextResponse.json({ error: "Gagal mengirim video." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send reaction failed:", err);
    return NextResponse.json({ error: "Gagal mengirim video." }, { status: 500 });
  }
}
