import React, { useEffect, useRef, useState } from "react";

const SESSION_KEY = "montage-loaded";
const MIN_HOLD_MS = 950; // the entrance animation always finishes
const MAX_HOLD_MS = 4000; // a slow or failed request never traps the visitor
const EXIT_MS = 500;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// sessionStorage can throw (private mode, blocked storage); the loader must still work
const seen = () => { try { return !!sessionStorage.getItem(SESSION_KEY); } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ } };

/** First-visit loader: the mark scales in, holds, then fades once the clients fetch has settled. */
export default function LoadingScreen({ ready }) {
  const [phase, setPhase] = useState(() => (typeof window === "undefined" || seen() ? "done" : "in"));
  const mountedAt = useRef(0);

  useEffect(() => {
    if (phase !== "in") return undefined;
    markSeen();
    mountedAt.current = Date.now();
    const t = setTimeout(() => setPhase("out"), reducedMotion() ? 300 : MAX_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase === "in"]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "in" || !ready || reducedMotion()) return undefined;
    const remaining = Math.max(MIN_HOLD_MS - (Date.now() - mountedAt.current), 0);
    const t = setTimeout(() => setPhase("out"), remaining);
    return () => clearTimeout(t);
  }, [phase, ready]);

  useEffect(() => {
    if (phase !== "out") return undefined;
    const t = setTimeout(() => setPhase("done"), EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;
  return (
    <div className={`loader-screen${phase === "out" ? " out" : ""}`} aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}logo loader.png`} alt="" draggable={false} />
    </div>
  );
}
