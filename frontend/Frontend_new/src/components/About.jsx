import React from "react";
import { CONTACT } from "../data";

const BASE = import.meta.env.BASE_URL;
const FALLBACK_ABOUT =
  "Graphic and motion designer delivering strategic visual work that connects, persuades and converts. Every project pairs a clear brief with a measurable result, not just a finished file.";

function numbers(content) {
  const raw = content?.whatsapp?.length ? content.whatsapp : CONTACT.whatsapp.split(/[/·]/);
  return raw.map((s) => s.trim()).filter(Boolean);
}

export default function About({ content = null }) {
  const email = content?.email || CONTACT.email;
  const nums = numbers(content);
  return (
    <section id="about" style={{ paddingTop: 0 }}>
      <div className="wrap about">
        <div className="reveal">
          <span className="mono"><b>Sequence 03</b> — Director&rsquo;s note</span>
          <h2 style={{ fontSize: "clamp(40px,5.6vw,84px)" }}>Professional solutions for <em>design challenges.</em></h2>
          <p>{content?.about || FALLBACK_ABOUT}</p>
          <div className="slate" id="contact">
            <div className="slate-top" />
            <dl>
              <dt className="mono">Scene</dt><dd>Your brand</dd>
              <dt className="mono">Email</dt><dd><a href={`mailto:${email}`}>{email}</a></dd>
              <dt className="mono">WhatsApp</dt>
              <dd>
                {nums.map((num, i) => (
                  <React.Fragment key={num}>
                    {i > 0 && " / "}
                    <a href={`https://wa.me/${num.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{num}</a>
                  </React.Fragment>
                ))}
              </dd>
            </dl>
          </div>
        </div>
        <div className="shot reveal" style={{ "--d": "120ms" }}>
          <img src={content?.about_image_url || `${BASE}about-adjusted.webp`} alt="The designer at a dual-monitor desk" loading="lazy" />
          <span className="mono">The cutting room</span><span className="mono r">Kampala · Night shift</span>
        </div>
      </div>
    </section>
  );
}
