import React from "react";
import { CONTACT } from "../data";

export default function About() {
  return (
    <section className="about" id="contact">
      <div className="about-copy">
        <div className="eyebrow">About me</div>
        <h2 className="section-title">
          Professional solutions for <b>design challenges.</b>
        </h2>
        <p>
          Graphic and motion designer delivering strategic visual work that
          connects, persuades and converts. Every project pairs a clear
          brief with a measurable result — not just a finished file.
        </p>
        <div className="contact-card">
          <div className="contact-row">
            <span className="dot" />
            <b>Email</b>
            {CONTACT.email}
          </div>
          <div className="contact-row">
            <span className="dot" />
            <b>Whatsapp</b>
            {CONTACT.whatsapp}
          </div>
        </div>
      </div>
      <div className="about-visual">
        <div className="frame" style={{backgroundImage: 'url(/about.png)', backgroundSize: 'cover'}}/>
        <div className="chips">
          <div className="chip">Photoshop</div>
          <div className="chip">Illustrator</div>
          <div className="chip">After Effects</div>
          <div className="chip">Cinema 4D</div>
          <div className="chip">Figma</div>
        </div>
      </div>
    </section>
  );
}
