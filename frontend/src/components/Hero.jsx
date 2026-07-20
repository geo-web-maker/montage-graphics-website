import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">Graphic &amp; Motion Designer</div>
        <h1 className="display">
          Brands that <span>move</span> people.
        </h1>
        <p>
          Montage Graphics designs flyers, social kits, brand identities and
          the motion that makes them travel — for businesses who want to
          look like a global brand, not a local shop.
        </p>
        <div className="btns">
          <button className="cta">Let's talk</button>
          <a className="ghost-link" href="#work">
            View work
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="portrait" style={{backgroundImage: 'url(/hero.jpeg)', backgroundSize: 'cover'}} />
        <div className="orbit">
          <div className="orbit-item sf1">
            <div className="stat-float">
              <b>5</b>Years experience
            </div>
          </div>
          <div className="orbit-item sf2">
            <div className="stat-float">
              <b>200</b>Projects shipped
            </div>
          </div>
          <div className="orbit-item sf3">
            <div className="stat-float">
              <b>90%</b>Client satisfaction
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
