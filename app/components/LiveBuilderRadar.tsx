"use client";

import { useState, useEffect } from "react";
import { playClickSound, playStampSound, playSuccessChime } from "../lib/audioUtils";

interface LiveBuilderRadarProps {
  onGenerateClick: () => void;
}

const INITIAL_LOGS = [
  { time: "10:24 AM", user: "@satoshi_goa", action: "generated Builder ID", badge: "🌴 SUSEGAD", title: "Full-Stack Coconut Hacker" },
  { time: "10:22 AM", user: "@solana_dev", action: "stamped frame", badge: "⚡ 0xGOA", title: "Kernel-Level Tide Turner" },
  { time: "10:19 AM", user: "@vibe_coder", action: "created squad pass", badge: "🏖️ GOA 2026", title: "Async Monsoon Deployer" },
  { time: "10:15 AM", user: "@rustacean_in_goa", action: "generated Builder ID", badge: "🔧 BUILDER", title: "High-Throughput Sand Compiler" },
  { time: "10:08 AM", user: "@ai_architect", action: "stamped frame", badge: "🌙 2:47 AM", title: "Headless Sunset Renderer" },
];

const VIBE_PADS = [
  { label: "🌴 Beach Waves", sound: "chime", desc: "Susegad Ocean Vibe" },
  { label: "🥥 Coconut Hack", sound: "stamp", desc: "Terminal Mode ON" },
  { label: "⚡ Fiber Optical", sound: "click", desc: "200ms Latency" },
  { label: "🌙 2:47 AM Night", sound: "stamp", desc: "Midnight Chai" },
];

export default function LiveBuilderRadar({ onGenerateClick }: LiveBuilderRadarProps) {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [vibeActive, setVibeActive] = useState("");

  // Add random incoming builder stream log
  useEffect(() => {
    const handleNewLog = () => {
      const handles = ["@goan_hacker", "@zero_downtime", "@sand_coder", "@azulejo_dev", "@feni_sommelier", "@reef_builder"];
      const titles = ["Async Wave Rider", "Distributed Palm Shader", "Type-Safe Gecko Whisperer", "Open-Source Lagoon Swimmer"];
      const badges = ["🌴 SUSEGAD", "⚡ 0xGOA", "🥥 KINGFISH", "🔧 BUILDER", "🏖️ GOA 2026"];

      const now = new Date();
      const timeStr = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

      const newEntry = {
        time: timeStr,
        user: handles[Math.floor(Math.random() * handles.length)],
        action: "generated Builder ID",
        badge: badges[Math.floor(Math.random() * badges.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 5)]);
    };

    const interval = setInterval(handleNewLog, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerVibePad = (padLabel: string, soundType: string) => {
    setVibeActive(padLabel);
    if (soundType === "chime") playSuccessChime();
    else if (soundType === "stamp") playStampSound();
    else playClickSound();

    setTimeout(() => setVibeActive(""), 600);
  };

  return (
    <section className="radar-section" id="radar">
      <div className="section-header">
        <span className="section-header__tag">LIVE RADAR & TERMINAL WALL</span>
        <h2 className="section-header__title">
          BUILDER RADAR // <span className="highlight-pink">GEN-Z VIBE MATRIX</span>
        </h2>
      </div>

      <div className="radar-grid">
        {/* Left Column: Live Terminal Feed */}
        <div className="radar-card">
          <div className="radar-card__header">
            <span className="terminal-dot green-dot" />
            <span className="radar-card__title">LIVE STREAM // RECENT BUILDER PASSES</span>
            <span className="pulse-tag">LIVE</span>
          </div>

          <div className="terminal-feed">
            {logs.map((log, idx) => (
              <div key={idx} className="feed-item">
                <span className="feed-item__time">[{log.time}]</span>
                <span className="feed-item__user">{log.user}</span>
                <span className="feed-item__action">{log.action}:</span>
                <span className="feed-item__title">&quot;{log.title}&quot;</span>
                <span className="feed-item__badge">{log.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Vibe Soundboard & Interactive Matrix */}
        <div className="radar-card">
          <div className="radar-card__header">
            <span className="terminal-dot yellow-dot" />
            <span className="radar-card__title">GOA BUILDER VIBE PADS</span>
          </div>

          <div className="vibe-pads-grid">
            {VIBE_PADS.map((pad) => (
              <button
                key={pad.label}
                type="button"
                className={`vibe-pad ${vibeActive === pad.label ? "vibe-pad--active" : ""}`}
                onClick={() => triggerVibePad(pad.label, pad.sound)}
              >
                <span className="vibe-pad__label">{pad.label}</span>
                <span className="vibe-pad__desc">{pad.desc}</span>
              </button>
            ))}
          </div>

          <div className="signal-meter">
            <div className="signal-meter__label">
              <span>SIGNAL VS NOISE METER</span>
              <span className="highlight-yellow">100% SIGNAL</span>
            </div>
            <div className="signal-meter__bar">
              <div className="signal-meter__fill" style={{ width: "100%" }} />
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--full glow-pulse"
            style={{ marginTop: "var(--space-4)" }}
            onClick={() => {
              playClickSound();
              onGenerateClick();
            }}
          >
            🪪 STAMP YOUR BUILDER ID PASS
          </button>
        </div>
      </div>
    </section>
  );
}
