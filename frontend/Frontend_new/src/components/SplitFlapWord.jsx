import React, { useEffect, useState } from "react";

// Short words of similar length so the line barely shifts as the word changes.
const DEFAULT_WORDS = ["move", "follow", "trust", "guide", "linger"];
const CYCLE_MS = 2600;
const FADE_MS = 420;

/** Cycling hero word (A6 "flap"): fade/lift out, swap, back in. Keep admin-supplied words short. */
export default function SplitFlapWord({ words }) {
  const list = words?.length ? words : DEFAULT_WORDS;
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);
  const count = list.length;

  useEffect(() => {
    setIndex(0);
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let swap = 0;
    const interval = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % count);
        setOut(false);
      }, FADE_MS);
    }, CYCLE_MS);
    // list identity changes when the API content arrives; `count` is what the loop depends on
    return () => {
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, [count]);

  return (
    <span className={`flap${out ? " out" : ""}`} aria-hidden="true">
      <em>{list[index % count]}</em>
    </span>
  );
}
