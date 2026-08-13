/**
 * Frame Renderer — Canvas compositing engine for HH Goa 2026
 * Flat, Brutalist design system with fixed colors and downloaded assets
 */

import { loadImage } from "./imageUtils";

// ============================================================
// Fixed Design System Constants
// ============================================================
const COLORS = {
  forest: "#0F3D2E",
  yellow: "#F5D300",
  pink: "#FF2E93",
  ink: "#0B2A1F",
  white: "#F7F5EF",
};

export function getLiveTimeStudioString(): string {
  if (typeof window === "undefined") return "10:27 am Studio";
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm} Studio`;
}

const STRINGS = {
  date: "GOA, INDIA · 28–31 OCT 2026",
  get studio() { return getLiveTimeStudioString(); },
  tagline: "Less Noise. More Signal.",
};


export type PhotoFilter = "none" | "cyber" | "sunset" | "matrix" | "bw";

// Caching for loaded assets to avoid re-fetching on every render
const assetCache: Record<string, HTMLImageElement> = {};

async function getAsset(filename: string): Promise<HTMLImageElement> {
  if (assetCache[filename]) return assetCache[filename];
  const img = await loadImage(`/assets/${filename}`);
  assetCache[filename] = img;
  return img;
}

async function ensureFontsLoaded() {
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font ready errors
    }
  }
}

/**
 * Draws an image simulating CSS `object-fit: cover`
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx, sy, sWidth, sHeight;

  if (imgRatio > targetRatio) {
    sHeight = img.height;
    sWidth = sHeight * targetRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = sWidth / targetRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * Apply creative photo filter overlays on canvas
 */
function applyPhotoFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  filter: PhotoFilter = "none"
) {
  if (filter === "none") return;

  ctx.save();
  if (filter === "cyber") {
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "#00E5FF";
    ctx.fillRect(x, y, w, h);
  } else if (filter === "sunset") {
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "color-burn";
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(x, y, w, h);
  } else if (filter === "matrix") {
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = "#00FF66";
    ctx.fillRect(x, y, w, h);
  } else if (filter === "bw") {
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/**
 * Draw a sticker badge overlay
 */
function drawStickerBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  angle = -8
) {
  if (!text) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.fillStyle = COLORS.pink;
  ctx.shadowColor = COLORS.ink;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;

  const paddingX = 22;
  const bh = 54;
  ctx.font = "700 28px 'Space Grotesk', sans-serif";
  const metrics = ctx.measureText(text);
  const bw = metrics.width + paddingX * 2;

  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 4;
  ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);

  ctx.restore();
}

// ============================================================
// Format A: PFP Frame (1080x1080)
// ============================================================
export async function renderPfpFrame(
  imageSrc: string,
  filter: PhotoFilter = "none",
  badgeText = ""
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const SIZE = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // 1. Background
  ctx.fillStyle = COLORS.forest;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 2. Load Assets
  const [photo, wordmark, logo247] = await Promise.all([
    loadImage(imageSrc),
    getAsset("Hacker house.png"),
    getAsset("2-47.svg"),
  ]);

  // 3. Draw photo
  drawCoverImage(ctx, photo, 0, 0, SIZE, SIZE);

  // 4. Filter
  applyPhotoFilter(ctx, 0, 0, SIZE, SIZE, filter);

  // 5. Branding Overlay
  // Top Banner
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, SIZE, 140);

  const wmWidth = 600;
  const wmHeight = (wmWidth / wordmark.width) * wordmark.height;
  ctx.drawImage(wordmark, (SIZE - wmWidth) / 2, (140 - wmHeight) / 2, wmWidth, wmHeight);

  // Bottom Banner
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(0, SIZE - 120, SIZE, 120);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "40px 'VT323', monospace";
  ctx.fillStyle = COLORS.ink;
  ctx.fillText(STRINGS.date, SIZE / 2, SIZE - 60);

  // Logo 2:47
  const logoW = 100;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, SIZE - logoW - 40, SIZE - 120 + (120 - logoH) / 2, logoW, logoH);

  // Inner pixel border
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 12;
  ctx.strokeRect(0, 140, SIZE, SIZE - 260);

  // 6. Sticker badge if requested
  if (badgeText) {
    drawStickerBadge(ctx, badgeText, SIZE / 2, SIZE - 200, -6);
  }

  return canvas;
}

// ============================================================
// Format B: Builder ID Card (1080x1350)
// ============================================================
export async function renderIdCard(
  imageSrc: string,
  name: string,
  stack: string,
  builderTitle: string,
  filter: PhotoFilter = "none",
  badgeText = ""
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const W = 1080;
  const H = 1350;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. Background
  ctx.fillStyle = COLORS.forest;
  ctx.fillRect(0, 0, W, H);

  // 2. Load Assets
  const [photo, sunrise, wordmark, logo247, hindiMark, trees] = await Promise.all([
    loadImage(imageSrc),
    getAsset("Sun rise.png"),
    getAsset("Hacker house.png"),
    getAsset("2-47.svg"),
    getAsset("goa_hindi.svg"),
    getAsset("footer trees.png"),
  ]);

  // 3. Top Illustration (Sunrise)
  const sunW = W;
  const sunH = (sunW / sunrise.width) * sunrise.height;
  ctx.drawImage(sunrise, 0, 0, sunW, sunH);

  // 4. Photo — Strict square, brutalist placement
  const photoSize = 460;
  const photoX = W / 2 - photoSize / 2;
  const photoY = 280;

  // Solid shadow block
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(photoX + 16, photoY + 16, photoSize, photoSize);

  // Photo frame
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(photoX - 8, photoY - 8, photoSize + 16, photoSize + 16);

  drawCoverImage(ctx, photo, photoX, photoY, photoSize, photoSize);

  // Photo Filter
  applyPhotoFilter(ctx, photoX, photoY, photoSize, photoSize, filter);

  // Sticker badge on photo corner
  if (badgeText) {
    drawStickerBadge(ctx, badgeText, photoX + photoSize - 60, photoY + 30, 12);
  }

  // 5. Typography section
  let currentY = photoY + photoSize + 100;

  // Name
  const displayName = (name.trim() || "BUILDER").toUpperCase();
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.yellow;

  // Auto-shrink name
  let nameFontSize = 90;
  ctx.font = `700 ${nameFontSize}px 'Bodoni Moda', serif`;
  while (ctx.measureText(displayName).width > W - 120 && nameFontSize > 40) {
    nameFontSize -= 4;
    ctx.font = `700 ${nameFontSize}px 'Bodoni Moda', serif`;
  }
  ctx.fillText(displayName, W / 2, currentY);

  // Builder Title
  currentY += 80;
  if (builderTitle) {
    ctx.font = `40px 'VT323', monospace`;
    ctx.fillStyle = COLORS.pink;
    ctx.fillText(`< ${builderTitle} >`, W / 2, currentY);
  }

  // Stack
  currentY += 60;
  if (stack) {
    ctx.font = `32px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = COLORS.white;
    ctx.fillText(stack.toUpperCase(), W / 2, currentY);
  }

  // 6. Footer section
  const footerH = 200;
  const footerY = H - footerH;

  // Footer Trees
  const treeW = W;
  const treeH = (treeW / trees.width) * trees.height;
  ctx.drawImage(trees, 0, H - treeH, treeW, treeH);

  // Solid footer block over trees
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(0, footerY, W, footerH);

  // Wordmark in footer
  const wmWidth = 400;
  const wmHeight = (wmWidth / wordmark.width) * wordmark.height;
  ctx.drawImage(wordmark, 40, footerY + (footerH - wmHeight) / 2, wmWidth, wmHeight);

  // Hindi Mark
  const hmWidth = 140;
  const hmHeight = (hmWidth / hindiMark.width) * hindiMark.height;
  ctx.drawImage(hindiMark, 40 + wmWidth + 20, footerY + (footerH - hmHeight) / 2 - 10, hmWidth, hmHeight);

  // 2:47 Studio Logo
  const logoW = 80;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, W - logoW - 40, footerY + 40, logoW, logoH);

  // Date and Tagline
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `24px 'VT323', monospace`;
  ctx.fillText(STRINGS.date, W - 40, footerY + 140);
  ctx.fillText(STRINGS.tagline, W - 40, footerY + 170);

  return canvas;
}

