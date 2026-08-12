"use client";

import { useRef, useState, useCallback } from "react";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export default function UploadZone({ onFilesSelected, multiple = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
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

      const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
      if (files.length > 0) {
        onFilesSelected(multiple ? files : [files[0]]);
      }
    },
    [onFilesSelected, multiple]
  );

  return (
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
      <div className="upload-zone__icon">📸</div>
      <p className="upload-zone__title">
        {multiple ? "Drop your photos here" : "Drop your photo here"}
      </p>
      <p className="upload-zone__subtitle">
        or tap to choose from camera roll {multiple ? "(select multiple)" : ""}
      </p>
      <p className="upload-zone__formats">jpg · png · heic</p>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
        onChange={handleChange}
        aria-hidden="true"
      />
    </div>
  );
}
