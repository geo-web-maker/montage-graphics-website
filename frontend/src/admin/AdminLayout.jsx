import React, { useState } from "react";

// Built from mockup-a2-archive-sidebar.html (Archive Room, sidebar concept).
// Desktop: fixed dark sidebar with "Col. 0N" coordinate-labeled nav.
// Mobile: dark topbar + horizontal scrollable tab strip (sidebar has no
// room to collapse to, so it's swapped out rather than hidden behind a
// hamburger-only menu, matching what was approved).
//
// ALL_SECTIONS order also drives the "Col. 0N" numbering — index + 1.
const ALL_SECTIONS = [
  { id: "clients", label: "Clients" },
  { id: "reviews", label: "Reviews" },
  { id: "invoices", label: "Invoices" },
  { id: "admins", label: "Admins" },
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
  const sections = ALL_SECTIONS.filter((s) => visibleSections.includes(s.id));
  const activeMeta = ALL_SECTIONS.find((s) => s.id === activeSection);
  const activeIndex = ALL_SECTIONS.findIndex((s) => s.id === activeSection);

  function go(id) {
    onNavigate(id);
    setMobileOpen(false);
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
            <button className="admin-hamburger" onClick={() => setMobileOpen((v) => !v)}>
              ≡
            </button>
          </div>
          {mobileOpen && (
            <div className="admin-mobile-menu">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href="#"
                  className={s.id === activeSection ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    go(s.id);
                  }}
                >
                  {s.label}
                </a>
              ))}
              <button className="btn-ghost" onClick={onChangePassword}>
                Change password
              </button>
              <button className="btn-ghost" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}
          <div className="admin-mobile-tabs">
            {sections.map((s) => (
              <a
                key={s.id}
                href="#"
                className={s.id === activeSection ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  go(s.id);
                }}
              >
                {s.label}
              </a>
            ))}
          </div>

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
