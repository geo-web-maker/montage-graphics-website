import React, { useEffect, useState } from "react";
import { getClientWork } from "../api/client";

/**
 * Full-screen gallery for one client. The plate grows to fill the screen (useExpandCard), then the
 * set fades in as CSS columns (images keep their natural ratios, so no JS masonry measuring).
 */
export default function ExpandOverlay({ expanded, filled, gridVisible, overlayStyle, onTransitionEnd, onClose }) {
  const [work, setWork] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  const slug = expanded?.client?.slug;
  useEffect(() => {
    if (!slug) {
      setWork([]);
      setStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setWork([]);
    setStatus("loading");
    getClientWork(slug)
      .then((rows) => { if (!cancelled) { setWork(rows); setStatus("ready"); } })
      .catch((err) => {
        console.error("Failed to load work images:", err);
        if (!cancelled) setStatus("error");
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Esc closes; the page behind must not scroll while the overlay is open
  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded, onClose]);

  const name = expanded?.client?.name || "";
  return (
    <>
      <div className={`expand-scrim${expanded ? " visible" : ""}`} onClick={onClose} />
      <button type="button" className={`expand-close${gridVisible ? " visible" : ""}`} aria-label="Close" onClick={onClose}>×</button>

      {expanded && (
        <div
          className={`expand-overlay${filled ? " filled" : ""}`}
          style={overlayStyle}
          onTransitionEnd={onTransitionEnd}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} work`}
        >
          <div className={`expand-inner${gridVisible ? " visible" : ""}`}>
            <div className="modal-head">
              <span className="mono">COL 01–12 / {name.toUpperCase()}</span>
              <h3>{name}</h3>
              <div className="sub">
                {status === "ready" ? `${work.length} ${work.length === 1 ? "piece" : "pieces"}` : status === "loading" ? "Loading the set…" : ""}
              </div>
            </div>
            {status === "error" && <p className="empty" role="alert">Couldn&rsquo;t load this set. Close and try again.</p>}
            {status === "ready" && work.length === 0 && <p className="empty">No pieces in this set yet.</p>}
            <div className="expand-grid">
              {work.map((img, i) => (
                <div className="tile" style={{ "--d": `${Math.min(i, 10) * 70}ms` }} key={img.id}>
                  <img src={img.image_url} alt={img.caption || `${name} work ${i + 1}`} loading="lazy" />
                  {img.caption && <span className="cp">{img.caption}</span>}
                </div>
              ))}
            </div>
            <a className="btn modal-cta" href="#contact" onClick={onClose}>Start a project like this<i className="ar">→</i></a>
          </div>
        </div>
      )}
    </>
  );
}
