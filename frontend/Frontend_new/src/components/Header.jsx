import React, { useEffect, useState } from "react";

const LINKS = [
  ["#work", "Work"],
  ["#about", "About"],
  ["#skills", "Skills"],
  ["#contact", "Contact"],
];
const BASE = import.meta.env.BASE_URL;

/**
 * A6 nav: fixed bar that turns solid on scroll, links + timecode on desktop, hamburger + slide-in
 * drawer at <=900px. The REC dot colour and timecode are updated by useEditBay (via the --acc
 * variable on .montage-root and the data-bay="tc" node), not by React state.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth > 900) setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div
        className={`nav-drawer${open ? " open" : ""}`}
        id="navDrawer"
        aria-label="Site navigation"
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
      >
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className="drawer-link" onClick={close} tabIndex={open ? 0 : -1}>{label}</a>
        ))}
        <div className="tc" style={{ marginTop: 32 }}>
          <a className="btn" href="#contact" onClick={close} tabIndex={open ? 0 : -1}>Let&rsquo;s talk<i className="ar">→</i></a>
        </div>
      </div>

      <header className={`nav${solid ? " solid" : ""}${open ? " menu-open" : ""}`} id="nav">
        <a className="logo" href="#top" aria-label="Montage Graphics" onClick={close}>
          <img src={`${BASE}logo.png`} alt="Montage Graphics" />
        </a>
        <ul>
          {LINKS.map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <div className="tc">
          <i className="rec" aria-hidden="true" />
          <span className="mono" data-bay="tc" aria-hidden="true">00:00:00:00</span>
          <a className="btn" href="#contact">Let&rsquo;s talk<i className="ar">→</i></a>
        </div>
        <button
          type="button"
          className={`nav-toggle${open ? " open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="navDrawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </header>
    </>
  );
}
