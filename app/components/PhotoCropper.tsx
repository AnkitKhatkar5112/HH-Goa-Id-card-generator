"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface PhotoCropperProps {
  imageSrc: string;
  aspect: number;
  cropShape: "round" | "rect";
  onCropComplete: (pixelCrop: { x: number; y: number; width: number; height: number }) => void;
}

export default function PhotoCropper({
  imageSrc,
  aspect,
  cropShape,
  onCropComplete,
}: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels);
    },
    [onCropComplete]
  );

  return (
    <div>
      <div className={`cropper-container ${cropShape === "rect" ? "cropper-container--card" : ""}`}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          style={{
            containerStyle: {
              borderRadius: "var(--radius-xl)",
            },
            cropAreaStyle: {
              border: cropShape === "round"
                ? "3px solid rgba(0, 229, 255, 0.5)"
                : "3px solid rgba(14, 140, 127, 0.6)",
              boxShadow: "0 0 0 9999px rgba(10, 14, 23, 0.55)",
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="cropper-controls">
        <span className="cropper-controls__label">🔍</span>
        <input
          className="cropper-controls__slider"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom level"
          id="zoom-slider"
        />
        <span className="cropper-controls__label mono" style={{ fontSize: "11px" }}>
          {zoom.toFixed(1)}×
        </span>
      </div>

      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--smoke)",
          marginBottom: "var(--space-2)",
        }}
      >
        Drag to reposition · Pinch or slide to zoom
      </p>
    </div>
  );
}
