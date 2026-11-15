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

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || 0;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("revealed");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    const observe = (el) => io.observe(el);

    // Elements present at mount time.
    scope
      .querySelectorAll(".reveal:not(.revealed)")
      .forEach(observe);

    // Elements added later (e.g. carousel cards that arrive after an
    // async fetch resolves) — without this, anything not in the DOM
    // on the first scan never gets observed and stays at opacity:0
    // forever, which is exactly what made the carousel "vanish".
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(".reveal:not(.revealed)")) observe(node);
          node
            .querySelectorAll?.(".reveal:not(.revealed)")
            .forEach(observe);
        });
      }
    });
    mo.observe(scope === document ? document.body : scope, {
      childList: true,
      subtree: true,
    });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [root]);
}
