import type { Metadata } from "next";
import Link from "next/link";
import { decodeShareId } from "../../lib/shareUtils";


interface SharePageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hh-goa-2026-builder-one.vercel.app";

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeShareId(id);

  if (!decoded) {
    return {
      metadataBase: new URL(siteUrl),
      title: "HH Goa 2026",
      description: "Create your HH Goa 2026 PFP frame or Builder ID!",
      openGraph: {
        title: "HH Goa 2026 Builder Studio",
        description: "Create your HH Goa 2026 PFP frame or Builder ID!",
        images: ["/assets/details.png"],
      },
    };
  }

  const { url: imageUrl, mode } = decoded;
  const title =
    mode === "card"
      ? "My HH Goa 2026 Builder ID 🪪"
      : "My HH Goa 2026 Frame 🌴";
  const description =
    mode === "card"
      ? "Check out my Builder ID for HH Goa 2026! Get yours →"
      : "Check out my HH Goa 2026 PFP frame! Get yours →";

  const validImage = imageUrl && !imageUrl.startsWith("blob:") ? imageUrl : `${siteUrl}/assets/details.png`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: validImage,
          width: mode === "card" ? 1080 : 1080,
          height: mode === "card" ? 1350 : 1080,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [validImage],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const decoded = decodeShareId(id);

  if (!decoded) {
    return (
      <main className="share-page">
        <h1 className="brand-wordmark" style={{ marginBottom: "var(--space-4)" }}>
          HH Goa 2026
        </h1>
        <p style={{ color: "var(--smoke)", fontFamily: "var(--font-pixel)", marginBottom: "var(--space-6)" }}>
          This share link is invalid or expired.
        </p>
        <Link href="/" className="btn btn--primary">
          ✨ Create Your Own Badge
        </Link>

      </main>
    );
  }

  const { url: imageUrl, mode } = decoded;

  return (
    <main className="share-page">
      <h1 className="brand-wordmark" style={{ marginBottom: "var(--space-2)" }}>
        HH Goa 2026
      </h1>
      <p
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "var(--text-lg)",
          color: "var(--yellow-primary)",
          marginBottom: "var(--space-6)",
        }}
      >
        Official Builder Graphic
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="share-page__image"
        src={imageUrl}
        alt={mode === "card" ? "HH Goa 2026 Builder ID" : "HH Goa 2026 PFP Frame"}
        style={{
          aspectRatio: mode === "card" ? "4/5" : "1/1",
        }}
      />

      <p
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "var(--text-lg)",
          color: "var(--sea-teal)",
          marginBottom: "var(--space-6)",
        }}
      >
        $ built_in_goa // 2026
      </p>

      <Link href="/" className="btn btn--primary btn--lg glow-pulse" id="create-own-btn">
        ✨ Build Your Own HH Goa Graphic
      </Link>

    </main>
  );
}
