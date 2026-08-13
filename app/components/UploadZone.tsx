"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { playClickSound, playCameraShutterSound } from "../lib/audioUtils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export default function UploadZone({ onFilesSelected, multiple = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Camera Selfie Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleClick = () => {
    playClickSound();
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesSelected(files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
      if (files.length > 0) {
        onFilesSelected(multiple ? files : [files[0]]);
      }
    },
    [onFilesSelected, multiple]
  );

  // Sample Avatar generator
  const handleLoadSample = async (samplePath: string) => {
    playClickSound();
    try {
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], "sample-goa-avatar.png", { type: "image/png" });
      onFilesSelected([file]);
    } catch {
      console.warn("Could not load sample avatar");
    }
  };

  // Start Camera Feed
  const startCamera = async (mode: "user" | "environment") => {
    stopCamera();
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check browser permissions!");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleOpenCamera = () => {
    playClickSound();
    setIsCameraOpen(true);
    startCamera(facingMode);
  };

  const handleCloseCamera = () => {
    playClickSound();
    stopCamera();
    setIsCameraOpen(false);
  };

  const handleToggleFacingMode = () => {
    playClickSound();
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    playCameraShutterSound();

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.png`, { type: "image/png" });
        stopCamera();
        setIsCameraOpen(false);
        onFilesSelected([file]);
      }
    }, "image/png");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="upload-section fade-in-up">
      <div
        className={`upload-zone ${isDragOver ? "upload-zone--dragover" : ""}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={multiple ? "Upload photos" : "Upload a photo"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        id="upload-zone"
      >
        <div className="upload-zone__scanner-line" />
        <div className="upload-zone__icon">📸</div>

        <p className="upload-zone__title">
          {multiple ? "Drop Squad Photos Here" : "Drop Your Photo Here"}
        </p>

        <p className="upload-zone__subtitle">
          Click or tap to choose from camera roll {multiple ? "(up to 4 photos)" : ""}
        </p>

        <div className="upload-zone__badges">
          <span className="badge-tag">JPG</span>
          <span className="badge-tag">PNG</span>
          <span className="badge-tag">HEIC Auto-Convert</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
          onChange={handleChange}
          aria-hidden="true"
        />
      </div>

      {/* Action bar: Live Camera & Sample graphics */}
      <div className="sample-avatars-bar">
        <button
          type="button"
          className="sample-btn sample-btn--camera glow-pulse"
          onClick={handleOpenCamera}
        >
          📷 Snap Live Selfie
        </button>

        <span className="sample-label">Or test with event graphics:</span>
        <button
          type="button"
          className="sample-btn"
          onClick={() => handleLoadSample("/assets/cyber_azulejo.png")}
        >
          🌴 Cyber Azulejo
        </button>
        <button
          type="button"
          className="sample-btn"
          onClick={() => handleLoadSample("/assets/goa_sunset.png")}
        >
          🌅 Goa Sunset
        </button>
        <button
          type="button"
          className="sample-btn"
          onClick={() => handleLoadSample("/assets/hackers.png")}
        >
          💻 Hacker Squad
        </button>
      </div>

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="modal-backdrop" onClick={handleCloseCamera}>
          <div className="modal-content camera-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseCamera} type="button">
              ✕
            </button>
            <h4 className="camera-modal__title">📸 Snap Live Builder Photo</h4>
            
            {cameraError ? (
              <div className="camera-error">{cameraError}</div>
            ) : (
              <div className="camera-preview-wrap">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`camera-video ${facingMode === "user" ? "camera-video--mirror" : ""}`}
                />
                <div className="camera-reticle" />
              </div>
            )}

            <div className="camera-controls">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleToggleFacingMode}
                title="Flip Camera"
              >
                🔄 Flip Cam
              </button>
              <button
                type="button"
                className="btn btn--primary btn--lg glow-pulse"
                onClick={handleCaptureSnapshot}
                disabled={!!cameraError}
              >
                🔴 CAPTURE SNAPSHOT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

