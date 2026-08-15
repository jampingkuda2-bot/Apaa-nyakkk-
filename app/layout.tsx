import type { Metadata, Viewport } from "next";
import { Playfair_Display, Great_Vibes, Poppins, IBM_Plex_Mono } from "next/font/google";
import { getConfig } from "@/lib/blob";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});
const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});
const body = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  const icon = config.appIconUrl || "/icon-192.png";

  return {
    title: `Untuk ${config.recipientName} ✨`,
    description: "Sebuah langit penuh kejutan, untukmu.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: `Untuk ${config.recipientName}`,
    },
    icons: {
      icon: [
        { url: icon, sizes: "192x192" },
        { url: config.appIconUrl || "/icon-512.png", sizes: "512x512" },
      ],
      apple: [{ url: icon, sizes: "192x192" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#123A5E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${display.variable} ${script.variable} ${body.variable} ${mono.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}
