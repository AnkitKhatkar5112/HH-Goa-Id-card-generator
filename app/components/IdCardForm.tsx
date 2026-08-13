"use client";

import { useEffect, useState, useRef } from "react";
import { generateBuilderTitle } from "../lib/builderTitles";
import { playReelTickSound } from "../lib/audioUtils";

interface IdCardFormProps {
  mode: string;
  username: string;
  setUsername: (v: string) => void;
  realFullName: string;
  setRealFullName: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  builderTitle: string;
  setBuilderTitle: (v: string) => void;
  teamName: string;
  setTeamName: (v: string) => void;
}

export default function IdCardForm({
  mode,
  username,
  setUsername,
  realFullName,
  setRealFullName,
  role,
  setRole,
  builderTitle,
  setBuilderTitle,
  teamName,
  setTeamName,
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
        <span className="icon">{mode === "team" ? "👥" : "🪪"}</span> 
        {mode === "team" ? "Team Squad Details" : "Builder ID Passport Details"}
      </h3>

      {mode === "team" ? (
        <div className="id-form__group">
          <label className="id-form__label" htmlFor="team-name">
            Team / Squad Name
          </label>
          <div className="input-wrap">
            <input
              id="team-name"
              className="id-form__input"
              style={{ paddingLeft: "var(--space-3)", textTransform: "uppercase" }}
              type="text"
              placeholder="e.g. SQUAD ZERO"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={25}
              autoComplete="off"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Real Full Name Input */}
          <div className="id-form__group">
            <label className="id-form__label" htmlFor="builder-realname">
              Real Full Name
            </label>
            <div className="input-wrap">
              <input
                id="builder-realname"
                className="id-form__input"
                style={{ paddingLeft: "var(--space-3)" }}
                type="text"
                placeholder="e.g. John Doe"
                value={realFullName}
                onChange={(e) => setRealFullName(e.target.value)}
                maxLength={35}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Username Input */}
          <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
            <label className="id-form__label" htmlFor="builder-username">
              Username / Handle
            </label>
            <div className="input-wrap">
              <span className="input-prefix">@</span>
              <input
                id="builder-username"
                className="id-form__input"
                type="text"
                placeholder="e.g. Satoshi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Role Input */}
          <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
            <label className="id-form__label" htmlFor="builder-role">
              Role
            </label>
            <div className="input-wrap">
              <input
                id="builder-role"
                className="id-form__input"
                style={{ paddingLeft: "var(--space-3)" }}
                type="text"
                placeholder="e.g. Developer, Founder, etc."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={35}
                autoComplete="off"
              />
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
        </>
      )}
    </div>
  );
}
