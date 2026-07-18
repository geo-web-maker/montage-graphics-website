import React, { useState } from "react";
import { createClient } from "../api/client";
import { uploadToCloudinary } from "./uploadToCloudinary";

export default function ClientForm({ token, onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Pick a logo image first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { url, dominantColor } = await uploadToCloudinary(token, file, { forLogo: true });
      const client = await createClient(token, {
        name,
        slug,
        logo_url: url,
        logo_dominant_color: dominantColor || "#1B1D22",
      });
      onCreated(client);
      setName("");
      setSlug("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card">
      <h2>Add client</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Slug (used in the URL, e.g. "broach")</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        {error && <p className="admin-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Uploading..." : "Add client"}
        </button>
      </form>
    </div>
  );
}
