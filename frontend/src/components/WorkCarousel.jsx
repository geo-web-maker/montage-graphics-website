import React, { useState, useEffect } from "react";
import { getClients } from "../api/client";

export default function WorkCarousel({ onCardOpen }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) => console.error(err));
  }, []);

  const items = [...clients, ...clients];

  return (
    <section className="work" id="work">
      <div className="work-head">
        <h2>Recent work</h2>
        <span className="hint">
          Auto-scrolling — tap a card to see everything for that client
        </span>
      </div>
      <div className="wc-viewport">
        <div className="wc-track">
          {items.map((card, i) => (
            <div
              className="wc-card"
              tabIndex={0}
              key={`${card.id}-${i}`}
              style={{
                background: `linear-gradient(160deg, ${card.logo_dominant_color}55, #141518 75%)`,
              }}
              onClick={(e) => onCardOpen(e, card.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCardOpen(e, card.slug);
              }}
            >
              <img className="wc-logo" src={card.logo_url} alt={card.name} />
              <span className="wc-label">{card.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
