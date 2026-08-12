"use client";

import { useState, useCallback } from "react";
import UploadZone from "./components/UploadZone";
import FramePreview from "./components/FramePreview";
import IdCardForm from "./components/IdCardForm";
import { processUploadedFile } from "./lib/imageUtils";

type Mode = "frame" | "card" | "team";
type Step = "upload" | "preview";

export default function Home() {
  const [mode, setMode] = useState<Mode>("frame");
  const [step, setStep] = useState<Step>("upload");
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ID Card fields
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [builderTitle, setBuilderTitle] = useState("");

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setStatusMsg("");

    try {
      const urls: string[] = [];
      let hadHeic = false;
      let hadSmall = false;

      // Process max 4 images for team mode, 1 for others
      const filesToProcess = mode === "team" ? files.slice(0, 4) : [files[0]];

      for (const file of filesToProcess) {
        if (!file) continue;
        const result = await processUploadedFile(file);
        if (result.wasHeic) hadHeic = true;
        if (result.tooSmall) hadSmall = true;
        urls.push(result.objectUrl);
      }

      if (hadHeic) {
        setStatusMsg("HEIC converted ✓");
      }
      if (hadSmall) {
        setStatusMsg((prev) =>
          prev ? `${prev} · Low-res photo(s) — quality may be limited` : "Low-res photo(s) — quality may be limited"
        );
      }

      setImageSrcs(urls);
      setStep("preview");
    } catch (err) {
      console.error("Failed to process images:", err);
      setStatusMsg("Failed to process image(s). Try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [mode]);

  const handleReset = useCallback(() => {
    imageSrcs.forEach(url => URL.revokeObjectURL(url));
    setImageSrcs([]);
    setStep("upload");
    setStatusMsg("");
    setName("");
    setStack("");
    setBuilderTitle("");
  }, [imageSrcs]);

  const handleModeSwitch = useCallback((newMode: Mode) => {
    setMode(newMode);
    if (step === "preview") {
      // If switching out of team mode with multiple photos, just keep the first one
      if (newMode !== "team" && imageSrcs.length > 1) {
        const toKeep = imageSrcs[0];
        const toRevoke = imageSrcs.slice(1);
        toRevoke.forEach(url => URL.revokeObjectURL(url));
        setImageSrcs([toKeep]);
      }
      // If switching to team mode and we have 1 photo, we can stay in preview
    }
  }, [step, imageSrcs]);

  return (
    <main className="app-shell">
      {/* Brand Header */}
      <header className="brand-header">
        <h1 className="brand-wordmark">HH Goa 2026</h1>
        <p className="brand-tagline">$ frame_your_vibe</p>
      </header>

      {/* Format Toggle */}
      <div className="format-toggle" role="tablist" aria-label="Format selection">
        <button
          className={`format-toggle__btn ${mode === "frame" ? "format-toggle__btn--active" : ""}`}
          onClick={() => handleModeSwitch("frame")}
          role="tab"
          aria-selected={mode === "frame"}
          id="tab-frame"
        >
          PFP Frame
        </button>
        <button
          className={`format-toggle__btn ${mode === "card" ? "format-toggle__btn--active" : ""}`}
          onClick={() => handleModeSwitch("card")}
          role="tab"
          aria-selected={mode === "card"}
          id="tab-card"
        >
          Builder ID
        </button>
        <button
          className={`format-toggle__btn ${mode === "team" ? "format-toggle__btn--active" : ""}`}
          onClick={() => handleModeSwitch("team")}
          role="tab"
          aria-selected={mode === "team"}
          id="tab-team"
        >
          Team Frame
        </button>
      </div>

      <div className="deco-line" />

      {/* Status Message */}
      {statusMsg && <div className="status-toast">{statusMsg}</div>}

      {/* Processing Shimmer */}
      {isProcessing && (
        <div className="shimmer" style={{ height: 200, marginBottom: "var(--space-4)" }} />
      )}

      {/* Step: Upload */}
      {step === "upload" && !isProcessing && (
        <div className="fade-in-up">
          <UploadZone 
            onFilesSelected={handleFilesSelected} 
            multiple={mode === "team"} 
          />
        </div>
      )}

      {/* Step: Preview / Form */}
      {step === "preview" && imageSrcs.length > 0 && (
        <div className="fade-in-up">
          <div className="top-bar">
            <button className="back-btn" onClick={handleReset} aria-label="Start over">
              ← Start over
            </button>
          </div>

          <FramePreview
            imageSrcs={imageSrcs}
            mode={mode}
            name={name}
            stack={stack}
            builderTitle={builderTitle}
          />

          {/* ID Card form (only in card mode) */}
          {mode === "card" && (
            <div style={{ marginTop: "var(--space-6)" }}>
              <IdCardForm
                name={name}
                setName={setName}
                stack={stack}
                setStack={setStack}
                builderTitle={builderTitle}
                setBuilderTitle={setBuilderTitle}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
