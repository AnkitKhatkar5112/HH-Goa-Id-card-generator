"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { playClickSound } from "../lib/audioUtils";

interface PhotoCropperProps {
  imageSrcs?: string[];
  imageSrc?: string;
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
  aspect: number;
  cropShape: "round" | "rect";
  onCropComplete: (pixelCrop: { x: number; y: number; width: number; height: number }, targetIndex?: number) => void;
  onDone?: () => void;
}

export default function PhotoCropper({
  imageSrcs,
  imageSrc,
  selectedIndex = 0,
  onSelectIndex,
  aspect,
  cropShape,
  onCropComplete,
  onDone,
}: PhotoCropperProps) {
  const activeSrc = (imageSrcs && imageSrcs[selectedIndex]) || imageSrc || "";

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [lastPixels, setLastPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setLastPixels(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    playClickSound();
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    playClickSound();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = () => {
    playClickSound();
    if (lastPixels) {
      onCropComplete(lastPixels, selectedIndex);
    }
    if (onDone) {
      onDone();
    }
  };

  return (
    <div className="cropper-wrapper fade-in-up">
      {/* Team Member Photo Selector if multiple photos */}
      {imageSrcs && imageSrcs.length > 1 && onSelectIndex && (
        <div className="crop-member-bar" style={{ marginBottom: "var(--space-3)" }}>
          <span className="cropper-controls__label">Select Member to Adjust:</span>
          <div className="crop-member-chips" style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            {imageSrcs.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`tech-chip ${selectedIndex === idx ? "tech-chip--active" : ""}`}
                onClick={() => {
                  playClickSound();
                  if (lastPixels) {
                    onCropComplete(lastPixels, selectedIndex);
                  }
                  onSelectIndex(idx);
                  handleReset();
                }}
              >
                👤 Member {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`cropper-container ${cropShape === "rect" ? "cropper-container--card" : ""}`}>
        <Cropper
          key={`${selectedIndex}-${activeSrc}`}
          image={activeSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={handleCropComplete}
          style={{
            containerStyle: {
              background: "#0B2A1F",
            },
            cropAreaStyle: {
              border: "3px solid #F5D300",
              boxShadow: "0 0 0 9999px rgba(11, 42, 31, 0.75)",
            },
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="cropper-controls-row">
        <div className="cropper-controls">
          <span className="cropper-controls__label">🔍 Zoom</span>
          <input
            className="cropper-controls__slider"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom level"
            id="zoom-slider"
          />
          <span className="cropper-controls__label mono">{zoom.toFixed(1)}×</span>
        </div>

        <div className="cropper-buttons">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleRotate}
            title="Rotate 90deg"
          >
            🔄 Rotate
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleReset}
            title="Reset position"
          >
            🎯 Reset
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm glow-pulse"
            onClick={handleApply}
          >
            ✓ Apply Position
          </button>
        </div>
      </div>

      <p className="cropper-hint">
        💡 Drag photo inside the frame to adjust position. Use slider or pinch to zoom.
      </p>
    </div>
  );
}

