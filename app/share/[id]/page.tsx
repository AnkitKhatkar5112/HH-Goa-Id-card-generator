import type { Metadata } from "next";
import { decodeShareId } from "../../lib/shareUtils";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeShareId(id);

  if (!decoded) {
    return {
      title: "HH Goa 2026",
      description: "Create your HH Goa 2026 frame or builder ID!",
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
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
      images: [imageUrl],
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
        <p style={{ color: "var(--smoke)" }}>This share link is invalid or expired.</p>
        <a href="/" className="btn btn--primary share-page__cta">
          Create Your Own →
        </a>
      </main>
    );
  }

  const { url: imageUrl, mode } = decoded;

  return (
    <main className="share-page">
      <h1 className="brand-wordmark" style={{ marginBottom: "var(--space-6)" }}>
        HH Goa 2026
      </h1>

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
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: "var(--sea-teal)",
          marginBottom: "var(--space-6)",
        }}
      >
        $ built_in_goa // 2026
      </p>

      <a href="/" className="btn btn--primary share-page__cta" id="create-own-btn">
        ✨ Create Your Own
      </a>
    </main>
  );
}
