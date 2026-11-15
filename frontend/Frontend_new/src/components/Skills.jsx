import React, { useRef } from "react";
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

function Layer({ skill, index }) {
  const logo = skill.logo_url || resolveLogoUrl(LOGO_FILES[skill.name]);
  const abbr = skill.abbr || ABBR[skill.name] || skill.name.slice(0, 2);
  const pct = Math.max(0, Math.min(100, Number(skill.pct) || 0));
  const c = toRgb(skill.accent_rgb || BRAND_ACCENT[skill.name]);
  return (
    <div className="layer" style={{ "--c": c }}>
      <div className="who">
        {logo ? (
          <span className="ico"><img src={logo} alt="" /></span>
        ) : (
          <span className="ico fb" aria-hidden="true">{abbr}</span>
        )}
        <div>
          <b>{skill.name}</b>
          <small className={skill.motion ? "mo" : ""}>{skill.motion ? "● Motion" : "Still"}</small>
        </div>
      </div>
      <div className="track">
        <div className="clip" style={{ "--w": `${pct}%`, "--d": `${index * 90}ms` }}>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Skills({ skills = null }) {
  const list = skills?.length ? skills : SKILLS;
  const stack = useRef(null);
  const scrub = useRef(null);

  // amber scrub line follows the pointer over the track area (hover devices only)
  const onPointerMove = (e) => {
    if (e.pointerType === "touch") return;
    const el = stack.current;
    const line = scrub.current;
    if (!el || !line) return;
    const r = el.getBoundingClientRect();
    const label = el.querySelector(".who")?.offsetWidth || 0; // real label-column width at any breakpoint
    const x = Math.max(0, Math.min(r.width - label - 1, e.clientX - r.left - label));
    line.style.setProperty("--x", `${x}px`);
  };

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
        <div className="stack reveal" ref={stack} onPointerMove={onPointerMove}>
          <div className="stack-ruler">
            <div className="mono">Layers</div>
            <div className="ruler-scale mono"><span>0</span><span>25</span><span>50</span><span>75</span><span>100% mastery</span></div>
          </div>
          <div>
            {list.map((skill, i) => <Layer skill={skill} index={i} key={skill.name} />)}
          </div>
          <div className="scrub" ref={scrub} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
