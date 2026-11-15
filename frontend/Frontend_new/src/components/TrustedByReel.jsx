import React from "react";

/** Client-name ticker. Receives the clients MontagePage already fetched (no second request). */
export default function TrustedByReel({ clients = [] }) {
  if (!clients.length) return null;
  // Repeat the list until one half is wider than any screen, then double it so translateX(-50%)
  // loops seamlessly even with only two or three clients.
  const reps = Math.max(1, Math.ceil(8 / clients.length));
  const half = Array.from({ length: reps }).flatMap(() => clients);
  const items = [...half, ...half];
  return (
    <div className="reel" aria-label="Trusted by">
      <div className="reel-track">
        {items.map((c, i) => (
          <span key={`${c.id}-${i}`} aria-hidden={i >= clients.length ? "true" : undefined}>{c.name}</span>
        ))}
      </div>
    </div>
  );
}
