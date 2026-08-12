"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { renderPfpFrame, renderIdCard, renderTeamFrame } from "../lib/frameRenderer";
import { canvasToBlob, downloadBlob } from "../lib/imageUtils";
import {
  uploadToCloudinary,
  encodeShareId,
  buildXIntentUrl,
  getBaseUrl,
} from "../lib/shareUtils";

interface FramePreviewProps {
  imageSrcs: string[];
  mode: "frame" | "card" | "team";
  name: string;
  stack: string;
  builderTitle: string;
}

export default function FramePreview({
  imageSrcs,
  mode,
  name,
  stack,
  builderTitle,
}: FramePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  // Render the frame/card on mount
  useEffect(() => {
    if (!imageSrcs || imageSrcs.length === 0) return;

    let cancelled = false;

    const render = async () => {
      setIsRendering(true);
      try {
        let result: HTMLCanvasElement;

        if (mode === "frame") {
          result = await renderPfpFrame(imageSrcs[0]);
        } else if (mode === "card") {
          result = await renderIdCard(imageSrcs[0], name, stack, builderTitle);
        } else {
          result = await renderTeamFrame(imageSrcs);
        }

        if (cancelled) return;

        setRenderedCanvas(result);

        // Draw onto the visible canvas
        if (canvasRef.current) {
          canvasRef.current.width = result.width;
          canvasRef.current.height = result.height;
          const ctx = canvasRef.current.getContext("2d")!;
          ctx.drawImage(result, 0, 0);
        }
      } catch (err) {
        console.error("Render failed:", err);
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [imageSrcs, mode, name, stack, builderTitle]);

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!renderedCanvas) return;

    const blob = await canvasToBlob(renderedCanvas);
    let filename = "hh-goa-2026-frame.png";
    if (mode === "card") filename = "hh-goa-2026-builder-id.png";
    if (mode === "team") filename = "hh-goa-2026-team-frame.png";
    
    downloadBlob(blob, filename);
  }, [renderedCanvas, mode]);

  // Share to X handler
  const handleShareToX = useCallback(async () => {
    if (!renderedCanvas) return;

    setIsSharing(true);
    setShareStatus("Uploading image…");

    try {
      const blob = await canvasToBlob(renderedCanvas);
      const imageUrl = await uploadToCloudinary(blob);

      // Build share page URL
      const shareId = encodeShareId(imageUrl, mode);
      const baseUrl = getBaseUrl();
      const sharePageUrl = `${baseUrl}/share/${shareId}`;

      // Build X intent
      const intentUrl = buildXIntentUrl(sharePageUrl, mode);

      setShareStatus("");

      // Open X intent
      window.open(intentUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Share failed:", err);
      setShareStatus("Upload failed — try downloading instead");
    } finally {
      setIsSharing(false);
    }
  }, [renderedCanvas, mode]);

  return (
    <div className="preview-section">
      {/* Canvas preview */}
      <div className="preview-canvas-wrap">
        {isRendering && (
          <div className="shimmer" style={{ aspectRatio: mode === "frame" ? "1/1" : "4/5" }} />
        )}
        <canvas
          ref={canvasRef}
          style={{ display: isRendering ? "none" : "block" }}
          id="preview-canvas"
        />
      </div>

      {/* Share status */}
      {shareStatus && <div className="status-toast" style={{ marginTop: "var(--space-4)" }}>{shareStatus}</div>}

      {/* Action buttons */}
      <div className="actions actions--row">
        <button
          className="btn btn--full"
          onClick={handleDownload}
          disabled={isRendering || !renderedCanvas}
          id="download-btn"
        >
          📥 Download
        </button>

        <button
          className="btn btn--secondary btn--full"
          onClick={handleShareToX}
          disabled={isRendering || isSharing || !renderedCanvas}
          id="share-x-btn"
        >
          {isSharing ? "Uploading…" : "𝕏 Share"}
        </button>
      </div>
    </div>
  );
}
