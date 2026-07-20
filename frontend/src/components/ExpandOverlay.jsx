import React, { useCallback, useEffect, useRef, useState } from "react";
import { getClientWork } from "../api/client";

// Must match the grid-auto-rows / gap values in montage.css's .expand-grid.
const ROW_UNIT = 6;
const GAP = 14;
// Aspect ratio (width/height) at or above which a tile is wide enough to
// deserve 2 grid columns instead of being squeezed into one.
const WIDE_RATIO = 1.6;

export default function ExpandOverlay({
  expanded,
  filled,
  gridVisible,
  overlayStyle,
  onTransitionEnd,
  onClose,
}) {
  const [work, setWork] = useState([]);
  const [ratios, setRatios] = useState({}); // { [imgId]: naturalWidth/naturalHeight }
  const [spans, setSpans] = useState({}); // { [imgId]: { rowSpan, colSpan } }
  const gridRef = useRef(null);

  useEffect(() => {
    if (!expanded) {
      setWork([]);
      setRatios({});
      setSpans({});
      return;
    }
    // expanded.client is the client's slug (see WorkCarousel's onCardOpen).
    getClientWork(expanded.client)
      .then(setWork)
      .catch((err) => console.error("Failed to load work images:", err));
  }, [expanded]);

  // Recompute every tile's row/col span from its real aspect ratio plus the
  // grid's *current* column width — reruns on image load and on resize, so
  // a wide (landscape) image gets 2 columns instead of being crushed into
  // the width of a single narrow one, and every box's height is derived
  // from the actual image instead of a fixed guess.
  const recomputeSpans = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const colWidth = (grid.clientWidth - GAP * (cols - 1)) / cols;
    if (!(colWidth > 0)) return;

    setSpans((prev) => {
      const next = { ...prev };
      for (const img of work) {
        const ratio = ratios[img.id];
        if (!ratio) continue;
        const colSpan = ratio >= WIDE_RATIO ? Math.min(2, cols) : 1;
        const widthPx = colSpan * colWidth + (colSpan - 1) * GAP;
        const heightPx = widthPx / ratio;
        const rowSpan = Math.max(1, Math.ceil((heightPx + GAP) / (ROW_UNIT + GAP)));
        next[img.id] = { rowSpan, colSpan };
      }
      return next;
    });
  }, [work, ratios]);

  useEffect(() => {
    recomputeSpans();
  }, [recomputeSpans]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!gridVisible || !grid) return;
    const ro = new ResizeObserver(() => recomputeSpans());
    ro.observe(grid);
    return () => ro.disconnect();
  }, [gridVisible, recomputeSpans]);

  const handleImgLoad = (id, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (!naturalWidth || !naturalHeight) return;
    setRatios((prev) => ({ ...prev, [id]: naturalWidth / naturalHeight }));
  };

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
          <div className={`expand-grid${gridVisible ? " visible" : ""}`} ref={gridRef}>
            {work.map((img) => {
              const span = spans[img.id];
              const style = span
                ? { "--row-span": span.rowSpan, "--col-span": span.colSpan }
                : undefined;
              return (
                <div className="tile" key={img.id} style={style}>
                  <img
                    src={img.image_url}
                    alt={img.caption || ""}
                    onLoad={(e) => handleImgLoad(img.id, e)}
                  />
                  {img.caption && <span className="tile-caption">{img.caption}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
