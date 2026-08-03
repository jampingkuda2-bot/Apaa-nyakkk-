import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { deletePhoto } from "@/lib/blob";

export const dynamic = "force-dynamic";

// Client-direct upload: the browser uploads bytes straight to Vercel Blob using
// a short-lived token issued here. This avoids the ~4.5MB request body limit
// that Vercel Serverless Functions impose, so full-size phone photos work fine.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "image/gif",
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/3gpp",
            "video/x-matroska",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 150 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // no-op; the client receives the resulting URL directly
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("upload token generation failed:", err);
    const message = err instanceof Error ? err.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url) return NextResponse.json({ error: "URL tidak ada." }, { status: 400 });
  try {
    await deletePhoto(url);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete photo failed:", err);
    return NextResponse.json({ error: "Gagal menghapus foto." }, { status: 500 });
  }
}
