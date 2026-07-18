import React,{useState, useEffect} from "react";
import { getClients } from "../api/client";

export default function WorkCarousel({ onCardOpen }) {
  const[client, setClient] = useState([]);

  useEffect(()=> {
    getClients()
    .then(setClient)
    .catch((err)=>console.error(err))},[])

  const items = [...client,...client ];
  
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
              key={'${card.id}-${i}'}
              onClick={(e) => onCardOpen(e, card.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCardOpen(e, card.slug);
              }}
            >
              <span className="wc-label">{card.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
