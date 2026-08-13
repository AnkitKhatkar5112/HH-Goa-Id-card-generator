"use client";

import { useState, useEffect } from "react";
import { playClickSound, playStampSound, playSuccessChime } from "../lib/audioUtils";

interface LiveBuilderRadarProps {
  onGenerateClick: () => void;
}

interface RadarLog {
  id: string;
  time: string;
  timestamp: number;
  user: string;
  action: string;
  badge: string;
  title: string;
}

const VIBE_PADS = [
  { label: "🌴 Beach Waves", sound: "chime", desc: "Susegad Ocean Vibe" },
  { label: "🥥 Coconut Hack", sound: "stamp", desc: "Terminal Mode ON" },
  { label: "⚡ Fiber Optical", sound: "click", desc: "200ms Latency" },
  { label: "🌙 2:47 AM Night", sound: "stamp", desc: "Midnight Chai" },
];

export default function LiveBuilderRadar({ onGenerateClick }: LiveBuilderRadarProps) {
  const [logs, setLogs] = useState<RadarLog[]>([]);
  const [vibeActive, setVibeActive] = useState("");
  const [signalStrength, setSignalStrength] = useState(10); // Baseline

  // Polling API for live logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/radar");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);

          if (data.logs && data.logs.length > 0) {
            const latestTimestamp = data.logs[0].timestamp;
            const diffSeconds = (Date.now() - latestTimestamp) / 1000;
            
            if (diffSeconds < 15) setSignalStrength(100);
            else if (diffSeconds < 60) setSignalStrength(60);
            else if (diffSeconds < 300) setSignalStrength(40);
            else setSignalStrength(20);
          }
        }
      } catch (err) {
        console.error("Failed to fetch radar logs", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const triggerVibePad = async (padLabel: string, soundType: string) => {
    setVibeActive(padLabel);
    if (soundType === "chime") playSuccessChime();
    else if (soundType === "stamp") playStampSound();
    else playClickSound();

    setTimeout(() => setVibeActive(""), 600);

    // POST real insight
    try {
      await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "@visitor",
          action: "triggered vibe pad",
          badge: "🔊 VIBE",
          title: padLabel,
        }),
      });
    } catch (err) {
      console.error("Failed to post vibe", err);
    }
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
            {logs.slice(0, 7).map((log, idx) => (
              <div key={log.id || idx} className="feed-item">
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
              <span className="highlight-yellow">{signalStrength}% SIGNAL</span>
            </div>
            <div className="signal-meter__bar">
              <div className="signal-meter__fill" style={{ width: `${signalStrength}%` }} />
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--full glow-pulse"
            style={{ marginTop: "var(--space-4)" }}
            onClick={() => {
              playClickSound();
              onGenerateClick();
              
              // Post real insight that a user is entering the studio
              fetch("/api/radar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user: "@visitor",
                  action: "entered the studio",
                  badge: "🚀 LFG",
                  title: "Preparing to build",
                }),
              }).catch(err => console.error("Failed to log studio entry", err));
            }}
          >
            🪪 STAMP YOUR BUILDER ID PASS
          </button>
        </div>
      </div>
    </section>
  );
}
