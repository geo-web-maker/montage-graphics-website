import React, { useMemo, useRef, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const DRAG_PX = 5;

/**
 * The Collection. One DOM, three behaviours (CSS decides, see montage.css):
 *  - desktop > 1080: auto-scrolling marquee over a duplicated list, pauses on hover/focus/touch
 *  - tablet 641-1080: draggable strip (mouse drag + native touch), arrows, progress bar, snap
 *  - phone <= 640: vertical stack, one plate per row
 * The duplicated plates are aria-hidden, unfocusable and display:none below 1081px.
 */
export default function WorkCarousel({ clients = [], ready = true, onCardOpen }) {
  const viewport = useRef(null);
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0, moved: false });
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const n = clients.length;

  const items = useMemo(() => {
    if (!n) return [];
    // enough copies per half that the marquee never shows a gap on a wide screen
    const half = Array.from({ length: Math.max(1, Math.ceil(6 / n)) }).flatMap(() => clients);
    return [...half, ...half];
  }, [clients, n]);

  const updateProgress = () => {
    const el = viewport.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = max > 0 ? el.scrollLeft / max : 0;
    setProgress((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
  };

  // mouse drag only applies where the viewport is a scroll container (tablet strip)
  const canDrag = () => {
    const el = viewport.current;
    return !!el && getComputedStyle(el).overflowX === "auto";
  };
  const onPointerDown = (e) => {
    const el = viewport.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0 || !canDrag()) return;
    // a fresh gesture always clears the previous one, so a drag that ended off a plate can never
    // swallow the next genuine click
    drag.current = { down: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    const el = viewport.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > DRAG_PX) {
      d.moved = true;
      setDragging(true);
      el.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.scrollLeft - dx;
  };
  const endDrag = (e) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    setDragging(false);
    try { viewport.current?.releasePointerCapture?.(e.pointerId); } catch { /* not captured */ }
  };
  const onClickCapture = (e) => {
    // a drag longer than 5px must not open the overlay
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };
  const step = (dir) => {
    const el = viewport.current;
    if (!el) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.72), behavior });
  };

  return (
    <section id="work">
      <div className="wrap sec-head reveal">
        <div>
          <span className="mono"><b>Sequence 02</b> — Selected clients</span>
          <h2>The <em>Collection</em></h2>
        </div>
        <div className="wc-ctl">
          <span className="mono">Select a plate to open the full set</span>
          <button type="button" aria-label="Previous collection items" onClick={() => step(-1)}>←</button>
          <button type="button" aria-label="Next collection items" onClick={() => step(1)}>→</button>
        </div>
        <span className="mono sec-hint">Tap a plate to open the full set →</span>
      </div>

      {!n ? (
        <p className="note mono" role="status">{ready ? "New work is being added. Check back soon." : "Loading the collection…"}</p>
      ) : (
        <>
          <div
            ref={viewport}
            className={`wc-viewport${dragging ? " drag" : ""}${touched ? " touched" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            onScroll={updateProgress}
            onTouchStart={() => setTouched(true)}
            onTouchEnd={() => setTouched(false)}
          >
            <div className="wc-track">
              {items.map((card, i) => {
                const dup = i >= n;
                return (
                  <button
                    type="button"
                    className={`plate reveal${dup ? " dup" : ""}`}
                    style={{ "--d": `${(i % 8) * 60}ms`, "--dom": card.logo_dominant_color || "#2F4B3C" }}
                    key={`${card.id}-${i}`}
                    aria-hidden={dup ? "true" : undefined}
                    tabIndex={dup ? -1 : 0}
                    aria-label={`Open ${card.name} work`}
                    onClick={(e) => onCardOpen?.(e, card)}
                  >
                    <span className="no mono">PLATE {pad((i % n) + 1)}</span>
                    <div className="frame">
                      <img className="logo" src={card.logo_url} alt="" draggable={false} loading="lazy" />
                    </div>
                    <div className="cap"><b>{card.name}</b></div>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="wc-progress"
            role="progressbar"
            aria-label="Collection scroll position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
          <div className="scroll-note">
            <span className="d-only">Auto-scrolling · hover to pause</span>
            <span className="t-only">Drag or use the arrows to browse</span>
            <span className="m-only">Auto-scrolling · tap to pause</span>
          </div>
        </>
      )}
    </section>
  );
}
