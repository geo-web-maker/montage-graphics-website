import { useEffect } from "react";
import { SC, LOOP } from "../editBay";

const pad = (n) => String(n).padStart(2, "0");
const cl = (x) => Math.max(0, Math.min(1, x));
const eo = (x) => 1 - Math.pow(1 - cl(x), 3);

function timecode(t) {
  const sec = t * LOOP;
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(Math.floor(sec) % 60)}:${pad(Math.floor((sec % 1) * 24))}`;
}

/**
 * The A6 "edit bay" engine. One requestAnimationFrame loop drives the hero program
 * monitor, the five-lane timeline, the phone scene chips and the nav's REC timecode/dot.
 *
 * It writes straight to the DOM (CSS variables, classes, text) instead of React state, so a
 * 60fps tick never re-renders a component. The markup is rendered by Hero/StudioTimeline/
 * Header; this hook only finds it by class / data-bay attribute inside `rootRef`.
 */
export function useEditBay(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ac = new AbortController();
    const { signal } = ac;
    const q = (s) => root.querySelector(s);
    const qa = (s) => [...root.querySelectorAll(s)];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scEls = qa(".mon .sc");
    const lanes = q(".lanes");
    const head = q(".lanes .head");
    const clips = qa(".seg[data-i]");
    const mks = qa(".lanes .mk");
    const chips = qa(".tl-m .chip");
    const progBar = q(".tl-m .prog b");
    const progHead = q(".tl-m .prog u");
    const stats = qa(".tl-m .st");
    const tcEls = qa("[data-bay=tc]");
    const sno = q("[data-bay=sno]");
    const snm = q("[data-bay=snm]");
    const scn = q("[data-bay=scn]");
    const play = q(".play");

    // reduced motion: hold on a representative frame, no autoplay; scrubbing still works
    let t = reduced ? 0.3 : 0;
    let paused = reduced;
    let scrubbing = false;
    let resumeAt = 0;
    let last = performance.now();
    let lastIdx = -1;
    let lastTc = "";
    let lastNow = -1;
    let raf = 0;

    if (reduced && play) {
      play.classList.add("off");
      play.setAttribute("aria-label", "Play the reel");
    }

    function render() {
      t = cl(t);
      let idx = SC.findIndex((s) => t >= s.s && t < s.e);
      if (idx < 0) idx = SC.length - 1;
      const s = SC[idx];
      const p = (t - s.s) / (s.e - s.s);

      scEls.forEach((el, i) => el.classList.toggle("on", i === idx));
      const el = scEls[idx];
      if (el) {
        el.style.setProperty("--p", p);
        for (let k = 1; k <= 5; k++) el.style.setProperty(`--e${k}`, eo((p - (k - 1) * 0.1) / 0.28));
        el.style.setProperty("--x", cl((p - 0.9) / 0.1));
      }

      const pos = t * 100;
      if (head) head.style.left = `${pos}%`;
      clips.forEach((c, i) => c.classList.toggle("act", i === idx));
      mks.forEach((m) => m.classList.toggle("hit", reduced || pos >= +m.dataset.at));
      if (idx !== lastIdx) {
        if (sno) sno.textContent = pad(idx + 1);
        if (snm) snm.textContent = s.n;
        if (scn) scn.textContent = `${pad(idx + 1)} · ${s.n}`;
        root.style.setProperty("--acc", s.c); // nav REC dot follows the active scene
        chips.forEach((c, i) => c.classList.toggle("act", i === idx));
        if (lanes) lanes.setAttribute("aria-valuetext", `Scene ${idx + 1}, ${s.n}`);
        lastIdx = idx;
      }
      if (progBar) progBar.style.width = `${pos}%`;
      if (progHead) progHead.style.left = `${pos}%`;
      stats.forEach((m) => m.classList.toggle("hit", reduced || pos >= +m.dataset.at));

      const tc = timecode(t);
      if (tc !== lastTc) {
        tcEls.forEach((n) => { n.textContent = tc; });
        lastTc = tc;
      }
      const now = Math.round(pos);
      if (lanes && now !== lastNow) {
        lanes.setAttribute("aria-valuenow", now);
        lastNow = now;
      }
    }

    function tick(now) {
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      if (!document.hidden && !paused && !scrubbing && now > resumeAt) t = (t + dt / LOOP) % 1;
      render();
      raf = requestAnimationFrame(tick);
    }

    // jump somewhere, then let the reel carry on after a short hold
    function jump(to, holdMs) {
      t = to;
      resumeAt = performance.now() + holdMs;
      render();
    }

    render();
    if (!reduced) raf = requestAnimationFrame(tick);

    // scrub by dragging the lanes
    if (lanes) {
      const setT = (e) => {
        const r = lanes.getBoundingClientRect();
        t = Math.min(0.9999, Math.max(0, (e.clientX - r.left) / r.width));
        render();
      };
      lanes.addEventListener("pointerdown", (e) => {
        scrubbing = true;
        lanes.setPointerCapture?.(e.pointerId);
        setT(e);
      }, { signal });
      lanes.addEventListener("pointermove", (e) => { if (scrubbing) setT(e); }, { signal });
      const end = () => {
        if (!scrubbing) return;
        scrubbing = false;
        resumeAt = performance.now() + 2500;
      };
      lanes.addEventListener("pointerup", end, { signal });
      lanes.addEventListener("pointercancel", end, { signal });
      lanes.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 0.1 : 0.01;
        if (e.key === "ArrowRight") jump(Math.min(0.9999, t + step), 4000);
        else if (e.key === "ArrowLeft") jump(Math.max(0, t - step), 4000);
        else if (e.key === "Home") jump(0, 4000);
        else if (e.key === "End") jump(0.9999, 4000);
        else return;
        e.preventDefault();
      }, { signal });
    }

    // phone: scene chips and stat cards jump the reel
    chips.forEach((c, i) => c.addEventListener("click", () => {
      jump(SC[i].s + 0.005, 4000);
      c.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
    }, { signal }));
    stats.forEach((m) => m.addEventListener("click", () => jump(+m.dataset.at / 100, 4000), { signal }));

    if (play) {
      play.addEventListener("click", () => {
        paused = !paused;
        play.classList.toggle("off", paused);
        play.setAttribute("aria-label", paused ? "Play the reel" : "Pause the reel");
        if (!paused) last = performance.now();
      }, { signal });
    }

    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
    };
  }, [rootRef]);
}
