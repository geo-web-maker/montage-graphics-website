import React from "react";
import { CONTACT } from "../data";

export default function Footer({ content = null }) {
  const email = content?.email || CONTACT.email;
  return (
    <footer className="credits">
      <div className="wrap">
        <span className="mono">Fade out</span>
        <h2>Let&rsquo;s make <em>something move.</em></h2>
        <div className="btns">
          <a className="btn" href={`mailto:${email}`}>{email}<i className="ar">→</i></a>
          <a className="btn ghost" href="#top"><i className="ar">↑</i>Back to start</a>
        </div>
        <div className="foot mono">
          <span>Copyright © {new Date().getFullYear()} Montage Graphics</span>
          <span>Kampala, Uganda</span>
        </div>
      </div>
    </footer>
  );
}
