"use client";

import { useEffect } from "react";

/**
 * Intersection Observer hook that adds `.reveal--visible` to
 * elements with `.reveal` when they scroll into view.
 *
 * Uses MutationObserver to pick up dynamically-added elements.
 * Supports staggered delays via `data-reveal-delay="100"` (ms).
 * Respects `prefers-reduced-motion`.
 */
export function useScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("reveal--visible"));
      return;
    }

    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);

          if (delay > 0) {
            setTimeout(() => el.classList.add("reveal--visible"), delay);
          } else {
            el.classList.add("reveal--visible");
          }

          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    function observeAll() {
      document.querySelectorAll(".reveal:not(.reveal--visible)").forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      });
    }

    // Observe existing elements
    observeAll();

    // Watch for dynamically added .reveal elements
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
