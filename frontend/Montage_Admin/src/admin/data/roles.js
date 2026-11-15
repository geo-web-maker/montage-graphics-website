// UI-only mirror of the backend's role -> sections map (app/core/roles.py).
// This just decides what renders in the sidebar. It is NOT access control —
// that's enforced server-side, same split SACHI uses (see require_role()).
//
// This UI map mirrors the server-side map; it is never an authorization boundary.
export const SECTIONS_BY_ROLE = {
  superadmin: ["dashboard", "clients", "reviews", "site", "skills", "media", "invoices", "receipts", "agreements", "mail", "admins", "settings"],
  admin: ["dashboard", "clients", "reviews", "site", "skills", "media", "invoices", "receipts", "agreements", "mail", "admins"],
  invoice_admin: ["dashboard", "invoices", "receipts", "mail"],
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
