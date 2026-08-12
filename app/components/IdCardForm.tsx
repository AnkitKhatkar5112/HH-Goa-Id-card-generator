"use client";

import { useEffect } from "react";
import { generateBuilderTitle, STACK_OPTIONS } from "../lib/builderTitles";

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
  // Auto-generate title on mount if not set
  useEffect(() => {
    if (!builderTitle) {
      setBuilderTitle(generateBuilderTitle());
    }
  }, [builderTitle, setBuilderTitle]);

  const handleReroll = () => {
    setBuilderTitle(generateBuilderTitle());
  };

  return (
    <div className="id-form fade-in-up">
      {/* Name */}
      <div className="id-form__group">
        <label className="id-form__label" htmlFor="builder-name">
          Your Name
        </label>
        <input
          id="builder-name"
          className="id-form__input"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="name"
        />
      </div>

      {/* Stack / Role */}
      <div className="id-form__group">
        <label className="id-form__label">Stack / Role</label>
        <div className="stack-pills">
          {STACK_OPTIONS.map((option) => (
            <button
              key={option}
              className={`stack-pill ${stack === option ? "stack-pill--active" : ""}`}
              onClick={() => setStack(stack === option ? "" : option)}
              type="button"
              aria-pressed={stack === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Builder Title */}
      <div className="id-form__group">
        <label className="id-form__label">Builder Title</label>
        <div className="builder-title-display">
          <span className="builder-title-text">
            &quot;{builderTitle || "..."}&quot;
          </span>
          <button
            className="builder-title-reroll"
            onClick={handleReroll}
            title="Reroll title"
            aria-label="Generate new builder title"
            type="button"
          >
            🎲
          </button>
        </div>
      </div>
    </div>
  );
}
