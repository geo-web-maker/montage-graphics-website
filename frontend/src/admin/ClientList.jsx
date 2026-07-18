import React, { useState } from "react";
import { deleteClient, deleteWorkImage, getClientWork } from "../api/client";

export default function ClientList({ token, clients, onDeleted }) {
  const [openId, setOpenId] = useState(null);
  // clientId -> "loading" | array of work images | { error }
  const [workByClient, setWorkByClient] = useState({});
  const [busyClientId, setBusyClientId] = useState(null);
  const [busyImageId, setBusyImageId] = useState(null);

  async function toggle(client) {
    if (openId === client.id) {
      setOpenId(null);
      return;
    }
    setOpenId(client.id);
    // Only fetch the first time a client is opened — cached after that.
    if (!workByClient[client.id]) {
      setWorkByClient((prev) => ({ ...prev, [client.id]: "loading" }));
      try {
        const work = await getClientWork(client.slug);
        setWorkByClient((prev) => ({ ...prev, [client.id]: work }));
      } catch (err) {
        setWorkByClient((prev) => ({ ...prev, [client.id]: { error: err.message } }));
      }
    }
  }

  async function handleDeleteClient(id) {
    if (!confirm("Delete this client and all their work images?")) return;
    setBusyClientId(id);
    try {
      await deleteClient(token, id);
      onDeleted(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyClientId(null);
    }
  }

  async function handleDeleteImage(clientId, imageId) {
    if (!confirm("Delete this work image?")) return;
    setBusyImageId(imageId);
    try {
      await deleteWorkImage(token, imageId);
      setWorkByClient((prev) => ({
        ...prev,
        [clientId]: prev[clientId].filter((img) => img.id !== imageId),
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyImageId(null);
    }
  }

  if (clients.length === 0) {
    return <p className="admin-empty">No clients yet — add one above.</p>;
  }

  return (
    <div className="admin-client-list">
      {clients.map((c) => {
        const isOpen = openId === c.id;
        const work = workByClient[c.id];

        return (
          <div className={`admin-client-row${isOpen ? " open" : ""}`} key={c.id}>
            <button className="admin-client-header" onClick={() => toggle(c)}>
              <img src={c.logo_url} alt={c.name} />
              <span className="admin-client-name">{c.name}</span>
              <span className="admin-client-slug">{c.slug}</span>
              <span className="admin-chevron">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="admin-client-body">
                {work === "loading" && <p className="admin-empty">Loading work...</p>}
                {work?.error && <p className="admin-error">{work.error}</p>}
                {Array.isArray(work) && work.length === 0 && (
                  <p className="admin-empty">No work images yet for this client.</p>
                )}
                {Array.isArray(work) && work.length > 0 && (
                  <div className="admin-work-grid">
                    {work.map((img) => (
                      <div className="admin-work-tile" key={img.id}>
                        <img src={img.image_url} alt={img.caption || c.name} />
                        {img.caption && (
                          <span className="admin-work-caption">{img.caption}</span>
                        )}
                        <button
                          className="btn-danger admin-work-delete"
                          onClick={() => handleDeleteImage(c.id, img.id)}
                          disabled={busyImageId === img.id}
                        >
                          {busyImageId === img.id ? "..." : "Delete"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn-danger"
                  onClick={() => handleDeleteClient(c.id)}
                  disabled={busyClientId === c.id}
                >
                  {busyClientId === c.id ? "Deleting..." : "Delete client"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
