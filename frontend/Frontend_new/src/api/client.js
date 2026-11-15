// Thin wrapper around fetch(). Every function throws on a non-2xx response
// so callers can just try/catch instead of checking res.ok everywhere.

const BASE_URL = (import.meta.env.VITE_API_URL || "/montage").replace(/\/$/, "");

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // FastAPI error bodies look like { "detail": "..." } for HTTPException,
    // but { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
    // for 422 Pydantic validation errors — normalize both to a string.
    const body = await res.json().catch(() => null);
    let message = `Request failed: ${res.status}`;
    if (typeof body?.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body?.detail)) {
      message = body.detail.map((e) => e.msg).join("; ");
    }
    throw new Error(message);
  }

  // 204 No Content has no body to parse
  if (res.status === 204) return null;
  return res.json();
}

// ---- Public ----

export function getClients() {
  return request("/clients");
}

export function getClientWork(slug) {
  return request(`/clients/${slug}/work`);
}

export function getReviews() {
  return request("/reviews");
}

// ---- Auth ----

export function getSiteContent() { return request("/site-content"); }

export function getSkills() { return request("/skills"); }

export function submitReview(payload) { return request("/reviews/submit", { method: "POST", body: payload }); }
