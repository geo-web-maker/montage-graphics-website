import { useEffect } from "react";

/**
 * One-shot fade + slide-up scroll reveal. Any `.reveal` element gets `.in` the first time it
 * enters the viewport (CSS does the transition; a per-element `--d` custom property sets the
 * stagger, so there is no inline transition-delay fighting other transitions).
 *
 * Under prefers-reduced-motion the CSS already shows `.reveal` elements, so this is a no-op.
 * A MutationObserver picks up elements added after mount (e.g. plates that arrive with the
 * clients fetch), which would otherwise stay invisible.
 */
export function useReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".montage-root .reveal").forEach((el) => el.classList.add("in"));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const observe = (el) => { if (!el.classList.contains("in")) io.observe(el); };
    const scan = (node) => {
      if (node.nodeType !== 1) return;
      if (node.matches?.(".reveal")) observe(node);
      node.querySelectorAll?.(".reveal").forEach(observe);
    };

    const root = document.querySelector(".montage-root") || document.body;
    scan(root);
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach(scan));
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
