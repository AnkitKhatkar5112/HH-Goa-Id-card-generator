import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hh-goa-2026-builder-one.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HH Goa 2026 — Builder Identity Studio",
  description:
    "Generate your official Hacker House Goa 2026 Builder ID Pass, PFP Frame & Team Squad Pass. 100% free, private, client-rendered.",
  keywords: ["HH Goa", "Hacker House Goa", "2026", "Builder ID", "Goa Hackathon", "PFP Frame", "Solana", "Web3"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/assets/goa_hindi.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "HH Goa 2026 — Builder Identity Studio 🌴",
    description: "Generate your official HH Goa 2026 Builder ID Pass & PFP Frame! Upload → Render → Flex 🚀",
    url: siteUrl,
    siteName: "HH Goa 2026 Builder Studio",
    type: "website",
    images: [
      {
        url: "/assets/details.png",
        width: 1200,
        height: 630,
        alt: "HH Goa 2026 Builder Identity Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Builder Identity Studio 🌴",
    description: "Generate your official HH Goa 2026 Builder ID Pass & PFP Frame! Upload → Render → Flex 🚀",
    images: ["/assets/details.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
