import React, { useEffect, useRef, useState } from "react";

const SESSION_KEY = "montage-loaded";
// Minimum time the mark stays up, so the entrance animation always
// finishes even when `ready` arrives almost instantly.
const MIN_HOLD_MS = 950;
// Safety net so a slow/failed clients request never leaves the
// loader stuck forever — it leaves anyway once this elapses.
const MAX_HOLD_MS = 4000;

export default function LoadingScreen({ ready }) {
  const [phase, setPhase] = useState(() => {
    if (typeof window === "undefined") return "done";
    if (sessionStorage.getItem(SESSION_KEY)) return "done";
    return "in";
  });
  const mountedAt = useRef(null);
  const didInit = useRef(false);

  // One-time setup when the loader first appears: mark the session,
  // record the mount time, and arm the absolute upper bound.
  useEffect(() => {
    if (phase !== "in" || didInit.current) return;
    didInit.current = true;

    sessionStorage.setItem(SESSION_KEY, "1");
    mountedAt.current = Date.now();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      const t = setTimeout(() => setPhase("out"), 300);
      return () => clearTimeout(t);
    }

    const maxTimer = setTimeout(() => setPhase("out"), MAX_HOLD_MS);
    return () => clearTimeout(maxTimer);
  }, [phase]);

  // Leave as soon as both "carousel data loaded" and "minimum hold
  // elapsed" are true — this is what actually ties the loading
  // screen's exit to the work carousel finishing its fetch.
  useEffect(() => {
    if (phase !== "in" || !ready) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const elapsed = Date.now() - (mountedAt.current || Date.now());
    const remaining = Math.max(MIN_HOLD_MS - elapsed, 0);
    const t = setTimeout(() => setPhase("out"), remaining);
    return () => clearTimeout(t);
  }, [phase, ready]);

  useEffect(() => {
    if (phase !== "out") return;
    const removeTimer = setTimeout(() => setPhase("done"), 500);
    return () => clearTimeout(removeTimer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`loader-screen${phase === "out" ? " loader-out" : ""}`}>
      <img
        src="/logo loader.png"
        alt=""
        className="loader-mark"
        draggable={false}
      />
    </div>
  );
}
