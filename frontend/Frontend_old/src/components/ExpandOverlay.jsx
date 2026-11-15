import React, { useCallback, useEffect, useRef, useState } from "react";
import { getClientWork } from "../api/client";

// Kept intentionally tiny: rowSpan always rounds UP to the nearest whole
// row (see recomputeSpans), so a coarse unit here means the rendered box
// can end up noticeably taller than the image needs — which, now that the
// image is object-fit:contain, shows up as a visible empty strip inside
// the tile instead of being silently cropped away like it used to be.
const ROW_UNIT = 2;
const GAP = 14;
// The aspect ratio a single grid column is roughly built for. Dividing an
// image's real ratio by this gives how many columns it needs to occupy to
// keep its box roughly that same "normal" shape — a 3:1 banner needs about
// 3x the columns a ~1:1 photo does, not a flat 1-or-2 cap.
const BASE_TILE_RATIO = 1.2;

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
    // expanded.client is the full client object (see WorkCarousel's onCardOpen).
    getClientWork(expanded.client.slug)
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
        // Scale colSpan to the image's real ratio instead of a flat 1-or-2
        // cap — a 3:1 banner needs roughly twice the columns a 1.6:1 image
        // does, or the box ends up too tall for the image and object-fit
        // crops the sides to compensate.
        const colSpan = Math.min(cols, Math.max(1, Math.round(ratio / BASE_TILE_RATIO)));
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
      <div className={`expand-scrim${expanded ? " visible" : ""}`} />
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
          <div className={`expand-inner${gridVisible ? " visible" : ""}`}>
            {expanded && (
              <div className="modal-head">
                <div className="label coord">
                  COL 01–12 / {expanded.client.name.toUpperCase()}
                </div>
                <h3>{expanded.client.name}</h3>
                <div className="sub">
                  {work.length} {work.length === 1 ? "piece" : "pieces"}
                </div>
              </div>
            )}
            <div className="expand-grid" ref={gridRef}>
              {work.map((img) => {
                const span = spans[img.id];
                const style = span
                  ? { "--row-span": span.rowSpan, "--col-span": span.colSpan }
                  : undefined;
                return (
                  <div className={`tile${span ? " measured" : ""}`} key={img.id} style={style}>
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
        </div>
      )}
    </>
  );
}
