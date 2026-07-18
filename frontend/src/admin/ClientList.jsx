import React, { useState } from "react";
import { deleteClient } from "../api/client";

export default function ClientList({ token, clients, onDeleted }) {
  const [busyId, setBusyId] = useState(null);

  async function handleDelete(id) {
    if (!confirm("Delete this client and all their work images?")) return;
    setBusyId(id);
    try {
      await deleteClient(token, id);
      onDeleted(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (clients.length === 0) {
    return <p className="admin-empty">No clients yet — add one above.</p>;
  }

  return (
    <ul className="admin-client-grid">
      {clients.map((c) => (
        <li key={c.id}>
          <img src={c.logo_url} alt={c.name} />
          <div className="admin-client-meta">
            <span className="admin-client-name">{c.name}</span>
            <span className="admin-client-slug">{c.slug}</span>
          </div>
          <button
            className="btn-danger"
            onClick={() => handleDelete(c.id)}
            disabled={busyId === c.id}
          >
            {busyId === c.id ? "Deleting..." : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}
