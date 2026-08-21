import React, { useState } from "react";
import { changePassword } from "../api/client";

const MIN_LENGTH = 8;

// A small hand-drawn-feeling padlock that pops in on mount — the same
// "quiet settle-in" language as admin-enter, just with a touch more life
// since this is the one screen every admin sees on their very first visit.
function PasswordIcon({ unlocked }) {
  return (
    <div className="admin-password-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4.5" y="11" width="15" height="10" rx="1.5" />
        <path
          d={unlocked ? "M8 11V7a4 4 0 0 1 7.2-2.4" : "M8 11V7a4 4 0 0 1 8 0v4"}
          style={{ transition: "d 0.35s ease" }}
        />
      </svg>
    </div>
  );
}

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
  const [shakeTick, setShakeTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  function fail(message) {
    setError(message);
    setShakeTick((n) => n + 1); // remounts .admin-shake below so it replays every time
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      fail("New passwords don't match");
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      fail(`New password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword(token, oldPassword, newPassword);
      setSuccess(true);
      // Let the checkmark actually land before we swap screens.
      setTimeout(onDone, 650);
    } catch (err) {
      setBusy(false);
      fail(err.message);
    }
  }

  const form = (
    <form className="admin-form admin-password-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label>{mode === "forced" ? "Temporary password" : "Current password"}</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoFocus
          required
          disabled={success}
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
          disabled={success}
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
          disabled={success}
        />
      </div>

      {error && (
        <p className="admin-error" key={shakeTick}>
          {error}
        </p>
      )}

      {success ? (
        <p className="admin-password-success">
          <svg className="admin-check-pop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
          Password updated
        </p>
      ) : (
        <div className="admin-invoice-actions" key={`actions-${shakeTick}`}>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Updating..." : "Update password"}
          </button>
          {mode === "voluntary" && (
            <button className="btn-ghost" type="button" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );

  if (mode === "forced") {
    return (
      <div className="admin-shell">
        <div className="admin-login-wrap">
          <div className="admin-login-card admin-enter">
            <PasswordIcon unlocked={success} />
            <div className="eyebrow">Montage Graphics</div>
            <h1 className="display">Set a new password</h1>
            <p className="admin-empty admin-empty-inline">
              This is your first sign-in — set a permanent password to continue.
            </p>
            {form}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell admin-modal-overlay" onClick={success ? undefined : onCancel}>
      <div className="admin-card admin-modal admin-enter" onClick={(e) => e.stopPropagation()}>
        <PasswordIcon unlocked={success} />
        <h2>Change password</h2>
        {form}
      </div>
    </div>
  );
}
