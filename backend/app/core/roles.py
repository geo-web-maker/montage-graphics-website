"""Server-side source of truth for role -> section access. Mirrors SACHI's
app/models/common.py pattern. Keep in sync by hand with
frontend/src/admin/data/roles.js (that copy is UI-only; this one is what's
actually enforced).

"admins" access is deliberately split: everyone in ROLES who has "admins"
can GET the list, but only "superadmin" can create/delete/reset — that's
enforced in the admin_users router itself (require_superadmin on those
three routes), not by this map. This map only answers "can this role see
the section at all".
"""

ROLES: dict[str, list[str]] = {
    "superadmin": ["clients", "reviews", "invoices", "admins"],
    "admin": ["clients", "reviews", "invoices", "admins"],
    "invoice_admin": ["invoices"],
}

ROLE_LABELS: dict[str, str] = {
    "superadmin": "Super Admin",
    "admin": "Admin",
    "invoice_admin": "Invoice Admin",
}


def role_has_section(role: str, section: str) -> bool:
    return section in ROLES.get(role, [])
