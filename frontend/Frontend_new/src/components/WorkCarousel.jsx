import React, { useEffect, useMemo, useRef, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const DRAG_PX = 5;
const AUTO_SPEED = 0.045; // px per ms for the tablet auto-scroll (~45px/s)
const RESUME_MS = 2500; // auto-scroll waits this long after the visitor lets go

// Length of one full loop of the strip (px), or 0 when the duplicated half is hidden / not a scroller.
const loopLen = (el) => {
  if (!el || getComputedStyle(el).overflowX !== "auto") return 0;
  const plates = el.querySelectorAll(".plate");
  const mid = plates[plates.length / 2];
  if (!mid || getComputedStyle(mid).display === "none") return 0;
  return mid.offsetLeft - plates[0].offsetLeft;
};

/**
 * The Collection. One DOM, three behaviours (CSS decides, see montage.css):
 *  - desktop > 1080: auto-scrolling marquee over a duplicated list, pauses on hover/focus/touch
 *  - tablet 641-1080: draggable strip (mouse drag + native touch), arrows, progress bar, snap
 *  - phone <= 640: vertical stack, one plate per row
 * Tablet also auto-scrolls (JS, seamless loop over the duplicated half); it pauses while the visitor
 *    hovers, touches, drags, focuses or uses the arrows, then resumes. Phone: duplicates stay for the vertical loop.
 * Duplicated plates are aria-hidden and unfocusable.
 */
export default function WorkCarousel({ clients = [], ready = true, onCardOpen }) {
  const viewport = useRef(null);
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0, moved: false });
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const auto = useRef({ hover: false, hold: false, resumeAt: 0 });
  const n = clients.length;

  const items = useMemo(() => {
    if (!n) return [];
    // enough copies per half that the marquee never shows a gap on a wide screen
    const half = Array.from({ length: Math.max(1, Math.ceil(6 / n)) }).flatMap(() => clients);
    return [...half, ...half];
  }, [clients, n]);

  // tablet auto-scroll: one rAF loop, no React renders per frame
  useEffect(() => {
    const el = viewport.current;
    if (!el || !n) return undefined;
    const tablet = window.matchMedia("(min-width: 641px) and (max-width: 1080px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let pos = null;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(t - last, 64) : 0;
      last = t;
      const a = auto.current;
      const L = tablet.matches && !reduce.matches && !document.hidden ? loopLen(el) : 0;
      if (!L || a.hover || a.hold || performance.now() < a.resumeAt) { pos = null; return; }
      if (pos === null) pos = el.scrollLeft;
      pos += dt * AUTO_SPEED;
      if (pos >= L) pos -= L;
      el.scrollLeft = pos;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  const letGo = () => { auto.current.hold = false; auto.current.resumeAt = performance.now() + RESUME_MS; };

  const updateProgress = () => {
    const el = viewport.current;
    if (!el) return;
    const L = loopLen(el);
    const max = el.scrollWidth - el.clientWidth;
    const next = L ? (el.scrollLeft % L) / L : max > 0 ? el.scrollLeft / max : 0;
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
    auto.current.hold = true;
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
    letGo();
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
    auto.current.resumeAt = performance.now() + RESUME_MS * 1.5;
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
            onPointerEnter={(e) => { if (e.pointerType === "mouse") auto.current.hover = true; }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") { auto.current.hover = false; letGo(); } }}
            onFocus={() => { auto.current.hold = true; }}
            onBlur={letGo}
            onTouchStart={() => { auto.current.hold = true; setTouched(true); }}
            onTouchEnd={() => { letGo(); setTouched(false); }}
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
            <span className="t-only">Auto-scrolling · drag or use the arrows</span>
            <span className="m-only">Auto-scrolling · tap to pause</span>
          </div>
        </>
      )}
    </section>
  );
}