// ============================================================
// Format C: Team Frame (1080x1350)
// ============================================================
export async function renderTeamFrame(
  imageSrcs: string[],
  filter: PhotoFilter = "none",
  badgeText = ""
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const W = 1080;
  const H = 1350;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = COLORS.forest;
  ctx.fillRect(0, 0, W, H);

  const [wordmark, hindiMark, logo247] = await Promise.all([
    getAsset("Hacker house.png"),
    getAsset("goa_hindi.svg"),
    getAsset("2-47.svg"),
  ]);

  // Top Banner
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, W, 200);

  const wmWidth = 500;
  const wmHeight = (wmWidth / wordmark.width) * wordmark.height;
  ctx.drawImage(wordmark, W / 2 - wmWidth / 2, 60, wmWidth, wmHeight);

  const hmWidth = 120;
  const hmHeight = (hmWidth / hindiMark.width) * hindiMark.height;
  ctx.drawImage(hindiMark, W / 2 - hmWidth / 2, 60 + wmHeight + 10, hmWidth, hmHeight);

  // Photos Grid
  const count = imageSrcs.length;
  const photos = await Promise.all(imageSrcs.map((src) => loadImage(src)));

  const gridY = 280;
  const gridH = 800;
  const margin = 60;
  const gap = 30;

  if (count === 1) {
    const size = W - margin * 2;
    drawBrutalistPhoto(ctx, photos[0], margin, gridY + (gridH - size) / 2, size, size, filter);
  } else if (count === 2) {
    const size = (W - margin * 2 - gap) / 2;
    drawBrutalistPhoto(ctx, photos[0], margin, gridY + (gridH - size) / 2, size, size, filter);
    drawBrutalistPhoto(ctx, photos[1], margin + size + gap, gridY + (gridH - size) / 2, size, size, filter);
  } else if (count === 3) {
    const size = (W - margin * 2 - gap) / 2;
    drawBrutalistPhoto(ctx, photos[0], W / 2 - size / 2, gridY + 40, size, size, filter);
    drawBrutalistPhoto(ctx, photos[1], margin, gridY + 40 + size + gap, size, size, filter);
    drawBrutalistPhoto(ctx, photos[2], margin + size + gap, gridY + 40 + size + gap, size, size, filter);
  } else {
    const size = (W - margin * 2 - gap) / 2;
    const startY = gridY + (gridH - (size * 2 + gap)) / 2;
    drawBrutalistPhoto(ctx, photos[0], margin, startY, size, size, filter);
    drawBrutalistPhoto(ctx, photos[1], margin + size + gap, startY, size, size, filter);
    drawBrutalistPhoto(ctx, photos[2], margin, startY + size + gap, size, size, filter);
    drawBrutalistPhoto(ctx, photos[3], margin + size + gap, startY + size + gap, size, size, filter);
  }

  // Footer Banner
  const footerH = 150;
  const footerY = H - footerH;
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(0, footerY, W, footerH);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "40px 'VT323', monospace";
  ctx.fillStyle = COLORS.ink;
  ctx.fillText(STRINGS.date, 60, footerY + footerH / 2);

  const logoW = 100;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, W - logoW - 60, footerY + (footerH - logoH) / 2, logoW, logoH);

  // Sticker badge
  if (badgeText) {
    drawStickerBadge(ctx, badgeText, W / 2, footerY - 40, -4);
  }

  return canvas;
}

function drawBrutalistPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  filter: PhotoFilter = "none"
) {
  // Shadow block
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x + 12, y + 12, w, h);
  // Border
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  // Image
  drawCoverImage(ctx, img, x, y, w, h);
  // Filter
  applyPhotoFilter(ctx, x, y, w, h, filter);
}

