import React, { useEffect, useState } from "react";

const SESSION_KEY = "montage-loaded";
const HOLD_MS = 950;

export default function LoadingScreen() {
  const [phase, setPhase] = useState(() => {
    if (typeof window === "undefined") return "done";
    if (sessionStorage.getItem(SESSION_KEY)) return "done";
    return "in";
  });

  useEffect(() => {
    if (phase === "done") return;

    sessionStorage.setItem(SESSION_KEY, "1");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const holdTimer = setTimeout(
      () => setPhase("out"),
      reduced ? 300 : HOLD_MS
    );
    return () => clearTimeout(holdTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "out") return;
    const removeTimer = setTimeout(() => setPhase("done"), 500);
    return () => clearTimeout(removeTimer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`loader-screen${phase === "out" ? " loader-out" : ""}`}>
      <img
        src="/logo header.png"
        alt=""
        className="loader-mark"
        draggable={false}
      />
    </div>
  );
}
