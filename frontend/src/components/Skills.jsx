import React from "react";
import { SKILLS, BRAND_ACCENT } from "../data";

// Drop real logo files into frontend/src/assets/skill-logos/ using these
// exact filenames and they'll be picked up automatically — no code changes
// needed. If a file for a given tool is missing, the colored initials
// badge below is shown instead, so nothing breaks in the meantime.
const LOGO_FILES = {
  Photoshop: "photoshop.svg",
  Illustrator: "illustrator.svg",
  "After Effects": "after-effects.svg",
  "Cinema 4D": "cinema-4d.svg",
  Figma: "figma.svg",
  Canva: "canva.svg",
  Blender: "blender.svg",
};

// Fallback badge (colored initials) shown until a real logo file exists,
// or if one fails to load.
const FALLBACK = {
  Photoshop: { bg: "linear-gradient(150deg,#1f5fd6,#00194f)", label: "Ps" },
  Illustrator: { bg: "linear-gradient(150deg,#ff9a3d,#7a3d00)", label: "Ai" },
  "After Effects": { bg: "linear-gradient(150deg,#8a5cff,#2a1063)", label: "Ae" },
  "Cinema 4D": { bg: "linear-gradient(150deg,#3a3f4a,#101216)", label: "C4" },
  Figma: { bg: "linear-gradient(150deg,#ff5fa8,#3d7fff)", label: "Fi" },
  Canva: { bg: "linear-gradient(150deg,#22c1c3,#0b5f60)", label: "Ca" },
  Blender: { bg: "linear-gradient(150deg,#f5792a,#8a3d00)", label: "Bl" },
};

// Vite's import.meta.glob pulls in whatever logo files actually exist in
// the folder at build time — eager+url so each entry is just a resolved
// file path, and nothing errors out if the folder is empty or a file for
// one tool hasn't been added yet.
const logoModules = import.meta.glob("../assets/skill-logos/*", {
  eager: true,
  query: "?url",
  import: "default",
});

function resolveLogoUrl(filename) {
  const match = Object.entries(logoModules).find(([path]) => path.endsWith(`/${filename}`));
  return match ? match[1] : null;
}

function SkillIcon({ name }) {
  const logoUrl = resolveLogoUrl(LOGO_FILES[name]);
  const fallback = FALLBACK[name] || { bg: "var(--panel-raised)", label: name[0] };

  if (logoUrl) {
    return (
      <div className="skill-icon skill-icon-logo">
        <img src={logoUrl} alt={`${name} logo`} />
      </div>
    );
  }

  return (
    <div className="skill-icon" style={{ background: fallback.bg }}>
      {fallback.label}
    </div>
  );
}

export default function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="skills-inner">
        <div className="skills-copy">
          <div className="label">Exhibit 04</div>
          <h2 className="section-title">
            Medium &amp; <b>Mastery</b>
          </h2>
          <p>
            Popular skills and experiences, where each project is an
            opportunity to combine creativity, technical precision, and
            strategic vision to achieve real digital results.
          </p>
        </div>

        <div className="skills-grid">
          {SKILLS.map((skill) => {
            const accent = BRAND_ACCENT[skill.name] || "61,127,255";
            return (
              <div
                className="skill-card"
                key={skill.name}
                style={{ "--accent": accent }}
              >
                <SkillIcon name={skill.name} />
                <div className="skill-card-name">{skill.name}</div>
                <div className="bar">
                  <span style={{ width: `${skill.pct}%` }} />
                </div>
                <div className="skill-card-pct">{skill.pct}% mastery</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
