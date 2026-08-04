import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Same principle as the photo route: nothing is written to storage here.
// The message just passes through this request to Resend's email API.
export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(() => ({ message: "" }));

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Pesannya masih kosong." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Pesannya kepanjangan, coba dipersingkat ya." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!apiKey || !ownerEmail) {
    return NextResponse.json(
      { error: "Fitur ini belum diatur di server (RESEND_API_KEY / OWNER_EMAIL belum diisi)." },
      { status: 500 }
    );
  }

  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

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
        subject: "Ada pesan balasan dari website ulang tahun 💌",
        html: `<p style="font-size:16px;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Resend message send failed:", res.status, errText);
      return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send message failed:", err);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
