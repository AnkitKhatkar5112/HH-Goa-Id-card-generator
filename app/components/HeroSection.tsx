"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getLiveTimeStudioString } from "../lib/frameRenderer";
import { playClickSound } from "../lib/audioUtils";

/* ─── Deterministic pixel seed (module-level, runs once) ─── */
function generatePixelData(count: number) {
  // Simple seeded PRNG to avoid Math.random() during render
  let seed = 42;
  function next() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  return Array.from({ length: count }, (_, i) => {
    const r1 = next(), r2 = next(), r3 = next(), r4 = next(), r5 = next(), r6 = next(), r7 = next();
    return {
      id: i,
      left: `${r1 * 100}%`,
      top: `${r2 * 100}%`,
      size: r3 * 3 + 1.5,
      delay: `${(r4 * 6).toFixed(1)}s`,
      dur: `${(r5 * 4 + 3).toFixed(1)}s`,
      color:
        r6 > 0.6
          ? "var(--pink-neon)"
          : r7 > 0.3
          ? "var(--yellow-primary)"
          : "var(--off-white)",
    };
  });
}

/* ─── Floating Pixel Field ─── */
function PixelField({ count = 24 }: { count?: number }) {
  const [pixels] = useState(() => generatePixelData(count));

  return (
    <div className="pixel-field" aria-hidden="true">
      {pixels.map((p) => (
        <span
          key={p.id}
          className="pixel-field__dot"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Hero Section ─── */
interface HeroSectionProps {
  onCreateClick: () => void;
  onHypeClick: () => void;
}

export default function HeroSection({ onCreateClick, onHypeClick }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [liveTime, setLiveTime] = useState(() => getLiveTimeStudioString());

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setLiveTime(getLiveTimeStudioString()), 5000);
    return () => clearInterval(t);
  }, []);

  // Mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty("--mx", `${cx * 18}px`);
    hero.style.setProperty("--my", `${cy * 14}px`);
    hero.style.setProperty("--mx-slow", `${cx * 8}px`);
    hero.style.setProperty("--my-slow", `${cy * 6}px`);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      onMouseMove={handleMouseMove}
    >
      {/* Background layers */}
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__halftone" aria-hidden="true" />
      <PixelField count={28} />

      {/* Diagonal scan lines */}
      <svg className="hero__line-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="650" x2="1440" y2="200" className="hero__line-base" />
        <line x1="0" y1="650" x2="1440" y2="200" className="hero__line-pulse" />
        <line x1="0" y1="750" x2="1440" y2="300" className="hero__line-base" />
        <line x1="0" y1="750" x2="1440" y2="300" className="hero__line-pulse" style={{ animationDelay: "1.2s" }} />
      </svg>

      {/* Content frame */}
      <div className="hero__frame">
        {/* Corner info — left */}
        <div className="hero__corner hero__corner--tl">
          <span className="hero__clock">{liveTime.toUpperCase()}</span>
        </div>

        {/* Corner info — right */}
        <div className="hero__corner hero__corner--tr">
          <span className="tech-label">HH GOA 2026</span>
          <span className="tech-label">#FRAMEINGOA</span>
        </div>

        {/* Left edge */}
        <div className="hero__edge hero__edge--left">
          <span className="tech-label">GOA, INDIA</span>
          <span className="tech-label">28 — 31 OCT 2026</span>
        </div>

        {/* Right edge */}
        <div className="hero__edge hero__edge--right">
          <span className="tech-label status-dot">
            <span className="status-dot__pulse" />
            LIVE
          </span>
        </div>

        {/* Central typography */}
        <div className="hero__type">
          <span className="hero__devanagari">गोवा</span>
          <h1 className="hero__word hero__word--hacker">HACKER</h1>
          <h1 className="hero__word hero__word--house">HOUSE</h1>
        </div>

        {/* CTAs */}
        <div className="hero__cta">
          <button
            type="button"
            className="btn-cinematic btn-cinematic--primary"
            onClick={() => { playClickSound(); onCreateClick(); }}
          >
            <span>CREATE YOUR BUILDER ID</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="2"/></svg>
          </button>

          <button
            type="button"
            className="btn-cinematic btn-cinematic--ghost"
            onClick={() => { playClickSound(); onHypeClick(); }}
          >
            <span>CHECK THE HYPE</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
        </div>

        {/* Scroll cue */}
        <div className="hero__scroll-cue">
          <span className="hero__scroll-line" />
          <span className="tech-label">SCROLL</span>
        </div>
      </div>
    </section>
  );
}
