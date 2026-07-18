import React from "react";
import "./admin.css";
import useAdminAuth from "./useAdminAuth";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function AdminApp() {
  const { token, isAuthenticated, login, logout, error, loading } = useAdminAuth();

  if (!isAuthenticated) {
    return <Login onSubmit={login} error={error} loading={loading} />;
  }

  return <Dashboard token={token} onLogout={logout} />;
}
