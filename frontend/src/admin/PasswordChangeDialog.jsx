import React, { useState } from "react";
import { changePassword } from "../api/client";

const MIN_LENGTH = 8;

// Same form drives two contexts:
// - "forced": full-screen, non-dismissible — shown when must_change_password
//   is true (new admin, or after a superadmin-triggered reset). Styled like
//   Login.jsx since it's the same pre-dashboard moment.
// - "voluntary": dismissible overlay, opened from "Change password" in the
//   sidebar/mobile-menu footer next to Log out.
export default function PasswordChangeDialog({ token, mode = "voluntary", onDone, onCancel }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword(token, oldPassword, newPassword);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const form = (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label>{mode === "forced" ? "Temporary password" : "Current password"}</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="admin-field">
        <label>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={MIN_LENGTH}
          required
        />
      </div>
      <div className="admin-field">
        <label>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={MIN_LENGTH}
          required
        />
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-invoice-actions">
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Updating..." : "Update password"}
        </button>
        {mode === "voluntary" && (
          <button className="btn-ghost" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  if (mode === "forced") {
        <div className="admin-login-wrap">
          <div className="admin-login-card admin-enter">
            <div className="eyebrow">Montage Graphics</div>
            <h1 className="display">Set a new password</h1>
            <p className="admin-empty">This is your first sign-in — set a permanent password to continue.</p>
            {form}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell admin-modal-overlay" onClick={onCancel}>
      <div className="admin-card admin-modal admin-enter" onClick={(e) => e.stopPropagation()}>
        <h2>Change password</h2>
        {form}
      </div>
    </div>
  );
}
