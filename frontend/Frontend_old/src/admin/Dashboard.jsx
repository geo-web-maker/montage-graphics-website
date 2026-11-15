import React, { useEffect, useState } from "react";
import { getAllReviews, getClients, listAdmins, listInvoices } from "../api/client";
import AdminLayout from "./AdminLayout";
import ClientForm from "./ClientForm";
import WorkImageForm from "./WorkImageForm";
import ClientList from "./ClientList";
import ReviewsAdmin from "./ReviewsAdmin";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import AdminUserForm from "./AdminUserForm";
import AdminUsersList from "./AdminUsersList";
import { canManageAdmins, sectionsForRole } from "./data/roles";

// All sections that exist in the app today, gated by role below.
const IMPLEMENTED_SECTIONS = ["clients", "reviews", "invoices", "admins"];

export default function Dashboard({ token, role, userId, onLogout, onChangePassword }) {
  const [clients, setClients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("clients");

  const visibleSections = (sectionsForRole(role) || IMPLEMENTED_SECTIONS).filter((s) =>
    IMPLEMENTED_SECTIONS.includes(s)
  );
  const wantsAdmins = visibleSections.includes("admins");

  useEffect(() => {
    const calls = [getClients(), getAllReviews(token), listInvoices(token)];
    if (wantsAdmins) calls.push(listAdmins(token));

    Promise.all(calls)
      .then(([clientsData, reviewsData, invoicesData, adminsData]) => {
        setClients(clientsData);
        setReviews(reviewsData);
        setInvoices(invoicesData);
        if (adminsData) setAdmins(adminsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, wantsAdmins]);

  // If a role change (or the initial default) leaves the active tab
  // inaccessible, fall back to the first section that role can see.
  useEffect(() => {
    if (!visibleSections.includes(activeSection) && visibleSections.length) {
      setActiveSection(visibleSections[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <AdminLayout
      visibleSections={visibleSections}
      activeSection={activeSection}
      onNavigate={setActiveSection}
      onLogout={onLogout}
      onChangePassword={onChangePassword}
    >
      {error && <p className="admin-error">{error}</p>}

      {activeSection === "clients" && (
        <>
          <div className="admin-grid">
            <ClientForm token={token} onCreated={(c) => setClients((prev) => [...prev, c])} />
            <WorkImageForm
              token={token}
              clients={clients}
              onAdded={() => {
                /* work images aren't listed here — the public site pulls them
                   per-client when a work card is opened, so nothing to update */
              }}
            />
          </div>
          {loading ? (
            <p className="admin-empty">Loading...</p>
          ) : (
            <ClientList
              token={token}
              clients={clients}
              onDeleted={(id) => setClients((prev) => prev.filter((c) => c.id !== id))}
            />
          )}
        </>
      )}

      {activeSection === "reviews" &&
        (loading ? (
          <p className="admin-empty">Loading...</p>
        ) : (
          <ReviewsAdmin
            token={token}
            reviews={reviews}
            onCreated={(r) => setReviews((prev) => [...prev, r])}
            onDeleted={(id) => setReviews((prev) => prev.filter((r) => r.id !== id))}
          />
        ))}

      {activeSection === "invoices" && (
        <>
          <div className="admin-grid">
            <InvoiceForm token={token} onCreated={(inv) => setInvoices((prev) => [inv, ...prev])} />
          </div>
          {loading ? (
            <p className="admin-empty">Loading...</p>
          ) : (
            <InvoiceList
              token={token}
              invoices={invoices}
              onVoided={(updated) =>
                setInvoices((prev) =>
                  prev.map((inv) => (inv.public_id === updated.public_id ? updated : inv))
                )
              }
            />
          )}
        </>
      )}

      {activeSection === "admins" && (
        <>
          {canManageAdmins(role) && (
            <div className="admin-grid">
              <AdminUserForm token={token} onCreated={(a) => setAdmins((prev) => [...prev, a])} />
            </div>
          )}
          {loading ? (
            <p className="admin-empty">Loading...</p>
          ) : (
            <AdminUsersList
              token={token}
              role={role}
              currentUserId={userId}
              admins={admins}
              onDeleted={(id) => setAdmins((prev) => prev.filter((a) => a.id !== id))}
              onReset={(id, smsSent) => {
                if (!smsSent) alert("Reset done, but the SMS failed to send — share it another way.");
              }}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
