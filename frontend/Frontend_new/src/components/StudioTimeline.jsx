import React from "react";
import { SC, GHOST, LOOP, STAT_AT, DEFAULT_STATS } from "../editBay";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Static markup only. useEditBay (called once in MontagePage) owns all the motion: playhead,
 * scene highlight, scrubbing, timecode. Desktop shows the five-lane bay; <=900px shows scene
 * chips + a progress bar + stat cards instead.
 */
export default function StudioTimeline({ stats = null }) {
  const items = (stats?.length ? stats : DEFAULT_STATS).slice(0, 3);
  const ticks = [0, 5, 10, 15, 20];
  return (
    <div className="tl" aria-label="Studio timeline">
      <div className="tl-box">
        <div className="tl-top">
          <button type="button" className="play" aria-label="Pause the reel"><span /></button>
          <span className="tcb" data-bay="tc">00:00:00:00</span>
          <span className="mono" style={{ color: "var(--dim)" }} data-bay="scn">01 · {SC[0].n}</span>
          <span className="mono grow hintx" style={{ color: "var(--faint)" }}>Drag the timeline to scrub</span>
        </div>

        <div className="tl-m">
          <div className="chips">
            {SC.map((s, i) => (
              <button type="button" className="chip" style={{ "--c": s.c }} key={s.n} data-i={i}><i />{s.n}</button>
            ))}
          </div>
          <div className="prog"><b /><u /></div>
          <div className="stats">
            {items.map((x, i) => (
              <button type="button" className="st" data-at={STAT_AT[i]} key={`${x.label}-${i}`}>
                <b>{x.value}</b><span>{x.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tl-body">
          <div className="labs" aria-hidden="true">
            <div className="mono" />
            {SC.map((s, i) => <div className="mono" key={s.n}>V{5 - i} {s.trk}</div>)}
          </div>
          <div
            className="lanes"
            role="slider"
            tabIndex={0}
            aria-label="Scrub the studio timeline"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div className="lane ruler">
              {ticks.map((x, i) => (
                <span
                  className="sec"
                  key={x}
                  style={{ left: `${(x / LOOP) * 100}%`, ...(i === 4 ? { transform: "translateX(-120%)" } : null) }}
                >
                  {pad(0)}:{pad(x)}
                </span>
              ))}
              {items.map((x, i) => (
                <div className="mk" style={{ left: `${STAT_AT[i]}%` }} data-at={STAT_AT[i]} key={`${x.label}-${i}`}>
                  <b>{x.value}</b><span className="mono">{x.label}</span>
                </div>
              ))}
            </div>
            {SC.map((s, i) => {
              const g = GHOST[i];
              return (
                <div className="lane" style={{ "--c": s.c }} key={s.n}>
                  <div className="seg ghost" style={{ left: `${g[0] * 100}%`, width: `${(g[1] - g[0]) * 100}%` }} />
                  <div className="seg" data-i={i} style={{ left: `${s.s * 100}%`, width: `${(s.e - s.s) * 100}%` }}>{s.n}</div>
                </div>
              );
            })}
            <div className="head" />
          </div>
        </div>
      </div>
    </div>
  );
}
