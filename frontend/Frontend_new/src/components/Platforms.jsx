import React from "react";
import { PLATFORMS } from "../data";

export default function Platforms({ platforms = null }) {
  const list = platforms?.length ? platforms : PLATFORMS;
  return (
    <section className="plat" id="platforms">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><span className="mono"><b>Sequence 05</b> — Where the work lives</span><h2>Digital <em>platforms</em></h2></div>
        </div>
        <div className="plat-row reveal" style={{ "--d": "80ms" }}>
          {list.map((p, i) => (
            <span key={i}>
              {p.boldSuffix ? <>{p.prefix}<b>{p.suffix}</b></> : <><b>{p.prefix}</b>{p.suffix}</>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
