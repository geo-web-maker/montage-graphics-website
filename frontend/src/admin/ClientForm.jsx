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
      const logo_url = await uploadToCloudinary(token, file);
      const client = await createClient(token, { name, slug, logo_url });
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
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Add client</h2>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Slug (used in the URL, e.g. "broach")
        <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </label>
      <label>
        Logo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? "Uploading..." : "Add client"}
      </button>
    </form>
  );
}
