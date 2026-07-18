import React, { useEffect, useState } from "react";
import { getClients } from "../api/client";
import ClientForm from "./ClientForm";
import WorkImageForm from "./WorkImageForm";
import ClientList from "./ClientList";

export default function Dashboard({ token, onLogout }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <b>M</b>ONTAGE GRAPHICS <span>— Admin</span>
        </div>
        <button className="btn-ghost" onClick={onLogout}>
          Log out
        </button>
      </header>

      <main className="admin-main">
        {error && <p className="admin-error">{error}</p>}

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

        <div className="admin-section-label">Clients</div>
        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : (
          <ClientList
            token={token}
            clients={clients}
            onDeleted={(id) => setClients((prev) => prev.filter((c) => c.id !== id))}
          />
        )}
      </main>
    </div>
  );
}
