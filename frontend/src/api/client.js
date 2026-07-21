// Thin wrapper around fetch(). Every function throws on a non-2xx response
// so callers can just try/catch instead of checking res.ok everywhere.

const BASE_URL = import.meta.env.VITE_API_URL;

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
    // FastAPI error bodies look like { "detail": "..." }
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Request failed: ${res.status}`);
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

export function login(username, password) {
  return request("/auth/login", { method: "POST", body: { username, password } });
}

// ---- Admin: clients ----

export function createClient(token, payload) {
  return request("/admin/clients", { method: "POST", body: payload, token });
}

export function updateClient(token, clientId, payload) {
  return request(`/admin/clients/${clientId}`, { method: "PATCH", body: payload, token });
}

export function deleteClient(token, clientId) {
  return request(`/admin/clients/${clientId}`, { method: "DELETE", token });
}

// ---- Admin: work images ----

export function addWorkImage(token, clientId, payload) {
  return request(`/admin/clients/${clientId}/work`, { method: "POST", body: payload, token });
}

export function deleteWorkImage(token, workImageId) {
  return request(`/admin/work/${workImageId}`, { method: "DELETE", token });
}

// ---- Admin: reviews ----

export function getAllReviews(token) {
  return request("/admin/reviews", { token });
}

export function createReview(token, payload) {
  return request("/admin/reviews", { method: "POST", body: payload, token });
}

export function updateReview(token, reviewId, payload) {
  return request(`/admin/reviews/${reviewId}`, { method: "PATCH", body: payload, token });
}

export function deleteReview(token, reviewId) {
  return request(`/admin/reviews/${reviewId}`, { method: "DELETE", token });
}

// ---- Admin: upload ----

export function getUploadSignature(token, { forLogo = false } = {}) {
  return request(`/admin/upload-signature?for_logo=${forLogo}`, { token });
}
