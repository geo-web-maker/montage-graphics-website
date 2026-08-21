import React, { useState } from "react";
import { createAdmin } from "../api/client";

const ROLES = [
  { value: "invoice_admin", label: "Invoice Admin — invoices only" },
  { value: "admin", label: "Admin — everything except managing admins" },
  { value: "superadmin", label: "Super Admin — full access" },
];

export default function AdminUserForm({ token, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("invoice_admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lastSmsResult, setLastSmsResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLastSmsResult(null);
    try {
      const created = await createAdmin(token, { name, email, phone, role });
      onCreated(created);
      setLastSmsResult(created.sms_sent);
      setName("");
      setEmail("");
      setPhone("");
      setRole("invoice_admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card">
      <h2>Add admin</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Phone (temp password is texted here)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2567..." required />
        </div>
        <div className="admin-field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="admin-error">{error}</p>}
        {lastSmsResult === false && (
          <p className="admin-error">Admin created, but the SMS failed to send — share the reset link manually.</p>
        )}
        {lastSmsResult === true && <p className="admin-upload-summary">Admin created — temp password texted.</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create admin"}
        </button>
      </form>
    </div>
  );
}
