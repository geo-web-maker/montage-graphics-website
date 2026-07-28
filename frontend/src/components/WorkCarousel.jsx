import React, { useState } from "react";

export default function WorkCarousel({ clients, onCardOpen }) {
  const [touched, setTouched] = useState(false);

  const items = [...clients, ...clients];

  return (
    <div className="work" id="work">
      <div className="grid-guides">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} />
        ))}
      </div>
      <div className="work-inner">
        <div className="work-head reveal">
          <div>
            <div className="label" style={{ marginBottom: 14 }}>
              Exhibit 02
            </div>
            <h2>The Collection</h2>
          </div>
          <span className="hint">Tap a plate to open the full set</span>
        </div>
        <div
          className={`wc-viewport${touched ? " touched" : ""}`}
          onTouchStart={() => setTouched(true)}
          onTouchEnd={() => setTouched(false)}
        >
          <div className="wc-track">
            {items.map((card, i) => (
              <div
                className="wc-card reveal"
                data-reveal-delay={(i % 8) * 60}
                tabIndex={0}
                key={`${card.id}-${i}`}
                onClick={(e) => onCardOpen(e, card)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCardOpen(e, card);
                }}
              >
                <div
                  className="plate"
                  style={{
                    background: `color-mix(in srgb, ${card.logo_dominant_color} 45%, #141518)`,
                  }}
                >
                  <span className="coord">
                    COL {String(i * 3 + 1).padStart(2, "0")}–
                    {String(i * 3 + 3).padStart(2, "0")} / PLATE
                  </span>
                  <img className="wc-logo" src={card.logo_url} alt={card.name} />
                </div>
                <div className="wc-label">
                  <span>
                    <b>{card.name}</b>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="scroll-note desktop-only">Auto-scrolling — hover to pause</div>
        <div className="scroll-note mobile-only">Auto-scrolling — tap to pause</div>
      </div>
    </div>
  );
}
