import React, { useEffect, useRef, useState } from "react";

const WORDS = ["move", "remember", "follow", "choose", "trust"];
const CYCLE_MS = 2600;
const FLIP_MS = 500;

export default function SplitFlapWord() {
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);
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
      setFlipping(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setFlipping(false);
      }, FLIP_MS);
    }, CYCLE_MS);

    return () => clearInterval(interval);
  }, []);

  const current = WORDS[index];
  const next = WORDS[(index + 1) % WORDS.length];

  return (
    <span
      className="split-flap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="off"
    >
      <span className="sr-only">{current}</span>
      <span className={`split-flap-panel${flipping ? " flipping" : ""}`} aria-hidden="true">
        <span className="split-flap-face split-flap-current">{current}</span>
        <span className="split-flap-face split-flap-next">{next}</span>
      </span>
    </span>
  );
}
