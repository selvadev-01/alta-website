import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const description = "ALTA: two residential towers with a pool, gardens and a clubhouse. Walk through a home on screen, then book a site visit.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3600"),
  title: "ALTA | Homes above the city",
  description,
  openGraph: {
    title: "ALTA | Homes above the city",
    description,
    images: [{ url: "/img/hero.webp", width: 1280, height: 720, alt: "Two residential towers at golden hour" }],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0D1012" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink font-sans text-bone antialiased">
        <a href="#main" className="sr-only bg-jade px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90]">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
