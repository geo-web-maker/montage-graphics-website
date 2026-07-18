import { useState, useCallback } from "react";
import { login as loginRequest } from "../api/client";

const STORAGE_KEY = "montage_admin_token";

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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await loginRequest(username, password);
      sessionStorage.setItem(STORAGE_KEY, access_token);
      setToken(access_token);
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
    setToken(null);
  }, []);

  return { token, isAuthenticated: Boolean(token), login, logout, error, loading };
}
