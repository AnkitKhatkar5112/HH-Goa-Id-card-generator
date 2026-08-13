"use client";

import { useEffect, useState, useRef } from "react";
import { generateBuilderTitle, STACK_OPTIONS } from "../lib/builderTitles";
import { playClickSound, playReelTickSound } from "../lib/audioUtils";

interface IdCardFormProps {
  name: string;
  setName: (v: string) => void;
  stack: string;
  setStack: (v: string) => void;
  builderTitle: string;
  setBuilderTitle: (v: string) => void;
}

export default function IdCardForm({
  name,
  setName,
  stack,
  setStack,
  builderTitle,
  setBuilderTitle,
}: IdCardFormProps) {
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate title on mount if not set
  useEffect(() => {
    if (!builderTitle) {
      setBuilderTitle(generateBuilderTitle());
    }
  }, [builderTitle, setBuilderTitle]);

  const handleReroll = () => {
    if (isRolling) return;
    setIsRolling(true);

    let stepCount = 0;
    const maxSteps = 10;

    const spinInterval = setInterval(() => {
      setBuilderTitle(generateBuilderTitle());
      playReelTickSound();
      stepCount++;

      if (stepCount >= maxSteps) {
        clearInterval(spinInterval);
        setIsRolling(false);
      }
    }, 60);

    rollTimerRef.current = spinInterval;
  };

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearInterval(rollTimerRef.current);
    };
  }, []);

  return (
    <div className="studio-card fade-in-up">
      <h3 className="studio-card__title">
        <span className="icon">🪪</span> Builder ID Passport Details
      </h3>

      {/* Name Input */}
      <div className="id-form__group">
        <label className="id-form__label" htmlFor="builder-name">
          Builder Name / Handle
        </label>
        <div className="input-wrap">
          <span className="input-prefix">@</span>
          <input
            id="builder-name"
            className="id-form__input"
            type="text"
            placeholder="e.g. Satoshi / GoanCoder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={35}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Stack Selection */}
      <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
        <label className="id-form__label">Engineering Stack / Specialization</label>
        <div className="stack-pills">
          {STACK_OPTIONS.map((option) => (
            <button
              key={option}
              className={`stack-pill ${stack === option ? "stack-pill--active" : ""}`}
              onClick={() => {
                playClickSound();
                setStack(stack === option ? "" : option);
              }}
              type="button"
              aria-pressed={stack === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Slot Machine Title Generator */}
      <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
        <div className="label-with-hint">
          <label className="id-form__label">Goa Builder Title</label>
          <span className="id-form__hint">Slot Machine Generator</span>
        </div>

        <div className={`builder-title-display ${isRolling ? "builder-title-display--rolling" : ""}`}>
          <span className="builder-title-text">
            &quot;{builderTitle || "..."}&quot;
          </span>
          <button
            className={`builder-title-reroll ${isRolling ? "spin-anim" : ""}`}
            onClick={handleReroll}
            disabled={isRolling}
            title="Roll new title"
            aria-label="Generate new builder title"
            type="button"
          >
            🎰 Reroll
          </button>
        </div>
      </div>
    </div>
  );
}
