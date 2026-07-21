import React, { useState } from "react";
import { createReview, deleteReview } from "../api/client";

export default function ReviewsAdmin({ token, reviews, onCreated, onDeleted }) {
  const [quote, setQuote] = useState("");
  const [who, setWho] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const review = await createReview(token, {
        quote,
        who,
        role,
        display_order: reviews.length,
      });
      onCreated(review);
      setQuote("");
      setWho("");
      setRole("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this review?")) return;
    setBusyId(id);
    try {
      await deleteReview(token, id);
      onDeleted(id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-card">
      <h2>Add client review</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Quote</label>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} required />
        </div>
        <div className="admin-field">
          <label>Name</label>
          <input value={who} onChange={(e) => setWho(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Role (optional, e.g. "Restaurant owner")</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        {error && <p className="admin-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Add review"}
        </button>
      </form>

      {reviews.length > 0 && (
        <div className="admin-review-list">
          {reviews.map((r) => (
            <div className="admin-review-row" key={r.id}>
              <div className="admin-review-text">
                <p>&#8220;{r.quote}&#8221;</p>
                <span>
                  {r.who}
                  {r.role ? ` — ${r.role}` : ""}
                </span>
              </div>
              <button
                className="btn-danger"
                onClick={() => handleDelete(r.id)}
                disabled={busyId === r.id}
              >
                {busyId === r.id ? "..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
