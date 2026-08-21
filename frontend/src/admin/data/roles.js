// UI-only mirror of the backend's role -> sections map (app/core/roles.py).
// This just decides what renders in the sidebar. It is NOT access control —
// that's enforced server-side, same split SACHI uses (see require_role()).
//
// Until the DB-backed admin/role backend lands, useAdminAuth's `role` is
// null — SECTIONS_BY_ROLE isn't consulted in that case and every section
// shows, so the app keeps working unchanged in the meantime.
export const SECTIONS_BY_ROLE = {
  superadmin: ["clients", "reviews", "invoices", "admins"],
  admin: ["clients", "reviews", "invoices", "admins"], // "admins" renders read-only for this role
  invoice_admin: ["invoices"],
};

export function sectionsForRole(role) {
  if (!role) return null; // null = "show everything" (pre-RBAC fallback)
  return SECTIONS_BY_ROLE[role] || [];
}

export function canManageAdmins(role) {
  return role === "superadmin";
}

export const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Admin",
  invoice_admin: "Invoice Admin",
};
