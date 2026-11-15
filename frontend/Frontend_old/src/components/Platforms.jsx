import React from "react";
import { PLATFORMS } from "../data";

export default function Platforms() {
  return (
    <section className="platforms" id="platforms">
      <div className="work-head">
        <h2>Digital platforms</h2>
      </div>
      <div className="platform-row">
        {PLATFORMS.map((p, i) => (
          <span key={i}>
            {p.boldSuffix ? (
              <>
                {p.prefix}
                <b>{p.suffix}</b>
              </>
            ) : (
              <>
                <b>{p.prefix}</b>
                {p.suffix}
              </>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
