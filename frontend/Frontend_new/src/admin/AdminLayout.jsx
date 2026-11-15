import React, { useState } from "react";

// Built from mockup-a2-archive-sidebar.html (Archive Room, sidebar concept).
// Desktop: fixed dark sidebar with "Col. 0N" coordinate-labeled nav.
// Mobile: dark topbar + horizontal scrollable tab strip (sidebar has no
// room to collapse to, so it's swapped out rather than hidden behind a
// hamburger-only menu, matching what was approved). The hamburger button
// only opens account actions (change password / log out) — section
// navigation lives solely in the tab strip below it, so the two never
// duplicate the same list.
//
// ALL_SECTIONS order also drives the "Col. 0N" numbering — index + 1.
const ALL_SECTIONS = [
  { id: "dashboard", label: "Dashboard" }, { id: "clients", label: "Clients" },
  { id: "reviews", label: "Reviews" }, { id: "site", label: "Site content" }, { id: "skills", label: "Skills" },
  { id: "media", label: "Media" }, { id: "invoices", label: "Invoices" },
  { id: "receipts", label: "Receipts" }, { id: "agreements", label: "Agreements" },
  { id: "mail", label: "Mail" }, { id: "admins", label: "Admins" },
  { id: "settings", label: "Settings" },
];

function coord(index) {
  return String(index + 1).padStart(2, "0");
}

export default function AdminLayout({
  visibleSections,
  activeSection,
  onNavigate,
  onLogout,
  onChangePassword,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const sections = ALL_SECTIONS.filter((s) => visibleSections.includes(s.id));
  const activeMeta = ALL_SECTIONS.find((s) => s.id === activeSection);
  const activeIndex = ALL_SECTIONS.findIndex((s) => s.id === activeSection);
  const primaryIds = ["dashboard", "clients", "invoices", "mail"];
  const primarySections = primaryIds.map((id) => sections.find((s) => s.id === id)).filter(Boolean);
  const moreSections = sections.filter((s) => !primaryIds.includes(s.id));

  function go(id) {
    onNavigate(id);
    setMobileOpen(false);
    setMoreOpen(false);
  }

  return (
    <div className="admin-shell">
      <div className="admin-archive-frame">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-mark">
            <b>Montage Graphics</b>
            <span>Admin</span>
          </div>
          <nav className="admin-sidebar-nav">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href="#"
                className={s.id === activeSection ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  go(s.id);
                }}
              >
                <span className="coord">{coord(ALL_SECTIONS.findIndex((x) => x.id === s.id))}</span>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="admin-sidebar-foot">
            <button className="btn-ghost" onClick={onChangePassword}>
              Change password
            </button>
            <button className="btn-ghost" onClick={onLogout}>
              Log out
            </button>
          </div>
        </aside>

        <div className="admin-content">
          <div className="admin-mobile-topbar">
            <span className="brand">
              <b>Montage</b> Admin
            </span>
            <button className="admin-hamburger" aria-label="Account menu" onClick={() => setMobileOpen((v) => !v)}>
              ≡
            </button>
          </div>
          {mobileOpen && (
            <div className="admin-mobile-menu">
              <button className="btn-ghost" onClick={onChangePassword}>
                Change password
              </button>
              <button className="btn-ghost" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}
          <div className="admin-mobile-tabs">
            {primarySections.map((s) => (
              <a key={s.id} href="#" className={s.id === activeSection ? "active" : ""} onClick={(e) => { e.preventDefault(); go(s.id); }}>{s.label}</a>
            ))}
            {moreSections.length > 0 && <button className={moreSections.some((s) => s.id === activeSection) ? "active" : ""} onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}>More</button>}
          </div>
          {moreOpen && <div className="admin-more-menu">{moreSections.map((s) => <button key={s.id} className={s.id===activeSection?"active":""} onClick={()=>go(s.id)}>{s.label}</button>)}</div>}

          <main className="admin-main admin-enter">
            <div className="admin-content-header">
              <div>
                <span className="eyebrow">Col. {coord(activeIndex)}</span>
                <h1>{activeMeta?.label}</h1>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
