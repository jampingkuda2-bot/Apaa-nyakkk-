import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Poppins, IBM_Plex_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Untuk Angel ✨",
  description: "Sebuah langit penuh kejutan, untukmu.",
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
