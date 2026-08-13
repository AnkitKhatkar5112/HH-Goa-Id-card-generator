"use client";

import { useRef, useState, useCallback } from "react";
import { playClickSound } from "../lib/audioUtils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export default function UploadZone({ onFilesSelected, multiple = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Sample Avatar generator for quick testing
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

      {/* Quick Test Avatar Option */}
      <div className="sample-avatars-bar">
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
    </div>
  );
}
