import React, { useState } from "react";
import "./admin.css";
import useAdminAuth from "./useAdminAuth";
import Login from "./Login";
import Dashboard from "./Dashboard";
import PasswordChangeDialog from "./PasswordChangeDialog";

export default function AdminApp() {
  const {
    token,
    role,
    userId,
    isAuthenticated,
    mustChangePassword,
    clearMustChangePassword,
    login,
    logout,
    error,
    loading,
  } = useAdminAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  if (!isAuthenticated) {
    return <Login onSubmit={login} error={error} loading={loading} />;
  }

  // Blocks the dashboard entirely until a forced reset is cleared — mirrors
  // the backend's require_password_current gate, which 403s every other
  // route until this same /auth/change-password call succeeds.
  if (mustChangePassword) {
    return <PasswordChangeDialog token={token} mode="forced" onDone={clearMustChangePassword} />;
  }

  return (
    <>
      <Dashboard
        token={token}
        role={role}
        userId={userId}
        onLogout={logout}
        onChangePassword={() => setShowPasswordDialog(true)}
      />
      {showPasswordDialog && (
        <PasswordChangeDialog
          token={token}
          mode="voluntary"
          onCancel={() => setShowPasswordDialog(false)}
          onDone={() => setShowPasswordDialog(false)}
        />
      )}
    </>
  );
}
