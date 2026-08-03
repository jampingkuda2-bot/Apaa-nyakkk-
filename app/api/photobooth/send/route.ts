import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This route deliberately never writes the photo to any storage (Blob, disk,
// database, etc). It only forwards the image in-memory to Resend's email API,
// then the request/response cycle ends and nothing is retained on our side.
export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json().catch(() => ({ imageBase64: "" }));

  if (!imageBase64 || typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
    return NextResponse.json({ error: "Foto tidak valid." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!apiKey || !ownerEmail) {
    return NextResponse.json(
      { error: "Fitur kirim foto belum diatur di server (RESEND_API_KEY / OWNER_EMAIL belum diisi)." },
      { status: 500 }
    );
  }

  const base64Data = imageBase64.split(",")[1] ?? "";
  const approxBytes = (base64Data.length * 3) / 4;
  if (approxBytes > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran foto terlalu besar." }, { status: 400 });
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
        subject: "Foto baru dari website ulang tahun 📸",
        html: "<p>Ada foto baru dikirim langsung dari website ulang tahunmu.</p>",
        attachments: [
          {
            filename: `foto-${Date.now()}.jpg`,
            content: base64Data,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Resend send failed:", res.status, errText);
      return NextResponse.json({ error: "Gagal mengirim foto." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send photo failed:", err);
    return NextResponse.json({ error: "Gagal mengirim foto." }, { status: 500 });
  }
}
