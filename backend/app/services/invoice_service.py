import secrets
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.invoice import InvoiceCreate
from app.services.verification_service import generate_verification_code


async def _next_invoice_number(db: AsyncIOMotorDatabase) -> str:
    """Atomic counter so invoice numbers can't collide under concurrent
    requests, and gaps (from voided invoices) stay explainable rather
    than silently reused."""
    year = datetime.now(timezone.utc).year
    counter_id = f"invoice-{year}"
    result = await db.counters.find_one_and_update(
        {"_id": counter_id},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = result["seq"]
    return f"MG-INV-{year}-{seq:03d}"


def _compute_totals(payload: InvoiceCreate) -> tuple[float, float, float]:
    subtotal = round(sum(item.quantity * item.unit_price for item in payload.items), 2)
    tax = round(subtotal * payload.tax_rate, 2)
    total = round(subtotal + tax, 2)
    return subtotal, tax, total


async def create_invoice(
    db: AsyncIOMotorDatabase, payload: InvoiceCreate, created_by: str
) -> dict:
    subtotal, tax, total = _compute_totals(payload)
    invoice_number = await _next_invoice_number(db)
    public_id = secrets.token_urlsafe(16)

    doc = {
        "public_id": public_id,
        "invoice_number": invoice_number,
        "client_name": payload.client_name,
        "date": payload.date.isoformat(),
        "due_date": payload.due_date.isoformat(),
        "items": [item.model_dump() for item in payload.items],
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "balance": total,
        "accounting_manager": payload.accounting_manager,
        "contact_phone": payload.contact_phone,
        "contact_email": payload.contact_email,
        "payment_method": payload.payment_method,
        "payment_number": payload.payment_number,
        "payment_name": payload.payment_name,
        "notes": payload.notes,
        "voided": False,
        "created_by": created_by,
        "created_at": datetime.now(timezone.utc),
    }
    doc["verification_code"] = generate_verification_code(doc)

    result = await db.invoices.insert_one(doc)
    created = await db.invoices.find_one({"_id": result.inserted_id})
    return created


async def void_invoice(db: AsyncIOMotorDatabase, public_id: str) -> dict | None:
    """Invoices are immutable once issued — financial fields are never
    edited in place. Voiding just flags the record; the invoice number
    stays used (not deleted or reassigned) so numbering stays provably
    sequential."""
    await db.invoices.update_one({"public_id": public_id}, {"$set": {"voided": True}})
    return await db.invoices.find_one({"public_id": public_id})
