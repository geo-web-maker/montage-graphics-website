import React from "react";
import { SKILLS } from "../data";

export default function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="work-head">
        <h2>Skills &amp; expertise</h2>
      </div>
      {SKILLS.map((skill) => (
        <div className="skill-row" key={skill.name}>
          <div className="skill-name">{skill.name}</div>
          <div className="skill-track">
            <div
              className={`skill-fill${skill.motion ? " motion" : ""}`}
              style={{ width: `${skill.pct}%` }}
            />
          </div>
          <div className="skill-pct">{skill.pct}%</div>
        </div>
      ))}
    </section>
  );
}
