import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_COLOR = "#1c2330";
const safeColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : FALLBACK_COLOR);

/**
 * "Grow the clicked plate to fill the screen" interaction (FLIP-style).
 * Returns the overlay state plus handlers for the plate and the close button.
 */
export function useExpandCard() {
  const [expanded, setExpanded] = useState(null); // { client, top, left, width, height } | null
  const [filled, setFilled] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);
  const timer = useRef(0);

  const clearTimer = () => {
    clearTimeout(timer.current);
    timer.current = 0;
  };
  useEffect(() => clearTimer, []);

  const openExpand = useCallback((e, client) => {
    const rect = (e.currentTarget.querySelector?.(".frame") || e.currentTarget).getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimer();
    setGridVisible(false);
    setFilled(false);
    setExpanded({ client, top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    // Paint the plate-sized overlay first, then flip to fullscreen so the size change transitions.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFilled(true);
        // transitionend never fires when transitions are off (reduced motion) or interrupted,
        // so the set must not depend on it alone.
        timer.current = setTimeout(() => setGridVisible(true), reduced ? 0 : 900);
      });
    });
  }, []);

  const handleTransitionEnd = useCallback(
    (e) => {
      if (e.propertyName !== "width" || !filled) return;
      clearTimer();
      setGridVisible(true);
    },
    [filled]
  );

  const closeExpand = useCallback(() => {
    clearTimer();
    setGridVisible(false);
    setFilled(false);
    setExpanded(null);
  }, []);

  const background = expanded
    ? (() => {
        const c = safeColor(expanded.client.logo_dominant_color);
        return `linear-gradient(160deg, ${c}ee, ${c}66 55%, #141518 100%)`;
      })()
    : undefined;

  const overlayStyle = expanded
    ? filled
      ? { top: 0, left: 0, width: "100vw", height: "100vh", background }
      : { top: expanded.top, left: expanded.left, width: expanded.width, height: expanded.height, background }
    : null;

  return { expanded, filled, gridVisible, overlayStyle, openExpand, closeExpand, handleTransitionEnd };
}
