"use client";

import { PhotoFilter, CardTheme } from "../lib/frameRenderer";
import { playClickSound, playStampSound } from "../lib/audioUtils";

interface FilterStickerControlsProps {
  filter: PhotoFilter;
  setFilter: (f: PhotoFilter) => void;
  badge: string;
  setBadge: (b: string) => void;
  cardTheme: CardTheme;
  setCardTheme: (t: CardTheme) => void;
  isFlipped: boolean;
  setIsFlipped: (f: boolean) => void;
}

const FILTER_OPTIONS: Array<{ id: PhotoFilter; label: string; icon: string }> = [
  { id: "none", label: "Original", icon: "📷" },
  { id: "cyber", label: "Cyber Neon", icon: "💖" },
  { id: "sunset", label: "Goa Sunset", icon: "🌅" },
  { id: "matrix", label: "Matrix Green", icon: "⚡" },
  { id: "bw", label: "Mono Noir", icon: "🕶️" },
];

const THEME_OPTIONS: Array<{ id: CardTheme; label: string; icon: string; accentColor: string }> = [
  { id: "forest", label: "Deep Forest", icon: "🌲", accentColor: "#F5D300" },
  { id: "sunset", label: "Sunset Neon", icon: "🌅", accentColor: "#FF6B00" },
  { id: "gold", label: "Gold Edition", icon: "⚡", accentColor: "#2E9C6C" },
  { id: "cyber", label: "Electric Cyan", icon: "💖", accentColor: "#00F0FF" },
];

const BADGE_OPTIONS = [
  { id: "", label: "No Badge", icon: "🚫" },
  { id: "🌴 SUSEGAD", label: "SUSEGAD", icon: "🌴" },
  { id: "⚡ 0xGOA", label: "0xGOA", icon: "⚡" },
  { id: "🥥 KINGFISH", label: "KINGFISH", icon: "🥥" },
  { id: "🔧 BUILDER", label: "BUILDER", icon: "🔧" },
  { id: "🌙 2:47 AM", label: "2:47 AM", icon: "🌙" },
  { id: "🏖️ GOA 2026", label: "GOA 2026", icon: "🏖️" },
];

export default function FilterStickerControls({
  filter,
  setFilter,
  badge,
  setBadge,
  cardTheme,
  setCardTheme,
  isFlipped,
  setIsFlipped,
}: FilterStickerControlsProps) {
  return (
    <div className="studio-card fade-in-up">
      <h3 className="studio-card__title">
        <span className="icon">🎨</span> Photo Vibe & Badge FX
      </h3>

      {/* Card Color Theme Presets */}
      <div className="id-form__group">
        <label className="id-form__label">Graphic Palette Theme</label>
        <div className="theme-grid">
          {THEME_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`theme-chip ${cardTheme === item.id ? "theme-chip--active" : ""}`}
              onClick={() => {
                playClickSound();
                setCardTheme(item.id);
              }}
              aria-pressed={cardTheme === item.id}
            >
              <span className="theme-chip__dot" style={{ background: item.accentColor }} />
              <span>{item.icon} {item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Filters & Mirror Toggle */}
      <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
        <div className="label-with-hint">
          <label className="id-form__label">Color Filter & Mirror</label>
          <button
            type="button"
            className={`btn-mirror ${isFlipped ? "btn-mirror--active" : ""}`}
            onClick={() => {
              playClickSound();
              setIsFlipped(!isFlipped);
            }}
          >
            🪞 {isFlipped ? "Mirrored" : "Flip Horizontal"}
          </button>
        </div>

        <div className="filter-grid">
          {FILTER_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-chip ${filter === item.id ? "filter-chip--active" : ""}`}
              onClick={() => {
                playClickSound();
                setFilter(item.id);
              }}
              aria-pressed={filter === item.id}
            >
              <span className="filter-chip__icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticker Badges */}
      <div className="id-form__group" style={{ marginTop: "var(--space-4)" }}>
        <label className="id-form__label">Stamp Badge Overlay</label>
        <div className="badge-grid">
          {BADGE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`badge-chip ${badge === item.id ? "badge-chip--active" : ""}`}
              onClick={() => {
                if (item.id) playStampSound();
                else playClickSound();
                setBadge(item.id);
              }}
              aria-pressed={badge === item.id}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

