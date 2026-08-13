/**
 * Image processing utilities — client-side
 * Handles HEIC conversion, resize, and canvas operations
 */

const MAX_DIMENSION = 2048;
const MIN_DIMENSION = 100;

/**
 * Detect if a file is HEIC/HEIF format
 */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Convert HEIC file to PNG blob (dynamic import to avoid bundle bloat)
 */
export async function convertHeicToBlob(file: File): Promise<Blob> {
  const { heicTo } = await import("heic-to");
  const pngBlob = await heicTo({
    blob: file,
    type: "image/png",
    quality: 0.9,
  });
  return pngBlob as Blob;
}

/**
 * Load an image from a Blob/File and return an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Resize image if it exceeds MAX_DIMENSION on either side.
 * Returns a blob URL of the resized image.
 */
export async function processUploadedFile(file: File): Promise<{
  objectUrl: string;
  width: number;
  height: number;
  wasHeic: boolean;
  tooSmall: boolean;
}> {
  let blob: Blob = file;
  let wasHeic = false;

  // Convert HEIC if needed
  if (isHeicFile(file)) {
    blob = await convertHeicToBlob(file);
    wasHeic = true;
  }

  const url = URL.createObjectURL(blob);
  const img = await loadImage(url);
  let { naturalWidth: w, naturalHeight: h } = img;

  const tooSmall = w < MIN_DIMENSION || h < MIN_DIMENSION;

  // Resize if too large
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(w, h);
    const newW = Math.round(w * scale);
    const newH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, newW, newH);

    URL.revokeObjectURL(url);

    const resizedBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png", 0.92);
    });

    const resizedUrl = URL.createObjectURL(resizedBlob);
    w = newW;
    h = newH;

    return { objectUrl: resizedUrl, width: w, height: h, wasHeic, tooSmall };
  }

  return { objectUrl: url, width: w, height: h, wasHeic, tooSmall };
}

/**
 * Get cropped image data from react-easy-crop's pixel crop area
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputSize: { width: number; height: number } = { width: 1080, height: 1080 }
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize.width,
    outputSize.height
  );

  return canvas;
}

/**
 * Canvas to downloadable blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

/**
 * Trigger download of a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/**
 * Trigger lightweight cyber-tropical confetti burst effect on screen
 */
export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#F5D300", "#FF2E93", "#0F3D2E", "#0B2A1F", "#F7F5EF"];
  const particles: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    color: string;
    rot: number;
    vRot: number;
    alpha: number;
  }> = [];

  for (let i = 0; i < 75; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 100,
      w: Math.random() * 12 + 6,
      h: Math.random() * 8 + 4,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 20 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      alpha: 1,
    });
  }

  let animationId: number;
  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rot += p.vRot;
      if (elapsed > 1000) {
        p.alpha -= 0.03;
      }

      if (p.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (elapsed < 2500) {
      animationId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  render();
}

