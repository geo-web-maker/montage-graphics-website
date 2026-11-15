import { useState, useCallback } from "react";
import { login as loginRequest } from "../api/client";

const STORAGE_KEY = "montage_admin_token";
const ROLE_KEY = "montage_admin_role";
const MUST_CHANGE_KEY = "montage_admin_must_change_password";

function readStoredMustChange() {
  try {
    return sessionStorage.getItem(MUST_CHANGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Reads a role if the login response already includes one (phase 2 backend).
// Today's login response has none, so this stays null and Dashboard falls
// back to showing every implemented section — no behavior change yet.
function readStoredRole() {
  try {
    return sessionStorage.getItem(ROLE_KEY);
  } catch {
    return null;
  }
}

// Decodes the JWT payload client-side (no signature check — this is only
// for UI display, e.g. "(you)" in the admin list; the server independently
// verifies the token on every request).
function decodeUserId(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// sessionStorage (not localStorage) so the token clears when the tab closes —
// a reasonable default for a single-admin panel.
function readStoredToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // sessionStorage can throw in some privacy modes
  }
}

export default function useAdminAuth() {
  const [token, setToken] = useState(readStoredToken);
  const [role, setRole] = useState(readStoredRole);
  const [mustChangePassword, setMustChangePassword] = useState(readStoredMustChange);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token, role: nextRole, must_change_password } = await loginRequest(username, password);
      sessionStorage.setItem(STORAGE_KEY, access_token);
      if (nextRole) sessionStorage.setItem(ROLE_KEY, nextRole);
      sessionStorage.setItem(MUST_CHANGE_KEY, String(Boolean(must_change_password)));
      setToken(access_token);
      setRole(nextRole || null);
      setMustChangePassword(Boolean(must_change_password));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(MUST_CHANGE_KEY);
    setToken(null);
    setRole(null);
    setMustChangePassword(false);
  }, []);

  // Called once the forced first-sign-in password change succeeds.
  const clearMustChangePassword = useCallback(() => {
    sessionStorage.setItem(MUST_CHANGE_KEY, "false");
    setMustChangePassword(false);
  }, []);

  const userId = token ? decodeUserId(token) : null;

  return {
    token,
    role,
    userId,
    isAuthenticated: Boolean(token),
    mustChangePassword,
    clearMustChangePassword,
    login,
    logout,
    error,
    loading,
  };
}
