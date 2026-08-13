"use client";

import { useState, useCallback, useEffect } from "react";

import HeroSection from "./components/HeroSection";
import HypeSection from "./components/HypeSection";
import ProcessSection from "./components/ProcessSection";
import AboutSection from "./components/AboutSection";
import LiveBuilderRadar from "./components/LiveBuilderRadar";
import UploadZone from "./components/UploadZone";
import FramePreview from "./components/FramePreview";
import IdCardForm from "./components/IdCardForm";
import FilterStickerControls from "./components/FilterStickerControls";
import PhotoCropper from "./components/PhotoCropper";

import { processUploadedFile, getCroppedImg } from "./lib/imageUtils";
import { PhotoFilter, CardTheme, TeamLayoutOption, getLiveTimeStudioString } from "./lib/frameRenderer";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "./lib/audioUtils";
import { useScrollReveal } from "./hooks/useScrollReveal";

type Mode = "frame" | "card" | "team";
type Step = "upload" | "studio";

export default function Home() {
  const [mode, setMode] = useState<Mode>("card");
  const [step, setStep] = useState<Step>("upload");
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Sound & CRT
  const [soundOn, setSoundOn] = useState(true);
  const [scanlinesOn, setScanlinesOn] = useState(false);
  const [liveTimeStudio, setLiveTimeStudio] = useState(() => getLiveTimeStudioString());

  // Creative Studio Controls
  const [filter, setFilter] = useState<PhotoFilter>("none");
  const [badge, setBadge] = useState<string>("🌴 SUSEGAD");
  const [cardTheme, setCardTheme] = useState<CardTheme>("forest");
  const [teamLayout, setTeamLayout] = useState<TeamLayoutOption>("auto");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [exportScale, setExportScale] = useState<number>(1);
  const [cropActive, setCropActive] = useState(false);
  const [cropIndex, setCropIndex] = useState(0);

  // ID Card Form State
  const [username, setUsername] = useState("");
  const [realFullName, setRealFullName] = useState("");
  const [role, setRole] = useState("");
  const [builderTitle, setBuilderTitle] = useState("");
  const [teamName, setTeamName] = useState("SQUAD ZERO");

  // Live clock tick & sound preference
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(isSoundEnabled());
    const timer = setInterval(() => {
      setLiveTimeStudio(getLiveTimeStudioString());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal animations
  useScrollReveal();

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const toggleScanlines = () => {
    playClickSound();
    setScanlinesOn((prev) => !prev);
  };

  const scrollToGenerator = () => {
    const el = document.getElementById("generator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHype = () => {
    const el = document.getElementById("hype");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      setIsProcessing(true);
      setStatusMsg("");

      try {
        const urls: string[] = [];
        let hadHeic = false;
        let hadSmall = false;

        const filesToProcess = mode === "team" ? files.slice(0, 4) : [files[0]];

        for (const file of filesToProcess) {
          if (!file) continue;
          const result = await processUploadedFile(file);
          if (result.wasHeic) hadHeic = true;
          if (result.tooSmall) hadSmall = true;
          urls.push(result.objectUrl);
        }

        if (hadHeic) setStatusMsg("HEIC format converted ✓");
        if (hadSmall) {
          setStatusMsg((prev) =>
            prev ? `${prev} · Low-resolution photo detected` : "Low-resolution photo detected"
          );
        }

        setImageSrcs(urls);
        setStep("studio");
        scrollToGenerator();
      } catch (err) {
        console.error("Failed to process images:", err);
        setStatusMsg("Failed to process image. Please try another.");
      } finally {
        setIsProcessing(false);
      }
    },
    [mode]
  );

  const handleReset = useCallback(() => {
    playClickSound();
    imageSrcs.forEach((url) => URL.revokeObjectURL(url));
    setImageSrcs([]);
    setStep("upload");
    setStatusMsg("");
    setUsername("");
    setRealFullName("");
    setRole("");
    setBuilderTitle("");
    setTeamName("SQUAD ZERO");
    setCropActive(false);
    setCropIndex(0);
  }, [imageSrcs]);

  const handleModeSwitch = useCallback(
    (newMode: Mode) => {
      playClickSound();
      setMode(newMode);
      if (step === "studio") {
        if (newMode !== "team" && imageSrcs.length > 1) {
          const toKeep = imageSrcs[0];
          const toRevoke = imageSrcs.slice(1);
          toRevoke.forEach((url) => URL.revokeObjectURL(url));
          setImageSrcs([toKeep]);
        }
      }
    },
    [step, imageSrcs]
  );

  const handleCropComplete = async (
    pixelCrop: { x: number; y: number; width: number; height: number },
    targetIndex = 0
  ) => {
    if (imageSrcs.length === 0 || !imageSrcs[targetIndex]) return;
    try {
      const croppedCanvas = await getCroppedImg(imageSrcs[targetIndex], pixelCrop);
      const blob = await new Promise<Blob>((resolve) => croppedCanvas.toBlob((b) => resolve(b!), "image/png"));
      const croppedUrl = URL.createObjectURL(blob);
      setImageSrcs((prev) => {
        const next = [...prev];
        next[targetIndex] = croppedUrl;
        return next;
      });
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  return (
    <div className={`app-root ${scanlinesOn ? "scanlines-active" : ""}`}>
      {/* Film Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* ─── Sticky Nav (Frosted Glass) ─── */}
      <nav className="site-nav">
        <div className="site-nav__inner">
          <div className="site-nav__brand">
            <span className="site-nav__brand-main">HACKER GOA HOUSE</span>
            <span className="site-nav__brand-sub" suppressHydrationWarning>{liveTimeStudio}</span>
          </div>

          <div className="site-nav__links">
            <a href="#hype" className="site-nav__link" onClick={playClickSound}>HYPE</a>
            <a href="#process" className="site-nav__link" onClick={playClickSound}>HOW IT WORKS</a>
            <a href="#generator" className="site-nav__link" onClick={playClickSound}>STUDIO</a>
            <a href="#about" className="site-nav__link" onClick={playClickSound}>ABOUT</a>
          </div>

          <div className="site-nav__controls">
            <button
              className={`icon-toggle ${scanlinesOn ? "icon-toggle--active" : ""}`}
              onClick={toggleScanlines}
              title="Toggle CRT Scanlines"
              aria-label="Toggle CRT Scanlines"
              type="button"
            >
              📺
            </button>

            <button
              className={`icon-toggle ${soundOn ? "icon-toggle--active" : ""}`}
              onClick={toggleSound}
              title="Toggle Audio Feedback"
              aria-label="Toggle Audio Feedback"
              type="button"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>

            <a
              href="https://github.com/Avi007-debug/HH-Goa-Id-card-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--sm btn--secondary flex-center-gap"
              title="Star on GitHub"
              onClick={playClickSound}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="https://hhgoa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--sm btn--primary"
            >
              REGISTER FOR HH GOA ↗
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section (Full Viewport) ─── */}
      <HeroSection
        onCreateClick={scrollToGenerator}
        onHypeClick={scrollToHype}
      />

      {/* ─── Hype Section ─── */}
      <HypeSection onGenerateClick={scrollToGenerator} />

      {/* ─── Process Section ("Build Your Identity") ─── */}
      <ProcessSection />

      {/* ─── Generator Studio Workbench ─── */}
      <div className="studio-section" id="generator">
        <div className="container container--wide">
          <div className="section-header">
            <span className="section-tag section-tag--yellow">STEP {step === "upload" ? "01" : "02"}</span>
            <h2 className="section-title">BUILDER IDENTITY STUDIO</h2>
            <p className="section-desc">
              Generate your official Hacker House Goa 2026 graphics. 100% private, client-rendered in your browser.
            </p>
          </div>

          {/* Format Selector Tabs */}
          <div className="format-toggle" role="tablist" aria-label="Format selection">
            <button
              className={`format-toggle__btn ${mode === "card" ? "format-toggle__btn--active" : ""}`}
              onClick={() => handleModeSwitch("card")}
              role="tab"
              aria-selected={mode === "card"}
              id="tab-card"
            >
              🪪 Builder ID Pass (4:5)
            </button>
            <button
              className={`format-toggle__btn ${mode === "frame" ? "format-toggle__btn--active" : ""}`}
              onClick={() => handleModeSwitch("frame")}
              role="tab"
              aria-selected={mode === "frame"}
              id="tab-frame"
            >
              🖼️ PFP Frame (1:1)
            </button>
            <button
              className={`format-toggle__btn ${mode === "team" ? "format-toggle__btn--active" : ""}`}
              onClick={() => handleModeSwitch("team")}
              role="tab"
              aria-selected={mode === "team"}
              id="tab-team"
            >
              👥 Team Squad Frame
            </button>
          </div>

          {/* Status Toast */}
          {statusMsg && <div className="status-toast">{statusMsg}</div>}

          {/* Loading Shimmer */}
          {isProcessing && (
            <div className="studio-card fade-in-up" style={{ textAlign: "center", padding: "var(--space-8)" }}>
              <div className="shimmer" style={{ height: 160, marginBottom: "var(--space-4)" }} />
              <p style={{ color: "var(--yellow-primary)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", letterSpacing: "0.1em" }}>
                ⚡ COMPOSITING HIGH-RES GRAPHICS...
              </p>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === "upload" && !isProcessing && (
            <div className="fade-in-up">
              <UploadZone onFilesSelected={handleFilesSelected} multiple={mode === "team"} />
            </div>
          )}

          {/* STEP 2: STUDIO WORKBENCH */}
          {step === "studio" && imageSrcs.length > 0 && !isProcessing && (
            <div className="fade-in-up">
              {/* Toolbar */}
              <div className="workbench-bar">
                <button className="back-btn" onClick={handleReset} aria-label="Start over">
                  ← UPLOAD DIFFERENT PHOTO
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${cropActive ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => { playClickSound(); setCropActive((prev) => !prev); }}
                >
                  {cropActive ? "✓ Done Positioning" : "✂️ Adjust Position"}
                </button>
              </div>

              <div className="studio-grid">
                {/* LEFT: Controls */}
                <div>
                  {cropActive && (
                    <div className="studio-card fade-in-up">
                      <h3 className="studio-card__title">
                        <span>✂️</span> Photo Position & Zoom
                      </h3>
                      <PhotoCropper
                        imageSrcs={imageSrcs}
                        imageSrc={imageSrcs[cropIndex] || imageSrcs[0]}
                        selectedIndex={cropIndex}
                        onSelectIndex={setCropIndex}
                        aspect={mode === "frame" ? 1 : 4 / 5}
                        cropShape={mode === "frame" ? "round" : "rect"}
                        onCropComplete={handleCropComplete}
                        onDone={() => setCropActive(false)}
                      />
                    </div>
                  )}

                  {mode !== "frame" && (
                    <IdCardForm
                      mode={mode}
                      username={username}
                      setUsername={setUsername}
                      realFullName={realFullName}
                      setRealFullName={setRealFullName}
                      role={role}
                      setRole={setRole}
                      builderTitle={builderTitle}
                      setBuilderTitle={setBuilderTitle}
                      teamName={teamName}
                      setTeamName={setTeamName}
                    />
                  )}

                  <FilterStickerControls
                    filter={filter}
                    setFilter={setFilter}
                    badge={badge}
                    setBadge={setBadge}
                    cardTheme={cardTheme}
                    setCardTheme={setCardTheme}
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    mode={mode}
                    imageCount={imageSrcs.length}
                    teamLayout={teamLayout}
                    setTeamLayout={setTeamLayout}
                  />
                </div>

                {/* RIGHT: Live Preview */}
                <div>
                  <div className="sticky-preview-card">
                    <FramePreview
                      imageSrcs={imageSrcs}
                      mode={mode}
                      username={username}
                      realFullName={realFullName}
                      role={role}
                      builderTitle={builderTitle}
                      teamName={teamName}
                      filter={filter}
                      badge={badge}
                      cardTheme={cardTheme}
                      teamLayout={teamLayout}
                      isFlipped={isFlipped}
                      exportScale={exportScale}
                      setExportScale={setExportScale}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ─── About The Builders Section ─── */}
      <AboutSection />

      {/* ─── Live Builder Radar & Vibe Pads ─── */}
      <LiveBuilderRadar onGenerateClick={scrollToGenerator} />

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand">
            HACKER GOA HOUSE <span className="site-footer__tag">GOA</span>
          </span>
          <span className="site-footer__credit" suppressHydrationWarning>
            28 — 31 OCT 2026 · #FRAMEINGOA · {liveTimeStudio.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
}
