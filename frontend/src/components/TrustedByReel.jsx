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
      <div className="reel-label">Trusted by</div>
      <div className="reel-viewport">
        <div className="reel-track">
          {items.map((client, i) => (
            <span key={`${client.id}-${i}`}>
              <img src={client.logo_url} alt={client.name} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
