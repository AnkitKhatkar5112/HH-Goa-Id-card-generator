"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { renderPfpFrame, renderIdCard, renderTeamFrame, PhotoFilter, CardTheme } from "../lib/frameRenderer";
import { canvasToBlob, downloadBlob, triggerConfetti } from "../lib/imageUtils";
import { playClickSound, playSuccessChime, playCameraShutterSound } from "../lib/audioUtils";
import {
  uploadToCloudinary,
  encodeShareId,
  buildXIntentUrl,
  buildWhatsAppIntentUrl,
  buildLinkedInIntentUrl,
  buildTelegramIntentUrl,
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
  cardTheme?: CardTheme;
  isFlipped?: boolean;
  exportScale: number;
  setExportScale: (s: number) => void;
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
  cardTheme = "forest",
  isFlipped = false,
  exportScale = 1,
  setExportScale,
}: FramePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isXModalOpen, setIsXModalOpen] = useState(false);
  const [tweetCopied, setTweetCopied] = useState(false);

  // 3D Tilt Sheen Mouse Movements
  const handleMouseMoveWrap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 24;
    const rotateX = (0.5 - py) * 24;

    wrap.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
    wrap.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
    wrap.style.setProperty("--sheen-x", `${(px * 100).toFixed(1)}%`);
    wrap.style.setProperty("--sheen-y", `${(py * 100).toFixed(1)}%`);
  }, []);

  const handleMouseLeaveWrap = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.style.setProperty("--tilt-rx", "0deg");
    wrap.style.setProperty("--tilt-ry", "0deg");
    wrap.style.setProperty("--sheen-x", "50%");
    wrap.style.setProperty("--sheen-y", "50%");
  }, []);

  // Render the frame/card on mount & when props change
  useEffect(() => {
    if (!imageSrcs || imageSrcs.length === 0) return;

    let cancelled = false;

    const render = async () => {
      setIsRendering(true);
      try {
        let result: HTMLCanvasElement;

        if (mode === "frame") {
          result = await renderPfpFrame(imageSrcs[0], filter, badge, cardTheme, isFlipped, exportScale);
        } else if (mode === "card") {
          result = await renderIdCard(imageSrcs[0], username, realFullName, role, builderTitle, filter, badge, cardTheme, isFlipped, exportScale);
        } else {
          result = await renderTeamFrame(imageSrcs, teamName, filter, badge, cardTheme, isFlipped, exportScale);
        }

        if (cancelled) return;

        setRenderedCanvas(result);

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
  }, [imageSrcs, mode, username, realFullName, role, builderTitle, teamName, filter, badge, cardTheme, isFlipped, exportScale]);

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();

    const blob = await canvasToBlob(renderedCanvas);
    let filename = exportScale > 1 ? "hh-goa-2026-frame-4K.png" : "hh-goa-2026-frame.png";
    if (mode === "card") filename = exportScale > 1 ? "hh-goa-2026-builder-id-4K.png" : "hh-goa-2026-builder-id.png";
    if (mode === "team") filename = exportScale > 1 ? "hh-goa-2026-team-frame-4K.png" : "hh-goa-2026-team-frame.png";

    downloadBlob(blob, filename);
    playCameraShutterSound();
    playSuccessChime();
    triggerConfetti();

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
  }, [renderedCanvas, mode, username, builderTitle, role, exportScale]);

  // Copy Image to Clipboard handler
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

  // Open Multi-Platform Share Modal
  const handleOpenXModal = () => {
    playClickSound();
    setIsXModalOpen(true);
  };

  // Compose Tweet draft
  const getTweetDraftText = useCallback(() => {
    const handle = username ? `@${username.replace("@", "")}` : "Builder";
    if (mode === "card") {
      return `Building at Hacker House Goa 2026 🌴\nCheck out my official Builder ID Pass! ${builderTitle ? `"${builderTitle}"` : ""}\n\nSee you at Baga Beach 🚀 #HHGoa2026 #FrameInGoa`;
    }
    if (mode === "team") {
      return `Our squad "${teamName}" is locked in for Hacker House Goa 2026 🌴🔥\n\n#HHGoa2026 #FrameInGoa`;
    }
    return `Framed for Hacker House Goa 2026! 🌴\nClaim your Builder Pass & PFP at ${handle} #HHGoa2026 #FrameInGoa`;
  }, [username, mode, builderTitle, teamName]);

  const handleCopyTweetText = async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(`${getTweetDraftText()}\n${getBaseUrl()}`);
      setTweetCopied(true);
      playSuccessChime();
      setTimeout(() => setTweetCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // 𝕏 Twitter Launch
  const handleLaunchXIntent = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();
    setIsSharing(true);
    setShareStatus("Preparing share link...");

    try {
      let imageUrl = "";
      try {
        const blob = await canvasToBlob(renderedCanvas);
        imageUrl = await uploadToCloudinary(blob);
      } catch {
        // Fallback without Cloudinary
      }

      let sharePageUrl = getBaseUrl();
      if (imageUrl && !imageUrl.startsWith("blob:")) {
        const shareId = encodeShareId(imageUrl, mode);
        sharePageUrl = `${getBaseUrl()}/share/${shareId}`;
      }

      const intentUrl = buildXIntentUrl(sharePageUrl, mode);
      setShareStatus("");
      playSuccessChime();
      triggerConfetti();

      window.open(intentUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Share failed:", err);
      const text = encodeURIComponent(`${getTweetDraftText()}\n${getBaseUrl()}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
    } finally {
      setIsSharing(false);
    }
  }, [renderedCanvas, mode, getTweetDraftText]);

  // WhatsApp Launch
  const handleLaunchWhatsApp = useCallback(async () => {
    playClickSound();
    const text = getTweetDraftText();
    const url = buildWhatsAppIntentUrl(text, getBaseUrl());
    window.open(url, "_blank", "noopener,noreferrer");
  }, [getTweetDraftText]);

  // LinkedIn Launch
  const handleLaunchLinkedIn = useCallback(() => {
    playClickSound();
    const url = buildLinkedInIntentUrl(getBaseUrl());
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Telegram Launch
  const handleLaunchTelegram = useCallback(() => {
    playClickSound();
    const text = getTweetDraftText();
    const url = buildTelegramIntentUrl(text, getBaseUrl());
    window.open(url, "_blank", "noopener,noreferrer");
  }, [getTweetDraftText]);

  // Native Device File Share API (opens native Share Drawer with PNG attached!)
  const handleNativeShareFile = useCallback(async () => {
    if (!renderedCanvas) return;
    playClickSound();

    try {
      const blob = await canvasToBlob(renderedCanvas);
      const file = new File([blob], `hh-goa-2026-${mode}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Hacker House Goa 2026 Graphic",
          text: getTweetDraftText(),
          url: getBaseUrl(),
          files: [file],
        });
        playSuccessChime();
        triggerConfetti();
      } else if (navigator.share) {
        await navigator.share({
          title: "Hacker House Goa 2026 Graphic",
          text: `${getTweetDraftText()}\n${getBaseUrl()}`,
        });
        playSuccessChime();
      } else {
        setShareStatus("Native share drawer not supported on this browser.");
      }
    } catch (err) {
      console.warn("Native share cancelled or failed:", err);
    }
  }, [renderedCanvas, mode, getTweetDraftText]);

  return (
    <div className="preview-section fade-in-up">
      {/* Canvas Header Bar with 1x / 2x Resolution & Expand */}
      <div className="preview-card-header">
        <span className="live-pill">● LIVE 3D ENGINE PREVIEW</span>

        <div className="preview-header-controls">
          <div className="scale-toggle">
            <button
              type="button"
              className={`scale-btn ${exportScale === 1 ? "scale-btn--active" : ""}`}
              onClick={() => {
                playClickSound();
                setExportScale(1);
              }}
            >
              1x 1080p
            </button>
            <button
              type="button"
              className={`scale-btn ${exportScale === 2 ? "scale-btn--active" : ""}`}
              onClick={() => {
                playClickSound();
                setExportScale(2);
              }}
            >
              2x 4K HD
            </button>
          </div>

          <button
            type="button"
            className="zoom-btn"
            onClick={() => {
              playClickSound();
              setIsFullscreen(true);
            }}
            title="Fullscreen view"
          >
            🔍 Inspect
          </button>
        </div>
      </div>

      {/* 3D Holographic Canvas wrap */}
      <div
        ref={wrapRef}
        className="preview-canvas-wrap preview-canvas-wrap--3d"
        onMouseMove={handleMouseMoveWrap}
        onMouseLeave={handleMouseLeaveWrap}
        onClick={() => setIsFullscreen(true)}
        role="button"
        tabIndex={0}
        aria-label="Click to enlarge preview"
      >
        <div className="hologram-sheen" aria-hidden="true" />
        {isRendering && (
          <div className="shimmer" style={{ aspectRatio: mode === "frame" ? "1/1" : "4/5" }} />
        )}
        <canvas
          ref={canvasRef}
          style={{ display: isRendering ? "none" : "block" }}
          id="preview-canvas"
        />
        {!isRendering && <div className="hover-zoom-badge">Move cursor for 3D hologram tilt</div>}
      </div>

      {/* Status Toasts */}
      {shareStatus && <div className="status-toast" style={{ marginTop: "var(--space-3)" }}>{shareStatus}</div>}
      {copiedStatus && <div className="status-toast status-toast--success" style={{ marginTop: "var(--space-3)" }}>✓ Copied high-res graphic to clipboard!</div>}

      {/* Action buttons */}
      <div className="actions actions--column">
        <button
          className="btn btn--primary btn--full btn--lg glow-pulse"
          onClick={handleDownload}
          disabled={isRendering || !renderedCanvas}
          id="download-btn"
        >
          📥 Download {exportScale > 1 ? "Ultra 4K HD" : "1080p"} Badge
        </button>

        <div className="actions--row">
          <button
            className="btn btn--secondary btn--full"
            onClick={handleOpenXModal}
            disabled={isRendering || !renderedCanvas}
            id="share-x-btn"
          >
            🚀 Share & Flex Identity
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
            <p className="modal-caption">
              HH Goa 2026 — {exportScale > 1 ? "4K Ultra HD (2160p)" : "1080p Master Graphic"}
            </p>
          </div>
        </div>
      )}

      {/* Multi-Platform Share Modal */}
      {isXModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsXModalOpen(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsXModalOpen(false)} type="button">
              ✕
            </button>
            <h4 className="share-modal__title">🌴 Share Your Goa Builder Pass</h4>
            <p className="share-modal__sub">Post your graphic directly to Twitter/X, WhatsApp, LinkedIn, or open native share drawer!</p>

            {/* Primary Feature: X (Twitter) Post */}
            <div className="share-hero-box">
              <div className="share-hero-badge">FEATURED // 𝕏 TWITTER</div>
              <div className="tweet-preview-box">
                <p className="tweet-preview-text">{getTweetDraftText()}</p>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--full glow-pulse"
                onClick={handleLaunchXIntent}
                disabled={isSharing}
              >
                {isSharing ? "Publishing..." : "𝕏 Post to Twitter / X ↗"}
              </button>
            </div>

            {/* Native Device Share Sheet (WhatsApp, IG Stories, iMessage, AirDrop) */}
            {typeof navigator !== "undefined" && (
              <button
                type="button"
                className="btn btn--secondary btn--full"
                style={{ marginTop: "var(--space-3)" }}
                onClick={handleNativeShareFile}
              >
                📲 Share Image File to Any App (WhatsApp, IG, iMessage)
              </button>
            )}

            {/* Multi-Platform Apps Grid */}
            <div className="share-apps-grid" style={{ marginTop: "var(--space-4)" }}>
              <button
                type="button"
                className="share-app-btn share-app-btn--whatsapp"
                onClick={handleLaunchWhatsApp}
              >
                💬 WhatsApp
              </button>

              <button
                type="button"
                className="share-app-btn share-app-btn--linkedin"
                onClick={handleLaunchLinkedIn}
              >
                💼 LinkedIn
              </button>

              <button
                type="button"
                className="share-app-btn share-app-btn--telegram"
                onClick={handleLaunchTelegram}
              >
                ✈️ Telegram
              </button>

              <button
                type="button"
                className="share-app-btn share-app-btn--copy"
                onClick={handleCopyTweetText}
              >
                {tweetCopied ? "✓ Copied" : "📋 Copy Link & Text"}
              </button>
            </div>

            {tweetCopied && <div className="status-toast status-toast--success" style={{ marginTop: "var(--space-3)" }}>✓ Post text & link copied to clipboard!</div>}
          </div>
        </div>
      )}
    </div>
  );
}


