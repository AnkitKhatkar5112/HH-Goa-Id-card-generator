"use client";

/* ─── Process Section — "Build Your Identity" 4-Step Guide ─── */

const STEPS = [
  {
    num: "01",
    label: "UPLOAD",
    desc: "Drop your photo. HEIC, PNG, JPG — we handle it all.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="10" width="24" height="18" rx="2" stroke="var(--yellow-primary)" strokeWidth="2"/>
        <circle cx="18" cy="19" r="5" stroke="var(--pink-neon)" strokeWidth="2"/>
        <circle cx="18" cy="19" r="2" fill="var(--yellow-primary)"/>
        <rect x="12" y="7" width="12" height="4" rx="1" stroke="var(--yellow-primary)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    num: "02",
    label: "CUSTOMIZE",
    desc: "Name, role, stack, filters, stamps — make it yours.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="6" width="20" height="24" rx="2" stroke="var(--yellow-primary)" strokeWidth="2"/>
        <path d="M13 14H23M13 18H20M13 22H17" stroke="var(--pink-neon)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="26" cy="26" r="6" stroke="var(--yellow-primary)" strokeWidth="2"/>
        <path d="M26 23V29M23 26H29" stroke="var(--yellow-primary)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: "03",
    label: "GENERATE",
    desc: "One-click render. High-res 1080p canvas in milliseconds.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 6L30 18L18 30L6 18L18 6Z" stroke="var(--yellow-primary)" strokeWidth="2"/>
        <path d="M18 12L24 18L18 24L12 18L18 12Z" stroke="var(--pink-neon)" strokeWidth="1.5"/>
        <circle cx="18" cy="18" r="3" fill="var(--yellow-primary)"/>
      </svg>
    ),
  },
  {
    num: "04",
    label: "SHARE",
    desc: "Download, copy, or post directly to X with one tap.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="10" cy="18" r="4" stroke="var(--yellow-primary)" strokeWidth="2"/>
        <circle cx="26" cy="10" r="4" stroke="var(--pink-neon)" strokeWidth="2"/>
        <circle cx="26" cy="26" r="4" stroke="var(--pink-neon)" strokeWidth="2"/>
        <line x1="14" y1="16" x2="22" y2="12" stroke="var(--yellow-primary)" strokeWidth="1.5"/>
        <line x1="14" y1="20" x2="22" y2="24" stroke="var(--yellow-primary)" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function ProcessSection() {
  return (
    <section className="process-section" id="process">
      <div className="process-section__head">
        <span className="tech-label" style={{ color: "var(--pink-neon)" }}>
          FROM PHOTO TO BUILDER
        </span>
        <h2 className="process-section__title">BUILD YOUR IDENTITY</h2>
      </div>

      <div className="process-grid">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="process-step reveal"
            data-reveal-delay={`${i * 120}`}
          >
            <span className="process-step__num">{step.num}</span>

            <div className="process-step__icon-tile">
              <div className="process-step__halftone" aria-hidden="true" />
              {step.icon}
            </div>

            <h3 className="process-step__label">{step.label}</h3>
            <p className="process-step__desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
