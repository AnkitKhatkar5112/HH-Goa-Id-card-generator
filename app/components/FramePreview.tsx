"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { renderPfpFrame, renderIdCard, renderTeamFrame, PhotoFilter } from "../lib/frameRenderer";
import { canvasToBlob, downloadBlob, triggerConfetti } from "../lib/imageUtils";
import { playClickSound, playSuccessChime, playCameraShutterSound } from "../lib/audioUtils";
import {
  uploadToCloudinary,
  encodeShareId,
  buildXIntentUrl,
  getBaseUrl,
} from "../lib/shareUtils";

interface FramePreviewProps {
  imageSrcs: string[];
  mode: "frame" | "card" | "team";
  username: string;
  realFullName: string;
  role: string;
  builderTitle: string;
  teamName?: string;
  filter?: PhotoFilter;
  badge?: string;
}

export default function FramePreview({
  imageSrcs,
  mode,
  username,
  realFullName,
  role,
  builderTitle,
  teamName = "SQUAD ZERO",
  filter = "none",
  badge = "",
}: FramePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render the frame/card on mount & when props change
  useEffect(() => {
    if (!imageSrcs || imageSrcs.length === 0) return;

    let cancelled = false;

    const render = async () => {
      setIsRendering(true);
      try {
        let result: HTMLCanvasElement;

        if (mode === "frame") {
          result = await renderPfpFrame(imageSrcs[0], filter, badge);
        } else if (mode === "card") {
          result = await renderIdCard(imageSrcs[0], username, realFullName, role, builderTitle, filter, badge);
        } else {
          result = await renderTeamFrame(imageSrcs, teamName, filter, badge);
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
  }, [imageSrcs, mode, username, realFullName, role, builderTitle, teamName, filter, badge]);

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();

    const blob = await canvasToBlob(renderedCanvas);
    let filename = "hh-goa-2026-frame.png";
    if (mode === "card") filename = "hh-goa-2026-builder-id.png";
    if (mode === "team") filename = "hh-goa-2026-team-frame.png";

    downloadBlob(blob, filename);
    playCameraShutterSound();
    playSuccessChime();
    triggerConfetti();

    // POST real insight to Live Radar
    try {
      let actionText = "downloaded graphic";
      let badgeText = "📸 PFP";
      if (mode === "card") { actionText = "generated Builder ID"; badgeText = "🪪 ID"; }
      else if (mode === "team") { actionText = "created squad pass"; badgeText = "🧑‍🤝‍🧑 TEAM"; }

      await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username ? `@${username.replace('@', '')}` : "@builder",
          action: actionText,
          badge: badgeText,
          title: builderTitle || role || "Early Adopter",
        }),
      });
    } catch (err) {
      console.error("Failed to post radar log", err);
    }
  }, [renderedCanvas, mode, username, builderTitle, role]);

  // Copy to Clipboard handler
  const handleCopy = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();

    try {
      const blob = await canvasToBlob(renderedCanvas);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopiedStatus(true);
        playCameraShutterSound();
        playSuccessChime();
        triggerConfetti();
        setTimeout(() => setCopiedStatus(false), 2500);
      } else {
        setShareStatus("Clipboard copy not supported on this browser.");
      }
    } catch {
      setShareStatus("Could not copy to clipboard.");
    }
  }, [renderedCanvas]);

  // Share to X handler
  const handleShareToX = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();

    setIsSharing(true);
    setShareStatus("Uploading graphics to cloud...");

    try {
      const blob = await canvasToBlob(renderedCanvas);
      const imageUrl = await uploadToCloudinary(blob);

      const shareId = encodeShareId(imageUrl, mode);
      const baseUrl = getBaseUrl();
      const sharePageUrl = `${baseUrl}/share/${shareId}`;

      const intentUrl = buildXIntentUrl(sharePageUrl, mode);

      setShareStatus("");
      playSuccessChime();
      triggerConfetti();

      window.open(intentUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Share failed:", err);
      setShareStatus("Cloud upload failed — use Download instead!");
    } finally {
      setIsSharing(false);
    }
  }, [renderedCanvas, mode]);

  return (
    <div className="preview-section fade-in-up">
      {/* Canvas Header Tag */}
      <div className="preview-card-header">
        <span className="live-pill">● LIVE ENGINE PREVIEW</span>
        <button
          type="button"
          className="zoom-btn"
          onClick={() => {
            playClickSound();
            setIsFullscreen(true);
          }}
          title="Fullscreen view"
        >
          🔍 Expand
        </button>
      </div>

      {/* Canvas preview wrap */}
      <div
        className="preview-canvas-wrap"
        onClick={() => setIsFullscreen(true)}
        role="button"
        tabIndex={0}
        aria-label="Click to enlarge preview"
      >
        {isRendering && (
          <div className="shimmer" style={{ aspectRatio: mode === "frame" ? "1/1" : "4/5" }} />
        )}
        <canvas
          ref={canvasRef}
          style={{ display: isRendering ? "none" : "block" }}
          id="preview-canvas"
        />
        {!isRendering && <div className="hover-zoom-badge">Tap to inspect HD</div>}
      </div>

      {/* Status Toasts */}
      {shareStatus && <div className="status-toast" style={{ marginTop: "var(--space-3)" }}>{shareStatus}</div>}
      {copiedStatus && <div className="status-toast status-toast--success" style={{ marginTop: "var(--space-3)" }}>✓ Copied high-res image to clipboard!</div>}

      {/* Action buttons */}
      <div className="actions actions--column">
        <button
          className="btn btn--primary btn--full btn--lg glow-pulse"
          onClick={handleDownload}
          disabled={isRendering || !renderedCanvas}
          id="download-btn"
        >
          📥 Download High-Res Badge
        </button>

        <div className="actions--row">
          <button
            className="btn btn--secondary btn--full"
            onClick={handleShareToX}
            disabled={isRendering || isSharing || !renderedCanvas}
            id="share-x-btn"
          >
            {isSharing ? "Uploading…" : "𝕏 Post to Twitter"}
          </button>

          <button
            className="btn btn--ghost btn--full"
            onClick={handleCopy}
            disabled={isRendering || !renderedCanvas}
            id="copy-btn"
          >
            {copiedStatus ? "✓ Copied" : "📋 Copy Image"}
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="modal-backdrop" onClick={() => setIsFullscreen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsFullscreen(false)}>
              ✕
            </button>
            <div className="modal-canvas-holder">
              <canvas
                ref={(node) => {
                  if (node && renderedCanvas) {
                    node.width = renderedCanvas.width;
                    node.height = renderedCanvas.height;
                    const ctx = node.getContext("2d");
                    ctx?.drawImage(renderedCanvas, 0, 0);
                  }
                }}
              />
            </div>
            <p className="modal-caption">HH Goa 2026 — 1080p Master Graphic</p>
          </div>
        </div>
      )}
    </div>
  );
}
