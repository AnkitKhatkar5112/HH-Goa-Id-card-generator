import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HH Goa 2026 — Frame & ID Card Generator",
  description:
    "Create your HH Goa 2026 PFP frame or Builder ID card. Upload a photo, get a Goa-branded graphic, download and share to X. No login required.",
  keywords: ["HH Goa", "2026", "hacker house", "profile picture", "frame", "ID card", "builder"],
  openGraph: {
    title: "HH Goa 2026 — Frame & ID Card Generator",
    description: "Get your HH Goa 2026 look. Upload → Frame → Share.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Frame & ID Card Generator",
    description: "Get your HH Goa 2026 look. Upload → Frame → Share.",
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
