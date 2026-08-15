import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/blob";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getConfig();
  const customIcon = config.appIconUrl;
  const ext = customIcon?.split(".").pop()?.toLowerCase();
  const customType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";

  return {
    name: `Untuk ${config.recipientName}`,
    short_name: `Untuk ${config.recipientName}`,
    description: "Sebuah langit penuh kejutan, untukmu.",
    start_url: "/",
    display: "standalone",
    background_color: "#123A5E",
    theme_color: "#123A5E",
    icons: customIcon
      ? [
          { src: customIcon, sizes: "192x192", type: customType },
          { src: customIcon, sizes: "512x512", type: customType },
        ]
      : [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
  };
}
