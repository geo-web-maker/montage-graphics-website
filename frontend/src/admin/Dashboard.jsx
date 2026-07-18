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
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Montage Graphics — Admin</h1>
        <button onClick={onLogout}>Log out</button>
      </header>

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

      <h2>Clients</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ClientList
          token={token}
          clients={clients}
          onDeleted={(id) => setClients((prev) => prev.filter((c) => c.id !== id))}
        />
      )}
    </div>
  );
}
