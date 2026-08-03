import { NextRequest, NextResponse } from "next/server";
import { uploadPhoto, deletePhoto } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 8MB." }, { status: 400 });
  }

  const url = await uploadPhoto(file);
  return NextResponse.json({ url });
}

export async function DELETE(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url) return NextResponse.json({ error: "URL tidak ada." }, { status: 400 });
  await deletePhoto(url);
  return NextResponse.json({ success: true });
}
