import React, { useState } from "react";
import Turnstile, { turnstileEnabled } from "./Turnstile";

export default function Login({ onSubmit, error, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(email, password, token);
    setResetKey((k) => k + 1); // tokens are single-use
  }

  return (
    <div className="admin-shell">
      <div className="admin-login-wrap">
        <div className="admin-login-card admin-enter">
          <div className="eyebrow">Montage Graphics</div>
          <h1 className="display">Admin sign in</h1>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="admin-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Turnstile onToken={setToken} resetKey={resetKey} theme="light" />
            {error && <p className="admin-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading || (turnstileEnabled && !token)}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
