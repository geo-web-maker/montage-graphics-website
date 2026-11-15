import React from "react";
import SplitFlapWord from "./SplitFlapWord";
import { MONITOR_HTML } from "../editBay";

const BASE = import.meta.env.BASE_URL;
// Static, trusted markup from the A6 mockup; the edit-bay engine animates it by class/CSS var.
// Module-level object: its identity must stay stable, because some React versions re-assign
// innerHTML whenever the dangerouslySetInnerHTML object changes, which would wipe the nodes the
// edit-bay engine is animating.
const MONITOR = { __html: MONITOR_HTML.replace("__LOGO__", `${BASE}logo.png`) };

export default function Hero({ content = null }) {
  const words = content?.hero_words;
  return (
    <div className="hero">
      <div className="hero-copy">
        <div className="eyebrow mono"><i />Graphic &amp; Motion Designer — Kampala</div>
        <h1 aria-label={`Brands that ${words?.[0] || "move"} people.`}>
          <span className="line"><span>Brands that</span></span>
          <span className="line"><span><SplitFlapWord words={words} /></span></span>
          <span className="line"><span>people.</span></span>
        </h1>
        <p className="lede">
          Montage Graphics designs flyers, social kits, brand identities and the motion that makes
          them travel, for businesses who want to look like a global brand, not a local shop.
        </p>
        <div className="btns">
          <a className="btn" href="#contact">Let&rsquo;s talk<i className="ar">→</i></a>
          <a className="btn ghost" href="#work"><i className="ar">▶</i>View the collection</a>
        </div>
      </div>
      <div
        className="mon"
        role="img"
        aria-label="A program monitor playing short samples of flyer, social kit, identity and motion work"
        dangerouslySetInnerHTML={MONITOR}
      />
    </div>
  );
}
