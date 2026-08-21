import React, { useState } from "react";
import { deleteAdmin, resetAdminPassword } from "../api/client";
import { canManageAdmins, ROLE_LABELS } from "./data/roles";

export default function AdminUsersList({ token, role, currentUserId, admins, onDeleted, onReset }) {
  const [busyId, setBusyId] = useState(null);
  const manage = canManageAdmins(role);

  async function handleReset(admin) {
    if (!confirm(`Send ${admin.name} a new temp password by SMS?`)) return;
    setBusyId(admin.id);
    try {
      const result = await resetAdminPassword(token, admin.id);
      onReset(admin.id, result.sms_sent);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(admin) {
    if (!confirm(`Remove ${admin.name}'s admin access? This can't be undone.`)) return;
    setBusyId(admin.id);
    try {
      await deleteAdmin(token, admin.id);
      onDeleted(admin.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!admins.length) {
    return <p className="admin-empty">No admins yet.</p>;
  }

  return (
    <div className="admin-review-list">
      {admins.map((a) => (
        <div className="admin-review-row" key={a.id}>
          <div className="admin-review-text">
            <p>
              {a.name}
              {a.id === currentUserId ? " (you)" : ""}
            </p>
            <span>
              {a.email} — {ROLE_LABELS[a.role] || a.role}
              {a.must_change_password ? " — pending first sign-in" : ""}
            </span>
          </div>
          {manage && (
            <div className="admin-invoice-actions">
              <button className="btn-ghost" onClick={() => handleReset(a)} disabled={busyId === a.id}>
                {busyId === a.id ? "..." : "Reset password"}
              </button>
              {a.id !== currentUserId && (
                <button className="btn-danger" onClick={() => handleDelete(a)} disabled={busyId === a.id}>
                  {busyId === a.id ? "..." : "Remove"}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
