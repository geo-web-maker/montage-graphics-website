import React, { useEffect, useRef, useState } from "react";

// Kept close in length on purpose — the old ("move" vs "remember")
// pairing forced a wide fixed box and a visible width jump. This set
// only varies from 4-6 characters, so the crossfade barely shifts
// the line width at all.
const WORDS = ["move", "follow", "trust", "guide", "linger"];
const CYCLE_MS = 2600;
const FADE_MS = 420;

export default function SplitFlapWord() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return; // freeze on first word

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setFading(false);
      }, FADE_MS);
    }, CYCLE_MS);

    return () => clearInterval(interval);
  }, []);

  const current = WORDS[index];

  return (
    <span
      className="split-flap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="off"
    >
      <span className="sr-only">{current}</span>
      {/* Single element, simple opacity + translateY crossfade — no
          second absolutely-positioned face, so there's nothing that
          can misalign or leave a gap mid-transition. */}
      <span
        className={`split-flap-word${fading ? " split-flap-fading" : ""}`}
        aria-hidden="true"
      >
        {current}
      </span>
    </span>
  );
}
