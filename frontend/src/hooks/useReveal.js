import { useEffect } from "react";

/**
 * One-shot fade + slide-up scroll reveal.
 * Attaches to any element with the `.reveal` class inside `root`
 * (defaults to the whole document). Adds `.revealed` once the element
 * enters the viewport, then stops observing it (no re-trigger on
 * scroll-up). No-ops entirely under prefers-reduced-motion, since the
 * CSS for `.reveal` is itself gated behind that same media query.
 */
export function useReveal(root) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const scope = root?.current || document;
    const targets = scope.querySelectorAll(".reveal:not(.revealed)");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || 0;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("revealed");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [root]);
}
