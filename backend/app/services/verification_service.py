import hashlib
import hmac

from app.config import get_settings


def _canonical_payload(invoice: dict) -> str:
    """A stable string representation of the fields that must not change
    silently. If any of these are edited after issuance, the printed
    verification code on old copies stops matching the live one."""
    items_part = "|".join(
        f"{i['description']}:{i['quantity']}:{i['unit_price']}"
        for i in invoice["items"]
    )
    return "|".join(
        [
            invoice["public_id"],
            invoice["invoice_number"],
            str(invoice["total"]),
            str(invoice["date"]),
            items_part,
        ]
    )


def generate_verification_code(invoice: dict) -> str:
    """8-char code derived from an HMAC-SHA256 over the invoice's
    financial fields + a server-side secret. Printed on the PDF next to
    a QR code linking to /i/{public_id}, so anyone can cross-check a
    printed/forwarded copy against the live record."""
    settings = get_settings()
    # Domain-separated from the JWT signing key: same secret, different
    # purpose, so a leak of one doesn't automatically compromise the other.
    secret = hmac.new(settings.jwt_secret.encode(), b"invoice-verification", hashlib.sha256).digest()
    digest = hmac.new(secret, _canonical_payload(invoice).encode(), hashlib.sha256).hexdigest()
    return digest[:8].upper()


def verify_code(invoice: dict, code: str) -> bool:
    expected = generate_verification_code(invoice)
    return hmac.compare_digest(expected, code.upper())
