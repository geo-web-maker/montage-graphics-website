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

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: { email, password } });
}

export function changePassword(token, oldPassword, newPassword) {
  return request("/auth/change-password", {
    method: "POST",
    token,
    body: { old_password: oldPassword, new_password: newPassword },
  });
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

// ---- Admin: invoices ----

export function createInvoice(token, payload) {
  return request("/admin/invoices", { method: "POST", body: payload, token });
}

export function listInvoices(token) {
  return request("/admin/invoices", { token });
}

export function voidInvoice(token, publicId) {
  return request(`/admin/invoices/${publicId}/void`, { method: "POST", token });
}

// Public receipt/PDF links — served directly by the backend, not the SPA.
export function getInvoiceViewUrl(publicId) {
  return `${BASE_URL}/i/${publicId}`;
}

export function getInvoicePdfUrl(publicId) {
  return `${BASE_URL}/i/${publicId}/pdf`;
}

// ---- Admin: admins (superadmin manages, admin views read-only) ----

export function listAdmins(token) {
  return request("/admin/admins", { token });
}

export function createAdmin(token, payload) {
  return request("/admin/admins", { method: "POST", body: payload, token });
}

export function resetAdminPassword(token, adminId) {
  return request(`/admin/admins/${adminId}/password`, { method: "PATCH", token });
}

export function deleteAdmin(token, adminId) {
  return request(`/admin/admins/${adminId}`, { method: "DELETE", token });
}
