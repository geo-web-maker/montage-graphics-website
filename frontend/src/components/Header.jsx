import React from "react";

export default function Header() {
  return (
    <header>
      <div className="logo">
        <b>M</b>ONTAGE GRAPHICS
      </div>
      <nav>
        <a href="#work">Work</a>
        <a href="#skills">Skills</a>
        <a href="#platforms">Platforms</a>
        <a href="#contact">Contact</a>
      </nav>
      <button className="cta">Let's talk</button>
    </header>
  );
}
