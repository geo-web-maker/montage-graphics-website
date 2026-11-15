import React, { useState } from "react";
import { addWorkImage } from "../api/client";
import { uploadToCloudinary } from "./uploadToCloudinary";

// One entry per selected file, tracked independently so a single failure
// doesn't block the rest of the batch and the admin can see exactly which
// files succeeded/failed.
function makeQueueItem(file) {
  return { id: `${file.name}-${file.lastModified}-${file.size}`, file, status: "pending", error: null };
}

export default function WorkImageForm({ token, clients, onAdded }) {
  const [clientId, setClientId] = useState("");
  const [caption, setCaption] = useState("");
  const [queue, setQueue] = useState([]); // [{ id, file, status, error }]
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function handleFilesChosen(e) {
    const files = Array.from(e.target.files || []);
    setQueue(files.map(makeQueueItem));
    setError(null);
  }

  function updateItem(id, patch) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientId || queue.length === 0) {
      setError("Pick a client and at least one image first");
      return;
    }
    setBusy(true);
    setError(null);

    // Sequential, not parallel: Cloudinary signatures are timestamp-based
    // and the admin API is a single shared session, so this keeps things
    // predictable and makes per-file progress easy to show. For a handful
    // to a few dozen images this is plenty fast.
    for (const item of queue) {
      if (item.status === "done") continue; // allow retrying a partial batch
      updateItem(item.id, { status: "uploading", error: null });
      try {
        const { url, width, height } = await uploadToCloudinary(token, item.file);
        const workImage = await addWorkImage(token, clientId, {
          image_url: url,
          caption,
          width,
          height,
        });
        updateItem(item.id, { status: "done" });
        onAdded(workImage);
      } catch (err) {
        updateItem(item.id, { status: "error", error: err.message });
      }
    }

    setBusy(false);
  }

  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const allDone = queue.length > 0 && doneCount === queue.length;

  function handleReset() {
    setQueue([]);
    setCaption("");
  }

  return (
    <div className="admin-card">
      <h2>Add work images</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label>Client</label>
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
        </div>
        <div className="admin-field">
          <label>Caption (optional, applied to all selected images)</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Images (select multiple)</label>
          <input type="file" accept="image/*" multiple onChange={handleFilesChosen} required />
        </div>

        {queue.length > 0 && (
          <ul className="admin-upload-queue">
            {queue.map((item) => (
              <li key={item.id} className={`admin-upload-item status-${item.status}`}>
                <span className="admin-upload-name">{item.file.name}</span>
                <span className="admin-upload-status">
                  {item.status === "pending" && "Waiting"}
                  {item.status === "uploading" && "Uploading..."}
                  {item.status === "done" && "✓ Done"}
                  {item.status === "error" && (item.error || "Failed")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-actions">
          <button className="btn-primary" type="submit" disabled={busy || queue.length === 0}>
            {busy
              ? `Uploading ${doneCount + 1}/${queue.length}...`
              : queue.length > 0
                ? `Upload ${queue.length} image${queue.length > 1 ? "s" : ""}`
                : "Upload"}
          </button>
          {queue.length > 0 && !busy && (
            <button type="button" className="btn-ghost" onClick={handleReset}>
              Clear
            </button>
          )}
        </div>

        {allDone && <p className="admin-upload-summary">All {doneCount} images uploaded.</p>}
        {!busy && errorCount > 0 && (
          <p className="admin-error">
            {errorCount} image{errorCount > 1 ? "s" : ""} failed — fix and resubmit to retry just
            those.
          </p>
        )}
      </form>
    </div>
  );
}
