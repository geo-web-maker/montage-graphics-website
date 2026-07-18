import React, { useState } from "react";
import { addWorkImage } from "../api/client";
import { uploadToCloudinary } from "./uploadToCloudinary";

export default function WorkImageForm({ token, clients, onAdded }) {
  const [clientId, setClientId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientId || !file) {
      setError("Pick a client and an image first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const image_url = await uploadToCloudinary(token, file);
      const workImage = await addWorkImage(token, clientId, { image_url, caption });
      onAdded(workImage);
      setCaption("");
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
      <h2>Add work image</h2>
      <label>
        Client
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Caption (optional)
        <input value={caption} onChange={(e) => setCaption(e.target.value)} />
      </label>
      <label>
        Image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? "Uploading..." : "Add image"}
      </button>
    </form>
  );
}
