"use client";

import { useState } from "react";
import { playClickSound } from "../lib/audioUtils";

const FAQ_ITEMS = [
  {
    q: "Who can participate in Hacker House Goa 2026?",
    a: "Anyone with a passion for building! Whether you're a full-stack developer, AI engineer, UI/UX artisan, or smart contract wizard — you're welcome here. Solo builders & teams of 1–4 are supported.",
  },
  {
    q: "How do I generate my HH Goa Builder ID & PFP Frame?",
    a: "Upload your photo in our studio above, pick your engineering stack, hit Reroll to spin your random Goan Builder Title (e.g., 'Full-Stack Coconut Hacker'), apply color filters and stamp badges, then download or share directly to X with #FrameInGoa!",
  },
  {
    q: "Is there any registration fee for Hacker House Goa?",
    a: "No! Participation in Hacker House Goa is 100% free. We provide workspace, high-speed fiber, meals, caffeine, and beachside lodging. You just need your laptop and shipping energy.",
  },
  {
    q: "What should I bring to the Goa Residency?",
    a: "Bring your laptop, charger, hardware rigs, sunscreen, flip-flops, and pure building signal. We take care of power, fiber, meals, and midnight chai.",
  },
  {
    q: "Can I start coding before the event?",
    a: "Brainstorming and architecture design are encouraged ahead of time, but all code for hackathon prizes must be written during the residency. Using open-source libraries and APIs is fully supported.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    playClickSound();
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="faq-section fade-in-up" id="faqs">
      <div className="section-header">
        <span className="section-header__tag">FREQUENTLY ASKED QUESTIONS</span>
        <h2 className="section-header__title">
          FAQS // <span className="highlight-yellow">NEED TO KNOW</span>
        </h2>
      </div>

      <div className="faq-list">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className={`faq-item ${openIdx === idx ? "faq-item--open" : ""}`}
            onClick={() => toggleFaq(idx)}
            role="button"
            tabIndex={0}
          >
            <div className="faq-item__question">
              <span className="faq-item__q-text">{item.q}</span>
              <span className="faq-item__icon">{openIdx === idx ? "−" : "+"}</span>
            </div>
            {openIdx === idx && <div className="faq-item__answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
