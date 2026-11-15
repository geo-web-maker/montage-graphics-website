import React, { useEffect, useState } from "react";
import { getAllReviews, listAdminClients, listAdmins, listInvoices } from "../api/client";
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
import ModuleWorkspace from "./ModuleWorkspace";
import { adminRequest } from "../api/client";

// All sections that exist in the app today, gated by role below.
const IMPLEMENTED_SECTIONS = ["dashboard", "clients", "reviews", "site", "skills", "media", "invoices", "receipts", "agreements", "mail", "admins", "settings"];

export default function Dashboard({ token, role, userId, onLogout, onChangePassword }) {
  const [clients, setClients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [moduleFlags, setModuleFlags] = useState(null);

  useEffect(() => { adminRequest("/admin/dashboard", token).then((d) => setModuleFlags(d.modules || {})).catch(() => setModuleFlags({})); }, [token]);
  const visibleSections = (sectionsForRole(role) || IMPLEMENTED_SECTIONS).filter((s) => {
    if (!IMPLEMENTED_SECTIONS.includes(s)) return false;
    if (["invoices", "receipts", "agreements", "mail", "reviews", "site", "skills", "media"].includes(s) && moduleFlags && moduleFlags[s] === false) return false;
    return true;
  });
  useEffect(() => { if (visibleSections.length && !visibleSections.includes(activeSection)) setActiveSection(visibleSections[0]); }, [role, moduleFlags]);
  const wantsAdmins = visibleSections.includes("admins");

  useEffect(() => {
    const jobs = [listAdminClients(token).then(setClients)];
    if (moduleFlags?.reviews !== false) jobs.push(getAllReviews(token).then(setReviews));
    if (moduleFlags?.invoices !== false) jobs.push(listInvoices(token).then(setInvoices));
    if (wantsAdmins) jobs.push(listAdmins(token).then(setAdmins));
    Promise.allSettled(jobs).then((results) => {
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length) setError(failures.map((r) => r.reason?.message).join("; "));
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, wantsAdmins, moduleFlags]);

  // If a role change (or the initial default) leaves the active tab
  // inaccessible, fall back to the first section that role can see.
  useEffect(() => {
    if (!visibleSections.includes(activeSection) && visibleSections.length) {
      setActiveSection(visibleSections[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, moduleFlags]);

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
              onUpdated={(updated) => setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
              onReordered={(ordered) => setClients(ordered)}
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
            onModerated={() => getAllReviews(token).then(setReviews).catch((err) => setError(err.message))}
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
                setInvoices((prev) => prev.map((inv) => (inv.public_id === updated.public_id ? updated : inv)))
              }
              onReceiptCreated={() => listInvoices(token).then(setInvoices).catch((err) => setError(err.message))}
            />
          )}
        </>
      )}

      {["dashboard", "site", "skills", "media", "receipts", "agreements", "mail", "settings"].includes(activeSection) && (
        <ModuleWorkspace section={activeSection} token={token} role={role} />
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
