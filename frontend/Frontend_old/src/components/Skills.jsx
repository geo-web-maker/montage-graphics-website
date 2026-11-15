import React from "react";
import { SKILLS, BRAND_ACCENT } from "../data";

// Drop real logo files into src/assets/skill-logos/ with these names and they are picked up
// at build time. A tool without a file gets the initials tile.
const LOGO_FILES = {
  Photoshop: "photoshop.svg",
  Illustrator: "illustrator.svg",
  "After Effects": "after-effects.svg",
  "Cinema 4D": "cinema-4d.svg",
  Figma: "figma.svg",
  Canva: "canva.svg",
  Blender: "blender.svg",
};
const ABBR = { Photoshop: "Ps", Illustrator: "Ai", "After Effects": "Ae", "Cinema 4D": "C4", Figma: "Fi", Canva: "Ca", Blender: "Bl" };

const logoModules = import.meta.glob("../assets/skill-logos/*", { eager: true, query: "?url", import: "default" });
const resolveLogoUrl = (filename) => {
  const hit = Object.entries(logoModules).find(([path]) => path.endsWith(`/${filename}`));
  return hit ? hit[1] : null;
};

function toRgb(raw) {
  if (!raw) return "61,127,255";
  return raw.startsWith("#") ? [1, 3, 5].map((i) => parseInt(raw.slice(i, i + 2), 16)).join(",") : raw;
}

const clampPct = (v) => Math.max(0, Math.min(100, Number(v) || 0));

function Card({ skill, index }) {
  const logo = skill.logo_url || resolveLogoUrl(LOGO_FILES[skill.name]);
  const abbr = skill.abbr || ABBR[skill.name] || skill.name.slice(0, 2);
  const pct = clampPct(skill.pct);
  const c = toRgb(skill.accent_rgb || BRAND_ACCENT[skill.name]);
  return (
    <li className="reveal" style={{ "--d": `${index * 90}ms` }}>
      <article className="sk-card" tabIndex={0} style={{ "--c": c, "--w": `${pct}%`, "--d": `${index * 90}ms` }}>
        <div className="sk-meta mono">
          <span>Trk {String(index + 1).padStart(2, "0")}</span>
          <span className={skill.motion ? "mo" : ""}>{skill.motion ? "● Motion" : "Still"}</span>
        </div>
        <div className="sk-ico" aria-hidden="true">{logo ? <img src={logo} alt="" /> : abbr}</div>
        <h3>{skill.name}</h3>
        <div className="sk-meter" role="img" aria-label={`${skill.name}: ${pct}% mastery`}>
          <i />
          <b>{pct}%</b>
        </div>
      </article>
    </li>
  );
}

export default function Skills({ skills = null }) {
  const list = skills?.length ? skills : SKILLS;

  return (
    <section id="skills" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="stack-copy reveal">
          <div><span className="mono"><b>Sequence 04</b> — The toolkit</span><h2>Medium &amp; <em>Mastery</em></h2></div>
          <p>
            Popular skills and experiences, where each project is an opportunity to combine
            creativity, technical precision and strategic vision to achieve real digital results.
          </p>
        </div>
        <ul className="sk-grid">
          {list.map((skill, i) => <Card skill={skill} index={i} key={skill.name} />)}
        </ul>
      </div>
    </section>
  );
}
