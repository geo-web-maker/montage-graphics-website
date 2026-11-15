import React, { useEffect, useState } from "react";
import { getReviews, submitReview } from "../api/client";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ who: "", role: "", quote: "" });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => setLoaded(true));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await submitReview(form);
      setForm({ who: "", role: "", quote: "" });
      setNotice("Thank you. Your review has been submitted for moderation.");
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <section id="reviews">
      <div className="wrap">
        <div className="sec-head reveal">
          <div><span className="mono"><b>Sequence 06</b> — Client feedback</span><h2>Notes from <em>the edit</em></h2></div>
        </div>
        <div className="rev">
          {reviews.map((r, i) => (
            <div className="card reveal" style={{ "--d": `${(i % 3) * 100}ms` }} key={r.id}>
              <q>{r.quote}</q>
              <div className="mono"><b>{r.who}</b>{r.role}</div>
            </div>
          ))}
          {loaded && !reviews.length && <p className="review-empty">Be the first to share your experience.</p>}
        </div>
        <form className="review-submit reveal" onSubmit={submit}>
          <h3>Share your experience</h3>
          <label>Your name<input required minLength={2} maxLength={160} value={form.who} onChange={set("who")} /></label>
          <label>Role or company (optional)<input maxLength={160} value={form.role} onChange={set("role")} /></label>
          <label>Your review<textarea required minLength={12} maxLength={3000} rows={4} value={form.quote} onChange={set("quote")} /></label>
          <button type="submit" className="btn" disabled={busy}>{busy ? "Submitting…" : <>Submit review<i className="ar">→</i></>}</button>
          {notice && <p role="status">{notice}</p>}
        </form>
      </div>
    </section>
  );
}
