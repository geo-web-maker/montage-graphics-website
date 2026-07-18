import React from "react";
import { CLIENT_WORK_COUNTS } from "../data";

export default function ExpandOverlay({
  expanded,
  filled,
  gridVisible,
  overlayStyle,
  onTransitionEnd,
  onClose,
}) {
  const tileCount = expanded ? CLIENT_WORK_COUNTS[expanded.client] || 4 : 0;

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
            {Array.from({ length: tileCount }).map((_, i) => (
              <div className="tile" key={i} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
