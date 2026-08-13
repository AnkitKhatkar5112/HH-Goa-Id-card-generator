/**
 * Frame Renderer — Canvas compositing engine for HH Goa 2026
 * Cinematic Editorial Brutalism Redesign
 */

import { loadImage } from "./imageUtils";

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
  tagline: "LESS NOISE. MORE SIGNAL.",
};

export type PhotoFilter = "none" | "cyber" | "sunset" | "matrix" | "bw";
export type CardTheme = "forest" | "sunset" | "gold" | "cyber";

export interface ThemeColors {
  forest: string;
  yellow: string;
  pink: string;
  ink: string;
  white: string;
}

export function getThemeColors(theme: CardTheme = "forest"): ThemeColors {
  switch (theme) {
    case "sunset":
      return {
        forest: "#1A0B2E",
        yellow: "#FF6B00",
        pink: "#FF2E93",
        ink: "#0A0414",
        white: "#F7F5EF",
      };
    case "gold":
      return {
        forest: "#141414",
        yellow: "#F5D300",
        pink: "#2E9C6C",
        ink: "#050505",
        white: "#F7F5EF",
      };
    case "cyber":
      return {
        forest: "#051C2C",
        yellow: "#00F0FF",
        pink: "#FF2E93",
        ink: "#020B12",
        white: "#F7F5EF",
      };
    case "forest":
    default:
      return {
        forest: "#0F3D2E",
        yellow: "#F5D300",
        pink: "#FF2E93",
        ink: "#0B2A1F",
        white: "#F7F5EF",
      };
  }
}

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
      // Ignore
    }
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  isFlipped = false
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

  ctx.save();
  if (isFlipped) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h);
  } else {
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  }
  ctx.restore();
}

function applyPhotoFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  filter: PhotoFilter = "none",
  themeColors: ThemeColors = COLORS
) {
  if (filter === "none") return;

  ctx.save();
  if (filter === "cyber") {
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = themeColors.pink;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "#00E5FF";
    ctx.fillRect(x, y, w, h);
  } else if (filter === "sunset") {
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = themeColors.yellow;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = "color-burn";
    ctx.fillStyle = themeColors.pink;
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

function drawStickerBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  angle = -8,
  themeColors: ThemeColors = COLORS
) {
  if (!text) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.fillStyle = themeColors.pink;
  ctx.shadowColor = themeColors.ink;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;

  const paddingX = 22;
  const bh = 54;
  ctx.font = "700 28px 'Space Grotesk', sans-serif";
  const metrics = ctx.measureText(text);
  const bw = metrics.width + paddingX * 2;

  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeStyle = themeColors.yellow;
  ctx.lineWidth = 4;
  ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = themeColors.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);

  ctx.restore();
}

function drawCinematicBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hideTextWatermark = false,
  themeColors: ThemeColors = COLORS
) {
  // 1. Radial Gradient for depth
  const cx = w / 2;
  const cy = h / 2;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.85);

  gradient.addColorStop(0, themeColors.forest);
  gradient.addColorStop(1, themeColors.ink);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // 2. Tighter, High-Tech Grid
  ctx.save();
  ctx.strokeStyle = `${themeColors.pink}14`; // Faint Pink
  ctx.lineWidth = 1;

  const step = 60;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Grid intersection dots
  ctx.fillStyle = `${themeColors.yellow}40`;
  for (let x = step * 2; x < w; x += step * 4) {
    for (let y = step * 2; y < h; y += step * 4) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
  ctx.restore();

  // 3. Goan Topography Contours
  ctx.save();
  ctx.strokeStyle = `${themeColors.yellow}12`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-100, h * 0.2 + i * 150);
    ctx.bezierCurveTo(
      w * 0.3, h * 0.1 + i * 200,
      w * 0.7, h * 0.4 + i * 100,
      w + 100, h * 0.3 + i * 150
    );
    ctx.stroke();
  }
  ctx.restore();

  // 4. Susegad Typography Watermark
  if (!hideTextWatermark) {
    ctx.save();
    ctx.fillStyle = `${themeColors.yellow}08`;
    ctx.font = "900 120px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 4); // 45 degrees
    ctx.fillText("SUSEGAD // HACKER HOUSE // BAGA BEACH", 0, -200);
    ctx.fillText("GOA 2026 // BUILDER", 0, 0);
    ctx.fillText("SUSEGAD // HACKER HOUSE // BAGA BEACH", 0, 200);
    ctx.restore();
  }
}

function drawCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number, color = COLORS.yellow, size = 30) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.restore();
}

function drawDataTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = COLORS.pink,
  themeColors: ThemeColors = COLORS
) {
  ctx.save();
  ctx.font = "700 32px 'VT323', monospace";
  const metrics = ctx.measureText(text);
  const bw = metrics.width + 40;
  const bh = 50;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, bw, bh);

  ctx.fillStyle = themeColors.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), x + 20, y + bh / 2 + 2);
  ctx.restore();
}

function drawHackerHouseWordmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fontSize = 60,
  themeColors: ThemeColors = COLORS
): number {
  ctx.save();
  ctx.font = `900 ${fontSize}px 'Space Grotesk', sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const text = "HACKER HOUSE";
  const textWidth = ctx.measureText(text).width;

  // Thick pink/accent border
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = fontSize * 0.35;
  ctx.strokeStyle = themeColors.pink;
  ctx.strokeText(text, x, y);

  // Yellow/main fill
  ctx.fillStyle = themeColors.yellow;
  ctx.fillText(text, x, y);

  ctx.restore();

  return textWidth;
}

function drawScatteredGoaHindi(ctx: CanvasRenderingContext2D, w: number, h: number, hindiMark: HTMLImageElement) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  const hindiW = 35;
  const hindiH = (hindiW / hindiMark.width) * hindiMark.height;

  let seed = 1337;
  const seededRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 200; i++) {
    const rx = seededRandom() * w;
    const ry = seededRandom() * h;
    const angle = seededRandom() * Math.PI * 2;
    const scale = 0.4 + seededRandom() * 0.8;

    ctx.translate(rx, ry);
    ctx.rotate(angle);
    ctx.drawImage(
      hindiMark,
      (-hindiW * scale) / 2,
      (-hindiH * scale) / 2,
      hindiW * scale,
      hindiH * scale
    );
    ctx.rotate(-angle);
    ctx.translate(-rx, -ry);
  }
  ctx.restore();
}

// ============================================================
// Format A: PFP Frame (1080x1080)
// ============================================================
export async function renderPfpFrame(
  imageSrc: string,
  filter: PhotoFilter = "none",
  badgeText = "",
  theme: CardTheme = "forest",
  isFlipped = false,
  scale = 1
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const BASE_SIZE = 1080;
  const SIZE = BASE_SIZE * scale;
  const themeColors = getThemeColors(theme);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const [photo, logo247, hindiMark] = await Promise.all([
    loadImage(imageSrc),
    getAsset("2-47.svg"),
    getAsset("goa_hindi.svg"),
  ]);

  // 1. Base Background
  drawCinematicBackground(ctx, BASE_SIZE, BASE_SIZE, true, themeColors);
  drawScatteredGoaHindi(ctx, BASE_SIZE, BASE_SIZE, hindiMark);

  // 2. Massive Left Margin Typography (Sideways)
  ctx.save();
  ctx.fillStyle = themeColors.pink;
  ctx.font = "900 140px 'Bodoni Moda', serif";
  ctx.textAlign = "left";
  ctx.translate(80, BASE_SIZE - 80);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("GOA '26", 0, 0);
  ctx.restore();

  // 3. Offset Photo "Polaroid" Block
  const photoW = 760;
  const photoH = 860;
  const photoX = 220;
  const photoY = 100;

  // Drop shadow
  ctx.fillStyle = themeColors.ink;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 20;
  ctx.shadowOffsetY = 20;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  ctx.shadowColor = "transparent";

  // Inner frame
  ctx.fillStyle = themeColors.yellow;
  ctx.fillRect(photoX - 8, photoY - 8, photoW + 16, photoH + 16);

  drawCoverImage(ctx, photo, photoX, photoY, photoW, photoH, isFlipped);
  applyPhotoFilter(ctx, photoX, photoY, photoW, photoH, filter, themeColors);

  // HUD crosshairs
  drawCrosshair(ctx, photoX, photoY, themeColors.pink, 20);
  drawCrosshair(ctx, photoX + photoW, photoY + photoH, themeColors.pink, 20);

  // 4. Technical Specs
  drawDataTag(ctx, scale > 1 ? "REC // 4K ULTRA" : "REC // 1080P", photoX - 20, photoY - 40, themeColors.pink, themeColors);

  // Hacker House Custom Text Wordmark
  const fontSize = 112;
  const centerY = BASE_SIZE - 100;
  const startX = 100;
  const wmWidth = drawHackerHouseWordmark(ctx, startX, centerY, fontSize, themeColors);

  // Hindi Mark
  const hmHeight = 126;
  const hmWidth = (hmHeight / hindiMark.height) * hindiMark.width;
  ctx.drawImage(hindiMark, startX + wmWidth + 30, centerY - hmHeight / 2, hmWidth, hmHeight);

  // 2:47 Logo
  const logoW = 100;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, BASE_SIZE - logoW - 40, 40, logoW, logoH);

  if (badgeText) {
    drawStickerBadge(ctx, badgeText, photoX, BASE_SIZE - 120, -12, themeColors);
  }

  return canvas;
}

// ============================================================
// Format B: Builder ID Card (1080x1350)
// ============================================================
export async function renderIdCard(
  imageSrc: string,
  username: string,
  realFullName: string,
  role: string,
  builderTitle: string,
  filter: PhotoFilter = "none",
  badgeText = "",
  theme: CardTheme = "forest",
  isFlipped = false,
  scale = 1
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const BASE_W = 1080;
  const BASE_H = 1350;
  const W = BASE_W * scale;
  const H = BASE_H * scale;
  const themeColors = getThemeColors(theme);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // 1. Background + Technical Grid
  drawCinematicBackground(ctx, BASE_W, BASE_H, true, themeColors);

  // 2. Load Assets
  const [photo, logo247, hindiMark] = await Promise.all([
    loadImage(imageSrc),
    getAsset("2-47.svg"),
    getAsset("goa_hindi.svg"),
  ]);

  drawScatteredGoaHindi(ctx, BASE_W, BASE_H, hindiMark);

  // 3. Asymmetric Photo Block
  const photoW = 740;
  const photoH = 880;
  const photoX = 60;
  const photoY = 160;

  // Hard drop shadow
  ctx.fillStyle = themeColors.ink;
  ctx.fillRect(photoX + 30, photoY + 30, photoW, photoH);

  // Thick Frame
  ctx.fillStyle = themeColors.yellow;
  ctx.fillRect(photoX - 8, photoY - 8, photoW + 16, photoH + 16);

  drawCoverImage(ctx, photo, photoX, photoY, photoW, photoH, isFlipped);
  applyPhotoFilter(ctx, photoX, photoY, photoW, photoH, filter, themeColors);

  // Crosshairs on photo corners
  drawCrosshair(ctx, photoX, photoY, themeColors.pink, 20);
  drawCrosshair(ctx, photoX + photoW, photoY + photoH, themeColors.pink, 20);

  // 4. Data Overlays
  drawDataTag(ctx, `@${username.trim() || "builder"}`, photoX - 20, photoY - 20, themeColors.pink, themeColors);

  if (badgeText) {
    drawStickerBadge(ctx, badgeText, photoX + photoW - 20, photoY + 60, 15, themeColors);
  }

  // 5. Editorial Typography
  const displayRealName = (realFullName.trim() || "BUILDER").toUpperCase();
  ctx.textAlign = "right";

  ctx.fillStyle = themeColors.white;
  let nameFontSize = 140;
  ctx.font = `900 ${nameFontSize}px 'Bodoni Moda', serif`;

  while (ctx.measureText(displayRealName).width > BASE_W - 120 && nameFontSize > 40) {
    nameFontSize -= 4;
    ctx.font = `900 ${nameFontSize}px 'Bodoni Moda', serif`;
  }

  ctx.shadowColor = themeColors.ink;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.shadowBlur = 0;

  ctx.fillText(displayRealName, BASE_W - 40, photoY + photoH + 60);
  ctx.shadowColor = "transparent";

  // Role and Title Technical Blocks
  const textLeft = photoX;
  const textTop = photoY + photoH + 140;

  ctx.textAlign = "left";

  if (role) {
    ctx.font = "800 48px 'Space Grotesk', sans-serif";
    ctx.fillStyle = themeColors.yellow;
    ctx.fillText(role.toUpperCase(), textLeft, textTop);
  }

  if (builderTitle) {
    ctx.font = "40px 'VT323', monospace";
    ctx.fillStyle = themeColors.pink;
    ctx.fillText(`< ${builderTitle} >`, textLeft, textTop + 60);
  }

  // 6. Structured Footer
  const footerH = 180;
  ctx.fillStyle = themeColors.ink;
  ctx.fillRect(0, BASE_H - footerH, BASE_W, footerH);

  // Row 1
  const fontSize = 84;
  const row1Y = BASE_H - 110;
  const wmWidth = drawHackerHouseWordmark(ctx, 40, row1Y, fontSize, themeColors);

  const hmHeight = 94.5;
  const hmWidth = (hmHeight / hindiMark.height) * hindiMark.width;
  ctx.drawImage(hindiMark, 40 + wmWidth + 30, row1Y - hmHeight / 2, hmWidth, hmHeight);

  // Row 2
  ctx.textAlign = "right";
  ctx.font = "32px 'VT323', monospace";
  ctx.fillStyle = themeColors.yellow;
  ctx.fillText(STRINGS.date, BASE_W - 40, BASE_H - 40);

  // 2:47 logo in top right
  const logoW = 100;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, BASE_W - logoW - 40, 40, logoW, logoH);

  return canvas;
}

// ============================================================
// Format C: Team Frame (1080x1350)
// ============================================================
export async function renderTeamFrame(
  imageSrcs: string[],
  teamName: string,
  filter: PhotoFilter = "none",
  badgeText = "",
  theme: CardTheme = "forest",
  isFlipped = false,
  scale = 1
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();
  const BASE_W = 1080;
  const BASE_H = 1350;
  const W = BASE_W * scale;
  const H = BASE_H * scale;
  const themeColors = getThemeColors(theme);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  drawCinematicBackground(ctx, BASE_W, BASE_H, true, themeColors);

  const [logo247, hindiMark] = await Promise.all([
    getAsset("2-47.svg"),
    getAsset("goa_hindi.svg"),
  ]);

  drawScatteredGoaHindi(ctx, BASE_W, BASE_H, hindiMark);

  // 1. Massive Movie Poster Typography
  const displayName = (teamName.trim() || "SQUAD ZERO").toUpperCase();
  ctx.fillStyle = themeColors.yellow;
  ctx.textAlign = "center";

  let nameFontSize = 180;
  ctx.font = `900 ${nameFontSize}px 'Bodoni Moda', serif`;

  while (ctx.measureText(displayName).width > BASE_W - 80 && nameFontSize > 60) {
    nameFontSize -= 4;
    ctx.font = `900 ${nameFontSize}px 'Bodoni Moda', serif`;
  }

  ctx.shadowColor = themeColors.ink;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.fillText(displayName, BASE_W / 2, 220);
  ctx.shadowColor = "transparent";

  // Pink underline/accent
  ctx.fillStyle = themeColors.pink;
  ctx.fillRect(BASE_W / 2 - 150, 260, 300, 8);

  // 2. Dynamic Photo Cluster
  const photos = await Promise.all(imageSrcs.map((src) => loadImage(src)));
  const count = imageSrcs.length;

  const clusterY = 320;
  const clusterH = 780;
  const clusterW = BASE_W - 160;
  const clusterX = 80;

  // Drop shadow
  ctx.fillStyle = themeColors.ink;
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 15;
  ctx.shadowOffsetY = 15;
  ctx.fillRect(clusterX, clusterY, clusterW, clusterH);
  ctx.shadowColor = "transparent";

  // Inner frame
  ctx.fillStyle = themeColors.yellow;
  ctx.fillRect(clusterX - 8, clusterY - 8, clusterW + 16, clusterH + 16);

  const gap = 16;

  if (count === 1) {
    drawCoverImage(ctx, photos[0], clusterX, clusterY, clusterW, clusterH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY, clusterW, clusterH, filter, themeColors);
  } else if (count === 2) {
    const halfH = (clusterH - gap) / 2;
    drawCoverImage(ctx, photos[0], clusterX, clusterY, clusterW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY, clusterW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[1], clusterX, clusterY + halfH + gap, clusterW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY + halfH + gap, clusterW, halfH, filter, themeColors);
  } else if (count === 3) {
    const halfW = (clusterW - gap) / 2;
    const halfH = (clusterH - gap) / 2;
    drawCoverImage(ctx, photos[0], clusterX, clusterY, clusterW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY, clusterW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[1], clusterX, clusterY + halfH + gap, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY + halfH + gap, halfW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[2], clusterX + halfW + gap, clusterY + halfH + gap, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX + halfW + gap, clusterY + halfH + gap, halfW, halfH, filter, themeColors);
  } else {
    // 2x2 grid
    const halfW = (clusterW - gap) / 2;
    const halfH = (clusterH - gap) / 2;
    drawCoverImage(ctx, photos[0], clusterX, clusterY, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY, halfW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[1], clusterX + halfW + gap, clusterY, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX + halfW + gap, clusterY, halfW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[2], clusterX, clusterY + halfH + gap, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX, clusterY + halfH + gap, halfW, halfH, filter, themeColors);

    drawCoverImage(ctx, photos[3], clusterX + halfW + gap, clusterY + halfH + gap, halfW, halfH, isFlipped);
    applyPhotoFilter(ctx, clusterX + halfW + gap, clusterY + halfH + gap, halfW, halfH, filter, themeColors);
  }

  // Crosshairs for cluster
  drawCrosshair(ctx, clusterX, clusterY, themeColors.pink, 20);
  drawCrosshair(ctx, clusterX + clusterW, clusterY + clusterH, themeColors.pink, 20);

  if (badgeText) {
    drawStickerBadge(ctx, badgeText, clusterX + clusterW - 40, clusterY + clusterH + 40, -10, themeColors);
  }

  // Top right logo
  const logoW = 100;
  const logoH = (logoW / logo247.width) * logo247.height;
  ctx.drawImage(logo247, BASE_W - logoW - 40, 40, logoW, logoH);

  // 3. Structured Footer
  const footerH = 200;
  ctx.fillStyle = themeColors.ink;
  ctx.fillRect(0, BASE_H - footerH, BASE_W, footerH);

  // Row 1
  const fontSize = 100;
  const row1Y = BASE_H - 120;
  const wmWidth = drawHackerHouseWordmark(ctx, 40, row1Y, fontSize, themeColors);

  const hmHeight = 112.5;
  const hmWidth = (hmHeight / hindiMark.height) * hindiMark.width;
  ctx.drawImage(hindiMark, 40 + wmWidth + 40, row1Y - hmHeight / 2, hmWidth, hmHeight);

  // Row 2
  ctx.textAlign = "right";
  ctx.font = "32px 'VT323', monospace";
  ctx.fillStyle = themeColors.yellow;
  ctx.fillText(STRINGS.date, BASE_W - 40, BASE_H - 45);

  return canvas;
}

