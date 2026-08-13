"use client";

import { playClickSound } from "../lib/audioUtils";

/* ─── Cinematic Hype Section ─── */
interface HypeSectionProps {
  onGenerateClick: () => void;
}

const STATS = [
  { value: "500+", label: "Elite Builders" },
  { value: "4", label: "Days of Code" },
  { value: "$50k+", label: "In Bounties" },
  { value: "100%", label: "Signal" },
];

export default function HypeSection({ onGenerateClick }: HypeSectionProps) {
  return (
    <section className="hype" id="hype">
      {/* Grain overlay for this section */}
      <div className="hype__grain" aria-hidden="true" />

      {/* Eyebrow */}
      <span className="tech-label hype__eyebrow reveal">THE VIBE CHECK</span>

      {/* Stack typography */}
      <div className="hype__stack">
        <h2 className="hype__word hype__word--check reveal">CHECK</h2>

        {/* Video / Poster Frame */}
        <div className="hype__frame reveal" data-reveal-delay="150">
          {/* Corner crop marks */}
          <div className="crop-mark crop-mark--tl" aria-hidden="true" />
          <div className="crop-mark crop-mark--br" aria-hidden="true" />

          {/* Halftone edge effect */}
          <div className="hype__edge-halftone" aria-hidden="true" />

          {/* Poster image or video fallback */}
          <div className="hype__poster">
            <div className="hype__poster-content">
              <span className="hype__poster-tagline">LESS NOISE. MORE SIGNAL.</span>
              <span className="hype__poster-sub">
                Four days of real building — 500 elite builders,<br />
                high-speed fiber, and the ocean at your doorstep.
              </span>
              <span className="hype__poster-location">GOA, INDIA · 28-31 OCT 2026</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="hype__meta">
            <span className="status-dot">
              <span className="status-dot__pulse" />
              <span className="tech-label">LIVE FEED</span>
            </span>
            <span className="tech-label meta-label">GOA, INDIA</span>
            <span className="tech-label meta-label">HH GOA 2026</span>
          </div>
        </div>

        <h2 className="hype__word hype__word--hype reveal" data-reveal-delay="250">HYPE</h2>
      </div>

      {/* Stats Ticker */}
      <div className="hype__stats reveal" data-reveal-delay="350">
        {STATS.map((s) => (
          <div key={s.label} className="hype__stat">
            <span className="hype__stat-value">{s.value}</span>
            <span className="hype__stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="hype__cta reveal" data-reveal-delay="450">
        <button
          type="button"
          className="btn-cinematic btn-cinematic--primary btn-cinematic--lg"
          onClick={() => { playClickSound(); onGenerateClick(); }}
        >
          <span>GENERATE BUILDER ID PASS</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="2"/></svg>
        </button>
      </div>

      {/* Tagline */}
      <span className="tech-label hype__tagline reveal" data-reveal-delay="500">
        28 — 31 OCT 2026 · #FrameInGoa
      </span>
    </section>
  );
}
