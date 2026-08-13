/**
 * Share utilities — Cloudinary upload + X intent
 * 
 * Uses a stateless approach: the Cloudinary URL is base64url-encoded
 * into the share path, so the share page can decode it and set og:image
 * without needing a database.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * Upload a PNG blob to Cloudinary using unsigned upload
 */
export async function uploadToCloudinary(blob: Blob): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    // Fallback: return a local blob URL (share won't have OG preview, but download works)
    console.warn("Cloudinary not configured. Share-to-X OG preview will not work.");
    return URL.createObjectURL(blob);
  }

  const formData = new FormData();
  formData.append("file", blob, "hh-goa-2026.png");
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "hh-goa-2026");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.secure_url as string;
}

/**
 * Encode a Cloudinary URL into a URL-safe base64 string for the share path
 */
export function encodeShareId(imageUrl: string, mode: "frame" | "card" | "team"): string {
  const payload = JSON.stringify({ url: imageUrl, mode });
  // Base64url encode
  const encoded = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return encoded;
}

/**
 * Decode a share ID back to the image URL and mode
 * Works in both browser (atob) and Node.js (Buffer) environments
 */
export function decodeShareId(shareId: string): { url: string; mode: string } | null {
  try {
    // Restore base64
    let base64 = shareId.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4) base64 += "=";

    let json: string;
    if (typeof atob === "function") {
      json = atob(base64);
    } else {
      json = Buffer.from(base64, "base64").toString("utf-8");
    }

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Sanitize and get a clean share URL (avoids exposing browser memory blob: URLs)
 */
export function sanitizeShareUrl(sharePageUrl: string): string {
  if (!sharePageUrl || sharePageUrl.includes("blob:") || sharePageUrl.includes("eyJ1cmwiOiJibG9i")) {
    return getBaseUrl();
  }
  return sharePageUrl;
}

/**
 * Build the X (Twitter) intent URL with pre-filled text and clean share link
 */
export function buildXIntentUrl(sharePageUrl: string, mode: "frame" | "card" | "team"): string {
  const cleanUrl = sanitizeShareUrl(sharePageUrl);
  const captions = mode === "frame"
    ? [
        "Just got my HH Goa 2026 frame! 🌴🔧",
        "Ready for HH Goa 2026! Susegad vibes loading… 🏖️⚡",
        "New PFP just dropped — HH Goa 2026 🌅💻",
        "Beach-mode: activated. Hacker-mode: always on. 🥥🔨",
      ]
    : mode === "team" 
    ? [
        "Squad ready for HH Goa 2026! 🌴🔧",
        "The team is locked in for Goa. See you there! 🏖️⚡",
        "Bringing the whole crew to HH Goa 2026 🌅💻",
        "Hackers assemble. Destination: Goa. 🥥🔨",
      ]
    : [
        "Got my HH Goa 2026 Builder ID! 🪪🌴",
        "Officially a builder at HH Goa 2026 ⚡🏖️",
        "My HH Goa 2026 badge is here! Let's build 🔧🌅",
        "Builder status: confirmed. See you in Goa! 🥥💻",
      ];

  const caption = captions[Math.floor(Math.random() * captions.length)];
  const text = `${caption} #HHGoa2026 #FrameInGoa`;

  const intentUrl = new URL("https://twitter.com/intent/tweet");
  intentUrl.searchParams.set("text", text);
  intentUrl.searchParams.set("url", cleanUrl);

  return intentUrl.toString();
}

/**
 * Build WhatsApp share URL
 */
export function buildWhatsAppIntentUrl(text: string, sharePageUrl: string): string {
  const cleanUrl = sanitizeShareUrl(sharePageUrl);
  const fullText = `${text}\n${cleanUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
}

/**
 * Build LinkedIn share URL
 */
export function buildLinkedInIntentUrl(sharePageUrl: string): string {
  const cleanUrl = sanitizeShareUrl(sharePageUrl);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`;
}

/**
 * Build Telegram share URL
 */
export function buildTelegramIntentUrl(text: string, sharePageUrl: string): string {
  const cleanUrl = sanitizeShareUrl(sharePageUrl);
  return `https://t.me/share/url?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(text)}`;
}

/**
 * Get the base URL for share pages
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

