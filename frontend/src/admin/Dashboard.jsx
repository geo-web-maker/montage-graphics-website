import React, { useEffect, useState } from "react";
import { getAllReviews, getClients } from "../api/client";
import ClientForm from "./ClientForm";
import WorkImageForm from "./WorkImageForm";
import ClientList from "./ClientList";
import ReviewsAdmin from "./ReviewsAdmin";

export default function Dashboard({ token, onLogout }) {
  const [clients, setClients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getClients(), getAllReviews(token)])
      .then(([clientsData, reviewsData]) => {
        setClients(clientsData);
        setReviews(reviewsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

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

        <div className="admin-section-label">Reviews</div>
        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : (
          <ReviewsAdmin
            token={token}
            reviews={reviews}
            onCreated={(r) => setReviews((prev) => [...prev, r])}
            onDeleted={(id) => setReviews((prev) => prev.filter((r) => r.id !== id))}
          />
        )}
      </main>
    </div>
  );
}
