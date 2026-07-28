import React from "react";
import SplitFlapWord from "./SplitFlapWord";

export default function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Graphic &amp; Motion Designer, Kampala</div>
          <h1 className="display">
            Brands that <SplitFlapWord /> people.
          </h1>
          <p>
            Montage Graphics designs flyers, social kits, brand identities and
            the motion that makes them travel — for businesses who want to
            look like a global brand, not a local shop.
          </p>
          <div className="btns">
            <button className="cta solid">Let's talk</button>
            <a className="ghost-link" href="#work">
              View the collection
            </a>
          </div>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat">
          <b>200</b>
          <span>Projects shipped</span>
        </div>
        <div className="stat">
          <b>5</b>
          <span>Years experience</span>
        </div>
        <div className="stat">
          <b>90%</b>
          <span>Client satisfaction</span>
        </div>
      </div>
    </>
  );
}
