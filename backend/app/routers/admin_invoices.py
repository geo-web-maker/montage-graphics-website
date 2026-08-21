from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_admin, require_role
from app.database import get_database
from app.schemas.invoice import InvoiceCreate, InvoiceListItem, InvoiceOut
from app.services import invoice_service

router = APIRouter(
    prefix="/admin/invoices",
    tags=["invoices (admin)"],
    dependencies=[Depends(require_role("superadmin", "admin", "invoice_admin"))],
)


@router.post("", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    admin_user: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    # get_current_admin now returns the full admin_users doc, not a bare
    # username — audit log actor uses email since that's the unique,
    # human-readable identifier admins log in with.
    return await invoice_service.create_invoice(db, payload, created_by=admin_user["email"])


@router.get("", response_model=list[InvoiceListItem])
async def list_invoices(db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.invoices.find().sort("created_at", -1)
    return await cursor.to_list(length=200)


@router.get("/{public_id}", response_model=InvoiceOut)
async def get_invoice(public_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    invoice = await db.invoices.find_one({"public_id": public_id})
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.post("/{public_id}/void", response_model=InvoiceOut)
async def void_invoice(public_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Invoices are immutable once issued (no in-place edits to financial
    fields) — voiding just flags the record so the number stays used
    rather than silently reassigned. Create a fresh invoice for a
    correction."""
    invoice = await invoice_service.void_invoice(db, public_id)
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice
