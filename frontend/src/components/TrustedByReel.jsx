import React, { useEffect, useState } from "react";
import { getClients } from "../api/client";

export default function TrustedByReel() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) => console.error("Failed to load clients:", err));
  }, []);

  // Duplicated once so the CSS marquee (translateX -50%) loops seamlessly —
  // same trick as before, just applied to fetched data instead of REEL_ITEMS.
  const items = [...clients, ...clients];

  return (
    <div className="reel">
      <div className="reel-label">
        <span className="coord">COL 01–12 / CREDENTIALS</span>
        <span className="label">Trusted by</span>
      </div>
      <div className="reel-viewport">
        <div className="reel-track">
          {items.map((client, i) => (
            <React.Fragment key={`${client.id}-${i}`}>
              <span className="name">{client.name}</span>
              <span className="dot">◆</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
