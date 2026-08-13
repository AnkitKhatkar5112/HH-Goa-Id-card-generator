"use client";

import { useState } from "react";
import { playClickSound } from "../lib/audioUtils";

const AGENDA_DAYS = [
  {
    day: "DAY 01",
    title: "GENESIS DAY",
    subtitle: "where it all begins",
    icon: "🌅",
    tag: "ORIENTATION & TEAM MATCHING",
    desc: "Check-in at the Goa beachside residency, lock in your team of 1–3, set up your dev environments on high-speed fiber, and attend the kickoff keynote.",
  },
  {
    day: "DAY 02",
    title: "DAY OF TRIANGLE",
    subtitle: "problem . solution . market",
    icon: "📐",
    tag: "ARCHITECTURE & MENTOR REVIEWS",
    desc: "Refine your technical architecture. Validate the problem, sharpen the solution, map the market fit. 1-on-1 teardowns with senior mentors.",
  },
  {
    day: "DAY 03",
    title: "BUILD DAY",
    subtitle: "heads down . ship or ship",
    icon: "⚡",
    tag: "24-HOUR HACKATHON MARATHON",
    desc: "Pure terminal velocity. Midnight chai runs, beachside debugging sessions, zero interruptions. Code till your features are locked in.",
  },
  {
    day: "DAY 04",
    title: "LAUNCH DAY",
    subtitle: "the world watches",
    icon: "🚀",
    tag: "DEMO DAY & BOUNTY CEREMONY",
    desc: "Live project launches in front of top VCs, founders, and the global developer community. Winners claim $50k+ in bounties & residency perks.",
  },
];

const ROADMAP_STEPS = [
  { step: "01", title: "Generate Builder ID", status: "OPEN NOW", active: true },
  { step: "02", title: "Open Trials", status: "IN PROGRESS", active: true },
  { step: "03", title: "Alpha Selections", status: "UPCOMING", active: false },
  { step: "04", title: "Beta & Charlie Review", status: "UPCOMING", active: false },
  { step: "05", title: "Goa Residency", status: "OCT 28–31", active: false },
];

export default function TimelineAgenda() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  return (
    <section className="agenda-section" id="agenda">
      <div className="section-header">
        <span className="section-header__tag">INSIDE THE ROOM</span>
        <h2 className="section-header__title">
          4 DAYS. ONE RHYTHM. <span className="highlight-yellow">EVERYTHING INTENTIONAL.</span>
        </h2>
      </div>

      {/* 4-Day Rhythm Cards */}
      <div className="agenda-grid">
        {AGENDA_DAYS.map((item, idx) => (
          <div
            key={item.day}
            className={`agenda-card ${activeDayIndex === idx ? "agenda-card--active" : ""}`}
            onClick={() => {
              playClickSound();
              setActiveDayIndex(idx);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="agenda-card__top">
              <span className="agenda-card__day">{item.day}</span>
              <span className="agenda-card__icon">{item.icon}</span>
            </div>
            <h3 className="agenda-card__title">{item.title}</h3>
            <p className="agenda-card__subtitle">&quot;{item.subtitle}&quot;</p>
            <span className="agenda-card__tag">{item.tag}</span>
            <p className="agenda-card__desc">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Timeline Roadmap at a glance */}
      <div className="roadmap-container">
        <h3 className="roadmap-title">THE TIMELINE AT A GLANCE</h3>
        <div className="roadmap-steps">
          {ROADMAP_STEPS.map((r) => (
            <div
              key={r.step}
              className={`roadmap-step ${r.active ? "roadmap-step--active" : ""}`}
            >
              <span className="roadmap-step__num">{r.step}</span>
              <span className="roadmap-step__name">{r.title}</span>
              <span className="roadmap-step__status">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
