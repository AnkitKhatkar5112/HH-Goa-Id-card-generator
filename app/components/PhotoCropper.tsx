"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { playClickSound } from "../lib/audioUtils";

interface PhotoCropperProps {
  imageSrc: string;
  aspect: number;
  cropShape: "round" | "rect";
  onCropComplete: (pixelCrop: { x: number; y: number; width: number; height: number }) => void;
  onDone?: () => void;
}

export default function PhotoCropper({
  imageSrc,
  aspect,
  cropShape,
  onCropComplete,
  onDone,
}: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels);
    },
    [onCropComplete]
  );

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

  return (
    <div className="cropper-wrapper fade-in-up">
      <div className={`cropper-container ${cropShape === "rect" ? "cropper-container--card" : ""}`}>
        <Cropper
          image={imageSrc}
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
          {onDone && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                playClickSound();
                onDone();
              }}
            >
              ✓ Apply Crop
            </button>
          )}
        </div>
      </div>

      <p className="cropper-hint">
        💡 Drag photo inside the frame to adjust position. Use slider or pinch to zoom.
      </p>
    </div>
  );
}
