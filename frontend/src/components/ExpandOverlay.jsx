import React, { useEffect, useState } from "react";
import { getClientWork } from "../api/client";

export default function ExpandOverlay({
  expanded,
  filled,
  gridVisible,
  overlayStyle,
  onTransitionEnd,
  onClose,
}) {
  const [work, setWork] = useState([]);

  useEffect(() => {
    if (!expanded) {
      setWork([]);
      return;
    }
    // expanded.client is the client's slug (see WorkCarousel's onCardOpen).
    getClientWork(expanded.client)
      .then(setWork)
      .catch((err) => console.error("Failed to load work images:", err));
  }, [expanded]);

  return (
    <>
      <button
        className={`expand-close${gridVisible ? " visible" : ""}`}
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>

      {expanded && (
        <div
          className={`expand-overlay${filled ? " filled" : ""}`}
          style={overlayStyle}
          onTransitionEnd={onTransitionEnd}
        >
          <div className={`expand-grid${gridVisible ? " visible" : ""}`}>
            {work.map((img) => (
              <div className={`tile shape-${img.shape}`} key={img.id}>
                <img src={img.image_url} alt={img.caption || ""} />
                {img.caption && <span className="tile-caption">{img.caption}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
